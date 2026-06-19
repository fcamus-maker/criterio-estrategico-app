import type { DocumentoPreventivoAplicable } from "./aplicabilidadPreventivaV2";
import {
  obtenerFormularioAdaptativoV2,
  type PreguntaFormularioAdaptativaV2,
  type ReporteFormularioAdaptativoV2,
} from "./formularioAdaptativoV2";
import {
  construirPreviewPreguntasPreventivas,
  type EntradaPreviewPreguntasPreventivas,
  type PreguntaPreviewSeleccionada,
} from "./previewSelectorPreguntasPreventivasV2";
import {
  obtenerPreguntaPreventivaPorId,
  type FasePreguntaPreventiva,
  type OpcionRespuestaPreventiva,
  type PreguntaPreventivaSeleccionada,
  type PreguntaPreventivaTipada,
  type TipoRespuestaPreventivaId,
} from "./preguntasPreventivasTipadasV2";

export type OpcionFormularioPreventivoPuente = {
  label: string;
  value: string;
  score?: number;
  idPreventivo?: string;
  textoPreventivo?: string;
};

export type PreguntaFormularioPreventivoPuente = {
  id: string;
  texto: string;
  opciones: OpcionFormularioPreventivoPuente[];
  paso: 1 | 2;
  tipo: "texto" | "opciones";
  requerida: boolean;
  ayuda?: string;
  fasePregunta: FasePreguntaPreventiva;
  tipoRespuesta: TipoRespuestaPreventivaId;
  datoCapturado: string;
  origenPreventivo: true;
  razonSeleccion?: string;
  metadataPreventiva: {
    obligatoria: boolean;
    aclaratoria: boolean;
    documental: boolean;
    prioridad: number;
    erroresEvitados: string[];
    documentosRelacionados: DocumentoPreventivoAplicable[];
    familiasPreventivas: string[];
    desviacionesPreventivas: string[];
    actividadesObra: string[];
  };
};

export type FormularioPreventivoPuente = {
  preguntas: PreguntaFormularioPreventivoPuente[];
  advertencias: string[];
  origen: "evaluacion_preventiva";
};

export type AliasSemanticosRespuestasPreventivas = {
  riesgo_especifico_detectado?: string;
  ambito_principal?: string;
  tipo_desviacion?: string;
  exposicion_detectada?: string;
  consecuencia_probable?: string;
  control_faltante?: string;
  accion_inmediata?: string;
  requiere_documentacion_habilitante?: boolean;
  requiere_ast_art?: boolean;
  requiere_pts?: boolean;
  requiere_permiso?: boolean;
  requiere_matriz?: boolean;
  requiere_hds?: boolean;
  requiere_certificacion_mantencion?: boolean;
  requiere_detencion?: boolean;
  requiere_evidencia_cierre?: boolean;
  requiere_revision_tecnica?: boolean;
  respuestas_originales: Record<string, string>;
  documentos_requeridos: DocumentoPreventivoAplicable[];
};

export type EntradaEvaluacionSugeridaPreventiva = {
  riesgoEspecificoDetectado?: string;
  exposicionPersonas?: "directa" | "potencial" | "sin_exposicion";
  consecuencia?: "grave" | "moderada" | "leve";
  controlesExistentes?: "suficientes" | "parciales" | "inexistentes";
  accionInmediata?: string;
  requiereDocumentacionHabilitante: boolean;
  documentosRequeridos: DocumentoPreventivoAplicable[];
  requiereDetencion: boolean;
  requiereRevisionTecnica: boolean;
  evidenciaCierre?: "suficiente" | "parcial" | "insuficiente";
};

export type ResultadoPuentePreguntasPreventivas = {
  formularioPreventivo: FormularioPreventivoPuente;
  preguntasPaso1: PreguntaFormularioPreventivoPuente[];
  preguntasPaso2: PreguntaFormularioPreventivoPuente[];
  aliasSemanticos: AliasSemanticosRespuestasPreventivas;
  entradaEvaluacionSugerida: EntradaEvaluacionSugeridaPreventiva;
  advertenciasCompatibilidad: string[];
  riesgosDegradacion: string[];
  requiereFallbackActual: boolean;
};

