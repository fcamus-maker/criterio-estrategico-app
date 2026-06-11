import { DICCIONARIO_HALLAZGOS_V2 } from "./diccionarioHallazgosV2";
import { normalizarTextoMotorV2 } from "./matrizCriticidadV2";
import type {
  AmbitoEvaluacion,
  CategoriaHallazgoV2,
  ClasificacionHallazgoV2,
  Criticidad,
  EvaluacionInputV2,
  ModuloPreguntasV2,
  TipoEvento,
} from "./types";

export type RouterHallazgoV2Input = Pick<
  EvaluacionInputV2,
  "descripcion" | "tipoHallazgo" | "area" | "actividad" | "respuestas"
>;

type PuntajeCategoria = {
  categoria: CategoriaHallazgoV2;
  ambitoSugerido: AmbitoEvaluacion;
  ambitosSecundariosSugeridos: AmbitoEvaluacion[];
  tipoEventoSugerido: TipoEvento;
  moduloPreguntasSugerido: ModuloPreguntasV2;
  criticidadBaseSugerida: Criticidad;
  topeCriticidadSugerido: Criticidad;
  puntaje: number;
  prioridad: number;
  palabras: string[];
  senalesElevanCriticidad: string[];
  senalesPermitenCritico: string[];
  normativaProbableSugerida: string[];
  requiereRevisionManual: boolean;
};

function textoRespuestas(respuestas: RouterHallazgoV2Input["respuestas"]) {
  if (!respuestas) return "";

  return Object.values(respuestas)
    .map((valor) => {
      if (Array.isArray(valor)) return valor.join(" ");
      if (valor && typeof valor === "object") return JSON.stringify(valor);
      return String(valor ?? "");
    })
    .join(" ");
}

function textoBusqueda(input: RouterHallazgoV2Input) {
  return normalizarTextoMotorV2(
    [
      input.descripcion,
      input.tipoHallazgo,
      input.area,
      input.actividad,
      textoRespuestas(input.respuestas),
    ]
      .filter(Boolean)
      .join(" ")
  );
}

function pesoPalabraClave(palabra: string) {
  return normalizarTextoMotorV2(palabra).includes(" ") ? 5 : 3;
}

function textoContienePalabraClave(texto: string, palabra: string) {
  const clave = normalizarTextoMotorV2(palabra);
  if (!texto.includes(clave)) return false;

  const negaciones = [
    `sin ${clave}`,
    `no ${clave}`,
    `ni ${clave}`,
    `sin evidencia de ${clave}`,
    `sin presencia de ${clave}`,
    `sin signos de ${clave}`,
  ];

  return !negaciones.some((negacion) => texto.includes(negacion));
}

function textoTieneExclusion(texto: string, exclusiones: string[] | undefined) {
  return (exclusiones || []).some((exclusion) => texto.includes(normalizarTextoMotorV2(exclusion)));
}

function calcularPuntajes(texto: string): PuntajeCategoria[] {
  return DICCIONARIO_HALLAZGOS_V2.map((entrada) => {
    const tieneExclusion = textoTieneExclusion(texto, entrada.exclusiones);
    const universoPalabras = [
      ...entrada.palabrasClave,
      ...(entrada.sinonimos || []),
      ...(entrada.frasesFrecuentes || []),
    ];
    const palabras = tieneExclusion
      ? []
      : universoPalabras.filter((palabra) => textoContienePalabraClave(texto, palabra));
    const puntaje =
      palabras.reduce((total, palabra) => total + pesoPalabraClave(palabra), 0) +
      (palabras.length > 0 ? entrada.prioridad || 0 : 0);

    return {
      categoria: entrada.categoria,
      ambitoSugerido: entrada.ambitoSugerido,
      ambitosSecundariosSugeridos: entrada.ambitosSecundariosSugeridos || [],
      tipoEventoSugerido: entrada.tipoEventoSugerido,
      moduloPreguntasSugerido: entrada.moduloPreguntasSugerido,
      criticidadBaseSugerida: entrada.criticidadBaseSugerida,
      topeCriticidadSugerido: entrada.topeCriticidad,
      prioridad: entrada.prioridad || 0,
      puntaje,
      palabras,
      senalesElevanCriticidad: entrada.senalesElevanCriticidad || [],
      senalesPermitenCritico: entrada.senalesPermitenCritico || [],
      normativaProbableSugerida: entrada.normativaProbable || [],
      requiereRevisionManual: Boolean(entrada.requiereRevisionManual),
    };
  })
    .filter((item) => item.categoria !== "otro_indeterminado")
    .sort((a, b) => b.puntaje - a.puntaje || b.prioridad - a.prioridad);
}

