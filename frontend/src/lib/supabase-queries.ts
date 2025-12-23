/**
 * Funciones helper para consultar Supabase
 * Todas las funciones respetan las políticas RLS configuradas
 */

import { supabase } from "./supabase";
import type {
  Equipo,
  PlanDesarrollo,
  Actividad,
  Perfil,
  MiembroEquipo,
  MetricasEquipo,
  ObjetivoArea,
  AsignacionActividad,
  ActualizacionActividad,
  ActividadInsert,
  PlanDesarrolloInsert,
  EquipoInsert,
  ActividadUpdate,
  PlanDesarrolloUpdate,
  EquipoUpdate,
} from "./database.types";

// ============================================================================
// EQUIPOS
// ============================================================================

/**
 * Obtener todos los equipos (solo superadmin o líderes de su equipo)
 */
export async function getEquipos(): Promise<Equipo[]> {
  const { data, error } = await supabase
    .from("equipos")
    .select("*")
    .order("nombre");

  if (error) throw error;
  return data || [];
}

/**
 * Obtener un equipo por ID
 */
export async function getEquipoById(id: string): Promise<Equipo | null> {
  const { data, error } = await supabase
    .from("equipos")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // No encontrado
    throw error;
  }
  return data;
}

/**
 * Obtener equipo con su líder
 */
