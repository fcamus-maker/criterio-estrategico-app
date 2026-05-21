"use client";

import { useEffect, useRef, useState } from "react";
import {
  guardarHistorialLivianoV2,
  guardarReporteActualV2,
  leerReporteActualV2,
  type ReporteV2Storage,
} from "../storageReporteV2";

type FotoV2 = {
  id: string;
  nombre: string;
  tipo: string;
  dataUrl?: string;
  url?: string;
  storagePath?: string;
  dataUrlOmitida?: boolean;
  storagePendiente?: boolean;
  fechaCarga: string;
};

type GpsV2 = {
  latitud?: number;
  longitud?: number;
  precisionGps?: number;
  fechaHoraGeolocalizacion: string;
  estadoGeolocalizacion: string;
  motivoGeolocalizacion?: string;
};

type ReporteV2 = ReporteV2Storage & {
  codigo?: string;
  supervisor?: string;
  supervisorFoto?: string;
  cargo?: string;
  empresa?: string;
  obra?: string;
  area?: string;
  descripcion?: string;
  empresaInvolucradaResponsable?: string;
  responsableEmpresa?: string;
  cargoResponsableEmpresa?: string;
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

type DetalleGuardadoV2 = {
  localOk?: boolean;
  centralOk?: boolean;
  centralPendiente?: boolean;
  evidenciasIntentadas?: number;
  evidenciasSubidas?: number;
  evidenciasPendientes?: number;
  errorCentral?: string;
  errorEvidencias?: string;
  codigo?: string;
  tablaDestino?: string;
  supabaseHabilitado?: boolean;
  supabaseConfigurado?: boolean;
  banderaSupabaseActiva?: boolean;
};

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

function mensajeUsuarioGuardado(detalle: DetalleGuardadoV2) {
  if (detalle.centralOk) {
    if ((detalle.evidenciasPendientes || 0) > 0) {
      return "Reporte enviado correctamente. Una evidencia quedó pendiente de carga. Se intentará sincronizar nuevamente.";
    }

    return "Reporte enviado correctamente. El hallazgo fue guardado y sincronizado. Evidencias recibidas.";
  }

  return "Reporte guardado. La sincronización quedó pendiente y se intentará nuevamente.";
}

export default function InformeFinalV2Page() {
  const [reporte, setReporte] = useState<ReporteV2 | null>(null);
  const [cargado, setCargado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [estadoSincronizacion, setEstadoSincronizacion] = useState<
    "idle" | "central-ok" | "central-error"
  >("idle");
  const [mensajeGuardado, setMensajeGuardado] = useState("");
  const [detalleGuardado, setDetalleGuardado] =
    useState<DetalleGuardadoV2 | null>(null);
  const [botonActivo, setBotonActivo] = useState("");
  const guardandoRef = useRef(false);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setReporte(leerReporteActualV2() as ReporteV2 | null);
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
  const fotosVisibles = fotos.filter((foto) => foto.dataUrl || foto.url);
  const fotosPendientes = Math.max(fotos.length - fotosVisibles.length, 0);
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
            Informe Final
          </h1>
        </header>

        {!cargado && (
          <section style={cardStyle}>Cargando informe...</section>
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
              No hay reporte disponible
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
                    "Empresa involucrada / responsable",
                    reporte.empresaInvolucradaResponsable || "Sin informar",
                  ],
                  [
                    "Responsable de la empresa",
                    reporte.responsableEmpresa || "Sin informar",
                  ],
                  [
                    "Cargo del responsable",
                    reporte.cargoResponsableEmpresa || "Sin informar",
                  ],
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
              ) : fotosVisibles.length === 0 ? (
                <div style={{ fontSize: "14px", opacity: 0.76, lineHeight: 1.45 }}>
                  Una evidencia quedó pendiente de carga. Se intentará sincronizar
                  nuevamente.
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "8px",
                  }}
                >
                  {fotosVisibles.map((foto) => {
                    const imagen = foto.dataUrl || foto.url || "";

                    return (
                      <div
                        key={foto.id}
                        aria-label={foto.nombre}
                        role="img"
                        style={{
                          width: "100%",
                          height: "92px",
                          borderRadius: "14px",
                          border: "1px solid rgba(255,255,255,0.16)",
                          backgroundImage: `url(${imagen})`,
                          backgroundPosition: "center",
                          backgroundRepeat: "no-repeat",
                          backgroundSize: "cover",
                        }}
                      />
                    );
                  })}
                </div>
              )}
              {fotosPendientes > 0 && fotosVisibles.length > 0 && (
                <div style={{ marginTop: "8px", fontSize: "12px", opacity: 0.68 }}>
                  {fotosPendientes} evidencia(s) quedaron pendientes de carga. Se
                  intentará sincronizar nuevamente.
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
                  {typeof reporte.gps.latitud === "number" &&
                    typeof reporte.gps.longitud === "number" && (
                      <>
                        <div>
                          <strong>Latitud:</strong> {reporte.gps.latitud}
                        </div>
                        <div>
                          <strong>Longitud:</strong> {reporte.gps.longitud}
                        </div>
                        <div>
                          <strong>Precisión:</strong>{" "}
                          {typeof reporte.gps.precisionGps === "number"
                            ? `${reporte.gps.precisionGps} m`
                            : "No informada"}
                        </div>
                      </>
                    )}
                  <div>
                    <strong>Estado:</strong>{" "}
                    {reporte.gps.estadoGeolocalizacion}
                  </div>
                  {reporte.gps.motivoGeolocalizacion && (
                    <div>
                      <strong>Motivo:</strong>{" "}
                      {reporte.gps.motivoGeolocalizacion}
                    </div>
                  )}
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
              <button
                type="button"
                {...feedbackBoton("guardar")}
                onClick={async () => {
                  if (!reporte || guardandoRef.current || guardado) return;

                  guardandoRef.current = true;
                  setGuardando(true);
                  setMensajeGuardado("");
                  setEstadoSincronizacion("idle");
                  setDetalleGuardado(null);
                  const reporteGuardado: ReporteV2 = {
                    ...reporte,
                    estado: "abierto",
                    estadoCierre: "abierto",
                    fechaGuardado: new Date().toISOString(),
                  };

                  try {
                    if (process.env.NODE_ENV !== "production") {
                      console.info("[guardar-v2] CLICK guardar y enviar", {
                        reporteActualEncontrado: Boolean(reporte),
                        codigo: reporteGuardado.codigo,
                      });
                    }
                    const { guardarReporteV2Completo } = await import(
                      "@/app/services/guardarReporteV2Completo"
                    );
                    if (process.env.NODE_ENV !== "production") {
                      console.info("[guardar-v2] servicio completo llamado", {
                        codigo: reporteGuardado.codigo,
                      });
                    }
                    const resultadoGuardado =
                      await guardarReporteV2Completo(reporteGuardado);
                    const reporteConEstado: ReporteV2 = {
                      ...reporteGuardado,
                      sincronizacionCentral: {
                        estado: resultadoGuardado.centralOk
                          ? "sincronizado"
                          : "pendiente",
                        mensaje: resultadoGuardado.mensaje,
                        fecha: new Date().toISOString(),
                      },
                    };

                    setReporte(reporteConEstado);
                    setEstadoSincronizacion(
                      resultadoGuardado.centralOk ? "central-ok" : "central-error"
                    );
                    setMensajeGuardado(mensajeUsuarioGuardado(resultadoGuardado));
                    setDetalleGuardado(resultadoGuardado);
                  } catch (error) {
                    const mensajeCentral =
                      "Reporte guardado. La sincronización quedó pendiente y se intentará nuevamente.";
                    console.warn("No se pudo completar escritura central.", error);
                    const reporteConEstado: ReporteV2 = {
                      ...reporteGuardado,
                      sincronizacionCentral: {
                        estado: "pendiente",
                        mensaje: mensajeCentral,
                        fecha: new Date().toISOString(),
                      },
                    };
                    const historialOk = guardarHistorialLivianoV2(reporteConEstado);
                    const actualOk = guardarReporteActualV2(reporteConEstado);
                    const localOk = historialOk || actualOk;

                    setReporte(reporteConEstado);
                    setEstadoSincronizacion("central-error");
                    setMensajeGuardado(mensajeCentral);
                    setDetalleGuardado({
                      localOk,
                      centralOk: false,
                      centralPendiente: true,
                      errorCentral:
                        error instanceof Error ? error.message : String(error),
                      codigo: reporteGuardado.codigo,
                      tablaDestino: "public.hallazgos_central",
                    });
                  } finally {
                    vibrarOk();
                    setGuardado(true);
                    setGuardando(false);
                    guardandoRef.current = false;
                  }
                }}
                disabled={guardando || guardado}
                style={{
                  ...buttonStyle,
                  color: guardado ? "white" : "#08172d",
                  background: guardando
                    ? "rgba(255,255,255,0.18)"
                    : guardado && estadoSincronizacion === "central-ok"
                      ? "linear-gradient(135deg, #22c55e, #15803d)"
                      : guardado
                        ? "linear-gradient(135deg, #f59e0b, #c2410c)"
                      : "linear-gradient(135deg, #facc15, #f97316)",
                  boxShadow: guardado && estadoSincronizacion === "central-ok"
                    ? "0 14px 28px rgba(34,197,94,0.22)"
                    : "0 14px 28px rgba(249,115,22,0.22)",
                  opacity: guardando ? 0.72 : 1,
                  ...estiloFeedback("guardar"),
                }}
              >
                {guardando
                  ? "Guardando..."
                  : guardado
                    ? estadoSincronizacion === "central-ok"
                      ? "Reporte enviado"
                      : "Pendiente de sincronización"
                    : "Guardar y enviar"}
              </button>
              {mensajeGuardado && (
                <div
                  style={{
                    borderRadius: "14px",
                    background:
                      estadoSincronizacion === "central-ok"
                        ? "rgba(34,197,94,0.14)"
                        : "rgba(249,115,22,0.14)",
                    border:
                      estadoSincronizacion === "central-ok"
                        ? "1px solid rgba(34,197,94,0.28)"
                        : "1px solid rgba(249,115,22,0.28)",
                    padding: "10px 12px",
                    fontSize: "13px",
                    fontWeight: 800,
                    lineHeight: 1.35,
                  }}
                >
                  {mensajeGuardado}
                </div>
              )}
              {detalleGuardado && (
                <div
                  style={{
                    borderRadius: "14px",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.14)",
                    padding: "10px 12px",
                    fontSize: "12px",
                    fontWeight: 800,
                    lineHeight: 1.45,
                  }}
                >
                  <div>
                    {detalleGuardado.centralOk
                      ? "El hallazgo fue guardado y sincronizado."
                      : "El reporte quedó guardado y pendiente de sincronización."}
                  </div>
                  {(detalleGuardado.evidenciasIntentadas || 0) > 0 && (
                    <div>
                      {(detalleGuardado.evidenciasPendientes || 0) > 0
                        ? "Una evidencia quedó pendiente de carga. Se intentará sincronizar nuevamente."
                        : "Evidencias recibidas."}
                    </div>
                  )}
                </div>
              )}
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
                Volver al inicio
              </a>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
