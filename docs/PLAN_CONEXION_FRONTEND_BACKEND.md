# Plan de Conexión Frontend-Backend

**Fecha:** 2025-01-13  
**Versión:** 1.0  
**Objetivo:** Migrar completamente el frontend de mock data a Supabase

---

## 📋 Resumen del Plan

Este documento detalla el plan paso a paso para conectar todas las vistas del frontend con el backend de Supabase, reemplazando los datos mock por consultas reales.

### Fases del Plan

1. **Fase 1: Preparación y Verificación** (1-2 horas)
2. **Fase 2: Dashboard SuperAdmin** (2-3 horas)
3. **Fase 3: Dashboard Leader** (2-3 horas)
4. **Fase 4: Gestión de Equipos** (3-4 horas)
5. **Fase 5: Planes de Desarrollo** (4-5 horas)
6. **Fase 6: Actividades** (3-4 horas)
7. **Fase 7: Miembros y Perfiles** (2-3 horas)
8. **Fase 8: Testing y Validación** (2-3 horas)

**Tiempo Total Estimado:** 19-27 horas

---

## 🔧 Fase 1: Preparación y Verificación

### Objetivo
Verificar que el backend esté completamente configurado y listo para recibir consultas.

### Tareas

#### 1.1 Verificar Variables de Entorno
```bash
# Verificar que .env.local existe y tiene las variables correctas
cat frontend/.env.local

# Debe contener:
# NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

#### 1.2 Verificar Backend en Supabase
Ejecutar en SQL Editor de Supabase:

```sql
-- 1. Verificar que las tablas existen
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Debe mostrar: equipos, perfiles, planes_desarrollo, actividades, etc.

-- 2. Verificar políticas RLS
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

-- 3. Verificar funciones RPC
SELECT proname 
FROM pg_proc 
WHERE proname IN (
  'obtener_metricas_dashboard_equipo',
  'duplicar_plan',
  'crear_equipo_completo'
);

-- 4. Verificar datos de prueba
SELECT COUNT(*) FROM equipos;
SELECT COUNT(*) FROM perfiles;
SELECT COUNT(*) FROM planes_desarrollo;
```

#### 1.3 Verificar Cliente de Supabase
```typescript
// frontend/src/lib/supabase.ts
// Debe estar correctamente configurado
```

#### 1.4 Crear Script de Prueba
Crear `frontend/scripts/test-connection.ts`:

```typescript
import { supabase } from '../src/lib/supabase';

async function testConnection() {
  console.log('🔍 Probando conexión a Supabase...');
  
  // Test 1: Conexión básica
  const { data, error } = await supabase.from('perfiles').select('count');
  if (error) {
    console.error('❌ Error de conexión:', error);
    return;
  }
  console.log('✅ Conexión exitosa');
  
  // Test 2: Obtener equipos
  const { data: equipos, error: equiposError } = await supabase
    .from('equipos')
    .select('*')
    .limit(5);
  
  if (equiposError) {
    console.error('❌ Error al obtener equipos:', equiposError);
  } else {
    console.log(`✅ Equipos encontrados: ${equipos?.length || 0}`);
  }
  
  // Test 3: Función RPC
  const { data: metrics, error: metricsError } = await supabase
    .rpc('obtener_metricas_dashboard_equipo');
  
  if (metricsError) {
    console.error('❌ Error en RPC:', metricsError);
  } else {
    console.log(`✅ Métricas obtenidas: ${metrics?.length || 0}`);
  }
}

testConnection();
```

**Criterio de Éxito:**
- ✅ Todas las tablas existen
- ✅ Políticas RLS están configuradas
- ✅ Funciones RPC existen
- ✅ Script de prueba ejecuta sin errores

---

## 🎯 Fase 2: Dashboard SuperAdmin

### Objetivo
Conectar el dashboard del SuperAdmin con datos reales de Supabase.

### Archivos a Modificar
- `frontend/src/app/superadmin/dashboard/page.tsx`

### Pasos

#### 2.1 Reemplazar Mock Data
```typescript
// ANTES
import { loadDashboardMetrics } from "@/lib/mock-data";
const metrics = await loadDashboardMetrics();

