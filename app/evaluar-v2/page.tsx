"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  resolvePlatformLanguage,
  resolvePlatformTheme,
  usePlatformPreferences,
} from "../services/platformPreferences";
import { obtenerResumenHistorialSupervisorCentral } from "../repositories/hallazgosCentralRepository";
import { cerrarSesionCE } from "../services/authProfileService";
import {
  comprimirFotoPerfilUsuario,
  quitarFotoPerfilUsuarioActual,
  subirFotoPerfilUsuarioActual,
} from "../services/profilePhotoService";
import PwaInstallCard from "../components/PwaInstallCard";
import {
  esErrorChunkStale,
  MENSAJE_CHUNK_STALE,
} from "./chunkLoadRecovery";
import { navegarEvaluarV2 } from "./offlineNavigation";
import {
  cargarHistorialLivianoV2,
  crearScopeLocalReporteV2,
  listarReportesPendientesLocalesV2,
  limpiarReporteActualV2,
} from "./storageReporteV2";
import {
  cargarSupervisorV2UsuarioActual,
  crearCodigoReporteMovil,
  guardarSupervisorV2EnClave,
  perfilSupervisorV2Completo,
  SUPERVISOR_V2_VACIO,
  type SupervisorV2,
} from "./supervisorProfileStorage";
import {
  FirmaPremium,
  PremiumMobileViewport,
} from "./evaluacion/componentesPremium";

