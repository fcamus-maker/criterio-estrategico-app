export type NivelValidacionInformeV2 = {
  etiqueta: string;
  detalle: string;
  requiereRevision: boolean;
};

export type DecisionSuspensionInformeV2 = {
  requerida: boolean;
  aplicada: boolean;
  etiqueta: string;
  detalle: string;
};

const normalizar = (valor?: string) =>
  (valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export function resolverNivelValidacionInformeV2(input: {
  confianza?: string;
  requiereRevisionManual?: boolean;
  inconsistencias?: string[];
}): NivelValidacionInformeV2 {
  const tieneInconsistencias = Boolean(input.inconsistencias?.length);
  const requiereRevision = Boolean(input.requiereRevisionManual || tieneInconsistencias);

  if (requiereRevision) {
    return {
      etiqueta: "Requiere validación técnica",
      detalle:
        "La clasificación es preventiva y debe confirmarse antes de utilizarla como conclusión definitiva.",
      requiereRevision: true,
    };
  }

  if (normalizar(input.confianza) === "alta") {
    return {
      etiqueta: "Análisis consistente",
      detalle: "Las respuestas registradas permiten emitir una decisión preventiva coherente.",
      requiereRevision: false,
    };
  }

  return {
    etiqueta: "Antecedentes suficientes para actuar",
    detalle: "La medida preventiva puede ejecutarse y debe verificarse durante el cierre.",
    requiereRevision: false,
  };
}

export function resolverDecisionSuspensionInformeV2(input: {
  criticidad?: string;
  requiereSuspension?: boolean;
  requiereContencionAmbiental?: boolean;
  ambito?: string;
  respuestas?: Record<string, string>;
}): DecisionSuspensionInformeV2 {
  const valores = Object.values(input.respuestas || {}).map(normalizar);
  const actividadDetenida = valores.some((valor) =>
    ["detener_aislar", "detener actividad", "actividad detenida", "suspendida"].includes(valor),
  );
  const correccionAntesDeContinuar = valores.includes("corregir_antes_continuar");
  const riesgoActivo = valores.some((valor) =>
    ["continua_sin_control", "accion_pendiente", "control_ausente", "no_controlado"].includes(valor),
  );
  const criticidadCritica = normalizar(input.criticidad) === "critico";
  const requerida = Boolean(
    input.requiereSuspension ||
      criticidadCritica ||
      actividadDetenida ||
      correccionAntesDeContinuar ||
      riesgoActivo,
  );

  if (actividadDetenida) {
    return {
      requerida: true,
      aplicada: true,
      etiqueta: "Actividad detenida o aislada",
      detalle: "Mantener la suspensión hasta verificar controles efectivos y autorizar la reanudación.",
    };
  }

  if (
    input.requiereContencionAmbiental ||
    (normalizar(input.ambito) === "medio_ambiente" && requerida)
  ) {
    return {
      requerida: true,
      aplicada: false,
      etiqueta: "Detener la fuente y aislar el área afectada",
      detalle:
        "Contener el derrame, proteger drenajes y restringir únicamente el sector comprometido hasta verificar el control.",
    };
  }

  if (requerida) {
    return {
      requerida: true,
      aplicada: false,
      etiqueta: "Suspensión inmediata requerida",
      detalle: "No continuar la actividad hasta controlar el riesgo y verificar la condición en terreno.",
    };
  }

  return {
    requerida: false,
    aplicada: false,
    etiqueta: "Actividad sujeta a control",
    detalle: "Aplicar la medida indicada y verificar su eficacia dentro del plazo definido.",
  };
}

export function formatearCoordenadaInformeV2(valor?: number) {
  return typeof valor === "number" && Number.isFinite(valor) ? valor.toFixed(6) : "No informada";
}

export function formatearPrecisionInformeV2(valor?: number) {
  return typeof valor === "number" && Number.isFinite(valor) ? `${valor.toFixed(1)} m` : "No informada";
}

export function formatearFechaGpsInformeV2(valor?: string) {
  if (!valor) return "No informada";
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return valor;

  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Santiago",
  }).format(fecha);
}
