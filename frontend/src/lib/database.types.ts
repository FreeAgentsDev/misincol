/**
 * Tipos TypeScript generados a partir del esquema de Supabase
 * Basado en el esquema SQL proporcionado
 */

// ============================================================================
// ENUMS
// ============================================================================

export type EstadoActividad = "Hecha" | "Pendiente";
export type CategoriaPlan = "Investigación" | "Encarnación" | "Evangelización" | "Entrenamiento" | "Autocuidado";
export type EstadoPlan = "Activo" | "Finalizado" | "Archivado";
export type RolUsuario = "superadmin" | "leader" | "member";

// ============================================================================
// TABLA: perfiles
// ============================================================================

export interface Perfil {
  id: string; // UUID, FK a auth.users(id)
  nombre_usuario: string; // UNIQUE
  nombre_completo: string | null;
  rol: RolUsuario;
  id_equipo: string | null; // UUID, FK a equipos(id)
  creado_en: string; // timestamptz
  actualizado_en: string; // timestamptz
}

// ============================================================================
// TABLA: equipos
// ============================================================================

export interface Equipo {
  id: string; // UUID
  nombre: string;
  id_lider: string | null; // UUID, FK a perfiles(id)
  presupuesto_asignado: number; // numeric(15, 2)
  creado_en: string; // timestamptz
  actualizado_en: string; // timestamptz
}

// ============================================================================
// TABLA: miembros_equipo
// ============================================================================

export interface MiembroEquipo {
  id: string; // UUID
  id_equipo: string; // UUID, FK a equipos(id)
  id_perfil: string; // UUID, FK a perfiles(id)
  rol: string; // default 'member'
  activo: boolean; // default true
  creado_en: string; // timestamptz
  actualizado_en: string; // timestamptz
}

// ============================================================================
// TABLA: metricas_equipo
// ============================================================================

export interface MetricasEquipo {
  id: string; // UUID
  id_equipo: string; // UUID, UNIQUE, FK a equipos(id)
  poblacion: number | null;
  congregaciones_evangelicas: number | null;
  evangelicos: number | null;
  contactos_primera_vez: number | null;
  interesados_evangelio: number | null;
  escucharon_evangelio: number | null;
  buscando_dios: number | null;
  oportunidad_responder: number | null;
  creyeron_mensaje: number | null;
  bautizados: number | null;
  estudios_biblicos_regulares: number | null;
  discipulado_personal: number | null;
  grupos_nuevos_este_ano: number | null;
  entrenamiento_ministerial: number | null;
  entrenamiento_otras_areas: number | null;
  entrenamiento_pastoral: number | null;
  entrenamiento_biblico: number | null;
  entrenamiento_plantacion_iglesias: number | null;
  grupos_con_prospectos_iglesia: number | null;
  iglesias_fin_periodo: number | null;
  iglesias_primera_gen: number | null;
  iglesias_segunda_gen: number | null;
  iglesias_tercera_gen: number | null;
  iglesias_perdidas_primera_gen: number | null;
  iglesias_perdidas_segunda_gen: number | null;
  iglesias_perdidas_tercera_gen: number | null;
  ubicacion_ministerio: string | null;
  creado_en: string; // timestamptz
  actualizado_en: string; // timestamptz
}

// ============================================================================
// TABLA: planes_desarrollo
// ============================================================================

export interface PlanDesarrollo {
  id: string; // UUID
  id_equipo: string; // UUID, FK a equipos(id)
  nombre: string;
  categoria: CategoriaPlan;
  estado: EstadoPlan;
  fecha_inicio: string; // date
  fecha_fin: string; // date
  resumen: string | null;
  etapas_plan: string[] | null; // ARRAY
  creado_en: string; // timestamptz
  actualizado_en: string; // timestamptz
}

// ============================================================================
// TABLA: objetivos_area
// ============================================================================

export interface ObjetivoArea {
  id: string; // UUID
  id_plan: string; // UUID, FK a planes_desarrollo(id)
  categoria: CategoriaPlan;
  descripcion: string;
  numero_orden: number; // default 0
  numero_objetivo: number | null; // Número del objetivo global (opcional)
  creado_en: string; // timestamptz
  actualizado_en: string; // timestamptz
}

// ============================================================================
// TABLA: actividades
// ============================================================================

