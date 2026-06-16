import type { HallazgoPanel } from "../panel/mockdata";
import type {
  CriticidadHallazgoCentral,
  EstadoHallazgoCentral,
  HallazgoCentral,
} from "../types/hallazgoCentral";
import {
  normalizarEvidenciasPanel,
  type EvidenciaPanel,
} from "../panel/evidenciasPanel";

type DebilidadesRespaldoPreventivaPanel = {
  evidencia?: string[];
  trazabilidad?: string[];
  cierre?: string[];
  calidadRespaldo?: string;
  resumen?: string;
};

export type EvaluacionPreventivaPanel = {
  analisisEjecutivo?: string;
  marcoLegalRelacionado?: string[];
  criteriosCriticosDetectados?: string[];
  familiaRiesgoPrincipal?: string;
  debilidadesRespaldo?: DebilidadesRespaldoPreventivaPanel;
  nivelSuficienciaInformacion?: string;
  motivoTecnicoHallazgo?: string;
  versionMotorPreventivo?: string;
};

export type HallazgoPanelDesdeCentral = HallazgoPanel & {
  origen?: HallazgoCentral["origen"];
  area?: string;
  supervisorFoto?: string;
  gps?: HallazgoCentral["geolocalizacion"];
  puntajeEvaluacion?: number;
  prioridad?: string;
  recomendacion?: string;
  empresaReportante?: string;
  empresaResponsableInvolucrada?: string;
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
  validadorCierreNombre?: string;
  validadorCierreEstado?: string;
  validadorCierreObservacion?: string;
  evidenciaRequerida?: string;
  evidenciaRecibida?: string;
  plazoEstado?: string;
  plazoExtendido?: boolean;
  justificacionExtensionPlazo?: string;
  cierreSinEvidenciaJustificado?: boolean;
  justificacionCierreSinEvidencia?: string;
  evidenciasPanel?: EvidenciaPanel[];
  totalEvidencias?: number;
  evidenciasPendientesVisualizacion?: number;
  evaluacionPreventiva?: EvaluacionPreventivaPanel;
  borradoLogico?: {
    fechaHora?: string;
    motivo?: string;
    usuarioNombre?: string;
    usuarioEmail?: string;
    usuarioRol?: string;
    estadoAnterior?: string;
  };
};

function texto(valor: unknown, fallback = "") {
  const limpio = String(valor ?? "").trim();
  return limpio || fallback;
}

function criticidadPanel(
  criticidad: CriticidadHallazgoCentral
): HallazgoPanel["criticidad"] {
  if (criticidad === "CRITICO") return "CRÍTICO";
  return criticidad;
}

function estadoPanel(estado: EstadoHallazgoCentral): HallazgoPanel["estado"] {
  if (estado === "EN_SEGUIMIENTO") return "EN SEGUIMIENTO";
  if (estado === "CERRADO") return "CERRADO";
  if (estado === "ANULADO") return "ANULADO";
  if (estado === "REPORTADO") return "REPORTADO";
  return "ABIERTO";
}

function fechaHoraPanel(hallazgo: HallazgoCentral) {
  const fechaISO = texto(hallazgo.fechaHoraReporteISO || hallazgo.fechaCreacion);

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

  return `${texto(hallazgo.fechaReporte, "Sin fecha")} · ${texto(
    hallazgo.horaReporte,
    "--:--"
  )}`;
}

function fechaISO(hallazgo: HallazgoCentral) {
  const fecha = texto(hallazgo.fechaHoraReporteISO || hallazgo.fechaCreacion);
  if (fecha) return fecha;

  const fallback = new Date(hallazgo.fechaReporte);
  return Number.isNaN(fallback.getTime()) ? "" : fallback.toISOString();
}

function fotosPanel(evidencias: EvidenciaPanel[]) {
  return evidencias
    .map((evidencia) => texto(evidencia.url))
    .filter(Boolean)
    .slice(0, 3);
}

function unirLista(valor: string[] | undefined, fallback = "") {
  const salida = (valor || []).map((item) => texto(item)).filter(Boolean);
  return salida.length ? salida.join(", ") : fallback;
}

function listaTexto(valor: unknown) {
  if (Array.isArray(valor)) {
    return valor.map((item) => texto(item)).filter(Boolean);
  }

  const limpio = texto(valor);
  if (!limpio) return [];

  return limpio
    .split(/[;,]/)
    .map((item) => texto(item))
    .filter(Boolean);
}

function evidenciasRecibidasPanel(hallazgo: HallazgoCentral) {
  const evidencias = hallazgo.seguimientoCierre?.evidenciaRecibida || [];
  const textoEvidencias = evidencias
    .map((evidencia) =>
      texto(evidencia.descripcion || evidencia.url || evidencia.storagePath)
    )
    .filter(Boolean);

  return textoEvidencias.length
    ? textoEvidencias.join(", ")
    : "Sin evidencia de cierre";
}

