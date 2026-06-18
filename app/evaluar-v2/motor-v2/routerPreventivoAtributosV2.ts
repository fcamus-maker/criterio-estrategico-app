import {
  DESVIACIONES_PREVENTIVAS_V2,
  TAXONOMIA_PREVENTIVA_V2,
  obtenerDesviacionPreventivaPorId,
  obtenerFamiliaPreventivaPorId,
  type AmbitoTaxonomiaPreventiva,
  type DesviacionPreventivaId,
  type FamiliaTaxonomiaPreventivaId,
} from "./taxonomiaPreventivaV2";

export type ConfianzaRouterPreventivo = "baja" | "media" | "alta";
export type SuficienciaTecnicaPreventiva = "insuficiente" | "parcial" | "suficiente";

export type EntradaRouterPreventivo = {
  descripcion: string;
  area?: string;
  actividad?: string;
  tipoHallazgo?: string;
  respuestasPrevias?: Record<string, unknown>;
  contexto?: Record<string, unknown>;
  ambitoDeclarado?: string;
  riesgoEspecificoDeclarado?: string;
  exposicionDeclarada?: string;
  consecuenciaDeclarada?: string;
  controlDeclarado?: string;
};

export type RazonClasificacionPreventiva = {
  tipo: "objeto" | "condicion" | "exposicion" | "consecuencia" | "control" | "ambito" | "desviacion" | "regla";
  valor: string;
  detalle: string;
  familiasRelacionadas: FamiliaTaxonomiaPreventivaId[];
  desviacionesRelacionadas: DesviacionPreventivaId[];
  peso: number;
};

export type ResultadoRouterPreventivo = {
  familiaPrimariaId: FamiliaTaxonomiaPreventivaId | null;
  familiasSecundariasIds: FamiliaTaxonomiaPreventivaId[];
  desviacionesIds: DesviacionPreventivaId[];
  objetoDetectado: string[];
  condicionDetectada: string[];
  exposicionDetectada: string[];
  consecuenciaProbable: string[];
  controlFaltanteOFallido: string[];
  ambitoPrincipal: AmbitoTaxonomiaPreventiva | "no_verificable";
  ambitosSecundarios: AmbitoTaxonomiaPreventiva[];
  confianzaClasificacion: ConfianzaRouterPreventivo;
  suficienciaTecnica: SuficienciaTecnicaPreventiva;
  preguntasAclaracionSugeridas: string[];
  requiereRevisionTecnica: boolean;
  razonesClasificacion: RazonClasificacionPreventiva[];
  erroresEvitar: string[];
};

type TipoSenal = "objeto" | "condicion" | "exposicion" | "consecuencia" | "control";

type DefinicionSenal = {
  valor: string;
  tipo: TipoSenal;
  terminos: string[];
  familias: FamiliaTaxonomiaPreventivaId[];
  desviaciones?: DesviacionPreventivaId[];
  peso: number;
};

type PuntuacionFamilia = {
  id: FamiliaTaxonomiaPreventivaId;
  puntaje: number;
  razones: string[];
};

type PuntuacionDesviacion = {
  id: DesviacionPreventivaId;
  puntaje: number;
  razones: string[];
};

export type CasoPruebaRouterPreventivo = {
  id: string;
  descripcion: string;
  familiaPrimariaEsperada: FamiliaTaxonomiaPreventivaId;
  familiasSecundariasEsperadas: FamiliaTaxonomiaPreventivaId[];
  desviacionesEsperadas: DesviacionPreventivaId[];
  suficienciaTecnicaEsperada: SuficienciaTecnicaPreventiva;
  errorQueDebeEvitar: string;
};

export type ResultadoCasoPruebaRouterPreventivo = {
  idCaso: string;
  descripcion: string;
  esperado: {
    familiaPrimaria: FamiliaTaxonomiaPreventivaId;
    familiasSecundarias: FamiliaTaxonomiaPreventivaId[];
    desviaciones: DesviacionPreventivaId[];
    suficienciaTecnica: SuficienciaTecnicaPreventiva;
    errorQueDebeEvitar: string;
  };
  obtenido: ResultadoRouterPreventivo;
  cumpleFamiliaPrimaria: boolean;
  cumpleFamiliaSecundariaMinima: boolean;
  cumpleDesviacionPrincipal: boolean;
  cumpleSuficienciaTecnica: boolean;
  detectaErrorEvitado: boolean;
  observaciones: string[];
};

const EQUIVALENCIAS_TEXTO = [
  { canonico: "cinta aisladora", terminos: ["huincha", "guincha", "huincha aisladora", "cinta aislante"] },
  { canonico: "hds sds hoja datos seguridad", terminos: ["hds", "sds", "hoja de datos de seguridad", "hoja de seguridad"] },
  { canonico: "ast art analisis seguro trabajo", terminos: ["ast", "art", "analisis seguro de trabajo", "analisis de riesgo de tarea"] },
  { canonico: "pts procedimiento trabajo seguro", terminos: ["pts", "procedimiento de trabajo seguro"] },
  { canonico: "epp elemento proteccion personal", terminos: ["epp", "elemento de proteccion personal", "elementos de proteccion personal"] },
  { canonico: "loto bloqueo energia energia cero", terminos: ["loto", "bloqueo", "bloqueo de energia", "energia cero"] },
  { canonico: "senalizacion senaletica", terminos: ["senalizacion", "senaletica", "señalizacion", "señaletica"] },
  { canonico: "segregacion delimitacion barrera", terminos: ["segregacion", "delimitacion", "barrera", "barreras", "area segregada"] },
  { canonico: "extintor vencido sin mantencion no vigente", terminos: ["extintor vencido", "extintor sin mantencion", "extintor no vigente"] },
  { canonico: "parabrisas trizado vidrio trizado", terminos: ["parabrisas trizado", "vidrio trizado"] },
  { canonico: "neumatico gastado desgastado", terminos: ["neumatico gastado", "neumatico desgastado", "neumaticos gastados"] },
  { canonico: "eslinga deteriorada mal estado", terminos: ["eslinga deteriorada", "eslinga en mal estado"] },
  { canonico: "grillete deteriorado mal estado", terminos: ["grillete deteriorado", "grillete en mal estado"] },
  { canonico: "herramienta danada mal estado", terminos: ["herramienta danada", "herramienta dañada", "herramienta en mal estado"] },
  { canonico: "equipo danado mal estado", terminos: ["equipo danado", "equipo dañado", "equipo en mal estado"] },
  { canonico: "bodega sin hds", terminos: ["bodega sin hds", "hds no disponible", "hoja de seguridad no disponible"] },
  { canonico: "zona delimitada area segregada area restringida", terminos: ["zona delimitada", "area segregada", "area restringida"] },
  { canonico: "carga suspendida carga izada", terminos: ["carga suspendida", "carga izada"] },
];

