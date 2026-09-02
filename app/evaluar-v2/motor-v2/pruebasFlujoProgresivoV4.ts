import {
  avanzarFlujoProgresivoV4,
  construirPreguntaProgresivaV4,
  crearFlujoPreguntasProgresivasV4,
  evaluarFlujoProgresivoV4,
  flujoProgresivoCompletoV4,
  responderPreguntaProgresivaV4,
  validarCoherenciaFlujoProgresivoV4,
  type FlujoPreguntasProgresivasV4,
} from "./flujoPreguntasProgresivasV4";

type CasoFlujoProgresivoV4 = {
  id: string;
  respuestas: string[][];
  criticidad: string;
  contencion?: boolean;
  suspension?: boolean;
};

const CASOS: CasoFlujoProgresivoV4[] = [
  {
    id: "derrame-activo-sin-control",
    respuestas: [
      ["medio_ambiente"],
      ["derrame_hidrocarburo"],
      ["afecta_suelo_agua_drenaje", "afecta_personas_transito"],
      ["sin_control"],
      ["accion_pendiente"],
    ],
    criticidad: "CRITICO",
    contencion: true,
  },
  {
    id: "pasillo-control-temporal",
    respuestas: [
      ["seguridad_operacional"],
      ["circulacion_obstruida"],
      ["sin_personas_expuestas"],
      ["control_parcial"],
      ["control_temporal"],
    ],
    criticidad: "MEDIO",
  },
  {
    id: "infraestructura-danada-expuesta",
    respuestas: [
      ["equipos_instalaciones"],
      ["infraestructura_danada"],
      ["exposicion_directa_personas"],
      ["sin_control"],
      ["accion_pendiente"],
    ],
    criticidad: "ALTO",
  },
  {
    id: "excavacion-critica",
    respuestas: [
      ["seguridad_operacional"],
      ["excavacion_sin_control"],
      ["exposicion_directa_personas", "consecuencia_grave_posible"],
      ["sin_control"],
      ["accion_pendiente"],
    ],
    criticidad: "CRITICO",
    suspension: true,
  },
  {
    id: "herramienta-control-efectivo",
    respuestas: [
      ["equipos_instalaciones"],
      ["herramienta_defectuosa"],
      ["exposicion_directa_personas"],
      ["control_efectivo"],
      ["accion_cierre_pendiente"],
    ],
    criticidad: "MEDIO",
  },
];

const ejecutarRespuestas = (respuestas: string[][]) => {
  let flujo: FlujoPreguntasProgresivasV4 = crearFlujoPreguntasProgresivasV4();
  respuestas.forEach((selecciones) => {
    const pregunta = construirPreguntaProgresivaV4({}, flujo);
    selecciones.forEach((seleccion) => {
      flujo = responderPreguntaProgresivaV4(flujo, pregunta, seleccion);
    });
    flujo = avanzarFlujoProgresivoV4(flujo);
  });
  return flujo;
};

export function ejecutarPruebasFlujoProgresivoV4() {
  const errores: string[] = [];

  CASOS.forEach((caso) => {
    const flujo = ejecutarRespuestas(caso.respuestas);
    const resultado = evaluarFlujoProgresivoV4(flujo);
    if (!flujoProgresivoCompletoV4(flujo)) {
      errores.push(`${caso.id}: el flujo no quedó completo.`);
      return;
    }
    if (!resultado) {
      errores.push(`${caso.id}: no se generó resultado.`);
      return;
    }
    if (resultado.criticidadFinal !== caso.criticidad) {
      errores.push(
        `${caso.id}: criticidad ${resultado.criticidadFinal}; se esperaba ${caso.criticidad}.`,
      );
    }
    if (caso.contencion !== undefined && resultado.requiereContencionAmbiental !== caso.contencion) {
      errores.push(`${caso.id}: contención ambiental incoherente.`);
    }
    if (caso.suspension !== undefined && resultado.requiereSuspension !== caso.suspension) {
      errores.push(`${caso.id}: decisión de suspensión incoherente.`);
    }
  });

  let flujoEfectivo = crearFlujoPreguntasProgresivasV4();
  [
    "equipos_instalaciones",
    "herramienta_defectuosa",
    "exposicion_directa_personas",
    "control_efectivo",
  ].forEach((seleccion) => {
    const pregunta = construirPreguntaProgresivaV4({}, flujoEfectivo);
    flujoEfectivo = responderPreguntaProgresivaV4(flujoEfectivo, pregunta, seleccion);
    flujoEfectivo = avanzarFlujoProgresivoV4(flujoEfectivo);
  });
  const preguntaFinalEfectiva = construirPreguntaProgresivaV4({}, flujoEfectivo);
  if (preguntaFinalEfectiva.opciones.some((opcion) => opcion.id === "control_temporal")) {
    errores.push("control-efectivo: ofreció una medida temporal incompatible.");
  }
  if (preguntaFinalEfectiva.opciones.some((opcion) => opcion.id === "accion_pendiente")) {
    errores.push("control-efectivo: ofreció una medida pendiente incompatible.");
  }

  const flujoCoherente = ejecutarRespuestas([
    ["equipos_instalaciones"],
    ["herramienta_defectuosa"],
    ["exposicion_directa_personas"],
    ["control_efectivo"],
    ["accion_cierre_pendiente"],
  ]);
  const flujoAdulterado: FlujoPreguntasProgresivasV4 = {
    ...flujoCoherente,
    respuestas: {
      ...flujoCoherente.respuestas,
      v4_accion: {
        opcionIds: ["control_temporal"],
        respondidaEn: new Date().toISOString(),
      },
    },
  };
  if (validarCoherenciaFlujoProgresivoV4(flujoAdulterado).ok) {
    errores.push("barrera-final: aceptó control efectivo junto con control temporal.");
  }
  if (flujoProgresivoCompletoV4(flujoAdulterado)) {
    errores.push("barrera-final: permitió emitir un informe contradictorio.");
  }

  return {
    ok: errores.length === 0,
    casosAuditados: CASOS.length,
    errores,
  };
}
