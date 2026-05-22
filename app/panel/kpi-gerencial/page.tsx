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

const LIMITE_REGISTROS_ANALISIS = 500;

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

function formatoValorTarjeta(valor: TarjetaKpiGerencial["valor"], sufijo = "") {
  return typeof valor === "number" ? formatoNumero(valor, sufijo) : valor;
}

function esHallazgoAbiertoGerencial(hallazgo: HallazgoKpiGerencial) {
  return hallazgo.estado !== "CERRADO" && hallazgo.estado !== "ANULADO";
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
    const focoEmpresa = analisis.porEmpresa[0]?.nombre || "Sin empresa dominante";
    const focoObra = analisis.porObra[0]?.nombre || "Sin obra dominante";
    const focoArea = analisis.porArea[0]?.nombre || "Sin area dominante";

    if (idiomaActivo !== "en") {
      if (analisis.total === 0) {
        return "No hay datos suficientes con los filtros seleccionados para emitir lectura gerencial.";
      }

      return `${metricasGerenciales.nivelRiesgo}. ${focoEmpresa} concentra la mayor carga, con foco operativo en ${focoObra} y ${focoArea}.`;
    }
    if (analisis.total === 0) {
      return t("No hay datos suficientes para un analisis gerencial avanzado.");
    }
    return `${metricasGerenciales.nivelRiesgo}. ${focoEmpresa} concentrates the highest operational load, with focus on ${focoObra} and ${focoArea}.`;
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
          titulo: "Empresas",
          valor: analisis.empresasActivas,
          color: "#60a5fa",
          detalle: "Empresas presentes en el filtro",
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
    if (modoAnalisis === "cierres") return analisis.porResponsable;
    if (modoAnalisis === "reincidencias") return analisis.porTipo;
    return analisis.porEmpresa;
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
            : "Ranking de empresas";
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
      titulo: "Empresas",
      subtitulo: "Carga total por empresa reportada.",
      data: analisis.porEmpresa,
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

            <div style={{ borderRadius: "16px", padding: "12px", background: fondoInterno, border: bordeInterno }}>
              <div style={{ fontSize: "11px", color: textoAzul, fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.6px" }}>
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
                    ["ranking-empresas", "Ranking empresas", "Ranking de empresas activo."],
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
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 950 }}>{t("Resumen ejecutivo visual")}</h2>
              <p style={{ margin: "6px 0 0", color: textoSuave, fontSize: "12px", lineHeight: 1.45, fontWeight: 700 }}>
                {t("Borrador gerencial segun filtros activos. Exportacion real pendiente.")}
              </p>
            </div>

            <div style={{ borderRadius: "22px", padding: "16px", background: temaClaro ? "rgba(219,234,254,0.62)" : "linear-gradient(145deg, rgba(37,99,235,0.22), rgba(15,23,42,0.82))", border: "1px solid rgba(96,165,250,0.26)" }}>
              <div style={{ fontSize: "12px", color: textoAzul, fontWeight: 950 }}>{t("Resumen")}</div>
              <p style={{ margin: "8px 0 0", color: textoPrincipal, lineHeight: 1.5, fontSize: "14px", fontWeight: 750 }}>
                {resumenEjecutivoTraducido()}
              </p>
            </div>

            <div style={{ display: "grid", gap: "8px" }}>
              <div style={{ fontSize: "12px", color: textoAzul, fontWeight: 950 }}>Foco gerencial</div>
              {[
                ["Empresa", analisis.porEmpresa[0]?.nombre || "Sin datos"],
                ["Obra", analisis.porObra[0]?.nombre || "Sin datos"],
                ["Area", analisis.porArea[0]?.nombre || "Sin datos"],
              ].map(([label, valor]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: "10px", borderRadius: "14px", padding: "10px 12px", background: fondoInterno, border: bordeInterno, color: textoMedio, fontSize: "12px", fontWeight: 800 }}>
                  <span style={{ color: textoSuave }}>{label}</span>
                  <strong style={{ color: textoPrincipal, textAlign: "right" }}>{valor}</strong>
                </div>
              ))}
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

            <div style={{ display: "grid", gap: "9px" }}>
              <div style={{ fontSize: "12px", color: textoAzul, fontWeight: 950 }}>{t("Rankings gerenciales")}</div>
              {rankingsSecundarios.map((ranking) => (
                <div key={ranking.titulo} style={{ borderRadius: "18px", padding: "12px", background: fondoInterno, border: bordeInterno, display: "grid", gap: "8px" }}>
                  <div>
                    <div style={{ fontSize: "12px", color: textoPrincipal, fontWeight: 950 }}>{ranking.titulo}</div>
                    <div style={{ marginTop: "3px", fontSize: "11px", color: textoSuave, lineHeight: 1.35, fontWeight: 750 }}>{ranking.subtitulo}</div>
                  </div>
                  {ranking.data.slice(0, 3).map((item, index) => (
                    <div key={`${ranking.titulo}-${item.nombre}`} style={{ display: "grid", gridTemplateColumns: "20px minmax(0, 1fr) auto", gap: "8px", alignItems: "center", color: textoMedio, fontSize: "11px", fontWeight: 850 }}>
                      <span style={{ color: textoAzul }}>{index + 1}</span>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.nombre}</span>
                      <span style={{ color: textoPrincipal }}>{item.total}</span>
                    </div>
                  ))}
                  {ranking.data.length === 0 && (
                    <div style={{ color: textoSuave, fontSize: "11px", fontWeight: 750 }}>Sin datos con los filtros actuales.</div>
                  )}
                </div>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
