import { evaluarReporteConMotorV2Seguro } from "./adaptadorMotorV2";
import {
  construirPreguntasRiesgoInteligenteV3,
  seleccionarRiesgoInteligenteV3,
  textoPreventivoVisible,
  tituloRiesgoPreventivoVisible,
  type SeleccionRiesgoInteligenteV3,
} from "./selectorRiesgoInteligenteV3";

type CasoSelectorInteligenteV3 = {
  id: string;
  descripcion: string;
  riesgoEspecifico: string;
  terminosEsperados: string[];
};

const CASOS_ESPECIFICOS: CasoSelectorInteligenteV3[] = [
  {
    id: "altura",
    descripcion: "Trabajador realiza tarea a 3 metros sin arnés ni línea de vida.",
    riesgoEspecifico: "trabajador sin arnés",
    terminosEsperados: ["caída de distinto nivel", "protección contra caídas"],
  },
  {
    id: "electricidad",
    descripcion: "Intervención de tablero energizado sin bloqueo LOTO aplicado.",
    riesgoEspecifico: "sin bloqueo LOTO",
    terminosEsperados: ["energía", "bloqueo/LOTO"],
  },
  {
    id: "derrame",
    descripcion: "Derrame de combustible alcanza suelo natural sin contención.",
    riesgoEspecifico: "derrame de combustible",
    terminosEsperados: ["fuga", "contención"],
  },
  {
    id: "vidrio",
    descripcion: "Vidrio quebrado con borde cortante expuesto a trabajadores.",
    riesgoEspecifico: "vidrio quebrado",
    terminosEsperados: ["borde cortante", "guantes anticorte"],
  },
  {
    id: "ruido",
    descripcion: "Equipo genera ruido continuo y trabajadores sin protección auditiva.",
    riesgoEspecifico: "exposición a ruido",
    terminosEsperados: ["ruido", "protección auditiva"],
  },
  {
    id: "excavacion",
    descripcion: "Trabajador permanece dentro de zanja profunda sin entibación ni talud seguro.",
    riesgoEspecifico: "zanja sin entibación",
    terminosEsperados: ["entibación", "evidencia"],
  },
];

const normalizar = (valor: unknown) =>
  String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const flujoDesdeSeleccion = (seleccion: SeleccionRiesgoInteligenteV3, familiaPrincipal: string) => {
  const riesgo = seleccion.riesgo;
  if (!riesgo) return undefined;
  return {
    modo: "preventivo" as const,
    familiaPrincipal,
    confianzaRiesgo: seleccion.confianza,
    riesgoDetectadoId: riesgo.id,
    riesgoDetectadoTitulo: tituloRiesgoPreventivoVisible(riesgo),
    criticidadOrientativaRiesgo: riesgo.criticidadOrientativa,
    consecuenciaProbableRiesgo: textoPreventivoVisible(riesgo.consecuenciaProbable),
    controlCriticoEsperado: textoPreventivoVisible(riesgo.controlFaltanteOFallido),
    accionInmediataSugerida: textoPreventivoVisible(riesgo.accionInmediataSugerida),
  };
};

const respuestasCriticas = (seleccion: SeleccionRiesgoInteligenteV3) => {
  const respuestas: Record<string, string> = {};
  for (const pregunta of construirPreguntasRiesgoInteligenteV3(seleccion)) {
    if (pregunta.id.endsWith("_especifica_1")) respuestas[pregunta.id] = "exposicion_confirmada";
    else if (pregunta.id.endsWith("_especifica_2") || pregunta.id.endsWith("_control")) {
      respuestas[pregunta.id] = "no_deficiente_ausente";
    } else if (pregunta.id.endsWith("_accion")) respuestas[pregunta.id] = "continua_sin_control";
    else respuestas[pregunta.id] = "evidencia_pendiente";
  }
  return respuestas;
};

