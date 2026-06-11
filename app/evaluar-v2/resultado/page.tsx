"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { navegarEvaluarV2 } from "../offlineNavigation";
import {
  aplicarResultadoMotorV2AReporte,
  evaluarReporteConMotorV2Seguro,
} from "../motor-v2/adaptadorMotorV2";
import {
  guardarReporteActualV2,
  hidratarReporteConEvidenciasLocalesV2,
  leerReporteActualV2,
  type ReporteV2Storage,
} from "../storageReporteV2";

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
          ? "Evaluación técnica Motor V2."
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
  if (valor === "seguridad_laboral") return "Seguridad laboral";
  if (valor === "salud_ocupacional") return "Salud ocupacional";
  if (valor === "medio_ambiente") return "Medio ambiente";
  if (valor === "legal_documental") return "Legal/documental";
  if (valor === "emergencia") return "Emergencia";
  if (valor === "mixto") return "Mixto";
  return "No determinado";
}

function etiquetaCategoria(valor?: string) {
  return valor
    ? valor
        .split("_")
        .filter(Boolean)
        .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
        .join(" ")
    : "No determinada";
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
    .map((pregunta) => pregunta.texto)
    .filter(Boolean)
    .join(" · ");
}

function normativaResumen(normativa: NonNullable<ReporteV2["evaluacion"]>["normativa_probable"]) {
  if (!Array.isArray(normativa) || normativa.length === 0) {
    return "Normativa probable asociada. Requiere validación legal específica antes de citar artículo definitivo.";
  }

  return normativa
    .slice(0, 3)
    .map((item) => item.norma)
    .filter(Boolean)
    .join(" · ") ||
    "Normativa probable asociada. Requiere validación legal específica antes de citar artículo definitivo.";
}

function listaResumen(items?: string[]) {
  if (!Array.isArray(items) || items.length === 0) return "Sin señales declaradas.";
  return items.slice(0, 4).join(" · ");
}

function obtenerEstiloCriticidad(criticidad: string) {
  if (criticidad === "CRÍTICO") {
    return {
      background:
        "linear-gradient(180deg, rgba(255,90,90,0.96) 0%, rgba(185,32,32,0.90) 100%)",
      border: "1px solid rgba(255,255,255,0.20)",
    };
  }

  if (criticidad === "ALTO") {
    return {
      background:
        "linear-gradient(180deg, rgba(250,173,20,0.96) 0%, rgba(196,120,12,0.90) 100%)",
      border: "1px solid rgba(255,255,255,0.20)",
    };
  }

  if (criticidad === "MEDIO") {
    return {
      background:
        "linear-gradient(180deg, rgba(24,144,255,0.96) 0%, rgba(18,90,180,0.90) 100%)",
      border: "1px solid rgba(255,255,255,0.20)",
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
  }, []);

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
    minHeight: "100vh",
    background:
      "radial-gradient(circle at 50% 0%, #2563eb 0%, #0b1f3a 42%, #061327 100%)",
    color: "white",
    fontFamily: "Arial, sans-serif",
    overflowX: "hidden" as const,
    touchAction: "pan-y" as const,
  };

  const containerStyle = {
    width: "100%",
    maxWidth: "430px",
    margin: "0 auto",
    padding: "16px 16px calc(96px + env(safe-area-inset-bottom))",
    boxSizing: "border-box" as const,
    overflowX: "hidden" as const,
    touchAction: "pan-y" as const,
  };

  const cardStyle = {
    borderRadius: "22px",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.07))",
    border: "1px solid rgba(255,255,255,0.16)",
    boxShadow: "0 18px 36px rgba(0,0,0,0.28)",
    padding: "16px",
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
    border: "none",
    borderRadius: "16px",
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
    <main
      style={pageStyle}
      onDoubleClick={(event) => {
        event.preventDefault();
      }}
    >
      <div style={containerStyle}>
        <header style={{ marginBottom: "14px" }}>
          <div
            style={{
              width: "76px",
              height: "76px",
              borderRadius: "50%",
              margin: "0 0 12px",
              backgroundImage: "url('/logo.png')",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.28)",
              boxShadow: "0 14px 28px rgba(0,0,0,0.28)",
            }}
            aria-label="Logo Criterio Estratégico"
          />
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
          <h1
            style={{
              margin: "14px 0 0",
              fontSize: "25px",
              lineHeight: 1.08,
              fontWeight: 900,
              letterSpacing: "0",
            }}
          >
            Resultado
          </h1>
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
                color: "#08172d",
                background: "linear-gradient(135deg, #67ef48 0%, #d7ff39 100%)",
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
                LECTURA TÉCNICA MOTOR V2
              </div>
              <div style={{ display: "grid", gap: "10px" }}>
                {[
                  ["Ámbito principal", etiquetaAmbito(evaluacionVisual?.ambitoPrincipal)],
                  ["Tipo evento", evaluacionVisual?.tipoEvento || "No determinado"],
                  [
                    "Categoría detectada",
                    etiquetaCategoria(evaluacionVisual?.categoriaDetectada),
                  ],
                  [
                    "Módulo sugerido",
                    etiquetaCategoria(evaluacionVisual?.moduloPreguntasSugerido),
                  ],
                  [
                    "Confianza clasificación",
                    evaluacionVisual?.confianzaClasificacion || "No determinada",
                  ],
                  [
                    "Preguntas sugeridas",
                    resumenPreguntasSugeridas(evaluacionVisual?.preguntasSugeridas),
                  ],
                  [
                    "Medida inmediata",
                    evaluacionVisual?.medidaInmediata ||
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
                  {evaluacionVisual?.justificacionTecnica ||
                    "Normativa probable asociada. Requiere validación legal específica antes de citar artículo definitivo."}
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
                  color: "#08172d",
                  background:
                    "linear-gradient(135deg, #facc15, #f97316)",
                  boxShadow: "0 14px 28px rgba(249,115,22,0.22)",
                  ...estiloFeedback("generar-informe"),
                }}
              >
                Generar informe final
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
