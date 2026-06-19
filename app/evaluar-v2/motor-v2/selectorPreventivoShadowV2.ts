import {
  construirComparacionSelectorPreventivo,
  type ComparacionSelectorPreventivoV2,
  type EntradaComparadorSelectorPreventivoV2,
  type RecomendacionModoPreguntasV2,
} from "./comparadorSelectorPreventivoV2";
import type {
  PreguntaFormularioAdaptativaV2,
  ReporteFormularioAdaptativoV2,
} from "./formularioAdaptativoV2";

const ID_RIESGO_ESPECIFICO = "transversal_anclaje_riesgo_especifico";

export type ContextoSelectorPreventivoShadowV2 = {
  hostname?: string;
  entorno?: "local" | "desarrollo" | "produccion";
  forzarActivacion?: boolean;
  deshabilitado?: boolean;
};

export type ResumenSelectorPreventivoShadowV2 = {
  activo?: boolean;
  recomendacionModo?: RecomendacionModoPreguntasV2;
  totalPreguntasActuales?: number;
  totalPreguntasPreventivas?: number;
  riesgoSobredocumentacion?: boolean;
  riesgoSubdocumentacion?: boolean;
  requiereFallbackActual?: boolean;
  tieneRiesgoEspecifico?: boolean;
  aliasSemanticosBasicos?: string[];
};

export type EntradaSelectorPreventivoShadowV2 = EntradaComparadorSelectorPreventivoV2 & {
  contexto?: ContextoSelectorPreventivoShadowV2;
};

export type ResultadoSelectorPreventivoShadowV2 = {
  ok: boolean;
  ejecutado: boolean;
  resumen: ResumenSelectorPreventivoShadowV2;
  errores: string[];
};

type FormularioActualCompatible =
  | PreguntaFormularioAdaptativaV2[]
  | {
      preguntas?: PreguntaFormularioAdaptativaV2[];
    }
  | null
  | undefined;

type ReporteShadowCompatible = ReporteFormularioAdaptativoV2 & {
  descripcion?: string;
  area?: string;
  actividad?: string;
  tipoHallazgo?: string;
  evaluacion?: {
    respuestas?: Record<string, string>;
    riesgo_especifico_detectado?: string;
  };
};

const RESUMEN_MAX_BYTES = 1400;

const normalizar = (valor?: unknown): string =>
  String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const unico = <T>(items: T[]) => Array.from(new Set(items));

const esHostLocal = (hostname?: string) => {
  const host = normalizar(hostname);
  if (!host) return false;
  if (host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0") return true;
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(host)) return true;
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(host)) return true;
  return false;
};

const preguntasDesdeFormulario = (formularioActual: FormularioActualCompatible) => {
  if (Array.isArray(formularioActual)) return formularioActual;
  if (Array.isArray(formularioActual?.preguntas)) return formularioActual.preguntas;
  return undefined;
};

const riesgoEspecificoDesdeReporte = (reporte: ReporteShadowCompatible) =>
  reporte.evaluacion?.riesgo_especifico_detectado?.trim() ||
  reporte.evaluacion?.respuestas?.[ID_RIESGO_ESPECIFICO]?.trim() ||
  undefined;

const aliasBasicosDesdeComparacion = (comparacion: ComparacionSelectorPreventivoV2) => {
  const alias = comparacion.aliasSemanticosPreventivos;
  const salida: string[] = [];

  if (alias.riesgo_especifico_detectado) salida.push("riesgo_especifico_detectado");
  if (alias.ambito_principal) salida.push("ambito_principal");
  if (alias.tipo_desviacion) salida.push("tipo_desviacion");
  if (alias.exposicion_detectada) salida.push("exposicion_detectada");
  if (alias.control_faltante) salida.push("control_faltante");
  if (alias.requiere_documentacion_habilitante) salida.push("documentacion_habilitante");
  if (alias.requiere_ast_art) salida.push("ast_art");
  if (alias.requiere_pts) salida.push("pts");
  if (alias.requiere_permiso) salida.push("permiso_autorizacion");
  if (alias.requiere_matriz) salida.push("matriz_riesgos");
  if (alias.requiere_hds) salida.push("hds_sds");
  if (alias.requiere_certificacion_mantencion) salida.push("certificacion_mantencion");
  if (alias.requiere_detencion) salida.push("detencion_actividad");
  if (alias.requiere_evidencia_cierre) salida.push("evidencia_cierre");
  if (alias.requiere_revision_tecnica) salida.push("revision_tecnica");

  return unico(salida).slice(0, 14);
};

export const selectorShadowEstaHabilitado = (
  contexto: ContextoSelectorPreventivoShadowV2 = {},
): boolean => {
  if (contexto.deshabilitado) return false;
  if (contexto.forzarActivacion) return true;
  if (contexto.entorno === "local" || contexto.entorno === "desarrollo") return true;
  return esHostLocal(contexto.hostname);
};

