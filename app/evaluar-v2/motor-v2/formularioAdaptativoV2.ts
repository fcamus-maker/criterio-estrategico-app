import { obtenerPreguntasAdaptativasV2 } from "./preguntasAdaptativasV2";
import { clasificarHallazgoPorDescripcion } from "./routerHallazgoV2";
import type {
  AmbitoEvaluacion,
  CategoriaHallazgoV2,
  ClasificacionHallazgoV2,
  Criticidad,
  ModuloPreguntasV2,
  PreguntaSugeridaMotorV2,
  TipoEvento,
} from "./types";

export type OpcionPreguntaAdaptativaV2 = {
  label: string;
  value: string;
  score?: number;
};

export type PreguntaFormularioAdaptativaV2 = PreguntaSugeridaMotorV2 & {
  paso: 1 | 2;
  tipoRespuesta: "opciones" | "texto";
  opciones: OpcionPreguntaAdaptativaV2[];
};

export type ReporteFormularioAdaptativoV2 = {
  descripcion?: string;
  area?: string;
  actividad?: string;
  tipoHallazgo?: string;
  evaluacion?: {
    respuestas?: Record<string, string>;
  };
};

export type ConfiguracionFormularioAdaptativoV2 = {
  clasificacion: ClasificacionHallazgoV2;
  preguntas: PreguntaFormularioAdaptativaV2[];
};

const OPCIONES_SI_NO: OpcionPreguntaAdaptativaV2[] = [
  { label: "Si", value: "si", score: 6 },
  { label: "Parcial", value: "parcial", score: 3 },
  { label: "No", value: "no", score: 0 },
  { label: "No aplica", value: "no_aplica", score: 0 },
];

const OPCIONES_CRITICAS: OpcionPreguntaAdaptativaV2[] = [
  { label: "Si, activo", value: "si", score: 12 },
  { label: "Potencial", value: "parcial", score: 6 },
  { label: "No", value: "no", score: 0 },
  { label: "No aplica", value: "no_aplica", score: 0 },
];

const OPCIONES_CONTROL: OpcionPreguntaAdaptativaV2[] = [
  { label: "Control suficiente", value: "si", score: 0 },
  { label: "Control parcial", value: "parcial", score: 5 },
  { label: "Sin control", value: "no", score: 10 },
  { label: "No aplica", value: "no_aplica", score: 0 },
];

const OPCIONES_TEXTO: OpcionPreguntaAdaptativaV2[] = [];

const CLASIFICACION_FALLBACK: ClasificacionHallazgoV2 = {
  categoriaDetectada: "otro_indeterminado",
  ambitoSugerido: "seguridad_laboral",
  ambitosSecundariosSugeridos: [],
  tipoEventoSugerido: "otro",
  moduloPreguntasSugerido: "otro_indeterminado",
  confianza: "baja",
  palabrasClaveDetectadas: [],
  criticidadBaseSugerida: "MEDIO",
  topeCriticidadSugerido: "ALTO",
  senalesElevanCriticidad: [],
  senalesPermitenCritico: [],
  normativaProbableSugerida: [],
  requiereRevisionManual: true,
  requierePreguntasAmbientales: false,
  requierePreguntasLegales: false,
  requierePreguntasSeguridad: true,
  requierePreguntasSalud: false,
  advertencias: ["Formulario adaptativo cargado con fallback seguro."],
  justificacionModuloPreguntas:
    "Modulo general por fallback seguro de preguntas adaptativas.",
};

const PREGUNTAS_FALLBACK: PreguntaSugeridaMotorV2[] = [
  {
    id: "fallback-001",
    modulo: "otro_indeterminado",
    texto: "Hay personas expuestas actualmente?",
    objetivo: "Mantener operativo el flujo aunque falle la clasificacion adaptativa.",
  },
  {
    id: "fallback-002",
    modulo: "otro_indeterminado",
    texto: "Existe afectacion o riesgo ambiental?",
    objetivo: "Descartar impacto ambiental con una pregunta general.",
  },
  {
    id: "fallback-003",
    modulo: "otro_indeterminado",
    texto: "Existe falta documental que habilite una actividad riesgosa?",
    objetivo: "Separar brecha documental de riesgo activo.",
  },
  {
    id: "fallback-004",
    modulo: "otro_indeterminado",
    texto: "Existen controles suficientes?",
    objetivo: "Evaluar barreras disponibles antes del resultado.",
  },
];

function textoNormalizado(valor: unknown) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function esPreguntaTexto(pregunta: PreguntaSugeridaMotorV2) {
  const texto = textoNormalizado(pregunta?.texto);
  return texto.startsWith("que ") || texto.startsWith("cual ");
}

function opcionesParaPregunta(pregunta: PreguntaSugeridaMotorV2) {
  const texto = textoNormalizado(
    `${pregunta?.id || ""} ${pregunta?.texto || ""} ${pregunta?.objetivo || ""}`
  );
  if (esPreguntaTexto(pregunta)) return OPCIONES_TEXTO;
  if (texto.includes("control") || texto.includes("contenido") || texto.includes("senalizacion")) {
    return OPCIONES_CONTROL;
  }
  if (
    texto.includes("energizado") ||
    texto.includes("expuesto") ||
    texto.includes("suspender") ||
    texto.includes("detener") ||
    texto.includes("llego a suelo") ||
    texto.includes("alcantarillado") ||
    texto.includes("via de evacuacion") ||
    texto.includes("salida de emergencia")
  ) {
    return OPCIONES_CRITICAS;
  }
  return OPCIONES_SI_NO;
}

function pasoParaPregunta(index: number, total: number) {
  const corte = Math.ceil(total / 2);
  return index < corte ? 1 : 2;
}

