import { obtenerSupabaseCliente } from "@/lib/supabaseClient";
import { esRoleCE, type ProfileCE, type RoleCE } from "@/app/types/authRoles";
import type { User } from "@supabase/supabase-js";

export type EstadoAuthProfileCE = {
  usuario: User | null;
  perfil: ProfileCE | null;
  autenticado: boolean;
  perfilDisponible: boolean;
  error?: string;
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
      return {
        usuario: usuarioData.user,
        perfil: null,
        autenticado: true,
        perfilDisponible: false,
        error: perfilError ? sanitizarError(perfilError) : undefined,
      };
    }

    return {
      usuario: usuarioData.user,
      perfil: mapearProfile(perfilData as FilaProfileCE),
      autenticado: true,
      perfilDisponible: true,
    };
  } catch (error) {
    return {
      usuario: null,
      perfil: null,
      autenticado: false,
      perfilDisponible: false,
      error: sanitizarError(error),
    };
  }
}

export async function iniciarSesionConPasswordCE(
  email: string,
  password: string
) {
  const cliente = await obtenerSupabaseCliente();
  if (!cliente) return { ok: false, error: "Supabase Auth no disponible." };

  const { error } = await cliente.auth.signInWithPassword({
    email,
    password,
  });

  return error
    ? { ok: false, error: sanitizarError(error) }
    : { ok: true, error: undefined };
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
  const cliente = await obtenerSupabaseCliente();
  if (!cliente) return { ok: true, error: undefined };

  const { error } = await cliente.auth.signOut();
  return error
    ? { ok: false, error: sanitizarError(error) }
    : { ok: true, error: undefined };
}
