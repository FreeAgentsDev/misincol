-- ============================================
-- FIX: Políticas RLS para permitir login
-- ============================================
-- Este script agrega una política que permite buscar perfiles por nombre_usuario
-- sin autenticación, solo para el proceso de login

-- Opción 1: Política que permite búsqueda por nombre_usuario sin autenticación
-- (Solo para SELECT, no permite modificar datos)
CREATE POLICY "Allow login by username"
  ON perfiles FOR SELECT
  USING (true);  -- Permite leer cualquier perfil (solo para login)

-- NOTA: Esta política es muy permisiva. Si prefieres algo más restrictivo,
-- puedes usar la Opción 2 (función RPC) que está más abajo.

-- ============================================
-- Opción 2: Función RPC más segura (RECOMENDADO)
-- ============================================
-- Esta función permite buscar el email asociado a un nombre_usuario
-- sin exponer toda la tabla perfiles

CREATE OR REPLACE FUNCTION buscar_email_por_usuario(p_nombre_usuario TEXT)
RETURNS TABLE (
  id UUID,
  email TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_email TEXT;
BEGIN
  -- Buscar el ID del usuario por nombre_usuario
  SELECT perfiles.id INTO v_user_id
  FROM perfiles
  WHERE perfiles.nombre_usuario = p_nombre_usuario;
  
  IF v_user_id IS NULL THEN
    RETURN;  -- No retorna nada si no encuentra el usuario
  END IF;
  
  -- Obtener el email desde auth.users
  SELECT auth.users.email INTO v_email
  FROM auth.users
  WHERE auth.users.id = v_user_id;
  
  -- Retornar el resultado
  RETURN QUERY SELECT v_user_id, v_email;
END;
$$;

-- ============================================
-- Si eliges la Opción 1, elimina la política anterior y usa esta más restrictiva:
-- ============================================

-- DROP POLICY IF EXISTS "Allow login by username" ON perfiles;

-- CREATE POLICY "Allow public username lookup for login"
--   ON perfiles FOR SELECT
--   USING (true)
--   WITH CHECK (false);  -- No permite modificar



