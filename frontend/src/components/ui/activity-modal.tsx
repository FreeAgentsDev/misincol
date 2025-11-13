"use client";

import { useState, useEffect } from "react";
import { Activity, AreaObjective, PlanCategory, ActivityStatus, ActivityStage } from "@/lib/types";
import { Modal } from "@/components/ui/modal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activity: Partial<Activity>) => void;
  activity?: Activity | null;
  objectives: AreaObjective[];
  members: string[];
  planStartDate: string;
  planEndDate: string;
  category: PlanCategory;
}

const statusOptions: ActivityStatus[] = ["Pendiente", "Hecha"];
const stageOptions: ActivityStage[] = ["Contacto", "Comunicar"];
const frequencyOptions = ["Diariamente", "Semanalmente", "Mensualmente", "Trimestralmente", "Anualmente"];

export function ActivityModal({ 
  isOpen, 
  onClose, 
  onSave, 
  activity, 
  objectives, 
  members,
  planStartDate,
  planEndDate,
  category
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Activity>>({
    name: "",
    description: "",
    responsable: "",
    objectiveId: "",
    status: "Pendiente",
    stage: "Contacto",
    area: category,
    currentSituation: "",
    goalMid: "",
    goalLong: "",
    frequency: "",
    timesPerYear: 0,
    startDate: planStartDate,
    endDate: planEndDate,
    budgetTotal: 0,
    budgetLiquidated: 0,
    obstacles: ""
  });

  useEffect(() => {
    if (activity) {
      setFormData({
        name: activity.name,
        description: activity.description,
        responsable: activity.responsable,
        objectiveId: activity.objectiveId || "",
        status: activity.status,
        stage: activity.stage && stageOptions.includes(activity.stage as ActivityStage) 
          ? activity.stage 
          : "Contacto",
        area: activity.area,
        currentSituation: activity.currentSituation,
        goalMid: activity.goalMid,
        goalLong: activity.goalLong,
        frequency: activity.frequency,
        timesPerYear: activity.timesPerYear,
        startDate: activity.startDate,
        endDate: activity.endDate,
        budgetTotal: activity.budgetTotal,
        budgetLiquidated: activity.budgetLiquidated,
        obstacles: activity.obstacles
      });
    } else {
      setFormData({
        name: "",
        description: "",
        responsable: "",
        objectiveId: objectives.length > 0 ? objectives[0].id : "",
        status: "Pendiente",
        stage: "Contacto",
        area: category,
        currentSituation: "",
        goalMid: "",
        goalLong: "",
        frequency: "",
        timesPerYear: 0,
        startDate: planStartDate,
        endDate: planEndDate,
        budgetTotal: 0,
        budgetLiquidated: 0,
        obstacles: ""
      });
    }
  }, [activity, isOpen, objectives, planStartDate, planEndDate, category]);

  useEffect(() => {
    setError(null);
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setError("Por favor ingresa un nombre para la actividad.");
      return;
    }
    if (!formData.objectiveId) {
      setError("Por favor selecciona un objetivo para la actividad.");
      return;
    }
    if (!formData.responsable?.trim()) {
      setError("Por favor selecciona un responsable para la actividad.");
      return;
    }
    setError(null);
    onSave(formData);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={activity ? "Editar actividad" : "Crear actividad"}
      size="large"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="relative overflow-hidden rounded-2xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-50/90 to-amber-100/70 backdrop-blur-sm px-4 py-3 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-200/20 to-transparent pointer-events-none" />
            <div className="relative flex items-center gap-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center ring-2 ring-amber-300/50">
                <span className="text-amber-700 text-sm font-bold">!</span>
              </div>
              <p className="text-xs font-semibold text-amber-900 flex-1">
                {error}
              </p>
              <button
                type="button"
                onClick={() => setError(null)}
                className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-300/30 hover:bg-amber-400/40 flex items-center justify-center text-amber-700 hover:text-amber-900 transition-all"
              >
                <span className="text-xs font-bold leading-none">×</span>
              </button>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-semibold text-cocoa-700">
              Nombre de la actividad *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-2xl border border-sand-200 bg-white/70 px-4 py-3 text-sm text-cocoa-900 shadow-sm outline-none transition focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-200/70"
              placeholder="Nombre de la actividad"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="objectiveId" className="block text-sm font-semibold text-cocoa-700">
              Objetivo *
            </label>
            <select
              id="objectiveId"
              value={formData.objectiveId}
              onChange={(e) => setFormData({ ...formData, objectiveId: e.target.value })}
              className="w-full rounded-2xl border border-sand-200 bg-white/70 px-4 py-3 text-sm text-cocoa-900 shadow-sm outline-none transition focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-200/70"
              required
            >
              <option value="">Selecciona un objetivo</option>
              {objectives.map((obj) => (
                <option key={obj.id} value={obj.id}>
                  {obj.description}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="responsable" className="block text-sm font-semibold text-cocoa-700">
              Responsable *
            </label>
            <select
              id="responsable"
              value={formData.responsable}
              onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
              className="w-full rounded-2xl border border-sand-200 bg-white/70 px-4 py-3 text-sm text-cocoa-900 shadow-sm outline-none transition focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-200/70"
              required
            >
              <option value="">Selecciona un responsable</option>
              {members.map((member) => (
                <option key={member} value={member}>
                  {member}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="status" className="block text-sm font-semibold text-cocoa-700">
              Estado
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as ActivityStatus })}
              className="w-full rounded-2xl border border-sand-200 bg-white/70 px-4 py-3 text-sm text-cocoa-900 shadow-sm outline-none transition focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-200/70"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="stage" className="block text-sm font-semibold text-cocoa-700">
              Etapa
            </label>
            <select
              id="stage"
              value={formData.stage}
              onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
              className="w-full rounded-2xl border border-sand-200 bg-white/70 px-4 py-3 text-sm text-cocoa-900 shadow-sm outline-none transition focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-200/70"
            >
              {stageOptions.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
            <p className="text-xs text-cocoa-500 mt-1">
              También puedes cambiar la etapa haciendo clic en el botón de estado en la tarjeta de la actividad.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="frequency" className="block text-sm font-semibold text-cocoa-700">
              Frecuencia
            </label>
            <select
              id="frequency"
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              className="w-full rounded-2xl border border-sand-200 bg-white/70 px-4 py-3 text-sm text-cocoa-900 shadow-sm outline-none transition focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-200/70"
            >
              <option value="">Selecciona frecuencia</option>
              {frequencyOptions.map((freq) => (
                <option key={freq} value={freq}>
                  {freq}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="timesPerYear" className="block text-sm font-semibold text-cocoa-700">
              Veces por año
            </label>
            <input
              id="timesPerYear"
              type="number"
              min="0"
              value={formData.timesPerYear}
              onChange={(e) => setFormData({ ...formData, timesPerYear: parseInt(e.target.value) || 0 })}
              className="w-full rounded-2xl border border-sand-200 bg-white/70 px-4 py-3 text-sm text-cocoa-900 shadow-sm outline-none transition focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-200/70"
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="startDate" className="block text-sm font-semibold text-cocoa-700">
              Fecha inicio
            </label>
            <input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full rounded-2xl border border-sand-200 bg-white/70 px-4 py-3 text-sm text-cocoa-900 shadow-sm outline-none transition focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-200/70"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="endDate" className="block text-sm font-semibold text-cocoa-700">
              Fecha final
            </label>
            <input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full rounded-2xl border border-sand-200 bg-white/70 px-4 py-3 text-sm text-cocoa-900 shadow-sm outline-none transition focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-200/70"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="budgetTotal" className="block text-sm font-semibold text-cocoa-700">
              Presupuesto total
            </label>
            <input
              id="budgetTotal"
              type="number"
              min="0"
              step="0.01"
              value={formData.budgetTotal}
              onChange={(e) => setFormData({ ...formData, budgetTotal: parseFloat(e.target.value) || 0 })}
              className="w-full rounded-2xl border border-sand-200 bg-white/70 px-4 py-3 text-sm text-cocoa-900 shadow-sm outline-none transition focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-200/70"
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="budgetLiquidated" className="block text-sm font-semibold text-cocoa-700">
              Presupuesto liquidado
            </label>
            <input
              id="budgetLiquidated"
              type="number"
              min="0"
              step="0.01"
              value={formData.budgetLiquidated}
              onChange={(e) => setFormData({ ...formData, budgetLiquidated: parseFloat(e.target.value) || 0 })}
              className="w-full rounded-2xl border border-sand-200 bg-white/70 px-4 py-3 text-sm text-cocoa-900 shadow-sm outline-none transition focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-200/70"
              placeholder="0"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-semibold text-cocoa-700">
            Descripción
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full rounded-2xl border border-sand-200 bg-white/70 px-4 py-3 text-sm text-cocoa-900 shadow-sm outline-none transition focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-200/70"
            placeholder="Descripción de la actividad"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="currentSituation" className="block text-sm font-semibold text-cocoa-700">
            Situación actual
          </label>
          <textarea
            id="currentSituation"
            value={formData.currentSituation}
            onChange={(e) => setFormData({ ...formData, currentSituation: e.target.value })}
            rows={2}
            className="w-full rounded-2xl border border-sand-200 bg-white/70 px-4 py-3 text-sm text-cocoa-900 shadow-sm outline-none transition focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-200/70"
            placeholder="Situación actual"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="goalMid" className="block text-sm font-semibold text-cocoa-700">
              Meta a mediano plazo
            </label>
            <textarea
              id="goalMid"
              value={formData.goalMid}
              onChange={(e) => setFormData({ ...formData, goalMid: e.target.value })}
              rows={2}
              className="w-full rounded-2xl border border-sand-200 bg-white/70 px-4 py-3 text-sm text-cocoa-900 shadow-sm outline-none transition focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-200/70"
              placeholder="Meta a mediano plazo"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="goalLong" className="block text-sm font-semibold text-cocoa-700">
              Meta a largo plazo
            </label>
            <textarea
              id="goalLong"
              value={formData.goalLong}
              onChange={(e) => setFormData({ ...formData, goalLong: e.target.value })}
              rows={2}
              className="w-full rounded-2xl border border-sand-200 bg-white/70 px-4 py-3 text-sm text-cocoa-900 shadow-sm outline-none transition focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-200/70"
              placeholder="Meta a largo plazo"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="obstacles" className="block text-sm font-semibold text-cocoa-700">
            Obstáculos a vencer
          </label>
          <textarea
            id="obstacles"
            value={formData.obstacles}
            onChange={(e) => setFormData({ ...formData, obstacles: e.target.value })}
            rows={2}
            className="w-full rounded-2xl border border-sand-200 bg-white/70 px-4 py-3 text-sm text-cocoa-900 shadow-sm outline-none transition focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-200/70"
            placeholder="Obstáculos a vencer"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-sand-200 bg-white/70 px-5 py-2.5 text-sm font-semibold text-cocoa-700 transition hover:bg-sand-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="rounded-2xl border border-brand-200 bg-brand-50/70 px-5 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-100"
          >
            {activity ? "Guardar cambios" : "Crear actividad"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