const SENALES_ATRIBUTO: DefinicionSenal[] = [
  senal("objeto", "extintor", ["extintor"], ["equipos_emergencia"], ["condicion_insegura"], 12),
  senal("objeto", "equipo de emergencia", ["red humeda", "gabinete de emergencia", "kit de derrame"], ["equipos_emergencia"], ["condicion_insegura"], 10),
  senal("objeto", "madera con clavos", ["madera con clavos", "clavos", "madera"], ["orden_aseo_housekeeping", "seguridad_trabajadores"], ["condicion_insegura"], 10),
  senal("objeto", "herramienta", ["herramienta", "taladro", "esmeril", "enchufe", "cable"], ["herramientas_equipos"], ["condicion_insegura"], 9),
  senal("objeto", "vehiculo", ["vehiculo", "bus", "camioneta", "camion", "neumatico", "parabrisas"], ["vehiculos_transporte"], ["condicion_insegura"], 9),
  senal("objeto", "elementos de izaje", ["grua", "eslinga", "grillete", "carga suspendida", "carga izada", "rigger"], ["izaje_gruas_amarre"], ["condicion_insegura"], 11),
  senal("objeto", "arnes", ["arnes", "linea de vida", "trabajo en altura", "altura"], ["trabajos_criticos", "epp"], ["incumplimiento_control_critico"], 11),
  senal("objeto", "calzado de seguridad", ["calzado", "zapato de seguridad", "botin", "botin de seguridad"], ["epp"], ["condicion_insegura"], 9),
  senal("objeto", "HDS/SDS", ["hds", "sds", "hoja de datos de seguridad", "hoja de seguridad"], ["sustancias_hds", "documental_legal"], ["omision_documental"], 10),
  senal("objeto", "sustancia peligrosa", ["gasolina", "combustible", "bidon", "quimico", "sustancia", "derrame"], ["sustancias_hds", "medio_ambiente"], ["condicion_insegura"], 10),
  senal("objeto", "tablero o energia", ["tablero electrico", "energia", "equipo energizado", "enchufe", "cable"], ["energia_loto_electrico"], ["control_critico_ausente_no_verificado"], 10),
  senal("objeto", "excavacion o suelo", ["excavacion", "zanja", "desnivel", "suelo", "talud"], ["excavaciones_suelos"], ["condicion_insegura"], 10),
  senal("objeto", "superficie de transito", ["piso", "goma", "acceso", "casino", "camino de circulacion", "zona de transito"], ["dano_material", "orden_aseo_housekeeping"], ["condicion_insegura"], 8),
  senal("objeto", "vaso o vidrio", ["vaso", "vidrio"], ["dano_material"], ["condicion_insegura"], 7),
  senal("objeto", "barrera o senalizacion", ["barrera", "senalizacion", "senaletica", "delimitacion", "segregacion", "zona delimitada", "zona restringida"], ["senalizacion_segregacion"], ["evasion_barreras_senalizacion_segregacion"], 9),
  senal("objeto", "tapa o alcantarillado", ["tapa de alcantarillado", "alcantarillado", "tapa retirada", "tapa"], ["dano_material", "orden_aseo_housekeeping"], ["condicion_insegura"], 9),
  senal("objeto", "documento o registro", ["charla", "firma", "registro", "procedimiento", "permiso", "autorizacion", "matriz"], ["documental_legal", "capacitacion_evidencias"], ["omision_documental"], 8),
  senal("condicion", "vencido o no vigente", ["vencido", "no vigente", "sin mantencion", "mantencion vencida"], ["mantencion_certificacion"], ["condicion_insegura"], 12),
  senal("condicion", "obstruido", ["obstruido", "bloqueado", "sin acceso"], ["equipos_emergencia", "orden_aseo_housekeeping", "senalizacion_segregacion"], ["condicion_insegura"], 9),
  senal("condicion", "danado o mal estado", ["danado", "dañado", "deteriorado", "mal estado", "desgastado", "gastado", "trizado", "reparado con cinta", "cinta aisladora"], ["mantencion_certificacion", "dano_material"], ["condicion_insegura"], 10),
  senal("condicion", "sin respaldo documental", ["sin firma", "sin registro", "sin difusion", "no disponible", "no actualizado", "sin hds", "sin respaldo"], ["documental_legal", "capacitacion_evidencias"], ["omision_documental"], 9),
  senal("condicion", "sin control fisico", ["sin proteccion", "sin segregacion", "sin delimitacion", "sin barrera", "sin senalizacion"], ["senalizacion_segregacion", "seguridad_trabajadores"], ["control_critico_ausente_no_verificado"], 10),
  senal("condicion", "sin autorizacion", ["sin autorizacion", "no autorizado", "sin permiso"], ["documental_legal", "trabajos_criticos"], ["acceso_zona_delimitada_sin_autorizacion"], 10),
  senal("condicion", "sin bloqueo", ["sin bloqueo", "sin loto", "sin energia cero", "equipo intervenido"], ["energia_loto_electrico", "trabajos_criticos"], ["incumplimiento_control_critico"], 12),
  senal("condicion", "retirado o no repuesto", ["retirado", "no repuesto", "retirada", "no instalada"], ["dano_material", "orden_aseo_housekeeping"], ["condicion_insegura"], 8),
  senal("condicion", "conducta imprudente", ["imprudente", "temeraria", "exceso de velocidad", "maniobra insegura"], ["vehiculos_transporte", "seguridad_trabajadores"], ["conduccion_imprudente"], 11),
  senal("condicion", "uso inadecuado", ["uso inadecuado", "mala forma", "mal uso", "herramienta inadecuada", "equipo inadecuado"], ["herramientas_equipos"], ["uso_inadecuado_herramienta_equipo_maquinaria"], 10),
  senal("condicion", "derrame o fuga", ["derrame", "fuga", "filtracion"], ["medio_ambiente", "sustancias_hds"], ["evento_ambiental"], 11),
  senal("condicion", "terreno inestable", ["inestable", "resbaladizo", "barro", "deslizamiento", "terreno irregular"], ["clima_entorno", "excavaciones_suelos"], ["desplazamiento_terreno_inestable"], 9),
  senal("exposicion", "personas expuestas", ["trabajador", "trabajadores", "peaton", "peatones", "terceros", "operador", "conductor", "persona expuesta"], ["seguridad_trabajadores"], ["condicion_insegura"], 8),
  senal("exposicion", "transito interno", ["transito interno", "camino de circulacion", "zona de transito", "acceso a casino"], ["vehiculos_transporte", "orden_aseo_housekeeping"], ["transito_interno_inseguro"], 7),
  senal("exposicion", "linea de fuego", ["linea de fuego", "carga suspendida", "bajo carga"], ["seguridad_trabajadores", "izaje_gruas_amarre"], ["exposicion_linea_fuego"], 12),
  senal("exposicion", "energia peligrosa", ["energia peligrosa", "equipo energizado", "intervenir equipo"], ["energia_loto_electrico"], ["incumplimiento_control_critico"], 10),
  senal("exposicion", "medio ambiente", ["suelo", "agua", "aire", "medio ambiente", "alcantarillado", "residuo peligroso"], ["medio_ambiente"], ["evento_ambiental"], 8),
  senal("consecuencia", "caida mismo nivel", ["caida mismo nivel", "tropiezo", "resbalon"], ["seguridad_trabajadores", "orden_aseo_housekeeping"], ["condicion_insegura"], 8),
  senal("consecuencia", "caida de altura", ["caida de altura", "caer de altura", "tres metros", "3 metros"], ["trabajos_criticos", "seguridad_trabajadores"], ["incumplimiento_control_critico"], 12),
  senal("consecuencia", "corte o puncion", ["corte", "puncion", "pinchazo", "herida cortante"], ["seguridad_trabajadores"], ["condicion_insegura"], 8),
  senal("consecuencia", "electrocucion", ["electrocucion", "choque electrico", "contacto electrico"], ["energia_loto_electrico"], ["control_critico_ausente_no_verificado"], 11),
  senal("consecuencia", "incendio o explosion", ["incendio", "explosion", "amago", "fuego", "humo"], ["emergencias_reales", "equipos_emergencia", "sustancias_hds"], ["suceso_peligroso_sin_lesion"], 12),
  senal("consecuencia", "atropello o colision", ["atropello", "colision", "volcamiento"], ["vehiculos_transporte", "seguridad_trabajadores"], ["interaccion_insegura_peaton_vehiculo_maquinaria"], 10),
  senal("consecuencia", "contaminacion", ["contaminacion", "impacto ambiental", "derrame"], ["medio_ambiente"], ["evento_ambiental"], 10),
  senal("control", "EPP", ["epp", "arnes", "calzado de seguridad", "casco", "guante"], ["epp"], ["incumplimiento_control_critico"], 8),
  senal("control", "senalizacion o segregacion", ["senalizacion", "senaletica", "segregacion", "delimitacion", "barrera", "control de acceso"], ["senalizacion_segregacion"], ["control_critico_ausente_no_verificado"], 9),
  senal("control", "documento habilitante", ["procedimiento", "ast", "art", "pts", "permiso", "autorizacion", "matriz de riesgos"], ["documental_legal", "trabajos_criticos"], ["omision_documental"], 8),
  senal("control", "HDS/SDS", ["hds", "sds", "hoja de seguridad"], ["sustancias_hds", "documental_legal"], ["omision_documental"], 9),
  senal("control", "certificacion o mantencion", ["certificacion", "mantencion", "inspeccion", "no certificado"], ["mantencion_certificacion"], ["condicion_insegura"], 9),
  senal("control", "bloqueo/LOTO", ["loto", "bloqueo", "energia cero"], ["energia_loto_electrico"], ["incumplimiento_control_critico"], 11),
  senal("control", "retiro o reposicion", ["retiro inmediato", "reposicion", "reparacion", "retirar", "no repuesto"], ["mantencion_certificacion", "dano_material"], ["condicion_insegura"], 7),
  senal("control", "contencion ambiental", ["contencion", "kit de derrame", "control ambiental"], ["medio_ambiente", "sustancias_hds"], ["evento_ambiental"], 8),
];

