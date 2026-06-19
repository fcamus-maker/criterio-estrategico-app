import type {
  AccionAplicabilidadPreventiva,
  DocumentoPreventivoAplicable,
} from "./aplicabilidadPreventivaV2";
import {
  construirMapeoRespuestasPreventivas,
  type ConfianzaMapeoRespuestasPreventivas,
} from "./mapeoRespuestasPreventivasV2";
import type { Criticidad } from "./types";

export type TipoCasoMapeoRespuestasPreventivas = "simple" | "critico" | "documental" | "ambiguo";

export type CasoPruebaMapeoRespuestasPreventivas = {
  id: string;
  tipo: TipoCasoMapeoRespuestasPreventivas;
  descripcionHallazgo: string;
  riesgoEspecificoDetectado?: string;
  documentosEsperados: DocumentoPreventivoAplicable[];
  documentosProhibidos: DocumentoPreventivoAplicable[];
  accionesEsperadas: AccionAplicabilidadPreventiva[];
  requiereFallbackEsperado: boolean;
  confianzaMinima: ConfianzaMapeoRespuestasPreventivas;
  criticidadEsperada?: Criticidad;
  legacyEsperado: string[];
};

export type FalloMapeoRespuestasPreventivas = {
  id: string;
  descripcion: string;
  errores: string[];
  severidad: "menor" | "critico";
};

export type ResultadoBancoMapeoRespuestasPreventivas = {
  totalCasos: number;
  correctos: number;
  erroresMenores: number;
  erroresCriticos: number;
  porcentajeCumplimiento: number;
  aliasFaltantes: number;
  legacyIncompleto: number;
  documentosIncorrectos: number;
  sobredocumentacionSimple: number;
  subdocumentacionCritica: number;
  criticidadMalMapeada: number;
  accionesIncorrectas: number;
  fallbackIncorrecto: number;
  fallidos: FalloMapeoRespuestasPreventivas[];
  patronesFalla: Record<string, number>;
};

const ID_RIESGO_ESPECIFICO = "transversal_anclaje_riesgo_especifico";
const DOCUMENTOS_FORMALES: DocumentoPreventivoAplicable[] = [
  "procedimiento",
  "ast_art",
  "pts",
  "permiso_autorizacion",
  "matriz_riesgos",
  "bloqueo_loto",
];

const prioridadConfianza: Record<ConfianzaMapeoRespuestasPreventivas, number> = {
  baja: 1,
  media: 2,
  alta: 3,
};

const caso = (
  id: string,
  tipo: TipoCasoMapeoRespuestasPreventivas,
  descripcionHallazgo: string,
  riesgoEspecificoDetectado: string | undefined,
  documentosEsperados: DocumentoPreventivoAplicable[],
  accionesEsperadas: AccionAplicabilidadPreventiva[],
  opciones: Partial<Omit<CasoPruebaMapeoRespuestasPreventivas, "id" | "tipo" | "descripcionHallazgo" | "riesgoEspecificoDetectado" | "documentosEsperados" | "accionesEsperadas">> = {},
): CasoPruebaMapeoRespuestasPreventivas => ({
  id,
  tipo,
  descripcionHallazgo,
  riesgoEspecificoDetectado,
  documentosEsperados,
  documentosProhibidos: opciones.documentosProhibidos || (tipo === "simple" ? DOCUMENTOS_FORMALES : []),
  accionesEsperadas,
  requiereFallbackEsperado: opciones.requiereFallbackEsperado ?? false,
  confianzaMinima: opciones.confianzaMinima || (tipo === "ambiguo" ? "baja" : "alta"),
  criticidadEsperada: opciones.criticidadEsperada,
  legacyEsperado: opciones.legacyEsperado || (riesgoEspecificoDetectado ? [ID_RIESGO_ESPECIFICO] : []),
});

