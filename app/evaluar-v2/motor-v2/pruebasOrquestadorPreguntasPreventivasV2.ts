import type { DocumentoPreventivoAplicable } from "./aplicabilidadPreventivaV2";
import { obtenerFormularioAdaptativoV2 } from "./formularioAdaptativoV2";
import {
  construirMapeoRespuestasPreventivas,
} from "./mapeoRespuestasPreventivasV2";
import {
  obtenerFormularioPreguntasConFallback,
  validarFormularioPreventivoCompleto,
} from "./orquestadorPreguntasPreventivasV2";
import {
  CASOS_COMPARADOR_SELECTOR_PREVENTIVO,
  type CasoPruebaComparadorSelectorPreventivo,
} from "./pruebasComparadorSelectorPreventivoV2";

export type FalloOrquestadorPreguntasPreventivasV2 = {
  id: string;
  descripcion: string;
  errores: string[];
  severidad: "menor" | "critico";
};

export type ResultadoBancoOrquestadorPreguntasPreventivasV2 = {
  totalCasos: number;
  correctos: number;
  erroresMenores: number;
  erroresCriticos: number;
  porcentajeCumplimiento: number;
  fallbackCorrecto: number;
  preventivoCorrecto: number;
  paso1Correcto: number;
  paso2Correcto: number;
  anclajeCorrecto: number;
  duplicados: number;
  opcionesIncompatibles: number;
  textosProhibidos: number;
  sobredocumentacionSimple: number;
  subdocumentacionCritica: number;
  mapeoIncompatible: number;
  resultadoSinDatos: number;
  fallidos: FalloOrquestadorPreguntasPreventivasV2[];
  patronesFalla: Record<string, number>;
};

const ID_RIESGO_ESPECIFICO = "transversal_anclaje_riesgo_especifico";

const DOCUMENTOS_FORMALES: DocumentoPreventivoAplicable[] = [
  "procedimiento",
  "ast_art",
  "pts",
  "permiso_autorizacion",
  "matriz_riesgos",
  "bloqueo_loto",
];

const TEXTOS_PROHIBIDOS = [
  "motor",
  "router",
  "taxonomia",
  "taxonomía",
  "biblioteca",
  "fallback",
  "preview",
  "shadow",
  "base tipada",
  "modo demo",
  "debug",
  "score",
];

const casoSimple = (
  id: string,
  descripcionHallazgo: string,
  riesgoEspecificoDetectado: string,
): CasoPruebaComparadorSelectorPreventivo => ({
  id,
  descripcionHallazgo,
  riesgoEspecificoDetectado,
  tipo: "simple",
  recomendacionEsperada: "usar_preventivo",
  documentosEsperados: [],
  documentosProhibidos: DOCUMENTOS_FORMALES,
  debeTenerAlias: true,
  debeDetectarFaltaAnclaje: false,
  resultadoEsperado: "Debe usar preguntas preventivas sin sobredocumentar.",
});

const casoCritico = (
  id: string,
  descripcionHallazgo: string,
  riesgoEspecificoDetectado: string,
  documentosEsperados: DocumentoPreventivoAplicable[],
): CasoPruebaComparadorSelectorPreventivo => ({
  id,
  descripcionHallazgo,
  riesgoEspecificoDetectado,
  tipo: "critico",
  recomendacionEsperada: "usar_preventivo",
  documentosEsperados,
  documentosProhibidos: [],
  debeTenerAlias: true,
  debeDetectarFaltaAnclaje: false,
  resultadoEsperado: "Debe activar controles preventivos críticos.",
});

const casoDocumental = (
  id: string,
  descripcionHallazgo: string,
  riesgoEspecificoDetectado: string,
  documentosEsperados: DocumentoPreventivoAplicable[],
): CasoPruebaComparadorSelectorPreventivo => ({
  id,
  descripcionHallazgo,
  riesgoEspecificoDetectado,
  tipo: "documental",
  recomendacionEsperada: "usar_preventivo",
  documentosEsperados,
  documentosProhibidos: [],
  debeTenerAlias: true,
  debeDetectarFaltaAnclaje: false,
  resultadoEsperado: "Debe mapear brecha documental sin bloquear el flujo.",
});

