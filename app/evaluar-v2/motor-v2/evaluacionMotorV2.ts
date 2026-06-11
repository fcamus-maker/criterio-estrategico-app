import {
  calcularCriticidadBaseV2,
  esHallazgoMenorV2,
  limitarCriticidad,
  normalizarTextoMotorV2,
  obtenerPesoCriticidad,
  obtenerReglaCriticidadV2,
  obtenerTextoBusquedaMotorV2,
  subirCriticidad,
} from "./matrizCriticidadV2";
import { obtenerNormativaProbableV2 } from "./matrizLegalV2";
import type {
  AmbitoEvaluacion,
  Criticidad,
  DatosAmbientales,
  DatosLegales,
  EvaluacionInputV2,
  EvaluacionResultadoV2,
  RespuestaEvaluacionV2,
  TipoEvento,
} from "./types";

type EvaluacionNormalizadaV2 = EvaluacionInputV2 & {
  textoBusqueda: string;
};

const PALABRAS_SALUD = ["ruido", "polvo", "quimic", "silice", "calor", "frio", "radiacion", "biologic"];
const PALABRAS_AMBIENTE = ["ambient", "derrame", "residuo", "suelo", "agua", "alcantarillado", "emision", "flora", "fauna"];
const PALABRAS_EMERGENCIA = ["emergencia", "extintor", "evacuacion", "incendio", "explosion"];
const PALABRAS_ACTO = ["acto inseguro", "trabajador realiza", "sin arnes", "sin epp"];
const PALABRAS_INCIDENTE = ["incidente", "accidente", "golpeado", "lesion", "derrame ocurrido"];
const PALABRAS_CASI_ACCIDENTE = ["casi accidente", "near miss", "amago"];

function normalizarInput(input: EvaluacionInputV2): EvaluacionNormalizadaV2 {
  return {
    ...input,
    tipoHallazgo: input.tipoHallazgo ?? "",
    descripcion: input.descripcion ?? "",
    area: input.area ?? "",
    actividad: input.actividad ?? "",
    respuestas: input.respuestas ?? {},
    textoBusqueda: obtenerTextoBusquedaMotorV2(input),
  };
}

function respuestaEsAfirmativa(valor: RespuestaEvaluacionV2): boolean {
  if (typeof valor === "boolean") return valor;
  if (typeof valor === "number") return valor > 0;
  if (Array.isArray(valor)) {
    return valor.some((item) => respuestaEsAfirmativa(item));
  }
  if (typeof valor === "string") {
    const normalizada = normalizarTextoMotorV2(valor);
    return ["si", "true", "alto", "alta", "directa", "inexistentes", "no controlado"].some((texto) =>
      normalizada.includes(normalizarTextoMotorV2(texto))
    );
  }
  return false;
}

function respuestaIncluye(input: EvaluacionNormalizadaV2, palabras: string[]): boolean {
  const respuestas = Object.entries(input.respuestas);
  return respuestas.some(([clave, valor]) => {
    const textoClave = normalizarTextoMotorV2(clave);
    const textoValor = normalizarTextoMotorV2(
      Array.isArray(valor) ? valor.join(" ") : typeof valor === "object" ? JSON.stringify(valor) : String(valor ?? "")
    );
    return palabras.some((palabra) => {
      const normalizada = normalizarTextoMotorV2(palabra);
      return textoClave.includes(normalizada) || textoValor.includes(normalizada);
    });
  });
}

function textoIncluye(texto: string, palabras: string[]): boolean {
  return palabras.some((palabra) => texto.includes(normalizarTextoMotorV2(palabra)));
}

function hayDatoAmbiental(datos?: DatosAmbientales): boolean {
  if (!datos) return false;
  return Object.values(datos).some((valor) => Boolean(valor));
}

function hayDatoLegal(datos?: DatosLegales): boolean {
  if (!datos) return false;
  return Object.values(datos).some((valor) => Boolean(valor));
}

function agregarAmbito(ambitos: AmbitoEvaluacion[], ambito: AmbitoEvaluacion): void {
  if (!ambitos.includes(ambito)) ambitos.push(ambito);
}

