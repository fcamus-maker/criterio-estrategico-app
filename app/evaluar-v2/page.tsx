"use client";

import { useEffect, useMemo, useState } from "react";

type SupervisorV2 = {
  nombre: string;
  cargo: string;
  empresa: string;
  obra: string;
  siglaEmpresa: string;
  siglaProyecto: string;
};

const STORAGE_SUPERVISOR = "ce_mobile_v2_supervisor";

const SUPERVISOR_DEFAULT: SupervisorV2 = {
  nombre: "Freddy Camus",
  cargo: "Ingeniero",
  empresa: "TNT",
  obra: "PEL",
  siglaEmpresa: "TNT",
  siglaProyecto: "PEL",
};

function cargarSupervisor(): SupervisorV2 {
  if (typeof window === "undefined") return SUPERVISOR_DEFAULT;

  try {
    const guardado = JSON.parse(
      localStorage.getItem(STORAGE_SUPERVISOR) || "null"
    );

    if (!guardado || typeof guardado !== "object") return SUPERVISOR_DEFAULT;

    return {
      nombre: String(guardado.nombre || SUPERVISOR_DEFAULT.nombre),
      cargo: String(guardado.cargo || SUPERVISOR_DEFAULT.cargo),
      empresa: String(guardado.empresa || SUPERVISOR_DEFAULT.empresa),
      obra: String(guardado.obra || SUPERVISOR_DEFAULT.obra),
      siglaEmpresa: String(
        guardado.siglaEmpresa || SUPERVISOR_DEFAULT.siglaEmpresa
      ),
      siglaProyecto: String(
        guardado.siglaProyecto || SUPERVISOR_DEFAULT.siglaProyecto
      ),
    };
  } catch {
    return SUPERVISOR_DEFAULT;
  }
}

