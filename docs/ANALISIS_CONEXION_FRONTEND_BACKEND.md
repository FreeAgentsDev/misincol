# Análisis Profundo: Estado de Conexión Frontend-Backend

**Fecha:** 2025-01-13  
**Versión:** 1.0  
**Estado:** ⚠️ **PARCIALMENTE CONECTADO**

---

## 📊 Resumen Ejecutivo

El proyecto **Misincol** tiene una **conexión parcial** entre el frontend (Next.js) y el backend (Supabase). La autenticación está completamente integrada, pero **todas las vistas de datos están usando datos mock** en lugar de consultas reales a Supabase.

### Estado Actual

| Componente | Estado | Detalles |
|------------|--------|----------|
| **Autenticación** | ✅ **CONECTADO** | Login, logout, sesiones funcionando con Supabase Auth |
| **Perfiles de Usuario** | ⚠️ **PARCIAL** | Carga de perfil funciona, pero hay problemas con RLS |
| **Dashboard SuperAdmin** | ❌ **MOCK DATA** | Usa `loadDashboardMetrics()` de `mock-data.ts` |
| **Dashboard Leader** | ❌ **MOCK DATA** | Usa `loadTeams()` de `mock-data.ts` |
| **Gestión de Equipos** | ❌ **MOCK DATA** | Todas las vistas usan datos del CSV |
| **Planes de Desarrollo** | ❌ **MOCK DATA** | No hay consultas a `planes_desarrollo` |
| **Actividades** | ❌ **MOCK DATA** | No hay consultas a `actividades` |
| **Métricas** | ❌ **MOCK DATA** | No usa función RPC `obtener_metricas_dashboard_equipo()` |
| **Funciones Helper** | ✅ **CREADAS** | `supabase-queries.ts` existe pero no se usa |

---

## 🔍 Análisis Detallado por Componente

### 1. Autenticación (`/app/login/page.tsx`)

**Estado:** ✅ **FUNCIONAL**

**Implementación:**
- ✅ Usa `supabase.auth.signInWithPassword()` correctamente
- ✅ Construye emails sintéticos (`username@misincol.local`)
- ✅ Carga perfiles desde tabla `perfiles` usando `loadUserProfile()`
- ✅ Maneja errores y timeouts
- ✅ Botones de usuarios demo funcionan

**Problemas Conocidos:**
- ⚠️ Timeout al cargar perfil (posible problema de RLS)
- ⚠️ Necesita verificar que perfiles existan en la BD

**Archivos Relacionados:**
- `frontend/src/context/auth-context.tsx` - Contexto de autenticación
- `frontend/src/lib/supabase.ts` - Cliente de Supabase
- `frontend/src/app/login/page.tsx` - Página de login

---

### 2. Dashboard SuperAdmin (`/app/superadmin/dashboard/page.tsx`)

**Estado:** ❌ **USANDO MOCK DATA**

**Código Actual:**
```typescript
import { loadDashboardMetrics } from "@/lib/mock-data";

export default async function SuperAdminDashboard() {
  const metrics = await loadDashboardMetrics(); // ❌ Mock data
  // ...
}
```

**Lo que DEBERÍA hacer:**
```typescript
import { getDashboardMetrics } from "@/lib/supabase-queries";

export default async function SuperAdminDashboard() {
  const metrics = await getDashboardMetrics(); // ✅ Real data
  // ...
}
```

**Backend Disponible:**
- ✅ Función RPC: `obtener_metricas_dashboard_equipo()` (definida en backend)
- ✅ Función helper: `getDashboardMetrics()` (ya existe en `supabase-queries.ts`)
- ✅ Políticas RLS configuradas para superadmin

**Acción Requerida:**
- Reemplazar `loadDashboardMetrics()` por `getDashboardMetrics()`
- Manejar errores de conexión
- Agregar estados de carga

---

### 3. Dashboard Leader (`/app/leader/dashboard/page.tsx`)

**Estado:** ❌ **USANDO MOCK DATA**

