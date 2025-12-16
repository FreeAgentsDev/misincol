-- Script para verificar y crear usuarios de prueba
-- Ejecuta esto en el SQL Editor de Supabase

-- ============================================
-- PASO 1: Verificar usuarios existentes
-- ============================================

-- Ver todos los usuarios en auth.users
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  raw_user_meta_data
FROM auth.users
WHERE email LIKE '%@misincol.local'
ORDER BY created_at DESC;

-- ============================================
-- PASO 2: Verificar perfiles correspondientes
-- ============================================

SELECT 
  p.id,
  p.nombre_usuario,
  p.nombre_completo,
  p.rol,
  p.id_equipo,
  au.email AS email_auth,
  CASE 
    WHEN au.email_confirmed_at IS NOT NULL THEN '✅ Confirmado'
    ELSE '❌ No confirmado'
  END AS estado_email
FROM perfiles p
JOIN auth.users au ON au.id = p.id
WHERE au.email LIKE '%@misincol.local'
ORDER BY p.nombre_usuario;

-- ============================================
-- PASO 3: Verificar usuarios SIN perfil
-- ============================================

SELECT 
  au.id,
  au.email,
  '⚠️ Usuario sin perfil en tabla perfiles' AS problema
FROM auth.users au
WHERE au.email LIKE '%@misincol.local'
  AND au.id NOT IN (SELECT id FROM perfiles);

-- ============================================
-- PASO 4: Crear perfiles para usuarios existentes sin perfil
-- ============================================

-- Esto crea perfiles para usuarios que existen en auth.users pero no en perfiles
INSERT INTO perfiles (id, nombre_usuario, nombre_completo, rol)
SELECT 
  au.id,
  SPLIT_PART(au.email, '@', 1) AS nombre_usuario,
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
WHERE au.email LIKE '%@misincol.local'
  AND au.id NOT IN (SELECT id FROM perfiles)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- PASO 5: Verificar trigger
-- ============================================

SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- ============================================
-- PASO 6: Lista de usuarios recomendados para crear
-- ============================================

-- Usuarios que deberías tener en Supabase Auth:
-- 1. superadmin@misincol.local (password: 123456)
-- 2. lider-bari@misincol.local (password: 123456)
-- 3. lider-katios@misincol.local (password: 123456)

-- Para crear estos usuarios:
-- 1. Ve a Authentication > Users > Add user > Create new user
-- 2. Email: superadmin@misincol.local
-- 3. Password: 123456
-- 4. Auto Confirm User: ✅ (marca esta opción)
-- 5. User Metadata (opcional):
--    {
--      "nombre_usuario": "superadmin",
--      "nombre_completo": "Super Administrador",
--      "role": "superadmin"
--    }

-- ============================================
-- PASO 7: Actualizar perfiles con roles correctos
-- ============================================

-- Si ya tienes usuarios creados, actualiza sus roles:
UPDATE perfiles 
SET rol = 'superadmin'::rol_usuario
WHERE nombre_usuario = 'superadmin';

UPDATE perfiles 
SET rol = 'leader'::rol_usuario
WHERE nombre_usuario IN ('lider-bari', 'lider-katios');

-- ============================================
-- PASO 8: Verificar resultado final
-- ============================================

SELECT 
  p.nombre_usuario,
  p.rol,
  au.email,
  CASE 
    WHEN au.email_confirmed_at IS NOT NULL THEN '✅ Listo para login'
    ELSE '❌ Email no confirmado'
  END AS estado
FROM perfiles p
JOIN auth.users au ON au.id = p.id
WHERE au.email LIKE '%@misincol.local'
ORDER BY p.rol, p.nombre_usuario;


