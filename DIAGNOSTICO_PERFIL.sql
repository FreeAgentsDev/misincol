-- ============================================================================
-- SCRIPT DE DIAGNÓSTICO: Problema de carga de perfil
-- ============================================================================
-- Este script te ayuda a diagnosticar por qué no se puede cargar el perfil
-- después del login.
--
-- INSTRUCCIONES:
-- 1. Ejecuta este script en el SQL Editor de Supabase
-- 2. Reemplaza 'TU_USER_ID_AQUI' con el ID del usuario que está teniendo problemas
--    (puedes obtenerlo de la consola del navegador cuando intentas hacer login)
-- 3. Revisa los resultados de cada consulta
-- ============================================================================

-- ============================================================================
-- PASO 1: Verificar que el usuario existe en auth.users
-- ============================================================================
-- Reemplaza 'TU_USER_ID_AQUI' con el ID que ves en la consola del navegador
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  raw_user_meta_data->>'nombre_usuario' as nombre_usuario_metadata
FROM auth.users
WHERE id = 'TU_USER_ID_AQUI'::uuid;  -- ⚠️ REEMPLAZA ESTE UUID

-- Si esta consulta no devuelve resultados, el usuario no existe en Auth
-- Solución: Crea el usuario en Authentication > Users del dashboard de Supabase

-- ============================================================================
-- PASO 2: Verificar que el perfil existe en la tabla perfiles
-- ============================================================================
SELECT 
  id,
  nombre_usuario,
  nombre_completo,
  rol,
  id_equipo,
  creado_en
FROM perfiles
WHERE id = 'TU_USER_ID_AQUI'::uuid;  -- ⚠️ REEMPLAZA ESTE UUID

-- Si esta consulta no devuelve resultados, el perfil no existe
-- Solución: Ejecuta el script crear-perfiles-usuarios.sql para crear el perfil

-- ============================================================================
-- PASO 3: Verificar políticas RLS en la tabla perfiles
-- ============================================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'perfiles'
ORDER BY policyname;

-- Deberías ver al menos estas políticas:
-- 1. "Users can view own profile" - permite SELECT WHERE auth.uid() = id
-- 2. "Superadmin can view all perfiles" - permite SELECT para superadmin
-- 3. "Leaders can view team perfiles" - permite SELECT para líderes

-- Si no ves estas políticas, ejecuta el Paso 3.2 del backend-supabase-paso-a-paso.md

-- ============================================================================
-- PASO 4: Verificar que RLS está habilitado
-- ============================================================================
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'perfiles';

-- rowsecurity debe ser 'true'. Si es 'false', ejecuta:
-- ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PASO 5: Probar la consulta como si fueras el usuario autenticado
-- ============================================================================
-- Esta consulta simula lo que hace el frontend cuando intenta cargar el perfil
-- NOTA: Esta consulta solo funcionará si estás autenticado como ese usuario
-- en el dashboard de Supabase (no funciona en SQL Editor directamente)

-- Para probar desde el frontend, abre la consola del navegador y ejecuta:
-- supabase.from('perfiles').select('*').eq('id', 'TU_USER_ID').single()

-- ============================================================================
-- PASO 6: Verificar función helper obtener_rol_usuario()
-- ============================================================================
SELECT 
  proname as function_name,
  prosrc as function_body
FROM pg_proc
WHERE proname = 'obtener_rol_usuario';

-- Si no existe esta función, las políticas RLS que la usan fallarán
-- Solución: Ejecuta el Paso 3.2 del backend-supabase-paso-a-paso.md

-- ============================================================================
-- SOLUCIÓN RÁPIDA: Crear/Actualizar perfil manualmente
-- ============================================================================
-- Si el perfil no existe, ejecuta esto (reemplaza el UUID y los datos):

/*
INSERT INTO perfiles (id, nombre_usuario, nombre_completo, rol, id_equipo)
VALUES (
  'TU_USER_ID_AQUI'::uuid,  -- ⚠️ REEMPLAZA
  'nombre-usuario',         -- ⚠️ REEMPLAZA
  'Nombre Completo',        -- ⚠️ REEMPLAZA
  'superadmin',             -- ⚠️ REEMPLAZA: 'superadmin', 'leader' o 'member'
  NULL                       -- ⚠️ Solo para líderes: UUID del equipo
)
ON CONFLICT (id) DO UPDATE SET
  nombre_usuario = EXCLUDED.nombre_usuario,
  nombre_completo = EXCLUDED.nombre_completo,
  rol = EXCLUDED.rol,
  id_equipo = EXCLUDED.id_equipo;
*/

-- ============================================================================
-- SOLUCIÓN RÁPIDA: Verificar y corregir políticas RLS
-- ============================================================================
-- Si las políticas RLS no están configuradas, ejecuta esto:

/*
-- Eliminar políticas existentes (opcional, solo si quieres empezar de cero)
DROP POLICY IF EXISTS "Users can view own profile" ON perfiles;
DROP POLICY IF EXISTS "Superadmin can view all perfiles" ON perfiles;
DROP POLICY IF EXISTS "Leaders can view team perfiles" ON perfiles;

-- Crear política para que usuarios vean su propio perfil
CREATE POLICY "Users can view own profile"
  ON perfiles FOR SELECT
  USING (auth.uid() = id);

-- Crear política para superadmin (requiere la función obtener_rol_usuario)
CREATE POLICY "Superadmin can view all perfiles"
  ON perfiles FOR SELECT
  USING (obtener_rol_usuario() = 'superadmin');
*/

-- ============================================================================
-- FIN DEL DIAGNÓSTICO
-- ============================================================================

