import type {
  DocumentoPreventivoAplicable,
  AccionAplicabilidadPreventiva,
  ContextoAplicabilidadPreventiva,
} from "./aplicabilidadPreventivaV2";
import {
  construirAliasSemanticosRespuestas,
  type AliasSemanticosRespuestasPreventivas,
  type EntradaEvaluacionSugeridaPreventiva,
  type FormularioPreventivoPuente,
} from "./puentePreguntasPreventivasV2";
import type {
  AmbitoEvaluacion,
  Consecuencia,
  ControlesExistentes,
  Criticidad,
  EvaluacionInputV2,
  ExposicionAmbiental,
  ExposicionPersonas,
  Probabilidad,
  TipoEvento,
} from "./types";

export type ConfianzaMapeoRespuestasPreventivas = "alta" | "media" | "baja";

export type AliasMapeoRespuestasPreventivas = AliasSemanticosRespuestasPreventivas & {
  acto_inseguro_detectado?: boolean;
  condicion_insegura_detectada?: boolean;
  control_existente?: string;
};

export type EntradaMapeoRespuestasPreventivas = {
  descripcionHallazgo?: string;
  riesgoEspecificoDetectado?: string;
  respuestasPreventivas?: Record<string, string>;
  aliasSemanticos?: Partial<AliasMapeoRespuestasPreventivas>;
  formularioPreventivo?: FormularioPreventivoPuente;
  formularioActual?: { preguntas?: unknown[] } | unknown[];
  respuestasActuales?: Record<string, string>;
  contextoRouter?: Record<string, unknown>;
  contextoAplicabilidad?: ContextoAplicabilidadPreventiva;
};

export type CamposCriticidadSugeridosPreventivos = {
  criticidadOrientativa?: Criticidad;
  exposicionPersonas?: ExposicionPersonas;
  exposicionAmbiental?: ExposicionAmbiental;
  consecuencia?: Consecuencia;
  probabilidad?: Probabilidad;
  controlesExistentes?: ControlesExistentes;
  requiereSuspension?: boolean;
};

export type CamposRecomendacionSugeridosPreventivos = {
  accionInmediata?: string;
  requiereRevisionTecnica?: boolean;
  requiereEvidenciaCierre?: boolean;
  regularizacionDocumental?: boolean;
};

export type ComparacionEntradaActualMapeada = {
  camposAgregados: string[];
  respuestasLegacyAgregadas: string[];
  mantieneRespuestasActuales: boolean;
  requiereFallbackActual: boolean;
};

export type ResultadoMapeoRespuestasPreventivas = {
  aliasSemanticosNormalizados: AliasMapeoRespuestasPreventivas;
  entradaEvaluacionSugerida: Partial<EvaluacionInputV2> & EntradaEvaluacionSugeridaPreventiva;
  respuestasCompatiblesLegacy: Record<string, string>;
  camposCriticidadSugeridos: CamposCriticidadSugeridosPreventivos;
  camposRecomendacionSugeridos: CamposRecomendacionSugeridosPreventivos;
  documentosAplicables: DocumentoPreventivoAplicable[];
  documentosNoAplicables: DocumentoPreventivoAplicable[];
  accionesInmediatas: AccionAplicabilidadPreventiva[];
  advertenciasCompatibilidad: string[];
  requiereFallbackActual: boolean;
  confianzaMapeo: ConfianzaMapeoRespuestasPreventivas;
};

export type ValidacionMapeoRespuestasPreventivas = {
  valido: boolean;
  errores: string[];
  advertencias: string[];
};

const ID_RIESGO_ESPECIFICO = "transversal_anclaje_riesgo_especifico";

const DOCUMENTOS_FORMALES: DocumentoPreventivoAplicable[] = [
  "procedimiento",
  "ast_art",
  "pts",
  "permiso_autorizacion",
  "matriz_riesgos",
];

