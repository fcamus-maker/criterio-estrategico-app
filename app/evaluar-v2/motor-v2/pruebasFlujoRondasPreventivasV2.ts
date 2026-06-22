import {
  CASOS_AUDITORIA_PREGUNTAS_VISIBLES_V2,
  evaluarBancoAuditoriaPreguntasVisibles,
} from "./pruebasAuditoriaPreguntasVisiblesV2";

export type ResultadoBancoFlujoRondasPreventivasV2 = ReturnType<
  typeof evaluarBancoAuditoriaPreguntasVisibles
> & {
  casosConCincoContexto: number;
  casosConCincoProductivas: number;
  totalPreguntasEsperadas: number;
  distribucionCasos: {
    simples: number;
    criticos: number;
    ambientales: number;
    documentales: number;
    salud: number;
    ambiguos: number;
  };
};

const contarPorTipo = (tipo: string) =>
  CASOS_AUDITORIA_PREGUNTAS_VISIBLES_V2.filter((caso) => caso.tipo === tipo).length;

export const evaluarBancoFlujoRondasPreventivasV2 =
  (): ResultadoBancoFlujoRondasPreventivasV2 => {
    const resultado = evaluarBancoAuditoriaPreguntasVisibles();
    const fallidos = [...resultado.fallidos];
    const distribucionCasos = {
      simples: contarPorTipo("simple"),
      criticos: contarPorTipo("critico"),
      ambientales: contarPorTipo("ambiental"),
      documentales: contarPorTipo("documental"),
      salud: contarPorTipo("salud"),
      ambiguos: contarPorTipo("ambiguo"),
    };
    const totalPreguntasEsperadas = resultado.totalCasos * 10;
    const casosConCincoContexto = resultado.casosConRonda1Correcta;
    const casosConCincoProductivas = resultado.casosConRonda2Correcta;

    const agregarFallo = (idCaso: string, errores: string[]) => {
      fallidos.push({ idCaso, severidad: "critico", errores });
    };

    if (resultado.totalCasos !== 160) {
      agregarFallo("banco-total-casos", [`Total de casos esperado: 160. Obtenido: ${resultado.totalCasos}.`]);
    }
    if (resultado.preguntasAuditadas !== totalPreguntasEsperadas) {
      agregarFallo("banco-total-preguntas", [
        `Total de preguntas esperado: ${totalPreguntasEsperadas}. Obtenido: ${resultado.preguntasAuditadas}.`,
      ]);
    }
    if (
      distribucionCasos.simples !== 40 ||
      distribucionCasos.criticos !== 60 ||
      distribucionCasos.ambientales !== 20 ||
      distribucionCasos.documentales !== 20 ||
      distribucionCasos.salud !== 10 ||
      distribucionCasos.ambiguos !== 10
    ) {
      agregarFallo("banco-distribucion", [
        `Distribución inválida: ${JSON.stringify(distribucionCasos)}.`,
      ]);
    }

    const metricasQueDebenSerCero: Array<[string, number]> = [
      ["familiasSinPlantilla", resultado.familiasSinPlantilla],
      ["preguntasFueraDeRonda", resultado.preguntasFueraDeRonda],
      ["preguntasProhibidas", resultado.preguntasProhibidas],
      ["opcionesInferidasPorTexto", resultado.opcionesInferidasPorTexto],
      ["opcionesAmbiguas", resultado.opcionesAmbiguas],
      ["mezclaFamilias", resultado.mezclaFamilias],
      ["mezclaFallback", resultado.mezclaFallback],
      ["banderaPerdida", resultado.banderaPerdida],
      ["contextoDesactualizado", resultado.contextoDesactualizado],
      ["ronda2NoInvalidada", resultado.ronda2NoInvalidada],
      ["resultadoConRespuestasIncompletas", resultado.resultadoConRespuestasIncompletas],
      ["sobredocumentacionSimple", resultado.sobredocumentacionSimple],
      ["subdocumentacionCritica", resultado.subdocumentacionCritica],
      ["textosInternosVisibles", resultado.textosInternosVisibles],
      ["idsTecnicosVisibles", resultado.idsTecnicosVisibles],
      ["informesTipoLog", resultado.informesTipoLog],
      ["normativaInventada", resultado.normativaInventada],
      ["preguntasIncoherentes", resultado.preguntasIncoherentes],
      ["opcionesIncompatibles", resultado.opcionesIncompatibles],
      ["preguntasRojas", resultado.preguntasRojas],
      ["preguntasAmarillas", resultado.preguntasAmarillas],
    ];

    for (const [metrica, valor] of metricasQueDebenSerCero) {
      if (valor !== 0) agregarFallo(`metrica-${metrica}`, [`${metrica}: ${valor}.`]);
    }
    if (casosConCincoContexto !== resultado.totalCasos) {
      agregarFallo("ronda1-cinco-contexto", [
        `Casos con cinco preguntas de contexto: ${casosConCincoContexto}/${resultado.totalCasos}.`,
      ]);
    }
    if (casosConCincoProductivas !== resultado.totalCasos) {
      agregarFallo("ronda2-cinco-productivas", [
        `Casos con cinco preguntas productivas: ${casosConCincoProductivas}/${resultado.totalCasos}.`,
      ]);
    }

    const erroresCriticos = fallidos.filter((fallo) => fallo.severidad === "critico").length;
    const erroresMenores = fallidos.length - erroresCriticos;
    const correctos = resultado.totalCasos - fallidos.length;

    return {
      ...resultado,
      correctos,
      erroresMenores,
      erroresCriticos,
      porcentajeCumplimiento:
        resultado.totalCasos > 0 ? Math.round((correctos / resultado.totalCasos) * 100) : 0,
      fallidos,
      casosConCincoContexto,
      casosConCincoProductivas,
      totalPreguntasEsperadas,
      distribucionCasos,
    };
  };

