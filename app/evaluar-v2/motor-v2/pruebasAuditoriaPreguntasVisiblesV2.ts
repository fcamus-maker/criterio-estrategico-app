import {
  auditarPreguntasVisiblesPreventivas,
  auditarSalidaVisibleInforme,
  type CasoAuditoriaPreguntasVisiblesV2,
  type ResultadoAuditoriaPreguntasVisiblesV2,
} from "./auditoriaPreguntasVisiblesV2";

export type ResultadoBancoAuditoriaPreguntasVisiblesV2 =
  ResultadoAuditoriaPreguntasVisiblesV2 & {
    casosSimples: number;
    casosCriticos: number;
    casosAmbientales: number;
    casosDocumentales: number;
    casosSalud: number;
    casosAmbiguos: number;
  };

const simplesBase = [
  ["vidrio-quebrado", "Se detecta vidrio quebrado en ventana, con exposición a trabajadores.", "vidrio quebrado"],
  ["vaso-trizado", "Vaso trizado sobre mesa de casino sin lesión ni exposición crítica.", "vaso trizado"],
  ["goma-despegada", "Goma de piso despegada en acceso a casino con riesgo de tropiezo simple.", "goma despegada"],
  ["material-menor", "Material menor en zona de tránsito interior, sin bloqueo de evacuación.", "material menor"],
  ["limpieza-simple", "Derrame menor de agua en pasillo, controlable con limpieza inmediata.", "agua en pasillo"],
  ["senaletica-menor", "Señalética menor despegada en muro, sin exposición crítica.", "señalética despegada"],
  ["residuo-comun", "Residuo común fuera de contenedor en área de descanso.", "residuo común"],
  ["caja-pasillo", "Caja liviana ubicada junto a pasillo sin obstruir salida de emergencia.", "caja en pasillo"],
  ["protector-suelto", "Protector plástico suelto en borde de mueble.", "protector suelto"],
  ["cable-orden", "Cable de extensión ordenado pero requiere retiro al cierre de tarea.", "cable temporal"],
  ["pintura-fresca", "Pintura fresca sin aviso en zona de terminación interior.", "pintura fresca"],
  ["astilla-madera", "Astilla pequeña en listón de terminación sin tarea crítica asociada.", "astilla pequeña"],
  ["marco-decorativo", "Marco decorativo con fijación floja en oficina de faena.", "marco flojo"],
  ["bolsa-liviana", "Bolsa liviana en zona de circulación secundaria.", "bolsa en tránsito"],
  ["papel-mojado", "Papel mojado en acceso interior, requiere retiro inmediato.", "papel mojado"],
  ["etiqueta-menor", "Etiqueta adhesiva desprendida en equipo menor no operativo.", "etiqueta desprendida"],
  ["bandeja-vacia", "Bandeja vacía fuera de lugar en área administrativa.", "bandeja fuera de lugar"],
  ["restos-menores", "Restos menores de embalaje en bodega limpia.", "restos de embalaje"],
  ["lapiz-cortante", "Lápiz cortante mal ubicado en mesón de oficina.", "elemento cortante menor"],
  ["funda-plastica", "Funda plástica suelta en zona de lockers.", "funda plástica"],
  ["mobiliario-menor", "Mobiliario con daño menor sin caída de partes.", "daño menor mobiliario"],
  ["aviso-impreso", "Aviso impreso deteriorado en tablero informativo.", "aviso deteriorado"],
  ["gota-agua", "Gota de agua bajo dispensador sin propagación.", "gota de agua"],
  ["separador", "Separador liviano desplazado en mesón de atención.", "separador desplazado"],
  ["envase-vacio", "Envase vacío limpio fuera de contenedor común.", "envase vacío"],
] as const;

