-- Script para corregir el trigger de creación automática de perfiles
-- Ejecuta este script en el SQL Editor de Supabase si tienes problemas con el trigger de inicio de sesión

-- Paso 1: Eliminar trigger y función anteriores (si existen)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS manejar_nuevo_usuario();

-- Paso 2: Crear la función corregida
CREATE OR REPLACE FUNCTION manejar_nuevo_usuario()
RETURNS TRIGGER AS $$
DECLARE
  v_nombre_usuario TEXT;
  v_nombre_completo TEXT;
  v_rol rol_usuario;
BEGIN
  -- Extraer datos del metadata o usar valores por defecto
  v_nombre_usuario := COALESCE(
    NEW.raw_user_meta_data->>'nombre_usuario',
    SPLIT_PART(NEW.email, '@', 1), -- Usar parte antes del @ como fallback
    'usuario_' || SUBSTRING(NEW.id::TEXT, 1, 8) -- Último fallback
  );
  
  v_nombre_completo := COALESCE(
    NEW.raw_user_meta_data->>'nombre_completo',
    NEW.raw_user_meta_data->>'name',
    v_nombre_usuario
  );
  
  v_rol := COALESCE(
    (NEW.raw_user_meta_data->>'role')::rol_usuario,
    (NEW.raw_user_meta_data->>'rol')::rol_usuario,
    'member'::rol_usuario
  );
  
  -- Insertar perfil con manejo de conflictos
  INSERT INTO public.perfiles (id, nombre_usuario, nombre_completo, rol)
  VALUES (NEW.id, v_nombre_usuario, v_nombre_completo, v_rol)
  ON CONFLICT (id) DO UPDATE SET
    nombre_usuario = EXCLUDED.nombre_usuario,
    nombre_completo = COALESCE(EXCLUDED.nombre_completo, perfiles.nombre_completo),
    rol = COALESCE(EXCLUDED.rol, perfiles.rol),
    actualizado_en = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log del error pero no fallar la creación del usuario
    RAISE WARNING 'Error al crear perfil para usuario %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 3: Crear el trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION manejar_nuevo_usuario();

-- Paso 4: Crear perfiles para usuarios existentes que no tengan perfil
-- (Solo si ya tienes usuarios creados en auth.users)
INSERT INTO perfiles (id, nombre_usuario, nombre_completo, rol)
SELECT 
  au.id,
  COALESCE(
    au.raw_user_meta_data->>'nombre_usuario',
    SPLIT_PART(au.email, '@', 1),
    'usuario_' || SUBSTRING(au.id::TEXT, 1, 8)
  ) AS nombre_usuario,
  COALESCE(
    au.raw_user_meta_data->>'nombre_completo',
    au.raw_user_meta_data->>'name',
    SPLIT_PART(au.email, '@', 1)
  ) AS nombre_completo,
  COALESCE(
    (au.raw_user_meta_data->>'role')::rol_usuario,
    (au.raw_user_meta_data->>'rol')::rol_usuario,
    'member'::rol_usuario
  ) AS rol
FROM auth.users au
WHERE au.id NOT IN (SELECT id FROM perfiles)
ON CONFLICT (id) DO NOTHING;

-- Paso 5: Verificar que el trigger esté activo
SELECT 
  trigger_name,
  event_object_table,
  action_statement,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Paso 6: Verificar usuarios sin perfil (debería estar vacío después de ejecutar este script)
SELECT 
  au.id,
  au.email,
  au.raw_user_meta_data
FROM auth.users au
WHERE au.id NOT IN (SELECT id FROM perfiles);

