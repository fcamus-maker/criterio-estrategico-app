import {
  obtenerEstadoSupabaseCliente,
  obtenerSupabaseCliente,
} from "../../lib/supabaseClient";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { HallazgosReadFilters } from "../types/hallazgosReadFilters";
import type {
  HallazgoGestionVigente,
  OrigenGestionVigente,
} from "../types/hallazgosReadDtos";
import type {
  BitacoraHallazgoCentral,
  EstadoHallazgoCentral,
  EvidenciaHallazgoCentral,
  GeolocalizacionHallazgoCentral,
  HallazgoCentral,
  RadarPreventivoCentral,
  SeguimientoCierreCentral,
} from "../types/hallazgoCentral";

const TABLA_HALLAZGOS_CENTRAL = "hallazgos_central";
const TABLA_HALLAZGOS_CENTRAL_PUBLICA = "public.hallazgos_central";
const BUCKET_EVIDENCIAS = "hallazgos-evidencias";

export type OrigenRepositorioCentral = "central-disabled" | "supabase";

export type ResultadoRepositorioCentral<T> =
  | {
      ok: true;
      data: T;
      origen: OrigenRepositorioCentral;
      mensaje?: string;
    }
  | {
      ok: false;
      error: string;
      origen: OrigenRepositorioCentral;
      detalle?: unknown;
    };

export type FiltrosHallazgosCentrales = {
  empresa?: string;
  obra?: string;
  empresaId?: string;
  obraId?: string;
  sinAcceso?: boolean;
  area?: string;
  estado?: EstadoHallazgoCentral;
  estadoCierre?: string;
  criticidad?: HallazgoCentral["criticidad"];
  fechaDesde?: string;
  fechaHasta?: string;
  fechaAntesDe?: string;
  fechaCierreDesde?: string;
  fechaCierreHasta?: string;
  origen?: HallazgoCentral["origen"];
  limit?: number;
  offset?: number;
};

export type FiltrosMapaGpsCentral = FiltrosHallazgosCentrales & {
  soloConGps?: boolean;
  zona?: string;
  sector?: string;
};

export type ResumenHistorialSupervisorCentral = {
  reportados: number;
  abiertos: number;
  cerrados: number;
};

export type FiltrosHistorialSupervisorCentral = {
  userId?: string | null;
  empresaId?: string | null;
  obraId?: string | null;
};

export type PuntoMapaHallazgoCentral = {
  id?: string;
  codigo: string;
  empresa: string;
  obra: string;
  area: string;
  criticidad: HallazgoCentral["criticidad"];
  estado: HallazgoCentral["estado"];
  geolocalizacion: GeolocalizacionHallazgoCentral;
};

export type FiltrosRadarPreventivoCentral = FiltrosHallazgosCentrales & {
  categoriaRiesgo?: string;
  causaDominante?: string;
};

export type ResumenRadarPreventivoCentral = {
  totalHallazgos: number;
  porCriticidad: Record<HallazgoCentral["criticidad"], number>;
  porCategoriaRiesgo: Record<string, number>;
  requiereAccionInmediata: number;
  requiereDetencionTrabajo: number;
};

export type SubirEvidenciaHallazgoInput = {
  codigo: string;
  evidenciaId: string;
  archivo: Blob | ArrayBuffer | Uint8Array;
  contentType?: string;
  empresa?: string;
  obra?: string;
  extension?: string;
};

export type ResultadoSubidaEvidencia = {
  bucket: string;
  storagePath: string;
  url?: string;
};

const MENSAJE_REPOSITORIO_DESACTIVADO =
  "Repositorio central desactivado: falta configuracion completa o bandera explicita.";

async function obtenerSupabaseDisponible() {
  const estado = obtenerEstadoSupabaseCliente();
  const cliente = await obtenerSupabaseCliente();

  return {
    estado,
    cliente,
    habilitado: estado.habilitado && Boolean(cliente),
  };
}

export function estaSupabaseHabilitado(): boolean {
  return obtenerEstadoSupabaseCliente().habilitado;
}

export function obtenerEstadoRepositorioCentral() {
  return obtenerEstadoSupabaseCliente();
}

export function obtenerTablaDestinoHallazgosCentral() {
  return TABLA_HALLAZGOS_CENTRAL_PUBLICA;
}

function falloRepositorioDesactivado<T>(): ResultadoRepositorioCentral<T> {
  const estado = obtenerEstadoSupabaseCliente();

  return {
    ok: false,
    error: estado.motivoDeshabilitado || MENSAJE_REPOSITORIO_DESACTIVADO,
    origen: "central-disabled",
  };
}

function lecturaVacia<T>(data: T): ResultadoRepositorioCentral<T> {
  return {
    ok: true,
    data,
    origen: "central-disabled",
    mensaje: MENSAJE_REPOSITORIO_DESACTIVADO,
  };
}

function falloSupabase<T>(
  error: unknown,
  mensaje: string
): ResultadoRepositorioCentral<T> {
  console.warn(mensaje, error);

  return {
    ok: false,
    error: mensaje,
    origen: "supabase",
    detalle: error,
  };
}

function detalleErrorSupabase(error: unknown) {
  if (!error || typeof error !== "object") return texto(error, "Error desconocido");

  const registro = error as {
    message?: unknown;
    error?: unknown;
    details?: unknown;
    hint?: unknown;
    statusCode?: unknown;
    status?: unknown;
    name?: unknown;
  };
  const partes = [
    registro.message,
    registro.error,
    registro.details,
    registro.hint,
    registro.statusCode ? `statusCode=${registro.statusCode}` : "",
    registro.status ? `status=${registro.status}` : "",
    registro.name,
  ]
    .map((valor) => texto(valor))
    .filter(Boolean);

  return partes.length ? partes.join(" · ") : "Error desconocido";
}

function tamanoArchivoStorage(archivo: SubirEvidenciaHallazgoInput["archivo"]) {
  if (archivo instanceof Blob) return archivo.size;
  return archivo.byteLength;
}

