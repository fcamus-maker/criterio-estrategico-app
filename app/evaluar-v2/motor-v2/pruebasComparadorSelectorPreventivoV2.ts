import type { DocumentoPreventivoAplicable } from "./aplicabilidadPreventivaV2";
import {
  construirComparacionSelectorPreventivo,
  type EntradaComparadorSelectorPreventivoV2,
  type RecomendacionModoPreguntasV2,
} from "./comparadorSelectorPreventivoV2";

export type CasoPruebaComparadorSelectorPreventivo = {
  id: string;
  descripcionHallazgo: string;
  riesgoEspecificoDetectado?: string;
  tipo: "simple" | "critico" | "documental" | "ambiguo";
  recomendacionEsperada: RecomendacionModoPreguntasV2;
  documentosEsperados: DocumentoPreventivoAplicable[];
  documentosProhibidos: DocumentoPreventivoAplicable[];
  debeTenerAlias: boolean;
  debeDetectarFaltaAnclaje: boolean;
  resultadoEsperado: string;
};

export type FalloComparadorSelectorPreventivo = {
  id: string;
  descripcion: string;
  errores: string[];
  severidad: "menor" | "critico";
};

export type ResultadoBancoComparadorSelectorPreventivo = {
  totalCasos: number;
  correctos: number;
  erroresMenores: number;
  erroresCriticos: number;
  porcentajeCumplimiento: number;
  recomendacionesCorrectas: number;
  casosSimplesSobredocumentados: number;
  casosCriticosSubdocumentados: number;
  fallbackIncorrecto: number;
  preventivoIncorrecto: number;
  requiereRevisionIncorrecto: number;
  textosProhibidos: number;
  aliasFaltantes: number;
  fallidos: FalloComparadorSelectorPreventivo[];
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

const crearCasoSimple = (
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
  resultadoEsperado: "Debe favorecer preguntas preventivas por proteccion anti-sobredocumentacion.",
});

const crearCasoCritico = (
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
  resultadoEsperado: "Debe favorecer preguntas preventivas cuando hay control critico o documento habilitante.",
});

const crearCasoDocumental = (
  id: string,
  descripcionHallazgo: string,
  riesgoEspecificoDetectado: string,
  documentosEsperados: DocumentoPreventivoAplicable[],
  recomendacionEsperada: RecomendacionModoPreguntasV2 = "usar_preventivo",
): CasoPruebaComparadorSelectorPreventivo => ({
  id,
  descripcionHallazgo,
  riesgoEspecificoDetectado,
  tipo: "documental",
  recomendacionEsperada,
  documentosEsperados,
  documentosProhibidos: [],
  debeTenerAlias: true,
  debeDetectarFaltaAnclaje: false,
  resultadoEsperado: "Debe diferenciar documento habilitante, respaldo administrativo y evidencia.",
});

const crearCasoAmbiguo = (
  id: string,
  descripcionHallazgo: string,
  riesgoEspecificoDetectado?: string,
): CasoPruebaComparadorSelectorPreventivo => ({
  id,
  descripcionHallazgo,
  riesgoEspecificoDetectado,
  tipo: "ambiguo",
  recomendacionEsperada: riesgoEspecificoDetectado ? "usar_preventivo" : "requiere_revision",
  documentosEsperados: [],
  documentosProhibidos: [],
  debeTenerAlias: Boolean(riesgoEspecificoDetectado),
  debeDetectarFaltaAnclaje: !riesgoEspecificoDetectado,
  resultadoEsperado: riesgoEspecificoDetectado
    ? "Debe usar el riesgo especifico como ancla tecnica."
    : "Debe requerir revision si falta el riesgo especifico.",
});

