import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "App Criterio Estratégico",
    short_name: "CE App",
    description:
      "App Criterio Estratégico para gestión preventiva, reportes de hallazgos y panel ejecutivo.",
    start_url: "/evaluar-v2",
    scope: "/",
    display: "standalone",
    background_color: "#061327",
    theme_color: "#0b1f3a",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
