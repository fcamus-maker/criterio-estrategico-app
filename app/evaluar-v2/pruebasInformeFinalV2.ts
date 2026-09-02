import {
  formatearCoordenadaInformeV2,
  formatearPrecisionInformeV2,
  resolverDecisionSuspensionInformeV2,
  resolverNivelValidacionInformeV2,
} from "./modeloInformeFinalV2";

const errores: string[] = [];

const critico = resolverDecisionSuspensionInformeV2({
  criticidad: "CRÍTICO",
  requiereSuspension: false,
  respuestas: {},
});
if (!critico.requerida) errores.push("Un hallazgo CRÍTICO no puede informar suspensión no requerida.");

const detenido = resolverDecisionSuspensionInformeV2({
  criticidad: "CRÍTICO",
  respuestas: { accion: "detener_aislar" },
});
if (!detenido.aplicada || detenido.etiqueta !== "Actividad detenida o aislada") {
  errores.push("La detención aplicada no queda diferenciada de una acción pendiente.");
}

const validacion = resolverNivelValidacionInformeV2({
  confianza: "alta",
  requiereRevisionManual: true,
});
if (!validacion.requiereRevision || validacion.etiqueta === "Análisis consistente") {
  errores.push("La revisión manual no puede convivir con suficiencia alta visible.");
}

if (formatearCoordenadaInformeV2(-29.958234027320305) !== "-29.958234") {
  errores.push("La coordenada no se limita a seis decimales.");
}

if (formatearPrecisionInformeV2(13.864812334517062) !== "13.9 m") {
  errores.push("La precisión GPS no se presenta en formato legible.");
}

if (errores.length > 0) {
  console.error(JSON.stringify({ ok: false, errores }, null, 2));
  process.exitCode = 1;
} else {
  console.log(
    JSON.stringify(
      {
        ok: true,
        controles: [
          "CRÍTICO exige suspensión",
          "detención aplicada se informa correctamente",
          "revisión manual invalida suficiencia alta",
          "GPS legible",
        ],
      },
      null,
      2,
    ),
  );
}
