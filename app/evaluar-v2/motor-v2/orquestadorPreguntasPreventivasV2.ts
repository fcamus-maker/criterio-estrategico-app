import {
  obtenerFormularioAdaptativoV2,
  type ConfiguracionFormularioAdaptativoV2,
  type PreguntaFormularioAdaptativaV2,
  type ReporteFormularioAdaptativoV2,
} from "./formularioAdaptativoV2";
import {
  construirFormularioPreventivoPuente,
  validarCompatibilidadFormularioPreventivo,
  type FormularioPreventivoPuente,
  type PreguntaFormularioPreventivoPuente,
} from "./puentePreguntasPreventivasV2";
import {
  construirMapeoRespuestasPreventivas,
  type ConfianzaMapeoRespuestasPreventivas,
  type ResultadoMapeoRespuestasPreventivas,
} from "./mapeoRespuestasPreventivasV2";

export type ContextoActivacionSelectorPreventivoV2 = {
  hostname?: string;
  entorno?: "local" | "desarrollo" | "produccion";
  forzarActivacion?: boolean;
  deshabilitado?: boolean;
};

export type ReporteOrquestadorPreguntasPreventivasV2 = ReporteFormularioAdaptativoV2 & {
  codigo?: string;
  descripcion?: string;
  area?: string;
  actividad?: string;
  tipoHallazgo?: string;
  evaluacion?: {
    respuestas?: Record<string, string>;
    riesgo_especifico_detectado?: string;
  };
};

export type EntradaOrquestadorPreguntasPreventivasV2 = {
  reporte: ReporteOrquestadorPreguntasPreventivasV2;
  formularioActual?: ConfiguracionFormularioAdaptativoV2 | null;
  contexto?: ContextoActivacionSelectorPreventivoV2;
  respuestas?: Record<string, string>;
};

export type ResumenActivacionPreventivaV2 = {
  totalPreguntasPaso1?: number;
  totalPreguntasPaso2?: number;
  requiereFallbackActual?: boolean;
  confianzaMapeo?: ConfianzaMapeoRespuestasPreventivas;
  riesgoSobredocumentacion?: boolean;
  riesgoSubdocumentacion?: boolean;
};

export type ResultadoFormularioPreguntasPreventivasV2 = {
  modo: "preventivo" | "fallback_actual";
  habilitado: boolean;
  preguntas: PreguntaFormularioAdaptativaV2[];
  preguntasPaso1: PreguntaFormularioAdaptativaV2[];
  preguntasPaso2: PreguntaFormularioAdaptativaV2[];
  formularioPreventivo?: FormularioPreventivoPuente;
  formularioActual: ConfiguracionFormularioAdaptativoV2;
  mapeo?: ResultadoMapeoRespuestasPreventivas;
  resumen: ResumenActivacionPreventivaV2;
  errores: string[];
};

