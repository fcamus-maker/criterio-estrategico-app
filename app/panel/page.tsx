"use client";
import { useEffect, useState } from "react";
import { hallazgosMock, notificacionesMock, usuarioMock } from "./mockdata";
import { cargarHallazgosPanelConReportesV2 } from "./sources/hallazgosPanelSource";

function chipColor(tipo: string) {
  const valor = String(tipo).toUpperCase();

  if (valor.includes("CRÍT")) {
    return {
      fondo: "rgba(239,68,68,0.16)",
      borde: "1px solid rgba(239,68,68,0.35)",
      texto: "#fecaca",
    };
  }

  if (valor.includes("ALTO")) {
    return {
      fondo: "rgba(245,158,11,0.16)",
      borde: "1px solid rgba(245,158,11,0.35)",
      texto: "#fde68a",
    };
  }

  if (valor.includes("MED")) {
    return {
      fondo: "rgba(59,130,246,0.16)",
      borde: "1px solid rgba(59,130,246,0.35)",
      texto: "#bfdbfe",
    };
  }

  return {
    fondo: "rgba(34,197,94,0.16)",
    borde: "1px solid rgba(34,197,94,0.35)",
    texto: "#bbf7d0",
  };
}
function semaforoVencimiento(fechaCompromiso: string, estado: string) {
  if (estado === "CERRADO") {
    return {
      etiqueta: "CERRADO",
      fondo: "rgba(34,197,94,0.16)",
      borde: "1px solid rgba(34,197,94,0.35)",
      texto: "#bbf7d0",
    };
  }

  if (!fechaCompromiso) {
    return {
      etiqueta: "SIN FECHA",
      fondo: "rgba(148,163,184,0.16)",
      borde: "1px solid rgba(148,163,184,0.35)",
      texto: "#cbd5e1",
    };
  }

  const [anio, mes, dia] = fechaCompromiso.split("-").map(Number);
  const compromiso = new Date(anio, mes - 1, dia);
  compromiso.setHours(0, 0, 0, 0);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const diferenciaDias = Math.round(
    (compromiso.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diferenciaDias < 0) {
    return {
      etiqueta: "VENCIDO",
      fondo: "rgba(239,68,68,0.16)",
      borde: "1px solid rgba(239,68,68,0.35)",
      texto: "#fecaca",
    };
  }

  if (diferenciaDias <= 2) {
    return {
      etiqueta: "POR VENCER",
      fondo: "rgba(245,158,11,0.16)",
      borde: "1px solid rgba(245,158,11,0.35)",
      texto: "#fde68a",
    };
  }

  return {
    etiqueta: "EN PLAZO",
    fondo: "rgba(34,197,94,0.16)",
    borde: "1px solid rgba(34,197,94,0.35)",
    texto: "#bbf7d0",
  };
}
const panelCardStyle: React.CSSProperties = {
  borderRadius: "22px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.10)",
  boxShadow: "0 12px 28px rgba(0,0,0,0.22)",
  backdropFilter: "blur(6px)",
};

const PANEL_CONFIG_STORAGE_KEY = "ce_panel_config";
const PANEL_PROFILE_STORAGE_KEY = "ce_panel_profile";

type FormatoExportacion = "pdf" | "excel" | "csv";
type FormatosExportacionConfig = Record<FormatoExportacion, boolean>;
type FormatoHojaPDF = "carta" | "a4";
type OrientacionPDF = "vertical" | "horizontal";
type PerfilPermiso = "administrador" | "supervisor" | "gerencia" | "cliente";

type OpcionesPDFConfig = {
  evidenciaFotografica: boolean;
  firmaResponsable: boolean;
  fechaHora: boolean;
  formatoHoja: FormatoHojaPDF;
  orientacion: OrientacionPDF;
};

type PanelConfigPersistida = {
  nombreEmpresaConfig: string;
  logoEmpresaConfig: string;
  brandingPC: boolean;
  brandingPDF: boolean;
  formatosExportacion: FormatosExportacionConfig;
  opcionesPDF: OpcionesPDFConfig;
  perfilesActivos: Record<PerfilPermiso, boolean>;
  modoSistema: "claro" | "oscuro" | "automatico";
  idiomaSistema: "es" | "en" | "auto";
};

type PanelProfilePersistido = {
  nombrePerfil: string;
  cargoPerfil: string;
  fotoPerfil: string | null;
};

type BitacoraCierreLocal = {
  fechaHora: string;
  usuario: string;
  accion: string;
  resumen: string;
  camposModificados: string[];
  estadoAnterior: string;
  estadoNuevo: string;
};

type GestionCierreDraft = {
  responsableCorreccionTipo: string;
  responsableCorreccionEmpresa: string;
  responsableCorreccionNombre: string;
  responsableCorreccionCargo: string;
  responsableCorreccionTelefono: string;
  encargadoSeguimientoNombre: string;
  estadoSeguimiento: string;
  accionCorrectivaRequerida: string;
  evidenciaRequerida: string[];
  responsableCierreFechaCompromiso: string;
  validadorCierreNombre: string;
  validadorCierreEstado: string;
  validadorCierreObservacion: string;
};

type GestionCierreLocal = Partial<GestionCierreDraft> & {
  responsableCierreEstadoSeguimiento?: string;
  responsableCierreEvidencia?: string;
  evidenciaRecibida?: string;
  responsableCierreObservacion?: string;
  bitacoraCierre?: BitacoraCierreLocal[];
};

const formatosExportacionPorDefecto: FormatosExportacionConfig = {
  pdf: true,
  excel: true,
  csv: true,
};

const opcionesPDFPorDefecto: OpcionesPDFConfig = {
  evidenciaFotografica: true,
  firmaResponsable: true,
  fechaHora: true,
  formatoHoja: "carta",
  orientacion: "vertical",
};

const perfilesActivosPorDefecto: Record<PerfilPermiso, boolean> = {
  administrador: true,
  supervisor: true,
  gerencia: true,
  cliente: true,
};

export default function PanelEjecutivoPage() {
  const [vistaDerecha, setVistaDerecha] = useState<"informe" | "configuracion" | "seguimiento">("informe");
  const [vistaPrincipal, setVistaPrincipal] = useState<"panel" | "configuracion" | "seguimiento">("panel");
  const [modoSistema, setModoSistema] = useState<"claro" | "oscuro" | "automatico">("oscuro");
const [idiomaSistema, setIdiomaSistema] = useState<"es" | "en" | "auto">("es");
const [nombreEmpresaConfig, setNombreEmpresaConfig] = useState("Cliente corporativo");
const [logoEmpresaConfig, setLogoEmpresaConfig] = useState("");
const [logoInputKey, setLogoInputKey] = useState(0);
const [brandingPC, setBrandingPC] = useState(true);
const [brandingPDF, setBrandingPDF] = useState(true);
const [formatosExportacion, setFormatosExportacion] = useState<FormatosExportacionConfig>(formatosExportacionPorDefecto);
const [opcionesPDF, setOpcionesPDF] = useState<OpcionesPDFConfig>(opcionesPDFPorDefecto);
const [perfilesActivos, setPerfilesActivos] = useState<Record<PerfilPermiso, boolean>>(perfilesActivosPorDefecto);
const [guardadoConfig, setGuardadoConfig] = useState(false);
const [fechaActualizacion, setFechaActualizacion] = useState<Date | null>(null);
const [filasPanel, setFilasPanel] = useState(hallazgosMock);
  const idiomaActivo = idiomaSistema === "en" ? "en" : "es";
  const textosEn: Record<string, string> = {
    "Plataforma Ejecutiva de Hallazgos": "Executive Findings Platform",
    "Sistema activo": "System active",
    "Sistema inteligente de reportes": "Intelligent reporting system",
    "Vista activa:": "Active view:",
    Hoy: "Today",
    "Esta semana": "This week",
    "Este mes": "This month",
    Personalizado: "Custom",
    "Última actualización:": "Last update:",
    "Filtros activos:": "Active filters:",
    "Editar perfil": "Edit profile",
    "Guardar perfil": "Save profile",
    Cerrar: "Close",
    Cancelar: "Cancel",
    Salir: "Exit",
    Nombre: "Name",
    Cargo: "Role",
    "Foto de perfil": "Profile photo",
    "Seleccionar foto": "Select photo",
    "Quitar foto": "Remove photo",
    "Perfil actualizado correctamente": "Profile updated successfully",
    "Los cambios se guardan en este navegador": "Changes are saved in this browser",
    "Foto cargada correctamente": "Photo uploaded successfully",
    "No se pudo guardar el perfil en este navegador": "The profile could not be saved in this browser",
    "La foto es demasiado pesada. Selecciona una imagen más liviana.": "The photo is too large. Select a smaller image.",
    "Actualiza los datos visibles del usuario en el panel lateral": "Update the user details visible in the side panel",
    Notificaciones: "Notifications",
    "Sin notificaciones por ahora": "No notifications for now",
    "Reportes rápidos": "Quick reports",
    Filtros: "Filters",
    Empresa: "Company",
    "Obra / Proyecto": "Site / Project",
    "Fecha desde": "Start date",
    "Fecha hasta": "End date",
    Estado: "Status",
    Fecha: "Date",
    Criticidad: "Severity",
    "Tipo de hallazgo": "Finding type",
    Seleccionar: "Select",
    "Limpiar filtros": "Clear filters",
    "Acceso rápido": "Quick access",
    "Exportar a Excel": "Export to Excel",
    "Generar informe empresa/obra": "Generate company/site report",
    Configuración: "Settings",
    "Seguimiento de cierre": "Closure follow-up",
    "Control de responsables, plazos, evidencias y estado de corrección.": "Control of responsible parties, deadlines, evidence and correction status.",
    "Responsable de cierre": "Closure responsible",
    "Responsable de corrección": "Correction responsible",
    "Encargado de seguimiento": "Follow-up owner",
    "Validador de cierre": "Closure validator",
    "Seleccionar validador": "Select validator",
    "El validador revisa la evidencia y aprueba o rechaza el cierre definitivo.": "The validator reviews the evidence and approves or rejects the final closure.",
    "Los datos pueden ser preasignados desde la app móvil por el supervisor y ajustados desde la plataforma PC. Todo cambio debe quedar registrado en bitácora.": "Data can be preassigned from the mobile app by the supervisor and adjusted from the PC platform. Every change must be recorded in the log.",
    "Acción correctiva requerida": "Required corrective action",
    "Evidencia requerida": "Required evidence",
    "Evidencia recibida": "Received evidence",
    "Gestionar cierre": "Manage closure",
    Asignación: "Assignment",
    "Tipo de responsable de corrección": "Correction responsible type",
    "Nombre responsable": "Responsible name",
    "Empresa contratista": "Contractor company",
    "Corrección requerida": "Required correction",
    Validación: "Validation",
    "Estado de validación": "Validation status",
    "Observación de validación": "Validation note",
    "No se pudo guardar. Revisa los campos obligatorios.": "Could not save. Review the required fields.",
    "Tipo de responsable de corrección es obligatorio.": "Correction responsible type is required.",
    "Empresa responsable es obligatoria.": "Responsible company is required.",
    "Acción correctiva requerida es obligatoria.": "Required corrective action is required.",
    "Selecciona al menos una evidencia requerida.": "Select at least one required evidence item.",
    "Para aprobar o cerrar, agrega evidencia requerida o una observación de validación.": "To approve or close, add required evidence or a validation note.",
    "Para aprobar, define validador, evidencia requerida y observación de validación.": "To approve, define validator, required evidence and validation note.",
    "Trabajador interno": "Internal worker",
    "Supervisor de área": "Area supervisor",
    "Empresa subcontratista": "Subcontractor company",
    "Área interna": "Internal area",
    Mantención: "Maintenance",
    Bodega: "Warehouse",
    Administración: "Administration",
    Prevención: "Prevention",
    Otro: "Other",
    "Registro fotográfico": "Photo record",
    "Documentación de corrección": "Correction documentation",
    "Charla de seguridad": "Safety briefing",
    "Registro firmado": "Signed record",
    "Checklist corregido": "Corrected checklist",
    "Orden de trabajo": "Work order",
    "Certificado externo": "External certificate",
    "Validación en terreno": "Field validation",
    "Otra evidencia": "Other evidence",
    Aprobado: "Approved",
    "Requiere nueva evidencia": "Requires new evidence",
    "Actualización de cierre": "Closure update",
    "Actualización desde plataforma PC": "Update from PC platform",
    "Usuario autorizado": "Authorized user",
    "Pendiente de validador": "Validator pending",
    "Pendiente de evidencia": "Evidence pending",
    "Pendiente de revisión": "Review pending",
    "Evidencia solicitada": "Evidence requested",
    "Cerrado con evidencia": "Closed with evidence",
    "Acción correctiva pendiente de definición": "Corrective action pending definition",
    "Registro fotográfico y documentación de corrección": "Photo record and correction documentation",
    "Validación pendiente de evidencia y revisión": "Validation pending evidence and review",
    "Evidencia cargada": "Evidence uploaded",
    "En revisión": "In review",
    Rechazado: "Rejected",
    Prevencionista: "Safety officer",
    "Supervisor autorizado": "Authorized supervisor",
    Mandante: "Client owner",
    "Jefe de obra": "Site manager",
    "Otro usuario autorizado": "Other authorized user",
    Responsable: "Responsible",
    "Empresa responsable": "Responsible company",
    Contratista: "Contractor",
    "Estado seguimiento": "Follow-up status",
    "Evidencia de cierre": "Closure evidence",
    "Observación de seguimiento": "Follow-up note",
    "Sin asignar": "Unassigned",
    Asignado: "Assigned",
    "En seguimiento": "In follow-up",
    Vencido: "Overdue",
    Cerrado: "Closed",
    "Requiere corrección": "Requires correction",
    "Pendiente de asignación": "Pending assignment",
    "Sin contacto": "No contact",
    "Responsable pendiente de definición": "Closure responsible pending definition",
    "Responsable de cierre pendiente de definición": "Closure responsible pending definition",
    "Ver detalle": "View detail",
    "Buscar responsable": "Search responsible",
    Buscar: "Search",
    "Buscar por nombre de responsable": "Search by responsible person's name",
    "Sin coincidencias para los filtros de seguimiento seleccionados.": "No matches for the selected follow-up filters.",
    "Cerrados con evidencia": "Closed with evidence",
    "Sin responsable asignado": "Without assigned responsible",
    "Pendientes de cierre": "Pending closure",
    "El reportante no se asume automáticamente como responsable de cierre.": "The reporter is not automatically assumed to be responsible for closure.",
    "El reportante no se asume automáticamente como responsable de corrección. El seguimiento puede ser asignado a un supervisor o usuario autorizado.": "The reporter is not automatically assumed to be responsible for correction. Follow-up can be assigned to a supervisor or authorized user.",
    "Total reportes": "Total reports",
    Abiertos: "Open",
    Cerrados: "Closed",
    Críticos: "Critical",
    Vencidos: "Overdue",
    "Empresas activas": "Active companies",
    "Histórico total": "Historical total",
    "Reportes por empresa": "Reports by company",
    "Gráfico ejecutivo": "Executive chart",
    "Sin datos por empresa para el filtro activo.": "No company data for the active filter.",
    "Sin evolución diaria para el filtro activo.": "No daily trend for the active filter.",
    "Estado general": "General status",
    "Distribución de abiertos, cerrados y críticos": "Open, closed and critical distribution",
    "Sin datos para criticidad en el filtro activo.": "No severity data for the active filter.",
    Total: "Total",
    "Estado de reportes": "Report status",
    "Sin datos de gestión para el filtro activo.": "No management data for the active filter.",
    Código: "Code",
    Acción: "Action",
    "No hay hallazgos para el filtro seleccionado.": "No findings for the selected filter.",
    "Ver informe": "View report",
    "Informe Ejecutivo": "Executive Report",
    "Configuración del sistema": "System settings",
    "Administra identidad corporativa, apariencia y parámetros generales de la plataforma.": "Manage corporate identity, appearance and general platform parameters.",
    "Volver al panel": "Back to dashboard",
    "Guardar cambios": "Save changes",
    "Configuración guardada correctamente": "Settings saved successfully",
    "Identidad de empresa": "Company identity",
    "Logo empresa": "Company logo",
    "Nombre empresa": "Company name",
    "Nombre de la empresa": "Company name",
    "Branding PC": "PC branding",
    Activo: "Active",
    Inactivo: "Inactive",
    "Branding PDF": "PDF branding",
    Exportaciones: "Exports",
    Incluidas: "Included",
    PDF: "PDF",
    Excel: "Excel",
    CSV: "CSV",
    "Seleccionar logo": "Select logo",
    "Quitar logo": "Remove logo",
    "Seleccione o quite el logo corporativo": "Select or remove the corporate logo",
    "Configuración local guardada en este navegador": "Local settings saved in this browser",
    "Debe existir al menos un formato de exportación activo": "At least one export format must remain active",
    "Apariencia del sistema": "System appearance",
    "Define la presentación visual de la plataforma para operación diurna, nocturna o automática.": "Set the platform visual presentation for daytime, nighttime or automatic operation.",
    "Modo claro": "Light mode",
    "Modo oscuro": "Dark mode",
    Automático: "Automatic",
    "Idioma del sistema": "System language",
    "Define el idioma general de navegación, textos operativos e informes del sistema.": "Set the general language for navigation, operational text and system reports.",
    Español: "Spanish",
    "Informes PDF": "PDF reports",
    "Define cómo se presentan los documentos exportados y descargados desde la plataforma.": "Define how exported and downloaded documents are presented from the platform.",
    Activado: "Enabled",
    "Formato de salida": "Output format",
    "Carta vertical": "Letter portrait",
    "Logo de empresa": "Company logo",
    "Incluir en portada y encabezado": "Include on cover and header",
    "Incluir logo en PDF": "Include logo in PDF",
    "Incluir evidencia fotográfica": "Include photo evidence",
    "Incluir firma/responsable": "Include signature/responsible person",
    "Incluir fecha y hora": "Include date and time",
    "Formato de hoja": "Page size",
    Carta: "Letter",
    A4: "A4",
    Orientación: "Orientation",
    Vertical: "Portrait",
    Horizontal: "Landscape",
    "Pie institucional": "Institutional footer",
    "Emitido por Criterio Estratégico": "Issued by Criterio Estrategico",
    "Usuarios y permisos": "Users and permissions",
    "Define perfiles de acceso y alcance de visualización para administración, supervisión y clientes corporativos.": "Define access profiles and viewing scope for administration, supervision and corporate clients.",
    "Perfil administrador": "Administrator profile",
    "Acceso total al sistema": "Full system access",
    "Perfil supervisor": "Supervisor profile",
    "Reporte y seguimiento operativo": "Operational reporting and tracking",
    Administrador: "Administrator",
    Supervisor: "Supervisor",
    Gerencia: "Management",
    "Cliente / Mandante": "Client / Owner",
    "Configuración completa, branding, usuarios y reportes.": "Full settings, branding, users and reports.",
    "Seguimiento operativo, filtros e informes de avance.": "Operational tracking, filters and progress reports.",
    "Vista ejecutiva, KPIs, informes y exportaciones.": "Executive view, KPIs, reports and exports.",
    "Consulta controlada de hallazgos e informes compartidos.": "Controlled review of findings and shared reports.",
    "Cliente mandante": "Client owner",
    "Visualización ejecutiva y reportes": "Executive viewing and reports",
    "Alcance multiempresa": "Multi-company scope",
    "Por empresa, obra o corporativo": "By company, site or corporate",
    "No hay informe disponible para el filtro seleccionado.": "No report available for the selected filter.",
    "Estado plazo": "Deadline status",
    Reportante: "Reporter",
    Cargo: "Role",
    Teléfono: "Phone",
    Responsable: "Responsible",
    "Fecha compromiso": "Commitment date",
    "Fecha cierre": "Close date",
    "Evidencia cierre": "Close evidence",
    Tipo: "Type",
    "Fecha / Hora": "Date / Time",
    Descripción: "Description",
    "Evidencia fotográfica": "Photo evidence",
    "Sin evidencia fotográfica": "No photo evidence",
    "Medida inmediata": "Immediate action",
    "Descargar PDF": "Download PDF",
    "Sin datos": "No data",
    "Sin definir": "Undefined",
    Pendiente: "Pending",
    "Sin evidencia de cierre": "No close evidence",
    Todas: "All",
    Todos: "All",
    Otras: "Other",
    CERRADO: "CLOSED",
    "SIN FECHA": "NO DATE",
    VENCIDO: "OVERDUE",
    "POR VENCER": "DUE SOON",
    "EN PLAZO": "ON TIME",
  };
  const t = (texto: string) => (idiomaActivo === "en" ? textosEn[texto] || texto : texto);
  const textoOpcion = (texto: string) => {
    if (texto === "TODAS") return t("Todas");
    if (texto === "TODOS") return t("Todos");
    return texto;
  };
  const nombreEmpresaVisible = nombreEmpresaConfig.trim() || "Cliente corporativo";
  const hayFormatoExportacionActivo = Object.values(formatosExportacion).some(Boolean);
  const cargarLogoEmpresa = (archivo: File | undefined) => {
    if (!archivo) return;

    const lector = new FileReader();
    lector.onload = () => {
      if (typeof lector.result === "string") {
        setLogoEmpresaConfig(lector.result);
      }
    };
    lector.readAsDataURL(archivo);
  };

  const quitarLogoEmpresa = () => {
    setLogoEmpresaConfig("");
    setLogoInputKey((valor) => valor + 1);
  };

  const alternarFormatoExportacion = (formato: FormatoExportacion) => {
    setFormatosExportacion((actual) => {
      const activos = Object.values(actual).filter(Boolean).length;
      if (actual[formato] && activos <= 1) {
        return actual;
      }

      return {
        ...actual,
        [formato]: !actual[formato],
      };
    });
  };

  const alternarPerfilActivo = (perfil: PerfilPermiso) => {
    setPerfilesActivos((actual) => {
      const activos = Object.values(actual).filter(Boolean).length;
      if (actual[perfil] && activos <= 1) {
        return actual;
      }

      return {
        ...actual,
        [perfil]: !actual[perfil],
      };
    });
  };

  const guardarConfiguracionPanel = () => {
    const configuracion: PanelConfigPersistida = {
      nombreEmpresaConfig: nombreEmpresaVisible,
      logoEmpresaConfig,
      brandingPC,
      brandingPDF,
      formatosExportacion,
      opcionesPDF,
      perfilesActivos,
      modoSistema,
      idiomaSistema,
    };

    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        PANEL_CONFIG_STORAGE_KEY,
        JSON.stringify(configuracion)
      );
    }

    setNombreEmpresaConfig(nombreEmpresaVisible);
    setGuardadoConfig(true);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const configuracionGuardada = window.localStorage.getItem(PANEL_CONFIG_STORAGE_KEY);
    if (!configuracionGuardada) return;

    try {
      const configuracion = JSON.parse(configuracionGuardada) as Partial<PanelConfigPersistida>;

      if (typeof configuracion.nombreEmpresaConfig === "string") {
        setNombreEmpresaConfig(configuracion.nombreEmpresaConfig.trim() || "Cliente corporativo");
      }

      if (typeof configuracion.logoEmpresaConfig === "string") {
        setLogoEmpresaConfig(configuracion.logoEmpresaConfig);
      }

      if (typeof configuracion.brandingPC === "boolean") {
        setBrandingPC(configuracion.brandingPC);
      }

      if (typeof configuracion.brandingPDF === "boolean") {
        setBrandingPDF(configuracion.brandingPDF);
      }

      if (configuracion.formatosExportacion) {
        const formatosGuardados = {
          ...formatosExportacionPorDefecto,
          ...configuracion.formatosExportacion,
        };
        setFormatosExportacion(
          Object.values(formatosGuardados).some(Boolean)
            ? formatosGuardados
            : formatosExportacionPorDefecto
        );
      }

      if (configuracion.opcionesPDF) {
        setOpcionesPDF({
          ...opcionesPDFPorDefecto,
          ...configuracion.opcionesPDF,
        });
      }

      if (configuracion.perfilesActivos) {
        const perfilesGuardados = {
          ...perfilesActivosPorDefecto,
          ...configuracion.perfilesActivos,
        };
        setPerfilesActivos(
          Object.values(perfilesGuardados).some(Boolean)
            ? perfilesGuardados
            : perfilesActivosPorDefecto
        );
      }

      if (
        configuracion.modoSistema === "claro" ||
        configuracion.modoSistema === "oscuro" ||
        configuracion.modoSistema === "automatico"
      ) {
        setModoSistema(configuracion.modoSistema);
      }

      if (
        configuracion.idiomaSistema === "es" ||
        configuracion.idiomaSistema === "en" ||
        configuracion.idiomaSistema === "auto"
      ) {
        setIdiomaSistema(configuracion.idiomaSistema);
      }
    } catch {
      window.localStorage.removeItem(PANEL_CONFIG_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (!guardadoConfig) return;

    const timeout = window.setTimeout(() => {
      setGuardadoConfig(false);
    }, 3600);

    return () => window.clearTimeout(timeout);
  }, [guardadoConfig]);

  useEffect(() => {
    const actualizarFecha = () => {
      setFechaActualizacion(new Date());
    };

    actualizarFecha();
    const intervalo = window.setInterval(actualizarFecha, 60000);

    return () => window.clearInterval(intervalo);
  }, []);

  useEffect(() => {
    setFilasPanel(cargarHallazgosPanelConReportesV2(hallazgosMock));
  }, []);

  const formatearUltimaActualizacion = (fecha: Date | null) => {
    if (!fecha) return "";

    const dia = String(fecha.getDate()).padStart(2, "0");
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const anio = String(fecha.getFullYear());
    const hora = String(fecha.getHours()).padStart(2, "0");
    const minutos = String(fecha.getMinutes()).padStart(2, "0");

    if (idiomaActivo === "en") {
      return `${mes}/${dia}/${anio} · ${hora}:${minutos}`;
    }

    return `${dia}-${mes}-${anio} · ${hora}:${minutos}`;
  };
  const filas = filasPanel;
const totalHistoricoHallazgos = filas.length;
const totalVencidos = filas.filter(
  (fila) =>
    semaforoVencimiento(fila.fechaCompromiso, fila.estado).etiqueta === "VENCIDO"
).length;
const [contadorHistoricoAnimado, setContadorHistoricoAnimado] = useState(0);
const [notificaciones, setNotificaciones] = useState(notificacionesMock);
const totalNotificacionesNoLeidas = notificaciones.filter((item) => !item.leida).length;
const exportarExcel = () => {
  const encabezados = [
    "Código",
    "Empresa",
    "Tipo de hallazgo",
    "Criticidad",
    "Estado",
    "Fecha / Hora",
  ];

  const escapar = (valor: unknown) =>
    `"${String(valor ?? "").replace(/"/g, '""')}"`;

  const filas = filasFiltradas.map((fila) => [
    escapar(fila.codigo),
    escapar(fila.empresa),
    escapar(fila.tipoHallazgo),
    escapar(fila.criticidad),
    escapar(fila.estado),
    escapar(fila.fechaHora),
  ]);

  const csv = [
    encabezados.map(escapar).join(";"),
    ...filas.map((fila) => fila.join(";")),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const fecha = new Date().toISOString().slice(0, 10);

  link.href = url;
  link.download = `hallazgos-filtrados-${fecha}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
const generarInformeEmpresaObra = () => {
  if (filtroEmpresa === "TODAS" && filtroObra === "TODAS") {
    window.alert("Seleccione una empresa o una obra para generar el informe.");
    return;
  }

  const escapeHtml = (valor: unknown) =>
    String(valor ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const normalizarTexto = (valor: unknown) =>
    String(valor ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .trim();

  const formatearFechaFiltro = (valor: string) => {
    if (!valor) return "";
    const [anio, mes, dia] = valor.split("-");
    if (!anio || !mes || !dia) return valor;
    return `${dia}-${mes}-${anio}`;
  };

  const obtenerFechaBase = (item: (typeof filasFiltradas)[number]) => {
    const fechaISO = String(item.fechaISO ?? "").trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(fechaISO)) {
      return fechaISO.slice(0, 10);
    }

    const fechaHora = String(item.fechaHora ?? "").trim();
    const match = fechaHora.match(/^(\d{2})[-/](\d{2})[-/](\d{4})/);
    if (match) {
      const [, dia, mes, anio] = match;
      return `${anio}-${mes}-${dia}`;
    }

    return "";
  };

  const diasEntre = (fechaBase: string) => {
    const texto = String(fechaBase || "").slice(0, 10);
    if (!texto) return 0;

    const [anio, mes, dia] = texto.split("-").map(Number);
    if (!anio || !mes || !dia) return 0;

    const fecha = new Date(anio, mes - 1, dia);
    if (Number.isNaN(fecha.getTime())) return 0;

    const hoy = new Date();
    const hoySoloFecha = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

    const diferencia = hoySoloFecha.getTime() - fecha.getTime();
    return Math.max(0, Math.floor(diferencia / (1000 * 60 * 60 * 24)));
  };

  function chunkArray<T>(array: T[], size: number) {
    const resultado: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      resultado.push(array.slice(i, i + size));
    }
    return resultado;
  }

  const esCriticidad = (valor: unknown, clave: string) =>
    normalizarTexto(valor).includes(clave);

  const total = filasFiltradas.length;
  const abiertos = filasFiltradas.filter((item) => item.estado === "ABIERTO").length;
  const cerrados = filasFiltradas.filter((item) => item.estado === "CERRADO").length;
  const enSeguimiento = filasFiltradas.filter((item) => item.estado === "EN SEGUIMIENTO").length;

  const criticos = filasFiltradas.filter((item) => esCriticidad(item.criticidad, "CRIT")).length;
  const altos = filasFiltradas.filter((item) => esCriticidad(item.criticidad, "ALTO")).length;
  const medios = filasFiltradas.filter((item) => esCriticidad(item.criticidad, "MED")).length;
  const bajos = filasFiltradas.filter((item) => esCriticidad(item.criticidad, "BAJ")).length;

  const hallazgosPendientes = filasFiltradas.filter((item) => item.estado !== "CERRADO");

  const antiguedadMaxima = hallazgosPendientes.length
    ? Math.max(...hallazgosPendientes.map((item) => diasEntre(obtenerFechaBase(item))))
    : 0;

  const tipoDominante =
    Object.entries(
      filasFiltradas.reduce<Record<string, number>>((acc, item) => {
        const tipo = String(item.tipoHallazgo || "Sin clasificar");
        acc[tipo] = (acc[tipo] || 0) + 1;
        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1])[0]?.[0] || "Sin clasificar";

  const pesoCriticidad = (valor: unknown) => {
    const texto = normalizarTexto(valor);
    if (texto.includes("CRIT")) return 4;
    if (texto.includes("ALTO")) return 3;
    if (texto.includes("MED")) return 2;
    if (texto.includes("BAJ")) return 1;
    return 0;
  };

  const textoCriticidad = (peso: number) => {
    if (peso >= 4) return "CRÍTICO";
    if (peso === 3) return "ALTO";
    if (peso === 2) return "MEDIO";
    if (peso === 1) return "BAJO";
    return "SIN CLASIFICAR";
  };

  type SupervisorResumen = {
    nombre: string;
    total: number;
    abiertos: number;
    seguimiento: number;
    criticidadMax: number;
    codigos: string[];
    antiguedadMaxima: number;
    sumaAntiguedad: number;
    criticidadMaxTexto: string;
    codigosTexto: string;
    antiguedadPromedio: number;
  };

  const supervisoresPendientes: SupervisorResumen[] = Object.values(
    hallazgosPendientes.reduce<
      Record<
        string,
        {
          nombre: string;
          total: number;
          abiertos: number;
          seguimiento: number;
          criticidadMax: number;
          codigos: string[];
          antiguedadMaxima: number;
          sumaAntiguedad: number;
        }
      >
    >((acc, item) => {
      const nombre = String(item.reportante || "Sin supervisor").trim() || "Sin supervisor";
      const clave = normalizarTexto(nombre);
      const diasPendiente = diasEntre(obtenerFechaBase(item));

      if (!acc[clave]) {
        acc[clave] = {
          nombre,
          total: 0,
          abiertos: 0,
          seguimiento: 0,
          criticidadMax: 0,
          codigos: [],
          antiguedadMaxima: 0,
          sumaAntiguedad: 0,
        };
      }

      acc[clave].total += 1;

      if (item.estado === "ABIERTO") acc[clave].abiertos += 1;
      if (item.estado === "EN SEGUIMIENTO") acc[clave].seguimiento += 1;

      acc[clave].criticidadMax = Math.max(
        acc[clave].criticidadMax,
        pesoCriticidad(item.criticidad)
      );

      acc[clave].antiguedadMaxima = Math.max(acc[clave].antiguedadMaxima, diasPendiente);
      acc[clave].sumaAntiguedad += diasPendiente;

      acc[clave].codigos.push(String(item.codigo || ""));

      return acc;
    }, {})
  )
    .map((supervisor) => ({
      ...supervisor,
      criticidadMaxTexto: textoCriticidad(supervisor.criticidadMax),
      codigosTexto: supervisor.codigos.join(", "),
      antiguedadPromedio:
        supervisor.total > 0
          ? Math.round(supervisor.sumaAntiguedad / supervisor.total)
          : 0,
    }))
    .sort((a, b) => {
      if (b.criticidadMax !== a.criticidadMax) return b.criticidadMax - a.criticidadMax;
      if (b.total !== a.total) return b.total - a.total;
      return b.antiguedadMaxima - a.antiguedadMaxima;
    });

  const pendientesCriticos = hallazgosPendientes.filter((item) =>
    esCriticidad(item.criticidad, "CRIT")
  ).length;
  const pendientesAltos = hallazgosPendientes.filter((item) =>
    esCriticidad(item.criticidad, "ALTO")
  ).length;
  const pendientesMedios = hallazgosPendientes.filter((item) =>
    esCriticidad(item.criticidad, "MED")
  ).length;
  const pendientesBajos = hallazgosPendientes.filter((item) =>
    esCriticidad(item.criticidad, "BAJ")
  ).length;

  const penalizacionAntiguedad =
    antiguedadMaxima > 14 ? 15 :
    antiguedadMaxima > 7 ? 8 :
    0;

  const puntajeEmpresa = Math.max(
    0,
    100 -
      pendientesCriticos * 40 -
      pendientesAltos * 25 -
      pendientesMedios * 12 -
      pendientesBajos * 5 -
      enSeguimiento * 4 -
      penalizacionAntiguedad
  );

  const rankingEmpresa = (() => {
    if (puntajeEmpresa >= 90) {
      return {
        nombre: "PLATINO",
        semaforo: "VERDE",
        color: "#22c55e",
        descripcion: "Control preventivo sólido dentro del período analizado.",
      };
    }
    if (puntajeEmpresa >= 75) {
      return {
        nombre: "ORO",
        semaforo: "VERDE",
        color: "#84cc16",
        descripcion: "Buen nivel de control, con brechas menores bajo seguimiento.",
      };
    }
    if (puntajeEmpresa >= 60) {
      return {
        nombre: "PLATA",
        semaforo: "AMARILLO",
        color: "#f59e0b",
        descripcion: "Gestión aceptable, pero con desviaciones que requieren corrección.",
      };
    }
    if (puntajeEmpresa >= 40) {
      return {
        nombre: "BRONCE",
        semaforo: "NARANJO",
        color: "#f97316",
        descripcion: "Condición de riesgo operativo con control insuficiente.",
      };
    }
    return {
      nombre: "ROJO",
      semaforo: "ROJO",
      color: "#ef4444",
      descripcion: "Exposición relevante y necesidad de intervención prioritaria.",
    };
  })();

  const diagnosticoEjecutivo = (() => {
    if (total === 0) {
      return "En el período evaluado no se registran hallazgos para los filtros seleccionados, lo que refleja una condición de control favorable dentro del alcance analizado.";
    }

    if (criticos > 0) {
      return `En el período evaluado se identifican ${criticos} hallazgo(s) de criticidad crítica, con ${abiertos} abierto(s) y una antigüedad máxima de ${antiguedadMaxima} día(s), condición que exige intervención inmediata, trazabilidad de cierre y control formal de la administración responsable.`;
    }

    if (altos > 0 && hallazgosPendientes.length > 0) {
      return `En el período evaluado la empresa mantiene ${hallazgosPendientes.length} hallazgo(s) pendiente(s), con predominio de criticidad alta y una antigüedad máxima de ${antiguedadMaxima} día(s), lo que evidencia una brecha de gestión correctiva que debe regularizarse para evitar reincidencia y observaciones en auditoría.`;
    }

    if (enSeguimiento > 0) {
      return `El informe muestra ${enSeguimiento} hallazgo(s) en seguimiento, asociados principalmente a ${tipoDominante.toLowerCase()}, lo que indica acciones en curso pero aún sin cierre definitivo, por lo que se recomienda consolidar evidencia y verificar efectividad de control.`;
    }

    if (cerrados === total) {
      return "Los hallazgos del período evaluado se encuentran cerrados, lo que refleja una respuesta correctiva ejecutada dentro del alcance analizado y una condición de control más estable para la empresa revisada.";
    }

    return `En el período evaluado se registran ${total} hallazgo(s), con predominio de ${tipoDominante.toLowerCase()}, por lo que se recomienda mantener seguimiento operativo y reforzar control preventivo sobre las desviaciones detectadas.`;
  })();

  const cantidadPrioritaria =
    pendientesCriticos > 0 ? pendientesCriticos :
    pendientesAltos > 0 ? pendientesAltos :
    pendientesMedios > 0 ? pendientesMedios :
    pendientesBajos > 0 ? pendientesBajos :
    hallazgosPendientes.length;

  const criticidadPrioritaria =
    pendientesCriticos > 0 ? "crítica" :
    pendientesAltos > 0 ? "alta" :
    pendientesMedios > 0 ? "media" :
    pendientesBajos > 0 ? "baja" :
    "sin clasificar";

  const condicionPrioritaria =
    abiertos > 0 ? "abierta" :
    enSeguimiento > 0 ? "en seguimiento" :
    "pendiente";

  const plazoHoras =
    pendientesCriticos > 0 ? 24 :
    pendientesAltos > 0 ? 72 :
    pendientesMedios > 0 ? 120 :
    168;

  const recomendacionPrioritaria =
    total === 0
      ? "Sin hallazgos pendientes para el período seleccionado. Se recomienda mantener el estándar de control y trazabilidad documental vigente."
      : `Prioridad inmediata: regularizar ${cantidadPrioritaria} hallazgo(s) de criticidad ${criticidadPrioritaria} con condición predominante ${condicionPrioritaria}, priorizando evidencia de cierre dentro de ${plazoHoras} horas y verificación formal de la acción correctiva.`;

  const fechaEmision = new Date().toLocaleString("es-CL");

  const baseFolio =
    filtroEmpresa !== "TODAS"
      ? String(filtroEmpresa)
      : filtroObra !== "TODAS"
        ? String(filtroObra)
        : "EMP";

  const siglaEmpresaInforme =
    baseFolio
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((palabra) => palabra[0])
      .join("")
      .toUpperCase() || "EMP";

  const ahoraInforme = new Date();
  const dd = String(ahoraInforme.getDate()).padStart(2, "0");
  const mm = String(ahoraInforme.getMonth() + 1).padStart(2, "0");
  const yyyy = String(ahoraInforme.getFullYear());
  const hh = String(ahoraInforme.getHours()).padStart(2, "0");
  const min = String(ahoraInforme.getMinutes()).padStart(2, "0");
  const ss = String(ahoraInforme.getSeconds()).padStart(2, "0");

  const folioInforme = `${siglaEmpresaInforme}-IEO-${dd}${mm}${yyyy}-${hh}${min}${ss}`;

  const fechasISOOrdenadas = filasFiltradas
    .map((item) => obtenerFechaBase(item))
    .filter(Boolean)
    .sort();

  const fechaInicioInforme = filtroFechaDesde
    ? formatearFechaFiltro(filtroFechaDesde)
    : fechasISOOrdenadas.length
      ? formatearFechaFiltro(fechasISOOrdenadas[0])
      : "Sin inicio";

  const fechaFinInforme = filtroFechaHasta
    ? formatearFechaFiltro(filtroFechaHasta)
    : fechasISOOrdenadas.length
      ? formatearFechaFiltro(fechasISOOrdenadas[fechasISOOrdenadas.length - 1])
      : "Sin cierre";

  const maxEstado = Math.max(abiertos, enSeguimiento, cerrados, 1);
  const maxCriticidad = Math.max(criticos, altos, medios, bajos, 1);
  const maxCriticidadTexto =
    criticos > 0 ? "CRÍTICO" :
    altos > 0 ? "ALTO" :
    medios > 0 ? "MEDIO" :
    bajos > 0 ? "BAJO" :
    "SIN CLASIFICAR";

  const supervisorChunks = chunkArray(supervisoresPendientes, 8);
  const hallazgoChunks = chunkArray(filasFiltradas, 12);

  const pagina1Html = `
    <section class="sheet">
      <div class="header">
        <div>
          <h1>Informe Ejecutivo Empresa / Obra</h1>
          <div class="sub">Criterio Estratégico · Emisión: ${escapeHtml(fechaEmision)}</div>
        </div>
        <div class="folio-box">Folio: ${escapeHtml(folioInforme)}</div>
      </div>

      <div class="meta-grid">
        <div class="meta-item">
          <div class="label">Empresa seleccionada</div>
          <div class="value">${escapeHtml(filtroEmpresa)}</div>
        </div>
        <div class="meta-item">
          <div class="label">Obra / Proyecto seleccionado</div>
          <div class="value">${escapeHtml(filtroObra)}</div>
        </div>
        <div class="meta-item">
          <div class="label">Estado</div>
          <div class="value">${escapeHtml(filtroEstado)}</div>
        </div>
        <div class="meta-item">
          <div class="label">Criticidad</div>
          <div class="value">${escapeHtml(filtroCriticidad)}</div>
        </div>
        <div class="meta-item">
          <div class="label">Tipo de hallazgo</div>
          <div class="value">${escapeHtml(filtroTipoHallazgo)}</div>
        </div>
        <div class="meta-item">
          <div class="label">Fecha inicio</div>
          <div class="value">${escapeHtml(fechaInicioInforme)}</div>
        </div>
        <div class="meta-item">
          <div class="label">Fecha término</div>
          <div class="value">${escapeHtml(fechaFinInforme)}</div>
        </div>
        <div class="meta-item">
          <div class="label">Máx. criticidad del período</div>
          <div class="value">${escapeHtml(maxCriticidadTexto)}</div>
        </div>
      </div>

      <div class="grid-2">
        <div class="card avoid-break">
          <div class="section-title">Ranking de control preventivo</div>
          <div class="ranking-card">
            <div class="ranking-badge" style="background:${rankingEmpresa.color};">
              <div class="ranking-badge-label">Ranking del período</div>
              <div class="ranking-badge-name">${escapeHtml(rankingEmpresa.nombre)}</div>
              <div class="ranking-badge-score">Puntaje: ${escapeHtml(puntajeEmpresa)}/100</div>
            </div>
            <div class="ranking-info">
              <div class="ranking-chip">
                <span class="ranking-dot" style="background:${rankingEmpresa.color};"></span>
                Semáforo: ${escapeHtml(rankingEmpresa.semaforo)}
              </div>
              <div class="ranking-text">${escapeHtml(rankingEmpresa.descripcion)}</div>
              <div class="ranking-text">
                Este resultado considera la criticidad, la condición de cierre y la antigüedad de los hallazgos pendientes dentro del alcance evaluado.
              </div>
            </div>
          </div>
        </div>

        <div class="card avoid-break">
          <div class="section-title">Indicadores ejecutivos</div>
          <div class="kpi-grid">
            <div class="kpi">
              <div class="kpi-title">Total hallazgos</div>
              <div class="kpi-value">${escapeHtml(total)}</div>
            </div>
            <div class="kpi">
              <div class="kpi-title">Abiertos</div>
              <div class="kpi-value">${escapeHtml(abiertos)}</div>
            </div>
            <div class="kpi">
              <div class="kpi-title">Cerrados</div>
              <div class="kpi-value">${escapeHtml(cerrados)}</div>
            </div>
            <div class="kpi">
              <div class="kpi-title">Críticos</div>
              <div class="kpi-value">${escapeHtml(criticos)}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid-2">
        <div class="card avoid-break">
          <div class="section-title">Estado de reportes</div>
          <div class="bar-list">
            <div class="bar-row">
              <div class="bar-label">Abiertos</div>
              <div class="bar-track">
                <div class="bar-fill" style="width:${(abiertos / maxEstado) * 100}%; background:#f59e0b;"></div>
              </div>
              <div class="bar-value">${escapeHtml(abiertos)}</div>
            </div>
            <div class="bar-row">
              <div class="bar-label">En seguimiento</div>
              <div class="bar-track">
                <div class="bar-fill" style="width:${(enSeguimiento / maxEstado) * 100}%; background:#3b82f6;"></div>
              </div>
              <div class="bar-value">${escapeHtml(enSeguimiento)}</div>
            </div>
            <div class="bar-row">
              <div class="bar-label">Cerrados</div>
              <div class="bar-track">
                <div class="bar-fill" style="width:${(cerrados / maxEstado) * 100}%; background:#22c55e;"></div>
              </div>
              <div class="bar-value">${escapeHtml(cerrados)}</div>
            </div>
          </div>
        </div>

        <div class="card avoid-break">
          <div class="section-title">Distribución por criticidad</div>
          <div class="bar-list">
            <div class="bar-row">
              <div class="bar-label">Críticos</div>
              <div class="bar-track">
                <div class="bar-fill" style="width:${(criticos / maxCriticidad) * 100}%; background:#ef4444;"></div>
              </div>
              <div class="bar-value">${escapeHtml(criticos)}</div>
            </div>
            <div class="bar-row">
              <div class="bar-label">Altos</div>
              <div class="bar-track">
                <div class="bar-fill" style="width:${(altos / maxCriticidad) * 100}%; background:#f59e0b;"></div>
              </div>
              <div class="bar-value">${escapeHtml(altos)}</div>
            </div>
            <div class="bar-row">
              <div class="bar-label">Medios</div>
              <div class="bar-track">
                <div class="bar-fill" style="width:${(medios / maxCriticidad) * 100}%; background:#3b82f6;"></div>
              </div>
              <div class="bar-value">${escapeHtml(medios)}</div>
            </div>
            <div class="bar-row">
              <div class="bar-label">Bajos</div>
              <div class="bar-track">
                <div class="bar-fill" style="width:${(bajos / maxCriticidad) * 100}%; background:#22c55e;"></div>
              </div>
              <div class="bar-value">${escapeHtml(bajos)}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid-2">
        <div class="card avoid-break">
          <div class="section-title">Diagnóstico ejecutivo automático</div>
          <div class="text-block">${escapeHtml(diagnosticoEjecutivo)}</div>
        </div>

        <div class="card avoid-break">
          <div class="section-title">Resumen de gestión responsable</div>
          <div class="summary-grid">
            <div class="summary-stat">
  <div class="summary-label">Supervisores con pendientes</div>
  <div class="summary-value">${escapeHtml(supervisoresPendientes.length)}</div>
</div>

<div class="summary-stat">
  <div class="summary-label">Hallazgos pendientes</div>
  <div class="summary-value">${escapeHtml(hallazgosPendientes.length)}</div>
</div>

<div class="summary-stat">
  <div class="summary-label">Antigüedad máxima</div>
  <div class="summary-value">${escapeHtml(antiguedadMaxima)} d</div>
</div>

<div class="summary-stat">
  <div class="summary-label">Tipo dominante</div>
  <div class="summary-value" style="font-size:14px; line-height:1.2;">
    ${escapeHtml(tipoDominante)}
  </div>
</div>
          </div>
        </div>
      </div>

      <div class="card accent-card avoid-break">
        <div class="section-title">Recomendación prioritaria</div>
        <div class="text-block strong">${escapeHtml(recomendacionPrioritaria)}</div>
      </div>

      <div class="card soft-card avoid-break">
        <div class="section-title">Recordatorio de gestión</div>
        <div class="text-block">
          El presente informe ejecutivo es remitido para conocimiento y acción de la administración responsable, con el objeto de revisar, gestionar y cerrar los hallazgos pendientes detectados en la empresa evaluada. La permanencia de estas desviaciones sin regularización oportuna afecta la trazabilidad de la gestión preventiva del proyecto y puede incrementar la exposición a incidentes con consecuencias sobre la seguridad de las personas, la continuidad operacional, los activos y el entorno ambiental. Se solicita priorizar las acciones correctivas correspondientes y mantener evidencia verificable de su cierre.
        </div>
      </div>
    </section>
  `;

  const supervisorPagesHtml = (supervisorChunks.length ? supervisorChunks : [[]]).map((chunk, index, arr) => {
    const filasSupervisor =
      chunk.length === 0
        ? `<tr><td colspan="8">No hay supervisores con hallazgos pendientes en el período seleccionado.</td></tr>`
        : chunk
            .map(
              (supervisor) => `
                <tr>
                  <td>${escapeHtml(supervisor.nombre)}</td>
                  <td>${escapeHtml(supervisor.total)}</td>
                  <td>${escapeHtml(supervisor.abiertos)}</td>
                  <td>${escapeHtml(supervisor.seguimiento)}</td>
                  <td>${escapeHtml(supervisor.criticidadMaxTexto)}</td>
                  <td>${escapeHtml(supervisor.antiguedadMaxima)} d</td>
                  <td>${escapeHtml(supervisor.antiguedadPromedio)} d</td>
                  <td>${escapeHtml(supervisor.codigosTexto)}</td>
                </tr>
              `
            )
            .join("");

    return `
      <section class="sheet">
        <div class="page-head">
          <div>
            <h2 class="page-title">Análisis de supervisores con hallazgos pendientes</h2>
            <div class="page-subtitle">
              Resumen de responsables con hallazgos abiertos o en seguimiento dentro del período analizado.
            </div>
          </div>
          <div class="page-counter">Página ${index + 1} de ${arr.length}</div>
        </div>

        <div class="card">
          <table class="table-report">
            <thead>
              <tr>
                <th>Supervisor</th>
                <th>Pendientes</th>
                <th>Abiertos</th>
                <th>En seguimiento</th>
                <th>Máx. criticidad</th>
                <th>Más antiguo</th>
                <th>Promedio</th>
                <th>Códigos asociados</th>
              </tr>
            </thead>
            <tbody>
              ${filasSupervisor}
            </tbody>
          </table>
          <div class="table-note">
            ${escapeHtml(
              supervisoresPendientes.length === 0
                ? "Sin supervisores con hallazgos pendientes dentro del período seleccionado."
                : `Se presentan ${chunk.length} supervisor(es) en esta hoja, ordenados por criticidad, cantidad de pendientes y antigüedad.`
            )}
          </div>
        </div>
      </section>
    `;
  }).join("");

  const detallePagesHtml = (hallazgoChunks.length ? hallazgoChunks : [[]]).map((chunk, index, arr) => {
    const filasDetalle =
      chunk.length === 0
        ? `<tr><td colspan="6">Sin hallazgos para los filtros seleccionados.</td></tr>`
        : chunk
            .map(
              (fila) => `
                <tr>
                  <td>${escapeHtml(fila.codigo)}</td>
                  <td>${escapeHtml(fila.empresa)}</td>
                  <td>${escapeHtml(fila.tipoHallazgo)}</td>
                  <td>${escapeHtml(fila.criticidad)}</td>
                  <td>${escapeHtml(fila.estado)}</td>
                  <td>${escapeHtml(fila.fechaHora)}</td>
                </tr>
              `
            )
            .join("");

    return `
      <section class="sheet">
        <div class="page-head">
          <div>
            <h2 class="page-title">Detalle completo de hallazgos filtrados</h2>
            <div class="page-subtitle">
              Registro detallado de hallazgos contenidos dentro del alcance y filtros aplicados.
            </div>
          </div>
          <div class="page-counter">Página ${index + 1} de ${arr.length}</div>
        </div>

        <div class="card">
          <table class="table-report">
            <thead>
              <tr>
                <th>Código</th>
                <th>Empresa</th>
                <th>Tipo de hallazgo</th>
                <th>Criticidad</th>
                <th>Estado</th>
                <th>Fecha / Hora</th>
              </tr>
            </thead>
            <tbody>
              ${filasDetalle}
            </tbody>
          </table>
          <div class="table-note">
            Informe generado automáticamente desde la plataforma ejecutiva para revisión y envío gerencial.
          </div>
        </div>
      </section>
    `;
  }).join("");

  const html = `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Informe empresa/obra</title>
        <style>
          @page {
            size: Letter;
            margin: 12mm;
          }

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 24px 0 48px;
            font-family: Arial, sans-serif;
            color: #111827;
            background: #e5e7eb;
          }

          .sheet {
            width: min(216mm, calc(100vw - 48px));
            min-height: 279mm;
            margin: 0 auto 40px;
            padding: 16mm;
            background: #ffffff;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(15, 23, 42, 0.08);
          }

          .header,
          .page-head {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 16px;
            margin-bottom: 18px;
          }

          h1 {
            margin: 0 0 6px;
            font-size: 28px;
            line-height: 1.1;
          }

          .page-title {
            margin: 0 0 6px;
            font-size: 24px;
            line-height: 1.15;
          }

          .sub,
          .page-subtitle {
            font-size: 13px;
            color: #4b5563;
          }

          .folio-box,
          .page-counter {
            white-space: nowrap;
            border-radius: 999px;
            padding: 8px 14px;
            font-size: 12px;
            font-weight: 800;
          }

          .folio-box {
            background: #163a70;
            color: #ffffff;
          }

          .page-counter {
            background: #f3f4f6;
            color: #374151;
            border: 1px solid #d1d5db;
          }

          .meta-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 12px;
            margin-bottom: 16px;
          }

          .meta-item,
          .card,
          .kpi,
          .summary-stat {
            border: 1px solid #d1d5db;
            border-radius: 12px;
            background: #ffffff;
          }

          .meta-item {
            padding: 10px 12px;
          }

          .label,
          .section-title,
          .summary-label,
          .kpi-title {
            font-size: 12px;
            color: #6b7280;
          }

          .value {
            margin-top: 4px;
            font-size: 14px;
            font-weight: 700;
          }

          .grid-2 {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 14px;
            margin-top: 14px;
          }

          .card {
            padding: 14px;
          }

          .section-title {
            margin-bottom: 10px;
            font-weight: 800;
          }

         .ranking-card {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 12px;
  align-items: start;
}

.ranking-badge {
  min-height: 92px;
  border-radius: 12px;
  padding: 12px 10px;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.ranking-badge-label {
  font-size: 10px;
  font-weight: 700;
  opacity: 0.92;
  margin-bottom: 4px;
}

.ranking-badge-name {
  font-size: 20px;
  font-weight: 900;
  line-height: 1;
  margin-bottom: 6px;
}

.ranking-badge-score {
  font-size: 12px;
  font-weight: 800;
}

          .ranking-info {
            display: grid;
            gap: 10px;
          }

          .ranking-chip {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            width: fit-content;
            border: 1px solid #d1d5db;
            border-radius: 999px;
            padding: 6px 10px;
            background: #f9fafb;
            font-size: 12px;
            font-weight: 800;
            color: #374151;
          }

          .ranking-dot {
            width: 10px;
            height: 10px;
            border-radius: 999px;
            display: inline-block;
          }

          .ranking-text,
          .text-block {
            font-size: 13px;
            color: #374151;
            line-height: 1.65;
          }

          .strong {
            font-weight: 800;
          }

         .kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.kpi,
.summary-stat {
  padding: 12px;
}

.kpi-value {
  margin-top: 6px;
  font-size: 24px;
  font-weight: 900;
  line-height: 1;
}

.summary-value {
  margin-top: 6px;
  font-size: 16px;
  font-weight: 800;
  line-height: 1.15;
  word-break: break-word;
}

          .bar-list {
            display: grid;
            gap: 12px;
          }

          .bar-row {
            display: grid;
            grid-template-columns: 140px 1fr 48px;
            gap: 10px;
            align-items: center;
          }

          .bar-label {
            font-size: 13px;
            font-weight: 700;
            color: #374151;
          }

          .bar-track {
            height: 12px;
            border-radius: 999px;
            background: #e5e7eb;
            overflow: hidden;
          }

          .bar-fill {
            height: 100%;
            border-radius: 999px;
          }

          .bar-value {
            font-size: 13px;
            font-weight: 800;
            text-align: right;
          }

          .accent-card {
  border-left: 5px solid #163a70;
  margin-top: 10px;
}

.soft-card {
  background: #f3f4f6;
  border-color: #d7dce2;
  margin-top: 10px;
}

          .table-report {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }

          .table-report th,
          .table-report td {
            border: 1px solid #d1d5db;
            padding: 8px 10px;
            text-align: left;
            vertical-align: top;
          }

          .table-report th {
            background: #f3f4f6;
            font-weight: 800;
          }

          .table-note {
            margin-top: 10px;
            font-size: 12px;
            color: #6b7280;
          }

          .avoid-break {
            page-break-inside: avoid;
            break-inside: avoid;
          }

          @media print {
            body {
              margin: 0;
              padding: 0;
              background: #ffffff;
            }

            .sheet {
              width: auto;
              min-height: auto;
              margin: 0;
              padding: 0;
              background: #ffffff;
              border: none;
              border-radius: 0;
              box-shadow: none;
              page-break-after: always;
              break-after: page;
            }

            .sheet:last-child {
              page-break-after: auto;
              break-after: auto;
            }
          }
        </style>
      </head>
      <body>
        ${pagina1Html}
        ${supervisorPagesHtml}
        ${detallePagesHtml}
      </body>
    </html>
  `;

  const ventana = window.open("", "_blank", "width=1200,height=1200");
  if (!ventana) return;

  ventana.document.open();
  ventana.document.write(html);
  ventana.document.close();
  ventana.focus();

  setTimeout(() => {
    ventana.print();
  }, 350);
};
useEffect(() => {
  let frame = 0;
  const duracion = 1200;
  const pasos = 36;
  const incremento = totalHistoricoHallazgos / pasos;

  setContadorHistoricoAnimado(0);

  const intervalo = window.setInterval(() => {
    frame += 1;
    const valor = Math.round(incremento * frame);

    if (frame >= pasos) {
      setContadorHistoricoAnimado(totalHistoricoHallazgos);
      window.clearInterval(intervalo);
      return;
    }

    setContadorHistoricoAnimado(
      valor > totalHistoricoHallazgos ? totalHistoricoHallazgos : valor
    );
  }, duracion / pasos);

  return () => window.clearInterval(intervalo);
}, [totalHistoricoHallazgos]);
const [hallazgoActivo, setHallazgoActivo] = useState(filas[0]);
const [filtroRapido, setFiltroRapido] = useState<"HOY" | "SEMANA" | "MES" | "PERSONALIZADO">("HOY");
const [filtroEmpresa, setFiltroEmpresa] = useState("TODAS");
const [filtroObra, setFiltroObra] = useState("TODAS");
const [filtroEstado, setFiltroEstado] = useState("TODOS");
const [filtroCriticidad, setFiltroCriticidad] = useState("TODAS");
const [filtroFechaDesde, setFiltroFechaDesde] = useState("");
const [filtroFechaHasta, setFiltroFechaHasta] = useState("");
const [filtroTipoHallazgo, setFiltroTipoHallazgo] = useState("TODOS");
const [filtroSeguimientoEstado, setFiltroSeguimientoEstado] = useState("TODOS");
const [filtroSeguimientoEmpresa, setFiltroSeguimientoEmpresa] = useState("TODAS");
const [filtroSeguimientoCriticidad, setFiltroSeguimientoCriticidad] = useState("TODAS");
const [filtroSeguimientoFecha, setFiltroSeguimientoFecha] = useState("");
const [busquedaResponsableSeguimiento, setBusquedaResponsableSeguimiento] = useState("");
const [busquedaResponsableSeguimientoDraft, setBusquedaResponsableSeguimientoDraft] = useState("");
const [codigoSeguimientoActivo, setCodigoSeguimientoActivo] = useState("");
const [mostrarGestionCierre, setMostrarGestionCierre] = useState(false);
const [gestionCierreLocal, setGestionCierreLocal] = useState<Record<string, GestionCierreLocal>>({});
const [gestionCierreDraft, setGestionCierreDraft] = useState<GestionCierreDraft>({
  responsableCorreccionTipo: "Empresa contratista",
  responsableCorreccionEmpresa: "",
  responsableCorreccionNombre: "",
  responsableCorreccionCargo: "",
  responsableCorreccionTelefono: "",
  encargadoSeguimientoNombre: "Usuario autorizado",
  accionCorrectivaRequerida: "",
  evidenciaRequerida: [],
  responsableCierreFechaCompromiso: "",
  validadorCierreNombre: "",
  estadoSeguimiento: "Sin asignar",
  validadorCierreEstado: "Pendiente de revisión",
  validadorCierreObservacion: "",
});
const [errorGestionCierre, setErrorGestionCierre] = useState("");
const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
const [usuario, setUsuario] = useState({
  ...usuarioMock,
  nombre: usuarioMock.nombre || "Freddy Camus",
  cargo: usuarioMock.cargo || "Ingeniero en Prevención de Riesgos",
  foto: usuarioMock.foto || "",
});
const [mostrarEditorPerfil, setMostrarEditorPerfil] = useState(false);
const [nombrePerfil, setNombrePerfil] = useState(usuarioMock.nombre || "Freddy Camus");
const [cargoPerfil, setCargoPerfil] = useState(usuarioMock.cargo || "Ingeniero en Prevención de Riesgos");
const [fotoPerfil, setFotoPerfil] = useState(usuarioMock.foto || "");
const [nombrePerfilDraft, setNombrePerfilDraft] = useState(usuarioMock.nombre || "Freddy Camus");
const [cargoPerfilDraft, setCargoPerfilDraft] = useState(usuarioMock.cargo || "Ingeniero en Prevención de Riesgos");
const [fotoPerfilDraft, setFotoPerfilDraft] = useState<string | null>(usuarioMock.foto || null);
const [fotoPerfilInputKey, setFotoPerfilInputKey] = useState(0);
const [guardadoPerfil, setGuardadoPerfil] = useState(false);
const [fotoPerfilCargada, setFotoPerfilCargada] = useState(false);
const [errorPerfil, setErrorPerfil] = useState("");
const [campoPerfilActivo, setCampoPerfilActivo] = useState<"nombre" | "cargo" | null>(null);
const [controlPerfilActivo, setControlPerfilActivo] = useState<string | null>(null);
const inicialUsuario = (usuario.nombre.trim() || "Freddy Camus").charAt(0).toUpperCase();
const inicialPerfil = (nombrePerfilDraft.trim() || "Freddy Camus").charAt(0).toUpperCase();
const abrirEditorPerfil = () => {
  setNombrePerfilDraft(nombrePerfil || "Freddy Camus");
  setCargoPerfilDraft(cargoPerfil || "Ingeniero en Prevención de Riesgos");
  setFotoPerfilDraft(fotoPerfil || null);
  setGuardadoPerfil(false);
  setErrorPerfil("");
  setFotoPerfilCargada(false);
  setMostrarEditorPerfil(true);
};
const salirEditorPerfil = () => {
  setMostrarEditorPerfil(false);
  setGuardadoPerfil(false);
  setErrorPerfil("");
  setFotoPerfilCargada(false);
  setCampoPerfilActivo(null);
  setControlPerfilActivo(null);
};
const cargarFotoPerfil = (archivo: File | undefined) => {
  if (!archivo) return;

  const lector = new FileReader();
  lector.onload = () => {
    if (typeof lector.result === "string") {
      setFotoPerfilDraft(lector.result);
      setFotoPerfilCargada(true);
      setErrorPerfil("");
    }
  };
  lector.readAsDataURL(archivo);
};
const quitarFotoPerfil = () => {
  setFotoPerfilDraft(null);
  setErrorPerfil("");
  setFotoPerfilCargada(false);
  setFotoPerfilInputKey((valor) => valor + 1);
};
const guardarPerfil = () => {
  const nombreFinal = nombrePerfilDraft.trim() || "Freddy Camus";
  const cargoFinal = cargoPerfilDraft.trim() || "Ingeniero en Prevención de Riesgos";
  const fotoFinal = fotoPerfilDraft || null;
  const limiteFotoPerfil = 1.5 * 1024 * 1024;

  if (fotoFinal && fotoFinal.length > limiteFotoPerfil) {
    setErrorPerfil("La foto es demasiado pesada. Selecciona una imagen más liviana.");
    setGuardadoPerfil(false);
    return;
  }

  const profileToSave: PanelProfilePersistido = {
    nombrePerfil: nombreFinal,
    cargoPerfil: cargoFinal,
    fotoPerfil: fotoFinal,
  };

  if (typeof window === "undefined") {
    setErrorPerfil("No se pudo guardar el perfil en este navegador");
    setGuardadoPerfil(false);
    return;
  }

  try {
    localStorage.setItem(PANEL_PROFILE_STORAGE_KEY, JSON.stringify(profileToSave));
    const savedProfile = localStorage.getItem(PANEL_PROFILE_STORAGE_KEY);

    if (!savedProfile) {
      setErrorPerfil("No se pudo guardar el perfil en este navegador");
      setGuardadoPerfil(false);
      return;
    }
  } catch {
    setErrorPerfil("No se pudo guardar el perfil en este navegador");
    setGuardadoPerfil(false);
    return;
  }

  setUsuario((actual) => ({
    ...actual,
    nombre: nombreFinal,
    cargo: cargoFinal,
    foto: fotoFinal || "",
  }));
  setNombrePerfil(nombreFinal);
  setCargoPerfil(cargoFinal);
  setFotoPerfil(fotoFinal || "");

  setErrorPerfil("");
  setGuardadoPerfil(true);
  setFotoPerfilCargada(false);
  setCampoPerfilActivo(null);
  setControlPerfilActivo(null);
  setMostrarEditorPerfil(false);
};
useEffect(() => {
  if (typeof window === "undefined") return;

  const perfilGuardado = window.localStorage.getItem(PANEL_PROFILE_STORAGE_KEY);
  if (!perfilGuardado) return;

  try {
    const perfil = JSON.parse(perfilGuardado) as Partial<PanelProfilePersistido>;
    const nombreGuardado = perfil.nombrePerfil?.trim() || "Freddy Camus";
    const cargoGuardado = perfil.cargoPerfil?.trim() || "Ingeniero en Prevención de Riesgos";
    const fotoGuardada = typeof perfil.fotoPerfil === "string" ? perfil.fotoPerfil : "";

    setUsuario((actual) => ({
      ...actual,
      nombre: nombreGuardado,
      cargo: cargoGuardado,
      foto: fotoGuardada,
    }));
    setNombrePerfil(nombreGuardado);
    setCargoPerfil(cargoGuardado);
    setFotoPerfil(fotoGuardada);
    setNombrePerfilDraft(nombreGuardado);
    setCargoPerfilDraft(cargoGuardado);
    setFotoPerfilDraft(fotoGuardada || null);
  } catch {
    console.warn("No se pudo leer ce_panel_profile desde localStorage.");
    return;
  }
}, []);
useEffect(() => {
  if (!guardadoPerfil) return;

  const timeout = window.setTimeout(() => {
    setGuardadoPerfil(false);
  }, 3200);

  return () => window.clearTimeout(timeout);
}, [guardadoPerfil]);
const limpiarFiltros = () => {
  setFiltroRapido("PERSONALIZADO");
  setFiltroEmpresa("TODAS");
  setFiltroObra("TODAS");
  setFiltroEstado("TODOS");
  setFiltroCriticidad("TODAS");
  setFiltroFechaDesde("");
  setFiltroFechaHasta("");
  setFiltroTipoHallazgo("TODOS");
};
const abrirNotificacion = (hallazgoId: string) => {
  const hallazgoRelacionado = filas.find((item) => item.id === hallazgoId);

  if (!hallazgoRelacionado) {
    return;
  }

  setHallazgoActivo(hallazgoRelacionado);

  setNotificaciones((prev) =>
    prev.map((item) =>
      item.hallazgoId === hallazgoId ? { ...item, leida: true } : item
    )
  );

  setMostrarNotificaciones(false);
};
const quitarFiltro = (filtro: string) => {
  if (filtro.startsWith("Empresa:")) {
    setFiltroEmpresa("TODAS");
    return;
  }

  if (filtro.startsWith("Obra:")) {
    setFiltroObra("TODAS");
    return;
  }

  if (filtro.startsWith("Estado:")) {
    setFiltroEstado("TODOS");
    return;
  }

  if (filtro.startsWith("Criticidad:")) {
    setFiltroCriticidad("TODAS");
    return;
  }

  if (filtro.startsWith("Tipo:")) {
    setFiltroTipoHallazgo("TODOS");
    return;
  }

  if (filtro.startsWith("Desde:")) {
    setFiltroRapido("PERSONALIZADO");
    setFiltroFechaDesde("");
    return;
  }

  if (filtro.startsWith("Hasta:")) {
    setFiltroRapido("PERSONALIZADO");
    setFiltroFechaHasta("");
  }
};
const formatearFechaInput = (fecha: Date) => {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const aplicarFiltroRapido = (
  modo: "HOY" | "SEMANA" | "MES" | "PERSONALIZADO"
) => {
  setFiltroRapido(modo);

  if (modo === "PERSONALIZADO") {
    setFiltroFechaDesde("");
    setFiltroFechaHasta("");
    return;
  }

  const hasta = new Date(fechaBase);
  const desde = new Date(fechaBase);

  if (modo === "HOY") {
    desde.setHours(0, 0, 0, 0);
  } else if (modo === "SEMANA") {
    desde.setDate(desde.getDate() - 6);
  } else if (modo === "MES") {
    desde.setDate(1);
  }

  setFiltroFechaDesde(formatearFechaInput(desde));
  setFiltroFechaHasta(formatearFechaInput(hasta));
};

const opcionesEmpresa = ["TODAS", ...new Set(filas.map((item) => item.empresa))];
const opcionesObra = ["TODAS", ...new Set(filas.map((item) => item.obra))];
const opcionesEstado = ["TODOS", ...new Set(filas.map((item) => item.estado))];
const opcionesCriticidad = ["TODAS", ...new Set(filas.map((item) => item.criticidad))];
const opcionesTipoHallazgo = ["TODOS", ...new Set(filas.map((item) => item.tipoHallazgo))];

const fechaBase = new Date(
  Math.max(...filas.map((item) => new Date(item.fechaISO).getTime()))
);

const inicioDia = new Date(fechaBase);
inicioDia.setHours(0, 0, 0, 0);

const finDia = new Date(fechaBase);
finDia.setHours(23, 59, 59, 999);

const inicioSemana = new Date(inicioDia);
inicioSemana.setDate(inicioSemana.getDate() - 6);

const inicioMes = new Date(
  fechaBase.getFullYear(),
  fechaBase.getMonth(),
  1
);

const filasBase = filas.filter((item) => {
  const fechaItem = new Date(item.fechaISO);

  const cumpleEmpresa =
    filtroEmpresa === "TODAS" || item.empresa === filtroEmpresa;

  const cumpleObra =
    filtroObra === "TODAS" || item.obra === filtroObra;

  const cumpleEstado =
    filtroEstado === "TODOS" || item.estado === filtroEstado;

  const cumpleCriticidad =
    filtroCriticidad === "TODAS" || item.criticidad === filtroCriticidad;

  const cumpleTipoHallazgo =
    filtroTipoHallazgo === "TODOS" ||
    item.tipoHallazgo === filtroTipoHallazgo;

  const cumpleFechaDesde =
    !filtroFechaDesde ||
    fechaItem >= new Date(`${filtroFechaDesde}T00:00:00`);

  const cumpleFechaHasta =
    !filtroFechaHasta ||
    fechaItem <= new Date(`${filtroFechaHasta}T23:59:59`);

  return (
    cumpleEmpresa &&
    cumpleObra &&
    cumpleEstado &&
    cumpleCriticidad &&
    cumpleTipoHallazgo &&
    cumpleFechaDesde &&
    cumpleFechaHasta
  );
});

const filasFiltradas = filasBase.filter((item) => {
  const fecha = new Date(item.fechaISO);

  if (filtroRapido === "HOY") {
    return fecha >= inicioDia && fecha <= finDia;
  }

  if (filtroRapido === "SEMANA") {
    return fecha >= inicioSemana && fecha <= finDia;
  }

  if (filtroRapido === "MES") {
    return fecha >= inicioMes && fecha <= finDia;
  }

  return true;
});
type HallazgoSeguimiento = (typeof filas)[number] & {
  responsableCierreNombre: string;
  responsableCierreCargo: string;
  responsableCierreEmpresa: string;
  responsableCierreTelefono: string;
  responsableCierreEstadoSeguimiento: string;
  responsableCierreFechaCompromiso: string;
  responsableCierreEvidencia: string;
  responsableCierreObservacion: string;
  responsableCorreccionTipo: string;
  responsableCorreccionNombre: string;
  responsableCorreccionCargo: string;
  responsableCorreccionEmpresa: string;
  responsableCorreccionTelefono: string;
  encargadoSeguimientoNombre: string;
  encargadoSeguimientoCargo: string;
  validadorCierreNombre: string;
  validadorCierreEstado: string;
  validadorCierreObservacion: string;
  accionCorrectivaRequerida: string;
  evidenciaRequerida: string;
  evidenciaRecibida: string;
};

const obtenerCampoSeguimiento = (
  item: (typeof filas)[number],
  campo: string,
  fallback: string
) => {
  const valor = (item as unknown as Record<string, unknown>)[campo];
  return typeof valor === "string" && valor.trim() ? valor.trim() : fallback;
};

// Estos campos deben venir luego desde flujo móvil, formulario de reporte,
// asignación de responsable, evidencia de cierre y base de datos/Supabase.
const hallazgosSeguimiento: HallazgoSeguimiento[] = filas.map((item) => {
  const edicionLocal = gestionCierreLocal[item.codigo] || {};
  const responsableReal = obtenerCampoSeguimiento(item, "responsableCierreNombre", "");
  const evidenciaReal = obtenerCampoSeguimiento(item, "responsableCierreEvidencia", "");
  const estadoReal = obtenerCampoSeguimiento(item, "responsableCierreEstadoSeguimiento", "");
  const estadoCerradoConEvidencia = item.estado === "CERRADO" && Boolean(evidenciaReal);

  const baseSeguimiento: HallazgoSeguimiento = {
    ...item,
    responsableCierreNombre: responsableReal || "Sin asignar",
    responsableCierreCargo: obtenerCampoSeguimiento(item, "responsableCierreCargo", "Pendiente"),
    responsableCierreEmpresa: obtenerCampoSeguimiento(
      item,
      "responsableCierreEmpresa",
      item.empresa || "Sin definir"
    ),
    responsableCierreTelefono: obtenerCampoSeguimiento(item, "responsableCierreTelefono", "Sin contacto"),
    responsableCierreEstadoSeguimiento:
      estadoReal || (estadoCerradoConEvidencia ? "Cerrado" : "Pendiente de asignación"),
    responsableCierreFechaCompromiso: obtenerCampoSeguimiento(
      item,
      "responsableCierreFechaCompromiso",
      item.fechaCompromiso || "Sin definir"
    ),
    responsableCierreEvidencia: evidenciaReal || "Sin evidencia de cierre",
    responsableCierreObservacion: obtenerCampoSeguimiento(
      item,
      "responsableCierreObservacion",
      "Responsable de cierre pendiente de definición"
    ),
    responsableCorreccionTipo: obtenerCampoSeguimiento(
      item,
      "responsableCorreccionTipo",
      "Empresa contratista"
    ),
    responsableCorreccionNombre: responsableReal || "Sin asignar",
    responsableCorreccionCargo: obtenerCampoSeguimiento(item, "responsableCorreccionCargo", "Pendiente"),
    responsableCorreccionEmpresa: obtenerCampoSeguimiento(
      item,
      "responsableCorreccionEmpresa",
      item.empresa || "Sin definir"
    ),
    responsableCorreccionTelefono: obtenerCampoSeguimiento(item, "responsableCorreccionTelefono", "Sin contacto"),
    encargadoSeguimientoNombre: obtenerCampoSeguimiento(item, "encargadoSeguimientoNombre", "Usuario autorizado"),
    encargadoSeguimientoCargo: obtenerCampoSeguimiento(item, "encargadoSeguimientoCargo", "Encargado de seguimiento"),
    validadorCierreNombre: obtenerCampoSeguimiento(item, "validadorCierreNombre", "Pendiente de validador"),
    validadorCierreEstado: obtenerCampoSeguimiento(item, "validadorCierreEstado", "Pendiente de revisión"),
    validadorCierreObservacion: obtenerCampoSeguimiento(
      item,
      "validadorCierreObservacion",
      "Validación pendiente de evidencia y revisión"
    ),
    accionCorrectivaRequerida: obtenerCampoSeguimiento(
      item,
      "accionCorrectivaRequerida",
      item.medidaInmediata || "Acción correctiva pendiente de definición"
    ),
    evidenciaRequerida: obtenerCampoSeguimiento(
      item,
      "evidenciaRequerida",
      "Registro fotográfico y documentación de corrección"
    ),
    evidenciaRecibida: evidenciaReal || "Pendiente de evidencia",
  };

  const responsableCorreccionNombre =
    edicionLocal.responsableCorreccionNombre ?? baseSeguimiento.responsableCorreccionNombre;
  const evidenciaRequerida =
    Array.isArray(edicionLocal.evidenciaRequerida) && edicionLocal.evidenciaRequerida.length > 0
      ? edicionLocal.evidenciaRequerida.join(", ")
      : baseSeguimiento.evidenciaRequerida;
  const evidenciaRecibida = edicionLocal.evidenciaRecibida ?? baseSeguimiento.evidenciaRecibida;

  return {
    ...baseSeguimiento,
    ...edicionLocal,
    responsableCorreccionNombre,
    responsableCierreNombre: responsableCorreccionNombre,
    responsableCierreCargo: edicionLocal.responsableCorreccionCargo ?? baseSeguimiento.responsableCierreCargo,
    responsableCierreEmpresa: edicionLocal.responsableCorreccionEmpresa ?? baseSeguimiento.responsableCierreEmpresa,
    responsableCierreTelefono: edicionLocal.responsableCorreccionTelefono ?? baseSeguimiento.responsableCierreTelefono,
    responsableCierreEvidencia: evidenciaRecibida,
    evidenciaRequerida,
    evidenciaRecibida,
  };
});

const estadoSeguimientoVisual = (item: HallazgoSeguimiento) => {
  if (item.responsableCorreccionNombre === "Sin asignar") return "Sin asignar";
  if (item.responsableCierreEstadoSeguimiento === "Cerrado") return "Cerrado";
  if (item.responsableCierreEstadoSeguimiento === "Cerrado con evidencia") return "Cerrado";
  if (item.responsableCierreEstadoSeguimiento === "Rechazado") return "Rechazado";
  if (item.responsableCierreEstadoSeguimiento === "En revisión") return "En revisión";
  if (item.responsableCierreEstadoSeguimiento === "Evidencia solicitada") return "En seguimiento";
  if (item.responsableCierreEstadoSeguimiento === "Evidencia cargada") return "Evidencia cargada";
  const vencimiento = semaforoVencimiento(item.responsableCierreFechaCompromiso, item.estado).etiqueta;
  if (vencimiento === "VENCIDO" && item.estado !== "CERRADO") return "Vencido";
  if (item.responsableCierreEstadoSeguimiento === "En seguimiento") return "En seguimiento";
  return "Asignado";
};

const opcionesSeguimientoEstado = [
  "TODOS",
  "Sin asignar",
  "Asignado",
  "En seguimiento",
  "Evidencia cargada",
  "En revisión",
  "Vencido",
  "Cerrado",
  "Rechazado",
];
const opcionesSeguimientoEmpresa = [
  "TODAS",
  ...Array.from(new Set(hallazgosSeguimiento.map((item) => item.responsableCierreEmpresa))),
];

const hallazgosSeguimientoFiltrados = hallazgosSeguimiento.filter((item) => {
  const estadoVisual = estadoSeguimientoVisual(item);
  const busqueda = busquedaResponsableSeguimiento.trim().toLowerCase();
  const fechaCompromiso = item.responsableCierreFechaCompromiso;

  return (
    (filtroSeguimientoEstado === "TODOS" || estadoVisual === filtroSeguimientoEstado) &&
    (filtroSeguimientoEmpresa === "TODAS" || item.responsableCierreEmpresa === filtroSeguimientoEmpresa) &&
    (filtroSeguimientoCriticidad === "TODAS" || item.criticidad === filtroSeguimientoCriticidad) &&
    (!filtroSeguimientoFecha || fechaCompromiso === filtroSeguimientoFecha) &&
    (!busqueda ||
      item.responsableCorreccionNombre.toLowerCase().includes(busqueda) ||
      item.encargadoSeguimientoNombre.toLowerCase().includes(busqueda) ||
      item.codigo.toLowerCase().includes(busqueda))
  );
});

const hallazgoSeguimientoActivo =
  hallazgosSeguimiento.find((item) => item.codigo === codigoSeguimientoActivo) ||
  hallazgosSeguimientoFiltrados[0] ||
  hallazgosSeguimiento[0];

const ejecutarBusquedaResponsableSeguimiento = () => {
  setBusquedaResponsableSeguimiento(busquedaResponsableSeguimientoDraft.trim());
};

const limpiarBusquedaResponsableSeguimiento = () => {
  setBusquedaResponsableSeguimiento("");
  setBusquedaResponsableSeguimientoDraft("");
};

const opcionesTipoResponsableCorreccion = [
  "Trabajador interno",
  "Supervisor de área",
  "Empresa contratista",
  "Empresa subcontratista",
  "Área interna",
  "Mantención",
  "Bodega",
  "Administración",
  "Prevención",
  "Otro",
];

const opcionesEvidenciaRequerida = [
  "Registro fotográfico",
  "Documentación de corrección",
  "Charla de seguridad",
  "Registro firmado",
  "Checklist corregido",
  "Orden de trabajo",
  "Certificado externo",
  "Validación en terreno",
  "Otra evidencia",
];

const opcionesEstadoValidacion = [
  "Pendiente de revisión",
  "En revisión",
  "Aprobado",
  "Rechazado",
  "Requiere nueva evidencia",
];

const opcionesEstadoSeguimientoGestion = [
  "Sin asignar",
  "Asignado",
  "En seguimiento",
  "Evidencia solicitada",
  "Evidencia cargada",
  "Vencido",
  "Cerrado con evidencia",
];

const opcionesValidadorCierre = [
  "Administrador",
  "Prevencionista",
  "Supervisor autorizado",
  "Mandante",
  "Jefe de obra",
  "Otro usuario autorizado",
];

const abrirGestionCierre = () => {
  if (!hallazgoSeguimientoActivo) return;

  setGestionCierreDraft({
    responsableCorreccionTipo: hallazgoSeguimientoActivo.responsableCorreccionTipo,
    responsableCorreccionEmpresa: hallazgoSeguimientoActivo.responsableCorreccionEmpresa,
    responsableCorreccionNombre:
      hallazgoSeguimientoActivo.responsableCorreccionNombre === "Sin asignar"
        ? ""
        : hallazgoSeguimientoActivo.responsableCorreccionNombre,
    responsableCorreccionCargo:
      hallazgoSeguimientoActivo.responsableCorreccionCargo === "Pendiente"
        ? ""
        : hallazgoSeguimientoActivo.responsableCorreccionCargo,
    responsableCorreccionTelefono:
      hallazgoSeguimientoActivo.responsableCorreccionTelefono === "Sin contacto"
        ? ""
        : hallazgoSeguimientoActivo.responsableCorreccionTelefono,
    encargadoSeguimientoNombre: hallazgoSeguimientoActivo.encargadoSeguimientoNombre,
    accionCorrectivaRequerida: hallazgoSeguimientoActivo.accionCorrectivaRequerida,
    evidenciaRequerida:
      hallazgoSeguimientoActivo.evidenciaRequerida === "Registro fotográfico y documentación de corrección"
        ? []
        : hallazgoSeguimientoActivo.evidenciaRequerida.split(", ").filter(Boolean),
    responsableCierreFechaCompromiso:
      hallazgoSeguimientoActivo.responsableCierreFechaCompromiso === "Sin definir"
        ? ""
        : hallazgoSeguimientoActivo.responsableCierreFechaCompromiso,
    validadorCierreNombre:
      hallazgoSeguimientoActivo.validadorCierreNombre === "Pendiente de validador"
        ? ""
        : hallazgoSeguimientoActivo.validadorCierreNombre,
    estadoSeguimiento: estadoSeguimientoVisual(hallazgoSeguimientoActivo),
    validadorCierreEstado: hallazgoSeguimientoActivo.validadorCierreEstado,
    validadorCierreObservacion: hallazgoSeguimientoActivo.validadorCierreObservacion,
  });
  setErrorGestionCierre("");
  setMostrarGestionCierre(true);
};

const alternarEvidenciaGestion = (evidencia: string) => {
  setGestionCierreDraft((actual) => ({
    ...actual,
    evidenciaRequerida: actual.evidenciaRequerida.includes(evidencia)
      ? actual.evidenciaRequerida.filter((item) => item !== evidencia)
      : [...actual.evidenciaRequerida, evidencia],
  }));
};

const estadoSeguimientoDesdeGestion = (draft: GestionCierreDraft) => {
  if (draft.estadoSeguimiento === "Cerrado con evidencia") return "Cerrado";
  if (draft.estadoSeguimiento) return draft.estadoSeguimiento;
  if (draft.responsableCorreccionNombre.trim()) return "Asignado";
  return "Pendiente de asignación";
};

const guardarGestionCierre = () => {
  if (!hallazgoSeguimientoActivo) return;

  if (!gestionCierreDraft.responsableCorreccionTipo.trim()) {
    setErrorGestionCierre("Tipo de responsable de corrección es obligatorio.");
    return;
  }

  if (!gestionCierreDraft.responsableCorreccionEmpresa.trim()) {
    setErrorGestionCierre("Empresa responsable es obligatoria.");
    return;
  }

  if (!gestionCierreDraft.accionCorrectivaRequerida.trim()) {
    setErrorGestionCierre("Acción correctiva requerida es obligatoria.");
    return;
  }

  if (gestionCierreDraft.evidenciaRequerida.length === 0) {
    setErrorGestionCierre("Selecciona al menos una evidencia requerida.");
    return;
  }

  if (
    gestionCierreDraft.validadorCierreEstado === "Aprobado" &&
    (!gestionCierreDraft.validadorCierreNombre.trim() ||
      gestionCierreDraft.evidenciaRequerida.length === 0 ||
      !gestionCierreDraft.validadorCierreObservacion.trim())
  ) {
    setErrorGestionCierre("Para aprobar, define validador, evidencia requerida y observación de validación.");
    return;
  }

  const estadoAnterior = estadoSeguimientoVisual(hallazgoSeguimientoActivo);
  const estadoSeguimiento = estadoSeguimientoDesdeGestion(gestionCierreDraft);
  const camposModificados = [
    gestionCierreDraft.responsableCorreccionTipo !== hallazgoSeguimientoActivo.responsableCorreccionTipo
      ? t("Tipo de responsable de corrección")
      : null,
    gestionCierreDraft.responsableCorreccionEmpresa !== hallazgoSeguimientoActivo.responsableCorreccionEmpresa
      ? t("Empresa responsable")
      : null,
    gestionCierreDraft.responsableCorreccionNombre !== hallazgoSeguimientoActivo.responsableCorreccionNombre
      ? t("Nombre responsable")
      : null,
    gestionCierreDraft.encargadoSeguimientoNombre !== hallazgoSeguimientoActivo.encargadoSeguimientoNombre
      ? t("Encargado de seguimiento")
      : null,
    estadoSeguimiento !== estadoAnterior ? t("Estado seguimiento") : null,
    gestionCierreDraft.validadorCierreEstado !== hallazgoSeguimientoActivo.validadorCierreEstado
      ? t("Estado de validación")
      : null,
    gestionCierreDraft.validadorCierreNombre !== hallazgoSeguimientoActivo.validadorCierreNombre
      ? t("Validador de cierre")
      : null,
  ].filter(Boolean) as string[];
  const fechaHora = new Date().toLocaleString("es-CL");
  const resumen = [
    `${t("Responsable de corrección")}: ${
      gestionCierreDraft.responsableCorreccionNombre.trim() || t("Sin asignar")
    }`,
    `${t("Estado seguimiento")}: ${t(estadoSeguimiento)}`,
    `${t("Fecha compromiso")}: ${
      gestionCierreDraft.responsableCierreFechaCompromiso || t("Sin definir")
    }`,
  ].join(" · ");

  setGestionCierreLocal((actual) => {
    const previo = actual[hallazgoSeguimientoActivo.codigo] || {};
    return {
      ...actual,
      [hallazgoSeguimientoActivo.codigo]: {
        ...previo,
        ...gestionCierreDraft,
        responsableCorreccionNombre:
          gestionCierreDraft.responsableCorreccionNombre.trim() || "Sin asignar",
        responsableCorreccionCargo:
          gestionCierreDraft.responsableCorreccionCargo.trim() || "Pendiente",
        responsableCorreccionTelefono:
          gestionCierreDraft.responsableCorreccionTelefono.trim() || "Sin contacto",
        encargadoSeguimientoNombre:
          gestionCierreDraft.encargadoSeguimientoNombre.trim() || "Usuario autorizado",
        validadorCierreNombre:
          gestionCierreDraft.validadorCierreNombre.trim() || "Pendiente de validador",
        responsableCierreFechaCompromiso:
          gestionCierreDraft.responsableCierreFechaCompromiso || "Sin definir",
        responsableCierreEstadoSeguimiento: estadoSeguimiento,
        responsableCierreObservacion:
          gestionCierreDraft.validadorCierreObservacion.trim() ||
          "Responsable de cierre pendiente de definición",
        evidenciaRecibida:
          gestionCierreDraft.validadorCierreEstado === "Aprobado" &&
          gestionCierreDraft.evidenciaRequerida.length > 0
            ? gestionCierreDraft.evidenciaRequerida.join(", ")
            : "Pendiente de evidencia",
        bitacoraCierre: [
          ...(previo.bitacoraCierre || []),
          {
            fechaHora,
            usuario: usuario?.nombre || "Administrador",
            accion: "Actualización desde plataforma PC",
            resumen,
            camposModificados,
            estadoAnterior,
            estadoNuevo: estadoSeguimiento,
          },
        ],
      },
    };
  });
  setCodigoSeguimientoActivo(hallazgoSeguimientoActivo.codigo);
  setErrorGestionCierre("");
  setMostrarGestionCierre(false);
};

const kpisSeguimiento = [
  {
    id: "sin-responsable",
    titulo: t("Sin responsable asignado"),
    valor: String(hallazgosSeguimiento.filter((item) => estadoSeguimientoVisual(item) === "Sin asignar").length),
    color: "#f59e0b",
  },
  {
    id: "en-seguimiento",
    titulo: t("En seguimiento"),
    valor: String(hallazgosSeguimiento.filter((item) => estadoSeguimientoVisual(item) === "En seguimiento").length),
    color: "#3b82f6",
  },
  {
    id: "vencidos",
    titulo: t("Vencidos"),
    valor: String(hallazgosSeguimiento.filter((item) => estadoSeguimientoVisual(item) === "Vencido").length),
    color: "#ef4444",
  },
  {
    id: "cerrados-evidencia",
    titulo: t("Cerrados con evidencia"),
    valor: String(
      hallazgosSeguimiento.filter(
        (item) =>
          estadoSeguimientoVisual(item) === "Cerrado" &&
          item.responsableCierreEvidencia !== "Sin evidencia de cierre"
      ).length
    ),
    color: "#22c55e",
  },
];
const ultimaActualizacion = formatearUltimaActualizacion(fechaActualizacion);
    const filtrosActivos = [
  filtroEmpresa !== "TODAS" ? `Empresa: ${filtroEmpresa}` : null,
  filtroObra !== "TODAS" ? `Obra: ${filtroObra}` : null,
  filtroEstado !== "TODOS" ? `Estado: ${filtroEstado}` : null,
  filtroCriticidad !== "TODAS" ? `Criticidad: ${filtroCriticidad}` : null,
  filtroTipoHallazgo !== "TODOS"
    ? `Tipo: ${filtroTipoHallazgo}`
    : null,
  filtroFechaDesde ? `Desde: ${filtroFechaDesde}` : null,
  filtroFechaHasta ? `Hasta: ${filtroFechaHasta}` : null,
].filter(Boolean) as string[];
   const reportesPorEmpresaBase = Array.from(
  filasFiltradas.reduce((acc, item) => {
    acc.set(item.empresa, (acc.get(item.empresa) || 0) + 1);
    return acc;
  }, new Map<string, number>())
)
  .map(([empresa, total]) => ({ empresa, total }))
  .sort((a, b) => b.total - a.total);

const reportesPorEmpresa =
  reportesPorEmpresaBase.length <= 5
    ? reportesPorEmpresaBase
    : [
        ...reportesPorEmpresaBase.slice(0, 5),
        {
          empresa: "Otras",
          total: reportesPorEmpresaBase
            .slice(5)
            .reduce((sum, item) => sum + item.total, 0),
        },
      ];
      const criticidadResumen = [
  {
    label: t("Críticos"),
    total: filasFiltradas.filter((item) => item.criticidad === "CRÍTICO").length,
    color: "#ef4444",
  },
  {
    label: idiomaActivo === "en" ? "High" : "Altos",
    total: filasFiltradas.filter((item) => item.criticidad === "ALTO").length,
    color: "#f59e0b",
  },
  {
    label: idiomaActivo === "en" ? "Medium" : "Medios",
    total: filasFiltradas.filter((item) => item.criticidad === "MEDIO").length,
    color: "#3b82f6",
  },
  {
    label: idiomaActivo === "en" ? "Low" : "Bajos",
    total: filasFiltradas.filter((item) => item.criticidad === "BAJO").length,
    color: "#22c55e",
  },
];

const totalCriticidad = criticidadResumen.reduce(
  (sum, item) => sum + item.total,
  0
);
const fechaBaseEvolucion =
  filasFiltradas.length > 0
    ? new Date(
        Math.max(...filasFiltradas.map((item) => new Date(item.fechaISO).getTime()))
      )
    : fechaBase;

const evolucionDiaria = Array.from({ length: 7 }, (_, index) => {
  const fecha = new Date(fechaBaseEvolucion);
  fecha.setDate(fecha.getDate() - (6 - index));
  fecha.setHours(0, 0, 0, 0);

  const finDia = new Date(fecha);
  finDia.setHours(23, 59, 59, 999);

  const total = filasFiltradas.filter((item) => {
    const actual = new Date(item.fechaISO);
    return actual >= fecha && actual <= finDia;
  }).length;

  const etiqueta = fecha
    .toLocaleDateString(idiomaActivo === "en" ? "en-US" : "es-CL", { weekday: "short" })
    .replace(".", "");

  return {
    etiqueta: etiqueta.charAt(0).toUpperCase() + etiqueta.slice(1),
    total,
  };
});
const estadoReportesResumen = [
  {
    label: t("Abiertos"),
    total: filasFiltradas.filter((item) => item.estado === "ABIERTO").length,
    color: "#f59e0b",
  },
  {
    label: idiomaActivo === "en" ? "In progress" : "En seguimiento",
    total: filasFiltradas.filter((item) => item.estado === "EN SEGUIMIENTO").length,
    color: "#3b82f6",
  },
  {
    label: t("Cerrados"),
    total: filasFiltradas.filter((item) => item.estado === "CERRADO").length,
    color: "#22c55e",
  },
];

const totalEstadoReportes = estadoReportesResumen.reduce(
  (sum, item) => sum + item.total,
  0
);
const descargarPDFHallazgoActivo = async () => {
  const escapeHtml = (valor: unknown) =>
    String(valor ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const h = hallazgoActivo;

  const html = `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>${escapeHtml(h.codigo)}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 32px;
            color: #111827;
            background: white;
          }
          .wrap {
            max-width: 900px;
            margin: 0 auto;
          }
          h1 {
            font-size: 24px;
            margin: 0 0 8px;
          }
          .sub {
            color: #4b5563;
            margin-bottom: 24px;
          }
          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px 20px;
          }
          .label {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 4px;
          }
          .value {
            font-size: 14px;
            font-weight: 700;
          }
          .card {
            border: 1px solid #d1d5db;
            border-radius: 12px;
            padding: 14px;
            margin-top: 14px;
          }
          .text {
            white-space: pre-wrap;
            line-height: 1.5;
            font-size: 14px;
          }
          .chip {
  display: inline-block;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid #d1d5db;
  font-size: 12px;
  font-weight: 700;
}

