export const STORAGE_REPORTE_ACTUAL = "ce_mobile_v2_reporte_actual";
export const STORAGE_HISTORIAL = "ce_mobile_v2_historial_reportes";
const MAX_HISTORIAL_LOCAL = 50;
const MEMORIA_REPORTE_ACTUAL = "__ce_mobile_v2_reporte_actual_completo";

export type FotoReporteV2Storage = {
  id?: string;
  nombre?: string;
  tipo?: string;
  dataUrl?: string;
  url?: string;
  storagePath?: string;
  fechaCarga?: string;
  dataUrlOmitida?: boolean;
  storagePendiente?: boolean;
};

export type ReporteV2Storage = {
  codigo?: string;
  supervisor?: string;
  supervisorFoto?: string;
  cargo?: string;
  empresa?: string;
  obra?: string;
  proyecto?: string;
  siglaEmpresa?: string;
  siglaProyecto?: string;
  area?: string;
  descripcion?: string;
  fecha?: string;
  hora?: string;
  estado?: string;
  estadoCierre?: string;
  estadoValidacion?: string;
  mensajeValidacion?: string;
  fechaGuardado?: string;
  fotos?: FotoReporteV2Storage[];
  gps?: {
    latitud?: number;
    longitud?: number;
    precisionGps?: number;
    fechaHoraGeolocalizacion?: string;
    estadoGeolocalizacion?: string;
  };
  evaluacion?: {
    respuestas?: Record<string, string>;
    puntaje?: number;
    criticidad?: string;
    prioridad?: string;
    recomendacion?: string;
    accionInmediata?: string;
  };
  cierre?: Record<string, unknown>;
  asignacionCierre?: Record<string, unknown>;
  sincronizacionCentral?: {
    estado?: "sincronizado" | "pendiente" | "error";
    mensaje?: string;
    fecha?: string;
  };
};

function obtenerWindowConMemoria() {
  return window as typeof window & {
    [MEMORIA_REPORTE_ACTUAL]?: ReporteV2Storage;
  };
}

function esQuotaExceeded(error: unknown) {
  return (
    error instanceof DOMException &&
    (error.name === "QuotaExceededError" ||
      error.name === "NS_ERROR_DOM_QUOTA_REACHED")
  );
}

function descripcionResumida(valor: unknown) {
  const texto = String(valor ?? "").trim();
  return texto.length > 500 ? `${texto.slice(0, 497)}...` : texto;
}

function fotoSinBase64(foto: FotoReporteV2Storage): FotoReporteV2Storage {
  const { dataUrl, ...metadata } = foto;
  return {
    ...metadata,
    dataUrlOmitida: Boolean(dataUrl),
    storagePendiente: Boolean(dataUrl && !foto.url && !foto.storagePath),
  };
}

export function crearReporteLivianoV2(reporte: ReporteV2Storage): ReporteV2Storage {
  return {
    ...reporte,
    supervisorFoto: reporte.supervisorFoto ? "" : reporte.supervisorFoto,
    descripcion: descripcionResumida(reporte.descripcion),
    fotos: Array.isArray(reporte.fotos)
      ? reporte.fotos.map((foto) => fotoSinBase64(foto))
      : [],
  };
}

export function crearReporteCentralLivianoV2(
  reporte: ReporteV2Storage
): ReporteV2Storage {
  return {
    ...reporte,
    supervisorFoto: "",
    fotos: Array.isArray(reporte.fotos)
      ? reporte.fotos.map((foto) => fotoSinBase64(foto))
      : [],
  };
}

export function guardarJsonSeguroV2(clave: string, valor: unknown) {
  const serializado = JSON.stringify(valor);

  try {
    localStorage.setItem(clave, serializado);
    return true;
  } catch (error) {
    if (!esQuotaExceeded(error)) {
      console.warn(`No se pudo guardar ${clave} en localStorage.`, error);
      return false;
    }

    try {
      localStorage.removeItem(clave);
      localStorage.setItem(clave, serializado);
      return true;
    } catch (segundoError) {
      console.warn(
        `Safari no permitio guardar ${clave}; se mantiene memoria de sesion.`,
        segundoError
      );
      return false;
    }
  }
}

export function leerReporteActualV2(): ReporteV2Storage | null {
  const memoria = obtenerWindowConMemoria()[MEMORIA_REPORTE_ACTUAL];
  if (memoria) return memoria;

  try {
    const guardado = localStorage.getItem(STORAGE_REPORTE_ACTUAL);
    if (!guardado) return null;

    const reporte = JSON.parse(guardado);
    if (!reporte || typeof reporte !== "object") return null;

    return reporte;
  } catch (error) {
    console.warn("No se pudo leer reporte V2 actual.", error);
    return null;
  }
}

export function guardarReporteActualV2(reporte: ReporteV2Storage) {
  obtenerWindowConMemoria()[MEMORIA_REPORTE_ACTUAL] = reporte;
  return guardarJsonSeguroV2(STORAGE_REPORTE_ACTUAL, crearReporteLivianoV2(reporte));
}

export function cargarHistorialLivianoV2(): ReporteV2Storage[] {
  try {
    const guardado = JSON.parse(localStorage.getItem(STORAGE_HISTORIAL) || "[]");
    return Array.isArray(guardado) ? guardado.map(crearReporteLivianoV2) : [];
  } catch (error) {
    console.warn("No se pudo leer historial V2 local.", error);
    return [];
  }
}

export function guardarHistorialLivianoV2(reporte: ReporteV2Storage) {
  const historial = cargarHistorialLivianoV2();
  const reporteLiviano = crearReporteLivianoV2(reporte);
  const indiceExistente = historial.findIndex(
    (item) => item.codigo && item.codigo === reporteLiviano.codigo
  );
  const actualizado =
    indiceExistente >= 0
      ? historial.map((item, index) =>
          index === indiceExistente ? { ...item, ...reporteLiviano } : item
        )
      : [...historial, reporteLiviano];
  const limitado = actualizado.slice(-MAX_HISTORIAL_LOCAL);

  return guardarJsonSeguroV2(STORAGE_HISTORIAL, limitado);
}
