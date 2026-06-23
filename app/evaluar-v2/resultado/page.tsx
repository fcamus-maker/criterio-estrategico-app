"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { navegarEvaluarV2 } from "../offlineNavigation";
import {
  aplicarResultadoMotorV2AReporte,
  evaluarReporteConMotorV2Seguro,
} from "../motor-v2/adaptadorMotorV2";
import {
  construirContextoFingerprintPreventivo,
  obtenerPreguntasPaso1Preventivo,
  obtenerPreguntasPaso2Preventivo,
  ronda2PreventivaCompleta,
  VERSION_FLUJO_PREVENTIVO,
} from "../motor-v2/orquestadorPreguntasPreventivasV2";
import {
  guardarReporteActualV2,
  hidratarReporteConEvidenciasLocalesV2,
  leerReporteActualV2,
  type ReporteV2Storage,
} from "../storageReporteV2";
import {
  EtapasPremium,
  FirmaPremium,
  HeaderReportePremium,
  PremiumMobileViewport,
} from "../evaluacion/componentesPremium";

type FotoV2 = {
  id: string;
  nombre: string;
  tipo: string;
  dataUrl?: string;
  storagePath?: string;
  estadoSubida?: "pendiente" | "subiendo" | "subida" | "error";
  storagePendiente?: boolean;
  fechaCarga: string;
};

type GpsV2 = {
  latitud?: number;
  longitud?: number;
  precisionGps?: number;
  fechaHoraGeolocalizacion: string;
  estadoGeolocalizacion: string;
  motivoGeolocalizacion?: string;
};

type ReporteV2 = ReporteV2Storage & {
  codigo?: string;
  supervisor?: string;
  cargo?: string;
  empresa?: string;
  obra?: string;
  area?: string;
  descripcion?: string;
  fotos?: FotoV2[];
  gps?: GpsV2;
  estadoValidacion?: string;
  mensajeValidacion?: string;
  evaluacion?: {
    puntaje?: number;
    criticidad?: string;
    prioridad?: string;
    recomendacion?: string;
    accionInmediata?: string;
  } & ReporteV2Storage["evaluacion"];
};

function vibrarOk() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(20);
  }
}

