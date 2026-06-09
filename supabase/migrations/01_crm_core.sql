-- =============================================
-- LUNA TEIA COSMÉTICOS — CRM + LOGÍSTICA MODULAR
-- Script: 01_crm_core.sql
-- Propósito: Crear las tablas base del sistema de
--            repartidores, inventario en campo,
--            pedidos centralizados y políticas RLS.
-- Notas:
--  - Convive con el e-commerce existente (products, orders).
--  - La tabla 'products' del e-commerce usa id TEXT,
--    por lo que inventario_campo.producto_id es TEXT
--    para mantener la integridad referencial directa.
-- =============================================


-- =============================================
-- 1) EXTENSIÓN UUID (por si no se ha habilitado)
-- =============================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- =============================================
-- 2) ENUMS (tipos restringidos para Catálogos)
-- =============================================

-- Estatus del Repartidor (ciclo de vida)
DO $$ BEGIN
  CREATE TYPE repartidor_estatus AS ENUM (
    'postulado',
    'activo',
    'inactivo'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Canal de Origen de la venta
DO $$ BEGIN
  CREATE TYPE pedido_origen_venta AS ENUM (
    'facebook',
    'ecommerce',
    'kiosk'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Tipo de entrega logística
DO $$ BEGIN
  CREATE TYPE pedido_tipo_entrega AS ENUM (
    'reparto_local',
    'paqueteria_nacional'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Estatus del Pedido (pipeline de fulfillment)
DO $$ BEGIN
  CREATE TYPE pedido_estatus AS ENUM (
    'pendiente',
    'en_ruta',
    'entregado',
    'ausente',
    'cancelado'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;


-- =============================================
-- 3) TABLA: repartidores
-- =============================================
CREATE TABLE IF NOT EXISTS repartidores (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre        TEXT NOT NULL,
  telefono      TEXT NOT NULL,
  ciudad        TEXT NOT NULL CHECK (ciudad IN ('Mexicali', 'Hermosillo')),
  estatus       repartidor_estatus NOT NULL DEFAULT 'postulado',

  -- URLs de documentos almacenados (Storage buckets)
  doc_ine_url           TEXT,
  doc_licencia_url      TEXT,
  doc_antecedentes_url  TEXT,

  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger para mantener updated_at al día
CREATE OR REPLACE FUNCTION trg_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_repartidores ON repartidores;
CREATE TRIGGER set_updated_at_repartidores
  BEFORE UPDATE ON repartidores
  FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

CREATE INDEX IF NOT EXISTS idx_repartidores_ciudad  ON repartidores(ciudad);
CREATE INDEX IF NOT EXISTS idx_repartidores_estatus ON repartidores(estatus);


-- =============================================
-- 4) TABLA: inventario_campo
--    Stock físico que el repartidor carga consigo
--    (devoluciones, cancelaciones, preventa).
--    producto_id es TEXT para empatar con
--    products.id del e-commerce existente.
-- =============================================
CREATE TABLE IF NOT EXISTS inventario_campo (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repartidor_id UUID NOT NULL REFERENCES repartidores(id) ON DELETE CASCADE,
  producto_id   TEXT NOT NULL REFERENCES products(id)    ON DELETE RESTRICT,
  cantidad      INTEGER NOT NULL DEFAULT 0 CHECK (cantidad >= 0),

  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Un repartidor no puede tener 2 filas para el mismo producto
  UNIQUE (repartidor_id, producto_id)
);

DROP TRIGGER IF EXISTS set_updated_at_inventario_campo ON inventario_campo;
CREATE TRIGGER set_updated_at_inventario_campo
  BEFORE UPDATE ON inventario_campo
  FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

CREATE INDEX IF NOT EXISTS idx_inventario_repartidor ON inventario_campo(repartidor_id);
CREATE INDEX IF NOT EXISTS idx_inventario_producto   ON inventario_campo(producto_id);


-- =============================================
-- 5) TABLA: pedidos_central
--    Registro maestro de ventas de TODOS los canales.
-- =============================================
CREATE TABLE IF NOT EXISTS pedidos_central (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Datos del cliente
  cliente_nombre         TEXT NOT NULL,
  whatsapp               TEXT NOT NULL,
  direccion              TEXT NOT NULL,
  latitud                NUMERIC(10, 7),
  longitud               NUMERIC(10, 7),

  -- Clasificación logística
  origen_venta           pedido_origen_venta NOT NULL,
  tipo_entrega           pedido_tipo_entrega NOT NULL,
  estatus_pedido         pedido_estatus      NOT NULL DEFAULT 'pendiente',

  -- Optimización de ruta (entero, asignado por el admin)
  orden_ruta             INTEGER DEFAULT NULL,

  -- Si es paquetería nacional (DHL por ejemplo)
  dhl_tracking_number    TEXT DEFAULT NULL,

  -- Repartidor asignado (null = paquetería nacional o pendiente)
  repartidor_assigned_id UUID DEFAULT NULL
                          REFERENCES repartidores(id) ON DELETE SET NULL,

  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_updated_at_pedidos_central ON pedidos_central;
CREATE TRIGGER set_updated_at_pedidos_central
  BEFORE UPDATE ON pedidos_central
  FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

CREATE INDEX IF NOT EXISTS idx_pedidos_estatus          ON pedidos_central(estatus_pedido);
CREATE INDEX IF NOT EXISTS idx_pedidos_repartidor       ON pedidos_central(repartidor_assigned_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_tipo_entrega     ON pedidos_central(tipo_entrega);
CREATE INDEX IF NOT EXISTS idx_pedidos_orden_ruta       ON pedidos_central(orden_ruta);


-- =============================================
-- 6) ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE repartidores      ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventario_campo  ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos_central   ENABLE ROW LEVEL SECURITY;


-- =============================================
-- 6.1) POLÍTICAS PARA EL ROL "Administrador"
-- =============================================

DROP POLICY IF EXISTS "admin_all_repartidores" ON repartidores;
CREATE POLICY "admin_all_repartidores"
  ON repartidores
  FOR ALL
  TO authenticated
  USING  ( (auth.jwt() ->> 'role') = 'Administrador' )
  WITH CHECK ( (auth.jwt() ->> 'role') = 'Administrador' );

DROP POLICY IF EXISTS "admin_all_inventario_campo" ON inventario_campo;
CREATE POLICY "admin_all_inventario_campo"
  ON inventario_campo
  FOR ALL
  TO authenticated
  USING  ( (auth.jwt() ->> 'role') = 'Administrador' )
  WITH CHECK ( (auth.jwt() ->> 'role') = 'Administrador' );

DROP POLICY IF EXISTS "admin_all_pedidos_central" ON pedidos_central;
CREATE POLICY "admin_all_pedidos_central"
  ON pedidos_central
  FOR ALL
  TO authenticated
  USING  ( (auth.jwt() ->> 'role') = 'Administrador' )
  WITH CHECK ( (auth.jwt() ->> 'role') = 'Administrador' );


-- =============================================
-- 6.2) POLÍTICAS PARA EL ROL "Repartidor"
-- =============================================

-- PEDIDOS CENTRAL — SELECT
DROP POLICY IF EXISTS "repartidor_select_pedidos" ON pedidos_central;
CREATE POLICY "repartidor_select_pedidos"
  ON pedidos_central
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() ->> 'role') = 'Repartidor'
    AND repartidor_assigned_id::text = (auth.jwt() ->> 'repartidor_id')
  );

