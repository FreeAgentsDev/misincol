"use client";

import { useState } from "react";
import { TeamMetrics } from "@/lib/types";
import { EditableField } from "./editable-field";

interface EditableEcclesialProps {
  metrics: TeamMetrics;
  onUpdate?: (key: keyof TeamMetrics, value: number) => void;
}

export function EditableEcclesial({ metrics: initialMetrics, onUpdate }: EditableEcclesialProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [metrics, setMetrics] = useState(initialMetrics);

  return (
    <div className="card-elevated">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-cocoa-900">Desarrollo eclesial</h2>
        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 rounded-2xl border border-brand-200 bg-brand-50/70 px-3 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-100 hover:text-brand-800"
          >
            <span>✏️</span>
            <span>Editar desarrollo</span>
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isEditing ? (
          <>
            <EditableField
              label="Grupos con perspectivas de iglesias"
              value={metrics.groupsWithChurchProspects || 0}
              type="number"
              onSave={(value) => {
                const numValue = Number(value);
                setMetrics({ ...metrics, groupsWithChurchProspects: numValue });
                onUpdate?.("groupsWithChurchProspects", numValue);
                setIsEditing(false);
              }}
            />
            <EditableField
              label="Iglesias al final del período"
              value={metrics.churchesAtEndOfPeriod || 0}
              type="number"
              onSave={(value) => {
                const numValue = Number(value);
                setMetrics({ ...metrics, churchesAtEndOfPeriod: numValue });
                onUpdate?.("churchesAtEndOfPeriod", numValue);
                setIsEditing(false);
              }}
            />
            <EditableField
              label="Nuevas iglesias 1ra generación"
              value={metrics.firstGenChurches || 0}
              type="number"
              onSave={(value) => {
                const numValue = Number(value);
                setMetrics({ ...metrics, firstGenChurches: numValue });
                onUpdate?.("firstGenChurches", numValue);
                setIsEditing(false);
              }}
            />
            <EditableField
              label="Nuevas iglesias 2da generación"
              value={metrics.secondGenChurches || 0}
              type="number"
              onSave={(value) => {
                const numValue = Number(value);
                setMetrics({ ...metrics, secondGenChurches: numValue });
                onUpdate?.("secondGenChurches", numValue);
                setIsEditing(false);
              }}
            />
            <EditableField
              label="Nuevas iglesias 3ra generación"
              value={metrics.thirdGenChurches || 0}
              type="number"
              onSave={(value) => {
                const numValue = Number(value);
                setMetrics({ ...metrics, thirdGenChurches: numValue });
                onUpdate?.("thirdGenChurches", numValue);
                setIsEditing(false);
              }}
            />
          </>
        ) : (
          <>
            <div className="group relative rounded-2xl border border-sand-200 bg-white/80 p-4 transition hover:border-brand-200">
              <div className="absolute right-2 top-2 opacity-0 transition group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center justify-center rounded-lg border border-brand-200 bg-white/90 p-1.5 text-xs text-brand-600 transition hover:bg-brand-50"
                  title="Editar"
                >
                  ✏️
                </button>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">
                Grupos con perspectivas de iglesias
              </p>
              <p className="mt-2 text-2xl font-bold text-brand-600">
                {metrics.groupsWithChurchProspects || 0}
              </p>
            </div>
            <div className="group relative rounded-2xl border border-sand-200 bg-white/80 p-4 transition hover:border-brand-200">
              <div className="absolute right-2 top-2 opacity-0 transition group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center justify-center rounded-lg border border-brand-200 bg-white/90 p-1.5 text-xs text-brand-600 transition hover:bg-brand-50"
                  title="Editar"
                >
                  ✏️
                </button>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">
                Iglesias al final del período
              </p>
              <p className="mt-2 text-2xl font-bold text-emerald-600">
                {metrics.churchesAtEndOfPeriod || 0}
              </p>
            </div>
            <div className="group relative rounded-2xl border border-sand-200 bg-white/80 p-4 transition hover:border-brand-200">
              <div className="absolute right-2 top-2 opacity-0 transition group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center justify-center rounded-lg border border-brand-200 bg-white/90 p-1.5 text-xs text-brand-600 transition hover:bg-brand-50"
                  title="Editar"
                >
                  ✏️
                </button>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">
                Nuevas iglesias 1ra generación
              </p>
              <p className="mt-2 text-2xl font-bold text-emerald-600">
                {metrics.firstGenChurches || 0}
              </p>
            </div>
            <div className="group relative rounded-2xl border border-sand-200 bg-white/80 p-4 transition hover:border-brand-200">
              <div className="absolute right-2 top-2 opacity-0 transition group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center justify-center rounded-lg border border-brand-200 bg-white/90 p-1.5 text-xs text-brand-600 transition hover:bg-brand-50"
                  title="Editar"
                >
                  ✏️
                </button>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">
                Nuevas iglesias 2da generación
              </p>
              <p className="mt-2 text-2xl font-bold text-emerald-600">
                {metrics.secondGenChurches || 0}
              </p>
            </div>
            <div className="group relative rounded-2xl border border-sand-200 bg-white/80 p-4 transition hover:border-brand-200">
              <div className="absolute right-2 top-2 opacity-0 transition group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center justify-center rounded-lg border border-brand-200 bg-white/90 p-1.5 text-xs text-brand-600 transition hover:bg-brand-50"
                  title="Editar"
                >
                  ✏️
                </button>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">
                Nuevas iglesias 3ra generación
              </p>
              <p className="mt-2 text-2xl font-bold text-emerald-600">
                {metrics.thirdGenChurches || 0}
              </p>
            </div>
            {(metrics.lostFirstGenChurches || 0) > 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                  Iglesias perdidas 1ra generación
                </p>
                <p className="mt-2 text-2xl font-bold text-amber-700">
                  {metrics.lostFirstGenChurches || 0}
                </p>
              </div>
            )}
            {(metrics.lostSecondGenChurches || 0) > 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                  Iglesias perdidas 2da generación
                </p>
                <p className="mt-2 text-2xl font-bold text-amber-700">
                  {metrics.lostSecondGenChurches || 0}
                </p>
              </div>
            )}
            {(metrics.lostThirdGenChurches || 0) > 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                  Iglesias perdidas 3ra generación
                </p>
                <p className="mt-2 text-2xl font-bold text-amber-700">
                  {metrics.lostThirdGenChurches || 0}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

