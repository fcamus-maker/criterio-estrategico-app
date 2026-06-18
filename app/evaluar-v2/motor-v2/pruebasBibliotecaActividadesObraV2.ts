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
  riesgosFueraAplicabilidadActividad: ResultadoRiesgoActividadObra[];
  actividadesConPreguntasEstrategicasGenericas: string[];
  resultadosRiesgos: ResultadoRiesgoActividadObra[];
};

const MINIMO_ACTIVIDADES_ESPERADAS = 21;
const MINIMO_RIESGOS_TOTALES_ESPERADOS = 672;
const MINIMO_RIESGOS_POR_ACTIVIDAD = 32;
const MINIMO_PALABRAS_DESCRIPCION = 45;
const ACTIVIDADES_BLOQUE_B = new Set([
  "andamios_plataformas_trabajo",
  "trabajo_altura_lineas_vida_bordes_aberturas",
  "techumbres_cubiertas_paneles_tejas",
  "canaletas_bajadas_agua_remates_exteriores",
  "montaje_vigas_cerchas_elementos_altura",
  "instalacion_luminarias_altura",
  "escaleras_plataformas_elevadoras_accesos_temporales",
]);

const ACTIVIDADES_BLOQUE_C = new Set([
  "electricidad_provisoria_faena",
  "electricidad_definitiva_canalizaciones_tableros",
  "gasfiteria_redes_agua_potable_alcantarillado",
  "redes_sanitarias_bajadas_agua_drenajes",
  "climatizacion_ductos_ventilacion",
  "pruebas_presion_fugas_puesta_servicio",
  "canalizaciones_perforaciones_pasadas_muros_losas",
]);

const ACTIVIDADES_CON_PREGUNTAS_PROPIAS = new Set([...ACTIVIDADES_BLOQUE_B, ...ACTIVIDADES_BLOQUE_C]);

const EXPRESIONES_APLICABILIDAD_POR_ACTIVIDAD: Record<string, string[]> = {
  andamios_plataformas_trabajo: ["andamio", "plataforma", "baranda", "rodapie", "tarjeta", "acceso"],
  trabajo_altura_lineas_vida_bordes_aberturas: ["altura", "linea de vida", "borde", "abertura", "vano", "arnes"],
  techumbres_cubiertas_paneles_tejas: ["techumbre", "cubierta", "panel", "teja", "plancha", "tragaluz"],
  canaletas_bajadas_agua_remates_exteriores: ["canaleta", "bajada", "remate", "sello", "fachada", "borde exterior"],
  montaje_vigas_cerchas_elementos_altura: ["viga", "cercha", "montaje", "izaje", "rigger", "aparejo"],
  instalacion_luminarias_altura: ["luminaria", "tablero", "cable", "energia", "taladro"],
  escaleras_plataformas_elevadoras_accesos_temporales: ["escalera", "plataforma elevadora", "alza hombre", "pasarela", "estabilizador"],
  electricidad_provisoria_faena: ["tablero", "provisorio", "cable", "extension", "diferencial", "humedad"],
  electricidad_definitiva_canalizaciones_tableros: ["canalizacion", "tablero", "circuito", "energizacion", "cable", "bandeja"],
  gasfiteria_redes_agua_potable_alcantarillado: ["gasfiteria", "agua potable", "alcantarillado", "tuberia", "termofusion", "fuga"],
  redes_sanitarias_bajadas_agua_drenajes: ["red sanitaria", "bajada", "drenaje", "agua", "pendiente", "sello"],
  climatizacion_ductos_ventilacion: ["climatizacion", "ducto", "ventilacion", "rejilla", "cielo falso", "equipo"],
  pruebas_presion_fugas_puesta_servicio: ["prueba", "presion", "fuga", "valvula", "puesta en servicio", "acople"],
  canalizaciones_perforaciones_pasadas_muros_losas: ["canalizacion", "perforacion", "pasada", "muro", "losa", "sello"],
};

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
  const textoAplicabilidad = normalizarTextoPrueba(
    [
      riesgo.titulo,
      riesgo.descripcionTecnica,
      riesgo.objetoPrincipal,
      riesgo.condicionObservada,
      ...riesgo.palabrasClave,
    ].join(" "),
  );

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

  const expresionesAplicabilidad = EXPRESIONES_APLICABILIDAD_POR_ACTIVIDAD[actividad.id];
  if (
    expresionesAplicabilidad &&
    !expresionesAplicabilidad.some((expresion) => textoAplicabilidad.includes(normalizarTextoPrueba(expresion)))
  ) {
    erroresCriticos.push("Riesgo fuera de aplicabilidad basica de la actividad.");
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

  if (actividades.length < MINIMO_ACTIVIDADES_ESPERADAS) {
    erroresCriticos.push(`Minimo de actividades esperado ${MINIMO_ACTIVIDADES_ESPERADAS}, obtenido ${actividades.length}.`);
  }

  const actividadesConMenosDe30Riesgos = actividades
    .filter((actividad) => actividad.riesgosInherentes.length < MINIMO_RIESGOS_POR_ACTIVIDAD)
    .map((actividad) => actividad.id);

  if (actividadesConMenosDe30Riesgos.length > 0) {
    erroresCriticos.push("Existen actividades con menos de 32 riesgos inherentes.");
  }

  if (resultadosRiesgos.length < MINIMO_RIESGOS_TOTALES_ESPERADOS) {
    erroresCriticos.push(`Minimo de riesgos esperado ${MINIMO_RIESGOS_TOTALES_ESPERADOS}, obtenido ${resultadosRiesgos.length}.`);
  }

  const preguntasEstrategicasPorActividad = actividades
    .filter((actividad) => ACTIVIDADES_CON_PREGUNTAS_PROPIAS.has(actividad.id))
    .map((actividad) => ({
      id: actividad.id,
      firma: actividad.preguntasEstrategicasSugeridas.join(" | "),
    }));
  const actividadesConPreguntasEstrategicasGenericas = preguntasEstrategicasPorActividad
    .filter((actual, indice, todas) => todas.findIndex((otra) => otra.firma === actual.firma) !== indice)
    .map((actividad) => actividad.id);

  if (actividadesConPreguntasEstrategicasGenericas.length > 0) {
    erroresCriticos.push("Existen actividades de biblioteca ampliada con preguntas estrategicas identicas.");
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
    riesgosFueraAplicabilidadActividad: resultadosRiesgos.filter((resultado) =>
      resultado.erroresCriticos.includes("Riesgo fuera de aplicabilidad basica de la actividad."),
    ),
    actividadesConPreguntasEstrategicasGenericas,
    resultadosRiesgos,
  };
}
