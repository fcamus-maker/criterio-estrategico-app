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
import { clasificarPreventivamentePorAtributos } from "./routerPreventivoAtributosV2";
import {
  ESQUEMAS_RESPUESTA_PREVENTIVA_V2,
} from "./esquemasRespuestaPreventivaV2";
import {
  obtenerPreguntasPlantillaOrdenadas,
  obtenerPlantillaRondaProductiva,
  validarContratoPlantillaProductiva,
  type ClaseCasoPreventivo,
  type FamiliaPreventivaProductivaId,
  type PlantillaFamiliaProductiva,
} from "./plantillasRondaProductivaV2";
import type { FamiliaTaxonomiaPreventivaId } from "./taxonomiaPreventivaV2";

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
    flujo_preventivo?: FlujoPreventivoV2;
  };
};

export type EstadoFlujoPreventivo =
  | "INICIO"
  | "RONDA_1_PENDIENTE"
  | "RONDA_1_COMPLETA"
  | "CLASIFICANDO"
  | "RONDA_2_LISTA"
  | "RONDA_2_PENDIENTE"
  | "RONDA_2_COMPLETA"
  | "RESULTADO_LISTO"
  | "FALLBACK_COMPLETO";

export type FlujoPreventivoV2 = {
  version: "preventivo_rondas_v1";
  modo: "preventivo" | "fallback_actual";
  estado: EstadoFlujoPreventivo;
  contextoFingerprint: string;
  familiaPrincipal?: string;
  familiaSecundariaCritica?: string;
  confianzaFamilia?: "alta" | "media" | "baja";
  claseCaso?: ClaseCasoPreventivo;
  ronda1Completa: boolean;
  ronda2Completa: boolean;
  requiereHallazgoSeparado?: boolean;
  idsPlantilla?: string[];
};