**Código Actual:**
```typescript
import { loadTeams } from "@/lib/mock-data";

export default async function LeaderDashboard({ searchParams }: Props) {
  const teams = await loadTeams(); // ❌ Mock data
  const teamId = typeof searchParams?.team === "string" 
    ? searchParams.team 
    : teams[0]?.id;
  const team = teams.find((entry) => entry.id === teamId) ?? teams[0];
  // ...
}
```

**Problemas:**
1. Usa `loadTeams()` que carga TODOS los equipos del CSV
2. No filtra por `teamId` del usuario autenticado
3. No usa `getEquipoById()` ni `getPlanActivo()` de Supabase

**Lo que DEBERÍA hacer:**
```typescript
import { useAuth } from "@/context/auth-context";
import { getEquipoById, getPlanActivo, getActividadesByPlan } from "@/lib/supabase-queries";

export default async function LeaderDashboard({ searchParams }: Props) {
  const { user } = useAuth(); // Obtener desde server component
  const teamId = user?.teamId || searchParams?.team;
  
  if (!teamId) {
    return <Error>No hay equipo asignado</Error>;
  }
  
  const team = await getEquipoById(teamId);
  const activePlan = await getPlanActivo(teamId);
  const activities = activePlan 
    ? await getActividadesByPlan(activePlan.id)
    : [];
  // ...
}
```

**Backend Disponible:**
- ✅ Tabla `equipos` con políticas RLS para líderes
- ✅ Tabla `planes_desarrollo` con filtro por `id_equipo`
- ✅ Tabla `actividades` con filtro por `id_plan`
- ✅ Función helper: `getEquipoById()`, `getPlanActivo()`, `getActividadesByPlan()`

**Acción Requerida:**
- Obtener `teamId` del usuario autenticado
- Usar consultas reales de Supabase
- Manejar casos donde no hay plan activo

---

### 4. Gestión de Equipos (`/app/superadmin/manage/page.tsx`)

**Estado:** ❌ **USANDO MOCK DATA**

**Código Actual:**
```typescript
import { loadTeams } from "@/lib/mock-data";

export default async function SuperAdminManage() {
  const teams = await loadTeams(); // ❌ Mock data
  // ...
}
```

**Lo que DEBERÍA hacer:**
```typescript
import { getEquipos } from "@/lib/supabase-queries";

export default async function SuperAdminManage() {
  const teams = await getEquipos(); // ✅ Real data
  // ...
}
```

**Backend Disponible:**
- ✅ Función helper: `getEquipos()` (ya existe)
- ✅ Políticas RLS permiten a superadmin ver todos los equipos
- ✅ Función RPC: `crear_equipo_completo()` para crear equipos

**Acción Requerida:**
- Reemplazar `loadTeams()` por `getEquipos()`
- Implementar creación de equipos usando `crear_equipo_completo()`
- Implementar edición usando `updateEquipo()`

---

### 5. Planes de Desarrollo

**Archivos Afectados:**
- `/app/superadmin/plans/page.tsx`
- `/app/superadmin/plans/[planId]/page.tsx`
- `/app/leader/plans/page.tsx`
- `/app/leader/plans/[planId]/page.tsx`

**Estado:** ❌ **TODOS USANDO MOCK DATA**

**Código Actual:**
```typescript
import { loadTeams, loadPlanById } from "@/lib/mock-data";
```

**Lo que DEBERÍA hacer:**
```typescript
import { 
  getPlanesByEquipo, 
  getPlanCompleto,
  getActividadesByPlan 
} from "@/lib/supabase-queries";
```

**Backend Disponible:**
- ✅ Tabla `planes_desarrollo` con todas las columnas necesarias
- ✅ Relación con `objetivos_area` y `actividades`
- ✅ Función RPC: `duplicar_plan()` para duplicar planes
- ✅ Políticas RLS configuradas

**Acción Requerida:**
- Reemplazar todas las llamadas a `loadPlanById()` por `getPlanCompleto()`
- Implementar creación de planes usando `createPlan()`
- Implementar duplicación usando `duplicar_plan()` RPC

