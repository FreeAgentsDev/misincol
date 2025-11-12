"use client";

import { useState } from "react";
import Link from "next/link";
import { PlanCategory, Activity } from "@/lib/types";
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
  plan: {
    id: string;
    name: string;
    category: string;
    status: string;
    startDate: string;
    endDate: string;
    summary: string;
    activities: Activity[];
  };
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

  return (
    <>
      <section className="space-y-9">
        <header className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-500">
                PLAN DE DESARROLLO MINISTERIAL (PDM)
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-cocoa-900">
                {plan.name}
              </h1>
            </div>
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

        <div className="card-elevated overflow-hidden">
          <PlanAreasTabs
            areas={availableAreas}
            selectedArea={selectedArea}
            onAreaChange={setSelectedArea}
          />
          
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-cocoa-900">
                Indicador de resultado - {selectedArea}
              </h2>
              <span className="rounded-full border border-sand-200 bg-sand-50/80 px-3 py-1 text-xs font-semibold text-cocoa-600">
                {plan.activities?.filter((a) => a.area === selectedArea).length || 0}{" "}
                {plan.activities?.filter((a) => a.area === selectedArea).length === 1
                  ? "actividad"
                  : "actividades"}
              </span>
            </div>
            
            <PlanActivitiesTable
              activities={plan.activities || []}
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

