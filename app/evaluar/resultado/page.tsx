"use client";

import { useEffect, useState } from "react";

export default function ResultadoPage() {
  const [hallazgo, setHallazgo] = useState<any>(null);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("hallazgos") || "[]");
    if (data.length > 0) {
      setHallazgo(data[data.length - 1]);
    }
  }, []);

  const calcularNivel = () => {
    if (!hallazgo) return null;

    const respuestas = hallazgo.evaluacion?.respuestas || {};
    let puntaje = 0;

    Object.values(respuestas).forEach((r: any) => {
      if (r === "no") puntaje += 10;
      if (r === "parcial") puntaje += 5;
      if (r === "baja") puntaje += 2;
      if (r === "media") puntaje += 5;
      if (r === "alta") puntaje += 8;
    });

    if (puntaje >= 40) return "Crítico";
    if (puntaje >= 25) return "Alto";
    if (puntaje >= 10) return "Medio";
    return "Bajo";
  };

  const nivel = calcularNivel();

  const color = {
    Crítico: "#ff4d4f",
    Alto: "#faad14",
    Medio: "#1890ff",
    Bajo: "#52c41a",
  }[nivel || "Bajo"];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0b1f3a",
      padding: "20px",
      color: "white",
      display: "flex",
      justifyContent: "center"
    }}>
      <div style={{ width: "100%", maxWidth: "520px" }}>
        
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Resultado Final de Criticidad
        </h2>

        <div style={{
          background: color,
          padding: "20px",
          borderRadius: "16px",
          textAlign: "center",
          marginBottom: "20px"
        }}>
          <div style={{ opacity: 0.8 }}>Nivel de criticidad</div>
          <div style={{ fontSize: "32px", fontWeight: 800 }}>
            {nivel}
          </div>
        </div>

        <div style={{
          background: "rgba(255,255,255,0.08)",
          padding: "16px",
          borderRadius: "12px",
          marginBottom: "16px"
        }}>
          <strong>Recomendación automática:</strong>
          <p style={{ marginTop: "10px" }}>
            {nivel === "Crítico" && "Detener inmediatamente la operación y aislar el área."}
            {nivel === "Alto" && "Corregir a la brevedad y aplicar control inmediato."}
            {nivel === "Medio" && "Programar corrección y seguimiento."}
            {nivel === "Bajo" && "Monitorear y mantener control."}
          </p>
        </div>

        {hallazgo && (
          <div style={{
            background: "rgba(255,255,255,0.08)",
            padding: "16px",
            borderRadius: "12px",
            marginBottom: "16px"
          }}>
            <p><strong>Área:</strong> {hallazgo.reporte.area}</p>
            <p><strong>Responsable:</strong> {hallazgo.reporte.responsable}</p>
            <p><strong>Fecha:</strong> {hallazgo.reporte.fecha}</p>
          </div>
        )}

        <button
          onClick={() => window.location.href = "/"}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "12px",
            background: "#1890ff",
            color: "white",
            border: "none",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Finalizar
        </button>

      </div>
    </div>
  );
}