import type { AmbitoEvaluacion, EvaluacionInputV2, NormativaAplicable } from "./types";

export const MATRIZ_LEGAL_V2: NormativaAplicable[] = [
  {
    norma: "Ley 16.744",
    materia: "Seguridad y salud laboral",
    fuente: "LeyChile / fuente oficial pendiente de validacion especifica",
    nivelConfianza: "pendiente_validacion",
    requiereValidacionLegal: true,
    aplicaCuando: "Accidentes del trabajo, enfermedades profesionales y gestion preventiva general.",
  },
  {
    norma: "DS 44",
    materia: "Gestion preventiva de riesgos laborales",
    fuente: "LeyChile / fuente oficial pendiente de validacion especifica",
    nivelConfianza: "pendiente_validacion",
    requiereValidacionLegal: true,
    aplicaCuando: "Identificacion, evaluacion y control preventivo de riesgos laborales.",
  },
  {
    norma: "DS 594",
    materia: "Condiciones sanitarias y ambientales en lugares de trabajo",
    fuente: "LeyChile / fuente oficial pendiente de validacion especifica",
    nivelConfianza: "pendiente_validacion",
    requiereValidacionLegal: true,
    aplicaCuando: "Ruido, polvo, quimicos, ventilacion, higiene y condiciones ambientales laborales.",
  },
  {
    norma: "Codigo del Trabajo",
    materia: "Materia laboral/documental",
    fuente: "Direccion del Trabajo / fuente oficial pendiente de validacion especifica",
    nivelConfianza: "pendiente_validacion",
    requiereValidacionLegal: true,
    aplicaCuando: "Condiciones laborales o documentacion laboral claramente asociada al hallazgo.",
  },
  {
    norma: "Ley 19.300",
    materia: "Medio ambiente",
    fuente: "LeyChile / fuente oficial pendiente de validacion especifica",
    nivelConfianza: "pendiente_validacion",
    requiereValidacionLegal: true,
    aplicaCuando: "Aspectos, impactos ambientales e instrumentos de gestion ambiental.",
  },
  {
    norma: "Normativa de residuos aplicable",
    materia: "Residuos",
    fuente: "Fuente oficial pendiente de validacion especifica",
    nivelConfianza: "pendiente_validacion",
    requiereValidacionLegal: true,
    aplicaCuando: "Residuo peligroso o gestion irregular de residuos.",
  },
  {
    norma: "Normativa de sustancias peligrosas aplicable",
    materia: "Sustancias peligrosas",
    fuente: "Fuente oficial pendiente de validacion especifica",
    nivelConfianza: "pendiente_validacion",
    requiereValidacionLegal: true,
    aplicaCuando: "Almacenamiento, manipulacion, fuga o derrame de sustancias peligrosas.",
  },
  {
    norma: "Normativa de emisiones aplicable",
    materia: "Emisiones",
    fuente: "Fuente oficial pendiente de validacion especifica",
    nivelConfianza: "pendiente_validacion",
    requiereValidacionLegal: true,
    aplicaCuando: "Polvo, gases, humos o emisiones no controladas.",
  },
  {
    norma: "Normativa de ruido aplicable",
    materia: "Ruido",
    fuente: "Fuente oficial pendiente de validacion especifica",
    nivelConfianza: "pendiente_validacion",
    requiereValidacionLegal: true,
    aplicaCuando: "Ruido ocupacional o ambiental.",
  },
  {
    norma: "Normativa de aguas aplicable",
    materia: "Agua",
    fuente: "Fuente oficial pendiente de validacion especifica",
    nivelConfianza: "pendiente_validacion",
    requiereValidacionLegal: true,
    aplicaCuando: "Derrame, descarga o afectacion real/probable a agua, drenaje o alcantarillado.",
  },
  {
    norma: "Normativa de suelo aplicable",
    materia: "Suelo",
    fuente: "Fuente oficial pendiente de validacion especifica",
    nivelConfianza: "pendiente_validacion",
    requiereValidacionLegal: true,
    aplicaCuando: "Derrame, filtracion, disposicion irregular o contaminacion de suelo.",
  },
  {
    norma: "RCA / permiso ambiental del proyecto",
    materia: "Permisos ambientales",
    fuente: "Instrumento del proyecto pendiente de parametrizacion",
    nivelConfianza: "no_mostrar_usuario_final",
    requiereValidacionLegal: true,
    aplicaCuando: "Hallazgo asociado a compromiso, permiso, RCA o condicion ambiental especifica.",
  },
];