const CASOS_SIMPLES: CasoPruebaComparadorSelectorPreventivo[] = [
  ["simple-001", "Vaso trizado disponible para uso.", "vaso trizado"],
  ["simple-002", "Goma de piso despegada en acceso a casino.", "goma de piso"],
  ["simple-003", "Vidrio quebrado retirado de inmediato.", "vidrio quebrado"],
  ["simple-004", "Material menor en transito retirado.", "material menor"],
  ["simple-005", "Senalizacion menor caida en oficina.", "senalizacion menor"],
  ["simple-006", "Derrame menor de agua secado.", "derrame menor de agua"],
  ["simple-007", "Pintura fresca senalizada.", "pintura fresca"],
  ["simple-008", "Residuo comun simple en area de paso.", "residuo comun"],
  ["simple-009", "Herramienta menor retirada.", "herramienta menor"],
  ["simple-010", "Dano menor de mobiliario.", "dano menor"],
  ["simple-011", "Caja mal ubicada retirada.", "caja mal ubicada"],
  ["simple-012", "Cable ordenado fuera de transito.", "cable ordenado"],
  ["simple-013", "Etiqueta menor desprendida en archivo.", "etiqueta menor"],
  ["simple-014", "Protector plastico desprendido sin filo.", "protector plastico"],
  ["simple-015", "Funda plastica rota retirada.", "funda rota"],
  ["simple-016", "Restos menores de embalaje retirados.", "restos menores"],
  ["simple-017", "Polvo menor controlado con limpieza.", "polvo menor"],
  ["simple-018", "Envase vacio no peligroso retirado.", "envase vacio"],
  ["simple-019", "Aviso impreso caido se vuelve a fijar.", "aviso caido"],
  ["simple-020", "Separador fuera de posicion reubicado.", "separador reubicado"],
  ["simple-021", "Cinta vieja retirada tras finalizar tarea.", "cinta vieja"],
  ["simple-022", "Gota de agua secada en lavamanos.", "gota de agua"],
  ["simple-023", "Elemento suelto corregido en repisa.", "elemento suelto"],
  ["simple-024", "Residuo no peligroso sin exposicion.", "residuo no peligroso"],
  ["simple-025", "Limpieza simple pendiente en zona comun.", "limpieza simple"],
].map(([id, descripcion, riesgo]) => crearCasoSimple(id, descripcion, riesgo));

