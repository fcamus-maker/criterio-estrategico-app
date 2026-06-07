"use client";

export function navegarEvaluarV2(
  router: { push: (destino: string) => void },
  destino: `/evaluar-v2${string}`
) {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    window.location.href = destino;
    return;
  }

  router.push(destino);
}
