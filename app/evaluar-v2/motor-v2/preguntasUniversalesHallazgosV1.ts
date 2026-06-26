export const VERSION_MATRIZ_UNIVERSAL_V1 = "matriz_universal_v1" as const;

export type TipoPreguntaUniversalV1 =
  | "texto_breve"
  | "seleccion_unica"
  | "seleccion_multiple"
  | "seleccion_unica_descripcion";

export type PreguntaUniversalId =
  | "universal_hallazgo"
  | "universal_actividad"
  | "universal_ambito"
  | "universal_naturaleza"
  | "universal_fuente"
  | "universal_expuesto"
  | "universal_mecanismo"
  | "universal_afectacion"
  | "universal_consecuencia"
  | "universal_probabilidad"
  | "universal_control"
  | "universal_estado_operativo";

export type OpcionUniversalHallazgoV1 = {
  id: string;
  label: string;
  titulo?: string;
  descripcion?: string;
  exclusiva?: boolean;
  habilitaTexto?: boolean;
};

export type PreguntaUniversalHallazgoV1 = {
  id: PreguntaUniversalId;
  etiqueta: string;
  texto: string;
  ayuda?: string;
  tipo: TipoPreguntaUniversalV1;
  maxPalabras?: number;
  maxSeleccion?: number;
  opciones?: OpcionUniversalHallazgoV1[];
};

