import { loadTeams } from "@/lib/mock-data";

export default async function SuperAdminPlans() {
  const teams = await loadTeams();

  const plans = teams.flatMap((team) =>
    team.plans.map((plan) => ({
      ...plan,
      teamName: team.name,
      teamId: team.id
    }))
  );

  return (
    <section className="space-y-8">
      <header className="space-y-3">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-500">
            Seguimiento
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-cocoa-900">
            Historial de planes de desarrollo
          </h1>
        </div>
        <p className="max-w-3xl text-sm leading-6 text-cocoa-600">
          Consulta los planes activos, finalizados y archivados para todos los equipos. Esta vista
          sirve como punto de partida para duplicar planes o analizar la evolución de cada equipo.
        </p>
      </header>

      <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-soft">
        <table className="min-w-full divide-y divide-sand-100 text-sm text-cocoa-700">
          <thead className="bg-sand-50/80 text-xs font-semibold uppercase tracking-wide text-cocoa-500">
            <tr>
              <th className="px-6 py-4 text-left">Plan</th>
              <th className="px-6 py-4 text-left">Equipo</th>
              <th className="px-6 py-4 text-left">Periodo</th>
              <th className="px-6 py-4 text-left">Estado</th>
              <th className="px-6 py-4 text-left">Actividades</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-100">
            {plans.map((plan) => (
              <tr key={plan.id} className="transition hover:bg-brand-50/40">
                <td className="px-6 py-4">
                  <div className="text-sm font-semibold text-cocoa-900">{plan.name}</div>
                  <p className="mt-1 text-xs text-cocoa-500">{plan.summary}</p>
                </td>
                <td className="px-6 py-4 text-cocoa-600">{plan.teamName}</td>
                <td className="px-6 py-4 text-cocoa-600">
                  {plan.startDate} → {plan.endDate}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center rounded-full border border-sand-200 bg-sand-50/80 px-3 py-1 text-xs font-semibold text-cocoa-600">
                    {plan.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-cocoa-600">{plan.activities.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

