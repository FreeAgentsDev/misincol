"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { PlanCategory, Activity, DevelopmentPlan } from "@/lib/types";
import { PlanAreasTabs } from "@/components/ui/plan-areas-tabs";
import { PlanActivitiesTable } from "@/components/ui/plan-activities-table";

const allAreas: PlanCategory[] = [
  "Investigación",
  "Encarnación",
  "Evangelización",
  "Entrenamiento",
  "Autocuidado"
];

interface Props {
  plan: DevelopmentPlan;
  team: {
    id: string;
    name: string;
  };
  teamId: string;
}

export function LeaderPlanDetailViewClient({ plan, team, teamId }: Props) {
  // Obtener las áreas que tienen actividades
  const areasWithActivities = allAreas.filter((area) =>
    plan.activities?.some((activity) => activity.area === area)
  );
  
  // Si no hay actividades, mostrar todas las áreas
  const availableAreas = areasWithActivities.length > 0 ? areasWithActivities : allAreas;
  
  // Área inicial: la primera con actividades o la primera disponible
  const [selectedArea, setSelectedArea] = useState<PlanCategory>(
    areasWithActivities.length > 0 ? areasWithActivities[0] : allAreas[0]
  );

  // Obtener etapas únicas del plan
  const planStages = useMemo(() => {
    if (plan.stages && plan.stages.length > 0) {
      return plan.stages;
    }
    // Si no hay etapas definidas, obtenerlas de las actividades
    const stagesFromActivities = Array.from(
      new Set(plan.activities?.map(a => a.planStage).filter(Boolean) || [])
    );
    return stagesFromActivities.length > 0 ? stagesFromActivities : [];
  }, [plan]);

  const [selectedStage, setSelectedStage] = useState<string>("");

  // Filtrar actividades por área y etapa
  const filteredActivities = useMemo(() => {
    let filtered = plan.activities?.filter((activity) => activity.area === selectedArea) || [];
    
    if (selectedStage) {
      filtered = filtered.filter((activity) => activity.planStage === selectedStage);
    }
    
    return filtered;
  }, [plan.activities, selectedArea, selectedStage]);

  return (
    <>
      <section className="space-y-9">
        <header className="space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-semibold tracking-tight text-cocoa-900">
              {plan.name}
            </h1>
            <Link
              href={`/leader/dashboard?team=${teamId}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 transition hover:text-brand-500"
            >
              <span>←</span>
              <span>Volver al dashboard</span>
            </Link>
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap gap-4 text-xs font-semibold">
              <div>
                <span className="text-cocoa-500">Fecha inicio:</span>{" "}
                <span className="text-cocoa-900">{plan.startDate}</span>
              </div>
              <div>
                <span className="text-cocoa-500">Equipo:</span>{" "}
                <span className="text-cocoa-900">{team.name}</span>
              </div>
              <div>
                <span className="text-cocoa-500">Periodo:</span>{" "}
                <span className="text-cocoa-900">{plan.startDate} → {plan.endDate}</span>
              </div>
              <div>
                <span className="text-cocoa-500">Estado:</span>{" "}
                <span className="text-cocoa-900">{plan.status}</span>
              </div>
            </div>
            {plan.summary && (
              <p className="max-w-3xl text-sm leading-6 text-cocoa-600">{plan.summary}</p>
            )}
          </div>
        </header>

        {/* Objetivos globales del plan */}
        {plan.objectives && plan.objectives.length > 0 && (
          <div className="card-elevated">
            <h2 className="text-lg font-semibold text-cocoa-900 mb-4">Objetivos globales del plan</h2>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {plan.objectives.map((objective) => (
                <div
                  key={objective.id}
                  className="rounded-xl border border-sand-200 bg-white/80 p-4"
                >
                  <div className="flex items-start gap-3">
                    {objective.objectiveNumber && (
                      <span className="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand-100 text-brand-700 text-sm font-bold">
                        {objective.objectiveNumber}
                      </span>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-cocoa-900">{objective.description}</p>
                      <p className="text-xs text-cocoa-500 mt-1">Área: {objective.category}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card-elevated overflow-hidden">
          <PlanAreasTabs
            areas={availableAreas}
            selectedArea={selectedArea}
            onAreaChange={setSelectedArea}
          />
          
          <div className="p-6">
            <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-cocoa-900">
                  Área: {selectedArea}
                </h2>
                <p className="text-xs text-cocoa-500 mt-1">
                  Plan → Área → Actividades
                </p>
              </div>
              <div className="flex items-center gap-3">
                {planStages.length > 0 && (
                  <select
                    value={selectedStage}
                    onChange={(e) => setSelectedStage(e.target.value)}
                    className="rounded-lg border border-sand-300 bg-white px-3 py-2 text-sm font-medium text-cocoa-900 transition focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                  >
                    <option value="">Todas las etapas</option>
                    {planStages.map((stage) => (
                      <option key={stage} value={stage}>
                        {stage}
                      </option>
                    ))}
                  </select>
                )}
                <span className="rounded-full border border-sand-200 bg-sand-50/80 px-3 py-1 text-xs font-semibold text-cocoa-600">
                  {filteredActivities.length}{" "}
                  {filteredActivities.length === 1 ? "actividad" : "actividades"}
                </span>
              </div>
            </div>
            
            <PlanActivitiesTable
              activities={filteredActivities}
              area={selectedArea}
              planId={plan.id}
              isLeader={true}
              teamId={teamId}
            />
          </div>
        </div>
      </section>
    </>
  );
}

