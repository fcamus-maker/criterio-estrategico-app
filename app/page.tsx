"use client";

import { useEffect, useMemo, useState } from "react";

export default function Home() {
  const [hallazgos, setHallazgos] = useState<any[]>([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("hallazgos") || "[]");
    setHallazgos(data);
  }, []);

  const resumen = useMemo(() => {
    const reportados = hallazgos.length;
    const abiertos = hallazgos.filter((h) => h.estado === "abierto").length;
    const cerrados = hallazgos.filter((h) => h.estado === "cerrado").length;
    return { reportados, abiertos, cerrados };
  }, [hallazgos]);

  const statCardBase: React.CSSProperties = {
    borderRadius: "18px",
    padding: "18px 12px",
    color: "white",
    textAlign: "center",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 8px 22px rgba(0,0,0,0.22)",
    minHeight: "168px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #1d4fa8 0%, #0b1f3a 42%, #08172d 100%)",
        color: "white",
        fontFamily: "Arial, sans-serif",
        display: "flex",
        justifyContent: "center",
        padding: "26px 16px 40px 16px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "560px" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div
            style={{
              width: "82px",
              height: "82px",
              borderRadius: "50%",
              margin: "0 auto 12px auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              background: "rgba(255,255,255,0.08)",
              boxShadow:
"0 0 0 1px rgba(255,255,255,0.12), 0 12px 28px rgba(0,0,0,0.35), 0 0 28px rgba(255,255,255,0.28)",
              backdropFilter: "blur(4px)",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: "-10px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(255,255,255,0.22), transparent 65%)",
                zIndex: 0,
              }}
            />

            <img
              src="/logo.png"
              alt="Criterio Estratégico"
              style={{
                width: "54px",
                height: "54px",
                objectFit: "contain",
                zIndex: 1,
                borderRadius: "6px",
              }}
            />
          </div>

          <div
            style={{
              fontSize: "14px",
              fontWeight: 600,
              opacity: 0.8,
              letterSpacing: "0.8px",
              marginBottom: "8px",
            }}
          >
            Criterio Estratégico
          </div>

          <div
            style={{
              fontSize: "26px",
              fontWeight: 800,
              letterSpacing: "1px",
              textTransform: "uppercase",
              lineHeight: 1.08,
            }}
          >
            Reporte de Hallazgos
          </div>
        </div>

        <div
          style={{
            background: "rgba(58, 100, 190, 0.32)",
            borderRadius: "22px",
            padding: "16px",
            marginBottom: "18px",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 10px 24px rgba(0,0,0,0.22)",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "96px",
              height: "96px",
              borderRadius: "16px",
              background: "rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontSize: "34px",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            👷
          </div>

          <div>
            <div
              style={{
                fontSize: "18px",
                fontWeight: 800,
                marginBottom: "6px",
              }}
            >
              Rodrigo Jiménez
            </div>

            <div
              style={{
                fontSize: "14px",
                opacity: 0.95,
                marginBottom: "4px",
              }}
            >
              Supervisor
            </div>

            <div
              style={{
                fontSize: "14px",
                opacity: 0.8,
              }}
            >
              Supervisor Terreno
            </div>
          </div>
        </div>

        <button
          onClick={() => (window.location.href = "/reportar")}
          style={{
            width: "100%",
            padding: "17px",
            borderRadius: "18px",
            border: "none",
            color: "white",
            fontSize: "18px",
            fontWeight: 800,
            cursor: "pointer",
            marginBottom: "20px",
            background: "linear-gradient(180deg, #fb923c 0%, #ea580c 100%)",
            boxShadow: "0 10px 22px rgba(234,88,12,0.30)",
          }}
        >
          Reportar Hallazgo
        </button>

        <div
          style={{
            textAlign: "center",
            fontSize: "14px",
            fontWeight: 800,
            letterSpacing: "1px",
            opacity: 0.88,
            marginBottom: "12px",
            textTransform: "uppercase",
          }}
        >
          Estado de Reportes
        </div>

        <div
  style={{
    background: "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04))",
    borderRadius: "22px",
    padding: "16px",
    marginBottom: "20px",
    border: "1px solid rgba(255,255,255,0.14)",
    boxShadow: "0 14px 32px rgba(0,0,0,0.28)",
    backdropFilter: "blur(6px)",
  }}
>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "12px",
            }}
          >
            <div
              style={{
                ...statCardBase,
                background:
                  "linear-gradient(180deg, rgba(59,130,246,0.96) 0%, rgba(29,78,216,0.92) 100%)",
              }}
            >
              <div style={{ fontSize: "24px" }}>📋</div>
              <div style={{ fontSize: "15px", fontWeight: 700 }}>Reportados</div>
              <div style={{ fontSize: "42px", fontWeight: 800 }}>
                {resumen.reportados}
              </div>
            </div>

            <div
              style={{
                ...statCardBase,
                background:
                  "linear-gradient(180deg, rgba(255,90,95,0.96) 0%, rgba(185,28,28,0.92) 100%)",
              }}
            >
              <div style={{ fontSize: "24px" }}>⚠️</div>
              <div style={{ fontSize: "15px", fontWeight: 700 }}>Abiertos</div>
              <div style={{ fontSize: "42px", fontWeight: 800 }}>
                {resumen.abiertos}
              </div>
            </div>

            <div
              style={{
                ...statCardBase,
                background:
                  "linear-gradient(180deg, rgba(34,197,94,0.96) 0%, rgba(21,128,61,0.92) 100%)",
              }}
            >
              <div style={{ fontSize: "24px" }}>✅</div>
              <div style={{ fontSize: "15px", fontWeight: 700 }}>Cerrados</div>
              <div style={{ fontSize: "42px", fontWeight: 800 }}>
                {resumen.cerrados}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            textAlign: "center",
            fontSize: "15px",
            fontWeight: 700,
            opacity: 0.88,
          }}
        >
          Según Ley 16.744 / D.S. N° 44
        </div>
      </div>
    </main>
  );
}