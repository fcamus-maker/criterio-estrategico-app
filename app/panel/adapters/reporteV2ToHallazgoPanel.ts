import type { HallazgoPanel } from "../mockdata";

export type CriticidadPanel = HallazgoPanel["criticidad"];
export type EstadoPanel = HallazgoPanel["estado"];

export type FotoReporteV2 = {
  id?: string;
  nombre?: string;
  tipo?: string;
  dataUrl?: string;
  fechaCarga?: string;
};

export type GpsReporteV2 = {
  latitud?: number;
  longitud?: number;
  precisionGps?: number;
  fechaHoraGeolocalizacion?: string;
  estadoGeolocalizacion?: string;
};

export type EvaluacionReporteV2 = {
  respuestas?: Record<string, string>;
  puntaje?: number;
  criticidad?: string;
  prioridad?: string;
  recomendacion?: string;
  accionInmediata?: string;
};

export type CierreReporteV2 = {
  responsableCorreccionTipo?: string;
  responsableCorreccionEmpresa?: string;
  responsableCorreccionNombre?: string;
  responsableCorreccionCargo?: string;
  responsableCorreccionTelefono?: string;
  encargadoSeguimientoNombre?: string;
  responsableCierreFechaCompromiso?: string;
  responsableCierreEstadoSeguimiento?: string;
  responsableCierreEvidencia?: string;
  responsableCierreObservacion?: string;
  evidenciaRequerida?: string[] | string;
  evidenciaRecibida?: string[] | string;
  validadorCierreNombre?: string;
  validadorCierreEstado?: string;
  validadorCierreObservacion?: string;
};

export type ReporteV2 = {
  codigo?: string;
  supervisor?: string;
  supervisorFoto?: string;
  cargo?: string;
  empresa?: string;
  obra?: string;
  siglaEmpresa?: string;
  siglaProyecto?: string;
  area?: string;
  descripcion?: string;
  fecha?: string;
  hora?: string;
  estado?: string;
  estadoCierre?: string;
  estadoValidacion?: string;
  mensajeValidacion?: string;
  fechaGuardado?: string;
  fotos?: FotoReporteV2[];
  gps?: GpsReporteV2;
  evaluacion?: EvaluacionReporteV2;
  cierre?: CierreReporteV2;
  asignacionCierre?: CierreReporteV2;
};

export type HallazgoPanelDesdeV2 = HallazgoPanel & {
  origen: "mobile-v2";
  area: string;
  supervisorFoto?: string;
  gps?: GpsReporteV2;
  puntajeEvaluacion?: number;
  prioridad?: string;
  recomendacion?: string;
  fechaCompromiso?: string;
  fechaCierre?: string;
  evidenciaCierre?: string;
  responsable?: string;
  responsableCierreNombre?: string;
  responsableCierreCargo?: string;
  responsableCierreEmpresa?: string;
  responsableCierreTelefono?: string;
  responsableCierreEstadoSeguimiento?: string;
  responsableCierreFechaCompromiso?: string;
  responsableCierreEvidencia?: string;
  responsableCierreObservacion?: string;
  responsableCorreccionTipo?: string;
  responsableCorreccionNombre?: string;
  responsableCorreccionCargo?: string;
  responsableCorreccionEmpresa?: string;
  responsableCorreccionTelefono?: string;
  encargadoSeguimientoNombre?: string;
  validadorCierreNombre?: string;
  validadorCierreEstado?: string;
  validadorCierreObservacion?: string;
  evidenciaRequerida?: string;
  evidenciaRecibida?: string;
};

function texto(valor: unknown, fallback = "") {
  const limpio = String(valor ?? "").trim();
  return limpio || fallback;
}

function normalizarTexto(valor: unknown) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
}

export function normalizarCriticidadPanel(valor: unknown): CriticidadPanel {
  const normalizado = normalizarTexto(valor);

  if (normalizado.includes("CRIT")) return "CRÍTICO";
  if (normalizado.includes("ALTO")) return "ALTO";
  if (normalizado.includes("MED")) return "MEDIO";
  return "BAJO";
}

