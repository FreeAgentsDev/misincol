"use client";

import Link from "next/link";
import { PlanStatus, DevelopmentPlan } from "@/lib/types";

interface PlanWithTeam extends DevelopmentPlan {
  teamName: string;
  teamId: string;
  teamLeader: string;
}

interface Props {
  plans: PlanWithTeam[];
}

export function PlansListClient({ plans }: Props) {
  // Agrupar planes por equipo
  const plansByTeam: Record<string, PlanWithTeam[]> = {};
  plans.forEach((plan) => {
    if (!plansByTeam[plan.teamId]) {
      plansByTeam[plan.teamId] = [];
    }
    plansByTeam[plan.teamId].push(plan);
  });

  // Ordenar planes dentro de cada equipo por estado (Activo primero, luego Finalizado, luego Archivado)
  Object.keys(plansByTeam).forEach((teamId) => {
    plansByTeam[teamId].sort((a, b) => {
      const statusOrder: Record<PlanStatus, number> = {
        Activo: 0,
        Finalizado: 1,
        Archivado: 2
      };
      return statusOrder[a.status] - statusOrder[b.status];
    });
  });

  const doneCount = (plan: PlanWithTeam) =>
    plan.activities.filter((a) => a.status === "Hecha").length;
  const pendingCount = (plan: PlanWithTeam) =>
    plan.activities.filter((a) => a.status === "Pendiente").length;

  const getTeamInfo = (teamId: string) => {
    const teamPlans = plansByTeam[teamId];
    if (teamPlans.length === 0) return null;
    return {
      name: teamPlans[0].teamName,
      leader: teamPlans[0].teamLeader,
      plans: teamPlans
    };
  };

  return (
    <>
      <section className="space-y-9">
        <header className="space-y-3">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-500">
              Gestión de planes
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-cocoa-900">
              Planes de desarrollo
            </h1>
          </div>
          <p className="max-w-3xl text-sm leading-6 text-cocoa-600">
            Consulta todos los planes de desarrollo de todos los equipos. Haz clic en cualquier plan
            para ver la vista completa con todos los detalles.
          </p>
        </header>

        <div className="space-y-8">
          {Object.keys(plansByTeam).map((teamId) => {
            const teamInfo = getTeamInfo(teamId);
            if (!teamInfo) return null;

            const statusCounts = {
              Activo: teamInfo.plans.filter((p) => p.status === "Activo").length,
              Finalizado: teamInfo.plans.filter((p) => p.status === "Finalizado").length,
              Archivado: teamInfo.plans.filter((p) => p.status === "Archivado").length
            };

            return (
              <div key={teamId} className="card-elevated">
                <div className="mb-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold text-cocoa-900">{teamInfo.name}</h2>
                    <p className="text-xs font-medium text-cocoa-500">Líder: {teamInfo.leader}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusCounts.Activo > 0 && (
                      <span className="rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1 text-xs font-semibold text-emerald-600">
                        {statusCounts.Activo} activo{statusCounts.Activo !== 1 ? "s" : ""}
                      </span>
                    )}
                    {statusCounts.Finalizado > 0 && (
                      <span className="rounded-full border border-sand-200 bg-sand-50/80 px-3 py-1 text-xs font-semibold text-cocoa-600">
                        {statusCounts.Finalizado} finalizado{statusCounts.Finalizado !== 1 ? "s" : ""}
                      </span>
                    )}
                    {statusCounts.Archivado > 0 && (
                      <span className="rounded-full border border-sand-200 bg-sand-50/80 px-3 py-1 text-xs font-semibold text-cocoa-600">
                        {statusCounts.Archivado} archivado{statusCounts.Archivado !== 1 ? "s" : ""}
                      </span>
                    )}
                    <span className="rounded-full border border-brand-200 bg-brand-50/80 px-3 py-1 text-xs font-semibold text-brand-600">
                      {teamInfo.plans.length} {teamInfo.plans.length === 1 ? "plan" : "planes"}
                    </span>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {teamInfo.plans.map((plan) => {
                    const statusColors = {
                      Activo: "border-emerald-200 bg-emerald-50/70 text-emerald-600",
                      Finalizado: "border-sand-200 bg-sand-50/80 text-cocoa-600",
                      Archivado: "border-sand-200 bg-sand-50/80 text-cocoa-600"
                    };

                    return (
                      <Link
                        key={plan.id}
                        href={`/superadmin/plans/${plan.id}`}
                        className="group rounded-2xl border border-sand-200 bg-white/80 p-5 text-left transition hover:border-brand-200 hover:bg-brand-50/60 hover:shadow-md"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-base font-semibold text-cocoa-900 group-hover:text-brand-600">
                                {plan.name}
                              </h3>
                            </div>
                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusColors[plan.status]}`}
                            >
                              {plan.status}
                            </span>
                          </div>
                          <p className="line-clamp-2 text-sm leading-5 text-cocoa-600">{plan.summary}</p>
                          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                            <span className="rounded-full border border-sand-200 bg-sand-50/80 px-2.5 py-1 text-cocoa-600">
                              {plan.startDate} → {plan.endDate}
                            </span>
                            <span className="rounded-full border border-brand-200 bg-brand-50/70 px-2.5 py-1 text-brand-600">
                              {plan.category}
                            </span>
                          </div>
                          <div className="flex items-center justify-between border-t border-sand-100 pt-3">
                            <div className="flex items-center gap-3 text-xs font-semibold">
                              <span className="inline-flex items-center gap-1.5 text-emerald-600">
                                <span className="h-2 w-2 rounded-full bg-emerald-500/80" />
                                {doneCount(plan)} completadas
                              </span>
                              <span className="inline-flex items-center gap-1.5 text-amber-600">
                                <span className="h-2 w-2 rounded-full bg-amber-500/80" />
                                {pendingCount(plan)} pendientes
                              </span>
                            </div>
                            <span className="text-xs font-semibold text-brand-600 transition group-hover:text-brand-500">
                              Ver detalle →
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {plans.length === 0 && (
            <div className="card-elevated">
              <p className="rounded-3xl border border-dashed border-sand-200 bg-white/70 p-6 text-center text-sm text-cocoa-500">
                No hay planes registrados.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

