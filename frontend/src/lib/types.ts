export type ActivityStatus = "Hecha" | "Pendiente";

export type ActivityStage = "Contacto" | "Comunicar";

export interface Member {
  name: string;
  role: string;
}

export interface AreaObjective {
  id: string;
  planId: string;
  category: PlanCategory;
  description: string;
  order: number;
  objectiveNumber?: number; // Número del objetivo global
}

export interface Activity {
  id: string;
  teamId: string;
  planId: string;
  objectiveId?: string;
  objectiveNumber?: number; // Número del objetivo global al que pertenece
  name: string;
  responsable: string;
  budgetTotal: number;
  budgetLiquidated: number;
  status: ActivityStatus;
  stage: ActivityStage | string;
  planStage?: string; // Etapa del plan a la que pertenece (ej: "Fase de diagnóstico", "Fase de ejecución")
  area: string;
  objective: string; // Mantenemos por compatibilidad, pero usamos objectiveId
  description: string;
  currentSituation: string;
  goalMid: string;
  goalLong: string;
  frequency: string;
  timesPerYear: number;
  startDate: string;
  endDate: string;
  totalWeeks: number;
  remainingWeeks: number;
  obstacles: string;
}

export type PlanCategory =
  | "Investigación"
  | "Encarnación"
  | "Evangelización"
  | "Entrenamiento"
  | "Autocuidado";

export type PlanStatus = "Activo" | "Finalizado" | "Archivado";

export interface DevelopmentPlan {
  id: string;
  teamId: string;
  name: string;
  category: PlanCategory;
  status: PlanStatus;
  startDate: string;
  endDate: string;
  summary: string;
  objectives?: AreaObjective[];
  activities: Activity[];
  stages?: string[]; // Etapas del plan (ej: ["Fase de diagnóstico", "Fase de ejecución", "Fase de evaluación", "Fase de cierre"])
}

export interface TeamMetrics {
  // Métricas generales
  population?: number;
  evangelicalCongregations?: number;
  evangelicals?: number;
  
  // Etapa: Contacto
  firstTimeContacts?: number;
  interestedInGospel?: number;
  heardGospel?: number;
  
  // Etapa: Comunicando
  seekingGod?: number;
  opportunityToRespond?: number;
  
  // Etapa: Respondiendo
  believedMessage?: number;
  baptized?: number;
  
  // Etapa: Consolidando
  regularBibleStudies?: number;
  personallyMentored?: number;
  newGroupsThisYear?: number;
  
  // Etapa: Liderazgo
  ministerialTraining?: number;
  otherAreasTraining?: number;
  pastoralTraining?: number;
  biblicalTraining?: number;
  churchPlantingTraining?: number;
  
  // Desarrollo eclesial
  groupsWithChurchProspects?: number;
  churchesAtEndOfPeriod?: number;
  firstGenChurches?: number;
  secondGenChurches?: number;
  thirdGenChurches?: number;
  lostFirstGenChurches?: number;
  lostSecondGenChurches?: number;
  lostThirdGenChurches?: number;
  
  // Lugar de ministerio
  ministryLocation?: string;
}

export interface Team {
  id: string;
  name: string;
  leader: string;
  members: Member[];
  budgetAssigned: number;
  budgetLiquidated: number;
  budgetPending: number;
  plans: DevelopmentPlan[];
  metrics?: TeamMetrics;
}

export interface DashboardTeamMetrics {
  teamId: string;
  teamName: string;
  leader: string;
  activePlan?: DevelopmentPlan;
  completedPlans: number;
  pendingActivities: number;
  doneActivities: number;
  budgetLiquidated: number;
  budgetPending: number;
  budgetAssigned: number;
}

