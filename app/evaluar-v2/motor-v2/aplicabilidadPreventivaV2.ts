import type {
  CriticidadOrientativaTaxonomia,
  DesviacionPreventivaId,
  FamiliaTaxonomiaPreventivaId,
} from "./taxonomiaPreventivaV2";

export type DocumentoPreventivoAplicable =
  | "procedimiento"
  | "ast_art"
  | "pts"
  | "permiso_autorizacion"
  | "matriz_riesgos"
  | "charla_difusion"
  | "hds_sds"
  | "certificacion_mantencion"
  | "inspeccion"
  | "evidencia_registro"
  | "senalizacion_segregacion"
  | "retiro_inmediato"
  | "bloqueo_loto"
  | "detencion_actividad"
  | "control_ambiental";

export type AccionAplicabilidadPreventiva =
  | "retirar_condicion"
  | "limpiar_area"
  | "reparar_reponer"
  | "senalizar_segregar"
  | "bloquear_energia"
  | "detener_actividad"
  | "controlar_derrame"
  | "regularizar_documento"
  | "verificar_control_critico"
  | "registrar_evidencia";

export type ContextoAplicabilidadPreventiva = {
  actividadDetectada?: string;
  familiaPrimaria?: FamiliaTaxonomiaPreventivaId | string | null;
  familiasSecundarias?: Array<FamiliaTaxonomiaPreventivaId | string>;
  desviaciones?: Array<DesviacionPreventivaId | string>;
  objeto?: string;
  condicion?: string;
  exposicion?: string;
  consecuenciaProbable?: string;
  controlFaltante?: string;
  criticidadOrientativa?: CriticidadOrientativaTaxonomia | string;
  esTrabajoCritico?: boolean;
  hayEnergiaPeligrosa?: boolean;
  haySustanciaPeligrosa?: boolean;
  hayIzaje?: boolean;
  hayTrabajoAltura?: boolean;
  hayExcavacion?: boolean;
  hayTrabajoCaliente?: boolean;
  hayMaquinariaMovil?: boolean;
  hayDerrame?: boolean;
  hayAmbienteAfectado?: boolean;
  hayEquipoCritico?: boolean;
  hayEspacioConfinado?: boolean;
  hayDemolicion?: boolean;
  hayCargaSuspendida?: boolean;
  hayControlCriticoAusente?: boolean;
  esHallazgoSimple?: boolean;
  esDocumentoHabilitante?: boolean;
  esRespaldoAdministrativo?: boolean;
};

export type ReglaAplicabilidadPreventiva = {
  id: string;
  nombre: string;
  documentosAplicables: DocumentoPreventivoAplicable[];
  documentosNoAplicables: DocumentoPreventivoAplicable[];
  acciones: AccionAplicabilidadPreventiva[];
  aplica: (contexto: ContextoAplicabilidadPreventivaNormalizado) => boolean;
  requiereDetencionActividad?: boolean;
  requiereRevisionMatriz?: boolean;
  requiereControlCritico?: boolean;
  evitaSobredocumentacion?: boolean;
  evitaSubdocumentacion?: boolean;
};

export type ResultadoAplicabilidadPreventiva = {
  documentosAplicables: DocumentoPreventivoAplicable[];
  documentosNoAplicables: DocumentoPreventivoAplicable[];
  accionesAplicables: AccionAplicabilidadPreventiva[];
  requiereDetencionActividad: boolean;
  requiereRevisionMatriz: boolean;
  requiereControlCritico: boolean;
  riesgoSobredocumentacion: boolean;
  riesgoSubdocumentacion: boolean;
  reglasActivadas: string[];
};

type ContextoAplicabilidadPreventivaNormalizado = ContextoAplicabilidadPreventiva & {
  textoUnificado: string;
  familias: string[];
  desviacionesNormalizadas: string[];
  criticidadNormalizada: string;
  hallazgoSimpleInferido: boolean;
  trabajoCriticoInferido: boolean;
  energiaInferida: boolean;
  sustanciaInferida: boolean;
  izajeInferido: boolean;
  alturaInferida: boolean;
  excavacionInferida: boolean;
  trabajoCalienteInferido: boolean;
  maquinariaInferida: boolean;
  derrameInferido: boolean;
  ambienteInferido: boolean;
  equipoCriticoInferido: boolean;
  espacioConfinadoInferido: boolean;
  demolicionInferida: boolean;
  cargaSuspendidaInferida: boolean;
  controlCriticoInferido: boolean;
  riesgoGraveInferido: boolean;
};

