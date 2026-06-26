"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  matrizUniversalSolicitadaEnUrlV2,
  navegarEvaluarV2,
  preservarBanderaSelectorPreventivoV2,
} from "../../offlineNavigation";
import {
  obtenerFormularioAdaptativoV2,
  type PreguntaFormularioAdaptativaV2,
} from "../../motor-v2/formularioAdaptativoV2";
import {
  construirContextoFingerprintPreventivo,
  construirFlujoPreventivoTrasRonda1,
  limpiarRespuestasRonda2SiCambiaContexto,
  obtenerPreguntasPaso1Preventivo,
  obtenerFormularioPreguntasConFallback,
  selectorPreventivoEstaHabilitado,
  validarContratoRonda1,
  type ContextoActivacionSelectorPreventivoV2,
} from "../../motor-v2/orquestadorPreguntasPreventivasV2";
import {
  construirEntradaShadowDesdeReporte,
  ejecutarSelectorPreventivoShadow,
} from "../../motor-v2/selectorPreventivoShadowV2";
import {
  aplicarResultadoMatrizUniversalACompatibilidadV2,
  clasificarMatrizUniversalV1,
} from "../../motor-v2/clasificadorMatrizUniversalV1";
import type {
  ContradiccionMatrizUniversalV1,
  RespuestaUniversalV1,
  ResultadoMatrizUniversalV1,
} from "../../motor-v2/esquemasRespuestasUniversalesV1";
import {
  PREGUNTAS_UNIVERSALES_HALLAZGOS_V1,
  VERSION_MATRIZ_UNIVERSAL_V1,
  type PreguntaUniversalHallazgoV1,
} from "../../motor-v2/preguntasUniversalesHallazgosV1";
import {
  actualizarTextoRespuestaUniversalV1,
  construirVectorUniversalV1,
  detectarContradiccionesMatrizUniversalV1,
  matrizUniversalCompletaV1,
  obtenerPreguntasContradictoriasV1,
  respuestaUniversalValidaV1,
  seleccionarOpcionUniversalV1,
  contarPalabrasMatrizUniversalV1,
} from "../../motor-v2/validacionMatrizUniversalV1";
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

const ID_RIESGO_ESPECIFICO = "transversal_anclaje_riesgo_especifico";
const PREGUNTA_RIESGO_ESPECIFICO: PreguntaFormularioAdaptativaV2 = {
  id: ID_RIESGO_ESPECIFICO,
  modulo: "otro_indeterminado",
  texto: "¿Cuál es el riesgo específico detectado?",
  objetivo:
    "Responda breve, idealmente en 3 a 5 palabras. Ejemplo: vidrio quebrado, trabajador sin arnés, madera con clavos, extintor vencido.",
  paso: 1,
  tipoRespuesta: "texto",
  opciones: [],
};

type ReporteV2 = ReporteV2Storage & {
  codigo?: string;
  supervisor?: string;
  empresa?: string;
  obra?: string;
  area?: string;
  descripcion?: string;
  evaluacion?: {
    respuestas?: Record<string, string>;
  } & ReporteV2Storage["evaluacion"];
};

function vibrarOk() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(20);
  }
}

function contextoSelectorPreventivoShadowPaso1() {
  const entorno = process.env.NODE_ENV === "production" ? "produccion" : "desarrollo";

  if (typeof window === "undefined") return { entorno } as const;

  const parametros = new URLSearchParams(window.location.search);

  return {
    entorno,
    hostname: window.location.hostname,
    forzarActivacion:
      parametros.get("ce_selector_shadow") === "1" ||
      parametros.get("selector_shadow") === "1",
  } as const;
}

function contextoSelectorPreventivoCompletoPaso1(): ContextoActivacionSelectorPreventivoV2 {
  const entorno = process.env.NODE_ENV === "production" ? "produccion" : "desarrollo";

  if (typeof window === "undefined") return { entorno };

  const parametros = new URLSearchParams(window.location.search);

  return {
    entorno,
    hostname: window.location.hostname,
    forzarActivacion:
      parametros.get("ce_selector_preventivo") === "1" ||
      parametros.get("selector_preventivo") === "1",
  };
}

function matrizUniversalEstaActivaPaso1(reporte?: ReporteV2 | null) {
  if (reporte?.evaluacion?.matriz_universal?.activa) return true;
  return matrizUniversalSolicitadaEnUrlV2();
}

