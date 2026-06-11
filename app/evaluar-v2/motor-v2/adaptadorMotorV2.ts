import { evaluarHallazgoV2 } from "./evaluacionMotorV2";
import type {
  AmbitoEvaluacion,
  CategoriaHallazgoV2,
  ConfianzaClasificacionV2,
  Criticidad,
  EvaluacionInputV2,
  EvaluacionResultadoV2,
  ModuloPreguntasV2,
  NormativaAplicable,
  PreguntaSugeridaMotorV2,
  TipoEvento,
} from "./types";

export type ReporteEvaluableMotorV2 = {
  codigo?: string;
  empresa?: string;
  obra?: string;
  area?: string;
  descripcion?: string;
  fotos?: unknown[];
  gps?: unknown;
  evaluacion?: {
    respuestas?: Record<string, string>;
    puntaje?: number;
    criticidad?: string;
    prioridad?: string;
    recomendacion?: string;
    accionInmediata?: string;
  };
};

export type ResultadoMotorV2Seguro = {
  criticidadFinal: Criticidad;
  ambitoPrincipal: AmbitoEvaluacion;
  ambitosSecundarios: AmbitoEvaluacion[];
  tipoEvento: TipoEvento;
  criticidadBase?: Criticidad;
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
  fuenteEvaluacion: "motor_v2" | "fallback";
};

function texto(valor: unknown, fallback = "") {
  const limpio = String(valor ?? "").trim();
  return limpio || fallback;
}

