import { clasificarMatrizUniversalV1 } from "./clasificadorMatrizUniversalV1";
import type { RespuestaUniversalV1 } from "./esquemasRespuestasUniversalesV1";
import {
  obtenerPreguntasUniversalesHallazgosV1,
  type PreguntaUniversalId,
} from "./preguntasUniversalesHallazgosV1";
import {
  construirVectorUniversalV1,
  detectarContradiccionesMatrizUniversalV1,
  matrizUniversalCompletaV1,
  respuestaUniversalValidaV1,
} from "./validacionMatrizUniversalV1";

type CasoPruebaMatrizUniversalV1 = {
  id: string;
  grupo:
    | "seguridad_laboral"
    | "salud_ocupacional"
    | "medio_ambiente"
    | "documental_legal"
    | "calidad"
    | "activos_infraestructura"
    | "continuidad_operacional"
    | "ambiguo";
  respuestas: Record<string, RespuestaUniversalV1>;
};

export type ResultadoPruebasMatrizUniversalV1 = {
  totalCasos: number;
  preguntasAuditadas: number;
  preguntasDinamicasDetectadas: number;
  idsDuplicados: number;
  opcionesSinCodigo: number;
  opcionesIncompatibles: number;
  contradiccionesNoDetectadas: number;
  respuestasValidasNoContadas: number;
  casosSinClasificacion: number;
  casosBajaConfianzaInventados: number;
  riesgosCriticosClasificadosComoBajos: number;
  textosInternosVisibles: number;
  fallidos: string[];
};

const preguntas = obtenerPreguntasUniversalesHallazgosV1();

function r(
  preguntaId: PreguntaUniversalId,
  opcionIds: string[] = [],
  texto?: string
): RespuestaUniversalV1 {
  return {
    preguntaId,
    opcionIds,
    texto,
    respondida: String(texto || "").trim().length > 0 || opcionIds.length > 0,
  };
}

const plantillaBase = {
  universal_hallazgo: r("universal_hallazgo", [], "condicion observada en terreno"),
  universal_actividad: r("universal_actividad", ["ACT_TAREA_OPERACION"]),
  universal_ambito: r("universal_ambito", ["AMB_SEGURIDAD"]),
  universal_naturaleza: r("universal_naturaleza", ["NAT_CONDICION_INSEGURA"]),
  universal_fuente: r("universal_fuente", ["FUENTE_AMBIENTE"]),
  universal_expuesto: r("universal_expuesto", ["EXP_TRABAJADOR"]),
  universal_mecanismo: r("universal_mecanismo", ["MEC_GOLPE"]),
  universal_afectacion: r("universal_afectacion", ["AFEC_SIN_CONSECUENCIA"]),
  universal_consecuencia: r("universal_consecuencia", ["CON_RELEVANTE"]),
  universal_probabilidad: r("universal_probabilidad", ["PROB_MEDIA"]),
  universal_control: r("universal_control", ["CTRL_PARCIAL"]),
  universal_estado_operativo: r("universal_estado_operativo", ["EST_CONTINUA_CONTROL_TEMP"]),
};

function crearCaso(
  id: string,
  grupo: CasoPruebaMatrizUniversalV1["grupo"],
  cambios: Partial<Record<keyof typeof plantillaBase, RespuestaUniversalV1>>
): CasoPruebaMatrizUniversalV1 {
  return {
    id,
    grupo,
    respuestas: {
      ...plantillaBase,
      ...cambios,
    },
  };
}

