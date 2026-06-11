"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { navegarEvaluarV2 } from "../../offlineNavigation";
import {
  aplicarResultadoMotorV2AReporte,
  evaluarReporteConMotorV2Seguro,
} from "../../motor-v2/adaptadorMotorV2";
import {
  obtenerFormularioAdaptativoV2,
  puntajeRespuestasAdaptativasV2,
  type PreguntaFormularioAdaptativaV2,
} from "../../motor-v2/formularioAdaptativoV2";
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
  } & ReporteV2Storage["evaluacion"];
};

function vibrarOk() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(20);
  }
}

function calcularResultado(puntaje: number) {
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

  const formularioAdaptativo = reporte ? obtenerFormularioAdaptativoV2(reporte) : null;
  const preguntas = formularioAdaptativo?.preguntas.filter((pregunta) => pregunta.paso === 2) || [];
  const totalPreguntas = formularioAdaptativo?.preguntas.length || 0;

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

    const faltanRespuestas = (formularioAdaptativo?.preguntas || []).some(
      (pregunta) => !respuestas[pregunta.id]
    );

    if (faltanRespuestas) {
      setError("Debes responder todas las preguntas antes de ver el resultado.");
      return;
    }

    const puntajeAdaptativo = formularioAdaptativo
      ? puntajeRespuestasAdaptativasV2(formularioAdaptativo.preguntas, respuestas)
      : 0;
    const resultado = {
      ...calcularResultado(puntajeAdaptativo),
      puntaje: puntajeAdaptativo,
    };
    const clasificacion = formularioAdaptativo?.clasificacion;
    const reporteConResultadoAnterior = {
      ...reporte,
      evaluacion: {
        ...(reporte.evaluacion || {}),
        respuestas,
        categoria_detectada: clasificacion?.categoriaDetectada,
        modulo_preguntas_sugerido: clasificacion?.moduloPreguntasSugerido,
        preguntas_sugeridas: formularioAdaptativo?.preguntas,
        preguntas_faltantes_recomendadas: formularioAdaptativo?.preguntas,
        justificacion_modulo_preguntas: clasificacion?.justificacionModuloPreguntas,
        confianza_clasificacion: clasificacion?.confianza,
        palabras_clave_detectadas: clasificacion?.palabrasClaveDetectadas,
        ...resultado,
      },
    };
    const resultadoMotorV2 = evaluarReporteConMotorV2Seguro(
      reporteConResultadoAnterior
    );
    const actualizado = aplicarResultadoMotorV2AReporte(
      reporteConResultadoAnterior,
      resultadoMotorV2
    );

    guardarReporteActualV2(actualizado);
    setNavegando(true);
    vibrarOk();
    navegarEvaluarV2(router, "/evaluar-v2/resultado");
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

  const etiquetaCategoria = (valor?: string) =>
    valor
      ? valor
          .split("_")
          .filter(Boolean)
          .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
          .join(" ")
      : "No determinada";

  const renderPregunta = (pregunta: PreguntaFormularioAdaptativaV2) => (
    <section key={pregunta.id} style={cardStyle}>
      <div style={{ fontSize: "12px", opacity: 0.62, marginBottom: "6px" }}>
        {etiquetaCategoria(pregunta.modulo)}
      </div>
      <div
        style={{
          fontSize: "16px",
          fontWeight: 800,
          lineHeight: 1.35,
          marginBottom: "8px",
        }}
      >
        {pregunta.texto}
      </div>
      <div style={{ fontSize: "12px", lineHeight: 1.4, opacity: 0.7, marginBottom: "12px" }}>
        {pregunta.objetivo}
      </div>
      {pregunta.tipoRespuesta === "texto" ? (
        <textarea
          value={respuestas[pregunta.id] || ""}
          onChange={(event) => seleccionar(pregunta.id, event.target.value)}
          placeholder="Escribe una respuesta breve"
          rows={3}
          style={{
            width: "100%",
            resize: "vertical",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: "16px",
            padding: "13px",
            boxSizing: "border-box",
            color: "white",
            background: "rgba(255,255,255,0.10)",
            fontSize: "15px",
            fontWeight: 700,
            outline: "none",
          }}
        />
      ) : (
        <div style={{ display: "grid", gap: "8px" }}>
          {(Array.isArray(pregunta.opciones) ? pregunta.opciones : []).map((opcion) => {
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
      )}
    </section>
  );

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
            Evaluación
          </h1>
          <p style={{ margin: "8px 0 0", opacity: 0.75 }}>
            Paso 2 de 2 — Señales específicas
          </p>
        </header>

        {!cargado && <section style={cardStyle}>Cargando evaluación...</section>}

        {cargado && !reporte && (
          <section style={cardStyle}>
            <div style={{ fontSize: "18px", fontWeight: 900, marginBottom: "12px" }}>
              No hay reporte disponible
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
              {formularioAdaptativo && (
                <div
                  style={{
                    marginTop: "12px",
                    padding: "10px",
                    borderRadius: "14px",
                    background: "rgba(103,239,72,0.10)",
                    border: "1px solid rgba(103,239,72,0.20)",
                    fontSize: "12px",
                    lineHeight: 1.45,
                  }}
                >
                  <strong>Módulo:</strong>{" "}
                  {etiquetaCategoria(formularioAdaptativo.clasificacion.moduloPreguntasSugerido)}
                  <br />
                  <strong>Confianza:</strong> {formularioAdaptativo.clasificacion.confianza}
                  <br />
                  {formularioAdaptativo.clasificacion.justificacionModuloPreguntas}
                </div>
              )}
            </section>

            {preguntas.map(renderPregunta)}

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
              {navegando
                ? "Calculando..."
                : `Ver resultado (${preguntas.length}/${totalPreguntas})`}
            </button>
          </>
        )}
      </div>
    </main>
  );
}
