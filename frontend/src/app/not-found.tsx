"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";

export default function NotFound() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (loading) {
      return;
    }

    // Si no está autenticado, redirigir al login después de mostrar el 404 brevemente
    if (!user) {
      // Mostrar el 404 por 2 segundos antes de redirigir
      const redirectTimer = setTimeout(() => {
        router.replace("/login");
      }, 2000);
      return () => clearTimeout(redirectTimer);
    }

    // Si está autenticado, redirigir según el rol después de 5 segundos
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Redirigir según el rol
          if (user.role === "superadmin") {
            router.replace("/superadmin/dashboard");
          } else {
            const leaderDash = `/leader/dashboard${user.teamId ? `?team=${user.teamId}` : ""}`;
            router.replace(leaderDash);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [user, loading, router]);

  // Mostrar loading mientras se verifica autenticación
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="flex items-center gap-3 rounded-2xl bg-white px-6 py-4 shadow-card ring-1 ring-slate-200">
          <span className="h-3 w-3 animate-ping rounded-full bg-blue-500" />
          <span className="text-sm font-medium text-slate-600">Cargando...</span>
        </div>
      </div>
    );
  }

  // Si no hay usuario, mostrar mensaje breve antes de redirigir
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-2xl text-center">
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-sand-200">404</h1>
            <h2 className="mt-4 text-3xl font-bold text-cocoa-900">
              Página no encontrada
            </h2>
            <p className="mt-4 text-lg text-cocoa-600">
              Redirigiendo al login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const redirectUrl =
    user.role === "superadmin"
      ? "/superadmin/dashboard"
      : `/leader/dashboard${user.teamId ? `?team=${user.teamId}` : ""}`;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-sand-200">404</h1>
          <h2 className="mt-4 text-3xl font-bold text-cocoa-900">
            Página no encontrada
          </h2>
          <p className="mt-4 text-lg text-cocoa-600">
            Lo sentimos, la página que estás buscando no existe o ha sido movida.
          </p>
        </div>

        <div className="rounded-2xl bg-white/90 p-8 shadow-lg ring-1 ring-sand-200 backdrop-blur-sm">
          <div className="space-y-6">
            <div className="flex items-center justify-center">
              <div className="rounded-full bg-sand-100 p-4">
                <svg
                  className="h-12 w-12 text-sand-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-cocoa-700">
                Serás redirigido a tu dashboard en{" "}
                <span className="text-2xl font-bold text-brand-600">{countdown}</span>{" "}
                segundo{countdown !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href={redirectUrl}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-3 text-base font-semibold text-white shadow-md transition-all hover:from-brand-500 hover:to-brand-400 hover:shadow-lg"
              >
                Ir a mi dashboard ahora
              </Link>
              <button
                onClick={() => router.back()}
                className="inline-flex items-center justify-center rounded-xl border-2 border-sand-300 bg-white px-6 py-3 text-base font-semibold text-cocoa-700 transition-all hover:bg-sand-50"
              >
                Volver atrás
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-sm text-cocoa-500">
          <p>
            Si crees que esto es un error, por favor{" "}
            <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
              contacta al administrador
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