const CASOS_CRITICOS: CasoPruebaComparadorSelectorPreventivo[] = [
  crearCasoCritico("critico-001", "Trabajador sin arnes a 3 metros.", "trabajador sin arnes", ["pts", "permiso_autorizacion", "matriz_riesgos"]),
  crearCasoCritico("critico-002", "Trabajo en caliente sin permiso.", "trabajo en caliente", ["permiso_autorizacion", "pts"]),
  crearCasoCritico("critico-003", "Equipo intervenido sin LOTO.", "equipo sin LOTO", ["bloqueo_loto", "permiso_autorizacion"]),
  crearCasoCritico("critico-004", "Excavacion sin entibacion.", "excavacion sin entibacion", ["pts", "permiso_autorizacion"]),
  crearCasoCritico("critico-005", "Area de izaje sin segregacion.", "izaje sin segregacion", ["senalizacion_segregacion", "permiso_autorizacion"]),
  crearCasoCritico("critico-006", "Carga suspendida con trabajador bajo ella.", "carga suspendida", ["permiso_autorizacion"]),
  crearCasoCritico("critico-007", "Gasolina en bidon no certificado.", "gasolina en bidon", ["hds_sds", "control_ambiental"]),
  crearCasoCritico("critico-008", "Bodega sin HDS.", "bodega sin HDS", ["hds_sds"]),
  crearCasoCritico("critico-009", "Derrame de combustible al suelo.", "derrame combustible", ["hds_sds", "control_ambiental"]),
  crearCasoCritico("critico-010", "Tablero electrico sin proteccion.", "tablero sin proteccion", ["bloqueo_loto", "procedimiento"]),
  crearCasoCritico("critico-011", "Conduccion imprudente en obra.", "conduccion imprudente", ["procedimiento", "matriz_riesgos"]),
  crearCasoCritico("critico-012", "Ingreso a zona restringida.", "zona restringida", ["permiso_autorizacion"]),
  crearCasoCritico("critico-013", "Certificacion vencida de eslinga.", "eslinga vencida", ["certificacion_mantencion"]),
  crearCasoCritico("critico-014", "Maquina con partes moviles expuestas.", "partes moviles expuestas", ["inspeccion", "matriz_riesgos"]),
  crearCasoCritico("critico-015", "Techumbre fragil sin linea de vida.", "techumbre fragil", ["pts", "permiso_autorizacion"]),
  crearCasoCritico("critico-016", "Plataforma sin barandas.", "plataforma sin barandas", ["pts", "inspeccion"]),
  crearCasoCritico("critico-017", "Excavacion sin proteccion perimetral.", "excavacion sin proteccion", ["senalizacion_segregacion"]),
  crearCasoCritico("critico-018", "Trabajo electrico con humedad cercana.", "electricidad con humedad", ["bloqueo_loto", "procedimiento"]),
  crearCasoCritico("critico-019", "Espacio confinado sin autorizacion.", "espacio confinado", ["permiso_autorizacion", "pts"]),
  crearCasoCritico("critico-020", "Demolicion sin segregacion.", "demolicion sin segregacion", ["pts", "senalizacion_segregacion"]),
  crearCasoCritico("critico-021", "Montacarga operando junto a peatones.", "montacarga con peatones", ["procedimiento", "matriz_riesgos"]),
  crearCasoCritico("critico-022", "Herramienta electrica con enchufe reparado con cinta.", "enchufe danado", ["inspeccion", "certificacion_mantencion"]),
  crearCasoCritico("critico-023", "Calzado de seguridad en mal estado durante faena.", "calzado en mal estado", ["inspeccion"]),
  crearCasoCritico("critico-024", "Parabrisas de bus trizado en traslado de trabajadores.", "parabrisas trizado", ["inspeccion", "certificacion_mantencion"]),
  crearCasoCritico("critico-025", "Neumaticos gastados en camioneta de obra.", "neumaticos gastados", ["inspeccion", "certificacion_mantencion"]),
  crearCasoCritico("critico-026", "Deslizamiento de tierra cercano a frente de trabajo.", "deslizamiento de tierra", ["matriz_riesgos", "detencion_actividad"]),
  crearCasoCritico("critico-027", "Omitir bloqueo antes de intervenir equipo.", "omision bloqueo LOTO", ["bloqueo_loto", "procedimiento"]),
  crearCasoCritico("critico-028", "Trabajador expuesto a linea de fuego.", "linea de fuego", ["procedimiento", "matriz_riesgos"]),
  crearCasoCritico("critico-029", "Residuo peligroso mal segregado.", "residuo peligroso", ["control_ambiental", "hds_sds"]),
  crearCasoCritico("critico-030", "Sustancia sin rotulacion.", "sustancia sin rotulacion", ["hds_sds"]),
  crearCasoCritico("critico-031", "PTS faltante en trabajo critico.", "PTS faltante", ["pts", "matriz_riesgos"]),
  crearCasoCritico("critico-032", "AST faltante en tarea de riesgo.", "AST faltante", ["ast_art", "matriz_riesgos"]),
  crearCasoCritico("critico-033", "Equipo critico sin mantencion.", "equipo sin mantencion", ["certificacion_mantencion", "inspeccion"]),
  crearCasoCritico("critico-034", "Izaje con viento adverso.", "izaje con viento", ["permiso_autorizacion", "matriz_riesgos"]),
  crearCasoCritico("critico-035", "Trabajador pasa bajo carga suspendida.", "paso bajo carga", ["permiso_autorizacion"]),
];

