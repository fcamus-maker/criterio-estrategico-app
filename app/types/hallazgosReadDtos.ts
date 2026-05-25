import type { HallazgosReadFilters } from "./hallazgosReadFilters";
import type { HallazgoCentral } from "./hallazgoCentral";

/**
 * Passive DTO contracts for future high-volume read layers.
 *
 * They document the target shape for KPI, detail, evidence and report reads.
 * They do not change current UI, Supabase queries, Storage, RLS, Google Maps or
 * mobile behavior.
 */

export type CalidadDatoResumenDto = {
  conGps: number;
  conEvidenciaReporte: number;
  conEvidenciaCierre: number;
  conResponsable: number;
  conFechaCompromiso: number;
};

export type KpiResumenDto = {
  totalPeriodo: number;
  backlogNoCerradoAnterior: number;
  cerradosDelPeriodo: number;
  totalGestionVigente: number;
  abiertos: number;
  cerrados: number;
  criticosAbiertos: number;
  vencidosAbiertos: number;
  sinFechaCompromiso: number;
  tasaCierre: number;
  calidadDato: CalidadDatoResumenDto;
  fechaDesde: string;
  fechaHasta: string;
  incluyeBacklog: boolean;
  advertencias: string[];
};

export type AgrupadorComparativo =
  | "empresaReportante"
  | "empresaResponsable"
  | "obra"
  | "area"
  | "tipo"
  | "responsable";

export type ComparativoDto = {
  agrupador: AgrupadorComparativo;
  nombre: string;
  total: number;
  abiertos: number;
  cerrados: number;
  criticos: number;
  vencidos: number;
  sinFecha: number;
  porcentaje: number;
  tendencia?: number;
};

export type HallazgoDetalleDto = {
  id: string;
  codigo: string;
  empresaReportante: string;
  empresaResponsable: string;
  obra: string;
  area: string;
  tipo: string;
  criticidad: string;
  estadoOperativo: string;
  estadoCierre: string;
  fechaReporte: string;
  fechaCompromiso?: string;
  diasVencido?: number;
  responsableCierre?: string;
  tieneGps: boolean;
  tieneEvidenciaReporte: boolean;
  tieneEvidenciaCierre: boolean;
};

export type EvidenciaDto = {
  hallazgoId: string;
  tipo: "reporte" | "cierre";
  miniatura?: string;
  urlFirmada?: string;
  fecha?: string;
  origen: string;
};

export type InformeGerencialDto = {
  filtrosAplicados: HallazgosReadFilters;
  resumen: KpiResumenDto;
  rankings: ComparativoDto[];
  hallazgosIncluidos: HallazgoDetalleDto[];
  anexos?: {
    total: number;
    paginas: number;
  };
  advertenciasDatos: string[];
  alcance: string;
  periodo: {
    desde: string;
    hasta: string;
  };
  incluyeBacklog: boolean;
};

export type OrigenGestionVigente =
  | "periodo"
  | "backlogAnterior"
  | "cerradoDelPeriodo"
  | "gestionVigente";

export type HallazgoGestionVigente = HallazgoCentral & {
  origenGestion: OrigenGestionVigente[];
  esBacklogAnterior: boolean;
  esDelPeriodo: boolean;
  esCerradoDelPeriodo: boolean;
};
