import type { EvidenciaHallazgoCentral } from "../types/hallazgoCentral";

export type EvidenciaPanel = {
  id?: string;
  nombre?: string;
  tipo?: string;
  bucket?: string;
  url?: string;
  storagePath?: string;
  estadoSubida?: string;
  descripcion?: string;
  fechaCaptura?: string;
  fechaSubida?: string;
  origen?: string;
  error?: string;
  intentos?: number;
  localBlobKey?: string;
  rechazada?: boolean;
  disponibleVisualmente: boolean;
  mensajeVisualizacion: string;
};

type HallazgoConEvidencias = {
  fotos?: string[];
  evidenciasPanel?: EvidenciaPanel[];
};

function texto(valor: unknown, fallback = "") {
  const limpio = String(valor ?? "").trim();
  return limpio || fallback;
}

function incluyeRechazo(valor: unknown) {
  const limpio = texto(valor).toLowerCase();
  return limpio.includes("rechaz");
}

export function normalizarEvidenciasPanel(
  evidencias: EvidenciaHallazgoCentral[] | undefined
): EvidenciaPanel[] {
  const vistas: EvidenciaPanel[] = [];
  const claves = new Set<string>();

  for (const evidencia of evidencias || []) {
    const url = texto(evidencia.url || evidencia.dataUrl);
    const storagePath = texto(evidencia.storagePath);
    const nombre = texto(evidencia.nombre);
    const clave = url || storagePath || nombre || texto(evidencia.id);

    if (!clave || claves.has(clave)) continue;
    claves.add(clave);

    const disponibleVisualmente = Boolean(url);
    const estadoSubida = texto(evidencia.estadoSubida);
    const descripcion = texto(evidencia.descripcion);
    const error = texto(evidencia.error);
    const rechazada = [estadoSubida, descripcion, error].some(incluyeRechazo);
    const mensajeVisualizacion = disponibleVisualmente
      ? "Evidencia fotográfica disponible."
      : estadoSubida === "pendiente" || estadoSubida === "subiendo"
        ? "Evidencia pendiente de sincronización."
        : estadoSubida === "error"
          ? "Evidencia registrada con error de sincronización."
          : storagePath
            ? "No se pudo generar una visualización temporal de esta evidencia."
            : "Evidencia registrada, pendiente de visualización.";

    vistas.push({
      id: texto(evidencia.id),
      nombre,
      tipo: texto(evidencia.tipo),
      bucket: texto(evidencia.bucket),
      url,
      storagePath,
      estadoSubida,
      descripcion,
      fechaCaptura: texto(evidencia.fechaCaptura),
      fechaSubida: texto(evidencia.fechaSubida || evidencia.fechaCarga || evidencia.capturedAt),
      origen: texto(evidencia.origenDeclarado || evidencia.origen),
      error,
      intentos: evidencia.intentos,
      localBlobKey: texto(evidencia.localBlobKey),
      rechazada,
      disponibleVisualmente,
      mensajeVisualizacion,
    });
  }

  return vistas;
}

export function obtenerEvidenciasPanel(
  hallazgo: HallazgoConEvidencias | null | undefined
): EvidenciaPanel[] {
  if (!hallazgo) return [];

  const evidencias = [...(hallazgo.evidenciasPanel || [])];
  const claves = new Set(
    evidencias.map((evidencia) => evidencia.url || evidencia.storagePath || evidencia.nombre)
  );

  for (const foto of hallazgo.fotos || []) {
    const url = texto(foto);
    if (!url || claves.has(url)) continue;

    claves.add(url);
    evidencias.push({
      url,
      disponibleVisualmente: true,
      mensajeVisualizacion: "Evidencia fotográfica disponible.",
    });
  }

  return evidencias;
}

export function resumenEvidenciasPanel(hallazgo: HallazgoConEvidencias) {
  const evidencias = obtenerEvidenciasPanel(hallazgo);
  const visibles = evidencias.filter((evidencia) => evidencia.disponibleVisualmente);

  return {
    evidencias,
    total: evidencias.length,
    visibles: visibles.length,
    pendientesVisualizacion: evidencias.length - visibles.length,
  };
}