export const evaluarBancoRiesgoInteligenteV3 = () => {
  const errores: string[] = [];
  const textosPreguntas = new Set<string>();

  for (const caso of CASOS_ESPECIFICOS) {
    const seleccion = seleccionarRiesgoInteligenteV3(caso);
    const preguntas = construirPreguntasRiesgoInteligenteV3(seleccion);
    if (!seleccion.riesgo || seleccion.confianza === "baja") {
      errores.push(`${caso.id}: no se identificó un riesgo específico confiable.`);
      continue;
    }
    if (preguntas.length !== 5) errores.push(`${caso.id}: se esperaban 5 preguntas y se obtuvieron ${preguntas.length}.`);
    const texto = normalizar(
      preguntas
        .map((pregunta) => [pregunta.texto, pregunta.objetivo, ...(pregunta.opciones || []).map((opcion) => opcion.label)].join(" "))
        .join(" "),
    );
    for (const termino of caso.terminosEsperados) {
      if (!texto.includes(normalizar(termino))) errores.push(`${caso.id}: falta el término específico "${termino}".`);
    }
    preguntas.slice(0, 3).forEach((pregunta) => textosPreguntas.add(normalizar(pregunta.texto)));
  }

  if (textosPreguntas.size < 14) {
    errores.push(`Diversidad insuficiente: solo ${textosPreguntas.size} preguntas específicas distintas.`);
  }

  const simplesSinRiesgo = [
    ["Caja liviana junto al pasillo sin obstruir la salida.", "caja en pasillo"],
    ["Material menor en tránsito interior, sin bloqueo de evacuación.", "material menor"],
    ["Condición general en terreno que requiere revisión.", ""],
  ] as const;
  for (const [descripcion, riesgoEspecifico] of simplesSinRiesgo) {
    const seleccion = seleccionarRiesgoInteligenteV3({ descripcion, riesgoEspecifico });
    if (seleccion.riesgo || construirPreguntasRiesgoInteligenteV3(seleccion).length > 0) {
      errores.push(`Se forzó una precisión inexistente para: ${descripcion}`);
    }
  }

  const altura = seleccionarRiesgoInteligenteV3(CASOS_ESPECIFICOS[0]);
  const resultadoAltura = evaluarReporteConMotorV2Seguro({
    area: "Cubierta",
    descripcion: CASOS_ESPECIFICOS[0].descripcion,
    evaluacion: {
      respuestas: respuestasCriticas(altura),
      flujo_preventivo: flujoDesdeSeleccion(altura, "trabajos_criticos"),
    },
  });
  if (resultadoAltura.criticidadFinal !== "CRITICO") errores.push("Altura activa sin control no fue clasificada como crítica.");
  if (!resultadoAltura.requiereSuspension) errores.push("Altura activa sin control no exige suspensión.");
  if (!normalizar(resultadoAltura.medidaInmediata).includes("detener")) errores.push("La medida de altura no conserva la acción específica.");
  if (!normalizar(resultadoAltura.resumenEjecutivo).includes("riesgo especifico identificado")) {
    errores.push("El resultado final no informa el riesgo específico identificado.");
  }

  const derrame = seleccionarRiesgoInteligenteV3(CASOS_ESPECIFICOS[2]);
  const resultadoDerrame = evaluarReporteConMotorV2Seguro({
    area: "Patio de equipos",
    descripcion: CASOS_ESPECIFICOS[2].descripcion,
    evaluacion: {
      respuestas: respuestasCriticas(derrame),
      flujo_preventivo: flujoDesdeSeleccion(derrame, "ambiental_derrames"),
    },
  });
  if (resultadoDerrame.ambitoPrincipal !== "medio_ambiente") errores.push("El derrame no conserva el ámbito ambiental.");
  if (!resultadoDerrame.requiereContencionAmbiental) errores.push("El derrame al suelo no exige contención ambiental.");

  return {
    totalCasosEspecificos: CASOS_ESPECIFICOS.length,
    preguntasEspecificasDistintas: textosPreguntas.size,
    casosIncertidumbreSegura: simplesSinRiesgo.length,
    criticidadAltura: resultadoAltura.criticidadFinal,
    suspensionAltura: resultadoAltura.requiereSuspension,
    ambitoDerrame: resultadoDerrame.ambitoPrincipal,
    contencionDerrame: resultadoDerrame.requiereContencionAmbiental,
    correcto: errores.length === 0,
    errores,
  };
};
