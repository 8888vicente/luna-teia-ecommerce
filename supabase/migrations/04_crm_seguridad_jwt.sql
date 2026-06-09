-- =============================================
-- LUNA TEIA COSMÉTICOS — CRM + LOGÍSTICA MODULAR
-- Script: 04_crm_seguridad_jwt.sql
-- Propósito: Inyectar Custom Claims (role +
--            repartidor_id) en el JWT de
--            Supabase para activar todas las
--            políticas RLS de los scripts previos.
--
-- CONCEPTO CLAVE:
--   Supabase almacena el JWT en dos secciones:
--     • user_metadata: editable por el cliente.
--     • app_metadata : SOLO editable por el
--                       servidor (Service Role).
--                       ⚠️  Es donde viven los
--                       roles. El cliente NO puede
--                       alterarlos.
--
--   Nuestras políticas RLS leen de app_metadata:
--     (auth.jwt() ->> 'role')
--     (auth.jwt() ->> 'repartidor_id')
--
-- Dependencias: 01_crm_core.sql (repartidores).
-- =============================================


-- =============================================
-- 1) EXTENSIÓN: pgcrypto
-- =============================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- =============================================
-- 2) TABLA: crm_usuarios_roles
--    Tabla puente entre auth.users (Supabase) y
--    nuestro dominio. Aquí es donde el admin
--    asigna manualmente el rol de cada usuario.
-- =============================================
CREATE TABLE IF NOT EXISTS crm_usuarios_roles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_auth_id    UUID NOT NULL UNIQUE
                    REFERENCES auth.users(id) ON DELETE CASCADE,
  rol             TEXT NOT NULL
                    CHECK (rol IN ('Administrador', 'Repartidor')),

  repartidor_id   UUID DEFAULT NULL
                    REFERENCES repartidores(id) ON DELETE SET NULL,

  activo          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_repartidor_id_segun_rol CHECK (
    (rol = 'Repartidor'  AND repartidor_id IS NOT NULL)
    OR
    (rol = 'Administrador' AND repartidor_id IS NULL)
  )
);

DROP TRIGGER IF EXISTS set_updated_at_crm_usuarios_roles ON crm_usuarios_roles;
CREATE TRIGGER set_updated_at_crm_usuarios_roles
  BEFORE UPDATE ON crm_usuarios_roles
  FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

CREATE INDEX IF NOT EXISTS idx_crm_usuarios_roles_user
  ON crm_usuarios_roles(user_auth_id);


-- =============================================
-- 3) RLS sobre crm_usuarios_roles
-- =============================================
ALTER TABLE crm_usuarios_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_all_crm_usuarios_roles" ON crm_usuarios_roles;
CREATE POLICY "deny_all_crm_usuarios_roles"
  ON crm_usuarios_roles
  FOR ALL
  TO authenticated
  USING (FALSE)
  WITH CHECK (FALSE);


-- =============================================
-- 4) FUNCIÓN NUCLEAR: fn_crm_inyectar_claims_jwt
-- =============================================
CREATE OR REPLACE FUNCTION fn_crm_inyectar_claims_jwt(p_user_auth_id UUID)
RETURNS VOID AS $$
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
    PERFORM auth.update_user_metadata(
      p_user_auth_id,
      jsonb_build_object(
        'app_metadata', jsonb_build_object(
          'role',          NULL,
          'repartidor_id', NULL
        )
      )
    );
    RETURN;
  END IF;

  IF v_rol = 'Administrador' THEN
    v_claims := jsonb_build_object(
      'role',          'Administrador',
      'repartidor_id', NULL
    );
  ELSE
    v_rol := 'Repartidor';
    v_claims := jsonb_build_object(
      'role',          'Repartidor',
      'repartidor_id', v_repartidor_id
    );
  END IF;

  PERFORM auth.update_user_metadata(
    p_user_auth_id,
    jsonb_build_object('app_metadata', v_claims)
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error inyectando claims a user %: % (%)',
      p_user_auth_id, SQLERRM, SQLSTATE;
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================
-- 5) TRIGGER DE SINCRONIZACIÓN
-- =============================================
CREATE OR REPLACE FUNCTION fn_crm_trigger_sincronizar_claims()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM fn_crm_inyectar_claims_jwt(OLD.user_auth_id);
    RETURN OLD;
  ELSE
    PERFORM fn_crm_inyectar_claims_jwt(NEW.user_auth_id);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_crm_sincronizar_claims ON crm_usuarios_roles;
