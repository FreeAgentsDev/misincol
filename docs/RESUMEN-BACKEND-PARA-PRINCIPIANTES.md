# 📚 Resumen del Backend - Guía para Principiantes

¡Hola! 👋 Este documento es un resumen simple de todo el backend del proyecto Misincol. Si estás empezando en backend, este es el lugar perfecto para comenzar.

---

## 🎯 ¿Qué es este documento?

Este es un **resumen simplificado** de los documentos técnicos del backend. Aquí encontrarás:

- ✅ Conceptos básicos explicados de forma simple
- ✅ Qué hace cada parte del sistema
- ✅ Cómo se conecta todo
- ✅ Referencias a documentos más detallados

---

## 📖 Documentos Disponibles

Antes de empezar, aquí están todos los documentos que tenemos:

1. **`backend-supabase-paso-a-paso.md`** - Guía completa paso a paso (MUY DETALLADO)
2. **`diagrama-base-datos.md`** - Diagramas visuales de la base de datos
3. **`backend-frontend-relacion.md`** - Cómo se conectan frontend y backend
4. **`plan-gratuito-supabase.md`** - Verificación de que todo es gratis
5. **`analisis-validacion-backend.md`** - Análisis técnico profundo

**Este documento** es el resumen de todos ellos.

---

## 🤔 ¿Qué es el Backend?

Piensa en el backend como el **"cerebro"** de la aplicación:

- **Frontend** (Next.js) = Lo que el usuario ve y toca
- **Backend** (Supabase) = Donde se guardan los datos y se hacen los cálculos

```
Usuario → Frontend → Backend → Base de Datos
         (Next.js)  (Supabase)  (PostgreSQL)
```

---

## 🏗️ Arquitectura Simple

### ¿Qué es Supabase?

**Supabase** es como un "todo-en-uno" para backend:
- ✅ Base de datos (PostgreSQL)
- ✅ Autenticación de usuarios
- ✅ Seguridad automática
- ✅ API lista para usar

**Ventaja**: No necesitas configurar servidores, todo está listo.

### ¿Qué es PostgreSQL?

**PostgreSQL** es la base de datos (donde guardamos la información):
- Es como Excel, pero mucho más potente
- Guarda datos en "tablas" (como hojas de Excel)
- Las tablas tienen "columnas" (como las columnas A, B, C...)

---

## 📊 ¿Qué Datos Guardamos?

Imagina que tienes que organizar un proyecto con equipos. Necesitas guardar:

### 1. **Usuarios** (`perfiles`)
- Quién es cada persona
- Qué rol tiene (superadmin, líder, miembro)
- A qué equipo pertenece

### 2. **Equipos** (`equipos`)
- Nombre del equipo
- Quién es el líder
- Cuánto presupuesto tiene

### 3. **Planes de Desarrollo** (`planes_desarrollo`)
- Qué planes tiene cada equipo
- En qué categoría está (Investigación, Evangelización, etc.)
- Si está activo, finalizado o archivado
- **Etapas del plan** (ej: ["Fase de diagnóstico", "Fase de ejecución", "Fase de evaluación", "Fase de cierre"])

### 4. **Objetivos de Área** (`objetivos_area`)
- Objetivos por área dentro de un plan
- Tienen un número de orden dentro del área
- **Número de objetivo global** (opcional, para numeración global de objetivos)

### 5. **Actividades** (`actividades`)
- Qué actividades tiene cada plan
- Quién es responsable
- Cuánto presupuesto necesita
- Si está hecha o pendiente
- **Etapa del plan** a la que pertenece (ej: "Fase de diagnóstico", "Fase de ejecución")
- **Número de objetivo global** al que pertenece (opcional)

### 6. **Métricas** (`metricas_equipo`)
- Números importantes del equipo
- Población, iglesias, bautizados, etc.

---

## 🔗 ¿Cómo se Relacionan las Cosas?

Piensa en relaciones familiares:

