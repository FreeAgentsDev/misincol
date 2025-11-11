import { loadTeams } from "@/lib/mock-data";

interface Props {
  searchParams?: Record<string, string | string[] | undefined>;
}

export default async function LeaderPlans({ searchParams }: Props) {
  const teams = await loadTeams();
  const teamId = typeof searchParams?.team === "string" ? searchParams.team : teams[0]?.id;
  const team = teams.find((entry) => entry.id === teamId) ?? teams[0];

  if (!team) {
    return (
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Sin información de equipo
        </h1>
        <p className="text-sm text-slate-500">
          Revisa que el usuario tenga asociado un equipo en los datos de ejemplo.
        </p>
      </section>
    );
  }

  const pastPlans = team.plans.filter((plan) => plan.status !== "Activo");

  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Historial de planes · {team.name}
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-500">
          Revisa resultados, aprendizajes y fechas para planear próximos ciclos.
        </p>
      </header>

      <div className="space-y-4">
        {pastPlans.map((plan) => (
          <div
            key={plan.id}
            className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-2xl"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{plan.name}</h2>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {plan.startDate} → {plan.endDate}
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {plan.status}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-500">{plan.summary}</p>
            <p className="mt-2 text-xs font-semibold text-slate-500">
              Actividades ejecutadas: {plan.activities.length}
            </p>
          </div>
        ))}
        {pastPlans.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
            No se han finalizado planes todavía.
          </p>
        ) : null}
      </div>
    </section>
  );
}