export const PREGUNTAS_UNIVERSALES_HALLAZGOS_V1: PreguntaUniversalHallazgoV1[] = [
  {
    id: "universal_hallazgo",
    etiqueta: "Hallazgo",
    texto: "Describe en pocas palabras el hallazgo que detectaste.",
    ayuda:
      "Ejemplo: trabajador sin arnés, vidrio quebrado, derrame de aceite o permiso sin firma.",
    tipo: "texto_breve",
    maxPalabras: 15,
  },
  {
    id: "universal_actividad",
    etiqueta: "Actividad",
    texto: "¿En qué actividad, proceso o etapa se detectó?",
    tipo: "seleccion_unica",
    opciones: [
      { id: "ACT_TAREA_OPERACION", label: "Ejecución de tarea u operación" },
      { id: "ACT_CONSTRUCCION_MONTAJE", label: "Construcción, montaje o instalación" },
      { id: "ACT_MANTENCION_REPARACION", label: "Mantención o reparación" },
      { id: "ACT_TRASLADO_LOGISTICA", label: "Traslado, tránsito o logística" },
      { id: "ACT_ALMACENAMIENTO_MANIPULACION", label: "Almacenamiento o manipulación" },
      { id: "ACT_LIMPIEZA_ORDEN", label: "Limpieza, orden o aseo" },
      { id: "ACT_INSPECCION_CONTROL", label: "Inspección, prueba o control" },
      { id: "ACT_GESTION_DOCUMENTAL", label: "Gestión administrativa o documental" },
      { id: "ACT_EMERGENCIA_INCIDENTE", label: "Emergencia o incidente" },
      { id: "ACT_OTRA", label: "Otra actividad", habilitaTexto: true },
      { id: "ACT_NO_VERIFICABLE", label: "No verificable" },
    ],
  },
  {
    id: "universal_ambito",
    etiqueta: "Ámbito",
    texto: "¿A qué ámbito o ámbitos corresponde el hallazgo?",
    ayuda: "Puedes seleccionar hasta 2.",
    tipo: "seleccion_multiple",
    maxSeleccion: 2,
    opciones: [
      { id: "AMB_SEGURIDAD", label: "Seguridad laboral" },
      { id: "AMB_SALUD", label: "Salud ocupacional" },
      { id: "AMB_MEDIO_AMBIENTE", label: "Medio ambiente" },
      { id: "AMB_CALIDAD", label: "Calidad o ejecución técnica" },
      { id: "AMB_DOCUMENTAL", label: "Documental o legal" },
      { id: "AMB_ACTIVOS_INFRA", label: "Equipos, activos o infraestructura" },
      { id: "AMB_CONTINUIDAD", label: "Continuidad operacional" },
      { id: "AMB_NO_VERIFICABLE", label: "No verificable", exclusiva: true },
    ],
  },
  {
    id: "universal_naturaleza",
    etiqueta: "Tipo de hallazgo",
    texto: "¿Qué tipo de desviación describe mejor lo observado?",
    tipo: "seleccion_unica",
    opciones: [
      { id: "NAT_CONDICION_INSEGURA", label: "Condición insegura o subestándar" },
      { id: "NAT_ACCION_INSEGURA", label: "Acción o práctica insegura" },
      { id: "NAT_FALLA_EQUIPO", label: "Falla de equipo, herramienta o instalación" },
      { id: "NAT_EXPOSICION_SALUD", label: "Exposición a agente de salud ocupacional" },
      { id: "NAT_IMPACTO_AMBIENTAL", label: "Derrame, emisión, residuo o impacto ambiental" },
      { id: "NAT_INCUMPLIMIENTO_DOC", label: "Incumplimiento documental, contractual o legal" },
      { id: "NAT_DESVIACION_CALIDAD", label: "Desviación de calidad o ejecución técnica" },
      { id: "NAT_DANO_MATERIAL", label: "Daño material o de infraestructura" },
      { id: "NAT_INCIDENTE_CASI", label: "Incidente o casi incidente" },
      { id: "NAT_MEJORA", label: "Oportunidad de mejora" },
      { id: "NAT_NO_VERIFICABLE", label: "No verificable" },
    ],
  },
  {
    id: "universal_fuente",
    etiqueta: "Fuente",
    texto: "¿Cuál es la fuente o elemento principal involucrado?",
    tipo: "seleccion_unica",
    opciones: [
      { id: "FUENTE_PERSONA", label: "Persona o conducta" },
      { id: "FUENTE_EQUIPO", label: "Equipo, herramienta o vehículo" },
      { id: "FUENTE_MATERIAL", label: "Material, producto o sustancia" },
      { id: "FUENTE_AMBIENTE", label: "Ambiente o infraestructura" },
      { id: "FUENTE_METODO", label: "Método, proceso u organización" },
      { id: "FUENTE_DOCUMENTO", label: "Documento, permiso o registro" },
      { id: "FUENTE_MULTIPLE", label: "Más de una fuente" },
      { id: "FUENTE_NO_VERIFICABLE", label: "No verificable" },
    ],
  },
  {
    id: "universal_expuesto",
    etiqueta: "Exposición",
    texto: "¿Quién o qué está expuesto o afectado?",
    ayuda: "Puedes seleccionar todas las opciones aplicables.",
    tipo: "seleccion_multiple",
    opciones: [
      { id: "EXP_TRABAJADOR", label: "Trabajador o grupo de trabajadores" },
      { id: "EXP_TERCEROS", label: "Contratistas o terceros" },
      { id: "EXP_PUBLICO", label: "Público, visitante o usuario" },
      { id: "EXP_EQUIPO_ACTIVO", label: "Equipo, vehículo o activo" },
      { id: "EXP_INFRA", label: "Instalación o infraestructura" },
      { id: "EXP_MEDIO_AMBIENTE", label: "Medio ambiente" },
      { id: "EXP_PRODUCTO_CALIDAD", label: "Producto, servicio o calidad" },
      { id: "EXP_CUMPLIMIENTO", label: "Cumplimiento o documentación" },
      {
        id: "EXP_POTENCIAL_NADIE",
        label: "Actualmente nadie; existe exposición potencial",
        exclusiva: true,
      },
      { id: "EXP_NO_VERIFICABLE", label: "No verificable", exclusiva: true },
    ],
  },
  {
    id: "universal_mecanismo",
    etiqueta: "Mecanismo",
    texto: "¿Cómo podría materializarse el daño, impacto o incumplimiento?",
    ayuda: "Puedes seleccionar hasta 2.",
    tipo: "seleccion_multiple",
    maxSeleccion: 2,
    opciones: [
      { id: "MEC_CAIDA", label: "Caída de persona u objeto" },
      { id: "MEC_GOLPE", label: "Golpe, choque o atropello" },
      { id: "MEC_CORTE", label: "Corte, punzamiento o proyección" },
      { id: "MEC_ATRAPAMIENTO", label: "Atrapamiento, aplastamiento o partes móviles" },
      { id: "MEC_ENERGIA", label: "Contacto eléctrico o energía no controlada" },
      { id: "MEC_INCENDIO", label: "Incendio o explosión" },
      {
        id: "MEC_AGENTE_SALUD",
        label: "Exposición física, química, biológica, ergonómica o psicosocial",
      },
      { id: "MEC_DERRAME", label: "Derrame, emisión, contaminación o generación de residuo" },
      { id: "MEC_FALLA_TECNICA", label: "Falla técnica, estructural, operacional o de equipo" },
      { id: "MEC_INCUMPLIMIENTO", label: "Incumplimiento documental, legal o contractual" },
      { id: "MEC_CALIDAD", label: "Defecto de calidad o ejecución" },
      { id: "MEC_INTERRUPCION", label: "Interrupción o pérdida operacional" },
      { id: "MEC_OTRO", label: "Otro mecanismo", habilitaTexto: true },
      { id: "MEC_NO_VERIFICABLE", label: "No verificable", exclusiva: true },
    ],
  },
  {
    id: "universal_afectacion",
    etiqueta: "Efecto actual",
    texto: "¿Existe actualmente un efecto o consecuencia asociada al hallazgo?",
    tipo: "seleccion_unica",
    opciones: [
      { id: "AFEC_SIN_CONSECUENCIA", label: "No, solo existe potencial de daño o incumplimiento" },
      { id: "AFEC_PERSONA", label: "Persona lesionada o afectada" },
      { id: "AFEC_ACTIVO", label: "Daño a equipo, activo o infraestructura" },
      { id: "AFEC_AMBIENTAL", label: "Impacto ambiental" },
      { id: "AFEC_CALIDAD", label: "Defecto o pérdida de calidad" },
      { id: "AFEC_DOCUMENTAL", label: "Incumplimiento documental o legal confirmado" },
      { id: "AFEC_OPERACIONAL", label: "Interrupción operacional" },
      { id: "AFEC_MULTIPLE", label: "Más de una consecuencia" },
      { id: "AFEC_NO_VERIFICABLE", label: "No verificable" },
    ],
  },
  {
    id: "universal_consecuencia",
    etiqueta: "Consecuencia",
    texto: "¿Cuál es la consecuencia máxima razonable si el hallazgo no se corrige?",
    tipo: "seleccion_unica_descripcion",
    opciones: [
      {
        id: "CON_MENOR",
        label: "Menor o localizada",
        titulo: "Menor o localizada",
        descripcion: "Lesión superficial, molestia reversible, daño menor o desviación localizada.",
      },
      {
        id: "CON_RELEVANTE",
        label: "Relevante o significativa",
        titulo: "Relevante o significativa",
        descripcion:
          "Lesión con recuperación, daño reparable o impacto ambiental, productivo o documental importante.",
      },
      {
        id: "CON_GRAVE",
        label: "Grave o catastrófica",
        titulo: "Grave o catastrófica",
        descripcion:
          "Fatalidad, incapacidad permanente, lesiones múltiples, emergencia, daño irreparable o impacto mayor.",
      },
      { id: "CON_NO_VERIFICABLE", label: "No verificable" },
    ],
  },
  {
    id: "universal_probabilidad",
    etiqueta: "Probabilidad",
    texto: "¿Con qué probabilidad o frecuencia podría materializarse?",
    tipo: "seleccion_unica_descripcion",
    opciones: [
      {
        id: "PROB_BAJA",
        label: "Baja o remota",
        titulo: "Baja o remota",
        descripcion: "Podría ocurrir rara vez o en circunstancias excepcionales.",
      },
      {
        id: "PROB_MEDIA",
        label: "Media o posible",
        titulo: "Media o posible",
        descripcion: "Puede ocurrir en varias ocasiones o bajo condiciones previsibles.",
      },
      {
        id: "PROB_ALTA",
        label: "Alta, evidente o inmediata",
        titulo: "Alta, evidente o inmediata",
        descripcion: "La exposición es actual, frecuente o es razonable esperar que ocurra.",
      },
      { id: "PROB_NO_VERIFICABLE", label: "No verificable" },
    ],
  },
  {
    id: "universal_control",
    etiqueta: "Controles",
    texto: "¿Cuál es el estado real de los controles existentes?",
    tipo: "seleccion_unica",
    opciones: [
      { id: "CTRL_EFECTIVO", label: "Control efectivo y verificado" },
      { id: "CTRL_PARCIAL", label: "Control implementado, pero parcial o incompleto" },
      { id: "CTRL_EXISTE_NO_VERIFICADO", label: "Existe control, pero no pudo verificarse" },
      { id: "CTRL_AUSENTE", label: "No existe control" },
      { id: "CTRL_FALLIDO", label: "El control falló, fue retirado o fue vulnerado" },
      { id: "CTRL_NO_APLICA", label: "No aplica" },
      { id: "CTRL_NO_VERIFICABLE", label: "No verificable" },
    ],
  },
  {
    id: "universal_estado_operativo",
    etiqueta: "Estado actual",
    texto: "¿Cuál es la situación actual de la actividad o condición observada?",
    tipo: "seleccion_unica",
    opciones: [
      { id: "EST_CONTINUA_SIN_CONTROL", label: "La actividad continúa sin control efectivo" },
      { id: "EST_CONTINUA_CONTROL_TEMP", label: "La actividad continúa con control temporal" },
      { id: "EST_DETENIDA_AISLADA", label: "La actividad fue detenida o aislada" },
      { id: "EST_SIN_ACTIVIDAD", label: "No existe actividad en ejecución" },
      { id: "EST_CORREGIDA", label: "La condición ya fue corregida" },
      { id: "EST_NO_APLICA", label: "No aplica" },
      { id: "EST_NO_VERIFICABLE", label: "No verificable" },
    ],
  },
];

export function obtenerPreguntaUniversalHallazgoV1(id: PreguntaUniversalId) {
  return PREGUNTAS_UNIVERSALES_HALLAZGOS_V1.find((pregunta) => pregunta.id === id);
}

export function obtenerPreguntasUniversalesHallazgosV1() {
  return PREGUNTAS_UNIVERSALES_HALLAZGOS_V1;
}