@page {
  size: Letter;
  margin: 16mm;
}

.page {
  width: min(216mm, calc(100vw - 64px));
  min-height: 279mm;
  margin: 0 auto;
  padding: 16mm;
  background: #ffffff;
  box-sizing: border-box;
}

.wrap {
  max-width: 100%;
  margin: 0 auto;
}

@media screen {
  body {
    margin: 0;
    padding: 32px 0 64px;
    background: #e5e7eb;
  }

  .page {
    border: 1px solid #d1d5db;
    box-shadow: 0 2px 10px rgba(15, 23, 42, 0.08);
    border-radius: 4px;
  }
}

@media print {
  body {
    margin: 0;
    padding: 0;
    background: #ffffff;
  }

  .page {
    width: auto;
    min-height: auto;
    margin: 0;
    padding: 0;
    border: none;
    box-shadow: none;
    border-radius: 0;
  }
}
        </style>
      </head>
      <body>
      <div class="page">
        <div class="wrap">
          <h1>Informe Ejecutivo de Hallazgo</h1>
          <div class="sub">Criterio Estratégico</div>

          <div class="grid">
            <div>
              <div class="label">Código</div>
              <div class="value">${escapeHtml(h.codigo)}</div>
            </div>
            <div>
              <div class="label">Fecha / Hora</div>
              <div class="value">${escapeHtml(h.fechaHora)}</div>
            </div>
            <div>
              <div class="label">Empresa</div>
              <div class="value">${escapeHtml(h.empresa)}</div>
            </div>
            <div>
              <div class="label">Estado</div>
              <div class="value">${escapeHtml(h.estado)}</div>
            </div>
            <div>
              <div class="label">Reportante</div>
              <div class="value">${escapeHtml(h.reportante)}</div>
            </div>
            <div>
              <div class="label">Cargo</div>
              <div class="value">${escapeHtml(h.cargo)}</div>
            </div>
            <div>
              <div class="label">Teléfono</div>
              <div class="value">${escapeHtml(h.telefono)}</div>
            </div>
            <div>
              <div class="label">Tipo de hallazgo</div>
              <div class="value">${escapeHtml(h.tipoHallazgo)}</div>
            </div>
            <div>
              <div class="label">Criticidad</div>
              <div class="chip">${escapeHtml(h.criticidad)}</div>
            </div>
          </div>

         <div class="card">
  <div class="label">Descripción</div>
  <div class="text">${escapeHtml(h.descripcion)}</div>