// DESPUÉS
import { getDashboardMetrics } from "@/lib/supabase-queries";
const metrics = await getDashboardMetrics();
```

#### 2.2 Manejar Estados de Carga y Error
```typescript
export default async function SuperAdminDashboard() {
  try {
    const metrics = await getDashboardMetrics();
    
    if (!metrics || metrics.length === 0) {
      return (
        <section className="space-y-9">
          <p className="text-cocoa-600">
            No hay equipos configurados aún.
          </p>
        </section>
      );
    }
    
    // ... resto del código
  } catch (error) {
    console.error('Error al cargar métricas:', error);
    return (
      <section className="space-y-9">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-800">
            Error al cargar los datos. Por favor, intenta nuevamente.
          </p>
        </div>
      </section>
    );
  }
}
```

#### 2.3 Ajustar Tipos de Datos
La función RPC retorna datos con nombres diferentes a los mock:
- `nombre_equipo` en lugar de `name`
- `id_equipo` en lugar de `id`
- `actividades_pendientes_count` en lugar de `pendingActivities`

Ajustar el código para usar los nombres correctos.

#### 2.4 Agregar Loading State (Opcional)
Si se convierte a Client Component:
```typescript
'use client';

import { useEffect, useState } from 'react';

export default function SuperAdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function loadMetrics() {
      try {
        const data = await getDashboardMetrics();
        setMetrics(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  // ... resto del código
}
```

**Criterio de Éxito:**
- ✅ Dashboard muestra datos reales de Supabase
- ✅ Maneja casos de error correctamente
- ✅ Muestra mensaje cuando no hay datos

---

## 👥 Fase 3: Dashboard Leader

### Objetivo
Conectar el dashboard del líder con datos reales de su equipo.

### Archivos a Modificar
- `frontend/src/app/leader/dashboard/page.tsx`

### Pasos

#### 3.1 Obtener Usuario Autenticado
Como es un Server Component, necesitamos obtener el usuario de otra forma:

**Opción A: Usar cookies/session**
```typescript
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export default async function LeaderDashboard({ searchParams }: Props) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
  
  const { data: { user } } = await supabase.auth.getUser();
  // ...
}
```

**Opción B: Convertir a Client Component**
```typescript
'use client';

import { useAuth } from '@/context/auth-context';

export default function LeaderDashboard({ searchParams }: Props) {
  const { user } = useAuth();
  const teamId = user?.teamId || searchParams?.team;
  // ...
}
```

#### 3.2 Reemplazar Mock Data
```typescript
// ANTES
import { loadTeams } from "@/lib/mock-data";
const teams = await loadTeams();
const team = teams.find((entry) => entry.id === teamId);

// DESPUÉS
import { getEquipoById, getPlanActivo, getActividadesByPlan } from "@/lib/supabase-queries";

if (!teamId) {
  return <Error>No hay equipo asignado</Error>;
}

const team = await getEquipoById(teamId);
const activePlan = await getPlanActivo(teamId);
const activities = activePlan 
  ? await getActividadesByPlan(activePlan.id)
  : [];
```

#### 3.3 Ajustar Estructura de Datos
Los datos de Supabase tienen estructura diferente:
- `team.nombre` en lugar de `team.name`
- `activePlan.nombre` en lugar de `activePlan.name`
- `activities` es un array separado, no dentro del plan

Ajustar el código para usar la estructura correcta.

#### 3.4 Calcular Métricas
```typescript
const pendingActivities = activities.filter(a => a.estado === 'Pendiente');
const doneActivities = activities.filter(a => a.estado === 'Hecha');
const progressPercentage = activities.length > 0
  ? Math.round((doneActivities.length / activities.length) * 100)
  : 0;
```

**Criterio de Éxito:**
- ✅ Dashboard muestra datos del equipo del líder
- ✅ Plan activo se carga correctamente
- ✅ Actividades se muestran correctamente
- ✅ Métricas se calculan correctamente

---

## 🏢 Fase 4: Gestión de Equipos

### Objetivo
Conectar todas las vistas de gestión de equipos con Supabase.

### Archivos a Modificar
- `frontend/src/app/superadmin/manage/page.tsx`
- `frontend/src/app/superadmin/teams/[teamId]/page.tsx`
- `frontend/src/app/superadmin/teams/create/page.tsx`

### Pasos

#### 4.1 Lista de Equipos
```typescript
// frontend/src/app/superadmin/manage/page.tsx

// ANTES
import { loadTeams } from "@/lib/mock-data";
const teams = await loadTeams();

// DESPUÉS
import { getEquipos } from "@/lib/supabase-queries";
const teams = await getEquipos();
```

#### 4.2 Detalle de Equipo
```typescript
// frontend/src/app/superadmin/teams/[teamId]/page.tsx

// ANTES
import { loadTeamById } from "@/lib/mock-data";
const team = await loadTeamById(params.teamId);

// DESPUÉS
import { getEquipoConLider, getPlanesByEquipo, getMiembrosEquipo } from "@/lib/supabase-queries";
const team = await getEquipoConLider(params.teamId);
const plans = await getPlanesByEquipo(params.teamId);
const members = await getMiembrosEquipo(params.teamId);
```

#### 4.3 Crear Equipo
```typescript
// frontend/src/app/superadmin/teams/create/page.tsx

'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function CreateTeam() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('crear_equipo_completo', {
        p_nombre_equipo: formData.get('nombre'),
        p_presupuesto_asignado: parseFloat(formData.get('presupuesto')),
        p_crear_nuevo_lider: false,
        p_id_lider_existente: formData.get('liderId'),
        // ... más parámetros
      });
      
      if (error) throw error;
      
      router.push(`/superadmin/teams/${data}`);
    } catch (error) {
      console.error('Error al crear equipo:', error);
      alert('Error al crear equipo');
    } finally {
      setLoading(false);
    }
  };
  
  // ... resto del componente
}
```

#### 4.4 Editar Equipo
```typescript
import { updateEquipo } from '@/lib/supabase-queries';

