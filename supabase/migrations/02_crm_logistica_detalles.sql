-- =============================================
-- LUNA TEIA COSMÉTICOS — CRM + LOGÍSTICA MODULAR
-- Script: 02_crm_logistica_detalles.sql
-- Propósito: Crear las tablas transaccionales
--            (detalle de pedidos + kardex de
--            movimientos en campo) y sus RLS.
-- Dependencias: debe correr DESPUÉS de
--                01_crm_core.sql
--                y de products (e-commerce).
-- =============================================


-- =============================================
-- 1) ENUM: tipo_movimiento
-- =============================================
DO $$ BEGIN
  CREATE TYPE tipo_movimiento_inventario AS ENUM (
    'carga_dhl',
    'venta_entregada',
    'devolucion_cancelado',
    'ajuste_auditoria'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;


-- =============================================
-- 2) TABLA: pedido_items
-- =============================================
CREATE TABLE IF NOT EXISTS pedido_items (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  pedido_id             UUID NOT NULL REFERENCES pedidos_central(id) ON DELETE CASCADE,
  producto_id           TEXT NOT NULL REFERENCES products(id)          ON DELETE RESTRICT,

  cantidad              INTEGER NOT NULL CHECK (cantidad >= 1),
  precio_unitario       NUMERIC(10, 2) NOT NULL CHECK (precio_unitario >= 0),

  -- Comisión del repartidor (solo reparto_local)
  comision_repartidor   NUMERIC(10, 2) DEFAULT NULL CHECK (comision_repartidor >= 0),

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Un producto no puede repetirse 2 veces en el mismo pedido
CREATE UNIQUE INDEX IF NOT EXISTS uq_pedido_items_pedido_producto
  ON pedido_items(pedido_id, producto_id);

CREATE INDEX IF NOT EXISTS idx_pedido_items_pedido   ON pedido_items(pedido_id);
CREATE INDEX IF NOT EXISTS idx_pedido_items_producto ON pedido_items(producto_id);


-- =============================================
-- 3) TABLA: movimientos_inventario_campo
-- =============================================
CREATE TABLE IF NOT EXISTS movimientos_inventario_campo (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  repartidor_id    UUID NOT NULL REFERENCES repartidores(id) ON DELETE CASCADE,
  producto_id      TEXT NOT NULL REFERENCES products(id)     ON DELETE RESTRICT,

  cantidad         INTEGER NOT NULL CHECK (cantidad <> 0),
  tipo_movimiento  tipo_movimiento_inventario NOT NULL,
  motivo           TEXT DEFAULT NULL,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mov_inv_repartidor
  ON movimientos_inventario_campo(repartidor_id);
CREATE INDEX IF NOT EXISTS idx_mov_inv_producto
  ON movimientos_inventario_campo(producto_id);
CREATE INDEX IF NOT EXISTS idx_mov_inv_created_at
  ON movimientos_inventario_campo(created_at DESC);


-- =============================================
-- 4) TRIGGER: cálculo automático de comisión
-- =============================================
CREATE OR REPLACE FUNCTION trg_pedido_items_set_comision()
RETURNS TRIGGER AS $$
DECLARE
  v_tipo_entrega pedido_tipo_entrega;
BEGIN
  SELECT tipo_entrega
    INTO v_tipo_entrega
    FROM pedidos_central
   WHERE id = NEW.pedido_id;

  IF v_tipo_entrega = 'reparto_local' THEN
    NEW.comision_repartidor := ROUND( (NEW.precio_unitario * NEW.cantidad) * 0.30, 2 );
  ELSE
    NEW.comision_repartidor := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS pedido_items_set_comision ON pedido_items;
CREATE TRIGGER pedido_items_set_comision
  BEFORE INSERT ON pedido_items
  FOR EACH ROW EXECUTE FUNCTION trg_pedido_items_set_comision();


-- =============================================
-- 5) ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE pedido_items                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_inventario_campo   ENABLE ROW LEVEL SECURITY;


-- =============================================
-- 5.1) POLÍTICAS PARA EL ROL "Administrador"
-- =============================================

DROP POLICY IF EXISTS "admin_all_pedido_items" ON pedido_items;
CREATE POLICY "admin_all_pedido_items"
  ON pedido_items
  FOR ALL
  TO authenticated
  USING  ( (auth.jwt() ->> 'role') = 'Administrador' )
  WITH CHECK ( (auth.jwt() ->> 'role') = 'Administrador' );

DROP POLICY IF EXISTS "admin_all_movimientos_inventario" ON movimientos_inventario_campo;
CREATE POLICY "admin_all_movimientos_inventario"
  ON movimientos_inventario_campo
  FOR ALL
  TO authenticated
  USING  ( (auth.jwt() ->> 'role') = 'Administrador' )
  WITH CHECK ( (auth.jwt() ->> 'role') = 'Administrador' );


-- =============================================
-- 5.2) POLÍTICAS PARA EL ROL "Repartidor"
-- =============================================

-- pedido_items — SELECT (vía EXISTS sobre pedidos_central)
DROP POLICY IF EXISTS "repartidor_select_pedido_items" ON pedido_items;
CREATE POLICY "repartidor_select_pedido_items"
  ON pedido_items
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() ->> 'role') = 'Repartidor'
    AND EXISTS (
      SELECT 1
        FROM pedidos_central pc
       WHERE pc.id = pedido_items.pedido_id
         AND pc.repartidor_assigned_id::text = (auth.jwt() ->> 'repartidor_id')
    )
  );

-- movimientos_inventario_campo — SELECT
DROP POLICY IF EXISTS "repartidor_select_movimientos" ON movimientos_inventario_campo;
CREATE POLICY "repartidor_select_movimientos"
  ON movimientos_inventario_campo
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() ->> 'role') = 'Repartidor'
    AND repartidor_id::text = (auth.jwt() ->> 'repartidor_id')
  );


-- =============================================
-- 6) GRANTS
-- =============================================
GRANT SELECT, INSERT, UPDATE, DELETE ON pedido_items                 TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON movimientos_inventario_campo TO authenticated;


-- =============================================
-- 7) COMENTARIOS
-- =============================================
COMMENT ON TABLE  pedido_items                 IS 'Detalle (línea-producto) de cada pedido central.';
COMMENT ON TABLE  movimientos_inventario_campo IS 'Kardex auditable del stock cargado por cada repartidor.';

COMMENT ON COLUMN pedido_items.comision_repartidor
  IS 'Calculada automáticamente: 30% del subtotal si el pedido es reparto_local; NULL si es paquetería_nacional.';
COMMENT ON COLUMN movimientos_inventario_campo.cantidad
  IS 'Positivo = entrada de stock (carga/devolución). Negativo = salida (venta entregada/ajuste).';
COMMENT ON COLUMN movimientos_inventario_campo.tipo_movimiento
  IS 'carga_dhl | venta_entregada | devolucion_cancelado | ajuste_auditoria.';