</div>

${
  h.fotos && h.fotos.length > 0
    ? `
      <div style="margin-top:16px; display:flex; gap:12px; flex-wrap:wrap; align-items:flex-start;">
        ${h.fotos.slice(0, 3).map((foto) => `
          <div
            style="
              width:190px;
              height:190px;
              border:1px solid #d1d5db;
              border-radius:10px;
              padding:6px;
              background:#f9fafb;
              box-sizing:border-box;
              overflow:hidden;
              flex:0 0 auto;
            "
          >
            <img
              src="${escapeHtml(foto)}"
              alt="Evidencia fotográfica"
              style="
                width:100%;
                height:100%;
                object-fit:cover;
                border-radius:8px;
                display:block;
              "
            />
          </div>
        `).join("")}
      </div>
    `
    : `
      <div class="text" style="color:#6b7280;">Sin evidencia fotográfica adjunta.</div>
    `
}
</div>

<div class="card">
  <div class="label">Medida inmediata</div>
  <div class="text">${escapeHtml(h.medidaInmediata)}</div>
</div>
        </div>
        </div>
      </body>
    </html>
  `;

  const nombreArchivo = `${String(h.codigo || "hallazgo").replace(/[^\w-]+/g, "-")}.pdf`;

const parser = new DOMParser();
const docPdf = parser.parseFromString(html, "text/html");
const estilos = docPdf.querySelector("style")?.innerHTML || "";
const contenido = docPdf.body.innerHTML;

const contenedor = document.createElement("div");
contenedor.style.position = "fixed";
contenedor.style.left = "-99999px";
contenedor.style.top = "0";
contenedor.style.zIndex = "-1";
contenedor.style.background = "#ffffff";
contenedor.innerHTML = `<style>${estilos}</style>${contenido}`;
document.body.appendChild(contenedor);

const elementoPdf = contenedor.querySelector(".page") as HTMLElement | null;
if (!elementoPdf) {
  document.body.removeChild(contenedor);
  return;
}

// @ts-expect-error html2pdf.js no trae tipos en este proyecto
const html2pdf = (await import("html2pdf.js")).default;

try {
  await html2pdf()
    .set({
      margin: 0,
      filename: nombreArchivo,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      },
      jsPDF: {
        unit: "mm",
        format: "letter",
        orientation: "portrait",
      },
      pagebreak: { mode: ["css", "legacy"] },
    })
    .from(elementoPdf)
    .save();
} finally {
  document.body.removeChild(contenedor);
}
};
useEffect(() => {
  if (filasFiltradas.length === 0) {
    return;
  }

  const existeEnFiltro = filasFiltradas.some(
    (item) => item.id === hallazgoActivo.id
  );

  if (!existeEnFiltro) {
    setHallazgoActivo(filasFiltradas[0]);
  }
}, [filasFiltradas, hallazgoActivo]);
const kpis = [
  {
    id: "total-reportes",
    titulo: t("Total reportes"),
    valor: String(filasFiltradas.length),
    color: "#3b82f6",
  },
  {
    id: "abiertos",
    titulo: t("Abiertos"),
    valor: String(
      filasFiltradas.filter((item) => item.estado === "ABIERTO").length
    ),
    color: "#f59e0b",
  },
  {
    id: "cerrados",
    titulo: t("Cerrados"),
    valor: String(
      filasFiltradas.filter((item) => item.estado === "CERRADO").length
    ),
    color: "#22c55e",
  },
  {
    id: "criticos",
    titulo: t("Críticos"),
    valor: String(
      filasFiltradas.filter((item) => item.criticidad === "CRÍTICO").length
    ),
    color: "#ef4444",
  },
  {
    id: "vencidos",
    titulo: t("Vencidos"),
    valor: String(
  filasFiltradas.filter(
    (item) =>
      semaforoVencimiento(item.fechaCompromiso, item.estado).etiqueta === "VENCIDO"
  ).length
),
    color: "#b91c1c",
  },
  {
    id: "empresas-activas",
    titulo: t("Empresas activas"),
    valor: String(new Set(filasFiltradas.map((item) => item.empresa)).size),
    color: "#8b5cf6",
  },
  {
  id: "historico-total",
  titulo: t("Histórico total"),
  valor: String(totalHistoricoHallazgos),
  color: "#ef4444",
},
];
  const temaClaro = modoSistema === "claro";
  const tema = {
    fondo: temaClaro
      ? "linear-gradient(180deg, #edf4fb 0%, #e5eef8 48%, #dfe9f5 100%)"
      : "linear-gradient(180deg, #071426 0%, #0a1b34 45%, #07172b 100%)",
    texto: temaClaro ? "#111827" : "white",
    textoSuave: temaClaro ? "rgba(15,23,42,0.68)" : "rgba(255,255,255,0.72)",
    textoMedio: temaClaro ? "rgba(15,23,42,0.78)" : "rgba(255,255,255,0.78)",
    tarjeta: temaClaro ? "#ffffff" : "rgba(255,255,255,0.06)",
    tarjetaSuave: temaClaro ? "#f8fafc" : "rgba(255,255,255,0.05)",
    tarjetaElevada: temaClaro ? "#f1f5f9" : "rgba(255,255,255,0.08)",
    borde: temaClaro ? "1px solid rgba(100,116,139,0.26)" : "1px solid rgba(255,255,255,0.10)",
    bordeFuerte: temaClaro ? "1px solid rgba(71,85,105,0.34)" : "1px solid rgba(255,255,255,0.16)",
    bordeSutil: temaClaro ? "1px solid rgba(148,163,184,0.34)" : "1px solid rgba(255,255,255,0.08)",
    bordeDashed: temaClaro ? "1px dashed rgba(100,116,139,0.34)" : "1px dashed rgba(255,255,255,0.12)",
    sombra: temaClaro ? "0 12px 28px rgba(15,23,42,0.10)" : "0 12px 28px rgba(0,0,0,0.22)",
    azulActivo: temaClaro ? "#1d4ed8" : "#dbeafe",
    inputScheme: temaClaro ? "light" : "dark",
  };
  const panelSurfaceStyle: React.CSSProperties = {
    ...panelCardStyle,
    background: tema.tarjeta,
    border: tema.borde,
    boxShadow: tema.sombra,
  };
  const controlStyle: React.CSSProperties = {
    width: "100%",
    padding: "11px 12px",
    borderRadius: "13px",
    border: tema.borde,
    background: tema.tarjetaElevada,
    color: tema.texto,
    fontSize: "13px",
    fontWeight: 700,
    outline: "none",
  };
  const optionStyle = { color: "#0f172a", background: "#ffffff" };
  const secondaryButtonStyle: React.CSSProperties = {
    border: tema.borde,
    background: tema.tarjetaElevada,
    color: tema.texto,
  };
  const selectedButtonStyle: React.CSSProperties = {
    border: temaClaro ? "1px solid rgba(37,99,235,0.48)" : "1px solid rgba(96,165,250,0.48)",
    background: temaClaro
      ? "linear-gradient(135deg, rgba(219,234,254,0.95), rgba(191,219,254,0.82))"
      : "linear-gradient(135deg, rgba(59,130,246,0.22), rgba(37,99,235,0.18))",
    color: temaClaro ? "#1e3a8a" : "#eff6ff",
    boxShadow: temaClaro
      ? "0 0 0 1px rgba(37,99,235,0.12), 0 10px 24px rgba(37,99,235,0.12)"
      : "0 0 0 1px rgba(96,165,250,0.18), 0 10px 24px rgba(37,99,235,0.18)",
  };
  const activeToggleStyle: React.CSSProperties = {
    border: temaClaro ? "1px solid rgba(34,197,94,0.45)" : "1px solid rgba(132,204,22,0.42)",
    background: temaClaro
      ? "linear-gradient(135deg, rgba(220,252,231,0.96), rgba(187,247,208,0.78))"
      : "linear-gradient(135deg, rgba(132,204,22,0.22), rgba(34,197,94,0.14))",
    color: temaClaro ? "#14532d" : "#dcfce7",
    boxShadow: temaClaro
      ? "0 10px 22px rgba(34,197,94,0.12)"
      : "0 10px 22px rgba(34,197,94,0.14)",
  };
  const inactiveToggleStyle: React.CSSProperties = {
    border: tema.borde,
    background: tema.tarjetaSuave,
    color: tema.textoSuave,
  };
  const smallStatusStyle = (activo: boolean): React.CSSProperties => ({
    alignSelf: "flex-start",
    padding: "6px 9px",
    borderRadius: "999px",
    border: activo
      ? "1px solid rgba(34,197,94,0.36)"
      : tema.bordeSutil,
    background: activo
      ? "rgba(34,197,94,0.14)"
      : temaClaro
        ? "rgba(100,116,139,0.10)"
        : "rgba(255,255,255,0.05)",
    color: activo ? (temaClaro ? "#166534" : "#bbf7d0") : tema.textoSuave,
    fontSize: "11px",
    fontWeight: 900,
  });
  const salmonBorde = temaClaro ? "rgba(190,99,83,0.46)" : "rgba(251,146,124,0.46)";
  const salmonFondo = temaClaro ? "rgba(254,226,221,0.72)" : "rgba(251,146,124,0.11)";
  const salmonSombra = temaClaro
    ? "0 0 0 3px rgba(251,146,124,0.14), 0 10px 24px rgba(190,99,83,0.10)"
    : "0 0 0 3px rgba(251,146,124,0.13), 0 10px 24px rgba(0,0,0,0.22)";
  const perfilInputStyle = (campo: "nombre" | "cargo"): React.CSSProperties => {
    const activo = campoPerfilActivo === campo;

    return {
      ...controlStyle,
      minHeight: "48px",
      border: activo ? `1px solid ${salmonBorde}` : tema.borde,
      background: activo ? salmonFondo : tema.tarjetaElevada,
      color: tema.texto,
      boxShadow: activo ? salmonSombra : "none",
      transition: "border-color 160ms ease, background 160ms ease, box-shadow 160ms ease",
    };
  };
  const perfilButtonStyle = (
    id: string,
    variant: "salmon" | "neutral" | "primary"
  ): React.CSSProperties => {
    const activo = controlPerfilActivo === id;

    if (variant === "primary") {
      return {
        padding: "13px 16px",
        borderRadius: "14px",
        border: activo ? `1px solid ${salmonBorde}` : "1px solid rgba(132,204,22,0.24)",
        background: activo
          ? (temaClaro
              ? "linear-gradient(135deg, rgba(254,226,221,0.98), rgba(253,186,169,0.82))"
              : "linear-gradient(135deg, rgba(251,146,124,0.22), rgba(34,197,94,0.18))")
          : "linear-gradient(135deg, #84cc16, #22c55e)",
        color: activo ? (temaClaro ? "#7f1d1d" : "#fff7ed") : "#052e16",
        fontSize: "13px",
        fontWeight: 900,
        cursor: "pointer",
        boxShadow: activo ? salmonSombra : "0 10px 22px rgba(132,204,22,0.20)",
        transition: "border-color 160ms ease, background 160ms ease, box-shadow 160ms ease",
      };
    }

    return {
      padding: "12px 14px",
      borderRadius: "14px",
      border: activo ? `1px solid ${salmonBorde}` : tema.borde,
      background: variant === "salmon" || activo ? salmonFondo : tema.tarjetaElevada,
      color: tema.texto,
      fontSize: "13px",
      fontWeight: variant === "salmon" ? 900 : 800,
      cursor: "pointer",
      boxShadow: activo ? salmonSombra : "none",
      transition: "border-color 160ms ease, background 160ms ease, box-shadow 160ms ease",
    };
  };
  const activarControlPerfil = (id: string) => setControlPerfilActivo(id);
  const desactivarControlPerfil = () => setControlPerfilActivo(null);
  const seguimientoFilterLabelStyle: React.CSSProperties = {
    width: "fit-content",
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 8px",
    borderRadius: "8px",
    border: temaClaro ? "1px solid rgba(37,99,235,0.30)" : "1px solid rgba(96,165,250,0.35)",
    background: temaClaro ? "rgba(219,234,254,0.84)" : "rgba(37,99,235,0.28)",
    color: temaClaro ? "#1e3a8a" : "#ffffff",
    fontSize: "11px",
    fontWeight: 850,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    lineHeight: 1,
  };
  const seguimientoChipStyle = (estado: string): React.CSSProperties => {
    if (estado === "Cerrado") {
      return {
        background: "rgba(34,197,94,0.15)",
        border: "1px solid rgba(34,197,94,0.34)",
        color: temaClaro ? "#166534" : "#bbf7d0",
      };
    }

    if (estado === "Vencido") {
      return {
        background: "rgba(239,68,68,0.15)",
        border: "1px solid rgba(239,68,68,0.34)",
        color: temaClaro ? "#991b1b" : "#fecaca",
      };
    }

    if (estado === "En seguimiento") {
      return {
        background: "rgba(59,130,246,0.15)",
        border: "1px solid rgba(59,130,246,0.34)",
        color: temaClaro ? "#1e40af" : "#bfdbfe",
      };
    }

    if (estado === "Evidencia cargada") {
      return {
        background: "rgba(20,184,166,0.15)",
        border: "1px solid rgba(20,184,166,0.34)",
        color: temaClaro ? "#0f766e" : "#99f6e4",
      };
    }

    if (estado === "En revisión") {
      return {
        background: "rgba(168,85,247,0.15)",
        border: "1px solid rgba(168,85,247,0.34)",
        color: temaClaro ? "#6b21a8" : "#e9d5ff",
      };
    }

    if (estado === "Rechazado") {
      return {
        background: "rgba(251,146,124,0.15)",
        border: "1px solid rgba(251,146,124,0.38)",
        color: temaClaro ? "#9a3412" : "#fed7aa",
      };
    }

    if (estado === "Asignado") {
      return {
        background: "rgba(14,165,233,0.13)",
        border: "1px solid rgba(14,165,233,0.30)",
        color: temaClaro ? "#075985" : "#bae6fd",
      };
    }

    return {
      background: temaClaro ? "rgba(245,158,11,0.12)" : "rgba(245,158,11,0.13)",
      border: "1px solid rgba(245,158,11,0.30)",
      color: temaClaro ? "#92400e" : "#fde68a",
    };
  };

	  return (
    <main
      data-panel-theme={temaClaro ? "light" : "dark"}
      style={{
        minHeight: "100vh",
        background: tema.fondo,
        color: tema.texto,
        fontFamily: "Arial, sans-serif",
        padding: "18px",
      }}
    >
      <div
        style={{
          maxWidth: "1720px",
          margin: "0 auto",
        }}
      >
       <header
  style={{
    ...panelSurfaceStyle,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "18px",
    padding: "18px 22px",
    marginBottom: "18px",
  }}
>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "14px",
    }}
  >
    <div
      style={{
        width: "58px",
        height: "58px",
        borderRadius: "16px",
        background: tema.tarjetaElevada,
        border: tema.borde,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 8px 20px rgba(0,0,0,0.18)",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "12px",
          background: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <img
          src={brandingPC && logoEmpresaConfig ? logoEmpresaConfig : "/logo.png"}
          alt={brandingPC ? nombreEmpresaVisible : "Criterio Estratégico"}
          style={{
            width: brandingPC && logoEmpresaConfig ? "40px" : "36px",
            height: brandingPC && logoEmpresaConfig ? "40px" : "36px",
            objectFit: "contain",
            display: "block",
          }}
        />
      </div>
    </div>

    <div>
      <div
        style={{
          fontSize: "12px",
          opacity: 0.75,
          letterSpacing: "1px",
          textTransform: "uppercase",
          marginBottom: "6px",
          fontWeight: 700,
        }}
      >
        {brandingPC ? nombreEmpresaVisible : "Criterio Estratégico"}
      </div>

      <div
        style={{
          fontSize: "30px",
          fontWeight: 900,
          lineHeight: 1.08,
        }}
      >
	        {t("Plataforma Ejecutiva de Hallazgos")}
      </div>
    </div>
  </div>

  <div
    style={{
      textAlign: "right",
      fontSize: "13px",
      opacity: 0.9,
      lineHeight: 1.5,
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      gap: "2px",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "12px",
        fontWeight: 800,
        color: "#bbf7d0",
        marginBottom: "2px",
      }}
    >
      <span
        style={{
          width: "10px",
          height: "10px",
          borderRadius: "999px",
          background: "#67ef48",
          display: "inline-block",
          boxShadow: "0 0 10px rgba(103,239,72,0.65)",
        }}
      />
	      <span>{t("Sistema activo")}</span>
    </div>

	    <div>{t("Sistema inteligente de reportes")}</div>

    <div>
	      {t("Vista activa:")}{" "}
	      {filtroRapido === "HOY"
	        ? t("Hoy")
	        : filtroRapido === "SEMANA"
	        ? t("Esta semana")
	        : filtroRapido === "MES"
	        ? t("Este mes")
	        : t("Personalizado")}
	    </div>

	   <div>{t("Última actualización:")} {ultimaActualizacion}</div>
  </div>
</header>

{mostrarEditorPerfil && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 80,
      background: temaClaro ? "rgba(15,23,42,0.18)" : "rgba(2,6,23,0.62)",
      backdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
    }}
  >
    <div
      style={{
        width: "min(560px, calc(100vw - 32px))",
        maxHeight: "calc(100vh - 48px)",
        overflowY: "auto",
        borderRadius: "24px",
        border: temaClaro ? "1px solid rgba(100,116,139,0.24)" : "1px solid rgba(255,255,255,0.14)",
        background: temaClaro
          ? "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.96))"
          : "linear-gradient(180deg, rgba(15,23,42,0.96), rgba(8,19,36,0.96))",
        boxShadow: temaClaro
          ? "0 28px 70px rgba(15,23,42,0.18)"
          : "0 28px 80px rgba(0,0,0,0.46)",
        padding: "22px",
        display: "grid",
        gap: "18px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "16px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "22px",
              fontWeight: 900,
              color: tema.texto,
              marginBottom: "6px",
            }}
          >
            {t("Editar perfil")}
          </div>
          <div
            style={{
              fontSize: "13px",
              color: tema.textoSuave,
              lineHeight: 1.5,
              maxWidth: "390px",
            }}
          >
            {t("Actualiza los datos visibles del usuario en el panel lateral")}
          </div>
        </div>

        <button
          type="button"
          onClick={salirEditorPerfil}
          onMouseEnter={() => activarControlPerfil("cerrar")}
          onMouseLeave={desactivarControlPerfil}
          onFocus={() => activarControlPerfil("cerrar")}
          onBlur={desactivarControlPerfil}
          style={{
            ...perfilButtonStyle("cerrar", "neutral"),
            width: "42px",
            height: "42px",
            padding: 0,
            flexShrink: 0,
            fontSize: "20px",
            lineHeight: 1,
          }}
          aria-label={t("Cerrar")}
        >
          ×
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "132px 1fr",
          gap: "18px",
          alignItems: "center",
          padding: "16px",
          borderRadius: "20px",
          border: tema.borde,
          background: temaClaro ? "rgba(248,250,252,0.88)" : "rgba(255,255,255,0.045)",
        }}
      >
        <div
          style={{
            display: "grid",
            gap: "8px",
            justifyItems: "center",
          }}
        >
          <div
            style={{
              width: "116px",
              height: "116px",
              borderRadius: "24px",
              border: fotoPerfilDraft ? `1px solid ${salmonBorde}` : tema.borde,
              background: fotoPerfilDraft ? salmonFondo : tema.tarjetaElevada,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              boxShadow: fotoPerfilDraft ? salmonSombra : "0 10px 26px rgba(0,0,0,0.18)",
            }}
          >
            {fotoPerfilDraft ? (
              <img
                src={fotoPerfilDraft}
                alt={t("Foto de perfil")}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            ) : (
              <span
                style={{
                  fontSize: "42px",
                  fontWeight: 900,
                  color: tema.texto,
                }}
              >
                {inicialPerfil}
              </span>
            )}
          </div>
          <div
            style={{
              fontSize: "11px",
              color: tema.textoSuave,
              fontWeight: 800,
            }}
          >
            {t("Foto de perfil")}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gap: "10px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <input
              key={fotoPerfilInputKey}
              id="foto-perfil-panel"
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/svg+xml"
              onChange={(e) => cargarFotoPerfil(e.target.files?.[0])}
              style={{ display: "none" }}
            />
            <label
              htmlFor="foto-perfil-panel"
              onMouseEnter={() => activarControlPerfil("seleccionar-foto")}
              onMouseLeave={desactivarControlPerfil}
              onFocus={() => activarControlPerfil("seleccionar-foto")}
              onBlur={desactivarControlPerfil}
              style={{
                ...perfilButtonStyle("seleccionar-foto", "salmon"),
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {t("Seleccionar foto")}
            </label>
            <button
              type="button"
              onClick={quitarFotoPerfil}
              onMouseEnter={() => activarControlPerfil("quitar-foto")}
              onMouseLeave={desactivarControlPerfil}
              onFocus={() => activarControlPerfil("quitar-foto")}
              onBlur={desactivarControlPerfil}
              style={perfilButtonStyle("quitar-foto", "neutral")}
            >
              {t("Quitar foto")}
            </button>
          </div>
          <div
            style={{
              fontSize: "12px",
              color: tema.textoSuave,
              lineHeight: 1.45,
              fontWeight: 700,
            }}
          >
            {fotoPerfilCargada
              ? t("Foto cargada correctamente")
              : t("Los cambios se guardan en este navegador")}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gap: "14px" }}>
        <label style={{ display: "grid", gap: "7px" }}>
          <span
            style={{
              fontSize: "12px",
              color: tema.textoSuave,
              fontWeight: 900,
            }}
          >
            {t("Nombre")}
          </span>
          <input
            value={nombrePerfilDraft}
            onChange={(e) => setNombrePerfilDraft(e.target.value)}
            onFocus={() => setCampoPerfilActivo("nombre")}
            onBlur={() => setCampoPerfilActivo(null)}
            onMouseEnter={() => setCampoPerfilActivo("nombre")}
            onMouseLeave={() => setCampoPerfilActivo(null)}
            style={perfilInputStyle("nombre")}
            placeholder="Freddy Camus"
          />
        </label>

        <label style={{ display: "grid", gap: "7px" }}>
          <span
            style={{
              fontSize: "12px",
              color: tema.textoSuave,
              fontWeight: 900,
            }}
          >
            {t("Cargo")}
          </span>
          <input
            value={cargoPerfilDraft}
            onChange={(e) => setCargoPerfilDraft(e.target.value)}
            onFocus={() => setCampoPerfilActivo("cargo")}
            onBlur={() => setCampoPerfilActivo(null)}
            onMouseEnter={() => setCampoPerfilActivo("cargo")}
            onMouseLeave={() => setCampoPerfilActivo(null)}
            style={perfilInputStyle("cargo")}
            placeholder="Ingeniero en Prevención de Riesgos"
          />
        </label>
      </div>

      {guardadoPerfil && (
        <div
          style={{
            padding: "12px 14px",
            borderRadius: "14px",
            background: "rgba(34,197,94,0.14)",
            border: "1px solid rgba(34,197,94,0.34)",
            color: temaClaro ? "#166534" : "#bbf7d0",
            fontSize: "13px",
            fontWeight: 850,
            textAlign: "center",
          }}
        >
          {t("Perfil actualizado correctamente")}
        </div>
      )}

      {errorPerfil && (
        <div
          style={{
            padding: "12px 14px",
            borderRadius: "14px",
            background: "rgba(190,99,83,0.14)",
            border: `1px solid ${salmonBorde}`,
            color: temaClaro ? "#7f1d1d" : "#fecaca",
            fontSize: "13px",
            fontWeight: 850,
            textAlign: "center",
          }}
        >
          {t(errorPerfil)}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={salirEditorPerfil}
          onMouseEnter={() => activarControlPerfil("salir")}
          onMouseLeave={desactivarControlPerfil}
          onFocus={() => activarControlPerfil("salir")}
          onBlur={desactivarControlPerfil}
          style={perfilButtonStyle("salir", "neutral")}
        >
          {t("Salir")}
        </button>
        <button
          type="button"
          onClick={guardarPerfil}
          onMouseEnter={() => activarControlPerfil("guardar")}
          onMouseLeave={desactivarControlPerfil}
          onFocus={() => activarControlPerfil("guardar")}
          onBlur={desactivarControlPerfil}
          style={perfilButtonStyle("guardar", "primary")}
        >
          {t("Guardar perfil")}
        </button>
      </div>
    </div>
  </div>
)}

{mostrarGestionCierre && hallazgoSeguimientoActivo && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 85,
      background: temaClaro ? "rgba(15,23,42,0.18)" : "rgba(2,6,23,0.62)",
      backdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
    }}
  >
    <div
      style={{
        width: "min(760px, calc(100vw - 32px))",
        maxHeight: "calc(100vh - 48px)",
        overflowY: "auto",
        borderRadius: "24px",
        border: tema.bordeFuerte,
        background: temaClaro
          ? "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.96))"
          : "linear-gradient(180deg, rgba(15,23,42,0.96), rgba(8,19,36,0.96))",
        boxShadow: temaClaro
          ? "0 28px 70px rgba(15,23,42,0.18)"
          : "0 28px 80px rgba(0,0,0,0.46)",
        padding: "22px",
        display: "grid",
        gap: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "16px",
          alignItems: "flex-start",
        }}
      >
        <div>
          <div style={{ fontSize: "22px", fontWeight: 900, marginBottom: "5px" }}>
            {t("Gestionar cierre")} · {hallazgoSeguimientoActivo.codigo}
          </div>
          <div style={{ color: tema.textoSuave, fontSize: "13px", lineHeight: 1.5 }}>
            {t("El reportante no se asume automáticamente como responsable de corrección. El seguimiento puede ser asignado a un supervisor o usuario autorizado.")}
          </div>
          <div
            style={{
              marginTop: "10px",
              padding: "9px 11px",
              borderRadius: "12px",
              border: temaClaro ? "1px solid rgba(37,99,235,0.24)" : "1px solid rgba(96,165,250,0.24)",
              background: temaClaro ? "rgba(219,234,254,0.58)" : "rgba(37,99,235,0.12)",
              color: temaClaro ? "#1e3a8a" : "#dbeafe",
              fontSize: "12px",
              fontWeight: 800,
              lineHeight: 1.45,
            }}
          >
            {t("Los datos pueden ser preasignados desde la app móvil por el supervisor y ajustados desde la plataforma PC. Todo cambio debe quedar registrado en bitácora.")}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMostrarGestionCierre(false)}
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "14px",
            ...secondaryButtonStyle,
            fontSize: "20px",
            fontWeight: 900,
            cursor: "pointer",
          }}
          aria-label={t("Cerrar")}
        >
          ×
        </button>
      </div>

      <div
        style={{
          padding: "16px",
          borderRadius: "18px",
          border: tema.borde,
          background: tema.tarjetaSuave,
          display: "grid",
          gap: "12px",
        }}
      >
        <div style={{ fontSize: "14px", fontWeight: 900 }}>{t("Asignación")}</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "10px",
          }}
        >
          <label style={{ display: "grid", gap: "6px" }}>
            <span style={{ fontSize: "11px", color: tema.textoSuave, fontWeight: 900 }}>
              {t("Tipo de responsable de corrección")}
            </span>
            <select
              value={gestionCierreDraft.responsableCorreccionTipo}
              onChange={(e) =>
                setGestionCierreDraft((actual) => ({
                  ...actual,
                  responsableCorreccionTipo: e.target.value,
                }))
              }
              style={{ ...controlStyle, cursor: "pointer" }}
            >
              {opcionesTipoResponsableCorreccion.map((opcion) => (
                <option key={opcion} value={opcion} style={optionStyle}>
                  {t(opcion)}
                </option>
              ))}
            </select>
          </label>

          {[
            ["responsableCorreccionEmpresa", t("Empresa responsable")],
            ["responsableCorreccionNombre", t("Nombre responsable")],
            ["responsableCorreccionCargo", t("Cargo")],
            ["responsableCorreccionTelefono", t("Teléfono")],
            ["encargadoSeguimientoNombre", t("Encargado de seguimiento")],
          ].map(([campo, label]) => (
            <label key={campo} style={{ display: "grid", gap: "6px" }}>
              <span style={{ fontSize: "11px", color: tema.textoSuave, fontWeight: 900 }}>
                {label}
              </span>
              <input
                value={String(gestionCierreDraft[campo as keyof GestionCierreDraft] || "")}
                onChange={(e) =>
                  setGestionCierreDraft((actual) => ({
                    ...actual,
                    [campo]: e.target.value,
                  }))
                }
                style={controlStyle}
              />
            </label>
          ))}
        </div>
      </div>

      <div
        style={{
          padding: "16px",
          borderRadius: "18px",
          border: tema.borde,
          background: tema.tarjetaSuave,
          display: "grid",
          gap: "12px",
        }}
      >
        <div style={{ fontSize: "14px", fontWeight: 900 }}>{t("Corrección requerida")}</div>
        <label style={{ display: "grid", gap: "6px" }}>
          <span style={{ fontSize: "11px", color: tema.textoSuave, fontWeight: 900 }}>
            {t("Acción correctiva requerida")}
          </span>
          <textarea
            value={gestionCierreDraft.accionCorrectivaRequerida}
            onChange={(e) =>
              setGestionCierreDraft((actual) => ({
                ...actual,
                accionCorrectivaRequerida: e.target.value,
              }))
            }
            style={{
              ...controlStyle,
              minHeight: "92px",
              resize: "vertical",
              lineHeight: 1.45,
            }}
          />
        </label>

        <div style={{ display: "grid", gap: "8px" }}>
          <div style={{ fontSize: "11px", color: tema.textoSuave, fontWeight: 900 }}>
            {t("Evidencia requerida")}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "8px",
            }}
          >
            {opcionesEvidenciaRequerida.map((evidencia) => {
              const activo = gestionCierreDraft.evidenciaRequerida.includes(evidencia);
              return (
                <button
                  key={evidencia}
                  type="button"
                  onClick={() => alternarEvidenciaGestion(evidencia)}
                  style={{
                    minHeight: "42px",
                    padding: "9px 10px",
                    borderRadius: "13px",
                    ...(activo
                      ? {
                          border: temaClaro
                            ? "1px solid rgba(37,99,235,0.70)"
                            : "1px solid rgba(147,197,253,0.72)",
                          background: temaClaro
                            ? "linear-gradient(135deg, rgba(219,234,254,1), rgba(191,219,254,0.90))"
                            : "linear-gradient(135deg, rgba(59,130,246,0.32), rgba(37,99,235,0.22))",
                          color: temaClaro ? "#1e3a8a" : "#eff6ff",
                          boxShadow: temaClaro
                            ? "0 8px 18px rgba(37,99,235,0.14)"
                            : "0 8px 18px rgba(37,99,235,0.20)",
                        }
                      : secondaryButtonStyle),
                    fontSize: "11px",
                    fontWeight: 850,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  {activo ? "✓ " : ""}
                  {t(evidencia)}
                </button>
              );
            })}
          </div>
        </div>

        <label style={{ display: "grid", gap: "6px" }}>
          <span style={{ fontSize: "11px", color: tema.textoSuave, fontWeight: 900 }}>
            {t("Fecha compromiso")}
          </span>
          <input
            type="date"
            value={gestionCierreDraft.responsableCierreFechaCompromiso}
            onChange={(e) =>
              setGestionCierreDraft((actual) => ({
                ...actual,
                responsableCierreFechaCompromiso: e.target.value,
              }))
            }
            style={{ ...controlStyle, colorScheme: tema.inputScheme }}
          />
        </label>
        <label style={{ display: "grid", gap: "6px" }}>
          <span style={{ fontSize: "11px", color: tema.textoSuave, fontWeight: 900 }}>
            {t("Estado seguimiento")}
          </span>
          <select
            value={gestionCierreDraft.estadoSeguimiento}
            onChange={(e) =>
              setGestionCierreDraft((actual) => ({
                ...actual,
                estadoSeguimiento: e.target.value,
              }))
            }
            style={{ ...controlStyle, cursor: "pointer" }}
          >
            {opcionesEstadoSeguimientoGestion.map((opcion) => (
              <option key={opcion} value={opcion} style={optionStyle}>
                {t(opcion)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div
        style={{
          padding: "16px",
          borderRadius: "18px",
          border: tema.borde,
          background: tema.tarjetaSuave,
          display: "grid",
          gap: "12px",
        }}
      >
        <div style={{ fontSize: "14px", fontWeight: 900 }}>{t("Validación")}</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
          }}
        >
          <label style={{ display: "grid", gap: "6px" }}>
            <span style={{ fontSize: "11px", color: tema.textoSuave, fontWeight: 900 }}>
              {t("Validador de cierre")}
            </span>
            <select
              value={gestionCierreDraft.validadorCierreNombre}
              onChange={(e) =>
                setGestionCierreDraft((actual) => ({
                  ...actual,
                  validadorCierreNombre: e.target.value,
                }))
              }
              style={{ ...controlStyle, cursor: "pointer" }}
            >
              <option value="" style={optionStyle}>
                {t("Seleccionar validador")}
              </option>
              {opcionesValidadorCierre.map((opcion) => (
                <option key={opcion} value={opcion} style={optionStyle}>
                  {t(opcion)}
                </option>
              ))}
            </select>
            <span style={{ fontSize: "11px", color: tema.textoSuave, fontWeight: 700, lineHeight: 1.35 }}>
              {t("El validador revisa la evidencia y aprueba o rechaza el cierre definitivo.")}
            </span>
          </label>
          <label style={{ display: "grid", gap: "6px" }}>
            <span style={{ fontSize: "11px", color: tema.textoSuave, fontWeight: 900 }}>
              {t("Estado de validación")}
            </span>
            <select
              value={gestionCierreDraft.validadorCierreEstado}
              onChange={(e) =>
                setGestionCierreDraft((actual) => ({
                  ...actual,
                  validadorCierreEstado: e.target.value,
                }))
              }
              style={{ ...controlStyle, cursor: "pointer" }}
            >
              {opcionesEstadoValidacion.map((opcion) => (
                <option key={opcion} value={opcion} style={optionStyle}>
                  {t(opcion)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label style={{ display: "grid", gap: "6px" }}>
          <span style={{ fontSize: "11px", color: tema.textoSuave, fontWeight: 900 }}>
            {t("Observación de validación")}
          </span>
          <textarea
            value={gestionCierreDraft.validadorCierreObservacion}
            onChange={(e) =>
              setGestionCierreDraft((actual) => ({
                ...actual,
                validadorCierreObservacion: e.target.value,
              }))
            }
            style={{
              ...controlStyle,
              minHeight: "82px",
              resize: "vertical",
              lineHeight: 1.45,
            }}
          />
        </label>
      </div>

      {errorGestionCierre && (
        <div
          style={{
            padding: "12px 14px",
            borderRadius: "14px",
            background: "rgba(190,99,83,0.14)",
            border: "1px solid rgba(251,146,124,0.38)",
            color: temaClaro ? "#7f1d1d" : "#fecaca",
            fontSize: "13px",
            fontWeight: 850,
            textAlign: "center",
          }}
        >
          {t(errorGestionCierre)}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={() => setMostrarGestionCierre(false)}
          style={perfilButtonStyle("cancelar-gestion", "neutral")}
        >
          {t("Cancelar")}
        </button>
        <button
          type="button"
          onClick={guardarGestionCierre}
          style={perfilButtonStyle("guardar-gestion", "primary")}
        >
          {t("Guardar cambios")}
        </button>
      </div>
    </div>
  </div>
)}

{filtrosActivos.length > 0 && (
  <div
    style={{
      ...panelSurfaceStyle,
      padding: "12px 16px",
      marginBottom: "18px",
      display: "flex",
      flexWrap: "wrap",
      gap: "8px",
      alignItems: "center",
    }}
  >
    <div
      style={{
        fontSize: "12px",
        fontWeight: 800,
        opacity: 0.78,
        marginRight: "4px",
      }}
    >
	      {t("Filtros activos:")}
    </div>

   {filtrosActivos.map((filtro) => (
  <button
    key={filtro}
    onClick={() => quitarFiltro(filtro)}
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: "7px 11px",
      borderRadius: "999px",
	      background: temaClaro ? "rgba(219,234,254,0.90)" : "rgba(59,130,246,0.16)",
	      border: "1px solid rgba(59,130,246,0.28)",
	      color: temaClaro ? "#1e3a8a" : "#dbeafe",
      fontSize: "12px",
      fontWeight: 700,
      lineHeight: 1,
      cursor: "pointer",
    }}
  >
    <span>{filtro}</span>
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "16px",
        height: "16px",
        borderRadius: "999px",
	        background: temaClaro ? "rgba(37,99,235,0.12)" : "rgba(255,255,255,0.14)",
        fontSize: "11px",
        fontWeight: 900,
      }}
    >
      ×
    </span>
  </button>
))}
  </div>
)}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "240px minmax(0, 1fr) 300px",
            gap: "18px",
            alignItems: "stretch",
          }}
        >
         <aside
  style={{
    ...panelSurfaceStyle,
    padding: "16px",
    minHeight: "760px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  }}
>
<div
  style={{
    padding: "20px",
    minHeight: "220px",
    borderRadius: "18px",
	    background: tema.tarjetaSuave,
	    border: tema.borde,
  }}
>
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    }}
  >
    <div
      style={{
        display: "grid",
        gap: "6px",
      }}
    >
      <div
        style={{
          fontSize: "14px",
          fontWeight: 800,
          lineHeight: 1.15,
          whiteSpace: "normal",
        }}
      >
        {usuario.nombre}
      </div>

      <div
        style={{
          fontSize: "11px",
          opacity: 0.78,
          lineHeight: 1.2,
          whiteSpace: "normal",
        }}
      >
        {usuario.cargo}
      </div>
    </div>

    <div
      style={{
  display: "grid",
  gridTemplateColumns: "76px 76px",
  justifyContent: "center",
  gap: "14px",
  alignItems: "center",
}}
    >
      <div
        style={{
          width: "84px",
          height: "84px",
          borderRadius: "16px",
	          background: tema.tarjetaElevada,
	          border: tema.borde,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          flexShrink: 0,
          boxShadow: "0 8px 20px rgba(0,0,0,0.22)",
          cursor: "default",
        }}
      >
        {usuario.foto ? (
          <img
            src={usuario.foto}
            alt={usuario.nombre}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <span
            style={{
              fontSize: "30px",
              fontWeight: 900,
	          color: tema.texto,
              lineHeight: 1,
            }}
          >
            {inicialUsuario}
          </span>
        )}
      </div>

      <button
  type="button"
  onClick={() => setMostrarNotificaciones((prev) => !prev)}
  style={{
    position: "relative",
    width: "76px",
    height: "76px",
    borderRadius: "18px",
	    background: tema.tarjetaElevada,
	    border: tema.borde,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: 0,
    flexShrink: 0,
    boxShadow: "0 8px 20px rgba(0,0,0,0.22)",
  }}
>
  <svg
    width="30"
    height="30"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15 17H9M18 17V11C18 8.23858 15.7614 6 13 6H11C8.23858 6 6 8.23858 6 11V17L4 19V20H20V19L18 17ZM13.73 20C13.5542 20.3031 13.3018 20.5542 12.9978 20.7285C12.6938 20.9028 12.3495 20.9942 12 20.9934C11.6505 20.9942 11.3062 20.9028 11.0022 20.7285C10.6982 20.5542 10.4458 20.3031 10.27 20"
	      stroke={tema.texto}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>

  {totalNotificacionesNoLeidas > 0 && (
  <span
    style={{
      position: "absolute",
      top: "-10px",
      right: "-10px",
      minWidth: "40px",
      height: "40px",
      padding: "0 10px",
      borderRadius: "999px",
      background: "#ff4d4f",
	      color: "#ffffff",
      fontSize: "18px",
      fontWeight: 800,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "2px solid #1a2742",
      boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
    }}
  >
    {totalNotificacionesNoLeidas}
  </span>
)}
</button>
    </div>

    <button
      type="button"
      onClick={abrirEditorPerfil}
      style={{
        width: "100%",
        padding: "12px 16px",
        borderRadius: "14px",
        border: "1px solid #2f6bff",
        background: "linear-gradient(180deg, #2f80ff 0%, #1d5eff 100%)",
	      color: "#ffffff",
        fontSize: "13px",
        fontWeight: 800,
        cursor: "pointer",
        boxShadow: "0 8px 18px rgba(29,94,255,0.35)",
      }}
    >
	      {t("Editar perfil")}
    </button>

    {guardadoPerfil && !mostrarEditorPerfil && (
      <div
        style={{
          padding: "10px 12px",
          borderRadius: "14px",
          background: "rgba(34,197,94,0.14)",
          border: "1px solid rgba(34,197,94,0.34)",
          color: temaClaro ? "#166534" : "#bbf7d0",
          fontSize: "12px",
          fontWeight: 800,
          lineHeight: 1.35,
          textAlign: "center",
        }}
      >
        {t("Perfil actualizado correctamente")}
      </div>
    )}

    {mostrarNotificaciones && (
      <div
        style={{
          padding: "12px",
          borderRadius: "16px",
	          background: tema.tarjetaSuave,
	          border: tema.borde,
          display: "grid",
          gap: "10px",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            fontWeight: 800,
          }}
        >
	          {t("Notificaciones")}
        </div>

        {notificaciones.length === 0 ? (
          <div
            style={{
              fontSize: "12px",
              opacity: 0.72,
            }}
          >
	            {t("Sin notificaciones por ahora")}
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gap: "10px",
            }}
          >
            {notificaciones.map((item, index) => (
              <button
                key={index}
                type="button"
                style={{
                  padding: "12px",
                  borderRadius: "14px",
	                  background: tema.tarjetaElevada,
	                  border: tema.borde,
                  display: "grid",
                  gap: "6px",
                  cursor: "pointer",
                  appearance: "none",
                  WebkitAppearance: "none",
                  MozAppearance: "none",
	                  color: tema.texto,
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    lineHeight: 1.3,
                  }}
                >
                  {item.mensaje}
                </div>

                <div
                  style={{
                    fontSize: "11px",
                    opacity: 0.68,
                  }}
                >
                  {item.fechaHora}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    )}
  </div>
</div>
     <div
  style={{
    fontSize: "15px",
    fontWeight: 800,
    marginBottom: "12px",
  }}
>
	  {t("Reportes rápidos")}
</div>

   <div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
  }}
>
  {[
	    { label: t("Hoy"), value: "HOY" as const },
	    { label: t("Esta semana"), value: "SEMANA" as const },
	    { label: t("Este mes"), value: "MES" as const },
	    { label: t("Personalizado"), value: "PERSONALIZADO" as const },
  ].map((item) => {
    const activo = filtroRapido === item.value;

    return (
      <button
        key={item.value}
       onClick={() => aplicarFiltroRapido(item.value)}
       
style={{
  minHeight: "72px",
  padding: "12px 10px",
  borderRadius: "16px",
	  border: activo
	    ? "1px solid rgba(103,239,72,0.40)"
	    : tema.borde,
  background: activo
    ? "linear-gradient(180deg, rgba(103,239,72,0.18) 0%, rgba(215,255,57,0.10) 100%)"
	    : tema.tarjetaElevada,
	  color: activo ? (temaClaro ? "#14532d" : "white") : tema.texto,
  fontSize: "12px",
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: activo ? "0 8px 18px rgba(109,255,72,0.14)" : "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
}}
      >
        {item.label}
      </button>
    );
  })}
</div>

  <div
    style={{
      flex: 1,
      padding: "14px",
      borderRadius: "18px",
	      background: tema.tarjetaSuave,
	      border: tema.borde,
      display: "flex",
      flexDirection: "column",
    }}
  >
    <div
      style={{
        fontSize: "15px",
        fontWeight: 800,
        marginBottom: "12px",
      }}
    >
	      {t("Filtros")}
    </div>

    {[
	      "Empresa",
	      "Obra / Proyecto",
	      "Fecha desde",
	      "Fecha hasta",
	      "Estado",
	      "Criticidad",
	      "Tipo de hallazgo",
   ].map((label) => (
  <div key={label}>
    <div
      style={{
        fontSize: "11px",
        opacity: 0.7,
        marginBottom: "6px",
        fontWeight: 700,
      }}
    >
	      {t(label)}
    </div>

   {label === "Empresa" ? (
  <select
    value={filtroEmpresa}
    onChange={(e) => setFiltroEmpresa(e.target.value)}
	    style={{
	      ...controlStyle,
	      appearance: "none",
	      WebkitAppearance: "none",
	      MozAppearance: "none",
      cursor: "pointer",
    }}
  >
    {opcionesEmpresa.map((empresa) => (
      <option
        key={empresa}
        value={empresa}
	        style={optionStyle}
      >
	        {textoOpcion(empresa)}
      </option>
    ))}
  </select>
) : label === "Obra / Proyecto" ? (
  <select
    value={filtroObra}
    onChange={(e) => setFiltroObra(e.target.value)}
	    style={{
	      ...controlStyle,
	      appearance: "none",
	      WebkitAppearance: "none",
	      MozAppearance: "none",
      cursor: "pointer",
    }}
  >
    {opcionesObra.map((obra) => (
      <option
        key={obra}
        value={obra}
	        style={optionStyle}
      >
	        {textoOpcion(obra)}
      </option>
    ))}
  </select>
) : label === "Estado" ? (
  <select
    value={filtroEstado}
    onChange={(e) => setFiltroEstado(e.target.value)}
	    style={{
	      ...controlStyle,
	      appearance: "none",
	      WebkitAppearance: "none",
	      MozAppearance: "none",
      cursor: "pointer",
    }}
  >
    {opcionesEstado.map((estado) => (
      <option
        key={estado}
        value={estado}
	        style={optionStyle}
      >
	        {textoOpcion(estado)}
      </option>
    ))}
  </select>
) : label === "Fecha desde" ? (
  <input
    type="date"
    value={filtroFechaDesde}
   onChange={(e) => {
  setFiltroRapido("PERSONALIZADO");
  setFiltroFechaDesde(e.target.value);
}}
	    style={{
	      ...controlStyle,
	      colorScheme: tema.inputScheme,
    }}
  />
) : label === "Fecha hasta" ? (
  <input
    type="date"
    value={filtroFechaHasta}
   onChange={(e) => {
  setFiltroRapido("PERSONALIZADO");
  setFiltroFechaHasta(e.target.value);
}}
	    style={{
	      ...controlStyle,
	      colorScheme: tema.inputScheme,
    }}
  />
) : label === "Criticidad" ? (
  <select
    value={filtroCriticidad}
    onChange={(e) => setFiltroCriticidad(e.target.value)}
	    style={{
	      ...controlStyle,
	      appearance: "none",
	      WebkitAppearance: "none",
	      MozAppearance: "none",
      cursor: "pointer",
    }}
  >
    {opcionesCriticidad.map((criticidad) => (
      <option
        key={criticidad}
        value={criticidad}
	        style={optionStyle}
      >
	        {textoOpcion(criticidad)}
      </option>
    ))}
  </select>
) : label === "Tipo de hallazgo" ? (
  <select
    value={filtroTipoHallazgo}
    onChange={(e) => setFiltroTipoHallazgo(e.target.value)}
	    style={{
	      ...controlStyle,
	      appearance: "none",
	      WebkitAppearance: "none",
	      MozAppearance: "none",
      cursor: "pointer",
    }}
  >
    {opcionesTipoHallazgo.map((tipo) => (
      <option
        key={tipo}
        value={tipo}
	        style={optionStyle}
      >
	        {textoOpcion(tipo)}
      </option>
    ))}
  </select>
) : (
  <div
    style={{
      padding: "11px 12px",
      borderRadius: "13px",
	      background: tema.tarjetaElevada,
	      border: tema.borde,
      fontSize: "13px",
	      color: tema.textoSuave,
    }}
  >
	    {t("Seleccionar")}
  </div>
)}
  </div>
))}

    <button
    onClick={limpiarFiltros}
      style={{
        width: "100%",
        marginTop: "8px",
        padding: "13px",
        borderRadius: "14px",
        border: "none",
        cursor: "pointer",
        fontWeight: 800,
        fontSize: "14px",
        color: "#0b2b13",
        background: "linear-gradient(180deg, #67ef48 0%, #d7ff39 100%)",
        boxShadow: "0 10px 22px rgba(109,255,72,0.22)",
      }}
    >
	      {t("Limpiar filtros")}
    </button>
  </div>

  <div
    style={{
      padding: "14px",
      borderRadius: "18px",
	      background: tema.tarjetaSuave,
	      border: tema.borde,
    }}
  >
    <div
      style={{
        fontSize: "15px",
        fontWeight: 800,
        marginBottom: "12px",
      }}
    >
	      {t("Acceso rápido")}
    </div>

    <div style={{ display: "grid", gap: "8px" }}>
	     {["Exportar a Excel", "Generar informe empresa/obra", "Seguimiento de cierre", "Configuración"].map((item) => (
     <button
  key={item}
  onClick={() => {
   if (item === "Exportar a Excel") {
  exportarExcel();
  return;
}

if (item === "Generar informe empresa/obra") {
  generarInformeEmpresaObra();
  return;
}

if (item === "Seguimiento de cierre") {
  setVistaPrincipal("seguimiento");
  setVistaDerecha("seguimiento");
  return;
}

if (item === "Configuración") {
  if (vistaPrincipal === "configuracion") {
    setVistaPrincipal("panel");
    setVistaDerecha("informe");
  } else {
    setVistaPrincipal("configuracion");
    setVistaDerecha("configuracion");
  }
  return;
}
}}
style={{
    width: "100%",
    minHeight: "50px",
    padding: "14px 14px",
    borderRadius: "14px",
	    border: item === "Seguimiento de cierre"
	      ? "1px solid rgba(251,146,124,0.42)"
	      : tema.borde,
	    background: item === "Seguimiento de cierre"
	      ? "linear-gradient(135deg, rgba(190,99,83,0.94), rgba(127,29,29,0.84))"
	      : tema.tarjetaElevada,
	    color: item === "Seguimiento de cierre" ? "#fff7ed" : tema.texto,
    fontSize: "13px",
    fontWeight: item === "Seguimiento de cierre" ? 900 : 700,
    textAlign: "left",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: item === "Seguimiento de cierre"
      ? "0 10px 22px rgba(190,99,83,0.20)"
      : "none",
    transition: "background 160ms ease, border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease",
  }}
  onMouseEnter={(e) => {
    if (item !== "Seguimiento de cierre") return;
    e.currentTarget.style.background = "linear-gradient(135deg, rgba(220,110,92,0.98), rgba(153,45,34,0.90))";
    e.currentTarget.style.boxShadow = "0 12px 26px rgba(220,110,92,0.26)";
  }}
  onMouseLeave={(e) => {
    if (item !== "Seguimiento de cierre") return;
    e.currentTarget.style.background = "linear-gradient(135deg, rgba(190,99,83,0.94), rgba(127,29,29,0.84))";
    e.currentTarget.style.boxShadow = "0 10px 22px rgba(190,99,83,0.20)";
  }}
  onFocus={(e) => {
    if (item !== "Seguimiento de cierre") return;
    e.currentTarget.style.borderColor = "rgba(253,186,116,0.70)";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(251,146,124,0.18), 0 12px 26px rgba(220,110,92,0.24)";
  }}
  onBlur={(e) => {
    if (item !== "Seguimiento de cierre") return;
    e.currentTarget.style.borderColor = "rgba(251,146,124,0.42)";
    e.currentTarget.style.boxShadow = "0 10px 22px rgba(190,99,83,0.20)";
  }}
>
	  <span>{t(item)}</span>
    {item === "Seguimiento de cierre" && (
      <span
        style={{
          fontSize: "14px",
          lineHeight: 1,
          opacity: 0.92,
        }}
      >
        ↗
      </span>
    )}
</button>
      ))}
    </div>
  </div>
</aside>
          <section
            style={{
              minHeight: "760px",
              display: vistaPrincipal === "panel" ? "grid" : "none",
              gridTemplateRows: "auto auto 1fr",
              gap: "18px",
            }}
          >
            <div
              style={{
                display: "grid",
               gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                gap: "12px",
              }}
            >
              {kpis.map((kpi) => (
	                <div
	                  key={kpi.id}
	                  style={{
  borderRadius: "22px",
  background: tema.tarjeta,
  borderTop: tema.bordeSutil,
  borderRight: tema.bordeSutil,
  borderBottom: tema.bordeSutil,
  borderLeft:
    kpi.id === "historico-total" ? "4px solid #ef4444" : tema.bordeSutil,
  boxShadow: tema.sombra,
  backdropFilter: "blur(6px)",
	  padding: "14px 14px 16px 14px",
	  minHeight: "94px",
	  display: "flex",
	  flexDirection: "column",
	  justifyContent: "space-between",
}}
                >
                  <div
                    style={{
                      fontSize: "11px",
                      opacity: 0.74,
                      textTransform: "uppercase",
                      letterSpacing: "0.8px",
                      fontWeight: 800,
                      lineHeight: 1.2,
                    }}
                  >
                    {kpi.titulo}
                  </div>

                  <div
                    style={{
                      fontSize: "38px",
                      fontWeight: 900,
                      lineHeight: 1,
                      color: kpi.color,
                    }}
                  >
	                   {kpi.id === "historico-total"
	  ? contadorHistoricoAnimado.toLocaleString("es-CL")
	  : kpi.valor}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <div
                style={{
                  ...panelSurfaceStyle,
                  padding: "16px",
                  minHeight: "152px",
                }}
              >
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 800,
                    marginBottom: "4px",
                  }}
                >
	                  {t("Reportes por empresa")}
                </div>

                <div
                  style={{
                    fontSize: "12px",
                    opacity: 0.7,
                    marginBottom: "12px",
                  }}
                >
	                  {t("Gráfico ejecutivo")}
                </div>
                <div
  style={{
    minHeight: "120px",
    borderRadius: "16px",
	    background: tema.tarjetaSuave,
	    border: tema.bordeDashed,
    padding: "14px",
    display: "grid",
    gap: "10px",
  }}
>
  {reportesPorEmpresa.length === 0 ? (
    <div
      style={{
        fontSize: "13px",
	        color: tema.textoSuave,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "90px",
        textAlign: "center",
      }}
    >
	      {t("Sin datos por empresa para el filtro activo.")}
    </div>
  ) : (
    reportesPorEmpresa.map((item) => {
      const maximo = Math.max(...reportesPorEmpresa.map((r) => r.total));
      const ancho = maximo > 0 ? `${(item.total / maximo) * 100}%` : "0%";

      return (
        <div key={item.empresa}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "6px",
              fontSize: "12px",
              fontWeight: 700,
            }}
          >
	            <span>{t(item.empresa)}</span>
            <span>{item.total}</span>
          </div>

          <div
            style={{
              height: "10px",
              borderRadius: "999px",
	              background: temaClaro ? "rgba(148,163,184,0.20)" : "rgba(255,255,255,0.08)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: ancho,
                height: "100%",
                borderRadius: "999px",
                background:
                  "linear-gradient(90deg, rgba(59,130,246,0.95) 0%, rgba(103,239,72,0.85) 100%)",
              }}
            />
          </div>
        </div>
      );
    })
  )}
</div>

               <div
  style={{
    minHeight: "110px",
    borderRadius: "16px",
	    background: tema.tarjetaSuave,
	    border: tema.bordeDashed,
    padding: "14px 12px 10px",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: "10px",
  }}
>
  {evolucionDiaria.length === 0 ? (
    <div
      style={{
        width: "100%",
        textAlign: "center",
        fontSize: "13px",
	        color: tema.textoSuave,
      }}
    >
	      {t("Sin evolución diaria para el filtro activo.")}
    </div>
  ) : (
    evolucionDiaria.map((item) => {
      const maximo = Math.max(...evolucionDiaria.map((d) => d.total), 1);
      const altura = `${Math.max((item.total / maximo) * 72, item.total > 0 ? 16 : 6)}px`;

      return (
        <div
          key={item.etiqueta}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "8px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: 800,
	              color: tema.textoMedio,
              lineHeight: 1,
            }}
          >
            {item.total}
          </div>

          <div
            style={{
              width: "100%",
              maxWidth: "28px",
              height: altura,
              borderRadius: "999px 999px 10px 10px",
              background:
                "linear-gradient(180deg, rgba(59,130,246,0.95) 0%, rgba(103,239,72,0.88) 100%)",
              boxShadow: "0 8px 18px rgba(59,130,246,0.18)",
            }}
          />

          <div
            style={{
              fontSize: "11px",
              fontWeight: 700,
              opacity: 0.72,
              lineHeight: 1,
            }}
          >
            {item.etiqueta}
          </div>
        </div>
      );
    })
  )}
</div>
              </div>

              <div
                style={{
                  ...panelSurfaceStyle,
                  padding: "16px",
                  minHeight: "152px",
                }}
              >
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 800,
                    marginBottom: "4px",
                  }}
                >
	                  {t("Estado general")}
                </div>

                <div
                  style={{
                    fontSize: "12px",
                    opacity: 0.7,
                    marginBottom: "12px",
                  }}
                >
	                  {t("Distribución de abiertos, cerrados y críticos")}
                </div>

<div
  style={{
    minHeight: "240px",
    borderRadius: "16px",
	    background: tema.tarjetaSuave,
	    border: tema.bordeDashed,
    padding: "14px",
    display: "grid",
    gap: "14px",
  }}
>
  {totalCriticidad === 0 ? (
    <div
      style={{
        fontSize: "13px",
	        color: tema.textoSuave,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "90px",
        textAlign: "center",
      }}
    >
	      {t("Sin datos para criticidad en el filtro activo.")}
    </div>
  ) : (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "130px 1fr",
        gap: "16px",
        alignItems: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "120px",
          height: "120px",
          borderRadius: "999px",
          background: (() => {
            const crit = criticidadResumen[0].total;
            const alto = criticidadResumen[1].total;
            const medio = criticidadResumen[2].total;
            const bajo = criticidadResumen[3].total;
            const total = Math.max(totalCriticidad, 1);

            const a1 = (crit / total) * 360;
            const a2 = a1 + (alto / total) * 360;
            const a3 = a2 + (medio / total) * 360;
            const a4 = a3 + (bajo / total) * 360;

            return `conic-gradient(
              #ef4444 0deg ${a1}deg,
              #f59e0b ${a1}deg ${a2}deg,
              #3b82f6 ${a2}deg ${a3}deg,
              #22c55e ${a3}deg ${a4}deg
            )`;
          })(),
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "18px",
            borderRadius: "999px",
	            background: temaClaro ? "#ffffff" : "rgba(8,22,53,0.94)",
	            border: tema.bordeSutil,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              fontSize: "28px",
              fontWeight: 900,
              lineHeight: 1,
            }}
          >
            {totalCriticidad}
          </div>
          <div
            style={{
              fontSize: "11px",
              opacity: 0.72,
              marginTop: "4px",
              fontWeight: 700,
            }}
          >
	            {t("Total")}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gap: "10px" }}>
        {criticidadResumen.map((item) => {
          const porcentaje =
            totalCriticidad > 0
              ? ((item.total / totalCriticidad) * 100).toFixed(1)
              : "0.0";

          return (
            <div
              key={item.label}
              style={{
                display: "grid",
                gridTemplateColumns: "14px 1fr auto auto",
                gap: "10px",
                alignItems: "center",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "999px",
                  background: item.color,
                  display: "inline-block",
                }}
              />
              <span>{item.label}</span>
              <span style={{ opacity: 0.8 }}>{item.total}</span>
              <span
                style={{
                  opacity: 0.72,
                  minWidth: "46px",
                  textAlign: "right",
                }}
              >
                {porcentaje}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  )}

  <div
    style={{
      height: "1px",
	      background: temaClaro ? "rgba(148,163,184,0.24)" : "rgba(255,255,255,0.08)",
    }}
  />

  <div>
    <div
      style={{
        fontSize: "11px",
        opacity: 0.72,
        marginBottom: "10px",
        fontWeight: 700,
      }}
    >
	      {t("Estado de reportes")}
    </div>

    {totalEstadoReportes === 0 ? (
      <div
        style={{
          fontSize: "13px",
	          color: tema.textoSuave,
          textAlign: "center",
          padding: "10px 0 4px",
        }}
      >
	        {t("Sin datos de gestión para el filtro activo.")}
      </div>
    ) : (
      <div style={{ display: "grid", gap: "10px" }}>
        {estadoReportesResumen.map((item) => {
          const porcentaje =
            totalEstadoReportes > 0
              ? ((item.total / totalEstadoReportes) * 100).toFixed(1)
              : "0.0";

          return (
            <div key={item.label}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "6px",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                <span>{item.label}</span>
                <span>
                  {item.total} · {porcentaje}%
                </span>
              </div>

              <div
                style={{
                  height: "10px",
                  borderRadius: "999px",
	                  background: temaClaro ? "rgba(148,163,184,0.22)" : "rgba(255,255,255,0.08)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${totalEstadoReportes > 0 ? (item.total / totalEstadoReportes) * 100 : 0}%`,
                    height: "100%",
                    borderRadius: "999px",
                    background: item.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
