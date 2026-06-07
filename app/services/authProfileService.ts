import { obtenerSupabaseCliente } from "@/lib/supabaseClient";
import { esRoleCE, type ProfileCE, type RoleCE } from "@/app/types/authRoles";
import type { User } from "@supabase/supabase-js";

const AUTH_LOCAL_STORAGE_KEY = "ce_auth_profile_local";

export type EstadoAuthProfileCE = {
  usuario: User | null;
  perfil: ProfileCE | null;
  autenticado: boolean;
  perfilDisponible: boolean;
  error?: string;
};

export type ActualizarPerfilActualCEInput = {
  nombre: string;
  cargo?: string | null;
  telefono?: string | null;
};

export type ResultadoActualizarPerfilActualCE =
  | {
      ok: true;
      perfil: ProfileCE;
    }
  | {
      ok: false;
      error: string;
    };

type FilaProfileCE = {
  id: string;
  nombre?: string | null;
  email?: string | null;
  cargo?: string | null;
  telefono?: string | null;
  foto_url?: string | null;
  rol?: string | null;
  empresa_id?: string | null;
  obra_id?: string | null;
  activo?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

function sanitizarError(error: unknown) {
  if (error instanceof Error) return error.message.slice(0, 220);
  return String(error || "Error desconocido").slice(0, 220);
}

function rolLocalPorEmail(email: string): RoleCE {
  const normalizado = email.trim().toLowerCase();

  if (normalizado.includes("supervisor")) return "supervisor_reportante";
  if (normalizado.includes("auditor")) return "visualizador_auditor";
  if (normalizado.includes("mandante")) return "admin_mandante";
  if (normalizado.includes("prevencionista")) return "prevencionista_cliente";
  return "admin_cliente";
}

function esOrigenLocalDemo() {
  if (typeof window === "undefined") return false;

  const hostname = window.location.hostname;
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
  );
}

function navegadorSinConexion() {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

function esEmailDemoCE(email: string) {
  return email.trim().toLowerCase().endsWith(".demo@criterioestrategico.cl");
}

function crearPerfilLocal(email: string): ProfileCE {
  const emailNormalizado = email.trim().toLowerCase();
  const rol = rolLocalPorEmail(emailNormalizado);
  const nombre = emailNormalizado
    .split("@")[0]
    .split(/[._-]+/)
    .filter(Boolean)
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
    .join(" ");

  return {
    id: `local-${emailNormalizado.replace(/[^a-z0-9]+/g, "-")}`,
    nombre: nombre || "Usuario CE",
    email: emailNormalizado,
    cargo:
      rol === "supervisor_reportante"
        ? "Supervisor reportante"
        : "Usuario demo CE",
    telefono: null,
    fotoUrl: null,
    rol,
    empresaId: "local-demo",
    obraId: rol === "supervisor_reportante" ? "local-demo-obra" : null,
    activo: true,
    createdAt: new Date().toISOString(),
  };
}

function leerPerfilLocal(): ProfileCE | null {
  if (typeof window === "undefined") return null;

  try {
    const data = JSON.parse(
      window.localStorage.getItem(AUTH_LOCAL_STORAGE_KEY) || "null"
    ) as Partial<ProfileCE> | null;

    if (!data || !esRoleCE(data.rol) || data.activo === false) return null;

    return {
      id: String(data.id || "local-user"),
      nombre: String(data.nombre || data.email || "Usuario CE"),
      email: typeof data.email === "string" ? data.email : null,
      cargo: typeof data.cargo === "string" ? data.cargo : null,
      telefono: typeof data.telefono === "string" ? data.telefono : null,
      fotoUrl: typeof data.fotoUrl === "string" ? data.fotoUrl : null,
      rol: data.rol,
      empresaId: typeof data.empresaId === "string" ? data.empresaId : null,
      obraId: typeof data.obraId === "string" ? data.obraId : null,
      activo: true,
      createdAt:
        typeof data.createdAt === "string" ? data.createdAt : undefined,
      updatedAt:
        typeof data.updatedAt === "string" ? data.updatedAt : undefined,
    };
  } catch {
    return null;
  }
}

function leerPerfilLocalDemoPermitido(): ProfileCE | null {
  const perfil = leerPerfilLocal();
  if (!perfil?.email) return null;
  if (!esOrigenLocalDemo() || !esEmailDemoCE(perfil.email)) return null;
  return perfil;
}

function guardarPerfilLocal(perfil: ProfileCE) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_LOCAL_STORAGE_KEY, JSON.stringify(perfil));
}