const DOCUMENTOS_FORMALES: DocumentoPreventivoAplicable[] = [
  "procedimiento",
  "ast_art",
  "pts",
  "permiso_autorizacion",
  "matriz_riesgos",
];

const DOCUMENTOS_BASE_CRITICOS: DocumentoPreventivoAplicable[] = [
  "procedimiento",
  "ast_art",
  "matriz_riesgos",
  "evidencia_registro",
  "inspeccion",
];

const TERMINOS_SIMPLES = [
  "vaso trizado",
  "goma de piso",
  "material menor",
  "limpieza simple",
  "residuo comun",
  "residuo no peligroso",
  "senaletica menor",
  "senalizacion menor",
  "dano menor",
  "mobiliario",
  "envase vacio no peligroso",
  "cable ordenado",
  "herramienta menor retirada",
  "vidrio pequeno",
  "pintura fresca senalizada",
  "derrame menor de agua",
  "polvo menor",
  "caja mal ubicada",
  "elemento suelto",
  "reparacion menor",
  "retiro inmediato",
];

const TERMINOS_ALTURA = ["altura", "arnes", "linea de vida", "borde", "abertura", "3 metros", "tres metros"];
const TERMINOS_IZAJE = ["izaje", "grua", "eslinga", "grillete", "rigger", "carga suspendida"];
const TERMINOS_EXCAVACION = ["excavacion", "zanja", "entibacion", "talud", "proteccion perimetral"];
const TERMINOS_CALIENTE = ["trabajo en caliente", "soldadura", "esmeril", "oxicorte", "permiso de fuego"];
const TERMINOS_ENERGIA = ["loto", "bloqueo", "energia", "tablero", "electrico", "intervenido", "intervencion"];
const TERMINOS_SUSTANCIA = ["hds", "sds", "sustancia", "quimico", "combustible", "gasolina", "bidon", "inflamable"];
const TERMINOS_MAQUINARIA = ["maquinaria", "equipo movil", "vehiculo", "conduccion", "operador", "radio de giro"];
const TERMINOS_AMBIENTE = ["derrame", "suelo", "agua", "residuo peligroso", "contaminacion", "ambiente"];
const TERMINOS_EQUIPO_CRITICO = ["certificacion", "mantencion", "eslinga", "equipo critico", "extintor", "tablero"];
const TERMINOS_CONFINADO = ["espacio confinado", "confinado", "atmosfera peligrosa"];
const TERMINOS_DEMOLICION = ["demolicion", "demoler", "desarme estructural"];
const TERMINOS_CONTROL_CRITICO = [
  "control critico",
  "sin control",
  "sin permiso",
  "sin autorizacion",
  "sin bloqueo",
  "sin entibacion",
  "sin segregacion",
  "sin proteccion",
  "riesgo grave",
  "inminente",
];

