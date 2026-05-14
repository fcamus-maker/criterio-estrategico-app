"use client";

import { useEffect, useState } from "react";
import { preguntasEvaluacion } from "@/app/types/evaluacion";
import { useRouter } from "next/navigation";
import {
  guardarReporteActualV2,
  leerReporteActualV2,
  type ReporteV2Storage,
} from "../../storageReporteV2";

type ReporteV2 = ReporteV2Storage & {
  codigo?: string;
  supervisor?: string;
  empresa?: string;
  obra?: string;
  area?: string;
  descripcion?: string;
  evaluacion?: {
    respuestas?: Record<string, string>;
    puntaje?: number;
    criticidad?: string;
    prioridad?: string;
    recomendacion?: string;
    accionInmediata?: string;
  };
};

function vibrarOk() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(20);
  }
}

function calcularResultado(respuestas: Record<string, string>) {
  const puntaje = preguntasEvaluacion.reduce((total, pregunta) => {
    const respuesta = respuestas[pregunta.id];
    const opcion = pregunta.opciones.find((item) => item.value === respuesta);

    return total + (opcion?.score || 0);
  }, 0);

  if (puntaje >= 80) {
    return {
      puntaje,
      criticidad: "CRÍTICO",
      prioridad: "Urgente",
      recomendacion: "Detener el trabajo, controlar el área y corregir antes de continuar.",
      accionInmediata: "Suspender actividad y asegurar condición crítica.",
    };
  }

  if (puntaje >= 45) {
    return {
      puntaje,
      criticidad: "ALTO",
      prioridad: "Alta",
      recomendacion: "Corregir la condición a la brevedad y reforzar controles.",
      accionInmediata: "Restringir el área hasta implementar control inmediato.",
    };
  }

  if (puntaje >= 20) {
    return {
      puntaje,
      criticidad: "MEDIO",
      prioridad: "Media",
      recomendacion: "Programar corrección prioritaria y mantener seguimiento.",
      accionInmediata: "Controlar y supervisar la condición reportada.",
    };
  }

  return {
    puntaje,
    criticidad: "BAJO",
    prioridad: "Normal",
    recomendacion: "Mantener control y seguimiento normal del hallazgo.",
    accionInmediata: "Monitorear y corregir según programación.",
  };
}