function texto(valor: unknown, fallback = "") {
  const limpio = String(valor ?? "").trim();
  return limpio || fallback;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function uuidSupabase(valor: unknown) {
  const limpio = texto(valor);
  return UUID_REGEX.test(limpio) ? limpio : null;
}

function segmentoStorage(valor: unknown, fallback: string) {
  const limpio = texto(valor, fallback)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return limpio || fallback;
}

function numero(valor: unknown): number | undefined {
  if (typeof valor === "number") {
    return Number.isFinite(valor) ? valor : undefined;
  }

  if (typeof valor === "string") {
    const parsed = Number(valor);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function registroJson(valor: unknown): Record<string, unknown> | null {
  return valor && typeof valor === "object" && !Array.isArray(valor)
    ? (valor as Record<string, unknown>)
    : null;
}

function listaJson(valor: unknown): Record<string, unknown>[] {
  return Array.isArray(valor)
    ? valor
        .map((item) => registroJson(item))
        .filter((item): item is Record<string, unknown> => Boolean(item))
    : [];
}

function listaValores(valor: unknown): unknown[] {
  if (Array.isArray(valor)) return valor;
  return valor === undefined || valor === null ? [] : [valor];
}

function textoEvidenciaEsUrl(valor: string) {
  return /^(https?:|data:image\/|blob:)/i.test(valor);
}

function evidenciaDesdeReferencia(
  valor: unknown,
  origenCampo?: string
): EvidenciaHallazgoCentral | null {
  const registro = registroJson(valor);
  if (registro) return evidenciaDesdeRegistro(registro);

  const referencia = texto(valor);
  if (!referencia) return null;

  const partes = referencia.split("/");
  const nombre = partes[partes.length - 1] || referencia;

  return {
    nombre,
    bucket: BUCKET_EVIDENCIAS,
    url: textoEvidenciaEsUrl(referencia) ? referencia : "",
    dataUrl: referencia.startsWith("data:image/") ? referencia : "",
    storagePath: textoEvidenciaEsUrl(referencia) ? "" : referencia,
    estadoSubida: "subida",
    descripcion: origenCampo ? `Evidencia registrada en ${origenCampo}.` : "",
  };
}

function evidenciaDesdeRegistro(
  item: Record<string, unknown>
): EvidenciaHallazgoCentral {
  return {
    id: texto(item.id),
    evidenceId: texto(item.evidenceId || item.evidence_id || item.id),
    nombre: texto(item.nombre || item.name || item.filename),
    tipo: texto(item.tipo || item.contentType || item.content_type),
    mimeType: texto(item.mimeType || item.mime_type || item.tipo || item.contentType || item.content_type),
    bucket: texto(item.bucket, BUCKET_EVIDENCIAS),
    url: texto(
      item.url ||
        item.signedUrl ||
        item.signed_url ||
        item.publicUrl ||
        item.public_url ||
        item.fotoUrl ||
        item.foto_url ||
        item.downloadUrl ||
        item.download_url ||
        item.fotosUrl ||
        item.fotoUrl
    ),
    dataUrl: texto(item.dataUrl || item.data_url || item.base64),
    storagePath: texto(
      item.storagePath ||
        item.storage_path ||
        item.path ||
        item.ruta_storage ||
        item.storagePathCompleto ||
        item.storage_path_completo
    ),
    tamanoBytes: numero(item.tamanoBytes || item.size || item.size_bytes),
    sizeOriginal: numero(item.sizeOriginal || item.size_original),
    sizeCompressed: numero(item.sizeCompressed || item.size_compressed),
    indice: numero(item.indice || item.index),
    estadoSubida: texto(
      item.estadoSubida || item.estado_subida,
      "subida"
    ) as EvidenciaHallazgoCentral["estadoSubida"],
    descripcion: texto(item.descripcion || item.description),
    fechaCarga: texto(item.fechaCarga || item.fecha_carga || item.created_at),
    fechaCaptura: texto(item.fechaCaptura || item.fecha_captura),
    capturedAt: texto(item.capturedAt || item.captured_at || item.fechaCaptura || item.fecha_captura),
    gpsAt: texto(item.gpsAt || item.gps_at),
    gps: registroJson(item.gps) as EvidenciaHallazgoCentral["gps"],
    deviceOnline:
      typeof item.deviceOnline === "boolean"
        ? item.deviceOnline
        : typeof item.device_online === "boolean"
          ? item.device_online
          : undefined,
    userAgent: texto(item.userAgent || item.user_agent),
    origenDeclarado: texto(item.origenDeclarado || item.origen_declarado),
    fechaSubida: texto(item.fechaSubida || item.fecha_subida),
    pesoBytes: numero(item.pesoBytes || item.peso_bytes),
    intentos: numero(item.intentos || item.reintentos),
    localBlobKey: texto(item.localBlobKey || item.local_blob_key),
    origen: texto(item.origen) as EvidenciaHallazgoCentral["origen"],
    error: texto(item.error),
  };
}

const CAMPOS_LISTA_EVIDENCIAS = new Set([
  "evidencias",
  "evidencias_storage",
  "evidenciasstorage",
  "evidenciasfotograficas",
  "evidenciafotografica",
  "fotos",
  "fotos_url",
  "fotos_urls",
  "fotosurl",
  "fotosurls",
  "evidenciaurls",
  "imagenes",
  "imagenesurl",
  "imagenesurls",
  "archivos",
  "adjuntos",
  "media",
  "storage_paths",
  "storagepaths",
  "evidencia_storage_paths",
  "evidenciastoragepaths",
]);

const CAMPOS_CONTENEDORES_EVIDENCIAS = new Set([
  "raw_mobile_v2",
  "metadata",
  "payload",
  "informe_final",
  "datos_originales",
  "reporte",
  "reporte_original",
  "formulario",
  "detalle",
]);

function normalizarClaveEvidencia(clave: string) {
  return clave
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .toLowerCase();
}

function extraerCandidatasEvidencia(
  valor: unknown,
  origenCampo = "",
  profundidad = 0
): EvidenciaHallazgoCentral[] {
  if (profundidad > 4) return [];

  const registro = registroJson(valor);
  if (!registro) {
    return listaValores(valor)
      .map((item) => evidenciaDesdeReferencia(item, origenCampo))
      .filter((item): item is EvidenciaHallazgoCentral => Boolean(item));
  }

  const evidencias: EvidenciaHallazgoCentral[] = [];
  for (const [clave, contenido] of Object.entries(registro)) {
    const claveNormalizada = normalizarClaveEvidencia(clave);

    if (CAMPOS_LISTA_EVIDENCIAS.has(claveNormalizada)) {
      for (const item of listaValores(contenido)) {
        const evidencia = evidenciaDesdeReferencia(item, clave);
        if (evidencia) evidencias.push(evidencia);
      }
    }

    if (
      CAMPOS_CONTENEDORES_EVIDENCIAS.has(claveNormalizada) ||
      CAMPOS_LISTA_EVIDENCIAS.has(claveNormalizada)
    ) {
      evidencias.push(
        ...extraerCandidatasEvidencia(
          contenido,
          origenCampo ? `${origenCampo}.${clave}` : clave,
          profundidad + 1
        )
      );
    }
  }

  return evidencias;
}

function seguimientoCierreDesdeFilaSupabase(
  fila: Record<string, unknown>
): SeguimientoCierreCentral | undefined {
  const seguimientoJson = registroJson(fila.seguimiento_cierre) as
    | Partial<SeguimientoCierreCentral>
    | null;
  const evidenciaRequerida = Array.isArray(fila.evidencia_requerida)
    ? (fila.evidencia_requerida as string[])
    : seguimientoJson?.evidenciaRequerida;
  const evidenciaRecibida = Array.isArray(fila.evidencia_recibida)
    ? listaJson(fila.evidencia_recibida).map(evidenciaDesdeRegistro)
    : seguimientoJson?.evidenciaRecibida;
  const responsableJson = seguimientoJson?.responsable;
  const tieneDatosDirectos = [
    fila.estado_seguimiento,
    fila.responsable_cierre_nombre,
    fila.responsable_cierre_empresa,
    fila.fecha_compromiso,
    fila.fecha_compromiso_cierre,
    fila.accion_correctiva_requerida,
    fila.observacion_inicial_cierre,
    fila.plazo_estado,
    fila.justificacion_extension_plazo,
    fila.justificacion_cierre_sin_evidencia,
  ].some((valor) => texto(valor));

  if (!seguimientoJson && !tieneDatosDirectos) return undefined;

  return {
    ...(seguimientoJson || {}),
    responsable: {
      ...(responsableJson || {}),
      tipoResponsable: texto(
        fila.responsable_cierre_tipo,
        responsableJson?.tipoResponsable || "contratista"
      ) as SeguimientoCierreCentral["responsable"]["tipoResponsable"],
      nombre: texto(fila.responsable_cierre_nombre, responsableJson?.nombre),
      cargo: texto(fila.responsable_cierre_cargo, responsableJson?.cargo),
      empresa: texto(fila.responsable_cierre_empresa, responsableJson?.empresa),
      telefono: texto(fila.responsable_cierre_telefono, responsableJson?.telefono),
      email: texto(fila.responsable_cierre_email, responsableJson?.email),
    },
    estadoCierre: texto(
      fila.estado_seguimiento || fila.estado_cierre,
      seguimientoJson?.estadoCierre || "PENDIENTE"
    ) as SeguimientoCierreCentral["estadoCierre"],
    fechaCompromiso: texto(
      fila.fecha_compromiso_cierre || fila.fecha_compromiso,
      seguimientoJson?.fechaCompromiso
    ),
    fechaMaximaPermitida: texto(
      fila.fecha_maxima_permitida_cierre,
      seguimientoJson?.fechaMaximaPermitida
    ),
    plazoPorCriticidad: texto(
      fila.plazo_cierre_por_criticidad,
      seguimientoJson?.plazoPorCriticidad
    ),
    estadoSeguimiento: texto(
      seguimientoJson?.estadoSeguimiento,
      texto(fila.estado_seguimiento)
    ),
    plazoEstado: texto(fila.plazo_estado, seguimientoJson?.plazoEstado),
    plazoExtendido:
      typeof fila.plazo_extendido === "boolean"
        ? fila.plazo_extendido
        : seguimientoJson?.plazoExtendido,
    justificacionExtensionPlazo: texto(
      fila.justificacion_extension_plazo,
      seguimientoJson?.justificacionExtensionPlazo
    ),
    cierreSinEvidenciaJustificado:
      typeof fila.cierre_sin_evidencia_justificado === "boolean"
        ? fila.cierre_sin_evidencia_justificado
        : seguimientoJson?.cierreSinEvidenciaJustificado,
    justificacionCierreSinEvidencia: texto(
      fila.justificacion_cierre_sin_evidencia,
      seguimientoJson?.justificacionCierreSinEvidencia
    ),
    observacionInicial: texto(
      fila.observacion_inicial_cierre,
      seguimientoJson?.observacionInicial
    ),
    accionCorrectivaRequerida: texto(
      fila.accion_correctiva_requerida,
      seguimientoJson?.accionCorrectivaRequerida
    ),
    evidenciaRequerida,
    evidenciaRecibida,
    fechaCierre: texto(fila.fecha_cierre, seguimientoJson?.fechaCierre),
    actualizadoEn: texto(
      fila.seguimiento_cierre_actualizado_en,
      seguimientoJson?.actualizadoEn
    ),
    actualizadoPor: texto(
      fila.seguimiento_cierre_actualizado_por,
      seguimientoJson?.actualizadoPor
    ),
  };
}

function evidenciasDesdeFilaSupabase(
  fila: Record<string, unknown>
): EvidenciaHallazgoCentral[] {
  const candidatas = extraerCandidatasEvidencia(fila);

  const evidencias: EvidenciaHallazgoCentral[] = [];
  const claves = new Set<string>();

  for (const candidata of candidatas) {
    const evidencia = candidata;
    const clave =
      evidencia.url ||
      evidencia.dataUrl ||
      evidencia.storagePath ||
      evidencia.nombre ||
      evidencia.id ||
      "";

    if (!clave || claves.has(clave)) continue;
    claves.add(clave);
    evidencias.push(evidencia);
  }

  return evidencias;
}

async function resolverUrlsFirmadasEvidencias(
  hallazgo: HallazgoCentral,
  cliente: SupabaseClient
): Promise<HallazgoCentral> {
  if (!hallazgo.evidencias?.length) return hallazgo;

  const evidencias = await Promise.all(
    hallazgo.evidencias.map(async (evidencia) => {
      const urlExistente = texto(evidencia.url || evidencia.dataUrl);
      const storagePath = texto(evidencia.storagePath);

      if (urlExistente || !storagePath) return evidencia;

      const bucket = texto(evidencia.bucket, BUCKET_EVIDENCIAS);

      try {
        const { data, error } = await cliente.storage
          .from(bucket)
          .createSignedUrl(storagePath, 60 * 60);

        if (error || !data?.signedUrl) {
          if (process.env.NODE_ENV !== "production") {
            console.warn("[hallazgos_central] evidencia sin url firmada", {
              codigo: hallazgo.codigo,
              bucket,
              storagePath,
              error: error?.message || "Sin URL firmada",
            });
          }

          return {
            ...evidencia,
            bucket,
            descripcion: texto(
              evidencia.descripcion,
              "Evidencia subida a Storage, pero no disponible para visualización por permisos actuales."
            ),
          };
        }

        return {
          ...evidencia,
          bucket,
          url: data.signedUrl,
        };
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("[hallazgos_central] fallo creando url firmada", {
            codigo: hallazgo.codigo,
            bucket,
            storagePath,
            error: error instanceof Error ? error.message : "Error desconocido",
          });
        }

        return {
          ...evidencia,
          bucket,
          descripcion: texto(
            evidencia.descripcion,
            "Evidencia subida a Storage, pero no disponible para visualización por permisos actuales."
          ),
        };
      }
    })
  );

  return {
    ...hallazgo,
    evidencias,
  };
}

function fechaSoloSupabase(valor: unknown) {
  const limpio = texto(valor);
  if (!limpio) return null;

  const fechaChile = limpio.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (fechaChile) {
    const [, dia, mes, anio] = fechaChile;
    return `${anio}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
  }

  const fechaParseada = new Date(limpio);
  return Number.isNaN(fechaParseada.getTime())
    ? null
    : fechaParseada.toISOString().slice(0, 10);
}

function fechaHoraSupabase(valor: unknown) {
  const limpio = texto(valor);
  if (!limpio) return null;

  const fechaParseada = new Date(limpio);
  return Number.isNaN(fechaParseada.getTime())
    ? null
    : fechaParseada.toISOString();
}

function horaSupabase(valor: unknown) {
  const limpio = texto(valor).toLowerCase();
  if (!limpio) return null;

  const match = limpio.match(/(\d{1,2}):(\d{2})/);
  if (!match) return null;

  let hora = Number(match[1]);
  const minutos = match[2];
  const esPm = limpio.includes("p.") || limpio.includes("pm");
  const esAm = limpio.includes("a.") || limpio.includes("am");

  if (esPm && hora < 12) hora += 12;
  if (esAm && hora === 12) hora = 0;

  return `${String(hora).padStart(2, "0")}:${minutos}:00`;
}

function json<T>(valor: T | undefined, fallback: T): T {
  return valor ?? fallback;
}

function quitarBase64Profundo(valor: unknown): unknown {
  if (Array.isArray(valor)) return valor.map(quitarBase64Profundo);
  if (!valor || typeof valor !== "object") return valor;

  return Object.entries(valor as Record<string, unknown>).reduce<Record<string, unknown>>(
    (salida, [clave, item]) => {
      if (clave === "dataUrl" || clave === "supervisorFoto" || clave === "fotoDataUrl") {
        salida[`${clave}Omitido`] = Boolean(item);
        return salida;
      }

      salida[clave] = quitarBase64Profundo(item);
      return salida;
    },
    {}
  );
}

function evidenciasSinBase64(
  evidencias: EvidenciaHallazgoCentral[] | undefined
) {
  return (evidencias || []).map(({ dataUrl, ...evidencia }) => {
    void dataUrl;
    return evidencia;
  });
}

function rawMobileV2SinBase64(rawMobileV2: Record<string, unknown> | undefined) {
  if (!rawMobileV2) return undefined;
  return quitarBase64Profundo(rawMobileV2) as Record<string, unknown>;
}

function mapearHallazgoAFilaSupabase(hallazgo: HallazgoCentral) {
  const geo = hallazgo.geolocalizacion;
  const seguimiento = hallazgo.seguimientoCierre;
  const responsable = seguimiento?.responsable;
  const radar = hallazgo.radarPreventivo;
  const auditoria = hallazgo.auditoria;

  return {
    codigo: hallazgo.codigo,
    codigo_informe: hallazgo.codigoInforme || hallazgo.codigo,
    codigo_local: hallazgo.codigo,
    origen: hallazgo.origen,
    estado_sincronizacion: "SINCRONIZADO",
    empresa: hallazgo.empresa,
    obra: hallazgo.obra,
    empresa_id: uuidSupabase(hallazgo.empresaId),
    obra_id: uuidSupabase(hallazgo.obraId),
    reportante_user_id: uuidSupabase(hallazgo.reportanteUserId),
    supervisor_user_id: uuidSupabase(hallazgo.supervisorUserId),
    responsable_cierre_user_id: uuidSupabase(hallazgo.responsableCierreUserId),
    mandante_id: uuidSupabase(hallazgo.mandanteId),
    contratista_id: uuidSupabase(hallazgo.contratistaId),
    proyecto: hallazgo.proyecto,
    area: hallazgo.area,
    sigla_empresa: hallazgo.siglaEmpresa,
    sigla_proyecto: hallazgo.siglaProyecto,
    reportante_nombre: hallazgo.reportante.nombre,
    reportante_cargo: hallazgo.reportante.cargo,
    reportante_empresa: hallazgo.reportante.empresa,
    reportante_telefono: hallazgo.reportante.telefono,
    reportante_email: hallazgo.reportante.email,
    reportante_foto_url: hallazgo.reportante.fotoUrl,
    supervisor_nombre: hallazgo.reportante.nombre,
    supervisor_cargo: hallazgo.reportante.cargo,
    fecha_reporte: fechaSoloSupabase(hallazgo.fechaReporte),
    hora_reporte: horaSupabase(hallazgo.horaReporte),
    fecha_iso: fechaHoraSupabase(hallazgo.fechaHoraReporteISO),
    fecha_hora_reporte: fechaHoraSupabase(hallazgo.fechaHoraReporteISO),
    descripcion: hallazgo.descripcion,
    tipo_hallazgo: hallazgo.tipoHallazgo,
    criticidad: hallazgo.criticidad,
    prioridad: hallazgo.prioridad,
    puntaje_evaluacion: hallazgo.puntajeEvaluacion,
    evaluacion: json(
      {
        puntaje: hallazgo.puntajeEvaluacion,
        respuestas: hallazgo.respuestasEvaluacion,
        criticidad: hallazgo.criticidad,
        prioridad: hallazgo.prioridad,
        recomendacion: hallazgo.recomendacion,
        accionInmediata: hallazgo.accionInmediata,
        motorV2: hallazgo.evaluacionMotorV2,
      },
      {}
    ),
    respuestas_evaluacion: json(hallazgo.respuestasEvaluacion, {}),
    accion_inmediata: hallazgo.accionInmediata,
    recomendacion: hallazgo.recomendacion,
    estado: hallazgo.estado,
    estado_cierre: hallazgo.estadoCierre || seguimiento?.estadoCierre || "PENDIENTE",
    estado_seguimiento: seguimiento?.estadoCierre || hallazgo.estadoCierre || "PENDIENTE",
    evidencias: evidenciasSinBase64(hallazgo.evidencias),
    fotos: evidenciasSinBase64(hallazgo.evidencias),
    gps_latitud: geo?.latitud,
    gps_longitud: geo?.longitud,
    gps_precision: geo?.precisionGps,
    gps_fecha_hora: fechaHoraSupabase(
      geo?.fechaHoraGeolocalizacion || hallazgo.gpsFechaHoraGeolocalizacion
    ),
    gps_estado: geo?.estadoGeolocalizacion || hallazgo.gpsEstadoGeolocalizacion,
    gps_direccion_referencial: geo?.direccionReferencial,
    gps_zona: geo?.zona,
    gps_sector: geo?.sector,
    visible_en_mapa: hallazgo.mapaGps?.visibleEnMapa ?? Boolean(geo),
    geolocalizacion: geo || {},
    responsable_cierre_tipo: responsable?.tipoResponsable,
    responsable_cierre_nombre: responsable?.nombre,
    responsable_cierre_cargo: responsable?.cargo,
    responsable_cierre_empresa: responsable?.empresa,
    responsable_cierre_telefono: responsable?.telefono,
    responsable_cierre_email: responsable?.email,
    fecha_compromiso: fechaSoloSupabase(seguimiento?.fechaCompromiso),
    fecha_compromiso_cierre: fechaSoloSupabase(seguimiento?.fechaCompromiso),
    fecha_maxima_permitida_cierre: fechaSoloSupabase(seguimiento?.fechaMaximaPermitida),
    observacion_inicial_cierre: seguimiento?.observacionInicial,
    accion_correctiva_requerida: seguimiento?.accionCorrectivaRequerida,
    evidencia_requerida: json(seguimiento?.evidenciaRequerida, []),
    evidencia_recibida: evidenciasSinBase64(seguimiento?.evidenciaRecibida),
    fecha_cierre: fechaHoraSupabase(seguimiento?.fechaCierre),
    seguimiento_cierre: seguimiento || {},
    radar_categoria_riesgo: radar?.categoriaRiesgo,
    radar_causa_dominante: radar?.causaDominante,
    radar_palabras_clave: json(radar?.palabrasClave, []),
    radar_nivel_exposicion: radar?.nivelExposicion,
    radar_potencial_severidad: radar?.potencialSeveridad,
    radar_probabilidad_repeticion: radar?.probabilidadRepeticion,
    radar_requiere_accion_inmediata: radar?.requiereAccionInmediata ?? false,
    radar_requiere_detencion_trabajo: radar?.requiereDetencionTrabajo ?? false,
    radar_indicadores: json(radar?.indicadores, {}),
    bitacora: json(hallazgo.bitacora, []),
    raw_mobile_v2: rawMobileV2SinBase64(hallazgo.rawMobileV2),
    raw_panel: hallazgo.rawPanel,
    creado_por: auditoria?.creadoPor,
    actualizado_por: auditoria?.actualizadoPor,
    dispositivo_id: auditoria?.dispositivoId,
    version_app: auditoria?.versionApp,
    user_agent: auditoria?.userAgent,
    created_at: fechaHoraSupabase(hallazgo.createdAt || hallazgo.fechaCreacion),
    updated_at: fechaHoraSupabase(hallazgo.updatedAt || hallazgo.fechaActualizacion),
    synced_at: new Date().toISOString(),
  };
}

function asignarSiDefinido(
  fila: Record<string, unknown>,
  columna: string,
  valor: unknown
) {
  if (valor !== undefined) fila[columna] = valor;
}

function asignarUuidSiDefinido(
  fila: Record<string, unknown>,
  columna: string,
  valor: unknown
) {
  if (valor !== undefined) fila[columna] = uuidSupabase(valor);
}

function mapearCambiosAFilaSupabase(cambios: Partial<HallazgoCentral>) {
  const fila: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  const geo = cambios.geolocalizacion;
  const seguimiento = cambios.seguimientoCierre;
  const responsable = seguimiento?.responsable;
  const radar = cambios.radarPreventivo;

  asignarSiDefinido(fila, "codigo", cambios.codigo);
  asignarSiDefinido(fila, "codigo_informe", cambios.codigoInforme);
  asignarSiDefinido(fila, "codigo_local", cambios.codigo);
  asignarSiDefinido(fila, "origen", cambios.origen);
  asignarSiDefinido(fila, "estado_sincronizacion", cambios.estadoSincronizacion);
  asignarSiDefinido(fila, "empresa", cambios.empresa);
  asignarSiDefinido(fila, "obra", cambios.obra);
  asignarUuidSiDefinido(fila, "empresa_id", cambios.empresaId);
  asignarUuidSiDefinido(fila, "obra_id", cambios.obraId);
  asignarUuidSiDefinido(fila, "reportante_user_id", cambios.reportanteUserId);
  asignarUuidSiDefinido(fila, "supervisor_user_id", cambios.supervisorUserId);
  asignarUuidSiDefinido(
    fila,
    "responsable_cierre_user_id",
    cambios.responsableCierreUserId
  );
  asignarUuidSiDefinido(fila, "mandante_id", cambios.mandanteId);
  asignarUuidSiDefinido(fila, "contratista_id", cambios.contratistaId);
  asignarSiDefinido(fila, "proyecto", cambios.proyecto);
  asignarSiDefinido(fila, "area", cambios.area);
  asignarSiDefinido(fila, "sigla_empresa", cambios.siglaEmpresa);
  asignarSiDefinido(fila, "sigla_proyecto", cambios.siglaProyecto);
  asignarSiDefinido(fila, "reportante_nombre", cambios.reportante?.nombre);
  asignarSiDefinido(fila, "reportante_cargo", cambios.reportante?.cargo);
  asignarSiDefinido(fila, "reportante_empresa", cambios.reportante?.empresa);
  asignarSiDefinido(fila, "reportante_telefono", cambios.reportante?.telefono);
  asignarSiDefinido(fila, "reportante_email", cambios.reportante?.email);
  asignarSiDefinido(fila, "reportante_foto_url", cambios.reportante?.fotoUrl);
  asignarSiDefinido(fila, "supervisor_nombre", cambios.reportante?.nombre);
  asignarSiDefinido(fila, "supervisor_cargo", cambios.reportante?.cargo);
  asignarSiDefinido(fila, "fecha_reporte", fechaSoloSupabase(cambios.fechaReporte));
  asignarSiDefinido(fila, "hora_reporte", horaSupabase(cambios.horaReporte));
  asignarSiDefinido(
    fila,
    "fecha_iso",
    fechaHoraSupabase(cambios.fechaHoraReporteISO)
  );
  asignarSiDefinido(
    fila,
    "fecha_hora_reporte",
    fechaHoraSupabase(cambios.fechaHoraReporteISO)
  );
  asignarSiDefinido(fila, "descripcion", cambios.descripcion);
  asignarSiDefinido(fila, "tipo_hallazgo", cambios.tipoHallazgo);
  asignarSiDefinido(fila, "criticidad", cambios.criticidad);
  asignarSiDefinido(fila, "prioridad", cambios.prioridad);
  asignarSiDefinido(fila, "puntaje_evaluacion", cambios.puntajeEvaluacion);
  asignarSiDefinido(fila, "respuestas_evaluacion", cambios.respuestasEvaluacion);
  asignarSiDefinido(fila, "accion_inmediata", cambios.accionInmediata);
  asignarSiDefinido(fila, "recomendacion", cambios.recomendacion);
  asignarSiDefinido(fila, "estado", cambios.estado);
  asignarSiDefinido(fila, "estado_cierre", cambios.estadoCierre);
  asignarSiDefinido(fila, "estado_seguimiento", cambios.estadoCierre);

  if (cambios.evidencias) {
    fila.evidencias = evidenciasSinBase64(cambios.evidencias);
    fila.fotos = evidenciasSinBase64(cambios.evidencias);
  }

  if (geo) {
    fila.gps_latitud = geo.latitud;
    fila.gps_longitud = geo.longitud;
    fila.gps_precision = geo.precisionGps;
    fila.gps_fecha_hora = fechaHoraSupabase(geo.fechaHoraGeolocalizacion);
    fila.gps_estado = geo.estadoGeolocalizacion;
    fila.gps_direccion_referencial = geo.direccionReferencial;
    fila.gps_zona = geo.zona;
    fila.gps_sector = geo.sector;
    fila.visible_en_mapa = cambios.mapaGps?.visibleEnMapa ?? true;
    fila.geolocalizacion = geo;
  }

  if (seguimiento) {
    fila.responsable_cierre_tipo = responsable?.tipoResponsable;
    fila.responsable_cierre_nombre = responsable?.nombre;
    fila.responsable_cierre_cargo = responsable?.cargo;
    fila.responsable_cierre_empresa = responsable?.empresa;
    fila.responsable_cierre_telefono = responsable?.telefono;
    fila.responsable_cierre_email = responsable?.email;
    fila.responsable_cierre_tipo = responsable?.tipoResponsable;
    fila.estado_cierre = seguimiento.estadoCierre;
    fila.estado_seguimiento = seguimiento.estadoCierre;
    fila.fecha_compromiso = fechaSoloSupabase(seguimiento.fechaCompromiso);
    fila.fecha_compromiso_cierre = fechaSoloSupabase(seguimiento.fechaCompromiso);
    fila.fecha_maxima_permitida_cierre = fechaSoloSupabase(
      seguimiento.fechaMaximaPermitida
    );
    fila.observacion_inicial_cierre = seguimiento.observacionInicial;
    fila.accion_correctiva_requerida = seguimiento.accionCorrectivaRequerida;
    fila.evidencia_requerida = seguimiento.evidenciaRequerida || [];
    fila.evidencia_recibida = evidenciasSinBase64(seguimiento.evidenciaRecibida);
    fila.fecha_cierre = fechaHoraSupabase(seguimiento.fechaCierre);
    fila.seguimiento_cierre = seguimiento;
  }

  if (radar) {
    fila.radar_categoria_riesgo = radar.categoriaRiesgo;
    fila.radar_causa_dominante = radar.causaDominante;
    fila.radar_palabras_clave = radar.palabrasClave || [];
    fila.radar_nivel_exposicion = radar.nivelExposicion;
    fila.radar_potencial_severidad = radar.potencialSeveridad;
    fila.radar_probabilidad_repeticion = radar.probabilidadRepeticion;
    fila.radar_requiere_accion_inmediata =
      radar.requiereAccionInmediata ?? false;
    fila.radar_requiere_detencion_trabajo =
      radar.requiereDetencionTrabajo ?? false;
    fila.radar_indicadores = radar.indicadores || {};
  }

  if (cambios.bitacora) fila.bitacora = cambios.bitacora;
  if (cambios.rawMobileV2) {
    fila.raw_mobile_v2 = rawMobileV2SinBase64(cambios.rawMobileV2);
  }
  if (cambios.rawPanel) fila.raw_panel = cambios.rawPanel;

  return fila;
}

function mapearFilaSupabaseAHallazgo(fila: Record<string, unknown>): HallazgoCentral {
  const latitud = numero(fila.gps_latitud ?? fila.latitud);
  const longitud = numero(fila.gps_longitud ?? fila.longitud);
  const geolocalizacion =
    typeof latitud === "number" && typeof longitud === "number"
      ? {
          latitud,
          longitud,
          precisionGps: numero(fila.gps_precision ?? fila.precision_gps),
          fechaHoraGeolocalizacion: texto(
            fila.gps_fecha_hora ?? fila.fecha_hora_geolocalizacion
          ),
          estadoGeolocalizacion: texto(fila.gps_estado ?? fila.estado_geolocalizacion) as
            | GeolocalizacionHallazgoCentral["estadoGeolocalizacion"]
            | undefined,
          direccionReferencial: texto(
            fila.gps_direccion_referencial ?? fila.direccion_referencial
          ),
          zona: texto(fila.gps_zona ?? fila.zona),
          sector: texto(fila.gps_sector ?? fila.sector),
        }
      : undefined;

  const radarPreventivo: RadarPreventivoCentral = {
    categoriaRiesgo: texto(fila.radar_categoria_riesgo),
    causaDominante: texto(fila.radar_causa_dominante),
    palabrasClave: Array.isArray(fila.radar_palabras_clave)
      ? (fila.radar_palabras_clave as string[])
      : [],
    nivelExposicion: texto(fila.radar_nivel_exposicion) as
      | RadarPreventivoCentral["nivelExposicion"]
      | undefined,
    potencialSeveridad: texto(fila.radar_potencial_severidad) as
      | RadarPreventivoCentral["potencialSeveridad"]
      | undefined,
    probabilidadRepeticion: texto(fila.radar_probabilidad_repeticion) as
      | RadarPreventivoCentral["probabilidadRepeticion"]
      | undefined,
    requiereAccionInmediata: Boolean(fila.radar_requiere_accion_inmediata),
    requiereDetencionTrabajo: Boolean(fila.radar_requiere_detencion_trabajo),
    indicadores:
      (fila.radar_indicadores as RadarPreventivoCentral["indicadores"]) || {},
  };

  return {
    id: texto(fila.id),
    codigo: texto(fila.codigo),
    codigoInforme: texto(fila.codigo_informe),
    origen: texto(fila.origen, "api") as HallazgoCentral["origen"],
    estadoSincronizacion: texto(
      fila.estado_sincronizacion,
      "SINCRONIZADO"
    ) as HallazgoCentral["estadoSincronizacion"],
    empresa: texto(fila.empresa, "Sin empresa"),
    obra: texto(fila.obra, "Sin obra"),
    empresaId: uuidSupabase(fila.empresa_id) || undefined,
    obraId: uuidSupabase(fila.obra_id) || undefined,
    reportanteUserId: uuidSupabase(fila.reportante_user_id) || undefined,
    supervisorUserId: uuidSupabase(fila.supervisor_user_id) || undefined,
    responsableCierreUserId:
      uuidSupabase(fila.responsable_cierre_user_id) || undefined,
    mandanteId: uuidSupabase(fila.mandante_id) || undefined,
    contratistaId: uuidSupabase(fila.contratista_id) || undefined,
    proyecto: texto(fila.proyecto),
    area: texto(fila.area, "Sin area"),
    siglaEmpresa: texto(fila.sigla_empresa),
    siglaProyecto: texto(fila.sigla_proyecto),
    reportante: {
      nombre: texto(fila.reportante_nombre, "Sin reportante"),
      cargo: texto(fila.reportante_cargo),
      empresa: texto(fila.reportante_empresa),
      telefono: texto(fila.reportante_telefono),
      email: texto(fila.reportante_email),
      fotoUrl: texto(fila.reportante_foto_url),
    },
    fechaReporte: texto(fila.fecha_reporte),
    horaReporte: texto(fila.hora_reporte),
    fechaHoraReporteISO: texto(fila.fecha_hora_reporte),
    descripcion: texto(fila.descripcion, "Sin descripcion"),
    tipoHallazgo: texto(
      fila.tipo_hallazgo,
      "Condicion subestandar"
    ) as HallazgoCentral["tipoHallazgo"],
    criticidad: texto(fila.criticidad, "BAJO") as HallazgoCentral["criticidad"],
    prioridad: texto(fila.prioridad) as HallazgoCentral["prioridad"],
    puntajeEvaluacion:
      typeof fila.puntaje_evaluacion === "number"
        ? fila.puntaje_evaluacion
        : undefined,
    respuestasEvaluacion:
      (fila.respuestas_evaluacion as HallazgoCentral["respuestasEvaluacion"]) ||
      {},
    accionInmediata: texto(fila.accion_inmediata),
    recomendacion: texto(fila.recomendacion),
    estado: texto(fila.estado, "ABIERTO") as HallazgoCentral["estado"],
    estadoCierre: texto(
      fila.estado_cierre,
      "PENDIENTE"
    ) as HallazgoCentral["estadoCierre"],
    evidencias: evidenciasDesdeFilaSupabase(fila),
    geolocalizacion,
    mapaGps: geolocalizacion
      ? {
          latitud: geolocalizacion.latitud,
          longitud: geolocalizacion.longitud,
          precisionGps: geolocalizacion.precisionGps,
          zona: geolocalizacion.zona,
          sector: geolocalizacion.sector,
          visibleEnMapa: Boolean(fila.visible_en_mapa),
        }
      : { visibleEnMapa: Boolean(fila.visible_en_mapa) },
    seguimientoCierre: seguimientoCierreDesdeFilaSupabase(fila),
    radarPreventivo,
    bitacora: Array.isArray(fila.bitacora)
      ? (fila.bitacora as BitacoraHallazgoCentral[])
      : [],
    rawMobileV2: (fila.raw_mobile_v2 as HallazgoCentral["rawMobileV2"]) || {},
    rawPanel: (fila.raw_panel as HallazgoCentral["rawPanel"]) || {},
    createdAt: texto(fila.created_at),
    updatedAt: texto(fila.updated_at),
    syncedAt: texto(fila.synced_at),
    fechaCreacion: texto(fila.created_at),
    fechaActualizacion: texto(fila.updated_at),
    fechaSincronizacion: texto(fila.synced_at),
  };
}

type SupabaseFilterQuery<T> = {
  eq: (columna: string, valor: unknown) => T;
  neq: (columna: string, valor: unknown) => T;
  gte: (columna: string, valor: unknown) => T;
  lte: (columna: string, valor: unknown) => T;
  lt: (columna: string, valor: unknown) => T;
};

function aplicarFiltrosSupabase<T extends SupabaseFilterQuery<T>>(
  query: T,
  filtros: FiltrosHallazgosCentrales
) {
  let consulta = query;

  if (filtros.empresaId) consulta = consulta.eq("empresa_id", filtros.empresaId);
  if (filtros.obraId) consulta = consulta.eq("obra_id", filtros.obraId);
  if (filtros.empresa) consulta = consulta.eq("empresa", filtros.empresa);
  if (filtros.obra) consulta = consulta.eq("obra", filtros.obra);
  if (filtros.area) consulta = consulta.eq("area", filtros.area);
  if (filtros.estado) consulta = consulta.eq("estado", filtros.estado);
  if (filtros.estadoCierre) {
    consulta = consulta.eq("estado_cierre", filtros.estadoCierre);
  }
  if (filtros.criticidad) {
    consulta = consulta.eq("criticidad", filtros.criticidad);
  }
  if (filtros.origen) consulta = consulta.eq("origen", filtros.origen);
  if (filtros.fechaDesde) {
    consulta = consulta.gte("fecha_iso", filtros.fechaDesde);
  }
  if (filtros.fechaHasta) {
    consulta = consulta.lte("fecha_iso", filtros.fechaHasta);
  }
  if (filtros.fechaAntesDe) {
    consulta = consulta.lt("fecha_iso", filtros.fechaAntesDe);
  }
  if (filtros.fechaCierreDesde) {
    consulta = consulta.gte("fecha_cierre", filtros.fechaCierreDesde);
  }
  if (filtros.fechaCierreHasta) {
    consulta = consulta.lte("fecha_cierre", filtros.fechaCierreHasta);
  }

  return consulta;
}

const ESTADOS_BACKLOG_GESTION_VIGENTE: EstadoHallazgoCentral[] = [
  "REPORTADO",
  "ABIERTO",
  "EN_SEGUIMIENTO",
];

type FilaHistorialSupervisorCentral = {
  codigo?: string | null;
  estado?: string | null;
  estado_cierre?: string | null;
};

function esFilaCerradaHistorialSupervisor(fila: FilaHistorialSupervisorCentral) {
  const estado = texto(fila.estado).toUpperCase();
  const estadoCierre = texto(fila.estado_cierre).toUpperCase();

  return estado === "CERRADO" || estadoCierre === "CERRADO";
}

function fechaLecturaGestion(valor: unknown) {
  return fechaSoloSupabase(valor) || "";
}

function fechaReporteGestionVigente(hallazgo: HallazgoCentral) {
  return fechaLecturaGestion(
    hallazgo.fechaHoraReporteISO ||
      hallazgo.fechaReporte ||
      hallazgo.fechaCreacion ||
      hallazgo.createdAt
  );
}

function fechaCierreGestionVigente(hallazgo: HallazgoCentral) {
  return fechaLecturaGestion(hallazgo.seguimientoCierre?.fechaCierre);
}

function estaDentroPeriodoGestion(fecha: string, desde: string, hasta: string) {
  return Boolean(fecha) && fecha >= desde && fecha <= hasta;
}

function esHallazgoNoCerradoGestion(hallazgo: HallazgoCentral) {
  return hallazgo.estado !== "CERRADO" && hallazgo.estado !== "ANULADO";
}

function clasificarOrigenGestionVigente(
  hallazgo: HallazgoCentral,
  periodoDesde: string,
  periodoHasta: string
) {
  const fechaReporte = fechaReporteGestionVigente(hallazgo);
  const fechaCierre = fechaCierreGestionVigente(hallazgo);
  const esDelPeriodo = estaDentroPeriodoGestion(
    fechaReporte,
    periodoDesde,
    periodoHasta
  );
  const esBacklogAnterior =
    Boolean(fechaReporte) &&
    fechaReporte < periodoDesde &&
    esHallazgoNoCerradoGestion(hallazgo);
  const esCerradoDelPeriodo =
    hallazgo.estado === "CERRADO" &&
    estaDentroPeriodoGestion(fechaCierre, periodoDesde, periodoHasta);
  const origenGestion: OrigenGestionVigente[] = [];

  if (esDelPeriodo) origenGestion.push("periodo");
  if (esBacklogAnterior) origenGestion.push("backlogAnterior");
  if (esCerradoDelPeriodo) origenGestion.push("cerradoDelPeriodo");
  if (origenGestion.length > 0) origenGestion.push("gestionVigente");

  return {
    origenGestion,
    esBacklogAnterior,
    esDelPeriodo,
    esCerradoDelPeriodo,
  };
}

function claveHallazgoGestionVigente(hallazgo: HallazgoCentral) {
  if (hallazgo.id) return `id:${hallazgo.id}`;
  if (hallazgo.codigo) return `codigo:${hallazgo.codigo}`;

  return [
    "fallback",
    hallazgo.codigo,
    hallazgo.fechaHoraReporteISO || hallazgo.fechaReporte || hallazgo.fechaCreacion,
    hallazgo.empresa,
    hallazgo.obra,
  ].join(":");
}

function combinarHallazgosGestionVigente(
  hallazgos: HallazgoCentral[],
  periodoDesde: string,
  periodoHasta: string
): HallazgoGestionVigente[] {
  const mapa = new Map<string, HallazgoGestionVigente>();

  for (const hallazgo of hallazgos) {
    const clasificacion = clasificarOrigenGestionVigente(
      hallazgo,
      periodoDesde,
      periodoHasta
    );

    if (clasificacion.origenGestion.length === 0) continue;

    const clave = claveHallazgoGestionVigente(hallazgo);
    const existente = mapa.get(clave);

    if (!existente) {
      mapa.set(clave, {
        ...hallazgo,
        ...clasificacion,
      });
      continue;
    }

    const origenGestion = Array.from(
      new Set([...existente.origenGestion, ...clasificacion.origenGestion])
    );

    mapa.set(clave, {
      ...existente,
      origenGestion,
      esBacklogAnterior:
        existente.esBacklogAnterior || clasificacion.esBacklogAnterior,
      esDelPeriodo: existente.esDelPeriodo || clasificacion.esDelPeriodo,
      esCerradoDelPeriodo:
        existente.esCerradoDelPeriodo || clasificacion.esCerradoDelPeriodo,
    });
  }

  return Array.from(mapa.values()).sort((a, b) =>
    fechaReporteGestionVigente(b).localeCompare(fechaReporteGestionVigente(a))
  );
}

function filtrosBaseGestionVigente(
  filtros: HallazgosReadFilters
): FiltrosHallazgosCentrales {
  return {
    empresa: filtros.empresaReportante,
    obra: filtros.obra,
    area: filtros.area,
    criticidad: filtros.criticidad,
    estadoCierre: filtros.estadoCierre,
    limit: filtros.limit || 500,
  };
}

export async function obtenerResumenHistorialSupervisorCentral(
  filtros: FiltrosHistorialSupervisorCentral
): Promise<ResultadoRepositorioCentral<ResumenHistorialSupervisorCentral>> {
  const userId = uuidSupabase(filtros.userId);
  const empresaId = uuidSupabase(filtros.empresaId);
  const obraId = uuidSupabase(filtros.obraId);

  if (!userId) {
    return {
      ok: false,
      error: "No se pudo resolver el perfil del supervisor para consultar historial central.",
      origen: "central-disabled",
    };
  }

  const { cliente, habilitado } = await obtenerSupabaseDisponible();
  if (!habilitado || !cliente) {
    return falloRepositorioDesactivado<ResumenHistorialSupervisorCentral>();
  }

  try {
    const limitePagina = 500;
    let offset = 0;
    let reportados = 0;
    let cerrados = 0;

    while (true) {
      let query = cliente
        .from(TABLA_HALLAZGOS_CENTRAL)
        .select("codigo,estado,estado_cierre")
        .or(`supervisor_user_id.eq.${userId},reportante_user_id.eq.${userId}`)
        .neq("estado", "ANULADO")
        .order("fecha_iso", { ascending: false, nullsFirst: false })
        .range(offset, offset + limitePagina - 1);

      if (empresaId) query = query.eq("empresa_id", empresaId);
      if (obraId) query = query.eq("obra_id", obraId);

      const { data, error } = await query;
      if (error) {
        return falloSupabase(
          error,
          "No se pudo leer historial central del supervisor desde Supabase."
        );
      }

      const filas = Array.isArray(data)
        ? (data as FilaHistorialSupervisorCentral[])
        : [];

      reportados += filas.length;
      cerrados += filas.filter(esFilaCerradaHistorialSupervisor).length;

      if (filas.length < limitePagina) break;
      offset += limitePagina;
    }

    return {
      ok: true,
      data: {
        reportados,
        cerrados,
        abiertos: Math.max(reportados - cerrados, 0),
      },
      origen: "supabase",
    };
  } catch (error) {
    return falloSupabase(
      error,
      "Fallo inesperado leyendo historial central del supervisor."
    );
  }
}

export async function cargarHallazgosGestionVigente(
  filtros: HallazgosReadFilters
): Promise<ResultadoRepositorioCentral<HallazgoGestionVigente[]>> {
  const periodoDesde = fechaLecturaGestion(filtros.periodoDesde);
  const periodoHasta = fechaLecturaGestion(filtros.periodoHasta);

  if (!periodoDesde || !periodoHasta) {
    return {
      ok: false,
      error:
        "Periodo invalido para lectura de gestion vigente. Debe informar periodoDesde y periodoHasta en formato de fecha valido.",
      origen: "central-disabled",
    };
  }

  const filtrosBase = filtrosBaseGestionVigente(filtros);
  const consultas: Array<Promise<ResultadoRepositorioCentral<HallazgoCentral[]>>> = [
    listarHallazgosCentrales({
      ...filtrosBase,
      fechaDesde: periodoDesde,
      fechaHasta: periodoHasta,
    }),
    listarHallazgosCentrales({
      ...filtrosBase,
      estado: "CERRADO",
      fechaCierreDesde: periodoDesde,
      fechaCierreHasta: periodoHasta,
    }),
  ];

  if (filtros.incluirBacklogNoCerrado) {
    for (const estado of ESTADOS_BACKLOG_GESTION_VIGENTE) {
      consultas.push(
        listarHallazgosCentrales({
          ...filtrosBase,
          estado,
          fechaAntesDe: periodoDesde,
        })
      );
    }
  }

  const respuestas = await Promise.all(consultas);
  const error = respuestas.find((respuesta) => !respuesta.ok);

  if (error && !error.ok) {
    return {
      ok: false,
      error: error.error,
      origen: error.origen,
      detalle: error.detalle,
    };
  }

  const hallazgos = respuestas.flatMap((respuesta) =>
    respuesta.ok ? respuesta.data : []
  );

  return {
    ok: true,
    data: combinarHallazgosGestionVigente(
      hallazgos,
      periodoDesde,
      periodoHasta
    ),
    origen: respuestas.some(
      (respuesta) => respuesta.ok && respuesta.origen === "supabase"
    )
      ? "supabase"
      : "central-disabled",
    mensaje:
      "Lectura pasiva de gestion vigente. No conectada a UI ni a consultas actuales del panel.",
  };
}

export async function listarHallazgosCentrales(
  filtros: FiltrosHallazgosCentrales = {}
): Promise<ResultadoRepositorioCentral<HallazgoCentral[]>> {
  if (filtros.sinAcceso) return lecturaVacia([]);

  const { cliente, habilitado } = await obtenerSupabaseDisponible();
  if (!habilitado || !cliente) return lecturaVacia([]);

  try {
    const limit = Math.min(Math.max(filtros.limit || 100, 1), 500);
    const offset = Math.max(filtros.offset || 0, 0);
    let query = cliente
      .from(TABLA_HALLAZGOS_CENTRAL)
      .select("*")
      .order("fecha_iso", { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1);

    query = aplicarFiltrosSupabase(query, filtros);
    if (!filtros.estado) {
      query = query.neq("estado", "ANULADO");
    }

    const { data, error } = await query;
    if (error) {
      return falloSupabase(error, "No se pudo leer hallazgos desde Supabase.");
    }

    const hallazgos = await Promise.all(
      (data || []).map((fila) =>
        resolverUrlsFirmadasEvidencias(
          mapearFilaSupabaseAHallazgo(fila as Record<string, unknown>),
          cliente
        )
      )
    );

    return {
      ok: true,
      data: hallazgos,
      origen: "supabase",
    };
  } catch (error) {
    return falloSupabase(error, "Fallo inesperado leyendo hallazgos Supabase.");
  }
}

export async function obtenerHallazgoCentralPorId(
  id: string
): Promise<ResultadoRepositorioCentral<HallazgoCentral | null>> {
  const { cliente, habilitado } = await obtenerSupabaseDisponible();
  if (!habilitado || !cliente) return lecturaVacia(null);

  try {
    const { data, error } = await cliente
      .from(TABLA_HALLAZGOS_CENTRAL)
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return falloSupabase(error, "No se pudo obtener hallazgo por id.");
    }

    const hallazgo = data
      ? await resolverUrlsFirmadasEvidencias(
          mapearFilaSupabaseAHallazgo(data),
          cliente
        )
      : null;

    return {
      ok: true,
      data: hallazgo,
      origen: "supabase",
    };
  } catch (error) {
    return falloSupabase(error, "Fallo inesperado obteniendo hallazgo por id.");
  }
}

export async function obtenerHallazgoCentralPorCodigo(
  codigo: string
): Promise<ResultadoRepositorioCentral<HallazgoCentral | null>> {
  const { cliente, habilitado } = await obtenerSupabaseDisponible();
  if (!habilitado || !cliente) return lecturaVacia(null);

  try {
    const { data, error } = await cliente
      .from(TABLA_HALLAZGOS_CENTRAL)
      .select("*")
      .eq("codigo", codigo)
      .maybeSingle();

    if (error) {
      return falloSupabase(error, "No se pudo obtener hallazgo por codigo.");
    }

    const hallazgo = data
      ? await resolverUrlsFirmadasEvidencias(
          mapearFilaSupabaseAHallazgo(data),
          cliente
        )
      : null;

    return {
      ok: true,
      data: hallazgo,
      origen: "supabase",
    };
  } catch (error) {
    return falloSupabase(
      error,
      "Fallo inesperado obteniendo hallazgo por codigo."
    );
  }
}

export async function crearHallazgoCentral(
  hallazgo: HallazgoCentral
): Promise<ResultadoRepositorioCentral<HallazgoCentral>> {
  const { cliente, habilitado } = await obtenerSupabaseDisponible();
  if (!habilitado || !cliente) {
    if (process.env.NODE_ENV !== "production") {
      const estado = obtenerEstadoSupabaseCliente();
      console.warn("[hallazgos_central] insert omitido", {
        tabla: TABLA_HALLAZGOS_CENTRAL_PUBLICA,
        habilitado: estado.habilitado,
        configurado: estado.configurado,
        banderaActiva: estado.banderaActiva,
        motivo: estado.motivoDeshabilitado,
      });
    }

    return falloRepositorioDesactivado();
  }

  try {
    const fila = mapearHallazgoAFilaSupabase(hallazgo);
    if (process.env.NODE_ENV !== "production") {
      console.info("[hallazgos_central] insert inicio", {
        tabla: TABLA_HALLAZGOS_CENTRAL_PUBLICA,
        codigo: fila.codigo,
        empresa: fila.empresa,
        obra: fila.obra,
        area: fila.area,
        tieneGps: Boolean(fila.gps_latitud && fila.gps_longitud),
        evidencias: Array.isArray(fila.evidencias) ? fila.evidencias.length : 0,
      });
    }
    const { error } = await cliente
      .from(TABLA_HALLAZGOS_CENTRAL)
      .insert(fila);

    if (error) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[hallazgos_central] insert error", {
          tabla: TABLA_HALLAZGOS_CENTRAL_PUBLICA,
          codigo: fila.codigo,
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
      }
      return falloSupabase(error, "No se pudo crear hallazgo en Supabase.");
    }

    if (process.env.NODE_ENV !== "production") {
      console.info("[hallazgos_central] insert ok", {
        tabla: TABLA_HALLAZGOS_CENTRAL_PUBLICA,
        codigo: fila.codigo,
        id: hallazgo.id || "sin-id-retornado",
      });
    }

    return {
      ok: true,
      data: {
        ...hallazgo,
        estadoSincronizacion: "SINCRONIZADO",
        syncedAt: new Date().toISOString(),
      },
      origen: "supabase",
      mensaje: "Insert aceptado por Supabase en public.hallazgos_central.",
    };
  } catch (error) {
    return falloSupabase(error, "Fallo inesperado creando hallazgo Supabase.");
  }
}

export async function actualizarHallazgoCentral(
  id: string,
  cambios: Partial<HallazgoCentral>
): Promise<ResultadoRepositorioCentral<HallazgoCentral>> {
  const { cliente, habilitado } = await obtenerSupabaseDisponible();
  if (!habilitado || !cliente) return falloRepositorioDesactivado();

  try {
    const fila = mapearCambiosAFilaSupabase(cambios);

    const { data, error } = await cliente
      .from(TABLA_HALLAZGOS_CENTRAL)
      .update(fila)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return falloSupabase(error, "No se pudo actualizar hallazgo Supabase.");
    }

    return {
      ok: true,
      data: mapearFilaSupabaseAHallazgo(data),
      origen: "supabase",
    };
  } catch (error) {
    return falloSupabase(
      error,
      "Fallo inesperado actualizando hallazgo Supabase."
    );
  }
}

export async function actualizarEstadoHallazgoCentral(
  id: string,
  estado: EstadoHallazgoCentral
): Promise<ResultadoRepositorioCentral<HallazgoCentral>> {
  return actualizarHallazgoCentral(id, { estado });
}

export async function actualizarSeguimientoCierre(
  id: string,
  seguimiento: SeguimientoCierreCentral
): Promise<ResultadoRepositorioCentral<HallazgoCentral>> {
  return actualizarHallazgoCentral(id, { seguimientoCierre: seguimiento });
}

export async function registrarEventoBitacora(
  id: string,
  evento: BitacoraHallazgoCentral
): Promise<ResultadoRepositorioCentral<HallazgoCentral>> {
  const existente = await obtenerHallazgoCentralPorId(id);
  if (!existente.ok || !existente.data) return falloRepositorioDesactivado();

  return actualizarHallazgoCentral(id, {
    bitacora: [...(existente.data.bitacora || []), evento],
  });
}

export async function listarHallazgosParaMapaGps(
  filtros: FiltrosMapaGpsCentral = {}
): Promise<ResultadoRepositorioCentral<PuntoMapaHallazgoCentral[]>> {
  const respuesta = await listarHallazgosCentrales(filtros);
  if (!respuesta.ok) return respuesta;

  return {
    ok: true,
    data: prepararPuntosMapaGps(respuesta.data),
    origen: respuesta.origen,
  };
}

export async function obtenerResumenRadarPreventivo(
  filtros: FiltrosRadarPreventivoCentral = {}
): Promise<ResultadoRepositorioCentral<ResumenRadarPreventivoCentral>> {
  const respuesta = await listarHallazgosCentrales(filtros);
  if (!respuesta.ok) return respuesta;

  return {
    ok: true,
    data: prepararIndicadoresRadarPreventivo(respuesta.data),
    origen: respuesta.origen,
  };
}

export async function subirEvidenciaHallazgo(
  input: SubirEvidenciaHallazgoInput
): Promise<ResultadoRepositorioCentral<ResultadoSubidaEvidencia>> {
  const { cliente, habilitado } = await obtenerSupabaseDisponible();
  if (!habilitado || !cliente) return falloRepositorioDesactivado();

  const empresa = segmentoStorage(input.empresa, "sin-empresa");
  const obra = segmentoStorage(input.obra, "sin-obra");
  const codigo = segmentoStorage(input.codigo, "sin-codigo");
  const evidenciaId = segmentoStorage(input.evidenciaId, "evidencia");
  const extension = segmentoStorage(
    texto(input.extension, "jpg").replace(/^\./, ""),
    "jpg"
  );
  const storagePath = `empresa/${empresa}/obra/${obra}/hallazgo/${codigo}/${evidenciaId}.${extension}`;
  const tamanoBytes = tamanoArchivoStorage(input.archivo);

  if (process.env.NODE_ENV !== "production") {
    console.info("[hallazgos_central] upload evidencia intento", {
      bucket: BUCKET_EVIDENCIAS,
      storagePath,
      contentType: input.contentType || "image/jpeg",
      tamanoBytes,
    });
  }

  try {
    const { data, error } = await cliente.storage
      .from(BUCKET_EVIDENCIAS)
      .upload(storagePath, input.archivo, {
        contentType: input.contentType || "image/jpeg",
        upsert: false,
      });

    if (error) {
      const detalle = detalleErrorSupabase(error);

      if (process.env.NODE_ENV !== "production") {
        console.warn("[hallazgos_central] upload evidencia error", {
          bucket: BUCKET_EVIDENCIAS,
          storagePath,
          contentType: input.contentType || "image/jpeg",
          tamanoBytes,
          error: detalle,
        });
      }

      return falloSupabase(error, `No se pudo subir evidencia a Storage: ${detalle}`);
    }

    if (process.env.NODE_ENV !== "production") {
      console.info("[hallazgos_central] upload evidencia ok", {
        bucket: BUCKET_EVIDENCIAS,
        storagePath: data.path,
        contentType: input.contentType || "image/jpeg",
        tamanoBytes,
      });
    }

    return {
      ok: true,
      data: {
        bucket: BUCKET_EVIDENCIAS,
        storagePath: data.path,
      },
      origen: "supabase",
    };
  } catch (error) {
    const detalle = detalleErrorSupabase(error);

    if (process.env.NODE_ENV !== "production") {
      console.warn("[hallazgos_central] upload evidencia excepcion", {
        bucket: BUCKET_EVIDENCIAS,
        storagePath,
        contentType: input.contentType || "image/jpeg",
        tamanoBytes,
        error: detalle,
      });
    }

    return falloSupabase(error, `Fallo inesperado subiendo evidencia Storage: ${detalle}`);
  }
}

export type PrepararRadarPreventivoInput = Pick<
  HallazgoCentral,
  "criticidad" | "radarPreventivo"
>;

export function prepararIndicadoresRadarPreventivo(
  hallazgos: PrepararRadarPreventivoInput[]
): ResumenRadarPreventivoCentral {
  return hallazgos.reduce<ResumenRadarPreventivoCentral>(
    (resumen, hallazgo) => {
      const categoria =
        hallazgo.radarPreventivo?.categoriaRiesgo || "SIN_CATEGORIA";

      resumen.totalHallazgos += 1;
      resumen.porCriticidad[hallazgo.criticidad] += 1;
      resumen.porCategoriaRiesgo[categoria] =
        (resumen.porCategoriaRiesgo[categoria] || 0) + 1;

      if (hallazgo.radarPreventivo?.requiereAccionInmediata) {
        resumen.requiereAccionInmediata += 1;
      }

      if (hallazgo.radarPreventivo?.requiereDetencionTrabajo) {
        resumen.requiereDetencionTrabajo += 1;
      }

      return resumen;
    },
    {
      totalHallazgos: 0,
      porCriticidad: {
        BAJO: 0,
        MEDIO: 0,
        ALTO: 0,
        CRITICO: 0,
      },
      porCategoriaRiesgo: {},
      requiereAccionInmediata: 0,
      requiereDetencionTrabajo: 0,
    }
  );
}

export type PrepararMapaGpsInput = Pick<
  HallazgoCentral,
  "id" | "codigo" | "empresa" | "obra" | "area" | "criticidad" | "estado" | "geolocalizacion"
>;

export function prepararPuntosMapaGps(
  hallazgos: PrepararMapaGpsInput[]
): PuntoMapaHallazgoCentral[] {
  return hallazgos
    .filter((hallazgo) => Boolean(hallazgo.geolocalizacion))
    .map((hallazgo) => ({
      id: hallazgo.id,
      codigo: hallazgo.codigo,
      empresa: hallazgo.empresa,
      obra: hallazgo.obra,
      area: hallazgo.area,
      criticidad: hallazgo.criticidad,
      estado: hallazgo.estado,
      geolocalizacion: hallazgo.geolocalizacion as GeolocalizacionHallazgoCentral,
    }));
}

export type RepositorioCentralHallazgos = {
  listarHallazgosCentrales: typeof listarHallazgosCentrales;
  cargarHallazgosGestionVigente: typeof cargarHallazgosGestionVigente;
  obtenerHallazgoCentralPorId: typeof obtenerHallazgoCentralPorId;
  obtenerHallazgoCentralPorCodigo: typeof obtenerHallazgoCentralPorCodigo;
  crearHallazgoCentral: typeof crearHallazgoCentral;
  actualizarHallazgoCentral: typeof actualizarHallazgoCentral;
  actualizarEstadoHallazgoCentral: typeof actualizarEstadoHallazgoCentral;
  actualizarSeguimientoCierre: typeof actualizarSeguimientoCierre;
  registrarEventoBitacora: typeof registrarEventoBitacora;
  listarHallazgosParaMapaGps: typeof listarHallazgosParaMapaGps;
  obtenerResumenRadarPreventivo: typeof obtenerResumenRadarPreventivo;
  subirEvidenciaHallazgo: typeof subirEvidenciaHallazgo;
  estaSupabaseHabilitado: typeof estaSupabaseHabilitado;
};

export const repositorioCentralHallazgos: RepositorioCentralHallazgos = {
  listarHallazgosCentrales,
  cargarHallazgosGestionVigente,
  obtenerHallazgoCentralPorId,
  obtenerHallazgoCentralPorCodigo,
  crearHallazgoCentral,
  actualizarHallazgoCentral,
  actualizarEstadoHallazgoCentral,
  actualizarSeguimientoCierre,
  registrarEventoBitacora,
  listarHallazgosParaMapaGps,
  obtenerResumenRadarPreventivo,
  subirEvidenciaHallazgo,
  estaSupabaseHabilitado,
};