function obtenerEvaluacionVisual(reporte: ReporteV2) {
  if (reporte.evaluacion?.criticidad) {
    return {
      criticidad: reporte.evaluacion.criticidad,
      puntaje: reporte.evaluacion.puntaje,
      prioridad: reporte.evaluacion.prioridad || "Sin prioridad",
      recomendacion:
        reporte.evaluacion.recomendacion || "Revisar controles y seguimiento.",
      fundamento:
        reporte.evaluacion.fuente_evaluacion === "motor_v2"
          ? "Resultado técnico preventivo."
          : "Evaluación por preguntas.",
      ambitoPrincipal: reporte.evaluacion.ambito_principal,
      tipoEvento: reporte.evaluacion.tipo_evento,
      categoriaDetectada: reporte.evaluacion.categoria_detectada,
      moduloPreguntasSugerido: reporte.evaluacion.modulo_preguntas_sugerido,
      preguntasSugeridas: reporte.evaluacion.preguntas_sugeridas,
      confianzaClasificacion: reporte.evaluacion.confianza_clasificacion,
      justificacionTecnica: reporte.evaluacion.justificacion_tecnica,
      medidaInmediata: reporte.evaluacion.medida_inmediata_v2,
      requiereSuspension: reporte.evaluacion.requiere_suspension,
      requiereContencionAmbiental:
        reporte.evaluacion.requiere_contencion_ambiental,
      requiereRevisionManual: reporte.evaluacion.requiere_revision_manual,
      normativaProbable: reporte.evaluacion.normativa_probable || [],
      senalesCriticas: reporte.evaluacion.senales_criticas || [],
      factoresElevadores: reporte.evaluacion.factores_elevadores || [],
      factoresLimitantes: reporte.evaluacion.factores_limitantes || [],
      fuenteEvaluacion: reporte.evaluacion.fuente_evaluacion,
    };
  }

  const texto = `${reporte.area || ""} ${reporte.descripcion || ""}`.toLowerCase();
  const palabrasCriticas = [
    "riesgo grave",
    "caída",
    "caida",
    "electricidad",
    "atropello",
    "atrapamiento",
    "incendio",
    "altura",
    "maquinaria",
    "energía",
    "energia",
  ];
  const palabrasAltas = [
    "falta de control",
    "tránsito",
    "transito",
    "segregación",
    "segregacion",
    "herramientas",
    "procedimiento",
    "exposición",
    "exposicion",
  ];

  if (palabrasCriticas.some((palabra) => texto.includes(palabra))) {
    return {
      criticidad: "CRÍTICO",
      puntaje: undefined,
      prioridad: "Urgente",
      recomendacion:
        "Detener, controlar el área y revisar medidas inmediatas antes de continuar.",
      fundamento: "Evaluación automática preliminar por descripción.",
      categoriaDetectada: undefined,
      moduloPreguntasSugerido: undefined,
      preguntasSugeridas: [],
      confianzaClasificacion: undefined,
      senalesCriticas: [],
      factoresElevadores: [],
      factoresLimitantes: [],
    };
  }

  if (palabrasAltas.some((palabra) => texto.includes(palabra))) {
    return {
      criticidad: "ALTO",
      puntaje: undefined,
      prioridad: "Alta",
      recomendacion:
        "Corregir a la brevedad y reforzar controles preventivos.",
      fundamento: "Evaluación automática preliminar por descripción.",
      categoriaDetectada: undefined,
      moduloPreguntasSugerido: undefined,
      preguntasSugeridas: [],
      confianzaClasificacion: undefined,
      senalesCriticas: [],
      factoresElevadores: [],
      factoresLimitantes: [],
    };
  }

  return {
    criticidad: texto.trim() ? "MEDIO" : "BAJO",
    puntaje: undefined,
    prioridad: texto.trim() ? "Media" : "Normal",
    recomendacion:
      "Mantener seguimiento y completar evaluación de criticidad.",
    fundamento: "Evaluación automática preliminar por descripción.",
    categoriaDetectada: undefined,
    moduloPreguntasSugerido: undefined,
    preguntasSugeridas: [],
    confianzaClasificacion: undefined,
    senalesCriticas: [],
    factoresElevadores: [],
    factoresLimitantes: [],
  };
}

function etiquetaAmbito(valor?: string) {
  return valor ? normalizarEtiquetaPreventivaVisible(valor) : "No determinado";
}

function normalizarEtiquetaPreventivaVisible(valor: string) {
  const etiquetas: Record<string, string> = {
    seguridad_laboral: "Seguridad laboral",
    salud_ocupacional: "Salud ocupacional",
    medio_ambiente: "Medio ambiente",
    legal_documental: "Legal/documental",
    emergencia: "Emergencia",
    mixto: "Mixto",
    aspecto_ambiental: "Aspecto ambiental",
    caida_altura: "Caída de altura",
    transito_caida_mismo_nivel: "Caída al mismo nivel",
    condicion_subestandar: "Condición subestándar",
    acto_inseguro: "Conducta observada",
    incendio_emergencia: "Incendio o emergencia",
    equipos_emergencia: "Equipo de emergencia",
    documental_legal: "Documental/legal",
    derrame_fuga: "Derrame o fuga",
    sustancias_peligrosas: "Sustancias peligrosas",
    herramientas_equipos: "Herramientas/equipos",
    maquinaria_equipos: "Maquinaria/equipos",
    otro_indeterminado: "Requiere revisión técnica",
  };

  return (
    etiquetas[valor] ||
    valor
      .split("_")
      .filter(Boolean)
      .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
      .join(" ")
  );
}