export type ClasificacionContextoPreventivo = {
  familiaPrincipal: FamiliaPreventivaProductivaId;
  familiaSecundariaCritica?: FamiliaPreventivaProductivaId;
  claseCaso: ClaseCasoPreventivo;
  confianza: "alta" | "media" | "baja";
  evidenciasClasificacion: string[];
  requiereHallazgoSeparado: boolean;
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
const ID_AMBITO_PRINCIPAL = "contexto_ambito_principal";
const ID_ACTIVIDAD_TAREA = "contexto_actividad_tarea";
const ID_CONDICION_ACCION_INSEGURA = "contexto_condicion_accion";
const ID_AFECTACION_ACTUAL = "contexto_afectacion_actual";
export const VERSION_FLUJO_PREVENTIVO = "preventivo_rondas_v1" as const;

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

const opcion = (label: string, value: string, score?: number) => ({ label, value, score });

const preguntaTextoRonda = (
  id: string,
  texto: string,
  objetivo: string,
  paso: 1 | 2,
): PreguntaFormularioAdaptativaV2 => ({
  id,
  modulo: "otro_indeterminado",
  texto,
  objetivo,
  paso,
  tipoRespuesta: "texto",
  opciones: [],
});

const preguntaOpcionesRonda = (
  id: string,
  texto: string,
  objetivo: string,
  paso: 1 | 2,
  opciones: PreguntaFormularioAdaptativaV2["opciones"],
): PreguntaFormularioAdaptativaV2 => ({
  id,
  modulo: "otro_indeterminado",
  texto,
  objetivo,
  paso,
  tipoRespuesta: "opciones",
  opciones,
});

const OPCIONES_AMBITO_PRINCIPAL = [
  opcion("Seguridad laboral", "seguridad_laboral", 6),
  opcion("Medio ambiente", "medio_ambiente", 5),
  opcion("Salud ocupacional", "salud_ocupacional", 5),
  opcion("Documental / cumplimiento", "documental_cumplimiento", 4),
  opcion("Más de un ámbito", "mas_de_un_ambito", 6),
  opcion("No verificable", "no_verificable", 3),
];

const OPCIONES_AFECTACION_ACTUAL = [
  opcion("Solo existe una condición de riesgo, sin lesionados", "solo_condicion_riesgo", 3),
  opcion("Existe una persona lesionada o afectada", "persona_lesionada_afectada", 10),
  opcion("Existe daño a equipo o instalación", "dano_equipo_instalacion", 6),
  opcion("Existe impacto ambiental", "impacto_ambiental", 8),
  opcion("Existe más de una afectación", "mas_de_una_afectacion", 9),
  opcion("No verificable", "no_verificable", 4),
  opcion("No aplica", "no_aplica", 0),
];

export const construirRondaContextoPreventivo = (): PreguntaFormularioAdaptativaV2[] => [
  preguntaTextoRonda(
    ID_RIESGO_ESPECIFICO,
    "Indique el riesgo específico observado.",
    "Responda en pocas palabras. Ejemplo: vidrio quebrado, trabajador sin arnés, derrame de combustible o madera con clavos.",
    1,
  ),
  preguntaOpcionesRonda(
    ID_AMBITO_PRINCIPAL,
    "¿A qué ámbito corresponde principalmente el hallazgo?",
    "Seleccione el ámbito dominante del hallazgo.",
    1,
    OPCIONES_AMBITO_PRINCIPAL,
  ),
  preguntaTextoRonda(
    ID_ACTIVIDAD_TAREA,
    "¿Qué actividad o tarea se estaba realizando?",
    "Ejemplo: trabajo en altura, instalación de canaletas, excavación, traslado de materiales, mantención eléctrica o limpieza.",
    1,
  ),
  preguntaTextoRonda(
    ID_CONDICION_ACCION_INSEGURA,
    "Describa brevemente la condición o acción insegura principal.",
    "Ejemplo: sin protección contra caídas, vidrio expuesto, equipo sin bloqueo, material obstruyendo el tránsito o sustancia sin rotulación.",
    1,
  ),
  preguntaOpcionesRonda(
    ID_AFECTACION_ACTUAL,
    "¿Existe una afectación actual o solo una condición de riesgo?",
    "Indique si ya ocurrió una lesión, daño o impacto.",
    1,
    OPCIONES_AFECTACION_ACTUAL,
  ),
];

export const obtenerPreguntasPaso1Preventivo = () => construirRondaContextoPreventivo();

const idsRonda1Preventiva = [
  ID_RIESGO_ESPECIFICO,
  ID_AMBITO_PRINCIPAL,
  ID_ACTIVIDAD_TAREA,
  ID_CONDICION_ACCION_INSEGURA,
  ID_AFECTACION_ACTUAL,
];

const respuestaContexto = (
  reporte: ReporteOrquestadorPreguntasPreventivasV2,
  respuestas: Record<string, string> = {},
  id: string,
) =>
  id === ID_RIESGO_ESPECIFICO
    ? respuestas[id] || riesgoEspecificoDesdeReporte(reporte) || ""
    : respuestas[id] || "";

export const construirContextoFingerprintPreventivo = (
  reporte: ReporteOrquestadorPreguntasPreventivasV2,
  respuestas: Record<string, string> = {},
) =>
  [
    reporte.descripcion || "",
    respuestaContexto(reporte, respuestas, ID_RIESGO_ESPECIFICO),
    respuestaContexto(reporte, respuestas, ID_AMBITO_PRINCIPAL),
    respuestaContexto(reporte, respuestas, ID_ACTIVIDAD_TAREA),
    respuestaContexto(reporte, respuestas, ID_CONDICION_ACCION_INSEGURA),
    respuestaContexto(reporte, respuestas, ID_AFECTACION_ACTUAL),
  ]
    .map(normalizar)
    .join("|");

export const ronda1PreventivaCompleta = (
  reporte: ReporteOrquestadorPreguntasPreventivasV2,
  respuestas: Record<string, string> = {},
) => idsRonda1Preventiva.every((id) => Boolean(respuestaContexto(reporte, respuestas, id).trim()));

export const validarContratoRonda1 = (preguntas: PreguntaFormularioAdaptativaV2[]) => {
  const errores: string[] = [];
  if (preguntas.length !== 5) errores.push("Ronda 1 debe tener exactamente cinco preguntas.");
  idsRonda1Preventiva.forEach((id, index) => {
    if (preguntas[index]?.id !== id) errores.push(`Ronda 1 fuera de orden en posicion ${index + 1}.`);
  });
  const texto = normalizar(preguntas.map((pregunta) => [pregunta.texto, pregunta.objetivo, ...pregunta.opciones.map((opcionItem) => opcionItem.label)].join(" ")));
  if (/\b(pts|ast|art|permiso|hds|certificacion|evidencia|cierre)\b/.test(texto)) {
    errores.push("Ronda 1 contiene preguntas productivas o documentales.");
  }
  if (texto.includes("detener") || texto.includes("aislar")) errores.push("Ronda 1 contiene pregunta de decision.");
  const preguntaAmbito = preguntas.find((pregunta) => pregunta.id === ID_AMBITO_PRINCIPAL);
  const opcionesAmbito = preguntaAmbito?.opciones.map((opcionItem) => normalizar(opcionItem.label)) || [];
  if (opcionesAmbito.some((opcionItem) => opcionItem === "si" || opcionItem === "sí" || opcionItem === "no" || opcionItem === "no aplica")) {
    errores.push("Pregunta de ambito usa opciones binarias.");
  }
  return { valido: errores.length === 0, errores };
};

const textoAnalisisDesdeEntrada = (
  reporte: ReporteOrquestadorPreguntasPreventivasV2,
  respuestas?: Record<string, string>,
) =>
  normalizar([
    reporte.descripcion,
    reporte.actividad,
    riesgoEspecificoDesdeReporte(reporte),
    respuestas?.[ID_AMBITO_PRINCIPAL],
    respuestas?.[ID_ACTIVIDAD_TAREA],
    respuestas?.[ID_CONDICION_ACCION_INSEGURA],
    respuestas?.[ID_AFECTACION_ACTUAL],
  ]);

const esCasoAltura = (texto: string) =>
  [
    "altura",
    "arnes",
    "arnés",
    "linea de vida",
    "línea de vida",
    "borde abierto",
    "borde de excavacion",
    "borde de excavación",
    "plataforma elevada",
    "andamio",
    "caida de distinto nivel",
    "caída de distinto nivel",
    "caida desde altura",
    "caída desde altura",
  ].some((termino) => texto.includes(normalizar(termino)));

const esCasoVidrio = (texto: string) =>
  ["vidrio", "ventana", "cristal", "fragmento"].some((termino) => texto.includes(termino));

const esCasoExcavacionElectrica = (texto: string) =>
  texto.includes("excavacion") &&
  (texto.includes("cable energizado") || texto.includes("energia") || texto.includes("electrico"));

const esCasoExcavacion = (texto: string) =>
  ["excavacion", "zanja", "talud", "entibacion"].some((termino) => texto.includes(termino));

const esCasoDocumentalPuro = (texto: string) =>
  texto.includes("permiso") &&
  texto.includes("firma") &&
  !["soldadura activa", "ejecutado", "ejecucion", "ejecución", "fuente de ignicion", "fuente de ignición", "material combustible"].some((termino) =>
    texto.includes(normalizar(termino)),
  );

const familiaTienePlantilla = (familiaId?: string | null): familiaId is FamiliaPreventivaProductivaId =>
  Boolean(familiaId && obtenerPlantillaRondaProductiva(familiaId as FamiliaPreventivaProductivaId));

const claseDesdeFamilia = (
  familiaId: FamiliaPreventivaProductivaId,
  texto: string,
  confianza: "alta" | "media" | "baja",
): ClaseCasoPreventivo => {
  if (confianza === "baja" || familiaId === "general_preventivo") return "general";
  if (texto.includes("lesionada") || texto.includes("accidente con lesion")) return "critico";
  if (["medio_ambiente", "sustancias_hds"].includes(familiaId)) return "ambiental";
  if (["documental_legal", "capacitacion_evidencias", "mantencion_certificacion"].includes(familiaId)) return "documental";
  if (["higiene_ocupacional", "ergonomia_manejo_manual"].includes(familiaId)) return "salud";
  if (["dano_material", "orden_aseo_housekeeping", "senalizacion_segregacion", "equipos_emergencia"].includes(familiaId)) return "simple";
  return "critico";
};

const seleccionarFamiliaPrincipal = (
  familiaRouter: FamiliaTaxonomiaPreventivaId | null,
  texto: string,
): FamiliaPreventivaProductivaId => {
  if (esCasoExcavacionElectrica(texto)) return "energia_loto_electrico";
  if (esCasoDocumentalPuro(texto)) return "documental_legal";
  if (esCasoAltura(texto)) return "trabajos_criticos";
  if (esCasoVidrio(texto)) return "dano_material";
  if (texto.includes("derrame") || texto.includes("combustible")) return "medio_ambiente";
  if (esCasoExcavacion(texto)) return "excavaciones_suelos";
  if (familiaTienePlantilla(familiaRouter)) return familiaRouter;
  return "general_preventivo";
};

export const clasificarContextoPreventivo = (
  reporte: ReporteOrquestadorPreguntasPreventivasV2,
  respuestas: Record<string, string> = {},
): ClasificacionContextoPreventivo => {
  if (!ronda1PreventivaCompleta(reporte, respuestas)) {
    return {
      familiaPrincipal: "general_preventivo",
      claseCaso: "general",
      confianza: "baja",
      evidenciasClasificacion: ["Ronda 1 incompleta."],
      requiereHallazgoSeparado: false,
    };
  }

  const texto = textoAnalisisDesdeEntrada(reporte, respuestas);
  const resultadoRouter = clasificarPreventivamentePorAtributos({
    descripcion: reporte.descripcion || "",
    actividad: respuestas[ID_ACTIVIDAD_TAREA] || reporte.actividad,
    tipoHallazgo: reporte.tipoHallazgo,
    ambitoDeclarado: respuestas[ID_AMBITO_PRINCIPAL],
    riesgoEspecificoDeclarado: respuestaContexto(reporte, respuestas, ID_RIESGO_ESPECIFICO),
    controlDeclarado: respuestas[ID_CONDICION_ACCION_INSEGURA],
    exposicionDeclarada: respuestas[ID_AFECTACION_ACTUAL],
    respuestasPrevias: respuestas,
  });
  const familiaPorRegla = seleccionarFamiliaPrincipal(resultadoRouter.familiaPrimariaId, texto);
  const tieneSenalCriticaDeterministica = [
    "trabajos_criticos",
    "medio_ambiente",
    "energia_loto_electrico",
    "excavaciones_suelos",
    "documental_legal",
  ].includes(familiaPorRegla);
  const confianza =
    resultadoRouter.confianzaClasificacion === "baja" && tieneSenalCriticaDeterministica
      ? "media"
      : resultadoRouter.confianzaClasificacion;
  const familiaPrincipal =
    confianza === "baja"
      ? "general_preventivo"
      : familiaPorRegla;
  let familiaSecundariaCritica: FamiliaPreventivaProductivaId | undefined;
  let requiereHallazgoSeparado = false;

  if (texto.includes("excavacion") && (texto.includes("cable energizado") || texto.includes("energia") || texto.includes("electrico"))) {
    familiaSecundariaCritica = familiaPrincipal === "energia_loto_electrico" ? "excavaciones_suelos" : "energia_loto_electrico";
    requiereHallazgoSeparado = true;
  } else {
    familiaSecundariaCritica = resultadoRouter.familiasSecundariasIds.find((familiaId) =>
      ["trabajos_criticos", "energia_loto_electrico", "izaje_gruas_amarre", "excavaciones_suelos"].includes(familiaId),
    );
  }

  const claseBase = claseDesdeFamilia(familiaPrincipal, texto, confianza);
  const claseCaso = requiereHallazgoSeparado ? "critico_multiple" : claseBase;

  return {
    familiaPrincipal,
    familiaSecundariaCritica,
    claseCaso,
    confianza,
    evidenciasClasificacion: resultadoRouter.razonesClasificacion.map((razon) => razon.detalle).slice(0, 6),
    requiereHallazgoSeparado,
  };
};

export const construirRondaProductivaPreventiva = (
  reporte: ReporteOrquestadorPreguntasPreventivasV2,
  respuestas?: Record<string, string>,
): PreguntaFormularioAdaptativaV2[] => {
  const clasificacion = clasificarContextoPreventivo(reporte, respuestas || {});
  const plantillaItem =
    obtenerPlantillaRondaProductiva(clasificacion.familiaPrincipal) ||
    obtenerPlantillaRondaProductiva("general_preventivo");

  if (!plantillaItem) return [];

  return obtenerPreguntasPlantillaOrdenadas(plantillaItem).map((preguntaItem) => {
    const esquema = ESQUEMAS_RESPUESTA_PREVENTIVA_V2[preguntaItem.esquemaRespuestaId];
    return {
      id: preguntaItem.id,
      modulo: "otro_indeterminado",
      texto: preguntaItem.texto,
      objetivo: preguntaItem.ayuda || "Responda según la condición observada y la verificación en terreno.",
      paso: 2,
      tipoRespuesta: "opciones",
      opciones: esquema.opciones,
    };
  });
};

export const obtenerPreguntasPaso2Preventivo = (
  reporte: ReporteOrquestadorPreguntasPreventivasV2,
  respuestas?: Record<string, string>,
) => construirRondaProductivaPreventiva(reporte, respuestas);

export const validarContratoRonda2 = (
  preguntas: PreguntaFormularioAdaptativaV2[],
  plantillaItem?: PlantillaFamiliaProductiva,
) => {
  const errores: string[] = [];
  if (preguntas.length !== 5) errores.push("Ronda 2 debe tener exactamente cinco preguntas.");
  const ids = preguntas.map((pregunta) => pregunta.id);
  if (new Set(ids).size !== ids.length) errores.push("Ronda 2 contiene preguntas duplicadas.");

  if (plantillaItem) {
    const validacionPlantilla = validarContratoPlantillaProductiva(plantillaItem);
    errores.push(...validacionPlantilla.errores);
    const idsEsperados = obtenerPreguntasPlantillaOrdenadas(plantillaItem).map((pregunta) => pregunta.id);
    idsEsperados.forEach((id, index) => {
      if (preguntas[index]?.id !== id) errores.push(`Ronda 2 fuera de orden en posicion ${index + 1}.`);
    });
  }

  for (const pregunta of preguntas) {
    const textoVisible = [pregunta.texto, pregunta.objetivo, ...pregunta.opciones.map((opcionItem) => opcionItem.label)].join(" ");
    if (contieneTextoProhibido(textoVisible)) errores.push("Ronda 2 contiene texto interno visible.");
    if (pregunta.tipoRespuesta !== "opciones" || pregunta.opciones.length === 0) {
      errores.push(`Ronda 2 contiene pregunta sin esquema cerrado: ${pregunta.id}.`);
    }
  }

  return { valido: errores.length === 0, errores };
};

export const construirFlujoPreventivoTrasRonda1 = (
  reporte: ReporteOrquestadorPreguntasPreventivasV2,
  respuestas: Record<string, string> = {},
): {
  flujo: FlujoPreventivoV2;
  clasificacion: ClasificacionContextoPreventivo;
  preguntasPaso2: PreguntaFormularioAdaptativaV2[];
  plantilla?: PlantillaFamiliaProductiva;
} => {
  const fingerprint = construirContextoFingerprintPreventivo(reporte, respuestas);
  const ronda1Completa = ronda1PreventivaCompleta(reporte, respuestas);

  if (!ronda1Completa) {
    return {
      flujo: {
        version: VERSION_FLUJO_PREVENTIVO,
        modo: "preventivo",
        estado: "RONDA_1_PENDIENTE",
        contextoFingerprint: fingerprint,
        ronda1Completa: false,
        ronda2Completa: false,
      },
      clasificacion: {
        familiaPrincipal: "general_preventivo",
        claseCaso: "general",
        confianza: "baja",
        evidenciasClasificacion: ["Ronda 1 incompleta."],
        requiereHallazgoSeparado: false,
      },
      preguntasPaso2: [],
    };
  }

  const clasificacion = clasificarContextoPreventivo(reporte, respuestas);
  const plantillaItem =
    obtenerPlantillaRondaProductiva(clasificacion.familiaPrincipal) ||
    obtenerPlantillaRondaProductiva("general_preventivo");
  const preguntasPaso2 = obtenerPreguntasPaso2Preventivo(reporte, respuestas);
  const validacion = validarContratoRonda2(preguntasPaso2, plantillaItem);
  const estado: EstadoFlujoPreventivo = validacion.valido ? "RONDA_2_LISTA" : "FALLBACK_COMPLETO";

  return {
    flujo: {
      version: VERSION_FLUJO_PREVENTIVO,
      modo: validacion.valido ? "preventivo" : "fallback_actual",
      estado,
      contextoFingerprint: fingerprint,
      familiaPrincipal: clasificacion.familiaPrincipal,
      familiaSecundariaCritica: clasificacion.familiaSecundariaCritica,
      confianzaFamilia: clasificacion.confianza,
      claseCaso: clasificacion.claseCaso,
      ronda1Completa: true,
      ronda2Completa: false,
      requiereHallazgoSeparado: clasificacion.requiereHallazgoSeparado,
      idsPlantilla: preguntasPaso2.map((pregunta) => pregunta.id),
    },
    clasificacion,
    preguntasPaso2,
    plantilla: plantillaItem,
  };
};

export const limpiarRespuestasRonda2SiCambiaContexto = (
  respuestas: Record<string, string>,
  flujoPrevio: FlujoPreventivoV2 | undefined,
  fingerprintNuevo: string,
) => {
  if (!flujoPrevio || flujoPrevio.contextoFingerprint === fingerprintNuevo) return respuestas;
  const idsRonda2 = new Set(flujoPrevio.idsPlantilla || []);
  if (idsRonda2.size === 0) return respuestas;
  return Object.fromEntries(Object.entries(respuestas).filter(([id]) => !idsRonda2.has(id)));
};

export const ronda2PreventivaCompleta = (
  preguntas: PreguntaFormularioAdaptativaV2[],
  respuestas: Record<string, string> = {},
) => preguntas.length === 5 && preguntas.every((pregunta) => respuestaValidaRondaPreventiva(respuestas[pregunta.id]));

export const respuestaValidaRondaPreventiva = (valor: unknown) => {
  if (valor === null || valor === undefined) return false;
  if (typeof valor === "string") return valor.trim().length > 0;
  return true;
};

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

    const preguntasPaso1 = obtenerPreguntasPaso1Preventivo();
    const preguntasPaso2 = obtenerPreguntasPaso2Preventivo(
      entrada.reporte,
      entrada.respuestas || entrada.reporte.evaluacion?.respuestas || {},
    );
    const preguntas = [...preguntasPaso1, ...preguntasPaso2];
    const mapeo = construirMapeoRespuestasPreventivas({
      descripcionHallazgo: entrada.reporte.descripcion,
      riesgoEspecificoDetectado: riesgoEspecificoDesdeReporte(entrada.reporte),
      respuestasPreventivas: entrada.respuestas || entrada.reporte.evaluacion?.respuestas || {},
      formularioPreventivo,
      formularioActual,
      respuestasActuales: entrada.reporte.evaluacion?.respuestas || {},
    });

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
