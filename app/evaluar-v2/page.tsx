"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  resolvePlatformLanguage,
  resolvePlatformTheme,
  usePlatformPreferences,
} from "../services/platformPreferences";
import {
  actualizarHallazgoCentral,
  listarHallazgosSupervisorCentral,
  obtenerResumenHistorialSupervisorCentral,
  subirEvidenciaHallazgo,
} from "../repositories/hallazgosCentralRepository";
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
import type {
  BitacoraHallazgoCentral,
  EvidenciaHallazgoCentral,
  HallazgoCentral,
  SeguimientoCierreCentral,
} from "../types/hallazgoCentral";

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
  "Por cerrar": "To close",
  "En revisión": "Under review",
  "No hay hallazgos en esta categoría.": "There are no findings in this category.",
  "Solo lectura en esta versión": "Read-only in this version",
  "Gestión de cierre próxima fase": "Closure management in the next phase",
  "Volver al resumen": "Back to summary",
  "Mostrar más": "Show more",
  Hoy: "Today",
  Semana: "Week",
  Mes: "Month",
  Fecha: "Date",
  Mostrando: "Showing",
  "Seleccionar fecha": "Select date",
  "Corresponde a hallazgos abiertos o pendientes de gestión.":
    "Findings that are open or pending management.",
  "Corresponde a hallazgos donde ya se cargó evidencia de cierre y están esperando validación.":
    "Findings with closure evidence already uploaded and awaiting validation.",
  "Corresponde a hallazgos finalizados con evidencia o justificación registrada.":
    "Findings finalized with registered evidence or justification.",
  Cerrar: "Close",
  "Evidencia de cierre": "Closure evidence",
  "Agregar evidencia de cierre": "Add closure evidence",
  "Tomar foto de evidencia": "Take evidence photo",
  "Tomar fotografía de cierre": "Take closure photo",
  "Cámara de cierre": "Closure camera",
  "Capturar fotografía": "Capture photo",
  "Reintentar cámara": "Retry camera",
  "Fotografía obligatoria": "Photo required",
  "Sin fotografía seleccionada": "No photo selected",
  "Fotografía seleccionada correctamente": "Photo selected successfully",
  "No se seleccionó ninguna fotografía.": "No photo was selected.",
  "No se pudo cargar la fotografía. Intenta nuevamente.": "The photo could not be loaded. Try again.",
  "No se pudo preparar la vista previa de la fotografía.": "The photo preview could not be prepared.",
  "No se pudo procesar la fotografía capturada.": "The captured photo could not be processed.",
  "No se pudo iniciar la cámara. Revisa los permisos de cámara del navegador e intenta nuevamente.":
    "The camera could not be started. Check browser camera permissions and try again.",
  "Imagen lista para enviar": "Image ready to send",
  "Procesando fotografía de cierre...": "Processing closure photo...",
  "Iniciando cámara de cierre...": "Starting closure camera...",
  "Vista previa de la fotografía seleccionada": "Preview of the selected photo",
  "Tocar imagen para ampliar": "Tap image to enlarge",
  "Cerrar vista ampliada": "Close enlarged view",
  "Comentario obligatorio": "Comment required",
  "Describe brevemente la corrección realizada": "Briefly describe the correction performed",
  "Enviar a revisión": "Send for review",
  "Cerrar con evidencia": "Close with evidence",
  "Cerrando hallazgo...": "Closing finding...",
  "Cerrar hallazgo con evidencia": "Close finding with evidence",
  "Este hallazgo será marcado como cerrado con evidencia. La acción quedará registrada en la bitácora.":
    "This finding will be marked as closed with evidence. The action will be recorded in the log.",
  "Confirmar cierre": "Confirm closure",
  "Los hallazgos de baja criticidad pueden cerrarse directamente con evidencia.":
    "Low-criticality findings can be closed directly with evidence.",
  "Este hallazgo requiere revisión antes del cierre.":
    "This finding requires review before closure.",
  "Solo hallazgos de baja criticidad pueden cerrarse directamente desde móvil.":
    "Only low-criticality findings can be closed directly from mobile.",
  "Enviando evidencia...": "Sending evidence...",
  Cancelar: "Cancel",
  "La fotografía de cierre es obligatoria.": "Closure photo is required.",
  "Agrega un comentario de al menos 5 caracteres.": "Add a comment of at least 5 characters.",
  "No se pudo identificar el hallazgo para actualizarlo.": "The finding could not be identified for update.",
  "No se pudo enviar la evidencia. Intenta nuevamente con conexión.": "The evidence could not be sent. Try again with a connection.",
  "Evidencia enviada a revisión.": "Evidence sent for review.",
  "Hallazgo cerrado con evidencia.": "Finding closed with evidence.",
  "Evidencia enviada": "Evidence sent",
  "Fecha de envío": "Sent date",
  "Comentario de cierre": "Closure comment",
  "Fecha compromiso": "Due date",
  Responsable: "Owner",
  "Sin responsable": "No owner",
  "Sin fecha compromiso": "No due date",
  "Sin área": "No area",
  "Sin descripción disponible": "No description available",
  "Listado de hallazgos": "Findings list",
  "Consulta central no disponible temporalmente.": "Central query is temporarily unavailable.",
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

type CategoriaCierreMovil = "por_cerrar" | "en_revision" | "cerrados";

type ResumenCierreMovil = Record<CategoriaCierreMovil, HallazgoCentral[]>;

type FiltroFechaCierreMovil = "hoy" | "semana" | "mes" | "fecha";

const LIMITE_INICIAL_LISTADO_CIERRE_MOVIL = 30;
const INCREMENTO_LISTADO_CIERRE_MOVIL = 30;
const FOTO_CIERRE_CALIDAD_JPEG = 0.88;

const CONTADORES_SUPERVISOR_CERO: ContadoresSupervisor = {
  reportados: 0,
  abiertos: 0,
  cerrados: 0,
};

function normalizarTextoCierreMovil(valor: unknown) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
}

function hallazgoCerradoMovil(hallazgo: HallazgoCentral) {
  const estado = normalizarTextoCierreMovil(hallazgo.estado);
  const estadoCierre = normalizarTextoCierreMovil(hallazgo.estadoCierre);
  const seguimiento = hallazgo.seguimientoCierre;
  const estadoSeguimiento = normalizarTextoCierreMovil(
    seguimiento?.estadoSeguimiento || seguimiento?.estadoCierre
  );

  return (
    estado === "CERRADO" ||
    estadoCierre === "CERRADO" ||
    estadoSeguimiento.includes("CERRADO")
  );
}

function hallazgoEnRevisionMovil(hallazgo: HallazgoCentral) {
  if (hallazgoCerradoMovil(hallazgo)) return false;

  const seguimiento = hallazgo.seguimientoCierre;
  const estadoCierre = normalizarTextoCierreMovil(hallazgo.estadoCierre);
  const estadoSeguimiento = normalizarTextoCierreMovil(
    seguimiento?.estadoSeguimiento || seguimiento?.estadoCierre
  );
  const validadorEstado = normalizarTextoCierreMovil(seguimiento?.validadorEstado);
  const evidenciaRecibida = seguimiento?.evidenciaRecibida || [];

  return (
    estadoSeguimiento.includes("REVISION") ||
    estadoSeguimiento.includes("VALIDACION") ||
    estadoSeguimiento.includes("EVIDENCIA CARGADA") ||
    estadoSeguimiento.includes("CORRECCION INFORMADA") ||
    validadorEstado.includes("REVISION") ||
    validadorEstado.includes("PENDIENTE") ||
    estadoCierre.includes("REVISION") ||
    evidenciaRecibida.length > 0
  );
}

function hallazgoBajoCierreMovil(hallazgo: HallazgoCentral) {
  return normalizarTextoCierreMovil(hallazgo.criticidad) === "BAJO";
}

function agruparHallazgosCierreMovil(
  hallazgos: HallazgoCentral[]
): ResumenCierreMovil {
  return hallazgos.reduce<ResumenCierreMovil>(
    (acumulado, hallazgo) => {
      if (hallazgoCerradoMovil(hallazgo)) {
        acumulado.cerrados.push(hallazgo);
      } else if (hallazgoEnRevisionMovil(hallazgo)) {
        acumulado.en_revision.push(hallazgo);
      } else {
        acumulado.por_cerrar.push(hallazgo);
      }

      return acumulado;
    },
    {
      por_cerrar: [],
      en_revision: [],
      cerrados: [],
    }
  );
}

function estadoVisibleCierreMovil(hallazgo: HallazgoCentral) {
  return (
    hallazgo.seguimientoCierre?.estadoSeguimiento ||
    hallazgo.seguimientoCierre?.estadoCierre ||
    hallazgo.estadoCierre ||
    hallazgo.estado ||
    "Sin estado"
  );
}

function responsableVisibleCierreMovil(hallazgo: HallazgoCentral) {
  return (
    hallazgo.seguimientoCierre?.responsable?.nombre ||
    hallazgo.seguimientoCierre?.responsable?.empresa ||
    ""
  );
}

function descripcionBreveCierreMovil(hallazgo: HallazgoCentral) {
  const descripcion = hallazgo.descripcion.trim();
  if (descripcion.length <= 92) return descripcion;
  return `${descripcion.slice(0, 89).trim()}...`;
}

function claveHallazgoCierreMovil(hallazgo: HallazgoCentral) {
  return hallazgo.id || hallazgo.codigo;
}

function fechaLocalInputCierreMovil(fecha = new Date()) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

function fechaLegibleCierreMovil(valor: string) {
  const fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime())) {
    return String(valor || "").slice(0, 10) || "--";
  }

  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const anio = String(fecha.getFullYear());

  return `${dia}-${mes}-${anio}`;
}

function fechaBaseHallazgoCierreMovil(hallazgo: HallazgoCentral) {
  return (
    hallazgo.fechaHoraReporteISO ||
    hallazgo.fechaReporte ||
    hallazgo.fechaCreacion ||
    hallazgo.createdAt ||
    ""
  );
}

function fechaEvidenciaRevisionCierreMovil(hallazgo: HallazgoCentral) {
  const evidencias = hallazgo.seguimientoCierre?.evidenciaRecibida || [];
  return (
    evidencias
      .map(
        (evidencia) =>
          evidencia.fechaSubida ||
          evidencia.fechaCarga ||
          evidencia.capturedAt ||
          evidencia.fechaCaptura ||
          evidencia.gpsAt ||
          ""
      )
      .filter(Boolean)
      .sort()
      .at(-1) || ""
  );
}

