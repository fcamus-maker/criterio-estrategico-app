import { evaluarHallazgoV2 } from "./evaluacionMotorV2";
import type { CasoPruebaMotorV2, Criticidad, ResultadoCasoPruebaMotorV2 } from "./types";

export const casosPruebaMotorV2: CasoPruebaMotorV2[] = [
  {
    nombre: "Maleta abierta en area de trabajo",
    criticidadEsperada: ["BAJO", "MEDIO"],
    categoriaEsperada: "orden_aseo_objeto_fuera_lugar",
    ambitoEsperado: "seguridad_laboral",
    tipoEventoEsperado: "condicion_subestandar",
    observacionEsperada: "Nunca debe ser CRITICO ni legal/documental.",
    input: {
      tipoHallazgo: "Reporte movil V2",
      descripcion: "Maleta abierta en area de trabajo.",
      area: "Area de trabajo",
      actividad: "Transito normal",
      respuestas: {},
      exposicionPersonas: "sin_exposicion",
      consecuencia: "leve",
      probabilidad: "baja",
      controlesExistentes: "suficientes",
    },
  },
  {
    nombre: "Objeto bloqueando salida de emergencia",
    criticidadEsperada: ["ALTO", "CRITICO"],
    observacionEsperada: "CRITICO solo si el bloqueo es efectivo.",
    input: {
      tipoHallazgo: "Obstruccion critica",
      descripcion: "Objeto bloqueando salida de emergencia y ruta de evacuacion.",
      area: "Bodega",
      actividad: "Operacion normal",
      respuestas: {},
      ambitoDeclarado: "emergencia",
      exposicionPersonas: "potencial",
      consecuencia: "grave",
      probabilidad: "media",
      controlesExistentes: "inexistentes",
    },
  },
  {
    nombre: "Derrame menor contenido en bandeja",
    criticidadEsperada: "MEDIO",
    categoriaEsperada: "derrame_fuga",
    observacionEsperada: "Ambiental contenido, sin salida a medio receptor.",
    input: {
      tipoHallazgo: "Aspecto ambiental",
      descripcion: "Derrame menor contenido en bandeja.",
      area: "Almacenamiento",
      actividad: "Manipulacion de insumos",
      respuestas: {},
      ambitoDeclarado: "medio_ambiente",
      exposicionAmbiental: "potencial",
      consecuencia: "moderada",
      probabilidad: "media",
      controlesExistentes: "parciales",
      datosAmbientales: {
        existeAspectoAmbiental: true,
        derrameOFuga: true,
        contenido: true,
      },
    },
  },
  {
    nombre: "Derrame de sustancia peligrosa hacia suelo o alcantarillado",
    criticidadEsperada: "CRITICO",
    categoriaEsperada: "derrame_fuga",
    ambitoEsperado: "medio_ambiente",
    observacionEsperada: "Senal critica ambiental.",
    input: {
      tipoHallazgo: "Impacto ambiental",
      descripcion: "Derrame de sustancia peligrosa hacia suelo y alcantarillado.",
      area: "Patio de sustancias",
      actividad: "Trasvasije",
      respuestas: {},
      ambitoDeclarado: "medio_ambiente",
      exposicionAmbiental: "directa",
      consecuencia: "grave",
      probabilidad: "alta",
      controlesExistentes: "inexistentes",
      datosAmbientales: {
        existeImpactoAmbiental: true,
        riesgoImpactoAmbiental: "alto",
        afectaSuelo: true,
        afectaAgua: true,
        derrameOFuga: true,
        sustanciaPeligrosa: true,
        contenido: false,
        requiereContencion: true,
        requiereNotificacion: true,
      },
    },
  },
  {
    nombre: "Residuo peligroso mal segregado sin exposicion",
    criticidadEsperada: "ALTO",
    observacionEsperada: "Ambiental/legal relevante, no CRITICO sin exposicion o liberacion.",
    input: {
      tipoHallazgo: "Desviacion ambiental",
      descripcion: "Residuo peligroso mal segregado sin derrame ni exposicion.",
      area: "Patio de residuos",
      actividad: "Segregacion",
      respuestas: {},
      ambitoDeclarado: "medio_ambiente",
      exposicionAmbiental: "potencial",
      consecuencia: "moderada",
      probabilidad: "media",
      controlesExistentes: "parciales",
      datosAmbientales: {
        existeAspectoAmbiental: true,
        residuoPeligroso: true,
        contenido: true,
      },
    },
  },
  {
    nombre: "Cable energizado expuesto",
    criticidadEsperada: "CRITICO",
    categoriaEsperada: "electrico",
    ambitoEsperado: "seguridad_laboral",
    observacionEsperada: "Senal critica de seguridad.",
    input: {
      tipoHallazgo: "Energia peligrosa",
      descripcion: "Cable energizado expuesto al alcance de trabajadores.",
      area: "Sala electrica",
      actividad: "Mantencion",
      respuestas: {},
      ambitoDeclarado: "seguridad_laboral",
      exposicionPersonas: "directa",
      consecuencia: "fatal",
      probabilidad: "alta",
      controlesExistentes: "inexistentes",
    },
  },
  {
    nombre: "Piso mojado en transito activo",
    criticidadEsperada: ["MEDIO", "ALTO"],
    observacionEsperada: "Riesgo de caida; no debe ser CRITICO por defecto.",
    input: {
      tipoHallazgo: "Superficie peligrosa",
      descripcion: "Piso mojado en transito activo sin senalizacion.",
      area: "Pasillo",
      actividad: "Transito peatonal",
      respuestas: {},
      exposicionPersonas: "potencial",
      consecuencia: "moderada",
      probabilidad: "media",
      controlesExistentes: "inexistentes",
    },
  },
  {
    nombre: "Trabajo en altura sin arnes",
    criticidadEsperada: "CRITICO",
    observacionEsperada: "Senal critica de seguridad.",
    input: {
      tipoHallazgo: "Trabajo en altura",
      descripcion: "Trabajo en altura sin arnes ni proteccion contra caidas.",
      area: "Estructura",
      actividad: "Montaje",
      respuestas: {},
      ambitoDeclarado: "seguridad_laboral",
      exposicionPersonas: "directa",
      consecuencia: "fatal",
      probabilidad: "alta",
      controlesExistentes: "inexistentes",
      requiereSuspensionDeclarada: true,
    },
  },
  {
    nombre: "Documento faltante sin actividad riesgosa inmediata",
    criticidadEsperada: ["BAJO", "MEDIO"],
    categoriaEsperada: "documentos_legales_preventivos",
    ambitoEsperado: "legal_documental",
    tipoEventoEsperado: "desviacion_legal_documental",
    observacionEsperada: "Legal/documental con tope MEDIO.",
    input: {
      tipoHallazgo: "Documento faltante",
      descripcion: "Registro documental faltante sin actividad riesgosa inmediata.",
      area: "Administracion",
      actividad: "Revision documental",
      respuestas: {},
      ambitoDeclarado: "legal_documental",
      exposicionPersonas: "sin_exposicion",
      consecuencia: "leve",
      probabilidad: "baja",
      controlesExistentes: "parciales",
      datosLegales: {
        documentoFaltante: true,
        faltaHabilitaActividadRiesgosa: false,
      },
    },
  },
  {
    nombre: "Sin AST para trabajo en altura",
    criticidadEsperada: ["ALTO", "CRITICO"],
    categoriaEsperada: "procedimientos_ast_permisos",
    ambitoEsperado: "legal_documental",
    tipoEventoEsperado: "desviacion_legal_documental",
    observacionEsperada: "Mixto documental y trabajo critico; requiere preguntas de exposicion y suspension.",
    input: {
      tipoHallazgo: "Falta documental en trabajo critico",
      descripcion: "Sin AST para trabajo en altura con personas expuestas en plataforma.",
      area: "Estructura",
      actividad: "Trabajo en altura",
      respuestas: {},
      exposicionPersonas: "directa",
      consecuencia: "fatal",
      probabilidad: "alta",
      controlesExistentes: "inexistentes",
      datosLegales: {
        astPtpPtsFaltante: true,
        faltaHabilitaActividadRiesgosa: true,
      },
    },
  },
  {
    nombre: "Documento faltante para trabajo critico en ejecucion",
    criticidadEsperada: ["ALTO", "CRITICO"],
    observacionEsperada: "Depende de exposicion real y actividad activa.",
    input: {
      tipoHallazgo: "Procedimiento faltante",
      descripcion: "AST PTS faltante para trabajo critico en ejecucion con personas expuestas.",
      area: "Frente de trabajo",
      actividad: "Trabajo critico",
      respuestas: {},
      ambitoDeclarado: "legal_documental",
      exposicionPersonas: "directa",
      consecuencia: "grave",
      probabilidad: "alta",
      controlesExistentes: "inexistentes",
      datosLegales: {
        astPtpPtsFaltante: true,
        procedimientoFaltante: true,
        faltaHabilitaActividadRiesgosa: true,
      },
    },
  },
  {
    nombre: "Emision de polvo visible sin control con trabajadores expuestos",
    criticidadEsperada: ["MEDIO", "ALTO"],
    observacionEsperada: "Salud/ambiente; CRITICO solo con condicion severa inmediata.",
    input: {
      tipoHallazgo: "Exposicion higienica",
      descripcion: "Emision de polvo visible sin control con trabajadores expuestos.",
      area: "Chancado",
      actividad: "Operacion",
      respuestas: {},
      ambitoDeclarado: "salud_ocupacional",
      exposicionPersonas: "directa",
      exposicionAmbiental: "potencial",
      consecuencia: "moderada",
      probabilidad: "media",
      controlesExistentes: "inexistentes",
      datosAmbientales: {
        existeAspectoAmbiental: true,
        afectaAire: true,
      },
    },
  },
  {
    nombre: "Ruido elevado sin proteccion ni evaluacion",
    criticidadEsperada: ["MEDIO", "ALTO"],
    observacionEsperada: "Salud ocupacional; requiere medicion para conclusion legal especifica.",
    input: {
      tipoHallazgo: "Exposicion higienica",
      descripcion: "Ruido elevado sin proteccion auditiva ni evaluacion.",
      area: "Planta",
      actividad: "Operacion equipo",
      respuestas: {},
      ambitoDeclarado: "salud_ocupacional",
      exposicionPersonas: "directa",
      consecuencia: "moderada",
      probabilidad: "media",
      controlesExistentes: "inexistentes",
    },
  },
  {
    nombre: "Extintor parcialmente obstruido",
    criticidadEsperada: ["MEDIO", "ALTO"],
    observacionEsperada: "Depende de criticidad del area y acceso real.",
    input: {
      tipoHallazgo: "Equipo emergencia obstruido",
      descripcion: "Extintor parcialmente obstruido por materiales.",
      area: "Bodega",
      actividad: "Almacenamiento",
      respuestas: {},
      ambitoDeclarado: "emergencia",
      exposicionPersonas: "potencial",
      consecuencia: "grave",
      probabilidad: "media",
      controlesExistentes: "parciales",
    },
  },
  {
    nombre: "Sustancia quimica sin rotulacion sin derrame",
    criticidadEsperada: "ALTO",
    observacionEsperada: "CRITICO solo si hay exposicion, fuga o condicion grave.",
    input: {
      tipoHallazgo: "Sustancia quimica sin rotulacion",
      descripcion: "Sustancia quimica sin rotulacion, sin derrame ni fuga.",
      area: "Bodega quimicos",
      actividad: "Almacenamiento",
      respuestas: {},
      ambitoDeclarado: "salud_ocupacional",
      exposicionPersonas: "potencial",
      consecuencia: "moderada",
      probabilidad: "media",
      controlesExistentes: "parciales",
      datosAmbientales: {
        existeAspectoAmbiental: true,
        sustanciaPeligrosa: true,
        derrameOFuga: false,
        contenido: true,
      },
    },
  },
];

