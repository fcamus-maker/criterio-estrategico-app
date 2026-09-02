"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { aplicarResultadoMotorV2AReporte } from "../../motor-v2/adaptadorMotorV2";
import {
  avanzarFlujoProgresivoV4,
  construirPreguntaProgresivaV4,
  crearFlujoPreguntasProgresivasV4,
  evaluarFlujoProgresivoV4,
  flujoProgresivoCompletoV4,
  reconstruirVerificacionesProgresivasV4,
  reabrirControlInconsistenteV4,
  responderPreguntaProgresivaV4,
  retrocederFlujoProgresivoV4,
  validarCoherenciaFlujoProgresivoV4,
  type FlujoPreguntasProgresivasV4,
  type IdPreguntaProgresivaV4,
} from "../../motor-v2/flujoPreguntasProgresivasV4";
import { navegarEvaluarV2 } from "../../offlineNavigation";
import {
  guardarReporteActualV2,
  leerReporteActualV2,
  type ReporteV2Storage,
} from "../../storageReporteV2";
import {
  AutoGuardadoPremium,
  EtapasPremium,
  FirmaPremium,
  HeaderReportePremium,
  PremiumMobileViewport,
  ProgresoPreguntasPremium,
} from "../componentesPremium";
import {
  buttonStyle,
  containerStyle,
  glassPanelStyle,
  pageStyle,
  primaryButtonStyle,
} from "../evaluacionPremium";

type ReporteProgresivoV4 = ReporteV2Storage & {
  evaluacion?: ReporteV2Storage["evaluacion"] & {
    flujo_progresivo_v4?: FlujoPreguntasProgresivasV4;
  };
};

function vibrarOk() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(18);
}

const idsRespuesta = (flujo: FlujoPreguntasProgresivasV4, id: IdPreguntaProgresivaV4) =>
  flujo.respuestas[id]?.opcionIds || [];

