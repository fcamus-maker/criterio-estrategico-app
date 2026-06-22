"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  navegarEvaluarV2,
  preservarBanderaSelectorPreventivoV2,
} from "../../offlineNavigation";
import {
  aplicarResultadoMotorV2AReporte,
  evaluarReporteConMotorV2Seguro,
} from "../../motor-v2/adaptadorMotorV2";
import {
  obtenerFormularioAdaptativoV2,
  puntajeRespuestasAdaptativasV2,
  type PreguntaFormularioAdaptativaV2,
} from "../../motor-v2/formularioAdaptativoV2";
import { construirMapeoRespuestasPreventivas } from "../../motor-v2/mapeoRespuestasPreventivasV2";
import {
  construirContextoFingerprintPreventivo,
  obtenerPreguntasPaso2Preventivo,
  obtenerFormularioPreguntasConFallback,
  ronda2PreventivaCompleta,
  type ContextoActivacionSelectorPreventivoV2,
  VERSION_FLUJO_PREVENTIVO,
} from "../../motor-v2/orquestadorPreguntasPreventivasV2";
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

type ReporteV2 = ReporteV2Storage & {
  codigo?: string;
  supervisor?: string;
  empresa?: string;
  obra?: string;
  area?: string;
  descripcion?: string;
  evaluacion?: {
    respuestas?: Record<string, string>;
    puntaje?: number;
    criticidad?: string;
    prioridad?: string;
    recomendacion?: string;
    accionInmediata?: string;
  } & ReporteV2Storage["evaluacion"];
};

function vibrarOk() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(20);
  }
}

function calcularResultado(puntaje: number) {
  if (puntaje >= 80) {
    return {
      puntaje,
      criticidad: "CRÍTICO",
      prioridad: "Urgente",
      recomendacion: "Detener el trabajo, controlar el área y corregir antes de continuar.",
      accionInmediata: "Suspender actividad y asegurar condición crítica.",
    };
  }

  if (puntaje >= 45) {
    return {
      puntaje,
      criticidad: "ALTO",
      prioridad: "Alta",
      recomendacion: "Corregir la condición a la brevedad y reforzar controles.",
      accionInmediata: "Restringir el área hasta implementar control inmediato.",
    };
  }

  if (puntaje >= 20) {
    return {
      puntaje,
      criticidad: "MEDIO",
      prioridad: "Media",
      recomendacion: "Programar corrección prioritaria y mantener seguimiento.",
      accionInmediata: "Controlar y supervisar la condición reportada.",
    };
  }

  return {
    puntaje,
    criticidad: "BAJO",
    prioridad: "Normal",
    recomendacion: "Mantener control y seguimiento normal del hallazgo.",
    accionInmediata: "Monitorear y corregir según programación.",
  };
}

function contextoSelectorPreventivoCompletoPaso2(reporte?: ReporteV2 | null): ContextoActivacionSelectorPreventivoV2 {
  const entorno = process.env.NODE_ENV === "production" ? "produccion" : "desarrollo";

  if (typeof window === "undefined") {
    return {
      entorno,
      forzarActivacion: reporte?.evaluacion?.flujo_preventivo?.modo === "preventivo",
    };
  }

  return {
    entorno,
    hostname: window.location.hostname,
    forzarActivacion: reporte?.evaluacion?.flujo_preventivo?.modo === "preventivo",
  };
}

