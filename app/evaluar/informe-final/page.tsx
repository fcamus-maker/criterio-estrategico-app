"use client";

import { useEffect, useMemo, useState } from "react";
import preguntasEvaluacion, {
  type RespuestasEvaluacion,
} from "../../types/evaluacion";

type Hallazgo = Record<string, any>;

type AnalisisInforme = {
  total: number;
  critica: number;
  operacional: number;
  documental: number;
  exposicionActual: boolean;
  consecuenciaGrave: boolean;
  ocurrenciaInmediata: boolean;
  peligroActivo: boolean;
  sinSegregacion: boolean;
  sinControlVisible: boolean;
  tareaEnEjecucion: boolean;
  repeticionAlta: boolean;
  trabajoNoDetenido: boolean;
  energiaPeligrosa: boolean;
  afectaTerceros: boolean;
  sinBarreras: boolean;
  puedeEscalar: boolean;
  sinPTS: boolean;
  ptsDesactualizado: boolean;
  sinCapacitacion: boolean;
  sinRegistro: boolean;
  sinCharla: boolean;
  riesgoNoIdentificado: boolean;
  sinPermiso: boolean;
};

type ContextoHallazgo = {
  ordenLimpieza: boolean;
  altura: boolean;
  energia: boolean;
  maquinaria: boolean;
  transito: boolean;
  derrame: boolean;
  herramientas: boolean;
  senalizacion: boolean;
  documental: boolean;
};

type AccionesInforme = {
  medidaInmediata: string;
  medidaCierre: string;
  evidenciaCierre: string;
  fechaCierrePropuesta: string;
};

function obtenerUltimoHallazgo(): Hallazgo | null {
  if (typeof window === "undefined") return null;

  try {
    const data = JSON.parse(localStorage.getItem("hallazgos") || "[]");
    if (!Array.isArray(data) || data.length === 0) return null;
    return data[data.length - 1];
  } catch {
    return null;
  }
}

function texto(valor: any, fallback = "-") {
  if (valor === null || valor === undefined) return fallback;
  const limpio = String(valor).trim();
  return limpio.length ? limpio : fallback;
}

function formatearFecha(valor: any) {
  if (!valor) return new Date().toLocaleDateString("es-CL");

  const fecha = new Date(valor);
  if (!Number.isNaN(fecha.getTime())) {
    return fecha.toLocaleDateString("es-CL");
  }

  return String(valor);
}

function normalizarCorrelativo(valor: any) {
  const soloNumeros = String(valor ?? "").replace(/\D/g, "");
  if (!soloNumeros) return "00001";
  return soloNumeros.padStart(5, "0").slice(-5);
}

function sigla(valor: any, fallback: string) {
  return texto(valor, fallback).toUpperCase().replace(/\s+/g, "");
}

function obtenerCodigoInforme(hallazgo: Hallazgo | null) {
  if (!hallazgo) return "CE-OBRA-EMP/00001";

  const existente =
    hallazgo?.codigoInforme ||
    hallazgo?.codigoReporte ||
    hallazgo?.codigo_reporte ||
    hallazgo?.reporte?.codigoInforme ||
    hallazgo?.reporte?.codigoReporte ||
    hallazgo?.reporte?.codigo_reporte ||
    hallazgo?.codigo;

  if (existente) return String(existente);

  const siglaProyecto = sigla(
    hallazgo?.reporte?.siglaProyecto ||
      hallazgo?.reporte?.siglaObra ||
      hallazgo?.siglaProyecto ||
      hallazgo?.siglaObra ||
      hallazgo?.contexto?.obra,
    "OBRA"
  );

  const siglaEmpresa = sigla(
    hallazgo?.reporte?.siglaEmpresa ||
      hallazgo?.empresaSigla ||
      hallazgo?.reporte?.empresaSigla ||
      hallazgo?.contexto?.empresa,
    "EMP"
  );

  const correlativo = normalizarCorrelativo(
    hallazgo?.correlativo ||
      hallazgo?.numeroRegistro ||
      hallazgo?.numero ||
      hallazgo?.id ||
      1
  );

  return `CE-${siglaProyecto}-${siglaEmpresa}/${correlativo}`;
}

function obtenerCriticidad(hallazgo: Hallazgo | null) {
  const valor =
    hallazgo?.criticidad ||
    hallazgo?.nivelCriticidad ||
    hallazgo?.nivel ||
    hallazgo?.resultado?.criticidad ||
    hallazgo?.resultado?.nivel ||
    hallazgo?.evaluacion?.criticidad ||
    hallazgo?.resultadoFinal?.criticidad ||
    "ALTO";

  return String(valor).toUpperCase();
}

