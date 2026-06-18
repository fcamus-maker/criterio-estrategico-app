import {
  clasificarPreventivamentePorAtributos,
  type ResultadoRouterPreventivo,
  type SuficienciaTecnicaPreventiva,
} from "./routerPreventivoAtributosV2";
import type {
  DesviacionPreventivaId,
  FamiliaTaxonomiaPreventivaId,
} from "./taxonomiaPreventivaV2";

export type CasoRealRouterPreventivo = {
  id: string;
  descripcion: string;
  familiaPrimariaEsperada: FamiliaTaxonomiaPreventivaId;
  familiasSecundariasEsperadas: FamiliaTaxonomiaPreventivaId[];
  desviacionesEsperadas: DesviacionPreventivaId[];
  suficienciaEsperada: SuficienciaTecnicaPreventiva;
  erroresQueDebeEvitar: string[];
  familiasProhibidas?: FamiliaTaxonomiaPreventivaId[];
  desviacionesProhibidas?: DesviacionPreventivaId[];
};

export type ResultadoPruebaRouterPreventivo = {
  idCaso: string;
  descripcion: string;
  familiaPrimariaEsperada: FamiliaTaxonomiaPreventivaId;
  familiaPrimariaObtenida: FamiliaTaxonomiaPreventivaId | null;
  familiasSecundariasEsperadas: FamiliaTaxonomiaPreventivaId[];
  familiasSecundariasObtenidas: FamiliaTaxonomiaPreventivaId[];
  desviacionesEsperadas: DesviacionPreventivaId[];
  desviacionesObtenidas: DesviacionPreventivaId[];
  suficienciaEsperada: SuficienciaTecnicaPreventiva;
  suficienciaObtenida: SuficienciaTecnicaPreventiva;
  erroresQueDebeEvitar: string[];
  cumple: boolean;
  observaciones: string[];
  nivelError: "sin_error" | "menor" | "critico";
};

export type ResumenBancoPruebasRouterPreventivo = {
  totalCasos: number;
  casosCorrectos: number;
  casosConErrorMenor: number;
  casosConErrorCritico: number;
  porcentajeCumplimiento: number;
  listaCasosFallidos: ResultadoPruebaRouterPreventivo[];
  patronesFallaDetectados: string[];
  resultados: ResultadoPruebaRouterPreventivo[];
};

