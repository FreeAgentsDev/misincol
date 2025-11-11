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
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Historial de planes de desarrollo
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-500">
          Consulta los planes activos, finalizados y archivados para todos los equipos.
          Esta vista sirve como punto de partida para duplicar planes o analizar la
          evolución de cada equipo.
        </p>
      </header>

      <div className="overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-6 py-3 text-left">Plan</th>
              <th className="px-6 py-3 text-left">Equipo</th>
              <th className="px-6 py-3 text-left">Periodo</th>
              <th className="px-6 py-3 text-left">Estado</th>
              <th className="px-6 py-3 text-left">Actividades</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {plans.map((plan) => (
              <tr key={plan.id} className="transition hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-semibold text-slate-900">{plan.name}</div>
                  <p className="mt-1 text-xs text-slate-500">{plan.summary}</p>
                </td>
                <td className="px-6 py-4 text-slate-600">{plan.teamName}</td>
                <td className="px-6 py-4 text-slate-600">
                  {plan.startDate} → {plan.endDate}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {plan.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">{plan.activities.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

