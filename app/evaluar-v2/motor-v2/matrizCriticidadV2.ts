import type { Criticidad, EvaluacionInputV2 } from "./types";

export type CategoriaReglaCriticidadV2 = "menor" | "relevante" | "critico";

export type ReglaCriticidadV2 = {
  id: string;
  categoria: CategoriaReglaCriticidadV2;
  nombre: string;
  criticidadBase: Criticidad;
  topeMaximo: Criticidad;
  palabrasClave: string[];
  senalCritica?: string;
};

export const ORDEN_CRITICIDAD: Record<Criticidad, number> = {
  BAJO: 0,
  MEDIO: 1,
  ALTO: 2,
  CRITICO: 3,
};

const CRITICIDAD_POR_VALOR: Criticidad[] = ["BAJO", "MEDIO", "ALTO", "CRITICO"];

export const REGLAS_CRITICIDAD_V2: ReglaCriticidadV2[] = [
  {
    id: "orden_aseo_menor",
    categoria: "menor",
    nombre: "Orden y aseo menor",
    criticidadBase: "BAJO",
    topeMaximo: "MEDIO",
    palabrasClave: ["orden", "aseo", "desorden", "limpieza", "menor"],
  },
  {
    id: "objeto_inofensivo",
    categoria: "menor",
    nombre: "Objeto inofensivo o elemento abandonado sin exposicion",
    criticidadBase: "BAJO",
    topeMaximo: "MEDIO",
    palabrasClave: ["maleta", "mochila", "bolso", "objeto inofensivo", "elemento abandonado"],
  },
  {
    id: "senalizacion_menor",
    categoria: "menor",
    nombre: "Senalizacion menor",
    criticidadBase: "BAJO",
    topeMaximo: "MEDIO",
    palabrasClave: ["senalizacion menor", "cartel", "letrero", "demarcacion menor"],
  },
  {
    id: "documento_faltante_sin_riesgo",
    categoria: "menor",
    nombre: "Documento faltante sin actividad riesgosa inmediata",
    criticidadBase: "MEDIO",
    topeMaximo: "MEDIO",
    palabrasClave: ["documento faltante", "registro faltante", "procedimiento faltante", "permiso faltante"],
  },
  {
    id: "condicion_con_exposicion",
    categoria: "relevante",
    nombre: "Condicion subestandar con exposicion",
    criticidadBase: "MEDIO",
    topeMaximo: "ALTO",
    palabrasClave: ["condicion subestandar", "exposicion", "sin control", "control parcial"],
  },
  {
    id: "herramienta_equipo_defectuoso",
    categoria: "relevante",
    nombre: "Herramienta o equipo defectuoso",
    criticidadBase: "MEDIO",
    topeMaximo: "ALTO",
    palabrasClave: ["herramienta defectuosa", "equipo defectuoso", "equipo danado", "herramienta danada"],
  },
  {
    id: "superficie_peligrosa",
    categoria: "relevante",
    nombre: "Superficie peligrosa",
    criticidadBase: "MEDIO",
    topeMaximo: "ALTO",
    palabrasClave: ["piso mojado", "superficie resbaladiza", "desnivel", "transito activo"],
  },
  {
    id: "obstruccion_operativa",
    categoria: "relevante",
    nombre: "Obstruccion operativa",
    criticidadBase: "MEDIO",
    topeMaximo: "ALTO",
    palabrasClave: ["obstruccion", "bloqueo parcial", "pasillo obstruido", "acceso obstruido"],
  },
  {
    id: "exposicion_higienica",
    categoria: "relevante",
    nombre: "Exposicion higienica sin control",
    criticidadBase: "MEDIO",
    topeMaximo: "ALTO",
    palabrasClave: ["ruido", "polvo", "quimico", "sustancia quimica", "calor", "radiacion", "biologico"],
  },
  {
    id: "trabajo_altura_sin_proteccion",
    categoria: "critico",
    nombre: "Trabajo en altura sin proteccion",
    criticidadBase: "CRITICO",
    topeMaximo: "CRITICO",
    palabrasClave: ["altura sin arnes", "trabajo en altura sin arnes", "altura sin proteccion"],
    senalCritica: "Trabajo en altura sin proteccion efectiva.",
  },
  {
    id: "energia_peligrosa_expuesta",
    categoria: "critico",
    nombre: "Energia peligrosa expuesta",
    criticidadBase: "CRITICO",
    topeMaximo: "CRITICO",
    palabrasClave: ["cable energizado", "energia peligrosa", "electrico expuesto", "conductor energizado"],
    senalCritica: "Energia peligrosa expuesta o no controlada.",
  },
  {
    id: "carga_suspendida",
    categoria: "critico",
    nombre: "Carga suspendida con exposicion",
    criticidadBase: "CRITICO",
    topeMaximo: "CRITICO",
    palabrasClave: ["carga suspendida", "izaje", "grua con carga"],
    senalCritica: "Carga suspendida o izaje con personas expuestas.",
  },
  {
    id: "maquinaria_sin_resguardo",
    categoria: "critico",
    nombre: "Maquinaria sin resguardo",
    criticidadBase: "ALTO",
    topeMaximo: "CRITICO",
    palabrasClave: ["maquinaria sin resguardo", "equipo sin resguardo", "partes moviles expuestas"],
    senalCritica: "Maquinaria o equipo sin resguardo con acceso a partes peligrosas.",
  },
  {
    id: "via_evacuacion_critica",
    categoria: "critico",
    nombre: "Bloqueo de via de evacuacion critica",
    criticidadBase: "ALTO",
    topeMaximo: "CRITICO",
    palabrasClave: ["salida de emergencia bloqueada", "via de evacuacion bloqueada", "ruta de evacuacion bloqueada"],
    senalCritica: "Bloqueo efectivo de via de evacuacion o salida de emergencia.",
  },
  {
    id: "fuego_explosion",
    categoria: "critico",
    nombre: "Fuego o explosion",
    criticidadBase: "CRITICO",
    topeMaximo: "CRITICO",
    palabrasClave: ["fuego", "incendio", "explosion", "atmosfera peligrosa"],
    senalCritica: "Condicion de fuego, explosion o atmosfera peligrosa.",
  },
  {
    id: "espacio_confinado",
    categoria: "critico",
    nombre: "Espacio confinado sin control",
    criticidadBase: "CRITICO",
    topeMaximo: "CRITICO",
    palabrasClave: ["espacio confinado", "ingreso confinado"],
    senalCritica: "Espacio confinado sin controles criticos confirmados.",
  },
  {
    id: "sustancia_peligrosa_liberada",
    categoria: "critico",
    nombre: "Sustancia peligrosa liberada",
    criticidadBase: "ALTO",
    topeMaximo: "CRITICO",
    palabrasClave: ["sustancia peligrosa liberada", "fuga sustancia peligrosa", "derrame sustancia peligrosa"],
    senalCritica: "Sustancia peligrosa liberada o fuga sin control.",
  },
  {
    id: "derrame_medio_receptor",
    categoria: "critico",
    nombre: "Derrame hacia suelo, agua o alcantarillado",
    criticidadBase: "ALTO",
    topeMaximo: "CRITICO",
    palabrasClave: ["derrame a suelo", "derrame al suelo", "derrame a agua", "alcantarillado", "drenaje"],
    senalCritica: "Derrame no contenido hacia suelo, agua, drenaje o alcantarillado.",
  },
  {
    id: "lesion_grave_inmediata",
    categoria: "critico",
    nombre: "Riesgo inmediato de lesion grave o fatal",
    criticidadBase: "CRITICO",
    topeMaximo: "CRITICO",
    palabrasClave: ["riesgo grave", "riesgo fatal", "lesion grave", "fatal"],
    senalCritica: "Riesgo inmediato de lesion grave o fatal con exposicion directa.",
  },
];

