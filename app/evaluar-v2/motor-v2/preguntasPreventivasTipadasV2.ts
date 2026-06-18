import {
  evaluarAplicabilidadPreventiva,
  type ContextoAplicabilidadPreventiva,
  type DocumentoPreventivoAplicable,
} from "./aplicabilidadPreventivaV2";
import {
  buscarActividadesPorTexto,
  obtenerActividadesObra,
  type ActividadObraId,
} from "./bibliotecaActividadesObraV2";
import {
  clasificarPreventivamentePorAtributos,
  type ResultadoRouterPreventivo,
} from "./routerPreventivoAtributosV2";
import type {
  DesviacionPreventivaId,
  FamiliaTaxonomiaPreventivaId,
} from "./taxonomiaPreventivaV2";

export type TipoRespuestaPreventivaId =
  | "texto_breve"
  | "seleccion_unica"
  | "seleccion_multiple"
  | "si_no_no_verificable"
  | "cumplimiento"
  | "estado_equipo"
  | "ambito_general"
  | "acto_condicion_ambas"
  | "exposicion"
  | "consecuencia_probable"
  | "control_existente"
  | "aplicabilidad_documental"
  | "accion_inmediata"
  | "evidencia"
  | "criticidad_orientativa";

export type FasePreguntaPreventiva =
  | "anclaje_riesgo"
  | "aclaracion_inicial"
  | "clasificacion_preventiva"
  | "acto_condicion"
  | "exposicion"
  | "consecuencia"
  | "control_faltante"
  | "actividad_familia"
  | "aplicabilidad_documental"
  | "accion_inmediata"
  | "evidencia_cierre"
  | "revision_tecnica";

export type OpcionRespuestaPreventiva = {
  id: string;
  texto: string;
};

export type TipoRespuestaPreventiva = {
  id: TipoRespuestaPreventivaId;
  nombre: string;
  requiereOpciones: boolean;
  opciones: OpcionRespuestaPreventiva[];
};

export type PreguntaPreventivaTipada = {
  id: string;
  texto: string;
  ayuda?: string;
  objetivoTecnico: string;
  fasePregunta: FasePreguntaPreventiva;
  tipoRespuesta: TipoRespuestaPreventivaId;
  opciones: OpcionRespuestaPreventiva[];
  datoCapturado: string;
  familiasPreventivas: FamiliaTaxonomiaPreventivaId[];
  actividadesObra: ActividadObraId[];
  desviacionesPreventivas: DesviacionPreventivaId[];
  documentosRelacionados: DocumentoPreventivoAplicable[];
  prioridad: number;
  obligatoria: boolean;
  aclaratoria: boolean;
  documental: boolean;
  erroresEvitados: string[];
};

export type EntradaPreguntasPreventivas = {
  descripcionHallazgo: string;
  riesgoEspecifico?: string;
  actividadDetectada?: ActividadObraId | string;
  contextoRouterSimulado?: Partial<ResultadoRouterPreventivo>;
  contextoAplicabilidad?: Partial<ContextoAplicabilidadPreventiva>;
  maximoSugerido?: number;
};

export type ContextoPreguntasPreventivas = {
  descripcionHallazgo: string;
  riesgoEspecifico?: string;
  textoAnalisis: string;
  resultadoClasificacion: ResultadoRouterPreventivo;
  actividadesDetectadas: ActividadObraId[];
  aplicabilidad: ReturnType<typeof evaluarAplicabilidadPreventiva>;
  documentosPermitidos: DocumentoPreventivoAplicable[];
  documentosBloqueados: DocumentoPreventivoAplicable[];
  requiereAnclajeRiesgo: boolean;
  requiereAclaracion: boolean;
  esHallazgoSimple: boolean;
  esTrabajoCritico: boolean;
  maximoSugerido: number;
};

export type PreguntaPreventivaSeleccionada = PreguntaPreventivaTipada & {
  razonSeleccion: string;
  bloqueadaPorAplicabilidad: boolean;
};

const opciones = (items: string[]): OpcionRespuestaPreventiva[] =>
  items.map((texto, index) => ({
    id: `opcion_${index + 1}`,
    texto,
  }));

export const TIPOS_RESPUESTA_PREVENTIVA: TipoRespuestaPreventiva[] = [
  { id: "texto_breve", nombre: "Texto breve", requiereOpciones: false, opciones: [] },
  { id: "seleccion_unica", nombre: "Seleccion unica", requiereOpciones: true, opciones: opciones(["Opcion principal", "Otra opcion", "No verificable"]) },
  { id: "seleccion_multiple", nombre: "Seleccion multiple", requiereOpciones: true, opciones: opciones(["Una condicion", "Mas de una condicion", "No verificable"]) },
  { id: "si_no_no_verificable", nombre: "Si, no o no verificable", requiereOpciones: true, opciones: opciones(["Si", "No", "No verificable"]) },
  { id: "cumplimiento", nombre: "Cumplimiento", requiereOpciones: true, opciones: opciones(["Cumple", "Cumple parcialmente", "No cumple", "No aplica", "No verificable"]) },
  { id: "estado_equipo", nombre: "Estado de equipo", requiereOpciones: true, opciones: opciones(["Operativo y vigente", "Operativo con observacion", "Deteriorado", "Vencido o sin mantencion", "No verificable"]) },
  { id: "ambito_general", nombre: "Ambito general", requiereOpciones: true, opciones: opciones(["Seguridad de trabajadores", "Medio ambiente", "Dano material/equipo/infraestructura", "Documental/legal", "Operacional", "Mas de uno", "No verificable"]) },
  { id: "acto_condicion_ambas", nombre: "Acto o condicion", requiereOpciones: true, opciones: opciones(["Conducta observada", "Condicion del entorno/equipo", "Ambas", "No verificable"]) },
  { id: "exposicion", nombre: "Exposicion", requiereOpciones: true, opciones: opciones(["Trabajadores", "Terceros", "Maquinaria/equipos", "Infraestructura", "Medio ambiente", "Mas de uno", "No verificable"]) },
  { id: "consecuencia_probable", nombre: "Consecuencia probable", requiereOpciones: true, opciones: opciones(["Lesion a personas", "Dano material", "Impacto ambiental", "Interrupcion operacional", "Incumplimiento documental", "Mas de una consecuencia", "No verificable"]) },
  { id: "control_existente", nombre: "Control existente", requiereOpciones: true, opciones: opciones(["Si, control suficiente", "Si, control parcial", "No existe control visible", "No verificable", "No aplica"]) },
  { id: "aplicabilidad_documental", nombre: "Aplicabilidad documental", requiereOpciones: true, opciones: opciones(["Documento habilitante requerido", "Respaldo administrativo requerido", "No corresponde documentacion formal", "No verificable"]) },
  { id: "accion_inmediata", nombre: "Accion inmediata", requiereOpciones: true, opciones: opciones(["Retirar", "Reparar", "Segregar", "Senalizar", "Bloquear", "Detener actividad", "Contener derrame", "Regularizar documentacion", "No verificable"]) },
  { id: "evidencia", nombre: "Evidencia", requiereOpciones: true, opciones: opciones(["Evidencia suficiente", "Evidencia parcial", "Sin evidencia", "No verificable"]) },
  { id: "criticidad_orientativa", nombre: "Criticidad orientativa", requiereOpciones: true, opciones: opciones(["Baja", "Media", "Alta", "Critica", "Requiere revision tecnica"]) },
];

