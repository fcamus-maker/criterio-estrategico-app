import type {
  AmbitoEvaluacion,
  CategoriaHallazgoV2,
  ConfianzaClasificacionV2,
  Criticidad,
  ModuloPreguntasV2,
  NormativaAplicable,
  TipoEvento,
} from "./types";
import type { PreguntaUniversalId } from "./preguntasUniversalesHallazgosV1";
import { VERSION_MATRIZ_UNIVERSAL_V1 } from "./preguntasUniversalesHallazgosV1";

export type RespuestaUniversalV1 = {
  preguntaId: PreguntaUniversalId;
  opcionIds?: string[];
  texto?: string;
  respondida: boolean;
};

export type VectorUniversalHallazgoV1 = {
  hallazgo: string;
  actividad: string;
  ambitos: string[];
  naturaleza: string;
  fuente: string;
  expuestos: string[];
  mecanismos: string[];
  afectacionActual: string;
  consecuencia: string;
  probabilidad: string;
  estadoControl: string;
  estadoOperativo: string;
};

export type ContradiccionMatrizUniversalV1 = {
  id: string;
  mensaje: string;
  preguntaIds: PreguntaUniversalId[];
};

export type ResultadoMatrizUniversalV1 = {
  version: typeof VERSION_MATRIZ_UNIVERSAL_V1;
  ambitoPrincipal: AmbitoEvaluacion;
  ambitosSecundarios: AmbitoEvaluacion[];
  tipoHallazgo: TipoEvento;
  familiaPreventiva: CategoriaHallazgoV2;
  moduloPreguntasSugerido: ModuloPreguntasV2;
  criticidad: Criticidad;
  criticidadVisible: "BAJO" | "MEDIO" | "ALTO" | "CRÍTICO";
  prioridad: string;
  confianza: ConfianzaClasificacionV2;
  etiquetaConfianza: string;
  exposicion: string;
  consecuencia: string;
  controlFaltante: string;
  accionInmediata: string;
  requiereDetencionOAislamiento: boolean;
  normativaProbable: NormativaAplicable[];
  documentacionAplicable: string[];
  evidenciaRecomendada: string[];
  recomendacionTecnica: string;
  resumenEjecutivo: string;
  requiereRevisionTecnica: boolean;
  contradicciones: ContradiccionMatrizUniversalV1[];
};

export type EstadoMatrizUniversalV1 = {
  version: typeof VERSION_MATRIZ_UNIVERSAL_V1;
  activa: true;
  preguntaActual: number;
  totalPreguntas: 12;
  completa: boolean;
  respuestas: Record<string, RespuestaUniversalV1>;
  resultadoClasificacion?: ResultadoMatrizUniversalV1;
};

export const ESTADO_MATRIZ_UNIVERSAL_INICIAL_V1: EstadoMatrizUniversalV1 = {
  version: VERSION_MATRIZ_UNIVERSAL_V1,
  activa: true,
  preguntaActual: 0,
  totalPreguntas: 12,
  completa: false,
  respuestas: {},
};
