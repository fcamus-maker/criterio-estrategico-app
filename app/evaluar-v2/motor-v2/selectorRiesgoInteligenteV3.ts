import {
  BIBLIOTECA_ACTIVIDADES_OBRA_V2,
  type ActividadObraPreventiva,
  type RiesgoInherenteActividadObra,
} from "./bibliotecaActividadesObraV2";
import type { PreguntaFormularioAdaptativaV2 } from "./formularioAdaptativoV2";
import type { FamiliaTaxonomiaPreventivaId } from "./taxonomiaPreventivaV2";

export const VERSION_SELECTOR_RIESGO_INTELIGENTE = "selector_riesgo_inteligente_v3" as const;

export type ConfianzaRiesgoInteligente = "alta" | "media" | "baja";

export type SeleccionRiesgoInteligenteV3 = {
  version: typeof VERSION_SELECTOR_RIESGO_INTELIGENTE;
  actividad?: ActividadObraPreventiva;
  riesgo?: RiesgoInherenteActividadObra;
  confianza: ConfianzaRiesgoInteligente;
  puntaje: number;
  razones: string[];
};

type EntradaSelectorRiesgoInteligenteV3 = {
  descripcion?: string;
  riesgoEspecifico?: string;
  actividad?: string;
  condicion?: string;
  familiaSugerida?: FamiliaTaxonomiaPreventivaId | null;
};

const PALABRAS_VACIAS = new Set([
  "actual",
  "actividad",
  "area",
  "como",
  "condicion",
  "con",
  "contra",
  "cual",
  "cuando",
  "desde",
  "donde",
  "durante",
  "esta",
  "este",
  "esto",
  "hallazgo",
  "hacia",
  "para",
  "pero",
  "puede",
  "riesgo",
  "segun",
  "sobre",
  "solo",
  "trabajador",
  "trabajadores",
  "trabajo",
  "una",
  "uno",
  "unos",
  "zona",
]);

const REEMPLAZOS_VISIBLES: Array<[RegExp, string]> = [
  [/\bque\b/gi, "qué"],
  [/\bcual\b/gi, "cuál"],
  [/\besta\b/gi, "está"],
  [/\bestan\b/gi, "están"],
  [/\bproteccion\b/gi, "protección"],
  [/\bcaida\b/gi, "caída"],
  [/\banticaidas\b/gi, "anticaídas"],
  [/\blinea\b/gi, "línea"],
  [/\blineas\b/gi, "líneas"],
  [/\barnes\b/gi, "arnés"],
  [/\benergia\b/gi, "energía"],
  [/\belectrico\b/gi, "eléctrico"],
  [/\belectrica\b/gi, "eléctrica"],
  [/\binspeccion\b/gi, "inspección"],
  [/\bsenalizacion\b/gi, "señalización"],
  [/\bsegregacion\b/gi, "segregación"],
  [/\bsenalizar\b/gi, "señalizar"],
  [/\bsenalizad([ao]s?)\b/gi, "señalizad$1"],
  [/\boperacion\b/gi, "operación"],
  [/\baccion\b/gi, "acción"],
  [/\bexposicion\b/gi, "exposición"],
  [/\bverificacion\b/gi, "verificación"],
  [/\breparacion\b/gi, "reparación"],
  [/\breposicion\b/gi, "reposición"],
  [/\bcontencion\b/gi, "contención"],
  [/\brotulacion\b/gi, "rotulación"],
  [/\bautorizacion\b/gi, "autorización"],
  [/\bcertificacion\b/gi, "certificación"],
  [/\bmantencion\b/gi, "mantención"],
  [/\bdano\b/gi, "daño"],
  [/\baplicacion\b/gi, "aplicación"],
  [/\binstalacion\b/gi, "instalación"],
  [/\bpresion\b/gi, "presión"],
  [/\bproyeccion\b/gi, "proyección"],
  [/\brevision\b/gi, "revisión"],
  [/\btecnica\b/gi, "técnica"],
  [/\bfisica\b/gi, "física"],
  [/\big[nñ]icion\b/gi, "ignición"],
  [/\barea\b/gi, "área"],
  [/\bventilacion\b/gi, "ventilación"],
  [/\bexcavacion\b/gi, "excavación"],
  [/\bentibacion\b/gi, "entibación"],
  [/\bsujecion\b/gi, "sujeción"],
  [/\brotacion\b/gi, "rotación"],
  [/\bvibracion\b/gi, "vibración"],
  [/\bvalvula\b/gi, "válvula"],
  [/\bextraccion\b/gi, "extracción"],
  [/\bhumectacion\b/gi, "humectación"],
  [/\bmecanica\b/gi, "mecánica"],
  [/\bmecanico\b/gi, "mecánico"],
  [/\bmetodo\b/gi, "método"],
  [/\bcalibracion\b/gi, "calibración"],
  [/\bliberacion\b/gi, "liberación"],
  [/\bmedicion\b/gi, "medición"],
  [/\berronea\b/gi, "errónea"],
  [/\bcirculacion\b/gi, "circulación"],
  [/\bubicacion\b/gi, "ubicación"],
  [/\bidentificacion\b/gi, "identificación"],
  [/\bposicion\b/gi, "posición"],
  [/\bclimatizacion\b/gi, "climatización"],
  [/\bfragiles\b/gi, "frágiles"],
  [/\bescorrentias\b/gi, "escorrentías"],
  [/\btecnico\b/gi, "técnico"],
  [/\btransito\b/gi, "tránsito"],
  [/\bcorreccion\b/gi, "corrección"],
  [/\bperimetral\b/gi, "perimetral"],
  [/\btuberias\b/gi, "tuberías"],
  [/\bquimico\b/gi, "químico"],
  [/\bquimica\b/gi, "química"],
  [/\bcritico\b/gi, "crítico"],
  [/\bcritica\b/gi, "crítica"],
];