const simples: CasoPruebaMapeoRespuestasPreventivas[] = [
  caso("simple-001", "simple", "Vidrio quebrado en ventana retirado del area.", "vidrio quebrado", [], ["retirar_condicion"], { criticidadEsperada: "BAJO" }),
  caso("simple-002", "simple", "Vaso trizado disponible para uso.", "vaso trizado", [], ["retirar_condicion"], { criticidadEsperada: "BAJO" }),
  caso("simple-003", "simple", "Goma de piso despegada en acceso a casino.", "goma de piso", [], ["reparar_reponer"], { criticidadEsperada: "BAJO" }),
  caso("simple-004", "simple", "Material menor en transito retirado.", "material menor", [], ["retirar_condicion"], { criticidadEsperada: "BAJO" }),
  caso("simple-005", "simple", "Limpieza simple pendiente en zona comun.", "limpieza simple", [], ["limpiar_area"], { criticidadEsperada: "BAJO" }),
  caso("simple-006", "simple", "Senalizacion menor caida en oficina.", "senalizacion menor", ["senalizacion_segregacion"], ["senalizar_segregar"], { criticidadEsperada: "BAJO" }),
  caso("simple-007", "simple", "Residuo comun simple en area de paso.", "residuo comun", [], ["retirar_condicion"], { criticidadEsperada: "BAJO" }),
  caso("simple-008", "simple", "Derrame menor de agua secado.", "derrame menor de agua", [], ["limpiar_area"], { criticidadEsperada: "BAJO" }),
  caso("simple-009", "simple", "Herramienta menor retirada de meson.", "herramienta menor retirada", [], ["retirar_condicion"], { criticidadEsperada: "BAJO" }),
  caso("simple-010", "simple", "Dano menor de mobiliario.", "dano menor", [], ["reparar_reponer"], { criticidadEsperada: "BAJO" }),
  caso("simple-011", "simple", "Caja mal ubicada retirada.", "caja mal ubicada", [], ["retirar_condicion"], { criticidadEsperada: "BAJO" }),
  caso("simple-012", "simple", "Polvo menor controlado con limpieza.", "polvo menor", [], ["limpiar_area"], { criticidadEsperada: "BAJO" }),
  caso("simple-013", "simple", "Envase vacio no peligroso retirado.", "envase vacio", [], ["retirar_condicion"], { criticidadEsperada: "BAJO" }),
  caso("simple-014", "simple", "Protector plastico desprendido sin filo.", "protector plastico", [], ["reparar_reponer"], { criticidadEsperada: "BAJO" }),
  caso("simple-015", "simple", "Funda plastica rota retirada.", "funda plastica", [], ["reparar_reponer"], { criticidadEsperada: "BAJO" }),
  caso("simple-016", "simple", "Aviso impreso caido se vuelve a fijar.", "aviso impreso", [], ["retirar_condicion"], { criticidadEsperada: "BAJO" }),
  caso("simple-017", "simple", "Separador fuera de posicion reubicado.", "separador", [], ["retirar_condicion"], { criticidadEsperada: "BAJO" }),
  caso("simple-018", "simple", "Cinta vieja retirada tras finalizar tarea.", "cinta vieja", [], ["retirar_condicion"], { criticidadEsperada: "BAJO" }),
  caso("simple-019", "simple", "Gota de agua secada en lavamanos.", "gota de agua", [], ["limpiar_area"], { criticidadEsperada: "BAJO" }),
  caso("simple-020", "simple", "Elemento suelto corregido en repisa.", "elemento suelto", [], ["retirar_condicion"], { criticidadEsperada: "BAJO" }),
  caso("simple-021", "simple", "Residuo no peligroso sin exposicion.", "residuo no peligroso", [], ["retirar_condicion"], { criticidadEsperada: "BAJO" }),
  caso("simple-022", "simple", "Pintura fresca senalizada.", "pintura fresca", ["senalizacion_segregacion"], ["senalizar_segregar"], { criticidadEsperada: "BAJO" }),
  caso("simple-023", "simple", "Etiqueta menor desprendida en archivo.", "etiqueta menor", [], ["retirar_condicion"], { criticidadEsperada: "BAJO" }),
  caso("simple-024", "simple", "Cable ordenado fuera de transito.", "cable ordenado", [], ["retirar_condicion"], { criticidadEsperada: "BAJO" }),
  caso("simple-025", "simple", "Restos menores de embalaje retirados.", "restos menores", [], ["retirar_condicion"], { criticidadEsperada: "BAJO" }),
  caso("simple-026", "simple", "Reparacion menor de cubierta decorativa.", "reparacion menor", [], ["reparar_reponer"], { criticidadEsperada: "BAJO" }),
  caso("simple-027", "simple", "Senaletica menor despegada en pasillo.", "senaletica menor", ["senalizacion_segregacion"], ["senalizar_segregar"], { criticidadEsperada: "BAJO" }),
  caso("simple-028", "simple", "Mobiliario con dano menor sin exposicion.", "mobiliario dano menor", [], ["reparar_reponer"], { criticidadEsperada: "BAJO" }),
  caso("simple-029", "simple", "Material menor ordenado en bodega.", "material menor", [], ["retirar_condicion"], { criticidadEsperada: "BAJO" }),
  caso("simple-030", "simple", "Limpieza simple de acceso realizada.", "limpieza simple", [], ["limpiar_area"], { criticidadEsperada: "BAJO" }),
];