export function normalizarTextoMotorV2(valor?: string): string {
  return (valor ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function obtenerPesoCriticidad(criticidad: Criticidad): number {
  return ORDEN_CRITICIDAD[criticidad];
}

export function subirCriticidad(criticidad: Criticidad, niveles = 1): Criticidad {
  const peso = Math.min(ORDEN_CRITICIDAD[criticidad] + niveles, ORDEN_CRITICIDAD.CRITICO);
  return CRITICIDAD_POR_VALOR[peso] ?? "CRITICO";
}

export function limitarCriticidad(criticidad: Criticidad, tope: Criticidad): Criticidad {
  return obtenerPesoCriticidad(criticidad) > obtenerPesoCriticidad(tope) ? tope : criticidad;
}

export function obtenerTextoBusquedaMotorV2(input: Pick<EvaluacionInputV2, "tipoHallazgo" | "descripcion" | "area" | "actividad">): string {
  return normalizarTextoMotorV2(
    [input.tipoHallazgo, input.descripcion, input.area, input.actividad].filter(Boolean).join(" ")
  );
}

export function obtenerReglaCriticidadV2(input: EvaluacionInputV2): ReglaCriticidadV2 | undefined {
  const texto = obtenerTextoBusquedaMotorV2(input);
  return REGLAS_CRITICIDAD_V2.find((regla) =>
    regla.palabrasClave.some((palabra) => texto.includes(normalizarTextoMotorV2(palabra)))
  );
}

export function esHallazgoMenorV2(input: EvaluacionInputV2): boolean {
  const regla = obtenerReglaCriticidadV2(input);
  if (regla?.categoria === "menor") return true;

  const texto = obtenerTextoBusquedaMotorV2(input);
  return ["menor", "inofensivo", "sin transito", "sin exposicion"].some((palabra) => texto.includes(palabra));
}

export function calcularCriticidadBaseV2(input: EvaluacionInputV2): {
  criticidadBase: Criticidad;
  topeMaximo: Criticidad;
  regla?: ReglaCriticidadV2;
} {
  const regla = obtenerReglaCriticidadV2(input);
  if (regla) {
    return {
      criticidadBase: regla.criticidadBase,
      topeMaximo: regla.topeMaximo,
      regla,
    };
  }

  if (input.ambitoDeclarado === "legal_documental") {
    return { criticidadBase: "MEDIO", topeMaximo: "MEDIO" };
  }

  if (input.ambitoDeclarado === "medio_ambiente") {
    return { criticidadBase: "MEDIO", topeMaximo: "ALTO" };
  }

  return { criticidadBase: "MEDIO", topeMaximo: "ALTO" };
}

