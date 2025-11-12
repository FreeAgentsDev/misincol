import { loadTeams } from "@/lib/mock-data";
import { PlansListClient } from "./plans-list-client";

export default async function SuperAdminPlansList() {
  const teams = await loadTeams();

  const plans = teams.flatMap((team) =>
    team.plans.map((plan) => ({
      ...plan,
      teamName: team.name,
      teamId: team.id,
      teamLeader: team.leader
    }))
  );

  return <PlansListClient plans={plans} />;
}
