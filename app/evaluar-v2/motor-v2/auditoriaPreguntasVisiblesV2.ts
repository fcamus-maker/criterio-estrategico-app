import {
  clasificarContextoPreventivo,
  obtenerPreguntasPaso1Preventivo,
  obtenerPreguntasPaso2Preventivo,
  type ReporteOrquestadorPreguntasPreventivasV2,
} from "./orquestadorPreguntasPreventivasV2";
import {
  familiasSinPlantillaProductiva,
  obtenerPreguntasPlantillaOrdenadas,
  obtenerPlantillaRondaProductiva,
} from "./plantillasRondaProductivaV2";

export type OpcionVisibleAuditoriaV2 = {
  label?: string;
  texto?: string;
  value?: string;
};

export type PreguntaVisibleAuditoriaV2 = {
  id?: string;
  texto?: string;
  objetivo?: string;
  ayuda?: string;
  tipoRespuesta?: string;
  opciones?: OpcionVisibleAuditoriaV2[];
  paso?: number;
};

export type CasoAuditoriaPreguntasVisiblesV2 = {
  id: string;
  descripcionHallazgo: string;
  riesgoEspecificoDetectado?: string;
  tipo: "simple" | "critico" | "documental" | "ambiental" | "salud" | "ambiguo";
};

export type IntencionPreguntaVisibleV2 =
  | "existencia_verificacion"
  | "decision_operacional"
  | "estado_control"
  | "exposicion"
  | "documental"
  | "accion_inmediata"
  | "evidencia"
  | "ambito"
  | "acto_condicion"
  | "consecuencia"
  | "texto_breve"
  | "general";

export type TipoOpcionesVisibleV2 =
  | "existencia_verificacion"
  | "decision_operacional"
  | "estado_control"
  | "exposicion"
  | "documental"
  | "accion_inmediata"
  | "evidencia"
  | "ambito"
  | "acto_condicion"
  | "consecuencia"
  | "criticidad"
  | "si_no"
  | "texto"
  | "desconocido";

export type ResultadoAuditoriaPreguntaVisibleV2 = {
  idPregunta: string;
  texto: string;
  intencion: IntencionPreguntaVisibleV2;
  tipoOpciones: TipoOpcionesVisibleV2;
  coherente: boolean;
  errores: string[];
  textosInternosVisibles: string[];
  idsTecnicosVisibles: string[];
  calidadPreventiva: "verde" | "amarillo" | "rojo";
  opcionesAmbiguas: string[];
  preguntaExistenciaConOpcionesControl: boolean;
  preguntaDecisionConOpcionesControl: boolean;
  preguntaDocumentalConOpcionesIncorrectas: boolean;
};

export type FilaAuditoriaPreguntasV2 = {
  idCaso: string;
  tipoCaso: CasoAuditoriaPreguntasVisiblesV2["tipo"];
  paso: number;
  ronda: "Ronda 1" | "Ronda 2";
  idPregunta: string;
  texto: string;
  ayuda: string;
  opciones: string[];
  fuente: "selector_preventivo";
  familia: string;
  slot: string;
  esquema: string;
  intencion: IntencionPreguntaVisibleV2;
  tipoOpciones: TipoOpcionesVisibleV2;
  coherente: boolean;
  errores: string[];
  calidadPreventiva: "verde" | "amarillo" | "rojo";
  motivo: string;
  correccion: string;
};

export type ResultadoAuditoriaPreguntasVisiblesV2 = {
  totalCasos: number;
  correctos: number;
  erroresMenores: number;
  erroresCriticos: number;
  porcentajeCumplimiento: number;
  preguntasAuditadas: number;
  preguntasRonda1Auditadas: number;
  preguntasRonda2Auditadas: number;
  casosConRonda1Correcta: number;
  casosConRonda2Correcta: number;
  casosCriticosConRondaProductivaCompleta: number;
  casosConPaso1ContextoExacto: number;
  casosConPaso2ProductivoCorrecto: number;
  paso1ConPreguntasProductivas: number;
  paso1ConPreguntasDocumentales: number;
  paso1ConPreguntasDecision: number;
  paso1ConPreguntasControl: number;
  paso2Insuficiente: number;
  banderaPerdida: number;
  preguntasAmbitoConSiNo: number;
  familiasSinPlantilla: number;
  preguntasFueraDeRonda: number;
  preguntasProhibidas: number;
  opcionesInferidasPorTexto: number;
  mezclaFamilias: number;
  mezclaFallback: number;
  contextoDesactualizado: number;
  ronda2NoInvalidada: number;
  resultadoConRespuestasIncompletas: number;
  subdocumentacionCritica: number;
  normativaInventada: number;
  preguntasVerdes: number;
  preguntasAmarillas: number;
  preguntasRojas: number;
  preguntasProhibidasDetectadas: number;
  preguntasCorregidas: number;
  preguntasIncoherentes: number;
  opcionesIncompatibles: number;
  opcionesAmbiguas: number;
  mezclaIntencionOpciones: number;
  preguntasExistenciaConOpcionesControl: number;
  preguntasDecisionConOpcionesControl: number;
  preguntasDocumentalesConOpcionesIncorrectas: number;
  textosInternosVisibles: number;
  idsTecnicosVisibles: number;
  informesTipoLog: number;
  normativaDebilEnCriticos: number;
  sobredocumentacionSimple: number;
  casosSinTablaVisible: number;
  fallidos: Array<{
    idCaso: string;
    severidad: "menor" | "critico";
    errores: string[];
  }>;
  patronesFalla: Record<string, number>;
  tabla: FilaAuditoriaPreguntasV2[];
};