const textosMobileEn: Record<string, string> = {
  "Supervisor activo": "Active supervisor",
  "Reportar Hallazgo": "Report Finding",
  "Contadores locales": "Local counters",
  "Historial del supervisor": "Supervisor history",
  "Historial central no disponible temporalmente.": "Central history is temporarily unavailable.",
  "Consultando historial central...": "Checking central history...",
  "Historial sincronizado desde plataforma central.": "History synced from the central platform.",
  "Pendientes en este dispositivo": "Pending on this device",
  "Reportes locales pendientes de sincronización": "Local reports pending synchronization",
  "Hallazgos, inspecciones e ITO de terreno": "Findings, inspections and field ITO",
  "Registro preventivo en terreno alineado a la gestión DS 44, con evidencia, GPS y trazabilidad.": "Field preventive record aligned with DS 44 management, with evidence, GPS and traceability.",
  Empresa: "Company",
  "Obra / Proyecto": "Site / Project",
  "Sigla empresa": "Company code",
  "Sigla obra / proyecto": "Site / project code",
  Siglas: "Codes",
  "Sin asignar": "Not assigned",
  "Próximo código": "Next code",
  "Código pendiente": "Pending code",
  "Complete el perfil para generar el código del reporte.": "Complete the profile to generate the report code.",
  "Complete empresa, obra y siglas para generar el código del reporte.": "Complete company, site and codes to generate the report code.",
  "No se pudo resolver empresa/obra asignada desde el perfil.": "The assigned company/site could not be resolved from the profile.",
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

type ContadoresSupervisor = {
  reportados: number;
  abiertos: number;
  cerrados: number;
};

const CONTADORES_SUPERVISOR_CERO: ContadoresSupervisor = {
  reportados: 0,
  abiertos: 0,
  cerrados: 0,
};

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
  const [historialLocal, setHistorialLocal] = useState<
    Array<{ estado?: string; estadoCierre?: string }>
  >([]);
  const [contadores, setContadores] = useState<ContadoresSupervisor>(
    CONTADORES_SUPERVISOR_CERO
  );
  const [historialCentralDisponible, setHistorialCentralDisponible] =
    useState(false);
  const [cargandoHistorialCentral, setCargandoHistorialCentral] =
    useState(false);
  const [mensajeHistorialCentral, setMensajeHistorialCentral] = useState("");
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
  const [online, setOnline] = useState(true);
  const [pendientesLocales, setPendientesLocales] = useState(0);
  const [scopeLocalReporte, setScopeLocalReporte] = useState("");
  const [sincronizandoPendientes, setSincronizandoPendientes] = useState(false);
  const [ajusteFotoPerfil, setAjusteFotoPerfil] = useState({
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
  });
  const [fotoPerfilQuitada, setFotoPerfilQuitada] = useState(false);

  const scopeDesdeSupervisor = (item: SupervisorV2) =>
    crearScopeLocalReporteV2({
      userId: item.reportanteUserId || item.supervisorUserId || item.userId,
      email: item.email,
      empresaId: item.empresaId,
      obraId: item.obraId,
    });

  const actualizarHistorialCentral = async (item: SupervisorV2) => {
    const userId = item.reportanteUserId || item.supervisorUserId || item.userId;

    if (!userId) {
      setContadores(CONTADORES_SUPERVISOR_CERO);
      setHistorialCentralDisponible(false);
      setMensajeHistorialCentral("");
      setCargandoHistorialCentral(false);
      return;
    }

    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setContadores(CONTADORES_SUPERVISOR_CERO);
      setHistorialCentralDisponible(false);
      setMensajeHistorialCentral(
        "Historial central no disponible temporalmente."
      );
      setCargandoHistorialCentral(false);
      return;
    }

    setCargandoHistorialCentral(true);
    setMensajeHistorialCentral("");

    try {
      const resultado = await obtenerResumenHistorialSupervisorCentral({
        userId,
        empresaId: item.empresaId,
        obraId: item.obraId,
      });

      if (resultado.ok) {
        setContadores(resultado.data);
        setHistorialCentralDisponible(true);
        setMensajeHistorialCentral("");
      } else {
        setContadores(CONTADORES_SUPERVISOR_CERO);
        setHistorialCentralDisponible(false);
        setMensajeHistorialCentral(
          "Historial central no disponible temporalmente."
        );
      }
    } catch {
      setContadores(CONTADORES_SUPERVISOR_CERO);
      setHistorialCentralDisponible(false);
      setMensajeHistorialCentral(
        "Historial central no disponible temporalmente."
      );
    } finally {
      setCargandoHistorialCentral(false);
    }
  };

  useEffect(() => {
    setHistorialLocal([]);

    const frameId = window.requestAnimationFrame(async () => {
      const contexto = await cargarSupervisorV2UsuarioActual();
      const supervisorGuardado = contexto.supervisor;
      const tienePerfil = perfilSupervisorV2Completo(supervisorGuardado);
      const scope = scopeDesdeSupervisor(supervisorGuardado);
      setSupervisor(supervisorGuardado);
      setDraft(supervisorGuardado);
      setClaveSupervisor(contexto.clave);
      setPerfilSupervisorGuardado(tienePerfil);
      setScopeLocalReporte(scope);
      setHistorialLocal(cargarHistorialLivianoV2(scope));
      void actualizarPendientesLocales(scope);
      void actualizarHistorialCentral(supervisorGuardado);
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

  const actualizarPendientesLocales = async (scope = scopeLocalReporte) => {
    if (!scope) {
      setPendientesLocales(0);
      return;
    }

    const pendientes = await listarReportesPendientesLocalesV2(scope);
    setPendientesLocales(pendientes.length);
  };

  const recargarEstadoLocal = (scope = scopeLocalReporte) => {
    if (!scope) {
      setHistorialLocal([]);
      setPendientesLocales(0);
      return;
    }

    setHistorialLocal(cargarHistorialLivianoV2(scope));
    void actualizarPendientesLocales(scope);
  };

  useEffect(() => {
    const actualizarConexion = () => {
      setOnline(typeof navigator === "undefined" ? true : navigator.onLine);
      recargarEstadoLocal(scopeLocalReporte);
      void actualizarHistorialCentral(supervisor);
    };

    actualizarConexion();
    window.addEventListener("online", actualizarConexion);
    window.addEventListener("offline", actualizarConexion);
    window.addEventListener("focus", actualizarConexion);
    window.addEventListener("pageshow", actualizarConexion);
    document.addEventListener("visibilitychange", actualizarConexion);

    return () => {
      window.removeEventListener("online", actualizarConexion);
      window.removeEventListener("offline", actualizarConexion);
      window.removeEventListener("focus", actualizarConexion);
      window.removeEventListener("pageshow", actualizarConexion);
      document.removeEventListener("visibilitychange", actualizarConexion);
    };
  }, [scopeLocalReporte, supervisor]);

  const codigoPreview = useMemo(() => {
    if (!perfilSupervisorGuardado || !perfilSupervisorV2Completo(supervisor)) {
      return "";
    }

    const siguienteCorrelativo = historialCentralDisponible
      ? contadores.reportados + pendientesLocales + 1
      : historialLocal.length + 1;

    return crearCodigoReporteMovil(supervisor, siguienteCorrelativo);
  }, [
    contadores.reportados,
    historialCentralDisponible,
    historialLocal.length,
    pendientesLocales,
    perfilSupervisorGuardado,
    supervisor,
  ]);
  const inicialSupervisor =
    supervisor.nombre
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((parte) => parte.charAt(0).toUpperCase())
      .join("") || "CE";
  const mensajePerfilIncompleto = useMemo(() => {
    if (supervisor.errorContextoPerfil) {
      return supervisor.errorContextoPerfil;
    }

    if (supervisor.empresaId || supervisor.obraId) {
      return "No se pudo resolver empresa/obra asignada desde el perfil.";
    }

    return "Complete el perfil para generar el código del reporte.";
  }, [supervisor]);

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
      empresaId: draft.empresaId || supervisor.empresaId,
      obraId: draft.obraId || supervisor.obraId,
      userId: draft.userId || supervisor.userId,
      email: draft.email || supervisor.email,
      reportanteUserId: draft.reportanteUserId || supervisor.reportanteUserId,
      supervisorUserId: draft.supervisorUserId || supervisor.supervisorUserId,
      errorContextoPerfil: draft.errorContextoPerfil || supervisor.errorContextoPerfil,
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
      const scope = scopeDesdeSupervisor(actualizado);
      setSupervisor(actualizado);
      setDraft(actualizado);
      setScopeLocalReporte(scope);
      setHistorialLocal(cargarHistorialLivianoV2(scope));
      void actualizarPendientesLocales(scope);
      void actualizarHistorialCentral(actualizado);
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
        const scope = scopeDesdeSupervisor(sinFoto);
        setSupervisor(sinFoto);
        setDraft(sinFoto);
        setScopeLocalReporte(scope);
        setHistorialLocal(cargarHistorialLivianoV2(scope));
        void actualizarPendientesLocales(scope);
        void actualizarHistorialCentral(sinFoto);
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
      setMensaje(mensajePerfilIncompleto);
      return;
    }

    limpiarReporteActualV2();
    setNavegandoReporte(true);
    setMensaje("");
    vibrarOk();
    navegarEvaluarV2(router, "/evaluar-v2/reportar");
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

  const sincronizarPendientes = async () => {
    if (sincronizandoPendientes || !online) return;

    setSincronizandoPendientes(true);
    setMensaje("");

    try {
      const { sincronizarReportesPendientesV2 } = await import(
        "@/app/services/guardarReporteV2Completo"
      );
      const resultado = await sincronizarReportesPendientesV2(scopeLocalReporte);
      setMensaje(resultado.mensaje);
      await actualizarPendientesLocales(scopeLocalReporte);
      setHistorialLocal(cargarHistorialLivianoV2(scopeLocalReporte));
      await actualizarHistorialCentral(supervisor);
      vibrarOk();
    } catch (error) {
      if (esErrorChunkStale(error)) {
        setMensaje(MENSAJE_CHUNK_STALE);
        await actualizarPendientesLocales(scopeLocalReporte);
        return;
      }

      setMensaje(
        `No se pudo sincronizar pendientes: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setSincronizandoPendientes(false);
    }
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
    minHeight: "100dvh",
    width: "100%",
    maxWidth: "100vw",
    backgroundColor: "#020b1f",
    background:
      temaClaro
        ? "radial-gradient(circle at 18% 8%, rgba(78,148,255,0.20) 0%, #f8fafc 45%, #eaf2ff 100%)"
        : "radial-gradient(circle at 22% 12%, rgba(60,130,220,0.46) 0%, rgba(7,32,68,0.92) 31%, rgba(2,12,32,1) 72%), linear-gradient(180deg, #05244a 0%, #020b1f 100%)",
    color: temaClaro ? "#0f172a" : "white",
    fontFamily: "Arial, sans-serif",
    overflowX: "hidden" as const,
    overscrollBehaviorY: "none" as const,
    touchAction: "pan-y" as const,
    position: "relative" as const,
  };

  const containerStyle = {
    width: "100%",
    maxWidth: "430px",
    minWidth: 0,
    margin: "0 auto",
    padding:
      "calc(12px + env(safe-area-inset-top)) 15px calc(32px + env(safe-area-inset-bottom))",
    boxSizing: "border-box" as const,
    overflowX: "hidden" as const,
    overscrollBehaviorY: "contain" as const,
    touchAction: "pan-y" as const,
    display: "grid",
    gap: "12px",
  };

  const cardStyle = {
    borderRadius: "18px",
    background:
      temaClaro
        ? "linear-gradient(180deg, rgba(255,255,255,0.94), rgba(241,245,249,0.86))"
        : "linear-gradient(180deg, rgba(22,72,124,0.66), rgba(4,26,60,0.78))",
    border: temaClaro ? "1px solid rgba(100,116,139,0.22)" : "1px solid rgba(151,197,255,0.30)",
    boxShadow: temaClaro
      ? "0 18px 36px rgba(15,23,42,0.12)"
      : "0 18px 42px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.11), inset 0 -1px 0 rgba(33,150,243,0.10)",
    padding: "14px",
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
    border: "1px solid rgba(128,184,255,0.50)",
    borderRadius: "18px",
    padding: "15px",
    fontWeight: 900,
    cursor: "pointer",
    boxSizing: "border-box" as const,
    maxWidth: "100%",
    transition: "transform 120ms ease, filter 120ms ease, box-shadow 120ms ease",
  };

  return (
    <>
      <PremiumMobileViewport />
      <main
        className="ce-mobile-app-shell"
        style={pageStyle}
        onDoubleClick={(event) => {
          event.preventDefault();
        }}
      >
      <div style={containerStyle}>
        <header style={{ textAlign: "center" }}>
          <div
            style={{
              width: "72px",
              height: "72px",
              margin: "0 auto 6px",
              backgroundColor: "transparent",
              backgroundImage: "url('/assets/logo-ce.png')",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "contain",
              filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.44))",
            }}
            aria-label="Logo Criterio Estratégico"
          />

          <div
            style={{
              fontSize: "14px",
              fontWeight: 800,
              opacity: 0.82,
              marginBottom: "5px",
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
          <div
            style={{
              marginTop: "8px",
              fontSize: "14px",
              lineHeight: 1.25,
              fontWeight: 900,
              opacity: 0.9,
            }}
          >
            {t("Hallazgos, inspecciones e ITO de terreno")}
          </div>
          <p
            style={{
              margin: "7px auto 0",
              maxWidth: "340px",
              fontSize: "12px",
              lineHeight: 1.42,
              fontWeight: 750,
              opacity: 0.72,
            }}
          >
            {t("Registro preventivo en terreno alineado a la gestión DS 44, con evidencia, GPS y trazabilidad.")}
          </p>
        </header>

        <section
          style={{
            ...cardStyle,
            background: online
              ? temaClaro
                ? "rgba(240,253,244,0.88)"
                : "rgba(34,197,94,0.12)"
              : temaClaro
                ? "rgba(255,247,237,0.90)"
                : "rgba(249,115,22,0.14)",
            border: online
              ? temaClaro
                ? "1px solid rgba(22,163,74,0.24)"
                : "1px solid rgba(34,197,94,0.26)"
              : temaClaro
                ? "1px solid rgba(234,88,12,0.26)"
                : "1px solid rgba(249,115,22,0.30)",
          }}
        >
          <div style={{ display: "grid", gap: "9px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "10px",
                alignItems: "center",
              }}
            >
              <div style={{ fontSize: "15px", fontWeight: 950 }}>
                {online ? "Online" : "Offline"}
              </div>
              <div
                style={{
                  borderRadius: "999px",
                  padding: "6px 9px",
                  background: online
                    ? "rgba(34,197,94,0.18)"
                    : "rgba(249,115,22,0.20)",
                  color: temaClaro ? "#0f172a" : "white",
                  fontSize: "11px",
                  fontWeight: 950,
                }}
              >
                Pendientes: {pendientesLocales}
              </div>
            </div>
            <div
              style={{
                fontSize: "13px",
                lineHeight: 1.38,
                fontWeight: 800,
                opacity: 0.78,
              }}
            >
              {online
                ? "Con conexión disponible para sincronizar Supabase y Storage."
                : "Modo offline activo. El reporte quedará pendiente de sincronización."}
            </div>
            {online && pendientesLocales > 0 && (
              <button
                type="button"
                onClick={sincronizarPendientes}
                disabled={sincronizandoPendientes}
                {...feedbackBoton("sincronizar-pendientes")}
                style={{
                  ...buttonStyle,
                  marginTop: "2px",
                  color: "white",
                  background: sincronizandoPendientes
                    ? "rgba(255,255,255,0.18)"
                    : "linear-gradient(135deg, #2563eb, #1d4ed8)",
                  opacity: sincronizandoPendientes ? 0.72 : 1,
                  ...estiloFeedback("sincronizar-pendientes"),
                }}
              >
                {sincronizandoPendientes
                  ? "Sincronizando..."
                  : "Sincronizar pendientes"}
              </button>
            )}
          </div>
        </section>

        <section style={cardStyle}>
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
              <div style={{ fontWeight: 800 }}>
                {supervisor.empresa || t("Sin asignar")}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "11px", opacity: 0.62 }}>{t("Obra / Proyecto")}</div>
              <div style={{ fontWeight: 800 }}>
                {supervisor.obra || t("Sin asignar")}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "11px", opacity: 0.62 }}>
                {t("Sigla empresa")}
              </div>
              <div style={{ fontWeight: 800 }}>
                {supervisor.siglaEmpresa || t("Sin asignar")}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "11px", opacity: 0.62 }}>
                {t("Sigla obra / proyecto")}
              </div>
              <div style={{ fontWeight: 800 }}>
                {supervisor.siglaProyecto || t("Sin asignar")}
              </div>
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
                  {t(mensajePerfilIncompleto)}
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
            color: "white",
            background:
              "linear-gradient(180deg, #2593ff 0%, #145ee9 48%, #07339b 100%)",
            boxShadow:
              "0 20px 36px rgba(15,94,255,0.42), inset 0 1px 0 rgba(255,255,255,0.30), inset 0 -10px 24px rgba(0,18,94,0.30)",
            opacity: navegandoReporte ? 0.76 : 1,
            ...estiloFeedback("reportar"),
          }}
        >
          {t("Reportar Hallazgo")}
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
            {t(mensaje)}
          </div>
        )}

        {editorPerfilAbierto && (
          <section style={cardStyle}>
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
                  value={String(draft[campo as keyof SupervisorV2] || "")}
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
            {t("Historial del supervisor")}
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
          <div
            style={{
              marginTop: "10px",
              fontSize: "12px",
              lineHeight: 1.35,
              fontWeight: 800,
              color: temaClaro ? "#475569" : "rgba(226,232,240,0.74)",
            }}
          >
            {cargandoHistorialCentral
              ? t("Consultando historial central...")
              : mensajeHistorialCentral
                ? t(mensajeHistorialCentral)
                : historialCentralDisponible
                  ? t("Historial sincronizado desde plataforma central.")
                  : ""}
          </div>
        </section>

        <section
          style={{
            ...cardStyle,
            padding: "14px",
            display: "grid",
            gap: "10px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: 900,
              letterSpacing: "0",
              opacity: 0.7,
            }}
          >
            {t("Pendientes en este dispositivo")}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                lineHeight: 1.35,
                fontWeight: 800,
                color: temaClaro ? "#475569" : "rgba(226,232,240,0.78)",
              }}
            >
              {t("Reportes locales pendientes de sincronización")}
            </div>
            <div
              style={{
                minWidth: "48px",
                borderRadius: "14px",
                padding: "8px 10px",
                textAlign: "center",
                fontSize: "22px",
                fontWeight: 950,
                color: temaClaro ? "#0f172a" : "white",
                background: temaClaro
                  ? "rgba(15,23,42,0.06)"
                  : "rgba(255,255,255,0.08)",
                border: temaClaro
                  ? "1px solid rgba(15,23,42,0.10)"
                  : "1px solid rgba(255,255,255,0.12)",
              }}
            >
              {pendientesLocales}
            </div>
          </div>
        </section>

        <div>
          <PwaInstallCard theme={temaClaro ? "light" : "dark"} compact />
        </div>
        <FirmaPremium />
      </div>
      </main>
    </>
  );
}
