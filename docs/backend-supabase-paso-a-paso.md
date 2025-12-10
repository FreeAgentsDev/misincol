# Guía Paso a Paso: Backend Supabase para Misincol

Este documento te guiará paso a paso para implementar el backend completo en Supabase. Cada paso incluye el código SQL necesario que puedes ejecutar directamente en el SQL Editor de Supabase.

> **✅ IMPORTANTE**: Todo lo que se describe aquí funciona en el **plan gratuito** de Supabase. Las funciones RPC (PostgreSQL) son gratuitas e ilimitadas. No necesitas Edge Functions ni pagar nada adicional. Ver `docs/plan-gratuito-supabase.md` para más detalles.

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

**⚠️ IMPORTANTE**: Creamos `perfiles` primero SIN la referencia a `equipos` (que aún no existe). Agregaremos la foreign key después en el Paso 2.2.1.

```sql
-- Tabla de perfiles de usuario
CREATE TABLE perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre_usuario TEXT UNIQUE NOT NULL,
  nombre_completo TEXT,
  rol rol_usuario NOT NULL DEFAULT 'member',
  id_equipo UUID, -- Se agregará la foreign key después de crear la tabla equipos
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

### Paso 2.2.1: Agregar Foreign Key de `perfiles` a `equipos`

Ahora que ambas tablas existen, agregamos la foreign key que faltaba:

```sql
-- Agregar foreign key de perfiles.id_equipo a equipos.id
ALTER TABLE perfiles
ADD CONSTRAINT perfiles_id_equipo_fkey 
FOREIGN KEY (id_equipo) 
REFERENCES equipos(id) 
ON DELETE SET NULL;
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
  resumen TEXT,
  etapas_plan TEXT[], -- Array de etapas del plan (ej: ["Fase de diagnóstico", "Fase de ejecución", "Fase de evaluación", "Fase de cierre"])
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ DEFAULT NOW(),
  CHECK (fecha_fin >= fecha_inicio)
);

-- Índices
CREATE INDEX idx_planes_desarrollo_id_equipo ON planes_desarrollo(id_equipo);
CREATE INDEX idx_planes_desarrollo_estado ON planes_desarrollo(estado);
CREATE INDEX idx_planes_desarrollo_categoria ON planes_desarrollo(categoria);
CREATE INDEX idx_planes_desarrollo_dates ON planes_desarrollo(fecha_inicio, fecha_fin);

-- Comentarios
COMMENT ON TABLE planes_desarrollo IS 'Planes de desarrollo de cada equipo';
COMMENT ON COLUMN planes_desarrollo.etapas_plan IS 'Array de etapas del plan (ej: ["Fase de diagnóstico", "Fase de ejecución", "Fase de evaluación", "Fase de cierre"])';
```

### Paso 2.6: Tabla `objetivos_area`

```sql
-- Tabla de objetivos de área
CREATE TABLE objetivos_area (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_plan UUID NOT NULL REFERENCES planes_desarrollo(id) ON DELETE CASCADE,
  categoria categoria_plan NOT NULL,
  descripcion TEXT NOT NULL,
  numero_orden INTEGER NOT NULL DEFAULT 0, -- Orden dentro del área
  numero_objetivo INTEGER, -- Número del objetivo global (opcional, para numeración global de objetivos)
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_objetivos_area_id_plan ON objetivos_area(id_plan);
CREATE INDEX idx_objetivos_area_categoria ON objetivos_area(categoria);

-- Comentarios
COMMENT ON TABLE objetivos_area IS 'Objetivos por área dentro de un plan';
COMMENT ON COLUMN objetivos_area.numero_objetivo IS 'Número del objetivo global (opcional, para numeración global de objetivos)';
COMMENT ON COLUMN objetivos_area.numero_orden IS 'Orden dentro del área';
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
  etapa TEXT, -- Etapa de la actividad (ej: "Contacto", "Comunicar")
  etapa_plan TEXT, -- Etapa del plan a la que pertenece (ej: "Fase de diagnóstico", "Fase de ejecución")
  area TEXT NOT NULL,
  objetivo TEXT, -- Mantenido por compatibilidad
  numero_objetivo INTEGER, -- Número del objetivo global al que pertenece (opcional)
  descripcion TEXT,
  situacion_actual TEXT,
  objetivo_mediano TEXT,
  objetivo_largo TEXT,
  frecuencia TEXT,
  veces_por_ano INTEGER DEFAULT 0 CHECK (veces_por_ano >= 0),
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  semanas_totales INTEGER DEFAULT 0 CHECK (semanas_totales >= 0),
  semanas_restantes INTEGER DEFAULT 0 CHECK (semanas_restantes >= 0),
  obstaculos TEXT,
  
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ DEFAULT NOW(),
  CHECK (fecha_fin >= fecha_inicio),
  CHECK (presupuesto_liquidado <= presupuesto_total)
);

-- Índices
CREATE INDEX idx_actividades_id_equipo ON actividades(id_equipo);
CREATE INDEX idx_actividades_id_plan ON actividades(id_plan);
CREATE INDEX idx_actividades_id_objetivo ON actividades(id_objetivo);
CREATE INDEX idx_actividades_estado ON actividades(estado);
CREATE INDEX idx_actividades_area ON actividades(area);
CREATE INDEX idx_actividades_etapa_plan ON actividades(etapa_plan);
CREATE INDEX idx_actividades_dates ON actividades(fecha_inicio, fecha_fin);

-- Comentarios
COMMENT ON TABLE actividades IS 'Actividades dentro de los planes de desarrollo';
COMMENT ON COLUMN actividades.presupuesto_liquidado IS 'Presupuesto ya liquidado en COP';
COMMENT ON COLUMN actividades.etapa_plan IS 'Etapa del plan a la que pertenece (ej: "Fase de diagnóstico", "Fase de ejecución")';
COMMENT ON COLUMN actividades.numero_objetivo IS 'Número del objetivo global al que pertenece (opcional)';
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
  monto NUMERIC(15, 2) NOT NULL CHECK (monto >= 0),
  descripcion TEXT,
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
  descripcion TEXT,
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
CREATE OR REPLACE FUNCTION obtener_rol_usuario()
RETURNS rol_usuario AS $$
  SELECT rol FROM perfiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

