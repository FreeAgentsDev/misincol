-- ============================================================================
-- GUÍA: Crear usuarios en Supabase Auth y luego crear perfiles
-- ============================================================================
--
-- PASO 1: Crear usuarios en Supabase Auth (Dashboard)
-- ============================================================================
-- Ve a: Authentication > Users > Add user > Create new user
--
-- Usuario 1 - Superadmin:
--   Email: superadmin@misincol.local
--   Password: 123456
--   Auto Confirm User: ✅ Activar
--   User Metadata (Raw JSON):
--     {
--       "nombre_usuario": "superadmin",
--       "nombre_completo": "Super Administrador",
--       "role": "superadmin"
--     }
--
-- Usuario 2 - Líder Barí:
--   Email: lider-bari@misincol.local
--   Password: 123456
--   Auto Confirm User: ✅ Activar
--   User Metadata (Raw JSON):
--     {
--       "nombre_usuario": "lider-bari",
--       "nombre_completo": "Pepe (Líder Barí)",
--       "role": "leader"
--     }
--
-- Usuario 3 - Líder Katíos:
--   Email: lider-katios@misincol.local
--   Password: 123456
--   Auto Confirm User: ✅ Activar
--   User Metadata (Raw JSON):
--     {
--       "nombre_usuario": "lider-katios",
--       "nombre_completo": "Carla (Líder Katíos)",
--       "role": "leader"
--     }
--
-- ============================================================================
-- PASO 2: Obtener los UUIDs de los usuarios creados
-- ============================================================================
-- Ejecuta esta consulta para ver los UUIDs de los usuarios que acabas de crear:
--
-- SELECT id, email, raw_user_meta_data->>'nombre_usuario' as nombre_usuario
-- FROM auth.users
-- WHERE email IN (
--   'superadmin@misincol.local',
--   'lider-bari@misincol.local',
--   'lider-katios@misincol.local'
-- );
--
-- Copia los UUIDs (columna 'id') de cada usuario.
--
-- ============================================================================
-- PASO 3: Crear perfiles (reemplaza los UUIDs con los reales)
-- ============================================================================
-- ⚠️ IMPORTANTE: Reemplaza los UUIDs de abajo con los que obtuviste en el PASO 2

-- Perfil Superadmin
INSERT INTO perfiles (id, nombre_usuario, nombre_completo, rol)
VALUES (
  'REEMPLAZA_CON_UUID_SUPERADMIN'::uuid,  -- ⚠️ Reemplaza con el UUID real
  'superadmin',
  'Super Administrador',
  'superadmin'
)
ON CONFLICT (id) DO UPDATE SET
  nombre_usuario = EXCLUDED.nombre_usuario,
  nombre_completo = EXCLUDED.nombre_completo,
  rol = EXCLUDED.rol;

-- Perfil Líder Barí
INSERT INTO perfiles (id, nombre_usuario, nombre_completo, rol)
VALUES (
  'REEMPLAZA_CON_UUID_LIDER_BARI'::uuid,  -- ⚠️ Reemplaza con el UUID real
  'lider-bari',
  'Pepe (Líder Barí)',
  'leader'
)
ON CONFLICT (id) DO UPDATE SET
  nombre_usuario = EXCLUDED.nombre_usuario,
  nombre_completo = EXCLUDED.nombre_completo,
  rol = EXCLUDED.rol;

-- Perfil Líder Katíos
INSERT INTO perfiles (id, nombre_usuario, nombre_completo, rol)
VALUES (
  'REEMPLAZA_CON_UUID_LIDER_KATIOS'::uuid,  -- ⚠️ Reemplaza con el UUID real
  'lider-katios',
  'Carla (Líder Katíos)',
  'leader'
)
ON CONFLICT (id) DO UPDATE SET
  nombre_usuario = EXCLUDED.nombre_usuario,
  nombre_completo = EXCLUDED.nombre_completo,
  rol = EXCLUDED.rol;

-- ============================================================================
-- PASO 4: Verificar que se crearon correctamente
-- ============================================================================
SELECT 
  id, 
  nombre_usuario, 
  nombre_completo, 
  rol,
  id_equipo
FROM perfiles 
ORDER BY nombre_usuario;

-- ============================================================================
-- NOTA: Si el trigger automático funcionó, los perfiles ya deberían existir
-- ============================================================================
-- Si el trigger `on_auth_user_created` está activo, los perfiles se crean
-- automáticamente cuando creas los usuarios en Auth. En ese caso, este script
-- solo actualiza los datos si ya existen.
--
-- Para verificar si el trigger está activo:
-- SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';


