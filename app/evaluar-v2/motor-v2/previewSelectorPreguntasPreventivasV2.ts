import type {
  DocumentoPreventivoAplicable,
  ResultadoAplicabilidadPreventiva,
} from "./aplicabilidadPreventivaV2";
import type { ActividadObraId } from "./bibliotecaActividadesObraV2";
import {
  construirContextoPreguntasPreventivas,
  obtenerPreguntaPreventivaPorId,
  obtenerPreguntasPreventivasTipadas,
  seleccionarPreguntasPreventivas,
  type ContextoPreguntasPreventivas,
  type EntradaPreguntasPreventivas,
  type FasePreguntaPreventiva,
  type OpcionRespuestaPreventiva,
  type PreguntaPreventivaSeleccionada,
  type PreguntaPreventivaTipada,
  type TipoRespuestaPreventivaId,
} from "./preguntasPreventivasTipadasV2";
import type { ResultadoRouterPreventivo } from "./routerPreventivoAtributosV2";
import type {
  DesviacionPreventivaId,
  FamiliaTaxonomiaPreventivaId,
} from "./taxonomiaPreventivaV2";

export type EntradaPreviewPreguntasPreventivas = {
  descripcionHallazgo: string;
  riesgoEspecifico?: string;
  area?: string;
  actividad?: string;
  tipoHallazgo?: string;
  respuestasPrevias?: Record<string, unknown>;
  contextoOperacional?: Record<string, unknown>;
  maximoSugerido?: number;
};

export type PreguntaPreviewSeleccionada = {
  id: string;
  textoVisible: string;
  fasePregunta: FasePreguntaPreventiva;
  tipoRespuesta: TipoRespuestaPreventivaId;
  opciones: OpcionRespuestaPreventiva[];
  datoCapturado: string;
  obligatoria: boolean;
  aclaratoria: boolean;
  documental: boolean;
  prioridad: number;
  razonSeleccion: string;
  errorQueEvita: string[];
};

export type PreguntaPreviewBloqueada = {
  id: string;
  textoVisible: string;
  motivoBloqueo: string;
  reglaAplicabilidad: string;
  errorQueEvita: string[];
};

export type ContextoPreviewPreguntasPreventivas = {
  entrada: EntradaPreviewPreguntasPreventivas;
  contextoSelector: ContextoPreguntasPreventivas;
  preguntasCandidatas: PreguntaPreventivaTipada[];
};

export type ResultadoPreviewPreguntasPreventivas = {
  descripcionHallazgo: string;
  riesgoEspecificoUsado?: string;
  routerResultado: ResultadoRouterPreventivo;
  aplicabilidadResultado: ResultadoAplicabilidadPreventiva;
  actividadDetectada: ActividadObraId[];
  familiasPreventivas: FamiliaTaxonomiaPreventivaId[];
  desviaciones: DesviacionPreventivaId[];
  suficienciaTecnica: ResultadoRouterPreventivo["suficienciaTecnica"];
  preguntasSeleccionadas: PreguntaPreviewSeleccionada[];
  preguntasBloqueadas: PreguntaPreviewBloqueada[];
  razonesSeleccion: string[];
  razonesBloqueo: string[];
  erroresEvitados: string[];
  resumenTecnicoPreview: string;
  advertencias: string[];
};

const DOCUMENTOS_FORMALES: DocumentoPreventivoAplicable[] = [
  "procedimiento",
  "ast_art",
  "pts",
  "permiso_autorizacion",
  "matriz_riesgos",
];

