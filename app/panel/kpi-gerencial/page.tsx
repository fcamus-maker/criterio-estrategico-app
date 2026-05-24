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
  empresaReportante?: string;
  empresaResponsableInvolucrada?: string;
  fechaCompromiso?: string;
  fechaCierre?: string;
  responsable?: string;
  responsableCierreNombre?: string;
  responsableCierreCargo?: string;
  responsableCierreEstadoSeguimiento?: string;
  responsableCorreccionNombre?: string;
  responsableCorreccionCargo?: string;
  responsableCorreccionEmpresa?: string;
  evidenciaCierre?: string;
  evidenciaRecibida?: string;
  plazoExtendido?: boolean;
  cierreSinEvidenciaJustificado?: boolean;
};

type FiltrosVista = {
  empresaReportante: string;
  empresaResponsable: string;
  obra: string;
  area: string;
  criticidad: "" | CriticidadKpiGerencial;
  estado: "" | EstadoKpiGerencial;
  estadoCierre: string;
  tipoHallazgo: string;
  responsableCierre: string;
  responsableCargo: string;
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

type TarjetaKpiGerencial = {
  titulo: string;
  valor: number | string;
  color: string;
  detalle: string;
  sufijo?: string;
  disponible?: boolean;
};

type GrupoKpiGerencial = {
  titulo: string;
  subtitulo: string;
  foco: string;
  tarjetas: TarjetaKpiGerencial[];
};

type FocoDetalleAccionable =
  | "todos"
  | "abiertos"
  | "criticos-abiertos"
  | "vencidos-abiertos"
  | "sin-fecha-compromiso"
  | "cerrados";

type FiltrosDetalleAccionable = {
  empresaResponsable: string;
  empresaReportante: string;
  obra: string;
  responsableCierre: string;
  criticidad: "" | CriticidadKpiGerencial;
  estado: "" | EstadoKpiGerencial;
  vencimiento: "todos" | "vencidos" | "no-vencidos" | "sin-fecha";
};

const LIMITE_REGISTROS_ANALISIS = 500;

const filtrosIniciales: FiltrosVista = {
  empresaReportante: "",
  empresaResponsable: "",
  obra: "",
  area: "",
  criticidad: "",
  estado: "",
  estadoCierre: "",
  tipoHallazgo: "",
  responsableCierre: "",
  responsableCargo: "",
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

const filtrosDetalleAccionableIniciales: FiltrosDetalleAccionable = {
  empresaResponsable: "",
  empresaReportante: "",
  obra: "",
  responsableCierre: "",
  criticidad: "",
  estado: "",
  vencimiento: "todos",
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
  const empresaReportante =
    hallazgo.empresaReportante || hallazgo.empresa || "Sin empresa reportante";
  const empresaResponsable =
    hallazgo.empresaResponsableInvolucrada || "";

  return {
    id: hallazgo.id,
    codigo: hallazgo.codigo,
    empresa: empresaReportante,
    empresaReportante,
    empresaResponsable,
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
    responsableCargo:
      hallazgo.responsableCierreCargo ||
      hallazgo.responsableCorreccionCargo ||
      "",
    estadoCierre: hallazgo.responsableCierreEstadoSeguimiento || "",
    fechaCompromiso: hallazgo.fechaCompromiso,
    fechaCierre: hallazgo.fechaCierre,
    evidenciaCierreRecibida: hallazgo.evidenciaRecibida || hallazgo.evidenciaCierre,
    plazoExtendido: hallazgo.plazoExtendido,
    cierreSinEvidenciaJustificado: hallazgo.cierreSinEvidenciaJustificado,
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

function formatoValorTarjeta(valor: TarjetaKpiGerencial["valor"], sufijo = "") {
  return typeof valor === "number" ? formatoNumero(valor, sufijo) : valor;
}

function esHallazgoAbiertoGerencial(hallazgo: HallazgoKpiGerencial) {
  return hallazgo.estado !== "CERRADO" && hallazgo.estado !== "ANULADO";
}

function fechaCortaDetalle(valor?: string) {
  if (!valor) return "Sin fecha";
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "Sin fecha";
  return fecha.toLocaleDateString("es-CL");
}

function esHallazgoVencidoDetalle(hallazgo: HallazgoKpiGerencial) {
  if (!esHallazgoAbiertoGerencial(hallazgo) || !hallazgo.fechaCompromiso) {
    return false;
  }
  const compromiso = new Date(hallazgo.fechaCompromiso);
  const hoy = new Date();
  if (Number.isNaN(compromiso.getTime())) return false;
  compromiso.setHours(0, 0, 0, 0);
  hoy.setHours(0, 0, 0, 0);
  return compromiso < hoy;
}

function diasVencidoDetalle(hallazgo: HallazgoKpiGerencial) {
  if (!esHallazgoVencidoDetalle(hallazgo) || !hallazgo.fechaCompromiso) return 0;
  const compromiso = new Date(hallazgo.fechaCompromiso);
  const hoy = new Date();
  compromiso.setHours(0, 0, 0, 0);
  hoy.setHours(0, 0, 0, 0);
  return Math.max(1, Math.ceil((hoy.getTime() - compromiso.getTime()) / 86400000));
}

function colorEstadoDetalle(estado: EstadoKpiGerencial) {
  if (estado === "CERRADO") return "#22c55e";
  if (estado === "EN_SEGUIMIENTO") return "#38bdf8";
  if (estado === "ABIERTO") return "#f97316";
  if (estado === "ANULADO") return "#94a3b8";
  return "#a78bfa";
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
    const focoEmpresa =
      filtros.empresaResponsable ||
      filtros.empresaReportante ||
      analisis.porEmpresaReportante[0]?.nombre ||
      "Sin empresa dominante";
    const focoObra = analisis.porObra[0]?.nombre || "Sin obra dominante";
    const focoArea = analisis.porArea[0]?.nombre || "Sin area dominante";
    const contextoFiltro =
      filtros.empresaResponsable && filtros.empresaReportante
        ? `Cruce reportante ${filtros.empresaReportante} / responsable ${filtros.empresaResponsable}`
        : filtros.empresaResponsable
          ? `Empresa responsable ${filtros.empresaResponsable}`
          : filtros.empresaReportante
            ? `Reportes generados por ${filtros.empresaReportante}`
            : "Vista general";

    if (idiomaActivo !== "en") {
      if (analisis.total === 0) {
        return "No hay datos suficientes con los filtros seleccionados para emitir lectura gerencial.";
      }

      return `${metricasGerenciales.nivelRiesgo}. ${contextoFiltro}. Foco principal: ${focoEmpresa}, ${focoObra}, ${focoArea}.`;
    }
    if (analisis.total === 0) {
      return t("No hay datos suficientes para un analisis gerencial avanzado.");
    }
    return `${metricasGerenciales.nivelRiesgo}. ${contextoFiltro}. Main focus: ${focoEmpresa}, ${focoObra}, ${focoArea}.`;
  };
  const riesgosTraducidos = () => {
    if (idiomaActivo !== "en") {
      return [
        metricasGerenciales.criticosAbiertos > 0
          ? `${metricasGerenciales.criticosAbiertos} critico(s) abierto(s) requieren prioridad ejecutiva.`
          : "Sin criticos abiertos en los registros cargados.",
        metricasGerenciales.vencidosAbiertos > 0
          ? `${metricasGerenciales.vencidosAbiertos} hallazgo(s) vencido(s) siguen abiertos.`
          : "Sin vencidos abiertos en el filtro actual.",
        metricasGerenciales.sinFechaCompromiso > 0
          ? `${metricasGerenciales.sinFechaCompromiso} hallazgo(s) abierto(s) no tienen fecha compromiso.`
          : "La base filtrada no muestra abiertos sin fecha compromiso.",
      ];
    }
    return [
      metricasGerenciales.criticosAbiertos > 0
        ? `${metricasGerenciales.criticosAbiertos} open critical ${pluralEn(metricasGerenciales.criticosAbiertos, "finding requires", "findings require")} executive priority.`
        : "No open critical findings in loaded records.",
      metricasGerenciales.vencidosAbiertos > 0
        ? `${metricasGerenciales.vencidosAbiertos} open overdue ${pluralEn(metricasGerenciales.vencidosAbiertos, "finding", "findings")}.`
        : "No open overdue findings in the current filter.",
      metricasGerenciales.sinFechaCompromiso > 0
        ? `${metricasGerenciales.sinFechaCompromiso} open ${pluralEn(metricasGerenciales.sinFechaCompromiso, "finding has", "findings have")} no commitment date.`
        : "No open findings without commitment date in the filtered base.",
    ];
  };
  const recomendacionTraducida = () => {
    if (idiomaActivo !== "en") {
      if (metricasGerenciales.criticosAbiertos + metricasGerenciales.vencidosAbiertos > 0) {
        return "Priorizar cierre de criticos y vencidos, exigir responsable real por empresa y revisar evidencia antes del proximo comite.";
      }

      return "Mantener seguimiento preventivo, validar responsables reales y sostener revision periodica por empresa, obra y area.";
    }
    return metricasGerenciales.criticosAbiertos + metricasGerenciales.vencidosAbiertos > 0
      ? "Prioritize critical and overdue closure, require real company owners, and review evidence before the next committee."
      : "Maintain preventive follow-up, validate real owners and keep periodic review by company, site and area.";
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
  const filtroBloqueStyle: CSSProperties = {
    display: "grid",
    gap: "11px",
    borderRadius: "18px",
    padding: "13px",
    background: temaClaro
      ? "linear-gradient(145deg, rgba(255,255,255,0.96), rgba(241,245,249,0.92))"
      : "linear-gradient(145deg, rgba(30,41,59,0.92), rgba(15,23,42,0.82))",
    border: temaClaro
      ? "1px solid rgba(59,130,246,0.22)"
      : "1px solid rgba(125,211,252,0.18)",
    borderLeft: temaClaro
      ? "3px solid rgba(37,99,235,0.72)"
      : "3px solid rgba(56,189,248,0.70)",
    boxShadow: temaClaro
      ? "0 12px 26px rgba(15,23,42,0.06)"
      : "0 16px 34px rgba(0,0,0,0.20)",
  };
  const filtroTituloStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: textoPrincipal,
    fontSize: "12px",
    fontWeight: 950,
    textTransform: "uppercase",
    letterSpacing: "0.7px",
  };
  const filtroChipStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "22px",
    height: "22px",
    borderRadius: "999px",
    background: temaClaro ? "rgba(37,99,235,0.12)" : "rgba(56,189,248,0.14)",
    border: temaClaro
      ? "1px solid rgba(37,99,235,0.22)"
      : "1px solid rgba(125,211,252,0.28)",
    color: textoAzul,
    fontSize: "11px",
    fontWeight: 950,
  };
  const [hallazgos, setHallazgos] = useState<HallazgoKpiGerencial[]>(
    () => hallazgosMock.map((hallazgo) => convertirHallazgoKpi(hallazgo))
  );
  const [cargando, setCargando] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosVista>(filtrosIniciales);
  const [accionActiva, setAccionActiva] = useState("");
  const [modoAnalisis, setModoAnalisis] = useState("ranking-empresas");
  const [mensaje, setMensaje] = useState("Modulo gerencial preparado con fuente actual y fallback seguro.");
  const [focoDetalleAccionable, setFocoDetalleAccionable] =
    useState<FocoDetalleAccionable>("todos");
  const [busquedaDetalleAccionable, setBusquedaDetalleAccionable] = useState("");
  const [limiteDetalleAccionable, setLimiteDetalleAccionable] = useState(20);
  const [paginaDetalleAccionable, setPaginaDetalleAccionable] = useState(1);
  const [hallazgoDetalleAbierto, setHallazgoDetalleAbierto] = useState("");
  const [filtrosDetalleAccionable, setFiltrosDetalleAccionable] =
    useState<FiltrosDetalleAccionable>(filtrosDetalleAccionableIniciales);

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
      empresasReportantes: valorUnico(
        hallazgos.map((item) => item.empresaReportante || item.empresa)
      ),
      empresasResponsables: valorUnico(
        hallazgos.map((item) => item.empresaResponsable || "")
      ),
      obras: valorUnico(hallazgos.map((item) => item.obra)),
      areas: valorUnico(hallazgos.map((item) => item.area)),
      tipos: valorUnico(hallazgos.map((item) => item.tipoHallazgo)),
      responsables: valorUnico(hallazgos.map((item) => item.responsableCierre || "")),
      cargosResponsables: valorUnico(
        hallazgos.map((item) => item.responsableCargo || "")
      ),
      estadosCierre: valorUnico(hallazgos.map((item) => item.estadoCierre || "")),
      reportantes: valorUnico(hallazgos.map((item) => item.reportante || "")),
    }),
    [hallazgos]
  );

  const filtrosAnalisis: FiltrosKpiGerencial = useMemo(
    () => ({
      empresaReportante: filtros.empresaReportante || undefined,
      empresaResponsable: filtros.empresaResponsable || undefined,
      obra: filtros.obra || undefined,
      area: filtros.area || undefined,
      criticidad: filtros.criticidad || undefined,
      estado: filtros.estado || undefined,
      estadoCierre: filtros.estadoCierre || undefined,
      tipoHallazgo: filtros.tipoHallazgo || undefined,
      responsableCierre: filtros.responsableCierre || undefined,
      responsableCargo: filtros.responsableCargo || undefined,
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

  const metricasGerenciales = useMemo(() => {
    const abiertos = analisis.hallazgos.filter(esHallazgoAbiertoGerencial);
    const criticosAbiertos = abiertos.filter(
      (hallazgo) => hallazgo.criticidad === "CRITICO"
    ).length;
    const sinFechaCompromiso = abiertos.filter(
      (hallazgo) => !hallazgo.fechaCompromiso
    ).length;
    const nivelRiesgo =
      criticosAbiertos > 0 || analisis.vencidos > 0
        ? "Riesgo alto"
        : analisis.altos > 0 || sinFechaCompromiso > 0
          ? "Riesgo medio"
          : "Riesgo controlado";

    return {
      abiertosReales: abiertos.length,
      criticosAbiertos,
      vencidosAbiertos: analisis.vencidos,
      sinFechaCompromiso,
      nivelRiesgo,
      analisisLimitadoPorCarga: hallazgos.length >= LIMITE_REGISTROS_ANALISIS,
    };
  }, [analisis, hallazgos.length]);

  const filtrosActivosResumen = useMemo(
    () =>
      [
        filtros.empresaReportante
          ? `Empresa reportante: ${filtros.empresaReportante}`
          : null,
        filtros.empresaResponsable
          ? `Empresa responsable: ${filtros.empresaResponsable}`
          : null,
        filtros.obra ? `Obra: ${filtros.obra}` : null,
        filtros.area ? `Area: ${filtros.area}` : null,
        filtros.tipoHallazgo ? `Tipo: ${filtros.tipoHallazgo}` : null,
        filtros.responsableCierre
          ? `Responsable cierre: ${filtros.responsableCierre}`
          : null,
        filtros.responsableCargo ? `Cargo responsable: ${filtros.responsableCargo}` : null,
        filtros.estadoCierre ? `Estado cierre: ${filtros.estadoCierre}` : null,
        filtros.criticidad ? `Criticidad: ${filtros.criticidad}` : null,
        filtros.estado ? `Estado operativo: ${filtros.estado}` : null,
        filtros.vencimiento !== "todos" ? `Vencimiento: ${filtros.vencimiento}` : null,
        filtros.soloCriticosAbiertos ? "Solo criticos abiertos" : null,
        filtros.soloReincidencias ? "Solo reincidencias" : null,
        filtros.fechaDesde ? `Desde: ${filtros.fechaDesde}` : null,
        filtros.fechaHasta ? `Hasta: ${filtros.fechaHasta}` : null,
        filtros.semana ? `Semana desde: ${filtros.semana}` : null,
        filtros.mes ? `Mes: ${filtros.mes}` : null,
        filtros.gps !== "todos" ? `GPS: ${filtros.gps}` : null,
        filtros.evidencia !== "todos" ? `Evidencia del reporte: ${filtros.evidencia}` : null,
      ].filter(Boolean) as string[],
    [filtros]
  );

  const detalleAccionableBase = useMemo(() => {
    if (focoDetalleAccionable === "abiertos") {
      return analisis.hallazgos.filter(esHallazgoAbiertoGerencial);
    }
    if (focoDetalleAccionable === "criticos-abiertos") {
      return analisis.hallazgos.filter(
        (hallazgo) =>
          hallazgo.criticidad === "CRITICO" &&
          esHallazgoAbiertoGerencial(hallazgo)
      );
    }
    if (focoDetalleAccionable === "vencidos-abiertos") {
      return analisis.hallazgos.filter(esHallazgoVencidoDetalle);
    }
    if (focoDetalleAccionable === "sin-fecha-compromiso") {
      return analisis.hallazgos.filter(
        (hallazgo) =>
          esHallazgoAbiertoGerencial(hallazgo) && !hallazgo.fechaCompromiso
      );
    }
    if (focoDetalleAccionable === "cerrados") {
      return analisis.hallazgos.filter((hallazgo) => hallazgo.estado === "CERRADO");
    }
    return analisis.hallazgos;
  }, [analisis.hallazgos, focoDetalleAccionable]);

  const opcionesDetalleAccionable = useMemo(
    () => ({
      empresasResponsables: valorUnico(
        detalleAccionableBase.map(
          (hallazgo) => hallazgo.empresaResponsable || "Sin empresa responsable"
        )
      ),
      empresasReportantes: valorUnico(
        detalleAccionableBase.map(
          (hallazgo) => hallazgo.empresaReportante || hallazgo.empresa
        )
      ),
      obras: valorUnico(detalleAccionableBase.map((hallazgo) => hallazgo.obra)),
      responsables: valorUnico(
        detalleAccionableBase.map(
          (hallazgo) => hallazgo.responsableCierre || "Sin responsable"
        )
      ),
      criticidades: valorUnico(
        detalleAccionableBase.map((hallazgo) => hallazgo.criticidad)
      ) as CriticidadKpiGerencial[],
      estados: valorUnico(
        detalleAccionableBase.map((hallazgo) => hallazgo.estado)
      ) as EstadoKpiGerencial[],
    }),
    [detalleAccionableBase]
  );

  const detalleAccionableConFiltrosInternos = useMemo(
    () =>
      detalleAccionableBase.filter((hallazgo) => {
        if (
          filtrosDetalleAccionable.empresaResponsable &&
          (hallazgo.empresaResponsable || "Sin empresa responsable") !==
            filtrosDetalleAccionable.empresaResponsable
        ) {
          return false;
        }
        if (
          filtrosDetalleAccionable.empresaReportante &&
          (hallazgo.empresaReportante || hallazgo.empresa) !==
            filtrosDetalleAccionable.empresaReportante
        ) {
          return false;
        }
        if (
          filtrosDetalleAccionable.obra &&
          hallazgo.obra !== filtrosDetalleAccionable.obra
        ) {
          return false;
        }
        if (
          filtrosDetalleAccionable.responsableCierre &&
          (hallazgo.responsableCierre || "Sin responsable") !==
            filtrosDetalleAccionable.responsableCierre
        ) {
          return false;
        }
        if (
          filtrosDetalleAccionable.criticidad &&
          hallazgo.criticidad !== filtrosDetalleAccionable.criticidad
        ) {
          return false;
        }
        if (
          filtrosDetalleAccionable.estado &&
          hallazgo.estado !== filtrosDetalleAccionable.estado
        ) {
          return false;
        }
        if (
          filtrosDetalleAccionable.vencimiento === "vencidos" &&
          !esHallazgoVencidoDetalle(hallazgo)
        ) {
          return false;
        }
        if (
          filtrosDetalleAccionable.vencimiento === "no-vencidos" &&
          esHallazgoVencidoDetalle(hallazgo)
        ) {
          return false;
        }
        if (
          filtrosDetalleAccionable.vencimiento === "sin-fecha" &&
          !(
            esHallazgoAbiertoGerencial(hallazgo) &&
            !hallazgo.fechaCompromiso
          )
        ) {
          return false;
        }
        return true;
      }),
    [detalleAccionableBase, filtrosDetalleAccionable]
  );

  const detalleAccionableFiltrado = useMemo(() => {
    const busqueda = normalizarTexto(busquedaDetalleAccionable.trim());
    if (!busqueda) return detalleAccionableConFiltrosInternos;

    return detalleAccionableConFiltrosInternos.filter((hallazgo) =>
      normalizarTexto(
        [
          hallazgo.codigo,
          hallazgo.empresaResponsable || "Sin empresa responsable",
          hallazgo.empresaReportante || hallazgo.empresa,
          hallazgo.obra,
          hallazgo.area,
          hallazgo.tipoHallazgo,
          hallazgo.responsableCierre || "Sin responsable",
          hallazgo.criticidad,
          hallazgo.estado,
          hallazgo.estadoCierre || "",
        ].join(" ")
      ).includes(busqueda)
    );
  }, [busquedaDetalleAccionable, detalleAccionableConFiltrosInternos]);

  const totalDetalleAccionable = detalleAccionableFiltrado.length;
  const totalPaginasDetalleAccionable = Math.max(
    1,
    Math.ceil(totalDetalleAccionable / limiteDetalleAccionable)
  );
  const paginaDetalleVisible = Math.min(
    paginaDetalleAccionable,
    totalPaginasDetalleAccionable
  );
  const inicioDetalleAccionable =
    totalDetalleAccionable === 0
      ? 0
      : (paginaDetalleVisible - 1) * limiteDetalleAccionable + 1;
  const finDetalleAccionable = Math.min(
    paginaDetalleVisible * limiteDetalleAccionable,
    totalDetalleAccionable
  );
  const hallazgosDetalleAccionablePagina = useMemo(
    () =>
      detalleAccionableFiltrado.slice(
        (paginaDetalleVisible - 1) * limiteDetalleAccionable,
        paginaDetalleVisible * limiteDetalleAccionable
      ),
    [detalleAccionableFiltrado, limiteDetalleAccionable, paginaDetalleVisible]
  );
  const etiquetaFocoDetalleAccionable =
    focoDetalleAccionable === "abiertos"
      ? "Abiertos"
      : focoDetalleAccionable === "criticos-abiertos"
        ? "Criticos abiertos"
        : focoDetalleAccionable === "vencidos-abiertos"
          ? "Vencidos abiertos"
          : focoDetalleAccionable === "sin-fecha-compromiso"
            ? "Sin fecha compromiso"
            : focoDetalleAccionable === "cerrados"
              ? "Cerrados"
              : "Todos";

  const filtrosInternosActivosResumen = useMemo(
    () =>
      [
        filtrosDetalleAccionable.empresaResponsable
          ? `Empresa responsable: ${filtrosDetalleAccionable.empresaResponsable}`
          : null,
        filtrosDetalleAccionable.empresaReportante
          ? `Empresa reportante: ${filtrosDetalleAccionable.empresaReportante}`
          : null,
        filtrosDetalleAccionable.obra
          ? `Obra: ${filtrosDetalleAccionable.obra}`
          : null,
        filtrosDetalleAccionable.responsableCierre
          ? `Responsable cierre: ${filtrosDetalleAccionable.responsableCierre}`
          : null,
        filtrosDetalleAccionable.criticidad
          ? `Criticidad: ${traducirCriticidad(filtrosDetalleAccionable.criticidad)}`
          : null,
        filtrosDetalleAccionable.estado
          ? `Estado operativo: ${traducirEstado(filtrosDetalleAccionable.estado)}`
          : null,
        filtrosDetalleAccionable.vencimiento !== "todos"
          ? `Vencimiento: ${
              filtrosDetalleAccionable.vencimiento === "vencidos"
                ? "Vencidos"
                : filtrosDetalleAccionable.vencimiento === "no-vencidos"
                  ? "No vencidos"
                  : "Sin fecha compromiso"
            }`
          : null,
      ].filter(Boolean) as string[],
    [filtrosDetalleAccionable, idiomaActivo]
  );

  useEffect(() => {
    setPaginaDetalleAccionable(1);
    setHallazgoDetalleAbierto("");
  }, [
    busquedaDetalleAccionable,
    filtrosDetalleAccionable,
    focoDetalleAccionable,
    limiteDetalleAccionable,
  ]);

  useEffect(() => {
    if (paginaDetalleAccionable > totalPaginasDetalleAccionable) {
      setPaginaDetalleAccionable(totalPaginasDetalleAccionable);
    }
  }, [paginaDetalleAccionable, totalPaginasDetalleAccionable]);

  const limpiarFiltrosDetalleAccionable = () => {
    setFiltrosDetalleAccionable(filtrosDetalleAccionableIniciales);
    setBusquedaDetalleAccionable("");
    setPaginaDetalleAccionable(1);
    setHallazgoDetalleAbierto("");
  };

  async function copiarResumenDetalle(texto: string, mensajeOk: string) {
    activarBoton("copiar-detalle-accionable");
    try {
      await navigator.clipboard.writeText(texto);
      setMensaje(mensajeOk);
    } catch {
      setMensaje("No se pudo copiar automaticamente. El resumen sigue disponible en pantalla.");
    }
  }

  function resumenHallazgoDetalle(hallazgo: HallazgoKpiGerencial) {
    const vencimiento = esHallazgoVencidoDetalle(hallazgo)
      ? `${diasVencidoDetalle(hallazgo)} dia(s) vencido`
      : hallazgo.fechaCompromiso
        ? "En plazo o cerrado"
        : "Sin fecha compromiso";

    return [
      `Codigo: ${hallazgo.codigo}`,
      `Empresa responsable: ${hallazgo.empresaResponsable || "Sin empresa responsable"}`,
      `Empresa reportante: ${hallazgo.empresaReportante || hallazgo.empresa}`,
      `Obra/area: ${hallazgo.obra} / ${hallazgo.area}`,
      `Tipo: ${hallazgo.tipoHallazgo}`,
      `Criticidad: ${hallazgo.criticidad}`,
      `Estado: ${hallazgo.estado}`,
      `Fecha compromiso: ${fechaCortaDetalle(hallazgo.fechaCompromiso)}`,
      `Vencimiento: ${vencimiento}`,
      `Responsable cierre: ${hallazgo.responsableCierre || "Sin responsable"}`,
    ].join("\n");
  }

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

  const gruposKpi: GrupoKpiGerencial[] = [
    {
      titulo: "Estado general operativo",
      subtitulo: "Volumen base y estado operativo de los registros filtrados.",
      foco: "Operacion",
      tarjetas: [
        {
          titulo: "Total reportado",
          valor: analisis.total,
          color: "#38bdf8",
          detalle: "Registros cargados en el analisis",
        },
        {
          titulo: "Abiertos reales",
          valor: metricasGerenciales.abiertosReales,
          color: "#fb7185",
          detalle: "No cerrados ni anulados",
        },
        {
          titulo: "Cerrados",
          valor: analisis.cerrados,
          color: "#22c55e",
          detalle: "Estado operativo cerrado",
        },
      ],
    },
    {
      titulo: "Riesgo urgente",
      subtitulo: "Prioridades que requieren atencion gerencial inmediata.",
      foco: "Riesgo",
      tarjetas: [
        {
          titulo: "Criticos abiertos",
          valor: metricasGerenciales.criticosAbiertos,
          color: "#ef4444",
          detalle: "Criticidad maxima aun abierta",
        },
        {
          titulo: "Vencidos abiertos",
          valor: metricasGerenciales.vencidosAbiertos,
          color: "#f97316",
          detalle: "Fuera de plazo y no cerrados",
        },
        {
          titulo: "Sin fecha compromiso",
          valor: metricasGerenciales.sinFechaCompromiso,
          color: "#facc15",
          detalle: "Abiertos sin trazabilidad de plazo",
        },
      ],
    },
    {
      titulo: "Gestion de cierre",
      subtitulo: "Lectura de avance con las trazas disponibles hoy.",
      foco: "Cierre",
      tarjetas: [
        {
          titulo: "Tasa cierre",
          valor: analisis.tasaCierre,
          color: "#a78bfa",
          detalle: "Cerrados sobre total filtrado",
          sufijo: "%",
        },
        {
          titulo: "Prom. cierre",
          valor: analisis.tiempoPromedioCierre,
          color: "#facc15",
          detalle: "Dias promedio con fecha cierre",
          sufijo: " d",
        },
        {
          titulo: "Pendiente evidencia",
          valor: "No disponible",
          color: "#94a3b8",
          detalle: "Requiere trazabilidad de evidencia de cierre",
          disponible: false,
        },
      ],
    },
    {
      titulo: "Comparacion gerencial",
      subtitulo: "Dimensiones para preparar comites y reuniones por contrato.",
      foco: "Comparacion",
      tarjetas: [
        {
          titulo: "Empresas reportantes",
          valor: analisis.empresasActivas,
          color: "#60a5fa",
          detalle: "Quienes reportan o registran",
        },
        {
          titulo: "Obras",
          valor: analisis.obrasActivas,
          color: "#2dd4bf",
          detalle: "Proyectos activos filtrados",
        },
        {
          titulo: "Reincidencias",
          valor: analisis.reincidenciasDetectadas,
          color: "#f43f5e",
          detalle: "Patrones repetidos detectados",
        },
      ],
    },
  ];

  const rankingPrincipal = (() => {
    if (modoAnalisis === "ranking-areas") return analisis.porArea;
    if (modoAnalisis === "ranking-obras") return analisis.porObra;
    if (modoAnalisis === "ranking-tipos") return analisis.porTipo;
    if (modoAnalisis === "ranking-responsables") return analisis.porResponsable;
    if (modoAnalisis === "ranking-empresas-responsables") {
      return analisis.porEmpresaResponsable;
    }
    if (modoAnalisis === "cierres") return analisis.porResponsable;
    if (modoAnalisis === "reincidencias") return analisis.porTipo;
    return analisis.porEmpresaReportante;
  })();
  const rankingTitulo =
    modoAnalisis === "ranking-obras"
      ? "Ranking de obras"
      : modoAnalisis === "ranking-areas"
        ? "Ranking de areas"
        : modoAnalisis === "ranking-tipos" || modoAnalisis === "reincidencias"
          ? "Ranking de tipos"
          : modoAnalisis === "ranking-responsables" || modoAnalisis === "cierres"
            ? "Responsables de cierre"
            : modoAnalisis === "ranking-empresas-responsables"
              ? "Ranking por empresa responsable"
              : "Ranking por empresa reportante";
  const rankingSubtitulo =
    modoAnalisis === "vencidos"
      ? "Enfoque visual sobre carga y vencidos por empresa. El listado exacto queda para KPI-D."
      : modoAnalisis === "criticidad"
        ? "Lectura de concentracion con criticidad visible en las barras y panel lateral."
        : modoAnalisis === "cierres"
          ? "Comparacion por responsable disponible en los registros cargados."
          : modoAnalisis === "reincidencias"
            ? "Tipos repetidos que ayudan a orientar prevencion."
            : "Comparacion segun los filtros activos y los registros cargados.";
  const maxRanking = maximoRanking(rankingPrincipal);
  const maxTendencia = Math.max(1, ...analisis.tendenciaTemporal.map((item) => item.total));
  const rankingsSecundarios = [
    {
      titulo: "Empresa reportante",
      subtitulo: "Carga total segun quien reporta o registra.",
      data: analisis.porEmpresaReportante,
    },
    {
      titulo: "Empresa responsable",
      subtitulo: "Carga atribuida al responsable/involucrado disponible.",
      data: analisis.porEmpresaResponsable,
    },
    {
      titulo: "Obras",
      subtitulo: "Concentracion por proyecto u obra.",
      data: analisis.porObra,
    },
    {
      titulo: "Areas",
      subtitulo: "Zonas operativas con mayor repeticion.",
      data: analisis.porArea,
    },
    {
      titulo: "Tipos",
      subtitulo: "Familias de hallazgo mas frecuentes.",
      data: analisis.porTipo,
    },
    {
      titulo: "Responsable cierre",
      subtitulo: "Personas responsables segun trazabilidad disponible.",
      data: analisis.porResponsable,
    },
  ];

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
                  "resumen-ejecutivo",
                  "Vista resumen ejecutivo activa. Es un borrador visual, no una exportacion final."
                )
              }
              style={botonStyle("resumen-ejecutivo", true)}
            >
              {t("Vista resumen ejecutivo")}
            </button>
          </div>
        </header>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "14px" }}>
          {gruposKpi.map((grupo) => (
            <article
              key={grupo.titulo}
              style={{
                ...themedSurfaceStyle,
                padding: "16px",
                background: fondoTarjeta,
                display: "grid",
                gap: "12px",
                alignContent: "start",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "start" }}>
                <div>
                  <div style={{ fontSize: "11px", color: textoAzul, fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.7px" }}>
                    {grupo.foco}
                  </div>
                  <h2 style={{ margin: "5px 0 0", fontSize: "17px", lineHeight: 1.15, fontWeight: 950, color: textoPrincipal }}>
                    {grupo.titulo}
                  </h2>
                </div>
              </div>
              <p style={{ margin: 0, color: textoSuave, fontSize: "12px", lineHeight: 1.45, fontWeight: 750 }}>
                {grupo.subtitulo}
              </p>
              <div style={{ display: "grid", gap: "9px" }}>
                {grupo.tarjetas.map((tarjeta) => {
                  const disponible = tarjeta.disponible !== false;
                  return (
                    <div
                      key={tarjeta.titulo}
                      style={{
                        borderRadius: "18px",
                        background: fondoInterno,
                        border: bordeInterno,
                        padding: "12px",
                        minHeight: "92px",
                        opacity: disponible ? 1 : 0.82,
                      }}
                    >
                      <div style={{ fontSize: "10px", color: textoMedio, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        {tarjeta.titulo}
                      </div>
                      <div
                        style={{
                          marginTop: "8px",
                          fontSize: typeof tarjeta.valor === "number" ? "30px" : "18px",
                          lineHeight: 1,
                          fontWeight: 950,
                          color: tarjeta.color,
                          textShadow: disponible ? `0 0 18px ${tarjeta.color}55` : "none",
                        }}
                      >
                        {formatoValorTarjeta(tarjeta.valor, tarjeta.sufijo || "")}
                      </div>
                      <div style={{ marginTop: "8px", color: textoSuave, fontSize: "11px", lineHeight: 1.35, fontWeight: 750 }}>
                        {tarjeta.detalle}
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
        </section>

        <section
          style={{
            ...themedSurfaceStyle,
            padding: "14px 16px",
            display: "flex",
            justifyContent: "space-between",
            gap: "14px",
            alignItems: "center",
            flexWrap: "wrap",
            background: temaClaro ? "rgba(255,255,255,0.72)" : "rgba(15,23,42,0.58)",
          }}
        >
          <div>
            <div style={{ fontSize: "11px", color: textoAzul, fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.7px" }}>
              Nota de trazabilidad
            </div>
            <div style={{ marginTop: "4px", color: textoSuave, fontSize: "12px", lineHeight: 1.45, fontWeight: 750 }}>
              Esta vista analiza los registros cargados en el panel. Agregaciones server-side, paginacion masiva y exportaciones reales quedan para fases posteriores.
            </div>
          </div>
          <div style={{ color: metricasGerenciales.analisisLimitadoPorCarga ? "#facc15" : textoAzul, fontSize: "12px", fontWeight: 950, whiteSpace: "nowrap" }}>
            {metricasGerenciales.analisisLimitadoPorCarga ? "Carga al limite actual" : "Alcance visible"}
          </div>
        </section>

        <section
          style={{
            ...themedSurfaceStyle,
            padding: "14px 16px",
            background: temaClaro ? "rgba(255,255,255,0.78)" : "rgba(15,23,42,0.64)",
          }}
        >
          <div style={{ fontSize: "11px", color: textoAzul, fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.7px" }}>
            Filtros maestros activos
          </div>
          {filtrosActivosResumen.length > 0 ? (
            <div style={{ marginTop: "10px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {filtrosActivosResumen.map((filtro) => (
                <span
                  key={filtro}
                  style={{
                    borderRadius: "999px",
                    padding: "7px 10px",
                    background: fondoInterno,
                    border: bordeInterno,
                    color: textoMedio,
                    fontSize: "11px",
                    fontWeight: 850,
                  }}
                >
                  {filtro}
                </span>
              ))}
            </div>
          ) : (
            <div style={{ marginTop: "6px", color: textoSuave, fontSize: "12px", lineHeight: 1.45, fontWeight: 750 }}>
              Vista general sin filtros maestros activos.
            </div>
          )}
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
          <aside className="ce-panel-kpi-filters" style={{ ...themedSurfaceStyle, padding: "18px", display: "grid", gap: "15px" }}>
            <div
              style={{
                borderRadius: "18px",
                padding: "14px",
                background: temaClaro ? "rgba(239,246,255,0.92)" : "rgba(30,41,59,0.78)",
                border: temaClaro
                  ? "1px solid rgba(59,130,246,0.20)"
                  : "1px solid rgba(148,163,184,0.18)",
                boxShadow: temaClaro
                  ? "0 10px 22px rgba(15,23,42,0.06)"
                  : "inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
            >
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 950, color: textoPrincipal }}>{t("Filtros avanzados")}</h2>
              <p style={{ margin: "6px 0 0", color: textoMedio, fontSize: "12px", lineHeight: 1.45, fontWeight: 750 }}>
                {t("Cruza empresa, obra, area, periodo, criticidad, responsable y evidencia.")}
              </p>
            </div>

            <div style={filtroBloqueStyle}>
              <div style={filtroTituloStyle}><span style={filtroChipStyle}>A</span> Alcance operacional</div>
              {[
                ["Empresa reportante", "empresaReportante", opciones.empresasReportantes],
                ["Obra / proyecto", "obra", opciones.obras],
                ["Area", "area", opciones.areas],
                ["Tipo de hallazgo", "tipoHallazgo", opciones.tipos],
              ].map(([label, key, values]) => (
                <label key={String(key)} style={{ display: "grid", gap: "6px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 900, color: textoAzul }}>{label as string}</span>
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
            </div>

            <div style={filtroBloqueStyle}>
              <div style={filtroTituloStyle}><span style={filtroChipStyle}>B</span> Responsabilidad y cierre</div>
              {[
                ["Empresa responsable / involucrada", "empresaResponsable", opciones.empresasResponsables],
                ["Responsable de cierre", "responsableCierre", opciones.responsables],
                ["Cargo del responsable", "responsableCargo", opciones.cargosResponsables],
                ["Estado de cierre", "estadoCierre", opciones.estadosCierre],
              ].map(([label, key, values]) => (
                <label key={String(key)} style={{ display: "grid", gap: "6px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 900, color: textoAzul }}>{label as string}</span>
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
            </div>

            <div style={filtroBloqueStyle}>
              <div style={filtroTituloStyle}><span style={filtroChipStyle}>C</span> Riesgo y prioridad</div>
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
                  <span style={{ fontSize: "12px", fontWeight: 900, color: textoAzul }}>Estado operativo</span>
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
              <label style={{ display: "grid", gap: "6px" }}>
                <span style={{ fontSize: "12px", fontWeight: 900, color: textoAzul }}>{t("Vencimiento")}</span>
                <select
                  value={filtros.vencimiento}
                  onChange={(event) =>
                    setFiltros((actual) => ({
                      ...actual,
                      vencimiento: event.target.value as FiltrosVista["vencimiento"],
                    }))
                  }
                  style={themedInputStyle}
                >
                  {[
                    ["todos", "Todos"],
                    ["vencidos", "Solo vencidos"],
                    ["no-vencidos", "No vencidos"],
                  ].map(([valor, etiqueta]) => (
                    <option key={valor} value={valor}>
                      {t(etiqueta)}
                    </option>
                  ))}
                </select>
              </label>
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
            </div>

            <div style={filtroBloqueStyle}>
              <div style={filtroTituloStyle}><span style={filtroChipStyle}>D</span> Fecha y trazabilidad</div>
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
                ["Evidencia del reporte", "evidencia", [["todos", "Con y sin evidencia"], ["con-evidencia", "Con evidencia"], ["sin-evidencia", "Sin evidencia"]]],
              ].map(([label, key, values]) => (
                <label key={String(key)} style={{ display: "grid", gap: "6px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 900, color: textoAzul }}>{label as string}</span>
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
              <div style={{ borderRadius: "14px", padding: "10px 12px", background: fondoInternoFuerte, border: bordeInterno, color: textoSuave, fontSize: "11px", lineHeight: 1.4, fontWeight: 750 }}>
                Evidencia de cierre: disponible como dato informativo cuando existe, pero no se usa como filtro maestro en KPI-C.
              </div>
            </div>

            <div
              style={{
                borderRadius: "16px",
                padding: "12px",
                background: temaClaro ? "rgba(239,246,255,0.78)" : "rgba(14,165,233,0.08)",
                border: temaClaro
                  ? "1px solid rgba(37,99,235,0.18)"
                  : "1px solid rgba(56,189,248,0.16)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", color: textoAzul, fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.6px" }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "999px", background: "#22c55e", boxShadow: "0 0 12px rgba(34,197,94,0.42)" }} />
                Filtros reactivos
              </div>
              <div style={{ marginTop: "5px", color: textoSuave, fontSize: "12px", lineHeight: 1.4, fontWeight: 750 }}>
                Los indicadores se recalculan automaticamente al cambiar una condicion.
              </div>
            </div>
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
                    ["ranking-empresas", "Ranking reportantes", "Ranking por empresa reportante activo."],
                    ["ranking-empresas-responsables", "Ranking responsables", "Ranking por empresa responsable/involucrada activo."],
                    ["ranking-obras", "Comparar obras", "Comparacion por obras activa."],
                    ["ranking-areas", "Ranking areas", "Ranking de areas activo."],
                    ["criticidad", "Enfocar criticidad", "Enfoque visual en criticidad activo. No abre listado individual todavia."],
                    ["cierres", "Enfocar cierres", "Enfoque visual en gestion de cierre activo. Drill-down queda para KPI-D."],
                    ["vencidos", "Enfocar vencidos", "Enfoque visual en vencidos activo. Listado exacto queda para KPI-D."],
                    ["reincidencias", "Enfocar reincidencias", "Enfoque visual en reincidencias activo. Detalle accionable queda para KPI-D."],
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
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px", gap: "12px" }}>
                      <div>
                        <div style={{ fontSize: "15px", fontWeight: 950 }}>{rankingTitulo}</div>
                        <div style={{ marginTop: "4px", fontSize: "12px", color: textoSuave, lineHeight: 1.35, fontWeight: 750 }}>
                          {rankingSubtitulo}
                        </div>
                      </div>
                      <div style={{ fontSize: "12px", color: textoAzul, fontWeight: 900, whiteSpace: "nowrap" }}>{modoAnalisis.replace("-", " ")}</div>
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
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "start", marginBottom: "14px" }}>
                  <div>
                    <div style={{ fontSize: "16px", fontWeight: 950 }}>{t("Tendencia temporal")}</div>
                    <div style={{ marginTop: "5px", color: textoSuave, fontSize: "12px", lineHeight: 1.4, fontWeight: 750 }}>
                      Volumen mensual de hallazgos filtrados. El acento ambar indica periodos con criticidad critica.
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "flex-end", color: textoSuave, fontSize: "11px", fontWeight: 850 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                      <span style={{ width: "10px", height: "10px", borderRadius: "3px", background: "linear-gradient(180deg,#38bdf8,#2563eb)" }} />
                      Total
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                      <span style={{ width: "10px", height: "10px", borderRadius: "999px", background: "#f59e0b" }} />
                      Con criticos
                    </span>
                  </div>
                </div>
                <div style={{ height: "210px", display: "flex", alignItems: "end", gap: "10px", paddingTop: "16px" }}>
                  {analisis.tendenciaTemporal.slice(-10).map((item) => (
                    <div key={item.periodo} style={{ flex: 1, display: "grid", alignItems: "end", gap: "8px", minWidth: 0 }}>
                      <div style={{ display: "grid", alignItems: "end", justifyItems: "center", gap: "6px" }}>
                        {item.criticos > 0 && (
                          <span style={{ width: "8px", height: "8px", borderRadius: "999px", background: "#f59e0b", boxShadow: "0 0 12px rgba(245,158,11,0.42)" }} />
                        )}
                        <div
                          style={{
                            width: "100%",
                            height: `${Math.max(8, (item.total / maxTendencia) * 150)}px`,
                            borderRadius: "14px 14px 6px 6px",
                            background: item.criticos > 0
                              ? "linear-gradient(180deg,#f59e0b 0%, #38bdf8 44%, #2563eb 100%)"
                              : "linear-gradient(180deg,#38bdf8,#2563eb)",
                            boxShadow: item.criticos > 0
                              ? "0 10px 22px rgba(245,158,11,0.16)"
                              : "0 10px 22px rgba(14,165,233,0.18)",
                            border: item.criticos > 0
                              ? "1px solid rgba(245,158,11,0.28)"
                              : "1px solid rgba(125,211,252,0.18)",
                          }}
                        />
                      </div>
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

          <aside className="ce-panel-kpi-report" style={{ ...themedSurfaceStyle, padding: "18px", display: "grid", gap: "14px", borderLeft: temaClaro ? "1px solid rgba(37,99,235,0.24)" : "1px solid rgba(125,211,252,0.18)" }}>
            <div style={{ borderRadius: "18px", padding: "13px 14px", background: temaClaro ? "rgba(239,246,255,0.82)" : "linear-gradient(145deg, rgba(15,23,42,0.82), rgba(30,41,59,0.54))", border: temaClaro ? "1px solid rgba(37,99,235,0.20)" : "1px solid rgba(125,211,252,0.18)", borderLeft: temaClaro ? "3px solid rgba(37,99,235,0.72)" : "3px solid rgba(56,189,248,0.72)" }}>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 950, display: "flex", alignItems: "center", gap: "8px", color: textoPrincipal }}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "22px", height: "22px", borderRadius: "999px", background: temaClaro ? "rgba(37,99,235,0.12)" : "rgba(56,189,248,0.14)", border: temaClaro ? "1px solid rgba(37,99,235,0.22)" : "1px solid rgba(125,211,252,0.28)", color: textoAzul, fontSize: "11px", fontWeight: 950 }}>R</span>
                {t("Resumen ejecutivo visual")}
              </h2>
              <p style={{ margin: "6px 0 0", color: textoSuave, fontSize: "12px", lineHeight: 1.45, fontWeight: 700 }}>
                {t("Borrador gerencial segun filtros activos. Exportacion real pendiente.")}
              </p>
            </div>

            <div style={{ borderRadius: "22px", padding: "16px", background: temaClaro ? "rgba(219,234,254,0.62)" : "linear-gradient(145deg, rgba(37,99,235,0.22), rgba(15,23,42,0.82))", border: "1px solid rgba(96,165,250,0.30)", borderLeft: "3px solid rgba(96,165,250,0.76)", boxShadow: temaClaro ? "0 12px 26px rgba(15,23,42,0.06)" : "0 16px 34px rgba(2,6,23,0.22)" }}>
              <div style={{ fontSize: "12px", color: textoAzul, fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.55px" }}>{t("Resumen")}</div>
              <p style={{ margin: "8px 0 0", color: textoPrincipal, lineHeight: 1.5, fontSize: "14px", fontWeight: 750 }}>
                {resumenEjecutivoTraducido()}
              </p>
            </div>

            <div style={{ display: "grid", gap: "8px", borderRadius: "18px", padding: "12px", background: temaClaro ? "rgba(248,250,252,0.82)" : "rgba(15,23,42,0.42)", border: temaClaro ? "1px solid rgba(100,116,139,0.16)" : "1px solid rgba(148,163,184,0.14)" }}>
              <div style={{ fontSize: "12px", color: textoAzul, fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.55px", display: "flex", alignItems: "center", gap: "7px" }}>
                <span style={{ width: "7px", height: "18px", borderRadius: "999px", background: "linear-gradient(180deg, rgba(56,189,248,0.92), rgba(99,102,241,0.72))" }} />
                Foco gerencial
              </div>
              {[
                ["Empresa reportante", filtros.empresaReportante || analisis.porEmpresaReportante[0]?.nombre || "Sin datos"],
                ["Empresa responsable", filtros.empresaResponsable || analisis.porEmpresaResponsable[0]?.nombre || "Sin datos"],
                ["Obra", analisis.porObra[0]?.nombre || "Sin datos"],
                ["Area", analisis.porArea[0]?.nombre || "Sin datos"],
              ].map(([label, valor]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: "10px", borderRadius: "14px", padding: "10px 12px", background: fondoInterno, border: temaClaro ? "1px solid rgba(37,99,235,0.14)" : "1px solid rgba(125,211,252,0.16)", borderLeft: temaClaro ? "3px solid rgba(37,99,235,0.42)" : "3px solid rgba(56,189,248,0.42)", color: textoMedio, fontSize: "12px", fontWeight: 800, boxShadow: temaClaro ? "0 8px 18px rgba(15,23,42,0.04)" : "inset 0 1px 0 rgba(255,255,255,0.03)" }}>
                  <span style={{ color: textoAzul, fontWeight: 950 }}>{label}</span>
                  <strong style={{ color: textoPrincipal, textAlign: "right" }}>{valor}</strong>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gap: "10px", borderRadius: "18px", padding: "12px", background: temaClaro ? "rgba(248,250,252,0.78)" : "rgba(15,23,42,0.38)", border: temaClaro ? "1px solid rgba(100,116,139,0.14)" : "1px solid rgba(148,163,184,0.12)" }}>
              <div style={{ fontSize: "12px", color: textoAzul, fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.55px", display: "flex", alignItems: "center", gap: "7px" }}>
                <span style={{ width: "7px", height: "18px", borderRadius: "999px", background: "linear-gradient(180deg, rgba(168,85,247,0.82), rgba(56,189,248,0.72))" }} />
                {t("Riesgos principales")}
              </div>
              {riesgosTraducidos().map((riesgo) => (
                <div key={riesgo} style={{ borderRadius: "16px", padding: "12px", background: fondoInterno, border: temaClaro ? "1px solid rgba(100,116,139,0.16)" : "1px solid rgba(148,163,184,0.14)", color: textoMedio, fontSize: "13px", lineHeight: 1.4, fontWeight: 750 }}>
                  {riesgo}
                </div>
              ))}
            </div>

            <div style={{ borderRadius: "22px", padding: "16px", background: temaClaro ? "rgba(254,226,226,0.72)" : "linear-gradient(145deg, rgba(239,68,68,0.18), rgba(15,23,42,0.82))", border: "1px solid rgba(239,68,68,0.28)", borderLeft: "3px solid rgba(248,113,113,0.78)", boxShadow: temaClaro ? "0 12px 26px rgba(127,29,29,0.06)" : "0 16px 34px rgba(2,6,23,0.20)" }}>
              <div style={{ fontSize: "12px", color: temaClaro ? "#991b1b" : "#fecaca", fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.55px" }}>{t("Recomendacion preventiva")}</div>
              <p style={{ margin: "8px 0 0", color: textoPrincipal, lineHeight: 1.5, fontSize: "14px", fontWeight: 800 }}>
                {recomendacionTraducida()}
              </p>
            </div>

            <div style={{ display: "grid", gap: "9px", borderRadius: "18px", padding: "12px", background: temaClaro ? "rgba(248,250,252,0.72)" : "rgba(15,23,42,0.34)", border: temaClaro ? "1px solid rgba(100,116,139,0.14)" : "1px solid rgba(148,163,184,0.12)" }}>
              <button
                type="button"
                disabled
                title="Exportacion real pendiente de implementacion."
                style={{ ...botonStyle("pdf"), opacity: 0.58, cursor: "not-allowed", color: textoSuave }}
              >
                {t("PDF proximamente")}
              </button>
              <button
                type="button"
                disabled
                title="Exportacion real pendiente de implementacion."
                style={{ ...botonStyle("excel"), opacity: 0.58, cursor: "not-allowed", color: textoSuave }}
              >
                {t("Excel proximamente")}
              </button>
              <div style={{ color: textoSuave, fontSize: "11px", lineHeight: 1.4, fontWeight: 750 }}>
                Exportacion real pendiente de implementacion.
              </div>
            </div>

            <div style={{ display: "grid", gap: "10px", borderRadius: "20px", padding: "13px", background: temaClaro ? "linear-gradient(145deg, rgba(239,246,255,0.88), rgba(255,255,255,0.82))" : "linear-gradient(145deg, rgba(15,23,42,0.78), rgba(30,41,59,0.42))", border: temaClaro ? "1px solid rgba(37,99,235,0.18)" : "1px solid rgba(125,211,252,0.16)", boxShadow: temaClaro ? "0 12px 26px rgba(15,23,42,0.05)" : "0 16px 34px rgba(2,6,23,0.20)" }}>
              <div style={{ fontSize: "12px", color: textoPrincipal, fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.65px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "22px", height: "22px", borderRadius: "999px", background: temaClaro ? "rgba(37,99,235,0.12)" : "rgba(56,189,248,0.14)", border: temaClaro ? "1px solid rgba(37,99,235,0.22)" : "1px solid rgba(125,211,252,0.28)", color: textoAzul, fontSize: "11px", fontWeight: 950 }}>G</span>
                {t("Rankings gerenciales")}
              </div>
              {rankingsSecundarios.map((ranking) => (
                <div key={ranking.titulo} style={{ borderRadius: "18px", padding: "12px", background: temaClaro ? "rgba(255,255,255,0.88)" : "rgba(15,23,42,0.64)", border: temaClaro ? "1px solid rgba(37,99,235,0.16)" : "1px solid rgba(125,211,252,0.16)", borderLeft: temaClaro ? "3px solid rgba(37,99,235,0.54)" : "3px solid rgba(56,189,248,0.50)", display: "grid", gap: "9px", boxShadow: temaClaro ? "0 9px 20px rgba(15,23,42,0.05)" : "inset 0 1px 0 rgba(255,255,255,0.035)" }}>
                  <div>
                    <div style={{ fontSize: "12px", color: textoPrincipal, fontWeight: 950, display: "flex", alignItems: "center", gap: "7px" }}>
                      <span style={{ width: "6px", height: "16px", borderRadius: "999px", background: "linear-gradient(180deg, rgba(56,189,248,0.92), rgba(99,102,241,0.70))" }} />
                      {ranking.titulo}
                    </div>
                    <div style={{ marginTop: "3px", fontSize: "11px", color: textoSuave, lineHeight: 1.35, fontWeight: 750 }}>{ranking.subtitulo}</div>
                  </div>
                  {ranking.data.slice(0, 3).map((item, index) => (
                    <div key={`${ranking.titulo}-${item.nombre}`} style={{ display: "grid", gridTemplateColumns: "24px minmax(0, 1fr) auto", gap: "8px", alignItems: "center", color: textoMedio, fontSize: "11px", fontWeight: 850, borderRadius: "12px", padding: "7px 8px", background: temaClaro ? "rgba(239,246,255,0.72)" : "rgba(30,41,59,0.42)", border: temaClaro ? "1px solid rgba(37,99,235,0.10)" : "1px solid rgba(125,211,252,0.10)" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "20px", height: "20px", borderRadius: "999px", background: temaClaro ? "rgba(37,99,235,0.10)" : "rgba(56,189,248,0.12)", color: textoAzul, fontWeight: 950 }}>{index + 1}</span>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.nombre}</span>
                      <span style={{ color: textoPrincipal, fontWeight: 950 }}>{item.total}</span>
                    </div>
                  ))}
                  {ranking.data.length === 0 && (
                    <div style={{ color: textoSuave, fontSize: "11px", fontWeight: 750 }}>Sin datos con los filtros actuales.</div>
                  )}
                </div>
              ))}
            </div>
          </aside>
            <section style={{ ...themedSurfaceStyle, padding: "18px", display: "grid", gap: "14px", width: "100%", maxWidth: "none", minWidth: 0, alignSelf: "stretch", justifySelf: "stretch", boxSizing: "border-box", gridColumn: "1 / -1" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "start", flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: "11px", color: textoAzul, fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.7px" }}>
                    Detalle accionable
                  </div>
                  <h2 style={{ margin: "5px 0 0", fontSize: "21px", lineHeight: 1.15, fontWeight: 950 }}>
                    Hallazgos del analisis
                  </h2>
                  <p style={{ margin: "7px 0 0", color: textoMedio, fontSize: "13px", lineHeight: 1.45, fontWeight: 750 }}>
                    {totalDetalleAccionable > 0
                      ? `Mostrando ${inicioDetalleAccionable}-${finDetalleAccionable} de ${totalDetalleAccionable} hallazgo(s) del analisis con los filtros actuales.`
                      : filtrosInternosActivosResumen.length > 0
                        ? "No hay hallazgos asociados a estas opciones rápidas dentro del foco seleccionado."
                        : busquedaDetalleAccionable.trim()
                          ? "No hay coincidencias para esta busqueda dentro del foco seleccionado."
                          : "No hay hallazgos asociados a este foco con los filtros actuales."}
                    {totalDetalleAccionable > 0 && (
                      <span>
                        {" "}
                        {filtrosInternosActivosResumen.length > 0
                          ? `Opciones rápidas: ${filtrosInternosActivosResumen.join(", ")}.`
                          : "Sin opciones rápidas aplicadas."}
                      </span>
                    )}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <div style={{ borderRadius: "999px", padding: "8px 11px", background: fondoInterno, border: bordeInterno, color: textoAzul, fontSize: "12px", fontWeight: 950 }}>
                    Foco: {etiquetaFocoDetalleAccionable}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      void copiarResumenDetalle(
                        `Detalle accionable\nFoco: ${etiquetaFocoDetalleAccionable}\nTotal: ${totalDetalleAccionable}\nMostrando: ${inicioDetalleAccionable}-${finDetalleAccionable}`,
                        "Resumen del detalle accionable copiado al portapapeles."
                      )
                    }
                    style={{ ...botonStyle("copiar-detalle-accionable"), minHeight: "38px", padding: "9px 12px", fontSize: "12px" }}
                  >
                    Copiar resumen
                  </button>
                </div>
              </div>

              <div style={{ borderRadius: "18px", padding: "12px", background: fondoInterno, border: bordeInterno, display: "grid", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>
                    {[
                      ["todos", "Todos"],
                      ["abiertos", "Abiertos"],
                      ["criticos-abiertos", "Criticos abiertos"],
                      ["vencidos-abiertos", "Vencidos abiertos"],
                      ["sin-fecha-compromiso", "Sin fecha compromiso"],
                      ["cerrados", "Cerrados"],
                    ].map(([valor, etiqueta]) => {
                      const activo = focoDetalleAccionable === valor;
                      return (
                        <button
                          key={valor}
                          type="button"
                          onClick={() => setFocoDetalleAccionable(valor as FocoDetalleAccionable)}
                          style={{
                            borderRadius: "999px",
                            border: activo ? "1px solid rgba(96,165,250,0.52)" : bordeInterno,
                            background: activo
                              ? "linear-gradient(135deg, rgba(37,99,235,0.86), rgba(14,165,233,0.62))"
                              : fondoInternoFuerte,
                            color: activo ? "#ffffff" : textoMedio,
                            minHeight: "34px",
                            padding: "7px 10px",
                            fontSize: "11px",
                            fontWeight: 950,
                            cursor: "pointer",
                          }}
                        >
                          {etiqueta}
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                    <label style={{ display: "grid", gap: "5px", minWidth: "230px" }}>
                      <span style={{ color: textoSuave, fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Buscar en detalle
                      </span>
                      <input
                        type="search"
                        value={busquedaDetalleAccionable}
                        onChange={(event) => setBusquedaDetalleAccionable(event.target.value)}
                        placeholder="Codigo, empresa, obra, area..."
                        style={{ ...themedInputStyle, minHeight: "38px" }}
                      />
                    </label>
                    {detalleAccionableBase.length > 20 && (
                      <label style={{ display: "grid", gap: "5px", width: "96px" }}>
                        <span style={{ color: textoSuave, fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          Ver
                        </span>
                        <select
                          value={limiteDetalleAccionable}
                          onChange={(event) => setLimiteDetalleAccionable(Number(event.target.value))}
                          style={{ ...themedInputStyle, minHeight: "38px" }}
                        >
                          {[20, 40, 60].map((limite) => (
                            <option key={limite} value={limite}>
                              {limite}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}
                  </div>
                </div>

                <div style={{ borderRadius: "16px", padding: "12px", background: temaClaro ? "rgba(239,246,255,0.86)" : "linear-gradient(135deg, rgba(15,23,42,0.92), rgba(8,47,73,0.38))", border: temaClaro ? "1px solid rgba(37,99,235,0.22)" : "1px solid rgba(125,211,252,0.28)", borderLeft: "4px solid rgba(56,189,248,0.82)", boxShadow: temaClaro ? "0 10px 24px rgba(15,23,42,0.06)" : "0 16px 34px rgba(2,6,23,0.24)", display: "grid", gap: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                    <div>
                      <div style={{ color: textoAzul, fontSize: "12px", fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.7px" }}>
                        D · Opciones rápidas
                      </div>
                      <div style={{ marginTop: "3px", color: textoSuave, fontSize: "11px", lineHeight: 1.35, fontWeight: 750 }}>
                        Refinan solo este listado, sin cambiar los filtros maestros del KPI.
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
                      <span style={{ color: textoSuave, fontSize: "11px", fontWeight: 800 }}>
                        {filtrosInternosActivosResumen.length > 0
                          ? `${filtrosInternosActivosResumen.length} opción(es) activa(s)`
                          : "Todos los registros del foco"}
                      </span>
                      <button
                        type="button"
                        onClick={limpiarFiltrosDetalleAccionable}
                        disabled={
                          filtrosInternosActivosResumen.length === 0 &&
                          !busquedaDetalleAccionable.trim()
                        }
                        style={{
                          ...botonStyle("limpiar-opciones-rapidas"),
                          minHeight: "34px",
                          padding: "7px 10px",
                          fontSize: "11px",
                          opacity:
                            filtrosInternosActivosResumen.length === 0 &&
                            !busquedaDetalleAccionable.trim()
                              ? 0.52
                              : 1,
                          cursor:
                            filtrosInternosActivosResumen.length === 0 &&
                            !busquedaDetalleAccionable.trim()
                              ? "not-allowed"
                              : "pointer",
                        }}
                      >
                        Limpiar opciones rápidas
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "8px", width: "100%" }}>
                    {[
                      [
                        "Empresa responsable",
                        "empresaResponsable",
                        opcionesDetalleAccionable.empresasResponsables,
                      ],
                      [
                        "Empresa reportante",
                        "empresaReportante",
                        opcionesDetalleAccionable.empresasReportantes,
                      ],
                      ["Obra", "obra", opcionesDetalleAccionable.obras],
                      [
                        "Responsable cierre",
                        "responsableCierre",
                        opcionesDetalleAccionable.responsables,
                      ],
                    ].map(([label, campo, opcionesFiltro]) => (
                      <label key={campo as string} style={{ display: "grid", gap: "5px", minWidth: 0 }}>
                        <span style={{ color: textoSuave, fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {label as string}
                        </span>
                        <select
                          value={
                            filtrosDetalleAccionable[
                              campo as keyof Pick<
                                FiltrosDetalleAccionable,
                                | "empresaResponsable"
                                | "empresaReportante"
                                | "obra"
                                | "responsableCierre"
                              >
                            ]
                          }
                          onChange={(event) =>
                            setFiltrosDetalleAccionable((actual) => ({
                              ...actual,
                              [campo as string]: event.target.value,
                            }))
                          }
                          style={{ ...themedInputStyle, minHeight: "34px", fontSize: "12px" }}
                        >
                          <option value="">Todos</option>
                          {(opcionesFiltro as string[]).map((opcion) => (
                            <option key={`${campo}-${opcion}`} value={opcion}>
                              {opcion}
                            </option>
                          ))}
                        </select>
                      </label>
                    ))}
                    <label style={{ display: "grid", gap: "5px", minWidth: 0 }}>
                      <span style={{ color: textoSuave, fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Criticidad
                      </span>
                      <select
                        value={filtrosDetalleAccionable.criticidad}
                        onChange={(event) =>
                          setFiltrosDetalleAccionable((actual) => ({
                            ...actual,
                            criticidad: event.target.value as "" | CriticidadKpiGerencial,
                          }))
                        }
                        style={{ ...themedInputStyle, minHeight: "34px", fontSize: "12px" }}
                      >
                        <option value="">Todos</option>
                        {opcionesDetalleAccionable.criticidades.map((criticidad) => (
                          <option key={`detalle-criticidad-${criticidad}`} value={criticidad}>
                            {traducirCriticidad(criticidad)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label style={{ display: "grid", gap: "5px", minWidth: 0 }}>
                      <span style={{ color: textoSuave, fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Estado
                      </span>
                      <select
                        value={filtrosDetalleAccionable.estado}
                        onChange={(event) =>
                          setFiltrosDetalleAccionable((actual) => ({
                            ...actual,
                            estado: event.target.value as "" | EstadoKpiGerencial,
                          }))
                        }
                        style={{ ...themedInputStyle, minHeight: "34px", fontSize: "12px" }}
                      >
                        <option value="">Todos</option>
                        {opcionesDetalleAccionable.estados.map((estado) => (
                          <option key={`detalle-estado-${estado}`} value={estado}>
                            {traducirEstado(estado)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label style={{ display: "grid", gap: "5px", minWidth: 0 }}>
                      <span style={{ color: textoSuave, fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Vencimiento
                      </span>
                      <select
                        value={filtrosDetalleAccionable.vencimiento}
                        onChange={(event) =>
                          setFiltrosDetalleAccionable((actual) => ({
                            ...actual,
                            vencimiento: event.target.value as FiltrosDetalleAccionable["vencimiento"],
                          }))
                        }
                        style={{ ...themedInputStyle, minHeight: "34px", fontSize: "12px" }}
                      >
                        <option value="todos">Todos</option>
                        <option value="vencidos">Vencidos abiertos</option>
                        <option value="no-vencidos">No vencidos</option>
                        <option value="sin-fecha">Sin fecha compromiso</option>
                      </select>
                    </label>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>
                  {filtrosActivosResumen.length > 0 ? (
                    filtrosActivosResumen.map((filtro) => (
                      <span key={`detalle-${filtro}`} style={{ borderRadius: "999px", padding: "6px 9px", background: fondoInternoFuerte, border: bordeInterno, color: textoMedio, fontSize: "11px", fontWeight: 850 }}>
                        {filtro}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: textoSuave, fontSize: "12px", fontWeight: 750 }}>
                      Vista general sin filtros maestros activos.
                    </span>
                  )}
                  {busquedaDetalleAccionable.trim() && (
                    <span style={{ borderRadius: "999px", padding: "6px 9px", background: temaClaro ? "rgba(37,99,235,0.10)" : "rgba(56,189,248,0.10)", border: temaClaro ? "1px solid rgba(37,99,235,0.20)" : "1px solid rgba(125,211,252,0.22)", color: textoAzul, fontSize: "11px", fontWeight: 900 }}>
                      Busqueda: {busquedaDetalleAccionable.trim()}
                    </span>
                  )}
                  {filtrosInternosActivosResumen.length > 0 ? (
                    filtrosInternosActivosResumen.map((filtro) => (
                      <span key={`detalle-interno-${filtro}`} style={{ borderRadius: "999px", padding: "6px 9px", background: temaClaro ? "rgba(14,165,233,0.10)" : "rgba(56,189,248,0.10)", border: temaClaro ? "1px solid rgba(14,165,233,0.20)" : "1px solid rgba(125,211,252,0.22)", color: textoAzul, fontSize: "11px", fontWeight: 900 }}>
                        Opción rápida: {filtro}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: textoSuave, fontSize: "12px", fontWeight: 750 }}>
                      Sin opciones rápidas aplicadas.
                    </span>
                  )}
                </div>
              </div>

              {detalleAccionableBase.length === 0 ? (
                <div style={{ borderRadius: "18px", padding: "22px", background: fondoInterno, border: bordeInterno, textAlign: "center", color: textoMedio, fontSize: "14px", fontWeight: 800 }}>
                  No hay hallazgos asociados a este foco con los filtros actuales.
                </div>
              ) : totalDetalleAccionable === 0 ? (
                <div style={{ borderRadius: "18px", padding: "22px", background: fondoInterno, border: bordeInterno, textAlign: "center", color: textoMedio, fontSize: "14px", fontWeight: 800 }}>
                  {filtrosInternosActivosResumen.length > 0
                    ? "No hay hallazgos asociados a estas opciones rápidas dentro del foco seleccionado."
                    : busquedaDetalleAccionable.trim()
                      ? "No hay coincidencias para esta busqueda dentro del foco seleccionado."
                      : "No hay hallazgos asociados a este foco con los filtros actuales."}
                </div>
              ) : (
                <div style={{ display: "grid", gap: "8px", overflowX: "auto", paddingBottom: "2px", width: "100%", maxWidth: "none", minWidth: 0, justifyItems: "stretch" }}>
                  <div style={{ width: "100%", minWidth: "1180px", maxWidth: "none", display: "grid", gridTemplateColumns: "minmax(96px, 0.75fr) minmax(0, 1.55fr) minmax(0, 1.2fr) minmax(96px, 0.65fr) minmax(106px, 0.7fr) minmax(118px, 0.8fr) minmax(0, 1fr) minmax(104px, auto)", gap: "10px", alignItems: "center", padding: "0 10px 2px", color: textoSuave, fontSize: "10px", fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.45px", boxSizing: "border-box" }}>
                    <span>Codigo</span>
                    <span>Responsable / reporta</span>
                    <span>Obra / area</span>
                    <span>Criticidad</span>
                    <span>Estado</span>
                    <span>Plazo</span>
                    <span>Responsable cierre</span>
                    <span>Accion</span>
                  </div>

                  {hallazgosDetalleAccionablePagina.map((hallazgo) => {
                    const vencido = esHallazgoVencidoDetalle(hallazgo);
                    const abierto = esHallazgoAbiertoGerencial(hallazgo);
                    const sinFechaCompromiso = abierto && !hallazgo.fechaCompromiso;
                    const vencimientoTexto = vencido
                      ? `${diasVencidoDetalle(hallazgo)} dia(s) vencido`
                      : sinFechaCompromiso
                        ? "Sin fecha compromiso"
                        : hallazgo.estado === "CERRADO"
                          ? "Cerrado"
                          : "En plazo";
                    const expandido = hallazgoDetalleAbierto === hallazgo.codigo;

                    return (
                      <article key={`${hallazgo.codigo}-${hallazgo.id || ""}`} style={{ width: "100%", minWidth: "1180px", maxWidth: "none", borderRadius: "12px", background: fondoInterno, border: vencido ? "1px solid rgba(249,115,22,0.30)" : bordeInterno, overflow: "hidden", boxSizing: "border-box" }}>
                        <div style={{ width: "100%", display: "grid", gridTemplateColumns: "minmax(96px, 0.75fr) minmax(0, 1.55fr) minmax(0, 1.2fr) minmax(96px, 0.65fr) minmax(106px, 0.7fr) minmax(118px, 0.8fr) minmax(0, 1fr) minmax(104px, auto)", gap: "10px", alignItems: "center", minHeight: "40px", padding: "6px 10px", boxSizing: "border-box" }}>
                          <div style={{ minWidth: 0, display: "flex", alignItems: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            <strong style={{ color: textoPrincipal, fontSize: "12px", fontWeight: 950, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {hallazgo.codigo}
                            </strong>
                          </div>

                          <div style={{ minWidth: 0, display: "flex", alignItems: "center", color: textoMedio, fontSize: "11px", fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            <span style={{ color: textoSuave, flex: "0 0 auto" }}>Resp.</span>
                            <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>{hallazgo.empresaResponsable || "Sin empresa responsable"}</span>
                            <span style={{ color: textoSuave, padding: "0 5px", flex: "0 0 auto" }}>/ Rep.</span>
                            <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>{hallazgo.empresaReportante || hallazgo.empresa}</span>
                          </div>

                          <div style={{ minWidth: 0, display: "flex", alignItems: "center", color: textoMedio, fontSize: "11px", fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>{hallazgo.obra}</span>
                            <span style={{ color: textoSuave, padding: "0 5px", flex: "0 0 auto" }}>/</span>
                            <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>{hallazgo.area}</span>
                          </div>

                          <div style={{ display: "flex", gap: "5px", alignItems: "center", minWidth: 0 }}>
                            <span style={{ borderRadius: "999px", padding: "5px 7px", background: `${colorCriticidad(hallazgo.criticidad)}1f`, border: `1px solid ${colorCriticidad(hallazgo.criticidad)}44`, color: colorCriticidad(hallazgo.criticidad), fontSize: "10px", fontWeight: 950, whiteSpace: "nowrap" }}>
                              {traducirCriticidad(hallazgo.criticidad)}
                            </span>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", minWidth: 0 }}>
                            <span style={{ borderRadius: "999px", padding: "5px 7px", background: `${colorEstadoDetalle(hallazgo.estado)}1f`, border: `1px solid ${colorEstadoDetalle(hallazgo.estado)}44`, color: colorEstadoDetalle(hallazgo.estado), fontSize: "10px", fontWeight: 950, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {traducirEstado(hallazgo.estado)}
                            </span>
                          </div>

                          <div style={{ minWidth: 0, display: "flex", alignItems: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            <span style={{ display: "inline-flex", maxWidth: "100%", borderRadius: "999px", padding: "5px 8px", background: vencido ? "rgba(249,115,22,0.14)" : sinFechaCompromiso ? "rgba(250,204,21,0.14)" : temaClaro ? "rgba(37,99,235,0.08)" : "rgba(56,189,248,0.08)", border: vencido ? "1px solid rgba(249,115,22,0.32)" : sinFechaCompromiso ? "1px solid rgba(250,204,21,0.32)" : "1px solid rgba(96,165,250,0.16)", color: vencido ? "#fb923c" : sinFechaCompromiso ? "#facc15" : textoAzul, fontSize: "10px", fontWeight: 950, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {vencimientoTexto}
                            </span>
                          </div>

                          <div style={{ minWidth: 0, display: "flex", alignItems: "center", color: textoMedio, fontSize: "11px", fontWeight: 850, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {hallazgo.responsableCierre || "Sin responsable"}
                          </div>

                          <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <button
                              type="button"
                              onClick={() => setHallazgoDetalleAbierto(expandido ? "" : hallazgo.codigo)}
                              style={{ ...botonStyle(`detalle-${hallazgo.codigo}`), minHeight: "32px", padding: "7px 10px", fontSize: "11px" }}
                            >
                              {expandido ? "Ocultar" : "Ver detalle"}
                            </button>
                          </div>
                        </div>

                        {expandido && (
                          <div style={{ padding: "12px", borderTop: bordeInterno, background: temaClaro ? "rgba(255,255,255,0.66)" : "rgba(2,6,23,0.22)", display: "grid", gap: "10px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "start", flexWrap: "wrap" }}>
                              <div style={{ color: textoMedio, fontSize: "12px", lineHeight: 1.5, fontWeight: 750, flex: "1 1 520px", minWidth: 0 }}>
                                <strong style={{ display: "block", color: textoPrincipal, marginBottom: "5px" }}>Descripcion / contexto</strong>
                                {hallazgo.descripcion || "Sin descripcion disponible en el registro cargado."}
                              </div>
                              <div style={{ display: "flex", gap: "7px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                                <button
                                  type="button"
                                  onClick={() =>
                                    void copiarResumenDetalle(
                                      resumenHallazgoDetalle(hallazgo),
                                      `Resumen de ${hallazgo.codigo} copiado al portapapeles.`
                                    )
                                  }
                                  style={{ ...botonStyle(`copiar-${hallazgo.codigo}`), minHeight: "32px", padding: "7px 10px", fontSize: "11px" }}
                                >
                                  Copiar resumen
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    activarBoton(`seguimiento-${hallazgo.codigo}`);
                                    setMensaje(`Seguimiento preparado visualmente para ${hallazgo.codigo}. Conexion accionable queda para fase posterior.`);
                                  }}
                                  style={{ ...botonStyle(`seguimiento-${hallazgo.codigo}`), minHeight: "32px", padding: "7px 10px", fontSize: "11px" }}
                                >
                                  Preparar seguimiento
                                </button>
                              </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "8px" }}>
                              {[
                                ["Tipo", hallazgo.tipoHallazgo],
                                ["Empresa reportante", hallazgo.empresaReportante || hallazgo.empresa],
                                ["Empresa responsable", hallazgo.empresaResponsable || "Sin empresa responsable"],
                                ["Responsable cierre", hallazgo.responsableCierre || "Sin responsable"],
                                ["Cargo responsable", hallazgo.responsableCargo || "Sin cargo"],
                                ["Estado cierre", hallazgo.estadoCierre || "Sin dato"],
                                ["Fecha reporte", fechaCortaDetalle(hallazgo.fechaISO)],
                                ["Fecha compromiso", fechaCortaDetalle(hallazgo.fechaCompromiso)],
                                ["Vencimiento", vencimientoTexto],
                                ["Evidencia reporte", hallazgo.fotos?.length ? "Si" : "No"],
                                ["Evidencia cierre", hallazgo.evidenciaCierreRecibida ? "Si" : "No disponible"],
                              ].map(([label, valor]) => (
                                <div key={`${hallazgo.codigo}-detalle-${label}`} style={{ borderRadius: "12px", padding: "8px 9px", background: fondoInternoFuerte, border: bordeInterno }}>
                                  <div style={{ color: textoSuave, fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.4px" }}>{label}</div>
                                  <div style={{ marginTop: "4px", color: textoPrincipal, fontSize: "12px", lineHeight: 1.35, fontWeight: 850 }}>{valor}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </article>
                    );
                  })}

                  {totalDetalleAccionable > limiteDetalleAccionable && (
                    <div style={{ width: "100%", minWidth: "1080px", maxWidth: "none", display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", flexWrap: "wrap", paddingTop: "6px", boxSizing: "border-box" }}>
                      <div style={{ color: textoSuave, fontSize: "12px", fontWeight: 800 }}>
                        Pagina {paginaDetalleVisible} de {totalPaginasDetalleAccionable} · Mostrando {inicioDetalleAccionable}-{finDetalleAccionable} de {totalDetalleAccionable}
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          type="button"
                          disabled={paginaDetalleVisible <= 1}
                          onClick={() => setPaginaDetalleAccionable((actual) => Math.max(1, actual - 1))}
                          style={{ ...botonStyle("detalle-anterior"), minHeight: "36px", padding: "8px 12px", opacity: paginaDetalleVisible <= 1 ? 0.52 : 1, cursor: paginaDetalleVisible <= 1 ? "not-allowed" : "pointer" }}
                        >
                          Anterior
                        </button>
                        <button
                          type="button"
                          disabled={paginaDetalleVisible >= totalPaginasDetalleAccionable}
                          onClick={() => setPaginaDetalleAccionable((actual) => Math.min(totalPaginasDetalleAccionable, actual + 1))}
                          style={{ ...botonStyle("detalle-siguiente"), minHeight: "36px", padding: "8px 12px", opacity: paginaDetalleVisible >= totalPaginasDetalleAccionable ? 0.52 : 1, cursor: paginaDetalleVisible >= totalPaginasDetalleAccionable ? "not-allowed" : "pointer" }}
                        >
                          Siguiente
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
        </section>
      </div>
    </main>
  );
}
