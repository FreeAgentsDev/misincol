import { loadTeams } from "@/lib/mock-data";
import { LeaderPlansListClient } from "./plans-list-client";

interface Props {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function LeaderPlansList({ searchParams }: Props) {
  const teams = await loadTeams();
  const searchParamsResolved = await searchParams;
  const teamId = typeof searchParamsResolved?.team === "string" ? searchParamsResolved.team : teams[0]?.id;
  const team = teams.find((entry) => entry.id === teamId) ?? teams[0];

  if (!team) {
    return (
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-cocoa-900">
          Sin información de equipo
        </h1>
        <p className="text-sm text-cocoa-600">
          Revisa que el usuario tenga asociado un equipo en los datos de ejemplo.
        </p>
      </section>
    );
  }

  const plans = team.plans;

  return <LeaderPlansListClient plans={plans} team={team} teamId={teamId} />;
}
