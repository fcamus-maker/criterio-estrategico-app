import type {
  CriticidadHallazgoCentral,
  EstadoHallazgoCentral,
  HallazgoCentral,
} from "../types/hallazgoCentral";

export type FiltrosMapaGpsHallazgos = {
  fechaDesde?: string;
  fechaHasta?: string;
  empresa?: string;
  obra?: string;
  area?: string;
  criticidad?: CriticidadHallazgoCentral;
  estado?: EstadoHallazgoCentral;
};

export type PuntoMapaGpsHallazgo = {
  id?: string;
  codigo: string;
  latitud: number;
  longitud: number;
  precisionGps?: number;
  estadoGeolocalizacion?: string;
  fechaHoraGeolocalizacion?: string;
  empresa: string;
  obra: string;
  area: string;
  criticidad: CriticidadHallazgoCentral;
  estado: EstadoHallazgoCentral;
  descripcionResumen: string;
};

export type CeldaMapaCalorHallazgo = {
  clave: string;
  latitudPromedio: number;
  longitudPromedio: number;
  total: number;
  criticosAltos: number;
  criticidadMaxima: CriticidadHallazgoCentral;
  codigos: string[];
};

export type ResumenMapaGpsHallazgos = {
  totalConGps: number;
  totalSinGps: number;
  puntos: PuntoMapaGpsHallazgo[];
  mapaCalor: CeldaMapaCalorHallazgo[];
  porEmpresa: Record<string, number>;
  porObra: Record<string, number>;
  porArea: Record<string, number>;
  porCriticidad: Record<CriticidadHallazgoCentral, number>;
  porEstado: Record<EstadoHallazgoCentral, number>;
};

function fechaHallazgo(hallazgo: HallazgoCentral): Date | null {
  const valor =
    hallazgo.fechaHoraReporteISO ||
    hallazgo.fechaCreacion ||
    hallazgo.fechaReporte;
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

function dentroDeFechas(hallazgo: HallazgoCentral, filtros: FiltrosMapaGpsHallazgos) {
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

function cumpleFiltros(hallazgo: HallazgoCentral, filtros: FiltrosMapaGpsHallazgos) {
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

function resumenDescripcion(descripcion: string) {
  const limpia = descripcion.trim();
  return limpia.length > 120 ? `${limpia.slice(0, 117)}...` : limpia;
}

function pesoCriticidad(criticidad: CriticidadHallazgoCentral) {
  if (criticidad === "CRITICO") return 4;
  if (criticidad === "ALTO") return 3;
  if (criticidad === "MEDIO") return 2;
  return 1;
}

function maximaCriticidad(
  actual: CriticidadHallazgoCentral,
  candidata: CriticidadHallazgoCentral
) {
  return pesoCriticidad(candidata) > pesoCriticidad(actual) ? candidata : actual;
}

function claveMapaCalor(latitud: number, longitud: number) {
  return `${latitud.toFixed(3)},${longitud.toFixed(3)}`;
}

export function prepararPuntosMapaGpsHallazgos(
  hallazgos: HallazgoCentral[],
  filtros: FiltrosMapaGpsHallazgos = {}
): PuntoMapaGpsHallazgo[] {
  return hallazgos
    .filter((hallazgo) => cumpleFiltros(hallazgo, filtros))
    .filter((hallazgo) => {
      const gps = hallazgo.geolocalizacion;
      return typeof gps?.latitud === "number" && typeof gps.longitud === "number";
    })
    .map((hallazgo) => ({
      id: hallazgo.id,
      codigo: hallazgo.codigo,
      latitud: hallazgo.geolocalizacion?.latitud as number,
      longitud: hallazgo.geolocalizacion?.longitud as number,
      precisionGps: hallazgo.geolocalizacion?.precisionGps,
      estadoGeolocalizacion: hallazgo.geolocalizacion?.estadoGeolocalizacion,
      fechaHoraGeolocalizacion:
        hallazgo.geolocalizacion?.fechaHoraGeolocalizacion,
      empresa: hallazgo.empresa,
      obra: hallazgo.obra,
      area: hallazgo.area,
      criticidad: hallazgo.criticidad,
      estado: hallazgo.estado,
      descripcionResumen: resumenDescripcion(hallazgo.descripcion),
    }));
}

export function prepararMapaCalorHallazgos(
  puntos: PuntoMapaGpsHallazgo[]
): CeldaMapaCalorHallazgo[] {
  const celdas = new Map<
    string,
    {
      latitudTotal: number;
      longitudTotal: number;
      total: number;
      criticosAltos: number;
      criticidadMaxima: CriticidadHallazgoCentral;
      codigos: string[];
    }
  >();

  for (const punto of puntos) {
    const clave = claveMapaCalor(punto.latitud, punto.longitud);
    const actual =
      celdas.get(clave) ||
      {
        latitudTotal: 0,
        longitudTotal: 0,
        total: 0,
        criticosAltos: 0,
        criticidadMaxima: "BAJO" as CriticidadHallazgoCentral,
        codigos: [],
      };

    actual.latitudTotal += punto.latitud;
    actual.longitudTotal += punto.longitud;
    actual.total += 1;
    actual.criticosAltos +=
      punto.criticidad === "CRITICO" || punto.criticidad === "ALTO" ? 1 : 0;
    actual.criticidadMaxima = maximaCriticidad(
      actual.criticidadMaxima,
      punto.criticidad
    );
    actual.codigos.push(punto.codigo);
    celdas.set(clave, actual);
  }

  return Array.from(celdas.entries()).map(([clave, celda]) => ({
    clave,
    latitudPromedio: celda.latitudTotal / celda.total,
    longitudPromedio: celda.longitudTotal / celda.total,
    total: celda.total,
    criticosAltos: celda.criticosAltos,
    criticidadMaxima: celda.criticidadMaxima,
    codigos: celda.codigos,
  }));
}

export function analizarMapaGpsHallazgos(
  hallazgos: HallazgoCentral[],
  filtros: FiltrosMapaGpsHallazgos = {}
): ResumenMapaGpsHallazgos {
  const hallazgosFiltrados = hallazgos.filter((hallazgo) =>
    cumpleFiltros(hallazgo, filtros)
  );
  const puntos = prepararPuntosMapaGpsHallazgos(hallazgos, filtros);
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
  const porEmpresa: Record<string, number> = {};
  const porObra: Record<string, number> = {};
  const porArea: Record<string, number> = {};

  for (const hallazgo of hallazgosFiltrados) {
    sumarConteo(porCriticidad, hallazgo.criticidad);
    sumarConteo(porEstado, hallazgo.estado);
    porEmpresa[hallazgo.empresa] = (porEmpresa[hallazgo.empresa] || 0) + 1;
    porObra[hallazgo.obra] = (porObra[hallazgo.obra] || 0) + 1;
    porArea[hallazgo.area] = (porArea[hallazgo.area] || 0) + 1;
  }

  return {
    totalConGps: puntos.length,
    totalSinGps: hallazgosFiltrados.length - puntos.length,
    puntos,
    mapaCalor: prepararMapaCalorHallazgos(puntos),
    porEmpresa,
    porObra,
    porArea,
    porCriticidad,
    porEstado,
  };
}
