"use client";

import { useEffect, useState } from "react";

type FotoV2 = {
  id: string;
  nombre: string;
  tipo: string;
  dataUrl: string;
  fechaCarga: string;
};

type GpsV2 = {
  latitud: number;
  longitud: number;
  precisionGps: number;
  fechaHoraGeolocalizacion: string;
  estadoGeolocalizacion: string;
};

type ReporteV2 = {
  codigo?: string;
  supervisor?: string;
  supervisorFoto?: string;
  cargo?: string;
  empresa?: string;
  obra?: string;
  area?: string;
  descripcion?: string;
  fecha?: string;
  hora?: string;
  estado?: string;
  estadoCierre?: string;
  fechaGuardado?: string;
  fotos?: FotoV2[];
  gps?: GpsV2;
  evaluacion?: {
    puntaje?: number;
    criticidad?: string;
    prioridad?: string;
    recomendacion?: string;
    accionInmediata?: string;
  };
};

const STORAGE_REPORTE_ACTUAL = "ce_mobile_v2_reporte_actual";
const STORAGE_HISTORIAL = "ce_mobile_v2_historial_reportes";

function vibrarOk() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(20);
  }
}

function obtenerEstiloCriticidad(criticidad?: string) {
  if (criticidad === "CRÍTICO") {
    return {
      background:
        "linear-gradient(180deg, rgba(255,90,90,0.96) 0%, rgba(185,32,32,0.90) 100%)",
      border: "1px solid rgba(255,255,255,0.22)",
      boxShadow: "0 18px 36px rgba(185,32,32,0.34)",
    };
  }

  if (criticidad === "ALTO") {
    return {
      background:
        "linear-gradient(180deg, rgba(250,173,20,0.96) 0%, rgba(196,120,12,0.90) 100%)",
      border: "1px solid rgba(255,255,255,0.22)",
      boxShadow: "0 18px 36px rgba(196,120,12,0.34)",
    };
  }

  if (criticidad === "MEDIO") {
    return {
      background:
        "linear-gradient(180deg, rgba(24,144,255,0.96) 0%, rgba(18,90,180,0.90) 100%)",
      border: "1px solid rgba(255,255,255,0.22)",
      boxShadow: "0 18px 36px rgba(18,90,180,0.34)",
    };
  }

  return {
    background:
      "linear-gradient(180deg, rgba(34,197,94,0.95) 0%, rgba(21,128,61,0.90) 100%)",
    border: "1px solid rgba(255,255,255,0.22)",
    boxShadow: "0 18px 36px rgba(21,128,61,0.30)",
  };
}

function cargarReporteActual(): ReporteV2 | null {
  try {
    const guardado = localStorage.getItem(STORAGE_REPORTE_ACTUAL);
    if (!guardado) return null;

    const reporte = JSON.parse(guardado);
    if (!reporte || typeof reporte !== "object") return null;

    return reporte;
  } catch {
    return null;
  }
}

function cargarHistorial(): ReporteV2[] {
  try {
    const guardado = JSON.parse(localStorage.getItem(STORAGE_HISTORIAL) || "[]");
    return Array.isArray(guardado) ? guardado : [];
  } catch {
    return [];
  }
}

function guardarReporteEnHistorial(reporte: ReporteV2): ReporteV2 {
  const historial = cargarHistorial();
  const reporteGuardado = {
    ...reporte,
    estado: "abierto",
    estadoCierre: "abierto",
    fechaGuardado: new Date().toISOString(),
  };
  const indiceExistente = historial.findIndex(
    (item) => item.codigo && item.codigo === reporte.codigo
  );
  const actualizado =
    indiceExistente >= 0
      ? historial.map((item, index) =>
          index === indiceExistente ? { ...item, ...reporteGuardado } : item
        )
      : [...historial, reporteGuardado];

  localStorage.setItem(STORAGE_HISTORIAL, JSON.stringify(actualizado));
  localStorage.setItem(STORAGE_REPORTE_ACTUAL, JSON.stringify(reporteGuardado));

  return reporteGuardado;
}

