"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

const DEMO_USERS = [
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
    <section className="m-auto flex w-full max-w-md flex-col items-center gap-8 rounded-3xl bg-white px-8 py-10 shadow-card ring-1 ring-slate-200">
      <div className="space-y-3 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Bienvenido a Misincol
        </h1>
        <p className="text-sm leading-6 text-slate-500">
          Usa los usuarios de demostración para ingresar. Ejemplo:{" "}
          <span className="font-semibold text-slate-900">superadmin / 123456</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="username" className="text-sm font-medium text-slate-700">
            Usuario
          </label>
          <input
            id="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="superadmin"
            autoComplete="username"
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium text-slate-700">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••"
            autoComplete="current-password"
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
          />
        </div>
        {error ? (
          <span className="text-sm font-medium text-red-500">{error}</span>
        ) : null}
        <button
          className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700"
          type="submit"
        >
          Entrar
        </button>
      </form>

      <div className="w-full space-y-3 rounded-2xl bg-slate-50 p-4 text-left">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
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
              className="flex flex-col rounded-xl border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-white hover:text-blue-700"
            >
              <span className="text-base font-semibold text-slate-900">{demo.username}</span>
              <span className="text-xs font-medium text-slate-500">
                Rol: {demo.role === "superadmin" ? "Super Admin" : "Líder de equipo"}
              </span>
              {demo.teamId ? (
                <span className="text-xs text-slate-400">Equipo: {demo.teamId}</span>
              ) : null}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

