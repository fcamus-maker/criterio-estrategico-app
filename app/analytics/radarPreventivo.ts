import type {
  CriticidadHallazgoCentral,
  EstadoHallazgoCentral,
  HallazgoCentral,
  TipoHallazgoCentral,
} from "../types/hallazgoCentral";

export type NivelAlertaPreventiva = "normal" | "observacion" | "alerta" | "critica";

export type TipoAlertaPreventiva =
  | "acumulacion_criticidad_alta"
  | "reincidencia_area"
  | "reincidencia_empresa"
  | "reincidencia_obra"
  | "reincidencia_tipo"
  | "reincidencia_causa"
  | "zona_critica"
  | "falta_cierre"
  | "criticos_abiertos";

export type AlertaPreventiva = {
  tipo: TipoAlertaPreventiva;
  nivel: NivelAlertaPreventiva;
  titulo: string;
  detalle: string;
  total: number;
  codigos: string[];
};

export type FiltrosRadarPreventivo = {
  fechaDesde?: string;
  fechaHasta?: string;
  empresa?: string;
  obra?: string;
  area?: string;
  criticidad?: CriticidadHallazgoCentral;
  estado?: EstadoHallazgoCentral;
};

export type ResumenRadarPreventivo = {
  totalHallazgos: number;
  porCriticidad: Record<CriticidadHallazgoCentral, number>;
  porEstado: Record<EstadoHallazgoCentral, number>;
  porArea: Record<string, number>;
  porEmpresa: Record<string, number>;
  porObra: Record<string, number>;
  porTipoHallazgo: Record<TipoHallazgoCentral, number>;
  porCausaDominante: Record<string, number>;
  criticosAltos: number;
  criticosAbiertos: number;
  sinCierre: number;
  vencidos: number;
  alertas: AlertaPreventiva[];
  nivelGeneral: NivelAlertaPreventiva;
  resumenEjecutivo: string;
};

