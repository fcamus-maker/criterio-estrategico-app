import {
  BIBLIOTECA_ACTIVIDADES_OBRA_V2,
  type ActividadObraPreventiva,
  type RiesgoInherenteActividadObra,
} from "./bibliotecaActividadesObraV2";

type ResultadoRiesgoActividadObra = {
  idActividad: string;
  idRiesgo: string;
  titulo: string;
  erroresCriticos: string[];
  erroresMenores: string[];
};

export type ResultadoEvaluacionBibliotecaActividadesObra = {
  totalActividades: number;
  totalRiesgos: number;
  riesgosValidos: number;
  porcentajeCumplimiento: number;
  erroresCriticos: string[];
  erroresMenores: string[];
  actividadesConMenosDe30Riesgos: string[];
  riesgosConDescripcionInsuficiente: ResultadoRiesgoActividadObra[];
  riesgosSinFamiliaPreventiva: ResultadoRiesgoActividadObra[];
  riesgosSinDesviacionPreventiva: ResultadoRiesgoActividadObra[];
  riesgosSinControles: ResultadoRiesgoActividadObra[];
  riesgosSinAccionInmediata: ResultadoRiesgoActividadObra[];
  riesgosSinDocumentacionDefinida: ResultadoRiesgoActividadObra[];
  riesgosSinPreguntas: ResultadoRiesgoActividadObra[];
  riesgosConTextoProhibido: ResultadoRiesgoActividadObra[];
  riesgosConTituloDuplicado: string[];
  resultadosRiesgos: ResultadoRiesgoActividadObra[];
};

const TOTAL_ACTIVIDADES_ESPERADAS = 7;
const MINIMO_RIESGOS_POR_ACTIVIDAD = 30;
const MINIMO_PALABRAS_DESCRIPCION = 45;
const TEXTOS_PROHIBIDOS = [
  "Motor V2",
  "Motor V3",
  "router",
  "taxonomia",
  "base tipada",
  "fallback",
  "modo demo",
  "debug",
  "score",
];

function contarPalabras(texto: string): number {
  return texto.trim().split(/\s+/).filter(Boolean).length;
}