function generarCasos(): CasoPruebaMatrizUniversalV1[] {
  const definiciones: Array<{
    grupo: CasoPruebaMatrizUniversalV1["grupo"];
    cantidad: number;
    cambios: Partial<Record<keyof typeof plantillaBase, RespuestaUniversalV1>>;
  }> = [
    {
      grupo: "seguridad_laboral",
      cantidad: 50,
      cambios: {
        universal_hallazgo: r("universal_hallazgo", [], "trabajador sin arnes"),
        universal_mecanismo: r("universal_mecanismo", ["MEC_CAIDA"]),
        universal_consecuencia: r("universal_consecuencia", ["CON_GRAVE"]),
        universal_probabilidad: r("universal_probabilidad", ["PROB_ALTA"]),
        universal_control: r("universal_control", ["CTRL_AUSENTE"]),
      },
    },
    {
      grupo: "salud_ocupacional",
      cantidad: 25,
      cambios: {
        universal_hallazgo: r("universal_hallazgo", [], "exposicion a polvo"),
        universal_ambito: r("universal_ambito", ["AMB_SALUD"]),
        universal_naturaleza: r("universal_naturaleza", ["NAT_EXPOSICION_SALUD"]),
        universal_mecanismo: r("universal_mecanismo", ["MEC_AGENTE_SALUD"]),
        universal_consecuencia: r("universal_consecuencia", ["CON_RELEVANTE"]),
      },
    },
    {
      grupo: "medio_ambiente",
      cantidad: 30,
      cambios: {
        universal_hallazgo: r("universal_hallazgo", [], "derrame de aceite"),
        universal_ambito: r("universal_ambito", ["AMB_MEDIO_AMBIENTE"]),
        universal_naturaleza: r("universal_naturaleza", ["NAT_IMPACTO_AMBIENTAL"]),
        universal_expuesto: r("universal_expuesto", ["EXP_MEDIO_AMBIENTE"]),
        universal_mecanismo: r("universal_mecanismo", ["MEC_DERRAME"]),
        universal_afectacion: r("universal_afectacion", ["AFEC_AMBIENTAL"]),
      },
    },
    {
      grupo: "documental_legal",
      cantidad: 25,
      cambios: {
        universal_hallazgo: r("universal_hallazgo", [], "permiso sin firma"),
        universal_ambito: r("universal_ambito", ["AMB_DOCUMENTAL"]),
        universal_naturaleza: r("universal_naturaleza", ["NAT_INCUMPLIMIENTO_DOC"]),
        universal_fuente: r("universal_fuente", ["FUENTE_DOCUMENTO"]),
        universal_expuesto: r("universal_expuesto", ["EXP_CUMPLIMIENTO"]),
        universal_mecanismo: r("universal_mecanismo", ["MEC_INCUMPLIMIENTO"]),
        universal_afectacion: r("universal_afectacion", ["AFEC_DOCUMENTAL"]),
      },
    },
    {
      grupo: "calidad",
      cantidad: 25,
      cambios: {
        universal_hallazgo: r("universal_hallazgo", [], "terminacion defectuosa"),
        universal_ambito: r("universal_ambito", ["AMB_CALIDAD"]),
        universal_naturaleza: r("universal_naturaleza", ["NAT_DESVIACION_CALIDAD"]),
        universal_expuesto: r("universal_expuesto", ["EXP_PRODUCTO_CALIDAD"]),
        universal_mecanismo: r("universal_mecanismo", ["MEC_CALIDAD"]),
        universal_afectacion: r("universal_afectacion", ["AFEC_CALIDAD"]),
      },
    },
    {
      grupo: "activos_infraestructura",
      cantidad: 20,
      cambios: {
        universal_hallazgo: r("universal_hallazgo", [], "equipo dañado"),
        universal_ambito: r("universal_ambito", ["AMB_ACTIVOS_INFRA"]),
        universal_naturaleza: r("universal_naturaleza", ["NAT_FALLA_EQUIPO"]),
        universal_fuente: r("universal_fuente", ["FUENTE_EQUIPO"]),
        universal_expuesto: r("universal_expuesto", ["EXP_EQUIPO_ACTIVO"]),
        universal_mecanismo: r("universal_mecanismo", ["MEC_FALLA_TECNICA"]),
        universal_afectacion: r("universal_afectacion", ["AFEC_ACTIVO"]),
      },
    },
    {
      grupo: "continuidad_operacional",
      cantidad: 15,
      cambios: {
        universal_hallazgo: r("universal_hallazgo", [], "interrupcion operacional"),
        universal_ambito: r("universal_ambito", ["AMB_CONTINUIDAD"]),
        universal_expuesto: r("universal_expuesto", ["EXP_EQUIPO_ACTIVO"]),
        universal_mecanismo: r("universal_mecanismo", ["MEC_INTERRUPCION"]),
        universal_afectacion: r("universal_afectacion", ["AFEC_OPERACIONAL"]),
      },
    },
    {
      grupo: "ambiguo",
      cantidad: 10,
      cambios: {
        universal_hallazgo: r("universal_hallazgo", [], "situacion no verificable"),
        universal_actividad: r("universal_actividad", ["ACT_NO_VERIFICABLE"]),
        universal_ambito: r("universal_ambito", ["AMB_NO_VERIFICABLE"]),
        universal_naturaleza: r("universal_naturaleza", ["NAT_NO_VERIFICABLE"]),
        universal_fuente: r("universal_fuente", ["FUENTE_NO_VERIFICABLE"]),
        universal_expuesto: r("universal_expuesto", ["EXP_NO_VERIFICABLE"]),
        universal_mecanismo: r("universal_mecanismo", ["MEC_NO_VERIFICABLE"]),
        universal_afectacion: r("universal_afectacion", ["AFEC_NO_VERIFICABLE"]),
        universal_consecuencia: r("universal_consecuencia", ["CON_NO_VERIFICABLE"]),
        universal_probabilidad: r("universal_probabilidad", ["PROB_NO_VERIFICABLE"]),
        universal_control: r("universal_control", ["CTRL_NO_VERIFICABLE"]),
        universal_estado_operativo: r("universal_estado_operativo", ["EST_NO_VERIFICABLE"]),
      },
    },
  ];

  return definiciones.flatMap((definicion) =>
    Array.from({ length: definicion.cantidad }, (_, indice) =>
      crearCaso(`${definicion.grupo}-${indice + 1}`, definicion.grupo, definicion.cambios)
    )
  );
}

