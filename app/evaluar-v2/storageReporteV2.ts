import type {
  AmbitoEvaluacion,
  CategoriaHallazgoV2,
  ConfianzaClasificacionV2,
  Criticidad,
  ModuloPreguntasV2,
  NormativaAplicable,
  PreguntaSugeridaMotorV2,
  TipoEvento,
} from "./motor-v2/types";

export const STORAGE_REPORTE_ACTUAL = "ce_mobile_v2_reporte_actual";
export const STORAGE_HISTORIAL = "ce_mobile_v2_historial_reportes";
const STORAGE_HISTORIAL_SCOPED_PREFIX = "ce_mobile_v2_historial_reportes_scope_";
const MAX_HISTORIAL_LOCAL = 50;
const MEMORIA_REPORTE_ACTUAL = "__ce_mobile_v2_reporte_actual_completo";
const EVIDENCIAS_DB = "ce_mobile_v2_evidencias";
const EVIDENCIAS_DB_VERSION = 2;
const EVIDENCIAS_STORE = "evidencias_pendientes";
const REPORTES_STORE = "reportes_locales";

export type FotoReporteV2Storage = {
  id?: string;
  evidenceId?: string;
  nombre?: string;
  tipo?: string;
  mimeType?: string;
  bucket?: string;
  dataUrl?: string;
  url?: string;
  storagePath?: string;
  tamanoBytes?: number;
  pesoBytes?: number;
  sizeOriginal?: number;
  sizeCompressed?: number;
  indice?: number;
  estadoSubida?: "pendiente" | "subiendo" | "subida" | "error";
  fechaCarga?: string;
  fechaCaptura?: string;
  capturedAt?: string;
  gpsAt?: string;
  gps?: {
    latitud?: number;
    longitud?: number;
    precisionGps?: number;
    fechaHoraGeolocalizacion?: string;
    estadoGeolocalizacion?: string;
  };
  deviceOnline?: boolean;
  userAgent?: string;
  origenDeclarado?: string;
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
  mimeType?: string;
  fechaCaptura?: string;
  capturedAt?: string;
  gpsAt?: string;
  gps?: FotoReporteV2Storage["gps"];
  deviceOnline?: boolean;
  userAgent?: string;
  origenDeclarado?: string;
  tamanoBytes?: number;
  pesoBytes?: number;
  sizeOriginal?: number;
  sizeCompressed?: number;
  actualizadaEn: string;
};

export type EstadoLocalReporteV2 = "pendiente" | "sincronizado" | "error";

export type UltimoIntentoEnvioReporteV2 = {
  fecha: string;
  estado: EstadoLocalReporteV2;
  canal?: "guardar-y-enviar" | "sesion" | "storage" | "central" | "local";
  mensaje?: string;
  error?: string;
  evidenciasIntentadas?: number;
  evidenciasSubidas?: number;
  evidenciasPendientes?: number;
  centralOk?: boolean;
};

export type EvaluacionMotorV2Storage = {
  evaluacion_motor_version?: "v2" | "fallback";
  ambito_principal?: AmbitoEvaluacion;
  ambitos_secundarios?: AmbitoEvaluacion[];
  tipo_evento?: TipoEvento;
  criticidad_base?: Criticidad;
  criticidad_final?: Criticidad;
  justificacion_tecnica?: string;
  resumen_ejecutivo?: string;
  medida_inmediata_v2?: string;
  plazo_sugerido_v2?: string;
  requiere_suspension?: boolean;
  requiere_contencion_ambiental?: boolean;
  requiere_revision_manual?: boolean;
  normativa_probable?: NormativaAplicable[];
  senales_criticas?: string[];
  factores_elevadores?: string[];
  factores_limitantes?: string[];
  inconsistencias?: string[];
  categoria_detectada?: CategoriaHallazgoV2;
  modulo_preguntas_sugerido?: ModuloPreguntasV2;
  preguntas_sugeridas?: PreguntaSugeridaMotorV2[];
  preguntas_criticas_respondidas?: string[];
  preguntas_faltantes_recomendadas?: PreguntaSugeridaMotorV2[];
  justificacion_modulo_preguntas?: string;
  confianza_clasificacion?: ConfianzaClasificacionV2;
  palabras_clave_detectadas?: string[];
  fuente_evaluacion?: "motor_v2" | "fallback";
};