const ID_RIESGO_ESPECIFICO = "transversal_anclaje_riesgo_especifico";
const ID_AMBITO_PRINCIPAL = "contexto_ambito_principal";
const ID_ACTIVIDAD_TAREA = "contexto_actividad_tarea";
const ID_CONDICION_ACCION = "contexto_condicion_accion";
const ID_AFECTACION_ACTUAL = "contexto_afectacion_actual";

const normalizar = (valor?: unknown): string => {
  if (Array.isArray(valor)) return valor.map(normalizar).join(" ");
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
};

const textoPregunta = (pregunta: PreguntaVisibleAuditoriaV2) =>
  String(pregunta.texto || "");

const textosOpciones = (opciones?: OpcionVisibleAuditoriaV2[]) =>
  Array.isArray(opciones)
    ? opciones.map((opcion) => String(opcion.label || opcion.texto || opcion.value || "")).filter(Boolean)
    : [];

const contiene = (texto: string, terminos: string[]) =>
  terminos.some((termino) => texto.includes(normalizar(termino)));

const registrarPatron = (patrones: Record<string, number>, patron: string) => {
  patrones[patron] = (patrones[patron] || 0) + 1;
};

export const detectarIntencionPregunta = (textoPreguntaVisible: string): IntencionPreguntaVisibleV2 => {
  const texto = normalizar(textoPreguntaVisible);

  if (
    contiene(texto, [
      "corresponde detener",
      "corresponde aislar",
      "decision operacional",
      "decisión operacional",
      "debe detener",
      "debe aislar",
      "debe suspender",
      "debe bloquear",
      "puede continuar",
      "exige detener",
      "requiere detener",
      "requiere aislar",
    ])
  ) {
    return "decision_operacional";
  }
  if (
    contiene(texto, [
      "control aplicado",
      "control observado",
      "control suficiente",
      "existe control",
      "control actual",
      "control falta",
      "control fallo",
      "estado del control",
      "estado de la proteccion",
      "estado de la protección",
    ])
  ) {
    return "estado_control";
  }
  if (contiene(texto, ["senalizacion o segregacion impide", "control ambiental suficiente"])) {
    return "estado_control";
  }
  if (
    contiene(texto, [
      "accion inmediata",
      "que accion",
      "se requiere retiro",
      "retiro, reparacion",
      "retirar, reparar",
      "corregida inmediatamente",
      "contener derrame",
      "gestion ambiental",
      "gestión ambiental",
      "requiere reparacion",
      "requiere reparación",
      "requiere reposicion",
      "requiere reposición",
    ])
  ) {
    return "accion_inmediata";
  }
  if (contiene(texto, ["quien o que esta expuesto", "exposicion", "expone", "expuesto", "terceros", "peatones expuestos"])) {
    return "exposicion";
  }
  if (contiene(texto, ["evidencia", "fotografia", "fotografía", "trazabilidad", "registro suficiente", "respaldo disponible", "evidencia de cierre", "verificar cierre", "respaldar el cierre"])) {
    return "evidencia";
  }
  if (contiene(texto, ["se confirma la brecha", "se confirma el incumplimiento"])) {
    return "existencia_verificacion";
  }
  if (contiene(texto, ["procedimiento", "ast", "art", "pts", "permiso", "autorizacion", "matriz", "hds", "sds", "certificacion", "mantencion", "inspeccion", "registro", "documento", "documental", "regularizacion", "regularización", "respaldo", "charla", "difusion", "instruccion", "analisis previo", "quien debe revisar", "quién debe revisar", "responsable"])) {
    return "documental";
  }
  if (contiene(texto, ["afectacion actual", "afectación actual", "lesion", "lesión", "dano", "daño", "impacto"])) return "consecuencia";
  if (
    contiene(texto, [
      "se confirma",
      "existe",
      "hay trabajo",
      "hay personas",
      "esta disponible",
      "esta vigente",
      "cuenta con",
      "tiene",
      "proteccion contra caidas implementada",
      "exposicion a caida",
    ])
  ) {
    return "existencia_verificacion";
  }
  if (contiene(texto, ["ambito", "trabajadores, ambiente, equipos"])) return "ambito";
  if (contiene(texto, ["conducta observada", "condicion del entorno", "desviacion corresponde"])) return "acto_condicion";
  if (contiene(texto, ["que dano podria generar", "consecuencia"])) return "consecuencia";
  if (
    contiene(texto, [
      "cual es el riesgo especifico",
      "indique el riesgo especifico",
      "que actividad",
      "que tarea",
      "describa brevemente",
      "condicion o accion insegura",
      "que condicion especifica",
      "que sustancia",
    ])
  ) return "texto_breve";

  return "general";
};

