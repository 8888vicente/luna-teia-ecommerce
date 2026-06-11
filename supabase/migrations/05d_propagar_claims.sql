-- =============================================
-- LUNA TEIA COSMETICOS - PROPAGACION DE CLAIMS AL JWT
-- Script: 05d_propagar_claims.sql
--
-- PROBLEMA: el trigger actualizo crm_usuarios_roles (OK),
-- pero el UPDATE sobre auth.users.raw_app_meta_data fallo
-- silenciosamente por permisos (SECURITY DEFINER no alcanzo).
--
-- SOLUCION: hacer el UPDATE directo desde aqui, con los
-- permisos elevados del SQL Editor (que corre como superuser
-- o como un rol con GRANT sobre auth.users).
--
-- Es un script de un solo uso. Si ya estaba aplicado, no hace nada.
-- =============================================

-- Helper: actualiza raw_app_meta_data de un usuario segun su rol activo
CREATE OR REPLACE FUNCTION public.fn_crm_propagar_claims_a_usuario(p_user_auth_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rol            TEXT;
  v_repartidor_id  UUID;
  v_nuevo_claims   JSONB;
BEGIN
  -- Leer rol activo
  SELECT rol, repartidor_id
    INTO v_rol, v_repartidor_id
    FROM crm_usuarios_roles
   WHERE user_auth_id = p_user_auth_id
     AND activo = TRUE;

  -- Construir nuevos claims
  IF v_rol IS NULL THEN
    v_nuevo_claims := jsonb_build_object(
      'app_metadata', jsonb_build_object(
        'role',          NULL,
        'repartidor_id', NULL
      )
    );
  ELSIF v_rol IN ('Administrador', 'Vendedor') THEN
    v_nuevo_claims := jsonb_build_object(
      'app_metadata', jsonb_build_object(
        'role',          v_rol,
        'repartidor_id', NULL
      )
    );
  ELSE
    v_nuevo_claims := jsonb_build_object(
      'app_metadata', jsonb_build_object(
        'role',          'Repartidor',
        'repartidor_id', v_repartidor_id
      )
    );
  END IF;

  -- UPDATE directo: merge con raw_app_meta_data existente (sin pisar otras keys)
  UPDATE auth.users
     SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || v_nuevo_claims
   WHERE id = p_user_auth_id;

  RAISE NOTICE 'Claims propagados a user %: rol=%', p_user_auth_id, v_rol;
END;
$$;


-- Propagar a los 6 usuarios (idempotente)
DO $p$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT user_auth_id
      FROM crm_usuarios_roles
     WHERE activo = TRUE
  LOOP
    PERFORM fn_crm_propagar_claims_a_usuario(r.user_auth_id);
  END LOOP;
END $p$;


-- Diagnostico: ver que quedo en raw_app_meta_data
SELECT
  u.id                              AS user_auth_id,
  u.email,
  u.raw_app_meta_data->>'role'          AS role_claim,
  u.raw_app_meta_data->>'repartidor_id' AS repartidor_claim
FROM auth.users u
WHERE u.email LIKE '%@lunateia.com'
ORDER BY u.raw_app_meta_data->>'role' NULLS LAST, u.email;
