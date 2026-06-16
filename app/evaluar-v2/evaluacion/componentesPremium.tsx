"use client";

import { useEffect, type CSSProperties, type ReactNode } from "react";
import { etapasEvaluacion } from "./evaluacionPremium";

export function PremiumMobileViewport() {
  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;
    const estilosPrevios = {
      bodyBackground: body.style.background,
      bodyOverscrollBehaviorY: body.style.overscrollBehaviorY,
      htmlBackground: html.style.background,
      htmlOverscrollBehaviorY: html.style.overscrollBehaviorY,
    };

    body.style.background = "#020b1f";
    body.style.overscrollBehaviorY = "none";
    html.style.background = "#020b1f";
    html.style.overscrollBehaviorY = "none";

    return () => {
      body.style.background = estilosPrevios.bodyBackground;
      body.style.overscrollBehaviorY = estilosPrevios.bodyOverscrollBehaviorY;
      html.style.background = estilosPrevios.htmlBackground;
      html.style.overscrollBehaviorY = estilosPrevios.htmlOverscrollBehaviorY;
    };
  }, []);

  return null;
}

export function HeaderReportePremium({
  subtitulo,
  detalle,
}: {
  subtitulo?: string;
  detalle?: string;
}) {
  return (
    <header style={{ textAlign: "center", marginBottom: "14px" }}>
      <div
        aria-label="Logo Criterio Estratégico"
        style={{
          width: "68px",
          height: "68px",
          margin: "0 auto 5px",
          backgroundColor: "transparent",
          backgroundImage: "url('/assets/logo-ce.png')",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
          filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.44))",
        }}
      />
      <div
        style={{
          fontSize: "13px",
          fontWeight: 850,
          color: "rgba(230,240,255,0.72)",
          textShadow: "0 2px 10px rgba(0,0,0,0.35)",
        }}
      >
        Criterio Estratégico
      </div>
      <h1
        style={{
          margin: "5px 0 0",
          fontSize: "24px",
          lineHeight: 1.06,
          fontWeight: 950,
          letterSpacing: "0",
          textShadow: "0 2px 16px rgba(0,0,0,0.38)",
        }}
      >
        REPORTE DE HALLAZGOS
      </h1>
      {subtitulo && (
        <div
          style={{
            marginTop: "4px",
            fontSize: "14px",
            fontWeight: 850,
            color: "rgba(235,243,255,0.86)",
          }}
        >
          {subtitulo}
        </div>
      )}
      {detalle && (
        <p
          style={{
            margin: "5px auto 0",
            maxWidth: "330px",
            fontSize: "12px",
            lineHeight: 1.25,
            color: "rgba(225,236,255,0.62)",
            fontWeight: 700,
          }}
        >
          {detalle}
        </p>
      )}
    </header>
  );
}

export function EtapasPremium({ actual }: { actual: number }) {
  return (
    <section
      aria-label="Etapas de evaluación"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
        alignItems: "start",
        gap: "0",
        margin: "0 0 14px",
        position: "relative",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "14px",
          left: "8.5%",
          right: "8.5%",
          height: "2px",
          background:
            "linear-gradient(90deg, rgba(92,185,255,0.85), rgba(149,170,204,0.28))",
          boxShadow: "0 0 12px rgba(42,149,255,0.35)",
        }}
      />
      {etapasEvaluacion.map((etapa, index) => {
        const numero = index + 1;
        const activa = numero === actual;
        const completa = numero < actual;

        return (
          <div
            key={etapa}
            style={{
              display: "grid",
              justifyItems: "center",
              gap: "5px",
              position: "relative",
              zIndex: 1,
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: "29px",
                height: "29px",
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                background: activa
                  ? "linear-gradient(180deg, #5bbcff, #1d6fff)"
                  : completa
                    ? "rgba(20,84,145,0.92)"
                    : "rgba(10,25,52,0.86)",
                border: activa
                  ? "1px solid rgba(205,235,255,0.72)"
                  : "1px solid rgba(169,194,231,0.44)",
                color: "white",
                fontSize: "13px",
                fontWeight: 950,
                boxShadow: activa
                  ? "0 0 18px rgba(64,160,255,0.72), inset 0 1px 0 rgba(255,255,255,0.32)"
                  : "0 7px 14px rgba(0,0,0,0.26)",
              }}
            >
              {numero}
            </div>
            <div
              style={{
                fontSize: "9px",
                lineHeight: 1.05,
                color: activa
                  ? "rgba(219,241,255,0.98)"
                  : "rgba(220,232,250,0.66)",
                fontWeight: activa ? 950 : 780,
                textAlign: "center",
                textShadow: activa ? "0 0 12px rgba(66,170,255,0.62)" : "none",
              }}
            >
              {etapa}
            </div>
          </div>
        );
      })}
    </section>
  );
}

