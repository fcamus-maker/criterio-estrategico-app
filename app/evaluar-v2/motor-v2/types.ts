export type Criticidad = "BAJO" | "MEDIO" | "ALTO" | "CRITICO";

export type AmbitoEvaluacion =
  | "seguridad_laboral"
  | "salud_ocupacional"
  | "medio_ambiente"
  | "legal_documental"
  | "emergencia"
  | "mixto";

export type TipoEvento =
  | "condicion_subestandar"
  | "acto_inseguro"
  | "incidente"
  | "casi_accidente"
  | "aspecto_ambiental"
  | "impacto_ambiental"
  | "desviacion_legal_documental"
  | "emergencia"
  | "otro";

export type ExposicionPersonas = "sin_exposicion" | "potencial" | "directa";
export type ExposicionAmbiental = "sin_exposicion" | "potencial" | "directa";
export type Consecuencia = "leve" | "moderada" | "grave" | "fatal";
export type Probabilidad = "baja" | "media" | "alta";
export type ControlesExistentes = "suficientes" | "parciales" | "inexistentes";

export type NivelConfianzaNormativa =
  | "validado"
  | "pendiente_validacion"
  | "no_mostrar_usuario_final";

export type RespuestaEvaluacionV2 =
  | string
  | number
  | boolean
  | string[]
  | null
  | undefined
  | Record<string, unknown>;

export type DatosAmbientales = {
  existeAspectoAmbiental?: boolean;
  existeImpactoAmbiental?: boolean;
  riesgoImpactoAmbiental?: "bajo" | "medio" | "alto" | boolean;
  afectaSuelo?: boolean;
  afectaAgua?: boolean;
  afectaAire?: boolean;
  afectaFloraFauna?: boolean;
  afectaComunidad?: boolean;
  derrameOFuga?: boolean;
  sustanciaPeligrosa?: boolean;
  residuoPeligroso?: boolean;
  contenido?: boolean;
  requiereContencion?: boolean;
  requiereNotificacion?: boolean;
  permisoRCAAsociado?: boolean;
};

export type DatosLegales = {
  documentoFaltante?: boolean;
  permisoFaltante?: boolean;
  procedimientoFaltante?: boolean;
  matrizFaltante?: boolean;
  astPtpPtsFaltante?: boolean;
  induccionFaltante?: boolean;
  faltaHabilitaActividadRiesgosa?: boolean;
  normaDeclarada?: string;
};

export type NormativaAplicable = {
  norma: string;
  materia: string;
  articulo?: string;
  fuente: string;
  nivelConfianza: NivelConfianzaNormativa;
  requiereValidacionLegal: boolean;
  aplicaCuando: string;
};

export type EvaluacionInputV2 = {
  tipoHallazgo: string;
  descripcion: string;
  area: string;
  actividad: string;
  respuestas: Record<string, RespuestaEvaluacionV2>;
  ambitoDeclarado?: AmbitoEvaluacion;
  exposicionPersonas?: ExposicionPersonas;
  exposicionAmbiental?: ExposicionAmbiental;
  consecuencia?: Consecuencia;
  probabilidad?: Probabilidad;
  controlesExistentes?: ControlesExistentes;
  requiereSuspensionDeclarada?: boolean;
  datosAmbientales?: DatosAmbientales;
  datosLegales?: DatosLegales;
  evidenciaDisponible?: boolean;
};

export type EvaluacionResultadoV2 = {
  ambitoPrincipal: AmbitoEvaluacion;
  ambitosSecundarios: AmbitoEvaluacion[];
  tipoEvento: TipoEvento;
  criticidadBase: Criticidad;
  criticidadFinal: Criticidad;
  senalesCriticas: string[];
  factoresElevadores: string[];
  factoresLimitantes: string[];
  inconsistencias: string[];
  requiereRevisionManual: boolean;
  medidaInmediata: string;
  plazoSugerido: string;
  requiereSuspension: boolean;
  requiereContencionAmbiental: boolean;
  normativaProbable: NormativaAplicable[];
  justificacionTecnica: string;
  resumenEjecutivo: string;
};

export type CasoPruebaMotorV2 = {
  nombre: string;
  input: EvaluacionInputV2;
  criticidadEsperada: Criticidad | Criticidad[];
  observacionEsperada: string;
};

export type ResultadoCasoPruebaMotorV2 = {
  nombre: string;
  criticidadEsperada: Criticidad | Criticidad[];
  criticidadObtenida: Criticidad;
  aprobado: boolean;
  observacion: string;
};

