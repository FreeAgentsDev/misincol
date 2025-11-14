# Guía Paso a Paso: Backend Supabase para Misincol

Este documento te guiará paso a paso para implementar el backend completo en Supabase. Cada paso incluye el código SQL necesario que puedes ejecutar directamente en el SQL Editor de Supabase.

## 📋 Índice

1. [Configuración Inicial](#1-configuración-inicial)
2. [Esquema de Base de Datos](#2-esquema-de-base-de-datos)
3. [Políticas de Seguridad (RLS)](#3-políticas-de-seguridad-rls)
4. [Funciones RPC](#4-funciones-rpc)
5. [Triggers y Funciones Automáticas](#5-triggers-y-funciones-automáticas)
6. [Vistas Materializadas](#6-vistas-materializadas)
7. [Datos de Prueba (Seeds)](#7-datos-de-prueba-seeds)
8. [Configuración de Autenticación](#8-configuración-de-autenticación)
9. [Verificación y Testing](#9-verificación-y-testing)

---

## 1. Configuración Inicial

### Paso 1.1: Habilitar Extensiones

Ejecuta esto primero en el SQL Editor de Supabase:

```sql
-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### Paso 1.2: Crear Tipos ENUM

```sql
-- Tipos de estado de actividad
CREATE TYPE activity_status AS ENUM ('Hecha', 'Pendiente');

-- Tipos de categoría de plan
CREATE TYPE plan_category AS ENUM (
  'Investigación',
  'Encarnación',
  'Evangelización',
  'Entrenamiento',
  'Autocuidado'
);

-- Tipos de estado de plan
CREATE TYPE plan_status AS ENUM ('Activo', 'Finalizado', 'Archivado');

-- Tipos de rol de usuario
CREATE TYPE user_role AS ENUM ('superadmin', 'leader', 'member');
```

---

## 2. Esquema de Base de Datos

### Paso 2.1: Tabla `profiles`

Esta tabla extiende la información de usuarios de Supabase Auth:

```sql
-- Tabla de perfiles de usuario
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'member',
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_team_id ON profiles(team_id);

-- Comentarios
COMMENT ON TABLE profiles IS 'Perfiles de usuario que extienden auth.users';
COMMENT ON COLUMN profiles.username IS 'Nombre de usuario único para login';
COMMENT ON COLUMN profiles.role IS 'Rol del usuario: superadmin, leader o member';
COMMENT ON COLUMN profiles.team_id IS 'ID del equipo al que pertenece (solo para leaders)';
```

### Paso 2.2: Tabla `teams`

```sql
-- Tabla de equipos
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  leader_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  budget_assigned NUMERIC(15, 2) DEFAULT 0 CHECK (budget_assigned >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_teams_leader_id ON teams(leader_id);

-- Comentarios
COMMENT ON TABLE teams IS 'Equipos de trabajo del sistema';
COMMENT ON COLUMN teams.budget_assigned IS 'Presupuesto total asignado al equipo en COP';
```

### Paso 2.3: Tabla `team_members`

```sql
-- Tabla de miembros de equipo
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, profile_id)
);

-- Índices
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_profile_id ON team_members(profile_id);
CREATE INDEX idx_team_members_active ON team_members(is_active) WHERE is_active = TRUE;

-- Comentarios
COMMENT ON TABLE team_members IS 'Relación muchos a muchos entre equipos y miembros';
```

### Paso 2.4: Tabla `team_metrics`

```sql
-- Tabla de métricas de equipo
CREATE TABLE team_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  
  -- Métricas generales
  population INTEGER,
  evangelical_congregations INTEGER,
  evangelicals INTEGER,
  
  -- Etapa: Contacto
  first_time_contacts INTEGER,
  interested_in_gospel INTEGER,
  heard_gospel INTEGER,
  
  -- Etapa: Comunicando
  seeking_god INTEGER,
  opportunity_to_respond INTEGER,
  
  -- Etapa: Respondiendo
  believed_message INTEGER,
  baptized INTEGER,
  
  -- Etapa: Consolidando
  regular_bible_studies INTEGER,
  personally_mentored INTEGER,
  new_groups_this_year INTEGER,
  
  -- Etapa: Liderazgo
  ministerial_training INTEGER,
  other_areas_training INTEGER,
  pastoral_training INTEGER,
  biblical_training INTEGER,
  church_planting_training INTEGER,
  
  -- Desarrollo eclesial
  groups_with_church_prospects INTEGER,
  churches_at_end_of_period INTEGER,
  first_gen_churches INTEGER,
  second_gen_churches INTEGER,
  third_gen_churches INTEGER,
  lost_first_gen_churches INTEGER,
  lost_second_gen_churches INTEGER,
  lost_third_gen_churches INTEGER,
  
  -- Lugar de ministerio
  ministry_location TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id)
);

-- Índices
CREATE INDEX idx_team_metrics_team_id ON team_metrics(team_id);

-- Comentarios
COMMENT ON TABLE team_metrics IS 'Métricas de seguimiento de cada equipo';
```

### Paso 2.5: Tabla `development_plans`

```sql
-- Tabla de planes de desarrollo
CREATE TABLE development_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category plan_category NOT NULL,
  status plan_status NOT NULL DEFAULT 'Activo',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (end_date >= start_date)
);

-- Índices
CREATE INDEX idx_development_plans_team_id ON development_plans(team_id);
CREATE INDEX idx_development_plans_status ON development_plans(status);
CREATE INDEX idx_development_plans_category ON development_plans(category);
CREATE INDEX idx_development_plans_dates ON development_plans(start_date, end_date);

-- Comentarios
COMMENT ON TABLE development_plans IS 'Planes de desarrollo de cada equipo';
```

### Paso 2.6: Tabla `area_objectives`

```sql
-- Tabla de objetivos de área
CREATE TABLE area_objectives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES development_plans(id) ON DELETE CASCADE,
  category plan_category NOT NULL,
  description TEXT NOT NULL,
  order_number INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_area_objectives_plan_id ON area_objectives(plan_id);
CREATE INDEX idx_area_objectives_category ON area_objectives(category);

-- Comentarios
COMMENT ON TABLE area_objectives IS 'Objetivos por área dentro de un plan';
```

### Paso 2.7: Tabla `activities`

```sql
-- Tabla de actividades
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES development_plans(id) ON DELETE CASCADE,
  objective_id UUID REFERENCES area_objectives(id) ON DELETE SET NULL,
  
  name TEXT NOT NULL,
  responsable TEXT NOT NULL,
  budget_total NUMERIC(15, 2) DEFAULT 0 CHECK (budget_total >= 0),
  budget_liquidated NUMERIC(15, 2) DEFAULT 0 CHECK (budget_liquidated >= 0),
  status activity_status NOT NULL DEFAULT 'Pendiente',
  stage TEXT,
  area TEXT NOT NULL,
  objective TEXT,
  description TEXT,
  current_situation TEXT,
  goal_mid TEXT,
  goal_long TEXT,
  frequency TEXT,
  times_per_year INTEGER DEFAULT 0 CHECK (times_per_year >= 0),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_weeks INTEGER DEFAULT 0 CHECK (total_weeks >= 0),
  remaining_weeks INTEGER DEFAULT 0 CHECK (remaining_weeks >= 0),
  obstacles TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (end_date >= start_date),
  CHECK (budget_liquidated <= budget_total)
);

-- Índices
CREATE INDEX idx_activities_team_id ON activities(team_id);
CREATE INDEX idx_activities_plan_id ON activities(plan_id);
CREATE INDEX idx_activities_objective_id ON activities(objective_id);
CREATE INDEX idx_activities_status ON activities(status);
CREATE INDEX idx_activities_area ON activities(area);
CREATE INDEX idx_activities_dates ON activities(start_date, end_date);

-- Comentarios
COMMENT ON TABLE activities IS 'Actividades dentro de los planes de desarrollo';
COMMENT ON COLUMN activities.budget_liquidated IS 'Presupuesto ya liquidado en COP';
```

### Paso 2.8: Tabla `activity_assignments`

```sql
-- Tabla de asignaciones de actividades a miembros
CREATE TABLE activity_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'collaborator', -- 'responsible' o 'collaborator'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(activity_id, profile_id)
);

-- Índices
CREATE INDEX idx_activity_assignments_activity_id ON activity_assignments(activity_id);
CREATE INDEX idx_activity_assignments_profile_id ON activity_assignments(profile_id);

-- Comentarios
COMMENT ON TABLE activity_assignments IS 'Asignación de miembros a actividades';
```

### Paso 2.9: Tabla `activity_updates`

```sql
-- Tabla de actualizaciones/seguimiento de actividades
CREATE TABLE activity_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  update_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_activity_updates_activity_id ON activity_updates(activity_id);
CREATE INDEX idx_activity_updates_profile_id ON activity_updates(profile_id);
CREATE INDEX idx_activity_updates_created_at ON activity_updates(created_at DESC);

-- Comentarios
COMMENT ON TABLE activity_updates IS 'Registro de actualizaciones y seguimiento de actividades';
```

### Paso 2.10: Tabla `budget_allocations`

```sql
-- Tabla de asignaciones presupuestales
CREATE TABLE budget_allocations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES development_plans(id) ON DELETE SET NULL,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_budget_allocations_team_id ON budget_allocations(team_id);
CREATE INDEX idx_budget_allocations_plan_id ON budget_allocations(plan_id);

-- Comentarios
COMMENT ON TABLE budget_allocations IS 'Asignaciones presupuestales por equipo y plan';
```

### Paso 2.11: Tabla `plan_history`

```sql
-- Tabla de historial de cambios en planes
CREATE TABLE plan_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES development_plans(id) ON DELETE CASCADE,
  changed_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  change_type TEXT NOT NULL, -- 'created', 'updated', 'status_changed', 'deleted'
  old_values JSONB,
  new_values JSONB,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_plan_history_plan_id ON plan_history(plan_id);
CREATE INDEX idx_plan_history_changed_by ON plan_history(changed_by);
CREATE INDEX idx_plan_history_created_at ON plan_history(created_at DESC);

-- Comentarios
COMMENT ON TABLE plan_history IS 'Historial de cambios en planes de desarrollo';
```

### Paso 2.12: Tabla `plan_lessons`

```sql
-- Tabla de aprendizajes de planes
CREATE TABLE plan_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES development_plans(id) ON DELETE CASCADE,
  lesson_text TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_plan_lessons_plan_id ON plan_lessons(plan_id);
CREATE INDEX idx_plan_lessons_created_by ON plan_lessons(created_by);

-- Comentarios
COMMENT ON TABLE plan_lessons IS 'Aprendizajes y lecciones aprendidas de planes finalizados';
```

### Paso 2.13: Actualizar Foreign Key en `profiles`

Ahora que `teams` existe, actualizamos la referencia:

```sql
-- Agregar foreign key a profiles.team_id (si no se creó antes)
ALTER TABLE profiles 
ADD CONSTRAINT fk_profiles_team_id 
FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL;
```

---

## 3. Políticas de Seguridad (RLS)

### Paso 3.1: Habilitar RLS en todas las tablas

```sql
-- Habilitar Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE development_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE area_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_lessons ENABLE ROW LEVEL SECURITY;
```

### Paso 3.2: Función helper para obtener el rol del usuario

```sql
-- Función para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

### Paso 3.3: Función helper para obtener el team_id del usuario

```sql
-- Función para obtener el team_id del usuario actual (si es leader)
CREATE OR REPLACE FUNCTION get_user_team_id()
RETURNS UUID AS $$
  SELECT team_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

### Paso 3.4: Políticas para `profiles`

```sql
-- Superadmin puede ver todos los perfiles
CREATE POLICY "Superadmin can view all profiles"
  ON profiles FOR SELECT
  USING (get_user_role() = 'superadmin');

-- Los usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Los líderes pueden ver perfiles de su equipo
CREATE POLICY "Leaders can view team profiles"
  ON profiles FOR SELECT
  USING (
    get_user_role() = 'leader' 
    AND team_id = get_user_team_id()
  );

-- Superadmin puede insertar/actualizar perfiles
CREATE POLICY "Superadmin can manage profiles"
  ON profiles FOR ALL
  USING (get_user_role() = 'superadmin')
  WITH CHECK (get_user_role() = 'superadmin');

-- Los usuarios pueden actualizar su propio perfil (limitado)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

### Paso 3.5: Políticas para `teams`

```sql
-- Superadmin puede ver todos los equipos
CREATE POLICY "Superadmin can view all teams"
  ON teams FOR SELECT
  USING (get_user_role() = 'superadmin');

-- Los líderes pueden ver su propio equipo
CREATE POLICY "Leaders can view own team"
  ON teams FOR SELECT
  USING (
    get_user_role() = 'leader' 
    AND id = get_user_team_id()
  );

-- Los miembros pueden ver su equipo
CREATE POLICY "Members can view own team"
  ON teams FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_id = teams.id 
      AND profile_id = auth.uid()
      AND is_active = TRUE
    )
  );

-- Superadmin puede gestionar equipos
CREATE POLICY "Superadmin can manage teams"
  ON teams FOR ALL
  USING (get_user_role() = 'superadmin')
  WITH CHECK (get_user_role() = 'superadmin');
```

### Paso 3.6: Políticas para `team_members`

```sql
-- Superadmin puede ver todos los miembros
CREATE POLICY "Superadmin can view all team members"
  ON team_members FOR SELECT
  USING (get_user_role() = 'superadmin');

-- Los líderes pueden ver miembros de su equipo
CREATE POLICY "Leaders can view team members"
  ON team_members FOR SELECT
  USING (
    get_user_role() = 'leader' 
    AND team_id = get_user_team_id()
  );

-- Los miembros pueden ver otros miembros de su equipo
CREATE POLICY "Members can view own team members"
  ON team_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.profile_id = auth.uid()
      AND tm.is_active = TRUE
    )
  );

-- Superadmin y líderes pueden gestionar miembros
CREATE POLICY "Superadmin and leaders can manage team members"
  ON team_members FOR ALL
  USING (
    get_user_role() = 'superadmin' 
    OR (get_user_role() = 'leader' AND team_id = get_user_team_id())
  )
  WITH CHECK (
    get_user_role() = 'superadmin' 
    OR (get_user_role() = 'leader' AND team_id = get_user_team_id())
  );
```

### Paso 3.7: Políticas para `team_metrics`

```sql
-- Superadmin puede ver todas las métricas
CREATE POLICY "Superadmin can view all metrics"
  ON team_metrics FOR SELECT
  USING (get_user_role() = 'superadmin');

-- Los líderes pueden ver métricas de su equipo
CREATE POLICY "Leaders can view own team metrics"
  ON team_metrics FOR SELECT
  USING (
    get_user_role() = 'leader' 
    AND team_id = get_user_team_id()
  );

-- Los líderes pueden actualizar métricas de su equipo
CREATE POLICY "Leaders can update own team metrics"
  ON team_metrics FOR UPDATE
  USING (
    get_user_role() = 'leader' 
    AND team_id = get_user_team_id()
  )
  WITH CHECK (
    get_user_role() = 'leader' 
    AND team_id = get_user_team_id()
  );

-- Superadmin puede gestionar todas las métricas
CREATE POLICY "Superadmin can manage all metrics"
  ON team_metrics FOR ALL
  USING (get_user_role() = 'superadmin')
  WITH CHECK (get_user_role() = 'superadmin');
```

### Paso 3.8: Políticas para `development_plans`

```sql
-- Superadmin puede ver todos los planes
CREATE POLICY "Superadmin can view all plans"
  ON development_plans FOR SELECT
  USING (get_user_role() = 'superadmin');

-- Los líderes pueden ver planes de su equipo
CREATE POLICY "Leaders can view own team plans"
  ON development_plans FOR SELECT
  USING (
    get_user_role() = 'leader' 
    AND team_id = get_user_team_id()
  );

-- Los miembros pueden ver planes de su equipo
CREATE POLICY "Members can view own team plans"
  ON development_plans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_id = development_plans.team_id 
      AND profile_id = auth.uid()
      AND is_active = TRUE
    )
  );

-- Superadmin puede gestionar todos los planes
CREATE POLICY "Superadmin can manage all plans"
  ON development_plans FOR ALL
  USING (get_user_role() = 'superadmin')
  WITH CHECK (get_user_role() = 'superadmin');

-- Los líderes pueden gestionar planes de su equipo
CREATE POLICY "Leaders can manage own team plans"
  ON development_plans FOR ALL
  USING (
    get_user_role() = 'leader' 
    AND team_id = get_user_team_id()
  )
  WITH CHECK (
    get_user_role() = 'leader' 
    AND team_id = get_user_team_id()
  );
```

### Paso 3.9: Políticas para `activities`

```sql
-- Superadmin puede ver todas las actividades
CREATE POLICY "Superadmin can view all activities"
  ON activities FOR SELECT
  USING (get_user_role() = 'superadmin');

-- Los líderes pueden ver actividades de su equipo
CREATE POLICY "Leaders can view own team activities"
  ON activities FOR SELECT
  USING (
    get_user_role() = 'leader' 
    AND team_id = get_user_team_id()
  );

-- Los miembros pueden ver actividades de su equipo
CREATE POLICY "Members can view own team activities"
  ON activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_id = activities.team_id 
      AND profile_id = auth.uid()
      AND is_active = TRUE
    )
  );

-- Superadmin puede gestionar todas las actividades
CREATE POLICY "Superadmin can manage all activities"
  ON activities FOR ALL
  USING (get_user_role() = 'superadmin')
  WITH CHECK (get_user_role() = 'superadmin');

-- Los líderes pueden gestionar actividades de su equipo
CREATE POLICY "Leaders can manage own team activities"
  ON activities FOR ALL
  USING (
    get_user_role() = 'leader' 
    AND team_id = get_user_team_id()
  )
  WITH CHECK (
    get_user_role() = 'leader' 
    AND team_id = get_user_team_id()
  );
```

### Paso 3.10: Políticas para tablas relacionadas

```sql
-- Políticas para area_objectives
CREATE POLICY "Superadmin can manage area objectives"
  ON area_objectives FOR ALL
  USING (get_user_role() = 'superadmin')
  WITH CHECK (get_user_role() = 'superadmin');

CREATE POLICY "Leaders can manage own team area objectives"
  ON area_objectives FOR ALL
  USING (
    get_user_role() = 'leader' 
    AND EXISTS (
      SELECT 1 FROM development_plans 
      WHERE id = area_objectives.plan_id 
      AND team_id = get_user_team_id()
    )
  )
  WITH CHECK (
    get_user_role() = 'leader' 
    AND EXISTS (
      SELECT 1 FROM development_plans 
      WHERE id = area_objectives.plan_id 
      AND team_id = get_user_team_id()
    )
  );

-- Políticas para activity_assignments
CREATE POLICY "Users can view own assignments"
  ON activity_assignments FOR SELECT
  USING (
    profile_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM activities a
      JOIN team_members tm ON tm.team_id = a.team_id
      WHERE a.id = activity_assignments.activity_id
      AND tm.profile_id = auth.uid()
      AND tm.is_active = TRUE
    )
  );

CREATE POLICY "Leaders can manage team assignments"
  ON activity_assignments FOR ALL
  USING (
    get_user_role() = 'leader' 
    AND EXISTS (
      SELECT 1 FROM activities a
      WHERE a.id = activity_assignments.activity_id
      AND a.team_id = get_user_team_id()
    )
  );

-- Políticas para activity_updates
CREATE POLICY "Users can view team activity updates"
  ON activity_updates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM activities a
      JOIN team_members tm ON tm.team_id = a.team_id
      WHERE a.id = activity_updates.activity_id
      AND tm.profile_id = auth.uid()
      AND tm.is_active = TRUE
    )
  );

CREATE POLICY "Users can create activity updates"
  ON activity_updates FOR INSERT
  WITH CHECK (
    profile_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM activities a
      JOIN team_members tm ON tm.team_id = a.team_id
      WHERE a.id = activity_updates.activity_id
      AND tm.profile_id = auth.uid()
      AND tm.is_active = TRUE
    )
  );

-- Políticas para budget_allocations
CREATE POLICY "Superadmin can manage all budgets"
  ON budget_allocations FOR ALL
  USING (get_user_role() = 'superadmin')
  WITH CHECK (get_user_role() = 'superadmin');

CREATE POLICY "Leaders can view own team budgets"
  ON budget_allocations FOR SELECT
  USING (
    get_user_role() = 'leader' 
    AND team_id = get_user_team_id()
  );

-- Políticas para plan_history
CREATE POLICY "Users can view plan history"
  ON plan_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM development_plans dp
      JOIN team_members tm ON tm.team_id = dp.team_id
      WHERE dp.id = plan_history.plan_id
      AND tm.profile_id = auth.uid()
      AND tm.is_active = TRUE
    )
    OR get_user_role() = 'superadmin'
  );

-- Políticas para plan_lessons
CREATE POLICY "Users can view plan lessons"
  ON plan_lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM development_plans dp
      JOIN team_members tm ON tm.team_id = dp.team_id
      WHERE dp.id = plan_lessons.plan_id
      AND tm.profile_id = auth.uid()
      AND tm.is_active = TRUE
    )
    OR get_user_role() = 'superadmin'
  );

CREATE POLICY "Leaders can manage own team lessons"
  ON plan_lessons FOR ALL
  USING (
    get_user_role() = 'leader' 
    AND EXISTS (
      SELECT 1 FROM development_plans 
      WHERE id = plan_lessons.plan_id 
      AND team_id = get_user_team_id()
    )
  );
```

---

## 4. Funciones RPC

### Paso 4.1: Función de login por username

```sql
-- Función para login por username (alternativa a email)
CREATE OR REPLACE FUNCTION auth.login_with_username(
  p_username TEXT,
  p_password TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_email TEXT;
  v_profile RECORD;
BEGIN
  -- Buscar el perfil por username
  SELECT id, (SELECT email FROM auth.users WHERE id = profiles.id) as email
  INTO v_profile
  FROM profiles
  WHERE username = p_username;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Usuario no encontrado');
  END IF;
  
  -- Verificar contraseña usando auth.users
  -- Nota: Esta función requiere que el email en auth.users sea username@misincol.local
  -- y que la contraseña coincida
  v_email := v_profile.email;
  
  -- Retornar información del usuario (la autenticación real se hace en el cliente)
  RETURN jsonb_build_object(
    'user_id', v_profile.id,
    'username', p_username,
    'email', v_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Paso 4.2: Función para obtener métricas del dashboard

```sql
-- Función para obtener métricas del dashboard por equipo
CREATE OR REPLACE FUNCTION get_team_dashboard_metrics()
RETURNS TABLE (
  team_id UUID,
  team_name TEXT,
  leader TEXT,
  active_plan_id UUID,
  active_plan_name TEXT,
  completed_plans_count BIGINT,
  pending_activities_count BIGINT,
  done_activities_count BIGINT,
  budget_liquidated NUMERIC,
  budget_pending NUMERIC,
  budget_assigned NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id AS team_id,
    t.name AS team_name,
    COALESCE(p.full_name, p.username, 'Sin líder') AS leader,
    dp_active.id AS active_plan_id,
    dp_active.name AS active_plan_name,
    COUNT(DISTINCT CASE WHEN dp.status = 'Finalizado' THEN dp.id END) AS completed_plans_count,
    COUNT(DISTINCT CASE WHEN a.status = 'Pendiente' THEN a.id END) AS pending_activities_count,
    COUNT(DISTINCT CASE WHEN a.status = 'Hecha' THEN a.id END) AS done_activities_count,
    COALESCE(SUM(a.budget_liquidated), 0) AS budget_liquidated,
    COALESCE(SUM(CASE WHEN a.status = 'Pendiente' THEN (a.budget_total - a.budget_liquidated) ELSE 0 END), 0) AS budget_pending,
    t.budget_assigned AS budget_assigned
  FROM teams t
  LEFT JOIN profiles p ON t.leader_id = p.id
  LEFT JOIN development_plans dp_active ON dp_active.team_id = t.id AND dp_active.status = 'Activo'
  LEFT JOIN development_plans dp ON dp.team_id = t.id
  LEFT JOIN activities a ON a.plan_id = dp.id
  GROUP BY t.id, t.name, p.full_name, p.username, dp_active.id, dp_active.name, t.budget_assigned;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Paso 4.3: Función para duplicar un plan

```sql
-- Función para duplicar un plan con sus actividades
CREATE OR REPLACE FUNCTION duplicate_plan(
  p_plan_id UUID,
  p_new_name TEXT,
  p_new_start_date DATE,
  p_new_end_date DATE
)
RETURNS UUID AS $$
DECLARE
  v_new_plan_id UUID;
  v_old_plan RECORD;
BEGIN
  -- Obtener el plan original
  SELECT * INTO v_old_plan
  FROM development_plans
  WHERE id = p_plan_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Plan no encontrado';
  END IF;
  
  -- Crear el nuevo plan
  INSERT INTO development_plans (
    team_id, name, category, status, start_date, end_date, summary
  )
  VALUES (
    v_old_plan.team_id,
    p_new_name,
    v_old_plan.category,
    'Activo',
    p_new_start_date,
    p_new_end_date,
    v_old_plan.summary
  )
  RETURNING id INTO v_new_plan_id;
  
  -- Duplicar objetivos de área
  INSERT INTO area_objectives (plan_id, category, description, order_number)
  SELECT v_new_plan_id, category, description, order_number
  FROM area_objectives
  WHERE plan_id = p_plan_id;
  
  -- Duplicar actividades
  INSERT INTO activities (
    team_id, plan_id, objective_id, name, responsable,
    budget_total, budget_liquidated, status, stage, area, objective,
    description, current_situation, goal_mid, goal_long, frequency,
    times_per_year, start_date, end_date, total_weeks, remaining_weeks, obstacles
  )
  SELECT 
    team_id, v_new_plan_id, NULL, name, responsable,
    0, 0, 'Pendiente', stage, area, objective,
    description, current_situation, goal_mid, goal_long, frequency,
    times_per_year, start_date, end_date, total_weeks, total_weeks, obstacles
  FROM activities
  WHERE plan_id = p_plan_id;
  
  RETURN v_new_plan_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Paso 4.4: Función para actualizar presupuesto calculado

```sql
-- Función para recalcular presupuesto de un equipo
CREATE OR REPLACE FUNCTION recalculate_team_budget(p_team_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_liquidated NUMERIC;
  v_pending NUMERIC;
  v_total NUMERIC;
BEGIN
  -- Calcular presupuesto liquidado
  SELECT COALESCE(SUM(budget_liquidated), 0) INTO v_liquidated
  FROM activities a
  JOIN development_plans dp ON dp.id = a.plan_id
  WHERE dp.team_id = p_team_id;
  
  -- Calcular presupuesto pendiente
  SELECT COALESCE(SUM(budget_total - budget_liquidated), 0) INTO v_pending
  FROM activities a
  JOIN development_plans dp ON dp.id = a.plan_id
  WHERE dp.team_id = p_team_id
  AND a.status = 'Pendiente';
  
  -- Obtener presupuesto asignado
  SELECT budget_assigned INTO v_total
  FROM teams
  WHERE id = p_team_id;
  
  RETURN jsonb_build_object(
    'team_id', p_team_id,
    'budget_assigned', v_total,
    'budget_liquidated', v_liquidated,
    'budget_pending', v_pending,
    'budget_available', v_total - v_liquidated
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 5. Triggers y Funciones Automáticas

### Paso 5.1: Función para actualizar `updated_at`

```sql
-- Función genérica para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Paso 5.2: Aplicar triggers de `updated_at`

```sql
-- Aplicar triggers a todas las tablas con updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_metrics_updated_at BEFORE UPDATE ON team_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_development_plans_updated_at BEFORE UPDATE ON development_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_area_objectives_updated_at BEFORE UPDATE ON area_objectives
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_allocations_updated_at BEFORE UPDATE ON budget_allocations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plan_lessons_updated_at BEFORE UPDATE ON plan_lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Paso 5.3: Trigger para registrar historial de planes

```sql
-- Función para registrar cambios en planes
CREATE OR REPLACE FUNCTION log_plan_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO plan_history (plan_id, changed_by, change_type, new_values)
    VALUES (
      NEW.id,
      auth.uid(),
      'created',
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO plan_history (plan_id, changed_by, change_type, old_values, new_values, description)
    VALUES (
      NEW.id,
      auth.uid(),
      CASE 
        WHEN OLD.status != NEW.status THEN 'status_changed'
        ELSE 'updated'
      END,
      to_jsonb(OLD),
      to_jsonb(NEW),
      CASE 
        WHEN OLD.status != NEW.status THEN 
          'Estado cambiado de ' || OLD.status || ' a ' || NEW.status
        ELSE NULL
      END
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO plan_history (plan_id, changed_by, change_type, old_values)
    VALUES (
      OLD.id,
      auth.uid(),
      'deleted',
      to_jsonb(OLD)
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger
CREATE TRIGGER log_development_plans_changes
  AFTER INSERT OR UPDATE OR DELETE ON development_plans
  FOR EACH ROW EXECUTE FUNCTION log_plan_changes();
```

### Paso 5.4: Trigger para crear perfil automáticamente

```sql
-- Función para crear perfil automáticamente cuando se crea un usuario
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'member')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger en auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## 6. Vistas Materializadas

### Paso 6.1: Vista materializada para métricas de equipo

```sql
-- Vista materializada para métricas agregadas de equipos
CREATE MATERIALIZED VIEW team_metrics_summary AS
SELECT 
  t.id AS team_id,
  t.name AS team_name,
  p.full_name AS leader_name,
  t.budget_assigned,
  COUNT(DISTINCT CASE WHEN dp.status = 'Activo' THEN dp.id END) AS active_plans_count,
  COUNT(DISTINCT CASE WHEN dp.status = 'Finalizado' THEN dp.id END) AS completed_plans_count,
  COUNT(DISTINCT CASE WHEN a.status = 'Pendiente' THEN a.id END) AS pending_activities_count,
  COUNT(DISTINCT CASE WHEN a.status = 'Hecha' THEN a.id END) AS done_activities_count,
  COALESCE(SUM(a.budget_liquidated), 0) AS total_budget_liquidated,
  COALESCE(SUM(CASE WHEN a.status = 'Pendiente' THEN (a.budget_total - a.budget_liquidated) ELSE 0 END), 0) AS total_budget_pending
FROM teams t
LEFT JOIN profiles p ON t.leader_id = p.id
LEFT JOIN development_plans dp ON dp.team_id = t.id
LEFT JOIN activities a ON a.plan_id = dp.id
GROUP BY t.id, t.name, p.full_name, t.budget_assigned;

-- Índice para la vista
CREATE UNIQUE INDEX ON team_metrics_summary (team_id);

-- Función para refrescar la vista
CREATE OR REPLACE FUNCTION refresh_team_metrics_summary()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY team_metrics_summary;
END;
$$ LANGUAGE plpgsql;
```

---

## 7. Datos de Prueba (Seeds)

### Paso 7.1: Crear usuarios de prueba

**⚠️ IMPORTANTE**: Primero debes crear los usuarios en Supabase Auth manualmente o vía API, luego ejecuta esto:

```sql
-- Actualizar perfiles de usuarios de prueba
-- Nota: Reemplaza los UUIDs con los IDs reales de tus usuarios en auth.users

-- Superadmin
-- UPDATE profiles SET 
--   username = 'superadmin',
--   full_name = 'Super Administrador',
--   role = 'superadmin'
-- WHERE id = 'UUID_DEL_USUARIO_SUPERADMIN';

-- Líderes
-- UPDATE profiles SET 
--   username = 'lider-bari',
--   full_name = 'Pepe (Líder Barí)',
--   role = 'leader'
-- WHERE id = 'UUID_DEL_USUARIO_LIDER_BARI';

-- UPDATE profiles SET 
--   username = 'lider-katios',
--   full_name = 'Carla (Líder Katíos)',
--   role = 'leader'
-- WHERE id = 'UUID_DEL_USUARIO_LIDER_KATIOS';
```

### Paso 7.2: Crear equipos de prueba

```sql
-- Insertar equipos de prueba
-- Nota: Reemplaza los UUIDs con los IDs reales de los líderes

INSERT INTO teams (id, name, leader_id, budget_assigned) VALUES
  ('team-1'::uuid, 'Barí', NULL, 60000),
  ('team-2'::uuid, 'Katíos', NULL, 75000)
ON CONFLICT (id) DO NOTHING;

-- Actualizar los perfiles con team_id
-- UPDATE profiles SET team_id = 'team-1'::uuid WHERE username = 'lider-bari';
-- UPDATE profiles SET team_id = 'team-2'::uuid WHERE username = 'lider-katios';

-- Actualizar teams con leader_id
-- UPDATE teams SET leader_id = (SELECT id FROM profiles WHERE username = 'lider-bari') WHERE id = 'team-1'::uuid;
-- UPDATE teams SET leader_id = (SELECT id FROM profiles WHERE username = 'lider-katios') WHERE id = 'team-2'::uuid;
```

### Paso 7.3: Crear planes y actividades de prueba

```sql
-- Planes de desarrollo
INSERT INTO development_plans (id, team_id, name, category, status, start_date, end_date, summary) VALUES
  ('plan-1'::uuid, 'team-1'::uuid, 'Investigación 2025', 'Investigación', 'Activo', '2025-01-10', '2025-12-20', 'Profundizar diagnóstico territorial'),
  ('plan-2'::uuid, 'team-1'::uuid, 'Autocuidado 2024', 'Autocuidado', 'Finalizado', '2024-03-01', '2024-11-30', 'Fortalecer bienestar del equipo'),
  ('plan-3'::uuid, 'team-2'::uuid, 'Encarnación 2025', 'Encarnación', 'Activo', '2025-02-01', '2025-11-15', 'Acompañar procesos comunitarios'),
  ('plan-4'::uuid, 'team-2'::uuid, 'Evangelización 2023', 'Evangelización', 'Archivado', '2023-03-10', '2023-12-12', 'Proceso de acompañamiento espiritual')
ON CONFLICT (id) DO NOTHING;

-- Actividades
INSERT INTO activities (
  id, team_id, plan_id, name, responsable, budget_total, budget_liquidated, 
  status, stage, area, objective, description, current_situation, goal_mid, goal_long,
  frequency, times_per_year, start_date, end_date, total_weeks, remaining_weeks, obstacles
) VALUES
  ('act-1'::uuid, 'team-1'::uuid, 'plan-1'::uuid, 'Cartografiado comunitario', 'Ana', 12000, 6000, 
   'Hecha', 'Diagnóstico', 'Territorio', 'Mapear comunidades clave', 
   'Se planificó junto con líderes locales', 'Fase inicial completada en 4 veredas', 
   'Completar cobertura 80% territorio', 'Cobertura total y documentación', 
   'Mensual', 6, '2025-01-15', '2025-04-30', 16, 0, 'Retrasos por clima'),
   
  ('act-2'::uuid, 'team-1'::uuid, 'plan-1'::uuid, 'Taller con sabedores', 'Luis', 8000, 0, 
   'Pendiente', 'Planeación', 'Cultura', 'Recoger saberes locales', 
   'Taller de transferencia con sabedores ancestrales', 'Convocatoria abierta pero sin fecha confirmada', 
   'Lograr asistencia de 30 líderes', 'Crear repositorio de saberes', 
   'Bimestral', 4, '2025-05-10', '2025-07-05', 8, 6, 'Disponibilidad de agenda'),
   
  ('act-3'::uuid, 'team-1'::uuid, 'plan-2'::uuid, 'Círculos de autocuidado', 'Marta', 5000, 5000, 
   'Hecha', 'Seguimiento', 'Cuidado', 'Crear espacios de escucha', 
   'Jornadas mensuales de acompañamiento', 'Se ejecutaron 8 sesiones', 
   'Mantener espacios quincenales', 'Consolidar red de apoyo', 
   'Mensual', 8, '2024-03-05', '2024-10-28', 32, 0, 'Ninguno'),
   
  ('act-4'::uuid, 'team-2'::uuid, 'plan-3'::uuid, 'Brigadas itinerantes', 'José', 15000, 7000, 
   'Hecha', 'Implementación', 'Campo', 'Instalar brigadas de salud', 
   'Recorridos por tres municipios priorizados', 'Un municipio cubierto', 
   'Cubrir los tres municipios', 'Instalar puestos permanentes', 
   'Quincenal', 10, '2025-02-10', '2025-08-30', 28, 12, 'Falta de transporte'),
   
  ('act-5'::uuid, 'team-2'::uuid, 'plan-3'::uuid, 'Escuela de liderazgo', 'Paula', 10000, 2000, 
   'Pendiente', 'Formación', 'Formación', 'Fortalecer líderes juveniles', 
   'Programa de diez módulos', 'Diseño curricular en progreso', 
   'Impulsar participación de 25 jóvenes', 'Graduar primera cohorte', 
   'Semanal', 12, '2025-06-05', '2025-10-25', 20, 18, 'Baja inscripción'),
   
  ('act-6'::uuid, 'team-2'::uuid, 'plan-4'::uuid, 'Encuentros comunitarios', 'Samuel', 6000, 6000, 
   'Hecha', 'Ejecución', 'Comunidad', 'Fortalecer redes de apoyo', 
   'Encuentros trimestrales', 'Se realizaron 4 encuentros', 
   'Repetir ciclo en 2025', 'Crear guía metodológica', 
   'Trimestral', 4, '2023-04-01', '2023-11-30', 32, 0, 'Clima lluvioso')
ON CONFLICT (id) DO NOTHING;
```

### Paso 7.4: Crear métricas de prueba

```sql
-- Métricas para equipo 1 (Barí)
INSERT INTO team_metrics (
  team_id, population, evangelical_congregations, evangelicals,
  first_time_contacts, interested_in_gospel, heard_gospel,
  seeking_god, opportunity_to_respond,
  believed_message, baptized,
  regular_bible_studies, personally_mentored, new_groups_this_year,
  ministerial_training, other_areas_training, pastoral_training, 
  biblical_training, church_planting_training,
  groups_with_church_prospects, churches_at_end_of_period,
  first_gen_churches, second_gen_churches, third_gen_churches,
  lost_first_gen_churches, lost_second_gen_churches, lost_third_gen_churches,
  ministry_location
) VALUES (
  'team-1'::uuid, 15000, 7, 350,
  15, 12, 20,
  9, 7,
  6, 4,
  10, 7, 4,
  6, 4, 3,
  8, 4,
  6, 3,
  2, 1, 0,
  0, 0, 0,
  'Ubicación team-1'
)
ON CONFLICT (team_id) DO UPDATE SET
  updated_at = NOW();

-- Métricas para equipo 2 (Katíos)
INSERT INTO team_metrics (
  team_id, population, evangelical_congregations, evangelicals,
  first_time_contacts, interested_in_gospel, heard_gospel,
  seeking_god, opportunity_to_respond,
  believed_message, baptized,
  regular_bible_studies, personally_mentored, new_groups_this_year,
  ministerial_training, other_areas_training, pastoral_training,
  biblical_training, church_planting_training,
  groups_with_church_prospects, churches_at_end_of_period,
  first_gen_churches, second_gen_churches, third_gen_churches,
  lost_first_gen_churches, lost_second_gen_churches, lost_third_gen_churches,
  ministry_location
) VALUES (
  'team-2'::uuid, 20000, 10, 500,
  20, 16, 25,
  12, 10,
  8, 6,
  14, 10, 6,
  8, 6, 4,
  10, 5,
  8, 4,
  3, 2, 1,
  0, 0, 0,
  'Ubicación team-2'
)
ON CONFLICT (team_id) DO UPDATE SET
  updated_at = NOW();
```

---

## 8. Configuración de Autenticación

### Paso 8.1: Configurar Supabase Auth

En el Dashboard de Supabase:

1. Ve a **Authentication** > **Settings**
2. Desactiva "Enable email confirmations" (opcional, según tu necesidad)
3. Configura "Site URL" con tu dominio
4. En **Email Templates**, puedes personalizar los mensajes

### Paso 8.2: Crear usuarios manualmente

Para crear usuarios de prueba:

1. Ve a **Authentication** > **Users**
2. Haz clic en **Add user** > **Create new user**
3. Para cada usuario:
   - **Email**: `username@misincol.local` (email sintético)
   - **Password**: La contraseña que quieras
   - **User Metadata**: 
     ```json
     {
       "username": "superadmin",
       "full_name": "Super Administrador",
       "role": "superadmin"
     }
     ```

Repite para:
- `lider-bari@misincol.local` con metadata `{"username": "lider-bari", "full_name": "Pepe", "role": "leader"}`
- `lider-katios@misincol.local` con metadata `{"username": "lider-katios", "full_name": "Carla", "role": "leader"}`

### Paso 8.3: Actualizar perfiles después de crear usuarios

Después de crear los usuarios en Auth, ejecuta:

```sql
-- Obtener los IDs de los usuarios creados y actualizar perfiles
-- Reemplaza los UUIDs con los reales de tus usuarios

-- UPDATE profiles SET 
--   username = 'superadmin',
--   full_name = 'Super Administrador',
--   role = 'superadmin'
-- WHERE id IN (SELECT id FROM auth.users WHERE email = 'superadmin@misincol.local');

-- UPDATE profiles SET 
--   username = 'lider-bari',
--   full_name = 'Pepe',
--   role = 'leader',
--   team_id = 'team-1'::uuid
-- WHERE id IN (SELECT id FROM auth.users WHERE email = 'lider-bari@misincol.local');

-- UPDATE profiles SET 
--   username = 'lider-katios',
--   full_name = 'Carla',
--   role = 'leader',
--   team_id = 'team-2'::uuid
-- WHERE id IN (SELECT id FROM auth.users WHERE email = 'lider-katios@misincol.local');

-- Actualizar teams con leader_id
-- UPDATE teams SET leader_id = (SELECT id FROM profiles WHERE username = 'lider-bari') WHERE id = 'team-1'::uuid;
-- UPDATE teams SET leader_id = (SELECT id FROM profiles WHERE username = 'lider-katios') WHERE id = 'team-2'::uuid;
```

---

## 9. Verificación y Testing

### Paso 9.1: Verificar estructura de tablas

```sql
-- Verificar que todas las tablas existen
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

### Paso 9.2: Verificar políticas RLS

```sql
-- Verificar políticas RLS activas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Paso 9.3: Verificar funciones RPC

```sql
-- Verificar funciones creadas
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION'
ORDER BY routine_name;
```

### Paso 9.4: Probar consultas básicas

```sql
-- Probar obtener métricas del dashboard
SELECT * FROM get_team_dashboard_metrics();

-- Probar obtener equipos (como superadmin)
SELECT * FROM teams;

-- Probar obtener planes
SELECT * FROM development_plans;

-- Probar obtener actividades
SELECT * FROM activities;
```

### Paso 9.5: Verificar triggers

```sql
-- Verificar triggers
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
```

---

## 📝 Notas Finales

### Orden de Ejecución Recomendado

1. **Paso 1**: Configuración inicial (extensiones y tipos)
2. **Paso 2**: Crear todas las tablas en orden
3. **Paso 3**: Configurar políticas RLS
4. **Paso 4**: Crear funciones RPC
5. **Paso 5**: Configurar triggers
6. **Paso 6**: Crear vistas materializadas
7. **Paso 8**: Configurar autenticación y crear usuarios
8. **Paso 7**: Insertar datos de prueba
9. **Paso 9**: Verificar todo

### Próximos Pasos

Una vez completado el backend:

1. Instalar `@supabase/supabase-js` en el frontend
2. Crear cliente de Supabase
3. Reemplazar `mock-data.ts` con llamadas a Supabase
4. Actualizar `auth-context.tsx` para usar Supabase Auth
5. Actualizar todas las páginas para usar datos reales

### Troubleshooting

- **Error de permisos**: Verifica que las políticas RLS estén correctamente configuradas
- **Error de foreign key**: Asegúrate de crear las tablas en el orden correcto
- **Error de función**: Verifica que las funciones helper (`get_user_role`, `get_user_team_id`) existan antes de crear políticas
- **Error de trigger**: Verifica que la función `handle_new_user` tenga permisos `SECURITY DEFINER`

---

¡Listo! Con estos pasos tendrás el backend completo funcionando en Supabase. 🚀

