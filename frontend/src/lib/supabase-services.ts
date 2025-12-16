import { cache } from "react";
import { supabase } from "./supabase";
import {
  Activity,
  DashboardTeamMetrics,
  DevelopmentPlan,
  Member,
  PlanStatus,
  Team,
  TeamMetrics
} from "./types";

// Mapeo de tipos de base de datos a tipos TypeScript

// Equipos
interface EquipoDB {
  id: string;
  nombre: string;
  id_lider: string | null;
  presupuesto_asignado: number;
  perfiles?: { id: string; nombre_usuario: string; nombre_completo: string | null } | null;
}

// Planes
interface PlanDesarrolloDB {
  id: string;
  id_equipo: string;
  nombre: string;
  categoria: string;
  estado: string;
  fecha_inicio: string;
  fecha_fin: string;
  summary: string | null;
}

// Actividades
interface ActividadDB {
  id: string;
  id_equipo: string;
  id_plan: string;
  id_objetivo: string | null;
  nombre: string;
  responsable: string;
  presupuesto_total: number;
  presupuesto_liquidado: number;
  estado: string;
  stage: string | null;
  area: string;
  objective: string | null;
  description: string | null;
  situacion_actual: string | null;
  objetivo_mediano: string | null;
  objetivo_largo: string | null;
  frequency: string | null;
  veces_por_ano: number;
  fecha_inicio: string;
  fecha_fin: string;
  semanas_totales: number;
  semanas_restantes: number;
  obstacles: string | null;
}

// Miembros
interface MiembroEquipoDB {
  id_perfil: string;
  rol: string;
  perfiles?: { id: string; nombre_usuario: string; nombre_completo: string | null } | null;
}

// Métricas
interface MetricasEquipoDB {
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
}

// Funciones de mapeo
function mapEquipoToTeam(equipo: EquipoDB, miembros: MiembroEquipoDB[], planes: DevelopmentPlan[], metricas?: TeamMetrics): Team {
  return {
    id: equipo.id,
    name: equipo.nombre,
    leader: equipo.perfiles?.nombre_completo || equipo.perfiles?.nombre_usuario || "",
    members: miembros.map(m => ({
      name: m.perfiles?.nombre_completo || m.perfiles?.nombre_usuario || "",
      role: m.rol
    })),
    budgetAssigned: Number(equipo.presupuesto_asignado) || 0,
    budgetLiquidated: 0, // Se calculará después
    budgetPending: 0, // Se calculará después
    plans: planes,
    metrics: metricas
  };
}

function mapPlanToDevelopmentPlan(plan: PlanDesarrolloDB, actividades: Activity[]): DevelopmentPlan {
  return {
    id: plan.id,
    teamId: plan.id_equipo,
    name: plan.nombre,
    category: plan.categoria as DevelopmentPlan["category"],
    status: plan.estado as PlanStatus,
    startDate: plan.fecha_inicio,
    endDate: plan.fecha_fin,
    summary: plan.summary || "",
    activities: actividades
  };
}

function mapActividadToActivity(actividad: ActividadDB): Activity {
  return {
    id: actividad.id,
    teamId: actividad.id_equipo,
    planId: actividad.id_plan,
    objectiveId: actividad.id_objetivo || undefined,
    name: actividad.nombre,
    responsable: actividad.responsable,
    budgetTotal: Number(actividad.presupuesto_total) || 0,
    budgetLiquidated: Number(actividad.presupuesto_liquidado) || 0,
    status: actividad.estado as Activity["status"],
    stage: actividad.stage || "",
    area: actividad.area,
    objective: actividad.objective || "",
    description: actividad.description || "",
    currentSituation: actividad.situacion_actual || "",
    goalMid: actividad.objetivo_mediano || "",
    goalLong: actividad.objetivo_largo || "",
    frequency: actividad.frequency || "",
    timesPerYear: actividad.veces_por_ano || 0,
    startDate: actividad.fecha_inicio,
    endDate: actividad.fecha_fin,
    totalWeeks: actividad.semanas_totales || 0,
    remainingWeeks: actividad.semanas_restantes || 0,
    obstacles: actividad.obstacles || ""
  };
}