function normalizarModulo(valor: unknown): ModuloPreguntasV2 {
  return String(valor || "") as ModuloPreguntasV2;
}

function normalizarPreguntaFallback(
  pregunta: Partial<PreguntaSugeridaMotorV2> | undefined,
  index: number
): PreguntaSugeridaMotorV2 {
  return {
    id: String(pregunta?.id || `fallback-${String(index + 1).padStart(3, "0")}`),
    modulo: normalizarModulo(pregunta?.modulo || "otro_indeterminado"),
    texto: String(pregunta?.texto || "Hay personas expuestas actualmente?"),
    objetivo: String(pregunta?.objetivo || "Mantener operativo el flujo de evaluacion."),
  };
}

function fallbackFormularioAdaptativo(): ConfiguracionFormularioAdaptativoV2 {
  const total = PREGUNTAS_FALLBACK.length;
  const preguntas = PREGUNTAS_FALLBACK.map(
    (pregunta, index): PreguntaFormularioAdaptativaV2 => ({
      ...pregunta,
      paso: pasoParaPregunta(index, total),
      tipoRespuesta: "opciones",
      opciones: opcionesParaPregunta(pregunta),
    })
  );

  return {
    clasificacion: CLASIFICACION_FALLBACK,
    preguntas,
  };
}

function normalizarClasificacion(
  clasificacion: ClasificacionHallazgoV2 | undefined
): ClasificacionHallazgoV2 {
  return {
    ...CLASIFICACION_FALLBACK,
    ...(clasificacion || {}),
    categoriaDetectada: (clasificacion?.categoriaDetectada ||
      CLASIFICACION_FALLBACK.categoriaDetectada) as CategoriaHallazgoV2,
    ambitoSugerido: (clasificacion?.ambitoSugerido ||
      CLASIFICACION_FALLBACK.ambitoSugerido) as AmbitoEvaluacion,
    tipoEventoSugerido: (clasificacion?.tipoEventoSugerido ||
      CLASIFICACION_FALLBACK.tipoEventoSugerido) as TipoEvento,
    moduloPreguntasSugerido: normalizarModulo(
      clasificacion?.moduloPreguntasSugerido ||
        CLASIFICACION_FALLBACK.moduloPreguntasSugerido
    ),
    criticidadBaseSugerida: (clasificacion?.criticidadBaseSugerida ||
      CLASIFICACION_FALLBACK.criticidadBaseSugerida) as Criticidad,
    topeCriticidadSugerido: (clasificacion?.topeCriticidadSugerido ||
      CLASIFICACION_FALLBACK.topeCriticidadSugerido) as Criticidad,
    ambitosSecundariosSugeridos: Array.isArray(
      clasificacion?.ambitosSecundariosSugeridos
    )
      ? clasificacion.ambitosSecundariosSugeridos
      : [],
    palabrasClaveDetectadas: Array.isArray(clasificacion?.palabrasClaveDetectadas)
      ? clasificacion.palabrasClaveDetectadas
      : [],
    senalesElevanCriticidad: Array.isArray(clasificacion?.senalesElevanCriticidad)
      ? clasificacion.senalesElevanCriticidad
      : [],
    senalesPermitenCritico: Array.isArray(clasificacion?.senalesPermitenCritico)
      ? clasificacion.senalesPermitenCritico
      : [],
    normativaProbableSugerida: Array.isArray(
      clasificacion?.normativaProbableSugerida
    )
      ? clasificacion.normativaProbableSugerida
      : [],
    advertencias: Array.isArray(clasificacion?.advertencias)
      ? clasificacion.advertencias
      : [],
  };
}

export function obtenerFormularioAdaptativoV2(
  reporte: ReporteFormularioAdaptativoV2
): ConfiguracionFormularioAdaptativoV2 {
  try {
    const clasificacion = normalizarClasificacion(
      clasificarHallazgoPorDescripcion({
        descripcion: reporte?.descripcion || "",
        tipoHallazgo: reporte?.tipoHallazgo || "Reporte movil V2",
        area: reporte?.area || "",
        actividad: reporte?.actividad || reporte?.area || "",
        respuestas: reporte?.evaluacion?.respuestas || {},
      })
    );
    const preguntasBase = obtenerPreguntasAdaptativasV2(
      clasificacion.moduloPreguntasSugerido,
      clasificacion.confianza
    );

    if (!Array.isArray(preguntasBase) || preguntasBase.length === 0) {
      return fallbackFormularioAdaptativo();
    }

    const total = preguntasBase.length;
    const preguntas = preguntasBase.map((pregunta, index): PreguntaFormularioAdaptativaV2 => {
      const preguntaSegura = normalizarPreguntaFallback(pregunta, index);
      const opciones = opcionesParaPregunta(preguntaSegura);

      return {
        ...preguntaSegura,
        paso: pasoParaPregunta(index, total),
        tipoRespuesta: opciones.length > 0 ? "opciones" : "texto",
        opciones,
      };
    });

    return {
      clasificacion,
      preguntas,
    };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[motor-v2] fallback preguntas adaptativas", error);
    }

    return fallbackFormularioAdaptativo();
  }
}

export function puntajeRespuestasAdaptativasV2(
  preguntas: PreguntaFormularioAdaptativaV2[],
  respuestas: Record<string, string>
) {
  if (!Array.isArray(preguntas)) return 0;

  return preguntas.reduce((total, pregunta) => {
    const respuesta = respuestas[pregunta.id];
    if (!respuesta) return total;
    const opciones = Array.isArray(pregunta.opciones) ? pregunta.opciones : [];
    const opcion = opciones.find((item) => item.value === respuesta);
    if (opcion) return total + (opcion.score || 0);
    return total;
  }, 0);
}
