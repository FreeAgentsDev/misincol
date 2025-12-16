# Configuración de Supabase

## Variables de Entorno

Crea un archivo `.env.local` en la carpeta `frontend/` con las siguientes variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://pbpzyrrmwiblwzlxcpsj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBicHp5cnJtd2libHd6bHhjcHNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNzcyMzYsImV4cCI6MjA3ODY1MzIzNn0.2ylZFI2v7EsrCKbirsSnPRRuDvmxSbnQFmgAcAZAUAY
```

## Autenticación

**Nota importante sobre el login:**

El sistema actual intenta autenticarse usando el nombre de usuario, pero Supabase Auth requiere un email. Tienes dos opciones:

### Opción 1: Usar email real en auth.users
- Cada usuario en `perfiles` debe tener un usuario correspondiente en `auth.users` con el email real
- El email debe estar relacionado con el `nombre_usuario` de alguna manera

### Opción 2: Crear función RPC personalizada (Recomendado)
Crea una función RPC en Supabase que maneje el login por nombre de usuario:

```sql
CREATE OR REPLACE FUNCTION login_with_username(
  p_username TEXT,
  p_password TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_email TEXT;
  v_result JSONB;
BEGIN
  -- Buscar el perfil por nombre de usuario
  SELECT id INTO v_user_id
  FROM perfiles
  WHERE nombre_usuario = p_username;
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Usuario no encontrado');
  END IF;
  
  -- Obtener el email del usuario desde auth.users
  SELECT email INTO v_email
  FROM auth.users
  WHERE id = v_user_id;
  
  IF v_email IS NULL THEN
    RETURN jsonb_build_object('error', 'Usuario sin email configurado');
  END IF;
  
  -- Retornar el email para que el frontend haga el login
  RETURN jsonb_build_object('email', v_email);
END;
$$;
```

Luego actualiza `auth-context.tsx` para usar esta función antes de hacer el login.

## Estructura de Tablas

Asegúrate de que las siguientes tablas existan en Supabase con estos nombres exactos:

- `perfiles` - Perfiles de usuario
- `equipos` - Equipos de trabajo
- `miembros_equipo` - Miembros de equipos
- `metricas_equipo` - Métricas de equipos
- `planes_desarrollo` - Planes de desarrollo
- `objetivos_area` - Objetivos por área
- `actividades` - Actividades
- `asignaciones_actividad` - Asignaciones de actividades
- `actualizaciones_actividad` - Actualizaciones de actividades
- `asignaciones_presupuesto` - Asignaciones presupuestales
- `historial_plan` - Historial de planes
- `lecciones_plan` - Lecciones aprendidas

## Verificación

1. Asegúrate de que las políticas RLS estén configuradas correctamente
2. Verifica que los nombres de las columnas coincidan con los esperados en `supabase-services.ts`
3. Prueba las consultas básicas desde el SQL Editor de Supabase

## Próximos Pasos

- [ ] Configurar autenticación por nombre de usuario (función RPC)
- [ ] Verificar que todas las relaciones entre tablas funcionen correctamente
- [ ] Probar las consultas desde el frontend
- [ ] Ajustar los mapeos si los nombres de columnas son diferentes

