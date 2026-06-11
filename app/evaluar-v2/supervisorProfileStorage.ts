import { obtenerAuthProfileActual } from "@/app/services/authProfileService";
import type { ProfileCE } from "@/app/types/authRoles";
import { obtenerSupabaseCliente } from "@/lib/supabaseClient";

const STORAGE_SUPERVISOR_ULTIMO = "ce_mobile_v2_supervisor_ultimo";
const PREFIJO_SUPERVISOR_USUARIO = "ce_mobile_v2_supervisor_";

export type SupervisorV2 = {
  nombre: string;
  cargo: string;
  empresa: string;
  obra: string;
  siglaEmpresa: string;
  siglaProyecto: string;
  foto: string;
  empresaId?: string;
  obraId?: string;
  userId?: string;
  email?: string;
  reportanteUserId?: string;
  supervisorUserId?: string;
  errorContextoPerfil?: string;
};

export const SUPERVISOR_V2_VACIO: SupervisorV2 = {
  nombre: "",
  cargo: "",
  empresa: "",
  obra: "",
  siglaEmpresa: "",
  siglaProyecto: "",
  foto: "",
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function uuidSeguro(valor: unknown) {
  const texto = String(valor || "").trim();
  return UUID_REGEX.test(texto) ? texto : "";
}

type ContextoOperacionalProfile = {
  empresa?: string;
  obra?: string;
  siglaEmpresa?: string;
  siglaProyecto?: string;
  error?: string;
};

function tieneDatosOperacionalesSupervisor(
  supervisor: Pick<
    SupervisorV2,
    "empresa" | "obra" | "siglaEmpresa" | "siglaProyecto"
  >
) {
  return Boolean(
    supervisor.empresa.trim() &&
      supervisor.obra.trim() &&
      supervisor.siglaEmpresa.trim() &&
      supervisor.siglaProyecto.trim()
  );
}

function textoOperacionalUtil(valor: unknown) {
  const normalizado = String(valor || "").trim().toLowerCase();
  return Boolean(
    normalizado &&
      normalizado !== "siglas" &&
      normalizado !== "codigo pendiente" &&
      normalizado !== "código pendiente"
  );
}

export function perfilSupervisorV2Completo(supervisor: SupervisorV2) {
  const tieneDatosOperacionales = tieneDatosOperacionalesSupervisor(supervisor);
  const tieneIdentidad = Boolean(
    uuidSeguro(supervisor.userId) ||
      uuidSeguro(supervisor.reportanteUserId) ||
      uuidSeguro(supervisor.supervisorUserId) ||
      supervisor.email?.trim() ||
      supervisor.nombre.trim()
  );
  const tieneUuidAsignado = Boolean(
    uuidSeguro(supervisor.empresaId) || uuidSeguro(supervisor.obraId)
  );

  if (tieneUuidAsignado) {
    return Boolean(
      tieneIdentidad &&
        uuidSeguro(supervisor.empresaId) &&
        uuidSeguro(supervisor.obraId) &&
        tieneDatosOperacionales
    );
  }

  return Boolean(
    tieneIdentidad && tieneDatosOperacionales
  );
}

export function crearCodigoReporteMovil(
  supervisor: SupervisorV2,
  correlativo: number
) {
  if (!perfilSupervisorV2Completo(supervisor)) return "";

  const proyecto = supervisor.siglaProyecto.trim().toUpperCase();
  const empresa = supervisor.siglaEmpresa.trim().toUpperCase();
  const siguiente = String(correlativo).padStart(4, "0");

  return `CE-${proyecto}/${empresa}-${siguiente}`;
}

function normalizarSupervisor(valor: unknown, fallback: SupervisorV2) {
  const guardado =
    valor && typeof valor === "object" ? (valor as Partial<SupervisorV2>) : {};
  const fotoLocal = String(guardado.foto || "");
  const empresaIdGuardada = uuidSeguro(guardado.empresaId);
  const obraIdGuardada = uuidSeguro(guardado.obraId);
  const empresaIdFallback = uuidSeguro(fallback.empresaId);
  const obraIdFallback = uuidSeguro(fallback.obraId);
  const usarContextoAuth = Boolean(empresaIdFallback || obraIdFallback);
  const localMismoScope =
    (!empresaIdGuardada || empresaIdGuardada === empresaIdFallback) &&
    (!obraIdGuardada || obraIdGuardada === obraIdFallback);
  const contextoAuthCompleto = tieneDatosOperacionalesSupervisor(fallback);
  const localOperacionalCompleto = tieneDatosOperacionalesSupervisor({
    empresa: String(guardado.empresa || ""),
    obra: String(guardado.obra || ""),
    siglaEmpresa: String(guardado.siglaEmpresa || ""),
    siglaProyecto: String(guardado.siglaProyecto || ""),
  });
  const localOperacionalUtil =
    textoOperacionalUtil(guardado.empresa) &&
    textoOperacionalUtil(guardado.obra) &&
    textoOperacionalUtil(guardado.siglaEmpresa) &&
    textoOperacionalUtil(guardado.siglaProyecto);
  const usarLocalOperacional =
    !usarContextoAuth ||
    (!contextoAuthCompleto &&
      localMismoScope &&
      localOperacionalCompleto &&
      localOperacionalUtil);

  return {
    nombre: String(
      usarContextoAuth ? fallback.nombre || guardado.nombre || "" : guardado.nombre || fallback.nombre || ""
    ),
    cargo: String(
      usarContextoAuth ? fallback.cargo || guardado.cargo || "" : guardado.cargo || fallback.cargo || ""
    ),
    empresa: String(
      usarLocalOperacional ? guardado.empresa || fallback.empresa || "" : fallback.empresa || ""
    ),
    obra: String(
      usarLocalOperacional ? guardado.obra || fallback.obra || "" : fallback.obra || ""
    ),
    siglaEmpresa: String(
      usarLocalOperacional
        ? guardado.siglaEmpresa || fallback.siglaEmpresa || ""
        : fallback.siglaEmpresa || ""
    ),
    siglaProyecto: String(
      usarLocalOperacional
        ? guardado.siglaProyecto || fallback.siglaProyecto || ""
        : fallback.siglaProyecto || ""
    ),
    foto: String(fallback.foto || fotoLocal || ""),
    empresaId:
      (usarContextoAuth ? empresaIdFallback : empresaIdGuardada || empresaIdFallback) ||
      undefined,
    obraId:
      (usarContextoAuth ? obraIdFallback : obraIdGuardada || obraIdFallback) ||
      undefined,
    userId:
      uuidSeguro(usarContextoAuth ? fallback.userId || guardado.userId : guardado.userId || fallback.userId) ||
      undefined,
    email: String(
      usarContextoAuth ? fallback.email || guardado.email || "" : guardado.email || fallback.email || ""
    ) || undefined,
    reportanteUserId:
      uuidSeguro(
        usarContextoAuth
          ? fallback.reportanteUserId || guardado.reportanteUserId
          : guardado.reportanteUserId || fallback.reportanteUserId
      ) ||
      undefined,
    supervisorUserId:
      uuidSeguro(
        usarContextoAuth
          ? fallback.supervisorUserId || guardado.supervisorUserId
          : guardado.supervisorUserId || fallback.supervisorUserId
      ) ||
      undefined,
    errorContextoPerfil: String(
      usarContextoAuth
        ? fallback.errorContextoPerfil || ""
        : guardado.errorContextoPerfil || fallback.errorContextoPerfil || ""
    ) || undefined,
  };
}

async function contextoOperacionalDesdeProfile(
  perfil: ProfileCE | null
): Promise<ContextoOperacionalProfile> {
  const empresaId = uuidSeguro(perfil?.empresaId);
  const obraId = uuidSeguro(perfil?.obraId);

  if (!empresaId && !obraId) return {};

  const cliente = await obtenerSupabaseCliente();
  if (!cliente) {
    return {
      error:
        "No se pudo resolver empresa/obra asignada porque Supabase no esta disponible.",
    };
  }

  try {
    const [empresaRespuesta, obraRespuesta] = await Promise.all([
      empresaId
        ? cliente
            .from("empresas")
            .select("nombre,sigla")
            .eq("id", empresaId)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      obraId
        ? cliente
            .from("obras")
            .select("nombre,sigla")
            .eq("id", obraId)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);
    const empresa = empresaRespuesta.data as
      | { nombre?: string | null; sigla?: string | null }
      | null;
    const obra = obraRespuesta.data as
      | { nombre?: string | null; sigla?: string | null }
      | null;
    const errores: string[] = [];

    if ("error" in empresaRespuesta && empresaRespuesta.error) {
      errores.push("empresa asignada");
    }

    if ("error" in obraRespuesta && obraRespuesta.error) {
      errores.push("obra asignada");
    }

    if (empresaId && !empresa?.nombre) {
      errores.push("empresa asignada sin lectura");
    }

    if (obraId && !obra?.nombre) {
      errores.push("obra asignada sin lectura");
    }

    return {
      empresa: empresa?.nombre || "",
      siglaEmpresa: empresa?.sigla || "",
      obra: obra?.nombre || "",
      siglaProyecto: obra?.sigla || "",
      error: errores.length
        ? `No se pudo resolver ${errores.join(" y ")} desde el perfil.`
        : undefined,
    };
  } catch {
    return {
      error: "No se pudo resolver empresa/obra asignada desde el perfil.",
    };
  }
}

function supervisorDesdeProfile(
  perfil: ProfileCE | null,
  userId = "",
  contexto: ContextoOperacionalProfile = {}
): SupervisorV2 {
  if (!perfil) return SUPERVISOR_V2_VACIO;

  const usuarioId = uuidSeguro(userId || perfil.id);

  return {
    ...SUPERVISOR_V2_VACIO,
    nombre: perfil.nombre || "",
    cargo: perfil.cargo || "",
    empresa: contexto.empresa || "",
    obra: contexto.obra || "",
    siglaEmpresa: contexto.siglaEmpresa || "",
    siglaProyecto: contexto.siglaProyecto || "",
    foto: perfil.fotoUrl || "",
    empresaId: uuidSeguro(perfil.empresaId) || undefined,
    obraId: uuidSeguro(perfil.obraId) || undefined,
    userId: usuarioId || undefined,
    email: perfil.email || undefined,
    reportanteUserId: usuarioId || undefined,
    supervisorUserId: usuarioId || undefined,
    errorContextoPerfil: contexto.error || undefined,
  };
}

export function claveSupervisorV2PorUsuario(userId: string) {
  return `${PREFIJO_SUPERVISOR_USUARIO}${encodeURIComponent(userId)}`;
}

function leerSupervisorEnClave(clave: string, fallback = SUPERVISOR_V2_VACIO) {
  if (typeof window === "undefined" || !clave) return null;

  try {
    const guardado = JSON.parse(window.localStorage.getItem(clave) || "null");
    if (!guardado || typeof guardado !== "object") return null;
    return normalizarSupervisor(guardado, fallback);
  } catch {
    return null;
  }
}

export function cargarSupervisorV2LocalReciente() {
  if (typeof window === "undefined") return null;

  const claveUltima = window.localStorage.getItem(STORAGE_SUPERVISOR_ULTIMO);
  const supervisorUltimo = leerSupervisorEnClave(claveUltima || "");

  if (supervisorUltimo) {
    return {
      supervisor: supervisorUltimo,
      clave: claveUltima || "",
      tienePerfilGuardado: true,
    };
  }

  for (let indice = 0; indice < window.localStorage.length; indice += 1) {
    const clave = window.localStorage.key(indice) || "";
    if (!clave.startsWith(PREFIJO_SUPERVISOR_USUARIO)) continue;

    const supervisor = leerSupervisorEnClave(clave);
    if (supervisor) {
      return {
        supervisor,
        clave,
        tienePerfilGuardado: true,
      };
    }
  }

  return null;
}

export async function cargarSupervisorV2UsuarioActual() {
  const auth = await obtenerAuthProfileActual();
  const userId = auth.usuario?.id || auth.perfil?.id || "";
  const contextoOperacional = await contextoOperacionalDesdeProfile(auth.perfil);
  const fallback = supervisorDesdeProfile(auth.perfil, userId, contextoOperacional);
  const clave = userId ? claveSupervisorV2PorUsuario(userId) : "";

  if (typeof window === "undefined" || !clave) {
    return {
      supervisor: fallback,
      tienePerfilGuardado: false,
      clave,
      perfil: auth.perfil,
      userId,
    };
  }

  try {
    const supervisorGuardado = leerSupervisorEnClave(clave, fallback);
    const tienePerfilGuardado = Boolean(supervisorGuardado);

    return {
      supervisor: supervisorGuardado || fallback,
      tienePerfilGuardado,
      clave,
      perfil: auth.perfil,
      userId,
    };
  } catch {
    return {
      supervisor: fallback,
      tienePerfilGuardado: false,
      clave,
      perfil: auth.perfil,
      userId,
    };
  }
}

export function guardarSupervisorV2EnClave(
  clave: string,
  supervisor: SupervisorV2
) {
  if (typeof window === "undefined" || !clave) {
    throw new Error("No hay usuario autenticado para guardar supervisor V2.");
  }

  window.localStorage.setItem(clave, JSON.stringify(supervisor));
  window.localStorage.setItem(STORAGE_SUPERVISOR_ULTIMO, clave);
}