const opcionesPorTipo = (tipo: TipoRespuestaPreventivaId) =>
  TIPOS_RESPUESTA_PREVENTIVA.find((item) => item.id === tipo)?.opciones ?? [];

const FAMILIAS_PREVENTIVAS: Array<{ id: FamiliaTaxonomiaPreventivaId; nombre: string }> = [
  { id: "seguridad_trabajadores", nombre: "seguridad de trabajadores" },
  { id: "documental_legal", nombre: "gestion documental o legal" },
  { id: "orden_aseo_housekeeping", nombre: "orden y aseo" },
  { id: "herramientas_equipos", nombre: "herramientas y equipos" },
  { id: "maquinaria_instalaciones", nombre: "maquinaria o instalaciones" },
  { id: "vehiculos_transporte", nombre: "vehiculos y transporte" },
  { id: "izaje_gruas_amarre", nombre: "izaje, gruas y amarre" },
  { id: "trabajos_criticos", nombre: "trabajos criticos" },
  { id: "epp", nombre: "elementos de proteccion personal" },
  { id: "sustancias_hds", nombre: "sustancias peligrosas" },
  { id: "medio_ambiente", nombre: "medio ambiente" },
  { id: "equipos_emergencia", nombre: "equipos de emergencia" },
  { id: "senalizacion_segregacion", nombre: "senalizacion y segregacion" },
  { id: "clima_entorno", nombre: "clima o entorno" },
  { id: "dano_material", nombre: "dano material" },
  { id: "capacitacion_evidencias", nombre: "capacitacion y evidencias" },
  { id: "mantencion_certificacion", nombre: "mantencion y certificacion" },
  { id: "emergencias_reales", nombre: "emergencia real" },
  { id: "higiene_ocupacional", nombre: "higiene ocupacional" },
  { id: "ergonomia_manejo_manual", nombre: "ergonomia y manejo manual" },
  { id: "excavaciones_suelos", nombre: "excavaciones y suelos" },
  { id: "energia_loto_electrico", nombre: "energia, bloqueo y electricidad" },
];

const DESVIACIONES_BASE: Array<{ id: DesviacionPreventivaId; nombre: string }> = [
  { id: "acto_inseguro", nombre: "conducta observada" },
  { id: "condicion_insegura", nombre: "condicion insegura" },
  { id: "omision_documental", nombre: "omision documental" },
  { id: "falta_conocimiento_capacitacion_difusion", nombre: "falta de conocimiento o difusion" },
  { id: "desviacion_procedimiento", nombre: "desviacion de procedimiento" },
  { id: "incumplimiento_control_critico", nombre: "incumplimiento de control critico" },
  { id: "uso_inadecuado_herramienta_equipo_maquinaria", nombre: "uso inadecuado de herramienta o equipo" },
  { id: "herramienta_equipo_inadecuado_para_tarea", nombre: "herramienta o equipo inadecuado" },
  { id: "herramienta_equipo_mal_estado_usado_terreno", nombre: "herramienta o equipo en mal estado" },
  { id: "evasion_barreras_senalizacion_segregacion", nombre: "barrera o segregacion no respetada" },
  { id: "exposicion_linea_fuego", nombre: "exposicion a linea de fuego" },
  { id: "paso_bajo_carga_suspendida", nombre: "paso bajo carga suspendida" },
  { id: "transito_interno_inseguro", nombre: "transito interno inseguro" },
  { id: "dano_material", nombre: "dano material" },
  { id: "evento_ambiental", nombre: "evento ambiental" },
  { id: "control_critico_ausente_no_verificado", nombre: "control critico ausente o no verificado" },
];

