import type { DocumentoPreventivoAplicable } from "./aplicabilidadPreventivaV2";
import {
  construirPreviewPreguntasPreventivas,
  type EntradaPreviewPreguntasPreventivas,
  type ResultadoPreviewPreguntasPreventivas,
} from "./previewSelectorPreguntasPreventivasV2";
import type { FasePreguntaPreventiva } from "./preguntasPreventivasTipadasV2";

export type CasoPruebaPreviewSelectorPreguntas = {
  id: string;
  descripcionHallazgo: string;
  riesgoEspecifico?: string;
  preguntasEsperadas: string[];
  preguntasProhibidas: string[];
  fasesEsperadas: FasePreguntaPreventiva[];
  documentosEsperados: DocumentoPreventivoAplicable[];
  documentosProhibidos: DocumentoPreventivoAplicable[];
  debePedirAnclaje: boolean;
  debeEvitarSobredocumentacion: boolean;
  debeEvitarSubdocumentacion: boolean;
  debeSeleccionarAccionInmediata: boolean;
  resultadoEsperado: string;
};

export type FalloPreviewSelectorPreguntas = {
  id: string;
  descripcion: string;
  errores: string[];
  severidad: "menor" | "critico";
};

export type ResultadoBancoPreviewSelectorPreguntas = {
  totalCasos: number;
  correctos: number;
  erroresMenores: number;
  erroresCriticos: number;
  porcentajeCumplimiento: number;
  casosSinAnclajeCorrectamenteDetectados: number;
  casosSimplesSobredocumentados: number;
  casosCriticosSubdocumentados: number;
  preguntasProhibidasSeleccionadas: number;
  preguntasEsperadasAusentes: number;
  documentosProhibidosSeleccionados: number;
  documentosEsperadosAusentes: number;
  textosProhibidos: number;
  fallidos: FalloPreviewSelectorPreguntas[];
  patronesFalla: Record<string, number>;
};

const DOCUMENTOS_FORMALES: DocumentoPreventivoAplicable[] = [
  "procedimiento",
  "ast_art",
  "pts",
  "permiso_autorizacion",
  "matriz_riesgos",
];

const PREGUNTAS_DOCUMENTALES_FORMALES = [
  "documental_procedimiento_1",
  "documental_ast_art_2",
  "documental_pts_3",
  "documental_permiso_autorizacion_4",
  "documental_matriz_riesgos_5",
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
];

const crearCasoSimple = (
  id: string,
  descripcionHallazgo: string,
  riesgoEspecifico: string,
): CasoPruebaPreviewSelectorPreguntas => ({
  id,
  descripcionHallazgo,
  riesgoEspecifico,
  preguntasEsperadas: [],
  preguntasProhibidas: PREGUNTAS_DOCUMENTALES_FORMALES,
  fasesEsperadas: ["accion_inmediata", "evidencia_cierre"],
  documentosEsperados: ["evidencia_registro"],
  documentosProhibidos: DOCUMENTOS_FORMALES,
  debePedirAnclaje: false,
  debeEvitarSobredocumentacion: true,
  debeEvitarSubdocumentacion: true,
  debeSeleccionarAccionInmediata: true,
  resultadoEsperado: "Hallazgo simple con accion inmediata, evidencia y sin documentacion formal principal.",
});

const crearCasoCritico = (
  id: string,
  descripcionHallazgo: string,
  riesgoEspecifico: string,
  documentosEsperados: DocumentoPreventivoAplicable[],
): CasoPruebaPreviewSelectorPreguntas => ({
  id,
  descripcionHallazgo,
  riesgoEspecifico,
  preguntasEsperadas: [],
  preguntasProhibidas: [],
  fasesEsperadas: ["exposicion", "control_faltante", "accion_inmediata"],
  documentosEsperados,
  documentosProhibidos: [],
  debePedirAnclaje: false,
  debeEvitarSobredocumentacion: true,
  debeEvitarSubdocumentacion: true,
  debeSeleccionarAccionInmediata: true,
  resultadoEsperado: "Hallazgo critico con control, accion inmediata y documento o control habilitante cuando corresponde.",
});

