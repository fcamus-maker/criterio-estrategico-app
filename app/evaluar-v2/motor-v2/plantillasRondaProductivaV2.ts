import {
  ESQUEMAS_RESPUESTA_PREVENTIVA_V2,
  type EsquemaRespuestaId,
} from "./esquemasRespuestaPreventivaV2";
import {
  obtenerTodasFamiliasPreventivas,
  type FamiliaTaxonomiaPreventivaId,
} from "./taxonomiaPreventivaV2";

export type FamiliaPreventivaProductivaId =
  | FamiliaTaxonomiaPreventivaId
  | "general_preventivo";

export type ClaseCasoPreventivo =
  | "simple"
  | "critico"
  | "ambiental"
  | "documental"
  | "salud"
  | "general"
  | "critico_multiple";

export type SlotPreguntaProductiva =
  | "confirmacion"
  | "control"
  | "accion"
  | "gestion"
  | "cierre";

export type PlantillaPreguntaProductiva = {
  id: string;
  slot: SlotPreguntaProductiva;
  texto: string;
  ayuda?: string;
  esquemaRespuestaId: EsquemaRespuestaId;
  requerida: true;
};

export type PlantillaFamiliaProductiva = {
  familiaId: FamiliaPreventivaProductivaId;
  etiquetaVisible: string;
  claseCaso: ClaseCasoPreventivo;
  preguntas: {
    confirmacion: PlantillaPreguntaProductiva;
    control: PlantillaPreguntaProductiva;
    accion: PlantillaPreguntaProductiva;
    gestion: PlantillaPreguntaProductiva;
    cierre: PlantillaPreguntaProductiva;
  };
  marcoLegalIds: string[];
};

const pregunta = (
  familiaId: FamiliaPreventivaProductivaId,
  slot: SlotPreguntaProductiva,
  texto: string,
  esquemaRespuestaId: EsquemaRespuestaId,
  ayuda?: string,
): PlantillaPreguntaProductiva => ({
  id: `${familiaId}_${slot}`,
  slot,
  texto,
  ayuda,
  esquemaRespuestaId,
  requerida: true,
});

const plantilla = (
  familiaId: FamiliaPreventivaProductivaId,
  etiquetaVisible: string,
  claseCaso: ClaseCasoPreventivo,
  preguntas: PlantillaFamiliaProductiva["preguntas"],
  marcoLegalIds: string[],
): PlantillaFamiliaProductiva => ({
  familiaId,
  etiquetaVisible,
  claseCaso,
  preguntas,
  marcoLegalIds,
});

const plantillaCritica = (
  familiaId: FamiliaPreventivaProductivaId,
  etiquetaVisible: string,
  foco: string,
): PlantillaFamiliaProductiva =>
  plantilla(
    familiaId,
    etiquetaVisible,
    "critico",
    {
      confirmacion: pregunta(familiaId, "confirmacion", `¿Se confirma exposición al riesgo de ${foco}?`, "confirmacion_exposicion"),
      control: pregunta(familiaId, "control", `¿Cuál es el estado del control crítico frente a ${foco}?`, "estado_control"),
      accion: pregunta(familiaId, "accion", "¿Qué decisión operacional corresponde frente al riesgo crítico?", "decision_operacional_critica"),
      gestion: pregunta(familiaId, "gestion", "¿Cuál es el estado del documento habilitante aplicable a la tarea?", "documento_habilitante"),
      cierre: pregunta(familiaId, "cierre", "¿Qué evidencia debe respaldar el cierre del hallazgo?", "evidencia_cierre"),
    },
    ["ley_16744", "ds_44", "ds_594", "jerarquia_controles"],
  );

