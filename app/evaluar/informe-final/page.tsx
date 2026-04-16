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

type CausaDominante =
  | "orden_limpieza"
  | "altura"
  | "energia"
  | "maquinaria"
  | "transito"
  | "herramientas"
  | "segregacion"
  | "documental"
  | "general";

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

function normalizarCriticidad(valor: any): string {
  return String(valor ?? "")
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
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

  const nivel = normalizarCriticidad(valor);

  if (nivel.includes("CRIT")) return "CRÍTICO";
  if (nivel.includes("ALTO")) return "ALTO";
  if (nivel.includes("MED")) return "MEDIO";
  return "BAJO";
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
  const normalizado = String(nivel ?? "")
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (normalizado === "CRITICO") {
    return {
      fondo: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
      texto: "#ffffff",
      etiqueta: "CRÍTICA",
    };
  }

  if (normalizado === "ALTO") {
    return {
      fondo: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      texto: "#ffffff",
      etiqueta: "ALTA",
    };
  }

  if (normalizado === "MEDIO") {
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
      "housekeeping",
      "sucio",
      "limpieza",
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
      "químico",
      "liquido",
      "líquido",
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

function obtenerCausaDominante(
  analisis: AnalisisInforme,
  contexto: ContextoHallazgo
): CausaDominante {
  if (contexto.altura) return "altura";
  if (contexto.energia) return "energia";
  if (contexto.maquinaria) return "maquinaria";
  if (contexto.transito) return "transito";
  if (contexto.herramientas) return "herramientas";
  if (contexto.ordenLimpieza) return "orden_limpieza";

  if (
    contexto.senalizacion ||
    analisis.sinSegregacion ||
    analisis.sinBarreras ||
    analisis.sinControlVisible
  ) {
    return "segregacion";
  }

  if (
    contexto.documental ||
    analisis.sinPTS ||
    analisis.ptsDesactualizado ||
    analisis.sinCapacitacion ||
    analisis.sinRegistro ||
    analisis.sinCharla ||
    analisis.riesgoNoIdentificado ||
    analisis.sinPermiso
  ) {
    return "documental";
  }

  if (analisis.energiaPeligrosa) return "energia";
  if (analisis.afectaTerceros) return "transito";

  return "general";
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
  const nivel = normalizarCriticidad(criticidad);

  if (nivel.includes("CRIT")) {
    return `Inmediata · ${formatearFecha(ahora)}`;
  }

  if (nivel.includes("ALTO")) {
    return `Durante la jornada · ${formatearFecha(ahora)}`;
  }

  if (nivel.includes("MED")) {
    return formatearFecha(sumarDias(ahora, 1));
  }

  return formatearFecha(sumarDias(ahora, 2));
}

function generarFundamento(
  analisis: AnalisisInforme,
  contexto: ContextoHallazgo,
  criticidad: string,
  descripcion: string,
  codigoInforme: string,
  causaDominante: CausaDominante
): string {
  const seed = `${codigoInforme}-${descripcion}`;
const nivel = normalizarCriticidad(criticidad);
  const base =
    nivel.includes("CRIT")
      ? elegirVariante(seed, "base-critica", [
          "De acuerdo con la evaluación aplicada, el hallazgo fue clasificado con criticidad crítica.",
          "La evaluación realizada determina que el hallazgo corresponde a un escenario de criticidad crítica.",
          "El análisis efectuado permite clasificar el hallazgo dentro de un nivel de criticidad crítica.",
        ])
      : nivel.includes("ALTO")
        ? elegirVariante(seed, "base-alta", [
            "De acuerdo con la evaluación aplicada, el hallazgo fue clasificado con criticidad alta.",
            "La evaluación realizada determina que el hallazgo presenta criticidad alta.",
            "El análisis efectuado permite clasificar el hallazgo dentro de un nivel de criticidad alta.",
          ])
        : nivel.includes("MED")
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

  const soportes: string[] = [];

  const pushUnico = (textoSoporte: string) => {
    if (textoSoporte && !soportes.includes(textoSoporte)) {
      soportes.push(textoSoporte);
    }
  };

  const causaPrincipal =
    causaDominante === "orden_limpieza"
      ? elegirVariante(seed, "causa-orden", [
          "La descripción del hallazgo se asocia principalmente a una condición puntual de orden y limpieza del área intervenida.",
          "El desvío reportado corresponde a una desviación localizada de housekeeping en el sector evaluado.",
          "La condición observada se relaciona con desorden, acumulación o falta de limpieza en el área de trabajo.",
        ])
      : causaDominante === "altura"
        ? elegirVariante(seed, "causa-altura", [
            "La condición reportada se vincula a trabajo en altura o a exposición por diferencia de nivel.",
            "La naturaleza del hallazgo se relaciona con una condición de altura, borde expuesto o potencial de caída.",
            "La descripción del evento permite asociarlo a una condición con potencial de caída de personas o materiales.",
          ])
        : causaDominante === "energia"
          ? elegirVariante(seed, "causa-energia", [
              "La condición observada se desarrolla en un contexto de riesgo vinculado a energía o elementos energizados.",
              "El hallazgo fue reportado en un entorno asociado a energía o intervención eléctrica.",
              "La descripción del evento se relaciona con una condición de riesgo vinculada a energía peligrosa.",
            ])
          : causaDominante === "maquinaria"
            ? elegirVariante(seed, "causa-maquinaria", [
                "La desviación reportada se vincula a operación o interacción con equipos y maquinaria.",
                "El hallazgo se desarrolla en un entorno operativo asociado a equipos móviles o maquinaria.",
                "La condición observada se relaciona con el uso o cercanía de maquinaria y equipos de trabajo.",
              ])
            : causaDominante === "transito"
              ? elegirVariante(seed, "causa-transito", [
                  "El contexto del hallazgo se vincula a circulación interna, tránsito o interacción con rutas de desplazamiento.",
                  "La condición fue reportada en un entorno con circulación de personas o vehículos.",
                  "La descripción del evento se relaciona con un sector de tránsito o desplazamiento operativo.",
                ])
              : causaDominante === "herramientas"
                ? elegirVariante(seed, "causa-herramientas", [
                    "La condición observada se vincula al uso o estado de herramientas y elementos de trabajo.",
                    "El hallazgo se relaciona con una desviación asociada a herramientas o equipos menores.",
                    "La descripción permite asociar el evento a condiciones de uso, manejo o control de herramientas.",
                  ])
                : causaDominante === "segregacion"
                  ? elegirVariante(seed, "causa-segregacion", [
                      "El hallazgo se relaciona principalmente con deficiencias de segregación, barreras o control perimetral.",
                      "La condición evaluada presenta debilidad en demarcación, señalización o resguardo del área.",
                      "La desviación observada se asocia a control insuficiente del sector intervenido.",
                    ])
                  : causaDominante === "documental"
                    ? elegirVariante(seed, "causa-documental", [
                        "La condición evaluada presenta como componente dominante una brecha documental, de instrucción o de control administrativo.",
                        "El hallazgo se asocia principalmente a debilidades en procedimiento, registros, permisos o capacitación aplicable.",
                        "La evaluación refleja una causa dominante vinculada a soporte documental o preventivo insuficiente.",
                      ])
                    : elegirVariante(seed, "causa-general", [
                        "La condición observada corresponde a una desviación operacional que requiere corrección y control en terreno.",
                        "El hallazgo reportado da cuenta de una condición subestándar que debe ser intervenida oportunamente.",
                        "La evaluación identifica una desviación operativa con necesidad de control y seguimiento.",
                      ]);

  if (
    (nivel.includes("CRIT") || nivel.includes("ALTO")) &&
    analisis.exposicionActual
  ) {
    pushUnico(
      elegirVariante(seed, "soporte-exposicion", [
        "Se verificó exposición actual de personas a la condición detectada.",
        "Se observó personal expuesto al peligro presente en el área intervenida.",
        "La condición reportada mantiene exposición directa de trabajadores.",
      ])
    );
  }

  if (
    (nivel.includes("CRIT") || nivel.includes("ALTO")) &&
    analisis.consecuenciaGrave
  ) {
    pushUnico(
      elegirVariante(seed, "soporte-gravedad", [
        "La consecuencia potencial asociada podría alcanzar un nivel grave o fatal.",
        "El escenario evaluado presenta un potencial de daño severo.",
        "La magnitud del daño posible incrementa de manera significativa la severidad del hallazgo.",
      ])
    );
  }

  if (analisis.repeticionAlta || analisis.puedeEscalar) {
    pushUnico(
      elegirVariante(seed, "soporte-repeticion", [
        "La evaluación indica posibilidad de repetición o escalamiento si la condición no es corregida oportunamente.",
        "La situación observada presenta potencial de recurrencia operacional en el corto plazo.",
        "Existe riesgo de reiteración o agravamiento antes de una nueva intervención.",
      ])
    );
  }

  if (
    causaDominante !== "segregacion" &&
    (analisis.sinSegregacion ||
      analisis.sinBarreras ||
      analisis.sinControlVisible)
  ) {
    pushUnico(
      elegirVariante(seed, "soporte-control", [
        "Se evidencian debilidades en barreras, segregación o controles visibles aplicados al sector.",
        "Los controles operativos presentes no resultaron suficientes o plenamente verificables en terreno.",
        "La condición detectada no contaba con un control preventivo efectivo y claramente observable.",
      ])
    );
  }

  if (
    causaDominante !== "documental" &&
    (analisis.sinPTS ||
      analisis.ptsDesactualizado ||
      analisis.sinCapacitacion ||
      analisis.sinRegistro ||
      analisis.sinCharla ||
      analisis.riesgoNoIdentificado ||
      analisis.sinPermiso)
  ) {
    pushUnico(
      elegirVariante(seed, "soporte-documental", [
        "Adicionalmente, la evaluación muestra brechas documentales o de instrucción asociadas a la tarea.",
        "También se observan debilidades en soporte preventivo, registros o documentación aplicable.",
        "El análisis complementario evidencia una brecha de respaldo documental o administrativo.",
      ])
    );
  }

  if (
    causaDominante !== "transito" &&
    !nivel.includes("BAJ") &&
    analisis.afectaTerceros
  ) {
    pushUnico(
      elegirVariante(seed, "soporte-terceros", [
        "La condición puede proyectar exposición hacia terceros, tránsito o áreas adyacentes.",
        "El alcance del hallazgo no se limita al ejecutor directo y puede comprometer zonas colindantes.",
        "La ubicación del hallazgo amplía su impacto potencial hacia terceros o circulación cercana.",
      ])
    );
  }

  if (
    !nivel.includes("BAJ") &&
    analisis.tareaEnEjecucion &&
    analisis.trabajoNoDetenido
  ) {
    pushUnico(
      elegirVariante(seed, "soporte-no-detencion", [
        "La tarea se encontraba en ejecución y no fue detenida al momento de detectar el hallazgo.",
        "Se mantuvo continuidad de la actividad pese a la condición observada.",
        "La ausencia de detención inmediata mantuvo la exposición durante la ejecución de la tarea.",
      ])
    );
  }

  const maxSoportes = nivel.includes("BAJ") ? 1 : 2;

  return [base, causaPrincipal, ...soportes.slice(0, maxSoportes)].join(" ");
}

function generarAcciones(
  analisis: AnalisisInforme,
  contexto: ContextoHallazgo,
  criticidad: string,
  codigoInforme: string,
  causaDominante: CausaDominante
): AccionesInforme {
  const seed = codigoInforme;
const nivel = normalizarCriticidad(criticidad);
  let medidaInmediata = "";
  let medidaCierre = "";
  let evidenciaCierre = "";

  if (causaDominante === "orden_limpieza") {
    medidaInmediata =
      nivel.includes("ALTO") || nivel.includes("CRIT")
        ? elegirVariante(seed, "orden-inmediata-alta", [
            "Detener la intervención del sector y retirar de inmediato los elementos que generan desorden o acumulación.",
            "Suspender la actividad puntual del área afectada hasta restablecer orden y limpieza seguros.",
            "Controlar inmediatamente el sector, despejar materiales fuera de lugar y eliminar la condición de desorden detectada.",
          ])
        : elegirVariante(seed, "orden-inmediata", [
            "Corregir de inmediato la condición de orden y limpieza detectada en el área.",
            "Retirar residuos, materiales u objetos fuera de lugar y restablecer el orden del sector.",
            "Eliminar los elementos que originan la desviación observada y dejar despejada el área de trabajo.",
          ]);

    medidaCierre = elegirVariante(seed, "orden-cierre", [
      "Verificar en terreno la mantención del orden del sector y confirmar que la condición no vuelva a repetirse.",
      "Comprobar que el área permanezca despejada, ordenada y bajo control posterior a la corrección.",
      "Validar en terreno que la corrección aplicada se mantenga estable y sin recurrencia inmediata.",
    ]);

    evidenciaCierre = elegirVariante(seed, "orden-evidencia", [
      "Fotografía del área corregida y despejada.",
      "Respaldo fotográfico del sector ordenado posterior a la intervención.",
      "Evidencia fotográfica del restablecimiento de orden y limpieza del área.",
    ]);
  } else if (causaDominante === "altura") {
    medidaInmediata = elegirVariante(seed, "altura-inmediata", [
      "Controlar de inmediato la exposición a diferencia de nivel y restringir la continuidad de la tarea hasta asegurar el sector.",
      "Suspender la intervención asociada y eliminar la exposición a caída antes de reiniciar trabajos.",
      "Asegurar el área expuesta mediante control físico inmediato y evitar continuidad operacional sin protección efectiva.",
    ]);

    medidaCierre = elegirVariante(seed, "altura-cierre", [
      "Verificar instalación o restitución del control definitivo contra caída y validar cierre en terreno.",
      "Confirmar que la protección implementada controle de forma estable la exposición por altura o borde expuesto.",
      "Validar en terreno que la condición de altura quede corregida mediante control efectivo y verificable.",
    ]);

    evidenciaCierre = elegirVariante(seed, "altura-evidencia", [
      "Fotografía del control implementado sobre la condición de altura.",
      "Respaldo fotográfico de la protección instalada y verificación en terreno.",
      "Evidencia visual del cierre efectivo de la exposición por diferencia de nivel.",
    ]);
  } else if (causaDominante === "energia") {
    medidaInmediata = elegirVariante(seed, "energia-inmediata", [
      "Restringir la intervención y asegurar la condición de energía peligrosa antes de continuar.",
      "Aislar la fuente energética involucrada y evitar intervención hasta restablecer un control seguro.",
      "Controlar inmediatamente la condición energética detectada antes de permitir continuidad operativa.",
    ]);

    medidaCierre = elegirVariante(seed, "energia-cierre", [
      "Verificar en terreno el control efectivo de la condición energética y validar su eliminación antes del cierre.",
      "Confirmar que la fuente de energía o condición asociada quede bajo control seguro y verificable.",
      "Validar la corrección definitiva del riesgo energético antes de autorizar cierre del hallazgo.",
    ]);

    evidenciaCierre = elegirVariante(seed, "energia-evidencia", [
      "Fotografía del control implementado sobre la condición energética.",
      "Respaldo visual de la corrección aplicada y verificación en terreno.",
      "Evidencia fotográfica del cierre efectivo del riesgo asociado a energía.",
    ]);
  } else if (causaDominante === "maquinaria") {
    medidaInmediata = elegirVariante(seed, "maq-inmediata", [
      "Controlar de inmediato la interacción con equipos o maquinaria y asegurar el sector antes de continuar.",
      "Restringir la operación asociada hasta corregir la condición detectada en torno a maquinaria o equipos.",
      "Asegurar el entorno operativo del equipo involucrado y eliminar la desviación antes de reanudar la actividad.",
    ]);

    medidaCierre = elegirVariante(seed, "maq-cierre", [
      "Verificar en terreno que el control aplicado a maquinaria o equipos se mantenga estable y efectivo.",
      "Confirmar que la condición detectada en torno al equipo quede corregida y bajo supervisión.",
      "Validar el cierre mediante revisión directa del entorno de operación del equipo involucrado.",
    ]);

    evidenciaCierre = elegirVariante(seed, "maq-evidencia", [
      "Fotografía del equipo o sector corregido.",
      "Respaldo fotográfico del control implementado en torno a maquinaria o equipos.",
      "Evidencia visual del cierre aplicado al entorno operativo intervenido.",
    ]);
  } else if (causaDominante === "transito") {
    medidaInmediata = elegirVariante(seed, "transito-inmediata", [
      "Controlar de inmediato la circulación del sector y segregar el área afectada antes de continuar.",
      "Restringir tránsito de personas o vehículos en el sector comprometido hasta corregir la condición.",
      "Implementar control inmediato de circulación y resguardo del área con exposición a tránsito o terceros.",
    ]);

    medidaCierre = elegirVariante(seed, "transito-cierre", [
      "Verificar en terreno que la circulación quede controlada y sin exposición residual a terceros.",
      "Confirmar que el sector mantenga segregación y control suficiente posterior a la corrección.",
      "Validar el cierre del hallazgo mediante revisión directa del área de tránsito intervenida.",
    ]);

    evidenciaCierre = elegirVariante(seed, "transito-evidencia", [
      "Fotografía del sector segregado o corregido.",
      "Respaldo visual del control de tránsito implementado en el área.",
      "Evidencia fotográfica del cierre efectivo sobre la ruta o zona intervenida.",
    ]);
  } else if (causaDominante === "herramientas") {
    medidaInmediata = elegirVariante(seed, "herr-inmediata", [
      "Retirar o controlar inmediatamente la herramienta o elemento asociado a la desviación detectada.",
      "Suspender el uso del elemento involucrado hasta corregir la condición observada.",
      "Corregir de inmediato la condición asociada a herramientas o elementos de trabajo antes de continuar.",
    ]);

    medidaCierre = elegirVariante(seed, "herr-cierre", [
      "Verificar en terreno que la herramienta, elemento o condición asociada quede corregida y controlada.",
      "Confirmar que el elemento intervenido se mantenga bajo condición segura y verificable.",
      "Validar el cierre mediante revisión directa del control aplicado sobre la herramienta o elemento asociado.",
    ]);

    evidenciaCierre = elegirVariante(seed, "herr-evidencia", [
      "Fotografía del elemento corregido o retirado.",
      "Respaldo fotográfico del control aplicado sobre la herramienta o condición detectada.",
      "Evidencia visual del cierre implementado respecto del elemento intervenido.",
    ]);
  } else if (causaDominante === "segregacion") {
    medidaInmediata = elegirVariante(seed, "seg-inmediata", [
      "Implementar segregación efectiva y restringir el acceso al área afectada.",
      "Instalar barreras, demarcación o señalización suficiente para controlar la exposición existente.",
      "Controlar inmediatamente el perímetro de trabajo mediante segregación física o señalización efectiva.",
    ]);

    medidaCierre = elegirVariante(seed, "seg-cierre", [
      "Verificar en terreno que la segregación o control perimetral se mantenga efectivo y visible.",
      "Confirmar la estabilidad del control implementado sobre barreras, demarcación o señalización del sector.",
      "Validar el cierre mediante revisión directa del control de acceso y resguardo del área intervenida.",
    ]);

    evidenciaCierre = elegirVariante(seed, "seg-evidencia", [
      "Fotografía de la segregación o demarcación implementada.",
      "Respaldo visual de las barreras o señalización instaladas en el sector.",
      "Evidencia fotográfica del control perimetral aplicado al área corregida.",
    ]);
  } else if (causaDominante === "documental") {
    medidaInmediata = elegirVariante(seed, "doc-inmediata", [
      "Aplicar control inmediato sobre la tarea y detener su continuidad hasta aclarar o regularizar el soporte preventivo mínimo requerido.",
      "Controlar la ejecución asociada y evitar continuidad sin respaldo preventivo suficiente.",
      "Restringir la intervención hasta verificar condición mínima de soporte documental o instrucción aplicable.",
    ]);

    medidaCierre = elegirVariante(seed, "doc-cierre", [
      "Regularizar el soporte preventivo aplicable y validar su implementación efectiva en terreno antes del cierre.",
      "Actualizar o completar el respaldo documental, de instrucción o control administrativo que corresponda.",
      "Confirmar que la brecha documental detectada quede corregida y aplicada de forma verificable.",
    ]);

    evidenciaCierre = elegirVariante(seed, "doc-evidencia", [
      "Fotografía del control implementado y respaldo del ajuste documental o preventivo aplicable.",
      "Evidencia visual de la corrección en terreno y del soporte preventivo regularizado.",
      "Respaldo del control ejecutado y del cierre documental asociado al hallazgo.",
    ]);
  } else {
    medidaInmediata = elegirVariante(seed, "gen-inmediata", [
      "Controlar de inmediato la condición detectada para eliminar la exposición existente.",
      "Aplicar una corrección inmediata sobre la desviación observada antes de continuar la tarea.",
      "Ejecutar una acción correctiva inmediata que elimine la condición subestándar reportada.",
    ]);

    medidaCierre = elegirVariante(seed, "gen-cierre", [
      "Verificar la corrección en terreno y confirmar eliminación efectiva de la condición reportada.",
      "Validar el cierre del hallazgo mediante revisión directa del área intervenida.",
      "Confirmar en terreno que la condición detectada fue corregida de forma efectiva y estable.",
    ]);

    evidenciaCierre = elegirVariante(seed, "gen-evidencia", [
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
  const causaDominante = obtenerCausaDominante(analisis, contexto);

  const fundamento = generarFundamento(
    analisis,
    contexto,
    criticidad,
    descripcion,
    codigoInforme,
    causaDominante
  );

  const acciones = generarAcciones(
    analisis,
    contexto,
    criticidad,
    codigoInforme,
    causaDominante
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