const ACTIVIDADES_REPRESENTATIVAS: Array<{ id: ActividadObraId; nombre: string }> = [
  { id: "excavaciones_movimiento_tierra", nombre: "excavacion o movimiento de tierra" },
  { id: "andamios_plataformas_trabajo", nombre: "andamio o plataforma" },
  { id: "trabajo_altura_lineas_vida_bordes_aberturas", nombre: "trabajo en altura" },
  { id: "electricidad_provisoria_faena", nombre: "electricidad provisoria" },
  { id: "electricidad_definitiva_canalizaciones_tableros", nombre: "electricidad definitiva" },
  { id: "gasfiteria_redes_agua_potable_alcantarillado", nombre: "gasfiteria o red sanitaria" },
  { id: "pintura_interior_exterior_esmaltes_barnices", nombre: "pintura o barniz" },
  { id: "empaste_lijado_preparacion_superficies", nombre: "empaste o lijado" },
  { id: "vidrios_espejos_paneles_fragiles", nombre: "vidrios o paneles fragiles" },
  { id: "maquinaria_equipos_moviles_operacion_terreno", nombre: "maquinaria movil" },
  { id: "vehiculos_transporte_interno_trabajadores_materiales", nombre: "vehiculos o transporte interno" },
  { id: "izaje_gruas_elementos_amarre_carga_suspendida", nombre: "izaje o carga suspendida" },
  { id: "sustancias_peligrosas_hds_rotulacion_almacenamiento", nombre: "sustancias peligrosas" },
  { id: "derrames_contencion_limpieza_suelo_agua", nombre: "derrame o contencion" },
  { id: "matriz_riesgos_iper_actualizacion_cobertura", nombre: "matriz de riesgos" },
  { id: "procedimientos_pts_ast_art_permisos_trabajo", nombre: "procedimientos o permisos" },
  { id: "certificaciones_mantenciones_inspecciones_equipos", nombre: "certificacion o mantencion" },
];

const pregunta = (base: Omit<PreguntaPreventivaTipada, "opciones">): PreguntaPreventivaTipada => ({
  ...base,
  opciones: opcionesPorTipo(base.tipoRespuesta),
});

const PREGUNTAS_TRANSVERSALES: PreguntaPreventivaTipada[] = [
  pregunta({
    id: "transversal_anclaje_riesgo_especifico",
    texto: "¿Cual es el riesgo especifico detectado?",
    ayuda: "Responda breve, idealmente en 3 a 5 palabras. Ejemplo: vidrio quebrado, trabajador sin arnes, madera con clavos, extintor vencido.",
    objetivoTecnico: "Separar la descripcion extensa del riesgo real observado para orientar la validacion preventiva.",
    fasePregunta: "anclaje_riesgo",
    tipoRespuesta: "texto_breve",
    datoCapturado: "riesgo_especifico",
    familiasPreventivas: [],
    actividadesObra: [],
    desviacionesPreventivas: [],
    documentosRelacionados: [],
    prioridad: 1000,
    obligatoria: true,
    aclaratoria: true,
    documental: false,
    erroresEvitados: ["Evitar clasificacion amplia sin riesgo observado concreto."],
  }),
  ...[
    ["transversal_ambito", "¿Que ambito describe mejor el hallazgo?", "ambito_general", "clasificacion_preventiva", "ambito_preventivo"],
    ["transversal_acto_condicion", "¿El hallazgo corresponde a una conducta observada, una condicion del entorno/equipo o ambas?", "acto_condicion_ambas", "acto_condicion", "tipo_desviacion"],
    ["transversal_exposicion", "¿Quien o que esta expuesto al riesgo?", "exposicion", "exposicion", "exposicion_principal"],
    ["transversal_consecuencia", "¿Que dano podria generar si no se controla?", "consecuencia_probable", "consecuencia", "consecuencia_probable"],
    ["transversal_control", "¿Existe control aplicado en terreno?", "control_existente", "control_faltante", "control_existente"],
    ["transversal_control_suficiente", "¿El control observado es suficiente para continuar?", "control_existente", "control_faltante", "suficiencia_control"],
    ["transversal_accion", "¿Se requiere retiro, reparacion, bloqueo, segregacion o detencion inmediata?", "accion_inmediata", "accion_inmediata", "accion_requerida"],
    ["transversal_evidencia", "¿Existe evidencia o registro disponible?", "evidencia", "evidencia_cierre", "evidencia_disponible"],
    ["transversal_revision", "¿La condicion requiere revision tecnica antes de cerrar?", "si_no_no_verificable", "revision_tecnica", "revision_tecnica"],
    ["transversal_multiamibito", "¿La situacion afecta a trabajadores, ambiente, equipos o mas de un ambito?", "ambito_general", "clasificacion_preventiva", "ambitos_afectados"],
    ["transversal_autorizacion", "¿La actividad estaba autorizada o requería autorizacion?", "si_no_no_verificable", "aplicabilidad_documental", "autorizacion"],
    ["transversal_correccion", "¿La condicion fue corregida inmediatamente?", "si_no_no_verificable", "accion_inmediata", "correccion_inmediata"],
    ["transversal_responsable", "¿Existe responsable definido para el cierre?", "si_no_no_verificable", "evidencia_cierre", "responsable_cierre"],
    ["transversal_repeticion", "¿La condicion puede repetirse si no se actualiza el control preventivo?", "si_no_no_verificable", "revision_tecnica", "potencial_repeticion"],
    ["transversal_criticidad", "¿Que criticidad preventiva orientativa corresponde?", "criticidad_orientativa", "clasificacion_preventiva", "criticidad_orientativa"],
    ["transversal_control_faltante", "¿Que control falta o fallo en terreno?", "control_existente", "control_faltante", "control_faltante"],
    ["transversal_cierre", "¿Que evidencia permitiria verificar el cierre?", "evidencia", "evidencia_cierre", "evidencia_cierre"],
    ["transversal_terceros", "¿Existen terceros o peatones expuestos?", "si_no_no_verificable", "exposicion", "terceros_expuestos"],
    ["transversal_continuidad", "¿La actividad puede continuar con el control actual?", "si_no_no_verificable", "accion_inmediata", "continuidad_operacional"],
  ].map(([id, texto, tipoRespuesta, fasePregunta, datoCapturado], index) =>
    pregunta({
      id,
      texto,
      objetivoTecnico: `Capturar ${datoCapturado} para ordenar la evaluacion preventiva.`,
      fasePregunta: fasePregunta as FasePreguntaPreventiva,
      tipoRespuesta: tipoRespuesta as TipoRespuestaPreventivaId,
      datoCapturado,
      familiasPreventivas: [],
      actividadesObra: [],
      desviacionesPreventivas: [],
      documentosRelacionados: id === "transversal_autorizacion" ? ["permiso_autorizacion"] : [],
      prioridad: 900 - index,
      obligatoria: index < 5,
      aclaratoria: true,
      documental: id === "transversal_autorizacion",
      erroresEvitados: ["Evitar preguntas sin dato tecnico verificable."],
    }),
  ),
];

