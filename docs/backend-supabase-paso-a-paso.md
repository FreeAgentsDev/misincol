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
CREATE TYPE estado_actividad AS ENUM ('Hecha', 'Pendiente');

-- Tipos de categoría de plan
CREATE TYPE categoria_plan AS ENUM (
  'Investigación',
  'Encarnación',
  'Evangelización',
  'Entrenamiento',
  'Autocuidado'
);

-- Tipos de estado de plan
CREATE TYPE estado_plan AS ENUM ('Activo', 'Finalizado', 'Archivado');

-- Tipos de rol de usuario
CREATE TYPE rol_usuario AS ENUM ('superadmin', 'leader', 'member');
```

---

## 2. Esquema de Base de Datos

### Paso 2.1: Tabla `perfiles`

Esta tabla extiende la información de usuarios de Supabase Auth:

```sql
-- Tabla de perfiles de usuario
CREATE TABLE perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre_usuario TEXT UNIQUE NOT NULL,
  nombre_completo TEXT,
  rol rol_usuario NOT NULL DEFAULT 'member',
  id_equipo UUID REFERENCES equipos(id) ON DELETE SET NULL,
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_perfiles_nombre_usuario ON perfiles(nombre_usuario);
CREATE INDEX idx_perfiles_rol ON perfiles(rol);
CREATE INDEX idx_perfiles_id_equipo ON perfiles(id_equipo);

-- Comentarios
COMMENT ON TABLE perfiles IS 'Perfiles de usuario que extienden auth.users';
COMMENT ON COLUMN perfiles.nombre_usuario IS 'Nombre de usuario único para login';
COMMENT ON COLUMN perfiles.rol IS 'Rol del usuario: superadmin, leader o member';
COMMENT ON COLUMN perfiles.id_equipo IS 'ID del equipo al que pertenece (solo para leaders)';
```

### Paso 2.2: Tabla `equipos`

```sql
-- Tabla de equipos
CREATE TABLE equipos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  id_lider UUID REFERENCES perfiles(id) ON DELETE SET NULL,
  presupuesto_asignado NUMERIC(15, 2) DEFAULT 0 CHECK (presupuesto_asignado >= 0),
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_equipos_id_lider ON equipos(id_lider);

-- Comentarios
COMMENT ON TABLE equipos IS 'Equipos de trabajo del sistema';
COMMENT ON COLUMN equipos.presupuesto_asignado IS 'Presupuesto total asignado al equipo en COP';
```

### Paso 2.3: Tabla `miembros_equipo`

```sql
-- Tabla de miembros de equipo
CREATE TABLE miembros_equipo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_equipo UUID NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
  id_perfil UUID NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  rol TEXT NOT NULL DEFAULT 'member',
  activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(id_equipo, id_perfil)
);

-- Índices
CREATE INDEX idx_miembros_equipo_id_equipo ON miembros_equipo(id_equipo);
CREATE INDEX idx_miembros_equipo_id_perfil ON miembros_equipo(id_perfil);
CREATE INDEX idx_miembros_equipo_activo ON miembros_equipo(activo) WHERE activo = TRUE;

-- Comentarios
COMMENT ON TABLE miembros_equipo IS 'Relación muchos a muchos entre equipos y miembros';
```

### Paso 2.4: Tabla `metricas_equipo`

```sql
-- Tabla de métricas de equipo
CREATE TABLE metricas_equipo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_equipo UUID NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
  
  -- Métricas generales
  poblacion INTEGER,
  congregaciones_evangelicas INTEGER,
  evangelicos INTEGER,
  
  -- Etapa: Contacto
  contactos_primera_vez INTEGER,
  interesados_evangelio INTEGER,
  escucharon_evangelio INTEGER,
  
  -- Etapa: Comunicando
  buscando_dios INTEGER,
  oportunidad_responder INTEGER,
  
  -- Etapa: Respondiendo
  creyeron_mensaje INTEGER,
  bautizados INTEGER,
  
  -- Etapa: Consolidando
  estudios_biblicos_regulares INTEGER,
  discipulado_personal INTEGER,
  grupos_nuevos_este_ano INTEGER,
  
  -- Etapa: Liderazgo
  entrenamiento_ministerial INTEGER,
  entrenamiento_otras_areas INTEGER,
  entrenamiento_pastoral INTEGER,
  entrenamiento_biblico INTEGER,
  entrenamiento_plantacion_iglesias INTEGER,
  
  -- Desarrollo eclesial
  grupos_con_prospectos_iglesia INTEGER,
  iglesias_fin_periodo INTEGER,
  iglesias_primera_gen INTEGER,
  iglesias_segunda_gen INTEGER,
  iglesias_tercera_gen INTEGER,
  iglesias_perdidas_primera_gen INTEGER,
  iglesias_perdidas_segunda_gen INTEGER,
  iglesias_perdidas_tercera_gen INTEGER,
  
  -- Lugar de ministerio
  ubicacion_ministerio TEXT,
  
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(id_equipo)
);

-- Índices
CREATE INDEX idx_metricas_equipo_id_equipo ON metricas_equipo(id_equipo);

-- Comentarios
COMMENT ON TABLE metricas_equipo IS 'Métricas de seguimiento de cada equipo';
```

### Paso 2.5: Tabla `planes_desarrollo`

```sql
-- Tabla de planes de desarrollo
CREATE TABLE planes_desarrollo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_equipo UUID NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  categoria categoria_plan NOT NULL,
  estado estado_plan NOT NULL DEFAULT 'Activo',
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  summary TEXT,
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ DEFAULT NOW(),
  CHECK (fecha_fin >= fecha_inicio)
);

