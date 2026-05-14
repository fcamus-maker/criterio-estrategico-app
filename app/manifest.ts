import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Reporte de Hallazgos CE",
    short_name: "Hallazgos CE",
    description: "App movil para reporte controlado de hallazgos CE.",
    start_url: "/evaluar-v2",
    scope: "/",
    display: "standalone",
    background_color: "#061327",
    theme_color: "#0b1f3a",
    icons: [
      {
        src: "/logo.png",
        sizes: "641x635",
        type: "image/jpeg",
        purpose: "any",
      },
    ],
  };
}