const PREGUNTAS_FAMILIA: PreguntaPreventivaTipada[] = FAMILIAS_PREVENTIVAS.flatMap((familia, familiaIndex) => {
  const prioridadBase = 700 - familiaIndex * 2;
  return [
    pregunta({
      id: `familia_${familia.id}_exposicion`,
      texto: `¿Que exposicion principal genera el hallazgo de ${familia.nombre}?`,
      objetivoTecnico: "Precisar personas, ambiente, equipos o infraestructura expuesta.",
      fasePregunta: "exposicion",
      tipoRespuesta: "exposicion",
      datoCapturado: `exposicion_${familia.id}`,
      familiasPreventivas: [familia.id],
      actividadesObra: [],
      desviacionesPreventivas: [],
      documentosRelacionados: [],
      prioridad: prioridadBase,
      obligatoria: false,
      aclaratoria: true,
      documental: false,
      erroresEvitados: ["Evitar asumir exposicion sin confirmacion."],
    }),
    pregunta({
      id: `familia_${familia.id}_control`,
      texto: `¿Existe control suficiente para el hallazgo de ${familia.nombre}?`,
      objetivoTecnico: "Verificar si el control observado permite continuidad segura.",
      fasePregunta: "control_faltante",
      tipoRespuesta: "control_existente",
      datoCapturado: `control_${familia.id}`,
      familiasPreventivas: [familia.id],
      actividadesObra: [],
      desviacionesPreventivas: [],
      documentosRelacionados: [],
      prioridad: prioridadBase - 1,
      obligatoria: false,
      aclaratoria: true,
      documental: false,
      erroresEvitados: ["Evitar cerrar hallazgos sin control verificable."],
    }),
    pregunta({
      id: `familia_${familia.id}_accion`,
      texto: `¿Que accion inmediata corresponde para controlar ${familia.nombre}?`,
      objetivoTecnico: "Definir una medida ejecutable de control preventivo.",
      fasePregunta: "accion_inmediata",
      tipoRespuesta: "accion_inmediata",
      datoCapturado: `accion_${familia.id}`,
      familiasPreventivas: [familia.id],
      actividadesObra: [],
      desviacionesPreventivas: [],
      documentosRelacionados: [],
      prioridad: prioridadBase - 2,
      obligatoria: false,
      aclaratoria: false,
      documental: false,
      erroresEvitados: ["Evitar recomendaciones genericas no ejecutables."],
    }),
    pregunta({
      id: `familia_${familia.id}_documento`,
      texto: `¿Existe documento o respaldo aplicable para ${familia.nombre}?`,
      objetivoTecnico: "Distinguir documento habilitante de respaldo administrativo cuando corresponda.",
      fasePregunta: "aplicabilidad_documental",
      tipoRespuesta: "aplicabilidad_documental",
      datoCapturado: `documento_${familia.id}`,
      familiasPreventivas: [familia.id],
      actividadesObra: [],
      desviacionesPreventivas: [],
      documentosRelacionados: ["evidencia_registro"],
      prioridad: prioridadBase - 3,
      obligatoria: false,
      aclaratoria: false,
      documental: true,
      erroresEvitados: ["Evitar sobredocumentar hallazgos simples."],
    }),
  ];
});

const PREGUNTAS_ACTIVIDAD: PreguntaPreventivaTipada[] = ACTIVIDADES_REPRESENTATIVAS.flatMap((actividad, actividadIndex) => {
  const prioridadBase = 560 - actividadIndex * 2;
  return [
    pregunta({
      id: `actividad_${actividad.id}_condicion`,
      texto: `¿Que condicion especifica se observa en ${actividad.nombre}?`,
      objetivoTecnico: "Ajustar la pregunta a la actividad declarada y su condicion visible.",
      fasePregunta: "actividad_familia",
      tipoRespuesta: "texto_breve",
      datoCapturado: `condicion_${actividad.id}`,
      familiasPreventivas: [],
      actividadesObra: [actividad.id],
      desviacionesPreventivas: [],
      documentosRelacionados: [],
      prioridad: prioridadBase,
      obligatoria: false,
      aclaratoria: true,
      documental: false,
      erroresEvitados: ["Evitar abrir un cajon tecnico equivocado."],
    }),
    pregunta({
      id: `actividad_${actividad.id}_control`,
      texto: `¿El control aplicado en ${actividad.nombre} es suficiente?`,
      objetivoTecnico: "Confirmar suficiencia del control segun la actividad.",
      fasePregunta: "control_faltante",
      tipoRespuesta: "control_existente",
      datoCapturado: `control_${actividad.id}`,
      familiasPreventivas: [],
      actividadesObra: [actividad.id],
      desviacionesPreventivas: [],
      documentosRelacionados: [],
      prioridad: prioridadBase - 1,
      obligatoria: false,
      aclaratoria: true,
      documental: false,
      erroresEvitados: ["Evitar continuidad con control parcial no verificado."],
    }),
    pregunta({
      id: `actividad_${actividad.id}_accion`,
      texto: `¿Que accion inmediata corresponde en ${actividad.nombre}?`,
      objetivoTecnico: "Precisar la accion de terreno segun la actividad involucrada.",
      fasePregunta: "accion_inmediata",
      tipoRespuesta: "accion_inmediata",
      datoCapturado: `accion_${actividad.id}`,
      familiasPreventivas: [],
      actividadesObra: [actividad.id],
      desviacionesPreventivas: [],
      documentosRelacionados: [],
      prioridad: prioridadBase - 2,
      obligatoria: false,
      aclaratoria: false,
      documental: false,
      erroresEvitados: ["Evitar accion inmediata desconectada de la tarea."],
    }),
  ];
});

