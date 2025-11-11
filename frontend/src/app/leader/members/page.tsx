import { loadTeams } from "@/lib/mock-data";

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
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Equipo no encontrado
        </h1>
        <p className="text-sm text-slate-500">
          Verifica que el usuario tenga equipo asignado en los datos de ejemplo.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Gestión de miembros · {team.name}
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-500">
          Administra roles, miembros invitados y asignaciones por actividad. Esta vista simula el
          gestor completo, usando datos mock.
        </p>
      </header>

      <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">Miembros actuales</h2>
        <div className="mt-4 space-y-4">
          {team.members.map((member) => {
            const assignments =
              activePlan?.activities.filter(
                (activity) => activity.responsable === member.name
              ) ?? [];
            return (
              <div
                key={member.name}
                className="rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/30"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-slate-900">{member.name}</p>
                    <p className="text-xs font-semibold text-slate-500">{member.role}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    Actividades: {assignments.length}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                  {assignments.map((activity) => (
                    <span
                      key={activity.id}
                      className="rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-slate-200"
                    >
                      {activity.name}
                    </span>
                  ))}
                  {assignments.length === 0 ? (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-500">
                      Sin actividades asignadas
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">Acciones simuladas</h2>
        <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 p-4">
            <span className="text-lg">➕</span> Invitar miembro (configurar usuario/contraseña)
          </div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <span className="text-lg">✏️</span> Editar rol o reasignar actividades pendientes
          </div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <span className="text-lg">🗑️</span> Desactivar miembro y transferir tareas
          </div>
        </div>
      </div>
    </section>
  );
}