const DOCUMENTOS_HABILITANTES: DocumentoPreventivoAplicable[] = [
  ...DOCUMENTOS_FORMALES,
  "bloqueo_loto",
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

const contieneAlguno = (texto: string, terminos: string[]) =>
  terminos.some((termino) => texto.includes(normalizar(termino)));

const textoEntrada = (entrada: EntradaMapeoRespuestasPreventivas) =>
  normalizar([
    entrada.descripcionHallazgo,
    entrada.riesgoEspecificoDetectado,
    entrada.aliasSemanticos?.riesgo_especifico_detectado,
    entrada.contextoAplicabilidad?.objeto,
    entrada.contextoAplicabilidad?.condicion,
    entrada.contextoAplicabilidad?.exposicion,
    entrada.contextoAplicabilidad?.consecuenciaProbable,
    entrada.contextoAplicabilidad?.controlFaltante,
  ]);

const esHallazgoSimpleTexto = (texto: string) =>
  contieneAlguno(texto, [
    "vidrio quebrado",
    "vaso trizado",
    "goma de piso",
    "material menor",
    "limpieza simple",
    "senalizacion menor",
    "señalizacion menor",
    "senalizada",
    "señalizada",
    "senaletica menor",
    "residuo comun",
    "residuo no peligroso",
    "derrame menor de agua",
    "herramienta menor",
    "dano menor",
    "daño menor",
    "mobiliario",
    "caja mal ubicada",
    "polvo menor",
    "envase vacio",
    "protector plastico",
    "funda plastica",
    "aviso impreso",
    "separador",
    "cinta vieja",
    "gota de agua",
    "elemento suelto",
    "pintura fresca",
    "etiqueta menor",
    "cable ordenado",
    "restos menores",
    "reparacion menor",
    "reparación menor",
  ]);

const esCriticoTexto = (texto: string) =>
  contieneAlguno(texto, [
    "sin arnes",
    "sin arnés",
    "altura",
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
    "combustible",
    "hds",
    "tablero electrico",
    "tablero eléctrico",
    "conduccion imprudente",
    "conducción imprudente",
    "zona restringida",
    "partes moviles",
    "partes móviles",
    "techumbre",
    "espacio confinado",
    "linea de fuego",
    "línea de fuego",
    "plataforma",
    "demolicion",
    "demolición",
    "deslizamiento",
    "montacarga",
    "enchufe",
    "calzado",
    "parabrisas",
    "neumatico",
    "neumático",
    "extintor",
    "proteccion ocular",
    "protección ocular",
    "camion",
    "camión",
    "bomba",
    "quimico",
    "químico",
    "certificacion",
    "certificación",
    "certificado",
    "eslinga",
    "checklist",
    "inspeccion",
    "inspección",
  ]);

const esDocumentalTexto = (texto: string) =>
  contieneAlguno(texto, [
    "matriz",
    "charla",
    "firma",
    "pts",
    "ast",
    "permiso",
    "checklist",
    "procedimiento",
    "certificacion",
    "certificación",
    "evidencia",
    "hds",
    "registro",
    "firmado",
    "firmada",
    "no difundido",
    "no difundida",
    "certificado",
  ]);

const riesgoEspecifico = (entrada: EntradaMapeoRespuestasPreventivas) =>
  entrada.riesgoEspecificoDetectado?.trim() ||
  entrada.aliasSemanticos?.riesgo_especifico_detectado?.trim() ||
  entrada.respuestasPreventivas?.[ID_RIESGO_ESPECIFICO]?.trim() ||
  entrada.respuestasPreventivas?.riesgo_especifico_detectado?.trim() ||
  undefined;

const documentosDesdeTexto = (
  texto: string,
  esSimple: boolean,
): DocumentoPreventivoAplicable[] => {
  const documentos: DocumentoPreventivoAplicable[] = [];

  if (esSimple) {
    if (contieneAlguno(texto, ["evidencia", "fotografia", "fotográfica", "foto"])) {
      documentos.push("evidencia_registro");
    }
    if (contieneAlguno(texto, ["senalizacion", "señalizacion", "senaletica", "señaletica", "senalizada", "señalizada"])) {
      documentos.push("senalizacion_segregacion");
    }
    return unico(documentos);
  }

  if (
    contieneAlguno(texto, [
      "altura",
      "sin arnes",
      "sin arnés",
      "techumbre",
      "plataforma",
      "excavacion",
      "excavación",
      "entibacion",
      "entibación",
      "trabajo en caliente",
      "espacio confinado",
      "demolicion",
      "demolición",
      "pts faltante",
      "pts no autorizado",
      "pts no autorizada",
    ])
  ) {
    documentos.push("pts");
  }
  if (
    contieneAlguno(texto, [
      "trabajo en caliente",
      "sin permiso",
      "permiso vencido",
      "permiso de trabajo",
      "sin autorizacion",
      "sin autorización",
      "no autorizado",
      "no autorizada",
      "zona restringida",
      "carga suspendida",
      "izaje",
      "excavacion",
      "excavación",
      "espacio confinado",
      "techumbre",
      "sin arnes",
      "sin arnés",
    ])
  ) {
    documentos.push("permiso_autorizacion");
  }
  if (contieneAlguno(texto, ["ast", "art"])) documentos.push("ast_art");
  if (
    contieneAlguno(texto, [
      "sin arnes",
      "sin arnés",
      "matriz",
      "conduccion imprudente",
      "conducción imprudente",
      "linea de fuego",
      "línea de fuego",
      "deslizamiento",
      "trabajo critico",
      "trabajo crítico",
      "ast faltante",
      "pts faltante",
      "partes moviles",
      "partes móviles",
      "montacarga",
      "viento",
      "energia cercana",
      "energía cercana",
      "neumaticos",
      "neumáticos",
    ])
  ) {
    documentos.push("matriz_riesgos");
  }
  if (
    contieneAlguno(texto, [
      "loto",
      "bloqueo",
      "energia",
      "energía",
      "tablero",
      "electrico",
      "eléctrico",
      "electrica",
      "eléctrica",
      "enchufe",
      "bomba",
    ])
  ) {
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
      "linea de fuego",
      "línea de fuego",
      "loto",
      "bloqueo",
      "electrica",
      "eléctrica",
      "enchufe",
      "montacarga",
      "camion",
      "camión",
      "retrocede",
      "bomba",
    ])
  ) {
    documentos.push("procedimiento");
  }
  if (contieneAlguno(texto, ["gasolina", "hds", "sds", "combustible", "sustancia", "residuo peligroso"])) {
    documentos.push("hds_sds");
  }
  if (contieneAlguno(texto, ["derrame", "combustible", "gasolina", "suelo", "residuo peligroso"])) {
    documentos.push("control_ambiental");
  }
  if (
    contieneAlguno(texto, [
      "certificacion",
      "certificación",
      "mantencion",
      "mantención",
      "eslinga",
      "enchufe",
      "parabrisas",
      "neumatico",
      "neumático",
      "equipo critico",
      "equipo crítico",
      "certificado",
      "extintor",
    ])
  ) {
    documentos.push("certificacion_mantencion");
  }
  if (
    contieneAlguno(texto, [
      "checklist",
      "inspeccion",
      "inspección",
      "partes moviles",
      "partes móviles",
      "plataforma",
      "enchufe",
      "calzado",
      "parabrisas",
      "neumatico",
      "neumático",
      "equipo critico",
      "equipo crítico",
      "registro",
      "extintor",
      "proteccion ocular",
      "protección ocular",
    ])
  ) {
    documentos.push("inspeccion");
  }
  if (contieneAlguno(texto, ["firma", "firmado", "firmada", "registro", "evidencia", "fotografica", "fotográfica"])) {
    documentos.push("evidencia_registro");
  }
  if (contieneAlguno(texto, ["charla", "difusion", "difusión", "no difundido", "no difundida", "conocimiento"])) {
    documentos.push("charla_difusion");
  }
  if (contieneAlguno(texto, ["sin segregacion", "sin segregación", "proteccion perimetral", "protección perimetral", "retrocede", "senalizada", "señalizada"])) {
    documentos.push("senalizacion_segregacion");
  }
  if (contieneAlguno(texto, ["deslizamiento", "riesgo inminente", "detener actividad"])) {
    documentos.push("detencion_actividad");
  }

  return unico(documentos);
};