function objetoRegistro(valor: unknown): Record<string, unknown> {
  return valor && typeof valor === "object" && !Array.isArray(valor)
    ? (valor as Record<string, unknown>)
    : {};
}

function evaluacionPreventivaPanel(
  hallazgo: HallazgoCentral
): EvaluacionPreventivaPanel | undefined {
  const rawMobileV2 = objetoRegistro(hallazgo.rawMobileV2);
  const preventivaRaw = objetoRegistro(rawMobileV2.evaluacionPreventiva);
  if (!Object.keys(preventivaRaw).length) return undefined;

  const debilidadesRaw = objetoRegistro(preventivaRaw.debilidadesRespaldo);
  const debilidadesRespaldo = {
    evidencia: listaTexto(debilidadesRaw.evidencia),
    trazabilidad: listaTexto(debilidadesRaw.trazabilidad),
    cierre: listaTexto(debilidadesRaw.cierre),
    calidadRespaldo: texto(debilidadesRaw.calidadRespaldo),
    resumen: texto(debilidadesRaw.resumen),
  };
  const tieneDebilidades =
    debilidadesRespaldo.evidencia.length > 0 ||
    debilidadesRespaldo.trazabilidad.length > 0 ||
    debilidadesRespaldo.cierre.length > 0 ||
    Boolean(debilidadesRespaldo.calidadRespaldo || debilidadesRespaldo.resumen);

  const evaluacion: EvaluacionPreventivaPanel = {
    analisisEjecutivo: texto(preventivaRaw.analisisEjecutivo),
    marcoLegalRelacionado: listaTexto(preventivaRaw.marcoLegalRelacionado),
    criteriosCriticosDetectados: listaTexto(
      preventivaRaw.criteriosCriticosDetectados
    ),
    familiaRiesgoPrincipal: texto(preventivaRaw.familiaRiesgoPrincipal),
    debilidadesRespaldo: tieneDebilidades ? debilidadesRespaldo : undefined,
    nivelSuficienciaInformacion: texto(
      preventivaRaw.nivelSuficienciaInformacion
    ),
    motivoTecnicoHallazgo: texto(preventivaRaw.motivoTecnicoHallazgo),
    versionMotorPreventivo: texto(preventivaRaw.versionMotorPreventivo),
  };
  const tieneDatos =
    Boolean(evaluacion.analisisEjecutivo) ||
    Boolean(evaluacion.familiaRiesgoPrincipal) ||
    Boolean(evaluacion.nivelSuficienciaInformacion) ||
    Boolean(evaluacion.motivoTecnicoHallazgo) ||
    Boolean(evaluacion.versionMotorPreventivo) ||
    Boolean(evaluacion.debilidadesRespaldo) ||
    Boolean(evaluacion.marcoLegalRelacionado?.length) ||
    Boolean(evaluacion.criteriosCriticosDetectados?.length);

  return tieneDatos ? evaluacion : undefined;
}

function obtenerBorradoLogico(hallazgo: HallazgoCentral) {
  const rawPanel = objetoRegistro(hallazgo.rawPanel);
  const borradoRaw = objetoRegistro(rawPanel.borradoLogico);
  const eventoBorrado = [...(hallazgo.bitacora || [])]
    .reverse()
    .find((evento) => evento.accion === "hallazgo_anulado_pc");
  const metadata = objetoRegistro(eventoBorrado?.metadata);
  const usuarioRaw = objetoRegistro(borradoRaw.usuario || metadata.usuario);

  if (!Object.keys(borradoRaw).length && !eventoBorrado) return undefined;

  return {
    fechaHora: texto(borradoRaw.fechaHora || eventoBorrado?.fechaHora),
    motivo: texto(borradoRaw.motivo || metadata.motivo),
    usuarioNombre: texto(usuarioRaw.nombre || eventoBorrado?.usuario),
    usuarioEmail: texto(usuarioRaw.email),
    usuarioRol: texto(usuarioRaw.rol),
    estadoAnterior: texto(eventoBorrado?.estadoAnterior, "ABIERTO"),
  };
}