const criticos: CasoPruebaMapeoRespuestasPreventivas[] = [
  caso("critico-001", "critico", "Trabajador sin arnes a 3 metros.", "trabajador sin arnes", ["pts", "permiso_autorizacion", "matriz_riesgos"], ["detener_actividad", "verificar_control_critico"], { criticidadEsperada: "CRITICO", legacyEsperado: [ID_RIESGO_ESPECIFICO, "p1", "p2", "p3", "procedimiento-002"] }),
  caso("critico-002", "critico", "Trabajo en caliente sin permiso.", "trabajo en caliente", ["pts", "permiso_autorizacion"], ["regularizar_documento", "verificar_control_critico"], { criticidadEsperada: "ALTO" }),
  caso("critico-003", "critico", "Equipo intervenido sin LOTO.", "equipo sin LOTO", ["bloqueo_loto", "procedimiento"], ["bloquear_energia", "regularizar_documento"], { criticidadEsperada: "CRITICO" }),
  caso("critico-004", "critico", "Excavacion sin entibacion.", "excavacion sin entibacion", ["pts", "permiso_autorizacion"], ["regularizar_documento", "verificar_control_critico"], { criticidadEsperada: "ALTO" }),
  caso("critico-005", "critico", "Area de izaje sin segregacion.", "izaje sin segregacion", ["permiso_autorizacion", "senalizacion_segregacion"], ["regularizar_documento", "verificar_control_critico"], { criticidadEsperada: "ALTO" }),
  caso("critico-006", "critico", "Carga suspendida con trabajador bajo ella.", "carga suspendida", ["permiso_autorizacion"], ["detener_actividad", "verificar_control_critico"], { criticidadEsperada: "CRITICO" }),
  caso("critico-007", "critico", "Gasolina en bidon no certificado.", "gasolina en bidon", ["hds_sds", "control_ambiental"], ["controlar_derrame", "verificar_control_critico"], { criticidadEsperada: "MEDIO" }),
  caso("critico-008", "critico", "Bodega sin HDS.", "bodega sin HDS", ["hds_sds"], ["verificar_control_critico"], { criticidadEsperada: "MEDIO" }),
  caso("critico-009", "critico", "Derrame de combustible al suelo.", "derrame combustible", ["hds_sds", "control_ambiental"], ["controlar_derrame", "verificar_control_critico"], { criticidadEsperada: "MEDIO" }),
  caso("critico-010", "critico", "Tablero electrico sin proteccion.", "tablero sin proteccion", ["bloqueo_loto", "procedimiento"], ["bloquear_energia", "regularizar_documento"], { criticidadEsperada: "CRITICO" }),
  caso("critico-011", "critico", "Conduccion imprudente en obra.", "conduccion imprudente", ["procedimiento", "matriz_riesgos"], ["regularizar_documento", "verificar_control_critico"], { criticidadEsperada: "ALTO" }),
  caso("critico-012", "critico", "Ingreso a zona restringida.", "zona restringida", ["permiso_autorizacion"], ["regularizar_documento", "verificar_control_critico"], { criticidadEsperada: "ALTO" }),
  caso("critico-013", "critico", "Certificacion vencida de eslinga.", "eslinga vencida", ["certificacion_mantencion"], ["verificar_control_critico"], { criticidadEsperada: "MEDIO" }),
  caso("critico-014", "critico", "Maquina con partes moviles expuestas.", "partes moviles expuestas", ["inspeccion", "matriz_riesgos"], ["verificar_control_critico"], { criticidadEsperada: "ALTO" }),
  caso("critico-015", "critico", "Techumbre fragil sin linea de vida.", "techumbre fragil", ["pts", "permiso_autorizacion"], ["detener_actividad", "verificar_control_critico"], { criticidadEsperada: "ALTO" }),
  caso("critico-016", "critico", "Plataforma sin barandas.", "plataforma sin barandas", ["pts", "inspeccion"], ["verificar_control_critico"], { criticidadEsperada: "ALTO" }),
  caso("critico-017", "critico", "Excavacion sin proteccion perimetral.", "excavacion sin proteccion", ["pts", "permiso_autorizacion", "senalizacion_segregacion"], ["regularizar_documento", "verificar_control_critico"], { criticidadEsperada: "ALTO" }),
  caso("critico-018", "critico", "Trabajo electrico con humedad cercana.", "electricidad con humedad", ["bloqueo_loto", "procedimiento"], ["bloquear_energia", "regularizar_documento"], { criticidadEsperada: "CRITICO" }),
  caso("critico-019", "critico", "Espacio confinado sin autorizacion.", "espacio confinado", ["pts", "permiso_autorizacion"], ["regularizar_documento", "verificar_control_critico"], { criticidadEsperada: "ALTO" }),
  caso("critico-020", "critico", "Demolicion sin segregacion.", "demolicion sin segregacion", ["pts", "senalizacion_segregacion"], ["verificar_control_critico"], { criticidadEsperada: "ALTO" }),
  caso("critico-021", "critico", "Montacarga operando junto a peatones.", "montacarga peatones", ["procedimiento", "matriz_riesgos"], ["verificar_control_critico"], { criticidadEsperada: "ALTO" }),
  caso("critico-022", "critico", "Herramienta electrica con enchufe reparado con cinta.", "enchufe danado", ["bloqueo_loto", "procedimiento", "certificacion_mantencion", "inspeccion"], ["bloquear_energia"], { criticidadEsperada: "CRITICO" }),
  caso("critico-023", "critico", "Calzado de seguridad en mal estado durante faena.", "calzado en mal estado", ["inspeccion"], ["verificar_control_critico"], { criticidadEsperada: "MEDIO" }),
  caso("critico-024", "critico", "Parabrisas de bus trizado en traslado de trabajadores.", "parabrisas trizado", ["certificacion_mantencion", "inspeccion"], ["verificar_control_critico"], { criticidadEsperada: "MEDIO" }),
  caso("critico-025", "critico", "Neumaticos gastados en camioneta de obra.", "neumaticos gastados", ["certificacion_mantencion", "inspeccion"], ["verificar_control_critico"], { criticidadEsperada: "MEDIO" }),
  caso("critico-026", "critico", "Deslizamiento de tierra cercano a frente de trabajo.", "deslizamiento de tierra", ["matriz_riesgos", "detencion_actividad"], ["detener_actividad", "verificar_control_critico"], { criticidadEsperada: "ALTO" }),
  caso("critico-027", "critico", "Omitir bloqueo antes de intervenir equipo.", "omision bloqueo LOTO", ["bloqueo_loto", "procedimiento"], ["bloquear_energia"], { criticidadEsperada: "CRITICO" }),
  caso("critico-028", "critico", "Trabajador expuesto a linea de fuego.", "linea de fuego", ["procedimiento", "matriz_riesgos"], ["verificar_control_critico"], { criticidadEsperada: "ALTO" }),
  caso("critico-029", "critico", "Residuo peligroso mal segregado.", "residuo peligroso", ["hds_sds", "control_ambiental"], ["controlar_derrame"], { criticidadEsperada: "MEDIO" }),
  caso("critico-030", "critico", "Sustancia sin rotulacion.", "sustancia sin rotulacion", ["hds_sds"], ["verificar_control_critico"], { criticidadEsperada: "MEDIO" }),
  caso("critico-031", "critico", "PTS faltante en trabajo critico.", "PTS faltante", ["pts", "matriz_riesgos"], ["regularizar_documento"], { criticidadEsperada: "MEDIO" }),
  caso("critico-032", "critico", "AST faltante en tarea de riesgo.", "AST faltante", ["ast_art", "matriz_riesgos"], ["regularizar_documento"], { criticidadEsperada: "MEDIO" }),
  caso("critico-033", "critico", "Equipo critico sin mantencion.", "equipo sin mantencion", ["certificacion_mantencion", "inspeccion"], ["verificar_control_critico"], { criticidadEsperada: "MEDIO" }),
  caso("critico-034", "critico", "Izaje con viento adverso.", "izaje con viento", ["permiso_autorizacion", "matriz_riesgos"], ["regularizar_documento"], { criticidadEsperada: "ALTO" }),
  caso("critico-035", "critico", "Trabajador pasa bajo carga suspendida.", "paso bajo carga", ["permiso_autorizacion"], ["detener_actividad"], { criticidadEsperada: "CRITICO" }),
  caso("critico-036", "critico", "Extintor vencido en zona de trabajo.", "extintor vencido", ["certificacion_mantencion", "inspeccion"], ["verificar_control_critico"], { criticidadEsperada: "MEDIO" }),
  caso("critico-037", "critico", "Trabajador sin proteccion ocular en esmerilado.", "sin proteccion ocular", ["inspeccion"], ["verificar_control_critico"], { criticidadEsperada: "MEDIO" }),
  caso("critico-038", "critico", "Camion retrocede sin segregacion peatonal.", "retroceso sin segregacion", ["senalizacion_segregacion", "procedimiento"], ["verificar_control_critico"], { criticidadEsperada: "ALTO" }),
  caso("critico-039", "critico", "Intervencion de bomba sin bloqueo de energia.", "bomba sin bloqueo", ["bloqueo_loto", "procedimiento"], ["bloquear_energia"], { criticidadEsperada: "CRITICO" }),
  caso("critico-040", "critico", "Trabajo con quimico sin HDS disponible.", "quimico sin HDS", ["hds_sds"], ["verificar_control_critico"], { criticidadEsperada: "MEDIO" }),
];

