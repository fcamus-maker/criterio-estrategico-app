"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type ModuloPremium =
  | "inicio"
  | "hallazgos"
  | "cierres"
  | "kpi"
  | "mapa"
  | "planificacion";

type MetricaPremium = {
  label: string;
  value: string | number;
  tone?: "blue" | "cyan" | "green" | "amber" | "red" | "violet";
  helper?: string;
};

type EtapaPremium = {
  label: string;
  value: string | number;
  tone?: "blue" | "cyan" | "green" | "amber" | "red" | "violet";
};

type PremiumWorkspaceShellProps = {
  active: ModuloPremium;
  title: string;
  eyebrow: string;
  subtitle: string;
  theme: "light" | "dark";
  language: "es" | "en";
  metrics?: MetricaPremium[];
  stages?: EtapaPremium[];
  profileName?: string;
  profileRole?: string;
  lastUpdate?: string;
  actions?: ReactNode;
  toolbar?: ReactNode;
  onModuleSelect?: (module: ModuloPremium) => void;
};

const MODULOS: Array<{
  id: ModuloPremium;
  label: string;
  labelEn: string;
  href: string;
  icon: "home" | "finding" | "closure" | "chart" | "map" | "calendar";
}> = [
  { id: "inicio", label: "Inicio ejecutivo", labelEn: "Executive home", href: "/panel", icon: "home" },
  { id: "hallazgos", label: "Hallazgos", labelEn: "Findings", href: "/panel#hallazgos-operativos", icon: "finding" },
  { id: "cierres", label: "Cierres", labelEn: "Closures", href: "/panel#seguimiento-cierre", icon: "closure" },
  { id: "kpi", label: "KPI gerencial", labelEn: "Management KPI", href: "/panel/kpi-gerencial", icon: "chart" },
  { id: "mapa", label: "Mapa GPS", labelEn: "GPS map", href: "/panel/mapa-gps", icon: "map" },
  { id: "planificacion", label: "Planificación", labelEn: "Planning", href: "/panel#planificacion-preventiva", icon: "calendar" },
];

const TONOS = {
  blue: { color: "#60a5fa", soft: "rgba(59,130,246,0.15)", border: "rgba(96,165,250,0.30)" },
  cyan: { color: "#22d3ee", soft: "rgba(34,211,238,0.13)", border: "rgba(34,211,238,0.28)" },
  green: { color: "#4ade80", soft: "rgba(34,197,94,0.14)", border: "rgba(74,222,128,0.28)" },
  amber: { color: "#fbbf24", soft: "rgba(245,158,11,0.14)", border: "rgba(251,191,36,0.28)" },
  red: { color: "#fb7185", soft: "rgba(244,63,94,0.14)", border: "rgba(251,113,133,0.30)" },
  violet: { color: "#a78bfa", soft: "rgba(139,92,246,0.14)", border: "rgba(167,139,250,0.30)" },
} as const;

function IconoModulo({ name }: { name: (typeof MODULOS)[number]["icon"] }) {
  const common = {
    width: 19,
    height: 19,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "home") {
    return <svg {...common}><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></svg>;
  }
  if (name === "finding") {
    return <svg {...common}><path d="M8 3h8l3 3v15H5V3h3"/><path d="M9 3v4h6V3"/><path d="M8 12h8M8 16h5"/></svg>;
  }
  if (name === "closure") {
    return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="m8 12 2.6 2.6L16.5 9"/></svg>;
  }
  if (name === "chart") {
    return <svg {...common}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>;
  }
  if (name === "map") {
    return <svg {...common}><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z"/><path d="M9 3v15M15 6v15"/></svg>;
  }
  return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>;
}