const handleUpdate = async (teamId: string, updates: EquipoUpdate) => {
  try {
    await updateEquipo({ id: teamId, ...updates });
    router.refresh(); // Recargar datos
  } catch (error) {
    console.error('Error al actualizar equipo:', error);
  }
};
```

**Criterio de Éxito:**
- ✅ Lista de equipos muestra datos reales
- ✅ Detalle de equipo muestra información correcta
- ✅ Crear equipo funciona usando RPC
- ✅ Editar equipo funciona

---

## 📋 Fase 5: Planes de Desarrollo

### Objetivo
Conectar todas las vistas de planes con Supabase.

### Archivos a Modificar
- `frontend/src/app/superadmin/plans/page.tsx`
- `frontend/src/app/superadmin/plans/[planId]/page.tsx`
- `frontend/src/app/leader/plans/page.tsx`
- `frontend/src/app/leader/plans/[planId]/page.tsx`

### Pasos

#### 5.1 Lista de Planes
```typescript
// ANTES
import { loadTeams } from "@/lib/mock-data";
const teams = await loadTeams();
const plans = teams.flatMap(t => t.plans);

// DESPUÉS
import { getEquipos, getPlanesByEquipo } from "@/lib/supabase-queries";

const teams = await getEquipos();
const allPlans = await Promise.all(
  teams.map(team => getPlanesByEquipo(team.id))
);
const plans = allPlans.flat();
```

#### 5.2 Detalle de Plan
```typescript
// ANTES
import { loadPlanById } from "@/lib/mock-data";
const plan = await loadPlanById(params.planId);

// DESPUÉS
import { getPlanCompleto } from "@/lib/supabase-queries";
const plan = await getPlanCompleto(params.planId);
// Esto incluye: plan, objetivos, actividades
```

#### 5.3 Crear Plan
```typescript
import { createPlan } from '@/lib/supabase-queries';

const handleCreate = async (planData: PlanDesarrolloInsert) => {
  try {
    const newPlan = await createPlan(planData);
    router.push(`/leader/plans/${newPlan.id}`);
  } catch (error) {
    console.error('Error al crear plan:', error);
  }
};
```

#### 5.4 Duplicar Plan
```typescript
import { supabase } from '@/lib/supabase';

