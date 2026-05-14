import type { HallazgoPanel } from "../mockdata";
import { adaptarHallazgosCentralesAHallazgosPanel } from "../../adapters/hallazgoCentralToHallazgoPanel";
import {
  adaptarReportesV2AHallazgosPanel,
  type ReporteV2,
} from "../adapters/reporteV2ToHallazgoPanel";
import { listarHallazgosCentrales } from "../../repositories/hallazgosCentralRepository";

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

  return combinarHallazgosSinDuplicar(
    hallazgosBase,
    adaptarReportesV2AHallazgosPanel(reportesV2)
  );
}

function combinarHallazgosSinDuplicar(
  hallazgosBase: HallazgoPanel[],
  hallazgosAdicionales: HallazgoPanel[]
): HallazgoPanel[] {
  const codigosBase = new Set(hallazgosBase.map((hallazgo) => hallazgo.codigo));
  const nuevosHallazgos = hallazgosAdicionales.filter(
    (hallazgo) => !codigosBase.has(hallazgo.codigo)
  );

  return [...hallazgosBase, ...nuevosHallazgos];
}

export async function cargarHallazgosPanelConFuentesOpcionales(
  hallazgosBase: HallazgoPanel[]
): Promise<HallazgoPanel[]> {
  try {
    const respuestaCentral = await listarHallazgosCentrales({ limit: 500 });

    if (respuestaCentral.ok && respuestaCentral.data.length > 0) {
      const hallazgosCentrales = adaptarHallazgosCentralesAHallazgosPanel(
        respuestaCentral.data
      );

      if (process.env.NODE_ENV !== "production") {
        console.info("[panel-source] fuente supabase hallazgos_central", {
          registros: hallazgosCentrales.length,
        });
      }

      return hallazgosCentrales;
    }

    if (process.env.NODE_ENV !== "production") {
      console.info("[panel-source] fallback mock/local", {
        motivo: respuestaCentral.ok
          ? "hallazgos_central sin registros"
          : respuestaCentral.error,
        registrosCentrales: respuestaCentral.ok
          ? respuestaCentral.data.length
          : 0,
      });
    }
  } catch (error) {
    console.warn(
      "No se pudo leer repositorio central de hallazgos. Usando fallback local/mock.",
      error
    );
  }

  return cargarHallazgosPanelConReportesV2(hallazgosBase);
}