const accionesDesdeTexto = (
  texto: string,
  documentos: DocumentoPreventivoAplicable[],
  esSimple: boolean,
): AccionAplicabilidadPreventiva[] => {
  const acciones: AccionAplicabilidadPreventiva[] = [];

  if (esSimple) {
    if (contieneAlguno(texto, ["derrame", "agua", "limpieza", "polvo"])) acciones.push("limpiar_area");
    if (contieneAlguno(texto, ["vidrio", "vaso", "material", "residuo", "herramienta", "caja", "etiqueta", "cable", "restos", "pintura"])) {
      acciones.push("retirar_condicion");
    }
    if (contieneAlguno(texto, ["goma", "mobiliario", "dano", "daño", "protector", "funda", "reparacion", "reparación"])) {
      acciones.push("reparar_reponer");
    }
    if (contieneAlguno(texto, ["senalizacion", "señalizacion", "senaletica", "señaletica", "senalizada", "señalizada"])) {
      acciones.push("senalizar_segregar");
    }
  }

  if (documentos.some((documento) => DOCUMENTOS_HABILITANTES.includes(documento))) {
    acciones.push("regularizar_documento");
  }
  if (!esSimple && esDocumentalTexto(texto) && documentos.length > 0) acciones.push("regularizar_documento");
  if (documentos.includes("bloqueo_loto")) acciones.push("bloquear_energia");
  if (documentos.includes("control_ambiental")) acciones.push("controlar_derrame");
  if (
    documentos.includes("detencion_actividad") ||
    contieneAlguno(texto, ["sin arnes", "sin arnés", "carga suspendida", "linea de vida", "línea de vida"])
  ) {
    acciones.push("detener_actividad");
  }
  if (esCriticoTexto(texto)) acciones.push("verificar_control_critico");
  if (documentos.some((documento) => ["inspeccion", "certificacion_mantencion"].includes(documento))) {
    acciones.push("verificar_control_critico");
  }
  if (contieneAlguno(texto, ["multiples riesgos", "múltiples riesgos", "riesgo mixto"])) {
    acciones.push("verificar_control_critico");
  }
  if (documentos.includes("evidencia_registro")) acciones.push("registrar_evidencia");

  if (acciones.length === 0) acciones.push(esSimple ? "retirar_condicion" : "verificar_control_critico");

  return unico(acciones);
};