function clasificarAmbitos(input: EvaluacionNormalizadaV2): {
  ambitoPrincipal: AmbitoEvaluacion;
  ambitosSecundarios: AmbitoEvaluacion[];
} {
  const ambitos: AmbitoEvaluacion[] = [];

  if (input.ambitoDeclarado) agregarAmbito(ambitos, input.ambitoDeclarado);
  if (hayDatoAmbiental(input.datosAmbientales) || textoIncluye(input.textoBusqueda, PALABRAS_AMBIENTE)) {
    agregarAmbito(ambitos, "medio_ambiente");
  }
  if (hayDatoLegal(input.datosLegales) || respuestaIncluye(input, ["documento", "permiso", "procedimiento", "ast", "pts", "ptp"])) {
    agregarAmbito(ambitos, "legal_documental");
  }
  if (textoIncluye(input.textoBusqueda, PALABRAS_SALUD)) {
    agregarAmbito(ambitos, "salud_ocupacional");
  }
  if (textoIncluye(input.textoBusqueda, PALABRAS_EMERGENCIA)) {
    agregarAmbito(ambitos, "emergencia");
  }

  if (ambitos.length === 0) {
    agregarAmbito(ambitos, "seguridad_laboral");
  }

  const principal = ambitos[0] ?? "seguridad_laboral";
  return {
    ambitoPrincipal: principal,
    ambitosSecundarios: ambitos.filter((ambito) => ambito !== principal),
  };
}

function clasificarTipoEvento(input: EvaluacionNormalizadaV2, ambitoPrincipal: AmbitoEvaluacion): TipoEvento {
  if (ambitoPrincipal === "emergencia" || textoIncluye(input.textoBusqueda, PALABRAS_EMERGENCIA)) {
    return "emergencia";
  }

  if (input.datosAmbientales?.existeImpactoAmbiental) return "impacto_ambiental";
  if (input.datosAmbientales?.existeAspectoAmbiental || ambitoPrincipal === "medio_ambiente") {
    return input.datosAmbientales?.existeImpactoAmbiental ? "impacto_ambiental" : "aspecto_ambiental";
  }

  if (hayDatoLegal(input.datosLegales) || ambitoPrincipal === "legal_documental") {
    return "desviacion_legal_documental";
  }

  if (textoIncluye(input.textoBusqueda, PALABRAS_CASI_ACCIDENTE)) return "casi_accidente";
  if (textoIncluye(input.textoBusqueda, PALABRAS_INCIDENTE)) return "incidente";
  if (textoIncluye(input.textoBusqueda, PALABRAS_ACTO)) return "acto_inseguro";

  return "condicion_subestandar";
}

function tieneExposicionDirecta(input: EvaluacionNormalizadaV2): boolean {
  return input.exposicionPersonas === "directa" || respuestaIncluye(input, ["exposicion directa", "personas expuestas"]);
}

function detectarSenalesCriticas(input: EvaluacionNormalizadaV2): string[] {
  const senales: string[] = [];
  const datosAmbientales = input.datosAmbientales;
  const datosLegales = input.datosLegales;
  const regla = obtenerReglaCriticidadV2(input);
  const exposicionDirecta = tieneExposicionDirecta(input);

  if (regla?.senalCritica) {
    if (regla.id === "lesion_grave_inmediata" && !exposicionDirecta) {
      // La consecuencia grave/fatal requiere exposicion directa para ser senal critica real.
    } else if (regla.id === "maquinaria_sin_resguardo" && !exposicionDirecta) {
      // La maquinaria sin resguardo puede ser ALTO sin exposicion directa.
    } else {
      senales.push(regla.senalCritica);
    }
  }

  if (
    input.consecuencia &&
    ["grave", "fatal"].includes(input.consecuencia) &&
    exposicionDirecta &&
    input.probabilidad === "alta"
  ) {
    senales.push("Riesgo inmediato de lesion grave o fatal con exposicion directa.");
  }

  if (input.requiereSuspensionDeclarada && exposicionDirecta && ["grave", "fatal"].includes(input.consecuencia ?? "leve")) {
    senales.push("Actividad requiere suspension inmediata por riesgo grave activo.");
  }

  if (
    datosAmbientales?.derrameOFuga &&
    datosAmbientales.contenido === false &&
    (datosAmbientales.afectaSuelo || datosAmbientales.afectaAgua || textoIncluye(input.textoBusqueda, ["alcantarillado", "drenaje"]))
  ) {
    senales.push("Derrame no contenido hacia suelo, agua, drenaje o alcantarillado.");
  }

  if (
    datosAmbientales?.sustanciaPeligrosa &&
    datosAmbientales.derrameOFuga &&
    datosAmbientales.contenido === false
  ) {
    senales.push("Sustancia peligrosa liberada o fuga sin control.");
  }

  if (
    datosAmbientales?.residuoPeligroso &&
    (input.exposicionAmbiental === "directa" || datosAmbientales.contenido === false)
  ) {
    senales.push("Residuo peligroso con exposicion o liberacion significativa.");
  }

  if (datosAmbientales?.afectaComunidad && (datosAmbientales.existeImpactoAmbiental || datosAmbientales.riesgoImpactoAmbiental === "alto")) {
    senales.push("Afectacion ambiental real o probable a comunidad.");
  }

  if (datosLegales?.faltaHabilitaActividadRiesgosa && exposicionDirecta) {
    senales.push("Falta documental habilita actividad riesgosa en ejecucion.");
  }

  return Array.from(new Set(senales));
}

