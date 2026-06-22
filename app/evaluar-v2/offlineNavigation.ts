"use client";

type DestinoEvaluarV2 = `/evaluar-v2${string}`;

const FLAGS_SELECTOR_PREVENTIVO = [
  "ce_selector_preventivo",
  "selector_preventivo",
] as const;

export function preservarBanderaSelectorPreventivoV2(
  destino: DestinoEvaluarV2
): DestinoEvaluarV2 {
  if (typeof window === "undefined") return destino;

  const destinoTieneBandera = FLAGS_SELECTOR_PREVENTIVO.some((flag) =>
    new URLSearchParams(destino.split("?")[1] || "").get(flag) === "1"
  );
  if (destinoTieneBandera) return destino;

  const parametrosActuales = new URLSearchParams(window.location.search);
  const banderaActiva = FLAGS_SELECTOR_PREVENTIVO.find(
    (flag) => parametrosActuales.get(flag) === "1"
  );
  if (!banderaActiva) return destino;

  const separador = destino.includes("?") ? "&" : "?";
  return `${destino}${separador}${banderaActiva}=1` as DestinoEvaluarV2;
}

export function navegarEvaluarV2(
  router: { push: (destino: string) => void },
  destino: DestinoEvaluarV2
) {
  const destinoConBandera = preservarBanderaSelectorPreventivoV2(destino);

  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    window.location.href = destinoConBandera;
    return;
  }

  router.push(destinoConBandera);
}