const CASOS_EXTRA: CasoPruebaComparadorSelectorPreventivo[] = [
  casoSimple("simple-extra-026", "Reparacion menor de cubierta decorativa.", "reparacion menor"),
  casoSimple("simple-extra-027", "Senaletica menor despegada en pasillo.", "senaletica menor"),
  casoSimple("simple-extra-028", "Mobiliario con dano menor sin exposicion.", "mobiliario dano menor"),
  casoSimple("simple-extra-029", "Material menor ordenado en bodega.", "material menor"),
  casoSimple("simple-extra-030", "Limpieza simple de acceso realizada.", "limpieza simple"),
  casoCritico("critico-extra-036", "Extintor vencido en zona de trabajo.", "extintor vencido", [
    "certificacion_mantencion",
    "inspeccion",
  ]),
  casoCritico("critico-extra-037", "Trabajador sin proteccion ocular en esmerilado.", "sin proteccion ocular", [
    "inspeccion",
  ]),
  casoCritico("critico-extra-038", "Camion retrocede sin segregacion peatonal.", "retroceso sin segregacion", [
    "senalizacion_segregacion",
    "procedimiento",
  ]),
  casoCritico("critico-extra-039", "Intervencion de bomba sin bloqueo de energia.", "bomba sin bloqueo", [
    "bloqueo_loto",
    "procedimiento",
  ]),
  casoCritico("critico-extra-040", "Trabajo con quimico sin HDS disponible.", "quimico sin HDS", ["hds_sds"]),
  casoDocumental("documental-extra-011", "Registro de inspeccion no disponible.", "registro inspeccion", [
    "inspeccion",
    "evidencia_registro",
  ]),
  casoDocumental("documental-extra-012", "Permiso de trabajo no firmado.", "permiso sin firma", [
    "permiso_autorizacion",
    "evidencia_registro",
  ]),
  casoDocumental("documental-extra-013", "Matriz sin incorporar nuevo riesgo.", "matriz riesgo nuevo", [
    "matriz_riesgos",
  ]),
  casoDocumental("documental-extra-014", "Charla de 5 minutos sin registro.", "charla sin registro", [
    "charla_difusion",
  ]),
  casoDocumental("documental-extra-015", "Procedimiento disponible pero no difundido.", "procedimiento no difundido", [
    "procedimiento",
    "charla_difusion",
  ]),
  casoDocumental("documental-extra-016", "Certificado de equipo no vigente.", "certificado no vigente", [
    "certificacion_mantencion",
  ]),
  casoDocumental("documental-extra-017", "HDS de sustancia no disponible en bodega.", "HDS no disponible", [
    "hds_sds",
  ]),
  casoDocumental("documental-extra-018", "AST no considera energia cercana.", "AST sin energia", [
    "ast_art",
    "matriz_riesgos",
  ]),
  casoDocumental("documental-extra-019", "PTS no autorizado por supervisor.", "PTS no autorizado", [
    "pts",
    "permiso_autorizacion",
  ]),
  casoDocumental("documental-extra-020", "Evidencia de cierre no verificable.", "evidencia cierre", [
    "evidencia_registro",
  ]),
];

export const CASOS_ORQUESTADOR_PREGUNTAS_PREVENTIVAS: CasoPruebaComparadorSelectorPreventivo[] = [
  ...CASOS_COMPARADOR_SELECTOR_PREVENTIVO,
  ...CASOS_EXTRA,
];

const normalizar = (valor?: unknown): string =>
  String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const contieneTextoProhibido = (texto: string) =>
  TEXTOS_PROHIBIDOS.some((termino) => normalizar(texto).includes(normalizar(termino)));

const registrarPatron = (patrones: Record<string, number>, patron: string) => {
  patrones[patron] = (patrones[patron] || 0) + 1;
};

