import type {
  AmbitoEvaluacion,
  CategoriaHallazgoV2,
  ConfianzaClasificacionV2,
  Criticidad,
  NormativaAplicable,
  TipoEvento,
} from "./types";
import {
  VERSION_MATRIZ_UNIVERSAL_V1,
  obtenerPreguntaUniversalHallazgoV1,
} from "./preguntasUniversalesHallazgosV1";
import type {
  ContradiccionMatrizUniversalV1,
  ResultadoMatrizUniversalV1,
  VectorUniversalHallazgoV1,
} from "./esquemasRespuestasUniversalesV1";

const CRITICIDAD_VISIBLE: Record<Criticidad, "BAJO" | "MEDIO" | "ALTO" | "CRÍTICO"> = {
  BAJO: "BAJO",
  MEDIO: "MEDIO",
  ALTO: "ALTO",
  CRITICO: "CRÍTICO",
};

function etiquetaOpcion(preguntaId: Parameters<typeof obtenerPreguntaUniversalHallazgoV1>[0], id: string) {
  return (
    obtenerPreguntaUniversalHallazgoV1(preguntaId)?.opciones?.find((opcion) => opcion.id === id)
      ?.label || id
  );
}

function etiquetaOpciones(
  preguntaId: Parameters<typeof obtenerPreguntaUniversalHallazgoV1>[0],
  ids: string[]
) {
  return ids.map((id) => etiquetaOpcion(preguntaId, id)).filter(Boolean);
}

function normativa(
  norma: string,
  materia: string,
  aplicaCuando: string
): NormativaAplicable {
  return {
    norma,
    materia,
    fuente: "Matriz Universal de Hallazgos",
    nivelConfianza: "pendiente_validacion",
    requiereValidacionLegal: true,
    aplicaCuando,
  };
}

function criticidadPorVep(vector: VectorUniversalHallazgoV1): Criticidad {
  const consecuencia = vector.consecuencia === "CON_GRAVE"
    ? 4
    : vector.consecuencia === "CON_RELEVANTE"
      ? 2
      : 1;
  const probabilidad = vector.probabilidad === "PROB_ALTA"
    ? 4
    : vector.probabilidad === "PROB_MEDIA"
      ? 2
      : 1;
  const vep = consecuencia * probabilidad;

  if (vep >= 16) return "CRITICO";
  if (vep >= 8) return "ALTO";
  if (vep >= 4) return "MEDIO";
  return "BAJO";
}

function confianzaClasificacion(
  vector: VectorUniversalHallazgoV1,
  contradicciones: ContradiccionMatrizUniversalV1[]
): ConfianzaClasificacionV2 {
  const noVerificables = [
    vector.actividad,
    vector.naturaleza,
    vector.fuente,
    vector.afectacionActual,
    vector.consecuencia,
    vector.probabilidad,
    vector.estadoControl,
    vector.estadoOperativo,
    ...vector.ambitos,
    ...vector.expuestos,
    ...vector.mecanismos,
  ].filter((valor) => valor.includes("NO_VERIFICABLE")).length;

  if (!vector.hallazgo || noVerificables >= 3 || contradicciones.length >= 2) return "baja";
  if (noVerificables === 2 || vector.ambitos.length > 1 || contradicciones.length === 1) return "media";
  return "alta";
}

function ambitoPrincipal(vector: VectorUniversalHallazgoV1): AmbitoEvaluacion {
  if (vector.ambitos.includes("AMB_MEDIO_AMBIENTE") || vector.naturaleza === "NAT_IMPACTO_AMBIENTAL") {
    return "medio_ambiente";
  }
  if (vector.ambitos.includes("AMB_SALUD") || vector.naturaleza === "NAT_EXPOSICION_SALUD") {
    return "salud_ocupacional";
  }
  if (vector.ambitos.includes("AMB_DOCUMENTAL") || vector.naturaleza === "NAT_INCUMPLIMIENTO_DOC") {
    return "legal_documental";
  }
  if (vector.ambitos.length > 1) return "mixto";
  return "seguridad_laboral";
}

function tipoEvento(vector: VectorUniversalHallazgoV1): TipoEvento {
  if (vector.naturaleza === "NAT_ACCION_INSEGURA") return "acto_inseguro";
  if (vector.naturaleza === "NAT_INCIDENTE_CASI") return "casi_accidente";
  if (vector.naturaleza === "NAT_IMPACTO_AMBIENTAL") return "aspecto_ambiental";
  if (vector.naturaleza === "NAT_INCUMPLIMIENTO_DOC") return "desviacion_legal_documental";
  if (vector.afectacionActual === "AFEC_PERSONA") return "incidente";
  return "condicion_subestandar";
}