const DOCUMENTOS_PREGUNTA: Array<{ documento: DocumentoPreventivoAplicable; texto: string }> = [
  { documento: "procedimiento", texto: "¿El procedimiento aplicable cubre la condicion observada?" },
  { documento: "ast_art", texto: "¿El AST/ART considera el riesgo especifico detectado?" },
  { documento: "pts", texto: "¿El PTS requerido esta vigente y aplicado en terreno?" },
  { documento: "permiso_autorizacion", texto: "¿La actividad cuenta con permiso o autorizacion exigible?" },
  { documento: "matriz_riesgos", texto: "¿La matriz de riesgos cubre la condicion observada?" },
  { documento: "charla_difusion", texto: "¿Existe difusion o instruccion verificable para el control requerido?" },
  { documento: "hds_sds", texto: "¿La HDS/SDS esta disponible y corresponde a la sustancia observada?" },
  { documento: "certificacion_mantencion", texto: "¿La certificacion o mantencion del equipo esta vigente?" },
  { documento: "inspeccion", texto: "¿Existe inspeccion vigente del equipo, area o condicion?" },
  { documento: "evidencia_registro", texto: "¿Existe registro o evidencia suficiente para respaldar el hallazgo?" },
  { documento: "senalizacion_segregacion", texto: "¿La senalizacion o segregacion impide exposicion no autorizada?" },
  { documento: "retiro_inmediato", texto: "¿La condicion puede controlarse mediante retiro inmediato?" },
  { documento: "bloqueo_loto", texto: "¿Se requiere bloqueo o energia cero antes de intervenir?" },
  { documento: "detencion_actividad", texto: "¿La condicion exige detener la actividad hasta controlar el riesgo?" },
  { documento: "control_ambiental", texto: "¿Existe control ambiental suficiente para contener el impacto?" },
];

const PREGUNTAS_DOCUMENTALES: PreguntaPreventivaTipada[] = [
  ...DOCUMENTOS_PREGUNTA,
  { documento: "procedimiento" as DocumentoPreventivoAplicable, texto: "¿La ausencia del documento afecta un control operativo vigente?" },
  { documento: "ast_art" as DocumentoPreventivoAplicable, texto: "¿El analisis previo fue revisado antes de iniciar la tarea?" },
  { documento: "permiso_autorizacion" as DocumentoPreventivoAplicable, texto: "¿La autorizacion define responsable y vigencia del control?" },
  { documento: "matriz_riesgos" as DocumentoPreventivoAplicable, texto: "¿La condicion requiere actualizar la matriz antes del cierre?" },
  { documento: "evidencia_registro" as DocumentoPreventivoAplicable, texto: "¿El respaldo disponible permite verificar cierre preventivo?" },
].map((item, index) =>
  pregunta({
    id: `documental_${item.documento}_${index + 1}`,
    texto: item.texto,
    objetivoTecnico: "Verificar aplicabilidad documental sin elevar respaldos administrativos simples.",
    fasePregunta: "aplicabilidad_documental",
    tipoRespuesta: "aplicabilidad_documental",
    datoCapturado: `documento_${item.documento}`,
    familiasPreventivas: ["documental_legal"],
    actividadesObra: [],
    desviacionesPreventivas: ["omision_documental"],
    documentosRelacionados: [item.documento],
    prioridad: 500 - index,
    obligatoria: false,
    aclaratoria: false,
    documental: true,
    erroresEvitados: ["Evitar preguntar por documentacion no aplicable."],
  }),
);

const PREGUNTAS_DESVIACION: PreguntaPreventivaTipada[] = DESVIACIONES_BASE.map((desviacion, index) =>
  pregunta({
    id: `desviacion_${desviacion.id}`,
    texto: `¿La desviacion corresponde a ${desviacion.nombre}?`,
    objetivoTecnico: "Confirmar la desviacion preventiva transversal asociada al hallazgo.",
    fasePregunta: "acto_condicion",
    tipoRespuesta: "si_no_no_verificable",
    datoCapturado: `desviacion_${desviacion.id}`,
    familiasPreventivas: [],
    actividadesObra: [],
    desviacionesPreventivas: [desviacion.id],
    documentosRelacionados: [],
    prioridad: 480 - index,
    obligatoria: false,
    aclaratoria: true,
    documental: false,
    erroresEvitados: ["Evitar atribuir causa sin validacion preventiva."],
  }),
);