const normalizar = (valor?: unknown) =>
  String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s/-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const tokens = (valor?: unknown) =>
  normalizar(valor)
    .split(" ")
    .filter((token) => token.length >= 3 && !PALABRAS_VACIAS.has(token));

const unicos = <T>(items: T[]) => Array.from(new Set(items));

const TERMINOS_RIESGO_DEMASIADO_GENERALES = new Set([
  "actividad",
  "area",
  "cierre",
  "condicion",
  "control",
  "correctiva",
  "equipo",
  "evaluacion",
  "frente",
  "material",
  "operacion",
  "preventiva",
  "proteccion",
  "protector",
  "punto",
  "requiere",
  "retiro",
  "revision",
  "riesgo",
  "simple",
  "tarea",
  "tecnica",
  "terreno",
  "trabajo",
  "uso",
  "verificacion",
  "zona",
]);

const coincidenciasTokens = (textoTokens: Set<string>, fuente?: unknown) =>
  unicos(tokens(fuente)).filter((token) => textoTokens.has(token)).length;

const puntajeFrases = (texto: string, frases: string[], peso: number) =>
  unicos(frases.map(normalizar).filter((frase) => frase.length >= 4)).reduce((total, frase) => {
    if (!texto.includes(frase)) return total;
    return total + peso + Math.min(frase.split(" ").length, 4);
  }, 0);

const puntuarActividad = (
  actividad: ActividadObraPreventiva,
  texto: string,
  textoTokens: Set<string>,
) => {
  const frases = [actividad.nombreVisible, actividad.etapaObra, ...actividad.palabrasClaveActividad];
  return (
    puntajeFrases(texto, frases, 7) +
    coincidenciasTokens(textoTokens, frases.join(" ")) * 2 +
    coincidenciasTokens(textoTokens, actividad.descripcionActividad) +
    puntajeActividadSemantico(texto, actividad.id)
  );
};