function familiaPreventiva(vector: VectorUniversalHallazgoV1): CategoriaHallazgoV2 {
  const texto = `${vector.hallazgo} ${vector.mecanismos.join(" ")} ${vector.naturaleza}`.toLowerCase();
  if (texto.includes("arnés") || texto.includes("arnes") || texto.includes("altura") || vector.mecanismos.includes("MEC_CAIDA")) {
    return "caida_altura";
  }
  if (vector.mecanismos.includes("MEC_ENERGIA")) return "electrico";
  if (vector.mecanismos.includes("MEC_DERRAME") || vector.naturaleza === "NAT_IMPACTO_AMBIENTAL") {
    return "derrame_fuga";
  }
  if (vector.mecanismos.includes("MEC_INCENDIO")) return "incendio_emergencia";
  if (vector.naturaleza === "NAT_INCUMPLIMIENTO_DOC") return "legal_documental";
  if (vector.naturaleza === "NAT_EXPOSICION_SALUD") return "salud_ocupacional_ruido_polvo_quimicos";
  if (vector.fuente === "FUENTE_EQUIPO") return "maquinaria_equipos";
  if (vector.fuente === "FUENTE_DOCUMENTO") return "legal_documental";
  if (vector.ambitos.includes("AMB_CALIDAD")) return "aspectos_ambientales";
  return "condiciones_subestandar";
}

function controlFaltante(vector: VectorUniversalHallazgoV1) {
  if (vector.estadoControl === "CTRL_AUSENTE") return "Control preventivo ausente.";
  if (vector.estadoControl === "CTRL_FALLIDO") return "Control preventivo fallido, retirado o vulnerado.";
  if (vector.estadoControl === "CTRL_PARCIAL") return "Control preventivo parcial o incompleto.";
  if (vector.estadoControl === "CTRL_EXISTE_NO_VERIFICADO") return "Control existente sin verificación suficiente.";
  if (vector.estadoControl === "CTRL_NO_APLICA") return "No aplica control específico según respuesta declarada.";
  if (vector.estadoControl === "CTRL_NO_VERIFICABLE") return "Control no verificable con los antecedentes disponibles.";
  return "Control efectivo y verificado.";
}

function accionInmediata(vector: VectorUniversalHallazgoV1, criticidad: Criticidad) {
  if (
    criticidad === "CRITICO" ||
    vector.estadoOperativo === "EST_CONTINUA_SIN_CONTROL" ||
    vector.estadoControl === "CTRL_FALLIDO"
  ) {
    return "Detener o aislar la condición, implementar control inmediato y verificar antes de continuar.";
  }
  if (vector.afectacionActual === "AFEC_AMBIENTAL") {
    return "Contener la fuente, evitar propagación y gestionar el residuo o impacto con evidencia de cierre.";
  }
  if (vector.naturaleza === "NAT_INCUMPLIMIENTO_DOC") {
    return "Regularizar el respaldo documental exigible y verificar autorización o vigencia antes de continuar si aplica.";
  }
  return "Controlar la condición observada, asignar responsable y registrar evidencia de cierre.";
}

