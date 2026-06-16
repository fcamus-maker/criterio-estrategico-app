import type { CSSProperties } from "react";

export const etapasEvaluacion = [
  "Contexto",
  "Preguntas",
  "Hallazgo",
  "Responsable",
  "Evidencia",
  "Confirmación",
];

export const pageStyle: CSSProperties = {
  minHeight: "100dvh",
  width: "100%",
  background:
    "radial-gradient(circle at 22% 14%, rgba(60,130,220,0.46) 0%, rgba(7,32,68,0.92) 31%, rgba(2,12,32,1) 72%), linear-gradient(180deg, #05244a 0%, #020b1f 100%)",
  backgroundColor: "#020b1f",
  color: "white",
  fontFamily: "Arial, sans-serif",
  overflowX: "hidden",
  overscrollBehaviorY: "none",
  touchAction: "pan-y",
  WebkitOverflowScrolling: "touch",
};

export const containerStyle: CSSProperties = {
  width: "100%",
  maxWidth: "430px",
  margin: "0 auto",
  minHeight: "100dvh",
  padding:
    "calc(12px + env(safe-area-inset-top)) 15px calc(32px + env(safe-area-inset-bottom))",
  boxSizing: "border-box",
  overflowX: "hidden",
  overscrollBehaviorY: "contain",
  touchAction: "pan-y",
};

export const glassPanelStyle: CSSProperties = {
  borderRadius: "18px",
  background:
    "linear-gradient(180deg, rgba(22,72,124,0.66), rgba(4,26,60,0.78))",
  border: "1px solid rgba(151,197,255,0.30)",
  boxShadow:
    "0 18px 42px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.11), inset 0 -1px 0 rgba(33,150,243,0.10)",
  boxSizing: "border-box",
  maxWidth: "100%",
  overflow: "hidden",
};

export const cardStyle: CSSProperties = {
  ...glassPanelStyle,
  padding: "14px",
  marginBottom: "12px",
};

export const buttonStyle: CSSProperties = {
  width: "100%",
  maxWidth: "100%",
  fontSize: "16px",
  touchAction: "manipulation",
  border: "1px solid rgba(128,184,255,0.50)",
  borderRadius: "18px",
  padding: "15px 16px",
  fontWeight: 900,
  cursor: "pointer",
  boxSizing: "border-box",
  transition: "transform 120ms ease, filter 120ms ease, box-shadow 120ms ease",
};

export const primaryButtonStyle: CSSProperties = {
  ...buttonStyle,
  color: "white",
  background:
    "linear-gradient(180deg, #2593ff 0%, #145ee9 48%, #07339b 100%)",
  boxShadow:
    "0 20px 36px rgba(15,94,255,0.42), inset 0 1px 0 rgba(255,255,255,0.30), inset 0 -10px 24px rgba(0,18,94,0.30)",
};

export const inputStyle: CSSProperties = {
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  fontSize: "15px",
  boxSizing: "border-box",
  border: "1px solid rgba(151,197,255,0.20)",
  borderRadius: "14px",
  background: "rgba(3,20,48,0.24)",
  color: "white",
  padding: "10px 11px",
  outline: "none",
  touchAction: "manipulation",
  WebkitAppearance: "none",
  appearance: "none",
};

export const labelStyle: CSSProperties = {
  display: "block",
  fontSize: "12px",
  fontWeight: 850,
  color: "rgba(220,235,255,0.70)",
  marginBottom: "6px",
};

export const subtleTextStyle: CSSProperties = {
  color: "rgba(224,236,255,0.72)",
  lineHeight: 1.32,
};