function mapMetricasToTeamMetrics(metricas: MetricasEquipoDB): TeamMetrics {
  return {
    population: metricas.poblacion || undefined,
    evangelicalCongregations: metricas.congregaciones_evangelicas || undefined,
    evangelicals: metricas.evangelicos || undefined,
    firstTimeContacts: metricas.contactos_primera_vez || undefined,
    interestedInGospel: metricas.interesados_evangelio || undefined,
    heardGospel: metricas.escucharon_evangelio || undefined,
    seekingGod: metricas.buscando_dios || undefined,
    opportunityToRespond: metricas.oportunidad_responder || undefined,
    believedMessage: metricas.creyeron_mensaje || undefined,
    baptized: metricas.bautizados || undefined,
    regularBibleStudies: metricas.estudios_biblicos_regulares || undefined,
    personallyMentored: metricas.discipulado_personal || undefined,
    newGroupsThisYear: metricas.grupos_nuevos_este_ano || undefined,
    ministerialTraining: metricas.entrenamiento_ministerial || undefined,
    otherAreasTraining: metricas.entrenamiento_otras_areas || undefined,
    pastoralTraining: metricas.entrenamiento_pastoral || undefined,
    biblicalTraining: metricas.entrenamiento_biblico || undefined,
    churchPlantingTraining: metricas.entrenamiento_plantacion_iglesias || undefined,
    groupsWithChurchProspects: metricas.grupos_con_prospectos_iglesia || undefined,
    churchesAtEndOfPeriod: metricas.iglesias_fin_periodo || undefined,
    firstGenChurches: metricas.iglesias_primera_gen || undefined,
    secondGenChurches: metricas.iglesias_segunda_gen || undefined,
    thirdGenChurches: metricas.iglesias_tercera_gen || undefined,
    lostFirstGenChurches: metricas.iglesias_perdidas_primera_gen || undefined,
    lostSecondGenChurches: metricas.iglesias_perdidas_segunda_gen || undefined,
    lostThirdGenChurches: metricas.iglesias_perdidas_tercera_gen || undefined,
    ministryLocation: metricas.ubicacion_ministerio || undefined
  };
}

