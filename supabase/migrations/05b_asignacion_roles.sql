-- =============================================
-- LUNA TEIA COSMETICOS - CRM + LOGISTICA MODULAR
-- Script: 05b_asignacion_roles.sql
-- Proposito: Asignar roles a los 6 usuarios de prueba
--            y crear los 3 repartidores faltantes.
--
-- ORDEN DE EJECUCION (cada bloque es independiente
-- pero respeta este orden):
--   PARTE 1: ampliar CHECK de crm_usuarios_roles (agrega 'Vendedor')
--   PARTE 2: crear 3 repartidores (Juarez, Saltillo, Hermosillo)
--   PARTE 3: asignar roles a los 6 usuarios (inyecta claims al JWT)
--
-- IMPORTANTE:
--   - Correlo en SQL Editor de Supabase como postgres (service role).
--   - Si un paso falla, no avances al siguiente.
--   - Al final, todos los usuarios podran hacer login.
-- =============================================


-- =============================================
-- PARTE 1: ampliar CHECK para aceptar 'Vendedor'
-- =============================================
-- El script 04 solo permite Administrador y Repartidor.
-- Las vendedoras necesitan su rol propio para:
--   - Acceder a tablas ventas (clientes, pedidos_central, pedido_items)
--   - Supervisar envios y movimientos de reparto
-- =============================================

ALTER TABLE crm_usuarios_roles
  DROP CONSTRAINT IF EXISTS crm_usuarios_roles_rol_check;

ALTER TABLE crm_usuarios_roles
  ADD CONSTRAINT crm_usuarios_roles_rol_check
  CHECK (rol IN ('Administrador', 'Vendedor', 'Repartidor'));


-- Tambien relajar el chk_repartidor_id_segun_rol para que Vendedor
-- (que no tiene repartidor_id) pueda existir.
ALTER TABLE crm_usuarios_roles
  DROP CONSTRAINT IF EXISTS chk_repartidor_id_segun_rol;

ALTER TABLE crm_usuarios_roles
  ADD CONSTRAINT chk_repartidor_id_segun_rol CHECK (
    (rol = 'Repartidor'  AND repartidor_id IS NOT NULL)
    OR
    (rol IN ('Administrador', 'Vendedor') AND repartidor_id IS NULL)
  );


-- Tambien la sp_crm_asignar_rol necesita aceptar 'Vendedor'
DROP PROCEDURE IF EXISTS sp_crm_asignar_rol(TEXT, TEXT, UUID);

CREATE OR REPLACE PROCEDURE sp_crm_asignar_rol(
  p_email         TEXT,
  p_rol           TEXT,
  p_repartidor_id UUID DEFAULT NULL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  IF p_rol NOT IN ('Administrador', 'Vendedor', 'Repartidor') THEN
    RAISE EXCEPTION 'Rol invalido: %. Use Administrador, Vendedor o Repartidor.', p_rol
      USING ERRCODE = 'invalid_parameter_value';
  END IF;

  IF p_rol = 'Repartidor' AND p_repartidor_id IS NULL THEN
    RAISE EXCEPTION 'Para rol Repartidor, p_repartidor_id es obligatorio.'
      USING ERRCODE = 'not_null_violation';
  END IF;

  IF p_rol IN ('Administrador', 'Vendedor') AND p_repartidor_id IS NOT NULL THEN
    RAISE EXCEPTION 'Para rol %s, p_repartidor_id debe ser NULL.', p_rol
      USING ERRCODE = 'check_violation';
  END IF;

  SELECT id INTO v_user_id
    FROM auth.users
   WHERE email = p_email;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No existe un usuario registrado con email: %', p_email
      USING ERRCODE = 'no_data_found';
  END IF;

  INSERT INTO crm_usuarios_roles (user_auth_id, rol, repartidor_id, activo)
  VALUES (v_user_id, p_rol, p_repartidor_id, TRUE)
  ON CONFLICT (user_auth_id)
  DO UPDATE SET
    rol           = EXCLUDED.rol,
    repartidor_id = EXCLUDED.repartidor_id,
    activo        = TRUE;

  RAISE NOTICE 'Rol % asignado a % (user_id %). Claims JWT actualizados.',
    p_rol, p_email, v_user_id;
END;
$$;

GRANT EXECUTE ON PROCEDURE sp_crm_asignar_rol(TEXT, TEXT, UUID) TO service_role;


-- =============================================
-- PARTE 2: crear los 3 repartidores
-- =============================================
-- Cada uno con su user_id (linkea el auth user con la fila de repartidor).
--
-- IMPORTANTE: la tabla repartidores en este Supabase se creo a mano
-- con columna 'activo BOOLEAN' (no 'estatus' enum como dice el script 01).
-- Esta PARTE usa la estructura real, NO agrega 'estatus'.
--
-- La comision NO es columna: el trigger de pedido_items usa 0.30 hardcoded
-- (ver 02_crm_logistica_detalles.sql). Si mas adelante quieren parametrizar
-- por repartidor, se agrega la columna comision_pct aca en una migracion
-- aparte y se ajusta el trigger.
--
-- UIDs vienen del ESTADO_PROYECTO.md. Si los re-creaste, ajustalos
-- con el query de la PARTE 0 (al final del script).
-- =============================================

-- 2.0) AUTO-SANACION: nos aseguramos que 'user_id' exista con la FK
-- (por si tampoco se creo a mano, aunque el query diagnostico mostro que si).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'repartidores' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE repartidores
      ADD COLUMN user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_repartidores_user_id ON repartidores(user_id);
  END IF;

  -- Tambien: CHECK de ciudad (script 01 lo restringia a Mexicali/Hermosillo).
  -- El script 05a lo relaja, pero por si no se corrio, lo hacemos aca idempotente.
  ALTER TABLE repartidores DROP CONSTRAINT IF EXISTS repartidores_ciudad_check;