-- PEDIDOS CENTRAL — UPDATE
DROP POLICY IF EXISTS "repartidor_update_pedidos" ON pedidos_central;
CREATE POLICY "repartidor_update_pedidos"
  ON pedidos_central
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() ->> 'role') = 'Repartidor'
    AND repartidor_assigned_id::text = (auth.jwt() ->> 'repartidor_id')
  )
  WITH CHECK (
    (auth.jwt() ->> 'role') = 'Repartidor'
    AND repartidor_assigned_id::text = (auth.jwt() ->> 'repartidor_id')
  );

-- INVENTARIO CAMPO — SELECT
DROP POLICY IF EXISTS "repartidor_select_inventario" ON inventario_campo;
CREATE POLICY "repartidor_select_inventario"
  ON inventario_campo
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() ->> 'role') = 'Repartidor'
    AND repartidor_id::text = (auth.jwt() ->> 'repartidor_id')
  );

-- INVENTARIO CAMPO — UPDATE
DROP POLICY IF EXISTS "repartidor_update_inventario" ON inventario_campo;
CREATE POLICY "repartidor_update_inventario"
  ON inventario_campo
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() ->> 'role') = 'Repartidor'
    AND repartidor_id::text = (auth.jwt() ->> 'repartidor_id')
  )
  WITH CHECK (
    (auth.jwt() ->> 'role') = 'Repartidor'
    AND repartidor_id::text = (auth.jwt() ->> 'repartidor_id')
  );


-- =============================================
-- 7) GRANTS
-- =============================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON repartidores     TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON inventario_campo TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON pedidos_central  TO authenticated;


-- =============================================
-- 8) COMENTARIOS
-- =============================================
COMMENT ON TABLE  repartidores     IS 'Personal de logística de Luna Teia: alta, documentos y ciudad base.';
COMMENT ON TABLE  inventario_campo IS 'Stock físico cargado por cada repartidor (devoluciones/preventa).';
COMMENT ON TABLE  pedidos_central  IS 'Registro maestro de ventas de todos los canales (FB, e-commerce, kiosko).';

COMMENT ON COLUMN repartidores.ciudad             IS 'Solo Mexicali o Hermosillo por ahora (restricción CHECK).';
COMMENT ON COLUMN pedidos_central.orden_ruta      IS 'Entero para ordenar paradas (optimización de ruta).';
COMMENT ON COLUMN pedidos_central.dhl_tracking_number IS 'Solo se usa cuando tipo_entrega = paqueteria_nacional.';
COMMENT ON COLUMN pedidos_central.repartidor_assigned_id IS 'Null = paquetería nacional o aún sin asignar.';