import assert from "node:assert/strict";
import {
  accionPrincipalPorEtapa,
  construirEstadoEnvioEvidencia,
  construirEstadoAsignacion,
  construirEstadoRevision,
  puedeAsignarCierre,
  puedeEnviarEvidenciaCierre,
  puedeValidarCierre,
  resolverEtapaCierre,
} from "../app/domain/flujoCierreHallazgo.ts";

const escenarios = [
  [{}, "PENDIENTE_ASIGNACION"],
  [{ responsableNombre: "Constructora Norte" }, "ASIGNADO"],
  [
    {
      responsableNombre: "Constructora Norte",
      estadoSeguimiento: "Pendiente de evidencia",
    },
    "PENDIENTE_EVIDENCIA",
  ],
  [
    {
      estadoSeguimiento: "En revisión",
      cantidadEvidencias: 2,
    },
    "EN_REVISION",
  ],
  [
    {
      estadoCierre: "RECHAZADO",
      estadoSeguimiento: "Requiere nueva evidencia",
      cantidadEvidencias: 1,
    },
    "REQUIERE_CORRECCION",
  ],
  [
    {
      estado: "CERRADO",
      estadoCierre: "CERRADO",
      validadorEstado: "Aprobado",
    },
    "VERIFICADO",
  ],
];

for (const [entrada, esperado] of escenarios) {
  assert.equal(resolverEtapaCierre(entrada), esperado);
}

assert.equal(accionPrincipalPorEtapa("EN_REVISION"), "REVISAR_EVIDENCIA");
assert.deepEqual(construirEstadoEnvioEvidencia(), {
  estado: "EN_SEGUIMIENTO",
  estadoCierre: "EN_GESTION",
  estadoSeguimiento: "En revisión",
  validadorEstado: "Pendiente de revision",
});
assert.deepEqual(construirEstadoAsignacion({ responsableNombre: "Ana Pérez" }), {
  estado: "EN_SEGUIMIENTO",
  estadoCierre: "ASIGNADO",
  estadoSeguimiento: "Asignado",
});
assert.deepEqual(construirEstadoRevision("aprobar"), {
  estado: "CERRADO",
  estadoCierre: "CERRADO",
  estadoSeguimiento: "Cerrado con evidencia",
  validadorEstado: "Aprobado",
});
assert.deepEqual(construirEstadoRevision("rechazar"), {
  estado: "EN_SEGUIMIENTO",
  estadoCierre: "RECHAZADO",
  estadoSeguimiento: "Requiere nueva evidencia",
  validadorEstado: "Rechazado",
});
assert.equal(puedeAsignarCierre("prevencionista_cliente"), true);
assert.equal(puedeValidarCierre("responsable_cierre"), false);
assert.equal(puedeEnviarEvidenciaCierre("responsable_cierre"), true);
assert.equal(puedeEnviarEvidenciaCierre("visualizador_auditor"), false);

console.log(`Flujo de cierre validado: ${escenarios.length} escenarios y permisos base.`);
