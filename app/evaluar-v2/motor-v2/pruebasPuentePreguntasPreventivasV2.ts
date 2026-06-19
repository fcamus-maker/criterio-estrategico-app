import type { DocumentoPreventivoAplicable } from "./aplicabilidadPreventivaV2";
import {
  construirAliasSemanticosRespuestas,
  construirEntradaEvaluacionDesdeRespuestasTipadas,
  construirFormularioPreventivoPuente,
  validarCompatibilidadFormularioPreventivo,
  type PreguntaFormularioPreventivoPuente,
} from "./puentePreguntasPreventivasV2";

export type CasoPruebaPuentePreguntasPreventivas = {
  id: string;
  descripcionHallazgo: string;
  riesgoEspecifico?: string;
  tipo: "simple" | "critico" | "documental" | "ambiguo";
  documentosEsperados: DocumentoPreventivoAplicable[];
  documentosProhibidos: DocumentoPreventivoAplicable[];
  debePedirAnclaje: boolean;
  debeTenerAccion: boolean;
  debeTenerEvidencia: boolean;
  debeTenerDocumental: boolean;
};

export type FalloPuentePreguntasPreventivas = {
  id: string;
  descripcion: string;
  errores: string[];
  severidad: "menor" | "critico";
};

export type ResultadoBancoPuentePreguntasPreventivas = {
  totalCasos: number;
  correctos: number;
  erroresMenores: number;
  erroresCriticos: number;
  porcentajeCumplimiento: number;
  casosAnclajeCorrectos: number;
  casosSimplesSobredocumentados: number;
  casosCriticosSubdocumentados: number;
  preguntasSinFormatoVisual: number;
  aliasSemanticosFaltantes: number;
  documentosProhibidosSeleccionados: number;
  documentosEsperadosAusentes: number;
  opcionesIncompatibles: number;
  textosProhibidos: number;
  fallidos: FalloPuentePreguntasPreventivas[];
  patronesFalla: Record<string, number>;
};

const DOCUMENTOS_FORMALES: DocumentoPreventivoAplicable[] = [
  "procedimiento",
  "ast_art",
  "pts",
  "permiso_autorizacion",
  "matriz_riesgos",
];

