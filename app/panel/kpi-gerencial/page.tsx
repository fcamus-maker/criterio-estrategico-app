"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  analizarKpiGerencialAvanzado,
  type CriticidadKpiGerencial,
  type EstadoKpiGerencial,
  type FiltrosKpiGerencial,
  type HallazgoKpiGerencial,
  type RankingKpiGerencial,
} from "../../analytics/kpiGerencialAvanzado";
import type { HallazgoCentral } from "../../types/hallazgoCentral";
import { hallazgosMock, type HallazgoPanel } from "../mockdata";
import { cargarHallazgosPanelConFuentesOpcionales } from "../sources/hallazgosPanelSource";
import {
  resolvePlatformLanguage,
  resolvePlatformTheme,
  usePlatformPreferences,
} from "../../services/platformPreferences";

type HallazgoPanelGerencial = HallazgoPanel & {
  area?: string;
  gps?: HallazgoCentral["geolocalizacion"];
  fechaCompromiso?: string;
  fechaCierre?: string;
  responsable?: string;
  responsableCierreNombre?: string;
  responsableCorreccionNombre?: string;
  evidenciaCierre?: string;
  evidenciaRecibida?: string;
};

type FiltrosVista = {
  empresa: string;
  obra: string;
  area: string;
  criticidad: "" | CriticidadKpiGerencial;
  estado: "" | EstadoKpiGerencial;
  tipoHallazgo: string;
  responsableCierre: string;
  reportante: string;
  fechaDesde: string;
  fechaHasta: string;
  semana: string;
  mes: string;
  gps: "todos" | "con-gps" | "sin-gps";
  evidencia: "todos" | "con-evidencia" | "sin-evidencia";
  vencimiento: "todos" | "vencidos" | "no-vencidos";
  soloCriticosAbiertos: boolean;
  soloReincidencias: boolean;
};

const filtrosIniciales: FiltrosVista = {
  empresa: "",
  obra: "",
  area: "",
  criticidad: "",
  estado: "",
  tipoHallazgo: "",
  responsableCierre: "",
  reportante: "",
  fechaDesde: "",
  fechaHasta: "",
  semana: "",
  mes: "",
  gps: "todos",
  evidencia: "todos",
  vencimiento: "todos",
  soloCriticosAbiertos: false,
  soloReincidencias: false,
};

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at 18% 0%, rgba(37,99,235,0.28), transparent 32%), radial-gradient(circle at 80% 12%, rgba(168,85,247,0.18), transparent 28%), radial-gradient(circle at 52% 88%, rgba(20,184,166,0.14), transparent 30%), linear-gradient(135deg, #07111f 0%, #0f172a 48%, #111827 100%)",
  color: "#f8fafc",
  padding: "clamp(16px, 1.25vw, 28px)",
  boxSizing: "border-box",
  fontFamily:
    "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
};

const shellStyle: CSSProperties = {
  width: "100%",
  maxWidth: "none",
  margin: "0 auto",
  display: "grid",
  gap: "clamp(16px, 0.95vw, 22px)",
};

const surfaceStyle: CSSProperties = {
  borderRadius: "28px",
  background: "rgba(15,23,42,0.76)",
  border: "1px solid rgba(148,163,184,0.18)",
  boxShadow: "0 24px 70px rgba(0,0,0,0.34)",
  backdropFilter: "blur(14px)",
};

const inputStyle: CSSProperties = {
  width: "100%",
  minHeight: "43px",
  borderRadius: "14px",
  border: "1px solid rgba(148,163,184,0.24)",
  background: "rgba(15,23,42,0.78)",
  color: "#e5e7eb",
  padding: "0 12px",
  fontSize: "13px",
  fontWeight: 750,
  outline: "none",
  colorScheme: "dark",
};

function vibrarCorto() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(18);
  }
}

function normalizarTexto(valor: string) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

function normalizarCriticidad(valor: string): CriticidadKpiGerencial {
  const texto = normalizarTexto(valor);
  if (texto.includes("CRIT")) return "CRITICO";
  if (texto.includes("ALTO")) return "ALTO";
  if (texto.includes("MED")) return "MEDIO";
  return "BAJO";
}

function normalizarEstado(valor: string): EstadoKpiGerencial {
  const texto = normalizarTexto(valor);
  if (texto.includes("CERR")) return "CERRADO";
  if (texto.includes("SEGUIMIENTO")) return "EN_SEGUIMIENTO";
  if (texto.includes("REPORT")) return "REPORTADO";
  if (texto.includes("ANUL")) return "ANULADO";
  return "ABIERTO";
}

function convertirHallazgoKpi(hallazgo: HallazgoPanelGerencial): HallazgoKpiGerencial {
  return {
    id: hallazgo.id,
    codigo: hallazgo.codigo,
    empresa: hallazgo.empresa || "Sin empresa",
    obra: hallazgo.obra || "Sin obra",
    area: hallazgo.area || hallazgo.obra || "Sin area",
    tipoHallazgo: hallazgo.tipoHallazgo || "Sin tipo",
    criticidad: normalizarCriticidad(hallazgo.criticidad),
    estado: normalizarEstado(hallazgo.estado),
    fechaISO: hallazgo.fechaISO,
    reportante: hallazgo.reportante || "Sin reportante",
    responsableCierre:
      hallazgo.responsableCierreNombre ||
      hallazgo.responsableCorreccionNombre ||
      hallazgo.responsable ||
      "Sin responsable",
    fechaCompromiso: hallazgo.fechaCompromiso,
    fechaCierre: hallazgo.fechaCierre,
    descripcion: hallazgo.descripcion,
    fotos: hallazgo.fotos,
    tieneGps:
      typeof hallazgo.gps?.latitud === "number" &&
      typeof hallazgo.gps.longitud === "number",
  };
}

