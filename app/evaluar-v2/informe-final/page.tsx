"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  aplicarResultadoMotorV2AReporte,
  evaluarReporteConMotorV2Seguro,
} from "../motor-v2/adaptadorMotorV2";
import {
  construirContextoFingerprintPreventivo,
  obtenerPreguntasPaso1Preventivo,
  obtenerPreguntasPaso2Preventivo,
  ronda2PreventivaCompleta,
  VERSION_FLUJO_PREVENTIVO,
} from "../motor-v2/orquestadorPreguntasPreventivasV2";
import {
  aplicarResultadoMatrizUniversalACompatibilidadV2,
  clasificarMatrizUniversalV1,
} from "../motor-v2/clasificadorMatrizUniversalV1";
import {
  construirVectorUniversalV1,
  detectarContradiccionesMatrizUniversalV1,
  matrizUniversalCompletaV1,
} from "../motor-v2/validacionMatrizUniversalV1";
import {
  esErrorChunkStale,
  MENSAJE_CHUNK_STALE,
} from "../chunkLoadRecovery";
import type { NormativaAplicable } from "../motor-v2/types";
import {
  guardarReporteActualV2,
  guardarHistorialLivianoV2,
  guardarReporteLocalCompletoV2,
  hidratarReporteConEvidenciasLocalesV2,
  leerReporteActualV2,
  scopeLocalDesdeReporteV2,
  type EstadoLocalReporteV2,
  type ReporteV2Storage,
} from "../storageReporteV2";
import {
  EtapasPremium,
  FirmaPremium,
  HeaderReportePremium,
  PremiumMobileViewport,
} from "../evaluacion/componentesPremium";
import { navegarEvaluarV2 } from "../offlineNavigation";

type FotoV2 = {
  id: string;
  evidenceId?: string;
  nombre: string;
  tipo: string;
  mimeType?: string;
  dataUrl?: string;
  url?: string;
  storagePath?: string;
  dataUrlOmitida?: boolean;
  storagePendiente?: boolean;
  estadoSubida?: "pendiente" | "subiendo" | "subida" | "error";
  error?: string;
  localBlobKey?: string;
  intentos?: number;
  fechaCarga: string;
  fechaCaptura?: string;
  capturedAt?: string;
  gpsAt?: string;
  gps?: {
    latitud?: number;
    longitud?: number;
    precisionGps?: number;
    fechaHoraGeolocalizacion?: string;
    estadoGeolocalizacion?: string;
  };
  deviceOnline?: boolean;
  userAgent?: string;
  sizeOriginal?: number;
  sizeCompressed?: number;
  origenDeclarado?: string;
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
  } & ReporteV2Storage["evaluacion"];
};

type DetalleGuardadoV2 = {
  offlineId?: string;
  estadoLocal?: EstadoLocalReporteV2;
  localOk?: boolean;
  respaldoLocalCompletoOk?: boolean;
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
  mensaje?: string;
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
        "linear-gradient(180deg, rgba(190,24,45,0.98) 0%, rgba(88,12,24,0.94) 100%)",
      border: "1px solid rgba(255,164,164,0.38)",
      boxShadow: "0 18px 36px rgba(127,29,29,0.36)",
    };
  }

  if (criticidad === "ALTO") {
    return {
      background:
        "linear-gradient(180deg, rgba(249,115,22,0.98) 0%, rgba(194,65,12,0.92) 100%)",
      border: "1px solid rgba(255,190,128,0.42)",
      boxShadow: "0 18px 36px rgba(194,65,12,0.34)",
    };
  }

  if (criticidad === "MEDIO") {
    return {
      background:
        "linear-gradient(180deg, rgba(234,179,8,0.96) 0%, rgba(161,98,7,0.90) 100%)",
      border: "1px solid rgba(253,224,71,0.34)",
      boxShadow: "0 18px 36px rgba(161,98,7,0.28)",
    };
  }

  return {
    background:
      "linear-gradient(180deg, rgba(34,197,94,0.95) 0%, rgba(21,128,61,0.90) 100%)",
    border: "1px solid rgba(255,255,255,0.22)",
    boxShadow: "0 18px 36px rgba(21,128,61,0.30)",
  };
}

function etiquetaAmbito(valor?: string) {
  return valor ? normalizarEtiquetaPreventivaVisible(valor) : "No determinado";
}

function normalizarEtiquetaPreventivaVisible(valor: string) {
  const etiquetas: Record<string, string> = {
    seguridad_laboral: "Seguridad laboral",
    salud_ocupacional: "Salud ocupacional",
    medio_ambiente: "Medio ambiente",
    legal_documental: "Legal/documental",
    emergencia: "Emergencia",
    mixto: "Mixto",
    aspecto_ambiental: "Aspecto ambiental",
    caida_altura: "Caída de altura",
    transito_caida_mismo_nivel: "Caída al mismo nivel",
    condicion_subestandar: "Condición subestándar",
    acto_inseguro: "Conducta observada",
    incendio_emergencia: "Incendio o emergencia",
    equipos_emergencia: "Equipo de emergencia",
    documental_legal: "Documental/legal",
    derrame_fuga: "Derrame o fuga",
    sustancias_peligrosas: "Sustancias peligrosas",
    herramientas_equipos: "Herramientas/equipos",
    maquinaria_equipos: "Maquinaria/equipos",
    otro_indeterminado: "Requiere revisión técnica",
  };

  return (
    etiquetas[valor] ||
    valor
      .split("_")
      .filter(Boolean)
      .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
      .join(" ")
  );
}