function calcularFactoresElevadores(input: EvaluacionNormalizadaV2, senalesCriticas: string[]): string[] {
  const factores: string[] = [];

  if (tieneExposicionDirecta(input)) factores.push("Exposicion directa de personas.");
  if (input.exposicionPersonas === "potencial") factores.push("Exposicion potencial de personas.");
  if (input.exposicionAmbiental === "directa") factores.push("Exposicion ambiental directa.");
  if (["grave", "fatal"].includes(input.consecuencia ?? "leve")) factores.push("Consecuencia razonablemente grave o fatal.");
  if (input.probabilidad === "alta") factores.push("Probabilidad inmediata alta.");
  if (input.controlesExistentes === "inexistentes") factores.push("Controles inexistentes.");
  if (input.controlesExistentes === "parciales") factores.push("Controles parciales.");
  if (input.datosAmbientales?.riesgoImpactoAmbiental === "alto") factores.push("Riesgo de impacto ambiental alto.");
  if (input.datosAmbientales?.residuoPeligroso || input.datosAmbientales?.sustanciaPeligrosa) {
    factores.push("Residuo o sustancia peligrosa involucrada.");
  }
  if (input.datosAmbientales?.requiereNotificacion) factores.push("Posible obligacion de notificacion ambiental.");
  if (input.datosLegales?.documentoFaltante || input.datosLegales?.permisoFaltante) {
    factores.push("Desviacion legal/documental declarada.");
  }
  if (senalesCriticas.length > 0) factores.push("Existe senal critica real.");

  return factores;
}

function calcularFactoresLimitantes(input: EvaluacionNormalizadaV2): string[] {
  const factores: string[] = [];

  if (input.exposicionPersonas === "sin_exposicion") factores.push("Sin exposicion directa de personas.");
  if (input.exposicionAmbiental === "sin_exposicion") factores.push("Sin exposicion ambiental directa.");
  if (input.controlesExistentes === "suficientes") factores.push("Controles suficientes declarados.");
  if (input.datosAmbientales?.derrameOFuga && input.datosAmbientales.contenido) {
    factores.push("Derrame o fuga contenido.");
  }
  if (input.datosLegales?.documentoFaltante && !input.datosLegales.faltaHabilitaActividadRiesgosa) {
    factores.push("Documento faltante sin actividad riesgosa inmediata.");
  }
  if (esHallazgoMenorV2(input)) factores.push("Hallazgo menor o de bajo potencial.");

  return factores;
}

function aplicarElevadores(criticidadBase: Criticidad, factoresElevadores: string[], senalesCriticas: string[]): Criticidad {
  if (senalesCriticas.length > 0) return "CRITICO";

  const elevadoresFuertes = factoresElevadores.filter((factor) =>
    [
      "Exposicion directa de personas.",
      "Consecuencia razonablemente grave o fatal.",
      "Probabilidad inmediata alta.",
      "Controles inexistentes.",
      "Riesgo de impacto ambiental alto.",
      "Residuo o sustancia peligrosa involucrada.",
    ].includes(factor)
  ).length;

  if (elevadoresFuertes >= 3) return subirCriticidad(criticidadBase, 2);
  if (elevadoresFuertes >= 1 || factoresElevadores.length >= 3) return subirCriticidad(criticidadBase, 1);
  return criticidadBase;
}

