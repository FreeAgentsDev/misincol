import { notFound } from "next/navigation";
import { loadPlanById } from "@/lib/mock-data";
import { ActivityDetailView } from "./activity-detail-view";

interface Props {
  params: Promise<{ planId: string; activityId: string }>;
}

export default async function ActivityDetailPage({ params }: Props) {
  const { planId, activityId } = await params;
  const result = await loadPlanById(planId);

  if (!result) {
    notFound();
  }

  const { plan, team } = result;
  const activity = plan.activities.find((a) => a.id === activityId);

  if (!activity) {
    notFound();
  }

  return <ActivityDetailView plan={plan} team={team} activity={activity} />;
}