function fechaAplicableCierreMovil(
  hallazgo: HallazgoCentral,
  categoria: CategoriaCierreMovil | null
) {
  if (categoria === "por_cerrar") {
    return hallazgo.seguimientoCierre?.fechaCompromiso || fechaBaseHallazgoCierreMovil(hallazgo);
  }

  if (categoria === "en_revision") {
    return (
      fechaEvidenciaRevisionCierreMovil(hallazgo) ||
      hallazgo.seguimientoCierre?.actualizadoEn ||
      hallazgo.updatedAt ||
      hallazgo.fechaActualizacion ||
      fechaBaseHallazgoCierreMovil(hallazgo)
    );
  }

  if (categoria === "cerrados") {
    return (
      hallazgo.seguimientoCierre?.fechaCierre ||
      hallazgo.updatedAt ||
      hallazgo.fechaActualizacion ||
      fechaBaseHallazgoCierreMovil(hallazgo)
    );
  }

  return fechaBaseHallazgoCierreMovil(hallazgo);
}

function fechaFiltroCierreMovil(
  hallazgo: HallazgoCentral,
  categoria: CategoriaCierreMovil | null
) {
  return fechaLegibleCierreMovil(fechaAplicableCierreMovil(hallazgo, categoria));
}

function fechaComparableCierreMovil(valor: string) {
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "";
  return fechaLocalInputCierreMovil(fecha);
}

function inicioSemanaCierreMovil(fecha: Date) {
  const inicio = new Date(fecha);
  inicio.setHours(0, 0, 0, 0);
  const diaSemana = inicio.getDay();
  const diferencia = diaSemana === 0 ? -6 : 1 - diaSemana;
  inicio.setDate(inicio.getDate() + diferencia);
  return inicio;
}

function hallazgoCumpleFiltroFechaCierreMovil(
  hallazgo: HallazgoCentral,
  categoria: CategoriaCierreMovil | null,
  filtro: FiltroFechaCierreMovil,
  fechaSeleccionada: string
) {
  const valor = fechaAplicableCierreMovil(hallazgo, categoria);
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return false;

  const hoy = new Date();
  const fechaHallazgo = new Date(fecha);
  fechaHallazgo.setHours(0, 0, 0, 0);

  if (filtro === "hoy") {
    return fechaComparableCierreMovil(valor) === fechaLocalInputCierreMovil(hoy);
  }

  if (filtro === "semana") {
    const inicio = inicioSemanaCierreMovil(hoy);
    const fin = new Date(inicio);
    fin.setDate(inicio.getDate() + 6);
    fin.setHours(23, 59, 59, 999);
    return fechaHallazgo >= inicio && fechaHallazgo <= fin;
  }

  if (filtro === "mes") {
    return (
      fecha.getFullYear() === hoy.getFullYear() &&
      fecha.getMonth() === hoy.getMonth()
    );
  }

  return fechaComparableCierreMovil(valor) === fechaSeleccionada;
}

function extensionArchivoCierreMovil(archivo: File) {
  const nombre = archivo.name || "";
  const extensionNombre = nombre.split(".").pop()?.toLowerCase() || "";
  if (extensionNombre && extensionNombre.length <= 5) return extensionNombre;
  if (archivo.type === "image/png") return "png";
  if (archivo.type === "image/webp") return "webp";
  if (archivo.type === "image/heic") return "heic";
  return "jpg";
}

function crearIdEvidenciaCierreMovil() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `cierre-${crypto.randomUUID()}`;
  }

  return `cierre-${Date.now()}`;
}

function nombreJpegCierreMovil(nombreOriginal: string | undefined) {
  const base = String(nombreOriginal || "fotografia-cierre")
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "");

  return `${base || "fotografia-cierre"}.jpg`;
}

function leerPreviewArchivoCierreMovil(archivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();

    lector.onerror = () =>
      reject(new Error("No se pudo leer la fotografía."));
    lector.onload = () => {
      const preview =
        typeof lector.result === "string" ? lector.result : "";

      if (!preview) {
        reject(new Error("No se pudo preparar la vista previa."));
        return;
      }

      resolve(preview);
    };

    lector.readAsDataURL(archivo);
  });
}

function usuarioBitacoraCierreMovil(supervisor: SupervisorV2) {
  return (
    supervisor.email ||
    supervisor.nombre ||
    supervisor.reportanteUserId ||
    supervisor.supervisorUserId ||
    supervisor.userId ||
    "supervisor-movil"
  );
}

