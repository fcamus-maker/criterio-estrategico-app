"use client";

export default function EvaluarPage() {
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
          Evaluación de Hallazgo
        </h2>

        <div
          style={{
            width: "100%",
            background: "rgba(50, 110, 210, 0.20)",
            padding: "18px",
            borderRadius: "18px",
            backdropFilter: "blur(8px)",
            marginBottom: "16px",
          }}
        >
          <h3 style={{ marginBottom: "14px" }}>Resumen del Hallazgo</h3>

          <p style={{ marginBottom: "16px", lineHeight: "1.5" }}>
            Cable dañado y regleta en mal estado detectados en puesto de
            trabajo.
          </p>

          <div
            style={{
              display: "flex",
              gap: "12px",
              marginBottom: "18px",
              overflowX: "auto",
            }}
          >
            <div
              style={{
                width: "100px",
                height: "100px",
                background: "#fff2",
                border: "1px solid rgba(255,255,255,0.25)",
                borderRadius: "14px",
                flexShrink: 0,
              }}
            />
            <div
              style={{
                width: "100px",
                height: "100px",
                background: "#fff2",
                border: "1px solid rgba(255,255,255,0.25)",
                borderRadius: "14px",
                flexShrink: 0,
              }}
            />
            <div
              style={{
                width: "100px",
                height: "100px",
                background: "#fff2",
                border: "1px solid rgba(255,255,255,0.25)",
                borderRadius: "14px",
                flexShrink: 0,
              }}
            />
          </div>

          <div style={{ marginTop: "20px", fontSize: "14px", lineHeight: "1.6" }}>
            <p><strong>Área:</strong> Oficina</p>
            <p><strong>Responsable:</strong> Freddy Camus</p>
            <p><strong>Fecha:</strong> 29/03/2026</p>
            <p><strong>Ubicación:</strong> Escritorio principal</p>
          </div>
        </div>
      </div>
    </div>
  );
}