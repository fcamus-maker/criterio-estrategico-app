"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";

type SupervisorV2 = {
  nombre: string;
  cargo: string;
  empresa: string;
  obra: string;
  siglaEmpresa: string;
  siglaProyecto: string;
  foto: string;
};

const STORAGE_SUPERVISOR = "ce_mobile_v2_supervisor";
const STORAGE_HISTORIAL = "ce_mobile_v2_historial_reportes";

const SUPERVISOR_DEFAULT: SupervisorV2 = {
  nombre: "Freddy Camus",
  cargo: "Ingeniero",
  empresa: "TNT",
  obra: "PEL",
  siglaEmpresa: "TNT",
  siglaProyecto: "PEL",
  foto: "",
};

const FOTO_SUPERVISOR_MAX_PX = 320;
const FOTO_SUPERVISOR_QUALITY = 0.64;

function vibrarOk() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(20);
  }
}

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
      foto: String(guardado.foto || SUPERVISOR_DEFAULT.foto),
    };
  } catch {
    return SUPERVISOR_DEFAULT;
  }
}

function cargarHistorial(): Array<{ estado?: string; estadoCierre?: string }> {
  if (typeof window === "undefined") return [];

  try {
    const guardado = JSON.parse(localStorage.getItem(STORAGE_HISTORIAL) || "[]");
    return Array.isArray(guardado) ? guardado : [];
  } catch {
    return [];
  }
}

function existeSupervisorGuardado() {
  if (typeof window === "undefined") return false;

  try {
    const guardado = JSON.parse(
      localStorage.getItem(STORAGE_SUPERVISOR) || "null"
    );

    return Boolean(guardado && typeof guardado === "object");
  } catch {
    return false;
  }
}

function comprimirFotoSupervisor(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("El archivo seleccionado no es una imagen."));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        const escala = Math.min(
          1,
          FOTO_SUPERVISOR_MAX_PX / Math.max(image.width, image.height)
        );
        const width = Math.max(1, Math.round(image.width * escala));
        const height = Math.max(1, Math.round(image.height * escala));
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
          reject(new Error("No se pudo procesar la fotografía."));
          return;
        }

        canvas.width = width;
        canvas.height = height;
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", FOTO_SUPERVISOR_QUALITY));
      };

      image.onerror = () => {
        reject(new Error("No se pudo leer la fotografía seleccionada."));
      };

      image.src = String(reader.result || "");
    };

    reader.onerror = () => {
      reject(new Error("No se pudo cargar la fotografía del supervisor."));
    };

    reader.readAsDataURL(file);
  });
}

