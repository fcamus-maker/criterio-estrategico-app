import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Criterio Estratégico",
    short_name: "CE App",
    description:
      "App Criterio Estratégico para gestión preventiva, reportes de hallazgos y panel ejecutivo.",
    start_url: "/login",
    scope: "/",
    display: "standalone",
    background_color: "#061327",
    theme_color: "#0b1f3a",
    orientation: "portrait",
    icons: [
      {
        src: "/icon.png",
        sizes: "1254x1254",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon.png",
        sizes: "1254x1254",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
