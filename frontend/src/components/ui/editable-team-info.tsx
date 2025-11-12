"use client";

import { useState } from "react";
import { EditableField } from "./editable-field";

interface EditableTeamInfoProps {
  ministryLocation: string;
  leader: string;
  membersCount: number;
  onUpdateLocation?: (value: string) => void;
}

export function EditableTeamInfo({
  ministryLocation: initialLocation,
  leader,
  membersCount,
  onUpdateLocation
}: EditableTeamInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [ministryLocation, setMinistryLocation] = useState(initialLocation);

  return (
    <div className="card-elevated">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-cocoa-900">Información del equipo</h2>
        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 rounded-2xl border border-brand-200 bg-brand-50/70 px-3 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-100 hover:text-brand-800"
          >
            <span>✏️</span>
            <span>Editar</span>
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isEditing ? (
          <EditableField
            label="Lugar de ministerio"
            value={ministryLocation}
            type="text"
            size="sm"
            onSave={(value) => {
              const newValue = value.toString();
              setMinistryLocation(newValue);
              onUpdateLocation?.(newValue);
              setIsEditing(false);
            }}
          />
        ) : (
          <div className="group relative rounded-2xl border border-sand-200 bg-white/80 p-4 transition hover:border-brand-200">
            <div className="absolute right-2 top-2 opacity-0 transition group-hover:opacity-100">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center justify-center rounded-lg border border-brand-200 bg-white/90 p-1.5 text-xs text-brand-600 transition hover:bg-brand-50"
                title="Editar lugar de ministerio"
              >
                ✏️
              </button>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">
              Lugar de ministerio
            </p>
            <p className="mt-2 text-sm font-semibold text-cocoa-900">{ministryLocation}</p>
          </div>
        )}
        <div className="rounded-2xl border border-sand-200 bg-white/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">
            Líder de equipo
          </p>
          <p className="mt-2 text-sm font-semibold text-cocoa-900">{leader}</p>
        </div>
        <div className="rounded-2xl border border-sand-200 bg-white/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">
            Integrantes
          </p>
          <p className="mt-2 text-sm font-semibold text-cocoa-900">{membersCount} miembros</p>
        </div>
      </div>
    </div>
  );
}