export type ValidacionFormularioPreventivoCompletoV2 = {
  valido: boolean;
  errores: string[];
  advertencias: string[];
  duplicados: number;
  opcionesIncompatibles: number;
  textosProhibidos: number;
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

const normalizar = (valor?: unknown): string => {
  if (Array.isArray(valor)) return valor.map(normalizar).join(" ");
  if (valor === null || valor === undefined) return "";
  return String(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
};

const unico = <T>(items: T[]) => Array.from(new Set(items));

const contieneTextoProhibido = (texto: string) =>
  TEXTOS_PROHIBIDOS_VISIBLES.some((termino) => normalizar(texto).includes(normalizar(termino)));

const riesgoEspecificoDesdeReporte = (reporte: ReporteOrquestadorPreguntasPreventivasV2) =>
  reporte.evaluacion?.riesgo_especifico_detectado?.trim() ||
  reporte.evaluacion?.respuestas?.[ID_RIESGO_ESPECIFICO]?.trim() ||
  undefined;

const scoreParaOpcion = (opcion: { label?: string; value?: string }, pregunta: PreguntaFormularioPreventivoPuente) => {
  const texto = normalizar([opcion.label, opcion.value, pregunta.tipoRespuesta, pregunta.datoCapturado]);

  if (pregunta.tipo === "texto") return undefined;
  if (texto.includes("no aplica") || texto.includes("suficiente") || texto.includes("controlado")) return 0;
  if (texto.includes("detener") || texto.includes("sin control") || texto.includes("no existe")) return 12;
  if (texto.includes("no cumple") || texto.includes("vencido") || texto.includes("deteriorado")) return 10;
  if (texto.includes("parcial") || texto.includes("potencial") || texto.includes("requiere")) return 6;
  if (texto.includes("si") || texto.includes("sí") || texto.includes("trabajador")) return 4;
  return 2;
};

const convertirPreguntaPreventivaAActual = (
  pregunta: PreguntaFormularioPreventivoPuente,
): PreguntaFormularioAdaptativaV2 => ({
  id: pregunta.id,
  modulo: "otro_indeterminado",
  texto: pregunta.texto,
  objetivo: pregunta.ayuda || pregunta.datoCapturado || "Registrar información preventiva verificable.",
  paso: pregunta.paso,
  tipoRespuesta: pregunta.tipo,
  opciones: pregunta.opciones.map((opcion) => ({
    label: opcion.label,
    value: opcion.value,
    score: scoreParaOpcion(opcion, pregunta),
  })),
});

const construirEntradaPreview = (
  reporte: ReporteOrquestadorPreguntasPreventivasV2,
  respuestas?: Record<string, string>,
) => ({
  descripcionHallazgo: reporte.descripcion || "",
  riesgoEspecifico: riesgoEspecificoDesdeReporte({
    ...reporte,
    evaluacion: {
      ...(reporte.evaluacion || {}),
      respuestas: respuestas || reporte.evaluacion?.respuestas || {},
    },
  }),
  area: reporte.area,
  actividad: reporte.actividad || reporte.area,
  tipoHallazgo: reporte.tipoHallazgo || "Evaluación preventiva",
  respuestasPrevias: respuestas || reporte.evaluacion?.respuestas || {},
});

const fallbackDesdeActual = (
  formularioActual: ConfiguracionFormularioAdaptativoV2,
  habilitado: boolean,
  errores: string[] = [],
): ResultadoFormularioPreguntasPreventivasV2 => ({
  modo: "fallback_actual",
  habilitado,
  preguntas: formularioActual.preguntas,
  preguntasPaso1: formularioActual.preguntas.filter((pregunta) => pregunta.paso === 1),
  preguntasPaso2: formularioActual.preguntas.filter((pregunta) => pregunta.paso === 2),
  formularioActual,
  resumen: {
    totalPreguntasPaso1: formularioActual.preguntas.filter((pregunta) => pregunta.paso === 1).length,
    totalPreguntasPaso2: formularioActual.preguntas.filter((pregunta) => pregunta.paso === 2).length,
    requiereFallbackActual: true,
  },
  errores,
});

const firmaDocumentoPreventivo = (pregunta: PreguntaFormularioPreventivoPuente) => {
  if (!pregunta.metadataPreventiva.documental) return undefined;
  const documentos = pregunta.metadataPreventiva.documentosRelacionados;
  if (documentos.length === 0) return undefined;
  return documentos.slice().sort().join("|");
};

const quitarDuplicadosDocumentales = (
  formularioPreventivo: FormularioPreventivoPuente,
): FormularioPreventivoPuente => {
  const firmas = new Set<string>();

  return {
    ...formularioPreventivo,
    preguntas: formularioPreventivo.preguntas.filter((pregunta) => {
      const firma = firmaDocumentoPreventivo(pregunta);
      if (!firma) return true;
      if (firmas.has(firma)) return false;
      firmas.add(firma);
      return true;
    }),
  };
};

export const selectorPreventivoEstaHabilitado = (
  contexto: ContextoActivacionSelectorPreventivoV2 = {},
): boolean => {
  if (contexto.deshabilitado) return false;
  if (contexto.forzarActivacion) return true;
  return false;
};

export const dividirFormularioPreventivoPaso1Paso2 = (
  formularioPreventivo: FormularioPreventivoPuente,
) => ({
  paso1: formularioPreventivo.preguntas.filter((pregunta) => pregunta.paso === 1),
  paso2: formularioPreventivo.preguntas.filter((pregunta) => pregunta.paso === 2),
});

export const validarFormularioPreventivoCompleto = (
  formularioPreventivo: FormularioPreventivoPuente,
): ValidacionFormularioPreventivoCompletoV2 => {
  const compatibilidad = validarCompatibilidadFormularioPreventivo(formularioPreventivo);
  const errores = [...compatibilidad.errores];
  const advertencias = [...compatibilidad.advertencias];
  const ids = formularioPreventivo.preguntas.map((pregunta) => pregunta.id);
  const duplicados = ids.length - unico(ids).length;
  let textosProhibidos = compatibilidad.textosProhibidos;

  if (duplicados > 0) errores.push("Existen preguntas preventivas duplicadas.");

  for (const pregunta of formularioPreventivo.preguntas) {
    const textoVisible = [pregunta.texto, pregunta.ayuda, ...pregunta.opciones.map((opcion) => opcion.label)].join(" ");
    if (contieneTextoProhibido(textoVisible)) textosProhibidos += 1;
    if (pregunta.tipo === "opciones" && pregunta.opciones.length === 0) {
      errores.push(`Pregunta sin opciones visibles: ${pregunta.id}.`);
    }
    if (pregunta.tipo === "texto" && pregunta.opciones.length > 0) {
      errores.push(`Pregunta de texto con opciones visibles: ${pregunta.id}.`);
    }
  }

  const tienePaso1 = formularioPreventivo.preguntas.some((pregunta) => pregunta.paso === 1);
  const tienePaso2 = formularioPreventivo.preguntas.some((pregunta) => pregunta.paso === 2);
  if (!tienePaso1) errores.push("Formulario preventivo sin preguntas para paso 1.");
  if (!tienePaso2) errores.push("Formulario preventivo sin preguntas para paso 2.");
  if (textosProhibidos > 0) errores.push("Formulario preventivo contiene textos internos visibles.");

  return {
    valido: errores.length === 0,
    errores,
    advertencias,
    duplicados,
    opcionesIncompatibles: compatibilidad.opcionesIncompatibles,
    textosProhibidos,
  };
};

export const obtenerFormularioPreguntasPreventivasCompleto = (
  entrada: EntradaOrquestadorPreguntasPreventivasV2,
): ResultadoFormularioPreguntasPreventivasV2 => {
  const formularioActual = entrada.formularioActual || obtenerFormularioAdaptativoV2(entrada.reporte);

  try {
    const formularioPreventivo = quitarDuplicadosDocumentales(
      construirFormularioPreventivoPuente(
        construirEntradaPreview(entrada.reporte, entrada.respuestas),
      ).formularioPreventivo,
    );
    const validacion = validarFormularioPreventivoCompleto(formularioPreventivo);

    if (!validacion.valido) {
      return fallbackDesdeActual(formularioActual, true, validacion.errores);
    }

    const preguntas = formularioPreventivo.preguntas.map(convertirPreguntaPreventivaAActual);
    const mapeo = construirMapeoRespuestasPreventivas({
      descripcionHallazgo: entrada.reporte.descripcion,
      riesgoEspecificoDetectado: riesgoEspecificoDesdeReporte(entrada.reporte),
      respuestasPreventivas: entrada.respuestas || entrada.reporte.evaluacion?.respuestas || {},
      formularioPreventivo,
      formularioActual,
      respuestasActuales: entrada.reporte.evaluacion?.respuestas || {},
    });
    const preguntasPaso1 = preguntas.filter((pregunta) => pregunta.paso === 1);
    const preguntasPaso2 = preguntas.filter((pregunta) => pregunta.paso === 2);

    return {
      modo: "preventivo",
      habilitado: true,
      preguntas,
      preguntasPaso1,
      preguntasPaso2,
      formularioPreventivo,
      formularioActual,
      mapeo,
      resumen: construirResumenActivacionPreventiva({
        modo: "preventivo",
        preguntasPaso1,
        preguntasPaso2,
        mapeo,
        errores: [],
      }),
      errores: [],
    };
  } catch {
    return fallbackDesdeActual(formularioActual, true, ["No fue posible preparar preguntas preventivas."]);
  }
};

export const obtenerFormularioPreguntasConFallback = (
  entrada: EntradaOrquestadorPreguntasPreventivasV2,
): ResultadoFormularioPreguntasPreventivasV2 => {
  const formularioActual = entrada.formularioActual || obtenerFormularioAdaptativoV2(entrada.reporte);
  const habilitado = selectorPreventivoEstaHabilitado(entrada.contexto);

  if (!habilitado) {
    return fallbackDesdeActual(formularioActual, false);
  }

  return obtenerFormularioPreguntasPreventivasCompleto({
    ...entrada,
    formularioActual,
  });
};

export const construirEstadoPreguntasPreventivas = (
  reporte: ReporteOrquestadorPreguntasPreventivasV2,
  formularioActual?: ConfiguracionFormularioAdaptativoV2 | null,
  contexto?: ContextoActivacionSelectorPreventivoV2,
) => obtenerFormularioPreguntasConFallback({ reporte, formularioActual, contexto });

export const construirResumenActivacionPreventiva = (
  resultado: Pick<ResultadoFormularioPreguntasPreventivasV2, "preguntasPaso1" | "preguntasPaso2" | "modo" | "mapeo" | "errores">,
): ResumenActivacionPreventivaV2 => ({
  totalPreguntasPaso1: resultado.preguntasPaso1.length,
  totalPreguntasPaso2: resultado.preguntasPaso2.length,
  requiereFallbackActual: resultado.modo !== "preventivo" || Boolean(resultado.mapeo?.requiereFallbackActual),
  confianzaMapeo: resultado.mapeo?.confianzaMapeo,
  riesgoSobredocumentacion: false,
  riesgoSubdocumentacion: false,
});
