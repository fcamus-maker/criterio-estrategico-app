import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://app.criterioestrategico.cl"),
  title: {
    default: "Plataforma de Hallazgos | Criterio Estratégico",
    template: "%s | Criterio Estratégico",
  },
  description:
    "Gestión ejecutiva de hallazgos, seguimiento de cierre, mapa GPS y KPI gerencial.",
  applicationName: "Criterio Estratégico",
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: "/login",
    siteName: "Criterio Estratégico",
    title: "Plataforma de Hallazgos | Criterio Estratégico",
    description:
      "Gestión ejecutiva de hallazgos, seguimiento de cierre, mapa GPS y KPI gerencial.",
    images: [
      {
        url: "/logo.png",
        width: 641,
        height: 635,
        alt: "Criterio Estratégico",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Plataforma de Hallazgos | Criterio Estratégico",
    description:
      "Gestión ejecutiva de hallazgos, seguimiento de cierre, mapa GPS y KPI gerencial.",
    images: ["/logo.png"],
  },
  appleWebApp: {
    capable: true,
    title: "Plataforma de Hallazgos",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/icon.png",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0b1f3a",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