---

### 6. Actividades

**Archivos Afectados:**
- `/app/leader/activities/page.tsx`
- `/app/leader/plans/[planId]/activities/[activityId]/page.tsx`
- `/app/superadmin/plans/[planId]/activities/[activityId]/page.tsx`

**Estado:** ❌ **TODOS USANDO MOCK DATA**

**Backend Disponible:**
- ✅ Tabla `actividades` con todas las columnas
- ✅ Relación con `asignaciones_actividad` y `actualizaciones_actividad`
- ✅ Funciones helper: `getActividadesByPlan()`, `getActividadCompleta()`, `createActividad()`, `updateActividad()`
- ✅ Políticas RLS configuradas

**Acción Requerida:**
- Reemplazar todas las llamadas a mock data
- Implementar CRUD completo de actividades
- Agregar asignaciones de miembros a actividades

---

### 7. Miembros de Equipo

**Archivos Afectados:**
- `/app/leader/members/page.tsx`
- `/app/superadmin/teams/[teamId]/members/page.tsx`

**Estado:** ❌ **USANDO MOCK DATA**

**Backend Disponible:**
- ✅ Tabla `miembros_equipo` con relación a `perfiles`
- ✅ Función helper: `getMiembrosEquipo()`
- ✅ Políticas RLS configuradas

**Acción Requerida:**
- Reemplazar mock data por `getMiembrosEquipo()`
- Implementar agregar/remover miembros
- Implementar actualización de roles

---

## 📁 Archivos de Código Relevantes

### Frontend - Mock Data (A ELIMINAR/REEMPLAZAR)
```
frontend/src/lib/mock-data.ts          # ❌ Eliminar después de migración
frontend/public/mock-data.csv          # ⚠️ Mantener como referencia
```

### Frontend - Supabase (YA EXISTEN, NO SE USAN)
```
frontend/src/lib/supabase.ts          # ✅ Cliente de Supabase
frontend/src/lib/supabase-queries.ts  # ✅ Funciones helper (NO SE USAN)
frontend/src/lib/database.types.ts    # ✅ Tipos TypeScript generados
```

### Backend - Documentación
```
docs/backend-supabase-paso-a-paso.md  # ✅ Guía completa del backend
docs/backend-frontend-relacion.md     # ✅ Relación frontend-backend
```

---

## 🔧 Funciones Helper Disponibles (NO SE USAN)

El archivo `supabase-queries.ts` contiene todas las funciones necesarias:

### Equipos
- ✅ `getEquipos()` - Obtener todos los equipos
- ✅ `getEquipoById(id)` - Obtener equipo por ID
- ✅ `getEquipoConLider(id)` - Obtener equipo con información del líder
- ✅ `createEquipo(equipo)` - Crear nuevo equipo
- ✅ `updateEquipo(update)` - Actualizar equipo

### Planes de Desarrollo
- ✅ `getPlanesByEquipo(equipoId)` - Obtener planes de un equipo
- ✅ `getPlanActivo(equipoId)` - Obtener plan activo
- ✅ `getPlanCompleto(planId)` - Obtener plan con actividades y objetivos
- ✅ `createPlan(plan)` - Crear nuevo plan
- ✅ `updatePlan(update)` - Actualizar plan

### Actividades
- ✅ `getActividadesByPlan(planId)` - Obtener actividades de un plan
- ✅ `getActividadesByEquipo(equipoId)` - Obtener actividades de un equipo
- ✅ `getActividadCompleta(actividadId)` - Obtener actividad con asignaciones
- ✅ `createActividad(actividad)` - Crear nueva actividad
- ✅ `updateActividad(update)` - Actualizar actividad
- ✅ `deleteActividad(actividadId)` - Eliminar actividad

### Métricas
- ✅ `getMetricasEquipo(equipoId)` - Obtener métricas de un equipo
- ✅ `getDashboardMetrics()` - Obtener métricas para dashboard (usa RPC)

### Miembros
- ✅ `getMiembrosEquipo(equipoId)` - Obtener miembros de un equipo