function etiquetaCategoria(valor?: string) {
  return valor
    ? normalizarEtiquetaPreventivaVisible(valor)
    : "No determinada";
}

function etiquetaTipoEvento(valor?: string) {
  const etiquetas: Record<string, string> = {
    condicion_subestandar: "Condición subestándar",
    acto_inseguro: "Conducta observada",
    cuasi_accidente: "Incidente sin lesión",
    accidente: "Accidente",
    ambiental: "Evento ambiental",
    aspecto_ambiental: "Aspecto ambiental",
    documental: "Brecha documental",
    otro: "No determinado",
  };

  return valor ? etiquetas[valor] || etiquetaCategoria(valor) : "No determinado";
}

function limpiarTextoVisible(valor?: string) {
  if (!valor) return "";
  return valor
    .replace(/Motor V2/gi, "evaluación preventiva")
    .replace(/motor_v2/gi, "evaluación preventiva")
    .replace(/router/gi, "clasificación preventiva")
    .replace(/taxonom[ií]a/gi, "clasificación preventiva")
    .replace(/fallback/gi, "respaldo operativo")
    .replace(/shadow/gi, "validación interna")
    .replace(/preview/gi, "validación interna")
    .replace(/\baspecto_ambiental\b/g, "Aspecto ambiental")
    .replace(/\bmedio_ambiente\b/g, "Medio ambiente")
    .replace(/\bcondicion_subestandar\b/g, "Condición subestándar")
    .replace(/\bderrame_fuga\b/g, "Derrame o fuga")
    .replace(/Base\s+CR[IÍ]TICO;?\s*final\s+CR[IÍ]TICO\.?/gi, "Nivel de criticidad: Crítico.")
    .replace(/Base\s+ALTO;?\s*final\s+ALTO\.?/gi, "Nivel de criticidad: Alto.")
    .replace(/Base\s+MEDIO;?\s*final\s+MEDIO\.?/gi, "Nivel de criticidad: Medio.")
    .replace(/Base\s+BAJO;?\s*final\s+BAJO\.?/gi, "Nivel de criticidad: Bajo.")
    .replace(/\b[a-z]+(?:_[a-z0-9]+)+\b/g, (coincidencia) =>
      normalizarEtiquetaPreventivaVisible(coincidencia)
    );
}

function etiquetaSuficiencia(valor?: string) {
  if (valor === "alta") return "Alta";
  if (valor === "media") return "Media";
  if (valor === "baja") return "Requiere más antecedentes";
  return "No determinada";
}

function textoSeguro(valor?: string) {
  const limpio = limpiarTextoVisible(valor);
  if (!limpio) return "";
  return limpio
    .split("\n")
    .map((linea) => limpiarTextoVisible(linea))
    .join("\n");
}

function etiquetaSiNo(valor?: boolean) {
  return valor ? "Sí" : "No";
}

function resumenPreguntasSugeridas(
  preguntas?: NonNullable<ReporteV2["evaluacion"]>["preguntas_sugeridas"]
) {
  if (!Array.isArray(preguntas) || preguntas.length === 0) return "Sin preguntas sugeridas";
  return preguntas
    .slice(0, 3)
    .map((pregunta) => limpiarTextoVisible(pregunta.texto))
    .filter(Boolean)
    .join(" · ");
}

function normativaResumen(normativa: NonNullable<ReporteV2["evaluacion"]>["normativa_probable"]) {
  if (!Array.isArray(normativa) || normativa.length === 0) {
    return "Marco legal/preventivo probable asociado. Requiere validación legal específica antes de citar artículo definitivo.";
  }

  return normativa
    .slice(0, 3)
    .map((item) => item.norma)
    .filter(Boolean)
    .join(" · ") ||
    "Marco legal/preventivo probable asociado. Requiere validación legal específica antes de citar artículo definitivo.";
}

