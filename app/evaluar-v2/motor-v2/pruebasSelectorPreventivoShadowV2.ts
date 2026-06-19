import { obtenerFormularioAdaptativoV2 } from "./formularioAdaptativoV2";
import {
  CASOS_COMPARADOR_SELECTOR_PREVENTIVO,
  type CasoPruebaComparadorSelectorPreventivo,
} from "./pruebasComparadorSelectorPreventivoV2";
import {
  construirEntradaShadowDesdeReporte,
  ejecutarSelectorPreventivoShadow,
  type ResultadoSelectorPreventivoShadowV2,
} from "./selectorPreventivoShadowV2";

export type FalloSelectorPreventivoShadowV2 = {
  id: string;
  descripcion: string;
  errores: string[];
  severidad: "menor" | "critico";
};

export type ResultadoBancoSelectorPreventivoShadowV2 = {
  totalCasos: number;
  correctos: number;
  erroresMenores: number;
  erroresCriticos: number;
  porcentajeCumplimiento: number;
  casosShadowFallidos: number;
  casosSinResumen: number;
  casosConObjetoPesado: number;
  casosSimplesSobredocumentados: number;
  casosCriticosSubdocumentados: number;
  recomendacionesInvalidas: number;
  textosProhibidos: number;
  fallidos: FalloSelectorPreventivoShadowV2[];
  patronesFalla: Record<string, number>;
};

const ID_RIESGO_ESPECIFICO = "transversal_anclaje_riesgo_especifico";

