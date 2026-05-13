import type { HallazgoPanel } from "../panel/mockdata";
import type {
  CriticidadHallazgoCentral,
  EstadoHallazgoCentral,
  HallazgoCentral,
} from "../types/hallazgoCentral";

export type HallazgoPanelDesdeCentral = HallazgoPanel & {
  origen?: HallazgoCentral["origen"];
  area?: string;
  supervisorFoto?: string;
  gps?: HallazgoCentral["geolocalizacion"];
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

function criticidadPanel(
  criticidad: CriticidadHallazgoCentral
): HallazgoPanel["criticidad"] {
  if (criticidad === "CRITICO") return "CRÍTICO";
  return criticidad;
}

function estadoPanel(estado: EstadoHallazgoCentral): HallazgoPanel["estado"] {
  if (estado === "EN_SEGUIMIENTO") return "EN SEGUIMIENTO";
  if (estado === "CERRADO") return "CERRADO";
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

function fotosPanel(hallazgo: HallazgoCentral) {
  return (hallazgo.evidencias || [])
    .map((evidencia) => texto(evidencia.url || evidencia.dataUrl))
    .filter(Boolean)
    .slice(0, 3);
}

function unirLista(valor: string[] | undefined, fallback = "") {
  const salida = (valor || []).map((item) => texto(item)).filter(Boolean);
  return salida.length ? salida.join(", ") : fallback;
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

export function adaptarHallazgoCentralAHallazgoPanel(
  hallazgo: HallazgoCentral
): HallazgoPanelDesdeCentral {
  const seguimiento = hallazgo.seguimientoCierre;
  const responsable = seguimiento?.responsable;
  const evidenciaCierre = evidenciasRecibidasPanel(hallazgo);
  const responsableNombre = texto(responsable?.nombre, "Sin asignar");

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
    fotos: fotosPanel(hallazgo),
    supervisorFoto: texto(
      hallazgo.reportante.fotoUrl || hallazgo.reportante.fotoDataUrl
    ),
    gps: hallazgo.geolocalizacion,
    puntajeEvaluacion: hallazgo.puntajeEvaluacion,
    prioridad: texto(hallazgo.prioridad),
    recomendacion: texto(hallazgo.recomendacion),
    fechaCompromiso: texto(seguimiento?.fechaCompromiso),
    fechaCierre: texto(seguimiento?.fechaCierre),
    evidenciaCierre,
    responsable: responsableNombre,
    responsableCierreNombre: responsableNombre,
    responsableCierreCargo: texto(responsable?.cargo, "Pendiente"),
    responsableCierreEmpresa: texto(responsable?.empresa, hallazgo.empresa),
    responsableCierreTelefono: texto(responsable?.telefono, "Sin contacto"),
    responsableCierreEstadoSeguimiento: texto(
      seguimiento?.estadoCierre,
      "PENDIENTE"
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
  };
}

export function adaptarHallazgosCentralesAHallazgosPanel(
  hallazgos: HallazgoCentral[]
): HallazgoPanelDesdeCentral[] {
  return hallazgos.map(adaptarHallazgoCentralAHallazgoPanel);
}