export default function EvaluacionProgresivaV4Page() {
  const router = useRouter();
  const [reporte, setReporte] = useState<ReporteProgresivoV4 | null>(null);
  const [flujo, setFlujo] = useState<FlujoPreguntasProgresivasV4>(
    crearFlujoPreguntasProgresivasV4,
  );
  const [cargado, setCargado] = useState(false);
  const [analizando, setAnalizando] = useState(false);
  const [error, setError] = useState("");
  const [botonActivo, setBotonActivo] = useState("");

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const actual = leerReporteActualV2() as ReporteProgresivoV4 | null;
      if (!actual) {
        navegarEvaluarV2(router, "/evaluar-v2/reportar");
        return;
      }
      const guardado = actual.evaluacion?.flujo_progresivo_v4;
      setReporte(actual);
      setFlujo(
        guardado?.version === "preguntas_progresivas_v4"
          ? guardado
          : crearFlujoPreguntasProgresivasV4(),
      );
      setCargado(true);
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [router]);

  const pregunta = useMemo(
    () => construirPreguntaProgresivaV4(reporte || {}, flujo),
    [reporte, flujo],
  );
  const seleccionadas = idsRespuesta(flujo, pregunta.id);
  const verificacionesPrevias = useMemo(
    () => reconstruirVerificacionesProgresivasV4(flujo).slice(0, flujo.pasoActual - 1),
    [flujo],
  );
  const respondidas = Object.values(flujo.respuestas).filter(
    (respuesta) => (respuesta?.opcionIds.length || 0) > 0,
  ).length;

  const persistir = (siguiente: FlujoPreguntasProgresivasV4) => {
    if (!reporte) return;
    const actualizado: ReporteProgresivoV4 = {
      ...reporte,
      evaluacion: {
        ...(reporte.evaluacion || {}),
        flujo_progresivo_v4: siguiente,
        flujo_preventivo: undefined,
        matriz_universal: undefined,
        selector_preventivo_activo: false,
        selector_preventivo_modo: undefined,
      },
    };
    setReporte(actualizado);
    setFlujo(siguiente);
    guardarReporteActualV2(actualizado);
  };

  const seleccionar = (opcionId: string) => {
    if (analizando) return;
    vibrarOk();
    persistir(responderPreguntaProgresivaV4(flujo, pregunta, opcionId));
    setError("");
  };

  const continuar = () => {
    if (analizando || !reporte) return;
    if (seleccionadas.length === 0) {
      setError("Selecciona al menos una alternativa para continuar.");
      return;
    }

    const siguiente = avanzarFlujoProgresivoV4(flujo);
    if (siguiente.estado === "COMPLETO") {
      const validacion = validarCoherenciaFlujoProgresivoV4(siguiente);
      if (!validacion.ok) {
        persistir(reabrirControlInconsistenteV4(siguiente));
        setError(
          `${validacion.inconsistencias[0]} Revisa nuevamente el estado actual del control.`,
        );
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }
    persistir(siguiente);
    setAnalizando(true);
    setError("");

    window.setTimeout(() => {
      if (flujoProgresivoCompletoV4(siguiente)) {
        const resultado = evaluarFlujoProgresivoV4(siguiente);
        if (!resultado) {
          setAnalizando(false);
          setError("No fue posible consolidar la evaluación. Revisa las respuestas.");
          return;
        }
        const ruta = reconstruirVerificacionesProgresivasV4(siguiente);
        const base: ReporteProgresivoV4 = {
          ...reporte,
          evaluacion: {
            ...(reporte.evaluacion || {}),
            flujo_progresivo_v4: siguiente,
            flujo_preventivo: undefined,
            riesgo_especifico_detectado:
              ruta[1]?.respuesta || reporte.evaluacion?.riesgo_especifico_detectado,
          },
        };
        const evaluado = aplicarResultadoMotorV2AReporte(base, resultado);
        guardarReporteActualV2(evaluado);
        setReporte(evaluado);
        vibrarOk();
        navegarEvaluarV2(router, "/evaluar-v2/informe-final");
        return;
      }
      setAnalizando(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 520);
  };

  const volver = () => {
    if (analizando || flujo.pasoActual <= 1) return;
    vibrarOk();
    persistir(retrocederFlujoProgresivoV4(flujo));
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const feedbackBoton = (id: string) => ({
    onPointerDown: () => setBotonActivo(id),
    onPointerUp: () => setBotonActivo(""),
    onPointerCancel: () => setBotonActivo(""),
    onPointerLeave: () => setBotonActivo(""),
  });
  const estiloFeedback = (id: string) =>
    botonActivo === id
      ? { transform: "translateY(2px) scale(0.987)", filter: "brightness(1.1)" }
      : {};

  return (
    <>
      <PremiumMobileViewport />
      <main style={pageStyle}>
        <div style={containerStyle}>
          <HeaderReportePremium
            subtitulo="Análisis preventivo progresivo"
            detalle="Cada respuesta abre una ruta técnica específica y verificable."
          />
          <EtapasPremium actual={2} />

          {!cargado ? (
            <section
              style={{
                ...glassPanelStyle,
                padding: "24px 18px",
                textAlign: "center",
                fontWeight: 850,
                color: "rgba(225,239,255,0.82)",
              }}
            >
              Preparando análisis preventivo…
            </section>
          ) : (
            <>
              <section
                style={{
                  ...glassPanelStyle,
                  padding: "14px",
                  marginBottom: "12px",
                  background:
                    "linear-gradient(135deg, rgba(8,67,116,0.82), rgba(3,29,66,0.90))",
                }}
              >
                <ProgresoPreguntasPremium
                  actual={flujo.pasoActual}
                  total={flujo.totalPreguntas}
                  respondidas={respondidas}
                  detalle="Ruta inteligente"
                />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "9px",
                    minHeight: "30px",
                    borderRadius: "12px",
                    padding: "8px 10px",
                    background: analizando
                      ? "rgba(33,150,243,0.16)"
                      : "rgba(57,255,20,0.08)",
                    border: analizando
                      ? "1px solid rgba(88,186,255,0.32)"
                      : "1px solid rgba(57,255,20,0.22)",
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      border: "2px solid rgba(114,204,255,0.30)",
                      borderTopColor: analizando ? "#55c6ff" : "#39FF14",
                      boxSizing: "border-box",
                      boxShadow: analizando
                        ? "0 0 14px rgba(85,198,255,0.50)"
                        : "0 0 12px rgba(57,255,20,0.35)",
                    }}
                  />
                  <span
                    style={{
                      color: "rgba(229,242,255,0.88)",
                      fontSize: "12px",
                      lineHeight: 1.25,
                      fontWeight: 850,
                    }}
                  >
                    {analizando
                      ? pregunta.estadoAnalisis
                      : `Motor listo · ${pregunta.estadoAnalisis}`}
                  </span>
                </div>
                {analizando && (
                  <div
                    aria-label="Motor analizando"
                    style={{
                      height: "3px",
                      marginTop: "9px",
                      overflow: "hidden",
                      borderRadius: "999px",
                      background: "rgba(130,197,255,0.15)",
                    }}
                  >
                    <div
                      style={{
                        width: "78%",
                        height: "100%",
                        borderRadius: "999px",
                        background: "linear-gradient(90deg, #39FF14, #49c8ff, #1d73ff)",
                        boxShadow: "0 0 16px rgba(73,200,255,0.64)",
                      }}
                    />
                  </div>
                )}
              </section>

              {verificacionesPrevias.length > 0 && (
                <details
                  style={{
                    ...glassPanelStyle,
                    padding: "11px 13px",
                    marginBottom: "12px",
                    background: "rgba(4,29,67,0.68)",
                  }}
                >
                  <summary
                    style={{
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 900,
                      color: "rgba(215,236,255,0.78)",
                    }}
                  >
                    Ruta comprendida · {verificacionesPrevias.length} respuesta(s)
                  </summary>
                  <div style={{ display: "grid", gap: "8px", marginTop: "10px" }}>
                    {verificacionesPrevias.map((item, index) => (
                      <div
                        key={`${item.pregunta}-${index}`}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "22px 1fr",
                          gap: "8px",
                          alignItems: "start",
                          fontSize: "12px",
                          lineHeight: 1.3,
                        }}
                      >
                        <span
                          aria-hidden="true"
                          style={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "7px",
                            display: "grid",
                            placeItems: "center",
                            background: "#39FF14",
                            color: "#06213b",
                            fontWeight: 950,
                          }}
                        >
                          ✓
                        </span>
                        <span>
                          <span style={{ color: "rgba(215,231,250,0.65)" }}>
                            {item.pregunta}
                          </span>
                          <br />
                          <strong style={{ color: "rgba(240,255,228,0.94)" }}>
                            {item.respuesta}
                          </strong>
                        </span>
                      </div>
                    ))}
                  </div>
                </details>
              )}

              <section
                aria-live="polite"
                style={{
                  ...glassPanelStyle,
                  padding: "17px 15px",
                  marginBottom: "12px",
                  background:
                    "linear-gradient(180deg, rgba(24,78,133,0.82), rgba(4,28,65,0.92))",
                  opacity: analizando ? 0.72 : 1,
                  transform: analizando ? "scale(0.992)" : "none",
                  transition: "opacity 180ms ease, transform 180ms ease",
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    borderRadius: "999px",
                    padding: "5px 9px",
                    marginBottom: "10px",
                    color: "rgba(206,236,255,0.90)",
                    background: "rgba(47,154,255,0.14)",
                    border: "1px solid rgba(94,187,255,0.28)",
                    fontSize: "11px",
                    fontWeight: 900,
                  }}
                >
                  {pregunta.etapa}
                </div>
                <h2
                  style={{
                    margin: "0 0 8px",
                    fontSize: "21px",
                    lineHeight: 1.2,
                    letterSpacing: "-0.015em",
                    fontWeight: 950,
                  }}
                >
                  {pregunta.texto}
                </h2>
                <p
                  style={{
                    margin: "0 0 15px",
                    color: "rgba(219,234,253,0.69)",
                    fontSize: "13px",
                    lineHeight: 1.4,
                    fontWeight: 650,
                  }}
                >
                  {pregunta.apoyo}
                </p>

                <div style={{ display: "grid", gap: "9px" }}>
                  {pregunta.opciones.map((item) => {
                    const activa = seleccionadas.includes(item.id);
                    const idBoton = `${pregunta.id}-${item.id}`;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        disabled={analizando}
                        aria-pressed={activa}
                        onClick={() => seleccionar(item.id)}
                        {...feedbackBoton(idBoton)}
                        style={{
                          ...buttonStyle,
                          minHeight: "70px",
                          display: "grid",
                          gridTemplateColumns: "28px 1fr",
                          alignItems: "center",
                          gap: "11px",
                          padding: "12px 13px",
                          textAlign: "left",
                          color: "white",
                          background: activa
                            ? "linear-gradient(135deg, rgba(57,255,20,0.25), rgba(10,104,55,0.42))"
                            : "linear-gradient(180deg, rgba(6,34,75,0.76), rgba(2,22,51,0.82))",
                          border: activa
                            ? "1.5px solid rgba(57,255,20,0.94)"
                            : "1px solid rgba(141,190,245,0.24)",
                          boxShadow: activa
                            ? "0 0 0 1px rgba(57,255,20,0.22), 0 12px 28px rgba(31,212,12,0.15), inset 0 1px 0 rgba(255,255,255,0.15)"
                            : "inset 0 1px 0 rgba(255,255,255,0.06)",
                          ...estiloFeedback(idBoton),
                        }}
                      >
                        <span
                          aria-hidden="true"
                          style={{
                            width: "27px",
                            height: "27px",
                            borderRadius: pregunta.multiple ? "9px" : "50%",
                            display: "grid",
                            placeItems: "center",
                            border: activa
                              ? "2px solid #39FF14"
                              : "2px solid rgba(178,205,238,0.54)",
                            background: activa ? "#39FF14" : "rgba(255,255,255,0.04)",
                            color: "#061a33",
                            fontSize: "16px",
                            fontWeight: 950,
                            boxShadow: activa ? "0 0 16px rgba(57,255,20,0.58)" : "none",
                          }}
                        >
                          {activa ? "✓" : ""}
                        </span>
                        <span style={{ display: "grid", gap: "4px" }}>
                          <strong style={{ fontSize: "15px", lineHeight: 1.22 }}>
                            {item.titulo}
                          </strong>
                          <span
                            style={{
                              color: activa
                                ? "rgba(235,255,229,0.82)"
                                : "rgba(213,230,251,0.66)",
                              fontSize: "12px",
                              lineHeight: 1.35,
                              fontWeight: 620,
                            }}
                          >
                            {item.descripcion}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {error && (
                <div
                  role="alert"
                  style={{
                    marginBottom: "10px",
                    borderRadius: "13px",
                    padding: "11px 12px",
                    color: "#ffe6e6",
                    background: "rgba(157,25,49,0.45)",
                    border: "1px solid rgba(255,123,146,0.42)",
                    fontSize: "13px",
                    fontWeight: 850,
                  }}
                >
                  {error}
                </div>
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: flujo.pasoActual > 1 ? "0.72fr 1.28fr" : "1fr",
                  gap: "9px",
                }}
              >
                {flujo.pasoActual > 1 && (
                  <button
                    type="button"
                    disabled={analizando}
                    onClick={volver}
                    {...feedbackBoton("volver")}
                    style={{
                      ...buttonStyle,
                      color: "white",
                      background: "rgba(8,35,72,0.80)",
                      opacity: analizando ? 0.58 : 1,
                      ...estiloFeedback("volver"),
                    }}
                  >
                    Atrás
                  </button>
                )}
                <button
                  type="button"
                  disabled={analizando || seleccionadas.length === 0}
                  onClick={continuar}
                  {...feedbackBoton("continuar")}
                  style={{
                    ...primaryButtonStyle,
                    opacity: analizando || seleccionadas.length === 0 ? 0.58 : 1,
                    ...estiloFeedback("continuar"),
                  }}
                >
                  {analizando
                    ? "Analizando…"
                    : flujo.pasoActual === flujo.totalPreguntas
                      ? "Construir informe preventivo"
                      : "Analizar y continuar"}
                </button>
              </div>
              <AutoGuardadoPremium />
            </>
          )}
          <FirmaPremium />
        </div>
      </main>
    </>
  );
}
