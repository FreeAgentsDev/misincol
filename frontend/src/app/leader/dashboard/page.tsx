"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useSearchParams } from "next/navigation";
import { getEquipoById, getPlanActivo, getActividadesByPlan, getPlanesByEquipo } from "@/lib/supabase-queries";
import type { DevelopmentPlan, Activity } from "@/lib/types";

export default function LeaderDashboard() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const [team, setTeam] = useState<any>(null);
  const [activePlan, setActivePlan] = useState<DevelopmentPlan | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [allPlans, setAllPlans] = useState<DevelopmentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const teamId = user?.teamId || searchParams?.get("team") || null;

  useEffect(() => {
    async function loadDashboardData() {
      if (authLoading) return;
      
      if (!teamId) {
        setError("No hay equipo asignado a tu usuario. Contacta al administrador.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Cargar equipo
        const teamData = await getEquipoById(teamId);
        if (!teamData) {
          setError("Equipo no encontrado.");
          setLoading(false);
          return;
        }
        setTeam(teamData);

        // Cargar plan activo
        const planActivo = await getPlanActivo(teamId);
        if (planActivo) {
          // Mapear plan activo
          const mappedPlan: DevelopmentPlan = {
            id: planActivo.id,
            teamId: planActivo.id_equipo,
            name: planActivo.nombre,
            category: planActivo.categoria as DevelopmentPlan["category"],
            status: planActivo.estado as DevelopmentPlan["status"],
            startDate: planActivo.fecha_inicio || "",
            endDate: planActivo.fecha_fin || "",
            summary: planActivo.resumen || "",
            activities: [],
          };
          setActivePlan(mappedPlan);

          // Cargar actividades del plan activo
          const actividadesData = await getActividadesByPlan(planActivo.id);
          const mappedActivities: Activity[] = actividadesData.map((a: any) => ({
            id: a.id,
            teamId: a.id_equipo,
            planId: a.id_plan,
            name: a.nombre,
            responsable: a.responsable || "",
            budgetTotal: Number(a.presupuesto_total || 0),
            budgetLiquidated: Number(a.presupuesto_liquidado || 0),
            status: a.estado as "Hecha" | "Pendiente",
            stage: a.etapa || "",
            area: a.area || "",
            objective: a.objetivo || "",
            description: a.descripcion || "",
            currentSituation: a.situacion_actual || "",
            goalMid: a.objetivo_mediano || "",
            goalLong: a.objetivo_largo || "",
            frequency: a.frecuencia || "",
            timesPerYear: Number(a.veces_por_ano || 0),
            startDate: a.fecha_inicio || "",
            endDate: a.fecha_fin || "",
            totalWeeks: Number(a.semanas_totales || 0),
            remainingWeeks: Number(a.semanas_restantes || 0),
            obstacles: a.obstaculos || "",
          }));
          setActivities(mappedActivities);
          mappedPlan.activities = mappedActivities;
          setActivePlan(mappedPlan);
        }

        // Cargar todos los planes del equipo
        const planesData = await getPlanesByEquipo(teamId);
        const mappedPlans: DevelopmentPlan[] = await Promise.all(
          planesData.map(async (p: any) => {
            const planActivities = await getActividadesByPlan(p.id);
            return {
              id: p.id,
              teamId: p.id_equipo,
              name: p.nombre,
              category: p.categoria as DevelopmentPlan["category"],
              status: p.estado as DevelopmentPlan["status"],
              startDate: p.fecha_inicio || "",
              endDate: p.fecha_fin || "",
              summary: p.resumen || "",
              activities: planActivities.map((a: any) => ({
                id: a.id,
                teamId: a.id_equipo,
                planId: a.id_plan,
                name: a.nombre,
                responsable: a.responsable || "",
                budgetTotal: Number(a.presupuesto_total || 0),
                budgetLiquidated: Number(a.presupuesto_liquidado || 0),
                status: a.estado as "Hecha" | "Pendiente",
                stage: a.etapa || "",
                area: a.area || "",
                objective: a.objetivo || "",
                description: a.descripcion || "",
                currentSituation: a.situacion_actual || "",
                goalMid: a.objetivo_mediano || "",
                goalLong: a.objetivo_largo || "",
                frequency: a.frecuencia || "",
                timesPerYear: Number(a.veces_por_ano || 0),
                startDate: a.fecha_inicio || "",
                endDate: a.fecha_fin || "",
                totalWeeks: Number(a.semanas_totales || 0),
                remainingWeeks: Number(a.semanas_restantes || 0),
                obstacles: a.obstaculos || "",
              })),
            };
          })
        );
        setAllPlans(mappedPlans);
      } catch (err) {
        console.error("Error al cargar datos del dashboard:", err);
        setError("Error al cargar los datos. Por favor, intenta nuevamente.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [teamId, authLoading]);

  if (authLoading || loading) {
    return (
      <section className="space-y-8">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 rounded-3xl border border-white/60 bg-white/85 px-6 py-4 text-cocoa-700 shadow-soft backdrop-blur">
            <span className="h-2.5 w-2.5 animate-ping rounded-full bg-brand-500" />
            <span className="text-sm font-medium">Cargando dashboard...</span>
          </div>
        </div>
      </section>
    );
  }

  if (error || !team) {
    return (
      <section className="space-y-6">
        <h1 className="text-3xl font-semibold tracking-tight text-cocoa-900">
          {error || "No hay equipos configurados"}
        </h1>
        <p className="text-sm text-cocoa-600">
          {error || "Aún no se ha vinculado un equipo a este usuario."}
        </p>
      </section>
    );
  }

  // Calcular estadísticas del plan activo
  const pendingActivities = activePlan?.activities.filter(
    (activity) => activity.status === "Pendiente"
  ) || [];
  const doneActivities = activePlan?.activities.filter(
    (activity) => activity.status === "Hecha"
  ) || [];
  const totalActivities = activePlan?.activities.length || 0;
  const progressPercentage = totalActivities > 0 
    ? Math.round((doneActivities.length / totalActivities) * 100) 
    : 0;

  // Obtener áreas únicas con actividades
  const areasWithActivities = activePlan 
    ? Array.from(new Set(activePlan.activities.map(a => a.area).filter(Boolean)))
    : [];

  // Calcular alertas/pendientes destacados
  const upcomingDeadlines = activePlan?.activities
    .filter(a => a.status === "Pendiente" && a.endDate)
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
    .slice(0, 3) || [];

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-cocoa-900">
          Dashboard - Equipo {team.nombre}
        </h1>
        <p className="text-sm text-cocoa-600">
          Resumen general del estado actual del equipo
        </p>
      </header>

      {/* Plan activo - Resumen */}
        {activePlan ? (
        <div className="card-elevated">
          <div className="space-y-6">
                <div className="flex items-center justify-between">
              <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-500">
                    Plan activo
                  </p>
                <h2 className="mt-2 text-2xl font-semibold text-cocoa-900">{activePlan.name}</h2>
                <p className="mt-1 text-sm text-cocoa-600">{activePlan.summary}</p>
              </div>
                  <Link
                href={`/leader/plans/${activePlan.id}?team=${teamId}`}
                className="inline-flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50/70 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-100"
                  >
                <span>Ver detalle completo</span>
                    <span>→</span>
                  </Link>
                </div>

            {/* Métricas principales */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-sand-200 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">
                  Áreas asignadas
                </p>
                <p className="mt-2 text-2xl font-bold text-cocoa-900">
                  {areasWithActivities.length}
                </p>
              </div>
              <div className="rounded-xl border border-sand-200 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">
                  Actividades activas
                </p>
                <p className="mt-2 text-2xl font-bold text-amber-600">
                  {pendingActivities.length}
                </p>
              </div>
              <div className="rounded-xl border border-sand-200 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">
                  Actividades completadas
                </p>
                <p className="mt-2 text-2xl font-bold text-emerald-600">
                  {doneActivities.length}
                </p>
              </div>
              <div className="rounded-xl border border-sand-200 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">
                  Progreso general
                </p>
                <p className="mt-2 text-2xl font-bold text-brand-600">
                  {progressPercentage}%
                </p>
                <div className="mt-2 h-2 w-full rounded-full bg-sand-200">
                  <div
                    className="h-2 rounded-full bg-brand-600 transition-all"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Fechas importantes */}
            <div className="rounded-xl border border-sand-200 bg-sand-50/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-500 mb-3">
                Fechas importantes
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="font-medium text-cocoa-600">Inicio:</span>{" "}
                  <span className="font-semibold text-cocoa-900">{activePlan.startDate}</span>
                </div>
                <div>
                  <span className="font-medium text-cocoa-600">Fin:</span>{" "}
                  <span className="font-semibold text-cocoa-900">{activePlan.endDate}</span>
                </div>
                <div>
                  <span className="font-medium text-cocoa-600">Periodo:</span>{" "}
                  <span className="font-semibold text-cocoa-900">
                    {activePlan.startDate} → {activePlan.endDate}
                </span>
                </div>
              </div>
            </div>

            {/* Alertas y pendientes destacados */}
            {upcomingDeadlines.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-3">
                  Próximos vencimientos
                </p>
                <div className="space-y-2">
                  {upcomingDeadlines.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between rounded-lg border border-amber-200 bg-white/80 px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-semibold text-cocoa-900">{activity.name}</p>
                        <p className="text-xs text-cocoa-500">
                          {activity.area} · {activity.responsable}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-amber-700">
                        {activity.endDate}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            </div>
          </div>
        ) : (
          <div className="card-elevated">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-500">
                  Plan activo
                </p>
                <h2 className="text-xl font-semibold text-cocoa-900">No hay plan activo</h2>
                <p className="text-sm text-cocoa-600">
                  No se ha configurado un plan activo para este equipo.
                </p>
            </div>
            </div>
          </div>
        )}

      {/* Accesos rápidos a planes */}
      {allPlans.length > 0 && (
          <div className="card-elevated">
            <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-cocoa-900">Planes del equipo</h2>
            <Link
              href={`/leader/plans-list?team=${teamId}`}
              className="text-sm font-semibold text-brand-600 transition hover:text-brand-500"
            >
              Ver todos →
            </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {allPlans.map((plan) => {
              const planPending = plan.activities.filter(a => a.status === "Pendiente").length;
              const planDone = plan.activities.filter(a => a.status === "Hecha").length;
              const planTotal = plan.activities.length;
              const planProgress = planTotal > 0 ? Math.round((planDone / planTotal) * 100) : 0;

                return (
                <Link
                  key={plan.id}
                  href={`/leader/plans/${plan.id}?team=${teamId}`}
                  className="block rounded-xl border border-sand-200 bg-white/80 p-5 transition hover:border-brand-200 hover:bg-brand-50/60 hover:shadow-md"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-base font-semibold text-cocoa-900 flex-1">{plan.name}</h3>
                    <span
                      className={`ml-2 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        plan.status === "Activo"
                          ? "bg-brand-50 text-brand-700 border border-brand-200"
                          : plan.status === "Finalizado"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-sand-50 text-cocoa-600 border border-sand-200"
                      }`}
                    >
                      {plan.status}
                    </span>
                    </div>
                  <p className="text-xs text-cocoa-500 mb-3 line-clamp-2">{plan.summary}</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                      <span className="text-cocoa-500">Progreso</span>
                      <span className="font-semibold text-cocoa-900">{planProgress}%</span>
                      </div>
                    <div className="h-1.5 w-full rounded-full bg-sand-200">
                      <div
                        className="h-1.5 rounded-full bg-brand-600 transition-all"
                        style={{ width: `${planProgress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold pt-2">
                      <span className="text-emerald-600">{planDone} completadas</span>
                      <span className="text-amber-600">{planPending} pendientes</span>
                    </div>
                    <div className="text-xs text-cocoa-500 pt-1">
                      {plan.startDate} → {plan.endDate}
                    </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
    </section>
  );
}