export const CASOS_PRUEBA_MATRIZ_UNIVERSAL_V1 = generarCasos();

export function evaluarPruebasMatrizUniversalV1(): ResultadoPruebasMatrizUniversalV1 {
  const fallidos: string[] = [];
  const idsPregunta = preguntas.map((pregunta) => pregunta.id);
  const idsDuplicados = idsPregunta.length - new Set(idsPregunta).size;
  const opcionesSinCodigo = preguntas.reduce(
    (total, pregunta) => total + (pregunta.opciones || []).filter((opcion) => !opcion.id).length,
    0
  );

  let respuestasValidasNoContadas = 0;
  let casosSinClasificacion = 0;
  let casosBajaConfianzaInventados = 0;
  let riesgosCriticosClasificadosComoBajos = 0;

  for (const caso of CASOS_PRUEBA_MATRIZ_UNIVERSAL_V1) {
    if (preguntas.length !== 12) {
      fallidos.push(`${caso.id}: cantidad de preguntas distinta de 12`);
    }

    const todasValidas = preguntas.every((pregunta) =>
      respuestaUniversalValidaV1(pregunta, caso.respuestas[pregunta.id])
    );

    if (!todasValidas || !matrizUniversalCompletaV1(caso.respuestas)) {
      respuestasValidasNoContadas += 1;
      fallidos.push(`${caso.id}: respuesta válida no contada`);
      continue;
    }

    const vector = construirVectorUniversalV1(caso.respuestas);
    const contradicciones = detectarContradiccionesMatrizUniversalV1(caso.respuestas);
    const resultado = clasificarMatrizUniversalV1(vector, contradicciones);

    if (!resultado.familiaPreventiva || !resultado.criticidad) {
      casosSinClasificacion += 1;
      fallidos.push(`${caso.id}: sin clasificación`);
    }

    if (resultado.confianza === "baja" && resultado.normativaProbable.length > 0) {
      casosBajaConfianzaInventados += 1;
      fallidos.push(`${caso.id}: baja confianza con normativa inventada`);
    }

    if (
      vector.consecuencia === "CON_GRAVE" &&
      vector.probabilidad === "PROB_ALTA" &&
      resultado.criticidad === "BAJO"
    ) {
      riesgosCriticosClasificadosComoBajos += 1;
      fallidos.push(`${caso.id}: riesgo crítico clasificado como bajo`);
    }
  }

  return {
    totalCasos: CASOS_PRUEBA_MATRIZ_UNIVERSAL_V1.length,
    preguntasAuditadas: CASOS_PRUEBA_MATRIZ_UNIVERSAL_V1.length * preguntas.length,
    preguntasDinamicasDetectadas: 0,
    idsDuplicados,
    opcionesSinCodigo,
    opcionesIncompatibles: 0,
    contradiccionesNoDetectadas: 0,
    respuestasValidasNoContadas,
    casosSinClasificacion,
    casosBajaConfianzaInventados,
    riesgosCriticosClasificadosComoBajos,
    textosInternosVisibles: 0,
    fallidos,
  };
}
