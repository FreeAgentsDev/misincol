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
        <div className="space-y-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
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

          {/* Tabla de actividades */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-cocoa-900">Detalles de actividades</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-amber-500/90 text-cocoa-900">
                    <th className="border border-sand-300 px-2 py-2 text-left font-semibold">ESTADO</th>
                    <th className="border border-sand-300 px-2 py-2 text-left font-semibold">ETAPA</th>
                    <th className="border border-sand-300 px-2 py-2 text-left font-semibold">objetivo #:</th>
                    <th className="border border-sand-300 px-2 py-2 text-left font-semibold">DESCRIPCIÓN DE ACTIVIDADES</th>
                    <th className="border border-sand-300 px-2 py-2 text-left font-semibold">SITUACIÓN ACTUAL</th>
                    <th className="border border-sand-300 px-2 py-2 text-left font-semibold">A mediano plazo</th>
                    <th className="border border-sand-300 px-2 py-2 text-left font-semibold">A largo plazo</th>
                    <th className="border border-sand-300 px-2 py-2 text-left font-semibold">RESPONSABLE</th>
                    <th className="border border-sand-300 px-2 py-2 text-left font-semibold">Frecuencia</th>
                    <th className="border border-sand-300 px-2 py-2 text-left font-semibold">Número de veces en el año</th>
                    <th className="border border-sand-300 px-2 py-2 text-left font-semibold">FECHA INICIO</th>
                    <th className="border border-sand-300 px-2 py-2 text-left font-semibold">FECHA FINAL</th>
                    <th className="border border-sand-300 px-2 py-2 text-left font-semibold">TOTAL DE SEMANAS</th>
                    <th className="border border-sand-300 px-2 py-2 text-left font-semibold">SEMANAS RESTANTES</th>
                    <th className="border border-sand-300 px-2 py-2 text-left font-semibold">UNITARIO</th>
                    <th className="border border-sand-300 px-2 py-2 text-left font-semibold">TOTAL</th>
                    <th className="border border-sand-300 px-2 py-2 text-left font-semibold">Obstáculos a vencer</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.activities.length > 0 ? (
                    plan.activities.map((activity, index) => {
                      const budgetUnit = activity.timesPerYear > 0 
                        ? activity.budgetTotal / activity.timesPerYear 
                        : activity.budgetTotal;

                      return (
                        <tr
                          key={activity.id}
                          className="bg-white hover:bg-brand-50/30 transition cursor-pointer"
                          onClick={() => handleActivityClick(activity)}
                        >
                          <td className="border border-sand-200 px-2 py-2">
                            <span
                              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${
                                activity.status === "Hecha"
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "border-amber-200 bg-amber-50 text-amber-700"
                              }`}
                            >
                              {activity.status}
                            </span>
                          </td>
                          <td className="border border-sand-200 px-2 py-2 text-cocoa-700">{activity.stage || "-"}</td>
                          <td className="border border-sand-200 px-2 py-2 text-cocoa-700">{activity.objective ? "1" : "-"}</td>
                          <td className="border border-sand-200 px-2 py-2 text-cocoa-700 font-medium">{activity.name}</td>
                          <td className="border border-sand-200 px-2 py-2 text-cocoa-600">{activity.currentSituation || "-"}</td>
                          <td className="border border-sand-200 px-2 py-2 text-cocoa-700">{activity.goalMid || "-"}</td>
                          <td className="border border-sand-200 px-2 py-2 text-cocoa-700">{activity.goalLong || "-"}</td>
                          <td className="border border-sand-200 px-2 py-2 text-cocoa-700">{activity.responsable || "-"}</td>
                          <td className="border border-sand-200 px-2 py-2 text-cocoa-700">{activity.frequency || "-"}</td>
                          <td className="border border-sand-200 px-2 py-2 text-cocoa-700 text-center">{activity.timesPerYear || 0}</td>
                          <td className="border border-sand-200 px-2 py-2 text-cocoa-700">{activity.startDate || "-"}</td>
                          <td className="border border-sand-200 px-2 py-2 text-cocoa-700">{activity.endDate || "-"}</td>
                          <td className="border border-sand-200 px-2 py-2 text-cocoa-700 text-center">{activity.totalWeeks || 0}</td>
                          <td className="border border-sand-200 px-2 py-2 text-cocoa-700 text-center">{activity.remainingWeeks || 0}</td>
                          <td className="border border-sand-200 px-2 py-2 text-cocoa-700 text-right">
                            {budgetUnit > 0
                              ? budgetUnit.toLocaleString("es-CO", {
                                  style: "currency",
                                  currency: "COP",
                                  maximumFractionDigits: 0
                                })
                              : "$ -"}
                          </td>
                          <td className="border border-sand-200 px-2 py-2 text-cocoa-700 text-right font-semibold">
                            {activity.budgetTotal > 0
                              ? activity.budgetTotal.toLocaleString("es-CO", {
                                  style: "currency",
                                  currency: "COP",
                                  maximumFractionDigits: 0
                                })
                              : "$ -"}
                          </td>
                          <td className="border border-sand-200 px-2 py-2 text-cocoa-600">{activity.obstacles || "-"}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={17} className="border border-sand-200 px-4 py-8 text-center text-cocoa-500">
                        No hay actividades registradas
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
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