const documentales: CasoPruebaMapeoRespuestasPreventivas[] = [
  caso("documental-001", "documental", "Matriz de riesgo sin actualizar.", "matriz sin actualizar", ["matriz_riesgos"], ["regularizar_documento"], { criticidadEsperada: "MEDIO" }),
  caso("documental-002", "documental", "Charla sin firma.", "charla sin firma", ["charla_difusion", "evidencia_registro"], ["regularizar_documento", "registrar_evidencia"], { criticidadEsperada: "MEDIO" }),
  caso("documental-003", "documental", "PTS faltante.", "PTS faltante", ["pts"], ["regularizar_documento"], { criticidadEsperada: "MEDIO" }),
  caso("documental-004", "documental", "AST incompleto.", "AST incompleto", ["ast_art"], ["regularizar_documento"], { criticidadEsperada: "MEDIO" }),
  caso("documental-005", "documental", "Permiso vencido.", "permiso vencido", ["permiso_autorizacion"], ["regularizar_documento"], { criticidadEsperada: "MEDIO" }),
  caso("documental-006", "documental", "Checklist incompleto.", "checklist incompleto", ["inspeccion"], ["verificar_control_critico"], { criticidadEsperada: "MEDIO" }),
  caso("documental-007", "documental", "Evidencia fotografica insuficiente.", "evidencia insuficiente", ["evidencia_registro"], ["registrar_evidencia"], { criticidadEsperada: "MEDIO" }),
  caso("documental-008", "documental", "Procedimiento no disponible.", "procedimiento no disponible", ["procedimiento"], ["regularizar_documento"], { criticidadEsperada: "MEDIO" }),
  caso("documental-009", "documental", "HDS no difundida.", "HDS no difundida", ["hds_sds", "charla_difusion"], ["regularizar_documento"], { criticidadEsperada: "MEDIO" }),
  caso("documental-010", "documental", "Certificacion vencida.", "certificacion vencida", ["certificacion_mantencion"], ["verificar_control_critico"], { criticidadEsperada: "MEDIO" }),
  caso("documental-011", "documental", "Registro de inspeccion no disponible.", "registro inspeccion", ["inspeccion", "evidencia_registro"], ["registrar_evidencia"], { criticidadEsperada: "MEDIO" }),
  caso("documental-012", "documental", "Permiso de trabajo no firmado.", "permiso sin firma", ["permiso_autorizacion", "evidencia_registro"], ["regularizar_documento"], { criticidadEsperada: "MEDIO" }),
  caso("documental-013", "documental", "Matriz sin incorporar nuevo riesgo.", "matriz riesgo nuevo", ["matriz_riesgos"], ["regularizar_documento"], { criticidadEsperada: "MEDIO" }),
  caso("documental-014", "documental", "Charla de 5 minutos sin registro.", "charla sin registro", ["charla_difusion"], ["regularizar_documento"], { criticidadEsperada: "MEDIO" }),
  caso("documental-015", "documental", "Procedimiento disponible pero no difundido.", "procedimiento no difundido", ["procedimiento", "charla_difusion"], ["regularizar_documento"], { criticidadEsperada: "MEDIO" }),
  caso("documental-016", "documental", "Certificado de equipo no vigente.", "certificado no vigente", ["certificacion_mantencion"], ["verificar_control_critico"], { criticidadEsperada: "MEDIO" }),
  caso("documental-017", "documental", "HDS de sustancia no disponible en bodega.", "HDS no disponible", ["hds_sds"], ["regularizar_documento"], { criticidadEsperada: "MEDIO" }),
  caso("documental-018", "documental", "AST no considera energia cercana.", "AST sin energia", ["ast_art", "matriz_riesgos"], ["regularizar_documento"], { criticidadEsperada: "MEDIO" }),
  caso("documental-019", "documental", "PTS no autorizado por supervisor.", "PTS no autorizado", ["pts", "permiso_autorizacion"], ["regularizar_documento"], { criticidadEsperada: "MEDIO" }),
  caso("documental-020", "documental", "Evidencia de cierre no verificable.", "evidencia cierre", ["evidencia_registro"], ["registrar_evidencia"], { criticidadEsperada: "MEDIO" }),
];

