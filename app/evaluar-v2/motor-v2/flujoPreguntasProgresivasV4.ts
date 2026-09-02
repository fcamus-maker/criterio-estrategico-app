import type {
  AmbitoEvaluacion,
  CategoriaHallazgoV2,
  ConfianzaClasificacionV2,
  Criticidad,
  ModuloPreguntasV2,
  NormativaAplicable,
  PreguntaSugeridaMotorV2,
  TipoEvento,
} from "./types";

export const VERSION_FLUJO_PROGRESIVO_V4 = "preguntas_progresivas_v4" as const;
export const TOTAL_PREGUNTAS_PROGRESIVAS_V4 = 5 as const;

export type DominioProgresivoV4 =
  | "seguridad_operacional"
  | "medio_ambiente"
  | "equipos_instalaciones"
  | "salud_ocupacional"
  | "emergencia"
  | "documental_cumplimiento";

export type IdPreguntaProgresivaV4 =
  | "v4_dominio"
  | "v4_riesgo"
  | "v4_exposicion"
  | "v4_control"
  | "v4_accion";

export type OpcionProgresivaV4 = {
  id: string;
  titulo: string;
  descripcion: string;
  llaveTecnica: string;
};

export type PreguntaProgresivaV4 = {
  id: IdPreguntaProgresivaV4;
  numero: number;
  total: typeof TOTAL_PREGUNTAS_PROGRESIVAS_V4;
  etapa: string;
  texto: string;
  apoyo: string;
  estadoAnalisis: string;
  multiple: boolean;
  maxSelecciones: number;
  opciones: OpcionProgresivaV4[];
};

export type RespuestaProgresivaV4 = {
  opcionIds: string[];
  respondidaEn: string;
};

export type FlujoPreguntasProgresivasV4 = {
  version: typeof VERSION_FLUJO_PROGRESIVO_V4;
  estado: "EN_PROGRESO" | "COMPLETO";
  pasoActual: number;
  totalPreguntas: typeof TOTAL_PREGUNTAS_PROGRESIVAS_V4;
  respuestas: Partial<Record<IdPreguntaProgresivaV4, RespuestaProgresivaV4>>;
  dominioId?: DominioProgresivoV4;
  riesgoId?: string;
  completadoEn?: string;
};

export type ReporteContextoProgresivoV4 = {
  area?: string;
  descripcion?: string;
  evaluacion?: {
    flujo_progresivo_v4?: FlujoPreguntasProgresivasV4;
  };
};

type DominioDefinicionV4 = {
  id: DominioProgresivoV4;
  titulo: string;
  descripcion: string;
  aliases: string[];
};

type ClaseExposicionV4 = "personas" | "ambiental" | "salud" | "documental" | "emergencia";

type RiesgoDefinicionV4 = {
  id: string;
  dominioId: DominioProgresivoV4;
  titulo: string;
  descripcion: string;
  aliases: string[];
  claseExposicion: ClaseExposicionV4;
  familia: string;
  ambito: AmbitoEvaluacion;
  categoria: CategoriaHallazgoV2;
  tipoEvento: TipoEvento;
  criticidadBase: Criticidad;
  topeCriticidad?: Criticidad;
  controlEsperado: string;
  accionInmediata: string;
  evidenciaCierre: string;
  normativa: string[];
  suspensionConControlDeficiente?: boolean;
  contencionAmbiental?: boolean;
};

export type ResultadoProgresivoV4 = {
  criticidadFinal: Criticidad;
  ambitoPrincipal: AmbitoEvaluacion;
  ambitosSecundarios: AmbitoEvaluacion[];
  tipoEvento: TipoEvento;
  criticidadBase: Criticidad;
  justificacionTecnica: string;
  resumenEjecutivo: string;
  medidaInmediata: string;
  plazoSugerido: string;
  requiereSuspension: boolean;
  requiereContencionAmbiental: boolean;
  normativaProbable: NormativaAplicable[];
  requiereRevisionManual: boolean;
  senalesCriticas: string[];
  factoresElevadores: string[];
  factoresLimitantes: string[];
  inconsistencias: string[];
  categoriaDetectada: CategoriaHallazgoV2;
  moduloPreguntasSugerido: ModuloPreguntasV2;
  preguntasSugeridas: PreguntaSugeridaMotorV2[];
  preguntasCriticasRespondidas: string[];
  preguntasFaltantesRecomendadas: PreguntaSugeridaMotorV2[];
  justificacionModuloPreguntas: string;
  confianzaClasificacion: ConfianzaClasificacionV2;
  palabrasClaveDetectadas: string[];
  fuenteEvaluacion: "motor_v2";
};

export type ValidacionCoherenciaProgresivaV4 = {
  ok: boolean;
  inconsistencias: string[];
  volverAPaso?: number;
};

const DOMINIOS: DominioDefinicionV4[] = [
  {
    id: "seguridad_operacional",
    titulo: "Seguridad de personas y operación",
    descripcion: "Caídas, tránsito, excavaciones, electricidad, izaje o tareas críticas.",
    aliases: ["pasillo", "caida", "altura", "excavacion", "electrico", "izaje", "vehiculo", "atrapamiento"],
  },
  {
    id: "medio_ambiente",
    titulo: "Medio ambiente",
    descripcion: "Derrames, residuos, emisiones, agua, suelo o afectación a terceros.",
    aliases: ["derrame", "aceite", "combustible", "residuo", "polvo", "emision", "agua", "suelo", "ambiental"],
  },
  {
    id: "equipos_instalaciones",
    titulo: "Equipos, herramientas o instalaciones",
    descripcion: "Daños, fallas, protecciones ausentes o elementos fuera de condición.",
    aliases: ["herramienta", "equipo", "maquina", "vidrio", "estructura", "instalacion", "resguardo", "epp"],
  },
  {
    id: "salud_ocupacional",
    titulo: "Salud ocupacional",
    descripcion: "Ruido, vibración, polvo, químicos, agentes biológicos o ergonomía.",
    aliases: ["ruido", "vibracion", "silice", "polvo", "quimico", "biologico", "ergonomia", "sobreesfuerzo"],
  },
  {
    id: "emergencia",
    titulo: "Emergencia e incendio",
    descripcion: "Incendio, evacuación, extintores, alarmas o respuesta de emergencia.",
    aliases: ["incendio", "fuego", "humo", "extintor", "evacuacion", "alarma", "emergencia"],
  },
  {
    id: "documental_cumplimiento",
    titulo: "Documentación y cumplimiento",
    descripcion: "Permisos, procedimientos, registros, capacitación o autorizaciones.",
    aliases: ["permiso", "procedimiento", "ast", "pts", "registro", "firma", "capacitacion", "documento"],
  },
];

const BASE_NORMATIVA = ["Ley 16.744", "DS 44", "DS 594"];

