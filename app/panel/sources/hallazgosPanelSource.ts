import type { HallazgoPanel } from "../mockdata";
import { adaptarHallazgosCentralesAHallazgosPanel } from "../../adapters/hallazgoCentralToHallazgoPanel";
import {
  adaptarReportesV2AHallazgosPanel,
  type ReporteV2,
} from "../adapters/reporteV2ToHallazgoPanel";
import { listarHallazgosCentrales } from "../../repositories/hallazgosCentralRepository";
import type { FiltrosHallazgosCentrales } from "../../repositories/hallazgosCentralRepository";

const STORAGE_HISTORIAL_V2 = "ce_mobile_v2_historial_reportes";
const CACHE_TTL_MS = 60_000;

let cacheHallazgosPanel:
  | {
      timestamp: number;
      data: HallazgoPanel[];
      key: string;
    }
  | null = null;
let cargaHallazgosPanelEnCurso:
  | {
      key: string;
      promesa: Promise<HallazgoPanel[]>;
    }
  | null = null;

type OpcionesCargaHallazgosPanel = {
  filtros?: FiltrosHallazgosCentrales;
  permitirFallbackMock?: boolean;
  incluirReportesLocales?: boolean;
};

function claveCache(opciones: OpcionesCargaHallazgosPanel) {
  return JSON.stringify({
    filtros: opciones.filtros || {},
    permitirFallbackMock: opciones.permitirFallbackMock !== false,
    incluirReportesLocales: opciones.incluirReportesLocales !== false,
  });
}

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
  hallazgosBase: HallazgoPanel[],
  opciones: OpcionesCargaHallazgosPanel = {}
): Promise<HallazgoPanel[]> {
  const ahora = Date.now();
  const key = claveCache(opciones);
  const permitirFallbackMock = opciones.permitirFallbackMock !== false;
  const incluirReportesLocales = opciones.incluirReportesLocales !== false;

  if (
    cacheHallazgosPanel &&
    cacheHallazgosPanel.key === key &&
    ahora - cacheHallazgosPanel.timestamp < CACHE_TTL_MS
  ) {
    return cacheHallazgosPanel.data;
  }

  if (cargaHallazgosPanelEnCurso?.key === key) {
    return cargaHallazgosPanelEnCurso.promesa;
  }

  const promesa = (async () => {
    try {
      const respuestaCentral = await listarHallazgosCentrales({
        limit: 500,
        ...(opciones.filtros || {}),
      });

      if (
        respuestaCentral.ok &&
        (respuestaCentral.data.length > 0 || !permitirFallbackMock)
      ) {
        const hallazgosCentrales = adaptarHallazgosCentralesAHallazgosPanel(
          respuestaCentral.data
        );
        cacheHallazgosPanel = {
          key,
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
      if (permitirFallbackMock) {
        console.warn(
          "No se pudo leer repositorio central de hallazgos. Usando fallback local/mock.",
          error
        );
      } else {
        console.warn(
          "No se pudo leer repositorio central de hallazgos para alcance restringido.",
          error
        );
      }
    }

    if (!permitirFallbackMock) {
      cacheHallazgosPanel = {
        key,
        timestamp: Date.now(),
        data: [],
      };
      return [];
    }

    const fallback = incluirReportesLocales
      ? cargarHallazgosPanelConReportesV2(hallazgosBase)
      : hallazgosBase;
    cacheHallazgosPanel = {
      key,
      timestamp: Date.now(),
      data: fallback,
    };
    return fallback;
  })();

  cargaHallazgosPanelEnCurso = { key, promesa };

  try {
    return await promesa;
  } finally {
    if (cargaHallazgosPanelEnCurso?.key === key) {
      cargaHallazgosPanelEnCurso = null;
    }
  }
}
