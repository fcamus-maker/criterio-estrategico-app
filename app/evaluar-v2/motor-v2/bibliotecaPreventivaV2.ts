import type {
  BibliotecaPreventiva,
  BibliotecaPreventivaId,
  OpcionPreventiva,
  TipoRespuestaPreventiva,
} from "./types";

export const OPCIONES_PREVENTIVAS_POR_TIPO: Record<
  TipoRespuestaPreventiva,
  OpcionPreventiva[]
> = {
  si_no: [
    { label: "Si", value: "si", score: 0 },
    { label: "No", value: "no", score: 6 },
    {
      label: "No verificable",
      value: "no_verificable",
      score: 0,
      marcaNoAplica: true,
    },
  ],
  cumplimiento: [
    { label: "Cumple", value: "cumple", score: 0 },
    { label: "Cumple parcialmente", value: "cumple_parcial", score: 4 },
    { label: "No cumple", value: "no_cumple", score: 8 },
    { label: "No aplica", value: "no_aplica", score: 0, marcaNoAplica: true },
  ],
  estado_equipo: [
    { label: "Operativo", value: "operativo", score: 0 },
    { label: "Operativo con observacion", value: "observado", score: 4 },
    { label: "No operativo", value: "no_operativo", score: 8 },
    {
      label: "No verificable",
      value: "no_verificable",
      score: 0,
      marcaNoAplica: true,
    },
  ],
  evidencia: [
    { label: "Suficiente", value: "suficiente", score: 0 },
    { label: "Parcial", value: "parcial", score: 3 },
    { label: "Insuficiente", value: "insuficiente", score: 6 },
    { label: "No disponible", value: "no_disponible", score: 6 },
  ],
  texto_breve: [],
  ambito_general: [
    { label: "Seguridad de trabajadores", value: "seguridad_trabajadores" },
    { label: "Medio ambiente", value: "medio_ambiente" },
    { label: "Dano material/equipo/infraestructura", value: "dano_material" },
    { label: "Documental/legal", value: "documental_legal" },
    { label: "Operacional", value: "operacional" },
    { label: "Mas de uno", value: "mixto" },
    { label: "No verificable", value: "no_verificable" },
  ],
  consecuencia_principal: [
    { label: "Sin consecuencia directa", value: "sin_consecuencia", score: 0 },
    { label: "Dano menor o correccion simple", value: "menor", score: 2 },
    { label: "Exposicion o interrupcion operacional", value: "moderada", score: 5 },
    {
      label: "Lesion grave, impacto mayor o perdida critica",
      value: "grave",
      score: 9,
    },
  ],
  control_existente: [
    { label: "Control suficiente", value: "suficiente", score: 0 },
    { label: "Control parcial", value: "parcial", score: 5 },
    { label: "Sin control", value: "sin_control", score: 10 },
    {
      label: "No verificable",
      value: "no_verificable",
      score: 0,
      marcaNoAplica: true,
    },
  ],
  aplicabilidad_documental: [
    { label: "Aplica y esta vigente", value: "aplica_vigente", score: 0 },
    {
      label: "Aplica, pero esta incompleto o vencido",
      value: "aplica_observado",
      score: 6,
    },
    { label: "Aplica y no existe", value: "aplica_no_existe", score: 9 },
    { label: "No aplica a este hallazgo", value: "no_aplica", score: 0, marcaNoAplica: true },
    {
      label: "No verificable",
      value: "no_verificable",
      score: 0,
      marcaNoAplica: true,
    },
  ],
};