function normalizar(valor: unknown) {
  return texto(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function incluye(textoBase: string, palabras: string[]) {
  return palabras.some((palabra) => textoBase.includes(normalizar(palabra)));
}

function criticidadMotor(valor: unknown): Criticidad {
  const criticidad = normalizar(valor);
  if (criticidad.includes("critic")) return "CRITICO";
  if (criticidad.includes("alto")) return "ALTO";
  if (criticidad.includes("medio") || criticidad.includes("media")) return "MEDIO";
  return "BAJO";
}

function valorRespuesta(
  respuestas: Record<string, string> | undefined,
  id: string
) {
  return normalizar(respuestas?.[id]);
}

function respuestaSi(valor: string) {
  return valor === "si" || valor === "true" || valor === "directa" || valor.includes("activo");
}

function respuestaParcial(valor: string) {
  return valor === "parcial" || valor === "potencial" || valor === "media";
}

function respuestaNo(valor: string) {
  return valor === "no" || valor === "false" || valor === "baja";
}

function algunaRespuesta(
  respuestas: Record<string, string> | undefined,
  ids: string[],
  condicion: (valor: string) => boolean
) {
  return ids.some((id) => condicion(valorRespuesta(respuestas, id)));
}

export function criticidadMotorAVisual(criticidad: Criticidad) {
  return criticidad === "CRITICO" ? "CRÍTICO" : criticidad;
}

export function prioridadDesdeCriticidadMotorV2(criticidad: Criticidad) {
  if (criticidad === "CRITICO") return "Urgente";
  if (criticidad === "ALTO") return "Alta";
  if (criticidad === "MEDIO") return "Media";
  return "Normal";
}

function ambitoDesdeTexto(reporte: ReporteEvaluableMotorV2): AmbitoEvaluacion | undefined {
  const base = normalizar(`${reporte.area || ""} ${reporte.descripcion || ""}`);

  if (incluye(base, ["derrame", "residuo", "ambiental", "suelo", "agua", "alcantarillado", "emision"])) {
    return "medio_ambiente";
  }

  if (incluye(base, ["ruido", "polvo", "quimic", "silice", "calor", "radiacion"])) {
    return "salud_ocupacional";
  }

  if (incluye(base, ["emergencia", "extintor", "evacuacion", "incendio", "explosion"])) {
    return "emergencia";
  }

  if (incluye(base, ["documento", "procedimiento", "permiso", "ast", "pts", "ptp", "capacitacion"])) {
    return "legal_documental";
  }

  return undefined;
}

function exposicionDesdeRespuestas(respuestas: Record<string, string> | undefined): EvaluacionInputV2["exposicionPersonas"] {
  const idsExposicionDirecta = [
    "orden-003",
    "transito-001",
    "altura-003",
    "electrico-003",
    "maquina-003",
    "herramienta-002",
    "izaje-001",
    "excavacion-003",
    "confinado-004",
    "sustancia-003",
    "derrame-005",
    "emision-002",
    "fisico-002",
    "legal-003",
    "procedimiento-003",
    "general-002",
  ];

  if (algunaRespuesta(respuestas, idsExposicionDirecta, respuestaSi)) return "directa";
  if (algunaRespuesta(respuestas, idsExposicionDirecta, respuestaParcial)) return "potencial";
  if (algunaRespuesta(respuestas, idsExposicionDirecta, respuestaNo)) return "sin_exposicion";
  if (respuestas?.p1 === "si") return "directa";
  if (respuestas?.p1 === "parcial") return "potencial";
  if (respuestas?.p1 === "no") return "sin_exposicion";
  return undefined;
}

function consecuenciaDesdeRespuestas(respuestas: Record<string, string> | undefined): EvaluacionInputV2["consecuencia"] {
  if (
    algunaRespuesta(
      respuestas,
      ["altura-001", "electrico-001", "electrico-002", "izaje-001", "confinado-001", "maquina-001"],
      respuestaSi
    )
  ) {
    return "grave";
  }
  if (
    algunaRespuesta(
      respuestas,
      ["orden-004", "transito-002", "herramienta-001", "derrame-005", "sustancia-003"],
      respuestaSi
    )
  ) {
    return "moderada";
  }
  if (respuestas?.p2 === "si") return "grave";
  if (respuestas?.p2 === "parcial") return "moderada";
  if (respuestas?.p2 === "no") return "leve";
  return undefined;
}

function probabilidadDesdeRespuestas(respuestas: Record<string, string> | undefined): EvaluacionInputV2["probabilidad"] {
  if (
    algunaRespuesta(
      respuestas,
      ["altura-004", "electrico-003", "maquina-003", "herramienta-002", "izaje-001", "procedimiento-002"],
      respuestaSi
    )
  ) {
    return "alta";
  }
  if (
    algunaRespuesta(
      respuestas,
      ["orden-003", "orden-004", "transito-001", "derrame-005", "general-002"],
      respuestaSi
    )
  ) {
    return "media";
  }
  if (respuestas?.p3 === "alta" || respuestas?.p8 === "alta") return "alta";
  if (respuestas?.p3 === "media" || respuestas?.p8 === "media") return "media";
  if (respuestas?.p3 === "baja" || respuestas?.p8 === "baja") return "baja";
  return undefined;
}

function controlesDesdeRespuestas(respuestas: Record<string, string> | undefined): EvaluacionInputV2["controlesExistentes"] {
  const idsControl = [
    "orden-005",
    "transito-003",
    "altura-002",
    "electrico-004",
    "electrico-005",
    "maquina-002",
    "maquina-004",
    "herramienta-003",
    "herramienta-004",
    "izaje-002",
    "izaje-003",
    "excavacion-002",
    "confinado-002",
    "confinado-003",
    "sustancia-004",
    "sustancia-005",
    "derrame-002",
    "emision-003",
    "fisico-003",
    "procedimiento-005",
    "general-005",
  ];

  if (algunaRespuesta(respuestas, idsControl, respuestaNo)) return "inexistentes";
  if (algunaRespuesta(respuestas, idsControl, respuestaParcial)) return "parciales";
  if (algunaRespuesta(respuestas, idsControl, respuestaSi)) return "suficientes";
  if (respuestas?.p6 === "no" || respuestas?.p5 === "no" || respuestas?.p12 === "no") return "inexistentes";
  if (respuestas?.p6 === "parcial" || respuestas?.p5 === "parcial" || respuestas?.p12 === "parcial") return "parciales";
  if (respuestas?.p6 === "si" || respuestas?.p5 === "si" || respuestas?.p12 === "si") return "suficientes";
  return undefined;
}

function datosAmbientalesDesdeReporte(reporte: ReporteEvaluableMotorV2): EvaluacionInputV2["datosAmbientales"] {
  const respuestas = reporte.evaluacion?.respuestas;
  const base = normalizar(`${reporte.area || ""} ${reporte.descripcion || ""}`);
  const respuestaDerrameNoContenido = respuestaNo(valorRespuesta(respuestas, "derrame-002"));
  const respuestaDerrameContenido = respuestaSi(valorRespuesta(respuestas, "derrame-002"));
  const respuestaMedioReceptor = respuestaSi(valorRespuesta(respuestas, "derrame-004"));
  const respuestaContencion = respuestaSi(valorRespuesta(respuestas, "derrame-006"));
  const respuestaResiduo = respuestaSi(valorRespuesta(respuestas, "derrame-007"));
  const sustanciaDerrame = texto(respuestas?.["derrame-001"]);
  const derrame = incluye(base, ["derrame", "fuga"]) || Boolean(sustanciaDerrame);
  const residuo =
    incluye(base, ["residuo peligroso", "residuos peligrosos", "residuo contaminado"]) ||
    respuestaResiduo;
  const sustancia =
    incluye(base, ["sustancia peligrosa", "quimic", "quimica", "combustible", "aceite", "hidrocarburo"]) ||
    Boolean(sustanciaDerrame);
  const suelo = incluye(base, ["suelo"]) || respuestaMedioReceptor || (derrame && incluye(base, ["terreno"]));
  const agua = incluye(base, ["agua", "alcantarillado", "drenaje"]) || respuestaMedioReceptor;
  const aire = incluye(base, ["polvo", "emision", "humo", "gases"]);
  const comunidad = incluye(base, ["comunidad", "vecino", "tercero"]);
  const contenido = derrame
    ? respuestaDerrameContenido ||
      (incluye(base, ["contenido", "bandeja", "controlado"]) &&
        !incluye(base, ["no contenido", "sin contencion"])) ||
      (respuestaDerrameNoContenido ? false : undefined)
    : undefined;

  if (!derrame && !residuo && !sustancia && !suelo && !agua && !aire && !comunidad) {
    return undefined;
  }

  return {
    existeAspectoAmbiental: true,
    existeImpactoAmbiental: derrame && (suelo || agua) && contenido === false,
    riesgoImpactoAmbiental: derrame && (suelo || agua) ? "alto" : aire || residuo || sustancia ? "medio" : "bajo",
    afectaSuelo: suelo,
    afectaAgua: agua,
    afectaAire: aire,
    afectaComunidad: comunidad,
    derrameOFuga: derrame,
    sustanciaPeligrosa: sustancia,
    residuoPeligroso: residuo,
    contenido,
    requiereContencion: respuestaContencion || (derrame && contenido === false),
    requiereNotificacion: respuestaContencion || (derrame && (suelo || agua) && contenido === false),
  };
}

function datosLegalesDesdeReporte(reporte: ReporteEvaluableMotorV2): EvaluacionInputV2["datosLegales"] {
  const respuestas = reporte.evaluacion?.respuestas;
  const base = normalizar(`${reporte.area || ""} ${reporte.descripcion || ""}`);
  const documentoProcedimiento = texto(respuestas?.["procedimiento-001"] || respuestas?.["legal-001"] || respuestas?.["documento-001"]);
  const actividadCriticaEnEjecucion =
    respuestaSi(valorRespuesta(respuestas, "procedimiento-002")) ||
    respuestaSi(valorRespuesta(respuestas, "legal-002")) ||
    respuestaSi(valorRespuesta(respuestas, "documento-002"));
  const exposicionOperacional =
    respuestaSi(valorRespuesta(respuestas, "procedimiento-003")) ||
    respuestaSi(valorRespuesta(respuestas, "legal-003"));
  const debeSuspender =
    respuestaSi(valorRespuesta(respuestas, "procedimiento-004")) ||
    respuestaSi(valorRespuesta(respuestas, "legal-004"));
  const sinControlAlternativo = respuestaNo(valorRespuesta(respuestas, "procedimiento-005"));
  const textoLegal = normalizar(`${base} ${documentoProcedimiento}`);
  const haySenalLegalTextual = incluye(base, [
    "documento",
    "documental",
    "procedimiento",
    "registro",
    "permiso",
    "ast",
    "pts",
    "ptp",
    "matriz",
    "induccion",
    "capacitacion",
    "certificado",
    "autorizacion",
  ]);
  const respuestaDocumentalNegativa =
    respuestas?.p14 === "no" ||
    respuestas?.p15 === "no" ||
    respuestas?.p16 === "no" ||
    respuestas?.p17 === "no" ||
    respuestas?.p18 === "no" ||
    respuestas?.p19 === "no";
  const documentoFaltante =
    (haySenalLegalTextual || Boolean(documentoProcedimiento)) &&
    (respuestaDocumentalNegativa ||
      incluye(textoLegal, [
        "documento faltante",
        "registro faltante",
        "procedimiento faltante",
        "sin ast",
        "sin pts",
        "sin ptp",
        "sin permiso",
        "falta ast",
        "falta pts",
        "falta procedimiento",
      ]));
  const permisoFaltante =
    (haySenalLegalTextual || Boolean(documentoProcedimiento)) &&
    (respuestas?.p20 === "no" ||
      incluye(textoLegal, ["permiso faltante", "permiso vencido", "sin permiso"]));
  const actividadRiesgosa =
    (respuestas?.p7 === "si" ||
      actividadCriticaEnEjecucion ||
      debeSuspender ||
      sinControlAlternativo) &&
    (respuestas?.p10 === "si" ||
      respuestas?.p2 === "si" ||
      respuestas?.p3 === "alta" ||
      exposicionOperacional ||
      incluye(textoLegal, ["altura", "izaje", "electrico", "espacio confinado", "excavacion"]));

  if (!documentoFaltante && !permisoFaltante) return undefined;

  return {
    documentoFaltante,
    permisoFaltante,
    procedimientoFaltante:
      (haySenalLegalTextual || Boolean(documentoProcedimiento)) &&
      (respuestas?.p14 === "no" || incluye(textoLegal, ["procedimiento faltante", "sin procedimiento"])),
    astPtpPtsFaltante: incluye(textoLegal, ["ast", "ptp", "pts"]),
    induccionFaltante: haySenalLegalTextual && respuestas?.p16 === "no",
    faltaHabilitaActividadRiesgosa: actividadRiesgosa,
  };
}

function entradaMotorV2DesdeReporte(reporte: ReporteEvaluableMotorV2): EvaluacionInputV2 {
  const respuestas = reporte.evaluacion?.respuestas || {};
  const textoBase = normalizar(`${reporte.area || ""} ${reporte.descripcion || ""}`);
  const datosAmbientales = datosAmbientalesDesdeReporte(reporte);
  const datosLegales = datosLegalesDesdeReporte(reporte);

  return {
    tipoHallazgo: texto(reporte.evaluacion?.criticidad ? "Evaluacion por preguntas" : "Reporte movil V2"),
    descripcion: texto(reporte.descripcion, "Sin descripcion"),
    area: texto(reporte.area),
    actividad: texto(reporte.area || reporte.descripcion),
    respuestas,
    ambitoDeclarado: ambitoDesdeTexto(reporte),
    exposicionPersonas: exposicionDesdeRespuestas(respuestas),
    exposicionAmbiental: datosAmbientales
      ? datosAmbientales.existeImpactoAmbiental || datosAmbientales.afectaSuelo || datosAmbientales.afectaAgua
        ? "directa"
        : "potencial"
      : undefined,
    consecuencia:
      incluye(textoBase, ["fatal", "muerte", "grave"]) && exposicionDesdeRespuestas(respuestas) === "directa"
        ? "fatal"
        : consecuenciaDesdeRespuestas(respuestas),
    probabilidad: probabilidadDesdeRespuestas(respuestas),
    controlesExistentes: controlesDesdeRespuestas(respuestas),
    requiereSuspensionDeclarada:
      (respuestas?.p9 === "no" &&
        (respuestas?.p10 === "si" || respuestas?.p2 === "si" || respuestas?.p3 === "alta")) ||
      algunaRespuesta(
        respuestas,
        [
          "altura-005",
          "electrico-004",
          "maquina-004",
          "herramienta-004",
          "izaje-004",
          "confinado-004",
          "procedimiento-004",
          "legal-004",
          "epp-004",
        ],
        respuestaSi
      ),
    datosAmbientales,
    datosLegales,
    evidenciaDisponible: Array.isArray(reporte.fotos) ? reporte.fotos.length > 0 : Boolean(reporte.gps),
  };
}

function resultadoFallback(reporte: ReporteEvaluableMotorV2): ResultadoMotorV2Seguro {
  const criticidadFinal = criticidadMotor(reporte.evaluacion?.criticidad);

  return {
    criticidadFinal,
    ambitoPrincipal: ambitoDesdeTexto(reporte) || "seguridad_laboral",
    ambitosSecundarios: [],
    tipoEvento: "condicion_subestandar",
    criticidadBase: criticidadFinal,
    justificacionTecnica: "Fallback seguro con evaluacion previa del flujo actual.",
    resumenEjecutivo: `Resultado generado con fallback seguro: ${criticidadMotorAVisual(criticidadFinal)}.`,
    medidaInmediata: texto(
      reporte.evaluacion?.accionInmediata,
      criticidadFinal === "CRITICO"
        ? "Detener o aislar la condicion critica y validar controles."
        : "Mantener control y seguimiento preventivo."
    ),
    plazoSugerido: criticidadFinal === "CRITICO" ? "Inmediato" : criticidadFinal === "ALTO" ? "24 horas" : "7 dias",
    requiereSuspension: criticidadFinal === "CRITICO",
    requiereContencionAmbiental: false,
    normativaProbable: [],
    requiereRevisionManual: false,
    senalesCriticas: [],
    factoresElevadores: [],
    factoresLimitantes: ["Motor V2 no disponible o input insuficiente."],
    inconsistencias: [],
    categoriaDetectada: "otro_indeterminado",
    moduloPreguntasSugerido: "otro_indeterminado",
    preguntasSugeridas: [],
    preguntasCriticasRespondidas: [],
    preguntasFaltantesRecomendadas: [],
    justificacionModuloPreguntas: "Fallback seguro sin seleccion adaptativa de modulo.",
    confianzaClasificacion: "baja",
    palabrasClaveDetectadas: [],
    fuenteEvaluacion: "fallback",
  };
}

export function evaluarReporteConMotorV2Seguro(
  reporteActual: ReporteEvaluableMotorV2 | null | undefined
): ResultadoMotorV2Seguro {
  if (!reporteActual) {
    return resultadoFallback({});
  }

  try {
    const input = entradaMotorV2DesdeReporte(reporteActual);
    const resultado = evaluarHallazgoV2(input);

    return {
      criticidadFinal: resultado.criticidadFinal,
      ambitoPrincipal: resultado.ambitoPrincipal,
      ambitosSecundarios: resultado.ambitosSecundarios,
      tipoEvento: resultado.tipoEvento,
      criticidadBase: resultado.criticidadBase,
      justificacionTecnica: resultado.justificacionTecnica,
      resumenEjecutivo: resultado.resumenEjecutivo,
      medidaInmediata: resultado.medidaInmediata,
      plazoSugerido: resultado.plazoSugerido,
      requiereSuspension: resultado.requiereSuspension,
      requiereContencionAmbiental: resultado.requiereContencionAmbiental,
      normativaProbable: resultado.normativaProbable,
      requiereRevisionManual: resultado.requiereRevisionManual,
      senalesCriticas: resultado.senalesCriticas,
      factoresElevadores: resultado.factoresElevadores,
      factoresLimitantes: resultado.factoresLimitantes,
      inconsistencias: resultado.inconsistencias,
      categoriaDetectada: resultado.categoriaDetectada,
      moduloPreguntasSugerido: resultado.moduloPreguntasSugerido,
      preguntasSugeridas: resultado.preguntasSugeridas,
      preguntasCriticasRespondidas: resultado.preguntasCriticasRespondidas,
      preguntasFaltantesRecomendadas: resultado.preguntasFaltantesRecomendadas,
      justificacionModuloPreguntas: resultado.justificacionModuloPreguntas,
      confianzaClasificacion: resultado.confianzaClasificacion,
      palabrasClaveDetectadas: resultado.palabrasClaveDetectadas,
      fuenteEvaluacion: "motor_v2",
    };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[motor-v2] fallback por error de evaluacion", error);
    }

    return resultadoFallback(reporteActual);
  }
}

export function aplicarResultadoMotorV2AReporte<T extends ReporteEvaluableMotorV2>(
  reporte: T,
  resultado: ResultadoMotorV2Seguro
): T {
  const criticidadVisual = criticidadMotorAVisual(resultado.criticidadFinal);

  return {
    ...reporte,
    evaluacion: {
      ...(reporte.evaluacion || {}),
      criticidad: criticidadVisual,
      prioridad: prioridadDesdeCriticidadMotorV2(resultado.criticidadFinal),
      recomendacion: resultado.resumenEjecutivo,
      accionInmediata: resultado.medidaInmediata,
      evaluacion_motor_version: resultado.fuenteEvaluacion === "motor_v2" ? "v2" : "fallback",
      ambito_principal: resultado.ambitoPrincipal,
      ambitos_secundarios: resultado.ambitosSecundarios,
      tipo_evento: resultado.tipoEvento,
      criticidad_base: resultado.criticidadBase,
      criticidad_final: resultado.criticidadFinal,
      justificacion_tecnica: resultado.justificacionTecnica,
      resumen_ejecutivo: resultado.resumenEjecutivo,
      medida_inmediata_v2: resultado.medidaInmediata,
      plazo_sugerido_v2: resultado.plazoSugerido,
      requiere_suspension: resultado.requiereSuspension,
      requiere_contencion_ambiental: resultado.requiereContencionAmbiental,
      requiere_revision_manual: resultado.requiereRevisionManual,
      normativa_probable: resultado.normativaProbable,
      senales_criticas: resultado.senalesCriticas,
      factores_elevadores: resultado.factoresElevadores,
      factores_limitantes: resultado.factoresLimitantes,
      inconsistencias: resultado.inconsistencias,
      categoria_detectada: resultado.categoriaDetectada,
      modulo_preguntas_sugerido: resultado.moduloPreguntasSugerido,
      preguntas_sugeridas: resultado.preguntasSugeridas,
      preguntas_criticas_respondidas: resultado.preguntasCriticasRespondidas,
      preguntas_faltantes_recomendadas: resultado.preguntasFaltantesRecomendadas,
      justificacion_modulo_preguntas: resultado.justificacionModuloPreguntas,
      confianza_clasificacion: resultado.confianzaClasificacion,
      palabras_clave_detectadas: resultado.palabrasClaveDetectadas,
      fuente_evaluacion: resultado.fuenteEvaluacion,
    },
  } as T;
}