function criticidadAprobada(
  criticidadEsperada: CasoPruebaMotorV2["criticidadEsperada"],
  criticidadObtenida: Criticidad
): boolean {
  return Array.isArray(criticidadEsperada)
    ? criticidadEsperada.includes(criticidadObtenida)
    : criticidadEsperada === criticidadObtenida;
}

export function ejecutarCasosPruebaMotorV2(): ResultadoCasoPruebaMotorV2[] {
  return casosPruebaMotorV2.map((caso) => {
    const resultado = evaluarHallazgoV2(caso.input);
    const categoriaAprobada =
      !caso.categoriaEsperada || caso.categoriaEsperada === resultado.categoriaDetectada;
    const ambitoAprobado =
      !caso.ambitoEsperado || caso.ambitoEsperado === resultado.ambitoPrincipal;
    const tipoEventoAprobado =
      !caso.tipoEventoEsperado || caso.tipoEventoEsperado === resultado.tipoEvento;
    const aprobado =
      criticidadAprobada(caso.criticidadEsperada, resultado.criticidadFinal) &&
      categoriaAprobada &&
      ambitoAprobado &&
      tipoEventoAprobado;

    return {
      nombre: caso.nombre,
      criticidadEsperada: caso.criticidadEsperada,
      criticidadObtenida: resultado.criticidadFinal,
      categoriaDetectada: resultado.categoriaDetectada,
      ambitoPrincipal: resultado.ambitoPrincipal,
      tipoEvento: resultado.tipoEvento,
      aprobado,
      observacion: aprobado
        ? caso.observacionEsperada
        : `${caso.observacionEsperada} Obtenido: ${resultado.criticidadFinal}; categoria ${resultado.categoriaDetectada}; ambito ${resultado.ambitoPrincipal}; tipo ${resultado.tipoEvento}. ${resultado.justificacionTecnica}`,
    };
  });
}