const ambitoDesdeTexto = (texto: string): AmbitoEvaluacion => {
  if (contieneAlguno(texto, ["derrame", "residuo peligroso", "suelo", "ambiental", "combustible"])) {
    return "medio_ambiente";
  }
  if (esDocumentalTexto(texto) && !esCriticoTexto(texto)) return "legal_documental";
  if (contieneAlguno(texto, ["extintor", "emergencia", "evacuacion", "evacuación"])) return "emergencia";
  return "seguridad_laboral";
};

const tipoEventoDesdeAlias = (alias: AliasMapeoRespuestasPreventivas, texto: string): TipoEvento => {
  if (alias.acto_inseguro_detectado || contieneAlguno(texto, ["conducta", "conduccion imprudente", "pasa bajo carga"])) {
    return "acto_inseguro";
  }
  if (ambitoDesdeTexto(texto) === "medio_ambiente") return "aspecto_ambiental";
  if (ambitoDesdeTexto(texto) === "legal_documental") return "desviacion_legal_documental";
  return "condicion_subestandar";
};

const exposicionDesdeAlias = (alias: AliasMapeoRespuestasPreventivas, texto: string): ExposicionPersonas | undefined => {
  const exposicion = normalizar(alias.exposicion_detectada);
  if (contieneAlguno(exposicion, ["trabajador", "tercero", "persona", "peaton", "peatón"])) return "directa";
  if (contieneAlguno(texto, ["trabajador", "peaton", "peatón", "personas", "terceros", "transito cercano"])) {
    return "directa";
  }
  if (contieneAlguno(texto, ["zona de paso", "transito", "tránsito", "acceso", "area comun", "área común"])) {
    return "potencial";
  }
  if (esHallazgoSimpleTexto(texto)) return "sin_exposicion";
  return undefined;
};

const consecuenciaDesdeTexto = (texto: string, esSimple: boolean): Consecuencia | undefined => {
  if (esSimple) return "leve";
  if (contieneAlguno(texto, ["fatal", "muerte"])) return "fatal";
  if (contieneAlguno(texto, ["sin arnes", "sin arnés", "carga suspendida", "loto", "bloqueo", "electrico", "eléctrico", "excavacion", "excavación", "espacio confinado", "techumbre"])) {
    return "grave";
  }
  if (contieneAlguno(texto, ["combustible", "gasolina", "derrame", "maquina", "máquina", "vehiculo", "vehículo"])) {
    return "moderada";
  }
  if (esDocumentalTexto(texto)) return "moderada";
  return undefined;
};

const probabilidadDesdeTexto = (texto: string, esSimple: boolean): Probabilidad | undefined => {
  if (esSimple) return "baja";
  if (contieneAlguno(texto, ["actualmente", "trabajador", "sin control", "sin proteccion", "sin protección", "sin segregacion", "sin segregación", "expuesto", "carga suspendida"])) {
    return "alta";
  }
  if (esCriticoTexto(texto) || esDocumentalTexto(texto)) return "media";
  return undefined;
};