function limpiarPerfilLocal() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_LOCAL_STORAGE_KEY);
}

function mapearProfile(fila: FilaProfileCE): ProfileCE {
  const rol: RoleCE = esRoleCE(fila.rol) ? fila.rol : "visualizador_auditor";

  return {
    id: fila.id,
    nombre: fila.nombre || fila.email || "Usuario CE",
    email: fila.email,
    cargo: fila.cargo,
    telefono: fila.telefono,
    fotoUrl: fila.foto_url,
    rol,
    empresaId: fila.empresa_id,
    obraId: fila.obra_id,
    activo: fila.activo !== false,
    createdAt: fila.created_at || undefined,
    updatedAt: fila.updated_at || undefined,
  };
}

export async function obtenerAuthProfileActual(): Promise<EstadoAuthProfileCE> {
  const cliente = await obtenerSupabaseCliente();

  if (!cliente) {
    const perfilLocal = leerPerfilLocal();

    if (perfilLocal) {
      return {
        usuario: null,
        perfil: perfilLocal,
        autenticado: true,
        perfilDisponible: true,
      };
    }

    return {
      usuario: null,
      perfil: null,
      autenticado: false,
      perfilDisponible: false,
    };
  }

  try {
    const { data: usuarioData, error: usuarioError } =
      await cliente.auth.getUser();

    if (usuarioError || !usuarioData.user) {
      const perfilLocal = leerPerfilLocalDemoPermitido();

      if (perfilLocal) {
        return {
          usuario: null,
          perfil: perfilLocal,
          autenticado: true,
          perfilDisponible: true,
        };
      }

      const perfilOffline = navegadorSinConexion() ? leerPerfilLocal() : null;

      if (perfilOffline) {
        return {
          usuario: null,
          perfil: perfilOffline,
          autenticado: true,
          perfilDisponible: true,
        };
      }

      return {
        usuario: null,
        perfil: null,
        autenticado: false,
        perfilDisponible: false,
        error: usuarioError ? sanitizarError(usuarioError) : undefined,
      };
    }

    const { data: perfilData, error: perfilError } = await cliente
      .from("profiles")
      .select(
        "id,nombre,email,cargo,telefono,foto_url,rol,empresa_id,obra_id,activo,created_at,updated_at"
      )
      .eq("id", usuarioData.user.id)
      .maybeSingle();

    if (perfilError || !perfilData) {
      const perfilOffline = navegadorSinConexion() ? leerPerfilLocal() : null;

      if (perfilOffline) {
        return {
          usuario: usuarioData.user,
          perfil: perfilOffline,
          autenticado: true,
          perfilDisponible: true,
          error: perfilError ? sanitizarError(perfilError) : undefined,
        };
      }

      return {
        usuario: usuarioData.user,
        perfil: null,
        autenticado: true,
        perfilDisponible: false,
        error: perfilError ? sanitizarError(perfilError) : undefined,
      };
    }

    const filaPerfil = perfilData as FilaProfileCE;

    if (!esRoleCE(filaPerfil.rol)) {
      return {
        usuario: usuarioData.user,
        perfil: null,
        autenticado: true,
        perfilDisponible: false,
        error:
          "Usuario autenticado, pero con rol no reconocido. Contacte al administrador.",
      };
    }

    if (filaPerfil.activo === false) {
      return {
        usuario: usuarioData.user,
        perfil: null,
        autenticado: true,
        perfilDisponible: false,
        error:
          "Usuario autenticado, pero el perfil esta inactivo. Contacte al administrador.",
      };
    }

    const perfil = mapearProfile(filaPerfil);
    guardarPerfilLocal(perfil);

    return {
      usuario: usuarioData.user,
      perfil,
      autenticado: true,
      perfilDisponible: true,
    };
  } catch (error) {
    const perfilOffline = navegadorSinConexion() ? leerPerfilLocal() : null;

    if (perfilOffline) {
      return {
        usuario: null,
        perfil: perfilOffline,
        autenticado: true,
        perfilDisponible: true,
        error: sanitizarError(error),
      };
    }

    return {
      usuario: null,
      perfil: null,
      autenticado: false,
      perfilDisponible: false,
      error: sanitizarError(error),
    };
  }
}

