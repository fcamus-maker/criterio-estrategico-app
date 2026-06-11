import type {
  ConfianzaClasificacionV2,
  ModuloPreguntasV2,
  PreguntaSugeridaMotorV2,
} from "./types";

const pregunta = (
  modulo: ModuloPreguntasV2,
  id: string,
  texto: string,
  objetivo: string
): PreguntaSugeridaMotorV2 => ({
  id,
  modulo,
  texto,
  objetivo,
});

const generales = [
  pregunta("otro_indeterminado", "general-001", "El hallazgo corresponde principalmente a seguridad, ambiente, salud o documentacion?", "Clasificar ambito dominante."),
  pregunta("otro_indeterminado", "general-002", "Hay personas expuestas actualmente?", "Determinar exposicion de personas."),
  pregunta("otro_indeterminado", "general-003", "Existe afectacion o riesgo ambiental?", "Descartar o activar modulo ambiental."),
  pregunta("otro_indeterminado", "general-004", "Existe falta documental que habilite una actividad riesgosa?", "Separar brecha documental de riesgo activo."),
  pregunta("otro_indeterminado", "general-005", "Que control inmediato puede aplicarse ahora?", "Definir accion preventiva inicial."),
];

const confirmacion = [
  pregunta("otro_indeterminado", "confirmacion-001", "La descripcion confirma este tipo de hallazgo o podria corresponder a otro modulo?", "Validar clasificacion con confianza media."),
  pregunta("otro_indeterminado", "confirmacion-002", "Que senal concreta elevaria la criticidad?", "Evitar elevaciones automaticas sin evidencia."),
];

export const PREGUNTAS_ADAPTATIVAS_V2: Partial<
  Record<ModuloPreguntasV2, PreguntaSugeridaMotorV2[]>