const controlesDesdeAlias = (alias: AliasMapeoRespuestasPreventivas, texto: string, esSimple: boolean): ControlesExistentes | undefined => {
  const control = normalizar(alias.control_existente || alias.control_faltante);
  if (contieneAlguno(control, ["suficiente"])) return "suficientes";
  if (contieneAlguno(control, ["parcial"])) return "parciales";
  if (contieneAlguno(control, ["no existe", "sin control", "faltante", "ausente"])) return "inexistentes";
  if (esSimple) return "parciales";
  if (contieneAlguno(texto, ["sin ", "faltante", "vencido", "no disponible", "incompleto", "insuficiente"])) {
    return "inexistentes";
  }
  return undefined;
};

const criticidadDesdeCampos = (
  texto: string,
  esSimple: boolean,
  consecuencia?: Consecuencia,
  probabilidad?: Probabilidad,
): Criticidad | undefined => {
  if (esSimple) return "BAJO";
  if (
    contieneAlguno(texto, [
      "sin arnes",
      "sin arnés",
      "loto",
      "carga suspendida",
      "sin bloqueo",
      "bomba sin bloqueo",
      "tablero electrico",
      "tablero eléctrico",
      "electrico",
      "eléctrico",
      "electrica",
      "eléctrica",
      "enchufe",
    ])
  ) {
    return "CRITICO";
  }
  if (
    contieneAlguno(texto, [
      "excavacion",
      "excavación",
      "entibacion",
      "entibación",
      "izaje",
      "conduccion imprudente",
      "conducción imprudente",
      "zona restringida",
      "linea de fuego",
      "línea de fuego",
      "techumbre",
      "plataforma",
      "demolicion",
      "demolición",
      "deslizamiento",
      "montacarga",
      "retrocede",
      "trabajo en caliente",
      "espacio confinado",
      "partes moviles",
      "partes móviles",
    ])
  ) {
    return "ALTO";
  }
  if (
    contieneAlguno(texto, [
      "gasolina",
      "combustible",
      "hds",
      "sustancia",
      "quimico",
      "químico",
      "residuo peligroso",
      "certificacion",
      "certificación",
      "certificado",
      "extintor",
      "calzado",
      "parabrisas",
      "neumatico",
      "neumático",
      "equipo critico",
      "equipo crítico",
      "mantencion",
      "mantención",
      "checklist",
      "matriz",
      "charla",
      "procedimiento",
      "permiso",
      "evidencia",
      "pts",
      "ast",
      "proteccion ocular",
      "protección ocular",
      "esmerilado",
    ])
  ) {
    return "MEDIO";
  }
  if (consecuencia === "grave" && probabilidad === "alta") return "CRITICO";
  if (consecuencia === "grave") return "ALTO";
  if (consecuencia === "moderada") return "MEDIO";
  return undefined;
};

const documentosNoAplicables = (documentos: DocumentoPreventivoAplicable[], esSimple: boolean) => {
  const noAplicables: DocumentoPreventivoAplicable[] = [];
  if (esSimple) noAplicables.push(...DOCUMENTOS_FORMALES, "bloqueo_loto", "hds_sds", "certificacion_mantencion");
  return DOCUMENTOS_FORMALES.concat("bloqueo_loto", "hds_sds", "certificacion_mantencion", "control_ambiental")
    .filter((documento) => !documentos.includes(documento))
    .filter((documento) => esSimple || noAplicables.includes(documento));
};

const aplicarBooleansDocumento = (
  alias: AliasMapeoRespuestasPreventivas,
  documentos: DocumentoPreventivoAplicable[],
) => ({
  ...alias,
  documentos_requeridos: documentos,
  requiere_documentacion_habilitante: documentos.some((documento) => DOCUMENTOS_HABILITANTES.includes(documento)),
  requiere_ast_art: documentos.includes("ast_art"),
  requiere_pts: documentos.includes("pts"),
  requiere_permiso: documentos.includes("permiso_autorizacion"),
  requiere_matriz: documentos.includes("matriz_riesgos"),
  requiere_hds: documentos.includes("hds_sds"),
  requiere_certificacion_mantencion: documentos.includes("certificacion_mantencion"),
  requiere_detencion: alias.requiere_detencion || documentos.includes("detencion_actividad"),
  requiere_evidencia_cierre: alias.requiere_evidencia_cierre || documentos.includes("evidencia_registro"),
});