</div>
              </div>
            </div>

            <div
              style={{
                ...panelSurfaceStyle,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                minHeight: "0",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1.45fr 1.2fr 1.45fr 0.9fr 1.05fr 1.25fr 0.9fr",
                  gap: "10px",
                  padding: "14px 16px",
	                  background: tema.tarjetaSuave,
                  fontSize: "11px",
                  fontWeight: 800,
                  letterSpacing: "0.7px",
                  textTransform: "uppercase",
	                  color: tema.textoSuave,
                }}
              >
	                <div>{t("Código")}</div>
	                <div>{t("Empresa")}</div>
	                <div>{t("Tipo de hallazgo")}</div>
	                <div>{t("Criticidad")}</div>
	                <div>{t("Estado")}</div>
	                <div>{t("Fecha / Hora")}</div>
	                <div>{t("Acción")}</div>
              </div>

             {filasFiltradas.length === 0 ? (
  <div
    style={{
      padding: "28px 16px",
      textAlign: "center",
      fontSize: "14px",
	      color: tema.textoSuave,
	      borderTop: tema.bordeSutil,
    }}
  >
	    {t("No hay hallazgos para el filtro seleccionado.")}
  </div>
) : (
  filasFiltradas.map((fila) => {
    const chip = chipColor(fila.criticidad);

    return (
      <div
        key={fila.codigo}
        style={{
          display: "grid",
          gridTemplateColumns:
            "1.45fr 1.2fr 1.45fr 0.9fr 1.05fr 1.25fr 0.9fr",
          gap: "10px",
          padding: "16px",
	          borderTop: tema.bordeSutil,
          alignItems: "center",
          fontSize: "13px",
        }}
      >
        <div style={{ fontWeight: 800 }}>{fila.codigo}</div>
        <div>{fila.empresa}</div>
        <div>{fila.tipoHallazgo}</div>

        <div>
          <span
            style={{
              display: "inline-block",
              padding: "6px 10px",
              borderRadius: "999px",
              background: chip.fondo,
              border: chip.borde,
              color: chip.texto,
              fontWeight: 800,
              fontSize: "11px",
              lineHeight: 1,
            }}
          >
            {fila.criticidad}
          </span>
        </div>

       <div
  style={{
    display: "grid",
    gap: "6px",
  }}
>
  <div style={{ fontWeight: 700 }}>{fila.estado}</div>

  <span
    style={{
      display: "inline-block",
      width: "fit-content",
      padding: "4px 8px",
      borderRadius: "999px",
      background: semaforoVencimiento(fila.fechaCompromiso, fila.estado).fondo,
      border: semaforoVencimiento(fila.fechaCompromiso, fila.estado).borde,
      color: semaforoVencimiento(fila.fechaCompromiso, fila.estado).texto,
      fontSize: "11px",
      fontWeight: 800,
      lineHeight: 1,
    }}
  >
	    {t(semaforoVencimiento(fila.fechaCompromiso, fila.estado).etiqueta)}
  </span>
</div>
        <div>{fila.fechaHora}</div>

        <div>
          <button
            onClick={() => {
  setHallazgoActivo(fila);
  setVistaDerecha("informe");
}}
            style={{
              width: "100%",
              padding: "10px 10px",
              borderRadius: "12px",
              border: "none",
              cursor: "pointer",
              fontWeight: 800,
              fontSize: "12px",
              background: "rgba(59,130,246,0.18)",
              color: "#bfdbfe",
            }}
          >
	            {t("Ver informe")}
          </button>
        </div>
      </div>
    );
  })
)}
            </div>
          </section>

          <aside
            style={{
              ...panelSurfaceStyle,
              padding: vistaPrincipal === "panel" ? "16px" : "24px",
              minHeight: "760px",
              display: "flex",
              flexDirection: "column",
              gridColumn: vistaPrincipal === "panel" ? "auto" : "2 / 4",
            }}
            >
{vistaDerecha !== "informe" ? null : (
  <div
    style={{
      fontSize: "16px",
      fontWeight: 800,
      marginBottom: "12px",
    }}
  >
	    {t("Informe Ejecutivo")}
  </div>
)}

