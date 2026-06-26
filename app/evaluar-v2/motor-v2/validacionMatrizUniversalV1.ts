import {
  obtenerPreguntaUniversalHallazgoV1,
  obtenerPreguntasUniversalesHallazgosV1,
  type PreguntaUniversalHallazgoV1,
  type PreguntaUniversalId,
} from "./preguntasUniversalesHallazgosV1";
import type {
  ContradiccionMatrizUniversalV1,
  RespuestaUniversalV1,
  VectorUniversalHallazgoV1,
} from "./esquemasRespuestasUniversalesV1";

export function contarPalabrasMatrizUniversalV1(texto?: string) {
  return String(texto || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function opcionesValidas(pregunta: PreguntaUniversalHallazgoV1) {
  return new Set((pregunta.opciones || []).map((opcion) => opcion.id));
}

function respuestaTextoValida(
  pregunta: PreguntaUniversalHallazgoV1,
  respuesta?: RespuestaUniversalV1
) {
  const texto = respuesta?.texto?.trim() || "";
  if (!texto) return false;
  if (pregunta.maxPalabras && contarPalabrasMatrizUniversalV1(texto) > pregunta.maxPalabras) {
    return false;
  }
  return true;
}

export function respuestaUniversalValidaV1(
  pregunta: PreguntaUniversalHallazgoV1,
  respuesta?: RespuestaUniversalV1
) {
  if (!respuesta || respuesta.preguntaId !== pregunta.id) return false;

  if (pregunta.tipo === "texto_breve") {
    return respuestaTextoValida(pregunta, respuesta);
  }

  const ids = Array.isArray(respuesta.opcionIds) ? respuesta.opcionIds : [];
  const validas = opcionesValidas(pregunta);
  const todasValidas = ids.length > 0 && ids.every((id) => validas.has(id));
  if (!todasValidas) return false;

  if (pregunta.tipo === "seleccion_unica" || pregunta.tipo === "seleccion_unica_descripcion") {
    return ids.length === 1;
  }

  if (pregunta.maxSeleccion && ids.length > pregunta.maxSeleccion) return false;
  return true;
}

export function seleccionarOpcionUniversalV1(
  pregunta: PreguntaUniversalHallazgoV1,
  respuestaActual: RespuestaUniversalV1 | undefined,
  opcionId: string
): RespuestaUniversalV1 {
  const opcion = pregunta.opciones?.find((item) => item.id === opcionId);
  if (!opcion) {
    return {
      preguntaId: pregunta.id,
      opcionIds: [],
      respondida: false,
    };
  }

  if (pregunta.tipo === "seleccion_unica" || pregunta.tipo === "seleccion_unica_descripcion") {
    const siguiente = {
      preguntaId: pregunta.id,
      opcionIds: [opcionId],
      texto: respuestaActual?.texto,
      respondida: true,
    };
    return siguiente;
  }

  const actuales = Array.isArray(respuestaActual?.opcionIds)
    ? respuestaActual?.opcionIds || []
    : [];

  if (opcion.exclusiva) {
    return {
      preguntaId: pregunta.id,
      opcionIds: [opcionId],
      texto: respuestaActual?.texto,
      respondida: true,
    };
  }

  const exclusivas = new Set(
    (pregunta.opciones || []).filter((item) => item.exclusiva).map((item) => item.id)
  );
  const sinExclusivas = actuales.filter((id) => !exclusivas.has(id));
  const existe = sinExclusivas.includes(opcionId);
  const combinadas = existe
    ? sinExclusivas.filter((id) => id !== opcionId)
    : [...sinExclusivas, opcionId];
  const limitadas = pregunta.maxSeleccion ? combinadas.slice(0, pregunta.maxSeleccion) : combinadas;

  return {
    preguntaId: pregunta.id,
    opcionIds: limitadas,
    texto: respuestaActual?.texto,
    respondida: limitadas.length > 0,
  };
}

export function actualizarTextoRespuestaUniversalV1(
  pregunta: PreguntaUniversalHallazgoV1,
  respuestaActual: RespuestaUniversalV1 | undefined,
  texto: string
): RespuestaUniversalV1 {
  const respuesta = {
    preguntaId: pregunta.id,
    opcionIds: respuestaActual?.opcionIds,
    texto,
    respondida: false,
  };

  return {
    ...respuesta,
    respondida: respuestaUniversalValidaV1(pregunta, respuesta),
  };
}

function primerOpcion(respuestas: Record<string, RespuestaUniversalV1>, id: PreguntaUniversalId) {
  return respuestas[id]?.opcionIds?.[0] || "";
}

function opciones(respuestas: Record<string, RespuestaUniversalV1>, id: PreguntaUniversalId) {
  return respuestas[id]?.opcionIds || [];
}

export function matrizUniversalCompletaV1(respuestas: Record<string, RespuestaUniversalV1>) {
  return obtenerPreguntasUniversalesHallazgosV1().every((pregunta) =>
    respuestaUniversalValidaV1(pregunta, respuestas[pregunta.id])
  );
}

export function construirVectorUniversalV1(
  respuestas: Record<string, RespuestaUniversalV1>
): VectorUniversalHallazgoV1 {
  return {
    hallazgo: respuestas.universal_hallazgo?.texto?.trim() || "",
    actividad: primerOpcion(respuestas, "universal_actividad"),
    ambitos: opciones(respuestas, "universal_ambito"),
    naturaleza: primerOpcion(respuestas, "universal_naturaleza"),
    fuente: primerOpcion(respuestas, "universal_fuente"),
    expuestos: opciones(respuestas, "universal_expuesto"),
    mecanismos: opciones(respuestas, "universal_mecanismo"),
    afectacionActual: primerOpcion(respuestas, "universal_afectacion"),
    consecuencia: primerOpcion(respuestas, "universal_consecuencia"),
    probabilidad: primerOpcion(respuestas, "universal_probabilidad"),
    estadoControl: primerOpcion(respuestas, "universal_control"),
    estadoOperativo: primerOpcion(respuestas, "universal_estado_operativo"),
  };
}

export function detectarContradiccionesMatrizUniversalV1(
  respuestas: Record<string, RespuestaUniversalV1>
): ContradiccionMatrizUniversalV1[] {
  const vector = construirVectorUniversalV1(respuestas);
  const contradicciones: ContradiccionMatrizUniversalV1[] = [];

  if (
    vector.afectacionActual === "AFEC_PERSONA" &&
    !vector.expuestos.some((id) =>
      ["EXP_TRABAJADOR", "EXP_TERCEROS", "EXP_PUBLICO"].includes(id)
    )
  ) {
    contradicciones.push({
      id: "persona_sin_expuesto",
      mensaje: "Hay afectación a persona, pero no se declaró exposición de personas.",
      preguntaIds: ["universal_expuesto", "universal_afectacion"],
    });
  }

  if (
    vector.afectacionActual === "AFEC_AMBIENTAL" &&
    !vector.ambitos.includes("AMB_MEDIO_AMBIENTE")
  ) {
    contradicciones.push({
      id: "ambiental_sin_ambito",
      mensaje: "Hay impacto ambiental, pero no se declaró ámbito Medio ambiente.",
      preguntaIds: ["universal_ambito", "universal_afectacion"],
    });
  }

  if (
    vector.estadoOperativo === "EST_CORREGIDA" &&
    vector.estadoControl === "CTRL_AUSENTE"
  ) {
    contradicciones.push({
      id: "corregida_sin_control",
      mensaje: "La condición figura corregida, pero el control se declaró ausente.",
      preguntaIds: ["universal_control", "universal_estado_operativo"],
    });
  }

  if (
    vector.consecuencia === "CON_GRAVE" &&
    vector.probabilidad === "PROB_ALTA" &&
    ["CTRL_AUSENTE", "CTRL_FALLIDO"].includes(vector.estadoControl) &&
    vector.estadoOperativo === "EST_CONTINUA_SIN_CONTROL"
  ) {
    contradicciones.push({
      id: "critico_activo_sin_control",
      mensaje:
        "El escenario grave, probable y sin control requiere revisar la acción inmediata antes de continuar.",
      preguntaIds: [
        "universal_consecuencia",
        "universal_probabilidad",
        "universal_control",
        "universal_estado_operativo",
      ],
    });
  }

  return contradicciones;
}

export function obtenerPreguntasContradictoriasV1(
  contradicciones: ContradiccionMatrizUniversalV1[]
) {
  return Array.from(new Set(contradicciones.flatMap((item) => item.preguntaIds)))
    .map((id) => obtenerPreguntaUniversalHallazgoV1(id))
    .filter(Boolean) as PreguntaUniversalHallazgoV1[];
}