export function adaptarHallazgoCentralAHallazgoPanel(
  hallazgo: HallazgoCentral
): HallazgoPanelDesdeCentral {
  const seguimiento = hallazgo.seguimientoCierre;
  const responsable = seguimiento?.responsable;
  const evidenciaCierre = evidenciasRecibidasPanel(hallazgo);
  const responsableNombre = texto(responsable?.nombre, "Sin asignar");
  const evidenciasPanel = normalizarEvidenciasPanel(hallazgo.evidencias);
  const evidenciasVisibles = evidenciasPanel.filter(
    (evidencia) => evidencia.disponibleVisualmente
  ).length;

  return {
    id: texto(hallazgo.id, hallazgo.codigo),
    codigo: hallazgo.codigo,
    origen: hallazgo.origen,
    empresa: texto(hallazgo.empresa, "Sin empresa"),
    obra: texto(hallazgo.obra, "Sin obra"),
    area: texto(hallazgo.area, "Sin area"),
    tipoHallazgo: hallazgo.tipoHallazgo,
    criticidad: criticidadPanel(hallazgo.criticidad),
    estado: estadoPanel(hallazgo.estado),
    fechaHora: fechaHoraPanel(hallazgo),
    fechaISO: fechaISO(hallazgo),
    reportante: texto(hallazgo.reportante.nombre, "Sin reportante"),
    cargo: texto(hallazgo.reportante.cargo, "Sin cargo"),
    telefono: texto(hallazgo.reportante.telefono, "Sin telefono"),
    descripcion: texto(hallazgo.descripcion, "Sin descripcion"),
    medidaInmediata: texto(
      hallazgo.accionInmediata,
      "Accion inmediata pendiente de definicion"
    ),
    fotos: fotosPanel(evidenciasPanel),
    evidenciasPanel,
    totalEvidencias: evidenciasPanel.length,
    evidenciasPendientesVisualizacion: evidenciasPanel.length - evidenciasVisibles,
    evaluacionPreventiva: evaluacionPreventivaPanel(hallazgo),
    supervisorFoto: texto(
      hallazgo.reportante.fotoUrl || hallazgo.reportante.fotoDataUrl
    ),
    gps: hallazgo.geolocalizacion,
    puntajeEvaluacion: hallazgo.puntajeEvaluacion,
    prioridad: texto(hallazgo.prioridad),
    recomendacion: texto(hallazgo.recomendacion),
    empresaReportante: texto(hallazgo.reportante.empresa, hallazgo.empresa),
    empresaResponsableInvolucrada: texto(responsable?.empresa),
    fechaCompromiso: texto(seguimiento?.fechaCompromiso),
    fechaCierre: texto(seguimiento?.fechaCierre),
    evidenciaCierre,
    responsable: responsableNombre,
    responsableCierreNombre: responsableNombre,
    responsableCierreCargo: texto(responsable?.cargo, "Pendiente"),
    responsableCierreEmpresa: texto(responsable?.empresa, hallazgo.empresa),
    responsableCierreTelefono: texto(responsable?.telefono, "Sin contacto"),
    responsableCierreEstadoSeguimiento: texto(
      seguimiento?.estadoSeguimiento,
      seguimiento?.estadoCierre || "PENDIENTE"
    ),
    responsableCierreFechaCompromiso: texto(seguimiento?.fechaCompromiso),
    responsableCierreEvidencia: evidenciaCierre,
    responsableCierreObservacion: texto(
      seguimiento?.observacionInicial,
      "Responsable de cierre pendiente de definicion"
    ),
    responsableCorreccionTipo: texto(responsable?.tipoResponsable, "contratista"),
    responsableCorreccionNombre: responsableNombre,
    responsableCorreccionCargo: texto(responsable?.cargo, "Pendiente"),
    responsableCorreccionEmpresa: texto(responsable?.empresa, hallazgo.empresa),
    responsableCorreccionTelefono: texto(responsable?.telefono, "Sin contacto"),
    validadorCierreNombre: texto(
      seguimiento?.validadorNombre,
      "Pendiente de validador"
    ),
    validadorCierreEstado: texto(
      seguimiento?.validadorEstado,
      "Pendiente de revision"
    ),
    validadorCierreObservacion: texto(
      seguimiento?.validadorObservacion,
      "Validacion pendiente de evidencia y revision"
    ),
    evidenciaRequerida: unirLista(
      seguimiento?.evidenciaRequerida,
      "Registro fotografico y documentacion de correccion"
    ),
    evidenciaRecibida: evidenciaCierre,
    plazoEstado: texto(seguimiento?.plazoEstado),
    plazoExtendido: Boolean(seguimiento?.plazoExtendido),
    justificacionExtensionPlazo: texto(seguimiento?.justificacionExtensionPlazo),
    cierreSinEvidenciaJustificado: Boolean(
      seguimiento?.cierreSinEvidenciaJustificado
    ),
    justificacionCierreSinEvidencia: texto(
      seguimiento?.justificacionCierreSinEvidencia
    ),
    borradoLogico: obtenerBorradoLogico(hallazgo),
  };
}

export function adaptarHallazgosCentralesAHallazgosPanel(
  hallazgos: HallazgoCentral[]
): HallazgoPanelDesdeCentral[] {
  return hallazgos.map(adaptarHallazgoCentralAHallazgoPanel);
}