function etiquetaCategoria(valor?: string) {
  return valor
    ? normalizarEtiquetaPreventivaVisible(valor)
    : "No determinada";
}

function etiquetaTipoEvento(valor?: string) {
  const etiquetas: Record<string, string> = {
    condicion_subestandar: "Condición subestándar",
    acto_inseguro: "Conducta observada",
    cuasi_accidente: "Incidente sin lesión",
    accidente: "Accidente",
    ambiental: "Evento ambiental",
    aspecto_ambiental: "Aspecto ambiental",
    documental: "Brecha documental",
    otro: "No determinado",
  };

  return valor ? etiquetas[valor] || etiquetaCategoria(valor) : "No determinado";
}

function limpiarTextoVisible(valor?: string) {
  if (!valor) return "";
  return valor
    .replace(/Motor V2/gi, "evaluación preventiva")
    .replace(/motor_v2/gi, "evaluación preventiva")
    .replace(/router/gi, "clasificación preventiva")
    .replace(/taxonom[ií]a/gi, "clasificación preventiva")
    .replace(/fallback/gi, "respaldo operativo")
    .replace(/shadow/gi, "validación interna")
    .replace(/preview/gi, "validación interna")
    .replace(/\baspecto_ambiental\b/g, "Aspecto ambiental")
    .replace(/\bmedio_ambiente\b/g, "Medio ambiente")
    .replace(/\bcondicion_subestandar\b/g, "Condición subestándar")
    .replace(/\bderrame_fuga\b/g, "Derrame o fuga")
    .replace(/Base\s+CR[IÍ]TICO;?\s*final\s+CR[IÍ]TICO\.?/gi, "Nivel de criticidad: Crítico.")
    .replace(/Base\s+ALTO;?\s*final\s+ALTO\.?/gi, "Nivel de criticidad: Alto.")
    .replace(/Base\s+MEDIO;?\s*final\s+MEDIO\.?/gi, "Nivel de criticidad: Medio.")
    .replace(/Base\s+BAJO;?\s*final\s+BAJO\.?/gi, "Nivel de criticidad: Bajo.")
    .replace(/\b[a-z]+(?:_[a-z0-9]+)+\b/g, (coincidencia) =>
      normalizarEtiquetaPreventivaVisible(coincidencia)
    );
}

function textoSeguro(valor?: string) {
  const limpio = limpiarTextoVisible(valor);
  if (!limpio) return "";
  return limpio
    .split("\n")
    .map((linea) => limpiarTextoVisible(linea))
    .join("\n");
}

function etiquetaSuficiencia(valor?: string) {
  if (valor === "alta") return "Alta";
  if (valor === "media") return "Media";
  if (valor === "baja") return "Requiere más antecedentes";
  return "No determinada";
}

function construirDesarrolloPreventivo(reporte: ReporteV2) {
  const texto = `${reporte.descripcion || ""} ${reporte.evaluacion?.categoria_detectada || ""}`.toLowerCase();
  if (
    texto.includes("arnes") ||
    texto.includes("arnés") ||
    texto.includes("altura") ||
    texto.includes("caida_altura")
  ) {
    return "Se clasifica el hallazgo como crítico debido a la exposición directa de una persona a caída de distinto nivel, sin evidencia de control efectivo de protección contra caídas. La condición requiere detener o aislar la actividad hasta implementar controles inmediatos, verificar sistema anticaídas, responsable de supervisión y documentación habilitante aplicable.";
  }
  if (texto.includes("derrame") || texto.includes("combustible")) {
    return "Se identifica una condición con potencial impacto ambiental y exposición operacional. Corresponde controlar la fuente, contener el derrame, evitar propagación a suelo, agua o alcantarillado, gestionar residuos derivados y verificar respaldo técnico asociado a la sustancia involucrada.";
  }
  if (texto.includes("permiso") || texto.includes("firma") || texto.includes("document")) {
    return "Se observa una brecha documental que puede afectar la trazabilidad del control preventivo. Corresponde regularizar el respaldo exigible, verificar responsable, vigencia y autorización, y confirmar que la actividad queda cubierta por el estándar preventivo aplicable.";
  }
  return "El hallazgo requiere validación preventiva con foco en condición observada, exposición, control existente, acción inmediata y evidencia de cierre. La recomendación debe ajustarse a la criticidad real y evitar exigir documentación formal cuando se trate de una corrección simple verificable.";
}