export default function PremiumWorkspaceShell({
  active,
  title,
  eyebrow,
  subtitle,
  theme,
  language,
  metrics = [],
  stages = [],
  profileName = "Usuario autorizado",
  profileRole = "Gestión preventiva",
  lastUpdate,
  actions,
  toolbar,
  onModuleSelect,
}: PremiumWorkspaceShellProps) {
  const light = theme === "light";
  const text = light ? "#0f172a" : "#f8fafc";
  const muted = light ? "#64748b" : "#94a3b8";

  return (
    <>
      <style>{`
        .ce-premium-workspace-sidebar {
          position: fixed;
          left: 14px;
          top: 14px;
          bottom: 14px;
          width: 254px;
          z-index: 90;
        }
        .ce-premium-workspace-top {
          position: sticky;
          top: 12px;
          z-index: 70;
        }
        .ce-premium-shell-host > .ce-panel-shell > .ce-panel-main-header,
        .ce-premium-shell-host > .ce-panel-shell > .ce-panel-header {
          display: none !important;
        }
        .ce-premium-shell-host .ce-map-legacy-master-filters {
          display: none !important;
        }
        @media (min-width: 1100px) {
          main.ce-premium-shell-host {
            padding-left: 286px !important;
          }
        }
        @media (max-width: 1099px) {
          .ce-premium-workspace-sidebar {
            position: relative;
            inset: auto;
            width: auto;
            margin-bottom: 14px;
          }
          .ce-premium-workspace-nav {
            display: grid !important;
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
          .ce-premium-workspace-top {
            top: 6px;
          }
        }
        @media (max-width: 720px) {
          .ce-premium-workspace-nav {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .ce-premium-command-head {
            grid-template-columns: 1fr !important;
          }
          .ce-premium-command-actions {
            justify-content: flex-start !important;
          }
        }
      `}</style>

      <aside
        className="ce-premium-workspace-sidebar"
        style={{
          borderRadius: 24,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          color: "#f8fafc",
          background: "linear-gradient(180deg, rgba(5,13,28,0.99), rgba(8,20,43,0.98))",
          border: "1px solid rgba(96,165,250,0.20)",
          boxShadow: "0 24px 70px rgba(2,6,23,0.44), inset 0 1px 0 rgba(255,255,255,0.06)",
          overflow: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "4px 4px 12px" }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, display: "grid", placeItems: "center", fontWeight: 950, letterSpacing: "-1px", background: "linear-gradient(135deg,#2563eb,#06b6d4)", boxShadow: "0 12px 28px rgba(37,99,235,0.35)" }}>CE</div>
          <div>
            <div style={{ fontSize: 10, color: "#7dd3fc", fontWeight: 900, letterSpacing: 1.2, textTransform: "uppercase" }}>Criterio Estratégico</div>
            <div style={{ marginTop: 3, fontSize: 14, fontWeight: 950 }}>Control Preventivo</div>
          </div>
        </div>

        <nav className="ce-premium-workspace-nav" aria-label={language === "en" ? "Main modules" : "Módulos principales"} style={{ display: "grid", gap: 7 }}>
          {MODULOS.map((modulo) => {
            const selected = modulo.id === active;
            return (
              <Link
                key={modulo.id}
                href={modulo.href}
                onClick={(event) => {
                  if (onModuleSelect && modulo.href.startsWith("/panel#")) {
                    event.preventDefault();
                    onModuleSelect(modulo.id);
                  }
                }}
                aria-current={selected ? "page" : undefined}
                style={{
                  minHeight: 48,
                  padding: "11px 12px",
                  borderRadius: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 11,
                  color: selected ? "#ffffff" : "#a9bdd6",
                  background: selected ? "linear-gradient(135deg,rgba(37,99,235,0.96),rgba(14,165,233,0.82))" : "rgba(255,255,255,0.035)",
                  border: selected ? "1px solid rgba(125,211,252,0.42)" : "1px solid rgba(148,163,184,0.10)",
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: selected ? 950 : 800,
                  boxShadow: selected ? "0 12px 26px rgba(37,99,235,0.24)" : "none",
                }}
              >
                <IconoModulo name={modulo.icon} />
                <span>{language === "en" ? modulo.labelEn : modulo.label}</span>
              </Link>
            );
          })}
        </nav>

        <div style={{ marginTop: "auto", display: "grid", gap: 10 }}>
          <div style={{ padding: 12, borderRadius: 15, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(74,222,128,0.18)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 900, color: "#bbf7d0" }}>
              <span style={{ width: 8, height: 8, borderRadius: 99, background: "#4ade80", boxShadow: "0 0 14px rgba(74,222,128,0.75)" }} />
              {language === "en" ? "System operational" : "Sistema operativo"}
            </div>
            <div style={{ marginTop: 7, color: "#86a2bf", fontSize: 10.5, lineHeight: 1.35 }}>{lastUpdate || (language === "en" ? "Traceability active" : "Trazabilidad activa")}</div>
          </div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            <span style={{ padding: "6px 8px", borderRadius: 99, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(148,163,184,0.14)", color: "#b9c9dc", fontSize: 10, fontWeight: 900 }}>{language.toUpperCase()}</span>
            <span style={{ padding: "6px 8px", borderRadius: 99, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(148,163,184,0.14)", color: "#b9c9dc", fontSize: 10, fontWeight: 900 }}>{light ? (language === "en" ? "LIGHT" : "CLARO") : (language === "en" ? "DARK" : "OSCURO")}</span>
          </div>
        </div>
      </aside>

      <section className="ce-premium-workspace-top" style={{ marginBottom: 18 }}>
        <div
          className="ce-premium-command-head"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) auto",
            gap: 18,
            alignItems: "center",
            padding: "17px 20px",
            borderRadius: 22,
            color: text,
            background: light ? "rgba(255,255,255,0.92)" : "rgba(7,17,36,0.93)",
            border: light ? "1px solid rgba(100,116,139,0.20)" : "1px solid rgba(96,165,250,0.19)",
            boxShadow: light ? "0 18px 45px rgba(15,23,42,0.10)" : "0 20px 52px rgba(2,6,23,0.34)",
            backdropFilter: "blur(18px)",
          }}
        >
          <div>
            <div style={{ color: light ? "#2563eb" : "#38bdf8", fontSize: 10.5, fontWeight: 950, letterSpacing: 1.1, textTransform: "uppercase" }}>{eyebrow}</div>
            <h1 style={{ margin: "5px 0 4px", fontSize: "clamp(23px,2.1vw,34px)", lineHeight: 1.05, fontWeight: 950, letterSpacing: "-0.7px" }}>{title}</h1>
            <p style={{ margin: 0, maxWidth: 940, color: muted, fontSize: 12.5, lineHeight: 1.45, fontWeight: 700 }}>{subtitle}</p>
          </div>
          <div className="ce-premium-command-actions" style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 9, flexWrap: "wrap" }}>
            {actions}
            <div style={{ padding: "9px 11px", borderRadius: 13, background: light ? "#f8fafc" : "rgba(255,255,255,0.045)", border: light ? "1px solid rgba(100,116,139,0.18)" : "1px solid rgba(148,163,184,0.13)" }}>
              <div style={{ fontSize: 11, fontWeight: 950 }}>{profileName}</div>
              <div style={{ marginTop: 2, color: muted, fontSize: 9.5, fontWeight: 800 }}>{profileRole}</div>
            </div>
          </div>
        </div>

        {metrics.length > 0 && (
          <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(145px,1fr))", gap: 9 }}>
            {metrics.map((metric) => {
              const tone = TONOS[metric.tone || "blue"];
              return (
                <article key={metric.label} style={{ minHeight: 86, padding: "12px 14px", borderRadius: 17, background: light ? "rgba(255,255,255,0.88)" : "rgba(9,20,42,0.88)", border: `1px solid ${tone.border}`, boxShadow: light ? "0 10px 24px rgba(15,23,42,0.06)" : "0 12px 26px rgba(2,6,23,0.20)" }}>
                  <div style={{ color: muted, fontSize: 9.5, fontWeight: 950, letterSpacing: 0.55, textTransform: "uppercase" }}>{metric.label}</div>
                  <div style={{ marginTop: 7, color: tone.color, fontSize: 25, lineHeight: 1, fontWeight: 950 }}>{metric.value}</div>
                  {metric.helper && <div style={{ marginTop: 6, color: muted, fontSize: 9.5, fontWeight: 750 }}>{metric.helper}</div>}
                </article>
              );
            })}
          </div>
        )}

        {toolbar && (
          <div style={{ marginTop: 10, padding: 14, borderRadius: 19, color: text, background: light ? "rgba(255,255,255,0.90)" : "rgba(9,20,42,0.90)", border: light ? "1px solid rgba(100,116,139,0.18)" : "1px solid rgba(96,165,250,0.17)", boxShadow: light ? "0 10px 26px rgba(15,23,42,0.05)" : "0 12px 28px rgba(2,6,23,0.18)" }}>
            {toolbar}
          </div>
        )}

        {stages.length > 0 && (
          <div style={{ marginTop: 10, padding: 14, borderRadius: 19, color: text, background: light ? "rgba(239,246,255,0.90)" : "linear-gradient(135deg,rgba(10,25,52,0.96),rgba(18,24,55,0.92))", border: light ? "1px solid rgba(37,99,235,0.16)" : "1px solid rgba(96,165,250,0.18)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 950, color: light ? "#1d4ed8" : "#7dd3fc", letterSpacing: 0.8, textTransform: "uppercase" }}>{language === "en" ? "Single closure route" : "Ruta única de cierre"}</div>
                <div style={{ marginTop: 3, color: muted, fontSize: 11, fontWeight: 750 }}>{language === "en" ? "One status, one next action, complete traceability." : "Un estado, una acción siguiente y trazabilidad completa."}</div>
              </div>
              <Link href="/panel#seguimiento-cierre" style={{ padding: "8px 11px", borderRadius: 11, color: "#fff", background: "linear-gradient(135deg,#2563eb,#7c3aed)", textDecoration: "none", fontSize: 10.5, fontWeight: 950 }}>{language === "en" ? "Open closures" : "Abrir cierres"}</Link>
            </div>
            <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 8 }}>
              {stages.map((stage, index) => {
                const tone = TONOS[stage.tone || "blue"];
                return (
                  <div key={stage.label} style={{ position: "relative", padding: "10px 11px", borderRadius: 13, background: tone.soft, border: `1px solid ${tone.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <span style={{ width: 21, height: 21, borderRadius: 99, display: "grid", placeItems: "center", color: "#fff", background: tone.color, fontSize: 9.5, fontWeight: 950 }}>{index + 1}</span>
                      <strong style={{ color: tone.color, fontSize: 16 }}>{stage.value}</strong>
                    </div>
                    <div style={{ marginTop: 7, color: text, fontSize: 10.5, lineHeight: 1.25, fontWeight: 900 }}>{stage.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