const crearCasoDocumental = (
  id: string,
  descripcionHallazgo: string,
  riesgoEspecifico: string,
  documentosEsperados: DocumentoPreventivoAplicable[],
): CasoPruebaPreviewSelectorPreguntas => ({
  id,
  descripcionHallazgo,
  riesgoEspecifico,
  preguntasEsperadas: [],
  preguntasProhibidas: [],
  fasesEsperadas: ["aplicabilidad_documental"],
  documentosEsperados,
  documentosProhibidos: [],
  debePedirAnclaje: false,
  debeEvitarSobredocumentacion: true,
  debeEvitarSubdocumentacion: true,
  debeSeleccionarAccionInmediata: false,
  resultadoEsperado: "Caso documental diferenciado entre respaldo administrativo y documento habilitante.",
});

const crearCasoAmbiguo = (
  id: string,
  descripcionHallazgo: string,
  riesgoEspecifico?: string,
): CasoPruebaPreviewSelectorPreguntas => ({
  id,
  descripcionHallazgo,
  riesgoEspecifico,
  preguntasEsperadas: riesgoEspecifico ? [] : ["transversal_anclaje_riesgo_especifico"],
  preguntasProhibidas: [],
  fasesEsperadas: riesgoEspecifico ? ["clasificacion_preventiva"] : ["anclaje_riesgo", "clasificacion_preventiva"],
  documentosEsperados: [],
  documentosProhibidos: [],
  debePedirAnclaje: !riesgoEspecifico,
  debeEvitarSobredocumentacion: true,
  debeEvitarSubdocumentacion: true,
  debeSeleccionarAccionInmediata: false,
  resultadoEsperado: "Caso ambiguo con anclaje o aclaracion para enfocar el riesgo real observado.",
});

const CASOS_SIMPLES: CasoPruebaPreviewSelectorPreguntas[] = [
  ["simple-001", "Vaso trizado disponible para uso.", "vaso trizado"],
  ["simple-002", "Goma de piso despegada.", "goma de piso"],
  ["simple-003", "Material menor en transito.", "material menor"],
  ["simple-004", "Limpieza simple pendiente.", "limpieza simple"],
  ["simple-005", "Residuo comun simple.", "residuo comun"],
  ["simple-006", "Senaletica menor caida.", "senaletica menor"],
  ["simple-007", "Vidrio pequeno retirado de inmediato.", "vidrio pequeno"],
  ["simple-008", "Herramienta menor retirada de servicio.", "herramienta menor"],
  ["simple-009", "Derrame menor de agua.", "derrame menor de agua"],
  ["simple-010", "Pintura fresca ya senalizada.", "pintura fresca"],
  ["simple-011", "Caja mal ubicada retirada.", "caja mal ubicada"],
  ["simple-012", "Cable ordenado fuera de zona de transito.", "cable ordenado"],
  ["simple-013", "Dano menor de mobiliario.", "dano menor"],
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
].map(([id, descripcion, riesgo]) => crearCasoSimple(id, descripcion, riesgo));

const CASOS_CRITICOS: CasoPruebaPreviewSelectorPreguntas[] = [
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
  ...Array.from({ length: 10 }, (_, index) =>
    crearCasoCritico(
      `critico-extra-${index + 1}`,
      `Condicion critica ${index + 1} con control preventivo ausente.`,
      `control critico ${index + 1}`,
      ["matriz_riesgos"],
    ),
  ),
];

const CASOS_DOCUMENTALES: CasoPruebaPreviewSelectorPreguntas[] = [
  crearCasoDocumental("documental-001", "Charla sin firma.", "charla sin firma", ["charla_difusion"]),
  crearCasoDocumental("documental-002", "Charla no relacionada con el riesgo observado.", "charla no relacionada", ["charla_difusion"]),
  crearCasoDocumental("documental-003", "Procedimiento no disponible en terreno.", "procedimiento no disponible", ["procedimiento"]),
  crearCasoDocumental("documental-004", "Procedimiento desactualizado.", "procedimiento desactualizado", ["procedimiento"]),
  crearCasoDocumental("documental-005", "Matriz IPER sin actualizar.", "matriz sin actualizar", ["matriz_riesgos"]),
  crearCasoDocumental("documental-006", "AST/ART incompleto.", "AST incompleto", ["ast_art"]),
  crearCasoDocumental("documental-007", "Permiso vencido.", "permiso vencido", ["permiso_autorizacion"]),
  crearCasoDocumental("documental-008", "Certificacion vencida.", "certificacion vencida", ["certificacion_mantencion"]),
  crearCasoDocumental("documental-009", "Checklist preoperacional incompleto.", "checklist incompleto", ["inspeccion"]),
  crearCasoDocumental("documental-010", "Evidencia fotografica insuficiente.", "evidencia insuficiente", ["evidencia_registro"]),
];

