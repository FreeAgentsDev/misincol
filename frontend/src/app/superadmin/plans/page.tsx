import Link from "next/link";
import { loadTeams } from "@/lib/mock-data";
import { PlanStatus } from "@/lib/types";

interface Props {
  searchParams?: Record<string, string | string[] | undefined>;
}

export default async function SuperAdminPlans({ searchParams }: Props) {
  const teams = await loadTeams();

  let plans = teams.flatMap((team) =>
    team.plans.map((plan) => ({
      ...plan,
      teamName: team.name,
      teamId: team.id
    }))
  );

  // El historial NO debe incluir planes activos, solo finalizados y archivados
  plans = plans.filter((plan) => plan.status !== "Activo");

  // Filtrar por estado si se proporciona (solo Finalizado o Archivado)
  const statusFilter = typeof searchParams?.status === "string" ? searchParams.status : undefined;
  if (statusFilter) {
    plans = plans.filter((plan) => plan.status === (statusFilter as PlanStatus));
  }

  return (
    <section className="space-y-8">
      <header className="space-y-3">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-500">
            Seguimiento
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-cocoa-900">
            Historial de planes de desarrollo
          </h1>
        </div>
        <div className="flex items-center justify-between">
          <p className="max-w-3xl text-sm leading-6 text-cocoa-600">
            Consulta los planes finalizados y archivados para todos los equipos. Esta vista
            sirve como punto de partida para duplicar planes o analizar la evolución de cada equipo.
          </p>
          {statusFilter && (
            <Link
              href="/superadmin/plans"
              className="text-xs font-semibold text-cocoa-500 transition hover:text-cocoa-700"
            >
              Ver todos los planes
            </Link>
          )}
        </div>
      </header>

      <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-soft">
        <table className="min-w-full divide-y divide-sand-100 text-sm text-cocoa-700">
          <thead className="bg-sand-50/80 text-xs font-semibold uppercase tracking-wide text-cocoa-500">
            <tr>
              <th className="px-6 py-4 text-left">Plan</th>
              <th className="px-6 py-4 text-left">Equipo</th>
              <th className="px-6 py-4 text-left">Periodo</th>
              <th className="px-6 py-4 text-left">Estado</th>
              <th className="px-6 py-4 text-left">Actividades</th>
              <th className="px-6 py-4 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-100">
            {plans.map((plan) => (
              <tr key={plan.id} className="transition hover:bg-brand-50/40">
                <td className="px-6 py-4">
                  <div className="text-sm font-semibold text-cocoa-900">{plan.name}</div>
                  <p className="mt-1 text-xs text-cocoa-500">{plan.summary}</p>
                </td>
                <td className="px-6 py-4 text-cocoa-600">{plan.teamName}</td>
                <td className="px-6 py-4 text-cocoa-600">
                  {plan.startDate} → {plan.endDate}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center rounded-full border border-sand-200 bg-sand-50/80 px-3 py-1 text-xs font-semibold text-cocoa-600">
                    {plan.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-cocoa-600">{plan.activities.length}</td>
                <td className="px-6 py-4">
                  <Link
                    href={`/superadmin/plans/${plan.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 transition hover:text-brand-500"
                  >
                    <span>Ver vista general</span>
                    <span>→</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

