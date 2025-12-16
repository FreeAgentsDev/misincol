# 🔍 Diagnóstico de Error de Login

## Error: "Invalid login credentials"

Este error significa que Supabase Auth no puede encontrar un usuario con esas credenciales. Aquí están las posibles causas y soluciones:

---

## ✅ Checklist de Verificación

### 1. Verificar Variables de Entorno

Asegúrate de tener un archivo `.env.local` en la carpeta `frontend/` con:

```env
NEXT_PUBLIC_SUPABASE_URL=https://pbpzyrrmwiblwzlxcpsj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBicHp5cnJtd2libHd6bHhjcHNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNzcyMzYsImV4cCI6MjA3ODY1MzIzNn0.2ylZFI2v7EsrCKbirsSnPRRuDvmxSbnQFmgAcAZAUAY
```

**⚠️ IMPORTANTE**: 
- El archivo debe estar en `frontend/.env.local` (no en la raíz)
- Reinicia el servidor de desarrollo después de crear/modificar `.env.local`
- Verifica que no haya espacios extra en las variables

### 2. Verificar que el Usuario Existe en Supabase Auth

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. Ve a **Authentication** → **Users**
3. Busca un usuario con email: `superadmin@misincol.local`
4. Si NO existe, necesitas crearlo (ver paso 3)

### 3. Crear Usuario en Supabase Auth

**Opción A: Desde el Dashboard de Supabase**

1. Ve a **Authentication** → **Users** → **Add user** → **Create new user**
2. Completa:
   - **Email**: `superadmin@misincol.local`
   - **Password**: `123456` (o la que quieras)
   - **Auto Confirm User**: ✅ (marca esta opción para no requerir confirmación de email)
3. Click en **Create user**

**Opción B: Desde SQL (si prefieres)**

```sql
-- Esto NO funciona directamente, debes usar el Dashboard o la API
-- Pero puedes verificar usuarios existentes:
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email LIKE '%@misincol.local';
```

### 4. Verificar que el Perfil Existe en la Tabla `perfiles`

Después de crear el usuario en Auth, verifica que exista el perfil:

```sql
-- Ver usuarios en auth.users
SELECT id, email, email_confirmed_at 
FROM auth.users 
WHERE email = 'superadmin@misincol.local';

-- Ver perfiles correspondientes
SELECT id, nombre_usuario, rol, id_equipo 
FROM perfiles 
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'superadmin@misincol.local'
);
```

**Si el perfil NO existe**, el trigger debería haberlo creado automáticamente. Si no, ejecuta:

```sql
-- Crear perfil manualmente para usuarios existentes
INSERT INTO perfiles (id, nombre_usuario, nombre_completo, rol)
SELECT 
  au.id,
  SPLIT_PART(au.email, '@', 1) AS nombre_usuario,
  SPLIT_PART(au.email, '@', 1) AS nombre_completo,
  'member'::rol_usuario AS rol
FROM auth.users au
WHERE au.email LIKE '%@misincol.local'
  AND au.id NOT IN (SELECT id FROM perfiles)
ON CONFLICT (id) DO NOTHING;
```

### 5. Verificar el Email que se Está Enviando

Abre la consola del navegador y verifica los logs:

```
📧 [LOGIN] Email a usar: superadmin@misincol.local
```

**Debe coincidir exactamente** con el email del usuario en Supabase Auth.

### 6. Verificar la Contraseña

- La contraseña debe ser exactamente la misma que configuraste en Supabase
- Si olvidaste la contraseña, puedes resetearla desde el Dashboard de Supabase

---

## 🛠️ Script de Diagnóstico

Ejecuta este script en el SQL Editor de Supabase para diagnosticar:

