"use client";

import { useEffect, useState } from "react";
import { preguntasEvaluacion } from "@/app/types/evaluacion";

export default function Paso1() {
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [hallazgo, setHallazgo] = useState<any>(null);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("hallazgos") || "[]");
    if (data.length > 0) {
      const ultimo = data[data.length - 1];
      setHallazgo(ultimo);
      setRespuestas(ultimo.evaluacion?.respuestas || {});
    }
  }, []);

  const preguntas = preguntasEvaluacion.filter((p) => p.paso === 1);

  const seleccionar = (id: string, value: string) => {
    setRespuestas((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const continuar = () => {
    const data = JSON.parse(localStorage.getItem("hallazgos") || "[]");

    const actualizados = data.map((h: any) =>
      h.id === hallazgo.id
        ? {
            ...h,
            evaluacion: {
              respuestas,
            },
          }
        : h
    );

    localStorage.setItem("hallazgos", JSON.stringify(actualizados));
    window.location.href = "/evaluar/paso2";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b1f3a",
        padding: "20px",
        color: "white",
      }}
    >
      <div style={{ maxWidth: "520px", margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", marginBottom: "10px" }}>
          Evaluación del Hallazgo
        </h2>

        <p style={{ textAlign: "center", opacity: 0.7, marginBottom: "20px" }}>
          Paso 1 de 3 — Condición Crítica
        </p>

        {preguntas.map((p) => (
          <div
            key={p.id}
            style={{
              background: "rgba(255,255,255,0.08)",
              padding: "14px",
              borderRadius: "12px",
              marginBottom: "12px",
            }}
          >
            <p style={{ marginBottom: "10px" }}>{p.texto}</p>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {p.opciones.map((op) => (
                <button
                  key={op.value}
                  onClick={() => seleccionar(p.id, op.value)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                    background:
                      respuestas[p.id] === op.value
                        ? "#52c41a"
                        : "rgba(255,255,255,0.15)",
                    color: "white",
                  }}
                >
                  {op.label}
                </button>
              ))}
            </div>
          </div>
        ))}

        <button
          onClick={continuar}
          style={{
            marginTop: "20px",
            width: "100%",
            padding: "14px",
            borderRadius: "12px",
            background: "#1890ff",
            color: "white",
            border: "none",
            fontWeight: 600,
          }}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}