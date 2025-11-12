import { notFound } from "next/navigation";
import { loadPlanById, loadTeams } from "@/lib/mock-data";
import { LeaderPlanDetailViewClient } from "./plan-detail-client";

interface Props {
  params: Promise<{ planId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function LeaderPlanDetailView({ params, searchParams }: Props) {
  const { planId } = await params;
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

  return <LeaderPlanDetailViewClient plan={plan} team={team} teamId={teamId} />;
}
