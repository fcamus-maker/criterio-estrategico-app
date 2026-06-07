import {
  crearReporteCentralLivianoV2,
  asegurarOfflineIdReporteV2,
  eliminarEvidenciaLocalV2,
  guardarReporteLocalCompletoV2,
  hidratarReporteConEvidenciasLocalesV2,
  listarReportesPendientesLocalesV2,
  prepararReporteConEvidenciasLocalesV2,
  type EstadoLocalReporteV2,
  type ReporteV2Storage,
  type UltimoIntentoEnvioReporteV2,
} from "../evaluar-v2/storageReporteV2";
import { intentarGuardarReporteV2EnRepositorioCentral } from "./guardarReporteV2Central";
import {
  obtenerEstadoRepositorioCentral,
  obtenerTablaDestinoHallazgosCentral,
  subirEvidenciaHallazgo,
} from "../repositories/hallazgosCentralRepository";
import { rolPuedeEntrarEvaluarV2CE } from "./authAccess";
import { obtenerAuthProfileActual } from "./authProfileService";

export type ResultadoGuardadoReporteV2 = {
  offlineId: string;
  estadoLocal: EstadoLocalReporteV2;
  localOk: boolean;
  respaldoLocalCompletoOk: boolean;
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

export type ResultadoSincronizacionPendientesV2 = {
  total: number;
  sincronizados: number;
  pendientes: number;
  errores: number;
  resultados: ResultadoGuardadoReporteV2[];
  mensaje: string;
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

function navegadorSinConexion() {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

function resolverEstadoLocalFinal(
  centralOk: boolean,
  evidenciasPendientes: number,
  errorCentral?: string
): EstadoLocalReporteV2 {
  if (centralOk && evidenciasPendientes === 0) return "sincronizado";
  if (errorCentral) return "error";
  return "pendiente";
}

async function validarSesionReporteMovil() {
  const auth = await obtenerAuthProfileActual();

  if (!auth.autenticado) {
    return {
      ok: false as const,
      mensaje:
        auth.error ||
        "Debes iniciar sesion para guardar y subir evidencias fotograficas.",
    };
  }

  if (!auth.perfil) {
    return {
      ok: false as const,
      mensaje:
        auth.error ||
        "La sesion esta activa, pero no hay perfil habilitado para reportar.",
    };
  }

  if (!rolPuedeEntrarEvaluarV2CE(auth.perfil.rol)) {
    return {
      ok: false as const,
      mensaje: "Tu rol no esta habilitado para reportar desde la app movil.",
    };
  }

  return {
    ok: true as const,
    rol: auth.perfil.rol,
  };
}

function extensionDesdeFoto(nombre?: string, tipo?: string) {
  if (tipo === "image/jpeg") return "jpg";
  if (tipo === "image/png") return "png";
  if (tipo === "image/webp") return "webp";

  const extensionNombre = String(nombre || "")
    .split(".")
    .pop()
    ?.toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  if (extensionNombre && extensionNombre.length <= 5) return extensionNombre;
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

  logDesarrollo("Storage evidencias preparacion", {
    codigo,
    total: fotos.length,
    conDataUrl: fotos.filter((foto) => Boolean(foto.dataUrl)).length,
    conStoragePath: fotos.filter((foto) => Boolean(foto.storagePath)).length,
    conLocalBlobKey: fotos.filter((foto) => Boolean(foto.localBlobKey)).length,
  });

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
      fechaCaptura: foto.fechaCaptura || foto.fechaCarga || new Date().toISOString(),
      intentos: foto.intentos || 0,
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
        fechaSubida: foto.fechaSubida || foto.fechaCarga || new Date().toISOString(),
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
        error: foto.localBlobKey
          ? "Evidencia pendiente: imagen local no disponible para subir en este intento."
          : "Evidencia pendiente sin respaldo local recuperable.",
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
        evidenciaId,
        nombre,
        tipo,
        tamanoBytes: archivo.size,
        localBlobKey: foto.localBlobKey,
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
          pesoBytes: archivo.size,
          estadoSubida: "subida" as const,
          storagePendiente: false,
          fechaSubida: new Date().toISOString(),
          fechaCarga: new Date().toISOString(),
          intentos: (foto.intentos || 0) + 1,
        };
        const { dataUrl, ...metadataCentral } = metadata;
        void dataUrl;
        fotosCentral.push(metadataCentral);
        fotosLocal.push({ ...metadata, dataUrl: foto.dataUrl });
        await eliminarEvidenciaLocalV2(foto.localBlobKey);
        logDesarrollo("Storage evidencia OK", {
          codigo,
          indice,
          evidenciaId,
          bucket: resultado.data.bucket,
          storagePath: resultado.data.storagePath,
        });
      } else {
        pendientes += 1;
        errores.push(resultado.error);
        const metadata = {
          ...metadataBase,
          bucket: "hallazgos-evidencias",
          tamanoBytes: archivo.size,
          pesoBytes: archivo.size,
          estadoSubida: foto.localBlobKey ? ("pendiente" as const) : ("error" as const),
          storagePendiente: true,
          intentos: (foto.intentos || 0) + 1,
          error: resultado.error,
        };
        const { dataUrl, ...metadataCentral } = metadata;
        void dataUrl;
        fotosCentral.push(metadataCentral);
        fotosLocal.push({ ...metadata, dataUrl: foto.dataUrl });
        logDesarrollo("Storage evidencia ERROR", {
          codigo,
          indice,
          evidenciaId,
          localBlobKey: foto.localBlobKey,
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
        estadoSubida: foto.localBlobKey ? ("pendiente" as const) : ("error" as const),
        storagePendiente: true,
        intentos: (foto.intentos || 0) + 1,
        error: mensaje,
      };
      const { dataUrl, ...metadataCentral } = metadata;
      void dataUrl;
      fotosCentral.push(metadataCentral);
      fotosLocal.push({ ...metadata, dataUrl: foto.dataUrl });
      logDesarrollo("Storage evidencia ERROR", {
        codigo,
        indice,
        evidenciaId,
        localBlobKey: foto.localBlobKey,
        error: mensaje,
      });
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
  const reportePreparado: ReporteV2Storage = {
    ...(await prepararReporteConEvidenciasLocalesV2(
      await hidratarReporteConEvidenciasLocalesV2(reporte)
    )).reporte,
    estado: "abierto",
    estadoCierre: "abierto",
    fechaGuardado,
  };
  const intentoInicial: UltimoIntentoEnvioReporteV2 = {
    fecha: fechaGuardado,
    estado: "pendiente",
    canal: "guardar-y-enviar",
    mensaje: "Respaldo local completo creado antes del intento online.",
  };
  const respaldoInicial = await guardarReporteLocalCompletoV2(
    asegurarOfflineIdReporteV2(reportePreparado),
    "pendiente",
    intentoInicial
  );
  const reporteBase: ReporteV2Storage = respaldoInicial.reporte;

  logDesarrollo("inicio", {
    codigo,
    offlineId: respaldoInicial.reporte.offlineId,
    empresa: reporteBase.empresa,
    obra: reporteBase.obra,
    fotos: Array.isArray(reporteBase.fotos) ? reporteBase.fotos.length : 0,
    tablaDestino,
    supabaseHabilitado: estadoRepositorio.habilitado,
    supabaseConfigurado: estadoRepositorio.configurado,
    banderaSupabaseActiva: estadoRepositorio.banderaActiva,
  });

  const sesionReporte = await validarSesionReporteMovil();

  if (!sesionReporte.ok) {
    const fotos = Array.isArray(reporteBase.fotos) ? reporteBase.fotos : [];
    const evidenciasPendientes = fotos.filter(
      (foto) => foto.dataUrl || foto.storagePath || foto.localBlobKey
    ).length;
    const mensaje = sesionReporte.mensaje;
    const reporteLocal: ReporteV2Storage = {
      ...reporteBase,
      sincronizacionCentral: {
        estado: "pendiente",
        mensaje,
        fecha: new Date().toISOString(),
      },
    };
    const respaldoFinal = await guardarReporteLocalCompletoV2(
      reporteLocal,
      "pendiente",
      {
        fecha: new Date().toISOString(),
        estado: "pendiente",
        canal: "sesion",
        mensaje,
        error: mensaje,
        evidenciasIntentadas: evidenciasPendientes,
        evidenciasSubidas: 0,
        evidenciasPendientes,
        centralOk: false,
      }
    );
    const localOk =
      respaldoFinal.ok ||
      respaldoFinal.localStorageOk ||
      respaldoInicial.ok ||
      respaldoInicial.localStorageOk;

    logDesarrollo("sesion requerida para subir evidencias", {
      codigo,
      offlineId: respaldoFinal.reporte.offlineId,
      evidenciasPendientes,
      respaldoLocalCompletoOk: respaldoFinal.ok,
      error: mensaje,
    });

    return {
      offlineId: respaldoFinal.reporte.offlineId,
      estadoLocal: "pendiente",
      localOk,
      respaldoLocalCompletoOk: respaldoFinal.ok,
      centralOk: false,
      centralPendiente: true,
      evidenciasIntentadas: evidenciasPendientes,
      evidenciasSubidas: 0,
      evidenciasPendientes,
      errorCentral: mensaje,
      errorEvidencias: mensaje,
      codigo,
      mensaje,
      tablaDestino,
      supabaseHabilitado: estadoRepositorio.habilitado,
      supabaseConfigurado: estadoRepositorio.configurado,
      banderaSupabaseActiva: estadoRepositorio.banderaActiva,
    };
  }

  logDesarrollo("sesion reporte movil OK", {
    codigo,
    rol: sesionReporte.rol,
  });

  if (navegadorSinConexion()) {
    const fotos = Array.isArray(reporteBase.fotos) ? reporteBase.fotos : [];
    const evidenciasPendientes = fotos.filter(
      (foto) => foto.dataUrl || foto.storagePath || foto.localBlobKey
    ).length;
    const mensaje = "Guardado localmente. Sincronización pendiente.";
    const ultimoIntentoEnvio: UltimoIntentoEnvioReporteV2 = {
      fecha: new Date().toISOString(),
      estado: "pendiente",
      canal: "local",
      mensaje,
      evidenciasIntentadas: 0,
      evidenciasSubidas: 0,
      evidenciasPendientes,
      centralOk: false,
    };
    const respaldoFinal = await guardarReporteLocalCompletoV2(
      {
        ...reporteBase,
        sincronizacionCentral: {
          estado: "pendiente",
          mensaje,
          fecha: ultimoIntentoEnvio.fecha,
        },
      },
      "pendiente",
      ultimoIntentoEnvio
    );
    const localOk =
      respaldoFinal.ok ||
      respaldoFinal.localStorageOk ||
      respaldoInicial.ok ||
      respaldoInicial.localStorageOk;

    logDesarrollo("offline local pendiente", {
      codigo,
      offlineId: respaldoFinal.reporte.offlineId,
      evidenciasPendientes,
      localOk,
      respaldoLocalCompletoOk: respaldoFinal.ok,
    });

    return {
      offlineId: respaldoFinal.reporte.offlineId,
      estadoLocal: "pendiente",
      localOk,
      respaldoLocalCompletoOk: respaldoFinal.ok,
      centralOk: false,
      centralPendiente: true,
      evidenciasIntentadas: 0,
      evidenciasSubidas: 0,
      evidenciasPendientes,
      codigo,
      mensaje,
      tablaDestino,
      supabaseHabilitado: estadoRepositorio.habilitado,
      supabaseConfigurado: estadoRepositorio.configurado,
      banderaSupabaseActiva: estadoRepositorio.banderaActiva,
    };
  }

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

  const estadoLocalFinal = resolverEstadoLocalFinal(
    centralOk,
    evidenciasStorage.pendientes,
    errorCentral
  );
  const mensajeFinal = centralOk
    ? evidenciasStorage.pendientes > 0
      ? `Guardado y sincronizado con ${tablaDestino}. Evidencia pendiente de sincronización: ${evidenciasStorage.pendientes}.`
      : `Guardado y sincronizado con ${tablaDestino}. Evidencia subida OK: ${evidenciasStorage.subidas}.`
    : `Guardado local, sincronización central pendiente${
        errorCentral ? `: ${errorCentral}` : "."
      }`;
  const ultimoIntentoEnvio: UltimoIntentoEnvioReporteV2 = {
    fecha: new Date().toISOString(),
    estado: estadoLocalFinal,
    canal: errorCentral
      ? "central"
      : evidenciasStorage.pendientes > 0
        ? "storage"
        : "guardar-y-enviar",
    mensaje: mensajeFinal,
    error: errorCentral || evidenciasStorage.error,
    evidenciasIntentadas: evidenciasStorage.intentadas,
    evidenciasSubidas: evidenciasStorage.subidas,
    evidenciasPendientes: evidenciasStorage.pendientes,
    centralOk,
  };
  const reporteLocal: ReporteV2Storage = {
    ...reporteBaseConEvidencias,
    offlineId: respaldoInicial.reporte.offlineId,
    estadoLocal: estadoLocalFinal,
    ultimoIntentoEnvio,
    sincronizacionCentral: {
      estado:
        centralOk && evidenciasStorage.pendientes === 0
          ? "sincronizado"
          : "pendiente",
      mensaje: mensajeFinal,
      fecha: ultimoIntentoEnvio.fecha,
    },
  };
  const respaldoFinal = await guardarReporteLocalCompletoV2(
    reporteLocal,
    estadoLocalFinal,
    ultimoIntentoEnvio
  );
  const localOk =
    respaldoFinal.ok ||
    respaldoFinal.localStorageOk ||
    respaldoInicial.ok ||
    respaldoInicial.localStorageOk;

  logDesarrollo("estado final", {
    codigo,
    offlineId: respaldoFinal.reporte.offlineId,
    estadoLocal: estadoLocalFinal,
    localOk,
    respaldoLocalCompletoOk: respaldoFinal.ok,
    centralOk,
    centralPendiente: !centralOk,
  });

  return {
    offlineId: respaldoFinal.reporte.offlineId,
    estadoLocal: estadoLocalFinal,
    localOk,
    respaldoLocalCompletoOk: respaldoFinal.ok,
    centralOk,
    centralPendiente: !centralOk,
    evidenciasIntentadas: evidenciasStorage.intentadas,
    evidenciasSubidas: evidenciasStorage.subidas,
    evidenciasPendientes: evidenciasStorage.pendientes,
    errorCentral,
    errorEvidencias: evidenciasStorage.error,
    codigo,
    mensaje: mensajeFinal,
    tablaDestino,
    supabaseHabilitado: estadoRepositorio.habilitado,
    supabaseConfigurado: estadoRepositorio.configurado,
    banderaSupabaseActiva: estadoRepositorio.banderaActiva,
  };
}

export async function sincronizarReportesPendientesV2(): Promise<
  ResultadoSincronizacionPendientesV2
> {
  if (navegadorSinConexion()) {
    return {
      total: 0,
      sincronizados: 0,
      pendientes: 0,
      errores: 0,
      resultados: [],
      mensaje: "Sin conexión. Mantén los reportes pendientes y vuelve a intentar.",
    };
  }

  const pendientesLocales = await listarReportesPendientesLocalesV2();
  const resultados: ResultadoGuardadoReporteV2[] = [];

  for (const reporte of pendientesLocales) {
    const resultado = await guardarReporteV2Completo(reporte);
    resultados.push(resultado);
  }

  const sincronizados = resultados.filter(
    (resultado) => resultado.estadoLocal === "sincronizado"
  ).length;
  const errores = resultados.filter(
    (resultado) => resultado.estadoLocal === "error"
  ).length;
  const pendientes = Math.max(resultados.length - sincronizados - errores, 0);

  return {
    total: pendientesLocales.length,
    sincronizados,
    pendientes,
    errores,
    resultados,
    mensaje:
      pendientesLocales.length === 0
        ? "No hay reportes pendientes de sincronización."
        : `Sincronización finalizada. OK: ${sincronizados}. Pendientes: ${pendientes}. Error: ${errores}.`,
  };
}