const RIESGOS: RiesgoDefinicionV4[] = [
  {
    id: "circulacion_obstruida",
    dominioId: "seguridad_operacional",
    titulo: "Ruta peatonal o pasillo obstruido",
    descripcion: "Materiales, objetos o residuos dificultan el tránsito seguro.",
    aliases: ["pasillo", "obstaculo", "obstruido", "circulacion", "transito peatonal", "materiales"],
    claseExposicion: "personas",
    familia: "orden_aseo_housekeeping",
    ambito: "seguridad_laboral",
    categoria: "transito_caida_mismo_nivel",
    tipoEvento: "condicion_subestandar",
    criticidadBase: "MEDIO",
    topeCriticidad: "ALTO",
    controlEsperado: "Ruta despejada, segregada y con ancho de circulación verificable.",
    accionInmediata: "Retirar o segregar los obstáculos y restablecer la ruta segura.",
    evidenciaCierre: "Fotografía de la ruta completamente despejada y verificación en terreno.",
    normativa: BASE_NORMATIVA,
  },
  {
    id: "caida_altura",
    dominioId: "seguridad_operacional",
    titulo: "Exposición a caída de altura",
    descripcion: "Trabajo en borde, plataforma, techumbre, andamio o desnivel.",
    aliases: ["altura", "arnes", "borde", "andamio", "techumbre", "linea de vida"],
    claseExposicion: "personas",
    familia: "trabajos_criticos",
    ambito: "seguridad_laboral",
    categoria: "caida_altura",
    tipoEvento: "condicion_subestandar",
    criticidadBase: "ALTO",
    controlEsperado: "Protección colectiva o sistema anticaídas completo, compatible y verificado.",
    accionInmediata: "Detener y aislar el trabajo hasta verificar la protección contra caídas.",
    evidenciaCierre: "Fotografía y verificación del sistema anticaídas o protección colectiva instalada.",
    normativa: BASE_NORMATIVA,
    suspensionConControlDeficiente: true,
  },
  {
    id: "excavacion_sin_control",
    dominioId: "seguridad_operacional",
    titulo: "Excavación o zanja sin control suficiente",
    descripcion: "Falta entibación, talud seguro, acceso o protección perimetral.",
    aliases: ["excavacion", "zanja", "entibacion", "talud", "derrumbe"],
    claseExposicion: "personas",
    familia: "excavaciones",
    ambito: "seguridad_laboral",
    categoria: "excavaciones",
    tipoEvento: "condicion_subestandar",
    criticidadBase: "ALTO",
    controlEsperado: "Estabilidad verificada, entibación o talud seguro, acceso y protección perimetral.",
    accionInmediata: "Detener el ingreso y aislar la excavación hasta verificar su estabilidad.",
    evidenciaCierre: "Registro fotográfico y verificación técnica de estabilidad, acceso y perímetro.",
    normativa: BASE_NORMATIVA,
    suspensionConControlDeficiente: true,
  },
  {
    id: "riesgo_electrico",
    dominioId: "seguridad_operacional",
    titulo: "Energía eléctrica o instalación expuesta",
    descripcion: "Partes energizadas, cables, tableros o bloqueo deficiente.",
    aliases: ["electrico", "cable", "tablero", "energizado", "enchufe", "loto"],
    claseExposicion: "personas",
    familia: "energia_peligrosa",
    ambito: "seguridad_laboral",
    categoria: "electrico",
    tipoEvento: "condicion_subestandar",
    criticidadBase: "ALTO",
    controlEsperado: "Desenergización, bloqueo, aislamiento y verificación de ausencia de energía.",
    accionInmediata: "Desenergizar, aislar y bloquear la fuente antes de intervenir.",
    evidenciaCierre: "Verificación de aislamiento, bloqueo y condición eléctrica segura.",
    normativa: BASE_NORMATIVA,
    suspensionConControlDeficiente: true,
  },
  {
    id: "izaje_carga",
    dominioId: "seguridad_operacional",
    titulo: "Izaje o carga suspendida",
    descripcion: "Carga, accesorios, maniobra o zona de exclusión con desviaciones.",
    aliases: ["izaje", "carga suspendida", "eslinga", "grillete", "grua", "rigger"],
    claseExposicion: "personas",
    familia: "izaje_cargas",
    ambito: "seguridad_laboral",
    categoria: "izaje_carga_suspendida",
    tipoEvento: "condicion_subestandar",
    criticidadBase: "ALTO",
    controlEsperado: "Plan de izaje, accesorios certificados, señalero y zona de exclusión efectiva.",
    accionInmediata: "Detener la maniobra y asegurar carga, accesorios y zona de exclusión.",
    evidenciaCierre: "Registro de accesorios, maniobra autorizada y segregación efectiva.",
    normativa: BASE_NORMATIVA,
    suspensionConControlDeficiente: true,
  },
  {
    id: "vehiculo_equipo_movil",
    dominioId: "seguridad_operacional",
    titulo: "Vehículo o equipo móvil en condición insegura",
    descripcion: "Tránsito, maniobra, segregación, alarma o condición mecánica deficiente.",
    aliases: ["vehiculo", "camion", "maquinaria movil", "atropello", "retroceso", "transito"],
    claseExposicion: "personas",
    familia: "transito_vehiculos",
    ambito: "seguridad_laboral",
    categoria: "maquinaria_equipos",
    tipoEvento: "condicion_subestandar",
    criticidadBase: "ALTO",
    controlEsperado: "Segregación peatón-equipo, señalización, alarma y condición mecánica verificadas.",
    accionInmediata: "Detener o restringir la operación hasta controlar tránsito y condición del equipo.",
    evidenciaCierre: "Verificación del equipo, segregación y controles de tránsito implementados.",
    normativa: BASE_NORMATIVA,
    suspensionConControlDeficiente: true,
  },
  {
    id: "espacio_confinado",
    dominioId: "seguridad_operacional",
    titulo: "Ingreso a espacio confinado",
    descripcion: "Atmósfera, permiso, rescate o control de ingreso insuficiente.",
    aliases: ["espacio confinado", "estanque", "camara", "atmosfera", "rescate"],
    claseExposicion: "personas",
    familia: "espacios_confinados",
    ambito: "seguridad_laboral",
    categoria: "espacios_confinados",
    tipoEvento: "condicion_subestandar",
    criticidadBase: "ALTO",
    controlEsperado: "Permiso, medición atmosférica, ventilación, vigilancia y rescate disponibles.",
    accionInmediata: "Impedir el ingreso hasta implementar y verificar todos los controles críticos.",
    evidenciaCierre: "Permiso y verificación en terreno de atmósfera, vigilancia y rescate.",
    normativa: BASE_NORMATIVA,
    suspensionConControlDeficiente: true,
  },
  {
    id: "derrame_hidrocarburo",
    dominioId: "medio_ambiente",
    titulo: "Derrame de aceite, combustible o hidrocarburo",
    descripcion: "Sustancia liberada con riesgo de propagación, caída o contaminación.",
    aliases: ["derrame", "aceite", "combustible", "petroleo", "hidrocarburo", "fuga"],
    claseExposicion: "ambiental",
    familia: "derrames_fugas",
    ambito: "medio_ambiente",
    categoria: "derrame_fuga",
    tipoEvento: "impacto_ambiental",
    criticidadBase: "ALTO",
    controlEsperado: "Fuente detenida, derrame contenido y drenajes, suelo y tránsito protegidos.",
    accionInmediata: "Detener la fuente, contener el derrame, proteger drenajes y retirar el material contaminado.",
    evidenciaCierre: "Fotografías de contención y limpieza, más registro de gestión del residuo generado.",
    normativa: [...BASE_NORMATIVA, "Ley 19.300"],
    contencionAmbiental: true,
  },
  {
    id: "residuo_sustancia",
    dominioId: "medio_ambiente",
    titulo: "Residuo o sustancia almacenada incorrectamente",
    descripcion: "Segregación, rotulación, contención o disposición deficiente.",
    aliases: ["residuo", "sustancia", "envase", "rotulacion", "almacenamiento", "peligroso"],
    claseExposicion: "ambiental",
    familia: "sustancias_residuos",
    ambito: "medio_ambiente",
    categoria: "residuos",
    tipoEvento: "aspecto_ambiental",
    criticidadBase: "MEDIO",
    topeCriticidad: "ALTO",
    controlEsperado: "Residuo identificado, segregado, contenido y dispuesto según su clasificación.",
    accionInmediata: "Segregar, identificar y trasladar el material a un almacenamiento autorizado.",
    evidenciaCierre: "Fotografía del almacenamiento corregido y registro de gestión o retiro.",
    normativa: [...BASE_NORMATIVA, "Ley 19.300"],
    contencionAmbiental: true,
  },
  {
    id: "emision_polvo_humo",
    dominioId: "medio_ambiente",
    titulo: "Polvo, humo o emisión no controlada",
    descripcion: "Emisión visible o potencial con afectación al entorno o terceros.",
    aliases: ["polvo", "humo", "emision", "material particulado", "gases"],
    claseExposicion: "ambiental",
    familia: "emisiones_ambientales",
    ambito: "medio_ambiente",
    categoria: "emisiones_polvo_humos",
    tipoEvento: "aspecto_ambiental",
    criticidadBase: "MEDIO",
    topeCriticidad: "ALTO",
    controlEsperado: "Supresión, captación, encapsulado o ventilación que controle la emisión.",
    accionInmediata: "Controlar la fuente de emisión y restringir la actividad mientras persista la dispersión.",
    evidenciaCierre: "Registro visual de la fuente controlada y verificación de ausencia de dispersión.",
    normativa: [...BASE_NORMATIVA, "Ley 19.300"],
  },
  {
    id: "afectacion_agua_suelo",
    dominioId: "medio_ambiente",
    titulo: "Afectación de agua, suelo o drenaje",
    descripcion: "Descarga, escorrentía o contaminación real o potencial.",
    aliases: ["agua", "suelo", "drenaje", "alcantarillado", "escorrentia", "descarga"],
    claseExposicion: "ambiental",
    familia: "impacto_ambiental",
    ambito: "medio_ambiente",
    categoria: "impactos_ambientales_reales",
    tipoEvento: "impacto_ambiental",
    criticidadBase: "ALTO",
    controlEsperado: "Contención inmediata, bloqueo de la vía de propagación y evaluación del área afectada.",
    accionInmediata: "Detener la descarga, contener la propagación y notificar para evaluar el impacto.",
    evidenciaCierre: "Registro del área contenida, recuperación ejecutada y validación ambiental.",
    normativa: [...BASE_NORMATIVA, "Ley 19.300"],
    contencionAmbiental: true,
  },
  {
    id: "herramienta_defectuosa",
    dominioId: "equipos_instalaciones",
    titulo: "Herramienta o equipo defectuoso",
    descripcion: "Daño, desgaste, protección o funcionamiento fuera de condición.",
    aliases: ["herramienta", "equipo defectuoso", "roto", "quebrado", "desgaste", "mantencion"],
    claseExposicion: "personas",
    familia: "equipos_herramientas",
    ambito: "seguridad_laboral",
    categoria: "herramientas_equipos",
    tipoEvento: "condicion_subestandar",
    criticidadBase: "MEDIO",
    topeCriticidad: "ALTO",
    controlEsperado: "Equipo retirado, bloqueado o reparado y verificado antes de reutilizar.",
    accionInmediata: "Retirar de servicio, identificar y reparar o reemplazar el equipo.",
    evidenciaCierre: "Fotografía del equipo reparado o registro de retiro y reposición.",
    normativa: BASE_NORMATIVA,
  },
  {
    id: "maquinaria_sin_resguardo",
    dominioId: "equipos_instalaciones",
    titulo: "Maquinaria sin resguardo o protección",
    descripcion: "Partes móviles, puntos de atrapamiento o protecciones anuladas.",
    aliases: ["maquina", "resguardo", "parte movil", "atrapamiento", "proteccion"],
    claseExposicion: "personas",
    familia: "maquinaria_resguardos",
    ambito: "seguridad_laboral",
    categoria: "maquinaria_equipos",
    tipoEvento: "condicion_subestandar",
    criticidadBase: "ALTO",
    controlEsperado: "Resguardo físico e interbloqueo instalados y operativos.",
    accionInmediata: "Detener y bloquear la maquinaria hasta reponer el resguardo.",
    evidenciaCierre: "Verificación funcional del resguardo e interbloqueo antes de operar.",
    normativa: BASE_NORMATIVA,
    suspensionConControlDeficiente: true,
  },
  {
    id: "infraestructura_danada",
    dominioId: "equipos_instalaciones",
    titulo: "Infraestructura o elemento dañado",
    descripcion: "Vidrio, baranda, piso, estructura, mobiliario o protección deteriorada.",
    aliases: ["vidrio", "cristal", "baranda", "piso", "estructura", "mobiliario", "danado"],
    claseExposicion: "personas",
    familia: "dano_material",
    ambito: "seguridad_laboral",
    categoria: "condiciones_subestandar",
    tipoEvento: "condicion_subestandar",
    criticidadBase: "MEDIO",
    topeCriticidad: "ALTO",
    controlEsperado: "Área aislada y elemento reparado, repuesto o retirado.",
    accionInmediata: "Aislar el área y reparar, reponer o retirar el elemento dañado.",
    evidenciaCierre: "Fotografía de la reparación o reposición y verificación del área segura.",
    normativa: BASE_NORMATIVA,
  },
  {
    id: "epp_inadecuado",
    dominioId: "equipos_instalaciones",
    titulo: "Elemento de protección personal inadecuado",
    descripcion: "EPP ausente, deteriorado, incompatible o utilizado incorrectamente.",
    aliases: ["epp", "casco", "guante", "proteccion ocular", "respirador", "arnes"],
    claseExposicion: "personas",
    familia: "elementos_proteccion_personal",
    ambito: "seguridad_laboral",
    categoria: "elementos_proteccion_personal",
    tipoEvento: "condicion_subestandar",
    criticidadBase: "MEDIO",
    topeCriticidad: "ALTO",
    controlEsperado: "EPP compatible con el riesgo, en buen estado y correctamente utilizado.",
    accionInmediata: "Detener la exposición y entregar o reemplazar el EPP requerido.",
    evidenciaCierre: "Verificación del EPP correcto, estado y uso efectivo en terreno.",
    normativa: BASE_NORMATIVA,
  },
  {
    id: "ruido_vibracion_ocupacional",
    dominioId: "salud_ocupacional",
    titulo: "Exposición ocupacional a ruido o vibración",
    descripcion: "Fuente, tiempo de exposición o controles insuficientes.",
    aliases: ["ruido", "vibracion", "auditivo", "hipoacusia"],
    claseExposicion: "salud",
    familia: "higiene_ocupacional",
    ambito: "salud_ocupacional",
    categoria: "ruido_agentes_fisicos",
    tipoEvento: "condicion_subestandar",
    criticidadBase: "MEDIO",
    topeCriticidad: "ALTO",
    controlEsperado: "Fuente controlada, exposición gestionada y protección auditiva verificada.",
    accionInmediata: "Controlar la fuente, limitar la exposición y verificar la protección requerida.",
    evidenciaCierre: "Registro de control de fuente, exposición y protección aplicada.",
    normativa: BASE_NORMATIVA,
  },
  {
    id: "polvo_quimico_ocupacional",
    dominioId: "salud_ocupacional",
    titulo: "Exposición a polvo, humo o agente químico",
    descripcion: "Inhalación, contacto o ventilación insuficiente durante la tarea.",
    aliases: ["polvo", "silice", "quimico", "solvente", "humo", "vapores"],
    claseExposicion: "salud",
    familia: "higiene_ocupacional",
    ambito: "salud_ocupacional",
    categoria: "salud_ocupacional_ruido_polvo_quimicos",
    tipoEvento: "condicion_subestandar",
    criticidadBase: "ALTO",
    controlEsperado: "Sustitución, extracción o ventilación y protección respiratoria verificadas.",
    accionInmediata: "Detener o limitar la exposición hasta controlar la fuente y proteger a las personas.",
    evidenciaCierre: "Verificación de ventilación, control de fuente y protección respiratoria.",
    normativa: BASE_NORMATIVA,
  },
  {
    id: "ergonomia_sobreesfuerzo",
    dominioId: "salud_ocupacional",
    titulo: "Sobreesfuerzo o condición ergonómica",
    descripcion: "Manipulación, postura, repetición o diseño del puesto inadecuado.",
    aliases: ["ergonomia", "sobreesfuerzo", "carga manual", "postura", "repetitivo"],
    claseExposicion: "salud",
    familia: "ergonomia",
    ambito: "salud_ocupacional",
    categoria: "condiciones_subestandar",
    tipoEvento: "condicion_subestandar",
    criticidadBase: "MEDIO",
    topeCriticidad: "ALTO",
    controlEsperado: "Tarea rediseñada, apoyo mecánico o método de manipulación seguro.",
    accionInmediata: "Ajustar la tarea y aplicar apoyo o método que reduzca el sobreesfuerzo.",
    evidenciaCierre: "Registro del método corregido y verificación de la condición ergonómica.",
    normativa: BASE_NORMATIVA,
  },
  {
    id: "incendio_humo",
    dominioId: "emergencia",
    titulo: "Incendio, humo o principio de fuego",
    descripcion: "Evento real o condición con activación de respuesta inmediata.",
    aliases: ["incendio", "fuego", "humo", "chispa", "combustion"],
    claseExposicion: "emergencia",
    familia: "emergencia_incendio",
    ambito: "emergencia",
    categoria: "incendio_emergencia",
    tipoEvento: "emergencia",
    criticidadBase: "CRITICO",
    controlEsperado: "Alarma, evacuación, aislamiento de energía y respuesta de emergencia activadas.",
    accionInmediata: "Activar la emergencia, evacuar y controlar solo con personal y medios autorizados.",
    evidenciaCierre: "Registro de respuesta, control del evento e inspección antes de reanudar.",
    normativa: BASE_NORMATIVA,
    suspensionConControlDeficiente: true,
  },
  {
    id: "equipo_emergencia_deficiente",
    dominioId: "emergencia",
    titulo: "Equipo o vía de emergencia deficiente",
    descripcion: "Extintor, alarma, señal, salida o acceso fuera de condición.",
    aliases: ["extintor", "alarma", "salida", "evacuacion", "emergencia", "gabinete"],
    claseExposicion: "emergencia",
    familia: "equipos_emergencia",
    ambito: "emergencia",
    categoria: "evacuacion",
    tipoEvento: "condicion_subestandar",
    criticidadBase: "ALTO",
    controlEsperado: "Equipo operativo, vigente, accesible y vía de evacuación completamente disponible.",
    accionInmediata: "Restituir de inmediato el equipo o vía de emergencia y establecer respaldo temporal.",
    evidenciaCierre: "Fotografía, vigencia y prueba funcional del medio de emergencia corregido.",
    normativa: BASE_NORMATIVA,
  },
  {
    id: "permiso_autorizacion",
    dominioId: "documental_cumplimiento",
    titulo: "Permiso o autorización faltante",
    descripcion: "La actividad requiere un respaldo habilitante no disponible o vencido.",
    aliases: ["permiso", "autorizacion", "vencido", "licencia", "habilitacion"],
    claseExposicion: "documental",
    familia: "documental_legal",
    ambito: "legal_documental",
    categoria: "procedimientos_ast_permisos",
    tipoEvento: "desviacion_legal_documental",
    criticidadBase: "MEDIO",
    controlEsperado: "Permiso vigente, autorizado y coherente con la actividad real.",
    accionInmediata: "No iniciar o detener la actividad hasta regularizar la autorización.",
    evidenciaCierre: "Permiso vigente, aprobado y asociado a la tarea verificada.",
    normativa: ["Ley 16.744", "DS 44"],
  },
  {
    id: "procedimiento_registro",
    dominioId: "documental_cumplimiento",
    titulo: "Procedimiento, AST/ART o registro incompleto",
    descripcion: "Documento inexistente, desactualizado, sin firma o no aplicable a la tarea.",
    aliases: ["procedimiento", "ast", "art", "pts", "registro", "firma", "checklist"],
    claseExposicion: "documental",
    familia: "documental_legal",
    ambito: "legal_documental",
    categoria: "documentos_legales_preventivos",
    tipoEvento: "desviacion_legal_documental",
    criticidadBase: "MEDIO",
    controlEsperado: "Documento vigente, específico, revisado y con trazabilidad de aplicación.",
    accionInmediata: "Regularizar el documento y verificar su aplicación antes de continuar si habilita una tarea riesgosa.",
    evidenciaCierre: "Documento corregido, aprobado y registro de aplicación o difusión.",
    normativa: ["Ley 16.744", "DS 44"],
  },
  {
    id: "capacitacion_competencia",
    dominioId: "documental_cumplimiento",
    titulo: "Capacitación o competencia no acreditada",
    descripcion: "Falta inducción, entrenamiento, certificación o respaldo de competencia.",
    aliases: ["capacitacion", "induccion", "competencia", "certificacion", "curso"],
    claseExposicion: "documental",
    familia: "capacitacion_difusion",
    ambito: "legal_documental",
    categoria: "induccion_capacitacion_autorizacion",
    tipoEvento: "desviacion_legal_documental",
    criticidadBase: "MEDIO",
    controlEsperado: "Competencia, capacitación y autorización verificables para la función.",
    accionInmediata: "Restringir la tarea y completar la capacitación o acreditación requerida.",
    evidenciaCierre: "Registro de capacitación, evaluación y autorización correspondiente.",
    normativa: ["Ley 16.744", "DS 44"],
  },
];

