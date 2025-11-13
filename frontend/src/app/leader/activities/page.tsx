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
        <h1 className="text-3xl font-semibold tracking-tight text-cocoa-900">No hay plan activo</h1>
        <p className="text-sm text-cocoa-600">
          Selecciona un equipo con plan activo para ver y gestionar actividades.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-7">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-cocoa-900">
          Actividades
        </h1>
      </header>

      <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-soft">
        <table className="min-w-full divide-y divide-sand-100 text-sm text-cocoa-700">
          <thead className="bg-sand-50/80 text-xs font-semibold uppercase tracking-wide text-cocoa-500">
            <tr>
              <th className="px-6 py-4 text-left">Actividad</th>
              <th className="px-6 py-4 text-left">Responsable</th>
              <th className="px-6 py-4 text-left">Área</th>
              <th className="px-6 py-4 text-left">Estado</th>
              <th className="px-6 py-4 text-left">Presupuesto</th>
              <th className="px-6 py-4 text-left">Planificación</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-100 bg-white/60">
            {activities.map((activity) => (
              <tr key={activity.id} className="transition hover:bg-brand-50/40">
                <td className="px-6 py-4">
                  <div className="text-sm font-semibold text-cocoa-900">{activity.name}</div>
                  <p className="mt-1 text-xs text-cocoa-500">{activity.objective}</p>
                </td>
                <td className="px-6 py-4 text-cocoa-600">{activity.responsable}</td>
                <td className="px-6 py-4 text-cocoa-600">{activity.area}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
                      activity.status === "Hecha"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-amber-200 bg-amber-50 text-amber-700"
                    }`}
                  >
                    {activity.status}
                  </span>
                  <div className="mt-1 text-xs font-semibold text-cocoa-500">{activity.stage}</div>
                </td>
                <td className="px-6 py-4 text-cocoa-600">
                  <div className="text-xs font-semibold text-cocoa-600">
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
                <td className="px-6 py-4 text-cocoa-600">
                  <div className="text-xs font-semibold text-cocoa-700">{activity.startDate}</div>
                  <div className="text-xs text-cocoa-500">{activity.endDate}</div>
                  <div className="mt-1 text-xs text-cocoa-500">
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

