import {
  obtenerEstadoSupabaseCliente,
  obtenerSupabaseCliente,
} from "../../lib/supabaseClient";
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
  area?: string;
  estado?: EstadoHallazgoCentral;
  criticidad?: HallazgoCentral["criticidad"];
  fechaDesde?: string;
  fechaHasta?: string;
  origen?: HallazgoCentral["origen"];
  limit?: number;
  offset?: number;
};

export type FiltrosMapaGpsCentral = FiltrosHallazgosCentrales & {
  soloConGps?: boolean;
  zona?: string;
  sector?: string;
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

function texto(valor: unknown, fallback = "") {
  const limpio = String(valor ?? "").trim();
  return limpio || fallback;
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
    gps_fecha_hora: fechaHoraSupabase(geo?.fechaHoraGeolocalizacion),
    gps_estado: geo?.estadoGeolocalizacion,
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
  const geolocalizacion =
    (typeof fila.gps_latitud === "number" &&
      typeof fila.gps_longitud === "number") ||
    (typeof fila.latitud === "number" && typeof fila.longitud === "number")
      ? {
          latitud: (fila.gps_latitud ?? fila.latitud) as number,
          longitud: (fila.gps_longitud ?? fila.longitud) as number,
          precisionGps: (fila.gps_precision ?? fila.precision_gps) as
            | number
            | undefined,
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
    evidencias: Array.isArray(fila.evidencias)
      ? (fila.evidencias as EvidenciaHallazgoCentral[])
      : [],
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
    seguimientoCierre: (fila.seguimiento_cierre ||
      undefined) as SeguimientoCierreCentral | undefined,
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
  gte: (columna: string, valor: unknown) => T;
  lte: (columna: string, valor: unknown) => T;
};

function aplicarFiltrosSupabase<T extends SupabaseFilterQuery<T>>(
  query: T,
  filtros: FiltrosHallazgosCentrales
) {
  let consulta = query;

  if (filtros.empresa) consulta = consulta.eq("empresa", filtros.empresa);
  if (filtros.obra) consulta = consulta.eq("obra", filtros.obra);
  if (filtros.area) consulta = consulta.eq("area", filtros.area);
  if (filtros.estado) consulta = consulta.eq("estado", filtros.estado);
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

  return consulta;
}

export async function listarHallazgosCentrales(
  filtros: FiltrosHallazgosCentrales = {}
): Promise<ResultadoRepositorioCentral<HallazgoCentral[]>> {
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

    const { data, error } = await query;
    if (error) {
      return falloSupabase(error, "No se pudo leer hallazgos desde Supabase.");
    }

    return {
      ok: true,
      data: (data || []).map((fila) =>
        mapearFilaSupabaseAHallazgo(fila as Record<string, unknown>)
      ),
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

    return {
      ok: true,
      data: data ? mapearFilaSupabaseAHallazgo(data) : null,
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

    return {
      ok: true,
      data: data ? mapearFilaSupabaseAHallazgo(data) : null,
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

  const empresa = texto(input.empresa, "sin-empresa").replace(/\s+/g, "-");
  const obra = texto(input.obra, "sin-obra").replace(/\s+/g, "-");
  const extension = texto(input.extension, "jpg").replace(/^\./, "");
  const storagePath = `empresa/${empresa}/obra/${obra}/hallazgo/${input.codigo}/${input.evidenciaId}.${extension}`;

  try {
    const { data, error } = await cliente.storage
      .from(BUCKET_EVIDENCIAS)
      .upload(storagePath, input.archivo, {
        contentType: input.contentType || "image/jpeg",
        upsert: false,
      });

    if (error) {
      return falloSupabase(error, "No se pudo subir evidencia a Storage.");
    }

    const { data: publicUrl } = cliente.storage
      .from(BUCKET_EVIDENCIAS)
      .getPublicUrl(data.path);

    return {
      ok: true,
      data: {
        storagePath: data.path,
        url: publicUrl.publicUrl,
      },
      origen: "supabase",
    };
  } catch (error) {
    return falloSupabase(error, "Fallo inesperado subiendo evidencia Storage.");
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