```sql
-- 1. Verificar usuarios en auth.users
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  raw_user_meta_data
FROM auth.users
WHERE email LIKE '%@misincol.local'
ORDER BY created_at DESC;

-- 2. Verificar perfiles correspondientes
SELECT 
  p.id,
  p.nombre_usuario,
  p.rol,
  p.id_equipo,
  au.email AS email_auth
FROM perfiles p
JOIN auth.users au ON au.id = p.id
WHERE au.email LIKE '%@misincol.local';

-- 3. Verificar usuarios sin perfil
SELECT 
  au.id,
  au.email,
  'Usuario sin perfil' AS problema
FROM auth.users au
WHERE au.email LIKE '%@misincol.local'
  AND au.id NOT IN (SELECT id FROM perfiles);

-- 4. Verificar trigger
SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

---

## 🔧 Soluciones Rápidas

### Solución 1: Crear Usuario Completo Manualmente

```sql
-- Paso 1: Crear usuario en Auth (debe hacerse desde Dashboard o API)
-- Luego ejecuta esto para crear el perfil:

-- Primero obtén el ID del usuario que acabas de crear
-- Ve a Authentication > Users y copia el ID

-- Luego ejecuta (reemplaza 'UUID_DEL_USUARIO' con el ID real):
INSERT INTO perfiles (id, nombre_usuario, nombre_completo, rol)
VALUES (
  'UUID_DEL_USUARIO'::uuid,
  'superadmin',
  'Super Administrador',
  'superadmin'::rol_usuario
)
ON CONFLICT (id) DO UPDATE SET
  nombre_usuario = EXCLUDED.nombre_usuario,
  rol = EXCLUDED.rol;
```

### Solución 2: Resetear Contraseña

1. Ve a **Authentication** → **Users**
2. Busca el usuario
3. Click en los tres puntos (⋯) → **Reset password**
4. Se enviará un email (o puedes establecer una nueva contraseña directamente)

### Solución 3: Verificar Configuración de Auth

1. Ve a **Authentication** → **Settings**
2. Verifica:
   - **Enable email confirmations**: Puede estar desactivado para desarrollo
   - **Site URL**: Debe estar configurado
   - **Redirect URLs**: Debe incluir tu URL local

---

## 🧪 Prueba de Conexión

Crea un archivo temporal para probar la conexión:

```typescript
// frontend/test-connection.ts (temporal, para probar)
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Probar conexión
async function testConnection() {
  console.log('🔍 Probando conexión con Supabase...');
  console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...');
  
  // Probar login
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'superadmin@misincol.local',
    password: '123456'
  });
  
  if (error) {
    console.error('❌ Error:', error.message);
    console.error('Código:', error.status);
  } else {
    console.log('✅ Login exitoso!');
    console.log('User ID:', data.user.id);
  }
}

testConnection();
```

---

## 📋 Pasos Recomendados

1. ✅ Verifica que `.env.local` existe y tiene las variables correctas
2. ✅ Reinicia el servidor de desarrollo (`npm run dev`)
3. ✅ Verifica que el usuario existe en Supabase Auth
4. ✅ Verifica que el perfil existe en la tabla `perfiles`
5. ✅ Prueba el login con el email completo: `superadmin@misincol.local`
6. ✅ Revisa la consola del navegador para ver los logs detallados

---

## 🆘 Si Nada Funciona

1. **Verifica la URL de Supabase**: Asegúrate de que sea correcta
2. **Verifica la clave anon**: Debe ser la clave "anon public" (no la service_role)
3. **Revisa los logs de Supabase**: Ve a **Logs** → **Auth Logs** en el Dashboard
4. **Prueba con otro usuario**: Crea un usuario nuevo y prueba
5. **Verifica la red**: Asegúrate de que no haya bloqueos de firewall

---

## 📝 Notas Importantes

- El email debe ser **exactamente** `username@misincol.local`
- La contraseña es **case-sensitive** (distingue mayúsculas/minúsculas)
- Si cambias variables de entorno, **reinicia el servidor**
- El trigger crea el perfil automáticamente, pero solo si está configurado correctamente