function fechaHallazgo(hallazgo: HallazgoCentral): Date | null {
  const valor =
    hallazgo.fechaHoraReporteISO ||
    hallazgo.fechaCreacion ||
    hallazgo.fechaReporte;
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

function dentroDeFechas(hallazgo: HallazgoCentral, filtros: FiltrosRadarPreventivo) {
  const fecha = fechaHallazgo(hallazgo);
  if (!fecha) return true;

  if (filtros.fechaDesde && fecha < new Date(`${filtros.fechaDesde}T00:00:00`)) {
    return false;
  }

  if (filtros.fechaHasta && fecha > new Date(`${filtros.fechaHasta}T23:59:59`)) {
    return false;
  }

  return true;
}

function cumpleFiltros(hallazgo: HallazgoCentral, filtros: FiltrosRadarPreventivo) {
  return (
    (!filtros.empresa || hallazgo.empresa === filtros.empresa) &&
    (!filtros.obra || hallazgo.obra === filtros.obra) &&
    (!filtros.area || hallazgo.area === filtros.area) &&
    (!filtros.criticidad || hallazgo.criticidad === filtros.criticidad) &&
    (!filtros.estado || hallazgo.estado === filtros.estado) &&
    dentroDeFechas(hallazgo, filtros)
  );
}

function sumarConteo<T extends string>(registro: Record<T, number>, clave: T) {
  registro[clave] = (registro[clave] || 0) + 1;
}

function agruparPor(
  hallazgos: HallazgoCentral[],
  selector: (hallazgo: HallazgoCentral) => string
) {
  return hallazgos.reduce<Record<string, HallazgoCentral[]>>((grupos, hallazgo) => {
    const clave = selector(hallazgo) || "SIN_DATO";
    grupos[clave] = [...(grupos[clave] || []), hallazgo];
    return grupos;
  }, {});
}

function codigos(hallazgos: HallazgoCentral[]) {
  return hallazgos.map((hallazgo) => hallazgo.codigo);
}

function nivelPorTotal(total: number, umbralAlerta: number, umbralCritico: number) {
  if (total >= umbralCritico) return "critica";
  if (total >= umbralAlerta) return "alerta";
  if (total > 0) return "observacion";
  return "normal";
}

function alerta(
  tipo: TipoAlertaPreventiva,
  nivel: NivelAlertaPreventiva,
  titulo: string,
  detalle: string,
  hallazgos: HallazgoCentral[]
): AlertaPreventiva {
  return {
    tipo,
    nivel,
    titulo,
    detalle,
    total: hallazgos.length,
    codigos: codigos(hallazgos),
  };
}

function estaAbierto(hallazgo: HallazgoCentral) {
  return hallazgo.estado !== "CERRADO" && hallazgo.estado !== "ANULADO";
}

function estaVencido(hallazgo: HallazgoCentral) {
  const fechaCompromiso = hallazgo.seguimientoCierre?.fechaCompromiso;
  if (!fechaCompromiso || !estaAbierto(hallazgo)) return false;

  const fecha = new Date(`${fechaCompromiso}T23:59:59`);
  return !Number.isNaN(fecha.getTime()) && fecha < new Date();
}

function crearAlertasReincidencia(
  tipo: TipoAlertaPreventiva,
  grupos: Record<string, HallazgoCentral[]>,
  etiqueta: string
) {
  return Object.entries(grupos)
    .filter(([, hallazgos]) => hallazgos.length >= 3)
    .map(([clave, hallazgos]) =>
      alerta(
        tipo,
        nivelPorTotal(hallazgos.length, 3, 6),
        `Reincidencia por ${etiqueta}`,
        `${clave}: ${hallazgos.length} hallazgo(s) registrados.`,
        hallazgos
      )
    );
}

function mayorNivel(alertas: AlertaPreventiva[]): NivelAlertaPreventiva {
  if (alertas.some((item) => item.nivel === "critica")) return "critica";
  if (alertas.some((item) => item.nivel === "alerta")) return "alerta";
  if (alertas.some((item) => item.nivel === "observacion")) return "observacion";
  return "normal";
}

function resumenEjecutivo(
  total: number,
  criticosAltos: number,
  sinCierre: number,
  alertas: AlertaPreventiva[]
) {
  if (total === 0) {
    return "Sin hallazgos disponibles para analisis preventivo en el periodo seleccionado.";
  }

  if (alertas.some((item) => item.nivel === "critica")) {
    return `Radar Preventivo identifica concentracion critica: ${criticosAltos} hallazgo(s) criticos/altos y ${sinCierre} pendiente(s) de cierre.`;
  }

  if (alertas.some((item) => item.nivel === "alerta")) {
    return `Radar Preventivo detecta patrones relevantes de repeticion o criticidad: ${criticosAltos} hallazgo(s) criticos/altos.`;
  }

  return `Radar Preventivo sin alertas mayores; se recomienda mantener seguimiento sobre ${sinCierre} hallazgo(s) pendiente(s).`;
}

export function analizarRadarPreventivo(
  hallazgos: HallazgoCentral[],
  filtros: FiltrosRadarPreventivo = {}
): ResumenRadarPreventivo {
  const filtrados = hallazgos.filter((hallazgo) => cumpleFiltros(hallazgo, filtros));
  const porCriticidad: Record<CriticidadHallazgoCentral, number> = {
    BAJO: 0,
    MEDIO: 0,
    ALTO: 0,
    CRITICO: 0,
  };
  const porEstado: Record<EstadoHallazgoCentral, number> = {
    REPORTADO: 0,
    ABIERTO: 0,
    EN_SEGUIMIENTO: 0,
    CERRADO: 0,
    ANULADO: 0,
  };
  const porArea: Record<string, number> = {};
  const porEmpresa: Record<string, number> = {};
  const porObra: Record<string, number> = {};
  const porTipoHallazgo: Record<TipoHallazgoCentral, number> = {
    "Condicion subestandar": 0,
    "Acto subestandar": 0,
    Incidente: 0,
    "Observacion preventiva": 0,
    Otro: 0,
  };
  const porCausaDominante: Record<string, number> = {};

  for (const hallazgo of filtrados) {
    sumarConteo(porCriticidad, hallazgo.criticidad);
    sumarConteo(porEstado, hallazgo.estado);
    sumarConteo(porTipoHallazgo, hallazgo.tipoHallazgo);
    porArea[hallazgo.area] = (porArea[hallazgo.area] || 0) + 1;
    porEmpresa[hallazgo.empresa] = (porEmpresa[hallazgo.empresa] || 0) + 1;
    porObra[hallazgo.obra] = (porObra[hallazgo.obra] || 0) + 1;

    const causa = hallazgo.radarPreventivo?.causaDominante || "SIN_CAUSA";
    porCausaDominante[causa] = (porCausaDominante[causa] || 0) + 1;
  }

  const criticosAltos = filtrados.filter(
    (hallazgo) => hallazgo.criticidad === "CRITICO" || hallazgo.criticidad === "ALTO"
  );
  const criticosAbiertos = filtrados.filter(
    (hallazgo) => hallazgo.criticidad === "CRITICO" && estaAbierto(hallazgo)
  );
  const sinCierre = filtrados.filter((hallazgo) => estaAbierto(hallazgo));
  const vencidos = filtrados.filter(estaVencido);
  const conGps = filtrados.filter((hallazgo) => hallazgo.geolocalizacion);

  const alertas: AlertaPreventiva[] = [
    ...(criticosAltos.length >= 3
      ? [
          alerta(
            "acumulacion_criticidad_alta",
            nivelPorTotal(criticosAltos.length, 3, 6),
            "Acumulacion de criticidad alta",
            `${criticosAltos.length} hallazgo(s) criticos o altos requieren atencion prioritaria.`,
            criticosAltos
          ),
        ]
      : []),
    ...(criticosAbiertos.length > 0
      ? [
          alerta(
            "criticos_abiertos",
            nivelPorTotal(criticosAbiertos.length, 1, 3),
            "Hallazgos criticos abiertos",
            `${criticosAbiertos.length} hallazgo(s) criticos permanecen abiertos.`,
            criticosAbiertos
          ),
        ]
      : []),
    ...(vencidos.length > 0
      ? [
          alerta(
            "falta_cierre",
            nivelPorTotal(vencidos.length, 1, 4),
            "Compromisos vencidos",
            `${vencidos.length} hallazgo(s) abiertos superan su fecha compromiso.`,
            vencidos
          ),
        ]
      : []),
    ...crearAlertasReincidencia(
      "reincidencia_area",
      agruparPor(filtrados, (hallazgo) => hallazgo.area),
      "area"
    ),
    ...crearAlertasReincidencia(
      "reincidencia_empresa",
      agruparPor(filtrados, (hallazgo) => hallazgo.empresa),
      "empresa"
    ),
    ...crearAlertasReincidencia(
      "reincidencia_obra",
      agruparPor(filtrados, (hallazgo) => hallazgo.obra),
      "obra"
    ),
    ...crearAlertasReincidencia(
      "reincidencia_tipo",
      agruparPor(filtrados, (hallazgo) => hallazgo.tipoHallazgo),
      "tipo"
    ),
    ...crearAlertasReincidencia(
      "reincidencia_causa",
      agruparPor(
        filtrados,
        (hallazgo) => hallazgo.radarPreventivo?.causaDominante || "SIN_CAUSA"
      ),
      "causa dominante"
    ),
    ...crearAlertasReincidencia(
      "zona_critica",
      agruparPor(conGps, (hallazgo) => {
        const gps = hallazgo.geolocalizacion;
        return gps ? `${gps.latitud.toFixed(3)},${gps.longitud.toFixed(3)}` : "";
      }),
      "zona GPS"
    ),
  ];
  const nivelGeneral = mayorNivel(alertas);

  return {
    totalHallazgos: filtrados.length,
    porCriticidad,
    porEstado,
    porArea,
    porEmpresa,
    porObra,
    porTipoHallazgo,
    porCausaDominante,
    criticosAltos: criticosAltos.length,
    criticosAbiertos: criticosAbiertos.length,
    sinCierre: sinCierre.length,
    vencidos: vencidos.length,
    alertas,
    nivelGeneral,
    resumenEjecutivo: resumenEjecutivo(
      filtrados.length,
      criticosAltos.length,
      sinCierre.length,
      alertas
    ),
  };
}