const normalizar = (valor: unknown) =>
  String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const puntajeTexto = (texto: string, aliases: string[]) =>
  aliases.reduce((total, alias) => total + (texto.includes(normalizar(alias)) ? 1 : 0), 0);

const ordenarPorContexto = <T extends { aliases: string[] }>(items: T[], texto: string) =>
  items
    .map((item, indice) => ({ item, indice, puntaje: puntajeTexto(texto, item.aliases) }))
    .sort((a, b) => b.puntaje - a.puntaje || a.indice - b.indice)
    .map(({ item }) => item);

const opcion = (id: string, titulo: string, descripcion: string): OpcionProgresivaV4 => ({
  id,
  titulo,
  descripcion,
  llaveTecnica: id,
});

const respuestaIds = (flujo: FlujoPreguntasProgresivasV4, id: IdPreguntaProgresivaV4) =>
  flujo.respuestas[id]?.opcionIds || [];

const riesgoSeleccionado = (flujo: FlujoPreguntasProgresivasV4) =>
  RIESGOS.find((riesgo) => riesgo.id === flujo.riesgoId);

export const crearFlujoPreguntasProgresivasV4 = (): FlujoPreguntasProgresivasV4 => ({
  version: VERSION_FLUJO_PROGRESIVO_V4,
  estado: "EN_PROGRESO",
  pasoActual: 1,
  totalPreguntas: TOTAL_PREGUNTAS_PROGRESIVAS_V4,
  respuestas: {},
});

