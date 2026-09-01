"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactElement } from "react";
import {
  analizarMapaGpsHallazgos,
  tieneCoordenadaGpsReal,
  type CeldaMapaCalorHallazgo,
  type PuntoMapaGpsHallazgo,
} from "../../analytics/mapaGpsHallazgos";
import type {
  CriticidadHallazgoCentral,
  EstadoHallazgoCentral,
  HallazgoCentral,
  TipoHallazgoCentral,
} from "../../types/hallazgoCentral";
import { hallazgosMock, type HallazgoPanel } from "../mockdata";
import { cargarHallazgosPanelConFuentesOpcionales } from "../sources/hallazgosPanelSource";
import {
  resolvePlatformLanguage,
  resolvePlatformTheme,
  usePlatformPreferences,
} from "../../services/platformPreferences";
import { obtenerAuthProfileActual } from "../../services/authProfileService";
import {
  construirAlcanceVisibleCE,
  filtrosHallazgosDesdeAlcanceCE,
} from "../../services/visibleScope";
import PreventiveLegalRibbon from "../../components/PreventiveLegalRibbon";
import MapaGpsGoogle from "./MapaGpsGoogle";

type HallazgoPanelExtendido = HallazgoPanel & {
  area?: string;
  gps?: HallazgoCentral["geolocalizacion"];
  recomendacion?: string;
};

type ModoMapa = "puntos" | "calor" | "zonas";
type FiltroGps = "todos" | "con-gps" | "sin-gps";
type TipoVistaMapa = "estandar" | "satelital";
type AccionBarraMapa =
  | "general"
  | "criticos"
  | "abiertos"
  | "cerrados"
  | "empresas"
  | "recientes"
  | "capas"
  | "estandar"
  | "satelital"
  | "zoom-mas"
  | "zoom-menos"
  | "exportar"
  | "salir";
type IconoBarraMapa =
  | "mapa"
  | "filtro"
  | "alerta"
  | "bajo"
  | "check"
  | "empresa"
  | "obra"
  | "reciente"
  | "vencido"
  | "capas"
  | "satelital"
  | "zoomMas"
  | "zoomMenos"
  | "descarga"
  | "salir";

type FiltrosVista = {
  empresa: string;
  obra: string;
  area: string;
  criticidad: "" | CriticidadHallazgoCentral;
  estado: "" | EstadoHallazgoCentral;
  tipoHallazgo: string;
  fechaDesde: string;
  fechaHasta: string;
  gps: FiltroGps;
};

const filtrosIniciales: FiltrosVista = {
  empresa: "",
  obra: "",
  area: "",
  criticidad: "",
  estado: "",
  tipoHallazgo: "",
  fechaDesde: "",
  fechaHasta: "",
  gps: "todos",
};

const criticidades: CriticidadHallazgoCentral[] = [
  "CRITICO",
  "ALTO",
  "MEDIO",
  "BAJO",
];

const estadosOperativosAbiertos: EstadoHallazgoCentral[] = [
  "REPORTADO",
  "ABIERTO",
  "EN_SEGUIMIENTO",
];

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at 18% 10%, rgba(59,130,246,0.24), transparent 30%), radial-gradient(circle at 78% 0%, rgba(239,68,68,0.18), transparent 26%), linear-gradient(135deg, #07111f 0%, #0f1e36 45%, #172554 100%)",
  color: "#f8fafc",
  padding: "clamp(16px, 1.45vw, 30px)",
  boxSizing: "border-box",
  fontFamily:
    "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
};

const shellStyle: CSSProperties = {
  width: "100%",
  maxWidth: "none",
  margin: "0 auto",
  display: "grid",
  gap: "clamp(16px, 1vw, 22px)",
};

const surfaceStyle: CSSProperties = {
  borderRadius: "28px",
  background: "rgba(15,23,42,0.74)",
  border: "1px solid rgba(148,163,184,0.18)",
  boxShadow: "0 24px 70px rgba(0,0,0,0.34)",
  backdropFilter: "blur(14px)",
};

const GOOGLE_MAPS_API_KEY = (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "").trim();
const GOOGLE_MAPS_CONFIGURADO = /^AIza[0-9A-Za-z_-]{20,}$/.test(GOOGLE_MAPS_API_KEY);

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

function normalizarCriticidad(valor: string): CriticidadHallazgoCentral {
  const texto = normalizarTexto(valor);
  if (texto.includes("CRIT")) return "CRITICO";
  if (texto.includes("ALTO")) return "ALTO";
  if (texto.includes("MED")) return "MEDIO";
  return "BAJO";
}

function normalizarEstado(valor: string): EstadoHallazgoCentral {
  const texto = normalizarTexto(valor);
  if (texto.includes("CERR")) return "CERRADO";
  if (texto.includes("SEGUIMIENTO")) return "EN_SEGUIMIENTO";
  if (texto.includes("REPORT")) return "REPORTADO";
  if (texto.includes("ANUL")) return "ANULADO";
  return "ABIERTO";
}

function normalizarTipo(valor: string): TipoHallazgoCentral {
  const texto = normalizarTexto(valor);
  if (texto.includes("ACTO")) return "Acto subestandar";
  if (texto.includes("INCIDENT")) return "Incidente";
  if (texto.includes("OBSERV")) return "Observacion preventiva";
  if (texto.includes("OTRO")) return "Otro";
  return "Condicion subestandar";
}

function convertirPanelACentral(hallazgo: HallazgoPanelExtendido): HallazgoCentral {
  const criticidad = normalizarCriticidad(hallazgo.criticidad);
  const estado = normalizarEstado(hallazgo.estado);
  const causa = obtenerCausaTerritorial(hallazgo.descripcion);

  return {
    id: hallazgo.id,
    codigo: hallazgo.codigo,
    codigoInforme: hallazgo.codigo,
    origen: "panel-pc",
    empresa: hallazgo.empresa || "Sin empresa",
    obra: hallazgo.obra || "Sin obra",
    area: hallazgo.area || hallazgo.obra || "Sin area",
    reportante: {
      nombre: hallazgo.reportante || "Sin reportante",
      cargo: hallazgo.cargo,
      telefono: hallazgo.telefono,
    },
    fechaReporte: hallazgo.fechaISO || "",
    fechaHoraReporteISO: hallazgo.fechaISO || "",
    descripcion: hallazgo.descripcion || "Sin descripcion",
    tipoHallazgo: normalizarTipo(hallazgo.tipoHallazgo),
    criticidad,
    prioridad:
      criticidad === "CRITICO"
        ? "Urgente"
        : criticidad === "ALTO"
          ? "Alta"
          : criticidad === "MEDIO"
            ? "Media"
            : "Normal",
    accionInmediata: hallazgo.medidaInmediata,
    recomendacion:
      hallazgo.recomendacion ||
      "Priorizar controles de cierre segun criticidad y concentracion territorial.",
    estado,
    estadoCierre: estado === "CERRADO" ? "CERRADO" : "PENDIENTE",
    evidencias: (hallazgo.fotos || []).map((foto, index) => ({
      id: `${hallazgo.codigo}-${index}`,
      url: foto,
      origen: "panel-pc",
    })),
    geolocalizacion: hallazgo.gps,
    mapaGps: hallazgo.gps
      ? {
          latitud: hallazgo.gps.latitud,
          longitud: hallazgo.gps.longitud,
          precisionGps: hallazgo.gps.precisionGps,
          zona: hallazgo.gps.zona,
          sector: hallazgo.gps.sector,
          visibleEnMapa: true,
        }
      : undefined,
    radarPreventivo: {
      categoriaRiesgo: causa,
      causaDominante: causa,
      palabrasClave: causa === "GENERAL" ? [] : [causa],
      nivelExposicion: criticidad === "CRITICO" ? "critico" : criticidad.toLowerCase() as "bajo" | "medio" | "alto",
      potencialSeveridad: criticidad === "CRITICO" ? "critico" : criticidad.toLowerCase() as "bajo" | "medio" | "alto",
      requiereAccionInmediata: criticidad === "CRITICO" || criticidad === "ALTO",
      requiereDetencionTrabajo: criticidad === "CRITICO",
    },
  };
}

function obtenerCausaTerritorial(descripcion: string) {
  const texto = normalizarTexto(descripcion);
  if (texto.includes("ALTURA") || texto.includes("CAIDA")) return "ALTURA";
  if (texto.includes("ENERG") || texto.includes("ELECTRIC")) return "ENERGIA";
  if (texto.includes("TRANSITO") || texto.includes("ATROPEL")) return "TRANSITO";
  if (texto.includes("MAQUIN")) return "MAQUINARIA";
  if (texto.includes("SEGREG")) return "SEGREGACION";
  if (texto.includes("DOCUMENT")) return "DOCUMENTAL";
  return "GENERAL";
}

function colorCriticidad(criticidad: CriticidadHallazgoCentral) {
  if (criticidad === "CRITICO") return "#ef4444";
  if (criticidad === "ALTO") return "#f97316";
  if (criticidad === "MEDIO") return "#facc15";
  return "#22c55e";
}

function etiquetaCriticidad(criticidad: CriticidadHallazgoCentral) {
  return criticidad === "CRITICO" ? "CRITICO" : criticidad;
}

function ordenarEntradas(registro: Record<string, number>) {
  return Object.entries(registro).sort((a, b) => b[1] - a[1]);
}

function valorUnico<T extends string>(items: T[]) {
  return Array.from(new Set(items.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b, "es")
  );
}

