import type {
  DocumentoPreventivoAplicable,
} from "./aplicabilidadPreventivaV2";
import {
  PREGUNTAS_PREVENTIVAS_TIPADAS,
  TIPOS_RESPUESTA_PREVENTIVA,
  obtenerPreguntasPorActividadObra,
  obtenerPreguntasPorDesviacion,
  obtenerPreguntasPorFamiliaPreventiva,
  obtenerPreguntasPorFase,
  obtenerResumenCatalogoPreguntasPreventivas,
  seleccionarPreguntasPreventivas,
  type EntradaPreguntasPreventivas,
  type PreguntaPreventivaSeleccionada,
  type TipoRespuestaPreventivaId,
} from "./preguntasPreventivasTipadasV2";
import type { ActividadObraId } from "./bibliotecaActividadesObraV2";
import type {
  DesviacionPreventivaId,
  FamiliaTaxonomiaPreventivaId,
} from "./taxonomiaPreventivaV2";

export type CasoPruebaPreguntasPreventivas = {
  id: string;
  descripcionHallazgo: string;
  riesgoEspecifico?: string;
  contextoRouterSimulado?: EntradaPreguntasPreventivas["contextoRouterSimulado"];
  actividadDetectada?: ActividadObraId;
  preguntasEsperadas: string[];
  preguntasProhibidas: string[];
  tiposRespuestaEsperados: TipoRespuestaPreventivaId[];
  documentosEsperados: DocumentoPreventivoAplicable[];
  documentosProhibidos: DocumentoPreventivoAplicable[];
  debePedirAnclaje: boolean;
  debeEvitarSobredocumentacion: boolean;
  debeEvitarSubdocumentacion: boolean;
  resultadoEsperado: string;
};

export type FalloPreguntasPreventivas = {
  id: string;
  descripcion: string;
  errores: string[];
  severidad: "menor" | "critico";
};

export type ResultadoBancoPreguntasPreventivas = {
  totalCasos: number;
  correctos: number;
  erroresMenores: number;
  erroresCriticos: number;
  porcentajeCumplimiento: number;
  preguntasIncoherentes: number;
  opcionesIncompatibles: number;
  textosProhibidos: number;
  casosSimplesSobredocumentados: number;
  casosCriticosSubpreguntados: number;
  preguntasDuplicadas: number;
  preguntasSinTipo: number;
  preguntasSinOpcionesCuandoCorresponde: number;
  fallidos: FalloPreguntasPreventivas[];
  patronesFalla: Record<string, number>;
};

const PREGUNTAS_DOCUMENTALES_PRINCIPALES = [
  "documental_procedimiento_1",
  "documental_ast_art_2",
  "documental_pts_3",
  "documental_permiso_autorizacion_4",
  "documental_matriz_riesgos_5",
];

const DOCUMENTOS_FORMALES: DocumentoPreventivoAplicable[] = [
  "procedimiento",
  "ast_art",
  "pts",
  "permiso_autorizacion",
  "matriz_riesgos",
];

const crearResultado = (
  familiaPrimariaId: FamiliaTaxonomiaPreventivaId,
  opciones?: {
    familiasSecundariasIds?: FamiliaTaxonomiaPreventivaId[];
    desviacionesIds?: DesviacionPreventivaId[];
    suficienciaTecnica?: "insuficiente" | "parcial" | "suficiente";
    confianzaClasificacion?: "baja" | "media" | "alta";
  },
): EntradaPreguntasPreventivas["contextoRouterSimulado"] => ({
  familiaPrimariaId,
  familiasSecundariasIds: opciones?.familiasSecundariasIds ?? [],
  desviacionesIds: opciones?.desviacionesIds ?? ["condicion_insegura"],
  suficienciaTecnica: opciones?.suficienciaTecnica ?? "suficiente",
  confianzaClasificacion: opciones?.confianzaClasificacion ?? "alta",
});