function valorUnico(items: string[]) {
  return Array.from(new Set(items.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b, "es")
  );
}

function colorCriticidad(criticidad: CriticidadKpiGerencial) {
  if (criticidad === "CRITICO") return "#ef4444";
  if (criticidad === "ALTO") return "#f97316";
  if (criticidad === "MEDIO") return "#facc15";
  return "#22c55e";
}

function etiquetaCriticidad(criticidad: CriticidadKpiGerencial) {
  return criticidad === "CRITICO" ? "CRITICO" : criticidad;
}

function maximoRanking(rankings: RankingKpiGerencial[]) {
  return Math.max(1, ...rankings.map((item) => item.total));
}

function formatoNumero(valor: number, sufijo = "") {
  return `${valor.toLocaleString("es-CL")}${sufijo}`;
}

const textosKpiEn: Record<string, string> = {
  "Modulo gerencial preparado con fuente actual y fallback seguro.": "Management module ready with current source and safe fallback.",
  "Analisis actualizado con hallazgos disponibles para gerencia.": "Analysis updated with findings available for management.",
  "Se uso fallback local para mantener disponible el modulo gerencial.": "Local fallback was used to keep the management module available.",
  "Filtros limpiados. Analisis gerencial general restablecido.": "Filters cleared. General management analysis restored.",
  "KPI Gerencial Avanzado": "Advanced Management KPI",
  "Plataforma Hallazgos · Gerencia": "Findings Platform · Management",
  "Analisis ejecutivo para comparar empresas, obras, periodos, criticidad, cierres, vencimientos y reincidencias con foco preventivo y reportabilidad.": "Executive analysis to compare companies, sites, periods, severity, closures, overdue findings and recurrences with a preventive reporting focus.",
  "Volver al panel": "Back to dashboard",
  "Actualizar analisis": "Refresh analysis",
  "Preparar informe": "Prepare report",
  "Informe ejecutivo preparado visualmente. PDF/Excel real se conectara en etapa posterior.": "Executive report visually prepared. Real PDF/Excel export will be connected in a later stage.",
  "Total hallazgos": "Total findings",
  "Base analizada": "Analyzed base",
  Abiertos: "Open",
  "Pendientes/no cerrados": "Pending/not closed",
  Cerrados: "Closed",
  "Gestion completada": "Management completed",
  Criticos: "Critical",
  "Mayor severidad": "Highest severity",
  Vencidos: "Overdue",
  "Fuera de plazo": "Past due",
  "Tasa cierre": "Closure rate",
  "Cumplimiento cierre": "Closure compliance",
  "Prom. cierre": "Avg. closure",
  "Dias promedio": "Average days",
  Empresas: "Companies",
  "Empresas activas": "Active companies",
  Obras: "Sites",
  "Proyectos activos": "Active projects",
  Reincidencias: "Recurrences",
  "Patrones repetidos": "Repeated patterns",
  Cumplimiento: "Compliance",
  "Indice general": "General index",
  Preventivo: "Preventive",
  "Indicador global": "Global indicator",
  "Filtros avanzados": "Advanced filters",
  "Cruza empresa, obra, area, periodo, criticidad, responsable y evidencia.": "Cross company, site, area, period, severity, owner and evidence.",
  Empresa: "Company",
  "Obra / proyecto": "Site / project",
  Area: "Area",
  "Tipo de hallazgo": "Finding type",
  "Responsable cierre": "Closure owner",
  "Supervisor/reportante": "Supervisor/reporter",
  Criticidad: "Severity",
  Estado: "Status",
  Desde: "From",
  Hasta: "To",
  Semana: "Week",
  Mes: "Month",
  GPS: "GPS",
  Evidencia: "Evidence",
  Vencimiento: "Deadline",
  Todos: "All",
  Todas: "All",
  "Con GPS y sin GPS": "With and without GPS",
  "Solo con GPS": "GPS only",
  "Solo sin GPS": "Without GPS only",
  "Con y sin evidencia": "With and without evidence",
  "Con evidencia": "With evidence",
  "Sin evidencia": "Without evidence",
  "Solo vencidos": "Overdue only",
  "No vencidos": "Not overdue",
  "Solo criticos abiertos": "Open critical only",
  "Solo reincidencias": "Recurrences only",
  "Aplicar filtros": "Apply filters",
  "Limpiar filtros": "Clear filters",
  "Filtros aplicados al analisis gerencial.": "Filters applied to management analysis.",
  "Tablero de analisis ejecutivo": "Executive analysis board",
  "Cargando datos...": "Loading data...",
  "Ranking empresas": "Company ranking",
  "Ranking de empresas activo.": "Company ranking active.",
  "Comparar obras": "Compare sites",
  "Comparacion por obras activa.": "Site comparison active.",
  "Ranking areas": "Area ranking",
  "Ranking de areas activo.": "Area ranking active.",
  "Ver criticidad": "View severity",
  "Distribucion por criticidad activa.": "Severity distribution active.",
  "Ver cierres": "View closures",
  "Analisis de cierres activo.": "Closure analysis active.",
  "Ver vencidos": "View overdue",
  "Foco en hallazgos vencidos activo.": "Overdue findings focus active.",
  "Ver reincidencias": "View recurrences",
  "Lectura de reincidencias activa.": "Recurrence review active.",
  "KPI preparado": "KPI ready",
  "No hay datos suficientes con los filtros seleccionados. Al registrar mas hallazgos, este modulo mostrara rankings, comparaciones, tasas y reportabilidad ejecutiva.": "There is not enough data with the selected filters. As more findings are registered, this module will show rankings, comparisons, rates and executive reporting.",
  "Ranking comparativo": "Comparative ranking",
  cierre: "closure",
  "Criticidad y estado": "Severity and status",
  "Tendencia temporal": "Time trend",
  Comparaciones: "Comparisons",
  "Informe ejecutivo preparado": "Prepared executive report",
  "Resumen automatico listo para futura salida PDF/Excel.": "Automatic summary ready for future PDF/Excel output.",
  Resumen: "Summary",
  "Riesgos principales": "Main risks",
  "Recomendacion preventiva": "Preventive recommendation",
  "PDF preparado visualmente. Generacion real pendiente de etapa posterior.": "PDF visually prepared. Real generation pending for a later stage.",
  "Excel preparado visualmente. Exportacion real pendiente de etapa posterior.": "Excel visually prepared. Real export pending for a later stage.",
  "Exportar PDF": "Export PDF",
  "Exportar Excel": "Export Excel",
  "Rankings adicionales": "Additional rankings",
  "Empresas con mas hallazgos": "Companies with most findings",
  "Areas con mas hallazgos": "Areas with most findings",
  "Tipos mas frecuentes": "Most frequent types",
  "Responsables pendientes": "Pending owners",
  "No hay datos suficientes para un analisis gerencial avanzado.": "There is not enough data for advanced management analysis.",
  "Sin criticidad critica dominante.": "No dominant critical severity.",
  "Sin vencimientos relevantes en el filtro.": "No relevant overdue findings in this filter.",
  "No se detectan reincidencias significativas.": "No significant recurrences detected.",
  "Mantener controles preventivos, seguimiento de cierre y revision periodica por empresa y obra.": "Maintain preventive controls, closure follow-up and periodic review by company and site.",
  "Hallazgos mes actual vs anterior": "Current month findings vs previous",
  "Criticos mes actual vs anterior": "Current month critical findings vs previous",
  "Cierre actual vs anterior": "Current closure vs previous",
  CRITICO: "CRITICAL",
  ALTO: "HIGH",
  MEDIO: "MEDIUM",
  BAJO: "LOW",
  REPORTADO: "REPORTED",
  ABIERTO: "OPEN",
  EN_SEGUIMIENTO: "IN FOLLOW-UP",
  CERRADO: "CLOSED",
  ANULADO: "VOIDED",
};

