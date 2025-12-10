-- Crear perfiles para los usuarios creados en Supabase Auth
-- Ejecuta este SQL después de haber creado los usuarios en Authentication > Users

-- Perfil Superadmin
INSERT INTO perfiles (id, nombre_usuario, nombre_completo, rol)
VALUES (
  '6d5af1dd-ed2a-4b02-94e3-e5f5fbac3077'::uuid,
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
  '055fd2f5-156d-4bef-85d1-c8aa56e01118'::uuid,
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
  '95802e35-6448-470c-ab4a-c865cfafb287'::uuid,
  'lider-katios',
  'Carla (Líder Katíos)',
  'leader'
)
ON CONFLICT (id) DO UPDATE SET
  nombre_usuario = EXCLUDED.nombre_usuario,
  nombre_completo = EXCLUDED.nombre_completo,
  rol = EXCLUDED.rol;

-- Verificar que se crearon correctamente
SELECT id, nombre_usuario, nombre_completo, rol FROM perfiles ORDER BY nombre_usuario;


