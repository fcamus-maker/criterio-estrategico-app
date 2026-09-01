"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

type ModuloPremium =
  | "inicio"
  | "hallazgos"
  | "cierres"
  | "kpi"
  | "mapa"
  | "planificacion"
  | "configuracion";

type MetricaPremium = {
  label: string;
  value: string | number;
  tone?: "blue" | "cyan" | "green" | "amber" | "red" | "violet";
  helper?: string;
  active?: boolean;
  actionLabel?: string;
  onClick?: () => void;
};

type EtapaPremium = {
  label: string;
  value: string | number;
  tone?: "blue" | "cyan" | "green" | "amber" | "red" | "violet";
  active?: boolean;
  actionLabel?: string;
  onClick?: () => void;
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
  profileImageUrl?: string | null;
  companyLogoUrl?: string | null;
  companyName?: string;
  onProfileClick?: () => void;
  lastUpdate?: string;
  actions?: ReactNode;
  toolbar?: ReactNode;
  onModuleSelect?: (module: ModuloPremium) => void;
  onOpenClosures?: () => void;
};

const MODULOS: Array<{
  id: ModuloPremium;
  label: string;
  labelEn: string;
  href: string;
  icon: "home" | "finding" | "closure" | "chart" | "map" | "calendar" | "settings";
}> = [
  { id: "inicio", label: "Inicio ejecutivo", labelEn: "Executive home", href: "/panel", icon: "home" },
  { id: "hallazgos", label: "Hallazgos", labelEn: "Findings", href: "/panel#hallazgos-operativos", icon: "finding" },
  { id: "cierres", label: "Cierres", labelEn: "Closures", href: "/panel#seguimiento-cierre", icon: "closure" },
  { id: "kpi", label: "KPI gerencial", labelEn: "Management KPI", href: "/panel/kpi-gerencial", icon: "chart" },
  { id: "mapa", label: "Mapa GPS", labelEn: "GPS map", href: "/panel/mapa-gps", icon: "map" },
  { id: "planificacion", label: "Planificación", labelEn: "Planning", href: "/panel#planificacion-preventiva", icon: "calendar" },
  { id: "configuracion", label: "Configuración", labelEn: "Settings", href: "/panel#configuracion-sistema", icon: "settings" },
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
  if (name === "calendar") {
    return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>;
  }
  return <svg {...common}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21H9.6v-.1A1.7 1.7 0 0 0 8 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 3.6 15a1.7 1.7 0 0 0-1.5-1H2v-4h.1A1.7 1.7 0 0 0 3.6 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 8 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.1A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 1.5 1h.1v4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg>;
}