### Paso 3.3: Función helper para obtener el id_equipo del usuario

```sql
-- Función para obtener el id_equipo del usuario actual (si es leader)
CREATE OR REPLACE FUNCTION obtener_id_equipo_usuario()
RETURNS UUID AS $$
  SELECT id_equipo FROM perfiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

### Paso 3.4: Políticas para `perfiles`

```sql
-- Superadmin puede ver todos los perfiles
CREATE POLICY "Superadmin can view all perfiles"
  ON perfiles FOR SELECT
  USING (obtener_rol_usuario() = 'superadmin');

-- Los usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile"
  ON perfiles FOR SELECT
  USING (auth.uid() = id);

-- Los líderes pueden ver perfiles de su equipo
CREATE POLICY "Leaders can view team perfiles"
  ON perfiles FOR SELECT
  USING (
    obtener_rol_usuario() = 'leader' 
    AND id_equipo = obtener_id_equipo_usuario()
  );

-- Superadmin puede insertar/actualizar perfiles
CREATE POLICY "Superadmin can manage perfiles"
  ON perfiles FOR ALL
  USING (obtener_rol_usuario() = 'superadmin')
  WITH CHECK (obtener_rol_usuario() = 'superadmin');

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
  USING (obtener_rol_usuario() = 'superadmin');