function listaResumen(items?: string[]) {
  if (!Array.isArray(items) || items.length === 0) return "Sin señales declaradas.";
  return items.slice(0, 4).map((item) => limpiarTextoVisible(item)).join(" · ");
}

function valorRespuestaPreventiva(
  reporte: ReporteV2,
  respuestas: Record<string, string>,
  id: string
) {
  if (id === "transversal_anclaje_riesgo_especifico") {
    return respuestas[id] || reporte.evaluacion?.riesgo_especifico_detectado || "";
  }

  return respuestas[id] || "";
}

function flujoPreventivoListoParaResultado(reporte: ReporteV2) {
  const flujo = reporte.evaluacion?.flujo_preventivo;
  if (flujo?.modo !== "preventivo") return true;
  if (flujo.version !== VERSION_FLUJO_PREVENTIVO) return false;
  if (flujo.ronda1Completa !== true || flujo.ronda2Completa !== true) return false;
  if (!flujo.familiaPrincipal) return false;

  const respuestas = reporte.evaluacion?.respuestas || {};
  const fingerprintActual = construirContextoFingerprintPreventivo(reporte, respuestas);
  if (flujo.contextoFingerprint !== fingerprintActual) return false;

  const preguntasPaso1 = obtenerPreguntasPaso1Preventivo();
  const preguntasPaso2 = obtenerPreguntasPaso2Preventivo(reporte, respuestas);
  const ronda1Completa =
    preguntasPaso1.length === 5 &&
    preguntasPaso1.every((pregunta) =>
      Boolean(valorRespuestaPreventiva(reporte, respuestas, pregunta.id).trim())
    );

  return ronda1Completa && ronda2PreventivaCompleta(preguntasPaso2, respuestas);
}

function obtenerEstiloCriticidad(criticidad: string) {
  if (criticidad === "CRÍTICO") {
    return {
      background:
        "linear-gradient(180deg, rgba(190,24,45,0.98) 0%, rgba(88,12,24,0.94) 100%)",
      border: "1px solid rgba(255,164,164,0.38)",
      boxShadow: "0 18px 36px rgba(127,29,29,0.36)",
    };
  }

  if (criticidad === "ALTO") {
    return {
      background:
        "linear-gradient(180deg, rgba(249,115,22,0.98) 0%, rgba(194,65,12,0.92) 100%)",
      border: "1px solid rgba(255,190,128,0.42)",
      boxShadow: "0 18px 36px rgba(194,65,12,0.34)",
    };
  }

  if (criticidad === "MEDIO") {
    return {
      background:
        "linear-gradient(180deg, rgba(234,179,8,0.96) 0%, rgba(161,98,7,0.90) 100%)",
      border: "1px solid rgba(253,224,71,0.34)",
      boxShadow: "0 18px 36px rgba(161,98,7,0.28)",
    };
  }

  return {
    background:
      "linear-gradient(180deg, rgba(34,197,94,0.95) 0%, rgba(21,128,61,0.90) 100%)",
    border: "1px solid rgba(255,255,255,0.20)",
  };
}

