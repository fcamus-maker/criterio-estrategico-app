"use client";

import { useEffect, useMemo, useState } from "react";
import preguntasEvaluacion from "../../types/evaluacion";

export default function Paso3() {
  const [hallazgo, setHallazgo] = useState<any>(null);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("hallazgos") || "[]");
    if (data.length > 0) {
      setHallazgo(data[data.length - 1]);
    }
  }, []);

  const resultado = useMemo(() => {
    if (!hallazgo) return null;

    const respuestas = hallazgo.evaluacion?.respuestas || {};
    let puntaje = 0;

    Object.entries(respuestas).forEach(([preguntaId, valor]) => {
      const pregunta = preguntasEvaluacion.find((p) => p.id === preguntaId);
      if (!pregunta) return;

      const opcion = pregunta.opciones.find((o) => o.value === valor);
      if (!opcion) return;

      puntaje += opcion.score;
    });

    let nivel = "BAJO";
    let subtitulo = "RIESGO CONTROLABLE";
    let prioridad = "Normal";
    let recomendacion = [
      "Mantener control y seguimiento del hallazgo.",
      "Corregir dentro de programación normal.",
      "Verificar cierre y registro.",
    ];
    let accion = "Monitorear y corregir.";
    let fondoCriticidad =
      "linear-gradient(180deg, rgba(34,197,94,0.95) 0%, rgba(21,128,61,0.90) 100%)";
    let colorIcono = "#22c55e";
    let iconoNivel = "🟢";
    let colorSubtitulo = "#dcfce7";
    let colorBoton =
      "linear-gradient(180deg, rgba(34,197,94,0.95) 0%, rgba(21,128,61,0.90) 100%)";

    if (puntaje >= 80) {
      nivel = "CRÍTICO";
      subtitulo = "RIESGO ALTO / URGENTE";
      prioridad = "Alta / Urgente";
      recomendacion = [
        "Detener inmediatamente el trabajo y área afectada.",
        "Investigar raíz del problema y corregir antes de reanudar.",
        "Implementar medidas preventivas adicionales para evitar repetición.",
      ];
      accion = "Suspender trabajo y evacuar personal a zona segura.";
      fondoCriticidad =
        "linear-gradient(180deg, rgba(255,90,90,0.96) 0%, rgba(185,32,32,0.90) 100%)";
      colorIcono = "#a8071a";
      iconoNivel = "⚠️";
      colorSubtitulo = "#ffd666";
      colorBoton =
        "linear-gradient(180deg, rgba(255,90,90,0.96) 0%, rgba(185,32,32,0.90) 100%)";
    } else if (puntaje >= 45) {
      nivel = "ALTO";
      subtitulo = "RIESGO ALTO";
      prioridad = "Alta";
      recomendacion = [
        "Corregir la condición a la brevedad.",
        "Aplicar controles inmediatos antes de continuar.",
        "Supervisar cumplimiento de medidas correctivas.",
      ];
      accion = "Restringir área y corregir antes de continuar.";
      fondoCriticidad =
        "linear-gradient(180deg, rgba(250,173,20,0.96) 0%, rgba(196,120,12,0.90) 100%)";
      colorIcono = "#d97706";
      iconoNivel = "🟠";
      colorSubtitulo = "#fff7d6";
      colorBoton =
        "linear-gradient(180deg, rgba(250,173,20,0.96) 0%, rgba(196,120,12,0.90) 100%)";
    } else if (puntaje >= 20) {
      nivel = "MEDIO";
      subtitulo = "RIESGO RELEVANTE";
      prioridad = "Media";
      recomendacion = [
        "Programar corrección prioritaria.",
        "Mantener seguimiento del hallazgo.",
        "Verificar eficacia de las medidas aplicadas.",
      ];
      accion = "Corregir y supervisar.";
      fondoCriticidad =
        "linear-gradient(180deg, rgba(24,144,255,0.96) 0%, rgba(18,90,180,0.90) 100%)";
      colorIcono = "#1890ff";
      iconoNivel = "🔵";
      colorSubtitulo = "#dbeafe";
      colorBoton =
        "linear-gradient(180deg, rgba(24,144,255,0.96) 0%, rgba(18,90,180,0.90) 100%)";
    }

    return {
      puntaje,
      nivel,
      subtitulo,
      prioridad,
      recomendacion,
      accion,
      fondoCriticidad,
      colorIcono,
      iconoNivel,
      colorSubtitulo,
      colorBoton,
      codigo: hallazgo?.codigo || "CE-0001",
      fecha: hallazgo?.reporte?.fecha || "-",
      responsable: hallazgo?.reporte?.responsable || "-",
    };
  }, [hallazgo]);

  if (!resultado) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background:
            "radial-gradient(circle at top, #1f4fa3 0%, #0b1f3a 42%, #08172d 100%)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Arial, sans-serif",
        }}
      >
        Cargando resultado...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #1f4fa3 0%, #0b1f3a 42%, #08172d 100%)",
        padding: "20px 14px 30px 14px",
        color: "white",
        fontFamily: "Arial, sans-serif",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: "520px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "18px",
            opacity: 0.95,
          }}
        >
          <span
            style={{ fontSize: "22px", cursor: "pointer" }}
            onClick={() => (window.location.href = "/")}
          >
            ‹
          </span>
          <span style={{ fontSize: "20px" }}>🏠</span>
          <span style={{ fontSize: "17px", fontWeight: 700 }}>
            Criterio Estratégico
          </span>
        </div>

        <h2
          style={{
            textAlign: "center",
            marginBottom: "16px",
            fontSize: "20px",
            fontWeight: 700,
          }}
        >
          Resultado Final de Criticidad
        </h2>

        <div
          style={{
            background: resultado.fondoCriticidad,
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
            marginBottom: "16px",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <div
            style={{
              padding: "14px 16px",
              textAlign: "center",
              fontSize: "14px",
              fontWeight: 700,
              letterSpacing: "0.5px",
              borderBottom: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            NIVEL DE CRITICIDAD
          </div>

          <div style={{ padding: "18px 18px 16px 18px", textAlign: "center" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                marginBottom: "8px",
              }}
            >
              <div
                style={{
                  fontSize: "44px",
                  fontWeight: 800,
                  lineHeight: 1,
                }}
              >
                {resultado.nivel}
              </div>

              {resultado.nivel === "CRÍTICO" && (
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: "#a8071a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    color: "white",
                    fontSize: "24px",
                    boxShadow: "0 0 18px rgba(168,7,26,0.95)",
                  }}
                >
                  !
                </div>
              )}
            </div>

            <div
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: resultado.colorSubtitulo,
                marginBottom: "16px",
                letterSpacing: "0.4px",
              }}
            >
              {resultado.subtitulo}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                gap: "2px",
                background: "rgba(255,255,255,0.1)",
                borderRadius: "10px",
                overflow: "hidden",
              }}
            >
              {["Bajo", "Medio", "Alto", "Crítico"].map((item) => {
                const activo =
                  item.toUpperCase() === resultado.nivel ||
                  (item === "Crítico" && resultado.nivel === "CRÍTICO");

                return (
                  <div
                    key={item}
                    style={{
                      padding: "10px 6px",
                      fontSize: "14px",
                      textAlign: "center",
                      background: activo
                        ? "rgba(255,255,255,0.22)"
                        : "rgba(0,0,0,0.18)",
                      fontWeight: activo ? 700 : 500,
                    }}
                  >
                    {item}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div
          style={{
            background: "rgba(52, 110, 220, 0.35)",
            borderRadius: "18px",
            overflow: "hidden",
            marginBottom: "14px",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 10px 25px rgba(0,0,0,0.22)",
          }}
        >
          <div
            style={{
              padding: "14px 18px",
              fontSize: "16px",
              fontWeight: 700,
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            Recomendación Automática
          </div>

          <div style={{ padding: "16px 18px" }}>
            {resultado.recomendacion.map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom: i === resultado.recomendacion.length - 1 ? 0 : 12,
                  lineHeight: 1.35,
                  fontSize: "15px",
                }}
              >
                <span>✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            background: "rgba(52, 110, 220, 0.32)",
            borderRadius: "18px",
            overflow: "hidden",
            marginBottom: "14px",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 10px 25px rgba(0,0,0,0.22)",
          }}
        >
          <div
            style={{
              padding: "14px 18px",
              fontSize: "16px",
              fontWeight: 700,
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            Acción Inmediata Sugerida
          </div>

          <div
            style={{
              padding: "16px 18px",
              fontSize: "15px",
              display: "flex",
              gap: "10px",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "22px" }}>{resultado.iconoNivel}</span>
            <span>{resultado.accion}</span>
          </div>
        </div>

        <div
          style={{
            background: "rgba(52, 110, 220, 0.28)",
            borderRadius: "18px",
            overflow: "hidden",
            marginBottom: "20px",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 10px 25px rgba(0,0,0,0.22)",
          }}
        >
          <div
            style={{
              padding: "14px 18px 10px 18px",
              fontSize: "15px",
              fontWeight: 700,
            }}
          >
            ⚠️ Prioridad: {resultado.prioridad}
          </div>

          <div
            style={{
              padding: "10px 18px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              fontSize: "15px",
            }}
          >
            📋 Código Reporte: {resultado.codigo}
          </div>

          <div
            style={{
              padding: "10px 18px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              fontSize: "15px",
            }}
          >
            🗓 Fecha del Hallazgo: {resultado.fecha}
          </div>

          <div
            style={{
              padding: "10px 18px 16px 18px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              fontSize: "15px",
            }}
          >
            👤 Responsable: {resultado.responsable}
          </div>
        </div>

        <button
          onClick={() => (window.location.href = "/")}
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: "14px",
            background: resultado.colorBoton,
            color: "white",
            border: "none",
            fontWeight: 700,
            fontSize: "18px",
            cursor: "pointer",
            boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
          }}
        >
          Finalizar
        </button>
      </div>
    </div>
  );
}