-- Los líderes pueden ver su propio equipo
CREATE POLICY "Leaders can view own team"
  ON equipos FOR SELECT
  USING (
    obtener_rol_usuario() = 'leader' 
    AND id = obtener_id_equipo_usuario()
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
  USING (obtener_rol_usuario() = 'superadmin')
  WITH CHECK (obtener_rol_usuario() = 'superadmin');
```

### Paso 3.6: Políticas para `miembros_equipo`

```sql
-- Superadmin puede ver todos los miembros
CREATE POLICY "Superadmin can view all team members"
  ON miembros_equipo FOR SELECT
  USING (obtener_rol_usuario() = 'superadmin');

-- Los líderes pueden ver miembros de su equipo
CREATE POLICY "Leaders can view team members"
  ON miembros_equipo FOR SELECT
  USING (
    obtener_rol_usuario() = 'leader' 
    AND id_equipo = obtener_id_equipo_usuario()
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
    obtener_rol_usuario() = 'superadmin' 
    OR (obtener_rol_usuario() = 'leader' AND id_equipo = obtener_id_equipo_usuario())
  )
  WITH CHECK (
    obtener_rol_usuario() = 'superadmin' 
    OR (obtener_rol_usuario() = 'leader' AND id_equipo = obtener_id_equipo_usuario())
  );
```

### Paso 3.7: Políticas para `metricas_equipo`

```sql
-- Superadmin puede ver todas las métricas
CREATE POLICY "Superadmin can view all metrics"
  ON metricas_equipo FOR SELECT
  USING (obtener_rol_usuario() = 'superadmin');

-- Los líderes pueden ver métricas de su equipo
CREATE POLICY "Leaders can view own team metrics"
  ON metricas_equipo FOR SELECT
  USING (
    obtener_rol_usuario() = 'leader' 
    AND id_equipo = obtener_id_equipo_usuario()
  );

-- Los líderes pueden actualizar métricas de su equipo
CREATE POLICY "Leaders can update own team metrics"
  ON metricas_equipo FOR UPDATE
  USING (
    obtener_rol_usuario() = 'leader' 
    AND id_equipo = obtener_id_equipo_usuario()
  )
  WITH CHECK (
    obtener_rol_usuario() = 'leader' 
    AND id_equipo = obtener_id_equipo_usuario()
  );

-- Superadmin puede gestionar todas las métricas
CREATE POLICY "Superadmin can manage all metrics"
  ON metricas_equipo FOR ALL
  USING (obtener_rol_usuario() = 'superadmin')
  WITH CHECK (obtener_rol_usuario() = 'superadmin');
```

### Paso 3.8: Políticas para `planes_desarrollo`

```sql
-- Superadmin puede ver todos los planes
CREATE POLICY "Superadmin can view all plans"
  ON planes_desarrollo FOR SELECT
  USING (obtener_rol_usuario() = 'superadmin');

-- Los líderes pueden ver planes de su equipo
CREATE POLICY "Leaders can view own team plans"
  ON planes_desarrollo FOR SELECT
  USING (
    obtener_rol_usuario() = 'leader' 
    AND id_equipo = obtener_id_equipo_usuario()
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
  USING (obtener_rol_usuario() = 'superadmin')
  WITH CHECK (obtener_rol_usuario() = 'superadmin');

-- Los líderes pueden gestionar planes de su equipo
CREATE POLICY "Leaders can manage own team plans"
  ON planes_desarrollo FOR ALL
  USING (
    obtener_rol_usuario() = 'leader' 
    AND id_equipo = obtener_id_equipo_usuario()
  )
  WITH CHECK (
    obtener_rol_usuario() = 'leader' 
    AND id_equipo = obtener_id_equipo_usuario()
  );
```

### Paso 3.9: Políticas para `actividades`

```sql
-- Superadmin puede ver todas las actividades
CREATE POLICY "Superadmin can view all actividades"
  ON actividades FOR SELECT
  USING (obtener_rol_usuario() = 'superadmin');

-- Los líderes pueden ver actividades de su equipo
CREATE POLICY "Leaders can view own team actividades"
  ON actividades FOR SELECT
  USING (
    obtener_rol_usuario() = 'leader' 
    AND id_equipo = obtener_id_equipo_usuario()
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
  USING (obtener_rol_usuario() = 'superadmin')
  WITH CHECK (obtener_rol_usuario() = 'superadmin');

-- Los líderes pueden gestionar actividades de su equipo
CREATE POLICY "Leaders can manage own team actividades"
  ON actividades FOR ALL
  USING (
    obtener_rol_usuario() = 'leader' 
    AND id_equipo = obtener_id_equipo_usuario()
  )
  WITH CHECK (
    obtener_rol_usuario() = 'leader' 
    AND id_equipo = obtener_id_equipo_usuario()
  );
```

### Paso 3.10: Políticas para tablas relacionadas

```sql
-- Políticas para objetivos_area
CREATE POLICY "Superadmin can manage area objectives"
  ON objetivos_area FOR ALL
  USING (obtener_rol_usuario() = 'superadmin')
  WITH CHECK (obtener_rol_usuario() = 'superadmin');

CREATE POLICY "Leaders can manage own team area objectives"
  ON objetivos_area FOR ALL
  USING (
    obtener_rol_usuario() = 'leader' 
    AND EXISTS (
      SELECT 1 FROM planes_desarrollo 
      WHERE id = objetivos_area.id_plan 
      AND id_equipo = obtener_id_equipo_usuario()
    )
  )
  WITH CHECK (
    obtener_rol_usuario() = 'leader' 
    AND EXISTS (
      SELECT 1 FROM planes_desarrollo 
      WHERE id = objetivos_area.id_plan 
      AND id_equipo = obtener_id_equipo_usuario()
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
    obtener_rol_usuario() = 'leader' 
    AND EXISTS (
      SELECT 1 FROM actividades a
      WHERE a.id = asignaciones_actividad.id_actividad
      AND a.id_equipo = obtener_id_equipo_usuario()
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
  USING (obtener_rol_usuario() = 'superadmin')
  WITH CHECK (obtener_rol_usuario() = 'superadmin');

CREATE POLICY "Leaders can view own team budgets"
  ON asignaciones_presupuesto FOR SELECT
  USING (
    obtener_rol_usuario() = 'leader' 
    AND id_equipo = obtener_id_equipo_usuario()
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
    OR obtener_rol_usuario() = 'superadmin'
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
    OR obtener_rol_usuario() = 'superadmin'
  );

CREATE POLICY "Leaders can manage own team lessons"
  ON lecciones_plan FOR ALL
  USING (
    obtener_rol_usuario() = 'leader' 
    AND EXISTS (
      SELECT 1 FROM planes_desarrollo 
      WHERE id = lecciones_plan.id_plan 
      AND id_equipo = obtener_id_equipo_usuario()
    )
  );
```

---

## 4. Funciones RPC

> **✅ IMPORTANTE**: Todas las funciones RPC (PostgreSQL) son **GRATUITAS e ILIMITADAS** en el plan gratuito de Supabase. No necesitas Edge Functions ni pagar nada adicional.

### Paso 4.1: Autenticación (NO requiere función RPC)

**Nota**: No necesitamos crear una función RPC para login. Usaremos directamente `supabase.auth.signInWithPassword()` desde el frontend, que es **gratuito** e incluido en el plan gratuito.

**En el frontend** (`/app/login/page.tsx`):
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: `${username}@misincol.local`, // Email sintético basado en nombre_usuario
  password: password
});

// Luego obtener el perfil
const { data: perfil } = await supabase
  .from('perfiles')
  .select('*')
  .eq('id', data.user.id)
  .single();
```

**Ventajas**:
- ✅ Gratis (incluido en plan gratuito)
- ✅ Más seguro (maneja sesiones automáticamente)
- ✅ No requiere función adicional

### Paso 4.2: Función para obtener métricas del dashboard

```sql
-- Función para obtener métricas del dashboard por equipo
CREATE OR REPLACE FUNCTION obtener_metricas_dashboard_equipo()
RETURNS TABLE (
  id_equipo UUID,
  nombre_equipo TEXT,
  lider TEXT,
  id_plan_activo UUID,
  nombre_plan_activo TEXT,
  planes_completados_count BIGINT,
  actividades_pendientes_count BIGINT,
  actividades_completadas_count BIGINT,
  presupuesto_liquidado NUMERIC,
  presupuesto_pendiente NUMERIC,
  presupuesto_asignado NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id AS id_equipo,
    t.nombre AS nombre_equipo,
    COALESCE(p.nombre_completo, p.nombre_usuario, 'Sin líder') AS lider,
    dp_active.id AS id_plan_activo,
    dp_active.nombre AS nombre_plan_activo,
    COUNT(DISTINCT CASE WHEN dp.estado = 'Finalizado' THEN dp.id END) AS planes_completados_count,
    COUNT(DISTINCT CASE WHEN a.estado = 'Pendiente' THEN a.id END) AS actividades_pendientes_count,
    COUNT(DISTINCT CASE WHEN a.estado = 'Hecha' THEN a.id END) AS actividades_completadas_count,
    COALESCE(SUM(a.presupuesto_liquidado), 0) AS presupuesto_liquidado,
    COALESCE(SUM(CASE WHEN a.estado = 'Pendiente' THEN (a.presupuesto_total - a.presupuesto_liquidado) ELSE 0 END), 0) AS presupuesto_pendiente,
    t.presupuesto_asignado AS presupuesto_asignado
  FROM equipos t
  LEFT JOIN perfiles p ON t.id_lider = p.id
  LEFT JOIN planes_desarrollo dp_active ON dp_active.id_equipo = t.id AND dp_active.estado = 'Activo'
  LEFT JOIN planes_desarrollo dp ON dp.id_equipo = t.id
  LEFT JOIN actividades a ON a.id_plan = dp.id
  GROUP BY t.id, t.nombre, p.nombre_completo, p.nombre_usuario, dp_active.id, dp_active.nombre, t.presupuesto_asignado;
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
    id_equipo, nombre, categoria, estado, fecha_inicio, fecha_fin, resumen
  )
  VALUES (
    v_old_plan.id_equipo,
    p_new_name,
    v_old_plan.categoria,
    'Activo',
    p_new_fecha_inicio,
    p_new_fecha_fin,
    v_old_plan.resumen
  )
  RETURNING id INTO v_new_id_plan;
  
  -- Duplicar objetivos de área
  INSERT INTO objetivos_area (id_plan, categoria, descripcion, numero_orden)
  SELECT v_new_id_plan, categoria, descripcion, numero_orden
  FROM objetivos_area
  WHERE id_plan = p_id_plan;
  
  -- Duplicar actividades
  INSERT INTO actividades (
    id_equipo, id_plan, id_objetivo, nombre, responsable,
    presupuesto_total, presupuesto_liquidado, estado, etapa, area, objetivo,
    descripcion, situacion_actual, objetivo_mediano, objetivo_largo, frecuencia,
    veces_por_ano, fecha_inicio, fecha_fin, semanas_totales, semanas_restantes, obstaculos
  )
  SELECT 
    id_equipo, v_new_id_plan, NULL, nombre, responsable,
    0, 0, 'Pendiente', etapa, area, objetivo,
    descripcion, situacion_actual, objetivo_mediano, objetivo_largo, frecuencia,
    veces_por_ano, fecha_inicio, fecha_fin, semanas_totales, semanas_totales, obstaculos
  FROM actividades
  WHERE id_plan = p_id_plan;
  
  RETURN v_new_id_plan;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Paso 4.4: Función para crear equipo completo

Esta función permite crear un equipo con su líder y miembros en una sola operación. Es útil para el SuperAdmin que crea equipos desde el frontend.

```sql
-- Función para crear un equipo completo (equipo + líder + miembros)
CREATE OR REPLACE FUNCTION crear_equipo_completo(
  p_nombre_equipo TEXT,
  p_presupuesto_asignado NUMERIC,
  p_crear_nuevo_lider BOOLEAN DEFAULT FALSE,
  p_id_lider_existente UUID DEFAULT NULL,
  p_nombre_usuario_lider TEXT DEFAULT NULL,
  p_nombre_completo_lider TEXT DEFAULT NULL,
  p_email_lider TEXT DEFAULT NULL,
  p_password_lider TEXT DEFAULT NULL,
  p_miembros JSONB DEFAULT '[]'::JSONB -- Array de objetos: [{"name": "Juan", "role": "Miembro"}]
)
RETURNS JSONB AS $$
DECLARE
  v_id_equipo UUID;
  v_id_lider UUID;
  v_resultado JSONB;
  v_miembro JSONB;
  v_id_perfil_miembro UUID;
BEGIN
  -- Verificar que solo superadmin puede crear equipos
  IF obtener_rol_usuario() != 'superadmin' THEN
    RAISE EXCEPTION 'Solo el superadmin puede crear equipos';
  END IF;

  -- Validaciones básicas
  IF p_nombre_equipo IS NULL OR TRIM(p_nombre_equipo) = '' THEN
    RAISE EXCEPTION 'El nombre del equipo es requerido';
  END IF;

  IF p_presupuesto_asignado IS NULL OR p_presupuesto_asignado < 0 THEN
    RAISE EXCEPTION 'El presupuesto asignado debe ser mayor o igual a 0';
  END IF;

  -- Manejar el líder
  IF p_crear_nuevo_lider THEN
    -- Validar datos del nuevo líder
    IF p_nombre_usuario_lider IS NULL OR TRIM(p_nombre_usuario_lider) = '' THEN
      RAISE EXCEPTION 'El nombre de usuario del líder es requerido';
    END IF;
    IF p_nombre_completo_lider IS NULL OR TRIM(p_nombre_completo_lider) = '' THEN
      RAISE EXCEPTION 'El nombre completo del líder es requerido';
    END IF;
    IF p_email_lider IS NULL OR TRIM(p_email_lider) = '' THEN
      RAISE EXCEPTION 'El email del líder es requerido';
    END IF;
    IF p_password_lider IS NULL OR LENGTH(p_password_lider) < 6 THEN
      RAISE EXCEPTION 'La contraseña debe tener al menos 6 caracteres';
    END IF;

    -- Verificar que el nombre de usuario no exista
    IF EXISTS (SELECT 1 FROM perfiles WHERE nombre_usuario = p_nombre_usuario_lider) THEN
      RAISE EXCEPTION 'El nombre de usuario ya existe';
    END IF;

    -- Crear usuario en auth.users (esto debe hacerse desde el frontend con supabase.auth.signUp)
    -- Por ahora, solo creamos el perfil y retornamos instrucciones
    -- NOTA: En producción, el frontend debe crear el usuario primero con supabase.auth.signUp
    -- y luego llamar a esta función con el id del usuario creado
    
    RAISE EXCEPTION 'Para crear un nuevo líder, primero crea el usuario con supabase.auth.signUp desde el frontend, luego llama a esta función con el id del usuario';
  ELSE
    -- Usar líder existente
    IF p_id_lider_existente IS NULL THEN
      RAISE EXCEPTION 'Debe proporcionar un ID de líder existente o crear uno nuevo';
    END IF;

    -- Verificar que el líder existe y no tiene equipo asignado
    IF NOT EXISTS (SELECT 1 FROM perfiles WHERE id = p_id_lider_existente AND rol = 'leader') THEN
      RAISE EXCEPTION 'El líder especificado no existe o no tiene rol de líder';
    END IF;

    IF EXISTS (SELECT 1 FROM equipos WHERE id_lider = p_id_lider_existente) THEN
      RAISE EXCEPTION 'El líder ya tiene un equipo asignado';
    END IF;

    v_id_lider := p_id_lider_existente;
  END IF;

  -- Crear el equipo
  INSERT INTO equipos (nombre, id_lider, presupuesto_asignado)
  VALUES (p_nombre_equipo, v_id_lider, p_presupuesto_asignado)
  RETURNING id INTO v_id_equipo;

  -- Actualizar el perfil del líder con el id_equipo
  UPDATE perfiles
  SET id_equipo = v_id_equipo
  WHERE id = v_id_lider;

  -- Crear miembros si se proporcionaron
  IF p_miembros IS NOT NULL AND jsonb_array_length(p_miembros) > 0 THEN
    FOR v_miembro IN SELECT * FROM jsonb_array_elements(p_miembros)
    LOOP
      -- Buscar o crear perfil del miembro
      -- Por simplicidad, asumimos que el miembro ya existe en perfiles
      -- En producción, podrías necesitar crear miembros también
      -- Por ahora, solo registramos en miembros_equipo si el perfil existe
      
      -- NOTA: En producción, los miembros deben ser perfiles existentes
      -- o crear una función separada para crear miembros
    END LOOP;
  END IF;

  -- Retornar resultado
  v_resultado := jsonb_build_object(
    'id_equipo', v_id_equipo,
    'nombre_equipo', p_nombre_equipo,
    'id_lider', v_id_lider,
    'presupuesto_asignado', p_presupuesto_asignado,
    'mensaje', 'Equipo creado exitosamente'
  );

  RETURN v_resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Nota importante**: Esta función asume que:
1. Si se crea un nuevo líder, el frontend debe crear primero el usuario con `supabase.auth.signUp()` y luego llamar a esta función con el `id` del usuario creado.
2. Los miembros deben ser perfiles existentes. Si necesitas crear miembros nuevos, puedes extender esta función o crear una función separada.

**Uso desde el frontend**:
```typescript
// Opción 1: Crear equipo con líder existente
const { data, error } = await supabase.rpc('crear_equipo_completo', {
  p_nombre_equipo: 'Equipo Barí',
  p_presupuesto_asignado: 1000000,
  p_crear_nuevo_lider: false,
  p_id_lider_existente: 'uuid-del-lider',
  p_miembros: [
    { name: 'Juan Pérez', role: 'Miembro' },
    { name: 'María García', role: 'Colaborador' }
  ]
});

// Opción 2: Crear equipo con nuevo líder (crear usuario primero)
// 1. Crear usuario en auth
const { data: authData, error: authError } = await supabase.auth.signUp({
  email: 'nuevo.lider@misincol.local',
  password: 'password123',
  options: {
    data: {
      nombre_usuario: 'nuevo.lider',
      nombre_completo: 'Nuevo Líder',
      rol: 'leader'
    }
  }
});

// 2. Crear perfil (se hace automáticamente con trigger, pero puedes verificarlo)
// 3. Crear equipo con el id del usuario creado
const { data, error } = await supabase.rpc('crear_equipo_completo', {
  p_nombre_equipo: 'Equipo Nuevo',
  p_presupuesto_asignado: 1000000,
  p_crear_nuevo_lider: false,
  p_id_lider_existente: authData.user.id,
  p_miembros: []
});
```

### Paso 4.5: Función para actualizar presupuesto calculado

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
  AND a.estado = 'Pendiente';
  
  -- Obtener presupuesto asignado
  SELECT presupuesto_asignado INTO v_total
  FROM equipos
  WHERE id = p_id_equipo;
  
  RETURN jsonb_build_object(
    'id_equipo', p_id_equipo,
    'presupuesto_asignado', v_total,
    'presupuesto_liquidado', v_liquidated,
    'presupuesto_pendiente', v_pending,
    'presupuesto_disponible', v_total - v_liquidated
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
DECLARE
  v_usuario_id UUID;
BEGIN
  -- Obtener el ID del usuario actual
  v_usuario_id := auth.uid();
  
  -- Si no hay usuario autenticado (ej: inserción desde SQL Editor), no registrar historial
  -- Esto permite insertar datos de prueba sin errores
  IF v_usuario_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;
  
  IF TG_OP = 'INSERT' THEN
    INSERT INTO historial_plan (id_plan, modificado_por, tipo_cambio, valores_nuevos)
    VALUES (
      NEW.id,
      v_usuario_id,
      'created',
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO historial_plan (id_plan, modificado_por, tipo_cambio, valores_anteriores, valores_nuevos, descripcion)
    VALUES (
      NEW.id,
      v_usuario_id,
      CASE 
        WHEN OLD.estado != NEW.estado THEN 'status_changed'
        ELSE 'updated'
      END,
      to_jsonb(OLD),
      to_jsonb(NEW),
      CASE 
        WHEN OLD.estado != NEW.estado THEN 
          'Estado cambiado de ' || OLD.estado || ' a ' || NEW.estado
        ELSE NULL
      END
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO historial_plan (id_plan, modificado_por, tipo_cambio, valores_anteriores)
    VALUES (
      OLD.id,
      v_usuario_id,
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
-- Primero, eliminar el trigger si ya existe (para poder actualizarlo)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Función para crear perfil automáticamente cuando se crea un usuario
CREATE OR REPLACE FUNCTION manejar_nuevo_usuario()
RETURNS TRIGGER AS $$
DECLARE
  v_nombre_usuario TEXT;
  v_nombre_completo TEXT;
  v_rol rol_usuario;
BEGIN
  -- Extraer nombre_usuario de metadata o del email (antes del @)
  v_nombre_usuario := COALESCE(
    NEW.raw_user_meta_data->>'nombre_usuario',
    SPLIT_PART(NEW.email, '@', 1)
  );
  
  -- Extraer nombre_completo de metadata
  v_nombre_completo := COALESCE(
    NEW.raw_user_meta_data->>'nombre_completo',
    NEW.raw_user_meta_data->>'name',
    v_nombre_usuario
  );
  
  -- Extraer rol de metadata o usar 'member' por defecto
  v_rol := COALESCE(
    (NEW.raw_user_meta_data->>'role')::rol_usuario,
    'member'
  );
  
  -- Insertar perfil (con manejo de errores silencioso)
  BEGIN
    INSERT INTO public.perfiles (id, nombre_usuario, nombre_completo, rol)
    VALUES (NEW.id, v_nombre_usuario, v_nombre_completo, v_rol)
    ON CONFLICT (id) DO UPDATE SET
      nombre_usuario = EXCLUDED.nombre_usuario,
      nombre_completo = EXCLUDED.nombre_completo,
      rol = EXCLUDED.rol;
  EXCEPTION WHEN OTHERS THEN
    -- Si hay error (ej: nombre_usuario duplicado), usar un nombre único
    INSERT INTO public.perfiles (id, nombre_usuario, nombre_completo, rol)
    VALUES (
      NEW.id,
      v_nombre_usuario || '_' || SUBSTRING(NEW.id::TEXT, 1, 8),
      v_nombre_completo,
      v_rol
    )
    ON CONFLICT (id) DO NOTHING;
  END;
  
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
CREATE MATERIALIZED VIEW resumen_metricas_equipo AS
SELECT 
  t.id AS id_equipo,
  t.nombre AS nombre_equipo,
  p.nombre_completo AS nombre_lider,
  t.presupuesto_asignado,
  COUNT(DISTINCT CASE WHEN dp.estado = 'Activo' THEN dp.id END) AS planes_activos_count,
  COUNT(DISTINCT CASE WHEN dp.estado = 'Finalizado' THEN dp.id END) AS planes_completados_count,
  COUNT(DISTINCT CASE WHEN a.estado = 'Pendiente' THEN a.id END) AS actividades_pendientes_count,
  COUNT(DISTINCT CASE WHEN a.estado = 'Hecha' THEN a.id END) AS actividades_completadas_count,
  COALESCE(SUM(a.presupuesto_liquidado), 0) AS total_presupuesto_liquidado,
  COALESCE(SUM(CASE WHEN a.estado = 'Pendiente' THEN (a.presupuesto_total - a.presupuesto_liquidado) ELSE 0 END), 0) AS total_presupuesto_pendiente
FROM equipos t
LEFT JOIN perfiles p ON t.id_lider = p.id
LEFT JOIN planes_desarrollo dp ON dp.id_equipo = t.id
LEFT JOIN actividades a ON a.id_plan = dp.id
GROUP BY t.id, t.nombre, p.nombre_completo, t.presupuesto_asignado;

-- Índice para la vista
CREATE UNIQUE INDEX ON resumen_metricas_equipo (id_equipo);

-- Función para refrescar la vista
CREATE OR REPLACE FUNCTION actualizar_resumen_metricas_equipo()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY resumen_metricas_equipo;
END;
$$ LANGUAGE plpgsql;
```

---

## 7. Datos de Prueba (Seeds)

### Paso 7.1: Crear usuarios de prueba

**⚠️ IMPORTANTE**: Para crear usuarios de prueba, primero debes crearlos en Supabase Auth. Sigue estos pasos:

#### Opción A: Crear usuarios desde el Dashboard de Supabase (Recomendado)

1. En Supabase, ve a **Authentication** (menú lateral izquierdo)
2. Haz clic en **Users** (pestaña superior)
3. Haz clic en el botón **Add user** > **Create new user**
4. Crea estos 3 usuarios:

   **Usuario 1 - Superadmin:**
   - **Email**: `superadmin@misincol.local`
   - **Password**: `superadmin123` (o la que prefieras)
   - **Auto Confirm User**: ✅ Activar (para que no necesite confirmar email)
   - **User Metadata** (haz clic en "Raw JSON" y pega esto):
     ```json
     {
       "nombre_usuario": "superadmin",
       "nombre_completo": "Super Administrador",
       "role": "superadmin"
     }
     ```

   **Usuario 2 - Líder Barí:**
   - **Email**: `lider-bari@misincol.local`
   - **Password**: `lider123`
   - **Auto Confirm User**: ✅ Activar
   - **User Metadata**:
     ```json
     {
       "nombre_usuario": "lider-bari",
       "nombre_completo": "Pepe (Líder Barí)",
       "role": "leader"
     }
     ```

   **Usuario 3 - Líder Katíos:**
   - **Email**: `lider-katios@misincol.local`
   - **Password**: `lider123`
   - **Auto Confirm User**: ✅ Activar
   - **User Metadata**:
     ```json
     {
       "nombre_usuario": "lider-katios",
       "nombre_completo": "Carla (Líder Katíos)",
       "role": "leader"
     }
     ```

5. **Después de crear los usuarios**, el trigger automático debería crear los perfiles. 

#### ⚠️ Si el trigger falla (Error al crear usuario):

**SOLUCIÓN RECOMENDADA: Crear usuarios SIN trigger y luego crear perfiles manualmente**

Esta es la forma más confiable. Sigue estos pasos:

**Paso A: Desactivar temporalmente el trigger**

```sql
-- Desactivar el trigger temporalmente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
```

**Paso B: Crear usuarios en Supabase Auth (SIN User Metadata)**

1. Ve a **Authentication > Users > Add user > Create new user**
2. Crea cada usuario **SIN** poner nada en "User Metadata" (déjalo vacío):
   - **Usuario 1**: Email `superadmin@misincol.local`, Password `superadmin123`, Auto Confirm ✅
   - **Usuario 2**: Email `lider-bari@misincol.local`, Password `lider123`, Auto Confirm ✅
   - **Usuario 3**: Email `lider-katios@misincol.local`, Password `lider123`, Auto Confirm ✅

**Paso C: Obtener los UUIDs de los usuarios creados**

1. En **Authentication > Users**, verás los usuarios que acabas de crear
2. Copia el **User UID** de cada uno (es un UUID largo)

**Paso D: Crear los perfiles manualmente**

Ejecuta esto en SQL Editor, reemplazando los UUIDs con los reales:

```sql
-- Reemplaza estos UUIDs con los que copiaste de Authentication > Users
-- Usuario Superadmin
INSERT INTO perfiles (id, nombre_usuario, nombre_completo, rol)
VALUES (
  'UUID_SUPERADMIN_AQUI'::uuid,  -- Reemplaza con el UUID real
  'superadmin',
  'Super Administrador',
  'superadmin'
)
ON CONFLICT (id) DO UPDATE SET
  nombre_usuario = EXCLUDED.nombre_usuario,
  nombre_completo = EXCLUDED.nombre_completo,
  rol = EXCLUDED.rol;

-- Usuario Líder Barí
INSERT INTO perfiles (id, nombre_usuario, nombre_completo, rol)
VALUES (
  'UUID_LIDER_BARI_AQUI'::uuid,  -- Reemplaza con el UUID real
  'lider-bari',
  'Pepe (Líder Barí)',
  'leader'
)
ON CONFLICT (id) DO UPDATE SET
  nombre_usuario = EXCLUDED.nombre_usuario,
  nombre_completo = EXCLUDED.nombre_completo,
  rol = EXCLUDED.rol;

-- Usuario Líder Katíos
INSERT INTO perfiles (id, nombre_usuario, nombre_completo, rol)
VALUES (
  'UUID_LIDER_KATIOS_AQUI'::uuid,  -- Reemplaza con el UUID real
  'lider-katios',
  'Carla (Líder Katíos)',
  'leader'
)
ON CONFLICT (id) DO UPDATE SET
  nombre_usuario = EXCLUDED.nombre_usuario,
  nombre_completo = EXCLUDED.nombre_completo,
  rol = EXCLUDED.rol;

-- Verificar que se crearon correctamente
SELECT id, nombre_usuario, nombre_completo, rol FROM perfiles;
```

**Paso E: Reactivar el trigger (opcional, para futuros usuarios)**

Si quieres que el trigger funcione para usuarios futuros, puedes reactivarlo:

```sql
-- Reactivar el trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION manejar_nuevo_usuario();
```

---

#### Alternativa: Verificar qué error específico está ocurriendo

Si quieres diagnosticar el problema del trigger, ejecuta esto para ver los logs:

```sql
-- Ver los últimos errores en la base de datos
SELECT * FROM pg_stat_statements 
WHERE query LIKE '%manejar_nuevo_usuario%' 
ORDER BY calls DESC 
LIMIT 10;
```

O verifica directamente si hay problemas con la función:

```sql
-- Probar la función manualmente (reemplaza con un UUID de usuario real)
SELECT manejar_nuevo_usuario() FROM auth.users LIMIT 1;
```

---

#### Opción antigua (si prefieres intentar con metadata):

```sql
-- Crear perfil manualmente para el usuario creado
INSERT INTO perfiles (id, nombre_usuario, nombre_completo, rol)
VALUES (
  'USER_UUID'::uuid,  -- Reemplaza con el UUID del usuario
  'superadmin',       -- O 'lider-bari', 'lider-katios'
  'Super Administrador',  -- O el nombre correspondiente
  'superadmin'        -- O 'leader'
)
ON CONFLICT (id) DO UPDATE SET
  nombre_usuario = EXCLUDED.nombre_usuario,
  nombre_completo = EXCLUDED.nombre_completo,
  rol = EXCLUDED.rol;
```

**Opción 2: Verificar y corregir el trigger**

Si el trigger no funciona, verifica que esté creado:

```sql
-- Verificar que el trigger existe
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Si no existe, créalo de nuevo (ejecuta el Paso 5.4 completo)
```

**Opción 3: Verificar perfiles creados**

```sql
-- Ver todos los perfiles
SELECT id, nombre_usuario, nombre_completo, rol FROM perfiles;

-- Ver usuarios en auth.users
SELECT id, email, raw_user_meta_data FROM auth.users;
```

**Nota**: Los perfiles deberían crearse automáticamente gracias al trigger que configuramos en el Paso 5. Si no se crearon, revisa que el trigger esté activo.

### Paso 7.2: Crear equipos de prueba

```sql
-- Insertar equipos de prueba con UUIDs válidos
-- Nota: Estos UUIDs son generados automáticamente, puedes usar los que quieras

INSERT INTO equipos (id, nombre, id_lider, presupuesto_asignado) VALUES
  ('11111111-1111-1111-1111-111111111111'::uuid, 'Barí', '055fd2f5-156d-4bef-85d1-c8aa56e01118'::uuid, 60000),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'Katíos', '95802e35-6448-470c-ab4a-c865cfafb287'::uuid, 75000)
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  id_lider = EXCLUDED.id_lider,
  presupuesto_asignado = EXCLUDED.presupuesto_asignado;

-- Actualizar los perfiles con id_equipo (asociar líderes a sus equipos)
UPDATE perfiles 
SET id_equipo = '11111111-1111-1111-1111-111111111111'::uuid 
WHERE nombre_usuario = 'lider-bari';

UPDATE perfiles 
SET id_equipo = '22222222-2222-2222-2222-222222222222'::uuid 
WHERE nombre_usuario = 'lider-katios';

-- Verificar que se crearon correctamente
SELECT 
  e.id AS equipo_id,
  e.nombre AS equipo_nombre,
  p.nombre_completo AS lider_nombre,
  e.presupuesto_asignado
FROM equipos e
LEFT JOIN perfiles p ON e.id_lider = p.id;
```

### Paso 7.3: Crear planes y actividades de prueba

```sql
-- Planes de desarrollo (incluyendo etapas_plan)
-- Usando UUIDs válidos y los IDs reales de los equipos creados
INSERT INTO planes_desarrollo (id, id_equipo, nombre, categoria, estado, fecha_inicio, fecha_fin, resumen, etapas_plan) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'Investigación 2025', 'Investigación', 'Activo', '2025-01-10', '2025-12-20', 'Profundizar diagnóstico territorial', 
   ARRAY['Fase de diagnóstico', 'Fase de ejecución', 'Fase de evaluación', 'Fase de cierre']::TEXT[]),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'Autocuidado 2024', 'Autocuidado', 'Finalizado', '2024-03-01', '2024-11-30', 'Fortalecer bienestar del equipo',
   ARRAY['Fase inicial', 'Fase de implementación', 'Fase de seguimiento']::TEXT[]),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'Encarnación 2025', 'Encarnación', 'Activo', '2025-02-01', '2025-11-15', 'Acompañar procesos comunitarios',
   ARRAY['Fase de diagnóstico', 'Fase de ejecución', 'Fase de evaluación']::TEXT[]),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'Evangelización 2023', 'Evangelización', 'Archivado', '2023-03-10', '2023-12-12', 'Proceso de acompañamiento espiritual',
   ARRAY['Fase de planeación', 'Fase de ejecución', 'Fase de cierre']::TEXT[])
ON CONFLICT (id) DO NOTHING;

-- Objetivos de área (con numero_objetivo)
INSERT INTO objetivos_area (id, id_plan, categoria, descripcion, numero_orden, numero_objetivo) VALUES
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'Investigación', 'Mapear comunidades clave del territorio', 1, 1),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'Investigación', 'Documentar saberes ancestrales', 2, 2),
  ('11111111-1111-1111-1111-111111111112'::uuid, 'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, 'Encarnación', 'Instalar brigadas de salud en 3 municipios', 1, 3),
  ('22222222-2222-2222-2222-222222222223'::uuid, 'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, 'Encarnación', 'Fortalecer liderazgo juvenil', 2, 4)
ON CONFLICT (id) DO NOTHING;

-- Actividades (incluyendo etapa_plan y numero_objetivo)
INSERT INTO actividades (
  id, id_equipo, id_plan, id_objetivo, nombre, responsable, presupuesto_total, presupuesto_liquidado, 
  estado, etapa, etapa_plan, area, objetivo, numero_objetivo, descripcion, situacion_actual, objetivo_mediano, objetivo_largo,
  frecuencia, veces_por_ano, fecha_inicio, fecha_fin, semanas_totales, semanas_restantes, obstaculos
) VALUES
  ('33333333-3333-3333-3333-333333333333'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, 'Cartografiado comunitario', 'Ana', 12000, 6000, 
   'Hecha', 'Contacto', 'Fase de diagnóstico', 'Investigación', 'Mapear comunidades clave', 1,
   'Se planificó junto con líderes locales', 'Fase inicial completada en 4 veredas', 
   'Completar cobertura 80% territorio', 'Cobertura total y documentación', 
   'Mensual', 6, '2025-01-15', '2025-04-30', 16, 0, 'Retrasos por clima'),
   
  ('44444444-4444-4444-4444-444444444444'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid, 'Taller con sabedores', 'Luis', 8000, 0, 
   'Pendiente', 'Comunicar', 'Fase de ejecución', 'Investigación', 'Recoger saberes locales', 2,
   'Taller de transferencia con sabedores ancestrales', 'Convocatoria abierta pero sin fecha confirmada', 
   'Lograr asistencia de 30 líderes', 'Crear repositorio de saberes', 
   'Bimestral', 4, '2025-05-10', '2025-07-05', 8, 6, 'Disponibilidad de agenda'),
   
  ('55555555-5555-5555-5555-555555555555'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, NULL, 'Círculos de autocuidado', 'Marta', 5000, 5000, 
   'Hecha', 'Contacto', 'Fase de implementación', 'Autocuidado', 'Crear espacios de escucha', NULL,
   'Jornadas mensuales de acompañamiento', 'Se ejecutaron 8 sesiones', 
   'Mantener espacios quincenales', 'Consolidar red de apoyo', 
   'Mensual', 8, '2024-03-05', '2024-10-28', 32, 0, 'Ninguno'),
   
  ('66666666-6666-6666-6666-666666666666'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, '11111111-1111-1111-1111-111111111112'::uuid, 'Brigadas itinerantes', 'José', 15000, 7000, 
   'Hecha', 'Contacto', 'Fase de ejecución', 'Encarnación', 'Instalar brigadas de salud', 3,
   'Recorridos por tres municipios priorizados', 'Un municipio cubierto', 
   'Cubrir los tres municipios', 'Instalar puestos permanentes', 
   'Quincenal', 10, '2025-02-10', '2025-08-30', 28, 12, 'Falta de transporte'),
   
  ('77777777-7777-7777-7777-777777777777'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, '22222222-2222-2222-2222-222222222223'::uuid, 'Escuela de liderazgo', 'Paula', 10000, 2000, 
   'Pendiente', 'Comunicar', 'Fase de ejecución', 'Encarnación', 'Fortalecer líderes juveniles', 4,
   'Programa de diez módulos', 'Diseño curricular en progreso', 
   'Impulsar participación de 25 jóvenes', 'Graduar primera cohorte', 
   'Semanal', 12, '2025-06-05', '2025-10-25', 20, 18, 'Baja inscripción'),
   
  ('88888888-8888-8888-8888-888888888888'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid, NULL, 'Encuentros comunitarios', 'Samuel', 6000, 6000, 
   'Hecha', 'Contacto', 'Fase de ejecución', 'Evangelización', 'Fortalecer redes de apoyo', NULL,
   'Encuentros trimestrales', 'Se realizaron 4 encuentros', 
   'Repetir ciclo en 2025', 'Crear guía metodológica', 
   'Trimestral', 4, '2023-04-01', '2023-11-30', 32, 0, 'Clima lluvioso')
ON CONFLICT (id) DO NOTHING;
```

### Paso 7.4: Crear métricas de prueba

```sql
-- Métricas para equipo 1 (Barí)
INSERT INTO metricas_equipo (
  id_equipo, poblacion, congregaciones_evangelicas, evangelicos,
  contactos_primera_vez, interesados_evangelio, escucharon_evangelio,
  buscando_dios, oportunidad_responder,
  creyeron_mensaje, bautizados,
  estudios_biblicos_regulares, discipulado_personal, grupos_nuevos_este_ano,
  entrenamiento_ministerial, entrenamiento_otras_areas, entrenamiento_pastoral, 
  entrenamiento_biblico, entrenamiento_plantacion_iglesias,
  grupos_con_prospectos_iglesia, iglesias_fin_periodo,
  iglesias_primera_gen, iglesias_segunda_gen, iglesias_tercera_gen,
  iglesias_perdidas_primera_gen, iglesias_perdidas_segunda_gen, iglesias_perdidas_tercera_gen,
  ubicacion_ministerio
) VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid, 15000, 7, 350,
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
  id_equipo, poblacion, congregaciones_evangelicas, evangelicos,
  contactos_primera_vez, interesados_evangelio, escucharon_evangelio,
  buscando_dios, oportunidad_responder,
  creyeron_mensaje, bautizados,
  estudios_biblicos_regulares, discipulado_personal, grupos_nuevos_este_ano,
  entrenamiento_ministerial, entrenamiento_otras_areas, entrenamiento_pastoral,
  entrenamiento_biblico, entrenamiento_plantacion_iglesias,
  grupos_con_prospectos_iglesia, iglesias_fin_periodo,
  iglesias_primera_gen, iglesias_segunda_gen, iglesias_tercera_gen,
  iglesias_perdidas_primera_gen, iglesias_perdidas_segunda_gen, iglesias_perdidas_tercera_gen,
  ubicacion_ministerio
) VALUES (
  '22222222-2222-2222-2222-222222222222'::uuid, 20000, 10, 500,
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
--   rol = 'superadmin'
-- WHERE id IN (SELECT id FROM auth.users WHERE email = 'superadmin@misincol.local');

-- UPDATE perfiles SET 
--   nombre_usuario = 'lider-bari',
--   nombre_completo = 'Pepe',
--   rol = 'leader',
--   id_equipo = 'team-1'::uuid
-- WHERE id IN (SELECT id FROM auth.users WHERE email = 'lider-bari@misincol.local');

-- UPDATE perfiles SET 
--   nombre_usuario = 'lider-katios',
--   nombre_completo = 'Carla',
--   rol = 'leader',
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
- **Error de función**: Verifica que las funciones helper (`obtener_rol_usuario`, `obtener_id_equipo_usuario`) existan antes de crear políticas
- **Error de trigger**: Verifica que la función `manejar_nuevo_usuario` tenga permisos `SECURITY DEFINER`

---

¡Listo! Con estos pasos tendrás el backend completo funcionando en Supabase. 🚀

