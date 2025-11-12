"use client";

import { useState } from "react";
import Link from "next/link";
import { PlanCategory, Activity } from "@/lib/types";
import { ActivityDetailModal } from "@/components/ui/activity-detail-modal";

const categories: PlanCategory[] = [
  "Investigación",
  "Encarnación",
  "Evangelización",
  "Entrenamiento",
  "Autocuidado"
];

interface Props {
  plan: {
    id: string;
    name: string;
    category: PlanCategory;
    status: string;
    startDate: string;
    endDate: string;
    summary: string;
    activities: Activity[];
  };
  team: {
    id: string;
    name: string;
  };
}

export function PlanDetailViewClient({ plan, team }: Props) {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Agrupar actividades por categoría
  const activitiesByCategory: Record<PlanCategory, Activity[]> = {
    Investigación: [],
    Encarnación: [],
    Evangelización: [],
    Entrenamiento: [],
    Autocuidado: []
  };

  plan.activities.forEach((activity) => {
    activitiesByCategory[plan.category].push(activity);
  });

  const handleActivityClick = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  const doneCount = (category: PlanCategory) =>
    activitiesByCategory[category].filter((a) => a.status === "Hecha").length;
  const pendingCount = (category: PlanCategory) =>
    activitiesByCategory[category].filter((a) => a.status === "Pendiente").length;

  return (
    <>
      <section className="space-y-9">
        <header className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-500">
                Vista general del plan
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-cocoa-900">
                {plan.name}
              </h1>
            </div>
            <Link
              href="/superadmin/dashboard"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 transition hover:text-brand-500"
            >
              <span>←</span>
              <span>Volver al dashboard</span>
            </Link>
          </div>
          <div className="space-y-2">
            <p className="max-w-3xl text-sm leading-6 text-cocoa-600">{plan.summary}</p>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-full border border-sand-200 bg-sand-50/80 px-3 py-1 text-cocoa-600">
                Equipo: {team.name}
              </span>
              <span className="rounded-full border border-sand-200 bg-sand-50/80 px-3 py-1 text-cocoa-600">
                Periodo: {plan.startDate} → {plan.endDate}
              </span>
              <span className="rounded-full border border-brand-200 bg-brand-50/70 px-3 py-1 text-brand-600">
                {plan.category}
              </span>
              <span className="rounded-full border border-sand-200 bg-sand-50/80 px-3 py-1 text-cocoa-600">
                {plan.status}
              </span>
            </div>
          </div>
        </header>

        <div className="card-elevated">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-cocoa-900">Tareas por categoría</h2>
            <span className="rounded-full border border-sand-200 bg-sand-50/80 px-3 py-1 text-xs font-semibold text-cocoa-600">
              {plan.name}
            </span>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const categoryActivities = activitiesByCategory[category];

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
                        {doneCount(category)} completadas
                      </span>
                      <span className="inline-flex items-center gap-2 text-amber-600">
                        <span className="h-2 w-2 rounded-full bg-amber-500/80" />
                        {pendingCount(category)} pendientes
                      </span>
                    </div>
                    {categoryActivities.length > 0 ? (
                      <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                        {categoryActivities.map((activity) => (
                          <button
                            key={activity.id}
                            type="button"
                            onClick={() => handleActivityClick(activity)}
                            className="w-full rounded-xl border border-sand-200 bg-white/90 p-3 text-left text-xs transition hover:border-brand-200 hover:bg-brand-50/50 hover:shadow-sm"
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
                          </button>
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

      <ActivityDetailModal
        activity={selectedActivity}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedActivity(null);
        }}
      />
    </>
  );
}

