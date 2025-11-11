import Link from "next/link";
import { notFound } from "next/navigation";
import { loadTeamById } from "@/lib/mock-data";

interface Props {
  params: { teamId: string };
}

export default async function SuperAdminTeamDetail({ params }: Props) {
  const team = await loadTeamById(params.teamId);

  if (!team) {
    notFound();
  }

  const activePlan = team.plans.find((plan) => plan.status === "Activo");
  const otherPlans = team.plans.filter((plan) => plan.id !== activePlan?.id);

  return (
    <section className="space-y-10">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            {team.name}
          </h1>
          <Link
            href="/superadmin/dashboard"
            className="inline-flex items-center text-sm font-semibold text-blue-600 transition hover:text-blue-700"
          >
            ← Volver al dashboard
          </Link>
        </div>
        <p className="text-sm leading-6 text-slate-500">
          Líder: <span className="font-semibold text-slate-900">{team.leader}</span> ·
          Presupuesto asignado:{" "}
          <span className="font-semibold text-slate-900">
            {team.budgetAssigned.toLocaleString("es-CO", {
              style: "currency",
              currency: "COP",
              maximumFractionDigits: 0
            })}
          </span>
        </p>
        <div className="flex flex-wrap gap-2">
          {team.members.map((member) => (
            <span
              key={member.name}
              className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
            >
              {member.name} · {member.role}
            </span>
          ))}
        </div>
      </header>

      {activePlan ? (
        <div className="space-y-8 rounded-3xl bg-white p-6 shadow-card ring-1 ring-slate-200">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">
                Plan activo: {activePlan.name}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                {activePlan.summary}
              </p>
            </div>
            <span className="inline-flex items-center rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-blue-600">
              {activePlan.category}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Periodo
              </p>
              <p className="mt-2 text-sm font-medium text-slate-900">
                {activePlan.startDate} → {activePlan.endDate}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Estado financiero
              </p>
              <div className="mt-2 space-y-1 text-sm font-medium">
                <p className="text-emerald-600">
                  Liquidado:{" "}
                  {team.budgetLiquidated.toLocaleString("es-CO", {
                    style: "currency",
                    currency: "COP",
                    maximumFractionDigits: 0
                  })}
                </p>
                <p className="text-blue-600">
                  Disponible:{" "}
                  {(team.budgetAssigned - team.budgetLiquidated).toLocaleString("es-CO", {
                    style: "currency",
                    currency: "COP",
                    maximumFractionDigits: 0
                  })}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900">Actividades</h3>
            <div className="mt-4 space-y-4">
              {activePlan.activities.map((activity) => (
                <div
                  key={activity.id}
                  className="rounded-2xl border border-slate-200 p-5 transition hover:border-blue-200 hover:bg-blue-50/30"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900">
                        {activity.name}
                      </h4>
                      <p className="text-xs font-semibold text-slate-500">
                        Responsable: {activity.responsable} · Área {activity.area} ·{" "}
                        {activity.stage}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ${
                        activity.status === "Hecha"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {activity.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{activity.description}</p>
                  <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-slate-600">
                    <span className="rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-slate-200">
                      Presupuesto total:{" "}
                      {activity.budgetTotal.toLocaleString("es-CO", {
                        style: "currency",
                        currency: "COP",
                        maximumFractionDigits: 0
                      })}
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-slate-200">
                      Liquidado:{" "}
                      {activity.budgetLiquidated.toLocaleString("es-CO", {
                        style: "currency",
                        currency: "COP",
                        maximumFractionDigits: 0
                      })}
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-slate-200">
                      {activity.startDate} → {activity.endDate}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3 text-sm text-slate-500 md:grid-cols-2">
                    <p>
                      <span className="font-semibold text-slate-700">Situación actual:</span>{" "}
                      {activity.currentSituation}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-700">Obstáculos:</span>{" "}
                      {activity.obstacles || "Ninguno reportado"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl bg-white p-6 text-sm text-slate-500 shadow-card ring-1 ring-slate-200">
          <p className="font-semibold text-slate-900">Sin plan activo actualmente</p>
          <p className="mt-2">Este equipo no tiene planes activos en la data de ejemplo.</p>
        </div>
      )}

      <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-slate-200">
        <h3 className="text-lg font-semibold text-slate-900">Histórico de planes</h3>
        <div className="mt-4 space-y-4">
          {otherPlans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/30"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-lg font-semibold text-slate-900">{plan.name}</h4>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {plan.startDate} → {plan.endDate}
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {plan.status}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{plan.summary}</p>
              <p className="mt-2 text-xs font-semibold text-slate-500">
                Actividades registradas: {plan.activities.length}
              </p>
            </div>
          ))}
          {otherPlans.length === 0 ? (
            <p className="text-sm text-slate-500">Sin registros adicionales.</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

