import { loadTeams } from "@/lib/mock-data";
import { PlanCategory } from "@/lib/types";
import { MembersSection } from "@/components/ui/members-section";
import { EditableMetricsSection } from "@/components/ui/editable-metrics-section";
import { EditableTeamInfo } from "@/components/ui/editable-team-info";
import { EditableStages } from "@/components/ui/editable-stages";
import { EditableEcclesial } from "@/components/ui/editable-ecclesial";

const categories: PlanCategory[] = [
  "Investigación",
  "Encarnación",
  "Evangelización",
  "Entrenamiento",
  "Autocuidado"
];

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
        <h1 className="text-3xl font-semibold tracking-tight text-cocoa-900">
          No hay equipos configurados
        </h1>
        <p className="text-sm text-cocoa-600">
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

  // Agrupar actividades por categoría del plan activo
  // Nota: En el sistema actual, cada plan tiene una categoría y todas sus actividades
  // pertenecen a esa categoría. Mostramos todas las categorías pero solo la del plan activo tendrá actividades.

  return (
    <section className="space-y-8">
      <header className="space-y-3">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-500">
            Vista líder
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-cocoa-900">
            Dashboard de {team.name}
          </h1>
        </div>
        <p className="max-w-3xl text-sm leading-6 text-cocoa-600">
          Seguimiento rápido del plan activo, actividades y presupuesto disponible del equipo.
          Role view: líder.
        </p>
        <div className="flex flex-wrap gap-2 text-xs font-semibold text-brand-700">
          <span className="rounded-full border border-brand-200 bg-brand-50/70 px-3 py-1 text-brand-700">
            Líder: {team.leader}
          </span>
          <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-emerald-600">
            Presupuesto disponible:{" "}
            {(team.budgetAssigned - team.budgetLiquidated).toLocaleString("es-CO", {
              style: "currency",
              currency: "COP",
              maximumFractionDigits: 0
            })}
          </span>
        </div>
      </header>

      <div className="space-y-7">
        {/* Información del equipo */}
        <EditableTeamInfo
          ministryLocation={team.metrics?.ministryLocation || "No especificado"}
          leader={team.leader}
          membersCount={team.members.length}
        />

        {/* Métricas generales */}
        {team.metrics && (
          <EditableMetricsSection metrics={team.metrics} />
        )}

        {/* Plan activo */}
        {activePlan ? (
          <div className="card-elevated relative overflow-hidden">
            <span className="pointer-events-none absolute -right-12 top-1/2 hidden h-40 w-40 -translate-y-1/2 rounded-full bg-brand-200/40 blur-3xl lg:block" />
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-500">
                  Plan activo
                </p>
                <h2 className="text-2xl font-semibold text-cocoa-900">{activePlan.name}</h2>
                <p className="max-w-2xl text-sm leading-6 text-cocoa-600">{activePlan.summary}</p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-full border border-sand-200 bg-sand-50/70 px-3 py-1 text-cocoa-700">
                  Periodo: {activePlan.startDate} → {activePlan.endDate}
                </span>
                <span className="rounded-full border border-brand-200 bg-brand-50/80 px-3 py-1 text-brand-600">
                  Actividades: {activePlan.activities.length}
                </span>
                <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-emerald-600">
                  Completadas: {doneActivities?.length ?? 0}
                </span>
                <span className="rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-amber-600">
                  Pendientes: {pendingActivities?.length ?? 0}
                </span>
              </div>
            </div>
          </div>
        ) : null}

        {/* Próximas actividades y miembros */}
        {activePlan && (
          <div className="grid gap-5 xl:grid-cols-2">
            <div className="card-elevated">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-500">
                    Plan activo
                  </p>
                  <h3 className="text-lg font-semibold text-cocoa-900">Próximas actividades</h3>
                </div>
                <span className="rounded-full border border-brand-200 bg-brand-50/70 px-3 py-1 text-xs font-semibold text-brand-600">
                  {pendingActivities?.length ?? 0} pendientes
                </span>
              </div>
              <div className="mt-5 space-y-4">
                {pendingActivities?.map((activity) => (
                  <div
                    key={activity.id}
                    className="rounded-2xl border border-sand-200 bg-white/80 p-4 transition hover:border-brand-200 hover:bg-brand-50/70"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-base font-semibold text-cocoa-900">{activity.name}</p>
                        <p className="mt-1 text-xs font-semibold text-cocoa-500">
                          Responsable: {activity.responsable} · Área {activity.area}
                        </p>
                      </div>
                      <span className="inline-flex items-center justify-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">
                        {activity.frequency}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold text-cocoa-500">
                      <span className="rounded-full border border-sand-200 bg-sand-50/80 px-3 py-1">
                        {activity.startDate} → {activity.endDate}
                      </span>
                      <span className="rounded-full border border-brand-200 bg-white/80 px-3 py-1 text-brand-600">
                        Presupuesto restante:{" "}
                        {(activity.budgetTotal - activity.budgetLiquidated).toLocaleString("es-CO", {
                          style: "currency",
                          currency: "COP",
                          maximumFractionDigits: 0
                        })}
                      </span>
                    </div>
                  </div>
                ))}
                {pendingActivities?.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-sand-200 bg-white/70 p-6 text-center text-sm text-cocoa-500">
                    No hay actividades pendientes.
                  </p>
                ) : null}
              </div>
            </div>

            <div className="card-elevated">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-500">
                    Equipo
                  </p>
                  <h3 className="text-lg font-semibold text-cocoa-900">Miembros y áreas</h3>
                </div>
                <span className="rounded-full border border-sand-200 bg-sand-50/80 px-3 py-1 text-xs font-semibold text-cocoa-600">
                  {team.members.length} integrantes
                </span>
              </div>
              <MembersSection
                members={team.members}
                activities={activePlan.activities}
              />
            </div>
          </div>
        )}

        {/* Etapas de desarrollo */}
        {team.metrics && (
          <EditableStages metrics={team.metrics} />
        )}


        {/* Desarrollo eclesial */}
        {team.metrics && (
          <EditableEcclesial metrics={team.metrics} />
        )}

        {/* Presupuesto por categoría */}
        {activePlan && (
          <div className="card-elevated">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-cocoa-900">Presupuesto por categoría</h2>
              <div className="flex items-center gap-3">
                <span className="rounded-full border border-sand-200 bg-sand-50/80 px-3 py-1 text-xs font-semibold text-cocoa-600">
                  Plan activo
                </span>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-2xl border border-brand-200 bg-brand-50/70 px-3 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-100 hover:text-brand-800"
                >
                  <span>✏️</span>
                  <span>Editar presupuesto</span>
                </button>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => {
                // Calcular presupuesto por categoría
                const categoryBudget = activePlan.category === category
                  ? activePlan.activities.reduce((sum, act) => sum + act.budgetTotal, 0)
                  : 0;
                const categoryLiquidated = activePlan.category === category
                  ? activePlan.activities.reduce((sum, act) => sum + act.budgetLiquidated, 0)
                  : 0;

                return (
                  <div
                    key={category}
                    className="group relative rounded-2xl border border-sand-200 bg-white/80 p-4 transition hover:border-brand-200 hover:bg-brand-50/60"
                  >
                    <div className="absolute right-2 top-2 opacity-0 transition group-hover:opacity-100">
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-lg border border-brand-200 bg-white/90 p-1.5 text-xs text-brand-600 transition hover:bg-brand-50"
                        title={`Editar presupuesto de ${category}`}
                      >
                        ✏️
                      </button>
                    </div>
                    <h3 className="text-sm font-semibold text-cocoa-900 mb-3">{category}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-cocoa-500">Total asignado</span>
                        <span className="font-semibold text-cocoa-700">
                          {categoryBudget.toLocaleString("es-CO", {
                            style: "currency",
                            currency: "COP",
                            maximumFractionDigits: 0
                          })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-cocoa-500">Liquidado</span>
                        <span className="font-semibold text-emerald-600">
                          {categoryLiquidated.toLocaleString("es-CO", {
                            style: "currency",
                            currency: "COP",
                            maximumFractionDigits: 0
                          })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-cocoa-500">Restante</span>
                        <span className="font-semibold text-amber-600">
                          {(categoryBudget - categoryLiquidated).toLocaleString("es-CO", {
                            style: "currency",
                            currency: "COP",
                            maximumFractionDigits: 0
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tareas por categoría */}
        {activePlan && (
          <div className="card-elevated">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-cocoa-900">Tareas por categoría</h2>
              <span className="rounded-full border border-sand-200 bg-sand-50/80 px-3 py-1 text-xs font-semibold text-cocoa-600">
                Plan activo
              </span>
            </div>
            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => {
                const categoryActivities =
                  activePlan?.category === category ? activePlan.activities : [];

                const doneCount = categoryActivities.filter((a) => a.status === "Hecha").length;
                const pendingCount = categoryActivities.filter(
                  (a) => a.status === "Pendiente"
                ).length;

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
        )}
      </div>
    </section>
  );
}

