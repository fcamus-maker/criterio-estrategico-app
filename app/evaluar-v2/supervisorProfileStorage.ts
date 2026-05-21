import { obtenerAuthProfileActual } from "@/app/services/authProfileService";
import type { ProfileCE } from "@/app/types/authRoles";

export type SupervisorV2 = {
  nombre: string;
  cargo: string;
  empresa: string;
  obra: string;
  siglaEmpresa: string;
  siglaProyecto: string;
  foto: string;
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

export function perfilSupervisorV2Completo(supervisor: SupervisorV2) {
  return Boolean(
    supervisor.empresa.trim() &&
      supervisor.obra.trim() &&
      supervisor.siglaEmpresa.trim() &&
      supervisor.siglaProyecto.trim()
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

  return {
    nombre: String(guardado.nombre || fallback.nombre || ""),
    cargo: String(guardado.cargo || fallback.cargo || ""),
    empresa: String(guardado.empresa || fallback.empresa || ""),
    obra: String(guardado.obra || fallback.obra || ""),
    siglaEmpresa: String(guardado.siglaEmpresa || fallback.siglaEmpresa || ""),
    siglaProyecto: String(guardado.siglaProyecto || fallback.siglaProyecto || ""),
    foto: String(guardado.foto || fallback.foto || ""),
  };
}

function supervisorDesdeProfile(perfil: ProfileCE | null): SupervisorV2 {
  if (!perfil) return SUPERVISOR_V2_VACIO;

  return {
    ...SUPERVISOR_V2_VACIO,
    nombre: perfil.nombre || "",
    cargo: perfil.cargo || "",
    foto: perfil.fotoUrl || "",
  };
}

export function claveSupervisorV2PorUsuario(userId: string) {
  return `ce_mobile_v2_supervisor_${encodeURIComponent(userId)}`;
}

export async function cargarSupervisorV2UsuarioActual() {
  const auth = await obtenerAuthProfileActual();
  const userId = auth.usuario?.id || "";
  const fallback = supervisorDesdeProfile(auth.perfil);
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
    const guardado = JSON.parse(window.localStorage.getItem(clave) || "null");
    const tienePerfilGuardado = Boolean(guardado && typeof guardado === "object");

    return {
      supervisor: tienePerfilGuardado
        ? normalizarSupervisor(guardado, fallback)
        : fallback,
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
}