const crearCaso = (
  id: string,
  descripcionHallazgo: string,
  riesgoEspecifico: string | undefined,
  entrada: {
    familia: FamiliaTaxonomiaPreventivaId;
    actividad?: ActividadObraId;
    desviaciones?: DesviacionPreventivaId[];
    documentosEsperados?: DocumentoPreventivoAplicable[];
    documentosProhibidos?: DocumentoPreventivoAplicable[];
    tipos?: TipoRespuestaPreventivaId[];
    preguntasEsperadas?: string[];
    preguntasProhibidas?: string[];
    debePedirAnclaje?: boolean;
    simple?: boolean;
    ambiguo?: boolean;
  },
): CasoPruebaPreguntasPreventivas => ({
  id,
  descripcionHallazgo,
  riesgoEspecifico,
  actividadDetectada: entrada.actividad,
  contextoRouterSimulado: crearResultado(entrada.familia, {
    desviacionesIds: entrada.desviaciones,
    suficienciaTecnica: entrada.ambiguo ? "insuficiente" : "suficiente",
    confianzaClasificacion: entrada.ambiguo ? "baja" : "alta",
  }),
  preguntasEsperadas: entrada.preguntasEsperadas ?? [],
  preguntasProhibidas: entrada.preguntasProhibidas ?? [],
  tiposRespuestaEsperados: entrada.tipos ?? ["control_existente", "accion_inmediata"],
  documentosEsperados: entrada.documentosEsperados ?? [],
  documentosProhibidos: entrada.documentosProhibidos ?? [],
  debePedirAnclaje: entrada.debePedirAnclaje ?? !riesgoEspecifico,
  debeEvitarSobredocumentacion: Boolean(entrada.simple),
  debeEvitarSubdocumentacion: !entrada.simple,
  resultadoEsperado: entrada.simple
    ? "Debe priorizar accion simple y evidencia sin documentacion formal habilitante."
    : "Debe seleccionar preguntas coherentes con familia, actividad y aplicabilidad preventiva.",
});

const CASOS_SIMPLES: CasoPruebaPreguntasPreventivas[] = [
  ["simple-001", "Vaso trizado retirado de comedor.", "vaso trizado"],
  ["simple-002", "Goma de piso despegada en acceso a casino.", "goma de piso"],
  ["simple-003", "Material menor en transito retirado del pasillo.", "material menor"],
  ["simple-004", "Limpieza simple pendiente en zona comun.", "limpieza simple"],
  ["simple-005", "Senaletica menor caida en oficina.", "senaletica menor"],
  ["simple-006", "Residuo comun simple en area de paso.", "residuo comun"],
  ["simple-007", "Vidrio pequeno retirado de inmediato.", "vidrio pequeno"],
  ["simple-008", "Herramienta menor retirada de servicio.", "herramienta menor"],
  ["simple-009", "Derrame menor de agua secado.", "derrame menor de agua"],
  ["simple-010", "Pintura fresca ya senalizada.", "pintura fresca"],
  ["simple-011", "Caja mal ubicada retirada.", "caja mal ubicada"],
  ["simple-012", "Elemento suelto corregido en repisa.", "elemento suelto"],
  ["simple-013", "Dano menor de mobiliario sin exposicion.", "dano menor"],
  ["simple-014", "Envase vacio no peligroso retirado.", "envase vacio"],
  ["simple-015", "Cable ordenado fuera de transito.", "cable ordenado"],
  ["simple-016", "Polvo menor controlado con limpieza.", "polvo menor"],
  ["simple-017", "Aviso impreso caido se vuelve a fijar.", "aviso caido"],
  ["simple-018", "Restos menores de embalaje retirados.", "restos menores"],
  ["simple-019", "Gota de agua secada en lavamanos.", "gota de agua"],
  ["simple-020", "Protector plastico desprendido sin filo.", "protector desprendido"],
  ["simple-021", "Separador fuera de posicion reubicado.", "separador reubicado"],
  ["simple-022", "Cinta vieja retirada tras finalizar tarea.", "cinta vieja"],
  ["simple-023", "Lapiz cortante retirado de escritorio.", "lapiz cortante"],
  ["simple-024", "Marco decorativo con dano menor.", "marco dano menor"],
  ["simple-025", "Bandeja vacia reubicada.", "bandeja reubicada"],
  ["simple-026", "Bolsa liviana retirada del paso.", "bolsa liviana"],
  ["simple-027", "Papel mojado por agua limpia retirado.", "papel mojado"],
  ["simple-028", "Etiqueta menor desprendida en archivo.", "etiqueta desprendida"],
  ["simple-029", "Astilla pequena retirada de acceso.", "astilla retirada"],
  ["simple-030", "Funda plastica rota retirada.", "funda rota"],
].map(([id, descripcion, riesgo]) =>
  crearCaso(id, descripcion, riesgo, {
    familia: "orden_aseo_housekeeping",
    documentosEsperados: ["evidencia_registro"],
    documentosProhibidos: DOCUMENTOS_FORMALES,
    tipos: ["accion_inmediata", "evidencia", "control_existente"],
    preguntasProhibidas: PREGUNTAS_DOCUMENTALES_PRINCIPALES,
    simple: true,
  }),
);

