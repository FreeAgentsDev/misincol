"use client";

import Link from "next/link";
import { Activity, PlanCategory } from "@/lib/types";

interface PlanActivitiesTableProps {
  activities: Activity[];
  area: PlanCategory;
  planId: string;
  isLeader?: boolean;
  teamId?: string;
}

export function PlanActivitiesTable({ 
  activities, 
  area, 
  planId, 
  isLeader = false,
  teamId 
}: PlanActivitiesTableProps) {
  const areaActivities = activities.filter((activity) => activity.area === area);

  if (areaActivities.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-sand-200 bg-white/70 p-12 text-center">
        <p className="text-sm text-cocoa-500">No hay actividades registradas en esta área</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-sand-200 text-sm">
        <thead className="bg-sand-50/80">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-cocoa-500">
              Estado
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-cocoa-500">
              Nº Objetivo
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-cocoa-500">
              Etapa Plan
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-cocoa-500">
              Etapa Actividad
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-cocoa-500">
              Objetivo
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-cocoa-500">
              Descripción de actividad
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-cocoa-500">
              Situación actual
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-cocoa-500">
              Meta medible
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-cocoa-500">
              Responsable
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-cocoa-500">
              Frecuencia
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-cocoa-500">
              Veces/año
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-cocoa-500">
              Fecha inicio
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-cocoa-500">
              Fecha final
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-cocoa-500">
              Total semanas
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-sand-100 bg-white">
          {areaActivities.map((activity) => {
            const activityUrl = isLeader && teamId
              ? `/leader/plans/${planId}/activities/${activity.id}?team=${teamId}`
              : `/superadmin/plans/${planId}/activities/${activity.id}`;

            return (
              <tr
                key={activity.id}
                className="transition hover:bg-brand-50/30"
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                      activity.status === "Hecha"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-amber-200 bg-amber-50 text-amber-700"
                    }`}
                  >
                    {activity.status}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {activity.objectiveNumber ? (
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand-100 text-brand-700 text-xs font-bold">
                      {activity.objectiveNumber}
                    </span>
                  ) : (
                    <span className="text-xs text-cocoa-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {activity.planStage ? (
                    <span className="text-xs font-medium text-cocoa-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
                      {activity.planStage}
                    </span>
                  ) : (
                    <span className="text-xs text-cocoa-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {activity.stage ? (
                    <span className="text-xs font-medium text-cocoa-600 bg-sand-50 px-2.5 py-1 rounded-full">
                      {activity.stage}
                    </span>
                  ) : (
                    <span className="text-xs text-cocoa-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={activityUrl}
                    className="text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline"
                  >
                    {activity.objective || "-"}
                  </Link>
                </td>
                <td className="px-4 py-3 max-w-xs">
                  <Link
                    href={activityUrl}
                    className="text-sm text-cocoa-900 hover:text-brand-600 hover:underline line-clamp-2"
                  >
                    {activity.name}
                  </Link>
                  {activity.description && (
                    <p className="text-xs text-cocoa-600 mt-1 line-clamp-2">{activity.description}</p>
                  )}
                </td>
                <td className="px-4 py-3 max-w-xs">
                  <p className="text-xs text-cocoa-700 line-clamp-3">{activity.currentSituation || "-"}</p>
                </td>
                <td className="px-4 py-3 max-w-xs">
                  <div className="space-y-1">
                    {activity.goalMid && (
                      <div>
                        <span className="text-xs font-semibold text-cocoa-500">Mediano:</span>
                        <p className="text-xs text-cocoa-700">{activity.goalMid}</p>
                      </div>
                    )}
                    {activity.goalLong && (
                      <div>
                        <span className="text-xs font-semibold text-cocoa-500">Largo:</span>
                        <p className="text-xs text-cocoa-700">{activity.goalLong}</p>
                      </div>
                    )}
                    {!activity.goalMid && !activity.goalLong && <span className="text-xs text-cocoa-400">-</span>}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-xs font-medium text-cocoa-900">{activity.responsable || "-"}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-xs text-cocoa-700">{activity.frequency || "-"}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-xs font-medium text-cocoa-900">{activity.timesPerYear || 0}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-xs text-cocoa-700">{activity.startDate || "-"}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-xs text-cocoa-700">{activity.endDate || "-"}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-xs font-medium text-cocoa-900">{activity.totalWeeks || 0}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}