const TEXTOS_PROHIBIDOS_VISIBLES = [
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

const RECOMENDACIONES_VALIDAS = [
  "usar_actual",
  "usar_preventivo",
  "requiere_revision",
  "mantener_fallback_actual",
];

const normalizar = (valor?: unknown): string =>
  String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const contieneTextoProhibidoVisible = (texto: string) =>
  TEXTOS_PROHIBIDOS_VISIBLES.some((termino) => normalizar(texto).includes(normalizar(termino)));

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

const textoVisibleComparable = (resultado: ResultadoSelectorPreventivoShadowV2) =>
  [
    ...(resultado.errores || []),
  ].join(" ");

const contieneObjetoPesado = (resultado: ResultadoSelectorPreventivoShadowV2) => {
  const resumen = resultado.resumen as Record<string, unknown>;
  if ("preguntasActuales" in resumen) return true;
  if ("preguntasPreventivasSugeridas" in resumen) return true;
  if ("preguntasPreventivasBloqueadas" in resumen) return true;
  if ("formularioActualResumen" in resumen) return true;
  if ("formularioPreventivoResumen" in resumen) return true;
  return JSON.stringify(resumen).length > 1400;
};

export const evaluarBancoSelectorPreventivoShadow = (): ResultadoBancoSelectorPreventivoShadowV2 => {
  const fallidos: FalloSelectorPreventivoShadowV2[] = [];
  const patronesFalla: Record<string, number> = {};
  let casosShadowFallidos = 0;
  let casosSinResumen = 0;
  let casosConObjetoPesado = 0;
  let casosSimplesSobredocumentados = 0;
  let casosCriticosSubdocumentados = 0;
  let recomendacionesInvalidas = 0;
  let textosProhibidos = 0;

  for (const caso of CASOS_COMPARADOR_SELECTOR_PREVENTIVO) {
    const reporte = reporteDesdeCaso(caso);
    const formularioActual = obtenerFormularioAdaptativoV2(reporte);
    const preguntasAntes = JSON.stringify(formularioActual.preguntas);
    const respuestasAntes = JSON.stringify(reporte.evaluacion.respuestas);
    const entrada = construirEntradaShadowDesdeReporte(reporte, formularioActual);
    const resultado = ejecutarSelectorPreventivoShadow({
      ...entrada,
      contexto: { hostname: "localhost", entorno: "desarrollo" },
    });
    const errores: string[] = [];
    let severidad: "menor" | "critico" = "menor";

    if (!resultado.ok || !resultado.ejecutado) {
      casosShadowFallidos += 1;
      errores.push("La ejecucion interna en paralelo no fue exitosa.");
      severidad = "critico";
      registrarPatron(patronesFalla, "ejecucion");
    }

    if (!resultado.resumen || resultado.resumen.activo !== true) {
      casosSinResumen += 1;
      errores.push("No se genero resumen interno activo.");
      severidad = "critico";
      registrarPatron(patronesFalla, "resumen");
    }

    if (contieneObjetoPesado(resultado)) {
      casosConObjetoPesado += 1;
      errores.push("El resumen interno contiene datos pesados o listas completas.");
      severidad = "critico";
      registrarPatron(patronesFalla, "objeto_pesado");
    }

    if (caso.riesgoEspecificoDetectado && !resultado.resumen.tieneRiesgoEspecifico) {
      errores.push("No se uso el riesgo especifico informado.");
      severidad = "critico";
      registrarPatron(patronesFalla, "riesgo_especifico");
    }

    if (!caso.riesgoEspecificoDetectado && resultado.resumen.tieneRiesgoEspecifico) {
      errores.push("Se marco riesgo especifico aunque no fue informado.");
      severidad = "critico";
      registrarPatron(patronesFalla, "anclaje");
    }

    if (caso.tipo === "ambiguo" && !caso.riesgoEspecificoDetectado) {
      if (resultado.resumen.recomendacionModo !== "requiere_revision") {
        recomendacionesInvalidas += 1;
        errores.push("Caso ambiguo sin anclaje no quedo como revision requerida.");
        severidad = "critico";
        registrarPatron(patronesFalla, "recomendacion");
      }
    }

    if (
      resultado.resumen.recomendacionModo &&
      !RECOMENDACIONES_VALIDAS.includes(resultado.resumen.recomendacionModo)
    ) {
      recomendacionesInvalidas += 1;
      errores.push("Recomendacion interna no valida.");
      severidad = "critico";
      registrarPatron(patronesFalla, "recomendacion");
    }

    if (caso.tipo === "simple" && resultado.resumen.riesgoSobredocumentacion) {
      casosSimplesSobredocumentados += 1;
      errores.push("Caso simple queda con riesgo de sobredocumentacion.");
      severidad = "critico";
      registrarPatron(patronesFalla, "sobredocumentacion");
    }

    if (caso.tipo === "critico" && resultado.resumen.riesgoSubdocumentacion) {
      casosCriticosSubdocumentados += 1;
      errores.push("Caso critico queda con riesgo de subdocumentacion.");
      severidad = "critico";
      registrarPatron(patronesFalla, "subdocumentacion");
    }

    if (JSON.stringify(formularioActual.preguntas) !== preguntasAntes) {
      errores.push("La ejecucion interna altero preguntas visibles actuales.");
      severidad = "critico";
      registrarPatron(patronesFalla, "preguntas_visibles");
    }

    if (JSON.stringify(reporte.evaluacion.respuestas) !== respuestasAntes) {
      errores.push("La ejecucion interna altero respuestas actuales.");
      severidad = "critico";
      registrarPatron(patronesFalla, "respuestas");
    }

    if (contieneTextoProhibidoVisible(textoVisibleComparable(resultado))) {
      textosProhibidos += 1;
      errores.push("Texto interno prohibido en salida visible comparable.");
      severidad = "critico";
      registrarPatron(patronesFalla, "textos_prohibidos");
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
  const correctos = CASOS_COMPARADOR_SELECTOR_PREVENTIVO.length - fallidos.length;

  return {
    totalCasos: CASOS_COMPARADOR_SELECTOR_PREVENTIVO.length,
    correctos,
    erroresMenores,
    erroresCriticos,
    porcentajeCumplimiento: Math.round((correctos / CASOS_COMPARADOR_SELECTOR_PREVENTIVO.length) * 100),
    casosShadowFallidos,
    casosSinResumen,
    casosConObjetoPesado,
    casosSimplesSobredocumentados,
    casosCriticosSubdocumentados,
    recomendacionesInvalidas,
    textosProhibidos,
    fallidos,
    patronesFalla,
  };
};
