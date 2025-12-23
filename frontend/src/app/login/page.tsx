"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth, type AuthUser } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";

interface DemoUser {
  username: string;
  password: string;
  role: string;
  teamId?: string;
  fullName?: string;
}

// Usuarios demo por defecto (fallback si no se pueden cargar desde Supabase)
// Según la documentación del backend: backend-supabase-paso-a-paso.md
const DEFAULT_DEMO_USERS: DemoUser[] = [
  { 
    username: "superadmin", 
    password: "superadmin123", 
    role: "superadmin",
    fullName: "Super Administrador"
  },
  { 
    username: "lider-bari", 
    password: "lider123", 
    role: "leader", 
    teamId: "11111111-1111-1111-1111-111111111111", 
    fullName: "Pepe (Líder Barí)" 
  },
  { 
    username: "lider-katios", 
    password: "lider123", 
    role: "leader", 
    teamId: "22222222-2222-2222-2222-222222222222",
    fullName: "Carla (Líder Katíos)"
  }
];

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();
  const [demoUsers, setDemoUsers] = useState<DemoUser[]>(DEFAULT_DEMO_USERS);
  const [loadingUsers, setLoadingUsers] = useState(true);

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

  // Cargar usuarios desde Supabase
  useEffect(() => {
    let mounted = true;
    
    // Timeout de seguridad: si no carga en 3 segundos, usar usuarios por defecto
    const timeoutId = setTimeout(() => {
      if (mounted && loadingUsers) {
        console.log("⏱️ [USERS] Timeout al cargar usuarios, usando usuarios por defecto");
        setDemoUsers(DEFAULT_DEMO_USERS);
        setLoadingUsers(false);
      }
    }, 3000);

    const loadUsers = async () => {
      try {
        // Intentar cargar usuarios desde perfiles
        // Nota: Esto requiere que la política RLS permita leer perfiles sin autenticación
        const { data: perfiles, error } = await supabase
          .from("perfiles")
          .select("nombre_usuario, nombre_completo, rol, id_equipo")
          .limit(10); // Limitar a 10 usuarios para no sobrecargar

        if (!mounted) return;

        if (error) {
          // Si hay error (406, 403, etc.), usar usuarios por defecto
          console.log("⚠️ [USERS] Error al cargar usuarios desde Supabase:", error.message);
          console.log("✅ [USERS] Usando usuarios por defecto");
          setDemoUsers(DEFAULT_DEMO_USERS);
          setLoadingUsers(false);
          clearTimeout(timeoutId);
          return;
        }

        if (perfiles && perfiles.length > 0) {
          // Mapeo de contraseñas según documentación del backend
          // backend-supabase-paso-a-paso.md - Paso 7.1
          const passwordMap: Record<string, string> = {
            "superadmin": "superadmin123",
            "lider-bari": "lider123",
            "lider-katios": "lider123"
          };

          // Mapear perfiles a usuarios demo con contraseñas según documentación
          const users: DemoUser[] = perfiles.map((p) => {
            // Usar contraseña del mapeo si existe, sino usar una por defecto
            const password = passwordMap[p.nombre_usuario] || "lider123";
            
            return {
              username: p.nombre_usuario,
              password: password,
              role: p.rol,
              teamId: p.id_equipo || undefined,
              fullName: p.nombre_completo || undefined
            };
          });
          
          console.log("✅ [USERS] Usuarios cargados desde Supabase:", users.length);
          setDemoUsers(users);
        } else {
          // Si no hay usuarios, usar usuarios por defecto
          console.log("ℹ️ [USERS] No se encontraron usuarios en Supabase, usando usuarios por defecto");
          setDemoUsers(DEFAULT_DEMO_USERS);
        }
      } catch (err) {
        if (!mounted) return;
        console.error("❌ [USERS] Error loading users:", err);
        setDemoUsers(DEFAULT_DEMO_USERS);
      } finally {
        if (mounted) {
          setLoadingUsers(false);
          clearTimeout(timeoutId);
        }
      }
    };

    loadUsers();

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Estados para el formulario de registro
  const [signUpData, setSignUpData] = useState({
    username: "",
    fullName: "",
    password: "",
    confirmPassword: "",
    country: "",
    referralCode: "",
    acceptedTerms: false
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    console.log("📝 [FORM] Formulario enviado");
    console.log("📝 [FORM] Usuario ingresado:", username);
    console.log("📝 [FORM] Contraseña ingresada:", password ? "***" : "(vacía)");

    const result = await login(username, password);
    
    console.log("📝 [FORM] Resultado del login:", result);
    
    if (result.error) {
      console.error("❌ [FORM] Error en el login:", result.error);
      setError(result.error);
      return;
    }

    console.log("✅ [FORM] Login exitoso, esperando redirección...");
    // La redirección se manejará automáticamente por el useEffect que observa el cambio de user
  };

  const handleSignUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      console.log("📝 [SIGNUP] Iniciando registro de usuario...");

      // Validaciones
      if (signUpData.username.length < 3) {
        setError("El nombre de usuario debe tener al menos 3 caracteres");
        setLoading(false);
        return;
      }

      if (signUpData.password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres");
        setLoading(false);
        return;
      }

      if (signUpData.password !== signUpData.confirmPassword) {
        setError("Las contraseñas no coinciden");
        setLoading(false);
        return;
      }

      if (!signUpData.acceptedTerms) {
        setError("Debes aceptar los términos y condiciones");
        setLoading(false);
        return;
      }

      // Construir email sintético
      const email = `${signUpData.username}@misincol.local`;
      console.log("📧 [SIGNUP] Email sintético:", email);

      // Paso 1: Crear usuario en Supabase Auth
      console.log("🚀 [SIGNUP] Creando usuario en Supabase Auth...");
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: signUpData.password,
        options: {
          data: {
            nombre_usuario: signUpData.username,
            nombre_completo: signUpData.fullName || signUpData.username,
            role: "member" // Por defecto todos los nuevos usuarios son 'member'
          },
          emailRedirectTo: undefined // No requerir confirmación de email
        }
      });

      if (authError) {
        console.error("❌ [SIGNUP] Error en Supabase Auth:", authError);
        
        if (authError.message.includes("already registered") || authError.message.includes("already exists")) {
          setError("Este nombre de usuario ya está registrado. Por favor, elige otro.");
        } else {
          setError(`Error al crear la cuenta: ${authError.message}`);
        }
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setError("No se pudo crear el usuario. Intenta nuevamente.");
        setLoading(false);
        return;
      }

      console.log("✅ [SIGNUP] Usuario creado en Auth:", authData.user.id);

      // Paso 2: Hacer upsert en la tabla perfiles
      // Según la documentación, debemos hacer upsert con todos los campos
      console.log("📝 [SIGNUP] Creando perfil en tabla perfiles...");
      const { error: profileError } = await supabase
        .from("perfiles")
        .upsert({
          id: authData.user.id,
          email: email,
          nombre_usuario: signUpData.username,
          nombre_completo: signUpData.fullName || signUpData.username,
          rol: "member", // Por defecto 'member'
          country: signUpData.country || null,
          accepted_terms: signUpData.acceptedTerms,
          referral_code: signUpData.referralCode || null
        }, {
          onConflict: "id"
        });

      if (profileError) {
        console.error("❌ [SIGNUP] Error al crear perfil:", profileError);
        // Aunque falle el perfil, el usuario ya está creado en Auth
        // Intentamos hacer login automático
        setError("Usuario creado pero hubo un error al crear el perfil. Intenta iniciar sesión.");
        setLoading(false);
        return;
      }

      console.log("✅ [SIGNUP] Perfil creado exitosamente");

      // Paso 3: Intentar login automático
      console.log("🔄 [SIGNUP] Intentando login automático...");
      const loginResult = await login(signUpData.username, signUpData.password);
      
      if (loginResult.error) {
        // Si el login automático falla, informar al usuario que puede iniciar sesión manualmente
        setError("Cuenta creada exitosamente. Por favor, inicia sesión con tus credenciales.");
        setIsSignUp(false); // Cambiar a vista de login
        setLoading(false);
        return;
      }

      console.log("✅ [SIGNUP] Registro y login completados exitosamente");
      // La redirección se manejará automáticamente por el useEffect que observa el cambio de user

    } catch (err: any) {
      console.error("❌ [SIGNUP] Error inesperado:", err);
      setError(`Error inesperado: ${err.message || "Intenta nuevamente"}`);
      setLoading(false);
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

          {/* Tabs para Login/Registro */}
          <div className="flex w-full gap-2 mb-2">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setError(null);
              }}
              className={`flex-1 rounded-2xl px-4 py-2.5 text-sm font-bold transition-all duration-200 ${
                !isSignUp
                  ? "bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-md"
                  : "bg-white/50 text-cocoa-700 hover:bg-white/70"
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setError(null);
              }}
              className={`flex-1 rounded-2xl px-4 py-2.5 text-sm font-bold transition-all duration-200 ${
                isSignUp
                  ? "bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-md"
                  : "bg-white/50 text-cocoa-700 hover:bg-white/70"
              }`}
            >
              Crear Cuenta
            </button>
          </div>

          {/* Formulario */}
          <div className="flex w-full flex-col gap-4">
            <div className="space-y-1.5 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-brand-600">
                {isSignUp ? "Registro" : "Iniciar sesión"}
              </p>
              <h2 className="text-xl font-semibold leading-tight text-cocoa-900">
                {isSignUp ? "Crear nueva cuenta" : "Iniciar sesión"}
              </h2>
              <p className="text-xs leading-relaxed text-cocoa-600">
                {isSignUp
                  ? "Completa el formulario para crear tu cuenta en Misincol."
                  : "Ingresa tu nombre de usuario o email completo y contraseña. Haz clic en un usuario abajo para llenar automáticamente."}
              </p>
            </div>

            {!isSignUp ? (
              // Formulario de Login
              <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="username" className="text-sm font-semibold text-cocoa-700">
                    Usuario o Email
                  </label>
                  <div className="relative group">
                    <input
                      id="username"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      placeholder="superadmin o superadmin@misincol.local"
                      autoComplete="username email"
                      type="text"
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
                  className="w-full justify-center rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-3.5 text-base font-bold text-white shadow-lg transition-all duration-200 hover:from-brand-500 hover:to-brand-400 hover:shadow-xl hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300/50 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed" 
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Iniciando sesión..." : "Entrar"}
                </button>
              </form>
            ) : (
              // Formulario de Registro
              <form onSubmit={handleSignUp} className="flex w-full flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="signup-username" className="text-sm font-semibold text-cocoa-700">
                    Nombre de Usuario <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="signup-username"
                    value={signUpData.username}
                    onChange={(e) => setSignUpData({ ...signUpData, username: e.target.value })}
                    placeholder="minimo 3 caracteres"
                    autoComplete="username"
                    type="text"
                    required
                    minLength={3}
                    className="w-full rounded-2xl border-2 border-sand-200 bg-white/90 px-4 py-3.5 text-sm text-cocoa-900 shadow-sm outline-none transition-all duration-200 focus:border-brand-500 focus:bg-white focus:shadow-md focus:ring-4 focus:ring-brand-200/50 hover:border-sand-300"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="signup-fullname" className="text-sm font-semibold text-cocoa-700">
                    Nombre Completo
                  </label>
                  <input
                    id="signup-fullname"
                    value={signUpData.fullName}
                    onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })}
                    placeholder="Tu nombre completo (opcional)"
                    autoComplete="name"
                    type="text"
                    className="w-full rounded-2xl border-2 border-sand-200 bg-white/90 px-4 py-3.5 text-sm text-cocoa-900 shadow-sm outline-none transition-all duration-200 focus:border-brand-500 focus:bg-white focus:shadow-md focus:ring-4 focus:ring-brand-200/50 hover:border-sand-300"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="signup-country" className="text-sm font-semibold text-cocoa-700">
                    País
                  </label>
                  <input
                    id="signup-country"
                    value={signUpData.country}
                    onChange={(e) => setSignUpData({ ...signUpData, country: e.target.value })}
                    placeholder="Colombia (opcional)"
                    type="text"
                    className="w-full rounded-2xl border-2 border-sand-200 bg-white/90 px-4 py-3.5 text-sm text-cocoa-900 shadow-sm outline-none transition-all duration-200 focus:border-brand-500 focus:bg-white focus:shadow-md focus:ring-4 focus:ring-brand-200/50 hover:border-sand-300"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="signup-referral" className="text-sm font-semibold text-cocoa-700">
                    Código de Referido
                  </label>
                  <input
                    id="signup-referral"
                    value={signUpData.referralCode}
                    onChange={(e) => setSignUpData({ ...signUpData, referralCode: e.target.value })}
                    placeholder="Código de referido (opcional)"
                    type="text"
                    className="w-full rounded-2xl border-2 border-sand-200 bg-white/90 px-4 py-3.5 text-sm text-cocoa-900 shadow-sm outline-none transition-all duration-200 focus:border-brand-500 focus:bg-white focus:shadow-md focus:ring-4 focus:ring-brand-200/50 hover:border-sand-300"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="signup-password" className="text-sm font-semibold text-cocoa-700">
                    Contraseña <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="signup-password"
                    type="password"
                    value={signUpData.password}
                    onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                    placeholder="mínimo 6 caracteres"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    className="w-full rounded-2xl border-2 border-sand-200 bg-white/90 px-4 py-3.5 text-sm text-cocoa-900 shadow-sm outline-none transition-all duration-200 focus:border-brand-500 focus:bg-white focus:shadow-md focus:ring-4 focus:ring-brand-200/50 hover:border-sand-300"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="signup-confirm-password" className="text-sm font-semibold text-cocoa-700">
                    Confirmar Contraseña <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="signup-confirm-password"
                    type="password"
                    value={signUpData.confirmPassword}
                    onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                    placeholder="repite tu contraseña"
                    autoComplete="new-password"
                    required
                    className={`w-full rounded-2xl border-2 bg-white/90 px-4 py-3.5 text-sm text-cocoa-900 shadow-sm outline-none transition-all duration-200 focus:bg-white focus:shadow-md focus:ring-4 hover:border-sand-300 ${
                      signUpData.password && signUpData.confirmPassword && signUpData.password !== signUpData.confirmPassword
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200/50"
                        : "border-sand-200 focus:border-brand-500 focus:ring-brand-200/50"
                    }`}
                  />
                  {signUpData.password && signUpData.confirmPassword && signUpData.password !== signUpData.confirmPassword && (
                    <p className="text-xs text-red-600">Las contraseñas no coinciden</p>
                  )}
                </div>

                <div className="flex items-start gap-2">
                  <input
                    id="signup-terms"
                    type="checkbox"
                    checked={signUpData.acceptedTerms}
                    onChange={(e) => setSignUpData({ ...signUpData, acceptedTerms: e.target.checked })}
                    required
                    className="mt-1 h-4 w-4 rounded border-sand-300 text-brand-600 focus:ring-brand-500"
                  />
                  <label htmlFor="signup-terms" className="text-xs text-cocoa-700">
                    Acepto los <span className="font-semibold text-brand-600">términos y condiciones</span> <span className="text-red-500">*</span>
                  </label>
                </div>

                <button 
                  className="w-full justify-center rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-3.5 text-base font-bold text-white shadow-lg transition-all duration-200 hover:from-brand-500 hover:to-brand-400 hover:shadow-xl hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300/50 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed" 
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Creando cuenta..." : "Crear Cuenta"}
                </button>
              </form>
            )}

            {!isSignUp && (
              <div className="space-y-2 rounded-2xl border-2 border-sand-200 bg-gradient-to-br from-sand-50/90 to-white/90 p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-cocoa-600">
                  Usuarios disponibles
                </p>
              {loadingUsers ? (
                <div className="text-center py-4 text-sm text-cocoa-600">
                  Cargando usuarios...
                </div>
              ) : (
                <div className="grid gap-2 md:grid-cols-3">
                  {demoUsers.map((demo) => (
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
                        {demo.fullName || demo.username}
                      </span>
                      <span className="text-xs font-semibold text-sand-600 group-hover:text-brand-600">
                        Usuario: {demo.username}
                      </span>
                      <span className="text-xs font-semibold text-sand-600 group-hover:text-brand-600">
                        Rol: {demo.role === "superadmin" ? "Superadmin" : demo.role === "leader" ? "Líder de equipo" : "Miembro"}
                      </span>
                      {demo.teamId && (
                        <span className="text-xs font-medium text-sand-500 group-hover:text-brand-500">
                          ID Equipo: {demo.teamId.substring(0, 8)}...
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
              {demoUsers.length === 0 && !loadingUsers && (
                <div className="text-center py-4 text-sm text-amber-600">
                  No hay usuarios disponibles. Verifica la conexión con Supabase.
                </div>
              )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

