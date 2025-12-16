# 🔧 Solución Rápida: Error "Invalid login credentials"

## ⚠️ Problema

El error "Invalid login credentials" significa que **el usuario no existe en Supabase Auth** o la contraseña es incorrecta.

---

## ✅ Solución Paso a Paso

### Paso 1: Crear Usuario en Supabase Auth

1. **Ve a tu proyecto en Supabase**: https://supabase.com/dashboard/project/pbpzyrrmwiblwzlxcpsj
2. **Ve a Authentication** → **Users** (menú lateral izquierdo)
3. **Click en "Add user"** → **"Create new user"**
4. **Completa el formulario**:
   - **Email**: `superadmin@misincol.local`
   - **Password**: `123456` (o la que prefieras, pero recuerda usarla en el login)
   - **Auto Confirm User**: ✅ **Marca esta opción** (importante para no requerir confirmación de email)
   - **User Metadata** (opcional, pero recomendado):
     ```json
     {
       "nombre_usuario": "superadmin",
       "nombre_completo": "Super Administrador",
       "role": "superadmin"
     }
     ```
5. **Click en "Create user"**

### Paso 2: Verificar que el Perfil se Creó Automáticamente

Después de crear el usuario, el trigger debería crear automáticamente el perfil. Verifica:

1. **Ve a SQL Editor** en Supabase
2. **Ejecuta este query**:

```sql
-- Verificar que el usuario existe
SELECT id, email, email_confirmed_at 
FROM auth.users 
WHERE email = 'superadmin@misincol.local';

-- Verificar que el perfil existe
SELECT id, nombre_usuario, rol 
FROM perfiles 
WHERE nombre_usuario = 'superadmin';
```

### Paso 3: Si el Perfil NO se Creó Automáticamente

Si el trigger no funcionó, crea el perfil manualmente:

```sql
-- Primero obtén el ID del usuario que acabas de crear
-- Ve a Authentication > Users y copia el "User UID"

-- Luego ejecuta esto (reemplaza 'UUID_AQUI' con el UUID real):
INSERT INTO perfiles (id, nombre_usuario, nombre_completo, rol)
SELECT 
  au.id,
  'superadmin' AS nombre_usuario,
  'Super Administrador' AS nombre_completo,
  'superadmin'::rol_usuario AS rol
FROM auth.users au
WHERE au.email = 'superadmin@misincol.local'
ON CONFLICT (id) DO UPDATE SET
  nombre_usuario = EXCLUDED.nombre_usuario,
  nombre_completo = EXCLUDED.nombre_completo,
  rol = EXCLUDED.rol;
```

### Paso 4: Probar el Login

1. **Reinicia el servidor de desarrollo** (si está corriendo):
   ```bash
   # Detén el servidor (Ctrl+C) y vuelve a iniciarlo
   npm run dev
   ```

2. **Ve a la página de login**: http://localhost:3000/login

3. **Intenta hacer login**:
   - **Usuario**: `superadmin` (o `superadmin@misincol.local`)
   - **Contraseña**: La que configuraste en el Paso 1

---

## 🔍 Verificación Rápida

Ejecuta este script en el SQL Editor de Supabase para verificar todo:

```sql
-- Verificar usuarios y perfiles
SELECT 
  au.email,
  au.email_confirmed_at,
  p.nombre_usuario,
  p.rol,
  CASE 
    WHEN p.id IS NULL THEN '❌ Sin perfil'
    WHEN au.email_confirmed_at IS NULL THEN '⚠️ Email no confirmado'
    ELSE '✅ Listo'
  END AS estado
FROM auth.users au
LEFT JOIN perfiles p ON p.id = au.id
WHERE au.email LIKE '%@misincol.local'
ORDER BY au.created_at DESC;
```

**Resultado esperado**:
- Debe mostrar al menos un usuario con email `superadmin@misincol.local`
- El estado debe ser "✅ Listo"
- Debe tener `nombre_usuario = 'superadmin'` y `rol = 'superadmin'`

---

## 🚨 Errores Comunes

### Error: "Email not confirmed"
**Solución**: Al crear el usuario, marca "Auto Confirm User" ✅

### Error: "User already registered"
**Solución**: El usuario ya existe. Usa la contraseña correcta o resetea la contraseña desde Authentication > Users

### Error: "relation 'perfiles' does not exist"
**Solución**: La tabla perfiles no existe. Ejecuta el SQL del documento `backend-supabase-paso-a-paso.md` primero

### Error: "new row violates row-level security policy"
**Solución**: Las políticas RLS están bloqueando. Verifica que existan las políticas correctas (ver `FIX_RLS_POLICIES.sql`)

---

## 📝 Checklist Final

- [ ] Usuario creado en Supabase Auth con email `superadmin@misincol.local`
- [ ] Contraseña configurada (ej: `123456`)
- [ ] "Auto Confirm User" marcado ✅
- [ ] Perfil creado en tabla `perfiles` (automático o manual)
- [ ] Variables de entorno configuradas en `.env.local`
- [ ] Servidor de desarrollo reiniciado
- [ ] Login probado con username `superadmin` y la contraseña configurada

---

## 🎯 Próximos Usuarios

Una vez que funcione el superadmin, crea estos usuarios adicionales:

1. **lider-bari@misincol.local** (password: `123456`, role: `leader`)
2. **lider-katios@misincol.local** (password: `123456`, role: `leader`)

Sigue el mismo proceso del Paso 1 para cada uno.

---

## 💡 Tip

Si quieres ver exactamente qué está pasando, abre la **consola del navegador** (F12) y revisa los logs. Verás:
- `📧 [LOGIN] Email a usar: superadmin@misincol.local`
- `🚀 [LOGIN] Enviando petición a Supabase Auth...`
- `❌ [LOGIN] Error de autenticación:` (si hay error)

Esto te ayudará a diagnosticar el problema exacto.


