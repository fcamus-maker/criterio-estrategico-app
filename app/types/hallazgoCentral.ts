export type OrigenHallazgoCentral =
  | "mobile-v2"
  | "mobile-v1"
  | "panel-pc"
  | "importacion"
  | "api";

export type TipoHallazgoCentral =
  | "Condicion subestandar"
  | "Acto subestandar"
  | "Incidente"
  | "Observacion preventiva"
  | "Otro";

export type CriticidadHallazgoCentral =
  | "BAJO"
  | "MEDIO"
  | "ALTO"
  | "CRITICO";

export type PrioridadHallazgoCentral =
  | "Normal"
  | "Media"
  | "Alta"
  | "Urgente";

export type EstadoHallazgoCentral =
  | "REPORTADO"
  | "ABIERTO"
  | "EN_SEGUIMIENTO"
  | "CERRADO"
  | "ANULADO";

export type EstadoCierreCentral =
  | "PENDIENTE"
  | "ASIGNADO"
  | "EN_GESTION"
  | "VENCIDO"
  | "CERRADO"
  | "RECHAZADO";

export type EstadoSincronizacionCentral =
  | "LOCAL"
  | "PENDIENTE_SYNC"
  | "SINCRONIZADO"
  | "ERROR_SYNC";

export type EvidenciaHallazgoCentral = {
  id?: string;
  nombre?: string;
  tipo?: string;
  url?: string;
  dataUrl?: string;
  storagePath?: string;
  descripcion?: string;
  fechaCarga?: string;
  origen?: OrigenHallazgoCentral;
};

export type GeolocalizacionHallazgoCentral = {
  latitud: number;
  longitud: number;
  precisionGps?: number;
  fechaHoraGeolocalizacion?: string;
  estadoGeolocalizacion?:
    | "real"
    | "capturada"
    | "simulada-desarrollo"
    | "pendiente"
    | "rechazada"
    | "no_disponible";
  direccionReferencial?: string;
  zona?: string;
  sector?: string;
};

export type ReportanteHallazgoCentral = {
  nombre: string;
  cargo?: string;
  empresa?: string;
  telefono?: string;
  email?: string;
  fotoUrl?: string;
  fotoDataUrl?: string;
};

export type ResponsableCierreCentral = {
  tipoResponsable?: "empresa" | "persona" | "cargo" | "contratista" | "otro";
  nombre?: string;
  cargo?: string;
  empresa?: string;
  telefono?: string;
  email?: string;
};

export type SeguimientoCierreCentral = {
  responsable: ResponsableCierreCentral;
  estadoCierre: EstadoCierreCentral;
  fechaCompromiso?: string;
  fechaMaximaPermitida?: string;
  plazoPorCriticidad?: string;
  observacionInicial?: string;
  accionCorrectivaRequerida?: string;
  evidenciaRequerida?: string[];
  evidenciaRecibida?: EvidenciaHallazgoCentral[];
  fechaCierre?: string;
  validadorNombre?: string;
  validadorEstado?: string;
  validadorObservacion?: string;
};

export type BitacoraHallazgoCentral = {
  id?: string;
  fechaHora: string;
  usuario?: string;
  accion: string;
  resumen?: string;
  estadoAnterior?: EstadoHallazgoCentral | EstadoCierreCentral | string;
  estadoNuevo?: EstadoHallazgoCentral | EstadoCierreCentral | string;
  camposModificados?: string[];
  metadata?: Record<string, unknown>;
};

export type RadarPreventivoCentral = {
  categoriaRiesgo?: string;
  causaDominante?: string;
  palabrasClave?: string[];
  nivelExposicion?: "bajo" | "medio" | "alto" | "critico";
  potencialSeveridad?: "bajo" | "medio" | "alto" | "critico";
  probabilidadRepeticion?: "baja" | "media" | "alta";
  requiereAccionInmediata?: boolean;
  requiereDetencionTrabajo?: boolean;
  indicadores?: Record<string, number | string | boolean>;
};

export type AuditoriaHallazgoCentral = {
  creadoPor?: string;
  actualizadoPor?: string;
  dispositivoId?: string;
  versionApp?: string;
  userAgent?: string;
  ipRegistro?: string;
  hashLocal?: string;
};

export type HallazgoCentral = {
  // Identificacion y origen del dato.
  id?: string;
  codigo: string;
  codigoInforme?: string;
  origen: OrigenHallazgoCentral;
  estadoSincronizacion?: EstadoSincronizacionCentral;

  // Contexto operacional.
  empresa: string;
  obra: string;
  proyecto?: string;
  area: string;
  siglaEmpresa?: string;
  siglaProyecto?: string;

  // Reportante/supervisor que detecta el hallazgo.
  reportante: ReportanteHallazgoCentral;

  // Registro del hallazgo.
  fechaReporte: string;
  horaReporte?: string;
  fechaHoraReporteISO?: string;
  descripcion: string;
  tipoHallazgo: TipoHallazgoCentral;

  // Evaluacion y priorizacion preventiva.
  criticidad: CriticidadHallazgoCentral;
  prioridad?: PrioridadHallazgoCentral;
  puntajeEvaluacion?: number;
  respuestasEvaluacion?: Record<string, string>;
  accionInmediata?: string;
  recomendacion?: string;

  // Estado operativo para panel, seguimiento y reporterias.
  estado: EstadoHallazgoCentral;
  estadoCierre?: EstadoCierreCentral;

  // Evidencias, mapa GPS y trazabilidad territorial.
  evidencias?: EvidenciaHallazgoCentral[];
  geolocalizacion?: GeolocalizacionHallazgoCentral;
  mapaGps?: {
    latitud?: number;
    longitud?: number;
    precisionGps?: number;
    zona?: string;
    sector?: string;
    visibleEnMapa?: boolean;
  };

  // Seguimiento de cierre y responsable real de correccion.
  seguimientoCierre?: SeguimientoCierreCentral;

  // Insumos para Radar Preventivo y analitica posterior.
  radarPreventivo?: RadarPreventivoCentral;

  // Auditoria, bitacora y sincronizacion.
  bitacora?: BitacoraHallazgoCentral[];
  auditoria?: AuditoriaHallazgoCentral;
  rawMobileV2?: Record<string, unknown>;
  rawPanel?: Record<string, unknown>;
  fechaCreacion?: string;
  fechaActualizacion?: string;
  fechaSincronizacion?: string;
  createdAt?: string;
  updatedAt?: string;
  syncedAt?: string;
};
