import type {
  CriticidadHallazgoCentral,
  EstadoCierreCentral,
  EstadoHallazgoCentral,
  EvidenciaHallazgoCentral,
  GeolocalizacionHallazgoCentral,
  HallazgoCentral,
  PrioridadHallazgoCentral,
  RadarPreventivoCentral,
  SeguimientoCierreCentral,
  TipoHallazgoCentral,
} from "../types/hallazgoCentral";
import type { EvaluacionMotorV2Storage } from "../evaluar-v2/storageReporteV2";

export type FotoReporteV2Central = {
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

export type GpsReporteV2Central = {
  latitud?: number;
  longitud?: number;
  precisionGps?: number;
  fechaHoraGeolocalizacion?: string;
  estadoGeolocalizacion?: string;
  motivoGeolocalizacion?: string;
};

export type EvaluacionReporteV2Central = {
  respuestas?: Record<string, string>;
  puntaje?: number;
  criticidad?: string;
  prioridad?: string;
  recomendacion?: string;
  accionInmediata?: string;
} & EvaluacionMotorV2Storage;

export type CierreReporteV2Central = {
  responsableCorreccionTipo?: string;
  responsableCorreccionEmpresa?: string;
  responsableCorreccionNombre?: string;
  responsableCorreccionCargo?: string;
  responsableCorreccionTelefono?: string;
  encargadoSeguimientoNombre?: string;
  responsableCierreFechaCompromiso?: string;
  responsableCierreEstadoSeguimiento?: string;
  responsableCierreEvidencia?: string;
  responsableCierreObservacion?: string;
  evidenciaRequerida?: string[] | string;
  evidenciaRecibida?: FotoReporteV2Central[] | string[] | string;
  validadorCierreNombre?: string;
  validadorCierreEstado?: string;
  validadorCierreObservacion?: string;
};

export type ReporteV2CentralEntrada = {
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
  fotos?: FotoReporteV2Central[];
  gps?: GpsReporteV2Central;
  evaluacion?: EvaluacionReporteV2Central;
  cierre?: CierreReporteV2Central;
  asignacionCierre?: CierreReporteV2Central;
};

function texto(valor: unknown, fallback = "") {
  const limpio = String(valor ?? "").trim();
  return limpio || fallback;
}

function normalizar(valor: unknown) {
  return texto(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

export function normalizarCriticidadCentral(
  valor: unknown
): CriticidadHallazgoCentral {
  const nivel = normalizar(valor);

  if (nivel.includes("CRIT")) return "CRITICO";
  if (nivel.includes("ALTO")) return "ALTO";
  if (nivel.includes("MED")) return "MEDIO";
  return "BAJO";
}

export function normalizarPrioridadCentral(
  valor: unknown,
  criticidad: CriticidadHallazgoCentral
): PrioridadHallazgoCentral {
  const prioridad = normalizar(valor);

  if (prioridad.includes("URG")) return "Urgente";
  if (prioridad.includes("ALT")) return "Alta";
  if (prioridad.includes("MED")) return "Media";

  if (criticidad === "CRITICO") return "Urgente";
  if (criticidad === "ALTO") return "Alta";
  if (criticidad === "MEDIO") return "Media";
  return "Normal";
}

export function normalizarEstadoHallazgoCentral(
  reporte: Pick<ReporteV2CentralEntrada, "estado" | "estadoCierre">
): EstadoHallazgoCentral {
  const estado = normalizar(reporte.estado);
  const estadoCierre = normalizar(reporte.estadoCierre);

  if (estado === "ANULADO") return "ANULADO";
  if (estado === "CERRADO" || estadoCierre === "CERRADO") return "CERRADO";
  if (estado.includes("SEGUIMIENTO") || estadoCierre.includes("GESTION")) {
    return "EN_SEGUIMIENTO";
  }
  if (estado === "REPORTADO") return "REPORTADO";
  return "ABIERTO";
}

export function normalizarEstadoCierreCentral(valor: unknown): EstadoCierreCentral {
  const estado = normalizar(valor);

  if (estado === "CERRADO") return "CERRADO";
  if (estado.includes("RECHAZ")) return "RECHAZADO";
  if (estado.includes("VENC")) return "VENCIDO";
  if (estado.includes("GESTION")) return "EN_GESTION";
  if (estado.includes("ASIGN")) return "ASIGNADO";
  return "PENDIENTE";
}

function normalizarTipoHallazgo(valor: unknown): TipoHallazgoCentral {
  const tipo = normalizar(valor);

  if (tipo.includes("ACTO")) return "Acto subestandar";
  if (tipo.includes("INCIDENT")) return "Incidente";
  if (tipo.includes("OBSERV")) return "Observacion preventiva";
  if (tipo.includes("OTRO")) return "Otro";
  return "Condicion subestandar";
}

function normalizarFechaISO(valor: unknown) {
  const fechaTexto = texto(valor);
  if (!fechaTexto) return "";

  const fechaChile = fechaTexto.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (fechaChile) {
    const [, dia, mes, anio] = fechaChile;
    const fecha = new Date(Number(anio), Number(mes) - 1, Number(dia));
    return Number.isNaN(fecha.getTime()) ? "" : fecha.toISOString();
  }

  const fecha = new Date(fechaTexto);
  return Number.isNaN(fecha.getTime()) ? "" : fecha.toISOString();
}

function combinarFechaHoraISO(fecha: unknown, hora: unknown) {
  const fechaISO = normalizarFechaISO(fecha);
  if (!fechaISO) return "";

  const horaTexto = texto(hora);
  const matchHora = horaTexto.match(/(\d{1,2}):(\d{2})/);
  if (!matchHora) return fechaISO;

  const fechaCompleta = new Date(fechaISO);
  fechaCompleta.setHours(Number(matchHora[1]), Number(matchHora[2]), 0, 0);
  return fechaCompleta.toISOString();
}

function evidenciasDesdeFotos(
  fotos: FotoReporteV2Central[] | undefined
): EvidenciaHallazgoCentral[] {
  if (!Array.isArray(fotos)) return [];

  return fotos
    .map((foto) => ({
      id: texto(foto.id),
      evidenceId: texto(foto.evidenceId || foto.id),
      nombre: texto(foto.nombre, "fotografia-v2.jpg"),
      tipo: texto(foto.tipo, "image/jpeg"),
      mimeType: texto(foto.mimeType || foto.tipo, "image/jpeg"),
      bucket: texto(foto.bucket),
      url: texto(foto.url),
      storagePath: texto(foto.storagePath),
      tamanoBytes: foto.tamanoBytes || foto.pesoBytes,
      pesoBytes: foto.pesoBytes || foto.tamanoBytes,
      sizeOriginal: foto.sizeOriginal,
      sizeCompressed: foto.sizeCompressed || foto.pesoBytes || foto.tamanoBytes,
      indice: foto.indice,
      estadoSubida: foto.estadoSubida,
      descripcion:
        foto.estadoSubida === "error"
          ? "Evidencia fotografica pendiente por error de Storage."
          : foto.estadoSubida === "pendiente" || foto.storagePendiente
            ? "Evidencia fotografica pendiente de sincronizacion."
          : foto.dataUrl || foto.dataUrlOmitida || foto.storagePendiente
            ? "Evidencia fotografica pendiente de carga a Storage."
            : "",
      fechaCarga: texto(foto.fechaCarga),
      fechaCaptura: texto(foto.fechaCaptura || foto.fechaCarga),
      capturedAt: texto(foto.capturedAt || foto.fechaCaptura || foto.fechaCarga),
      gpsAt: texto(foto.gpsAt || foto.gps?.fechaHoraGeolocalizacion),
      gps: foto.gps,
      deviceOnline: foto.deviceOnline,
      userAgent: texto(foto.userAgent),
      origenDeclarado: texto(foto.origenDeclarado),
      fechaSubida: texto(foto.fechaSubida),
      localBlobKey: texto(foto.localBlobKey),
      intentos: foto.intentos,
      origen: "mobile-v2" as const,
      error: texto(foto.error),
    }))
    .filter((foto) => foto.url || foto.storagePath || foto.nombre);
}

function geolocalizacionDesdeGps(
  gps: GpsReporteV2Central | undefined
): GeolocalizacionHallazgoCentral | undefined {
  if (
    typeof gps?.latitud !== "number" ||
    typeof gps.longitud !== "number"
  ) {
    return undefined;
  }

  return {
    latitud: gps.latitud,
    longitud: gps.longitud,
    precisionGps: gps.precisionGps,
    fechaHoraGeolocalizacion: texto(gps.fechaHoraGeolocalizacion),
    estadoGeolocalizacion:
      gps.estadoGeolocalizacion === "obtenido"
        ? "obtenido"
        : gps.estadoGeolocalizacion === "real"
          ? "real"
          : "capturada",
  };
}

function estadoGpsReporte(
  gps: GpsReporteV2Central | undefined
): GeolocalizacionHallazgoCentral["estadoGeolocalizacion"] | undefined {
  const estado = texto(gps?.estadoGeolocalizacion);

  if (estado === "obtenido") return "obtenido";
  if (estado === "pendiente") return "pendiente";
  if (estado === "denegado") return "denegado";
  if (estado === "error") return "error";
  if (estado === "real") return "real";
  if (estado === "capturada") return "capturada";
  if (estado === "rechazada") return "rechazada";
  if (estado === "no_disponible") return "no_disponible";
  if (estado === "simulada-desarrollo") return "simulada-desarrollo";

  return gps ? "pendiente" : undefined;
}

function listaTexto(valor: string[] | string | undefined): string[] {
  if (Array.isArray(valor)) {
    return valor.map((item) => texto(item)).filter(Boolean);
  }

  const limpio = texto(valor);
  return limpio ? [limpio] : [];
}

function evidenciaRecibida(
  valor: CierreReporteV2Central["evidenciaRecibida"]
): EvidenciaHallazgoCentral[] {
  if (!Array.isArray(valor)) {
    const descripcion = texto(valor);
    return descripcion ? [{ descripcion, origen: "mobile-v2" }] : [];
  }

  return valor
    .map((item) => {
      if (typeof item === "string") {
        return { descripcion: item, origen: "mobile-v2" as const };
      }

      return {
        id: texto(item.id),
        nombre: texto(item.nombre),
        tipo: texto(item.tipo),
        url: texto(item.url),
        storagePath: texto(item.storagePath),
        descripcion: item.dataUrl
          ? "Evidencia de cierre pendiente de carga a Storage."
          : "",
        fechaCarga: texto(item.fechaCarga),
        origen: "mobile-v2" as const,
      };
    })
    .filter((item) => item.descripcion || item.url || item.storagePath || item.nombre);
}

function seguimientoDesdeCierre(
  reporte: ReporteV2CentralEntrada
): SeguimientoCierreCentral | undefined {
  const cierre = reporte.asignacionCierre || reporte.cierre;
  const empresaInvolucrada = texto(reporte.empresaInvolucradaResponsable);
  const responsableEmpresa = texto(reporte.responsableEmpresa);
  const cargoResponsable = texto(reporte.cargoResponsableEmpresa);

  if (!cierre && (empresaInvolucrada || responsableEmpresa || cargoResponsable)) {
    return {
      responsable: {
        tipoResponsable: "contratista",
        nombre: responsableEmpresa,
        cargo: cargoResponsable,
        empresa: empresaInvolucrada,
      },
      estadoCierre: normalizarEstadoCierreCentral(reporte.estadoCierre),
    };
  }

  if (!cierre) return undefined;

  return {
    responsable: {
      tipoResponsable: "contratista",
      nombre: texto(cierre.responsableCorreccionNombre),
      cargo: texto(cierre.responsableCorreccionCargo),
      empresa: texto(cierre.responsableCorreccionEmpresa),
      telefono: texto(cierre.responsableCorreccionTelefono),
    },
    estadoCierre: normalizarEstadoCierreCentral(
      cierre.responsableCierreEstadoSeguimiento || reporte.estadoCierre
    ),
    fechaCompromiso: texto(cierre.responsableCierreFechaCompromiso),
    observacionInicial: texto(cierre.responsableCierreObservacion),
    evidenciaRequerida: listaTexto(cierre.evidenciaRequerida),
    evidenciaRecibida: evidenciaRecibida(cierre.evidenciaRecibida),
    validadorNombre: texto(cierre.validadorCierreNombre),
    validadorEstado: texto(cierre.validadorCierreEstado),
    validadorObservacion: texto(cierre.validadorCierreObservacion),
  };
}

function radarPreventivoDesdeReporte(
  reporte: ReporteV2CentralEntrada,
  criticidad: CriticidadHallazgoCentral
): RadarPreventivoCentral {
  const textoAnalisis = normalizar(`${reporte.area || ""} ${reporte.descripcion || ""}`);
  const palabrasClave = [
    "ALTURA",
    "ENERGIA",
    "ELECTRICIDAD",
    "TRANSITO",
    "ATROPELLO",
    "MAQUINARIA",
    "INCENDIO",
    "SEGREGACION",
    "DOCUMENTAL",
  ].filter((palabra) => textoAnalisis.includes(palabra));

  return {
    categoriaRiesgo: palabrasClave[0] || "GENERAL",
    causaDominante: palabrasClave[0] || "GENERAL",
    palabrasClave,
    nivelExposicion:
      criticidad === "CRITICO" ? "critico" : criticidad.toLowerCase() as "bajo" | "medio" | "alto",
    potencialSeveridad:
      criticidad === "CRITICO" ? "critico" : criticidad.toLowerCase() as "bajo" | "medio" | "alto",
    probabilidadRepeticion: criticidad === "BAJO" ? "baja" : "media",
    requiereAccionInmediata: criticidad === "CRITICO" || criticidad === "ALTO",
    requiereDetencionTrabajo: criticidad === "CRITICO",
    indicadores: {
      puntaje: reporte.evaluacion?.puntaje || 0,
      totalPalabrasClave: palabrasClave.length,
      tieneGps:
        typeof reporte.gps?.latitud === "number" &&
        typeof reporte.gps.longitud === "number",
      totalFotos: Array.isArray(reporte.fotos) ? reporte.fotos.length : 0,
    },
  };
}

function evaluacionMotorV2DesdeReporte(
  evaluacion: EvaluacionReporteV2Central | undefined
) {
  if (!evaluacion?.evaluacion_motor_version) return undefined;

  return {
    evaluacion_motor_version: evaluacion.evaluacion_motor_version,
    ambito_principal: evaluacion.ambito_principal,
    ambitos_secundarios: evaluacion.ambitos_secundarios,
    tipo_evento: evaluacion.tipo_evento,
    criticidad_base: evaluacion.criticidad_base,
    criticidad_final: evaluacion.criticidad_final,
    justificacion_tecnica: evaluacion.justificacion_tecnica,
    resumen_ejecutivo: evaluacion.resumen_ejecutivo,
    medida_inmediata_v2: evaluacion.medida_inmediata_v2,
    plazo_sugerido_v2: evaluacion.plazo_sugerido_v2,
    requiere_suspension: evaluacion.requiere_suspension,
    requiere_contencion_ambiental: evaluacion.requiere_contencion_ambiental,
    requiere_revision_manual: evaluacion.requiere_revision_manual,
    normativa_probable: evaluacion.normativa_probable,
    senales_criticas: evaluacion.senales_criticas,
    factores_elevadores: evaluacion.factores_elevadores,
    factores_limitantes: evaluacion.factores_limitantes,
    inconsistencias: evaluacion.inconsistencias,
    categoria_detectada: evaluacion.categoria_detectada,
    modulo_preguntas_sugerido: evaluacion.modulo_preguntas_sugerido,
    preguntas_sugeridas: evaluacion.preguntas_sugeridas,
    preguntas_criticas_respondidas: evaluacion.preguntas_criticas_respondidas,
    preguntas_faltantes_recomendadas: evaluacion.preguntas_faltantes_recomendadas,
    justificacion_modulo_preguntas: evaluacion.justificacion_modulo_preguntas,
    confianza_clasificacion: evaluacion.confianza_clasificacion,
    palabras_clave_detectadas: evaluacion.palabras_clave_detectadas,
    fuente_evaluacion: evaluacion.fuente_evaluacion,
  };
}

function textoOpcional(valor: unknown) {
  const limpio = texto(valor);
  return limpio || undefined;
}

function listaUnicaTexto(valor: unknown) {
  const salida = Array.isArray(valor)
    ? valor
        .map((item) => {
          if (item && typeof item === "object" && "norma" in item) {
            return texto((item as { norma?: unknown }).norma);
          }

          return texto(item);
        })
        .filter(Boolean)
    : listaTexto(typeof valor === "string" ? valor : undefined);

  return Array.from(new Set(salida));
}

function evaluacionPreventivaDesdeMotorV2(
  evaluacion: EvaluacionReporteV2Central | undefined
) {
  if (!evaluacion?.evaluacion_motor_version) return undefined;

  const preventiva: Record<string, unknown> = {
    analisisEjecutivo: textoOpcional(evaluacion.resumen_ejecutivo),
    marcoLegalRelacionado: listaUnicaTexto(evaluacion.normativa_probable),
    familiaRiesgoPrincipal: textoOpcional(
      evaluacion.categoria_detectada || evaluacion.modulo_preguntas_sugerido
    ),
    palabrasClaveDetectadas: listaUnicaTexto(evaluacion.palabras_clave_detectadas),
    criteriosCriticosDetectados: listaUnicaTexto(evaluacion.senales_criticas),
    motivoTecnicoHallazgo: textoOpcional(evaluacion.justificacion_tecnica),
    versionMotorPreventivo: textoOpcional(evaluacion.evaluacion_motor_version),
    nivelSuficienciaInformacion: textoOpcional(evaluacion.confianza_clasificacion),
    criticidadPreventiva: textoOpcional(
      evaluacion.criticidad || evaluacion.criticidad_final
    ),
    prioridad: textoOpcional(evaluacion.prioridad),
  };

  Object.entries(preventiva).forEach(([clave, valor]) => {
    if (
      valor === undefined ||
      (Array.isArray(valor) && valor.length === 0)
    ) {
      delete preventiva[clave];
    }
  });

  return Object.keys(preventiva).length ? preventiva : undefined;
}

function rawMobileV2DesdeReporte(reporte: ReporteV2CentralEntrada) {
  const evaluacionPreventiva = evaluacionPreventivaDesdeMotorV2(reporte.evaluacion);
  const rawMobileV2 = reporte as Record<string, unknown>;

  if (!evaluacionPreventiva) return rawMobileV2;

  return {
    ...rawMobileV2,
    evaluacionPreventiva,
  };
}

export function adaptarReporteV2AHallazgoCentral(
  reporte: ReporteV2CentralEntrada,
  indice = 0
): HallazgoCentral {
  const criticidad = normalizarCriticidadCentral(reporte.evaluacion?.criticidad);
  const prioridad = normalizarPrioridadCentral(
    reporte.evaluacion?.prioridad,
    criticidad
  );
  const estado = normalizarEstadoHallazgoCentral(reporte);
  const geolocalizacion = geolocalizacionDesdeGps(reporte.gps);
  const gpsEstadoGeolocalizacion = estadoGpsReporte(reporte.gps);
  const codigo = texto(
    reporte.codigo,
    `MOBILE-V2-${String(indice + 1).padStart(4, "0")}`
  );
  const fechaHoraReporteISO =
    combinarFechaHoraISO(reporte.fecha, reporte.hora) ||
    normalizarFechaISO(reporte.fechaGuardado);

  return {
    codigo,
    codigoInforme: codigo,
    origen: "mobile-v2",
    estadoSincronizacion: "LOCAL",
    empresa: texto(reporte.empresa, "Sin empresa"),
    obra: texto(reporte.obra, "Sin obra"),
    empresaId: texto(reporte.empresaId),
    obraId: texto(reporte.obraId),
    reportanteUserId: texto(reporte.reportanteUserId),
    supervisorUserId: texto(reporte.supervisorUserId),
    proyecto: texto(reporte.proyecto || reporte.obra, "Sin proyecto"),
    area: texto(reporte.area, "Sin area"),
    siglaEmpresa: texto(reporte.siglaEmpresa),
    siglaProyecto: texto(reporte.siglaProyecto),
    reportante: {
      nombre: texto(reporte.supervisor, "Supervisor movil V2"),
      cargo: texto(reporte.cargo),
      empresa: texto(reporte.empresa),
    },
    fechaReporte: texto(reporte.fecha || reporte.fechaGuardado, ""),
    horaReporte: texto(reporte.hora),
    fechaHoraReporteISO,
    descripcion: texto(reporte.descripcion, "Sin descripcion"),
    tipoHallazgo: normalizarTipoHallazgo(undefined),
    criticidad,
    prioridad,
    puntajeEvaluacion: reporte.evaluacion?.puntaje,
    respuestasEvaluacion: reporte.evaluacion?.respuestas,
    evaluacionMotorV2: evaluacionMotorV2DesdeReporte(reporte.evaluacion),
    accionInmediata: texto(reporte.evaluacion?.accionInmediata),
    recomendacion: texto(reporte.evaluacion?.recomendacion),
    estado,
    estadoCierre: normalizarEstadoCierreCentral(reporte.estadoCierre),
    evidencias: evidenciasDesdeFotos(reporte.fotos),
    geolocalizacion,
    gpsEstadoGeolocalizacion,
    gpsFechaHoraGeolocalizacion: texto(reporte.gps?.fechaHoraGeolocalizacion),
    gpsMotivoGeolocalizacion: texto(reporte.gps?.motivoGeolocalizacion),
    mapaGps: geolocalizacion
      ? {
          latitud: geolocalizacion.latitud,
          longitud: geolocalizacion.longitud,
          precisionGps: geolocalizacion.precisionGps,
          zona: geolocalizacion.zona,
          sector: geolocalizacion.sector,
          visibleEnMapa: true,
        }
      : { visibleEnMapa: false },
    seguimientoCierre: seguimientoDesdeCierre(reporte),
    radarPreventivo: radarPreventivoDesdeReporte(reporte, criticidad),
    bitacora: [
      {
        fechaHora: texto(reporte.fechaGuardado, fechaHoraReporteISO),
        usuario: texto(reporte.supervisor, "Supervisor movil V2"),
        accion: "CREACION_REPORTE_V2",
        resumen: "Reporte generado desde app movil V2.",
        estadoNuevo: estado,
      },
    ],
    auditoria: {
      creadoPor: texto(reporte.reportanteUserId || reporte.supervisorUserId || reporte.supervisor),
      versionApp: "mobile-v2",
    },
    rawMobileV2: rawMobileV2DesdeReporte(reporte),
    fechaCreacion: texto(reporte.fechaGuardado, fechaHoraReporteISO),
    fechaActualizacion: texto(reporte.fechaGuardado, fechaHoraReporteISO),
    createdAt: texto(reporte.fechaGuardado, fechaHoraReporteISO),
    updatedAt: texto(reporte.fechaGuardado, fechaHoraReporteISO),
  };
}

export function adaptarReportesV2AHallazgosCentrales(
  reportes: ReporteV2CentralEntrada[]
): HallazgoCentral[] {
  return reportes.map((reporte, indice) =>
    adaptarReporteV2AHallazgoCentral(reporte, indice)
  );
}
