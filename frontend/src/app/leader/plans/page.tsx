import Link from "next/link";
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
        <h1 className="text-3xl font-semibold tracking-tight text-cocoa-900">
          Sin información de equipo
        </h1>
        <p className="text-sm text-cocoa-600">
          Revisa que el usuario tenga asociado un equipo en los datos de ejemplo.
        </p>
      </section>
    );
  }

  const pastPlans = team.plans.filter((plan) => plan.status !== "Activo");

  return (
    <section className="space-y-7">
      <header className="space-y-3">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-500">
            Aprendizajes
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-cocoa-900">
            Historial de planes · {team.name}
          </h1>
        </div>
        <p className="max-w-3xl text-sm leading-6 text-cocoa-600">
          Revisa resultados, aprendizajes y fechas para planear próximos ciclos.
        </p>
      </header>

      <div className="space-y-4">
        {pastPlans.map((plan) => (
          <div
            key={plan.id}
            className="card-elevated transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-200/40"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-cocoa-900">{plan.name}</h2>
                <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">
                  {plan.startDate} → {plan.endDate}
                </p>
              </div>
              <span className="inline-flex items-center rounded-full border border-sand-200 bg-sand-50/80 px-3 py-1 text-xs font-semibold text-cocoa-600">
                {plan.status}
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-cocoa-600">{plan.summary}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50/70 px-3 py-1 text-xs font-semibold text-brand-600">
                <span>Actividades ejecutadas:</span> {plan.activities.length}
              </p>
              <Link
                href={`/leader/plans/${plan.id}?team=${teamId}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 transition hover:text-brand-500"
              >
                <span>Ver vista general</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        ))}
        {pastPlans.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-sand-200 bg-white/70 p-6 text-center text-sm text-cocoa-500">
            No se han finalizado planes todavía.
          </p>
        ) : null}
      </div>
    </section>
  );
}