const plantillaSimple = (
  familiaId: FamiliaPreventivaProductivaId,
  etiquetaVisible: string,
  foco: string,
): PlantillaFamiliaProductiva =>
  plantilla(
    familiaId,
    etiquetaVisible,
    "simple",
    {
      confirmacion: pregunta(familiaId, "confirmacion", `¿Se confirma exposición asociada a ${foco}?`, "confirmacion_exposicion"),
      control: pregunta(familiaId, "control", `¿Cuál es el estado del control aplicado sobre ${foco}?`, "estado_control"),
      accion: pregunta(familiaId, "accion", "¿Qué acción inmediata corresponde frente a la condición?", "accion_correctiva_simple"),
      gestion: pregunta(familiaId, "gestion", "¿Se requiere reparación o reposición del elemento observado?", "reparacion_reposicion"),
      cierre: pregunta(familiaId, "cierre", "¿Qué evidencia debe respaldar el cierre del hallazgo?", "evidencia_cierre"),
    },
    ["ley_16744", "ds_44", "jerarquia_controles"],
  );

const plantillaAmbiental = (
  familiaId: FamiliaPreventivaProductivaId,
  etiquetaVisible: string,
  foco: string,
): PlantillaFamiliaProductiva =>
  plantilla(
    familiaId,
    etiquetaVisible,
    "ambiental",
    {
      confirmacion: pregunta(familiaId, "confirmacion", `¿Se confirma exposición ambiental asociada a ${foco}?`, "confirmacion_exposicion"),
      control: pregunta(familiaId, "control", `¿Cuál es el estado del control ambiental aplicado sobre ${foco}?`, "estado_control"),
      accion: pregunta(familiaId, "accion", "¿Qué gestión ambiental inmediata corresponde?", "gestion_ambiental"),
      gestion: pregunta(familiaId, "gestion", "¿Qué gestión ambiental específica debe quedar definida?", "gestion_ambiental"),
      cierre: pregunta(familiaId, "cierre", "¿Qué evidencia debe respaldar el cierre del hallazgo?", "evidencia_cierre"),
    },
    ["ley_16744", "ds_44", "ds_594", "ds_43", "ds_148", "iso_14001"],
  );

const plantillaDocumental = (
  familiaId: FamiliaPreventivaProductivaId,
  etiquetaVisible: string,
): PlantillaFamiliaProductiva =>
  plantilla(
    familiaId,
    etiquetaVisible,
    "documental",
    {
      confirmacion: pregunta(familiaId, "confirmacion", "¿Se confirma la brecha documental o de cumplimiento indicada?", "confirmacion_exposicion"),
      control: pregunta(familiaId, "control", "¿Cuál es el estado del documento habilitante o registro aplicable?", "documento_habilitante"),
      accion: pregunta(familiaId, "accion", "¿Qué regularización documental corresponde?", "regularizacion_documental"),
      gestion: pregunta(familiaId, "gestion", "¿Quién debe revisar y definir la regularización?", "responsable_cierre"),
      cierre: pregunta(familiaId, "cierre", "¿Qué evidencia debe respaldar el cierre del hallazgo?", "evidencia_cierre"),
    },
    ["ley_16744", "ds_44", "iso_45001"],
  );

const plantillaGeneral = (
  familiaId: FamiliaPreventivaProductivaId,
  etiquetaVisible: string,
): PlantillaFamiliaProductiva =>
  plantilla(
    familiaId,
    etiquetaVisible,
    "general",
    {
      confirmacion: pregunta(familiaId, "confirmacion", "¿Se confirma una exposición actual al riesgo descrito?", "confirmacion_exposicion"),
      control: pregunta(familiaId, "control", "¿Cuál es el estado del control aplicado?", "estado_control"),
      accion: pregunta(familiaId, "accion", "¿Qué acción inmediata corresponde frente al hallazgo?", "accion_preventiva_general"),
      gestion: pregunta(familiaId, "gestion", "¿Quién debe revisar y definir la corrección?", "responsable_cierre"),
      cierre: pregunta(familiaId, "cierre", "¿Qué evidencia debe respaldar el cierre?", "evidencia_cierre"),
    },
    ["ley_16744", "ds_44", "jerarquia_controles"],
  );