export default function EvaluacionPaso2V2Page() {
  const router = useRouter();
  const [reporte, setReporte] = useState<ReporteV2 | null>(null);
  const [cargado, setCargado] = useState(false);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [navegando, setNavegando] = useState(false);
  const [botonActivo, setBotonActivo] = useState("");

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const reporteActual = leerReporteActualV2() as ReporteV2 | null;
      setReporte(reporteActual);
      setRespuestas(reporteActual?.evaluacion?.respuestas || {});
      setCargado(true);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const formularioAdaptativo = reporte ? obtenerFormularioAdaptativoV2(reporte) : null;
  const formularioConFallback = reporte
    ? obtenerFormularioPreguntasConFallback({
        reporte,
        formularioActual: formularioAdaptativo,
        contexto: contextoSelectorPreventivoCompletoPaso2(reporte),
        respuestas,
      })
    : null;
  const fingerprintActual = reporte
    ? construirContextoFingerprintPreventivo(reporte, respuestas)
    : "";
  const flujoPreventivo = reporte?.evaluacion?.flujo_preventivo;
  const selectorPreventivoActivo =
    formularioConFallback?.modo === "preventivo" &&
    flujoPreventivo?.version === VERSION_FLUJO_PREVENTIVO &&
    flujoPreventivo?.modo === "preventivo" &&
    flujoPreventivo?.contextoFingerprint === fingerprintActual;
  const preguntas = selectorPreventivoActivo
    ? obtenerPreguntasPaso2Preventivo(reporte as ReporteV2, respuestas)
    : formularioAdaptativo?.preguntas.filter((pregunta) => pregunta.paso === 2) || [];
  const totalPreguntas = selectorPreventivoActivo
    ? preguntas.length
    : formularioAdaptativo?.preguntas.length || 0;
  const preguntasTotales = selectorPreventivoActivo
    ? formularioConFallback?.preguntas || []
    : formularioAdaptativo?.preguntas || [];
  const respondidasTotal = (selectorPreventivoActivo ? preguntas : preguntasTotales).filter((pregunta) => respuestas[pregunta.id]).length;
  const preguntaActual = Math.min(respondidasTotal + 1, Math.max(totalPreguntas, 1));

  const seleccionar = (id: string, value: string) => {
    setRespuestas((actuales) => ({
      ...actuales,
      [id]: value,
    }));
    setError("");
  };

  const finalizar = () => {
    if (navegando) return;
    if (!reporte) return;

    const preguntasRequeridas = selectorPreventivoActivo ? preguntas : formularioAdaptativo?.preguntas || [];
    const faltanRespuestas = selectorPreventivoActivo
      ? !ronda2PreventivaCompleta(preguntas, respuestas)
      : preguntasRequeridas.some((pregunta) => !respuestas[pregunta.id]);

    if (faltanRespuestas) {
      setError("Debes responder todas las preguntas antes de ver el resultado.");
      return;
    }

    const mapeoPreventivo = selectorPreventivoActivo
      ? construirMapeoRespuestasPreventivas({
          descripcionHallazgo: reporte.descripcion,
          riesgoEspecificoDetectado:
            reporte.evaluacion?.riesgo_especifico_detectado ||
            respuestas.transversal_anclaje_riesgo_especifico,
          respuestasPreventivas: respuestas,
          formularioPreventivo: formularioConFallback?.formularioPreventivo,
          formularioActual: formularioAdaptativo || undefined,
          respuestasActuales: respuestas,
        })
      : undefined;
    const usarMapeoPreventivo =
      selectorPreventivoActivo &&
      mapeoPreventivo &&
      !mapeoPreventivo.requiereFallbackActual &&
      mapeoPreventivo.confianzaMapeo !== "baja";
    const respuestasResultado = usarMapeoPreventivo
      ? {
          ...respuestas,
          ...mapeoPreventivo.respuestasCompatiblesLegacy,
        }
      : respuestas;
    const puntajeAdaptativo = preguntasTotales.length > 0
      ? puntajeRespuestasAdaptativasV2(preguntasTotales, respuestasResultado)
      : 0;
    const resultado = {
      ...calcularResultado(puntajeAdaptativo),
      puntaje: puntajeAdaptativo,
    };
    const modoSelectorPreventivo: "preventivo" | "fallback_actual" = selectorPreventivoActivo
      ? "preventivo"
      : "fallback_actual";
    const clasificacion = formularioAdaptativo?.clasificacion;
    const reporteConResultadoAnterior = {
      ...reporte,
      evaluacion: {
        ...(reporte.evaluacion || {}),
        respuestas: respuestasResultado,
        categoria_detectada: clasificacion?.categoriaDetectada,
        modulo_preguntas_sugerido: clasificacion?.moduloPreguntasSugerido,
        preguntas_sugeridas: formularioAdaptativo?.preguntas,
        preguntas_faltantes_recomendadas: formularioAdaptativo?.preguntas,
        justificacion_modulo_preguntas: clasificacion?.justificacionModuloPreguntas,
        confianza_clasificacion: clasificacion?.confianza,
        palabras_clave_detectadas: clasificacion?.palabrasClaveDetectadas,
        selector_preventivo_activo: selectorPreventivoActivo,
        selector_preventivo_modo: modoSelectorPreventivo,
        selector_preventivo_resumen: selectorPreventivoActivo
          ? {
              ...(formularioConFallback?.resumen || {}),
              requiereFallbackActual: Boolean(mapeoPreventivo?.requiereFallbackActual),
              confianzaMapeo: mapeoPreventivo?.confianzaMapeo,
            }
          : formularioConFallback?.resumen,
        flujo_preventivo: selectorPreventivoActivo && flujoPreventivo
          ? {
              ...flujoPreventivo,
              estado: "RESULTADO_LISTO" as const,
              ronda2Completa: true,
            }
          : flujoPreventivo,
        ...resultado,
      },
    };
    const resultadoMotorV2 = evaluarReporteConMotorV2Seguro(
      reporteConResultadoAnterior
    );
    const actualizado = aplicarResultadoMotorV2AReporte(
      reporteConResultadoAnterior,
      resultadoMotorV2
    );

    guardarReporteActualV2(actualizado);
    setNavegando(true);
    vibrarOk();
    navegarEvaluarV2(router, "/evaluar-v2/resultado");
  };

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

  const etiquetaCategoria = (valor?: string) =>
    valor
      ? valor
          .split("_")
          .filter(Boolean)
          .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
          .join(" ")
      : "No determinada";

  const renderPregunta = (pregunta: PreguntaFormularioAdaptativaV2) => (
    <section key={pregunta.id} style={cardStyle}>
      <div style={{ fontSize: "12px", opacity: 0.62, marginBottom: "6px" }}>
        {selectorPreventivoActivo ? "Ronda 2 · Evaluación preventiva" : etiquetaCategoria(pregunta.modulo)}
      </div>
      <div
        style={{
          fontSize: "16px",
          fontWeight: 800,
          lineHeight: 1.35,
          marginBottom: "8px",
        }}
      >
        {pregunta.texto}
      </div>
      <div style={{ fontSize: "12px", lineHeight: 1.4, opacity: 0.7, marginBottom: "12px" }}>
        {pregunta.objetivo}
      </div>
      {pregunta.tipoRespuesta === "texto" ? (
        <textarea
          value={respuestas[pregunta.id] || ""}
          onChange={(event) => seleccionar(pregunta.id, event.target.value)}
          placeholder="Escribe una respuesta breve"
          rows={3}
          style={{
            width: "100%",
            resize: "vertical",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: "16px",
            padding: "13px",
            boxSizing: "border-box",
            color: "white",
            background: "rgba(255,255,255,0.10)",
            fontSize: "15px",
            fontWeight: 700,
            outline: "none",
          }}
        />
      ) : (
        <div style={{ display: "grid", gap: "8px" }}>
          {(Array.isArray(pregunta.opciones) ? pregunta.opciones : []).map((opcion) => {
            const activa = respuestas[pregunta.id] === opcion.value;

            return (
              <button
                key={opcion.value}
                type="button"
                onClick={() => seleccionar(pregunta.id, opcion.value)}
                {...feedbackBoton(`${pregunta.id}-${opcion.value}`)}
                style={{
                  ...buttonStyle,
                  color: "white",
                  background: activa
                    ? "linear-gradient(180deg, #2593ff 0%, #145ee9 48%, #07339b 100%)"
                    : "rgba(3,20,48,0.24)",
                  border: activa
                    ? "1px solid rgba(169,215,255,0.72)"
                    : "1px solid rgba(151,197,255,0.20)",
                  boxShadow: activa
                    ? "0 14px 26px rgba(15,94,255,0.30), inset 0 1px 0 rgba(255,255,255,0.25)"
                    : "none",
                  textAlign: "left",
                  ...estiloFeedback(`${pregunta.id}-${opcion.value}`),
                }}
              >
                {opcion.label}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );

  const pageStyle = {
    minHeight: "100dvh",
    backgroundColor: "#020b1f",
    background:
      "radial-gradient(circle at 22% 12%, rgba(60,130,220,0.46) 0%, rgba(7,32,68,0.92) 31%, rgba(2,12,32,1) 72%), linear-gradient(180deg, #05244a 0%, #020b1f 100%)",
    color: "white",
    fontFamily: "Arial, sans-serif",
    overflowX: "hidden" as const,
    overscrollBehaviorY: "none" as const,
    touchAction: "pan-y" as const,
  };

  const containerStyle = {
    width: "100%",
    maxWidth: "430px",
    margin: "0 auto",
    minHeight: "100dvh",
    padding:
      "calc(12px + env(safe-area-inset-top)) 15px calc(34px + env(safe-area-inset-bottom))",
    boxSizing: "border-box" as const,
    overflowX: "hidden" as const,
    overscrollBehaviorY: "contain" as const,
    touchAction: "pan-y" as const,
  };

  const cardStyle = {
    borderRadius: "18px",
    background:
      "linear-gradient(180deg, rgba(22,72,124,0.66), rgba(4,26,60,0.78))",
    border: "1px solid rgba(151,197,255,0.30)",
    boxShadow:
      "0 18px 42px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.11), inset 0 -1px 0 rgba(33,150,243,0.10)",
    padding: "14px",
    boxSizing: "border-box" as const,
    maxWidth: "100%",
    overflowX: "hidden" as const,
    marginBottom: "14px",
  };

  const buttonStyle = {
    width: "100%",
    maxWidth: "100%",
    fontSize: "16px",
    touchAction: "manipulation" as const,
    border: "1px solid rgba(128,184,255,0.50)",
    borderRadius: "18px",
    padding: "14px",
    fontWeight: 900,
    cursor: "pointer",
    boxSizing: "border-box" as const,
    transition: "transform 120ms ease, filter 120ms ease, box-shadow 120ms ease",
  };

  return (
    <>
      <PremiumMobileViewport />
      <main
        style={pageStyle}
        onDoubleClick={(event) => {
          event.preventDefault();
        }}
      >
      <div style={containerStyle}>
        <HeaderReportePremium
          subtitulo="Evaluación preventiva"
          detalle="Ronda enfocada según señales y respuestas registradas."
        />
        <EtapasPremium actual={2} />
        <header style={{ marginBottom: "14px" }}>
          <a
            href={preservarBanderaSelectorPreventivoV2("/evaluar-v2/evaluacion/paso1")}
            onClick={vibrarOk}
            {...feedbackBoton("volver-paso1")}
            style={{
              color: "white",
              textDecoration: "none",
              fontSize: "15px",
              fontWeight: 800,
              opacity: 0.9,
              display: "inline-block",
              transition: "transform 120ms ease, filter 120ms ease",
              ...estiloFeedback("volver-paso1"),
            }}
          >
            Volver al paso 1
          </a>
        </header>

        {!cargado && <section style={cardStyle}>Cargando evaluación...</section>}

        {cargado && !reporte && (
          <section style={cardStyle}>
            <div style={{ fontSize: "18px", fontWeight: 900, marginBottom: "12px" }}>
              No hay reporte disponible
            </div>
            <a
              href={preservarBanderaSelectorPreventivoV2("/evaluar-v2/reportar")}
              onClick={vibrarOk}
              {...feedbackBoton("sin-reporte")}
              style={{
                ...buttonStyle,
                display: "block",
                textAlign: "center",
                textDecoration: "none",
                color: "white",
                background:
                  "linear-gradient(180deg, #2593ff 0%, #145ee9 48%, #07339b 100%)",
                ...estiloFeedback("sin-reporte"),
              }}
            >
              Volver a reportar
            </a>
          </section>
        )}

        {reporte && (
          <>
            <section style={cardStyle}>
              <ProgresoPreguntasPremium
                actual={preguntaActual}
                total={totalPreguntas || preguntas.length}
                respondidas={respondidasTotal}
                detalle="Ronda enfocada"
              />
              <div style={{ fontSize: "12px", opacity: 0.65 }}>Reporte</div>
              <div style={{ fontSize: "18px", fontWeight: 900 }}>
                {reporte.codigo || "Sin código"}
              </div>
              <div style={{ marginTop: "6px", fontSize: "14px", opacity: 0.78 }}>
                {reporte.area || "Sin área"} · {reporte.empresa || "Sin empresa"}
              </div>
              {formularioAdaptativo && !selectorPreventivoActivo && (
                <div
                  style={{
                    marginTop: "12px",
                    padding: "10px",
                    borderRadius: "14px",
                    background: "rgba(32,123,255,0.13)",
                    border: "1px solid rgba(112,182,255,0.28)",
                    fontSize: "12px",
                    lineHeight: 1.45,
                  }}
                >
                  <strong>Módulo:</strong>{" "}
                  {etiquetaCategoria(formularioAdaptativo.clasificacion.moduloPreguntasSugerido)}
                  <br />
                  <strong>Confianza:</strong> {formularioAdaptativo.clasificacion.confianza}
                  <br />
                  {formularioAdaptativo.clasificacion.justificacionModuloPreguntas}
                </div>
              )}
            </section>

            {preguntas.map(renderPregunta)}

            {error && (
              <section
                style={{
                  ...cardStyle,
                  background: "rgba(239,68,68,0.16)",
                  border: "1px solid rgba(239,68,68,0.35)",
                  fontWeight: 900,
                }}
              >
                {error}
              </section>
            )}

            <button
              type="button"
              onClick={finalizar}
              disabled={navegando}
              {...feedbackBoton("ver-resultado")}
              style={{
                ...buttonStyle,
                color: "white",
                background: navegando
                  ? "rgba(255,255,255,0.18)"
                  : "linear-gradient(180deg, #2593ff 0%, #145ee9 48%, #07339b 100%)",
                boxShadow:
                  "0 20px 36px rgba(15,94,255,0.42), inset 0 1px 0 rgba(255,255,255,0.30), inset 0 -10px 24px rgba(0,18,94,0.30)",
                opacity: navegando ? 0.72 : 1,
                ...estiloFeedback("ver-resultado"),
              }}
            >
              {navegando
                ? "Calculando..."
                : selectorPreventivoActivo
                  ? `Ver resultado · Ronda 2 (${preguntas.length}/${totalPreguntas})`
                  : `Ver resultado (${preguntas.length}/${totalPreguntas})`}
            </button>
            <AutoGuardadoPremium />
          </>
        )}
        <FirmaPremium />
      </div>
      </main>
    </>
  );
}