const criticosBase = [
  ["arnes-altura", "Trabajador realiza tarea en altura aproximada de 3 metros sin arnés ni línea de vida.", "trabajador sin arnés"],
  ["borde-abierto", "Borde abierto en losa sin baranda con trabajadores circulando cerca.", "borde abierto"],
  ["linea-vida", "Línea de vida instalada sin verificación visible durante trabajo en cubierta.", "línea de vida no verificada"],
  ["andamio-sin-baranda", "Andamio en uso sin baranda intermedia ni rodapié.", "andamio sin baranda"],
  ["carga-suspendida", "Trabajador pasa bajo carga suspendida durante maniobra de izaje.", "paso bajo carga"],
  ["rigger-ausente", "Maniobra de izaje sin rigger visible ni segregación efectiva.", "izaje sin rigger"],
  ["aparejo-danado", "Eslinga con daño visible utilizada para izaje de carga.", "eslinga dañada"],
  ["retroceso", "Camión retrocede en zona peatonal sin señalero ni segregación.", "retroceso sin señalero"],
  ["maquinaria-peaton", "Excavadora opera junto a peatones sin segregación física.", "interacción peatón maquinaria"],
  ["bloqueo-loto", "Intervención de equipo energizado sin bloqueo LOTO aplicado.", "sin bloqueo LOTO"],
  ["tablero-abierto", "Tablero eléctrico abierto energizado con tránsito cercano.", "tablero abierto"],
  ["enchufe-danado", "Enchufe de taladro dañado y reparado con cinta en uso.", "enchufe dañado"],
  ["excavacion-borde", "Trabajador al borde de excavación sin barrera ni control de caída.", "borde excavación"],
  ["zanja-sin-entibacion", "Zanja profunda con trabajador dentro sin entibación ni talud seguro.", "zanja sin entibación"],
  ["gasolina-bidon", "Gasolina almacenada en bidón no certificado sin rotulación.", "bidón no certificado"],
  ["quimico-sin-hds", "Uso de sustancia química sin HDS disponible en el área.", "químico sin HDS"],
  ["derrame-combustible", "Derrame de combustible en suelo sin contención inmediata.", "derrame combustible"],
  ["trabajo-caliente", "Trabajo en caliente ejecutado cerca de material combustible sin control.", "trabajo en caliente sin control"],
  ["extintor-vencido", "Extintor vencido en zona de trabajo con fuente de ignición cercana.", "extintor vencido"],
  ["espacio-confinado", "Ingreso a espacio confinado sin medición de gases visible.", "espacio confinado sin medición"],
  ["atrapamiento", "Equipo con parte móvil expuesta durante operación.", "parte móvil expuesta"],
  ["herramienta-guarda", "Esmeril angular usado sin guarda de protección.", "esmeril sin guarda"],
  ["neumaticos", "Vehículo de transporte interno con neumáticos gastados en operación.", "neumáticos gastados"],
  ["parabrisas", "Bus de traslado con parabrisas trizado en servicio.", "parabrisas trizado"],
  ["terreno-inestable", "Trabajador camina por terreno inestable junto a talud saturado.", "terreno inestable"],
  ["deslizamiento", "Deslizamiento de tierra afecta zona de tránsito de trabajadores.", "deslizamiento de tierra"],
  ["conduccion-temeraria", "Conducción temeraria de camioneta dentro de obra.", "conducción temeraria"],
  ["linea-fuego", "Trabajador se ubica en línea de fuego durante ajuste de carga.", "línea de fuego"],
  ["sin-epp", "Trabajador realiza corte sin protección ocular ni facial.", "sin protección ocular"],
  ["control-critico", "Trabajo crítico inicia sin verificación de control crítico requerido.", "control crítico no verificado"],
] as const;

const documentalesBase = [
  ["permiso-sin-firma", "Permiso de trabajo en caliente sin firma del responsable autorizado.", "permiso sin firma"],
  ["ast-incompleto", "AST no considera riesgo de caída por abertura cercana.", "AST incompleto"],
  ["pts-vencido", "PTS requerido para la tarea se encuentra vencido.", "PTS vencido"],
  ["matriz-no-actualizada", "Matriz de riesgos no incorpora nueva actividad crítica.", "matriz no actualizada"],
  ["charla-sin-firma", "Charla de 5 minutos ejecutada sin firma de participantes.", "charla sin firma"],
  ["registro-ausente", "Registro de inspección preuso de equipo no disponible.", "registro no disponible"],
  ["certificado-vencido", "Certificado de mantención de equipo crítico no vigente.", "certificado vencido"],
  ["autorizacion-ausente", "Operador no presenta autorización para operar maquinaria.", "autorización ausente"],
  ["procedimiento-no-difundido", "Procedimiento aplicable no fue difundido al equipo ejecutor.", "procedimiento no difundido"],
  ["hds-no-disponible", "Bodega sin HDS disponible para sustancia almacenada.", "HDS no disponible"],
  ["evidencia-cierre", "Evidencia de cierre no permite verificar corrección realizada.", "evidencia insuficiente"],
  ["permiso-vigencia", "Permiso de excavación sin vigencia definida.", "permiso sin vigencia"],
  ["inspeccion-andamio", "Tarjeta de inspección de andamio no visible.", "inspección no visible"],
  ["plan-izaje", "Plan de izaje no está disponible antes de la maniobra.", "plan de izaje ausente"],
  ["bloqueo-registro", "Registro de bloqueo no identifica responsable de energía cero.", "registro bloqueo incompleto"],
] as const;