// Funciones de servicio
export const loadTeams = cache(async (): Promise<Team[]> => {
  try {
    // Cargar equipos
    const { data: equipos, error: equiposError } = await supabase
      .from("equipos")
      .select("id, nombre, id_lider, presupuesto_asignado")
      .order("nombre");

    if (equiposError) throw equiposError;
    if (!equipos) return [];

    const teamIds = equipos.map(e => e.id);
    const liderIds = equipos.map(e => e.id_lider).filter((id): id is string => id !== null);

    // Cargar perfiles de líderes
    const { data: perfilesLideres, error: perfilesError } = await supabase
      .from("perfiles")
      .select("id, nombre_usuario, nombre_completo")
      .in("id", liderIds);

    if (perfilesError) throw perfilesError;

    // Crear mapa de líderes
    const lideresMap = new Map(
      (perfilesLideres || []).map(p => [p.id, p])
    );

    // Cargar miembros de todos los equipos
    const { data: miembros, error: miembrosError } = await supabase
      .from("miembros_equipo")
      .select("id_equipo, id_perfil, rol")
      .in("id_equipo", teamIds)
      .eq("activo", true);

    if (miembrosError) throw miembrosError;

    const miembrosPerfilIds = (miembros || []).map(m => m.id_perfil);

    // Cargar perfiles de miembros
    const { data: perfilesMiembros, error: perfilesMiembrosError } = await supabase
      .from("perfiles")
      .select("id, nombre_usuario, nombre_completo")
      .in("id", miembrosPerfilIds);

    if (perfilesMiembrosError) throw perfilesMiembrosError;

    const perfilesMiembrosMap = new Map(
      (perfilesMiembros || []).map(p => [p.id, p])
    );

    // Cargar planes de todos los equipos
    const { data: planes, error: planesError } = await supabase
      .from("planes_desarrollo")
      .select("*")
      .in("id_equipo", teamIds)
      .order("fecha_inicio", { ascending: false });

    if (planesError) throw planesError;

    const planIds = planes?.map(p => p.id) || [];

    // Cargar actividades de todos los planes
    const { data: actividades, error: actividadesError } = await supabase
      .from("actividades")
      .select("*")
      .in("id_plan", planIds)
      .order("fecha_inicio");

    if (actividadesError) throw actividadesError;

    // Cargar métricas de todos los equipos
    const { data: metricas, error: metricasError } = await supabase
      .from("metricas_equipo")
      .select("*")
      .in("id_equipo", teamIds);

    if (metricasError) throw metricasError;

    // Organizar datos por equipo
    const teams: Team[] = equipos.map(equipo => {
      const lider = equipo.id_lider ? lideresMap.get(equipo.id_lider) : null;
      
      const miembrosEquipo = (miembros || [])
        .filter(m => m.id_equipo === equipo.id)
        .map(m => ({
          id_perfil: m.id_perfil,
          rol: m.rol,
          perfiles: perfilesMiembrosMap.get(m.id_perfil) || null
        }));

      const planesEquipo = (planes || [])
        .filter(p => p.id_equipo === equipo.id)
        .map(plan => {
          const actividadesPlan = (actividades || [])
            .filter(a => a.id_plan === plan.id)
            .map(mapActividadToActivity);
          return mapPlanToDevelopmentPlan(plan, actividadesPlan);
        });

      const metricasEquipo = (metricas || []).find(m => m.id_equipo === equipo.id);
      const teamMetrics = metricasEquipo ? mapMetricasToTeamMetrics(metricasEquipo) : undefined;

      const equipoConLider = {
        ...equipo,
        perfiles: lider || null
      };

      const team = mapEquipoToTeam(equipoConLider, miembrosEquipo, planesEquipo, teamMetrics);

      // Calcular presupuestos
      let liquidated = 0;
      let pending = 0;

      planesEquipo.forEach(plan => {
        plan.activities.forEach(activity => {
          liquidated += activity.budgetLiquidated;
          const remaining = Math.max(activity.budgetTotal - activity.budgetLiquidated, 0);
          if (activity.status === "Pendiente") {
            pending += remaining;
          }
        });
      });

      team.budgetLiquidated = liquidated;
      const calculatedPending = Math.max(team.budgetAssigned - liquidated, 0);
      team.budgetPending = pending > 0 ? pending : calculatedPending;

      return team;
    });

    return teams;
  } catch (error) {
    console.error("Error loading teams:", error);
    return [];
  }
});

export const loadDashboardMetrics = cache(
  async (): Promise<DashboardTeamMetrics[]> => {
    const teams = await loadTeams();

    return teams.map((team) => {
      const activePlan = team.plans.find((plan) => plan.status === "Activo");
      const completedPlans = team.plans.filter(
        (plan) => plan.status === "Finalizado"
      ).length;
      let pendingActivities = 0;
      let doneActivities = 0;

      team.plans.forEach((plan) => {
        plan.activities.forEach((activity) => {
          if (activity.status === "Hecha") {
            doneActivities += 1;
          } else {
            pendingActivities += 1;
          }
        });
      });

      return {
        teamId: team.id,
        teamName: team.name,
        leader: team.leader,
        activePlan,
        completedPlans,
        pendingActivities,
        doneActivities,
        budgetLiquidated: team.budgetLiquidated,
        budgetPending: team.budgetPending,
        budgetAssigned: team.budgetAssigned
      };
    });
  }
);

export const loadTeamById = cache(async (teamId: string): Promise<Team | null> => {
  const teams = await loadTeams();
  return teams.find((team) => team.id === teamId) ?? null;
});

export const loadPlanById = cache(async (planId: string): Promise<{ plan: DevelopmentPlan; team: Team } | null> => {
  const teams = await loadTeams();
  for (const team of teams) {
    const plan = team.plans.find((p) => p.id === planId);
    if (plan) {
      return { plan, team };
    }
  }
  return null;
});

