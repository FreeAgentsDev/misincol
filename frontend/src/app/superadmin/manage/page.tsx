import Link from "next/link";
import { getEquipos, getPlanesByEquipo, getMiembrosEquipo, getEquipoConLider } from "@/lib/supabase-queries";

export default async function SuperAdminManage() {
  try {
    const equiposData = await getEquipos();
    
    // Enriquecer datos de equipos con planes y miembros
    const teams = await Promise.all(
      equiposData.map(async (equipo) => {
        const [planes, miembros, equipoConLider] = await Promise.all([
          getPlanesByEquipo(equipo.id),
          getMiembrosEquipo(equipo.id),
          getEquipoConLider(equipo.id)
        ]);

        // Obtener nombre del líder
        const leaderName = equipoConLider?.lider?.nombre_completo || 
                          equipoConLider?.lider?.nombre_usuario || 
                          "Sin líder";

        // Calcular presupuesto liquidado y pendiente desde actividades
        let budgetLiquidated = 0;
        let budgetPending = 0;
        
        for (const plan of planes) {
          const { getActividadesByPlan } = await import("@/lib/supabase-queries");
          const actividades = await getActividadesByPlan(plan.id);
          
          actividades.forEach((act: any) => {
            budgetLiquidated += Number(act.presupuesto_liquidado || 0);
            if (act.estado === "Pendiente") {
              budgetPending += Math.max(
                Number(act.presupuesto_total || 0) - Number(act.presupuesto_liquidado || 0),
                0
              );
            }
          });
        }

        return {
          id: equipo.id,
          name: equipo.nombre,
          leader: leaderName,
          members: miembros.map((m: any) => ({
            name: m.perfil?.nombre_completo || m.perfil?.nombre_usuario || "Sin nombre",
            role: m.perfil?.rol || "member"
          })),
          budgetAssigned: Number(equipo.presupuesto_asignado || 0),
          budgetLiquidated,
          budgetPending,
          plans: planes.map((p: any) => ({
            id: p.id,
            name: p.nombre,
            status: p.estado
          }))
        };
      })
    );

    if (!teams || teams.length === 0) {
      return (
        <section className="space-y-8">
          <header className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              Gestor de equipos y presupuesto
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-500">
              No hay equipos configurados aún. Crea tu primer equipo para comenzar.
            </p>
          </header>
        </section>
      );
    }

  return (
    <section className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Gestor de equipos y presupuesto
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-500">
          Vista administrativa para revisar la configuración de cada equipo y gestionar acciones
          del CRUD completo. Datos en tiempo real desde Supabase.
        </p>
      </header>

      <div className="space-y-4">
        {teams.map((team) => (
          <Link
            key={team.id}
            href={`/superadmin/teams/${team.id}`}
            className="block rounded-3xl bg-white p-6 shadow-card ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-2xl"
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
              Acciones disponibles: Crear/editar equipo · Asignar líder y miembros · Ajustar
              presupuesto · Crear nuevo plan
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
  } catch (error) {
    console.error("Error al cargar equipos:", error);
    return (
      <section className="space-y-8">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Gestor de equipos y presupuesto
          </h1>
        </header>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-800 font-semibold">
            Error al cargar los equipos
          </p>
          <p className="text-red-600 text-sm mt-2">
            Por favor, verifica tu conexión e intenta nuevamente. Si el problema persiste, contacta al administrador.
          </p>
        </div>
      </section>
    );
  }
}