const reporteDesdeCaso = (caso: CasoPruebaComparadorSelectorPreventivo) => {
  const respuestas: Record<string, string> = {};

  if (caso.riesgoEspecificoDetectado) {
    respuestas[ID_RIESGO_ESPECIFICO] = caso.riesgoEspecificoDetectado;
  }

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

const idsDuplicados = (ids: string[]) => ids.length - new Set(ids).size;

export const evaluarBancoOrquestadorPreguntasPreventivas = (): ResultadoBancoOrquestadorPreguntasPreventivasV2 => {
  const fallidos: FalloOrquestadorPreguntasPreventivasV2[] = [];
  const patronesFalla: Record<string, number> = {};
  let fallbackCorrecto = 0;
  let preventivoCorrecto = 0;
  let paso1Correcto = 0;
  let paso2Correcto = 0;
  let anclajeCorrecto = 0;
  let duplicados = 0;
  let opcionesIncompatibles = 0;
  let textosProhibidos = 0;
  let sobredocumentacionSimple = 0;
  let subdocumentacionCritica = 0;
  let mapeoIncompatible = 0;
  let resultadoSinDatos = 0;

  for (const caso of CASOS_ORQUESTADOR_PREGUNTAS_PREVENTIVAS) {
    const reporte = reporteDesdeCaso(caso);
    const formularioActual = obtenerFormularioAdaptativoV2(reporte);
    const fallback = obtenerFormularioPreguntasConFallback({
      reporte,
      formularioActual,
      contexto: { deshabilitado: true },
    });
    const preventivo = obtenerFormularioPreguntasConFallback({
      reporte,
      formularioActual,
      contexto: { forzarActivacion: true },
    });
    const mapeo = construirMapeoRespuestasPreventivas({
      descripcionHallazgo: caso.descripcionHallazgo,
      riesgoEspecificoDetectado: caso.riesgoEspecificoDetectado,
      respuestasPreventivas: reporte.evaluacion.respuestas,
      formularioPreventivo: preventivo.formularioPreventivo,
      formularioActual,
      respuestasActuales: reporte.evaluacion.respuestas,
    });
    const errores: string[] = [];
    let severidad: "menor" | "critico" = "menor";

    if (fallback.modo === "fallback_actual" && fallback.preguntas.length === formularioActual.preguntas.length) {
      fallbackCorrecto += 1;
    } else {
      errores.push("El modo deshabilitado no conserva el formulario actual.");
      severidad = "critico";
      registrarPatron(patronesFalla, "fallback");
    }

    if (preventivo.modo === "preventivo" && preventivo.formularioPreventivo && preventivo.preguntas.length > 0) {
      preventivoCorrecto += 1;
    } else {
      errores.push("El modo habilitado no entrega formulario preventivo completo.");
      severidad = "critico";
      registrarPatron(patronesFalla, "preventivo");
    }

    if (preventivo.preguntasPaso1.length > 0 && preventivo.preguntasPaso1.every((pregunta) => pregunta.paso === 1)) {
      paso1Correcto += 1;
    } else {
      errores.push("Paso 1 preventivo sin preguntas válidas.");
      severidad = "critico";
      registrarPatron(patronesFalla, "paso1");
    }

    if (preventivo.preguntasPaso2.length > 0 && preventivo.preguntasPaso2.every((pregunta) => pregunta.paso === 2)) {
      paso2Correcto += 1;
    } else {
      errores.push("Paso 2 preventivo sin preguntas válidas.");
      severidad = "critico";
      registrarPatron(patronesFalla, "paso2");
    }

    const ids = preventivo.preguntas.map((pregunta) => pregunta.id);
    const duplicadosCaso = idsDuplicados(ids);
    duplicados += duplicadosCaso;
    if (duplicadosCaso > 0) {
      errores.push("Formulario preventivo contiene preguntas duplicadas.");
      severidad = "critico";
      registrarPatron(patronesFalla, "duplicados");
    }

    const tieneAnclaje = preventivo.preguntasPaso1.some((pregunta) => pregunta.id === ID_RIESGO_ESPECIFICO);
    if ((caso.riesgoEspecificoDetectado && !tieneAnclaje) || (!caso.riesgoEspecificoDetectado && tieneAnclaje)) {
      anclajeCorrecto += 1;
    } else {
      errores.push("Anclaje preventivo no coincide con el estado del riesgo específico.");
      severidad = "critico";
      registrarPatron(patronesFalla, "anclaje");
    }

    const opcionesInvalidas = preventivo.preguntas.filter(
      (pregunta) =>
        (pregunta.tipoRespuesta === "opciones" && pregunta.opciones.length === 0) ||
        (pregunta.tipoRespuesta === "texto" && pregunta.opciones.length > 0),
    ).length;
    opcionesIncompatibles += opcionesInvalidas;
    if (opcionesInvalidas > 0) {
      errores.push("Opciones incompatibles con tipo de respuesta.");
      severidad = "critico";
      registrarPatron(patronesFalla, "opciones");
    }

    const textoVisible = preventivo.preguntas
      .flatMap((pregunta) => [pregunta.texto, pregunta.objetivo, ...pregunta.opciones.map((opcion) => opcion.label)])
      .join(" ");
    if (contieneTextoProhibido(textoVisible)) {
      textosProhibidos += 1;
      errores.push("Texto interno visible detectado.");
      severidad = "critico";
      registrarPatron(patronesFalla, "textos");
    }

    if (preventivo.formularioPreventivo) {
      const validacion = validarFormularioPreventivoCompleto(preventivo.formularioPreventivo);
      duplicados += validacion.duplicados;
      opcionesIncompatibles += validacion.opcionesIncompatibles;
      textosProhibidos += validacion.textosProhibidos;
      if (!validacion.valido) {
        errores.push(...validacion.errores);
        severidad = "critico";
        registrarPatron(patronesFalla, "validacion");
      }
    }

    const documentosFormulario =
      preventivo.formularioPreventivo?.preguntas.flatMap((pregunta) => [
        ...pregunta.metadataPreventiva.documentosRelacionados,
        ...(pregunta.id.includes("evidencia") ? (["evidencia_registro"] as DocumentoPreventivoAplicable[]) : []),
      ]) || [];
    const documentos = Array.from(new Set([...mapeo.documentosAplicables, ...documentosFormulario]));
    const docsProhibidos = mapeo.documentosAplicables.filter((documento) => caso.documentosProhibidos.includes(documento));
    const docsFaltantes = caso.documentosEsperados.filter((documento) => !documentos.includes(documento));
    if (caso.tipo === "simple" && docsProhibidos.length > 0) {
      sobredocumentacionSimple += 1;
      errores.push(`Sobredocumentación simple: ${docsProhibidos.join(", ")}.`);
      severidad = "critico";
      registrarPatron(patronesFalla, "sobredocumentacion");
    }
    if (caso.tipo === "critico" && docsFaltantes.length > 0) {
      subdocumentacionCritica += 1;
      errores.push(`Subdocumentación crítica: ${docsFaltantes.join(", ")}.`);
      severidad = "critico";
      registrarPatron(patronesFalla, "subdocumentacion");
    }
    if (docsFaltantes.length > 0 && caso.tipo !== "ambiguo") {
      mapeoIncompatible += 1;
      errores.push(`Mapeo sin documentos esperados: ${docsFaltantes.join(", ")}.`);
      severidad = "critico";
      registrarPatron(patronesFalla, "mapeo");
    }
    if (!caso.riesgoEspecificoDetectado && !mapeo.requiereFallbackActual) {
      mapeoIncompatible += 1;
      errores.push("Caso sin riesgo específico no exige respaldo actual.");
      severidad = "critico";
      registrarPatron(patronesFalla, "mapeo");
    }

    if (preventivo.preguntas.length === 0 || (!caso.riesgoEspecificoDetectado && !mapeo.requiereFallbackActual)) {
      resultadoSinDatos += 1;
      errores.push("El resultado quedaría sin datos mínimos.");
      severidad = "critico";
      registrarPatron(patronesFalla, "resultado");
    }

    if (errores.length > 0) {
      fallidos.push({
        id: caso.id,
        descripcion: caso.descripcionHallazgo,
        errores,
        severidad,
      });
    }
  }

  const erroresCriticos = fallidos.filter((fallo) => fallo.severidad === "critico").length;
  const erroresMenores = fallidos.length - erroresCriticos;
  const correctos = CASOS_ORQUESTADOR_PREGUNTAS_PREVENTIVAS.length - fallidos.length;

  return {
    totalCasos: CASOS_ORQUESTADOR_PREGUNTAS_PREVENTIVAS.length,
    correctos,
    erroresMenores,
    erroresCriticos,
    porcentajeCumplimiento: Math.round((correctos / CASOS_ORQUESTADOR_PREGUNTAS_PREVENTIVAS.length) * 100),
    fallbackCorrecto,
    preventivoCorrecto,
    paso1Correcto,
    paso2Correcto,
    anclajeCorrecto,
    duplicados,
    opcionesIncompatibles,
    textosProhibidos,
    sobredocumentacionSimple,
    subdocumentacionCritica,
    mapeoIncompatible,
    resultadoSinDatos,
    fallidos,
    patronesFalla,
  };
};