const ambiguos: CasoPruebaMapeoRespuestasPreventivas[] = [
  caso("ambiguo-001", "ambiguo", "Descripcion larga con riesgo breve de vidrio quebrado.", "vidrio quebrado", [], ["retirar_condicion"], { criticidadEsperada: "BAJO", confianzaMinima: "alta" }),
  caso("ambiguo-002", "ambiguo", "Descripcion larga con actividad no especificada y madera con clavos.", "madera con clavos", [], ["verificar_control_critico"], { requiereFallbackEsperado: true, confianzaMinima: "baja" }),
  caso("ambiguo-003", "ambiguo", "Descripcion sin riesgo especifico.", undefined, [], [], { requiereFallbackEsperado: true, confianzaMinima: "baja", legacyEsperado: [] }),
  caso("ambiguo-004", "ambiguo", "Condicion irregular observada sin mayor detalle.", undefined, [], [], { requiereFallbackEsperado: true, confianzaMinima: "baja", legacyEsperado: [] }),
  caso("ambiguo-005", "ambiguo", "Descripcion con multiples riesgos: cable, derrame y transito cercano.", "riesgo mixto", [], ["verificar_control_critico"], { requiereFallbackEsperado: true, confianzaMinima: "baja" }),
  caso("ambiguo-006", "ambiguo", "Objeto ambiguo en zona de trabajo.", undefined, [], [], { requiereFallbackEsperado: true, confianzaMinima: "baja", legacyEsperado: [] }),
  caso("ambiguo-007", "ambiguo", "Control faltante poco claro.", undefined, [], [], { requiereFallbackEsperado: true, confianzaMinima: "baja", legacyEsperado: [] }),
  caso("ambiguo-008", "ambiguo", "Exposicion poco clara durante recorrido.", undefined, [], [], { requiereFallbackEsperado: true, confianzaMinima: "baja", legacyEsperado: [] }),
  caso("ambiguo-009", "ambiguo", "Descripcion larga con riesgo breve de goma de piso.", "goma de piso", [], ["reparar_reponer"], { criticidadEsperada: "BAJO", confianzaMinima: "alta" }),
  caso("ambiguo-010", "ambiguo", "Se detecta desviacion preventiva no especificada.", undefined, [], [], { requiereFallbackEsperado: true, confianzaMinima: "baja", legacyEsperado: [] }),
];