const PREGUNTAS_EVIDENCIA_CIERRE: PreguntaPreventivaTipada[] = Array.from({ length: 12 }, (_, index) =>
  pregunta({
    id: `evidencia_cierre_${index + 1}`,
    texto: [
      "¿La fotografia muestra claramente la condicion observada?",
      "¿La evidencia permite identificar ubicacion y contexto?",
      "¿La accion de cierre requiere fotografia posterior?",
      "¿El responsable del cierre quedo identificado?",
      "¿Existe registro suficiente para auditoria preventiva?",
      "¿La evidencia muestra el control faltante o fallido?",
      "¿La trazabilidad permite verificar fecha y area?",
      "¿El cierre requiere validacion del supervisor?",
      "¿La condicion corregida puede demostrarse con evidencia simple?",
      "¿Existe respaldo para evitar repeticion del hallazgo?",
      "¿La evidencia disponible es suficiente para informe ejecutivo?",
      "¿Se requiere observacion tecnica complementaria?",
    ][index],
    objetivoTecnico: "Asegurar trazabilidad de cierre y respaldo verificable.",
    fasePregunta: "evidencia_cierre",
    tipoRespuesta: index === 3 || index === 7 || index === 11 ? "si_no_no_verificable" : "evidencia",
    datoCapturado: `evidencia_cierre_${index + 1}`,
    familiasPreventivas: ["capacitacion_evidencias"],
    actividadesObra: [],
    desviacionesPreventivas: [],
    documentosRelacionados: ["evidencia_registro"],
    prioridad: 430 - index,
    obligatoria: false,
    aclaratoria: index === 11,
    documental: false,
    erroresEvitados: ["Evitar cierres sin respaldo verificable."],
  }),
);

export const PREGUNTAS_PREVENTIVAS_TIPADAS: PreguntaPreventivaTipada[] = [
  ...PREGUNTAS_TRANSVERSALES,
  ...PREGUNTAS_FAMILIA,
  ...PREGUNTAS_ACTIVIDAD,
  ...PREGUNTAS_DOCUMENTALES,
  ...PREGUNTAS_DESVIACION,
  ...PREGUNTAS_EVIDENCIA_CIERRE,
];

