import {
  crearReporteCentralLivianoV2,
  guardarHistorialLivianoV2,
  guardarReporteActualV2,
  type ReporteV2Storage,
} from "../evaluar-v2/storageReporteV2";
import { intentarGuardarReporteV2EnRepositorioCentral } from "./guardarReporteV2Central";
import {
  obtenerEstadoRepositorioCentral,
  obtenerTablaDestinoHallazgosCentral,
} from "../repositories/hallazgosCentralRepository";

export type ResultadoGuardadoReporteV2 = {
  localOk: boolean;
  centralOk: boolean;
  centralPendiente: boolean;
  errorCentral?: string;
  codigo: string;
  mensaje: string;
  tablaDestino: string;
  supabaseHabilitado: boolean;
  supabaseConfigurado: boolean;
  banderaSupabaseActiva: boolean;
};

function logDesarrollo(evento: string, datos: Record<string, unknown>) {
  if (process.env.NODE_ENV !== "production") {
    console.info(`[guardar-v2] ${evento}`, datos);
  }
}

function sanitizarError(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error || "Error desconocido");
}

export async function guardarReporteV2Completo(
  reporte: ReporteV2Storage
): Promise<ResultadoGuardadoReporteV2> {
  const codigo = reporte.codigo || "SIN-CODIGO-V2";
  const fechaGuardado = new Date().toISOString();
  const estadoRepositorio = obtenerEstadoRepositorioCentral();
  const tablaDestino = obtenerTablaDestinoHallazgosCentral();
  const reporteBase: ReporteV2Storage = {
    ...reporte,
    estado: "abierto",
    estadoCierre: "abierto",
    fechaGuardado,
  };

  logDesarrollo("inicio", {
    codigo,
    empresa: reporteBase.empresa,
    obra: reporteBase.obra,
    fotos: Array.isArray(reporteBase.fotos) ? reporteBase.fotos.length : 0,
    tablaDestino,
    supabaseHabilitado: estadoRepositorio.habilitado,
    supabaseConfigurado: estadoRepositorio.configurado,
    banderaSupabaseActiva: estadoRepositorio.banderaActiva,
  });

  const reporteCentral = crearReporteCentralLivianoV2(reporteBase);
  logDesarrollo("payload central listo", {
    codigo,
    tablaDestino,
    payloadSinBase64: true,
    evidencias: Array.isArray(reporteCentral.fotos)
      ? reporteCentral.fotos.length
      : 0,
  });

  let centralOk = false;
  let errorCentral: string | undefined;

  try {
    logDesarrollo("insert Supabase intentando", { codigo, tablaDestino });
    const { resultado } =
      await intentarGuardarReporteV2EnRepositorioCentral(reporteCentral);

    if (resultado.ok) {
      centralOk = true;
      logDesarrollo("insert Supabase OK", {
        codigo,
        tablaDestino,
        id: resultado.data.id,
        mensaje: resultado.mensaje,
      });
    } else {
      errorCentral = resultado.error;
      logDesarrollo("insert Supabase ERROR", {
        codigo,
        tablaDestino,
        error: resultado.error,
        origen: resultado.origen,
      });
    }
  } catch (error) {
    errorCentral = sanitizarError(error);
    logDesarrollo("insert Supabase ERROR", {
      codigo,
      tablaDestino,
      error: errorCentral,
    });
  }

  const reporteLocal: ReporteV2Storage = {
    ...reporteBase,
    sincronizacionCentral: {
      estado: centralOk ? "sincronizado" : "pendiente",
    mensaje: centralOk
      ? `Guardado y sincronizado con ${tablaDestino}.`
      : `Guardado local. Sincronización central pendiente${
            errorCentral ? `: ${errorCentral}` : "."
          }`,
      fecha: new Date().toISOString(),
    },
  };

  const historialOk = guardarHistorialLivianoV2(reporteLocal);
  const actualOk = guardarReporteActualV2(reporteLocal);
  const localOk = historialOk || actualOk;

  logDesarrollo("estado final", {
    codigo,
    localOk,
    centralOk,
    centralPendiente: !centralOk,
  });

  return {
    localOk,
    centralOk,
    centralPendiente: !centralOk,
    errorCentral,
    codigo,
    mensaje: centralOk
      ? `Guardado y sincronizado con ${tablaDestino}.`
      : `Guardado local, sincronización central pendiente${
          errorCentral ? `: ${errorCentral}` : "."
        }`,
    tablaDestino,
    supabaseHabilitado: estadoRepositorio.habilitado,
    supabaseConfigurado: estadoRepositorio.configurado,
    banderaSupabaseActiva: estadoRepositorio.banderaActiva,
  };
}