export type ComparacionFormularioActualVsPreventivo = {
  totalPreguntasActuales: number;
  totalPreguntasPreventivas: number;
  preguntasActuales: Array<{ id: string; texto: string; paso: number }>;
  preguntasPreventivas: Array<{ id: string; texto: string; paso: number; tipoRespuesta: string }>;
  preguntasBloqueadasPorAplicabilidad: Array<{ id: string; texto: string; motivo: string }>;
  documentalesActuales: number;
  documentalesPreventivas: number;
  riesgoSobredocumentacion: boolean;
  riesgoSubdocumentacion: boolean;
  diferenciaEnfoqueTecnico: string;
  recomendacion: "actual" | "preventivo" | "requiere_revision";
};

export type ResultadoCompatibilidadFormularioPreventivo = {
  valido: boolean;
  errores: string[];
  advertencias: string[];
  preguntasSinFormatoVisual: number;
  opcionesIncompatibles: number;
  textosProhibidos: number;
};

type PreguntaConvertible =
  | PreguntaPreviewSeleccionada
  | PreguntaPreventivaSeleccionada
  | PreguntaPreventivaTipada;

const FASES_PASO_1: FasePreguntaPreventiva[] = [
  "anclaje_riesgo",
  "aclaracion_inicial",
  "clasificacion_preventiva",
  "acto_condicion",
  "exposicion",
  "consecuencia",
];

const DOCUMENTOS_HABILITANTES: DocumentoPreventivoAplicable[] = [
  "procedimiento",
  "ast_art",
  "pts",
  "permiso_autorizacion",
  "matriz_riesgos",
  "bloqueo_loto",
];

const ID_PREGUNTA_DOCUMENTAL: Record<DocumentoPreventivoAplicable, string> = {
  procedimiento: "documental_procedimiento_1",
  ast_art: "documental_ast_art_2",
  pts: "documental_pts_3",
  permiso_autorizacion: "documental_permiso_autorizacion_4",
  matriz_riesgos: "documental_matriz_riesgos_5",
  charla_difusion: "documental_charla_difusion_6",
  hds_sds: "documental_hds_sds_7",
  certificacion_mantencion: "documental_certificacion_mantencion_8",
  inspeccion: "documental_inspeccion_9",
  evidencia_registro: "documental_evidencia_registro_10",
  senalizacion_segregacion: "documental_senalizacion_segregacion_11",
  retiro_inmediato: "documental_retiro_inmediato_12",
  bloqueo_loto: "documental_bloqueo_loto_13",
  detencion_actividad: "documental_detencion_actividad_14",
  control_ambiental: "documental_control_ambiental_15",
};

