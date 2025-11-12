import { notFound } from "next/navigation";
import { loadPlanById } from "@/lib/mock-data";
import { PlanDetailViewClient } from "./plan-detail-client";

interface Props {
  params: Promise<{ planId: string }>;
}

export default async function PlanDetailView({ params }: Props) {
  const { planId } = await params;
  const result = await loadPlanById(planId);

  if (!result) {
    notFound();
  }

  const { plan, team } = result;

  return <PlanDetailViewClient plan={plan} team={team} />;
}
