import type { HallazgoPanel } from "../mockdata";
import { adaptarHallazgosCentralesAHallazgosPanel } from "../../adapters/hallazgoCentralToHallazgoPanel";
import {
  adaptarReportesV2AHallazgosPanel,
  type ReporteV2,
} from "../adapters/reporteV2ToHallazgoPanel";
import { listarHallazgosCentrales } from "../../repositories/hallazgosCentralRepository";

const STORAGE_HISTORIAL_V2 = "ce_mobile_v2_historial_reportes";
const CACHE_TTL_MS = 60_000;

let cacheHallazgosPanel:
  | {
      timestamp: number;
      data: HallazgoPanel[];
    }
  | null = null;
let cargaHallazgosPanelEnCurso: Promise<HallazgoPanel[]> | null = null;

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
  const ahora = Date.now();

  if (
    cacheHallazgosPanel &&
    ahora - cacheHallazgosPanel.timestamp < CACHE_TTL_MS
  ) {
    return cacheHallazgosPanel.data;
  }

  if (cargaHallazgosPanelEnCurso) {
    return cargaHallazgosPanelEnCurso;
  }

  cargaHallazgosPanelEnCurso = (async () => {
    try {
      const respuestaCentral = await listarHallazgosCentrales({ limit: 500 });

      if (respuestaCentral.ok && respuestaCentral.data.length > 0) {
        const hallazgosCentrales = adaptarHallazgosCentralesAHallazgosPanel(
          respuestaCentral.data
        );
        cacheHallazgosPanel = {
          timestamp: Date.now(),
          data: hallazgosCentrales,
        };

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

    const fallback = cargarHallazgosPanelConReportesV2(hallazgosBase);
    cacheHallazgosPanel = {
      timestamp: Date.now(),
      data: fallback,
    };
    return fallback;
  })();

  try {
    return await cargaHallazgosPanelEnCurso;
  } finally {
    cargaHallazgosPanelEnCurso = null;
  }
}
