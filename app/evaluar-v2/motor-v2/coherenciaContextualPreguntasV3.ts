import type { PreguntaFormularioAdaptativaV2 } from "./formularioAdaptativoV2";

export type IncompatibilidadContextualPreguntaV3 = {
  preguntaId: string;
  dominio: string;
};

export type AuditoriaCoherenciaContextualV3 = {
  coherente: boolean;
  incompatibilidades: IncompatibilidadContextualPreguntaV3[];
};

type DominioExclusivo = {
  id: string;
  patron: RegExp;
};

const DOMINIOS_EXCLUSIVOS: DominioExclusivo[] = [
  { id: "vidrio", patron: /\b(vidrio|cristal|espejo)\b/ },
  { id: "excavacion", patron: /\b(excavaci\w*|zanja|entibaci\w*|talud)\b/ },
  {
    id: "altura",
    patron:
      /\b(arnes|linea de vida|anclaje|andamio|borde abierto|borde de excavacion|control de caida|caida de altura|caida de distinto nivel|trabajo en altura)\b/,
  },
  {
    id: "energia_electrica",
    patron: /\b(electric\w*|energiz\w*|loto|tablero|bloqueo de energia|energia peligrosa)\b/,
  },
  {
    id: "sustancias",
    patron: /\b(quimic\w*|sustancia peligrosa|hds|sds|derrame|combustible|gasolina)\b/,
  },
  {
    id: "izaje",
    patron: /\b(izaje|carga suspendida|eslinga|grillete|rigger|grua)\b/,
  },
  {
    id: "vehiculos",
    patron: /\b(vehiculo|camion\w*|bus|neumatic\w*|parabrisas|atropello|colision)\b/,
  },
  {
    id: "maquinaria",
    patron: /\b(maquin\w*|partes moviles|atrapamiento|resguardo)\b/,
  },
  {
    id: "emergencia_incendio",
    patron: /\b(incendio|extintor|fuego|humo|explosion|emergencia real)\b/,
  },
  {
    id: "higiene_ocupacional",
    patron:
      /\b(salud ocupacional|exposicion ocupacional|silice|polvo|ruido|vibracion|proteccion auditiva|hipoacusia)\b/,
  },
];

const normalizar = (valor: unknown) =>
  String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const textoPregunta = (pregunta: PreguntaFormularioAdaptativaV2) =>
  normalizar([
    pregunta.texto,
    pregunta.objetivo,
    ...pregunta.opciones.map((opcion) => opcion.label),
  ].join(" "));

export const auditarCoherenciaContextualPreguntasV3 = (
  textoFuente: string,
  preguntas: PreguntaFormularioAdaptativaV2[],
): AuditoriaCoherenciaContextualV3 => {
  const fuente = normalizar(textoFuente);
  const dominiosFuente = new Set(
    DOMINIOS_EXCLUSIVOS.filter((dominio) => dominio.patron.test(fuente)).map(
      (dominio) => dominio.id,
    ),
  );
  const incompatibilidades = preguntas.flatMap((pregunta) => {
    const texto = textoPregunta(pregunta);
    return DOMINIOS_EXCLUSIVOS.filter(
      (dominio) => dominio.patron.test(texto) && !dominiosFuente.has(dominio.id),
    ).map((dominio) => ({ preguntaId: pregunta.id, dominio: dominio.id }));
  });

  return {
    coherente: incompatibilidades.length === 0,
    incompatibilidades,
  };
};
