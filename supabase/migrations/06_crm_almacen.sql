-- =============================================
-- LUNA TEIA COSMETICOS - BODEGA Y EMPAQUE
-- Script: 06_crm_almacen.sql
-- Proposito: Configurar el rol 'Almacen' y la columna de empaque
-- =============================================

-- 1) Añadir estatus_empaque y dhl_tracking_number a pedidos_central si no existen
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'pedidos_central' AND column_name = 'estatus_empaque'
  ) THEN
    ALTER TABLE pedidos_central 
      ADD COLUMN estatus_empaque TEXT NOT NULL DEFAULT 'pendiente'
      CHECK (estatus_empaque IN ('pendiente', 'en_proceso', 'completado'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'pedidos_central' AND column_name = 'dhl_tracking_number'
  ) THEN
    ALTER TABLE pedidos_central 
      ADD COLUMN dhl_tracking_number TEXT DEFAULT NULL;
  END IF;
END $$;

-- 2) Ampliar CHECK de crm_usuarios_roles para aceptar 'Almacen'
ALTER TABLE crm_usuarios_roles DROP CONSTRAINT IF EXISTS crm_usuarios_roles_rol_check;
ALTER TABLE crm_usuarios_roles ADD CONSTRAINT crm_usuarios_roles_rol_check 
  CHECK (rol IN ('Administrador', 'Vendedor', 'Repartidor', 'Almacen'));

-- 3) Relajar el check de repartidor_id_segun_rol para permitir 'Almacen' (sin repartidor_id)
ALTER TABLE crm_usuarios_roles DROP CONSTRAINT IF EXISTS chk_repartidor_id_segun_rol;
ALTER TABLE crm_usuarios_roles ADD CONSTRAINT chk_repartidor_id_segun_rol CHECK (
  (rol = 'Repartidor'  AND repartidor_id IS NOT NULL)
  OR
  (rol IN ('Administrador', 'Vendedor', 'Almacen') AND repartidor_id IS NULL)
);

-- 4) Recrear sp_crm_asignar_rol para aceptar 'Almacen'
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
  IF p_rol NOT IN ('Administrador', 'Vendedor', 'Repartidor', 'Almacen') THEN
    RAISE EXCEPTION 'Rol invalido: %. Use Administrador, Vendedor, Repartidor o Almacen.', p_rol
      USING ERRCODE = 'invalid_parameter_value';
  END IF;

  IF p_rol = 'Repartidor' AND p_repartidor_id IS NULL THEN
    RAISE EXCEPTION 'Para rol Repartidor, p_repartidor_id es obligatorio.'
      USING ERRCODE = 'not_null_violation';
  END IF;

  IF p_rol IN ('Administrador', 'Vendedor', 'Almacen') AND p_repartidor_id IS NOT NULL THEN
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

-- 5) Recrear fn_crm_inyectar_claims_jwt para aceptar 'Almacen'
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

  -- Administrador, Vendedor y Almacen: sin repartidor_id
  IF v_rol IN ('Administrador', 'Vendedor', 'Almacen') THEN
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

-- 6) Recrear fn_crm_propagar_claims_a_usuario para aceptar 'Almacen'
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
  ELSIF v_rol IN ('Administrador', 'Vendedor', 'Almacen') THEN
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

  -- UPDATE directo: merge con raw_app_meta_data existente
  UPDATE auth.users
     SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || v_nuevo_claims
   WHERE id = p_user_auth_id;
END;
$$;

-- 7) RLS Policies para el rol 'Almacen'
-- Permisos sobre pedidos_central
DROP POLICY IF EXISTS "almacen_select_pedidos" ON pedidos_central;
CREATE POLICY "almacen_select_pedidos" ON pedidos_central
  FOR SELECT TO authenticated
  USING ( (auth.jwt() -> 'app_metadata' -> 'app_metadata' ->> 'role') = 'Almacen' OR (auth.jwt() ->> 'role') = 'Almacen' );

DROP POLICY IF EXISTS "almacen_update_pedidos" ON pedidos_central;
CREATE POLICY "almacen_update_pedidos" ON pedidos_central
  FOR UPDATE TO authenticated
  USING ( (auth.jwt() -> 'app_metadata' -> 'app_metadata' ->> 'role') = 'Almacen' OR (auth.jwt() ->> 'role') = 'Almacen' )
  WITH CHECK ( (auth.jwt() -> 'app_metadata' -> 'app_metadata' ->> 'role') = 'Almacen' OR (auth.jwt() ->> 'role') = 'Almacen' );

-- Permisos sobre pedido_items
DROP POLICY IF EXISTS "almacen_select_pedido_items" ON pedido_items;
CREATE POLICY "almacen_select_pedido_items" ON pedido_items
  FOR SELECT TO authenticated
  USING ( (auth.jwt() -> 'app_metadata' -> 'app_metadata' ->> 'role') = 'Almacen' OR (auth.jwt() ->> 'role') = 'Almacen' );

-- Permisos sobre repartidores
DROP POLICY IF EXISTS "almacen_select_repartidores" ON repartidores;
CREATE POLICY "almacen_select_repartidores" ON repartidores
  FOR SELECT TO authenticated
  USING ( (auth.jwt() -> 'app_metadata' -> 'app_metadata' ->> 'role') = 'Almacen' OR (auth.jwt() ->> 'role') = 'Almacen' );