function aplicarTopes(
  input: EvaluacionNormalizadaV2,
  criticidad: Criticidad,
  topeMatriz: Criticidad,
  senalesCriticas: string[],
  factoresLimitantes: string[]
): Criticidad {
  let final = criticidad;
  const haySenalCritica = senalesCriticas.length > 0;

  if (!haySenalCritica && final === "CRITICO") {
    final = "ALTO";
    factoresLimitantes.push("CRITICO bloqueado por ausencia de senal critica real.");
  }

  if (!haySenalCritica) {
    final = limitarCriticidad(final, topeMatriz);
  }

  if (esHallazgoMenorV2(input) && !tieneExposicionDirecta(input) && !haySenalCritica) {
    final = limitarCriticidad(final, "MEDIO");
  }

  if (
    input.datosLegales?.documentoFaltante &&
    !input.datosLegales.faltaHabilitaActividadRiesgosa &&
    !haySenalCritica
  ) {
    final = limitarCriticidad(final, "MEDIO");
  }

  if (input.datosAmbientales?.derrameOFuga && input.datosAmbientales.contenido && !haySenalCritica) {
    final = limitarCriticidad(final, "MEDIO");
  }

  return final;
}

function detectarIncoherencias(
  input: EvaluacionNormalizadaV2,
  criticidadFinal: Criticidad,
  senalesCriticas: string[]
): string[] {
  const inconsistencias: string[] = [];

  if (esHallazgoMenorV2(input) && ["grave", "fatal"].includes(input.consecuencia ?? "leve") && senalesCriticas.length === 0) {
    inconsistencias.push("Hallazgo menor declarado con consecuencia grave/fatal sin senal critica confirmada.");
  }

  if (input.exposicionPersonas === "sin_exposicion" && input.consecuencia === "fatal" && senalesCriticas.length === 0) {
    inconsistencias.push("Consecuencia fatal declarada sin exposicion de personas.");
  }

  if (
    input.datosAmbientales?.derrameOFuga &&
    input.datosAmbientales.contenido &&
    (input.datosAmbientales.afectaSuelo || input.datosAmbientales.afectaAgua)
  ) {
    inconsistencias.push("Derrame marcado como contenido, pero tambien con posible afectacion a suelo o agua.");
  }

  if (criticidadFinal === "CRITICO" && senalesCriticas.length === 0) {
    inconsistencias.push("Criticidad CRITICO sin senal critica real.");
  }

  return inconsistencias;
}

function definirMedidaInmediata(
  criticidadFinal: Criticidad,
  senalesCriticas: string[],
  requiereContencionAmbiental: boolean
): string {
  if (requiereContencionAmbiental) {
    return "Contener el evento ambiental, aislar el area y escalar a responsable definido.";
  }
  if (criticidadFinal === "CRITICO") {
    return "Detener o aislar la condicion critica y asignar responsable de control inmediato.";
  }
  if (criticidadFinal === "ALTO") {
    return "Controlar la condicion antes de continuar y verificar cierre con responsable.";
  }
  if (criticidadFinal === "MEDIO") {
    return "Corregir la desviacion y registrar seguimiento preventivo.";
  }
  if (senalesCriticas.length > 0) {
    return "Revisar senal critica declarada y validar control operacional.";
  }
  return "Registrar y corregir en rutina operativa.";
}

function definirPlazo(criticidadFinal: Criticidad): string {
  if (criticidadFinal === "CRITICO") return "Inmediato";
  if (criticidadFinal === "ALTO") return "24 horas";
  if (criticidadFinal === "MEDIO") return "7 dias";
  return "Programado";
}