const REGLAS_ACTIVIDAD: Array<{ texto: RegExp; actividad: RegExp; puntos: number }> = [
  { texto: /zanja|excavacion|entibacion|talud/, actividad: /excavaciones_movimiento_tierra/, puntos: 55 },
  { texto: /altura|arnes|linea de vida|borde abierto/, actividad: /trabajo_altura_lineas_vida_bordes_aberturas/, puntos: 50 },
  { texto: /tablero|circuito|electrico|electricidad|loto/, actividad: /electricidad_(provisoria|definitiva)/, puntos: 45 },
  { texto: /vidrio|espejo|mampara/, actividad: /vidrios_espejos_paneles_fragiles/, puntos: 55 },
  { texto: /derrame.*(suelo|agua|drenaje)|contencion.*derrame/, actividad: /derrames_contencion_limpieza_suelo_agua/, puntos: 55 },
  { texto: /ruido|emision|escorrentia/, actividad: /control_ambiental_obra_polvo_ruido_emisiones_escorrentias/, puntos: 45 },
  { texto: /pintura|esmalte|barniz|solvente/, actividad: /pintura_interior_exterior_esmaltes_barnices/, puntos: 50 },
  { texto: /andamio|plataforma de trabajo/, actividad: /andamios_plataformas_trabajo/, puntos: 50 },
  { texto: /grua|izaje|carga suspendida|eslinga/, actividad: /izaje_gruas_elementos_amarre_carga_suspendida/, puntos: 55 },
  { texto: /residuo|contenedor|segregacion de residuos/, actividad: /residuos_peligrosos_no_peligrosos_segregacion_disposicion/, puntos: 45 },
  { texto: /ast|art|pts|permiso de trabajo/, actividad: /procedimientos_pts_ast_art_permisos_trabajo/, puntos: 35 },
];

function puntajeActividadSemantico(texto: string, actividadId: string) {
  return REGLAS_ACTIVIDAD.reduce(
    (total, regla) => total + (regla.texto.test(texto) && regla.actividad.test(actividadId) ? regla.puntos : 0),
    0,
  );
}

const puntuarRiesgo = (
  actividad: ActividadObraPreventiva,
  riesgo: RiesgoInherenteActividadObra,
  texto: string,
  textoTokens: Set<string>,
  puntajeActividad: number,
  familiaSugerida?: FamiliaTaxonomiaPreventivaId | null,
) => {
  const palabrasActividad = new Set(
    [actividad.nombreVisible, actividad.etapaObra, ...actividad.palabrasClaveActividad]
      .flatMap(tokens),
  );
  const palabrasEspecificas = riesgo.palabrasClave.filter((palabra) =>
    tokens(palabra).some((token) => !palabrasActividad.has(token)),
  );
  const frasesClave = [riesgo.objetoPrincipal, riesgo.condicionObservada, ...palabrasEspecificas];
  const tituloEspecifico = riesgo.titulo.split(" - ")[0];
  const textoTecnico = [
    riesgo.titulo,
    riesgo.condicionInseguraAsociada,
    riesgo.actoInseguroAsociado,
    riesgo.controlFaltanteOFallido,
    riesgo.consecuenciaProbable,
  ].join(" ");
  const familiaCoincide = Boolean(
    familiaSugerida && riesgo.familiasPreventivas.includes(familiaSugerida),
  );
  const contextoDocumental = /(\bast\b|\bart\b|\bpts\b|permiso|autorizacion|document|registro|firma|certific|hds|sds|matriz)/.test(texto);
  const riesgoDocumental =
    riesgo.tipoRiesgo === "documental" ||
    actividad.id === "procedimientos_pts_ast_art_permisos_trabajo";
  const penalizacionDocumental = riesgoDocumental && !contextoDocumental ? 55 : 0;
  const penalizacionPorNegacion = riesgoNegadoEnTexto(texto, riesgo) ? 100 : 0;

  return (
    Math.min(puntajeActividad, 55) +
    puntajeFrases(texto, frasesClave, 8) +
    coincidenciasTokens(textoTokens, frasesClave.join(" ")) * 4 +
    coincidenciasTokens(textoTokens, tituloEspecifico) * 7 +
    coincidenciasTokens(textoTokens, textoTecnico) * 2 +
    (familiaCoincide ? 8 : 0) +
    puntajeSemantico(texto, riesgo) -
    penalizacionDocumental -
    penalizacionPorNegacion
  );
};