```
Equipo (Barí)
  ├── Líder (Pepe)
  ├── Miembros (Ana, Luis, Marta)
  ├── Plan Activo (Investigación 2025)
  │   ├── Actividades
  │   │   ├── Cartografiado comunitario
  │   │   └── Taller con sabedores
  │   └── Objetivos
  └── Métricas (población, iglesias, etc.)
```

**Reglas simples**:
- Un equipo tiene UN líder
- Un equipo tiene MUCHOS miembros
- Un equipo tiene MUCHOS planes
- Un plan tiene MUCHAS actividades
- Un equipo tiene UNAS métricas

---

## 🔐 Seguridad: ¿Quién Puede Ver Qué?

### Roles en el Sistema

1. **Superadmin** 👑
   - Puede ver TODO
   - Puede crear/editar/eliminar cualquier cosa
   - Como el "dueño" del sistema

2. **Leader** (Líder) 👤
   - Solo ve SU equipo
   - Puede gestionar planes y actividades de su equipo
   - No puede ver otros equipos

3. **Member** (Miembro) 👥
   - Solo ve información de su equipo
   - Puede ver actividades asignadas
   - No puede editar mucho

### Row Level Security (RLS)

**RLS** = "Seguridad a nivel de fila"

Es como tener un guardia que dice:
- "¿Eres líder del equipo Barí? → Puedes ver datos de Barí"
- "¿Eres líder del equipo Katíos? → NO puedes ver datos de Barí"

**Todo esto es automático** - no necesitas programarlo manualmente.

---

## 💻 ¿Cómo Funciona el Código?

### Frontend → Backend

Cuando el usuario hace algo en el frontend:

```typescript
// 1. Usuario hace click en "Ver mi equipo"
// 2. Frontend hace una "petición" al backend
const { data } = await supabase
  .from('equipos')
  .select('*')
  .eq('id', teamId);

// 3. Backend verifica: "¿Este usuario puede ver este equipo?"
// 4. Si SÍ → devuelve los datos
// 5. Si NO → devuelve error o nada
```

### Ejemplo Real: Login

```
1. Usuario escribe: username="lider-bari", password="123456"
   ↓
2. Frontend envía a Supabase Auth
   ↓
3. Supabase verifica: "¿Existe este usuario? ¿La contraseña es correcta?"
   ↓
4. Si SÍ → Crea una "sesión" (como un ticket de entrada)
   ↓
5. Frontend pregunta: "¿Quién es este usuario?"
   ↓
6. Backend responde: "Es Pepe, líder del equipo Barí"
   ↓
7. Frontend guarda esta info y muestra el dashboard del líder
```

---

## 🛠️ Funciones RPC: ¿Qué Son?

**RPC** = "Remote Procedure Call" (Llamada a Procedimiento Remoto)

Es como tener "funciones especiales" en la base de datos que hacen cálculos complicados.

### Ejemplo: Calcular Métricas del Dashboard

En lugar de hacer esto en el frontend (lento):
```typescript
// ❌ MALO: Hacer muchos cálculos en el frontend
const equipos = await getEquipos();
const planes = await getPlanes();
const actividades = await getActividades();
// ... calcular todo manualmente ...
```

Hacemos esto (rápido):
```typescript
// ✅ BUENO: La base de datos calcula todo
const { data } = await supabase.rpc('obtener_metricas_dashboard_equipo');
// Ya viene todo calculado y listo
```

**Ventajas**:
- ✅ Más rápido (se calcula en la base de datos)
- ✅ Menos código en el frontend
- ✅ Más seguro (la lógica está en el backend)

### Funciones RPC Disponibles

1. **`obtener_metricas_dashboard_equipo()`**
   - Calcula métricas del dashboard para todos los equipos
   - Retorna planes completados, actividades pendientes, presupuestos, etc.

2. **`duplicar_plan(p_id_plan, p_new_name, p_new_fecha_inicio, p_new_fecha_fin)`**
   - Duplica un plan completo con todas sus actividades y objetivos
   - Útil para crear planes similares

