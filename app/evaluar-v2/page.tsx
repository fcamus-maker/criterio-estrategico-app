"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  resolvePlatformLanguage,
  resolvePlatformTheme,
  usePlatformPreferences,
} from "../services/platformPreferences";
import { cerrarSesionCE } from "../services/authProfileService";
import PwaInstallCard from "../components/PwaInstallCard";
import {
  cargarSupervisorV2UsuarioActual,
  crearCodigoReporteMovil,
  guardarSupervisorV2EnClave,
  perfilSupervisorV2Completo,
  SUPERVISOR_V2_VACIO,
} from "./supervisorProfileStorage";

type SupervisorV2 = {
  nombre: string;
  cargo: string;
  empresa: string;
  obra: string;
  siglaEmpresa: string;
  siglaProyecto: string;
  foto: string;
};

const STORAGE_HISTORIAL = "ce_mobile_v2_historial_reportes";

const FOTO_SUPERVISOR_MAX_PX = 320;
const FOTO_SUPERVISOR_QUALITY = 0.64;

const textosMobileEn: Record<string, string> = {
  "Supervisor activo": "Active supervisor",
  "Reportar Hallazgo": "Report Finding",
  "Contadores locales": "Local counters",
  Empresa: "Company",
  Obra: "Site",
  "Sigla empresa": "Company code",
  "Sigla proyecto": "Project code",
  "Próximo código": "Next code",
  "Código pendiente": "Pending code",
  "Complete el perfil para generar el código del reporte.": "Complete the profile to generate the report code.",
  "Complete empresa, obra y siglas para generar el código del reporte.": "Complete company, site and codes to generate the report code.",
  "Editar perfil del supervisor": "Edit supervisor profile",
  "Crear perfil del supervisor": "Create supervisor profile",
  "Completar perfil": "Complete profile",
  "Editar datos del supervisor": "Edit supervisor data",
  "Actualiza el perfil usado en nuevos reportes V2.": "Update the profile used in new V2 reports.",
  Nombre: "Name",
  Cargo: "Role",
  "Fotografía del supervisor": "Supervisor photo",
  "Fotografía cargada y optimizada": "Photo loaded and optimized",
  "Fotografía quitada. Presiona guardar.": "Photo removed. Press save.",
  "Quitar foto": "Remove photo",
  "Sin fotografía cargada. Usa el selector para agregar una imagen.": "No photo loaded. Use the selector to add an image.",
  "Guardar supervisor": "Save supervisor",
  Reportados: "Reported",
  Abiertos: "Open",
  Cerrados: "Closed",
  "Supervisor V2 guardado.": "V2 supervisor saved.",
  "Procesando fotografía del supervisor...": "Processing supervisor photo...",
  "Fotografía del supervisor cargada. Presiona guardar.": "Supervisor photo loaded. Press save.",
  "Cerrar sesión": "Sign out",
  "Cerrando sesión...": "Signing out...",
  "Cierra la sesión actual y vuelve al acceso seguro.": "End the current session and return to secure access.",
  "No se pudo cerrar la sesión. Intenta nuevamente.": "The session could not be closed. Please try again.",
};