const CASOS_AMBIGUOS: CasoPruebaPreviewSelectorPreguntas[] = [
  crearCasoAmbiguo("ambiguo-001", "Durante la revision del sector se detecta condicion en mesa de trabajo.", "vidrio trizado"),
  crearCasoAmbiguo("ambiguo-002", "En recorrido general se observa material en sector de paso.", "madera con clavos"),
  crearCasoAmbiguo("ambiguo-003", "Se observa trabajador realizando actividad en borde de losa.", "sin arnes"),
  crearCasoAmbiguo("ambiguo-004", "En inspeccion de emergencia se observa equipo con vigencia dudosa.", "extintor vencido"),
  crearCasoAmbiguo("ambiguo-005", "Se observa almacenamiento temporal no definido.", "gasolina en bidon"),
  crearCasoAmbiguo("ambiguo-006", "Descripcion amplia sin riesgo puntual entregado."),
  crearCasoAmbiguo("ambiguo-007", "Descripcion con multiples posibles riesgos: cable, vidrio y senalizacion."),
  crearCasoAmbiguo("ambiguo-008", "Actividad poco clara en sector de circulacion."),
  crearCasoAmbiguo("ambiguo-009", "Condicion observada sin exposicion definida.", "condicion sin exposicion"),
  crearCasoAmbiguo("ambiguo-010", "Exposicion identificada pero sin control faltante claro.", "trabajador expuesto"),
];

export const CASOS_PRUEBA_PREVIEW_SELECTOR_PREGUNTAS: CasoPruebaPreviewSelectorPreguntas[] = [
  ...CASOS_SIMPLES,
  ...CASOS_CRITICOS,
  ...CASOS_DOCUMENTALES,
  ...CASOS_AMBIGUOS,
];

const agregarPatron = (patrones: Record<string, number>, patron: string) => {
  patrones[patron] = (patrones[patron] ?? 0) + 1;
};

const documentosSeleccionados = (preview: ResultadoPreviewPreguntasPreventivas): string[] =>
  preview.preguntasSeleccionadas.flatMap((pregunta) =>
    pregunta.documental
      ? pregunta.datoCapturado.replace("documento_", "")
      : pregunta.fasePregunta === "evidencia_cierre"
        ? "evidencia_registro"
        : [],
  );

const contienePregunta = (preview: ResultadoPreviewPreguntasPreventivas, id: string) =>
  preview.preguntasSeleccionadas.some((pregunta) => pregunta.id === id);

const contieneFase = (preview: ResultadoPreviewPreguntasPreventivas, fase: FasePreguntaPreventiva) =>
  preview.preguntasSeleccionadas.some((pregunta) => pregunta.fasePregunta === fase);

const contieneTextoProhibido = (preview: ResultadoPreviewPreguntasPreventivas) => {
  const texto = [
    preview.resumenTecnicoPreview,
    ...preview.advertencias,
    ...preview.razonesSeleccion,
    ...preview.razonesBloqueo,
    ...preview.preguntasSeleccionadas.map((pregunta) => pregunta.textoVisible),
    ...preview.preguntasBloqueadas.map((pregunta) => pregunta.textoVisible),
  ].join(" ");
  return TEXTOS_PROHIBIDOS.some((prohibido) => texto.includes(prohibido));
};