export async function actualizarPerfilActualCE(
  cambios: ActualizarPerfilActualCEInput
): Promise<ResultadoActualizarPerfilActualCE> {
  const cliente = await obtenerSupabaseCliente();

  if (!cliente) {
    return { ok: false, error: "Supabase no esta disponible para guardar perfil." };
  }

  try {
    const { data: usuarioData, error: usuarioError } =
      await cliente.auth.getUser();

    if (usuarioError || !usuarioData.user) {
      return {
        ok: false,
        error: usuarioError
          ? sanitizarError(usuarioError)
          : "Debes iniciar sesion para guardar el perfil.",
      };
    }

    const nombre = cambios.nombre.trim();

    if (!nombre) {
      return { ok: false, error: "El nombre del perfil es obligatorio." };
    }

    const { data, error } = await cliente
      .from("profiles")
      .update({
        nombre,
        cargo: cambios.cargo?.trim() || null,
        telefono: cambios.telefono?.trim() || null,
      })
      .eq("id", usuarioData.user.id)
      .select(
        "id,nombre,email,cargo,telefono,foto_url,rol,empresa_id,obra_id,activo,created_at,updated_at"
      )
      .maybeSingle();

    if (error || !data) {
      return {
        ok: false,
        error: error
          ? `No se pudo guardar el perfil en Supabase: ${sanitizarError(error)}`
          : "No se pudo guardar el perfil porque no se encontro el registro del usuario.",
      };
    }

    const filaPerfil = data as FilaProfileCE;

    if (!esRoleCE(filaPerfil.rol)) {
      return {
        ok: false,
        error: "El perfil actualizado tiene un rol no reconocido.",
      };
    }

    return {
      ok: true,
      perfil: mapearProfile(filaPerfil),
    };
  } catch (error) {
    return {
      ok: false,
      error: `No se pudo guardar el perfil: ${sanitizarError(error)}`,
    };
  }
}

export async function iniciarSesionConPasswordCE(
  email: string,
  password: string
) {
  const cliente = await obtenerSupabaseCliente();
  const emailNormalizado = email.trim().toLowerCase();

  if (!cliente) {
    if (!emailNormalizado || !password) {
      return { ok: false, error: "Ingresa email y contraseña." };
    }

    guardarPerfilLocal(crearPerfilLocal(emailNormalizado));
    return { ok: true, error: undefined };
  }

  const { error } = await cliente.auth.signInWithPassword({
    email: emailNormalizado,
    password,
  });

  if (error) {
    if (esOrigenLocalDemo() && esEmailDemoCE(emailNormalizado)) {
      guardarPerfilLocal(crearPerfilLocal(emailNormalizado));
      return { ok: true, error: undefined };
    }

    return { ok: false, error: sanitizarError(error) };
  }

  limpiarPerfilLocal();
  return { ok: true, error: undefined };
}

export async function enviarMagicLinkCE(email: string) {
  const cliente = await obtenerSupabaseCliente();
  if (!cliente) return { ok: false, error: "Supabase Auth no disponible." };

  const { error } = await cliente.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo:
        typeof window !== "undefined" ? `${window.location.origin}/login` : undefined,
    },
  });

  return error
    ? { ok: false, error: sanitizarError(error) }
    : { ok: true, error: undefined };
}

export async function cerrarSesionCE() {
  limpiarPerfilLocal();

  const cliente = await obtenerSupabaseCliente();
  if (!cliente) return { ok: true, error: undefined };

  const { error } = await cliente.auth.signOut();
  return error
    ? { ok: false, error: sanitizarError(error) }
    : { ok: true, error: undefined };
}
