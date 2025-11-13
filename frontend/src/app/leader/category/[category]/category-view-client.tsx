"use client";

import { useState, useEffect } from "react";
import { Activity, AreaObjective, PlanCategory, Team, DevelopmentPlan, Member, ActivityStage } from "@/lib/types";
import { ObjectiveModal } from "@/components/ui/objective-modal";
import { ActivityModal } from "@/components/ui/activity-modal";

// Estados de actividades en orden
const STAGES: ActivityStage[] = ["Contacto", "Comunicar"];

interface Props {
  team: Team;
  activePlan: DevelopmentPlan;
  categoryName: PlanCategory;
  teamId: string;
}

// Función para calcular semanas entre dos fechas
const calculateWeeks = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.ceil(diffDays / 7);
};

// Función para calcular semanas restantes
const calculateRemainingWeeks = (endDate: string): number => {
  const end = new Date(endDate);
  const now = new Date();
  if (end < now) return 0;
  const diffTime = Math.abs(end.getTime() - now.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.ceil(diffDays / 7);
};

export function CategoryViewClient({ team, activePlan, categoryName, teamId }: Props) {
  const [objectives, setObjectives] = useState<AreaObjective[]>(() => {
    // Inicializar objetivos desde el plan para esta categoría específica
    if (activePlan.objectives && activePlan.objectives.length > 0) {
      return activePlan.objectives.filter(obj => obj.category === categoryName);
    }
    // Si no hay objetivos en el plan, buscar en todas las actividades de esta categoría
    // Buscar en todas las actividades del plan que puedan estar relacionadas con esta categoría
    const allActivities = activePlan.activities || [];
    const categoryActivities = allActivities.filter(a => {
      // Si la actividad tiene área que coincide con la categoría, o si no tiene área definida pero el plan es de esta categoría
      return a.area === categoryName || (!a.area && activePlan.category === categoryName);
    });
    
    const uniqueObjectives = Array.from(
      new Set(categoryActivities.map(a => a.objective).filter(Boolean))
    );
    
    return uniqueObjectives.map((desc, index) => ({
      id: `obj-${categoryName}-${index + 1}`,
      planId: activePlan.id,
      category: categoryName,
      description: desc as string,
      order: index + 1
    }));
  });

  const [activities, setActivities] = useState<Activity[]>(() => {
    // Filtrar actividades por categoría/área, no solo por la categoría del plan
    const allActivities = activePlan.activities || [];
    return allActivities
      .filter(a => {
        // Mostrar actividades que pertenezcan a esta categoría
        // Puede ser por área o por la categoría del plan si coincide
        return a.area === categoryName || (!a.area && activePlan.category === categoryName);
      })
      .map(a => ({
        ...a,
        stage: (a.stage && STAGES.includes(a.stage as ActivityStage)) 
          ? a.stage 
          : "Contacto", // Inicializar con "Contacto" si no tiene estado válido
        area: a.area || categoryName // Asegurar que tenga el área correcta
      }));
  });

  const [isObjectiveModalOpen, setIsObjectiveModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [editingObjective, setEditingObjective] = useState<AreaObjective | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    message: string;
    onConfirm: () => void;
  }>({ show: false, message: "", onConfirm: () => {} });

  // Calcular total de presupuesto
  const totalBudget = activities.reduce((sum, activity) => sum + activity.budgetTotal, 0);

  // Obtener miembros disponibles
  const members = team.members.map(m => m.name);

  const handleCreateObjective = () => {
    setEditingObjective(null);
    setIsObjectiveModalOpen(true);
  };

  const handleEditObjective = (objective: AreaObjective) => {
    setEditingObjective(objective);
    setIsObjectiveModalOpen(true);
  };

  const handleDeleteObjective = (objectiveId: string) => {
    setConfirmDialog({
      show: true,
      message: "¿Estás seguro de que quieres eliminar este objetivo?",
      onConfirm: () => {
        setObjectives(objectives.filter(obj => obj.id !== objectiveId));
        // También eliminar actividades asociadas
        setActivities(activities.filter(a => a.objectiveId !== objectiveId));
        setConfirmDialog({ show: false, message: "", onConfirm: () => {} });
      }
    });
  };

  const handleSaveObjective = (objectiveData: Omit<AreaObjective, "id"> | AreaObjective) => {
    if (editingObjective) {
      // Editar objetivo existente
      setObjectives(objectives.map(obj => 
        obj.id === editingObjective.id 
          ? { ...obj, ...objectiveData } as AreaObjective 
          : obj
      ));
    } else {
      // Crear nuevo objetivo
      const newObjective: AreaObjective = {
        ...objectiveData,
        id: `obj-${Date.now()}`,
        order: objectives.length + 1
      } as AreaObjective;
      setObjectives([...objectives, newObjective]);
    }
    setIsObjectiveModalOpen(false);
    setEditingObjective(null);
  };

  const handleCreateActivity = () => {
    if (objectives.length === 0) {
      setAlertMessage("Primero debes crear al menos un objetivo para poder crear actividades.");
      setTimeout(() => setAlertMessage(null), 5000);
      return;
    }
    setEditingActivity(null);
    setIsActivityModalOpen(true);
  };

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setIsActivityModalOpen(true);
  };

  const handleDeleteActivity = (activityId: string) => {
    setConfirmDialog({
      show: true,
      message: "¿Estás seguro de que quieres eliminar esta actividad?",
      onConfirm: () => {
        setActivities(activities.filter(a => a.id !== activityId));
        setConfirmDialog({ show: false, message: "", onConfirm: () => {} });
      }
    });
  };

  // Función para cambiar al siguiente estado
  const handleNextStage = (activityId: string) => {
    setActivities(activities.map(activity => {
      if (activity.id === activityId) {
        // Normalizar el stage actual (asegurar que sea válido)
        const currentStage = activity.stage as ActivityStage;
        let currentIndex = STAGES.indexOf(currentStage);
        
        // Si el estado actual no está en la lista o está vacío, establecer como "Contacto"
        if (currentIndex < 0 || !currentStage || currentStage === "") {
          currentIndex = 0;
        }
        
        // Avanzar al siguiente estado
        let nextIndex = currentIndex + 1;
        
        // Si ya está en el último estado, volver al primero (circular)
        if (nextIndex >= STAGES.length) {
          nextIndex = 0;
        }
        
        const nextStage = STAGES[nextIndex];
        
        return {
          ...activity,
          stage: nextStage
        };
      }
      return activity;
    }));
  };

  const handleSaveActivity = (activityData: Partial<Activity>) => {
    if (editingActivity) {
      // Editar - asegurar que mantenga la categoría actual
      setActivities(activities.map(a => 
        a.id === editingActivity.id 
          ? { 
              ...a, 
              ...activityData,
              area: categoryName, // Siempre usar la categoría actual
              stage: (activityData.stage && STAGES.includes(activityData.stage as ActivityStage))
                ? activityData.stage
                : a.stage || "Contacto"
            } as Activity 
          : a
      ));
    } else {
      // Crear - asegurar que use la categoría actual
      const newActivity: Activity = {
        id: `act-${categoryName}-${Date.now()}`,
        teamId: team.id,
        planId: activePlan.id,
        objectiveId: activityData.objectiveId || "",
        name: activityData.name || "",
        responsable: activityData.responsable || "",
        budgetTotal: activityData.budgetTotal || 0,
        budgetLiquidated: activityData.budgetLiquidated || 0,
        status: activityData.status || "Pendiente",
        stage: (activityData.stage && STAGES.includes(activityData.stage as ActivityStage))
          ? activityData.stage
          : "Contacto",
        area: categoryName, // Siempre usar la categoría actual
        objective: objectives.find(obj => obj.id === activityData.objectiveId)?.description || "",
        description: activityData.description || "",
        currentSituation: activityData.currentSituation || "",
        goalMid: activityData.goalMid || "",
        goalLong: activityData.goalLong || "",
        frequency: activityData.frequency || "",
        timesPerYear: activityData.timesPerYear || 0,
        startDate: activityData.startDate || activePlan.startDate,
        endDate: activityData.endDate || activePlan.endDate,
        totalWeeks: activityData.startDate && activityData.endDate 
          ? calculateWeeks(activityData.startDate, activityData.endDate) 
          : 0,
        remainingWeeks: activityData.endDate 
          ? calculateRemainingWeeks(activityData.endDate) 
          : 0,
        obstacles: activityData.obstacles || ""
      };
      setActivities([...activities, newActivity]);
    }
    setIsActivityModalOpen(false);
    setEditingActivity(null);
  };

  return (
    <>
      {/* Alerta flotante en la parte inferior */}
      {alertMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-lg w-full px-4">
          <div className="relative overflow-hidden rounded-2xl border-2 border-brand-400/90 bg-gradient-to-br from-brand-50 to-brand-100/90 backdrop-blur-md px-5 py-4 shadow-[0_10px_40px_rgba(0,0,0,0.2)]">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-200/30 to-transparent pointer-events-none" />
            <div className="relative flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-400/30 flex items-center justify-center ring-2 ring-brand-300/50">
                <span className="text-brand-700 text-lg">i</span>
              </div>
              <p className="text-sm font-semibold text-brand-900 flex-1">
                {alertMessage}
              </p>
              <button
                type="button"
                onClick={() => setAlertMessage(null)}
                className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-300/30 hover:bg-brand-400/40 flex items-center justify-center text-brand-700 hover:text-brand-900 transition-all"
              >
                <span className="text-base font-bold leading-none">×</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación */}
      {confirmDialog.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl border-2 border-brand-300/80 bg-white/95 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-50/50 to-transparent pointer-events-none rounded-2xl" />
            <div className="relative p-6 space-y-5">
              <div className="text-center">
                <h3 className="text-lg font-bold text-cocoa-900 mb-2">
                  Confirmar acción
                </h3>
                <p className="text-sm text-cocoa-700">
                  {confirmDialog.message}
                </p>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setConfirmDialog({ show: false, message: "", onConfirm: () => {} })}
                  className="px-5 py-2.5 rounded-xl border-2 border-sand-200 bg-white/70 text-sm font-semibold text-cocoa-700 hover:bg-sand-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmDialog.onConfirm}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-sm font-bold text-white shadow-lg hover:from-brand-500 hover:to-brand-400 transition-all"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="space-y-8">
        {/* Título de la vista */}
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-cocoa-900">
            {categoryName}
          </h1>
        </header>

        {/* Header con información del equipo y plan */}
      <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-soft">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">Fecha inicio</p>
            <p className="text-sm font-semibold text-cocoa-900">{activePlan.startDate}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">Equipo</p>
            <p className="text-sm font-semibold text-cocoa-900">{team.name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">Integrantes</p>
            <p className="text-sm font-semibold text-cocoa-900">{team.members.length} miembros</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">Área</p>
            <p className="text-sm font-semibold text-cocoa-900">{categoryName}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">Líder de equipo</p>
            <p className="text-sm font-semibold text-cocoa-900">{team.leader}</p>
          </div>
        </div>
      </div>

      {/* Objetivos de área */}
      <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-cocoa-900">Objetivos de área</h2>
          <button
            onClick={handleCreateObjective}
            type="button"
            className="inline-flex items-center gap-2 rounded-2xl border border-brand-200 bg-brand-50/70 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-100 hover:text-brand-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200/70"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Crear objetivo</span>
          </button>
        </div>
        <div className="space-y-4">
          {objectives.length > 0 ? (
            objectives.map((objective, index) => (
              <div 
                key={objective.id} 
                className="group relative flex items-start gap-4 rounded-xl border border-sand-200 bg-white/80 p-4 transition hover:border-brand-300 hover:shadow-sm"
              >
                <div className="flex-1 space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                    Objetivo de área #{index + 1}
                  </p>
                  <p className="text-sm text-cocoa-700">{objective.description}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => handleEditObjective(objective)}
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-600 transition hover:bg-brand-50 hover:border-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200 active:scale-95"
                    title="Editar objetivo"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="h-3.5 w-3.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                      />
                    </svg>
                    <span className="hidden sm:inline">Editar</span>
                  </button>
                  <button
                    onClick={() => handleDeleteObjective(objective.id)}
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 hover:border-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 active:scale-95"
                    title="Eliminar objetivo"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="h-3.5 w-3.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                      />
                    </svg>
                    <span className="hidden sm:inline">Eliminar</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-sand-300 bg-sand-50/50 p-8 text-center">
              <p className="text-sm font-medium text-cocoa-600">No hay objetivos creados</p>
              <p className="mt-1 text-xs text-cocoa-500">Crea un objetivo para comenzar a gestionar esta categoría</p>
            </div>
          )}
        </div>
      </div>

      {/* Botón para crear actividad */}
      <div className="flex justify-end">
        <button
          onClick={handleCreateActivity}
          className="inline-flex items-center gap-2 rounded-2xl border border-brand-200 bg-brand-50/70 px-5 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-100 hover:text-brand-800"
        >
          <span>+</span>
          <span>Crear actividad</span>
        </button>
      </div>

      {/* Grid de actividades */}
      {activities.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activities.map((activity) => {
              const totalWeeks = calculateWeeks(activity.startDate, activity.endDate);
              const remainingWeeks = calculateRemainingWeeks(activity.endDate);
              const unitBudget = activity.timesPerYear > 0 
                ? activity.budgetTotal / activity.timesPerYear 
                : activity.budgetTotal;

              return (
                <div
                  key={activity.id}
                  className="group relative rounded-2xl border border-sand-200 bg-white/80 p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md"
                >
                  {/* Header con título y estado */}
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-cocoa-900 line-clamp-2 leading-tight">
                        {activity.name}
                      </h3>
                      {activity.description && (
                        <p className="mt-1 text-xs text-cocoa-500 line-clamp-1">
                          {activity.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleNextStage(activity.id)}
                      type="button"
                      className={`shrink-0 inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all hover:scale-105 hover:shadow-md active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 cursor-pointer ${
                        activity.stage === "Contacto"
                          ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 focus-visible:ring-blue-200"
                          : activity.stage === "Comunicar"
                          ? "border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 focus-visible:ring-purple-200"
                          : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 focus-visible:ring-blue-200"
                      }`}
                      title={`Estado: ${activity.stage || "Contacto"}. Click para cambiar al siguiente estado.`}
                    >
                      {activity.stage || "Contacto"}
                    </button>
                  </div>

                  {/* Información principal en 3 líneas */}
                  <div className="space-y-3">
                    {/* Línea 1: Responsable y Frecuencia */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-cocoa-500">Responsable:</span>
                        <span className="font-medium text-cocoa-700">{activity.responsable || "-"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-cocoa-500">{activity.frequency || "-"}</span>
                        <span className="text-xs text-cocoa-400">·</span>
                        <span className="text-xs text-cocoa-500">{activity.timesPerYear || 0} veces/año</span>
                      </div>
                    </div>

                    {/* Línea 2: Fechas y Semanas */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-cocoa-500">Inicio:</span>
                          <span className="text-xs text-cocoa-600">{activity.startDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-cocoa-500">Final:</span>
                          <span className="text-xs text-cocoa-600">{activity.endDate}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <div className="text-center">
                          <div className="font-semibold text-cocoa-500">SEM</div>
                          <div className="font-bold text-cocoa-700">{totalWeeks}</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-cocoa-500">REST</div>
                          <div className="font-bold text-cocoa-700">{remainingWeeks}</div>
                        </div>
                      </div>
                    </div>

                    {/* Línea 3: Presupuesto */}
                    <div className="flex items-center justify-between border-t border-sand-200 pt-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-cocoa-500">Presupuesto unitario</span>
                        <span className="text-sm font-medium text-cocoa-600">
                          {unitBudget.toLocaleString("es-CO", {
                            style: "currency",
                            currency: "COP",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          })}
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs font-semibold text-cocoa-500">Total</span>
                        <span className="text-base font-bold text-brand-700">
                          {activity.budgetTotal.toLocaleString("es-CO", {
                            style: "currency",
                            currency: "COP",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="mt-4 flex items-center justify-end gap-2 border-t border-sand-200 pt-3">
                    <button
                      onClick={() => handleEditActivity(activity)}
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-600 transition hover:bg-brand-50 hover:border-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200 active:scale-95"
                      title="Editar actividad"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="h-3.5 w-3.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                        />
                      </svg>
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => handleDeleteActivity(activity.id)}
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 hover:border-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 active:scale-95"
                      title="Eliminar actividad"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="h-3.5 w-3.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                        />
                      </svg>
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total de presupuesto */}
          <div className="rounded-2xl border border-brand-200 bg-brand-50/30 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-cocoa-600">Total presupuesto:</span>
              <span className="text-xl font-bold text-brand-700">
                {totalBudget.toLocaleString("es-CO", {
                  style: "currency",
                  currency: "COP",
                  maximumFractionDigits: 0
                })}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-[2rem] border border-dashed border-sand-200 bg-white/70 p-12 text-center">
          <p className="text-sm font-semibold text-cocoa-600">
            No hay actividades en la categoría {categoryName} para el plan activo.
          </p>
          <p className="mt-2 text-xs text-cocoa-500">
            Crea actividades para comenzar a gestionar esta categoría.
          </p>
        </div>
      )}

      {/* Modales */}
      <ObjectiveModal
        isOpen={isObjectiveModalOpen}
        onClose={() => {
          setIsObjectiveModalOpen(false);
          setEditingObjective(null);
        }}
        onSave={handleSaveObjective}
        objective={editingObjective}
        category={categoryName}
        planId={activePlan.id}
      />

      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => {
          setIsActivityModalOpen(false);
          setEditingActivity(null);
        }}
        onSave={handleSaveActivity}
        activity={editingActivity}
        objectives={objectives}
        members={members}
        planStartDate={activePlan.startDate}
        planEndDate={activePlan.endDate}
        category={categoryName}
      />
      </section>
    </>
  );
}

