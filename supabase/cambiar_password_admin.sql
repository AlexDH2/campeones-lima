-- ==============================================================================
-- CAMBIAR CONTRASEÑA DESDE EL PANEL DE ADMINISTRACIÓN (SOLO ROL PRINCIPAL)
-- ==============================================================================
-- Instrucciones:
-- 1. Copia y pega este script en Supabase -> SQL Editor.
-- 2. Haz clic en "Run".
-- 3. Estado: PENDIENTE DE EJECUCIÓN (Ejecutar en la consola de Supabase).
-- ==============================================================================

CREATE OR REPLACE FUNCTION ccl_cambiar_password_admin(
  correo_objetivo TEXT,
  nueva_password TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_caller_id UUID;
  v_caller_rol TEXT;
  v_caller_estado TEXT;
  v_target_user_id UUID;
BEGIN
  -- 1. Obtener ID del usuario autenticado que realiza la petición
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'No autorizado: Debes tener una sesión activa.';
  END IF;

  -- 2. Verificar que quien ejecuta sea Administrador con rol Principal y estado activo
  SELECT rol, estado INTO v_caller_rol, v_caller_estado
  FROM public.admin_usuarios
  WHERE user_id = v_caller_id;

  IF v_caller_rol IS NULL OR v_caller_rol <> 'Principal' OR v_caller_estado <> 'activo' THEN
    RAISE EXCEPTION 'No autorizado: Solo el Administrador Principal puede cambiar contraseñas.';
  END IF;

  -- 3. Validar longitud mínima de la nueva contraseña
  IF length(trim(nueva_password)) < 6 THEN
    RAISE EXCEPTION 'La contraseña debe tener al menos 6 caracteres.';
  END IF;

  -- 4. Buscar el usuario objetivo en auth.users
  SELECT id INTO v_target_user_id
  FROM auth.users
  WHERE lower(email) = lower(trim(correo_objetivo));

  IF v_target_user_id IS NULL THEN
    RAISE EXCEPTION 'No se encontró la cuenta % en Authentication.', correo_objetivo;
  END IF;

  -- 5. Actualizar la contraseña en auth.users usando el hash bcrypt
  UPDATE auth.users
  SET encrypted_password = extensions.crypt(trim(nueva_password), extensions.gen_salt('bf')),
      updated_at = NOW()
  WHERE id = v_target_user_id;

  -- 6. Si en admin_usuarios aún no tenía user_id vinculado, vincularlo ahora
  UPDATE public.admin_usuarios
  SET user_id = v_target_user_id
  WHERE lower(email) = lower(trim(correo_objetivo)) AND user_id IS NULL;

  RETURN jsonb_build_object(
    'ok', true,
    'mensaje', 'Contraseña actualizada correctamente para ' || correo_objetivo
  );
END;
$$;

-- Asignar permisos de ejecución a usuarios autenticados
REVOKE ALL ON FUNCTION ccl_cambiar_password_admin(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION ccl_cambiar_password_admin(TEXT, TEXT) TO authenticated;
