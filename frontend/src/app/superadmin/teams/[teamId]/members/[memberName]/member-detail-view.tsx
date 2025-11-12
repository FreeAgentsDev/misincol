"use client";

import Link from "next/link";
import { Member, Activity, Team, DevelopmentPlan } from "@/lib/types";

interface Props {
  member: Member;
  team: Team;
  activities: Activity[];
  activePlan: DevelopmentPlan | undefined;
}

export function MemberDetailView({ member, team, activities, activePlan }: Props) {
  const doneActivities = activities.filter((a) => a.status === "Hecha");
  const pendingActivities = activities.filter((a) => a.status === "Pendiente");

  // Agrupar actividades por área
  const activitiesByArea: Record<string, Activity[]> = {};
  activities.forEach((activity) => {
    if (!activitiesByArea[activity.area]) {
      activitiesByArea[activity.area] = [];
    }
    activitiesByArea[activity.area].push(activity);
  });

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-500">
            Detalles del miembro
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-cocoa-900">{member.name}</h2>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full border border-sand-200 bg-sand-50/80 px-3 py-1 text-cocoa-600">
            Rol: {member.role}
          </span>
          <span className="rounded-full border border-brand-200 bg-brand-50/80 px-3 py-1 text-brand-600">
            {activities.length} {activities.length === 1 ? "actividad asignada" : "actividades asignadas"}
          </span>
        </div>
      </header>

      {/* Información básica */}
      <div className="card-elevated">
        <h3 className="text-base font-semibold text-cocoa-900 mb-4">Información básica</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-sand-200 bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">Nombre</p>
            <p className="mt-2 text-sm font-semibold text-cocoa-900">{member.name}</p>
          </div>
          <div className="rounded-2xl border border-sand-200 bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">Rol</p>
            <p className="mt-2 text-sm font-semibold text-cocoa-900">{member.role}</p>
          </div>
          <div className="rounded-2xl border border-sand-200 bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">Equipo</p>
            <p className="mt-2 text-sm font-semibold text-cocoa-900">{team.name}</p>
          </div>
        </div>
      </div>

      {/* Resumen de actividades */}
      <div className="card-elevated">
        <h3 className="text-base font-semibold text-cocoa-900 mb-4">Resumen de actividades</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-sand-200 bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">
              Total asignadas
            </p>
            <p className="mt-2 text-3xl font-bold text-cocoa-900">{activities.length}</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Completadas
            </p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">{doneActivities.length}</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
              Pendientes
            </p>
            <p className="mt-2 text-3xl font-bold text-amber-600">{pendingActivities.length}</p>
          </div>
        </div>
      </div>

      {/* Actividades por área */}
      {Object.keys(activitiesByArea).length > 0 && (
        <div className="card-elevated">
          <h3 className="text-base font-semibold text-cocoa-900 mb-4">Actividades por área</h3>
          <div className="space-y-6">
            {Object.entries(activitiesByArea).map(([area, areaActivities]) => (
              <div key={area} className="rounded-2xl border border-sand-200 bg-white/80 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-cocoa-900">{area}</h3>
                  <span className="rounded-full border border-sand-200 bg-sand-50/80 px-3 py-1 text-xs font-semibold text-cocoa-600">
                    {areaActivities.length}{" "}
                    {areaActivities.length === 1 ? "actividad" : "actividades"}
                  </span>
                </div>
                <div className="space-y-3">
                  {areaActivities.map((activity) => {
                    const budgetRemaining = activity.budgetTotal - activity.budgetLiquidated;
                    return (
                      <Link
                        key={activity.id}
                        href={`/superadmin/plans/${activePlan?.id}/activities/${activity.id}`}
                        className="block rounded-xl border border-sand-200 bg-white/90 p-4 transition hover:border-brand-200 hover:bg-brand-50/60"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                                  activity.status === "Hecha"
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : "border-amber-200 bg-amber-50 text-amber-700"
                                }`}
                              >
                                {activity.status}
                              </span>
                              {activity.stage && (
                                <span className="text-xs font-medium text-cocoa-500 bg-sand-50 px-2.5 py-1 rounded-full">
                                  {activity.stage}
                                </span>
                              )}
                            </div>
                            <h4 className="text-sm font-semibold text-cocoa-900 mb-1">
                              {activity.name}
                            </h4>
                            {activity.objective && (
                              <p className="text-xs text-cocoa-600 line-clamp-2">{activity.objective}</p>
                            )}
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                          <span className="rounded-full border border-sand-200 bg-sand-50/80 px-2.5 py-1 text-cocoa-600">
                            {activity.startDate} → {activity.endDate}
                          </span>
                          <span className="rounded-full border border-sand-200 bg-sand-50/80 px-2.5 py-1 text-cocoa-600">
                            {activity.frequency}
                          </span>
                          {budgetRemaining > 0 && (
                            <span className="rounded-full border border-amber-200 bg-amber-50/80 px-2.5 py-1 text-amber-600">
                              Presupuesto restante:{" "}
                              {budgetRemaining.toLocaleString("es-CO", {
                                style: "currency",
                                currency: "COP",
                                maximumFractionDigits: 0
                              })}
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista completa de actividades */}
      {activities.length > 0 ? (
        <div className="card-elevated">
          <h3 className="text-base font-semibold text-cocoa-900 mb-4">Todas las actividades</h3>
          <div className="space-y-3">
            {activities.map((activity) => {
              const budgetRemaining = activity.budgetTotal - activity.budgetLiquidated;
              return (
                <Link
                  key={activity.id}
                  href={`/superadmin/plans/${activePlan?.id}/activities/${activity.id}`}
                  className="block rounded-xl border border-sand-200 bg-white/90 p-4 transition hover:border-brand-200 hover:bg-brand-50/60"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                            activity.status === "Hecha"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-amber-200 bg-amber-50 text-amber-700"
                          }`}
                        >
                          {activity.status}
                        </span>
                        <span className="text-xs font-medium text-cocoa-500 bg-sand-50 px-2.5 py-1 rounded-full">
                          {activity.area}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-cocoa-900 mb-1">{activity.name}</h4>
                      {activity.objective && (
                        <p className="text-xs text-cocoa-600 line-clamp-2">{activity.objective}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                    <span className="rounded-full border border-sand-200 bg-sand-50/80 px-2.5 py-1 text-cocoa-600">
                      {activity.startDate} → {activity.endDate}
                    </span>
                    <span className="rounded-full border border-sand-200 bg-sand-50/80 px-2.5 py-1 text-cocoa-600">
                      {activity.frequency}
                    </span>
                    {budgetRemaining > 0 && (
                      <span className="rounded-full border border-amber-200 bg-amber-50/80 px-2.5 py-1 text-amber-600">
                        Presupuesto restante:{" "}
                        {budgetRemaining.toLocaleString("es-CO", {
                          style: "currency",
                          currency: "COP",
                          maximumFractionDigits: 0
                        })}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="card-elevated">
          <div className="rounded-2xl border border-dashed border-sand-200 bg-white/70 p-12 text-center">
            <p className="text-sm text-cocoa-500">No hay actividades asignadas a este miembro</p>
          </div>
        </div>
      )}
    </div>
  );
}