export const construirAliasDesdeRespuestasPreventivas = (
  respuestasPreventivas: Record<string, string> = {},
): AliasMapeoRespuestasPreventivas => {
  const aliasBase = construirAliasSemanticosRespuestas(respuestasPreventivas);
  const textoRespuestas = normalizar(Object.values(respuestasPreventivas));

  return {
    ...aliasBase,
    acto_inseguro_detectado: contieneAlguno(textoRespuestas, ["conducta observada", "acto inseguro"]),
    condicion_insegura_detectada: contieneAlguno(textoRespuestas, ["condicion", "condición", "entorno", "equipo"]),
    control_existente: aliasBase.control_faltante,
  };
};

export const construirCompatibilidadLegacyDesdeAlias = (
  alias: AliasMapeoRespuestasPreventivas,
): Record<string, string> => {
  const respuestas: Record<string, string> = {};
  const exposicion = normalizar(alias.exposicion_detectada);
  const consecuencia = normalizar(alias.consecuencia_probable);
  const control = normalizar(alias.control_existente || alias.control_faltante);

  if (alias.riesgo_especifico_detectado) respuestas[ID_RIESGO_ESPECIFICO] = alias.riesgo_especifico_detectado;
  if (contieneAlguno(exposicion, ["trabajador", "tercero", "persona", "directa"])) respuestas.p1 = "si";
  if (contieneAlguno(exposicion, ["potencial", "maquinaria", "infraestructura"])) respuestas.p1 = respuestas.p1 || "parcial";
  if (contieneAlguno(consecuencia, ["grave", "fatal", "lesion", "lesión"])) respuestas.p2 = "si";
  if (contieneAlguno(consecuencia, ["moderada", "ambiental", "dano", "daño"])) respuestas.p2 = respuestas.p2 || "parcial";
  if (contieneAlguno(control, ["no existe", "sin control", "faltante", "ausente"])) respuestas.p6 = "no";
  if (contieneAlguno(control, ["parcial"])) respuestas.p6 = respuestas.p6 || "parcial";
  if (contieneAlguno(control, ["suficiente"])) respuestas.p6 = respuestas.p6 || "si";

  if (alias.requiere_detencion) respuestas.p3 = "alta";
  if (alias.requiere_documentacion_habilitante) respuestas["legal-003"] = "si";
  if (alias.requiere_evidencia_cierre) respuestas["evidencia-cierre"] = "parcial";
  if (alias.requiere_hds) respuestas["sustancia-004"] = "no";
  if (alias.requiere_certificacion_mantencion) respuestas["maquina-004"] = "no";
  if (alias.requiere_permiso || alias.requiere_pts || alias.requiere_ast_art) respuestas["procedimiento-002"] = "si";

  return respuestas;
};

export const mapearRespuestasPreventivasAEvaluacionActual = (
  respuestasPreventivas: Record<string, string> = {},
  contexto: Omit<EntradaMapeoRespuestasPreventivas, "respuestasPreventivas"> = {},
): ResultadoMapeoRespuestasPreventivas => construirMapeoRespuestasPreventivas({
  ...contexto,
  respuestasPreventivas,
});