const normalizar = (valor?: unknown): string => {
  if (Array.isArray(valor)) return valor.map(normalizar).join(" ");
  if (valor === null || valor === undefined) return "";
  return String(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

const unico = <T>(items: T[]) => Array.from(new Set(items));

const inferirContextoOperacionalPreview = (
  entrada: EntradaPreviewPreguntasPreventivas,
) => {
  const texto = normalizar([
    entrada.descripcionHallazgo,
    entrada.riesgoEspecifico,
    entrada.actividad,
    entrada.area,
    entrada.tipoHallazgo,
  ]);
  const esHallazgoSimple = [
    "vaso trizado",
    "goma de piso",
    "material menor",
    "limpieza simple",
    "residuo comun",
    "residuo no peligroso",
    "senaletica menor",
    "vidrio pequeno",
    "herramienta menor",
    "derrame menor de agua",
    "pintura fresca",
    "caja mal ubicada",
    "cable ordenado",
    "dano menor",
    "polvo menor",
  ].some((termino) => texto.includes(termino));

  return {
    esHallazgoSimple,
    hayTrabajoAltura: ["altura", "arnes", "plataforma", "baranda", "techumbre", "linea de vida"].some((termino) =>
      texto.includes(termino),
    ),
    hayIzaje: ["izaje", "carga suspendida", "eslinga", "grua"].some((termino) => texto.includes(termino)),
    hayExcavacion: ["excavacion", "zanja", "entibacion"].some((termino) => texto.includes(termino)),
    hayEnergiaPeligrosa: ["loto", "bloqueo", "tablero", "electrico", "energia"].some((termino) =>
      texto.includes(termino),
    ),
    haySustanciaPeligrosa: ["hds", "sustancia", "combustible", "gasolina", "residuo peligroso"].some((termino) =>
      texto.includes(termino),
    ),
    hayDerrame: texto.includes("derrame"),
    hayMaquinariaMovil: ["maquina", "maquinaria", "conduccion", "vehiculo"].some((termino) => texto.includes(termino)),
    hayControlCriticoAusente: ["sin permiso", "sin proteccion", "sin segregacion", "sin baranda", "sin bloqueo"].some(
      (termino) => texto.includes(termino),
    ),
  };
};

const entradaSelectorDesdePreview = (
  entrada: EntradaPreviewPreguntasPreventivas,
): EntradaPreguntasPreventivas => ({
  descripcionHallazgo: entrada.descripcionHallazgo,
  riesgoEspecifico: entrada.riesgoEspecifico,
  actividadDetectada: entrada.actividad,
  contextoAplicabilidad: inferirContextoOperacionalPreview(entrada),
  maximoSugerido: entrada.maximoSugerido ?? 18,
});

const convertirPreguntaSeleccionada = (
  pregunta: PreguntaPreventivaSeleccionada,
): PreguntaPreviewSeleccionada => ({
  id: pregunta.id,
  textoVisible: pregunta.texto,
  fasePregunta: pregunta.fasePregunta,
  tipoRespuesta: pregunta.tipoRespuesta,
  opciones: pregunta.opciones,
  datoCapturado: pregunta.datoCapturado,
  obligatoria: pregunta.obligatoria,
  aclaratoria: pregunta.aclaratoria,
  documental: pregunta.documental,
  prioridad: pregunta.prioridad,
  razonSeleccion: pregunta.razonSeleccion,
  errorQueEvita: pregunta.erroresEvitados,
});

const completarPreguntasPreview = (
  contexto: ContextoPreguntasPreventivas,
  seleccionadas: PreguntaPreventivaSeleccionada[],
): PreguntaPreventivaSeleccionada[] => {
  const salida = [...seleccionadas];
  const tieneAccion = salida.some((pregunta) => pregunta.fasePregunta === "accion_inmediata");
  const debeTenerAccion =
    contexto.esHallazgoSimple ||
    contexto.esTrabajoCritico ||
    contexto.aplicabilidad.requiereDetencionActividad ||
    contexto.aplicabilidad.requiereControlCritico;
  const accion = obtenerPreguntaPreventivaPorId("transversal_accion");

  if (debeTenerAccion && !tieneAccion && accion) {
    salida.push({
      ...accion,
      prioridad: 850,
      razonSeleccion: "Preview preventivo: se requiere definir accion inmediata verificable.",
      bloqueadaPorAplicabilidad: false,
    });
  }

  return salida.sort((a, b) => b.prioridad - a.prioridad || a.id.localeCompare(b.id));
};

const construirPreguntasBloqueadas = (
  contexto: ContextoPreguntasPreventivas,
  seleccionadas: PreguntaPreventivaSeleccionada[],
): PreguntaPreviewBloqueada[] => {
  const idsSeleccionados = new Set(seleccionadas.map((pregunta) => pregunta.id));
  const documentosBloqueados = new Set(contexto.documentosBloqueados);

  return obtenerPreguntasPreventivasTipadas()
    .filter((pregunta) => pregunta.documental)
    .filter((pregunta) => !idsSeleccionados.has(pregunta.id))
    .filter((pregunta) =>
      pregunta.documentosRelacionados.some((documento) => documentosBloqueados.has(documento)),
    )
    .map((pregunta) => ({
      id: pregunta.id,
      textoVisible: pregunta.texto,
      motivoBloqueo: "No corresponde solicitar este documento para el hallazgo analizado.",
      reglaAplicabilidad: contexto.esHallazgoSimple
        ? "Hallazgo simple corregible"
        : "Aplicabilidad documental no confirmada",
      errorQueEvita: pregunta.erroresEvitados,
    }));
};

const construirResumen = (
  contexto: ContextoPreguntasPreventivas,
  seleccionadas: PreguntaPreviewSeleccionada[],
  bloqueadas: PreguntaPreviewBloqueada[],
): string => {
  const familia = contexto.resultadoClasificacion.familiaPrimariaId || "sin familia principal";
  const suficiencia = contexto.resultadoClasificacion.suficienciaTecnica;
  const anclaje = contexto.riesgoEspecifico ? "con riesgo especifico informado" : "requiere anclaje del riesgo";
  return [
    `Clasificacion preventiva ${familia}`,
    `suficiencia ${suficiencia}`,
    anclaje,
    `${seleccionadas.length} preguntas seleccionadas`,
    `${bloqueadas.length} preguntas bloqueadas por aplicabilidad`,
  ].join(" · ");
};

export const construirContextoPreviewPreventivo = (
  entrada: EntradaPreviewPreguntasPreventivas,
): ContextoPreviewPreguntasPreventivas => {
  const contextoSelector = construirContextoPreguntasPreventivas(entradaSelectorDesdePreview(entrada));
  return {
    entrada,
    contextoSelector,
    preguntasCandidatas: obtenerPreguntasPreventivasTipadas(),
  };
};

export const seleccionarPreguntasPreviewPreventivo = (
  contexto: ContextoPreviewPreguntasPreventivas,
): PreguntaPreviewSeleccionada[] =>
  completarPreguntasPreview(
    contexto.contextoSelector,
    seleccionarPreguntasPreventivas(entradaSelectorDesdePreview(contexto.entrada)),
  ).map(convertirPreguntaSeleccionada);

export const construirPreviewPreguntasPreventivas = (
  entrada: EntradaPreviewPreguntasPreventivas,
): ResultadoPreviewPreguntasPreventivas => {
  const contexto = construirContextoPreviewPreventivo(entrada);
  const seleccionadasInternas = completarPreguntasPreview(
    contexto.contextoSelector,
    seleccionarPreguntasPreventivas(entradaSelectorDesdePreview(entrada)),
  );
  const preguntasSeleccionadas = seleccionadasInternas.map(convertirPreguntaSeleccionada);
  const preguntasBloqueadas = construirPreguntasBloqueadas(contexto.contextoSelector, seleccionadasInternas);
  const familiasPreventivas = unico(
    [
      contexto.contextoSelector.resultadoClasificacion.familiaPrimariaId,
      ...contexto.contextoSelector.resultadoClasificacion.familiasSecundariasIds,
    ].filter(Boolean),
  ) as FamiliaTaxonomiaPreventivaId[];
  const razonesSeleccion = unico(preguntasSeleccionadas.map((pregunta) => pregunta.razonSeleccion));
  const razonesBloqueo = unico(preguntasBloqueadas.map((pregunta) => pregunta.motivoBloqueo));
  const erroresEvitados = unico([
    ...preguntasSeleccionadas.flatMap((pregunta) => pregunta.errorQueEvita),
    ...preguntasBloqueadas.flatMap((pregunta) => pregunta.errorQueEvita),
    ...contexto.contextoSelector.resultadoClasificacion.erroresEvitar,
  ]);
  const advertencias = [
    contexto.contextoSelector.requiereAnclajeRiesgo
      ? "Se requiere precisar el riesgo especifico antes de cerrar la seleccion."
      : "",
    contexto.contextoSelector.requiereAclaracion
      ? "La informacion disponible requiere preguntas de aclaracion."
      : "",
    contexto.contextoSelector.aplicabilidad.riesgoSobredocumentacion
      ? "Existe riesgo de sobredocumentar si se ignora la aplicabilidad preventiva."
      : "",
    contexto.contextoSelector.aplicabilidad.riesgoSubdocumentacion
      ? "Existe riesgo de subdocumentar controles criticos."
      : "",
  ].filter(Boolean);

  return {
    descripcionHallazgo: entrada.descripcionHallazgo,
    riesgoEspecificoUsado: entrada.riesgoEspecifico,
    routerResultado: contexto.contextoSelector.resultadoClasificacion,
    aplicabilidadResultado: contexto.contextoSelector.aplicabilidad,
    actividadDetectada: contexto.contextoSelector.actividadesDetectadas,
    familiasPreventivas,
    desviaciones: contexto.contextoSelector.resultadoClasificacion.desviacionesIds,
    suficienciaTecnica: contexto.contextoSelector.resultadoClasificacion.suficienciaTecnica,
    preguntasSeleccionadas,
    preguntasBloqueadas,
    razonesSeleccion,
    razonesBloqueo,
    erroresEvitados,
    resumenTecnicoPreview: construirResumen(contexto.contextoSelector, preguntasSeleccionadas, preguntasBloqueadas),
    advertencias,
  };
};

export const explicarSeleccionPreguntas = (
  preview: ResultadoPreviewPreguntasPreventivas,
): string[] => [
  preview.riesgoEspecificoUsado
    ? `Se uso como ancla tecnica: ${preview.riesgoEspecificoUsado}.`
    : "Se debe solicitar el riesgo especifico como primera pregunta.",
  `Familias preventivas consideradas: ${preview.familiasPreventivas.join(", ") || "no verificable"}.`,
  `Desviaciones consideradas: ${preview.desviaciones.join(", ") || "no verificable"}.`,
  `Suficiencia tecnica: ${preview.suficienciaTecnica}.`,
  `Preguntas seleccionadas: ${preview.preguntasSeleccionadas.length}.`,
  `Preguntas bloqueadas: ${preview.preguntasBloqueadas.length}.`,
];

export const obtenerResumenPreviewPreguntas = (
  preview: ResultadoPreviewPreguntasPreventivas,
) => ({
  totalPreguntasSeleccionadas: preview.preguntasSeleccionadas.length,
  totalPreguntasBloqueadas: preview.preguntasBloqueadas.length,
  totalDocumentalesSeleccionadas: preview.preguntasSeleccionadas.filter((pregunta) => pregunta.documental).length,
  totalAclaratorias: preview.preguntasSeleccionadas.filter((pregunta) => pregunta.aclaratoria).length,
  totalObligatorias: preview.preguntasSeleccionadas.filter((pregunta) => pregunta.obligatoria).length,
  pideAnclaje: preview.preguntasSeleccionadas.some((pregunta) => pregunta.fasePregunta === "anclaje_riesgo"),
  documentosSeleccionados: unico(
    preview.preguntasSeleccionadas.flatMap((pregunta) =>
      pregunta.documental ? pregunta.datoCapturado.replace("documento_", "") : [],
    ),
  ),
  documentosBloqueados: unico(
    preview.preguntasBloqueadas.flatMap((pregunta) => {
      const texto = normalizar(pregunta.id);
      return DOCUMENTOS_FORMALES.filter((documento) => texto.includes(documento));
    }),
  ),
});
