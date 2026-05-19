"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactElement } from "react";
import {
  analizarMapaGpsHallazgos,
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

declare global {
  interface Window {
    google?: {
      maps?: {
        Map: new (
          element: HTMLElement,
          options: Record<string, unknown>
        ) => GoogleMapInstance;
        Marker: new (options: Record<string, unknown>) => GoogleMapMarker;
        LatLngBounds: new () => GoogleLatLngBounds;
      };
    };
  }
}

type GoogleMapInstance = {
  setMapTypeId: (mapTypeId: string) => void;
  setZoom: (zoom: number) => void;
  fitBounds: (bounds: GoogleLatLngBounds) => void;
  setCenter: (center: { lat: number; lng: number }) => void;
};

type GoogleMapMarker = {
  setMap: (map: GoogleMapInstance | null) => void;
};

type GoogleLatLngBounds = {
  extend: (point: { lat: number; lng: number }) => void;
};

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
  | "criticidad"
  | "mas-criticos"
  | "menos-criticos"
  | "cerrados"
  | "empresas"
  | "obras"
  | "recientes"
  | "vencidos"
  | "capas"
  | "estandar"
  | "satelital"
  | "zoom-mas"
  | "zoom-menos"
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

const estados: EstadoHallazgoCentral[] = [
  "REPORTADO",
  "ABIERTO",
  "EN_SEGUIMIENTO",
  "CERRADO",
  "ANULADO",
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

const inputStyle: CSSProperties = {
  width: "100%",
  minHeight: "44px",
  borderRadius: "14px",
  border: "1px solid rgba(148,163,184,0.22)",
  background: "rgba(15,23,42,0.76)",
  color: "#e5e7eb",
  padding: "0 12px",
  fontSize: "13px",
  fontWeight: 750,
  outline: "none",
  colorScheme: "dark",
};

const GOOGLE_MAPS_SCRIPT_ID = "ce-google-maps-js-api";
const GOOGLE_MAPS_API_KEY = (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "").trim();
const GOOGLE_MAPS_CONFIGURADO = /^AIza[0-9A-Za-z_-]{20,}$/.test(
  GOOGLE_MAPS_API_KEY
);

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
  "Vista territorial preparada con fuente local y fallback seguro.": "Territorial view ready with local source and safe fallback.",
  "Vista actualizada con hallazgos disponibles para analisis territorial.": "View updated with findings available for territorial analysis.",
  "Se uso fallback local para mantener disponible el mapa ejecutivo.": "Local fallback was used to keep the executive map available.",
  "Mapa caliente activo: intensidad por concentracion y criticidad.": "Heat map active: intensity by concentration and severity.",
  "Vista de zonas criticas activa: foco en criticidad alta y abierta.": "Critical zones view active: focus on high/open severity.",
  "Vista de puntos activa: lectura individual de reportes GPS.": "Points view active: individual GPS report review.",
  "Filtros limpiados. Vista territorial general restablecida.": "Filters cleared. General territorial view restored.",
  "Filtros aplicados sobre la vista territorial.": "Filters applied to territorial view.",
  "Cargando lectura territorial...": "Loading territorial review...",
  "Plataforma Hallazgos": "Findings Platform",
  "Mapa GPS de Hallazgos": "GPS Findings Map",
  "Lectura preventiva territorial para identificar concentracion de hallazgos, zonas calientes, criticidad geografica y focos de accion en terreno.": "Preventive territorial review to identify finding concentration, hot zones, geographic severity and field action focus.",
  "Volver al panel ejecutivo": "Back to executive dashboard",
  "Actualizar vista": "Refresh view",
  "Abrir pantalla completa": "Full screen map",
  "Pantalla completa preparada. En la version futura se conectara a mapa operacional dedicado.": "Full screen ready. A dedicated operational map will be connected in a future version.",
  "Pantalla completa no disponible en este navegador. La vista previa queda activa.": "Full screen is not available in this browser. The preview remains active.",
  "Vista estandar": "Standard view",
  "Vista satelital real": "Real satellite view",
  "Proveedor Google Maps no configurado": "Google Maps provider not configured",
  "Configura NEXT_PUBLIC_GOOGLE_MAPS_API_KEY para activar mapa estandar y satelital/hibrido real.": "Configure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable the real standard and satellite/hybrid map.",
  "Proveedor real pendiente": "Real provider pending",
  "La vista previa mantiene lectura ejecutiva preparada. Configura NEXT_PUBLIC_GOOGLE_MAPS_API_KEY para activar Google Maps real en pantalla completa.": "The preview keeps a prepared executive review. Configure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable real Google Maps in full screen.",
  "Mapa real satelital listo para conectar": "Real satellite map ready to connect",
  "Proveedor de mapa no disponible": "Map provider unavailable",
  "No se pudo cargar Google Maps. Revisa la API key, dominios autorizados y facturacion.": "Google Maps could not be loaded. Check the API key, authorized domains and billing.",
  "Clusters preparados": "Clusters ready",
  "Marcadores compactos": "Compact markers",
  "Vista preparada / simulacion visual": "Prepared view / visual simulation",
  "Visualizacion preparada con datos disponibles; no representa coordenadas reales.": "Prepared visualization with available data; it does not represent real coordinates.",
  "Simulacion visual territorial": "Territorial visual simulation",
  "Mapa preparado": "Prepared map",
  "Puntos preparados": "Prepared points",
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
  "Filtro por criticidad": "Filter by severity",
  "Mas criticos": "Most critical",
  "Menos criticos": "Least critical",
  Cerrados: "Closed",
  Empresas: "Companies",
  "Obras/areas": "Sites/areas",
  Recientes: "Recent",
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
  "Criticidad critica y alta": "Critical and high severity",
  "Criticidad media y baja": "Medium and low severity",
  "Concentracion por empresa": "Company concentration",
  "Concentracion por obra y area": "Site and area concentration",
  "Estados abiertos y en seguimiento": "Open and in-follow-up status",
  "Reportes recientes": "Recent reports",
  "Hallazgos vencidos": "Overdue findings",
  "Capas territoriales alternadas.": "Territorial layers toggled.",
  "Vista general del mapa restablecida.": "General map view restored.",
  "Filtro rapido aplicado por criticidad critica y alta.": "Quick filter applied for critical and high severity.",
  "Foco en puntos de mayor criticidad.": "Focus on highest-severity points.",
  "Foco en hallazgos de menor criticidad.": "Focus on lower-severity findings.",
  "Filtro aplicado a hallazgos cerrados.": "Filter applied to closed findings.",
  "Lectura por empresas destacada.": "Company review highlighted.",
  "Lectura por obras y areas destacada.": "Site and area review highlighted.",
  "Filtro por estados activos aplicado.": "Active status filter applied.",
  "Lectura de hallazgos recientes aplicada.": "Recent findings review applied.",
  "Revision de vencidos aplicada.": "Overdue review applied.",
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

function resumirDescripcionMapa(descripcion: string) {
  const limpia = descripcion.trim();
  return limpia.length > 120 ? `${limpia.slice(0, 117)}...` : limpia;
}

function pesoCriticidadVisual(criticidad: CriticidadHallazgoCentral) {
  if (criticidad === "CRITICO") return 4;
  if (criticidad === "ALTO") return 3;
  if (criticidad === "MEDIO") return 2;
  return 1;
}

function prepararPuntosVisualesMapa(hallazgos: HallazgoCentral[]) {
  const matrizBase = [
    [104.2, 101.4],
    [102.8, 103.8],
    [105.9, 104.9],
    [100.7, 106.2],
    [103.6, 108.1],
    [107.1, 102.8],
    [101.6, 109.4],
    [106.4, 107.3],
    [108.0, 105.1],
    [104.9, 110.2],
  ];
  const grupoPosicion = new Map<string, number>();

  return hallazgos.map((hallazgo, index): PuntoMapaGpsHallazgo => {
    const claveGrupo = `${hallazgo.empresa || "SIN_EMPRESA"}-${hallazgo.obra || "SIN_OBRA"}-${hallazgo.area || "SIN_AREA"}`;
    const grupo = grupoPosicion.get(claveGrupo) ?? grupoPosicion.size;
    grupoPosicion.set(claveGrupo, grupo);
    const base = matrizBase[grupo % matrizBase.length];
    const desplazamiento = ((index % 4) - 1.5) * 0.18;
    const severidad = pesoCriticidadVisual(hallazgo.criticidad) * 0.08;

    return {
      id: hallazgo.id,
      codigo: hallazgo.codigo,
      latitud: base[0] + desplazamiento + severidad,
      longitud: base[1] - desplazamiento - severidad,
      estadoGeolocalizacion: "vista_preparada",
      empresa: hallazgo.empresa,
      obra: hallazgo.obra,
      area: hallazgo.area,
      criticidad: hallazgo.criticidad,
      estado: hallazgo.estado,
      descripcionResumen: resumirDescripcionMapa(hallazgo.descripcion),
    };
  });
}

function prepararZonasVisualesMapa(puntos: PuntoMapaGpsHallazgo[]) {
  const zonas = new Map<
    string,
    {
      latitudTotal: number;
      longitudTotal: number;
      total: number;
      criticosAltos: number;
      criticidadMaxima: CriticidadHallazgoCentral;
      codigos: string[];
    }
  >();

  for (const punto of puntos) {
    const clave = `${punto.empresa || "Sin empresa"} · ${punto.area || punto.obra || "General"}`;
    const actual =
      zonas.get(clave) ||
      {
        latitudTotal: 0,
        longitudTotal: 0,
        total: 0,
        criticosAltos: 0,
        criticidadMaxima: "BAJO" as CriticidadHallazgoCentral,
        codigos: [],
      };

    actual.latitudTotal += punto.latitud;
    actual.longitudTotal += punto.longitud;
    actual.total += 1;
    actual.criticosAltos +=
      punto.criticidad === "CRITICO" || punto.criticidad === "ALTO" ? 1 : 0;
    actual.criticidadMaxima =
      pesoCriticidadVisual(punto.criticidad) >
      pesoCriticidadVisual(actual.criticidadMaxima)
        ? punto.criticidad
        : actual.criticidadMaxima;
    actual.codigos.push(punto.codigo);
    zonas.set(clave, actual);
  }

  return Array.from(zonas.entries())
    .map(([clave, zona]): CeldaMapaCalorHallazgo => ({
      clave,
      latitudPromedio: zona.latitudTotal / zona.total,
      longitudPromedio: zona.longitudTotal / zona.total,
      total: zona.total,
      criticosAltos: zona.criticosAltos,
      criticidadMaxima: zona.criticidadMaxima,
      codigos: zona.codigos,
    }))
    .sort((a, b) => b.total + b.criticosAltos - (a.total + a.criticosAltos));
}

function filtrarHallazgos(hallazgos: HallazgoCentral[], filtros: FiltrosVista) {
  return hallazgos.filter((hallazgo) => {
    const fecha = new Date(
      hallazgo.fechaHoraReporteISO || hallazgo.fechaCreacion || hallazgo.fechaReporte
    );
    const tieneGps =
      typeof hallazgo.geolocalizacion?.latitud === "number" &&
      typeof hallazgo.geolocalizacion.longitud === "number";

    if (filtros.empresa && hallazgo.empresa !== filtros.empresa) return false;
    if (filtros.obra && hallazgo.obra !== filtros.obra) return false;
    if (filtros.area && hallazgo.area !== filtros.area) return false;
    if (filtros.criticidad && hallazgo.criticidad !== filtros.criticidad) return false;
    if (filtros.estado && hallazgo.estado !== filtros.estado) return false;
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
  const googleMapContainerRef = useRef<HTMLDivElement | null>(null);
  const googleMapInstanceRef = useRef<GoogleMapInstance | null>(null);
  const googleMarkersRef = useRef<GoogleMapMarker[]>([]);
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
    : "linear-gradient(145deg, rgba(15,23,42,0.82), rgba(30,41,59,0.56))";
  const fondoInterno = temaClaro ? "rgba(248,250,252,0.92)" : "rgba(15,23,42,0.72)";
  const bordeInterno = temaClaro
    ? "1px solid rgba(100,116,139,0.20)"
    : "1px solid rgba(148,163,184,0.18)";
  const [hallazgos, setHallazgos] = useState<HallazgoCentral[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtros, setFiltros] = useState<FiltrosVista>(filtrosIniciales);
  const [modoMapa, setModoMapa] = useState<ModoMapa>("calor");
  const [accionActiva, setAccionActiva] = useState("");
  const [mensaje, setMensaje] = useState("Vista territorial preparada con fuente local y fallback seguro.");
  const [zonaSeleccionada, setZonaSeleccionada] = useState<CeldaMapaCalorHallazgo | null>(null);
  const [puntoSeleccionado, setPuntoSeleccionado] = useState<PuntoMapaGpsHallazgo | null>(null);
  const [barraExpandida, setBarraExpandida] = useState(false);
  const [tipoVistaMapa, setTipoVistaMapa] = useState<TipoVistaMapa>("estandar");
  const [zoomMapa, setZoomMapa] = useState(1);
  const [pantallaCompletaActiva, setPantallaCompletaActiva] = useState(false);
  const [googleMapsListo, setGoogleMapsListo] = useState(false);
  const [googleMapsError, setGoogleMapsError] = useState(false);

  async function cargarDatos() {
    setCargando(true);
    try {
      const datosPanel = await cargarHallazgosPanelConFuentesOpcionales(hallazgosMock);
      const centrales = datosPanel.map((hallazgo) =>
        convertirPanelACentral(hallazgo as HallazgoPanelExtendido)
      );
      setHallazgos(centrales);
      setMensaje("Vista actualizada con hallazgos disponibles para analisis territorial.");
    } catch (error) {
      console.warn("No se pudo cargar la vista de mapa GPS.", error);
      setHallazgos(hallazgosMock.map((hallazgo) => convertirPanelACentral(hallazgo)));
      setMensaje("Se uso fallback local para mantener disponible el mapa ejecutivo.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    const sincronizarPantallaCompleta = () => {
      setPantallaCompletaActiva(document.fullscreenElement === mapaOperativoRef.current);
      if (document.fullscreenElement !== mapaOperativoRef.current) {
        setBarraExpandida(false);
      }
    };

    document.addEventListener("fullscreenchange", sincronizarPantallaCompleta);
    return () => document.removeEventListener("fullscreenchange", sincronizarPantallaCompleta);
  }, []);

  useEffect(() => {
    if (!GOOGLE_MAPS_CONFIGURADO) {
      setGoogleMapsListo(false);
      setGoogleMapsError(false);
      return;
    }
    if (window.google?.maps?.Map) {
      setGoogleMapsListo(true);
      setGoogleMapsError(false);
      return;
    }

    const scriptExistente = document.getElementById(GOOGLE_MAPS_SCRIPT_ID) as
      | HTMLScriptElement
      | null;

    if (scriptExistente) {
      const resolverCarga = () => {
        setGoogleMapsListo(Boolean(window.google?.maps?.Map));
        setGoogleMapsError(!window.google?.maps?.Map);
      };
      scriptExistente.addEventListener("load", resolverCarga, { once: true });
      scriptExistente.addEventListener("error", () => setGoogleMapsError(true), {
        once: true,
      });
      return () => scriptExistente.removeEventListener("load", resolverCarga);
    }

    const script = document.createElement("script");
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      GOOGLE_MAPS_API_KEY
    )}&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setGoogleMapsListo(Boolean(window.google?.maps?.Map));
      setGoogleMapsError(!window.google?.maps?.Map);
    };
    script.onerror = () => setGoogleMapsError(true);
    document.head.appendChild(script);
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

  const resumenMapa = useMemo(
    () => analizarMapaGpsHallazgos(hallazgosFiltrados),
    [hallazgosFiltrados]
  );

  const usarVistaPreparada =
    !cargando && hallazgosFiltrados.length > 0 && resumenMapa.totalConGps < 2;
  const puntosPreparados = useMemo(
    () => prepararPuntosVisualesMapa(hallazgosFiltrados),
    [hallazgosFiltrados]
  );
  const zonasPreparadas = useMemo(
    () => prepararZonasVisualesMapa(puntosPreparados),
    [puntosPreparados]
  );
  const puntosMapaActivos = usarVistaPreparada ? puntosPreparados : resumenMapa.puntos;
  const zonasMapaActivas = usarVistaPreparada ? zonasPreparadas : resumenMapa.mapaCalor;
  const usarProveedorGoogle = GOOGLE_MAPS_CONFIGURADO;
  const usarMapaGoogleReal =
    usarProveedorGoogle &&
    googleMapsListo &&
    !googleMapsError;
  const mostrarMapaPreparado = !usarProveedorGoogle;

  const puntosVisibles = useMemo(() => {
    if (modoMapa === "zonas") {
      return puntosMapaActivos.filter(
        (punto) => punto.criticidad === "CRITICO" || punto.criticidad === "ALTO"
      );
    }

    return puntosMapaActivos;
  }, [modoMapa, puntosMapaActivos]);

  const mayorConcentracion = zonasMapaActivas[0]
    ? [...zonasMapaActivas].sort((a, b) => b.total - a.total)[0]
    : null;
  const zonasCriticas = zonasMapaActivas.filter(
    (zona) => zona.criticidadMaxima === "CRITICO" || zona.criticosAltos > 0
  );
  const concentracionEmpresa = ordenarEntradas(resumenMapa.porEmpresa)[0];
  const concentracionObra = ordenarEntradas(resumenMapa.porObra)[0];
  const concentracionArea = ordenarEntradas(resumenMapa.porArea)[0];

  useEffect(() => {
    if (!usarMapaGoogleReal || !googleMapContainerRef.current || !window.google?.maps) {
      return;
    }

    const maps = window.google.maps;
    const puntosReales = resumenMapa.puntos;
    const centroInicial = puntosReales[0]
      ? { lat: puntosReales[0].latitud, lng: puntosReales[0].longitud }
      : { lat: -30.5595, lng: -71.1791 };

    if (!googleMapInstanceRef.current) {
      googleMapInstanceRef.current = new maps.Map(googleMapContainerRef.current, {
        center: centroInicial,
        zoom: Math.round(9 + (zoomMapa - 1) * 4),
        mapTypeId: tipoVistaMapa === "satelital" ? "hybrid" : "roadmap",
        disableDefaultUI: true,
        zoomControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        mapTypeControl: false,
        gestureHandling: "greedy",
      });
    }

    const mapa = googleMapInstanceRef.current;
    mapa.setMapTypeId(tipoVistaMapa === "satelital" ? "hybrid" : "roadmap");
    mapa.setZoom(Math.round(9 + (zoomMapa - 1) * 4));
    googleMarkersRef.current.forEach((marker) => marker.setMap(null));
    googleMarkersRef.current = [];

    if (puntosReales.length === 0) {
      mapa.setCenter(centroInicial);
      return;
    }

    const limites = new maps.LatLngBounds();
    googleMarkersRef.current = puntosReales.map((punto) => {
      const posicion = { lat: punto.latitud, lng: punto.longitud };
      limites.extend(posicion);
      return new maps.Marker({
        position: posicion,
        map: mapa,
        title: `${punto.codigo} · ${punto.empresa}`,
        icon: {
          path: "M 0,0 m -7,0 a 7,7 0 1,0 14,0 a 7,7 0 1,0 -14,0",
          fillColor: colorCriticidad(punto.criticidad),
          fillOpacity: 0.96,
          strokeColor: "#ffffff",
          strokeWeight: 1.6,
          scale: punto.criticidad === "CRITICO" ? 1.12 : 0.9,
        },
      });
    });
    mapa.fitBounds(limites);
  }, [usarMapaGoogleReal, resumenMapa.puntos, zoomMapa, tipoVistaMapa]);

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

  function cambiarModo(id: ModoMapa) {
    activarBoton(id);
    setModoMapa(id);
    setMensaje(
      id === "calor"
        ? "Mapa caliente activo: intensidad por concentracion y criticidad."
        : id === "zonas"
          ? "Vista de zonas criticas activa: foco en criticidad alta y abierta."
          : "Vista de puntos activa: lectura individual de reportes GPS."
    );
  }

  function limpiarFiltros() {
    activarBoton("limpiar");
    setFiltros(filtrosIniciales);
    setZonaSeleccionada(null);
    setPuntoSeleccionado(null);
    setMensaje("Filtros limpiados. Vista territorial general restablecida.");
  }

  function cambiarTipoVistaMapa(tipo: TipoVistaMapa) {
    activarBoton(tipo);
    setTipoVistaMapa(tipo);
    setMensaje(
      tipo === "satelital"
        ? "Vista satelital real"
        : "Vista estandar"
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
        setMensaje("Pantalla completa preparada. En la version futura se conectara a mapa operacional dedicado.");
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
  }

  const accionesBarra: Array<{
    id: AccionBarraMapa;
    icono: IconoBarraMapa;
    etiqueta: string;
    destacado?: boolean;
  }> = [
    { id: "general", icono: "mapa", etiqueta: "Ver todos los puntos", destacado: true },
    { id: "criticidad", icono: "filtro", etiqueta: "Filtro por criticidad" },
    { id: "mas-criticos", icono: "alerta", etiqueta: "Mas criticos" },
    { id: "menos-criticos", icono: "bajo", etiqueta: "Menos criticos" },
    { id: "cerrados", icono: "check", etiqueta: "Cerrados" },
    { id: "empresas", icono: "empresa", etiqueta: "Empresas" },
    { id: "obras", icono: "obra", etiqueta: "Obras/areas" },
    { id: "recientes", icono: "reciente", etiqueta: "Recientes" },
    { id: "vencidos", icono: "vencido", etiqueta: "Vencidos" },
    { id: "capas", icono: "capas", etiqueta: "Capas / visualizacion" },
    { id: "estandar", icono: "capas", etiqueta: "Vista estandar" },
    { id: "satelital", icono: "satelital", etiqueta: "Vista satelital real" },
    { id: "zoom-mas", icono: "zoomMas", etiqueta: "Zoom mas" },
    { id: "zoom-menos", icono: "zoomMenos", etiqueta: "Zoom menos" },
    { id: "salir", icono: "salir", etiqueta: "Salir de pantalla completa" },
  ];

  function ejecutarAccionBarra(id: AccionBarraMapa) {
    activarBoton(id);

    if (id === "general") {
      setFiltros(filtrosIniciales);
      setModoMapa("puntos");
      setZonaSeleccionada(null);
      setPuntoSeleccionado(null);
      setMensaje("Vista general del mapa restablecida.");
      return;
    }

    if (id === "criticidad" || id === "mas-criticos") {
      setFiltros((actual) => ({ ...actual, criticidad: "CRITICO", gps: "todos" }));
      setModoMapa("zonas");
      setMensaje(id === "mas-criticos" ? "Foco en puntos de mayor criticidad." : "Filtro rapido aplicado por criticidad critica y alta.");
      return;
    }

    if (id === "menos-criticos") {
      setFiltros((actual) => ({ ...actual, criticidad: "BAJO", gps: "todos" }));
      setModoMapa("puntos");
      setMensaje("Foco en hallazgos de menor criticidad.");
      return;
    }

    if (id === "cerrados") {
      setFiltros((actual) => ({ ...actual, estado: "CERRADO", gps: "todos" }));
      setModoMapa("puntos");
      setMensaje("Filtro aplicado a hallazgos cerrados.");
      return;
    }

    if (id === "empresas") {
      setFiltros((actual) => ({ ...actual, empresa: concentracionEmpresa?.[0] || "", gps: "todos" }));
      setModoMapa("calor");
      setMensaje("Lectura por empresas destacada.");
      return;
    }

    if (id === "obras") {
      setFiltros((actual) => ({
        ...actual,
        obra: concentracionObra?.[0] || "",
        area: concentracionArea?.[0] || "",
        gps: "todos",
      }));
      setModoMapa("calor");
      setMensaje("Lectura por obras y areas destacada.");
      return;
    }

    if (id === "recientes") {
      setFiltros((actual) => ({ ...actual, fechaDesde: "", fechaHasta: "", gps: "todos" }));
      setModoMapa("puntos");
      setMensaje("Lectura de hallazgos recientes aplicada.");
      return;
    }

    if (id === "vencidos") {
      setFiltros((actual) => ({ ...actual, estado: "ABIERTO", gps: "todos" }));
      setModoMapa("zonas");
      setMensaje("Revision de vencidos aplicada.");
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
            padding: "22px",
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
              {t("Mapa GPS de Hallazgos")}
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
              {t("Lectura preventiva territorial para identificar concentracion de hallazgos, zonas calientes, criticidad geografica y focos de accion en terreno.")}
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <Link
              href="/panel"
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
            },
            {
              titulo: t("Hallazgos sin GPS"),
              valor: resumenMapa.totalSinGps,
              color: "#f97316",
              detalle: t("Registros que requieren trazabilidad futura"),
            },
            {
              titulo: t("Zonas criticas"),
              valor: zonasCriticas.length,
              color: "#ef4444",
              detalle: t("Celdas con criticidad alta o critica"),
            },
            {
              titulo: t("Mayor concentracion"),
              valor: mayorConcentracion?.total || 0,
              color: "#a78bfa",
              detalle: mayorConcentracion
                ? mayorConcentracion.clave
                : t("Sin celda territorial dominante"),
            },
          ].map((tarjeta) => (
            <article
              key={tarjeta.titulo}
              style={{
                ...themedSurfaceStyle,
                padding: "18px",
                minHeight: "132px",
                background: fondoTarjeta,
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
            </article>
          ))}
        </section>

        <section
          className="ce-panel-map-grid"
          ref={mapaOperativoRef}
          style={{
            display: "grid",
            gridTemplateColumns:
              pantallaCompletaActiva
                ? "auto minmax(0, 1fr)"
                : "minmax(0, 1fr) clamp(300px, 17vw, 390px)",
            gap: "clamp(12px, 0.9vw, 18px)",
            alignItems: "stretch",
            minHeight: pantallaCompletaActiva ? "100vh" : undefined,
            padding: pantallaCompletaActiva ? "12px" : undefined,
            background: pantallaCompletaActiva
              ? temaClaro
                ? "linear-gradient(135deg, #e2e8f0, #f8fafc)"
                : "linear-gradient(135deg, #020617, #0f172a)"
              : undefined,
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
            <div style={{ display: "grid", gap: "10px" }}>
              <div
                style={{
                  height: "42px",
                  borderRadius: "17px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: barraExpandida ? "flex-start" : "center",
                  padding: barraExpandida ? "0 13px" : 0,
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
                }}
              >
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    minWidth: "10px",
                    borderRadius: "999px",
                    background: "#38bdf8",
                    boxShadow: "0 0 16px rgba(56,189,248,0.75)",
                    marginRight: barraExpandida ? "10px" : 0,
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
                  (accion.id === "mas-criticos" && filtros.criticidad === "CRITICO") ||
                  (accion.id === "menos-criticos" && filtros.criticidad === "BAJO") ||
                  (accion.id === "cerrados" && filtros.estado === "CERRADO");
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
                  {hallazgosFiltrados.length} · {usarVistaPreparada ? `${puntosPreparados.length} ${t("Puntos preparados")}` : `${resumenMapa.totalConGps} GPS`}
                </span>
              )}
            </div>
          </aside>
          )}

          <section
            className="ce-panel-map-canvas-card"
            style={{
              ...themedSurfaceStyle,
              minHeight: "clamp(680px, 50vw, 880px)",
              padding: "18px",
              display: "grid",
              gridTemplateRows: "auto minmax(0, 1fr) auto",
              gap: "14px",
              overflow: "hidden",
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
                  <span
                    style={{
                      minHeight: "34px",
                      borderRadius: "999px",
                      padding: "8px 10px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: temaClaro ? "rgba(248,250,252,0.88)" : "rgba(15,23,42,0.78)",
                      border: bordeInterno,
                      color: textoAzul,
                      fontSize: "12px",
                      fontWeight: 950,
                    }}
                  >
                    {tipoVistaMapa === "satelital" ? t("Vista satelital real") : t("Vista estandar")}
                  </span>
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
                </div>
              ) : (
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                  {[
                    ["Vista estandar", "#38bdf8", "estandar"],
                    ["Vista satelital real", "#a78bfa", "satelital"],
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
                    ["Clusters preparados", "#22c55e"],
                    ["Marcadores compactos", "#f97316"],
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
                minHeight: "clamp(520px, 38vw, 720px)",
                overflow: "hidden",
                border: "1px solid rgba(125,211,252,0.18)",
                backgroundColor:
                  usarProveedorGoogle
                    ? temaClaro
                      ? "#e2e8f0"
                      : "#0f172a"
                    : temaClaro
                      ? "#eef4fb"
                      : "#061126",
                backgroundImage:
                  usarProveedorGoogle
                    ? "none"
                    : temaClaro
                    ? "linear-gradient(rgba(100,116,139,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(100,116,139,0.12) 1px, transparent 1px), radial-gradient(circle at 25% 35%, rgba(59,130,246,0.16), transparent 24%), radial-gradient(circle at 68% 46%, rgba(239,68,68,0.12), transparent 20%), linear-gradient(145deg, rgba(248,250,252,0.98), rgba(226,232,240,0.82))"
                    : "linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px), radial-gradient(circle at 25% 35%, rgba(59,130,246,0.20), transparent 24%), radial-gradient(circle at 68% 46%, rgba(239,68,68,0.16), transparent 20%), linear-gradient(145deg, rgba(2,6,23,0.94), rgba(15,23,42,0.82))",
                backgroundSize:
                  usarProveedorGoogle
                    ? "auto, auto, auto, auto, auto"
                    : "48px 48px, 48px 48px, auto, auto, auto",
                backgroundPosition: "center",
                boxShadow: "inset 0 0 80px rgba(14,165,233,0.10)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: "18px",
                  borderRadius: "22px",
                  border: "1px solid rgba(148,163,184,0.14)",
                  pointerEvents: "none",
                }}
              />

              {usarProveedorGoogle && (
                <div
                  ref={googleMapContainerRef}
                  style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 0,
                    background: temaClaro ? "#e2e8f0" : "#0f172a",
                  }}
                />
              )}

              {mostrarMapaPreparado && !GOOGLE_MAPS_CONFIGURADO && (
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
                    {t("Proveedor real pendiente")}
                  </div>
                  <div style={{ marginTop: "5px", color: textoMedio, fontSize: "12px", lineHeight: 1.35, fontWeight: 750 }}>
                    {t("La vista previa mantiene lectura ejecutiva preparada. Configura NEXT_PUBLIC_GOOGLE_MAPS_API_KEY para activar Google Maps real en pantalla completa.")}
                  </div>
                </div>
              )}

              {pantallaCompletaActiva && !GOOGLE_MAPS_CONFIGURADO && (
                <div
                  style={{
                    position: "absolute",
                    inset: "56px",
                    zIndex: 2,
                    borderRadius: "26px",
                    background: fondoInterno,
                    border: "1px solid rgba(148,163,184,0.22)",
                    display: "grid",
                    placeItems: "center",
                    textAlign: "center",
                    padding: "28px",
                  }}
                >
                  <div>
                    <div style={{ color: textoAzul, fontSize: "24px", fontWeight: 950 }}>
                      {t("Proveedor Google Maps no configurado")}
                    </div>
                    <p style={{ maxWidth: "560px", margin: "12px auto 0", color: textoMedio, fontSize: "14px", lineHeight: 1.5, fontWeight: 750 }}>
                      {t("Configura NEXT_PUBLIC_GOOGLE_MAPS_API_KEY para activar mapa estandar y satelital/hibrido real.")}
                    </p>
                  </div>
                </div>
              )}

              {usarProveedorGoogle && googleMapsError && (
                <div
                  style={{
                    position: "absolute",
                    inset: "56px",
                    zIndex: 2,
                    borderRadius: "26px",
                    background: fondoInterno,
                    border: "1px solid rgba(248,113,113,0.32)",
                    display: "grid",
                    placeItems: "center",
                    textAlign: "center",
                    padding: "28px",
                  }}
                >
                  <div>
                    <div style={{ color: "#f87171", fontSize: "24px", fontWeight: 950 }}>
                      {t("Proveedor de mapa no disponible")}
                    </div>
                    <p style={{ maxWidth: "560px", margin: "12px auto 0", color: textoMedio, fontSize: "14px", lineHeight: 1.5, fontWeight: 750 }}>
                      {t("No se pudo cargar Google Maps. Revisa la API key, dominios autorizados y facturacion.")}
                    </p>
                  </div>
                </div>
              )}

              {usarProveedorGoogle && !googleMapsListo && !googleMapsError && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 2,
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

              {cargando && mostrarMapaPreparado && (
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

              {usarVistaPreparada && mostrarMapaPreparado && (
                <div
                  style={{
                    position: "absolute",
                    right: "18px",
                    top: "18px",
                    zIndex: 3,
                    maxWidth: pantallaCompletaActiva ? "320px" : "380px",
                    borderRadius: "18px",
                    background: temaClaro
                      ? "rgba(255,255,255,0.88)"
                      : "rgba(15,23,42,0.78)",
                    border: "1px solid rgba(56,189,248,0.28)",
                    boxShadow: "0 18px 42px rgba(15,23,42,0.18)",
                    padding: "12px 14px",
                    backdropFilter: "blur(10px)",
                    color: textoPrincipal,
                  }}
                >
                  <div style={{ color: textoAzul, fontSize: "12px", fontWeight: 950 }}>
                    {t("Vista preparada / simulacion visual")}
                  </div>
                  <div style={{ marginTop: "5px", color: textoMedio, fontSize: "12px", lineHeight: 1.35, fontWeight: 750 }}>
                    {t("Visualizacion preparada con datos disponibles; no representa coordenadas reales.")}
                  </div>
                </div>
              )}

              {!cargando && mostrarMapaPreparado && puntosMapaActivos.length === 0 && (
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
                      {t("Mapa preparado")}
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
                      {t("Aun no existen coordenadas suficientes para mostrar puntos reales. La vista queda preparada para reportes con GPS desde terreno.")}
                    </p>
                  </div>
                </div>
              )}

              {mostrarMapaPreparado && modoMapa !== "puntos" &&
                zonasMapaActivas.map((zona, index) => {
                  const posicion = posicionNormalizada(
                    zona.latitudPromedio,
                    zona.longitudPromedio,
                    puntosMapaActivos,
                    index
                  );
                  const color = colorCriticidad(zona.criticidadMaxima);
                  const tamano = Math.min(210, (72 + zona.total * 22 + zona.criticosAltos * 16) * zoomMapa);

                  return (
                    <button
                      key={zona.clave}
                      type="button"
                      onClick={() => {
                        activarBoton(`zona-${zona.clave}`);
                        setZonaSeleccionada(zona);
                        setPuntoSeleccionado(null);
                      }}
                      style={{
                        position: "absolute",
                        left: `${posicion.left}%`,
                        top: `${posicion.top}%`,
                        width: `${tamano}px`,
                        height: `${tamano}px`,
                        transform: "translate(-50%, -50%)",
                        borderRadius: "999px",
                        border: `1px solid ${color}88`,
                        background: `radial-gradient(circle, ${color}66 0%, ${color}22 42%, transparent 72%)`,
                        boxShadow: `0 0 ${36 + zona.total * 6}px ${color}55`,
                        cursor: "pointer",
                        color: "#ffffff",
                        display: "grid",
                        placeItems: "center",
                        fontSize: "13px",
                        fontWeight: 950,
                        textShadow: "0 1px 8px rgba(0,0,0,0.55)",
                      }}
                      aria-label={`Zona ${zona.clave}`}
                    >
                      {zona.total > 1 ? zona.total : ""}
                    </button>
                  );
                })}

              {mostrarMapaPreparado && puntosVisibles.map((punto, index) => {
                const posicion = posicionNormalizada(
                  punto.latitud,
                  punto.longitud,
                  puntosMapaActivos,
                  index
                );
                const color = colorCriticidad(punto.criticidad);
                const tamanoPunto = (punto.criticidad === "CRITICO" ? 22 : 17) * zoomMapa;

                return (
                  <button
                    key={`${punto.codigo}-${index}`}
                    type="button"
                    onClick={() => {
                      activarBoton(`punto-${punto.codigo}`);
                      setPuntoSeleccionado(punto);
                      setZonaSeleccionada(null);
                    }}
                    style={{
                      position: "absolute",
                      left: `${posicion.left}%`,
                      top: `${posicion.top}%`,
                      width: `${tamanoPunto}px`,
                      height: `${tamanoPunto}px`,
                      transform: "translate(-50%, -50%)",
                      borderRadius: "999px",
                      border: "1.5px solid rgba(255,255,255,0.86)",
                      background: color,
                      boxShadow: `0 0 0 6px ${color}1f, 0 0 18px ${color}88`,
                      cursor: "pointer",
                    }}
                    aria-label={`Hallazgo ${punto.codigo}`}
                  />
                );
              })}

              <div
                style={{
                  position: "absolute",
                  left: "18px",
                  bottom: "18px",
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
