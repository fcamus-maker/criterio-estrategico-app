import type {
  EstadoCierreCentral,
  EstadoHallazgoCentral,
} from "../types/hallazgoCentral";

export type EtapaCierreHallazgo =
  | "PENDIENTE_ASIGNACION"
  | "ASIGNADO"
  | "PENDIENTE_EVIDENCIA"
  | "EN_REVISION"
  | "REQUIERE_CORRECCION"
  | "VERIFICADO";

export type AccionPrincipalCierre =
  | "ASIGNAR"
  | "REGISTRAR_AVANCE"
  | "ENVIAR_EVIDENCIA"
  | "REVISAR_EVIDENCIA"
  | "CORREGIR_Y_REENVIAR"
  | "VER_TRAZABILIDAD";

export type RolFlujoCierre =
  | "super_admin_ce"
  | "admin_cliente"
  | "admin_mandante"
  | "prevencionista_cliente"
  | "supervisor_reportante"
  | "responsable_cierre"
  | "visualizador_auditor"
  | string;

export type EntradaEtapaCierre = {
  estado?: string | null;
  estadoCierre?: string | null;
  estadoSeguimiento?: string | null;
  responsableNombre?: string | null;
  validadorEstado?: string | null;
  cantidadEvidencias?: number | null;
};

export type ResultadoAsignacionCierre = {
  estado: EstadoHallazgoCentral;
  estadoCierre: EstadoCierreCentral;
  estadoSeguimiento: "Pendiente de asignación" | "Asignado" | "En seguimiento";
};

export type ResultadoRevisionCierre = {
  estado: EstadoHallazgoCentral;
  estadoCierre: EstadoCierreCentral;
  estadoSeguimiento: "Cerrado con evidencia" | "Requiere nueva evidencia";
  validadorEstado: "Aprobado" | "Rechazado";
};

export type ResultadoEnvioEvidenciaCierre = {
  estado: "EN_SEGUIMIENTO";
  estadoCierre: "EN_GESTION";
  estadoSeguimiento: "En revisión";
  validadorEstado: "Pendiente de revision";
};

const textoNormalizado = (valor?: string | null) =>
  String(valor || "")
    .trim()
    .toLocaleUpperCase("es-CL")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s-]+/g, "_");

const contiene = (valor: string, opciones: string[]) =>
  opciones.some((opcion) => valor.includes(opcion));

export function resolverEtapaCierre(
  entrada: EntradaEtapaCierre
): EtapaCierreHallazgo {
  const estado = textoNormalizado(entrada.estado);
  const estadoCierre = textoNormalizado(entrada.estadoCierre);
  const seguimiento = textoNormalizado(entrada.estadoSeguimiento);
  const validacion = textoNormalizado(entrada.validadorEstado);
  const responsable = String(entrada.responsableNombre || "").trim();
  const cantidadEvidencias = Math.max(0, Number(entrada.cantidadEvidencias || 0));

  if (
    estado === "CERRADO" ||
    estadoCierre === "CERRADO" ||
    validacion === "APROBADO" ||
    contiene(seguimiento, ["CERRADO_CON_EVIDENCIA", "VERIFICADO"])
  ) {
    return "VERIFICADO";
  }

  if (
    estadoCierre === "RECHAZADO" ||
    validacion === "RECHAZADO" ||
    contiene(seguimiento, [
      "REQUIERE_NUEVA_EVIDENCIA",
      "EVIDENCIA_RECHAZADA",
      "REQUIERE_CORRECCION",
      "RECHAZADO",
    ])
  ) {
    return "REQUIERE_CORRECCION";
  }

  if (
    cantidadEvidencias > 0 ||
    contiene(seguimiento, ["EN_REVISION", "EVIDENCIA_CARGADA", "EVIDENCIA_ENVIADA"])
  ) {
    return "EN_REVISION";
  }

  if (
    contiene(seguimiento, ["PENDIENTE_DE_EVIDENCIA", "EVIDENCIA_SOLICITADA", "EN_SEGUIMIENTO"]) ||
    estadoCierre === "EN_GESTION"
  ) {
    return "PENDIENTE_EVIDENCIA";
  }

  if (
    responsable &&
    !contiene(textoNormalizado(responsable), ["SIN_ASIGNAR", "PENDIENTE"])
  ) {
    return "ASIGNADO";
  }

  return "PENDIENTE_ASIGNACION";
}

