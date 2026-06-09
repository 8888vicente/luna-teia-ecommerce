-- =============================================
-- LUNA TEIA COSMÉTICOS — CRM + LOGÍSTICA MODULAR
-- Script: 03_crm_automatizacion_inventario.sql
-- Propósito: Programar la lógica de negocio que
--            sincroniza el estatus de un pedido
--            con el inventario en campo del
--            repartidor, sin intervención manual.
--
-- Dependencias obligatorias:
--   01_crm_core.sql  (repartidores, inventario_campo,
--                     pedidos_central, enums)
--   02_crm_logistica_detalles.sql
--                     (pedido_items,
--                      movimientos_inventario_campo)
-- =============================================


-- =============================================
-- 1) FUNCIÓN PRINCIPAL
--    fn_crm_procesar_cambio_estatus_pedido
-- =============================================
CREATE OR REPLACE FUNCTION fn_crm_procesar_cambio_estatus_pedido()
RETURNS TRIGGER AS $$
DECLARE
  v_item              RECORD;
  v_stock_actual      INTEGER;
  v_lock_key          BIGINT;
BEGIN
  -- Guard 1: solo si el estatus realmente cambió
  IF NEW.estatus_pedido = OLD.estatus_pedido THEN
    RETURN NEW;
  END IF;

  -- Guard 2: el pedido debe tener repartidor asignado
  IF NEW.repartidor_assigned_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Lock transaccional por pedido (evita race conditions)
  v_lock_key := hashtext(NEW.id::text);
  PERFORM pg_advisory_xact_lock(v_lock_key);

  -- =========================================
  -- CASO A: 'entregado'
  -- =========================================
  IF NEW.estatus_pedido = 'entregado' THEN

    FOR v_item IN
      SELECT producto_id, cantidad
        FROM pedido_items
       WHERE pedido_id = NEW.id
    LOOP

      SELECT cantidad
        INTO v_stock_actual
        FROM inventario_campo
       WHERE repartidor_id = NEW.repartidor_assigned_id
         AND producto_id   = v_item.producto_id;

      -- VALIDACIÓN DE STOCK MÍNIMO
      IF v_stock_actual IS NULL OR v_stock_actual < v_item.cantidad THEN
        RAISE EXCEPTION
          'Stock insuficiente en campo para el producto % (repartidor %, pedido %). Disponible: %, requerido: %',
          v_item.producto_id,
          NEW.repartidor_assigned_id,
          NEW.id,
          COALESCE(v_stock_actual, 0),
          v_item.cantidad
          USING ERRCODE = 'check_violation';
      END IF;

      UPDATE inventario_campo
         SET cantidad = cantidad - v_item.cantidad,
             updated_at = NOW()
       WHERE repartidor_id = NEW.repartidor_assigned_id
         AND producto_id   = v_item.producto_id;

      INSERT INTO movimientos_inventario_campo (
        repartidor_id, producto_id, cantidad, tipo_movimiento, motivo
      ) VALUES (
        NEW.repartidor_assigned_id,
        v_item.producto_id,
        -v_item.cantidad,
        'venta_entregada',
        'Venta automática Pedido ID: ' || NEW.id::text
      );

    END LOOP;

  -- =========================================
  -- CASO B: 'cancelado' o 'ausente'
  -- =========================================
  ELSIF NEW.estatus_pedido IN ('cancelado', 'ausente') THEN

    FOR v_item IN
      SELECT producto_id, cantidad
        FROM pedido_items
       WHERE pedido_id = NEW.id
    LOOP

      -- Idempotencia: no duplicar devoluciones
      IF EXISTS (
        SELECT 1
          FROM movimientos_inventario_campo
         WHERE repartidor_id = NEW.repartidor_assigned_id
           AND producto_id   = v_item.producto_id
           AND motivo        = 'Devolución Pedido ID: ' || NEW.id::text
      ) THEN
        CONTINUE;
      END IF;

      INSERT INTO inventario_campo (
        repartidor_id, producto_id, cantidad
      ) VALUES (
        NEW.repartidor_assigned_id,
        v_item.producto_id,
        v_item.cantidad
      )
      ON CONFLICT (repartidor_id, producto_id)
      DO UPDATE SET
        cantidad   = inventario_campo.cantidad + EXCLUDED.cantidad,
        updated_at = NOW();

      INSERT INTO movimientos_inventario_campo (
        repartidor_id, producto_id, cantidad, tipo_movimiento, motivo
      ) VALUES (
        NEW.repartidor_assigned_id,
        v_item.producto_id,
        v_item.cantidad,
        'devolucion_cancelado',
        'Devolución Pedido ID: ' || NEW.id::text
      );

    END LOOP;

  END IF;

  RETURN NEW;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error procesando pedido %: % (%)',
      NEW.id, SQLERRM, SQLSTATE;
    RAISE;
END;
$$ LANGUAGE plpgsql;


-- =============================================
-- 2) TRIGGER: AFTER UPDATE en pedidos_central
-- =============================================
DROP TRIGGER IF EXISTS trg_crm_cambio_estatus_pedido ON pedidos_central;
CREATE TRIGGER trg_crm_cambio_estatus_pedido
  AFTER UPDATE OF estatus_pedido ON pedidos_central
  FOR EACH ROW
  EXECUTE FUNCTION fn_crm_procesar_cambio_estatus_pedido();


-- =============================================
-- 3) FUNCIÓN DE DIAGNÓSTICO
-- =============================================
CREATE OR REPLACE FUNCTION sp_crm_validar_stock_pedido(p_pedido_id UUID)
RETURNS TABLE (
  producto_id      TEXT,
  cantidad_requerida INTEGER,
  stock_disponible  INTEGER,
  faltante         INTEGER
) AS $$
BEGIN
  RETURN QUERY
    SELECT
      pi.producto_id,
      pi.cantidad::INTEGER                                      AS cantidad_requerida,
      COALESCE(ic.cantidad, 0)::INTEGER                         AS stock_disponible,
      GREATEST(pi.cantidad - COALESCE(ic.cantidad, 0), 0)::INTEGER AS faltante
    FROM pedido_items pi
    LEFT JOIN inventario_campo ic
      ON ic.producto_id = pi.producto_id
     AND ic.repartidor_id = (
        SELECT repartidor_assigned_id
          FROM pedidos_central
         WHERE id = p_pedido_id
     )
    WHERE pi.pedido_id = p_pedido_id;
END;
$$ LANGUAGE plpgsql STABLE;


-- =============================================
-- 4) GRANTS
-- =============================================
GRANT EXECUTE ON FUNCTION sp_crm_validar_stock_pedido(UUID) TO authenticated;


-- =============================================
-- 5) COMENTARIOS
-- =============================================
COMMENT ON FUNCTION fn_crm_procesar_cambio_estatus_pedido()
  IS 'Trigger AFTER UPDATE: ajusta inventario_campo y registra kardex cuando un pedido pasa a entregado/cancelado/ausente. Lock per-pedido para evitar race conditions.';
COMMENT ON FUNCTION sp_crm_validar_stock_pedido(UUID)
  IS 'Helper UI: devuelve stock disponible vs requerido por pedido. Llamable por admin/repartidor antes de marcar entregado.';
COMMENT ON TRIGGER trg_crm_cambio_estatus_pedido ON pedidos_central
  IS 'Dispara fn_crm_procesar_cambio_estatus_pedido SOLO cuando la columna estatus_pedido es actualizada.';