const CASOS_DOCUMENTALES: CasoPruebaComparadorSelectorPreventivo[] = [
  crearCasoDocumental("documental-001", "Matriz de riesgo sin actualizar.", "matriz sin actualizar", ["matriz_riesgos"]),
  crearCasoDocumental("documental-002", "Charla sin firma.", "charla sin firma", ["charla_difusion", "evidencia_registro"]),
  crearCasoDocumental("documental-003", "AST incompleto.", "AST incompleto", ["ast_art", "matriz_riesgos"]),
  crearCasoDocumental("documental-004", "PTS faltante.", "PTS faltante", ["pts"]),
  crearCasoDocumental("documental-005", "Permiso vencido.", "permiso vencido", ["permiso_autorizacion"]),
  crearCasoDocumental("documental-006", "Certificacion vencida.", "certificacion vencida", ["certificacion_mantencion"]),
  crearCasoDocumental("documental-007", "Checklist incompleto.", "checklist incompleto", ["inspeccion", "evidencia_registro"]),
  crearCasoDocumental("documental-008", "Evidencia fotografica insuficiente.", "evidencia insuficiente", ["evidencia_registro"]),
  crearCasoDocumental("documental-009", "Procedimiento no disponible.", "procedimiento no disponible", ["procedimiento"]),
  crearCasoDocumental("documental-010", "HDS no difundida.", "HDS no difundida", ["hds_sds", "charla_difusion"]),
];

const CASOS_AMBIGUOS: CasoPruebaComparadorSelectorPreventivo[] = [
  crearCasoAmbiguo("ambiguo-001", "Descripcion larga de recorrido con elemento cortante retirado.", "vidrio quebrado"),
  crearCasoAmbiguo("ambiguo-002", "Descripcion larga con material de carpinteria en area de paso.", "madera con clavos"),
  crearCasoAmbiguo("ambiguo-003", "Descripcion larga sobre actividad en borde abierto.", "sin arnes"),
  crearCasoAmbiguo("ambiguo-004", "Descripcion sin riesgo especifico."),
  crearCasoAmbiguo("ambiguo-005", "Descripcion con multiples riesgos: cable, derrame y transito cercano."),
  crearCasoAmbiguo("ambiguo-006", "Descripcion con exposicion poco clara."),
  crearCasoAmbiguo("ambiguo-007", "Descripcion con control faltante poco claro."),
  crearCasoAmbiguo("ambiguo-008", "Descripcion con objeto ambiguo."),
  crearCasoAmbiguo("ambiguo-009", "Se informa condicion irregular sin mayor detalle."),
  crearCasoAmbiguo("ambiguo-010", "Se detecta desviacion preventiva no especificada."),
];