const ambientalesBase = [
  ["derrame-combustible-ambiental", "Derrame de combustible en suelo sin contención inmediata ni segregación del área.", "derrame de combustible"],
  ["aceite-equipo", "Filtración de aceite desde maquinaria móvil alcanza suelo natural de la obra.", "filtración de aceite"],
  ["residuo-peligroso", "Residuo peligroso almacenado fuera de contenedor autorizado y sin rotulación visible.", "residuo peligroso"],
  ["bandeja-contencion", "Bidón con sustancia química se mantiene sin bandeja de contención secundaria.", "bidón sin contención"],
  ["polvo-excesivo", "Actividad genera polvo hacia sector colindante sin control de humectación.", "emisión de polvo"],
  ["agua-contaminada", "Agua de lavado escurre hacia sumidero sin control ambiental.", "agua contaminada"],
  ["ruido-vecino", "Equipo genera ruido sostenido hacia entorno sensible sin barrera ni programación.", "ruido ambiental"],
  ["segregacion-residuos", "Residuos comunes y peligrosos se observan mezclados en punto de acopio.", "residuos mezclados"],
  ["sustancia-sin-rotulo", "Envase con sustancia líquida permanece sin rotulación ambiental ni identificación.", "sustancia sin rótulo"],
  ["derrame-pintura", "Derrame de pintura en zona de terminaciones sin kit de contención aplicado.", "derrame de pintura"],
] as const;

const saludBase = [
  ["ruido-ocupacional", "Trabajadores expuestos a ruido de corte continuo sin protección auditiva verificada.", "exposición a ruido"],
  ["polvo-silice", "Corte de material genera polvo respirable sin extracción ni protección respiratoria.", "polvo respirable"],
  ["manejo-manual", "Trabajador levanta carga pesada con postura forzada y sin apoyo mecánico.", "manejo manual de carga"],
  ["quimico-vapores", "Uso de solvente en recinto cerrado sin ventilación suficiente.", "vapores de solvente"],
  ["vibracion-herramienta", "Herramienta vibratoria se usa por periodo prolongado sin pausas planificadas.", "vibración de herramienta"],
] as const;

const ambiguosBase = [
  ["ambiguo-001", "Durante labores de terminación se observa una condición que podría afectar a trabajadores y equipos, sin claridad del control aplicado.", ""],
  ["ambiguo-002", "Se informa condición en frente de trabajo sin detalle suficiente de exposición.", ""],
  ["ambiguo-003", "Supervisor reporta situación preventiva sin identificar objeto principal.", ""],
  ["ambiguo-004", "Hallazgo general en zona común requiere revisión técnica para clasificar.", ""],
  ["ambiguo-005", "Condición observada durante actividad rutinaria sin evidencia del control existente.", ""],
  ["ambiguo-006", "Evento informado verbalmente sin claridad de consecuencia probable.", ""],
  ["ambiguo-007", "Situación operacional podría afectar seguridad o continuidad, pero falta detalle.", ""],
  ["ambiguo-008", "Observación preventiva con información incompleta sobre personas expuestas.", ""],
  ["ambiguo-009", "Reporte menciona incumplimiento general sin documento o tarea específica.", ""],
  ["ambiguo-010", "Condición no verificable en área de trabajo requiere precisar riesgo específico.", ""],
] as const;

const convertir = (
  tipo: CasoAuditoriaPreguntasVisiblesV2["tipo"],
  items: readonly (readonly [string, string, string])[],
): CasoAuditoriaPreguntasVisiblesV2[] =>
  items.map(([id, descripcionHallazgo, riesgoEspecificoDetectado]) => ({
    id,
    descripcionHallazgo,
    riesgoEspecificoDetectado: riesgoEspecificoDetectado || undefined,
    tipo,
  }));

const duplicarComoVerificacion = (
  caso: CasoAuditoriaPreguntasVisiblesV2,
): CasoAuditoriaPreguntasVisiblesV2 => ({
  ...caso,
  id: `${caso.id}-verificacion-terreno`,
  descripcionHallazgo: `${caso.descripcionHallazgo} Se revisa como variante de verificación en terreno, sin modificar la expectativa preventiva original.`,
});

const expandirCasosParaAuditoriaVisible = (): CasoAuditoriaPreguntasVisiblesV2[] => {
  const simples = convertir("simple", simplesBase.slice(0, 20)).flatMap((caso) => [caso, duplicarComoVerificacion(caso)]);
  const criticos = convertir("critico", criticosBase).flatMap((caso) => [caso, duplicarComoVerificacion(caso)]);
  const ambientales = convertir("ambiental", ambientalesBase).flatMap((caso) => [caso, duplicarComoVerificacion(caso)]);
  const documentales = convertir("documental", documentalesBase.slice(0, 10)).flatMap((caso) => [caso, duplicarComoVerificacion(caso)]);
  const salud = convertir("salud", saludBase).flatMap((caso) => [caso, duplicarComoVerificacion(caso)]);
  const ambiguos = convertir("ambiguo", ambiguosBase);

  return [...simples, ...criticos, ...ambientales, ...documentales, ...salud, ...ambiguos];
};