function IconoEtapa({ index }: { index: number }) {
  const common = {
    width: 14,
    height: 14,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (index === 0) return <svg {...common}><circle cx="9" cy="8" r="3"/><path d="M3 21v-2a6 6 0 0 1 12 0v2M19 8v6M16 11h6"/></svg>;
  if (index === 1) return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
  if (index === 2) return <svg {...common}><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></svg>;
  if (index === 3) return <svg {...common}><path d="M12 3 2.5 20h19Z"/><path d="M12 9v4M12 17h.01"/></svg>;
  return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="m8 12 2.6 2.6L16.5 9"/></svg>;
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
  profileImageUrl,
  companyLogoUrl,
  companyName = "Criterio Estratégico",
  onProfileClick,
  lastUpdate,
  actions,
  toolbar,
  onModuleSelect,
  onOpenClosures,
}: PremiumWorkspaceShellProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const light = theme === "light";
  const text = light ? "#0f172a" : "#f8fafc";
  const muted = light ? "#64748b" : "#94a3b8";

  return (
    <>
      <style>{`
        .ce-premium-workspace-sidebar {
          position: fixed;
          left: 10px;
          top: 10px;
          bottom: 10px;
          z-index: 90;
          transition: width 180ms ease, box-shadow 180ms ease;
        }
        .ce-premium-workspace-commandbar {
          position: sticky;
          top: 8px;
          z-index: 70;
        }
        .ce-premium-shell-host > .ce-panel-shell > .ce-panel-main-header,
        .ce-premium-shell-host > .ce-panel-shell > .ce-panel-header {
          display: none !important;
        }
        .ce-premium-shell-host .ce-map-legacy-master-filters {
          display: none !important;
        }
        .ce-premium-shell-host .ce-panel-left-rail {
          display: none !important;
        }
        .ce-premium-shell-host .ce-panel-dashboard-grid {
          grid-template-columns: minmax(0, 1fr) clamp(270px, 20vw, 340px) !important;
        }
        @media (min-width: 1100px) {
          main.ce-premium-shell-host {
            padding-left: 104px !important;
          }
        }
        @media (max-width: 1099px) {
          .ce-premium-workspace-sidebar {
            position: relative;
            inset: auto;
            width: auto !important;
            margin-bottom: 14px;
          }
          .ce-premium-workspace-nav {
            display: grid !important;
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
          .ce-premium-workspace-commandbar {
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
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
        style={{
          width: sidebarExpanded ? 224 : 76,
          borderRadius: 24,
          padding: sidebarExpanded ? 14 : 10,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          color: "#f8fafc",
          background: "linear-gradient(180deg, rgba(5,13,28,0.99), rgba(8,20,43,0.98))",
          border: "1px solid rgba(96,165,250,0.20)",
          boxShadow: "0 24px 70px rgba(2,6,23,0.44), inset 0 1px 0 rgba(255,255,255,0.06)",
          overflow: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: sidebarExpanded ? "flex-start" : "center", gap: 10, padding: "3px 2px 8px" }}>
          <div style={{ flex: "0 0 auto", width: 40, height: 40, borderRadius: 13, display: "grid", placeItems: "center", fontWeight: 950, letterSpacing: "-1px", background: "linear-gradient(135deg,#2563eb,#06b6d4)", boxShadow: "0 12px 28px rgba(37,99,235,0.35)" }}>CE</div>
          <div style={{ display: sidebarExpanded ? "block" : "none", minWidth: 0 }}>
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
                title={language === "en" ? modulo.labelEn : modulo.label}
                style={{
                  minHeight: 44,
                  padding: sidebarExpanded ? "9px 11px" : "9px",
                  borderRadius: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: sidebarExpanded ? "flex-start" : "center",
                  gap: sidebarExpanded ? 10 : 0,
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
                <span style={{ display: sidebarExpanded ? "inline" : "none", whiteSpace: "nowrap" }}>{language === "en" ? modulo.labelEn : modulo.label}</span>
              </Link>
            );
          })}
        </nav>

        <div style={{ marginTop: "auto", display: "grid", gap: 10 }}>
          <div style={{ padding: sidebarExpanded ? 10 : 8, borderRadius: 15, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(74,222,128,0.18)" }} title={language === "en" ? "System operational" : "Sistema operativo"}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: sidebarExpanded ? "flex-start" : "center", gap: 8, fontSize: 11, fontWeight: 900, color: "#bbf7d0" }}>
              <span style={{ width: 8, height: 8, borderRadius: 99, background: "#4ade80", boxShadow: "0 0 14px rgba(74,222,128,0.75)" }} />
              {sidebarExpanded ? (language === "en" ? "System operational" : "Sistema operativo") : null}
            </div>
            {sidebarExpanded ? <div style={{ marginTop: 7, color: "#86a2bf", fontSize: 10.5, lineHeight: 1.35 }}>{lastUpdate || (language === "en" ? "Traceability active" : "Trazabilidad activa")}</div> : null}
          </div>
          <div style={{ display: sidebarExpanded ? "flex" : "none", gap: 7, flexWrap: "wrap" }}>
            <span style={{ padding: "6px 8px", borderRadius: 99, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(148,163,184,0.14)", color: "#b9c9dc", fontSize: 10, fontWeight: 900 }}>{language.toUpperCase()}</span>
            <span style={{ padding: "6px 8px", borderRadius: 99, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(148,163,184,0.14)", color: "#b9c9dc", fontSize: 10, fontWeight: 900 }}>{light ? (language === "en" ? "LIGHT" : "CLARO") : (language === "en" ? "DARK" : "OSCURO")}</span>
          </div>
        </div>
      </aside>

      <section className="ce-premium-workspace-top" style={{ marginBottom: 14 }}>
        <div
          className="ce-premium-command-head ce-premium-workspace-commandbar"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) auto",
            gap: 12,
            alignItems: "center",
            padding: "10px 14px",
            borderRadius: 17,
            color: text,
            background: light ? "rgba(255,255,255,0.92)" : "rgba(7,17,36,0.93)",
            border: light ? "1px solid rgba(100,116,139,0.20)" : "1px solid rgba(96,165,250,0.19)",
            boxShadow: light ? "0 18px 45px rgba(15,23,42,0.10)" : "0 20px 52px rgba(2,6,23,0.34)",
            backdropFilter: "blur(18px)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            {companyLogoUrl ? (
              <div
                title={companyName}
                style={{
                  width: 34,
                  height: 34,
                  flex: "0 0 34px",
                  borderRadius: 10,
                  padding: 4,
                  display: "grid",
                  placeItems: "center",
                  overflow: "hidden",
                  background: "#ffffff",
                  border: light ? "1px solid rgba(100,116,139,0.18)" : "1px solid rgba(125,211,252,0.22)",
                  boxShadow: "0 8px 20px rgba(2,6,23,0.16)",
                }}
              >
                <img src={companyLogoUrl} alt={companyName} style={{ width: "100%", height: "100%", display: "block", objectFit: "contain" }} />
              </div>
            ) : null}
            <div style={{ minWidth: 0 }}>
              <div style={{ color: light ? "#2563eb" : "#38bdf8", fontSize: 9, fontWeight: 950, letterSpacing: 1, textTransform: "uppercase" }}>{eyebrow}</div>
              <h1 style={{ margin: "2px 0 0", fontSize: "clamp(19px,1.7vw,25px)", lineHeight: 1.05, fontWeight: 950, letterSpacing: "-0.5px" }}>{title}</h1>
              <p style={{ margin: "3px 0 0", maxWidth: 900, color: muted, fontSize: 10.5, lineHeight: 1.25, fontWeight: 700 }}>{subtitle}</p>
            </div>
          </div>
          <div className="ce-premium-command-actions" style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 9, flexWrap: "wrap" }}>
            {actions}
            <button
              type="button"
              onClick={onProfileClick}
              aria-label={language === "en" ? "Open profile" : "Abrir perfil"}
              style={{
                padding: "5px 8px 5px 5px",
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                gap: 7,
                color: text,
                background: light ? "#f8fafc" : "rgba(255,255,255,0.045)",
                border: light ? "1px solid rgba(100,116,139,0.18)" : "1px solid rgba(148,163,184,0.13)",
                cursor: onProfileClick ? "pointer" : "default",
                textAlign: "left",
              }}
            >
              <span style={{ width: 29, height: 29, flex: "0 0 29px", borderRadius: 99, overflow: "hidden", display: "grid", placeItems: "center", color: "#fff", background: "linear-gradient(135deg,#2563eb,#06b6d4)", fontSize: 12, fontWeight: 950 }}>
                {profileImageUrl ? <img src={profileImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} /> : profileName.trim().charAt(0).toUpperCase()}
              </span>
              <span>
                <span style={{ display: "block", fontSize: 11, fontWeight: 950 }}>{profileName}</span>
                <span style={{ display: "block", marginTop: 2, color: muted, fontSize: 9.5, fontWeight: 800 }}>{profileRole}</span>
              </span>
            </button>
          </div>
        </div>

        {metrics.length > 0 && (
          <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(145px,1fr))", gap: 9 }}>
            {metrics.map((metric) => {
              const tone = TONOS[metric.tone || "blue"];
              return (
                <article
                  key={metric.label}
                  role={metric.onClick ? "button" : undefined}
                  tabIndex={metric.onClick ? 0 : undefined}
                  aria-label={metric.actionLabel}
                  onClick={metric.onClick}
                  onKeyDown={(event) => {
                    if (metric.onClick && (event.key === "Enter" || event.key === " ")) {
                      event.preventDefault();
                      metric.onClick();
                    }
                  }}
                  aria-pressed={metric.onClick ? Boolean(metric.active) : undefined}
                  style={{
                    position: "relative",
                    minHeight: 62,
                    padding: "9px 11px",
                    borderRadius: 15,
                    background: metric.active
                      ? `linear-gradient(135deg,${tone.soft},${light ? "rgba(255,255,255,0.94)" : "rgba(9,20,42,0.94)"})`
                      : light ? "rgba(255,255,255,0.88)" : "rgba(9,20,42,0.88)",
                    border: metric.active ? `2px solid ${tone.color}` : `1px solid ${tone.border}`,
                    boxShadow: metric.active
                      ? `0 0 0 3px ${tone.soft}, 0 12px 26px rgba(2,6,23,0.18)`
                      : light ? "0 10px 24px rgba(15,23,42,0.06)" : "0 12px 26px rgba(2,6,23,0.20)",
                    cursor: metric.onClick ? "pointer" : "default",
                  }}
                >
                  {metric.onClick ? (
                    <span aria-hidden="true" style={{ position: "absolute", top: 8, right: 9, width: 22, height: 22, borderRadius: 8, display: "grid", placeItems: "center", color: tone.color, background: tone.soft, border: `1px solid ${tone.border}` }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                    </span>
                  ) : null}
                  <div style={{ color: muted, fontSize: 9.5, fontWeight: 950, letterSpacing: 0.55, textTransform: "uppercase" }}>{metric.label}</div>
                  <div style={{ marginTop: 4, color: tone.color, fontSize: 20, lineHeight: 1, fontWeight: 950 }}>{metric.value}</div>
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
              <button
                type="button"
                onClick={onOpenClosures}
                style={{ padding: "8px 11px", borderRadius: 11, color: "#fff", background: "linear-gradient(135deg,#2563eb,#7c3aed)", border: "1px solid rgba(167,139,250,0.42)", cursor: onOpenClosures ? "pointer" : "default", fontSize: 10.5, fontWeight: 950 }}
              >
                {language === "en" ? "Open closures" : "Abrir cierres"}
              </button>
            </div>
            <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 8 }}>
              {stages.map((stage, index) => {
                const tone = TONOS[stage.tone || "blue"];
                return (
                  <div
                    key={stage.label}
                    role={stage.onClick ? "button" : undefined}
                    tabIndex={stage.onClick ? 0 : undefined}
                    aria-label={stage.actionLabel}
                    aria-pressed={stage.onClick ? Boolean(stage.active) : undefined}
                    onClick={stage.onClick}
                    onKeyDown={(event) => {
                      if (stage.onClick && (event.key === "Enter" || event.key === " ")) {
                        event.preventDefault();
                        stage.onClick();
                      }
                    }}
                    style={{
                      position: "relative",
                      padding: "10px 11px",
                      borderRadius: 13,
                      background: stage.active
                        ? `linear-gradient(135deg,${tone.soft},rgba(255,255,255,0.08))`
                        : tone.soft,
                      border: stage.active ? `2px solid ${tone.color}` : `1px solid ${tone.border}`,
                      boxShadow: stage.active ? `0 0 0 3px ${tone.soft}, 0 12px 28px rgba(2,6,23,0.22)` : "none",
                      cursor: stage.onClick ? "pointer" : "default",
                      transform: stage.active ? "translateY(-1px)" : "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <span style={{ width: 25, height: 25, borderRadius: 9, display: "grid", placeItems: "center", color: tone.color, background: tone.soft, border: `1px solid ${tone.border}` }}><IconoEtapa index={index} /></span>
                      <strong style={{ padding: "5px 7px", borderRadius: 999, color: tone.color, background: tone.soft, border: `1px solid ${tone.border}`, fontSize: 10.5, lineHeight: 1 }}>
                        {stage.value} {language === "en" ? (Number(stage.value) === 1 ? "finding" : "findings") : (Number(stage.value) === 1 ? "hallazgo" : "hallazgos")}
                      </strong>
                    </div>
                    <div style={{ marginTop: 7, color: text, fontSize: 10.5, lineHeight: 1.25, fontWeight: 900 }}>{stage.label}</div>
                    {stage.onClick ? (
                      <div style={{ marginTop: 5, color: muted, fontSize: 9, fontWeight: 800 }}>
                        {stage.active
                          ? (language === "en" ? "Active filter · click to clear" : "Filtro activo · pincha para quitar")
                          : (language === "en" ? "View findings" : "Ver hallazgos")}
                      </div>
                    ) : null}
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
