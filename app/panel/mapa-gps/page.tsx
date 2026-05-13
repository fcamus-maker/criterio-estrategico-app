"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
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

type HallazgoPanelExtendido = HallazgoPanel & {
  area?: string;
  gps?: HallazgoCentral["geolocalizacion"];
  recomendacion?: string;
};

type ModoMapa = "puntos" | "calor" | "zonas";
type FiltroGps = "todos" | "con-gps" | "sin-gps";

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
  padding: "28px",
  fontFamily:
    "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
};

const shellStyle: CSSProperties = {
  maxWidth: "1480px",
  margin: "0 auto",
  display: "grid",
  gap: "18px",
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
  const [hallazgos, setHallazgos] = useState<HallazgoCentral[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtros, setFiltros] = useState<FiltrosVista>(filtrosIniciales);
  const [modoMapa, setModoMapa] = useState<ModoMapa>("calor");
  const [accionActiva, setAccionActiva] = useState("");
  const [mensaje, setMensaje] = useState("Vista territorial preparada con fuente local y fallback seguro.");
  const [zonaSeleccionada, setZonaSeleccionada] = useState<CeldaMapaCalorHallazgo | null>(null);
  const [puntoSeleccionado, setPuntoSeleccionado] = useState<PuntoMapaGpsHallazgo | null>(null);

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

  const puntosVisibles = useMemo(() => {
    if (modoMapa === "zonas") {
      return resumenMapa.puntos.filter(
        (punto) => punto.criticidad === "CRITICO" || punto.criticidad === "ALTO"
      );
    }

    return resumenMapa.puntos;
  }, [modoMapa, resumenMapa.puntos]);

  const mayorConcentracion = resumenMapa.mapaCalor[0]
    ? [...resumenMapa.mapaCalor].sort((a, b) => b.total - a.total)[0]
    : null;
  const zonasCriticas = resumenMapa.mapaCalor.filter(
    (zona) => zona.criticidadMaxima === "CRITICO" || zona.criticosAltos > 0
  );
  const concentracionEmpresa = ordenarEntradas(resumenMapa.porEmpresa)[0];
  const concentracionObra = ordenarEntradas(resumenMapa.porObra)[0];
  const concentracionArea = ordenarEntradas(resumenMapa.porArea)[0];

  function botonStyle(id: string, destacado = false): CSSProperties {
    const activo = accionActiva === id;
    return {
      minHeight: "44px",
      borderRadius: "14px",
      border: destacado ? "1px solid rgba(96,165,250,0.56)" : "1px solid rgba(148,163,184,0.22)",
      background: destacado
        ? "linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)"
        : "rgba(15,23,42,0.78)",
      color: destacado ? "#ffffff" : "#dbeafe",
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

  return (
    <main style={pageStyle}>
      <div style={shellStyle}>
        <header
          style={{
            ...surfaceStyle,
            padding: "22px",
            display: "grid",
            gridTemplateColumns: "1fr auto",
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
                color: "#93c5fd",
                fontWeight: 950,
              }}
            >
              Plataforma Hallazgos
            </div>
            <h1
              style={{
                margin: "8px 0 6px",
                fontSize: "34px",
                lineHeight: 1,
                fontWeight: 950,
              }}
            >
              Mapa GPS de Hallazgos
            </h1>
            <p
              style={{
                margin: 0,
                maxWidth: "820px",
                color: "#cbd5e1",
                fontSize: "15px",
                lineHeight: 1.5,
                fontWeight: 650,
              }}
            >
              Lectura preventiva territorial para identificar concentracion de
              hallazgos, zonas calientes, criticidad geografica y focos de accion
              en terreno.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <Link
              href="/panel"
              onMouseDown={() => activarBoton("volver")}
              style={botonStyle("volver")}
            >
              Volver al panel ejecutivo
            </Link>
            <button
              type="button"
              onClick={() => {
                activarBoton("actualizar");
                cargarDatos();
              }}
              style={botonStyle("actualizar", true)}
            >
              Actualizar vista
            </button>
          </div>
        </header>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: "14px",
          }}
        >
          {[
            {
              titulo: "Hallazgos con GPS",
              valor: resumenMapa.totalConGps,
              color: "#38bdf8",
              detalle: "Puntos disponibles para lectura territorial",
            },
            {
              titulo: "Hallazgos sin GPS",
              valor: resumenMapa.totalSinGps,
              color: "#f97316",
              detalle: "Registros que requieren trazabilidad futura",
            },
            {
              titulo: "Zonas criticas",
              valor: zonasCriticas.length,
              color: "#ef4444",
              detalle: "Celdas con criticidad alta o critica",
            },
            {
              titulo: "Mayor concentracion",
              valor: mayorConcentracion?.total || 0,
              color: "#a78bfa",
              detalle: mayorConcentracion
                ? mayorConcentracion.clave
                : "Sin celda territorial dominante",
            },
          ].map((tarjeta) => (
            <article
              key={tarjeta.titulo}
              style={{
                ...surfaceStyle,
                padding: "18px",
                minHeight: "132px",
                background:
                  "linear-gradient(145deg, rgba(15,23,42,0.82), rgba(30,41,59,0.56))",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "#cbd5e1",
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
                  color: "#94a3b8",
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
          style={{
            display: "grid",
            gridTemplateColumns: "300px minmax(0, 1fr) 330px",
            gap: "18px",
            alignItems: "stretch",
          }}
        >
          <aside style={{ ...surfaceStyle, padding: "18px", display: "grid", gap: "14px" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 950 }}>
                Filtros territoriales
              </h2>
              <p
                style={{
                  margin: "6px 0 0",
                  color: "#94a3b8",
                  fontSize: "12px",
                  lineHeight: 1.45,
                  fontWeight: 700,
                }}
              >
                Cruce rapido por empresa, obra, area, criticidad, estado, fecha y GPS.
              </p>
            </div>

            {[
              ["Empresa", "empresa", opciones.empresas],
              ["Obra / proyecto", "obra", opciones.obras],
              ["Area", "area", opciones.areas],
              ["Tipo de hallazgo", "tipoHallazgo", opciones.tipos],
            ].map(([label, key, values]) => (
              <label key={String(key)} style={{ display: "grid", gap: "6px" }}>
                <span style={{ fontSize: "12px", fontWeight: 900, color: "#bfdbfe" }}>
                  {label as string}
                </span>
                <select
                  value={String(filtros[key as keyof FiltrosVista])}
                  onChange={(event) =>
                    setFiltros((actual) => ({
                      ...actual,
                      [key as keyof FiltrosVista]: event.target.value,
                    }))
                  }
                  style={inputStyle}
                >
                  <option value="">Todos</option>
                  {(values as string[]).map((valor) => (
                    <option key={valor} value={valor}>
                      {valor}
                    </option>
                  ))}
                </select>
              </label>
            ))}

            <label style={{ display: "grid", gap: "6px" }}>
              <span style={{ fontSize: "12px", fontWeight: 900, color: "#bfdbfe" }}>
                Criticidad
              </span>
              <select
                value={filtros.criticidad}
                onChange={(event) =>
                  setFiltros((actual) => ({
                    ...actual,
                    criticidad: event.target.value as FiltrosVista["criticidad"],
                  }))
                }
                style={inputStyle}
              >
                <option value="">Todas</option>
                {criticidades.map((criticidad) => (
                  <option key={criticidad} value={criticidad}>
                    {etiquetaCriticidad(criticidad)}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: "grid", gap: "6px" }}>
              <span style={{ fontSize: "12px", fontWeight: 900, color: "#bfdbfe" }}>
                Estado
              </span>
              <select
                value={filtros.estado}
                onChange={(event) =>
                  setFiltros((actual) => ({
                    ...actual,
                    estado: event.target.value as FiltrosVista["estado"],
                  }))
                }
                style={inputStyle}
              >
                <option value="">Todos</option>
                {estados.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado.replace("_", " ")}
                  </option>
                ))}
              </select>
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <label style={{ display: "grid", gap: "6px" }}>
                <span style={{ fontSize: "12px", fontWeight: 900, color: "#bfdbfe" }}>
                  Desde
                </span>
                <input
                  type="date"
                  value={filtros.fechaDesde}
                  onChange={(event) =>
                    setFiltros((actual) => ({ ...actual, fechaDesde: event.target.value }))
                  }
                  style={inputStyle}
                />
              </label>
              <label style={{ display: "grid", gap: "6px" }}>
                <span style={{ fontSize: "12px", fontWeight: 900, color: "#bfdbfe" }}>
                  Hasta
                </span>
                <input
                  type="date"
                  value={filtros.fechaHasta}
                  onChange={(event) =>
                    setFiltros((actual) => ({ ...actual, fechaHasta: event.target.value }))
                  }
                  style={inputStyle}
                />
              </label>
            </div>

            <label style={{ display: "grid", gap: "6px" }}>
              <span style={{ fontSize: "12px", fontWeight: 900, color: "#bfdbfe" }}>
                GPS
              </span>
              <select
                value={filtros.gps}
                onChange={(event) =>
                  setFiltros((actual) => ({
                    ...actual,
                    gps: event.target.value as FiltroGps,
                  }))
                }
                style={inputStyle}
              >
                <option value="todos">Con GPS y sin GPS</option>
                <option value="con-gps">Solo con GPS</option>
                <option value="sin-gps">Solo sin GPS</option>
              </select>
            </label>

            <div style={{ display: "grid", gap: "9px", marginTop: "4px" }}>
              <button
                type="button"
                onClick={() => {
                  activarBoton("aplicar");
                  setMensaje("Filtros aplicados sobre la vista territorial.");
                }}
                style={botonStyle("aplicar", true)}
              >
                Aplicar filtros
              </button>
              <button type="button" onClick={limpiarFiltros} style={botonStyle("limpiar")}>
                Limpiar filtros
              </button>
            </div>
          </aside>

          <section
            style={{
              ...surfaceStyle,
              minHeight: "680px",
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
                  Lectura territorial preventiva
                </h2>
                <p style={{ margin: "5px 0 0", color: "#94a3b8", fontSize: "13px", fontWeight: 700 }}>
                  {mensaje}
                </p>
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => cambiarModo("puntos")} style={botonStyle("puntos")}>
                  Ver todos los puntos
                </button>
                <button type="button" onClick={() => cambiarModo("calor")} style={botonStyle("calor", modoMapa === "calor")}>
                  Ver concentracion
                </button>
                <button type="button" onClick={() => cambiarModo("zonas")} style={botonStyle("zonas")}>
                  Ver zonas criticas
                </button>
              </div>
            </div>

            <div
              style={{
                position: "relative",
                borderRadius: "28px",
                minHeight: "520px",
                overflow: "hidden",
                border: "1px solid rgba(125,211,252,0.18)",
                background:
                  "linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px), radial-gradient(circle at 25% 35%, rgba(59,130,246,0.20), transparent 24%), radial-gradient(circle at 68% 46%, rgba(239,68,68,0.16), transparent 20%), linear-gradient(145deg, rgba(2,6,23,0.94), rgba(15,23,42,0.82))",
                backgroundSize: "48px 48px, 48px 48px, auto, auto, auto",
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

              {cargando && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "grid",
                    placeItems: "center",
                    color: "#bfdbfe",
                    fontWeight: 900,
                    background: "rgba(2,6,23,0.52)",
                  }}
                >
                  Cargando lectura territorial...
                </div>
              )}

              {!cargando && resumenMapa.totalConGps === 0 && (
                <div
                  style={{
                    position: "absolute",
                    inset: "56px",
                    borderRadius: "26px",
                    background: "rgba(15,23,42,0.76)",
                    border: "1px solid rgba(148,163,184,0.20)",
                    display: "grid",
                    placeItems: "center",
                    textAlign: "center",
                    padding: "28px",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "46px", fontWeight: 950, color: "#38bdf8" }}>
                      GPS preparado
                    </div>
                    <p
                      style={{
                        maxWidth: "560px",
                        margin: "14px auto 0",
                        color: "#cbd5e1",
                        fontSize: "15px",
                        lineHeight: 1.5,
                        fontWeight: 700,
                      }}
                    >
                      No hay coordenadas suficientes en la fuente actual. Cuando
                      ingresen reportes V2 con GPS o datos centrales, esta vista
                      mostrara puntos, zonas calientes y concentracion territorial.
                    </p>
                  </div>
                </div>
              )}

              {modoMapa !== "puntos" &&
                resumenMapa.mapaCalor.map((zona, index) => {
                  const posicion = posicionNormalizada(
                    zona.latitudPromedio,
                    zona.longitudPromedio,
                    resumenMapa.puntos,
                    index
                  );
                  const color = colorCriticidad(zona.criticidadMaxima);
                  const tamano = Math.min(180, 72 + zona.total * 22 + zona.criticosAltos * 16);

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
                      }}
                      aria-label={`Zona ${zona.clave}`}
                    />
                  );
                })}

              {puntosVisibles.map((punto, index) => {
                const posicion = posicionNormalizada(
                  punto.latitud,
                  punto.longitud,
                  resumenMapa.puntos,
                  index
                );
                const color = colorCriticidad(punto.criticidad);

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
                      width: punto.criticidad === "CRITICO" ? "28px" : "22px",
                      height: punto.criticidad === "CRITICO" ? "28px" : "22px",
                      transform: "translate(-50%, -50%)",
                      borderRadius: "999px",
                      border: "2px solid rgba(255,255,255,0.88)",
                      background: color,
                      boxShadow: `0 0 0 9px ${color}22, 0 0 28px ${color}AA`,
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
                      background: "rgba(15,23,42,0.76)",
                      border: "1px solid rgba(148,163,184,0.20)",
                      fontSize: "11px",
                      fontWeight: 900,
                      color: "#e2e8f0",
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
                    {etiquetaCriticidad(criticidad)}
                  </span>
                ))}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                gap: "10px",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  activarBoton("criticos");
                  setFiltros((actual) => ({ ...actual, criticidad: "CRITICO", gps: "con-gps" }));
                  setModoMapa("zonas");
                  setMensaje("Foco aplicado: hallazgos criticos con trazabilidad GPS.");
                }}
                style={botonStyle("criticos")}
              >
                Ver hallazgos criticos
              </button>
              <button
                type="button"
                onClick={() => {
                  activarBoton("detalle-zona");
                  setZonaSeleccionada(mayorConcentracion);
                  setMensaje("Detalle de mayor concentracion territorial seleccionado.");
                }}
                style={botonStyle("detalle-zona")}
              >
                Detalle de zona
              </button>
              <button
                type="button"
                onClick={() => {
                  activarBoton("exportar");
                  setMensaje("Exportacion preparada visualmente. La salida PDF/Excel se conectara en una etapa posterior.");
                }}
                style={botonStyle("exportar")}
              >
                Exportar vista
              </button>
              <button
                type="button"
                onClick={() => {
                  activarBoton("todos");
                  setFiltros((actual) => ({ ...actual, gps: "todos", criticidad: "" }));
                  setModoMapa("puntos");
                  setMensaje("Vista de todos los puntos y registros disponible.");
                }}
                style={botonStyle("todos", true)}
              >
                Ver todos los registros
              </button>
            </div>
          </section>

          <aside style={{ ...surfaceStyle, padding: "18px", display: "grid", gap: "14px" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 950 }}>
                Zonas y lectura ejecutiva
              </h2>
              <p style={{ margin: "6px 0 0", color: "#94a3b8", fontSize: "12px", lineHeight: 1.45, fontWeight: 700 }}>
                Concentracion territorial para priorizar verificacion en terreno.
              </p>
            </div>

            <div
              style={{
                borderRadius: "20px",
                padding: "15px",
                background:
                  "linear-gradient(145deg, rgba(239,68,68,0.18), rgba(15,23,42,0.82))",
                border: "1px solid rgba(239,68,68,0.28)",
              }}
            >
              <div style={{ fontSize: "12px", color: "#fecaca", fontWeight: 900 }}>
                Mensaje preventivo
              </div>
              <div style={{ marginTop: "8px", fontSize: "14px", lineHeight: 1.45, fontWeight: 800 }}>
                {resumenMapa.totalConGps > 0
                  ? "Priorizar recorridos en zonas con acumulacion critica o alta. El mapa identifica patrones preventivos; no predice accidentes."
                  : "Activar captura GPS en reportes de terreno para habilitar analisis territorial y mapas de calor reales."}
              </div>
            </div>

            <div style={{ display: "grid", gap: "10px" }}>
              {[
                ["Empresa dominante", concentracionEmpresa?.[0] || "Sin datos", concentracionEmpresa?.[1] || 0],
                ["Obra dominante", concentracionObra?.[0] || "Sin datos", concentracionObra?.[1] || 0],
                ["Area dominante", concentracionArea?.[0] || "Sin datos", concentracionArea?.[1] || 0],
              ].map(([label, value, count]) => (
                <div
                  key={String(label)}
                  style={{
                    borderRadius: "18px",
                    padding: "13px",
                    background: "rgba(15,23,42,0.72)",
                    border: "1px solid rgba(148,163,184,0.18)",
                  }}
                >
                  <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 900 }}>
                    {label}
                  </div>
                  <div style={{ marginTop: "5px", fontSize: "15px", fontWeight: 950 }}>
                    {value}
                  </div>
                  <div style={{ marginTop: "3px", color: "#38bdf8", fontSize: "12px", fontWeight: 900 }}>
                    {count} hallazgos
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                borderRadius: "20px",
                padding: "14px",
                background: "rgba(15,23,42,0.72)",
                border: "1px solid rgba(148,163,184,0.18)",
                minHeight: "160px",
              }}
            >
              <div style={{ fontSize: "12px", color: "#bfdbfe", fontWeight: 950 }}>
                Detalle seleccionado
              </div>
              {puntoSeleccionado ? (
                <div style={{ marginTop: "10px", display: "grid", gap: "7px" }}>
                  <strong style={{ color: colorCriticidad(puntoSeleccionado.criticidad) }}>
                    {puntoSeleccionado.codigo} · {etiquetaCriticidad(puntoSeleccionado.criticidad)}
                  </strong>
                  <span style={{ color: "#cbd5e1", fontSize: "13px", lineHeight: 1.4 }}>
                    {puntoSeleccionado.descripcionResumen}
                  </span>
                  <span style={{ color: "#94a3b8", fontSize: "12px", fontWeight: 800 }}>
                    {puntoSeleccionado.empresa} · {puntoSeleccionado.obra} · {puntoSeleccionado.area}
                  </span>
                </div>
              ) : zonaSeleccionada ? (
                <div style={{ marginTop: "10px", display: "grid", gap: "7px" }}>
                  <strong style={{ color: colorCriticidad(zonaSeleccionada.criticidadMaxima) }}>
                    Zona {zonaSeleccionada.clave}
                  </strong>
                  <span style={{ color: "#cbd5e1", fontSize: "13px", lineHeight: 1.4 }}>
                    {zonaSeleccionada.total} hallazgos, {zonaSeleccionada.criticosAltos} criticos/altos.
                  </span>
                  <span style={{ color: "#94a3b8", fontSize: "12px", fontWeight: 800 }}>
                    Codigos: {zonaSeleccionada.codigos.slice(0, 4).join(", ")}
                  </span>
                </div>
              ) : (
                <p style={{ margin: "10px 0 0", color: "#94a3b8", fontSize: "13px", lineHeight: 1.45, fontWeight: 700 }}>
                  Selecciona un punto o zona caliente para revisar informacion territorial.
                </p>
              )}
            </div>

            <div style={{ display: "grid", gap: "9px" }}>
              <div style={{ fontSize: "12px", color: "#bfdbfe", fontWeight: 950 }}>
                Zonas relevantes
              </div>
              {(zonasCriticas.length ? zonasCriticas : resumenMapa.mapaCalor)
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
              {resumenMapa.mapaCalor.length === 0 && (
                <div style={{ color: "#94a3b8", fontSize: "13px", fontWeight: 750 }}>
                  Sin zonas GPS suficientes para listar.
                </div>
              )}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
