"use client";

import Link from "next/link";
import { Activity } from "@/lib/types";

interface Props {
  plan: {
    id: string;
    name: string;
  };
  team: {
    id: string;
    name: string;
  };
  activity: Activity;
}

export function ActivityDetailView({ plan, team, activity }: Props) {
  const budgetUnit = activity.timesPerYear && activity.timesPerYear > 0 
    ? activity.budgetTotal / activity.timesPerYear 
    : activity.budgetTotal || 0;

  return (
    <section className="space-y-9">
      <header className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-500">
              Detalle de actividad
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-cocoa-900">
              {activity.name}
            </h1>
          </div>
          <Link
            href={`/superadmin/plans/${plan.id}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 transition hover:text-brand-500"
          >
            <span>←</span>
            <span>Volver al plan</span>
          </Link>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full border border-sand-200 bg-sand-50/80 px-3 py-1 text-cocoa-600">
            Plan: {plan.name}
          </span>
          <span className="rounded-full border border-sand-200 bg-sand-50/80 px-3 py-1 text-cocoa-600">
            Equipo: {team.name}
          </span>
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 ${
              activity.status === "Hecha"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-amber-200 bg-amber-50 text-amber-700"
            }`}
          >
            {activity.status}
          </span>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Información básica */}
        <div className="card-elevated space-y-4">
          <h2 className="text-lg font-semibold text-cocoa-900">Información básica</h2>
          <div className="grid gap-4">
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
        </div>

        {/* Objetivo y descripción */}
        <div className="card-elevated space-y-4">
          <h2 className="text-lg font-semibold text-cocoa-900">Objetivo y descripción</h2>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">
                Objetivo
              </label>
              <p className="text-sm leading-6 text-cocoa-700">{activity.objective || "No especificado"}</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">
                Descripción de actividades
              </label>
              <p className="text-sm leading-6 text-cocoa-700">{activity.description || "No especificada"}</p>
            </div>
          </div>
        </div>

        {/* Situación actual */}
        <div className="card-elevated space-y-4">
          <h2 className="text-lg font-semibold text-cocoa-900">Situación actual</h2>
          <p className="text-sm leading-6 text-cocoa-700">{activity.currentSituation || "No especificada"}</p>
        </div>

        {/* Metas medibles */}
        <div className="card-elevated space-y-4">
          <h2 className="text-lg font-semibold text-cocoa-900">Metas medibles</h2>
          <div className="grid gap-4">
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
        <div className="card-elevated space-y-4">
          <h2 className="text-lg font-semibold text-cocoa-900">Frecuencia y tiempos</h2>
          <div className="grid gap-4">
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
        </div>

        {/* Presupuesto */}
        <div className="card-elevated space-y-4">
          <h2 className="text-lg font-semibold text-cocoa-900">Presupuesto</h2>
          <div className="grid gap-4">
            <div className="space-y-1 rounded-xl border border-sand-200 bg-sand-50/50 p-3">
              <label className="text-xs font-semibold text-cocoa-600">Unitario</label>
              <p className="text-base font-bold text-cocoa-900">
                {budgetUnit > 0
                  ? budgetUnit.toLocaleString("es-CO", {
                      style: "currency",
                      currency: "COP",
                      maximumFractionDigits: 0
                    })
                  : "$ -"}
              </p>
            </div>
            <div className="space-y-1 rounded-xl border border-sand-200 bg-sand-50/50 p-3">
              <label className="text-xs font-semibold text-cocoa-600">Total</label>
              <p className="text-base font-bold text-cocoa-900">
                {activity.budgetTotal > 0
                  ? activity.budgetTotal.toLocaleString("es-CO", {
                      style: "currency",
                      currency: "COP",
                      maximumFractionDigits: 0
                    })
                  : "$ -"}
              </p>
            </div>
            <div className="space-y-1 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
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
        </div>

        {/* Obstáculos */}
        <div className="card-elevated space-y-4 md:col-span-2">
          <h2 className="text-lg font-semibold text-cocoa-900">Obstáculos a vencer</h2>
          <p className="text-sm leading-6 text-cocoa-700">{activity.obstacles || "No especificados"}</p>
        </div>
      </div>
    </section>
  );
}

