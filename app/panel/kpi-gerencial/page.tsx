"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  analizarKpiGerencialAvanzado,
  filtrarHallazgosKpiGerencial,
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
import { obtenerAuthProfileActual } from "../../services/authProfileService";
import {
  construirAlcanceVisibleCE,
  filtrosHallazgosDesdeAlcanceCE,
} from "../../services/visibleScope";
import PreventiveLegalRibbon from "../../components/PreventiveLegalRibbon";
import { readClientBrandingFromPanelConfig } from "../../services/clientBranding";

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

type FiltrosInformeGerencial = FiltrosKpiGerencial & {
  sinFechaCompromiso?: boolean;
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

type TipoInformeGerencial =
  | "ejecutivo-general"
  | "criticos-vencidos"
  | "calidad-dato";

type NivelDetalleInformeGerencial =
  | "resumen-gerencial"
  | "informe-operativo"
  | "completo-anexos";

type AlcanceInformeGerencial =
  | "general"
  | "empresaResponsable"
  | "empresaReportante"
  | "obra"
  | "area"
  | "responsableCierre"
  | "periodo";

type SeccionInformeGerencial =
  | "kpis"
  | "resumen"
  | "riesgos"
  | "recomendacion"
  | "calidad-dato"
  | "nota-normativa"
  | "advertencias"
  | "radar"
  | "tendencia"
  | "matriz"
  | "comparaciones"
  | "cierre-vencimiento"
  | "control-inmediato"
  | "ranking-empresa-reportante"
  | "ranking-empresa-responsable"
  | "ranking-obras"
  | "ranking-areas"
  | "ranking-tipos"
  | "ranking-responsables"
  | "criticos-abiertos"
  | "vencidos-abiertos"
  | "sin-fecha-compromiso"
  | "cerrados"
  | "backlog-no-cerrado"
  | "detalle-resumido"
  | "anexos";

type GraficoInformeGerencial =
  | "radar"
  | "tendencia"
  | "matriz"
  | "comparaciones"
  | "cierre-vencimiento"
  | "calidad-dato"
  | "control-inmediato";

type RankingInformeGerencial =
  | "ranking-empresa-reportante"
  | "ranking-empresa-responsable"
  | "ranking-obras"
  | "ranking-areas"
  | "ranking-tipos"
  | "ranking-responsables";

type DetalleInformeGerencial =
  | "sin-detalle"
  | "detalle-resumido"
  | "detalle-filtrado"
  | "anexo-completo-futuro";

type MaxFilasDetalleInforme = 5 | 10 | 20;

type SerieTendenciaInforme =
  | "total-reportado"
  | "criticos-abiertos"
  | "vencidos-abiertos"
  | "cerrados"
  | "sin-fecha-compromiso";

type FocoComparativoInforme =
  | "mayor-carga-critica"
  | "mas-vencidos"
  | "mas-cerrados"
  | "mejor-tasa-cierre"
  | "peor-tasa-cierre"
  | "mayor-backlog";

type AnalisisSeccionInformeGerencial = {
  id: SeccionInformeGerencial;
  titulo: string;
  observacion: string;
  brecha: string;
  accion: string;
  base: string;
};

type EstadoPdfInformeGerencial = "idle" | "generando" | "generado" | "error";

type UsuarioGeneradorInforme = {
  nombre: string;
  cargo: string;
  empresa: string;
  rol?: string;
  correo?: string;
  foto?: string;
};

const LIMITE_REGISTROS_ANALISIS = 500;
const PANEL_PROFILE_STORAGE_KEY = "ce_panel_profile";

const plantillasInformeGerencial: Array<{
  id: TipoInformeGerencial;
  titulo: string;
  detalle: string;
  secciones: SeccionInformeGerencial[];
  nivelDetalle: NivelDetalleInformeGerencial;
  graficos: GraficoInformeGerencial[];
  rankings: RankingInformeGerencial[];
  detalleInforme: DetalleInformeGerencial;
  maxFilasDetalle: MaxFilasDetalleInforme;
}> = [
  {
    id: "ejecutivo-general",
    titulo: "Informe Ejecutivo General",
    detalle: "Vision global para gerencia y mandante con KPIs, focos y recomendacion.",
    nivelDetalle: "resumen-gerencial",
    secciones: [
      "kpis",
      "resumen",
      "riesgos",
      "recomendacion",
      "calidad-dato",
      "nota-normativa",
      "advertencias",
    ],
    graficos: ["radar", "tendencia", "matriz"],
    rankings: ["ranking-empresa-reportante", "ranking-obras"],
    detalleInforme: "sin-detalle",
    maxFilasDetalle: 5,
  },
  {
    id: "criticos-vencidos",
    titulo: "Informe Criticos y Vencidos",
    detalle: "Presion de cierre sobre criticos abiertos, vencidos y trazabilidad de plazo.",
    nivelDetalle: "informe-operativo",
    secciones: [
      "kpis",
      "riesgos",
      "criticos-abiertos",
      "vencidos-abiertos",
      "sin-fecha-compromiso",
      "cierre-vencimiento",
      "detalle-resumido",
      "recomendacion",
      "advertencias",
    ],
    graficos: ["radar", "tendencia", "cierre-vencimiento"],
    rankings: ["ranking-empresa-responsable", "ranking-responsables"],
    detalleInforme: "detalle-resumido",
    maxFilasDetalle: 10,
  },
  {
    id: "calidad-dato",
    titulo: "Informe Calidad del Dato",
    detalle: "Completitud de GPS, evidencia, responsable y fecha compromiso.",
    nivelDetalle: "resumen-gerencial",
    secciones: [
      "resumen",
      "calidad-dato",
      "recomendacion",
      "nota-normativa",
      "advertencias",
    ],
    graficos: ["calidad-dato", "control-inmediato"],
    rankings: ["ranking-empresa-reportante", "ranking-obras"],
    detalleInforme: "detalle-resumido",
    maxFilasDetalle: 5,
  },
];

const seccionesPrincipalesInformeGerencial: Array<{
  id: SeccionInformeGerencial;
  label: string;
}> = [
  { id: "kpis", label: "KPIs principales" },
  { id: "resumen", label: "Resumen ejecutivo" },
  { id: "riesgos", label: "Riesgos principales" },
  { id: "recomendacion", label: "Recomendacion preventiva" },
  { id: "calidad-dato", label: "Calidad del dato" },
  { id: "nota-normativa", label: "Nota normativa" },
  { id: "advertencias", label: "Advertencias" },
];

const graficosInformeGerencial: Array<{
  id: GraficoInformeGerencial;
  label: string;
}> = [
  { id: "radar", label: "Radar gerencial" },
  { id: "tendencia", label: "Tendencia temporal" },
  { id: "matriz", label: "Matriz comparativa" },
  { id: "comparaciones", label: "Comparaciones" },
  { id: "cierre-vencimiento", label: "Cierre y vencimiento" },
  { id: "calidad-dato", label: "Calidad del dato" },
  { id: "control-inmediato", label: "Control inmediato" },
];

const rankingsInformeGerencial: Array<{
  id: RankingInformeGerencial;
  label: string;
}> = [
  { id: "ranking-empresa-reportante", label: "Empresa reportante" },
  { id: "ranking-empresa-responsable", label: "Empresa responsable" },
  { id: "ranking-obras", label: "Obras" },
  { id: "ranking-areas", label: "Areas" },
  { id: "ranking-tipos", label: "Tipos de hallazgo" },
  { id: "ranking-responsables", label: "Responsables cierre" },
];

const hallazgosDetalleInformeGerencial: Array<{
  id: SeccionInformeGerencial;
  label: string;
}> = [
  { id: "criticos-abiertos", label: "Criticos abiertos" },
  { id: "vencidos-abiertos", label: "Vencidos abiertos" },
  { id: "sin-fecha-compromiso", label: "Sin fecha compromiso" },
  { id: "cerrados", label: "Cerrados" },
  { id: "backlog-no-cerrado", label: "Backlog no cerrado" },
  { id: "detalle-resumido", label: "Detalle accionable resumido" },
  { id: "anexos", label: "Anexo completo futuro" },
];

const seccionesInformeGerencial = [
  ...seccionesPrincipalesInformeGerencial,
  ...graficosInformeGerencial,
  ...rankingsInformeGerencial,
  ...hallazgosDetalleInformeGerencial,
];

const nivelDetalleInformeOpciones: Array<{
  id: NivelDetalleInformeGerencial;
  label: string;
  detalle: string;
}> = [
  {
    id: "resumen-gerencial",
    label: "Resumen gerencial",
    detalle: "KPIs, resumen, graficos clave, riesgos, recomendacion y nota normativa.",
  },
  {
    id: "informe-operativo",
    label: "Informe operativo",
    detalle: "Agrega criticos, vencidos, sin fecha, responsables y detalle resumido.",
  },
  {
    id: "completo-anexos",
    label: "Informe completo con anexos",
    detalle: "Deja preparado anexo completo para fase posterior.",
  },
];

const detalleInformeOpciones: Array<{
  id: DetalleInformeGerencial;
  label: string;
  detalle: string;
}> = [
  { id: "sin-detalle", label: "No incluir detalle", detalle: "Solo lectura ejecutiva." },
  { id: "detalle-resumido", label: "Detalle resumido", detalle: "Filas principales para seguimiento." },
  { id: "detalle-filtrado", label: "Detalle filtrado actual", detalle: "Usa el alcance actual del informe." },
  { id: "anexo-completo-futuro", label: "Anexo completo futuro", detalle: "Preparado para fase posterior." },
];

const maxFilasDetalleInformeOpciones: MaxFilasDetalleInforme[] = [5, 10, 20];

const seriesTendenciaInformeOpciones: Array<{
  id: SerieTendenciaInforme;
  label: string;
}> = [
  { id: "total-reportado", label: "Total reportado" },
  { id: "criticos-abiertos", label: "Criticos abiertos" },
  { id: "vencidos-abiertos", label: "Vencidos abiertos" },
  { id: "cerrados", label: "Cerrados" },
  { id: "sin-fecha-compromiso", label: "Sin fecha compromiso" },
];

const focoComparativoInformeOpciones: Array<{
  id: FocoComparativoInforme;
  label: string;
  detalle: string;
}> = [
  {
    id: "mayor-carga-critica",
    label: "Mayor carga critica",
    detalle: "Ordena empresas responsables por hallazgos criticos.",
  },
  {
    id: "mas-vencidos",
    label: "Mas vencidos",
    detalle: "Prioriza empresas responsables con vencidos abiertos.",
  },
  {
    id: "mas-cerrados",
    label: "Mas cerrados",
    detalle: "Destaca volumen de hallazgos cerrados.",
  },
  {
    id: "mejor-tasa-cierre",
    label: "Mejor tasa cierre",
    detalle: "Muestra mayor porcentaje de cierre con datos disponibles.",
  },
  {
    id: "peor-tasa-cierre",
    label: "Peor tasa cierre",
    detalle: "Muestra menor porcentaje de cierre con datos disponibles.",
  },
  {
    id: "mayor-backlog",
    label: "Mayor backlog",
    detalle: "Estima carga abierta no cerrada por empresa responsable.",
  },
];

const recomendacionesNivelDetalleInforme: Record<
  NivelDetalleInformeGerencial,
  {
    secciones: SeccionInformeGerencial[];
    graficos: GraficoInformeGerencial[];
    rankings: RankingInformeGerencial[];
    detalleInforme: DetalleInformeGerencial;
    maxFilasDetalle: MaxFilasDetalleInforme;
  }
> = {
  "resumen-gerencial": {
    secciones: ["kpis", "resumen", "riesgos", "recomendacion", "calidad-dato", "nota-normativa", "advertencias"],
    graficos: ["radar", "tendencia", "matriz"],
    rankings: ["ranking-empresa-reportante", "ranking-obras"],
    detalleInforme: "sin-detalle",
    maxFilasDetalle: 5,
  },
  "informe-operativo": {
    secciones: ["kpis", "resumen", "riesgos", "criticos-abiertos", "vencidos-abiertos", "sin-fecha-compromiso", "detalle-resumido", "recomendacion", "advertencias"],
    graficos: ["radar", "tendencia", "cierre-vencimiento", "comparaciones"],
    rankings: ["ranking-empresa-responsable", "ranking-obras", "ranking-responsables"],
    detalleInforme: "detalle-resumido",
    maxFilasDetalle: 10,
  },
  "completo-anexos": {
    secciones: ["kpis", "resumen", "riesgos", "criticos-abiertos", "vencidos-abiertos", "sin-fecha-compromiso", "cerrados", "backlog-no-cerrado", "detalle-resumido", "anexos", "recomendacion", "nota-normativa", "advertencias"],
    graficos: ["radar", "tendencia", "matriz", "comparaciones", "cierre-vencimiento", "calidad-dato", "control-inmediato"],
    rankings: ["ranking-empresa-reportante", "ranking-empresa-responsable", "ranking-obras", "ranking-areas", "ranking-tipos", "ranking-responsables"],
    detalleInforme: "anexo-completo-futuro",
    maxFilasDetalle: 20,
  },
};

const listaEtiquetasInforme = <T extends string>(
  opciones: Array<{ id: T; label: string }>,
  seleccion: T[]
) => {
  const labels = seleccion
    .map((id) => opciones.find((opcion) => opcion.id === id)?.label || id)
    .filter(Boolean);
  return labels.length ? labels : ["Sin seleccion"];
};

function etiquetaNivelDetalleInforme(id: NivelDetalleInformeGerencial) {
  return nivelDetalleInformeOpciones.find((opcion) => opcion.id === id)?.label || id;
}

function etiquetaDetalleInforme(id: DetalleInformeGerencial) {
  return detalleInformeOpciones.find((opcion) => opcion.id === id)?.label || id;
}

function etiquetaSeccionInforme(id: SeccionInformeGerencial) {
  return seccionesInformeGerencial.find((seccion) => seccion.id === id)?.label || id;
}

function etiquetaGraficoInforme(id: GraficoInformeGerencial) {
  return graficosInformeGerencial.find((grafico) => grafico.id === id)?.label || id;
}

function etiquetaRankingInforme(id: RankingInformeGerencial) {
  return rankingsInformeGerencial.find((ranking) => ranking.id === id)?.label || id;
}

function etiquetaSerieTendenciaInforme(id: SerieTendenciaInforme) {
  return (
    seriesTendenciaInformeOpciones.find((serie) => serie.id === id)?.label ||
    id
  );
}

function etiquetaFocoComparativoInforme(id: FocoComparativoInforme) {
  return (
    focoComparativoInformeOpciones.find((foco) => foco.id === id)?.label ||
    id
  );
}

function maxFilasDetalleDesdeValor(valor: string): MaxFilasDetalleInforme {
  const numero = Number(valor);
  return numero === 5 || numero === 10 || numero === 20 ? numero : 10;
}

function formatearMesInforme(valor: string) {
  const [anio, mes] = valor.split("-").map(Number);
  if (!anio || !mes) return valor;
  const fecha = new Date(anio, mes - 1, 1);
  return fecha.toLocaleDateString("es-CL", { month: "long", year: "numeric" });
}

function tituloBaseInforme(tipo: TipoInformeGerencial, nivel: NivelDetalleInformeGerencial) {
  if (tipo === "criticos-vencidos") {
    return nivel === "completo-anexos"
      ? "Informe de Gestion Vigente con Backlog No Cerrado"
      : "Informe de Gestion Preventiva: Criticos y Vencidos Abiertos";
  }
  if (tipo === "calidad-dato") return "Informe de Calidad del Dato Preventivo";
  return nivel === "informe-operativo"
    ? "Informe Operativo de Hallazgos Preventivos"
    : "Informe Ejecutivo General de Hallazgos Preventivos";
}

function obtenerTituloSeccionInforme(id: SeccionInformeGerencial) {
  return etiquetaSeccionInforme(id);
}

function escaparHtmlInforme(valor?: unknown) {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function limpiarNombreArchivoInforme(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

function inicialesUsuarioInforme(nombre: string) {
  const partes = nombre
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  const iniciales = partes.map((parte) => parte.charAt(0).toUpperCase()).join("");
  return iniciales || "AD";
}

function fotoPerfilPermitidaInforme(valor?: string) {
  if (!valor) return "";
  const foto = valor.trim();
  if (foto.startsWith("data:image/")) return foto;
  if (foto.startsWith("http://") || foto.startsWith("https://")) return foto;
  if (foto.startsWith("/") && !foto.startsWith("//")) return foto;
  return "";
}

function leerUsuarioGeneradorInforme(): UsuarioGeneradorInforme {
  const fallback: UsuarioGeneradorInforme = {
    nombre: "Usuario administrador",
    cargo: "Perfil gerencial",
    empresa: "Criterio Estratégico",
  };

  if (typeof window === "undefined") return fallback;

  try {
    const perfilGuardado = window.localStorage.getItem(PANEL_PROFILE_STORAGE_KEY);
    if (!perfilGuardado) return fallback;

    const perfil = JSON.parse(perfilGuardado) as Partial<{
      nombrePerfil: string;
      cargoPerfil: string;
      empresaPerfil: string;
      rolPerfil: string;
      correoPerfil: string;
      fotoPerfil: string;
    }>;

    const nombre = perfil.nombrePerfil?.trim() || fallback.nombre;
    const cargo = perfil.cargoPerfil?.trim() || fallback.cargo;
    const empresa = perfil.empresaPerfil?.trim() || fallback.empresa;
    const rol = perfil.rolPerfil?.trim() || fallback.rol;
    const correo = perfil.correoPerfil?.trim() || "";
    const foto = fotoPerfilPermitidaInforme(perfil.fotoPerfil);

    return {
      nombre,
      cargo,
      empresa,
      rol,
      ...(correo ? { correo } : {}),
      ...(foto ? { foto } : {}),
    };
  } catch {
    return fallback;
  }
}

async function cargarUsuarioGeneradorInforme(): Promise<UsuarioGeneradorInforme> {
  const local = leerUsuarioGeneradorInforme();
  const auth = await obtenerAuthProfileActual();

  if (!auth.perfil) return local;

  return {
    nombre: auth.perfil.nombre || local.nombre,
    cargo: auth.perfil.cargo || local.cargo,
    empresa: local.empresa,
    rol: auth.perfil.rol || local.rol,
    correo: auth.perfil.email || local.correo,
    foto: fotoPerfilPermitidaInforme(auth.perfil.fotoUrl || local.foto),
  };
}

const notaNormativaInformeGerencial =
  "Este analisis apoya la lectura de gestion preventiva bajo el marco de Ley 16.744, DS 44 y DS 594, con foco en trazabilidad, evidencia, responsables, seguimiento y mejora continua. No reemplaza auditoria legal ni validacion tecnica formal.";

const alcanceInformeOpciones: Array<{
  id: AlcanceInformeGerencial;
  label: string;
}> = [
  { id: "general", label: "General" },
  { id: "empresaResponsable", label: "Empresa responsable" },
  { id: "empresaReportante", label: "Empresa reportante" },
  { id: "obra", label: "Obra" },
  { id: "area", label: "Area" },
  { id: "responsableCierre", label: "Responsable cierre" },
  { id: "periodo", label: "Periodo actual filtrado" },
];

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

const filtrosInformeIniciales: FiltrosInformeGerencial = {
  gps: "todos",
  evidencia: "todos",
  vencimiento: "todos",
  soloCriticosAbiertos: false,
  soloReincidencias: false,
  sinFechaCompromiso: false,
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
  const [hallazgos, setHallazgos] = useState<HallazgoKpiGerencial[]>([]);
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
  const [tipoInformeGerencial, setTipoInformeGerencial] =
    useState<TipoInformeGerencial>("ejecutivo-general");
  const [alcanceInformeGerencial, setAlcanceInformeGerencial] =
    useState<AlcanceInformeGerencial>("general");
  const [valorAlcanceInformeGerencial, setValorAlcanceInformeGerencial] =
    useState("");
  const [filtrosInformeGerencial, setFiltrosInformeGerencial] =
    useState<FiltrosInformeGerencial>(filtrosInformeIniciales);
  const [nivelDetalleInformeGerencial, setNivelDetalleInformeGerencial] =
    useState<NivelDetalleInformeGerencial>("resumen-gerencial");
  const [seccionesInformeSeleccionadas, setSeccionesInformeSeleccionadas] =
    useState<SeccionInformeGerencial[]>([]);
  const [graficosInformeSeleccionados, setGraficosInformeSeleccionados] =
    useState<GraficoInformeGerencial[]>([]);
  const [rankingsInformeSeleccionados, setRankingsInformeSeleccionados] =
    useState<RankingInformeGerencial[]>([]);
  const [detalleInformeGerencial, setDetalleInformeGerencial] =
    useState<DetalleInformeGerencial>("sin-detalle");
  const [maxFilasDetalleInforme, setMaxFilasDetalleInforme] =
    useState<MaxFilasDetalleInforme>(10);
  const [seriesTendenciaInformeSeleccionadas, setSeriesTendenciaInformeSeleccionadas] =
    useState<SerieTendenciaInforme[]>([]);
  const [rankingPrincipalInforme, setRankingPrincipalInforme] =
    useState<RankingInformeGerencial>("ranking-empresa-responsable");
  const [focoComparativoInforme, setFocoComparativoInforme] =
    useState<FocoComparativoInforme>("mayor-carga-critica");
  const [estadoPdfInformeGerencial, setEstadoPdfInformeGerencial] =
    useState<EstadoPdfInformeGerencial>("idle");
  const [usuarioGeneradorInforme, setUsuarioGeneradorInforme] =
    useState<UsuarioGeneradorInforme>(() => leerUsuarioGeneradorInforme());

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
      const hallazgosKpi = datosPanel.map((hallazgo) =>
          convertirHallazgoKpi(hallazgo as HallazgoPanelGerencial)
      );
      setHallazgos(hallazgosKpi);
      setMensaje(
        hallazgosKpi.length > 0
          ? "Analisis actualizado con hallazgos disponibles para gerencia."
          : "Sin reportes registrados para esta empresa."
      );
    } catch (error) {
      console.warn("No se pudo cargar KPI Gerencial Avanzado.", error);
      const fallback = alcanceGlobal
        ? hallazgosMock.map((hallazgo) => convertirHallazgoKpi(hallazgo))
        : [];
      setHallazgos(fallback);
      setMensaje(
        alcanceGlobal
          ? "Se uso fallback local para mantener disponible el modulo gerencial."
          : "Sin reportes registrados para esta empresa."
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
  useEffect(() => {
    let activo = true;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    async function cargarGenerador() {
      const generador = await cargarUsuarioGeneradorInforme();
      if (activo) setUsuarioGeneradorInforme(generador);
    }

    const frameId = window.requestAnimationFrame(() => {
      timeoutId = setTimeout(() => {
        if (activo) void cargarGenerador();
      }, 0);
    });

    return () => {
      activo = false;
      window.cancelAnimationFrame(frameId);
      if (timeoutId) clearTimeout(timeoutId);
    };
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
  const periodoTendenciaDesdeFecha = (valor?: string) => {
    if (!valor) return "Sin fecha";
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) return "Sin fecha";
    return fecha.toISOString().slice(0, 7);
  };
  const criticosAbiertosPorPeriodo = new Map<string, number>();
  const vencidosAbiertosPorPeriodo = new Map<string, number>();

  analisis.hallazgos.forEach((hallazgo) => {
    const periodo = periodoTendenciaDesdeFecha(hallazgo.fechaISO);
    if (hallazgo.criticidad === "CRITICO" && esHallazgoAbiertoGerencial(hallazgo)) {
      criticosAbiertosPorPeriodo.set(
        periodo,
        (criticosAbiertosPorPeriodo.get(periodo) || 0) + 1
      );
    }
    if (esHallazgoVencidoDetalle(hallazgo)) {
      vencidosAbiertosPorPeriodo.set(
        periodo,
        (vencidosAbiertosPorPeriodo.get(periodo) || 0) + 1
      );
    }
  });
  const tendenciaTemporalVisible = analisis.tendenciaTemporal.slice(-10);
  const tendenciaSeriesVisible = tendenciaTemporalVisible.map((item) => ({
    ...item,
    criticosAbiertos: criticosAbiertosPorPeriodo.get(item.periodo) || 0,
    vencidosAbiertos: vencidosAbiertosPorPeriodo.get(item.periodo) || 0,
  }));
  const maxTendencia = Math.max(
    1,
    ...tendenciaSeriesVisible.flatMap((item) => [
      item.total,
      item.criticosAbiertos,
      item.vencidosAbiertos,
    ])
  );
  const tendenciaEscalaMaxima = Math.max(2, maxTendencia);
  const tendenciaEscalaMedia = Math.ceil(tendenciaEscalaMaxima / 2);
  const tendenciaChartWidth = 680;
  const tendenciaChartHeight = 168;
  const tendenciaPlotLeft = 54;
  const tendenciaPlotRight = 642;
  const tendenciaPlotTop = 20;
  const tendenciaPlotBottom = 132;
  const tendenciaPlotWidth = tendenciaPlotRight - tendenciaPlotLeft;
  const tendenciaPlotHeight = tendenciaPlotBottom - tendenciaPlotTop;
  const tendenciaY = (valor: number) =>
    tendenciaPlotBottom - (valor / tendenciaEscalaMaxima) * tendenciaPlotHeight;
  const tendenciaPuntos = tendenciaTemporalVisible.map((item, index, lista) => {
    const x =
      lista.length <= 1
        ? (tendenciaPlotLeft + tendenciaPlotRight) / 2
        : tendenciaPlotLeft + (index / (lista.length - 1)) * tendenciaPlotWidth;
    const criticosAbiertos = criticosAbiertosPorPeriodo.get(item.periodo) || 0;
    const vencidosAbiertos = vencidosAbiertosPorPeriodo.get(item.periodo) || 0;

    return {
      ...item,
      criticosAbiertos,
      vencidosAbiertos,
      x,
      yTotal: tendenciaY(item.total),
      yCriticos: tendenciaY(criticosAbiertos),
      yVencidos: tendenciaY(vencidosAbiertos),
    };
  });
  const tendenciaTotalPolyline = tendenciaPuntos
    .map((item) => `${item.x},${item.yTotal}`)
    .join(" ");
  const tendenciaCriticosPolyline = tendenciaPuntos
    .map((item) => `${item.x},${item.yCriticos}`)
    .join(" ");
  const tendenciaVencidosPolyline = tendenciaPuntos
    .map((item) => `${item.x},${item.yVencidos}`)
    .join(" ");
  const tendenciaEscalas = [
    tendenciaEscalaMaxima,
    tendenciaEscalaMedia,
    0,
  ];
  const tendenciaLineasVerticales =
    tendenciaPuntos.length > 1
      ? tendenciaPuntos.map((item) => item.x)
      : [
          tendenciaPlotLeft,
          (tendenciaPlotLeft + tendenciaPlotRight) / 2,
          tendenciaPlotRight,
        ];
  const tendenciaSegmentoUnico = 86;
  const radarGerencial = useMemo(() => {
    const abiertos = analisis.hallazgos.filter(esHallazgoAbiertoGerencial);
    const criticosAbiertos = abiertos.filter(
      (hallazgo) => hallazgo.criticidad === "CRITICO"
    );
    const vencidosAbiertos = analisis.hallazgos.filter(esHallazgoVencidoDetalle);
    const sinFechaCompromiso = abiertos.filter(
      (hallazgo) => !hallazgo.fechaCompromiso
    );
    const rankingRadar = (
      hallazgosRadar: HallazgoKpiGerencial[],
      obtenerNombre: (hallazgo: HallazgoKpiGerencial) => string
    ) => {
      const conteo = new Map<string, number>();

      hallazgosRadar.forEach((hallazgo) => {
        const nombre = obtenerNombre(hallazgo) || "Sin datos";
        conteo.set(nombre, (conteo.get(nombre) || 0) + 1);
      });

      return Array.from(conteo.entries())
        .map(([nombre, total]) => ({ nombre, total }))
        .sort((actual, siguiente) => siguiente.total - actual.total)
        .slice(0, 3);
    };

    return {
      empresasCriticas: rankingRadar(
        criticosAbiertos,
        (hallazgo) => hallazgo.empresaResponsable || "Sin empresa responsable"
      ),
      obrasVencidas: rankingRadar(
        vencidosAbiertos,
        (hallazgo) => hallazgo.obra || "Sin obra"
      ),
      responsablesPendientes: rankingRadar(
        abiertos,
        (hallazgo) => hallazgo.responsableCierre || "Sin asignar"
      ),
      sinFechaTotal: sinFechaCompromiso.length,
      sinFechaFoco: rankingRadar(
        sinFechaCompromiso,
        (hallazgo) =>
          `${hallazgo.empresaResponsable || hallazgo.empresaReportante || "Sin empresa"} · ${hallazgo.obra || "Sin obra"}`
      )[0],
    };
  }, [analisis.hallazgos]);
  const matrizComparativaGerencial = useMemo(() => {
    const abiertos = analisis.hallazgos.filter(esHallazgoAbiertoGerencial);
    const criticosAbiertos = abiertos.filter(
      (hallazgo) => hallazgo.criticidad === "CRITICO"
    );
    const vencidosAbiertos = analisis.hallazgos.filter(esHallazgoVencidoDetalle);
    const rankingDesdeHallazgos = (
      hallazgosMatriz: HallazgoKpiGerencial[],
      obtenerNombre: (hallazgo: HallazgoKpiGerencial) => string
    ) => {
      const conteo = new Map<string, number>();

      hallazgosMatriz.forEach((hallazgo) => {
        const nombre = obtenerNombre(hallazgo) || "Sin datos";
        conteo.set(nombre, (conteo.get(nombre) || 0) + 1);
      });

      return Array.from(conteo.entries())
        .map(([nombre, total]) => ({ nombre, total }))
        .sort((actual, siguiente) => siguiente.total - actual.total);
    };
    const rankingDesdeAnalisis = (ranking: RankingKpiGerencial[]) =>
      ranking.map((item) => ({ nombre: item.nombre, total: item.total }));

    return [
      {
        id: "matriz-empresas-criticas",
        titulo: "Empresas con mayor carga critica",
        subtitulo: "Criticos abiertos por empresa responsable.",
        data: rankingDesdeHallazgos(
          criticosAbiertos,
          (hallazgo) => hallazgo.empresaResponsable || "Sin empresa responsable"
        ),
        color: "#ef4444",
      },
      {
        id: "matriz-empresas-pendientes",
        titulo: "Empresas responsables con mas pendientes",
        subtitulo: "Hallazgos abiertos por empresa responsable.",
        data: rankingDesdeHallazgos(
          abiertos,
          (hallazgo) => hallazgo.empresaResponsable || "Sin empresa responsable"
        ),
        color: "#38bdf8",
      },
      {
        id: "matriz-obras-vencidas",
        titulo: "Obras con mas vencidos",
        subtitulo: "Vencidos abiertos por obra/proyecto.",
        data: rankingDesdeHallazgos(
          vencidosAbiertos,
          (hallazgo) => hallazgo.obra || "Sin obra"
        ),
        color: "#f97316",
      },
      {
        id: "matriz-responsables-abiertos",
        titulo: "Responsables con mas hallazgos abiertos",
        subtitulo: "Pendientes por responsable de cierre.",
        data: rankingDesdeHallazgos(
          abiertos,
          (hallazgo) => hallazgo.responsableCierre || "Sin asignar"
        ),
        color: "#0ea5e9",
      },
      {
        id: "matriz-areas-repeticion",
        titulo: "Areas con mayor repeticion",
        subtitulo: "Concentracion total por area.",
        data: rankingDesdeAnalisis(analisis.porArea),
        color: "#8b5cf6",
      },
      {
        id: "matriz-tipos-frecuentes",
        titulo: "Tipos de hallazgo mas frecuentes",
        subtitulo: "Familias de hallazgo con mayor carga.",
        data: rankingDesdeAnalisis(analisis.porTipo),
        color: "#22c55e",
      },
    ];
  }, [analisis.hallazgos, analisis.porArea, analisis.porTipo]);
  const pulsoLateralGerencial = useMemo(() => {
    const abiertos = analisis.hallazgos.filter(esHallazgoAbiertoGerencial);
    const vencidosAbiertos = analisis.hallazgos.filter(esHallazgoVencidoDetalle);
    const abiertosSinFecha = abiertos.filter((hallazgo) => !hallazgo.fechaCompromiso);
    const abiertosEnPlazo = abiertos.filter(
      (hallazgo) => hallazgo.fechaCompromiso && !esHallazgoVencidoDetalle(hallazgo)
    );
    const conResponsable = analisis.hallazgos.filter(
      (hallazgo) =>
        Boolean(hallazgo.responsableCierre) &&
        hallazgo.responsableCierre !== "Sin responsable"
    );
    const abiertosSinResponsable = abiertos.filter(
      (hallazgo) =>
        !hallazgo.responsableCierre ||
        hallazgo.responsableCierre === "Sin responsable"
    );
    const totalCriticidad = Math.max(
      1,
      analisis.porCriticidad.CRITICO +
        analisis.porCriticidad.ALTO +
        analisis.porCriticidad.MEDIO +
        analisis.porCriticidad.BAJO
    );
    const totalEstado = Math.max(1, analisis.total);
    const totalHallazgos = Math.max(1, analisis.hallazgos.length);
    const totalAbiertos = Math.max(1, abiertos.length);

    return {
      criticidad: [
        { label: "Criticos", total: analisis.porCriticidad.CRITICO, color: "#ef4444" },
        { label: "Altos", total: analisis.porCriticidad.ALTO, color: "#f97316" },
        { label: "Medios", total: analisis.porCriticidad.MEDIO, color: "#facc15" },
        { label: "Bajos", total: analisis.porCriticidad.BAJO, color: "#22c55e" },
      ],
      presion: [
        { label: "Cerrados", total: analisis.cerrados, color: "#22c55e" },
        { label: "Abiertos", total: abiertos.length, color: "#38bdf8" },
        { label: "Vencidos", total: vencidosAbiertos.length, color: "#f97316" },
        { label: "Sin plazo", total: abiertosSinFecha.length, color: "#facc15" },
      ],
      cierre: [
        { label: "Cerrados", total: analisis.cerrados, color: "#22c55e" },
        { label: "Abiertos", total: abiertos.length, color: "#38bdf8" },
        { label: "En plazo", total: abiertosEnPlazo.length, color: "#60a5fa" },
        { label: "Vencidos", total: vencidosAbiertos.length, color: "#f97316" },
      ],
      calidad: [
        { label: "Con GPS", total: analisis.hallazgos.filter((hallazgo) => hallazgo.tieneGps).length, color: "#38bdf8" },
        { label: "Con evidencia", total: analisis.hallazgos.filter((hallazgo) => Boolean(hallazgo.fotos?.length)).length, color: "#22c55e" },
        { label: "Responsable", total: conResponsable.length, color: "#8b5cf6" },
        { label: "Fecha compromiso", total: analisis.hallazgos.filter((hallazgo) => Boolean(hallazgo.fechaCompromiso)).length, color: "#60a5fa" },
      ],
      brechas: [
        { label: "Criticos abiertos", total: abiertos.filter((hallazgo) => hallazgo.criticidad === "CRITICO").length, color: "#ef4444" },
        { label: "Vencidos abiertos", total: vencidosAbiertos.length, color: "#f97316" },
        { label: "Sin fecha compromiso", total: abiertosSinFecha.length, color: "#facc15" },
        { label: "Sin responsable", total: abiertosSinResponsable.length, color: "#8b5cf6" },
      ],
      abiertos: abiertos.length,
      abiertosSinFecha: abiertosSinFecha.length,
      abiertosEnPlazo: abiertosEnPlazo.length,
      totalCriticidad,
      totalEstado,
      totalHallazgos,
      totalAbiertos,
      vencidosAbiertos: vencidosAbiertos.length,
    };
  }, [analisis.hallazgos, analisis.porCriticidad, analisis.total, analisis.cerrados]);
  const plantillaInformeActiva =
    plantillasInformeGerencial.find((plantilla) => plantilla.id === tipoInformeGerencial) ||
    plantillasInformeGerencial[0];
  const aplicarConfiguracionInforme = (configuracion: {
    nivelDetalle: NivelDetalleInformeGerencial;
    secciones: SeccionInformeGerencial[];
    graficos: GraficoInformeGerencial[];
    rankings: RankingInformeGerencial[];
    detalleInforme: DetalleInformeGerencial;
    maxFilasDetalle: MaxFilasDetalleInforme;
  }) => {
    setNivelDetalleInformeGerencial(configuracion.nivelDetalle);
    setSeccionesInformeSeleccionadas(configuracion.secciones);
    setGraficosInformeSeleccionados(configuracion.graficos);
    setRankingsInformeSeleccionados(configuracion.rankings);
    setDetalleInformeGerencial(configuracion.detalleInforme);
    setMaxFilasDetalleInforme(configuracion.maxFilasDetalle);
  };
  const aplicarNivelDetalleInforme = (nivel: NivelDetalleInformeGerencial) => {
    const recomendacion = recomendacionesNivelDetalleInforme[nivel];
    aplicarConfiguracionInforme({
      nivelDetalle: nivel,
      ...recomendacion,
    });
  };
  const alternarSeccionInforme = (id: SeccionInformeGerencial, activo: boolean) => {
    setSeccionesInformeSeleccionadas((actual) =>
      activo
        ? Array.from(new Set([...actual, id]))
        : actual.filter((item) => item !== id)
    );
  };
  const alternarGraficoInforme = (id: GraficoInformeGerencial, activo: boolean) => {
    setGraficosInformeSeleccionados((actual) =>
      activo
        ? Array.from(new Set([...actual, id]))
        : actual.filter((item) => item !== id)
    );
  };
  const alternarRankingInforme = (id: RankingInformeGerencial, activo: boolean) => {
    setRankingsInformeSeleccionados((actual) =>
      activo
        ? Array.from(new Set([...actual, id]))
        : actual.filter((item) => item !== id)
    );
  };
  const alternarSerieTendenciaInforme = (
    id: SerieTendenciaInforme,
    activo: boolean
  ) => {
    setSeriesTendenciaInformeSeleccionadas((actual) => {
      const siguiente = activo
        ? Array.from(new Set([...actual, id]))
        : actual.filter((item) => item !== id);
      return siguiente;
    });
  };
  const cambiarDetalleInformeGerencial = (detalle: DetalleInformeGerencial) => {
    setDetalleInformeGerencial(detalle);
    setSeccionesInformeSeleccionadas((actual) => {
      const sinDetalle = actual.filter(
        (item) => item !== "detalle-resumido" && item !== "anexos"
      );
      if (detalle === "sin-detalle") return sinDetalle;
      if (detalle === "anexo-completo-futuro") {
        return Array.from(new Set([...sinDetalle, "anexos"]));
      }
      return Array.from(new Set([...sinDetalle, "detalle-resumido"]));
    });
  };
  const asignarFiltroInforme = (cambios: Partial<FiltrosInformeGerencial>) => {
    setFiltrosInformeGerencial((actual) => ({
      ...actual,
      ...cambios,
    }));
  };
  const limpiarInformeGerencial = () => {
    setFiltrosInformeGerencial(filtrosInformeIniciales);
    setAlcanceInformeGerencial("general");
    setValorAlcanceInformeGerencial("");
    setNivelDetalleInformeGerencial("resumen-gerencial");
    setSeccionesInformeSeleccionadas([]);
    setGraficosInformeSeleccionados([]);
    setRankingsInformeSeleccionados([]);
    setDetalleInformeGerencial("sin-detalle");
    setMaxFilasDetalleInforme(10);
    setEstadoPdfInformeGerencial("idle");
    setMensaje("Constructor de informe limpiado. No hay elementos seleccionados.");
  };
  const agregarFiltrosActualesAlInforme = () => {
    setFiltrosInformeGerencial({
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
      sinFechaCompromiso: false,
    });
    setMensaje("Filtros actuales agregados explicitamente al informe.");
  };
  const aplicarPeriodoInforme = (periodo: "hoy" | "semana" | "mes" | "periodo-filtrado") => {
    const hoy = new Date();
    const hoyISO = hoy.toISOString().slice(0, 10);

    if (periodo === "hoy") {
      asignarFiltroInforme({ fechaDesde: hoyISO, fechaHasta: hoyISO, semana: undefined, mes: undefined });
      return;
    }

    if (periodo === "semana") {
      const inicioSemana = new Date(hoy);
      const dia = inicioSemana.getDay();
      inicioSemana.setDate(inicioSemana.getDate() - (dia === 0 ? 6 : dia - 1));
      asignarFiltroInforme({
        fechaDesde: inicioSemana.toISOString().slice(0, 10),
        fechaHasta: hoyISO,
        semana: undefined,
        mes: undefined,
      });
      return;
    }

    if (periodo === "mes") {
      asignarFiltroInforme({
        fechaDesde: undefined,
        fechaHasta: undefined,
        semana: undefined,
        mes: hoyISO.slice(0, 7),
      });
      return;
    }

    asignarFiltroInforme({
      fechaDesde: filtros.fechaDesde || undefined,
      fechaHasta: filtros.fechaHasta || undefined,
      semana: filtros.semana || undefined,
      mes: filtros.mes || undefined,
    });
  };
  const opcionesAlcanceInformeGerencial = useMemo(
    () => ({
      empresaResponsable: valorUnico(
        analisis.hallazgos.map(
          (hallazgo) => hallazgo.empresaResponsable || "Sin empresa responsable"
        )
      ),
      empresaReportante: valorUnico(
        analisis.hallazgos.map(
          (hallazgo) => hallazgo.empresaReportante || hallazgo.empresa
        )
      ),
      obra: valorUnico(analisis.hallazgos.map((hallazgo) => hallazgo.obra)),
      area: valorUnico(analisis.hallazgos.map((hallazgo) => hallazgo.area)),
      responsableCierre: valorUnico(
        analisis.hallazgos.map(
          (hallazgo) => hallazgo.responsableCierre || "Sin responsable"
        )
      ),
    }),
    [analisis.hallazgos]
  );
  const valoresAlcanceInformeGerencial =
    alcanceInformeGerencial === "empresaResponsable"
      ? opcionesAlcanceInformeGerencial.empresaResponsable
      : alcanceInformeGerencial === "empresaReportante"
        ? opcionesAlcanceInformeGerencial.empresaReportante
        : alcanceInformeGerencial === "obra"
          ? opcionesAlcanceInformeGerencial.obra
          : alcanceInformeGerencial === "area"
            ? opcionesAlcanceInformeGerencial.area
            : alcanceInformeGerencial === "responsableCierre"
              ? opcionesAlcanceInformeGerencial.responsableCierre
              : [];
  const comandosInformeResumen = useMemo(() => {
    const comandos: string[] = [];
    const agregar = (label: string, valor?: string | boolean) => {
      if (!valor) return;
      comandos.push(label);
    };

    agregar(`Empresa reportante: ${filtrosInformeGerencial.empresaReportante}`, filtrosInformeGerencial.empresaReportante);
    agregar(`Empresa responsable: ${filtrosInformeGerencial.empresaResponsable}`, filtrosInformeGerencial.empresaResponsable);
    agregar(`Obra/proyecto: ${filtrosInformeGerencial.obra}`, filtrosInformeGerencial.obra);
    agregar(`Area: ${filtrosInformeGerencial.area}`, filtrosInformeGerencial.area);
    agregar(`Tipo: ${filtrosInformeGerencial.tipoHallazgo}`, filtrosInformeGerencial.tipoHallazgo);
    agregar(`Supervisor/reportante: ${filtrosInformeGerencial.reportante}`, filtrosInformeGerencial.reportante);
    agregar(`Responsable cierre: ${filtrosInformeGerencial.responsableCierre}`, filtrosInformeGerencial.responsableCierre);
    agregar(`Cargo responsable: ${filtrosInformeGerencial.responsableCargo}`, filtrosInformeGerencial.responsableCargo);
    agregar(
      `Criticidad: ${filtrosInformeGerencial.criticidad ? etiquetaCriticidad(filtrosInformeGerencial.criticidad) : ""}`,
      filtrosInformeGerencial.criticidad
    );
    agregar(
      `Estado: ${filtrosInformeGerencial.estado ? filtrosInformeGerencial.estado.replace("_", " ") : ""}`,
      filtrosInformeGerencial.estado
    );
    agregar(`Estado cierre: ${filtrosInformeGerencial.estadoCierre}`, filtrosInformeGerencial.estadoCierre);
    agregar("Criticos abiertos", filtrosInformeGerencial.soloCriticosAbiertos);
    agregar("Solo reincidencias", filtrosInformeGerencial.soloReincidencias);
    agregar("Solo sin fecha compromiso", filtrosInformeGerencial.sinFechaCompromiso);
    agregar(
      filtrosInformeGerencial.vencimiento === "vencidos"
        ? "Solo vencidos"
        : filtrosInformeGerencial.vencimiento === "no-vencidos"
          ? "Solo no vencidos"
          : "",
      filtrosInformeGerencial.vencimiento !== "todos"
    );
    agregar(
      filtrosInformeGerencial.gps === "con-gps"
        ? "Con GPS"
        : filtrosInformeGerencial.gps === "sin-gps"
          ? "Sin GPS"
          : "",
      filtrosInformeGerencial.gps !== "todos"
    );
    agregar(
      filtrosInformeGerencial.evidencia === "con-evidencia"
        ? "Con evidencia"
        : filtrosInformeGerencial.evidencia === "sin-evidencia"
          ? "Sin evidencia"
          : "",
      filtrosInformeGerencial.evidencia !== "todos"
    );
    agregar(`Desde: ${filtrosInformeGerencial.fechaDesde}`, filtrosInformeGerencial.fechaDesde);
    agregar(`Hasta: ${filtrosInformeGerencial.fechaHasta}`, filtrosInformeGerencial.fechaHasta);
    agregar(`Semana desde: ${filtrosInformeGerencial.semana}`, filtrosInformeGerencial.semana);
    agregar(`Mes: ${filtrosInformeGerencial.mes}`, filtrosInformeGerencial.mes);

    return comandos;
  }, [filtrosInformeGerencial]);
  const hayComandosFiltroInforme = comandosInformeResumen.length > 0;
  const hayElementosInformeGerencial =
    hayComandosFiltroInforme ||
    seccionesInformeSeleccionadas.length > 0 ||
    graficosInformeSeleccionados.length > 0 ||
    rankingsInformeSeleccionados.length > 0 ||
    detalleInformeGerencial !== "sin-detalle";
  const hallazgosInformeGerencial = useMemo(() => {
    if (!hayElementosInformeGerencial || !hayComandosFiltroInforme) return [];

    return filtrarHallazgosKpiGerencial(hallazgos, filtrosInformeGerencial).filter(
      (hallazgo) =>
        filtrosInformeGerencial.sinFechaCompromiso
          ? esHallazgoAbiertoGerencial(hallazgo) && !hallazgo.fechaCompromiso
          : true
    );
  }, [
    filtrosInformeGerencial,
    hallazgos,
    hayComandosFiltroInforme,
    hayElementosInformeGerencial,
  ]);
  const analisisInformeGerencial = useMemo(
    () => analizarKpiGerencialAvanzado(hallazgosInformeGerencial),
    [hallazgosInformeGerencial]
  );
  const metricasInformeGerencial = useMemo(() => {
    const abiertos = hallazgosInformeGerencial.filter(esHallazgoAbiertoGerencial);
    const criticosAbiertos = abiertos.filter(
      (hallazgo) => hallazgo.criticidad === "CRITICO"
    );
    const vencidosAbiertos = hallazgosInformeGerencial.filter(esHallazgoVencidoDetalle);
    const sinFechaCompromiso = abiertos.filter((hallazgo) => !hallazgo.fechaCompromiso);
    const sinResponsable = abiertos.filter(
      (hallazgo) =>
        !hallazgo.responsableCierre ||
        hallazgo.responsableCierre === "Sin responsable"
    );
    const total = Math.max(1, hallazgosInformeGerencial.length);

    return {
      abiertos: abiertos.length,
      criticosAbiertos: criticosAbiertos.length,
      vencidosAbiertos: vencidosAbiertos.length,
      sinFechaCompromiso: sinFechaCompromiso.length,
      sinResponsable: sinResponsable.length,
      conGps: hallazgosInformeGerencial.filter((hallazgo) => hallazgo.tieneGps).length,
      conEvidencia: hallazgosInformeGerencial.filter((hallazgo) =>
        Boolean(hallazgo.fotos?.length)
      ).length,
      conResponsable: hallazgosInformeGerencial.filter(
        (hallazgo) =>
          Boolean(hallazgo.responsableCierre) &&
          hallazgo.responsableCierre !== "Sin responsable"
      ).length,
      conFechaCompromiso: hallazgosInformeGerencial.filter((hallazgo) =>
        Boolean(hallazgo.fechaCompromiso)
      ).length,
      total,
    };
  }, [hallazgosInformeGerencial]);
  const tendenciaInformeConfigurada = useMemo(() => {
    const criticosAbiertosPorPeriodoInforme = new Map<string, number>();
    const vencidosAbiertosPorPeriodoInforme = new Map<string, number>();
    const sinFechaPorPeriodoInforme = new Map<string, number>();

    hallazgosInformeGerencial.forEach((hallazgo) => {
      const periodo = periodoTendenciaDesdeFecha(hallazgo.fechaISO);
      const abierto = esHallazgoAbiertoGerencial(hallazgo);

      if (hallazgo.criticidad === "CRITICO" && abierto) {
        criticosAbiertosPorPeriodoInforme.set(
          periodo,
          (criticosAbiertosPorPeriodoInforme.get(periodo) || 0) + 1
        );
      }
      if (esHallazgoVencidoDetalle(hallazgo)) {
        vencidosAbiertosPorPeriodoInforme.set(
          periodo,
          (vencidosAbiertosPorPeriodoInforme.get(periodo) || 0) + 1
        );
      }
      if (abierto && !hallazgo.fechaCompromiso) {
        sinFechaPorPeriodoInforme.set(
          periodo,
          (sinFechaPorPeriodoInforme.get(periodo) || 0) + 1
        );
      }
    });

    const periodosBase =
      analisisInformeGerencial.tendenciaTemporal.length > 0
        ? analisisInformeGerencial.tendenciaTemporal.slice(-6)
        : [{ periodo: "Sin periodo", total: 0, abiertos: 0, cerrados: 0, criticos: 0 }];
    const tendenciasPorPeriodo = new Map(
      analisisInformeGerencial.tendenciaTemporal.map((item) => [item.periodo, item])
    );

    return periodosBase.map((item) => {
      const tendencia = tendenciasPorPeriodo.get(item.periodo) || item;
      const valores = seriesTendenciaInformeSeleccionadas.map((serie) => {
        const valor =
          serie === "total-reportado"
            ? tendencia.total
            : serie === "criticos-abiertos"
              ? criticosAbiertosPorPeriodoInforme.get(item.periodo) || 0
              : serie === "vencidos-abiertos"
                ? vencidosAbiertosPorPeriodoInforme.get(item.periodo) || 0
                : serie === "cerrados"
                  ? tendencia.cerrados
                  : sinFechaPorPeriodoInforme.get(item.periodo) || 0;

        return `${etiquetaSerieTendenciaInforme(serie)}: ${valor}`;
      });

      return {
        periodo: item.periodo,
        valores,
      };
    });
  }, [
    analisisInformeGerencial.tendenciaTemporal,
    hallazgosInformeGerencial,
    seriesTendenciaInformeSeleccionadas,
  ]);
  const configuracionRankingsInformeGerencial = useMemo<
    Record<RankingInformeGerencial, { titulo: string; metrica: string; data: RankingKpiGerencial[] }>
  >(
    () => ({
      "ranking-empresa-reportante": {
        titulo: "Ranking empresa reportante",
        metrica: "Hallazgos reportados",
        data: analisisInformeGerencial.porEmpresaReportante,
      },
      "ranking-empresa-responsable": {
        titulo: "Ranking empresa responsable",
        metrica: "Hallazgos asignados / involucrados",
        data: analisisInformeGerencial.porEmpresaResponsable,
      },
      "ranking-obras": {
        titulo: "Ranking obras",
        metrica: "Hallazgos por obra",
        data: analisisInformeGerencial.porObra,
      },
      "ranking-areas": {
        titulo: "Ranking areas",
        metrica: "Hallazgos por area",
        data: analisisInformeGerencial.porArea,
      },
      "ranking-tipos": {
        titulo: "Ranking tipos de hallazgo",
        metrica: "Frecuencia por tipo",
        data: analisisInformeGerencial.porTipo,
      },
      "ranking-responsables": {
        titulo: "Ranking responsables de cierre",
        metrica: "Carga por responsable",
        data: analisisInformeGerencial.porResponsable,
      },
    }),
    [analisisInformeGerencial]
  );
  const focoComparativoInformeGerencial = useMemo(() => {
    const base = [...analisisInformeGerencial.porEmpresaResponsable];
    const ordenar = (items: RankingKpiGerencial[]) => {
      if (focoComparativoInforme === "mas-vencidos") {
        return items.sort((a, b) => b.vencidos - a.vencidos || b.total - a.total);
      }
      if (focoComparativoInforme === "mas-cerrados") {
        return items.sort((a, b) => b.cerrados - a.cerrados || b.total - a.total);
      }
      if (focoComparativoInforme === "mejor-tasa-cierre") {
        return items.sort((a, b) => b.tasaCierre - a.tasaCierre || b.cerrados - a.cerrados);
      }
      if (focoComparativoInforme === "peor-tasa-cierre") {
        return items.sort((a, b) => a.tasaCierre - b.tasaCierre || b.total - a.total);
      }
      if (focoComparativoInforme === "mayor-backlog") {
        return items.sort(
          (a, b) => b.total - b.cerrados - (a.total - a.cerrados) || b.total - a.total
        );
      }
      return items.sort((a, b) => b.criticos - a.criticos || b.total - a.total);
    };
    const valores = ordenar(base).slice(0, 5).map((item, index) => {
      const backlog = Math.max(0, item.total - item.cerrados);
      return `${index + 1}. ${item.nombre}: total ${item.total}, criticos ${item.criticos}, vencidos ${item.vencidos}, cerrados ${item.cerrados}, tasa cierre ${item.tasaCierre}%, backlog ${backlog}`;
    });

    return {
      titulo: etiquetaFocoComparativoInforme(focoComparativoInforme),
      detalle:
        focoComparativoInformeOpciones.find((opcion) => opcion.id === focoComparativoInforme)
          ?.detalle || "Comparacion seleccionada por el usuario.",
      valores,
    };
  }, [analisisInformeGerencial.porEmpresaResponsable, focoComparativoInforme]);
  const etiquetaAlcanceInforme =
    alcanceInformeGerencial === "periodo"
      ? "Periodo actual filtrado"
      : alcanceInformeGerencial === "general"
        ? "General"
        : `${alcanceInformeOpciones.find((opcion) => opcion.id === alcanceInformeGerencial)?.label || "Alcance"}: ${
            valorAlcanceInformeGerencial || "Todos"
          }`;
  const periodoInformeEtiqueta = filtrosInformeGerencial.mes
    ? formatearMesInforme(filtrosInformeGerencial.mes)
    : filtrosInformeGerencial.semana
      ? `Semana desde ${filtrosInformeGerencial.semana}`
      : filtrosInformeGerencial.fechaDesde || filtrosInformeGerencial.fechaHasta
        ? `${filtrosInformeGerencial.fechaDesde || "inicio"} a ${filtrosInformeGerencial.fechaHasta || "hoy"}`
        : "Sin periodo seleccionado";
  const informeConBacklogVisible =
    seccionesInformeSeleccionadas.includes("backlog-no-cerrado") ||
    Boolean(
      filtrosInformeGerencial.fechaDesde ||
      filtrosInformeGerencial.fechaHasta ||
      filtrosInformeGerencial.semana ||
      filtrosInformeGerencial.mes
    );
  const tituloAutomaticoInformeGerencial = hayElementosInformeGerencial
    ? [
        tituloBaseInforme(tipoInformeGerencial, nivelDetalleInformeGerencial),
        comandosInformeResumen.length ? "Alcance definido por comandos" : "Sin alcance operativo",
        periodoInformeEtiqueta,
        informeConBacklogVisible ? "Gestion vigente con backlog" : null,
      ].filter(Boolean).join(" — ")
    : "Informe Gerencial en construcción";
  const seccionesAnalisisInformeGerencial = Array.from(
    new Set<SeccionInformeGerencial>([
      ...seccionesInformeSeleccionadas,
      ...graficosInformeSeleccionados,
      ...rankingsInformeSeleccionados,
      ...(detalleInformeGerencial === "sin-detalle"
        ? []
        : detalleInformeGerencial === "anexo-completo-futuro"
          ? ["anexos" as SeccionInformeGerencial]
          : ["detalle-resumido" as SeccionInformeGerencial]),
    ])
  );
  const etiquetasSeccionesPrincipalesSeleccionadas = listaEtiquetasInforme(
    seccionesPrincipalesInformeGerencial,
    seccionesInformeSeleccionadas.filter((id) =>
      seccionesPrincipalesInformeGerencial.some((seccion) => seccion.id === id)
    )
  );
  const etiquetasHallazgosDetalleSeleccionados = listaEtiquetasInforme(
    hallazgosDetalleInformeGerencial,
    seccionesInformeSeleccionadas.filter((id) =>
      hallazgosDetalleInformeGerencial.some((seccion) => seccion.id === id)
    )
  );
  const etiquetasGraficosSeleccionados = listaEtiquetasInforme(
    graficosInformeGerencial,
    graficosInformeSeleccionados
  );
  const etiquetasRankingsSeleccionados = listaEtiquetasInforme(
    rankingsInformeGerencial,
    rankingsInformeSeleccionados
  );
  const etiquetasSeriesTendenciaSeleccionadas = listaEtiquetasInforme(
    seriesTendenciaInformeOpciones,
    seriesTendenciaInformeSeleccionadas
  );
  const etiquetaRankingPrincipalSeleccionado =
    etiquetaRankingInforme(rankingPrincipalInforme);
  const etiquetaFocoComparativoSeleccionado =
    etiquetaFocoComparativoInforme(focoComparativoInforme);
  const cantidadDetalleEstimada =
    detalleInformeGerencial === "sin-detalle"
      ? 0
      : detalleInformeGerencial === "detalle-resumido"
        ? Math.min(maxFilasDetalleInforme, hallazgosInformeGerencial.length)
        : hallazgosInformeGerencial.length;
  const empresaFocoInforme =
    analisisInformeGerencial.porEmpresaResponsable[0]?.nombre ||
    analisisInformeGerencial.porEmpresaReportante[0]?.nombre ||
    "sin empresa dominante";
  const obraFocoInforme =
    analisisInformeGerencial.porObra[0]?.nombre || "sin obra dominante";
  const responsableFocoInforme =
    analisisInformeGerencial.porResponsable[0]?.nombre || "sin responsable dominante";
  const resumenInformeGerencial = useMemo(() => {
    if (!hayElementosInformeGerencial) {
      return "No se han seleccionado elementos para este informe.";
    }

    if (!hayComandosFiltroInforme) {
      return "Seleccione al menos un comando de alcance, riesgo, estado, evidencia o periodo para alimentar el informe con datos reales.";
    }

    if (analisisInformeGerencial.total === 0) {
      return "No hay hallazgos disponibles para los comandos seleccionados del informe.";
    }

    if (tipoInformeGerencial === "criticos-vencidos") {
      return `Durante el alcance seleccionado se registran ${analisisInformeGerencial.total} hallazgos, con ${metricasInformeGerencial.criticosAbiertos} criticos abiertos, ${metricasInformeGerencial.vencidosAbiertos} vencidos abiertos y ${metricasInformeGerencial.sinFechaCompromiso} abiertos sin fecha compromiso. La presion principal se concentra en ${empresaFocoInforme} y el responsable con mayor carga es ${responsableFocoInforme}. Se recomienda priorizar cierre, fecha compromiso y responsable real.`;
    }

    if (tipoInformeGerencial === "calidad-dato") {
      return `La calidad del dato del alcance seleccionado muestra ${metricasInformeGerencial.conGps} registros con GPS, ${metricasInformeGerencial.conEvidencia} con evidencia de reporte, ${metricasInformeGerencial.conResponsable} con responsable asignado y ${metricasInformeGerencial.conFechaCompromiso} con fecha compromiso. Se recomienda regularizar registros sin responsable, sin plazo o sin evidencia antes de usarlos como respaldo formal.`;
    }

    return `Durante el periodo analizado se registran ${analisisInformeGerencial.total} hallazgos, de los cuales ${metricasInformeGerencial.abiertos} permanecen abiertos. Se identifican ${metricasInformeGerencial.criticosAbiertos} criticos abiertos y ${metricasInformeGerencial.vencidosAbiertos} vencidos abiertos, con foco principal en ${empresaFocoInforme} y ${obraFocoInforme}. Se recomienda priorizar el cierre de hallazgos criticos y regularizar registros sin fecha compromiso.`;
  }, [
    analisisInformeGerencial.total,
    empresaFocoInforme,
    hayComandosFiltroInforme,
    hayElementosInformeGerencial,
    metricasInformeGerencial,
    obraFocoInforme,
    responsableFocoInforme,
    tipoInformeGerencial,
  ]);
  const advertenciasInformeGerencial = useMemo(
    () =>
      [
        hayElementosInformeGerencial
          ? "El analisis opera solo sobre los comandos y secciones seleccionados en el Constructor de Informe."
          : "No se han seleccionado elementos para este informe.",
        metricasGerenciales.analisisLimitadoPorCarga
          ? "El limite actual de carga puede no representar todo el historico si existen mas registros."
          : null,
        informeConBacklogVisible
          ? "El periodo debe leerse con backlog abierto/no cerrado de periodos anteriores para mantener trazabilidad de gestion vigente."
          : null,
        seccionesInformeSeleccionadas.includes("calidad-dato")
          ? "La evidencia de cierre requiere trazabilidad formal antes de usarse como cumplimiento contractual."
          : null,
        seccionesInformeSeleccionadas.includes("matriz") ||
        seccionesInformeSeleccionadas.includes("radar")
          ? "Los rankings y focos visuales son apoyo gerencial y deben respaldarse con el detalle accionable."
          : null,
        "La reincidencia es un patron preventivo simple y no debe usarse como prueba contractual definitiva.",
        "Los indices sinteticos de cumplimiento/preventivo son referenciales y no reemplazan validacion tecnica.",
        "Este informe no reemplaza auditoria legal ni validacion tecnica por profesional competente.",
      ].filter(Boolean) as string[],
    [
      hayElementosInformeGerencial,
      informeConBacklogVisible,
      metricasGerenciales.analisisLimitadoPorCarga,
      seccionesInformeSeleccionadas,
    ]
  );
  const analisisSeccionesInformeGerencial = useMemo<AnalisisSeccionInformeGerencial[]>(() => {
    const total = analisisInformeGerencial.total;
    const cerrados = analisisInformeGerencial.cerrados;
    const tasaCierre = analisisInformeGerencial.tasaCierre;
    const tipoPrincipal = analisisInformeGerencial.porTipo[0]?.nombre || "sin tipo dominante";
    const areaPrincipal = analisisInformeGerencial.porArea[0]?.nombre || "sin area dominante";
    const enfoquePlantilla =
      tipoInformeGerencial === "criticos-vencidos"
        ? "priorizar escalamiento, responsables nominales, fecha compromiso y evidencia de cierre documentada."
        : tipoInformeGerencial === "calidad-dato"
          ? "regularizar datos incompletos antes de usar el informe como respaldo documental o auditoria interna."
          : "concentrar decision gerencial en criticidad, plazos, responsables y brechas con mayor impacto preventivo.";

    const crearAnalisis = (
      id: SeccionInformeGerencial,
      observacion: string,
      brecha: string,
      accion: string,
      base = notaNormativaInformeGerencial
    ): AnalisisSeccionInformeGerencial => ({
      id,
      titulo: obtenerTituloSeccionInforme(id),
      observacion,
      brecha,
      accion,
      base,
    });

    return seccionesAnalisisInformeGerencial.map((seccion) => {
      switch (seccion) {
        case "kpis":
          return crearAnalisis(
            seccion,
            `El alcance incluye ${total} hallazgo(s), ${metricasInformeGerencial.abiertos} abierto(s), ${cerrados} cerrado(s), ${metricasInformeGerencial.criticosAbiertos} critico(s) abierto(s), ${metricasInformeGerencial.vencidosAbiertos} vencido(s) abierto(s), ${metricasInformeGerencial.sinFechaCompromiso} sin fecha compromiso y tasa de cierre ${tasaCierre}%.`,
            "La combinacion de criticidad, vencimiento y ausencia de plazo muestra presion operativa y posibles brechas de seguimiento preventivo.",
            `Usar estos KPIs para ordenar prioridades, exigir plan de cierre y ${enfoquePlantilla}`
          );
        case "resumen":
          return crearAnalisis(
            seccion,
            `La lectura global concentra foco en ${empresaFocoInforme}, ${obraFocoInforme} y responsable ${responsableFocoInforme}.`,
            "Una concentracion sostenida puede indicar exposicion preventiva activa o carga de gestion que requiere seguimiento de gerencia.",
            `Validar el foco con prevencion y administracion, confirmar causas, responsable, plazo y respaldo documental; luego ${enfoquePlantilla}`
          );
        case "riesgos":
          return crearAnalisis(
            seccion,
            `Los riesgos principales combinan ${metricasInformeGerencial.criticosAbiertos} critico(s), ${metricasInformeGerencial.vencidosAbiertos} vencido(s), ${metricasInformeGerencial.sinFechaCompromiso} sin fecha y ${metricasInformeGerencial.sinResponsable} sin responsable.`,
            "La suma de criticidad, atraso, ausencia de plazo y responsable debilita la gestion vigente.",
            "Priorizar responsables, plazos y evidencia de cierre para los focos con mayor presion preventiva."
          );
        case "radar":
          return crearAnalisis(
            seccion,
            `El radar prioriza empresas con carga critica, obras con vencidos, responsables pendientes y registros sin fecha compromiso en el alcance actual.`,
            "Estos focos muestran donde puede perderse control preventivo si no se asignan acciones, plazos y seguimiento verificable.",
            "Usar el radar para preparar comite, solicitar cierre documentado y revisar semanalmente los focos que concentran mayor presion."
          );
        case "tendencia":
          return crearAnalisis(
            seccion,
            "La tendencia temporal muestra evolucion de hallazgos reportados, criticos abiertos y vencidos abiertos con los filtros actuales.",
            "Un aumento sostenido o puntos altos en criticos/vencidos indican presion de gestion y posible acumulacion de brechas.",
            "Revisar los periodos con mayor carga y exigir plan de cierre documentado para los focos abiertos."
          );
        case "matriz":
          return crearAnalisis(
            seccion,
            `La matriz compara carga por empresas, obras, areas, tipos y responsables; destacan ${empresaFocoInforme}, ${obraFocoInforme}, ${areaPrincipal} y ${tipoPrincipal}.`,
            "La comparacion permite detectar concentraciones que pueden requerir intervencion preventiva, redistribucion de seguimiento o control por contrato.",
            "Presentar la matriz en reunion ejecutiva para definir prioridades por empresa, obra y responsable, evitando interpretar mayor reporte como peor desempeno sin revisar contexto."
          );
        case "comparaciones":
          return crearAnalisis(
            seccion,
            "Las comparaciones muestran variacion entre periodo actual y periodo anterior para volumen, criticidad y cierre.",
            "Variaciones fuertes requieren revisar si responden a cambio real de riesgo, carga operativa o diferencia de registro.",
            "Usar la comparacion como alerta gerencial y validar el detalle antes de definir conclusiones contractuales."
          );
        case "cierre-vencimiento":
          return crearAnalisis(
            seccion,
            `El cierre y vencimiento muestra ${metricasInformeGerencial.vencidosAbiertos} vencido(s), ${metricasInformeGerencial.sinFechaCompromiso} sin fecha y tasa de cierre ${tasaCierre}%.`,
            "La brecha de plazos y cierre afecta trazabilidad y oportunidad de la gestion preventiva.",
            "Escalar vencidos, regularizar fechas compromiso y validar evidencia o justificacion formal de cierre."
          );
        case "control-inmediato":
          return crearAnalisis(
            seccion,
            "El control inmediato resume focos que requieren atencion prioritaria por criticidad, vencimiento o falta de trazabilidad.",
            "Si estos focos no se gestionan, pueden mantenerse riesgos abiertos sin cierre verificable.",
            "Definir responsables nominales, plazos y evidencia esperada antes del siguiente comite."
          );
        case "criticos-abiertos":
          return crearAnalisis(
            seccion,
            `Se identifican ${metricasInformeGerencial.criticosAbiertos} hallazgo(s) critico(s) abierto(s) en los registros filtrados.`,
            "Mantener criticos abiertos representa exposicion preventiva activa y requiere control gerencial oportuno.",
            "Exigir plan de cierre inmediato, responsable nominal, fecha compromiso, evidencia y validacion tecnica de la accion correctiva."
          );
        case "vencidos-abiertos":
          return crearAnalisis(
            seccion,
            `Se identifican ${metricasInformeGerencial.vencidosAbiertos} hallazgo(s) vencido(s) abierto(s) en el alcance seleccionado.`,
            "El vencimiento abierto refleja brecha de plazo, seguimiento o escalamiento, y debilita la trazabilidad de cierre.",
            "Escalar con empresa responsable, confirmar causa del atraso, regularizar fecha y documentar cierre o justificacion de extension cuando corresponda."
          );
        case "sin-fecha-compromiso":
          return crearAnalisis(
            seccion,
            `Existen ${metricasInformeGerencial.sinFechaCompromiso} hallazgo(s) abierto(s) sin fecha compromiso.`,
            "La falta de fecha compromiso reduce trazabilidad, dificulta medir cumplimiento y debilita la gestion de seguimiento.",
            "Asignar fecha compromiso y responsable real antes de presentar el registro como control preventivo cerrado o trazable."
          );
        case "calidad-dato":
          return crearAnalisis(
            seccion,
            `La calidad del dato muestra ${metricasInformeGerencial.conGps}/${metricasInformeGerencial.total} con GPS, ${metricasInformeGerencial.conEvidencia}/${metricasInformeGerencial.total} con evidencia, ${metricasInformeGerencial.conResponsable}/${metricasInformeGerencial.total} con responsable y ${metricasInformeGerencial.conFechaCompromiso}/${metricasInformeGerencial.total} con fecha compromiso.`,
            "Datos incompletos reducen confiabilidad del informe y pueden afectar respaldo documental ante revisiones internas, mandante o auditoria.",
            "Regularizar GPS, evidencia, responsable y fecha compromiso en registros relevantes antes de usarlos para respaldo formal o contractual."
          );
        case "ranking-empresa-reportante":
          return crearAnalisis(
            seccion,
            `El ranking por empresa reportante muestra mayor carga en ${analisisInformeGerencial.porEmpresaReportante[0]?.nombre || empresaFocoInforme}.`,
            "Una mayor carga reportada puede reflejar exposicion, cultura de reporte o foco operacional que requiere interpretacion contextual.",
            "Cruzar empresa reportante con criticidad, obra y estado de cierre antes de emitir conclusiones de desempeno."
          );
        case "ranking-empresa-responsable":
          return crearAnalisis(
            seccion,
            `El ranking por empresa responsable muestra mayor carga en ${analisisInformeGerencial.porEmpresaResponsable[0]?.nombre || empresaFocoInforme}.`,
            "Una empresa responsable con mayor carga requiere seguimiento de compromisos, vencimientos y evidencia de cierre.",
            "Cruzar ranking con criticidad, vencimientos y cierres antes de definir exigencias o compromisos de gestion por empresa."
          );
        case "ranking-obras":
          return crearAnalisis(
            seccion,
            `El ranking de obras muestra mayor concentracion en ${obraFocoInforme}.`,
            "La concentracion por obra puede indicar condiciones operativas, supervisores, frentes o procesos que requieren intervencion preventiva focalizada.",
            "Usar el ranking para priorizar inspeccion, reunion de cierre y control de compromisos por proyecto."
          );
        case "ranking-responsables":
          return crearAnalisis(
            seccion,
            `El ranking de responsables concentra carga en ${responsableFocoInforme}.`,
            "Una alta carga en un responsable puede generar cuellos de botella, atrasos o falta de seguimiento documentado.",
            "Revisar carga real, reasignar seguimiento si corresponde y exigir actualizacion de estado y evidencia de cierre."
          );
        case "ranking-areas":
          return crearAnalisis(
            seccion,
            `El ranking por areas destaca ${areaPrincipal}.`,
            "La concentracion por area puede indicar exposicion operacional o brecha de control especifica.",
            "Revisar causas y acciones preventivas por area antes de escalar conclusiones generales."
          );
        case "ranking-tipos":
          return crearAnalisis(
            seccion,
            `El ranking por tipos destaca ${tipoPrincipal}.`,
            "La repeticion por tipo puede sugerir patron preventivo, no prueba contractual definitiva.",
            "Cruzar tipos repetidos con empresa, obra y evidencia antes de definir acciones correctivas estructurales."
          );
        case "cerrados":
          return crearAnalisis(
            seccion,
            `El alcance muestra ${cerrados} hallazgo(s) cerrado(s).`,
            "Los cierres deben revisarse contra evidencia, justificacion y trazabilidad antes de usarse como respaldo formal.",
            "Validar cierre con evidencia o justificacion formal y conservar respaldo documental."
          );
        case "backlog-no-cerrado":
          return crearAnalisis(
            seccion,
            "El backlog no cerrado representa gestion vigente pendiente de periodos anteriores.",
            "Ocultar backlog al filtrar un periodo puede subestimar la carga real y debilitar la trazabilidad.",
            "Mantener backlog visible en informes de gestion vigente hasta contar con cierre formal."
          );
        case "recomendacion":
          return crearAnalisis(
            seccion,
            analisisInformeGerencial.recomendacionPreventiva,
            "La recomendacion resume el foco preventivo principal, pero debe contrastarse con el detalle accionable y la evidencia disponible.",
            "Convertir la recomendacion en acuerdos de gestion: responsable, plazo, evidencia esperada y fecha de revision."
          );
        case "nota-normativa":
          return crearAnalisis(
            seccion,
            "La nota normativa ubica el informe como apoyo preventivo y no como certificacion legal.",
            "Sin validacion tecnica o legal, el informe no debe presentarse como cumplimiento absoluto.",
            "Usar la nota para enmarcar decisiones y solicitar revision profesional cuando corresponda."
          );
        case "advertencias":
          return crearAnalisis(
            seccion,
            "Las advertencias delimitan dataset, evidencia, reincidencias, indices sinteticos y alcance tecnico.",
            "Omitir advertencias puede inducir una lectura mas amplia que la soportada por los datos actuales.",
            "Mantener advertencias visibles antes de generar PDF real."
          );
        case "detalle-resumido":
          return crearAnalisis(
            seccion,
            `El detalle resumido considera ${hallazgosInformeGerencial.length} hallazgo(s) del alcance actual para revision operativa.`,
            "Sin revision de hallazgos concretos, los KPIs pueden quedarse como lectura agregada sin accion verificable.",
            "Usar el detalle para preparar seguimiento, comite o requerimientos a empresas responsables, manteniendo evidencia y trazabilidad de cada cierre."
          );
        case "anexos":
          return crearAnalisis(
            seccion,
            "Los anexos o detalle completo respaldan la trazabilidad del analisis con registros individuales.",
            "El uso contractual o de auditoria requiere validar que los datos, evidencias y estados esten completos y actualizados.",
            "Revisar anexo contra evidencia, responsable, fecha compromiso y cierre documentado antes de emitir conclusiones formales."
          );
        default:
          return crearAnalisis(
            seccion,
            "La seccion seleccionada aporta contexto al informe gerencial.",
            "Debe revisarse junto con filtros, alcance y detalle para evitar conclusiones fuera de contexto.",
            "Usar la seccion como apoyo a decision preventiva y seguimiento documentado."
          );
      }
    });
  }, [
    analisisInformeGerencial,
    empresaFocoInforme,
    hallazgosInformeGerencial.length,
    metricasInformeGerencial,
    obraFocoInforme,
    responsableFocoInforme,
    seccionesAnalisisInformeGerencial,
    tipoInformeGerencial,
  ]);
  const textoAnalisisSeccionesInformeGerencial = analisisSeccionesInformeGerencial
    .map(
      (analisisSeccion) =>
        `${analisisSeccion.titulo}\nObservación: ${analisisSeccion.observacion}\nBrecha o riesgo: ${analisisSeccion.brecha}\nAcción recomendada: ${analisisSeccion.accion}\nBase preventiva/normativa: ${analisisSeccion.base}`
    )
    .join("\n\n");
  const textoCopiableInformeGerencial = [
    tituloAutomaticoInformeGerencial,
    `Tipo de informe: ${plantillaInformeActiva.titulo}`,
    `Nivel de detalle: ${etiquetaNivelDetalleInforme(nivelDetalleInformeGerencial)}`,
    `Periodo: ${periodoInformeEtiqueta}`,
    `Hallazgos incluidos: ${analisisInformeGerencial.total}`,
    `Graficos incluidos: ${etiquetasGraficosSeleccionados.join(", ")}`,
    `Series de tendencia: ${etiquetasSeriesTendenciaSeleccionadas.join(", ")}`,
    `Rankings incluidos: ${etiquetasRankingsSeleccionados.join(", ")}`,
    `Ranking principal: ${etiquetaRankingPrincipalSeleccionado}`,
    `Foco comparativo: ${etiquetaFocoComparativoSeleccionado}`,
    `Detalle: ${etiquetaDetalleInforme(detalleInformeGerencial)}${
      detalleInformeGerencial === "detalle-resumido"
        ? `, maximo ${maxFilasDetalleInforme} filas`
        : ""
    }`,
    `Comandos del informe: ${
      comandosInformeResumen.length > 0
        ? comandosInformeResumen.join(", ")
        : "Sin comandos seleccionados"
    }`,
    "",
    resumenInformeGerencial,
    "",
    "Riesgos principales:",
    `- Criticos abiertos: ${metricasInformeGerencial.criticosAbiertos}`,
    `- Vencidos abiertos: ${metricasInformeGerencial.vencidosAbiertos}`,
    `- Sin fecha compromiso: ${metricasInformeGerencial.sinFechaCompromiso}`,
    "",
    `Recomendacion: ${analisisInformeGerencial.recomendacionPreventiva}`,
    "",
    "Análisis ejecutivo por sección:",
    textoAnalisisSeccionesInformeGerencial || "Sin secciones seleccionadas.",
    "",
    "Advertencias:",
    ...advertenciasInformeGerencial.map((advertencia) => `- ${advertencia}`),
    "",
    `Nota normativa: ${notaNormativaInformeGerencial}`,
  ].join("\n");
  const rankingIdsPdfInforme = Array.from(
    new Set<RankingInformeGerencial>(
      rankingsInformeSeleccionados.length > 0
        ? [rankingPrincipalInforme, ...rankingsInformeSeleccionados]
        : rankingsInformeSeleccionados
    )
  );
  const rankingsPdfInformeGerencial = rankingIdsPdfInforme.map(
    (id) => configuracionRankingsInformeGerencial[id]
  );
  const graficosPdfInformeGerencial = graficosInformeSeleccionados.map((id) => {
    const analisisGrafico = analisisSeccionesInformeGerencial.find(
      (item) => item.id === id
    );
    const configuracion: Record<
      GraficoInformeGerencial,
      { titulo: string; representa: string; valores: string[] }
    > = {
      radar: {
        titulo: "Radar gerencial",
        representa: "Focos ejecutivos priorizados por criticidad, vencimiento y responsables.",
        valores: [
          `Criticos abiertos: ${metricasInformeGerencial.criticosAbiertos}`,
          `Vencidos abiertos: ${metricasInformeGerencial.vencidosAbiertos}`,
          `Sin fecha compromiso: ${metricasInformeGerencial.sinFechaCompromiso}`,
        ],
      },
      tendencia: {
        titulo: "Tendencia temporal",
        representa:
          "Evolucion mensual configurada por el usuario para las series seleccionadas.",
        valores: tendenciaInformeConfigurada.map(
          (item) => `${item.periodo}: ${item.valores.join(", ")}`
        ),
      },
      matriz: {
        titulo: "Matriz comparativa gerencial",
        representa: "Comparacion de concentracion por empresa, obra, area, tipo y responsable.",
        valores: [
          `Empresa responsable foco: ${analisisInformeGerencial.porEmpresaResponsable[0]?.nombre || "Sin datos"}`,
          `Obra foco: ${analisisInformeGerencial.porObra[0]?.nombre || "Sin datos"}`,
          `Area foco: ${analisisInformeGerencial.porArea[0]?.nombre || "Sin datos"}`,
        ],
      },
      comparaciones: {
        titulo: "Comparaciones",
        representa: "Variacion entre periodo actual y periodo comparado en volumen, criticidad y cierre.",
        valores: analisisInformeGerencial.comparaciones.map(
          (item) =>
            `${item.etiqueta}: actual ${item.actual}, comparado ${item.comparado}, variacion ${item.variacion > 0 ? "+" : ""}${item.variacion}`
        ),
      },
      "cierre-vencimiento": {
        titulo: "Cierre y vencimiento",
        representa: "Presion de cierre, hallazgos vencidos y abiertos sin plazo.",
        valores: [
          `Tasa de cierre: ${analisisInformeGerencial.tasaCierre}%`,
          `Vencidos abiertos: ${metricasInformeGerencial.vencidosAbiertos}`,
          `Abiertos sin fecha compromiso: ${metricasInformeGerencial.sinFechaCompromiso}`,
        ],
      },
      "calidad-dato": {
        titulo: "Calidad del dato",
        representa: "Completitud de GPS, evidencia, responsable y fecha compromiso.",
        valores: [
          `Con GPS: ${metricasInformeGerencial.conGps} / ${analisisInformeGerencial.total || 0}`,
          `Con evidencia: ${metricasInformeGerencial.conEvidencia} / ${analisisInformeGerencial.total || 0}`,
          `Con responsable: ${metricasInformeGerencial.conResponsable} / ${analisisInformeGerencial.total || 0}`,
          `Con fecha compromiso: ${metricasInformeGerencial.conFechaCompromiso} / ${analisisInformeGerencial.total || 0}`,
        ],
      },
      "control-inmediato": {
        titulo: "Control inmediato",
        representa: "Brechas que requieren accion operativa inmediata dentro del filtro actual.",
        valores: [
          `Criticos abiertos: ${metricasInformeGerencial.criticosAbiertos}`,
          `Sin responsable: ${metricasInformeGerencial.sinResponsable}`,
          `Sin fecha compromiso: ${metricasInformeGerencial.sinFechaCompromiso}`,
        ],
      },
    };

    return {
      ...configuracion[id],
      analisis: analisisGrafico,
    };
  });
  const alcanceOperacionalInformePdf = [
    ["Empresa reportante", filtrosInformeGerencial.empresaReportante || "No seleccionada"],
    ["Empresa responsable / involucrada", filtrosInformeGerencial.empresaResponsable || "No seleccionada"],
    ["Obra / proyecto", filtrosInformeGerencial.obra || "No seleccionada"],
    ["Área", filtrosInformeGerencial.area || "No seleccionada"],
    ["Supervisor/reportante", filtrosInformeGerencial.reportante || "No seleccionado"],
    ["Responsable de cierre", filtrosInformeGerencial.responsableCierre || "No seleccionado"],
    ["Tipo de hallazgo", filtrosInformeGerencial.tipoHallazgo || "No seleccionado"],
    [
      "Criticidad",
      filtrosInformeGerencial.criticidad ? etiquetaCriticidad(filtrosInformeGerencial.criticidad) : "No seleccionada",
    ],
    ["Estado operativo", filtrosInformeGerencial.estado ? filtrosInformeGerencial.estado.replace("_", " ") : "No seleccionado"],
    ["Estado de cierre", filtrosInformeGerencial.estadoCierre || "No seleccionado"],
    ["Periodo", periodoInformeEtiqueta],
  ];
  const notasAlcanceInformePdf = [
    hayElementosInformeGerencial
      ? "El informe utiliza solo los comandos seleccionados explicitamente en el Constructor de Informe."
      : "No se han seleccionado elementos para este informe.",
    informeConBacklogVisible
      ? "Incluye lectura de gestión vigente con backlog abierto/no cerrado de periodos anteriores cuando corresponde."
      : "La lectura de backlog queda como advertencia preventiva para informes con periodo o gestión vigente.",
    "La fuente actual no distingue formalmente contratista/subcontratista como categoría separada; se informa como empresa responsable / involucrada y empresa reportante según los datos disponibles.",
  ];
  const empresasConsideradasInformePdf = [
    {
      titulo: "Empresas reportantes principales",
      items: analisisInformeGerencial.porEmpresaReportante
        .slice(0, 5)
        .map((item) => `${item.nombre} (${item.total})`),
    },
    {
      titulo: "Empresas responsables / involucradas principales",
      items: analisisInformeGerencial.porEmpresaResponsable
        .slice(0, 5)
        .map((item) => `${item.nombre} (${item.total})`),
    },
    {
      titulo: "Obras / proyectos principales",
      items: analisisInformeGerencial.porObra
        .slice(0, 5)
        .map((item) => `${item.nombre} (${item.total})`),
    },
  ];

  async function copiarResumenInformeGerencial() {
    activarBoton("copiar-informe-gerencial");
    try {
      await navigator.clipboard.writeText(textoCopiableInformeGerencial);
      setMensaje("Resumen ejecutivo del informe copiado al portapapeles.");
    } catch {
      setMensaje("No fue posible copiar automaticamente. Seleccione y copie el texto manualmente.");
    }
  }

  async function generarPdfInformeGerencial() {
    activarBoton("pdf-informe");
    setEstadoPdfInformeGerencial("generando");
    setMensaje("Generando PDF del informe gerencial.");

    const fechaGeneracion = new Date();
    const fechaDocumento = fechaGeneracion.toLocaleString("es-CL", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    const fechaDocumentoLarga = fechaGeneracion.toLocaleDateString("es-CL", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    const horaDocumento = fechaGeneracion.toLocaleTimeString("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const fechaArchivo = fechaGeneracion.toISOString().slice(0, 10);
    const nombreSeguro =
      limpiarNombreArchivoInforme(tituloAutomaticoInformeGerencial) ||
      "informe-gerencial-hallazgos";
    const nombreArchivo = `${nombreSeguro}-${fechaArchivo}.pdf`;
    const filtrosPdf =
      comandosInformeResumen.length > 0
        ? comandosInformeResumen
        : ["No se han seleccionado elementos para este informe."];
    const detallePdfActivo =
      detalleInformeGerencial !== "sin-detalle" ||
      seccionesInformeSeleccionadas.includes("detalle-resumido");
    const detallePdf = detallePdfActivo
      ? hallazgosInformeGerencial.slice(0, maxFilasDetalleInforme)
      : [];
    const estadoPlazoPdf = (hallazgo: HallazgoKpiGerencial) => {
      if (hallazgo.plazoExtendido) return "Plazo extendido";
      if (!hallazgo.fechaCompromiso) return "Sin fecha compromiso";
      if (esHallazgoVencidoDetalle(hallazgo)) {
        return `Vencido ${diasVencidoDetalle(hallazgo)} dia(s)`;
      }
      return "En plazo";
    };
    const renderLista = (items: string[]) =>
      items.map((item) => `<li>${escaparHtmlInforme(item)}</li>`).join("");
    const renderDato = (label: string, valor: string | number) => `
      <div class="pdf-kpi">
        <span>${escaparHtmlInforme(label)}</span>
        <strong>${escaparHtmlInforme(valor)}</strong>
      </div>
    `;
    const fotoGenerador = fotoPerfilPermitidaInforme(usuarioGeneradorInforme.foto);
    const clientBranding = readClientBrandingFromPanelConfig();
    const logoClientePdf = clientBranding.logoPrincipalUrl
      ? `<img class="pdf-client-logo" src="${escaparHtmlInforme(clientBranding.logoPrincipalUrl)}" alt="${escaparHtmlInforme(clientBranding.nombrePrincipal)}" />`
      : "";
    const inicialesGenerador = inicialesUsuarioInforme(usuarioGeneradorInforme.nombre);
    const avatarGenerador = fotoGenerador
      ? `<img src="${escaparHtmlInforme(fotoGenerador)}" alt="${escaparHtmlInforme(usuarioGeneradorInforme.nombre)}" />`
      : `<span>${escaparHtmlInforme(inicialesGenerador)}</span>`;
    const renderTablaRanking = (ranking: {
      titulo: string;
      metrica: string;
      data: RankingKpiGerencial[];
    }) => `
      <section class="pdf-section pdf-table-section pdf-avoid">
        <h2>${escaparHtmlInforme(ranking.titulo)}</h2>
        <p class="pdf-muted">${escaparHtmlInforme(ranking.metrica)}</p>
        <table>
          <thead>
            <tr>
              <th>Pos.</th>
              <th>Nombre</th>
              <th>Total</th>
              <th>Criticos</th>
              <th>Vencidos</th>
              <th>Cerrados</th>
              <th>Tasa cierre</th>
            </tr>
          </thead>
          <tbody>
            ${
              ranking.data.length > 0
                ? ranking.data
                    .slice(0, 8)
                    .map(
                      (item, index) => `
                        <tr>
                          <td>${index + 1}</td>
                          <td>${escaparHtmlInforme(item.nombre)}</td>
                          <td>${item.total}</td>
                          <td>${item.criticos}</td>
                          <td>${item.vencidos}</td>
                          <td>${item.cerrados}</td>
                          <td>${item.tasaCierre}%</td>
                        </tr>
                      `
                    )
                    .join("")
                : `<tr><td colspan="7">Sin datos suficientes para este ranking.</td></tr>`
            }
          </tbody>
        </table>
      </section>
    `;
    const htmlInforme = `
      <article class="pdf-doc">
        <style>
          @page { size: A4 portrait; margin: 14mm 14mm 22mm; }
          .pdf-doc {
            width: 190mm;
            box-sizing: border-box;
            background: #ffffff;
            color: #172033;
            font-family: Arial, Helvetica, sans-serif;
            line-height: 1.42;
            padding: 0 0 18mm;
          }
          .pdf-cover {
            border: 1px solid #dbeafe;
            border-left: 6px solid #1d4ed8;
            padding: 22px;
            margin-bottom: 16px;
            background: linear-gradient(135deg, #f8fbff 0%, #eef6ff 100%);
          }
          .pdf-brand {
            color: #1d4ed8;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 1.1px;
            text-transform: uppercase;
          }
          .pdf-cover-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 14px;
          }
          .pdf-client-brand {
            display: flex;
            align-items: center;
            gap: 10px;
            color: #0f172a;
            font-size: 12px;
            font-weight: 900;
          }
          .pdf-client-logo {
            width: 42px;
            height: 42px;
            object-fit: contain;
            border: 1px solid #dbeafe;
            border-radius: 10px;
            background: #ffffff;
            padding: 4px;
          }
          h1 {
            margin: 10px 0 8px;
            color: #0f172a;
            font-size: 24px;
            line-height: 1.15;
          }
          h2 {
            margin: 0 0 8px;
            color: #1d4ed8;
            font-size: 15px;
            line-height: 1.25;
          }
          h3 {
            margin: 0 0 6px;
            color: #0f172a;
            font-size: 13px;
          }
          p { margin: 0 0 8px; }
          .pdf-muted { color: #64748b; font-size: 11px; }
          .pdf-meta {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
            margin-top: 12px;
          }
          .pdf-meta div, .pdf-note, .pdf-section {
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            background: #ffffff;
          }
          .pdf-meta div {
            padding: 8px 10px;
            font-size: 11px;
          }
          .pdf-meta strong {
            display: block;
            color: #0f172a;
            font-size: 12px;
          }
          .pdf-generated-by {
            display: grid;
            grid-template-columns: 62px minmax(0, 1fr) auto;
            gap: 12px;
            align-items: center;
            margin-top: 14px;
            border: 1px solid #bfdbfe;
            border-radius: 14px;
            background: #ffffff;
            padding: 12px;
            box-shadow: 0 8px 20px rgba(37, 99, 235, 0.08);
          }
          .pdf-avatar {
            width: 58px;
            height: 58px;
            border-radius: 999px;
            display: grid;
            place-items: center;
            overflow: hidden;
            border: 2px solid #93c5fd;
            background: linear-gradient(135deg, #dbeafe, #eff6ff);
            color: #1d4ed8;
            font-size: 17px;
            font-weight: 900;
          }
          .pdf-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }
          .pdf-generated-title {
            color: #1d4ed8;
            font-size: 10px;
            font-weight: 900;
            letter-spacing: 0.8px;
            text-transform: uppercase;
            margin-bottom: 4px;
          }
          .pdf-generated-name {
            color: #0f172a;
            font-size: 15px;
            font-weight: 900;
            margin-bottom: 2px;
          }
          .pdf-generated-detail {
            color: #334155;
            font-size: 11px;
            font-weight: 700;
          }
          .pdf-generated-date {
            text-align: right;
            color: #475569;
            font-size: 10px;
            line-height: 1.45;
            min-width: 132px;
          }
          .pdf-generated-date strong {
            display: block;
            color: #0f172a;
            font-size: 12px;
          }
          .pdf-section {
            margin: 12px 0;
            padding: 13px;
            page-break-inside: avoid;
            break-inside: avoid;
            break-inside: avoid-page;
          }
          .pdf-note {
            margin: 10px 0;
            padding: 10px 12px;
            background: #f8fafc;
            color: #334155;
            font-size: 11px;
            page-break-inside: avoid;
            break-inside: avoid;
            break-inside: avoid-page;
          }
          .pdf-legal-base {
            border-color: #bfdbfe;
            background: #eff6ff;
            color: #1e3a8a;
            font-weight: 700;
          }
          .pdf-text-section {
            page-break-inside: avoid;
            break-inside: avoid;
            break-inside: avoid-page;
            orphans: 3;
            widows: 3;
          }
          .pdf-text-section p,
          .pdf-text-section li {
            orphans: 3;
            widows: 3;
          }
          .pdf-final-text-section {
            margin-bottom: 16mm;
            padding-bottom: 14px;
          }
          .pdf-safe-bottom {
            height: 14mm;
            page-break-inside: avoid;
            break-inside: avoid;
            break-inside: avoid-page;
          }
          .pdf-scope-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 7px;
            margin-bottom: 10px;
          }
          .pdf-scope-item {
            border: 1px solid #dbeafe;
            border-radius: 9px;
            padding: 7px 8px;
            background: #f8fbff;
            page-break-inside: avoid;
            break-inside: avoid;
            break-inside: avoid-page;
          }
          .pdf-scope-item span {
            display: block;
            color: #64748b;
            font-size: 8.5px;
            font-weight: 900;
            letter-spacing: 0.3px;
            text-transform: uppercase;
          }
          .pdf-scope-item strong {
            display: block;
            color: #0f172a;
            font-size: 11px;
            margin-top: 2px;
          }
          .pdf-section-compact {
            padding: 11px;
          }
          .pdf-section-flow {
            page-break-inside: auto;
            break-inside: auto;
          }
          .pdf-kpis {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 8px;
          }
          .pdf-kpi {
            border: 1px solid #dbeafe;
            border-radius: 10px;
            padding: 9px;
            background: #f8fbff;
            page-break-inside: avoid;
            break-inside: avoid;
            break-inside: avoid-page;
          }
          .pdf-kpi span {
            display: block;
            color: #64748b;
            font-size: 9px;
            font-weight: 800;
            text-transform: uppercase;
          }
          .pdf-kpi strong {
            display: block;
            color: #0f172a;
            font-size: 18px;
            margin-top: 3px;
          }
          .pdf-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 9px;
          }
          .pdf-chip-list {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin: 0;
            padding: 0;
            list-style: none;
          }
          .pdf-chip-list li {
            border: 1px solid #dbeafe;
            border-radius: 999px;
            padding: 5px 8px;
            background: #eff6ff;
            color: #1e3a8a;
            font-size: 10px;
            font-weight: 700;
          }
          .pdf-card {
            border: 1px solid #e2e8f0;
            border-left: 3px solid #2563eb;
            border-radius: 10px;
            padding: 10px;
            background: #ffffff;
            page-break-inside: avoid;
            break-inside: avoid;
            break-inside: avoid-page;
          }
          .pdf-card p { font-size: 11px; }
          .pdf-analysis-list {
            display: grid;
            grid-template-columns: minmax(0, 1fr);
            gap: 8px;
          }
          .pdf-analysis-card {
            padding: 8px 10px;
            border-left-color: #0ea5e9;
            page-break-inside: avoid;
            break-inside: avoid;
            break-inside: avoid-page;
          }
          .pdf-analysis-card h3 {
            margin-bottom: 5px;
            font-size: 12px;
          }
          .pdf-analysis-card p {
            margin: 0 0 5px;
            font-size: 10.2px;
            line-height: 1.32;
          }
          .pdf-analysis-card p:last-child { margin-bottom: 0; }
          .pdf-chart-list {
            display: grid;
            grid-template-columns: minmax(0, 1fr);
            gap: 9px;
          }
          .pdf-chart-card {
            width: 100%;
            box-sizing: border-box;
            padding: 9px 11px;
            border-left-color: #0891b2;
            page-break-inside: avoid;
            break-inside: avoid;
            break-inside: avoid-page;
          }
          .pdf-chart-card h3 {
            margin: 0 0 5px;
            font-size: 12.5px;
            line-height: 1.2;
            page-break-after: avoid;
            break-after: avoid;
          }
          .pdf-chart-card p {
            margin: 0 0 6px;
            font-size: 10.4px;
            line-height: 1.35;
          }
          .pdf-chart-card ul {
            margin-bottom: 6px;
          }
          .pdf-chart-card li {
            margin-bottom: 2px;
          }
          ul.pdf-list {
            margin: 0;
            padding-left: 18px;
            color: #334155;
            font-size: 11px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          tr, thead, tbody {
            page-break-inside: avoid;
            break-inside: avoid;
            break-inside: avoid-page;
          }
          th {
            text-align: left;
            background: #eff6ff;
            color: #1e3a8a;
            border: 1px solid #dbeafe;
            padding: 6px;
          }
          td {
            border: 1px solid #e2e8f0;
            padding: 6px;
            vertical-align: top;
          }
          .pdf-footer {
            margin-top: 10px;
            padding: 10px 0 12px;
            border-top: 1px solid #cbd5e1;
            color: #64748b;
            font-size: 10px;
            display: flex;
            justify-content: space-between;
            gap: 12px;
            page-break-inside: avoid;
            break-inside: avoid;
            break-inside: avoid-page;
          }
        </style>

        <header class="pdf-cover pdf-avoid">
          <div class="pdf-cover-top">
            <div class="pdf-client-brand">
              ${logoClientePdf}
              <span>${escaparHtmlInforme(clientBranding.nombrePrincipal)}</span>
            </div>
            <div class="pdf-brand">${escaparHtmlInforme(clientBranding.poweredByText)}</div>
          </div>
          <h1>${escaparHtmlInforme(tituloAutomaticoInformeGerencial)}</h1>
          <p class="pdf-muted">${escaparHtmlInforme(plantillaInformeActiva.titulo)} · ${escaparHtmlInforme(etiquetaNivelDetalleInforme(nivelDetalleInformeGerencial))} · ${escaparHtmlInforme(etiquetaAlcanceInforme)} · ${escaparHtmlInforme(periodoInformeEtiqueta)}</p>
          <div class="pdf-note pdf-legal-base">
            Informe generado como herramienta de apoyo a la gestión preventiva, trazabilidad documental, evidencia de hallazgos, seguimiento de cierre y análisis ejecutivo, alineado al marco preventivo chileno vigente: Ley 16.744, DS 44 y DS 594.
          </div>
          <div class="pdf-meta">
            <div><span>Fecha de generación</span><strong>${escaparHtmlInforme(fechaDocumento)}</strong></div>
            <div><span>Hallazgos incluidos</span><strong>${analisisInformeGerencial.total}</strong></div>
            <div><span>Tipo de detalle</span><strong>${escaparHtmlInforme(etiquetaDetalleInforme(detalleInformeGerencial))}</strong></div>
            <div><span>Máximo de filas</span><strong>${detallePdfActivo ? maxFilasDetalleInforme : "No aplica"}</strong></div>
          </div>
          <section class="pdf-generated-by pdf-avoid">
            <div class="pdf-avatar">${avatarGenerador}</div>
            <div>
              <div class="pdf-generated-title">Informe generado por</div>
              <div class="pdf-generated-name">${escaparHtmlInforme(usuarioGeneradorInforme.nombre)}</div>
              <div class="pdf-generated-detail">${escaparHtmlInforme(usuarioGeneradorInforme.cargo)}${usuarioGeneradorInforme.rol ? ` · ${escaparHtmlInforme(usuarioGeneradorInforme.rol)}` : ""}</div>
              <div class="pdf-generated-detail">${escaparHtmlInforme(usuarioGeneradorInforme.empresa)}</div>
              ${usuarioGeneradorInforme.correo ? `<div class="pdf-generated-detail">${escaparHtmlInforme(usuarioGeneradorInforme.correo)}</div>` : ""}
            </div>
            <div class="pdf-generated-date">
              Fecha de generación
              <strong>${escaparHtmlInforme(fechaDocumentoLarga)}</strong>
              Hora: ${escaparHtmlInforme(horaDocumento)}
            </div>
          </section>
        </header>

        ${
          !hayElementosInformeGerencial
            ? `
              <section class="pdf-section pdf-avoid">
                <h2>No se han seleccionado elementos para este informe.</h2>
                <p class="pdf-muted">Seleccione comandos, filtros destacados o secciones desde el Constructor de Informe Gerencial para generar contenido ejecutivo.</p>
              </section>
            `
            : `
        <div class="pdf-note">
          Este informe considera los registros actualmente cargados en KPI. La version futura con HV-DATA permitirá generar informes sobre dataset filtrado completo server-side.
        </div>
        ${
          informeConBacklogVisible
            ? `<div class="pdf-note">El periodo debe considerar hallazgos del periodo, backlog no cerrado anterior y cerrados del periodo para mantener trazabilidad de gestion vigente.</div>`
            : ""
        }

        <section class="pdf-section pdf-avoid">
          <h2>Alcance del informe</h2>
          <div class="pdf-scope-grid">
            ${alcanceOperacionalInformePdf
              .map(
                ([label, valor]) => `
                  <div class="pdf-scope-item">
                    <span>${escaparHtmlInforme(label)}</span>
                    <strong>${escaparHtmlInforme(valor)}</strong>
                  </div>
                `
              )
              .join("")}
          </div>
          <ul class="pdf-list">${renderLista(notasAlcanceInformePdf)}</ul>
        </section>

        <section class="pdf-section pdf-avoid">
          <h2>Empresas consideradas en el análisis</h2>
          <div class="pdf-grid">
            ${empresasConsideradasInformePdf
              .map(
                (bloque) => `
                  <div class="pdf-card">
                    <h3>${escaparHtmlInforme(bloque.titulo)}</h3>
                    <ul class="pdf-list">${renderLista(
                      bloque.items.length
                        ? bloque.items
                        : [
                            "Vista general: el informe considera las empresas visibles dentro del universo actualmente cargado en KPI.",
                          ]
                    )}</ul>
                  </div>
                `
              )
              .join("")}
          </div>
        </section>

        <section class="pdf-section pdf-avoid">
          <h2>Filtros aplicados</h2>
          <ul class="pdf-chip-list">${renderLista(filtrosPdf)}</ul>
        </section>

        <section class="pdf-section pdf-avoid">
          <h2>Elementos incluidos</h2>
          <div class="pdf-grid">
            <div class="pdf-card"><h3>Secciones</h3><ul class="pdf-list">${renderLista(etiquetasSeccionesPrincipalesSeleccionadas)}</ul></div>
            <div class="pdf-card"><h3>Graficos</h3><ul class="pdf-list">${renderLista(etiquetasGraficosSeleccionados)}</ul></div>
            <div class="pdf-card"><h3>Rankings</h3><ul class="pdf-list">${renderLista(etiquetasRankingsSeleccionados)}</ul></div>
            <div class="pdf-card"><h3>Hallazgos y detalle</h3><ul class="pdf-list">${renderLista(etiquetasHallazgosDetalleSeleccionados)}</ul></div>
            <div class="pdf-card"><h3>Series de tendencia</h3><ul class="pdf-list">${renderLista(etiquetasSeriesTendenciaSeleccionadas)}</ul></div>
            <div class="pdf-card"><h3>Ranking principal</h3><p>${escaparHtmlInforme(etiquetaRankingPrincipalSeleccionado)}</p></div>
            <div class="pdf-card"><h3>Foco comparativo</h3><p>${escaparHtmlInforme(etiquetaFocoComparativoSeleccionado)}</p></div>
          </div>
        </section>

        ${
          graficosInformeSeleccionados.length > 0 || rankingsInformeSeleccionados.length > 0
            ? `<section class="pdf-section pdf-avoid">
          <h2>Configuración de datos para gráficos</h2>
          <div class="pdf-grid">
            <div class="pdf-card">
              <h3>Tendencia temporal</h3>
              <p class="pdf-muted">Series seleccionadas para alimentar la lectura temporal del informe.</p>
              <ul class="pdf-list">${renderLista(etiquetasSeriesTendenciaSeleccionadas)}</ul>
            </div>
            <div class="pdf-card">
              <h3>Ranking principal</h3>
              <p>${escaparHtmlInforme(etiquetaRankingPrincipalSeleccionado)}</p>
              <p class="pdf-muted">El ranking principal se incluye aunque no esté marcado dentro de rankings secundarios.</p>
            </div>
            <div class="pdf-card">
              <h3>Foco comparativo</h3>
              <p>${escaparHtmlInforme(focoComparativoInformeGerencial.titulo)}</p>
              <p class="pdf-muted">${escaparHtmlInforme(focoComparativoInformeGerencial.detalle)}</p>
              <ul class="pdf-list">${renderLista(focoComparativoInformeGerencial.valores.length ? focoComparativoInformeGerencial.valores : ["Sin datos suficientes con los filtros actuales."])}</ul>
            </div>
            <div class="pdf-card">
              <h3>Control avanzado futuro</h3>
              <p class="pdf-muted">Queda preparada la lógica para configurar datos por gráfico o sección sin convertir el PDF en una exportación rígida.</p>
            </div>
          </div>
        </section>`
            : ""
        }

        ${
          seccionesInformeSeleccionadas.includes("kpis")
            ? `<section class="pdf-section pdf-avoid">
          <h2>KPIs principales</h2>
          <div class="pdf-kpis">
            ${renderDato("Total", analisisInformeGerencial.total)}
            ${renderDato("Abiertos", metricasInformeGerencial.abiertos)}
            ${renderDato("Cerrados", analisisInformeGerencial.cerrados)}
            ${renderDato("Criticos abiertos", metricasInformeGerencial.criticosAbiertos)}
            ${renderDato("Vencidos abiertos", metricasInformeGerencial.vencidosAbiertos)}
            ${renderDato("Sin fecha compromiso", metricasInformeGerencial.sinFechaCompromiso)}
            ${renderDato("Tasa cierre", `${analisisInformeGerencial.tasaCierre}%`)}
          </div>
        </section>`
            : ""
        }

        ${
          seccionesInformeSeleccionadas.includes("resumen")
            ? `<section class="pdf-section pdf-text-section pdf-avoid">
          <h2>Resumen ejecutivo</h2>
          <p>${escaparHtmlInforme(resumenInformeGerencial)}</p>
        </section>`
            : ""
        }

        ${
          seccionesInformeSeleccionadas.includes("riesgos")
            ? `<section class="pdf-section pdf-text-section pdf-avoid">
          <h2>Riesgos principales</h2>
          <ul class="pdf-list">
            ${renderLista([
              `Criticos abiertos: ${metricasInformeGerencial.criticosAbiertos}`,
              `Vencidos abiertos: ${metricasInformeGerencial.vencidosAbiertos}`,
              `Sin fecha compromiso: ${metricasInformeGerencial.sinFechaCompromiso}`,
              `Sin responsable: ${metricasInformeGerencial.sinResponsable}`,
            ])}
          </ul>
        </section>`
            : ""
        }

        <section class="pdf-section pdf-section-flow">
          <h2>Análisis ejecutivo por sección</h2>
          <div class="pdf-analysis-list">
            ${
              analisisSeccionesInformeGerencial.length > 0
                ? analisisSeccionesInformeGerencial
                    .map(
                      (item) => `
                        <div class="pdf-card pdf-analysis-card pdf-avoid">
                          <h3>${escaparHtmlInforme(item.titulo)}</h3>
                          <p><strong>Observación:</strong> ${escaparHtmlInforme(item.observacion)}</p>
                          <p><strong>Brecha o riesgo:</strong> ${escaparHtmlInforme(item.brecha)}</p>
                          <p><strong>Acción recomendada:</strong> ${escaparHtmlInforme(item.accion)}</p>
                          <p><strong>Base preventiva/normativa:</strong> ${escaparHtmlInforme(item.base)}</p>
                        </div>
                      `
                    )
                    .join("")
                : `<p class="pdf-muted">Sin secciones seleccionadas para análisis.</p>`
            }
          </div>
        </section>

        <section class="pdf-section pdf-section-flow pdf-chart-section">
          <h2>Graficos seleccionados</h2>
          <div class="pdf-chart-list">
            ${
              graficosPdfInformeGerencial.length > 0
                ? graficosPdfInformeGerencial
                    .map(
                      (grafico) => `
                        <div class="pdf-card pdf-chart-card pdf-avoid">
                          <h3>${escaparHtmlInforme(grafico.titulo)}</h3>
                          <p>${escaparHtmlInforme(grafico.representa)}</p>
                          <ul class="pdf-list">${renderLista(grafico.valores.length ? grafico.valores : ["Sin datos suficientes con los filtros actuales."])}</ul>
                          ${
                            grafico.analisis
                              ? `<p><strong>Análisis:</strong> ${escaparHtmlInforme(grafico.analisis.observacion)} ${escaparHtmlInforme(grafico.analisis.accion)}</p>`
                              : ""
                          }
                        </div>
                      `
                    )
                    .join("")
                : `<p class="pdf-muted">No se seleccionaron graficos para este informe.</p>`
            }
          </div>
        </section>

        ${rankingsPdfInformeGerencial.map(renderTablaRanking).join("")}

        ${
          seccionesInformeSeleccionadas.includes("calidad-dato") ||
          graficosInformeSeleccionados.includes("calidad-dato")
            ? `<section class="pdf-section pdf-avoid">
          <h2>Calidad del dato</h2>
          <div class="pdf-kpis">
            ${renderDato("Con GPS", `${metricasInformeGerencial.conGps} / ${analisisInformeGerencial.total || 0}`)}
            ${renderDato("Con evidencia", `${metricasInformeGerencial.conEvidencia} / ${analisisInformeGerencial.total || 0}`)}
            ${renderDato("Con responsable", `${metricasInformeGerencial.conResponsable} / ${analisisInformeGerencial.total || 0}`)}
            ${renderDato("Con fecha compromiso", `${metricasInformeGerencial.conFechaCompromiso} / ${analisisInformeGerencial.total || 0}`)}
          </div>
        </section>`
            : ""
        }

        ${
          detallePdfActivo
            ? `
              <section class="pdf-section pdf-table-section pdf-avoid">
                <h2>Detalle resumido</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Codigo</th>
                      <th>Empresa responsable</th>
                      <th>Empresa reportante</th>
                      <th>Obra / area</th>
                      <th>Criticidad</th>
                      <th>Estado</th>
                      <th>Plazo</th>
                      <th>Responsable cierre</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${
                      detallePdf.length > 0
                        ? detallePdf
                            .map(
                              (hallazgo) => `
                                <tr>
                                  <td>${escaparHtmlInforme(hallazgo.codigo)}</td>
                                  <td>${escaparHtmlInforme(hallazgo.empresaResponsable || "Sin empresa responsable")}</td>
                                  <td>${escaparHtmlInforme(hallazgo.empresaReportante || hallazgo.empresa)}</td>
                                  <td>${escaparHtmlInforme(`${hallazgo.obra} / ${hallazgo.area}`)}</td>
                                  <td>${escaparHtmlInforme(etiquetaCriticidad(hallazgo.criticidad))}</td>
                                  <td>${escaparHtmlInforme(hallazgo.estado.replace("_", " "))}</td>
                                  <td>${escaparHtmlInforme(`${fechaCortaDetalle(hallazgo.fechaCompromiso)} · ${estadoPlazoPdf(hallazgo)}`)}</td>
                                  <td>${escaparHtmlInforme(hallazgo.responsableCierre || "Sin responsable")}</td>
                                </tr>
                              `
                            )
                            .join("")
                        : `<tr><td colspan="8">Sin hallazgos para el alcance seleccionado.</td></tr>`
                    }
                  </tbody>
                </table>
              </section>
            `
            : ""
        }

        ${
          seccionesInformeSeleccionadas.includes("advertencias")
            ? `<section class="pdf-section pdf-text-section pdf-avoid">
          <h2>Advertencias</h2>
          <ul class="pdf-list">${renderLista(advertenciasInformeGerencial)}</ul>
        </section>`
            : ""
        }

        ${
          seccionesInformeSeleccionadas.includes("nota-normativa")
            ? `<section class="pdf-section pdf-text-section pdf-final-text-section pdf-avoid">
          <h2>Nota normativa prudente</h2>
          <p>${escaparHtmlInforme(notaNormativaInformeGerencial)}</p>
        </section>`
            : ""
        }
            `
        }

        <div class="pdf-safe-bottom"></div>

        <footer class="pdf-footer">
          <span>Criterio Estratégico</span>
          <span>${escaparHtmlInforme(fechaDocumento)}</span>
          <span>Herramienta de apoyo a la gestión preventiva y trazabilidad de hallazgos, alineada a Ley 16.744, DS 44 y DS 594.</span>
        </footer>
      </article>
    `;

    const contenedor = document.createElement("div");
    contenedor.style.position = "fixed";
    contenedor.style.left = "0";
    contenedor.style.top = "0";
    contenedor.style.width = "794px";
    contenedor.style.minHeight = "1123px";
    contenedor.style.background = "#ffffff";
    contenedor.style.color = "#111827";
    contenedor.style.fontFamily = "Arial, Helvetica, sans-serif";
    contenedor.style.boxSizing = "border-box";
    contenedor.style.padding = "24px";
    contenedor.style.zIndex = "2147483647";
    contenedor.style.pointerEvents = "none";
    contenedor.style.overflow = "visible";
    contenedor.innerHTML = htmlInforme;

    try {
      document.body.appendChild(contenedor);
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      );
      const nodoPdf = contenedor.querySelector(".pdf-doc") as HTMLElement | null;
      if (
        !nodoPdf ||
        !nodoPdf.innerText.trim() ||
        nodoPdf.offsetWidth <= 0 ||
        nodoPdf.offsetHeight <= 0
      ) {
        throw new Error("El nodo temporal del PDF no tiene contenido o dimensiones validas.");
      }
      const html2pdfModule = await import("html2pdf.js");
      const opcionesPdf = {
        margin: [10, 10, 22, 10] as [number, number, number, number],
        filename: nombreArchivo,
        image: { type: "jpeg" as const, quality: 0.96 },
        enableLinks: true,
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait" as const,
        },
        pagebreak: {
          mode: ["css", "legacy"],
          avoid: [
            ".pdf-avoid",
            ".pdf-card",
            ".pdf-kpi",
            ".pdf-analysis-card",
            ".pdf-chart-card",
            ".pdf-text-section",
            ".pdf-final-text-section",
            ".pdf-safe-bottom",
            ".pdf-scope-item",
            ".pdf-table-section",
            "tr",
          ],
        },
      };

      await html2pdfModule.default().set(opcionesPdf).from(nodoPdf).save(nombreArchivo);
      setEstadoPdfInformeGerencial("generado");
      setMensaje(`PDF generado: ${nombreArchivo}`);
      window.setTimeout(() => {
        setEstadoPdfInformeGerencial("idle");
      }, 3500);
    } catch (error) {
      console.error("No fue posible generar el PDF gerencial.", error);
      setEstadoPdfInformeGerencial("error");
      setMensaje("No fue posible generar el PDF. Revise la vista previa e intente nuevamente.");
      window.setTimeout(() => {
        setEstadoPdfInformeGerencial("idle");
      }, 4500);
    } finally {
      contenedor.remove();
    }
  }

  return (
    <main className="ce-panel-page ce-panel-kpi-page" style={pageThemeStyle}>
      <div className="ce-panel-shell ce-panel-kpi-shell" style={shellStyle}>
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
              {t("KPI GERENCIAL AVANZADO")}
            </h1>
            <p style={{ margin: 0, maxWidth: "1040px", color: textoMedio, fontSize: "15px", lineHeight: 1.5, fontWeight: 650 }}>
              {t("Indicadores para análisis de criticidad, vencimientos, responsables, empresas, obras, función ITO de terreno y focos preventivos prioritarios.")}
            </p>
            <PreventiveLegalRibbon
              theme={temaClaro ? "light" : "dark"}
              compact
              text={t("Gestión preventiva digital alineada a Ley 16.744, DS 44 y DS 594, con foco en evidencia, trazabilidad y seguimiento de cierre.")}
              style={{ marginTop: "8px" }}
            />
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
            <Link href="/panel" prefetch onMouseDown={() => activarBoton("volver")} style={botonStyle("volver")}>
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
            alignItems: "stretch",
          }}
        >
          <aside className="ce-panel-kpi-filters" style={{ ...themedSurfaceStyle, padding: "18px", display: "grid", gap: "15px", alignSelf: "stretch", alignContent: "start", boxSizing: "border-box" }}>
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

            <div style={{ borderRadius: "18px", padding: "13px", background: temaClaro ? "rgba(248,250,252,0.84)" : "rgba(15,23,42,0.42)", border: temaClaro ? "1px solid rgba(37,99,235,0.14)" : "1px solid rgba(125,211,252,0.14)", borderLeft: temaClaro ? "3px solid rgba(37,99,235,0.50)" : "3px solid rgba(56,189,248,0.56)", display: "grid", gap: "12px", boxShadow: temaClaro ? "0 10px 22px rgba(15,23,42,0.04)" : "inset 0 1px 0 rgba(255,255,255,0.03)" }}>
              <div>
                <div style={{ fontSize: "11px", color: textoAzul, fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.55px" }}>
                  Pulso de filtros activos
                </div>
                <div style={{ marginTop: "4px", color: textoSuave, fontSize: "11px", lineHeight: 1.35, fontWeight: 750 }}>
                  Lectura compacta del universo filtrado.
                </div>
              </div>

              <div style={{ height: "92px", display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "8px", alignItems: "end" }}>
                {pulsoLateralGerencial.criticidad.map((item) => {
                  const alturaBarra = Math.max(8, (item.total / pulsoLateralGerencial.totalCriticidad) * 62);

                  return (
                    <div key={item.label} style={{ minWidth: 0, display: "grid", gap: "5px", justifyItems: "center" }}>
                      <div style={{ width: "100%", height: "64px", display: "flex", alignItems: "end", justifyContent: "center", borderRadius: "12px", background: fondoInternoFuerte, border: bordeInterno, overflow: "hidden" }}>
                        <div style={{ width: "54%", height: `${alturaBarra}px`, borderRadius: "999px 999px 4px 4px", background: `linear-gradient(180deg, ${item.color}, rgba(56,189,248,0.52))`, boxShadow: `0 0 16px ${item.color}2f` }} />
                      </div>
                      <div style={{ maxWidth: "100%", color: textoSuave, fontSize: "9px", fontWeight: 850, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.label}
                      </div>
                      <strong style={{ color: textoPrincipal, fontSize: "12px", lineHeight: 1 }}>{item.total}</strong>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "grid", gap: "7px" }}>
                {pulsoLateralGerencial.presion.map((item) => (
                  <div key={item.label} style={{ display: "grid", gridTemplateColumns: "68px minmax(0, 1fr) 28px", gap: "8px", alignItems: "center", color: textoMedio, fontSize: "10px", fontWeight: 850 }}>
                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>
                    <div style={{ height: "7px", borderRadius: "999px", background: fondoInternoFuerte, overflow: "hidden" }}>
                      <div style={{ width: `${Math.max(6, (item.total / pulsoLateralGerencial.totalEstado) * 100)}%`, height: "100%", borderRadius: "999px", background: item.color }} />
                    </div>
                    <strong style={{ color: textoPrincipal, textAlign: "right" }}>{item.total}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ borderRadius: "18px", padding: "13px", background: temaClaro ? "rgba(248,250,252,0.82)" : "rgba(15,23,42,0.40)", border: temaClaro ? "1px solid rgba(37,99,235,0.14)" : "1px solid rgba(125,211,252,0.14)", borderLeft: temaClaro ? "3px solid rgba(99,102,241,0.50)" : "3px solid rgba(129,140,248,0.58)", display: "grid", gap: "11px", boxShadow: temaClaro ? "0 10px 22px rgba(15,23,42,0.04)" : "inset 0 1px 0 rgba(255,255,255,0.03)" }}>
              <div>
                <div style={{ fontSize: "11px", color: textoAzul, fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.55px" }}>
                  Calidad del dato
                </div>
                <div style={{ marginTop: "4px", color: textoSuave, fontSize: "11px", lineHeight: 1.35, fontWeight: 750 }}>
                  Completitud de los hallazgos filtrados.
                </div>
              </div>

              <div style={{ display: "grid", gap: "8px" }}>
                {pulsoLateralGerencial.calidad.map((item) => {
                  const porcentaje = Math.round((item.total / pulsoLateralGerencial.totalHallazgos) * 100);

                  return (
                    <div key={item.label} style={{ display: "grid", gap: "5px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: "8px", alignItems: "center", color: textoMedio, fontSize: "11px", fontWeight: 850 }}>
                        <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</span>
                        <strong style={{ color: textoPrincipal }}>{item.total} · {porcentaje}%</strong>
                      </div>
                      <div style={{ height: "8px", borderRadius: "999px", background: fondoInternoFuerte, overflow: "hidden" }}>
                        <div style={{ width: `${Math.max(6, porcentaje)}%`, height: "100%", borderRadius: "999px", background: `linear-gradient(90deg, ${item.color}, rgba(56,189,248,0.62))`, boxShadow: `0 0 14px ${item.color}2f` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
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

            <section style={{ ...themedSurfaceStyle, padding: "16px", display: "grid", gap: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "start", flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: "11px", color: textoAzul, fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.7px" }}>
                    Radar Gerencial Compacto
                  </div>
                  <h2 style={{ margin: "4px 0 0", fontSize: "18px", lineHeight: 1.18, fontWeight: 950 }}>
                    Focos ejecutivos priorizados
                  </h2>
                  <p style={{ margin: "5px 0 0", color: textoSuave, fontSize: "12px", lineHeight: 1.4, fontWeight: 750 }}>
                    Focos ejecutivos priorizados segun los filtros activos.
                  </p>
                </div>
                <div style={{ borderRadius: "999px", padding: "7px 10px", background: fondoInterno, border: bordeInterno, color: textoAzul, fontSize: "11px", fontWeight: 950 }}>
                  {analisis.hallazgos.length} registros filtrados
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "10px" }}>
                {[
                  {
                    id: "empresas-criticas",
                    titulo: "Empresas con mayor carga critica",
                    subtitulo: "Criticos abiertos por responsable/involucrado.",
                    data: radarGerencial.empresasCriticas,
                    color: "#ef4444",
                    accion: "Radar: foco visual en empresas con criticos abiertos. Conexion con Detalle accionable queda para fase posterior.",
                  },
                  {
                    id: "obras-vencidas",
                    titulo: "Obras con mas vencidos",
                    subtitulo: "Hallazgos vencidos que siguen abiertos.",
                    data: radarGerencial.obrasVencidas,
                    color: "#f97316",
                    accion: "Radar: foco visual en obras con vencidos abiertos. Conexion con Detalle accionable queda para fase posterior.",
                  },
                  {
                    id: "responsables-pendientes",
                    titulo: "Responsables con mas pendientes",
                    subtitulo: "Abiertos y en gestion por responsable cierre.",
                    data: radarGerencial.responsablesPendientes,
                    color: "#38bdf8",
                    accion: "Radar: foco visual en responsables con pendientes. Conexion con Detalle accionable queda para fase posterior.",
                  },
                ].map((modulo) => {
                  const maxRadar = Math.max(1, ...modulo.data.map((item) => item.total));

                  return (
                    <div key={modulo.id} style={{ borderRadius: "18px", padding: "12px", background: temaClaro ? "rgba(248,250,252,0.86)" : "rgba(15,23,42,0.58)", border: temaClaro ? "1px solid rgba(37,99,235,0.14)" : "1px solid rgba(125,211,252,0.14)", borderLeft: `3px solid ${modulo.color}`, display: "grid", gap: "9px", boxShadow: temaClaro ? "0 9px 20px rgba(15,23,42,0.04)" : "inset 0 1px 0 rgba(255,255,255,0.035)" }}>
                      <div>
                        <div style={{ color: textoPrincipal, fontSize: "12px", fontWeight: 950 }}>{modulo.titulo}</div>
                        <div style={{ marginTop: "3px", color: textoSuave, fontSize: "11px", lineHeight: 1.35, fontWeight: 750 }}>{modulo.subtitulo}</div>
                      </div>

                      {modulo.data.length > 0 ? (
                        <div style={{ display: "grid", gap: "7px" }}>
                          {modulo.data.map((item, index) => (
                            <div key={`${modulo.id}-${item.nombre}`} style={{ display: "grid", gap: "5px" }}>
                              <div style={{ display: "grid", gridTemplateColumns: "22px minmax(0, 1fr) auto", gap: "7px", alignItems: "center", color: textoMedio, fontSize: "11px", fontWeight: 850 }}>
                                <span style={{ color: textoAzul, fontWeight: 950 }}>{index + 1}</span>
                                <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.nombre}</span>
                                <strong style={{ color: textoPrincipal }}>{item.total}</strong>
                              </div>
                              <div style={{ height: "7px", borderRadius: "999px", background: fondoInternoFuerte, overflow: "hidden" }}>
                                <div style={{ width: `${Math.max(8, (item.total / maxRadar) * 100)}%`, height: "100%", borderRadius: "999px", background: `linear-gradient(90deg, ${modulo.color}, rgba(56,189,248,0.70))` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ borderRadius: "12px", padding: "10px", background: fondoInternoFuerte, border: bordeInterno, color: textoSuave, fontSize: "11px", fontWeight: 750 }}>
                          Sin datos suficientes con los filtros actuales.
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          activarBoton(`radar-${modulo.id}`);
                          setMensaje(modulo.accion);
                        }}
                        style={{ ...botonStyle(`radar-${modulo.id}`), minHeight: "32px", padding: "7px 10px", fontSize: "11px" }}
                      >
                        Revisar foco
                      </button>
                    </div>
                  );
                })}

                <div style={{ borderRadius: "18px", padding: "12px", background: temaClaro ? "rgba(248,250,252,0.86)" : "rgba(15,23,42,0.58)", border: temaClaro ? "1px solid rgba(37,99,235,0.14)" : "1px solid rgba(125,211,252,0.14)", borderLeft: "3px solid rgba(250,204,21,0.90)", display: "grid", gap: "9px", boxShadow: temaClaro ? "0 9px 20px rgba(15,23,42,0.04)" : "inset 0 1px 0 rgba(255,255,255,0.035)" }}>
                  <div>
                    <div style={{ color: textoPrincipal, fontSize: "12px", fontWeight: 950 }}>Hallazgos sin fecha compromiso</div>
                    <div style={{ marginTop: "3px", color: textoSuave, fontSize: "11px", lineHeight: 1.35, fontWeight: 750 }}>Alerta de trazabilidad para abiertos sin plazo.</div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "end" }}>
                    <div>
                      <div style={{ color: radarGerencial.sinFechaTotal > 0 ? "#facc15" : textoAzul, fontSize: "30px", lineHeight: 1, fontWeight: 950 }}>
                        {radarGerencial.sinFechaTotal}
                      </div>
                      <div style={{ marginTop: "4px", color: textoSuave, fontSize: "11px", fontWeight: 800 }}>abiertos sin plazo</div>
                    </div>
                    <div style={{ minWidth: 0, textAlign: "right", color: textoMedio, fontSize: "11px", lineHeight: 1.35, fontWeight: 800 }}>
                      {radarGerencial.sinFechaFoco
                        ? `Foco: ${radarGerencial.sinFechaFoco.nombre} (${radarGerencial.sinFechaFoco.total})`
                        : "Sin datos suficientes con los filtros actuales."}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      activarBoton("radar-sin-fecha");
                      setMensaje("Radar: foco visual en hallazgos sin fecha compromiso. Conexion con Detalle accionable queda para fase posterior.");
                    }}
                    style={{ ...botonStyle("radar-sin-fecha"), minHeight: "32px", padding: "7px 10px", fontSize: "11px" }}
                  >
                    Revisar foco
                  </button>
                </div>
              </div>
            </section>

            <section className="ce-panel-kpi-secondary-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.1fr) minmax(360px, 0.9fr)", gap: "16px" }}>
              <div style={{ ...themedSurfaceStyle, padding: "18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "start", marginBottom: "14px" }}>
                  <div>
                    <div style={{ fontSize: "16px", fontWeight: 950 }}>{t("Tendencia temporal")}</div>
                    <div style={{ marginTop: "5px", color: textoSuave, fontSize: "12px", lineHeight: 1.4, fontWeight: 750 }}>
                      Evolucion mensual con total reportado, criticos abiertos y vencidos abiertos.
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "flex-end", color: textoSuave, fontSize: "11px", fontWeight: 850 }}>
                    {[
                      ["Total reportado", "#38bdf8"],
                      ["Criticos abiertos", "#ef4444"],
                      ["Vencidos abiertos", "#f97316"],
                    ].map(([label, color]) => (
                      <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ width: "18px", height: "3px", borderRadius: "999px", background: color, boxShadow: `0 0 10px ${color}55` }} />
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ height: "210px", display: "grid", gridTemplateRows: "minmax(0, 1fr)", paddingTop: "6px" }}>
                  {tendenciaPuntos.length > 0 ? (
                    <div style={{ minHeight: 0, borderRadius: "18px", border: temaClaro ? "1px solid rgba(100,116,139,0.18)" : "1px solid rgba(148,163,184,0.16)", background: temaClaro ? "rgba(248,250,252,0.74)" : "rgba(2,6,23,0.18)", padding: "4px 2px 0" }}>
                      <svg
                        viewBox={`0 0 ${tendenciaChartWidth} ${tendenciaChartHeight}`}
                        role="img"
                        aria-label="Tendencia temporal de hallazgos"
                        style={{ width: "100%", height: "100%", minHeight: "178px", overflow: "visible", display: "block" }}
                      >
                        <rect
                          x={tendenciaPlotLeft}
                          y={tendenciaPlotTop}
                          width={tendenciaPlotWidth}
                          height={tendenciaPlotHeight}
                          rx="10"
                          fill={temaClaro ? "rgba(255,255,255,0.58)" : "rgba(15,23,42,0.36)"}
                        />
                        {tendenciaEscalas.map((valor) => {
                          const y = tendenciaY(valor);
                          return (
                            <g key={`y-${valor}`}>
                              <line
                                x1={tendenciaPlotLeft}
                                y1={y}
                                x2={tendenciaPlotRight}
                                y2={y}
                                stroke={temaClaro ? "rgba(100,116,139,0.24)" : "rgba(148,163,184,0.18)"}
                                strokeWidth="1"
                              />
                              <line
                                x1={tendenciaPlotLeft - 5}
                                y1={y}
                                x2={tendenciaPlotLeft}
                                y2={y}
                                stroke={temaClaro ? "rgba(51,65,85,0.50)" : "rgba(226,232,240,0.42)"}
                                strokeWidth="1.4"
                              />
                              <text
                                x={tendenciaPlotLeft - 12}
                                y={y + 4}
                                textAnchor="end"
                                fill={temaClaro ? "#475569" : "#94a3b8"}
                                fontSize="11"
                                fontWeight="850"
                              >
                                {valor}
                              </text>
                            </g>
                          );
                        })}
                        {tendenciaLineasVerticales.map((x, index) => (
                          <line
                            key={`x-grid-${index}`}
                            x1={x}
                            y1={tendenciaPlotTop}
                            x2={x}
                            y2={tendenciaPlotBottom}
                            stroke={temaClaro ? "rgba(100,116,139,0.16)" : "rgba(148,163,184,0.12)"}
                            strokeWidth="1"
                          />
                        ))}
                        <line
                          x1={tendenciaPlotLeft}
                          y1={tendenciaPlotTop}
                          x2={tendenciaPlotLeft}
                          y2={tendenciaPlotBottom}
                          stroke={temaClaro ? "#475569" : "#cbd5e1"}
                          strokeWidth="1.6"
                        />
                        <line
                          x1={tendenciaPlotLeft}
                          y1={tendenciaPlotBottom}
                          x2={tendenciaPlotRight}
                          y2={tendenciaPlotBottom}
                          stroke={temaClaro ? "#475569" : "#cbd5e1"}
                          strokeWidth="1.6"
                        />
                        {tendenciaPuntos.length > 1 && (
                          <>
                            <polyline
                              points={tendenciaTotalPolyline}
                              fill="none"
                              stroke="#38bdf8"
                              strokeWidth="4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              vectorEffect="non-scaling-stroke"
                            />
                            <polyline
                              points={tendenciaCriticosPolyline}
                              fill="none"
                              stroke="#ef4444"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              vectorEffect="non-scaling-stroke"
                            />
                            <polyline
                              points={tendenciaVencidosPolyline}
                              fill="none"
                              stroke="#f97316"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeDasharray="6 6"
                              vectorEffect="non-scaling-stroke"
                            />
                          </>
                        )}
                        {tendenciaPuntos.length === 1 && (
                          <>
                            <line x1={tendenciaPuntos[0].x - tendenciaSegmentoUnico} y1={tendenciaPuntos[0].yTotal} x2={tendenciaPuntos[0].x + tendenciaSegmentoUnico} y2={tendenciaPuntos[0].yTotal} stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                            <line x1={tendenciaPuntos[0].x - tendenciaSegmentoUnico} y1={tendenciaPuntos[0].yCriticos} x2={tendenciaPuntos[0].x + tendenciaSegmentoUnico} y2={tendenciaPuntos[0].yCriticos} stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
                            <line x1={tendenciaPuntos[0].x - tendenciaSegmentoUnico} y1={tendenciaPuntos[0].yVencidos} x2={tendenciaPuntos[0].x + tendenciaSegmentoUnico} y2={tendenciaPuntos[0].yVencidos} stroke="#f97316" strokeWidth="3" strokeLinecap="round" strokeDasharray="6 6" />
                          </>
                        )}
                        {tendenciaPuntos.map((item) => (
                          <g key={`total-${item.periodo}`}>
                            <circle cx={item.x} cy={item.yVencidos} r="5" fill="#f97316" stroke={temaClaro ? "#fff7ed" : "#431407"} strokeWidth="2.4" />
                            <circle cx={item.x} cy={item.yCriticos} r="5" fill="#ef4444" stroke={temaClaro ? "#fef2f2" : "#450a0a"} strokeWidth="2.4" />
                            <circle
                              cx={item.x}
                              cy={item.yTotal}
                              r="6"
                              fill={temaClaro ? "#ffffff" : "#0f172a"}
                              stroke="#38bdf8"
                              strokeWidth="4"
                            />
                            <text
                              x={item.x}
                              y={Math.max(12, item.yTotal - 12)}
                              textAnchor="middle"
                              fill={temaClaro ? "#0f172a" : "#e0f2fe"}
                              fontSize="18"
                              fontWeight="900"
                            >
                              {item.total}
                            </text>
                            <text
                              x={item.x + 10}
                              y={item.yCriticos + 4}
                              textAnchor="start"
                              fill={temaClaro ? "#991b1b" : "#fecaca"}
                              fontSize="11"
                              fontWeight="900"
                            >
                              {item.criticosAbiertos}
                            </text>
                            <text
                              x={item.x + 10}
                              y={item.yVencidos + 15}
                              textAnchor="start"
                              fill={temaClaro ? "#9a3412" : "#fed7aa"}
                              fontSize="11"
                              fontWeight="900"
                            >
                              {item.vencidosAbiertos}
                            </text>
                            <text
                              x={item.x}
                              y={tendenciaPlotBottom + 22}
                              textAnchor="middle"
                              fill={temaClaro ? "#475569" : "#cbd5e1"}
                              fontSize="11"
                              fontWeight="850"
                            >
                              {item.periodo}
                            </text>
                          </g>
                        ))}
                        <text x={tendenciaPlotLeft} y={tendenciaChartHeight - 4} textAnchor="start" fill={temaClaro ? "#64748b" : "#94a3b8"} fontSize="10" fontWeight="800">
                          Periodo
                        </text>
                      </svg>
                    </div>
                  ) : (
                    <div style={{ minHeight: "150px", display: "grid", placeItems: "center", color: textoSuave, fontSize: "12px", fontWeight: 850 }}>
                      Sin datos temporales con los filtros actuales.
                    </div>
                  )}
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

            <section style={{ ...themedSurfaceStyle, padding: "16px", display: "grid", gap: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "start", flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: "11px", color: textoAzul, fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.7px" }}>
                    Matriz Comparativa Gerencial
                  </div>
                  <h2 style={{ margin: "4px 0 0", fontSize: "18px", lineHeight: 1.18, fontWeight: 950 }}>
                    Comparativos clave
                  </h2>
                  <p style={{ margin: "5px 0 0", color: textoSuave, fontSize: "12px", lineHeight: 1.4, fontWeight: 750 }}>
                    Comparativos clave segun los filtros activos.
                  </p>
                </div>
                <div style={{ borderRadius: "999px", padding: "7px 10px", background: fondoInterno, border: bordeInterno, color: textoAzul, fontSize: "11px", fontWeight: 950 }}>
                  Cuerpo con scroll interno
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "10px", alignItems: "stretch" }}>
                {matrizComparativaGerencial.map((modulo) => {
                  const maxMatriz = Math.max(1, ...modulo.data.map((item) => item.total));

                  return (
                    <div key={modulo.id} style={{ borderRadius: "18px", padding: "12px", background: temaClaro ? "rgba(248,250,252,0.88)" : "rgba(15,23,42,0.60)", border: temaClaro ? "1px solid rgba(37,99,235,0.14)" : "1px solid rgba(125,211,252,0.14)", borderLeft: `3px solid ${modulo.color}`, display: "grid", gridTemplateRows: "auto minmax(0, 1fr)", gap: "9px", minHeight: "252px", height: "252px", overflow: "hidden", boxSizing: "border-box", boxShadow: temaClaro ? "0 9px 20px rgba(15,23,42,0.04)" : "inset 0 1px 0 rgba(255,255,255,0.035)" }}>
                      <div>
                        <div style={{ color: textoPrincipal, fontSize: "12px", fontWeight: 950 }}>{modulo.titulo}</div>
                        <div style={{ marginTop: "3px", color: textoSuave, fontSize: "11px", lineHeight: 1.35, fontWeight: 750 }}>{modulo.subtitulo}</div>
                      </div>

                      {modulo.data.length > 0 ? (
                        <div style={{ minHeight: 0, overflowY: "auto", overscrollBehavior: "contain", paddingRight: "4px", display: "grid", alignContent: "start", gap: "8px", scrollbarWidth: "thin", scrollbarColor: temaClaro ? "rgba(37,99,235,0.36) rgba(226,232,240,0.60)" : "rgba(56,189,248,0.34) rgba(15,23,42,0.74)" }}>
                          {modulo.data.map((item, index) => (
                            <div key={`${modulo.id}-${item.nombre}`} style={{ display: "grid", gap: "5px" }}>
                              <div style={{ display: "grid", gridTemplateColumns: "24px minmax(0, 1fr) auto", gap: "8px", alignItems: "center", color: textoMedio, fontSize: "11px", fontWeight: 850 }}>
                                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "20px", height: "20px", borderRadius: "999px", background: temaClaro ? "rgba(37,99,235,0.10)" : "rgba(56,189,248,0.12)", color: textoAzul, fontWeight: 950 }}>{index + 1}</span>
                                <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.nombre}</span>
                                <strong style={{ color: textoPrincipal }}>{item.total}</strong>
                              </div>
                              <div style={{ height: "8px", borderRadius: "999px", background: fondoInternoFuerte, overflow: "hidden" }}>
                                <div style={{ width: `${Math.max(8, (item.total / maxMatriz) * 100)}%`, height: "100%", borderRadius: "999px", background: `linear-gradient(90deg, ${modulo.color}, rgba(56,189,248,0.70))`, boxShadow: `0 0 16px ${modulo.color}33` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ minHeight: 0, borderRadius: "12px", padding: "10px", background: fondoInternoFuerte, border: bordeInterno, color: textoSuave, fontSize: "11px", fontWeight: 750 }}>
                          Sin datos suficientes con los filtros actuales.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>


          </section>

          <aside className="ce-panel-kpi-report" style={{ ...themedSurfaceStyle, padding: "18px", display: "grid", gap: "14px", alignSelf: "stretch", alignContent: "start", boxSizing: "border-box", borderLeft: temaClaro ? "1px solid rgba(37,99,235,0.24)" : "1px solid rgba(125,211,252,0.18)" }}>
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
                title="El PDF formal se genera desde el Constructor de Informe Gerencial."
                style={{ ...botonStyle("pdf"), opacity: 0.62, cursor: "not-allowed", color: textoSuave }}
              >
                Usar Constructor de Informe
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
                El PDF formal se genera en el Constructor de Informe Gerencial. Excel queda pendiente para fase posterior.
              </div>
            </div>

            <div style={{ display: "grid", gap: "12px", borderRadius: "18px", padding: "13px", background: temaClaro ? "rgba(248,250,252,0.78)" : "rgba(15,23,42,0.38)", border: temaClaro ? "1px solid rgba(37,99,235,0.14)" : "1px solid rgba(125,211,252,0.14)", borderLeft: temaClaro ? "3px solid rgba(14,165,233,0.50)" : "3px solid rgba(14,165,233,0.58)", boxShadow: temaClaro ? "0 10px 22px rgba(15,23,42,0.04)" : "inset 0 1px 0 rgba(255,255,255,0.03)" }}>
              <div>
                <div style={{ fontSize: "11px", color: textoAzul, fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.55px", display: "flex", alignItems: "center", gap: "7px" }}>
                  <span style={{ width: "7px", height: "18px", borderRadius: "999px", background: "linear-gradient(180deg, rgba(56,189,248,0.92), rgba(249,115,22,0.72))" }} />
                  Cierre y vencimiento
                </div>
                <div style={{ marginTop: "5px", color: textoSuave, fontSize: "11px", lineHeight: 1.35, fontWeight: 750 }}>
                  Indicadores de presion del filtro actual.
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "8px" }}>
                {[
                  ["Tasa cierre", `${analisis.tasaCierre}%`, "#22c55e"],
                  ["Vencidos", pulsoLateralGerencial.vencidosAbiertos, "#f97316"],
                  ["En plazo", pulsoLateralGerencial.abiertosEnPlazo, "#60a5fa"],
                  ["Sin plazo", pulsoLateralGerencial.abiertosSinFecha, "#facc15"],
                ].map(([label, valor, color]) => (
                  <div key={String(label)} style={{ minWidth: 0, borderRadius: "14px", padding: "10px", background: fondoInterno, border: bordeInterno, display: "grid", gap: "5px" }}>
                    <span style={{ color: textoSuave, fontSize: "10px", fontWeight: 850, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {label}
                    </span>
                    <strong style={{ color: String(color), fontSize: "18px", lineHeight: 1, fontWeight: 950 }}>
                      {valor}
                    </strong>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gap: "8px" }}>
                {pulsoLateralGerencial.cierre.map((item) => (
                  <div key={item.label} style={{ display: "grid", gap: "5px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: "8px", alignItems: "center", color: textoMedio, fontSize: "11px", fontWeight: 850 }}>
                      <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</span>
                      <strong style={{ color: textoPrincipal }}>{item.total}</strong>
                    </div>
                    <div style={{ height: "8px", borderRadius: "999px", background: fondoInternoFuerte, overflow: "hidden" }}>
                      <div style={{ width: `${Math.max(6, (item.total / pulsoLateralGerencial.totalEstado) * 100)}%`, height: "100%", borderRadius: "999px", background: `linear-gradient(90deg, ${item.color}, rgba(56,189,248,0.62))`, boxShadow: `0 0 14px ${item.color}2f` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gap: "11px", borderRadius: "18px", padding: "13px", background: temaClaro ? "rgba(248,250,252,0.78)" : "rgba(15,23,42,0.38)", border: temaClaro ? "1px solid rgba(37,99,235,0.14)" : "1px solid rgba(125,211,252,0.14)", borderLeft: temaClaro ? "3px solid rgba(248,113,113,0.52)" : "3px solid rgba(248,113,113,0.58)", boxShadow: temaClaro ? "0 10px 22px rgba(15,23,42,0.04)" : "inset 0 1px 0 rgba(255,255,255,0.03)" }}>
              <div>
                <div style={{ fontSize: "11px", color: textoAzul, fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.55px", display: "flex", alignItems: "center", gap: "7px" }}>
                  <span style={{ width: "7px", height: "18px", borderRadius: "999px", background: "linear-gradient(180deg, rgba(248,113,113,0.92), rgba(249,115,22,0.72))" }} />
                  Control inmediato
                </div>
                <div style={{ marginTop: "5px", color: textoSuave, fontSize: "11px", lineHeight: 1.35, fontWeight: 750 }}>
                  Brechas de gestion que requieren seguimiento.
                </div>
              </div>

              <div style={{ display: "grid", gap: "8px" }}>
                {pulsoLateralGerencial.brechas.map((item) => {
                  const porcentaje = Math.round((item.total / pulsoLateralGerencial.totalAbiertos) * 100);

                  return (
                    <div key={item.label} style={{ display: "grid", gridTemplateColumns: "42px minmax(0, 1fr)", gap: "9px", alignItems: "center", borderRadius: "14px", padding: "9px 10px", background: fondoInterno, border: bordeInterno }}>
                      <strong style={{ color: item.color, fontSize: "18px", lineHeight: 1, fontWeight: 950, textAlign: "right" }}>{item.total}</strong>
                      <div style={{ minWidth: 0, display: "grid", gap: "5px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center", color: textoMedio, fontSize: "11px", fontWeight: 850 }}>
                          <span style={{ minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>
                          <span style={{ color: textoSuave, fontSize: "10px", fontWeight: 850 }}>{porcentaje}%</span>
                        </div>
                        <div style={{ height: "7px", borderRadius: "999px", background: fondoInternoFuerte, overflow: "hidden" }}>
                          <div style={{ width: `${Math.max(6, porcentaje)}%`, height: "100%", borderRadius: "999px", background: `linear-gradient(90deg, ${item.color}, rgba(56,189,248,0.56))`, boxShadow: `0 0 14px ${item.color}2f` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </aside>
            <section style={{ ...themedSurfaceStyle, padding: "16px", display: "grid", gap: "14px", width: "100%", maxWidth: "none", minWidth: 0, alignSelf: "stretch", justifySelf: "stretch", boxSizing: "border-box", gridColumn: "1 / -1" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "start", flexWrap: "wrap" }}>
                <div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "9px", borderRadius: "999px", padding: "6px 10px", background: temaClaro ? "rgba(37,99,235,0.10)" : "rgba(56,189,248,0.10)", border: temaClaro ? "1px solid rgba(37,99,235,0.22)" : "1px solid rgba(125,211,252,0.22)", color: textoAzul, fontSize: "11px", fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.7px", boxShadow: temaClaro ? "0 8px 18px rgba(37,99,235,0.08)" : "0 0 18px rgba(56,189,248,0.10)" }}>
                    <span style={{ width: "7px", height: "18px", borderRadius: "999px", background: "linear-gradient(180deg, rgba(56,189,248,0.96), rgba(99,102,241,0.72))", boxShadow: "0 0 14px rgba(56,189,248,0.32)" }} />
                    Filtros destacados para informe gerencial
                  </div>
                  <h2 style={{ margin: "8px 0 0", fontSize: "24px", lineHeight: 1.08, fontWeight: 1000, color: textoPrincipal, textShadow: temaClaro ? "none" : "0 0 20px rgba(56,189,248,0.14)" }}>
                    CONSTRUCTOR DE INFORME GERENCIAL PREVENTIVO
                  </h2>
                  <p style={{ margin: "5px 0 0", color: textoSuave, fontSize: "12px", lineHeight: 1.4, fontWeight: 750 }}>
                    El informe se arma solo con comandos, filtros y secciones seleccionadas aqui. Los filtros del dashboard no se incorporan automaticamente.
                  </p>
                  <PreventiveLegalRibbon
                    theme={temaClaro ? "light" : "dark"}
                    compact
                    text="Informe generado como herramienta de apoyo a la gestión preventiva, trazabilidad documental, evidencia de hallazgos, seguimiento de cierre y análisis ejecutivo, alineado al marco preventivo chileno vigente: Ley 16.744, DS 44 y DS 594."
                    style={{ marginTop: "8px" }}
                  />
                </div>
                <div style={{ borderRadius: "999px", padding: "7px 10px", background: fondoInterno, border: bordeInterno, color: textoAzul, fontSize: "11px", fontWeight: 950 }}>
                  PDF controlado por selección
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 0.9fr) minmax(0, 1.1fr)", gap: "12px", alignItems: "stretch" }}>
                <div style={{ display: "grid", gap: "12px", minWidth: 0 }}>
                  <div style={{ borderRadius: "18px", padding: "12px", background: fondoInterno, border: bordeInterno, display: "grid", gap: "9px" }}>
                    <div style={{ color: textoAzul, fontSize: "11px", fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.55px" }}>
                      Tipo de informe
                    </div>
                    {plantillasInformeGerencial.map((plantilla) => {
                      const activo = tipoInformeGerencial === plantilla.id;

                      return (
                        <button
                          key={plantilla.id}
                          type="button"
                          onClick={() => {
                            activarBoton(`plantilla-${plantilla.id}`);
                            setTipoInformeGerencial(plantilla.id);
                          }}
                          style={{
                            borderRadius: "14px",
                            border: activo ? "1px solid rgba(96,165,250,0.48)" : bordeInterno,
                            background: activo
                              ? "linear-gradient(135deg, rgba(37,99,235,0.84), rgba(14,165,233,0.46))"
                              : fondoInternoFuerte,
                            color: activo ? "#ffffff" : textoMedio,
                            padding: "10px 11px",
                            textAlign: "left",
                            cursor: "pointer",
                            display: "grid",
                            gap: "4px",
                            boxShadow: activo ? "0 12px 24px rgba(37,99,235,0.18)" : "none",
                          }}
                        >
                          <span style={{ fontSize: "12px", fontWeight: 950 }}>{plantilla.titulo}</span>
                          <span style={{ fontSize: "11px", lineHeight: 1.35, fontWeight: 750, opacity: activo ? 0.92 : 1 }}>{plantilla.detalle}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ borderRadius: "18px", padding: "12px", background: fondoInterno, border: bordeInterno, display: "grid", gap: "9px" }}>
                    <div style={{ color: textoAzul, fontSize: "11px", fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.55px" }}>
                      Nivel de detalle
                    </div>
                    {nivelDetalleInformeOpciones.map((opcion) => {
                      const activo = nivelDetalleInformeGerencial === opcion.id;

                      return (
                        <button
                          key={opcion.id}
                          type="button"
                          onClick={() => {
                            activarBoton(`nivel-informe-${opcion.id}`);
                            setNivelDetalleInformeGerencial(opcion.id);
                          }}
                          style={{
                            borderRadius: "14px",
                            border: activo ? "1px solid rgba(96,165,250,0.48)" : bordeInterno,
                            background: activo
                              ? temaClaro
                                ? "linear-gradient(135deg, rgba(37,99,235,0.92), rgba(14,165,233,0.58))"
                                : "linear-gradient(135deg, rgba(14,165,233,0.34), rgba(30,41,59,0.86))"
                              : fondoInternoFuerte,
                            color: activo ? (temaClaro ? "#ffffff" : textoAzul) : textoMedio,
                            padding: "9px 10px",
                            textAlign: "left",
                            cursor: "pointer",
                            display: "grid",
                            gap: "3px",
                            boxShadow: activo ? "0 12px 24px rgba(37,99,235,0.14)" : "none",
                          }}
                        >
                          <span style={{ fontSize: "12px", fontWeight: 950 }}>{opcion.label}</span>
                          <span style={{ fontSize: "11px", lineHeight: 1.35, fontWeight: 750, opacity: activo ? 0.94 : 1 }}>{opcion.detalle}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ borderRadius: "18px", padding: "12px", background: fondoInterno, border: bordeInterno, display: "grid", gap: "10px" }}>
                    <div style={{ color: textoAzul, fontSize: "11px", fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.55px" }}>
                      Alcance operacional
                    </div>
                    {[
                      ["Empresa reportante", "empresaReportante", opciones.empresasReportantes],
                      ["Empresa responsable / involucrada", "empresaResponsable", opciones.empresasResponsables],
                      ["Obra / proyecto", "obra", opciones.obras],
                      ["Area", "area", opciones.areas],
                      ["Tipo de hallazgo", "tipoHallazgo", opciones.tipos],
                    ].map(([label, key, values]) => (
                      <label key={`informe-${key}`} style={{ display: "grid", gap: "6px" }}>
                        <span style={{ color: textoSuave, fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          {label as string}
                        </span>
                        <select
                          value={String(filtrosInformeGerencial[key as keyof FiltrosInformeGerencial] || "")}
                          onChange={(event) =>
                            asignarFiltroInforme({
                              [key as string]: event.target.value || undefined,
                            } as Partial<FiltrosInformeGerencial>)
                          }
                          style={themedInputStyle}
                        >
                          <option value="">No seleccionado</option>
                          {(values as string[]).map((valor) => (
                            <option key={`informe-${key}-${valor}`} value={valor}>
                              {valor}
                            </option>
                          ))}
                        </select>
                      </label>
                    ))}
                  </div>

                  <div style={{ borderRadius: "18px", padding: "12px", background: fondoInterno, border: bordeInterno, display: "grid", gap: "10px" }}>
                    <div style={{ color: textoAzul, fontSize: "11px", fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.55px" }}>
                      Personas
                    </div>
                    {opciones.reportantes.length > 0 && (
                      <label style={{ display: "grid", gap: "6px" }}>
                        <span style={{ color: textoSuave, fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          Supervisor/reportante
                        </span>
                        <select
                          value={filtrosInformeGerencial.reportante || ""}
                          onChange={(event) => asignarFiltroInforme({ reportante: event.target.value || undefined })}
                          style={themedInputStyle}
                        >
                          <option value="">No seleccionado</option>
                          {opciones.reportantes.map((valor) => (
                            <option key={`informe-reportante-${valor}`} value={valor}>{valor}</option>
                          ))}
                        </select>
                      </label>
                    )}
                    <label style={{ display: "grid", gap: "6px" }}>
                      <span style={{ color: textoSuave, fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Responsable de cierre
                      </span>
                      <select
                        value={filtrosInformeGerencial.responsableCierre || ""}
                        onChange={(event) => asignarFiltroInforme({ responsableCierre: event.target.value || undefined })}
                        style={themedInputStyle}
                      >
                        <option value="">No seleccionado</option>
                        {opciones.responsables.map((valor) => (
                          <option key={`informe-responsable-${valor}`} value={valor}>{valor}</option>
                        ))}
                      </select>
                    </label>
                    <label style={{ display: "grid", gap: "6px" }}>
                      <span style={{ color: textoSuave, fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Cargo del responsable
                      </span>
                      <select
                        value={filtrosInformeGerencial.responsableCargo || ""}
                        onChange={(event) => asignarFiltroInforme({ responsableCargo: event.target.value || undefined })}
                        style={themedInputStyle}
                      >
                        <option value="">No seleccionado</option>
                        {opciones.cargosResponsables.map((valor) => (
                          <option key={`informe-cargo-${valor}`} value={valor}>{valor}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>

                <div style={{ borderRadius: "18px", padding: "12px", background: fondoInterno, border: bordeInterno, display: "grid", gap: "12px", alignContent: "start" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ color: textoAzul, fontSize: "11px", fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.55px" }}>
                      Comandos y secciones del informe
                    </div>
                    <button
                      type="button"
                      onClick={limpiarInformeGerencial}
                      style={{ ...botonStyle("preset-informe"), minHeight: "32px", padding: "7px 10px", fontSize: "11px" }}
                    >
                      Limpiar informe
                    </button>
                  </div>

                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={agregarFiltrosActualesAlInforme}
                      style={{ ...botonStyle("agregar-filtros-informe", true), minHeight: "34px", padding: "7px 10px", fontSize: "11px" }}
                    >
                      Agregar filtros actuales al informe
                    </button>
                    <button
                      type="button"
                      onClick={() => aplicarPeriodoInforme("periodo-filtrado")}
                      style={{ ...botonStyle("periodo-filtrado-informe"), minHeight: "34px", padding: "7px 10px", fontSize: "11px" }}
                    >
                      Periodo filtrado actual
                    </button>
                  </div>

                  <div style={{ display: "grid", gap: "10px", borderRadius: "16px", padding: "10px", background: fondoInternoFuerte, border: bordeInterno }}>
                    {[
                      {
                        titulo: "Riesgo",
                        items: [
                          ["Criticos", filtrosInformeGerencial.criticidad === "CRITICO", () => asignarFiltroInforme({ criticidad: filtrosInformeGerencial.criticidad === "CRITICO" ? undefined : "CRITICO" })],
                          ["Altos", filtrosInformeGerencial.criticidad === "ALTO", () => asignarFiltroInforme({ criticidad: filtrosInformeGerencial.criticidad === "ALTO" ? undefined : "ALTO" })],
                          ["Medios", filtrosInformeGerencial.criticidad === "MEDIO", () => asignarFiltroInforme({ criticidad: filtrosInformeGerencial.criticidad === "MEDIO" ? undefined : "MEDIO" })],
                          ["Bajos", filtrosInformeGerencial.criticidad === "BAJO", () => asignarFiltroInforme({ criticidad: filtrosInformeGerencial.criticidad === "BAJO" ? undefined : "BAJO" })],
                          ["Criticos abiertos", Boolean(filtrosInformeGerencial.soloCriticosAbiertos), () => asignarFiltroInforme({ soloCriticosAbiertos: !filtrosInformeGerencial.soloCriticosAbiertos })],
                          ["Reincidencias", Boolean(filtrosInformeGerencial.soloReincidencias), () => asignarFiltroInforme({ soloReincidencias: !filtrosInformeGerencial.soloReincidencias })],
                        ] as Array<[string, boolean, () => void]>,
                      },
                      {
                        titulo: "Estado y cierre",
                        items: [
                          ["Reportados", filtrosInformeGerencial.estado === "REPORTADO", () => asignarFiltroInforme({ estado: filtrosInformeGerencial.estado === "REPORTADO" ? undefined : "REPORTADO" })],
                          ["Abiertos", filtrosInformeGerencial.estado === "ABIERTO", () => asignarFiltroInforme({ estado: filtrosInformeGerencial.estado === "ABIERTO" ? undefined : "ABIERTO" })],
                          ["En seguimiento", filtrosInformeGerencial.estado === "EN_SEGUIMIENTO", () => asignarFiltroInforme({ estado: filtrosInformeGerencial.estado === "EN_SEGUIMIENTO" ? undefined : "EN_SEGUIMIENTO" })],
                          ["Cerrados", filtrosInformeGerencial.estado === "CERRADO", () => asignarFiltroInforme({ estado: filtrosInformeGerencial.estado === "CERRADO" ? undefined : "CERRADO" })],
                          ["Anulados", filtrosInformeGerencial.estado === "ANULADO", () => asignarFiltroInforme({ estado: filtrosInformeGerencial.estado === "ANULADO" ? undefined : "ANULADO" })],
                          ["Vencidos", filtrosInformeGerencial.vencimiento === "vencidos", () => asignarFiltroInforme({ vencimiento: filtrosInformeGerencial.vencimiento === "vencidos" ? "todos" : "vencidos" })],
                          ["No vencidos", filtrosInformeGerencial.vencimiento === "no-vencidos", () => asignarFiltroInforme({ vencimiento: filtrosInformeGerencial.vencimiento === "no-vencidos" ? "todos" : "no-vencidos" })],
                          ["Sin fecha compromiso", Boolean(filtrosInformeGerencial.sinFechaCompromiso), () => asignarFiltroInforme({ sinFechaCompromiso: !filtrosInformeGerencial.sinFechaCompromiso })],
                        ] as Array<[string, boolean, () => void]>,
                      },
                      {
                        titulo: "Evidencia y trazabilidad",
                        items: [
                          ["Con GPS", filtrosInformeGerencial.gps === "con-gps", () => asignarFiltroInforme({ gps: filtrosInformeGerencial.gps === "con-gps" ? "todos" : "con-gps" })],
                          ["Sin GPS", filtrosInformeGerencial.gps === "sin-gps", () => asignarFiltroInforme({ gps: filtrosInformeGerencial.gps === "sin-gps" ? "todos" : "sin-gps" })],
                          ["Con evidencia", filtrosInformeGerencial.evidencia === "con-evidencia", () => asignarFiltroInforme({ evidencia: filtrosInformeGerencial.evidencia === "con-evidencia" ? "todos" : "con-evidencia" })],
                          ["Sin evidencia", filtrosInformeGerencial.evidencia === "sin-evidencia", () => asignarFiltroInforme({ evidencia: filtrosInformeGerencial.evidencia === "sin-evidencia" ? "todos" : "sin-evidencia" })],
                        ] as Array<[string, boolean, () => void]>,
                      },
                      {
                        titulo: "Periodo",
                        items: [
                          ["Hoy", filtrosInformeGerencial.fechaDesde === new Date().toISOString().slice(0, 10) && filtrosInformeGerencial.fechaHasta === new Date().toISOString().slice(0, 10), () => aplicarPeriodoInforme("hoy")],
                          ["Esta semana", Boolean(filtrosInformeGerencial.fechaDesde && filtrosInformeGerencial.fechaHasta && !filtrosInformeGerencial.mes), () => aplicarPeriodoInforme("semana")],
                          ["Este mes", filtrosInformeGerencial.mes === new Date().toISOString().slice(0, 7), () => aplicarPeriodoInforme("mes")],
                        ] as Array<[string, boolean, () => void]>,
                      },
                    ].map((grupo) => (
                      <div key={`comandos-informe-${grupo.titulo}`} style={{ display: "grid", gap: "7px" }}>
                        <div style={{ color: textoSuave, fontSize: "10px", fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          {grupo.titulo}
                        </div>
                        <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>
                          {grupo.items.map(([label, activo, accion]) => (
                            <button
                              key={`comando-informe-${grupo.titulo}-${label}`}
                              type="button"
                              onClick={accion}
                              style={{
                                minHeight: "32px",
                                borderRadius: "999px",
                                border: activo ? "1px solid rgba(96,165,250,0.52)" : bordeInterno,
                                background: activo
                                  ? "linear-gradient(135deg, rgba(37,99,235,0.88), rgba(14,165,233,0.62))"
                                  : fondoInterno,
                                color: activo ? "#ffffff" : textoMedio,
                                padding: "7px 10px",
                                fontSize: "11px",
                                fontWeight: 900,
                                cursor: "pointer",
                              }}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      <label style={{ display: "grid", gap: "5px" }}>
                        <span style={{ color: textoSuave, fontSize: "10px", fontWeight: 900, textTransform: "uppercase" }}>Desde</span>
                        <input type="date" value={filtrosInformeGerencial.fechaDesde || ""} onChange={(event) => asignarFiltroInforme({ fechaDesde: event.target.value || undefined })} style={themedInputStyle} />
                      </label>
                      <label style={{ display: "grid", gap: "5px" }}>
                        <span style={{ color: textoSuave, fontSize: "10px", fontWeight: 900, textTransform: "uppercase" }}>Hasta</span>
                        <input type="date" value={filtrosInformeGerencial.fechaHasta || ""} onChange={(event) => asignarFiltroInforme({ fechaHasta: event.target.value || undefined })} style={themedInputStyle} />
                      </label>
                    </div>
                  </div>

                  {[
                    {
                      titulo: "A. Secciones principales",
                      items: seccionesPrincipalesInformeGerencial,
                      seleccion: seccionesInformeSeleccionadas,
                      cambiar: alternarSeccionInforme,
                    },
                    {
                      titulo: "B. Graficos y visualizaciones",
                      items: graficosInformeGerencial,
                      seleccion: graficosInformeSeleccionados,
                      cambiar: alternarGraficoInforme,
                    },
                    {
                      titulo: "C. Rankings",
                      items: rankingsInformeGerencial,
                      seleccion: rankingsInformeSeleccionados,
                      cambiar: alternarRankingInforme,
                    },
                    {
                      titulo: "D. Hallazgos y detalle",
                      items: hallazgosDetalleInformeGerencial,
                      seleccion: seccionesInformeSeleccionadas,
                      cambiar: alternarSeccionInforme,
                    },
                  ].map((grupo) => (
                    <div key={grupo.titulo} style={{ display: "grid", gap: "8px", borderRadius: "16px", padding: "10px", background: fondoInternoFuerte, border: bordeInterno }}>
                      <div style={{ color: textoSuave, fontSize: "10px", fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        {grupo.titulo}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(165px, 1fr))", gap: "7px" }}>
                        {grupo.items.map((item) => {
                          const activa = grupo.seleccion.includes(item.id as never);

                          return (
                            <label key={`${grupo.titulo}-${item.id}`} style={{ display: "flex", gap: "8px", alignItems: "center", minHeight: "33px", borderRadius: "12px", padding: "7px 8px", background: activa ? temaClaro ? "rgba(37,99,235,0.10)" : "rgba(56,189,248,0.10)" : temaClaro ? "rgba(255,255,255,0.62)" : "rgba(2,6,23,0.24)", border: activa ? "1px solid rgba(96,165,250,0.30)" : bordeInterno, color: activa ? textoAzul : textoMedio, fontSize: "11px", fontWeight: 850 }}>
                              <input
                                type="checkbox"
                                checked={activa}
                                onChange={(event) => grupo.cambiar(item.id as never, event.target.checked)}
                              />
                              <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  <div style={{ display: "grid", gap: "10px", borderRadius: "16px", padding: "10px", background: fondoInternoFuerte, border: bordeInterno }}>
                    <div style={{ color: textoSuave, fontSize: "10px", fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Detalle del informe
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 130px", gap: "8px" }}>
                      <label style={{ display: "grid", gap: "6px" }}>
                        <span style={{ color: textoSuave, fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          Tipo de detalle
                        </span>
                        <select
                          value={detalleInformeGerencial}
                          onChange={(event) => cambiarDetalleInformeGerencial(event.target.value as DetalleInformeGerencial)}
                          style={themedInputStyle}
                        >
                          {detalleInformeOpciones.map((opcion) => (
                            <option key={opcion.id} value={opcion.id}>
                              {opcion.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label style={{ display: "grid", gap: "6px", opacity: detalleInformeGerencial === "sin-detalle" ? 0.58 : 1 }}>
                        <span style={{ color: textoSuave, fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          Max. filas
                        </span>
                        <select
                          value={maxFilasDetalleInforme}
                          disabled={detalleInformeGerencial === "sin-detalle"}
                          onChange={(event) => setMaxFilasDetalleInforme(maxFilasDetalleDesdeValor(event.target.value))}
                          style={themedInputStyle}
                        >
                          {maxFilasDetalleInformeOpciones.map((opcion) => (
                            <option key={`max-detalle-${opcion}`} value={opcion}>
                              {opcion}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <div style={{ color: textoSuave, fontSize: "11px", lineHeight: 1.35, fontWeight: 750 }}>
                      {detalleInformeOpciones.find((opcion) => opcion.id === detalleInformeGerencial)?.detalle}
                      {detalleInformeGerencial === "anexo-completo-futuro"
                        ? " Anexo completo queda preparado como fase posterior; no exporta todavia."
                        : ""}
                    </div>
                  </div>

                  <div style={{ display: "grid", gap: "12px", borderRadius: "18px", padding: "13px", background: temaClaro ? "rgba(239,246,255,0.72)" : "linear-gradient(145deg, rgba(8,47,73,0.44), rgba(15,23,42,0.72))", border: temaClaro ? "1px solid rgba(37,99,235,0.24)" : "1px solid rgba(125,211,252,0.22)", borderLeft: temaClaro ? "3px solid rgba(37,99,235,0.72)" : "3px solid rgba(56,189,248,0.72)", boxShadow: temaClaro ? "0 12px 24px rgba(15,23,42,0.05)" : "inset 0 1px 0 rgba(255,255,255,0.04)" }}>
                    <div style={{ display: "grid", gap: "4px" }}>
                      <div style={{ color: textoAzul, fontSize: "11px", fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.55px" }}>
                        Configuración de datos para gráficos
                      </div>
                      <div style={{ color: textoSuave, fontSize: "12px", lineHeight: 1.35, fontWeight: 750 }}>
                        Defina qué series, rankings y focos comparativos se incluirán en el informe.
                      </div>
                    </div>
                    <div style={{ display: "grid", gap: "7px" }}>
                      <div style={{ color: textoMedio, fontSize: "11px", fontWeight: 950 }}>
                        Series para Tendencia temporal
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(165px, 1fr))", gap: "7px" }}>
                        {seriesTendenciaInformeOpciones.map((serie) => {
                          const activa = seriesTendenciaInformeSeleccionadas.includes(serie.id);

                          return (
                            <label key={`serie-tendencia-informe-${serie.id}`} style={{ display: "flex", gap: "8px", alignItems: "center", minHeight: "33px", borderRadius: "12px", padding: "7px 8px", background: activa ? temaClaro ? "rgba(37,99,235,0.10)" : "rgba(56,189,248,0.10)" : temaClaro ? "rgba(255,255,255,0.62)" : "rgba(2,6,23,0.24)", border: activa ? "1px solid rgba(96,165,250,0.30)" : bordeInterno, color: activa ? textoAzul : textoMedio, fontSize: "11px", fontWeight: 850 }}>
                              <input
                                type="checkbox"
                                checked={activa}
                                onChange={(event) => alternarSerieTendenciaInforme(serie.id, event.target.checked)}
                              />
                              <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{serie.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "8px" }}>
                      <label style={{ display: "grid", gap: "6px" }}>
                        <span style={{ color: textoSuave, fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          Ranking principal
                        </span>
                        <select
                          value={rankingPrincipalInforme}
                          onChange={(event) => setRankingPrincipalInforme(event.target.value as RankingInformeGerencial)}
                          style={themedInputStyle}
                        >
                          {rankingsInformeGerencial.map((ranking) => (
                            <option key={`ranking-principal-${ranking.id}`} value={ranking.id}>
                              {ranking.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label style={{ display: "grid", gap: "6px" }}>
                        <span style={{ color: textoSuave, fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          Foco comparativo
                        </span>
                        <select
                          value={focoComparativoInforme}
                          onChange={(event) => setFocoComparativoInforme(event.target.value as FocoComparativoInforme)}
                          style={themedInputStyle}
                        >
                          {focoComparativoInformeOpciones.map((foco) => (
                            <option key={`foco-comparativo-${foco.id}`} value={foco.id}>
                              {foco.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <div style={{ color: textoSuave, fontSize: "11px", lineHeight: 1.35, fontWeight: 750 }}>
                      Configuracion inicial para que el PDF use datos seleccionados por el usuario. La fase futura puede abrir control por dato en cada grafico o seccion.
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ borderRadius: "22px", padding: "15px", background: temaClaro ? "rgba(248,250,252,0.88)" : "linear-gradient(145deg, rgba(15,23,42,0.78), rgba(8,47,73,0.34))", border: temaClaro ? "1px solid rgba(37,99,235,0.16)" : "1px solid rgba(125,211,252,0.18)", borderLeft: temaClaro ? "3px solid rgba(37,99,235,0.62)" : "3px solid rgba(56,189,248,0.68)", display: "grid", gap: "13px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "start", flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: "11px", color: textoAzul, fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.55px" }}>
                      Vista previa
                    </div>
                    <h3 style={{ margin: "4px 0 0", color: textoPrincipal, fontSize: "18px", lineHeight: 1.18, fontWeight: 950 }}>
                      {tituloAutomaticoInformeGerencial}
                    </h3>
                    <div style={{ marginTop: "5px", color: textoSuave, fontSize: "12px", lineHeight: 1.4, fontWeight: 750 }}>
                      {plantillaInformeActiva.titulo} · {etiquetaNivelDetalleInforme(nivelDetalleInformeGerencial)} · {etiquetaAlcanceInforme} · {analisisInformeGerencial.total} hallazgo(s) incluidos
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      onClick={() => void copiarResumenInformeGerencial()}
                      style={{ ...botonStyle("copiar-informe-gerencial", true), minHeight: "36px", padding: "8px 11px", fontSize: "12px" }}
                    >
                      Copiar resumen ejecutivo
                    </button>
                    <button
                      type="button"
                      disabled={estadoPdfInformeGerencial === "generando"}
                      title="Genera un PDF documental desde la configuracion actual del Constructor."
                      onClick={() => void generarPdfInformeGerencial()}
                      style={{
                        ...botonStyle("pdf-informe", true),
                        minHeight: "36px",
                        padding: "8px 11px",
                        fontSize: "12px",
                        opacity: estadoPdfInformeGerencial === "generando" ? 0.68 : 1,
                        cursor: estadoPdfInformeGerencial === "generando" ? "wait" : "pointer",
                      }}
                    >
                      {estadoPdfInformeGerencial === "generando"
                        ? "Generando PDF..."
                        : estadoPdfInformeGerencial === "generado"
                          ? "PDF generado"
                          : estadoPdfInformeGerencial === "error"
                            ? "Error al generar PDF"
                            : "Generar PDF"}
                    </button>
                    <button type="button" disabled title="Excel real pendiente para KPI-E4." style={{ ...botonStyle("excel-informe"), minHeight: "36px", padding: "8px 11px", fontSize: "12px", opacity: 0.55, cursor: "not-allowed", color: textoSuave }}>
                      Exportar Excel — Proximamente
                    </button>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>
                  {comandosInformeResumen.length > 0 ? (
                    comandosInformeResumen.map((comando) => (
                      <span key={`informe-comando-${comando}`} style={{ borderRadius: "999px", padding: "6px 9px", background: fondoInternoFuerte, border: bordeInterno, color: textoMedio, fontSize: "11px", fontWeight: 850 }}>
                        {comando}
                      </span>
                    ))
                  ) : (
                    <span style={{ borderRadius: "999px", padding: "6px 9px", background: fondoInternoFuerte, border: bordeInterno, color: textoMedio, fontSize: "11px", fontWeight: 850 }}>
                      No se han seleccionado elementos para este informe.
                    </span>
                  )}
                </div>

                <div style={{ borderRadius: "18px", padding: "12px", background: temaClaro ? "rgba(239,246,255,0.62)" : "rgba(8,47,73,0.28)", border: temaClaro ? "1px solid rgba(37,99,235,0.16)" : "1px solid rgba(125,211,252,0.16)", display: "grid", gap: "10px" }}>
                  <div style={{ color: textoAzul, fontSize: "11px", fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.55px" }}>
                    Elementos incluidos en el informe
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "8px" }}>
                    {[
                      ["Nivel de detalle", etiquetaNivelDetalleInforme(nivelDetalleInformeGerencial)],
                      ["Comandos seleccionados", `${comandosInformeResumen.length}`],
                      ["Secciones principales", etiquetasSeccionesPrincipalesSeleccionadas.join(", ")],
                      ["Graficos incluidos", etiquetasGraficosSeleccionados.join(", ")],
                      ["Series tendencia", etiquetasSeriesTendenciaSeleccionadas.join(", ")],
                      ["Rankings incluidos", etiquetasRankingsSeleccionados.join(", ")],
                      ["Ranking principal", etiquetaRankingPrincipalSeleccionado],
                      ["Foco comparativo", etiquetaFocoComparativoSeleccionado],
                      ["Hallazgos y detalle", etiquetasHallazgosDetalleSeleccionados.join(", ")],
                      ["Detalle del informe", `${etiquetaDetalleInforme(detalleInformeGerencial)}${detalleInformeGerencial === "detalle-resumido" ? ` · ${maxFilasDetalleInforme} filas` : ""}`],
                      ["Hallazgos incluidos", `${analisisInformeGerencial.total}`],
                      ["Filas de detalle estimadas", `${cantidadDetalleEstimada}`],
                      ["Advertencias aplicables", `${advertenciasInformeGerencial.length}`],
                    ].map(([label, valor]) => (
                      <div key={`elemento-informe-${label}`} style={{ minWidth: 0, borderRadius: "14px", padding: "9px 10px", background: fondoInterno, border: bordeInterno, display: "grid", gap: "4px" }}>
                        <span style={{ color: textoSuave, fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.45px" }}>
                          {label}
                        </span>
                        <strong style={{ color: textoPrincipal, fontSize: "12px", lineHeight: 1.35, fontWeight: 900 }}>
                          {valor}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>

                {!hayElementosInformeGerencial && (
                  <div style={{ borderRadius: "18px", padding: "16px", background: temaClaro ? "rgba(248,250,252,0.86)" : "rgba(15,23,42,0.54)", border: bordeInterno, color: textoMedio, fontSize: "13px", lineHeight: 1.5, fontWeight: 800 }}>
                    No se han seleccionado elementos para este informe.
                  </div>
                )}

                {seccionesInformeSeleccionadas.includes("kpis") && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "9px" }}>
                    {[
                      ["Total", analisisInformeGerencial.total, "#38bdf8"],
                      ["Abiertos", metricasInformeGerencial.abiertos, "#fb7185"],
                      ["Criticos abiertos", metricasInformeGerencial.criticosAbiertos, "#ef4444"],
                      ["Vencidos abiertos", metricasInformeGerencial.vencidosAbiertos, "#f97316"],
                      ["Sin fecha", metricasInformeGerencial.sinFechaCompromiso, "#facc15"],
                      ["Tasa cierre", `${analisisInformeGerencial.tasaCierre}%`, "#22c55e"],
                    ].map(([label, valor, color]) => (
                      <div key={String(label)} style={{ borderRadius: "14px", padding: "10px", background: fondoInterno, border: bordeInterno, display: "grid", gap: "5px" }}>
                        <span style={{ color: textoSuave, fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.45px" }}>{label}</span>
                        <strong style={{ color: String(color), fontSize: "20px", lineHeight: 1, fontWeight: 950 }}>{valor}</strong>
                      </div>
                    ))}
                  </div>
                )}

                {(!hayElementosInformeGerencial || seccionesInformeSeleccionadas.includes("resumen")) && (
                <div style={{ borderRadius: "16px", padding: "12px", background: fondoInterno, border: bordeInterno }}>
                  <div style={{ color: textoAzul, fontSize: "11px", fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.55px" }}>
                    Resumen ejecutivo deterministico
                  </div>
                  <p style={{ margin: "8px 0 0", color: textoPrincipal, fontSize: "13px", lineHeight: 1.5, fontWeight: 760 }}>
                    {resumenInformeGerencial}
                  </p>
                </div>
                )}

                {analisisSeccionesInformeGerencial.length > 0 && (
                  <div style={{ display: "grid", gap: "12px", borderRadius: "20px", padding: "15px", background: temaClaro ? "linear-gradient(145deg, rgba(255,255,255,0.96), rgba(239,246,255,0.88))" : "linear-gradient(145deg, rgba(15,23,42,0.92), rgba(8,47,73,0.52))", border: temaClaro ? "1px solid rgba(37,99,235,0.20)" : "1px solid rgba(125,211,252,0.22)", borderLeft: temaClaro ? "4px solid rgba(37,99,235,0.78)" : "4px solid rgba(56,189,248,0.78)", boxShadow: temaClaro ? "0 16px 32px rgba(15,23,42,0.08)" : "0 18px 42px rgba(0,0,0,0.24)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "start", flexWrap: "wrap" }}>
                      <div>
                        <h3 style={{ margin: 0, color: textoPrincipal, fontSize: "22px", lineHeight: 1.1, fontWeight: 950, letterSpacing: "0" }}>
                          Análisis ejecutivo por sección
                        </h3>
                        <div style={{ marginTop: "6px", color: textoSuave, fontSize: "13px", lineHeight: 1.35, fontWeight: 780 }}>
                          Interpretación técnica y gerencial de las secciones seleccionadas.
                        </div>
                      </div>
                      <span style={{ borderRadius: "999px", padding: "6px 9px", background: fondoInternoFuerte, border: bordeInterno, color: textoMedio, fontSize: "11px", fontWeight: 850 }}>
                        {analisisSeccionesInformeGerencial.length} sección(es) · Ley 16.744 · DS 44 · DS 594
                      </span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "11px" }}>
                      {analisisSeccionesInformeGerencial.map((analisisSeccion) => (
                        <div key={`analisis-informe-${analisisSeccion.id}`} style={{ borderRadius: "16px", padding: "13px", background: temaClaro ? "rgba(255,255,255,0.88)" : "rgba(2,6,23,0.34)", border: temaClaro ? "1px solid rgba(37,99,235,0.18)" : "1px solid rgba(125,211,252,0.16)", borderLeft: temaClaro ? "3px solid rgba(37,99,235,0.72)" : "3px solid rgba(56,189,248,0.68)", display: "grid", gap: "9px", alignContent: "start" }}>
                          <div style={{ color: textoPrincipal, fontSize: "14px", fontWeight: 950, lineHeight: 1.2 }}>
                            {analisisSeccion.titulo}
                          </div>
                          {[
                            ["Observación", analisisSeccion.observacion],
                            ["Brecha o riesgo", analisisSeccion.brecha],
                            ["Acción recomendada", analisisSeccion.accion],
                            ["Base preventiva/normativa", analisisSeccion.base],
                          ].map(([label, texto]) => (
                            <div key={`analisis-informe-${analisisSeccion.id}-${label}`} style={{ display: "grid", gap: "3px" }}>
                              <span style={{ color: textoMedio, fontSize: "11px", lineHeight: 1.38, fontWeight: 760 }}>
                                <strong style={{ color: textoAzul, fontWeight: 950 }}>{label}: </strong>
                                {texto}
                              </span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {seccionesInformeSeleccionadas.includes("riesgos") && (
                <div style={{ borderRadius: "16px", padding: "12px", background: fondoInterno, border: bordeInterno, display: "grid", gap: "8px", alignContent: "start" }}>
                  <div style={{ color: textoAzul, fontSize: "11px", fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.55px" }}>
                    Riesgos principales
                  </div>
                  {[
                    `Criticos abiertos: ${metricasInformeGerencial.criticosAbiertos}`,
                    `Vencidos abiertos: ${metricasInformeGerencial.vencidosAbiertos}`,
                    `Sin fecha compromiso: ${metricasInformeGerencial.sinFechaCompromiso}`,
                    `Sin responsable: ${metricasInformeGerencial.sinResponsable}`,
                  ].map((riesgo) => (
                    <div key={`informe-riesgo-${riesgo}`} style={{ borderRadius: "12px", padding: "8px 9px", background: fondoInternoFuerte, border: bordeInterno, color: textoMedio, fontSize: "11px", fontWeight: 850 }}>
                      {riesgo}
                    </div>
                  ))}
                </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px" }}>
                  {(seccionesInformeSeleccionadas.includes("calidad-dato") ||
                    graficosInformeSeleccionados.includes("calidad-dato")) && (
                    <div style={{ borderRadius: "16px", padding: "12px", background: fondoInterno, border: bordeInterno, display: "grid", gap: "8px" }}>
                      <div style={{ color: textoAzul, fontSize: "11px", fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.55px" }}>Calidad del dato</div>
                      {[
                        ["Con GPS", metricasInformeGerencial.conGps],
                        ["Con evidencia", metricasInformeGerencial.conEvidencia],
                        ["Con responsable", metricasInformeGerencial.conResponsable],
                        ["Con fecha compromiso", metricasInformeGerencial.conFechaCompromiso],
                      ].map(([label, valor]) => (
                        <div key={`calidad-informe-${label}`} style={{ display: "flex", justifyContent: "space-between", gap: "8px", color: textoMedio, fontSize: "11px", fontWeight: 850 }}>
                          <span>{label}</span>
                          <strong style={{ color: textoPrincipal }}>{valor} / {analisisInformeGerencial.total || 0}</strong>
                        </div>
                      ))}
                    </div>
                  )}

                  {rankingsInformeSeleccionados.length > 0 && (
                    <div style={{ borderRadius: "16px", padding: "12px", background: fondoInterno, border: bordeInterno, display: "grid", gap: "8px" }}>
                      <div style={{ color: textoAzul, fontSize: "11px", fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.55px" }}>Focos comparativos</div>
                      {[
                        ["Empresa reportante", analisisInformeGerencial.porEmpresaReportante[0]?.nombre || "Sin datos"],
                        ["Empresa responsable", analisisInformeGerencial.porEmpresaResponsable[0]?.nombre || "Sin datos"],
                        ["Obra", analisisInformeGerencial.porObra[0]?.nombre || "Sin datos"],
                        ["Area", analisisInformeGerencial.porArea[0]?.nombre || "Sin datos"],
                        ["Tipo", analisisInformeGerencial.porTipo[0]?.nombre || "Sin datos"],
                        ["Responsable", analisisInformeGerencial.porResponsable[0]?.nombre || "Sin datos"],
                      ]
                        .filter(([label]) => {
                          if (label === "Empresa reportante") return rankingsInformeSeleccionados.includes("ranking-empresa-reportante");
                          if (label === "Empresa responsable") return rankingsInformeSeleccionados.includes("ranking-empresa-responsable");
                          if (label === "Obra") return rankingsInformeSeleccionados.includes("ranking-obras");
                          if (label === "Area") return rankingsInformeSeleccionados.includes("ranking-areas");
                          if (label === "Tipo") return rankingsInformeSeleccionados.includes("ranking-tipos");
                          return rankingsInformeSeleccionados.includes("ranking-responsables");
                        })
                        .map(([label, valor]) => (
                        <div key={`comparativo-informe-${label}`} style={{ display: "flex", justifyContent: "space-between", gap: "8px", color: textoMedio, fontSize: "11px", fontWeight: 850 }}>
                          <span>{label}</span>
                          <strong style={{ color: textoPrincipal, textAlign: "right" }}>{valor}</strong>
                        </div>
                      ))}
                    </div>
                  )}

                  {(detalleInformeGerencial !== "sin-detalle" ||
                    seccionesInformeSeleccionadas.includes("detalle-resumido")) && (
                    <div style={{ borderRadius: "16px", padding: "12px", background: fondoInterno, border: bordeInterno, display: "grid", gap: "8px" }}>
                      <div style={{ color: textoAzul, fontSize: "11px", fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.55px" }}>Detalle resumido</div>
                      {hallazgosInformeGerencial.slice(0, maxFilasDetalleInforme).map((hallazgo) => (
                        <div key={`informe-detalle-${hallazgo.codigo}`} style={{ display: "grid", gridTemplateColumns: "86px minmax(0, 1fr) auto", gap: "8px", alignItems: "center", color: textoMedio, fontSize: "11px", fontWeight: 850 }}>
                          <strong style={{ color: textoPrincipal }}>{hallazgo.codigo}</strong>
                          <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{hallazgo.empresaResponsable || hallazgo.empresaReportante || hallazgo.empresa}</span>
                          <span style={{ color: colorCriticidad(hallazgo.criticidad), fontWeight: 950 }}>{traducirCriticidad(hallazgo.criticidad)}</span>
                        </div>
                      ))}
                      {hallazgosInformeGerencial.length === 0 && (
                        <div style={{ color: textoSuave, fontSize: "11px", fontWeight: 750 }}>Sin hallazgos para el alcance seleccionado.</div>
                      )}
                    </div>
                  )}
                </div>

                {seccionesInformeSeleccionadas.includes("advertencias") && (
                <div style={{ borderRadius: "16px", padding: "12px", background: temaClaro ? "rgba(254,249,195,0.56)" : "rgba(250,204,21,0.08)", border: temaClaro ? "1px solid rgba(202,138,4,0.20)" : "1px solid rgba(250,204,21,0.18)", display: "grid", gap: "7px" }}>
                  <div style={{ color: temaClaro ? "#92400e" : "#fde68a", fontSize: "11px", fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.55px" }}>
                    Advertencias de datos
                  </div>
                  {advertenciasInformeGerencial.map((advertencia) => (
                    <div key={`advertencia-informe-${advertencia}`} style={{ color: textoMedio, fontSize: "11px", lineHeight: 1.35, fontWeight: 760 }}>
                      {advertencia}
                    </div>
                  ))}
                </div>
                )}

                {seccionesInformeSeleccionadas.includes("nota-normativa") && (
                <div style={{ borderRadius: "14px", padding: "10px 12px", background: fondoInterno, border: bordeInterno, color: textoSuave, fontSize: "11px", lineHeight: 1.45, fontWeight: 760 }}>
                  Este análisis es determinístico y se basa en los registros actualmente cargados en KPI. No reemplaza auditoría legal ni validación técnica formal.
                </div>
                )}
              </div>
            </section>
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