export const BANCO_CASOS_REALES_ROUTER_PREVENTIVO: CasoRealRouterPreventivo[] = [
  caso("real-001", "Extintor vencido instalado en pasillo de bodega.", "equipos_emergencia", ["mantencion_certificacion"], ["condicion_insegura"], "suficiente", ["No debe clasificarse como emergencia real."], ["emergencias_reales"]),
  caso("real-002", "Extintor obstruido por cajas y materiales en acceso principal.", "equipos_emergencia", ["senalizacion_segregacion", "orden_aseo_housekeeping"], ["condicion_insegura"], "suficiente", ["No debe tratarse como incendio activo."], ["emergencias_reales"]),
  caso("real-003", "Bodega de sustancias quimicas sin HDS disponible en terreno.", "sustancias_hds", ["documental_legal", "capacitacion_evidencias"], ["omision_documental"], "suficiente", ["HDS faltante debe vincular documental/legal con sustancias peligrosas/HDS."]),
  caso("real-004", "Trabajadores ejecutan actividad sin charlas de cinco minutos firmadas.", "capacitacion_evidencias", ["documental_legal", "seguridad_trabajadores"], ["omision_documental", "falta_conocimiento_capacitacion_difusion"], "suficiente", ["No debe tratarse como trabajo critico si no hay senales de tarea critica."], ["trabajos_criticos"]),
  caso("real-005", "Procedimiento exige arnes a dos metros y trabajador sorprendido sin arnes a tres metros.", "trabajos_criticos", ["epp", "seguridad_trabajadores", "documental_legal"], ["incumplimiento_control_critico"], "suficiente", ["Debe reconocer trabajo critico, EPP y control critico."]),
  caso("real-006", "Trabajador sin lentes de seguridad durante corte de material.", "epp", ["seguridad_trabajadores", "herramientas_equipos"], ["incumplimiento_control_critico", "acto_inseguro"], "parcial", ["No debe clasificarse solo como documento faltante."], ["documental_legal"]),
  caso("real-007", "Trabajador con calzado de seguridad en mal estado usado en terreno.", "epp", ["mantencion_certificacion", "seguridad_trabajadores"], ["condicion_insegura"], "suficiente", ["No debe tratarse como falta documental principal."], ["documental_legal"]),
  caso("real-008", "Arnes deteriorado y vencido disponible para trabajo en altura.", "epp", ["trabajos_criticos", "mantencion_certificacion", "seguridad_trabajadores"], ["condicion_insegura", "control_critico_ausente_no_verificado"], "suficiente", ["No debe tratarse como EPP menor si esta vinculado a altura."]),
  caso("real-009", "Madera con clavos expuestos en zona de transito de trabajadores.", "orden_aseo_housekeeping", ["seguridad_trabajadores", "senalizacion_segregacion"], ["condicion_insegura"], "parcial", ["No debe tratarse como dano material simple."], ["dano_material"]),
  caso("real-010", "Material no retirado en paso de trabajadores, obstruyendo circulacion.", "orden_aseo_housekeeping", ["seguridad_trabajadores", "senalizacion_segregacion"], ["condicion_insegura"], "parcial", ["No debe omitir exposicion de trabajadores."]),
  caso("real-011", "Tapa de alcantarillado retirada y no repuesta en ruta peatonal.", "orden_aseo_housekeeping", ["dano_material", "seguridad_trabajadores", "senalizacion_segregacion"], ["condicion_insegura"], "suficiente", ["Debe tratarse como condicion insegura y no solo como dano material."]),
  caso("real-012", "Pasillo obstruido por materiales en zona de evacuacion.", "orden_aseo_housekeeping", ["senalizacion_segregacion", "equipos_emergencia", "seguridad_trabajadores"], ["condicion_insegura"], "parcial", ["No debe clasificarse como emergencia real sin evento activo."], ["emergencias_reales"]),
  caso("real-013", "Gomas del piso despegadas en acceso a casino.", "dano_material", ["orden_aseo_housekeeping", "seguridad_trabajadores"], ["condicion_insegura"], "parcial", ["Goma despegada no debe sobredocumentarse."], ["documental_legal", "trabajos_criticos"]),
  caso("real-014", "Vaso trizado disponible para uso en comedor.", "dano_material", ["seguridad_trabajadores"], ["condicion_insegura"], "suficiente", ["Vaso trizado no debe gatillar PTS/AST/procedimiento como respaldo principal."], ["documental_legal", "trabajos_criticos"]),
  caso("real-015", "Enchufe de taladro danado y reparado con huincha aisladora.", "energia_loto_electrico", ["herramientas_equipos", "mantencion_certificacion"], ["herramienta_equipo_mal_estado_usado_terreno"], "parcial", ["No debe clasificarse solo como herramienta generica."]),
  caso("real-016", "Herramienta electrica sin inspeccion vigente disponible para uso.", "herramientas_equipos", ["mantencion_certificacion", "seguridad_trabajadores"], ["condicion_insegura"], "suficiente", ["Debe reconocer mantencion o inspeccion, no solo documento generico."]),
  caso("real-017", "Herramienta inadecuada para retirar pieza metalica.", "herramientas_equipos", ["seguridad_trabajadores"], ["herramienta_equipo_inadecuado_para_tarea"], "suficiente", ["No debe confundirse con herramienta danada si no hay mal estado descrito."]),
  caso("real-018", "Uso inadecuado de maquinaria por operador durante maniobra.", "maquinaria_instalaciones", ["seguridad_trabajadores", "capacitacion_evidencias"], ["uso_inadecuado_herramienta_equipo_maquinaria", "acto_inseguro"], "parcial", ["No debe tratarse como dano material simple."], ["dano_material"]),
  caso("real-019", "Maquina con partes moviles expuestas durante operacion.", "maquinaria_instalaciones", ["seguridad_trabajadores", "trabajos_criticos"], ["condicion_insegura", "control_critico_ausente_no_verificado"], "parcial", ["Debe reconocer atrapamiento o control critico ausente."]),
  caso("real-020", "Equipo intervenido sin bloqueo LOTO antes de mantencion.", "energia_loto_electrico", ["trabajos_criticos", "seguridad_trabajadores"], ["incumplimiento_control_critico"], "parcial", ["Debe reconocer energia/LOTO/control critico."]),
  caso("real-021", "Tablero electrico sin proteccion ni senalizacion.", "energia_loto_electrico", ["senalizacion_segregacion", "seguridad_trabajadores"], ["condicion_insegura", "control_critico_ausente_no_verificado"], "parcial", ["No debe tratarse solo como senalizacion menor."]),
  caso("real-022", "Gasolina trasladada en bidon no certificado.", "sustancias_hds", ["medio_ambiente", "equipos_emergencia", "documental_legal"], ["condicion_insegura"], "parcial", ["Gasolina en bidon no certificado no debe tratarse solo como documento faltante."]),
  caso("real-023", "Sustancia quimica almacenada sin rotulacion visible.", "sustancias_hds", ["documental_legal", "medio_ambiente"], ["condicion_insegura", "omision_documental"], "parcial", ["No debe tratarse como orden y aseo simple."]),
  caso("real-024", "Derrame de combustible al suelo sin contencion.", "medio_ambiente", ["sustancias_hds", "equipos_emergencia"], ["evento_ambiental"], "suficiente", ["Debe reconocer impacto ambiental, no solo sustancia almacenada."]),
  caso("real-025", "Residuo peligroso mal segregado en patio de acopio.", "medio_ambiente", ["sustancias_hds", "senalizacion_segregacion"], ["evento_ambiental", "condicion_insegura"], "parcial", ["No debe tratarse como basura comun."]),
  caso("real-026", "Vehiculo con neumaticos gastados en operacion.", "vehiculos_transporte", ["mantencion_certificacion", "seguridad_trabajadores"], ["condicion_insegura"], "suficiente", ["No debe clasificarse como dano material estetico."]),
  caso("real-027", "Bus de transporte de trabajadores con parabrisas trizado.", "vehiculos_transporte", ["dano_material", "seguridad_trabajadores"], ["condicion_insegura"], "suficiente", ["No debe ignorar exposicion de pasajeros."]),
  caso("real-028", "Conduccion imprudente de camioneta al interior de obra.", "vehiculos_transporte", ["seguridad_trabajadores"], ["conduccion_imprudente", "acto_inseguro"], "parcial", ["Conduccion imprudente no debe tratarse como dano material simple."], ["dano_material"]),
  caso("real-029", "Interaccion insegura entre peaton y maquinaria movil en patio.", "vehiculos_transporte", ["seguridad_trabajadores", "maquinaria_instalaciones", "senalizacion_segregacion"], ["interaccion_insegura_peaton_vehiculo_maquinaria"], "parcial", ["Debe reconocer interaccion peaton/vehiculo/maquinaria."]),
  caso("real-030", "Trabajador accede a zona delimitada sin autorizacion.", "senalizacion_segregacion", ["seguridad_trabajadores"], ["acceso_zona_delimitada_sin_autorizacion", "acto_inseguro"], "suficiente", ["No debe tratarse como falta de senalizacion si el control fue evadido."]),
  caso("real-031", "Trabajador salta barrera de seguridad para acortar camino.", "senalizacion_segregacion", ["seguridad_trabajadores"], ["evasion_barreras_senalizacion_segregacion", "acto_inseguro"], "parcial", ["Debe diferenciar evasion de barrera de ausencia de barrera."]),
  caso("real-032", "Area de izaje sin segregacion durante maniobra con carga.", "izaje_gruas_amarre", ["senalizacion_segregacion", "seguridad_trabajadores", "trabajos_criticos"], ["control_critico_ausente_no_verificado"], "parcial", ["No debe tratarse como senalizacion generica solamente."]),
  caso("real-033", "Trabajador pasa bajo carga suspendida durante maniobra de izaje.", "izaje_gruas_amarre", ["seguridad_trabajadores", "trabajos_criticos"], ["paso_bajo_carga_suspendida", "exposicion_linea_fuego"], "parcial", ["Pasar bajo carga suspendida debe reconocer linea de fuego/izaje/acto inseguro."]),
  caso("real-034", "Eslinga deteriorada disponible para maniobra de izaje.", "izaje_gruas_amarre", ["mantencion_certificacion", "trabajos_criticos"], ["condicion_insegura"], "parcial", ["No debe tratarse como dano material simple."]),
  caso("real-035", "Grillete en mal estado usado para izaje de carga.", "izaje_gruas_amarre", ["mantencion_certificacion", "trabajos_criticos"], ["condicion_insegura"], "parcial", ["Debe reconocer elemento critico de izaje."]),
  caso("real-036", "Elementos criticos de grua en mal estado durante inspeccion.", "izaje_gruas_amarre", ["maquinaria_instalaciones", "mantencion_certificacion"], ["condicion_insegura"], "parcial", ["No debe tratarse solo como mantencion generica."]),
  caso("real-037", "Trabajo en caliente ejecutado sin permiso autorizado.", "trabajos_criticos", ["documental_legal", "equipos_emergencia"], ["trabajo_critico_sin_autorizacion_control", "incumplimiento_control_critico"], "suficiente", ["Debe reconocer permiso habilitante de trabajo critico."]),
  caso("real-038", "Excavacion sin entibacion con trabajadores cercanos.", "excavaciones_suelos", ["seguridad_trabajadores", "trabajos_criticos"], ["control_critico_ausente_no_verificado"], "parcial", ["No debe tratarse solo como suelo o terreno."]),
  caso("real-039", "Excavacion sin proteccion perimetral ni delimitacion.", "excavaciones_suelos", ["senalizacion_segregacion", "seguridad_trabajadores"], ["condicion_insegura"], "parcial", ["Debe reconocer excavacion y control perimetral."]),
  caso("real-040", "Condiciones climaticas adversas durante maniobra de izaje.", "clima_entorno", ["izaje_gruas_amarre", "trabajos_criticos"], ["condicion_climatica_o_terreno_aumenta_riesgo"], "parcial", ["Clima debe actuar como modificador de riesgo, no como unico hallazgo si hay izaje."]),
  caso("real-041", "Terreno inestable y resbaladizo en zona de transito.", "clima_entorno", ["orden_aseo_housekeeping", "seguridad_trabajadores"], ["desplazamiento_terreno_inestable"], "parcial", ["Debe reconocer desplazamiento por terreno inestable."]),
  caso("real-042", "Trabajador expuesto a ruido sin proteccion auditiva.", "higiene_ocupacional", ["epp", "seguridad_trabajadores"], ["incumplimiento_control_critico"], "parcial", ["No debe tratarse como EPP menor sin reconocer higiene ocupacional."]),
  caso("real-043", "Exposicion a polvo de silice sin control visible.", "higiene_ocupacional", ["seguridad_trabajadores", "medio_ambiente"], ["control_critico_ausente_no_verificado"], "parcial", ["Debe reconocer agente de higiene ocupacional."]),
  caso("real-044", "Levantamiento manual de carga en postura forzada.", "ergonomia_manejo_manual", ["seguridad_trabajadores"], ["acto_inseguro"], "parcial", ["No debe tratarse como dano material o documento."]),
  caso("real-045", "Matriz de riesgo sin actualizar para actividad ejecutada.", "documental_legal", ["capacitacion_evidencias"], ["omision_documental"], "parcial", ["Debe reconocer documento preventivo aplicable."]),
  caso("real-046", "Documentos preventivos vencidos en carpeta de obra.", "documental_legal", ["capacitacion_evidencias"], ["omision_documental"], "parcial", ["No debe inferir riesgo activo si no hay exposicion descrita."]),
  caso("real-047", "Certificaciones vencidas de equipo critico.", "mantencion_certificacion", ["documental_legal", "maquinaria_instalaciones"], ["condicion_insegura", "omision_documental"], "parcial", ["Debe reconocer certificacion/mantencion vencida."]),
  caso("real-048", "Charla realizada pero sin firmas de respaldo.", "capacitacion_evidencias", ["documental_legal"], ["omision_documental"], "suficiente", ["No debe asumir falta total de capacitacion si solo falta respaldo."]),
  caso("real-049", "Procedimiento no disponible en terreno para tarea en ejecucion.", "documental_legal", ["capacitacion_evidencias", "seguridad_trabajadores"], ["omision_documental"], "parcial", ["Debe reconocer disponibilidad documental en terreno."]),
  caso("real-050", "Trabajador ingresa a zona restringida sin autorizacion.", "senalizacion_segregacion", ["seguridad_trabajadores"], ["ingreso_zona_restringida", "acto_inseguro"], "suficiente", ["Debe reconocer ingreso no autorizado a zona restringida."]),
];

