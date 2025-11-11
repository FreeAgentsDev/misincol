import { loadTeams } from "@/lib/mock-data";

interface Props {
  searchParams?: Record<string, string | string[] | undefined>;
}

export default async function LeaderActivities({ searchParams }: Props) {
  const teams = await loadTeams();
  const teamId = typeof searchParams?.team === "string" ? searchParams.team : teams[0]?.id;
  const team = teams.find((entry) => entry.id === teamId) ?? teams[0];
  const activePlan = team?.plans.find((plan) => plan.status === "Activo");
  const activities = activePlan?.activities ?? [];

  if (!team || !activePlan) {
    return (
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">No hay plan activo</h1>
        <p className="text-sm text-slate-500">
          Selecciona un equipo con plan activo para ver y gestionar actividades.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Actividades · {activePlan.name}
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-500">
          Gestión completa de tareas, presupuesto y seguimiento por áreas. Información tomada del
          plan activo.
        </p>
      </header>

      <div className="overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-6 py-3 text-left">Actividad</th>
              <th className="px-6 py-3 text-left">Responsable</th>
              <th className="px-6 py-3 text-left">Área</th>
              <th className="px-6 py-3 text-left">Estado</th>
              <th className="px-6 py-3 text-left">Presupuesto</th>
              <th className="px-6 py-3 text-left">Planificación</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {activities.map((activity) => (
              <tr key={activity.id} className="transition hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-semibold text-slate-900">{activity.name}</div>
                  <p className="mt-1 text-xs text-slate-500">{activity.objective}</p>
                </td>
                <td className="px-6 py-4 text-slate-600">{activity.responsable}</td>
                <td className="px-6 py-4 text-slate-600">{activity.area}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                      activity.status === "Hecha"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {activity.status}
                  </span>
                  <div className="mt-1 text-xs font-semibold text-slate-500">
                    {activity.stage}
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600">
                  <div className="text-xs font-semibold text-slate-600">
                    Total:{" "}
                    {activity.budgetTotal.toLocaleString("es-CO", {
                      style: "currency",
                      currency: "COP",
                      maximumFractionDigits: 0
                    })}
                  </div>
                  <div className="text-xs font-semibold text-emerald-600">
                    Liquidado:{" "}
                    {activity.budgetLiquidated.toLocaleString("es-CO", {
                      style: "currency",
                      currency: "COP",
                      maximumFractionDigits: 0
                    })}
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600">
                  <div className="text-xs font-semibold">{activity.startDate}</div>
                  <div className="text-xs text-slate-500">{activity.endDate}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    Frecuencia: {activity.frequency} · {activity.timesPerYear} veces/año
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