export const construirMapeoRespuestasPreventivas = (
  entrada: EntradaMapeoRespuestasPreventivas,
): ResultadoMapeoRespuestasPreventivas => {
  const texto = textoEntrada(entrada);
  const riesgo = riesgoEspecifico(entrada);
  const esSimple = Boolean(entrada.contextoAplicabilidad?.esHallazgoSimple) || esHallazgoSimpleTexto(texto);
  const aliasInicial = construirAliasDesdeRespuestasPreventivas(entrada.respuestasPreventivas);
  const aliasConEntrada: AliasMapeoRespuestasPreventivas = {
    ...aliasInicial,
    ...entrada.aliasSemanticos,
    riesgo_especifico_detectado: riesgo,
  };
  const documentosBase = unico([
    ...(aliasConEntrada.documentos_requeridos || []),
    ...documentosDesdeTexto(texto, esSimple),
  ]);
  const documentosAplicables = esSimple
    ? documentosBase.filter((documento) => !DOCUMENTOS_FORMALES.includes(documento) && documento !== "bloqueo_loto")
    : documentosBase;
  const alias = aplicarBooleansDocumento(aliasConEntrada, documentosAplicables);
  const exposicionPersonas = exposicionDesdeAlias(alias, texto);
  const exposicionAmbiental: ExposicionAmbiental | undefined = contieneAlguno(texto, ["derrame", "suelo", "agua", "ambiental", "combustible"])
    ? "directa"
    : undefined;
  const consecuencia = consecuenciaDesdeTexto(texto, esSimple);
  const consecuenciaEvaluacion = consecuencia === "fatal" ? "grave" : consecuencia;
  const probabilidad = probabilidadDesdeTexto(texto, esSimple);
  const controlesExistentes = controlesDesdeAlias(alias, texto, esSimple);
  const criticidadOrientativa = criticidadDesdeCampos(texto, esSimple, consecuencia, probabilidad);
  const accionesInmediatas = accionesDesdeTexto(texto, documentosAplicables, esSimple);
  const respuestasCompatiblesLegacy = {
    ...(entrada.respuestasActuales || {}),
    ...construirCompatibilidadLegacyDesdeAlias({
      ...alias,
      requiere_detencion: alias.requiere_detencion || accionesInmediatas.includes("detener_actividad"),
      exposicion_detectada:
        alias.exposicion_detectada ||
        (exposicionPersonas === "directa" ? "Trabajadores" : exposicionPersonas === "potencial" ? "Exposicion potencial" : ""),
      consecuencia_probable:
        alias.consecuencia_probable ||
        (consecuencia === "grave" || consecuencia === "fatal"
          ? "Lesion a personas"
          : consecuencia === "moderada"
            ? "Dano material o impacto ambiental"
            : consecuencia === "leve"
              ? "Consecuencia leve"
              : ""),
      control_existente:
        alias.control_existente ||
        (controlesExistentes === "inexistentes"
          ? "No existe control visible"
          : controlesExistentes === "parciales"
            ? "Control parcial"
            : controlesExistentes === "suficientes"
              ? "Control suficiente"
              : ""),
    }),
  };
  const ambitoDeclarado = ambitoDesdeTexto(texto);
  const tipoEvento = tipoEventoDesdeAlias(alias, texto);
  const riesgoAmbiguo =
    contieneAlguno(normalizar(riesgo), ["riesgo mixto", "multiple", "múltiple", "poco claro", "no especificado"]) ||
    contieneAlguno(texto, ["multiples riesgos", "múltiples riesgos", "poco claro", "no especificada"]);
  const requiereFallbackActual =
    !riesgo ||
    riesgoAmbiguo ||
    (!esSimple && !esCriticoTexto(texto) && !esDocumentalTexto(texto) && documentosAplicables.length === 0);
  const confianzaMapeo: ConfianzaMapeoRespuestasPreventivas = requiereFallbackActual
    ? "baja"
    : riesgo && (documentosAplicables.length > 0 || exposicionPersonas || esSimple)
      ? "alta"
      : "media";
  const advertenciasCompatibilidad = [
    ...(!riesgo ? ["Falta riesgo especifico para mapear con certeza."] : []),
    ...(requiereFallbackActual ? ["Mantener evaluacion actual como respaldo."] : []),
  ];

  return {
    aliasSemanticosNormalizados: alias,
    entradaEvaluacionSugerida: {
      riesgoEspecificoDetectado: riesgo,
      exposicionPersonas,
      consecuencia: consecuenciaEvaluacion,
      controlesExistentes,
      accionInmediata: alias.accion_inmediata || accionesInmediatas[0],
      requiereDocumentacionHabilitante: Boolean(alias.requiere_documentacion_habilitante),
      documentosRequeridos: documentosAplicables,
      requiereDetencion: Boolean(alias.requiere_detencion || accionesInmediatas.includes("detener_actividad")),
      requiereRevisionTecnica: Boolean(alias.requiere_revision_tecnica),
      evidenciaCierre: alias.requiere_evidencia_cierre ? "parcial" : undefined,
      tipoHallazgo: tipoEvento,
      descripcion: entrada.descripcionHallazgo || "",
      area: "",
      actividad: "",
      respuestas: respuestasCompatiblesLegacy,
      ambitoDeclarado,
      exposicionAmbiental,
      probabilidad,
      requiereSuspensionDeclarada: Boolean(alias.requiere_detencion || accionesInmediatas.includes("detener_actividad")),
      datosAmbientales: exposicionAmbiental
        ? {
            existeAspectoAmbiental: true,
            existeImpactoAmbiental: contieneAlguno(texto, ["derrame", "suelo", "agua"]),
            derrameOFuga: contieneAlguno(texto, ["derrame", "fuga"]),
            sustanciaPeligrosa: contieneAlguno(texto, ["gasolina", "combustible", "sustancia"]),
            requiereContencion: documentosAplicables.includes("control_ambiental"),
          }
        : undefined,
      datosLegales: documentosAplicables.length
        ? {
            documentoFaltante: true,
            permisoFaltante: documentosAplicables.includes("permiso_autorizacion"),
            procedimientoFaltante: documentosAplicables.includes("procedimiento"),
            matrizFaltante: documentosAplicables.includes("matriz_riesgos"),
            astPtpPtsFaltante: documentosAplicables.includes("ast_art") || documentosAplicables.includes("pts"),
            induccionFaltante: documentosAplicables.includes("charla_difusion"),
            faltaHabilitaActividadRiesgosa: documentosAplicables.some((documento) =>
              DOCUMENTOS_HABILITANTES.includes(documento),
            ),
          }
        : undefined,
      evidenciaDisponible: !alias.requiere_evidencia_cierre,
    },
    respuestasCompatiblesLegacy,
    camposCriticidadSugeridos: {
      criticidadOrientativa,
      exposicionPersonas,
      exposicionAmbiental,
      consecuencia,
      probabilidad,
      controlesExistentes,
      requiereSuspension: Boolean(alias.requiere_detencion || accionesInmediatas.includes("detener_actividad")),
    },
    camposRecomendacionSugeridos: {
      accionInmediata: alias.accion_inmediata || accionesInmediatas[0],
      requiereRevisionTecnica: Boolean(alias.requiere_revision_tecnica),
      requiereEvidenciaCierre: Boolean(alias.requiere_evidencia_cierre),
      regularizacionDocumental: documentosAplicables.length > 0,
    },
    documentosAplicables,
    documentosNoAplicables: documentosNoAplicables(documentosAplicables, esSimple),
    accionesInmediatas,
    advertenciasCompatibilidad,
    requiereFallbackActual,
    confianzaMapeo,
  };
};

