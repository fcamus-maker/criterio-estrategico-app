export type OpcionEvaluacion = {
  label: string;
  value: string;
  score: number;
};

export type PreguntaEvaluacion = {
  id: string;
  paso: 1 | 2 | 3;
  bloque: "critica" | "operacional" | "documental";
  texto: string;
  opciones: OpcionEvaluacion[];
};

export type RespuestasEvaluacion = Record<string, string>;

export const preguntasEvaluacion: PreguntaEvaluacion[] = [
  {
    id: "p1",
    paso: 1,
    bloque: "critica",
    texto: "¿Existe exposición actual de personas al peligro?",
    opciones: [
      { label: "Sí", value: "si", score: 12 },
      { label: "Parcial", value: "parcial", score: 6 },
      { label: "No", value: "no", score: 0 },
    ],
  },
  {
    id: "p2",
    paso: 1,
    bloque: "critica",
    texto: "¿La consecuencia potencial podría ser grave o fatal?",
    opciones: [
      { label: "Sí", value: "si", score: 18 },
      { label: "Parcial", value: "parcial", score: 9 },
      { label: "No", value: "no", score: 0 },
    ],
  },
  {
    id: "p3",
    paso: 1,
    bloque: "critica",
    texto: "¿Existe posibilidad de ocurrencia inmediata?",
    opciones: [
      { label: "Alta", value: "alta", score: 15 },
      { label: "Media", value: "media", score: 8 },
      { label: "Baja", value: "baja", score: 2 },
    ],
  },
  {
    id: "p4",
    paso: 1,
    bloque: "critica",
    texto: "¿El peligro estaba activo al momento del reporte?",
    opciones: [
      { label: "Sí", value: "si", score: 12 },
      { label: "Parcial", value: "parcial", score: 6 },
      { label: "No", value: "no", score: 0 },
    ],
  },
  {
    id: "p5",
    paso: 1,
    bloque: "critica",
    texto: "¿El área estaba segregada o controlada?",
    opciones: [
      { label: "Sí", value: "si", score: 0 },
      { label: "Parcial", value: "parcial", score: 5 },
      { label: "No", value: "no", score: 10 },
    ],
  },
  {
    id: "p6",
    paso: 1,
    bloque: "critica",
    texto: "¿Había medidas de control visibles y operativas?",
    opciones: [
      { label: "Sí", value: "si", score: 0 },
      { label: "Parcial", value: "parcial", score: 6 },
      { label: "No", value: "no", score: 12 },
    ],
  },
  {
    id: "p7",
    paso: 2,
    bloque: "operacional",
    texto: "¿La tarea estaba en ejecución al detectar el hallazgo?",
    opciones: [
      { label: "Sí", value: "si", score: 8 },
      { label: "No", value: "no", score: 0 },
    ],
  },
  {
    id: "p8",
    paso: 2,
    bloque: "operacional",
    texto: "¿Existe posibilidad de repetición inmediata?",
    opciones: [
      { label: "Alta", value: "alta", score: 12 },
      { label: "Media", value: "media", score: 6 },
      { label: "Baja", value: "baja", score: 2 },
    ],
  },
  {
    id: "p9",
    paso: 2,
    bloque: "operacional",
    texto: "¿El trabajo fue detenido al detectar la condición?",
    opciones: [
      { label: "Sí", value: "si", score: 0 },
      { label: "No", value: "no", score: 10 },
      { label: "No aplica", value: "no_aplica", score: 0 },
    ],
  },
  {
    id: "p10",
    paso: 2,
    bloque: "operacional",
    texto: "¿La tarea involucra energía peligrosa o condición de alto potencial?",
    opciones: [
      { label: "Sí", value: "si", score: 12 },
      { label: "Parcial", value: "parcial", score: 6 },
      { label: "No", value: "no", score: 0 },
    ],
  },
  {
    id: "p11",
    paso: 2,
    bloque: "operacional",
    texto: "¿El entorno afecta a terceros, tránsito o áreas adyacentes?",
    opciones: [
      { label: "Sí", value: "si", score: 8 },
      { label: "Parcial", value: "parcial", score: 4 },
      { label: "No", value: "no", score: 0 },
    ],
  },
  {
    id: "p12",
    paso: 2,
    bloque: "operacional",
    texto: "¿Existen barreras físicas, señalización o demarcación suficiente?",
    opciones: [
      { label: "Sí", value: "si", score: 0 },
      { label: "Parcial", value: "parcial", score: 4 },
      { label: "No", value: "no", score: 8 },
    ],
  },
  {
    id: "p13",
    paso: 2,
    bloque: "operacional",
    texto: "¿La condición podría escalar antes de la próxima intervención?",
    opciones: [
      { label: "Sí", value: "si", score: 10 },
      { label: "Parcial", value: "parcial", score: 5 },
      { label: "No", value: "no", score: 0 },
    ],
  },
  {
    id: "p14",
    paso: 3,
    bloque: "documental",
    texto: "¿Existe procedimiento de trabajo seguro (PTS) para esta tarea?",
    opciones: [
      { label: "Sí", value: "si", score: 0 },
      { label: "No", value: "no", score: 10 },
    ],
  },
  {
    id: "p15",
    paso: 3,
    bloque: "documental",
    texto: "¿El procedimiento está actualizado y vigente?",
    opciones: [
      { label: "Sí", value: "si", score: 0 },
      { label: "No", value: "no", score: 8 },
      { label: "No aplica", value: "no_aplica", score: 0 },
    ],
  },
  {
    id: "p16",
    paso: 3,
    bloque: "documental",
    texto: "¿El trabajador fue capacitado en este procedimiento?",
    opciones: [
      { label: "Sí", value: "si", score: 0 },
      { label: "Parcial", value: "parcial", score: 5 },
      { label: "No", value: "no", score: 10 },
    ],
  },
  {
    id: "p17",
    paso: 3,
    bloque: "documental",
    texto: "¿Existe registro de capacitación firmado?",
    opciones: [
      { label: "Sí", value: "si", score: 0 },
      { label: "No", value: "no", score: 6 },
    ],
  },
  {
    id: "p18",
    paso: 3,
    bloque: "documental",
    texto: "¿Se realizó charla de seguridad previa o análisis previo?",
    opciones: [
      { label: "Sí", value: "si", score: 0 },
      { label: "No", value: "no", score: 6 },
      { label: "No aplica", value: "no_aplica", score: 0 },
    ],
  },
  {
    id: "p19",
    paso: 3,
    bloque: "documental",
    texto: "¿Los riesgos estaban correctamente identificados en la documentación?",
    opciones: [
      { label: "Sí", value: "si", score: 0 },
      { label: "Parcial", value: "parcial", score: 5 },
      { label: "No", value: "no", score: 10 },
    ],
  },
  {
    id: "p20",
    paso: 3,
    bloque: "documental",
    texto: "¿Los permisos aplicables estaban vigentes al momento del hallazgo?",
    opciones: [
      { label: "Sí", value: "si", score: 0 },
      { label: "No", value: "no", score: 8 },
      { label: "No aplica", value: "no_aplica", score: 0 },
    ],
  },
];
export default preguntasEvaluacion;