export const CASOS_AUDITORIA_PREGUNTAS_VISIBLES_V2: CasoAuditoriaPreguntasVisiblesV2[] =
  expandirCasosParaAuditoriaVisible();

export const evaluarBancoAuditoriaPreguntasVisibles = (): ResultadoBancoAuditoriaPreguntasVisiblesV2 => {
  const resultado = auditarPreguntasVisiblesPreventivas(CASOS_AUDITORIA_PREGUNTAS_VISIBLES_V2);
  const informes = [
    auditarSalidaVisibleInforme({
      criticidad: "CRITICO",
      textos: [
        "Resultado técnico preventivo",
        "Se clasifica el hallazgo como crítico debido a la exposición directa de una persona a caída de distinto nivel, sin evidencia de control efectivo de protección contra caídas.",
        "Marco legal/preventivo probable asociado",
      ],
      normativaProbable: ["Marco legal/preventivo probable asociado", "Ley 16.744", "DS 44", "DS 594"],
    }),
    auditarSalidaVisibleInforme({
      criticidad: "BAJO",
      textos: [
        "Resultado técnico preventivo",
        "El hallazgo requiere validación preventiva con foco en condición observada, exposición, control existente, acción inmediata y evidencia de cierre.",
        "Marco legal/preventivo probable asociado",
      ],
      normativaProbable: ["Marco legal/preventivo probable asociado"],
    }),
  ];
  const informesTipoLog = informes.filter((informe) => informe.informeTipoLog).length;
  const normativaDebilEnCriticos = informes.filter((informe) => informe.normativaDebil).length;
  const textosInternosInformes = informes.reduce((total, informe) => total + informe.textosInternos.length, 0);
  const idsTecnicosInformes = informes.reduce((total, informe) => total + informe.idsTecnicos.length, 0);
  const fallidos = [...resultado.fallidos];

  if (informesTipoLog > 0) {
    fallidos.push({
      idCaso: "informe-visible",
      severidad: "critico",
      errores: ["El informe contiene texto tipo log."],
    });
  }
  if (normativaDebilEnCriticos > 0) {
    fallidos.push({
      idCaso: "informe-critico",
      severidad: "critico",
      errores: ["Informe crítico sin marco legal/preventivo probable asociado."],
    });
  }
  if (textosInternosInformes > 0 || idsTecnicosInformes > 0) {
    fallidos.push({
      idCaso: "informe-textos-internos",
      severidad: "critico",
      errores: ["El informe contiene textos internos visibles."],
    });
  }

  const totalCasos = resultado.totalCasos;
  const erroresCriticos = fallidos.filter((fallo) => fallo.severidad === "critico").length;
  const erroresMenores = fallidos.length - erroresCriticos;
  const correctos = totalCasos - fallidos.length;

  return {
    ...resultado,
    totalCasos,
    correctos,
    erroresMenores,
    erroresCriticos,
    porcentajeCumplimiento: totalCasos > 0 ? Math.round((correctos / totalCasos) * 100) : 0,
    textosInternosVisibles: resultado.textosInternosVisibles + textosInternosInformes,
    idsTecnicosVisibles: resultado.idsTecnicosVisibles + idsTecnicosInformes,
    informesTipoLog,
    normativaDebilEnCriticos,
    fallidos,
    casosSimples: CASOS_AUDITORIA_PREGUNTAS_VISIBLES_V2.filter((caso) => caso.tipo === "simple").length,
    casosCriticos: CASOS_AUDITORIA_PREGUNTAS_VISIBLES_V2.filter((caso) => caso.tipo === "critico").length,
    casosAmbientales: CASOS_AUDITORIA_PREGUNTAS_VISIBLES_V2.filter((caso) => caso.tipo === "ambiental").length,
    casosDocumentales: CASOS_AUDITORIA_PREGUNTAS_VISIBLES_V2.filter((caso) => caso.tipo === "documental").length,
    casosSalud: CASOS_AUDITORIA_PREGUNTAS_VISIBLES_V2.filter((caso) => caso.tipo === "salud").length,
    casosAmbiguos: CASOS_AUDITORIA_PREGUNTAS_VISIBLES_V2.filter((caso) => caso.tipo === "ambiguo").length,
  };
};
