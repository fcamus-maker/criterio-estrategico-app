"use client";
import { useEffect, useState } from "react";
export default function Home() {
const [hallazgos, setHallazgos] = useState<any[]>([]);

useEffect(() => {
  const datos = JSON.parse(localStorage.getItem("hallazgos") || "[]");
  setHallazgos(datos);
}, []);
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #123a7a 0%, #0b1e3c 45%, #08162d 100%)",
        color: "white",
        padding: "32px 20px",
        fontFamily: "Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "920px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <img
  src="/logo.png"
  alt="Logo Criterio Estratégico"
  style={{
    width: "90px",
    marginBottom: "18px",
    borderRadius: "50%",
    padding: "6px",
    background: "rgba(255,255,255,0.08)", // antes blanco sólido
    boxShadow: "0 0 18px rgba(120,255,150,0.4)"
  }}
/>

        <h1
          style={{
            fontSize: "24px",
            fontWeight: 700,
            letterSpacing: "0.5px",
            margin: 0,
            textAlign: "center",
          }}
        >
          CRITERIO ESTRATÉGICO
        </h1>

        <h2
          style={{
            marginTop: "12px",
            marginBottom: "28px",
            fontSize: "16px",
            fontWeight: 600,
            opacity: 0.95,
            textAlign: "center",
          }}
        >
          Reporte de Hallazgos
        </h2>

       <div
  style={{
    width: "100%",
    maxWidth: "900px",
    marginTop: "10px",
    background: "#1c3b6b",
    padding: "20px",
    borderRadius: "10px",
    textAlign: "center",
  }}
>
  <div style={{ fontSize: "24px", fontWeight: "bold", letterSpacing: "0.3px" }}>
    👷 Rodrigo Jiménez
  </div>
  <div style={{ fontSize: "14px", opacity: 0.8 }}>
    Supervisor Terreno
  </div>
</div>

        <div
          style={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "14px",
            marginTop: "18px",
          }}
        >
          <div
            style={{
              background: "rgba(50, 110, 210, 0.28)",
              border: "1px solid rgba(255,255,255,0.14)",
              padding: "18px 14px",
              borderRadius: "18px",
              textAlign: "center",
              boxShadow: "0 10px 24px rgba(0,0,0,0.16)",
            }}
          >
            <div style={{ fontSize: "13px", opacity: 0.85 }}>Reportados</div>
            <div style={{ fontSize: "28px", fontWeight: 700, marginTop: "6px" }}>
              {hallazgos.length}
            </div>
          </div>

          <div
            style={{
              background: "rgba(50, 110, 210, 0.28)",
              border: "1px solid rgba(255,255,255,0.14)",
              padding: "18px 14px",
              borderRadius: "18px",
              textAlign: "center",
              boxShadow: "0 10px 24px rgba(0,0,0,0.16)",
            }}
          >
            <div style={{ fontSize: "13px", opacity: 0.85 }}>Abiertos</div>
            <div style={{ fontSize: "28px", fontWeight: 700, marginTop: "6px" }}>
              {hallazgos.filter((h) => h.estado === "abierto").length}
            </div>
          </div>

          <div
            style={{
              background: "rgba(50, 110, 210, 0.28)",
              border: "1px solid rgba(255,255,255,0.14)",
              padding: "18px 14px",
              borderRadius: "18px",
              textAlign: "center",
              boxShadow: "0 10px 24px rgba(0,0,0,0.16)",
            }}
          >
            <div style={{ fontSize: "13px", opacity: 0.85 }}>Cerrados</div>
            <div style={{ fontSize: "28px", fontWeight: 700, marginTop: "6px" }}>
              {hallazgos.filter((h) => h.estado === "cerrado").length}
            </div>
          </div>
        </div>

       <button
  onClick={() => window.location.href = "/reportar"}
  style={{
    marginTop: "20px",
    width: "100%",
    padding: "18px",
    background: "linear-gradient(90deg, #73f38d 0%, #7dff93 100%)",
    color: "#083019",
    border: "none",
    borderRadius: "18px",
    fontSize: "18px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 12px 24px rgba(70, 255, 130, 0.22)",
  }}
>
  + Reportar Hallazgo
</button>

        <p
          style={{
            marginTop: "22px",
            fontSize: "13px",
            textAlign: "center",
            opacity: 0.8,
          }}
        >
          Ley 16.744 · DS44 Seguridad y Salud Ocupacional
        </p>
      </div>
    </main>
  );
}