export const BIBLIOTECAS_PREVENTIVAS_BASE: BibliotecaPreventiva[] = [
  {
    id: "seguridad_trabajadores",
    nombreVisible: "Seguridad de trabajadores",
    ambito: "seguridad_trabajadores",
    subtipos: ["condicion_insegura", "acto_inseguro", "trabajo_critico"],
    controlesEsperados: [
      "Control efectivo de exposicion de personas.",
      "Area segregada cuando exista peligro operacional.",
      "Responsable identificado para corregir la condicion.",
    ],
    documentosAplicables: [
      "Procedimiento de trabajo cuando aplique.",
      "AST/ART o analisis previo de tarea cuando aplique.",
      "Registro de control operacional.",
    ],
    consecuenciasProbables: [
      "Exposicion de trabajadores a lesiones.",
      "Interrupcion preventiva de la actividad.",
      "Necesidad de cierre verificable.",
    ],
    accionesInmediatas: [
      "Restringir o controlar el area expuesta.",
      "Comunicar la condicion al responsable directo.",
      "Implementar control transitorio verificable.",
    ],
    recomendacionesBase: [
      "Regularizar controles antes de continuar la actividad.",
      "Verificar cierre con evidencia y responsable asignado.",
    ],
    normativaProbable: ["Ley 16.744", "DS 44", "DS 594"],
    cuandoAplica: [
      "Existe exposicion real o potencial de trabajadores o terceros.",
      "La condicion puede generar lesion o perdida operacional.",
    ],
    cuandoNoAplica: [
      "El hallazgo corresponde solo a documentacion sin exposicion directa.",
      "La situacion es exclusivamente ambiental o patrimonial.",
    ],
  },
  {
    id: "medio_ambiente",
    nombreVisible: "Medio ambiente",
    ambito: "medio_ambiente",
    subtipos: ["sustancia_peligrosa", "orden_aseo", "otro"],
    controlesEsperados: [
      "Contencion o segregacion de la fuente contaminante.",
      "Disposicion y manejo conforme al tipo de residuo o sustancia.",
      "Respuesta documentada ante derrame, fuga o emision.",
    ],
    documentosAplicables: [
      "Procedimiento ambiental o plan de manejo.",
      "Registro de retiro o disposicion.",
      "HDS cuando existan sustancias peligrosas.",
    ],
    consecuenciasProbables: [
      "Afectacion de suelo, agua, aire o comunidad.",
      "Incumplimiento de control ambiental.",
      "Necesidad de contencion y seguimiento.",
    ],
    accionesInmediatas: [
      "Contener la condicion ambiental observada.",
      "Aislar el material o residuo involucrado.",
      "Informar a responsable ambiental o de terreno.",
    ],
    recomendacionesBase: [
      "Definir medida correctiva con evidencia de cierre.",
      "Reforzar control ambiental y trazabilidad del retiro.",
    ],
    normativaProbable: ["Ley 16.744", "DS 44", "DS 594"],
    cuandoAplica: [
      "El hallazgo involucra derrame, residuo, emision, fuga o afectacion ambiental.",
      "Existe riesgo de impacto a suelo, agua, aire, flora, fauna o comunidad.",
    ],
    cuandoNoAplica: [
      "La condicion corresponde solo a seguridad personal sin impacto ambiental.",
      "No hay elemento ambiental verificable.",
    ],
  },
  {
    id: "dano_material",
    nombreVisible: "Dano material/equipos/infraestructura",
    ambito: "dano_material",
    subtipos: ["equipo_herramienta_mal_estado", "mantencion_certificacion", "otro"],
    controlesEsperados: [
      "Equipo, herramienta o infraestructura en condicion operativa.",
      "Retiro o bloqueo de uso si existe dano relevante.",
      "Mantencion o reparacion trazable.",
    ],
    documentosAplicables: [
      "Registro de inspeccion.",
      "Orden de mantencion o reparacion.",
      "Certificado tecnico cuando aplique.",
    ],
    consecuenciasProbables: [
      "Falla operacional o deterioro progresivo.",
      "Dano a equipos, infraestructura o activos.",
      "Exposicion secundaria de personas si el activo se mantiene en uso.",
    ],
    accionesInmediatas: [
      "Retirar de uso el equipo o elemento danado si corresponde.",
      "Senalizar o restringir el activo observado.",
      "Solicitar evaluacion tecnica.",
    ],
    recomendacionesBase: [
      "Regularizar mantencion antes de uso normal.",
      "Registrar condicion, responsable y fecha de cierre.",
    ],
    normativaProbable: ["Ley 16.744", "DS 44", "DS 594"],
    cuandoAplica: [
      "La observacion se centra en dano, desgaste o falla de un activo.",
      "Existe riesgo de perdida material o continuidad operacional.",
    ],
    cuandoNoAplica: [
      "El hallazgo se centra en una exposicion directa de trabajador.",
      "La condicion es solo documental sin equipo o activo involucrado.",
    ],
  },
  {
    id: "documental_legal",
    nombreVisible: "Gestion documental/legal",
    ambito: "documental_legal",
    subtipos: ["brecha_documental", "incumplimiento_procedimiento"],
    controlesEsperados: [
      "Documento aplicable identificado y vigente.",
      "Registro firmado o difundido cuando corresponda.",
      "Trazabilidad entre actividad, responsable y control preventivo.",
    ],
    documentosAplicables: [
      "Procedimiento o instructivo.",
      "AST/ART, PTS, permiso o autorizacion cuando aplique.",
      "Matriz de riesgos o registro de difusion.",
    ],
    consecuenciasProbables: [
      "Falta de respaldo preventivo ante auditoria.",
      "Actividad sin control documental verificable.",
      "Debilidad en trazabilidad de responsabilidades.",
    ],
    accionesInmediatas: [
      "Solicitar documento vigente o evidencia de aplicacion.",
      "Detener validacion documental si no existe respaldo.",
      "Asignar responsable de regularizacion.",
    ],
    recomendacionesBase: [
      "Regularizar el documento aplicable y verificar difusion.",
      "Mantener evidencia de cierre con fecha, responsable y alcance.",
    ],
    normativaProbable: ["Ley 16.744", "DS 44", "DS 594"],
    cuandoAplica: [
      "La condicion observada depende de procedimiento, permiso, matriz o registro.",
      "El incumplimiento principal es falta, vencimiento o inconsistencia documental.",
    ],
    cuandoNoAplica: [
      "El hallazgo es material simple y no requiere documento especifico.",
      "La pregunta documental no cambia la criticidad ni el cierre.",
    ],
  },
  {
    id: "sustancias_peligrosas_hds",
    nombreVisible: "Sustancias peligrosas y HDS",
    ambito: "medio_ambiente",
    subtipos: ["sustancia_peligrosa", "brecha_documental"],
    controlesEsperados: [
      "Envase certificado, rotulado y compatible.",
      "HDS disponible y vigente.",
      "Contencion secundaria y control de fuentes de ignicion cuando aplique.",
    ],
    documentosAplicables: [
      "Hoja de datos de seguridad.",
      "Registro de almacenamiento o manipulacion.",
      "Procedimiento de respuesta ante derrame.",
    ],
    consecuenciasProbables: [
      "Exposicion quimica o inflamabilidad.",
      "Derrame, fuga o contaminacion.",
      "Respuesta insuficiente ante emergencia quimica.",
    ],
    accionesInmediatas: [
      "Aislar el envase o sustancia observada.",
      "Verificar rotulacion, HDS y contencion.",
      "Retirar envases no certificados o incompatibles.",
    ],
    recomendacionesBase: [
      "Regularizar almacenamiento con HDS y rotulacion visible.",
      "Verificar compatibilidad, contencion y respuesta ante emergencia.",
    ],
    normativaProbable: ["Ley 16.744", "DS 44", "DS 594"],
    cuandoAplica: [
      "Se observa combustible, quimico, solvente, gas, derrame o envase no identificado.",
      "Existe potencial de exposicion, incendio, fuga o impacto ambiental.",
    ],
    cuandoNoAplica: [
      "El hallazgo no involucra sustancia, envase, derrame ni rotulacion.",
    ],
  },
  {
    id: "equipos_emergencia",
    nombreVisible: "Equipos de emergencia",
    ambito: "operacional",
    subtipos: ["equipo_emergencia", "mantencion_certificacion"],
    controlesEsperados: [
      "Equipo disponible, visible y accesible.",
      "Mantencion, vigencia o inspeccion verificable.",
      "Ruta de acceso despejada y senalizada.",
    ],
    documentosAplicables: [
      "Registro de inspeccion.",
      "Certificado o mantencion vigente.",
      "Plan de emergencia cuando aplique.",
    ],
    consecuenciasProbables: [
      "Perdida de capacidad de respuesta ante emergencia.",
      "Retraso en control inicial de incendio o evacuacion.",
      "Debilidad de continuidad operacional.",
    ],
    accionesInmediatas: [
      "Reponer, despejar o retirar de servicio el equipo no operativo.",
      "Informar a responsable de emergencia o mantencion.",
      "Dejar registro de la regularizacion requerida.",
    ],
    recomendacionesBase: [
      "Regularizar vigencia y registrar inspeccion.",
      "Verificar cobertura del area y periodicidad de control.",
    ],
    normativaProbable: ["Ley 16.744", "DS 44", "DS 594"],
    cuandoAplica: [
      "Extintor, alarma, via de evacuacion o equipo de emergencia no disponible, vencido u obstruido.",
      "Existe duda sobre vigencia, acceso o estado operativo del equipo.",
    ],
    cuandoNoAplica: [
      "Existe fuego, humo o emergencia activa, que debe tratarse como emergencia real.",
      "El hallazgo corresponde a otra herramienta operacional sin funcion de emergencia.",
    ],
  },
  {
    id: "transito_transporte",
    nombreVisible: "Transito y transporte",
    ambito: "seguridad_trabajadores",
    subtipos: ["transito_transporte", "condicion_insegura", "mantencion_certificacion"],
    controlesEsperados: [
      "Segregacion entre peatones, equipos y vehiculos.",
      "Rutas, cruces y zonas de transito senalizadas.",
      "Vehiculo o equipo movil en condicion operativa.",
    ],
    documentosAplicables: [
      "Procedimiento de transito interno.",
      "Inspeccion de vehiculo o equipo movil.",
      "Autorizacion de operador cuando aplique.",
    ],
    consecuenciasProbables: [
      "Atropello, colision o caida al mismo nivel.",
      "Dano a equipos o infraestructura.",
      "Interrupcion operacional por circulacion insegura.",
    ],
    accionesInmediatas: [
      "Segregar la zona de transito o restringir circulacion.",
      "Retirar de servicio el equipo movil inseguro.",
      "Informar a supervisor o responsable de transporte.",
    ],
    recomendacionesBase: [
      "Reforzar segregacion, senalizacion y control de rutas.",
      "Verificar inspeccion, autorizacion y estado del equipo.",
    ],
    normativaProbable: ["Ley 16.744", "DS 44", "DS 594"],
    cuandoAplica: [
      "Existe interaccion entre trabajadores, peatones, vehiculos o maquinaria movil.",
      "Se observan rutas, pisos, accesos o vehiculos en condicion insegura.",
    ],
    cuandoNoAplica: [
      "La condicion no involucra desplazamiento, acceso, vehiculo ni circulacion.",
    ],
  },
  {
    id: "electrico_herramientas",
    nombreVisible: "Instalaciones electricas y herramientas",
    ambito: "seguridad_trabajadores",
    subtipos: ["instalacion_electrica", "equipo_herramienta_mal_estado"],
    controlesEsperados: [
      "Equipo o instalacion sin partes energizadas expuestas.",
      "Proteccion, aislacion y enchufes en buen estado.",
      "Retiro de herramientas danadas o reparadas informalmente.",
    ],
    documentosAplicables: [
      "Inspeccion de herramientas y extensiones.",
      "Procedimiento de bloqueo o intervencion cuando aplique.",
      "Registro de mantencion o reparacion autorizada.",
    ],
    consecuenciasProbables: [
      "Contacto electrico o arco electrico.",
      "Incendio por falla o sobrecarga.",
      "Falla de herramienta durante operacion.",
    ],
    accionesInmediatas: [
      "Retirar de uso herramienta o cableado observado.",
      "Aislar tablero, extension o punto energizado inseguro.",
      "Solicitar revision por personal competente.",
    ],
    recomendacionesBase: [
      "Regularizar proteccion, aislacion y mantencion.",
      "Reforzar inspecciones antes de uso y retiro de equipos defectuosos.",
    ],
    normativaProbable: ["Ley 16.744", "DS 44", "DS 594"],
    cuandoAplica: [
      "Se observa tablero, cable, enchufe, extension, herramienta electrica o punto energizado.",
      "Existe dano, reparacion improvisada, falta de proteccion o exposicion electrica.",
    ],
    cuandoNoAplica: [
      "La herramienta no es electrica y no existe fuente de energia asociada.",
    ],
  },
  {
    id: "orden_aseo",
    nombreVisible: "Orden y aseo",
    ambito: "operacional",
    subtipos: ["orden_aseo", "condicion_insegura"],
    controlesEsperados: [
      "Areas de trabajo y transito despejadas.",
      "Materiales almacenados de forma estable y segura.",
      "Retiro oportuno de residuos, objetos punzantes o tropiezos.",
    ],
    documentosAplicables: [
      "Registro de inspeccion de area.",
      "Programa de orden y aseo cuando aplique.",
      "Instruccion de almacenamiento o segregacion.",
    ],
    consecuenciasProbables: [
      "Caida al mismo nivel, golpe o corte.",
      "Obstruccion de rutas de evacuacion o trabajo.",
      "Deterioro de condiciones sanitarias u operacionales.",
    ],
    accionesInmediatas: [
      "Retirar el elemento que genera exposicion.",
      "Ordenar, segregar o limpiar el area afectada.",
      "Delimitar si el retiro no puede ejecutarse de inmediato.",
    ],
    recomendacionesBase: [
      "Implementar control de orden y aseo con responsable asignado.",
      "Verificar cierre con evidencia del area normalizada.",
    ],
    normativaProbable: ["Ley 16.744", "DS 44", "DS 594"],
    cuandoAplica: [
      "Existe material fuera de lugar, residuo, objeto punzante, derrame menor o acceso obstruido.",
      "La condicion puede generar tropiezo, caida, corte o desorden operacional.",
    ],
    cuandoNoAplica: [
      "La condicion principal corresponde a equipo critico, sustancia peligrosa o documento faltante.",
    ],
  },
  {
    id: "trabajos_criticos",
    nombreVisible: "Trabajos criticos",
    ambito: "seguridad_trabajadores",
    subtipos: ["trabajo_critico", "incumplimiento_procedimiento"],
    controlesEsperados: [
      "Permiso, autorizacion o control critico vigente.",
      "Analisis de riesgos previo y difundido.",
      "Controles de exclusion, bloqueo, segregacion o rescate cuando aplique.",
    ],
    documentosAplicables: [
      "PTS o permiso de trabajo.",
      "AST/ART y matriz de riesgos.",
      "Registro de autorizacion o competencia.",
    ],
    consecuenciasProbables: [
      "Accidente grave o fatal.",
      "Exposicion a energia, altura, izaje, excavacion o espacio confinado.",
      "Incumplimiento de controles criticos.",
    ],
    accionesInmediatas: [
      "Detener o restringir la tarea si faltan controles criticos.",
      "Verificar permiso, autorizacion y responsables.",
      "Implementar control inmediato antes de continuar.",
    ],
    recomendacionesBase: [
      "Cerrar brecha documental y operacional antes de reiniciar.",
      "Validar controles criticos con evidencia y supervision.",
    ],
    normativaProbable: ["Ley 16.744", "DS 44", "DS 594"],
    cuandoAplica: [
      "Altura, excavacion, izaje, espacio confinado, energia, bloqueo, trabajo en caliente u otra tarea critica.",
      "La actividad requiere autorizacion o controles criticos previos.",
    ],
    cuandoNoAplica: [
      "La condicion es simple, sin exposicion critica ni tarea de alto riesgo.",
    ],
  },
  {
    id: "epp",
    nombreVisible: "Elementos de proteccion personal",
    ambito: "seguridad_trabajadores",
    subtipos: ["epp", "condicion_insegura"],
    controlesEsperados: [
      "EPP disponible, adecuado al riesgo y en buen estado.",
      "Uso correcto durante la tarea.",
      "Reposicion o retiro de EPP deteriorado.",
    ],
    documentosAplicables: [
      "Matriz de EPP o analisis de riesgo.",
      "Registro de entrega cuando aplique.",
      "Procedimiento o instructivo de uso.",
    ],
    consecuenciasProbables: [
      "Exposicion directa a agente mecanico, quimico, fisico o biologico.",
      "Reduccion de barrera de proteccion personal.",
      "Necesidad de reposicion inmediata.",
    ],
    accionesInmediatas: [
      "Corregir uso o reemplazar EPP defectuoso.",
      "Restringir tarea si el EPP requerido no esta disponible.",
      "Informar al responsable de abastecimiento o supervision.",
    ],
    recomendacionesBase: [
      "Verificar pertinencia, estado y disponibilidad del EPP.",
      "Reforzar control operacional y registro cuando aplique.",
    ],
    normativaProbable: ["Ley 16.744", "DS 44", "DS 594"],
    cuandoAplica: [
      "La observacion involucra ausencia, mal uso o deterioro de EPP.",
      "El control personal es barrera necesaria frente al riesgo.",
    ],
    cuandoNoAplica: [
      "La condicion debe resolverse con control de ingenieria o segregacion, no solo EPP.",
    ],
  },
  {
    id: "mantencion_certificacion",
    nombreVisible: "Mantencion y certificacion",
    ambito: "operacional",
    subtipos: ["mantencion_certificacion", "equipo_herramienta_mal_estado"],
    controlesEsperados: [
      "Mantencion vigente y trazable.",
      "Certificacion o inspeccion cuando el equipo lo requiera.",
      "Retiro de uso ante vencimiento o falla verificable.",
    ],
    documentosAplicables: [
      "Registro de mantencion.",
      "Certificado vigente.",
      "Checklist o inspeccion preuso.",
    ],
    consecuenciasProbables: [
      "Falla operacional por equipo vencido o sin mantencion.",
      "Exposicion de personas por funcionamiento inseguro.",
      "Observacion documental ante auditoria.",
    ],
    accionesInmediatas: [
      "Verificar vigencia antes de uso.",
      "Retirar o bloquear el equipo sin respaldo vigente.",
      "Asignar responsable de regularizacion.",
    ],
    recomendacionesBase: [
      "Actualizar plan de mantencion y evidencia de cumplimiento.",
      "Controlar vencimientos antes de liberar equipos a terreno.",
    ],
    normativaProbable: ["Ley 16.744", "DS 44", "DS 594"],
    cuandoAplica: [
      "Equipo, vehiculo, herramienta, extintor o infraestructura requiere mantencion o certificacion.",
      "Se observa vencimiento, dano, falta de respaldo o inspeccion pendiente.",
    ],
    cuandoNoAplica: [
      "El hallazgo no depende de estado tecnico, vigencia ni certificado.",
    ],
  },
  {
    id: "capacitacion_difusion",
    nombreVisible: "Capacitacion y difusion",
    ambito: "documental_legal",
    subtipos: ["capacitacion_difusion", "brecha_documental"],
    controlesEsperados: [
      "Registro de capacitacion o charla con participantes identificados.",
      "Contenido asociado al riesgo o tarea observada.",
      "Firma, fecha y responsable verificables.",
    ],
    documentosAplicables: [
      "Registro de charla o capacitacion.",
      "Induccion, difusion de procedimiento o instructivo.",
      "Evidencia de asistencia y evaluacion cuando aplique.",
    ],
    consecuenciasProbables: [
      "Debilidad de trazabilidad de competencias o difusion.",
      "Trabajadores sin respaldo de informacion preventiva.",
      "Inconsistencia documental ante auditoria.",
    ],
    accionesInmediatas: [
      "Solicitar registro de difusion o capacitacion.",
      "Regularizar firma, alcance o contenido si corresponde.",
      "Reforzar instruccion antes de continuar tarea critica.",
    ],
    recomendacionesBase: [
      "Alinear registros de difusion con riesgos reales de la tarea.",
      "Mantener evidencia verificable de participantes, fecha y contenido.",
    ],
    normativaProbable: ["Ley 16.744", "DS 44", "DS 594"],
    cuandoAplica: [
      "El hallazgo trata sobre charla, induccion, difusion o capacitacion faltante/incompleta.",
      "La evidencia de instruccion es necesaria para el control preventivo.",
    ],
    cuandoNoAplica: [
      "La condicion observada se corrige fisicamente y la capacitacion no modifica el cierre.",
    ],
  },
  {
    id: "evidencias_registros",
    nombreVisible: "Evidencias y registros",
    ambito: "documental_legal",
    subtipos: ["evidencia_registro", "brecha_documental"],
    controlesEsperados: [
      "Fotografia o registro que respalde la condicion.",
      "Fecha, responsable y ubicacion trazables.",
      "Evidencia de correccion para cierre.",
    ],
    documentosAplicables: [
      "Registro fotografico.",
      "Acta, checklist o evidencia de cierre.",
      "Coordenadas o trazabilidad de ubicacion cuando aplique.",
    ],
    consecuenciasProbables: [
      "Debilidad para comprobar hallazgo o cierre.",
      "Dificultad de seguimiento por falta de respaldo.",
      "Riesgo de cierre no verificable.",
    ],
    accionesInmediatas: [
      "Capturar evidencia minima del hallazgo.",
      "Registrar responsable y ubicacion disponible.",
      "Solicitar respaldo adicional si la evidencia es insuficiente.",
    ],
    recomendacionesBase: [
      "Mantener evidencia clara antes y despues de la correccion.",
      "Asegurar trazabilidad de fecha, ubicacion y responsable.",
    ],
    normativaProbable: ["Ley 16.744", "DS 44", "DS 594"],
    cuandoAplica: [
      "La evidencia disponible es insuficiente, parcial o necesaria para auditoria.",
      "El cierre requiere respaldo verificable.",
    ],
    cuandoNoAplica: [
      "Existe evidencia suficiente y el problema principal esta en el control operativo.",
    ],
  },
];

export const BIBLIOTECAS_PREVENTIVAS_POR_ID =
  BIBLIOTECAS_PREVENTIVAS_BASE.reduce(
    (bibliotecas, biblioteca) => ({
      ...bibliotecas,
      [biblioteca.id]: biblioteca,
    }),
    {} as Record<BibliotecaPreventivaId, BibliotecaPreventiva>,
  );

export function obtenerOpcionesPreventivas(
  tipoRespuesta: TipoRespuestaPreventiva,
): OpcionPreventiva[] {
  return OPCIONES_PREVENTIVAS_POR_TIPO[tipoRespuesta];
}

export function obtenerBibliotecaPreventiva(
  id: BibliotecaPreventivaId,
): BibliotecaPreventiva {
  return BIBLIOTECAS_PREVENTIVAS_POR_ID[id];
}
