-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.actividades (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  id_equipo uuid NOT NULL,
  id_plan uuid NOT NULL,
  id_objetivo uuid,
  nombre text NOT NULL,
  responsable text NOT NULL,
  presupuesto_total numeric DEFAULT 0 CHECK (presupuesto_total >= 0::numeric),
  presupuesto_liquidado numeric DEFAULT 0 CHECK (presupuesto_liquidado >= 0::numeric),
  estado USER-DEFINED NOT NULL DEFAULT 'Pendiente'::estado_actividad,
  etapa text,
  etapa_plan text,
  area text NOT NULL,
  objetivo text,
  numero_objetivo integer,
  descripcion text,
  situacion_actual text,
  objetivo_mediano text,
  objetivo_largo text,
  frecuencia text,
  veces_por_ano integer DEFAULT 0 CHECK (veces_por_ano >= 0),
  fecha_inicio date NOT NULL,
  fecha_fin date NOT NULL,
  semanas_totales integer DEFAULT 0 CHECK (semanas_totales >= 0),
  semanas_restantes integer DEFAULT 0 CHECK (semanas_restantes >= 0),
  obstaculos text,
  creado_en timestamp with time zone DEFAULT now(),
  actualizado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT actividades_pkey PRIMARY KEY (id),
  CONSTRAINT actividades_id_equipo_fkey FOREIGN KEY (id_equipo) REFERENCES public.equipos(id),
  CONSTRAINT actividades_id_plan_fkey FOREIGN KEY (id_plan) REFERENCES public.planes_desarrollo(id),
  CONSTRAINT actividades_id_objetivo_fkey FOREIGN KEY (id_objetivo) REFERENCES public.objetivos_area(id)
);
CREATE TABLE public.actualizaciones_actividad (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  id_actividad uuid NOT NULL,
  id_perfil uuid NOT NULL,
  texto_actualizacion text NOT NULL,
  creado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT actualizaciones_actividad_pkey PRIMARY KEY (id),
  CONSTRAINT actualizaciones_actividad_id_actividad_fkey FOREIGN KEY (id_actividad) REFERENCES public.actividades(id),
  CONSTRAINT actualizaciones_actividad_id_perfil_fkey FOREIGN KEY (id_perfil) REFERENCES public.perfiles(id)
);
CREATE TABLE public.asignaciones_actividad (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  id_actividad uuid NOT NULL,
  id_perfil uuid NOT NULL,
  rol text NOT NULL DEFAULT 'collaborator'::text,
  creado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT asignaciones_actividad_pkey PRIMARY KEY (id),
  CONSTRAINT asignaciones_actividad_id_actividad_fkey FOREIGN KEY (id_actividad) REFERENCES public.actividades(id),
  CONSTRAINT asignaciones_actividad_id_perfil_fkey FOREIGN KEY (id_perfil) REFERENCES public.perfiles(id)
);
CREATE TABLE public.asignaciones_presupuesto (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  id_equipo uuid NOT NULL,
  id_plan uuid,
  monto numeric NOT NULL CHECK (monto >= 0::numeric),
  descripcion text,
  creado_en timestamp with time zone DEFAULT now(),
  actualizado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT asignaciones_presupuesto_pkey PRIMARY KEY (id),
  CONSTRAINT asignaciones_presupuesto_id_equipo_fkey FOREIGN KEY (id_equipo) REFERENCES public.equipos(id),
  CONSTRAINT asignaciones_presupuesto_id_plan_fkey FOREIGN KEY (id_plan) REFERENCES public.planes_desarrollo(id)
);
CREATE TABLE public.equipos (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  nombre text NOT NULL,
  id_lider uuid,
  presupuesto_asignado numeric DEFAULT 0 CHECK (presupuesto_asignado >= 0::numeric),
  creado_en timestamp with time zone DEFAULT now(),
  actualizado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT equipos_pkey PRIMARY KEY (id),
  CONSTRAINT equipos_id_lider_fkey FOREIGN KEY (id_lider) REFERENCES public.perfiles(id)
);
CREATE TABLE public.historial_plan (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  id_plan uuid NOT NULL,
  modificado_por uuid NOT NULL,
  tipo_cambio text NOT NULL,
  valores_anteriores jsonb,
  valores_nuevos jsonb,
  descripcion text,
  creado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT historial_plan_pkey PRIMARY KEY (id),
  CONSTRAINT historial_plan_id_plan_fkey FOREIGN KEY (id_plan) REFERENCES public.planes_desarrollo(id),
  CONSTRAINT historial_plan_modificado_por_fkey FOREIGN KEY (modificado_por) REFERENCES public.perfiles(id)
);
CREATE TABLE public.lecciones_plan (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  id_plan uuid NOT NULL,
  texto_leccion text NOT NULL,
  creado_por uuid NOT NULL,
  creado_en timestamp with time zone DEFAULT now(),
  actualizado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT lecciones_plan_pkey PRIMARY KEY (id),
  CONSTRAINT lecciones_plan_id_plan_fkey FOREIGN KEY (id_plan) REFERENCES public.planes_desarrollo(id),
  CONSTRAINT lecciones_plan_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES public.perfiles(id)
);
CREATE TABLE public.metricas_equipo (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  id_equipo uuid NOT NULL UNIQUE,
  poblacion integer,
  congregaciones_evangelicas integer,
  evangelicos integer,
  contactos_primera_vez integer,
  interesados_evangelio integer,
  escucharon_evangelio integer,
  buscando_dios integer,
  oportunidad_responder integer,
  creyeron_mensaje integer,
  bautizados integer,
  estudios_biblicos_regulares integer,
  discipulado_personal integer,
  grupos_nuevos_este_ano integer,
  entrenamiento_ministerial integer,
  entrenamiento_otras_areas integer,
  entrenamiento_pastoral integer,
  entrenamiento_biblico integer,
  entrenamiento_plantacion_iglesias integer,
  grupos_con_prospectos_iglesia integer,
  iglesias_fin_periodo integer,
  iglesias_primera_gen integer,
  iglesias_segunda_gen integer,
  iglesias_tercera_gen integer,
  iglesias_perdidas_primera_gen integer,
  iglesias_perdidas_segunda_gen integer,
  iglesias_perdidas_tercera_gen integer,
  ubicacion_ministerio text,
  creado_en timestamp with time zone DEFAULT now(),
  actualizado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT metricas_equipo_pkey PRIMARY KEY (id),
  CONSTRAINT metricas_equipo_id_equipo_fkey FOREIGN KEY (id_equipo) REFERENCES public.equipos(id)
);
CREATE TABLE public.miembros_equipo (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  id_equipo uuid NOT NULL,
  id_perfil uuid NOT NULL,
  rol text NOT NULL DEFAULT 'member'::text,
  activo boolean DEFAULT true,
  creado_en timestamp with time zone DEFAULT now(),
  actualizado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT miembros_equipo_pkey PRIMARY KEY (id),
  CONSTRAINT miembros_equipo_id_equipo_fkey FOREIGN KEY (id_equipo) REFERENCES public.equipos(id),
  CONSTRAINT miembros_equipo_id_perfil_fkey FOREIGN KEY (id_perfil) REFERENCES public.perfiles(id)
);
CREATE TABLE public.objetivos_area (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  id_plan uuid NOT NULL,
  categoria USER-DEFINED NOT NULL,
  descripcion text NOT NULL,
  numero_orden integer NOT NULL DEFAULT 0,
  numero_objetivo integer,
  creado_en timestamp with time zone DEFAULT now(),
  actualizado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT objetivos_area_pkey PRIMARY KEY (id),
  CONSTRAINT objetivos_area_id_plan_fkey FOREIGN KEY (id_plan) REFERENCES public.planes_desarrollo(id)
);
CREATE TABLE public.perfiles (
  id uuid NOT NULL,
  nombre_usuario text NOT NULL UNIQUE,
  nombre_completo text,
  rol USER-DEFINED NOT NULL DEFAULT 'member'::rol_usuario,
  id_equipo uuid,
  creado_en timestamp with time zone DEFAULT now(),
  actualizado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT perfiles_pkey PRIMARY KEY (id),
  CONSTRAINT perfiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id),
  CONSTRAINT perfiles_id_equipo_fkey FOREIGN KEY (id_equipo) REFERENCES public.equipos(id),
  CONSTRAINT fk_perfiles_id_equipo FOREIGN KEY (id_equipo) REFERENCES public.equipos(id)
);
CREATE TABLE public.planes_desarrollo (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  id_equipo uuid NOT NULL,
  nombre text NOT NULL,
  categoria USER-DEFINED NOT NULL,
  estado USER-DEFINED NOT NULL DEFAULT 'Activo'::estado_plan,
  fecha_inicio date NOT NULL,
  fecha_fin date NOT NULL,
  resumen text,
  etapas_plan ARRAY,
  creado_en timestamp with time zone DEFAULT now(),
  actualizado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT planes_desarrollo_pkey PRIMARY KEY (id),
  CONSTRAINT planes_desarrollo_id_equipo_fkey FOREIGN KEY (id_equipo) REFERENCES public.equipos(id)
);