export const CASOS_PRUEBA_ROUTER_PREVENTIVO: CasoPruebaRouterPreventivo[] = [
  caso("caso-router-001", "Extintor vencido en pasillo de bodega.", "equipos_emergencia", ["mantencion_certificacion"], ["condicion_insegura"], "suficiente", "No debe clasificarse como emergencia real o fuego activo."),
  caso("caso-router-002", "Extintor obstruido por materiales en acceso a oficina.", "equipos_emergencia", ["senalizacion_segregacion", "orden_aseo_housekeeping"], ["condicion_insegura"], "suficiente", "No debe tratarse como incendio activo."),
  caso("caso-router-003", "Madera con clavos en zona de transito de trabajadores.", "orden_aseo_housekeeping", ["seguridad_trabajadores", "senalizacion_segregacion"], ["condicion_insegura"], "parcial", "No debe tratarse como dano material simple."),
  caso("caso-router-004", "Bodega sin HDS disponible para productos quimicos almacenados.", "sustancias_hds", ["documental_legal", "capacitacion_evidencias"], ["omision_documental"], "suficiente", "No debe tratarse como documento generico sin vinculo a sustancias."),
  caso("caso-router-005", "Charla de 5 minutos realizada sin firma de participantes.", "capacitacion_evidencias", ["documental_legal"], ["omision_documental", "falta_conocimiento_capacitacion_difusion"], "suficiente", "No debe gatillar controles de trabajo critico si no hay tarea critica."),
  caso("caso-router-006", "Trabajador sin arnes ejecuta actividad a 3 metros de altura.", "trabajos_criticos", ["epp", "seguridad_trabajadores", "documental_legal"], ["incumplimiento_control_critico"], "parcial", "No debe tratarse solo como EPP menor."),
  caso("caso-router-007", "Gasolina almacenada en bidon no certificado dentro de bodega.", "sustancias_hds", ["medio_ambiente", "equipos_emergencia", "documental_legal"], ["condicion_insegura"], "parcial", "No debe tratarse solo como documento faltante."),
  caso("caso-router-008", "Neumaticos gastados en camioneta operativa.", "vehiculos_transporte", ["mantencion_certificacion", "seguridad_trabajadores"], ["condicion_insegura"], "suficiente", "No debe clasificarse como dano material estetico."),
  caso("caso-router-009", "Parabrisas de bus trizado durante traslado de trabajadores.", "vehiculos_transporte", ["dano_material", "seguridad_trabajadores"], ["condicion_insegura"], "suficiente", "No debe ignorar exposicion de pasajeros."),
  caso("caso-router-010", "Gomas del piso despegadas en acceso a casino.", "dano_material", ["orden_aseo_housekeeping", "seguridad_trabajadores"], ["condicion_insegura"], "parcial", "No debe sobredocumentarse con PTS o AST."),
  caso("caso-router-011", "Vaso trizado disponible para uso en comedor.", "dano_material", ["seguridad_trabajadores"], ["condicion_insegura"], "suficiente", "No debe gatillar PTS o AST como requisito principal."),
  caso("caso-router-012", "Enchufe de taladro danado y reparado con huincha aisladora.", "energia_loto_electrico", ["herramientas_equipos", "mantencion_certificacion"], ["herramienta_equipo_mal_estado_usado_terreno"], "suficiente", "No debe clasificarse solo como herramienta generica."),
  caso("caso-router-013", "Calzado de seguridad en mal estado usado en terreno.", "epp", ["mantencion_certificacion", "seguridad_trabajadores"], ["condicion_insegura"], "suficiente", "No debe tratarse como falta documental principal."),
  caso("caso-router-014", "Eslinga deteriorada disponible para maniobra de izaje.", "izaje_gruas_amarre", ["mantencion_certificacion", "trabajos_criticos"], ["condicion_insegura"], "suficiente", "No debe tratarse como dano material simple."),
  caso("caso-router-015", "Trabajador accede a zona delimitada sin autorizacion.", "senalizacion_segregacion", ["seguridad_trabajadores"], ["acceso_zona_delimitada_sin_autorizacion", "acto_inseguro"], "suficiente", "No debe tratarse como falta de senalizacion si la barrera fue evadida."),
  caso("caso-router-016", "Equipo intervenido sin bloqueo LOTO antes de mantencion.", "energia_loto_electrico", ["trabajos_criticos", "seguridad_trabajadores"], ["incumplimiento_control_critico"], "suficiente", "No debe tratarse como registro documental menor."),
  caso("caso-router-017", "Tapa de alcantarillado retirada y no repuesta en ruta peatonal.", "orden_aseo_housekeeping", ["dano_material", "seguridad_trabajadores", "senalizacion_segregacion"], ["condicion_insegura"], "suficiente", "No debe omitir control de area o reposicion."),
  caso("caso-router-018", "Trabajador pasa bajo carga suspendida durante maniobra.", "izaje_gruas_amarre", ["seguridad_trabajadores", "trabajos_criticos"], ["paso_bajo_carga_suspendida", "exposicion_linea_fuego"], "parcial", "No debe tratarse como transito interno simple."),
  caso("caso-router-019", "Conduccion imprudente de camioneta al interior de obra.", "vehiculos_transporte", ["seguridad_trabajadores"], ["conduccion_imprudente", "acto_inseguro"], "suficiente", "No debe clasificarse como dano material simple."),
  caso("caso-router-020", "Uso de herramienta inadecuada para retirar pieza metalica.", "herramientas_equipos", ["seguridad_trabajadores"], ["herramienta_equipo_inadecuado_para_tarea", "uso_inadecuado_herramienta_equipo_maquinaria"], "suficiente", "No debe confundirse con herramienta danada si no se describe mal estado."),
];

