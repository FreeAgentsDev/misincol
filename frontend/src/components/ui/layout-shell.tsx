"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ReactNode, useEffect, useMemo } from "react";
import { useAuth } from "@/context/auth-context";

interface Props {
  children: ReactNode;
}

export default function LayoutShell({ children }: Props) {
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

  const nav = useMemo(() => {
    if (!user) {
      return null;
    }

    if (user.role === "superadmin") {
      return [
        { label: "Dashboard global", href: "/superadmin/dashboard" },
        { label: "Gestor de equipos", href: "/superadmin/manage" },
        { label: "Historial planes", href: "/superadmin/plans" }
      ];
    }

    const suffix = user.teamId ? `?team=${user.teamId}` : "";

    return [
      { label: "Dashboard de equipo", href: `/leader/dashboard${suffix}` },
      { label: "Actividades y áreas", href: `/leader/activities${suffix}` },
      { label: "Planes anteriores", href: `/leader/plans${suffix}` },
      { label: "Gestor de miembros", href: `/leader/members${suffix}` }
    ];
  }, [user]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="flex items-center gap-3 rounded-2xl bg-white px-6 py-4 shadow-card ring-1 ring-slate-200">
          <span className="h-3 w-3 animate-ping rounded-full bg-blue-500" />
          <span className="text-sm font-medium text-slate-600">Cargando...</span>
        </div>
      </main>
    );
  }

  if (!nav || pathname === "/login") {
    return <main className="flex min-h-screen flex-col bg-slate-100 p-6 md:p-10">{children}</main>;
  }

  const navLinkBase =
    "rounded-xl px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800/70";

  const isActive = (href: string) => {
    const baseHref = href.split("?")[0];
    if (pathname === baseHref) {
      return true;
    }
    return pathname.startsWith(baseHref);
  };

  const renderNavLinks = (className: string) =>
    nav.map((item) => (
      <Link
        key={item.href}
        href={item.href}
        className={`${className} ${isActive(item.href) ? "bg-slate-800/90 text-white" : ""}`}
      >
        {item.label}
      </Link>
    ));

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 lg:flex-row">
      <aside className="hidden flex-col justify-between bg-slate-950 px-6 py-10 text-slate-100 shadow-2xl lg:flex lg:w-72">
        <div className="space-y-8">
          <div>
            <p className="text-2xl font-semibold tracking-tight">Misincol</p>
            {user ? (
              <p className="mt-2 text-sm text-slate-400">
                Sesión: {user.username}
                {user.role === "leader" && user.teamId ? ` · Equipo ${user.teamId}` : ""}
              </p>
            ) : null}
          </div>
          <nav className="space-y-2">
            {renderNavLinks(
              `${navLinkBase} flex w-full items-center justify-between gap-2 border border-transparent`
            )}
          </nav>
        </div>
        <button
          type="button"
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="inline-flex items-center justify-center rounded-xl border border-slate-600/40 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
        >
          Cerrar sesión
        </button>
      </aside>
      <main className="flex-1 overflow-y-auto px-6 py-8 sm:px-10 lg:px-14">
        <div className="mx-auto flex max-w-6xl flex-col space-y-8 pb-10">
          <div className="lg:hidden">
            <div className="rounded-3xl bg-slate-950 px-6 py-5 text-slate-100 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold tracking-tight">Misincol</p>
                  {user ? (
                    <p className="text-xs text-slate-400">
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
                  className="inline-flex items-center justify-center rounded-xl border border-slate-600/40 px-4 py-2 text-xs font-semibold text-slate-100 transition hover:bg-slate-800"
                >
                  Cerrar sesión
                </button>
              </div>
              <div className="mt-4 flex gap-2 overflow-x-auto">
                {renderNavLinks(
                  "whitespace-nowrap rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800"
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