export default function InformeFinalV2Page() {
  const [reporte, setReporte] = useState<ReporteV2 | null>(null);
  const [cargado, setCargado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [botonActivo, setBotonActivo] = useState("");

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setReporte(cargarReporteActual());
      setCargado(true);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

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
    padding: "16px 16px calc(112px + env(safe-area-inset-bottom))",
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
    display: "block",
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
    textAlign: "center" as const,
    textDecoration: "none",
    transition: "transform 120ms ease, filter 120ms ease, box-shadow 120ms ease",
  };

  const datoStyle = {
    borderRadius: "14px",
    background: "rgba(255,255,255,0.08)",
    padding: "11px 12px",
    boxSizing: "border-box" as const,
  };

  const fotos = Array.isArray(reporte?.fotos) ? reporte.fotos : [];
  const criticidad = reporte?.evaluacion?.criticidad || "BAJO";
  const estiloCriticidad = obtenerEstiloCriticidad(criticidad);

  return (
    <main
      style={pageStyle}
      onDoubleClick={(event) => {
        event.preventDefault();
      }}
    >
      <div style={containerStyle}>
        <header style={{ textAlign: "center", marginBottom: "18px" }}>
          <div
            style={{
              width: "88px",
              height: "88px",
              borderRadius: "50%",
              margin: "0 auto 12px",
              backgroundImage: "url('/logo.png')",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.28)",
              boxShadow: "0 16px 34px rgba(0,0,0,0.32)",
            }}
            aria-label="Logo Criterio Estratégico"
          />
          <div style={{ fontSize: "14px", fontWeight: 800, opacity: 0.82 }}>
            Criterio Estratégico
          </div>
          <h1
            style={{
              margin: "8px 0 0",
              fontSize: "25px",
              lineHeight: 1.08,
              fontWeight: 900,
              letterSpacing: "0",
            }}
          >
            Informe Final V2
          </h1>
        </header>

        {!cargado && (
          <section style={cardStyle}>Cargando informe V2...</section>
        )}

        {cargado && !reporte && (
          <section style={cardStyle}>
            <div
              style={{
                fontSize: "18px",
                fontWeight: 900,
                marginBottom: "12px",
              }}
            >
              No hay reporte V2 disponible
            </div>
            <a
              href="/evaluar-v2/reportar"
              onClick={vibrarOk}
              {...feedbackBoton("volver-reportar")}
              style={{
                ...buttonStyle,
                color: "#08172d",
                background: "linear-gradient(135deg, #67ef48 0%, #d7ff39 100%)",
                ...estiloFeedback("volver-reportar"),
              }}
            >
              Volver a reportar
            </a>
          </section>
        )}

        {reporte && (
          <>
            <section
              style={{
                ...cardStyle,
                ...estiloCriticidad,
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 900,
                  opacity: 0.84,
                  marginBottom: "8px",
                }}
              >
                CRITICIDAD DEL HALLAZGO
              </div>
              <div style={{ fontSize: "42px", fontWeight: 900, lineHeight: 1 }}>
                {criticidad}
              </div>
              <div style={{ marginTop: "8px", fontSize: "15px", fontWeight: 900 }}>
                Prioridad: {reporte.evaluacion?.prioridad || "Normal"}
              </div>
              <div style={{ marginTop: "10px", fontSize: "13px", lineHeight: 1.45 }}>
                {reporte.evaluacion?.recomendacion ||
                  "Mantener control y seguimiento del hallazgo."}
              </div>
              {typeof reporte.evaluacion?.puntaje === "number" && (
                <div style={{ marginTop: "10px", fontSize: "12px", opacity: 0.76 }}>
                  Índice interno de priorización: {reporte.evaluacion.puntaje} pts.
                </div>
              )}
            </section>

            <section style={cardStyle}>
              {reporte.supervisorFoto && (
                <div
                  style={{
                    width: "76px",
                    height: "76px",
                    borderRadius: "18px",
                    marginBottom: "12px",
                    background: `url(${reporte.supervisorFoto}) center / cover no-repeat`,
                    border: "1px solid rgba(255,255,255,0.20)",
                    boxShadow: "0 12px 24px rgba(0,0,0,0.25)",
                  }}
                />
              )}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: "10px",
                }}
              >
                {[
                  ["Código", reporte.codigo || "Sin código"],
                  ["Supervisor", reporte.supervisor || "Sin supervisor"],
                  ["Cargo", reporte.cargo || "Sin cargo"],
                  ["Empresa / Obra", `${reporte.empresa || "—"} / ${reporte.obra || "—"}`],
                  ["Área", reporte.area || "Sin área"],
                  ["Descripción", reporte.descripcion || "Sin descripción"],
                  [
                    "Acción inmediata",
                    reporte.evaluacion?.accionInmediata || "Sin acción definida",
                  ],
                  [
                    "Recomendación",
                    reporte.evaluacion?.recomendacion || "Sin recomendación",
                  ],
                  ["Fecha / Hora", `${reporte.fecha || "—"} / ${reporte.hora || "—"}`],
                ].map(([label, valor]) => (
                  <div key={label} style={datoStyle}>
                    <div style={{ fontSize: "11px", opacity: 0.62 }}>
                      {label}
                    </div>
                    <div style={{ fontSize: "15px", fontWeight: 800 }}>
                      {valor}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section style={cardStyle}>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 900,
                  marginBottom: "10px",
                }}
              >
                Fotografías
              </div>
              {fotos.length === 0 ? (
                <div style={{ fontSize: "14px", opacity: 0.76 }}>
                  No hay fotografías cargadas.
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "8px",
                  }}
                >
                  {fotos.map((foto) => (
                    <div
                      key={foto.id}
                      aria-label={foto.nombre}
                      role="img"
                      style={{
                        width: "100%",
                        height: "92px",
                        borderRadius: "14px",
                        border: "1px solid rgba(255,255,255,0.16)",
                        backgroundImage: `url(${foto.dataUrl})`,
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "cover",
                      }}
                    />
                  ))}
                </div>
              )}
            </section>

            <section style={cardStyle}>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 900,
                  marginBottom: "10px",
                }}
              >
                Ubicación GPS
              </div>
              {reporte.gps ? (
                <div style={{ display: "grid", gap: "8px" }}>
                  <div>
                    <strong>Latitud:</strong> {reporte.gps.latitud}
                  </div>
                  <div>
                    <strong>Longitud:</strong> {reporte.gps.longitud}
                  </div>
                  <div>
                    <strong>Precisión:</strong> {reporte.gps.precisionGps} m
                  </div>
                  <div>
                    <strong>Estado:</strong>{" "}
                    {reporte.gps.estadoGeolocalizacion}
                  </div>
                  <div>
                    <strong>Fecha/hora:</strong>{" "}
                    {reporte.gps.fechaHoraGeolocalizacion}
                  </div>
                </div>
              ) : (
                <div>Sin ubicación GPS.</div>
              )}
            </section>

            <div style={{ display: "grid", gap: "10px" }}>
              <a
                href="/evaluar-v2/resultado"
                onClick={vibrarOk}
                {...feedbackBoton("volver-resultado")}
                style={{
                  ...buttonStyle,
                  color: "white",
                  background: "rgba(255,255,255,0.14)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  ...estiloFeedback("volver-resultado"),
                }}
              >
                Volver a resultado
              </a>
              <button
                type="button"
                {...feedbackBoton("guardar")}
                onClick={() => {
                  if (!reporte || guardando) return;

                  setGuardando(true);
                  const reporteGuardado = guardarReporteEnHistorial(reporte);
                  setReporte(reporteGuardado);
                  vibrarOk();
                  setGuardado(true);
                  setGuardando(false);
                }}
                disabled={guardando || guardado}
                style={{
                  ...buttonStyle,
                  color: guardado ? "white" : "#08172d",
                  background: guardando
                    ? "rgba(255,255,255,0.18)"
                    : guardado
                      ? "linear-gradient(135deg, #22c55e, #15803d)"
                      : "linear-gradient(135deg, #facc15, #f97316)",
                  boxShadow: guardado
                    ? "0 14px 28px rgba(34,197,94,0.22)"
                    : "0 14px 28px rgba(249,115,22,0.22)",
                  opacity: guardando ? 0.72 : 1,
                  ...estiloFeedback("guardar"),
                }}
              >
                {guardando
                  ? "Guardando..."
                  : guardado
                    ? "Guardado correctamente"
                    : "Guardar y enviar"}
              </button>
              <a
                href="/evaluar-v2"
                onClick={vibrarOk}
                {...feedbackBoton("inicio")}
                style={{
                  ...buttonStyle,
                  color: "#08172d",
                  background: "linear-gradient(135deg, #67ef48 0%, #d7ff39 100%)",
                  ...estiloFeedback("inicio"),
                }}
              >
                Volver al inicio V2
              </a>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