const normalizar = (valor?: unknown): string => {
  if (Array.isArray(valor)) return valor.map(normalizar).join(" ");
  if (valor === null || valor === undefined) return "";
  return String(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

const contiene = (texto: string, terminos: string[]) =>
  terminos.some((termino) => texto.includes(normalizar(termino)));

const inferirHallazgoSimple = (texto: string) =>
  contiene(texto, [
    "vaso trizado",
    "goma de piso",
    "material menor",
    "limpieza simple",
    "residuo comun",
    "vidrio pequeno",
    "derrame menor de agua",
    "pintura fresca",
    "senaletica menor",
    "herramienta menor",
    "caja mal ubicada",
    "elemento suelto",
    "dano menor",
    "envase vacio",
    "cable ordenado",
    "polvo menor",
    "aviso impreso",
    "restos menores",
    "gota de agua",
    "protector plastico",
    "separador",
    "cinta vieja",
    "lapiz cortante",
    "marco decorativo",
    "bandeja vacia",
    "bolsa liviana",
    "papel mojado",
    "etiqueta menor",
    "astilla pequena",
    "funda plastica",
  ]);

const inferirDocumentosSolicitados = (
  texto: string,
  esSimple: boolean,
): DocumentoPreventivoAplicable[] => {
  if (esSimple) return ["evidencia_registro", "retiro_inmediato"];
  const documentos: DocumentoPreventivoAplicable[] = [];
  if (contiene(texto, ["procedimiento"])) documentos.push("procedimiento");
  if (contiene(texto, ["ast", "art"])) documentos.push("ast_art");
  if (contiene(texto, ["pts"])) documentos.push("pts");
  if (contiene(texto, ["permiso", "autorizacion"])) documentos.push("permiso_autorizacion");
  if (contiene(texto, ["matriz", "tarea de riesgo", "tarea critica", "trabajo critico"])) documentos.push("matriz_riesgos");
  if (contiene(texto, ["charla", "difusion"])) documentos.push("charla_difusion");
  if (contiene(texto, ["hds", "sds", "sustancia", "combustible", "gasolina"])) documentos.push("hds_sds");
  if (contiene(texto, ["certificacion", "mantencion"])) documentos.push("certificacion_mantencion");
  if (contiene(texto, ["inspeccion", "preoperacional"])) documentos.push("inspeccion");
  if (contiene(texto, ["evidencia", "registro", "respaldo"])) documentos.push("evidencia_registro");
  if (contiene(texto, ["segregacion", "senalizacion", "proteccion perimetral"])) documentos.push("senalizacion_segregacion");
  if (contiene(texto, ["bloqueo", "loto", "energia cero"])) documentos.push("bloqueo_loto");
  if (contiene(texto, ["derrame", "ambiental", "residuo peligroso", "combustible"])) documentos.push("control_ambiental");
  return Array.from(new Set(documentos));
};

const unicoPorId = <T extends { id: string }>(items: T[]) => {
  const mapa = new Map<string, T>();
  for (const item of items) {
    if (!mapa.has(item.id)) mapa.set(item.id, item);
  }
  return Array.from(mapa.values());
};

const ordenarPreguntas = (preguntas: PreguntaPreventivaSeleccionada[]) =>
  preguntas.sort((a, b) => b.prioridad - a.prioridad || a.id.localeCompare(b.id));

const inferirAplicabilidad = (
  entrada: EntradaPreguntasPreventivas,
  resultado: ResultadoRouterPreventivo,
): ContextoAplicabilidadPreventiva => {
  const texto = normalizar([entrada.descripcionHallazgo, entrada.riesgoEspecifico, entrada.actividadDetectada]);
  return {
    actividadDetectada: entrada.actividadDetectada,
    familiaPrimaria: resultado.familiaPrimariaId,
    familiasSecundarias: resultado.familiasSecundariasIds,
    desviaciones: resultado.desviacionesIds,
    objeto: resultado.objetoDetectado.join(" "),
    condicion: resultado.condicionDetectada.join(" "),
    exposicion: resultado.exposicionDetectada.join(" "),
    consecuenciaProbable: resultado.consecuenciaProbable.join(" "),
    controlFaltante: resultado.controlFaltanteOFallido.join(" "),
    criticidadOrientativa: contiene(texto, ["critico", "grave", "fatal", "3 metros", "carga suspendida"]) ? "alto" : "medio",
    esTrabajoCritico: contiene(texto, ["altura", "izaje", "excavacion", "trabajo en caliente", "loto", "bloqueo", "espacio confinado", "carga suspendida", "tarea critica", "trabajo critico"]),
    hayEnergiaPeligrosa: contiene(texto, ["loto", "bloqueo", "energia", "tablero", "electrico"]),
    haySustanciaPeligrosa: contiene(texto, ["hds", "sds", "sustancia", "combustible", "gasolina", "quimico"]),
    hayIzaje: contiene(texto, ["izaje", "grua", "eslinga", "carga suspendida"]),
    hayTrabajoAltura: contiene(texto, ["altura", "arnes", "linea de vida", "3 metros"]),
    hayExcavacion: contiene(texto, ["excavacion", "zanja", "entibacion"]),
    hayTrabajoCaliente: contiene(texto, ["trabajo en caliente", "soldadura", "esmeril"]),
    hayMaquinariaMovil: contiene(texto, ["maquinaria", "vehiculo", "conduccion", "equipo movil"]),
    hayDerrame: contiene(texto, ["derrame"]),
    hayAmbienteAfectado: contiene(texto, ["suelo", "agua", "ambiente", "residuo peligroso"]),
    hayEquipoCritico: contiene(texto, ["certificacion", "mantencion", "eslinga", "extintor", "tablero", "equipo critico"]),
    hayCargaSuspendida: contiene(texto, ["carga suspendida"]),
    hayControlCriticoAusente: contiene(texto, ["sin control", "sin permiso", "sin autorizacion", "sin segregacion", "sin bloqueo", "sin proteccion", "sin entibacion"]),
    esHallazgoSimple: inferirHallazgoSimple(texto),
    ...entrada.contextoAplicabilidad,
  };
};

export const obtenerPreguntasPreventivasTipadas = () => [...PREGUNTAS_PREVENTIVAS_TIPADAS];

export const obtenerPreguntaPreventivaPorId = (id: string) =>
  PREGUNTAS_PREVENTIVAS_TIPADAS.find((preguntaItem) => preguntaItem.id === id);

export const obtenerPreguntasPorFamiliaPreventiva = (idFamilia: FamiliaTaxonomiaPreventivaId) =>
  PREGUNTAS_PREVENTIVAS_TIPADAS.filter((preguntaItem) => preguntaItem.familiasPreventivas.includes(idFamilia));

export const obtenerPreguntasPorActividadObra = (idActividad: ActividadObraId) =>
  PREGUNTAS_PREVENTIVAS_TIPADAS.filter((preguntaItem) => preguntaItem.actividadesObra.includes(idActividad));

export const obtenerPreguntasPorDesviacion = (idDesviacion: DesviacionPreventivaId) =>
  PREGUNTAS_PREVENTIVAS_TIPADAS.filter((preguntaItem) => preguntaItem.desviacionesPreventivas.includes(idDesviacion));

export const obtenerPreguntasPorFase = (fase: FasePreguntaPreventiva) =>
  PREGUNTAS_PREVENTIVAS_TIPADAS.filter((preguntaItem) => preguntaItem.fasePregunta === fase);

export const construirContextoPreguntasPreventivas = (
  entrada: EntradaPreguntasPreventivas,
): ContextoPreguntasPreventivas => {
  const textoAnalisis = [entrada.descripcionHallazgo, entrada.riesgoEspecifico].filter(Boolean).join(" ");
  const resultadoBase = clasificarPreventivamentePorAtributos({
    descripcion: entrada.descripcionHallazgo,
    riesgoEspecificoDeclarado: entrada.riesgoEspecifico,
    actividad: entrada.actividadDetectada,
  });
  const resultadoClasificacion: ResultadoRouterPreventivo = {
    ...resultadoBase,
    ...entrada.contextoRouterSimulado,
    familiasSecundariasIds:
      entrada.contextoRouterSimulado?.familiasSecundariasIds ?? resultadoBase.familiasSecundariasIds,
    desviacionesIds: entrada.contextoRouterSimulado?.desviacionesIds ?? resultadoBase.desviacionesIds,
  };
  const actividadesDetectadas = entrada.actividadDetectada
    ? [entrada.actividadDetectada as ActividadObraId]
    : buscarActividadesPorTexto(textoAnalisis).slice(0, 3).map((actividad) => actividad.id);
  const esHallazgoSimple = inferirHallazgoSimple(normalizar(textoAnalisis));
  const aplicabilidad = evaluarAplicabilidadPreventiva(inferirAplicabilidad(entrada, resultadoClasificacion));
  const documentosInferidos = inferirDocumentosSolicitados(normalizar(textoAnalisis), esHallazgoSimple);
  const documentosPermitidos = esHallazgoSimple
    ? Array.from(
        new Set([
          "evidencia_registro",
          "retiro_inmediato",
          "senalizacion_segregacion",
        ] as DocumentoPreventivoAplicable[]),
      )
    : Array.from(new Set([...aplicabilidad.documentosAplicables, ...documentosInferidos]));
  const documentosBloqueados = esHallazgoSimple
    ? (["procedimiento", "ast_art", "pts", "permiso_autorizacion", "matriz_riesgos"] as DocumentoPreventivoAplicable[])
    : aplicabilidad.documentosNoAplicables.filter((documento) => !documentosPermitidos.includes(documento));
  return {
    descripcionHallazgo: entrada.descripcionHallazgo,
    riesgoEspecifico: entrada.riesgoEspecifico,
    textoAnalisis,
    resultadoClasificacion,
    actividadesDetectadas,
    aplicabilidad,
    documentosPermitidos,
    documentosBloqueados,
    requiereAnclajeRiesgo: !entrada.riesgoEspecifico?.trim(),
    requiereAclaracion:
      resultadoClasificacion.suficienciaTecnica === "insuficiente" ||
      resultadoClasificacion.confianzaClasificacion === "baja",
    esHallazgoSimple:
      esHallazgoSimple ||
      aplicabilidad.documentosNoAplicables.some((documento) =>
        ["procedimiento", "ast_art", "pts", "permiso_autorizacion"].includes(documento),
      ),
    esTrabajoCritico:
      aplicabilidad.requiereControlCritico ||
      aplicabilidad.requiereDetencionActividad ||
      aplicabilidad.documentosAplicables.includes("bloqueo_loto"),
    maximoSugerido: entrada.maximoSugerido ?? 12,
  };
};

const preguntaSeleccionada = (
  preguntaItem: PreguntaPreventivaTipada,
  razonSeleccion: string,
): PreguntaPreventivaSeleccionada => ({
  ...preguntaItem,
  razonSeleccion,
  bloqueadaPorAplicabilidad: false,
});

export const seleccionarPreguntasPreventivas = (
  entrada: EntradaPreguntasPreventivas,
): PreguntaPreventivaSeleccionada[] => {
  const contexto = construirContextoPreguntasPreventivas(entrada);
  const seleccion: PreguntaPreventivaSeleccionada[] = [];

  if (contexto.requiereAnclajeRiesgo) {
    seleccion.push(preguntaSeleccionada(PREGUNTAS_TRANSVERSALES[0], "Falta riesgo especifico breve."));
  }

  seleccion.push(
    ...PREGUNTAS_TRANSVERSALES.slice(1, contexto.requiereAclaracion ? 9 : 6).map((preguntaItem) =>
      preguntaSeleccionada(preguntaItem, "Pregunta transversal para completar clasificacion preventiva."),
    ),
  );

  const familias = [
    contexto.resultadoClasificacion.familiaPrimariaId,
    ...contexto.resultadoClasificacion.familiasSecundariasIds,
  ].filter(Boolean) as FamiliaTaxonomiaPreventivaId[];
  for (const familia of familias.slice(0, 3)) {
    seleccion.push(
      ...obtenerPreguntasPorFamiliaPreventiva(familia)
        .filter((preguntaItem) => !preguntaItem.documental)
        .slice(0, 3)
        .map((preguntaItem) => preguntaSeleccionada(preguntaItem, `Familia preventiva detectada: ${familia}.`)),
    );
  }

  for (const actividad of contexto.actividadesDetectadas.slice(0, 2)) {
    seleccion.push(
      ...obtenerPreguntasPorActividadObra(actividad)
        .slice(0, 3)
        .map((preguntaItem) => preguntaSeleccionada(preguntaItem, `Actividad de obra relacionada: ${actividad}.`)),
    );
  }

  for (const desviacion of contexto.resultadoClasificacion.desviacionesIds.slice(0, 2)) {
    seleccion.push(
      ...obtenerPreguntasPorDesviacion(desviacion)
        .slice(0, 1)
        .map((preguntaItem) => preguntaSeleccionada(preguntaItem, `Desviacion preventiva detectada: ${desviacion}.`)),
    );
  }

  const documentosPermitidos = new Set(contexto.documentosPermitidos);
  seleccion.push(
    ...PREGUNTAS_DOCUMENTALES.filter((preguntaItem) =>
      preguntaItem.documentosRelacionados.some((documento) => documentosPermitidos.has(documento)),
    ).map((preguntaItem) => ({
      ...preguntaSeleccionada(preguntaItem, "Documento o control permitido por aplicabilidad preventiva."),
      prioridad: contexto.esHallazgoSimple ? preguntaItem.prioridad : 820,
    })),
  );

  if (contexto.esHallazgoSimple) {
    seleccion.push(
      ...PREGUNTAS_EVIDENCIA_CIERRE.slice(0, 5).map((preguntaItem) =>
        ({
          ...preguntaSeleccionada(preguntaItem, "Hallazgo simple: prioriza accion, evidencia y cierre verificable."),
          prioridad: 830,
        }),
      ),
    );
  }
  if (contexto.esTrabajoCritico) {
    seleccion.push(
      {
        ...preguntaSeleccionada(
          obtenerPreguntaPreventivaPorId("transversal_accion") ?? PREGUNTAS_TRANSVERSALES[7],
          "Trabajo critico: definir accion inmediata verificable.",
        ),
        prioridad: 840,
      },
      preguntaSeleccionada(
        obtenerPreguntaPreventivaPorId("transversal_continuidad") ?? PREGUNTAS_TRANSVERSALES[19],
        "Trabajo critico: validar continuidad operacional.",
      ),
    );
  }

  const bloqueados = new Set(contexto.documentosBloqueados);
  return ordenarPreguntas(
    unicoPorId(seleccion).filter(
      (preguntaItem) =>
        !preguntaItem.documental ||
        preguntaItem.documentosRelacionados.length === 0 ||
        preguntaItem.documentosRelacionados.some((documento) => documentosPermitidos.has(documento)) ||
        !preguntaItem.documentosRelacionados.some((documento) => bloqueados.has(documento)),
    ),
  ).slice(0, contexto.maximoSugerido);
};

export const obtenerResumenCatalogoPreguntasPreventivas = () => ({
  totalPreguntas: PREGUNTAS_PREVENTIVAS_TIPADAS.length,
  totalTiposRespuesta: TIPOS_RESPUESTA_PREVENTIVA.length,
  totalActividadesObra: obtenerActividadesObra().length,
  preguntasTransversales: PREGUNTAS_TRANSVERSALES.length,
  preguntasFamilia: PREGUNTAS_FAMILIA.length,
  preguntasActividad: PREGUNTAS_ACTIVIDAD.length,
  preguntasDocumentales: PREGUNTAS_DOCUMENTALES.length,
  preguntasEvidenciaCierre: PREGUNTAS_EVIDENCIA_CIERRE.length,
});