{vistaDerecha === "seguimiento" && (
  <div
    style={{
      display: "grid",
      gap: "16px",
      marginBottom: "12px",
    }}
  >
    <div
      style={{
        ...panelSurfaceStyle,
        padding: "20px 22px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "16px",
      }}
    >
      <div>
        <div
          style={{
            fontSize: "24px",
            fontWeight: 900,
            color: tema.texto,
            marginBottom: "6px",
          }}
        >
          {t("Seguimiento de cierre")}
        </div>
        <div
          style={{
            fontSize: "13px",
            color: tema.textoSuave,
            lineHeight: 1.5,
          }}
        >
          {t("Control de responsables, plazos, evidencias y estado de corrección.")}
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          setVistaPrincipal("panel");
          setVistaDerecha("informe");
        }}
        style={{
          padding: "12px 18px",
          borderRadius: "14px",
          ...secondaryButtonStyle,
          fontSize: "13px",
          fontWeight: 800,
          cursor: "pointer",
          boxShadow: "0 8px 18px rgba(0,0,0,0.14)",
        }}
      >
        {t("Volver al panel")}
      </button>
    </div>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        gap: "12px",
      }}
    >
      {kpisSeguimiento.map((kpi) => (
        <div
          key={kpi.id}
          style={{
            ...panelSurfaceStyle,
            padding: "16px",
            minHeight: "92px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              color: tema.textoSuave,
              fontWeight: 900,
              textTransform: "uppercase",
              lineHeight: 1.25,
            }}
          >
            {kpi.titulo}
          </div>
          <div
            style={{
              fontSize: "34px",
              fontWeight: 900,
              color: kpi.color,
              lineHeight: 1,
            }}
          >
            {kpi.valor}
          </div>
        </div>
      ))}
    </div>

    <div
      style={{
        ...panelSurfaceStyle,
        padding: "16px",
        display: "grid",
        gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
        gap: "12px",
      }}
    >
      <label style={{ display: "grid", gap: "7px" }}>
        <span style={seguimientoFilterLabelStyle}>
          {t("Estado").toUpperCase()}
        </span>
        <select
          value={filtroSeguimientoEstado}
          onChange={(e) => setFiltroSeguimientoEstado(e.target.value)}
          style={{ ...controlStyle, cursor: "pointer" }}
        >
          {opcionesSeguimientoEstado.map((estado) => (
            <option key={estado} value={estado} style={optionStyle}>
              {estado === "TODOS" ? t("Todos") : t(estado)}
            </option>
          ))}
        </select>
      </label>
      <label style={{ display: "grid", gap: "7px" }}>
        <span style={seguimientoFilterLabelStyle}>
          {t("Empresa").toUpperCase()}
        </span>
        <select
          value={filtroSeguimientoEmpresa}
          onChange={(e) => setFiltroSeguimientoEmpresa(e.target.value)}
          style={{ ...controlStyle, cursor: "pointer" }}
        >
          {opcionesSeguimientoEmpresa.map((empresa) => (
            <option key={empresa} value={empresa} style={optionStyle}>
              {empresa === "TODAS" ? t("Todas") : empresa}
            </option>
          ))}
        </select>
      </label>
      <label style={{ display: "grid", gap: "7px" }}>
        <span style={seguimientoFilterLabelStyle}>
          {t("Criticidad").toUpperCase()}
        </span>
        <select
          value={filtroSeguimientoCriticidad}
          onChange={(e) => setFiltroSeguimientoCriticidad(e.target.value)}
          style={{ ...controlStyle, cursor: "pointer" }}
        >
          {opcionesCriticidad.map((criticidad) => (
            <option key={criticidad} value={criticidad} style={optionStyle}>
              {textoOpcion(criticidad)}
            </option>
          ))}
        </select>
      </label>
      <label style={{ display: "grid", gap: "7px" }}>
        <span style={seguimientoFilterLabelStyle}>
          {t("Fecha").toUpperCase()}
        </span>
        <input
          type="date"
          value={filtroSeguimientoFecha}
          onChange={(e) => setFiltroSeguimientoFecha(e.target.value)}
          style={{ ...controlStyle, colorScheme: tema.inputScheme }}
          aria-label={t("Fecha")}
        />
      </label>
      <label style={{ display: "grid", gap: "7px" }}>
        <span style={seguimientoFilterLabelStyle}>
          {t("Responsable de corrección").toUpperCase()}
        </span>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto auto",
            gap: "8px",
          }}
        >
          <input
            value={busquedaResponsableSeguimientoDraft}
            onChange={(e) => setBusquedaResponsableSeguimientoDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                ejecutarBusquedaResponsableSeguimiento();
              }
            }}
            style={controlStyle}
            placeholder={t("Buscar por nombre de responsable")}
          />
          <button
            type="button"
            onClick={ejecutarBusquedaResponsableSeguimiento}
            style={{
              padding: "0 13px",
              borderRadius: "13px",
              ...selectedButtonStyle,
              fontSize: "12px",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            {t("Buscar")}
          </button>
          <button
            type="button"
            onClick={limpiarBusquedaResponsableSeguimiento}
            style={{
              width: "40px",
              borderRadius: "13px",
              ...secondaryButtonStyle,
              fontSize: "15px",
              fontWeight: 900,
              cursor: "pointer",
            }}
            aria-label={t("Limpiar filtros")}
          >
            ×
          </button>
        </div>
      </label>
    </div>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.65fr) minmax(300px, 0.95fr)",
        gap: "16px",
        alignItems: "stretch",
      }}
    >
      <div
        style={{
          ...panelSurfaceStyle,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "0.85fr 1.15fr 1.15fr 0.9fr 1.25fr 1.15fr 1fr 1fr 1fr 0.85fr",
            gap: "10px",
            padding: "13px 14px",
            background: tema.tarjetaSuave,
            color: tema.textoSuave,
            fontSize: "10px",
            fontWeight: 900,
            textTransform: "uppercase",
          }}
        >
          <div>{t("Código")}</div>
          <div>{t("Empresa")}</div>
          <div>{t("Tipo de hallazgo")}</div>
          <div>{t("Criticidad")}</div>
          <div>{t("Responsable de corrección")}</div>
          <div>{t("Empresa responsable")}</div>
          <div>{t("Fecha compromiso")}</div>
          <div>{t("Estado seguimiento")}</div>
          <div>{t("Evidencia de cierre")}</div>
          <div>{t("Acción")}</div>
        </div>

        {hallazgosSeguimientoFiltrados.length === 0 ? (
          <div
            style={{
              padding: "28px 16px",
              borderTop: tema.bordeSutil,
              color: tema.textoSuave,
              fontSize: "14px",
              fontWeight: 800,
              textAlign: "center",
            }}
          >
            {t("Sin coincidencias para los filtros de seguimiento seleccionados.")}
          </div>
        ) : hallazgosSeguimientoFiltrados.map((item) => {
          const estadoVisual = estadoSeguimientoVisual(item);
          const activo = hallazgoSeguimientoActivo?.codigo === item.codigo;
          return (
            <div
              key={item.codigo}
              style={{
                display: "grid",
                gridTemplateColumns: "0.85fr 1.15fr 1.15fr 0.9fr 1.25fr 1.15fr 1fr 1fr 1fr 0.85fr",
                gap: "10px",
                padding: "14px",
                borderTop: tema.bordeSutil,
                alignItems: "center",
                fontSize: "12px",
                background: activo
                  ? (temaClaro ? "rgba(219,234,254,0.46)" : "rgba(59,130,246,0.09)")
                  : "transparent",
              }}
            >
              <div style={{ fontWeight: 900 }}>{item.codigo}</div>
              <div>{item.empresa} / {item.obra}</div>
              <div>{item.tipoHallazgo}</div>
              <div>
                <span
                  style={{
                    display: "inline-flex",
                    padding: "6px 8px",
                    borderRadius: "999px",
                    background: chipColor(item.criticidad).fondo,
                    border: chipColor(item.criticidad).borde,
                    color: chipColor(item.criticidad).texto,
                    fontSize: "10px",
                    fontWeight: 900,
                  }}
                >
                  {item.criticidad}
                </span>
              </div>
              <div style={{ fontWeight: 800 }}>{t(item.responsableCorreccionNombre)}</div>
              <div>{item.responsableCorreccionEmpresa}</div>
              <div>{t(item.responsableCierreFechaCompromiso)}</div>
              <div>
                <span
                  style={{
                    display: "inline-flex",
                    padding: "6px 8px",
                    borderRadius: "999px",
                    fontSize: "10px",
                    fontWeight: 900,
                    ...seguimientoChipStyle(estadoVisual),
                  }}
                >
                  {t(estadoVisual)}
                </span>
              </div>
              <div>{t(item.responsableCierreEvidencia)}</div>
              <button
                type="button"
                onClick={() => setCodigoSeguimientoActivo(item.codigo)}
                style={{
                  padding: "9px 10px",
                  borderRadius: "12px",
                  ...secondaryButtonStyle,
                  fontSize: "11px",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                {t("Ver detalle")}
              </button>
            </div>
          );
        })}
      </div>

      {hallazgoSeguimientoActivo && (
        <div
          style={{
            ...panelSurfaceStyle,
            padding: "18px",
            display: "grid",
            gap: "14px",
            alignSelf: "start",
          }}
        >
          <div>
            <div style={{ fontSize: "18px", fontWeight: 900, marginBottom: "4px" }}>
              {hallazgoSeguimientoActivo.codigo}
            </div>
            <div style={{ color: tema.textoSuave, fontSize: "12px", lineHeight: 1.45 }}>
              {hallazgoSeguimientoActivo.descripcion}
            </div>
          </div>
          {[
            [t("Reportante"), hallazgoSeguimientoActivo.reportante],
            [t("Responsable de corrección"), t(hallazgoSeguimientoActivo.responsableCorreccionNombre)],
            [t("Encargado de seguimiento"), t(hallazgoSeguimientoActivo.encargadoSeguimientoNombre)],
            [t("Validador de cierre"), t(hallazgoSeguimientoActivo.validadorCierreNombre)],
            [t("Fecha compromiso"), t(hallazgoSeguimientoActivo.responsableCierreFechaCompromiso)],
            [t("Estado seguimiento"), t(estadoSeguimientoVisual(hallazgoSeguimientoActivo))],
            [t("Acción correctiva requerida"), t(hallazgoSeguimientoActivo.accionCorrectivaRequerida)],
            [t("Evidencia requerida"), t(hallazgoSeguimientoActivo.evidenciaRequerida)],
            [t("Evidencia recibida"), t(hallazgoSeguimientoActivo.evidenciaRecibida)],
            [t("Observación de seguimiento"), t(hallazgoSeguimientoActivo.responsableCierreObservacion)],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                padding: "12px",
                borderRadius: "14px",
                border: tema.borde,
                background: tema.tarjetaSuave,
              }}
            >
              <div style={{ fontSize: "11px", color: tema.textoSuave, fontWeight: 900, marginBottom: "5px" }}>
                {label}
              </div>
              <div style={{ fontSize: "13px", fontWeight: 800, lineHeight: 1.35 }}>{value}</div>
            </div>
          ))}
          <button
            type="button"
            onClick={abrirGestionCierre}
            style={{
              width: "100%",
              padding: "13px 14px",
              borderRadius: "14px",
              ...selectedButtonStyle,
              fontSize: "13px",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            {t("Gestionar cierre")}
          </button>
          <div
            style={{
              padding: "12px",
              borderRadius: "14px",
              border: "1px solid rgba(245,158,11,0.32)",
              background: "rgba(245,158,11,0.12)",
              color: temaClaro ? "#92400e" : "#fde68a",
              fontSize: "12px",
              fontWeight: 800,
              lineHeight: 1.45,
            }}
          >
            {t("El reportante no se asume automáticamente como responsable de corrección. El seguimiento puede ser asignado a un supervisor o usuario autorizado.")}
          </div>
        </div>
      )}
    </div>
  </div>
)}