export default function EvaluarV2HomePage() {
  const router = useRouter();
  const [supervisor, setSupervisor] =
    useState<SupervisorV2>(SUPERVISOR_DEFAULT);
  const [draft, setDraft] = useState<SupervisorV2>(SUPERVISOR_DEFAULT);
  const [historial, setHistorial] = useState<
    Array<{ estado?: string; estadoCierre?: string }>
  >([]);
  const [mensaje, setMensaje] = useState("");
  const [botonActivo, setBotonActivo] = useState("");
  const [editorPerfilAbierto, setEditorPerfilAbierto] = useState(false);
  const [perfilSupervisorGuardado, setPerfilSupervisorGuardado] =
    useState(false);
  const [navegandoReporte, setNavegandoReporte] = useState(false);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const supervisorGuardado = cargarSupervisor();
      const tienePerfil = existeSupervisorGuardado();
      setSupervisor(supervisorGuardado);
      setDraft(supervisorGuardado);
      setHistorial(cargarHistorial());
      setPerfilSupervisorGuardado(tienePerfil);
      setEditorPerfilAbierto(!tienePerfil);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const contadores = useMemo(() => {
    const reportados = historial.length;
    const cerrados = historial.filter((reporte) => {
      const estado = String(reporte.estado || "").toLowerCase();
      const estadoCierre = String(reporte.estadoCierre || "").toLowerCase();

      return estado === "cerrado" || estadoCierre === "cerrado";
    }).length;

    return {
      reportados,
      cerrados,
      abiertos: Math.max(reportados - cerrados, 0),
    };
  }, [historial]);

  const codigoPreview = useMemo(() => {
    const proyecto = draft.siglaProyecto.trim().toUpperCase() || "PEL";
    const empresa = draft.siglaEmpresa.trim().toUpperCase() || "TNT";
    const siguiente = String(contadores.reportados + 1).padStart(4, "0");

    return `CE-${proyecto}/${empresa}-V2-${siguiente}`;
  }, [contadores.reportados, draft.siglaEmpresa, draft.siglaProyecto]);

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
      foto: draft.foto,
    };

    try {
      localStorage.setItem(STORAGE_SUPERVISOR, JSON.stringify(actualizado));
      setSupervisor(actualizado);
      setDraft(actualizado);
      setPerfilSupervisorGuardado(true);
      setEditorPerfilAbierto(false);
      setMensaje("Supervisor V2 guardado.");
      vibrarOk();
    } catch {
      const sinFoto: SupervisorV2 = {
        ...actualizado,
        foto: "",
      };

      try {
        localStorage.setItem(STORAGE_SUPERVISOR, JSON.stringify(sinFoto));
        setSupervisor(sinFoto);
        setDraft(sinFoto);
        setPerfilSupervisorGuardado(true);
        setEditorPerfilAbierto(false);
        setMensaje(
          "Datos guardados sin fotografía. Safari no permitió almacenar la imagen por límite de espacio."
        );
        vibrarOk();
      } catch {
        setMensaje(
          "No se pudo guardar el perfil por límite de almacenamiento del navegador."
        );
      }
    }
  };

  const cargarFotoSupervisor = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    const input = event.currentTarget;

    if (!file) {
      input.value = "";
      return;
    }

    setMensaje("Procesando fotografía del supervisor...");

    try {
      const fotoComprimida = await comprimirFotoSupervisor(file);
      setDraft((actual) => ({
        ...actual,
        foto: fotoComprimida,
      }));
      setMensaje("Fotografía del supervisor cargada. Presiona guardar.");
      vibrarOk();
    } catch {
      setMensaje(
        "No se pudo cargar la fotografía. Intenta con otra imagen más liviana."
      );
    } finally {
      input.value = "";
    }
  };

  const actualizarDraft = (campo: keyof SupervisorV2, valor: string) => {
    setDraft((actual) => ({
      ...actual,
      [campo]: valor,
    }));
    setMensaje("");
  };

  const irAReporte = () => {
    if (navegandoReporte) return;

    setNavegandoReporte(true);
    setMensaje("");
    vibrarOk();
    router.push("/evaluar-v2/reportar");
  };

  const feedbackBoton = (id: string) => ({
    onPointerDown: () => setBotonActivo(id),
    onPointerUp: () => setBotonActivo(""),
    onPointerCancel: () => setBotonActivo(""),
    onPointerLeave: () => setBotonActivo(""),
  });

  const estiloFeedback = (id: string) =>
    botonActivo === id
      ? {
          transform: "translateY(2px) scale(0.985)",
          filter: "brightness(1.12)",
          boxShadow: "0 8px 16px rgba(0,0,0,0.28)",
        }
      : {};

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
    padding: "16px 16px calc(96px + env(safe-area-inset-bottom))",
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
    transition: "transform 120ms ease, filter 120ms ease, box-shadow 120ms ease",
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
              width: "88px",
              height: "88px",
              borderRadius: "50%",
              margin: "0 auto 12px",
              backgroundImage: "url('/logo.png')",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.28)",
              boxShadow: "0 16px 34px rgba(0,0,0,0.32)",
            }}
            aria-label="Logo Criterio Estratégico"
          />

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
          <div style={{ display: "flex", gap: "13px", alignItems: "center" }}>
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "18px",
                flex: "0 0 auto",
                background: supervisor.foto
                  ? `url(${supervisor.foto}) center / cover no-repeat`
                  : "linear-gradient(135deg, #1d4ed8, #67ef48)",
                border: "1px solid rgba(255,255,255,0.22)",
                boxShadow: "0 12px 24px rgba(0,0,0,0.28)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
                fontWeight: 900,
              }}
            >
              {!supervisor.foto && "CE"}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "12px", fontWeight: 900, opacity: 0.7 }}>
                Supervisor activo
              </div>
              <div style={{ fontSize: "22px", fontWeight: 900, marginTop: "6px" }}>
                {supervisor.nombre}
              </div>
              <div style={{ opacity: 0.86, marginTop: "4px" }}>
                {supervisor.cargo}
              </div>
            </div>
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
          <button
            type="button"
            onClick={() => {
              setEditorPerfilAbierto((abierto) => !abierto);
              setMensaje("");
              vibrarOk();
            }}
            {...feedbackBoton("editar-supervisor")}
            style={{
              ...buttonStyle,
              marginTop: "12px",
              color: "#eaf6ff",
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.18)",
              boxShadow: "0 12px 22px rgba(0,0,0,0.18)",
              ...estiloFeedback("editar-supervisor"),
            }}
          >
            {perfilSupervisorGuardado
              ? "Editar perfil del supervisor"
              : "Crear perfil del supervisor"}
          </button>
        </section>

        <button
          type="button"
          onClick={irAReporte}
          disabled={navegandoReporte}
          {...feedbackBoton("reportar")}
          style={{
            ...buttonStyle,
            display: "block",
            textAlign: "center",
            textDecoration: "none",
            color: "#08172d",
            background: "linear-gradient(135deg, #67ef48 0%, #d7ff39 100%)",
            boxShadow: "0 14px 28px rgba(103,239,72,0.22)",
            marginBottom: "14px",
            opacity: navegandoReporte ? 0.76 : 1,
            ...estiloFeedback("reportar"),
          }}
        >
          Reportar Hallazgo
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
              marginBottom: "14px",
            }}
          >
            {mensaje}
          </div>
        )}

        {editorPerfilAbierto && (
          <section style={{ ...cardStyle, marginBottom: "14px" }}>
          <div
            style={{
              fontSize: "18px",
              lineHeight: 1.2,
              fontWeight: 900,
              marginBottom: "12px",
            }}
          >
            Editar datos del supervisor
          </div>
          <p style={{ margin: "0 0 12px", fontSize: "13px", opacity: 0.76 }}>
            Actualiza el perfil usado en nuevos reportes V2.
          </p>

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

            <label style={{ display: "block" }}>
              <span
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 800,
                  opacity: 0.72,
                  marginBottom: "6px",
                }}
              >
                Fotografía del supervisor
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={cargarFotoSupervisor}
                style={{
                  ...inputStyle,
                  padding: "10px",
                }}
              />
            </label>

            {draft.foto ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "58px 1fr",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px",
                  borderRadius: "16px",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.14)",
                }}
              >
                <div
                  style={{
                    width: "58px",
                    height: "58px",
                    borderRadius: "14px",
                    background: `url(${draft.foto}) center / cover no-repeat`,
                    border: "1px solid rgba(255,255,255,0.20)",
                  }}
                />
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 800 }}>
                    Fotografía cargada y optimizada
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDraft((actual) => ({ ...actual, foto: "" }));
                      setMensaje("Fotografía quitada. Presiona guardar.");
                      vibrarOk();
                    }}
                    {...feedbackBoton("quitar-foto-supervisor")}
                    style={{
                      marginTop: "8px",
                      border: "1px solid rgba(255,255,255,0.18)",
                      borderRadius: "12px",
                      background: "rgba(255,255,255,0.10)",
                      color: "white",
                      padding: "9px 10px",
                      fontSize: "13px",
                      fontWeight: 900,
                      touchAction: "manipulation",
                      ...estiloFeedback("quitar-foto-supervisor"),
                    }}
                  >
                    Quitar foto
                  </button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: "11px 12px",
                  borderRadius: "16px",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px dashed rgba(255,255,255,0.24)",
                  fontSize: "13px",
                  fontWeight: 800,
                  opacity: 0.86,
                }}
              >
                Sin fotografía cargada. Usa el selector para agregar una imagen.
              </div>
            )}

            <button
              type="button"
              onClick={guardarSupervisor}
              {...feedbackBoton("guardar-supervisor")}
              style={{
                ...buttonStyle,
                color: "white",
                background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                ...estiloFeedback("guardar-supervisor"),
              }}
            >
              Guardar supervisor
            </button>

          </div>
          </section>
        )}

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
              [
                "Reportados",
                `${contadores.reportados}`,
                "linear-gradient(180deg, rgba(59,130,246,0.98), rgba(29,78,216,0.90))",
                "1px solid rgba(147,197,253,0.65)",
                "0 16px 30px rgba(37,99,235,0.34)",
              ],
              [
                "Abiertos",
                `${contadores.abiertos}`,
                "linear-gradient(180deg, rgba(248,113,113,0.98), rgba(220,38,38,0.90))",
                "1px solid rgba(252,165,165,0.65)",
                "0 16px 30px rgba(220,38,38,0.34)",
              ],
              [
                "Cerrados",
                `${contadores.cerrados}`,
                "linear-gradient(180deg, rgba(34,197,94,0.98), rgba(21,128,61,0.90))",
                "1px solid rgba(134,239,172,0.65)",
                "0 16px 30px rgba(21,128,61,0.34)",
              ],
            ].map(([label, valor, background, border, boxShadow]) => (
              <div
                key={label}
                style={{
                  borderRadius: "16px",
                  padding: "13px 8px",
                  background,
                  border,
                  boxShadow,
                  textAlign: "center",
                  minHeight: "78px",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    opacity: 0.9,
                    marginBottom: "8px",
                    fontWeight: 900,
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
