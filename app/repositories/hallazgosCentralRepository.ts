import type {
  BitacoraHallazgoCentral,
  EstadoHallazgoCentral,
  GeolocalizacionHallazgoCentral,
  HallazgoCentral,
  SeguimientoCierreCentral,
} from "../types/hallazgoCentral";

export type ResultadoRepositorioCentral<T> =
  | {
      ok: true;
      data: T;
      origen: "central-disabled" | "supabase";
    }
  | {
      ok: false;
      error: string;
      origen: "central-disabled" | "supabase";
    };

export type FiltrosHallazgosCentrales = {
  empresa?: string;
  obra?: string;
  area?: string;
  estado?: EstadoHallazgoCentral;
  criticidad?: HallazgoCentral["criticidad"];
  fechaDesde?: string;
  fechaHasta?: string;
  origen?: HallazgoCentral["origen"];
};

export type FiltrosMapaGpsCentral = FiltrosHallazgosCentrales & {
  soloConGps?: boolean;
  zona?: string;
  sector?: string;
};

export type PuntoMapaHallazgoCentral = {
  id?: string;
  codigo: string;
  empresa: string;
  obra: string;
  area: string;
  criticidad: HallazgoCentral["criticidad"];
  estado: HallazgoCentral["estado"];
  geolocalizacion: GeolocalizacionHallazgoCentral;
};

export type FiltrosRadarPreventivoCentral = FiltrosHallazgosCentrales & {
  categoriaRiesgo?: string;
  causaDominante?: string;
};

export type ResumenRadarPreventivoCentral = {
  totalHallazgos: number;
  porCriticidad: Record<HallazgoCentral["criticidad"], number>;
  porCategoriaRiesgo: Record<string, number>;
  requiereAccionInmediata: number;
  requiereDetencionTrabajo: number;
};

const MENSAJE_REPOSITORIO_DESACTIVADO =
  "Repositorio central de hallazgos preparado, pero sin conexion real a base central.";

function falloRepositorioDesactivado<T>(): ResultadoRepositorioCentral<T> {
  return {
    ok: false,
    error: MENSAJE_REPOSITORIO_DESACTIVADO,
    origen: "central-disabled",
  };
}

function lecturaVacia<T>(data: T): ResultadoRepositorioCentral<T> {
  return {
    ok: true,
    data,
    origen: "central-disabled",
  };
}

// Capa de repositorio central preparada para una futura implementacion Supabase.
// Por ahora no lee ni escribe datos reales: evita efectos laterales en la app V2
// y en el panel PC hasta que exista tabla, RLS, Storage y estrategia de sync.
export async function listarHallazgosCentrales(
  filtros: FiltrosHallazgosCentrales = {}
): Promise<ResultadoRepositorioCentral<HallazgoCentral[]>> {
  void filtros;
  return lecturaVacia([]);
}

export async function obtenerHallazgoCentralPorId(
  id: string
): Promise<ResultadoRepositorioCentral<HallazgoCentral | null>> {
  void id;
  return lecturaVacia(null);
}

export async function crearHallazgoCentral(
  hallazgo: HallazgoCentral
): Promise<ResultadoRepositorioCentral<HallazgoCentral>> {
  void hallazgo;
  return falloRepositorioDesactivado();
}

export async function actualizarHallazgoCentral(
  id: string,
  cambios: Partial<HallazgoCentral>
): Promise<ResultadoRepositorioCentral<HallazgoCentral>> {
  void id;
  void cambios;
  return falloRepositorioDesactivado();
}

export async function actualizarEstadoHallazgoCentral(
  id: string,
  estado: EstadoHallazgoCentral
): Promise<ResultadoRepositorioCentral<HallazgoCentral>> {
  void id;
  void estado;
  return falloRepositorioDesactivado();
}

export async function actualizarSeguimientoCierre(
  id: string,
  seguimiento: SeguimientoCierreCentral
): Promise<ResultadoRepositorioCentral<HallazgoCentral>> {
  void id;
  void seguimiento;
  return falloRepositorioDesactivado();
}

export async function registrarEventoBitacora(
  id: string,
  evento: BitacoraHallazgoCentral
): Promise<ResultadoRepositorioCentral<HallazgoCentral>> {
  void id;
  void evento;
  return falloRepositorioDesactivado();
}