const plantillaAltura = plantilla(
  "trabajos_criticos",
  "Caída de altura",
  "critico",
  {
    confirmacion: pregunta("trabajos_criticos", "confirmacion", "¿Se confirma exposición a caída de distinto nivel?", "confirmacion_exposicion"),
    control: pregunta(
      "trabajos_criticos",
      "control",
      "¿Cuál es el estado de la protección contra caídas implementada?",
      "estado_control",
      "Considere arnés, línea de vida, punto de anclaje, baranda, plataforma o protección colectiva.",
    ),
    accion: pregunta("trabajos_criticos", "accion", "¿Qué decisión operacional corresponde frente al riesgo de caída?", "decision_operacional_critica"),
    gestion: pregunta("trabajos_criticos", "gestion", "¿Cuál es el estado de la autorización, AST/ART, PTS o permiso aplicable a la tarea?", "documento_habilitante"),
    cierre: pregunta("trabajos_criticos", "cierre", "¿Qué evidencia debe respaldar el cierre del hallazgo?", "evidencia_cierre"),
  },
  ["ley_16744", "ds_44", "ds_594", "jerarquia_controles"],
);

const plantillaVidrio = plantilla(
  "dano_material",
  "Vidrio quebrado",
  "simple",
  {
    confirmacion: pregunta("dano_material", "confirmacion", "¿Se confirma exposición a corte, contacto o caída de fragmentos?", "confirmacion_exposicion"),
    control: pregunta("dano_material", "control", "¿Cuál es el estado del control aplicado sobre el vidrio quebrado?", "estado_control"),
    accion: pregunta("dano_material", "accion", "¿Qué acción inmediata corresponde frente a la condición?", "accion_correctiva_simple"),
    gestion: pregunta("dano_material", "gestion", "¿Se requiere reparación o reposición del elemento dañado?", "reparacion_reposicion"),
    cierre: pregunta("dano_material", "cierre", "¿Qué evidencia debe respaldar el cierre del hallazgo?", "evidencia_cierre"),
  },
  ["ley_16744", "ds_44", "jerarquia_controles"],
);

export const PLANTILLAS_RONDA_PRODUCTIVA_V2: Record<FamiliaPreventivaProductivaId, PlantillaFamiliaProductiva> = {
  seguridad_trabajadores: plantillaCritica("seguridad_trabajadores", "Seguridad laboral", "personas expuestas"),
  documental_legal: plantillaDocumental("documental_legal", "Documental / cumplimiento"),
  orden_aseo_housekeeping: plantillaSimple("orden_aseo_housekeeping", "Orden y aseo", "orden, tránsito o limpieza"),
  herramientas_equipos: plantillaCritica("herramientas_equipos", "Herramientas y equipos", "uso de herramienta o equipo"),
  maquinaria_instalaciones: plantillaCritica("maquinaria_instalaciones", "Maquinaria e instalaciones", "maquinaria o instalación"),
  vehiculos_transporte: plantillaCritica("vehiculos_transporte", "Vehículos y transporte", "tránsito o transporte"),
  izaje_gruas_amarre: plantillaCritica("izaje_gruas_amarre", "Izaje, grúas y amarre", "izaje o carga suspendida"),
  trabajos_criticos: plantillaAltura,
  epp: plantillaCritica("epp", "Elementos de protección personal", "control crítico de protección personal"),
  sustancias_hds: plantillaAmbiental("sustancias_hds", "Sustancias peligrosas / HDS", "sustancia peligrosa"),
  medio_ambiente: plantillaAmbiental("medio_ambiente", "Medio ambiente", "impacto ambiental"),
  equipos_emergencia: plantillaSimple("equipos_emergencia", "Equipos de emergencia", "equipo de emergencia"),
  senalizacion_segregacion: plantillaSimple("senalizacion_segregacion", "Señalización y segregación", "señalización o segregación"),
  clima_entorno: plantillaGeneral("clima_entorno", "Clima y entorno"),
  dano_material: plantillaVidrio,
  capacitacion_evidencias: plantillaDocumental("capacitacion_evidencias", "Capacitación y evidencias"),
  mantencion_certificacion: plantillaDocumental("mantencion_certificacion", "Mantención y certificación"),
  emergencias_reales: plantillaCritica("emergencias_reales", "Emergencia real", "emergencia real"),
  higiene_ocupacional: plantilla("higiene_ocupacional", "Salud ocupacional", "salud", {
    confirmacion: pregunta("higiene_ocupacional", "confirmacion", "¿Se confirma exposición de salud ocupacional?", "confirmacion_exposicion"),
    control: pregunta("higiene_ocupacional", "control", "¿Cuál es el estado del control de exposición ocupacional?", "estado_control"),
    accion: pregunta("higiene_ocupacional", "accion", "¿Qué acción preventiva corresponde frente a la exposición?", "accion_preventiva_general"),
    gestion: pregunta("higiene_ocupacional", "gestion", "¿Quién debe revisar y definir la gestión de salud ocupacional?", "responsable_cierre"),
    cierre: pregunta("higiene_ocupacional", "cierre", "¿Qué evidencia debe respaldar el cierre del hallazgo?", "evidencia_cierre"),
  }, ["ley_16744", "ds_44", "ds_594", "protocolo_salud_ocupacional"]),
  ergonomia_manejo_manual: plantillaSimple("ergonomia_manejo_manual", "Ergonomía y manejo manual", "manejo manual o ergonomía"),
  excavaciones_suelos: plantillaCritica("excavaciones_suelos", "Excavaciones y suelos", "excavación o terreno"),
  energia_loto_electrico: plantillaCritica("energia_loto_electrico", "Energía, bloqueo y eléctrico", "energía peligrosa"),
  general_preventivo: plantillaGeneral("general_preventivo", "Evaluación preventiva general"),
};