export const validarMapeoRespuestasPreventivas = (
  mapeo: ResultadoMapeoRespuestasPreventivas,
): ValidacionMapeoRespuestasPreventivas => {
  const errores: string[] = [];
  const advertencias: string[] = [];

  if (!mapeo.aliasSemanticosNormalizados.riesgo_especifico_detectado && !mapeo.requiereFallbackActual) {
    errores.push("Mapeo sin riesgo especifico debe mantener respaldo actual.");
  }
  if (
    mapeo.documentosAplicables.some((documento) => DOCUMENTOS_FORMALES.includes(documento)) &&
    mapeo.camposCriticidadSugeridos.criticidadOrientativa === "BAJO"
  ) {
    errores.push("Hallazgo de baja criticidad no debe activar documentacion habilitante formal.");
  }
  if (mapeo.confianzaMapeo === "alta" && mapeo.requiereFallbackActual) {
    errores.push("Mapeo con fallback no puede declarar confianza alta.");
  }
  if (mapeo.documentosAplicables.length > 18) {
    advertencias.push("Mapeo contiene demasiados documentos aplicables.");
  }

  return {
    valido: errores.length === 0,
    errores,
    advertencias,
  };
};

export const compararEntradaActualVsMapeada = (
  entradaActual: Partial<EvaluacionInputV2>,
  entradaMapeada: ResultadoMapeoRespuestasPreventivas,
): ComparacionEntradaActualMapeada => {
  const sugerida = entradaMapeada.entradaEvaluacionSugerida;
  const camposAgregados = [
    "ambitoDeclarado",
    "exposicionPersonas",
    "exposicionAmbiental",
    "consecuencia",
    "probabilidad",
    "controlesExistentes",
    "requiereSuspensionDeclarada",
    "datosAmbientales",
    "datosLegales",
    "evidenciaDisponible",
  ].filter((campo) => entradaActual[campo as keyof EvaluacionInputV2] === undefined && sugerida[campo as keyof EvaluacionInputV2] !== undefined);
  const respuestasActuales = entradaActual.respuestas || {};

  return {
    camposAgregados,
    respuestasLegacyAgregadas: Object.keys(entradaMapeada.respuestasCompatiblesLegacy).filter(
      (id) => respuestasActuales[id] === undefined,
    ),
    mantieneRespuestasActuales: Object.entries(respuestasActuales).every(
      ([id, valor]) => entradaMapeada.respuestasCompatiblesLegacy[id] === valor,
    ),
    requiereFallbackActual: entradaMapeada.requiereFallbackActual,
  };
};