const handleDuplicate = async (planId: string) => {
  try {
    const { data, error } = await supabase.rpc('duplicar_plan', {
      p_id_plan: planId,
      p_new_name: `Copia de ${plan.nombre}`,
      p_new_fecha_inicio: newStartDate,
      p_new_fecha_fin: newEndDate
    });
    
    if (error) throw error;
    
    router.push(`/leader/plans/${data}`);
  } catch (error) {
    console.error('Error al duplicar plan:', error);
  }
};
```

**Criterio de Éxito:**
- ✅ Lista de planes muestra datos reales
- ✅ Detalle de plan muestra información completa
- ✅ Crear plan funciona
- ✅ Duplicar plan funciona usando RPC

---

## ✅ Fase 6: Actividades

### Objetivo
Conectar todas las vistas de actividades con Supabase.

### Archivos a Modificar
- `frontend/src/app/leader/activities/page.tsx`
- `frontend/src/app/leader/plans/[planId]/activities/[activityId]/page.tsx`
- `frontend/src/app/superadmin/plans/[planId]/activities/[activityId]/page.tsx`

### Pasos

#### 6.1 Lista de Actividades
```typescript
// ANTES
const activities = team.plans.flatMap(p => p.activities);

// DESPUÉS
import { getActividadesByEquipo } from '@/lib/supabase-queries';
const activities = await getActividadesByEquipo(teamId);
```

#### 6.2 Detalle de Actividad
```typescript
// ANTES
const activity = plan.activities.find(a => a.id === activityId);

// DESPUÉS
import { getActividadCompleta } from '@/lib/supabase-queries';
const activity = await getActividadCompleta(activityId);
// Esto incluye: actividad, asignaciones, actualizaciones
```

#### 6.3 Crear/Editar Actividad
```typescript
import { createActividad, updateActividad } from '@/lib/supabase-queries';

const handleCreate = async (activityData: ActividadInsert) => {
  try {
    const newActivity = await createActividad(activityData);
    router.push(`/leader/plans/${planId}/activities/${newActivity.id}`);
  } catch (error) {
    console.error('Error al crear actividad:', error);
  }
};

const handleUpdate = async (activityId: string, updates: ActividadUpdate) => {
  try {
    await updateActividad({ id: activityId, ...updates });
    router.refresh();
  } catch (error) {
    console.error('Error al actualizar actividad:', error);
  }
};
```

#### 6.4 Eliminar Actividad
```typescript
import { deleteActividad } from '@/lib/supabase-queries';

const handleDelete = async (activityId: string) => {
  if (!confirm('¿Estás seguro de eliminar esta actividad?')) return;
  
  try {
    await deleteActividad(activityId);
    router.push(`/leader/plans/${planId}`);
  } catch (error) {
    console.error('Error al eliminar actividad:', error);
  }
};
```

**Criterio de Éxito:**
- ✅ Lista de actividades muestra datos reales
- ✅ Detalle de actividad muestra información completa
- ✅ CRUD de actividades funciona correctamente

---

## 👤 Fase 7: Miembros y Perfiles

### Objetivo
Conectar las vistas de miembros con Supabase.

### Archivos a Modificar
- `frontend/src/app/leader/members/page.tsx`
- `frontend/src/app/superadmin/teams/[teamId]/members/page.tsx`

### Pasos

#### 7.1 Lista de Miembros
```typescript
// ANTES
const members = team.members;

// DESPUÉS
import { getMiembrosEquipo } from '@/lib/supabase-queries';
const members = await getMiembrosEquipo(teamId);
// Esto incluye: miembros con información de perfil
```

#### 7.2 Agregar Miembro
```typescript
import { supabase } from '@/lib/supabase';