function obtenerFotos(hallazgo: Hallazgo | null): string[] {
  if (!hallazgo) return [];

  const bloques = [
    hallazgo?.fotos,
    hallazgo?.imagenes,
    hallazgo?.reporte?.fotos,
    hallazgo?.reporte?.imagenes,
    hallazgo?.reporte?.evidencias,
  ];

  const salida: string[] = [];

  for (const bloque of bloques) {
    if (!Array.isArray(bloque)) continue;

    for (const item of bloque) {
      const url =
        typeof item === "string"
          ? item
          : item?.url ||
            item?.src ||
            item?.preview ||
            item?.base64 ||
            item?.dataUrl ||
            "";

      if (url) salida.push(url);
    }
  }

  return salida.slice(0, 3);
}

function estiloCriticidad(nivel: string) {
  if (nivel.includes("CRIT")) {
    return {
      fondo: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
      texto: "#ffffff",
      etiqueta: "CRÍTICA",
    };
  }

  if (nivel.includes("ALTO")) {
    return {
      fondo: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      texto: "#ffffff",
      etiqueta: "ALTA",
    };
  }

  if (nivel.includes("MED")) {
    return {
      fondo: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
      texto: "#ffffff",
      etiqueta: "MEDIA",
    };
  }

  return {
    fondo: "linear-gradient(135deg, #22c55e 0%, #15803d 100%)",
    texto: "#ffffff",
    etiqueta: "BAJA",
  };
}

function obtenerRespuesta(
  respuestas: RespuestasEvaluacion,
  id: string
): string {
  return String(respuestas?.[id] || "");
}

function obtenerPuntajePregunta(
  respuestas: RespuestasEvaluacion,
  id: string
): number {
  const pregunta = preguntasEvaluacion.find((item) => item.id === id);
  if (!pregunta) return 0;

  const valor = obtenerRespuesta(respuestas, id);
  const opcion = pregunta.opciones.find((item) => item.value === valor);
  return opcion?.score || 0;
}

function obtenerPuntajeBloque(
  respuestas: RespuestasEvaluacion,
  bloque: "critica" | "operacional" | "documental"
): number {
  return preguntasEvaluacion
    .filter((item) => item.bloque === bloque)
    .reduce((acc, item) => acc + obtenerPuntajePregunta(respuestas, item.id), 0);
}

function analizarRespuestas(
  respuestas: RespuestasEvaluacion
): AnalisisInforme {
  const critica = obtenerPuntajeBloque(respuestas, "critica");
  const operacional = obtenerPuntajeBloque(respuestas, "operacional");
  const documental = obtenerPuntajeBloque(respuestas, "documental");

  const p1 = obtenerRespuesta(respuestas, "p1");
  const p2 = obtenerRespuesta(respuestas, "p2");
  const p3 = obtenerRespuesta(respuestas, "p3");
  const p4 = obtenerRespuesta(respuestas, "p4");
  const p5 = obtenerRespuesta(respuestas, "p5");
  const p6 = obtenerRespuesta(respuestas, "p6");
  const p7 = obtenerRespuesta(respuestas, "p7");
  const p8 = obtenerRespuesta(respuestas, "p8");
  const p9 = obtenerRespuesta(respuestas, "p9");
  const p10 = obtenerRespuesta(respuestas, "p10");
  const p11 = obtenerRespuesta(respuestas, "p11");
  const p12 = obtenerRespuesta(respuestas, "p12");
  const p13 = obtenerRespuesta(respuestas, "p13");
  const p14 = obtenerRespuesta(respuestas, "p14");
  const p15 = obtenerRespuesta(respuestas, "p15");
  const p16 = obtenerRespuesta(respuestas, "p16");
  const p17 = obtenerRespuesta(respuestas, "p17");
  const p18 = obtenerRespuesta(respuestas, "p18");
  const p19 = obtenerRespuesta(respuestas, "p19");
  const p20 = obtenerRespuesta(respuestas, "p20");

  return {
    total: critica + operacional + documental,
    critica,
    operacional,
    documental,
    exposicionActual: p1 === "si" || p1 === "parcial",
    consecuenciaGrave: p2 === "si" || p2 === "parcial",
    ocurrenciaInmediata: p3 === "alta" || p3 === "media",
    peligroActivo: p4 === "si" || p4 === "parcial",
    sinSegregacion: p5 === "no" || p5 === "parcial",
    sinControlVisible: p6 === "no" || p6 === "parcial",
    tareaEnEjecucion: p7 === "si",
    repeticionAlta: p8 === "alta" || p8 === "media",
    trabajoNoDetenido: p9 === "no",
    energiaPeligrosa: p10 === "si" || p10 === "parcial",
    afectaTerceros: p11 === "si" || p11 === "parcial",
    sinBarreras: p12 === "no" || p12 === "parcial",
    puedeEscalar: p13 === "si" || p13 === "parcial",
    sinPTS: p14 === "no",
    ptsDesactualizado: p15 === "no",
    sinCapacitacion: p16 === "no" || p16 === "parcial",
    sinRegistro: p17 === "no",
    sinCharla: p18 === "no",
    riesgoNoIdentificado: p19 === "no" || p19 === "parcial",
    sinPermiso: p20 === "no",
  };
}