{vistaDerecha === "configuracion" && (
  <div
    style={{
      display: "grid",
      gap: "16px",
      marginBottom: "12px",
    }}
  >
    <div
      style={{
        ...panelSurfaceStyle,
        padding: "20px 22px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "16px",
      }}
    >
      <div>
        <div
          style={{
            fontSize: "24px",
            fontWeight: 900,
	            color: tema.texto,
            marginBottom: "6px",
          }}
        >
	          {t("Configuración del sistema")}
        </div>

        <div
          style={{
            fontSize: "13px",
	            color: tema.textoSuave,
            lineHeight: 1.5,
          }}
        >
	          {t("Administra identidad corporativa, apariencia y parámetros generales de la plataforma.")}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          justifyContent: "flex-end",
        }}
      >
        <button
          onClick={() => {
            setVistaPrincipal("panel");
            setVistaDerecha("informe");
          }}
         style={{
  padding: "12px 18px",
  borderRadius: "14px",
	  border: tema.bordeFuerte,
	  background: tema.tarjetaElevada,
	  color: tema.texto,
  fontSize: "13px",
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 8px 18px rgba(0,0,0,0.14)",
}}
        >
	          {t("Volver al panel")}
        </button>

        <button
          onClick={guardarConfiguracionPanel}
          style={{
  padding: "12px 18px",
  borderRadius: "14px",
  border: "1px solid rgba(132,204,22,0.24)",
  background: "linear-gradient(135deg, #84cc16, #22c55e)",
  color: "#052e16",
  fontSize: "13px",
  fontWeight: 900,
  cursor: "pointer",
  boxShadow: "0 10px 22px rgba(132,204,22,0.24)",
}}
        >
	          {t("Guardar cambios")}
        </button>
      </div>
    </div>

    {guardadoConfig && (
      <div
        style={{
          padding: "12px 18px",
          borderRadius: "14px",
          background: "rgba(132,204,22,0.16)",
          border: "1px solid rgba(132,204,22,0.35)",
          color: temaClaro ? "#166534" : "#bbf7d0",
          fontSize: "13px",
          fontWeight: 800,
          textAlign: "center",
        }}
      >
	        {t("Configuración guardada correctamente")}
      </div>
    )}

   <div
  style={{
    ...panelSurfaceStyle,
    padding: "20px",
  }}
