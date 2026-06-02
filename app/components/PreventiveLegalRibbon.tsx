import type { CSSProperties } from "react";

type PreventiveLegalRibbonProps = {
  theme?: "dark" | "light";
  compact?: boolean;
  label?: string;
  text?: string;
  style?: CSSProperties;
};

const defaultText =
  "Gestión preventiva digital alineada a Ley 16.744, DS 44 y DS 594, con foco en evidencia, trazabilidad y seguimiento de cierre.";

export default function PreventiveLegalRibbon({
  theme = "dark",
  compact = false,
  label = "Marco preventivo DS 44",
  text = defaultText,
  style,
}: PreventiveLegalRibbonProps) {
  const light = theme === "light";

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: compact ? "7px" : "9px",
        width: "fit-content",
        maxWidth: "100%",
        padding: compact ? "7px 9px" : "8px 11px",
        borderRadius: "999px",
        background: light
          ? "linear-gradient(135deg, rgba(239,246,255,0.92), rgba(240,253,244,0.86))"
          : "linear-gradient(135deg, rgba(30,64,175,0.24), rgba(22,101,52,0.20))",
        border: light
          ? "1px solid rgba(37,99,235,0.18)"
          : "1px solid rgba(147,197,253,0.22)",
        boxShadow: light
          ? "0 10px 22px rgba(15,23,42,0.07)"
          : "0 12px 28px rgba(0,0,0,0.18)",
        color: light ? "#0f172a" : "#e0f2fe",
        ...style,
      }}
    >
      <span
        style={{
          padding: compact ? "5px 8px" : "6px 9px",
          borderRadius: "999px",
          background: light ? "rgba(37,99,235,0.10)" : "rgba(96,165,250,0.18)",
          border: light
            ? "1px solid rgba(37,99,235,0.18)"
            : "1px solid rgba(147,197,253,0.24)",
          color: light ? "#1d4ed8" : "#bfdbfe",
          fontSize: "11px",
          lineHeight: 1,
          fontWeight: 950,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      <span
        style={{
          minWidth: 0,
          maxWidth: compact ? "680px" : "900px",
          color: light ? "#334155" : "#cbd5e1",
          fontSize: compact ? "11px" : "12px",
          lineHeight: 1.35,
          fontWeight: 750,
        }}
      >
        {text}
      </span>
    </div>
  );
}
