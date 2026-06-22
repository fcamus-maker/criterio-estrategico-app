import type { SlotPreguntaProductiva } from "./plantillasRondaProductivaV2";

export type EsquemaRespuestaId =
  | "confirmacion_exposicion"
  | "estado_control"
  | "decision_operacional_critica"
  | "accion_correctiva_simple"
  | "documento_habilitante"
  | "reparacion_reposicion"
  | "gestion_ambiental"
  | "regularizacion_documental"
  | "responsable_cierre"
  | "accion_preventiva_general"
  | "evidencia_cierre";

export type OpcionEsquemaRespuestaPreventiva = {
  label: string;
  value: string;
  score?: number;
};

export type EsquemaRespuestaPreventiva = {
  id: EsquemaRespuestaId;
  opciones: OpcionEsquemaRespuestaPreventiva[];
  slotsPermitidos: SlotPreguntaProductiva[];
};

const opcion = (label: string, value: string, score?: number): OpcionEsquemaRespuestaPreventiva => ({
  label,
  value,
  score,
});

export const ESQUEMAS_RESPUESTA_PREVENTIVA_V2: Record<EsquemaRespuestaId, EsquemaRespuestaPreventiva> = {
  confirmacion_exposicion: {
    id: "confirmacion_exposicion",
    slotsPermitidos: ["confirmacion"],
    opciones: [
      opcion("Sí, exposición confirmada", "exposicion_confirmada", 10),
      opcion("Posible exposición, requiere verificación", "posible_exposicion", 6),
      opcion("No hay exposición", "sin_exposicion", 0),
      opcion("No verificable", "no_verificable", 4),
      opcion("No aplica", "no_aplica", 0),
    ],
  },
  estado_control: {
    id: "estado_control",
    slotsPermitidos: ["control"],
    opciones: [
      opcion("Control efectivo y completo", "control_efectivo_completo", 0),
      opcion("Control parcial o incompleto", "control_parcial_incompleto", 6),
      opcion("Sin control", "sin_control", 10),
      opcion("No verificable", "no_verificable", 5),
      opcion("No aplica", "no_aplica", 0),
    ],
  },
  decision_operacional_critica: {
    id: "decision_operacional_critica",
    slotsPermitidos: ["accion"],
    opciones: [
      opcion("Detener o aislar inmediatamente", "detener_aislar_inmediatamente", 12),
      opcion("Corregir antes de continuar", "corregir_antes_continuar", 10),
      opcion("Mantener la actividad solo con control efectivo", "mantener_solo_control_efectivo", 0),
      opcion("No verificable", "no_verificable", 5),
      opcion("No aplica", "no_aplica", 0),
    ],
  },
  accion_correctiva_simple: {
    id: "accion_correctiva_simple",
    slotsPermitidos: ["accion"],
    opciones: [
      opcion("Retirar o segregar de inmediato", "retirar_segregar_inmediato", 5),
      opcion("Señalizar y restringir el acceso", "senalizar_restringir_acceso", 4),
      opcion("Reparar o reponer antes de habilitar", "reparar_reponer_antes_habilitar", 4),
      opcion("No verificable", "no_verificable", 5),
      opcion("No aplica", "no_aplica", 0),
    ],
  },
  documento_habilitante: {
    id: "documento_habilitante",
    slotsPermitidos: ["gestion", "control"],
    opciones: [
      opcion("Disponible y vigente", "disponible_vigente", 0),
      opcion("Disponible, pero incompleto o vencido", "disponible_incompleto_vencido", 7),
      opcion("No disponible", "no_disponible", 10),
      opcion("No verificable", "no_verificable", 5),
      opcion("No aplica", "no_aplica", 0),
    ],
  },
  reparacion_reposicion: {
    id: "reparacion_reposicion",
    slotsPermitidos: ["gestion"],
    opciones: [
      opcion("Sí, requiere reparación o reposición", "requiere_reparacion_reposicion", 5),
      opcion("No, la condición ya fue retirada o controlada", "retirada_controlada", 0),
      opcion("No verificable", "no_verificable", 5),
      opcion("No aplica", "no_aplica", 0),
    ],
  },
  gestion_ambiental: {
    id: "gestion_ambiental",
    slotsPermitidos: ["accion", "gestion"],
    opciones: [
      opcion("Contener y retirar inmediatamente", "contener_retirar_inmediatamente", 9),
      opcion("Segregar y gestionar como residuo", "segregar_gestionar_residuo", 7),
      opcion("Notificar y evaluar impacto", "notificar_evaluar_impacto", 8),
      opcion("Más de una gestión", "mas_de_una_gestion", 9),
      opcion("No verificable", "no_verificable", 5),
      opcion("No aplica", "no_aplica", 0),
    ],
  },
  regularizacion_documental: {
    id: "regularizacion_documental",
    slotsPermitidos: ["accion"],
    opciones: [
      opcion("Regularizar antes de iniciar o continuar", "regularizar_antes_continuar", 8),
      opcion("Completar firmas o antecedentes pendientes", "completar_firmas_antecedentes", 5),
      opcion("Actualizar documento o registro", "actualizar_documento_registro", 5),
      opcion("No verificable", "no_verificable", 5),
      opcion("No aplica", "no_aplica", 0),
    ],
  },
  responsable_cierre: {
    id: "responsable_cierre",
    slotsPermitidos: ["gestion"],
    opciones: [
      opcion("Supervisor del área", "supervisor_area", 2),
      opcion("Prevención de riesgos", "prevencion_riesgos", 2),
      opcion("Mantención o servicio técnico", "mantencion_servicio_tecnico", 2),
      opcion("Responsable del contrato", "responsable_contrato", 2),
      opcion("Requiere definición conjunta", "requiere_definicion_conjunta", 4),
      opcion("No verificable", "no_verificable", 5),
      opcion("No aplica", "no_aplica", 0),
    ],
  },
  accion_preventiva_general: {
    id: "accion_preventiva_general",
    slotsPermitidos: ["accion"],
    opciones: [
      opcion("Aislar y verificar antes de continuar", "aislar_verificar_antes_continuar", 6),
      opcion("Corregir la condición observada", "corregir_condicion_observada", 4),
      opcion("Mantener control temporal y solicitar revisión", "control_temporal_revision", 5),
      opcion("No verificable", "no_verificable", 5),
      opcion("No aplica", "no_aplica", 0),
    ],
  },
  evidencia_cierre: {
    id: "evidencia_cierre",
    slotsPermitidos: ["cierre"],
    opciones: [
      opcion("Fotografía de la corrección", "fotografia_correccion", 2),
      opcion("Verificación en terreno", "verificacion_terreno", 2),
      opcion("Registro y responsable de cierre", "registro_responsable_cierre", 2),
      opcion("Más de una evidencia", "mas_de_una_evidencia", 3),
      opcion("No verificable", "no_verificable", 5),
      opcion("No aplica", "no_aplica", 0),
    ],
  },
};

export const obtenerEsquemaRespuestaPreventiva = (
  id: EsquemaRespuestaId,
): EsquemaRespuestaPreventiva | undefined => ESQUEMAS_RESPUESTA_PREVENTIVA_V2[id];