export default function EvaluarV2HomePage() {
  const [supervisor, setSupervisor] =
    useState<SupervisorV2>(SUPERVISOR_DEFAULT);
  const [draft, setDraft] = useState<SupervisorV2>(SUPERVISOR_DEFAULT);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const supervisorGuardado = cargarSupervisor();
      setSupervisor(supervisorGuardado);
      setDraft(supervisorGuardado);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const codigoPreview = useMemo(() => {
    const proyecto = draft.siglaProyecto.trim().toUpperCase() || "PEL";
    const empresa = draft.siglaEmpresa.trim().toUpperCase() || "TNT";
    return `CE-${proyecto}/${empresa}-0001`;
  }, [draft.siglaEmpresa, draft.siglaProyecto]);

  const guardarSupervisor = () => {
    const actualizado: SupervisorV2 = {
      nombre: draft.nombre.trim() || SUPERVISOR_DEFAULT.nombre,
      cargo: draft.cargo.trim() || SUPERVISOR_DEFAULT.cargo,
      empresa: draft.empresa.trim() || SUPERVISOR_DEFAULT.empresa,
      obra: draft.obra.trim() || SUPERVISOR_DEFAULT.obra,
      siglaEmpresa:
        draft.siglaEmpresa.trim().toUpperCase() ||
        SUPERVISOR_DEFAULT.siglaEmpresa,
      siglaProyecto:
        draft.siglaProyecto.trim().toUpperCase() ||
        SUPERVISOR_DEFAULT.siglaProyecto,
    };

    localStorage.setItem(STORAGE_SUPERVISOR, JSON.stringify(actualizado));
    setSupervisor(actualizado);
    setDraft(actualizado);
    setMensaje("Supervisor V2 guardado.");
  };

  const actualizarDraft = (campo: keyof SupervisorV2, valor: string) => {
    setDraft((actual) => ({
      ...actual,
      [campo]: valor,
    }));
    setMensaje("");
  };

  const pageStyle = {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at 50% 0%, #2563eb 0%, #0b1f3a 42%, #061327 100%)",
    color: "white",
    fontFamily: "Arial, sans-serif",
    overflowX: "hidden" as const,
    touchAction: "pan-y" as const,
  };

  const containerStyle = {
    width: "100%",
    maxWidth: "430px",
    margin: "0 auto",
    padding: "16px",
    boxSizing: "border-box" as const,
    overflowX: "hidden" as const,
    touchAction: "pan-y" as const,
  };

  const cardStyle = {
    borderRadius: "22px",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.07))",
    border: "1px solid rgba(255,255,255,0.16)",
    boxShadow: "0 18px 36px rgba(0,0,0,0.28)",
    padding: "16px",
    boxSizing: "border-box" as const,
    maxWidth: "100%",
    overflowX: "hidden" as const,
  };

  const inputStyle = {
    width: "100%",
    maxWidth: "100%",
    fontSize: "16px",
    boxSizing: "border-box" as const,
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.10)",
    color: "white",
    padding: "12px 13px",
    outline: "none",
    touchAction: "manipulation" as const,
  };

  const buttonStyle = {
    width: "100%",
    fontSize: "16px",
    touchAction: "manipulation" as const,
    border: "none",
    borderRadius: "16px",
    padding: "15px",
    fontWeight: 900,
    cursor: "pointer",
    boxSizing: "border-box" as const,
    maxWidth: "100%",
  };

  return (
    <main
      style={pageStyle}
      onDoubleClick={(event) => {
        event.preventDefault();
      }}
    >
      <div style={containerStyle}>
        <header style={{ textAlign: "center", marginBottom: "18px" }}>
          <div
            style={{
              width: "76px",
              height: "76px",
              borderRadius: "50%",
              margin: "0 auto 12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.20)",
              boxShadow: "0 14px 30px rgba(0,0,0,0.30)",
              fontSize: "28px",
              fontWeight: 900,
              letterSpacing: "0.5px",
            }}
          >
            CE
          </div>

          <div
            style={{
              fontSize: "14px",
              fontWeight: 800,
              opacity: 0.82,
              marginBottom: "6px",
            }}
          >
            Criterio Estratégico
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: "26px",
              lineHeight: 1.08,
              fontWeight: 900,
              letterSpacing: "0",
            }}
          >
            REPORTE DE HALLAZGOS V2
          </h1>
        </header>

        <section style={{ ...cardStyle, marginBottom: "14px" }}>
          <div style={{ fontSize: "12px", fontWeight: 900, opacity: 0.7 }}>
            Supervisor activo
          </div>
          <div style={{ fontSize: "22px", fontWeight: 900, marginTop: "6px" }}>
            {supervisor.nombre}
          </div>
          <div style={{ opacity: 0.86, marginTop: "4px" }}>
            {supervisor.cargo}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px",
              marginTop: "14px",
            }}
          >
            <div>
              <div style={{ fontSize: "11px", opacity: 0.62 }}>Empresa</div>
              <div style={{ fontWeight: 800 }}>{supervisor.empresa}</div>
            </div>
            <div>
              <div style={{ fontSize: "11px", opacity: 0.62 }}>Obra</div>
              <div style={{ fontWeight: 800 }}>{supervisor.obra}</div>
            </div>
            <div>
              <div style={{ fontSize: "11px", opacity: 0.62 }}>
                Sigla empresa
              </div>
              <div style={{ fontWeight: 800 }}>{supervisor.siglaEmpresa}</div>
            </div>
            <div>
              <div style={{ fontSize: "11px", opacity: 0.62 }}>
                Sigla proyecto
              </div>
              <div style={{ fontWeight: 800 }}>{supervisor.siglaProyecto}</div>
            </div>
          </div>
          <div
            style={{
              marginTop: "14px",
              padding: "10px 12px",
              borderRadius: "14px",
              background: "rgba(255,255,255,0.08)",
              fontSize: "13px",
              fontWeight: 800,
            }}
          >
            Próximo código: {codigoPreview}
          </div>
        </section>

        <a
          href="/evaluar-v2/reportar"
          style={{
            ...buttonStyle,
            display: "block",
            textAlign: "center",
            textDecoration: "none",
            color: "#08172d",
            background: "linear-gradient(135deg, #67ef48 0%, #d7ff39 100%)",
            boxShadow: "0 14px 28px rgba(103,239,72,0.22)",
            marginBottom: "14px",
          }}
        >
          Reportar Hallazgo
        </a>

        <section style={{ ...cardStyle, marginBottom: "14px" }}>
          <div
            style={{
              fontSize: "18px",
              lineHeight: 1.2,
              fontWeight: 900,
              marginBottom: "12px",
            }}
          >
            Editar supervisor
          </div>

          <div style={{ display: "grid", gap: "11px" }}>
            {[
              ["nombre", "Nombre"],
              ["cargo", "Cargo"],
              ["empresa", "Empresa"],
              ["obra", "Obra"],
              ["siglaEmpresa", "Sigla empresa"],
              ["siglaProyecto", "Sigla proyecto"],
            ].map(([campo, label]) => (
              <label key={campo} style={{ display: "block" }}>
                <span
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 800,
                    opacity: 0.72,
                    marginBottom: "6px",
                  }}
                >
                  {label}
                </span>
                <input
                  type="text"
                  value={draft[campo as keyof SupervisorV2]}
                  onChange={(e) =>
                    actualizarDraft(campo as keyof SupervisorV2, e.target.value)
                  }
                  style={inputStyle}
                />
              </label>
            ))}

            <button
              type="button"
              onClick={guardarSupervisor}
              style={{
                ...buttonStyle,
                color: "white",
                background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              }}
            >
              Guardar supervisor
            </button>

            {mensaje && (
              <div
                style={{
                  borderRadius: "14px",
                  padding: "10px 12px",
                  background: "rgba(103,239,72,0.12)",
                  border: "1px solid rgba(103,239,72,0.24)",
                  fontSize: "14px",
                  fontWeight: 800,
                }}
              >
                {mensaje}
              </div>
            )}
          </div>
        </section>

        <section style={cardStyle}>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 900,
              letterSpacing: "0",
              opacity: 0.7,
              marginBottom: "10px",
            }}
          >
            Contadores locales
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "8px",
            }}
          >
            {[
              ["Reportados", "0"],
              ["Abiertos", "0"],
              ["Cerrados", "0"],
            ].map(([label, valor]) => (
              <div
                key={label}
                style={{
                  borderRadius: "16px",
                  padding: "13px 8px",
                  background: "rgba(255,255,255,0.08)",
                  textAlign: "center",
                  minHeight: "78px",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    opacity: 0.72,
                    marginBottom: "8px",
                  }}
                >
                  {label}
                </div>
                <div style={{ fontSize: "28px", fontWeight: 900 }}>
                  {valor}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
