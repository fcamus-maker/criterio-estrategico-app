"use client";

import { useEffect } from "react";

const CACHE_SHELL_OFFLINE = "ce-offline-v3-shell";
const RUTAS_EVALUAR_V2 = [
  "/offline.html",
  "/",
  "/login",
  "/evaluar-v2",
  "/evaluar-v2/reportar",
  "/evaluar-v2/evaluacion/paso1",
  "/evaluar-v2/evaluacion/paso2",
  "/evaluar-v2/resultado",
  "/evaluar-v2/informe-final",
  "/manifest.webmanifest",
  "/logo.png",
  "/icon.png",
  "/favicon.ico",
];

function extraerRutasStatic(html: string) {
  const rutas = new Set<string>();
  const expresion = /["'(](\/_next\/static\/[^"'()<>\\\s]+)["')]/g;
  let match = expresion.exec(html);

  while (match) {
    rutas.add(match[1].replace(/&amp;/g, "&"));
    match = expresion.exec(html);
  }

  return Array.from(rutas);
}

async function cachearRecurso(cache: Cache, recurso: string) {
  try {
    const respuesta = await fetch(recurso, { credentials: "same-origin" });
    if (respuesta.ok) {
      await cache.put(recurso, respuesta.clone());
    }
    return respuesta;
  } catch {
    return null;
  }
}

async function precalentarFlujoOffline() {
  if (
    typeof window === "undefined" ||
    typeof caches === "undefined" ||
    navigator.onLine === false
  ) {
    return;
  }

  const cache = await caches.open(CACHE_SHELL_OFFLINE);

  for (const ruta of RUTAS_EVALUAR_V2) {
    const respuesta = await cachearRecurso(cache, ruta);
    const contentType = respuesta?.headers.get("content-type") || "";

    if (!respuesta || !contentType.includes("text/html")) continue;

    const html = await respuesta.clone().text();
    await Promise.all(
      extraerRutasStatic(html).map((asset) => cachearRecurso(cache, asset))
    );
  }
}

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      process.env.NODE_ENV === "development"
    ) {
      return;
    }

    const registrar = async () => {
      try {
        const registro = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });
        void registro.update();
        const listo = await navigator.serviceWorker.ready;
        listo.active?.postMessage({ type: "CE_WARM_EVALUAR_V2" });
        void precalentarFlujoOffline();
      } catch (error) {
        console.warn("No se pudo registrar el service worker CE.", error);
      }
    };

    void registrar();
  }, []);

  return null;
}