export const evaluarBancoPreviewSelectorPreguntas = (): ResultadoBancoPreviewSelectorPreguntas => {
  const fallidos: FalloPreviewSelectorPreguntas[] = [];
  const patronesFalla: Record<string, number> = {};
  let casosSinAnclajeCorrectamenteDetectados = 0;
  let casosSimplesSobredocumentados = 0;
  let casosCriticosSubdocumentados = 0;
  let preguntasProhibidasSeleccionadas = 0;
  let preguntasEsperadasAusentes = 0;
  let documentosProhibidosSeleccionados = 0;
  let documentosEsperadosAusentes = 0;
  let textosProhibidos = 0;

  for (const caso of CASOS_PRUEBA_PREVIEW_SELECTOR_PREGUNTAS) {
    const entrada: EntradaPreviewPreguntasPreventivas = {
      descripcionHallazgo: caso.descripcionHallazgo,
      riesgoEspecifico: caso.riesgoEspecifico,
      maximoSugerido: 40,
    };
    const preview = construirPreviewPreguntasPreventivas(entrada);
    const errores: string[] = [];
    const docsSeleccionados = documentosSeleccionados(preview);

    for (const idPregunta of caso.preguntasEsperadas) {
      if (!contienePregunta(preview, idPregunta)) {
        errores.push(`Pregunta esperada ausente: ${idPregunta}`);
        preguntasEsperadasAusentes += 1;
        agregarPatron(patronesFalla, "pregunta_esperada_ausente");
      }
    }
    for (const idPregunta of caso.preguntasProhibidas) {
      if (contienePregunta(preview, idPregunta)) {
        errores.push(`Pregunta prohibida seleccionada: ${idPregunta}`);
        preguntasProhibidasSeleccionadas += 1;
        agregarPatron(patronesFalla, "pregunta_prohibida");
      }
    }
    for (const fase of caso.fasesEsperadas) {
      if (!contieneFase(preview, fase)) {
        errores.push(`Fase esperada ausente: ${fase}`);
        agregarPatron(patronesFalla, "fase_esperada_ausente");
      }
    }
    for (const documento of caso.documentosEsperados) {
      if (!docsSeleccionados.includes(documento)) {
        errores.push(`Documento o control esperado ausente: ${documento}`);
        documentosEsperadosAusentes += 1;
        agregarPatron(patronesFalla, "documento_esperado_ausente");
      }
    }
    for (const documento of caso.documentosProhibidos) {
      if (docsSeleccionados.includes(documento)) {
        errores.push(`Documento prohibido seleccionado: ${documento}`);
        documentosProhibidosSeleccionados += 1;
        agregarPatron(patronesFalla, "documento_prohibido");
      }
    }

    const pideAnclaje = contienePregunta(preview, "transversal_anclaje_riesgo_especifico");
    if (pideAnclaje === caso.debePedirAnclaje) {
      casosSinAnclajeCorrectamenteDetectados += caso.debePedirAnclaje ? 1 : 0;
    } else {
      errores.push("Deteccion de anclaje no coincide con lo esperado.");
      agregarPatron(patronesFalla, "anclaje_incorrecto");
    }

    if (caso.debeEvitarSobredocumentacion && caso.documentosProhibidos.some((documento) => docsSeleccionados.includes(documento))) {
      casosSimplesSobredocumentados += 1;
      errores.push("Caso simple sobredocumentado.");
      agregarPatron(patronesFalla, "sobredocumentacion");
    }
    if (caso.debeEvitarSubdocumentacion && preview.preguntasSeleccionadas.length < 4) {
      casosCriticosSubdocumentados += 1;
      errores.push("Caso critico subdocumentado.");
      agregarPatron(patronesFalla, "subdocumentacion");
    }
    if (caso.debeSeleccionarAccionInmediata && !contieneFase(preview, "accion_inmediata")) {
      errores.push("No selecciono accion inmediata.");
      agregarPatron(patronesFalla, "accion_inmediata_ausente");
    }
    if (contieneTextoProhibido(preview)) {
      textosProhibidos += 1;
      errores.push("Preview contiene texto interno prohibido.");
      agregarPatron(patronesFalla, "texto_prohibido");
    }

    if (errores.length > 0) {
      fallidos.push({
        id: caso.id,
        descripcion: caso.descripcionHallazgo,
        errores,
        severidad: errores.some((error) =>
          error.includes("prohibid") || error.includes("sobredocumentado") || error.includes("subdocumentado"),
        )
          ? "critico"
          : "menor",
      });
    }
  }

  const erroresCriticos = fallidos.filter((fallo) => fallo.severidad === "critico").length;
  const erroresMenores = fallidos.length - erroresCriticos;
  const correctos = CASOS_PRUEBA_PREVIEW_SELECTOR_PREGUNTAS.length - fallidos.length;

  return {
    totalCasos: CASOS_PRUEBA_PREVIEW_SELECTOR_PREGUNTAS.length,
    correctos,
    erroresMenores,
    erroresCriticos,
    porcentajeCumplimiento: Math.round((correctos / CASOS_PRUEBA_PREVIEW_SELECTOR_PREGUNTAS.length) * 100),
    casosSinAnclajeCorrectamenteDetectados,
    casosSimplesSobredocumentados,
    casosCriticosSubdocumentados,
    preguntasProhibidasSeleccionadas,
    preguntasEsperadasAusentes,
    documentosProhibidosSeleccionados,
    documentosEsperadosAusentes,
    textosProhibidos,
    fallidos,
    patronesFalla,
  };
};
