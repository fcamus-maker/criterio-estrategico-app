"use client";

import { useEffect, useState } from "react";
import preguntasEvaluacion from "../../types/evaluacion";
import { useRouter } from "next/navigation";

export default function Paso2() {
  const router = useRouter();

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

  const preguntas = preguntasEvaluacion.filter((p) => p.paso === 2);

  const seleccionar = (id: string, value: string) => {
    setRespuestas((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const continuar = () => {
    if (!hallazgo) return;

    const data = JSON.parse(localStorage.getItem("hallazgos") || "[]");

    const actualizado = {
      ...hallazgo,
      evaluacion: {
        respuestas,
      },
    };

    data[data.length - 1] = actualizado;

    localStorage.setItem("hallazgos", JSON.stringify(data));

    router.push("/evaluar/paso3");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b1f3a",
        display: "flex",
        justifyContent: "center",
        padding: "20px",
        color: "white",
      }}
    >
      <div style={{ width: "100%", maxWidth: "520px" }}>
        <h2 style={{ marginBottom: "20px", textAlign: "center" }}>
          Paso 2 de 3 — Condición Operacional
        </h2>

        {preguntas.map((p) => (
          <div
            key={p.id}
            style={{
              marginBottom: "20px",
              padding: "16px",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.08)",
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