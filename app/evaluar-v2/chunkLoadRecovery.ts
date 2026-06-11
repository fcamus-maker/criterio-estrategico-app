"use client";

export const MENSAJE_CHUNK_STALE =
  "La app se actualizó y Safari conserva una versión anterior. El reporte sigue guardado localmente; recarga la app y vuelve a sincronizar.";

export function esErrorChunkStale(error: unknown) {
  const texto =
    error instanceof Error
      ? `${error.name} ${error.message} ${error.stack || ""}`
      : String(error ?? "");

  return /ChunkLoadError|Loading chunk|Failed to load chunk|failed to fetch dynamically imported module|Importing a module script failed/i.test(
    texto
  );
}