function marcoPreventivoProbable(reporte: ReporteV2) {
  const texto = `${reporte.descripcion || ""} ${reporte.evaluacion?.categoria_detectada || ""}`.toLowerCase();
  const base = ["Ley 16.744", "DS 44", "DS 594"];
  if (texto.includes("arnes") || texto.includes("arnés") || texto.includes("altura")) {
    return [...base, "Matriz/IPER", "Procedimiento/PTS/AST/ART aplicable", "Sistema de protección contra caídas, EPP, supervisión y autorización"];
  }
  if (texto.includes("derrame") || texto.includes("combustible")) {
    return [...base, "HDS/SDS", "Control ambiental", "Procedimiento de respuesta a derrames y gestión de residuos"];
  }
  if (texto.includes("permiso") || texto.includes("firma") || texto.includes("document")) {
    return [...base, "Permiso/autorización aplicable", "Evidencia o registro de control", "Matriz/IPER si la actividad lo exige"];
  }
  return [...base, "Matriz/IPER si corresponde", "Evidencia o registro de cierre preventivo"];
}

function etiquetaSiNo(valor?: boolean) {
  return valor ? "Sí" : "No";
}

function resumenPreguntasSugeridas(
  preguntas?: NonNullable<ReporteV2["evaluacion"]>["preguntas_sugeridas"]
) {
  if (!Array.isArray(preguntas) || preguntas.length === 0) return "Sin preguntas sugeridas";
  return preguntas
    .slice(0, 3)
    .map((pregunta) => limpiarTextoVisible(pregunta.texto))
    .filter(Boolean)
    .join(" · ");
}

function normativaResumen(normativa?: NormativaAplicable[]) {
  if (!Array.isArray(normativa) || normativa.length === 0) {
    return "Marco legal/preventivo probable asociado. Requiere validación legal específica antes de citar artículo definitivo.";
  }

  return normativa
    .slice(0, 4)
    .map((item) => item.norma)
    .filter(Boolean)
    .join(" · ") ||
    "Marco legal/preventivo probable asociado. Requiere validación legal específica antes de citar artículo definitivo.";
}

function listaResumen(items?: string[]) {
  if (!Array.isArray(items) || items.length === 0) return "Sin señales declaradas.";
  return items.slice(0, 4).map((item) => limpiarTextoVisible(item)).join(" · ");
}

function valorRespuestaPreventiva(
  reporte: ReporteV2,
  respuestas: Record<string, string>,
  id: string
) {
  if (id === "transversal_anclaje_riesgo_especifico") {
    return respuestas[id] || reporte.evaluacion?.riesgo_especifico_detectado || "";
  }

  return respuestas[id] || "";
}

function flujoPreventivoListoParaInforme(reporte: ReporteV2) {
  const flujo = reporte.evaluacion?.flujo_preventivo;
  if (flujo?.modo !== "preventivo") return true;
  if (flujo.version !== VERSION_FLUJO_PREVENTIVO) return false;
  if (flujo.ronda1Completa !== true || flujo.ronda2Completa !== true) return false;
  if (!flujo.familiaPrincipal) return false;

  const respuestas = reporte.evaluacion?.respuestas || {};
  const fingerprintActual = construirContextoFingerprintPreventivo(reporte, respuestas);
  if (flujo.contextoFingerprint !== fingerprintActual) return false;

  const preguntasPaso1 = obtenerPreguntasPaso1Preventivo();
  const preguntasPaso2 = obtenerPreguntasPaso2Preventivo(reporte, respuestas);
  const ronda1Completa =
    preguntasPaso1.length === 5 &&
    preguntasPaso1.every((pregunta) =>
      Boolean(valorRespuestaPreventiva(reporte, respuestas, pregunta.id).trim())
    );

  return ronda1Completa && ronda2PreventivaCompleta(preguntasPaso2, respuestas);
}

function matrizUniversalSolicitadaInforme(reporte?: ReporteV2 | null) {
  if (reporte?.evaluacion?.matriz_universal?.activa) return true;
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("ce_matriz_universal") === "1";
}

function prepararInformeMatrizUniversal(reporte: ReporteV2) {
  const matriz = reporte.evaluacion?.matriz_universal;
  const respuestas = matriz?.respuestas || {};
  if (!matriz || matriz.activa !== true || !matrizUniversalCompletaV1(respuestas)) {
    return null;
  }

  const resultado =
    matriz.resultadoClasificacion ||
    clasificarMatrizUniversalV1(
      construirVectorUniversalV1(respuestas),
      detectarContradiccionesMatrizUniversalV1(respuestas)
    );

  return {
    ...reporte,
    descripcion: respuestas.universal_hallazgo?.texto?.trim() || reporte.descripcion,
    evaluacion: {
      ...(reporte.evaluacion || {}),
      ...aplicarResultadoMatrizUniversalACompatibilidadV2(resultado),
      matriz_universal: {
        ...matriz,
        completa: true,
        resultadoClasificacion: resultado,
      },
    },
  };
}