3. **`crear_equipo_completo(...)`** ⭐ **NUEVO**
   - Crea un equipo completo con líder y miembros en una sola operación
   - Solo el SuperAdmin puede usar esta función
   - Permite crear un nuevo líder o usar uno existente
   - Ver `backend-supabase-paso-a-paso.md` para más detalles

4. **`recalcular_presupuesto_equipo(p_id_equipo)`**
   - Recalcula presupuesto liquidado y pendiente de un equipo

---

## 📋 Tablas Principales (Resumen)

### 1. `perfiles`
**¿Qué guarda?** Información de cada usuario
- nombre_usuario, rol, id_equipo

### 2. `equipos`
**¿Qué guarda?** Información de cada equipo
- nombre, id_lider, presupuesto_asignado

### 3. `planes_desarrollo`
**¿Qué guarda?** Planes de cada equipo
- nombre, categoria, estado, fechas

### 4. `objetivos_area`
**¿Qué guarda?** Objetivos por área dentro de un plan
- categoria, descripcion, numero_orden, **numero_objetivo** (nuevo)

### 5. `actividades`
**¿Qué guarda?** Actividades de cada plan
- nombre, responsable, presupuesto, estado
- **etapa_plan** (nuevo): Etapa del plan a la que pertenece
- **numero_objetivo** (nuevo): Número del objetivo global

### 6. `metricas_equipo`
**¿Qué guarda?** Números importantes
- poblacion, iglesias, bautizados, etc.

**Hay más tablas**, pero estas son las principales.

---

## 🔄 Flujos Comunes

### Flujo 1: Un Líder Ve Su Dashboard

```
1. Líder hace login
   ↓
2. Frontend pregunta: "¿Qué equipo tiene este líder?"
   ↓
3. Backend: "Tiene el equipo Barí"
   ↓
4. Frontend pregunta: "Dame el equipo Barí con todo"
   ↓
5. Backend busca:
   - Info del equipo
   - Plan activo
   - Actividades del plan
   - Métricas
   ↓
6. Backend devuelve todo junto
   ↓
7. Frontend muestra el dashboard bonito
```

### Flujo 2: Crear una Nueva Actividad

```
1. Líder llena formulario de nueva actividad
   ↓
2. Click en "Guardar"
   ↓
3. Frontend envía datos al backend
   ↓
4. Backend verifica: "¿Este usuario puede crear actividades en este plan?"
   ↓
5. Si SÍ → Guarda en la base de datos
   ↓
6. Backend responde: "✅ Creado con éxito"
   ↓
7. Frontend actualiza la lista de actividades
```

---

## 💰 ¿Cuánto Cuesta?

**¡NADA!** 🎉

Todo funciona en el **plan gratuito** de Supabase:
- ✅ Base de datos: 500 MB (suficiente para empezar)
- ✅ Usuarios: 50,000/mes (más que suficiente)
- ✅ Funciones RPC: **ILIMITADAS** (gratis)
- ✅ Seguridad RLS: **ILIMITADA** (gratis)

**No necesitas pagar nada** para implementar todo esto.

---

## 🔌 CONECTAR FRONTEND CON BACKEND - Guía Práctica

Esta sección es **MUY IMPORTANTE** si vas a conectar el frontend (Next.js) con el backend (Supabase).

### Paso 1: Instalar Supabase en el Frontend

Abre la terminal en la carpeta `frontend` y ejecuta:

```bash
npm install @supabase/supabase-js
```

Esto instala la librería que permite comunicarse con Supabase.

---

### Paso 2: Obtener las Credenciales de Supabase