### Perfiles
- ✅ `getPerfil(userId)` - Obtener perfil de usuario

---

## 🎯 Funciones RPC Disponibles en Backend

### 1. `obtener_metricas_dashboard_equipo()`
**Uso:** Dashboard SuperAdmin  
**Estado:** ✅ Definida en backend, ❌ No se usa en frontend  
**Implementación en frontend:**
```typescript
const { data, error } = await supabase.rpc('obtener_metricas_dashboard_equipo');
```

### 2. `duplicar_plan(p_id_plan, p_new_name, p_new_fecha_inicio, p_new_fecha_fin)`
**Uso:** Duplicar planes de desarrollo  
**Estado:** ✅ Definida en backend, ❌ No se usa en frontend  
**Implementación en frontend:**
```typescript
const { data, error } = await supabase.rpc('duplicar_plan', {
  p_id_plan: planId,
  p_new_name: 'Nuevo Plan',
  p_new_fecha_inicio: '2025-01-01',
  p_new_fecha_fin: '2025-12-31'
});
```

### 3. `crear_equipo_completo(...)`
**Uso:** Crear equipo con líder y miembros  
**Estado:** ✅ Definida en backend, ❌ No se usa en frontend  
**Implementación en frontend:**
```typescript
const { data, error } = await supabase.rpc('crear_equipo_completo', {
  p_nombre_equipo: 'Nuevo Equipo',
  p_presupuesto_asignado: 1000000,
  p_crear_nuevo_lider: false,
  p_id_lider_existente: leaderId,
  // ... más parámetros
});
```

---

## ⚠️ Problemas Conocidos

### 1. Políticas RLS (Row Level Security)
**Problema:** Algunas consultas pueden fallar por políticas RLS mal configuradas.  
**Síntoma:** Timeout al cargar perfil, errores 403/406 en consultas.  
**Solución:** Verificar que todas las políticas RLS estén aplicadas según `backend-supabase-paso-a-paso.md` Paso 3.

### 2. Perfiles Faltantes
**Problema:** Usuarios en `auth.users` sin registro en `perfiles`.  
**Síntoma:** Login exitoso pero error al cargar perfil.  
**Solución:** Ejecutar script `crear-perfiles-usuarios.sql` o verificar trigger `on_auth_user_created`.

### 3. Datos de Prueba
**Problema:** Base de datos puede estar vacía.  
**Solución:** Ejecutar scripts de seed data del Paso 7 de `backend-supabase-paso-a-paso.md`.

---

## 📊 Matriz de Conexión

| Vista/Componente | Mock Data | Supabase | Estado | Prioridad |
|------------------|-----------|----------|--------|-----------|
| Login | ❌ | ✅ | ✅ Funcional | - |
| Dashboard SuperAdmin | ✅ | ❌ | ❌ Mock | 🔴 Alta |
| Dashboard Leader | ✅ | ❌ | ❌ Mock | 🔴 Alta |
| Gestión Equipos | ✅ | ❌ | ❌ Mock | 🔴 Alta |
| Lista Planes | ✅ | ❌ | ❌ Mock | 🟡 Media |
| Detalle Plan | ✅ | ❌ | ❌ Mock | 🟡 Media |
| Actividades | ✅ | ❌ | ❌ Mock | 🟡 Media |
| Miembros | ✅ | ❌ | ❌ Mock | 🟢 Baja |

---

## ✅ Conclusión

El proyecto tiene **toda la infraestructura necesaria** para conectarse al backend:
- ✅ Cliente de Supabase configurado
- ✅ Funciones helper creadas
- ✅ Tipos TypeScript generados
- ✅ Backend completamente configurado
- ✅ Políticas RLS definidas
- ✅ Funciones RPC disponibles

**PERO** el frontend **NO está usando ninguna de estas funciones**. Todas las vistas están usando datos mock del archivo CSV.

**Próximo Paso:** Ver `PLAN_CONEXION_FRONTEND_BACKEND.md` para el plan detallado de migración.