function mensajeUsuarioGuardado(detalle: DetalleGuardadoV2) {
  if (!detalle.centralOk && detalle.estadoLocal === "pendiente") {
    return "Guardado localmente. Sincronización pendiente.";
  }

  if (detalle.centralOk) {
    if ((detalle.evidenciasPendientes || 0) > 0) {
      return `Reporte enviado correctamente. ${detalle.evidenciasPendientes} evidencia(s) quedaron pendientes de carga.`;
    }

    return "Reporte enviado correctamente. El hallazgo fue guardado y sincronizado. Evidencias recibidas.";
  }

  const error = detalle.errorCentral || detalle.errorEvidencias;
  return error
    ? `Reporte guardado localmente. ${error}`
    : "Reporte guardado. La sincronización quedó pendiente y se intentará nuevamente.";
}

export default function InformeFinalV2Page() {
  const router = useRouter();
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
  const [online, setOnline] = useState(true);
  const [sincronizandoPendientes, setSincronizandoPendientes] = useState(false);
  const guardandoRef = useRef(false);

  useEffect(() => {
    let activo = true;
    const frameId = window.requestAnimationFrame(async () => {
      const reporteActual = leerReporteActualV2();
      const hidratado = reporteActual
        ? await hidratarReporteConEvidenciasLocalesV2(reporteActual)
        : null;

      if (!activo) return;
      const reporteHidratado = hidratado as ReporteV2 | null;
      if (reporteHidratado && matrizUniversalSolicitadaInforme(reporteHidratado)) {
        const reporteMatriz = prepararInformeMatrizUniversal(reporteHidratado);
        if (!reporteMatriz) {
          navegarEvaluarV2(router, "/evaluar-v2/evaluacion/paso1?ce_matriz_universal=1");
          return;
        }
        guardarReporteActualV2(reporteMatriz);
        setReporte(reporteMatriz);
        setCargado(true);
        return;
      }

      if (reporteHidratado && !flujoPreventivoListoParaInforme(reporteHidratado)) {
        navegarEvaluarV2(router, "/evaluar-v2/evaluacion/paso2?ce_selector_preventivo=1");
        return;
      }

      const reporteEvaluado = reporteHidratado
        ? aplicarResultadoMotorV2AReporte(
            reporteHidratado,
            evaluarReporteConMotorV2Seguro(reporteHidratado)
          )
        : null;

      if (reporteEvaluado) {
        guardarReporteActualV2(reporteEvaluado);
      }

      setReporte(reporteEvaluado);
      setCargado(true);
    });

    return () => {
      activo = false;
      window.cancelAnimationFrame(frameId);
    };
  }, [router]);

  useEffect(() => {
    const actualizarConexion = () => {
      setOnline(typeof navigator === "undefined" ? true : navigator.onLine);
    };

    actualizarConexion();
    window.addEventListener("online", actualizarConexion);
    window.addEventListener("offline", actualizarConexion);

    return () => {
      window.removeEventListener("online", actualizarConexion);
      window.removeEventListener("offline", actualizarConexion);
    };
  }, []);

  const sincronizarPendientes = async () => {
    if (sincronizandoPendientes || !online) return;

    setSincronizandoPendientes(true);
    setMensajeGuardado("");

    try {
      const { sincronizarReportesPendientesV2 } = await import(
        "@/app/services/guardarReporteV2Completo"
      );
      const resultado = await sincronizarReportesPendientesV2(
        reporte ? scopeLocalDesdeReporteV2(reporte) : undefined
      );
      const todoOk = resultado.errores === 0 && resultado.pendientes === 0;

      setMensajeGuardado(resultado.mensaje);
      setEstadoSincronizacion(todoOk ? "central-ok" : "central-error");
      setDetalleGuardado((actual) =>
        actual
          ? {
              ...actual,
              estadoLocal: todoOk ? "sincronizado" : actual.estadoLocal,
              centralOk: todoOk ? true : actual.centralOk,
              centralPendiente: !todoOk,
            }
          : actual
      );
    } catch (error) {
      if (esErrorChunkStale(error)) {
        setMensajeGuardado(MENSAJE_CHUNK_STALE);
        setEstadoSincronizacion("central-error");
        return;
      }

      setMensajeGuardado(
        `No se pudo sincronizar pendientes: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      setEstadoSincronizacion("central-error");
    } finally {
      setSincronizandoPendientes(false);
    }
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

  const pageStyle = {
    minHeight: "100dvh",
    width: "100%",
    maxWidth: "100vw",
    backgroundColor: "#020b1f",
    background:
      "radial-gradient(circle at 22% 12%, rgba(60,130,220,0.46) 0%, rgba(7,32,68,0.92) 31%, rgba(2,12,32,1) 72%), linear-gradient(180deg, #05244a 0%, #020b1f 100%)",
    color: "white",
    fontFamily: "Arial, sans-serif",
    overflowX: "hidden" as const,
    overscrollBehaviorY: "none" as const,
    touchAction: "pan-y" as const,
    position: "relative" as const,
  };

  const containerStyle = {
    width: "100%",
    maxWidth: "430px",
    margin: "0 auto",
    padding:
      "calc(12px + env(safe-area-inset-top)) 15px calc(36px + env(safe-area-inset-bottom))",
    boxSizing: "border-box" as const,
    overflowX: "hidden" as const,
    overscrollBehaviorY: "contain" as const,
    touchAction: "pan-y" as const,
  };
  const matrizUniversalVisualActiva = matrizUniversalSolicitadaInforme(reporte);

  const cardStyle = {
    borderRadius: "18px",
    background: matrizUniversalVisualActiva
      ? "linear-gradient(180deg, rgba(22,72,124,0.66), rgba(4,26,60,0.78))"
      : "linear-gradient(180deg, rgba(22,72,124,0.66), rgba(4,26,60,0.78))",
    color: "white",
    border: matrizUniversalVisualActiva
      ? "1px solid rgba(151,197,255,0.30)"
      : "1px solid rgba(151,197,255,0.30)",
    boxShadow:
      matrizUniversalVisualActiva
        ? "0 18px 42px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.11), inset 0 -1px 0 rgba(33,150,243,0.10)"
        : "0 18px 42px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.11), inset 0 -1px 0 rgba(33,150,243,0.10)",
    padding: "14px",
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
    border: "1px solid rgba(128,184,255,0.50)",
    borderRadius: "18px",
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
    background: matrizUniversalVisualActiva ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.08)",
    padding: "11px 12px",
    boxSizing: "border-box" as const,
  };

  const fotos = Array.isArray(reporte?.fotos) ? reporte.fotos : [];
  const fotosVisibles = fotos.filter((foto) => foto.dataUrl || foto.url);
  const fotosPendientes = Math.max(fotos.length - fotosVisibles.length, 0);
  const fotosSinRespaldoStorage = fotos.filter((foto) => !foto.storagePath && !foto.url).length;
  const criticidad = reporte?.evaluacion?.criticidad || "BAJO";
  const estiloCriticidad = obtenerEstiloCriticidad(criticidad);

  return (
    <>
      <PremiumMobileViewport />
      <main
        className="ce-mobile-app-shell"
        style={pageStyle}
        onDoubleClick={(event) => {
          event.preventDefault();
        }}
      >
      <div style={containerStyle}>
        {matrizUniversalVisualActiva ? (
          <header style={{ color: "#FFFFFF", marginBottom: "14px", display: "grid", gap: "12px" }}>
            <a
              href="/evaluar-v2/resultado?ce_matriz_universal=1"
              onClick={vibrarOk}
              {...feedbackBoton("volver-resultado")}
              style={{
                color: "white",
                textDecoration: "none",
                fontSize: "15px",
                fontWeight: 800,
                opacity: 0.9,
                display: "inline-block",
                transition: "transform 120ms ease, filter 120ms ease",
                ...estiloFeedback("volver-resultado"),
              }}
            >
              Volver al resultado
            </a>
            <section style={cardStyle}>
              <div
                style={{
                  display: "inline-flex",
                  borderRadius: "999px",
                  background: "rgba(32,123,255,0.16)",
                  border: "1px solid rgba(112,182,255,0.34)",
                  color: "rgba(221,240,255,0.92)",
                  padding: "6px 10px",
                  fontSize: "12px",
                  fontWeight: 900,
                  marginBottom: "12px",
                }}
              >
                Informe final preventivo
              </div>
              <h1 style={{ margin: 0, fontSize: "25px", lineHeight: 1.08, fontWeight: 900 }}>
                Informe preventivo
              </h1>
              <p style={{ margin: "10px 0 0", color: "rgba(221,240,255,0.76)", fontSize: "14px", lineHeight: 1.45, fontWeight: 700 }}>
                Presentación ejecutiva del hallazgo, controles, evidencia y marco preventivo probable.
              </p>
            </section>
          </header>
        ) : (
          <>
            <HeaderReportePremium
              subtitulo="Informe final preventivo"
              detalle="Trazabilidad preventiva, evidencia, responsables y seguimiento de cierre."
            />
            <EtapasPremium actual={6} />
          </>
        )}

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
                color: "white",
                background:
                  "linear-gradient(180deg, #2593ff 0%, #145ee9 48%, #07339b 100%)",
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

            {matrizUniversalVisualActiva ? (
              <>
                <section style={cardStyle}>
                  <div style={{ fontSize: "18px", fontWeight: 900, marginBottom: "12px" }}>
                    Resumen del reporte
                  </div>
                  <div style={{ display: "grid", gap: "9px", fontSize: "14px", lineHeight: 1.5 }}>
                    <p style={{ margin: 0 }}>
                      <strong>Código:</strong> {reporte.codigo || "Sin código"} ·{" "}
                      <strong>Fecha:</strong> {reporte.fecha || "No informado"} ·{" "}
                      <strong>Hora:</strong> {reporte.hora || "No informado"}
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>Supervisor:</strong> {reporte.supervisor || "Sin supervisor"} ·{" "}
                      <strong>Cargo:</strong> {reporte.cargo || "Sin cargo"}
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>Empresa / obra:</strong> {reporte.empresa || "No informado"} / {reporte.obra || "No informado"} ·{" "}
                      <strong>Área:</strong> {reporte.area || "Sin área"}
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>Descripción:</strong> {reporte.descripcion || "Sin descripción"}
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>Empresa involucrada / responsable:</strong>{" "}
                      {reporte.empresaInvolucradaResponsable || "Sin informar"} ·{" "}
                      <strong>Responsable:</strong> {reporte.responsableEmpresa || "Sin informar"} ·{" "}
                      <strong>Cargo:</strong> {reporte.cargoResponsableEmpresa || "Sin informar"}
                    </p>
                  </div>
                </section>

                <section style={cardStyle}>
                  <div style={{ fontSize: "18px", fontWeight: 900, marginBottom: "12px" }}>
                    Análisis preventivo
                  </div>
                  <div style={{ display: "grid", gap: "10px", fontSize: "14px", lineHeight: 1.5 }}>
                    <p style={{ margin: 0 }}>
                      La clasificación preventiva corresponde a{" "}
                      <strong>{etiquetaCategoria(reporte.evaluacion?.modulo_preguntas_sugerido)}</strong>, con ámbito principal{" "}
                      <strong>{etiquetaAmbito(reporte.evaluacion?.ambito_principal)}</strong> y tipo de hallazgo{" "}
                      <strong>{etiquetaTipoEvento(reporte.evaluacion?.tipo_evento)}</strong>.
                    </p>
                    <p style={{ margin: 0 }}>
                      El nivel de suficiencia registrado es{" "}
                      <strong>{etiquetaSuficiencia(reporte.evaluacion?.confianza_clasificacion)}</strong>. Las señales relevantes son{" "}
                      <strong>{listaResumen(reporte.evaluacion?.senales_criticas)}</strong>; los factores elevadores son{" "}
                      <strong>{listaResumen(reporte.evaluacion?.factores_elevadores)}</strong> y los factores limitantes son{" "}
                      <strong>{listaResumen(reporte.evaluacion?.factores_limitantes)}</strong>.
                    </p>
                    <p style={{ margin: 0 }}>
                      {construirDesarrolloPreventivo(reporte)}
                    </p>
                    <p style={{ margin: 0, opacity: 0.78 }}>
                      Marco preventivo probable: {marcoPreventivoProbable(reporte).join(" · ")}.
                    </p>
                  </div>
                </section>

                <section style={cardStyle}>
                  <div style={{ fontSize: "18px", fontWeight: 900, marginBottom: "12px" }}>
                    Acción recomendada y cierre
                  </div>
                  <div style={{ display: "grid", gap: "10px", fontSize: "14px", lineHeight: 1.5 }}>
                    <p style={{ margin: 0 }}>
                      <strong>Acción inmediata:</strong>{" "}
                      {textoSeguro(reporte.evaluacion?.medida_inmediata_v2) ||
                        reporte.evaluacion?.accionInmediata ||
                        "Sin acción definida"}.
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>Control requerido:</strong>{" "}
                      {reporte.evaluacion?.recomendacion || "Sin recomendación definida"}.
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>Evidencia recomendada:</strong>{" "}
                      {fotos.length > 0
                        ? `${fotos.length} fotografía(s) adjunta(s) para respaldo del hallazgo.`
                        : "Registrar evidencia de corrección o cierre cuando corresponda."}
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>Seguimiento sugerido:</strong>{" "}
                      {reporte.estadoCierre || reporte.estado || "No informado"} ·{" "}
                      <strong>Plazo:</strong> {reporte.evaluacion?.plazo_sugerido_v2 || "Sin plazo definido"} ·{" "}
                      <strong>Suspensión:</strong> {etiquetaSiNo(reporte.evaluacion?.requiere_suspension)}.
                    </p>
                    <p style={{ margin: 0, opacity: 0.78 }}>
                      Observación final: referencia preventiva orientativa. Requiere validación legal específica antes de citar artículos o emitir conclusión jurídica definitiva.
                    </p>
                  </div>
                </section>
              </>
            ) : (
              <>
                <section style={cardStyle}>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: 900,
                      marginBottom: "10px",
                    }}
                  >
                    Resultado técnico preventivo
                  </div>
                  <div style={{ display: "grid", gap: "10px" }}>
                    {[
                      [
                        "Ámbito principal",
                        etiquetaAmbito(reporte.evaluacion?.ambito_principal),
                      ],
                      [
                        "Tipo de hallazgo",
                        etiquetaTipoEvento(reporte.evaluacion?.tipo_evento),
                      ],
                      [
                        "Categoría preventiva",
                        etiquetaCategoria(reporte.evaluacion?.categoria_detectada),
                      ],
                      [
                        "Clasificación preventiva",
                        etiquetaCategoria(reporte.evaluacion?.modulo_preguntas_sugerido),
                      ],
                      [
                        "Nivel de suficiencia",
                        etiquetaSuficiencia(reporte.evaluacion?.confianza_clasificacion),
                      ],
                      [
                        "Preguntas sugeridas",
                        resumenPreguntasSugeridas(reporte.evaluacion?.preguntas_sugeridas),
                      ],
                      [
                        "Medida inmediata",
                        textoSeguro(reporte.evaluacion?.medida_inmediata_v2) ||
                          reporte.evaluacion?.accionInmediata ||
                          "Sin medida definida",
                      ],
                      [
                        "Plazo sugerido",
                        reporte.evaluacion?.plazo_sugerido_v2 || "Sin plazo definido",
                      ],
                      [
                        "Requiere suspensión",
                        etiquetaSiNo(reporte.evaluacion?.requiere_suspension),
                      ],
                      [
                        "Requiere contención ambiental",
                        etiquetaSiNo(
                          reporte.evaluacion?.requiere_contencion_ambiental
                        ),
                      ],
                      [
                        "Revisión manual requerida",
                        etiquetaSiNo(reporte.evaluacion?.requiere_revision_manual),
                      ],
                      [
                        "Señales críticas reales",
                        listaResumen(reporte.evaluacion?.senales_criticas),
                      ],
                      [
                        "Factores elevadores",
                        listaResumen(reporte.evaluacion?.factores_elevadores),
                      ],
                      [
                        "Factores limitantes",
                        listaResumen(reporte.evaluacion?.factores_limitantes),
                      ],
                      [
                        "Normativa probable",
                        normativaResumen(reporte.evaluacion?.normativa_probable),
                      ],
                    ].map(([label, valor]) => (
                      <div key={label} style={datoStyle}>
                        <div style={{ fontSize: "11px", opacity: 0.62 }}>
                          {label}
                        </div>
                        <div style={{ fontSize: "15px", fontWeight: 800, lineHeight: 1.35 }}>
                          {valor}
                        </div>
                      </div>
                    ))}
                    <div style={{ fontSize: "12px", lineHeight: 1.45, opacity: 0.78 }}>
                      {textoSeguro(reporte.evaluacion?.justificacion_tecnica) ||
                        "Marco legal/preventivo probable asociado. Requiere validación legal específica antes de citar artículo definitivo."}
                    </div>
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
                    Desarrollo técnico preventivo
                  </div>
                  <div style={{ display: "grid", gap: "10px" }}>
                    <div style={datoStyle}>
                      <div style={{ fontSize: "11px", opacity: 0.62 }}>
                        Fundamento técnico
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: 800, lineHeight: 1.45 }}>
                        {construirDesarrolloPreventivo(reporte)}
                      </div>
                    </div>
                    <div style={datoStyle}>
                      <div style={{ fontSize: "11px", opacity: 0.62 }}>
                        Marco legal/preventivo probable asociado
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: 800, lineHeight: 1.45 }}>
                        {marcoPreventivoProbable(reporte).join(" · ")}
                      </div>
                    </div>
                    <div style={{ fontSize: "12px", lineHeight: 1.45, opacity: 0.78 }}>
                      Referencia preventiva orientativa. Requiere validación legal específica antes de citar artículos o emitir conclusión jurídica definitiva.
                    </div>
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
              </>
            )}

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
              {!guardado && fotosSinRespaldoStorage > 0 && (
                <div style={{ marginTop: "8px", fontSize: "12px", opacity: 0.76, lineHeight: 1.4 }}>
                  {fotosSinRespaldoStorage} evidencia(s) se respaldarán en Storage al guardar.
                  Si la subida falla, quedarán marcadas como pendientes y no como evidencia disponible.
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
              <div
                style={{
                  borderRadius: "14px",
                  background: online
                    ? "rgba(34,197,94,0.14)"
                    : "rgba(249,115,22,0.16)",
                  border: online
                    ? "1px solid rgba(34,197,94,0.28)"
                    : "1px solid rgba(249,115,22,0.32)",
                  padding: "10px 12px",
                  fontSize: "12px",
                  fontWeight: 900,
                  lineHeight: 1.35,
                }}
              >
                {online
                  ? "Online. Se intentará sincronizar Supabase y Storage."
                  : "Modo offline activo. El reporte quedará pendiente de sincronización."}
              </div>
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
                      offlineId: resultadoGuardado.offlineId,
                      estadoLocal: resultadoGuardado.estadoLocal,
                      ultimoIntentoEnvio: {
                        fecha: new Date().toISOString(),
                        estado: resultadoGuardado.estadoLocal,
                        canal: resultadoGuardado.errorCentral
                          ? "central"
                          : resultadoGuardado.evidenciasPendientes > 0
                            ? "storage"
                            : "guardar-y-enviar",
                        mensaje: resultadoGuardado.mensaje,
                        error:
                          resultadoGuardado.errorCentral ||
                          resultadoGuardado.errorEvidencias,
                        evidenciasIntentadas:
                          resultadoGuardado.evidenciasIntentadas,
                        evidenciasSubidas: resultadoGuardado.evidenciasSubidas,
                        evidenciasPendientes:
                          resultadoGuardado.evidenciasPendientes,
                        centralOk: resultadoGuardado.centralOk,
                      },
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
                    guardarHistorialLivianoV2(reporteConEstado);
                  } catch (error) {
                    const errorChunkStale = esErrorChunkStale(error);
                    const mensajeCentral = errorChunkStale
                      ? MENSAJE_CHUNK_STALE
                      : "Reporte guardado. La sincronización quedó pendiente y se intentará nuevamente.";
                    console.warn("No se pudo completar escritura central.", error);
                    const reporteConEstado: ReporteV2 = {
                      ...reporteGuardado,
                      estadoLocal: errorChunkStale ? "pendiente" : "error",
                      ultimoIntentoEnvio: {
                        fecha: new Date().toISOString(),
                        estado: errorChunkStale ? "pendiente" : "error",
                        canal: "local",
                        mensaje: mensajeCentral,
                        error:
                          error instanceof Error ? error.message : String(error),
                        centralOk: false,
                      },
                      sincronizacionCentral: {
                        estado: "pendiente",
                        mensaje: mensajeCentral,
                        fecha: new Date().toISOString(),
                      },
                    };
                    const respaldoLocal = await guardarReporteLocalCompletoV2(
                      reporteConEstado,
                      errorChunkStale ? "pendiente" : "error",
                      reporteConEstado.ultimoIntentoEnvio
                    );
                    const localOk =
                      respaldoLocal.ok || respaldoLocal.localStorageOk;
                    const reporteFinal = respaldoLocal.reporte as ReporteV2;

                    setReporte(reporteFinal);
                    setEstadoSincronizacion("central-error");
                    setMensajeGuardado(
                      localOk
                        ? mensajeCentral
                        : "No se pudo confirmar el respaldo local completo. Revisa el almacenamiento del navegador."
                    );
                    setDetalleGuardado({
                      offlineId: respaldoLocal.reporte.offlineId,
                      estadoLocal: errorChunkStale ? "pendiente" : "error",
                      localOk,
                      respaldoLocalCompletoOk: respaldoLocal.ok,
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
                  color: "white",
                  background: guardando
                    ? "rgba(255,255,255,0.18)"
                    : guardado && estadoSincronizacion === "central-ok"
                      ? "linear-gradient(135deg, #22c55e, #15803d)"
                      : guardado
                        ? "linear-gradient(135deg, #f59e0b, #c2410c)"
                      : "linear-gradient(180deg, #2593ff 0%, #145ee9 48%, #07339b 100%)",
                  boxShadow: guardado && estadoSincronizacion === "central-ok"
                    ? "0 14px 28px rgba(34,197,94,0.22)"
                    : "0 20px 36px rgba(15,94,255,0.42), inset 0 1px 0 rgba(255,255,255,0.30), inset 0 -10px 24px rgba(0,18,94,0.30)",
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
                        ? `${detalleGuardado.evidenciasPendientes} evidencia(s) quedaron pendientes de carga.`
                        : "Evidencias recibidas."}
                    </div>
                  )}
                  {!online && (
                    <div>
                      Modo offline activo. El reporte quedará pendiente de
                      sincronización.
                    </div>
                  )}
                  {online &&
                    detalleGuardado.estadoLocal !== "sincronizado" &&
                    detalleGuardado.centralPendiente && (
                      <button
                        type="button"
                        onClick={sincronizarPendientes}
                        disabled={sincronizandoPendientes}
                        style={{
                          marginTop: "10px",
                          width: "100%",
                          border: "none",
                          borderRadius: "12px",
                          background: sincronizandoPendientes
                            ? "rgba(255,255,255,0.18)"
                            : "linear-gradient(135deg, #2563eb, #1d4ed8)",
                          color: "white",
                          cursor: "pointer",
                          fontSize: "13px",
                          fontWeight: 900,
                          padding: "11px 12px",
                          opacity: sincronizandoPendientes ? 0.72 : 1,
                        }}
                      >
                        {sincronizandoPendientes
                          ? "Sincronizando..."
                          : "Sincronizar pendientes"}
                      </button>
                    )}
                </div>
              )}
              <a
                href="/evaluar-v2"
                onClick={vibrarOk}
                {...feedbackBoton("inicio")}
                style={{
                  ...buttonStyle,
                  color: "white",
                  background:
                    "linear-gradient(180deg, rgba(22,72,124,0.72), rgba(4,26,60,0.84))",
                  ...estiloFeedback("inicio"),
                }}
              >
                Volver al inicio
              </a>
            </div>
          </>
        )}
        <FirmaPremium />
      </div>
      </main>
    </>
  );
}
