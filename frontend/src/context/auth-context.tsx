"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

type Role = "superadmin" | "leader" | "member";

export interface AuthUser {
  id: string;
  username: string;
  role: Role;
  teamId?: string;
  fullName?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  session: Session | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar perfil del usuario desde Supabase
  const loadUserProfile = useCallback(async (userId: string) => {
    try {
      console.log("📥 [PROFILE] Cargando perfil para usuario ID:", userId);
      
      // Timeout de 5 segundos para la consulta
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error("Timeout: La consulta del perfil tardó más de 5 segundos"));
        }, 5000);
      });

      const queryPromise = supabase
        .from("perfiles")
        .select("nombre_usuario, nombre_completo, rol, id_equipo")
        .eq("id", userId)
        .single();

      const { data: perfil, error } = await Promise.race([
        queryPromise,
        timeoutPromise
      ]) as Awaited<ReturnType<typeof queryPromise>>;

      console.log("📥 [PROFILE] Respuesta de Supabase:", { 
        data: perfil, 
        error: error ? {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        } : null
      });

      if (error) {
        console.error("❌ [PROFILE] Error al cargar perfil:", error);
        
        // Mensajes más específicos según el tipo de error
        if (error.code === "PGRST116" || error.message.includes("No rows returned")) {
          console.error("❌ [PROFILE] No existe un perfil en la tabla 'perfiles' para este usuario ID:", userId);
          console.error("❌ [PROFILE] Asegúrate de que el perfil fue creado correctamente en Supabase");
        } else if (error.code === "42501" || error.message.includes("permission denied") || error.message.includes("new row violates row-level security")) {
          console.error("❌ [PROFILE] Error de permisos (RLS): Las políticas de seguridad están bloqueando la lectura del perfil");
          console.error("❌ [PROFILE] Verifica que exista una política RLS que permita: SELECT WHERE id = auth.uid()");
        } else if (error.message.includes("Timeout")) {
          console.error("❌ [PROFILE] La consulta tardó demasiado. Posible problema de conexión o RLS.");
        }
        
        throw error;
      }
      
      if (!perfil) {
        console.warn("⚠️ [PROFILE] No se encontró perfil para el usuario:", userId);
        return null;
      }

      const profile = {
        id: userId,
        username: perfil.nombre_usuario,
        role: perfil.rol as Role,
        teamId: perfil.id_equipo || undefined,
        fullName: perfil.nombre_completo || undefined
      };
      
      console.log("✅ [PROFILE] Perfil mapeado:", profile);
      return profile;
    } catch (error) {
      console.error("💥 [PROFILE] Error inesperado:", error);
      if (error instanceof Error) {
        console.error("💥 [PROFILE] Mensaje:", error.message);
      }
      return null;
    }
  }, []);

  // Inicializar sesión
  useEffect(() => {
    let mounted = true;

    // Timeout de seguridad para evitar carga infinita
    const timeoutId = setTimeout(() => {
      if (mounted) {
        console.warn("⚠️ [AUTH] Timeout al cargar sesión, estableciendo loading en false");
        setLoading(false);
      }
    }, 5000); // 5 segundos máximo

    // Obtener sesión actual
    supabase.auth.getSession().then(({ data: { session }, error: sessionError }) => {
      if (!mounted) return;

      if (sessionError) {
        console.error("❌ [AUTH] Error al obtener sesión:", sessionError);
        setSession(null);
        setUser(null);
        setLoading(false);
        clearTimeout(timeoutId);
        return;
      }

      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user.id)
          .then((profile) => {
            if (!mounted) return;
            setUser(profile);
            setLoading(false);
            clearTimeout(timeoutId);
          })
          .catch((error) => {
            if (!mounted) return;
            console.error("❌ [AUTH] Error al cargar perfil:", error);
            // Si hay sesión pero no se puede cargar el perfil, limpiar sesión
            setUser(null);
            setSession(null);
            // Limpiar sesión de Supabase también
            supabase.auth.signOut().catch(console.error);
            setLoading(false);
            clearTimeout(timeoutId);
          });
      } else {
        setUser(null);
        setLoading(false);
        clearTimeout(timeoutId);
      }
    });

    // Escuchar cambios de autenticación
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;

      setSession(session);
      if (session?.user) {
        try {
          const profile = await loadUserProfile(session.user.id);
          if (!mounted) return;
          setUser(profile);
        } catch (error) {
          if (!mounted) return;
          console.error("❌ [AUTH] Error al cargar perfil en onAuthStateChange:", error);
          setUser(null);
          setSession(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
      clearTimeout(timeoutId);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [loadUserProfile]);

  /**
   * Función de login que acepta username o email
   * 
   * Según la documentación:
   * 1. Usa email sintético: username@misincol.local
   * 2. Llama a supabase.auth.signInWithPassword()
   * 3. Carga el perfil desde la tabla perfiles
   * 4. Mapea: nombre_usuario → username, rol → role, id_equipo → teamId
   * 
   * @param usernameOrEmail - Nombre de usuario o email completo
   * @param password - Contraseña del usuario
   * @returns Objeto con error si hay algún problema
   */
  const login = useCallback(async (usernameOrEmail: string, password: string) => {
    try {
      console.log("🔐 [LOGIN] Iniciando proceso de login...");
      console.log("📝 [LOGIN] Input recibido:", { usernameOrEmail, passwordLength: password.length });
      
      // Determinar si es email o username
      // Si contiene '@', es un email directo, sino construimos el email sintético
      const email = usernameOrEmail.includes('@') 
        ? usernameOrEmail 
        : `${usernameOrEmail}@misincol.local`;
      
      console.log("📧 [LOGIN] Email a usar:", email);

      // Llamada a Supabase Auth (según documentación)
      console.log("🚀 [LOGIN] Enviando petición a Supabase Auth...");
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (authError) {
        console.error("❌ [LOGIN] Error de autenticación:", authError);
        
        // Mensajes de error más amigables
        let errorMessage = "Error al iniciar sesión.";
        
        if (authError.message.includes("Invalid login credentials") || 
            authError.message.includes("Invalid credentials")) {
          errorMessage = "Usuario o contraseña inválidos. Verifica tus credenciales.";
        } else if (authError.message.includes("Email not confirmed")) {
          errorMessage = "Por favor, confirma tu email antes de iniciar sesión.";
        } else if (authError.message.includes("Too many requests")) {
          errorMessage = "Demasiados intentos. Por favor, espera un momento.";
        } else {
          errorMessage = authError.message || errorMessage;
        }
        
        return { error: errorMessage };
      }

      if (!data?.user || !data?.session) {
        console.error("❌ [LOGIN] No se recibió usuario o sesión");
        return { error: "Error al iniciar sesión. No se recibió respuesta válida." };
      }

      console.log("✅ [LOGIN] Autenticación exitosa!");
      console.log("👤 [LOGIN] Usuario autenticado:", {
        id: data.user.id,
        email: data.user.email,
        emailConfirmed: data.user.email_confirmed_at ? "Sí" : "No"
      });

      // Cargar el perfil del usuario desde la tabla perfiles (según documentación)
      console.log("📋 [LOGIN] Cargando perfil del usuario...");
      
      // Timeout de 6 segundos para cargar el perfil
      const profilePromise = loadUserProfile(data.user.id);
      const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => {
          console.error("⏱️ [LOGIN] Timeout al cargar el perfil después de 6 segundos");
          resolve(null);
        }, 6000);
      });

      const profile = await Promise.race([profilePromise, timeoutPromise]);
      
      if (!profile) {
        console.error("❌ [LOGIN] No se pudo cargar el perfil");
        console.error("❌ [LOGIN] Posibles causas:");
        console.error("   1. No existe un registro en la tabla 'perfiles' con id =", data.user.id);
        console.error("   2. Las políticas RLS están bloqueando la lectura del perfil");
        console.error("   3. Problema de conexión con Supabase");
        console.error("❌ [LOGIN] Verifica en Supabase:");
        console.error("   - Que exista el perfil: SELECT * FROM perfiles WHERE id = '" + data.user.id + "';");
        console.error("   - Que las políticas RLS permitan: SELECT WHERE id = auth.uid()");
        
        // Cerrar sesión de Supabase para evitar estado inconsistente
        await supabase.auth.signOut();
        
        return { 
          error: "Error al cargar el perfil. Verifica que tu perfil esté configurado correctamente en la base de datos. Si el problema persiste, contacta al administrador." 
        };
      }
      
      console.log("✅ [LOGIN] Perfil cargado exitosamente:", {
        id: profile.id,
        username: profile.username,
        role: profile.role,
        teamId: profile.teamId,
        fullName: profile.fullName
      });
      
      // Actualizar estado con el perfil y sesión
      setUser(profile);
      setSession(data.session);
      
      console.log("🎉 [LOGIN] Login completado exitosamente!");
      return {};
    } catch (error) {
      console.error("💥 [LOGIN] Error inesperado:", error);
      console.error("💥 [LOGIN] Stack trace:", error instanceof Error ? error.stack : "N/A");
      return { error: "Error inesperado al iniciar sesión. Intenta nuevamente." };
    }
  }, [loadUserProfile]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      session
    }),
    [user, loading, login, logout, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}

