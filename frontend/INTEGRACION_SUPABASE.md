# Guía de Integración con Supabase

## ✅ Pasos Completados

1. ✅ Instalado `@supabase/supabase-js` en `package.json`
2. ✅ Creado `src/lib/supabase.ts` con cliente de Supabase
3. ✅ Creado `src/lib/database.types.ts` con todos los tipos TypeScript del esquema
4. ✅ Creado `src/lib/supabase-queries.ts` con funciones helper para consultar Supabase
5. ✅ Actualizado `src/context/auth-context.tsx` para usar Supabase Auth

## 🔧 Pasos Pendientes

### 1. Instalar dependencias

```bash
cd frontend
npm install
```

### 2. Crear archivo `.env.local`

Crea un archivo `.env.local` en la carpeta `frontend/` con las siguientes variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://pbpzyrrmwiblwzlxcpsj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBicHp5cnJtd2libHd6bHhjcHNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNzcyMzYsImV4cCI6MjA3ODY1MzIzNn0.2ylZFI2v7EsrCKbirsSnPRRuDvmxSbnQFmgAcAZAUAY
```

**Nota**: Estos valores ya están en la imagen que compartiste. Si necesitas obtenerlos de nuevo:
- Ve a Supabase Dashboard > Project Settings > API
- Copia `Project URL` y `anon public` key

### 3. Verificar que el backend esté configurado

Asegúrate de que:
- ✅ Las tablas estén creadas en Supabase
- ✅ Las políticas RLS estén configuradas
- ✅ Los usuarios de prueba estén creados en Authentication > Users
- ✅ Los perfiles estén creados en la tabla `perfiles`

### 4. Probar el login

1. Ejecuta `npm run dev`
2. Ve a `http://localhost:3000/login`
3. Intenta iniciar sesión con:
   - Usuario: `superadmin` / Contraseña: `superadmin123` (o la que configuraste)
   - Usuario: `lider-bari` / Contraseña: `lider123`
   - Usuario: `lider-katios` / Contraseña: `lider123`

## 📚 Archivos Creados

### `src/lib/database.types.ts`
Contiene todos los tipos TypeScript basados en el esquema SQL:
- `Perfil`, `Equipo`, `PlanDesarrollo`, `Actividad`, etc.
- Tipos para inserción (`*Insert`) y actualización (`*Update`)
- Enums: `EstadoActividad`, `CategoriaPlan`, `EstadoPlan`, `RolUsuario`

### `src/lib/supabase-queries.ts`
Funciones helper para consultar Supabase:
- `getEquipos()`, `getEquipoById()`, `createEquipo()`, etc.
- `getPlanesByEquipo()`, `getPlanActivo()`, `createPlan()`, etc.
- `getActividadesByPlan()`, `createActividad()`, `updateActividad()`, etc.
- `getDashboardMetrics()` - Métricas agregadas para el dashboard

### `src/lib/supabase.ts`
Cliente de Supabase configurado para usar las variables de entorno.

## 🔄 Próximos Pasos

1. **Actualizar componentes para usar datos reales**:
   - Reemplazar `mock-data.ts` con llamadas a `supabase-queries.ts`
   - Actualizar dashboards para usar `getDashboardMetrics()`
   - Actualizar páginas de actividades para usar `getActividadesByPlan()`

2. **Manejo de errores**:
   - Agregar manejo de errores en los componentes
   - Mostrar mensajes de error amigables al usuario

3. **Optimización**:
   - Usar React Query o SWR para caché y revalidación
   - Implementar loading states
   - Agregar optimistic updates donde sea apropiado

## 🐛 Troubleshooting

### Error: "Module not found: Can't resolve '@supabase/supabase-js'"
**Solución**: Ejecuta `npm install` en la carpeta `frontend/`

### Error: "Missing Supabase environment variables"
**Solución**: Crea el archivo `.env.local` con las variables `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Error: "Invalid login credentials"
**Solución**: 
- Verifica que el usuario exista en Supabase Auth
- Verifica que el perfil esté creado en la tabla `perfiles`
- Usa el email completo: `usuario@misincol.local`

### Error: "permission denied for table"
**Solución**: 
- Verifica que las políticas RLS estén configuradas correctamente
- Verifica que el usuario tenga el rol correcto en la tabla `perfiles`

## 📖 Referencias

- [Documentación de Supabase](https://supabase.com/docs)
- [Guía paso a paso del backend](../docs/backend-supabase-paso-a-paso.md)
- [Esquema de base de datos](../docs/diagrama-base-datos.md)