export type ReporteV2Storage = {
  offlineId?: string;
  scopeLocal?: string;
  codigo?: string;
  supervisor?: string;
  supervisorFoto?: string;
  cargo?: string;
  empresa?: string;
  obra?: string;
  empresaId?: string;
  obraId?: string;
  reportanteUserId?: string;
  supervisorUserId?: string;
  reportanteEmail?: string;
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
  } & EvaluacionMotorV2Storage;
  cierre?: Record<string, unknown>;
  asignacionCierre?: Record<string, unknown>;
  estadoLocal?: EstadoLocalReporteV2;
  ultimoIntentoEnvio?: UltimoIntentoEnvioReporteV2;
  creadoEn?: string;
  actualizadoEn?: string;
  sincronizacionCentral?: {
    estado?: "sincronizado" | "pendiente" | "error";
    mensaje?: string;
    fecha?: string;
  };
};

export type ScopeLocalReporteV2Input = {
  userId?: string | null;
  email?: string | null;
  empresaId?: string | null;
  obraId?: string | null;
};

export type ReporteLocalCompletoV2 = ReporteV2Storage & {
  offlineId: string;
  estadoLocal: EstadoLocalReporteV2;
  ultimoIntentoEnvio?: UltimoIntentoEnvioReporteV2;
  creadoEn: string;
  actualizadoEn: string;
};

export type ResultadoGuardadoLocalCompletoV2 = {
  ok: boolean;
  localStorageOk: boolean;
  reporte: ReporteLocalCompletoV2;
  error?: string;
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

function normalizarParteOfflineId(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 96);
}