export function IconBox({
  children,
  color = "#9dc8ff",
  style,
}: {
  children: ReactNode;
  color?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: "32px",
        height: "32px",
        borderRadius: "10px",
        display: "grid",
        placeItems: "center",
        color,
        border: `1px solid ${color}55`,
        background: `${color}16`,
        fontSize: "16px",
        fontWeight: 950,
        boxSizing: "border-box",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function ProgresoPreguntasPremium({
  actual,
  total,
  respondidas,
  detalle,
}: {
  actual: number;
  total: number;
  respondidas: number;
  detalle?: string;
}) {
  const totalSeguro = Math.max(total, 1);
  const preguntaActual = Math.min(Math.max(actual, 1), totalSeguro);
  const respondidasSeguras = Math.min(Math.max(respondidas, 0), totalSeguro);
  const porcentaje = Math.round((respondidasSeguras / totalSeguro) * 100);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 52px",
        alignItems: "center",
        gap: "12px",
        marginBottom: "13px",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: "14px",
            fontWeight: 950,
            color: "rgba(234,243,255,0.90)",
          }}
        >
          Pregunta {preguntaActual} de {totalSeguro}
        </div>
        <div
          style={{
            marginTop: "4px",
            fontSize: "12px",
            fontWeight: 850,
            color: "rgba(207,226,255,0.64)",
          }}
        >
          {detalle ? `${detalle} · ` : ""}
          {respondidasSeguras} respondidas
        </div>
        <div
          aria-hidden="true"
          style={{
            height: "5px",
            marginTop: "9px",
            borderRadius: "999px",
            background: "rgba(154,190,232,0.18)",
            overflow: "hidden",
            boxShadow: "inset 0 1px 1px rgba(0,0,0,0.20)",
          }}
        >
          <div
            style={{
              width: `${porcentaje}%`,
              height: "100%",
              borderRadius: "999px",
              background: "linear-gradient(90deg, #42c7ff 0%, #1d73ff 100%)",
              boxShadow: "0 0 16px rgba(44,145,255,0.58)",
            }}
          />
        </div>
      </div>
      <div
        aria-label={`Avance ${porcentaje}%`}
        style={{
          width: "52px",
          height: "52px",
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          background: `conic-gradient(#49c8ff 0deg ${porcentaje * 3.6}deg, rgba(151,197,255,0.20) ${porcentaje * 3.6}deg 360deg)`,
          boxShadow: "0 0 20px rgba(42,149,255,0.28)",
        }}
      >
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            background: "linear-gradient(180deg, #09295a, #041733)",
            color: "rgba(235,247,255,0.94)",
            fontSize: "12px",
            fontWeight: 950,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
          }}
        >
          {porcentaje}%
        </div>
      </div>
    </div>
  );
}

export function AutoGuardadoPremium() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "8px",
        color: "rgba(220,235,255,0.62)",
        fontSize: "13px",
        fontWeight: 850,
        marginTop: "9px",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: "20px",
          height: "14px",
          borderRadius: "999px",
          border: "2px solid rgba(118,177,235,0.70)",
          borderTopColor: "rgba(118,177,235,0.28)",
          boxSizing: "border-box",
        }}
      />
      Autoguardado
      <span
        aria-hidden="true"
        style={{
          width: "7px",
          height: "7px",
          borderRadius: "50%",
          background: "#62e96d",
          boxShadow: "0 0 12px rgba(98,233,109,0.70)",
        }}
      />
    </div>
  );
}

export function FirmaPremium() {
  return (
    <div
      aria-label="Firma F. CAMUS T."
      style={{
        margin: "10px auto 0",
        color: "rgba(226,238,255,0.18)",
        fontSize: "9px",
        fontWeight: 900,
        letterSpacing: "0.22em",
        textAlign: "center",
        textTransform: "uppercase",
        textShadow:
          "0 1px 0 rgba(255,255,255,0.08), 0 -1px 0 rgba(0,0,0,0.52)",
        userSelect: "none",
        pointerEvents: "none",
      }}
    >
      F. CAMUS T.
    </div>
  );
}