const detectarPreguntasProhibidas = (textoPreguntaVisible: string, opciones?: string[]) => {
  const texto = normalizar(textoPreguntaVisible);
  const opcionesNormalizadas = normalizar(opciones || []);
  const prohibidas: string[] = [];

  if (texto.includes("hay trabajo en altura, borde abierto o plataforma elevada")) {
    prohibidas.push("Pregunta antigua de altura detectada.");
  }
  if (texto.includes("existe arnes, linea de vida, baranda o proteccion colectiva")) {
    prohibidas.push("Pregunta antigua de proteccion contra caidas detectada.");
  }
  if (texto.includes("debe detenerse la actividad hasta controlar la condicion")) {
    prohibidas.push("Pregunta antigua de detencion detectada.");
  }
  if (texto.includes("debe detenerse la actividad") && opcionesNormalizadas.includes("control suficiente")) {
    prohibidas.push("Decision operacional con opciones de control antiguo.");
  }

  return prohibidas;
};

export const detectarTipoOpciones = (opciones?: OpcionVisibleAuditoriaV2[]): TipoOpcionesVisibleV2 => {
  const labels = textosOpciones(opciones);
  if (labels.length === 0) return "texto";
  const texto = normalizar(labels.join(" "));

  if (contiene(texto, ["detener o aislar inmediatamente", "corregir antes de continuar", "mantener la actividad solo con control efectivo"])) {
    return "decision_operacional";
  }
  if (contiene(texto, ["control efectivo y completo", "control parcial o incompleto", "sin control"])) return "estado_control";
  if (contiene(texto, ["exposicion confirmada", "posible exposicion", "no hay exposicion"])) return "existencia_verificacion";
  if (contiene(texto, ["disponible y vigente", "disponible, pero incompleto o vencido", "no disponible", "regularizar antes de iniciar", "completar firmas", "actualizar documento", "supervisor del area", "supervisor del área", "prevencion de riesgos", "prevención de riesgos", "mantencion o servicio tecnico", "mantención o servicio técnico", "responsable del contrato", "requiere definicion conjunta", "requiere definición conjunta"])) return "documental";
  if (contiene(texto, ["retirar", "reparar", "reparacion", "reparación", "reposicion", "reposición", "segregar", "senalizar", "señalizar", "bloquear", "contener", "notificar", "gestion ambiental", "gestión ambiental", "corregir antes de continuar"])) return "accion_inmediata";
  if (contiene(texto, ["fotografia de la correccion", "fotografía de la corrección", "verificacion en terreno", "verificación en terreno", "registro y responsable de cierre", "mas de una evidencia", "más de una evidencia"])) return "evidencia";
  if (contiene(texto, ["seguridad laboral", "medio ambiente", "salud ocupacional", "documental / cumplimiento", "seguridad de trabajadores", "dano material", "operacional", "mas de uno"])) return "ambito";
  if (contiene(texto, ["conducta observada", "condicion del entorno", "ambas"])) return "acto_condicion";
  if (contiene(texto, ["persona lesionada", "daño a equipo", "dano a equipo", "impacto ambiental", "mas de una afectacion", "más de una afectación", "condicion de riesgo"])) return "consecuencia";
  if (contiene(texto, ["baja", "media", "alta", "critica", "requiere revision tecnica"])) return "criticidad";
  if (
    contiene(texto, [
      "si, confirmado",
      "si, proteccion completa",
      "si, proteccion parcial o incompleta",
      "posible o potencial",
      "no existe proteccion",
      "no hay exposicion",
    ]) &&
    !contiene(texto, ["control suficiente", "control parcial", "sin control"])
  ) {
    return "existencia_verificacion";
  }
  if (contiene(texto, ["si", "no", "parcial", "no verificable"])) return "si_no";

  return "desconocido";
};

export const detectarTextosInternosVisibles = (texto: string): string[] => {
  const encontrados: string[] = [];
  const normalizado = normalizar(texto);
  const terminos = [
    "motor v2",
    "motor v3",
    "router",
    "taxonomia",
    "biblioteca",
    "fallback",
    "preview",
    "shadow",
    "base tipada",
    "modo demo",
    "debug",
    "score",
    "base critico",
  ];

  for (const termino of terminos) {
    if (normalizado.includes(termino)) encontrados.push(termino);
  }

  const ids = texto.match(/\b[a-z]+_[a-z0-9_]+\b/g) || [];
  return [...encontrados, ...ids];
};

const detectarIdsTecnicosVisibles = (texto: string): string[] =>
  texto.match(/\b[a-z]+_[a-z0-9_]+\b/g) || [];

const detectarOpcionesAmbiguas = (opciones?: OpcionVisibleAuditoriaV2[]) =>
  textosOpciones(opciones).filter((opcion) => {
    const texto = normalizar(opcion);
    return texto === "parcial" || texto === "potencial";
  });