export async function listarHallazgosParaMapaGps(
  filtros: FiltrosMapaGpsCentral = {}
): Promise<ResultadoRepositorioCentral<PuntoMapaHallazgoCentral[]>> {
  void filtros;
  return lecturaVacia([]);
}

export async function obtenerResumenRadarPreventivo(
  filtros: FiltrosRadarPreventivoCentral = {}
): Promise<ResultadoRepositorioCentral<ResumenRadarPreventivoCentral>> {
  void filtros;
  return lecturaVacia({
    totalHallazgos: 0,
    porCriticidad: {
      BAJO: 0,
      MEDIO: 0,
      ALTO: 0,
      CRITICO: 0,
    },
    porCategoriaRiesgo: {},
    requiereAccionInmediata: 0,
    requiereDetencionTrabajo: 0,
  });
}

export type PrepararRadarPreventivoInput = Pick<
  HallazgoCentral,
  "criticidad" | "radarPreventivo"
>;

export function prepararIndicadoresRadarPreventivo(
  hallazgos: PrepararRadarPreventivoInput[]
): ResumenRadarPreventivoCentral {
  return hallazgos.reduce<ResumenRadarPreventivoCentral>(
    (resumen, hallazgo) => {
      const categoria =
        hallazgo.radarPreventivo?.categoriaRiesgo || "SIN_CATEGORIA";

      resumen.totalHallazgos += 1;
      resumen.porCriticidad[hallazgo.criticidad] += 1;
      resumen.porCategoriaRiesgo[categoria] =
        (resumen.porCategoriaRiesgo[categoria] || 0) + 1;

      if (hallazgo.radarPreventivo?.requiereAccionInmediata) {
        resumen.requiereAccionInmediata += 1;
      }

      if (hallazgo.radarPreventivo?.requiereDetencionTrabajo) {
        resumen.requiereDetencionTrabajo += 1;
      }

      return resumen;
    },
    {
      totalHallazgos: 0,
      porCriticidad: {
        BAJO: 0,
        MEDIO: 0,
        ALTO: 0,
        CRITICO: 0,
      },
      porCategoriaRiesgo: {},
      requiereAccionInmediata: 0,
      requiereDetencionTrabajo: 0,
    }
  );
}

export type PrepararMapaGpsInput = Pick<
  HallazgoCentral,
  "id" | "codigo" | "empresa" | "obra" | "area" | "criticidad" | "estado" | "geolocalizacion"
>;

export function prepararPuntosMapaGps(
  hallazgos: PrepararMapaGpsInput[]
): PuntoMapaHallazgoCentral[] {
  return hallazgos
    .filter((hallazgo) => Boolean(hallazgo.geolocalizacion))
    .map((hallazgo) => ({
      id: hallazgo.id,
      codigo: hallazgo.codigo,
      empresa: hallazgo.empresa,
      obra: hallazgo.obra,
      area: hallazgo.area,
      criticidad: hallazgo.criticidad,
      estado: hallazgo.estado,
      geolocalizacion: hallazgo.geolocalizacion as GeolocalizacionHallazgoCentral,
    }));
}

export type RepositorioCentralHallazgos = {
  listarHallazgosCentrales: typeof listarHallazgosCentrales;
  obtenerHallazgoCentralPorId: typeof obtenerHallazgoCentralPorId;
  crearHallazgoCentral: typeof crearHallazgoCentral;
  actualizarHallazgoCentral: typeof actualizarHallazgoCentral;
  actualizarEstadoHallazgoCentral: typeof actualizarEstadoHallazgoCentral;
  actualizarSeguimientoCierre: typeof actualizarSeguimientoCierre;
  registrarEventoBitacora: typeof registrarEventoBitacora;
  listarHallazgosParaMapaGps: typeof listarHallazgosParaMapaGps;
  obtenerResumenRadarPreventivo: typeof obtenerResumenRadarPreventivo;
};

export const repositorioCentralHallazgos: RepositorioCentralHallazgos = {
  listarHallazgosCentrales,
  obtenerHallazgoCentralPorId,
  crearHallazgoCentral,
  actualizarHallazgoCentral,
  actualizarEstadoHallazgoCentral,
  actualizarSeguimientoCierre,
  registrarEventoBitacora,
  listarHallazgosParaMapaGps,
  obtenerResumenRadarPreventivo,
};