function caso(
  id: string,
  descripcion: string,
  familiaPrimariaEsperada: FamiliaTaxonomiaPreventivaId,
  familiasSecundariasEsperadas: FamiliaTaxonomiaPreventivaId[],
  desviacionesEsperadas: DesviacionPreventivaId[],
  suficienciaEsperada: SuficienciaTecnicaPreventiva,
  erroresQueDebeEvitar: string[],
  familiasProhibidas: FamiliaTaxonomiaPreventivaId[] = [],
  desviacionesProhibidas: DesviacionPreventivaId[] = [],
): CasoRealRouterPreventivo {
  return {
    id,
    descripcion,
    familiaPrimariaEsperada,
    familiasSecundariasEsperadas,
    desviacionesEsperadas,
    suficienciaEsperada,
    erroresQueDebeEvitar,
    familiasProhibidas,
    desviacionesProhibidas,
  };
}

function incluyeFamilia(resultado: ResultadoRouterPreventivo, familiaId: FamiliaTaxonomiaPreventivaId): boolean {
  return resultado.familiaPrimariaId === familiaId || resultado.familiasSecundariasIds.includes(familiaId);
}

function incluyeDesviacion(resultado: ResultadoRouterPreventivo, desviacionId: DesviacionPreventivaId): boolean {
  return resultado.desviacionesIds.includes(desviacionId);
}