export const CASOS_COMPARADOR_SELECTOR_PREVENTIVO: CasoPruebaComparadorSelectorPreventivo[] = [
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

const contieneTextoProhibido = (texto: string) =>
  TEXTOS_PROHIBIDOS.some((termino) => normalizar(texto).includes(normalizar(termino)));

const registrarPatron = (patrones: Record<string, number>, patron: string) => {
  patrones[patron] = (patrones[patron] || 0) + 1;
};

const entradaDesdeCaso = (caso: CasoPruebaComparadorSelectorPreventivo): EntradaComparadorSelectorPreventivoV2 => ({
  descripcionHallazgo: caso.descripcionHallazgo,
  riesgoEspecificoDetectado: caso.riesgoEspecificoDetectado,
  area: caso.tipo === "simple" ? "Area comun" : "Frente de trabajo",
  actividad: caso.tipo === "documental" ? "Gestion documental" : undefined,
  tipoHallazgo: "Validacion preventiva",
  respuestasActuales: caso.riesgoEspecificoDetectado
    ? { transversal_anclaje_riesgo_especifico: caso.riesgoEspecificoDetectado }
    : {},
});

export const evaluarBancoComparadorSelectorPreventivo = (): ResultadoBancoComparadorSelectorPreventivo => {
  const fallidos: FalloComparadorSelectorPreventivo[] = [];
  const patronesFalla: Record<string, number> = {};
  let recomendacionesCorrectas = 0;
  let casosSimplesSobredocumentados = 0;
  let casosCriticosSubdocumentados = 0;
  let fallbackIncorrecto = 0;
  let preventivoIncorrecto = 0;
  let requiereRevisionIncorrecto = 0;
  let textosProhibidos = 0;
  let aliasFaltantes = 0;

  for (const caso of CASOS_COMPARADOR_SELECTOR_PREVENTIVO) {
    const comparacion = construirComparacionSelectorPreventivo(entradaDesdeCaso(caso));
    const errores: string[] = [];
    let severidad: "menor" | "critico" = "menor";

    if (comparacion.recomendacionModo === caso.recomendacionEsperada) {
      recomendacionesCorrectas += 1;
    } else {
      errores.push(`Recomendacion obtenida ${comparacion.recomendacionModo}; esperada ${caso.recomendacionEsperada}.`);
      severidad = "critico";
      registrarPatron(patronesFalla, "recomendacion");
      if (comparacion.recomendacionModo === "mantener_fallback_actual") fallbackIncorrecto += 1;
      if (comparacion.recomendacionModo === "usar_preventivo") preventivoIncorrecto += 1;
      if (comparacion.recomendacionModo === "requiere_revision") requiereRevisionIncorrecto += 1;
    }

    const documentos = comparacion.aliasSemanticosPreventivos.documentos_requeridos || [];
    const documentosProhibidos = documentos.filter((documento) => caso.documentosProhibidos.includes(documento));
    const documentosFaltantes = caso.documentosEsperados.filter((documento) => !documentos.includes(documento));

    if (documentosProhibidos.length > 0) {
      errores.push(`Documentos prohibidos seleccionados: ${documentosProhibidos.join(", ")}.`);
      severidad = "critico";
      registrarPatron(patronesFalla, "sobredocumentacion");
      if (caso.tipo === "simple") casosSimplesSobredocumentados += 1;
    }

    if (documentosFaltantes.length > 0) {
      errores.push(`Documentos esperados ausentes: ${documentosFaltantes.join(", ")}.`);
      severidad = "critico";
      registrarPatron(patronesFalla, "subdocumentacion");
      if (caso.tipo === "critico") casosCriticosSubdocumentados += 1;
    }

    if (caso.debeTenerAlias && !comparacion.aliasSemanticosPreventivos.riesgo_especifico_detectado) {
      aliasFaltantes += 1;
      errores.push("Alias de riesgo especifico ausente.");
      severidad = "critico";
      registrarPatron(patronesFalla, "alias");
    }

    if (
      caso.debeDetectarFaltaAnclaje &&
      !comparacion.formularioPreventivoResumen.requiereAnclaje &&
      comparacion.recomendacionModo !== "requiere_revision"
    ) {
      errores.push("No se detecto falta de anclaje.");
      severidad = "critico";
      registrarPatron(patronesFalla, "anclaje");
    }

    const textoComparable = [
      ...comparacion.preguntasPreventivasSugeridas.map((pregunta) => pregunta.texto),
      ...comparacion.preguntasPreventivasBloqueadas.flatMap((pregunta) => [pregunta.texto, pregunta.motivo]),
      ...comparacion.diferenciasClave,
      ...comparacion.advertencias,
    ].join(" ");
    if (contieneTextoProhibido(textoComparable)) {
      textosProhibidos += 1;
      errores.push("Texto interno prohibido detectado.");
      severidad = "critico";
      registrarPatron(patronesFalla, "textos_prohibidos");
    }

    if (caso.tipo === "simple" && comparacion.riesgosSobredocumentacion.length > 0) {
      casosSimplesSobredocumentados += 1;
      errores.push("Caso simple con riesgo de sobredocumentacion.");
      severidad = "critico";
      registrarPatron(patronesFalla, "sobredocumentacion");
    }

    if (caso.tipo === "critico" && comparacion.riesgosSubdocumentacion.length > 0) {
      casosCriticosSubdocumentados += 1;
      errores.push("Caso critico con riesgo de subdocumentacion.");
      severidad = "critico";
      registrarPatron(patronesFalla, "subdocumentacion");
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
    recomendacionesCorrectas,
    casosSimplesSobredocumentados,
    casosCriticosSubdocumentados,
    fallbackIncorrecto,
    preventivoIncorrecto,
    requiereRevisionIncorrecto,
    textosProhibidos,
    aliasFaltantes,
    fallidos,
    patronesFalla,
  };
};