export default function EvaluacionPaso2V2Page() {
  const router = useRouter();
  const [reporte, setReporte] = useState<ReporteV2 | null>(null);
  const [cargado, setCargado] = useState(false);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [navegando, setNavegando] = useState(false);
  const [botonActivo, setBotonActivo] = useState("");

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const reporteActual = leerReporteActualV2() as ReporteV2 | null;
      setReporte(reporteActual);
      setRespuestas(reporteActual?.evaluacion?.respuestas || {});
      setCargado(true);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const preguntas = preguntasEvaluacion.filter((p) => p.paso === 3);

  const seleccionar = (id: string, value: string) => {
    setRespuestas((actuales) => ({
      ...actuales,
      [id]: value,
    }));
    setError("");
  };

  const finalizar = () => {
    if (navegando) return;
    if (!reporte) return;

    const faltanRespuestas = preguntasEvaluacion.some(
      (pregunta) => !respuestas[pregunta.id]
    );

    if (faltanRespuestas) {
      setError("Debes responder todas las preguntas antes de ver el resultado.");
      return;
    }

    const resultado = calcularResultado(respuestas);
    const actualizado = {
      ...reporte,
      evaluacion: {
        ...(reporte.evaluacion || {}),
        respuestas,
        ...resultado,
      },
    };

    guardarReporteActualV2(actualizado);
    setNavegando(true);
    vibrarOk();
    router.push("/evaluar-v2/resultado");
  };

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
    transition: "transform 120ms ease, filter 120ms ease, box-shadow 120ms ease",
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
          <a
            href="/evaluar-v2/evaluacion/paso1"
            onClick={vibrarOk}
            {...feedbackBoton("volver-paso1")}
            style={{
              color: "white",
              textDecoration: "none",
              fontSize: "15px",
              fontWeight: 800,
              opacity: 0.9,
              display: "inline-block",
              transition: "transform 120ms ease, filter 120ms ease",
              ...estiloFeedback("volver-paso1"),
            }}
          >
            Volver al paso 1
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
            Evaluación V2
          </h1>
          <p style={{ margin: "8px 0 0", opacity: 0.75 }}>
            Paso 2 de 2 — Condición documental
          </p>
        </header>

        {!cargado && <section style={cardStyle}>Cargando evaluación...</section>}

        {cargado && !reporte && (
          <section style={cardStyle}>
            <div style={{ fontSize: "18px", fontWeight: 900, marginBottom: "12px" }}>
              No hay reporte V2 disponible
            </div>
            <a
              href="/evaluar-v2/reportar"
              onClick={vibrarOk}
              {...feedbackBoton("sin-reporte")}
              style={{
                ...buttonStyle,
                display: "block",
                textAlign: "center",
                textDecoration: "none",
                color: "#08172d",
                background: "linear-gradient(135deg, #67ef48 0%, #d7ff39 100%)",
                ...estiloFeedback("sin-reporte"),
              }}
            >
              Volver a reportar
            </a>
          </section>
        )}

        {reporte && (
          <>
            <section style={cardStyle}>
              <div style={{ fontSize: "12px", opacity: 0.65 }}>Reporte</div>
              <div style={{ fontSize: "18px", fontWeight: 900 }}>
                {reporte.codigo || "Sin código"}
              </div>
              <div style={{ marginTop: "6px", fontSize: "14px", opacity: 0.78 }}>
                {reporte.area || "Sin área"} · {reporte.empresa || "Sin empresa"}
              </div>
            </section>

            {preguntas.map((pregunta) => (
              <section key={pregunta.id} style={cardStyle}>
                <div style={{ fontSize: "12px", opacity: 0.62, marginBottom: "6px" }}>
                  Condición documental
                </div>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: 800,
                    lineHeight: 1.35,
                    marginBottom: "12px",
                  }}
                >
                  {pregunta.texto}
                </div>
                <div style={{ display: "grid", gap: "8px" }}>
                  {pregunta.opciones.map((opcion) => {
                    const activa = respuestas[pregunta.id] === opcion.value;

                    return (
                      <button
                        key={opcion.value}
                        type="button"
                        onClick={() => seleccionar(pregunta.id, opcion.value)}
                        {...feedbackBoton(`${pregunta.id}-${opcion.value}`)}
                        style={{
                          ...buttonStyle,
                          color: activa ? "#08172d" : "white",
                          background: activa
                            ? "linear-gradient(135deg, #67ef48 0%, #d7ff39 100%)"
                            : "rgba(255,255,255,0.10)",
                          border: activa
                            ? "1px solid rgba(103,239,72,0.40)"
                            : "1px solid rgba(255,255,255,0.14)",
                          textAlign: "left",
                          ...estiloFeedback(`${pregunta.id}-${opcion.value}`),
                        }}
                      >
                        {opcion.label}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}

            {error && (
              <section
                style={{
                  ...cardStyle,
                  background: "rgba(239,68,68,0.16)",
                  border: "1px solid rgba(239,68,68,0.35)",
                  fontWeight: 900,
                }}
              >
                {error}
              </section>
            )}

            <button
              type="button"
              onClick={finalizar}
              disabled={navegando}
              {...feedbackBoton("ver-resultado")}
              style={{
                ...buttonStyle,
                color: "#08172d",
                background: navegando
                  ? "rgba(255,255,255,0.18)"
                  : "linear-gradient(135deg, #facc15, #f97316)",
                boxShadow: "0 14px 28px rgba(249,115,22,0.22)",
                opacity: navegando ? 0.72 : 1,
                ...estiloFeedback("ver-resultado"),
              }}
            >
              {navegando ? "Calculando..." : "Ver resultado"}
            </button>
          </>
        )}
      </div>
    </main>
  );
}