const opcionesExposicion = (riesgo: RiesgoDefinicionV4): OpcionProgresivaV4[] => {
  if (riesgo.claseExposicion === "ambiental") {
    return [
      opcion(
        "afectacion_real_suelo_agua_drenaje",
        "Ya alcanzó suelo, agua o drenaje",
        "Se observa propagación o contaminación efectiva fuera del punto inicial.",
      ),
      opcion(
        "riesgo_potencial_suelo_agua_drenaje",
        "Podría alcanzar suelo, agua o drenaje, pero aún está contenido",
        "Existe una vía potencial de propagación, sin afectación efectiva confirmada.",
      ),
      opcion("afecta_personas_transito", "Expone personas, tránsito o áreas de trabajo", "La condición genera contacto, caída, incendio o interferencia operacional."),
      opcion("contenido_area_limitada", "Permanece contenido en un área limitada", "No se observa salida del punto afectado, pero requiere control."),
      opcion("sin_exposicion_visible", "No se observa exposición o propagación", "La desviación existe, aunque no muestra afectación actual."),
      opcion("no_verificable", "No es posible verificarlo", "Se requieren antecedentes o inspección adicional."),
    ];
  }

  if (riesgo.claseExposicion === "documental") {
    return [
      opcion("habilita_tarea_riesgosa", "La brecha habilita o acompaña una tarea riesgosa", "La actividad se realiza o pretende realizarse sin respaldo suficiente."),
      opcion("afecta_trazabilidad", "Afecta trazabilidad, control o demostración de cumplimiento", "No hay exposición crítica confirmada, pero el respaldo es insuficiente."),
      opcion("solo_formal_sin_exposicion", "Es una desviación formal sin exposición actual", "La corrección puede gestionarse sin detener una tarea segura."),
      opcion("no_verificable", "No es posible determinarlo", "Falta conocer la actividad o el alcance del documento."),
    ];
  }

  if (riesgo.claseExposicion === "emergencia") {
    return [
      opcion("evento_activo_personas", "Existe evento activo o personas potencialmente afectadas", "La respuesta de emergencia debe activarse inmediatamente."),
      opcion("respuesta_emergencia_debil", "La capacidad de respuesta está reducida", "Equipo, salida, alarma o acceso no aseguran respuesta efectiva."),
      opcion("condicion_preventiva_sin_evento", "Es una condición preventiva, sin emergencia activa", "Debe corregirse antes de que sea requerida."),
      opcion("no_verificable", "No es posible verificarlo", "Se requiere inspección funcional o información adicional."),
    ];
  }

  if (riesgo.claseExposicion === "salud") {
    return [
      opcion("exposicion_directa_personas", "Hay personas expuestas durante la tarea", "La fuente actúa directamente sobre uno o más trabajadores."),
      opcion("exposicion_potencial", "La exposición es potencial o intermitente", "Puede ocurrir según duración, cercanía o condición operacional."),
      opcion("sin_personas_expuestas", "No hay personas expuestas actualmente", "La fuente existe, pero el área está sin ocupación."),
      opcion("no_verificable", "No se puede determinar la exposición", "Faltan mediciones, tiempo de exposición o antecedentes."),
    ];
  }

  return [
    opcion("exposicion_directa_personas", "Hay personas expuestas directamente", "La condición puede afectar ahora a trabajadores o terceros."),
    opcion("consecuencia_grave_posible", "Puede producir una consecuencia grave o fatal", "La energía, altura, carga o condición permite un daño severo."),
    opcion("dano_equipo_operacion", "Puede dañar equipos o interrumpir la operación", "La consecuencia principal es material u operacional."),
    opcion("sin_personas_expuestas", "No hay personas expuestas actualmente", "La condición permanece aislada o fuera de servicio."),
    opcion("no_verificable", "No es posible verificarlo", "Se requiere inspección o información adicional."),
  ];
};

