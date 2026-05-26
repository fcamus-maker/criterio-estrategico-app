import {
  adaptarReporteV2AHallazgoCentral,
  type ReporteV2CentralEntrada,
} from "../adapters/reporteV2ToHallazgoCentral";
import {
  actualizarHallazgoCentral,
  crearHallazgoCentral,
  obtenerHallazgoCentralPorCodigo,
  obtenerEstadoRepositorioCentral,
  obtenerTablaDestinoHallazgosCentral,
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

  if (process.env.NODE_ENV !== "production") {
    const estadoRepositorio = obtenerEstadoRepositorioCentral();
    console.info("[mobile-v2] payload central preparado", {
      tablaDestino: obtenerTablaDestinoHallazgosCentral(),
      codigo: hallazgoCentral.codigo,
      empresa: hallazgoCentral.empresa,
      obra: hallazgoCentral.obra,
      area: hallazgoCentral.area,
      criticidad: hallazgoCentral.criticidad,
      tieneGps: Boolean(hallazgoCentral.geolocalizacion),
      evidencias: hallazgoCentral.evidencias?.length || 0,
      sinBase64: true,
      supabaseHabilitado: estadoRepositorio.habilitado,
      supabaseConfigurado: estadoRepositorio.configurado,
      banderaActiva: estadoRepositorio.banderaActiva,
    });
  }

  if (hallazgoCentral.codigo) {
    const existente = await obtenerHallazgoCentralPorCodigo(hallazgoCentral.codigo);

    if (existente.ok && existente.data) {
      const tieneEvidenciasEntrantes = Boolean(hallazgoCentral.evidencias?.length);
      const requiereActualizarEvidencias = tieneEvidenciasEntrantes &&
        JSON.stringify(existente.data.evidencias || []) !==
          JSON.stringify(hallazgoCentral.evidencias || []);

      if (process.env.NODE_ENV !== "production") {
        console.info("[mobile-v2] hallazgo central existente", {
          codigo: hallazgoCentral.codigo,
          id: existente.data.id,
          requiereActualizarEvidencias,
        });
      }

      if (requiereActualizarEvidencias && existente.data.id) {
        const actualizado = await actualizarHallazgoCentral(existente.data.id, {
          evidencias: hallazgoCentral.evidencias,
          rawMobileV2: hallazgoCentral.rawMobileV2,
          fechaActualizacion: new Date().toISOString(),
        });

        if (actualizado.ok) {
          return {
            hallazgoCentral: actualizado.data,
            resultado: {
              ...actualizado,
              mensaje: "Hallazgo central existente actualizado con metadata de evidencias.",
            },
          };
        }
      }

      return {
        hallazgoCentral: existente.data,
        resultado: {
          ok: true,
          data: existente.data,
          origen: existente.origen,
          mensaje: "Hallazgo central ya existia; no se duplico el reporte.",
        },
      };
    }
  }

  const resultado = await crearHallazgoCentral(hallazgoCentral);

  return {
    hallazgoCentral,
    resultado,
  };
}
