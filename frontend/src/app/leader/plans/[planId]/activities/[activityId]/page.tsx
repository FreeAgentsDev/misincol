import { notFound } from "next/navigation";
import { loadPlanById, loadTeams } from "@/lib/mock-data";
import { LeaderActivityDetailView } from "./activity-detail-view";

interface Props {
  params: Promise<{ planId: string; activityId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function LeaderActivityDetailPage({ params, searchParams }: Props) {
  const { planId, activityId } = await params;
  const searchParamsResolved = await searchParams;
  const result = await loadPlanById(planId);
  const teams = await loadTeams();
  const teamId = typeof searchParamsResolved?.team === "string" ? searchParamsResolved.team : teams[0]?.id;

  if (!result) {
    notFound();
  }

  const { plan, team } = result;

  // Verificar que el plan pertenece al equipo del usuario
  if (team.id !== teamId) {
    notFound();
  }

  const activity = plan.activities.find((a) => a.id === activityId);

  if (!activity) {
    notFound();
  }

  return <LeaderActivityDetailView plan={plan} team={team} activity={activity} teamId={teamId} />;
}