const handleAddMember = async (perfilId: string) => {
  try {
    const { error } = await supabase
      .from('miembros_equipo')
      .insert({
        id_equipo: teamId,
        id_perfil: perfilId,
        activo: true
      });
    
    if (error) throw error;
    router.refresh();
  } catch (error) {
    console.error('Error al agregar miembro:', error);
  }
};
```

#### 7.3 Remover Miembro
```typescript
const handleRemoveMember = async (memberId: string) => {
  try {
    const { error } = await supabase
      .from('miembros_equipo')
      .update({ activo: false })
      .eq('id', memberId);
    
    if (error) throw error;
    router.refresh();
  } catch (error) {
    console.error('Error al remover miembro:', error);
  }
};
```

**Criterio de Éxito:**
- ✅ Lista de miembros muestra datos reales
- ✅ Agregar miembro funciona
- ✅ Remover miembro funciona

---

## 🧪 Fase 8: Testing y Validación

### Objetivo
Validar que toda la integración funciona correctamente.

### Tareas

#### 8.1 Testing Manual por Rol

**SuperAdmin:**
- [ ] Login funciona
- [ ] Dashboard muestra métricas reales
- [ ] Puede ver todos los equipos
- [ ] Puede crear equipos
- [ ] Puede editar equipos
- [ ] Puede ver todos los planes
- [ ] Puede ver todas las actividades

**Leader:**
- [ ] Login funciona
- [ ] Dashboard muestra datos de su equipo
- [ ] Puede ver planes de su equipo
- [ ] Puede crear planes
- [ ] Puede duplicar planes
- [ ] Puede ver actividades de su equipo
- [ ] Puede crear/editar actividades
- [ ] Puede ver miembros de su equipo
- [ ] Puede agregar/remover miembros

#### 8.2 Testing de Errores
- [ ] Manejo de errores de conexión
- [ ] Manejo de errores de permisos (RLS)
- [ ] Manejo de datos vacíos
- [ ] Manejo de timeouts

#### 8.3 Testing de Performance
- [ ] Dashboard carga en < 2 segundos
- [ ] Listas de datos cargan en < 1 segundo
- [ ] No hay consultas N+1

#### 8.4 Limpieza
- [ ] Eliminar `mock-data.ts` (o comentar)
- [ ] Eliminar imports de mock data
- [ ] Actualizar comentarios en código
- [ ] Actualizar documentación

---

## 📝 Checklist Final

### Preparación
- [ ] Backend verificado y funcionando
- [ ] Variables de entorno configuradas
- [ ] Cliente de Supabase funcionando

### Migración
- [ ] Dashboard SuperAdmin conectado
- [ ] Dashboard Leader conectado
- [ ] Gestión de Equipos conectada
- [ ] Planes de Desarrollo conectados
- [ ] Actividades conectadas
- [ ] Miembros conectados

### Testing
- [ ] Testing manual completado
- [ ] Errores manejados correctamente
- [ ] Performance aceptable

### Limpieza
- [ ] Mock data eliminado/comentado
- [ ] Código limpio y documentado

---

## 🚨 Problemas Comunes y Soluciones

### Error: "new row violates row-level security policy"
**Causa:** Política RLS bloqueando la operación.  
**Solución:** Verificar que las políticas RLS estén correctamente configuradas según el rol del usuario.

### Error: "relation does not exist"
**Causa:** Tabla no existe en Supabase.  
**Solución:** Ejecutar scripts SQL del `backend-supabase-paso-a-paso.md`.

### Error: "function does not exist"
**Causa:** Función RPC no está creada.  
**Solución:** Ejecutar Paso 4 de `backend-supabase-paso-a-paso.md`.

### Timeout al cargar datos
**Causa:** Consulta muy lenta o problema de conexión.  
**Solución:** 
- Verificar índices en la base de datos
- Optimizar consultas
- Agregar timeouts en el frontend

---

## 📚 Referencias

- `docs/ANALISIS_CONEXION_FRONTEND_BACKEND.md` - Análisis del estado actual
- `docs/backend-supabase-paso-a-paso.md` - Documentación completa del backend
- `frontend/src/lib/supabase-queries.ts` - Funciones helper disponibles
- `frontend/src/lib/database.types.ts` - Tipos TypeScript

---

**Última Actualización:** 2025-01-13