const TEXTOS_PROHIBIDOS = [
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

const crearCasoSimple = (
  id: string,
  descripcionHallazgo: string,
  riesgoEspecifico: string,
): CasoPruebaPuentePreguntasPreventivas => ({
  id,
  descripcionHallazgo,
  riesgoEspecifico,
  tipo: "simple",
  documentosEsperados: ["evidencia_registro"],
  documentosProhibidos: DOCUMENTOS_FORMALES,
  debePedirAnclaje: false,
  debeTenerAccion: true,
  debeTenerEvidencia: true,
  debeTenerDocumental: false,
});

const crearCasoCritico = (
  id: string,
  descripcionHallazgo: string,
  riesgoEspecifico: string,
  documentosEsperados: DocumentoPreventivoAplicable[],
): CasoPruebaPuentePreguntasPreventivas => ({
  id,
  descripcionHallazgo,
  riesgoEspecifico,
  tipo: "critico",
  documentosEsperados,
  documentosProhibidos: [],
  debePedirAnclaje: false,
  debeTenerAccion: true,
  debeTenerEvidencia: false,
  debeTenerDocumental: documentosEsperados.length > 0,
});

const crearCasoDocumental = (
  id: string,
  descripcionHallazgo: string,
  riesgoEspecifico: string,
  documentosEsperados: DocumentoPreventivoAplicable[],
): CasoPruebaPuentePreguntasPreventivas => ({
  id,
  descripcionHallazgo,
  riesgoEspecifico,
  tipo: "documental",
  documentosEsperados,
  documentosProhibidos: [],
  debePedirAnclaje: false,
  debeTenerAccion: false,
  debeTenerEvidencia: false,
  debeTenerDocumental: true,
});

const crearCasoAmbiguo = (
  id: string,
  descripcionHallazgo: string,
  riesgoEspecifico?: string,
): CasoPruebaPuentePreguntasPreventivas => ({
  id,
  descripcionHallazgo,
  riesgoEspecifico,
  tipo: "ambiguo",
  documentosEsperados: [],
  documentosProhibidos: [],
  debePedirAnclaje: !riesgoEspecifico,
  debeTenerAccion: false,
  debeTenerEvidencia: false,
  debeTenerDocumental: false,
});

const CASOS_SIMPLES: CasoPruebaPuentePreguntasPreventivas[] = [
  ["simple-001", "Vaso trizado disponible para uso en comedor.", "vaso trizado"],
  ["simple-002", "Goma de piso despegada en acceso a casino.", "goma de piso"],
  ["simple-003", "Material menor en transito fue retirado del pasillo.", "material menor"],
  ["simple-004", "Limpieza simple pendiente en zona comun.", "limpieza simple"],
  ["simple-005", "Residuo comun simple en area de paso.", "residuo comun"],
  ["simple-006", "Senaletica menor caida en oficina.", "senaletica menor"],
  ["simple-007", "Vidrio pequeno retirado de inmediato.", "vidrio pequeno"],
  ["simple-008", "Herramienta menor retirada de servicio.", "herramienta menor"],
  ["simple-009", "Derrame menor de agua secado durante recorrido.", "derrame menor de agua"],
  ["simple-010", "Pintura fresca ya senalizada.", "pintura fresca"],
  ["simple-011", "Caja mal ubicada retirada.", "caja mal ubicada"],
  ["simple-012", "Cable ordenado fuera de zona de transito.", "cable ordenado"],
  ["simple-013", "Dano menor de mobiliario sin exposicion operacional.", "dano menor"],
  ["simple-014", "Residuo no peligroso sin exposicion.", "residuo no peligroso"],
  ["simple-015", "Area con polvo menor ya controlado.", "polvo menor"],
  ["simple-016", "Elemento suelto corregido en repisa.", "elemento suelto"],
  ["simple-017", "Envase vacio no peligroso retirado.", "envase vacio"],
  ["simple-018", "Aviso impreso caido se vuelve a fijar.", "aviso caido"],
  ["simple-019", "Restos menores de embalaje retirados.", "restos menores"],
  ["simple-020", "Gota de agua secada en lavamanos.", "gota de agua"],
  ["simple-021", "Protector plastico desprendido sin filo.", "protector plastico"],
  ["simple-022", "Separador fuera de posicion reubicado.", "separador reubicado"],
  ["simple-023", "Cinta vieja retirada tras finalizar tarea.", "cinta vieja"],
  ["simple-024", "Etiqueta menor desprendida en archivo.", "etiqueta menor"],
  ["simple-025", "Funda plastica rota retirada.", "funda rota"],
].map(([id, descripcionHallazgo, riesgoEspecifico]) =>
  crearCasoSimple(id, descripcionHallazgo, riesgoEspecifico),
);

const CASOS_CRITICOS: CasoPruebaPuentePreguntasPreventivas[] = [
  crearCasoCritico("critico-001", "Trabajador sin arnes a 3 metros.", "trabajador sin arnes", ["pts", "permiso_autorizacion", "matriz_riesgos"]),
  crearCasoCritico("critico-002", "Trabajo en caliente sin permiso.", "trabajo en caliente", ["permiso_autorizacion", "pts"]),
  crearCasoCritico("critico-003", "Equipo intervenido sin bloqueo LOTO.", "equipo sin bloqueo", ["bloqueo_loto", "permiso_autorizacion"]),
  crearCasoCritico("critico-004", "Excavacion sin entibacion.", "excavacion sin entibacion", ["pts", "permiso_autorizacion"]),
  crearCasoCritico("critico-005", "Excavacion sin proteccion perimetral.", "excavacion sin proteccion", ["senalizacion_segregacion"]),
  crearCasoCritico("critico-006", "Area de izaje sin segregacion.", "izaje sin segregacion", ["senalizacion_segregacion", "permiso_autorizacion"]),
  crearCasoCritico("critico-007", "Trabajador pasa bajo carga suspendida.", "carga suspendida", ["permiso_autorizacion"]),
  crearCasoCritico("critico-008", "Gasolina en bidon no certificado.", "gasolina en bidon", ["hds_sds", "control_ambiental"]),
  crearCasoCritico("critico-009", "Bodega sin HDS.", "bodega sin HDS", ["hds_sds"]),
  crearCasoCritico("critico-010", "Derrame de combustible al suelo.", "derrame combustible", ["hds_sds", "control_ambiental"]),
  crearCasoCritico("critico-011", "Residuo peligroso mal segregado.", "residuo peligroso", ["control_ambiental", "hds_sds"]),
  crearCasoCritico("critico-012", "Sustancia sin rotulacion.", "sustancia sin rotulacion", ["hds_sds"]),
  crearCasoCritico("critico-013", "Matriz de riesgo sin actualizar para tarea critica.", "matriz sin actualizar", ["matriz_riesgos"]),
  crearCasoCritico("critico-014", "PTS faltante en trabajo critico.", "PTS faltante", ["pts", "matriz_riesgos"]),
  crearCasoCritico("critico-015", "AST/ART faltante en tarea de riesgo.", "AST faltante", ["ast_art", "matriz_riesgos"]),
  crearCasoCritico("critico-016", "Certificacion vencida de eslinga.", "eslinga vencida", ["certificacion_mantencion"]),
  crearCasoCritico("critico-017", "Equipo critico sin mantencion.", "equipo sin mantencion", ["certificacion_mantencion", "inspeccion"]),
  crearCasoCritico("critico-018", "Tablero electrico sin proteccion.", "tablero sin proteccion", ["bloqueo_loto", "procedimiento"]),
  crearCasoCritico("critico-019", "Conduccion imprudente en obra.", "conduccion imprudente", ["procedimiento", "matriz_riesgos"]),
  crearCasoCritico("critico-020", "Ingreso a zona restringida sin autorizacion.", "zona restringida", ["permiso_autorizacion"]),
  crearCasoCritico("critico-021", "Maquina con partes moviles expuestas.", "partes moviles expuestas", ["inspeccion", "matriz_riesgos"]),
  crearCasoCritico("critico-022", "Plataforma sin barandas.", "plataforma sin barandas", ["pts", "inspeccion"]),
  crearCasoCritico("critico-023", "Techumbre fragil sin linea de vida.", "techumbre fragil", ["pts", "permiso_autorizacion"]),
  crearCasoCritico("critico-024", "Izaje con viento adverso.", "izaje con viento", ["permiso_autorizacion", "matriz_riesgos"]),
  crearCasoCritico("critico-025", "Trabajo electrico con humedad cercana.", "electricidad con humedad", ["bloqueo_loto", "procedimiento"]),
  crearCasoCritico("critico-026", "Espacio confinado sin autorizacion.", "espacio confinado", ["permiso_autorizacion", "pts"]),
  crearCasoCritico("critico-027", "Demolicion sin segregacion.", "demolicion sin segregacion", ["pts", "senalizacion_segregacion"]),
  crearCasoCritico("critico-028", "Montacarga operando junto a peatones.", "interaccion peatones montacarga", ["procedimiento", "matriz_riesgos"]),
  crearCasoCritico("critico-029", "Herramienta electrica con enchufe reparado con cinta.", "enchufe danado", ["inspeccion", "certificacion_mantencion"]),
  crearCasoCritico("critico-030", "Calzado de seguridad en mal estado durante faena.", "calzado en mal estado", ["inspeccion"]),
  crearCasoCritico("critico-031", "Parabrisas de bus trizado en traslado de trabajadores.", "parabrisas trizado", ["inspeccion", "certificacion_mantencion"]),
  crearCasoCritico("critico-032", "Neumaticos gastados en camioneta de obra.", "neumaticos gastados", ["inspeccion", "certificacion_mantencion"]),
  crearCasoCritico("critico-033", "Deslizamiento de tierra cercano a frente de trabajo.", "deslizamiento de tierra", ["matriz_riesgos", "detencion_actividad"]),
  crearCasoCritico("critico-034", "Omitir bloqueo antes de intervenir equipo.", "omision bloqueo LOTO", ["bloqueo_loto", "procedimiento"]),
  crearCasoCritico("critico-035", "Trabajador expuesto a linea de fuego.", "linea de fuego", ["procedimiento", "matriz_riesgos"]),
];

const CASOS_DOCUMENTALES: CasoPruebaPuentePreguntasPreventivas[] = [
  crearCasoDocumental("documental-001", "Bodega sin HDS disponible para sustancias.", "bodega sin HDS", ["hds_sds"]),
  crearCasoDocumental("documental-002", "Charla de cinco minutos sin firma.", "charla sin firma", ["charla_difusion", "evidencia_registro"]),
  crearCasoDocumental("documental-003", "Matriz de riesgos sin actualizar.", "matriz sin actualizar", ["matriz_riesgos"]),
  crearCasoDocumental("documental-004", "Procedimiento no difundido a cuadrilla.", "procedimiento no difundido", ["procedimiento", "charla_difusion"]),
  crearCasoDocumental("documental-005", "Permiso de trabajo no disponible.", "permiso no disponible", ["permiso_autorizacion"]),
  crearCasoDocumental("documental-006", "Certificacion vencida de equipo.", "certificacion vencida", ["certificacion_mantencion"]),
  crearCasoDocumental("documental-007", "Inspeccion preuso no registrada.", "inspeccion sin registro", ["inspeccion", "evidencia_registro"]),
  crearCasoDocumental("documental-008", "AST no considera condicion real observada.", "AST incompleto", ["ast_art", "matriz_riesgos"]),
  crearCasoDocumental("documental-009", "PTS no cubre tarea critica ejecutada.", "PTS incompleto", ["pts", "procedimiento"]),
  crearCasoDocumental("documental-010", "Evidencia fotografica insuficiente para cierre.", "evidencia insuficiente", ["evidencia_registro"]),
];

const CASOS_AMBIGUOS: CasoPruebaPuentePreguntasPreventivas[] = [
  crearCasoAmbiguo("ambiguo-001", "Se observa condicion irregular en terreno."),
  crearCasoAmbiguo("ambiguo-002", "Actividad ejecutada sin informacion suficiente."),
  crearCasoAmbiguo("ambiguo-003", "Situacion reportada requiere mayor detalle."),
  crearCasoAmbiguo("ambiguo-004", "Descripcion larga sin indicar el riesgo concreto."),
  crearCasoAmbiguo("ambiguo-005", "Se detecta desviacion preventiva no especificada."),
  crearCasoAmbiguo("ambiguo-006", "Equipo en sector operativo con condicion por confirmar.", "equipo por verificar"),
  crearCasoAmbiguo("ambiguo-007", "Area con posible exposicion a personas.", "exposicion por confirmar"),
  crearCasoAmbiguo("ambiguo-008", "Registro incompleto en actividad observada.", "registro incompleto"),
  crearCasoAmbiguo("ambiguo-009", "Condicion del entorno requiere clasificacion.", "condicion entorno"),
  crearCasoAmbiguo("ambiguo-010", "Hallazgo con informacion parcial del supervisor."),
];

export const CASOS_PUENTE_PREGUNTAS_PREVENTIVAS: CasoPruebaPuentePreguntasPreventivas[] = [
  ...CASOS_SIMPLES,
  ...CASOS_CRITICOS,
  ...CASOS_DOCUMENTALES,
  ...CASOS_AMBIGUOS,
];

const normalizar = (valor?: unknown): string =>
  String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const documentosSeleccionados = (preguntas: PreguntaFormularioPreventivoPuente[]) =>
  Array.from(new Set(preguntas.flatMap((pregunta) => pregunta.metadataPreventiva.documentosRelacionados)));

const contieneTextoProhibido = (preguntas: PreguntaFormularioPreventivoPuente[]) =>
  preguntas.some((pregunta) => {
    const texto = [
      pregunta.texto,
      pregunta.ayuda,
      pregunta.razonSeleccion,
      ...pregunta.opciones.map((opcion) => opcion.label),
    ].join(" ");
    return TEXTOS_PROHIBIDOS.some((prohibido) => normalizar(texto).includes(normalizar(prohibido)));
  });

const opcionPorTexto = (pregunta: PreguntaFormularioPreventivoPuente, texto: string) =>
  pregunta.opciones.find((opcion) => normalizar(opcion.label).includes(normalizar(texto)))?.value;

const construirRespuestasSimuladas = (
  caso: CasoPruebaPuentePreguntasPreventivas,
  preguntas: PreguntaFormularioPreventivoPuente[],
) => {
  const respuestas: Record<string, string> = {};

  for (const pregunta of preguntas) {
    if (pregunta.tipo === "texto") {
      respuestas[pregunta.id] = caso.riesgoEspecifico || caso.descripcionHallazgo;
      continue;
    }

    if (pregunta.tipoRespuesta === "ambito_general") {
      respuestas[pregunta.id] =
        opcionPorTexto(pregunta, caso.tipo === "documental" ? "documental" : "seguridad") || pregunta.opciones[0]?.value;
    } else if (pregunta.tipoRespuesta === "acto_condicion_ambas") {
      respuestas[pregunta.id] = opcionPorTexto(pregunta, "condicion") || pregunta.opciones[0]?.value;
    } else if (pregunta.tipoRespuesta === "exposicion") {
      respuestas[pregunta.id] =
        opcionPorTexto(pregunta, caso.tipo === "simple" ? "no verificable" : "trabajadores") || pregunta.opciones[0]?.value;
    } else if (pregunta.tipoRespuesta === "consecuencia_probable") {
      respuestas[pregunta.id] =
        opcionPorTexto(pregunta, caso.tipo === "simple" ? "interrupcion operacional" : "lesion") || pregunta.opciones[0]?.value;
    } else if (pregunta.tipoRespuesta === "control_existente") {
      respuestas[pregunta.id] =
        opcionPorTexto(pregunta, caso.tipo === "simple" ? "control parcial" : "no existe") || pregunta.opciones[0]?.value;
    } else if (pregunta.tipoRespuesta === "aplicabilidad_documental") {
      respuestas[pregunta.id] =
        opcionPorTexto(pregunta, caso.tipo === "simple" ? "no corresponde" : "requerido") || pregunta.opciones[0]?.value;
    } else if (pregunta.tipoRespuesta === "accion_inmediata") {
      respuestas[pregunta.id] =
        opcionPorTexto(pregunta, caso.tipo === "simple" ? "retirar" : "detener actividad") || pregunta.opciones[0]?.value;
    } else if (pregunta.tipoRespuesta === "evidencia") {
      respuestas[pregunta.id] = opcionPorTexto(pregunta, "parcial") || pregunta.opciones[0]?.value;
    } else {
      respuestas[pregunta.id] = pregunta.opciones[0]?.value;
    }
  }

  if (caso.riesgoEspecifico && !respuestas.transversal_anclaje_riesgo_especifico) {
    respuestas.riesgo_especifico_detectado = caso.riesgoEspecifico;
  }

  return respuestas;
};

const registrarPatron = (patrones: Record<string, number>, patron: string) => {
  patrones[patron] = (patrones[patron] || 0) + 1;
};

export const evaluarBancoPuentePreguntasPreventivas = (): ResultadoBancoPuentePreguntasPreventivas => {
  const fallidos: FalloPuentePreguntasPreventivas[] = [];
  const patronesFalla: Record<string, number> = {};
  let casosAnclajeCorrectos = 0;
  let casosSimplesSobredocumentados = 0;
  let casosCriticosSubdocumentados = 0;
  let preguntasSinFormatoVisual = 0;
  let aliasSemanticosFaltantes = 0;
  let documentosProhibidosSeleccionados = 0;
  let documentosEsperadosAusentes = 0;
  let opcionesIncompatibles = 0;
  let textosProhibidos = 0;

  for (const caso of CASOS_PUENTE_PREGUNTAS_PREVENTIVAS) {
    const resultado = construirFormularioPreventivoPuente({
      descripcionHallazgo: caso.descripcionHallazgo,
      riesgoEspecifico: caso.riesgoEspecifico,
      maximoSugerido: 18,
    });
    const formulario = resultado.formularioPreventivo;
    const compatibilidad = validarCompatibilidadFormularioPreventivo(formulario);
    const preguntas = formulario.preguntas;
    const documentos = documentosSeleccionados(preguntas);
    const respuestas = construirRespuestasSimuladas(caso, preguntas);
    const alias = construirAliasSemanticosRespuestas(respuestas);
    const entradaEvaluacion = construirEntradaEvaluacionDesdeRespuestasTipadas(respuestas, alias);
    const errores: string[] = [];
    let severidad: "menor" | "critico" = "menor";

    const anclaje = preguntas.find((pregunta) => pregunta.id === "transversal_anclaje_riesgo_especifico");
    const anclajeCorrecto =
      caso.debePedirAnclaje
        ? preguntas[0]?.id === "transversal_anclaje_riesgo_especifico" && anclaje?.paso === 1
        : !anclaje;

    if (anclajeCorrecto) casosAnclajeCorrectos += 1;
    if (!anclajeCorrecto) {
      errores.push("Anclaje de riesgo especifico incorrecto.");
      severidad = "critico";
      registrarPatron(patronesFalla, "anclaje");
    }

    if (compatibilidad.preguntasSinFormatoVisual > 0) {
      preguntasSinFormatoVisual += compatibilidad.preguntasSinFormatoVisual;
      errores.push("Existen preguntas sin formato visual minimo.");
      severidad = "critico";
      registrarPatron(patronesFalla, "formato_visual");
    }
    if (compatibilidad.opcionesIncompatibles > 0) {
      opcionesIncompatibles += compatibilidad.opcionesIncompatibles;
      errores.push("Existen opciones incompatibles con el tipo de pregunta.");
      severidad = "critico";
      registrarPatron(patronesFalla, "opciones");
    }
    if (compatibilidad.textosProhibidos > 0 || contieneTextoProhibido(preguntas)) {
      textosProhibidos += Math.max(1, compatibilidad.textosProhibidos);
      errores.push("Existen textos internos visibles.");
      severidad = "critico";
      registrarPatron(patronesFalla, "textos_prohibidos");
    }

    const docsProhibidos = documentos.filter((documento) => caso.documentosProhibidos.includes(documento));
    if (docsProhibidos.length > 0) {
      documentosProhibidosSeleccionados += docsProhibidos.length;
      errores.push(`Documentos prohibidos seleccionados: ${docsProhibidos.join(", ")}.`);
      severidad = "critico";
      registrarPatron(patronesFalla, "sobredocumentacion");
    }

    const docsFaltantes = caso.documentosEsperados.filter((documento) => !documentos.includes(documento));
    if (docsFaltantes.length > 0) {
      documentosEsperadosAusentes += docsFaltantes.length;
      errores.push(`Documentos esperados ausentes: ${docsFaltantes.join(", ")}.`);
      severidad = caso.tipo === "critico" || caso.tipo === "documental" ? "critico" : severidad;
      registrarPatron(patronesFalla, "subdocumentacion");
    }

    if (caso.tipo === "simple" && docsProhibidos.length > 0) {
      casosSimplesSobredocumentados += 1;
    }

    const tieneAccion = preguntas.some((pregunta) => pregunta.fasePregunta === "accion_inmediata");
    const tieneEvidencia = preguntas.some((pregunta) => pregunta.fasePregunta === "evidencia_cierre");
    const tieneDocumental = preguntas.some((pregunta) => pregunta.metadataPreventiva.documental);

    if (caso.debeTenerAccion && !tieneAccion) {
      errores.push("No se selecciono pregunta de accion inmediata requerida.");
      severidad = "critico";
      registrarPatron(patronesFalla, "accion");
    }
    if (caso.debeTenerEvidencia && !tieneEvidencia) {
      errores.push("No se selecciono pregunta de evidencia/cierre requerida.");
      severidad = "critico";
      registrarPatron(patronesFalla, "evidencia");
    }
    if (caso.debeTenerDocumental && !tieneDocumental) {
      errores.push("No se selecciono pregunta documental requerida.");
      severidad = "critico";
      registrarPatron(patronesFalla, "documental");
    }
    if (caso.tipo === "critico" && (!tieneAccion || docsFaltantes.length > 0)) {
      casosCriticosSubdocumentados += 1;
    }

    const aliasRequerido = caso.debePedirAnclaje || Boolean(caso.riesgoEspecifico);
    if (aliasRequerido && !alias.riesgo_especifico_detectado) {
      aliasSemanticosFaltantes += 1;
      errores.push("Alias semantico de riesgo especifico ausente.");
      severidad = "critico";
      registrarPatron(patronesFalla, "alias");
    }
    if (caso.tipo === "critico" && !entradaEvaluacion.accionInmediata) {
      aliasSemanticosFaltantes += 1;
      errores.push("Entrada sugerida sin accion inmediata para caso critico.");
      severidad = "critico";
      registrarPatron(patronesFalla, "entrada_evaluacion");
    }

    if (resultado.preguntasPaso1.length === 0 || resultado.preguntasPaso2.length === 0) {
      errores.push("La division paso1/paso2 no entrega ambos bloques.");
      severidad = "critico";
      registrarPatron(patronesFalla, "division_pasos");
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
  const correctos = CASOS_PUENTE_PREGUNTAS_PREVENTIVAS.length - fallidos.length;

  return {
    totalCasos: CASOS_PUENTE_PREGUNTAS_PREVENTIVAS.length,
    correctos,
    erroresMenores,
    erroresCriticos,
    porcentajeCumplimiento: Math.round((correctos / CASOS_PUENTE_PREGUNTAS_PREVENTIVAS.length) * 100),
    casosAnclajeCorrectos,
    casosSimplesSobredocumentados,
    casosCriticosSubdocumentados,
    preguntasSinFormatoVisual,
    aliasSemanticosFaltantes,
    documentosProhibidosSeleccionados,
    documentosEsperadosAusentes,
    opcionesIncompatibles,
    textosProhibidos,
    fallidos,
    patronesFalla,
  };
};