function adjuntarResumenSelectorShadowPaso1(
  reporte: ReporteV2,
  formularioActual: ReturnType<typeof obtenerFormularioAdaptativoV2> | null
): ReporteV2 {
  try {
    const resultado = ejecutarSelectorPreventivoShadow({
      ...construirEntradaShadowDesdeReporte(reporte, formularioActual),
      contexto: contextoSelectorPreventivoShadowPaso1(),
    });

    if (!resultado.ok || !resultado.ejecutado || resultado.resumen.activo !== true) {
      return reporte;
    }

    return {
      ...reporte,
      evaluacion: {
        ...(reporte.evaluacion || {}),
        selector_preventivo_shadow: resultado.resumen,
      },
    };
  } catch {
    return reporte;
  }
}

export default function EvaluacionPaso1V2Page() {
  const router = useRouter();
  const [reporte, setReporte] = useState<ReporteV2 | null>(null);
  const [cargado, setCargado] = useState(false);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [navegando, setNavegando] = useState(false);
  const [botonActivo, setBotonActivo] = useState("");
  const [respuestasMatrizUniversal, setRespuestasMatrizUniversal] = useState<
    Record<string, RespuestaUniversalV1>
  >({});
  const [contradiccionesMatrizUniversal, setContradiccionesMatrizUniversal] =
    useState<ContradiccionMatrizUniversalV1[]>([]);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const reporteActual = leerReporteActualV2() as ReporteV2 | null;
      setReporte(reporteActual);
      setRespuestas(reporteActual?.evaluacion?.respuestas || {});
      setRespuestasMatrizUniversal(
        reporteActual?.evaluacion?.matriz_universal?.respuestas || {}
      );
      setCargado(true);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const matrizUniversalActiva = matrizUniversalEstaActivaPaso1(reporte);
  const formularioAdaptativo =
    reporte && !matrizUniversalActiva ? obtenerFormularioAdaptativoV2(reporte) : null;
  const contextoSelectorPreventivo = contextoSelectorPreventivoCompletoPaso1();
  const preguntasPreventivasPaso1 = obtenerPreguntasPaso1Preventivo();
  const contratoRonda1 = validarContratoRonda1(preguntasPreventivasPaso1);
  const selectorPreventivoActivo =
    !matrizUniversalActiva &&
    selectorPreventivoEstaHabilitado(contextoSelectorPreventivo) &&
    contratoRonda1.valido;
  const formularioConFallback = reporte && !selectorPreventivoActivo && !matrizUniversalActiva
    ? obtenerFormularioPreguntasConFallback({
        reporte,
        formularioActual: formularioAdaptativo,
        contexto: contextoSelectorPreventivo,
        respuestas,
      })
    : null;
  const preguntasOriginales = formularioAdaptativo?.preguntas || [];
  const tienePreguntaRiesgoEspecifico = preguntasOriginales.some(
    (pregunta) => pregunta.id === ID_RIESGO_ESPECIFICO
  );
  const preguntasTotales = selectorPreventivoActivo
    ? preguntasPreventivasPaso1
    : tienePreguntaRiesgoEspecifico
      ? preguntasOriginales
      : [PREGUNTA_RIESGO_ESPECIFICO, ...preguntasOriginales];
  const preguntas = preguntasTotales.filter((pregunta) => pregunta.paso === 1);
  const totalPreguntas = selectorPreventivoActivo ? preguntas.length : preguntasTotales.length;
  const respondidasTotal = (selectorPreventivoActivo ? preguntas : preguntasTotales).filter(
    (pregunta) => respuestas[pregunta.id]
  ).length;
  const preguntaActual = Math.min(respondidasTotal + 1, Math.max(totalPreguntas, 1));
  const ronda1Completa = selectorPreventivoActivo
    ? preguntas.length === 5 && respondidasTotal === 5
    : false;

  const seleccionar = (id: string, value: string) => {
    setRespuestas((actuales) => ({
      ...actuales,
      [id]: value,
    }));
    if (id === ID_RIESGO_ESPECIFICO) {
      setReporte((actual) =>
        actual
          ? {
              ...actual,
              evaluacion: {
                ...(actual.evaluacion || {}),
                riesgo_especifico_detectado: value.trim() || undefined,
              },
            }
          : actual
      );
    }
    setError("");
  };

  const persistirMatrizUniversal = (
    respuestasSiguientes: Record<string, RespuestaUniversalV1>,
    preguntaActual: number,
    resultadoClasificacion?: ResultadoMatrizUniversalV1
  ) => {
    if (!reporte) return;

    const completa = matrizUniversalCompletaV1(respuestasSiguientes);
    const actualizado = {
      ...reporte,
      descripcion:
        respuestasSiguientes.universal_hallazgo?.texto?.trim() ||
        reporte.descripcion,
      evaluacion: {
        ...(reporte.evaluacion || {}),
        matriz_universal: {
          version: VERSION_MATRIZ_UNIVERSAL_V1,
          activa: true as const,
          preguntaActual,
          totalPreguntas: 12 as const,
          completa,
          respuestas: respuestasSiguientes,
          resultadoClasificacion:
            resultadoClasificacion ||
            reporte.evaluacion?.matriz_universal?.resultadoClasificacion,
        },
        ...(resultadoClasificacion
          ? aplicarResultadoMatrizUniversalACompatibilidadV2(resultadoClasificacion)
          : {}),
      },
    };

    setReporte(actualizado);
    guardarReporteActualV2(actualizado);
  };

  const actualizarRespuestaTextoMatrizUniversal = (
    pregunta: PreguntaUniversalHallazgoV1,
    texto: string
  ) => {
    setRespuestasMatrizUniversal((actuales) => {
      const siguientes = {
        ...actuales,
        [pregunta.id]: actualizarTextoRespuestaUniversalV1(
          pregunta,
          actuales[pregunta.id],
          texto
        ),
      };
      persistirMatrizUniversal(
        siguientes,
        PREGUNTAS_UNIVERSALES_HALLAZGOS_V1.findIndex((item) => item.id === pregunta.id)
      );
      return siguientes;
    });
    setContradiccionesMatrizUniversal([]);
    setError("");
  };

  const seleccionarOpcionMatrizUniversal = (
    pregunta: PreguntaUniversalHallazgoV1,
    opcionId: string
  ) => {
    setRespuestasMatrizUniversal((actuales) => {
      const siguientes = {
        ...actuales,
        [pregunta.id]: seleccionarOpcionUniversalV1(
          pregunta,
          actuales[pregunta.id],
          opcionId
        ),
      };
      persistirMatrizUniversal(
        siguientes,
        PREGUNTAS_UNIVERSALES_HALLAZGOS_V1.findIndex((item) => item.id === pregunta.id)
      );
      return siguientes;
    });
    setContradiccionesMatrizUniversal([]);
    setError("");
  };

  const completarMatrizUniversal = () => {
    const contradicciones =
      detectarContradiccionesMatrizUniversalV1(respuestasMatrizUniversal);
    setContradiccionesMatrizUniversal(contradicciones);

    if (contradicciones.length > 0) {
      setError("Revisa las respuestas marcadas antes de generar el análisis.");
      return null;
    }

    const vector = construirVectorUniversalV1(respuestasMatrizUniversal);
    const resultado = clasificarMatrizUniversalV1(vector, contradicciones);
    persistirMatrizUniversal(respuestasMatrizUniversal, 11, resultado);
    return resultado;
  };

  const verAnalisisMatrizUniversal = () => {
    if (navegando) return;
    const resultadoExistente =
      reporte?.evaluacion?.matriz_universal?.resultadoClasificacion;
    const resultado = resultadoExistente || completarMatrizUniversal();
    if (!resultado) return;

    setNavegando(true);
    vibrarOk();
    navegarEvaluarV2(router, "/evaluar-v2/resultado");
  };

  const continuar = () => {
    if (navegando) return;
    if (!reporte) return;

    const faltanRespuestas = preguntas.some((pregunta) => !respuestas[pregunta.id]);

    if (faltanRespuestas) {
      setError("Debes responder todas las preguntas antes de continuar.");
      return;
    }

    const clasificacion = formularioAdaptativo?.clasificacion;
    const riesgoEspecificoDetectado = respuestas[ID_RIESGO_ESPECIFICO]?.trim() || undefined;
    const respuestasActualizadas = {
      ...(reporte.evaluacion?.respuestas || {}),
      ...respuestas,
    };
    const fingerprintNuevo = selectorPreventivoActivo
      ? construirContextoFingerprintPreventivo(reporte, respuestasActualizadas)
      : "";
    const respuestasCompatibles = selectorPreventivoActivo
      ? limpiarRespuestasRonda2SiCambiaContexto(
          respuestasActualizadas,
          reporte.evaluacion?.flujo_preventivo,
          fingerprintNuevo
        )
      : respuestasActualizadas;
    const reporteParaFlujo = {
      ...reporte,
      evaluacion: {
        ...(reporte.evaluacion || {}),
        respuestas: respuestasCompatibles,
        riesgo_especifico_detectado: riesgoEspecificoDetectado,
      },
    };
    const preparacionFlujo = selectorPreventivoActivo
      ? construirFlujoPreventivoTrasRonda1(reporteParaFlujo, respuestasCompatibles)
      : null;
    const actualizado = {
      ...reporte,
      evaluacion: {
        ...(reporte.evaluacion || {}),
        respuestas: respuestasCompatibles,
        riesgo_especifico_detectado: riesgoEspecificoDetectado,
        categoria_detectada: clasificacion?.categoriaDetectada,
        modulo_preguntas_sugerido: clasificacion?.moduloPreguntasSugerido,
        preguntas_sugeridas: formularioAdaptativo?.preguntas,
        preguntas_faltantes_recomendadas: formularioAdaptativo?.preguntas,
        justificacion_modulo_preguntas: clasificacion?.justificacionModuloPreguntas,
        confianza_clasificacion: clasificacion?.confianza,
        palabras_clave_detectadas: clasificacion?.palabrasClaveDetectadas,
        selector_preventivo_activo: selectorPreventivoActivo,
        selector_preventivo_modo: selectorPreventivoActivo
          ? preparacionFlujo?.flujo.modo || "preventivo"
          : formularioConFallback?.modo,
        selector_preventivo_resumen: selectorPreventivoActivo
          ? {
              totalPreguntasPaso1: preguntas.length,
              totalPreguntasPaso2: preparacionFlujo?.preguntasPaso2.length || 0,
              requiereFallbackActual: false,
            }
          : formularioConFallback?.resumen,
        flujo_preventivo: selectorPreventivoActivo ? preparacionFlujo?.flujo : reporte.evaluacion?.flujo_preventivo,
      },
    };

    const actualizadoConShadow = selectorPreventivoActivo
      ? actualizado
      : adjuntarResumenSelectorShadowPaso1(actualizado, formularioAdaptativo);

    guardarReporteActualV2(actualizadoConShadow);
    setNavegando(true);
    vibrarOk();
    navegarEvaluarV2(router, "/evaluar-v2/evaluacion/paso2");
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
        {selectorPreventivoActivo
          ? pregunta.paso === 1
            ? "Ronda 1 · Contexto preventivo"
            : "Ronda 2 · Evaluación preventiva"
          : pregunta.id === ID_RIESGO_ESPECIFICO
            ? "Riesgo específico"
            : etiquetaCategoria(pregunta.modulo)}
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

  const preguntasUniversalesRespondidas = PREGUNTAS_UNIVERSALES_HALLAZGOS_V1.filter(
    (pregunta) => respuestaUniversalValidaV1(pregunta, respuestasMatrizUniversal[pregunta.id])
  );
  const matrizUniversalCompleta = matrizUniversalCompletaV1(respuestasMatrizUniversal);
  const preguntasContradictorias = obtenerPreguntasContradictoriasV1(
    contradiccionesMatrizUniversal
  );
  const idsPreguntasContradictorias = new Set(
    preguntasContradictorias.map((pregunta) => pregunta.id)
  );
  const faltantesMatrizUniversal =
    PREGUNTAS_UNIVERSALES_HALLAZGOS_V1.length - preguntasUniversalesRespondidas.length;
  const bloquesMatrizUniversal = [
    {
      titulo: "Identificación",
      rango: "Preguntas 1 a 4",
      preguntas: PREGUNTAS_UNIVERSALES_HALLAZGOS_V1.slice(0, 4),
    },
    {
      titulo: "Exposición y efecto",
      rango: "Preguntas 5 a 8",
      preguntas: PREGUNTAS_UNIVERSALES_HALLAZGOS_V1.slice(4, 8),
    },
    {
      titulo: "Evaluación del riesgo",
      rango: "Preguntas 9 y 10",
      preguntas: PREGUNTAS_UNIVERSALES_HALLAZGOS_V1.slice(8, 10),
    },
    {
      titulo: "Control y estado actual",
      rango: "Preguntas 11 y 12",
      preguntas: PREGUNTAS_UNIVERSALES_HALLAZGOS_V1.slice(10, 12),
    },
  ];

  const matrizPageStyle = {
    minHeight: "100dvh",
    backgroundColor: "#020b1f",
    background:
      "radial-gradient(circle at 22% 12%, rgba(60,130,220,0.46) 0%, rgba(7,32,68,0.92) 31%, rgba(2,12,32,1) 72%), linear-gradient(180deg, #05244a 0%, #020b1f 100%)",
    color: "#FFFFFF",
    fontFamily: "Arial, sans-serif",
    overflowX: "hidden" as const,
    touchAction: "pan-y" as const,
  };

  const matrizContainerStyle = {
    width: "100%",
    maxWidth: "430px",
    margin: "0 auto",
    minHeight: "100dvh",
    padding:
      "calc(14px + env(safe-area-inset-top)) 16px calc(28px + env(safe-area-inset-bottom))",
    boxSizing: "border-box" as const,
    display: "flex",
    flexDirection: "column" as const,
    gap: "14px",
  };

  const matrizCardStyle = {
    background:
      "linear-gradient(180deg, rgba(22,72,124,0.66), rgba(4,26,60,0.78))",
    borderRadius: "18px",
    border: "1px solid rgba(151,197,255,0.30)",
    boxShadow:
      "0 18px 42px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.11), inset 0 -1px 0 rgba(33,150,243,0.10)",
    padding: "18px",
    boxSizing: "border-box" as const,
  };

  const matrizButtonBase = {
    minHeight: "56px",
    borderRadius: "14px",
    border: "1px solid rgba(151,197,255,0.22)",
    background: "rgba(3,20,48,0.24)",
    color: "#FFFFFF",
    padding: "12px 14px",
    fontSize: "15px",
    fontWeight: 800,
    textAlign: "left" as const,
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    touchAction: "manipulation" as const,
  };

  const renderOpcionUniversal = (
    pregunta: PreguntaUniversalHallazgoV1,
    opcion: NonNullable<PreguntaUniversalHallazgoV1["opciones"]>[number],
    respuestaPregunta?: RespuestaUniversalV1
  ) => {
    const seleccionada = Boolean(respuestaPregunta?.opcionIds?.includes(opcion.id));
    const esMultiple = pregunta.tipo === "seleccion_multiple";

    return (
      <div key={opcion.id}>
        <button
          type="button"
          onClick={() => seleccionarOpcionMatrizUniversal(pregunta, opcion.id)}
          style={{
            ...matrizButtonBase,
            width: "100%",
            border: seleccionada
              ? "1.5px solid rgba(57,255,20,0.82)"
              : "1px solid rgba(151,197,255,0.22)",
            background: seleccionada
              ? "linear-gradient(180deg, rgba(57,255,20,0.20), rgba(31,212,12,0.13))"
              : "rgba(3,20,48,0.24)",
            color: "#FFFFFF",
            boxShadow: seleccionada ? "0 0 0 1px rgba(57,255,20,0.28)" : "none",
            overflow: "hidden",
            transform: seleccionada && botonActivo === `${pregunta.id}-${opcion.id}` ? "translateY(2px) scale(0.99)" : undefined,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: "22px",
              height: "22px",
              borderRadius: esMultiple ? "7px" : "999px",
              border: seleccionada
                ? "2px solid rgba(57,255,20,0.95)"
                : "2px solid rgba(183,196,216,0.74)",
              background: seleccionada ? "#39FF14" : "rgba(255,255,255,0.08)",
              color: "#061936",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              fontSize: "14px",
              fontWeight: 900,
            }}
          >
            {seleccionada ? "✓" : ""}
          </span>
          <span style={{ display: "grid", gap: "3px" }}>
            <span>{opcion.titulo || opcion.label}</span>
            {opcion.descripcion && (
              <span style={{ color: "rgba(221,240,255,0.72)", fontSize: "13px", fontWeight: 600, lineHeight: 1.35 }}>
                {opcion.descripcion}
              </span>
            )}
          </span>
        </button>
        {seleccionada && opcion.habilitaTexto && (
          <input
            value={respuestaPregunta?.texto || ""}
            onChange={(event) =>
              actualizarRespuestaTextoMatrizUniversal(pregunta, event.target.value)
            }
            placeholder="Describe brevemente"
            style={{
              width: "100%",
              marginTop: "8px",
              border: "1px solid #D8E2F0",
              borderRadius: "12px",
              padding: "12px",
              boxSizing: "border-box",
              color: "#0B1D3A",
              fontSize: "15px",
              outline: "none",
            }}
          />
        )}
      </div>
    );
  };

  if (matrizUniversalActiva) {
    return (
      <>
        <PremiumMobileViewport />
        <main style={matrizPageStyle}>
          <div
            style={{
              ...matrizContainerStyle,
              paddingBottom: "calc(118px + env(safe-area-inset-bottom))",
            }}
          >
            <header
              style={{
                color: "#FFFFFF",
                display: "grid",
                gap: "12px",
                position: "sticky",
                top: 0,
                zIndex: 2,
                background: "rgba(2,11,31,0.88)",
                paddingBottom: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => navegarEvaluarV2(router, "/evaluar-v2/reportar")}
                  style={{
                    border: "1px solid rgba(255,255,255,0.18)",
                    background: "rgba(255,255,255,0.08)",
                    color: "#FFFFFF",
                    borderRadius: "14px",
                    fontSize: "24px",
                    cursor: "pointer",
                    width: "42px",
                    height: "42px",
                    flexShrink: 0,
                  }}
                  aria-label="Volver a reporte"
                >
                  ‹
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "24px", fontWeight: 900, lineHeight: 1.05 }}>
                    Matriz universal
                  </div>
                  <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.74)", marginTop: "5px", lineHeight: 1.35 }}>
                    Completa las 12 preguntas para generar el análisis preventivo.
                  </div>
                </div>
                <div
                  style={{
                    borderRadius: "999px",
                    background: "rgba(255,255,255,0.14)",
                    padding: "8px 11px",
                    fontSize: "13px",
                    fontWeight: 900,
                    whiteSpace: "nowrap",
                  }}
                >
                  {preguntasUniversalesRespondidas.length}/12
                </div>
              </div>
              <div
                aria-label={`${preguntasUniversalesRespondidas.length} de 12 respondidas`}
                style={{
                  height: "10px",
                  borderRadius: "999px",
                  background: "rgba(255,255,255,0.16)",
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <div
                  style={{
                    width: `${(preguntasUniversalesRespondidas.length / 12) * 100}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #1FD40C 0%, #39FF14 100%)",
                    boxShadow: "none",
                    transition: "width 180ms ease",
                  }}
                />
              </div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.72)" }}>
                Autoguardado
              </div>
            </header>

            {!cargado && <section style={matrizCardStyle}>Cargando matriz universal...</section>}

            {cargado && !reporte && (
              <section style={matrizCardStyle}>
                <div style={{ fontSize: "20px", fontWeight: 900, marginBottom: "10px" }}>
                  No hay reporte disponible
                </div>
                <button
                  type="button"
                  onClick={() => navegarEvaluarV2(router, "/evaluar-v2/reportar")}
                  style={{
                    width: "100%",
                    border: "0",
                    borderRadius: "16px",
                    padding: "15px",
                    background: "#1F6FEF",
                    color: "#FFFFFF",
                    fontWeight: 900,
                    fontSize: "16px",
                  }}
                >
                  Volver a reportar
                </button>
              </section>
            )}

            {reporte && (
              <>
                {bloquesMatrizUniversal.map((bloque) => (
                  <section key={bloque.titulo} style={{ display: "grid", gap: "12px" }}>
                    <div
                      style={{
                        color: "#FFFFFF",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "end",
                        gap: "12px",
                        padding: "0 2px",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "18px", fontWeight: 900 }}>{bloque.titulo}</div>
                        <div style={{ fontSize: "12px", opacity: 0.68 }}>{bloque.rango}</div>
                      </div>
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.72)", fontWeight: 800 }}>
                        {
                          bloque.preguntas.filter((pregunta) =>
                            respuestaUniversalValidaV1(
                              pregunta,
                              respuestasMatrizUniversal[pregunta.id]
                            )
                          ).length
                        }
                        /{bloque.preguntas.length}
                      </div>
                    </div>

                    {bloque.preguntas.map((pregunta) => {
                      const indice = PREGUNTAS_UNIVERSALES_HALLAZGOS_V1.findIndex(
                        (item) => item.id === pregunta.id
                      );
                      const respuestaPregunta = respuestasMatrizUniversal[pregunta.id];
                      const respondida = respuestaUniversalValidaV1(
                        pregunta,
                        respuestaPregunta
                      );
                      const requiereRevision = idsPreguntasContradictorias.has(pregunta.id);
                      const palabraActual = contarPalabrasMatrizUniversalV1(
                        respuestaPregunta?.texto
                      );

                      return (
                        <article
                          key={pregunta.id}
                          style={{
                            ...matrizCardStyle,
                            borderColor: requiereRevision
                              ? "rgba(248,113,113,0.62)"
                              : "rgba(151,197,255,0.30)",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "12px",
                              marginBottom: "12px",
                            }}
                          >
                            <span
                              aria-hidden="true"
                              style={{
                                width: "34px",
                                height: "34px",
                                borderRadius: "12px",
                                background: respondida
                                  ? "rgba(57,255,20,0.13)"
                                  : "rgba(255,255,255,0.08)",
                                color: respondida ? "#39FF14" : "rgba(221,240,255,0.72)",
                                border: respondida
                                  ? "1px solid rgba(57,255,20,0.54)"
                                  : "1px solid rgba(151,197,255,0.22)",
                                display: "grid",
                                placeItems: "center",
                                fontWeight: 900,
                                flexShrink: 0,
                              }}
                            >
                              {indice + 1}
                            </span>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                <div style={{ fontSize: "13px", color: "#8FE8FF", fontWeight: 900 }}>
                                  {pregunta.etiqueta}
                                </div>
                                <span
                                  style={{
                                    borderRadius: "999px",
                                    padding: "4px 8px",
                                    fontSize: "11px",
                                    fontWeight: 900,
                                    background: requiereRevision
                                      ? "rgba(248,113,113,0.16)"
                                      : respondida
                                        ? "rgba(57,255,20,0.12)"
                                        : "rgba(255,255,255,0.08)",
                                    color: requiereRevision
                                      ? "#FCA5A5"
                                      : respondida
                                        ? "#C8FFBF"
                                        : "rgba(221,240,255,0.72)",
                                  }}
                                >
                                  {requiereRevision
                                    ? "Requiere revisión"
                                    : respondida
                                      ? "Respondida"
                                      : "Pendiente"}
                                </span>
                              </div>
                              <div style={{ fontSize: "20px", lineHeight: 1.25, fontWeight: 900, marginTop: "5px" }}>
                                {pregunta.texto}
                              </div>
                            </div>
                          </div>

                          {pregunta.ayuda && (
                            <div
                              style={{
                                color: "rgba(221,240,255,0.72)",
                                fontSize: "15px",
                                lineHeight: 1.4,
                                marginBottom: "14px",
                              }}
                            >
                              {pregunta.ayuda}
                            </div>
                          )}

                          {pregunta.tipo === "texto_breve" ? (
                            <>
                              <textarea
                                value={respuestaPregunta?.texto || ""}
                                onChange={(event) =>
                                  actualizarRespuestaTextoMatrizUniversal(
                                    pregunta,
                                    event.target.value
                                  )
                                }
                                placeholder="Ej: Trabajador sin arnés en altura de aprox. 3 metros"
                                rows={4}
                                style={{
                                  width: "100%",
                                  minHeight: "116px",
                                  resize: "vertical",
                                  border: "1px solid rgba(151,197,255,0.22)",
                                  borderRadius: "16px",
                                  padding: "14px",
                                  boxSizing: "border-box",
                                  color: "#FFFFFF",
                                  background: "rgba(3,20,48,0.24)",
                                  fontSize: "16px",
                                  outline: "none",
                                }}
                              />
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  color: palabraActual > 15 ? "#FCA5A5" : "rgba(221,240,255,0.72)",
                                  fontSize: "13px",
                                  marginTop: "8px",
                                }}
                              >
                                <span>Máx. 15 palabras</span>
                                <span>{palabraActual}/15</span>
                              </div>
                            </>
                          ) : (
                            <div style={{ display: "grid", gap: "8px" }}>
                              {(pregunta.opciones || []).map((opcion) =>
                                renderOpcionUniversal(pregunta, opcion, respuestaPregunta)
                              )}
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </section>
                ))}

                {contradiccionesMatrizUniversal.length > 0 && (
                  <section
                    style={{
                      ...matrizCardStyle,
                      borderColor: "rgba(248,113,113,0.62)",
                      background: "rgba(127,29,29,0.22)",
                    }}
                  >
                    <div style={{ fontSize: "18px", fontWeight: 900, marginBottom: "8px" }}>
                      Revisar respuestas
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.74)", fontSize: "14px", lineHeight: 1.45 }}>
                      Hay respuestas que requieren revisión antes de generar el análisis.
                    </div>
                    <div style={{ display: "grid", gap: "8px", marginTop: "12px" }}>
                      {contradiccionesMatrizUniversal.map((item) => (
                        <div key={item.id} style={{ color: "#FCA5A5", fontWeight: 800 }}>
                          {item.mensaje}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {matrizUniversalCompleta && contradiccionesMatrizUniversal.length === 0 && (
                  <section
                    style={{
                      ...matrizCardStyle,
                      background:
                        "linear-gradient(180deg, rgba(22,72,124,0.66), rgba(4,26,60,0.78))",
                      borderColor: "rgba(57,255,20,0.42)",
                    }}
                  >
                    <div style={{ fontSize: "19px", fontWeight: 900, color: "#C8FFBF" }}>
                      ¡Excelente! Completaste las 12 preguntas.
                    </div>
                    <div style={{ color: "rgba(221,240,255,0.78)", fontSize: "14px", lineHeight: 1.45, marginTop: "8px" }}>
                      Ahora procesaremos la información para entregarte el análisis y las recomendaciones.
                    </div>
                  </section>
                )}

                {error && (
                  <section
                    style={{
                      ...matrizCardStyle,
                      borderColor: "rgba(248,113,113,0.62)",
                      color: "#FCA5A5",
                      fontWeight: 900,
                    }}
                  >
                    {error}
                  </section>
                )}
              </>
            )}
          </div>

          {reporte && (
            <div
              style={{
                position: "sticky",
                bottom: 0,
                zIndex: 3,
                background: "linear-gradient(180deg, rgba(6,25,54,0.72), #061936 42%)",
                padding: "12px 16px calc(14px + env(safe-area-inset-bottom))",
                borderTop: "1px solid rgba(255,255,255,0.10)",
              }}
            >
              <div style={{ width: "100%", maxWidth: "430px", margin: "0 auto" }}>
                <button
                  type="button"
                  onClick={verAnalisisMatrizUniversal}
                  disabled={!matrizUniversalCompleta || navegando}
                  style={{
                    width: "100%",
                    border: "0",
                    borderRadius: "16px",
                    padding: "16px",
                background: matrizUniversalCompleta
                  ? "linear-gradient(180deg, #2593ff 0%, #145ee9 48%, #07339b 100%)"
                  : "rgba(255,255,255,0.18)",
                    color: "#FFFFFF",
                    fontWeight: 900,
                    fontSize: "16px",
                    boxShadow: matrizUniversalCompleta
                      ? "0 18px 32px rgba(31,111,239,0.34)"
                      : "none",
                    opacity: !matrizUniversalCompleta || navegando ? 0.76 : 1,
                  }}
                >
                  {matrizUniversalCompleta
                    ? "Ver análisis del hallazgo"
                    : `Faltan ${faltantesMatrizUniversal} preguntas`}
                </button>
              </div>
            </div>
          )}
        </main>
      </>
    );
  }

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
          detalle="Preguntas ajustadas según descripción y contexto del hallazgo."
        />
        <EtapasPremium actual={2} />
        <header style={{ marginBottom: "14px" }}>
          <a
            href={preservarBanderaSelectorPreventivoV2("/evaluar-v2/reportar")}
            onClick={vibrarOk}
            {...feedbackBoton("volver-reporte")}
            style={{
              color: "white",
              textDecoration: "none",
              fontSize: "15px",
              fontWeight: 800,
              opacity: 0.9,
              display: "inline-block",
              transition: "transform 120ms ease, filter 120ms ease",
              ...estiloFeedback("volver-reporte"),
            }}
          >
            Volver a reporte
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
                detalle="Ronda inicial"
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
              onClick={continuar}
              disabled={navegando || (selectorPreventivoActivo && !ronda1Completa)}
              {...feedbackBoton("continuar")}
              style={{
                ...buttonStyle,
                color: "white",
                background: navegando || (selectorPreventivoActivo && !ronda1Completa)
                  ? "rgba(255,255,255,0.18)"
                  : "linear-gradient(180deg, #2593ff 0%, #145ee9 48%, #07339b 100%)",
                boxShadow:
                  "0 20px 36px rgba(15,94,255,0.42), inset 0 1px 0 rgba(255,255,255,0.30), inset 0 -10px 24px rgba(0,18,94,0.30)",
                opacity: navegando || (selectorPreventivoActivo && !ronda1Completa) ? 0.72 : 1,
                ...estiloFeedback("continuar"),
              }}
            >
              {navegando
                ? "Continuando..."
                : selectorPreventivoActivo
                  ? `Continuar evaluación (${respondidasTotal}/${totalPreguntas})`
                  : `Continuar evaluación (${preguntas.length}/${totalPreguntas})`}
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
