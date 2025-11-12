"use client";

import { useState } from "react";
import { TeamMetrics } from "@/lib/types";
import { EditableField } from "./editable-field";

interface EditableMetricsSectionProps {
  metrics: TeamMetrics;
  onUpdate?: (key: keyof TeamMetrics, value: string | number) => void;
}

export function EditableMetricsSection({
  metrics: initialMetrics,
  onUpdate
}: EditableMetricsSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [metrics, setMetrics] = useState(initialMetrics);

  return (
    <div className="card-elevated">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-cocoa-900">Métricas generales</h2>
        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 rounded-2xl border border-brand-200 bg-brand-50/70 px-3 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-100 hover:text-brand-800"
          >
            <span>✏️</span>
            <span>Editar métricas</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="inline-flex items-center gap-2 rounded-2xl border border-sand-200 bg-white/70 px-3 py-1.5 text-xs font-semibold text-cocoa-700 transition hover:bg-sand-50"
          >
            <span>Cancelar edición</span>
          </button>
        )}
      </div>
      {isEditing ? (
        <div className="grid gap-4 md:grid-cols-3">
          <EditableField
            label="Población"
            value={metrics.population || 0}
            type="number"
            formatValue={(v) => (v as number).toLocaleString("es-CO")}
            onSave={(value) => {
              const numValue = Number(value);
              setMetrics({ ...metrics, population: numValue });
              onUpdate?.("population", numValue);
              setIsEditing(false);
            }}
          />
          <EditableField
            label="Congregaciones evangélicas"
            value={metrics.evangelicalCongregations || 0}
            type="number"
            onSave={(value) => {
              const numValue = Number(value);
              setMetrics({ ...metrics, evangelicalCongregations: numValue });
              onUpdate?.("evangelicalCongregations", numValue);
              setIsEditing(false);
            }}
          />
          <EditableField
            label="Evangélicos"
            value={metrics.evangelicals || 0}
            type="number"
            formatValue={(v) => (v as number).toLocaleString("es-CO")}
            onSave={(value) => {
              const numValue = Number(value);
              setMetrics({ ...metrics, evangelicals: numValue });
              onUpdate?.("evangelicals", numValue);
              setIsEditing(false);
            }}
          />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="group relative rounded-2xl border border-sand-200 bg-white/80 p-4 transition hover:border-brand-200">
            <div className="absolute right-2 top-2 opacity-0 transition group-hover:opacity-100">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center justify-center rounded-lg border border-brand-200 bg-white/90 p-1.5 text-xs text-brand-600 transition hover:bg-brand-50"
                title="Editar población"
              >
                ✏️
              </button>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">
              Población
            </p>
            <p className="mt-2 text-2xl font-bold text-brand-600">
              {metrics.population?.toLocaleString("es-CO") || "0"}
            </p>
          </div>
          <div className="group relative rounded-2xl border border-sand-200 bg-white/80 p-4 transition hover:border-brand-200">
            <div className="absolute right-2 top-2 opacity-0 transition group-hover:opacity-100">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center justify-center rounded-lg border border-brand-200 bg-white/90 p-1.5 text-xs text-brand-600 transition hover:bg-brand-50"
                title="Editar congregaciones"
              >
                ✏️
              </button>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">
              Congregaciones evangélicas
            </p>
            <p className="mt-2 text-2xl font-bold text-brand-600">
              {metrics.evangelicalCongregations || 0}
            </p>
          </div>
          <div className="group relative rounded-2xl border border-sand-200 bg-white/80 p-4 transition hover:border-brand-200">
            <div className="absolute right-2 top-2 opacity-0 transition group-hover:opacity-100">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center justify-center rounded-lg border border-brand-200 bg-white/90 p-1.5 text-xs text-brand-600 transition hover:bg-brand-50"
                title="Editar evangélicos"
              >
                ✏️
              </button>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">
              Evangélicos
            </p>
            <p className="mt-2 text-2xl font-bold text-brand-600">
              {metrics.evangelicals?.toLocaleString("es-CO") || "0"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

