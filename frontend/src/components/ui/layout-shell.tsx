"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ReactNode, Suspense, useEffect, useMemo } from "react";
import { useAuth } from "@/context/auth-context";

interface Props {
  children: ReactNode;
}

function LayoutShellContent({ children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user && pathname !== "/login") {
      router.replace("/login");
      return;
    }

    if (!user) {
      return;
    }

    const leaderDash = `/leader/dashboard${user.teamId ? `?team=${user.teamId}` : ""}`;

    if (pathname === "/login") {
      router.replace(user.role === "superadmin" ? "/superadmin/dashboard" : leaderDash);
      return;
    }

    if (user.role === "leader" && pathname.startsWith("/superadmin")) {
      router.replace(leaderDash);
    }
  }, [user, loading, pathname, router]);

  useEffect(() => {
    if (!user || loading) {
      return;
    }

    if (user.role === "leader" && pathname.startsWith("/leader") && user.teamId) {
      const currentTeam = searchParams.get("team");
      if (currentTeam !== user.teamId) {
        router.replace(`${pathname}?team=${user.teamId}`);
      }
    }
  }, [user, loading, pathname, router, searchParams]);

  // Vistas obligatorias para cada equipo como planes de desarrollo
  // Cada líder de equipo DEBE tener acceso a estas 4 vistas:
  // 1. Dashboard de equipo - vista consolidada del plan activo
  // 2. Actividades y áreas - CRUD de actividades y gestión de áreas
  // 3. Planes anteriores - historial de planes pasados del equipo
  // 4. Gestor de miembros - administración de miembros y asignaciones
  const nav = useMemo(() => {
    if (!user) {
      return null;
    }

    if (user.role === "superadmin") {
      // Vistas obligatorias para Super Administrador
      return [
        { label: "Dashboard global", href: "/superadmin/dashboard" },
        { label: "Gestor de equipos", href: "/superadmin/manage" },
        { label: "Planes", href: "/superadmin/plans-list" },
        { label: "Historial planes", href: "/superadmin/plans" }
      ];
    }

    // Vistas obligatorias para cada equipo (líder)
    const suffix = user.teamId ? `?team=${user.teamId}` : "";

    return [
      { label: "Dashboard de equipo", href: `/leader/dashboard${suffix}` },
      { label: "Investigación", href: `/leader/category/investigacion${suffix}` },
      { label: "Encarnación", href: `/leader/category/encarnacion${suffix}` },
      { label: "Evangelización", href: `/leader/category/evangelizacion${suffix}` },
      { label: "Entrenamiento", href: `/leader/category/entrenamiento${suffix}` },
      { label: "Autocuidado", href: `/leader/category/autocuidado${suffix}` },
      { label: "Planes anteriores", href: `/leader/plans${suffix}` },
      { label: "Gestor de miembros", href: `/leader/members${suffix}` }
    ];
  }, [user]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-sand-50">
        <div className="flex items-center gap-3 rounded-3xl border border-white/60 bg-white/85 px-6 py-4 text-cocoa-700 shadow-soft backdrop-blur">
          <span className="h-2.5 w-2.5 animate-ping rounded-full bg-brand-500" />
          <span className="text-sm font-medium">Cargando tu espacio...</span>
        </div>
      </main>
    );
  }

  if (!nav || pathname === "/login") {
    return (
      <main className="flex min-h-screen flex-col bg-transparent px-6 py-10 md:px-10 lg:px-16">
        {children}
      </main>
    );
  }

  const navLinkBase =
    "group relative flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold text-sand-100/80 transition hover:bg-white/10 hover:text-white";

  const isActive = (href: string) => {
    const baseHref = href.split("?")[0];
    const pathnameBase = pathname.split("?")[0];
    
    // Coincidencia exacta
    if (pathnameBase === baseHref) {
      return true;
    }
    
    // Para rutas de categorías (/leader/category/[category])
    if (baseHref.startsWith("/leader/category/")) {
      return pathnameBase.startsWith("/leader/category/") && pathnameBase === baseHref;
    }
    
    // Para "Historial planes" (/superadmin/plans o /leader/plans), solo activar en la ruta exacta
    // NO activar en /plans/[planId] porque es una vista de detalle de actividades, no historial
    if (baseHref === "/superadmin/plans" || (baseHref.startsWith("/leader/plans") && !baseHref.includes("plans-list"))) {
      // Si la ruta actual es una subruta (como /plans/[planId]), no activar "Historial planes"
      if (pathnameBase.startsWith(baseHref + "/")) {
        return false;
      }
      // Solo activar si es exactamente esa ruta (sin query params en el pathname)
      return pathnameBase === baseHref;
    }
    
    // Para "Planes" (/superadmin/plans-list o /leader/plans-list), activar también en /plans/[planId]
    // porque /plans/[planId] es una vista de detalle de un plan (actividades), no historial
    if (baseHref === "/superadmin/plans-list") {
      // Activar en /superadmin/plans-list y en /superadmin/plans/[planId]
      // pero NO en /superadmin/plans (que es historial)
      return pathnameBase.startsWith("/superadmin/plans/") && pathnameBase !== "/superadmin/plans";
    }
    if (baseHref.includes("/leader/plans-list")) {
      // Activar en /leader/plans-list y en /leader/plans/[planId]
      // pero NO en /leader/plans (que es historial)
      return pathnameBase.startsWith("/leader/plans/") && pathnameBase !== "/leader/plans";
    }
    
    // Para otras rutas, activar si es una subruta real
    if (pathnameBase.startsWith(baseHref + "/")) {
      return true;
    }
    
    return false;
  };

  const renderNavLinks = (className: string) =>
    nav.map((item) => (
      <Link
        key={item.href}
        href={item.href}
        className={`${className} ${isActive(item.href) ? "bg-white/15 text-white shadow-inner" : ""}`}
      >
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-white/40 transition group-hover:bg-white" />
          {item.label}
        </span>
        <span className="text-xs font-medium text-white/60 transition group-hover:text-white">
          →
        </span>
      </Link>
    ));

  return (
    <div className="flex h-screen flex-col bg-transparent lg:flex-row lg:overflow-hidden">
      <aside className="hidden h-screen w-80 flex-col justify-between bg-gradient-to-b from-brand-700 via-brand-800 to-cocoa-900 px-8 py-10 text-sand-50 shadow-2xl shadow-brand-900/30 lg:flex lg:fixed lg:left-0 lg:top-0">
        <div className="space-y-10">
          <div className="space-y-3">
            <Image
              src="/Captura_de_pantalla_2025-11-13_122159-removebg-preview.png"
              alt="Misincol - Misiones indígenas en Colombia"
              width={200}
              height={80}
              className="h-auto w-full max-w-[200px] object-contain brightness-0 invert"
            />
            <h1 className="text-3xl font-semibold leading-tight text-white">
              {user?.role === "superadmin" ? "Gestor de equipos" : "Gestor de equipo"}
            </h1>
            {user ? (
              <div className="flex flex-col gap-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-sand-100/80">
                <span className="font-semibold text-white">Sesión activa</span>
                <span>{user.username}</span>
                {user.role === "leader" && user.teamId ? (
                  <span className="text-xs uppercase tracking-wide text-sand-100/60">
                    Equipo {user.teamId}
                  </span>
                ) : (
                  <span className="text-xs uppercase tracking-wide text-sand-100/60">
                    Rol: Superadministrador
                  </span>
                )}
              </div>
            ) : null}
          </div>
          <nav className="space-y-1.5">
            {renderNavLinks(
              `${navLinkBase} border border-white/10 bg-white/0 shadow-none`
            )}
          </nav>
        </div>
        <button
          type="button"
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/15"
        >
          <span>Cerrar sesión</span>
        </button>
      </aside>
      <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-8 lg:ml-80 lg:px-12">
        <div className="mx-auto flex w-full max-w-6xl flex-col space-y-8 pb-12">
          <div className="lg:hidden">
            <div className="rounded-3xl border border-white/40 bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 px-5 py-5 text-sand-50 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                  <Image
                    src="/Captura_de_pantalla_2025-11-13_122159-removebg-preview.png"
                    alt="Misincol - Misiones indígenas en Colombia"
                    width={180}
                    height={72}
                    className="h-auto w-full max-w-[180px] object-contain brightness-0 invert"
                  />
                  <h1 className="text-xl font-semibold leading-tight text-white">
                    {user?.role === "superadmin" ? "Gestor de equipos" : "Gestor de equipo"}
                  </h1>
                  {user ? (
                    <p className="text-xs font-medium text-white/70">
                      Sesión: {user.username}
                      {user.role === "leader" && user.teamId ? ` · Equipo ${user.teamId}` : ""}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    router.push("/login");
                  }}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-white/15"
                >
                  Cerrar sesión
                </button>
              </div>
              <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
                {renderNavLinks(
                  "whitespace-nowrap rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/20"
                )}
              </div>
            </div>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}

export default function LayoutShell({ children }: Props) {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-sand-50">
          <div className="flex items-center gap-3 rounded-3xl border border-white/60 bg-white/85 px-6 py-4 text-cocoa-700 shadow-soft backdrop-blur">
            <span className="h-2.5 w-2.5 animate-ping rounded-full bg-brand-500" />
            <span className="text-sm font-medium">Cargando...</span>
          </div>
        </main>
      }
    >
      <LayoutShellContent>{children}</LayoutShellContent>
    </Suspense>
  );
}