const opcionesControl = (riesgo: RiesgoDefinicionV4): OpcionProgresivaV4[] => [
  opcion("control_efectivo", "Control implementado y efectivo", riesgo.controlEsperado),
  opcion("control_parcial", "Control parcial o temporal", "Reduce parte del riesgo, pero aún requiere completar la corrección."),
  opcion("sin_control", "Sin control efectivo", "La condición permanece expuesta o sin una barrera verificable."),
  opcion("control_no_verificable", "Control no verificable", "No existe evidencia suficiente para confirmar su eficacia."),
];

const opcionesAccion = (
  riesgo: RiesgoDefinicionV4,
  control?: string,
): OpcionProgresivaV4[] => {
  if (control === "control_efectivo") {
    return [
      opcion(
        "accion_especifica_aplicada",
        "Control definitivo aplicado y verificado",
        riesgo.accionInmediata,
      ),
      opcion(
        "accion_cierre_pendiente",
        "El control es efectivo; falta registrar la evidencia de cierre",
        `La condición está controlada y debe respaldarse mediante: ${riesgo.evidenciaCierre}`,
      ),
    ];
  }

  if (control === "control_parcial") {
    return [
      opcion(
        "control_temporal",
        "Se mantiene un control temporal y se solicitó la corrección definitiva",
        "La condición está contenida parcialmente, pero el cierre definitivo sigue pendiente.",
      ),
      opcion(
        "accion_pendiente",
        "La corrección definitiva todavía no se ejecuta",
        `Debe gestionarse la medida pendiente: ${riesgo.accionInmediata}`,
      ),
      opcion(
        "accion_no_verificable",
        "No es posible verificar la medida aplicada",
        "El informe debe quedar sujeto a revisión antes del cierre.",
      ),
    ];
  }

  if (control === "sin_control") {
    return [
      opcion(
        "actividad_detenida",
        "Se detuvo o aisló la actividad mientras se implementa el control",
        `No reanudar hasta ejecutar y verificar: ${riesgo.accionInmediata}`,
      ),
      opcion(
        "accion_pendiente",
        "La medida requerida todavía no se aplica",
        `Debe gestionarse de inmediato: ${riesgo.accionInmediata}`,
      ),
      opcion(
        "accion_no_verificable",
        "No es posible verificar una medida aplicada",
        "Se requiere revisión en terreno antes de continuar.",
      ),
    ];
  }

  return [
    opcion(
      "verificacion_solicitada",
      "Se solicitó verificar el control antes de continuar",
      `La comprobación debe considerar: ${riesgo.controlEsperado}`,
    ),
    opcion(
      "accion_pendiente",
      "La medida requerida todavía no se confirma",
      `Debe verificarse la aplicación de: ${riesgo.accionInmediata}`,
    ),
    opcion(
      "accion_no_verificable",
      "No es posible verificar la medida aplicada",
      "El informe debe quedar sujeto a revisión antes del cierre.",
    ),
  ];
};

