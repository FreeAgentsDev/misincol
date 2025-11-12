"use client";

import { useState } from "react";
import { PlanCategory, Activity } from "@/lib/types";
import { Modal } from "./modal";
import { ActivityDetailModal } from "./activity-detail-modal";

const categories: PlanCategory[] = [
  "Investigación",
  "Encarnación",
  "Evangelización",
  "Entrenamiento",
  "Autocuidado"
];

interface Plan {
  id: string;
  name: string;
  category: PlanCategory;
  status: string;
  startDate: string;
  endDate: string;
  summary: string;
  activities: Activity[];
}

interface Team {
  id: string;
  name: string;
  leader?: string;
}

interface Props {
  plan: Plan | null;
  team: Team | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PlanDetailModal({ plan, team, isOpen, onClose }: Props) {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);

  if (!plan || !team) return null;

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
    setIsActivityModalOpen(true);
  };

  const doneCount = (category: PlanCategory) =>
    activitiesByCategory[category].filter((a) => a.status === "Hecha").length;
  const pendingCount = (category: PlanCategory) =>
    activitiesByCategory[category].filter((a) => a.status === "Pendiente").length;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={plan.name}>
        <div className="space-y-6">
          {/* Información del plan */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              {team.leader && (
                <span className="rounded-full border border-sand-200 bg-sand-50/80 px-3 py-1 text-cocoa-600">
                  {team.name} · {team.leader}
                </span>
              )}
              {!team.leader && (
                <span className="rounded-full border border-sand-200 bg-sand-50/80 px-3 py-1 text-cocoa-600">
                  Equipo: {team.name}
                </span>
              )}
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
            <p className="text-sm leading-6 text-cocoa-700">{plan.summary}</p>
          </div>

          {/* Tareas por categoría */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-cocoa-900">Tareas por categoría</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {categories.map((category) => {
                const categoryActivities = activitiesByCategory[category];

                return (
                  <div
                    key={category}
                    className="rounded-xl border border-sand-200 bg-white/80 p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-cocoa-900">{category}</h4>
                      <span className="rounded-full border border-brand-200 bg-brand-50/70 px-2.5 py-0.5 text-xs font-semibold text-brand-600">
                        {categoryActivities.length} tareas
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold mb-3">
                      <span className="inline-flex items-center gap-1.5 text-emerald-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/80" />
                        {doneCount(category)} completadas
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-amber-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500/80" />
                        {pendingCount(category)} pendientes
                      </span>
                    </div>
                    {categoryActivities.length > 0 ? (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {categoryActivities.map((activity) => (
                          <button
                            key={activity.id}
                            type="button"
                            onClick={() => handleActivityClick(activity)}
                            className="w-full rounded-lg border border-sand-200 bg-white/90 p-2.5 text-left text-xs transition hover:border-brand-200 hover:bg-brand-50/50"
                          >
                            <p className="font-semibold text-cocoa-900">{activity.name}</p>
                            <p className="mt-0.5 text-cocoa-500">
                              {activity.responsable} · {activity.area}
                            </p>
                            <span
                              className={`mt-1.5 inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${
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
                      <p className="rounded-lg border border-dashed border-sand-200 bg-white/70 p-2.5 text-center text-xs text-cocoa-500">
                        Sin tareas en esta categoría
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Modal>

      <ActivityDetailModal
        activity={selectedActivity}
        isOpen={isActivityModalOpen}
        onClose={() => {
          setIsActivityModalOpen(false);
          setSelectedActivity(null);
        }}
      />
    </>
  );
}