function vibrarOk() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(20);
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
  const preferencias = usePlatformPreferences();
  const temaClaro = resolvePlatformTheme(preferencias.theme) === "light";
  const idiomaActivo = resolvePlatformLanguage(preferencias.language);
  const t = (texto: string) =>
    idiomaActivo === "en" ? textosMobileEn[texto] || texto : texto;
  const [supervisor, setSupervisor] =
    useState<SupervisorV2>(SUPERVISOR_V2_VACIO);
  const [draft, setDraft] = useState<SupervisorV2>(SUPERVISOR_V2_VACIO);
  const [historial, setHistorial] = useState<
    Array<{ estado?: string; estadoCierre?: string }>
  >([]);
  const [mensaje, setMensaje] = useState("");
  const [botonActivo, setBotonActivo] = useState("");
  const [editorPerfilAbierto, setEditorPerfilAbierto] = useState(false);
  const [perfilSupervisorGuardado, setPerfilSupervisorGuardado] =
    useState(false);
  const [claveSupervisor, setClaveSupervisor] = useState("");
  const [navegandoReporte, setNavegandoReporte] = useState(false);
  const [cerrandoSesion, setCerrandoSesion] = useState(false);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(async () => {
      const contexto = await cargarSupervisorV2UsuarioActual();
      const supervisorGuardado = contexto.supervisor;
      const tienePerfil =
        contexto.tienePerfilGuardado &&
        perfilSupervisorV2Completo(supervisorGuardado);
      setSupervisor(supervisorGuardado);
      setDraft(supervisorGuardado);
      setHistorial(cargarHistorial());
      setClaveSupervisor(contexto.clave);
      setPerfilSupervisorGuardado(tienePerfil);
      setEditorPerfilAbierto(false);
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
    if (!perfilSupervisorGuardado || !perfilSupervisorV2Completo(supervisor)) {
      return "";
    }

    return crearCodigoReporteMovil(supervisor, contadores.reportados + 1);
  }, [contadores.reportados, perfilSupervisorGuardado, supervisor]);

  const guardarSupervisor = () => {
    const actualizado: SupervisorV2 = {
      nombre: draft.nombre.trim(),
      cargo: draft.cargo.trim(),
      empresa: draft.empresa.trim(),
      obra: draft.obra.trim(),
      siglaEmpresa: draft.siglaEmpresa.trim().toUpperCase(),
      siglaProyecto: draft.siglaProyecto.trim().toUpperCase(),
      foto: draft.foto,
    };

    if (!perfilSupervisorV2Completo(actualizado)) {
      setPerfilSupervisorGuardado(false);
      setMensaje(
        "Complete empresa, obra y siglas para generar el código del reporte."
      );
      return;
    }

    try {
      guardarSupervisorV2EnClave(claveSupervisor, actualizado);
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
        guardarSupervisorV2EnClave(claveSupervisor, sinFoto);
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

    if (!perfilSupervisorGuardado || !perfilSupervisorV2Completo(supervisor)) {
      setEditorPerfilAbierto(true);
      setMensaje(
        "Complete el perfil para generar el código del reporte."
      );
      return;
    }

    setNavegandoReporte(true);
    setMensaje("");
    vibrarOk();
    router.push("/evaluar-v2/reportar");
  };

  const cerrarSesionSupervisor = async () => {
    if (cerrandoSesion) return;

    setCerrandoSesion(true);
    setMensaje("");

    const resultado = await cerrarSesionCE();

    if (!resultado.ok) {
      setMensaje("No se pudo cerrar la sesión. Intenta nuevamente.");
      setCerrandoSesion(false);
      return;
    }

    vibrarOk();
    router.replace("/login");
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
      temaClaro
        ? "radial-gradient(circle at 50% 0%, rgba(37,99,235,0.16) 0%, #f8fafc 42%, #eaf2ff 100%)"
        : "radial-gradient(circle at 50% 0%, #2563eb 0%, #0b1f3a 42%, #061327 100%)",
    color: temaClaro ? "#0f172a" : "white",
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
      temaClaro
        ? "linear-gradient(180deg, rgba(255,255,255,0.94), rgba(241,245,249,0.86))"
        : "linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.07))",
    border: temaClaro ? "1px solid rgba(100,116,139,0.22)" : "1px solid rgba(255,255,255,0.16)",
    boxShadow: temaClaro ? "0 18px 36px rgba(15,23,42,0.12)" : "0 18px 36px rgba(0,0,0,0.28)",
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
    border: temaClaro ? "1px solid rgba(100,116,139,0.26)" : "1px solid rgba(255,255,255,0.14)",
    borderRadius: "14px",
    background: temaClaro ? "#f8fafc" : "rgba(255,255,255,0.10)",
    color: temaClaro ? "#0f172a" : "white",
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
            REPORTE DE HALLAZGOS
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
                {t("Supervisor activo")}
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
              <div style={{ fontSize: "11px", opacity: 0.62 }}>{t("Empresa")}</div>
              <div style={{ fontWeight: 800 }}>{supervisor.empresa}</div>
            </div>
            <div>
              <div style={{ fontSize: "11px", opacity: 0.62 }}>{t("Obra")}</div>
              <div style={{ fontWeight: 800 }}>{supervisor.obra}</div>
            </div>
            <div>
              <div style={{ fontSize: "11px", opacity: 0.62 }}>
                {t("Sigla empresa")}
              </div>
              <div style={{ fontWeight: 800 }}>{supervisor.siglaEmpresa}</div>
            </div>
            <div>
              <div style={{ fontSize: "11px", opacity: 0.62 }}>
                {t("Sigla proyecto")}
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
            {codigoPreview ? (
              <>
                {t("Próximo código")}: {codigoPreview}
              </>
            ) : (
              <>
                {t("Código pendiente")}
                <div
                  style={{
                    marginTop: "4px",
                    fontSize: "12px",
                    opacity: 0.72,
                    lineHeight: 1.35,
                  }}
                >
                  {t("Complete el perfil para generar el código del reporte.")}
                </div>
              </>
            )}
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
              ? t("Editar perfil del supervisor")
              : t("Completar perfil")}
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
          {t("Reportar Hallazgo")}
        </button>

        <div style={{ marginBottom: "14px" }}>
          <PwaInstallCard theme={temaClaro ? "light" : "dark"} compact />
        </div>

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
            {t(mensaje)}
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
            {t("Editar datos del supervisor")}
          </div>
          <p style={{ margin: "0 0 12px", fontSize: "13px", opacity: 0.76 }}>
            {t("Actualiza el perfil usado en nuevos reportes V2.")}
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
                  {t(label)}
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
                {t("Fotografía del supervisor")}
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
                    {t("Fotografía cargada y optimizada")}
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
                      color: temaClaro ? "#0f172a" : "white",
                      padding: "9px 10px",
                      fontSize: "13px",
                      fontWeight: 900,
                      touchAction: "manipulation",
                      ...estiloFeedback("quitar-foto-supervisor"),
                    }}
                  >
                    {t("Quitar foto")}
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
                {t("Sin fotografía cargada. Usa el selector para agregar una imagen.")}
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
              {t("Guardar supervisor")}
            </button>

            <div
              style={{
                display: "grid",
                gap: "9px",
                padding: "12px",
                borderRadius: "16px",
                background: temaClaro ? "rgba(248,250,252,0.72)" : "rgba(255,255,255,0.06)",
                border: temaClaro
                  ? "1px solid rgba(100,116,139,0.18)"
                  : "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  lineHeight: 1.4,
                  fontWeight: 800,
                  opacity: 0.72,
                }}
              >
                {t("Cierra la sesión actual y vuelve al acceso seguro.")}
              </div>
              <button
                type="button"
                onClick={cerrarSesionSupervisor}
                disabled={cerrandoSesion}
                {...feedbackBoton("cerrar-sesion-supervisor")}
                style={{
                  ...buttonStyle,
                  color: temaClaro ? "#0f172a" : "white",
                  background: temaClaro ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.10)",
                  border: temaClaro
                    ? "1px solid rgba(100,116,139,0.24)"
                    : "1px solid rgba(255,255,255,0.18)",
                  boxShadow: "none",
                  opacity: cerrandoSesion ? 0.72 : 1,
                  ...estiloFeedback("cerrar-sesion-supervisor"),
                }}
              >
                {cerrandoSesion ? t("Cerrando sesión...") : t("Cerrar sesión")}
              </button>
            </div>

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
            {t("Contadores locales")}
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
                t("Reportados"),
                `${contadores.reportados}`,
                "linear-gradient(180deg, rgba(59,130,246,0.98), rgba(29,78,216,0.90))",
                "1px solid rgba(147,197,253,0.65)",
                "0 16px 30px rgba(37,99,235,0.34)",
              ],
              [
                t("Abiertos"),
                `${contadores.abiertos}`,
                "linear-gradient(180deg, rgba(248,113,113,0.98), rgba(220,38,38,0.90))",
                "1px solid rgba(252,165,165,0.65)",
                "0 16px 30px rgba(220,38,38,0.34)",
              ],
              [
                t("Cerrados"),
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