const FAMILIAS_CRITICAS: FamiliaTaxonomiaPreventivaId[] = [
  "trabajos_criticos",
  "energia_loto_electrico",
  "excavaciones_suelos",
  "izaje_gruas_amarre",
  "sustancias_hds",
  "medio_ambiente",
  "mantencion_certificacion",
  "vehiculos_transporte",
  "senalizacion_segregacion",
  "maquinaria_instalaciones",
];

const CASOS_CRITICOS: CasoPruebaPreguntasPreventivas[] = [
  crearCaso("critico-001", "Trabajador sin arnes a 3 metros.", "trabajador sin arnes", {
    familia: "trabajos_criticos",
    actividad: "trabajo_altura_lineas_vida_bordes_aberturas",
    documentosEsperados: ["pts", "permiso_autorizacion", "matriz_riesgos"],
    tipos: ["control_existente", "accion_inmediata", "aplicabilidad_documental"],
  }),
  crearCaso("critico-002", "Trabajo en caliente sin permiso.", "trabajo en caliente", {
    familia: "trabajos_criticos",
    documentosEsperados: ["permiso_autorizacion", "pts"],
    tipos: ["accion_inmediata", "aplicabilidad_documental"],
  }),
  crearCaso("critico-003", "Equipo intervenido sin bloqueo LOTO.", "equipo sin bloqueo", {
    familia: "energia_loto_electrico",
    documentosEsperados: ["bloqueo_loto", "permiso_autorizacion"],
    tipos: ["accion_inmediata", "aplicabilidad_documental"],
  }),
  crearCaso("critico-004", "Excavacion sin entibacion.", "excavacion sin entibacion", {
    familia: "excavaciones_suelos",
    actividad: "excavaciones_movimiento_tierra",
    documentosEsperados: ["pts", "permiso_autorizacion"],
  }),
  crearCaso("critico-005", "Excavacion sin proteccion perimetral.", "excavacion sin proteccion", {
    familia: "excavaciones_suelos",
    actividad: "excavaciones_movimiento_tierra",
    documentosEsperados: ["senalizacion_segregacion", "matriz_riesgos"],
  }),
  crearCaso("critico-006", "Area de izaje sin segregacion.", "izaje sin segregacion", {
    familia: "izaje_gruas_amarre",
    actividad: "izaje_gruas_elementos_amarre_carga_suspendida",
    documentosEsperados: ["senalizacion_segregacion", "permiso_autorizacion"],
  }),
  crearCaso("critico-007", "Trabajador pasa bajo carga suspendida.", "carga suspendida", {
    familia: "izaje_gruas_amarre",
    actividad: "izaje_gruas_elementos_amarre_carga_suspendida",
    documentosEsperados: ["permiso_autorizacion", "matriz_riesgos"],
  }),
  crearCaso("critico-008", "Gasolina en bidon no certificado.", "gasolina en bidon", {
    familia: "sustancias_hds",
    actividad: "sustancias_peligrosas_hds_rotulacion_almacenamiento",
    documentosEsperados: ["hds_sds", "control_ambiental"],
  }),
  crearCaso("critico-009", "Bodega sin HDS.", "bodega sin HDS", {
    familia: "sustancias_hds",
    documentosEsperados: ["hds_sds"],
  }),
  crearCaso("critico-010", "Derrame de combustible al suelo.", "derrame combustible", {
    familia: "medio_ambiente",
    actividad: "derrames_contencion_limpieza_suelo_agua",
    documentosEsperados: ["hds_sds", "control_ambiental"],
  }),
  crearCaso("critico-011", "Residuo peligroso mal segregado.", "residuo peligroso", {
    familia: "medio_ambiente",
    documentosEsperados: ["control_ambiental", "hds_sds"],
  }),
  crearCaso("critico-012", "Sustancia sin rotulacion.", "sustancia sin rotulacion", {
    familia: "sustancias_hds",
    documentosEsperados: ["hds_sds", "inspeccion"],
  }),
  crearCaso("critico-013", "Matriz de riesgo sin actualizar para tarea critica.", "matriz sin actualizar", {
    familia: "documental_legal",
    actividad: "matriz_riesgos_iper_actualizacion_cobertura",
    documentosEsperados: ["matriz_riesgos", "ast_art"],
  }),
  crearCaso("critico-014", "PTS faltante en trabajo critico.", "PTS faltante", {
    familia: "documental_legal",
    actividad: "procedimientos_pts_ast_art_permisos_trabajo",
    documentosEsperados: ["pts", "matriz_riesgos"],
  }),
  crearCaso("critico-015", "AST/ART faltante en tarea de riesgo.", "AST faltante", {
    familia: "documental_legal",
    documentosEsperados: ["ast_art", "matriz_riesgos"],
  }),
  crearCaso("critico-016", "Certificacion vencida de eslinga.", "eslinga vencida", {
    familia: "mantencion_certificacion",
    actividad: "certificaciones_mantenciones_inspecciones_equipos",
    documentosEsperados: ["certificacion_mantencion", "inspeccion"],
  }),
  crearCaso("critico-017", "Equipo critico sin mantencion.", "equipo sin mantencion", {
    familia: "mantencion_certificacion",
    documentosEsperados: ["certificacion_mantencion", "inspeccion"],
  }),
  crearCaso("critico-018", "Tablero electrico sin proteccion.", "tablero sin proteccion", {
    familia: "energia_loto_electrico",
    actividad: "electricidad_provisoria_faena",
    documentosEsperados: ["bloqueo_loto", "procedimiento"],
  }),
  crearCaso("critico-019", "Conduccion imprudente en obra.", "conduccion imprudente", {
    familia: "vehiculos_transporte",
    actividad: "vehiculos_transporte_interno_trabajadores_materiales",
    documentosEsperados: ["procedimiento", "matriz_riesgos"],
  }),
  crearCaso("critico-020", "Ingreso a zona restringida sin autorizacion.", "zona restringida", {
    familia: "senalizacion_segregacion",
    documentosEsperados: ["permiso_autorizacion", "matriz_riesgos"],
  }),
  ...Array.from({ length: 20 }, (_, index) =>
    crearCaso(`critico-extra-${index + 1}`, `Condicion critica ${index + 1} con control preventivo ausente.`, `control critico ${index + 1}`, {
      familia: FAMILIAS_CRITICAS[index % FAMILIAS_CRITICAS.length],
      documentosEsperados: ["matriz_riesgos"],
      tipos: ["control_existente", "accion_inmediata"],
    }),
  ),
];