export function construirPreguntaProgresivaV4(
  reporte: ReporteContextoProgresivoV4,
  flujo: FlujoPreguntasProgresivasV4,
): PreguntaProgresivaV4 {
  const textoContexto = normalizar(`${reporte.area || ""} ${reporte.descripcion || ""}`);
  const numero = Math.min(Math.max(flujo.pasoActual, 1), TOTAL_PREGUNTAS_PROGRESIVAS_V4);
  const dominioId = flujo.dominioId || (respuestaIds(flujo, "v4_dominio")[0] as DominioProgresivoV4 | undefined);
  const riesgo = riesgoSeleccionado(flujo);

  if (numero === 1) {
    return {
      id: "v4_dominio",
      numero,
      total: TOTAL_PREGUNTAS_PROGRESIVAS_V4,
      etapa: "Orientación inicial",
      texto: "¿Qué ámbito representa mejor la condición observada?",
      apoyo: "Las alternativas se ordenan según el reporte, pero tu selección define la ruta técnica exacta.",
      estadoAnalisis: "Comprendiendo el contexto del hallazgo",
      multiple: false,
      maxSelecciones: 1,
      opciones: ordenarPorContexto(DOMINIOS, textoContexto).map((dominio) =>
        opcion(dominio.id, dominio.titulo, dominio.descripcion),
      ),
    };
  }

  if (numero === 2) {
    const riesgosDominio = RIESGOS.filter((item) => item.dominioId === dominioId);
    return {
      id: "v4_riesgo",
      numero,
      total: TOTAL_PREGUNTAS_PROGRESIVAS_V4,
      etapa: "Identificación específica",
      texto: "¿Cuál de estas condiciones coincide exactamente con lo observado?",
      apoyo: "Esta elección abre exclusivamente el módulo preventivo correspondiente.",
      estadoAnalisis: "Acotando la familia preventiva",
      multiple: false,
      maxSelecciones: 1,
      opciones: ordenarPorContexto(riesgosDominio, textoContexto).map((item) =>
        opcion(item.id, item.titulo, item.descripcion),
      ),
    };
  }

  if (!riesgo) {
    return construirPreguntaProgresivaV4(reporte, { ...flujo, pasoActual: 1 });
  }

  if (numero === 3) {
    return {
      id: "v4_exposicion",
      numero,
      total: TOTAL_PREGUNTAS_PROGRESIVAS_V4,
      etapa: `Análisis de ${riesgo.titulo.toLowerCase()}`,
      texto: `Al detectar “${riesgo.titulo}”, ¿qué exposición o consecuencia existía?`,
      apoyo: "Responde según la condición observada inicialmente. Puedes marcar hasta dos alternativas.",
      estadoAnalisis: "Relacionando exposición y consecuencia",
      multiple: true,
      maxSelecciones: 2,
      opciones: opcionesExposicion(riesgo),
    };
  }

  if (numero === 4) {
    return {
      id: "v4_control",
      numero,
      total: TOTAL_PREGUNTAS_PROGRESIVAS_V4,
      etapa: "Verificación del control",
      texto: `Después de detectar el hallazgo, ¿cuál es el estado actual del control para “${riesgo.titulo}”?`,
      apoyo: `Control esperado: ${riesgo.controlEsperado}`,
      estadoAnalisis: "Contrastando el control crítico esperado",
      multiple: false,
      maxSelecciones: 1,
      opciones: opcionesControl(riesgo),
    };
  }

  return {
    id: "v4_accion",
    numero,
    total: TOTAL_PREGUNTAS_PROGRESIVAS_V4,
    etapa: "Decisión y cierre",
    texto: `Según el estado actual del control, ¿qué medida quedó aplicada para “${riesgo.titulo}”?`,
    apoyo: `El cierre deberá acreditarse mediante: ${riesgo.evidenciaCierre}`,
    estadoAnalisis: "Construyendo la decisión preventiva final",
    multiple: false,
    maxSelecciones: 1,
    opciones: opcionesAccion(riesgo, respuestaIds(flujo, "v4_control")[0]),
  };
}

const ORDEN_PREGUNTAS: IdPreguntaProgresivaV4[] = [
  "v4_dominio",
  "v4_riesgo",
  "v4_exposicion",
  "v4_control",
  "v4_accion",
];