export function accionPrincipalPorEtapa(
  etapa: EtapaCierreHallazgo
): AccionPrincipalCierre {
  switch (etapa) {
    case "PENDIENTE_ASIGNACION":
      return "ASIGNAR";
    case "ASIGNADO":
      return "REGISTRAR_AVANCE";
    case "PENDIENTE_EVIDENCIA":
      return "ENVIAR_EVIDENCIA";
    case "EN_REVISION":
      return "REVISAR_EVIDENCIA";
    case "REQUIERE_CORRECCION":
      return "CORREGIR_Y_REENVIAR";
    case "VERIFICADO":
      return "VER_TRAZABILIDAD";
  }
}

export function construirEstadoAsignacion(input: {
  responsableNombre?: string | null;
  estadoSeguimientoAnterior?: string | null;
}): ResultadoAsignacionCierre {
  const responsable = String(input.responsableNombre || "").trim();
  const estadoAnterior = textoNormalizado(input.estadoSeguimientoAnterior);

  if (!responsable || contiene(textoNormalizado(responsable), ["SIN_ASIGNAR", "PENDIENTE"])) {
    return {
      estado: "EN_SEGUIMIENTO",
      estadoCierre: "PENDIENTE",
      estadoSeguimiento: "Pendiente de asignación",
    };
  }

  const yaEstabaEnGestion = contiene(estadoAnterior, [
    "EN_SEGUIMIENTO",
    "PENDIENTE_DE_EVIDENCIA",
    "EVIDENCIA_SOLICITADA",
  ]);

  return {
    estado: "EN_SEGUIMIENTO",
    estadoCierre: yaEstabaEnGestion ? "EN_GESTION" : "ASIGNADO",
    estadoSeguimiento: yaEstabaEnGestion ? "En seguimiento" : "Asignado",
  };
}

export function construirEstadoRevision(
  accion: "aprobar" | "rechazar"
): ResultadoRevisionCierre {
  if (accion === "aprobar") {
    return {
      estado: "CERRADO",
      estadoCierre: "CERRADO",
      estadoSeguimiento: "Cerrado con evidencia",
      validadorEstado: "Aprobado",
    };
  }

  return {
    estado: "EN_SEGUIMIENTO",
    estadoCierre: "RECHAZADO",
    estadoSeguimiento: "Requiere nueva evidencia",
    validadorEstado: "Rechazado",
  };
}

export function construirEstadoEnvioEvidencia(): ResultadoEnvioEvidenciaCierre {
  return {
    estado: "EN_SEGUIMIENTO",
    estadoCierre: "EN_GESTION",
    estadoSeguimiento: "En revisión",
    validadorEstado: "Pendiente de revision",
  };
}

const ROLES_QUE_ASIGNAN = new Set([
  "super_admin_ce",
  "admin_cliente",
  "admin_mandante",
  "prevencionista_cliente",
]);

const ROLES_QUE_VALIDAN = new Set([
  "super_admin_ce",
  "admin_cliente",
  "admin_mandante",
  "prevencionista_cliente",
]);

export const puedeAsignarCierre = (rol?: RolFlujoCierre | null) =>
  ROLES_QUE_ASIGNAN.has(String(rol || ""));

export const puedeValidarCierre = (rol?: RolFlujoCierre | null) =>
  ROLES_QUE_VALIDAN.has(String(rol || ""));

export const puedeEnviarEvidenciaCierre = (rol?: RolFlujoCierre | null) =>
  ["responsable_cierre", "supervisor_reportante"].includes(String(rol || ""));