const REGLAS_SEMANTICAS: Array<{ texto: RegExp; riesgo: RegExp; puntos: number }> = [
  { texto: /(vidrio|espejo).*(quebrad|rot|triz|borde)|(?:quebrad|rot|triz).*(vidrio|espejo)/, riesgo: /vidrio_roto_expuesto|espejo_trizado/, puntos: 70 },
  { texto: /derrame.*suelo|suelo.*derrame/, riesgo: /derrame_suelo/, puntos: 75 },
  { texto: /derrame.*(drenaje|alcantarillado)/, riesgo: /derrame_drenaje/, puntos: 75 },
  { texto: /derrame.*(agua|curso)/, riesgo: /derrame_curso_agua/, puntos: 70 },
  { texto: /ruido|proteccion auditiva|exposicion auditiva/, riesgo: /ruido_ambiental|ruido_vibracion/, puntos: 65 },
  { texto: /polvo|silice/, riesgo: /polvo_suspension|polvo_silice|perforacion_polvo/, puntos: 60 },
  { texto: /zanja|excavacion.*(entib|talud)|sin entibacion/, riesgo: /excavacion_entibacion|entibacion/, puntos: 70 },
  { texto: /arnes|linea de vida|borde.*altura|altura.*sin/, riesgo: /altura|borde_abierto|proteccion_caida/, puntos: 65 },
  { texto: /tablero.*(humedad|agua)|humedad.*electr/, riesgo: /sobrecarga_humedad|tablero.*proteccion/, puntos: 70 },
  { texto: /(loto|bloqueo (electrico|de energia|energia)).*(ausente|sin|no)|sin bloqueo (loto|electrico|de energia)|energia.*sin bloqueo/, riesgo: /bloqueo|loto/, puntos: 65 },
  { texto: /extintor.*(vencid|descarg|sin vigencia)/, riesgo: /extintor|equipo_emergencia_deficiente/, puntos: 70 },
  { texto: /(pasillo|ruta|transito).*(obstru|bloque)|obstru.*(pasillo|ruta|transito)/, riesgo: /ruta_circulacion_obstruida|orden_aseo/, puntos: 65 },
  { texto: /(gasolina|combustible).*(bidon|recipiente|envase)/, riesgo: /gasolina_recipiente|bidon_no_autorizado|envase_inadecuado/, puntos: 65 },
  { texto: /(residuo peligroso).*(mezcl|segreg)/, riesgo: /residuo_peligroso_mal_segregado/, puntos: 70 },
  { texto: /(ast|art|pts|permiso).*(ausente|sin|vencid|falt)|sin (ast|art|pts|permiso)/, riesgo: /autorizacion|documentacion|permiso|ast_art|pts/, puntos: 60 },
  { texto: /(grua|izaje|carga suspendida)/, riesgo: /izaje|carga_suspendida/, puntos: 55 },
  { texto: /(escalera).*(inestable|danad|sin asegurar)/, riesgo: /escalera|acceso/, puntos: 60 },
];

function puntajeSemantico(texto: string, riesgo: RiesgoInherenteActividadObra) {
  if (riesgoNegadoEnTexto(texto, riesgo)) return 0;
  return REGLAS_SEMANTICAS.reduce(
    (total, regla) => total + (regla.texto.test(texto) && regla.riesgo.test(riesgo.id) ? regla.puntos : 0),
    0,
  );
}

function riesgoNegadoEnTexto(texto: string, riesgo: RiesgoInherenteActividadObra) {
  if (
    /ruta_circulacion_obstruida|orden_aseo/.test(riesgo.id) &&
    /(sin obstruir|no obstruye|sin bloqueo de evacuacion|ruta (permanece )?libre)/.test(texto)
  ) return true;
  if (
    /altura|borde_abierto|proteccion_caida/.test(riesgo.id) &&
    /(sin tarea critica asociada|sin exposicion critica|sin trabajo en altura)/.test(texto)
  ) return true;
  return false;
}

