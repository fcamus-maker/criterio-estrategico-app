import {
  avanzarFlujoProgresivoV4,
  construirPreguntaProgresivaV4,
  crearFlujoPreguntasProgresivasV4,
  evaluarFlujoProgresivoV4,
  flujoProgresivoCompletoV4,
  responderPreguntaProgresivaV4,
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

  return {
    ok: errores.length === 0,
    casosAuditados: CASOS.length,
    errores,
  };
}
