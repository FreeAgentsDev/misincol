import { loadTeams } from "@/lib/mock-data";

export default async function SuperAdminManage() {
  const teams = await loadTeams();

  return (
    <section className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Gestor de equipos y presupuesto
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-500">
          Vista administrativa para revisar la configuración de cada equipo y simular acciones
          del CRUD completo. Los datos corresponden a la muestra cargada desde{" "}
          <code>mock-data.csv</code>.
        </p>
      </header>

      <div className="space-y-4">
        {teams.map((team) => (
          <div
            key={team.id}
            className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-2xl"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">{team.name}</h2>
                <p className="text-sm font-medium text-slate-500">Líder: {team.leader}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-600">
                  Presupuesto asignado:{" "}
                  {team.budgetAssigned.toLocaleString("es-CO", {
                    style: "currency",
                    currency: "COP",
                    maximumFractionDigits: 0
                  })}
                </span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-600">
                  Liquidado:{" "}
                  {team.budgetLiquidated.toLocaleString("es-CO", {
                    style: "currency",
                    currency: "COP",
                    maximumFractionDigits: 0
                  })}
                </span>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-600">
                  Por liquidar:{" "}
                  {team.budgetPending.toLocaleString("es-CO", {
                    style: "currency",
                    currency: "COP",
                    maximumFractionDigits: 0
                  })}
                </span>
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-600">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Miembros
                </h3>
                <p className="mt-2 leading-6">
                  {team.members.map((member) => `${member.name} (${member.role})`).join(", ")}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-600">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Planes asociados
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {team.plans.map((plan) => (
                    <span
                      key={plan.id}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
                    >
                      {plan.name} · {plan.status}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-xs font-semibold text-slate-500">
              Acciones simuladas: Crear/editar equipo · Asignar líder y miembros · Ajustar
              presupuesto · Crear nuevo plan
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

