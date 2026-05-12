"use client";

import { useEffect, useState } from "react";

type FotoV2 = {
  id: string;
  nombre: string;
  tipo: string;
  dataUrl: string;
  fechaCarga: string;
};

type GpsV2 = {
  latitud: number;
  longitud: number;
  precisionGps: number;
  fechaHoraGeolocalizacion: string;
  estadoGeolocalizacion: string;
};

type ReporteV2 = {
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
  };
};

const STORAGE_REPORTE_ACTUAL = "ce_mobile_v2_reporte_actual";

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
      fundamento: "Evaluación por preguntas V2.",
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
      fundamento: "Evaluación automática preliminar V2 por descripción.",
    };
  }

  if (palabrasAltas.some((palabra) => texto.includes(palabra))) {
    return {
      criticidad: "ALTO",
      puntaje: undefined,
      prioridad: "Alta",
      recomendacion:
        "Corregir a la brevedad y reforzar controles preventivos.",
      fundamento: "Evaluación automática preliminar V2 por descripción.",
    };
  }

  return {
    criticidad: texto.trim() ? "MEDIO" : "BAJO",
    puntaje: undefined,
    prioridad: texto.trim() ? "Media" : "Normal",
    recomendacion:
      "Mantener seguimiento y completar evaluación de criticidad.",
    fundamento: "Evaluación automática preliminar V2 por descripción.",
  };
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

function cargarReporteActual(): ReporteV2 | null {
  try {
    const guardado = localStorage.getItem(STORAGE_REPORTE_ACTUAL);
    if (!guardado) return null;

    const reporte = JSON.parse(guardado);
    if (!reporte || typeof reporte !== "object") return null;

    return reporte;
  } catch {
    return null;
  }
}

export default function ResultadoV2Page() {
  const [reporte, setReporte] = useState<ReporteV2 | null>(null);
  const [cargado, setCargado] = useState(false);
  const [botonActivo, setBotonActivo] = useState("");
  const evaluacionVisual = reporte ? obtenerEvaluacionVisual(reporte) : null;
  const estiloCriticidad = evaluacionVisual
    ? obtenerEstiloCriticidad(evaluacionVisual.criticidad)
    : null;

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setReporte(cargarReporteActual());
      setCargado(true);
    });

    return () => window.cancelAnimationFrame(frameId);
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
            Volver a inicio V2
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
            Resultado V2
          </h1>
        </header>

        {!cargado && (
          <section style={cardStyle}>Cargando reporte V2...</section>
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
              No hay reporte V2 disponible
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
                  [
                    "Puntaje",
                    typeof evaluacionVisual?.puntaje === "number"
                      ? `${evaluacionVisual.puntaje}`
                      : "Sin puntaje",
                  ],
                  ["Prioridad", evaluacionVisual?.prioridad || "Sin prioridad"],
                  [
                    "Fotografías",
                    `${Array.isArray(reporte.fotos) ? reporte.fotos.length : 0}`,
                  ],
                  [
                    "GPS",
                    reporte.gps
                      ? `${reporte.gps.latitud}, ${reporte.gps.longitud}`
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
              <a
                href="/evaluar-v2/informe-final"
                onClick={vibrarOk}
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
              </a>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