1. Ve a [supabase.com](https://supabase.com) y crea un proyecto (o usa uno existente)
2. En tu proyecto, ve a **Settings** → **API**
3. Copia estas dos cosas:
   - **Project URL** (algo como: `https://xxxxx.supabase.co`)
   - **anon public key** (una clave larga que empieza con `eyJ...`)

---

### Paso 3: Crear el Cliente de Supabase

Crea un archivo nuevo: `frontend/src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

// Estas URLs las obtienes de Supabase (Settings → API)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Crear el cliente
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

### Paso 4: Configurar Variables de Entorno

Crea un archivo `.env.local` en la carpeta `frontend`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-aqui
```

**⚠️ IMPORTANTE**: 
- El archivo `.env.local` NO se sube a Git (ya está en `.gitignore`)
- Las variables que empiezan con `NEXT_PUBLIC_` son visibles en el navegador (está bien para la clave anon)

---

### Paso 5: Reemplazar Mock Data con Datos Reales

Actualmente el frontend usa `mock-data.ts` que lee un CSV. Vamos a reemplazarlo con consultas reales a Supabase.

#### Ejemplo 1: Cargar Equipos

**ANTES** (mock-data.ts):
```typescript
export async function loadTeams(): Promise<Team[]> {
  // Lee un archivo CSV...
}
```

**DESPUÉS** (nuevo archivo `supabase-data.ts`):
```typescript
import { supabase } from './supabase';
import { Team, DevelopmentPlan, Activity } from './types';

export async function loadTeams(): Promise<Team[]> {
  // Consultar equipos desde Supabase
  const { data: equipos, error } = await supabase
    .from('equipos')
    .select(`
      *,
      id_lider:perfiles!equipos_id_lider_fkey(
        nombre_completo,
        nombre_usuario
      ),
      planes_desarrollo(
        *,
        objetivos_area(*),
        actividades(*)
      ),
      metricas_equipo(*),
      miembros_equipo(
        activo,
        rol,
        id_perfil:perfiles(
          nombre_completo,
          nombre_usuario
        )
      )
    `);

  if (error) {
    console.error('Error cargando equipos:', error);
    throw error;
  }

  // Transformar datos de Supabase a nuestro formato TypeScript
  return equipos.map(equipo => ({
    id: equipo.id,
    name: equipo.nombre,
    leader: equipo.id_lider?.nombre_completo || equipo.id_lider?.nombre_usuario || '',
    members: equipo.miembros_equipo
      .filter((m: any) => m.activo)
      .map((m: any) => ({
        name: m.id_perfil.nombre_completo || m.id_perfil.nombre_usuario,
        role: m.rol
      })),
    budgetAssigned: equipo.presupuesto_asignado || 0,
    budgetLiquidated: calcularLiquidado(equipo.planes_desarrollo),
    budgetPending: calcularPendiente(equipo.planes_desarrollo),
    plans: equipo.planes_desarrollo.map(transformPlan),
    metrics: transformMetrics(equipo.metricas_equipo)
  }));
}

// Funciones helper para transformar datos
function calcularLiquidado(planes: any[]): number {
  return planes.reduce((sum, plan) => {
    const actividades = plan.actividades || [];
    return sum + actividades.reduce((s: number, a: any) => s + (a.presupuesto_liquidado || 0), 0);
  }, 0);
}

function calcularPendiente(planes: any[]): number {
  return planes.reduce((sum, plan) => {
    const actividades = plan.actividades || [];
    return sum + actividades
      .filter((a: any) => a.estado === 'Pendiente')
      .reduce((s: number, a: any) => s + (a.presupuesto_total - a.presupuesto_liquidado), 0);
  }, 0);
}

function transformPlan(plan: any): DevelopmentPlan {
  return {
    id: plan.id,
    teamId: plan.id_equipo,
    name: plan.nombre,
    category: plan.categoria,
    status: plan.estado,
    startDate: plan.fecha_inicio,
    endDate: plan.fecha_fin,
    summary: plan.resumen || '',
    objectives: plan.objetivos_area?.map((obj: any) => ({
      id: obj.id,
      planId: obj.id_plan,
      category: obj.categoria,
      description: obj.descripcion,
      order: obj.numero_orden
    })) || [],
    activities: plan.actividades?.map(transformActivity) || []
  };
}

function transformActivity(act: any): Activity {
  return {
    id: act.id,
    teamId: act.id_equipo,
    planId: act.id_plan,
    objectiveId: act.id_objetivo,
    name: act.nombre,
    responsable: act.responsable,
    budgetTotal: act.presupuesto_total || 0,
    budgetLiquidated: act.presupuesto_liquidado || 0,
    status: act.estado,
    stage: act.etapa || '',
    area: act.area,
    objective: act.objetivo || '',
    description: act.descripcion || '',
    currentSituation: act.situacion_actual || '',
    goalMid: act.objetivo_mediano || '',
    goalLong: act.objetivo_largo || '',
    frequency: act.frecuencia || '',
    timesPerYear: act.veces_por_ano || 0,
    startDate: act.fecha_inicio,
    endDate: act.fecha_fin,
    totalWeeks: act.semanas_totales || 0,
    remainingWeeks: act.semanas_restantes || 0,
    obstacles: act.obstaculos || ''
  };
}

function transformMetrics(metrics: any): TeamMetrics | undefined {
  if (!metrics) return undefined;
  
  return {
    population: metrics.poblacion,
    evangelicalCongregations: metrics.congregaciones_evangelicas,
    evangelicals: metrics.evangelicos,
    firstTimeContacts: metrics.contactos_primera_vez,
    interestedInGospel: metrics.interesados_evangelio,
    heardGospel: metrics.escucharon_evangelio,
    seekingGod: metrics.buscando_dios,
    opportunityToRespond: metrics.oportunidad_responder,
    believedMessage: metrics.creyeron_mensaje,
    baptized: metrics.bautizados,
    regularBibleStudies: metrics.estudios_biblicos_regulares,
    personallyMentored: metrics.discipulado_personal,
    newGroupsThisYear: metrics.grupos_nuevos_este_ano,
    ministerialTraining: metrics.entrenamiento_ministerial,
    otherAreasTraining: metrics.entrenamiento_otras_areas,
    pastoralTraining: metrics.entrenamiento_pastoral,
    biblicalTraining: metrics.entrenamiento_biblico,
    churchPlantingTraining: metrics.entrenamiento_plantacion_iglesias,
    groupsWithChurchProspects: metrics.grupos_con_prospectos_iglesia,
    churchesAtEndOfPeriod: metrics.iglesias_fin_periodo,
    firstGenChurches: metrics.iglesias_primera_gen,
    secondGenChurches: metrics.iglesias_segunda_gen,
    thirdGenChurches: metrics.iglesias_tercera_gen,
    lostFirstGenChurches: metrics.iglesias_perdidas_primera_gen,
    lostSecondGenChurches: metrics.iglesias_perdidas_segunda_gen,
    lostThirdGenChurches: metrics.iglesias_perdidas_tercera_gen,
    ministryLocation: metrics.ubicacion_ministerio
  };
}
```

#### Ejemplo 2: Cargar Métricas del Dashboard (SuperAdmin)

```typescript
import { supabase } from './supabase';
import { DashboardTeamMetrics } from './types';

export async function loadDashboardMetrics(): Promise<DashboardTeamMetrics[]> {
  // Usar la función RPC que creamos en el backend
  const { data, error } = await supabase.rpc('obtener_metricas_dashboard_equipo');

  if (error) {
    console.error('Error cargando métricas:', error);
    throw error;
  }

  // Transformar a nuestro formato
  return data.map((row: any) => ({
    teamId: row.id_equipo,
    teamName: row.nombre_equipo,
    leader: row.lider,
    completedPlans: row.planes_completados_count || 0,
    pendingActivities: row.actividades_pendientes_count || 0,
    doneActivities: row.actividades_completadas_count || 0,
    budgetLiquidated: row.presupuesto_liquidado || 0,
    budgetPending: row.presupuesto_pendiente || 0,
    budgetAssigned: row.presupuesto_asignado || 0
  }));
}
```

#### Ejemplo 3: Cargar un Plan Específico

```typescript
export async function loadPlanById(planId: string): Promise<DevelopmentPlan | null> {
  const { data, error } = await supabase
    .from('planes_desarrollo')
    .select(`
      *,
      objetivos_area(*),
      actividades(*)
    `)
    .eq('id', planId)
    .single();

  if (error) {
    console.error('Error cargando plan:', error);
    return null;
  }

  return transformPlan(data);
}
```

---

### Paso 6: Actualizar el AuthContext para Usar Supabase

Reemplaza `frontend/src/context/auth-context.tsx`:

```typescript
"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

type Role = "superadmin" | "leader" | "member";

export interface AuthUser {
  username: string;
  role: Role;
  teamId?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar sesión al iniciar
  useEffect(() => {
    // Verificar si hay una sesión activa
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          await loadUserProfile(session.user.id);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Cargar perfil del usuario desde la tabla perfiles
  const loadUserProfile = async (userId: string) => {
    try {
      const { data: perfil, error } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      const authUser: AuthUser = {
        username: perfil.nombre_usuario,
        role: perfil.rol as Role,
        teamId: perfil.id_equipo || undefined
      };

      setUser(authUser);
    } catch (error) {
      console.error('Error cargando perfil:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = useCallback(async (username: string, password: string) => {
    try {
      // Autenticar con Supabase Auth
      // Usamos email sintético: username@misincol.local
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: `${username}@misincol.local`,
        password: password
      });

      if (authError) throw authError;

      // Cargar perfil del usuario
      await loadUserProfile(authData.user.id);
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout
    }),
    [user, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
```

---

### Paso 7: Actualizar la Página de Login

Actualiza `frontend/src/app/login/page.tsx`:

```typescript
"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Si ya está logueado, redirigir
  useEffect(() => {
    if (user) {
      if (user.role === "superadmin") {
        router.replace("/superadmin/dashboard");
      } else {
        router.replace(`/leader/dashboard${user.teamId ? `?team=${user.teamId}` : ""}`);
      }
    }
  }, [user, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(username, password);
      
      // La redirección se hace automáticamente en el useEffect
    } catch (err: any) {
      setError(err.message || "Usuario o contraseña inválidos");
    } finally {
      setLoading(false);
    }
  };

  return (
    // ... tu formulario de login aquí ...
  );
}
```

---

### Paso 8: Actualizar Páginas para Usar Datos Reales

En lugar de importar desde `mock-data.ts`, importa desde `supabase-data.ts`:

**ANTES**:
```typescript
import { loadTeams } from "@/lib/mock-data";
```

**DESPUÉS**:
```typescript
import { loadTeams } from "@/lib/supabase-data";
```

**Ejemplo completo** (`frontend/src/app/leader/dashboard/page.tsx`):
```typescript
import { loadTeams } from "@/lib/supabase-data"; // ← Cambiar aquí

export default async function LeaderDashboard({ searchParams }: Props) {
  const teams = await loadTeams(); // ← Esto ahora viene de Supabase
  // ... resto del código igual ...
}
```

---

### Paso 9: Crear/Actualizar Actividades

Ejemplo de cómo crear una nueva actividad:

```typescript
import { supabase } from "@/lib/supabase";

export async function createActivity(activityData: {
  teamId: string;
  planId: string;
  name: string;
  responsable: string;
  budgetTotal: number;
  // ... más campos
}) {
  const { data, error } = await supabase
    .from('actividades')
    .insert({
      id_equipo: activityData.teamId,
      id_plan: activityData.planId,
      nombre: activityData.name,
      responsable: activityData.responsable,
      presupuesto_total: activityData.budgetTotal,
      presupuesto_liquidado: 0,
      estado: 'Pendiente',
      fecha_inicio: activityData.startDate,
      fecha_fin: activityData.endDate,
      // ... más campos
    })
    .select()
    .single();

  if (error) {
    console.error('Error creando actividad:', error);
    throw error;
  }

  return data;
}
```

---

### Paso 10: Consultas Comunes que Necesitarás

#### Obtener equipos de un usuario
```typescript
const { data } = await supabase
  .from('equipos')
  .select('*')
  .eq('id_lider', userId);
```

#### Obtener actividades pendientes
```typescript
const { data } = await supabase
  .from('actividades')
  .select('*')
  .eq('estado', 'Pendiente')
  .eq('id_equipo', teamId);
```

#### Actualizar una actividad
```typescript
const { data, error } = await supabase
  .from('actividades')
  .update({ 
    estado: 'Hecha',
    presupuesto_liquidado: 5000
  })
  .eq('id', activityId)
  .select()
  .single();
```

#### Usar función RPC
```typescript
// Obtener métricas del dashboard
const { data, error } = await supabase.rpc('obtener_metricas_dashboard_equipo');

// Crear un equipo completo (solo SuperAdmin)
const { data, error } = await supabase.rpc('crear_equipo_completo', {
  p_nombre_equipo: 'Equipo Barí',
  p_presupuesto_asignado: 1000000,
  p_crear_nuevo_lider: false,
  p_id_lider_existente: 'uuid-del-lider',
  p_miembros: [
    { name: 'Juan Pérez', role: 'Miembro' }
  ]
});
```

---

### ⚠️ Errores Comunes y Soluciones

#### Error: "relation does not exist"
**Problema**: La tabla no existe en Supabase
**Solución**: Ejecuta el SQL del documento `backend-supabase-paso-a-paso.md` primero

#### Error: "new row violates row-level security policy"
**Problema**: RLS está bloqueando la operación
**Solución**: Verifica que el usuario tiene permisos. Revisa las políticas RLS en Supabase

#### Error: "JWT expired"
**Problema**: La sesión expiró
**Solución**: El usuario debe hacer login de nuevo

#### Error: "column does not exist"
**Problema**: Nombre de columna incorrecto
**Solución**: Verifica que usas nombres en español: `nombre` no `name`, `estado` no `status`

---

### 📝 Checklist de Integración

- [ ] Instalé `@supabase/supabase-js`
- [ ] Creé el archivo `lib/supabase.ts` con el cliente
- [ ] Configuré `.env.local` con las credenciales
- [ ] Creé `lib/supabase-data.ts` con funciones de carga
- [ ] Actualicé `auth-context.tsx` para usar Supabase Auth
- [ ] Actualicé `login/page.tsx` para usar el nuevo login
- [ ] Reemplacé imports de `mock-data` por `supabase-data`
- [ ] Probé cargar equipos desde Supabase
- [ ] Probé hacer login
- [ ] Verifiqué que RLS funciona correctamente

---

## 🚀 ¿Por Dónde Empezar?

### Si eres completamente nuevo:

1. **Lee este documento completo** (este que estás leyendo)
2. **Mira el diagrama**: `diagrama-base-datos.md` (tiene dibujos bonitos)
3. **Lee la relación frontend-backend**: `backend-frontend-relacion.md` (ejemplos de código)
4. **Sigue la sección "CONECTAR FRONTEND CON BACKEND"** de arriba ⬆️

### Si ya entiendes lo básico:

1. **Sigue la guía paso a paso**: `backend-supabase-paso-a-paso.md`
2. **Ejecuta el SQL** en Supabase (copia y pega)
3. **Sigue los pasos de conexión** de arriba
4. **Prueba las consultas** desde el frontend

### Si quieres profundizar:

1. **Lee el análisis técnico**: `analisis-validacion-backend.md`
2. **Revisa la validación**: `plan-gratuito-supabase.md`

---

## 📝 Conceptos Clave (Glosario)

### Base de Datos
Lugar donde se guardan todos los datos (como un archivo gigante organizado).

### Tabla
Una "categoría" de datos. Ejemplo: tabla `equipos` guarda todos los equipos.

### Columna
Un "campo" de información. Ejemplo: columna `nombre` en la tabla `equipos`.

### Fila (Row)
Un registro individual. Ejemplo: una fila en `equipos` = un equipo específico.

### Foreign Key (FK)
Una "referencia" a otra tabla. Ejemplo: `id_equipo` en `perfiles` referencia a `equipos`.

### RLS (Row Level Security)
Seguridad que controla quién puede ver qué datos.

### RPC Function
Una función especial en la base de datos que hace cálculos.

### Trigger
Algo que se ejecuta automáticamente cuando pasa algo. Ejemplo: actualizar fecha automáticamente.

### Query
Una "pregunta" a la base de datos. Ejemplo: "Dame todos los equipos".

---

## 🎓 Ejemplo Práctico: Consulta Simple

Imagina que quieres ver todos los equipos:

**En SQL (lenguaje de base de datos)**:
```sql
SELECT * FROM equipos;
```

**Traducción**: "Selecciona todo (*) de la tabla equipos"

**Resultado**:
```
id          | nombre | id_lider | presupuesto_asignado
------------|--------|----------|----------------------
team-1      | Barí   | user-123 | 60000
team-2      | Katíos | user-456 | 75000
```

**En el frontend (TypeScript)**:
```typescript
const { data } = await supabase
  .from('equipos')
  .select('*');
```

**Es lo mismo**, pero escrito de forma diferente.

---

## 🔍 Preguntas Frecuentes

### ¿Necesito saber SQL para esto?

**Básico sí, avanzado no**. 
- Puedes copiar y pegar el SQL que ya está escrito
- Para consultas simples, el cliente de Supabase hace el SQL por ti
- Solo necesitas SQL avanzado si quieres crear funciones complejas

### ¿Qué pasa si me equivoco?

**No pasa nada**. 
- Puedes borrar y volver a crear
- Supabase tiene backups
- Todo es reversible

### ¿Cuánto tiempo toma implementar esto?

**Depende de tu experiencia**:
- Si sigues la guía paso a paso: 2-4 horas
- Si entiendes bien: 1-2 horas
- Si eres experto: 30 minutos

### ¿Puedo modificar algo después?

**¡Sí!** 
- Puedes agregar columnas
- Puedes agregar tablas
- Puedes modificar funciones
- Todo es flexible

---

## 📚 Recursos Adicionales

### Documentación Oficial
- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/)

