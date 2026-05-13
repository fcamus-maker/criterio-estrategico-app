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

function fecha(valor: unknown) {
  return texto(valor) || null;
}

function json<T>(valor: T | undefined, fallback: T): T {
  return valor ?? fallback;
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

  const { fotos, supervisorFoto, ...resto } = rawMobileV2;
  void supervisorFoto;

  return {
    ...resto,
    fotos: Array.isArray(fotos)
      ? fotos.map((foto) => {
          if (!foto || typeof foto !== "object") return foto;
          const { dataUrl, ...fotoSinBase64 } = foto as Record<string, unknown>;
          void dataUrl;
          return fotoSinBase64;
        })
      : fotos,
    fotosBase64Omitidas: Array.isArray(fotos),
    supervisorFotoBase64Omitida: Boolean(supervisorFoto),
  };
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
    fecha_reporte: fecha(hallazgo.fechaReporte),
    hora_reporte: texto(hallazgo.horaReporte) || null,
    fecha_hora_reporte: fecha(hallazgo.fechaHoraReporteISO),
    descripcion: hallazgo.descripcion,
    tipo_hallazgo: hallazgo.tipoHallazgo,
    criticidad: hallazgo.criticidad,
    prioridad: hallazgo.prioridad,
    puntaje_evaluacion: hallazgo.puntajeEvaluacion,
    respuestas_evaluacion: json(hallazgo.respuestasEvaluacion, {}),
    accion_inmediata: hallazgo.accionInmediata,
    recomendacion: hallazgo.recomendacion,
    estado: hallazgo.estado,
    estado_cierre: hallazgo.estadoCierre || seguimiento?.estadoCierre || "PENDIENTE",
    evidencias: evidenciasSinBase64(hallazgo.evidencias),
    latitud: geo?.latitud,
    longitud: geo?.longitud,
    precision_gps: geo?.precisionGps,
    fecha_hora_geolocalizacion: fecha(geo?.fechaHoraGeolocalizacion),
    estado_geolocalizacion: geo?.estadoGeolocalizacion,
    direccion_referencial: geo?.direccionReferencial,
    zona: geo?.zona,
    sector: geo?.sector,
    visible_en_mapa: hallazgo.mapaGps?.visibleEnMapa ?? Boolean(geo),
    geolocalizacion: geo || {},
    responsable_cierre_tipo: responsable?.tipoResponsable,
    responsable_cierre_nombre: responsable?.nombre,
    responsable_cierre_cargo: responsable?.cargo,
    responsable_cierre_empresa: responsable?.empresa,
    responsable_cierre_telefono: responsable?.telefono,
    responsable_cierre_email: responsable?.email,
    fecha_compromiso_cierre: fecha(seguimiento?.fechaCompromiso),
    fecha_maxima_permitida_cierre: fecha(seguimiento?.fechaMaximaPermitida),
    plazo_cierre_por_criticidad: seguimiento?.plazoPorCriticidad,
    observacion_inicial_cierre: seguimiento?.observacionInicial,
    accion_correctiva_requerida: seguimiento?.accionCorrectivaRequerida,
    evidencia_requerida: json(seguimiento?.evidenciaRequerida, []),
    evidencia_recibida: evidenciasSinBase64(seguimiento?.evidenciaRecibida),
    fecha_cierre: fecha(seguimiento?.fechaCierre),
    validador_cierre_nombre: seguimiento?.validadorNombre,
    validador_cierre_estado: seguimiento?.validadorEstado,
    validador_cierre_observacion: seguimiento?.validadorObservacion,
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
    created_at: fecha(hallazgo.createdAt || hallazgo.fechaCreacion),
    updated_at: fecha(hallazgo.updatedAt || hallazgo.fechaActualizacion),
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
  asignarSiDefinido(fila, "fecha_reporte", cambios.fechaReporte);
  asignarSiDefinido(fila, "hora_reporte", cambios.horaReporte);
  asignarSiDefinido(fila, "fecha_hora_reporte", cambios.fechaHoraReporteISO);
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

  if (cambios.evidencias) {
    fila.evidencias = evidenciasSinBase64(cambios.evidencias);
  }

  if (geo) {
    fila.latitud = geo.latitud;
    fila.longitud = geo.longitud;
    fila.precision_gps = geo.precisionGps;
    fila.fecha_hora_geolocalizacion = geo.fechaHoraGeolocalizacion;
    fila.estado_geolocalizacion = geo.estadoGeolocalizacion;
    fila.direccion_referencial = geo.direccionReferencial;
    fila.zona = geo.zona;
    fila.sector = geo.sector;
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
    fila.fecha_compromiso_cierre = seguimiento.fechaCompromiso;
    fila.fecha_maxima_permitida_cierre = seguimiento.fechaMaximaPermitida;
    fila.plazo_cierre_por_criticidad = seguimiento.plazoPorCriticidad;
    fila.observacion_inicial_cierre = seguimiento.observacionInicial;
    fila.accion_correctiva_requerida = seguimiento.accionCorrectivaRequerida;
    fila.evidencia_requerida = seguimiento.evidenciaRequerida || [];
    fila.evidencia_recibida = evidenciasSinBase64(seguimiento.evidenciaRecibida);
    fila.fecha_cierre = seguimiento.fechaCierre;
    fila.validador_cierre_nombre = seguimiento.validadorNombre;
    fila.validador_cierre_estado = seguimiento.validadorEstado;
    fila.validador_cierre_observacion = seguimiento.validadorObservacion;
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
    typeof fila.latitud === "number" && typeof fila.longitud === "number"
      ? {
          latitud: fila.latitud,
          longitud: fila.longitud,
          precisionGps: fila.precision_gps as number | undefined,
          fechaHoraGeolocalizacion: texto(fila.fecha_hora_geolocalizacion),
          estadoGeolocalizacion: texto(fila.estado_geolocalizacion) as
            | GeolocalizacionHallazgoCentral["estadoGeolocalizacion"]
            | undefined,
          direccionReferencial: texto(fila.direccion_referencial),
          zona: texto(fila.zona),
          sector: texto(fila.sector),
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
    consulta = consulta.gte("fecha_hora_reporte", filtros.fechaDesde);
  }
  if (filtros.fechaHasta) {
    consulta = consulta.lte("fecha_hora_reporte", filtros.fechaHasta);
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
      .order("fecha_hora_reporte", { ascending: false, nullsFirst: false })
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
  if (!habilitado || !cliente) return falloRepositorioDesactivado();

  try {
    const fila = mapearHallazgoAFilaSupabase(hallazgo);
    const { data, error } = await cliente
      .from(TABLA_HALLAZGOS_CENTRAL)
      .insert(fila)
      .select("*")
      .single();

    if (error) {
      return falloSupabase(error, "No se pudo crear hallazgo en Supabase.");
    }

    return {
      ok: true,
      data: mapearFilaSupabaseAHallazgo(data),
      origen: "supabase",
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
