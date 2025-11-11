export type ActivityStatus = "Hecha" | "Pendiente";

export interface Member {
  name: string;
  role: string;
}

export interface Activity {
  id: string;
  teamId: string;
  planId: string;
  name: string;
  responsable: string;
  budgetTotal: number;
  budgetLiquidated: number;
  status: ActivityStatus;
  stage: string;
  area: string;
  objective: string;
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
  activities: Activity[];
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