const textosMapaEn: Record<string, string> = {
  "Mapa interactivo con coordenadas GPS reales.": "Interactive map with real GPS coordinates.",
  "Vista actualizada con hallazgos disponibles para analisis territorial.": "View updated with findings available for territorial analysis.",
  "Se uso fallback local para mantener disponible el mapa ejecutivo.": "Local fallback was used to keep the executive map available.",
  "Mapa caliente activo: intensidad por concentracion y criticidad.": "Heat map active: intensity by concentration and severity.",
  "Vista de zonas criticas activa: foco en criticidad alta y abierta.": "Critical zones view active: focus on high/open severity.",
  "Vista de puntos activa: lectura individual de reportes GPS.": "Points view active: individual GPS report review.",
  "Filtros limpiados. Vista territorial general restablecida.": "Filters cleared. General territorial view restored.",
  "Filtros aplicados sobre la vista territorial.": "Filters applied to territorial view.",
  "Cargando lectura territorial...": "Loading territorial review...",
  "Ajustando mapa": "Adjusting map",
  "Plataforma Hallazgos": "Findings Platform",
  "Mapa GPS de Hallazgos": "GPS Findings Map",
  "Lectura preventiva territorial para identificar concentracion de hallazgos, zonas calientes, criticidad geografica y focos de accion en terreno.": "Preventive territorial review to identify finding concentration, hot zones, geographic severity and field action focus.",
  "Volver al panel ejecutivo": "Back to executive dashboard",
  "Actualizar vista": "Refresh view",
  "Abrir pantalla completa": "Full screen map",
  "Pantalla completa preparada. En la version futura se conectara a mapa operacional dedicado.": "Full screen ready. A dedicated operational map will be connected in a future version.",
  "Pantalla completa no disponible en este navegador. La vista previa queda activa.": "Full screen is not available in this browser. The preview remains active.",
  "Vista estandar": "Standard view",
  "Vista satelital": "Satellite view",
  "Mapa ejecutivo disponible": "Executive map available",
  "Visualizacion territorial preparada para mostrar concentracion, criticidad y seguimiento de hallazgos.": "Prepared territorial visualization to show concentration, severity and findings follow-up.",
  "Vista ejecutiva GPS": "GPS executive view",
  "Lectura territorial preparada con puntos GPS, criticidad y focos preventivos para la demostracion.": "Prepared territorial review with GPS points, severity and preventive focus areas for the demo.",
  
  "Vista ejecutiva disponible. El mapa operativo externo se puede activar posteriormente.": "Executive view available. The external operational map can be enabled later.",
  "Clusters preparados": "Clusters ready",
  "Marcadores compactos": "Compact markers",
  "Vista territorial GPS": "GPS territorial view",
  "Visualizacion territorial con registros disponibles para apoyar decisiones preventivas.": "Territorial visualization with available records to support preventive decisions.",
  "Mapa ejecutivo": "Executive map",
  "Hallazgos con GPS": "Findings with GPS",
  "Puntos disponibles para lectura territorial": "Points available for territorial review",
  "Hallazgos sin GPS": "Findings without GPS",
  "Registros que requieren trazabilidad futura": "Records requiring future traceability",
  "Zonas criticas": "Critical zones",
  "Celdas con criticidad alta o critica": "Cells with high or critical severity",
  "Mayor concentracion": "Highest concentration",
  "Sin celda territorial dominante": "No dominant territorial cell",
  "Filtros territoriales": "Territorial filters",
  "Cruce rapido por empresa, obra, area, criticidad, estado, fecha y GPS.": "Quick cross-filter by company, site, area, severity, status, date and GPS.",
  "Filtros maestros del mapa": "Map master filters",
  "Un unico conjunto controla el mapa, los contadores y la exportacion.": "One filter set controls the map, counters and export.",
  "Filtros adicionales": "Additional filters",
  "visibles de": "visible out of",
  "filtros activos": "active filters",
  Empresa: "Company",
  "Obra / proyecto": "Site / project",
  Area: "Area",
  "Tipo de hallazgo": "Finding type",
  Criticidad: "Severity",
  Estado: "Status",
  Desde: "From",
  Hasta: "To",
  GPS: "GPS",
  Todos: "All",
  Todas: "All",
  "Con GPS y sin GPS": "With and without GPS",
  "Solo con GPS": "GPS only",
  "Solo sin GPS": "Without GPS only",
  "Aplicar filtros": "Apply filters",
  "Limpiar filtros": "Clear filters",
  "Lectura territorial preventiva": "Preventive territorial review",
  "Ver todos los puntos": "View all points",
  "Ver concentracion / mapa caliente": "View concentration / heat map",
  "Ver zonas criticas": "View critical zones",
  "Guardar imagen": "Save image",
  "Imagen del mapa filtrado preparada para descarga.": "Filtered map image prepared for download.",
  "No se pudo exportar la vista del mapa.": "The map view could not be exported.",
  "Mapa preventivo de faena": "Preventive jobsite map",
  "Selecciona filtros rapidos o abre el mapa operativo completo.": "Select quick filters or open the full operational map.",
  "Resumen del filtro": "Filter summary",
  "Sin filtro activo": "No active filter",
  "GPS preparado": "GPS ready",
  "Aun no existen coordenadas suficientes para mostrar puntos reales. La vista queda preparada para reportes con GPS desde terreno.": "There are not enough coordinates yet to show real points. The view is ready for field reports with GPS.",
  "Zonas y lectura ejecutiva": "Zones and executive review",
  "Detalle seleccionado": "Selected detail",
  "Empresa dominante": "Dominant company",
  "Obra dominante": "Dominant site",
  "Area dominante": "Dominant area",
  "Sin datos suficientes": "Not enough data",
  "Mensaje preventivo": "Preventive message",
  "Priorizar revision territorial donde se concentran criticidades altas o repetidas. El mapa apoya la toma de decisiones; no predice accidentes.": "Prioritize territorial review where high or repeated severities concentrate. The map supports decision-making; it does not predict accidents.",
  "Concentracion territorial para priorizar verificacion en terreno.": "Territorial concentration to prioritize field verification.",
  "Priorizar recorridos en zonas con acumulacion critica o alta. El mapa identifica patrones preventivos; no predice accidentes.": "Prioritize walkthroughs in zones with critical or high accumulation. The map identifies preventive patterns; it does not predict accidents.",
  "Activar captura GPS en reportes de terreno para habilitar analisis territorial y mapas de calor reales.": "Enable GPS capture in field reports to unlock territorial analysis and real heat maps.",
  "Ver hallazgos criticos": "View critical findings",
  "Detalle de zona": "Zone detail",
  "Exportar vista": "Export view",
  "Ver todos los registros": "View all records",
  "Selecciona un punto o zona caliente para revisar informacion territorial.": "Select a point or hot zone to review territorial information.",
  "Selecciona un marcador para ver empresa, faena, estado y criticidad del hallazgo.": "Select a marker to view company, worksite, status and severity.",
  "Fecha reporte": "Report date",
  "Obra / faena": "Site / work front",
  Responsable: "Owner",
  "Sin responsable": "No owner",
  "Sin fecha": "No date",
  "Sin obra": "No site",
  "Sin area": "No area",
  "Sin descripcion": "No description",
  "Sin datos": "No data",
  Coordenadas: "Coordinates",
  "Precision GPS": "GPS accuracy",
  "Coordenadas GPS reales": "Real GPS coordinates",
  "hallazgos ubicados en terreno": "findings located in the field",
  "Detalle del hallazgo": "Finding detail",
  "Zonas relevantes": "Relevant zones",
  "Sin zonas GPS suficientes para listar.": "Not enough GPS zones to list.",
  CRITICO: "CRITICAL",
  ALTO: "HIGH",
  MEDIO: "MEDIUM",
  BAJO: "LOW",
  REPORTADO: "REPORTED",
  ABIERTO: "OPEN",
  EN_SEGUIMIENTO: "IN FOLLOW-UP",
  CERRADO: "CLOSED",
  ANULADO: "VOIDED",
  Zona: "Zone",
  Codigos: "Codes",
  hallazgos: "findings",
  "criticos/altos": "critical/high",
  "Foco aplicado: hallazgos criticos con trazabilidad GPS.": "Focus applied: critical findings with GPS traceability.",
  "General map view": "General map view",
  "Vista general del mapa": "General map view",
  "Criticos": "Critical",
  "Altos": "High",
  "Medios": "Medium",
  "Bajos": "Low",
  "Mas criticos": "Most critical",
  Abiertos: "Open",
  Cerrados: "Closed",
  Empresas: "Companies",
  "Obras/areas": "Sites/areas",
  Recientes: "Recent",
  "Historico del dia": "Today history",
  "Historico global": "Global history",
  Vencidos: "Overdue",
  "Capas / visualizacion": "Layers / display",
  "Salir de pantalla completa": "Exit full screen",
  "Zoom mas": "Zoom in",
  "Zoom menos": "Zoom out",
  "Mapa operativo": "Operational map",
  "Panel territorial": "Territorial panel",
  "Vista mapa": "Map view",
  "Hallazgos visibles": "Visible findings",
  "Sin hallazgo seleccionado": "No finding selected",
  "Selecciona un marcador para revisar detalle ejecutivo.": "Select a marker to review executive detail.",
  "Filtros activos": "Active filters",
  "Listado de empresas": "Company list",
  "Todas las empresas": "All companies",
  "Sin hallazgos GPS para esta empresa": "No GPS findings for this company",
  "Selecciona una empresa para filtrar el mapa": "Select a company to filter the map",
  "Criticidad critica y alta": "Critical and high severity",
  "Criticidad media y baja": "Medium and low severity",
  "Concentracion por empresa": "Company concentration",
  "Concentracion por obra y area": "Site and area concentration",
  "Estados abiertos y en seguimiento": "Open and in-follow-up status",
  "Reportes recientes": "Recent reports",
  "Hallazgos vencidos": "Overdue findings",
  "Capas territoriales alternadas.": "Territorial layers toggled.",
  "Vista general del mapa restablecida.": "General map view restored.",
  "Filtro aplicado a hallazgos criticos.": "Filter applied to critical findings.",
  "Filtro aplicado a hallazgos altos.": "Filter applied to high findings.",
  "Filtro aplicado a hallazgos medios.": "Filter applied to medium findings.",
  "Filtro aplicado a hallazgos bajos.": "Filter applied to low findings.",
  "Foco en puntos de mayor criticidad.": "Focus on highest-severity points.",
  "Filtro aplicado a hallazgos abiertos o en seguimiento.": "Filter applied to open or in-follow-up findings.",
  "Filtro aplicado a hallazgos cerrados.": "Filter applied to closed findings.",
  "Lectura por empresas destacada.": "Company review highlighted.",
  "Selector de empresas disponible.": "Company selector available.",
  "Lectura por obras y areas destacada.": "Site and area review highlighted.",
  "Filtro por estados activos aplicado.": "Active status filter applied.",
  "Lectura de hallazgos recientes aplicada.": "Recent findings review applied.",
  "No hay hallazgos recientes con ubicación GPS.": "There are no recent findings with GPS location.",
  "Últimos 7 días": "Last 7 days",
  "Historico del dia aplicado.": "Today history applied.",
  "Historico global aplicado.": "Global history applied.",
  "Revision de vencidos aplicada.": "Overdue review applied.",
  "Pantalla completa del mapa activada.": "Full screen map activated.",
};

function IconoMapa({ tipo }: { tipo: IconoBarraMapa }) {
  const trazo = "currentColor";
  const iconos: Record<IconoBarraMapa, ReactElement> = {
    mapa: (
      <>
        <path d="M4 6.5l5-2.2 6 2.2 5-2.2v13.2l-5 2.2-6-2.2-5 2.2V6.5z" />
        <path d="M9 4.3v13.2M15 6.5v13.2" />
      </>
    ),
    filtro: (
      <>
        <path d="M4 6h16M7 12h10M10 18h4" />
      </>
    ),
    alerta: (
      <>
        <path d="M12 4l8 14H4L12 4z" />
        <path d="M12 9v4M12 16h.01" />
      </>
    ),
    bajo: (
      <>
        <path d="M5 7h14M5 12h10M5 17h6" />
        <path d="M17 14l2 2 2-2M19 10v6" />
      </>
    ),
    check: (
      <>
        <path d="M5 13l4 4L19 7" />
        <path d="M4 20h16" />
      </>
    ),
    empresa: (
      <>
        <path d="M5 20V5h10v15M15 10h4v10" />
        <path d="M8 8h2M8 12h2M8 16h2" />
      </>
    ),
    obra: (
      <>
        <path d="M4 19h16M6 19V9l6-4 6 4v10" />
        <path d="M10 19v-5h4v5" />
      </>
    ),
    reciente: (
      <>
        <path d="M12 6v6l4 2" />
        <path d="M21 12a9 9 0 1 1-3-6.7" />
        <path d="M21 4v5h-5" />
      </>
    ),
    vencido: (
      <>
        <path d="M12 7v5l3 2" />
        <path d="M12 21a9 9 0 1 0-9-9" />
        <path d="M3 16v5h5" />
      </>
    ),
    capas: (
      <>
        <path d="M12 4l9 5-9 5-9-5 9-5z" />
        <path d="M5 13l7 4 7-4M5 17l7 4 7-4" />
      </>
    ),
    satelital: (
      <>
        <path d="M4 7l8-4 8 4-8 4-8-4z" />
        <path d="M4 12l8 4 8-4M4 17l8 4 8-4" />
      </>
    ),
    zoomMas: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="M10.5 7.5v6M7.5 10.5h6M16 16l4 4" />
      </>
    ),
    zoomMenos: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="M7.5 10.5h6M16 16l4 4" />
      </>
    ),
    descarga: (
      <>
        <path d="M12 4v10" />
        <path d="M8 10l4 4 4-4" />
        <path d="M5 20h14" />
      </>
    ),
    salir: (
      <>
        <path d="M19 12H5" />
        <path d="M12 5l-7 7 7 7" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="21"
      height="21"
      fill="none"
      stroke={trazo}
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {iconos[tipo]}
    </svg>
  );
}

function posicionNormalizada(
  latitud: number,
  longitud: number,
  puntos: PuntoMapaGpsHallazgo[],
  index: number
) {
  const latitudes = puntos.map((punto) => punto.latitud);
  const longitudes = puntos.map((punto) => punto.longitud);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);
  const rangoLat = Math.max(maxLat - minLat, 0.001);
  const rangoLng = Math.max(maxLng - minLng, 0.001);
  const offset = puntos.length === 1 ? 0 : ((index % 5) - 2) * 1.1;

  return {
    left: Math.min(92, Math.max(8, ((longitud - minLng) / rangoLng) * 78 + 11 + offset)),
    top: Math.min(88, Math.max(10, 88 - ((latitud - minLat) / rangoLat) * 76 - offset)),
  };
}

function formatearFechaMapa(valor?: string) {
  if (!valor) return "";
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "";
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(fecha);
}