function agregarSiNoExiste(lista: NormativaAplicable[], norma: NormativaAplicable): void {
  if (!lista.some((item) => item.norma === norma.norma && item.materia === norma.materia)) {
    lista.push(norma);
  }
}

function buscarNorma(nombre: string): NormativaAplicable | undefined {
  return MATRIZ_LEGAL_V2.find((norma) => norma.norma === nombre);
}

function buscarMateria(materia: string): NormativaAplicable | undefined {
  return MATRIZ_LEGAL_V2.find((norma) => norma.materia.toLowerCase() === materia.toLowerCase());
}

function textoIncluyePalabra(texto: string, palabra: string): boolean {
  return new RegExp(`(^|\\W)${palabra}(\\W|$)`, "i").test(texto);
}

export function obtenerNormativaProbableV2(
  ambitos: AmbitoEvaluacion[],
  input: EvaluacionInputV2
): NormativaAplicable[] {
  const normas: NormativaAplicable[] = [];
  const ambientales = input.datosAmbientales;
  const legales = input.datosLegales;

  if (ambitos.includes("seguridad_laboral") || ambitos.includes("emergencia")) {
    const ley16744 = buscarNorma("Ley 16.744");
    const ds44 = buscarNorma("DS 44");
    if (ley16744) agregarSiNoExiste(normas, ley16744);
    if (ds44) agregarSiNoExiste(normas, ds44);
  }

  if (ambitos.includes("salud_ocupacional")) {
    const ds594 = buscarNorma("DS 594");
    if (ds594) agregarSiNoExiste(normas, ds594);
    const ruido = buscarMateria("Ruido");
    if (ruido && textoIncluyePalabra(input.descripcion, "ruido")) agregarSiNoExiste(normas, ruido);
  }

  if (ambitos.includes("medio_ambiente") || ambientales?.existeAspectoAmbiental || ambientales?.existeImpactoAmbiental) {
    const ley19300 = buscarNorma("Ley 19.300");
    if (ley19300) agregarSiNoExiste(normas, ley19300);
    if (ambientales?.residuoPeligroso) {
      const residuos = buscarMateria("Residuos");
      if (residuos) agregarSiNoExiste(normas, residuos);
    }
    if (ambientales?.sustanciaPeligrosa || ambientales?.derrameOFuga) {
      const sustancias = buscarMateria("Sustancias peligrosas");
      if (sustancias) agregarSiNoExiste(normas, sustancias);
    }
    if (ambientales?.afectaAire) {
      const emisiones = buscarMateria("Emisiones");
      if (emisiones) agregarSiNoExiste(normas, emisiones);
    }
    if (ambientales?.afectaAgua) {
      const agua = buscarMateria("Agua");
      if (agua) agregarSiNoExiste(normas, agua);
    }
    if (ambientales?.afectaSuelo) {
      const suelo = buscarMateria("Suelo");
      if (suelo) agregarSiNoExiste(normas, suelo);
    }
    if (ambientales?.permisoRCAAsociado || legales?.permisoFaltante) {
      const rca = buscarNorma("RCA / permiso ambiental del proyecto");
      if (rca) agregarSiNoExiste(normas, rca);
    }
  }

  if (ambitos.includes("legal_documental") || legales?.documentoFaltante || legales?.procedimientoFaltante) {
    const ds44 = buscarNorma("DS 44");
    if (ds44) agregarSiNoExiste(normas, ds44);
  }

  if (legales?.normaDeclarada) {
    agregarSiNoExiste(normas, {
      norma: legales.normaDeclarada,
      materia: "Norma declarada por usuario",
      fuente: "Declaracion de usuario pendiente de validacion",
      nivelConfianza: "pendiente_validacion",
      requiereValidacionLegal: true,
      aplicaCuando: "Norma indicada manualmente durante la evaluacion.",
    });
  }

  return normas;
}
