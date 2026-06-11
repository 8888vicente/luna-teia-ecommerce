-- =============================================
-- LUNA TEIA COSMETICOS - FIX CRITICO DE PRODUCCION
-- Script: 05c_fix_critico.sql
--
-- Arregla lo unico que esta roto en produccion:
--   1. La funcion fn_crm_inyectar_claims_jwt tiene un typo
--      ('v_role' en vez de 'v_rol') que rompe la asignacion
--      de roles. Sin este fix, TODOS los CALL sp_crm_asignar_rol
--      fallan en el trigger.
--   2. El CHECK de crm_usuarios_roles solo permite
--      'Administrador' y 'Repartidor' (falta 'Vendedor').
--   3. La sp_crm_asignar_rol solo acepta esos 2 roles.
--
-- Es IDEMPOTENTE: lo podes correr las veces que quieras.
-- NO toca tablas (no agrega/saca columnas): respeta la
-- estructura real que tenes en produccion.
-- =============================================


-- =============================================
-- 1) RECREAR fn_crm_inyectar_claims_jwt (fix typo)
-- =============================================
-- Antes (roto):
--   IF v_role IS NULL THEN   <- v_role no existe, la var es v_rol
-- Ahora (arreglado):
--   IF v_rol IS NULL THEN
--
-- Tambien amplio la logica para aceptar 'Vendedor'
-- (mismas reglas que 'Administrador': sin repartidor_id).
-- =============================================

CREATE OR REPLACE FUNCTION public.fn_crm_inyectar_claims_jwt(p_user_auth_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
  v_rol            TEXT;
  v_repartidor_id  UUID;
  v_claims         JSONB;
BEGIN
  SELECT rol, repartidor_id
    INTO v_rol, v_repartidor_id
    FROM crm_usuarios_roles
   WHERE user_auth_id = p_user_auth_id
     AND activo = TRUE;

  IF v_rol IS NULL THEN
    UPDATE auth.users
       SET raw_app_meta_data =
             COALESCE(raw_app_meta_data, '{}'::jsonb)
             || jsonb_build_object(
                  'app_metadata', jsonb_build_object(
                    'role',          NULL,
                    'repartidor_id', NULL
                  )
                )
     WHERE id = p_user_auth_id;
    RETURN;
  END IF;

  -- Administrador y Vendedor: sin repartidor_id
  IF v_rol IN ('Administrador', 'Vendedor') THEN
    v_claims := jsonb_build_object(
      'role',          v_rol,
      'repartidor_id', NULL
    );
  ELSE
    -- Repartidor: con repartidor_id
    v_claims := jsonb_build_object(
      'role',          'Repartidor',
      'repartidor_id', v_repartidor_id
    );
  END IF;

  -- Forma universal: UPDATE directo sobre auth.users.raw_app_meta_data
  -- (no depende de la version de la API auth.update_user_metadata)
  UPDATE auth.users
     SET raw_app_meta_data =
           COALESCE(raw_app_meta_data, '{}'::jsonb)
           || jsonb_build_object('app_metadata', v_claims)
   WHERE id = p_user_auth_id;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error inyectando claims a user %: % (%)',
      p_user_auth_id, SQLERRM, SQLSTATE;
    RAISE;
END;
$func$;


-- =============================================
-- 2) AMPLIAR CHECK de crm_usuarios_roles (agrega 'Vendedor')
-- =============================================

ALTER TABLE crm_usuarios_roles
  DROP CONSTRAINT IF EXISTS crm_usuarios_roles_rol_check;

ALTER TABLE crm_usuarios_roles
  ADD CONSTRAINT crm_usuarios_roles_rol_check
  CHECK (rol IN ('Administrador', 'Vendedor', 'Repartidor'));


-- Tambien relajar el CHECK repartidor_id_segun_rol (si existe)
-- para que Vendedor (sin repartidor_id) pueda existir.
ALTER TABLE crm_usuarios_roles
  DROP CONSTRAINT IF EXISTS chk_repartidor_id_segun_rol;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'chk_repartidor_id_segun_rol'
      AND table_name = 'crm_usuarios_roles'
  ) THEN
    ALTER TABLE crm_usuarios_roles
      ADD CONSTRAINT chk_repartidor_id_segun_rol CHECK (
        (rol = 'Repartidor'  AND repartidor_id IS NOT NULL)
        OR
        (rol IN ('Administrador', 'Vendedor') AND repartidor_id IS NULL)
      );
  END IF;
END $$;


-- =============================================
-- 3) RECREAR sp_crm_asignar_rol (acepta 'Vendedor')
-- =============================================

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
    RAISE EXCEPTION 'Para rol %, p_repartidor_id debe ser NULL.', p_rol
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
-- 4) ASEGURAR QUE EXISTE EL TRIGGER (por si se borro)
-- =============================================

DROP TRIGGER IF EXISTS trg_crm_sincronizar_claims ON crm_usuarios_roles;

CREATE TRIGGER trg_crm_sincronizar_claims
  AFTER INSERT OR UPDATE OR DELETE ON crm_usuarios_roles
  FOR EACH ROW EXECUTE FUNCTION fn_crm_trigger_sincronizar_claims();