function generarJustificacion(
  criticidadBase: Criticidad,
  criticidadFinal: Criticidad,
  senalesCriticas: string[],
  factoresElevadores: string[],
  factoresLimitantes: string[],
  inconsistencias: string[]
): string {
  const partes = [`Base ${criticidadBase}; final ${criticidadFinal}.`];
  if (senalesCriticas.length > 0) partes.push(`Senales criticas: ${senalesCriticas.join(" ")}`);
  if (factoresElevadores.length > 0) partes.push(`Eleva por: ${factoresElevadores.join(" ")}`);
  if (factoresLimitantes.length > 0) partes.push(`Se limita por: ${factoresLimitantes.join(" ")}`);
  if (inconsistencias.length > 0) partes.push(`Requiere revision por: ${inconsistencias.join(" ")}`);
  return partes.join(" ");
}

function generarResumenEjecutivo(
  criticidadFinal: Criticidad,
  ambitoPrincipal: AmbitoEvaluacion,
  tipoEvento: TipoEvento,
  requiereRevisionManual: boolean
): string {
  const revision = requiereRevisionManual ? " Requiere revision manual antes de usar como cierre tecnico definitivo." : "";
  return `Hallazgo ${tipoEvento} en ambito ${ambitoPrincipal}, evaluado como ${criticidadFinal}.${revision}`;
}

export function evaluarHallazgoV2(input: EvaluacionInputV2): EvaluacionResultadoV2 {
  const normalizado = normalizarInput(input);
  const { ambitoPrincipal, ambitosSecundarios } = clasificarAmbitos(normalizado);
  const tipoEvento = clasificarTipoEvento(normalizado, ambitoPrincipal);
  const { criticidadBase, topeMaximo } = calcularCriticidadBaseV2(normalizado);
  const senalesCriticas = detectarSenalesCriticas(normalizado);
  const factoresElevadores = calcularFactoresElevadores(normalizado, senalesCriticas);
  const factoresLimitantes = calcularFactoresLimitantes(normalizado);
  const criticidadElevada = aplicarElevadores(criticidadBase, factoresElevadores, senalesCriticas);
  const criticidadFinal = aplicarTopes(normalizado, criticidadElevada, topeMaximo, senalesCriticas, factoresLimitantes);
  const inconsistencias = detectarIncoherencias(normalizado, criticidadFinal, senalesCriticas);
  const requiereRevisionManual = inconsistencias.length > 0 || senalesCriticas.some((senal) => senal.includes("legal"));
  const requiereContencionAmbiental =
    Boolean(normalizado.datosAmbientales?.requiereContencion) ||
    senalesCriticas.some((senal) => senal.toLowerCase().includes("derrame") || senal.toLowerCase().includes("ambiental"));
  const requiereSuspension =
    Boolean(normalizado.requiereSuspensionDeclarada && obtenerPesoCriticidad(criticidadFinal) >= obtenerPesoCriticidad("ALTO")) ||
    senalesCriticas.some((senal) =>
      ["altura", "energia", "lesion", "maquinaria", "carga suspendida", "evacuacion"].some((palabra) =>
        normalizarTextoMotorV2(senal).includes(palabra)
      )
    );

  const ambitosParaNormativa = [ambitoPrincipal, ...ambitosSecundarios];
  const normativaProbable = obtenerNormativaProbableV2(ambitosParaNormativa, normalizado);
  const medidaInmediata = definirMedidaInmediata(criticidadFinal, senalesCriticas, requiereContencionAmbiental);
  const plazoSugerido = definirPlazo(criticidadFinal);
  const justificacionTecnica = generarJustificacion(
    criticidadBase,
    criticidadFinal,
    senalesCriticas,
    factoresElevadores,
    factoresLimitantes,
    inconsistencias
  );
  const resumenEjecutivo = generarResumenEjecutivo(
    criticidadFinal,
    ambitoPrincipal,
    tipoEvento,
    requiereRevisionManual
  );

  return {
    ambitoPrincipal,
    ambitosSecundarios,
    tipoEvento,
    criticidadBase,
    criticidadFinal,
    senalesCriticas,
    factoresElevadores,
    factoresLimitantes,
    inconsistencias,
    requiereRevisionManual,
    medidaInmediata,
    plazoSugerido,
    requiereSuspension,
    requiereContencionAmbiental,
    normativaProbable,
    justificacionTecnica,
    resumenEjecutivo,
  };
}
