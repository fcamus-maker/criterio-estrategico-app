export const STORAGE_REPORTE_ACTUAL = "ce_mobile_v2_reporte_actual";
export const STORAGE_HISTORIAL = "ce_mobile_v2_historial_reportes";
const MAX_HISTORIAL_LOCAL = 50;
const MEMORIA_REPORTE_ACTUAL = "__ce_mobile_v2_reporte_actual_completo";
const EVIDENCIAS_DB = "ce_mobile_v2_evidencias";
const EVIDENCIAS_STORE = "evidencias_pendientes";

export type FotoReporteV2Storage = {
  id?: string;
  nombre?: string;
  tipo?: string;
  bucket?: string;
  dataUrl?: string;
  url?: string;
  storagePath?: string;
  tamanoBytes?: number;
  pesoBytes?: number;
  indice?: number;
  estadoSubida?: "pendiente" | "subiendo" | "subida" | "error";
  fechaCarga?: string;
  fechaCaptura?: string;
  fechaSubida?: string;
  dataUrlOmitida?: boolean;
  storagePendiente?: boolean;
  localBlobKey?: string;
  origen?: string;
  intentos?: number;
  error?: string;
};

type EvidenciaLocalPendienteV2 = {
  key: string;
  dataUrl: string;
  nombre?: string;
  tipo?: string;
  fechaCaptura?: string;
  tamanoBytes?: number;
  pesoBytes?: number;
  actualizadaEn: string;
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
  empresaInvolucradaResponsable?: string;
  responsableEmpresa?: string;
  cargoResponsableEmpresa?: string;
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
    estadoGeolocalizacion?: "obtenido" | "pendiente" | "denegado" | "error" | string;
    motivoGeolocalizacion?: string;
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

function estimarBytesDataUrl(dataUrl: string | undefined) {
  if (!dataUrl) return undefined;
  const base64 = dataUrl.split(",")[1] || "";
  return Math.max(0, Math.round((base64.length * 3) / 4));
}

function crearLocalBlobKey(foto: FotoReporteV2Storage) {
  const id = String(foto.id || foto.nombre || Date.now()).replace(/[^a-zA-Z0-9._-]/g, "-");
  return foto.localBlobKey || `mobile-v2-evidencia-${id}`;
}

function abrirDbEvidencias(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);

  return new Promise((resolve) => {
    const request = indexedDB.open(EVIDENCIAS_DB, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(EVIDENCIAS_STORE)) {
        db.createObjectStore(EVIDENCIAS_STORE, { keyPath: "key" });
      }
    };

    request.onerror = () => {
      console.warn("No se pudo abrir IndexedDB para evidencias pendientes.", request.error);
      resolve(null);
    };
    request.onsuccess = () => resolve(request.result);
  });
}

async function guardarEvidenciaLocal(
  evidencia: EvidenciaLocalPendienteV2
): Promise<boolean> {
  const db = await abrirDbEvidencias();
  if (!db) return false;

  return new Promise((resolve) => {
    const tx = db.transaction(EVIDENCIAS_STORE, "readwrite");
    tx.objectStore(EVIDENCIAS_STORE).put(evidencia);
    tx.oncomplete = () => {
      db.close();
      resolve(true);
    };
    tx.onerror = () => {
      console.warn("No se pudo guardar evidencia local pendiente.", tx.error);
      db.close();
      resolve(false);
    };
  });
}

export async function leerEvidenciaLocalV2(
  key: string | undefined
): Promise<string | undefined> {
  if (!key) return undefined;
  const db = await abrirDbEvidencias();
  if (!db) return undefined;

  return new Promise((resolve) => {
    const tx = db.transaction(EVIDENCIAS_STORE, "readonly");
    const request = tx.objectStore(EVIDENCIAS_STORE).get(key);

    request.onsuccess = () => {
      const registro = request.result as EvidenciaLocalPendienteV2 | undefined;
      db.close();
      resolve(registro?.dataUrl);
    };
    request.onerror = () => {
      db.close();
      resolve(undefined);
    };
  });
}

export async function eliminarEvidenciaLocalV2(key: string | undefined) {
  if (!key) return;
  const db = await abrirDbEvidencias();
  if (!db) return;

  await new Promise<void>((resolve) => {
    const tx = db.transaction(EVIDENCIAS_STORE, "readwrite");
    tx.objectStore(EVIDENCIAS_STORE).delete(key);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      resolve();
    };
  });
}

export async function prepararReporteConEvidenciasLocalesV2(
  reporte: ReporteV2Storage
): Promise<{ reporte: ReporteV2Storage; ok: boolean; error?: string }> {
  const fotos = Array.isArray(reporte.fotos) ? reporte.fotos : [];
  let ok = true;

  const fotosPreparadas = await Promise.all(
    fotos.map(async (foto) => {
      if (foto.storagePath || foto.url || !foto.dataUrl) return foto;

      const localBlobKey = crearLocalBlobKey(foto);
      const fechaCaptura = foto.fechaCaptura || foto.fechaCarga || new Date().toISOString();
      const guardada = await guardarEvidenciaLocal({
        key: localBlobKey,
        dataUrl: foto.dataUrl,
        nombre: foto.nombre,
        tipo: foto.tipo,
        fechaCaptura,
        tamanoBytes: foto.tamanoBytes || estimarBytesDataUrl(foto.dataUrl),
        pesoBytes: foto.pesoBytes || foto.tamanoBytes || estimarBytesDataUrl(foto.dataUrl),
        actualizadaEn: new Date().toISOString(),
      });

      if (!guardada) ok = false;

      return {
        ...foto,
        localBlobKey,
        fechaCaptura,
        tamanoBytes: foto.tamanoBytes || estimarBytesDataUrl(foto.dataUrl),
        pesoBytes: foto.pesoBytes || foto.tamanoBytes || estimarBytesDataUrl(foto.dataUrl),
        estadoSubida: foto.estadoSubida || "pendiente",
        storagePendiente: true,
        origen: foto.origen || "mobile-v2",
        intentos: foto.intentos || 0,
      };
    })
  );

  return {
    reporte: {
      ...reporte,
      fotos: fotosPreparadas,
    },
    ok,
    error: ok
      ? undefined
      : "No se pudo conservar localmente una evidencia fotográfica para reintento.",
  };
}

export async function hidratarReporteConEvidenciasLocalesV2(
  reporte: ReporteV2Storage
): Promise<ReporteV2Storage> {
  const fotos = Array.isArray(reporte.fotos) ? reporte.fotos : [];

  return {
    ...reporte,
    fotos: await Promise.all(
      fotos.map(async (foto) => {
        if (foto.dataUrl || foto.storagePath || foto.url || !foto.localBlobKey) {
          return foto;
        }

        const dataUrl = await leerEvidenciaLocalV2(foto.localBlobKey);
        return dataUrl
          ? {
              ...foto,
              dataUrl,
              dataUrlOmitida: false,
              storagePendiente: true,
            }
          : foto;
      })
    ),
  };
}

function fotoSinBase64(foto: FotoReporteV2Storage): FotoReporteV2Storage {
  const { dataUrl, ...metadata } = foto;
  return {
    ...metadata,
    dataUrlOmitida: Boolean(dataUrl),
    storagePendiente: Boolean(
      foto.storagePendiente || (dataUrl && !foto.url && !foto.storagePath)
    ),
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