export function normalizarEstadoPanel(reporte: ReporteV2): EstadoPanel {
  const estado = normalizarTexto(reporte.estado);
  const estadoCierre = normalizarTexto(reporte.estadoCierre);

  if (estado === "CERRADO" || estadoCierre === "CERRADO") return "CERRADO";
  if (estado.includes("SEGUIMIENTO") || estadoCierre.includes("SEGUIMIENTO")) {
    return "EN SEGUIMIENTO";
  }
  if (estado === "REPORTADO") return "REPORTADO";
  return "ABIERTO";
}

function normalizarFechaISO(valor: unknown) {
  const textoFecha = texto(valor);
  if (!textoFecha) return "";

  const match = textoFecha.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (match) {
    const [, dia, mes, anio] = match;
    const fechaLocal = new Date(Number(anio), Number(mes) - 1, Number(dia));
    return Number.isNaN(fechaLocal.getTime()) ? "" : fechaLocal.toISOString();
  }

  const fecha = new Date(textoFecha);
  return Number.isNaN(fecha.getTime()) ? "" : fecha.toISOString();
}

function obtenerFechaISO(reporte: ReporteV2) {
  const desdeGuardado = normalizarFechaISO(reporte.fechaGuardado);
  if (desdeGuardado) return desdeGuardado;

  const desdeFecha = normalizarFechaISO(reporte.fecha);
  if (!desdeFecha) return "";

  const hora = texto(reporte.hora);
  const horaMatch = hora.match(/(\d{1,2}):(\d{2})/);
  if (!horaMatch) return desdeFecha;

  const fecha = new Date(desdeFecha);
  fecha.setHours(Number(horaMatch[1]), Number(horaMatch[2]), 0, 0);
  return fecha.toISOString();
}

function formatearFechaHora(fechaISO: string, reporte: ReporteV2) {
  if (fechaISO) {
    const fecha = new Date(fechaISO);
    if (!Number.isNaN(fecha.getTime())) {
      const dia = String(fecha.getDate()).padStart(2, "0");
      const mes = String(fecha.getMonth() + 1).padStart(2, "0");
      const anio = String(fecha.getFullYear());
      const hora = String(fecha.getHours()).padStart(2, "0");
      const minutos = String(fecha.getMinutes()).padStart(2, "0");
      return `${dia}-${mes}-${anio} · ${hora}:${minutos}`;
    }
  }

  return `${texto(reporte.fecha, "Sin fecha")} · ${texto(reporte.hora, "--:--")}`;
}

function fotosPanel(reporte: ReporteV2) {
  return Array.isArray(reporte.fotos)
    ? reporte.fotos
        .map((foto) => texto(foto.dataUrl))
        .filter((dataUrl) => dataUrl.length > 0)
        .slice(0, 3)
    : [];
}

function unirLista(valor: string[] | string | undefined, fallback: string) {
  if (Array.isArray(valor)) {
    const unidos = valor.map((item) => texto(item)).filter(Boolean).join(", ");
    return unidos || fallback;
  }

  return texto(valor, fallback);
}

function obtenerCierre(reporte: ReporteV2): CierreReporteV2 {
  return reporte.asignacionCierre || reporte.cierre || {};
}

