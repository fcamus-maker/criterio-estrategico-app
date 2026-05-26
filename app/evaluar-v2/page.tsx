"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  resolvePlatformLanguage,
  resolvePlatformTheme,
  usePlatformPreferences,
} from "../services/platformPreferences";
import { cerrarSesionCE } from "../services/authProfileService";
import {
  comprimirFotoPerfilUsuario,
  quitarFotoPerfilUsuarioActual,
  subirFotoPerfilUsuarioActual,
} from "../services/profilePhotoService";
import PwaInstallCard from "../components/PwaInstallCard";
import {
  cargarSupervisorV2UsuarioActual,
  cargarSupervisorV2LocalReciente,
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

const textosMobileEn: Record<string, string> = {
  "Supervisor activo": "Active supervisor",
  "Reportar Hallazgo": "Report Finding",
  "Contadores locales": "Local counters",
  Empresa: "Company",
  "Obra / Proyecto": "Site / Project",
  "Sigla empresa": "Company code",
  "Sigla obra / proyecto": "Site / project code",
  "Próximo código": "Next code",
  "Código pendiente": "Pending code",
  "Complete el perfil para generar el código del reporte.": "Complete the profile to generate the report code.",
  "Complete empresa, obra y siglas para generar el código del reporte.": "Complete company, site and codes to generate the report code.",
  "Editar perfil del supervisor": "Edit supervisor profile",
  "Crear perfil del supervisor": "Create supervisor profile",
  "Completar perfil": "Complete profile",
  "Editar datos del supervisor": "Edit supervisor data",
  "Actualiza el perfil usado en nuevos reportes.": "Update the profile used in new reports.",
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
  "Supervisor guardado.": "Supervisor saved.",
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
  const [guardandoSupervisor, setGuardandoSupervisor] = useState(false);
  const [fotoPerfilArchivo, setFotoPerfilArchivo] = useState<File | null>(null);
  const [fotoPerfilPreview, setFotoPerfilPreview] = useState("");
  const [ajusteFotoPerfil, setAjusteFotoPerfil] = useState({
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
  });
  const [fotoPerfilQuitada, setFotoPerfilQuitada] = useState(false);

  useEffect(() => {
    const localReciente = cargarSupervisorV2LocalReciente();
    if (localReciente) {
      const supervisorLocal = localReciente.supervisor;
      setSupervisor(supervisorLocal);
      setDraft(supervisorLocal);
      setClaveSupervisor(localReciente.clave);
      setPerfilSupervisorGuardado(
        localReciente.tienePerfilGuardado &&
          perfilSupervisorV2Completo(supervisorLocal)
      );
    }
    setHistorial(cargarHistorial());

    const frameId = window.requestAnimationFrame(async () => {
      const contexto = await cargarSupervisorV2UsuarioActual();
      const supervisorGuardado = contexto.supervisor;
      const tienePerfil =
        contexto.tienePerfilGuardado &&
        perfilSupervisorV2Completo(supervisorGuardado);
      setSupervisor(supervisorGuardado);
      setDraft(supervisorGuardado);
      setClaveSupervisor(contexto.clave);
      setPerfilSupervisorGuardado(tienePerfil);
      setEditorPerfilAbierto(false);
      setFotoPerfilArchivo(null);
      setFotoPerfilPreview("");
      setFotoPerfilQuitada(false);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    return () => {
      if (fotoPerfilPreview.startsWith("blob:")) {
        URL.revokeObjectURL(fotoPerfilPreview);
      }
    };
  }, [fotoPerfilPreview]);

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
  const inicialSupervisor =
    supervisor.nombre
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((parte) => parte.charAt(0).toUpperCase())
      .join("") || "CE";

  const esFotoTemporal = (foto: string) =>
    foto.startsWith("blob:") || foto.startsWith("data:");

  const guardarSupervisor = async () => {
    if (guardandoSupervisor) return;

    const fotoPersistenteActual = esFotoTemporal(supervisor.foto)
      ? ""
      : supervisor.foto;
    const actualizado: SupervisorV2 = {
      nombre: draft.nombre.trim(),
      cargo: draft.cargo.trim(),
      empresa: draft.empresa.trim(),
      obra: draft.obra.trim(),
      siglaEmpresa: draft.siglaEmpresa.trim().toUpperCase(),
      siglaProyecto: draft.siglaProyecto.trim().toUpperCase(),
      foto: esFotoTemporal(draft.foto) ? fotoPersistenteActual : draft.foto,
    };

    if (!perfilSupervisorV2Completo(actualizado)) {
      setPerfilSupervisorGuardado(false);
      setMensaje(
        "Complete empresa, obra y siglas para generar el código del reporte."
      );
      return;
    }

    setGuardandoSupervisor(true);

    if (fotoPerfilArchivo) {
      setMensaje("Preparando fotografía de perfil...");
      let fotoComprimida;

      try {
        fotoComprimida = await comprimirFotoPerfilUsuario(
          fotoPerfilArchivo,
          ajusteFotoPerfil
        );
      } catch {
        setMensaje("No se pudo ajustar la fotografía. Intenta con otra imagen.");
        setGuardandoSupervisor(false);
        return;
      }

      const resultadoFoto = await subirFotoPerfilUsuarioActual(fotoComprimida);
      actualizado.foto = resultadoFoto.ok
        ? resultadoFoto.fotoUrl
        : fotoComprimida.dataUrl;
    } else if (fotoPerfilQuitada) {
      await quitarFotoPerfilUsuarioActual();
      actualizado.foto = "";
    }

    try {
      guardarSupervisorV2EnClave(claveSupervisor, actualizado);
      setSupervisor(actualizado);
      setDraft(actualizado);
      setPerfilSupervisorGuardado(true);
      setFotoPerfilArchivo(null);
      setFotoPerfilPreview("");
      setFotoPerfilQuitada(false);
      setAjusteFotoPerfil({ zoom: 1, offsetX: 0, offsetY: 0 });
      setEditorPerfilAbierto(false);
      setMensaje(
        fotoPerfilArchivo && actualizado.foto.startsWith("data:")
          ? "Supervisor guardado con foto local. El respaldo remoto queda pendiente."
          : "Supervisor guardado."
      );
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
        setFotoPerfilArchivo(null);
        setFotoPerfilPreview("");
        setFotoPerfilQuitada(false);
        setAjusteFotoPerfil({ zoom: 1, offsetX: 0, offsetY: 0 });
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
    } finally {
      setGuardandoSupervisor(false);
    }
  };

  const cargarFotoSupervisor = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    const input = event.currentTarget;

    if (!file) {
      input.value = "";
      return;
    }

    try {
      if (fotoPerfilPreview.startsWith("blob:")) {
        URL.revokeObjectURL(fotoPerfilPreview);
      }
      const previewUrl = URL.createObjectURL(file);
      setDraft((actual) => ({
        ...actual,
        foto: previewUrl,
      }));
      setFotoPerfilArchivo(file);
      setFotoPerfilPreview(previewUrl);
      setAjusteFotoPerfil({ zoom: 1, offsetX: 0, offsetY: 0 });
      setFotoPerfilQuitada(false);
      setMensaje("Ajusta la fotografía y presiona guardar.");
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
    width: "100%",
    maxWidth: "100vw",
    background:
      temaClaro
        ? "radial-gradient(circle at 50% 0%, rgba(37,99,235,0.16) 0%, #f8fafc 42%, #eaf2ff 100%)"
        : "radial-gradient(circle at 50% 0%, #2563eb 0%, #0b1f3a 42%, #061327 100%)",
    color: temaClaro ? "#0f172a" : "white",
    fontFamily: "Arial, sans-serif",
    overflowX: "hidden" as const,
    touchAction: "pan-y" as const,
    position: "relative" as const,
  };

  const containerStyle = {
    width: "100%",
    maxWidth: "430px",
    minWidth: 0,
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
    minWidth: 0,
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
              {!supervisor.foto && inicialSupervisor}
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
              <div style={{ fontSize: "11px", opacity: 0.62 }}>{t("Obra / Proyecto")}</div>
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
                {t("Sigla obra / proyecto")}
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
            {t("Actualiza el perfil usado en nuevos reportes.")}
          </p>

          <div style={{ display: "grid", gap: "11px" }}>
            {[
              ["nombre", "Nombre"],
              ["cargo", "Cargo"],
              ["empresa", "Empresa"],
              ["obra", "Obra / Proyecto"],
              ["siglaEmpresa", "Sigla empresa"],
              ["siglaProyecto", "Sigla obra / proyecto"],
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
                  gridTemplateColumns: fotoPerfilArchivo ? "1fr" : "58px 1fr",
                  alignItems: fotoPerfilArchivo ? "stretch" : "center",
                  gap: "12px",
                  padding: "10px",
                  borderRadius: "16px",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  width: "100%",
                  maxWidth: "100%",
                  minWidth: 0,
                  boxSizing: "border-box",
                  overflow: "hidden",
                  touchAction: "pan-y",
                }}
              >
                <div
                  style={{
                    width: "58px",
                    height: "58px",
                    maxWidth: "100%",
                    borderRadius: "14px",
                    background: `url(${draft.foto}) center / cover no-repeat`,
                    border: "1px solid rgba(255,255,255,0.20)",
                    boxSizing: "border-box",
                  }}
                />
                <div style={{ minWidth: 0, maxWidth: "100%" }}>
                  <div style={{ fontSize: "13px", fontWeight: 800 }}>
                    {t("Fotografía cargada y optimizada")}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDraft((actual) => ({ ...actual, foto: "" }));
                      setFotoPerfilArchivo(null);
                      setFotoPerfilPreview("");
                      setFotoPerfilQuitada(true);
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
                {fotoPerfilArchivo && (
                  <div
                    style={{
                      display: "grid",
                      gap: "12px",
                      justifyItems: "center",
                      paddingTop: "4px",
                      width: "100%",
                      maxWidth: "100%",
                      minWidth: 0,
                      overflow: "hidden",
                      boxSizing: "border-box",
                    }}
                  >
                    <div
                      style={{
                        width: "min(178px, 72vw)",
                        height: "min(178px, 72vw)",
                        borderRadius: "50%",
                        overflow: "hidden",
                        border: "2px solid rgba(255,255,255,0.24)",
                        boxShadow: "0 12px 24px rgba(0,0,0,0.24)",
                        background: "rgba(255,255,255,0.08)",
                        boxSizing: "border-box",
                        flexShrink: 0,
                        touchAction: "none",
                      }}
                    >
                      <img
                        src={draft.foto}
                        alt={t("Fotografía del supervisor")}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                          transform: `translate(${-ajusteFotoPerfil.offsetX * 22}%, ${-ajusteFotoPerfil.offsetY * 22}%) scale(${ajusteFotoPerfil.zoom})`,
                          transformOrigin: "center",
                          pointerEvents: "none",
                          userSelect: "none",
                        }}
                      />
                    </div>
                    {[
                      {
                        label: "Zoom",
                        min: 1,
                        max: 2.5,
                        step: 0.05,
                        value: ajusteFotoPerfil.zoom,
                        campo: "zoom" as const,
                      },
                      {
                        label: "Horizontal",
                        min: -1,
                        max: 1,
                        step: 0.05,
                        value: ajusteFotoPerfil.offsetX,
                        campo: "offsetX" as const,
                      },
                      {
                        label: "Vertical",
                        min: -1,
                        max: 1,
                        step: 0.05,
                        value: ajusteFotoPerfil.offsetY,
                        campo: "offsetY" as const,
                      },
                    ].map((control) => (
                      <label
                        key={control.campo}
                        style={{
                          width: "100%",
                          maxWidth: "100%",
                          minWidth: 0,
                          display: "grid",
                          gap: "6px",
                          fontSize: "12px",
                          fontWeight: 900,
                          opacity: 0.86,
                          boxSizing: "border-box",
                          overflow: "hidden",
                        }}
                      >
                        {control.label}
                        <input
                          type="range"
                          min={control.min}
                          max={control.max}
                          step={control.step}
                          value={control.value}
                          onChange={(event) =>
                            setAjusteFotoPerfil((actual) => ({
                              ...actual,
                              [control.campo]: Number(event.target.value),
                            }))
                          }
                          style={{
                            display: "block",
                            width: "100%",
                            maxWidth: "100%",
                            minWidth: 0,
                            boxSizing: "border-box",
                            margin: 0,
                            touchAction: "manipulation",
                          }}
                        />
                      </label>
                    ))}
                  </div>
                )}
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
              disabled={guardandoSupervisor}
              {...feedbackBoton("guardar-supervisor")}
              style={{
                ...buttonStyle,
                color: "white",
                background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                opacity: guardandoSupervisor ? 0.72 : 1,
                ...estiloFeedback("guardar-supervisor"),
              }}
            >
              {guardandoSupervisor ? t("Procesando fotografía del supervisor...") : t("Guardar supervisor")}
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
