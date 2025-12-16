-- ============================================
-- SOLUCIÓN RÁPIDA: Error 406 al cargar usuarios
-- ============================================
-- Este script permite que la página de login pueda cargar usuarios
-- sin necesidad de estar autenticado

-- IMPORTANTE: Ejecuta este script en el SQL Editor de Supabase

-- Opción 1: Política simple que permite leer perfiles sin autenticación
-- (Solo para SELECT, no permite modificar)
CREATE POLICY IF NOT EXISTS "Allow public read for login page"
  ON perfiles FOR SELECT
  USING (true);

-- ============================================
-- Si ya existe una política con ese nombre, elimínala primero:
-- ============================================
-- DROP POLICY IF EXISTS "Allow public read for login page" ON perfiles;
-- 
-- Luego ejecuta el CREATE POLICY de arriba

-- ============================================
-- Verificar que la política se creó correctamente:
-- ============================================
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd
-- FROM pg_policies
-- WHERE tablename = 'perfiles'
-- AND policyname = 'Allow public read for login page';

-- ============================================
-- NOTA DE SEGURIDAD:
-- ============================================
-- Esta política permite leer TODOS los perfiles sin autenticación.
-- Esto es necesario para mostrar la lista de usuarios en el login.
-- 
-- Si prefieres algo más restrictivo, puedes:
-- 1. No mostrar la lista de usuarios en el login
-- 2. Usar una función RPC con SECURITY DEFINER que solo retorne nombre_usuario y rol
-- 3. Crear una vista pública con información limitada