function pluralEn(count: number, singular: string, plural: string) {
  return count === 1 ? singular : plural;
}

export default function KpiGerencialAvanzadoPage() {
  const preferencias = usePlatformPreferences();
  const idiomaActivo = resolvePlatformLanguage(preferencias.language);
  const temaClaro = resolvePlatformTheme(preferencias.theme) === "light";
  const t = (texto: string) =>
    idiomaActivo === "en" ? textosKpiEn[texto] || texto : texto;
  const traducirCriticidad = (criticidad: CriticidadKpiGerencial) =>
    idiomaActivo === "en" ? t(criticidad) : etiquetaCriticidad(criticidad);
  const traducirEstado = (estado: EstadoKpiGerencial) =>
    idiomaActivo === "en" ? t(estado) : estado.replace("_", " ");
  const traducirComparacion = (etiqueta: string) =>
    idiomaActivo === "en" ? t(etiqueta) : etiqueta;
  const resumenEjecutivoTraducido = () => {
    if (idiomaActivo !== "en") return analisis.resumenEjecutivo;
    if (analisis.total === 0) {
      return t("No hay datos suficientes para un analisis gerencial avanzado.");
    }
    const empresaCritica = analisis.porEmpresa[0]?.nombre || "No dominant company";
    const areaCritica = analisis.porArea[0]?.nombre || "No dominant area";
    return `${analisis.total} ${pluralEn(analisis.total, "finding was", "findings were")} analyzed. ${empresaCritica} concentrates the highest operational load and ${areaCritica} requires priority preventive focus.`;
  };
  const riesgosTraducidos = () => {
    if (idiomaActivo !== "en") return analisis.principalesRiesgos;
    return [
      analisis.criticos > 0
        ? `${analisis.criticos} critical ${pluralEn(analisis.criticos, "finding", "findings")} in the filtered period.`
        : t("Sin criticidad critica dominante."),
      analisis.vencidos > 0
        ? `${analisis.vencidos} overdue ${pluralEn(analisis.vencidos, "finding requires", "findings require")} action.`
        : t("Sin vencimientos relevantes en el filtro."),
      analisis.reincidenciasDetectadas > 0
        ? `${analisis.reincidenciasDetectadas} recurrence ${pluralEn(analisis.reincidenciasDetectadas, "pattern detected", "patterns detected")}.`
        : t("No se detectan reincidencias significativas."),
    ];
  };
  const recomendacionTraducida = () => {
    if (idiomaActivo !== "en") return analisis.recomendacionPreventiva;
    return analisis.criticos + analisis.altos > 0 || analisis.vencidos > 0
      ? "Prioritize closure of high-severity findings, review recurrences and validate real closure owners."
      : t("Mantener controles preventivos, seguimiento de cierre y revision periodica por empresa y obra.");
  };
  const pageThemeStyle: CSSProperties = {
    ...pageStyle,
    background: temaClaro
      ? "radial-gradient(circle at 18% 0%, rgba(37,99,235,0.12), transparent 30%), radial-gradient(circle at 80% 12%, rgba(168,85,247,0.10), transparent 28%), linear-gradient(135deg, #f8fafc 0%, #eef4ff 48%, #f7fbff 100%)"
      : pageStyle.background,
    color: temaClaro ? "#0f172a" : "#f8fafc",
  };
  const themedSurfaceStyle: CSSProperties = {
    ...surfaceStyle,
    background: temaClaro ? "rgba(255,255,255,0.88)" : surfaceStyle.background,
    border: temaClaro
      ? "1px solid rgba(100,116,139,0.22)"
      : surfaceStyle.border,
    boxShadow: temaClaro
      ? "0 22px 54px rgba(15,23,42,0.10)"
      : surfaceStyle.boxShadow,
  };
  const themedInputStyle: CSSProperties = {
    ...inputStyle,
    background: temaClaro ? "rgba(248,250,252,0.96)" : inputStyle.background,
    color: temaClaro ? "#0f172a" : "#e5e7eb",
    border: temaClaro
      ? "1px solid rgba(100,116,139,0.28)"
      : inputStyle.border,
    colorScheme: temaClaro ? "light" : "dark",
  };
  const textoPrincipal = temaClaro ? "#0f172a" : "#f8fafc";
  const textoSuave = temaClaro ? "#475569" : "#94a3b8";
  const textoMedio = temaClaro ? "#334155" : "#cbd5e1";
  const textoAzul = temaClaro ? "#1d4ed8" : "#bfdbfe";
  const fondoTarjeta = temaClaro
    ? "linear-gradient(145deg, rgba(255,255,255,0.96), rgba(241,245,249,0.78))"
    : "linear-gradient(145deg, rgba(15,23,42,0.84), rgba(30,41,59,0.56))";
  const fondoInterno = temaClaro ? "rgba(248,250,252,0.92)" : "rgba(15,23,42,0.72)";
  const fondoInternoFuerte = temaClaro ? "rgba(226,232,240,0.82)" : "rgba(30,41,59,0.62)";
  const bordeInterno = temaClaro
    ? "1px solid rgba(100,116,139,0.20)"
    : "1px solid rgba(148,163,184,0.18)";
  const [hallazgos, setHallazgos] = useState<HallazgoKpiGerencial[]>(
    () => hallazgosMock.map((hallazgo) => convertirHallazgoKpi(hallazgo))
  );
  const [cargando, setCargando] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosVista>(filtrosIniciales);
  const [accionActiva, setAccionActiva] = useState("");
  const [modoAnalisis, setModoAnalisis] = useState("ranking-empresas");
  const [mensaje, setMensaje] = useState("Modulo gerencial preparado con fuente actual y fallback seguro.");

  async function cargarDatos() {
    try {
      const datosPanel = await cargarHallazgosPanelConFuentesOpcionales(hallazgosMock);
      setHallazgos(
        datosPanel.map((hallazgo) =>
          convertirHallazgoKpi(hallazgo as HallazgoPanelGerencial)
        )
      );
      setMensaje("Analisis actualizado con hallazgos disponibles para gerencia.");
    } catch (error) {
      console.warn("No se pudo cargar KPI Gerencial Avanzado.", error);
      setHallazgos(hallazgosMock.map((hallazgo) => convertirHallazgoKpi(hallazgo)));
      setMensaje("Se uso fallback local para mantener disponible el modulo gerencial.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  const opciones = useMemo(
    () => ({
      empresas: valorUnico(hallazgos.map((item) => item.empresa)),
      obras: valorUnico(hallazgos.map((item) => item.obra)),
      areas: valorUnico(hallazgos.map((item) => item.area)),
      tipos: valorUnico(hallazgos.map((item) => item.tipoHallazgo)),
      responsables: valorUnico(hallazgos.map((item) => item.responsableCierre || "")),
      reportantes: valorUnico(hallazgos.map((item) => item.reportante || "")),
    }),
    [hallazgos]
  );

  const filtrosAnalisis: FiltrosKpiGerencial = useMemo(
    () => ({
      empresa: filtros.empresa || undefined,
      obra: filtros.obra || undefined,
      area: filtros.area || undefined,
      criticidad: filtros.criticidad || undefined,
      estado: filtros.estado || undefined,
      tipoHallazgo: filtros.tipoHallazgo || undefined,
      responsableCierre: filtros.responsableCierre || undefined,
      reportante: filtros.reportante || undefined,
      fechaDesde: filtros.fechaDesde || undefined,
      fechaHasta: filtros.fechaHasta || undefined,
      semana: filtros.semana || undefined,
      mes: filtros.mes || undefined,
      gps: filtros.gps,
      evidencia: filtros.evidencia,
      vencimiento: filtros.vencimiento,
      soloCriticosAbiertos: filtros.soloCriticosAbiertos,
      soloReincidencias: filtros.soloReincidencias,
    }),
    [filtros]
  );

  const analisis = useMemo(
    () => analizarKpiGerencialAvanzado(hallazgos, filtrosAnalisis),
    [hallazgos, filtrosAnalisis]
  );

  function activarBoton(id: string) {
    setAccionActiva(id);
    vibrarCorto();
    window.setTimeout(() => setAccionActiva(""), 180);
  }

  function botonStyle(id: string, destacado = false): CSSProperties {
    const activo = accionActiva === id;
    return {
      minHeight: "44px",
      borderRadius: "14px",
      border: destacado ? "1px solid rgba(96,165,250,0.58)" : "1px solid rgba(148,163,184,0.22)",
      background: destacado
        ? "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)"
        : temaClaro
          ? "rgba(255,255,255,0.88)"
          : "rgba(15,23,42,0.78)",
      color: destacado ? "#ffffff" : textoAzul,
      padding: "11px 14px",
      fontSize: "13px",
      fontWeight: 900,
      cursor: "pointer",
      boxShadow: activo
        ? "0 6px 14px rgba(59,130,246,0.22), inset 0 2px 12px rgba(0,0,0,0.18)"
        : destacado
          ? "0 12px 26px rgba(99,102,241,0.28)"
          : "0 10px 24px rgba(0,0,0,0.18)",
      transform: activo ? "translateY(1px) scale(0.99)" : "translateY(0)",
      transition: "transform 120ms ease, box-shadow 120ms ease, filter 120ms ease",
      filter: activo ? "brightness(1.12)" : "none",
      textDecoration: "none",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      userSelect: "none",
    };
  }

  function limpiarFiltros() {
    activarBoton("limpiar");
    setFiltros(filtrosIniciales);
    setMensaje("Filtros limpiados. Analisis gerencial general restablecido.");
  }

  function aplicarAccion(id: string, texto: string) {
    activarBoton(id);
    setModoAnalisis(id);
    setMensaje(texto);
  }

  const tarjetas = [
    [t("Total hallazgos"), analisis.total, "#38bdf8", t("Base analizada")],
    [t("Abiertos"), analisis.abiertos, "#fb7185", t("Pendientes/no cerrados")],
    [t("Cerrados"), analisis.cerrados, "#22c55e", t("Gestion completada")],
    [t("Criticos"), analisis.criticos, "#ef4444", t("Mayor severidad")],
    [t("Vencidos"), analisis.vencidos, "#f97316", t("Fuera de plazo")],
    [t("Tasa cierre"), analisis.tasaCierre, "#a78bfa", t("Cumplimiento cierre"), "%"],
    [t("Prom. cierre"), analisis.tiempoPromedioCierre, "#facc15", t("Dias promedio"), " d"],
    [t("Empresas"), analisis.empresasActivas, "#60a5fa", t("Empresas activas")],
    [t("Obras"), analisis.obrasActivas, "#2dd4bf", t("Proyectos activos")],
    [t("Reincidencias"), analisis.reincidenciasDetectadas, "#f43f5e", t("Patrones repetidos")],
    [t("Cumplimiento"), analisis.cumplimientoGeneral, "#34d399", t("Indice general"), "%"],
    [t("Preventivo"), analisis.indicadorPreventivoGlobal, "#818cf8", t("Indicador global"), "%"],
  ] as const;

  const rankingPrincipal =
    modoAnalisis === "ranking-areas"
      ? analisis.porArea
      : modoAnalisis === "ranking-obras"
        ? analisis.porObra
        : modoAnalisis === "ranking-tipos"
          ? analisis.porTipo
          : modoAnalisis === "ranking-responsables"
            ? analisis.porResponsable
            : analisis.porEmpresa;
  const maxRanking = maximoRanking(rankingPrincipal);
  const maxTendencia = Math.max(1, ...analisis.tendenciaTemporal.map((item) => item.total));

  return (
    <main className="ce-panel-page ce-panel-kpi-page" style={pageThemeStyle}>
      <div className="ce-panel-shell ce-panel-kpi-shell" style={shellStyle}>
        <header
          className="ce-panel-header"
          style={{
            ...themedSurfaceStyle,
            padding: "22px",
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(340px, auto)",
            gap: "18px",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: "12px", letterSpacing: "1.2px", textTransform: "uppercase", color: textoAzul, fontWeight: 950 }}>
              {t("Plataforma Hallazgos · Gerencia")}
            </div>
            <h1 style={{ margin: "8px 0 6px", fontSize: "34px", lineHeight: 1, fontWeight: 950 }}>
              {t("KPI Gerencial Avanzado")}
            </h1>
            <p style={{ margin: 0, maxWidth: "1040px", color: textoMedio, fontSize: "15px", lineHeight: 1.5, fontWeight: 650 }}>
              {t("Analisis ejecutivo para comparar empresas, obras, periodos, criticidad, cierres, vencimientos y reincidencias con foco preventivo y reportabilidad.")}
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
            <Link href="/panel" onMouseDown={() => activarBoton("volver")} style={botonStyle("volver")}>
              {t("Volver al panel")}
            </Link>
            <button
              type="button"
              onClick={() => {
                activarBoton("actualizar");
                cargarDatos();
              }}
              style={botonStyle("actualizar", true)}
            >
              {t("Actualizar analisis")}
            </button>
            <button
              type="button"
              onClick={() =>
                aplicarAccion(
                  "informe",
                  "Informe ejecutivo preparado visualmente. PDF/Excel real se conectara en etapa posterior."
                )
              }
              style={botonStyle("informe", true)}
            >
              {t("Preparar informe")}
            </button>
          </div>
        </header>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(150px, 1fr))", gap: "12px" }}>
          {tarjetas.map(([titulo, valor, color, detalle, sufijo]) => (
            <article
              key={titulo}
              style={{
                ...themedSurfaceStyle,
                padding: "16px",
                minHeight: "126px",
                background: fondoTarjeta,
              }}
            >
              <div style={{ fontSize: "11px", color: textoMedio, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.7px" }}>
                {titulo}
              </div>
              <div style={{ marginTop: "9px", fontSize: "34px", lineHeight: 1, fontWeight: 950, color, textShadow: `0 0 20px ${color}66` }}>
                {formatoNumero(valor, sufijo || "")}
              </div>
              <div style={{ marginTop: "9px", color: textoSuave, fontSize: "12px", lineHeight: 1.35, fontWeight: 750 }}>
                {detalle}
              </div>
            </article>
          ))}
        </section>

        <section
          className="ce-panel-kpi-grid-layout"
          style={{
            display: "grid",
            gridTemplateColumns:
              "clamp(300px, 16vw, 390px) minmax(0, 1fr) clamp(340px, 18vw, 440px)",
            gap: "clamp(16px, 0.95vw, 24px)",
            alignItems: "start",
          }}
        >
          <aside className="ce-panel-kpi-filters" style={{ ...themedSurfaceStyle, padding: "18px", display: "grid", gap: "13px" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 950 }}>{t("Filtros avanzados")}</h2>
              <p style={{ margin: "6px 0 0", color: textoSuave, fontSize: "12px", lineHeight: 1.45, fontWeight: 700 }}>
                {t("Cruza empresa, obra, area, periodo, criticidad, responsable y evidencia.")}
              </p>
            </div>

            {[
              ["Empresa", "empresa", opciones.empresas],
              ["Obra / proyecto", "obra", opciones.obras],
              ["Area", "area", opciones.areas],
              ["Tipo de hallazgo", "tipoHallazgo", opciones.tipos],
              ["Responsable cierre", "responsableCierre", opciones.responsables],
              ["Supervisor/reportante", "reportante", opciones.reportantes],
            ].map(([label, key, values]) => (
              <label key={String(key)} style={{ display: "grid", gap: "6px" }}>
                <span style={{ fontSize: "12px", fontWeight: 900, color: textoAzul }}>{t(label as string)}</span>
                <select
                  value={String(filtros[key as keyof FiltrosVista])}
                  onChange={(event) =>
                    setFiltros((actual) => ({
                      ...actual,
                      [key as keyof FiltrosVista]: event.target.value,
                    }))
                  }
                  style={themedInputStyle}
                >
                  <option value="">{t("Todos")}</option>
                  {(values as string[]).map((valor) => (
                    <option key={valor} value={valor}>
                      {valor}
                    </option>
                  ))}
                </select>
              </label>
            ))}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <label style={{ display: "grid", gap: "6px" }}>
                <span style={{ fontSize: "12px", fontWeight: 900, color: textoAzul }}>{t("Criticidad")}</span>
                <select
                  value={filtros.criticidad}
                  onChange={(event) =>
                    setFiltros((actual) => ({
                      ...actual,
                      criticidad: event.target.value as FiltrosVista["criticidad"],
                    }))
                  }
                  style={themedInputStyle}
                >
                  <option value="">{t("Todas")}</option>
                  {(["CRITICO", "ALTO", "MEDIO", "BAJO"] as CriticidadKpiGerencial[]).map((criticidad) => (
                    <option key={criticidad} value={criticidad}>
                      {traducirCriticidad(criticidad)}
                    </option>
                  ))}
                </select>
              </label>
              <label style={{ display: "grid", gap: "6px" }}>
                <span style={{ fontSize: "12px", fontWeight: 900, color: textoAzul }}>{t("Estado")}</span>
                <select
                  value={filtros.estado}
                  onChange={(event) =>
                    setFiltros((actual) => ({
                      ...actual,
                      estado: event.target.value as FiltrosVista["estado"],
                    }))
                  }
                  style={themedInputStyle}
                >
                  <option value="">{t("Todos")}</option>
                  {(["REPORTADO", "ABIERTO", "EN_SEGUIMIENTO", "CERRADO", "ANULADO"] as EstadoKpiGerencial[]).map((estado) => (
                    <option key={estado} value={estado}>
                      {traducirEstado(estado)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <label style={{ display: "grid", gap: "6px" }}>
                <span style={{ fontSize: "12px", fontWeight: 900, color: textoAzul }}>{t("Desde")}</span>
                <input type="date" value={filtros.fechaDesde} onChange={(event) => setFiltros((actual) => ({ ...actual, fechaDesde: event.target.value }))} style={themedInputStyle} />
              </label>
              <label style={{ display: "grid", gap: "6px" }}>
                <span style={{ fontSize: "12px", fontWeight: 900, color: textoAzul }}>{t("Hasta")}</span>
                <input type="date" value={filtros.fechaHasta} onChange={(event) => setFiltros((actual) => ({ ...actual, fechaHasta: event.target.value }))} style={themedInputStyle} />
              </label>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <label style={{ display: "grid", gap: "6px" }}>
                <span style={{ fontSize: "12px", fontWeight: 900, color: textoAzul }}>{t("Semana")}</span>
                <input type="date" value={filtros.semana} onChange={(event) => setFiltros((actual) => ({ ...actual, semana: event.target.value }))} style={themedInputStyle} />
              </label>
              <label style={{ display: "grid", gap: "6px" }}>
                <span style={{ fontSize: "12px", fontWeight: 900, color: textoAzul }}>{t("Mes")}</span>
                <input type="month" value={filtros.mes} onChange={(event) => setFiltros((actual) => ({ ...actual, mes: event.target.value }))} style={themedInputStyle} />
              </label>
            </div>

            {[
              ["GPS", "gps", [["todos", "Con GPS y sin GPS"], ["con-gps", "Solo con GPS"], ["sin-gps", "Solo sin GPS"]]],
              ["Evidencia", "evidencia", [["todos", "Con y sin evidencia"], ["con-evidencia", "Con evidencia"], ["sin-evidencia", "Sin evidencia"]]],
              ["Vencimiento", "vencimiento", [["todos", "Todos"], ["vencidos", "Solo vencidos"], ["no-vencidos", "No vencidos"]]],
            ].map(([label, key, values]) => (
              <label key={String(key)} style={{ display: "grid", gap: "6px" }}>
                <span style={{ fontSize: "12px", fontWeight: 900, color: textoAzul }}>{t(label as string)}</span>
                <select
                  value={String(filtros[key as keyof FiltrosVista])}
                  onChange={(event) =>
                    setFiltros((actual) => ({
                      ...actual,
                      [key as keyof FiltrosVista]: event.target.value,
                    }))
                  }
                  style={themedInputStyle}
                >
                  {(values as string[][]).map(([valor, etiqueta]) => (
                    <option key={valor} value={valor}>
                      {t(etiqueta)}
                    </option>
                  ))}
                </select>
              </label>
            ))}

            <label style={{ display: "flex", gap: "10px", alignItems: "center", fontSize: "13px", fontWeight: 850, color: textoAzul }}>
              <input
                type="checkbox"
                checked={filtros.soloCriticosAbiertos}
                onChange={(event) => setFiltros((actual) => ({ ...actual, soloCriticosAbiertos: event.target.checked }))}
              />
              {t("Solo criticos abiertos")}
            </label>
            <label style={{ display: "flex", gap: "10px", alignItems: "center", fontSize: "13px", fontWeight: 850, color: textoAzul }}>
              <input
                type="checkbox"
                checked={filtros.soloReincidencias}
                onChange={(event) => setFiltros((actual) => ({ ...actual, soloReincidencias: event.target.checked }))}
              />
              {t("Solo reincidencias")}
            </label>

            <button type="button" onClick={() => aplicarAccion("aplicar", "Filtros aplicados al analisis gerencial.")} style={botonStyle("aplicar", true)}>
              {t("Aplicar filtros")}
            </button>
            <button type="button" onClick={limpiarFiltros} style={botonStyle("limpiar")}>
              {t("Limpiar filtros")}
            </button>
          </aside>

          <section className="ce-panel-kpi-main" style={{ display: "grid", gap: "16px", minWidth: 0 }}>
            <section style={{ ...themedSurfaceStyle, padding: "18px", display: "grid", gap: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 950 }}>{t("Tablero de analisis ejecutivo")}</h2>
                  <p style={{ margin: "5px 0 0", color: textoSuave, fontSize: "13px", fontWeight: 750 }}>
                    {cargando ? t("Cargando datos...") : t(mensaje)}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                  {[
                    ["ranking-empresas", "Ranking empresas", "Ranking de empresas activo."],
                    ["ranking-obras", "Comparar obras", "Comparacion por obras activa."],
                    ["ranking-areas", "Ranking areas", "Ranking de areas activo."],
                    ["criticidad", "Ver criticidad", "Distribucion por criticidad activa."],
                    ["cierres", "Ver cierres", "Analisis de cierres activo."],
                    ["vencidos", "Ver vencidos", "Foco en hallazgos vencidos activo."],
                    ["reincidencias", "Ver reincidencias", "Lectura de reincidencias activa."],
                  ].map(([id, label, texto]) => (
                    <button key={id} type="button" onClick={() => aplicarAccion(id, texto)} style={botonStyle(id, id === modoAnalisis)}>
                      {t(label)}
                    </button>
                  ))}
                </div>
              </div>

              {analisis.total === 0 ? (
                <div style={{ borderRadius: "24px", padding: "34px", background: fondoInterno, border: bordeInterno, textAlign: "center" }}>
                  <div style={{ fontSize: "34px", fontWeight: 950, color: "#38bdf8" }}>{t("KPI preparado")}</div>
                  <p style={{ maxWidth: "620px", margin: "12px auto 0", color: textoMedio, lineHeight: 1.5, fontWeight: 700 }}>
                    {t("No hay datos suficientes con los filtros seleccionados. Al registrar mas hallazgos, este modulo mostrara rankings, comparaciones, tasas y reportabilidad ejecutiva.")}
                  </p>
                </div>
              ) : (
                <div className="ce-panel-kpi-analysis-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.35fr) minmax(330px, 0.85fr)", gap: "16px", alignItems: "stretch" }}>
                  <div style={{ borderRadius: "24px", padding: "18px", background: fondoInterno, border: bordeInterno }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
                      <div style={{ fontSize: "15px", fontWeight: 950 }}>{t("Ranking comparativo")}</div>
                      <div style={{ fontSize: "12px", color: textoAzul, fontWeight: 900 }}>{modoAnalisis.replace("-", " ")}</div>
                    </div>
                    <div style={{ display: "grid", gap: "10px" }}>
                      {rankingPrincipal.slice(0, 8).map((item, index) => {
                        const ancho = Math.max(8, (item.total / maxRanking) * 100);
                        return (
                          <div key={`${item.nombre}-${index}`} style={{ display: "grid", gap: "6px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", fontSize: "12px", fontWeight: 900 }}>
                              <span>{index + 1}. {item.nombre}</span>
                              <span style={{ color: textoAzul }}>{item.total} · {t("cierre")} {item.tasaCierre}%</span>
                            </div>
                            <div style={{ height: "14px", borderRadius: "999px", background: fondoInternoFuerte, overflow: "hidden" }}>
                              <div style={{ width: `${ancho}%`, height: "100%", borderRadius: "999px", background: item.criticos > 0 ? "linear-gradient(90deg,#ef4444,#f97316)" : "linear-gradient(90deg,#2563eb,#22c55e)", boxShadow: "0 0 20px rgba(59,130,246,0.36)" }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ borderRadius: "24px", padding: "18px", background: fondoInterno, border: bordeInterno }}>
                    <div style={{ fontSize: "15px", fontWeight: 950, marginBottom: "14px" }}>{t("Criticidad y estado")}</div>
                    <div style={{ display: "grid", gap: "12px" }}>
                      {Object.entries(analisis.porCriticidad).map(([criticidad, total]) => (
                        <div key={criticidad} style={{ display: "grid", gridTemplateColumns: "88px 1fr 42px", gap: "10px", alignItems: "center" }}>
                          <span style={{ fontSize: "12px", fontWeight: 900, color: colorCriticidad(criticidad as CriticidadKpiGerencial) }}>{traducirCriticidad(criticidad as CriticidadKpiGerencial)}</span>
                          <div style={{ height: "11px", borderRadius: "999px", background: fondoInternoFuerte, overflow: "hidden" }}>
                            <div style={{ width: `${analisis.total ? (total / analisis.total) * 100 : 0}%`, height: "100%", borderRadius: "999px", background: colorCriticidad(criticidad as CriticidadKpiGerencial) }} />
                          </div>
                          <strong style={{ fontSize: "12px", textAlign: "right" }}>{total}</strong>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: "18px", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                      {Object.entries(analisis.porEstado).map(([estado, total]) => (
                        <div key={estado} style={{ borderRadius: "16px", padding: "11px", background: fondoInternoFuerte, border: bordeInterno }}>
                          <div style={{ fontSize: "11px", color: textoSuave, fontWeight: 900 }}>{traducirEstado(estado as EstadoKpiGerencial)}</div>
                          <div style={{ marginTop: "4px", fontSize: "22px", fontWeight: 950 }}>{total}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section className="ce-panel-kpi-secondary-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.1fr) minmax(360px, 0.9fr)", gap: "16px" }}>
              <div style={{ ...themedSurfaceStyle, padding: "18px" }}>
                <div style={{ fontSize: "16px", fontWeight: 950, marginBottom: "14px" }}>{t("Tendencia temporal")}</div>
                <div style={{ height: "230px", display: "flex", alignItems: "end", gap: "10px", paddingTop: "16px" }}>
                  {analisis.tendenciaTemporal.slice(-10).map((item) => (
                    <div key={item.periodo} style={{ flex: 1, display: "grid", alignItems: "end", gap: "8px", minWidth: 0 }}>
                      <div style={{ height: `${Math.max(8, (item.total / maxTendencia) * 180)}px`, borderRadius: "14px 14px 6px 6px", background: item.criticos > 0 ? "linear-gradient(180deg,#ef4444,#7f1d1d)" : "linear-gradient(180deg,#38bdf8,#1d4ed8)", boxShadow: "0 10px 24px rgba(14,165,233,0.20)" }} />
                      <div style={{ fontSize: "10px", color: textoSuave, textAlign: "center", fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis" }}>{item.periodo}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ ...themedSurfaceStyle, padding: "18px" }}>
                <div style={{ fontSize: "16px", fontWeight: 950, marginBottom: "14px" }}>{t("Comparaciones")}</div>
                <div style={{ display: "grid", gap: "12px" }}>
                  {analisis.comparaciones.map((item) => (
                    <div key={item.etiqueta} style={{ borderRadius: "18px", padding: "14px", background: fondoInterno, border: bordeInterno }}>
                      <div style={{ fontSize: "12px", color: textoAzul, fontWeight: 900 }}>{traducirComparacion(item.etiqueta)}</div>
                      <div style={{ marginTop: "8px", display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "baseline" }}>
                        <span style={{ fontSize: "26px", fontWeight: 950 }}>{item.actual}</span>
                        <span style={{ fontSize: "13px", color: item.variacion > 0 ? "#fb7185" : "#34d399", fontWeight: 950 }}>
                          {item.variacion > 0 ? "+" : ""}{item.variacion} vs {item.comparado}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </section>

          <aside className="ce-panel-kpi-report" style={{ ...themedSurfaceStyle, padding: "18px", display: "grid", gap: "14px" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 950 }}>{t("Informe ejecutivo preparado")}</h2>
              <p style={{ margin: "6px 0 0", color: textoSuave, fontSize: "12px", lineHeight: 1.45, fontWeight: 700 }}>
                {t("Resumen automatico listo para futura salida PDF/Excel.")}
              </p>
            </div>

            <div style={{ borderRadius: "22px", padding: "16px", background: temaClaro ? "rgba(219,234,254,0.62)" : "linear-gradient(145deg, rgba(37,99,235,0.22), rgba(15,23,42,0.82))", border: "1px solid rgba(96,165,250,0.26)" }}>
              <div style={{ fontSize: "12px", color: textoAzul, fontWeight: 950 }}>{t("Resumen")}</div>
              <p style={{ margin: "8px 0 0", color: textoPrincipal, lineHeight: 1.5, fontSize: "14px", fontWeight: 750 }}>
                {resumenEjecutivoTraducido()}
              </p>
            </div>

            <div style={{ display: "grid", gap: "10px" }}>
              <div style={{ fontSize: "12px", color: textoAzul, fontWeight: 950 }}>{t("Riesgos principales")}</div>
              {riesgosTraducidos().map((riesgo) => (
                <div key={riesgo} style={{ borderRadius: "16px", padding: "12px", background: fondoInterno, border: bordeInterno, color: textoMedio, fontSize: "13px", lineHeight: 1.4, fontWeight: 750 }}>
                  {riesgo}
                </div>
              ))}
            </div>

            <div style={{ borderRadius: "22px", padding: "16px", background: temaClaro ? "rgba(254,226,226,0.72)" : "linear-gradient(145deg, rgba(239,68,68,0.18), rgba(15,23,42,0.82))", border: "1px solid rgba(239,68,68,0.26)" }}>
              <div style={{ fontSize: "12px", color: temaClaro ? "#991b1b" : "#fecaca", fontWeight: 950 }}>{t("Recomendacion preventiva")}</div>
              <p style={{ margin: "8px 0 0", color: textoPrincipal, lineHeight: 1.5, fontSize: "14px", fontWeight: 800 }}>
                {recomendacionTraducida()}
              </p>
            </div>

            <div style={{ display: "grid", gap: "9px" }}>
              <button type="button" onClick={() => aplicarAccion("pdf", "PDF preparado visualmente. Generacion real pendiente de etapa posterior.")} style={botonStyle("pdf", true)}>
                {t("Exportar PDF")}
              </button>
              <button type="button" onClick={() => aplicarAccion("excel", "Excel preparado visualmente. Exportacion real pendiente de etapa posterior.")} style={botonStyle("excel")}>
                {t("Exportar Excel")}
              </button>
            </div>

            <div style={{ display: "grid", gap: "9px" }}>
              <div style={{ fontSize: "12px", color: textoAzul, fontWeight: 950 }}>{t("Rankings adicionales")}</div>
              {[
                ["ranking-empresas", "Empresas con mas hallazgos"],
                ["ranking-areas", "Areas con mas hallazgos"],
                ["ranking-tipos", "Tipos mas frecuentes"],
                ["ranking-responsables", "Responsables pendientes"],
              ].map(([id, label]) => (
                <button key={id} type="button" onClick={() => aplicarAccion(id, `${label} activo.`)} style={{ ...botonStyle(id), justifyContent: "space-between" }}>
                  <span>{t(label)}</span>
                  <span>→</span>
                </button>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
