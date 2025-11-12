import { Team, PlanCategory } from "@/lib/types";
import { MembersSection } from "./members-section";

const categories: PlanCategory[] = [
  "Investigación",
  "Encarnación",
  "Evangelización",
  "Entrenamiento",
  "Autocuidado"
];

interface TeamDashboardViewProps {
  team: Team;
}

export function TeamDashboardView({ team }: TeamDashboardViewProps) {
  const activePlan = team.plans.find((plan) => plan.status === "Activo");
  const pendingActivities = activePlan?.activities.filter(
    (activity) => activity.status === "Pendiente"
  );
  const doneActivities = activePlan?.activities.filter(
    (activity) => activity.status === "Hecha"
  );

  return (
    <div className="space-y-7">
      {/* Información del equipo */}
      <div className="card-elevated">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-cocoa-900">Información del equipo</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-sand-200 bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">
              Lugar de ministerio
            </p>
            <p className="mt-2 text-sm font-semibold text-cocoa-900">
              {team.metrics?.ministryLocation || "No especificado"}
            </p>
          </div>
          <div className="rounded-2xl border border-sand-200 bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">
              Líder de equipo
            </p>
            <p className="mt-2 text-sm font-semibold text-cocoa-900">{team.leader}</p>
          </div>
          <div className="rounded-2xl border border-sand-200 bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">
              Integrantes
            </p>
            <p className="mt-2 text-sm font-semibold text-cocoa-900">{team.members.length} miembros</p>
          </div>
        </div>
      </div>

      {/* Métricas generales */}
      {team.metrics && (
        <div className="card-elevated">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-cocoa-900">Métricas generales</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-sand-200 bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">
                Población
              </p>
              <p className="mt-2 text-2xl font-bold text-brand-600">
                {team.metrics.population?.toLocaleString("es-CO") || "0"}
              </p>
            </div>
            <div className="rounded-2xl border border-sand-200 bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">
                Congregaciones evangélicas
              </p>
              <p className="mt-2 text-2xl font-bold text-brand-600">
                {team.metrics.evangelicalCongregations || 0}
              </p>
            </div>
            <div className="rounded-2xl border border-sand-200 bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">
                Evangélicos
              </p>
              <p className="mt-2 text-2xl font-bold text-brand-600">
                {team.metrics.evangelicals?.toLocaleString("es-CO") || "0"}
              </p>
            </div>
          </div>
        </div>
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
        <div className="card-elevated">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-cocoa-900">Etapas de desarrollo</h2>
          </div>
          <div className="space-y-6">
            {/* Contacto */}
            <div className="rounded-2xl border border-sand-200 bg-white/80 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-cocoa-900">Contacto</h3>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-sand-200 bg-white/90 p-3">
                  <p className="text-xs font-semibold text-cocoa-500">
                    Personas contactadas por primera vez
                  </p>
                  <p className="mt-1 text-lg font-bold text-brand-600">
                    {team.metrics.firstTimeContacts || 0}
                  </p>
                </div>
                <div className="rounded-xl border border-sand-200 bg-white/90 p-3">
                  <p className="text-xs font-semibold text-cocoa-500">
                    Interesadas en el evangelio
                  </p>
                  <p className="mt-1 text-lg font-bold text-brand-600">
                    {team.metrics.interestedInGospel || 0}
                  </p>
                </div>
                <div className="rounded-xl border border-sand-200 bg-white/90 p-3">
                  <p className="text-xs font-semibold text-cocoa-500">
                    Escucharon algo del Evangelio
                  </p>
                  <p className="mt-1 text-lg font-bold text-brand-600">
                    {team.metrics.heardGospel || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Comunicando */}
            <div className="rounded-2xl border border-sand-200 bg-white/80 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-cocoa-900">Comunicando</h3>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-sand-200 bg-white/90 p-3">
                  <p className="text-xs font-semibold text-cocoa-500">
                    Creen que están buscando a Dios
                  </p>
                  <p className="mt-1 text-lg font-bold text-brand-600">
                    {team.metrics.seekingGod || 0}
                  </p>
                </div>
                <div className="rounded-xl border border-sand-200 bg-white/90 p-3">
                  <p className="text-xs font-semibold text-cocoa-500">
                    Oportunidad de responder a Cristo
                  </p>
                  <p className="mt-1 text-lg font-bold text-brand-600">
                    {team.metrics.opportunityToRespond || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Respondiendo */}
            <div className="rounded-2xl border border-sand-200 bg-white/80 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-cocoa-900">Respondiendo</h3>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-sand-200 bg-white/90 p-3">
                  <p className="text-xs font-semibold text-cocoa-500">Creyeron el mensaje</p>
                  <p className="mt-1 text-lg font-bold text-emerald-600">
                    {team.metrics.believedMessage || 0}
                  </p>
                </div>
                <div className="rounded-xl border border-sand-200 bg-white/90 p-3">
                  <p className="text-xs font-semibold text-cocoa-500">Fueron bautizados</p>
                  <p className="mt-1 text-lg font-bold text-emerald-600">
                    {team.metrics.baptized || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Consolidando */}
            <div className="rounded-2xl border border-sand-200 bg-white/80 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-cocoa-900">Consolidando</h3>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-sand-200 bg-white/90 p-3">
                  <p className="text-xs font-semibold text-cocoa-500">
                    Estudios bíblicos regulares
                  </p>
                  <p className="mt-1 text-lg font-bold text-brand-600">
                    {team.metrics.regularBibleStudies || 0}
                  </p>
                </div>
                <div className="rounded-xl border border-sand-200 bg-white/90 p-3">
                  <p className="text-xs font-semibold text-cocoa-500">
                    Mentoreadas personalmente
                  </p>
                  <p className="mt-1 text-lg font-bold text-brand-600">
                    {team.metrics.personallyMentored || 0}
                  </p>
                </div>
                <div className="rounded-xl border border-sand-200 bg-white/90 p-3">
                  <p className="text-xs font-semibold text-cocoa-500">
                    Grupos nuevos (este año)
                  </p>
                  <p className="mt-1 text-lg font-bold text-brand-600">
                    {team.metrics.newGroupsThisYear || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Liderazgo */}
            <div className="rounded-2xl border border-sand-200 bg-white/80 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-cocoa-900">Liderazgo</h3>
              </div>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border border-sand-200 bg-white/90 p-3">
                  <p className="text-xs font-semibold text-cocoa-500">
                    Entrenamiento ministerial práctico
                  </p>
                  <p className="mt-1 text-lg font-bold text-brand-600">
                    {team.metrics.ministerialTraining || 0}
                  </p>
                </div>
                <div className="rounded-xl border border-sand-200 bg-white/90 p-3">
                  <p className="text-xs font-semibold text-cocoa-500">
                    Entrenamiento en otras áreas
                  </p>
                  <p className="mt-1 text-lg font-bold text-brand-600">
                    {team.metrics.otherAreasTraining || 0}
                  </p>
                </div>
                <div className="rounded-xl border border-sand-200 bg-white/90 p-3">
                  <p className="text-xs font-semibold text-cocoa-500">
                    Entrenamiento pastoral práctico
                  </p>
                  <p className="mt-1 text-lg font-bold text-brand-600">
                    {team.metrics.pastoralTraining || 0}
                  </p>
                </div>
                <div className="rounded-xl border border-sand-200 bg-white/90 p-3">
                  <p className="text-xs font-semibold text-cocoa-500">Entrenamiento bíblico</p>
                  <p className="mt-1 text-lg font-bold text-brand-600">
                    {team.metrics.biblicalTraining || 0}
                  </p>
                </div>
                <div className="rounded-xl border border-sand-200 bg-white/90 p-3">
                  <p className="text-xs font-semibold text-cocoa-500">
                    Entrenamiento para comenzar iglesias
                  </p>
                  <p className="mt-1 text-lg font-bold text-brand-600">
                    {team.metrics.churchPlantingTraining || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desarrollo eclesial */}
      {team.metrics && (
        <div className="card-elevated">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-cocoa-900">Desarrollo eclesial</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-sand-200 bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">
                Grupos con perspectivas de iglesias
              </p>
              <p className="mt-2 text-2xl font-bold text-brand-600">
                {team.metrics.groupsWithChurchProspects || 0}
              </p>
            </div>
            <div className="rounded-2xl border border-sand-200 bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">
                Iglesias al final del período
              </p>
              <p className="mt-2 text-2xl font-bold text-emerald-600">
                {team.metrics.churchesAtEndOfPeriod || 0}
              </p>
            </div>
            <div className="rounded-2xl border border-sand-200 bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">
                Nuevas iglesias 1ra generación
              </p>
              <p className="mt-2 text-2xl font-bold text-emerald-600">
                {team.metrics.firstGenChurches || 0}
              </p>
            </div>
            <div className="rounded-2xl border border-sand-200 bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">
                Nuevas iglesias 2da generación
              </p>
              <p className="mt-2 text-2xl font-bold text-emerald-600">
                {team.metrics.secondGenChurches || 0}
              </p>
            </div>
            <div className="rounded-2xl border border-sand-200 bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">
                Nuevas iglesias 3ra generación
              </p>
              <p className="mt-2 text-2xl font-bold text-emerald-600">
                {team.metrics.thirdGenChurches || 0}
              </p>
            </div>
            {(team.metrics.lostFirstGenChurches || 0) > 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                  Iglesias perdidas 1ra generación
                </p>
                <p className="mt-2 text-2xl font-bold text-amber-700">
                  {team.metrics.lostFirstGenChurches || 0}
                </p>
              </div>
            )}
            {(team.metrics.lostSecondGenChurches || 0) > 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                  Iglesias perdidas 2da generación
                </p>
                <p className="mt-2 text-2xl font-bold text-amber-700">
                  {team.metrics.lostSecondGenChurches || 0}
                </p>
              </div>
            )}
            {(team.metrics.lostThirdGenChurches || 0) > 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                  Iglesias perdidas 3ra generación
                </p>
                <p className="mt-2 text-2xl font-bold text-amber-700">
                  {team.metrics.lostThirdGenChurches || 0}
                </p>
              </div>
            )}
          </div>
        </div>
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
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const categoryBudget = activePlan.category === category
                ? activePlan.activities.reduce((sum, act) => sum + act.budgetTotal, 0)
                : 0;
              const categoryLiquidated = activePlan.category === category
                ? activePlan.activities.reduce((sum, act) => sum + act.budgetLiquidated, 0)
                : 0;

              return (
                <div
                  key={category}
                  className="rounded-2xl border border-sand-200 bg-white/80 p-4"
                >
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
                  className="rounded-2xl border border-sand-200 bg-white/80 p-5"
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
  );
}