-- Índices
CREATE INDEX idx_planes_desarrollo_id_equipo ON planes_desarrollo(id_equipo);
CREATE INDEX idx_planes_desarrollo_status ON planes_desarrollo(status);
CREATE INDEX idx_planes_desarrollo_category ON planes_desarrollo(category);
CREATE INDEX idx_planes_desarrollo_dates ON planes_desarrollo(fecha_inicio, fecha_fin);

-- Comentarios
COMMENT ON TABLE planes_desarrollo IS 'Planes de desarrollo de cada equipo';
```

### Paso 2.6: Tabla `objetivos_area`

```sql
-- Tabla de objetivos de área
CREATE TABLE objetivos_area (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_plan UUID NOT NULL REFERENCES planes_desarrollo(id) ON DELETE CASCADE,
  categoria categoria_plan NOT NULL,
  description TEXT NOT NULL,
  numero_orden INTEGER NOT NULL DEFAULT 0,
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_objetivos_area_id_plan ON objetivos_area(id_plan);
CREATE INDEX idx_objetivos_area_category ON objetivos_area(category);

-- Comentarios
COMMENT ON TABLE objetivos_area IS 'Objetivos por área dentro de un plan';
```

### Paso 2.7: Tabla `actividades`

```sql
-- Tabla de actividades
CREATE TABLE actividades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_equipo UUID NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
  id_plan UUID NOT NULL REFERENCES planes_desarrollo(id) ON DELETE CASCADE,
  id_objetivo UUID REFERENCES objetivos_area(id) ON DELETE SET NULL,
  
  nombre TEXT NOT NULL,
  responsable TEXT NOT NULL,
  presupuesto_total NUMERIC(15, 2) DEFAULT 0 CHECK (presupuesto_total >= 0),
  presupuesto_liquidado NUMERIC(15, 2) DEFAULT 0 CHECK (presupuesto_liquidado >= 0),
  estado estado_actividad NOT NULL DEFAULT 'Pendiente',
  stage TEXT,
  area TEXT NOT NULL,
  objective TEXT,
  description TEXT,
  situacion_actual TEXT,
  objetivo_mediano TEXT,
  objetivo_largo TEXT,
  frequency TEXT,
  veces_por_ano INTEGER DEFAULT 0 CHECK (veces_por_ano >= 0),
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  semanas_totales INTEGER DEFAULT 0 CHECK (semanas_totales >= 0),
  semanas_restantes INTEGER DEFAULT 0 CHECK (semanas_restantes >= 0),
  obstacles TEXT,
  
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ DEFAULT NOW(),
  CHECK (fecha_fin >= fecha_inicio),
  CHECK (presupuesto_liquidado <= presupuesto_total)
);

-- Índices
CREATE INDEX idx_actividades_id_equipo ON actividades(id_equipo);
CREATE INDEX idx_actividades_id_plan ON actividades(id_plan);
CREATE INDEX idx_actividades_id_objetivo ON actividades(id_objetivo);
CREATE INDEX idx_actividades_status ON actividades(status);
CREATE INDEX idx_actividades_area ON actividades(area);
CREATE INDEX idx_actividades_dates ON actividades(fecha_inicio, fecha_fin);

-- Comentarios
COMMENT ON TABLE actividades IS 'Actividades dentro de los planes de desarrollo';
COMMENT ON COLUMN actividades.presupuesto_liquidado IS 'Presupuesto ya liquidado en COP';
```

### Paso 2.8: Tabla `asignaciones_actividad`

```sql
-- Tabla de asignaciones de actividades a miembros
CREATE TABLE asignaciones_actividad (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_actividad UUID NOT NULL REFERENCES actividades(id) ON DELETE CASCADE,
  id_perfil UUID NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  rol TEXT NOT NULL DEFAULT 'collaborator', -- 'responsible' o 'collaborator'
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(id_actividad, id_perfil)
);

-- Índices
CREATE INDEX idx_asignaciones_actividad_id_actividad ON asignaciones_actividad(id_actividad);
CREATE INDEX idx_asignaciones_actividad_id_perfil ON asignaciones_actividad(id_perfil);