function normalizarParteScope(valor: unknown) {
  return String(valor || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9@._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

export function crearScopeLocalReporteV2(input: ScopeLocalReporteV2Input) {
  const usuario = normalizarParteScope(input.userId || input.email);
  const empresa = normalizarParteScope(input.empresaId);
  const obra = normalizarParteScope(input.obraId);

  if (!usuario || !empresa || !obra) return "";
  return `${usuario}:${empresa}:${obra}`;
}

export function scopeLocalDesdeReporteV2(reporte: ReporteV2Storage) {
  const existente = String(reporte.scopeLocal || "").trim();
  if (existente) return existente;

  return crearScopeLocalReporteV2({
    userId: reporte.reportanteUserId || reporte.supervisorUserId,
    email: reporte.reportanteEmail,
    empresaId: reporte.empresaId,
    obraId: reporte.obraId,
  });
}

export function claveHistorialScopedV2(scopeLocal: string) {
  const scope = normalizarParteScope(scopeLocal);
  return scope ? `${STORAGE_HISTORIAL_SCOPED_PREFIX}${scope}` : STORAGE_HISTORIAL;
}

function crearOfflineIdReporteV2(reporte: ReporteV2Storage) {
  const existente = String(reporte.offlineId || "").trim();
  if (existente) return existente;

  const codigo = String(reporte.codigo || "").trim();
  if (codigo) return `offline-${normalizarParteOfflineId(codigo)}`;

  const base = [
    reporte.fechaGuardado,
    reporte.fecha,
    reporte.hora,
    reporte.supervisor,
    reporte.obra,
    reporte.descripcion?.slice(0, 32),
  ]
    .filter(Boolean)
    .join("-");

  if (base) return `offline-${normalizarParteOfflineId(base)}`;
  return `offline-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function asegurarOfflineIdReporteV2<T extends ReporteV2Storage>(
  reporte: T
): T & { offlineId: string } {
  return {
    ...reporte,
    offlineId: crearOfflineIdReporteV2(reporte),
  };
}

function asegurarStoresLocalesV2(db: IDBDatabase) {
  if (!db.objectStoreNames.contains(EVIDENCIAS_STORE)) {
    db.createObjectStore(EVIDENCIAS_STORE, { keyPath: "key" });
  }

  if (!db.objectStoreNames.contains(REPORTES_STORE)) {
    const reportesStore = db.createObjectStore(REPORTES_STORE, {
      keyPath: "offlineId",
    });
    reportesStore.createIndex("estadoLocal", "estadoLocal", { unique: false });
    reportesStore.createIndex("codigo", "codigo", { unique: false });
    reportesStore.createIndex("actualizadoEn", "actualizadoEn", { unique: false });
  }
}

function abrirDbEvidencias(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);

  return new Promise((resolve) => {
    const request = indexedDB.open(EVIDENCIAS_DB, EVIDENCIAS_DB_VERSION);

    request.onupgradeneeded = () => {
      asegurarStoresLocalesV2(request.result);
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
        mimeType: foto.mimeType,
        fechaCaptura,
        capturedAt: foto.capturedAt || fechaCaptura,
        gpsAt: foto.gpsAt,
        gps: foto.gps,
        deviceOnline: foto.deviceOnline,
        userAgent: foto.userAgent,
        origenDeclarado: foto.origenDeclarado,
        tamanoBytes: foto.tamanoBytes || estimarBytesDataUrl(foto.dataUrl),
        pesoBytes: foto.pesoBytes || foto.tamanoBytes || estimarBytesDataUrl(foto.dataUrl),
        sizeOriginal: foto.sizeOriginal,
        sizeCompressed:
          foto.sizeCompressed || foto.pesoBytes || foto.tamanoBytes || estimarBytesDataUrl(foto.dataUrl),
        actualizadaEn: new Date().toISOString(),
      });

      if (!guardada) ok = false;

      return {
        ...foto,
        localBlobKey,
        fechaCaptura,
        capturedAt: foto.capturedAt || fechaCaptura,
        gpsAt: foto.gpsAt,
        gps: foto.gps,
        deviceOnline: foto.deviceOnline,
        userAgent: foto.userAgent,
        mimeType: foto.mimeType || foto.tipo,
        sizeOriginal: foto.sizeOriginal,
        sizeCompressed:
          foto.sizeCompressed || foto.pesoBytes || foto.tamanoBytes || estimarBytesDataUrl(foto.dataUrl),
        origenDeclarado: foto.origenDeclarado,
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

async function guardarReporteCompletoIndexedDbV2(
  reporte: ReporteLocalCompletoV2
): Promise<boolean> {
  const db = await abrirDbEvidencias();
  if (!db) return false;

  return new Promise((resolve) => {
    const tx = db.transaction(REPORTES_STORE, "readwrite");
    tx.objectStore(REPORTES_STORE).put(reporte);
    tx.oncomplete = () => {
      db.close();
      resolve(true);
    };
    tx.onerror = () => {
      console.warn("No se pudo guardar reporte local completo.", tx.error);
      db.close();
      resolve(false);
    };
  });
}

export async function leerReporteLocalCompletoV2(
  offlineId: string | undefined
): Promise<ReporteLocalCompletoV2 | null> {
  if (!offlineId) return null;
  const db = await abrirDbEvidencias();
  if (!db) return null;

  return new Promise((resolve) => {
    const tx = db.transaction(REPORTES_STORE, "readonly");
    const request = tx.objectStore(REPORTES_STORE).get(offlineId);

    request.onsuccess = () => {
      const reporteLocal = request.result as ReporteLocalCompletoV2 | undefined;
      db.close();
      resolve(reporteLocal || null);
    };
    request.onerror = () => {
      db.close();
      resolve(null);
    };
  });
}

export async function listarReportesLocalesCompletosV2(
  estadoLocal?: EstadoLocalReporteV2,
  scopeLocal?: string
): Promise<ReporteLocalCompletoV2[]> {
  const db = await abrirDbEvidencias();
  if (!db) return [];

  return new Promise((resolve) => {
    const tx = db.transaction(REPORTES_STORE, "readonly");
    const store = tx.objectStore(REPORTES_STORE);
    const request = estadoLocal
      ? store.index("estadoLocal").getAll(estadoLocal)
      : store.getAll();

    request.onsuccess = () => {
      db.close();
      const reportes = Array.isArray(request.result)
        ? (request.result as ReporteLocalCompletoV2[])
        : [];
      resolve(
        reportes
          .filter((reporte) => {
            if (!scopeLocal) return true;
            return scopeLocalDesdeReporteV2(reporte) === scopeLocal;
          })
          .sort((a, b) =>
            String(b.actualizadoEn || "").localeCompare(String(a.actualizadoEn || ""))
          )
      );
    };
    request.onerror = () => {
      db.close();
      resolve([]);
    };
  });
}

export async function listarReportesPendientesLocalesV2(
  scopeLocal?: string
): Promise<
  ReporteLocalCompletoV2[]
> {
  const [pendientes, conError] = await Promise.all([
    listarReportesLocalesCompletosV2("pendiente", scopeLocal),
    listarReportesLocalesCompletosV2("error", scopeLocal),
  ]);

  const porId = new Map<string, ReporteLocalCompletoV2>();

  for (const reporte of [...pendientes, ...conError]) {
    porId.set(reporte.offlineId, reporte);
  }

  return Array.from(porId.values()).sort((a, b) =>
    String(b.actualizadoEn || "").localeCompare(String(a.actualizadoEn || ""))
  );
}

export async function guardarReporteLocalCompletoV2(
  reporte: ReporteV2Storage,
  estadoLocal: EstadoLocalReporteV2,
  ultimoIntentoEnvio?: UltimoIntentoEnvioReporteV2
): Promise<ResultadoGuardadoLocalCompletoV2> {
  const ahora = new Date().toISOString();
  const reporteConEvidencias = (
    await prepararReporteConEvidenciasLocalesV2(
      await hidratarReporteConEvidenciasLocalesV2(reporte)
    )
  ).reporte;
  const reporteConId = asegurarOfflineIdReporteV2(reporteConEvidencias);
  const intento = ultimoIntentoEnvio || reporteConId.ultimoIntentoEnvio || {
    fecha: ahora,
    estado: estadoLocal,
    canal: "local" as const,
    mensaje: "Respaldo local completo actualizado.",
  };
  const reporteLocal: ReporteLocalCompletoV2 = {
    ...reporteConId,
    scopeLocal: reporteConId.scopeLocal || scopeLocalDesdeReporteV2(reporteConId),
    estadoLocal,
    ultimoIntentoEnvio: intento,
    creadoEn: reporteConId.creadoEn || ahora,
    actualizadoEn: ahora,
    sincronizacionCentral: {
      estado:
        reporteConId.sincronizacionCentral?.estado ||
        (estadoLocal === "sincronizado" ? "sincronizado" : "pendiente"),
      mensaje: reporteConId.sincronizacionCentral?.mensaje || intento.mensaje,
      fecha: reporteConId.sincronizacionCentral?.fecha || intento.fecha || ahora,
    },
  };
  let error: string | undefined;
  const indexedDbOk = await guardarReporteCompletoIndexedDbV2(reporteLocal).catch(
    (fallo) => {
      error =
        fallo instanceof Error
          ? fallo.message
          : String(fallo || "No se pudo guardar reporte local completo.");
      return false;
    }
  );
  const actualOk = guardarReporteActualV2(reporteLocal);
  const historialOk = guardarHistorialLivianoV2(reporteLocal);

  return {
    ok: indexedDbOk,
    localStorageOk: actualOk || historialOk,
    reporte: reporteLocal,
    error,
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

export function limpiarReporteActualV2() {
  delete obtenerWindowConMemoria()[MEMORIA_REPORTE_ACTUAL];

  try {
    localStorage.removeItem(STORAGE_REPORTE_ACTUAL);
    return true;
  } catch (error) {
    console.warn("No se pudo limpiar reporte V2 actual.", error);
    return false;
  }
}

export function cargarHistorialLivianoV2(scopeLocal?: string): ReporteV2Storage[] {
  try {
    const clave = scopeLocal ? claveHistorialScopedV2(scopeLocal) : STORAGE_HISTORIAL;
    const guardado = JSON.parse(localStorage.getItem(clave) || "[]");
    return Array.isArray(guardado) ? guardado.map(crearReporteLivianoV2) : [];
  } catch (error) {
    console.warn("No se pudo leer historial V2 local.", error);
    return [];
  }
}

export function guardarHistorialLivianoV2(reporte: ReporteV2Storage) {
  const scopeLocal = scopeLocalDesdeReporteV2(reporte);
  const historial = cargarHistorialLivianoV2(scopeLocal);
  const reporteLiviano = crearReporteLivianoV2({
    ...reporte,
    scopeLocal,
  });
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

  return guardarJsonSeguroV2(claveHistorialScopedV2(scopeLocal), limitado);
}