const calidadDesdeErrores = (errores: string[], intencion: IntencionPreguntaVisibleV2) => {
  if (errores.length > 0) return "rojo" as const;
  if (intencion === "general") return "amarillo" as const;
  return "verde" as const;
};

export const validarCalcePreguntaOpciones = (
  pregunta: PreguntaVisibleAuditoriaV2,
): ResultadoAuditoriaPreguntaVisibleV2 => {
  const texto = textoPregunta(pregunta);
  const intencion = detectarIntencionPregunta(texto);
  const tipoOpciones = detectarTipoOpciones(pregunta.opciones);
  const errores: string[] = [];
  const opcionesAmbiguas = detectarOpcionesAmbiguas(pregunta.opciones);
  const preguntasProhibidas = detectarPreguntasProhibidas(texto, textosOpciones(pregunta.opciones));

  if (intencion === "existencia_verificacion" && tipoOpciones === "estado_control") {
    errores.push("Pregunta de existencia o verificacion con opciones de control.");
  }
  if (
    intencion === "existencia_verificacion" &&
    !["existencia_verificacion", "si_no", "texto"].includes(tipoOpciones)
  ) {
    errores.push("Pregunta de existencia o verificacion con opciones incompatibles.");
  }
  if (intencion === "decision_operacional" && tipoOpciones !== "decision_operacional" && tipoOpciones !== "si_no") {
    errores.push("Pregunta de decision operacional con opciones no operacionales.");
  }
  if (intencion === "estado_control" && tipoOpciones !== "estado_control") {
    errores.push("Pregunta de control con opciones incompatibles.");
  }
  if (
    intencion === "exposicion" &&
    tipoOpciones !== "exposicion" &&
    tipoOpciones !== "existencia_verificacion" &&
    tipoOpciones !== "si_no"
  ) {
    errores.push("Pregunta de exposicion con opciones incompatibles.");
  }
  if (intencion === "documental" && tipoOpciones !== "documental" && tipoOpciones !== "si_no") {
    errores.push("Pregunta documental con opciones incompatibles.");
  }
  if (intencion === "accion_inmediata" && tipoOpciones !== "accion_inmediata" && tipoOpciones !== "decision_operacional" && tipoOpciones !== "si_no") {
    errores.push("Pregunta de accion inmediata con opciones incompatibles.");
  }
  if (intencion === "evidencia" && tipoOpciones !== "evidencia" && tipoOpciones !== "si_no") {
    errores.push("Pregunta de evidencia con opciones incompatibles.");
  }
  if (intencion === "ambito" && tipoOpciones !== "ambito") {
    errores.push("Pregunta de ambito con opciones incompatibles.");
  }
  if (intencion === "consecuencia" && tipoOpciones !== "consecuencia") {
    errores.push("Pregunta de afectacion con opciones incompatibles.");
  }
  if (intencion === "texto_breve" && tipoOpciones !== "texto") {
    errores.push("Pregunta de texto breve no debe mostrar opciones.");
  }
  if (opcionesAmbiguas.length > 0) {
    errores.push("Contiene opciones ambiguas aisladas.");
  }
  if (preguntasProhibidas.length > 0) {
    errores.push(...preguntasProhibidas);
  }

  const textoVisible = [texto, pregunta.objetivo, pregunta.ayuda, ...textosOpciones(pregunta.opciones)].join(" ");
  const textosInternosVisibles = detectarTextosInternosVisibles(textoVisible);
  const idsTecnicosVisibles = detectarIdsTecnicosVisibles(textoVisible);
  if (textosInternosVisibles.length > 0) errores.push("Contiene texto interno visible.");
  const preguntaExistenciaConOpcionesControl =
    intencion === "existencia_verificacion" && tipoOpciones === "estado_control";
  const preguntaDecisionConOpcionesControl =
    intencion === "decision_operacional" && tipoOpciones === "estado_control";
  const preguntaDocumentalConOpcionesIncorrectas =
    intencion === "documental" && tipoOpciones !== "documental" && tipoOpciones !== "si_no";

  return {
    idPregunta: String(pregunta.id || "sin_id"),
    texto,
    intencion,
    tipoOpciones,
    coherente: errores.length === 0,
    errores,
    textosInternosVisibles,
    idsTecnicosVisibles,
    calidadPreventiva: calidadDesdeErrores(errores, intencion),
    opcionesAmbiguas,
    preguntaExistenciaConOpcionesControl,
    preguntaDecisionConOpcionesControl,
    preguntaDocumentalConOpcionesIncorrectas,
  };
};

export const auditarPreguntaVisible = validarCalcePreguntaOpciones;