export function responderPreguntaProgresivaV4(
  flujo: FlujoPreguntasProgresivasV4,
  pregunta: PreguntaProgresivaV4,
  opcionId: string,
): FlujoPreguntasProgresivasV4 {
  const actuales = respuestaIds(flujo, pregunta.id);
  let seleccionadas: string[];

  if (pregunta.multiple) {
    const exclusivas = new Set(["no_verificable", "sin_personas_expuestas", "sin_exposicion_visible"]);
    const estadosPropagacionAmbiental = new Set([
      "afectacion_real_suelo_agua_drenaje",
      "riesgo_potencial_suelo_agua_drenaje",
      "contenido_area_limitada",
      "sin_exposicion_visible",
    ]);
    if (actuales.includes(opcionId)) {
      seleccionadas = actuales.filter((id) => id !== opcionId);
    } else if (exclusivas.has(opcionId)) {
      seleccionadas = [opcionId];
    } else if (estadosPropagacionAmbiental.has(opcionId)) {
      seleccionadas = [
        ...actuales.filter(
          (id) => !estadosPropagacionAmbiental.has(id) && !exclusivas.has(id),
        ),
        opcionId,
      ].slice(-pregunta.maxSelecciones);
    } else {
      seleccionadas = [...actuales.filter((id) => !exclusivas.has(id)), opcionId].slice(
        -pregunta.maxSelecciones,
      );
    }
  } else {
    seleccionadas = [opcionId];
  }

  const respuestas = { ...flujo.respuestas };
  if (seleccionadas.length === 0) {
    delete respuestas[pregunta.id];
  } else {
    respuestas[pregunta.id] = {
      opcionIds: seleccionadas,
      respondidaEn: new Date().toISOString(),
    };
  }

  const indicePregunta = ORDEN_PREGUNTAS.indexOf(pregunta.id);
  ORDEN_PREGUNTAS.slice(indicePregunta + 1).forEach((id) => delete respuestas[id]);

  const dominioId = (respuestas.v4_dominio?.opcionIds[0] || undefined) as
    | DominioProgresivoV4
    | undefined;
  const riesgoId = respuestas.v4_riesgo?.opcionIds[0];

  return {
    ...flujo,
    estado: "EN_PROGRESO",
    respuestas,
    dominioId,
    riesgoId,
    completadoEn: undefined,
  };
}

export function avanzarFlujoProgresivoV4(
  flujo: FlujoPreguntasProgresivasV4,
): FlujoPreguntasProgresivasV4 {
  const idActual = ORDEN_PREGUNTAS[flujo.pasoActual - 1];
  if (!idActual || respuestaIds(flujo, idActual).length === 0) return flujo;
  const siguiente = Math.min(flujo.pasoActual + 1, TOTAL_PREGUNTAS_PROGRESIVAS_V4);
  const completo = flujo.pasoActual === TOTAL_PREGUNTAS_PROGRESIVAS_V4;
  return {
    ...flujo,
    pasoActual: siguiente,
    estado: completo ? "COMPLETO" : "EN_PROGRESO",
    completadoEn: completo ? new Date().toISOString() : undefined,
  };
}

export function retrocederFlujoProgresivoV4(
  flujo: FlujoPreguntasProgresivasV4,
): FlujoPreguntasProgresivasV4 {
  return {
    ...flujo,
    estado: "EN_PROGRESO",
    pasoActual: Math.max(1, flujo.pasoActual - 1),
    completadoEn: undefined,
  };
}

const ACCIONES_COMPATIBLES_POR_CONTROL: Record<string, Set<string>> = {
  control_efectivo: new Set(["accion_especifica_aplicada", "accion_cierre_pendiente"]),
  control_parcial: new Set(["control_temporal", "accion_pendiente", "accion_no_verificable"]),
  sin_control: new Set(["actividad_detenida", "accion_pendiente", "accion_no_verificable"]),
  control_no_verificable: new Set([
    "verificacion_solicitada",
    "accion_pendiente",
    "accion_no_verificable",
  ]),
};

export function validarCoherenciaFlujoProgresivoV4(
  flujo?: FlujoPreguntasProgresivasV4,
): ValidacionCoherenciaProgresivaV4 {
  if (!flujo) {
    return {
      ok: false,
      inconsistencias: ["No existe una evaluación progresiva para validar."],
      volverAPaso: 1,
    };
  }

  const control = respuestaIds(flujo, "v4_control")[0];
  const accion = respuestaIds(flujo, "v4_accion")[0];
  if (!control || !accion) return { ok: true, inconsistencias: [] };

  const accionesCompatibles = ACCIONES_COMPATIBLES_POR_CONTROL[control];
  if (!accionesCompatibles?.has(accion)) {
    return {
      ok: false,
      inconsistencias: [
        "El estado del control y la medida final seleccionada no son compatibles.",
      ],
      volverAPaso: 4,
    };
  }

  return { ok: true, inconsistencias: [] };
}

const flujoProgresivoEstructuralmenteCompletoV4 = (flujo?: FlujoPreguntasProgresivasV4) =>
  flujo?.version === VERSION_FLUJO_PROGRESIVO_V4 &&
  flujo.estado === "COMPLETO" &&
  ORDEN_PREGUNTAS.every((id) => (flujo.respuestas[id]?.opcionIds.length || 0) > 0) &&
  Boolean(flujo.dominioId && flujo.riesgoId);

export const flujoProgresivoCompletoV4 = (flujo?: FlujoPreguntasProgresivasV4) =>
  flujoProgresivoEstructuralmenteCompletoV4(flujo) &&
  validarCoherenciaFlujoProgresivoV4(flujo).ok;

export function reabrirControlInconsistenteV4(
  flujo: FlujoPreguntasProgresivasV4,
): FlujoPreguntasProgresivasV4 {
  const respuestas = { ...flujo.respuestas };
  delete respuestas.v4_control;
  delete respuestas.v4_accion;
  return {
    ...flujo,
    estado: "EN_PROGRESO",
    pasoActual: 4,
    respuestas,
    completadoEn: undefined,
  };
}

const NIVEL: Record<Criticidad, number> = { BAJO: 0, MEDIO: 1, ALTO: 2, CRITICO: 3 };
const CRITICIDAD_POR_NIVEL: Criticidad[] = ["BAJO", "MEDIO", "ALTO", "CRITICO"];

const normativaDesde = (items: string[], riesgo: RiesgoDefinicionV4): NormativaAplicable[] =>
  items.map((norma) => ({
    norma,
    materia: `Marco preventivo probable asociado a ${riesgo.titulo.toLowerCase()}`,
    fuente: "Matriz preventiva CE",
    nivelConfianza: "pendiente_validacion",
    requiereValidacionLegal: true,
    aplicaCuando: "Debe confirmarse según actividad, empresa, instalación y alcance real del hallazgo.",
  }));

