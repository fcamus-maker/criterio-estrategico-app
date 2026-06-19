import type { DocumentoPreventivoAplicable } from "./aplicabilidadPreventivaV2";
import {
  obtenerFormularioAdaptativoV2,
  type PreguntaFormularioAdaptativaV2,
  type ReporteFormularioAdaptativoV2,
} from "./formularioAdaptativoV2";
import {
  construirAliasSemanticosRespuestas,
  construirFormularioPreventivoPuente,
  validarCompatibilidadFormularioPreventivo,
  type AliasSemanticosRespuestasPreventivas,
  type PreguntaFormularioPreventivoPuente,
} from "./puentePreguntasPreventivasV2";
import {
  construirPreviewPreguntasPreventivas,
  type EntradaPreviewPreguntasPreventivas,
} from "./previewSelectorPreguntasPreventivasV2";

export type RecomendacionModoPreguntasV2 =
  | "usar_actual"
  | "usar_preventivo"
  | "requiere_revision"
  | "mantener_fallback_actual";

export type EntradaComparadorSelectorPreventivoV2 = {
  descripcionHallazgo: string;
  riesgoEspecificoDetectado?: string;
  area?: string;
  actividad?: string;
  tipoHallazgo?: string;
  respuestasActuales?: Record<string, string>;
  formularioActual?: PreguntaFormularioAdaptativaV2[];
  reporteActual?: ReporteFormularioAdaptativoV2;
};

export type ResumenFormularioActualSelectorPreventivo = {
  totalPreguntas: number;
  preguntasPaso1: number;
  preguntasPaso2: number;
  preguntasDocumentales: number;
  modulosDetectados: string[];
};

export type ResumenFormularioPreventivoSelector = {
  totalPreguntas: number;
  preguntasPaso1: number;
  preguntasPaso2: number;
  preguntasDocumentales: number;
  preguntasBloqueadas: number;
  requiereAnclaje: boolean;
  suficienciaTecnica?: string;
};

export type PreguntaResumenActualSelector = {
  id: string;
  texto: string;
  paso: number;
  modulo?: string;
};

export type PreguntaResumenPreventivaSelector = {
  id: string;
  texto: string;
  paso: 1 | 2;
  tipoRespuesta: string;
  documental: boolean;
};

export type ComparacionSelectorPreventivoV2 = {
  formularioActualResumen: ResumenFormularioActualSelectorPreventivo;
  formularioPreventivoResumen: ResumenFormularioPreventivoSelector;
  preguntasActuales: PreguntaResumenActualSelector[];
  preguntasPreventivasSugeridas: PreguntaResumenPreventivaSelector[];
  preguntasPreventivasBloqueadas: Array<{
    id: string;
    texto: string;
    motivo: string;
  }>;
  preguntasDocumentalesActuales: number;
  preguntasDocumentalesPreventivas: number;
  aliasSemanticosPreventivos: AliasSemanticosRespuestasPreventivas;
  diferenciasClave: string[];
  riesgosSobredocumentacion: string[];
  riesgosSubdocumentacion: string[];
  recomendacionModo: RecomendacionModoPreguntasV2;
  advertencias: string[];
  requiereFallbackActual: boolean;
};

const TEXTOS_PROHIBIDOS = [
  "motor",
  "router",
  "taxonomia",
  "taxonomía",
  "biblioteca",
  "fallback",
  "preview",
  "base tipada",
  "modo demo",
  "debug",
  "score",
];

const DOCUMENTOS_FORMALES: DocumentoPreventivoAplicable[] = [
  "procedimiento",
  "ast_art",
  "pts",
  "permiso_autorizacion",
  "matriz_riesgos",
];