const calcularAnclajeEspecifico = (
  texto: string,
  textoTokens: Set<string>,
  actividad: ActividadObraPreventiva,
  riesgo: RiesgoInherenteActividadObra,
) => {
  if (riesgoNegadoEnTexto(texto, riesgo)) return 0;
  const semantico = puntajeSemantico(texto, riesgo);
  const tokensActividad = new Set(
    [actividad.nombreVisible, actividad.etapaObra, ...actividad.palabrasClaveActividad].flatMap(tokens),
  );
  const frasesEspecificas = [
    riesgo.titulo.split(" - ")[0],
    riesgo.objetoPrincipal,
    riesgo.condicionObservada,
    ...riesgo.palabrasClave,
  ]
    .map(normalizar)
    .filter((frase) => {
      const partes = tokens(frase).filter((token) => !TERMINOS_RIESGO_DEMASIADO_GENERALES.has(token));
      return partes.length >= 2;
    });
  const frasesExactas = unicos(frasesEspecificas).filter((frase) => texto.includes(frase)).length;
  const tokensEspecificos = unicos(
    [riesgo.titulo, riesgo.objetoPrincipal, riesgo.condicionObservada, ...riesgo.palabrasClave]
      .flatMap(tokens)
      .filter(
        (token) =>
          !tokensActividad.has(token) &&
          !TERMINOS_RIESGO_DEMASIADO_GENERALES.has(token),
      ),
  );
  const coincidenciasEspecificas = tokensEspecificos.filter((token) => textoTokens.has(token)).length;

  return semantico + frasesExactas * 18 + Math.min(coincidenciasEspecificas, 4) * 4;
};

const tieneSenalCriticaExplicita = (texto: string) =>
  /(sin (arnes|linea de vida|baranda|proteccion contra caidas|bloqueo (loto|electrico|de energia)|loto|entibacion|rigger|segregacion|guarda)|energizad|borde abierto|carga suspendida|espacio confinado|linea de fuego|caida de distinto nivel|trabajador dentro de (la )?(zanja|excavacion)|derrame de combustible.*suelo)/.test(
    texto,
  );

const describeCondicionSimple = (texto: string) =>
  /(correccion simple|riesgo de tropiezo simple|sin exposicion critica|sin tarea critica|dano menor|material menor|residuo comun|livian[oa]|pequen[oa]|area administrativa|fuera de lugar|sin obstruir|controlable con limpieza|ordenado pero)/.test(
    texto,
  );

const confianzaDesdePuntaje = (puntaje: number, diferenciaSegundo: number): ConfianzaRiesgoInteligente => {
  if (puntaje >= 70) return "alta";
  if (puntaje >= 34 && diferenciaSegundo >= 4) return "alta";
  if (puntaje >= 20) return "media";
  return "baja";
};