export const obtenerPlantillaRondaProductiva = (
  familiaId: FamiliaPreventivaProductivaId,
): PlantillaFamiliaProductiva | undefined => PLANTILLAS_RONDA_PRODUCTIVA_V2[familiaId];

export const obtenerPreguntasPlantillaOrdenadas = (
  plantillaItem: PlantillaFamiliaProductiva,
): PlantillaPreguntaProductiva[] => [
  plantillaItem.preguntas.confirmacion,
  plantillaItem.preguntas.control,
  plantillaItem.preguntas.accion,
  plantillaItem.preguntas.gestion,
  plantillaItem.preguntas.cierre,
];

export const validarContratoPlantillaProductiva = (plantillaItem: PlantillaFamiliaProductiva) => {
  const preguntas = obtenerPreguntasPlantillaOrdenadas(plantillaItem);
  const slots = preguntas.map((preguntaItem) => preguntaItem.slot);
  const errores: string[] = [];

  if (preguntas.length !== 5) errores.push("Plantilla sin cinco preguntas.");
  if (new Set(slots).size !== 5) errores.push("Plantilla con slots duplicados.");

  for (const preguntaItem of preguntas) {
    const esquema = ESQUEMAS_RESPUESTA_PREVENTIVA_V2[preguntaItem.esquemaRespuestaId];
    if (!esquema) {
      errores.push(`Esquema inexistente: ${preguntaItem.esquemaRespuestaId}.`);
      continue;
    }
    if (!esquema.slotsPermitidos.includes(preguntaItem.slot)) {
      errores.push(`Esquema ${preguntaItem.esquemaRespuestaId} no permitido para slot ${preguntaItem.slot}.`);
    }
  }

  return {
    valido: errores.length === 0,
    errores,
  };
};

export const familiasPreventivasCanonicas = (): FamiliaTaxonomiaPreventivaId[] =>
  obtenerTodasFamiliasPreventivas().map((familia) => familia.id);

export const familiasSinPlantillaProductiva = (): FamiliaTaxonomiaPreventivaId[] =>
  familiasPreventivasCanonicas().filter((familiaId) => !PLANTILLAS_RONDA_PRODUCTIVA_V2[familiaId]);

