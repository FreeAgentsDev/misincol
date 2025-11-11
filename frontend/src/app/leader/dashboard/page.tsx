import { loadTeams } from "@/lib/mock-data";

interface Props {
  searchParams?: Record<string, string | string[] | undefined>;
}

export default async function LeaderDashboard({ searchParams }: Props) {
  const teams = await loadTeams();
  const teamId = typeof searchParams?.team === "string" ? searchParams.team : teams[0]?.id;
  const team = teams.find((entry) => entry.id === teamId) ?? teams[0];

  const activePlan = team?.plans.find((plan) => plan.status === "Activo");

  if (!team) {
    return (
      <section className="space-y-6">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          No hay equipos configurados
        </h1>
        <p className="text-sm text-slate-500">
          Aún no se ha vinculado un equipo a este usuario en los datos de ejemplo.
        </p>
      </section>
    );
  }

  const pendingActivities = activePlan?.activities.filter(
    (activity) => activity.status === "Pendiente"
  );
  const doneActivities = activePlan?.activities.filter(
    (activity) => activity.status === "Hecha"
  );

  return (
    <section className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Dashboard de {team.name}
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-500">
          Seguimiento rápido del plan activo, actividades y presupuesto disponible del equipo.
          Role view: líder.
        </p>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-600">
            Líder: {team.leader}
          </span>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-600">
            Presupuesto disponible:{" "}
            {(team.budgetAssigned - team.budgetLiquidated).toLocaleString("es-CO", {
              style: "currency",
              currency: "COP",
              maximumFractionDigits: 0
            })}
          </span>
        </div>
      </header>

      {activePlan ? (
        <div className="space-y-8">
          <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-slate-200">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">
                  Plan activo: {activePlan.name}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  {activePlan.summary}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                  Periodo: {activePlan.startDate} → {activePlan.endDate}
                </span>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-600">
                  Actividades: {activePlan.activities.length}
                </span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-600">
                  Completadas: {doneActivities?.length ?? 0}
                </span>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-600">
                  Pendientes: {pendingActivities?.length ?? 0}
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Próximas actividades</h3>
              <div className="mt-4 space-y-4">
                {pendingActivities?.map((activity) => (
                  <div
                    key={activity.id}
                    className="rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/30"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold text-slate-900">
                          {activity.name}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          Responsable: {activity.responsable} · Área {activity.area}
                        </p>
                      </div>
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                        {activity.frequency}
                      </span>
                    </div>
                    <div className="mt-3 text-xs font-semibold text-slate-500">
                      {activity.startDate} → {activity.endDate}
                    </div>
                    <p className="mt-3 text-sm text-slate-500">
                      Presupuesto restante:{" "}
                      {(activity.budgetTotal - activity.budgetLiquidated).toLocaleString(
                        "es-CO",
                        {
                          style: "currency",
                          currency: "COP",
                          maximumFractionDigits: 0
                        }
                      )}
                    </p>
                  </div>
                ))}
                {pendingActivities?.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                    No hay actividades pendientes.
                  </p>
                ) : null}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Miembros y áreas</h3>
              <div className="mt-4 space-y-4">
                {team.members.map((member) => {
                  const assignments =
                    activePlan.activities.filter(
                      (activity) => activity.responsable === member.name
                    ) ?? [];
                  return (
                    <div
                      key={member.name}
                      className="rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/30"
                    >
                      <p className="text-base font-semibold text-slate-900">{member.name}</p>
                      <p className="text-xs font-semibold text-slate-500">{member.role}</p>
                      <p className="mt-2 text-xs font-semibold text-slate-500">
                        Actividades asignadas: {assignments.length}
                      </p>
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
          </div>
        </div>
      ) : (
        <div className="rounded-3xl bg-white p-6 text-sm text-slate-500 shadow-card ring-1 ring-slate-200">
          <p className="font-semibold text-slate-900">Sin plan activo</p>
          <p className="mt-2">
            Aún no hay un plan activo asignado para este equipo en los datos de ejemplo.
          </p>
        </div>
      )}
    </section>
  );
}