function confianzaDesdePuntaje(puntaje: number, totalPalabras: number): ClasificacionHallazgoV2["confianza"] {
  if (puntaje >= 11 || totalPalabras >= 3) return "alta";
  if (puntaje >= 3) return "media";
  return "baja";
}

function salidaIndeterminada(advertencias: string[] = []): ClasificacionHallazgoV2 {
  return {
    categoriaDetectada: "otro_indeterminado",
    ambitoSugerido: "seguridad_laboral",
    ambitosSecundariosSugeridos: [],
    tipoEventoSugerido: "otro",
    moduloPreguntasSugerido: "otro_indeterminado",
    confianza: "baja",
    palabrasClaveDetectadas: [],
    criticidadBaseSugerida: "MEDIO",
    topeCriticidadSugerido: "ALTO",
    senalesElevanCriticidad: [],
    senalesPermitenCritico: [],
    normativaProbableSugerida: [],
    requiereRevisionManual: true,
    requierePreguntasAmbientales: false,
    requierePreguntasLegales: false,
    requierePreguntasSeguridad: true,
    requierePreguntasSalud: false,
    advertencias,
    justificacionModuloPreguntas: "Modulo general por baja confianza o falta de senales especificas.",
  };
}

export function clasificarHallazgoPorDescripcion(
  input: RouterHallazgoV2Input
): ClasificacionHallazgoV2 {
  const texto = textoBusqueda(input);
  if (!texto) return salidaIndeterminada(["Sin texto suficiente para clasificacion semantica."]);

  const puntajes = calcularPuntajes(texto);
  const ganador = puntajes[0];

  if (!ganador || ganador.puntaje <= 0) {
    return salidaIndeterminada(["No se detectaron palabras clave suficientes."]);
  }

  const segundo = puntajes[1];
  const advertencias: string[] = [];

  if (segundo && segundo.puntaje > 0 && ganador.puntaje - segundo.puntaje <= 2) {
    advertencias.push(`Clasificacion cercana con ${segundo.categoria}.`);
  }

  const categoria = ganador.categoria;
  const ambitos = [ganador.ambitoSugerido, ...ganador.ambitosSecundariosSugeridos];
  const confianza = confianzaDesdePuntaje(ganador.puntaje, ganador.palabras.length);

  return {
    categoriaDetectada: categoria,
    ambitoSugerido: ganador.ambitoSugerido,
    ambitosSecundariosSugeridos: ganador.ambitosSecundariosSugeridos,
    tipoEventoSugerido: ganador.tipoEventoSugerido,
    moduloPreguntasSugerido: ganador.moduloPreguntasSugerido,
    confianza,
    palabrasClaveDetectadas: ganador.palabras,
    criticidadBaseSugerida: ganador.criticidadBaseSugerida,
    topeCriticidadSugerido: ganador.topeCriticidadSugerido,
    senalesElevanCriticidad: ganador.senalesElevanCriticidad,
    senalesPermitenCritico: ganador.senalesPermitenCritico,
    normativaProbableSugerida: ganador.normativaProbableSugerida,
    requiereRevisionManual: ganador.requiereRevisionManual || confianza === "baja",
    requierePreguntasAmbientales: ambitos.includes("medio_ambiente"),
    requierePreguntasLegales: ambitos.includes("legal_documental"),
    requierePreguntasSeguridad: ambitos.includes("seguridad_laboral") || ambitos.includes("emergencia"),
    requierePreguntasSalud: ambitos.includes("salud_ocupacional"),
    advertencias,
    justificacionModuloPreguntas: `Modulo ${ganador.moduloPreguntasSugerido} seleccionado por ${ganador.palabras.join(", ")} con confianza ${confianza}.`,
  };
}