export default function ResultadoV2Page() {
  const router = useRouter();
  const [reporte, setReporte] = useState<ReporteV2 | null>(null);
  const [cargado, setCargado] = useState(false);
  const [botonActivo, setBotonActivo] = useState("");
  const evaluacionVisual = reporte ? obtenerEvaluacionVisual(reporte) : null;
  const estiloCriticidad = evaluacionVisual
    ? obtenerEstiloCriticidad(evaluacionVisual.criticidad)
    : null;

  useEffect(() => {
    let activo = true;
    const frameId = window.requestAnimationFrame(async () => {
      const reporteActual = leerReporteActualV2();
      const hidratado = reporteActual
        ? await hidratarReporteConEvidenciasLocalesV2(reporteActual)
        : null;

      if (!activo) return;
      const reporteHidratado = hidratado as ReporteV2 | null;
      if (reporteHidratado && !flujoPreventivoListoParaResultado(reporteHidratado)) {
        navegarEvaluarV2(router, "/evaluar-v2/evaluacion/paso2?ce_selector_preventivo=1");
        return;
      }

      const reporteEvaluado = reporteHidratado
        ? aplicarResultadoMotorV2AReporte(
            reporteHidratado,
            evaluarReporteConMotorV2Seguro(reporteHidratado)
          )
        : null;

      if (reporteEvaluado) {
        guardarReporteActualV2(reporteEvaluado);
      }

      setReporte(reporteEvaluado);
      setCargado(true);
    });

    return () => {
      activo = false;
      window.cancelAnimationFrame(frameId);
    };
  }, [router]);

  const feedbackBoton = (id: string) => ({
    onPointerDown: () => setBotonActivo(id),
    onPointerUp: () => setBotonActivo(""),
    onPointerCancel: () => setBotonActivo(""),
    onPointerLeave: () => setBotonActivo(""),
  });

  const estiloFeedback = (id: string) =>
    botonActivo === id
      ? {
          transform: "translateY(2px) scale(0.985)",
          filter: "brightness(1.12)",
          boxShadow: "0 8px 16px rgba(0,0,0,0.28)",
        }
      : {};

  const pageStyle = {
    minHeight: "100dvh",
    backgroundColor: "#020b1f",
    background:
      "radial-gradient(circle at 22% 12%, rgba(60,130,220,0.46) 0%, rgba(7,32,68,0.92) 31%, rgba(2,12,32,1) 72%), linear-gradient(180deg, #05244a 0%, #020b1f 100%)",
    color: "white",
    fontFamily: "Arial, sans-serif",
    overflowX: "hidden" as const,
    overscrollBehaviorY: "none" as const,
    touchAction: "pan-y" as const,
  };

  const containerStyle = {
    width: "100%",
    maxWidth: "430px",
    margin: "0 auto",
    minHeight: "100dvh",
    padding:
      "calc(12px + env(safe-area-inset-top)) 15px calc(34px + env(safe-area-inset-bottom))",
    boxSizing: "border-box" as const,
    overflowX: "hidden" as const,
    overscrollBehaviorY: "contain" as const,
    touchAction: "pan-y" as const,
  };

  const cardStyle = {
    borderRadius: "18px",
    background:
      "linear-gradient(180deg, rgba(22,72,124,0.66), rgba(4,26,60,0.78))",
    border: "1px solid rgba(151,197,255,0.30)",
    boxShadow:
      "0 18px 42px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.11), inset 0 -1px 0 rgba(33,150,243,0.10)",
    padding: "14px",
    boxSizing: "border-box" as const,
    maxWidth: "100%",
    overflowX: "hidden" as const,
    marginBottom: "14px",
  };

  const buttonStyle = {
    display: "block",
    width: "100%",
    maxWidth: "100%",
    fontSize: "16px",
    touchAction: "manipulation" as const,
    border: "1px solid rgba(128,184,255,0.50)",
    borderRadius: "18px",
    padding: "14px",
    fontWeight: 900,
    cursor: "pointer",
    boxSizing: "border-box" as const,
    textAlign: "center" as const,
    textDecoration: "none",
    transition: "transform 120ms ease, filter 120ms ease, box-shadow 120ms ease",
  };

  const datoStyle = {
    borderRadius: "14px",
    background: "rgba(255,255,255,0.08)",
    padding: "11px 12px",
    boxSizing: "border-box" as const,
  };

  return (
    <>
      <PremiumMobileViewport />
      <main
        style={pageStyle}
        onDoubleClick={(event) => {
          event.preventDefault();
        }}
      >
      <div style={containerStyle}>
        <HeaderReportePremium
          subtitulo="Hallazgo técnico"
          detalle="Resultado preventivo generado desde respuestas y señales críticas."
        />
        <EtapasPremium actual={3} />
        <header style={{ marginBottom: "14px" }}>
          <a
            href="/evaluar-v2"
            onClick={vibrarOk}
            {...feedbackBoton("inicio")}
            style={{
              color: "white",
              textDecoration: "none",
              fontSize: "15px",
              fontWeight: 800,
              opacity: 0.9,
              display: "inline-block",
              transition: "transform 120ms ease, filter 120ms ease",
              ...estiloFeedback("inicio"),
            }}
          >
            Volver a inicio
          </a>
        </header>

        {!cargado && (
          <section style={cardStyle}>Cargando reporte...</section>
        )}

        {cargado && !reporte && (
          <section style={cardStyle}>
            <div
              style={{
                fontSize: "18px",
                fontWeight: 900,
                marginBottom: "12px",
              }}
            >
              No hay reporte disponible
            </div>
            <a
              href="/evaluar-v2/reportar"
              onClick={vibrarOk}
              {...feedbackBoton("volver")}
              style={{
                ...buttonStyle,
                color: "white",
                background:
                  "linear-gradient(180deg, #2593ff 0%, #145ee9 48%, #07339b 100%)",
                ...estiloFeedback("volver"),
              }}
            >
              Volver
            </a>
          </section>
        )}

        {reporte && (
          <>
            <section
              style={{
                ...cardStyle,
                ...(estiloCriticidad || {}),
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 900,
                  opacity: 0.82,
                  marginBottom: "8px",
                }}
              >
                CRITICIDAD / EVALUACIÓN
              </div>
              <div style={{ fontSize: "42px", fontWeight: 900, lineHeight: 1 }}>
                {evaluacionVisual?.criticidad || "SIN EVALUAR"}
              </div>
              <div style={{ marginTop: "8px", fontSize: "15px", fontWeight: 900 }}>
                Prioridad: {evaluacionVisual?.prioridad || "Sin prioridad"}
              </div>
              <div style={{ marginTop: "8px", fontSize: "13px", lineHeight: 1.45 }}>
                {evaluacionVisual?.recomendacion ||
                  "Completar evaluación para generar recomendación."}
              </div>
              <div style={{ marginTop: "10px", fontSize: "12px", opacity: 0.78 }}>
                {evaluacionVisual?.fundamento || "Evaluación pendiente."}
              </div>
            </section>

            <section style={cardStyle}>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 900,
                  opacity: 0.7,
                  marginBottom: "8px",
                }}
              >
                CLASIFICACIÓN PREVENTIVA
              </div>
              <div style={{ display: "grid", gap: "10px" }}>
                {[
                  ["Ámbito principal", etiquetaAmbito(evaluacionVisual?.ambitoPrincipal)],
                  ["Tipo de hallazgo", etiquetaTipoEvento(evaluacionVisual?.tipoEvento)],
                  [
                    "Categoría preventiva",
                    etiquetaCategoria(evaluacionVisual?.categoriaDetectada),
                  ],
                  [
                    "Clasificación preventiva",
                    etiquetaCategoria(evaluacionVisual?.moduloPreguntasSugerido),
                  ],
                  [
                    "Nivel de suficiencia",
                    etiquetaSuficiencia(evaluacionVisual?.confianzaClasificacion),
                  ],
                  [
                    "Preguntas sugeridas",
                    resumenPreguntasSugeridas(evaluacionVisual?.preguntasSugeridas),
                  ],
                  [
                    "Medida inmediata",
                    textoSeguro(evaluacionVisual?.medidaInmediata) ||
                      evaluacionVisual?.recomendacion ||
                      "Sin medida definida",
                  ],
                  [
                    "Requiere suspensión",
                    etiquetaSiNo(evaluacionVisual?.requiereSuspension),
                  ],
                  [
                    "Requiere contención ambiental",
                    etiquetaSiNo(evaluacionVisual?.requiereContencionAmbiental),
                  ],
                  [
                    "Revisión manual",
                    etiquetaSiNo(evaluacionVisual?.requiereRevisionManual),
                  ],
                  [
                    "Señales críticas reales",
                    listaResumen(evaluacionVisual?.senalesCriticas),
                  ],
                  [
                    "Factores elevadores",
                    listaResumen(evaluacionVisual?.factoresElevadores),
                  ],
                  [
                    "Factores limitantes",
                    listaResumen(evaluacionVisual?.factoresLimitantes),
                  ],
                  [
                    "Normativa probable",
                    normativaResumen(evaluacionVisual?.normativaProbable),
                  ],
                ].map(([label, valor]) => (
                  <div key={label} style={datoStyle}>
                    <div style={{ fontSize: "11px", opacity: 0.62 }}>
                      {label}
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: 800, lineHeight: 1.35 }}>
                      {valor}
                    </div>
                  </div>
                ))}
                <div style={{ fontSize: "12px", lineHeight: 1.45, opacity: 0.78 }}>
                  {textoSeguro(evaluacionVisual?.justificacionTecnica) ||
                    "Marco legal/preventivo probable asociado. Requiere validación legal específica antes de citar artículo definitivo."}
                </div>
              </div>
            </section>

            <section style={cardStyle}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: "10px",
                }}
              >
                {[
                  ["Código", reporte.codigo || "Sin código"],
                  ["Supervisor", reporte.supervisor || "Sin supervisor"],
                  ["Empresa", reporte.empresa || "Sin empresa"],
                  ["Obra", reporte.obra || "Sin obra"],
                  ["Área", reporte.area || "Sin área"],
                  ["Descripción", reporte.descripcion || "Sin descripción"],
                  ["Criticidad", evaluacionVisual?.criticidad || "Sin evaluar"],
                  ["Prioridad", evaluacionVisual?.prioridad || "Sin prioridad"],
                  [
                    "Fotografías",
                    `${Array.isArray(reporte.fotos) ? reporte.fotos.length : 0}`,
                  ],
                  [
                    "GPS",
                    reporte.gps &&
                    typeof reporte.gps.latitud === "number" &&
                    typeof reporte.gps.longitud === "number"
                      ? `${reporte.gps.latitud}, ${reporte.gps.longitud}`
                      : reporte.gps?.estadoGeolocalizacion
                        ? `Sin coordenadas · ${reporte.gps.estadoGeolocalizacion}`
                        : "Sin GPS",
                  ],
                ].map(([label, valor]) => (
                  <div key={label} style={datoStyle}>
                    <div style={{ fontSize: "11px", opacity: 0.62 }}>
                      {label}
                    </div>
                    <div style={{ fontSize: "15px", fontWeight: 800 }}>
                      {valor}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div style={{ display: "grid", gap: "10px" }}>
              <a
                href="/evaluar-v2/evaluacion/paso2"
                onClick={vibrarOk}
                {...feedbackBoton("volver-evaluacion")}
                style={{
                  ...buttonStyle,
                  color: "white",
                  background: "rgba(255,255,255,0.14)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  ...estiloFeedback("volver-evaluacion"),
                }}
              >
                Volver a evaluación
              </a>
              <button
                type="button"
                onClick={() => {
                  vibrarOk();
                  navegarEvaluarV2(router, "/evaluar-v2/informe-final");
                }}
                {...feedbackBoton("generar-informe")}
                style={{
                  ...buttonStyle,
                  color: "white",
                  background:
                    "linear-gradient(180deg, #2593ff 0%, #145ee9 48%, #07339b 100%)",
                  boxShadow:
                    "0 20px 36px rgba(15,94,255,0.42), inset 0 1px 0 rgba(255,255,255,0.30), inset 0 -10px 24px rgba(0,18,94,0.30)",
                  ...estiloFeedback("generar-informe"),
                }}
              >
                Generar informe final
              </button>
            </div>
          </>
        )}
        <FirmaPremium />
      </div>
      </main>
    </>
  );
}