END $$;


-- 2.1) Inserts de los 3 repartidores (usando 'activo', NO 'estatus')

-- Juan Juarez - Cd. Juarez
INSERT INTO repartidores (nombre, telefono, ciudad, activo, user_id)
VALUES ('Juan Juarez', '6620000001', 'Cd. Juarez', TRUE,
        'fa82a04b-5c16-415c-b485-4029d46ad460')
ON CONFLICT (user_id) DO UPDATE SET
  nombre   = EXCLUDED.nombre,
  telefono = EXCLUDED.telefono,
  ciudad   = EXCLUDED.ciudad,
  activo   = TRUE;

-- Sofia Saltillo - Saltillo
INSERT INTO repartidores (nombre, telefono, ciudad, activo, user_id)
VALUES ('Sofia Saltillo', '6620000002', 'Saltillo', TRUE,
        'b62d7795-2797-484e-8ab2-f938a6aa368e')
ON CONFLICT (user_id) DO UPDATE SET
  nombre   = EXCLUDED.nombre,
  telefono = EXCLUDED.telefono,
  ciudad   = EXCLUDED.ciudad,
  activo   = TRUE;

-- Luis Hermosillo - Hermosillo
INSERT INTO repartidores (nombre, telefono, ciudad, activo, user_id)
VALUES ('Luis Hermosillo', '6620000003', 'Hermosillo', TRUE,
        'a5333554-b1d9-4fdc-ab3d-b15b66b9ee02')
ON CONFLICT (user_id) DO UPDATE SET
  nombre   = EXCLUDED.nombre,
  telefono = EXCLUDED.telefono,
  ciudad   = EXCLUDED.ciudad,
  activo   = TRUE;


-- =============================================
-- PARTE 3: asignar roles a los 6 usuarios
-- =============================================
-- Cada CALL dispara el trigger trg_crm_sincronizar_claims
-- que inyecta app_metadata.role (+ repartidor_id si aplica)
-- en el JWT. Despues de esto, el login ya funciona.
-- =============================================

-- 1. Admin
CALL sp_crm_asignar_rol('admin@lunateia.com', 'Administrador');

-- 2. Vendedoras
CALL sp_crm_asignar_rol('vendedora1@lunateia.com', 'Vendedor');
CALL sp_crm_asignar_rol('vendedora2@lunateia.com', 'Vendedor');

-- 3. Repartidores (con su repartidor_id)
CALL sp_crm_asignar_rol(
  'repartidor.juarez@lunateia.com',
  'Repartidor',
  (SELECT id FROM repartidores WHERE user_id = 'fa82a04b-5c16-415c-b485-4029d46ad460')
);

CALL sp_crm_asignar_rol(
  'repartidor.saltillo@lunateia.com',
  'Repartidor',
  (SELECT id FROM repartidores WHERE user_id = 'b62d7795-2797-484e-8ab2-f938a6aa368e')
);

CALL sp_crm_asignar_rol(
  'repartidor.hermosillo@lunateia.com',
  'Repartidor',
  (SELECT id FROM repartidores WHERE user_id = 'a5333554-b1d9-4fdc-ab3d-b15b66b9ee02')
);


-- =============================================
-- PARTE 0 (opcional - solo si necesitas verificar/corregir UIDs)
-- =============================================
-- Correlo ANTES de la PARTE 2 si queres confirmar que los UIDs
-- del ESTADO_PROYECTO.md siguen siendo validos. Si los re-creaste
-- (auth.users cambio), copia los nuevos UIDs de aca y pegalos
-- en la PARTE 2 y PARTE 3.
-- =============================================

-- SELECT id, email, created_at
--   FROM auth.users
--  WHERE email LIKE '%@lunateia.com'
--  ORDER BY email;


-- =============================================
-- DIAGNOSTICO: verificar que quedo todo bien
-- =============================================
SELECT * FROM v_crm_usuarios_detalle
 WHERE email LIKE '%@lunateia.com'
 ORDER BY rol, email;
