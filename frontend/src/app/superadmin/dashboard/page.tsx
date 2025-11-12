import Link from "next/link";
import { loadDashboardMetrics, loadTeams } from "@/lib/mock-data";
import { PlanCategory, Activity } from "@/lib/types";

const categories: PlanCategory[] = [
  "Investigación",
  "Encarnación",
  "Evangelización",
  "Entrenamiento",
  "Autocuidado"
];

export default async function SuperAdminDashboard() {
  const metrics = await loadDashboardMetrics();
  const teams = await loadTeams();

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

  // Agrupar actividades por categoría de todos los planes activos
  const activitiesByCategory: Record<PlanCategory, Activity[]> = {
    Investigación: [],
    Encarnación: [],
    Evangelización: [],
    Entrenamiento: [],
    Autocuidado: []
  };

  teams.forEach((team) => {
    const activePlan = team.plans.find((plan) => plan.status === "Activo");
    if (activePlan) {
      activePlan.activities.forEach((activity) => {
        activitiesByCategory[activePlan.category].push(activity);
      });
    }
  });

  // Eliminar duplicados si hay actividades repetidas
  categories.forEach((category) => {
    const seen = new Set<string>();
    activitiesByCategory[category] = activitiesByCategory[category].filter((activity) => {
      if (seen.has(activity.id)) {
        return false;
      }
      seen.add(activity.id);
      return true;
    });
  });

  return (
    <section className="space-y-9">
      <header className="space-y-3">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-500">
            Vista superadmin
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-cocoa-900">
            Dashboard global
          </h1>
        </div>
        <p className="max-w-3xl text-sm leading-6 text-cocoa-600">
          Estado consolidado de los equipos y sus planes de desarrollo. Información generada a
          partir de los datos demo contenidos en <code>mock-data.csv</code>.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card-elevated">
          <p className="text-sm font-semibold text-cocoa-500">Equipos activos</p>
          <p className="mt-4 text-3xl font-bold text-cocoa-900">{totals.teams}</p>
        </div>
        <div className="card-elevated">
          <p className="text-sm font-semibold text-cocoa-500">Actividades completas</p>
          <p className="mt-4 text-3xl font-bold text-brand-600">{totals.done}</p>
        </div>
        <div className="card-elevated">
          <p className="text-sm font-semibold text-cocoa-500">Actividades pendientes</p>
          <p className="mt-4 text-3xl font-bold text-amber-600">{totals.pending}</p>
        </div>
        <div className="card-elevated">
          <p className="text-sm font-semibold text-cocoa-500">Presupuesto liquidado</p>
          <p className="mt-4 text-2xl font-bold text-emerald-600">
            {totals.liquidated.toLocaleString("es-CO", {
              style: "currency",
              currency: "COP",
              maximumFractionDigits: 0
            })}
          </p>
          <p className="mt-2 text-xs font-semibold text-cocoa-500">
            Restante por liquidar:{" "}
            {totals.pendingBudget.toLocaleString("es-CO", {
              style: "currency",
              currency: "COP",
              maximumFractionDigits: 0
            })}
          </p>
        </div>
      </div>

      <div className="card-elevated">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-cocoa-900">Equipos y planes</h2>
          <span className="rounded-full border border-sand-200 bg-sand-50/80 px-3 py-1 text-xs font-semibold text-cocoa-600">
            {metrics.length} equipos
          </span>
        </div>
        <div className="mt-6 overflow-hidden rounded-2xl border border-sand-200 bg-white/80">
          <table className="min-w-full divide-y divide-sand-100 text-sm text-cocoa-700">
            <thead className="bg-sand-50/80 text-xs font-semibold uppercase tracking-wide text-cocoa-500">
              <tr>
                <th className="px-6 py-3 text-left">Equipo</th>
                <th className="px-6 py-3 text-left">Líder</th>
                <th className="px-6 py-3 text-left">Plan activo</th>
                <th className="px-6 py-3 text-left">Actividades</th>
                <th className="px-6 py-3 text-left">Presupuesto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-100">
              {metrics.map((item) => (
                <tr key={item.teamId} className="transition hover:bg-brand-50/40">
                  <td className="px-6 py-4 align-top">
                    <div className="font-semibold text-cocoa-900">{item.teamName}</div>
                    <div className="mt-1 text-xs font-medium text-cocoa-500">
                      Planes completados: {item.completedPlans}
                    </div>
                    <Link
                      href={`/superadmin/teams/${item.teamId}`}
                      className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 transition hover:text-brand-500"
                    >
                      <span>Ver detalle</span>
                      <span>→</span>
                    </Link>
                  </td>
                  <td className="px-6 py-4 align-top text-cocoa-600">{item.leader}</td>
                  <td className="px-6 py-4 align-top text-cocoa-600">
                    {item.activePlan ? (
                      <div className="space-y-1">
                        <Link
                          href={`/superadmin/plans/${item.activePlan.id}`}
                          className="block text-sm font-semibold text-cocoa-900 transition hover:text-brand-600"
                        >
                          {item.activePlan.name}
                        </Link>
                        <span className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50/70 px-2.5 py-1 text-xs font-semibold text-brand-600">
                          {item.activePlan.category}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-cocoa-400">Sin plan activo</span>
                    )}
                  </td>
                  <td className="px-6 py-4 align-top text-cocoa-600">
                    <div className="flex flex-col gap-1 text-xs font-semibold">
                      <span className="inline-flex items-center gap-2 text-emerald-600">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                        {item.doneActivities} completadas
                      </span>
                      <span className="inline-flex items-center gap-2 text-amber-600">
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                        {item.pendingActivities} pendientes
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top text-cocoa-600">
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

      <div className="card-elevated">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-cocoa-900">Tareas por categoría</h2>
          <Link
            href="/superadmin/plans?status=Activo"
            className="rounded-full border border-sand-200 bg-sand-50/80 px-3 py-1 text-xs font-semibold text-cocoa-600 transition hover:border-brand-200 hover:bg-brand-50/70 hover:text-brand-600"
          >
            Planes activos
          </Link>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const categoryActivities = activitiesByCategory[category];
            const doneCount = categoryActivities.filter((a) => a.status === "Hecha").length;
            const pendingCount = categoryActivities.filter((a) => a.status === "Pendiente").length;

            return (
              <div
                key={category}
                className="rounded-2xl border border-sand-200 bg-white/80 p-5 transition hover:border-brand-200 hover:bg-brand-50/60"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-cocoa-900">{category}</h3>
                  <span className="rounded-full border border-brand-200 bg-brand-50/70 px-3 py-1 text-xs font-semibold text-brand-600">
                    {categoryActivities.length} tareas
                  </span>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="inline-flex items-center gap-2 text-emerald-600">
                      <span className="h-2 w-2 rounded-full bg-emerald-500/80" />
                      {doneCount} completadas
                    </span>
                    <span className="inline-flex items-center gap-2 text-amber-600">
                      <span className="h-2 w-2 rounded-full bg-amber-500/80" />
                      {pendingCount} pendientes
                    </span>
                  </div>
                  {categoryActivities.length > 0 ? (
                    <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                      {categoryActivities.map((activity) => (
                        <div
                          key={activity.id}
                          className="rounded-xl border border-sand-200 bg-white/90 p-3 text-xs"
                        >
                          <p className="font-semibold text-cocoa-900">{activity.name}</p>
                          <p className="mt-1 text-cocoa-500">
                            {activity.responsable} · {activity.area}
                          </p>
                          <span
                            className={`mt-2 inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${
                              activity.status === "Hecha"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-amber-200 bg-amber-50 text-amber-700"
                            }`}
                          >
                            {activity.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 rounded-xl border border-dashed border-sand-200 bg-white/70 p-3 text-center text-xs text-cocoa-500">
                      Sin tareas en esta categoría
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