const CASOS_DOCUMENTALES: CasoPruebaPreguntasPreventivas[] = [
  "procedimiento",
  "ast_art",
  "pts",
  "permiso_autorizacion",
  "matriz_riesgos",
  "charla_difusion",
  "hds_sds",
  "certificacion_mantencion",
  "inspeccion",
  "evidencia_registro",
].flatMap((documento, index) => [
  crearCaso(`documental-${index + 1}-a`, `Revision documental ${documento} asociada a tarea critica.`, `${documento} requerido`, {
    familia: "documental_legal",
    documentosEsperados: [documento as DocumentoPreventivoAplicable],
    tipos: ["aplicabilidad_documental"],
  }),
  crearCaso(`documental-${index + 1}-b`, `Respaldo preventivo ${documento} pendiente de verificacion.`, `${documento} pendiente`, {
    familia: documento === "hds_sds" ? "sustancias_hds" : "documental_legal",
    documentosEsperados: [documento as DocumentoPreventivoAplicable],
    tipos: ["aplicabilidad_documental"],
  }),
]);

const CASOS_AMBIGUOS: CasoPruebaPreguntasPreventivas[] = Array.from({ length: 10 }, (_, index) =>
  crearCaso(`ambiguo-${index + 1}`, `Se observa condicion preventiva no descrita con claridad ${index + 1}.`, undefined, {
    familia: FAMILIAS_CRITICAS[index % FAMILIAS_CRITICAS.length],
    debePedirAnclaje: true,
    preguntasEsperadas: ["transversal_anclaje_riesgo_especifico"],
    tipos: ["texto_breve", "ambito_general", "control_existente"],
    ambiguo: true,
  }),
);