const reporteDesdeCaso = (caso: CasoAuditoriaPreguntasVisiblesV2): ReporteOrquestadorPreguntasPreventivasV2 => {
  const respuestas: Record<string, string> = {};
  if (caso.riesgoEspecificoDetectado) respuestas[ID_RIESGO_ESPECIFICO] = caso.riesgoEspecificoDetectado;
  respuestas[ID_AMBITO_PRINCIPAL] =
    caso.tipo === "ambiental"
      ? "medio_ambiente"
      : caso.tipo === "documental"
        ? "documental_cumplimiento"
        : caso.tipo === "salud"
          ? "salud_ocupacional"
          : "seguridad_laboral";
  respuestas[ID_ACTIVIDAD_TAREA] =
    caso.tipo === "critico"
      ? "trabajo crítico en terreno"
      : caso.tipo === "ambiental"
        ? "gestión ambiental en obra"
        : caso.tipo === "documental"
          ? "gestión documental"
          : caso.tipo === "salud"
            ? "actividad con exposición ocupacional"
            : "corrección simple de condición";
  respuestas[ID_CONDICION_ACCION] = caso.riesgoEspecificoDetectado || caso.descripcionHallazgo;
  respuestas[ID_AFECTACION_ACTUAL] =
    caso.tipo === "ambiental"
      ? "impacto_ambiental"
      : caso.tipo === "critico"
        ? "solo_condicion_riesgo"
        : "solo_condicion_riesgo";

  return {
    descripcion: caso.descripcionHallazgo,
    area: caso.tipo === "simple" ? "Area comun" : "Frente de trabajo",
    actividad: caso.tipo === "documental" ? "Gestion documental" : "Evaluacion preventiva",
    tipoHallazgo: "Validacion preventiva",
    evaluacion: {
      riesgo_especifico_detectado: caso.riesgoEspecificoDetectado,
      respuestas,
    },
  };
};

export const generarTablaAuditoriaPreguntas = (
  casos: CasoAuditoriaPreguntasVisiblesV2[],
): FilaAuditoriaPreguntasV2[] =>
  casos.flatMap((caso) => {
    const reporte = reporteDesdeCaso(caso);
    const preguntasPaso1 = obtenerPreguntasPaso1Preventivo();
    const respuestas = reporte.evaluacion?.respuestas || {};
    const clasificacion = clasificarContextoPreventivo(reporte, respuestas);
    const plantilla = obtenerPlantillaRondaProductiva(clasificacion.familiaPrincipal);
    const preguntasPlantilla = plantilla ? obtenerPreguntasPlantillaOrdenadas(plantilla) : [];
    const preguntasPaso2 = obtenerPreguntasPaso2Preventivo(reporte, respuestas);
    const preguntas = [...preguntasPaso1, ...preguntasPaso2];

    return preguntas.map((pregunta) => {
      const auditoria = validarCalcePreguntaOpciones(pregunta);
      const plantillaPregunta = preguntasPlantilla.find((preguntaItem) => preguntaItem.id === pregunta.id);
      return {
        idCaso: caso.id,
        tipoCaso: caso.tipo,
        paso: pregunta.paso,
        ronda: pregunta.paso === 1 ? "Ronda 1" : "Ronda 2",
        idPregunta: pregunta.id,
        texto: pregunta.texto,
        ayuda: pregunta.objetivo,
        opciones: textosOpciones(pregunta.opciones),
        fuente: "selector_preventivo",
        familia: pregunta.paso === 2 ? clasificacion.familiaPrincipal : "contexto_preventivo",
        slot: plantillaPregunta?.slot || (pregunta.paso === 1 ? "contexto" : "sin_slot"),
        esquema: plantillaPregunta?.esquemaRespuestaId || (pregunta.tipoRespuesta === "texto" ? "texto_breve" : "contexto_opciones"),
        intencion: auditoria.intencion,
        tipoOpciones: auditoria.tipoOpciones,
        coherente: auditoria.coherente,
        errores: auditoria.errores,
        calidadPreventiva: auditoria.calidadPreventiva,
        motivo:
          auditoria.calidadPreventiva === "verde"
            ? "Pregunta y alternativas coherentes con su intención preventiva."
            : auditoria.calidadPreventiva === "amarillo"
              ? "Pregunta general aceptable como apoyo de contexto, sin incompatibilidad de opciones."
              : auditoria.errores.join(" "),
        correccion: auditoria.coherente ? "Sin corrección requerida." : auditoria.errores.join(" "),
      };
    });
  });

export const auditarSalidaVisibleInforme = (datos: {
  textos: string[];
  criticidad?: string;
  normativaProbable?: string[];
}) => {
  const textoVisible = datos.textos.join(" ");
  const textosInternos = detectarTextosInternosVisibles(textoVisible);
  const informeTipoLog = /\bBase\s+(CRITICO|ALTO|MEDIO|BAJO)\b/i.test(textoVisible) || /\bscore\b/i.test(textoVisible);
  const esCritico = normalizar(datos.criticidad).includes("critico") || normalizar(datos.criticidad).includes("critico");
  const normativaDebil =
    esCritico &&
    !normalizar([...(datos.normativaProbable || []), textoVisible]).includes("marco legal/preventivo probable asociado");

  return {
    valido: textosInternos.length === 0 && !informeTipoLog && !normativaDebil,
    textosInternos,
    idsTecnicos: detectarIdsTecnicosVisibles(textoVisible),
    informeTipoLog,
    normativaDebil,
  };
};

const idsRonda1Esperados = [
  "transversal_anclaje_riesgo_especifico",
  "contexto_ambito_principal",
  "contexto_actividad_tarea",
  "contexto_condicion_accion",
  "contexto_afectacion_actual",
];