>
  <div
    style={{
      fontSize: "16px",
      fontWeight: 800,
	      color: tema.texto,
      marginBottom: "14px",
    }}
  >
	    {t("Identidad de empresa")}
  </div>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "140px 1fr",
      gap: "18px",
      alignItems: "stretch",
    }}
  >
    <div
  style={{
    minHeight: "140px",
    borderRadius: "18px",
	    border: tema.borde,
	    background: temaClaro ? "#f8fafc" : "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
	    boxShadow: temaClaro ? "inset 0 1px 0 rgba(255,255,255,0.9)" : "inset 0 1px 0 rgba(255,255,255,0.05)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
	    color: tema.textoMedio,
    fontSize: "13px",
    fontWeight: 700,
    padding: "14px",
    gap: "8px",
  }}
>
  {logoEmpresaConfig ? (
    <img
      src={logoEmpresaConfig}
      alt={t("Logo empresa")}
      style={{
        width: "76px",
        height: "76px",
        objectFit: "contain",
        display: "block",
      }}
    />
  ) : (
    <div
      style={{
        width: "46px",
        height: "46px",
        borderRadius: "14px",
	        border: tema.borde,
	        background: tema.tarjetaElevada,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "18px",
        color: "#dbeafe",
        boxShadow: "0 6px 14px rgba(0,0,0,0.14)",
      }}
    >
      ⬒
    </div>
  )}

	  <div>{t("Logo empresa")}</div>

  <div
    style={{
      fontSize: "11px",
      fontWeight: 600,
      opacity: 0.68,
      lineHeight: 1.4,
    }}
  >
    PNG, SVG o JPG
  </div>