export const CASOS_PRUEBA_PREGUNTAS_PREVENTIVAS: CasoPruebaPreguntasPreventivas[] = [
  ...CASOS_SIMPLES,
  ...CASOS_CRITICOS,
  ...CASOS_DOCUMENTALES,
  ...CASOS_AMBIGUOS,
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

const TIPOS_CON_OPCIONES = new Set(
  TIPOS_RESPUESTA_PREVENTIVA.filter((tipo) => tipo.requiereOpciones).map((tipo) => tipo.id),
);

const agregarPatron = (patrones: Record<string, number>, patron: string) => {
  patrones[patron] = (patrones[patron] ?? 0) + 1;
};

const visiblePregunta = (pregunta: { texto: string; ayuda?: string; objetivoTecnico?: string; opciones?: { texto: string }[] }) =>
  [pregunta.texto, pregunta.ayuda, pregunta.objetivoTecnico, ...(pregunta.opciones ?? []).map((opcion) => opcion.texto)].join(" ");

const validarCoherenciaPregunta = () => {
  const incoherentes: string[] = [];
  const incompatibles: string[] = [];
  const sinTipo: string[] = [];
  const sinOpciones: string[] = [];
  const tipos = new Set(TIPOS_RESPUESTA_PREVENTIVA.map((tipo) => tipo.id));

  for (const pregunta of PREGUNTAS_PREVENTIVAS_TIPADAS) {
    if (!tipos.has(pregunta.tipoRespuesta)) sinTipo.push(pregunta.id);
    if (TIPOS_CON_OPCIONES.has(pregunta.tipoRespuesta) && pregunta.opciones.length === 0) {
      sinOpciones.push(pregunta.id);
    }
    if (pregunta.texto.includes("documento") && pregunta.tipoRespuesta === "exposicion") {
      incoherentes.push(pregunta.id);
    }
    if (pregunta.texto.includes("expuesto") && pregunta.tipoRespuesta === "cumplimiento") {
      incoherentes.push(pregunta.id);
    }
    if (pregunta.tipoRespuesta === "exposicion" && pregunta.opciones.some((opcion) => opcion.texto.includes("Cumple"))) {
      incompatibles.push(pregunta.id);
    }
    if (pregunta.tipoRespuesta === "aplicabilidad_documental" && pregunta.opciones.some((opcion) => opcion.texto.includes("Trabajadores"))) {
      incompatibles.push(pregunta.id);
    }
  }

  return { incoherentes, incompatibles, sinTipo, sinOpciones };
};

const preguntasDuplicadas = () => {
  const vistos = new Map<string, string>();
  const duplicadas: string[] = [];
  for (const pregunta of PREGUNTAS_PREVENTIVAS_TIPADAS) {
    const clave = pregunta.texto.trim().toLowerCase();
    const existente = vistos.get(clave);
    if (existente) duplicadas.push(`${existente}/${pregunta.id}`);
    vistos.set(clave, pregunta.id);
  }
  return duplicadas;
};

const contarTextosProhibidos = () =>
  PREGUNTAS_PREVENTIVAS_TIPADAS.filter((pregunta) =>
    TEXTOS_PROHIBIDOS.some((texto) => visiblePregunta(pregunta).includes(texto)),
  ).length;

const contieneDocumento = (
  preguntas: PreguntaPreventivaSeleccionada[],
  documento: DocumentoPreventivoAplicable,
) => preguntas.some((pregunta) => pregunta.documentosRelacionados.includes(documento));

const contienePregunta = (preguntas: PreguntaPreventivaSeleccionada[], id: string) =>
  preguntas.some((pregunta) => pregunta.id === id);

export const evaluarBancoPreguntasPreventivas = (): ResultadoBancoPreguntasPreventivas => {
  const resumen = obtenerResumenCatalogoPreguntasPreventivas();
  const coherencia = validarCoherenciaPregunta();
  const duplicadas = preguntasDuplicadas();
  const textosProhibidos = contarTextosProhibidos();
  const fallidos: FalloPreguntasPreventivas[] = [];
  const patronesFalla: Record<string, number> = {};
  let casosSimplesSobredocumentados = 0;
  let casosCriticosSubpreguntados = 0;

  const validacionesCatalogo = [
    resumen.totalPreguntas >= 180 ? "" : "Catalogo con menos de 180 preguntas.",
    resumen.preguntasTransversales >= 20 ? "" : "Menos de 20 preguntas transversales.",
    resumen.preguntasFamilia >= 80 ? "" : "Menos de 80 preguntas por familias.",
    resumen.preguntasActividad >= 50 ? "" : "Menos de 50 preguntas por actividades.",
    resumen.preguntasDocumentales >= 20 ? "" : "Menos de 20 preguntas documentales.",
    resumen.preguntasEvidenciaCierre >= 10 ? "" : "Menos de 10 preguntas de evidencia/cierre.",
    obtenerPreguntasPorFase("anclaje_riesgo").length > 0 ? "" : "No existe pregunta de anclaje.",
  ].filter(Boolean);

  if (validacionesCatalogo.length > 0) {
    fallidos.push({
      id: "catalogo",
      descripcion: "Validacion general del catalogo",
      errores: validacionesCatalogo,
      severidad: "critico",
    });
  }

  const familiasSinPreguntas = FAMILIAS_A_VALIDAR.filter(
    (familia) => obtenerPreguntasPorFamiliaPreventiva(familia).length < 4,
  );
  const actividadesSinPreguntas = ACTIVIDADES_A_VALIDAR.filter(
    (actividad) => obtenerPreguntasPorActividadObra(actividad).length < 3,
  );
  const desviacionesSinPreguntas = DESVIACIONES_A_VALIDAR.filter(
    (desviacion) => obtenerPreguntasPorDesviacion(desviacion).length < 1,
  );
  if (familiasSinPreguntas.length > 0 || actividadesSinPreguntas.length > 0 || desviacionesSinPreguntas.length > 0) {
    fallidos.push({
      id: "cobertura",
      descripcion: "Cobertura minima por familia, actividad y desviacion",
      errores: [
        familiasSinPreguntas.length ? `Familias sin minimo: ${familiasSinPreguntas.join(", ")}` : "",
        actividadesSinPreguntas.length ? `Actividades sin minimo: ${actividadesSinPreguntas.join(", ")}` : "",
        desviacionesSinPreguntas.length ? `Desviaciones sin minimo: ${desviacionesSinPreguntas.join(", ")}` : "",
      ].filter(Boolean),
      severidad: "critico",
    });
  }

  for (const caso of CASOS_PRUEBA_PREGUNTAS_PREVENTIVAS) {
    const preguntas = seleccionarPreguntasPreventivas({
      descripcionHallazgo: caso.descripcionHallazgo,
      riesgoEspecifico: caso.riesgoEspecifico,
      actividadDetectada: caso.actividadDetectada,
      contextoRouterSimulado: caso.contextoRouterSimulado,
      maximoSugerido: 40,
    });
    const errores: string[] = [];

    for (const preguntaEsperada of caso.preguntasEsperadas) {
      if (!contienePregunta(preguntas, preguntaEsperada)) {
        errores.push(`No selecciono pregunta esperada ${preguntaEsperada}.`);
        agregarPatron(patronesFalla, "pregunta_esperada_ausente");
      }
    }
    for (const preguntaProhibida of caso.preguntasProhibidas) {
      if (contienePregunta(preguntas, preguntaProhibida)) {
        errores.push(`Selecciono pregunta prohibida ${preguntaProhibida}.`);
        agregarPatron(patronesFalla, "pregunta_prohibida");
      }
    }
    for (const tipo of caso.tiposRespuestaEsperados) {
      if (!preguntas.some((pregunta) => pregunta.tipoRespuesta === tipo)) {
        errores.push(`No selecciono tipo de respuesta ${tipo}.`);
        agregarPatron(patronesFalla, "tipo_esperado_ausente");
      }
    }
    for (const documento of caso.documentosEsperados) {
      if (!contieneDocumento(preguntas, documento)) {
        errores.push(`No selecciono documento/control ${documento}.`);
        agregarPatron(patronesFalla, "documento_esperado_ausente");
      }
    }
    for (const documento of caso.documentosProhibidos) {
      if (contieneDocumento(preguntas, documento)) {
        errores.push(`Selecciono documento/control prohibido ${documento}.`);
        agregarPatron(patronesFalla, "sobredocumentacion");
      }
    }
    if (caso.debePedirAnclaje !== contienePregunta(preguntas, "transversal_anclaje_riesgo_especifico")) {
      errores.push("La pregunta de anclaje no coincide con lo esperado.");
      agregarPatron(patronesFalla, "anclaje_incorrecto");
    }
    if (caso.debeEvitarSobredocumentacion && DOCUMENTOS_FORMALES.some((documento) => contieneDocumento(preguntas, documento))) {
      errores.push("Caso simple sobredocumentado.");
      casosSimplesSobredocumentados += 1;
      agregarPatron(patronesFalla, "caso_simple_sobredocumentado");
    }
    if (caso.debeEvitarSubdocumentacion && preguntas.length < 4) {
      errores.push("Caso critico con muy pocas preguntas seleccionadas.");
      casosCriticosSubpreguntados += 1;
      agregarPatron(patronesFalla, "caso_critico_subpreguntado");
    }

    if (errores.length > 0) {
      fallidos.push({
        id: caso.id,
        descripcion: caso.descripcionHallazgo,
        errores,
        severidad: errores.some((error) => error.includes("prohibid") || error.includes("sobredocumentado"))
          ? "critico"
          : "menor",
      });
    }
  }

  const erroresCriticos = fallidos.filter((fallo) => fallo.severidad === "critico").length;
  const erroresMenores = fallidos.length - erroresCriticos;
  const correctos = CASOS_PRUEBA_PREGUNTAS_PREVENTIVAS.length - fallidos.filter((fallo) => fallo.id !== "catalogo" && fallo.id !== "cobertura").length;

  return {
    totalCasos: CASOS_PRUEBA_PREGUNTAS_PREVENTIVAS.length,
    correctos,
    erroresMenores,
    erroresCriticos,
    porcentajeCumplimiento: Math.round((correctos / CASOS_PRUEBA_PREGUNTAS_PREVENTIVAS.length) * 100),
    preguntasIncoherentes: coherencia.incoherentes.length,
    opcionesIncompatibles: coherencia.incompatibles.length,
    textosProhibidos,
    casosSimplesSobredocumentados,
    casosCriticosSubpreguntados,
    preguntasDuplicadas: duplicadas.length,
    preguntasSinTipo: coherencia.sinTipo.length,
    preguntasSinOpcionesCuandoCorresponde: coherencia.sinOpciones.length,
    fallidos,
    patronesFalla,
  };
};

const FAMILIAS_A_VALIDAR: FamiliaTaxonomiaPreventivaId[] = [
  "seguridad_trabajadores",
  "documental_legal",
  "orden_aseo_housekeeping",
  "herramientas_equipos",
  "maquinaria_instalaciones",
  "vehiculos_transporte",
  "izaje_gruas_amarre",
  "trabajos_criticos",
  "epp",
  "sustancias_hds",
  "medio_ambiente",
  "equipos_emergencia",
  "senalizacion_segregacion",
  "clima_entorno",
  "dano_material",
  "capacitacion_evidencias",
  "mantencion_certificacion",
  "emergencias_reales",
  "higiene_ocupacional",
  "ergonomia_manejo_manual",
  "excavaciones_suelos",
  "energia_loto_electrico",
];

const ACTIVIDADES_A_VALIDAR: ActividadObraId[] = [
  "excavaciones_movimiento_tierra",
  "andamios_plataformas_trabajo",
  "trabajo_altura_lineas_vida_bordes_aberturas",
  "electricidad_provisoria_faena",
  "electricidad_definitiva_canalizaciones_tableros",
  "gasfiteria_redes_agua_potable_alcantarillado",
  "pintura_interior_exterior_esmaltes_barnices",
  "empaste_lijado_preparacion_superficies",
  "vidrios_espejos_paneles_fragiles",
  "maquinaria_equipos_moviles_operacion_terreno",
  "vehiculos_transporte_interno_trabajadores_materiales",
  "izaje_gruas_elementos_amarre_carga_suspendida",
  "sustancias_peligrosas_hds_rotulacion_almacenamiento",
  "derrames_contencion_limpieza_suelo_agua",
  "matriz_riesgos_iper_actualizacion_cobertura",
  "procedimientos_pts_ast_art_permisos_trabajo",
  "certificaciones_mantenciones_inspecciones_equipos",
];

const DESVIACIONES_A_VALIDAR: DesviacionPreventivaId[] = [
  "acto_inseguro",
  "condicion_insegura",
  "omision_documental",
  "falta_conocimiento_capacitacion_difusion",
  "desviacion_procedimiento",
  "incumplimiento_control_critico",
  "uso_inadecuado_herramienta_equipo_maquinaria",
  "herramienta_equipo_inadecuado_para_tarea",
  "herramienta_equipo_mal_estado_usado_terreno",
  "evasion_barreras_senalizacion_segregacion",
  "exposicion_linea_fuego",
  "paso_bajo_carga_suspendida",
  "transito_interno_inseguro",
  "dano_material",
  "evento_ambiental",
  "control_critico_ausente_no_verificado",
];