export function evaluarFlujoProgresivoV4(
  flujo?: FlujoPreguntasProgresivasV4,
): ResultadoProgresivoV4 | null {
  if (!flujoProgresivoCompletoV4(flujo) || !flujo) return null;
  const riesgo = riesgoSeleccionado(flujo);
  if (!riesgo) return null;

  const exposiciones = respuestaIds(flujo, "v4_exposicion");
  const control = respuestaIds(flujo, "v4_control")[0];
  const accion = respuestaIds(flujo, "v4_accion")[0];
  let nivel = NIVEL[riesgo.criticidadBase];
  const factoresElevadores: string[] = [];
  const factoresLimitantes: string[] = [];
  const senalesCriticas: string[] = [];
  const inconsistencias: string[] = [];

  const exposicionAlta = exposiciones.some((id) =>
    [
      "exposicion_directa_personas",
      "consecuencia_grave_posible",
      "afectacion_real_suelo_agua_drenaje",
      "afecta_suelo_agua_drenaje",
      "evento_activo_personas",
      "habilita_tarea_riesgosa",
    ].includes(id),
  );
  if (exposicionAlta) {
    nivel += 1;
    factoresElevadores.push("Exposición o consecuencia relevante confirmada por el reportante.");
  }
  if (control === "sin_control") {
    nivel += 1;
    factoresElevadores.push("Ausencia de control efectivo confirmada.");
  } else if (control === "control_parcial") {
    factoresElevadores.push("El control existente es parcial o temporal.");
  } else if (control === "control_efectivo") {
    nivel -= 1;
    factoresLimitantes.push("Control implementado y declarado como efectivo.");
  }
  if (accion === "accion_pendiente") {
    factoresElevadores.push("La medida preventiva requerida permanece pendiente.");
  }
  if (accion === "actividad_detenida") {
    factoresLimitantes.push("La actividad fue detenida o aislada mientras se implementa el control.");
  }

  nivel = Math.max(0, Math.min(3, nivel));
  if (riesgo.topeCriticidad) nivel = Math.min(nivel, NIVEL[riesgo.topeCriticidad]);
  const criticidadFinal = CRITICIDAD_POR_NIVEL[nivel];
  const noVerificable =
    exposiciones.includes("no_verificable") ||
    control === "control_no_verificable" ||
    accion === "accion_no_verificable" ||
    accion === "verificacion_solicitada";
  const controlDeficiente = control === "sin_control" || control === "control_parcial";
  const requiereSuspension = Boolean(
    riesgo.suspensionConControlDeficiente && controlDeficiente && (exposicionAlta || criticidadFinal === "CRITICO"),
  );
  const requiereContencionAmbiental = Boolean(
    riesgo.contencionAmbiental && control !== "control_efectivo",
  );

  if (requiereSuspension) senalesCriticas.push("Tarea crítica con exposición y control insuficiente.");
  if (requiereContencionAmbiental) senalesCriticas.push("Condición ambiental que requiere contención y control de propagación.");
  if (noVerificable) inconsistencias.push("Existen antecedentes que no pudieron verificarse en terreno.");

  const medidaInmediata =
    accion === "accion_especifica_aplicada"
      ? `Mantener y verificar la eficacia de la medida aplicada: ${riesgo.accionInmediata}`
      : accion === "accion_cierre_pendiente"
        ? `Mantener el control efectivo y registrar la evidencia de cierre: ${riesgo.evidenciaCierre}`
      : accion === "control_temporal"
        ? `Mantener el control temporal y ejecutar la medida definitiva: ${riesgo.accionInmediata}`
        : accion === "actividad_detenida"
          ? `Mantener la actividad detenida o aislada hasta ejecutar y verificar: ${riesgo.accionInmediata}`
          : accion === "verificacion_solicitada"
            ? `Verificar el control antes de continuar: ${riesgo.controlEsperado}`
            : riesgo.accionInmediata;
  const prioridad = criticidadFinal === "CRITICO" ? "inmediata" : criticidadFinal === "ALTO" ? "dentro de 24 horas" : criticidadFinal === "MEDIO" ? "dentro de 3 días" : "dentro de 7 días";
  const preguntas = reconstruirVerificacionesProgresivasV4(flujo).map((item, indice) => ({
    id: ORDEN_PREGUNTAS[indice],
    modulo: riesgo.categoria,
    texto: item.pregunta,
    objetivo: item.respuesta,
  }));

  return {
    criticidadFinal,
    ambitoPrincipal: riesgo.ambito,
    ambitosSecundarios: [],
    tipoEvento: riesgo.tipoEvento,
    criticidadBase: riesgo.criticidadBase,
    justificacionTecnica: `El usuario seleccionó directamente la ruta técnica “${riesgo.titulo}”. Se evaluaron exposición, control y medida aplicada mediante llaves preventivas estructuradas. Control esperado: ${riesgo.controlEsperado}`,
    resumenEjecutivo: `Se identificó ${riesgo.titulo.toLowerCase()}, clasificado como ${criticidadFinal}. ${medidaInmediata} Verificar la eficacia del control ${prioridad}.`,
    medidaInmediata,
    plazoSugerido: criticidadFinal === "CRITICO" ? "Inmediato" : criticidadFinal === "ALTO" ? "24 horas" : criticidadFinal === "MEDIO" ? "3 días" : "7 días",
    requiereSuspension,
    requiereContencionAmbiental,
    normativaProbable: normativaDesde(riesgo.normativa, riesgo),
    requiereRevisionManual: noVerificable,
    senalesCriticas,
    factoresElevadores,
    factoresLimitantes,
    inconsistencias,
    categoriaDetectada: riesgo.categoria,
    moduloPreguntasSugerido: riesgo.categoria,
    preguntasSugeridas: preguntas,
    preguntasCriticasRespondidas: preguntas.map((pregunta) => pregunta.id),
    preguntasFaltantesRecomendadas: [],
    justificacionModuloPreguntas: `Módulo seleccionado por llave semántica explícita: ${riesgo.id}.`,
    confianzaClasificacion: noVerificable ? "media" : "alta",
    palabrasClaveDetectadas: [riesgo.id, riesgo.familia],
    fuenteEvaluacion: "motor_v2",
  };
}

export function reconstruirVerificacionesProgresivasV4(
  flujo?: FlujoPreguntasProgresivasV4,
): Array<{ pregunta: string; respuesta: string }> {
  if (!flujo) return [];
  const reporteVacio: ReporteContextoProgresivoV4 = {};
  return ORDEN_PREGUNTAS.flatMap((id, indice) => {
    const respuesta = flujo.respuestas[id];
    if (!respuesta?.opcionIds.length) return [];
    const pregunta = construirPreguntaProgresivaV4(reporteVacio, {
      ...flujo,
      pasoActual: indice + 1,
    });
    const etiquetas = respuesta.opcionIds
      .map((opcionId) => pregunta.opciones.find((item) => item.id === opcionId)?.titulo)
      .filter(Boolean) as string[];
    if (etiquetas.length === 0) return [];
    return [{ pregunta: pregunta.texto, respuesta: etiquetas.join(" · ") }];
  });
}

export const obtenerRiesgoProgresivoV4 = (flujo?: FlujoPreguntasProgresivasV4) => {
  const riesgo = flujo ? riesgoSeleccionado(flujo) : undefined;
  return riesgo
    ? {
        id: riesgo.id,
        titulo: riesgo.titulo,
        familia: riesgo.familia,
        controlEsperado: riesgo.controlEsperado,
        accionInmediata: riesgo.accionInmediata,
        evidenciaCierre: riesgo.evidenciaCierre,
      }
    : null;
};