function senal(
  tipo: TipoSenal,
  valor: string,
  terminos: string[],
  familias: FamiliaTaxonomiaPreventivaId[],
  desviaciones: DesviacionPreventivaId[] | undefined,
  peso: number,
): DefinicionSenal {
  return { tipo, valor, terminos, familias, desviaciones, peso };
}

function caso(
  id: string,
  descripcion: string,
  familiaPrimariaEsperada: FamiliaTaxonomiaPreventivaId,
  familiasSecundariasEsperadas: FamiliaTaxonomiaPreventivaId[],
  desviacionesEsperadas: DesviacionPreventivaId[],
  suficienciaTecnicaEsperada: SuficienciaTecnicaPreventiva,
  errorQueDebeEvitar: string,
): CasoPruebaRouterPreventivo {
  return {
    id,
    descripcion,
    familiaPrimariaEsperada,
    familiasSecundariasEsperadas,
    desviacionesEsperadas,
    suficienciaTecnicaEsperada,
    errorQueDebeEvitar,
  };
}

export function normalizarTextoPreventivo(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s/.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function textoContexto(valor: unknown): string {
  if (valor === null || valor === undefined) return "";
  if (Array.isArray(valor)) return valor.map(textoContexto).join(" ");
  if (typeof valor === "object") return Object.values(valor as Record<string, unknown>).map(textoContexto).join(" ");
  return String(valor);
}

function construirTextoBusqueda(input: EntradaRouterPreventivo): string {
  const textoBase = [
    input.descripcion,
    input.area,
    input.actividad,
    input.tipoHallazgo,
    input.ambitoDeclarado,
    input.riesgoEspecificoDeclarado,
    input.exposicionDeclarada,
    input.consecuenciaDeclarada,
    input.controlDeclarado,
    textoContexto(input.respuestasPrevias),
    textoContexto(input.contexto),
  ]
    .filter(Boolean)
    .join(" ");

  const normalizado = normalizarTextoPreventivo(textoBase);
  const equivalencias = EQUIVALENCIAS_TEXTO.flatMap((equivalencia) => {
    const coincide = equivalencia.terminos.some((termino) =>
      contieneTermino(normalizado, normalizarTextoPreventivo(termino)),
    );
    return coincide ? [equivalencia.canonico] : [];
  });

  return normalizarTextoPreventivo([normalizado, ...equivalencias].join(" "));
}

function contieneTermino(texto: string, termino: string): boolean {
  if (!termino) return false;
  if (termino.includes(" ") || termino.includes("/")) return texto.includes(termino);

  const singular = termino.endsWith("s") ? termino.slice(0, -1) : termino;
  const plural = termino.endsWith("s") ? termino : `${termino}s`;
  const patron = new RegExp(`(^|\\s)(${escaparRegExp(singular)}|${escaparRegExp(plural)})(\\s|$)`);
  return patron.test(texto);
}

function escaparRegExp(valor: string): string {
  return valor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function detectarSenales(texto: string): RazonClasificacionPreventiva[] {
  return SENALES_ATRIBUTO.flatMap((senalItem) => {
    const coincidencias = senalItem.terminos
      .map(normalizarTextoPreventivo)
      .filter((termino) => contieneTermino(texto, termino));

    if (coincidencias.length === 0) return [];

    return [
      {
        tipo: senalItem.tipo,
        valor: senalItem.valor,
        detalle: `Se detecto ${senalItem.tipo} por: ${coincidencias.join(", ")}.`,
        familiasRelacionadas: senalItem.familias,
        desviacionesRelacionadas: senalItem.desviaciones || [],
        peso: senalItem.peso + coincidencias.length,
      },
    ];
  });
}

function crearPuntajesFamilia(): Map<FamiliaTaxonomiaPreventivaId, PuntuacionFamilia> {
  return new Map(
    TAXONOMIA_PREVENTIVA_V2.map((familiaItem) => [
      familiaItem.id,
      { id: familiaItem.id, puntaje: 0, razones: [] },
    ]),
  );
}

function crearPuntajesDesviacion(): Map<DesviacionPreventivaId, PuntuacionDesviacion> {
  return new Map(
    DESVIACIONES_PREVENTIVAS_V2.map((desviacionItem) => [
      desviacionItem.id,
      { id: desviacionItem.id, puntaje: 0, razones: [] },
    ]),
  );
}

function sumarFamilia(
  puntajes: Map<FamiliaTaxonomiaPreventivaId, PuntuacionFamilia>,
  id: FamiliaTaxonomiaPreventivaId,
  puntos: number,
  razon: string,
) {
  const actual = puntajes.get(id);
  if (!actual) return;
  actual.puntaje += puntos;
  actual.razones.push(razon);
}

function sumarDesviacion(
  puntajes: Map<DesviacionPreventivaId, PuntuacionDesviacion>,
  id: DesviacionPreventivaId,
  puntos: number,
  razon: string,
) {
  const actual = puntajes.get(id);
  if (!actual) return;
  actual.puntaje += puntos;
  actual.razones.push(razon);
}

function aplicarPuntajeTaxonomia(
  texto: string,
  puntajesFamilia: Map<FamiliaTaxonomiaPreventivaId, PuntuacionFamilia>,
) {
  TAXONOMIA_PREVENTIVA_V2.forEach((familiaItem) => {
    familiaItem.expresionesAsociadas.forEach((expresion) => {
      const expresionNormalizada = normalizarTextoPreventivo(expresion);
      if (contieneTermino(texto, expresionNormalizada)) {
        sumarFamilia(puntajesFamilia, familiaItem.id, expresionNormalizada.includes(" ") ? 4 : 2, `Expresion asociada a ${familiaItem.nombreVisible}: ${expresion}.`);
      }
    });

    familiaItem.atributosClave.forEach((atributo) => {
      const atributoNormalizado = normalizarTextoPreventivo(atributo);
      if (contieneTermino(texto, atributoNormalizado)) {
        sumarFamilia(puntajesFamilia, familiaItem.id, 1, `Atributo preventivo asociado: ${atributo}.`);
      }
    });
  });
}

function aplicarSenales(
  razones: RazonClasificacionPreventiva[],
  puntajesFamilia: Map<FamiliaTaxonomiaPreventivaId, PuntuacionFamilia>,
  puntajesDesviacion: Map<DesviacionPreventivaId, PuntuacionDesviacion>,
) {
  razones.forEach((razon) => {
    razon.familiasRelacionadas.forEach((familiaId) => {
      sumarFamilia(puntajesFamilia, familiaId, razon.peso, razon.detalle);
    });
    razon.desviacionesRelacionadas.forEach((desviacionId) => {
      sumarDesviacion(puntajesDesviacion, desviacionId, razon.peso, razon.detalle);
    });
  });
}

function aplicarReglasDiferenciacion(
  texto: string,
  razones: RazonClasificacionPreventiva[],
  puntajesFamilia: Map<FamiliaTaxonomiaPreventivaId, PuntuacionFamilia>,
  puntajesDesviacion: Map<DesviacionPreventivaId, PuntuacionDesviacion>,
) {
  const tiene = (terminos: string[]) => terminos.some((termino) => contieneTermino(texto, normalizarTextoPreventivo(termino)));
  const agregarRegla = (
    valor: string,
    detalle: string,
    familias: FamiliaTaxonomiaPreventivaId[],
    desviaciones: DesviacionPreventivaId[],
    peso: number,
  ) => {
    razones.push({
      tipo: "regla",
      valor,
      detalle,
      familiasRelacionadas: familias,
      desviacionesRelacionadas: desviaciones,
      peso,
    });
    familias.forEach((familiaId) => sumarFamilia(puntajesFamilia, familiaId, peso, detalle));
    desviaciones.forEach((desviacionId) => sumarDesviacion(puntajesDesviacion, desviacionId, peso, detalle));
  };

  const hayFuegoActivo = tiene(["fuego", "humo", "amago", "incendio", "explosion", "evacuacion"]);

  if (tiene(["extintor"]) && tiene(["vencido", "no vigente", "sin mantencion", "mantencion vencida"])) {
    agregarRegla(
      "equipo de emergencia no vigente",
      "Extintor con vigencia o mantencion observada; se prioriza equipo de emergencia y mantencion, no emergencia real.",
      ["equipos_emergencia", "mantencion_certificacion"],
      ["condicion_insegura"],
      24,
    );
    sumarFamilia(puntajesFamilia, "equipos_emergencia", 12, "El objeto principal es un equipo de emergencia.");
    if (!hayFuegoActivo) sumarFamilia(puntajesFamilia, "emergencias_reales", -30, "No hay senales de fuego, humo, amago, explosion o evacuacion real.");
  }

  if (tiene(["extintor"]) && tiene(["obstruido", "bloqueado", "sin acceso"])) {
    agregarRegla(
      "equipo de emergencia obstruido",
      "Extintor con acceso obstruido; se prioriza disponibilidad del equipo y control de acceso.",
      ["equipos_emergencia", "senalizacion_segregacion", "orden_aseo_housekeeping"],
      ["condicion_insegura"],
      20,
    );
    if (!hayFuegoActivo) sumarFamilia(puntajesFamilia, "emergencias_reales", -24, "Obstruccion de equipo no equivale a emergencia activa.");
  }

  if (hayFuegoActivo) {
    agregarRegla(
      "emergencia real",
      "El texto contiene senales de fuego, humo, amago, explosion o evacuacion.",
      ["emergencias_reales", "equipos_emergencia"],
      ["suceso_peligroso_sin_lesion"],
      22,
    );
  }

  if (tiene(["madera", "clavos"]) && tiene(["transito", "zona de transito", "camino de circulacion"])) {
    agregarRegla(
      "objeto punzante en circulacion",
      "Madera con clavos en zona de circulacion combina condicion del entorno con exposicion de personas.",
      ["orden_aseo_housekeeping", "seguridad_trabajadores", "senalizacion_segregacion"],
      ["condicion_insegura"],
      20,
    );
  }

  if (tiene(["hds", "sds", "hoja de seguridad"]) && tiene(["bodega", "quimico", "sustancia", "producto"])) {
    agregarRegla(
      "informacion tecnica de sustancia no disponible",
      "La ausencia de HDS/SDS se vincula a sustancias peligrosas, no solo a un registro administrativo.",
      ["sustancias_hds", "documental_legal", "capacitacion_evidencias"],
      ["omision_documental"],
      20,
    );
  }

  if (tiene(["charla"]) && tiene(["sin firma", "sin registro"])) {
    agregarRegla(
      "difusion sin respaldo verificable",
      "La charla sin firma afecta trazabilidad de capacitacion o difusion.",
      ["capacitacion_evidencias", "documental_legal"],
      ["omision_documental", "falta_conocimiento_capacitacion_difusion"],
      18,
    );
  }

  if (tiene(["arnes", "altura", "3 metros", "tres metros"]) && tiene(["sin arnes", "sin epp", "trabajador"])) {
    agregarRegla(
      "trabajo en altura sin control critico",
      "Trabajo en altura con ausencia de arnes o control critico requiere priorizar trabajo critico y proteccion personal.",
      ["trabajos_criticos", "epp", "seguridad_trabajadores", "documental_legal"],
      ["incumplimiento_control_critico"],
      25,
    );
  }

  if (tiene(["gasolina", "combustible"]) && tiene(["bidon", "no certificado", "sin rotulacion"])) {
    agregarRegla(
      "combustible en envase no certificado",
      "Combustible en contenedor no certificado combina sustancia peligrosa, potencial ambiental y emergencia.",
      ["sustancias_hds", "medio_ambiente", "equipos_emergencia", "documental_legal"],
      ["condicion_insegura"],
      23,
    );
  }

  if (tiene(["vaso", "vidrio"]) && tiene(["trizado", "quebrado", "fisurado"])) {
    agregarRegla(
      "elemento trizado disponible",
      "Elemento de uso comun con rotura debe tratarse como dano material con exposicion a corte, sin sobredocumentar.",
      ["dano_material", "seguridad_trabajadores"],
      ["condicion_insegura"],
      18,
    );
    sumarFamilia(puntajesFamilia, "trabajos_criticos", -10, "Vaso trizado no activa por si solo trabajo critico.");
    sumarFamilia(puntajesFamilia, "documental_legal", -8, "Vaso trizado se corrige principalmente con retiro o reposicion.");
  }

  if (tiene(["goma", "piso"]) && tiene(["despegada", "despegado", "suelta", "suelto"])) {
    agregarRegla(
      "superficie deteriorada en circulacion",
      "Goma o superficie desprendida se orienta a dano material, orden y riesgo de caida al mismo nivel.",
      ["dano_material", "orden_aseo_housekeeping", "seguridad_trabajadores"],
      ["condicion_insegura"],
      20,
    );
    sumarFamilia(puntajesFamilia, "trabajos_criticos", -10, "Superficie desprendida no requiere PTS o AST como control principal.");
    sumarFamilia(puntajesFamilia, "dano_material", 8, "La condicion fisica deteriorada corresponde a activo o infraestructura menor.");
  }

  if (tiene(["parabrisas", "bus"]) && tiene(["trizado", "fisurado", "quebrado"])) {
    agregarRegla(
      "vehiculo con vidrio trizado",
      "Parabrisas o vidrio de bus trizado afecta condicion operacional del transporte y exposicion de pasajeros.",
      ["vehiculos_transporte", "dano_material", "seguridad_trabajadores"],
      ["condicion_insegura"],
      24,
    );
    sumarFamilia(puntajesFamilia, "vehiculos_transporte", 10, "El objeto principal pertenece a transporte de personas.");
  }

  if (tiene(["conduccion", "camioneta", "vehiculo"]) && tiene(["imprudente", "temeraria", "exceso de velocidad"])) {
    agregarRegla(
      "conduccion imprudente",
      "La conducta de conduccion insegura se clasifica como transporte con desviacion conductual.",
      ["vehiculos_transporte", "seguridad_trabajadores"],
      ["conduccion_imprudente", "acto_inseguro"],
      24,
    );
  }

  if (tiene(["zona delimitada", "area restringida", "barrera"]) && tiene(["sin autorizacion", "no autorizado", "ingresa", "accede"])) {
    agregarRegla(
      "acceso no autorizado a zona controlada",
      "El texto describe ingreso o acceso a zona con control existente sin autorizacion.",
      ["senalizacion_segregacion", "seguridad_trabajadores"],
      ["acceso_zona_delimitada_sin_autorizacion", "acto_inseguro"],
      24,
    );
  }

  if (tiene(["carga suspendida", "carga izada"]) && tiene(["pasa", "bajo", "trabajador"])) {
    agregarRegla(
      "paso bajo carga suspendida",
      "Exposicion directa a linea de fuego en maniobra de izaje.",
      ["izaje_gruas_amarre", "seguridad_trabajadores", "trabajos_criticos"],
      ["paso_bajo_carga_suspendida", "exposicion_linea_fuego"],
      28,
    );
  }

  if (tiene(["sin bloqueo", "loto", "energia cero"]) && tiene(["intervenido", "intervenir", "mantencion", "equipo"])) {
    agregarRegla(
      "intervencion sin bloqueo",
      "Intervencion de equipo sin bloqueo de energia se clasifica como control critico ausente.",
      ["energia_loto_electrico", "trabajos_criticos", "seguridad_trabajadores"],
      ["incumplimiento_control_critico"],
      28,
    );
  }

  if (tiene(["herramienta", "taladro", "enchufe", "cable"]) && tiene(["danado", "dañado", "cinta aisladora", "huincha", "mal estado"])) {
    agregarRegla(
      "herramienta o componente defectuoso",
      "Herramienta o componente electrico con dano o reparacion informal requiere retiro y control de uso.",
      ["herramientas_equipos", "energia_loto_electrico", "mantencion_certificacion"],
      ["herramienta_equipo_mal_estado_usado_terreno", "condicion_insegura"],
      24,
    );
    if (tiene(["enchufe", "cable", "cinta aisladora", "huincha"])) {
      sumarFamilia(puntajesFamilia, "energia_loto_electrico", 12, "El dano se ubica en componente electrico de la herramienta.");
    }
  }

  if (tiene(["herramienta inadecuada", "equipo inadecuado", "uso inadecuado", "mala forma", "mal uso"])) {
    agregarRegla(
      "uso inadecuado o seleccion incorrecta",
      "La senal apunta al uso o seleccion de herramienta, no necesariamente a dano fisico del equipo.",
      ["herramientas_equipos", "seguridad_trabajadores"],
      ["herramienta_equipo_inadecuado_para_tarea", "uso_inadecuado_herramienta_equipo_maquinaria"],
      22,
    );
  }

  if (tiene(["tapa de alcantarillado", "tapa retirada", "no repuesta"])) {
    agregarRegla(
      "abertura o tapa no repuesta",
      "Tapa retirada o no repuesta en ruta genera condicion de entorno con necesidad de reposicion y segregacion.",
      ["orden_aseo_housekeeping", "dano_material", "seguridad_trabajadores", "senalizacion_segregacion"],
      ["condicion_insegura"],
      22,
    );
    sumarFamilia(puntajesFamilia, "orden_aseo_housekeeping", 10, "La tapa no repuesta genera una condicion de transito y orden del area.");
  }
}

function ordenarFamilias(puntajes: Map<FamiliaTaxonomiaPreventivaId, PuntuacionFamilia>): PuntuacionFamilia[] {
  return Array.from(puntajes.values())
    .filter((item) => item.puntaje > 0)
    .sort((a, b) => b.puntaje - a.puntaje || a.id.localeCompare(b.id));
}

function ordenarDesviaciones(puntajes: Map<DesviacionPreventivaId, PuntuacionDesviacion>): PuntuacionDesviacion[] {
  return Array.from(puntajes.values())
    .filter((item) => item.puntaje > 0)
    .sort((a, b) => b.puntaje - a.puntaje || a.id.localeCompare(b.id));
}

function valoresPorTipo(razones: RazonClasificacionPreventiva[], tipo: TipoSenal): string[] {
  return unico(razones.filter((razon) => razon.tipo === tipo).map((razon) => razon.valor));
}

function unico<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

function inferirConsecuencias(familiaPrimariaId: FamiliaTaxonomiaPreventivaId | null, consecuencias: string[]): string[] {
  if (consecuencias.length > 0) return consecuencias;
  if (!familiaPrimariaId) return [];
  const familiaItem = obtenerFamiliaPreventivaPorId(familiaPrimariaId);
  return familiaItem ? familiaItem.consecuenciasProbables.slice(0, 2) : [];
}

function inferirControles(familiaPrimariaId: FamiliaTaxonomiaPreventivaId | null, controles: string[]): string[] {
  if (controles.length > 0) return controles;
  if (!familiaPrimariaId) return [];
  const familiaItem = obtenerFamiliaPreventivaPorId(familiaPrimariaId);
  return familiaItem ? familiaItem.controlesEsperados.slice(0, 2) : [];
}

function calcularConfianza(familiasOrdenadas: PuntuacionFamilia[], razones: RazonClasificacionPreventiva[]): ConfianzaRouterPreventivo {
  const principal = familiasOrdenadas[0]?.puntaje || 0;
  const segunda = familiasOrdenadas[1]?.puntaje || 0;
  const tiposDetectados = new Set(razones.map((razon) => razon.tipo)).size;

  if (principal >= 34 && principal - segunda >= 6 && tiposDetectados >= 3) return "alta";
  if (principal >= 16 && tiposDetectados >= 2) return "media";
  return "baja";
}

function calcularSuficiencia(
  objeto: string[],
  condicion: string[],
  exposicion: string[],
  consecuencia: string[],
  control: string[],
): SuficienciaTecnicaPreventiva {
  const datosClave = [
    objeto.length > 0,
    condicion.length > 0,
    exposicion.length > 0,
    consecuencia.length > 0,
    control.length > 0,
  ];
  const presentes = datosClave.filter(Boolean).length;

  if (objeto.length > 0 && condicion.length > 0 && consecuencia.length > 0 && control.length > 0) {
    return "suficiente";
  }
  if (presentes >= 5) return "suficiente";
  if (objeto.length > 0 && condicion.length > 0 && presentes >= 3) return "parcial";
  if (presentes >= 3) return "parcial";
  return "insuficiente";
}

function preguntasPorFaltantes(
  objeto: string[],
  condicion: string[],
  exposicion: string[],
  consecuencia: string[],
  control: string[],
): string[] {
  const preguntas: string[] = [];
  if (objeto.length === 0 || condicion.length === 0) {
    preguntas.push("El hallazgo corresponde a una conducta observada, una condicion del entorno o ambas?");
  }
  if (exposicion.length === 0) preguntas.push("Quien o que esta expuesto al riesgo?");
  if (consecuencia.length === 0) preguntas.push("Que dano podria generar la condicion observada?");
  if (control.length === 0) preguntas.push("Existe algun control aplicado en terreno?");
  preguntas.push("Se requiere retiro, segregacion, bloqueo o detencion inmediata?");
  return preguntas;
}

function armarPreguntas(
  familiaPrimariaId: FamiliaTaxonomiaPreventivaId | null,
  desviacionesIds: DesviacionPreventivaId[],
  objeto: string[],
  condicion: string[],
  exposicion: string[],
  consecuencia: string[],
  control: string[],
): string[] {
  const preguntasFamilia = familiaPrimariaId
    ? obtenerFamiliaPreventivaPorId(familiaPrimariaId)?.preguntasAclaracionSugeridas || []
    : [];
  const preguntasDesviacion = desviacionesIds.flatMap(
    (desviacionId) => obtenerDesviacionPreventivaPorId(desviacionId)?.preguntasAclaracion || [],
  );
  return unico([...preguntasPorFaltantes(objeto, condicion, exposicion, consecuencia, control), ...preguntasFamilia, ...preguntasDesviacion]).slice(0, 7);
}

function ambitosDesdeFamilias(familiasIds: FamiliaTaxonomiaPreventivaId[]): AmbitoTaxonomiaPreventiva[] {
  return unico(
    familiasIds.flatMap((familiaId) => obtenerFamiliaPreventivaPorId(familiaId)?.ambitos || []),
  );
}

function erroresDesdeFamilias(familiasIds: FamiliaTaxonomiaPreventivaId[], texto: string): string[] {
  const errores = familiasIds.flatMap((familiaId) => obtenerFamiliaPreventivaPorId(familiaId)?.erroresEvitar || []);
  if (contieneTermino(texto, "extintor") && !["fuego", "humo", "amago", "incendio", "explosion"].some((termino) => contieneTermino(texto, termino))) {
    errores.push("No clasificar como emergencia real si no hay fuego, humo, amago, incendio, explosion o evacuacion.");
  }
  if (contieneTermino(texto, "vaso") || contieneTermino(texto, "goma")) {
    errores.push("No sobredocumentar condiciones simples corregibles por retiro, reposicion, reparacion o limpieza.");
  }
  return unico(errores).slice(0, 10);
}

export function clasificarPreventivamentePorAtributos(
  input: EntradaRouterPreventivo,
): ResultadoRouterPreventivo {
  const texto = construirTextoBusqueda(input);
  const razones = detectarSenales(texto);
  const puntajesFamilia = crearPuntajesFamilia();
  const puntajesDesviacion = crearPuntajesDesviacion();

  aplicarPuntajeTaxonomia(texto, puntajesFamilia);
  aplicarSenales(razones, puntajesFamilia, puntajesDesviacion);
  aplicarReglasDiferenciacion(texto, razones, puntajesFamilia, puntajesDesviacion);

  const familiasOrdenadas = ordenarFamilias(puntajesFamilia);
  const desviacionesOrdenadas = ordenarDesviaciones(puntajesDesviacion);
  const familiaPrimariaId = familiasOrdenadas[0]?.id || null;
  const familiasSecundariasIds = familiasOrdenadas
    .slice(1)
    .filter((familiaItem) => familiaItem.puntaje >= Math.max(5, (familiasOrdenadas[0]?.puntaje || 0) * 0.35))
    .map((familiaItem) => familiaItem.id)
    .slice(0, 5);
  const desviacionesIds = desviacionesOrdenadas.map((desviacionItem) => desviacionItem.id).slice(0, 5);

  const objetoDetectado = valoresPorTipo(razones, "objeto");
  const condicionDetectada = valoresPorTipo(razones, "condicion");
  const exposicionDetectada = valoresPorTipo(razones, "exposicion");
  const consecuenciaProbable = inferirConsecuencias(familiaPrimariaId, valoresPorTipo(razones, "consecuencia"));
  const controlFaltanteOFallido = inferirControles(familiaPrimariaId, valoresPorTipo(razones, "control"));
  const suficienciaTecnica = calcularSuficiencia(
    objetoDetectado,
    condicionDetectada,
    exposicionDetectada,
    consecuenciaProbable,
    controlFaltanteOFallido,
  );
  const confianzaClasificacion = calcularConfianza(familiasOrdenadas, razones);
  const familiasSalida = familiaPrimariaId ? [familiaPrimariaId, ...familiasSecundariasIds] : familiasSecundariasIds;
  const ambitos = ambitosDesdeFamilias(familiasSalida);

  return {
    familiaPrimariaId,
    familiasSecundariasIds,
    desviacionesIds,
    objetoDetectado,
    condicionDetectada,
    exposicionDetectada,
    consecuenciaProbable,
    controlFaltanteOFallido,
    ambitoPrincipal: ambitos[0] || "no_verificable",
    ambitosSecundarios: ambitos.slice(1),
    confianzaClasificacion,
    suficienciaTecnica,
    preguntasAclaracionSugeridas: armarPreguntas(
      familiaPrimariaId,
      desviacionesIds,
      objetoDetectado,
      condicionDetectada,
      exposicionDetectada,
      consecuenciaProbable,
      controlFaltanteOFallido,
    ),
    requiereRevisionTecnica: suficienciaTecnica === "insuficiente" || confianzaClasificacion === "baja",
    razonesClasificacion: razones,
    erroresEvitar: erroresDesdeFamilias(familiasSalida, texto),
  };
}

function cumpleErrorEvitado(casoItem: CasoPruebaRouterPreventivo, obtenido: ResultadoRouterPreventivo): boolean {
  const error = normalizarTextoPreventivo(casoItem.errorQueDebeEvitar);
  const familias = [obtenido.familiaPrimariaId, ...obtenido.familiasSecundariasIds].filter(Boolean);

  if (error.includes("emergencia real") || error.includes("fuego activo") || error.includes("incendio activo")) {
    return !familias.includes("emergencias_reales");
  }
  if (error.includes("sobredocumentar") || error.includes("pts") || error.includes("ast")) {
    return obtenido.familiaPrimariaId !== "documental_legal" && obtenido.familiaPrimariaId !== "trabajos_criticos";
  }
  if (error.includes("dano material simple") || error.includes("dano material estetico")) {
    return obtenido.familiaPrimariaId !== "dano_material";
  }
  if (error.includes("documento generico")) {
    return obtenido.familiaPrimariaId !== "documental_legal";
  }
  if (error.includes("falta de senalizacion")) {
    return obtenido.desviacionesIds.includes("acceso_zona_delimitada_sin_autorizacion");
  }
  if (error.includes("transito interno simple")) {
    return obtenido.familiaPrimariaId !== "orden_aseo_housekeeping";
  }
  if (error.includes("herramienta danada")) {
    return obtenido.desviacionesIds.includes("herramienta_equipo_inadecuado_para_tarea");
  }
  return obtenido.familiaPrimariaId === casoItem.familiaPrimariaEsperada;
}

export function evaluarCasosPruebaRouterPreventivo(): ResultadoCasoPruebaRouterPreventivo[] {
  return CASOS_PRUEBA_ROUTER_PREVENTIVO.map((casoItem) => {
    const obtenido = clasificarPreventivamentePorAtributos({ descripcion: casoItem.descripcion });
    const cumpleFamiliaPrimaria = obtenido.familiaPrimariaId === casoItem.familiaPrimariaEsperada;
    const cumpleFamiliaSecundariaMinima =
      casoItem.familiasSecundariasEsperadas.length === 0 ||
      casoItem.familiasSecundariasEsperadas.some((familiaId) => obtenido.familiasSecundariasIds.includes(familiaId));
    const cumpleDesviacionPrincipal =
      casoItem.desviacionesEsperadas.length === 0 ||
      casoItem.desviacionesEsperadas.some((desviacionId) => obtenido.desviacionesIds.includes(desviacionId));
    const cumpleSuficienciaTecnica = obtenido.suficienciaTecnica === casoItem.suficienciaTecnicaEsperada;
    const detectaErrorEvitado = cumpleErrorEvitado(casoItem, obtenido);
    const observaciones = [
      cumpleFamiliaPrimaria ? "" : `Familia primaria obtenida: ${obtenido.familiaPrimariaId || "sin clasificacion"}.`,
      cumpleFamiliaSecundariaMinima ? "" : `Familias secundarias obtenidas: ${obtenido.familiasSecundariasIds.join(", ") || "sin secundarias"}.`,
      cumpleDesviacionPrincipal ? "" : `Desviaciones obtenidas: ${obtenido.desviacionesIds.join(", ") || "sin desviaciones"}.`,
      cumpleSuficienciaTecnica ? "" : `Suficiencia obtenida: ${obtenido.suficienciaTecnica}.`,
      detectaErrorEvitado ? "" : `No se evito: ${casoItem.errorQueDebeEvitar}`,
    ].filter(Boolean);

    return {
      idCaso: casoItem.id,
      descripcion: casoItem.descripcion,
      esperado: {
        familiaPrimaria: casoItem.familiaPrimariaEsperada,
        familiasSecundarias: casoItem.familiasSecundariasEsperadas,
        desviaciones: casoItem.desviacionesEsperadas,
        suficienciaTecnica: casoItem.suficienciaTecnicaEsperada,
        errorQueDebeEvitar: casoItem.errorQueDebeEvitar,
      },
      obtenido,
      cumpleFamiliaPrimaria,
      cumpleFamiliaSecundariaMinima,
      cumpleDesviacionPrincipal,
      cumpleSuficienciaTecnica,
      detectaErrorEvitado,
      observaciones,
    };
  });
}
