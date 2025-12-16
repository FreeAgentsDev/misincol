# Guía de Autenticación con Supabase

Esta guía explica cómo funciona el sistema de autenticación en el frontend con Supabase.

## 🔐 Flujo de Autenticación

### 1. Login con Email y Contraseña

El sistema usa el método estándar de Supabase: `signInWithPassword`.

#### Llamada desde el Frontend

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: "usuario@misincol.local",  // o email completo
  password: "contraseña123"
});
```

#### Formato de Email

- **Email directo**: Si el usuario ingresa `superadmin@misincol.local`, se usa tal cual
- **Username**: Si el usuario ingresa `superadmin`, se construye como `superadmin@misincol.local`

#### Respuesta de Supabase

```typescript
{
  data: {
    user: {
      id: "uuid-del-usuario",
      email: "superadmin@misincol.local",
      email_confirmed_at: "2025-01-15T10:30:00Z",
      // ... otros campos
    },
    session: {
      access_token: "...",
      refresh_token: "...",
      expires_at: 1234567890,
      // ... otros campos
    }
  },
  error: null  // o un objeto de error si falla
}
```

### 2. Carga del Perfil

Después de autenticarse exitosamente, el sistema carga el perfil desde la tabla `perfiles`:

```typescript
const { data: perfil } = await supabase
  .from("perfiles")
  .select("nombre_usuario, nombre_completo, rol, id_equipo")
  .eq("id", user.id)
  .single();
```

### 3. Manejo de Sesión

Supabase maneja automáticamente:
- **Refresh tokens**: Renueva la sesión automáticamente
- **Persistencia**: Guarda la sesión en localStorage
- **Sincronización**: Sincroniza la sesión entre pestañas

## 📋 Estructura de Archivos

### `src/context/auth-context.tsx`

Contexto de React que maneja:
- Estado de autenticación (`user`, `session`, `loading`)
- Función `login(usernameOrEmail, password)`
- Función `logout()`
- Carga automática del perfil después del login
- Escucha de cambios de autenticación

### `src/app/login/page.tsx`

Página de login que:
- Muestra formulario de login
- Permite ingresar username o email
- Muestra usuarios disponibles para demo
- Maneja errores y redirecciones

### `src/lib/supabase.ts`

Cliente de Supabase configurado con:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🔄 Flujo Completo

```
1. Usuario ingresa credenciales
   ↓
2. Frontend llama a supabase.auth.signInWithPassword()
   ↓
3. Supabase valida credenciales en auth.users
   ↓
4. Si es exitoso, retorna { user, session }
   ↓
5. Frontend carga perfil desde tabla perfiles
   ↓
6. Frontend actualiza estado con perfil y sesión
   ↓
7. Usuario es redirigido según su rol
```

## 🛠️ Configuración Requerida

### Variables de Entorno

Asegúrate de tener en `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

### Estructura de Base de Datos

1. **Tabla `auth.users`** (manejada por Supabase):
   - `id`: UUID del usuario
   - `email`: Email del usuario (ej: `superadmin@misincol.local`)
   - `encrypted_password`: Contraseña encriptada
   - `raw_user_meta_data`: Metadata del usuario

2. **Tabla `perfiles`** (tu tabla):
   - `id`: UUID que referencia `auth.users(id)`
   - `nombre_usuario`: Nombre de usuario único
   - `nombre_completo`: Nombre completo
   - `rol`: 'superadmin' | 'leader' | 'member'
   - `id_equipo`: UUID del equipo (opcional)

### Trigger Automático

El trigger `on_auth_user_created` crea automáticamente un perfil cuando se crea un usuario en `auth.users`.

## 🚨 Manejo de Errores

### Errores Comunes

1. **"Invalid login credentials"**
   - Usuario o contraseña incorrectos
   - Verifica que el usuario exista en `auth.users`
   - Verifica que la contraseña sea correcta

2. **"Email not confirmed"**
   - El email no ha sido confirmado
   - Desactiva la confirmación de email en Supabase Dashboard o confirma el email

3. **"Error al cargar el perfil"**
   - El usuario existe en `auth.users` pero no tiene perfil en `perfiles`
   - Ejecuta el script `FIX_TRIGGER_LOGIN.sql` para crear perfiles faltantes

4. **"Too many requests"**
   - Demasiados intentos de login
   - Espera unos minutos antes de intentar nuevamente

## 🔍 Debugging

### Logs en Consola

El sistema incluye logs detallados:

- `🔐 [LOGIN]` - Proceso de login
- `📥 [PROFILE]` - Carga de perfil
- `✅` - Operaciones exitosas
- `❌` - Errores

### Verificar Sesión Actual

```typescript
const { data: { session } } = await supabase.auth.getSession();
console.log("Sesión actual:", session);
```

### Verificar Usuario Actual

```typescript
const { data: { user } } = await supabase.auth.getUser();
console.log("Usuario actual:", user);
```

## 📝 Ejemplos de Uso

### Login Básico

```typescript
const { login } = useAuth();

const handleLogin = async () => {
  const result = await login("superadmin", "123456");
  if (result.error) {
    console.error("Error:", result.error);
  }
};
```

### Login con Email Completo

```typescript
const result = await login("superadmin@misincol.local", "123456");
```

### Verificar si el Usuario Está Autenticado

```typescript
const { user, loading } = useAuth();

if (loading) {
  return <div>Cargando...</div>;
}

if (!user) {
  return <div>No autenticado</div>;
}

return <div>Bienvenido, {user.username}!</div>;
```

### Logout

```typescript
const { logout } = useAuth();

const handleLogout = async () => {
  await logout();
  // El usuario será redirigido automáticamente
};
```

## 🔐 Seguridad

### Políticas RLS

Las políticas RLS en la tabla `perfiles` controlan quién puede ver qué:

- **Superadmin**: Puede ver todos los perfiles
- **Leader**: Puede ver perfiles de su equipo
- **Member**: Puede ver su propio perfil

### Tokens

- **Access Token**: Se renueva automáticamente
- **Refresh Token**: Se usa para renovar la sesión
- **Expiración**: Configurada en Supabase Dashboard

## 🚀 Próximos Pasos

### OTP (One-Time Password)

Para implementar login con código OTP:

```typescript
// Enviar código
const { error } = await supabase.auth.signInWithOtp({
  email: "usuario@misincol.local"
});

// Verificar código
const { data, error } = await supabase.auth.verifyOtp({
  email: "usuario@misincol.local",
  token: "código-recibido",
  type: "email"
});
```

### OAuth (Google, GitHub, etc.)

```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: 'https://tu-dominio.com/auth/callback'
  }
});
```

## 📚 Referencias

- [Documentación de Supabase Auth](https://supabase.com/docs/guides/auth)
- [API Reference - signInWithPassword](https://supabase.com/docs/reference/javascript/auth-signinwithpassword)
- [Guía de Backend](./docs/backend-supabase-paso-a-paso.md)