function formatearCoordenadas(punto: PuntoMapaGpsHallazgo) {
  return `${punto.latitud.toFixed(6)}, ${punto.longitud.toFixed(6)}`;
}

function fechaLocalISO(fecha: Date) {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function escaparXml(valor: string | number) {
  return String(valor)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function filtrarHallazgos(hallazgos: HallazgoCentral[], filtros: FiltrosVista) {
  return hallazgos.filter((hallazgo) => {
    const fecha = new Date(
      hallazgo.fechaHoraReporteISO || hallazgo.fechaCreacion || hallazgo.fechaReporte
    );
    const tieneGps = tieneCoordenadaGpsReal(hallazgo);

    if (filtros.empresa && hallazgo.empresa !== filtros.empresa) return false;
    if (filtros.obra && hallazgo.obra !== filtros.obra) return false;
    if (filtros.area && hallazgo.area !== filtros.area) return false;
    if (filtros.criticidad && hallazgo.criticidad !== filtros.criticidad) return false;
    if (
      filtros.estado === "ABIERTO" &&
      !estadosOperativosAbiertos.includes(hallazgo.estado)
    ) {
      return false;
    }
    if (
      filtros.estado &&
      filtros.estado !== "ABIERTO" &&
      hallazgo.estado !== filtros.estado
    ) {
      return false;
    }
    if (filtros.tipoHallazgo && hallazgo.tipoHallazgo !== filtros.tipoHallazgo) return false;
    if (filtros.gps === "con-gps" && !tieneGps) return false;
    if (filtros.gps === "sin-gps" && tieneGps) return false;
    if (
      filtros.fechaDesde &&
      !Number.isNaN(fecha.getTime()) &&
      fecha < new Date(`${filtros.fechaDesde}T00:00:00`)
    ) {
      return false;
    }
    if (
      filtros.fechaHasta &&
      !Number.isNaN(fecha.getTime()) &&
      fecha > new Date(`${filtros.fechaHasta}T23:59:59`)
    ) {
      return false;
    }

    return true;
  });
}

export default function MapaGpsHallazgosPage() {
  const mapaOperativoRef = useRef<HTMLElement | null>(null);
  const preferencias = usePlatformPreferences();
  const idiomaActivo = resolvePlatformLanguage(preferencias.language);
  const temaClaro = resolvePlatformTheme(preferencias.theme) === "light";
  const t = (texto: string) =>
    idiomaActivo === "en" ? textosMapaEn[texto] || texto : texto;
  const traducirCriticidad = (criticidad: CriticidadHallazgoCentral) =>
    idiomaActivo === "en" ? t(criticidad) : etiquetaCriticidad(criticidad);
  const traducirEstado = (estado: EstadoHallazgoCentral) =>
    idiomaActivo === "en" ? t(estado) : estado.replace("_", " ");
  const pageThemeStyle: CSSProperties = {
    ...pageStyle,
    background: temaClaro
      ? "radial-gradient(circle at 18% 10%, rgba(59,130,246,0.12), transparent 30%), radial-gradient(circle at 78% 0%, rgba(239,68,68,0.10), transparent 26%), linear-gradient(135deg, #f8fafc 0%, #eef6ff 45%, #f7fbff 100%)"
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
  const textoPrincipal = temaClaro ? "#0f172a" : "#f8fafc";
  const textoSuave = temaClaro ? "#475569" : "#94a3b8";
  const textoMedio = temaClaro ? "#334155" : "#cbd5e1";
  const textoAzul = temaClaro ? "#1d4ed8" : "#bfdbfe";
  const fondoTarjeta = temaClaro
    ? "linear-gradient(145deg, rgba(255,255,255,0.96), rgba(241,245,249,0.78))"
    : "linear-gradient(145deg, rgba(15,23,42,0.82), rgba(30,41,59,0.56))";
  const fondoInterno = temaClaro ? "rgba(248,250,252,0.92)" : "rgba(15,23,42,0.72)";
  const bordeInterno = temaClaro
    ? "1px solid rgba(100,116,139,0.20)"
    : "1px solid rgba(148,163,184,0.18)";
  const filtroControlStyle: CSSProperties = {
    width: "100%",
    minHeight: "42px",
    borderRadius: "13px",
    border: bordeInterno,
    background: temaClaro ? "rgba(255,255,255,0.94)" : "rgba(15,23,42,0.88)",
    color: textoPrincipal,
    padding: "0 11px",
    fontSize: "12px",
    fontWeight: 800,
    outline: "none",
    boxSizing: "border-box",
  };
  const [hallazgos, setHallazgos] = useState<HallazgoCentral[]>([]);
  const [cargando, setCargando] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosVista>(filtrosIniciales);
  const [modoMapa, setModoMapa] = useState<ModoMapa>("calor");
  const [accionActiva, setAccionActiva] = useState("");
  const [mensaje, setMensaje] = useState("Mapa interactivo con coordenadas GPS reales.");
  const [zonaSeleccionada, setZonaSeleccionada] = useState<CeldaMapaCalorHallazgo | null>(null);
  const [puntoSeleccionado, setPuntoSeleccionado] = useState<PuntoMapaGpsHallazgo | null>(null);
  const [barraExpandida, setBarraExpandida] = useState(false);
  const [tipoVistaMapa, setTipoVistaMapa] = useState<TipoVistaMapa>("satelital");
  const [zoomMapa, setZoomMapa] = useState(1);
  const [pantallaCompletaActiva, setPantallaCompletaActiva] = useState(false);
  const [mapaReajustando, setMapaReajustando] = useState(false);
  const [selectorEmpresasAbierto, setSelectorEmpresasAbierto] = useState(false);

  async function cargarDatos() {
    setCargando(true);
    let alcanceGlobal = false;
    try {
      const auth = await obtenerAuthProfileActual();
      const alcance = construirAlcanceVisibleCE(auth.perfil);
      alcanceGlobal = alcance.isGlobal;
      const datosPanel = await cargarHallazgosPanelConFuentesOpcionales(hallazgosMock, {
        filtros: filtrosHallazgosDesdeAlcanceCE(alcance),
        permitirFallbackMock: alcanceGlobal,
        incluirReportesLocales: alcanceGlobal,
      });
      const centrales = datosPanel.map((hallazgo) =>
        convertirPanelACentral(hallazgo as HallazgoPanelExtendido)
      );
      setHallazgos(centrales);
      setMensaje(
        centrales.length > 0
          ? "Vista actualizada con hallazgos disponibles para analisis territorial."
          : "Sin hallazgos GPS para esta empresa"
      );
    } catch (error) {
      console.warn("No se pudo cargar la vista de mapa GPS.", error);
      const fallback = alcanceGlobal
        ? hallazgosMock.map((hallazgo) => convertirPanelACentral(hallazgo))
        : [];
      setHallazgos(fallback);
      setMensaje(
        alcanceGlobal
          ? "Se uso fallback local para mantener disponible el mapa ejecutivo."
          : "Sin hallazgos GPS para esta empresa"
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    let cancelado = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const frameId = window.requestAnimationFrame(() => {
      timeoutId = setTimeout(() => {
        if (!cancelado) void cargarDatos();
      }, 0);
    });

    return () => {
      cancelado = true;
      window.cancelAnimationFrame(frameId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const opciones = useMemo(
    () => ({
      empresas: valorUnico(hallazgos.map((hallazgo) => hallazgo.empresa)),
      obras: valorUnico(hallazgos.map((hallazgo) => hallazgo.obra)),
      areas: valorUnico(hallazgos.map((hallazgo) => hallazgo.area)),
      tipos: valorUnico(hallazgos.map((hallazgo) => hallazgo.tipoHallazgo)),
    }),
    [hallazgos]
  );

  const hallazgosFiltrados = useMemo(
    () => filtrarHallazgos(hallazgos, filtros),
    [hallazgos, filtros]
  );

  useEffect(() => {
    setPuntoSeleccionado(null);
    setZonaSeleccionada(null);
  }, [filtros]);

  const resumenMapa = useMemo(
    () => analizarMapaGpsHallazgos(hallazgosFiltrados),
    [hallazgosFiltrados]
  );

  const puntosMapaActivos = resumenMapa.puntos;
  const zonasMapaActivas = resumenMapa.mapaCalor;

  const mayorConcentracion = zonasMapaActivas[0]
    ? [...zonasMapaActivas].sort((a, b) => b.total - a.total)[0]
    : null;
  const zonasCriticas = zonasMapaActivas.filter(
    (zona) => zona.criticidadMaxima === "CRITICO" || zona.criticosAltos > 0
  );
  const concentracionEmpresa = ordenarEntradas(resumenMapa.porEmpresa)[0];
  const concentracionObra = ordenarEntradas(resumenMapa.porObra)[0];
  const concentracionArea = ordenarEntradas(resumenMapa.porArea)[0];
  const empresasMapa = useMemo(
    () =>
      opciones.empresas.map((empresa) => {
        const hallazgosEmpresa = hallazgos.filter((hallazgo) => hallazgo.empresa === empresa);
        const totalGps = hallazgosEmpresa.filter(tieneCoordenadaGpsReal).length;

        return {
          empresa,
          total: hallazgosEmpresa.length,
          totalGps,
        };
      }),
    [hallazgos, opciones.empresas]
  );
  const empresaSeleccionadaMapa = filtros.empresa
    ? empresasMapa.find((item) => item.empresa === filtros.empresa)
    : null;
  const filtroRecientesActivo =
    accionActiva === "recientes" && filtros.gps === "con-gps" && Boolean(filtros.fechaDesde);
  const sinHallazgosRecientesGps =
    !cargando && filtroRecientesActivo && resumenMapa.totalConGps === 0;
  const hallazgoSeleccionado = useMemo(() => {
    if (!puntoSeleccionado) return null;
    return (
      hallazgosFiltrados.find((hallazgo) => hallazgo.codigo === puntoSeleccionado.codigo) ||
      hallazgos.find((hallazgo) => hallazgo.codigo === puntoSeleccionado.codigo) ||
      null
    );
  }, [hallazgos, hallazgosFiltrados, puntoSeleccionado]);

  useEffect(() => {
    const sincronizarPantallaCompleta = () => {
      const estaEnPantallaCompleta =
        document.fullscreenElement === mapaOperativoRef.current;
      setMapaReajustando(true);
      setPantallaCompletaActiva(estaEnPantallaCompleta);
      if (!estaEnPantallaCompleta) {
        setBarraExpandida(false);
      }
      window.requestAnimationFrame(() => {
        window.setTimeout(() => setMapaReajustando(false), 220);
      });
    };

    document.addEventListener("fullscreenchange", sincronizarPantallaCompleta);
    return () => {
      document.removeEventListener("fullscreenchange", sincronizarPantallaCompleta);
    };
  }, []);

  function botonStyle(id: string, destacado = false): CSSProperties {
    const activo = accionActiva === id;
    return {
      minHeight: "44px",
      borderRadius: "14px",
      border: destacado ? "1px solid rgba(96,165,250,0.56)" : "1px solid rgba(148,163,184,0.22)",
      background: destacado
        ? "linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)"
        : temaClaro
          ? "rgba(255,255,255,0.88)"
          : "rgba(15,23,42,0.78)",
      color: destacado ? "#ffffff" : textoAzul,
      padding: "11px 14px",
      fontSize: "13px",
      fontWeight: 900,
      cursor: "pointer",
      boxShadow: activo
        ? "0 6px 14px rgba(14,165,233,0.20), inset 0 2px 12px rgba(0,0,0,0.18)"
        : destacado
          ? "0 12px 26px rgba(37,99,235,0.28)"
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

  function activarBoton(id: string) {
    setAccionActiva(id);
    vibrarCorto();
    window.setTimeout(() => setAccionActiva(""), 180);
  }

  function cambiarTipoVistaMapa(tipo: TipoVistaMapa) {
    activarBoton(tipo);
    setTipoVistaMapa(tipo);
    setMensaje(
      tipo === "satelital" ? "Vista satelital" : "Vista estandar"
    );
  }

  function ajustarZoom(delta: number) {
    activarBoton(delta > 0 ? "zoom-mas" : "zoom-menos");
    setZoomMapa((actual) => Math.min(1.6, Math.max(0.75, Number((actual + delta).toFixed(2)))));
  }

  async function abrirPantallaCompleta() {
    activarBoton("pantalla-completa");
    const elemento = mapaOperativoRef.current;

    if (elemento?.requestFullscreen) {
      try {
        await elemento.requestFullscreen();
        setPantallaCompletaActiva(true);
        setMensaje("Pantalla completa del mapa activada.");
        return;
      } catch {
        setMensaje("Pantalla completa no disponible en este navegador. La vista previa queda activa.");
        return;
      }
    }

    setMensaje("Pantalla completa no disponible en este navegador. La vista previa queda activa.");
  }

  async function salirPantallaCompleta() {
    activarBoton("salir");
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
    setPantallaCompletaActiva(false);
    setBarraExpandida(false);
    setSelectorEmpresasAbierto(false);
  }

  const filtrosActivosLista = [
      filtros.empresa && `${t("Empresa")}: ${filtros.empresa}`,
      filtros.obra && `${t("Obra / faena")}: ${filtros.obra}`,
      filtros.area && `${t("Area")}: ${filtros.area}`,
      filtros.criticidad && `${t("Criticidad")}: ${traducirCriticidad(filtros.criticidad)}`,
      filtros.estado && `${t("Estado")}: ${traducirEstado(filtros.estado)}`,
      filtros.tipoHallazgo && `${t("Tipo de hallazgo")}: ${filtros.tipoHallazgo}`,
      filtros.fechaDesde && `${t("Desde")}: ${filtros.fechaDesde}`,
      filtros.fechaHasta && `${t("Hasta")}: ${filtros.fechaHasta}`,
      filtros.gps !== "todos" && `${t("GPS")}: ${t(filtros.gps === "con-gps" ? "Solo con GPS" : "Solo sin GPS")}`,
    ].filter(Boolean) as string[];

  function resumenFiltrosActivos() {
    return filtrosActivosLista.length
      ? filtrosActivosLista.join(" · ")
      : t("Sin filtro activo");
  }

  function descargarVistaMapa() {
    activarBoton("exportar");
    const width = 1200;
    const height = 760;
    const puntosExportables = resumenMapa.puntos.slice(0, 90);
    const fondo = temaClaro ? "#f8fafc" : "#07111f";
    const panel = temaClaro ? "#ffffff" : "#0f172a";
    const texto = temaClaro ? "#0f172a" : "#f8fafc";
    const textoSecundario = temaClaro ? "#475569" : "#cbd5e1";
    const resumen = resumenFiltrosActivos();
    const puntosSvg = puntosExportables
      .map((punto, index) => {
        const posicion = posicionNormalizada(
          punto.latitud,
          punto.longitud,
          puntosExportables,
          index
        );
        const x = 96 + (posicion.left / 100) * 1008;
        const y = 150 + (posicion.top / 100) * 500;
        const radio = punto.criticidad === "CRITICO" ? 7 : 5;
        return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${radio}" fill="${colorCriticidad(punto.criticidad)}" stroke="#fff" stroke-width="2"><title>${escaparXml(punto.codigo)}</title></circle>`;
      })
      .join("");

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <rect width="${width}" height="${height}" fill="${fondo}"/>
        <rect x="46" y="36" width="1108" height="688" rx="28" fill="${panel}" stroke="#38bdf8" stroke-opacity="0.24"/>
        <text x="82" y="86" fill="${texto}" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="800">${escaparXml(t("Mapa preventivo de faena"))}</text>
        <text x="82" y="120" fill="${textoSecundario}" font-family="Inter, Arial, sans-serif" font-size="15" font-weight="600">${escaparXml(t("Resumen del filtro"))}: ${escaparXml(resumen)}</text>
        <rect x="82" y="150" width="1036" height="500" rx="22" fill="${temaClaro ? "#e2e8f0" : "#111827"}" stroke="#94a3b8" stroke-opacity="0.28"/>
        <g opacity="0.42">
          ${Array.from({ length: 9 })
            .map((_, i) => `<line x1="${110 + i * 116}" y1="172" x2="${110 + i * 116}" y2="628" stroke="#94a3b8" stroke-opacity="0.28"/>`)
            .join("")}
          ${Array.from({ length: 5 })
            .map((_, i) => `<line x1="104" y1="${200 + i * 86}" x2="1094" y2="${200 + i * 86}" stroke="#94a3b8" stroke-opacity="0.28"/>`)
            .join("")}
        </g>
        <g>${puntosSvg}</g>
        <text x="82" y="690" fill="${texto}" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="800">${hallazgosFiltrados.length} ${escaparXml(t("hallazgos"))}</text>
        <text x="260" y="690" fill="#38bdf8" font-family="Inter, Arial, sans-serif" font-size="15" font-weight="700">${resumenMapa.totalConGps} GPS · ${zonasCriticas.length} ${escaparXml(t("Zonas criticas"))}</text>
      </svg>`;

    const imagen = new Image();
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    imagen.onload = () => {
      const contexto = canvas.getContext("2d");
      if (!contexto) return;
      contexto.drawImage(imagen, 0, 0);
      const enlace = document.createElement("a");
      enlace.download = `mapa-gps-${fechaLocalISO(new Date())}.png`;
      enlace.href = canvas.toDataURL("image/png");
      enlace.click();
      setMensaje("Imagen del mapa filtrado preparada para descarga.");
    };
    imagen.onerror = () => setMensaje("No se pudo exportar la vista del mapa.");
    imagen.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  const accionesBarra: Array<{
    id: AccionBarraMapa;
    icono: IconoBarraMapa;
    etiqueta: string;
    destacado?: boolean;
  }> = [
    { id: "general", icono: "mapa", etiqueta: "Ver todos los puntos", destacado: true },
    { id: "criticos", icono: "alerta", etiqueta: "Criticos" },
    { id: "abiertos", icono: "alerta", etiqueta: "Abiertos" },
    { id: "cerrados", icono: "check", etiqueta: "Cerrados" },
    { id: "empresas", icono: "empresa", etiqueta: "Empresas" },
    { id: "recientes", icono: "reciente", etiqueta: "Recientes" },
    { id: "capas", icono: "capas", etiqueta: "Capas / visualizacion" },
    { id: "estandar", icono: "capas", etiqueta: "Vista estandar" },
    { id: "satelital", icono: "satelital", etiqueta: "Vista satelital" },
    { id: "zoom-mas", icono: "zoomMas", etiqueta: "Zoom mas" },
    { id: "zoom-menos", icono: "zoomMenos", etiqueta: "Zoom menos" },
    { id: "exportar", icono: "descarga", etiqueta: "Guardar imagen" },
    { id: "salir", icono: "salir", etiqueta: "Salir de pantalla completa" },
  ];
  const accionesVistaPrevia: Array<{
    id: AccionBarraMapa;
    icono: IconoBarraMapa;
    etiqueta: string;
    destacado?: boolean;
  }> = [
    { id: "general", icono: "mapa", etiqueta: "Ver todos los puntos", destacado: true },
    { id: "criticos", icono: "alerta", etiqueta: "Criticos" },
    { id: "abiertos", icono: "alerta", etiqueta: "Abiertos" },
    { id: "exportar", icono: "descarga", etiqueta: "Guardar imagen" },
  ];

  function ejecutarAccionBarra(id: AccionBarraMapa) {
    activarBoton(id);

    if (id === "general") {
      setFiltros(filtrosIniciales);
      setModoMapa("puntos");
      setZonaSeleccionada(null);
      setPuntoSeleccionado(null);
      setSelectorEmpresasAbierto(false);
      setMensaje("Vista general del mapa restablecida.");
      return;
    }

    if (id === "criticos") {
      setFiltros((actual) => ({ ...actual, criticidad: "CRITICO", gps: "todos" }));
      setModoMapa("zonas");
      setMensaje("Filtro aplicado a hallazgos criticos.");
      return;
    }

    if (id === "abiertos") {
      setFiltros((actual) => ({ ...actual, estado: "ABIERTO", gps: "todos" }));
      setModoMapa("zonas");
      setMensaje("Filtro aplicado a hallazgos abiertos o en seguimiento.");
      return;
    }

    if (id === "cerrados") {
      setFiltros((actual) => ({ ...actual, estado: "CERRADO", gps: "todos" }));
      setModoMapa("puntos");
      setMensaje("Filtro aplicado a hallazgos cerrados.");
      return;
    }

    if (id === "empresas") {
      setBarraExpandida(true);
      setSelectorEmpresasAbierto((abierto) => !abierto);
      setMensaje("Selector de empresas disponible.");
      return;
    }

    if (id === "recientes") {
      const fechaDesde = new Date();
      fechaDesde.setDate(fechaDesde.getDate() - 7);
      const fechaDesdeISO = fechaLocalISO(fechaDesde);
      const recientesConGps = hallazgos.filter((hallazgo) => {
        const fecha = new Date(
          hallazgo.fechaHoraReporteISO || hallazgo.fechaCreacion || hallazgo.fechaReporte
        );
        const tieneGps =
          typeof hallazgo.geolocalizacion?.latitud === "number" &&
          typeof hallazgo.geolocalizacion.longitud === "number";

        return (
          tieneGps &&
          !Number.isNaN(fecha.getTime()) &&
          fecha >= new Date(`${fechaDesdeISO}T00:00:00`)
        );
      }).length;

      setFiltros({
        ...filtrosIniciales,
        fechaDesde: fechaDesdeISO,
        fechaHasta: "",
        gps: "con-gps",
      });
      setModoMapa("puntos");
      setZonaSeleccionada(null);
      setPuntoSeleccionado(null);
      setSelectorEmpresasAbierto(false);
      setMensaje(
        recientesConGps > 0
          ? "Lectura de hallazgos recientes aplicada."
          : "No hay hallazgos recientes con ubicación GPS."
      );
      return;
    }

    if (id === "capas") {
      const siguiente: ModoMapa =
        modoMapa === "calor" ? "puntos" : modoMapa === "puntos" ? "zonas" : "calor";
      setModoMapa(siguiente);
      setMensaje("Capas territoriales alternadas.");
      return;
    }

    if (id === "estandar" || id === "satelital") {
      cambiarTipoVistaMapa(id);
      return;
    }

    if (id === "zoom-mas") {
      ajustarZoom(0.15);
      return;
    }

    if (id === "zoom-menos") {
      ajustarZoom(-0.15);
      return;
    }

    if (id === "exportar") {
      descargarVistaMapa();
      return;
    }

    if (id === "salir") {
      void salirPantallaCompleta();
    }
  }

  return (
    <main className="ce-panel-page ce-panel-map-page" style={pageThemeStyle}>
      <div className="ce-panel-shell ce-panel-map-shell" style={shellStyle}>
        <header
          className="ce-panel-header"
          style={{
            ...themedSurfaceStyle,
            position: "sticky",
            top: 0,
            zIndex: 40,
            isolation: "isolate",
            padding: "18px 22px",
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) auto",
            gap: "18px",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "12px",
                letterSpacing: "1.2px",
                textTransform: "uppercase",
                color: textoAzul,
                fontWeight: 950,
              }}
            >
              {t("Plataforma Hallazgos")}
            </div>
            <h1
              style={{
                margin: "8px 0 6px",
                fontSize: "34px",
                lineHeight: 1,
                fontWeight: 950,
              }}
            >
              {t("MAPA GPS DE HALLAZGOS E ITO DE TERRENO")}
            </h1>
            <p
              style={{
                margin: 0,
                maxWidth: "820px",
                color: textoMedio,
                fontSize: "15px",
                lineHeight: 1.5,
                fontWeight: 650,
              }}
            >
              {t("Vista territorial para identificar concentración de hallazgos, zonas críticas y focos preventivos dentro de la obra.")}
            </p>
            <PreventiveLegalRibbon
              theme={temaClaro ? "light" : "dark"}
              compact
              text={t("Gestión preventiva digital alineada a Ley 16.744, DS 44 y DS 594, con foco en evidencia, trazabilidad y seguimiento de cierre.")}
              style={{ marginTop: "8px" }}
            />
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <Link
              href="/panel"
              prefetch
              onMouseDown={() => activarBoton("volver")}
              style={botonStyle("volver")}
            >
              {t("Volver al panel ejecutivo")}
            </Link>
            <button
              type="button"
              onClick={() => {
                activarBoton("actualizar");
                cargarDatos();
              }}
              style={botonStyle("actualizar", true)}
            >
              {t("Actualizar vista")}
            </button>
            <button
              type="button"
              onClick={abrirPantallaCompleta}
              style={botonStyle("pantalla-completa", true)}
            >
              {t("Abrir pantalla completa")}
            </button>
            <button
              type="button"
              onClick={descargarVistaMapa}
              style={botonStyle("exportar")}
            >
              {t("Guardar imagen")}
            </button>
          </div>
        </header>

        <section
          className="ce-panel-map-summary"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(190px, 1fr))",
            gap: "14px",
          }}
        >
          {[
            {
              titulo: t("Hallazgos con GPS"),
              valor: resumenMapa.totalConGps,
              color: "#38bdf8",
              detalle: t("Puntos disponibles para lectura territorial"),
              accion: () => setFiltros((actual) => ({ ...actual, gps: "con-gps" })),
            },
            {
              titulo: t("Hallazgos sin GPS"),
              valor: resumenMapa.totalSinGps,
              color: "#f97316",
              detalle: t("Registros que requieren trazabilidad futura"),
              accion: () => setFiltros((actual) => ({ ...actual, gps: "sin-gps" })),
            },
            {
              titulo: t("Zonas criticas"),
              valor: zonasCriticas.length,
              color: "#ef4444",
              detalle: t("Celdas con criticidad alta o critica"),
              accion: () => {
                setFiltros((actual) => ({ ...actual, criticidad: "CRITICO", gps: "todos" }));
                setModoMapa("zonas");
              },
            },
            {
              titulo: t("Mayor concentracion"),
              valor: mayorConcentracion?.total || 0,
              color: "#a78bfa",
              detalle: mayorConcentracion
                ? mayorConcentracion.clave
                : t("Sin celda territorial dominante"),
              accion: () => {
                if (mayorConcentracion) setZonaSeleccionada(mayorConcentracion);
                setModoMapa("calor");
              },
            },
          ].map((tarjeta) => (
            <button
              key={tarjeta.titulo}
              type="button"
              onClick={() => {
                activarBoton(tarjeta.titulo);
                tarjeta.accion();
              }}
              style={{
                ...themedSurfaceStyle,
                padding: "18px",
                minHeight: "132px",
                background: fondoTarjeta,
                textAlign: "left",
                cursor: "pointer",
                color: textoPrincipal,
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: textoMedio,
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.7px",
                }}
              >
                {tarjeta.titulo}
              </div>
              <div
                style={{
                  marginTop: "10px",
                  fontSize: "42px",
                  lineHeight: 1,
                  fontWeight: 950,
                  color: tarjeta.color,
                  textShadow: `0 0 22px ${tarjeta.color}66`,
                }}
              >
                {tarjeta.valor}
              </div>
              <div
                style={{
                  marginTop: "9px",
                  color: textoSuave,
                  fontSize: "12px",
                  lineHeight: 1.35,
                  fontWeight: 750,
                }}
              >
                {tarjeta.detalle}
              </div>
            </button>
          ))}
        </section>

        <section
          style={{
            ...themedSurfaceStyle,
            padding: "16px",
            display: "grid",
            gap: "14px",
            background: fondoTarjeta,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: "14px", alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <div style={{ color: textoAzul, fontSize: "11px", fontWeight: 950, letterSpacing: "0.7px", textTransform: "uppercase" }}>
                {t("Filtros maestros del mapa")}
              </div>
              <div style={{ marginTop: "4px", color: textoSuave, fontSize: "12px", fontWeight: 750 }}>
                {t("Un unico conjunto controla el mapa, los contadores y la exportacion.")}
              </div>
            </div>
            <div style={{ display: "flex", gap: "9px", alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ borderRadius: "999px", padding: "8px 11px", background: fondoInterno, border: bordeInterno, color: textoAzul, fontSize: "12px", fontWeight: 950 }}>
                {hallazgosFiltrados.length} {t("visibles de")} {hallazgos.length} · {resumenMapa.totalConGps} GPS
              </span>
              <span style={{ borderRadius: "999px", padding: "8px 11px", background: filtrosActivosLista.length ? "rgba(37,99,235,0.16)" : fondoInterno, border: filtrosActivosLista.length ? "1px solid rgba(96,165,250,0.42)" : bordeInterno, color: filtrosActivosLista.length ? textoAzul : textoSuave, fontSize: "12px", fontWeight: 900 }}>
                {filtrosActivosLista.length} {t("filtros activos")}
              </span>
              <button
                type="button"
                onClick={() => {
                  setFiltros(filtrosIniciales);
                  setModoMapa("puntos");
                  setMensaje("Vista general del mapa restablecida.");
                }}
                disabled={filtrosActivosLista.length === 0}
                style={{ ...botonStyle("limpiar-filtros"), minHeight: "38px", padding: "8px 12px", opacity: filtrosActivosLista.length === 0 ? 0.5 : 1, cursor: filtrosActivosLista.length === 0 ? "not-allowed" : "pointer" }}
              >
                {t("Limpiar filtros")}
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))", gap: "10px" }} className="ce-map-master-filters">
            <label style={{ display: "grid", gap: "6px" }}>
              <span style={{ color: textoSuave, fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.5px" }}>{t("Empresa")}</span>
              <select value={filtros.empresa} onChange={(event) => setFiltros((actual) => ({ ...actual, empresa: event.target.value, obra: "", area: "" }))} style={filtroControlStyle}>
                <option value="">{t("Todas")}</option>
                {opciones.empresas.map((empresa) => <option key={empresa} value={empresa}>{empresa}</option>)}
              </select>
            </label>
            <label style={{ display: "grid", gap: "6px" }}>
              <span style={{ color: textoSuave, fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.5px" }}>{t("Obra / proyecto")}</span>
              <select value={filtros.obra} onChange={(event) => setFiltros((actual) => ({ ...actual, obra: event.target.value }))} style={filtroControlStyle}>
                <option value="">{t("Todas")}</option>
                {opciones.obras.map((obra) => <option key={obra} value={obra}>{obra}</option>)}
              </select>
            </label>
            <label style={{ display: "grid", gap: "6px" }}>
              <span style={{ color: textoSuave, fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.5px" }}>{t("Criticidad")}</span>
              <select value={filtros.criticidad} onChange={(event) => setFiltros((actual) => ({ ...actual, criticidad: event.target.value as FiltrosVista["criticidad"] }))} style={filtroControlStyle}>
                <option value="">{t("Todas")}</option>
                {criticidades.map((criticidad) => <option key={criticidad} value={criticidad}>{traducirCriticidad(criticidad)}</option>)}
              </select>
            </label>
            <label style={{ display: "grid", gap: "6px" }}>
              <span style={{ color: textoSuave, fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.5px" }}>{t("Estado")}</span>
              <select value={filtros.estado} onChange={(event) => setFiltros((actual) => ({ ...actual, estado: event.target.value as FiltrosVista["estado"] }))} style={filtroControlStyle}>
                <option value="">{t("Todos")}</option>
                {(["ABIERTO", "REPORTADO", "EN_SEGUIMIENTO", "CERRADO", "ANULADO"] as EstadoHallazgoCentral[]).map((estado) => <option key={estado} value={estado}>{traducirEstado(estado)}</option>)}
              </select>
            </label>
            <label style={{ display: "grid", gap: "6px" }}>
              <span style={{ color: textoSuave, fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.5px" }}>{t("Desde")}</span>
              <input type="date" value={filtros.fechaDesde} onChange={(event) => setFiltros((actual) => ({ ...actual, fechaDesde: event.target.value }))} style={filtroControlStyle} />
            </label>
            <label style={{ display: "grid", gap: "6px" }}>
              <span style={{ color: textoSuave, fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.5px" }}>{t("Hasta")}</span>
              <input type="date" value={filtros.fechaHasta} onChange={(event) => setFiltros((actual) => ({ ...actual, fechaHasta: event.target.value }))} style={filtroControlStyle} />
            </label>
          </div>

          <details style={{ borderRadius: "15px", border: bordeInterno, background: fondoInterno, padding: "10px 12px" }}>
            <summary style={{ cursor: "pointer", color: textoAzul, fontSize: "12px", fontWeight: 950 }}>
              {t("Filtros adicionales")}: {t("Area")}, {t("Tipo de hallazgo")} y GPS
            </summary>
            <div style={{ marginTop: "12px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "10px" }} className="ce-map-secondary-filters">
              <label style={{ display: "grid", gap: "6px" }}>
                <span style={{ color: textoSuave, fontSize: "10px", fontWeight: 900, textTransform: "uppercase" }}>{t("Area")}</span>
                <select value={filtros.area} onChange={(event) => setFiltros((actual) => ({ ...actual, area: event.target.value }))} style={filtroControlStyle}>
                  <option value="">{t("Todas")}</option>
                  {opciones.areas.map((area) => <option key={area} value={area}>{area}</option>)}
                </select>
              </label>
              <label style={{ display: "grid", gap: "6px" }}>
                <span style={{ color: textoSuave, fontSize: "10px", fontWeight: 900, textTransform: "uppercase" }}>{t("Tipo de hallazgo")}</span>
                <select value={filtros.tipoHallazgo} onChange={(event) => setFiltros((actual) => ({ ...actual, tipoHallazgo: event.target.value }))} style={filtroControlStyle}>
                  <option value="">{t("Todos")}</option>
                  {opciones.tipos.map((tipo) => <option key={tipo} value={tipo}>{tipo}</option>)}
                </select>
              </label>
              <label style={{ display: "grid", gap: "6px" }}>
                <span style={{ color: textoSuave, fontSize: "10px", fontWeight: 900, textTransform: "uppercase" }}>{t("GPS")}</span>
                <select value={filtros.gps} onChange={(event) => setFiltros((actual) => ({ ...actual, gps: event.target.value as FiltroGps }))} style={filtroControlStyle}>
                  <option value="todos">{t("Con GPS y sin GPS")}</option>
                  <option value="con-gps">{t("Solo con GPS")}</option>
                  <option value="sin-gps">{t("Solo sin GPS")}</option>
                </select>
              </label>
            </div>
          </details>

          {filtrosActivosLista.length > 0 && (
            <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>
              {filtrosActivosLista.map((filtro) => (
                <span key={filtro} style={{ borderRadius: "999px", padding: "6px 9px", background: temaClaro ? "rgba(37,99,235,0.10)" : "rgba(56,189,248,0.10)", border: temaClaro ? "1px solid rgba(37,99,235,0.20)" : "1px solid rgba(125,211,252,0.22)", color: textoAzul, fontSize: "11px", fontWeight: 900 }}>
                  {filtro}
                </span>
              ))}
            </div>
          )}
        </section>

        <section
          className="ce-panel-map-grid"
          ref={mapaOperativoRef}
          style={{
            display: "grid",
            gridTemplateColumns:
              pantallaCompletaActiva
                ? "auto minmax(0, 1fr)"
                : "clamp(232px, 16vw, 292px) minmax(0, 1fr) clamp(280px, 16vw, 360px)",
            gap: "clamp(12px, 0.9vw, 18px)",
            alignItems: pantallaCompletaActiva ? "stretch" : "start",
            minHeight: pantallaCompletaActiva ? "100vh" : undefined,
            padding: pantallaCompletaActiva ? "12px" : undefined,
            background: pantallaCompletaActiva
              ? temaClaro
                ? "linear-gradient(135deg, #e2e8f0, #f8fafc)"
                : "linear-gradient(135deg, #020617, #0f172a)"
              : undefined,
            transition: mapaReajustando
              ? "none"
              : "grid-template-columns 140ms ease, padding 140ms ease, background 140ms ease",
            contain: pantallaCompletaActiva ? undefined : "layout paint",
          }}
        >
          {pantallaCompletaActiva && (
          <aside
            className="ce-panel-map-rail"
            onMouseEnter={() => setBarraExpandida(true)}
            onMouseLeave={() => setBarraExpandida(false)}
            style={{
              ...themedSurfaceStyle,
              width: barraExpandida ? "232px" : "66px",
              padding: "12px",
              boxSizing: "border-box",
              display: "grid",
              alignContent: "space-between",
              gap: "12px",
              overflow: "hidden",
              transition: "width 180ms ease, box-shadow 180ms ease",
              position: "sticky",
              top: "16px",
              minHeight: "calc(100vh - 24px)",
              zIndex: 5,
            }}
          >
            <div
              style={{
                display: "grid",
                gap: "10px",
                maxHeight: "calc(100vh - 118px)",
                overflowY: barraExpandida ? "auto" : "hidden",
                overflowX: "hidden",
                overscrollBehavior: "contain",
                paddingRight: barraExpandida ? "2px" : 0,
              }}
            >
              <div
                style={{
                  width: barraExpandida ? "100%" : "42px",
                  minWidth: "42px",
                  maxWidth: "100%",
                  height: "42px",
                  boxSizing: "border-box",
                  borderRadius: barraExpandida ? "17px" : "999px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: barraExpandida ? "flex-start" : "center",
                  padding: barraExpandida ? "0 13px" : 0,
                  justifySelf: barraExpandida ? "stretch" : "center",
                  background: temaClaro
                    ? "linear-gradient(135deg, rgba(219,234,254,0.92), rgba(255,255,255,0.84))"
                    : "linear-gradient(135deg, rgba(37,99,235,0.28), rgba(14,165,233,0.12))",
                  color: textoAzul,
                  border: bordeInterno,
                  fontSize: "12px",
                  fontWeight: 950,
                  letterSpacing: "0.6px",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  transition:
                    "width 180ms ease, border-radius 180ms ease, padding 180ms ease, justify-content 180ms ease",
                }}
              >
                <span
                  style={{
                    width: barraExpandida ? "10px" : "12px",
                    height: barraExpandida ? "10px" : "12px",
                    minWidth: barraExpandida ? "10px" : "12px",
                    borderRadius: "999px",
                    background: "#38bdf8",
                    boxShadow: "0 0 16px rgba(56,189,248,0.75)",
                    marginRight: barraExpandida ? "10px" : 0,
                    flexShrink: 0,
                    transition: "width 180ms ease, height 180ms ease, margin 180ms ease",
                  }}
                />
                {barraExpandida && t("Mapa operativo")}
              </div>

              {accionesBarra.map((accion) => {
                const activo =
                  accionActiva === accion.id ||
                  (accion.id === "capas" && modoMapa !== "calor") ||
                  (accion.id === "estandar" && tipoVistaMapa === "estandar") ||
                  (accion.id === "satelital" && tipoVistaMapa === "satelital") ||
                  (accion.id === "criticos" && filtros.criticidad === "CRITICO") ||
                  (accion.id === "abiertos" && filtros.estado === "ABIERTO") ||
                  (accion.id === "cerrados" && filtros.estado === "CERRADO") ||
                  (accion.id === "empresas" && (selectorEmpresasAbierto || Boolean(filtros.empresa)));
                const contenido = (
                  <>
                    <span
                      style={{
                        width: "38px",
                        minWidth: "38px",
                        height: "38px",
                        borderRadius: "14px",
                        display: "grid",
                        placeItems: "center",
                        color: activo ? "#ffffff" : textoAzul,
                        background: activo
                          ? "linear-gradient(135deg, #2563eb, #38bdf8)"
                          : temaClaro
                            ? "rgba(241,245,249,0.94)"
                            : "rgba(15,23,42,0.82)",
                        border: activo ? "1px solid rgba(125,211,252,0.62)" : bordeInterno,
                        boxShadow: activo ? "0 12px 26px rgba(37,99,235,0.24)" : "none",
                      }}
                    >
                      <IconoMapa tipo={accion.icono} />
                    </span>
                    <span
                      style={{
                        opacity: barraExpandida ? 1 : 0,
                        transform: barraExpandida ? "translateX(0)" : "translateX(-6px)",
                        transition: "opacity 150ms ease, transform 150ms ease",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {t(accion.etiqueta)}
                    </span>
                  </>
                );

                return (
                  <button
                    key={accion.id}
                    type="button"
                    onClick={() => ejecutarAccionBarra(accion.id)}
                    title={t(accion.etiqueta)}
                    style={{
                      minHeight: "44px",
                      borderRadius: "16px",
                      border: "none",
                      background: "transparent",
                      color: textoPrincipal,
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "3px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 900,
                      textAlign: "left",
                    }}
                  >
                    {contenido}
                  </button>
                );
              })}

              {selectorEmpresasAbierto && barraExpandida && (
                <div
                  style={{
                    borderRadius: "18px",
                    border: bordeInterno,
                    background: temaClaro
                      ? "rgba(248,250,252,0.94)"
                      : "rgba(15,23,42,0.86)",
                    padding: "10px",
                    display: "grid",
                    gap: "8px",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "8px",
                    }}
                  >
                    <div>
                      <div style={{ color: textoAzul, fontSize: "11px", fontWeight: 950 }}>
                        {t("Listado de empresas")}
                      </div>
                      <div style={{ marginTop: "2px", color: textoSuave, fontSize: "10px", fontWeight: 850 }}>
                        {t("Selecciona una empresa para filtrar el mapa")}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectorEmpresasAbierto(false)}
                      aria-label="Cerrar listado de empresas"
                      style={{
                        width: "26px",
                        height: "26px",
                        borderRadius: "10px",
                        border: bordeInterno,
                        background: fondoInterno,
                        color: textoAzul,
                        cursor: "pointer",
                        fontWeight: 950,
                        lineHeight: 1,
                      }}
                    >
                      ×
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setFiltros((actual) => ({ ...actual, empresa: "", gps: "todos" }));
                      setModoMapa("puntos");
                      setZonaSeleccionada(null);
                      setPuntoSeleccionado(null);
                      setMensaje("Vista general del mapa restablecida.");
                    }}
                    style={{
                      width: "100%",
                      minHeight: "34px",
                      borderRadius: "12px",
                      border: !filtros.empresa
                        ? "1px solid rgba(125,211,252,0.62)"
                        : bordeInterno,
                      background: !filtros.empresa
                        ? "linear-gradient(135deg, #2563eb, #38bdf8)"
                        : fondoInterno,
                      color: !filtros.empresa ? "#ffffff" : textoPrincipal,
                      cursor: "pointer",
                      padding: "7px 9px",
                      textAlign: "left",
                      fontSize: "11px",
                      fontWeight: 950,
                    }}
                  >
                    {t("Todas las empresas")}
                  </button>

                  <div
                    style={{
                      maxHeight: "240px",
                      overflowY: "auto",
                      overscrollBehavior: "contain",
                      display: "grid",
                      gap: "7px",
                      paddingRight: "3px",
                    }}
                  >
                    {empresasMapa.map((item) => {
                      const activa = filtros.empresa === item.empresa;

                      return (
                        <button
                          key={item.empresa}
                          type="button"
                          onClick={() => {
                            setFiltros((actual) => ({
                              ...actual,
                              empresa: item.empresa,
                              obra: "",
                              area: "",
                              criticidad: "",
                              estado: "",
                              tipoHallazgo: "",
                              fechaDesde: "",
                              fechaHasta: "",
                              gps: "todos",
                            }));
                            setModoMapa("puntos");
                            setZonaSeleccionada(null);
                            setPuntoSeleccionado(null);
                            setMensaje(
                              item.totalGps > 0
                                ? `Empresa seleccionada: ${item.empresa}`
                                : "Sin hallazgos GPS para esta empresa"
                            );
                          }}
                          style={{
                            width: "100%",
                            borderRadius: "13px",
                            border: activa
                              ? "1px solid rgba(125,211,252,0.62)"
                              : item.totalGps === 0
                                ? "1px solid rgba(248,113,113,0.28)"
                                : bordeInterno,
                            background: activa
                              ? "linear-gradient(135deg, #2563eb, #38bdf8)"
                              : item.totalGps === 0
                                ? temaClaro
                                  ? "rgba(254,226,226,0.72)"
                                  : "rgba(127,29,29,0.20)"
                                : fondoInterno,
                            color: activa ? "#ffffff" : textoPrincipal,
                            cursor: "pointer",
                            padding: "9px",
                            textAlign: "left",
                            display: "grid",
                            gap: "4px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 950,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.empresa}
                          </span>
                          <span
                            style={{
                              color: activa ? "rgba(255,255,255,0.78)" : textoSuave,
                              fontSize: "10px",
                              fontWeight: 850,
                            }}
                          >
                            {item.total} {t("hallazgos")} · {item.totalGps} GPS
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div
              style={{
                display: "grid",
                gap: "8px",
                padding: "10px 5px 4px",
                color: textoSuave,
                fontSize: "11px",
                fontWeight: 900,
                lineHeight: 1.25,
              }}
            >
              <span>{barraExpandida ? t("Hallazgos visibles") : hallazgosFiltrados.length}</span>
              {barraExpandida && (
                <span style={{ color: textoAzul }}>
                  {hallazgosFiltrados.length} · {resumenMapa.totalConGps} GPS real
                </span>
              )}
            </div>
          </aside>
          )}

          {!pantallaCompletaActiva && (
            <aside
              className="ce-panel-map-preview-actions"
              style={{
                ...themedSurfaceStyle,
                padding: "16px",
                display: "grid",
                gap: "14px",
                alignContent: "start",
                minHeight: "clamp(430px, 33vw, 560px)",
                background: fondoTarjeta,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "11px",
                    color: textoAzul,
                    fontWeight: 950,
                    letterSpacing: "0.7px",
                    textTransform: "uppercase",
                  }}
                >
                  {t("Panel territorial")}
                </div>
                <h2 style={{ margin: "7px 0 0", fontSize: "18px", lineHeight: 1.1, fontWeight: 950 }}>
                  {t("Mapa preventivo de faena")}
                </h2>
                <p style={{ margin: "7px 0 0", color: textoSuave, fontSize: "12px", lineHeight: 1.4, fontWeight: 750 }}>
                  {t("Selecciona filtros rapidos o abre el mapa operativo completo.")}
                </p>
              </div>

              <div style={{ display: "grid", gap: "8px" }}>
                {accionesVistaPrevia.map((accion) => {
                  const activo =
                    accion.id === "general"
                      ? !filtros.empresa &&
                        !filtros.obra &&
                        !filtros.area &&
                        !filtros.criticidad &&
                        !filtros.estado &&
                        !filtros.tipoHallazgo &&
                        !filtros.fechaDesde &&
                        !filtros.fechaHasta &&
                        filtros.gps === "todos" &&
                        modoMapa === "puntos"
                      : (accion.id === "criticos" && filtros.criticidad === "CRITICO") ||
                        (accion.id === "abiertos" && filtros.estado === "ABIERTO") ||
                        accionActiva === accion.id;

                  return (
                    <button
                      key={accion.id}
                      type="button"
                      onClick={() => {
                        ejecutarAccionBarra(accion.id);
                      }}
                      style={{
                        minHeight: "42px",
                        borderRadius: "15px",
                        border: activo || accion.destacado
                          ? "1px solid rgba(125,211,252,0.62)"
                          : bordeInterno,
                        background: activo || accion.destacado
                          ? "linear-gradient(135deg, #2563eb, #38bdf8)"
                          : fondoInterno,
                        color: activo || accion.destacado ? "#ffffff" : textoPrincipal,
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "8px 10px",
                        cursor: "pointer",
                        textAlign: "left",
                        fontSize: "12px",
                        fontWeight: 900,
                        boxShadow: activo || accion.destacado
                          ? "0 12px 26px rgba(37,99,235,0.22)"
                          : "none",
                      }}
                    >
                      <span
                        style={{
                          width: "30px",
                          minWidth: "30px",
                          height: "30px",
                          borderRadius: "12px",
                          display: "grid",
                          placeItems: "center",
                          background: activo || accion.destacado
                            ? "rgba(255,255,255,0.16)"
                            : temaClaro
                              ? "rgba(226,232,240,0.82)"
                              : "rgba(15,23,42,0.90)",
                        }}
                      >
                        <IconoMapa tipo={accion.icono} />
                      </span>
                      <span>{t(accion.etiqueta)}</span>
                    </button>
                  );
                })}
              </div>

              <div
                style={{
                  display: "grid",
                  gap: "8px",
                  borderRadius: "18px",
                  border: bordeInterno,
                  background: fondoInterno,
                  padding: "12px",
                }}
              >
                <div style={{ fontSize: "11px", color: textoAzul, fontWeight: 950 }}>
                  {t("Filtros activos")}
                </div>
                <div style={{ color: textoMedio, fontSize: "12px", lineHeight: 1.4, fontWeight: 750 }}>
                  {resumenFiltrosActivos()}
                </div>
              </div>

              <div style={{ display: "grid", gap: "8px" }}>
                {[
                  ["Empresa dominante", concentracionEmpresa?.[0] || t("Sin datos"), concentracionEmpresa?.[1] || 0],
                  ["Obra dominante", concentracionObra?.[0] || t("Sin datos"), concentracionObra?.[1] || 0],
                  ["Area dominante", concentracionArea?.[0] || t("Sin datos"), concentracionArea?.[1] || 0],
                ].map(([label, value, count]) => (
                  <div
                    key={String(label)}
                    style={{
                      borderRadius: "16px",
                      padding: "11px",
                      background: fondoInterno,
                      border: bordeInterno,
                    }}
                  >
                    <div style={{ fontSize: "10px", color: textoSuave, fontWeight: 900 }}>
                      {t(label as string)}
                    </div>
                    <div style={{ marginTop: "5px", fontSize: "13px", fontWeight: 950 }}>
                      {value}
                    </div>
                    <div style={{ marginTop: "2px", color: textoAzul, fontSize: "11px", fontWeight: 900 }}>
                      {count} {t("hallazgos")}
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          )}

          <section
            className="ce-panel-map-canvas-card"
            style={{
              ...themedSurfaceStyle,
              minHeight: pantallaCompletaActiva
                ? "clamp(680px, 50vw, 880px)"
                : "clamp(500px, 37vw, 640px)",
              height: pantallaCompletaActiva ? "calc(100vh - 24px)" : undefined,
              padding: "18px",
              display: "grid",
              gridTemplateRows: "auto minmax(0, 1fr) auto",
              gap: "14px",
              overflow: "hidden",
              transition: mapaReajustando
                ? "none"
                : "min-height 140ms ease, box-shadow 140ms ease, background 140ms ease",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                alignItems: "center",
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 950 }}>
                  {t("Lectura territorial preventiva")}
                </h2>
                <p style={{ margin: "5px 0 0", color: textoSuave, fontSize: "13px", fontWeight: 700 }}>
                  {t(mensaje)}
                </p>
              </div>
              {pantallaCompletaActiva ? (
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                  {[
                    ["Vista estandar", "estandar"],
                    ["Vista satelital", "satelital"],
                  ].map(([label, tipo]) => (
                    <button
                      key={tipo}
                      type="button"
                      onClick={() => cambiarTipoVistaMapa(tipo as TipoVistaMapa)}
                      style={{
                        minHeight: "34px",
                        borderRadius: "999px",
                        padding: "8px 10px",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background:
                          tipoVistaMapa === tipo
                            ? "linear-gradient(135deg, #2563eb, #38bdf8)"
                            : temaClaro
                              ? "rgba(248,250,252,0.88)"
                              : "rgba(15,23,42,0.78)",
                        border:
                          tipoVistaMapa === tipo
                            ? "1px solid rgba(125,211,252,0.62)"
                            : bordeInterno,
                        color: tipoVistaMapa === tipo ? "#ffffff" : textoAzul,
                        fontSize: "12px",
                        fontWeight: 950,
                        cursor: "pointer",
                      }}
                    >
                      {t(label)}
                    </button>
                  ))}
                  <span
                    style={{
                      minHeight: "34px",
                      minWidth: "58px",
                      borderRadius: "14px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: temaClaro ? "rgba(248,250,252,0.88)" : "rgba(15,23,42,0.78)",
                      border: bordeInterno,
                      color: textoAzul,
                      fontSize: "13px",
                      fontWeight: 950,
                    }}
                  >
                    {Math.round(zoomMapa * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => void salirPantallaCompleta()}
                    style={{
                      ...botonStyle("salir", true),
                      minHeight: "34px",
                      padding: "8px 12px",
                      borderRadius: "14px",
                      fontSize: "12px",
                      boxShadow: "0 12px 26px rgba(37,99,235,0.22)",
                    }}
                  >
                    {t("Salir de pantalla completa")}
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                  {[
                    ["Vista estandar", "#38bdf8", "estandar"],
                    ["Vista satelital", "#a78bfa", "satelital"],
                  ].map(([label, color, tipo]) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => cambiarTipoVistaMapa(tipo as TipoVistaMapa)}
                      style={{
                        minHeight: "34px",
                        borderRadius: "999px",
                        padding: "8px 10px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "7px",
                        background:
                          tipoVistaMapa === tipo
                            ? "linear-gradient(135deg, #2563eb, #38bdf8)"
                            : temaClaro
                              ? "rgba(248,250,252,0.86)"
                              : "rgba(15,23,42,0.72)",
                        border:
                          tipoVistaMapa === tipo
                            ? "1px solid rgba(125,211,252,0.62)"
                            : bordeInterno,
                        color: tipoVistaMapa === tipo ? "#ffffff" : textoMedio,
                        fontSize: "11px",
                        fontWeight: 900,
                        cursor: "pointer",
                      }}
                    >
                      <span
                        style={{
                          width: "7px",
                          height: "7px",
                          borderRadius: "999px",
                          background: color,
                          boxShadow: `0 0 14px ${color}`,
                        }}
                      />
                      {t(label)}
                    </button>
                  ))}
                  {[
                    ["Pines GPS reales", "#22c55e"],
                    ["Sector satelital", "#f97316"],
                  ].map(([label, color]) => (
                    <span
                      key={label}
                      style={{
                        minHeight: "34px",
                        borderRadius: "999px",
                        padding: "8px 10px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "7px",
                        background: temaClaro ? "rgba(248,250,252,0.86)" : "rgba(15,23,42,0.72)",
                        border: bordeInterno,
                        color: textoMedio,
                        fontSize: "11px",
                        fontWeight: 900,
                      }}
                    >
                      <span
                        style={{
                          width: "7px",
                          height: "7px",
                          borderRadius: "999px",
                          background: color,
                          boxShadow: `0 0 14px ${color}`,
                        }}
                      />
                      {t(label)}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div
              className="ce-panel-map-canvas"
              style={{
                position: "relative",
                borderRadius: "28px",
                minHeight: pantallaCompletaActiva
                  ? "clamp(520px, 38vw, 720px)"
                  : "clamp(350px, 27vw, 500px)",
                height: pantallaCompletaActiva ? "100%" : undefined,
                overflow: "hidden",
                border: "1px solid rgba(125,211,252,0.18)",
                backgroundColor: temaClaro ? "#e2e8f0" : "#0f172a",
                backgroundImage: "none",
                backgroundSize: "auto",
                backgroundPosition: "center",
                boxShadow: "inset 0 0 80px rgba(14,165,233,0.10)",
                transition: mapaReajustando ? "none" : "min-height 140ms ease",
              }}
            >
              {GOOGLE_MAPS_CONFIGURADO ? (
                <MapaGpsGoogle
                  apiKey={GOOGLE_MAPS_API_KEY}
                  puntos={puntosMapaActivos}
                  zonas={zonasMapaActivas}
                  modo={modoMapa}
                  tipoVista={tipoVistaMapa}
                  zoomControlado={zoomMapa}
                  pantallaCompleta={pantallaCompletaActiva}
                  temaClaro={temaClaro}
                  onSeleccionarPunto={(punto) => {
                    setPuntoSeleccionado(punto);
                    setZonaSeleccionada(null);
                  }}
                  onSeleccionarZona={(zona) => {
                    setZonaSeleccionada(zona);
                    setPuntoSeleccionado(null);
                  }}
                />
              ) : (
                <div
                  role="status"
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "grid",
                    placeItems: "center",
                    padding: "24px",
                    textAlign: "center",
                    color: temaClaro ? "#1e3a8a" : "#dbeafe",
                    background: temaClaro ? "rgba(255,255,255,0.9)" : "rgba(2,6,23,0.8)",
                    fontSize: "13px",
                    fontWeight: 850,
                  }}
                >
                  Falta configurar la clave restringida de Google Maps para esta plataforma.
                </div>
              )}

              {mapaReajustando && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 8,
                    display: "grid",
                    placeItems: "center",
                    background: temaClaro
                      ? "linear-gradient(135deg, rgba(248,250,252,0.96), rgba(226,232,240,0.88))"
                      : "linear-gradient(135deg, rgba(2,6,23,0.92), rgba(15,23,42,0.84))",
                    color: textoAzul,
                    fontSize: "12px",
                    fontWeight: 950,
                    letterSpacing: "0.4px",
                    textTransform: "uppercase",
                  }}
                >
                  {t("Ajustando mapa")}
                </div>
              )}

              {!cargando && puntosMapaActivos.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    left: "18px",
                    top: "18px",
                    zIndex: 4,
                    maxWidth: "360px",
                    borderRadius: "18px",
                    background: temaClaro
                      ? "rgba(255,255,255,0.90)"
                      : "rgba(15,23,42,0.82)",
                    border: "1px solid rgba(96,165,250,0.30)",
                    boxShadow: "0 18px 42px rgba(15,23,42,0.14)",
                    padding: "12px 14px",
                    backdropFilter: "blur(10px)",
                    color: textoPrincipal,
                  }}
                >
                  <div style={{ color: textoAzul, fontSize: "12px", fontWeight: 950 }}>
                    {t("Coordenadas GPS reales")}
                  </div>
                  <div style={{ marginTop: "5px", color: textoMedio, fontSize: "12px", lineHeight: 1.35, fontWeight: 750 }}>
                    {puntosMapaActivos.length} {t("hallazgos ubicados en terreno")}
                  </div>
                </div>
              )}

              {cargando && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "grid",
                    placeItems: "center",
                    color: textoAzul,
                    fontWeight: 900,
                    background: temaClaro ? "rgba(255,255,255,0.68)" : "rgba(2,6,23,0.52)",
                  }}
                >
                  {t("Cargando lectura territorial...")}
                </div>
              )}

              {!cargando && filtros.empresa && empresaSeleccionadaMapa?.totalGps === 0 && (
                <div
                  style={{
                    position: "absolute",
                    inset: "56px",
                    zIndex: 4,
                    borderRadius: "26px",
                    background: temaClaro
                      ? "rgba(255,255,255,0.94)"
                      : "rgba(15,23,42,0.88)",
                    border: "1px solid rgba(248,113,113,0.32)",
                    boxShadow: "0 22px 54px rgba(15,23,42,0.18)",
                    display: "grid",
                    placeItems: "center",
                    textAlign: "center",
                    padding: "28px",
                    color: textoPrincipal,
                  }}
                >
                  <div>
                    <div style={{ color: "#f87171", fontSize: "24px", fontWeight: 950 }}>
                      {t("Sin hallazgos GPS para esta empresa")}
                    </div>
                    <p
                      style={{
                        maxWidth: "560px",
                        margin: "12px auto 0",
                        color: textoMedio,
                        fontSize: "14px",
                        lineHeight: 1.5,
                        fontWeight: 750,
                      }}
                    >
                      {filtros.empresa}
                    </p>
                  </div>
                </div>
              )}

              {sinHallazgosRecientesGps && (
                <div
                  style={{
                    position: "absolute",
                    inset: "56px",
                    zIndex: 4,
                    borderRadius: "26px",
                    background: temaClaro
                      ? "rgba(255,255,255,0.94)"
                      : "rgba(15,23,42,0.88)",
                    border: "1px solid rgba(56,189,248,0.30)",
                    boxShadow: "0 22px 54px rgba(15,23,42,0.18)",
                    display: "grid",
                    placeItems: "center",
                    textAlign: "center",
                    padding: "28px",
                    color: textoPrincipal,
                  }}
                >
                  <div>
                    <div style={{ color: textoAzul, fontSize: "24px", fontWeight: 950 }}>
                      {t("No hay hallazgos recientes con ubicación GPS.")}
                    </div>
                    <p
                      style={{
                        maxWidth: "560px",
                        margin: "12px auto 0",
                        color: textoMedio,
                        fontSize: "14px",
                        lineHeight: 1.5,
                        fontWeight: 750,
                      }}
                    >
                      {t("Últimos 7 días")} · GPS
                    </p>
                  </div>
                </div>
              )}

              {!cargando &&
                puntosMapaActivos.length === 0 &&
                !(filtros.empresa && empresaSeleccionadaMapa?.totalGps === 0) &&
                !sinHallazgosRecientesGps && (
                <div
                  style={{
                    position: "absolute",
                    inset: "56px",
                    borderRadius: "26px",
                    background: fondoInterno,
                    border: "1px solid rgba(148,163,184,0.20)",
                    display: "grid",
                    placeItems: "center",
                    textAlign: "center",
                    padding: "28px",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "46px", fontWeight: 950, color: "#38bdf8" }}>
                      {t("Mapa ejecutivo")}
                    </div>
                    <p
                      style={{
                        maxWidth: "560px",
                        margin: "14px auto 0",
                        color: textoMedio,
                        fontSize: "15px",
                        lineHeight: 1.5,
                        fontWeight: 700,
                      }}
                    >
                      {t("No existen coordenadas GPS reales para los hallazgos filtrados. Los reportes sin ubicación no se muestran en el mapa.")}
                    </p>
                  </div>
                </div>
              )}

              {pantallaCompletaActiva && puntoSeleccionado && (
                <aside
                  style={{
                    position: "absolute",
                    right: "18px",
                    bottom: "76px",
                    zIndex: 6,
                    width: "min(360px, calc(100% - 112px))",
                    borderRadius: "22px",
                    background: temaClaro
                      ? "rgba(255,255,255,0.94)"
                      : "rgba(15,23,42,0.88)",
                    border: "1px solid rgba(96,165,250,0.34)",
                    boxShadow: "0 22px 54px rgba(15,23,42,0.28)",
                    padding: "16px",
                    backdropFilter: "blur(14px)",
                    color: textoPrincipal,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
                    <div>
                      <div style={{ color: textoAzul, fontSize: "12px", fontWeight: 950 }}>
                        {t("Detalle del hallazgo")}
                      </div>
                      <strong style={{ display: "block", marginTop: "4px", fontSize: "17px" }}>
                        {puntoSeleccionado.codigo}
                      </strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPuntoSeleccionado(null)}
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "12px",
                        border: bordeInterno,
                        background: fondoInterno,
                        color: textoAzul,
                        cursor: "pointer",
                        fontWeight: 950,
                      }}
                      aria-label="Cerrar detalle"
                    >
                      ×
                    </button>
                  </div>
                  <div style={{ marginTop: "13px", display: "grid", gap: "8px", fontSize: "12px" }}>
                    {[
                      [t("Empresa"), puntoSeleccionado.empresa || t("Sin datos")],
                      [t("Obra / faena"), puntoSeleccionado.obra || hallazgoSeleccionado?.obra || t("Sin obra")],
                      [t("Fecha reporte"), formatearFechaMapa(hallazgoSeleccionado?.fechaHoraReporteISO || hallazgoSeleccionado?.fechaReporte) || t("Sin fecha")],
                      [t("Criticidad"), traducirCriticidad(puntoSeleccionado.criticidad)],
                      [t("Estado"), traducirEstado(puntoSeleccionado.estado)],
                      [t("Coordenadas"), formatearCoordenadas(puntoSeleccionado)],
                      [t("Precision GPS"), typeof puntoSeleccionado.precisionGps === "number" ? `± ${Math.round(puntoSeleccionado.precisionGps)} m` : t("Sin datos")],
                      [t("Tipo de hallazgo"), hallazgoSeleccionado?.tipoHallazgo || t("Sin datos")],
                      [t("Area"), puntoSeleccionado.area || hallazgoSeleccionado?.area || t("Sin area")],
                      [t("Responsable"), hallazgoSeleccionado?.seguimientoCierre?.responsable?.nombre || t("Sin responsable")],
                    ].map(([label, value]) => (
                      <div
                        key={String(label)}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "118px minmax(0, 1fr)",
                          gap: "10px",
                          alignItems: "baseline",
                        }}
                      >
                        <span style={{ color: textoSuave, fontWeight: 900 }}>{label}</span>
                        <span style={{ color: textoPrincipal, fontWeight: 850 }}>{value}</span>
                      </div>
                    ))}
                    <p style={{ margin: "5px 0 0", color: textoMedio, lineHeight: 1.42, fontWeight: 750 }}>
                      {puntoSeleccionado.descripcionResumen || hallazgoSeleccionado?.descripcion || t("Sin descripcion")}
                    </p>
                  </div>
                </aside>
              )}

              <div
                style={{
                  position: "absolute",
                  left: "18px",
                  bottom: "18px",
                  zIndex: 4,
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                {criticidades.map((criticidad) => (
                  <span
                    key={criticidad}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "7px",
                      borderRadius: "999px",
                      padding: "8px 10px",
                      background: fondoInterno,
                      border: "1px solid rgba(148,163,184,0.20)",
                      fontSize: "11px",
                      fontWeight: 900,
                      color: textoPrincipal,
                    }}
                  >
                    <span
                      style={{
                        width: "9px",
                        height: "9px",
                        borderRadius: "999px",
                        background: colorCriticidad(criticidad),
                      }}
                    />
                    {traducirCriticidad(criticidad)}
                  </span>
                ))}
              </div>
            </div>

          </section>

          {!pantallaCompletaActiva && (
          <aside className="ce-panel-map-insights" style={{ ...themedSurfaceStyle, padding: "18px", display: "grid", gap: "14px" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 950 }}>
                {t("Zonas y lectura ejecutiva")}
              </h2>
              <p style={{ margin: "6px 0 0", color: textoSuave, fontSize: "12px", lineHeight: 1.45, fontWeight: 700 }}>
                {t("Concentracion territorial para priorizar verificacion en terreno.")}
              </p>
            </div>

            <div
              style={{
                borderRadius: "20px",
                padding: "15px",
                background:
                  temaClaro ? "rgba(254,226,226,0.72)" : "linear-gradient(145deg, rgba(239,68,68,0.18), rgba(15,23,42,0.82))",
                border: "1px solid rgba(239,68,68,0.28)",
              }}
            >
              <div style={{ fontSize: "12px", color: temaClaro ? "#991b1b" : "#fecaca", fontWeight: 900 }}>
                {t("Mensaje preventivo")}
              </div>
              <div style={{ marginTop: "8px", fontSize: "14px", lineHeight: 1.45, fontWeight: 800 }}>
                {puntosMapaActivos.length > 0
                  ? t("Priorizar recorridos en zonas con acumulacion critica o alta. El mapa identifica patrones preventivos; no predice accidentes.")
                  : t("Activar captura GPS en reportes de terreno para habilitar analisis territorial y mapas de calor reales.")}
              </div>
            </div>

            <div style={{ display: "grid", gap: "10px" }}>
              {[
                ["Empresa dominante", concentracionEmpresa?.[0] || t("Sin datos"), concentracionEmpresa?.[1] || 0],
                ["Obra dominante", concentracionObra?.[0] || t("Sin datos"), concentracionObra?.[1] || 0],
                ["Area dominante", concentracionArea?.[0] || t("Sin datos"), concentracionArea?.[1] || 0],
              ].map(([label, value, count]) => (
                <div
                  key={String(label)}
                  style={{
                    borderRadius: "18px",
                    padding: "13px",
                    background: fondoInterno,
                    border: bordeInterno,
                  }}
                >
                  <div style={{ fontSize: "11px", color: textoSuave, fontWeight: 900 }}>
                    {t(label as string)}
                  </div>
                  <div style={{ marginTop: "5px", fontSize: "15px", fontWeight: 950 }}>
                    {value}
                  </div>
                  <div style={{ marginTop: "3px", color: "#38bdf8", fontSize: "12px", fontWeight: 900 }}>
                    {count} {t("hallazgos")}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                borderRadius: "20px",
                padding: "14px",
                background: fondoInterno,
                border: bordeInterno,
                minHeight: "160px",
              }}
            >
              <div style={{ fontSize: "12px", color: textoAzul, fontWeight: 950 }}>
                {t("Detalle seleccionado")}
              </div>
              {puntoSeleccionado ? (
                <div style={{ marginTop: "10px", display: "grid", gap: "7px" }}>
                  <strong style={{ color: colorCriticidad(puntoSeleccionado.criticidad) }}>
                    {puntoSeleccionado.codigo} · {traducirCriticidad(puntoSeleccionado.criticidad)}
                  </strong>
                  <span style={{ color: textoMedio, fontSize: "13px", lineHeight: 1.4 }}>
                    {puntoSeleccionado.descripcionResumen}
                  </span>
                  <span style={{ color: textoSuave, fontSize: "12px", fontWeight: 800 }}>
                    {puntoSeleccionado.empresa} · {puntoSeleccionado.obra} · {puntoSeleccionado.area}
                  </span>
                  <span style={{ color: textoSuave, fontSize: "12px", fontWeight: 800 }}>
                    {traducirEstado(puntoSeleccionado.estado)} · {hallazgoSeleccionado?.tipoHallazgo || t("Tipo de hallazgo")} · {formatearFechaMapa(hallazgoSeleccionado?.fechaHoraReporteISO || hallazgoSeleccionado?.fechaReporte) || t("Sin fecha")}
                  </span>
                  <span style={{ color: textoAzul, fontSize: "12px", fontWeight: 900 }}>
                    {t("Coordenadas")}: {formatearCoordenadas(puntoSeleccionado)}
                    {typeof puntoSeleccionado.precisionGps === "number"
                      ? ` · ${t("Precision GPS")}: ± ${Math.round(puntoSeleccionado.precisionGps)} m`
                      : ""}
                  </span>
                </div>
              ) : zonaSeleccionada ? (
                <div style={{ marginTop: "10px", display: "grid", gap: "7px" }}>
                  <strong style={{ color: colorCriticidad(zonaSeleccionada.criticidadMaxima) }}>
                    {t("Zona")} {zonaSeleccionada.clave}
                  </strong>
                  <span style={{ color: textoMedio, fontSize: "13px", lineHeight: 1.4 }}>
                    {zonaSeleccionada.total} {t("hallazgos")}, {zonaSeleccionada.criticosAltos} {t("criticos/altos")}.
                  </span>
                  <span style={{ color: textoSuave, fontSize: "12px", fontWeight: 800 }}>
                    {t("Codigos")}: {zonaSeleccionada.codigos.slice(0, 4).join(", ")}
                  </span>
                </div>
              ) : (
                <p style={{ margin: "10px 0 0", color: textoSuave, fontSize: "13px", lineHeight: 1.45, fontWeight: 700 }}>
                  {t("Selecciona un punto o zona caliente para revisar informacion territorial.")}
                </p>
              )}
            </div>

            <div style={{ display: "grid", gap: "9px" }}>
              <div style={{ fontSize: "12px", color: textoAzul, fontWeight: 950 }}>
                {t("Zonas relevantes")}
              </div>
              {(zonasCriticas.length ? zonasCriticas : zonasMapaActivas)
                .slice(0, 5)
                .map((zona) => (
                  <button
                    key={zona.clave}
                    type="button"
                    onClick={() => {
                      activarBoton(`lista-${zona.clave}`);
                      setZonaSeleccionada(zona);
                      setPuntoSeleccionado(null);
                    }}
                    style={{
                      ...botonStyle(`lista-${zona.clave}`),
                      justifyContent: "space-between",
                      textAlign: "left",
                    }}
                  >
                    <span>{zona.clave}</span>
                    <span style={{ color: colorCriticidad(zona.criticidadMaxima) }}>
                      {zona.total}
                    </span>
                  </button>
                ))}
              {zonasMapaActivas.length === 0 && (
                <div style={{ color: textoSuave, fontSize: "13px", fontWeight: 750 }}>
                  {t("Sin zonas GPS suficientes para listar.")}
                </div>
              )}
            </div>
          </aside>
          )}
        </section>
      </div>
    </main>
  );
}
