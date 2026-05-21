"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type PwaInstallCardProps = {
  theme?: "dark" | "light";
  compact?: boolean;
};

function detectarIos() {
  if (typeof navigator === "undefined") return false;

  const ua = navigator.userAgent.toLowerCase();
  const plataforma = navigator.platform?.toLowerCase() || "";
  const iPadOS = plataforma === "macintel" && navigator.maxTouchPoints > 1;

  return /iphone|ipad|ipod/.test(ua) || iPadOS;
}

function detectarAndroid() {
  if (typeof navigator === "undefined") return false;

  return /android/.test(navigator.userAgent.toLowerCase());
}

function detectarStandalone() {
  if (typeof window === "undefined") return false;

  const navegadorStandalone =
    "standalone" in window.navigator &&
    Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);

  return window.matchMedia("(display-mode: standalone)").matches || navegadorStandalone;
}

export default function PwaInstallCard({
  theme = "dark",
  compact = false,
}: PwaInstallCardProps) {
  const claro = theme === "light";
  const [modalAbierto, setModalAbierto] = useState(false);
  const [promptInstalacion, setPromptInstalacion] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [android, setAndroid] = useState(false);
  const [standalone, setStandalone] = useState(false);
  const [instalando, setInstalando] = useState(false);

  useEffect(() => {
    setIos(detectarIos());
    setAndroid(detectarAndroid());
    setStandalone(detectarStandalone());

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setPromptInstalacion(event as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setStandalone(true);
      setPromptInstalacion(null);
      setModalAbierto(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const instalarAndroid = async () => {
    if (!promptInstalacion || instalando) return;

    setInstalando(true);
    await promptInstalacion.prompt();
    await promptInstalacion.userChoice.catch(() => null);
    setPromptInstalacion(null);
    setInstalando(false);
  };

  if (standalone) {
    return null;
  }

  const cardStyle = {
    borderRadius: compact ? "16px" : "18px",
    border: claro
      ? "1px solid rgba(37,99,235,0.20)"
      : "1px solid rgba(147,197,253,0.22)",
    background: claro
      ? "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(239,246,255,0.84))"
      : "linear-gradient(180deg, rgba(37,99,235,0.18), rgba(255,255,255,0.08))",
    boxShadow: claro
      ? "0 16px 34px rgba(15,23,42,0.12)"
      : "0 18px 34px rgba(0,0,0,0.24)",
    padding: compact ? "13px" : "15px",
    color: claro ? "#0f172a" : "white",
  };

  const modalSurface = {
    width: "min(440px, calc(100vw - 32px))",
    maxHeight: "calc(100vh - 48px)",
    overflowY: "auto" as const,
    borderRadius: "22px",
    border: claro
      ? "1px solid rgba(100,116,139,0.22)"
      : "1px solid rgba(255,255,255,0.16)",
    background: claro
      ? "linear-gradient(180deg, #ffffff, #eef6ff)"
      : "linear-gradient(180deg, #10294c, #061327)",
    boxShadow: "0 28px 70px rgba(0,0,0,0.38)",
    padding: "18px",
    color: claro ? "#0f172a" : "white",
  };

  const pasoStyle = {
    padding: "10px 11px",
    borderRadius: "14px",
    background: claro ? "rgba(248,250,252,0.86)" : "rgba(255,255,255,0.08)",
    border: claro
      ? "1px solid rgba(100,116,139,0.18)"
      : "1px solid rgba(255,255,255,0.12)",
    fontSize: "13px",
    lineHeight: 1.35,
    fontWeight: 800,
  };

  return (
    <>
      <section style={cardStyle}>
        <div style={{ display: "grid", gap: "8px" }}>
          <div style={{ fontSize: compact ? "15px" : "16px", fontWeight: 900 }}>
            Instalar App Criterio Estratégico
          </div>
          <p
            style={{
              margin: 0,
              color: claro ? "rgba(15,23,42,0.72)" : "rgba(255,255,255,0.74)",
              fontSize: "13px",
              lineHeight: 1.35,
              fontWeight: 700,
            }}
          >
            Instale la plataforma como app en este teléfono para acceder al
            reporte móvil y al panel desde el ícono CE.
          </p>
          <button
            type="button"
            onClick={() => setModalAbierto(true)}
            style={{
              marginTop: "2px",
              border: "none",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              color: "white",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 900,
              padding: "12px 14px",
              boxShadow: "0 14px 26px rgba(37,99,235,0.26)",
              touchAction: "manipulation",
            }}
          >
            Instalar App Criterio Estratégico en este teléfono
          </button>
        </div>
      </section>

      {modalAbierto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-install-title"
          onClick={() => setModalAbierto(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 70,
            display: "grid",
            placeItems: "center",
            padding: "16px",
            background: "rgba(2,6,23,0.68)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div onClick={(event) => event.stopPropagation()} style={modalSurface}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                alignItems: "flex-start",
              }}
            >
              <div>
                <div
                  id="pwa-install-title"
                  style={{ fontSize: "20px", fontWeight: 900, lineHeight: 1.15 }}
                >
                  Instalar App Criterio Estratégico
                </div>
                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: "13px",
                    lineHeight: 1.4,
                    color: claro
                      ? "rgba(15,23,42,0.70)"
                      : "rgba(255,255,255,0.74)",
                    fontWeight: 700,
                  }}
                >
                  La app quedará disponible desde el ícono CE del teléfono y se
                  abrirá en modo de aplicación cuando el sistema lo permita.
                </p>
              </div>
              <button
                type="button"
                aria-label="Cerrar instalación"
                onClick={() => setModalAbierto(false)}
                style={{
                  border: claro
                    ? "1px solid rgba(100,116,139,0.22)"
                    : "1px solid rgba(255,255,255,0.18)",
                  borderRadius: "12px",
                  background: claro ? "white" : "rgba(255,255,255,0.10)",
                  color: claro ? "#0f172a" : "white",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 900,
                  minWidth: "38px",
                  height: "38px",
                }}
              >
                X
              </button>
            </div>

            <div style={{ display: "grid", gap: "9px", marginTop: "16px" }}>
              {ios ? (
                <>
                  {[
                    "Abra esta página desde Safari.",
                    "Presione el botón Compartir.",
                    "Seleccione Agregar a pantalla de inicio.",
                    "Confirme el nombre Criterio Estratégico.",
                    "Luego abra la app instalada desde el ícono del teléfono.",
                  ].map((paso) => (
                    <div key={paso} style={pasoStyle}>
                      {paso}
                    </div>
                  ))}
                </>
              ) : android ? (
                <>
                  {promptInstalacion ? (
                    <button
                      type="button"
                      onClick={instalarAndroid}
                      disabled={instalando}
                      style={{
                        border: "none",
                        borderRadius: "14px",
                        background: "linear-gradient(135deg, #67ef48, #d7ff39)",
                        color: "#08172d",
                        cursor: "pointer",
                        fontSize: "15px",
                        fontWeight: 900,
                        padding: "13px",
                        opacity: instalando ? 0.72 : 1,
                      }}
                    >
                      {instalando ? "Preparando instalación..." : "Instalar app"}
                    </button>
                  ) : (
                    <>
                      {[
                        "Abra esta página desde Chrome.",
                        "Abra el menú del navegador.",
                        "Seleccione Instalar app o Agregar a pantalla principal.",
                        "Confirme el nombre Criterio Estratégico.",
                      ].map((paso) => (
                        <div key={paso} style={pasoStyle}>
                          {paso}
                        </div>
                      ))}
                    </>
                  )}
                </>
              ) : (
                <>
                  {[
                    "Abra esta página desde el navegador principal del teléfono.",
                    "Use la opción Instalar app o Agregar a pantalla de inicio.",
                    "Confirme el nombre Criterio Estratégico.",
                  ].map((paso) => (
                    <div key={paso} style={pasoStyle}>
                      {paso}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