-- Comentarios
COMMENT ON TABLE asignaciones_actividad IS 'Asignación de miembros a actividades';
```

### Paso 2.9: Tabla `actualizaciones_actividad`

```sql
-- Tabla de actualizaciones/seguimiento de actividades
CREATE TABLE actualizaciones_actividad (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_actividad UUID NOT NULL REFERENCES actividades(id) ON DELETE CASCADE,
  id_perfil UUID NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  texto_actualizacion TEXT NOT NULL,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_actualizaciones_actividad_id_actividad ON actualizaciones_actividad(id_actividad);
CREATE INDEX idx_actualizaciones_actividad_id_perfil ON actualizaciones_actividad(id_perfil);
CREATE INDEX idx_actualizaciones_actividad_creado_en ON actualizaciones_actividad(creado_en DESC);

-- Comentarios
COMMENT ON TABLE actualizaciones_actividad IS 'Registro de actualizaciones y seguimiento de actividades';
```

### Paso 2.10: Tabla `asignaciones_presupuesto`

```sql
-- Tabla de asignaciones presupuestales
CREATE TABLE asignaciones_presupuesto (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_equipo UUID NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
  id_plan UUID REFERENCES planes_desarrollo(id) ON DELETE SET NULL,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
  description TEXT,
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_asignaciones_presupuesto_id_equipo ON asignaciones_presupuesto(id_equipo);
CREATE INDEX idx_asignaciones_presupuesto_id_plan ON asignaciones_presupuesto(id_plan);

-- Comentarios
COMMENT ON TABLE asignaciones_presupuesto IS 'Asignaciones presupuestales por equipo y plan';
```

### Paso 2.11: Tabla `historial_plan`

```sql
-- Tabla de historial de cambios en planes
CREATE TABLE historial_plan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_plan UUID NOT NULL REFERENCES planes_desarrollo(id) ON DELETE CASCADE,
  modificado_por UUID NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  tipo_cambio TEXT NOT NULL, -- 'created', 'updated', 'status_changed', 'deleted'
  valores_anteriores JSONB,
  valores_nuevos JSONB,
  description TEXT,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_historial_plan_id_plan ON historial_plan(id_plan);
CREATE INDEX idx_historial_plan_modificado_por ON historial_plan(modificado_por);
CREATE INDEX idx_historial_plan_creado_en ON historial_plan(creado_en DESC);

-- Comentarios
COMMENT ON TABLE historial_plan IS 'Historial de cambios en planes de desarrollo';
```

### Paso 2.12: Tabla `lecciones_plan`

```sql
-- Tabla de aprendizajes de planes
CREATE TABLE lecciones_plan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_plan UUID NOT NULL REFERENCES planes_desarrollo(id) ON DELETE CASCADE,
  texto_leccion TEXT NOT NULL,
  creado_por UUID NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_lecciones_plan_id_plan ON lecciones_plan(id_plan);
CREATE INDEX idx_lecciones_plan_creado_por ON lecciones_plan(creado_por);

-- Comentarios
COMMENT ON TABLE lecciones_plan IS 'Aprendizajes y lecciones aprendidas de planes finalizados';
```

### Paso 2.13: Actualizar Foreign Key en `perfiles`

Ahora que `equipos` existe, actualizamos la referencia:

```sql
-- Agregar foreign key a perfiles.id_equipo (si no se creó antes)
ALTER TABLE perfiles 
ADD CONSTRAINT fk_perfiles_id_equipo 
FOREIGN KEY (id_equipo) REFERENCES equipos(id) ON DELETE SET NULL;
```

---

## 3. Políticas de Seguridad (RLS)

### Paso 3.1: Habilitar RLS en todas las tablas

```sql
-- Habilitar Row Level Security
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipos ENABLE ROW LEVEL SECURITY;
ALTER TABLE miembros_equipo ENABLE ROW LEVEL SECURITY;
ALTER TABLE metricas_equipo ENABLE ROW LEVEL SECURITY;
ALTER TABLE planes_desarrollo ENABLE ROW LEVEL SECURITY;
ALTER TABLE objetivos_area ENABLE ROW LEVEL SECURITY;
ALTER TABLE actividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE asignaciones_actividad ENABLE ROW LEVEL SECURITY;
ALTER TABLE actualizaciones_actividad ENABLE ROW LEVEL SECURITY;
ALTER TABLE asignaciones_presupuesto ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecciones_plan ENABLE ROW LEVEL SECURITY;
```

### Paso 3.2: Función helper para obtener el rol del usuario

```sql
-- Función para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION get_rol_usuario()
RETURNS rol_usuario AS $$
  SELECT rol FROM perfiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

### Paso 3.3: Función helper para obtener el id_equipo del usuario

```sql
-- Función para obtener el id_equipo del usuario actual (si es leader)
CREATE OR REPLACE FUNCTION get_user_id_equipo()
RETURNS UUID AS $$
  SELECT id_equipo FROM perfiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

### Paso 3.4: Políticas para `perfiles`

```sql
-- Superadmin puede ver todos los perfiles
CREATE POLICY "Superadmin can view all perfiles"
  ON perfiles FOR SELECT
  USING (get_rol_usuario() = 'superadmin');

-- Los usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile"
  ON perfiles FOR SELECT
  USING (auth.uid() = id);

-- Los líderes pueden ver perfiles de su equipo
CREATE POLICY "Leaders can view team perfiles"
  ON perfiles FOR SELECT
  USING (
    get_rol_usuario() = 'leader' 
    AND id_equipo = get_user_id_equipo()
  );

-- Superadmin puede insertar/actualizar perfiles
CREATE POLICY "Superadmin can manage perfiles"
  ON perfiles FOR ALL
  USING (get_rol_usuario() = 'superadmin')
  WITH CHECK (get_rol_usuario() = 'superadmin');

-- Los usuarios pueden actualizar su propio perfil (limitado)
CREATE POLICY "Users can update own profile"
  ON perfiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

### Paso 3.5: Políticas para `equipos`

```sql
-- Superadmin puede ver todos los equipos
CREATE POLICY "Superadmin can view all equipos"
  ON equipos FOR SELECT
  USING (get_rol_usuario() = 'superadmin');

-- Los líderes pueden ver su propio equipo
CREATE POLICY "Leaders can view own team"
  ON equipos FOR SELECT
  USING (
    get_rol_usuario() = 'leader' 
    AND id = get_user_id_equipo()
  );

-- Los miembros pueden ver su equipo
CREATE POLICY "Members can view own team"
  ON equipos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM miembros_equipo 
      WHERE id_equipo = equipos.id 
      AND id_perfil = auth.uid()
      AND activo = TRUE
    )
  );

-- Superadmin puede gestionar equipos
CREATE POLICY "Superadmin can manage equipos"
  ON equipos FOR ALL
  USING (get_rol_usuario() = 'superadmin')
  WITH CHECK (get_rol_usuario() = 'superadmin');
```

### Paso 3.6: Políticas para `miembros_equipo`

```sql
-- Superadmin puede ver todos los miembros
CREATE POLICY "Superadmin can view all team members"
  ON miembros_equipo FOR SELECT
  USING (get_rol_usuario() = 'superadmin');

-- Los líderes pueden ver miembros de su equipo
CREATE POLICY "Leaders can view team members"
  ON miembros_equipo FOR SELECT
  USING (
    get_rol_usuario() = 'leader' 
    AND id_equipo = get_user_id_equipo()
  );

-- Los miembros pueden ver otros miembros de su equipo
CREATE POLICY "Members can view own team members"
  ON miembros_equipo FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM miembros_equipo tm
      WHERE tm.id_equipo = miembros_equipo.id_equipo
      AND tm.id_perfil = auth.uid()
      AND tm.activo = TRUE
    )
  );

-- Superadmin y líderes pueden gestionar miembros
CREATE POLICY "Superadmin and leaders can manage team members"
  ON miembros_equipo FOR ALL
  USING (
    get_rol_usuario() = 'superadmin' 
    OR (get_rol_usuario() = 'leader' AND id_equipo = get_user_id_equipo())
  )
  WITH CHECK (
    get_rol_usuario() = 'superadmin' 
    OR (get_rol_usuario() = 'leader' AND id_equipo = get_user_id_equipo())
  );
```

### Paso 3.7: Políticas para `metricas_equipo`

```sql
-- Superadmin puede ver todas las métricas
CREATE POLICY "Superadmin can view all metrics"
  ON metricas_equipo FOR SELECT
  USING (get_rol_usuario() = 'superadmin');

-- Los líderes pueden ver métricas de su equipo
CREATE POLICY "Leaders can view own team metrics"
  ON metricas_equipo FOR SELECT
  USING (
    get_rol_usuario() = 'leader' 
    AND id_equipo = get_user_id_equipo()
  );

-- Los líderes pueden actualizar métricas de su equipo
CREATE POLICY "Leaders can update own team metrics"
  ON metricas_equipo FOR UPDATE
  USING (
    get_rol_usuario() = 'leader' 
    AND id_equipo = get_user_id_equipo()
  )
  WITH CHECK (
    get_rol_usuario() = 'leader' 
    AND id_equipo = get_user_id_equipo()
  );

-- Superadmin puede gestionar todas las métricas
CREATE POLICY "Superadmin can manage all metrics"
  ON metricas_equipo FOR ALL
  USING (get_rol_usuario() = 'superadmin')
  WITH CHECK (get_rol_usuario() = 'superadmin');
```

### Paso 3.8: Políticas para `planes_desarrollo`

```sql
-- Superadmin puede ver todos los planes
CREATE POLICY "Superadmin can view all plans"
  ON planes_desarrollo FOR SELECT
  USING (get_rol_usuario() = 'superadmin');

-- Los líderes pueden ver planes de su equipo
CREATE POLICY "Leaders can view own team plans"
  ON planes_desarrollo FOR SELECT
  USING (
    get_rol_usuario() = 'leader' 
    AND id_equipo = get_user_id_equipo()
  );

-- Los miembros pueden ver planes de su equipo
CREATE POLICY "Members can view own team plans"
  ON planes_desarrollo FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM miembros_equipo 
      WHERE id_equipo = planes_desarrollo.id_equipo 
      AND id_perfil = auth.uid()
      AND activo = TRUE
    )
  );

-- Superadmin puede gestionar todos los planes
CREATE POLICY "Superadmin can manage all plans"
  ON planes_desarrollo FOR ALL
  USING (get_rol_usuario() = 'superadmin')
  WITH CHECK (get_rol_usuario() = 'superadmin');

-- Los líderes pueden gestionar planes de su equipo
CREATE POLICY "Leaders can manage own team plans"
  ON planes_desarrollo FOR ALL
  USING (
    get_rol_usuario() = 'leader' 
    AND id_equipo = get_user_id_equipo()
  )
  WITH CHECK (
    get_rol_usuario() = 'leader' 
    AND id_equipo = get_user_id_equipo()
  );
```

### Paso 3.9: Políticas para `actividades`

```sql
-- Superadmin puede ver todas las actividades
CREATE POLICY "Superadmin can view all actividades"
  ON actividades FOR SELECT
  USING (get_rol_usuario() = 'superadmin');

-- Los líderes pueden ver actividades de su equipo
CREATE POLICY "Leaders can view own team actividades"
  ON actividades FOR SELECT
  USING (
    get_rol_usuario() = 'leader' 
    AND id_equipo = get_user_id_equipo()
  );

-- Los miembros pueden ver actividades de su equipo
CREATE POLICY "Members can view own team actividades"
  ON actividades FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM miembros_equipo 
      WHERE id_equipo = actividades.id_equipo 
      AND id_perfil = auth.uid()
      AND activo = TRUE
    )
  );

-- Superadmin puede gestionar todas las actividades
CREATE POLICY "Superadmin can manage all actividades"
  ON actividades FOR ALL
  USING (get_rol_usuario() = 'superadmin')
  WITH CHECK (get_rol_usuario() = 'superadmin');

-- Los líderes pueden gestionar actividades de su equipo
CREATE POLICY "Leaders can manage own team actividades"
  ON actividades FOR ALL
  USING (
    get_rol_usuario() = 'leader' 
    AND id_equipo = get_user_id_equipo()
  )
  WITH CHECK (
    get_rol_usuario() = 'leader' 
    AND id_equipo = get_user_id_equipo()
  );
```

### Paso 3.10: Políticas para tablas relacionadas

```sql
-- Políticas para objetivos_area
CREATE POLICY "Superadmin can manage area objectives"
  ON objetivos_area FOR ALL
  USING (get_rol_usuario() = 'superadmin')
  WITH CHECK (get_rol_usuario() = 'superadmin');

CREATE POLICY "Leaders can manage own team area objectives"
  ON objetivos_area FOR ALL
  USING (
    get_rol_usuario() = 'leader' 
    AND EXISTS (
      SELECT 1 FROM planes_desarrollo 
      WHERE id = objetivos_area.id_plan 
      AND id_equipo = get_user_id_equipo()
    )
  )
  WITH CHECK (
    get_rol_usuario() = 'leader' 
    AND EXISTS (
      SELECT 1 FROM planes_desarrollo 
      WHERE id = objetivos_area.id_plan 
      AND id_equipo = get_user_id_equipo()
    )
  );

-- Políticas para asignaciones_actividad
CREATE POLICY "Users can view own assignments"
  ON asignaciones_actividad FOR SELECT
  USING (
    id_perfil = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM actividades a
      JOIN miembros_equipo tm ON tm.id_equipo = a.id_equipo
      WHERE a.id = asignaciones_actividad.id_actividad
      AND tm.id_perfil = auth.uid()
      AND tm.activo = TRUE
    )
  );

CREATE POLICY "Leaders can manage team assignments"
  ON asignaciones_actividad FOR ALL
  USING (
    get_rol_usuario() = 'leader' 
    AND EXISTS (
      SELECT 1 FROM actividades a
      WHERE a.id = asignaciones_actividad.id_actividad
      AND a.id_equipo = get_user_id_equipo()
    )
  );

-- Políticas para actualizaciones_actividad
CREATE POLICY "Users can view team activity updates"
  ON actualizaciones_actividad FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM actividades a
      JOIN miembros_equipo tm ON tm.id_equipo = a.id_equipo
      WHERE a.id = actualizaciones_actividad.id_actividad
      AND tm.id_perfil = auth.uid()
      AND tm.activo = TRUE
    )
  );

CREATE POLICY "Users can create activity updates"
  ON actualizaciones_actividad FOR INSERT
  WITH CHECK (
    id_perfil = auth.uid()
    AND EXISTS (
      SELECT 1 FROM actividades a
      JOIN miembros_equipo tm ON tm.id_equipo = a.id_equipo
      WHERE a.id = actualizaciones_actividad.id_actividad
      AND tm.id_perfil = auth.uid()
      AND tm.activo = TRUE
    )
  );

-- Políticas para asignaciones_presupuesto
CREATE POLICY "Superadmin can manage all budgets"
  ON asignaciones_presupuesto FOR ALL
  USING (get_rol_usuario() = 'superadmin')
  WITH CHECK (get_rol_usuario() = 'superadmin');

CREATE POLICY "Leaders can view own team budgets"
  ON asignaciones_presupuesto FOR SELECT
  USING (
    get_rol_usuario() = 'leader' 
    AND id_equipo = get_user_id_equipo()
  );

-- Políticas para historial_plan
CREATE POLICY "Users can view plan history"
  ON historial_plan FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM planes_desarrollo dp
      JOIN miembros_equipo tm ON tm.id_equipo = dp.id_equipo
      WHERE dp.id = historial_plan.id_plan
      AND tm.id_perfil = auth.uid()
      AND tm.activo = TRUE
    )
    OR get_rol_usuario() = 'superadmin'
  );

-- Políticas para lecciones_plan
CREATE POLICY "Users can view plan lessons"
  ON lecciones_plan FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM planes_desarrollo dp
      JOIN miembros_equipo tm ON tm.id_equipo = dp.id_equipo
      WHERE dp.id = lecciones_plan.id_plan
      AND tm.id_perfil = auth.uid()
      AND tm.activo = TRUE
    )
    OR get_rol_usuario() = 'superadmin'
  );

CREATE POLICY "Leaders can manage own team lessons"
  ON lecciones_plan FOR ALL
  USING (
    get_rol_usuario() = 'leader' 
    AND EXISTS (
      SELECT 1 FROM planes_desarrollo 
      WHERE id = lecciones_plan.id_plan 
      AND id_equipo = get_user_id_equipo()
    )
  );
```

---

## 4. Funciones RPC

### Paso 4.1: Función de login por nombre_usuario

```sql
-- Función para login por nombre_usuario (alternativa a email)
CREATE OR REPLACE FUNCTION auth.iniciar_sesion_con_usuario(
  p_nombre_usuario TEXT,
  p_password TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_email TEXT;
  v_profile RECORD;
BEGIN
  -- Buscar el perfil por nombre_usuario
  SELECT id, (SELECT email FROM auth.users WHERE id = perfiles.id) as email
  INTO v_profile
  FROM perfiles
  WHERE nombre_usuario = p_nombre_usuario;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Usuario no encontrado');
  END IF;
  
  -- Verificar contraseña usando auth.users
  -- Nota: Esta función requiere que el email en auth.users sea nombre_usuario@misincol.local
  -- y que la contraseña coincida
  v_email := v_profile.email;
  
  -- Retornar información del usuario (la autenticación real se hace en el cliente)
  RETURN jsonb_build_object(
    'user_id', v_profile.id,
    'nombre_usuario', p_nombre_usuario,
    'email', v_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Paso 4.2: Función para obtener métricas del dashboard

```sql
-- Función para obtener métricas del dashboard por equipo
CREATE OR REPLACE FUNCTION obtener_metricas_dashboard_equipo()
RETURNS TABLE (
  id_equipo UUID,
  team_name TEXT,
  leader TEXT,
  active_id_plan UUID,
  active_plan_name TEXT,
  completed_plans_count BIGINT,
  pending_actividades_count BIGINT,
  done_actividades_count BIGINT,
  presupuesto_liquidado NUMERIC,
  budget_pending NUMERIC,
  presupuesto_asignado NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id AS id_equipo,
    t.name AS team_name,
    COALESCE(p.nombre_completo, p.nombre_usuario, 'Sin líder') AS leader,
    dp_active.id AS active_id_plan,
    dp_active.name AS active_plan_name,
    COUNT(DISTINCT CASE WHEN dp.status = 'Finalizado' THEN dp.id END) AS completed_plans_count,
    COUNT(DISTINCT CASE WHEN a.status = 'Pendiente' THEN a.id END) AS pending_actividades_count,
    COUNT(DISTINCT CASE WHEN a.status = 'Hecha' THEN a.id END) AS done_actividades_count,
    COALESCE(SUM(a.presupuesto_liquidado), 0) AS presupuesto_liquidado,
    COALESCE(SUM(CASE WHEN a.status = 'Pendiente' THEN (a.presupuesto_total - a.presupuesto_liquidado) ELSE 0 END), 0) AS budget_pending,
    t.presupuesto_asignado AS presupuesto_asignado
  FROM equipos t
  LEFT JOIN perfiles p ON t.id_lider = p.id
  LEFT JOIN planes_desarrollo dp_active ON dp_active.id_equipo = t.id AND dp_active.status = 'Activo'
  LEFT JOIN planes_desarrollo dp ON dp.id_equipo = t.id
  LEFT JOIN actividades a ON a.id_plan = dp.id
  GROUP BY t.id, t.name, p.nombre_completo, p.nombre_usuario, dp_active.id, dp_active.name, t.presupuesto_asignado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Paso 4.3: Función para duplicar un plan

```sql
-- Función para duplicar un plan con sus actividades
CREATE OR REPLACE FUNCTION duplicar_plan(
  p_id_plan UUID,
  p_new_name TEXT,
  p_new_fecha_inicio DATE,
  p_new_fecha_fin DATE
)
RETURNS UUID AS $$
DECLARE
  v_new_id_plan UUID;
  v_old_plan RECORD;
BEGIN
  -- Obtener el plan original
  SELECT * INTO v_old_plan
  FROM planes_desarrollo
  WHERE id = p_id_plan;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Plan no encontrado';
  END IF;
  
  -- Crear el nuevo plan
  INSERT INTO planes_desarrollo (
    id_equipo, name, category, status, fecha_inicio, fecha_fin, summary
  )
  VALUES (
    v_old_plan.id_equipo,
    p_new_name,
    v_old_plan.category,
    'Activo',
    p_new_fecha_inicio,
    p_new_fecha_fin,
    v_old_plan.summary
  )
  RETURNING id INTO v_new_id_plan;
  
  -- Duplicar objetivos de área
  INSERT INTO objetivos_area (id_plan, category, description, numero_orden)
  SELECT v_new_id_plan, category, description, numero_orden
  FROM objetivos_area
  WHERE id_plan = p_id_plan;
  
  -- Duplicar actividades
  INSERT INTO actividades (
    id_equipo, id_plan, id_objetivo, name, responsable,
    presupuesto_total, presupuesto_liquidado, status, stage, area, objective,
    description, situacion_actual, objetivo_mediano, objetivo_largo, frequency,
    veces_por_ano, fecha_inicio, fecha_fin, semanas_totales, semanas_restantes, obstacles
  )
  SELECT 
    id_equipo, v_new_id_plan, NULL, name, responsable,
    0, 0, 'Pendiente', stage, area, objective,
    description, situacion_actual, objetivo_mediano, objetivo_largo, frequency,
    veces_por_ano, fecha_inicio, fecha_fin, semanas_totales, semanas_totales, obstacles
  FROM actividades
  WHERE id_plan = p_id_plan;
  
  RETURN v_new_id_plan;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Paso 4.4: Función para actualizar presupuesto calculado

```sql
-- Función para recalcular presupuesto de un equipo
CREATE OR REPLACE FUNCTION recalcular_presupuesto_equipo(p_id_equipo UUID)
RETURNS JSONB AS $$
DECLARE
  v_liquidated NUMERIC;
  v_pending NUMERIC;
  v_total NUMERIC;
BEGIN
  -- Calcular presupuesto liquidado
  SELECT COALESCE(SUM(presupuesto_liquidado), 0) INTO v_liquidated
  FROM actividades a
  JOIN planes_desarrollo dp ON dp.id = a.id_plan
  WHERE dp.id_equipo = p_id_equipo;
  
  -- Calcular presupuesto pendiente
  SELECT COALESCE(SUM(presupuesto_total - presupuesto_liquidado), 0) INTO v_pending
  FROM actividades a
  JOIN planes_desarrollo dp ON dp.id = a.id_plan
  WHERE dp.id_equipo = p_id_equipo
  AND a.status = 'Pendiente';
  
  -- Obtener presupuesto asignado
  SELECT presupuesto_asignado INTO v_total
  FROM equipos
  WHERE id = p_id_equipo;
  
  RETURN jsonb_build_object(
    'id_equipo', p_id_equipo,
    'presupuesto_asignado', v_total,
    'presupuesto_liquidado', v_liquidated,
    'budget_pending', v_pending,
    'budget_available', v_total - v_liquidated
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 5. Triggers y Funciones Automáticas

### Paso 5.1: Función para actualizar `actualizado_en`

```sql
-- Función genérica para actualizar actualizado_en
CREATE OR REPLACE FUNCTION update_actualizado_en_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Paso 5.2: Aplicar triggers de `actualizado_en`

```sql
-- Aplicar triggers a todas las tablas con actualizado_en
CREATE TRIGGER update_perfiles_actualizado_en BEFORE UPDATE ON perfiles
  FOR EACH ROW EXECUTE FUNCTION update_actualizado_en_column();

CREATE TRIGGER update_equipos_actualizado_en BEFORE UPDATE ON equipos
  FOR EACH ROW EXECUTE FUNCTION update_actualizado_en_column();

CREATE TRIGGER update_miembros_equipo_actualizado_en BEFORE UPDATE ON miembros_equipo
  FOR EACH ROW EXECUTE FUNCTION update_actualizado_en_column();

CREATE TRIGGER update_metricas_equipo_actualizado_en BEFORE UPDATE ON metricas_equipo
  FOR EACH ROW EXECUTE FUNCTION update_actualizado_en_column();

CREATE TRIGGER update_planes_desarrollo_actualizado_en BEFORE UPDATE ON planes_desarrollo
  FOR EACH ROW EXECUTE FUNCTION update_actualizado_en_column();

CREATE TRIGGER update_objetivos_area_actualizado_en BEFORE UPDATE ON objetivos_area
  FOR EACH ROW EXECUTE FUNCTION update_actualizado_en_column();

CREATE TRIGGER update_actividades_actualizado_en BEFORE UPDATE ON actividades
  FOR EACH ROW EXECUTE FUNCTION update_actualizado_en_column();

CREATE TRIGGER update_asignaciones_presupuesto_actualizado_en BEFORE UPDATE ON asignaciones_presupuesto
  FOR EACH ROW EXECUTE FUNCTION update_actualizado_en_column();

CREATE TRIGGER update_lecciones_plan_actualizado_en BEFORE UPDATE ON lecciones_plan
  FOR EACH ROW EXECUTE FUNCTION update_actualizado_en_column();
```

### Paso 5.3: Trigger para registrar historial de planes

```sql
-- Función para registrar cambios en planes
CREATE OR REPLACE FUNCTION registrar_cambios_plan()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO historial_plan (id_plan, modificado_por, tipo_cambio, valores_nuevos)
    VALUES (
      NEW.id,
      auth.uid(),
      'created',
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO historial_plan (id_plan, modificado_por, tipo_cambio, valores_anteriores, valores_nuevos, description)
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
    INSERT INTO historial_plan (id_plan, modificado_por, tipo_cambio, valores_anteriores)
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
CREATE TRIGGER log_planes_desarrollo_changes
  AFTER INSERT OR UPDATE OR DELETE ON planes_desarrollo
  FOR EACH ROW EXECUTE FUNCTION registrar_cambios_plan();
```

### Paso 5.4: Trigger para crear perfil automáticamente

```sql
-- Función para crear perfil automáticamente cuando se crea un usuario
CREATE OR REPLACE FUNCTION manejar_nuevo_usuario()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfiles (id, nombre_usuario, nombre_completo, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre_usuario', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'nombre_completo', NEW.raw_user_meta_data->>'name'),
    COALESCE((NEW.raw_user_meta_data->>'role')::rol_usuario, 'member')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger en auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION manejar_nuevo_usuario();
```

---

## 6. Vistas Materializadas

### Paso 6.1: Vista materializada para métricas de equipo

```sql
-- Vista materializada para métricas agregadas de equipos
CREATE MATERIALIZED VIEW metricas_equipo_summary AS
SELECT 
  t.id AS id_equipo,
  t.name AS team_name,
  p.nombre_completo AS leader_name,
  t.presupuesto_asignado,
  COUNT(DISTINCT CASE WHEN dp.status = 'Activo' THEN dp.id END) AS active_plans_count,
  COUNT(DISTINCT CASE WHEN dp.status = 'Finalizado' THEN dp.id END) AS completed_plans_count,
  COUNT(DISTINCT CASE WHEN a.status = 'Pendiente' THEN a.id END) AS pending_actividades_count,
  COUNT(DISTINCT CASE WHEN a.status = 'Hecha' THEN a.id END) AS done_actividades_count,
  COALESCE(SUM(a.presupuesto_liquidado), 0) AS total_presupuesto_liquidado,
  COALESCE(SUM(CASE WHEN a.status = 'Pendiente' THEN (a.presupuesto_total - a.presupuesto_liquidado) ELSE 0 END), 0) AS total_budget_pending
FROM equipos t
LEFT JOIN perfiles p ON t.id_lider = p.id
LEFT JOIN planes_desarrollo dp ON dp.id_equipo = t.id
LEFT JOIN actividades a ON a.id_plan = dp.id
GROUP BY t.id, t.name, p.nombre_completo, t.presupuesto_asignado;

-- Índice para la vista
CREATE UNIQUE INDEX ON metricas_equipo_summary (id_equipo);

-- Función para refrescar la vista
CREATE OR REPLACE FUNCTION actualizar_resumen_metricas_equipo()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY metricas_equipo_summary;
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
-- UPDATE perfiles SET 
--   nombre_usuario = 'superadmin',
--   nombre_completo = 'Super Administrador',
--   role = 'superadmin'
-- WHERE id = 'UUID_DEL_USUARIO_SUPERADMIN';

-- Líderes
-- UPDATE perfiles SET 
--   nombre_usuario = 'lider-bari',
--   nombre_completo = 'Pepe (Líder Barí)',
--   role = 'leader'
-- WHERE id = 'UUID_DEL_USUARIO_LIDER_BARI';

-- UPDATE perfiles SET 
--   nombre_usuario = 'lider-katios',
--   nombre_completo = 'Carla (Líder Katíos)',
--   role = 'leader'
-- WHERE id = 'UUID_DEL_USUARIO_LIDER_KATIOS';
```

### Paso 7.2: Crear equipos de prueba

```sql
-- Insertar equipos de prueba
-- Nota: Reemplaza los UUIDs con los IDs reales de los líderes

INSERT INTO equipos (id, name, id_lider, presupuesto_asignado) VALUES
  ('team-1'::uuid, 'Barí', NULL, 60000),
  ('team-2'::uuid, 'Katíos', NULL, 75000)
ON CONFLICT (id) DO NOTHING;

-- Actualizar los perfiles con id_equipo
-- UPDATE perfiles SET id_equipo = 'team-1'::uuid WHERE nombre_usuario = 'lider-bari';
-- UPDATE perfiles SET id_equipo = 'team-2'::uuid WHERE nombre_usuario = 'lider-katios';

-- Actualizar equipos con id_lider
-- UPDATE equipos SET id_lider = (SELECT id FROM perfiles WHERE nombre_usuario = 'lider-bari') WHERE id = 'team-1'::uuid;
-- UPDATE equipos SET id_lider = (SELECT id FROM perfiles WHERE nombre_usuario = 'lider-katios') WHERE id = 'team-2'::uuid;
```

### Paso 7.3: Crear planes y actividades de prueba

```sql
-- Planes de desarrollo
INSERT INTO planes_desarrollo (id, id_equipo, name, category, status, fecha_inicio, fecha_fin, summary) VALUES
  ('plan-1'::uuid, 'team-1'::uuid, 'Investigación 2025', 'Investigación', 'Activo', '2025-01-10', '2025-12-20', 'Profundizar diagnóstico territorial'),
  ('plan-2'::uuid, 'team-1'::uuid, 'Autocuidado 2024', 'Autocuidado', 'Finalizado', '2024-03-01', '2024-11-30', 'Fortalecer bienestar del equipo'),
  ('plan-3'::uuid, 'team-2'::uuid, 'Encarnación 2025', 'Encarnación', 'Activo', '2025-02-01', '2025-11-15', 'Acompañar procesos comunitarios'),
  ('plan-4'::uuid, 'team-2'::uuid, 'Evangelización 2023', 'Evangelización', 'Archivado', '2023-03-10', '2023-12-12', 'Proceso de acompañamiento espiritual')
ON CONFLICT (id) DO NOTHING;

-- Actividades
INSERT INTO actividades (
  id, id_equipo, id_plan, name, responsable, presupuesto_total, presupuesto_liquidado, 
  status, stage, area, objective, description, situacion_actual, objetivo_mediano, objetivo_largo,
  frequency, veces_por_ano, fecha_inicio, fecha_fin, semanas_totales, semanas_restantes, obstacles
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
INSERT INTO metricas_equipo (
  id_equipo, population, evangelical_congregations, evangelicals,
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
ON CONFLICT (id_equipo) DO UPDATE SET
  actualizado_en = NOW();

-- Métricas para equipo 2 (Katíos)
INSERT INTO metricas_equipo (
  id_equipo, population, evangelical_congregations, evangelicals,
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
ON CONFLICT (id_equipo) DO UPDATE SET
  actualizado_en = NOW();
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
   - **Email**: `nombre_usuario@misincol.local` (email sintético)
   - **Password**: La contraseña que quieras
   - **User Metadata**: 
     ```json
     {
       "nombre_usuario": "superadmin",
       "nombre_completo": "Super Administrador",
       "role": "superadmin"
     }
     ```

Repite para:
- `lider-bari@misincol.local` con metadata `{"nombre_usuario": "lider-bari", "nombre_completo": "Pepe", "role": "leader"}`
- `lider-katios@misincol.local` con metadata `{"nombre_usuario": "lider-katios", "nombre_completo": "Carla", "role": "leader"}`

### Paso 8.3: Actualizar perfiles después de crear usuarios

Después de crear los usuarios en Auth, ejecuta:

```sql
-- Obtener los IDs de los usuarios creados y actualizar perfiles
-- Reemplaza los UUIDs con los reales de tus usuarios

-- UPDATE perfiles SET 
--   nombre_usuario = 'superadmin',
--   nombre_completo = 'Super Administrador',
--   role = 'superadmin'
-- WHERE id IN (SELECT id FROM auth.users WHERE email = 'superadmin@misincol.local');

-- UPDATE perfiles SET 
--   nombre_usuario = 'lider-bari',
--   nombre_completo = 'Pepe',
--   role = 'leader',
--   id_equipo = 'team-1'::uuid
-- WHERE id IN (SELECT id FROM auth.users WHERE email = 'lider-bari@misincol.local');

-- UPDATE perfiles SET 
--   nombre_usuario = 'lider-katios',
--   nombre_completo = 'Carla',
--   role = 'leader',
--   id_equipo = 'team-2'::uuid
-- WHERE id IN (SELECT id FROM auth.users WHERE email = 'lider-katios@misincol.local');

-- Actualizar equipos con id_lider
-- UPDATE equipos SET id_lider = (SELECT id FROM perfiles WHERE nombre_usuario = 'lider-bari') WHERE id = 'team-1'::uuid;
-- UPDATE equipos SET id_lider = (SELECT id FROM perfiles WHERE nombre_usuario = 'lider-katios') WHERE id = 'team-2'::uuid;
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
SELECT * FROM obtener_metricas_dashboard_equipo();

-- Probar obtener equipos (como superadmin)
SELECT * FROM equipos;

-- Probar obtener planes
SELECT * FROM planes_desarrollo;

-- Probar obtener actividades
SELECT * FROM actividades;
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
- **Error de función**: Verifica que las funciones helper (`get_rol_usuario`, `get_user_id_equipo`) existan antes de crear políticas
- **Error de trigger**: Verifica que la función `manejar_nuevo_usuario` tenga permisos `SECURITY DEFINER`

---

¡Listo! Con estos pasos tendrás el backend completo funcionando en Supabase. 🚀

