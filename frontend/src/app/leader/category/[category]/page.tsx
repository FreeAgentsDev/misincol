import { loadTeams } from "@/lib/mock-data";
import { PlanCategory } from "@/lib/types";
import { CategoryViewClient } from "./category-view-client";

const categoryMap: Record<string, PlanCategory> = {
  investigacion: "Investigación",
  encarnacion: "Encarnación",
  evangelizacion: "Evangelización",
  entrenamiento: "Entrenamiento",
  autocuidado: "Autocuidado"
};

interface Props {
  params: Promise<{ category: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function LeaderCategory({ params, searchParams }: Props) {
  const { category } = await params;
  const resolvedSearchParams = await searchParams;
  const teams = await loadTeams();
  const teamId = typeof resolvedSearchParams?.team === "string" ? resolvedSearchParams.team : teams[0]?.id;
  const team = teams.find((entry) => entry.id === teamId) ?? teams[0];
  const activePlan = team?.plans.find((plan) => plan.status === "Activo");

  const categoryName = categoryMap[category.toLowerCase()];
  
  if (!categoryName) {
    return (
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-cocoa-900">Categoría no encontrada</h1>
        <p className="text-sm text-cocoa-600">La categoría especificada no existe.</p>
      </section>
    );
  }

  if (!team || !activePlan) {
    return (
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-cocoa-900">No hay plan activo</h1>
        <p className="text-sm text-cocoa-600">
          Selecciona un equipo con plan activo para ver las actividades de esta categoría.
        </p>
      </section>
    );
  }

  return (
    <CategoryViewClient 
      team={team}
      activePlan={activePlan}
      categoryName={categoryName}
      teamId={teamId}
    />
  );
}
