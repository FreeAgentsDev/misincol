"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth, type AuthUser } from "@/context/auth-context";

const DEMO_USERS: (AuthUser & { password: string })[] = [
  { username: "superadmin", password: "123456", role: "superadmin" },
  { username: "lider-bari", password: "123456", role: "leader", teamId: "team-1" },
  { username: "lider-katios", password: "123456", role: "leader", teamId: "team-2" }
];

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();
  useEffect(() => {
    if (!user) {
      return;
    }
    if (user.role === "superadmin") {
      router.replace("/superadmin/dashboard");
    } else {
      router.replace(`/leader/dashboard${user.teamId ? `?team=${user.teamId}` : ""}`);
    }
  }, [user, router]);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const match = DEMO_USERS.find(
      (user) => user.username === username && user.password === password
    );

    if (!match) {
      setError("Usuario o contraseña inválidos.");
      return;
    }

    login({
      username: match.username,
      role: match.role,
      teamId: match.teamId
    });

    if (match.role === "superadmin") {
      router.push("/superadmin/dashboard");
    } else if (match.role === "leader" && match.teamId) {
      router.push(`/leader/dashboard?team=${match.teamId}`);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="fixed inset-0 min-h-screen bg-gradient-to-br from-[#c8833a] via-[#b8521f] to-[#8d2d09] flex items-center justify-center p-4 overflow-y-auto">
      {/* Efectos de fondo decorativos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      </div>

      {/* Alerta flotante en la parte inferior */}
      {error && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-lg w-full px-4">
          <div className="relative overflow-hidden rounded-2xl border-2 border-amber-300/90 bg-gradient-to-br from-amber-50 to-amber-100/90 backdrop-blur-md px-5 py-4 shadow-[0_10px_40px_rgba(0,0,0,0.2)]">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-200/30 to-transparent pointer-events-none" />
            <div className="relative flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-400/30 flex items-center justify-center ring-2 ring-amber-300/50">
                <span className="text-amber-700 text-lg font-bold">!</span>
              </div>
              <p className="text-sm font-semibold text-amber-900 flex-1">
                {error}
              </p>
              <button
                type="button"
                onClick={() => setError(null)}
                className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-300/30 hover:bg-amber-400/40 flex items-center justify-center text-amber-700 hover:text-amber-900 transition-all"
              >
                <span className="text-base font-bold leading-none">×</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="relative w-full max-w-3xl rounded-[2.5rem] border-2 border-brand-400/80 bg-white/75 backdrop-blur-2xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
        <div className="flex flex-col items-center gap-5">
          {/* Logo con efecto mejorado */}
          <div className="relative w-full flex justify-center -mt-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-200/20 to-brand-600/20 rounded-3xl blur-2xl scale-110" />
              <Image
                src="/Captura_de_pantalla_2025-11-13_122159-removebg-preview.png"
                alt="Misincol - Misiones indígenas en Colombia"
                width={280}
                height={112}
                className="relative h-auto w-full max-w-[280px] object-contain drop-shadow-[0_12px_40px_rgba(0,0,0,0.4)]"
                priority
              />
            </div>
          </div>

          {/* Formulario */}
          <div className="flex w-full flex-col gap-4">
            <div className="space-y-1.5 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-brand-600">
                Iniciar sesión
              </p>
              <h2 className="text-xl font-semibold leading-tight text-cocoa-900">
                Accede con tu usuario demo
              </h2>
              <p className="text-xs leading-relaxed text-cocoa-600">
                Ejemplo rápido: <span className="font-semibold text-cocoa-900">superadmin / 123456</span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="username" className="text-sm font-semibold text-cocoa-700">
                  Usuario
                </label>
                <div className="relative group">
                  <input
                    id="username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="superadmin"
                    autoComplete="username"
                    className="w-full rounded-2xl border-2 border-sand-200 bg-white/90 px-4 py-3.5 pr-16 text-sm text-cocoa-900 shadow-sm outline-none transition-all duration-200 focus:border-brand-500 focus:bg-white focus:shadow-md focus:ring-4 focus:ring-brand-200/50 group-hover:border-sand-300"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs font-bold uppercase tracking-wide text-sand-400">
                    DEMO
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="password" className="text-sm font-semibold text-cocoa-700">
                  Contraseña
                </label>
                <div className="relative group">
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••"
                    autoComplete="current-password"
                    className="w-full rounded-2xl border-2 border-sand-200 bg-white/90 px-4 py-3.5 text-sm text-cocoa-900 shadow-sm outline-none transition-all duration-200 focus:border-brand-500 focus:bg-white focus:shadow-md focus:ring-4 focus:ring-brand-200/50 group-hover:border-sand-300"
                  />
                </div>
              </div>
              <button 
                className="w-full justify-center rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-3.5 text-base font-bold text-white shadow-lg transition-all duration-200 hover:from-brand-500 hover:to-brand-400 hover:shadow-xl hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300/50 active:translate-y-0" 
                type="submit"
              >
                Entrar
              </button>
            </form>

            <div className="space-y-2 rounded-2xl border-2 border-sand-200 bg-gradient-to-br from-sand-50/90 to-white/90 p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-cocoa-600">
                Usuarios demo rápidos
              </p>
              <div className="grid gap-2 md:grid-cols-3">
                {DEMO_USERS.map((demo) => (
                  <button
                    key={demo.username}
                    type="button"
                    onClick={() => {
                      setUsername(demo.username);
                      setPassword(demo.password);
                      setError(null);
                    }}
                    className="group flex flex-col gap-1.5 rounded-2xl border-2 border-sand-200 bg-white/90 px-4 py-3.5 text-left text-sm font-semibold text-cocoa-700 transition-all duration-200 hover:border-brand-300 hover:bg-gradient-to-br hover:from-brand-50/80 hover:to-white hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200/50 active:translate-y-0"
                  >
                    <span className="text-base font-bold text-cocoa-900 group-hover:text-brand-700">
                      {demo.username}
                    </span>
                    <span className="text-xs font-semibold text-sand-600 group-hover:text-brand-600">
                      Rol: {demo.role === "superadmin" ? "Superadmin" : "Líder de equipo"}
                    </span>
                    {demo.teamId ? (
                      <span className="text-xs font-medium text-sand-500 group-hover:text-brand-500">
                        Equipo: {demo.teamId}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

