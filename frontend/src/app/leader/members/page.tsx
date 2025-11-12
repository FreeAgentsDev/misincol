import { loadTeams } from "@/lib/mock-data";
import { MembersList } from "@/components/ui/members-list";

interface Props {
  searchParams?: Record<string, string | string[] | undefined>;
}

export default async function LeaderMembers({ searchParams }: Props) {
  const teams = await loadTeams();
  const teamId = typeof searchParams?.team === "string" ? searchParams.team : teams[0]?.id;
  const team = teams.find((entry) => entry.id === teamId) ?? teams[0];
  const activePlan = team?.plans.find((plan) => plan.status === "Activo");

  if (!team) {
    return (
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-cocoa-900">
          Equipo no encontrado
        </h1>
        <p className="text-sm text-cocoa-600">
          Verifica que el usuario tenga equipo asignado en los datos de ejemplo.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-7">
      <header className="space-y-3">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-500">
            Equipo
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-cocoa-900">
            Gestión de miembros · {team.name}
          </h1>
        </div>
        <p className="max-w-3xl text-sm leading-6 text-cocoa-600">
          Administra roles, miembros invitados y asignaciones por actividad. Esta vista simula el
          gestor completo, usando datos mock.
        </p>
      </header>

      <MembersList team={team} activePlan={activePlan} />
    </section>
  );
}

