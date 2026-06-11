import { casosPruebaMotorV2, ejecutarCasosPruebaMotorV2 } from "./casosPruebaMotorV2";
import { evaluarHallazgoV2 } from "./evaluacionMotorV2";
import type { Criticidad, NormativaAplicable } from "./types";

export type ReporteCasoMotorV2 = {
  nombreCaso: string;
  criticidadEsperada: Criticidad | Criticidad[];
  criticidadObtenida: Criticidad;
  aprobado: boolean;
  ambitoPrincipal: string;
  tipoEvento: string;
  requiereRevisionManual: boolean;
  requiereSuspension: boolean;
  requiereContencionAmbiental: boolean;
  normativaProbable: NormativaAplicable[];
  justificacionTecnica: string;
  observacion: string;
};

export function generarReporteCasosMotorV2(): ReporteCasoMotorV2[] {
  const resultadosBase = ejecutarCasosPruebaMotorV2();

  return casosPruebaMotorV2.map((caso, index) => {
    const resultado = evaluarHallazgoV2(caso.input);
    const validacionBase = resultadosBase[index];

    return {
      nombreCaso: caso.nombre,
      criticidadEsperada: caso.criticidadEsperada,
      criticidadObtenida: resultado.criticidadFinal,
      aprobado: Boolean(validacionBase?.aprobado),
      ambitoPrincipal: resultado.ambitoPrincipal,
      tipoEvento: resultado.tipoEvento,
      requiereRevisionManual: resultado.requiereRevisionManual,
      requiereSuspension: resultado.requiereSuspension,
      requiereContencionAmbiental: resultado.requiereContencionAmbiental,
      normativaProbable: resultado.normativaProbable,
      justificacionTecnica: resultado.justificacionTecnica,
      observacion: validacionBase?.observacion ?? caso.observacionEsperada,
    };
  });
}

