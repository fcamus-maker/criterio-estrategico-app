import type { HallazgoPanel } from "../mockdata";
import {
  adaptarReportesV2AHallazgosPanel,
  type ReporteV2,
} from "../adapters/reporteV2ToHallazgoPanel";

const STORAGE_HISTORIAL_V2 = "ce_mobile_v2_historial_reportes";

function leerReportesV2Locales(): ReporteV2[] {
  if (typeof window === "undefined") return [];

  try {
    const guardado = JSON.parse(
      localStorage.getItem(STORAGE_HISTORIAL_V2) || "[]"
    );

    return Array.isArray(guardado) ? guardado : [];
  } catch (error) {
    console.warn("No se pudieron leer reportes móviles V2 locales.", error);
    return [];
  }
}

export function cargarHallazgosPanelConReportesV2(
  hallazgosBase: HallazgoPanel[]
): HallazgoPanel[] {
  const reportesV2 = leerReportesV2Locales();

  if (reportesV2.length === 0) return hallazgosBase;

  const codigosBase = new Set(hallazgosBase.map((hallazgo) => hallazgo.codigo));
  const hallazgosV2 = adaptarReportesV2AHallazgosPanel(reportesV2).filter(
    (hallazgo) => !codigosBase.has(hallazgo.codigo)
  );

  return [...hallazgosBase, ...hallazgosV2];
}