export const seleccionarRiesgoInteligenteV3 = (
  entrada: EntradaSelectorRiesgoInteligenteV3,
): SeleccionRiesgoInteligenteV3 => {
  const texto = normalizar([
    entrada.descripcion,
    entrada.riesgoEspecifico,
    entrada.actividad,
    entrada.condicion,
  ].filter(Boolean).join(" "));
  const textoTokens = new Set(tokens(texto));

  if (!texto || textoTokens.size === 0) {
    return {
      version: VERSION_SELECTOR_RIESGO_INTELIGENTE,
      confianza: "baja",
      puntaje: 0,
      razones: ["Información insuficiente para identificar un riesgo específico."],
    };
  }

  const candidatos = BIBLIOTECA_ACTIVIDADES_OBRA_V2.flatMap((actividad) => {
    const puntajeActividad = puntuarActividad(actividad, texto, textoTokens);
    return actividad.riesgosInherentes.map((riesgo) => ({
      actividad,
      riesgo,
      puntaje: puntuarRiesgo(
        actividad,
        riesgo,
        texto,
        textoTokens,
        puntajeActividad,
        entrada.familiaSugerida,
      ),
      puntajeActividad,
    }));
  }).sort((a, b) => b.puntaje - a.puntaje);

  const mejor = candidatos[0];
  const segundo = candidatos[1];
  if (!mejor) {
    return {
      version: VERSION_SELECTOR_RIESGO_INTELIGENTE,
      confianza: "baja",
      puntaje: 0,
      razones: ["No se encontró un riesgo aplicable."],
    };
  }

  const diferenciaSegundo = mejor.puntaje - (segundo?.puntaje || 0);
  const anclajeEspecifico = calcularAnclajeEspecifico(
    texto,
    textoTokens,
    mejor.actividad,
    mejor.riesgo,
  );
  const riesgoCritico =
    mejor.riesgo.tipoRiesgo === "trabajo_critico" ||
    mejor.riesgo.criticidadOrientativa === "critico";
  const anclajeSemantico = puntajeSemantico(texto, mejor.riesgo);
  const coincidenciaConfiable =
    mejor.puntaje >= 34 &&
    anclajeEspecifico >= 12 &&
    (!describeCondicionSimple(texto) || anclajeSemantico >= 40) &&
    (!riesgoCritico ||
      (!describeCondicionSimple(texto) &&
        (anclajeEspecifico >= 45 || tieneSenalCriticaExplicita(texto))));
  const confianza = coincidenciaConfiable
    ? confianzaDesdePuntaje(mejor.puntaje, diferenciaSegundo)
    : "baja";
  const razones = [
    `Actividad relacionada: ${mejor.actividad.nombreVisible}.`,
    `Riesgo relacionado: ${mejor.riesgo.titulo}.`,
  ];
  if (entrada.familiaSugerida && mejor.riesgo.familiasPreventivas.includes(entrada.familiaSugerida)) {
    razones.push("La familia preventiva coincide con el análisis inicial.");
  }
  if (confianza === "baja") razones.push("La coincidencia requiere una evaluación preventiva general.");

  return {
    version: VERSION_SELECTOR_RIESGO_INTELIGENTE,
    actividad: mejor.actividad,
    riesgo: confianza === "baja" ? undefined : mejor.riesgo,
    confianza,
    puntaje: mejor.puntaje,
    razones,
  };
};

export const textoPreventivoVisible = (texto: string) => {
  let resultado = texto.trim();
  for (const [patron, reemplazo] of REEMPLAZOS_VISIBLES) resultado = resultado.replace(patron, reemplazo);
  return resultado;
};

export const tituloRiesgoPreventivoVisible = (riesgo: RiesgoInherenteActividadObra) =>
  textoPreventivoVisible(riesgo.titulo.split(" - ")[0]);

const preguntaVisible = (texto: string) => {
  let resultado = textoPreventivoVisible(texto);
  if (!resultado.startsWith("¿")) resultado = `¿${resultado}`;
  if (!resultado.endsWith("?")) resultado = `${resultado}?`;
  return resultado.charAt(0).toUpperCase() + resultado.slice(1);
};

const opcionesVerificacion = [
  { label: "Sí, verificado en terreno", value: "si_verificado", score: 0 },
  { label: "Parcial o incompleto", value: "parcial_incompleto", score: 6 },
  { label: "No, condición deficiente o ausente", value: "no_deficiente_ausente", score: 10 },
  { label: "No verificable", value: "no_verificable", score: 5 },
  { label: "No aplica", value: "no_aplica", score: 0 },
];

const opcionesExposicion = [
  { label: "Sí, exposición confirmada", value: "exposicion_confirmada", score: 10 },
  { label: "Exposición posible; requiere verificación", value: "posible_exposicion", score: 6 },
  { label: "No existe exposición", value: "sin_exposicion", score: 0 },
  { label: "No verificable", value: "no_verificable", score: 5 },
  { label: "No aplica", value: "no_aplica", score: 0 },
];