function detectarObservaciones(
  casoReal: CasoRealRouterPreventivo,
  resultado: ResultadoRouterPreventivo,
): string[] {
  const observaciones: string[] = [];

  if (resultado.familiaPrimariaId !== casoReal.familiaPrimariaEsperada) {
    observaciones.push(
      `Familia primaria esperada ${casoReal.familiaPrimariaEsperada}, obtenida ${resultado.familiaPrimariaId || "sin clasificacion"}.`,
    );
  }

  const familiasSecundariasFaltantes = casoReal.familiasSecundariasEsperadas.filter(
    (familiaId) => !incluyeFamilia(resultado, familiaId),
  );
  if (familiasSecundariasFaltantes.length > 0) {
    observaciones.push(`Familias secundarias faltantes: ${familiasSecundariasFaltantes.join(", ")}.`);
  }

  const desviacionesFaltantes = casoReal.desviacionesEsperadas.filter(
    (desviacionId) => !incluyeDesviacion(resultado, desviacionId),
  );
  if (desviacionesFaltantes.length > 0) {
    observaciones.push(`Desviaciones faltantes: ${desviacionesFaltantes.join(", ")}.`);
  }

  if (resultado.suficienciaTecnica !== casoReal.suficienciaEsperada) {
    observaciones.push(
      `Suficiencia esperada ${casoReal.suficienciaEsperada}, obtenida ${resultado.suficienciaTecnica}.`,
    );
  }

  const familiasProhibidasDetectadas = casoReal.familiasProhibidas?.filter(
    (familiaId) => incluyeFamilia(resultado, familiaId),
  );
  if (familiasProhibidasDetectadas && familiasProhibidasDetectadas.length > 0) {
    observaciones.push(`Familias prohibidas detectadas: ${familiasProhibidasDetectadas.join(", ")}.`);
  }

  const desviacionesProhibidasDetectadas = casoReal.desviacionesProhibidas?.filter(
    (desviacionId) => incluyeDesviacion(resultado, desviacionId),
  );
  if (desviacionesProhibidasDetectadas && desviacionesProhibidasDetectadas.length > 0) {
    observaciones.push(`Desviaciones prohibidas detectadas: ${desviacionesProhibidasDetectadas.join(", ")}.`);
  }

  return observaciones;
}

