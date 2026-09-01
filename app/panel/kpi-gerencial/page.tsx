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
import PremiumWorkspaceShell from "../../components/PremiumWorkspaceShell";
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

type TipoInformeGerencial =
  | "gestion-operativa"
  | "ejecutivo-general"
  | "comparativo-gerencial"
  | "criticos-vencidos"
  | "calidad-dato";

type CategoriaInformePreventivo = "operativo" | "gerencial";

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
  categoria: CategoriaInformePreventivo;
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
    id: "gestion-operativa",
    categoria: "operativo",
    titulo: "Informe de Gestión de Hallazgos",
    detalle: "Seguimiento operativo con responsables, plazos, estados, evidencias y trazabilidad de cierre.",
    nivelDetalle: "informe-operativo",
    secciones: [
      "kpis",
      "resumen",
      "riesgos",
      "criticos-abiertos",
      "vencidos-abiertos",
      "sin-fecha-compromiso",
      "cierre-vencimiento",
      "detalle-resumido",
      "recomendacion",
      "advertencias",
    ],
    graficos: ["cierre-vencimiento", "control-inmediato"],
    rankings: ["ranking-empresa-responsable", "ranking-responsables"],
    detalleInforme: "detalle-filtrado",
    maxFilasDetalle: 20,
  },
  {
    id: "ejecutivo-general",
    categoria: "gerencial",
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
    id: "comparativo-gerencial",
    categoria: "gerencial",
    titulo: "Informe Comparativo Gerencial",
    detalle: "Benchmark transversal de empresas, obras, áreas y responsables con tendencias y concentración de riesgo.",
    nivelDetalle: "resumen-gerencial",
    secciones: [
      "kpis",
      "resumen",
      "riesgos",
      "recomendacion",
      "nota-normativa",
      "advertencias",
    ],
    graficos: ["tendencia", "matriz", "comparaciones", "cierre-vencimiento"],
    rankings: [
      "ranking-empresa-reportante",
      "ranking-empresa-responsable",
      "ranking-obras",
      "ranking-areas",
    ],
    detalleInforme: "sin-detalle",
    maxFilasDetalle: 5,
  },
  {
    id: "criticos-vencidos",
    categoria: "operativo",
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
    categoria: "gerencial",
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
  { id: "criticos-abiertos", label: "Análisis de críticos abiertos" },
  { id: "vencidos-abiertos", label: "Análisis de vencidos" },
  { id: "sin-fecha-compromiso", label: "Análisis de hallazgos sin fecha" },
  { id: "cerrados", label: "Análisis de cierres" },
  { id: "backlog-no-cerrado", label: "Análisis del backlog" },
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
    detalle: "Agrega lectura ejecutiva y anexo documental ampliado para respaldo.",
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
  { id: "anexo-completo-futuro", label: "Anexo documental ampliado", detalle: "Incluye hasta 20 hallazgos filtrados como respaldo." },
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

function formatearPeriodoTendenciaInforme(valor: string) {
  if (!/^\d{4}-\d{2}$/.test(valor)) return valor;
  return formatearMesInforme(valor);
}

function cantidadConSustantivo(
  cantidad: number,
  singular: string,
  plural = `${singular}s`
) {
  return `${cantidad} ${cantidad === 1 ? singular : plural}`;
}

function tituloBaseInforme(tipo: TipoInformeGerencial, nivel: NivelDetalleInformeGerencial) {
  if (tipo === "gestion-operativa") {
    return "Informe de Gestión de Hallazgos Preventivos";
  }
  if (tipo === "comparativo-gerencial") {
    return "Informe Comparativo Gerencial Preventivo";
  }
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
  "Este análisis apoya la lectura de gestión preventiva bajo el marco de la Ley 16.744, el DS 44 y el DS 594, con foco en trazabilidad, evidencia, responsables, seguimiento y mejora continua. No reemplaza una auditoría legal ni una validación técnica formal.";

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

function colorTasaCierre(tasa: number) {
  if (tasa < 30) return "#dc2626";
  if (tasa < 60) return "#ea580c";
  if (tasa < 80) return "#ca8a04";
  return "#16a34a";
}

function tonoTasaCierre(tasa: number): "red" | "amber" | "green" {
  if (tasa < 30) return "red";
  if (tasa < 80) return "amber";
  return "green";
}

function colorRiesgoRanking(item: RankingKpiGerencial) {
  const pendientes = Math.max(0, item.total - item.cerrados);
  if (item.vencidos > 0 || (item.criticos > 0 && item.tasaCierre < 50)) {
    return "linear-gradient(90deg,#b91c1c,#ef4444)";
  }
  if (item.criticos > 0 || (pendientes > 0 && item.tasaCierre === 0)) {
    return "linear-gradient(90deg,#dc2626,#f97316)";
  }
  if (pendientes > 0 || item.tasaCierre < 80) {
    return "linear-gradient(90deg,#d97706,#facc15)";
  }
  return "linear-gradient(90deg,#15803d,#22c55e)";
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
  const [categoriaInformePreventivo, setCategoriaInformePreventivo] =
    useState<CategoriaInformePreventivo>("gerencial");
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
    useState<SeccionInformeGerencial[]>([
      "kpis",
      "resumen",
      "riesgos",
      "recomendacion",
      "calidad-dato",
      "nota-normativa",
      "advertencias",
    ]);
  const [graficosInformeSeleccionados, setGraficosInformeSeleccionados] =
    useState<GraficoInformeGerencial[]>(["radar", "tendencia", "matriz"]);
  const [rankingsInformeSeleccionados, setRankingsInformeSeleccionados] =
    useState<RankingInformeGerencial[]>([
      "ranking-empresa-reportante",
      "ranking-obras",
    ]);
  const [detalleInformeGerencial, setDetalleInformeGerencial] =
    useState<DetalleInformeGerencial>("sin-detalle");
  const [maxFilasDetalleInforme, setMaxFilasDetalleInforme] =
    useState<MaxFilasDetalleInforme>(10);
  const [seriesTendenciaInformeSeleccionadas, setSeriesTendenciaInformeSeleccionadas] =
    useState<SerieTendenciaInforme[]>([
      "total-reportado",
      "cerrados",
      "criticos-abiertos",
      "vencidos-abiertos",
    ]);
  const [rankingPrincipalInforme, setRankingPrincipalInforme] =
    useState<RankingInformeGerencial>("ranking-empresa-responsable");
  const [focoComparativoInforme, setFocoComparativoInforme] =
    useState<FocoComparativoInforme>("mayor-carga-critica");
  const [estadoPdfInformeGerencial, setEstadoPdfInformeGerencial] =
    useState<EstadoPdfInformeGerencial>("idle");
  const [vistaPreviaInformeHtml, setVistaPreviaInformeHtml] = useState("");
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

  const detalleAccionableFiltrado = useMemo(() => {
    const busqueda = normalizarTexto(busquedaDetalleAccionable.trim());
    if (!busqueda) return detalleAccionableBase;

    return detalleAccionableBase.filter((hallazgo) =>
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
  }, [busquedaDetalleAccionable, detalleAccionableBase]);

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

  useEffect(() => {
    setPaginaDetalleAccionable(1);
    setHallazgoDetalleAbierto("");
  }, [
    busquedaDetalleAccionable,
    focoDetalleAccionable,
    limiteDetalleAccionable,
  ]);

  useEffect(() => {
    if (paginaDetalleAccionable > totalPaginasDetalleAccionable) {
      setPaginaDetalleAccionable(totalPaginasDetalleAccionable);
    }
  }, [paginaDetalleAccionable, totalPaginasDetalleAccionable]);

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
      ? "Concentración de carga y vencimientos por empresa, con acceso al detalle filtrado."
      : modoAnalisis === "criticidad"
        ? "Lectura de concentracion con criticidad visible en las barras y panel lateral."
        : modoAnalisis === "cierres"
          ? "Comparacion por responsable disponible en los registros cargados."
          : modoAnalisis === "reincidencias"
            ? "Tipos repetidos que ayudan a orientar prevencion."
            : "Comparacion segun los filtros activos y los registros cargados.";
  const rankingInformeModoActivo: RankingInformeGerencial =
    modoAnalisis === "ranking-obras"
      ? "ranking-obras"
      : modoAnalisis === "ranking-areas"
        ? "ranking-areas"
        : modoAnalisis === "ranking-tipos" || modoAnalisis === "reincidencias"
          ? "ranking-tipos"
          : modoAnalisis === "ranking-responsables" || modoAnalisis === "cierres"
            ? "ranking-responsables"
            : modoAnalisis === "ranking-empresas-responsables"
              ? "ranking-empresa-responsable"
              : "ranking-empresa-reportante";
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
  const maxTendenciaActividad = Math.max(
    1,
    ...tendenciaSeriesVisible.flatMap((item) => [item.total, item.cerrados])
  );
  const maxTendenciaRiesgo = Math.max(
    1,
    ...tendenciaSeriesVisible.flatMap((item) => [
      item.criticosAbiertos,
      item.vencidosAbiertos,
    ])
  );
  const lecturaTendenciaTablero = (() => {
    const actual = tendenciaSeriesVisible.at(-1);
    const anterior = tendenciaSeriesVisible.at(-2);
    if (!actual) return "Sin datos temporales suficientes para emitir una lectura ejecutiva.";

    const variacionVolumen = anterior ? actual.total - anterior.total : 0;
    const direccionVolumen =
      !anterior || variacionVolumen === 0
        ? "se mantiene sin variación comparable"
        : variacionVolumen > 0
          ? `aumentó en ${variacionVolumen}`
          : `disminuyó en ${Math.abs(variacionVolumen)}`;
    const tasaCierrePeriodo = actual.total
      ? Math.round((actual.cerrados / actual.total) * 100)
      : 0;

    return `En ${actual.periodo}, el volumen reportado ${direccionVolumen}. La tasa de cierre del periodo es ${tasaCierrePeriodo}% y permanecen abiertos ${actual.criticosAbiertos} hallazgos críticos y ${actual.vencidosAbiertos} hallazgos vencidos asociados a ese periodo.`;
  })();
  const tendenciaEscalaMaxima = Math.max(
    2,
    ...tendenciaSeriesVisible.flatMap((item) => [
      item.total,
      item.criticosAbiertos,
      item.vencidosAbiertos,
    ])
  );
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
  const tendenciaTotalPolyline = tendenciaPuntos.map((item) => `${item.x},${item.yTotal}`).join(" ");
  const tendenciaCriticosPolyline = tendenciaPuntos.map((item) => `${item.x},${item.yCriticos}`).join(" ");
  const tendenciaVencidosPolyline = tendenciaPuntos.map((item) => `${item.x},${item.yVencidos}`).join(" ");
  const tendenciaEscalas = [tendenciaEscalaMaxima, tendenciaEscalaMedia, 0];
  const tendenciaLineasVerticales =
    tendenciaPuntos.length > 1
      ? tendenciaPuntos.map((item) => item.x)
      : [tendenciaPlotLeft, (tendenciaPlotLeft + tendenciaPlotRight) / 2, tendenciaPlotRight];
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
  const etiquetaCategoriaInforme =
    categoriaInformePreventivo === "gerencial"
      ? "Informe Ejecutivo Gerencial"
      : "Informe de Gestión de Hallazgos";
  const huellaPerfilInforme = `${usuarioGeneradorInforme.rol || ""} ${usuarioGeneradorInforme.cargo || ""}`.toLowerCase();
  const perfilInformeSoloOperativo =
    /supervisor|reportante|terreno/.test(huellaPerfilInforme) &&
    !/admin|geren|ejecut|super_admin/.test(huellaPerfilInforme);
  const perfilGerencialHabilitado = !perfilInformeSoloOperativo;
  const plantillasCategoriaActiva = plantillasInformeGerencial.filter(
    (plantilla) => plantilla.categoria === categoriaInformePreventivo
  );
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
  const aplicarPlantillaInforme = (plantilla: (typeof plantillasInformeGerencial)[number]) => {
    if (plantilla.categoria === "gerencial" && !perfilGerencialHabilitado) {
      setMensaje("El Informe Ejecutivo Gerencial requiere un perfil ejecutivo habilitado.");
      return;
    }
    setCategoriaInformePreventivo(plantilla.categoria);
    setTipoInformeGerencial(plantilla.id);
    aplicarConfiguracionInforme(plantilla);
    setSeriesTendenciaInformeSeleccionadas(
      plantilla.categoria === "gerencial"
        ? ["total-reportado", "cerrados", "criticos-abiertos", "vencidos-abiertos"]
        : ["cerrados", "criticos-abiertos", "vencidos-abiertos", "sin-fecha-compromiso"]
    );
    setEstadoPdfInformeGerencial("idle");
    setMensaje(`${plantilla.titulo} preparado. Ajuste el alcance o genere la vista previa.`);
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
    setCategoriaInformePreventivo("gerencial");
    setTipoInformeGerencial("ejecutivo-general");
    setAlcanceInformeGerencial("general");
    setValorAlcanceInformeGerencial("");
    setNivelDetalleInformeGerencial("resumen-gerencial");
    setSeccionesInformeSeleccionadas([]);
    setGraficosInformeSeleccionados([]);
    setRankingsInformeSeleccionados([]);
    setDetalleInformeGerencial("sin-detalle");
    setMaxFilasDetalleInforme(10);
    setSeriesTendenciaInformeSeleccionadas([]);
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
  const enfocarConstructorInforme = () => {
    window.requestAnimationFrame(() => {
      document.getElementById("constructor-informes-preventivos")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };
  const enfocarDetalleAccionable = (
    foco: FocoDetalleAccionable,
    descripcion: string
  ) => {
    setFocoDetalleAccionable(foco);
    setPaginaDetalleAccionable(1);
    setBusquedaDetalleAccionable("");
    setHallazgoDetalleAbierto("");
    setMensaje(`${descripcion} Detalle filtrado y listo para revisión.`);
    window.requestAnimationFrame(() => {
      document.getElementById("detalle-accionable-kpi")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };
  const prepararInformeGerencialDesdeTablero = (
    tipo: "grafico" | "ranking",
    id: GraficoInformeGerencial | RankingInformeGerencial,
    etiqueta: string
  ) => {
    if (!perfilGerencialHabilitado) {
      setMensaje("Esta visualización requiere un perfil ejecutivo gerencial habilitado.");
      return;
    }

    setCategoriaInformePreventivo("gerencial");
    setTipoInformeGerencial("comparativo-gerencial");
    setNivelDetalleInformeGerencial("resumen-gerencial");
    setSeccionesInformeSeleccionadas((actual) =>
      Array.from(
        new Set<SeccionInformeGerencial>([
          ...actual,
          "kpis",
          "resumen",
          "riesgos",
          "recomendacion",
          "nota-normativa",
          "advertencias",
        ])
      )
    );

    if (tipo === "grafico") {
      setGraficosInformeSeleccionados((actual) =>
        Array.from(new Set([...actual, id as GraficoInformeGerencial]))
      );
    } else {
      const ranking = id as RankingInformeGerencial;
      setRankingsInformeSeleccionados((actual) =>
        Array.from(new Set([...actual, ranking]))
      );
      setRankingPrincipalInforme(ranking);
    }

    agregarFiltrosActualesAlInforme();
    setMensaje(`${etiqueta} agregado al Informe Ejecutivo Gerencial.`);
    enfocarConstructorInforme();
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

    const existePeriodoMaestro = Boolean(
      filtros.fechaDesde || filtros.fechaHasta || filtros.semana || filtros.mes
    );
    if (!existePeriodoMaestro) {
      setMensaje("No existe un período activo en los filtros maestros del KPI. Seleccione fechas en el constructor o aplique Hoy, Esta semana o Este mes.");
      return;
    }

    asignarFiltroInforme({
      fechaDesde: filtros.fechaDesde || undefined,
      fechaHasta: filtros.fechaHasta || undefined,
      semana: filtros.semana || undefined,
      mes: filtros.mes || undefined,
    });
    setMensaje("Período del tablero aplicado correctamente al informe.");
  };
  const existePeriodoMaestroInforme = Boolean(
    filtros.fechaDesde || filtros.fechaHasta || filtros.semana || filtros.mes
  );
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
    if (!hayElementosInformeGerencial) return [];

    const universoInforme = hayComandosFiltroInforme
      ? filtrarHallazgosKpiGerencial(hallazgos, filtrosInformeGerencial)
      : hallazgos;

    return universoInforme.filter(
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
    const cerrados = hallazgosInformeGerencial.filter(
      (hallazgo) => hallazgo.estado === "CERRADO"
    );
    const cerradosValidados = cerrados.filter(
      (hallazgo) =>
        Boolean(hallazgo.evidenciaCierreRecibida) ||
        Boolean(hallazgo.cierreSinEvidenciaJustificado)
    );
    const cerradosSinRespaldo = cerrados.filter(
      (hallazgo) =>
        !hallazgo.evidenciaCierreRecibida &&
        !hallazgo.cierreSinEvidenciaJustificado
    );
    const total = hallazgosInformeGerencial.length;
    const abiertosConResponsable = abiertos.filter(
      (hallazgo) =>
        Boolean(hallazgo.responsableCierre) &&
        hallazgo.responsableCierre !== "Sin responsable"
    ).length;
    const abiertosConFechaCompromiso = abiertos.filter((hallazgo) =>
      Boolean(hallazgo.fechaCompromiso)
    ).length;
    const conEmpresaResponsable = hallazgosInformeGerencial.filter((hallazgo) =>
      Boolean(hallazgo.empresaResponsable)
    ).length;
    const abiertosPorCriticidad: Record<CriticidadKpiGerencial, number> = {
      CRITICO: abiertos.filter((hallazgo) => hallazgo.criticidad === "CRITICO").length,
      ALTO: abiertos.filter((hallazgo) => hallazgo.criticidad === "ALTO").length,
      MEDIO: abiertos.filter((hallazgo) => hallazgo.criticidad === "MEDIO").length,
      BAJO: abiertos.filter((hallazgo) => hallazgo.criticidad === "BAJO").length,
    };

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
      abiertosConResponsable,
      abiertosConFechaCompromiso,
      conEmpresaResponsable,
      abiertosPorCriticidad,
      cerradosValidados: cerradosValidados.length,
      cerradosSinRespaldo: cerradosSinRespaldo.length,
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
  const tendenciaVisualInforme = useMemo(() => {
    const criticosAbiertos = new Map<string, number>();
    const vencidosAbiertos = new Map<string, number>();
    const sinFecha = new Map<string, number>();

    hallazgosInformeGerencial.forEach((hallazgo) => {
      const periodo = periodoTendenciaDesdeFecha(hallazgo.fechaISO);
      const abierto = esHallazgoAbiertoGerencial(hallazgo);
      if (abierto && hallazgo.criticidad === "CRITICO") {
        criticosAbiertos.set(periodo, (criticosAbiertos.get(periodo) || 0) + 1);
      }
      if (esHallazgoVencidoDetalle(hallazgo)) {
        vencidosAbiertos.set(periodo, (vencidosAbiertos.get(periodo) || 0) + 1);
      }
      if (abierto && !hallazgo.fechaCompromiso) {
        sinFecha.set(periodo, (sinFecha.get(periodo) || 0) + 1);
      }
    });

    return analisisInformeGerencial.tendenciaTemporal.slice(-6).map((item) => ({
      ...item,
      criticosAbiertos: criticosAbiertos.get(item.periodo) || 0,
      vencidosAbiertos: vencidosAbiertos.get(item.periodo) || 0,
      sinFecha: sinFecha.get(item.periodo) || 0,
    }));
  }, [analisisInformeGerencial.tendenciaTemporal, hallazgosInformeGerencial]);
  const lecturaTendenciaInforme = useMemo(() => {
    const actual = tendenciaVisualInforme.at(-1);
    const anterior = tendenciaVisualInforme.at(-2);
    if (!actual) return "No existen periodos suficientes para interpretar una tendencia.";
    const variacion = anterior ? actual.total - anterior.total : 0;
    const cambio =
      !anterior || variacion === 0
        ? "sin variación comparable"
        : variacion > 0
          ? `con un aumento de ${variacion} reportes`
          : `con una disminución de ${Math.abs(variacion)} reportes`;
    const tasaCierre = actual.total ? Math.round((actual.cerrados / actual.total) * 100) : 0;
    return `El periodo ${formatearPeriodoTendenciaInforme(actual.periodo)} registra ${cantidadConSustantivo(actual.total, "hallazgo")}, ${cambio} respecto del periodo anterior. La tasa de cierre alcanza ${tasaCierre}%. Permanecen abiertos ${cantidadConSustantivo(actual.criticosAbiertos, "hallazgo crítico", "hallazgos críticos")} y ${cantidadConSustantivo(actual.vencidosAbiertos, "hallazgo vencido", "hallazgos vencidos")}.`;
  }, [tendenciaVisualInforme]);
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
  const etiquetaAlcanceInforme =
    alcanceInformeGerencial === "periodo"
      ? "Periodo actual filtrado"
      : alcanceInformeGerencial === "general"
        ? "General"
        : `${alcanceInformeOpciones.find((opcion) => opcion.id === alcanceInformeGerencial)?.label || "Alcance"}: ${
            valorAlcanceInformeGerencial || "Todos"
          }`;
  const fechaCorteInforme = new Date().toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const periodoInformeEtiqueta = filtrosInformeGerencial.mes
    ? formatearMesInforme(filtrosInformeGerencial.mes)
    : filtrosInformeGerencial.semana
      ? `Semana desde ${filtrosInformeGerencial.semana}`
      : filtrosInformeGerencial.fechaDesde || filtrosInformeGerencial.fechaHasta
        ? `${filtrosInformeGerencial.fechaDesde || "inicio"} a ${filtrosInformeGerencial.fechaHasta || "hoy"}`
        : `Corte acumulado al ${fechaCorteInforme}`;
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
        periodoInformeEtiqueta,
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

    if (analisisInformeGerencial.total === 0) {
      return "No existen hallazgos disponibles para el alcance seleccionado. Esta ausencia de registros no debe interpretarse como cumplimiento preventivo.";
    }

    if (tipoInformeGerencial === "criticos-vencidos") {
      return `Durante el alcance seleccionado se registran ${analisisInformeGerencial.total} hallazgos, con ${metricasInformeGerencial.criticosAbiertos} criticos abiertos, ${metricasInformeGerencial.vencidosAbiertos} vencidos abiertos y ${metricasInformeGerencial.sinFechaCompromiso} abiertos sin fecha compromiso. La presion principal se concentra en ${empresaFocoInforme} y el responsable con mayor carga es ${responsableFocoInforme}. Se recomienda priorizar cierre, fecha compromiso y responsable real.`;
    }

    if (tipoInformeGerencial === "calidad-dato") {
      return `La calidad del dato del alcance seleccionado muestra ${metricasInformeGerencial.conGps} registros con GPS, ${metricasInformeGerencial.conEvidencia} con evidencia de reporte, ${metricasInformeGerencial.conResponsable} con responsable asignado y ${metricasInformeGerencial.conFechaCompromiso} con fecha compromiso. Se recomienda regularizar registros sin responsable, sin plazo o sin evidencia antes de usarlos como respaldo formal.`;
    }

    const tasaAbiertos = analisisInformeGerencial.total
      ? Math.round((metricasInformeGerencial.abiertos / analisisInformeGerencial.total) * 100)
      : 0;
    return `El alcance analizado contiene ${analisisInformeGerencial.total} hallazgos. ${metricasInformeGerencial.abiertos} permanecen abiertos (${tasaAbiertos}% del total), incluidos ${metricasInformeGerencial.criticosAbiertos} críticos y ${metricasInformeGerencial.vencidosAbiertos} vencidos. La tasa de cierre es ${analisisInformeGerencial.tasaCierre}% y ${metricasInformeGerencial.sinFechaCompromiso} hallazgos abiertos no tienen fecha de compromiso. La mayor concentración se observa en ${empresaFocoInforme} y ${obraFocoInforme}. Se requiere priorización gerencial, responsables verificables y un plan documentado de cierre.`;
  }, [
    analisisInformeGerencial.tasaCierre,
    analisisInformeGerencial.total,
    empresaFocoInforme,
    hayElementosInformeGerencial,
    metricasInformeGerencial,
    obraFocoInforme,
    responsableFocoInforme,
    tipoInformeGerencial,
  ]);
  const nivelAlertaInforme =
    metricasInformeGerencial.vencidosAbiertos > 0 ||
    metricasInformeGerencial.criticosAbiertos > 0 ||
    (analisisInformeGerencial.total > 0 && analisisInformeGerencial.tasaCierre <= 20)
      ? "critico"
      : metricasInformeGerencial.sinFechaCompromiso > 0 ||
          analisisInformeGerencial.tasaCierre < 60
        ? "alto"
        : metricasInformeGerencial.abiertos > 0
          ? "atencion"
          : "controlado";
  const etiquetaNivelAlertaInforme =
    nivelAlertaInforme === "critico"
      ? "ALERTA CRÍTICA"
      : nivelAlertaInforme === "alto"
        ? "RIESGO ALTO"
        : nivelAlertaInforme === "atencion"
          ? "REQUIERE ATENCIÓN"
          : "GESTIÓN CONTROLADA";
  const alertaEjecutivaInforme =
    analisisInformeGerencial.total === 0
      ? "No existen registros para el alcance seleccionado. La ausencia de reportes no acredita cumplimiento y debe validarse contra la nómina de empresas activas y su meta de reportabilidad."
      : `${metricasInformeGerencial.abiertos} de ${analisisInformeGerencial.total} hallazgos permanecen abiertos. Se mantienen ${metricasInformeGerencial.criticosAbiertos} críticos, ${metricasInformeGerencial.vencidosAbiertos} vencidos y ${metricasInformeGerencial.sinFechaCompromiso} sin fecha de compromiso. La tasa de cierre alcanza solo ${analisisInformeGerencial.tasaCierre}%.`;
  const planAccionEjecutivoInforme = [
    metricasInformeGerencial.criticosAbiertos > 0
      ? {
          prioridad: "Inmediata" as const,
          accion: `Controlar y escalar ${cantidadConSustantivo(metricasInformeGerencial.criticosAbiertos, "hallazgo crítico abierto", "hallazgos críticos abiertos")}.`,
          responsable: "Gerencia preventiva y empresa responsable",
          plazo: "24 horas",
          evidencia: "Control inmediato, responsable, fecha y plan de cierre",
        }
      : null,
    metricasInformeGerencial.vencidosAbiertos > 0
      ? {
          prioridad: "Inmediata" as const,
          accion: `Regularizar ${cantidadConSustantivo(metricasInformeGerencial.vencidosAbiertos, "hallazgo vencido", "hallazgos vencidos")} y documentar la causa del atraso.`,
          responsable: "Administrador de contrato",
          plazo: "48 horas",
          evidencia: "Nuevo compromiso aprobado o cierre documentado",
        }
      : null,
    metricasInformeGerencial.sinFechaCompromiso > 0
      ? {
          prioridad: "Alta" as const,
          accion: `Asignar fecha de compromiso a ${cantidadConSustantivo(metricasInformeGerencial.sinFechaCompromiso, "hallazgo abierto", "hallazgos abiertos")}.`,
          responsable: "Responsables de cierre",
          plazo: "72 horas",
          evidencia: "Fecha, responsable y seguimiento registrados",
        }
      : null,
    metricasInformeGerencial.sinResponsable > 0
      ? {
          prioridad: "Alta" as const,
          accion: `Asignar responsable nominal a ${cantidadConSustantivo(metricasInformeGerencial.sinResponsable, "hallazgo abierto", "hallazgos abiertos")}.`,
          responsable: "Administrador del cliente",
          plazo: "48 horas",
          evidencia: "Responsable y cargo confirmados",
        }
      : null,
    metricasInformeGerencial.cerradosSinRespaldo > 0
      ? {
          prioridad: "Alta" as const,
          accion: `Revisar ${cantidadConSustantivo(metricasInformeGerencial.cerradosSinRespaldo, "cierre", "cierres")} sin respaldo formal.`,
          responsable: "Prevención y revisor de cierre",
          plazo: "48 horas",
          evidencia: "Evidencia de cierre o justificación formal",
        }
      : null,
    metricasInformeGerencial.criticosAbiertos === 0 &&
    metricasInformeGerencial.vencidosAbiertos === 0 &&
    metricasInformeGerencial.sinFechaCompromiso === 0 &&
    metricasInformeGerencial.sinResponsable === 0 &&
    metricasInformeGerencial.cerradosSinRespaldo === 0
      ? {
          prioridad: "Programada" as const,
          accion: "Mantener el control de compromisos y validar los nuevos cierres.",
          responsable: "Equipo preventivo",
          plazo: "Revisión semanal",
          evidencia: "Acta de seguimiento y cierres validados",
        }
      : null,
  ].filter(Boolean) as Array<{
    prioridad: "Inmediata" | "Alta" | "Programada";
    accion: string;
    responsable: string;
    plazo: string;
    evidencia: string;
  }>;
  const hallazgosPrioritariosInforme = useMemo(() => {
    const pesoCriticidad: Record<CriticidadKpiGerencial, number> = {
      CRITICO: 400,
      ALTO: 300,
      MEDIO: 200,
      BAJO: 100,
    };
    const motivoPrioridad = (hallazgo: HallazgoKpiGerencial) => {
      const motivos: string[] = [];
      if (esHallazgoVencidoDetalle(hallazgo)) {
        motivos.push(`Vencido ${cantidadConSustantivo(diasVencidoDetalle(hallazgo), "día")}`);
      }
      if (!hallazgo.fechaCompromiso) motivos.push("Sin fecha de compromiso");
      if (!hallazgo.responsableCierre || hallazgo.responsableCierre === "Sin responsable") {
        motivos.push("Sin responsable nominal");
      }
      if (hallazgo.criticidad === "CRITICO") motivos.push("Criticidad crítica");
      return motivos.join("; ") || "Seguimiento preventivo pendiente";
    };
    return hallazgosInformeGerencial
      .filter(esHallazgoAbiertoGerencial)
      .map((hallazgo) => ({
        hallazgo,
        puntaje:
          pesoCriticidad[hallazgo.criticidad] +
          (esHallazgoVencidoDetalle(hallazgo) ? 1000 + diasVencidoDetalle(hallazgo) : 0) +
          (!hallazgo.fechaCompromiso ? 180 : 0) +
          (!hallazgo.responsableCierre || hallazgo.responsableCierre === "Sin responsable" ? 160 : 0),
      }))
      .sort((a, b) => b.puntaje - a.puntaje || a.hallazgo.codigo.localeCompare(b.hallazgo.codigo))
      .slice(0, 10)
      .map(({ hallazgo }) => ({
        codigo: hallazgo.codigo,
        criticidad: etiquetaCriticidad(hallazgo.criticidad),
        empresa: hallazgo.empresaResponsable || "Sin empresa responsable",
        obra: hallazgo.obra || "Sin obra",
        responsable: hallazgo.responsableCierre || "Sin responsable",
        plazo: esHallazgoVencidoDetalle(hallazgo)
          ? `Vencido ${cantidadConSustantivo(diasVencidoDetalle(hallazgo), "día")}`
          : hallazgo.fechaCompromiso
            ? fechaCortaDetalle(hallazgo.fechaCompromiso)
            : "Sin fecha",
        motivo: motivoPrioridad(hallazgo),
      }));
  }, [hallazgosInformeGerencial]);
  const advertenciasInformeGerencial = useMemo(
    () =>
      [
        hayElementosInformeGerencial
          ? "El análisis considera exclusivamente el alcance, los filtros y las secciones seleccionadas al momento de emitir el documento."
          : "No se han seleccionado elementos para este informe.",
        metricasGerenciales.analisisLimitadoPorCarga
          ? "El límite actual de carga puede no representar todo el histórico si existen más registros."
          : null,
        informeConBacklogVisible
          ? "El periodo debe leerse junto con los hallazgos pendientes de periodos anteriores para mantener la trazabilidad de la gestión vigente."
          : null,
        seccionesInformeSeleccionadas.includes("calidad-dato")
          ? "Todo cierre debe contar con evidencia o justificación formal antes de contabilizarse como cumplimiento."
          : null,
        seccionesInformeSeleccionadas.includes("matriz") ||
        seccionesInformeSeleccionadas.includes("radar")
          ? "Los rankings y comparativos son herramientas de priorización; sus conclusiones deben respaldarse con el detalle accionable."
          : null,
        "La reincidencia es un patrón preventivo de alerta y no constituye, por sí sola, una conclusión contractual definitiva.",
        "Los índices de cumplimiento son indicadores de gestión y no reemplazan la validación técnica.",
        "Este informe apoya la toma de decisiones preventivas; no reemplaza una auditoría legal ni la validación de un profesional competente.",
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
    const areaPrincipal = analisisInformeGerencial.porArea[0]?.nombre || "sin área dominante";
    const enfoquePlantilla =
      tipoInformeGerencial === "criticos-vencidos"
        ? "priorizar escalamiento, responsables nominales, fecha compromiso y evidencia de cierre documentada."
        : tipoInformeGerencial === "calidad-dato"
          ? "regularizar datos incompletos antes de usar el informe como respaldo documental o auditoría interna."
          : "concentrar decisión gerencial en criticidad, plazos, responsables y brechas con mayor impacto preventivo.";

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
            `El alcance incluye ${total} hallazgo(s), ${metricasInformeGerencial.abiertos} abierto(s), ${cerrados} cerrado(s), ${metricasInformeGerencial.criticosAbiertos} crítico(s) abierto(s), ${metricasInformeGerencial.vencidosAbiertos} vencido(s) abierto(s), ${metricasInformeGerencial.sinFechaCompromiso} sin fecha compromiso y tasa de cierre ${tasaCierre}%.`,
            "La combinación de criticidad, vencimiento y ausencia de plazo muestra presión operativa y posibles brechas de seguimiento preventivo.",
            `Usar estos KPIs para ordenar prioridades, exigir plan de cierre y ${enfoquePlantilla}`
          );
        case "resumen":
          return crearAnalisis(
            seccion,
            `La lectura global concentra foco en ${empresaFocoInforme}, ${obraFocoInforme} y responsable ${responsableFocoInforme}.`,
            "Una concentración sostenida puede indicar exposición preventiva activa o carga de gestión que requiere seguimiento de gerencia.",
            `Validar el foco con prevención y administración, confirmar causas, responsable, plazo y respaldo documental; luego ${enfoquePlantilla}`
          );
        case "riesgos":
          return crearAnalisis(
            seccion,
            `Los riesgos principales combinan ${metricasInformeGerencial.criticosAbiertos} crítico(s), ${metricasInformeGerencial.vencidosAbiertos} vencido(s), ${metricasInformeGerencial.sinFechaCompromiso} sin fecha y ${metricasInformeGerencial.sinResponsable} sin responsable.`,
            "La suma de criticidad, atraso, ausencia de plazo y responsable debilita la gestión vigente.",
            "Priorizar responsables, plazos y evidencia de cierre para los focos con mayor presión preventiva."
          );
        case "radar":
          return crearAnalisis(
            seccion,
            `El radar prioriza empresas con carga crítica, obras con vencidos, responsables pendientes y registros sin fecha compromiso en el alcance actual.`,
            "Estos focos muestran donde puede perderse control preventivo si no se asignan acciones, plazos y seguimiento verificable.",
            "Usar el radar para preparar comité, solicitar cierre documentado y revisar semanalmente los focos que concentran mayor presión."
          );
        case "tendencia":
          return crearAnalisis(
            seccion,
            "La tendencia temporal muestra evolución de hallazgos reportados, críticos abiertos y vencidos abiertos con los filtros actuales.",
            "Un aumento sostenido o puntos altos en críticos/vencidos indican presión de gestión y posible acumulación de brechas.",
            "Revisar los periodos con mayor carga y exigir plan de cierre documentado para los focos abiertos."
          );
        case "matriz":
          return crearAnalisis(
            seccion,
            `La matriz compara carga por empresas, obras, áreas, tipos y responsables; destacan ${empresaFocoInforme}, ${obraFocoInforme}, ${areaPrincipal} y ${tipoPrincipal}.`,
            "La comparación permite detectar concentraciones que pueden requerir intervención preventiva, redistribución de seguimiento o control por contrato.",
            "Presentar la matriz en reunión ejecutiva para definir prioridades por empresa, obra y responsable, evitando interpretar mayor reporte como peor desempeño sin revisar contexto."
          );
        case "comparaciones":
          return crearAnalisis(
            seccion,
            "Las comparaciones muestran variación entre periodo actual y periodo anterior para volumen, criticidad y cierre.",
            "Variaciones fuertes requieren revisar si responden a cambio real de riesgo, carga operativa o diferencia de registro.",
            "Usar la comparación como alerta gerencial y validar el detalle antes de definir conclusiones contractuales."
          );
        case "cierre-vencimiento":
          return crearAnalisis(
            seccion,
            `El cierre y vencimiento muestra ${metricasInformeGerencial.vencidosAbiertos} vencido(s), ${metricasInformeGerencial.sinFechaCompromiso} sin fecha y tasa de cierre ${tasaCierre}%.`,
            "La brecha de plazos y cierre afecta trazabilidad y oportunidad de la gestión preventiva.",
            "Escalar vencidos, regularizar fechas compromiso y validar evidencia o justificación formal de cierre."
          );
        case "control-inmediato":
          return crearAnalisis(
            seccion,
            "El control inmediato resume focos que requieren atención prioritaria por criticidad, vencimiento o falta de trazabilidad.",
            "Si estos focos no se gestionan, pueden mantenerse riesgos abiertos sin cierre verificable.",
            "Definir responsables nominales, plazos y evidencia esperada antes del siguiente comité."
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
    `Categoría: ${etiquetaCategoriaInforme}`,
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
        : "Universo completo visible para el perfil actual"
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
          `Críticos abiertos: ${metricasInformeGerencial.criticosAbiertos}`,
          `Vencidos abiertos: ${metricasInformeGerencial.vencidosAbiertos}`,
          `Sin fecha compromiso: ${metricasInformeGerencial.sinFechaCompromiso}`,
        ],
      },
      tendencia: {
        titulo: "Tendencia temporal",
        representa:
          "Evolución mensual configurada por el usuario para las series seleccionadas.",
        valores: tendenciaInformeConfigurada.map(
          (item) => `${item.periodo}: ${item.valores.join(", ")}`
        ),
      },
      matriz: {
        titulo: "Matriz comparativa gerencial",
        representa: "Comparación de concentración por empresa, obra, área, tipo y responsable.",
        valores: [
          `Empresa responsable foco: ${analisisInformeGerencial.porEmpresaResponsable[0]?.nombre || "Sin datos"}`,
          `Obra foco: ${analisisInformeGerencial.porObra[0]?.nombre || "Sin datos"}`,
          `Área foco: ${analisisInformeGerencial.porArea[0]?.nombre || "Sin datos"}`,
        ],
      },
      comparaciones: {
        titulo: "Comparaciones",
        representa: "Variación entre periodo actual y periodo comparado en volumen, criticidad y cierre.",
        valores: analisisInformeGerencial.comparaciones.map(
          (item) =>
            `${item.etiqueta}: actual ${item.actual}, comparado ${item.comparado}, variación ${item.variacion > 0 ? "+" : ""}${item.variacion}`
        ),
      },
      "cierre-vencimiento": {
        titulo: "Cierre y vencimiento",
        representa: "Presión de cierre, hallazgos vencidos y abiertos sin plazo.",
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
        representa: "Brechas que requieren acción operativa inmediata dentro del filtro actual.",
        valores: [
          `Críticos abiertos: ${metricasInformeGerencial.criticosAbiertos}`,
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
  async function copiarResumenInformeGerencial() {
    activarBoton("copiar-informe-gerencial");
    try {
      await navigator.clipboard.writeText(textoCopiableInformeGerencial);
      setMensaje("Resumen ejecutivo del informe copiado al portapapeles.");
    } catch {
      setMensaje("No fue posible copiar automaticamente. Seleccione y copie el texto manualmente.");
    }
  }

  async function generarPdfInformeGerencial(
    modo: "vista-previa" | "descargar" = "descargar"
  ) {
    const esVistaPrevia = modo === "vista-previa";
    activarBoton(esVistaPrevia ? "vista-previa-informe" : "pdf-informe");

    if (esVistaPrevia) {
      setMensaje("Preparando vista previa del informe gerencial.");
    } else {
      setEstadoPdfInformeGerencial("generando");
      setMensaje("Preparando descarga del PDF gerencial.");
    }

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
        : ["Universo completo visible para el perfil actual, sin filtros adicionales."];
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
    const renderDato = (
      label: string,
      valor: string | number,
      tono: "critico" | "alto" | "atencion" | "controlado" | "neutral" = "neutral"
    ) => `
      <div class="pdf-kpi ${tono === "neutral" ? "" : tono}">
        <span>${escaparHtmlInforme(label)}</span>
        <strong>${escaparHtmlInforme(valor)}</strong>
      </div>
    `;
    const colorSerieInforme: Record<SerieTendenciaInforme, string> = {
      "total-reportado": "#0284c7",
      "cerrados": "#16a34a",
      "criticos-abiertos": "#dc2626",
      "vencidos-abiertos": "#ea580c",
      "sin-fecha-compromiso": "#ca8a04",
    };
    const valorSerieInforme = (
      item: (typeof tendenciaVisualInforme)[number],
      serie: SerieTendenciaInforme
    ) =>
      serie === "total-reportado"
        ? item.total
        : serie === "cerrados"
          ? item.cerrados
          : serie === "criticos-abiertos"
            ? item.criticosAbiertos
            : serie === "vencidos-abiertos"
              ? item.vencidosAbiertos
              : item.sinFecha;
    const renderTendenciaVisual = () => {
      const series = seriesTendenciaInformeSeleccionadas.length
        ? seriesTendenciaInformeSeleccionadas
        : (["total-reportado", "cerrados", "criticos-abiertos", "vencidos-abiertos"] as SerieTendenciaInforme[]);
      const grupos = [
        {
          titulo: "Actividad operativa",
          series: series.filter((serie) => serie === "total-reportado" || serie === "cerrados"),
        },
        {
          titulo: "Presión de riesgo",
          series: series.filter((serie) => serie !== "total-reportado" && serie !== "cerrados"),
        },
      ].filter((grupo) => grupo.series.length > 0);
      const renderGrupo = (grupo: (typeof grupos)[number]) => {
        const maximo = Math.max(
          1,
          ...tendenciaVisualInforme.flatMap((item) =>
            grupo.series.map((serie) => valorSerieInforme(item, serie))
          )
        );
        return `
          <div class="pdf-trend-group">
            <h4>${escaparHtmlInforme(grupo.titulo)}</h4>
            <div class="pdf-trend-chart">
              ${tendenciaVisualInforme
                .map(
                  (item) => `
                    <div class="pdf-trend-period">
                      <div class="pdf-trend-bars">
                        ${grupo.series
                          .map((serie) => {
                            const valor = valorSerieInforme(item, serie);
                            const altura = valor === 0 ? 3 : Math.max(10, Math.round((valor / maximo) * 100));
                            return `<div class="pdf-trend-bar-wrap"><span>${valor}</span><div class="pdf-trend-bar" style="height:${altura}%;background:${colorSerieInforme[serie]}"></div></div>`;
                          })
                          .join("")}
                      </div>
                      <strong>${escaparHtmlInforme(item.periodo)}</strong>
                    </div>
                  `
                )
                .join("")}
            </div>
            <div class="pdf-legend">
              ${grupo.series
                .map(
                  (serie) => `<span><i style="background:${colorSerieInforme[serie]}"></i>${escaparHtmlInforme(etiquetaSerieTendenciaInforme(serie))}</span>`
                )
                .join("")}
            </div>
          </div>
        `;
      };
      return `
        <div class="pdf-trend-groups">${grupos.map(renderGrupo).join("")}</div>
        <p class="pdf-insight"><strong>Lectura gerencial:</strong> ${escaparHtmlInforme(lecturaTendenciaInforme)}</p>
      `;
    };
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
    }) => {
      const dataVisible = ranking.data.slice(0, 8);
      const maximo = Math.max(1, ...dataVisible.map((item) => item.total));
      const lider = dataVisible[0];
      const nivelRiesgoRanking = (item: RankingKpiGerencial) => {
        const pendientes = Math.max(0, item.total - item.cerrados);
        if (item.vencidos > 0 || (item.criticos > 0 && item.tasaCierre < 50)) return "critico";
        if (item.criticos > 0 || (pendientes > 0 && item.tasaCierre === 0)) return "alto";
        if (pendientes > 0 || item.tasaCierre < 80) return "atencion";
        return "controlado";
      };
      const etiquetaRiesgoRanking = (item: RankingKpiGerencial) => {
        const nivel = nivelRiesgoRanking(item);
        if (nivel === "critico") return "Crítico";
        if (nivel === "alto") return "Alto";
        if (nivel === "atencion") return "Atención";
        return "Controlado";
      };
      return `
      <section class="pdf-section pdf-table-section">
        <h2>${escaparHtmlInforme(ranking.titulo)}</h2>
        <p class="pdf-muted">${escaparHtmlInforme(ranking.metrica)}. El color representa condición de gestión; la longitud representa volumen.</p>
        <div class="pdf-ranking-bars">
          ${
            dataVisible.length > 0
              ? dataVisible
                  .map(
                    (item, index) => {
                      const cerradosPct = item.total ? Math.round((item.cerrados / item.total) * 100) : 0;
                      const nivel = nivelRiesgoRanking(item);
                      return `
                      <div class="pdf-ranking-row pdf-risk-${nivel}">
                        <span>${index + 1}</span>
                        <strong>${escaparHtmlInforme(item.nombre)}</strong>
                        <div class="pdf-ranking-track">
                          <i class="pdf-ranking-volume" style="width:${Math.max(7, Math.round((item.total / maximo) * 100))}%">
                            <em class="pdf-ranking-closed" style="width:${cerradosPct}%"></em>
                          </i>
                        </div>
                        <b>${item.total}</b><small>${escaparHtmlInforme(etiquetaRiesgoRanking(item))}</small>
                      </div>
                    `;
                    }
                  )
                  .join("")
              : `<p class="pdf-muted">Sin datos suficientes para este ranking.</p>`
          }
        </div>
        <p class="pdf-insight pdf-insight-${lider ? nivelRiesgoRanking(lider) : "atencion"}"><strong>Lectura gerencial:</strong> ${
          lider
            ? `${escaparHtmlInforme(lider.nombre)} concentra ${lider.total} hallazgos: ${lider.criticos} críticos, ${lider.vencidos} vencidos, ${lider.cerrados} cerrados y una tasa de cierre de ${lider.tasaCierre}%. ${lider.tasaCierre === 0 && lider.total > 0 ? "No registra cierres y requiere escalamiento inmediato." : "Su condición debe revisarse junto con evidencia y plazos de cierre."}`
            : "No existen datos suficientes para emitir una comparación."
        }</p>
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
              <th>Alerta</th>
            </tr>
          </thead>
          <tbody>
            ${
              ranking.data.length > 0
                ? ranking.data
                    .slice(0, 8)
                    .map(
                      (item, index) => `
                        <tr class="pdf-risk-${nivelRiesgoRanking(item)}">
                          <td>${index + 1}</td>
                          <td>${escaparHtmlInforme(item.nombre)}</td>
                          <td>${item.total}</td>
                          <td>${item.criticos}</td>
                          <td>${item.vencidos}</td>
                          <td>${item.cerrados}</td>
                          <td class="pdf-rate">${item.tasaCierre}%</td>
                          <td><strong>${escaparHtmlInforme(etiquetaRiesgoRanking(item))}</strong></td>
                        </tr>
                      `
                    )
                    .join("")
                : `<tr><td colspan="8">Sin datos suficientes para este ranking.</td></tr>`
            }
          </tbody>
        </table>
      </section>
    `;
    };
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
            width: 96px;
            max-width: 110px;
            height: 46px;
            object-fit: contain;
            object-position: left center;
            border: 0;
            border-radius: 0;
            background: transparent;
            padding: 0;
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
            margin-bottom: 4mm;
            padding-bottom: 10px;
          }
          .pdf-safe-bottom {
            height: 3mm;
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
          .pdf-severity-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 8px;
          }
          .pdf-severity-card {
            border: 1px solid #e2e8f0;
            border-top: 4px solid #64748b;
            border-radius: 10px;
            padding: 9px;
            background: #f8fafc;
          }
          .pdf-severity-card.critico { border-top-color: #b91c1c; background: #fff1f2; }
          .pdf-severity-card.alto { border-top-color: #ea580c; background: #fff7ed; }
          .pdf-severity-card.medio { border-top-color: #ca8a04; background: #fefce8; }
          .pdf-severity-card.bajo { border-top-color: #16a34a; background: #f0fdf4; }
          .pdf-severity-card span { display: block; color: #64748b; font-size: 8px; font-weight: 900; text-transform: uppercase; }
          .pdf-severity-card strong { display: block; margin: 3px 0 1px; color: #0f172a; font-size: 17px; }
          .pdf-severity-card small { color: #475569; font-size: 8.5px; }
          .pdf-action-table th:nth-child(1) { width: 10%; }
          .pdf-action-table th:nth-child(2) { width: 34%; }
          .pdf-action-table th:nth-child(3) { width: 21%; }
          .pdf-action-table th:nth-child(4) { width: 12%; }
          .pdf-action-table th:nth-child(5) { width: 23%; }
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
          .pdf-trend-chart {
            height: 150px;
            display: flex;
            align-items: stretch;
            gap: 8px;
            margin: 10px 0 8px;
            padding: 12px 10px 6px;
            border: 1px solid #dbeafe;
            border-radius: 10px;
            background: #f8fbff;
          }
          .pdf-trend-groups {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 9px;
          }
          .pdf-trend-group h4 {
            margin: 8px 0 0;
            color: #0f172a;
            font-size: 10px;
          }
          .pdf-trend-period {
            flex: 1 1 0;
            min-width: 0;
            display: grid;
            grid-template-rows: minmax(0, 1fr) auto;
            gap: 5px;
            text-align: center;
          }
          .pdf-trend-period > strong { color: #475569; font-size: 8.5px; }
          .pdf-trend-bars {
            min-height: 0;
            display: flex;
            align-items: end;
            justify-content: center;
            gap: 3px;
            border-bottom: 1px solid #cbd5e1;
          }
          .pdf-trend-bar-wrap {
            width: 17%;
            min-width: 7px;
            max-width: 16px;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: end;
            align-items: center;
          }
          .pdf-trend-bar-wrap span {
            color: #475569;
            font-size: 7.5px;
            font-weight: 900;
            margin-bottom: 2px;
          }
          .pdf-trend-bar { width: 100%; min-height: 3px; border-radius: 4px 4px 1px 1px; }
          .pdf-legend { display: flex; flex-wrap: wrap; gap: 8px 12px; margin: 7px 0; }
          .pdf-legend span {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            color: #475569;
            font-size: 9px;
            font-weight: 800;
          }
          .pdf-legend i { width: 8px; height: 8px; border-radius: 2px; }
          .pdf-insight {
            margin: 9px 0 0;
            padding: 8px 10px;
            border: 1px solid #bfdbfe;
            border-left: 3px solid #2563eb;
            border-radius: 8px;
            background: #eff6ff;
            color: #334155;
            font-size: 10px;
            line-height: 1.4;
          }
          .pdf-insight-critico { border-color: #fecaca; border-left-color: #b91c1c; background: #fef2f2; color: #7f1d1d; }
          .pdf-insight-alto { border-color: #fed7aa; border-left-color: #ea580c; background: #fff7ed; color: #9a3412; }
          .pdf-insight-atencion { border-color: #fde68a; border-left-color: #ca8a04; background: #fefce8; color: #854d0e; }
          .pdf-alert-banner {
            margin: 12px 0;
            padding: 13px 15px;
            border-radius: 12px;
            border: 1px solid #fecaca;
            border-left: 6px solid #b91c1c;
            background: linear-gradient(135deg, #fff1f2, #fef2f2);
            color: #7f1d1d;
            page-break-inside: avoid;
            break-inside: avoid-page;
          }
          .pdf-alert-banner.alto { border-color: #fed7aa; border-left-color: #ea580c; background: #fff7ed; color: #9a3412; }
          .pdf-alert-banner.atencion { border-color: #fde68a; border-left-color: #ca8a04; background: #fefce8; color: #854d0e; }
          .pdf-alert-banner.controlado { border-color: #bbf7d0; border-left-color: #16a34a; background: #f0fdf4; color: #166534; }
          .pdf-alert-label { font-size: 10px; font-weight: 950; letter-spacing: 0.9px; text-transform: uppercase; }
          .pdf-alert-banner strong { display: block; margin: 4px 0; font-size: 16px; }
          .pdf-alert-banner p { margin: 0; font-size: 11px; line-height: 1.45; }
          .pdf-kpi.critico { border-color: #fecaca; background: #fff1f2; }
          .pdf-kpi.critico span, .pdf-kpi.critico strong { color: #b91c1c; }
          .pdf-kpi.alto { border-color: #fed7aa; background: #fff7ed; }
          .pdf-kpi.alto span, .pdf-kpi.alto strong { color: #c2410c; }
          .pdf-kpi.atencion { border-color: #fde68a; background: #fefce8; }
          .pdf-kpi.atencion span, .pdf-kpi.atencion strong { color: #a16207; }
          .pdf-kpi.controlado { border-color: #bbf7d0; background: #f0fdf4; }
          .pdf-kpi.controlado span, .pdf-kpi.controlado strong { color: #15803d; }
          .pdf-ranking-bars { display: grid; gap: 6px; margin: 9px 0; }
          .pdf-ranking-row {
            display: grid;
            grid-template-columns: 20px minmax(120px, 1fr) minmax(150px, 2fr) 28px 50px;
            gap: 7px;
            align-items: center;
            color: #334155;
            font-size: 9.5px;
          }
          .pdf-ranking-row > span { color: #2563eb; font-weight: 900; }
          .pdf-ranking-row > strong { overflow: visible; white-space: normal; line-height: 1.15; }
          .pdf-ranking-track {
            height: 9px;
            overflow: hidden;
            border-radius: 999px;
            background: #e2e8f0;
          }
          .pdf-ranking-volume {
            display: block;
            height: 100%;
            border-radius: inherit;
            background: #f59e0b;
            position: relative;
            overflow: hidden;
          }
          .pdf-ranking-closed { display: block; height: 100%; background: #16a34a; border-radius: inherit 0 0 inherit; }
          .pdf-risk-critico .pdf-ranking-volume { background: #b91c1c; }
          .pdf-risk-alto .pdf-ranking-volume { background: #ea580c; }
          .pdf-risk-atencion .pdf-ranking-volume { background: #ca8a04; }
          .pdf-risk-controlado .pdf-ranking-volume { background: #16a34a; }
          .pdf-ranking-row b { text-align: right; }
          .pdf-ranking-row small { text-align: right; font-size: 8px; font-weight: 900; }
          .pdf-risk-critico small, tr.pdf-risk-critico .pdf-rate, tr.pdf-risk-critico td:last-child { color: #b91c1c; }
          .pdf-risk-alto small, tr.pdf-risk-alto .pdf-rate, tr.pdf-risk-alto td:last-child { color: #c2410c; }
          .pdf-risk-atencion small, tr.pdf-risk-atencion .pdf-rate, tr.pdf-risk-atencion td:last-child { color: #a16207; }
          .pdf-risk-controlado small, tr.pdf-risk-controlado .pdf-rate, tr.pdf-risk-controlado td:last-child { color: #15803d; }
          tr.pdf-risk-critico { background: #fff1f2; }
          tr.pdf-risk-alto { background: #fff7ed; }
          tr.pdf-risk-atencion { background: #fefce8; }
          tr.pdf-risk-controlado { background: #f0fdf4; }
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
          <p class="pdf-muted">${escaparHtmlInforme(etiquetaCategoriaInforme)} · ${escaparHtmlInforme(plantillaInformeActiva.titulo)} · ${escaparHtmlInforme(etiquetaNivelDetalleInforme(nivelDetalleInformeGerencial))} · ${escaparHtmlInforme(etiquetaAlcanceInforme)} · ${escaparHtmlInforme(periodoInformeEtiqueta)}</p>
          <div class="pdf-note pdf-legal-base">
            Informe generado como herramienta de apoyo a la gestión preventiva, trazabilidad documental, evidencia de hallazgos, seguimiento de cierre y análisis ejecutivo, alineado al marco preventivo chileno vigente: Ley 16.744, DS 44 y DS 594.
          </div>
          <div class="pdf-meta">
            <div><span>Fecha de generación</span><strong>${escaparHtmlInforme(fechaDocumento)}</strong></div>
            <div><span>Hallazgos incluidos</span><strong>${analisisInformeGerencial.total}</strong></div>
            <div><span>Nivel de alerta</span><strong>${escaparHtmlInforme(etiquetaNivelAlertaInforme)}</strong></div>
            <div><span>Tasa de cierre</span><strong>${analisisInformeGerencial.tasaCierre}%</strong></div>
          </div>
          <section class="pdf-generated-by pdf-avoid">
            <div class="pdf-avatar">${avatarGenerador}</div>
            <div>
              <div class="pdf-generated-title">Informe generado por</div>
              <div class="pdf-generated-name">${escaparHtmlInforme(usuarioGeneradorInforme.nombre)}</div>
              <div class="pdf-generated-detail">${escaparHtmlInforme(usuarioGeneradorInforme.cargo)}</div>
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

        ${!hayElementosInformeGerencial ? `
          <section class="pdf-section pdf-avoid">
            <h2>Informe sin contenido seleccionado</h2>
            <p class="pdf-muted">Seleccione al menos una sección o visualización antes de generar el documento.</p>
          </section>
        ` : `
        <section class="pdf-alert-banner ${nivelAlertaInforme === "critico" ? "" : nivelAlertaInforme}">
          <span class="pdf-alert-label">${escaparHtmlInforme(etiquetaNivelAlertaInforme)}</span>
          <strong>Estado general de la gestión preventiva</strong>
          <p>${escaparHtmlInforme(alertaEjecutivaInforme)}</p>
        </section>

        <section class="pdf-section pdf-avoid">
          <h2>Resumen ejecutivo</h2>
          <p>${escaparHtmlInforme(resumenInformeGerencial)}</p>
          <div class="pdf-kpis">
            ${renderDato("Total", analisisInformeGerencial.total)}
            ${renderDato("Abiertos", metricasInformeGerencial.abiertos, metricasInformeGerencial.abiertos > 0 ? "alto" : "controlado")}
            ${renderDato("Críticos abiertos", metricasInformeGerencial.criticosAbiertos, metricasInformeGerencial.criticosAbiertos > 0 ? "critico" : "controlado")}
            ${renderDato("Vencidos abiertos", metricasInformeGerencial.vencidosAbiertos, metricasInformeGerencial.vencidosAbiertos > 0 ? "critico" : "controlado")}
            ${renderDato("Sin fecha", metricasInformeGerencial.sinFechaCompromiso, metricasInformeGerencial.sinFechaCompromiso > 0 ? "alto" : "controlado")}
            ${renderDato("Tasa de cierre", `${analisisInformeGerencial.tasaCierre}%`, analisisInformeGerencial.tasaCierre < 50 ? "critico" : analisisInformeGerencial.tasaCierre < 80 ? "atencion" : "controlado")}
            ${renderDato("Cierres validados", metricasInformeGerencial.cerradosValidados, "controlado")}
            ${renderDato("Cierres sin respaldo", metricasInformeGerencial.cerradosSinRespaldo, metricasInformeGerencial.cerradosSinRespaldo > 0 ? "critico" : "controlado")}
          </div>
        </section>

        <section class="pdf-section pdf-avoid">
          <h2>Distribución por criticidad</h2>
          <p class="pdf-muted">Composición del universo analizado y backlog abierto por nivel de riesgo.</p>
          <div class="pdf-severity-grid">
            ${([
              ["Críticos", "CRITICO", "critico"],
              ["Altos", "ALTO", "alto"],
              ["Medios", "MEDIO", "medio"],
              ["Bajos", "BAJO", "bajo"],
            ] as Array<[string, CriticidadKpiGerencial, string]>).map(([etiqueta, criticidad, clase]) => `
              <div class="pdf-severity-card ${clase}">
                <span>${etiqueta}</span>
                <strong>${analisisInformeGerencial.porCriticidad[criticidad]}</strong>
                <small>${metricasInformeGerencial.abiertosPorCriticidad[criticidad]} abiertos</small>
              </div>
            `).join("")}
          </div>
        </section>

        <section class="pdf-section pdf-avoid">
          <h2>Alcance y criterios aplicados</h2>
          <ul class="pdf-chip-list">${renderLista(filtrosPdf)}</ul>
          <p class="pdf-muted" style="margin-top:8px">${escaparHtmlInforme(periodoInformeEtiqueta)}. ${informeConBacklogVisible ? "La lectura mantiene visible el backlog no cerrado de períodos anteriores." : "Se analiza el universo completo visible para el perfil actual."}</p>
        </section>

        <section class="pdf-section pdf-table-section">
          <h2>Plan ejecutivo de acción</h2>
          <p class="pdf-muted">Prioridades convertidas en responsables, plazos y evidencia verificable.</p>
          <table class="pdf-action-table">
            <thead><tr><th>Prioridad</th><th>Acción</th><th>Responsable propuesto</th><th>Plazo</th><th>Evidencia esperada</th></tr></thead>
            <tbody>
              ${planAccionEjecutivoInforme.map((accion) => `
                <tr class="pdf-risk-${accion.prioridad === "Inmediata" ? "critico" : accion.prioridad === "Alta" ? "alto" : "atencion"}">
                  <td><strong>${escaparHtmlInforme(accion.prioridad)}</strong></td>
                  <td>${escaparHtmlInforme(accion.accion)}</td>
                  <td>${escaparHtmlInforme(accion.responsable)}</td>
                  <td>${escaparHtmlInforme(accion.plazo)}</td>
                  <td>${escaparHtmlInforme(accion.evidencia)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </section>

        ${graficosInformeSeleccionados.includes("tendencia") ? `
          <section class="pdf-section pdf-chart-section">
            <h2>Tendencia de actividad y presión de riesgo</h2>
            ${renderTendenciaVisual()}
          </section>
        ` : ""}

        ${rankingsPdfInformeGerencial.map(renderTablaRanking).join("")}

        <section class="pdf-section pdf-table-section">
          <h2>Hallazgos que requieren intervención</h2>
          <p class="pdf-muted">Top ${Math.min(8, hallazgosPrioritariosInforme.length)} priorizado automáticamente por criticidad, vencimiento, ausencia de plazo y falta de responsable.</p>
          <table>
            <thead>
              <tr><th>Código</th><th>Criticidad</th><th>Empresa / obra</th><th>Responsable</th><th>Plazo</th><th>Motivo de prioridad</th></tr>
            </thead>
            <tbody>
              ${hallazgosPrioritariosInforme.length > 0
                ? hallazgosPrioritariosInforme.slice(0, 8).map((hallazgo) => `
                    <tr class="pdf-risk-${hallazgo.criticidad === "Crítico" || hallazgo.motivo.includes("Vencido") ? "critico" : "alto"}">
                      <td><strong>${escaparHtmlInforme(hallazgo.codigo)}</strong></td>
                      <td>${escaparHtmlInforme(hallazgo.criticidad)}</td>
                      <td>${escaparHtmlInforme(`${hallazgo.empresa} / ${hallazgo.obra}`)}</td>
                      <td>${escaparHtmlInforme(hallazgo.responsable)}</td>
                      <td>${escaparHtmlInforme(hallazgo.plazo)}</td>
                      <td>${escaparHtmlInforme(hallazgo.motivo)}</td>
                    </tr>
                  `).join("")
                : `<tr><td colspan="6">No se identifican hallazgos prioritarios en el alcance seleccionado.</td></tr>`}
            </tbody>
          </table>
        </section>

        ${graficosPdfInformeGerencial.filter((grafico) => grafico.titulo !== "Tendencia temporal").length > 0 ? `
          <section class="pdf-section pdf-section-flow">
            <h2>Lecturas gerenciales complementarias</h2>
            <div class="pdf-grid">
              ${graficosPdfInformeGerencial
                .filter((grafico) => grafico.titulo !== "Tendencia temporal")
                .map((grafico) => `
                  <div class="pdf-card pdf-chart-card pdf-avoid">
                    <h3>${escaparHtmlInforme(grafico.titulo)}</h3>
                    <ul class="pdf-list">${renderLista(grafico.valores.length ? grafico.valores : ["Sin datos suficientes para este alcance."])}</ul>
                    ${grafico.analisis ? `<p><strong>Decisión:</strong> ${escaparHtmlInforme(grafico.analisis.accion)}</p>` : ""}
                  </div>
                `).join("")}
            </div>
          </section>
        ` : ""}

        ${(seccionesInformeSeleccionadas.includes("calidad-dato") || graficosInformeSeleccionados.includes("calidad-dato")) ? `
          <section class="pdf-section pdf-avoid">
            <h2>Calidad y confiabilidad del dato</h2>
            <div class="pdf-kpis">
              ${renderDato("GPS registrado", `${metricasInformeGerencial.conGps} / ${analisisInformeGerencial.total || 0}`, metricasInformeGerencial.conGps < analisisInformeGerencial.total ? "atencion" : "controlado")}
              ${renderDato("Evidencia del reporte", `${metricasInformeGerencial.conEvidencia} / ${analisisInformeGerencial.total || 0}`, metricasInformeGerencial.conEvidencia < analisisInformeGerencial.total ? "atencion" : "controlado")}
              ${renderDato("Responsable en abiertos", `${metricasInformeGerencial.abiertosConResponsable} / ${metricasInformeGerencial.abiertos}`, metricasInformeGerencial.abiertosConResponsable < metricasInformeGerencial.abiertos ? "critico" : "controlado")}
              ${renderDato("Fecha en abiertos", `${metricasInformeGerencial.abiertosConFechaCompromiso} / ${metricasInformeGerencial.abiertos}`, metricasInformeGerencial.abiertosConFechaCompromiso < metricasInformeGerencial.abiertos ? "critico" : "controlado")}
            </div>
            <p class="pdf-insight pdf-insight-atencion"><strong>Criterio de cálculo:</strong> GPS y evidencia se calculan sobre el total de hallazgos. Responsable y fecha de compromiso se calculan exclusivamente sobre los hallazgos abiertos, que son el universo gestionable. “Responsable nominal” y “empresa responsable” son campos distintos.</p>
          </section>
        ` : ""}

        ${
          detallePdfActivo
            ? `
              <section class="pdf-section pdf-table-section">
                <h2>Detalle resumido</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Empresa responsable</th>
                      <th>Empresa reportante</th>
                      <th>Obra / área</th>
                      <th>Criticidad</th>
                      <th>Estado</th>
                      <th>Plazo</th>
                      <th>Respaldo cierre</th>
                      <th>Responsable cierre</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${
                      detallePdf.length > 0
                        ? detallePdf
                            .map((hallazgo) => {
                              const cierreSinRespaldo =
                                hallazgo.estado === "CERRADO" &&
                                !hallazgo.evidenciaCierreRecibida &&
                                !hallazgo.cierreSinEvidenciaJustificado;
                              const nivelFila =
                                cierreSinRespaldo ||
                                esHallazgoVencidoDetalle(hallazgo) ||
                                (esHallazgoAbiertoGerencial(hallazgo) && hallazgo.criticidad === "CRITICO")
                                  ? "critico"
                                  : esHallazgoAbiertoGerencial(hallazgo) && !hallazgo.fechaCompromiso
                                    ? "alto"
                                    : hallazgo.estado === "CERRADO"
                                      ? "controlado"
                                      : "atencion";
                              const respaldoCierre =
                                hallazgo.evidenciaCierreRecibida
                                  ? "Evidencia recibida"
                                  : hallazgo.cierreSinEvidenciaJustificado
                                    ? "Justificación formal"
                                    : hallazgo.estado === "CERRADO"
                                      ? "Sin respaldo"
                                      : "Pendiente";
                              return `
                                <tr class="pdf-risk-${nivelFila}">
                                  <td>${escaparHtmlInforme(hallazgo.codigo)}</td>
                                  <td>${escaparHtmlInforme(hallazgo.empresaResponsable || "Sin empresa responsable")}</td>
                                  <td>${escaparHtmlInforme(hallazgo.empresaReportante || hallazgo.empresa)}</td>
                                  <td>${escaparHtmlInforme(`${hallazgo.obra} / ${hallazgo.area}`)}</td>
                                  <td>${escaparHtmlInforme(etiquetaCriticidad(hallazgo.criticidad))}</td>
                                  <td>${escaparHtmlInforme(hallazgo.estado.replace("_", " "))}</td>
                                  <td>${escaparHtmlInforme(`${fechaCortaDetalle(hallazgo.fechaCompromiso)} · ${estadoPlazoPdf(hallazgo)}`)}</td>
                                  <td>${escaparHtmlInforme(respaldoCierre)}</td>
                                  <td>${escaparHtmlInforme(hallazgo.responsableCierre || "Sin responsable")}</td>
                                </tr>
                              `;
                            })
                            .join("")
                        : `<tr><td colspan="9">Sin hallazgos para el alcance seleccionado.</td></tr>`
                    }
                  </tbody>
                </table>
              </section>
            `
            : ""
        }

        ${
          seccionesInformeSeleccionadas.includes("advertencias") ||
          seccionesInformeSeleccionadas.includes("nota-normativa")
            ? `<section class="pdf-section pdf-text-section pdf-final-text-section">
          <h2>Alcance, advertencias y marco preventivo</h2>
          ${seccionesInformeSeleccionadas.includes("advertencias") ? `<ul class="pdf-list">${renderLista(advertenciasInformeGerencial)}</ul>` : ""}
          ${seccionesInformeSeleccionadas.includes("nota-normativa") ? `<p class="pdf-note pdf-legal-base" style="margin-top:10px">${escaparHtmlInforme(notaNormativaInformeGerencial)}</p>` : ""}
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

    if (esVistaPrevia) {
      setVistaPreviaInformeHtml(`
        <!doctype html>
        <html lang="es">
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>${escaparHtmlInforme(tituloAutomaticoInformeGerencial)} · Vista previa</title>
            <style>
              * { box-sizing: border-box; }
              html { background: #e2e8f0; }
              body { margin: 0; padding: 24px; display: grid; justify-content: center; color: #172033; }
              .pdf-doc { box-shadow: 0 18px 48px rgba(15,23,42,0.20); }
              @media (max-width: 820px) {
                body { padding: 10px; }
                .pdf-doc { width: 100%; }
              }
              @media print {
                html, body { background: #ffffff; padding: 0; }
                .pdf-doc { box-shadow: none; }
              }
            </style>
          </head>
          <body>
            ${htmlInforme}
          </body>
        </html>
      `);
      setMensaje("Vista previa abierta dentro de la plataforma. Revise el informe y luego use Descargar PDF si esta conforme.");
      return;
    }

    try {
      const { generarInformeEjecutivoPdf } = await import("./informeEjecutivoPdf");
      const nivelCalidad = (completos: number, universo: number) => {
        if (universo === 0 || completos >= universo) return "controlado" as const;
        const cobertura = completos / universo;
        return cobertura < 0.6 ? "critico" as const : cobertura < 0.85 ? "alto" as const : "atencion" as const;
      };
      await generarInformeEjecutivoPdf({
        filename: nombreArchivo,
        titulo: tituloAutomaticoInformeGerencial,
        subtitulo: `${plantillaInformeActiva.titulo} · ${etiquetaNivelDetalleInforme(nivelDetalleInformeGerencial)}`,
        periodo: periodoInformeEtiqueta,
        alcance: etiquetaAlcanceInforme,
        fechaGeneracion: fechaDocumento,
        marca: {
          nombre: clientBranding.nombrePrincipal,
          poweredBy: clientBranding.poweredByText,
          logoUrl: clientBranding.logoPrincipalUrl,
        },
        fontUrl: "/fonts/CeSans-Regular.ttf",
        fontBoldUrl: "/fonts/CeSans-Bold.ttf",
        autor: {
          nombre: usuarioGeneradorInforme.nombre,
          cargo: usuarioGeneradorInforme.cargo,
          empresa: usuarioGeneradorInforme.empresa,
          correo: usuarioGeneradorInforme.correo,
        },
        alerta: {
          etiqueta: etiquetaNivelAlertaInforme,
          nivel: nivelAlertaInforme,
          mensaje: alertaEjecutivaInforme,
        },
        resumen: resumenInformeGerencial,
        metricas: [
          { etiqueta: "Total", valor: analisisInformeGerencial.total },
          { etiqueta: "Abiertos", valor: metricasInformeGerencial.abiertos, nivel: metricasInformeGerencial.abiertos > 0 ? "alto" : "controlado" },
          { etiqueta: "Criticos abiertos", valor: metricasInformeGerencial.criticosAbiertos, nivel: metricasInformeGerencial.criticosAbiertos > 0 ? "critico" : "controlado" },
          { etiqueta: "Vencidos abiertos", valor: metricasInformeGerencial.vencidosAbiertos, nivel: metricasInformeGerencial.vencidosAbiertos > 0 ? "critico" : "controlado" },
          { etiqueta: "Sin fecha", valor: metricasInformeGerencial.sinFechaCompromiso, nivel: metricasInformeGerencial.sinFechaCompromiso > 0 ? "alto" : "controlado" },
          { etiqueta: "Tasa de cierre", valor: `${analisisInformeGerencial.tasaCierre}%`, nivel: analisisInformeGerencial.tasaCierre < 50 ? "critico" : analisisInformeGerencial.tasaCierre < 80 ? "atencion" : "controlado" },
          { etiqueta: "Cierres validados", valor: metricasInformeGerencial.cerradosValidados, nivel: "controlado" },
          { etiqueta: "Cierres sin respaldo", valor: metricasInformeGerencial.cerradosSinRespaldo, nivel: metricasInformeGerencial.cerradosSinRespaldo > 0 ? "critico" : "controlado" },
        ],
        criticidad: [
          { etiqueta: "Críticos", total: analisisInformeGerencial.porCriticidad.CRITICO, nivel: "critico" },
          { etiqueta: "Altos", total: analisisInformeGerencial.porCriticidad.ALTO, nivel: "alto" },
          { etiqueta: "Medios", total: analisisInformeGerencial.porCriticidad.MEDIO, nivel: "atencion" },
          { etiqueta: "Bajos", total: analisisInformeGerencial.porCriticidad.BAJO, nivel: "controlado" },
        ],
        planAccion: planAccionEjecutivoInforme,
        tendencia: tendenciaVisualInforme.map((item) => ({
          periodo: item.periodo,
          total: item.total,
          cerrados: item.cerrados,
          criticosAbiertos: item.criticosAbiertos,
          vencidosAbiertos: item.vencidosAbiertos,
        })),
        lecturaTendencia: lecturaTendenciaInforme,
        rankings: rankingsPdfInformeGerencial,
        hallazgosPrioritarios: hallazgosPrioritariosInforme,
        calidadDato: [
          { etiqueta: "GPS registrado", completos: metricasInformeGerencial.conGps, universo: analisisInformeGerencial.total, nivel: nivelCalidad(metricasInformeGerencial.conGps, analisisInformeGerencial.total) },
          { etiqueta: "Evidencia del reporte", completos: metricasInformeGerencial.conEvidencia, universo: analisisInformeGerencial.total, nivel: nivelCalidad(metricasInformeGerencial.conEvidencia, analisisInformeGerencial.total) },
          { etiqueta: "Responsable en hallazgos abiertos", completos: metricasInformeGerencial.abiertosConResponsable, universo: metricasInformeGerencial.abiertos, nivel: nivelCalidad(metricasInformeGerencial.abiertosConResponsable, metricasInformeGerencial.abiertos) },
          { etiqueta: "Fecha de compromiso en abiertos", completos: metricasInformeGerencial.abiertosConFechaCompromiso, universo: metricasInformeGerencial.abiertos, nivel: nivelCalidad(metricasInformeGerencial.abiertosConFechaCompromiso, metricasInformeGerencial.abiertos) },
          { etiqueta: "Empresa responsable identificada", completos: metricasInformeGerencial.conEmpresaResponsable, universo: analisisInformeGerencial.total, nivel: nivelCalidad(metricasInformeGerencial.conEmpresaResponsable, analisisInformeGerencial.total) },
        ],
        lecturasComplementarias: graficosPdfInformeGerencial
          .filter((grafico) => grafico.titulo !== "Tendencia temporal")
          .map((grafico) => ({
            titulo: grafico.titulo,
            valores: grafico.valores,
            decision: grafico.analisis?.accion,
          })),
        advertencias: advertenciasInformeGerencial,
        notaNormativa: notaNormativaInformeGerencial,
      });
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
    }
  }

  return (
    <main className="ce-panel-page ce-panel-kpi-page ce-premium-shell-host" style={pageThemeStyle}>
      <PremiumWorkspaceShell
        active="kpi"
        eyebrow={t("Inteligencia preventiva")}
        title={t("KPI gerencial")}
        subtitle={t("Lectura ejecutiva simple: riesgo, cumplimiento, responsables y tendencia en una sola vista.")}
        theme={temaClaro ? "light" : "dark"}
        language={idiomaActivo}
        profileName={usuarioGeneradorInforme.nombre || "Usuario autorizado"}
        profileRole={usuarioGeneradorInforme.cargo || "Gerencia preventiva"}
        profileImageUrl={usuarioGeneradorInforme.foto || null}
        metrics={[
          { label: t("Total reportado"), value: analisis.total, tone: "blue" },
          { label: t("Críticos abiertos"), value: metricasGerenciales.criticosAbiertos, tone: "red" },
          { label: t("Vencidos abiertos"), value: metricasGerenciales.vencidosAbiertos, tone: "amber" },
          { label: t("Tasa cierre"), value: `${analisis.tasaCierre}%`, tone: tonoTasaCierre(analisis.tasaCierre) },
          { label: t("Sin fecha compromiso"), value: metricasGerenciales.sinFechaCompromiso, tone: "violet" },
        ]}
        actions={(
          <>
            <button type="button" onClick={cargarDatos} style={{ padding: "9px 11px", borderRadius: "12px", border: "1px solid rgba(96,165,250,0.30)", color: "#fff", background: "linear-gradient(135deg,#2563eb,#06b6d4)", cursor: "pointer", fontSize: "11px", fontWeight: 950 }}>
              {t("Actualizar analisis")}
            </button>
            <Link href="/panel" prefetch style={{ padding: "9px 11px", borderRadius: "12px", color: textoPrincipal, background: fondoInterno, border: bordeInterno, textDecoration: "none", fontSize: "11px", fontWeight: 950 }}>
              {t("Volver al panel")}
            </Link>
          </>
        )}
      />
      {vistaPreviaInformeHtml ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Vista previa del informe gerencial"
          onClick={() => setVistaPreviaInformeHtml("")}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2147483646,
            display: "grid",
            placeItems: "center",
            padding: "clamp(8px, 2vw, 24px)",
            background: "rgba(2, 6, 23, 0.84)",
            backdropFilter: "blur(8px)",
          }}
        >
          <section
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "min(1180px, 98vw)",
              height: "min(94vh, 980px)",
              overflow: "hidden",
              display: "grid",
              gridTemplateRows: "auto minmax(0, 1fr)",
              borderRadius: "20px",
              border: "1px solid rgba(125,211,252,0.30)",
              background: "#0f172a",
              boxShadow: "0 28px 80px rgba(0,0,0,0.55)",
            }}
          >
            <header
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                padding: "12px 14px",
                color: "#ffffff",
                background: "linear-gradient(135deg,#071a2d,#0d3556)",
                borderBottom: "1px solid rgba(125,211,252,0.22)",
              }}
            >
              <div>
                <div style={{ fontSize: "13px", fontWeight: 950 }}>Vista previa del informe gerencial</div>
                <div style={{ marginTop: "2px", color: "#bae6fd", fontSize: "11px", fontWeight: 750 }}>
                  Revise el contenido antes de descargar el PDF.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setVistaPreviaInformeHtml("")}
                style={{
                  minHeight: "38px",
                  padding: "8px 14px",
                  borderRadius: "11px",
                  border: "1px solid rgba(255,255,255,0.28)",
                  background: "linear-gradient(135deg,#2563eb,#7c3aed)",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                Cerrar vista previa
              </button>
            </header>
            <iframe
              title="Documento de vista previa del informe gerencial"
              srcDoc={vistaPreviaInformeHtml}
              sandbox="allow-same-origin"
              style={{ width: "100%", height: "100%", border: 0, background: "#e2e8f0" }}
            />
          </section>
        </div>
      ) : null}
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
                    ["criticidad", "Enfocar criticidad", "Enfoque visual en criticidad activo."],
                    ["cierres", "Enfocar cierres", "Enfoque visual en gestión de cierre activo."],
                    ["vencidos", "Enfocar vencidos", "Enfoque visual en vencidos activo."],
                    ["reincidencias", "Enfocar reincidencias", "Enfoque visual en patrones reincidentes activo."],
                  ].map(([id, label, texto]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        aplicarAccion(id, texto);
                        if (id === "criticidad") {
                          enfocarDetalleAccionable("criticos-abiertos", "Hallazgos críticos abiertos seleccionados.");
                        } else if (id === "cierres") {
                          enfocarDetalleAccionable("cerrados", "Hallazgos cerrados seleccionados.");
                        } else if (id === "vencidos") {
                          enfocarDetalleAccionable("vencidos-abiertos", "Hallazgos vencidos abiertos seleccionados.");
                        }
                      }}
                      style={botonStyle(id, id === modoAnalisis)}
                    >
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
                      <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
                        <div style={{ fontSize: "11px", color: textoAzul, fontWeight: 900, whiteSpace: "nowrap" }}>{modoAnalisis.replace("-", " ")}</div>
                        <button
                          type="button"
                          onClick={() => prepararInformeGerencialDesdeTablero("ranking", rankingInformeModoActivo, rankingTitulo)}
                          style={{ ...botonStyle(`agregar-${rankingInformeModoActivo}`, rankingsInformeSeleccionados.includes(rankingInformeModoActivo)), minHeight: "32px", padding: "7px 10px", fontSize: "11px" }}
                        >
                          {rankingsInformeSeleccionados.includes(rankingInformeModoActivo) ? "✓ Incluido" : "+ Agregar al informe"}
                        </button>
                      </div>
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
                              <div style={{ width: `${ancho}%`, height: "100%", borderRadius: "999px", background: colorRiesgoRanking(item), boxShadow: item.vencidos > 0 || item.criticos > 0 ? "0 0 20px rgba(239,68,68,0.28)" : "0 0 20px rgba(34,197,94,0.22)" }} />
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
                <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <div style={{ borderRadius: "999px", padding: "7px 10px", background: fondoInterno, border: bordeInterno, color: textoAzul, fontSize: "11px", fontWeight: 950 }}>
                    {analisis.hallazgos.length} registros filtrados
                  </div>
                  <button
                    type="button"
                    onClick={() => prepararInformeGerencialDesdeTablero("grafico", "radar", "Prioridades gerenciales")}
                    style={{ ...botonStyle("agregar-radar-informe", graficosInformeSeleccionados.includes("radar")), minHeight: "34px", padding: "7px 10px", fontSize: "11px" }}
                  >
                    {graficosInformeSeleccionados.includes("radar") ? "✓ Incluido" : "+ Agregar al informe"}
                  </button>
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
                    foco: "criticos-abiertos" as FocoDetalleAccionable,
                    accion: "Foco en empresas con hallazgos críticos abiertos.",
                  },
                  {
                    id: "obras-vencidas",
                    titulo: "Obras con mas vencidos",
                    subtitulo: "Hallazgos vencidos que siguen abiertos.",
                    data: radarGerencial.obrasVencidas,
                    color: "#f97316",
                    foco: "vencidos-abiertos" as FocoDetalleAccionable,
                    accion: "Foco en obras con hallazgos vencidos abiertos.",
                  },
                  {
                    id: "responsables-pendientes",
                    titulo: "Responsables con mas pendientes",
                    subtitulo: "Abiertos y en gestion por responsable cierre.",
                    data: radarGerencial.responsablesPendientes,
                    color: "#38bdf8",
                    foco: "abiertos" as FocoDetalleAccionable,
                    accion: "Foco en responsables con hallazgos pendientes.",
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
                          enfocarDetalleAccionable(modulo.foco, modulo.accion);
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
                      enfocarDetalleAccionable(
                        "sin-fecha-compromiso",
                        "Foco en hallazgos abiertos sin fecha compromiso."
                      );
                    }}
                    style={{ ...botonStyle("radar-sin-fecha"), minHeight: "32px", padding: "7px 10px", fontSize: "11px" }}
                  >
                    Revisar foco
                  </button>
                </div>
              </div>
            </section>

            <section className="ce-panel-kpi-secondary-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.1fr) minmax(360px, 0.9fr)", gap: "16px" }}>
              <div style={{ ...themedSurfaceStyle, padding: "18px", display: "grid", gap: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "start", flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: "11px", color: textoAzul, fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.65px" }}>
                      Evolución ejecutiva
                    </div>
                    <h2 style={{ margin: "4px 0 0", fontSize: "18px", lineHeight: 1.18, fontWeight: 950 }}>
                      Actividad y presión de riesgo
                    </h2>
                    <p style={{ margin: "5px 0 0", color: textoSuave, fontSize: "12px", lineHeight: 1.4, fontWeight: 750 }}>
                      Dos escalas independientes para distinguir volumen de gestión y exposición preventiva.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => prepararInformeGerencialDesdeTablero("grafico", "tendencia", "Evolución ejecutiva")}
                    style={{ ...botonStyle("agregar-tendencia-informe", graficosInformeSeleccionados.includes("tendencia")), minHeight: "34px", padding: "7px 11px", fontSize: "11px" }}
                  >
                    {graficosInformeSeleccionados.includes("tendencia") ? "✓ Incluido en informe" : "+ Agregar al informe"}
                  </button>
                </div>

                {tendenciaSeriesVisible.length > 0 ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px" }}>
                    {[
                      {
                        titulo: "Actividad operativa",
                        subtitulo: "Reportados versus cerrados",
                        maximo: maxTendenciaActividad,
                        series: [
                          { key: "total", label: "Reportados", color: "#38bdf8" },
                          { key: "cerrados", label: "Cerrados", color: "#22c55e" },
                        ],
                      },
                      {
                        titulo: "Presión de riesgo",
                        subtitulo: "Críticos y vencidos abiertos",
                        maximo: maxTendenciaRiesgo,
                        series: [
                          { key: "criticosAbiertos", label: "Críticos", color: "#ef4444" },
                          { key: "vencidosAbiertos", label: "Vencidos", color: "#f97316" },
                        ],
                      },
                    ].map((grafico) => (
                      <div key={grafico.titulo} style={{ minWidth: 0, borderRadius: "18px", padding: "12px", background: fondoInterno, border: bordeInterno, display: "grid", gap: "10px" }}>
                        <div>
                          <div style={{ color: textoPrincipal, fontSize: "12px", fontWeight: 950 }}>{grafico.titulo}</div>
                          <div style={{ marginTop: "3px", color: textoSuave, fontSize: "10px", fontWeight: 800 }}>{grafico.subtitulo}</div>
                        </div>
                        <div style={{ height: "132px", display: "flex", alignItems: "end", gap: "7px", padding: "8px 4px 0", borderBottom: bordeInterno }}>
                          {tendenciaSeriesVisible.map((item) => (
                            <div key={`${grafico.titulo}-${item.periodo}`} style={{ minWidth: 0, flex: "1 1 0", height: "100%", display: "grid", gridTemplateRows: "minmax(0, 1fr) auto", gap: "5px" }}>
                              <div style={{ minHeight: 0, display: "flex", alignItems: "end", justifyContent: "center", gap: "3px" }}>
                                {grafico.series.map((serie) => {
                                  const valor = Number(item[serie.key as keyof typeof item] || 0);
                                  const altura = valor === 0 ? 3 : Math.max(10, (valor / grafico.maximo) * 100);
                                  return (
                                    <div key={`${item.periodo}-${serie.key}`} title={`${serie.label}: ${valor}`} style={{ width: "min(18px, 42%)", height: `${altura}%`, minHeight: "3px", borderRadius: "6px 6px 2px 2px", background: `linear-gradient(180deg, ${serie.color}, ${serie.color}99)`, boxShadow: `0 0 12px ${serie.color}30`, position: "relative" }}>
                                      <span style={{ position: "absolute", top: "-16px", left: "50%", transform: "translateX(-50%)", color: serie.color, fontSize: "9px", fontWeight: 950 }}>{valor}</span>
                                    </div>
                                  );
                                })}
                              </div>
                              <div style={{ color: textoSuave, fontSize: "9px", fontWeight: 850, textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {item.periodo.slice(5)}/{item.periodo.slice(2, 4)}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                          {grafico.series.map((serie) => (
                            <span key={`${grafico.titulo}-${serie.key}-leyenda`} style={{ display: "inline-flex", alignItems: "center", gap: "5px", color: textoSuave, fontSize: "10px", fontWeight: 850 }}>
                              <span style={{ width: "8px", height: "8px", borderRadius: "3px", background: serie.color }} />
                              {serie.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ minHeight: "150px", display: "grid", placeItems: "center", color: textoSuave, fontSize: "12px", fontWeight: 850 }}>
                    Sin datos temporales con los filtros actuales.
                  </div>
                )}

                <div style={{ borderRadius: "15px", padding: "11px 12px", background: temaClaro ? "rgba(239,246,255,0.72)" : "rgba(8,47,73,0.34)", border: temaClaro ? "1px solid rgba(37,99,235,0.18)" : "1px solid rgba(125,211,252,0.18)", display: "grid", gridTemplateColumns: "auto minmax(0, 1fr)", gap: "9px", alignItems: "start" }}>
                  <span style={{ borderRadius: "999px", padding: "5px 8px", background: temaClaro ? "rgba(37,99,235,0.12)" : "rgba(56,189,248,0.14)", color: textoAzul, fontSize: "9px", fontWeight: 950, textTransform: "uppercase" }}>
                    Lectura automática
                  </span>
                  <p style={{ margin: 0, color: textoMedio, fontSize: "11px", lineHeight: 1.45, fontWeight: 780 }}>{lecturaTendenciaTablero}</p>
                </div>
              </div>

              <div aria-hidden="true" style={{ display: "none" }}>
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
                onClick={enfocarConstructorInforme}
                title="Abre el Constructor Premium con vista previa y descarga PDF."
                style={{ ...botonStyle("abrir-constructor-informe", true), minHeight: "38px" }}
              >
                Crear informe con este análisis
              </button>
              <div style={{ color: textoSuave, fontSize: "11px", lineHeight: 1.4, fontWeight: 750 }}>
                Seleccione informe operativo o gerencial, revise la vista previa y descargue el documento final en PDF.
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
                  ["Tasa cierre", `${analisis.tasaCierre}%`, colorTasaCierre(analisis.tasaCierre)],
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
            <section id="constructor-informes-preventivos" style={{ ...themedSurfaceStyle, padding: "16px", display: "grid", gap: "14px", width: "100%", maxWidth: "none", minWidth: 0, alignSelf: "stretch", justifySelf: "stretch", boxSizing: "border-box", gridColumn: "1 / -1", scrollMarginTop: "88px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "start", flexWrap: "wrap" }}>
                <div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "9px", borderRadius: "999px", padding: "6px 10px", background: temaClaro ? "rgba(37,99,235,0.10)" : "rgba(56,189,248,0.10)", border: temaClaro ? "1px solid rgba(37,99,235,0.22)" : "1px solid rgba(125,211,252,0.22)", color: textoAzul, fontSize: "11px", fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.7px", boxShadow: temaClaro ? "0 8px 18px rgba(37,99,235,0.08)" : "0 0 18px rgba(56,189,248,0.10)" }}>
                    <span style={{ width: "7px", height: "18px", borderRadius: "999px", background: "linear-gradient(180deg, rgba(56,189,248,0.96), rgba(99,102,241,0.72))", boxShadow: "0 0 14px rgba(56,189,248,0.32)" }} />
                    Centro de Inteligencia Preventiva
                  </div>
                  <h2 style={{ margin: "8px 0 0", fontSize: "24px", lineHeight: 1.08, fontWeight: 1000, color: textoPrincipal, textShadow: temaClaro ? "none" : "0 0 20px rgba(56,189,248,0.14)" }}>
                    CONSTRUCTOR PREMIUM DE INFORMES
                  </h2>
                  <p style={{ margin: "5px 0 0", color: textoSuave, fontSize: "12px", lineHeight: 1.4, fontWeight: 750 }}>
                    Elija el propósito del informe, seleccione el alcance y agregue solamente la evidencia estratégica u operativa que necesita comunicar.
                  </p>
                  <PreventiveLegalRibbon
                    theme={temaClaro ? "light" : "dark"}
                    compact
                    text="Informe generado como herramienta de apoyo a la gestión preventiva, trazabilidad documental, evidencia de hallazgos, seguimiento de cierre y análisis ejecutivo, alineado al marco preventivo chileno vigente: Ley 16.744, DS 44 y DS 594."
                    style={{ marginTop: "8px" }}
                  />
                </div>
                <div style={{ borderRadius: "999px", padding: "7px 10px", background: fondoInterno, border: bordeInterno, color: textoAzul, fontSize: "11px", fontWeight: 950 }}>
                  Vista previa → PDF
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px" }}>
                {[
                  {
                    id: "operativo" as CategoriaInformePreventivo,
                    titulo: "Informe de Gestión de Hallazgos",
                    etiqueta: "Operación y seguimiento",
                    detalle: "Responsables, plazos, estados, evidencias y trazabilidad individual de cierre.",
                    color: "#38bdf8",
                    habilitado: true,
                  },
                  {
                    id: "gerencial" as CategoriaInformePreventivo,
                    titulo: "Informe Ejecutivo Gerencial",
                    etiqueta: "Decisión estratégica",
                    detalle: "Tendencias, comparaciones, rankings, concentración de riesgos y recomendaciones gerenciales.",
                    color: "#8b5cf6",
                    habilitado: perfilGerencialHabilitado,
                  },
                ].map((categoria) => {
                  const activa = categoriaInformePreventivo === categoria.id;
                  return (
                    <button
                      key={`categoria-informe-${categoria.id}`}
                      type="button"
                      disabled={!categoria.habilitado}
                      onClick={() => {
                        const primeraPlantilla = plantillasInformeGerencial.find(
                          (plantilla) => plantilla.categoria === categoria.id
                        );
                        if (primeraPlantilla) aplicarPlantillaInforme(primeraPlantilla);
                      }}
                      style={{
                        minWidth: 0,
                        borderRadius: "20px",
                        padding: "15px",
                        textAlign: "left",
                        border: activa ? `1px solid ${categoria.color}88` : bordeInterno,
                        borderLeft: `4px solid ${categoria.color}`,
                        background: activa
                          ? temaClaro
                            ? `linear-gradient(135deg, ${categoria.color}18, rgba(255,255,255,0.92))`
                            : `linear-gradient(135deg, ${categoria.color}24, rgba(15,23,42,0.82))`
                          : fondoInterno,
                        color: textoPrincipal,
                        cursor: categoria.habilitado ? "pointer" : "not-allowed",
                        opacity: categoria.habilitado ? 1 : 0.58,
                        display: "grid",
                        gridTemplateColumns: "auto minmax(0, 1fr) auto",
                        gap: "11px",
                        alignItems: "start",
                        boxShadow: activa ? `0 16px 30px ${categoria.color}18` : "none",
                      }}
                    >
                      <span style={{ width: "34px", height: "34px", borderRadius: "12px", display: "grid", placeItems: "center", background: `${categoria.color}20`, border: `1px solid ${categoria.color}50`, color: categoria.color, fontSize: "16px", fontWeight: 950 }}>
                        {categoria.id === "operativo" ? "O" : "G"}
                      </span>
                      <span style={{ minWidth: 0, display: "grid", gap: "4px" }}>
                        <span style={{ color: categoria.color, fontSize: "10px", fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.55px" }}>{categoria.etiqueta}</span>
                        <strong style={{ color: textoPrincipal, fontSize: "15px", lineHeight: 1.2, fontWeight: 950 }}>{categoria.titulo}</strong>
                        <span style={{ color: textoSuave, fontSize: "11px", lineHeight: 1.4, fontWeight: 760 }}>{categoria.detalle}</span>
                      </span>
                      <span style={{ borderRadius: "999px", padding: "5px 8px", background: activa ? `${categoria.color}22` : fondoInternoFuerte, color: activa ? categoria.color : textoSuave, fontSize: "9px", fontWeight: 950, whiteSpace: "nowrap" }}>
                        {!categoria.habilitado ? "Perfil requerido" : activa ? "Seleccionado" : "Elegir"}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div style={{ borderRadius: "16px", padding: "11px 12px", background: temaClaro ? "rgba(239,246,255,0.72)" : "rgba(8,47,73,0.30)", border: temaClaro ? "1px solid rgba(37,99,235,0.18)" : "1px solid rgba(125,211,252,0.18)", display: "grid", gridTemplateColumns: "auto minmax(0, 1fr) auto", gap: "10px", alignItems: "center" }}>
                <span style={{ width: "34px", height: "34px", borderRadius: "999px", overflow: "hidden", display: "grid", placeItems: "center", background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "#ffffff", fontSize: "11px", fontWeight: 950 }}>
                  {inicialesUsuarioInforme(usuarioGeneradorInforme.nombre)}
                </span>
                <span style={{ minWidth: 0 }}>
                  <strong style={{ display: "block", color: textoPrincipal, fontSize: "12px", fontWeight: 950 }}>Autoría individual del informe</strong>
                  <span style={{ display: "block", marginTop: "2px", color: textoSuave, fontSize: "11px", lineHeight: 1.35, fontWeight: 760 }}>
                    Se emitirá a nombre de {usuarioGeneradorInforme.nombre} · {usuarioGeneradorInforme.cargo}. Cada perfil ejecutivo conserva su propia trazabilidad documental.
                  </span>
                </span>
                <span style={{ borderRadius: "999px", padding: "6px 9px", background: perfilGerencialHabilitado ? "rgba(34,197,94,0.12)" : "rgba(249,115,22,0.12)", color: perfilGerencialHabilitado ? "#22c55e" : "#f97316", fontSize: "10px", fontWeight: 950, whiteSpace: "nowrap" }}>
                  {perfilGerencialHabilitado ? "Perfil ejecutivo habilitado" : "Perfil operativo"}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 0.9fr) minmax(0, 1.1fr)", gap: "12px", alignItems: "stretch" }}>
                <div style={{ display: "grid", gap: "12px", minWidth: 0 }}>
                  <div style={{ borderRadius: "18px", padding: "12px", background: fondoInterno, border: bordeInterno, display: "grid", gap: "9px" }}>
                    <div style={{ color: textoAzul, fontSize: "11px", fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.55px" }}>
                      Tipo de informe
                    </div>
                    {plantillasCategoriaActiva.map((plantilla) => {
                      const activo = tipoInformeGerencial === plantilla.id;

                      return (
                        <button
                          key={plantilla.id}
                          type="button"
                          onClick={() => {
                            activarBoton(`plantilla-${plantilla.id}`);
                            aplicarPlantillaInforme(plantilla);
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
                            aplicarNivelDetalleInforme(opcion.id);
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
                      disabled={!existePeriodoMaestroInforme}
                      onClick={() => aplicarPeriodoInforme("periodo-filtrado")}
                      title={existePeriodoMaestroInforme ? "Copiar el período activo del tablero" : "No hay un período activo en los filtros maestros"}
                      style={{ ...botonStyle("periodo-filtrado-informe"), minHeight: "34px", padding: "7px 10px", fontSize: "11px", opacity: existePeriodoMaestroInforme ? 1 : 0.48, cursor: existePeriodoMaestroInforme ? "pointer" : "not-allowed" }}
                    >
                      {existePeriodoMaestroInforme ? "Aplicar período del tablero" : "Sin período activo en el tablero"}
                    </button>
                  </div>

                  <div style={{ display: "grid", gap: "10px", borderRadius: "16px", padding: "10px", background: fondoInternoFuerte, border: bordeInterno }}>
                    {[
                      {
                        titulo: "Riesgo",
                        todosActivos: !filtrosInformeGerencial.criticidad && !filtrosInformeGerencial.soloCriticosAbiertos && !filtrosInformeGerencial.soloReincidencias,
                        limpiar: () => asignarFiltroInforme({ criticidad: undefined, soloCriticosAbiertos: false, soloReincidencias: false }),
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
                        todosActivos: !filtrosInformeGerencial.estado && filtrosInformeGerencial.vencimiento === "todos" && !filtrosInformeGerencial.sinFechaCompromiso,
                        limpiar: () => asignarFiltroInforme({ estado: undefined, estadoCierre: undefined, vencimiento: "todos", sinFechaCompromiso: false }),
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
                        todosActivos: filtrosInformeGerencial.gps === "todos" && filtrosInformeGerencial.evidencia === "todos",
                        limpiar: () => asignarFiltroInforme({ gps: "todos", evidencia: "todos" }),
                        items: [
                          ["Con GPS", filtrosInformeGerencial.gps === "con-gps", () => asignarFiltroInforme({ gps: filtrosInformeGerencial.gps === "con-gps" ? "todos" : "con-gps" })],
                          ["Sin GPS", filtrosInformeGerencial.gps === "sin-gps", () => asignarFiltroInforme({ gps: filtrosInformeGerencial.gps === "sin-gps" ? "todos" : "sin-gps" })],
                          ["Con evidencia", filtrosInformeGerencial.evidencia === "con-evidencia", () => asignarFiltroInforme({ evidencia: filtrosInformeGerencial.evidencia === "con-evidencia" ? "todos" : "con-evidencia" })],
                          ["Sin evidencia", filtrosInformeGerencial.evidencia === "sin-evidencia", () => asignarFiltroInforme({ evidencia: filtrosInformeGerencial.evidencia === "sin-evidencia" ? "todos" : "sin-evidencia" })],
                        ] as Array<[string, boolean, () => void]>,
                      },
                      {
                        titulo: "Periodo",
                        todosActivos: !filtrosInformeGerencial.fechaDesde && !filtrosInformeGerencial.fechaHasta && !filtrosInformeGerencial.semana && !filtrosInformeGerencial.mes,
                        limpiar: () => asignarFiltroInforme({ fechaDesde: undefined, fechaHasta: undefined, semana: undefined, mes: undefined }),
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
                          <button
                            type="button"
                            onClick={grupo.limpiar}
                            style={{
                              minHeight: "32px",
                              borderRadius: "999px",
                              border: grupo.todosActivos ? "1px solid rgba(34,197,94,0.52)" : bordeInterno,
                              background: grupo.todosActivos
                                ? "linear-gradient(135deg, rgba(22,163,74,0.88), rgba(34,197,94,0.62))"
                                : fondoInterno,
                              color: grupo.todosActivos ? "#ffffff" : textoMedio,
                              padding: "7px 10px",
                              fontSize: "11px",
                              fontWeight: 900,
                              cursor: "pointer",
                            }}
                          >
                            Todos
                          </button>
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
                      seleccionarTodo: () => setSeccionesInformeSeleccionadas((actual) => Array.from(new Set([...actual, ...seccionesPrincipalesInformeGerencial.map((item) => item.id)]))),
                      limpiarGrupo: () => setSeccionesInformeSeleccionadas((actual) => actual.filter((id) => !seccionesPrincipalesInformeGerencial.some((item) => item.id === id))),
                    },
                    {
                      titulo: "B. Graficos y visualizaciones",
                      items: graficosInformeGerencial,
                      seleccion: graficosInformeSeleccionados,
                      cambiar: alternarGraficoInforme,
                      seleccionarTodo: () => setGraficosInformeSeleccionados(graficosInformeGerencial.map((item) => item.id)),
                      limpiarGrupo: () => setGraficosInformeSeleccionados([]),
                    },
                    {
                      titulo: "C. Rankings",
                      items: rankingsInformeGerencial,
                      seleccion: rankingsInformeSeleccionados,
                      cambiar: alternarRankingInforme,
                      seleccionarTodo: () => setRankingsInformeSeleccionados(rankingsInformeGerencial.map((item) => item.id)),
                      limpiarGrupo: () => setRankingsInformeSeleccionados([]),
                    },
                    {
                      titulo: "D. Análisis por estado (texto)",
                      items: hallazgosDetalleInformeGerencial,
                      seleccion: seccionesInformeSeleccionadas,
                      cambiar: alternarSeccionInforme,
                      seleccionarTodo: () => setSeccionesInformeSeleccionadas((actual) => Array.from(new Set([...actual, ...hallazgosDetalleInformeGerencial.map((item) => item.id)]))),
                      limpiarGrupo: () => setSeccionesInformeSeleccionadas((actual) => actual.filter((id) => !hallazgosDetalleInformeGerencial.some((item) => item.id === id))),
                    },
                  ].map((grupo) => (
                    <div key={grupo.titulo} style={{ display: "grid", gap: "8px", borderRadius: "16px", padding: "10px", background: fondoInternoFuerte, border: bordeInterno }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                        <div style={{ color: textoSuave, fontSize: "10px", fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          {grupo.titulo}
                        </div>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button type="button" onClick={grupo.seleccionarTodo} style={{ ...botonStyle(`todo-${grupo.titulo}`), minHeight: "27px", padding: "5px 8px", fontSize: "9px" }}>Todos</button>
                          <button type="button" onClick={grupo.limpiarGrupo} style={{ ...botonStyle(`ninguno-${grupo.titulo}`), minHeight: "27px", padding: "5px 8px", fontSize: "9px" }}>Ninguno</button>
                        </div>
                      </div>
                      {grupo.titulo.startsWith("D.") && (
                        <div style={{ color: textoSuave, fontSize: "10px", lineHeight: 1.35, fontWeight: 750 }}>
                          Estas opciones agregan interpretación escrita al informe. No controlan las series del gráfico ni las filas del anexo.
                        </div>
                      )}
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
                        ? " Se incluirán hasta 20 hallazgos filtrados como respaldo documental."
                        : ""}
                    </div>
                  </div>

                  <div style={{ display: "grid", gap: "12px", borderRadius: "18px", padding: "13px", background: temaClaro ? "rgba(239,246,255,0.72)" : "linear-gradient(145deg, rgba(8,47,73,0.44), rgba(15,23,42,0.72))", border: temaClaro ? "1px solid rgba(37,99,235,0.24)" : "1px solid rgba(125,211,252,0.22)", borderLeft: temaClaro ? "3px solid rgba(37,99,235,0.72)" : "3px solid rgba(56,189,248,0.72)", boxShadow: temaClaro ? "0 12px 24px rgba(15,23,42,0.05)" : "inset 0 1px 0 rgba(255,255,255,0.04)" }}>
                    <div style={{ display: "grid", gap: "4px" }}>
                      <div style={{ color: textoAzul, fontSize: "11px", fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.55px" }}>
                        Configuración de visualizaciones
                      </div>
                      <div style={{ color: textoSuave, fontSize: "12px", lineHeight: 1.35, fontWeight: 750 }}>
                        Defina las series del gráfico temporal y el criterio de orden de los rankings.
                      </div>
                    </div>
                    {graficosInformeSeleccionados.includes("tendencia") ? (
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
                    ) : (
                      <div style={{ borderRadius: "12px", padding: "9px 10px", background: fondoInterno, border: bordeInterno, color: textoSuave, fontSize: "11px", fontWeight: 750 }}>
                        Las series temporales aparecerán cuando seleccione “Tendencia temporal” en Gráficos y visualizaciones.
                      </div>
                    )}
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
                          Orden principal del comparativo
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
                      El foco comparativo define el orden de prioridad. El informe conserva críticos, vencidos, backlog, cierres y tasa de cierre para que la lectura sea completa.
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
                      {etiquetaCategoriaInforme} · {plantillaInformeActiva.titulo} · {etiquetaAlcanceInforme} · {analisisInformeGerencial.total} hallazgo(s) incluidos
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      onClick={() => void copiarResumenInformeGerencial()}
                      title="Copia al portapapeles el texto ejecutivo construido con la seleccion actual."
                      style={{ ...botonStyle("copiar-informe-gerencial", true), minHeight: "36px", padding: "8px 11px", fontSize: "12px" }}
                    >
                      Copiar texto del resumen
                    </button>
                    <button
                      type="button"
                      title="Abre el informe completo en una ventana de vista previa, sin descargar archivos."
                      onClick={() => void generarPdfInformeGerencial("vista-previa")}
                      style={{ ...botonStyle("vista-previa-informe", true), minHeight: "36px", padding: "8px 11px", fontSize: "12px" }}
                    >
                      Visualizar informe
                    </button>
                    <button
                      type="button"
                      disabled={estadoPdfInformeGerencial === "generando"}
                      title="Descarga el informe configurado como archivo PDF."
                      onClick={() => void generarPdfInformeGerencial("descargar")}
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
                            : "Descargar PDF"}
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
                  ) : hayElementosInformeGerencial ? (
                    <span style={{ borderRadius: "999px", padding: "6px 9px", background: temaClaro ? "rgba(34,197,94,0.10)" : "rgba(34,197,94,0.08)", border: temaClaro ? "1px solid rgba(22,163,74,0.20)" : "1px solid rgba(74,222,128,0.20)", color: temaClaro ? "#15803d" : "#86efac", fontSize: "11px", fontWeight: 900 }}>
                      Universo completo visible para este perfil
                    </span>
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
                      ["Tasa cierre", `${analisisInformeGerencial.tasaCierre}%`, colorTasaCierre(analisisInformeGerencial.tasaCierre)],
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

                {graficosInformeSeleccionados.includes("tendencia") && (
                  <div style={{ borderRadius: "18px", padding: "12px", background: fondoInterno, border: bordeInterno, display: "grid", gap: "11px" }}>
                    <div>
                      <div style={{ color: textoAzul, fontSize: "11px", fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.55px" }}>Evolución ejecutiva</div>
                      <div style={{ marginTop: "4px", color: textoSuave, fontSize: "11px", fontWeight: 760 }}>Reportados, cerrados, críticos y vencidos por periodo.</div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.max(1, tendenciaVisualInforme.length)}, minmax(70px, 1fr))`, gap: "8px", overflowX: "auto", paddingBottom: "3px" }}>
                      {tendenciaVisualInforme.map((item) => {
                        const maximo = Math.max(1, item.total, item.cerrados, item.criticosAbiertos, item.vencidosAbiertos);
                        return (
                          <div key={`preview-tendencia-${item.periodo}`} style={{ minWidth: "70px", borderRadius: "12px", padding: "8px", background: fondoInternoFuerte, border: bordeInterno, display: "grid", gap: "6px" }}>
                            <strong style={{ color: textoPrincipal, fontSize: "10px", textAlign: "center" }}>{item.periodo}</strong>
                            {[
                              ["Reportados", item.total, "#38bdf8"],
                              ["Cerrados", item.cerrados, "#22c55e"],
                              ["Críticos", item.criticosAbiertos, "#ef4444"],
                              ["Vencidos", item.vencidosAbiertos, "#f97316"],
                            ].map(([label, valor, color]) => (
                              <div key={`preview-tendencia-${item.periodo}-${label}`} title={`${label}: ${valor}`} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 20px", gap: "5px", alignItems: "center" }}>
                                <div style={{ height: "6px", borderRadius: "999px", background: temaClaro ? "rgba(148,163,184,0.22)" : "rgba(148,163,184,0.14)", overflow: "hidden" }}>
                                  <div style={{ width: `${Number(valor) === 0 ? 3 : Math.max(8, (Number(valor) / maximo) * 100)}%`, height: "100%", borderRadius: "inherit", background: String(color) }} />
                                </div>
                                <strong style={{ color: String(color), fontSize: "10px", textAlign: "right" }}>{valor}</strong>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ borderRadius: "12px", padding: "9px 10px", background: temaClaro ? "rgba(239,246,255,0.72)" : "rgba(8,47,73,0.30)", border: temaClaro ? "1px solid rgba(37,99,235,0.16)" : "1px solid rgba(125,211,252,0.16)", color: textoMedio, fontSize: "11px", lineHeight: 1.45, fontWeight: 760 }}>
                      <strong style={{ color: textoAzul }}>Lectura gerencial: </strong>{lecturaTendenciaInforme}
                    </div>
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
                    <div style={{ gridColumn: "1 / -1", borderRadius: "16px", padding: "12px", background: fondoInterno, border: bordeInterno, display: "grid", gap: "12px" }}>
                      <div>
                        <div style={{ color: textoAzul, fontSize: "11px", fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.55px" }}>Rankings comparativos incluidos</div>
                        <div style={{ marginTop: "4px", color: textoSuave, fontSize: "11px", fontWeight: 760 }}>La misma lectura visual se traspasará al documento final.</div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "10px" }}>
                        {rankingsPdfInformeGerencial.map((ranking) => {
                          const dataVisible = ranking.data.slice(0, 5);
                          const maximo = Math.max(1, ...dataVisible.map((item) => item.total));
                          return (
                            <div key={`preview-${ranking.titulo}`} style={{ borderRadius: "14px", padding: "10px", background: fondoInternoFuerte, border: bordeInterno, display: "grid", gap: "8px" }}>
                              <strong style={{ color: textoPrincipal, fontSize: "12px", fontWeight: 950 }}>{ranking.titulo}</strong>
                              {dataVisible.length > 0 ? dataVisible.map((item, index) => (
                                <div key={`preview-${ranking.titulo}-${item.nombre}`} style={{ display: "grid", gridTemplateColumns: "18px minmax(0, 1fr) 30px", gap: "7px", alignItems: "center" }}>
                                  <span style={{ color: textoAzul, fontSize: "10px", fontWeight: 950 }}>{index + 1}</span>
                                  <div style={{ minWidth: 0, display: "grid", gap: "4px" }}>
                                    <span style={{ color: textoMedio, fontSize: "10px", fontWeight: 850, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.nombre}</span>
                                    <div style={{ height: "7px", borderRadius: "999px", background: temaClaro ? "rgba(148,163,184,0.22)" : "rgba(148,163,184,0.14)", overflow: "hidden" }}>
                                      <div style={{ width: `${Math.max(7, (item.total / maximo) * 100)}%`, height: "100%", borderRadius: "inherit", background: colorRiesgoRanking(item) }} />
                                    </div>
                                  </div>
                                  <strong style={{ color: textoPrincipal, fontSize: "11px", textAlign: "right" }}>{item.total}</strong>
                                </div>
                              )) : (
                                <span style={{ color: textoSuave, fontSize: "11px", fontWeight: 760 }}>Sin datos para este alcance.</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
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
            <section id="detalle-accionable-kpi" style={{ ...themedSurfaceStyle, padding: "18px", display: "grid", gap: "14px", width: "100%", maxWidth: "none", minWidth: 0, alignSelf: "stretch", justifySelf: "stretch", boxSizing: "border-box", gridColumn: "1 / -1", scrollMarginTop: "88px" }}>
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
                      ? `Mostrando ${inicioDetalleAccionable}-${finDetalleAccionable} de ${totalDetalleAccionable} hallazgo(s) del analisis maestro.`
                      : busquedaDetalleAccionable.trim()
                        ? "No hay coincidencias para esta busqueda dentro del foco seleccionado."
                        : "No hay hallazgos asociados a este foco con los filtros maestros actuales."}
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
                </div>
              </div>

              {detalleAccionableBase.length === 0 ? (
                <div style={{ borderRadius: "18px", padding: "22px", background: fondoInterno, border: bordeInterno, textAlign: "center", color: textoMedio, fontSize: "14px", fontWeight: 800 }}>
                  No hay hallazgos asociados a este foco con los filtros actuales.
                </div>
              ) : totalDetalleAccionable === 0 ? (
                <div style={{ borderRadius: "18px", padding: "22px", background: fondoInterno, border: bordeInterno, textAlign: "center", color: textoMedio, fontSize: "14px", fontWeight: 800 }}>
                  {busquedaDetalleAccionable.trim()
                    ? "No hay coincidencias para esta busqueda dentro del foco seleccionado."
                    : "No hay hallazgos asociados a este foco con los filtros maestros actuales."}
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
                                  onClick={() =>
                                    void copiarResumenDetalle(
                                      `${resumenHallazgoDetalle(hallazgo)}\n\nSeguimiento requerido: confirmar responsable, fecha compromiso, acción correctiva y evidencia de cierre.`,
                                      `Seguimiento de ${hallazgo.codigo} copiado y listo para enviar.`
                                    )
                                  }
                                  style={{ ...botonStyle(`seguimiento-${hallazgo.codigo}`), minHeight: "32px", padding: "7px 10px", fontSize: "11px" }}
                                >
                                  Copiar seguimiento
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
