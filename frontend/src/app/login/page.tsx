"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
    <section className="mx-auto grid w-full max-w-5xl gap-10 rounded-[2.5rem] border border-white/60 bg-white/80 p-8 shadow-soft backdrop-blur md:p-12 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="flex flex-col items-center justify-center gap-6 rounded-3xl bg-gradient-to-br from-[#f7a259] via-[#e8743a] to-[#bf4d20] px-8 py-10 text-sand-50 shadow-inner">
        <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
          Misincol
        </span>
        <p className="text-center text-4xl font-semibold tracking-tight text-white lg:text-5xl">
          Misincol
        </p>
        <p className="text-xs text-white/75">Misiones indígenas en Colombia</p>
      </div>

      <div className="flex flex-col justify-center gap-8">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-brand-500">
            Iniciar sesión
          </p>
          <h2 className="text-3xl font-semibold leading-tight text-cocoa-900">
            Accede con tu usuario demo
          </h2>
          <p className="text-sm leading-relaxed text-cocoa-600">
            Ejemplo rápido: <span className="font-semibold text-cocoa-900">superadmin / 123456</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="username" className="text-sm font-medium text-cocoa-700">
              Usuario
            </label>
            <div className="relative">
              <input
                id="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="superadmin"
                autoComplete="username"
                className="w-full rounded-2xl border border-sand-200 bg-white/70 px-4 py-3 text-sm text-cocoa-900 shadow-sm outline-none transition focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-200/70"
              />
              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs font-semibold uppercase tracking-wide text-sand-400">
                DEMO
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-medium text-cocoa-700">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••"
              autoComplete="current-password"
              className="w-full rounded-2xl border border-sand-200 bg-white/70 px-4 py-3 text-sm text-cocoa-900 shadow-sm outline-none transition focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-200/70"
            />
          </div>
          {error ? (
            <span className="rounded-xl border border-brand-200 bg-brand-50/70 px-4 py-2 text-sm font-medium text-brand-700">
              {error}
            </span>
          ) : null}
          <button className="btn-primary w-full justify-center text-base" type="submit">
            Entrar
          </button>
        </form>

        <div className="space-y-4 rounded-2xl border border-sand-100 bg-sand-50/80 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-sand-500">
            Usuarios demo rápidos
          </p>
          <div className="grid gap-3 md:grid-cols-3">
            {DEMO_USERS.map((demo) => (
              <button
                key={demo.username}
                type="button"
                onClick={() => {
                  setUsername(demo.username);
                  setPassword(demo.password);
                  setError(null);
                }}
                className="flex flex-col gap-1 rounded-2xl border border-sand-200 bg-white/70 px-4 py-3 text-left text-sm font-semibold text-cocoa-700 transition hover:border-brand-200 hover:bg-brand-50/70 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100"
              >
                <span className="text-base font-semibold text-cocoa-900">{demo.username}</span>
                <span className="text-xs font-medium text-sand-500">
                  Rol: {demo.role === "superadmin" ? "Superadmin" : "Líder de equipo"}
                </span>
                {demo.teamId ? (
                  <span className="text-xs text-sand-400">Equipo: {demo.teamId}</span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