function nivelErrorDesdeObservaciones(
  casoReal: CasoRealRouterPreventivo,
  resultado: ResultadoRouterPreventivo,
  observaciones: string[],
): ResultadoPruebaRouterPreventivo["nivelError"] {
  if (observaciones.length === 0) return "sin_error";

  const detectoFamiliaProhibida = (casoReal.familiasProhibidas || []).some((familiaId) =>
    incluyeFamilia(resultado, familiaId),
  );
  const detectoDesviacionProhibida = (casoReal.desviacionesProhibidas || []).some((desviacionId) =>
    incluyeDesviacion(resultado, desviacionId),
  );
  const falloFamiliaPrimaria = resultado.familiaPrimariaId !== casoReal.familiaPrimariaEsperada;
  const falloDesviacionPrincipal =
    casoReal.desviacionesEsperadas.length > 0 && !incluyeDesviacion(resultado, casoReal.desviacionesEsperadas[0]);

  if (detectoFamiliaProhibida || detectoDesviacionProhibida || falloFamiliaPrimaria || falloDesviacionPrincipal) {
    return "critico";
  }

  return "menor";
}

function patronesDesdeResultados(resultados: ResultadoPruebaRouterPreventivo[]): string[] {
  const patrones = new Map<string, number>();
  const sumar = (patron: string) => patrones.set(patron, (patrones.get(patron) || 0) + 1);

  resultados.forEach((resultado) => {
    if (resultado.nivelError === "sin_error") return;
    resultado.observaciones.forEach((observacion) => {
      if (observacion.startsWith("Familia primaria")) sumar("familia_primaria_distinta");
      if (observacion.startsWith("Familias secundarias")) sumar("familias_secundarias_incompletas");
      if (observacion.startsWith("Desviaciones faltantes")) sumar("desviaciones_incompletas");
      if (observacion.startsWith("Suficiencia")) sumar("suficiencia_diferente");
      if (observacion.startsWith("Familias prohibidas")) sumar("familia_prohibida_detectada");
      if (observacion.startsWith("Desviaciones prohibidas")) sumar("desviacion_prohibida_detectada");
    });
  });

  return Array.from(patrones.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([patron, cantidad]) => `${patron}: ${cantidad}`);
}