export interface Actividad {
  id: string; // UUID
  id_equipo: string; // UUID, FK a equipos(id)
  id_plan: string; // UUID, FK a planes_desarrollo(id)
  id_objetivo: string | null; // UUID, FK a objetivos_area(id)
  nombre: string;
  responsable: string;
  presupuesto_total: number; // numeric(15, 2), default 0
  presupuesto_liquidado: number; // numeric(15, 2), default 0
  estado: EstadoActividad;
  etapa: string | null;
  etapa_plan: string | null; // Etapa del plan a la que pertenece
  area: string;
  objetivo: string | null; // Mantenido por compatibilidad
  numero_objetivo: number | null; // Número del objetivo global al que pertenece
  descripcion: string | null;
  situacion_actual: string | null;
  objetivo_mediano: string | null;
  objetivo_largo: string | null;
  frecuencia: string | null;
  veces_por_ano: number; // default 0
  fecha_inicio: string; // date
  fecha_fin: string; // date
  semanas_totales: number; // default 0
  semanas_restantes: number; // default 0
  obstaculos: string | null;
  creado_en: string; // timestamptz
  actualizado_en: string; // timestamptz
}

// ============================================================================
// TABLA: asignaciones_actividad
// ============================================================================

export interface AsignacionActividad {
  id: string; // UUID
  id_actividad: string; // UUID, FK a actividades(id)
  id_perfil: string; // UUID, FK a perfiles(id)
  rol: string; // default 'collaborator' ('responsible' o 'collaborator')
  creado_en: string; // timestamptz
}

// ============================================================================
// TABLA: actualizaciones_actividad
// ============================================================================

export interface ActualizacionActividad {
  id: string; // UUID
  id_actividad: string; // UUID, FK a actividades(id)
  id_perfil: string; // UUID, FK a perfiles(id)
  texto_actualizacion: string;
  creado_en: string; // timestamptz
}

// ============================================================================
// TABLA: asignaciones_presupuesto
// ============================================================================

export interface AsignacionPresupuesto {
  id: string; // UUID
  id_equipo: string; // UUID, FK a equipos(id)
  id_plan: string | null; // UUID, FK a planes_desarrollo(id)
  monto: number; // numeric(15, 2)
  descripcion: string | null;
  creado_en: string; // timestamptz
  actualizado_en: string; // timestamptz
}

// ============================================================================
// TABLA: historial_plan
// ============================================================================

export interface HistorialPlan {
  id: string; // UUID
  id_plan: string; // UUID, FK a planes_desarrollo(id)
  modificado_por: string; // UUID, FK a perfiles(id)
  tipo_cambio: string; // 'created', 'updated', 'status_changed', 'deleted'
  valores_anteriores: Record<string, any> | null; // jsonb
  valores_nuevos: Record<string, any> | null; // jsonb
  descripcion: string | null;
  creado_en: string; // timestamptz
}

// ============================================================================
// TABLA: lecciones_plan
// ============================================================================

export interface LeccionPlan {
  id: string; // UUID
  id_plan: string; // UUID, FK a planes_desarrollo(id)
  texto_leccion: string;
  creado_por: string; // UUID, FK a perfiles(id)
  creado_en: string; // timestamptz
  actualizado_en: string; // timestamptz
}

// ============================================================================
// TIPOS PARA INSERCIÓN (sin campos auto-generados)
// ============================================================================

export type PerfilInsert = Omit<Perfil, "creado_en" | "actualizado_en">;
export type EquipoInsert = Omit<Equipo, "id" | "creado_en" | "actualizado_en">;
export type MiembroEquipoInsert = Omit<MiembroEquipo, "id" | "creado_en" | "actualizado_en">;
export type MetricasEquipoInsert = Omit<MetricasEquipo, "id" | "creado_en" | "actualizado_en">;
export type PlanDesarrolloInsert = Omit<PlanDesarrollo, "id" | "creado_en" | "actualizado_en">;
export type ObjetivoAreaInsert = Omit<ObjetivoArea, "id" | "creado_en" | "actualizado_en">;
export type ActividadInsert = Omit<Actividad, "id" | "creado_en" | "actualizado_en">;
export type AsignacionActividadInsert = Omit<AsignacionActividad, "id" | "creado_en">;
export type ActualizacionActividadInsert = Omit<ActualizacionActividad, "id" | "creado_en">;
export type AsignacionPresupuestoInsert = Omit<AsignacionPresupuesto, "id" | "creado_en" | "actualizado_en">;
export type HistorialPlanInsert = Omit<HistorialPlan, "id" | "creado_en">;
export type LeccionPlanInsert = Omit<LeccionPlan, "id" | "creado_en" | "actualizado_en">;

// ============================================================================
// TIPOS PARA ACTUALIZACIÓN (todos los campos opcionales excepto id)
// ============================================================================

export type PerfilUpdate = Partial<Omit<Perfil, "id" | "creado_en">> & { id: string };
export type EquipoUpdate = Partial<Omit<Equipo, "id" | "creado_en">> & { id: string };
export type ActividadUpdate = Partial<Omit<Actividad, "id" | "creado_en">> & { id: string };
export type PlanDesarrolloUpdate = Partial<Omit<PlanDesarrollo, "id" | "creado_en">> & { id: string };