const textoPlano = (valor?: unknown): string => {
  if (Array.isArray(valor)) return valor.map(textoPlano).join(" ");
  if (valor === null || valor === undefined) return "";
  return String(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

const contieneAlguno = (texto: string, terminos: string[]) =>
  terminos.some((termino) => texto.includes(textoPlano(termino)));

const unico = <T>(valores: T[]) => Array.from(new Set(valores));

const normalizarContexto = (
  contexto: ContextoAplicabilidadPreventiva,
): ContextoAplicabilidadPreventivaNormalizado => {
  const familias = [
    contexto.familiaPrimaria,
    ...(contexto.familiasSecundarias ?? []),
  ].map(textoPlano);
  const desviacionesNormalizadas = (contexto.desviaciones ?? []).map(textoPlano);
  const textoUnificado = textoPlano([
    contexto.actividadDetectada,
    contexto.familiaPrimaria,
    contexto.familiasSecundarias,
    contexto.desviaciones,
    contexto.objeto,
    contexto.condicion,
    contexto.exposicion,
    contexto.consecuenciaProbable,
    contexto.controlFaltante,
    contexto.criticidadOrientativa,
  ]);
  const criticidadNormalizada = textoPlano(contexto.criticidadOrientativa);
  const hallazgoSimpleInferido =
    Boolean(contexto.esHallazgoSimple) || contieneAlguno(textoUnificado, TERMINOS_SIMPLES);
  const alturaInferida =
    Boolean(contexto.hayTrabajoAltura) ||
    familias.includes("trabajos_criticos") ||
    contieneAlguno(textoUnificado, TERMINOS_ALTURA);
  const izajeInferido =
    Boolean(contexto.hayIzaje) ||
    familias.includes("izaje_gruas_amarre") ||
    contieneAlguno(textoUnificado, TERMINOS_IZAJE);
  const excavacionInferida =
    Boolean(contexto.hayExcavacion) ||
    familias.includes("excavaciones_suelos") ||
    contieneAlguno(textoUnificado, TERMINOS_EXCAVACION);
  const trabajoCalienteInferido =
    Boolean(contexto.hayTrabajoCaliente) || contieneAlguno(textoUnificado, TERMINOS_CALIENTE);
  const niegaEnergia = contieneAlguno(textoUnificado, ["sin energia", "sin energia asociada", "fuera de energia"]);
  const energiaInferida =
    Boolean(contexto.hayEnergiaPeligrosa) ||
    (!niegaEnergia &&
      (familias.includes("energia_loto_electrico") || contieneAlguno(textoUnificado, TERMINOS_ENERGIA)));
  const sustanciaInferida =
    Boolean(contexto.haySustanciaPeligrosa) ||
    familias.includes("sustancias_hds") ||
    contieneAlguno(textoUnificado, TERMINOS_SUSTANCIA);
  const maquinariaInferida =
    Boolean(contexto.hayMaquinariaMovil) ||
    familias.includes("vehiculos_transporte") ||
    familias.includes("maquinaria_instalaciones") ||
    contieneAlguno(textoUnificado, TERMINOS_MAQUINARIA);
  const ambienteInferido =
    Boolean(contexto.hayAmbienteAfectado) ||
    familias.includes("medio_ambiente") ||
    contieneAlguno(textoUnificado, TERMINOS_AMBIENTE);
  const derrameInferido = Boolean(contexto.hayDerrame) || textoUnificado.includes("derrame");
  const equipoCriticoInferido =
    Boolean(contexto.hayEquipoCritico) ||
    familias.includes("mantencion_certificacion") ||
    contieneAlguno(textoUnificado, TERMINOS_EQUIPO_CRITICO);
  const espacioConfinadoInferido =
    Boolean(contexto.hayEspacioConfinado) || contieneAlguno(textoUnificado, TERMINOS_CONFINADO);
  const demolicionInferida =
    Boolean(contexto.hayDemolicion) || contieneAlguno(textoUnificado, TERMINOS_DEMOLICION);
  const cargaSuspendidaInferida =
    Boolean(contexto.hayCargaSuspendida) || contieneAlguno(textoUnificado, ["carga suspendida", "carga izada"]);
  const controlCriticoInferido =
    Boolean(contexto.hayControlCriticoAusente) ||
    desviacionesNormalizadas.includes("control_critico_ausente_no_verificado") ||
    desviacionesNormalizadas.includes("incumplimiento_control_critico") ||
    contieneAlguno(textoUnificado, TERMINOS_CONTROL_CRITICO);
  const trabajoCriticoInferido =
    Boolean(contexto.esTrabajoCritico) ||
    alturaInferida ||
    izajeInferido ||
    excavacionInferida ||
    trabajoCalienteInferido ||
    energiaInferida ||
    espacioConfinadoInferido ||
    demolicionInferida ||
    cargaSuspendidaInferida;
  const riesgoGraveInferido =
    criticidadNormalizada === "critico" ||
    criticidadNormalizada === "alto" ||
    controlCriticoInferido ||
    contieneAlguno(textoUnificado, ["grave", "fatal", "lesion", "caida", "atrapamiento", "electrocucion"]);

  return {
    ...contexto,
    textoUnificado,
    familias,
    desviacionesNormalizadas,
    criticidadNormalizada,
    hallazgoSimpleInferido,
    trabajoCriticoInferido,
    energiaInferida,
    sustanciaInferida,
    izajeInferido,
    alturaInferida,
    excavacionInferida,
    trabajoCalienteInferido,
    maquinariaInferida,
    derrameInferido,
    ambienteInferido,
    equipoCriticoInferido,
    espacioConfinadoInferido,
    demolicionInferida,
    cargaSuspendidaInferida,
    controlCriticoInferido,
    riesgoGraveInferido,
  };
};

const REGLAS_APLICABILIDAD_PREVENTIVA: ReglaAplicabilidadPreventiva[] = [
  {
    id: "hallazgo_simple_corregible",
    nombre: "Hallazgo simple corregible",
    documentosAplicables: ["retiro_inmediato", "evidencia_registro"],
    documentosNoAplicables: DOCUMENTOS_FORMALES,
    acciones: ["retirar_condicion", "reparar_reponer", "registrar_evidencia"],
    aplica: (contexto) => contexto.hallazgoSimpleInferido && !contexto.trabajoCriticoInferido,
    evitaSobredocumentacion: true,
  },
  {
    id: "limpieza_orden_simple",
    nombre: "Orden, limpieza o retiro simple",
    documentosAplicables: ["retiro_inmediato", "senalizacion_segregacion", "evidencia_registro"],
    documentosNoAplicables: ["ast_art", "pts", "permiso_autorizacion", "procedimiento"],
    acciones: ["limpiar_area", "senalizar_segregar", "registrar_evidencia"],
    aplica: (contexto) =>
      contexto.hallazgoSimpleInferido &&
      contieneAlguno(contexto.textoUnificado, [
        "limpieza",
        "material menor",
        "caja",
        "residuo comun",
        "goma",
        "senaletica",
        "senalizacion menor",
        "aviso",
        "cinta",
        "pintura fresca",
        "agua",
      ]),
    evitaSobredocumentacion: true,
  },
  {
    id: "trabajo_altura",
    nombre: "Trabajo en altura o exposicion a caida",
    documentosAplicables: [...DOCUMENTOS_BASE_CRITICOS, "pts", "permiso_autorizacion", "senalizacion_segregacion"],
    documentosNoAplicables: [],
    acciones: ["detener_actividad", "verificar_control_critico", "senalizar_segregar"],
    aplica: (contexto) => contexto.alturaInferida,
    requiereDetencionActividad: true,
    requiereRevisionMatriz: true,
    requiereControlCritico: true,
    evitaSubdocumentacion: true,
  },
  {
    id: "izaje_carga_suspendida",
    nombre: "Izaje o carga suspendida",
    documentosAplicables: [...DOCUMENTOS_BASE_CRITICOS, "pts", "permiso_autorizacion", "certificacion_mantencion", "senalizacion_segregacion"],
    documentosNoAplicables: [],
    acciones: ["detener_actividad", "verificar_control_critico", "senalizar_segregar"],
    aplica: (contexto) => contexto.izajeInferido || contexto.cargaSuspendidaInferida,
    requiereDetencionActividad: true,
    requiereRevisionMatriz: true,
    requiereControlCritico: true,
    evitaSubdocumentacion: true,
  },
  {
    id: "excavacion_abertura",
    nombre: "Excavacion, zanja o abertura",
    documentosAplicables: [...DOCUMENTOS_BASE_CRITICOS, "pts", "permiso_autorizacion", "senalizacion_segregacion"],
    documentosNoAplicables: [],
    acciones: ["detener_actividad", "verificar_control_critico", "senalizar_segregar"],
    aplica: (contexto) => contexto.excavacionInferida,
    requiereDetencionActividad: true,
    requiereRevisionMatriz: true,
    requiereControlCritico: true,
    evitaSubdocumentacion: true,
  },
  {
    id: "trabajo_caliente",
    nombre: "Trabajo en caliente",
    documentosAplicables: [...DOCUMENTOS_BASE_CRITICOS, "pts", "permiso_autorizacion", "senalizacion_segregacion"],
    documentosNoAplicables: [],
    acciones: ["detener_actividad", "verificar_control_critico", "senalizar_segregar"],
    aplica: (contexto) => contexto.trabajoCalienteInferido,
    requiereDetencionActividad: true,
    requiereRevisionMatriz: true,
    requiereControlCritico: true,
    evitaSubdocumentacion: true,
  },
  {
    id: "energia_loto",
    nombre: "Energia peligrosa o intervencion de equipo",
    documentosAplicables: [...DOCUMENTOS_BASE_CRITICOS, "pts", "permiso_autorizacion", "bloqueo_loto", "certificacion_mantencion"],
    documentosNoAplicables: [],
    acciones: ["detener_actividad", "bloquear_energia", "verificar_control_critico"],
    aplica: (contexto) => contexto.energiaInferida,
    requiereDetencionActividad: true,
    requiereRevisionMatriz: true,
    requiereControlCritico: true,
    evitaSubdocumentacion: true,
  },
  {
    id: "sustancia_peligrosa",
    nombre: "Sustancia peligrosa o combustible",
    documentosAplicables: ["procedimiento", "ast_art", "matriz_riesgos", "hds_sds", "control_ambiental", "evidencia_registro", "inspeccion"],
    documentosNoAplicables: [],
    acciones: ["controlar_derrame", "verificar_control_critico", "registrar_evidencia"],
    aplica: (contexto) => contexto.sustanciaInferida,
    requiereRevisionMatriz: true,
    requiereControlCritico: true,
    evitaSubdocumentacion: true,
  },
  {
    id: "derrame_impacto_ambiental",
    nombre: "Derrame o impacto ambiental",
    documentosAplicables: ["procedimiento", "matriz_riesgos", "hds_sds", "control_ambiental", "evidencia_registro", "inspeccion"],
    documentosNoAplicables: [],
    acciones: ["controlar_derrame", "registrar_evidencia", "verificar_control_critico"],
    aplica: (contexto) =>
      (contexto.derrameInferido || contexto.ambienteInferido) && !contexto.hallazgoSimpleInferido,
    requiereRevisionMatriz: true,
    requiereControlCritico: true,
    evitaSubdocumentacion: true,
  },
  {
    id: "maquinaria_transito",
    nombre: "Maquinaria movil o transito interno",
    documentosAplicables: ["procedimiento", "ast_art", "matriz_riesgos", "certificacion_mantencion", "inspeccion", "senalizacion_segregacion", "evidencia_registro"],
    documentosNoAplicables: [],
    acciones: ["detener_actividad", "senalizar_segregar", "verificar_control_critico"],
    aplica: (contexto) => contexto.maquinariaInferida,
    requiereRevisionMatriz: true,
    requiereControlCritico: true,
    evitaSubdocumentacion: true,
  },
  {
    id: "equipo_critico_mantencion",
    nombre: "Equipo critico, certificacion o mantencion",
    documentosAplicables: ["procedimiento", "certificacion_mantencion", "inspeccion", "evidencia_registro", "retiro_inmediato"],
    documentosNoAplicables: [],
    acciones: ["detener_actividad", "retirar_condicion", "verificar_control_critico"],
    aplica: (contexto) => contexto.equipoCriticoInferido,
    requiereControlCritico: true,
    evitaSubdocumentacion: true,
  },
  {
    id: "espacio_confinado",
    nombre: "Espacio confinado",
    documentosAplicables: [...DOCUMENTOS_BASE_CRITICOS, "pts", "permiso_autorizacion"],
    documentosNoAplicables: [],
    acciones: ["detener_actividad", "verificar_control_critico"],
    aplica: (contexto) => contexto.espacioConfinadoInferido,
    requiereDetencionActividad: true,
    requiereRevisionMatriz: true,
    requiereControlCritico: true,
    evitaSubdocumentacion: true,
  },
  {
    id: "demolicion_desarme",
    nombre: "Demolicion o desarme estructural",
    documentosAplicables: [...DOCUMENTOS_BASE_CRITICOS, "pts", "permiso_autorizacion", "senalizacion_segregacion"],
    documentosNoAplicables: [],
    acciones: ["detener_actividad", "verificar_control_critico", "senalizar_segregar"],
    aplica: (contexto) => contexto.demolicionInferida,
    requiereDetencionActividad: true,
    requiereRevisionMatriz: true,
    requiereControlCritico: true,
    evitaSubdocumentacion: true,
  },
  {
    id: "respaldo_administrativo",
    nombre: "Respaldo administrativo preventivo",
    documentosAplicables: ["charla_difusion", "evidencia_registro", "inspeccion"],
    documentosNoAplicables: ["detencion_actividad"],
    acciones: ["regularizar_documento", "registrar_evidencia"],
    aplica: (contexto) =>
      Boolean(contexto.esRespaldoAdministrativo) &&
      !contexto.riesgoGraveInferido &&
      !contexto.controlCriticoInferido,
    evitaSobredocumentacion: true,
  },
  {
    id: "regularizacion_documental_critica",
    nombre: "Regularizacion documental asociada a riesgo critico",
    documentosAplicables: ["matriz_riesgos", "ast_art", "pts", "charla_difusion", "evidencia_registro"],
    documentosNoAplicables: [],
    acciones: ["regularizar_documento", "registrar_evidencia"],
    aplica: (contexto) =>
      contexto.trabajoCriticoInferido &&
      contieneAlguno(contexto.textoUnificado, ["matriz", "pts", "ast", "art", "charla", "difusion", "permiso"]),
    requiereRevisionMatriz: true,
    requiereControlCritico: true,
    evitaSubdocumentacion: true,
  },
  {
    id: "riesgo_grave_control_critico",
    nombre: "Riesgo grave o control critico ausente",
    documentosAplicables: [...DOCUMENTOS_BASE_CRITICOS, "pts", "permiso_autorizacion", "detencion_actividad"],
    documentosNoAplicables: [],
    acciones: ["detener_actividad", "verificar_control_critico"],
    aplica: (contexto) => contexto.riesgoGraveInferido && !contexto.hallazgoSimpleInferido,
    requiereDetencionActividad: true,
    requiereRevisionMatriz: true,
    requiereControlCritico: true,
    evitaSubdocumentacion: true,
  },
];

export const obtenerReglasAplicabilidadPreventiva = () => [...REGLAS_APLICABILIDAD_PREVENTIVA];

export const evaluarAplicabilidadPreventiva = (
  contexto: ContextoAplicabilidadPreventiva,
): ResultadoAplicabilidadPreventiva => {
  const normalizado = normalizarContexto(contexto);
  const reglasActivadas = REGLAS_APLICABILIDAD_PREVENTIVA.filter((regla) => regla.aplica(normalizado));
  const documentosAplicables = unico(reglasActivadas.flatMap((regla) => regla.documentosAplicables));
  const documentosNoAplicables = unico(reglasActivadas.flatMap((regla) => regla.documentosNoAplicables));
  const accionesAplicables = unico(reglasActivadas.flatMap((regla) => regla.acciones));
  const documentosAplicablesFinales = documentosAplicables.filter(
    (documento) => !documentosNoAplicables.includes(documento),
  );
  const riesgoSobredocumentacion =
    normalizado.hallazgoSimpleInferido &&
    documentosAplicablesFinales.some((documento) => DOCUMENTOS_FORMALES.includes(documento));
  const riesgoSubdocumentacion =
    normalizado.trabajoCriticoInferido &&
    !reglasActivadas.some((regla) => regla.evitaSubdocumentacion);

  return {
    documentosAplicables: documentosAplicablesFinales,
    documentosNoAplicables,
    accionesAplicables,
    requiereDetencionActividad: reglasActivadas.some((regla) => regla.requiereDetencionActividad),
    requiereRevisionMatriz: reglasActivadas.some((regla) => regla.requiereRevisionMatriz),
    requiereControlCritico: reglasActivadas.some((regla) => regla.requiereControlCritico),
    riesgoSobredocumentacion,
    riesgoSubdocumentacion,
    reglasActivadas: reglasActivadas.map((regla) => regla.id),
  };
};

export const evaluarSobredocumentacion = (contexto: ContextoAplicabilidadPreventiva) =>
  evaluarAplicabilidadPreventiva(contexto).riesgoSobredocumentacion;

export const evaluarSubdocumentacion = (contexto: ContextoAplicabilidadPreventiva) =>
  evaluarAplicabilidadPreventiva(contexto).riesgoSubdocumentacion;

export const obtenerDocumentosAplicables = (contexto: ContextoAplicabilidadPreventiva) =>
  evaluarAplicabilidadPreventiva(contexto).documentosAplicables;

export const obtenerDocumentosNoAplicables = (contexto: ContextoAplicabilidadPreventiva) =>
  evaluarAplicabilidadPreventiva(contexto).documentosNoAplicables;

export const requiereDetencionActividad = (contexto: ContextoAplicabilidadPreventiva) =>
  evaluarAplicabilidadPreventiva(contexto).requiereDetencionActividad;

export const requiereRevisionMatriz = (contexto: ContextoAplicabilidadPreventiva) =>
  evaluarAplicabilidadPreventiva(contexto).requiereRevisionMatriz;

export const requiereControlCritico = (contexto: ContextoAplicabilidadPreventiva) =>
  evaluarAplicabilidadPreventiva(contexto).requiereControlCritico;