function resumenEvidenciaRecibidaCierreMovil(evidencia: EvidenciaHallazgoCentral) {
  return (
    evidencia.descripcion ||
    evidencia.nombre ||
    evidencia.storagePath ||
    evidencia.url ||
    "Evidencia de cierre registrada"
  );
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
  const [hallazgosCierreMovil, setHallazgosCierreMovil] = useState<
    HallazgoCentral[]
  >([]);
  const [cargandoHallazgosCierre, setCargandoHallazgosCierre] =
    useState(false);
  const [mensajeHallazgosCierre, setMensajeHallazgosCierre] = useState("");
  const [categoriaCierreActiva, setCategoriaCierreActiva] =
    useState<CategoriaCierreMovil | null>(null);
  const [hallazgoCierreExpandido, setHallazgoCierreExpandido] = useState("");
  const [limiteVisibleCierre, setLimiteVisibleCierre] = useState(
    LIMITE_INICIAL_LISTADO_CIERRE_MOVIL
  );
  const [filtroFechaCierre, setFiltroFechaCierre] =
    useState<FiltroFechaCierreMovil>("semana");
  const [fechaFiltroCierre, setFechaFiltroCierre] = useState(
    fechaLocalInputCierreMovil()
  );
  const [ayudaCierreActiva, setAyudaCierreActiva] =
    useState<CategoriaCierreMovil | null>(null);
  const [formularioEvidenciaCierre, setFormularioEvidenciaCierre] = useState("");
  const [archivoEvidenciaCierre, setArchivoEvidenciaCierre] =
    useState<File | null>(null);
  const [previewEvidenciaCierre, setPreviewEvidenciaCierre] = useState("");
  const [previewEvidenciaCierreAmpliada, setPreviewEvidenciaCierreAmpliada] =
    useState(false);
  const [comentarioEvidenciaCierre, setComentarioEvidenciaCierre] = useState("");
  const [errorEvidenciaCierre, setErrorEvidenciaCierre] = useState("");
  const [confirmacionCierreBajo, setConfirmacionCierreBajo] = useState("");
  const [enviandoEvidenciaCierre, setEnviandoEvidenciaCierre] = useState(false);
  const [procesandoEvidenciaCierre, setProcesandoEvidenciaCierre] = useState(false);
  const [camaraEvidenciaCierreAbierta, setCamaraEvidenciaCierreAbierta] =
    useState(false);
  const [iniciandoCamaraEvidenciaCierre, setIniciandoCamaraEvidenciaCierre] =
    useState(false);
  const [camaraEvidenciaCierreLista, setCamaraEvidenciaCierreLista] =
    useState(false);
  const [versionCamaraEvidenciaCierre, setVersionCamaraEvidenciaCierre] =
    useState(0);
  const [errorCamaraEvidenciaCierre, setErrorCamaraEvidenciaCierre] =
    useState("");
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
  const streamCamaraEvidenciaCierreRef = useRef<MediaStream | null>(null);
  const videoCamaraEvidenciaCierreRef = useRef<HTMLVideoElement | null>(null);
  const intentoCamaraEvidenciaCierreRef = useRef(0);
  const temporizadorCamaraEvidenciaCierreRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

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
      setHallazgosCierreMovil([]);
      setCategoriaCierreActiva(null);
      setHallazgoCierreExpandido("");
      setLimiteVisibleCierre(LIMITE_INICIAL_LISTADO_CIERRE_MOVIL);
      setHistorialCentralDisponible(false);
      setMensajeHistorialCentral("");
      setMensajeHallazgosCierre("");
      setCargandoHistorialCentral(false);
      setCargandoHallazgosCierre(false);
      return;
    }

    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setContadores(CONTADORES_SUPERVISOR_CERO);
      setHallazgosCierreMovil([]);
      setCategoriaCierreActiva(null);
      setHallazgoCierreExpandido("");
      setLimiteVisibleCierre(LIMITE_INICIAL_LISTADO_CIERRE_MOVIL);
      setHistorialCentralDisponible(false);
      setMensajeHistorialCentral(
        "Historial central no disponible temporalmente."
      );
      setMensajeHallazgosCierre("Consulta central no disponible temporalmente.");
      setCargandoHistorialCentral(false);
      setCargandoHallazgosCierre(false);
      return;
    }

    setCargandoHistorialCentral(true);
    setCargandoHallazgosCierre(true);
    setMensajeHistorialCentral("");
    setMensajeHallazgosCierre("");

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

        const listado = await listarHallazgosSupervisorCentral({
          userId,
          empresaId: item.empresaId,
          obraId: item.obraId,
          limit: 120,
        });

        if (listado.ok) {
          setHallazgosCierreMovil(listado.data);
          setMensajeHallazgosCierre("");
        } else {
          setHallazgosCierreMovil([]);
          setMensajeHallazgosCierre("Consulta central no disponible temporalmente.");
        }
      } else {
        setContadores(CONTADORES_SUPERVISOR_CERO);
        setHallazgosCierreMovil([]);
        setCategoriaCierreActiva(null);
        setHallazgoCierreExpandido("");
        setLimiteVisibleCierre(LIMITE_INICIAL_LISTADO_CIERRE_MOVIL);
        setHistorialCentralDisponible(false);
        setMensajeHistorialCentral(
          "Historial central no disponible temporalmente."
        );
        setMensajeHallazgosCierre("Consulta central no disponible temporalmente.");
      }
    } catch {
      setContadores(CONTADORES_SUPERVISOR_CERO);
      setHallazgosCierreMovil([]);
      setCategoriaCierreActiva(null);
      setHallazgoCierreExpandido("");
      setLimiteVisibleCierre(LIMITE_INICIAL_LISTADO_CIERRE_MOVIL);
      setHistorialCentralDisponible(false);
      setMensajeHistorialCentral(
        "Historial central no disponible temporalmente."
      );
      setMensajeHallazgosCierre("Consulta central no disponible temporalmente.");
    } finally {
      setCargandoHistorialCentral(false);
      setCargandoHallazgosCierre(false);
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

  useEffect(() => {
    return () => {
      if (previewEvidenciaCierre.startsWith("blob:")) {
        URL.revokeObjectURL(previewEvidenciaCierre);
      }
    };
  }, [previewEvidenciaCierre]);

  useEffect(() => {
    const videoActual = videoCamaraEvidenciaCierreRef.current;

    return () => {
      streamCamaraEvidenciaCierreRef.current
        ?.getTracks()
        .forEach((track) => track.stop());
      streamCamaraEvidenciaCierreRef.current = null;
      if (videoActual) {
        videoActual.srcObject = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!camaraEvidenciaCierreAbierta) return;
    if (iniciandoCamaraEvidenciaCierre || errorCamaraEvidenciaCierre) return;

    const stream = streamCamaraEvidenciaCierreRef.current;
    if (!stream) return;

    void conectarStreamCamaraEvidenciaCierre(
      stream,
      intentoCamaraEvidenciaCierreRef.current
    );
    return () => {
      limpiarTemporizadorCamaraEvidenciaCierre();
    };
    // La conexión usa refs e intento vigente; agregar la función como dependencia
    // puede reiniciar el video durante renders intermedios en Safari iOS.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    camaraEvidenciaCierreAbierta,
    errorCamaraEvidenciaCierre,
    iniciandoCamaraEvidenciaCierre,
    versionCamaraEvidenciaCierre,
  ]);

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
  const resumenCierreMovil = useMemo(
    () => agruparHallazgosCierreMovil(hallazgosCierreMovil),
    [hallazgosCierreMovil]
  );
  const hallazgosCategoriaActiva = categoriaCierreActiva
    ? resumenCierreMovil[categoriaCierreActiva]
    : [];
  const hallazgosCierreFiltrados = hallazgosCategoriaActiva.filter((hallazgo) =>
    hallazgoCumpleFiltroFechaCierreMovil(
      hallazgo,
      categoriaCierreActiva,
      filtroFechaCierre,
      fechaFiltroCierre
    )
  );
  const hallazgosCierreVisibles = hallazgosCierreFiltrados.slice(
    0,
    limiteVisibleCierre
  );
  const hayMasHallazgosCierre =
    hallazgosCierreFiltrados.length > hallazgosCierreVisibles.length;
  const etiquetaFiltroFechaCierre =
    filtroFechaCierre === "hoy"
      ? t("Hoy")
      : filtroFechaCierre === "mes"
        ? t("Mes")
        : filtroFechaCierre === "fecha"
          ? t("Fecha")
          : t("Semana");
  const filtrosFechaCierre: Array<{
    id: FiltroFechaCierreMovil;
    label: string;
  }> = [
    { id: "hoy", label: t("Hoy") },
    { id: "semana", label: t("Semana") },
    { id: "mes", label: t("Mes") },
    { id: "fecha", label: t("Fecha") },
  ];
  const cuadrosCierreMovil: Array<{
    id: CategoriaCierreMovil;
    label: string;
    ayuda: string;
    valor: number;
    background: string;
    border: string;
    boxShadow: string;
  }> = [
    {
      id: "por_cerrar",
      label: t("Por cerrar"),
      ayuda: t("Corresponde a hallazgos abiertos o pendientes de gestión."),
      valor: resumenCierreMovil.por_cerrar.length,
      background:
        "linear-gradient(180deg, rgba(248,113,113,0.98), rgba(220,38,38,0.90))",
      border: "1px solid rgba(252,165,165,0.65)",
      boxShadow: "0 16px 30px rgba(220,38,38,0.34)",
    },
    {
      id: "en_revision",
      label: t("En revisión"),
      ayuda: t(
        "Corresponde a hallazgos donde ya se cargó evidencia de cierre y están esperando validación."
      ),
      valor: resumenCierreMovil.en_revision.length,
      background:
        "linear-gradient(180deg, rgba(59,130,246,0.98), rgba(29,78,216,0.90))",
      border: "1px solid rgba(147,197,253,0.65)",
      boxShadow: "0 16px 30px rgba(37,99,235,0.34)",
    },
    {
      id: "cerrados",
      label: t("Cerrados"),
      ayuda: t(
        "Corresponde a hallazgos finalizados con evidencia o justificación registrada."
      ),
      valor: resumenCierreMovil.cerrados.length,
      background:
        "linear-gradient(180deg, rgba(34,197,94,0.98), rgba(21,128,61,0.90))",
      border: "1px solid rgba(134,239,172,0.65)",
      boxShadow: "0 16px 30px rgba(21,128,61,0.34)",
    },
  ];
  const tituloCategoriaActiva =
    cuadrosCierreMovil.find((cuadro) => cuadro.id === categoriaCierreActiva)
      ?.label || "";
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

  const limpiarFormularioEvidenciaCierre = () => {
    detenerStreamCamaraEvidenciaCierre();
    setCamaraEvidenciaCierreAbierta(false);
    setIniciandoCamaraEvidenciaCierre(false);
    setCamaraEvidenciaCierreLista(false);
    setErrorCamaraEvidenciaCierre("");
    setFormularioEvidenciaCierre("");
    setArchivoEvidenciaCierre(null);
    setPreviewEvidenciaCierre("");
    setPreviewEvidenciaCierreAmpliada(false);
    setComentarioEvidenciaCierre("");
    setErrorEvidenciaCierre("");
    setConfirmacionCierreBajo("");
    setProcesandoEvidenciaCierre(false);
  };

  const abrirFormularioEvidenciaCierre = (hallazgo: HallazgoCentral) => {
    detenerStreamCamaraEvidenciaCierre();
    setCamaraEvidenciaCierreAbierta(false);
    setCamaraEvidenciaCierreLista(false);
    setErrorCamaraEvidenciaCierre("");
    setFormularioEvidenciaCierre(claveHallazgoCierreMovil(hallazgo));
    setArchivoEvidenciaCierre(null);
    setPreviewEvidenciaCierre("");
    setPreviewEvidenciaCierreAmpliada(false);
    setComentarioEvidenciaCierre("");
    setErrorEvidenciaCierre("");
    setConfirmacionCierreBajo("");
    setProcesandoEvidenciaCierre(false);
    vibrarOk();
  };

  function limpiarTemporizadorCamaraEvidenciaCierre() {
    if (temporizadorCamaraEvidenciaCierreRef.current) {
      clearTimeout(temporizadorCamaraEvidenciaCierreRef.current);
      temporizadorCamaraEvidenciaCierreRef.current = null;
    }
  }

  function esperarVideoCamaraEvidenciaCierreListo(
    video: HTMLVideoElement
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        resolve();
        return;
      }

      const completar = () => {
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          limpiar();
          resolve();
        }
      };
      const fallar = () => {
        limpiar();
        reject(new Error("video-sin-metadata"));
      };
      const limpiar = () => {
        clearTimeout(timeoutId);
        video.removeEventListener("loadedmetadata", completar);
        video.removeEventListener("canplay", completar);
        video.removeEventListener("playing", completar);
      };
      const timeoutId = setTimeout(fallar, 3200);

      video.addEventListener("loadedmetadata", completar);
      video.addEventListener("canplay", completar);
      video.addEventListener("playing", completar);
    });
  }

  async function conectarStreamCamaraEvidenciaCierre(
    stream: MediaStream,
    intento: number,
    reintentos = 0
  ) {
    limpiarTemporizadorCamaraEvidenciaCierre();

    if (
      intento !== intentoCamaraEvidenciaCierreRef.current ||
      streamCamaraEvidenciaCierreRef.current !== stream
    ) {
      return;
    }

    const video = videoCamaraEvidenciaCierreRef.current;

    if (!video) {
      if (reintentos < 10) {
        temporizadorCamaraEvidenciaCierreRef.current = setTimeout(() => {
          void conectarStreamCamaraEvidenciaCierre(stream, intento, reintentos + 1);
        }, 90);
        return;
      }

      setErrorCamaraEvidenciaCierre(
        t(
          "No se pudo iniciar la cámara. Revisa los permisos de cámara del navegador e intenta nuevamente."
        )
      );
      setCamaraEvidenciaCierreLista(false);
      return;
    }

    try {
      if (video.srcObject !== stream) {
        video.srcObject = stream;
      }

      video.muted = true;
      video.playsInline = true;

      await new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => resolve());
      });

      try {
        await video.play();
      } catch {
        // En Safari iOS a veces play resuelve solo despues de metadata.
      }

      await esperarVideoCamaraEvidenciaCierreListo(video);
      await video.play();

      if (
        intento !== intentoCamaraEvidenciaCierreRef.current ||
        streamCamaraEvidenciaCierreRef.current !== stream
      ) {
        return;
      }

      setCamaraEvidenciaCierreLista(true);
      setErrorCamaraEvidenciaCierre("");
    } catch {
      if (reintentos < 2) {
        temporizadorCamaraEvidenciaCierreRef.current = setTimeout(() => {
          void conectarStreamCamaraEvidenciaCierre(stream, intento, reintentos + 1);
        }, 180);
        return;
      }

      setCamaraEvidenciaCierreLista(false);
      setErrorCamaraEvidenciaCierre(
        t(
          "No se pudo iniciar la cámara. Revisa los permisos de cámara del navegador e intenta nuevamente."
        )
      );
    }
  }

  function detenerStreamCamaraEvidenciaCierre() {
    intentoCamaraEvidenciaCierreRef.current += 1;
    limpiarTemporizadorCamaraEvidenciaCierre();
    streamCamaraEvidenciaCierreRef.current
      ?.getTracks()
      .forEach((track) => track.stop());
    streamCamaraEvidenciaCierreRef.current = null;

    if (videoCamaraEvidenciaCierreRef.current) {
      videoCamaraEvidenciaCierreRef.current.srcObject = null;
    }
  }

  const cerrarCamaraEvidenciaCierre = () => {
    detenerStreamCamaraEvidenciaCierre();
    setCamaraEvidenciaCierreAbierta(false);
    setIniciandoCamaraEvidenciaCierre(false);
    setCamaraEvidenciaCierreLista(false);
    setErrorCamaraEvidenciaCierre("");
  };

  const abrirCamaraEvidenciaCierre = async () => {
    if (enviandoEvidenciaCierre || procesandoEvidenciaCierre) return;

    setErrorEvidenciaCierre("");
    setErrorCamaraEvidenciaCierre("");
    detenerStreamCamaraEvidenciaCierre();
    intentoCamaraEvidenciaCierreRef.current += 1;
    setCamaraEvidenciaCierreLista(false);
    setVersionCamaraEvidenciaCierre((actual) => actual + 1);
    setCamaraEvidenciaCierreAbierta(true);
    setIniciandoCamaraEvidenciaCierre(true);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("camara-no-disponible");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
        },
        audio: false,
      });

      streamCamaraEvidenciaCierreRef.current = stream;
      setErrorCamaraEvidenciaCierre("");
      setVersionCamaraEvidenciaCierre((actual) => actual + 1);
    } catch {
      detenerStreamCamaraEvidenciaCierre();
      setCamaraEvidenciaCierreLista(false);
      setErrorCamaraEvidenciaCierre(
        t(
          "No se pudo iniciar la cámara. Revisa los permisos de cámara del navegador e intenta nuevamente."
        )
      );
    } finally {
      setIniciandoCamaraEvidenciaCierre(false);
    }
  };

  const capturarFotoCamaraEvidenciaCierre = async () => {
    if (procesandoEvidenciaCierre || enviandoEvidenciaCierre) return;

    const video = videoCamaraEvidenciaCierreRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      setErrorCamaraEvidenciaCierre(
        t("No se pudo procesar la fotografía capturada.")
      );
      return;
    }

    setProcesandoEvidenciaCierre(true);
    setErrorEvidenciaCierre("");
    setErrorCamaraEvidenciaCierre("");

    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("canvas-no-disponible");
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (resultado) => {
            if (resultado) {
              resolve(resultado);
            } else {
              reject(new Error("blob-no-disponible"));
            }
          },
          "image/jpeg",
          FOTO_CIERRE_CALIDAD_JPEG
        );
      });

      const nombreBase =
        formularioEvidenciaCierre || `cierre-${new Date().toISOString()}`;
      const archivo = new File([blob], nombreJpegCierreMovil(nombreBase), {
        type: "image/jpeg",
        lastModified: Date.now(),
      });
      const preview = await leerPreviewArchivoCierreMovil(archivo);

      setArchivoEvidenciaCierre(archivo);
      setPreviewEvidenciaCierre(preview);
      setPreviewEvidenciaCierreAmpliada(false);
      setErrorEvidenciaCierre("");
      setCamaraEvidenciaCierreAbierta(false);
      setCamaraEvidenciaCierreLista(false);
      setErrorCamaraEvidenciaCierre("");
      vibrarOk();
    } catch {
      setErrorEvidenciaCierre(
        t("No se pudo procesar la fotografía capturada.")
      );
      setCamaraEvidenciaCierreAbierta(false);
      setCamaraEvidenciaCierreLista(false);
    } finally {
      detenerStreamCamaraEvidenciaCierre();
      setProcesandoEvidenciaCierre(false);
    }
  };

  const solicitarConfirmacionCierreDirectoBajo = (hallazgo: HallazgoCentral) => {
    if (!hallazgoBajoCierreMovil(hallazgo)) {
      setErrorEvidenciaCierre(
        t("Solo hallazgos de baja criticidad pueden cerrarse directamente desde móvil.")
      );
      return;
    }

    if (enviandoEvidenciaCierre) return;

    if (procesandoEvidenciaCierre) {
      setErrorEvidenciaCierre(t("Procesando fotografía de cierre..."));
      return;
    }

    if (!hallazgo.id) {
      setErrorEvidenciaCierre(t("No se pudo identificar el hallazgo para actualizarlo."));
      return;
    }

    if (!archivoEvidenciaCierre) {
      setErrorEvidenciaCierre(t("La fotografía de cierre es obligatoria."));
      return;
    }

    if (comentarioEvidenciaCierre.trim().length < 5) {
      setErrorEvidenciaCierre(t("Agrega un comentario de al menos 5 caracteres."));
      return;
    }

    setErrorEvidenciaCierre("");
    setConfirmacionCierreBajo(claveHallazgoCierreMovil(hallazgo));
    vibrarOk();
  };

  const enviarEvidenciaCierreRevision = async (
    hallazgo: HallazgoCentral,
    opciones?: { cerrarDirectoBajo?: boolean }
  ) => {
    if (enviandoEvidenciaCierre) return;

    const cerrarDirectoBajo = Boolean(opciones?.cerrarDirectoBajo);

    if (cerrarDirectoBajo && !hallazgoBajoCierreMovil(hallazgo)) {
      setErrorEvidenciaCierre(
        t("Solo hallazgos de baja criticidad pueden cerrarse directamente desde móvil.")
      );
      setConfirmacionCierreBajo("");
      return;
    }

    if (procesandoEvidenciaCierre) {
      setErrorEvidenciaCierre(t("Procesando fotografía de cierre..."));
      return;
    }

    if (!hallazgo.id) {
      setErrorEvidenciaCierre(t("No se pudo identificar el hallazgo para actualizarlo."));
      return;
    }

    if (!archivoEvidenciaCierre) {
      setErrorEvidenciaCierre(t("La fotografía de cierre es obligatoria."));
      return;
    }

    const comentario = comentarioEvidenciaCierre.trim();
    if (comentario.length < 5) {
      setErrorEvidenciaCierre(t("Agrega un comentario de al menos 5 caracteres."));
      return;
    }

    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setErrorEvidenciaCierre(
        t("No se pudo enviar la evidencia. Intenta nuevamente con conexión.")
      );
      return;
    }

    setEnviandoEvidenciaCierre(true);
    setErrorEvidenciaCierre("");
    setConfirmacionCierreBajo("");

    const fechaHoraIso = new Date().toISOString();
    const evidenciaId = crearIdEvidenciaCierreMovil();
    const usuarioAuditoria = usuarioBitacoraCierreMovil(supervisor);

    const subida = await subirEvidenciaHallazgo({
      codigo: hallazgo.codigo,
      evidenciaId,
      archivo: archivoEvidenciaCierre,
      contentType: archivoEvidenciaCierre.type || "image/jpeg",
      empresa: hallazgo.empresa,
      obra: hallazgo.obra,
      extension: extensionArchivoCierreMovil(archivoEvidenciaCierre),
      carpeta: "cierre",
    });

    if (!subida.ok) {
      setErrorEvidenciaCierre(
        subida.error || t("No se pudo enviar la evidencia. Intenta nuevamente con conexión.")
      );
      setEnviandoEvidenciaCierre(false);
      return;
    }

    const evidenciaCierre: EvidenciaHallazgoCentral = {
      id: evidenciaId,
      evidenceId: evidenciaId,
      nombre: archivoEvidenciaCierre.name || `${evidenciaId}.jpg`,
      tipo: "cierre",
      mimeType: archivoEvidenciaCierre.type || "image/jpeg",
      bucket: subida.data.bucket,
      storagePath: subida.data.storagePath,
      tamanoBytes: archivoEvidenciaCierre.size,
      pesoBytes: archivoEvidenciaCierre.size,
      sizeOriginal: archivoEvidenciaCierre.size,
      estadoSubida: "subida",
      descripcion: comentario,
      fechaCarga: fechaHoraIso,
      fechaCaptura: fechaHoraIso,
      capturedAt: fechaHoraIso,
      fechaSubida: fechaHoraIso,
      deviceOnline: typeof navigator === "undefined" ? true : navigator.onLine,
      userAgent:
        typeof navigator === "undefined" ? "" : navigator.userAgent,
      origen: "mobile-v2",
      origenDeclarado: "cierre_movil",
      intentos: 1,
    };

    const seguimientoPrevio = hallazgo.seguimientoCierre;
    const evidenciasRecibidas = [
      ...(seguimientoPrevio?.evidenciaRecibida || []),
      evidenciaCierre,
    ];
    const estadoHallazgoDestino: HallazgoCentral["estado"] = cerrarDirectoBajo
      ? "CERRADO"
      : "EN_SEGUIMIENTO";
    const estadoCierreDestino: SeguimientoCierreCentral["estadoCierre"] =
      cerrarDirectoBajo ? "CERRADO" : "EN_GESTION";
    const estadoSeguimientoDestino = cerrarDirectoBajo
      ? "Cerrado con evidencia"
      : "En revisión";
    const accionBitacora = cerrarDirectoBajo
      ? "cierre_bajo_con_evidencia_movil"
      : "evidencia_cierre_enviada_movil";
    const resumenBitacora = cerrarDirectoBajo
      ? `Hallazgo bajo cerrado con evidencia desde móvil. Comentario: ${comentario}`
      : `Evidencia de cierre enviada desde móvil. Comentario: ${comentario}`;
    const seguimientoCierre: SeguimientoCierreCentral = {
      ...(seguimientoPrevio || {}),
      responsable: seguimientoPrevio?.responsable || {
        tipoResponsable: "contratista",
        nombre: responsableVisibleCierreMovil(hallazgo) || "Sin asignar",
        empresa: hallazgo.empresa,
      },
      estadoCierre: estadoCierreDestino,
      estadoSeguimiento: estadoSeguimientoDestino,
      evidenciaRecibida: evidenciasRecibidas,
      fechaCierre: cerrarDirectoBajo
        ? fechaHoraIso
        : seguimientoPrevio?.fechaCierre,
      validadorEstado:
        cerrarDirectoBajo
          ? "Aprobado"
          : seguimientoPrevio?.validadorEstado || "Pendiente de revision",
      validadorNombre: cerrarDirectoBajo
        ? usuarioAuditoria
        : seguimientoPrevio?.validadorNombre,
      validadorObservacion: cerrarDirectoBajo
        ? `Cierre directo móvil de hallazgo bajo. Comentario: ${comentario}`
        : seguimientoPrevio?.validadorObservacion,
      actualizadoEn: fechaHoraIso,
      actualizadoPor: usuarioAuditoria,
    };

    const eventoBitacora: BitacoraHallazgoCentral = {
      id: evidenciaId,
      fechaHora: fechaHoraIso,
      usuario: usuarioAuditoria,
      accion: accionBitacora,
      resumen: resumenBitacora,
      estadoAnterior: estadoVisibleCierreMovil(hallazgo),
      estadoNuevo: estadoSeguimientoDestino,
      camposModificados: [
        "estado",
        "estado_cierre",
        "estado_seguimiento",
        "seguimiento_cierre",
        "evidencia_recibida",
        ...(cerrarDirectoBajo ? ["fecha_cierre"] : []),
        "bitacora",
      ],
      metadata: {
        origen: "mobile-v2",
        codigo: hallazgo.codigo,
        evidenciaId,
        storagePath: subida.data.storagePath,
        comentario,
        cerrarDirectoBajo,
      },
    };

    const rawMobileV2 =
      hallazgo.rawMobileV2 && typeof hallazgo.rawMobileV2 === "object"
        ? hallazgo.rawMobileV2
        : {};

    const actualizado = await actualizarHallazgoCentral(hallazgo.id, {
      estado: estadoHallazgoDestino,
      estadoCierre: estadoCierreDestino,
      seguimientoCierre,
      bitacora: [...(hallazgo.bitacora || []), eventoBitacora],
      rawMobileV2: {
        ...rawMobileV2,
        cierreMovil: {
          fechaHora: fechaHoraIso,
          accion: accionBitacora,
          estado: estadoSeguimientoDestino,
          evidenciaId,
          comentario,
          usuario: usuarioAuditoria,
          cerrarDirectoBajo,
          criticidad: hallazgo.criticidad,
        },
      },
    });

    if (!actualizado.ok) {
      setErrorEvidenciaCierre(
        actualizado.error ||
          t("No se pudo enviar la evidencia. Intenta nuevamente con conexión.")
      );
      setEnviandoEvidenciaCierre(false);
      return;
    }

    setHallazgosCierreMovil((actual) =>
      actual.map((item) =>
        (item.id || item.codigo) === (hallazgo.id || hallazgo.codigo)
          ? actualizado.data
          : item
      )
    );
    limpiarFormularioEvidenciaCierre();
    setCategoriaCierreActiva(cerrarDirectoBajo ? "cerrados" : "en_revision");
    setHallazgoCierreExpandido(claveHallazgoCierreMovil(actualizado.data));
    setFiltroFechaCierre("semana");
    setLimiteVisibleCierre(LIMITE_INICIAL_LISTADO_CIERRE_MOVIL);
    setMensaje(
      cerrarDirectoBajo
        ? t("Hallazgo cerrado con evidencia.")
        : t("Evidencia enviada a revisión.")
    );
    setEnviandoEvidenciaCierre(false);
    vibrarOk();
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
            {cuadrosCierreMovil.map((cuadro) => {
              const activo = categoriaCierreActiva === cuadro.id;
              return (
                <div
                  key={cuadro.id}
                  style={{
                    position: "relative",
                    minHeight: "78px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setCategoriaCierreActiva((actual) => {
                        const siguiente = actual === cuadro.id ? null : cuadro.id;
                        setHallazgoCierreExpandido("");
                        setLimiteVisibleCierre(
                          LIMITE_INICIAL_LISTADO_CIERRE_MOVIL
                        );
                        setFiltroFechaCierre("semana");
                        setFechaFiltroCierre(fechaLocalInputCierreMovil());
                        setAyudaCierreActiva(null);
                        return siguiente;
                      });
                      vibrarOk();
                    }}
                    {...feedbackBoton(`cierre-${cuadro.id}`)}
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "16px",
                      padding: "13px 8px 17px",
                      background: cuadro.background,
                      border: activo
                        ? "2px solid rgba(255,255,255,0.92)"
                        : cuadro.border,
                      boxShadow: activo
                        ? `${cuadro.boxShadow}, 0 0 0 3px rgba(255,255,255,0.20)`
                        : cuadro.boxShadow,
                      textAlign: "center",
                      minHeight: "78px",
                      boxSizing: "border-box",
                      color: "white",
                      cursor: "pointer",
                      touchAction: "manipulation",
                      transition:
                        "transform 120ms ease, filter 120ms ease, box-shadow 120ms ease",
                      ...estiloFeedback(`cierre-${cuadro.id}`),
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        opacity: 0.9,
                        marginBottom: "8px",
                        fontWeight: 900,
                        textAlign: "center",
                        textTransform: "uppercase",
                      }}
                    >
                      {cuadro.label}
                    </div>
                    <div style={{ fontSize: "28px", fontWeight: 900 }}>
                      {cargandoHallazgosCierre ? "..." : cuadro.valor}
                    </div>
                  </button>
                  <button
                    type="button"
                    aria-label={`Ayuda ${cuadro.label}`}
                    onClick={() => {
                      setAyudaCierreActiva((actual) =>
                        actual === cuadro.id ? null : cuadro.id
                      );
                      vibrarOk();
                    }}
                    {...feedbackBoton(`ayuda-cierre-${cuadro.id}`)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      bottom: "6px",
                      width: "auto",
                      height: "auto",
                      borderRadius: "999px",
                      border: "0",
                      background: "transparent",
                      color: "rgba(255,255,255,0.94)",
                      fontSize: "17px",
                      fontWeight: 950,
                      lineHeight: 1,
                      display: "grid",
                      placeItems: "center",
                      cursor: "pointer",
                      touchAction: "manipulation",
                      opacity: 0.72,
                      padding: "0",
                      ...estiloFeedback(`ayuda-cierre-${cuadro.id}`),
                    }}
                  >
                    …
                  </button>
                </div>
              );
            })}
          </div>
          {ayudaCierreActiva && (
            <div
              style={{
                marginTop: "10px",
                borderRadius: "15px",
                padding: "11px 12px",
                background: temaClaro
                  ? "rgba(255,255,255,0.92)"
                  : "rgba(15,23,42,0.62)",
                border: temaClaro
                  ? "1px solid rgba(37,99,235,0.16)"
                  : "1px solid rgba(147,197,253,0.18)",
                boxShadow: temaClaro
                  ? "0 14px 28px rgba(15,23,42,0.08)"
                  : "0 18px 32px rgba(0,0,0,0.18)",
                display: "grid",
                gap: "7px",
              }}
            >
              {(() => {
                const cuadroAyuda = cuadrosCierreMovil.find(
                  (cuadro) => cuadro.id === ayudaCierreActiva
                );

                if (!cuadroAyuda) return null;

                return (
                  <>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "10px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: 950,
                          color: temaClaro ? "#0f172a" : "white",
                        }}
                      >
                        {cuadroAyuda.label}
                      </div>
                      <button
                        type="button"
                        onClick={() => setAyudaCierreActiva(null)}
                        style={{
                          border: "0",
                          borderRadius: "999px",
                          background: temaClaro
                            ? "rgba(15,23,42,0.06)"
                            : "rgba(255,255,255,0.10)",
                          color: temaClaro ? "#334155" : "rgba(241,245,249,0.86)",
                          padding: "5px 8px",
                          fontSize: "11px",
                          fontWeight: 900,
                          cursor: "pointer",
                        }}
                      >
                        {t("Cerrar")}
                      </button>
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        lineHeight: 1.35,
                        fontWeight: 800,
                        color: temaClaro ? "#475569" : "rgba(226,232,240,0.78)",
                      }}
                    >
                      {cuadroAyuda.ayuda}
                    </div>
                  </>
                );
              })()}
            </div>
          )}
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
              : mensajeHallazgosCierre
                ? t(mensajeHallazgosCierre)
              : mensajeHistorialCentral
                ? t(mensajeHistorialCentral)
                : historialCentralDisponible
                  ? t("Historial sincronizado desde plataforma central.")
                  : ""}
          </div>
          {categoriaCierreActiva && (
            <div
              style={{
                marginTop: "12px",
                display: "grid",
                gap: "10px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 900,
                      color: temaClaro ? "#475569" : "rgba(226,232,240,0.72)",
                    }}
                  >
                    {t("Listado de hallazgos")}
                  </div>
                  <div style={{ marginTop: "3px", fontSize: "17px", fontWeight: 950 }}>
                    {tituloCategoriaActiva}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCategoriaCierreActiva(null);
                    setHallazgoCierreExpandido("");
                    setLimiteVisibleCierre(LIMITE_INICIAL_LISTADO_CIERRE_MOVIL);
                    setFiltroFechaCierre("semana");
                    setFechaFiltroCierre(fechaLocalInputCierreMovil());
                    vibrarOk();
                  }}
                  {...feedbackBoton("volver-resumen-cierre")}
                  style={{
                    border: temaClaro
                      ? "1px solid rgba(100,116,139,0.26)"
                      : "1px solid rgba(255,255,255,0.16)",
                    borderRadius: "13px",
                    background: temaClaro
                      ? "rgba(255,255,255,0.82)"
                      : "rgba(255,255,255,0.10)",
                    color: temaClaro ? "#0f172a" : "white",
                    padding: "9px 10px",
                    fontSize: "12px",
                    fontWeight: 900,
                    cursor: "pointer",
                    touchAction: "manipulation",
                    ...estiloFeedback("volver-resumen-cierre"),
                  }}
                >
                  {t("Volver al resumen")}
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gap: "8px",
                  padding: "10px",
                  borderRadius: "15px",
                  background: temaClaro
                    ? "rgba(248,250,252,0.82)"
                    : "rgba(255,255,255,0.07)",
                  border: temaClaro
                    ? "1px solid rgba(100,116,139,0.14)"
                    : "1px solid rgba(255,255,255,0.10)",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                    gap: "6px",
                  }}
                >
                  {filtrosFechaCierre.map((filtro) => {
                    const activo = filtroFechaCierre === filtro.id;
                    return (
                      <button
                        key={filtro.id}
                        type="button"
                        onClick={() => {
                          setFiltroFechaCierre(filtro.id);
                          setHallazgoCierreExpandido("");
                          setLimiteVisibleCierre(
                            LIMITE_INICIAL_LISTADO_CIERRE_MOVIL
                          );
                          vibrarOk();
                        }}
                        {...feedbackBoton(`filtro-cierre-${filtro.id}`)}
                        style={{
                          border: activo
                            ? "1px solid rgba(37,99,235,0.78)"
                            : temaClaro
                              ? "1px solid rgba(100,116,139,0.18)"
                              : "1px solid rgba(255,255,255,0.12)",
                          borderRadius: "12px",
                          background: activo
                            ? "linear-gradient(180deg, rgba(37,99,235,0.96), rgba(29,78,216,0.92))"
                            : temaClaro
                              ? "rgba(255,255,255,0.88)"
                              : "rgba(255,255,255,0.08)",
                          color: activo
                            ? "white"
                            : temaClaro
                              ? "#334155"
                              : "rgba(241,245,249,0.84)",
                          padding: "8px 5px",
                          fontSize: "11px",
                          fontWeight: 950,
                          cursor: "pointer",
                          touchAction: "manipulation",
                          ...estiloFeedback(`filtro-cierre-${filtro.id}`),
                        }}
                      >
                        {filtro.label}
                      </button>
                    );
                  })}
                </div>
                {filtroFechaCierre === "fecha" && (
                  <input
                    type="date"
                    value={fechaFiltroCierre}
                    aria-label={t("Seleccionar fecha")}
                    onChange={(event) => {
                      setFechaFiltroCierre(event.currentTarget.value);
                      setHallazgoCierreExpandido("");
                      setLimiteVisibleCierre(LIMITE_INICIAL_LISTADO_CIERRE_MOVIL);
                    }}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      borderRadius: "12px",
                      border: temaClaro
                        ? "1px solid rgba(100,116,139,0.20)"
                        : "1px solid rgba(255,255,255,0.14)",
                      background: temaClaro
                        ? "rgba(255,255,255,0.92)"
                        : "rgba(15,23,42,0.34)",
                      color: temaClaro ? "#0f172a" : "white",
                      padding: "9px 10px",
                      fontSize: "13px",
                      fontWeight: 850,
                    }}
                  />
                )}
                <div
                  style={{
                    fontSize: "12px",
                    lineHeight: 1.35,
                    fontWeight: 850,
                    color: temaClaro ? "#475569" : "rgba(226,232,240,0.76)",
                  }}
                >
                  {t("Mostrando")}: {etiquetaFiltroFechaCierre}
                  <br />
                  {hallazgosCierreFiltrados.length} de{" "}
                  {hallazgosCategoriaActiva.length} hallazgos
                </div>
              </div>

              {cargandoHallazgosCierre ? (
                <div
                  style={{
                    padding: "12px",
                    borderRadius: "14px",
                    background: temaClaro
                      ? "rgba(248,250,252,0.82)"
                      : "rgba(255,255,255,0.07)",
                    border: temaClaro
                      ? "1px solid rgba(100,116,139,0.16)"
                      : "1px solid rgba(255,255,255,0.10)",
                    fontSize: "13px",
                    fontWeight: 850,
                  }}
                >
                  {t("Consultando historial central...")}
                </div>
              ) : hallazgosCierreFiltrados.length === 0 ? (
                <div
                  style={{
                    padding: "12px",
                    borderRadius: "14px",
                    background: temaClaro
                      ? "rgba(248,250,252,0.82)"
                      : "rgba(255,255,255,0.07)",
                    border: temaClaro
                      ? "1px solid rgba(100,116,139,0.16)"
                      : "1px solid rgba(255,255,255,0.10)",
                    fontSize: "13px",
                    fontWeight: 850,
                    lineHeight: 1.35,
                  }}
                >
                  {t("No hay hallazgos en esta categoría.")}
                </div>
              ) : (
                <div style={{ display: "grid", gap: "7px" }}>
                  {hallazgosCierreVisibles.map((hallazgo) => {
                    const claveHallazgo = claveHallazgoCierreMovil(hallazgo);
                    const hallazgoExpandido =
                      hallazgoCierreExpandido === claveHallazgo;
                    const responsable = responsableVisibleCierreMovil(hallazgo);
                    const evidenciasRecibidas =
                      hallazgo.seguimientoCierre?.evidenciaRecibida || [];
                    const formularioActivo =
                      formularioEvidenciaCierre === claveHallazgo;
                    const cierreDirectoBajo = hallazgoBajoCierreMovil(hallazgo);
                    const confirmacionCierreBajoActiva =
                      confirmacionCierreBajo === claveHallazgo;
                    return (
                      <div
                        key={claveHallazgo}
                        style={{
                          borderRadius: "14px",
                          background: temaClaro
                            ? "rgba(255,255,255,0.84)"
                            : "rgba(255,255,255,0.075)",
                          border: temaClaro
                            ? "1px solid rgba(100,116,139,0.18)"
                            : "1px solid rgba(255,255,255,0.12)",
                          boxSizing: "border-box",
                          overflow: "hidden",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setHallazgoCierreExpandido((actual) =>
                              actual === claveHallazgo ? "" : claveHallazgo
                            );
                            vibrarOk();
                          }}
                          aria-expanded={hallazgoExpandido}
                          style={{
                            width: "100%",
                            border: "0",
                            background: "transparent",
                            display: "grid",
                            gridTemplateColumns: "minmax(0, 1.25fr) 86px auto",
                            alignItems: "center",
                            gap: "8px",
                            padding: "10px",
                            color: "inherit",
                            textAlign: "left",
                            cursor: "pointer",
                            touchAction: "manipulation",
                          }}
                        >
                          <span
                            style={{
                              minWidth: 0,
                              fontSize: "12px",
                              fontWeight: 950,
                              color: temaClaro ? "#0f172a" : "white",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {hallazgo.codigo}
                          </span>
                          <span
                            style={{
                              justifySelf: "center",
                              fontSize: "11px",
                              fontWeight: 900,
                              color: temaClaro ? "#475569" : "rgba(226,232,240,0.78)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {fechaFiltroCierreMovil(hallazgo, categoriaCierreActiva)}
                          </span>
                          <span
                            style={{
                              flex: "0 0 auto",
                              justifySelf: "end",
                              borderRadius: "999px",
                              padding: "5px 7px",
                              background:
                                hallazgo.criticidad === "CRITICO"
                                  ? "rgba(127,29,29,0.92)"
                                  : hallazgo.criticidad === "ALTO"
                                    ? "rgba(220,38,38,0.88)"
                                    : hallazgo.criticidad === "MEDIO"
                                      ? "rgba(245,158,11,0.90)"
                                      : "rgba(34,197,94,0.88)",
                              color: "white",
                              fontSize: "10px",
                              fontWeight: 950,
                              lineHeight: 1,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {hallazgo.criticidad === "CRITICO"
                              ? "CRÍTICO"
                              : hallazgo.criticidad}
                          </span>
                        </button>
                        {hallazgoExpandido && (
                          <div
                            style={{
                              borderTop: temaClaro
                                ? "1px solid rgba(100,116,139,0.14)"
                                : "1px solid rgba(255,255,255,0.10)",
                              padding: "10px 12px 12px",
                              display: "grid",
                              gap: "7px",
                              fontSize: "11px",
                              lineHeight: 1.35,
                              color: temaClaro ? "#475569" : "rgba(226,232,240,0.78)",
                              fontWeight: 800,
                            }}
                          >
                            <div>
                              Área: {hallazgo.area || t("Sin área")}
                            </div>
                            <div
                              style={{
                                fontSize: "12px",
                                color: temaClaro
                                  ? "#334155"
                                  : "rgba(241,245,249,0.88)",
                              }}
                            >
                              {descripcionBreveCierreMovil(hallazgo) ||
                                t("Sin descripción disponible")}
                            </div>
                            <div>
                              {t("Responsable")}:{" "}
                              {responsable || t("Sin responsable")}
                            </div>
                            <div>Estado: {estadoVisibleCierreMovil(hallazgo)}</div>
                            <div>
                              {t("Fecha compromiso")}:{" "}
                              {hallazgo.seguimientoCierre?.fechaCompromiso ||
                                t("Sin fecha compromiso")}
                            </div>
                            {evidenciasRecibidas.length > 0 && (
                              <div
                                style={{
                                  borderRadius: "12px",
                                  padding: "9px 10px",
                                  background: temaClaro
                                    ? "rgba(34,197,94,0.08)"
                                    : "rgba(34,197,94,0.13)",
                                  border: temaClaro
                                    ? "1px solid rgba(34,197,94,0.18)"
                                    : "1px solid rgba(134,239,172,0.18)",
                                  display: "grid",
                                  gap: "5px",
                                }}
                              >
                                <div
                                  style={{
                                    color: temaClaro ? "#166534" : "#bbf7d0",
                                    fontWeight: 950,
                                  }}
                                >
                                  {t("Evidencia enviada")}
                                </div>
                                {evidenciasRecibidas.slice(-2).map((evidencia) => (
                                  <div
                                    key={
                                      evidencia.id ||
                                      evidencia.evidenceId ||
                                      evidencia.storagePath ||
                                      evidencia.fechaCarga
                                    }
                                  >
                                    {resumenEvidenciaRecibidaCierreMovil(evidencia)}
                                    {evidencia.fechaCarga ? (
                                      <>
                                        <br />
                                        {t("Fecha de envío")}:{" "}
                                        {fechaLegibleCierreMovil(evidencia.fechaCarga)}
                                      </>
                                    ) : null}
                                  </div>
                                ))}
                              </div>
                            )}
                            {categoriaCierreActiva === "por_cerrar" && (
                              <div
                                style={{
                                  display: "grid",
                                  gap: "8px",
                                }}
                              >
                                {!formularioActivo && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      abrirFormularioEvidenciaCierre(hallazgo)
                                    }
                                    {...feedbackBoton(
                                      `evidencia-cierre-${claveHallazgo}`
                                    )}
                                    style={{
                                      border: "0",
                                      borderRadius: "12px",
                                      padding: "10px 12px",
                                      background:
                                        "linear-gradient(180deg, #2563eb, #1d4ed8)",
                                      color: "white",
                                      fontSize: "12px",
                                      fontWeight: 950,
                                      cursor: "pointer",
                                      touchAction: "manipulation",
                                      ...estiloFeedback(
                                        `evidencia-cierre-${claveHallazgo}`
                                      ),
                                    }}
                                  >
                                    {t("Agregar evidencia de cierre")}
                                  </button>
                                )}
                                {formularioActivo && (
                                  <div
                                    style={{
                                      borderRadius: "14px",
                                      padding: "11px",
                                      background: temaClaro
                                        ? "rgba(37,99,235,0.06)"
                                        : "rgba(37,99,235,0.14)",
                                      border: temaClaro
                                        ? "1px solid rgba(37,99,235,0.16)"
                                        : "1px solid rgba(147,197,253,0.18)",
                                      display: "grid",
                                      gap: "9px",
                                    }}
                                  >
                                    <div
                                      style={{
                                        fontSize: "13px",
                                        fontWeight: 950,
                                        color: temaClaro ? "#0f172a" : "white",
                                      }}
                                    >
                                      {t("Evidencia de cierre")}
                                    </div>
                                    <div
                                      style={{
                                        borderRadius: "10px",
                                        padding: "8px 9px",
                                        background: cierreDirectoBajo
                                          ? temaClaro
                                            ? "rgba(34,197,94,0.10)"
                                            : "rgba(34,197,94,0.16)"
                                          : temaClaro
                                            ? "rgba(37,99,235,0.08)"
                                            : "rgba(59,130,246,0.14)",
                                        color: cierreDirectoBajo
                                          ? temaClaro
                                            ? "#166534"
                                            : "#bbf7d0"
                                          : temaClaro
                                            ? "#1d4ed8"
                                            : "#bfdbfe",
                                        fontSize: "11px",
                                        fontWeight: 900,
                                        lineHeight: 1.35,
                                      }}
                                    >
                                      {cierreDirectoBajo
                                        ? t(
                                            "Los hallazgos de baja criticidad pueden cerrarse directamente con evidencia."
                                          )
                                        : t("Este hallazgo requiere revisión antes del cierre.")}
                                    </div>
                                    <div
                                      style={{
                                        display: "grid",
                                        gap: "8px",
                                        fontSize: "11px",
                                        fontWeight: 900,
                                      }}
                                    >
                                      {t("Fotografía obligatoria")}
                                      <button
                                        type="button"
                                        onClick={abrirCamaraEvidenciaCierre}
                                        disabled={
                                          enviandoEvidenciaCierre ||
                                          procesandoEvidenciaCierre ||
                                          iniciandoCamaraEvidenciaCierre
                                        }
                                        {...feedbackBoton(
                                          `tomar-foto-cierre-${claveHallazgo}`
                                        )}
                                        style={{
                                          border: "0",
                                          borderRadius: "12px",
                                          padding: "11px 12px",
                                          background:
                                            "linear-gradient(180deg, #2563eb, #1d4ed8)",
                                          color: "white",
                                          fontSize: "12px",
                                          fontWeight: 950,
                                          textAlign: "center",
                                          cursor:
                                            enviandoEvidenciaCierre ||
                                            procesandoEvidenciaCierre ||
                                            iniciandoCamaraEvidenciaCierre
                                              ? "not-allowed"
                                              : "pointer",
                                          opacity:
                                            enviandoEvidenciaCierre ||
                                            procesandoEvidenciaCierre ||
                                            iniciandoCamaraEvidenciaCierre
                                              ? 0.76
                                              : 1,
                                          touchAction: "manipulation",
                                          ...estiloFeedback(
                                            `tomar-foto-cierre-${claveHallazgo}`
                                          ),
                                        }}
                                      >
                                        {t("Tomar fotografía de cierre")}
                                      </button>
                                      {camaraEvidenciaCierreAbierta && (
                                        <div
                                          role="dialog"
                                          aria-modal="true"
                                          aria-label={t("Cámara de cierre")}
                                          style={{
                                            position: "fixed",
                                            inset: 0,
                                            zIndex: 90,
                                            background: "rgba(2,6,23,0.88)",
                                            padding: "18px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                          }}
                                        >
                                          <div
                                            style={{
                                              width: "min(100%, 430px)",
                                              maxHeight: "92vh",
                                              overflowY: "auto",
                                              borderRadius: "20px",
                                              background: temaClaro
                                                ? "rgba(255,255,255,0.98)"
                                                : "rgba(15,23,42,0.98)",
                                              border: temaClaro
                                                ? "1px solid rgba(100,116,139,0.18)"
                                                : "1px solid rgba(255,255,255,0.16)",
                                              boxShadow:
                                                "0 24px 60px rgba(0,0,0,0.38)",
                                              padding: "14px",
                                              display: "grid",
                                              gap: "12px",
                                            }}
                                          >
                                            <div
                                              style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                gap: "10px",
                                              }}
                                            >
                                              <div
                                                style={{
                                                  color: temaClaro
                                                    ? "#0f172a"
                                                    : "white",
                                                  fontSize: "16px",
                                                  fontWeight: 950,
                                                }}
                                              >
                                                {t("Cámara de cierre")}
                                              </div>
                                              <button
                                                type="button"
                                                onClick={cerrarCamaraEvidenciaCierre}
                                                style={{
                                                  border: temaClaro
                                                    ? "1px solid rgba(100,116,139,0.18)"
                                                    : "1px solid rgba(255,255,255,0.16)",
                                                  borderRadius: "999px",
                                                  background: temaClaro
                                                    ? "rgba(248,250,252,0.92)"
                                                    : "rgba(255,255,255,0.10)",
                                                  color: temaClaro
                                                    ? "#0f172a"
                                                    : "white",
                                                  padding: "8px 12px",
                                                  fontSize: "12px",
                                                  fontWeight: 950,
                                                  cursor: "pointer",
                                                }}
                                              >
                                                {t("Cancelar")}
                                              </button>
                                            </div>
                                            <div
                                              style={{
                                                borderRadius: "16px",
                                                background: "#020617",
                                                border:
                                                  "1px solid rgba(255,255,255,0.14)",
                                                minHeight: "260px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                overflow: "hidden",
                                              }}
                                            >
                                              {iniciandoCamaraEvidenciaCierre ? (
                                                <div
                                                  style={{
                                                    color: "white",
                                                    fontSize: "13px",
                                                    fontWeight: 900,
                                                    padding: "18px",
                                                    textAlign: "center",
                                                  }}
                                                >
                                                  {t("Iniciando cámara de cierre...")}
                                                </div>
                                              ) : errorCamaraEvidenciaCierre ? (
                                                <div
                                                  style={{
                                                    color: "white",
                                                    fontSize: "13px",
                                                    fontWeight: 850,
                                                    lineHeight: 1.45,
                                                    padding: "18px",
                                                    textAlign: "center",
                                                    display: "grid",
                                                    gap: "12px",
                                                    justifyItems: "center",
                                                  }}
                                                >
                                                  <span>{errorCamaraEvidenciaCierre}</span>
                                                  <button
                                                    type="button"
                                                    onClick={abrirCamaraEvidenciaCierre}
                                                    style={{
                                                      border: "0",
                                                      borderRadius: "12px",
                                                      padding: "10px 12px",
                                                      background:
                                                        "linear-gradient(180deg, #2563eb, #1d4ed8)",
                                                      color: "white",
                                                      fontSize: "12px",
                                                      fontWeight: 950,
                                                      cursor: "pointer",
                                                    }}
                                                  >
                                                    {t("Reintentar cámara")}
                                                  </button>
                                                </div>
                                              ) : (
                                                <div
                                                  style={{
                                                    position: "relative",
                                                    width: "100%",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                  }}
                                                >
                                                  <video
                                                    key={versionCamaraEvidenciaCierre}
                                                    ref={videoCamaraEvidenciaCierreRef}
                                                    autoPlay
                                                    playsInline
                                                    muted
                                                    style={{
                                                      width: "100%",
                                                      height: "auto",
                                                      maxHeight: "64vh",
                                                      objectFit: "contain",
                                                      display: "block",
                                                      background: "#020617",
                                                    }}
                                                  />
                                                  {!camaraEvidenciaCierreLista && (
                                                    <div
                                                      style={{
                                                        position: "absolute",
                                                        inset: 0,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        background:
                                                          "rgba(2,6,23,0.42)",
                                                        color: "white",
                                                        fontSize: "13px",
                                                        fontWeight: 900,
                                                        textAlign: "center",
                                                        padding: "18px",
                                                      }}
                                                    >
                                                      {t("Iniciando cámara de cierre...")}
                                                    </div>
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                            <div
                                              style={{
                                                display: "grid",
                                                gridTemplateColumns: "1fr 1fr",
                                                gap: "8px",
                                              }}
                                            >
                                              <button
                                                type="button"
                                                onClick={cerrarCamaraEvidenciaCierre}
                                                style={{
                                                  border: temaClaro
                                                    ? "1px solid rgba(100,116,139,0.18)"
                                                    : "1px solid rgba(255,255,255,0.16)",
                                                  borderRadius: "12px",
                                                  padding: "11px 12px",
                                                  background: temaClaro
                                                    ? "rgba(248,250,252,0.94)"
                                                    : "rgba(255,255,255,0.10)",
                                                  color: temaClaro
                                                    ? "#0f172a"
                                                    : "white",
                                                  fontSize: "12px",
                                                  fontWeight: 950,
                                                  cursor: "pointer",
                                                }}
                                              >
                                                {t("Cancelar")}
                                              </button>
                                              <button
                                                type="button"
                                                onClick={capturarFotoCamaraEvidenciaCierre}
                                                disabled={
                                                  iniciandoCamaraEvidenciaCierre ||
                                                  procesandoEvidenciaCierre ||
                                                  !camaraEvidenciaCierreLista ||
                                                  Boolean(errorCamaraEvidenciaCierre)
                                                }
                                                style={{
                                                  border: "0",
                                                  borderRadius: "12px",
                                                  padding: "11px 12px",
                                                  background:
                                                    "linear-gradient(180deg, #22c55e, #16a34a)",
                                                  color: "#052e16",
                                                  fontSize: "12px",
                                                  fontWeight: 950,
                                                  cursor:
                                                    iniciandoCamaraEvidenciaCierre ||
                                                    procesandoEvidenciaCierre ||
                                                    !camaraEvidenciaCierreLista ||
                                                    errorCamaraEvidenciaCierre
                                                      ? "not-allowed"
                                                      : "pointer",
                                                  opacity:
                                                    iniciandoCamaraEvidenciaCierre ||
                                                    procesandoEvidenciaCierre ||
                                                    !camaraEvidenciaCierreLista ||
                                                    errorCamaraEvidenciaCierre
                                                      ? 0.66
                                                      : 1,
                                                }}
                                              >
                                                {t("Capturar fotografía")}
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                      {procesandoEvidenciaCierre && (
                                        <span
                                          style={{
                                            color: temaClaro
                                              ? "#1d4ed8"
                                              : "#bfdbfe",
                                            fontSize: "10px",
                                            fontWeight: 850,
                                          }}
                                        >
                                          {t("Procesando fotografía de cierre...")}
                                        </span>
                                      )}
                                      <span
                                        style={{
                                          color: archivoEvidenciaCierre
                                            ? temaClaro
                                              ? "#166534"
                                              : "#bbf7d0"
                                            : temaClaro
                                              ? "#64748b"
                                              : "rgba(226,232,240,0.78)",
                                          fontSize: "11px",
                                          fontWeight: 900,
                                        }}
                                      >
                                        {archivoEvidenciaCierre
                                          ? t("Fotografía seleccionada correctamente")
                                          : t("Sin fotografía seleccionada")}
                                      </span>
                                      {archivoEvidenciaCierre && (
                                        <span
                                          style={{
                                            color: temaClaro
                                              ? "#166534"
                                              : "#bbf7d0",
                                            fontSize: "10px",
                                            fontWeight: 850,
                                          }}
                                        >
                                          {t("Imagen lista para enviar")}
                                        </span>
                                      )}
                                    </div>
                                    {previewEvidenciaCierre && (
                                      <div
                                        style={{
                                          display: "grid",
                                          gap: "6px",
                                        }}
                                      >
                                        <span
                                          style={{
                                            color: temaClaro
                                              ? "#64748b"
                                              : "rgba(226,232,240,0.78)",
                                            fontSize: "11px",
                                            fontWeight: 900,
                                          }}
                                        >
                                          {t(
                                            "Vista previa de la fotografía seleccionada"
                                          )}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setPreviewEvidenciaCierreAmpliada(true)
                                          }
                                          style={{
                                            width: "100%",
                                            borderRadius: "12px",
                                            background: temaClaro
                                              ? "rgba(248,250,252,0.96)"
                                              : "rgba(15,23,42,0.36)",
                                            border: temaClaro
                                              ? "1px solid rgba(100,116,139,0.16)"
                                              : "1px solid rgba(255,255,255,0.12)",
                                            padding: "8px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            cursor: "zoom-in",
                                            touchAction: "manipulation",
                                          }}
                                        >
                                          {/* Preview local; la evidencia se envia con el archivo preparado. */}
                                          {/* eslint-disable-next-line @next/next/no-img-element */}
                                          <img
                                            src={previewEvidenciaCierre}
                                            alt={t(
                                              "Vista previa de la fotografía seleccionada"
                                            )}
                                            style={{
                                              width: "auto",
                                              height: "auto",
                                              maxWidth: "100%",
                                              maxHeight: "360px",
                                              objectFit: "contain",
                                              display: "block",
                                              borderRadius: "10px",
                                            }}
                                          />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setPreviewEvidenciaCierreAmpliada(true)
                                          }
                                          style={{
                                            border: "0",
                                            background: "transparent",
                                            color: temaClaro ? "#2563eb" : "#93c5fd",
                                            fontSize: "11px",
                                            fontWeight: 900,
                                            padding: "0",
                                            textAlign: "left",
                                            cursor: "zoom-in",
                                          }}
                                        >
                                          {t("Tocar imagen para ampliar")}
                                        </button>
                                      </div>
                                    )}
                                    {previewEvidenciaCierre &&
                                      previewEvidenciaCierreAmpliada && (
                                        <div
                                          role="dialog"
                                          aria-modal="true"
                                          aria-label={t(
                                            "Vista previa de la fotografía seleccionada"
                                          )}
                                          style={{
                                            position: "fixed",
                                            inset: 0,
                                            zIndex: 80,
                                            background: "rgba(2,6,23,0.86)",
                                            padding: "18px",
                                            display: "grid",
                                            gridTemplateRows: "auto 1fr",
                                            gap: "12px",
                                          }}
                                        >
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setPreviewEvidenciaCierreAmpliada(
                                                false
                                              )
                                            }
                                            style={{
                                              justifySelf: "end",
                                              border: "1px solid rgba(255,255,255,0.18)",
                                              borderRadius: "999px",
                                              background: "rgba(255,255,255,0.12)",
                                              color: "white",
                                              padding: "8px 12px",
                                              fontSize: "12px",
                                              fontWeight: 950,
                                              cursor: "pointer",
                                            }}
                                          >
                                            {t("Cerrar vista ampliada")}
                                          </button>
                                          <div
                                            style={{
                                              minHeight: 0,
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                            }}
                                          >
                                            {/* Preview local; la evidencia se envia con el archivo preparado. */}
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                              src={previewEvidenciaCierre}
                                              alt={t(
                                                "Vista previa de la fotografía seleccionada"
                                              )}
                                              style={{
                                                width: "auto",
                                                height: "auto",
                                                maxWidth: "100%",
                                                maxHeight: "82vh",
                                                objectFit: "contain",
                                                display: "block",
                                                borderRadius: "14px",
                                              }}
                                            />
                                          </div>
                                        </div>
                                      )}
                                    <label
                                      style={{
                                        display: "grid",
                                        gap: "6px",
                                        fontSize: "11px",
                                        fontWeight: 900,
                                      }}
                                    >
                                      {t("Comentario obligatorio")}
                                      <textarea
                                        value={comentarioEvidenciaCierre}
                                        onChange={(event) => {
                                          setComentarioEvidenciaCierre(
                                            event.currentTarget.value
                                          );
                                          setErrorEvidenciaCierre("");
                                        }}
                                        disabled={enviandoEvidenciaCierre}
                                        placeholder={t(
                                          "Describe brevemente la corrección realizada"
                                        )}
                                        rows={3}
                                        style={{
                                          width: "100%",
                                          boxSizing: "border-box",
                                          borderRadius: "12px",
                                          border: temaClaro
                                            ? "1px solid rgba(100,116,139,0.20)"
                                            : "1px solid rgba(255,255,255,0.14)",
                                          background: temaClaro
                                            ? "rgba(255,255,255,0.96)"
                                            : "rgba(15,23,42,0.36)",
                                          color: temaClaro ? "#0f172a" : "white",
                                          padding: "10px",
                                          fontSize: "13px",
                                          fontWeight: 800,
                                          resize: "vertical",
                                        }}
                                      />
                                    </label>
                                    {errorEvidenciaCierre && (
                                      <div
                                        style={{
                                          borderRadius: "10px",
                                          padding: "8px 9px",
                                          background: temaClaro
                                            ? "rgba(220,38,38,0.08)"
                                            : "rgba(239,68,68,0.14)",
                                          color: temaClaro ? "#991b1b" : "#fecaca",
                                          fontSize: "12px",
                                          fontWeight: 900,
                                        }}
                                      >
                                        {errorEvidenciaCierre}
                                      </div>
                                    )}
                                    <div
                                      style={{
                                        display: "grid",
                                        gridTemplateColumns: "1fr 1.2fr",
                                        gap: "8px",
                                      }}
                                    >
                                      <button
                                        type="button"
                                        onClick={limpiarFormularioEvidenciaCierre}
                                        disabled={enviandoEvidenciaCierre}
                                        style={{
                                          border: temaClaro
                                            ? "1px solid rgba(100,116,139,0.20)"
                                            : "1px solid rgba(255,255,255,0.12)",
                                          borderRadius: "12px",
                                          background: temaClaro
                                            ? "rgba(255,255,255,0.86)"
                                            : "rgba(255,255,255,0.08)",
                                          color: temaClaro ? "#334155" : "white",
                                          padding: "10px 8px",
                                          fontSize: "12px",
                                          fontWeight: 950,
                                          cursor: enviandoEvidenciaCierre
                                            ? "not-allowed"
                                            : "pointer",
                                        }}
                                      >
                                        {t("Cancelar")}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          cierreDirectoBajo
                                            ? solicitarConfirmacionCierreDirectoBajo(
                                                hallazgo
                                              )
                                            : enviarEvidenciaCierreRevision(hallazgo)
                                        }
                                        disabled={enviandoEvidenciaCierre}
                                        style={{
                                          border: "0",
                                          borderRadius: "12px",
                                          background:
                                            "linear-gradient(180deg, #16a34a, #15803d)",
                                          color: "white",
                                          padding: "10px 8px",
                                          fontSize: "12px",
                                          fontWeight: 950,
                                          cursor: enviandoEvidenciaCierre
                                            ? "not-allowed"
                                            : "pointer",
                                          opacity: enviandoEvidenciaCierre ? 0.76 : 1,
                                        }}
                                      >
                                        {enviandoEvidenciaCierre
                                          ? cierreDirectoBajo
                                            ? t("Cerrando hallazgo...")
                                            : t("Enviando evidencia...")
                                          : cierreDirectoBajo
                                            ? t("Cerrar con evidencia")
                                            : t("Enviar a revisión")}
                                      </button>
                                    </div>
                                    {confirmacionCierreBajoActiva && (
                                      <div
                                        role="dialog"
                                        aria-modal="true"
                                        aria-label={t(
                                          "Cerrar hallazgo con evidencia"
                                        )}
                                        style={{
                                          position: "fixed",
                                          inset: 0,
                                          zIndex: 88,
                                          background: "rgba(2,6,23,0.72)",
                                          padding: "18px",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                        }}
                                      >
                                        <div
                                          style={{
                                            width: "min(100%, 380px)",
                                            borderRadius: "18px",
                                            background: temaClaro
                                              ? "rgba(255,255,255,0.98)"
                                              : "rgba(15,23,42,0.98)",
                                            border: temaClaro
                                              ? "1px solid rgba(100,116,139,0.18)"
                                              : "1px solid rgba(255,255,255,0.16)",
                                            boxShadow:
                                              "0 24px 60px rgba(0,0,0,0.38)",
                                            padding: "16px",
                                            display: "grid",
                                            gap: "12px",
                                          }}
                                        >
                                          <div
                                            style={{
                                              color: temaClaro
                                                ? "#0f172a"
                                                : "white",
                                              fontSize: "16px",
                                              fontWeight: 950,
                                            }}
                                          >
                                            {t("Cerrar hallazgo con evidencia")}
                                          </div>
                                          <div
                                            style={{
                                              color: temaClaro
                                                ? "#475569"
                                                : "rgba(226,232,240,0.82)",
                                              fontSize: "13px",
                                              fontWeight: 850,
                                              lineHeight: 1.45,
                                            }}
                                          >
                                            {t(
                                              "Este hallazgo será marcado como cerrado con evidencia. La acción quedará registrada en la bitácora."
                                            )}
                                          </div>
                                          <div
                                            style={{
                                              display: "grid",
                                              gridTemplateColumns: "1fr 1fr",
                                              gap: "8px",
                                            }}
                                          >
                                            <button
                                              type="button"
                                              onClick={() =>
                                                setConfirmacionCierreBajo("")
                                              }
                                              disabled={enviandoEvidenciaCierre}
                                              style={{
                                                border: temaClaro
                                                  ? "1px solid rgba(100,116,139,0.20)"
                                                  : "1px solid rgba(255,255,255,0.14)",
                                                borderRadius: "12px",
                                                background: temaClaro
                                                  ? "rgba(248,250,252,0.94)"
                                                  : "rgba(255,255,255,0.10)",
                                                color: temaClaro
                                                  ? "#334155"
                                                  : "white",
                                                padding: "11px 10px",
                                                fontSize: "12px",
                                                fontWeight: 950,
                                                cursor: enviandoEvidenciaCierre
                                                  ? "not-allowed"
                                                  : "pointer",
                                              }}
                                            >
                                              {t("Cancelar")}
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                enviarEvidenciaCierreRevision(
                                                  hallazgo,
                                                  { cerrarDirectoBajo: true }
                                                )
                                              }
                                              disabled={enviandoEvidenciaCierre}
                                              style={{
                                                border: "0",
                                                borderRadius: "12px",
                                                background:
                                                  "linear-gradient(180deg, #16a34a, #15803d)",
                                                color: "white",
                                                padding: "11px 10px",
                                                fontSize: "12px",
                                                fontWeight: 950,
                                                cursor: enviandoEvidenciaCierre
                                                  ? "not-allowed"
                                                  : "pointer",
                                                opacity: enviandoEvidenciaCierre
                                                  ? 0.76
                                                  : 1,
                                              }}
                                            >
                                              {enviandoEvidenciaCierre
                                                ? t("Cerrando hallazgo...")
                                                : t("Confirmar cierre")}
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                            <div
                              style={{
                                marginTop: "2px",
                                borderRadius: "10px",
                                padding: "7px 8px",
                                background: temaClaro
                                  ? "rgba(15,23,42,0.05)"
                                  : "rgba(255,255,255,0.08)",
                                color: temaClaro
                                  ? "#334155"
                                  : "rgba(241,245,249,0.82)",
                                textAlign: "center",
                                fontSize: "11px",
                                fontWeight: 900,
                              }}
                            >
                              {t("Gestión de cierre próxima fase")}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {hayMasHallazgosCierre && (
                    <button
                      type="button"
                      onClick={() => {
                        setLimiteVisibleCierre(
                          (actual) => actual + INCREMENTO_LISTADO_CIERRE_MOVIL
                        );
                        vibrarOk();
                      }}
                      {...feedbackBoton("mostrar-mas-cierre")}
                      style={{
                        border: temaClaro
                          ? "1px solid rgba(37,99,235,0.24)"
                          : "1px solid rgba(147,197,253,0.24)",
                        borderRadius: "14px",
                        background: temaClaro
                          ? "rgba(37,99,235,0.08)"
                          : "rgba(59,130,246,0.14)",
                        color: temaClaro ? "#1d4ed8" : "#bfdbfe",
                        padding: "10px 12px",
                        fontSize: "12px",
                        fontWeight: 950,
                        cursor: "pointer",
                        touchAction: "manipulation",
                        ...estiloFeedback("mostrar-mas-cierre"),
                      }}
                    >
                      {t("Mostrar más")} · {hallazgosCierreVisibles.length}/
                      {hallazgosCierreFiltrados.length}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
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
