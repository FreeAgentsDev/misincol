import { notFound } from "next/navigation";
import { loadTeamById } from "@/lib/mock-data";
import { MemberDetailView } from "./member-detail-view";

interface Props {
  params: Promise<{ teamId: string; memberName: string }>;
}

export default async function MemberDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const { teamId, memberName } = resolvedParams;
  const decodedMemberName = decodeURIComponent(memberName);
  const team = await loadTeamById(teamId);

  if (!team) {
    notFound();
  }

  const member = team.members.find((m) => m.name === decodedMemberName);

  if (!member) {
    notFound();
  }

  const activePlan = team.plans.find((plan) => plan.status === "Activo");
  const memberActivities = activePlan
    ? activePlan.activities.filter((activity) => activity.responsable === member.name)
    : [];

  return (
    <MemberDetailView
      member={member}
      team={team}
      activities={memberActivities}
      activePlan={activePlan}
    />
  );
}