export function adaptarReporteV2AHallazgoPanel(
  reporte: ReporteV2,
  indice = 0
): HallazgoPanelDesdeV2 {
  const cierre = obtenerCierre(reporte);
  const codigo = texto(reporte.codigo, `MOBILE-V2-${String(indice + 1).padStart(4, "0")}`);
  const fechaISO = obtenerFechaISO(reporte);
  const criticidad = normalizarCriticidadPanel(reporte.evaluacion?.criticidad);
  const estado = normalizarEstadoPanel(reporte);
  const responsableCorreccionNombre = texto(
    cierre.responsableCorreccionNombre,
    "Sin asignar"
  );
  const responsableCorreccionEmpresa = texto(
    cierre.responsableCorreccionEmpresa,
    reporte.empresa || "Sin definir"
  );
  const responsableCierreFechaCompromiso = texto(
    cierre.responsableCierreFechaCompromiso,
    "Sin definir"
  );
  const responsableCierreEvidencia = unirLista(
    cierre.evidenciaRecibida || cierre.responsableCierreEvidencia,
    "Sin evidencia de cierre"
  );
  const evidenciaRequerida = unirLista(
    cierre.evidenciaRequerida,
    "Registro fotográfico y documentación de corrección"
  );

  return {
    id: codigo,
    codigo,
    origen: "mobile-v2",
    empresa: texto(reporte.empresa, "Sin empresa"),
    obra: texto(reporte.obra, "Sin obra"),
    area: texto(reporte.area, "Sin área"),
    tipoHallazgo: "Condición subestándar",
    criticidad,
    estado,
    fechaHora: formatearFechaHora(fechaISO, reporte),
    fechaISO,
    reportante: texto(reporte.supervisor, "Supervisor móvil V2"),
    cargo: texto(reporte.cargo, "Sin cargo"),
    telefono: "Sin teléfono",
    descripcion: texto(reporte.descripcion, "Sin descripción"),
    medidaInmediata: texto(
      reporte.evaluacion?.accionInmediata,
      "Acción inmediata pendiente de definición"
    ),
    fotos: fotosPanel(reporte),
    supervisorFoto: texto(reporte.supervisorFoto),
    gps: reporte.gps,
    puntajeEvaluacion: reporte.evaluacion?.puntaje,
    prioridad: texto(reporte.evaluacion?.prioridad),
    recomendacion: texto(reporte.evaluacion?.recomendacion),
    fechaCompromiso:
      responsableCierreFechaCompromiso === "Sin definir"
        ? ""
        : responsableCierreFechaCompromiso,
    fechaCierre: estado === "CERRADO" ? texto(reporte.fechaGuardado, "") : "",
    evidenciaCierre: responsableCierreEvidencia,
    responsable:
      responsableCorreccionNombre !== "Sin asignar"
        ? responsableCorreccionNombre
        : responsableCorreccionEmpresa,
    responsableCierreNombre: responsableCorreccionNombre,
    responsableCierreCargo: texto(cierre.responsableCorreccionCargo, "Pendiente"),
    responsableCierreEmpresa: responsableCorreccionEmpresa,
    responsableCierreTelefono: texto(
      cierre.responsableCorreccionTelefono,
      "Sin contacto"
    ),
    responsableCierreEstadoSeguimiento: texto(
      cierre.responsableCierreEstadoSeguimiento,
      responsableCorreccionNombre === "Sin asignar"
        ? "Pendiente de asignación"
        : "Asignado"
    ),
    responsableCierreFechaCompromiso,
    responsableCierreEvidencia,
    responsableCierreObservacion: texto(
      cierre.responsableCierreObservacion,
      "Responsable de cierre pendiente de definición"
    ),
    responsableCorreccionTipo: texto(
      cierre.responsableCorreccionTipo,
      "Empresa contratista"
    ),
    responsableCorreccionNombre,
    responsableCorreccionCargo: texto(cierre.responsableCorreccionCargo, "Pendiente"),
    responsableCorreccionEmpresa,
    responsableCorreccionTelefono: texto(
      cierre.responsableCorreccionTelefono,
      "Sin contacto"
    ),
    encargadoSeguimientoNombre: texto(
      cierre.encargadoSeguimientoNombre,
      "Usuario autorizado"
    ),
    validadorCierreNombre: texto(
      cierre.validadorCierreNombre,
      "Pendiente de validador"
    ),
    validadorCierreEstado: texto(
      cierre.validadorCierreEstado,
      "Pendiente de revisión"
    ),
    validadorCierreObservacion: texto(
      cierre.validadorCierreObservacion,
      "Validación pendiente de evidencia y revisión"
    ),
    evidenciaRequerida,
    evidenciaRecibida: responsableCierreEvidencia,
  };
}

export function adaptarReportesV2AHallazgosPanel(
  reportes: ReporteV2[]
): HallazgoPanelDesdeV2[] {
  return reportes.map((reporte, indice) =>
    adaptarReporteV2AHallazgoPanel(reporte, indice)
  );
}
