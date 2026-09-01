import assert from "node:assert/strict";
import {
  accionPrincipalPorEtapa,
  construirEstadoEnvioEvidencia,
  construirEstadoAsignacion,
  clasificarCategoriaCierreMovil,
  construirProyeccionGestionCierrePanel,
  construirEstadoRevision,
  esEstadoEnSeguimientoOperativo,
  etiquetaAccionGestionPorEstado,
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

assert.equal(esEstadoEnSeguimientoOperativo("Asignado"), true);
assert.equal(esEstadoEnSeguimientoOperativo("Pendiente de evidencia"), true);
assert.equal(esEstadoEnSeguimientoOperativo("En revisión"), false);
assert.equal(etiquetaAccionGestionPorEstado("Sin asignar"), "Asignar responsable");
assert.equal(etiquetaAccionGestionPorEstado("Asignado"), "Actualizar plan");
assert.equal(clasificarCategoriaCierreMovil({}), "por_cerrar");
assert.equal(
  clasificarCategoriaCierreMovil({
    estado: "ABIERTO",
    estadoCierre: "PENDIENTE",
    estadoSeguimiento: "PENDIENTE",
    responsableNombre: "Empresa involucrada informada al reportar",
  }),
  "por_cerrar",
  "El responsable informado en el reporte no equivale a una asignación formal de cierre."
);
assert.equal(
  clasificarCategoriaCierreMovil({
    estado: "EN_SEGUIMIENTO",
    estadoCierre: "ASIGNADO",
    estadoSeguimiento: "Asignado",
    responsableNombre: "Juan Miranda",
  }),
  "en_seguimiento"
);
assert.equal(
  clasificarCategoriaCierreMovil({
    estado: "ABIERTO",
    estadoCierre: "PENDIENTE",
    estadoSeguimiento: "PENDIENTE",
    responsableNombre: "Juan Miranda",
    gestionFormalRegistrada: true,
  }),
  "en_seguimiento",
  "Un plan guardado se mantiene en seguimiento aunque provenga de datos históricos."
);
assert.equal(
  clasificarCategoriaCierreMovil({
    estado: "EN_SEGUIMIENTO",
    estadoCierre: "RECHAZADO",
    estadoSeguimiento: "Requiere nueva evidencia",
    validadorEstado: "Rechazado",
    cantidadEvidencias: 1,
  }),
  "en_seguimiento"
);
assert.equal(
  clasificarCategoriaCierreMovil({
    estadoSeguimiento: "En revisión",
    cantidadEvidencias: 1,
  }),
  "en_revision"
);
assert.equal(
  clasificarCategoriaCierreMovil({
    estado: "CERRADO",
    estadoCierre: "CERRADO",
  }),
  "cerrados"
);

assert.deepEqual(
  construirProyeccionGestionCierrePanel({
    fechaCompromiso: "2026-09-02",
    estadoSeguimiento: "Asignado",
    responsableNombre: "Juan Miranda",
    responsableCargo: "Supervisor",
    responsableEmpresa: "Robles SpA",
    responsableTipo: "Trabajador interno",
    accionCorrectiva: "Corregir condición y respaldar el cierre.",
    evidenciaRequerida: ["Registro fotográfico", "Charla de seguridad"],
  }),
  {
    estado: "EN SEGUIMIENTO",
    fechaCompromiso: "2026-09-02",
    responsable: "Juan Miranda",
    responsableCierreNombre: "Juan Miranda",
    responsableCierreCargo: "Supervisor",
    responsableCierreEmpresa: "Robles SpA",
    responsableCierreTelefono: "Sin contacto",
    responsableCierreEstadoSeguimiento: "Asignado",
    responsableCierreFechaCompromiso: "2026-09-02",
    responsableCorreccionTipo: "Trabajador interno",
    responsableCorreccionNombre: "Juan Miranda",
    responsableCorreccionCargo: "Supervisor",
    responsableCorreccionEmpresa: "Robles SpA",
    responsableCorreccionTelefono: "Sin contacto",
    encargadoSeguimientoNombre: "Usuario autorizado",
    accionCorrectivaRequerida: "Corregir condición y respaldar el cierre.",
    evidenciaRequerida: "Registro fotográfico, Charla de seguridad",
    justificacionExtensionPlazo: "",
  }
);

console.log(
  `Flujo de cierre validado: ${escenarios.length} escenarios, permisos, proyección visual y contadores.`
);
