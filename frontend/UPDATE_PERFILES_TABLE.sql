-- Script para agregar campos adicionales a la tabla perfiles
-- Ejecuta este script en el SQL Editor de Supabase si necesitas los campos adicionales

-- Agregar columna email (si no existe)
ALTER TABLE perfiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Agregar columna country (si no existe)
ALTER TABLE perfiles 
ADD COLUMN IF NOT EXISTS country TEXT;

-- Agregar columna accepted_terms (si no existe)
ALTER TABLE perfiles 
ADD COLUMN IF NOT EXISTS accepted_terms BOOLEAN DEFAULT FALSE;

-- Agregar columna referral_code (si no existe)
ALTER TABLE perfiles 
ADD COLUMN IF NOT EXISTS referral_code TEXT;

-- Crear índice en email si es necesario
CREATE INDEX IF NOT EXISTS idx_perfiles_email ON perfiles(email);

-- Crear índice en referral_code si es necesario
CREATE INDEX IF NOT EXISTS idx_perfiles_referral_code ON perfiles(referral_code);

-- Actualizar email para usuarios existentes (usando el email de auth.users)
UPDATE perfiles p
SET email = (
  SELECT email 
  FROM auth.users 
  WHERE id = p.id
)
WHERE email IS NULL;

-- Comentarios
COMMENT ON COLUMN perfiles.email IS 'Email del usuario (sincronizado con auth.users)';
COMMENT ON COLUMN perfiles.country IS 'País del usuario';
COMMENT ON COLUMN perfiles.accepted_terms IS 'Indica si el usuario aceptó los términos y condiciones';
COMMENT ON COLUMN perfiles.referral_code IS 'Código de referido del usuario';