const textoIncluyeAlguno = (texto: string, terminos: string[]) =>
  terminos.some((termino) => normalizar(texto).includes(normalizar(termino)));

const preguntaAmbitoConSiNo = (fila: FilaAuditoriaPreguntasV2) => {
  if (fila.idPregunta !== "contexto_ambito_principal" && detectarIntencionPregunta(fila.texto) !== "ambito") return false;
  const opciones = fila.opciones.map(normalizar);
  return opciones.some((opcion) => opcion === "si" || opcion === "sí" || opcion === "no" || opcion === "no aplica");
};

const ronda1Correcta = (filasCaso: FilaAuditoriaPreguntasV2[]) => {
  const ronda1 = filasCaso.filter((fila) => fila.paso === 1);
  if (ronda1.length !== 5) return false;
  if (!idsRonda1Esperados.every((id, index) => ronda1[index]?.idPregunta === id)) return false;
  if (ronda1.some(preguntaAmbitoConSiNo)) return false;
  const textoRonda1 = normalizar(ronda1.map((fila) => [fila.texto, fila.ayuda, ...fila.opciones].join(" ")));
  if (/\b(pts|ast|art|permiso|autorizacion)\b/.test(textoRonda1) || textoIncluyeAlguno(textoRonda1, ["debe detener", "corresponde detener"])) {
    return false;
  }
  return true;
};

const esPreguntaProductivaPaso1 = (fila: FilaAuditoriaPreguntasV2) =>
  fila.paso === 1 &&
  ["decision_operacional", "estado_control", "documental", "accion_inmediata", "evidencia"].includes(fila.intencion);

const ronda2Correcta = (filasCaso: FilaAuditoriaPreguntasV2[]) => {
  const ronda2 = filasCaso.filter((fila) => fila.paso === 2);
  return ronda2.length === 5;
};

const casoCriticoConRondaProductivaCompleta = (
  caso: CasoAuditoriaPreguntasVisiblesV2,
  filasCaso: FilaAuditoriaPreguntasV2[],
) => {
  if (caso.tipo !== "critico") return false;
  const textoCaso = normalizar([caso.descripcionHallazgo, caso.riesgoEspecificoDetectado]);
  const ronda2 = filasCaso.filter((fila) => fila.paso === 2);
  const textoRonda2 = normalizar(ronda2.map((fila) => [fila.texto, fila.ayuda, ...fila.opciones].join(" ")));

  if (textoIncluyeAlguno(textoCaso, ["altura", "arnes", "linea de vida", "borde abierto", "caida", "andamio"])) {
    return (
      ronda2.length === 5 &&
      textoIncluyeAlguno(textoRonda2, ["exposicion a caida de distinto nivel"]) &&
      textoIncluyeAlguno(textoRonda2, ["proteccion contra caidas"]) &&
      textoIncluyeAlguno(textoRonda2, ["detener o aislar"]) &&
      textoIncluyeAlguno(textoRonda2, ["autorizacion", "ast", "art", "pts", "permiso"]) &&
      textoIncluyeAlguno(textoRonda2, ["evidencia"])
    );
  }

  return ronda2Correcta(filasCaso);
};

const tieneSobredocumentacionSimple = (caso: CasoAuditoriaPreguntasVisiblesV2, filasCaso: FilaAuditoriaPreguntasV2[]) => {
  if (caso.tipo !== "simple") return false;
  const texto = normalizar(filasCaso.map((fila) => [fila.texto, fila.ayuda, ...fila.opciones].join(" ")));
  return /\b(pts|ast|art|permiso|procedimiento)\b/.test(texto);
};