const opcionesExistencia = [
  { label: "Sí, condición confirmada", value: "condicion_confirmada", score: 8 },
  { label: "Posible; requiere verificación", value: "condicion_posible", score: 5 },
  { label: "No se observa la condición", value: "condicion_no_observada", score: 0 },
  { label: "No verificable", value: "no_verificable", score: 5 },
  { label: "No aplica", value: "no_aplica", score: 0 },
];

const opcionesAccion = (riesgo: RiesgoInherenteActividadObra) => [
  {
    label: `Aplicada: ${preguntaVisible(riesgo.accionInmediataSugerida).replace(/^¿/, "").replace(/\?$/, "")}`,
    value: "accion_especifica_aplicada",
    score: 0,
  },
  { label: "Se aplicó un control temporal y se solicitó corrección", value: "control_temporal", score: 5 },
  { label: "La medida requerida aún no se aplica", value: "accion_pendiente", score: 12 },
  { label: "No verificable", value: "no_verificable", score: 6 },
  { label: "No aplica", value: "no_aplica", score: 0 },
];

const opcionesEvidencia = [
  { label: "Fotografía de la corrección y verificación en terreno", value: "foto_y_verificacion", score: 0 },
  { label: "Fotografía de la corrección", value: "fotografia_correccion", score: 1 },
  { label: "Registro documental o técnico aplicable", value: "registro_tecnico", score: 1 },
  { label: "La evidencia todavía está pendiente", value: "evidencia_pendiente", score: 5 },
  { label: "No verificable", value: "no_verificable", score: 5 },
];

const opcionesDocumentales = [
  { label: "Disponible, vigente y aplicable a la tarea", value: "documento_vigente", score: 0 },
  { label: "Disponible, pero incompleto o vencido", value: "documento_incompleto", score: 7 },
  { label: "No disponible", value: "documento_no_disponible", score: 10 },
  { label: "No verificable", value: "no_verificable", score: 5 },
  { label: "No aplica", value: "no_aplica", score: 0 },
];

const opcionesDecisionCritica = [
  { label: "Detener o aislar inmediatamente", value: "detener_aislar", score: 0 },
  { label: "Corregir antes de continuar", value: "corregir_antes_continuar", score: 2 },
  { label: "Mantener la actividad solo con control efectivo", value: "mantener_control_efectivo", score: 0 },
  { label: "La actividad continúa sin control suficiente", value: "continua_sin_control", score: 12 },
  { label: "No verificable", value: "no_verificable", score: 6 },
];

const preguntaEsControl = (texto: string) =>
  /(control|proteccion|inspeccion|instalad|operativ|vigente|amarrad|contenid|segregad|bloque|guard|autoriz|certific|rotul|ventila|entib|baranda|anclaje|diferencial|verificad|ruta (evita|.{0,30}queda libre)|extraccion|humectacion|barrera|identificad)/.test(
    normalizar(texto),
  );

const preguntaEsDocumental = (texto: string) =>
  /(\bast\b|\bart\b|\bpts\b|permiso|autorizacion|document|registro|respaldo|plano|trazado|\bfirma(?:s|do|da)?\b|responsable tecnico|certific|hds|sds|matriz)/.test(
    normalizar(texto),
  );

const preguntaEsExposicion = (texto: string) =>
  /(exposicion|expuesto|persona|trabajador|peaton|tercero|contacto directo|alcance de)/.test(
    normalizar(texto),
  );

const construirPregunta = (
  id: string,
  texto: string,
  objetivo: string,
  opciones: PreguntaFormularioAdaptativaV2["opciones"],
): PreguntaFormularioAdaptativaV2 => ({
  id,
  modulo: "otro_indeterminado",
  texto,
  objetivo,
  paso: 2,
  tipoRespuesta: "opciones",
  opciones,
});

