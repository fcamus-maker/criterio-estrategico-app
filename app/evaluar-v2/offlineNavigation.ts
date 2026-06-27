"use client";

type DestinoEvaluarV2 = `/evaluar-v2${string}`;

const FLAG_MATRIZ_UNIVERSAL = "ce_matriz_universal";
const FLAG_FLUJO_LEGACY = "ce_flujo_legacy";
const FLAGS_SELECTOR_PREVENTIVO = ["ce_selector_preventivo", "selector_preventivo"] as const;

export function flujoLegacySolicitadoEnUrlV2() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get(FLAG_FLUJO_LEGACY) === "1";
}

export function matrizUniversalSolicitadaEnUrlV2() {
  if (typeof window === "undefined") return true;
  const parametros = new URLSearchParams(window.location.search);
  if (parametros.get(FLAG_FLUJO_LEGACY) === "1") return false;
  return true;
}

export function preservarBanderaSelectorPreventivoV2(
  destino: DestinoEvaluarV2
): DestinoEvaluarV2 {
  if (typeof window === "undefined") return destino;

  const parametrosDestino = new URLSearchParams(destino.split("?")[1] || "");
  const destinoTieneLegacy = parametrosDestino.get(FLAG_FLUJO_LEGACY) === "1";
  if (destinoTieneLegacy) return destino;

  const parametrosActuales = new URLSearchParams(window.location.search);
  const legacyActivo = parametrosActuales.get(FLAG_FLUJO_LEGACY) === "1";
  if (legacyActivo) {
    const separador = destino.includes("?") ? "&" : "?";
    return `${destino}${separador}${FLAG_FLUJO_LEGACY}=1` as DestinoEvaluarV2;
  }

  const destinoTieneMatriz = parametrosDestino.get(FLAG_MATRIZ_UNIVERSAL) === "1";
  if (destinoTieneMatriz) return destino;

  const matrizUniversalActiva = parametrosActuales.get(FLAG_MATRIZ_UNIVERSAL) === "1";
  if (matrizUniversalActiva) {
    const separador = destino.includes("?") ? "&" : "?";
    return `${destino}${separador}${FLAG_MATRIZ_UNIVERSAL}=1` as DestinoEvaluarV2;
  }

  const destinoTieneBanderaSelector = FLAGS_SELECTOR_PREVENTIVO.some((flag) =>
    parametrosDestino.get(flag) === "1"
  );
  if (destinoTieneBanderaSelector) return destino;

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
