"use client";

import { useState } from "react";
import { TeamMetrics } from "@/lib/types";
import { EditableField } from "./editable-field";

interface EditableStagesProps {
  metrics: TeamMetrics;
  onUpdate?: (key: keyof TeamMetrics, value: number) => void;
}

export function EditableStages({ metrics: initialMetrics, onUpdate }: EditableStagesProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingStage, setEditingStage] = useState<string | null>(null);
  const [metrics, setMetrics] = useState(initialMetrics);

  const handleStageEdit = (stage: string) => {
    setEditingStage(stage);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingStage(null);
  };

  return (
    <div className="card-elevated">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-cocoa-900">Etapas de desarrollo</h2>
        {isEditing ? (
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center gap-2 rounded-2xl border border-sand-200 bg-white/70 px-3 py-1.5 text-xs font-semibold text-cocoa-700 transition hover:bg-sand-50"
          >
            <span>Cancelar edición</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 rounded-2xl border border-brand-200 bg-brand-50/70 px-3 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-100 hover:text-brand-800"
          >
            <span>✏️</span>
            <span>Editar etapas</span>
          </button>
        )}
      </div>
      <div className="space-y-6">
        {/* Contacto */}
        <div className="rounded-2xl border border-sand-200 bg-white/80 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-cocoa-900">Contacto</h3>
            {!isEditing && (
              <button
                type="button"
                onClick={() => handleStageEdit("contacto")}
                className="inline-flex items-center justify-center rounded-lg border border-brand-200 bg-white/90 p-1.5 text-xs text-brand-600 transition hover:bg-brand-50"
                title="Editar contacto"
              >
                ✏️
              </button>
            )}
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {isEditing && editingStage === "contacto" ? (
              <>
                <EditableField
                  label="Personas contactadas por primera vez"
                  value={metrics.firstTimeContacts || 0}
                  type="number"
                  size="md"
                  onSave={(value) => {
                    const numValue = Number(value);
                    setMetrics({ ...metrics, firstTimeContacts: numValue });
                    onUpdate?.("firstTimeContacts", numValue);
                    handleCancel();
                  }}
                />
                <EditableField
                  label="Interesadas en el evangelio"
                  value={metrics.interestedInGospel || 0}
                  type="number"
                  size="md"
                  onSave={(value) => {
                    const numValue = Number(value);
                    setMetrics({ ...metrics, interestedInGospel: numValue });
                    onUpdate?.("interestedInGospel", numValue);
                    handleCancel();
                  }}
                />
                <EditableField
                  label="Escucharon algo del Evangelio"
                  value={metrics.heardGospel || 0}
                  type="number"
                  size="md"
                  onSave={(value) => {
                    const numValue = Number(value);
                    setMetrics({ ...metrics, heardGospel: numValue });
                    onUpdate?.("heardGospel", numValue);
                    handleCancel();
                  }}
                />
              </>
            ) : (
              <>
                <div className="rounded-xl border border-sand-200 bg-white/90 p-3">
                  <p className="text-xs font-semibold text-cocoa-500">
                    Personas contactadas por primera vez
                  </p>
                  <p className="mt-1 text-lg font-bold text-brand-600">
                    {metrics.firstTimeContacts || 0}
                  </p>
                </div>
                <div className="rounded-xl border border-sand-200 bg-white/90 p-3">
                  <p className="text-xs font-semibold text-cocoa-500">
                    Interesadas en el evangelio
                  </p>
                  <p className="mt-1 text-lg font-bold text-brand-600">
                    {metrics.interestedInGospel || 0}
                  </p>
                </div>
                <div className="rounded-xl border border-sand-200 bg-white/90 p-3">
                  <p className="text-xs font-semibold text-cocoa-500">
                    Escucharon algo del Evangelio
                  </p>
                  <p className="mt-1 text-lg font-bold text-brand-600">
                    {metrics.heardGospel || 0}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Comunicando */}
        <div className="rounded-2xl border border-sand-200 bg-white/80 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-cocoa-900">Comunicando</h3>
            {!isEditing && (
              <button
                type="button"
                onClick={() => handleStageEdit("comunicando")}
                className="inline-flex items-center justify-center rounded-lg border border-brand-200 bg-white/90 p-1.5 text-xs text-brand-600 transition hover:bg-brand-50"
                title="Editar comunicando"
              >
                ✏️
              </button>
            )}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {isEditing && editingStage === "comunicando" ? (
              <>
                <EditableField
                  label="Creen que están buscando a Dios"
                  value={metrics.seekingGod || 0}
                  type="number"
                  size="md"
                  onSave={(value) => {
                    const numValue = Number(value);
                    setMetrics({ ...metrics, seekingGod: numValue });
                    onUpdate?.("seekingGod", numValue);
                    handleCancel();
                  }}
                />
                <EditableField
                  label="Oportunidad de responder a Cristo"
                  value={metrics.opportunityToRespond || 0}
                  type="number"
                  size="md"
                  onSave={(value) => {
                    const numValue = Number(value);
                    setMetrics({ ...metrics, opportunityToRespond: numValue });
                    onUpdate?.("opportunityToRespond", numValue);
                    handleCancel();
                  }}
                />
              </>
            ) : (
              <>
                <div className="rounded-xl border border-sand-200 bg-white/90 p-3">
                  <p className="text-xs font-semibold text-cocoa-500">
                    Creen que están buscando a Dios
                  </p>
                  <p className="mt-1 text-lg font-bold text-brand-600">
                    {metrics.seekingGod || 0}
                  </p>
                </div>
                <div className="rounded-xl border border-sand-200 bg-white/90 p-3">
                  <p className="text-xs font-semibold text-cocoa-500">
                    Oportunidad de responder a Cristo
                  </p>
                  <p className="mt-1 text-lg font-bold text-brand-600">
                    {metrics.opportunityToRespond || 0}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Respondiendo */}
        <div className="rounded-2xl border border-sand-200 bg-white/80 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-cocoa-900">Respondiendo</h3>
            {!isEditing && (
              <button
                type="button"
                onClick={() => handleStageEdit("respondiendo")}
                className="inline-flex items-center justify-center rounded-lg border border-brand-200 bg-white/90 p-1.5 text-xs text-brand-600 transition hover:bg-brand-50"
                title="Editar respondiendo"
              >
                ✏️
              </button>
            )}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {isEditing && editingStage === "respondiendo" ? (
              <>
                <EditableField
                  label="Creyeron el mensaje"
                  value={metrics.believedMessage || 0}
                  type="number"
                  size="md"
                  onSave={(value) => {
                    const numValue = Number(value);
                    setMetrics({ ...metrics, believedMessage: numValue });
                    onUpdate?.("believedMessage", numValue);
                    handleCancel();
                  }}
                />
                <EditableField
                  label="Fueron bautizados"
                  value={metrics.baptized || 0}
                  type="number"
                  size="md"
                  onSave={(value) => {
                    const numValue = Number(value);
                    setMetrics({ ...metrics, baptized: numValue });
                    onUpdate?.("baptized", numValue);
                    handleCancel();
                  }}
                />
              </>
            ) : (
              <>
                <div className="rounded-xl border border-sand-200 bg-white/90 p-3">
                  <p className="text-xs font-semibold text-cocoa-500">Creyeron el mensaje</p>
                  <p className="mt-1 text-lg font-bold text-emerald-600">
                    {metrics.believedMessage || 0}
                  </p>
                </div>
                <div className="rounded-xl border border-sand-200 bg-white/90 p-3">
                  <p className="text-xs font-semibold text-cocoa-500">Fueron bautizados</p>
                  <p className="mt-1 text-lg font-bold text-emerald-600">
                    {metrics.baptized || 0}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Consolidando */}
        <div className="rounded-2xl border border-sand-200 bg-white/80 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-cocoa-900">Consolidando</h3>
            {!isEditing && (
              <button
                type="button"
                onClick={() => handleStageEdit("consolidando")}
                className="inline-flex items-center justify-center rounded-lg border border-brand-200 bg-white/90 p-1.5 text-xs text-brand-600 transition hover:bg-brand-50"
                title="Editar consolidando"
              >
                ✏️
              </button>
            )}
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {isEditing && editingStage === "consolidando" ? (
              <>
                <EditableField
                  label="Estudios bíblicos regulares"
                  value={metrics.regularBibleStudies || 0}
                  type="number"
                  size="md"
                  onSave={(value) => {
                    const numValue = Number(value);
                    setMetrics({ ...metrics, regularBibleStudies: numValue });
                    onUpdate?.("regularBibleStudies", numValue);
                    handleCancel();
                  }}
                />
                <EditableField
                  label="Mentoreadas personalmente"
                  value={metrics.personallyMentored || 0}
                  type="number"
                  size="md"
                  onSave={(value) => {
                    const numValue = Number(value);
                    setMetrics({ ...metrics, personallyMentored: numValue });
                    onUpdate?.("personallyMentored", numValue);
                    handleCancel();
                  }}
                />
                <EditableField
                  label="Grupos nuevos (este año)"
                  value={metrics.newGroupsThisYear || 0}
                  type="number"
                  size="md"
                  onSave={(value) => {
                    const numValue = Number(value);
                    setMetrics({ ...metrics, newGroupsThisYear: numValue });
                    onUpdate?.("newGroupsThisYear", numValue);
                    handleCancel();
                  }}
                />
              </>
            ) : (
              <>
                <div className="rounded-xl border border-sand-200 bg-white/90 p-3">
                  <p className="text-xs font-semibold text-cocoa-500">
                    Estudios bíblicos regulares
                  </p>
                  <p className="mt-1 text-lg font-bold text-brand-600">
                    {metrics.regularBibleStudies || 0}
                  </p>
                </div>
                <div className="rounded-xl border border-sand-200 bg-white/90 p-3">
                  <p className="text-xs font-semibold text-cocoa-500">
                    Mentoreadas personalmente
                  </p>
                  <p className="mt-1 text-lg font-bold text-brand-600">
                    {metrics.personallyMentored || 0}
                  </p>
                </div>
                <div className="rounded-xl border border-sand-200 bg-white/90 p-3">
                  <p className="text-xs font-semibold text-cocoa-500">
                    Grupos nuevos (este año)
                  </p>
                  <p className="mt-1 text-lg font-bold text-brand-600">
                    {metrics.newGroupsThisYear || 0}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Liderazgo */}
        <div className="rounded-2xl border border-sand-200 bg-white/80 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-cocoa-900">Liderazgo</h3>
            {!isEditing && (
              <button
                type="button"
                onClick={() => handleStageEdit("liderazgo")}
                className="inline-flex items-center justify-center rounded-lg border border-brand-200 bg-white/90 p-1.5 text-xs text-brand-600 transition hover:bg-brand-50"
                title="Editar liderazgo"
              >
                ✏️
              </button>
            )}
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {isEditing && editingStage === "liderazgo" ? (
              <>
                <EditableField
                  label="Entrenamiento ministerial práctico"
                  value={metrics.ministerialTraining || 0}
                  type="number"
                  size="md"
                  onSave={(value) => {
                    const numValue = Number(value);
                    setMetrics({ ...metrics, ministerialTraining: numValue });
                    onUpdate?.("ministerialTraining", numValue);
                    handleCancel();
                  }}
                />
                <EditableField
                  label="Entrenamiento en otras áreas"
                  value={metrics.otherAreasTraining || 0}
                  type="number"
                  size="md"
                  onSave={(value) => {
                    const numValue = Number(value);
                    setMetrics({ ...metrics, otherAreasTraining: numValue });
                    onUpdate?.("otherAreasTraining", numValue);
                    handleCancel();
                  }}
                />
                <EditableField
                  label="Entrenamiento pastoral práctico"
                  value={metrics.pastoralTraining || 0}
                  type="number"
                  size="md"
                  onSave={(value) => {
                    const numValue = Number(value);
                    setMetrics({ ...metrics, pastoralTraining: numValue });
                    onUpdate?.("pastoralTraining", numValue);
                    handleCancel();
                  }}
                />
                <EditableField
                  label="Entrenamiento bíblico"
                  value={metrics.biblicalTraining || 0}
                  type="number"
                  size="md"
                  onSave={(value) => {
                    const numValue = Number(value);
                    setMetrics({ ...metrics, biblicalTraining: numValue });
                    onUpdate?.("biblicalTraining", numValue);
                    handleCancel();
                  }}
                />
                <EditableField
                  label="Entrenamiento para comenzar iglesias"
                  value={metrics.churchPlantingTraining || 0}
                  type="number"
                  size="md"
                  onSave={(value) => {
                    const numValue = Number(value);
                    setMetrics({ ...metrics, churchPlantingTraining: numValue });
                    onUpdate?.("churchPlantingTraining", numValue);
                    handleCancel();
                  }}
                />
              </>
            ) : (
              <>
                <div className="rounded-xl border border-sand-200 bg-white/90 p-3">
                  <p className="text-xs font-semibold text-cocoa-500">
                    Entrenamiento ministerial práctico
                  </p>
                  <p className="mt-1 text-lg font-bold text-brand-600">
                    {metrics.ministerialTraining || 0}
                  </p>
                </div>
                <div className="rounded-xl border border-sand-200 bg-white/90 p-3">
                  <p className="text-xs font-semibold text-cocoa-500">
                    Entrenamiento en otras áreas
                  </p>
                  <p className="mt-1 text-lg font-bold text-brand-600">
                    {metrics.otherAreasTraining || 0}
                  </p>
                </div>
                <div className="rounded-xl border border-sand-200 bg-white/90 p-3">
                  <p className="text-xs font-semibold text-cocoa-500">
                    Entrenamiento pastoral práctico
                  </p>
                  <p className="mt-1 text-lg font-bold text-brand-600">
                    {metrics.pastoralTraining || 0}
                  </p>
                </div>
                <div className="rounded-xl border border-sand-200 bg-white/90 p-3">
                  <p className="text-xs font-semibold text-cocoa-500">Entrenamiento bíblico</p>
                  <p className="mt-1 text-lg font-bold text-brand-600">
                    {metrics.biblicalTraining || 0}
                  </p>
                </div>
                <div className="rounded-xl border border-sand-200 bg-white/90 p-3">
                  <p className="text-xs font-semibold text-cocoa-500">
                    Entrenamiento para comenzar iglesias
                  </p>
                  <p className="mt-1 text-lg font-bold text-brand-600">
                    {metrics.churchPlantingTraining || 0}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