const TEXTOS_PROHIBIDOS_VISIBLES = [
  "Motor V2",
  "Motor V3",
  "router",
  "taxonomia",
  "biblioteca",
  "base tipada",
  "fallback",
  "modo demo",
  "debug",
  "score",
  "preview",
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

const textoPregunta = (pregunta: PreguntaConvertible): string =>
  "textoVisible" in pregunta ? pregunta.textoVisible : pregunta.texto;

const ayudaPregunta = (pregunta: PreguntaConvertible): string | undefined =>
  "ayuda" in pregunta ? pregunta.ayuda : undefined;

const razonPregunta = (pregunta: PreguntaConvertible): string | undefined =>
  "razonSeleccion" in pregunta ? pregunta.razonSeleccion : undefined;

const erroresPregunta = (pregunta: PreguntaConvertible): string[] => {
  if ("errorQueEvita" in pregunta) return pregunta.errorQueEvita;
  return pregunta.erroresEvitados;
};

const prioridadPregunta = (pregunta: PreguntaConvertible): number =>
  "prioridad" in pregunta ? pregunta.prioridad : 0;

const preguntaBasePorId = (pregunta: PreguntaConvertible): PreguntaPreventivaTipada | undefined =>
  obtenerPreguntaPreventivaPorId(pregunta.id);

const documentosPregunta = (pregunta: PreguntaConvertible): DocumentoPreventivoAplicable[] =>
  "documentosRelacionados" in pregunta
    ? pregunta.documentosRelacionados
    : preguntaBasePorId(pregunta)?.documentosRelacionados || [];

const familiasPregunta = (pregunta: PreguntaConvertible): string[] =>
  "familiasPreventivas" in pregunta
    ? pregunta.familiasPreventivas
    : preguntaBasePorId(pregunta)?.familiasPreventivas || [];

const desviacionesPregunta = (pregunta: PreguntaConvertible): string[] =>
  "desviacionesPreventivas" in pregunta
    ? pregunta.desviacionesPreventivas
    : preguntaBasePorId(pregunta)?.desviacionesPreventivas || [];

const actividadesPregunta = (pregunta: PreguntaConvertible): string[] =>
  "actividadesObra" in pregunta ? pregunta.actividadesObra : preguntaBasePorId(pregunta)?.actividadesObra || [];

const convertirOpciones = (
  opciones: OpcionRespuestaPreventiva[] | undefined,
): OpcionFormularioPreventivoPuente[] =>
  (opciones || []).map((opcion) => ({
    label: opcion.texto,
    value: opcion.id,
    idPreventivo: opcion.id,
    textoPreventivo: opcion.texto,
  }));

const respuestaComoTexto = (idPregunta: string, valor: string): string => {
  const pregunta = obtenerPreguntaPreventivaPorId(idPregunta);
  const opcion = pregunta?.opciones.find((item) => item.id === valor);
  return opcion?.texto || valor;
};

const respuestaIndicaRequerimiento = (texto: string): boolean => {
  const valor = normalizar(texto);
  return (
    valor.includes("requerido") ||
    valor.includes("no cumple") ||
    valor.includes("no existe") ||
    valor.includes("sin ") ||
    valor.includes("vencido") ||
    valor.includes("deteriorado") ||
    valor.includes("detener") ||
    valor.includes("bloquear") ||
    valor.includes("regularizar")
  );
};

const respuestaIndicaNoAplica = (texto: string): boolean => {
  const valor = normalizar(texto);
  return valor.includes("no aplica") || valor.includes("no corresponde");
};

const unica = <T>(items: T[]): T[] => Array.from(new Set(items));

const contienePalabra = (texto: string, palabra: string): boolean =>
  new RegExp(`(^|[^a-z0-9])${palabra}([^a-z0-9]|$)`).test(texto);

const inferirDocumentosCompatibilidad = (entrada: EntradaPreviewPreguntasPreventivas): DocumentoPreventivoAplicable[] => {
  const texto = normalizar([
    entrada.descripcionHallazgo,
    entrada.riesgoEspecifico,
    entrada.actividad,
    entrada.area,
    entrada.tipoHallazgo,
  ]);
  const documentos: DocumentoPreventivoAplicable[] = [];

  const agregar = (...items: DocumentoPreventivoAplicable[]) => documentos.push(...items);

  if (texto.includes("arnes") || texto.includes("altura") || texto.includes("techumbre") || texto.includes("plataforma")) {
    agregar("pts", "matriz_riesgos");
  }
  if (texto.includes("techumbre") || texto.includes("sin arnes")) agregar("permiso_autorizacion");
  if (texto.includes("trabajo en caliente")) agregar("permiso_autorizacion", "pts");
  if (texto.includes("loto") || texto.includes("bloqueo") || texto.includes("intervenir equipo")) {
    agregar("bloqueo_loto", "procedimiento");
  }
  if (texto.includes("tablero") || texto.includes("electrico") || texto.includes("electricidad")) {
    agregar("bloqueo_loto", "procedimiento");
  }
  if (texto.includes("excavacion") || texto.includes("zanja") || texto.includes("entibacion")) {
    agregar("pts", "permiso_autorizacion");
  }
  if (texto.includes("sin proteccion perimetral") || texto.includes("sin segregacion") || texto.includes("sin delimitacion")) {
    agregar("senalizacion_segregacion");
  }
  if (texto.includes("izaje") || texto.includes("carga suspendida") || texto.includes("grua")) {
    agregar("permiso_autorizacion");
  }
  if (texto.includes("viento")) agregar("matriz_riesgos");
  if (texto.includes("gasolina") || texto.includes("sustancia") || texto.includes("hds")) agregar("hds_sds");
  if (texto.includes("derrame") || texto.includes("residuo peligroso") || texto.includes("combustible")) {
    agregar("hds_sds", "control_ambiental");
  }
  if (texto.includes("matriz")) agregar("matriz_riesgos");
  if (texto.includes("pts")) agregar("pts");
  if (contienePalabra(texto, "ast") || contienePalabra(texto, "art")) agregar("ast_art", "matriz_riesgos");
  if (texto.includes("permiso") || texto.includes("autorizacion") || texto.includes("zona restringida")) {
    agregar("permiso_autorizacion");
  }
  if (
    texto.includes("certificacion") ||
    texto.includes("mantencion") ||
    texto.includes("eslinga") ||
    texto.includes("neumatico") ||
    texto.includes("parabrisas")
  ) {
    agregar("certificacion_mantencion", "inspeccion");
  }
  if (
    texto.includes("partes moviles") ||
    texto.includes("enchufe") ||
    texto.includes("herramienta electrica") ||
    texto.includes("calzado")
  ) {
    agregar("inspeccion");
  }
  if (texto.includes("conduccion") || texto.includes("montacarga") || texto.includes("peatones")) {
    agregar("procedimiento", "matriz_riesgos");
  }
  if (texto.includes("demolicion")) agregar("pts", "senalizacion_segregacion");
  if (texto.includes("espacio confinado")) agregar("pts", "permiso_autorizacion");
  if (texto.includes("deslizamiento")) agregar("matriz_riesgos", "detencion_actividad");
  if (texto.includes("linea de fuego")) agregar("procedimiento", "matriz_riesgos");
  if (texto.includes("charla") || texto.includes("difund")) agregar("charla_difusion");
  if (texto.includes("sin firma") || texto.includes("evidencia")) agregar("evidencia_registro");

  return unica(documentos);
};

const esHallazgoSimpleCompatibilidad = (entrada: EntradaPreviewPreguntasPreventivas): boolean => {
  const texto = normalizar([entrada.descripcionHallazgo, entrada.riesgoEspecifico]);
  return [
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
    "elemento suelto",
    "envase vacio",
    "aviso caido",
    "restos menores",
    "gota de agua",
    "protector plastico",
    "separador reubicado",
    "cinta vieja",
    "etiqueta menor",
    "funda rota",
  ].some((termino) => texto.includes(termino));
};

const completarPreguntasDocumentalesCompatibilidad = (
  preguntas: PreguntaPreviewSeleccionada[],
  entrada: EntradaPreviewPreguntasPreventivas,
): PreguntaConvertible[] => {
  const hallazgoSimple = esHallazgoSimpleCompatibilidad(entrada);
  const salida: PreguntaConvertible[] = hallazgoSimple
    ? preguntas.filter(
        (pregunta) => documentosPregunta(pregunta).every((documento) => !DOCUMENTOS_HABILITANTES.includes(documento)),
      )
    : [...preguntas];
  const ids = new Set(salida.map((pregunta) => pregunta.id));
  const documentosExistentes = new Set(salida.flatMap((pregunta) => documentosPregunta(pregunta)));

  for (const documento of inferirDocumentosCompatibilidad(entrada)) {
    if (documentosExistentes.has(documento)) continue;
    const pregunta = obtenerPreguntaPreventivaPorId(ID_PREGUNTA_DOCUMENTAL[documento]);
    if (!pregunta || ids.has(pregunta.id)) continue;
    salida.push({
      ...pregunta,
      razonSeleccion: "Documento o control requerido por compatibilidad preventiva.",
      bloqueadaPorAplicabilidad: false,
    });
    ids.add(pregunta.id);
    documentosExistentes.add(documento);
  }

  return salida;
};

const ordenarPreguntas = <T extends PreguntaConvertible>(preguntas: T[]): T[] =>
  [...preguntas].sort((a, b) => {
    const faseA = FASES_PASO_1.includes(a.fasePregunta) ? 0 : 1;
    const faseB = FASES_PASO_1.includes(b.fasePregunta) ? 0 : 1;
    if (faseA !== faseB) return faseA - faseB;
    return prioridadPregunta(b) - prioridadPregunta(a) || a.id.localeCompare(b.id);
  });

export const convertirPreguntaTipadaAFormatoVisual = (
  pregunta: PreguntaConvertible,
  paso: 1 | 2,
): PreguntaFormularioPreventivoPuente => {
  const opciones = convertirOpciones(pregunta.opciones);

  return {
    id: pregunta.id,
    texto: textoPregunta(pregunta),
    opciones,
    paso,
    tipo: pregunta.tipoRespuesta === "texto_breve" ? "texto" : "opciones",
    requerida: pregunta.obligatoria || pregunta.aclaratoria,
    ayuda: ayudaPregunta(pregunta),
    fasePregunta: pregunta.fasePregunta,
    tipoRespuesta: pregunta.tipoRespuesta,
    datoCapturado: pregunta.datoCapturado,
    origenPreventivo: true,
    razonSeleccion: razonPregunta(pregunta),
    metadataPreventiva: {
      obligatoria: pregunta.obligatoria,
      aclaratoria: pregunta.aclaratoria,
      documental: pregunta.documental,
      prioridad: prioridadPregunta(pregunta),
      erroresEvitados: erroresPregunta(pregunta),
      documentosRelacionados: documentosPregunta(pregunta),
      familiasPreventivas: familiasPregunta(pregunta),
      desviacionesPreventivas: desviacionesPregunta(pregunta),
      actividadesObra: actividadesPregunta(pregunta),
    },
  };
};

export const dividirPreguntasPreventivasEnPasos = (
  preguntas: PreguntaConvertible[],
): {
  paso1: PreguntaConvertible[];
  paso2: PreguntaConvertible[];
  advertencias: string[];
} => {
  const ordenadas = ordenarPreguntas(preguntas);
  const paso1: PreguntaConvertible[] = [];
  const paso2: PreguntaConvertible[] = [];

  for (const pregunta of ordenadas) {
    if (FASES_PASO_1.includes(pregunta.fasePregunta)) {
      paso1.push(pregunta);
    } else {
      paso2.push(pregunta);
    }
  }

  const indiceAnclaje = paso1.findIndex((pregunta) => pregunta.fasePregunta === "anclaje_riesgo");
  if (indiceAnclaje > 0) {
    const [anclaje] = paso1.splice(indiceAnclaje, 1);
    paso1.unshift(anclaje);
  }

  while (paso1.length > 7) {
    const candidata = [...paso1]
      .reverse()
      .find((pregunta) => !pregunta.obligatoria && pregunta.fasePregunta !== "anclaje_riesgo");
    if (!candidata) break;
    paso1.splice(paso1.indexOf(candidata), 1);
    paso2.unshift(candidata);
  }

  const advertencias: string[] = [];
  if (paso1.length > 7) {
    advertencias.push("Paso 1 queda extenso para uso movil; revisar priorizacion antes de activar.");
  }
  if (paso2.length > 9) {
    advertencias.push("Paso 2 queda extenso para uso movil; revisar priorizacion antes de activar.");
  }
  if (preguntas.length > 14) {
    advertencias.push("La seleccion preventiva supera el volumen recomendado para una evaluacion en terreno.");
  }

  return { paso1, paso2, advertencias };
};

export const extraerRiesgoEspecificoDetectado = (
  respuestas: Record<string, string>,
): string | undefined => {
  const directo = respuestas.transversal_anclaje_riesgo_especifico || respuestas.riesgo_especifico_detectado;
  const limpio = directo?.trim();
  return limpio || undefined;
};

export const construirAliasSemanticosRespuestas = (
  respuestas: Record<string, string>,
): AliasSemanticosRespuestasPreventivas => {
  const alias: AliasSemanticosRespuestasPreventivas = {
    respuestas_originales: { ...respuestas },
    documentos_requeridos: [],
  };

  for (const [idPregunta, valor] of Object.entries(respuestas)) {
    const pregunta = obtenerPreguntaPreventivaPorId(idPregunta);
    const textoRespuesta = respuestaComoTexto(idPregunta, valor);
    const textoNormalizado = normalizar(textoRespuesta);

    if (!pregunta) {
      if (idPregunta === "riesgo_especifico_detectado") alias.riesgo_especifico_detectado = valor;
      continue;
    }

    if (pregunta.datoCapturado === "riesgo_especifico") {
      alias.riesgo_especifico_detectado = valor;
    }
    if (pregunta.tipoRespuesta === "ambito_general") alias.ambito_principal = textoRespuesta;
    if (pregunta.tipoRespuesta === "acto_condicion_ambas") alias.tipo_desviacion = textoRespuesta;
    if (pregunta.tipoRespuesta === "exposicion") alias.exposicion_detectada = textoRespuesta;
    if (pregunta.tipoRespuesta === "consecuencia_probable") alias.consecuencia_probable = textoRespuesta;
    if (pregunta.tipoRespuesta === "control_existente") alias.control_faltante = textoRespuesta;
    if (pregunta.tipoRespuesta === "accion_inmediata") alias.accion_inmediata = textoRespuesta;
    if (pregunta.tipoRespuesta === "evidencia") alias.requiere_evidencia_cierre = textoNormalizado !== "evidencia suficiente";
    if (pregunta.fasePregunta === "revision_tecnica") alias.requiere_revision_tecnica = true;

    const requiere = respuestaIndicaRequerimiento(textoRespuesta) && !respuestaIndicaNoAplica(textoRespuesta);
    if (requiere || pregunta.documental) {
      alias.documentos_requeridos.push(...pregunta.documentosRelacionados);
    }

    if (textoNormalizado.includes("detener actividad")) alias.requiere_detencion = true;
    if (textoNormalizado.includes("revision tecnica")) alias.requiere_revision_tecnica = true;
  }

  alias.documentos_requeridos = unica(alias.documentos_requeridos);
  alias.requiere_documentacion_habilitante = alias.documentos_requeridos.some((documento) =>
    DOCUMENTOS_HABILITANTES.includes(documento),
  );
  alias.requiere_ast_art = alias.documentos_requeridos.includes("ast_art");
  alias.requiere_pts = alias.documentos_requeridos.includes("pts");
  alias.requiere_permiso = alias.documentos_requeridos.includes("permiso_autorizacion");
  alias.requiere_matriz = alias.documentos_requeridos.includes("matriz_riesgos");
  alias.requiere_hds = alias.documentos_requeridos.includes("hds_sds");
  alias.requiere_certificacion_mantencion = alias.documentos_requeridos.includes("certificacion_mantencion");
  alias.requiere_detencion =
    alias.requiere_detencion || alias.documentos_requeridos.includes("detencion_actividad");
  alias.requiere_evidencia_cierre =
    alias.requiere_evidencia_cierre || alias.documentos_requeridos.includes("evidencia_registro");
  alias.riesgo_especifico_detectado = alias.riesgo_especifico_detectado || extraerRiesgoEspecificoDetectado(respuestas);

  return alias;
};

export const construirEntradaEvaluacionDesdeRespuestasTipadas = (
  respuestas: Record<string, string>,
  contexto?: Partial<AliasSemanticosRespuestasPreventivas>,
): EntradaEvaluacionSugeridaPreventiva => {
  const alias = { ...construirAliasSemanticosRespuestas(respuestas), ...contexto };
  const exposicionNormalizada = normalizar(alias.exposicion_detectada);
  const consecuenciaNormalizada = normalizar(alias.consecuencia_probable);
  const controlNormalizado = normalizar(alias.control_faltante);
  const evidenciaNormalizada = normalizar(respuestas.evidencia || alias.requiere_evidencia_cierre);

  return {
    riesgoEspecificoDetectado: alias.riesgo_especifico_detectado,
    exposicionPersonas: exposicionNormalizada.includes("trabajador") || exposicionNormalizada.includes("tercero")
      ? "directa"
      : exposicionNormalizada.includes("no verificable")
        ? undefined
        : exposicionNormalizada
          ? "potencial"
          : undefined,
    consecuencia: consecuenciaNormalizada.includes("lesion") || consecuenciaNormalizada.includes("mas de una")
      ? "grave"
      : consecuenciaNormalizada.includes("dano") || consecuenciaNormalizada.includes("ambiental")
        ? "moderada"
        : consecuenciaNormalizada
          ? "leve"
          : undefined,
    controlesExistentes: controlNormalizado.includes("no existe")
      ? "inexistentes"
      : controlNormalizado.includes("parcial")
        ? "parciales"
        : controlNormalizado.includes("suficiente")
          ? "suficientes"
          : undefined,
    accionInmediata: alias.accion_inmediata,
    requiereDocumentacionHabilitante: Boolean(alias.requiere_documentacion_habilitante),
    documentosRequeridos: alias.documentos_requeridos,
    requiereDetencion: Boolean(alias.requiere_detencion),
    requiereRevisionTecnica: Boolean(alias.requiere_revision_tecnica),
    evidenciaCierre: evidenciaNormalizada.includes("sin evidencia")
      ? "insuficiente"
      : evidenciaNormalizada.includes("parcial")
        ? "parcial"
        : evidenciaNormalizada.includes("suficiente")
          ? "suficiente"
          : undefined,
  };
};

export const validarCompatibilidadFormularioPreventivo = (
  formulario: FormularioPreventivoPuente,
): ResultadoCompatibilidadFormularioPreventivo => {
  const errores: string[] = [];
  const advertencias: string[] = [];
  let preguntasSinFormatoVisual = 0;
  let opcionesIncompatibles = 0;
  let textosProhibidos = 0;

  for (const pregunta of formulario.preguntas) {
    const textoVisible = [pregunta.texto, pregunta.ayuda, ...pregunta.opciones.map((opcion) => opcion.label)].join(" ");
    const contieneTextoProhibido = TEXTOS_PROHIBIDOS_VISIBLES.some((texto) =>
      normalizar(textoVisible).includes(normalizar(texto)),
    );

    if (!pregunta.id || !pregunta.texto || !pregunta.paso || !pregunta.tipo || !pregunta.tipoRespuesta) {
      preguntasSinFormatoVisual += 1;
      errores.push(`Pregunta sin formato visual completo: ${pregunta.id || "sin id"}.`);
    }
    if (pregunta.tipo === "opciones" && pregunta.opciones.length === 0) {
      opcionesIncompatibles += 1;
      errores.push(`Pregunta sin opciones compatibles: ${pregunta.id}.`);
    }
    if (pregunta.tipo === "texto" && pregunta.opciones.length > 0) {
      opcionesIncompatibles += 1;
      errores.push(`Pregunta de texto con opciones: ${pregunta.id}.`);
    }
    if (contieneTextoProhibido) {
      textosProhibidos += 1;
      errores.push(`Texto interno visible detectado: ${pregunta.id}.`);
    }
  }

  const paso1 = formulario.preguntas.filter((pregunta) => pregunta.paso === 1).length;
  const paso2 = formulario.preguntas.filter((pregunta) => pregunta.paso === 2).length;
  if (paso1 > 7) advertencias.push("Paso 1 tiene mas preguntas de las recomendadas para terreno.");
  if (paso2 > 9) advertencias.push("Paso 2 tiene mas preguntas de las recomendadas para terreno.");

  return {
    valido: errores.length === 0,
    errores,
    advertencias,
    preguntasSinFormatoVisual,
    opcionesIncompatibles,
    textosProhibidos,
  };
};

export const construirFormularioPreventivoPuente = (
  entrada: EntradaPreviewPreguntasPreventivas,
): ResultadoPuentePreguntasPreventivas => {
  const preview = construirPreviewPreguntasPreventivas(entrada);
  const preguntasCompatibles = completarPreguntasDocumentalesCompatibilidad(preview.preguntasSeleccionadas, entrada);
  const division = dividirPreguntasPreventivasEnPasos(preguntasCompatibles);
  const preguntasPaso1 = division.paso1.map((pregunta) => convertirPreguntaTipadaAFormatoVisual(pregunta, 1));
  const preguntasPaso2 = division.paso2.map((pregunta) => convertirPreguntaTipadaAFormatoVisual(pregunta, 2));
  const formularioPreventivo: FormularioPreventivoPuente = {
    preguntas: [...preguntasPaso1, ...preguntasPaso2],
    advertencias: [...division.advertencias, ...preview.advertencias],
    origen: "evaluacion_preventiva",
  };
  const aliasSemanticos = construirAliasSemanticosRespuestas({});
  const entradaEvaluacionSugerida = construirEntradaEvaluacionDesdeRespuestasTipadas({});
  const compatibilidad = validarCompatibilidadFormularioPreventivo(formularioPreventivo);
  const riesgosDegradacion: string[] = [];

  if (preview.preguntasSeleccionadas.some((pregunta) => pregunta.fasePregunta === "anclaje_riesgo")) {
    riesgosDegradacion.push("Falta precisar el riesgo especifico antes de evaluar criticidad con mayor certeza.");
  }
  if (preview.suficienciaTecnica === "insuficiente") {
    riesgosDegradacion.push("La informacion inicial es insuficiente; mantener evaluacion actual como respaldo.");
  }
  if (!compatibilidad.valido) {
    riesgosDegradacion.push("Existen preguntas no compatibles con el formato visual actual.");
  }

  return {
    formularioPreventivo,
    preguntasPaso1,
    preguntasPaso2,
    aliasSemanticos,
    entradaEvaluacionSugerida,
    advertenciasCompatibilidad: [...formularioPreventivo.advertencias, ...compatibilidad.advertencias],
    riesgosDegradacion,
    requiereFallbackActual: riesgosDegradacion.length > 0,
  };
};

const preguntaActualBasica = (pregunta: PreguntaFormularioAdaptativaV2) => ({
  id: pregunta.id,
  texto: pregunta.texto,
  paso: pregunta.paso,
});

export const compararFormularioActualVsPreventivo = (
  entrada: EntradaPreviewPreguntasPreventivas & Partial<ReporteFormularioAdaptativoV2>,
): ComparacionFormularioActualVsPreventivo => {
  const reporteActual: ReporteFormularioAdaptativoV2 = {
    descripcion: entrada.descripcionHallazgo || entrada.descripcion || "",
    area: entrada.area || "",
    actividad: entrada.actividad || "",
    tipoHallazgo: entrada.tipoHallazgo,
    evaluacion: { respuestas: {} },
  };
  const formularioActual = obtenerFormularioAdaptativoV2(reporteActual);
  const preview = construirPreviewPreguntasPreventivas(entrada);
  const puente = construirFormularioPreventivoPuente(entrada);
  const actualDocumental = formularioActual.preguntas.filter((pregunta) =>
    normalizar(`${pregunta.texto} ${pregunta.objetivo}`).includes("document"),
  ).length;
  const preventivoDocumental = puente.formularioPreventivo.preguntas.filter(
    (pregunta) => pregunta.metadataPreventiva.documental,
  ).length;

  return {
    totalPreguntasActuales: formularioActual.preguntas.length,
    totalPreguntasPreventivas: puente.formularioPreventivo.preguntas.length,
    preguntasActuales: formularioActual.preguntas.map(preguntaActualBasica),
    preguntasPreventivas: puente.formularioPreventivo.preguntas.map((pregunta) => ({
      id: pregunta.id,
      texto: pregunta.texto,
      paso: pregunta.paso,
      tipoRespuesta: pregunta.tipoRespuesta,
    })),
    preguntasBloqueadasPorAplicabilidad: preview.preguntasBloqueadas.map((pregunta) => ({
      id: pregunta.id,
      texto: pregunta.textoVisible,
      motivo: pregunta.motivoBloqueo,
    })),
    documentalesActuales: actualDocumental,
    documentalesPreventivas: preventivoDocumental,
    riesgoSobredocumentacion: preview.aplicabilidadResultado.riesgoSobredocumentacion,
    riesgoSubdocumentacion: preview.aplicabilidadResultado.riesgoSubdocumentacion,
    diferenciaEnfoqueTecnico:
      preventivoDocumental > actualDocumental
        ? "El formulario preventivo exige revisar aplicabilidad documental antes de activar documentos."
        : "El formulario preventivo prioriza anclaje, exposicion, control y cierre verificable.",
    recomendacion:
      preview.suficienciaTecnica === "insuficiente"
        ? "requiere_revision"
        : puente.riesgosDegradacion.length > 0
          ? "actual"
          : "preventivo",
  };
};