export const auditarPreguntasVisiblesPreventivas = (
  casos: CasoAuditoriaPreguntasVisiblesV2[],
): ResultadoAuditoriaPreguntasVisiblesV2 => {
  const tabla = generarTablaAuditoriaPreguntas(casos);
  const fallidos: ResultadoAuditoriaPreguntasVisiblesV2["fallidos"] = [];
  const patronesFalla: Record<string, number> = {};
  let preguntasIncoherentes = 0;
  let opcionesIncompatibles = 0;
  let opcionesAmbiguas = 0;
  let mezclaIntencionOpciones = 0;
  let preguntasExistenciaConOpcionesControl = 0;
  let preguntasDecisionConOpcionesControl = 0;
  let preguntasDocumentalesConOpcionesIncorrectas = 0;
  let textosInternosVisibles = 0;
  let idsTecnicosVisibles = 0;
  let casosSinTablaVisible = 0;
  let preguntasVerdes = 0;
  let preguntasAmarillas = 0;
  let preguntasRojas = 0;
  let preguntasProhibidasDetectadas = 0;
  let preguntasCorregidas = 0;
  let casosConRonda1Correcta = 0;
  let casosConRonda2Correcta = 0;
  let casosCriticosConRondaProductivaCompleta = 0;
  let paso1ConPreguntasProductivas = 0;
  let paso1ConPreguntasDocumentales = 0;
  let paso1ConPreguntasDecision = 0;
  let paso1ConPreguntasControl = 0;
  let paso2Insuficiente = 0;
  let banderaPerdida = 0;
  let preguntasAmbitoConSiNo = 0;
  let sobredocumentacionSimple = 0;
  const familiasSinPlantilla = familiasSinPlantillaProductiva().length;
  let preguntasFueraDeRonda = 0;
  const opcionesInferidasPorTexto = 0;
  let mezclaFamilias = 0;
  let mezclaFallback = 0;
  const contextoDesactualizado = 0;
  const ronda2NoInvalidada = 0;
  const resultadoConRespuestasIncompletas = 0;
  let subdocumentacionCritica = 0;
  const normativaInventada = 0;

  for (const caso of casos) {
    const filasCaso = tabla.filter((fila) => fila.idCaso === caso.id);
    const familiasRonda2 = new Set(filasCaso.filter((fila) => fila.paso === 2).map((fila) => fila.familia));
    const erroresCaso: string[] = [];
    if (filasCaso.length === 0) {
      casosSinTablaVisible += 1;
      erroresCaso.push("Caso sin preguntas visibles auditables.");
      registrarPatron(patronesFalla, "caso_sin_tabla_visible");
    }
    if (ronda1Correcta(filasCaso)) {
      casosConRonda1Correcta += 1;
    } else {
      erroresCaso.push("Ronda 1 no contiene exactamente las 5 preguntas de contexto requeridas.");
      registrarPatron(patronesFalla, "ronda1_incorrecta");
    }
    if (ronda2Correcta(filasCaso)) {
      casosConRonda2Correcta += 1;
    } else {
      paso2Insuficiente += 1;
      erroresCaso.push("Ronda 2 no contiene exactamente 5 preguntas productivas.");
      registrarPatron(patronesFalla, "ronda2_incorrecta");
    }
    if (!filasCaso.some((fila) => fila.paso === 2 && fila.fuente === "selector_preventivo")) {
      banderaPerdida += 1;
      erroresCaso.push("Bandera preventiva perdida antes de Ronda 2.");
      registrarPatron(patronesFalla, "bandera_perdida");
    }
    if (familiasRonda2.size > 1) {
      mezclaFamilias += 1;
      erroresCaso.push("Ronda 2 mezcla preguntas de más de una familia.");
      registrarPatron(patronesFalla, "mezcla_familias");
    }
    if (caso.tipo === "critico") {
      if (casoCriticoConRondaProductivaCompleta(caso, filasCaso)) {
        casosCriticosConRondaProductivaCompleta += 1;
      } else {
        subdocumentacionCritica += 1;
        erroresCaso.push("Caso crítico sin Ronda 2 productiva completa.");
        registrarPatron(patronesFalla, "critico_ronda2_incompleta");
      }
    }
    if (tieneSobredocumentacionSimple(caso, filasCaso)) {
      sobredocumentacionSimple += 1;
      erroresCaso.push("Caso simple sobredocumentado.");
      registrarPatron(patronesFalla, "sobredocumentacion_simple");
    }

    for (const fila of filasCaso) {
      const auditoria = validarCalcePreguntaOpciones({
        id: fila.idPregunta,
        texto: fila.texto,
        objetivo: fila.ayuda,
        opciones: fila.opciones.map((opcion) => ({ label: opcion })),
        paso: fila.paso,
      });
      if (auditoria.calidadPreventiva === "verde") preguntasVerdes += 1;
      if (auditoria.calidadPreventiva === "amarillo") preguntasAmarillas += 1;
      if (auditoria.calidadPreventiva === "rojo") preguntasRojas += 1;
      if (
        fila.idPregunta === "documental_detencion_actividad_14" ||
        fila.idPregunta === "documental_evidencia_registro_10" ||
        fila.idPregunta === "documental_senalizacion_segregacion_11" ||
        fila.idPregunta === "documental_control_ambiental_15"
      ) {
        preguntasCorregidas += 1;
      }
      const prohibidas = detectarPreguntasProhibidas(fila.texto, fila.opciones);
      preguntasProhibidasDetectadas += prohibidas.length;
      if (prohibidas.length > 0) {
        registrarPatron(patronesFalla, "pregunta_prohibida");
      }
      if (preguntaAmbitoConSiNo(fila)) {
        preguntasAmbitoConSiNo += 1;
        erroresCaso.push(`${fila.idPregunta}: Pregunta de ámbito con opciones binarias.`);
        registrarPatron(patronesFalla, "ambito_con_si_no");
      }
      if (esPreguntaProductivaPaso1(fila)) {
        paso1ConPreguntasProductivas += 1;
        erroresCaso.push(`${fila.idPregunta}: Paso 1 contiene pregunta productiva.`);
        registrarPatron(patronesFalla, "paso1_productivo");
      }
      if (fila.paso === 1 && fila.intencion === "documental") {
        paso1ConPreguntasDocumentales += 1;
        registrarPatron(patronesFalla, "paso1_documental");
      }
      if (fila.paso === 1 && fila.intencion === "decision_operacional") {
        paso1ConPreguntasDecision += 1;
        registrarPatron(patronesFalla, "paso1_decision");
      }
      if (fila.paso === 1 && fila.intencion === "estado_control") {
        paso1ConPreguntasControl += 1;
        registrarPatron(patronesFalla, "paso1_control");
      }
      if (fila.paso !== 1 && fila.paso !== 2) {
        preguntasFueraDeRonda += 1;
        erroresCaso.push(`${fila.idPregunta}: Pregunta fuera de ronda permitida.`);
        registrarPatron(patronesFalla, "pregunta_fuera_de_ronda");
      }
      if (fila.fuente !== "selector_preventivo") {
        mezclaFallback += 1;
        erroresCaso.push(`${fila.idPregunta}: Mezcla con flujo no preventivo.`);
        registrarPatron(patronesFalla, "mezcla_fallback");
      }
      opcionesAmbiguas += auditoria.opcionesAmbiguas.length;
      if (auditoria.errores.some((error) => error.includes("opciones"))) mezclaIntencionOpciones += 1;
      if (auditoria.preguntaExistenciaConOpcionesControl) preguntasExistenciaConOpcionesControl += 1;
      if (auditoria.preguntaDecisionConOpcionesControl) preguntasDecisionConOpcionesControl += 1;
      if (auditoria.preguntaDocumentalConOpcionesIncorrectas) preguntasDocumentalesConOpcionesIncorrectas += 1;

      if (!auditoria.coherente) {
        preguntasIncoherentes += 1;
        erroresCaso.push(`${fila.idPregunta}: ${auditoria.errores.join(" ")}`);
        registrarPatron(patronesFalla, fila.intencion);
      }
      if (auditoria.errores.some((error) => error.includes("opciones incompatibles") || error.includes("opciones no operacionales") || error.includes("opciones de control"))) {
        opcionesIncompatibles += 1;
      }
      const textosInternos = detectarTextosInternosVisibles([fila.texto, fila.ayuda, ...fila.opciones].join(" "));
      const ids = detectarIdsTecnicosVisibles([fila.texto, fila.ayuda, ...fila.opciones].join(" "));
      textosInternosVisibles += textosInternos.length;
      idsTecnicosVisibles += ids.length;
    }

    if (erroresCaso.length > 0) {
      const esCritico = erroresCaso.some((error) =>
        textoIncluyeAlguno(error, [
          "decision operacional",
          "opciones",
          "ronda 1",
          "ronda 2",
          "caso critico",
          "sobredocumentado",
          "pregunta antigua",
          "pregunta prohibida",
          "bandera preventiva",
          "paso 1 contiene",
          "pregunta de ambito",
        ]),
      );
      fallidos.push({
        idCaso: caso.id,
        severidad: esCritico ? "critico" : "menor",
        errores: erroresCaso,
      });
    }
  }

  const erroresCriticos = fallidos.filter((fallo) => fallo.severidad === "critico").length;
  const erroresMenores = fallidos.length - erroresCriticos;
  const correctos = casos.length - fallidos.length;

  return {
    totalCasos: casos.length,
    correctos,
    erroresMenores,
    erroresCriticos,
    porcentajeCumplimiento: casos.length > 0 ? Math.round((correctos / casos.length) * 100) : 0,
    preguntasAuditadas: tabla.length,
    preguntasRonda1Auditadas: tabla.filter((fila) => fila.paso === 1).length,
    preguntasRonda2Auditadas: tabla.filter((fila) => fila.paso === 2).length,
    casosConRonda1Correcta,
    casosConRonda2Correcta,
    casosCriticosConRondaProductivaCompleta,
    casosConPaso1ContextoExacto: casosConRonda1Correcta,
    casosConPaso2ProductivoCorrecto: casosConRonda2Correcta,
    paso1ConPreguntasProductivas,
    paso1ConPreguntasDocumentales,
    paso1ConPreguntasDecision,
    paso1ConPreguntasControl,
    paso2Insuficiente,
    banderaPerdida,
    preguntasAmbitoConSiNo,
    familiasSinPlantilla,
    preguntasFueraDeRonda,
    preguntasProhibidas: preguntasProhibidasDetectadas,
    opcionesInferidasPorTexto,
    mezclaFamilias,
    mezclaFallback,
    contextoDesactualizado,
    ronda2NoInvalidada,
    resultadoConRespuestasIncompletas,
    subdocumentacionCritica,
    normativaInventada,
    preguntasVerdes,
    preguntasAmarillas,
    preguntasRojas,
    preguntasProhibidasDetectadas,
    preguntasCorregidas,
    preguntasIncoherentes,
    opcionesIncompatibles,
    opcionesAmbiguas,
    mezclaIntencionOpciones,
    preguntasExistenciaConOpcionesControl,
    preguntasDecisionConOpcionesControl,
    preguntasDocumentalesConOpcionesIncorrectas,
    textosInternosVisibles,
    idsTecnicosVisibles,
    informesTipoLog: 0,
    normativaDebilEnCriticos: 0,
    sobredocumentacionSimple,
    casosSinTablaVisible,
    fallidos,
    patronesFalla,
    tabla,
  };
};
