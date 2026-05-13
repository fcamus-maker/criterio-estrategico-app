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
  padding: "20px 22px 28px",
  boxSizing: "border-box",
  fontFamily:
    "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
};

const shellStyle: CSSProperties = {
  width: "100%",
  maxWidth: "none",
  margin: "0 auto",
  display: "grid",
  gap: "16px",
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

export default function KpiGerencialAvanzadoPage() {
  const [hallazgos, setHallazgos] = useState<HallazgoKpiGerencial[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtros, setFiltros] = useState<FiltrosVista>(filtrosIniciales);
  const [accionActiva, setAccionActiva] = useState("");
  const [modoAnalisis, setModoAnalisis] = useState("ranking-empresas");
  const [mensaje, setMensaje] = useState("Modulo gerencial preparado con fuente actual y fallback seguro.");

  async function cargarDatos() {
    setCargando(true);
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
        : "rgba(15,23,42,0.78)",
      color: destacado ? "#ffffff" : "#dbeafe",
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
    ["Total hallazgos", analisis.total, "#38bdf8", "Base analizada"],
    ["Abiertos", analisis.abiertos, "#fb7185", "Pendientes/no cerrados"],
    ["Cerrados", analisis.cerrados, "#22c55e", "Gestion completada"],
    ["Criticos", analisis.criticos, "#ef4444", "Mayor severidad"],
    ["Vencidos", analisis.vencidos, "#f97316", "Fuera de plazo"],
    ["Tasa cierre", analisis.tasaCierre, "#a78bfa", "Cumplimiento cierre", "%"],
    ["Prom. cierre", analisis.tiempoPromedioCierre, "#facc15", "Dias promedio", " d"],
    ["Empresas", analisis.empresasActivas, "#60a5fa", "Empresas activas"],
    ["Obras", analisis.obrasActivas, "#2dd4bf", "Proyectos activos"],
    ["Reincidencias", analisis.reincidenciasDetectadas, "#f43f5e", "Patrones repetidos"],
    ["Cumplimiento", analisis.cumplimientoGeneral, "#34d399", "Indice general", "%"],
    ["Preventivo", analisis.indicadorPreventivoGlobal, "#818cf8", "Indicador global", "%"],
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
    <main style={pageStyle}>
      <div style={shellStyle}>
        <header
          style={{
            ...surfaceStyle,
            padding: "22px",
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(340px, auto)",
            gap: "18px",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: "12px", letterSpacing: "1.2px", textTransform: "uppercase", color: "#93c5fd", fontWeight: 950 }}>
              Plataforma Hallazgos · Gerencia
            </div>
            <h1 style={{ margin: "8px 0 6px", fontSize: "34px", lineHeight: 1, fontWeight: 950 }}>
              KPI Gerencial Avanzado
            </h1>
            <p style={{ margin: 0, maxWidth: "1040px", color: "#cbd5e1", fontSize: "15px", lineHeight: 1.5, fontWeight: 650 }}>
              Analisis ejecutivo para comparar empresas, obras, periodos, criticidad,
              cierres, vencimientos y reincidencias con foco preventivo y reportabilidad.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
            <Link href="/panel" onMouseDown={() => activarBoton("volver")} style={botonStyle("volver")}>
              Volver al panel
            </Link>
            <button
              type="button"
              onClick={() => {
                activarBoton("actualizar");
                cargarDatos();
              }}
              style={botonStyle("actualizar", true)}
            >
              Actualizar analisis
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
              Preparar informe
            </button>
          </div>
        </header>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(150px, 1fr))", gap: "12px" }}>
          {tarjetas.map(([titulo, valor, color, detalle, sufijo]) => (
            <article
              key={titulo}
              style={{
                ...surfaceStyle,
                padding: "16px",
                minHeight: "126px",
                background: "linear-gradient(145deg, rgba(15,23,42,0.84), rgba(30,41,59,0.56))",
              }}
            >
              <div style={{ fontSize: "11px", color: "#cbd5e1", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.7px" }}>
                {titulo}
              </div>
              <div style={{ marginTop: "9px", fontSize: "34px", lineHeight: 1, fontWeight: 950, color, textShadow: `0 0 20px ${color}66` }}>
                {formatoNumero(valor, sufijo || "")}
              </div>
              <div style={{ marginTop: "9px", color: "#94a3b8", fontSize: "12px", lineHeight: 1.35, fontWeight: 750 }}>
                {detalle}
              </div>
            </article>
          ))}
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "minmax(300px, 340px) minmax(0, 1fr) minmax(340px, 390px)", gap: "16px", alignItems: "start" }}>
          <aside style={{ ...surfaceStyle, padding: "18px", display: "grid", gap: "13px" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 950 }}>Filtros avanzados</h2>
              <p style={{ margin: "6px 0 0", color: "#94a3b8", fontSize: "12px", lineHeight: 1.45, fontWeight: 700 }}>
                Cruza empresa, obra, area, periodo, criticidad, responsable y evidencia.
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
                <span style={{ fontSize: "12px", fontWeight: 900, color: "#bfdbfe" }}>{label as string}</span>
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

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <label style={{ display: "grid", gap: "6px" }}>
                <span style={{ fontSize: "12px", fontWeight: 900, color: "#bfdbfe" }}>Criticidad</span>
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
                  {(["CRITICO", "ALTO", "MEDIO", "BAJO"] as CriticidadKpiGerencial[]).map((criticidad) => (
                    <option key={criticidad} value={criticidad}>
                      {etiquetaCriticidad(criticidad)}
                    </option>
                  ))}
                </select>
              </label>
              <label style={{ display: "grid", gap: "6px" }}>
                <span style={{ fontSize: "12px", fontWeight: 900, color: "#bfdbfe" }}>Estado</span>
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
                  {(["REPORTADO", "ABIERTO", "EN_SEGUIMIENTO", "CERRADO", "ANULADO"] as EstadoKpiGerencial[]).map((estado) => (
                    <option key={estado} value={estado}>
                      {estado.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <label style={{ display: "grid", gap: "6px" }}>
                <span style={{ fontSize: "12px", fontWeight: 900, color: "#bfdbfe" }}>Desde</span>
                <input type="date" value={filtros.fechaDesde} onChange={(event) => setFiltros((actual) => ({ ...actual, fechaDesde: event.target.value }))} style={inputStyle} />
              </label>
              <label style={{ display: "grid", gap: "6px" }}>
                <span style={{ fontSize: "12px", fontWeight: 900, color: "#bfdbfe" }}>Hasta</span>
                <input type="date" value={filtros.fechaHasta} onChange={(event) => setFiltros((actual) => ({ ...actual, fechaHasta: event.target.value }))} style={inputStyle} />
              </label>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <label style={{ display: "grid", gap: "6px" }}>
                <span style={{ fontSize: "12px", fontWeight: 900, color: "#bfdbfe" }}>Semana</span>
                <input type="date" value={filtros.semana} onChange={(event) => setFiltros((actual) => ({ ...actual, semana: event.target.value }))} style={inputStyle} />
              </label>
              <label style={{ display: "grid", gap: "6px" }}>
                <span style={{ fontSize: "12px", fontWeight: 900, color: "#bfdbfe" }}>Mes</span>
                <input type="month" value={filtros.mes} onChange={(event) => setFiltros((actual) => ({ ...actual, mes: event.target.value }))} style={inputStyle} />
              </label>
            </div>

            {[
              ["GPS", "gps", [["todos", "Con GPS y sin GPS"], ["con-gps", "Solo con GPS"], ["sin-gps", "Solo sin GPS"]]],
              ["Evidencia", "evidencia", [["todos", "Con y sin evidencia"], ["con-evidencia", "Con evidencia"], ["sin-evidencia", "Sin evidencia"]]],
              ["Vencimiento", "vencimiento", [["todos", "Todos"], ["vencidos", "Solo vencidos"], ["no-vencidos", "No vencidos"]]],
            ].map(([label, key, values]) => (
              <label key={String(key)} style={{ display: "grid", gap: "6px" }}>
                <span style={{ fontSize: "12px", fontWeight: 900, color: "#bfdbfe" }}>{label as string}</span>
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
                  {(values as string[][]).map(([valor, etiqueta]) => (
                    <option key={valor} value={valor}>
                      {etiqueta}
                    </option>
                  ))}
                </select>
              </label>
            ))}

            <label style={{ display: "flex", gap: "10px", alignItems: "center", fontSize: "13px", fontWeight: 850, color: "#dbeafe" }}>
              <input
                type="checkbox"
                checked={filtros.soloCriticosAbiertos}
                onChange={(event) => setFiltros((actual) => ({ ...actual, soloCriticosAbiertos: event.target.checked }))}
              />
              Solo criticos abiertos
            </label>
            <label style={{ display: "flex", gap: "10px", alignItems: "center", fontSize: "13px", fontWeight: 850, color: "#dbeafe" }}>
              <input
                type="checkbox"
                checked={filtros.soloReincidencias}
                onChange={(event) => setFiltros((actual) => ({ ...actual, soloReincidencias: event.target.checked }))}
              />
              Solo reincidencias
            </label>

            <button type="button" onClick={() => aplicarAccion("aplicar", "Filtros aplicados al analisis gerencial.")} style={botonStyle("aplicar", true)}>
              Aplicar filtros
            </button>
            <button type="button" onClick={limpiarFiltros} style={botonStyle("limpiar")}>
              Limpiar filtros
            </button>
          </aside>

          <section style={{ display: "grid", gap: "16px", minWidth: 0 }}>
            <section style={{ ...surfaceStyle, padding: "18px", display: "grid", gap: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 950 }}>Tablero de analisis ejecutivo</h2>
                  <p style={{ margin: "5px 0 0", color: "#94a3b8", fontSize: "13px", fontWeight: 750 }}>
                    {cargando ? "Cargando datos..." : mensaje}
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
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {analisis.total === 0 ? (
                <div style={{ borderRadius: "24px", padding: "34px", background: "rgba(15,23,42,0.72)", border: "1px solid rgba(148,163,184,0.18)", textAlign: "center" }}>
                  <div style={{ fontSize: "34px", fontWeight: 950, color: "#38bdf8" }}>KPI preparado</div>
                  <p style={{ maxWidth: "620px", margin: "12px auto 0", color: "#cbd5e1", lineHeight: 1.5, fontWeight: 700 }}>
                    No hay datos suficientes con los filtros seleccionados. Al registrar mas hallazgos, este modulo mostrara rankings, comparaciones, tasas y reportabilidad ejecutiva.
                  </p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.35fr) minmax(330px, 0.85fr)", gap: "16px", alignItems: "stretch" }}>
                  <div style={{ borderRadius: "24px", padding: "18px", background: "rgba(15,23,42,0.72)", border: "1px solid rgba(148,163,184,0.18)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
                      <div style={{ fontSize: "15px", fontWeight: 950 }}>Ranking comparativo</div>
                      <div style={{ fontSize: "12px", color: "#93c5fd", fontWeight: 900 }}>{modoAnalisis.replace("-", " ")}</div>
                    </div>
                    <div style={{ display: "grid", gap: "10px" }}>
                      {rankingPrincipal.slice(0, 8).map((item, index) => {
                        const ancho = Math.max(8, (item.total / maxRanking) * 100);
                        return (
                          <div key={`${item.nombre}-${index}`} style={{ display: "grid", gap: "6px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", fontSize: "12px", fontWeight: 900 }}>
                              <span>{index + 1}. {item.nombre}</span>
                              <span style={{ color: "#bfdbfe" }}>{item.total} · cierre {item.tasaCierre}%</span>
                            </div>
                            <div style={{ height: "14px", borderRadius: "999px", background: "rgba(30,41,59,0.88)", overflow: "hidden" }}>
                              <div style={{ width: `${ancho}%`, height: "100%", borderRadius: "999px", background: item.criticos > 0 ? "linear-gradient(90deg,#ef4444,#f97316)" : "linear-gradient(90deg,#2563eb,#22c55e)", boxShadow: "0 0 20px rgba(59,130,246,0.36)" }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ borderRadius: "24px", padding: "18px", background: "rgba(15,23,42,0.72)", border: "1px solid rgba(148,163,184,0.18)" }}>
                    <div style={{ fontSize: "15px", fontWeight: 950, marginBottom: "14px" }}>Criticidad y estado</div>
                    <div style={{ display: "grid", gap: "12px" }}>
                      {Object.entries(analisis.porCriticidad).map(([criticidad, total]) => (
                        <div key={criticidad} style={{ display: "grid", gridTemplateColumns: "88px 1fr 42px", gap: "10px", alignItems: "center" }}>
                          <span style={{ fontSize: "12px", fontWeight: 900, color: colorCriticidad(criticidad as CriticidadKpiGerencial) }}>{etiquetaCriticidad(criticidad as CriticidadKpiGerencial)}</span>
                          <div style={{ height: "11px", borderRadius: "999px", background: "rgba(30,41,59,0.88)", overflow: "hidden" }}>
                            <div style={{ width: `${analisis.total ? (total / analisis.total) * 100 : 0}%`, height: "100%", borderRadius: "999px", background: colorCriticidad(criticidad as CriticidadKpiGerencial) }} />
                          </div>
                          <strong style={{ fontSize: "12px", textAlign: "right" }}>{total}</strong>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: "18px", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                      {Object.entries(analisis.porEstado).map(([estado, total]) => (
                        <div key={estado} style={{ borderRadius: "16px", padding: "11px", background: "rgba(30,41,59,0.62)", border: "1px solid rgba(148,163,184,0.16)" }}>
                          <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 900 }}>{estado.replace("_", " ")}</div>
                          <div style={{ marginTop: "4px", fontSize: "22px", fontWeight: 950 }}>{total}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.1fr) minmax(360px, 0.9fr)", gap: "16px" }}>
              <div style={{ ...surfaceStyle, padding: "18px" }}>
                <div style={{ fontSize: "16px", fontWeight: 950, marginBottom: "14px" }}>Tendencia temporal</div>
                <div style={{ height: "230px", display: "flex", alignItems: "end", gap: "10px", paddingTop: "16px" }}>
                  {analisis.tendenciaTemporal.slice(-10).map((item) => (
                    <div key={item.periodo} style={{ flex: 1, display: "grid", alignItems: "end", gap: "8px", minWidth: 0 }}>
                      <div style={{ height: `${Math.max(8, (item.total / maxTendencia) * 180)}px`, borderRadius: "14px 14px 6px 6px", background: item.criticos > 0 ? "linear-gradient(180deg,#ef4444,#7f1d1d)" : "linear-gradient(180deg,#38bdf8,#1d4ed8)", boxShadow: "0 10px 24px rgba(14,165,233,0.20)" }} />
                      <div style={{ fontSize: "10px", color: "#94a3b8", textAlign: "center", fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis" }}>{item.periodo}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ ...surfaceStyle, padding: "18px" }}>
                <div style={{ fontSize: "16px", fontWeight: 950, marginBottom: "14px" }}>Comparaciones</div>
                <div style={{ display: "grid", gap: "12px" }}>
                  {analisis.comparaciones.map((item) => (
                    <div key={item.etiqueta} style={{ borderRadius: "18px", padding: "14px", background: "rgba(15,23,42,0.70)", border: "1px solid rgba(148,163,184,0.18)" }}>
                      <div style={{ fontSize: "12px", color: "#bfdbfe", fontWeight: 900 }}>{item.etiqueta}</div>
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

          <aside style={{ ...surfaceStyle, padding: "18px", display: "grid", gap: "14px" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 950 }}>Informe ejecutivo preparado</h2>
              <p style={{ margin: "6px 0 0", color: "#94a3b8", fontSize: "12px", lineHeight: 1.45, fontWeight: 700 }}>
                Resumen automatico listo para futura salida PDF/Excel.
              </p>
            </div>

            <div style={{ borderRadius: "22px", padding: "16px", background: "linear-gradient(145deg, rgba(37,99,235,0.22), rgba(15,23,42,0.82))", border: "1px solid rgba(96,165,250,0.26)" }}>
              <div style={{ fontSize: "12px", color: "#bfdbfe", fontWeight: 950 }}>Resumen</div>
              <p style={{ margin: "8px 0 0", color: "#e2e8f0", lineHeight: 1.5, fontSize: "14px", fontWeight: 750 }}>
                {analisis.resumenEjecutivo}
              </p>
            </div>

            <div style={{ display: "grid", gap: "10px" }}>
              <div style={{ fontSize: "12px", color: "#bfdbfe", fontWeight: 950 }}>Riesgos principales</div>
              {analisis.principalesRiesgos.map((riesgo) => (
                <div key={riesgo} style={{ borderRadius: "16px", padding: "12px", background: "rgba(15,23,42,0.72)", border: "1px solid rgba(148,163,184,0.18)", color: "#cbd5e1", fontSize: "13px", lineHeight: 1.4, fontWeight: 750 }}>
                  {riesgo}
                </div>
              ))}
            </div>

            <div style={{ borderRadius: "22px", padding: "16px", background: "linear-gradient(145deg, rgba(239,68,68,0.18), rgba(15,23,42,0.82))", border: "1px solid rgba(239,68,68,0.26)" }}>
              <div style={{ fontSize: "12px", color: "#fecaca", fontWeight: 950 }}>Recomendacion preventiva</div>
              <p style={{ margin: "8px 0 0", color: "#f8fafc", lineHeight: 1.5, fontSize: "14px", fontWeight: 800 }}>
                {analisis.recomendacionPreventiva}
              </p>
            </div>

            <div style={{ display: "grid", gap: "9px" }}>
              <button type="button" onClick={() => aplicarAccion("pdf", "PDF preparado visualmente. Generacion real pendiente de etapa posterior.")} style={botonStyle("pdf", true)}>
                Exportar PDF
              </button>
              <button type="button" onClick={() => aplicarAccion("excel", "Excel preparado visualmente. Exportacion real pendiente de etapa posterior.")} style={botonStyle("excel")}>
                Exportar Excel
              </button>
            </div>

            <div style={{ display: "grid", gap: "9px" }}>
              <div style={{ fontSize: "12px", color: "#bfdbfe", fontWeight: 950 }}>Rankings adicionales</div>
              {[
                ["ranking-empresas", "Empresas con mas hallazgos"],
                ["ranking-areas", "Areas con mas hallazgos"],
                ["ranking-tipos", "Tipos mas frecuentes"],
                ["ranking-responsables", "Responsables pendientes"],
              ].map(([id, label]) => (
                <button key={id} type="button" onClick={() => aplicarAccion(id, `${label} activo.`)} style={{ ...botonStyle(id), justifyContent: "space-between" }}>
                  <span>{label}</span>
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
