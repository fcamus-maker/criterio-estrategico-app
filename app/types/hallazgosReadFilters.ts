/**
 * Future high-volume read filters for hallazgos.
 *
 * Period filters must not hide previous non-closed backlog. Future
 * managerial reads should default `incluirBacklogNoCerrado` to true so the
 * visible period includes current-period hallazgos, previous open backlog and
 * hallazgos closed during the period.
 *
 * These contracts prepare HV-DATA-1C/HV-DATA-2 and do not change the current
 * frontend loading, Supabase queries, UI behavior or report generation.
 */

export type CriticidadFiltro = "CRITICO" | "ALTO" | "MEDIO" | "BAJO";

export type EstadoOperativoFiltro =
  | "REPORTADO"
  | "ABIERTO"
  | "EN_SEGUIMIENTO"
  | "CERRADO"
  | "ANULADO";

export type VencimientoFiltro = "todos" | "vencidos" | "no-vencidos";

export type OrderByHallazgo =
  | "fechaReporte"
  | "fechaCompromiso"
  | "criticidad"
  | "estado"
  | "empresa"
  | "obra";

export type OrderDirection = "asc" | "desc";

export const INCLUIR_BACKLOG_NO_CERRADO_DEFAULT = true;

export type HallazgosReadFilters = {
  periodoDesde: string;
  periodoHasta: string;
  incluirBacklogNoCerrado: boolean;

  empresaReportante?: string;
  empresaResponsable?: string;
  obra?: string;
  area?: string;
  tipoHallazgo?: string;
  responsableCierre?: string;
  cargoResponsable?: string;

  criticidad?: CriticidadFiltro;
  estadoOperativo?: EstadoOperativoFiltro;
  estadoCierre?: string;

  vencimiento?: VencimientoFiltro;
  sinFechaCompromiso?: boolean;
  conGps?: boolean;
  conEvidenciaReporte?: boolean;
  conEvidenciaCierre?: boolean;

  busquedaTexto?: string;
  limit?: number;
  offset?: number;
  orderBy?: OrderByHallazgo;
  orderDirection?: OrderDirection;
};

export type PeriodoGestionVigente = {
  desde: string;
  hasta: string;
  incluyeBacklog: boolean;
};