> = {
  orden_aseo_objeto_fuera_lugar: [
    pregunta("orden_aseo_objeto_fuera_lugar", "orden-001", "El objeto obstruye una zona de transito?", "Diferenciar orden menor de obstruccion operacional."),
    pregunta("orden_aseo_objeto_fuera_lugar", "orden-002", "Esta en una via de evacuacion o salida de emergencia?", "Escalar si afecta evacuacion."),
    pregunta("orden_aseo_objeto_fuera_lugar", "orden-003", "Existe exposicion directa de personas?", "Determinar potencial de dano real."),
    pregunta("orden_aseo_objeto_fuera_lugar", "orden-004", "Puede generar caida al mismo nivel?", "Evaluar tropiezo o caida simple."),
    pregunta("orden_aseo_objeto_fuera_lugar", "orden-005", "Se puede retirar de inmediato?", "Definir cierre simple o accion correctiva."),
    pregunta("orden_aseo_objeto_fuera_lugar", "orden-006", "Es un objeto sospechoso o de seguridad patrimonial?", "Separar seguridad patrimonial de orden y aseo."),
  ],
  transito_caida_mismo_nivel: [
    pregunta("transito_caida_mismo_nivel", "transito-001", "La zona tiene transito activo de personas?", "Medir exposicion operacional."),
    pregunta("transito_caida_mismo_nivel", "transito-002", "La condicion puede provocar tropiezo o resbalon?", "Confirmar peligro de caida al mismo nivel."),
    pregunta("transito_caida_mismo_nivel", "transito-003", "Existe senalizacion o barrera suficiente?", "Evaluar control visible."),
    pregunta("transito_caida_mismo_nivel", "transito-004", "Puede corregirse de inmediato?", "Definir accion de retiro, limpieza o demarcacion."),
  ],
  caida_altura: [
    pregunta("caida_altura", "altura-001", "Hay trabajo en altura, borde abierto o plataforma elevada?", "Confirmar exposicion a altura."),
    pregunta("caida_altura", "altura-002", "Existe arnes, linea de vida, baranda o proteccion colectiva?", "Verificar control critico."),
    pregunta("caida_altura", "altura-003", "Hay personas expuestas actualmente?", "Determinar suspension inmediata."),
    pregunta("caida_altura", "altura-004", "La actividad esta en ejecucion?", "Separar hallazgo documental de riesgo activo."),
    pregunta("caida_altura", "altura-005", "Debe detenerse la actividad hasta controlar la condicion?", "Definir decision operacional."),
  ],
  electrico: [
    pregunta("electrico", "electrico-001", "El elemento esta energizado?", "Confirmar energia peligrosa."),
    pregunta("electrico", "electrico-002", "Hay conductor expuesto, tablero abierto o enchufe dañado?", "Detectar contacto directo."),
    pregunta("electrico", "electrico-003", "Hay personas expuestas o transito cercano?", "Medir exposicion real."),
    pregunta("electrico", "electrico-004", "Se requiere aislar, bloquear o desenergizar?", "Definir control inmediato."),
    pregunta("electrico", "electrico-005", "Existe responsable electrico competente para intervenir?", "Evitar intervencion no autorizada."),
  ],
  maquinaria_equipos: [
    pregunta("maquinaria_equipos", "maquina-001", "Existe parte movil expuesta?", "Confirmar atrapamiento o corte."),
    pregunta("maquinaria_equipos", "maquina-002", "El resguardo esta ausente, intervenido o dañado?", "Verificar control critico."),
    pregunta("maquinaria_equipos", "maquina-003", "La maquina estaba operando?", "Medir exposicion activa."),
    pregunta("maquinaria_equipos", "maquina-004", "Debe bloquearse o detenerse el equipo?", "Definir accion inmediata."),
  ],
  herramientas_equipos: [
    pregunta("herramientas_equipos", "herramienta-001", "La herramienta o equipo esta defectuoso?", "Confirmar condicion subestandar."),
    pregunta("herramientas_equipos", "herramienta-002", "Se estaba usando al momento del hallazgo?", "Medir exposicion activa."),
    pregunta("herramientas_equipos", "herramienta-003", "Existe proteccion, guarda o mantencion vigente?", "Verificar control."),
    pregunta("herramientas_equipos", "herramienta-004", "Debe retirarse de servicio?", "Definir accion inmediata."),
  ],
  izaje_carga_suspendida: [
    pregunta("izaje_carga_suspendida", "izaje-001", "Hay carga suspendida sobre personas o transito?", "Confirmar exposicion critica."),
    pregunta("izaje_carga_suspendida", "izaje-002", "Los aparejos estan certificados y en buen estado?", "Evaluar control operacional."),
    pregunta("izaje_carga_suspendida", "izaje-003", "Existe rigger, plan de izaje y zona segregada?", "Verificar barreras."),
    pregunta("izaje_carga_suspendida", "izaje-004", "La maniobra debe detenerse?", "Definir suspension."),
  ],
  excavaciones: [
    pregunta("excavaciones", "excavacion-001", "La excavacion o zanja tiene profundidad relevante?", "Confirmar potencial de colapso."),
    pregunta("excavaciones", "excavacion-002", "Existe entibacion, talud seguro o barrera?", "Verificar control critico."),
    pregunta("excavaciones", "excavacion-003", "Hay personas dentro o al borde?", "Medir exposicion real."),
    pregunta("excavaciones", "excavacion-004", "Existen servicios enterrados o energia cercana?", "Detectar riesgos combinados."),
  ],
  espacios_confinados: [
    pregunta("espacios_confinados", "confinado-001", "Se trata de un espacio confinado o atmosfera potencialmente peligrosa?", "Confirmar familia critica."),
    pregunta("espacios_confinados", "confinado-002", "Existe medicion de gases vigente?", "Validar control critico."),
    pregunta("espacios_confinados", "confinado-003", "Hay permiso, vigia y plan de rescate?", "Verificar controles obligatorios."),
    pregunta("espacios_confinados", "confinado-004", "Hay ingreso de personas en ejecucion?", "Definir suspension inmediata."),
  ],
  sustancias_peligrosas: [
    pregunta("sustancias_peligrosas", "sustancia-001", "La sustancia esta identificada y rotulada?", "Confirmar control documental-operacional."),
    pregunta("sustancias_peligrosas", "sustancia-002", "Existe fuga, derrame o envase dañado?", "Detectar liberacion."),
    pregunta("sustancias_peligrosas", "sustancia-003", "Hay exposicion de personas?", "Evaluar salud y seguridad."),
    pregunta("sustancias_peligrosas", "sustancia-004", "El almacenamiento es compatible?", "Revisar segregacion quimica."),
    pregunta("sustancias_peligrosas", "sustancia-005", "Existe HDS/SDS disponible?", "Preparar revision tecnica."),
  ],
  derrame_fuga: [
    pregunta("derrame_fuga", "derrame-001", "Que sustancia se derramo?", "Identificar peligro de la sustancia."),
    pregunta("derrame_fuga", "derrame-002", "El derrame esta contenido?", "Separar aspecto controlado de impacto."),
    pregunta("derrame_fuga", "derrame-003", "Cual es el volumen aproximado?", "Dimensionar respuesta y escalamiento."),
    pregunta("derrame_fuga", "derrame-004", "Llego a suelo, agua o alcantarillado?", "Detectar medio receptor."),
    pregunta("derrame_fuga", "derrame-005", "Hay exposicion de personas?", "Evaluar salud y seguridad."),
    pregunta("derrame_fuga", "derrame-006", "Requiere contencion ambiental o notificacion?", "Definir accion inmediata."),
    pregunta("derrame_fuga", "derrame-007", "Se genero residuo contaminado?", "Activar gestion de residuos."),
  ],
  residuos: [
    pregunta("residuos", "residuo-001", "El residuo esta segregado correctamente?", "Evaluar gestion de residuos."),
    pregunta("residuos", "residuo-002", "Es residuo peligroso o contaminado?", "Distinguir exigencia ambiental."),
    pregunta("residuos", "residuo-003", "Existe contenedor identificado y cerrado?", "Verificar control operativo."),
    pregunta("residuos", "residuo-004", "Hay fuga, derrame o exposicion?", "Detectar escalamiento."),
  ],
  emisiones_polvo_humos: [
    pregunta("emisiones_polvo_humos", "emision-001", "Que agente se emite: polvo, humo, gas o material particulado?", "Identificar agente."),
    pregunta("emisiones_polvo_humos", "emision-002", "Hay trabajadores o comunidad expuestos?", "Medir alcance."),
    pregunta("emisiones_polvo_humos", "emision-003", "Existe control de ventilacion, humectacion o captacion?", "Verificar control."),
    pregunta("emisiones_polvo_humos", "emision-004", "Se requiere medicion o escalamiento ambiental?", "Evitar conclusion sin soporte tecnico."),
  ],
  ruido_agentes_fisicos: [
    pregunta("ruido_agentes_fisicos", "fisico-001", "Que agente fisico esta presente?", "Separar ruido, vibracion, calor, frio o radiacion."),
    pregunta("ruido_agentes_fisicos", "fisico-002", "Hay trabajadores expuestos actualmente?", "Medir exposicion directa."),
    pregunta("ruido_agentes_fisicos", "fisico-003", "Existe EPP o control de ingenieria?", "Verificar barreras."),
    pregunta("ruido_agentes_fisicos", "fisico-004", "Se requiere medicion tecnica?", "Evitar conclusion normativa sin medicion."),
  ],
  exposicion_quimica: [
    pregunta("exposicion_quimica", "quimica-001", "Que sustancia o agente quimico esta presente?", "Identificar peligro."),
    pregunta("exposicion_quimica", "quimica-002", "La exposicion es inhalatoria, dermica u ocular?", "Caracterizar via de exposicion."),
    pregunta("exposicion_quimica", "quimica-003", "Existe ventilacion, contencion o EPP suficiente?", "Verificar controles."),
    pregunta("exposicion_quimica", "quimica-004", "Se requiere aislar el area o detener la actividad?", "Definir accion inmediata."),
  ],
  exposicion_biologica: [
    pregunta("exposicion_biologica", "biologica-001", "Que agente biologico o fuente contaminante esta presente?", "Identificar peligro."),
    pregunta("exposicion_biologica", "biologica-002", "Hay contacto directo o salpicadura?", "Medir exposicion."),
    pregunta("exposicion_biologica", "biologica-003", "Existe higiene, contencion y EPP suficiente?", "Verificar controles."),
    pregunta("exposicion_biologica", "biologica-004", "Se requiere limpieza especializada o aislamiento?", "Definir accion inmediata."),
  ],
  incendio_emergencia: [
    pregunta("incendio_emergencia", "emergencia-001", "Existe fuego, humo o fuente de ignicion activa?", "Distinguir emergencia real de condicion preventiva."),
    pregunta("incendio_emergencia", "emergencia-002", "El equipo de emergencia esta disponible?", "Verificar control de respuesta."),
    pregunta("incendio_emergencia", "emergencia-003", "Hay material combustible cercano?", "Evaluar potencial de escalamiento."),
    pregunta("incendio_emergencia", "emergencia-004", "Se requiere activar protocolo de emergencia?", "Definir escalamiento."),
  ],
  evacuacion: [
    pregunta("evacuacion", "evacuacion-001", "La ruta o salida esta efectivamente bloqueada?", "Confirmar afectacion de evacuacion."),
    pregunta("evacuacion", "evacuacion-002", "Existe ruta alternativa senalizada?", "Evaluar control compensatorio."),
    pregunta("evacuacion", "evacuacion-003", "Hay ocupantes o transito actual?", "Medir exposicion."),
    pregunta("evacuacion", "evacuacion-004", "Debe retirarse el obstaculo de inmediato?", "Definir accion inmediata."),
  ],
  senalizacion: [
    pregunta("senalizacion", "senal-001", "Que peligro debia estar senalizado?", "Diferenciar senalizacion menor de control critico."),
    pregunta("senalizacion", "senal-002", "La ausencia de senalizacion expone a personas?", "Medir relevancia preventiva."),
    pregunta("senalizacion", "senal-003", "Existe demarcacion o barrera alternativa?", "Verificar control compensatorio."),
  ],
  elementos_proteccion_personal: [
    pregunta("elementos_proteccion_personal", "epp-001", "Que EPP falta o es insuficiente?", "Identificar barrera faltante."),
    pregunta("elementos_proteccion_personal", "epp-002", "La actividad estaba en ejecucion?", "Medir riesgo activo."),
    pregunta("elementos_proteccion_personal", "epp-003", "El EPP faltante protege contra riesgo grave o fatal?", "Determinar escalamiento."),
    pregunta("elementos_proteccion_personal", "epp-004", "Debe detenerse la actividad hasta disponer del EPP?", "Definir accion inmediata."),
  ],
  procedimientos_ast_permisos: [
    pregunta("procedimientos_ast_permisos", "procedimiento-001", "Que documento o permiso falta?", "Identificar brecha concreta."),
    pregunta("procedimientos_ast_permisos", "procedimiento-002", "La actividad critica esta en ejecucion?", "Diferenciar brecha documental de riesgo activo."),
    pregunta("procedimientos_ast_permisos", "procedimiento-003", "Hay personas expuestas al peligro operacional?", "Medir exposicion real."),
    pregunta("procedimientos_ast_permisos", "procedimiento-004", "Debe suspenderse hasta regularizar AST/PTS/permiso?", "Definir control inmediato."),
    pregunta("procedimientos_ast_permisos", "procedimiento-005", "Existe control alternativo validado?", "Evitar suspension automatica si hay control equivalente."),
  ],
  induccion_capacitacion_autorizacion: [
    pregunta("induccion_capacitacion_autorizacion", "competencia-001", "Que induccion, capacitacion o autorizacion falta?", "Identificar brecha de competencia."),
    pregunta("induccion_capacitacion_autorizacion", "competencia-002", "La persona ejecuta una tarea critica?", "Determinar severidad."),
    pregunta("induccion_capacitacion_autorizacion", "competencia-003", "Existe supervisor competente controlando la tarea?", "Evaluar control compensatorio."),
  ],
  documentos_legales_preventivos: [
    pregunta("documentos_legales_preventivos", "documento-001", "Que registro, matriz o documento preventivo falta?", "Identificar brecha documental."),
    pregunta("documentos_legales_preventivos", "documento-002", "Ese documento habilita una actividad en ejecucion?", "Evitar escalar documentos pasivos."),
    pregunta("documentos_legales_preventivos", "documento-003", "Existe impacto operacional por la falta documental?", "Evaluar criticidad real."),
  ],
  legal_documental: [
    pregunta("legal_documental", "legal-001", "Que documento falta?", "Identificar brecha documental concreta."),
    pregunta("legal_documental", "legal-002", "La falta documental habilita una actividad riesgosa en ejecucion?", "Diferenciar papel faltante de riesgo activo."),
    pregunta("legal_documental", "legal-003", "Existe exposicion directa?", "Determinar severidad real."),
    pregunta("legal_documental", "legal-004", "La actividad debe detenerse hasta regularizar?", "Definir control operacional."),
  ],
  aspectos_ambientales: [
    pregunta("aspectos_ambientales", "aspecto-001", "Que aspecto ambiental esta presente?", "Identificar fuente ambiental."),
    pregunta("aspectos_ambientales", "aspecto-002", "Existe medio receptor cercano?", "Evaluar potencial de impacto."),
    pregunta("aspectos_ambientales", "aspecto-003", "El aspecto esta controlado?", "Separar controlado de no controlado."),
  ],
  impactos_ambientales_reales: [
    pregunta("impactos_ambientales_reales", "impacto-001", "Que medio receptor fue afectado?", "Confirmar impacto real."),
    pregunta("impactos_ambientales_reales", "impacto-002", "El impacto esta contenido o sigue activo?", "Definir contencion."),
    pregunta("impactos_ambientales_reales", "impacto-003", "Requiere notificacion o escalamiento ambiental?", "Preparar respuesta formal."),
  ],
  ambiental_general: [
    pregunta("ambiental_general", "ambiental-001", "Existe aspecto ambiental real?", "Confirmar materia ambiental."),
    pregunta("ambiental_general", "ambiental-002", "Hay impacto sobre suelo, agua, aire, flora o fauna?", "Determinar medio receptor."),
    pregunta("ambiental_general", "ambiental-003", "Afecta comunidad o terceros?", "Evaluar escalamiento."),
    pregunta("ambiental_general", "ambiental-004", "Requiere notificacion interna o externa?", "Preparar decision posterior."),
  ],
  comunidad_terceros: [
    pregunta("comunidad_terceros", "comunidad-001", "Existe afectacion o reclamo de comunidad/terceros?", "Confirmar alcance externo."),
    pregunta("comunidad_terceros", "comunidad-002", "La condicion sigue activa?", "Definir urgencia."),
    pregunta("comunidad_terceros", "comunidad-003", "Se requiere comunicacion o escalamiento?", "Preparar gestion ejecutiva."),
  ],
  rca_permisos_ambientales: [
    pregunta("rca_permisos_ambientales", "rca-001", "Existe RCA, PAS o permiso ambiental asociado?", "Identificar instrumento aplicable."),
    pregunta("rca_permisos_ambientales", "rca-002", "La condicion incumple un compromiso especifico?", "Separar sospecha de incumplimiento."),
    pregunta("rca_permisos_ambientales", "rca-003", "Hay impacto ambiental real o riesgo de notificacion?", "Determinar escalamiento."),
  ],
  condiciones_sanitarias_ambientales: [
    pregunta("condiciones_sanitarias_ambientales", "sanitaria-001", "Que condicion sanitaria o ambiental basica esta afectada?", "Identificar condicion."),
    pregunta("condiciones_sanitarias_ambientales", "sanitaria-002", "A cuantas personas afecta?", "Dimensionar severidad."),
    pregunta("condiciones_sanitarias_ambientales", "sanitaria-003", "Existe alternativa o control temporal?", "Definir accion inmediata."),
  ],
  conductas_inseguras: [
    pregunta("conductas_inseguras", "conducta-001", "Que conducta insegura se observo?", "Identificar acto subestandar."),
    pregunta("conductas_inseguras", "conducta-002", "La conducta estaba ocurriendo en ese momento?", "Medir riesgo activo."),
    pregunta("conductas_inseguras", "conducta-003", "Que peligro estaba asociado?", "Relacionar conducta con consecuencia."),
  ],
  condiciones_subestandar: [
    pregunta("condiciones_subestandar", "condicion-001", "Que condicion subestandar esta presente?", "Identificar desviacion."),
    pregunta("condiciones_subestandar", "condicion-002", "Hay exposicion de personas o ambiente?", "Medir alcance."),
    pregunta("condiciones_subestandar", "condicion-003", "Existen controles suficientes?", "Evaluar barreras."),
  ],
  casi_accidentes: [
    pregunta("casi_accidentes", "casi-001", "Que evento estuvo cerca de ocurrir?", "Caracterizar near miss."),
    pregunta("casi_accidentes", "casi-002", "Cual era la consecuencia potencial razonable?", "Determinar severidad potencial."),
    pregunta("casi_accidentes", "casi-003", "Puede repetirse de inmediato?", "Evaluar urgencia."),
  ],
  incidentes_con_sin_lesion: [
    pregunta("incidentes_con_sin_lesion", "incidente-001", "Hubo lesion, dano o atencion medica?", "Clasificar incidente."),
    pregunta("incidentes_con_sin_lesion", "incidente-002", "Cual fue la consecuencia real y potencial?", "Determinar criticidad."),
    pregunta("incidentes_con_sin_lesion", "incidente-003", "El evento sigue generando exposicion?", "Definir control inmediato."),
  ],
  mixto_seguridad_ambiente_legal: [
    pregunta("mixto_seguridad_ambiente_legal", "mixto-001", "Que ambitos estan involucrados: seguridad, ambiente, salud o legal?", "Separar submodulos."),
    pregunta("mixto_seguridad_ambiente_legal", "mixto-002", "Existe senal critica de seguridad o impacto ambiental real?", "Definir criticidad maxima."),
    pregunta("mixto_seguridad_ambiente_legal", "mixto-003", "Que control inmediato atiende primero la mayor exposicion?", "Priorizar accion."),
  ],
  otro_indeterminado: generales,
};

export function obtenerPreguntasAdaptativasV2(
  modulo: ModuloPreguntasV2,
  confianza: ConfianzaClasificacionV2 = "alta",
  limite = 7
): PreguntaSugeridaMotorV2[] {
  if (confianza === "baja") return generales.slice(0, limite);

  const especificas = PREGUNTAS_ADAPTATIVAS_V2[modulo] || generales;
  const preguntas =
    confianza === "media"
      ? [...especificas, ...confirmacion]
      : especificas;

  const unicas = preguntas.filter(
    (item, index, lista) => lista.findIndex((preguntaItem) => preguntaItem.id === item.id) === index
  );

  return unicas.slice(0, limite);
}