export const CASOS_MAPEO_RESPUESTAS_PREVENTIVAS: CasoPruebaMapeoRespuestasPreventivas[] = [
  ...simples,
  ...criticos,
  ...documentales,
  ...ambiguos,
];

const registrarPatron = (patrones: Record<string, number>, patron: string) => {
  patrones[patron] = (patrones[patron] || 0) + 1;
};

export const evaluarBancoMapeoRespuestasPreventivas = (): ResultadoBancoMapeoRespuestasPreventivas => {
  const fallidos: FalloMapeoRespuestasPreventivas[] = [];
  const patronesFalla: Record<string, number> = {};
  let aliasFaltantes = 0;
  let legacyIncompleto = 0;
  let documentosIncorrectos = 0;
  let sobredocumentacionSimple = 0;
  let subdocumentacionCritica = 0;
  let criticidadMalMapeada = 0;
  let accionesIncorrectas = 0;
  let fallbackIncorrecto = 0;

  for (const item of CASOS_MAPEO_RESPUESTAS_PREVENTIVAS) {
    const respuestasPreventivas: Record<string, string> = item.riesgoEspecificoDetectado
      ? { [ID_RIESGO_ESPECIFICO]: item.riesgoEspecificoDetectado }
      : {};
    const mapeo = construirMapeoRespuestasPreventivas({
      descripcionHallazgo: item.descripcionHallazgo,
      riesgoEspecificoDetectado: item.riesgoEspecificoDetectado,
      respuestasPreventivas,
    });
    const errores: string[] = [];
    let severidad: "menor" | "critico" = "menor";

    if (item.riesgoEspecificoDetectado && !mapeo.aliasSemanticosNormalizados.riesgo_especifico_detectado) {
      aliasFaltantes += 1;
      errores.push("Alias de riesgo especifico ausente.");
      severidad = "critico";
      registrarPatron(patronesFalla, "alias");
    }

    const faltanLegacy = item.legacyEsperado.filter((id) => mapeo.respuestasCompatiblesLegacy[id] === undefined);
    if (faltanLegacy.length > 0) {
      legacyIncompleto += 1;
      errores.push(`Compatibilidad legacy incompleta: ${faltanLegacy.join(", ")}.`);
      severidad = "critico";
      registrarPatron(patronesFalla, "legacy");
    }

    const docsFaltantes = item.documentosEsperados.filter((doc) => !mapeo.documentosAplicables.includes(doc));
    const docsProhibidos = item.documentosProhibidos.filter((doc) => mapeo.documentosAplicables.includes(doc));
    if (docsFaltantes.length > 0 || docsProhibidos.length > 0) {
      documentosIncorrectos += 1;
      errores.push(`Documentos incorrectos. Faltan: ${docsFaltantes.join(", ") || "ninguno"}; prohibidos: ${docsProhibidos.join(", ") || "ninguno"}.`);
      severidad = "critico";
      registrarPatron(patronesFalla, "documentos");
      if (item.tipo === "simple" && docsProhibidos.length > 0) sobredocumentacionSimple += 1;
      if (item.tipo === "critico" && docsFaltantes.length > 0) subdocumentacionCritica += 1;
    }

    const accionesFaltantes = item.accionesEsperadas.filter((accion) => !mapeo.accionesInmediatas.includes(accion));
    if (accionesFaltantes.length > 0) {
      accionesIncorrectas += 1;
      errores.push(`Acciones esperadas ausentes: ${accionesFaltantes.join(", ")}.`);
      severidad = "critico";
      registrarPatron(patronesFalla, "acciones");
    }

    if (item.criticidadEsperada && mapeo.camposCriticidadSugeridos.criticidadOrientativa !== item.criticidadEsperada) {
      criticidadMalMapeada += 1;
      errores.push(
        `Criticidad obtenida ${mapeo.camposCriticidadSugeridos.criticidadOrientativa}; esperada ${item.criticidadEsperada}.`,
      );
      severidad = "critico";
      registrarPatron(patronesFalla, "criticidad");
    }

    if (mapeo.requiereFallbackActual !== item.requiereFallbackEsperado) {
      fallbackIncorrecto += 1;
      errores.push(`Fallback obtenido ${mapeo.requiereFallbackActual}; esperado ${item.requiereFallbackEsperado}.`);
      severidad = "critico";
      registrarPatron(patronesFalla, "fallback");
    }

    if (prioridadConfianza[mapeo.confianzaMapeo] < prioridadConfianza[item.confianzaMinima]) {
      errores.push(`Confianza ${mapeo.confianzaMapeo}; minima esperada ${item.confianzaMinima}.`);
      severidad = "critico";
      registrarPatron(patronesFalla, "confianza");
    }

    if (errores.length > 0) {
      fallidos.push({
        id: item.id,
        descripcion: item.descripcionHallazgo,
        errores,
        severidad,
      });
    }
  }

  const erroresCriticos = fallidos.filter((fallo) => fallo.severidad === "critico").length;
  const erroresMenores = fallidos.length - erroresCriticos;
  const correctos = CASOS_MAPEO_RESPUESTAS_PREVENTIVAS.length - fallidos.length;

  return {
    totalCasos: CASOS_MAPEO_RESPUESTAS_PREVENTIVAS.length,
    correctos,
    erroresMenores,
    erroresCriticos,
    porcentajeCumplimiento: Math.round((correctos / CASOS_MAPEO_RESPUESTAS_PREVENTIVAS.length) * 100),
    aliasFaltantes,
    legacyIncompleto,
    documentosIncorrectos,
    sobredocumentacionSimple,
    subdocumentacionCritica,
    criticidadMalMapeada,
    accionesIncorrectas,
    fallbackIncorrecto,
    fallidos,
    patronesFalla,
  };
};
