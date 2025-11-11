import Link from "next/link";
import { loadDashboardMetrics } from "@/lib/mock-data";

export default async function SuperAdminDashboard() {
  const metrics = await loadDashboardMetrics();

  const totals = metrics.reduce(
    (acc, item) => {
      acc.teams += 1;
      acc.done += item.doneActivities;
      acc.pending += item.pendingActivities;
      acc.liquidated += item.budgetLiquidated;
      acc.pendingBudget += item.budgetPending;
      return acc;
    },
    { teams: 0, done: 0, pending: 0, liquidated: 0, pendingBudget: 0 }
  );

  return (
    <section className="space-y-10">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Dashboard global
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-500">
          Estado consolidado de los equipos y sus planes de desarrollo. Información
          generada a partir de los datos demo contenidos en <code>mock-data.csv</code>.
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-slate-200">
          <p className="text-sm font-semibold text-slate-500">Equipos activos</p>
          <p className="mt-4 text-3xl font-bold text-slate-900">{totals.teams}</p>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-slate-200">
          <p className="text-sm font-semibold text-slate-500">Actividades completas</p>
          <p className="mt-4 text-3xl font-bold text-slate-900">{totals.done}</p>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-slate-200">
          <p className="text-sm font-semibold text-slate-500">Actividades pendientes</p>
          <p className="mt-4 text-3xl font-bold text-amber-500">{totals.pending}</p>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-slate-200">
          <p className="text-sm font-semibold text-slate-500">Presupuesto liquidado</p>
          <p className="mt-4 text-2xl font-bold text-emerald-500">
            {totals.liquidated.toLocaleString("es-CO", {
              style: "currency",
              currency: "COP",
              maximumFractionDigits: 0
            })}
          </p>
          <p className="mt-2 text-xs font-semibold text-slate-500">
            Restante por liquidar:{" "}
            {totals.pendingBudget.toLocaleString("es-CO", {
              style: "currency",
              currency: "COP",
              maximumFractionDigits: 0
            })}
          </p>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Equipos y planes</h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
            {metrics.length} equipos
          </span>
        </div>
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3 text-left">Equipo</th>
                <th className="px-6 py-3 text-left">Líder</th>
                <th className="px-6 py-3 text-left">Plan activo</th>
                <th className="px-6 py-3 text-left">Actividades</th>
                <th className="px-6 py-3 text-left">Presupuesto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {metrics.map((item) => (
                <tr key={item.teamId} className="transition hover:bg-slate-50">
                  <td className="px-6 py-4 align-top">
                    <div className="font-semibold text-slate-900">{item.teamName}</div>
                    <div className="mt-1 text-xs font-medium text-slate-500">
                      Planes completados: {item.completedPlans}
                    </div>
                    <Link
                      href={`/superadmin/teams/${item.teamId}`}
                      className="mt-3 inline-flex items-center text-xs font-semibold text-blue-600 transition hover:text-blue-700"
                    >
                      Ver detalle →
                    </Link>
                  </td>
                  <td className="px-6 py-4 align-top text-slate-600">{item.leader}</td>
                  <td className="px-6 py-4 align-top text-slate-600">
                    {item.activePlan ? (
                      <div className="space-y-1">
                        <span className="block text-sm font-semibold text-slate-900">
                          {item.activePlan.name}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
                          {item.activePlan.category}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-slate-400">
                        Sin plan activo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 align-top text-slate-600">
                    <div className="flex flex-col gap-1 text-xs font-semibold">
                      <span className="inline-flex items-center gap-2 text-emerald-500">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        {item.doneActivities} completadas
                      </span>
                      <span className="inline-flex items-center gap-2 text-amber-500">
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                        {item.pendingActivities} pendientes
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top text-slate-600">
                    <div className="text-xs font-semibold text-emerald-600">
                      Liquidado:{" "}
                      {item.budgetLiquidated.toLocaleString("es-CO", {
                        style: "currency",
                        currency: "COP",
                        maximumFractionDigits: 0
                      })}
                    </div>
                    <div className="mt-1 text-xs font-semibold text-amber-600">
                      Por liquidar:{" "}
                      {item.budgetPending.toLocaleString("es-CO", {
                        style: "currency",
                        currency: "COP",
                        maximumFractionDigits: 0
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

