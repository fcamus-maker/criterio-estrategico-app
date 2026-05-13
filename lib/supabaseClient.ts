import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseEnabledFlag = process.env.NEXT_PUBLIC_CE_SUPABASE_ENABLED;
let supabaseClienteCache: SupabaseClient | null = null;

export const supabaseConfigurado = Boolean(supabaseUrl && supabaseAnonKey);
export const supabaseHabilitado =
  supabaseConfigurado && supabaseEnabledFlag === "true";

// Compatibilidad con el flujo antiguo: no activa Supabase real en carga inicial.
export const supabase: SupabaseClient | null = null;

export type EstadoSupabaseCliente = {
  habilitado: boolean;
  configurado: boolean;
  banderaActiva: boolean;
  motivoDeshabilitado?: string;
};

export function obtenerEstadoSupabaseCliente(): EstadoSupabaseCliente {
  const banderaActiva = supabaseEnabledFlag === "true";

  if (!banderaActiva) {
    return {
      habilitado: false,
      configurado: supabaseConfigurado,
      banderaActiva,
      motivoDeshabilitado:
        "NEXT_PUBLIC_CE_SUPABASE_ENABLED debe ser true para usar Supabase real.",
    };
  }

  if (!supabaseConfigurado) {
    return {
      habilitado: false,
      configurado: false,
      banderaActiva,
      motivoDeshabilitado:
        "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    };
  }

  return {
    habilitado: true,
    configurado: true,
    banderaActiva,
  };
}

export async function obtenerSupabaseCliente(): Promise<SupabaseClient | null> {
  if (!supabaseHabilitado) return null;
  if (supabaseClienteCache) return supabaseClienteCache;

  const { createClient } = await import("@supabase/supabase-js");
  supabaseClienteCache = createClient(
    supabaseUrl as string,
    supabaseAnonKey as string
  );

  return supabaseClienteCache;
}
