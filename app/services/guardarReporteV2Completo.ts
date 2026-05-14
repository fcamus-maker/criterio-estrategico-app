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
  subirEvidenciaHallazgo,
} from "../repositories/hallazgosCentralRepository";

export type ResultadoGuardadoReporteV2 = {
  localOk: boolean;
  centralOk: boolean;
  centralPendiente: boolean;
  evidenciasIntentadas: number;
  evidenciasSubidas: number;
  evidenciasPendientes: number;
  errorCentral?: string;
  errorEvidencias?: string;
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
  return String(error || "Error desconocido").slice(0, 240);
}

function extensionDesdeFoto(nombre?: string, tipo?: string) {
  const extensionNombre = String(nombre || "")
    .split(".")
    .pop()
    ?.toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  if (extensionNombre && extensionNombre.length <= 5) return extensionNombre;
  if (tipo === "image/png") return "png";
  if (tipo === "image/webp") return "webp";
  return "jpg";
}

async function dataUrlABlob(dataUrl: string, tipoFallback: string) {
  const respuesta = await fetch(dataUrl);
  const blob = await respuesta.blob();

  if (blob.type) return blob;
  return blob.slice(0, blob.size, tipoFallback);
}

async function prepararEvidenciasStorage(
  reporte: ReporteV2Storage,
  codigo: string
) {
  const fotos = Array.isArray(reporte.fotos) ? reporte.fotos : [];
  const fotosCentral: ReporteV2Storage["fotos"] = [];
  const fotosLocal: ReporteV2Storage["fotos"] = [];
  let subidas = 0;
  let pendientes = 0;
  const errores: string[] = [];

  for (const [index, foto] of fotos.entries()) {
    const indice = index + 1;
    const idBase = foto.id || `foto-${indice}`;
    const evidenciaId = `${String(indice).padStart(2, "0")}-${idBase}-${Date.now()}`;
    const tipo = foto.tipo || "image/jpeg";
    const nombre = foto.nombre || `fotografia-${indice}.jpg`;
    const metadataBase = {
      ...foto,
      id: foto.id || evidenciaId,
      nombre,
      tipo,
      indice,
      origen: "mobile-v2" as const,
      fechaCarga: foto.fechaCarga || new Date().toISOString(),
    };

    if (foto.storagePath) {
      subidas += 1;
      const metadata = {
        ...metadataBase,
        bucket: foto.bucket || "hallazgos-evidencias",
        storagePath: foto.storagePath,
        url: foto.url,
        estadoSubida: "subida" as const,
        storagePendiente: false,
      };
      const { dataUrl, ...metadataCentral } = metadata;
      void dataUrl;
      fotosCentral.push(metadataCentral);
      fotosLocal.push({ ...metadata, dataUrl: foto.dataUrl });
      continue;
    }

    if (!foto.dataUrl) {
      pendientes += 1;
      const metadata = {
        ...metadataBase,
        estadoSubida: "pendiente" as const,
        storagePendiente: true,
      };
      fotosCentral.push(metadata);
      fotosLocal.push(metadata);
      continue;
    }

    try {
      const archivo = await dataUrlABlob(foto.dataUrl, tipo);
      logDesarrollo("Storage evidencia intentando", {
        codigo,
        indice,
        nombre,
        tipo,
        tamanoBytes: archivo.size,
      });

      const resultado = await subirEvidenciaHallazgo({
        codigo,
        evidenciaId,
        archivo,
        contentType: tipo,
        empresa: reporte.empresa,
        obra: reporte.obra,
        extension: extensionDesdeFoto(nombre, tipo),
      });

      if (resultado.ok) {
        subidas += 1;
        const metadata = {
          ...metadataBase,
          bucket: resultado.data.bucket,
          storagePath: resultado.data.storagePath,
          url: resultado.data.url,
          tamanoBytes: archivo.size,
          estadoSubida: "subida" as const,
          storagePendiente: false,
          fechaCarga: new Date().toISOString(),
        };
        const { dataUrl, ...metadataCentral } = metadata;
        void dataUrl;
        fotosCentral.push(metadataCentral);
        fotosLocal.push({ ...metadata, dataUrl: foto.dataUrl });
        logDesarrollo("Storage evidencia OK", {
          codigo,
          indice,
          storagePath: resultado.data.storagePath,
        });
      } else {
        pendientes += 1;
        errores.push(resultado.error);
        const metadata = {
          ...metadataBase,
          bucket: "hallazgos-evidencias",
          tamanoBytes: archivo.size,
          estadoSubida: "error" as const,
          storagePendiente: true,
          error: resultado.error,
        };
        const { dataUrl, ...metadataCentral } = metadata;
        void dataUrl;
        fotosCentral.push(metadataCentral);
        fotosLocal.push({ ...metadata, dataUrl: foto.dataUrl });
        logDesarrollo("Storage evidencia ERROR", {
          codigo,
          indice,
          error: resultado.error,
        });
      }
    } catch (error) {
      pendientes += 1;
      const mensaje = sanitizarError(error);
      errores.push(mensaje);
      const metadata = {
        ...metadataBase,
        bucket: "hallazgos-evidencias",
        estadoSubida: "error" as const,
        storagePendiente: true,
        error: mensaje,
      };
      const { dataUrl, ...metadataCentral } = metadata;
      void dataUrl;
      fotosCentral.push(metadataCentral);
      fotosLocal.push({ ...metadata, dataUrl: foto.dataUrl });
      logDesarrollo("Storage evidencia ERROR", { codigo, indice, error: mensaje });
    }
  }

  return {
    reporteCentral: {
      ...reporte,
      fotos: fotosCentral,
    },
    reporteLocal: {
      ...reporte,
      fotos: fotosLocal,
    },
    intentadas: fotos.filter((foto) => foto.dataUrl || foto.storagePath).length,
    subidas,
    pendientes,
    error: errores[0],
  };
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

  const evidenciasStorage = await prepararEvidenciasStorage(reporteBase, codigo);
  const reporteBaseConEvidencias = evidenciasStorage.reporteLocal;
  const reporteCentral = crearReporteCentralLivianoV2(
    evidenciasStorage.reporteCentral
  );
  logDesarrollo("payload central listo", {
    codigo,
    tablaDestino,
    payloadSinBase64: true,
    evidencias: Array.isArray(reporteCentral.fotos)
      ? reporteCentral.fotos.length
      : 0,
    evidenciasSubidas: evidenciasStorage.subidas,
    evidenciasPendientes: evidenciasStorage.pendientes,
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
    ...reporteBaseConEvidencias,
    sincronizacionCentral: {
      estado: centralOk ? "sincronizado" : "pendiente",
    mensaje: centralOk
      ? evidenciasStorage.pendientes > 0
        ? `Guardado y sincronizado con ${tablaDestino}. Evidencia pendiente de sincronización: ${evidenciasStorage.pendientes}.`
        : `Guardado y sincronizado con ${tablaDestino}. Evidencia subida OK: ${evidenciasStorage.subidas}.`
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
    evidenciasIntentadas: evidenciasStorage.intentadas,
    evidenciasSubidas: evidenciasStorage.subidas,
    evidenciasPendientes: evidenciasStorage.pendientes,
    errorCentral,
    errorEvidencias: evidenciasStorage.error,
    codigo,
    mensaje: centralOk
      ? evidenciasStorage.pendientes > 0
        ? `Guardado y sincronizado con ${tablaDestino}. Evidencia pendiente de sincronización: ${evidenciasStorage.pendientes}.`
        : `Guardado y sincronizado con ${tablaDestino}. Evidencia subida OK: ${evidenciasStorage.subidas}.`
      : `Guardado local, sincronización central pendiente${
          errorCentral ? `: ${errorCentral}` : "."
        }`,
    tablaDestino,
    supabaseHabilitado: estadoRepositorio.habilitado,
    supabaseConfigurado: estadoRepositorio.configurado,
    banderaSupabaseActiva: estadoRepositorio.banderaActiva,
  };
}
