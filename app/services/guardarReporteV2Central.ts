import {
  adaptarReporteV2AHallazgoCentral,
  type ReporteV2CentralEntrada,
} from "../adapters/reporteV2ToHallazgoCentral";
import {
  crearHallazgoCentral,
  type ResultadoRepositorioCentral,
} from "../repositories/hallazgosCentralRepository";
import type { HallazgoCentral } from "../types/hallazgoCentral";

export type ResultadoGuardadoCentralV2 = {
  hallazgoCentral: HallazgoCentral;
  resultado: ResultadoRepositorioCentral<HallazgoCentral>;
};

// Integracion opcional y no bloqueante para la futura base central.
// El guardado local V2 sigue siendo la fuente principal hasta activar Supabase.
export async function intentarGuardarReporteV2EnRepositorioCentral(
  reporte: ReporteV2CentralEntrada
): Promise<ResultadoGuardadoCentralV2> {
  const hallazgoCentral = adaptarReporteV2AHallazgoCentral(reporte);
  const resultado = await crearHallazgoCentral(hallazgoCentral);

  return {
    hallazgoCentral,
    resultado,
  };
}