export function clasificarMatrizUniversalV1(
  vector: VectorUniversalHallazgoV1,
  contradicciones: ContradiccionMatrizUniversalV1[] = []
): ResultadoMatrizUniversalV1 {
  const criticidad = criticidadPorVep(vector);
  const confianza = confianzaClasificacion(vector, contradicciones);
  const ambito = ambitoPrincipal(vector);
  const familia = confianza === "baja" ? "otro_indeterminado" : familiaPreventiva(vector);
  const expuestos = etiquetaOpciones("universal_expuesto", vector.expuestos);
  const mecanismos = etiquetaOpciones("universal_mecanismo", vector.mecanismos);
  const consecuencia = etiquetaOpcion("universal_consecuencia", vector.consecuencia);
  const probabilidad = etiquetaOpcion("universal_probabilidad", vector.probabilidad);
  const control = controlFaltante(vector);
  const accion = accionInmediata(vector, criticidad);
  const requiereDetencion =
    criticidad === "CRITICO" ||
    vector.estadoOperativo === "EST_CONTINUA_SIN_CONTROL" ||
    vector.estadoControl === "CTRL_FALLIDO";
  const evaluacionGeneral = confianza === "baja";
  const normativaProbable = evaluacionGeneral
    ? []
    : [
        normativa("Ley 16.744", "Gestión preventiva de seguridad y salud", "Hallazgos con exposición preventiva u operacional."),
        normativa("DS 44", "Gestión preventiva y control de riesgos", "Definición de controles, responsabilidades y verificación preventiva."),
        normativa("DS 594", "Condiciones sanitarias y ambientales básicas", "Condiciones que puedan afectar seguridad, salud o ambiente de trabajo."),
      ];

  return {
    version: VERSION_MATRIZ_UNIVERSAL_V1,
    ambitoPrincipal: ambito,
    ambitosSecundarios: ambito === "mixto" ? ["seguridad_laboral"] : [],
    tipoHallazgo: evaluacionGeneral ? "otro" : tipoEvento(vector),
    familiaPreventiva: familia,
    moduloPreguntasSugerido: familia,
    criticidad,
    criticidadVisible: CRITICIDAD_VISIBLE[criticidad],
    prioridad: criticidad === "CRITICO" ? "Urgente" : criticidad === "ALTO" ? "Alta" : criticidad === "MEDIO" ? "Media" : "Normal",
    confianza,
    etiquetaConfianza: confianza === "baja" ? "Evaluación preventiva general" : "Evaluación preventiva",
    exposicion: expuestos.join(" · ") || "No verificable",
    consecuencia: `${consecuencia || "No verificable"} · ${probabilidad || "No verificable"}`,
    controlFaltante: control,
    accionInmediata: accion,
    requiereDetencionOAislamiento: requiereDetencion,
    normativaProbable,
    documentacionAplicable: evaluacionGeneral
      ? []
      : requiereDetencion
        ? ["Matriz/IPER si corresponde", "Permiso, autorización o procedimiento aplicable si la actividad lo exige", "Registro de verificación de control"]
        : ["Evidencia de cierre preventivo", "Registro de responsable y plazo"],
    evidenciaRecomendada: [
      "Fotografía de condición corregida o control implementado",
      "Registro de responsable y fecha de cierre",
      ...(requiereDetencion ? ["Verificación de liberación segura antes de reanudar"] : []),
    ],
    recomendacionTecnica: evaluacionGeneral
      ? "La información requiere revisión técnica antes de confirmar la clasificación definitiva."
      : `Gestionar el hallazgo como ${CRITICIDAD_VISIBLE[criticidad].toLowerCase()} con foco en ${mecanismos.join(", ") || "control preventivo"}, control existente y evidencia de cierre.`,
    resumenEjecutivo: evaluacionGeneral
      ? "Evaluación preventiva general. La información requiere revisión técnica antes de confirmar la clasificación definitiva."
      : `Hallazgo declarado: ${vector.hallazgo}. Exposición: ${expuestos.join(", ") || "no verificable"}. Control: ${control} Acción recomendada: ${accion}`,
    requiereRevisionTecnica: evaluacionGeneral || contradicciones.length > 0,
    contradicciones,
  };
}

export function aplicarResultadoMatrizUniversalACompatibilidadV2(
  resultado: ResultadoMatrizUniversalV1
) {
  return {
    ambito_principal: resultado.ambitoPrincipal,
    ambitos_secundarios: resultado.ambitosSecundarios,
    tipo_evento: resultado.tipoHallazgo,
    criticidad_base: resultado.criticidad,
    criticidad_final: resultado.criticidad,
    criticidad: resultado.criticidadVisible,
    prioridad: resultado.prioridad,
    recomendacion: resultado.recomendacionTecnica,
    accionInmediata: resultado.accionInmediata,
    justificacion_tecnica: resultado.resumenEjecutivo,
    resumen_ejecutivo: resultado.resumenEjecutivo,
    medida_inmediata_v2: resultado.accionInmediata,
    requiere_suspension: resultado.requiereDetencionOAislamiento,
    requiere_contencion_ambiental: resultado.ambitoPrincipal === "medio_ambiente",
    requiere_revision_manual: resultado.requiereRevisionTecnica,
    normativa_probable: resultado.normativaProbable,
    categoria_detectada: resultado.familiaPreventiva,
    modulo_preguntas_sugerido: resultado.moduloPreguntasSugerido,
    confianza_clasificacion: resultado.confianza,
    fuente_evaluacion: "motor_v2" as const,
  };
}
