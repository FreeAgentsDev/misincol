"use client";

import { useState } from "react";
import { PlanStatus, DevelopmentPlan } from "@/lib/types";
import { PlanDetailModal } from "@/components/ui/plan-detail-modal";

interface Props {
  plans: DevelopmentPlan[];
  team: { id: string; name: string };
  teamId: string;
}

export function LeaderPlansListClient({ plans, team, teamId }: Props) {
  const [selectedPlan, setSelectedPlan] = useState<DevelopmentPlan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Agrupar planes por estado
  const plansByStatus: Record<PlanStatus, DevelopmentPlan[]> = {
    Activo: plans.filter((p) => p.status === "Activo"),
    Finalizado: plans.filter((p) => p.status === "Finalizado"),
    Archivado: plans.filter((p) => p.status === "Archivado")
  };

  const doneCount = (plan: DevelopmentPlan) =>
    plan.activities.filter((a) => a.status === "Hecha").length;
  const pendingCount = (plan: DevelopmentPlan) =>
    plan.activities.filter((a) => a.status === "Pendiente").length;

  const handlePlanClick = (plan: DevelopmentPlan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
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
              Planes de desarrollo · {team.name}
            </h1>
          </div>
          <p className="max-w-3xl text-sm leading-6 text-cocoa-600">
            Consulta todos los planes de desarrollo de tu equipo. Haz clic en cualquier plan para
            ver sus detalles.
          </p>
        </header>

        <div className="space-y-8">
          {/* Planes activos */}
          {plansByStatus.Activo.length > 0 && (
            <div className="card-elevated">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-cocoa-900">Planes activos</h2>
                <span className="rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1 text-xs font-semibold text-emerald-600">
                  {plansByStatus.Activo.length}{" "}
                  {plansByStatus.Activo.length === 1 ? "plan" : "planes"}
                </span>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {plansByStatus.Activo.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => handlePlanClick(plan)}
                    className="group rounded-2xl border border-sand-200 bg-white/80 p-5 text-left transition hover:border-brand-200 hover:bg-brand-50/60 hover:shadow-md"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-cocoa-900 group-hover:text-brand-600">
                            {plan.name}
                          </h3>
                        </div>
                        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50/70 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                          Activo
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
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Planes finalizados */}
          {plansByStatus.Finalizado.length > 0 && (
            <div className="card-elevated">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-cocoa-900">Planes finalizados</h2>
                <span className="rounded-full border border-sand-200 bg-sand-50/80 px-3 py-1 text-xs font-semibold text-cocoa-600">
                  {plansByStatus.Finalizado.length}{" "}
                  {plansByStatus.Finalizado.length === 1 ? "plan" : "planes"}
                </span>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {plansByStatus.Finalizado.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => handlePlanClick(plan)}
                    className="group rounded-2xl border border-sand-200 bg-white/80 p-5 text-left transition hover:border-brand-200 hover:bg-brand-50/60 hover:shadow-md"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-cocoa-900 group-hover:text-brand-600">
                            {plan.name}
                          </h3>
                        </div>
                        <span className="inline-flex items-center rounded-full border border-sand-200 bg-sand-50/80 px-2.5 py-1 text-xs font-semibold text-cocoa-600">
                          Finalizado
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
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Planes archivados */}
          {plansByStatus.Archivado.length > 0 && (
            <div className="card-elevated">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-cocoa-900">Planes archivados</h2>
                <span className="rounded-full border border-sand-200 bg-sand-50/80 px-3 py-1 text-xs font-semibold text-cocoa-600">
                  {plansByStatus.Archivado.length}{" "}
                  {plansByStatus.Archivado.length === 1 ? "plan" : "planes"}
                </span>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {plansByStatus.Archivado.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => handlePlanClick(plan)}
                    className="group rounded-2xl border border-sand-200 bg-white/80 p-5 text-left transition hover:border-brand-200 hover:bg-brand-50/60 hover:shadow-md"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-cocoa-900 group-hover:text-brand-600">
                            {plan.name}
                          </h3>
                        </div>
                        <span className="inline-flex items-center rounded-full border border-sand-200 bg-sand-50/80 px-2.5 py-1 text-xs font-semibold text-cocoa-600">
                          Archivado
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
                  </button>
                ))}
              </div>
            </div>
          )}

          {plans.length === 0 && (
            <div className="card-elevated">
              <p className="rounded-3xl border border-dashed border-sand-200 bg-white/70 p-6 text-center text-sm text-cocoa-500">
                No hay planes registrados para este equipo.
              </p>
            </div>
          )}
        </div>
      </section>

      <PlanDetailModal
        plan={selectedPlan}
        team={team}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPlan(null);
        }}
      />
    </>
  );
}