function normalizarTextoPrueba(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function contieneTextoProhibido(texto: string): boolean {
  const textoNormalizado = normalizarTextoPrueba(texto);
  return TEXTOS_PROHIBIDOS.some((prohibido) => textoNormalizado.includes(normalizarTextoPrueba(prohibido)));
}

function textosVisiblesRiesgo(riesgo: RiesgoInherenteActividadObra): string[] {
  return [
    riesgo.titulo,
    riesgo.descripcionTecnica,
    riesgo.actoInseguroAsociado,
    riesgo.condicionInseguraAsociada,
    riesgo.objetoPrincipal,
    riesgo.condicionObservada,
    riesgo.exposicion,
    riesgo.consecuenciaProbable,
    riesgo.controlFaltanteOFallido,
    riesgo.accionInmediataSugerida,
    riesgo.errorQueDebeEvitar,
    ...riesgo.palabrasClave,
    ...riesgo.controlesEsperados,
    ...riesgo.documentosAplicables,
    ...riesgo.documentosNoAplicables,
    ...riesgo.preguntasSugeridas,
    ...riesgo.preguntasProhibidas,
  ];
}

function textosVisiblesActividad(actividad: ActividadObraPreventiva): string[] {
  return [
    actividad.nombreVisible,
    actividad.descripcionActividad,
    actividad.etapaObra,
    ...actividad.palabrasClaveActividad,
    ...actividad.documentosFrecuentesAplicables,
    ...actividad.documentosQueNoAplicanPorDefecto,
    ...actividad.preguntasEstrategicasSugeridas,
    ...actividad.erroresQueDebeEvitarElMotor,
  ];
}

function validarRiesgo(actividad: ActividadObraPreventiva, riesgo: RiesgoInherenteActividadObra): ResultadoRiesgoActividadObra {
  const erroresCriticos: string[] = [];
  const erroresMenores: string[] = [];

  if (contarPalabras(riesgo.descripcionTecnica) < MINIMO_PALABRAS_DESCRIPCION) {
    erroresCriticos.push("Descripcion tecnica insuficiente.");
  }

  if (riesgo.familiasPreventivas.length === 0) {
    erroresCriticos.push("Sin familia preventiva.");
  }

  if (riesgo.desviacionesPreventivas.length === 0) {
    erroresCriticos.push("Sin desviacion preventiva.");
  }

  if (riesgo.controlesEsperados.length === 0) {
    erroresCriticos.push("Sin controles esperados.");
  }

  if (!riesgo.accionInmediataSugerida.trim()) {
    erroresCriticos.push("Sin accion inmediata sugerida.");
  }

  if (riesgo.documentosAplicables.length === 0 && riesgo.documentosNoAplicables.length === 0) {
    erroresCriticos.push("Sin documentacion aplicable o no aplicable definida.");
  }

  if (riesgo.preguntasSugeridas.length === 0) {
    erroresCriticos.push("Sin preguntas sugeridas.");
  }

  if (textosVisiblesRiesgo(riesgo).some(contieneTextoProhibido) || textosVisiblesActividad(actividad).some(contieneTextoProhibido)) {
    erroresCriticos.push("Contiene texto interno prohibido.");
  }

  if (!riesgo.objetoPrincipal.trim() || !riesgo.condicionObservada.trim() || !riesgo.exposicion.trim()) {
    erroresMenores.push("Faltan atributos preventivos basicos.");
  }

  if (!riesgo.consecuenciaProbable.trim() || !riesgo.controlFaltanteOFallido.trim()) {
    erroresMenores.push("Faltan consecuencia o control fallido.");
  }

  return {
    idActividad: actividad.id,
    idRiesgo: riesgo.id,
    titulo: riesgo.titulo,
    erroresCriticos,
    erroresMenores,
  };
}

export function evaluarBibliotecaActividadesObra(): ResultadoEvaluacionBibliotecaActividadesObra {
  const actividades = BIBLIOTECA_ACTIVIDADES_OBRA_V2;
  const resultadosRiesgos = actividades.flatMap((actividad) =>
    actividad.riesgosInherentes.map((riesgo) => validarRiesgo(actividad, riesgo)),
  );

  const erroresCriticos: string[] = [];
  const erroresMenores: string[] = [];

  if (actividades.length !== TOTAL_ACTIVIDADES_ESPERADAS) {
    erroresCriticos.push(`Total de actividades esperado ${TOTAL_ACTIVIDADES_ESPERADAS}, obtenido ${actividades.length}.`);
  }

  const actividadesConMenosDe30Riesgos = actividades
    .filter((actividad) => actividad.riesgosInherentes.length < MINIMO_RIESGOS_POR_ACTIVIDAD)
    .map((actividad) => actividad.id);

  if (actividadesConMenosDe30Riesgos.length > 0) {
    erroresCriticos.push("Existen actividades con menos de 30 riesgos inherentes.");
  }

  const titulos = actividades.flatMap((actividad) => actividad.riesgosInherentes.map((riesgo) => riesgo.titulo));
  const riesgosConTituloDuplicado = titulos.filter((titulo, indice) => titulos.indexOf(titulo) !== indice);

  if (riesgosConTituloDuplicado.length > 0) {
    erroresCriticos.push("Existen titulos de riesgo duplicados.");
  }

  for (const resultado of resultadosRiesgos) {
    erroresCriticos.push(...resultado.erroresCriticos.map((error) => `${resultado.idRiesgo}: ${error}`));
    erroresMenores.push(...resultado.erroresMenores.map((error) => `${resultado.idRiesgo}: ${error}`));
  }

  const totalRiesgos = resultadosRiesgos.length;
  const riesgosInvalidos = resultadosRiesgos.filter(
    (resultado) => resultado.erroresCriticos.length > 0 || resultado.erroresMenores.length > 0,
  ).length;
  const riesgosValidos = totalRiesgos - riesgosInvalidos;

  return {
    totalActividades: actividades.length,
    totalRiesgos,
    riesgosValidos,
    porcentajeCumplimiento: totalRiesgos === 0 ? 0 : Math.round((riesgosValidos / totalRiesgos) * 100),
    erroresCriticos,
    erroresMenores,
    actividadesConMenosDe30Riesgos,
    riesgosConDescripcionInsuficiente: resultadosRiesgos.filter((resultado) =>
      resultado.erroresCriticos.includes("Descripcion tecnica insuficiente."),
    ),
    riesgosSinFamiliaPreventiva: resultadosRiesgos.filter((resultado) =>
      resultado.erroresCriticos.includes("Sin familia preventiva."),
    ),
    riesgosSinDesviacionPreventiva: resultadosRiesgos.filter((resultado) =>
      resultado.erroresCriticos.includes("Sin desviacion preventiva."),
    ),
    riesgosSinControles: resultadosRiesgos.filter((resultado) =>
      resultado.erroresCriticos.includes("Sin controles esperados."),
    ),
    riesgosSinAccionInmediata: resultadosRiesgos.filter((resultado) =>
      resultado.erroresCriticos.includes("Sin accion inmediata sugerida."),
    ),
    riesgosSinDocumentacionDefinida: resultadosRiesgos.filter((resultado) =>
      resultado.erroresCriticos.includes("Sin documentacion aplicable o no aplicable definida."),
    ),
    riesgosSinPreguntas: resultadosRiesgos.filter((resultado) =>
      resultado.erroresCriticos.includes("Sin preguntas sugeridas."),
    ),
    riesgosConTextoProhibido: resultadosRiesgos.filter((resultado) =>
      resultado.erroresCriticos.includes("Contiene texto interno prohibido."),
    ),
    riesgosConTituloDuplicado,
    resultadosRiesgos,
  };
}