</div>

    <div
      style={{
        display: "grid",
        gap: "12px",
      }}
    >
      <div>
        <div
          style={{
            fontSize: "11px",
            opacity: 0.72,
            marginBottom: "6px",
            fontWeight: 700,
	            color: tema.texto,
          }}
        >
	          {t("Nombre empresa")}
        </div>

        <input
          value={nombreEmpresaConfig}
          onChange={(e) => setNombreEmpresaConfig(e.target.value)}
          style={{
            minHeight: "46px",
            padding: "12px 14px",
            borderRadius: "14px",
	            border: tema.borde,
	            background: tema.tarjetaSuave,
	            color: tema.texto,
            fontSize: "14px",
            fontWeight: 800,
            outline: "none",
          }}
	          placeholder={t("Nombre de la empresa")}
        />
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <input
          key={logoInputKey}
          id="logo-empresa-config"
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/svg+xml"
          onChange={(e) => cargarLogoEmpresa(e.target.files?.[0])}
          style={{ display: "none" }}
        />
        <label
          htmlFor="logo-empresa-config"
          style={{
            padding: "11px 14px",
            borderRadius: "14px",
            ...selectedButtonStyle,
            fontSize: "12px",
            fontWeight: 900,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {t("Seleccionar logo")}
        </label>
        <button
          type="button"
          onClick={quitarLogoEmpresa}
          style={{
            padding: "11px 14px",
            borderRadius: "14px",
            ...secondaryButtonStyle,
            fontSize: "12px",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          {t("Quitar logo")}
        </button>
        <div
          style={{
            color: tema.textoSuave,
            fontSize: "12px",
            fontWeight: 700,
          }}
        >
          {t("Seleccione o quite el logo corporativo")}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(150px, 1fr))",
          gap: "10px",
        }}
      >
        <button
          type="button"
          onClick={() => setBrandingPC((valor) => !valor)}
          style={{
            padding: "12px",
            minHeight: "74px",
            borderRadius: "14px",
	            ...(brandingPC ? activeToggleStyle : inactiveToggleStyle),
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            textAlign: "left",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              opacity: 0.72,
              marginBottom: "6px",
              fontWeight: 700,
            }}
          >
	            {t("Branding PC")}
          </div>
          <div style={{ fontSize: "13px", fontWeight: 800 }}>
	            {brandingPC ? t("Activo") : t("Inactivo")}
          </div>
        </button>

        <button
          type="button"
          onClick={() => setBrandingPDF((valor) => !valor)}
          style={{
            padding: "12px",
            minHeight: "74px",
            borderRadius: "14px",
	            ...(brandingPDF ? activeToggleStyle : inactiveToggleStyle),
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            textAlign: "left",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              opacity: 0.72,
              marginBottom: "6px",
              fontWeight: 700,
            }}
          >
	            {t("Branding PDF")}
          </div>
          <div style={{ fontSize: "13px", fontWeight: 800 }}>
	            {brandingPDF ? t("Activo") : t("Inactivo")}
          </div>
        </button>

        <div
          style={{
            padding: "12px",
            minHeight: "74px",
            borderRadius: "14px",
	            border: tema.borde,
	            background: tema.tarjetaSuave,
	            color: tema.texto,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              opacity: 0.72,
              marginBottom: "6px",
              fontWeight: 700,
            }}
          >
	            {t("Exportaciones")}
          </div>
          <div
            style={{
              display: "flex",
              gap: "6px",
              flexWrap: "wrap",
            }}
          >
            {(["pdf", "excel", "csv"] as FormatoExportacion[]).map((formato) => (
              <button
                key={formato}
                type="button"
                onClick={() => alternarFormatoExportacion(formato)}
                style={{
                  padding: "7px 9px",
                  borderRadius: "999px",
                  ...(formatosExportacion[formato] ? activeToggleStyle : inactiveToggleStyle),
                  fontSize: "11px",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                {formato === "pdf" ? t("PDF") : formato === "excel" ? t("Excel") : t("CSV")}
              </button>
            ))}
          </div>
        </div>
      </div>
      {!hayFormatoExportacionActivo && (
        <div
          style={{
            padding: "10px 12px",
            borderRadius: "12px",
            border: "1px solid rgba(245,158,11,0.34)",
            background: "rgba(245,158,11,0.12)",
            color: temaClaro ? "#92400e" : "#fde68a",
            fontSize: "12px",
            fontWeight: 800,
          }}
        >
          {t("Debe existir al menos un formato de exportación activo")}
        </div>
      )}
      <div
        style={{
          color: tema.textoSuave,
          fontSize: "12px",
          fontWeight: 700,
        }}
      >
        {t("Configuración local guardada en este navegador")}
      </div>
    </div>
  </div>
</div>
    <div
  style={{
  ...panelSurfaceStyle,
    padding: "18px",
  }}
>
  <div
    style={{
      fontSize: "15px",
      fontWeight: 800,
	      color: tema.texto,
      marginBottom: "14px",
    }}
  >
	    {t("Apariencia del sistema")}
  </div>

  <div
    style={{
      fontSize: "12px",
	      color: tema.textoSuave,
      lineHeight: 1.5,
      marginBottom: "14px",
    }}
  >
	    {t("Define la presentación visual de la plataforma para operación diurna, nocturna o automática.")}
  </div>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: "12px",
    }}
  >
    <button
      onClick={() => setModoSistema("claro")}
      style={
	        modoSistema === "claro"
	          ? {
	              padding: "14px 12px",
	              borderRadius: "14px",
	              ...selectedButtonStyle,
	              fontSize: "13px",
	              fontWeight: 800,
	              cursor: "pointer",
	            }
	          : {
	              padding: "14px 12px",
	              borderRadius: "14px",
	              ...secondaryButtonStyle,
	              fontSize: "13px",
	              fontWeight: 700,
	              cursor: "pointer",
            }
      }
    >
	      {t("Modo claro")}
    </button>

    <button
      onClick={() => setModoSistema("oscuro")}
      style={
	        modoSistema === "oscuro"
	          ? {
	              padding: "14px 12px",
	              borderRadius: "14px",
	              ...selectedButtonStyle,
	              fontSize: "13px",
	              fontWeight: 800,
	              cursor: "pointer",
	            }
	          : {
	              padding: "14px 12px",
	              borderRadius: "14px",
	              ...secondaryButtonStyle,
	              fontSize: "13px",
	              fontWeight: 700,
	              cursor: "pointer",
            }
      }
    >
	      {t("Modo oscuro")}
    </button>

    <button
      onClick={() => setModoSistema("automatico")}
      style={
	        modoSistema === "automatico"
	          ? {
	              padding: "14px 12px",
	              borderRadius: "14px",
	              ...selectedButtonStyle,
	              fontSize: "13px",
	              fontWeight: 800,
	              cursor: "pointer",
	            }
	          : {
	              padding: "14px 12px",
	              borderRadius: "14px",
	              ...secondaryButtonStyle,
	              fontSize: "13px",
	              fontWeight: 700,
	              cursor: "pointer",
            }
      }
    >
	      {t("Automático")}
    </button>
  </div>
</div>
<div
  style={{
    ...panelSurfaceStyle,
    padding: "18px",
  }}
>
  <div
    style={{
      fontSize: "15px",
      fontWeight: 800,
	      color: tema.texto,
      marginBottom: "14px",
    }}
  >
	    {t("Idioma del sistema")}
  </div>

  <div
    style={{
      fontSize: "12px",
	      color: tema.textoSuave,
      lineHeight: 1.5,
      marginBottom: "14px",
    }}
  >
	    {t("Define el idioma general de navegación, textos operativos e informes del sistema.")}
  </div>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: "12px",
    }}
  >
    <button
      onClick={() => setIdiomaSistema("es")}
      style={
	        idiomaSistema === "es"
	          ? {
	              padding: "14px 12px",
	              borderRadius: "14px",
	              ...selectedButtonStyle,
	              fontSize: "13px",
	              fontWeight: 800,
	              cursor: "pointer",
	            }
	          : {
	              padding: "14px 12px",
	              borderRadius: "14px",
	              ...secondaryButtonStyle,
	              fontSize: "13px",
	              fontWeight: 700,
	              cursor: "pointer",
            }
      }
    >
	      {t("Español")}
    </button>

    <button
      onClick={() => setIdiomaSistema("en")}
      style={
	        idiomaSistema === "en"
	          ? {
	              padding: "14px 12px",
	              borderRadius: "14px",
	              ...selectedButtonStyle,
	              fontSize: "13px",
	              fontWeight: 800,
	              cursor: "pointer",
	            }
	          : {
	              padding: "14px 12px",
	              borderRadius: "14px",
	              ...secondaryButtonStyle,
	              fontSize: "13px",
	              fontWeight: 700,
	              cursor: "pointer",
            }
      }
    >
      English
    </button>

    <button
      onClick={() => setIdiomaSistema("auto")}
      style={
	        idiomaSistema === "auto"
	          ? {
	              padding: "14px 12px",
	              borderRadius: "14px",
	              ...selectedButtonStyle,
	              fontSize: "13px",
	              fontWeight: 800,
	              cursor: "pointer",
	            }
	          : {
	              padding: "14px 12px",
	              borderRadius: "14px",
	              ...secondaryButtonStyle,
	              fontSize: "13px",
	              fontWeight: 700,
	              cursor: "pointer",
            }
      }
    >
	      {t("Automático")}
    </button>
  </div>
</div>
<div
  style={{
    ...panelSurfaceStyle,
    padding: "18px",
  }}
>
  <div
    style={{
      fontSize: "15px",
      fontWeight: 800,
	      color: tema.texto,
      marginBottom: "14px",
    }}
  >
	    {t("Informes PDF")}
  </div>

  <div
    style={{
      fontSize: "12px",
	      color: tema.textoSuave,
      lineHeight: 1.5,
      marginBottom: "14px",
    }}
  >
	    {t("Define cómo se presentan los documentos exportados y descargados desde la plataforma.")}
  </div>

 <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(220px, 1fr))",
    gap: "12px",
  }}
>
  {[
    {
      key: "logo",
      titulo: t("Incluir logo en PDF"),
      activo: brandingPDF,
      disabled: true,
    },
    {
      key: "evidencia",
      titulo: t("Incluir evidencia fotográfica"),
      activo: opcionesPDF.evidenciaFotografica,
      onClick: () =>
        setOpcionesPDF((actual) => ({
          ...actual,
          evidenciaFotografica: !actual.evidenciaFotografica,
        })),
    },
    {
      key: "firma",
      titulo: t("Incluir firma/responsable"),
      activo: opcionesPDF.firmaResponsable,
      onClick: () =>
        setOpcionesPDF((actual) => ({
          ...actual,
          firmaResponsable: !actual.firmaResponsable,
        })),
    },
    {
      key: "fecha",
      titulo: t("Incluir fecha y hora"),
      activo: opcionesPDF.fechaHora,
      onClick: () =>
        setOpcionesPDF((actual) => ({
          ...actual,
          fechaHora: !actual.fechaHora,
        })),
    },
  ].map((item) => (
    <button
      key={item.key}
      type="button"
      onClick={item.onClick}
      style={{
        padding: "16px",
        minHeight: "88px",
        borderRadius: "14px",
        ...(item.activo ? activeToggleStyle : inactiveToggleStyle),
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        textAlign: "left",
        cursor: item.disabled ? "default" : "pointer",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          fontWeight: 900,
          lineHeight: 1.35,
        }}
      >
        {item.titulo}
      </div>
      <span style={smallStatusStyle(item.activo)}>
        {item.activo ? t("Activo") : t("Inactivo")}
      </span>
    </button>
  ))}

  <div
    style={{
      padding: "16px",
      minHeight: "88px",
      borderRadius: "14px",
      border: tema.borde,
      background: tema.tarjetaSuave,
      color: tema.texto,
      display: "grid",
      gap: "10px",
    }}
  >
    <div style={{ fontSize: "12px", fontWeight: 900 }}>
      {t("Formato de hoja")}
    </div>
    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
      {(["carta", "a4"] as FormatoHojaPDF[]).map((formato) => (
        <button
          key={formato}
          type="button"
          onClick={() =>
            setOpcionesPDF((actual) => ({
              ...actual,
              formatoHoja: formato,
            }))
          }
          style={{
            padding: "9px 11px",
            borderRadius: "999px",
            ...(opcionesPDF.formatoHoja === formato ? activeToggleStyle : inactiveToggleStyle),
            fontSize: "12px",
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          {formato === "carta" ? t("Carta") : t("A4")}
        </button>
      ))}
    </div>
  </div>

  <div
    style={{
      padding: "16px",
      minHeight: "88px",
      borderRadius: "14px",
      border: tema.borde,
      background: tema.tarjetaSuave,
      color: tema.texto,
      display: "grid",
      gap: "10px",
    }}
  >
    <div style={{ fontSize: "12px", fontWeight: 900 }}>
      {t("Orientación")}
    </div>
    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
      {(["vertical", "horizontal"] as OrientacionPDF[]).map((orientacion) => (
        <button
          key={orientacion}
          type="button"
          onClick={() =>
            setOpcionesPDF((actual) => ({
              ...actual,
              orientacion,
            }))
          }
          style={{
            padding: "9px 11px",
            borderRadius: "999px",
            ...(opcionesPDF.orientacion === orientacion ? activeToggleStyle : inactiveToggleStyle),
            fontSize: "12px",
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          {orientacion === "vertical" ? t("Vertical") : t("Horizontal")}
        </button>
      ))}
    </div>
  </div>
</div>
{/* Esta configuración queda lista para conectarse luego con la exportación PDF real. */}
</div>
<div
  style={{
    ...panelSurfaceStyle,
    padding: "18px",
  }}
>
  <div
    style={{
      fontSize: "15px",
      fontWeight: 800,
	      color: tema.texto,
      marginBottom: "14px",
    }}
  >
	    {t("Usuarios y permisos")}
  </div>

  <div
    style={{
      fontSize: "12px",
	      color: tema.textoSuave,
      lineHeight: 1.5,
      marginBottom: "14px",
    }}
  >
	    {t("Define perfiles de acceso y alcance de visualización para administración, supervisión y clientes corporativos.")}
  </div>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(220px, 1fr))",
      gap: "12px",
    }}
  >
    {[
      {
        key: "administrador" as PerfilPermiso,
        titulo: t("Administrador"),
        descripcion: t("Acceso total al sistema"),
        permisos: t("Configuración completa, branding, usuarios y reportes."),
      },
      {
        key: "supervisor" as PerfilPermiso,
        titulo: t("Supervisor"),
        descripcion: t("Reporte y seguimiento operativo"),
        permisos: t("Seguimiento operativo, filtros e informes de avance."),
      },
      {
        key: "gerencia" as PerfilPermiso,
        titulo: t("Gerencia"),
        descripcion: t("Visualización ejecutiva y reportes"),
        permisos: t("Vista ejecutiva, KPIs, informes y exportaciones."),
      },
      {
        key: "cliente" as PerfilPermiso,
        titulo: t("Cliente / Mandante"),
        descripcion: t("Alcance multiempresa"),
        permisos: t("Consulta controlada de hallazgos e informes compartidos."),
      },
    ].map((perfil) => {
      const activo = perfilesActivos[perfil.key];

      return (
        <button
          key={perfil.key}
          type="button"
          onClick={() => alternarPerfilActivo(perfil.key)}
          style={{
            padding: "16px",
            minHeight: "118px",
            borderRadius: "14px",
            ...(activo ? activeToggleStyle : inactiveToggleStyle),
            color: activo ? undefined : tema.texto,
            display: "grid",
            gap: "8px",
            textAlign: "left",
            cursor: "pointer",
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
            <div style={{ fontSize: "13px", fontWeight: 900 }}>
              {perfil.titulo}
            </div>
            <span style={smallStatusStyle(activo)}>
              {activo ? t("Activo") : t("Inactivo")}
            </span>
          </div>
          <div style={{ fontSize: "13px", fontWeight: 800 }}>
            {perfil.descripcion}
          </div>
          <div
            style={{
              fontSize: "12px",
              lineHeight: 1.45,
              color: activo ? (temaClaro ? "#166534" : "#dcfce7") : tema.textoSuave,
              fontWeight: 700,
            }}
          >
            {perfil.permisos}
          </div>
        </button>
      );
    })}
  </div>
</div>
  </div>
)}

{vistaDerecha !== "informe" ? null : filasFiltradas.length === 0 ? (
  <div
    style={{
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      fontSize: "14px",
	      color: tema.textoSuave,
      padding: "24px",
      lineHeight: 1.5,
    }}
  >
	    {t("No hay informe disponible para el filtro seleccionado.")}
  </div>
) : (
  <>
    <div
      style={{
        padding: "12px",
        borderRadius: "14px",
	        background: tema.tarjetaSuave,
	        border: tema.borde,
        marginBottom: "14px",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          opacity: 0.72,
          marginBottom: "4px",
          fontWeight: 700,
        }}
      >
	        {t("Código")}
      </div>
      <div style={{ fontWeight: 900, fontSize: "14px" }}>
        {hallazgoActivo.codigo}
      </div>
    </div>
<div style={{ marginBottom: "14px" }}>
  <div
    style={{
      fontSize: "11px",
      opacity: 0.72,
      marginBottom: "4px",
      fontWeight: 700,
    }}
  >
	    {t("Estado plazo")}
  </div>

  <div
    style={{
      display: "inline-block",
      padding: "6px 10px",
      borderRadius: "999px",
      background: semaforoVencimiento(
        hallazgoActivo.fechaCompromiso,
        hallazgoActivo.estado
      ).fondo,
      border: semaforoVencimiento(
        hallazgoActivo.fechaCompromiso,
        hallazgoActivo.estado
      ).borde,
      color: semaforoVencimiento(
        hallazgoActivo.fechaCompromiso,
        hallazgoActivo.estado
      ).texto,
      fontSize: "12px",
      fontWeight: 800,
    }}
  >
	    {t(
	      semaforoVencimiento(
	        hallazgoActivo.fechaCompromiso,
	        hallazgoActivo.estado
	      ).etiqueta
	    )}
  </div>
</div>
    {[
	      [t("Empresa"), hallazgoActivo.empresa],
	      [t("Reportante"), hallazgoActivo.reportante],
	      [t("Cargo"), hallazgoActivo.cargo],
	      [t("Teléfono"), hallazgoActivo.telefono],
	      [t("Responsable"), hallazgoActivo.responsable],
	[t("Fecha compromiso"), hallazgoActivo.fechaCompromiso || t("Sin definir")],
	[t("Fecha cierre"), hallazgoActivo.fechaCierre || t("Pendiente")],
	[t("Evidencia cierre"), hallazgoActivo.evidenciaCierre || t("Sin evidencia de cierre")],
	      [t("Tipo"), hallazgoActivo.tipoHallazgo],
	      [t("Criticidad"), hallazgoActivo.criticidad],
	      [t("Fecha / Hora"), hallazgoActivo.fechaHora],
    ].map(([titulo, valor]) => (
      <div key={titulo} style={{ marginBottom: "10px" }}>
        <div
          style={{
            fontSize: "11px",
            opacity: 0.7,
            marginBottom: "3px",
            fontWeight: 700,
          }}
        >
          {titulo}
        </div>
        <div
          style={{
            fontSize: "13px",
            fontWeight: 700,
            lineHeight: 1.35,
          }}
        >
          {valor}
        </div>
      </div>
    ))}

    <div style={{ marginTop: "10px", marginBottom: "12px" }}>
      <div
        style={{
          fontSize: "11px",
          opacity: 0.7,
          marginBottom: "4px",
          fontWeight: 700,
        }}
      >
	        {t("Descripción")}
      </div>

      <div
        style={{
          fontSize: "13px",
          lineHeight: 1.5,
          padding: "12px",
          borderRadius: "14px",
	          background: tema.tarjetaSuave,
	          border: tema.borde,
        }}
      >
        {hallazgoActivo.descripcion}
      </div>
    </div>
<div style={{ marginBottom: "12px" }}>
  <div
    style={{
      fontSize: "11px",
      opacity: 0.7,
      marginBottom: "4px",
      fontWeight: 700,
    }}
  >
	    {t("Evidencia fotográfica")}
  </div>

  {hallazgoActivo.fotos && hallazgoActivo.fotos.length > 0 ? (
    <div
      style={{
        display: "flex",
        gap: "8px",
        flexWrap: "wrap",
      }}
    >
      {hallazgoActivo.fotos.slice(0, 3).map((foto, index) => (
        <img
          key={index}
          src={foto}
          alt={`Evidencia ${index + 1}`}
          style={{
            width: "78px",
            height: "78px",
            objectFit: "cover",
            borderRadius: "10px",
	            border: tema.borde,
	            background: tema.tarjetaSuave,
          }}
        />
      ))}
    </div>
  ) : (
    <div
      style={{
        fontSize: "13px",
        lineHeight: 1.4,
        opacity: 0.75,
      }}
    >
	      {t("Sin evidencia fotográfica")}
    </div>
  )}
</div>
    <div style={{ marginBottom: "12px" }}>
      <div
        style={{
          fontSize: "11px",
          opacity: 0.7,
          marginBottom: "4px",
          fontWeight: 700,
        }}
      >
	        {t("Medida inmediata")}
      </div>

      <div
        style={{
          fontSize: "13px",
          lineHeight: 1.5,
          padding: "12px",
          borderRadius: "14px",
	          background: tema.tarjetaSuave,
	          border: tema.borde,
        }}
      >
        {hallazgoActivo.medidaInmediata}
      </div>
    </div>

    <button
    onClick={descargarPDFHallazgoActivo}
      style={{
        width: "100%",
        marginTop: "auto",
        padding: "14px",
        borderRadius: "14px",
        border: "none",
        cursor: "pointer",
        fontWeight: 800,
        background: "linear-gradient(180deg, #67ef48 0%, #d7ff39 100%)",
        color: "#0b2b13",
        boxShadow: "0 10px 22px rgba(109,255,72,0.22)",
      }}
    >
	      {t("Descargar PDF")}
    </button>
  </>
)}
          </aside>
        </div>
      </div>
    </main>
  );
}