export async function getEquipoConLider(id: string) {
  const { data, error } = await supabase
    .from("equipos")
    .select(`
      *,
      lider:perfiles!equipos_id_lider_fkey (
        id,
        nombre_usuario,
        nombre_completo,
        rol
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data;
}

/**
 * Crear un nuevo equipo (solo superadmin)
 */
export async function createEquipo(equipo: EquipoInsert): Promise<Equipo> {
  const { data, error } = await supabase
    .from("equipos")
    .insert(equipo)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Actualizar un equipo (solo superadmin)
 */
export async function updateEquipo(update: EquipoUpdate): Promise<Equipo> {
  const { id, ...rest } = update;
  const { data, error } = await supabase
    .from("equipos")
    .update(rest)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================================================
// PLANES DE DESARROLLO
// ============================================================================

/**
 * Obtener todos los planes de un equipo
 */
export async function getPlanesByEquipo(equipoId: string): Promise<PlanDesarrollo[]> {
  const { data, error } = await supabase
    .from("planes_desarrollo")
    .select("*")
    .eq("id_equipo", equipoId)
    .order("fecha_inicio", { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Obtener plan activo de un equipo
 */
export async function getPlanActivo(equipoId: string): Promise<PlanDesarrollo | null> {
  const { data, error } = await supabase
    .from("planes_desarrollo")
    .select("*")
    .eq("id_equipo", equipoId)
    .eq("estado", "Activo")
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Obtener un plan por ID con sus actividades y objetivos
 */
export async function getPlanCompleto(planId: string) {
  const { data, error } = await supabase
    .from("planes_desarrollo")
    .select(`
      *,
      objetivos:objetivos_area (*),
      actividades:actividades (*)
    `)
    .eq("id", planId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data;
}

/**
 * Crear un nuevo plan (superadmin o líder de equipo)
 */
export async function createPlan(plan: PlanDesarrolloInsert): Promise<PlanDesarrollo> {
  const { data, error } = await supabase
    .from("planes_desarrollo")
    .insert(plan)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Actualizar un plan
 */
export async function updatePlan(update: PlanDesarrolloUpdate): Promise<PlanDesarrollo> {
  const { id, ...rest } = update;
  const { data, error } = await supabase
    .from("planes_desarrollo")
    .update(rest)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================================================
// ACTIVIDADES
// ============================================================================

/**
 * Obtener todas las actividades de un plan
 */
export async function getActividadesByPlan(planId: string): Promise<Actividad[]> {
  const { data, error } = await supabase
    .from("actividades")
    .select("*")
    .eq("id_plan", planId)
    .order("fecha_inicio");

  if (error) throw error;
  return data || [];
}

/**
 * Obtener actividades de un equipo
 */
export async function getActividadesByEquipo(equipoId: string): Promise<Actividad[]> {
  const { data, error } = await supabase
    .from("actividades")
    .select("*")
    .eq("id_equipo", equipoId)
    .order("fecha_inicio");

  if (error) throw error;
  return data || [];
}

/**
 * Obtener una actividad por ID con sus asignaciones y actualizaciones
 */
export async function getActividadCompleta(actividadId: string) {
  const { data, error } = await supabase
    .from("actividades")
    .select(`
      *,
      asignaciones:asignaciones_actividad (
        *,
        perfil:perfiles (id, nombre_usuario, nombre_completo)
      ),
      actualizaciones:actualizaciones_actividad (
        *,
        perfil:perfiles (id, nombre_usuario, nombre_completo)
      )
    `)
    .eq("id", actividadId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data;
}

/**
 * Crear una nueva actividad
 */
export async function createActividad(actividad: ActividadInsert): Promise<Actividad> {
  const { data, error } = await supabase
    .from("actividades")
    .insert(actividad)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Actualizar una actividad
 */
export async function updateActividad(update: ActividadUpdate): Promise<Actividad> {
  const { id, ...rest } = update;
  const { data, error } = await supabase
    .from("actividades")
    .update(rest)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Eliminar una actividad
 */
export async function deleteActividad(actividadId: string): Promise<void> {
  const { error } = await supabase
    .from("actividades")
    .delete()
    .eq("id", actividadId);

  if (error) throw error;
}

// ============================================================================
// MÉTRICAS DE EQUIPO
// ============================================================================

/**
 * Obtener métricas de un equipo
 */
export async function getMetricasEquipo(equipoId: string): Promise<MetricasEquipo | null> {
  const { data, error } = await supabase
    .from("metricas_equipo")
    .select("*")
    .eq("id_equipo", equipoId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// ============================================================================
// MIEMBROS DE EQUIPO
// ============================================================================

/**
 * Obtener miembros de un equipo
 */
export async function getMiembrosEquipo(equipoId: string) {
  const { data, error } = await supabase
    .from("miembros_equipo")
    .select(`
      *,
      perfil:perfiles (id, nombre_usuario, nombre_completo, rol)
    `)
    .eq("id_equipo", equipoId)
    .eq("activo", true)
    .order("creado_en");

  if (error) throw error;
  return data || [];
}

// ============================================================================
// DASHBOARD - MÉTRICAS AGREGADAS
// ============================================================================

/**
 * Obtener métricas del dashboard para todos los equipos (solo superadmin)
 * Usa la función RPC si está disponible, sino calcula manualmente
 */
export async function getDashboardMetrics() {
  // Intentar usar la función RPC primero
  const { data: rpcData, error: rpcError } = await supabase.rpc(
    "obtener_metricas_dashboard_equipo"
  );

  if (!rpcError && rpcData) {
    return rpcData;
  }

  // Fallback: calcular manualmente
  const equipos = await getEquipos();
  const metrics = await Promise.all(
    equipos.map(async (equipo) => {
      const planes = await getPlanesByEquipo(equipo.id);
      const planActivo = planes.find((p) => p.estado === "Activo");
      
      const actividades = planActivo
        ? await getActividadesByPlan(planActivo.id)
        : [];

      const actividadesPendientes = actividades.filter(
        (a) => a.estado === "Pendiente"
      ).length;
      const actividadesCompletadas = actividades.filter(
        (a) => a.estado === "Hecha"
      ).length;

      const presupuestoLiquidado = actividades.reduce(
        (sum, a) => sum + Number(a.presupuesto_liquidado || 0),
        0
      );
      const presupuestoPendiente = actividades
        .filter((a) => a.estado === "Pendiente")
        .reduce(
          (sum, a) =>
            sum + Number(a.presupuesto_total || 0) - Number(a.presupuesto_liquidado || 0),
          0
        );

      return {
        id_equipo: equipo.id,
        nombre_equipo: equipo.nombre,
        lider: equipo.id_lider ? "Cargando..." : "Sin líder",
        id_plan_activo: planActivo?.id || null,
        nombre_plan_activo: planActivo?.nombre || null,
        planes_completados_count: planes.filter((p) => p.estado === "Finalizado").length,
        actividades_pendientes_count: actividadesPendientes,
        actividades_completadas_count: actividadesCompletadas,
        presupuesto_liquidado: presupuestoLiquidado,
        presupuesto_pendiente: presupuestoPendiente,
        presupuesto_asignado: Number(equipo.presupuesto_asignado || 0),
      };
    })
  );

  return metrics;
}

// ============================================================================
// PERFILES
// ============================================================================

/**
 * Obtener perfil de un usuario
 */
export async function getPerfil(userId: string): Promise<Perfil | null> {
  const { data, error } = await supabase
    .from("perfiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