CREATE TRIGGER trg_crm_sincronizar_claims
  AFTER INSERT OR UPDATE OR DELETE ON crm_usuarios_roles
  FOR EACH ROW EXECUTE FUNCTION fn_crm_trigger_sincronizar_claims();


-- =============================================
-- 6) PROCEDIMIENTO AUXILIAR: sp_crm_asignar_rol
-- =============================================
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
  IF p_rol NOT IN ('Administrador', 'Repartidor') THEN
    RAISE EXCEPTION 'Rol inválido: %. Use Administrador o Repartidor.', p_rol
      USING ERRCODE = 'invalid_parameter_value';
  END IF;

  IF p_rol = 'Repartidor' AND p_repartidor_id IS NULL THEN
    RAISE EXCEPTION 'Para rol Repartidor, p_repartidor_id es obligatorio.'
      USING ERRCODE = 'not_null_violation';
  END IF;

  IF p_rol = 'Administrador' AND p_repartidor_id IS NOT NULL THEN
    RAISE EXCEPTION 'Para rol Administrador, p_repartidor_id debe ser NULL.'
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


-- =============================================
-- 7) PROCEDIMIENTO AUXILIAR: sp_crm_revocar_rol
-- =============================================
CREATE OR REPLACE PROCEDURE sp_crm_revocar_rol(p_email TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id
    FROM auth.users
   WHERE email = p_email;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No existe usuario con email: %', p_email
      USING ERRCODE = 'no_data_found';
  END IF;

  UPDATE crm_usuarios_roles
     SET activo = FALSE
   WHERE user_auth_id = v_user_id;

  RAISE NOTICE 'Rol revocado para %. Claims JWT limpiados.', p_email;
END;
$$;


-- =============================================
-- 8) GRANTS
-- =============================================
GRANT EXECUTE ON PROCEDURE sp_crm_asignar_rol(TEXT, TEXT, UUID) TO service_role;
GRANT EXECUTE ON PROCEDURE sp_crm_revocar_rol(TEXT)            TO service_role;


-- =============================================
-- 9) VISTA DE DIAGNÓSTICO
-- =============================================
CREATE OR REPLACE VIEW v_crm_usuarios_detalle AS
SELECT
  u.id                              AS user_auth_id,
  u.email,
  u.created_at                      AS fecha_registro,
  r.rol,
  r.repartidor_id,
  rep.nombre                        AS repartidor_nombre,
  rep.ciudad                        AS repartidor_ciudad,
  r.activo,
  u.raw_app_meta_data::jsonb        AS app_metadata_actual
FROM auth.users u
LEFT JOIN crm_usuarios_roles r ON r.user_auth_id = u.id
LEFT JOIN repartidores       rep ON rep.id = r.repartidor_id;

COMMENT ON VIEW v_crm_usuarios_detalle
  IS 'Vista de diagnóstico para admin: une auth.users con roles y repartidores.';


-- =============================================
-- 10) COMENTARIOS FINALES
-- =============================================
COMMENT ON TABLE  crm_usuarios_roles
  IS 'Tabla puente entre auth.users y repartidores. Única fuente de verdad para asignación de roles.';
COMMENT ON FUNCTION fn_crm_inyectar_claims_jwt(UUID)
  IS 'Inyecta role + repartidor_id en app_metadata del JWT de Supabase.';
COMMENT ON PROCEDURE sp_crm_asignar_rol(TEXT, TEXT, UUID)
  IS 'Asigna un rol a un usuario por email. Trigger sincroniza JWT automáticamente.';
COMMENT ON PROCEDURE sp_crm_revocar_rol(TEXT)
  IS 'Desactiva el rol de un usuario y limpia los claims del JWT.';