const DOCUMENTOS_CRITICOS: DocumentoPreventivoAplicable[] = [
  ...DOCUMENTOS_FORMALES,
  "bloqueo_loto",
  "hds_sds",
  "certificacion_mantencion",
  "control_ambiental",
  "detencion_actividad",
  "senalizacion_segregacion",
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

const textoEntrada = (entrada: EntradaComparadorSelectorPreventivoV2) =>
  normalizar([
    entrada.descripcionHallazgo,
    entrada.riesgoEspecificoDetectado,
    entrada.area,
    entrada.actividad,
    entrada.tipoHallazgo,
  ]);

const contieneTextoProhibido = (texto: string) =>
  TEXTOS_PROHIBIDOS.some((termino) => normalizar(texto).includes(normalizar(termino)));

const esHallazgoSimple = (entrada: EntradaComparadorSelectorPreventivoV2) => {
  const texto = textoEntrada(entrada);
  return [
    "vaso trizado",
    "goma de piso",
    "vidrio quebrado",
    "material menor",
    "senalizacion menor",
    "señalizacion menor",
    "derrame menor de agua",
    "pintura fresca",
    "residuo comun",
    "herramienta menor",
    "dano menor",
    "daño menor",
    "mobiliario",
    "protector plastico",
    "protector plástico",
    "funda plastica",
    "funda plástica",
  ].some((termino) => texto.includes(normalizar(termino)));
};

const esCasoCritico = (entrada: EntradaComparadorSelectorPreventivoV2) => {
  const texto = textoEntrada(entrada);
  return [
    "sin arnes",
    "sin arnés",
    "trabajo en caliente",
    "loto",
    "bloqueo",
    "excavacion",
    "excavación",
    "entibacion",
    "entibación",
    "izaje",
    "carga suspendida",
    "gasolina",
    "hds",
    "derrame de combustible",
    "tablero electrico",
    "tablero eléctrico",
    "conduccion imprudente",
    "conducción imprudente",
    "zona restringida",
    "certificacion vencida",
    "certificación vencida",
    "partes moviles",
    "partes móviles",
    "techumbre fragil",
    "techumbre frágil",
  ].some((termino) => texto.includes(normalizar(termino)));
};

const tieneRiesgoEspecifico = (entrada: EntradaComparadorSelectorPreventivoV2) =>
  Boolean(entrada.riesgoEspecificoDetectado?.trim());

const construirReporteActual = (
  entrada: EntradaComparadorSelectorPreventivoV2,
): ReporteFormularioAdaptativoV2 => ({
  descripcion: entrada.descripcionHallazgo || entrada.reporteActual?.descripcion || "",
  area: entrada.area || entrada.reporteActual?.area || "",
  actividad: entrada.actividad || entrada.reporteActual?.actividad || entrada.reporteActual?.area || "",
  tipoHallazgo: entrada.tipoHallazgo || entrada.reporteActual?.tipoHallazgo,
  evaluacion: {
    respuestas: entrada.respuestasActuales || entrada.reporteActual?.evaluacion?.respuestas || {},
  },
});

const obtenerPreguntasActuales = (
  entrada: EntradaComparadorSelectorPreventivoV2,
): PreguntaFormularioAdaptativaV2[] => {
  if (Array.isArray(entrada.formularioActual)) return entrada.formularioActual;
  return obtenerFormularioAdaptativoV2(construirReporteActual(entrada)).preguntas;
};

const contarDocumentalesActuales = (preguntas: PreguntaFormularioAdaptativaV2[]) =>
  preguntas.filter((pregunta) =>
    normalizar([pregunta.texto, pregunta.objetivo, pregunta.modulo]).includes("document"),
  ).length;

const resumenActual = (
  preguntas: PreguntaFormularioAdaptativaV2[],
): ResumenFormularioActualSelectorPreventivo => ({
  totalPreguntas: preguntas.length,
  preguntasPaso1: preguntas.filter((pregunta) => pregunta.paso === 1).length,
  preguntasPaso2: preguntas.filter((pregunta) => pregunta.paso === 2).length,
  preguntasDocumentales: contarDocumentalesActuales(preguntas),
  modulosDetectados: unico(preguntas.map((pregunta) => pregunta.modulo).filter(Boolean)),
});

const resumenPreventivo = (
  preguntas: PreguntaFormularioPreventivoPuente[],
  bloqueadas: number,
  requiereAnclaje: boolean,
  suficienciaTecnica?: string,
): ResumenFormularioPreventivoSelector => ({
  totalPreguntas: preguntas.length,
  preguntasPaso1: preguntas.filter((pregunta) => pregunta.paso === 1).length,
  preguntasPaso2: preguntas.filter((pregunta) => pregunta.paso === 2).length,
  preguntasDocumentales: preguntas.filter((pregunta) => pregunta.metadataPreventiva.documental).length,
  preguntasBloqueadas: bloqueadas,
  requiereAnclaje,
  suficienciaTecnica,
});

const preguntasActualesResumen = (
  preguntas: PreguntaFormularioAdaptativaV2[],
): PreguntaResumenActualSelector[] =>
  preguntas.map((pregunta) => ({
    id: pregunta.id,
    texto: pregunta.texto,
    paso: pregunta.paso,
    modulo: pregunta.modulo,
  }));

const preguntasPreventivasResumen = (
  preguntas: PreguntaFormularioPreventivoPuente[],
): PreguntaResumenPreventivaSelector[] =>
  preguntas.map((pregunta) => ({
    id: pregunta.id,
    texto: pregunta.texto,
    paso: pregunta.paso,
    tipoRespuesta: pregunta.tipoRespuesta,
    documental: pregunta.metadataPreventiva.documental,
  }));

const respuestasParaAlias = (entrada: EntradaComparadorSelectorPreventivoV2) => {
  const respuestas = { ...(entrada.respuestasActuales || entrada.reporteActual?.evaluacion?.respuestas || {}) };
  if (entrada.riesgoEspecificoDetectado?.trim() && !respuestas.transversal_anclaje_riesgo_especifico) {
    respuestas.transversal_anclaje_riesgo_especifico = entrada.riesgoEspecificoDetectado.trim();
  }
  return respuestas;
};

const documentosPreventivos = (preguntas: PreguntaFormularioPreventivoPuente[]) =>
  unico(preguntas.flatMap((pregunta) => pregunta.metadataPreventiva.documentosRelacionados));

const textoComparativo = (entrada: EntradaComparadorSelectorPreventivoV2) => textoEntrada(entrada);

const contieneAlguno = (texto: string, terminos: string[]) =>
  terminos.some((termino) => texto.includes(normalizar(termino)));

const documentosInferidosPorSenales = (
  entrada: EntradaComparadorSelectorPreventivoV2,
): DocumentoPreventivoAplicable[] => {
  if (!tieneRiesgoEspecifico(entrada)) return [];

  const texto = textoComparativo(entrada);
  const documentos: DocumentoPreventivoAplicable[] = [];

  if (
    contieneAlguno(texto, [
      "sin arnes",
      "sin arnés",
      "altura",
      "trabajo en caliente",
      "excavacion",
      "excavación",
      "entibacion",
      "entibación",
      "techumbre",
      "plataforma",
      "espacio confinado",
      "demolicion",
      "demolición",
      "pts faltante",
      "trabajo critico",
      "trabajo crítico",
    ])
  ) {
    documentos.push("pts");
  }

  if (
    contieneAlguno(texto, [
      "trabajo en caliente",
      "intervenido sin loto",
      "sin loto",
      "sin bloqueo",
      "excavacion",
      "excavación",
      "izaje",
      "carga suspendida",
      "sin autorizacion",
      "sin autorización",
      "zona restringida",
      "techumbre",
      "espacio confinado",
      "viento",
      "paso bajo carga",
    ])
  ) {
    documentos.push("permiso_autorizacion");
  }

  if (contieneAlguno(texto, ["ast", "art"])) documentos.push("ast_art");

  if (
    contieneAlguno(texto, [
      "sin arnes",
      "sin arnés",
      "conduccion imprudente",
      "conducción imprudente",
      "partes moviles",
      "partes móviles",
      "deslizamiento",
      "linea de fuego",
      "línea de fuego",
      "pts faltante",
      "ast faltante",
      "viento",
    ])
  ) {
    documentos.push("matriz_riesgos");
  }

  if (contieneAlguno(texto, ["loto", "bloqueo", "tablero", "electrico", "eléctrico", "electricidad"])) {
    documentos.push("bloqueo_loto");
  }

  if (
    contieneAlguno(texto, [
      "procedimiento",
      "tablero",
      "electrico",
      "eléctrico",
      "conduccion imprudente",
      "conducción imprudente",
      "loto",
      "bloqueo",
      "linea de fuego",
      "línea de fuego",
    ])
  ) {
    documentos.push("procedimiento");
  }

  if (
    contieneAlguno(texto, [
      "izaje sin segregacion",
      "izaje sin segregación",
      "sin segregacion",
      "sin segregación",
      "proteccion perimetral",
      "protección perimetral",
    ])
  ) {
    documentos.push("senalizacion_segregacion");
  }

  if (contieneAlguno(texto, ["gasolina", "hds", "combustible", "sustancia", "residuo peligroso"])) {
    documentos.push("hds_sds");
  }

  if (
    contieneAlguno(texto, [
      "gasolina",
      "derrame combustible",
      "combustible al suelo",
      "residuo peligroso",
      "control ambiental",
    ])
  ) {
    documentos.push("control_ambiental");
  }

  if (
    contieneAlguno(texto, [
      "certificacion",
      "certificación",
      "eslinga",
      "enchufe",
      "parabrisas",
      "neumatico",
      "neumático",
      "sin mantencion",
      "sin mantención",
      "equipo critico",
      "equipo crítico",
    ])
  ) {
    documentos.push("certificacion_mantencion");
  }

  if (
    contieneAlguno(texto, [
      "partes moviles",
      "partes móviles",
      "plataforma",
      "enchufe",
      "calzado",
      "parabrisas",
      "neumatico",
      "neumático",
      "checklist",
      "equipo critico",
      "equipo crítico",
    ])
  ) {
    documentos.push("inspeccion");
  }

  if (contieneAlguno(texto, ["deslizamiento"])) documentos.push("detencion_actividad");
  if (contieneAlguno(texto, ["charla", "difundida", "difusion", "difusión"])) documentos.push("charla_difusion");
  if (contieneAlguno(texto, ["firma", "checklist", "evidencia fotografica", "evidencia fotográfica"])) {
    documentos.push("evidencia_registro");
  }

  return unico(documentos);
};

const enriquecerAliasConDocumentos = (
  aliasBase: AliasSemanticosRespuestasPreventivas,
  documentos: DocumentoPreventivoAplicable[],
): AliasSemanticosRespuestasPreventivas => {
  const documentosRequeridos = unico([...(aliasBase.documentos_requeridos || []), ...documentos]);

  return {
    ...aliasBase,
    documentos_requeridos: documentosRequeridos,
    requiere_documentacion_habilitante: documentosRequeridos.some((documento) =>
      DOCUMENTOS_FORMALES.includes(documento),
    ),
    requiere_ast_art: documentosRequeridos.includes("ast_art"),
    requiere_pts: documentosRequeridos.includes("pts"),
    requiere_permiso: documentosRequeridos.includes("permiso_autorizacion"),
    requiere_matriz: documentosRequeridos.includes("matriz_riesgos"),
    requiere_hds: documentosRequeridos.includes("hds_sds"),
    requiere_certificacion_mantencion: documentosRequeridos.includes("certificacion_mantencion"),
    requiere_detencion: aliasBase.requiere_detencion || documentosRequeridos.includes("detencion_actividad"),
    requiere_evidencia_cierre:
      aliasBase.requiere_evidencia_cierre || documentosRequeridos.includes("evidencia_registro"),
  };
};

const detectarTextosInternos = (
  preguntasActuales: PreguntaResumenActualSelector[],
  preguntasPreventivas: PreguntaResumenPreventivaSelector[],
  bloqueadas: Array<{ texto: string; motivo: string }>,
) => {
  const texto = [
    ...preguntasActuales.flatMap((pregunta) => [pregunta.texto, pregunta.modulo]),
    ...preguntasPreventivas.map((pregunta) => pregunta.texto),
    ...bloqueadas.flatMap((pregunta) => [pregunta.texto, pregunta.motivo]),
  ].join(" ");
  return contieneTextoProhibido(texto);
};

export const detectarRiesgoSobredocumentacionComparativa = (
  comparacion: Pick<
    ComparacionSelectorPreventivoV2,
    "formularioPreventivoResumen" | "preguntasPreventivasBloqueadas" | "aliasSemanticosPreventivos"
  >,
): string[] => {
  const riesgos: string[] = [];
  const documentos = comparacion.aliasSemanticosPreventivos.documentos_requeridos || [];
  const formales = documentos.filter((documento) => DOCUMENTOS_FORMALES.includes(documento));

  if (formales.length > 0 && comparacion.preguntasPreventivasBloqueadas.length === 0) {
    riesgos.push("Documentacion formal seleccionada sin bloqueo preventivo suficiente.");
  }
  if (formales.length > 0 && comparacion.formularioPreventivoResumen.preguntasDocumentales > 6) {
    riesgos.push("Volumen documental alto para una evaluacion movil.");
  }

  return riesgos;
};

export const detectarRiesgoSubdocumentacionComparativa = (
  comparacion: Pick<
    ComparacionSelectorPreventivoV2,
    "aliasSemanticosPreventivos" | "preguntasDocumentalesPreventivas"
  >,
): string[] => {
  const riesgos: string[] = [];
  const documentos = comparacion.aliasSemanticosPreventivos.documentos_requeridos || [];
  const tieneCriticos = documentos.some((documento) => DOCUMENTOS_CRITICOS.includes(documento));

  if (tieneCriticos && comparacion.preguntasDocumentalesPreventivas === 0) {
    riesgos.push("Faltan preguntas documentales para controles criticos.");
  }

  return riesgos;
};

export const recomendarModoPreguntas = (
  comparacion: Omit<ComparacionSelectorPreventivoV2, "recomendacionModo">,
): RecomendacionModoPreguntasV2 => {
  if (comparacion.requiereFallbackActual) return "mantener_fallback_actual";
  if (comparacion.formularioPreventivoResumen.requiereAnclaje) return "requiere_revision";
  if (comparacion.advertencias.some((advertencia) => normalizar(advertencia).includes("incompat"))) {
    return "mantener_fallback_actual";
  }
  if (comparacion.riesgosSubdocumentacion.length > 0) return "requiere_revision";
  if (comparacion.diferenciasClave.some((diferencia) => normalizar(diferencia).includes("critico"))) {
    return "usar_preventivo";
  }
  if ((comparacion.aliasSemanticosPreventivos.documentos_requeridos || []).length > 0) {
    return "usar_preventivo";
  }
  if (comparacion.preguntasPreventivasBloqueadas.length > 0) return "usar_preventivo";
  if (comparacion.formularioPreventivoResumen.suficienciaTecnica === "insuficiente") {
    return "requiere_revision";
  }
  return "usar_preventivo";
};

export const construirComparacionSelectorPreventivo = (
  entrada: EntradaComparadorSelectorPreventivoV2,
): ComparacionSelectorPreventivoV2 => {
  try {
    const preguntasActuales = obtenerPreguntasActuales(entrada);
    const entradaPreview: EntradaPreviewPreguntasPreventivas = {
      descripcionHallazgo: entrada.descripcionHallazgo,
      riesgoEspecifico: entrada.riesgoEspecificoDetectado,
      area: entrada.area,
      actividad: entrada.actividad,
      tipoHallazgo: entrada.tipoHallazgo,
      maximoSugerido: 18,
    };
    const preview = construirPreviewPreguntasPreventivas(entradaPreview);
    const puente = construirFormularioPreventivoPuente(entradaPreview);
    const compatibilidad = validarCompatibilidadFormularioPreventivo(puente.formularioPreventivo);
    const preguntasActualesBasicas = preguntasActualesResumen(preguntasActuales);
    const preguntasPreventivasBasicas = preguntasPreventivasResumen(puente.formularioPreventivo.preguntas);
    const preguntasBloqueadas = preview.preguntasBloqueadas.map((pregunta) => ({
      id: pregunta.id,
      texto: pregunta.textoVisible,
      motivo: pregunta.motivoBloqueo,
    }));
    const documentosBase = unico([
      ...documentosPreventivos(puente.formularioPreventivo.preguntas),
      ...documentosInferidosPorSenales(entrada),
    ]);
    const documentos = esHallazgoSimple(entrada)
      ? documentosBase.filter((documento) => !DOCUMENTOS_FORMALES.includes(documento))
      : documentosBase;
    const aliasSemanticosPreventivos = enriquecerAliasConDocumentos(
      construirAliasSemanticosRespuestas(respuestasParaAlias(entrada)),
      documentos,
    );
    const diferenciasClave: string[] = [];
    const advertencias: string[] = [...puente.advertenciasCompatibilidad];

    if (esHallazgoSimple(entrada) && preguntasBloqueadas.length > 0) {
      diferenciasClave.push("La evaluacion preventiva evita documentacion formal innecesaria.");
    }
    if (esCasoCritico(entrada) && documentos.some((documento) => DOCUMENTOS_CRITICOS.includes(documento))) {
      diferenciasClave.push("La evaluacion preventiva identifica controles criticos y documentos habilitantes.");
    }
    if (!tieneRiesgoEspecifico(entrada)) {
      advertencias.push("Falta precisar el riesgo especifico observado.");
    }
    if (compatibilidad.errores.length > 0) {
      advertencias.push("Existen incompatibilidades de formato para activar preguntas preventivas.");
    }
    if (detectarTextosInternos(preguntasActualesBasicas, preguntasPreventivasBasicas, preguntasBloqueadas)) {
      advertencias.push("Se detectaron textos internos en preguntas comparadas.");
    }

    const baseSinRecomendacion: Omit<ComparacionSelectorPreventivoV2, "recomendacionModo"> = {
      formularioActualResumen: resumenActual(preguntasActuales),
      formularioPreventivoResumen: resumenPreventivo(
        puente.formularioPreventivo.preguntas,
        preguntasBloqueadas.length,
        !tieneRiesgoEspecifico(entrada),
        preview.suficienciaTecnica,
      ),
      preguntasActuales: preguntasActualesBasicas,
      preguntasPreventivasSugeridas: preguntasPreventivasBasicas,
      preguntasPreventivasBloqueadas: preguntasBloqueadas,
      preguntasDocumentalesActuales: contarDocumentalesActuales(preguntasActuales),
      preguntasDocumentalesPreventivas: puente.formularioPreventivo.preguntas.filter(
        (pregunta) => pregunta.metadataPreventiva.documental,
      ).length,
      aliasSemanticosPreventivos,
      diferenciasClave,
      riesgosSobredocumentacion: [],
      riesgosSubdocumentacion: [],
      advertencias,
      requiereFallbackActual: compatibilidad.valido === false || puente.riesgosDegradacion.some((riesgo) => {
        const normalizado = normalizar(riesgo);
        return normalizado.includes("compatibles");
      }),
    };

    const riesgosSobredocumentacion = detectarRiesgoSobredocumentacionComparativa(baseSinRecomendacion);
    const riesgosSubdocumentacion = detectarRiesgoSubdocumentacionComparativa({
      aliasSemanticosPreventivos,
      preguntasDocumentalesPreventivas: baseSinRecomendacion.preguntasDocumentalesPreventivas,
    });
    const comparacionSinRecomendacion = {
      ...baseSinRecomendacion,
      riesgosSobredocumentacion,
      riesgosSubdocumentacion,
    };

    return {
      ...comparacionSinRecomendacion,
      recomendacionModo: recomendarModoPreguntas(comparacionSinRecomendacion),
    };
  } catch {
    const aliasSemanticosPreventivos = construirAliasSemanticosRespuestas(respuestasParaAlias(entrada));
    return {
      formularioActualResumen: {
        totalPreguntas: 0,
        preguntasPaso1: 0,
        preguntasPaso2: 0,
        preguntasDocumentales: 0,
        modulosDetectados: [],
      },
      formularioPreventivoResumen: {
        totalPreguntas: 0,
        preguntasPaso1: 0,
        preguntasPaso2: 0,
        preguntasDocumentales: 0,
        preguntasBloqueadas: 0,
        requiereAnclaje: !tieneRiesgoEspecifico(entrada),
      },
      preguntasActuales: [],
      preguntasPreventivasSugeridas: [],
      preguntasPreventivasBloqueadas: [],
      preguntasDocumentalesActuales: 0,
      preguntasDocumentalesPreventivas: 0,
      aliasSemanticosPreventivos,
      diferenciasClave: [],
      riesgosSobredocumentacion: [],
      riesgosSubdocumentacion: [],
      recomendacionModo: "mantener_fallback_actual",
      advertencias: ["No fue posible construir la comparacion preventiva sin afectar el flujo actual."],
      requiereFallbackActual: true,
    };
  }
};

export const compararFormularioActualConPreventivo = construirComparacionSelectorPreventivo;

export const construirResumenComparativoSelector = (
  comparacion: ComparacionSelectorPreventivoV2,
) => ({
  recomendacionModo: comparacion.recomendacionModo,
  totalPreguntasActuales: comparacion.formularioActualResumen.totalPreguntas,
  totalPreguntasPreventivas: comparacion.formularioPreventivoResumen.totalPreguntas,
  riesgoSobredocumentacion: comparacion.riesgosSobredocumentacion.length > 0,
  riesgoSubdocumentacion: comparacion.riesgosSubdocumentacion.length > 0,
  requiereFallbackActual: comparacion.requiereFallbackActual,
});
