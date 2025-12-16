# Guía de Login - Misincol

## 📋 Cómo funciona el sistema de autenticación

Según la documentación del backend, el sistema usa **emails sintéticos** para autenticación:

### Formato de Email
- **Email**: `nombre_usuario@misincol.local`
- **Ejemplo**: `superadmin@misincol.local`, `lider-bari@misincol.local`

## 🔐 Crear usuarios en Supabase

### Paso 1: Crear usuario en Supabase Auth

1. Ve a **Supabase Dashboard** > **Authentication** > **Users**
2. Haz clic en **Add user** > **Create new user**
3. Completa:
   - **Email**: `nombre_usuario@misincol.local` (ej: `superadmin@misincol.local`)
   - **Password**: La contraseña que quieras (ej: `123456`)
   - **User Metadata** (opcional, pero recomendado):
     ```json
     {
       "nombre_usuario": "superadmin",
       "nombre_completo": "Super Administrador",
       "role": "superadmin"
     }
     ```

### Paso 2: Verificar que el perfil se creó automáticamente

El trigger `on_auth_user_created` debería crear automáticamente el perfil en la tabla `perfiles`. 

Para verificar:
```sql
SELECT * FROM perfiles WHERE nombre_usuario = 'superadmin';
```

Si no existe, ejecuta:
```sql
UPDATE perfiles SET 
  nombre_usuario = 'superadmin',
  nombre_completo = 'Super Administrador',
  rol = 'superadmin'
WHERE id IN (SELECT id FROM auth.users WHERE email = 'superadmin@misincol.local');
```

## 👥 Usuarios de ejemplo según la documentación

### Superadmin
- **Email en Auth**: `superadmin@misincol.local`
- **Password**: (la que configuraste)
- **Nombre usuario**: `superadmin`
- **Rol**: `superadmin`

### Líder Barí
- **Email en Auth**: `lider-bari@misincol.local`
- **Password**: (la que configuraste)
- **Nombre usuario**: `lider-bari`
- **Rol**: `leader`
- **ID Equipo**: `11111111-1111-1111-1111-111111111111` (según tu CSV)

### Líder Katíos
- **Email en Auth**: `lider-katios@misincol.local`
- **Password**: (la que configuraste)
- **Nombre usuario**: `lider-katios`
- **Rol**: `leader`

## 🚀 Cómo hacer login

1. Abre la página de login
2. Ingresa el **nombre de usuario** (sin el `@misincol.local`)
   - Ejemplo: `superadmin` o `lider-bari`
3. Ingresa la **contraseña** que configuraste en Supabase Auth
4. Haz clic en **Entrar**

El sistema automáticamente:
- Construye el email: `nombre_usuario@misincol.local`
- Autentica con Supabase Auth
- Carga el perfil desde la tabla `perfiles`
- Redirige según el rol del usuario

## ⚠️ Solución de problemas

### Error: "Usuario o contraseña inválidos"
1. Verifica que el usuario exista en **Supabase Auth** con el email correcto
2. Verifica que la contraseña sea correcta
3. Verifica que el perfil exista en la tabla `perfiles`

### Error: "Error al cargar el perfil del usuario"
1. Verifica que el perfil exista en la tabla `perfiles`:
   ```sql
   SELECT * FROM perfiles WHERE id = 'ID_DEL_USUARIO';
   ```
2. Si no existe, créalo manualmente o ejecuta el UPDATE del Paso 2

### Error 406 (Not Acceptable) al cargar usuarios en el login
Necesitas ejecutar una política RLS en Supabase:

```sql
-- Opción rápida: Permitir lectura de perfiles sin autenticación (solo para login)
CREATE POLICY "Allow login by username"
  ON perfiles FOR SELECT
  USING (true);
```

O usa la función RPC más segura (ver `FIX_RLS_POLICIES.sql`)

## 📝 Notas importantes

- El email **siempre** sigue el formato: `nombre_usuario@misincol.local`
- El nombre de usuario debe coincidir exactamente con el campo `nombre_usuario` en la tabla `perfiles`
- La contraseña se valida contra Supabase Auth, no contra la tabla `perfiles`
- El trigger automático crea el perfil cuando se crea un usuario en Auth, pero puede requerir configuración manual si el trigger no está activo



