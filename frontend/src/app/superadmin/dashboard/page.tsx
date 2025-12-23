import Link from "next/link";
import { getDashboardMetrics } from "@/lib/supabase-queries";
import { getPlanCompleto } from "@/lib/supabase-queries";
import type { DashboardTeamMetrics, DevelopmentPlan } from "@/lib/types";

// Función para mapear datos de Supabase a DashboardTeamMetrics
async function mapSupabaseMetricsToDashboard(
  supabaseMetrics: any[]
): Promise<DashboardTeamMetrics[]> {
  return Promise.all(
    supabaseMetrics.map(async (item) => {
      let activePlan: DevelopmentPlan | undefined = undefined;

      // Si hay un plan activo, obtener sus detalles completos
      if (item.id_plan_activo) {
        const planData = await getPlanCompleto(item.id_plan_activo);
        if (planData) {
          activePlan = {
            id: planData.id,
            teamId: planData.id_equipo,
            name: planData.nombre,
            category: planData.categoria as DevelopmentPlan["category"],
            status: planData.estado as DevelopmentPlan["status"],
            startDate: planData.fecha_inicio || "",
            endDate: planData.fecha_fin || "",
            summary: planData.resumen || "",
            activities: (planData.actividades || []).map((a: any) => ({
              id: a.id,
              teamId: a.id_equipo,
              planId: a.id_plan,
              name: a.nombre,
              responsable: a.responsable || "",
              budgetTotal: Number(a.presupuesto_total || 0),
              budgetLiquidated: Number(a.presupuesto_liquidado || 0),
              status: a.estado as "Hecha" | "Pendiente",
              stage: a.etapa || "",
              area: a.area || "",
              objective: a.objetivo || "",
              description: a.descripcion || "",
              currentSituation: a.situacion_actual || "",
              goalMid: a.objetivo_mediano || "",
              goalLong: a.objetivo_largo || "",
              frequency: a.frecuencia || "",
              timesPerYear: Number(a.veces_por_ano || 0),
              startDate: a.fecha_inicio || "",
              endDate: a.fecha_fin || "",
              totalWeeks: Number(a.semanas_totales || 0),
              remainingWeeks: Number(a.semanas_restantes || 0),
              obstacles: a.obstaculos || "",
            })),
          };
        }
      }

      return {
        teamId: item.id_equipo,
        teamName: item.nombre_equipo,
        leader: item.lider || "Sin líder",
        activePlan,
        completedPlans: Number(item.planes_completados_count || 0),
        pendingActivities: Number(item.actividades_pendientes_count || 0),
        doneActivities: Number(item.actividades_completadas_count || 0),
        budgetLiquidated: Number(item.presupuesto_liquidado || 0),
        budgetPending: Number(item.presupuesto_pendiente || 0),
        budgetAssigned: Number(item.presupuesto_asignado || 0),
      };
    })
  );
}

export default async function SuperAdminDashboard() {
  try {
    const supabaseMetrics = await getDashboardMetrics();
    
    if (!supabaseMetrics || supabaseMetrics.length === 0) {
      return (
        <section className="space-y-9">
          <header className="space-y-3">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-500">
                Vista superadmin
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-cocoa-900">
                Gestión de equipos
              </h1>
              <p className="text-lg font-medium text-cocoa-600">
                Dashboard global
              </p>
            </div>
          </header>
          <div className="card-elevated">
            <p className="text-cocoa-600">
              No hay equipos configurados aún. Crea tu primer equipo para comenzar.
            </p>
          </div>
        </section>
      );
    }

    const metrics = await mapSupabaseMetricsToDashboard(supabaseMetrics);

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
    <section className="space-y-9">
      <header className="space-y-3">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-500">
            Vista superadmin
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-cocoa-900">
            Gestión de equipos
          </h1>
          <p className="text-lg font-medium text-cocoa-600">
            Dashboard global
          </p>
        </div>
        <p className="max-w-3xl text-sm leading-6 text-cocoa-600">
          Estado consolidado de los equipos y sus planes de desarrollo. Datos en tiempo real desde Supabase.
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
    </section>
  );
  } catch (error) {
    console.error("Error al cargar métricas:", error);
    return (
      <section className="space-y-9">
        <header className="space-y-3">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-500">
              Vista superadmin
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-cocoa-900">
              Gestión de equipos
            </h1>
            <p className="text-lg font-medium text-cocoa-600">
              Dashboard global
            </p>
          </div>
        </header>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-800 font-semibold">
            Error al cargar los datos
          </p>
          <p className="text-red-600 text-sm mt-2">
            Por favor, verifica tu conexión e intenta nuevamente. Si el problema persiste, contacta al administrador.
          </p>
        </div>
      </section>
    );
  }
}

