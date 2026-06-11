"use client";

import { useEffect } from "react";

export default function EvaluacionV2Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[evaluar-v2] error en evaluacion", error);
  }, [error]);

  return (
    <main
      className="ce-mobile-app-shell"
      style={{
        minHeight: "100dvh",
        background:
          "radial-gradient(circle at 50% 0%, #2563eb 0%, #0b1f3a 42%, #061327 100%)",
        color: "white",
        fontFamily: "Arial, sans-serif",
        display: "grid",
        placeItems: "center",
        padding: "24px 16px",
        boxSizing: "border-box",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "430px",
          borderRadius: "22px",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.07))",
          border: "1px solid rgba(255,255,255,0.16)",
          boxShadow: "0 18px 36px rgba(0,0,0,0.28)",
          padding: "18px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ fontSize: "18px", fontWeight: 900, marginBottom: "8px" }}>
          No se pudo cargar la evaluación
        </div>
        <p style={{ margin: "0 0 14px", fontSize: "14px", lineHeight: 1.45, opacity: 0.78 }}>
          El reporte sigue guardado en este dispositivo. Intenta cargar
          nuevamente o vuelve al inicio del flujo.
        </p>
        <div style={{ display: "grid", gap: "10px" }}>
          <button
            type="button"
            onClick={reset}
            style={{
              width: "100%",
              border: "none",
              borderRadius: "16px",
              padding: "14px",
              fontSize: "16px",
              fontWeight: 900,
              color: "#08172d",
              background: "linear-gradient(135deg, #67ef48 0%, #d7ff39 100%)",
            }}
          >
            Reintentar evaluación
          </button>
          <a
            href="/evaluar-v2"
            style={{
              display: "block",
              width: "100%",
              borderRadius: "16px",
              padding: "14px",
              boxSizing: "border-box",
              fontSize: "16px",
              fontWeight: 900,
              color: "white",
              textAlign: "center",
              textDecoration: "none",
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.18)",
            }}
          >
            Volver al inicio
          </a>
        </div>
      </section>
    </main>
  );
}
