import Link from "next/link";
import { notFound } from "next/navigation";
import { loadTeamById } from "@/lib/mock-data";
import { TeamDashboardView } from "@/components/ui/team-dashboard-view";

interface Props {
  params: Promise<{ teamId: string }>;
}

export default async function SuperAdminTeamDetail({ params }: Props) {
  const resolvedParams = await params;
  const team = await loadTeamById(resolvedParams.teamId);

  if (!team) {
    notFound();
  }

  const activePlan = team.plans.find((plan) => plan.status === "Activo");
  const otherPlans = team.plans.filter((plan) => plan.id !== activePlan?.id);

  return (
    <section className="space-y-9">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold tracking-tight text-cocoa-900">{team.name}</h1>
          <Link
            href="/superadmin/manage"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 transition hover:text-brand-500"
          >
            <span>←</span>
            <span>Volver al gestor de equipos</span>
          </Link>
        </div>
        <p className="text-sm leading-6 text-cocoa-600">
          Líder: <span className="font-semibold text-cocoa-900">{team.leader}</span> · Presupuesto
          asignado:{" "}
          <span className="font-semibold text-cocoa-900">
            {team.budgetAssigned.toLocaleString("es-CO", {
              style: "currency",
              currency: "COP",
              maximumFractionDigits: 0
            })}
          </span>
        </p>
        <div className="flex flex-wrap gap-2">
          {team.members.map((member) => (
            <Link
              key={member.name}
              href={`/superadmin/teams/${team.id}/members`}
              className="inline-flex items-center rounded-full border border-sand-200 bg-white/80 px-3 py-1 text-xs font-semibold text-cocoa-600 transition hover:border-brand-200 hover:bg-brand-50/60 hover:text-brand-600"
            >
              {member.name} · {member.role}
            </Link>
          ))}
        </div>
      </header>

      {/* Dashboard completo del equipo */}
      <TeamDashboardView team={team} />

      {/* Histórico de planes */}
      {otherPlans.length > 0 && (
        <div className="card-elevated">
          <h3 className="text-lg font-semibold text-cocoa-900 mb-5">Histórico de planes</h3>
          <div className="space-y-4">
            {otherPlans.map((plan) => (
              <div
                key={plan.id}
                className="rounded-2xl border border-sand-200 bg-white/80 p-4 transition hover:border-brand-200 hover:bg-brand-50/60"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="text-lg font-semibold text-cocoa-900">{plan.name}</h4>
                    <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">
                      {plan.startDate} → {plan.endDate}
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full border border-sand-200 bg-sand-50/80 px-3 py-1 text-xs font-semibold text-cocoa-600">
                    {plan.status}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-cocoa-600">{plan.summary}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50/70 px-3 py-1 text-xs font-semibold text-brand-600">
                    Actividades registradas: {plan.activities.length}
                  </p>
                  <Link
                    href={`/superadmin/plans/${plan.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 transition hover:text-brand-500"
                  >
                    <span>Ver vista general</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