export const construirEntradaShadowDesdeReporte = (
  reporte: ReporteShadowCompatible,
  formularioActual?: FormularioActualCompatible,
): EntradaSelectorPreventivoShadowV2 => ({
  descripcionHallazgo: reporte.descripcion || "",
  riesgoEspecificoDetectado: riesgoEspecificoDesdeReporte(reporte),
  area: reporte.area,
  actividad: reporte.actividad,
  tipoHallazgo: reporte.tipoHallazgo,
  respuestasActuales: reporte.evaluacion?.respuestas || {},
  formularioActual: preguntasDesdeFormulario(formularioActual),
  reporteActual: reporte,
});

export const construirResumenShadowSelector = (
  resultadoComparativo: ComparacionSelectorPreventivoV2,
): ResumenSelectorPreventivoShadowV2 => ({
  activo: true,
  recomendacionModo: resultadoComparativo.recomendacionModo,
  totalPreguntasActuales: resultadoComparativo.formularioActualResumen.totalPreguntas,
  totalPreguntasPreventivas: resultadoComparativo.formularioPreventivoResumen.totalPreguntas,
  riesgoSobredocumentacion: resultadoComparativo.riesgosSobredocumentacion.length > 0,
  riesgoSubdocumentacion: resultadoComparativo.riesgosSubdocumentacion.length > 0,
  requiereFallbackActual: resultadoComparativo.requiereFallbackActual,
  tieneRiesgoEspecifico: Boolean(
    resultadoComparativo.aliasSemanticosPreventivos.riesgo_especifico_detectado,
  ),
  aliasSemanticosBasicos: aliasBasicosDesdeComparacion(resultadoComparativo),
});

export const sanitizarResumenShadowSelector = (
  resumen: ResumenSelectorPreventivoShadowV2,
): ResumenSelectorPreventivoShadowV2 => {
  const aliasSemanticosBasicos = Array.isArray(resumen.aliasSemanticosBasicos)
    ? resumen.aliasSemanticosBasicos
        .map((item) => normalizar(item).replace(/[^a-z0-9_]/g, "_"))
        .filter(Boolean)
        .slice(0, 14)
    : undefined;

  return {
    activo: Boolean(resumen.activo),
    recomendacionModo: resumen.recomendacionModo,
    totalPreguntasActuales: Number.isFinite(resumen.totalPreguntasActuales)
      ? Math.max(0, Number(resumen.totalPreguntasActuales))
      : undefined,
    totalPreguntasPreventivas: Number.isFinite(resumen.totalPreguntasPreventivas)
      ? Math.max(0, Number(resumen.totalPreguntasPreventivas))
      : undefined,
    riesgoSobredocumentacion: Boolean(resumen.riesgoSobredocumentacion),
    riesgoSubdocumentacion: Boolean(resumen.riesgoSubdocumentacion),
    requiereFallbackActual: Boolean(resumen.requiereFallbackActual),
    tieneRiesgoEspecifico: Boolean(resumen.tieneRiesgoEspecifico),
    aliasSemanticosBasicos,
  };
};

export const validarResumenShadowSelector = (
  resumen: ResumenSelectorPreventivoShadowV2,
): { valido: boolean; errores: string[] } => {
  const errores: string[] = [];
  const recomendacionesValidas: RecomendacionModoPreguntasV2[] = [
    "usar_actual",
    "usar_preventivo",
    "requiere_revision",
    "mantener_fallback_actual",
  ];

  if (resumen.recomendacionModo && !recomendacionesValidas.includes(resumen.recomendacionModo)) {
    errores.push("Recomendacion interna no reconocida.");
  }
  if (JSON.stringify(resumen).length > RESUMEN_MAX_BYTES) {
    errores.push("Resumen interno excede el tamaño liviano permitido.");
  }
  if ("preguntasPreventivasSugeridas" in resumen || "preguntasActuales" in resumen) {
    errores.push("Resumen interno contiene listas completas de preguntas.");
  }

  return {
    valido: errores.length === 0,
    errores,
  };
};

export const ejecutarSelectorPreventivoShadow = (
  entrada: EntradaSelectorPreventivoShadowV2,
): ResultadoSelectorPreventivoShadowV2 => {
  const habilitado = selectorShadowEstaHabilitado(entrada.contexto);

  if (!habilitado) {
    return {
      ok: true,
      ejecutado: false,
      resumen: { activo: false },
      errores: [],
    };
  }

  try {
    const comparacion = construirComparacionSelectorPreventivo(entrada);
    const resumen = sanitizarResumenShadowSelector(construirResumenShadowSelector(comparacion));
    const validacion = validarResumenShadowSelector(resumen);

    return {
      ok: validacion.valido,
      ejecutado: true,
      resumen,
      errores: validacion.errores,
    };
  } catch {
    return {
      ok: false,
      ejecutado: false,
      resumen: { activo: false },
      errores: ["No fue posible ejecutar la evaluacion interna en paralelo."],
    };
  }
};
