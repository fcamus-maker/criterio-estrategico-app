const CE_CACHE_VERSION = "ce-offline-v5";
const CE_APP_SHELL_CACHE = `${CE_CACHE_VERSION}-shell`;
const CE_RUNTIME_CACHE = `${CE_CACHE_VERSION}-runtime`;

const CORE_ASSETS = [
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

const ENTRADAS_PWA = new Set(["/", "/login"]);

const FLUJO_EVALUAR_V2 = [
  "/evaluar-v2",
  "/evaluar-v2/reportar",
  "/evaluar-v2/evaluacion/paso1",
  "/evaluar-v2/evaluacion/paso2",
  "/evaluar-v2/resultado",
  "/evaluar-v2/informe-final",
];

function esMismoOrigen(url) {
  return url.origin === self.location.origin;
}

function esRutaEvaluarV2(url) {
  return url.pathname === "/evaluar-v2" || url.pathname.startsWith("/evaluar-v2/");
}

function esEntradaPwa(url) {
  return ENTRADAS_PWA.has(url.pathname);
}

function esAssetPropio(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname === "/manifest.webmanifest" ||
    url.pathname === "/logo.png" ||
    url.pathname === "/icon.png" ||
    url.pathname === "/favicon.ico" ||
    url.pathname === "/offline.html"
  );
}

function rutasStaticDesdeHtml(html) {
  const rutas = new Set();
  const expresion = /["'(](\/_next\/static\/[^"'()<>\\\s]+)["')]/g;
  let match = expresion.exec(html);

  while (match) {
    rutas.add(match[1].replace(/&amp;/g, "&"));
    match = expresion.exec(html);
  }

  return Array.from(rutas);
}

async function agregarSeguro(cache, recurso) {
  try {
    const respuesta = await fetch(recurso, { credentials: "same-origin" });
    if (respuesta.ok) {
      await cache.put(recurso, respuesta.clone());
    }
  } catch {
    // La precarga es oportunista; el runtime cache cubre rutas visitadas.
  }
}

async function agregarDocumentoYAssets(cache, recurso) {
  try {
    const respuesta = await fetch(recurso, { credentials: "same-origin" });
    if (!respuesta.ok) return;

    await cache.put(recurso, respuesta.clone());

    const html = await respuesta.text();
    const rutasStatic = rutasStaticDesdeHtml(html);

    await Promise.all(rutasStatic.map((ruta) => agregarSeguro(cache, ruta)));
  } catch {
    // La navegacion offline usara lo que ya exista en cache.
  }
}

async function precargarFlujoEvaluarV2() {
  const cache = await caches.open(CE_APP_SHELL_CACHE);
  await Promise.all([
    ...FLUJO_EVALUAR_V2.map((ruta) => agregarDocumentoYAssets(cache, ruta)),
    ...CORE_ASSETS.filter((ruta) => !FLUJO_EVALUAR_V2.includes(ruta)).map((ruta) =>
      agregarSeguro(cache, ruta)
    ),
  ]);
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CE_APP_SHELL_CACHE).then(async () => {
      await precargarFlujoEvaluarV2();
      await self.skipWaiting();
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(async (keys) => {
      await Promise.all(
        keys
          .filter((key) => key.startsWith("ce-offline-") && !key.startsWith(CE_CACHE_VERSION))
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })
  );
});

async function cachearDocumentoSiCorresponde(cache, request, respuesta) {
  await cache.put(request, respuesta.clone());

  try {
    const html = await respuesta.clone().text();
    const rutasStatic = rutasStaticDesdeHtml(html);
    await Promise.all(rutasStatic.map((ruta) => agregarSeguro(cache, ruta)));
  } catch {
    // Si no es HTML parseable, igual queda cacheada la respuesta principal.
  }
}

async function responderNavegacion(request) {
  const cache = await caches.open(CE_RUNTIME_CACHE);

  try {
    const respuesta = await fetch(request);
    if (respuesta.ok) {
      await cachearDocumentoSiCorresponde(cache, request, respuesta.clone());
    }
    return respuesta;
  } catch {
    const url = new URL(request.url);

    return (
      (await cache.match(request)) ||
      (await caches.match(request)) ||
      (await cache.match(url.pathname)) ||
      (await caches.match(url.pathname)) ||
      (await caches.match("/evaluar-v2")) ||
      (await caches.match("/offline.html")) ||
      new Response(
        "Modo offline activo. Vuelve al inicio del reporte o continua cuando la ruta este disponible.",
        {
          status: 503,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        }
      )
    );
  }
}

async function responderEntradaPwa(request) {
  const cache = await caches.open(CE_RUNTIME_CACHE);

  try {
    const respuesta = await fetch(request);
    if (respuesta.ok) {
      await cachearDocumentoSiCorresponde(cache, request, respuesta.clone());
    }
    return respuesta;
  } catch {
    return (
      (await caches.match("/evaluar-v2")) ||
      (await caches.match("/offline.html")) ||
      new Response(
        "Modo offline activo. Vuelve al inicio del reporte o inicia sesion con internet al menos una vez.",
        {
          status: 503,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        }
      )
    );
  }
}

async function responderAsset(request) {
  const cache = await caches.open(CE_RUNTIME_CACHE);
  const cacheado = await cache.match(request);

  try {
    const respuesta = await fetch(request);
    if (respuesta.ok) {
      await cache.put(request, respuesta.clone());
    }
    return respuesta;
  } catch {
    if (cacheado) return cacheado;

    const cacheShell = await caches.open(CE_APP_SHELL_CACHE);
    const cacheadoShell = await cacheShell.match(request);
    if (cacheadoShell) return cacheadoShell;

    return new Response("", {
      status: 504,
      statusText: "Offline asset unavailable",
    });
  }
}

async function responderRutaInternaNext(request) {
  const url = new URL(request.url);
  const cache = await caches.open(CE_RUNTIME_CACHE);

  try {
    const respuesta = await fetch(request);
    if (respuesta.ok) {
      await cache.put(request, respuesta.clone());
    }
    return respuesta;
  } catch {
    return (
      (await cache.match(request)) ||
      (await caches.match(request)) ||
      (await caches.match(url.pathname)) ||
      (await caches.match("/evaluar-v2")) ||
      (await caches.match("/offline.html")) ||
      new Response(
        "Modo offline activo. Vuelve al inicio del reporte o continua cuando la ruta este disponible.",
        {
          status: 503,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }
      )
    );
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (!esMismoOrigen(url)) return;
  if (url.pathname === "/sw.js") return;

  if (request.mode === "navigate" || request.destination === "document") {
    if (esRutaEvaluarV2(url) || url.pathname === "/offline.html") {
      event.respondWith(responderNavegacion(request));
      return;
    }

    if (esEntradaPwa(url)) {
      event.respondWith(responderEntradaPwa(request));
    }
    return;
  }

  if (esEntradaPwa(url) && url.searchParams.has("_rsc")) {
    event.respondWith(responderRutaInternaNext(request));
    return;
  }

  if (esRutaEvaluarV2(url) && url.searchParams.has("_rsc")) {
    event.respondWith(responderRutaInternaNext(request));
    return;
  }

  if (esRutaEvaluarV2(url) || esAssetPropio(url)) {
    event.respondWith(responderAsset(request));
  }
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "CE_WARM_EVALUAR_V2") {
    event.waitUntil(precargarFlujoEvaluarV2());
  }
});