-- =============================================
-- 5) INSERTAR LOS 3 REPARTIDORES (idempotente)
-- =============================================
-- Tu tabla 'repartidores' tiene columna 'activo' (boolean),
-- NO 'estatus' (enum). Usamos la estructura real.
-- =============================================

INSERT INTO repartidores (nombre, telefono, ciudad, activo, user_id)
VALUES ('Juan Juarez', '6620000001', 'Cd. Juarez', TRUE,
        'fa82a04b-5c16-415c-b485-4029d46ad460')
ON CONFLICT (user_id) DO UPDATE SET
  nombre   = EXCLUDED.nombre,
  telefono = EXCLUDED.telefono,
  ciudad   = EXCLUDED.ciudad,
  activo   = TRUE;

INSERT INTO repartidores (nombre, telefono, ciudad, activo, user_id)
VALUES ('Sofia Saltillo', '6620000002', 'Saltillo', TRUE,
        'b62d7795-2797-484e-8ab2-f938a6aa368e')
ON CONFLICT (user_id) DO UPDATE SET
  nombre   = EXCLUDED.nombre,
  telefono = EXCLUDED.telefono,
  ciudad   = EXCLUDED.ciudad,
  activo   = TRUE;

INSERT INTO repartidores (nombre, telefono, ciudad, activo, user_id)
VALUES ('Luis Hermosillo', '6620000003', 'Hermosillo', TRUE,
        'a5333554-b1d9-4fdc-ab3d-b15b66b9ee02')
ON CONFLICT (user_id) DO UPDATE SET
  nombre   = EXCLUDED.nombre,
  telefono = EXCLUDED.telefono,
  ciudad   = EXCLUDED.ciudad,
  activo   = TRUE;


-- =============================================
-- 6) ASIGNAR ROLES A LOS 6 USUARIOS
-- =============================================
-- PostgreSQL NO permite subqueries en argumentos de CALL.
-- Resolvemos los repartidor_id primero en variables y despues
-- llamamos a la sp con valores literales.
-- =============================================

DO $crm$
DECLARE
  v_rep_juarez_id     UUID;
  v_rep_saltillo_id   UUID;
  v_rep_hermosillo_id UUID;
BEGIN
  -- Resolver IDs de repartidores
  SELECT id INTO v_rep_juarez_id
    FROM repartidores
   WHERE user_id = 'fa82a04b-5c16-415c-b485-4029d46ad460';

  SELECT id INTO v_rep_saltillo_id
    FROM repartidores
   WHERE user_id = 'b62d7795-2797-484e-8ab2-f938a6aa368e';

  SELECT id INTO v_rep_hermosillo_id
    FROM repartidores
   WHERE user_id = 'a5333554-b1d9-4fdc-ab3d-b15b66b9ee02';

  -- Admin y vendedoras (sin repartidor_id)
  CALL sp_crm_asignar_rol('admin@lunateia.com', 'Administrador');
  CALL sp_crm_asignar_rol('vendedora1@lunateia.com', 'Vendedor');
  CALL sp_crm_asignar_rol('vendedora2@lunateia.com', 'Vendedor');

  -- Repartidores (con su repartidor_id)
  IF v_rep_juarez_id IS NOT NULL THEN
    CALL sp_crm_asignar_rol('repartidor.juarez@lunateia.com', 'Repartidor', v_rep_juarez_id);
  ELSE
    RAISE NOTICE 'No se encontro repartidor con user_id Juarez';
  END IF;

  IF v_rep_saltillo_id IS NOT NULL THEN
    CALL sp_crm_asignar_rol('repartidor.saltillo@lunateia.com', 'Repartidor', v_rep_saltillo_id);
  ELSE
    RAISE NOTICE 'No se encontro repartidor con user_id Saltillo';
  END IF;

  IF v_rep_hermosillo_id IS NOT NULL THEN
    CALL sp_crm_asignar_rol('repartidor.hermosillo@lunateia.com', 'Repartidor', v_rep_hermosillo_id);
  ELSE
    RAISE NOTICE 'No se encontro repartidor con user_id Hermosillo';
  END IF;
END $crm$;


-- =============================================
-- 7) DIAGNOSTICO FINAL
-- =============================================

-- Ver los roles asignados
SELECT user_auth_id, rol, repartidor_id, activo, created_at
  FROM crm_usuarios_roles
 ORDER BY rol, created_at;

-- Ver repartidores con su user link
SELECT id, nombre, telefono, ciudad, activo, user_id
  FROM repartidores
 ORDER BY nombre;

-- Ver usuarios de auth con su rol inyectado (claims)
SELECT
  u.id                              AS user_auth_id,
  u.email,
  u.raw_app_meta_data->>'role'          AS role_claim,
  u.raw_app_meta_data->>'repartidor_id' AS repartidor_claim
FROM auth.users u
WHERE u.email LIKE '%@lunateia.com'
ORDER BY u.raw_app_meta_data->>'role', u.email;