export function evaluarBancoPruebasRouterPreventivo(): ResumenBancoPruebasRouterPreventivo {
  const resultados = BANCO_CASOS_REALES_ROUTER_PREVENTIVO.map((casoReal) => {
    const obtenido = clasificarPreventivamentePorAtributos({ descripcion: casoReal.descripcion });
    const observaciones = detectarObservaciones(casoReal, obtenido);
    const nivelError = nivelErrorDesdeObservaciones(casoReal, obtenido, observaciones);

    return {
      idCaso: casoReal.id,
      descripcion: casoReal.descripcion,
      familiaPrimariaEsperada: casoReal.familiaPrimariaEsperada,
      familiaPrimariaObtenida: obtenido.familiaPrimariaId,
      familiasSecundariasEsperadas: casoReal.familiasSecundariasEsperadas,
      familiasSecundariasObtenidas: obtenido.familiasSecundariasIds,
      desviacionesEsperadas: casoReal.desviacionesEsperadas,
      desviacionesObtenidas: obtenido.desviacionesIds,
      suficienciaEsperada: casoReal.suficienciaEsperada,
      suficienciaObtenida: obtenido.suficienciaTecnica,
      erroresQueDebeEvitar: casoReal.erroresQueDebeEvitar,
      cumple: observaciones.length === 0,
      observaciones,
      nivelError,
    };
  });

  const totalCasos = resultados.length;
  const casosCorrectos = resultados.filter((resultado) => resultado.cumple).length;
  const casosConErrorMenor = resultados.filter((resultado) => resultado.nivelError === "menor").length;
  const casosConErrorCritico = resultados.filter((resultado) => resultado.nivelError === "critico").length;

  return {
    totalCasos,
    casosCorrectos,
    casosConErrorMenor,
    casosConErrorCritico,
    porcentajeCumplimiento: totalCasos === 0 ? 0 : Math.round((casosCorrectos / totalCasos) * 100),
    listaCasosFallidos: resultados.filter((resultado) => !resultado.cumple),
    patronesFallaDetectados: patronesDesdeResultados(resultados),
    resultados,
  };
}
