import Link from "next/link";
import { notFound } from "next/navigation";
import { loadTeamById } from "@/lib/mock-data";
import { MembersList } from "@/components/ui/members-list";

interface Props {
  children: React.ReactNode;
  params: Promise<{ teamId: string }>;
}

export default async function MembersLayout({ children, params }: Props) {
  const resolvedParams = await params;
  const { teamId } = resolvedParams;
  const team = await loadTeamById(teamId);

  if (!team) {
    notFound();
  }

  const activePlan = team.plans.find((plan) => plan.status === "Activo");

  return (
    <section className="space-y-7">
      <header className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-500">
              Gestor de miembros
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-cocoa-900">
              Gestión de miembros · {team.name}
            </h1>
          </div>
          <Link
            href={`/superadmin/teams/${teamId}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 transition hover:text-brand-500"
          >
            <span>←</span>
            <span>Volver al equipo</span>
          </Link>
        </div>
        <p className="max-w-3xl text-sm leading-6 text-cocoa-600">
          Administra roles, miembros invitados y asignaciones por actividad. Esta vista simula el
          gestor completo, usando datos mock.
        </p>
      </header>

      <div className="grid gap-7 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <MembersList team={team} activePlan={activePlan} />
        </div>
        <div className="lg:sticky lg:top-7 lg:h-fit">
          {children}
        </div>
      </div>
    </section>
  );
}