export const construirPreguntasRiesgoInteligenteV3 = (
  seleccion: SeleccionRiesgoInteligenteV3,
): PreguntaFormularioAdaptativaV2[] => {
  const riesgo = seleccion.riesgo;
  if (!riesgo) return [];

  const baseId = riesgo.id.replace(/[^a-z0-9_]/gi, "_").toLowerCase();
  const preguntasEspecificas = riesgo.preguntasSugeridas.slice(0, 2);
  const primera = preguntasEspecificas[0] || `¿Se confirma el riesgo de ${riesgo.objetoPrincipal}?`;
  const segunda = preguntasEspecificas[1] || `¿Existe control suficiente frente a ${riesgo.condicionObservada}?`;
  const controles = riesgo.controlesEsperados.slice(0, 3).join(", ");
  const documentos = riesgo.documentosAplicables.slice(0, 3).join(", ");
  const esCritico =
    riesgo.tipoRiesgo === "trabajo_critico" ||
    riesgo.criticidadOrientativa === "critico";
  const esCaidaAltura =
    riesgo.familiasPreventivas.includes("trabajos_criticos") &&
    /(altura|borde_sin_baranda|linea_vida|andamio|cubierta)/.test(riesgo.id) &&
    !riesgo.id.includes("excavacion") &&
    normalizar(riesgo.consecuenciaProbable).includes("caida");
  const textoPrimera = esCaidaAltura
    ? "¿Se confirma exposición a caída de distinto nivel?"
    : preguntaVisible(primera);
  const textoSegunda = esCaidaAltura
    ? "¿La protección contra caídas está instalada, completa y correctamente utilizada?"
    : preguntaVisible(segunda);
  const opcionesPrimera = preguntaEsDocumental(textoPrimera)
    ? opcionesDocumentales
    : preguntaEsControl(textoPrimera)
      ? opcionesVerificacion
      : preguntaEsExposicion(textoPrimera)
        ? opcionesExposicion
        : opcionesExistencia;
  const opcionesSegunda = preguntaEsDocumental(textoSegunda)
    ? opcionesDocumentales
    : preguntaEsControl(textoSegunda)
      ? opcionesVerificacion
      : preguntaEsExposicion(textoSegunda)
        ? opcionesExposicion
        : opcionesExistencia;
  const requiereDocumentoHabilitante =
    esCritico &&
    documentos.length > 0 &&
    !riesgo.documentosNoAplicables.some((item) => normalizar(item).includes("no aplica documentacion formal"));

  return [
    construirPregunta(
      `inteligente_${baseId}_especifica_1`,
      textoPrimera,
      `Verificación específica para: ${tituloRiesgoPreventivoVisible(riesgo)}.`,
      opcionesPrimera,
    ),
    construirPregunta(
      `inteligente_${baseId}_especifica_2`,
      textoSegunda,
      `Responde según la condición real observada en ${textoPreventivoVisible(seleccion.actividad?.nombreVisible || "terreno")}.`,
      opcionesSegunda,
    ),
    construirPregunta(
      `inteligente_${baseId}_control`,
      requiereDocumentoHabilitante
        ? preguntaVisible(`Está disponible, vigente y aplicable el respaldo habilitante: ${documentos}`)
        : preguntaVisible(`Están implementados y verificados estos controles: ${controles}`),
      requiereDocumentoHabilitante
        ? "Verifica únicamente los documentos realmente exigibles para esta actividad crítica."
        : `Control esperado para evitar: ${textoPreventivoVisible(riesgo.consecuenciaProbable)}.`,
      requiereDocumentoHabilitante ? opcionesDocumentales : opcionesVerificacion,
    ),
    construirPregunta(
      `inteligente_${baseId}_accion`,
      "¿Qué medida inmediata se aplicó frente a este riesgo?",
      textoPreventivoVisible(riesgo.accionInmediataSugerida),
      esCritico ? opcionesDecisionCritica : opcionesAccion(riesgo),
    ),
    construirPregunta(
      `inteligente_${baseId}_cierre`,
      "¿Qué evidencia permitirá verificar que este riesgo quedó efectivamente controlado?",
      `El cierre debe demostrar el control de: ${textoPreventivoVisible(riesgo.controlFaltanteOFallido)}.`,
      opcionesEvidencia,
    ),
  ];
};
