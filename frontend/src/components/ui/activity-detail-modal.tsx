"use client";

import { Activity } from "@/lib/types";
import { Modal } from "./modal";

interface Props {
  activity: Activity | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ActivityDetailModal({ activity, isOpen, onClose }: Props) {
  if (!activity) return null;

  const budgetUnit = activity.timesPerYear > 0 
    ? activity.budgetTotal / activity.timesPerYear 
    : activity.budgetTotal;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={activity.name}>
      <div className="space-y-6">
        {/* Información básica */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">
              Estado
            </label>
            <div>
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${
                  activity.status === "Hecha"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-amber-200 bg-amber-50 text-amber-700"
                }`}
              >
                {activity.status}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">
              Etapa
            </label>
            <p className="text-sm font-medium text-cocoa-900">{activity.stage || "No especificada"}</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">
              Área
            </label>
            <p className="text-sm font-medium text-cocoa-900">{activity.area || "No especificada"}</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">
              Responsable
            </label>
            <p className="text-sm font-medium text-cocoa-900">{activity.responsable || "No asignado"}</p>
          </div>
        </div>

        {/* Objetivo */}
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">
            Objetivo
          </label>
          <p className="text-sm leading-6 text-cocoa-700">{activity.objective || "No especificado"}</p>
        </div>

        {/* Descripción de actividades */}
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">
            Descripción de actividades
          </label>
          <p className="text-sm leading-6 text-cocoa-700">{activity.description || "No especificada"}</p>
        </div>

        {/* Situación actual */}
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">
            Situación actual
          </label>
          <p className="text-sm leading-6 text-cocoa-700">{activity.currentSituation || "No especificada"}</p>
        </div>

        {/* Metas medibles */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">
            Metas medibles
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1 rounded-xl border border-sand-200 bg-sand-50/50 p-3">
              <label className="text-xs font-semibold text-cocoa-600">A mediano plazo</label>
              <p className="text-sm leading-6 text-cocoa-700">{activity.goalMid || "No especificada"}</p>
            </div>
            <div className="space-y-1 rounded-xl border border-sand-200 bg-sand-50/50 p-3">
              <label className="text-xs font-semibold text-cocoa-600">A largo plazo</label>
              <p className="text-sm leading-6 text-cocoa-700">{activity.goalLong || "No especificada"}</p>
            </div>
          </div>
        </div>

        {/* Frecuencia y tiempos */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">
              Frecuencia de la actividad
            </label>
            <p className="text-sm font-medium text-cocoa-900">{activity.frequency || "No especificada"}</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">
              Número de veces en el año
            </label>
            <p className="text-sm font-medium text-cocoa-900">
              {activity.timesPerYear} {activity.timesPerYear === 1 ? "vez" : "veces"}
            </p>
          </div>
        </div>

        {/* Fechas y semanas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">
              Fecha inicio
            </label>
            <p className="text-sm font-medium text-cocoa-900">{activity.startDate || "No especificada"}</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">
              Fecha final
            </label>
            <p className="text-sm font-medium text-cocoa-900">{activity.endDate || "No especificada"}</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">
              Total de semanas
            </label>
            <p className="text-sm font-medium text-cocoa-900">{activity.totalWeeks || 0} semanas</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">
              Semanas restantes
            </label>
            <p className="text-sm font-medium text-cocoa-900">{activity.remainingWeeks || 0} semanas</p>
          </div>
        </div>

        {/* Presupuesto */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">
            Presupuesto
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1 rounded-xl border border-sand-200 bg-sand-50/50 p-3">
              <label className="text-xs font-semibold text-cocoa-600">Unitario</label>
              <p className="text-base font-bold text-cocoa-900">
                {budgetUnit.toLocaleString("es-CO", {
                  style: "currency",
                  currency: "COP",
                  maximumFractionDigits: 0
                })}
              </p>
            </div>
            <div className="space-y-1 rounded-xl border border-sand-200 bg-sand-50/50 p-3">
              <label className="text-xs font-semibold text-cocoa-600">Total</label>
              <p className="text-base font-bold text-cocoa-900">
                {activity.budgetTotal.toLocaleString("es-CO", {
                  style: "currency",
                  currency: "COP",
                  maximumFractionDigits: 0
                })}
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
            <label className="text-xs font-semibold text-emerald-700">Liquidado</label>
            <p className="text-base font-bold text-emerald-700">
              {activity.budgetLiquidated.toLocaleString("es-CO", {
                style: "currency",
                currency: "COP",
                maximumFractionDigits: 0
              })}
            </p>
          </div>
        </div>

        {/* Obstáculos */}
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">
            Obstáculos a vencer
          </label>
          <p className="text-sm leading-6 text-cocoa-700">{activity.obstacles || "No especificados"}</p>
        </div>
      </div>
    </Modal>
  );
}

