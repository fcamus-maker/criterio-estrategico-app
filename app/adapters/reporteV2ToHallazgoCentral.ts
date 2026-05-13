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

export type FotoReporteV2Central = {
  id?: string;
  nombre?: string;
  tipo?: string;
  dataUrl?: string;
  url?: string;
  storagePath?: string;
  fechaCarga?: string;
};

export type GpsReporteV2Central = {
  latitud?: number;
  longitud?: number;
  precisionGps?: number;
  fechaHoraGeolocalizacion?: string;
  estadoGeolocalizacion?: string;
};

export type EvaluacionReporteV2Central = {
  respuestas?: Record<string, string>;
  puntaje?: number;
  criticidad?: string;
  prioridad?: string;
  recomendacion?: string;
  accionInmediata?: string;
};

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
      nombre: texto(foto.nombre, "fotografia-v2.jpg"),
      tipo: texto(foto.tipo, "image/jpeg"),
      url: texto(foto.url),
      dataUrl: texto(foto.dataUrl),
      storagePath: texto(foto.storagePath),
      fechaCarga: texto(foto.fechaCarga),
      origen: "mobile-v2" as const,
    }))
    .filter((foto) => foto.url || foto.dataUrl || foto.storagePath);
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
      gps.estadoGeolocalizacion === "simulada-desarrollo"
        ? "simulada-desarrollo"
        : "real",
  };
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
        dataUrl: texto(item.dataUrl),
        storagePath: texto(item.storagePath),
        fechaCarga: texto(item.fechaCarga),
        origen: "mobile-v2" as const,
      };
    })
    .filter((item) => item.descripcion || item.url || item.dataUrl || item.storagePath);
}

function seguimientoDesdeCierre(
  reporte: ReporteV2CentralEntrada
): SeguimientoCierreCentral | undefined {
  const cierre = reporte.asignacionCierre || reporte.cierre;
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
      tieneGps: Boolean(reporte.gps),
      totalFotos: Array.isArray(reporte.fotos) ? reporte.fotos.length : 0,
    },
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
    proyecto: texto(reporte.proyecto || reporte.obra, "Sin proyecto"),
    area: texto(reporte.area, "Sin area"),
    siglaEmpresa: texto(reporte.siglaEmpresa),
    siglaProyecto: texto(reporte.siglaProyecto),
    reportante: {
      nombre: texto(reporte.supervisor, "Supervisor movil V2"),
      cargo: texto(reporte.cargo),
      empresa: texto(reporte.empresa),
      fotoDataUrl: texto(reporte.supervisorFoto),
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
    accionInmediata: texto(reporte.evaluacion?.accionInmediata),
    recomendacion: texto(reporte.evaluacion?.recomendacion),
    estado,
    estadoCierre: normalizarEstadoCierreCentral(reporte.estadoCierre),
    evidencias: evidenciasDesdeFotos(reporte.fotos),
    geolocalizacion,
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
      creadoPor: texto(reporte.supervisor),
      versionApp: "mobile-v2",
    },
    rawMobileV2: reporte as Record<string, unknown>,
    fechaCreacion: texto(reporte.fechaGuardado, fechaHoraReporteISO),
    fechaActualizacion: texto(reporte.fechaGuardado, fechaHoraReporteISO),
  };
}

export function adaptarReportesV2AHallazgosCentrales(
  reportes: ReporteV2CentralEntrada[]
): HallazgoCentral[] {
  return reportes.map((reporte, indice) =>
    adaptarReporteV2AHallazgoCentral(reporte, indice)
  );
}