### Nuestros Documentos
- `backend-supabase-paso-a-paso.md` - Guía completa
- `diagrama-base-datos.md` - Diagramas visuales
- `backend-frontend-relacion.md` - Cómo se conectan
- `plan-gratuito-supabase.md` - Verificación de costos

---

## ✅ Checklist para Empezar

- [ ] Leí este resumen completo
- [ ] Entiendo qué es el backend
- [ ] Entiendo qué datos guardamos
- [ ] Entiendo cómo se relacionan las cosas
- [ ] Vi el diagrama de base de datos
- [ ] Leí la relación frontend-backend
- [ ] Estoy listo para seguir la guía paso a paso

---

## 🎯 Próximos Pasos

1. **Abre Supabase** y crea un proyecto (gratis)
2. **Abre el SQL Editor** en Supabase
3. **Sigue `backend-supabase-paso-a-paso.md`** paso por paso
4. **Copia y pega** el SQL que está en la guía
5. **Ejecuta** cada paso
6. **Prueba** desde el frontend

---

## 💡 Tips para Principiantes

1. **No tengas miedo de experimentar** - Puedes borrar y volver a empezar
2. **Lee los errores** - Te dicen exactamente qué está mal
3. **Empieza simple** - Primero crea las tablas, luego las funciones
4. **Usa el SQL Editor** - Es más fácil que la línea de comandos
5. **Pregunta** - Si algo no funciona, pregunta (no hay preguntas tontas)

---

## 🎉 ¡Listo!

Ahora tienes una visión general del backend. Si algo no queda claro:

1. Revisa la sección correspondiente en este documento
2. Lee el documento detallado relacionado
3. Pregunta a tu equipo

**¡Éxito con el backend!** 🚀

---

*Última actualización: Resumen creado para facilitar el onboarding de nuevos desarrolladores backend.*