function normalizarTextoLibre(textoLibre: string): string {
  return textoLibre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function contieneAlguna(textoLibre: string, palabras: string[]): boolean {
  return palabras.some((palabra) => textoLibre.includes(palabra));
}

function detectarContexto(descripcion: string): ContextoHallazgo {
  const base = normalizarTextoLibre(descripcion);

  return {
    ordenLimpieza: contieneAlguna(base, [
      "basura",
      "residuo",
      "residuos",
      "desorden",
      "orden y limpieza",
      "material acumulado",
      "escombro",
    ]),
    altura: contieneAlguna(base, [
      "altura",
      "caida",
      "caidas",
      "baranda",
      "borde",
      "andamio",
      "escalera",
      "techo",
      "plataforma",
      "abertura",
      "hueco",
    ]),
    energia: contieneAlguna(base, [
      "energia",
      "electrica",
      "electrico",
      "tablero",
      "cable",
      "cables",
      "enchufe",
      "energizado",
      "corriente",
      "bloqueo",
    ]),
    maquinaria: contieneAlguna(base, [
      "maquina",
      "maquinaria",
      "equipo",
      "grua",
      "excavadora",
      "retroexcavadora",
      "camion",
      "camión",
      "montacarga",
      "rodillo",
      "equipo movil",
      "equipo móvil",
    ]),
    transito: contieneAlguna(base, [
      "transito",
      "vehiculo",
      "vehiculos",
      "peaton",
      "peatonal",
      "circulacion",
      "ruta",
      "camino",
      "ingreso",
    ]),
    derrame: contieneAlguna(base, [
      "derrame",
      "fuga",
      "aceite",
      "combustible",
      "quimico",
      "quimico",
      "liquido",
      "sustancia",
    ]),
    herramientas: contieneAlguna(base, [
      "herramienta",
      "esmeril",
      "taladro",
      "corte",
      "disco",
      "manual",
      "sierra",
      "pulidora",
    ]),
    senalizacion: contieneAlguna(base, [
      "senal",
      "señal",
      "demarcacion",
      "demarcación",
      "cono",
      "cinta",
      "letrero",
      "barrera",
    ]),
    documental: contieneAlguna(base, [
      "procedimiento",
      "pts",
      "permiso",
      "charla",
      "capacitacion",
      "capacitación",
      "matriz",
      "registro",
      "documento",
    ]),
  };
}

function hashTexto(valor: string): number {
  let hash = 0;

  for (let i = 0; i < valor.length; i += 1) {
    hash = (hash << 5) - hash + valor.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash);
}

function elegirVariante(
  seedBase: string,
  clave: string,
  opciones: string[]
): string {
  if (opciones.length === 0) return "";
  const indice = hashTexto(`${seedBase}-${clave}`) % opciones.length;
  return opciones[indice];
}

function sumarDias(fechaBase: Date, dias: number): Date {
  const copia = new Date(fechaBase);
  copia.setDate(copia.getDate() + dias);
  return copia;
}

function obtenerFechaCierrePropuesta(criticidad: string): string {
  const ahora = new Date();

  if (criticidad.includes("CRIT")) {
    return `Inmediata · ${formatearFecha(ahora)}`;
  }

  if (criticidad.includes("ALTO")) {
    return `Durante la jornada · ${formatearFecha(ahora)}`;
  }

  if (criticidad.includes("MED")) {
    return formatearFecha(sumarDias(ahora, 1));
  }

  return formatearFecha(sumarDias(ahora, 2));
}

function generarFundamento(
  analisis: AnalisisInforme,
  contexto: ContextoHallazgo,
  criticidad: string,
  descripcion: string,
  codigoInforme: string
): string {
  const seed = `${codigoInforme}-${descripcion}`;

  const base =
    criticidad.includes("CRIT")
      ? elegirVariante(seed, "base-critica", [
          "De acuerdo con la evaluación aplicada, el hallazgo fue clasificado con criticidad crítica.",
          "La evaluación realizada determina que el hallazgo corresponde a un escenario de criticidad crítica.",
          "El análisis efectuado permite clasificar el hallazgo dentro de un nivel de criticidad crítica.",
        ])
      : criticidad.includes("ALTO")
      ? elegirVariante(seed, "base-alta", [
          "De acuerdo con la evaluación aplicada, el hallazgo fue clasificado con criticidad alta.",
          "La evaluación realizada determina que el hallazgo presenta criticidad alta.",
          "El análisis efectuado permite clasificar el hallazgo dentro de un nivel de criticidad alta.",
        ])
      : criticidad.includes("MED")
      ? elegirVariante(seed, "base-media", [
          "De acuerdo con la evaluación aplicada, el hallazgo fue clasificado con criticidad media.",
          "La evaluación realizada determina que el hallazgo presenta criticidad media.",
          "El análisis efectuado permite clasificar el hallazgo dentro de un nivel de criticidad media.",
        ])
      : elegirVariante(seed, "base-baja", [
          "De acuerdo con la evaluación aplicada, el hallazgo fue clasificado con criticidad baja.",
          "La evaluación realizada determina que el hallazgo presenta criticidad baja.",
          "El análisis efectuado permite clasificar el hallazgo dentro de un nivel de criticidad baja.",
        ]);

  const razones: string[] = [];

  if (analisis.exposicionActual) {
    razones.push(
      elegirVariante(seed, "exposicion", [
        "Se verificó exposición actual de personas al peligro.",
        "Se observó presencia de trabajadores expuestos a la condición detectada.",
        "La condición reportada mantiene exposición directa de personal.",
      ])
    );
  }

  if (analisis.consecuenciaGrave) {
    razones.push(
      elegirVariante(seed, "gravedad", [
        "La consecuencia potencial asociada podría alcanzar un nivel grave o fatal.",
        "El escenario evaluado presenta una consecuencia potencial severa.",
        "La magnitud del daño posible eleva significativamente la severidad del hallazgo.",
      ])
    );
  }

  if (analisis.ocurrenciaInmediata || analisis.peligroActivo) {
    razones.push(
      elegirVariante(seed, "inmediatez", [
        "La posibilidad de materialización es inmediata o de corto plazo.",
        "La condición se encontraba activa o con probabilidad relevante de ocurrencia.",
        "Se detectó un escenario con potencial de ocurrencia inmediata.",
      ])
    );
  }

  if (analisis.sinSegregacion || analisis.sinBarreras || contexto.senalizacion) {
    razones.push(
      elegirVariante(seed, "barreras", [
        "No se evidenciaron barreras o segregación suficientes para controlar el área.",
        "El control perimetral y la señalización resultaron insuficientes frente a la condición observada.",
        "La zona reportada no contaba con un resguardo físico plenamente efectivo.",
      ])
    );
  }

  if (analisis.sinControlVisible) {
    razones.push(
      elegirVariante(seed, "controles", [
        "No se observaron medidas de control visibles y operativas.",
        "Los controles presentes no resultaron suficientes o verificables en terreno.",
        "La condición fue detectada sin respaldo claro de controles preventivos efectivos.",
      ])
    );
  }

  if (analisis.repeticionAlta || analisis.puedeEscalar) {
    razones.push(
      elegirVariante(seed, "repeticion", [
        "La evaluación indica posibilidad de repetición o escalamiento antes de una nueva intervención.",
        "Existe riesgo de recurrencia operacional si la condición no es corregida oportunamente.",
        "La situación observada puede reiterarse o agravarse en el corto plazo.",
      ])
    );
  }

  if (analisis.trabajoNoDetenido) {
    razones.push(
      elegirVariante(seed, "detencion", [
        "La tarea no fue detenida al momento de detectar el hallazgo.",
        "Se mantuvo continuidad operacional pese a la condición reportada.",
        "La ausencia de detención inmediata incrementó la exposición frente al riesgo detectado.",
      ])
    );
  }

  if (analisis.energiaPeligrosa || contexto.energia) {
    razones.push(
      elegirVariante(seed, "energia", [
        "La condición involucra energía peligrosa o un potencial de daño elevado.",
        "Se identificó presencia de una fuente energética o condición de alto potencial.",
        "El escenario evaluado incorpora una fuente de energía o exposición de alto impacto.",
      ])
    );
  }

  if (analisis.afectaTerceros || contexto.transito) {
    razones.push(
      elegirVariante(seed, "terceros", [
        "La condición puede afectar tránsito, terceros o áreas adyacentes.",
        "La exposición no se limita al ejecutor directo y compromete sectores colindantes.",
        "El entorno de trabajo amplifica el alcance del hallazgo hacia terceros o circulación cercana.",
      ])
    );
  }

  if (
    analisis.sinPTS ||
    analisis.ptsDesactualizado ||
    analisis.sinCapacitacion ||
    analisis.sinRegistro ||
    analisis.sinCharla ||
    analisis.riesgoNoIdentificado ||
    analisis.sinPermiso ||
    contexto.documental
  ) {
    razones.push(
      elegirVariante(seed, "documental", [
        "Además, se evidencian brechas documentales o de instrucción asociadas a la tarea.",
        "La evaluación muestra debilidades en soporte documental, capacitación o control administrativo.",
        "El análisis también refleja una brecha preventiva en procedimientos, registros o documentación aplicable.",
      ])
    );
  }

  if (contexto.ordenLimpieza && criticidad.includes("BAJ")) {
    razones.push(
      elegirVariante(seed, "orden", [
        "La condición observada se asocia principalmente a orden y limpieza del área intervenida.",
        "El desvío reportado corresponde a una desviación localizada de housekeeping.",
        "La descripción del hallazgo permite asociarlo a una condición puntual de orden y limpieza.",
      ])
    );
  }

  const razonesLimitadas = razones.slice(0, 4);
  return [base, ...razonesLimitadas].join(" ");
}

function generarAcciones(
  analisis: AnalisisInforme,
  contexto: ContextoHallazgo,
  criticidad: string,
  codigoInforme: string
): AccionesInforme {
  const seed = codigoInforme;

  let medidaInmediata = "";
  let medidaCierre = "";
  let evidenciaCierre = "";

  if (analisis.trabajoNoDetenido || criticidad.includes("CRIT")) {
    medidaInmediata = elegirVariante(seed, "medida-detener", [
      "Detener de inmediato la actividad asociada y controlar la exposición antes de reiniciar.",
      "Suspender la tarea involucrada hasta eliminar la condición de riesgo detectada.",
      "Interrumpir la operación relacionada y asegurar el área antes de continuar trabajos.",
    ]);
  } else if (analisis.sinSegregacion || analisis.sinBarreras) {
    medidaInmediata = elegirVariante(seed, "medida-barreras", [
      "Implementar segregación efectiva y restringir el acceso al área afectada.",
      "Instalar barreras o demarcación suficiente para controlar la exposición existente.",
      "Controlar el perímetro de trabajo mediante segregación física o señalización efectiva.",
    ]);
  } else if (analisis.energiaPeligrosa || contexto.energia) {
    medidaInmediata = elegirVariante(seed, "medida-energia", [
      "Aislar la fuente de energía involucrada y evitar intervención hasta restablecer control seguro.",
      "Controlar de inmediato la condición energética detectada antes de permitir continuidad operativa.",
      "Restringir la intervención y asegurar la condición de energía peligrosa antes de continuar.",
    ]);
  } else if (contexto.ordenLimpieza) {
    medidaInmediata = elegirVariante(seed, "medida-orden", [
      "Retirar de inmediato los residuos o elementos que generan la desviación observada.",
      "Corregir en forma inmediata la condición de orden y limpieza detectada en el área.",
      "Eliminar los elementos que originan la condición subestándar y restablecer el orden del sector.",
    ]);
  } else {
    medidaInmediata = elegirVariante(seed, "medida-general", [
      "Controlar de inmediato la condición detectada para eliminar la exposición existente.",
      "Aplicar una corrección inmediata sobre la desviación observada antes de continuar la tarea.",
      "Ejecutar una acción correctiva inmediata que elimine la condición subestándar reportada.",
    ]);
  }

  if (analisis.sinCapacitacion || analisis.sinCharla || analisis.sinRegistro) {
    medidaCierre = elegirVariante(seed, "cierre-instruccion", [
      "Realizar instrucción breve al personal involucrado y verificar comprensión del control definido.",
      "Efectuar refuerzo puntual de seguridad con registro simple del personal expuesto.",
      "Aplicar una inducción corta sobre la condición corregida y confirmar recepción por parte de los involucrados.",
    ]);
    evidenciaCierre = elegirVariante(seed, "evidencia-instruccion", [
      "Fotografía de la corrección implementada y registro breve de instrucción aplicada.",
      "Evidencia fotográfica del control ejecutado y constancia simple de instrucción al personal.",
      "Foto del cierre en terreno y respaldo de la instrucción puntual realizada.",
    ]);
  } else if (
    analisis.sinPTS ||
    analisis.ptsDesactualizado ||
    analisis.riesgoNoIdentificado ||
    analisis.sinPermiso
  ) {
    medidaCierre = elegirVariante(seed, "cierre-documental", [
      "Regularizar el control documental estrictamente aplicable antes de considerar cierre definitivo.",
      "Ajustar el documento preventivo o permiso que corresponda y validar su aplicación en terreno.",
      "Actualizar el soporte preventivo mínimo requerido para respaldar el cierre del hallazgo.",
    ]);
    evidenciaCierre = elegirVariante(seed, "evidencia-documental", [
      "Fotografía de la corrección y respaldo del documento o permiso regularizado.",
      "Evidencia del control implementado en terreno y actualización documental aplicable.",
      "Foto del área corregida y respaldo del ajuste documental correspondiente.",
    ]);
  } else if (analisis.repeticionAlta || analisis.puedeEscalar) {
    medidaCierre = elegirVariante(seed, "cierre-supervision", [
      "Verificar en terreno la mantención del control aplicado y confirmar que no exista recurrencia inmediata.",
      "Realizar seguimiento puntual del área corregida para validar estabilidad del control implementado.",
      "Ejecutar una verificación posterior de supervisión para confirmar cierre efectivo de la condición.",
    ]);
    evidenciaCierre = elegirVariante(seed, "evidencia-supervision", [
      "Fotografía del control implementado y verificación de supervisión en terreno.",
      "Foto del área corregida y evidencia de revisión posterior del sector.",
      "Respaldo fotográfico del cierre y confirmación de verificación en terreno.",
    ]);
  } else {
    medidaCierre = elegirVariante(seed, "cierre-general", [
      "Verificar la corrección en terreno y confirmar eliminación efectiva de la condición reportada.",
      "Validar el cierre del hallazgo mediante revisión directa del área intervenida.",
      "Confirmar en terreno que la condición detectada fue corregida de forma efectiva y estable.",
    ]);
    evidenciaCierre = elegirVariante(seed, "evidencia-general", [
      "Fotografía del área corregida.",
      "Respaldo fotográfico de la condición corregida en terreno.",
      "Evidencia fotográfica del cierre efectivo del hallazgo.",
    ]);
  }

  return {
    medidaInmediata,
    medidaCierre,
    evidenciaCierre,
    fechaCierrePropuesta: obtenerFechaCierrePropuesta(criticidad),
  };
}

function hoja() {
  return {
    background: "linear-gradient(180deg, #ffffff 0%, #f4f8ff 100%)",
    borderRadius: "24px",
    border: "1px solid rgba(255,255,255,0.65)",
    boxShadow:
      "0 22px 45px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.75)",
    color: "#132238",
  } as const;
}

function celdaTitulo() {
  return {
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.7px",
    textTransform: "uppercase" as const,
    color: "#5f7394",
    marginBottom: "4px",
  };
}

export default function InformeFinalPage() {
  const [hallazgo, setHallazgo] = useState<Hallazgo | null>(null);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    setHallazgo(obtenerUltimoHallazgo());
    setCargado(true);
  }, []);

  const codigoInforme = useMemo(
    () => obtenerCodigoInforme(hallazgo),
    [hallazgo]
  );
  const criticidad = useMemo(() => obtenerCriticidad(hallazgo), [hallazgo]);
  const colores = useMemo(() => estiloCriticidad(criticidad), [criticidad]);
  const fotos = useMemo(() => obtenerFotos(hallazgo), [hallazgo]);

  const area = texto(hallazgo?.reporte?.area || hallazgo?.area);
  const responsable = texto(
    hallazgo?.reporte?.responsable || hallazgo?.responsable
  );
  const fecha = formatearFecha(hallazgo?.reporte?.fecha || hallazgo?.fecha);
  const descripcion = texto(
    hallazgo?.reporte?.descripcion ||
      hallazgo?.descripcion ||
      hallazgo?.detalle,
    "Sin descripción registrada."
  );
  const proyecto = texto(
    hallazgo?.reporte?.proyecto ||
      hallazgo?.reporte?.obra ||
      hallazgo?.proyecto ||
      hallazgo?.obra,
    "Por definir"
  );
  const empresa = texto(
    hallazgo?.reporte?.empresa || hallazgo?.empresa,
    "Por definir"
  );

  const respuestas = (hallazgo?.evaluacion?.respuestas ||
    {}) as RespuestasEvaluacion;
  const analisis = analizarRespuestas(respuestas);
  const contexto = detectarContexto(descripcion);
  const fundamento = generarFundamento(
    analisis,
    contexto,
    criticidad,
    descripcion,
    codigoInforme
  );
  const acciones = generarAcciones(
    analisis,
    contexto,
    criticidad,
    codigoInforme
  );

  if (!cargado) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background:
            "radial-gradient(circle at top, #1b6ef3 0%, #0c4fc7 32%, #06245d 72%, #041638 100%)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Arial, sans-serif",
        }}
      >
        Cargando informe...
      </div>
    );
  }

  if (!hallazgo) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background:
            "radial-gradient(circle at top, #1b6ef3 0%, #0c4fc7 32%, #06245d 72%, #041638 100%)",
          color: "white",
          padding: "16px 12px 24px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ width: "100%", maxWidth: "410px", margin: "0 auto" }}>
          <div style={{ ...hoja(), padding: "18px", textAlign: "center" }}>
            <h1 style={{ margin: "0 0 8px", fontSize: "24px" }}>
              Informe final
            </h1>
            <p style={{ margin: 0, fontSize: "15px", color: "#415a77" }}>
              No se encontró un hallazgo cargado.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #1b6ef3 0%, #0c4fc7 32%, #06245d 72%, #041638 100%)",
        padding: "14px 12px 24px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: "410px", margin: "0 auto" }}>
        <div style={{ marginBottom: "10px" }}>
          <button
            onClick={() => {
              window.location.href = "/";
            }}
            style={{
              background: "transparent",
              color: "white",
              border: "none",
              fontSize: "16px",
              cursor: "pointer",
              padding: 0,
              opacity: 0.96,
              fontWeight: 700,
            }}
          >
            ← Criterio Estratégico
          </button>
        </div>

        <div
          style={{
            ...hoja(),
            padding: "0",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "6px",
              background: "linear-gradient(90deg, #0f4cc9 0%, #60a5fa 100%)",
            }}
          />

          <div style={{ padding: "16px 16px 14px" }}>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "0.9px",
                textTransform: "uppercase",
                color: "#587297",
                marginBottom: "8px",
              }}
            >
              Informe final de hallazgo
            </div>

            <div
              style={{
                fontSize: "28px",
                fontWeight: 900,
                lineHeight: 1.05,
                color: "#132238",
                marginBottom: "10px",
              }}
            >
              INFORME FINAL
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  background: "#edf4ff",
                  color: "#19447a",
                  border: "1px solid #d7e5fb",
                  borderRadius: "13px",
                  padding: "9px 12px",
                  fontSize: "18px",
                  fontWeight: 900,
                  lineHeight: 1.1,
                }}
              >
                {codigoInforme}
              </div>

              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#5b708f",
                }}
              >
                Fecha: {fecha}
              </div>
            </div>

            <div
              style={{
                background: colores.fondo,
                color: colores.texto,
                borderRadius: "18px",
                padding: "14px 14px 12px",
                boxShadow: "0 12px 26px rgba(0,0,0,0.12)",
                marginBottom: "14px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  letterSpacing: "0.8px",
                  textTransform: "uppercase",
                  opacity: 0.92,
                  marginBottom: "6px",
                }}
              >
                Nivel de criticidad
              </div>

              <div
                style={{
                  fontSize: "36px",
                  fontWeight: 900,
                  lineHeight: 1,
                  marginBottom: "6px",
                }}
              >
                {criticidad}
              </div>

              <div
                style={{
                  display: "inline-block",
                  fontSize: "12px",
                  fontWeight: 800,
                  padding: "6px 10px",
                  borderRadius: "999px",
                  background: "rgba(255,255,255,0.16)",
                }}
              >
                Prioridad {colores.etiqueta.toLowerCase()}
              </div>
            </div>

            <div
              style={{
                borderTop: "1px solid #dbe6f5",
                paddingTop: "12px",
                marginBottom: "12px",
              }}
            >
              <div style={{ ...celdaTitulo(), marginBottom: "6px" }}>
                Conclusión
              </div>
              <div
                style={{
                  fontSize: "14px",
                  lineHeight: 1.55,
                  color: "#223754",
                }}
              >
                {fundamento}
              </div>

              <div
                style={{
                  marginTop: "12px",
                  padding: "10px 12px",
                  borderRadius: "14px",
                  background: "#eef6ff",
                  border: "1px solid #dbe8f7",
                }}
              >
                <div style={celdaTitulo()}>Medida inmediata propuesta</div>
                <div
                  style={{
                    fontSize: "14px",
                    lineHeight: 1.5,
                    color: "#1c2f49",
                    fontWeight: 700,
                  }}
                >
                  {acciones.medidaInmediata}
                </div>
              </div>
            </div>

            <div
              style={{
                borderTop: "1px solid #dbe6f5",
                paddingTop: "12px",
                marginBottom: "12px",
              }}
            >
              <div style={{ ...celdaTitulo(), marginBottom: "8px" }}>
                Antecedentes del hallazgo
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                <div>
                  <div style={celdaTitulo()}>Área</div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#1c2f49",
                    }}
                  >
                    {area}
                  </div>
                </div>

                <div>
                  <div style={celdaTitulo()}>Responsable</div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#1c2f49",
                    }}
                  >
                    {responsable}
                  </div>
                </div>

                <div>
                  <div style={celdaTitulo()}>Proyecto / Obra</div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#1c2f49",
                    }}
                  >
                    {proyecto}
                  </div>
                </div>

                <div>
                  <div style={celdaTitulo()}>Empresa</div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#1c2f49",
                    }}
                  >
                    {empresa}
                  </div>
                </div>
              </div>

              <div>
                <div style={celdaTitulo()}>Descripción</div>
                <div
                  style={{
                    fontSize: "14px",
                    lineHeight: 1.5,
                    color: "#1c2f49",
                  }}
                >
                  {descripcion}
                </div>
              </div>
            </div>

            <div
              style={{
                borderTop: "1px solid #dbe6f5",
                paddingTop: "12px",
                marginBottom: "12px",
              }}
            >
              <div style={{ ...celdaTitulo(), marginBottom: "8px" }}>
                Evidencia fotográfica
              </div>

              {fotos.length === 0 ? (
                <div
                  style={{
                    border: "1px dashed #bfd2ec",
                    borderRadius: "14px",
                    padding: "14px",
                    textAlign: "center",
                    color: "#5b708f",
                    fontSize: "13px",
                    background: "#f7faff",
                  }}
                >
                  No hay fotografías cargadas todavía.
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      fotos.length === 1
                        ? "1fr"
                        : fotos.length === 2
                          ? "1fr 1fr"
                          : "1fr 1fr 1fr",
                    gap: "8px",
                  }}
                >
                  {fotos.map((foto, index) => (
                    <div
                      key={`${foto}-${index}`}
                      style={{
                        borderRadius: "14px",
                        overflow: "hidden",
                        border: "1px solid #dbe6f5",
                        background: "#eef4ff",
                        boxShadow: "0 8px 16px rgba(13, 43, 92, 0.10)",
                      }}
                    >
                      <img
                        src={foto}
                        alt={`Evidencia ${index + 1}`}
                        style={{
                          width: "100%",
                          height: "88px",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div
              style={{
                borderTop: "1px solid #dbe6f5",
                paddingTop: "12px",
                marginTop: "12px",
                marginBottom: "12px",
              }}
            >
              <div style={{ ...celdaTitulo(), marginBottom: "8px" }}>
                Cierre propuesto
              </div>

              <div
                style={{
                  display: "grid",
                  gap: "10px",
                }}
              >
                <div>
                  <div style={celdaTitulo()}>Medida de cierre propuesta</div>
                  <div
                    style={{
                      fontSize: "14px",
                      lineHeight: 1.5,
                      color: "#1c2f49",
                    }}
                  >
                    {acciones.medidaCierre}
                  </div>
                </div>

                <div>
                  <div style={celdaTitulo()}>
                    Evidencia de cierre requerida
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      lineHeight: 1.5,
                      color: "#1c2f49",
                    }}
                  >
                    {acciones.evidenciaCierre}
                  </div>
                </div>

                <div>
                  <div style={celdaTitulo()}>Fecha propuesta de cierre</div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 800,
                      color: "#1c2f49",
                    }}
                  >
                    {acciones.fechaCierrePropuesta}
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                borderTop: "1px solid #dbe6f5",
                paddingTop: "12px",
                fontSize: "12px",
                lineHeight: 1.5,
                color: "#60748f",
              }}
            >
              El presente informe fue generado automáticamente a partir de la
              descripción del hallazgo y de la evaluación aplicada, proponiendo
              medidas proporcionales de control y cierre según la criticidad
              detectada.
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            alert(
              "Aquí conectaremos el guardado definitivo y el envío por correo."
            );
          }}
          style={{
            marginTop: "14px",
            width: "100%",
            padding: "16px",
            borderRadius: "20px",
            border: "none",
            background: "linear-gradient(135deg, #67ef48 0%, #d7ff39 100%)",
            color: "#103a18",
            fontSize: "22px",
            fontWeight: 900,
            cursor: "pointer",
            boxShadow:
              "0 16px 30px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.35)",
          }}
        >
          GUARDAR Y ENVIAR
        </button>
      </div>
    </div>
  );
}