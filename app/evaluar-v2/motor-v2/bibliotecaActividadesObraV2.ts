import type {
  CriticidadOrientativaTaxonomia,
  DesviacionPreventivaId,
  FamiliaTaxonomiaPreventivaId,
} from "./taxonomiaPreventivaV2";

export type ActividadObraId =
  | "instalacion_faena_cierres_accesos"
  | "excavaciones_movimiento_tierra"
  | "fundaciones_cimientos"
  | "moldajes_descimbre"
  | "enfierradura"
  | "hormigonado"
  | "estructuras_metalicas_iniciales"
  | "andamios_plataformas_trabajo"
  | "trabajo_altura_lineas_vida_bordes_aberturas"
  | "techumbres_cubiertas_paneles_tejas"
  | "canaletas_bajadas_agua_remates_exteriores"
  | "montaje_vigas_cerchas_elementos_altura"
  | "instalacion_luminarias_altura"
  | "escaleras_plataformas_elevadoras_accesos_temporales"
  | "electricidad_provisoria_faena"
  | "electricidad_definitiva_canalizaciones_tableros"
  | "gasfiteria_redes_agua_potable_alcantarillado"
  | "redes_sanitarias_bajadas_agua_drenajes"
  | "climatizacion_ductos_ventilacion"
  | "pruebas_presion_fugas_puesta_servicio"
  | "canalizaciones_perforaciones_pasadas_muros_losas"
  | "pintura_interior_exterior_esmaltes_barnices"
  | "empaste_lijado_preparacion_superficies"
  | "sellos_silicona_impermeabilizacion_juntas"
  | "pisos_ceramicas_revestimientos_porcelanato"
  | "puertas_ventanas_marcos_quincalleria"
  | "vidrios_espejos_paneles_fragiles"
  | "terminaciones_menores_reparaciones_acabados_finales"
  | "maquinaria_equipos_moviles_operacion_terreno"
  | "vehiculos_transporte_interno_trabajadores_materiales"
  | "carguio_descarga_materiales_camiones_acopios"
  | "izaje_gruas_elementos_amarre_carga_suspendida"
  | "bodegas_acopios_almacenamiento_materiales"
  | "logistica_interna_rutas_circulacion_interaccion_peaton_equipo"
  | "mantencion_inspeccion_preoperacional_equipos_moviles"
  | "sustancias_peligrosas_hds_rotulacion_almacenamiento"
  | "combustibles_inflamables_trasvasije_envases"
  | "residuos_peligrosos_no_peligrosos_segregacion_disposicion"
  | "derrames_contencion_limpieza_suelo_agua"
  | "emergencias_equipos_respuesta_extintores_red_humeda_kit_derrame"
  | "bodegas_quimicos_compatibilidad_control_acceso"
  | "control_ambiental_obra_polvo_ruido_emisiones_escorrentias";

export type TipoRiesgoActividadObra =
  | "seguridad_personas"
  | "trabajo_critico"
  | "operacional"
  | "documental"
  | "ambiental"
  | "salud_ocupacional"
  | "dano_material";

export type RiesgoInherenteActividadObra = {
  id: string;
  titulo: string;
  descripcionTecnica: string;
  palabrasClave: string[];
  tipoRiesgo: TipoRiesgoActividadObra;
  actoInseguroAsociado: string;
  condicionInseguraAsociada: string;
  objetoPrincipal: string;
  condicionObservada: string;
  exposicion: string;
  consecuenciaProbable: string;
  controlFaltanteOFallido: string;
  controlesEsperados: string[];
  accionInmediataSugerida: string;
  documentosAplicables: string[];
  documentosNoAplicables: string[];
  familiasPreventivas: FamiliaTaxonomiaPreventivaId[];
  desviacionesPreventivas: DesviacionPreventivaId[];
  criticidadOrientativa: CriticidadOrientativaTaxonomia;
  preguntasSugeridas: string[];
  preguntasProhibidas: string[];
  errorQueDebeEvitar: string;
};

export type ActividadObraPreventiva = {
  id: ActividadObraId;
  nombreVisible: string;
  descripcionActividad: string;
  etapaObra: string;
  palabrasClaveActividad: string[];
  familiasPreventivasRelacionadas: FamiliaTaxonomiaPreventivaId[];
  desviacionesFrecuentes: DesviacionPreventivaId[];
  documentosFrecuentesAplicables: string[];
  documentosQueNoAplicanPorDefecto: string[];
  riesgosInherentes: RiesgoInherenteActividadObra[];
  preguntasEstrategicasSugeridas: string[];
  erroresQueDebeEvitarElMotor: string[];
  bibliotecasSecundariasRelacionadas: FamiliaTaxonomiaPreventivaId[];
};

type ActividadBase = Omit<ActividadObraPreventiva, "riesgosInherentes"> & {
  contextoTecnico: string;
};

type PlantillaRiesgo = Omit<RiesgoInherenteActividadObra, "id" | "titulo" | "descripcionTecnica"> & {
  idBase: string;
  tituloBase: string;
  descripcionBase: string;
};

type ActividadBloqueB = ActividadBase & {
  definicionesRiesgo: TemaRiesgoBloqueB[];
};

type ActividadBloqueC = ActividadBase & {
  definicionesRiesgo: TemaRiesgoBloqueC[];
};

type ActividadBloqueD = ActividadBase & {
  definicionesRiesgo: TemaRiesgoBloqueD[];
};

type ActividadBloqueE = ActividadBase & {
  definicionesRiesgo: TemaRiesgoBloqueE[];
};

type ActividadBloqueF = ActividadBase & {
  definicionesRiesgo: TemaRiesgoBloqueF[];
};

const documentosGenerales = ["Matriz de riesgos vigente", "AST/ART cuando exista tarea en ejecucion", "Registro de charla o difusion si aplica"];
const documentosNoSimples = ["PTS como requisito principal para correccion simple", "Permiso especial si no existe trabajo critico", "Certificacion cuando solo corresponde limpieza o retiro"];

const preguntasEstrategicasBase = [
  "La condicion afecta una zona de transito de trabajadores o maquinaria?",
  "Existe exposicion directa a caida, golpe, atrapamiento, corte o contacto con energia?",
  "La actividad requiere autorizacion, permiso, AST/ART o control critico?",
  "Existe segregacion o senalizacion instalada y respetada?",
  "El control aplicado permite continuar o se debe detener y corregir?",
  "La condicion esta cubierta en la matriz de riesgos o representa un cambio?",
  "Se requiere retiro, bloqueo, segregacion, reparacion o detencion inmediata?",
];

function crearActividadesBloqueB(): ActividadBloqueB[] {
  return [
  {
    id: "andamios_plataformas_trabajo",
    nombreVisible: "Andamios y plataformas de trabajo",
    descripcionActividad:
      "Armado, uso, modificacion y desarme de andamios, plataformas modulares, superficies temporales y puntos elevados para ejecucion de tareas en obra.",
    etapaObra: "Trabajos en altura y apoyo a especialidades",
    contextoTecnico: "durante armado, uso o desarme de andamios y plataformas de trabajo",
    palabrasClaveActividad: ["andamio", "plataforma", "baranda", "rodapie", "tarjeta", "acceso"],
    familiasPreventivasRelacionadas: ["trabajos_criticos", "seguridad_trabajadores", "mantencion_certificacion", "senalizacion_segregacion"],
    desviacionesFrecuentes: ["control_critico_ausente_no_verificado", "condicion_insegura", "trabajo_critico_sin_autorizacion_control"],
    documentosFrecuentesAplicables: [...documentosAltura, "Registro o tarjeta de inspeccion de andamio"],
    documentosQueNoAplicanPorDefecto: ["HDS/SDS si no hay sustancias", "Permiso de excavacion si no hay intervencion de suelo"],
    preguntasEstrategicasSugeridas: [
      ...preguntasEstrategicasAltura,
      "El andamio cuenta con barandas, rodapie, plataforma completa y acceso seguro?",
      "La tarjeta o inspeccion corresponde al estado real del andamio?",
    ],
    erroresQueDebeEvitarElMotor: ["No habilitar uso de andamio por costumbre si falta inspeccion, baranda, rodapie o acceso seguro."],
    bibliotecasSecundariasRelacionadas: ["epp", "orden_aseo_housekeeping", "herramientas_equipos"],
    definicionesRiesgo: [
      temaB("barandas_incompletas", "Barandas incompletas en andamio", "Baranda superior, intermedia o lateral del andamio se encuentra ausente, suelta o interrumpida", ["baranda", "andamio"], "plataforma", "andamio", "baranda incompleta", "alto"),
      temaB("rodapie_ausente", "Rodapie ausente en plataforma", "Rodapie o proteccion inferior falta en borde de plataforma con materiales y herramientas sobre nivel", ["rodapie", "plataforma"], "objetos_altura", "rodapie", "ausente o incompleto"),
      temaB("plataforma_incompleta", "Plataforma incompleta o con tablones desplazados", "Superficie de trabajo presenta huecos, tablones desplazados, piezas sin fijacion o ancho insuficiente", ["tablones", "plataforma"], "plataforma", "plataforma de andamio", "incompleta o desplazada", "alto"),
      temaB("acceso_inseguro_andamio", "Acceso inseguro al andamio", "Escalera interna, acceso lateral o punto de subida obliga a trepar por estructura o barandas", ["acceso", "escalera"], "acceso", "acceso al andamio", "sin medio seguro"),
      temaB("andamio_sin_tarjeta", "Andamio sin tarjeta o inspeccion visible", "Andamio se encuentra en uso sin tarjeta, registro de inspeccion o validacion vigente visible", ["tarjeta", "inspeccion"], "documental_altura", "andamio", "inspeccion no demostrada"),
      temaB("apoyo_desnivelado", "Apoyo de andamio desnivelado", "Base, placa, husillo o apoyo del andamio se ubica sobre superficie irregular, blanda o improvisada", ["base", "husillo"], "plataforma", "apoyo de andamio", "desnivelado o improvisado", "alto"),
      temaB("anclaje_insuficiente", "Anclaje o arriostramiento insuficiente", "Andamio alto o expuesto carece de anclaje, arriostramiento o fijacion lateral acorde al montaje", ["anclaje", "arriostre"], "plataforma", "arriostramiento", "insuficiente", "alto"),
      temaB("sobrecarga_plataforma", "Sobrecarga de plataforma de trabajo", "Materiales, equipos o acopios exceden carga razonable de la plataforma o bloquean circulacion", ["sobrecarga", "acopio"], "plataforma", "plataforma", "sobrecargada"),
      temaB("modificacion_no_autorizada", "Modificacion no autorizada de andamio", "Componentes del andamio fueron retirados, desplazados o adaptados sin verificacion de persona competente", ["modificacion", "andamio"], "documental_altura", "andamio", "modificado sin autorizacion", "alto"),
      temaB("desarme_sin_segregacion", "Desarme de andamio sin segregacion inferior", "Desarme o retiro de piezas se ejecuta con personas circulando bajo el punto de trabajo", ["desarme", "segregacion"], "segregacion", "area inferior", "sin segregacion", "alto"),
      temaB("herramientas_sueltas_andamio", "Herramientas sueltas sobre andamio", "Herramientas manuales, llaves, piezas o accesorios permanecen sueltos sobre plataforma elevada", ["herramientas", "sueltas"], "objetos_altura", "herramientas", "sin amarre o contencion"),
      temaB("materiales_borde_plataforma", "Materiales acopiados junto al borde", "Piezas, cajas, perfiles o residuos se mantienen junto al borde de plataforma sin contencion", ["materiales", "borde"], "objetos_altura", "materiales", "junto al borde"),
      temaB("transito_plataforma_obstruido", "Transito obstruido sobre plataforma", "Cables, mangueras, piezas o residuos reducen paso seguro sobre plataforma de trabajo", ["transito", "obstruido"], "orden_altura", "ruta sobre plataforma", "obstruida"),
      temaB("epp_anticaidas_no_conectado", "EPP anticaidas no conectado cuando aplica", "Trabajador permanece en zona con exposicion a caida usando arnes sin conexion efectiva", ["arnes", "linea de vida"], "epp_altura", "arnes", "no conectado", "alto"),
      temaB("casco_sin_barboquejo", "Casco sin barboquejo en trabajo elevado", "Trabajador expuesto a movimiento, viento o inclinacion usa casco sin barboquejo cuando el estandar lo exige", ["casco", "barboquejo"], "epp_altura", "casco", "sin barboquejo"),
      temaB("andamio_cerca_energia", "Andamio proximo a energia electrica", "Estructura metalica o plataforma se arma o usa cerca de lineas, cables o tablero energizado", ["energia", "cable"], "electrico", "andamio metalico", "proximo a energia", "critico"),
      temaB("uso_herramienta_altura", "Herramienta usada en andamio sin amarre", "Taladro, llave, esmeril o herramienta manual se usa desde andamio sin control contra caida", ["taladro", "amarre"], "herramienta_altura", "herramienta", "sin amarre"),
      temaB("proyeccion_particulas_andamio", "Proyeccion de particulas desde plataforma", "Corte, perforacion o limpieza sobre andamio proyecta particulas hacia trabajador o zona inferior", ["particulas", "corte"], "herramienta_altura", "herramienta de corte", "proyeccion no controlada"),
      temaB("clima_viento_andamio", "Viento que afecta estabilidad de andamio", "Viento, rachas o lluvia modifican estabilidad, adherencia o control de materiales sobre andamio", ["viento", "lluvia"], "clima", "andamio", "afectado por clima"),
      temaB("superficie_resbaladiza_plataforma", "Superficie resbaladiza en plataforma", "Plataforma presenta agua, lechada, barro o polvo que reduce adherencia durante el trabajo", ["resbaladizo", "agua"], "orden_altura", "superficie de plataforma", "resbaladiza"),
      temaB("andamio_sin_nivelacion", "Andamio sin nivelacion verificada", "Estructura temporal muestra inclinacion, asentamiento o falta de nivelacion previa al uso", ["nivelacion", "inclinacion"], "plataforma", "estructura de andamio", "sin nivelacion", "alto"),
      temaB("ruedas_sin_freno", "Ruedas de andamio movil sin freno", "Andamio movil se utiliza con ruedas sin bloqueo, freno o control de desplazamiento aplicado", ["ruedas", "freno"], "plataforma", "andamio movil", "ruedas sin freno", "alto"),
      temaB("traslado_con_personas", "Traslado de andamio con personas sobre plataforma", "Andamio movil es desplazado o ajustado mientras personas permanecen sobre la plataforma", ["traslado", "andamio movil"], "plataforma", "andamio movil", "traslado con personas", "critico"),
      temaB("distancia_fachada_excesiva", "Separacion peligrosa entre andamio y fachada", "Existe espacio lateral relevante entre plataforma y fachada que genera abertura o punto de caida", ["fachada", "separacion"], "altura", "separacion fachada-andamio", "abertura sin proteccion", "alto"),
      temaB("armado_sin_personal_competente", "Armado de andamio sin personal competente", "Montaje o modificacion de andamio se ejecuta sin responsable competente o supervision definida", ["armado", "competente"], "documental_altura", "montaje de andamio", "sin responsable competente", "alto"),
      temaB("piezas_danadas_andamio", "Componentes de andamio danados", "Marcos, diagonales, pasadores, plataformas o bases presentan dano, deformacion o desgaste visible", ["componentes", "danados"], "plataforma", "componentes de andamio", "danados o deformados", "alto"),
      temaB("acceso_no_autorizado_andamio", "Acceso no autorizado a andamio restringido", "Persona ingresa a andamio cerrado, incompleto o fuera de servicio pese a restriccion visible", ["no autorizado", "fuera de servicio"], "segregacion", "andamio restringido", "ingreso no autorizado"),
      temaB("interferencia_andamio_maquinaria", "Interferencia de maquinaria con andamio", "Equipo movil, carga o maniobra opera cerca del andamio sin radio de seguridad definido", ["maquinaria", "interferencia"], "segregacion", "andamio y maquinaria", "radio no controlado", "alto"),
      temaB("iluminacion_insuficiente_andamio", "Iluminacion insuficiente en plataforma", "Trabajo en andamio se realiza con sombra, baja visibilidad o luminaria deficiente", ["iluminacion", "visibilidad"], "acceso", "plataforma", "baja visibilidad"),
      temaB("evacuacion_obstruida_andamio", "Ruta de evacuacion obstruida en andamio", "Descenso, escalera interna o paso de salida permanece bloqueado por materiales o equipos", ["evacuacion", "salida"], "acceso", "ruta de evacuacion", "obstruida"),
      temaB("trabajo_simultaneo_niveles", "Trabajo simultaneo en niveles de andamio", "Cuadrillas trabajan en niveles superpuestos sin coordinacion ni proteccion ante caida de objetos", ["simultaneo", "niveles"], "objetos_altura", "niveles de andamio", "trabajo superpuesto"),
      temaB("cierre_perimetral_inferior_debil", "Cierre inferior insuficiente bajo andamio", "Area bajo el andamio queda solo advertida o parcialmente cerrada frente a caida de objetos", ["cierre inferior", "barrera"], "segregacion", "perimetro inferior", "cierre insuficiente"),
    ],
  },
  {
    id: "trabajo_altura_lineas_vida_bordes_aberturas",
    nombreVisible: "Trabajo en altura, lineas de vida, bordes y aberturas",
    descripcionActividad:
      "Ejecucion de trabajos junto a bordes, vanos, aberturas, losas, fachadas y puntos elevados que requieren sistemas anticaidas y control de acceso.",
    etapaObra: "Trabajos criticos en altura",
    contextoTecnico: "durante trabajo en altura junto a lineas de vida, bordes o aberturas",
    palabrasClaveActividad: ["altura", "linea de vida", "borde", "abertura", "vano", "arnes"],
    familiasPreventivasRelacionadas: ["trabajos_criticos", "epp", "senalizacion_segregacion", "seguridad_trabajadores"],
    desviacionesFrecuentes: ["control_critico_ausente_no_verificado", "trabajo_critico_sin_autorizacion_control", "condicion_insegura"],
    documentosFrecuentesAplicables: [...documentosAltura, "Registro de inspeccion de sistema anticaidas si aplica"],
    documentosQueNoAplicanPorDefecto: ["HDS/SDS si no hay sustancias", "Permiso de izaje si no hay carga suspendida"],
    preguntasEstrategicasSugeridas: [
      ...preguntasEstrategicasAltura,
      "El punto de anclaje y la linea de vida resisten y corresponden a la tarea?",
      "Las aberturas tienen tapa, baranda o bloqueo fisico efectivo?",
    ],
    erroresQueDebeEvitarElMotor: ["No aceptar cuerda, cinta o advertencia como reemplazo de proteccion anticaidas efectiva."],
    bibliotecasSecundariasRelacionadas: ["epp", "mantencion_certificacion", "documental_legal"],
    definicionesRiesgo: [
      temaB("borde_sin_baranda", "Borde abierto sin baranda efectiva", "Borde de losa, fachada, shaft o desnivel permanece sin baranda, tapa o proteccion resistente", ["borde", "baranda"], "altura", "borde abierto", "sin baranda", "alto"),
      temaB("abertura_sin_tapa", "Abertura sin tapa resistente", "Vano, shaft, tragaluz o perforacion de losa queda abierto o cubierto con material no resistente", ["abertura", "tapa"], "altura", "abertura", "sin tapa resistente", "alto"),
      temaB("linea_vida_sin_verificacion", "Linea de vida sin verificacion", "Linea de vida horizontal o vertical no evidencia inspeccion, instalacion correcta o compatibilidad", ["linea de vida", "inspeccion"], "altura", "linea de vida", "sin verificacion", "alto"),
      temaB("punto_anclaje_improvisado", "Punto de anclaje improvisado", "Trabajador conecta cabo a estructura, baranda, tuberia o elemento sin resistencia conocida", ["anclaje", "improvisado"], "altura", "punto de anclaje", "improvisado", "critico"),
      temaB("arnes_mal_ajustado", "Arnes mal ajustado o incompleto", "Arnes se usa suelto, con hebillas mal cerradas, componentes faltantes o talla no compatible", ["arnes", "ajuste"], "epp_altura", "arnes", "mal ajustado", "alto"),
      temaB("cabo_sin_absorbedor", "Cabo de vida no compatible", "Cabo, absorbedor o conector no corresponde a altura libre, tarea o sistema instalado", ["cabo", "absorbedor"], "epp_altura", "cabo de vida", "no compatible", "alto"),
      temaB("doble_cabo_no_usado", "Desplazamiento sin doble conexion", "Trabajador se desplaza entre puntos elevados quedando temporalmente desconectado del sistema", ["doble cabo", "desplazamiento"], "altura", "conexion anticaidas", "interrumpida", "critico"),
      temaB("trabajo_sobre_losa_sin_permiso", "Trabajo en altura sin autorizacion vigente", "Tarea junto a borde o abertura se ejecuta sin permiso, AST/ART o autorizacion requerida", ["permiso", "altura"], "documental_altura", "trabajo en altura", "sin autorizacion", "alto"),
      temaB("area_inferior_sin_segregar", "Area inferior sin segregacion", "Trabajo en borde o abertura se realiza con personas transitando bajo el punto de exposicion", ["area inferior", "segregacion"], "segregacion", "zona inferior", "sin segregacion", "alto"),
      temaB("herramientas_sin_amarre_altura", "Herramientas sin amarre en borde", "Herramientas o accesorios se usan junto a borde sin amarre, contenedor o control de caida", ["herramienta", "amarre"], "objetos_altura", "herramientas", "sin amarre"),
      temaB("materiales_sueltos_borde", "Materiales sueltos junto a abertura", "Tornillos, piezas, recortes o materiales quedan cerca de abertura sin contencion", ["materiales", "abertura"], "objetos_altura", "materiales", "sueltos junto a abertura"),
      temaB("transito_cerca_borde", "Transito no controlado cerca de borde", "Ruta de paso o trabajo obliga a circular junto a borde sin distancia ni barrera suficiente", ["transito", "borde"], "altura", "ruta cercana a borde", "sin control", "alto"),
      temaB("tapa_sin_rotular", "Tapa de vano sin rotulacion o fijacion", "Cubierta temporal de abertura no esta fijada, rotulada o asegurada contra desplazamiento", ["tapa", "rotulacion"], "altura", "tapa de vano", "sin fijacion"),
      temaB("baranda_retirada_temporalmente", "Baranda retirada sin control alternativo", "Baranda o proteccion fue retirada para ingreso de material sin control equivalente instalado", ["baranda retirada", "control alternativo"], "altura", "baranda", "retirada temporalmente", "critico"),
      temaB("clima_altura_viento", "Viento que afecta trabajo en altura", "Viento o rachas alteran equilibrio, conexion, traslado de materiales o estabilidad de trabajadores", ["viento", "altura"], "clima", "trabajo en altura", "viento desfavorable", "alto"),
      temaB("lluvia_superficie_altura", "Superficie elevada mojada o resbaladiza", "Lluvia, agua o polvo reduce adherencia en losa, plataforma, cubierta o acceso elevado", ["lluvia", "resbaladizo"], "clima", "superficie elevada", "resbaladiza"),
      temaB("casco_barboquejo_altura", "Casco sin barboquejo en borde", "Trabajador junto a borde o vano usa casco sin barboquejo cuando puede perderlo por inclinacion o viento", ["barboquejo", "casco"], "epp_altura", "casco", "sin barboquejo"),
      temaB("rescate_no_planificado", "Rescate en altura no planificado", "Trabajo con sistema anticaidas no considera respuesta ante caida, suspension o rescate oportuno", ["rescate", "suspension"], "documental_altura", "plan de rescate", "no definido", "alto"),
      temaB("linea_vida_danada", "Linea de vida danada o contaminada", "Cable, cuerda, absorvedor o componente anticaidas presenta desgaste, corte, oxidacion o contaminacion", ["linea danada", "anticaidas"], "epp_altura", "sistema anticaidas", "danado", "alto"),
      temaB("anclaje_compartido_sobrecargado", "Anclaje compartido sin evaluacion", "Varios trabajadores conectan al mismo punto sin verificar capacidad, compatibilidad o diseno", ["anclaje compartido", "capacidad"], "altura", "anclaje", "sobrecargado", "critico"),
      temaB("trabajo_solitario_altura", "Trabajo aislado en altura", "Trabajador ejecuta tarea en altura sin apoyo visual, comunicacion o supervision suficiente", ["trabajo solitario", "supervision"], "documental_altura", "trabajo en altura", "sin apoyo"),
      temaB("acceso_borde_inseguro", "Acceso a borde sin medio seguro", "Ingreso al punto elevado exige cruzar abertura, pisar zona estrecha o trepar sin acceso formal", ["acceso", "borde"], "acceso", "acceso a borde", "inseguro", "alto"),
      temaB("iluminacion_borde_deficiente", "Iluminacion deficiente junto a abertura", "Borde o vano se encuentra con baja visibilidad, sombras o ausencia de iluminacion suficiente", ["iluminacion", "vano"], "acceso", "borde o abertura", "baja visibilidad"),
      temaB("linea_vida_mal_instalada", "Linea de vida instalada con flecha o recorrido inadecuado", "Recorrido, tension o ubicacion de linea de vida genera pendulo, roce o caida libre excesiva", ["pendulo", "linea de vida"], "altura", "linea de vida", "mal instalada", "critico"),
      temaB("pendulo_no_controlado", "Riesgo de pendulo no controlado", "Punto de anclaje lateral o desplazamiento expone a golpe contra estructura en caso de caida", ["pendulo", "anclaje lateral"], "altura", "punto de anclaje", "genera pendulo", "alto"),
      temaB("proyeccion_al_borde", "Proyeccion de particulas junto a borde", "Corte o perforacion cerca de borde genera proyeccion y distraccion en trabajador conectado", ["proyeccion", "borde"], "herramienta_altura", "herramienta", "proyeccion junto a borde"),
      temaB("mangueras_cables_borde", "Cables o mangueras cruzan zona de borde", "Cables, alargadores o mangueras atraviesan ruta cercana a borde o abertura", ["cables", "mangueras"], "orden_altura", "cables o mangueras", "cruzan borde"),
      temaB("cambio_condicion_no_actualizado", "Cambio de condicion no actualizado en matriz", "Nuevo borde, vano o retiro de proteccion no queda incorporado en analisis preventivo", ["matriz", "cambio"], "documental_altura", "matriz de riesgos", "no actualizada"),
      temaB("terceros_zona_altura", "Terceros expuestos a trabajo en altura", "Visitas, otras cuadrillas o terceros pasan cerca de zona elevada sin control de acceso", ["terceros", "acceso"], "segregacion", "zona de altura", "terceros expuestos"),
      temaB("abertura_oculta", "Abertura cubierta por material suelto", "Abertura queda parcialmente cubierta por carton, plastico, lona o material que oculta el peligro", ["abertura oculta", "lona"], "altura", "abertura", "oculta no resistente", "alto"),
      temaB("retiro_control_sin_supervision", "Retiro de control anticaidas sin supervision", "Proteccion de borde, tapa o linea se retira para ejecutar tarea sin responsable definido", ["retiro control", "supervision"], "documental_altura", "control anticaidas", "retirado sin supervision", "alto"),
      temaB("comunicacion_deficiente_altura", "Comunicacion deficiente en trabajo en altura", "Cuadrilla en altura no cuenta con coordinacion clara para traslado de materiales, herramientas o restricciones", ["comunicacion", "coordinacion"], "documental_altura", "coordinacion de tarea", "deficiente"),
    ],
  },
  {
    id: "techumbres_cubiertas_paneles_tejas",
    nombreVisible: "Techumbres, cubiertas, paneles y tejas",
    descripcionActividad:
      "Instalacion, reparacion, retiro y transito sobre techumbres, cubiertas, paneles, tejas, planchas y superficies elevadas con posible fragilidad.",
    etapaObra: "Cubiertas y envolvente",
    contextoTecnico: "durante trabajos sobre techumbres, cubiertas, paneles o tejas",
    palabrasClaveActividad: ["techumbre", "cubierta", "panel", "teja", "plancha", "tragaluz"],
    familiasPreventivasRelacionadas: ["trabajos_criticos", "clima_entorno", "herramientas_equipos", "seguridad_trabajadores"],
    desviacionesFrecuentes: ["control_critico_ausente_no_verificado", "condicion_insegura", "condicion_climatica_o_terreno_aumenta_riesgo"],
    documentosFrecuentesAplicables: [...documentosAltura, "Metodo de trabajo sobre cubierta si aplica"],
    documentosQueNoAplicanPorDefecto: ["Permiso de excavacion si no hay intervencion de suelo", "HDS/SDS salvo uso de sellantes o quimicos"],
    preguntasEstrategicasSugeridas: [
      ...preguntasEstrategicasAltura,
      "La cubierta es resistente o requiere pasarela y control de fragilidad?",
      "Existen tragaluces, planchas sueltas, bordes o zonas resbaladizas?",
    ],
    erroresQueDebeEvitarElMotor: ["No tratar cubierta fragil como superficie normal de transito."],
    bibliotecasSecundariasRelacionadas: ["epp", "clima_entorno", "herramientas_equipos"],
    definicionesRiesgo: [
      temaB("cubierta_fragil", "Cubierta fragil sin pasarela", "Plancha, teja, tragaluz o panel de cubierta no asegura resistencia para transito directo", ["cubierta fragil", "tragaluz"], "altura", "cubierta fragil", "sin pasarela", "critico"),
      temaB("borde_techumbre_sin_control", "Borde de techumbre sin proteccion", "Trabajo se ejecuta cerca de borde de cubierta sin baranda, linea de vida o restriccion efectiva", ["borde", "techumbre"], "altura", "borde de cubierta", "sin proteccion", "alto"),
      temaB("transito_sobre_tejas", "Transito inseguro sobre tejas o paneles", "Trabajador pisa tejas, paneles o sectores no definidos como ruta segura de transito", ["tejas", "transito"], "altura", "ruta sobre cubierta", "no definida", "alto"),
      temaB("linea_vida_cubierta", "Linea de vida de cubierta sin verificacion", "Sistema anticaidas en cubierta no evidencia instalacion, tension o anclajes verificados", ["linea de vida", "cubierta"], "altura", "linea de vida", "sin verificacion", "alto"),
      temaB("anclaje_cubierta_improvisado", "Anclaje improvisado en cubierta", "Cabo anticaidas se conecta a costanera, canaleta, baranda o elemento sin capacidad demostrada", ["anclaje", "costanera"], "altura", "anclaje en cubierta", "improvisado", "critico"),
      temaB("materiales_sueltos_cubierta", "Materiales sueltos sobre cubierta", "Planchas, tornillos, tapas, sellos o herramientas permanecen sin contencion sobre pendiente", ["materiales", "pendiente"], "objetos_altura", "materiales sobre cubierta", "sin contencion"),
      temaB("herramientas_sin_amarre_cubierta", "Herramientas sin amarre en techumbre", "Herramientas manuales o electricas se utilizan sobre cubierta sin amarre ni bandeja de contencion", ["herramientas", "amarre"], "herramienta_altura", "herramientas en cubierta", "sin amarre"),
      temaB("corte_plancha_altura", "Corte de plancha en altura sin control", "Corte de planchas, paneles o remates genera rebabas, proyeccion y caida de recortes", ["corte", "plancha"], "material_cortante", "plancha o panel", "corte sin control"),
      temaB("perforacion_cubierta", "Perforacion de cubierta sin control de proyeccion", "Taladro o fijacion sobre cubierta proyecta particulas y deja perforaciones o recortes sueltos", ["perforacion", "taladro"], "herramienta_altura", "taladro en cubierta", "proyeccion no controlada"),
      temaB("clima_viento_cubierta", "Viento sobre cubierta con materiales livianos", "Rachas de viento desplazan planchas, membranas, paneles o herramientas sobre la techumbre", ["viento", "planchas"], "clima", "material liviano", "afectado por viento", "alto"),
      temaB("lluvia_cubierta_resbaladiza", "Cubierta mojada o resbaladiza", "Lluvia, rocio, polvo o lechada reduce adherencia en superficie inclinada o elevada", ["lluvia", "resbaladiza"], "clima", "cubierta", "resbaladiza", "alto"),
      temaB("baja_visibilidad_cubierta", "Baja visibilidad en techumbre", "Sombra, encandilamiento o falta de iluminacion impide reconocer bordes, tornillos o vanos", ["visibilidad", "sombra"], "acceso", "cubierta", "baja visibilidad"),
      temaB("tragaluz_sin_proteccion", "Tragaluz sin proteccion contra caida", "Tragaluz o lucarna queda expuesto como superficie no transitable sin barrera ni tapa", ["tragaluz", "lucarna"], "altura", "tragaluz", "sin proteccion", "critico"),
      temaB("panel_mal_apoyado", "Panel de cubierta mal apoyado", "Panel, plancha o teja se apoya temporalmente sin fijacion, tope o control de deslizamiento", ["panel", "apoyo"], "dano_material", "panel de cubierta", "mal apoyado"),
      temaB("sellante_quimico_altura", "Uso de sellante en altura sin control", "Sellante, adhesivo o producto quimico se usa en cubierta sin control de envase, HDS o derrame", ["sellante", "adhesivo"], "herramienta_altura", "sellante", "sin control de uso"),
      temaB("residuos_cubierta", "Residuos y recortes en cubierta", "Recortes metalicos, tornillos, tapas o restos de membrana quedan en ruta de transito elevada", ["residuos", "recortes"], "orden_altura", "residuos sobre cubierta", "sin retiro"),
      temaB("acceso_techumbre_inseguro", "Acceso inseguro a techumbre", "Ingreso a cubierta se realiza por escalera, vano o borde sin transicion segura", ["acceso", "techumbre"], "acceso", "acceso a techumbre", "inseguro", "alto"),
      temaB("escalera_sin_amarre_cubierta", "Escalera de acceso a cubierta sin amarre", "Escalera usada para subir a techumbre no esta asegurada, sobresale poco o apoya en superficie debil", ["escalera", "amarre"], "acceso", "escalera de acceso", "sin amarre"),
      temaB("zona_inferior_cubierta", "Zona inferior sin segregacion por trabajos en cubierta", "Personas circulan bajo zona donde se instalan o retiran planchas, tejas o herramientas", ["zona inferior", "segregacion"], "segregacion", "area inferior", "sin segregacion", "alto"),
      temaB("izaje_paneles_cubierta", "Izaje de paneles de cubierta sin control", "Paneles, paquetes o planchas se elevan a cubierta sin control de viento, rigger o radio", ["izaje", "paneles"], "izaje_montaje", "panel de cubierta", "izaje sin control", "critico"),
      temaB("apilamiento_cubierta", "Apilamiento de materiales sobre cubierta", "Paquetes de paneles, tejas o planchas se acopian sobre cubierta sin revisar carga admisible", ["apilamiento", "carga"], "dano_material", "acopio sobre cubierta", "sobrecarga"),
      temaB("fijacion_incompleta_panel", "Fijacion incompleta de panel o plancha", "Elemento instalado queda con tornillos, clips o fijaciones faltantes antes de liberar el area", ["fijacion", "tornillos"], "dano_material", "panel instalado", "fijacion incompleta"),
      temaB("retiro_panel_sin_secuencia", "Retiro de paneles sin secuencia segura", "Desmontaje de cubierta se ejecuta sin definir orden, apoyo temporal o zona de acopio", ["retiro", "secuencia"], "documental_altura", "retiro de cubierta", "sin secuencia"),
      temaB("arnes_no_conectado_cubierta", "Arnes no conectado sobre cubierta", "Trabajador transita sobre cubierta con arnes sin conexion efectiva a sistema anticaidas", ["arnes", "cubierta"], "epp_altura", "arnes", "no conectado", "alto"),
      temaB("barboquejo_cubierta", "Casco sin barboquejo en cubierta", "Trabajo en pendiente, viento o borde se ejecuta sin barboquejo cuando el estandar lo requiere", ["casco", "barboquejo"], "epp_altura", "casco", "sin barboquejo"),
      temaB("guantes_anticorte_cubierta", "Guantes anticorte no usados con planchas", "Manipulacion de planchas, remates o latas se realiza sin guantes anticorte adecuados", ["guantes", "anticorte"], "material_cortante", "guantes", "no usados"),
      temaB("proteccion_ocular_cubierta", "Proteccion ocular ausente en perforacion", "Perforacion, corte o fijacion sobre cubierta se ejecuta sin proteccion ocular efectiva", ["lentes", "perforacion"], "herramienta_altura", "proteccion ocular", "ausente"),
      temaB("energia_provisoria_cubierta", "Energia provisoria en cubierta sin control", "Alargador, cable o equipo electrico queda expuesto a humedad, borde o pisada sobre cubierta", ["alargador", "energia"], "electrico", "energia provisoria", "sin control", "alto"),
      temaB("trabajo_simultaneo_cubierta", "Trabajo simultaneo bajo y sobre cubierta", "Cuadrillas trabajan simultaneamente en cubierta y nivel inferior sin coordinacion de caida de objetos", ["simultaneo", "cubierta"], "objetos_altura", "trabajos simultaneos", "sin coordinacion"),
      temaB("emergencia_acceso_cubierta", "Evacuacion de cubierta no definida", "No existe ruta clara para bajar desde cubierta ante clima, lesion, incendio o rescate", ["evacuacion", "rescate"], "documental_altura", "ruta de evacuacion", "no definida"),
      temaB("dano_cubierta_existente", "Dano existente en cubierta no aislado", "Sector con planchas fisuradas, tejas rotas o perforaciones queda habilitado sin aislamiento", ["dano", "fisura"], "dano_material", "cubierta existente", "danada no aislada"),
      temaB("comunicacion_cubierta", "Comunicacion deficiente durante trabajo en cubierta", "Equipo de cubierta no coordina izaje, fijacion, retiro de residuos o restriccion de acceso", ["comunicacion", "coordinacion"], "documental_altura", "coordinacion de cubierta", "deficiente"),
    ],
  },
  {
    id: "canaletas_bajadas_agua_remates_exteriores",
    nombreVisible: "Canaletas, bajadas de agua y remates exteriores",
    descripcionActividad:
      "Instalacion, reparacion, limpieza y fijacion de canaletas, bajadas de agua, remates, sellos y piezas exteriores en fachadas o bordes de cubierta.",
    etapaObra: "Terminaciones exteriores y cubierta",
    contextoTecnico: "durante instalacion o reparacion de canaletas, bajadas de agua y remates exteriores",
    palabrasClaveActividad: ["canaleta", "bajada de agua", "remate", "sello", "fachada", "borde exterior"],
    familiasPreventivasRelacionadas: ["trabajos_criticos", "herramientas_equipos", "seguridad_trabajadores", "orden_aseo_housekeeping"],
    desviacionesFrecuentes: ["condicion_insegura", "control_critico_ausente_no_verificado", "uso_inadecuado_herramienta_equipo_maquinaria"],
    documentosFrecuentesAplicables: [...documentosAltura, "AST/ART por trabajo exterior si aplica"],
    documentosQueNoAplicanPorDefecto: ["Permiso de izaje si no hay carga suspendida", "Permiso de excavacion si no hay intervencion de suelo"],
    preguntasEstrategicasSugeridas: [
      ...preguntasEstrategicasAltura,
      "La canaleta o remate se manipula desde acceso estable y segregado?",
      "Existen bordes cortantes, sellantes, herramientas o piezas sueltas con riesgo de caida?",
    ],
    erroresQueDebeEvitarElMotor: ["No sobredocumentar limpieza simple de canaleta si se controla por retiro, segregacion y acceso seguro."],
    bibliotecasSecundariasRelacionadas: ["epp", "herramientas_equipos", "dano_material"],
    definicionesRiesgo: [
      temaB("acceso_borde_canaleta", "Acceso inseguro a borde de canaleta", "Trabajo en borde exterior exige alcanzar canaleta desde escalera, cubierta o plataforma con postura forzada", ["canaleta", "acceso"], "acceso", "acceso a canaleta", "inestable", "alto"),
      temaB("escalera_sin_amarre_canaleta", "Escalera sin amarre para bajada de agua", "Escalera usada para instalar bajada o canaleta no se encuentra amarrada ni apoyada correctamente", ["escalera", "bajada"], "acceso", "escalera", "sin amarre"),
      temaB("borde_exterior_sin_control", "Borde exterior sin control anticaidas", "Remate o canaleta se trabaja cerca de borde sin restriccion, baranda o sistema anticaidas efectivo", ["borde exterior", "anticaidas"], "altura", "borde exterior", "sin control", "alto"),
      temaB("canaleta_cortante", "Canaleta o lata con borde cortante", "Canaleta, remate o lata presenta borde filoso durante corte, ajuste o fijacion exterior", ["canaleta", "corte"], "material_cortante", "canaleta", "borde filoso"),
      temaB("recortes_sueltos_canaleta", "Recortes metalicos sueltos en altura", "Recortes de lata, tornillos o piezas de remate quedan sueltos en borde de cubierta o plataforma", ["recortes", "tornillos"], "objetos_altura", "recortes metalicos", "sueltos en altura"),
      temaB("herramienta_sin_amarre_canaleta", "Herramienta sin amarre en fachada", "Taladro, remachadora, tijera o destornillador se usa en fachada sin amarre ni contencion", ["taladro", "remachadora"], "herramienta_altura", "herramienta", "sin amarre"),
      temaB("taladro_fachada_proyeccion", "Perforacion de fachada sin control de particulas", "Perforacion para fijar canaleta o bajada proyecta polvo, rebaba o fragmentos hacia trabajador o zona inferior", ["perforacion", "fachada"], "herramienta_altura", "taladro", "proyeccion no controlada"),
      temaB("sellante_sin_control", "Sellante o adhesivo sin control de uso", "Sellante, silicona o adhesivo se usa en altura sin control de envase, goteo o contacto con piel", ["sellante", "silicona"], "herramienta_altura", "sellante", "uso no controlado"),
      temaB("zona_inferior_canaleta", "Zona inferior sin cierre por trabajo exterior", "Personas transitan bajo punto donde se retiran o instalan canaletas, tornillos o remates", ["zona inferior", "cierre"], "segregacion", "area inferior", "sin cierre"),
      temaB("pieza_larga_sin_control", "Pieza larga manipulada sin apoyo", "Canaleta, bajada o remate largo se manipula en altura sin apoyo, guia o trabajador de asistencia", ["pieza larga", "apoyo"], "objetos_altura", "canaleta larga", "sin apoyo"),
      temaB("viento_canaleta_liviana", "Viento desplaza canaletas o remates livianos", "Viento afecta piezas livianas durante presentacion, fijacion o traslado en altura", ["viento", "pieza liviana"], "clima", "canaleta o remate", "afectado por viento"),
      temaB("lluvia_borde_exterior", "Lluvia en borde exterior de trabajo", "Superficie de acceso a canaleta o remate queda mojada y resbaladiza", ["lluvia", "borde"], "clima", "borde exterior", "resbaladizo"),
      temaB("baja_visibilidad_fachada", "Baja visibilidad en remate exterior", "Sombra, reflejo o iluminacion deficiente dificulta fijacion y reconocimiento de borde exterior", ["visibilidad", "fachada"], "acceso", "remate exterior", "baja visibilidad"),
      temaB("arnes_no_conectado_fachada", "Arnes sin conexion en trabajo exterior", "Trabajador usa arnes durante instalacion de canaleta pero permanece sin conexion efectiva", ["arnes", "fachada"], "epp_altura", "arnes", "sin conexion", "alto"),
      temaB("guantes_anticorte_canaleta", "Guantes anticorte ausentes en canaletas", "Manipulacion de canaletas, remates o bajadas metalicas se realiza sin guantes anticorte", ["guantes", "canaleta"], "material_cortante", "guantes", "ausentes"),
      temaB("proteccion_ocular_remache", "Proteccion ocular ausente al remachar", "Remachado, corte o perforacion de canaleta se ejecuta sin proteccion ocular efectiva", ["remache", "ocular"], "herramienta_altura", "proteccion ocular", "ausente"),
      temaB("cable_alargador_fachada", "Alargador en fachada sin control", "Cable electrico o alargador queda colgando, tensionado o expuesto a humedad durante trabajo exterior", ["alargador", "humedad"], "electrico", "alargador", "sin control"),
      temaB("bajada_mal_fijada", "Bajada de agua mal fijada temporalmente", "Bajada, abrazadera o tramo vertical queda presentado sin fijacion suficiente antes de liberar el sector", ["bajada", "abrazadera"], "dano_material", "bajada de agua", "mal fijada"),
      temaB("canaleta_sobrecargada_residuos", "Canaleta con residuos durante intervencion", "Canaleta contiene barro, agua o residuos que pueden caer durante retiro o limpieza", ["residuos", "limpieza"], "objetos_altura", "residuos en canaleta", "sin contencion"),
      temaB("limpieza_canaleta_sin_seguro", "Limpieza de canaleta con postura extendida", "Trabajador limpia canaleta extendiendo cuerpo fuera de apoyo estable o proteccion", ["limpieza", "postura"], "altura", "postura de limpieza", "fuera de apoyo", "alto"),
      temaB("perforacion_sobre_instalacion", "Perforacion cerca de instalacion oculta", "Fijacion de remate o bajada se realiza sin verificar interferencias con cable, ducto o servicio", ["interferencia", "perforacion"], "dano_material", "instalacion oculta", "no verificada"),
      temaB("sellante_derrame", "Derrame de sellante o residuo quimico", "Producto sellante, solvente o adhesivo queda derramado sobre superficie de transito o borde", ["derrame", "adhesivo"], "orden_altura", "sellante", "derramado"),
      temaB("trabajo_sin_ast_exterior", "Trabajo exterior sin analisis cuando aplica", "Intervencion de canaleta en altura o fachada se ejecuta sin AST/ART actualizado", ["ast", "exterior"], "documental_altura", "AST/ART", "no verificado"),
      temaB("permiso_altura_canaleta", "Permiso de altura no verificado en canaletas", "Actividad de canaleta en borde o fachada se ejecuta sin permiso o autorizacion requerida", ["permiso", "altura"], "documental_altura", "permiso de altura", "no verificado", "alto"),
      temaB("material_acopiado_borde", "Acopio de canaletas junto a borde", "Tramos de canaleta, bajadas o remates se acopian junto a borde sin amarre ni contencion", ["acopio", "borde"], "objetos_altura", "acopio de canaletas", "junto a borde"),
      temaB("interferencia_peatonal_fachada", "Interferencia peatonal bajo fachada", "Ruta peatonal se mantiene abierta bajo instalacion de remates o bajadas de agua", ["peaton", "fachada"], "segregacion", "ruta peatonal", "sin cierre"),
      temaB("plataforma_mal_posicionada_fachada", "Plataforma mal posicionada para remate", "Plataforma o escala queda separada del punto de trabajo y obliga a alcanzar lateralmente", ["plataforma", "alcance"], "acceso", "plataforma de trabajo", "mal posicionada"),
      temaB("manguera_agua_interferencia", "Manguera o bajada provisoria interfiere acceso", "Manguera, bajada temporal o ducto cruza ruta de acceso durante trabajo exterior", ["manguera", "acceso"], "orden_altura", "manguera o ducto", "interfiere paso"),
      temaB("retiro_remate_sin_secuencia", "Retiro de remate sin secuencia", "Remate exterior se desmonta sin definir orden, apoyo o control de piezas liberadas", ["retiro", "remate"], "documental_altura", "retiro de remate", "sin secuencia"),
      temaB("dano_fachada_remate", "Riesgo de dano a fachada o cubierta", "Maniobra de remate puede golpear, rayar o desprender revestimiento, aislacion o impermeabilizacion", ["dano", "fachada"], "dano_material", "fachada o cubierta", "sin proteccion"),
      temaB("comunicacion_remate", "Coordinacion deficiente en trabajo exterior", "Trabajador en altura y apoyo inferior no coordinan entrega, fijacion o retiro de piezas", ["coordinacion", "apoyo"], "documental_altura", "coordinacion", "deficiente"),
      temaB("evacuacion_fachada", "Evacuacion no definida desde trabajo exterior", "No existe ruta o medio claro para bajar ante clima, lesion o falla del acceso exterior", ["evacuacion", "fachada"], "documental_altura", "evacuacion", "no definida"),
    ],
  },
  {
    id: "montaje_vigas_cerchas_elementos_altura",
    nombreVisible: "Montaje de vigas, cerchas y elementos en altura",
    descripcionActividad:
      "Recepcion, izaje, posicionamiento, aplome, fijacion temporal y definitiva de vigas, cerchas, perfiles y elementos estructurales en altura.",
    etapaObra: "Montaje estructural",
    contextoTecnico: "durante montaje de vigas, cerchas y elementos estructurales en altura",
    palabrasClaveActividad: ["viga", "cercha", "montaje", "izaje", "rigger", "aparejo"],
    familiasPreventivasRelacionadas: ["izaje_gruas_amarre", "trabajos_criticos", "seguridad_trabajadores", "dano_material"],
    desviacionesFrecuentes: ["paso_bajo_carga_suspendida", "exposicion_linea_fuego", "control_critico_ausente_no_verificado"],
    documentosFrecuentesAplicables: [...documentosIzaje, "Procedimiento o secuencia de montaje si aplica"],
    documentosQueNoAplicanPorDefecto: ["HDS/SDS si no hay sustancias", "Permiso de excavacion si no hay intervencion de suelo"],
    preguntasEstrategicasSugeridas: [
      ...preguntasEstrategicasAltura,
      "Existe plan de izaje, rigger o senalero y radio de exclusion efectivo?",
      "El elemento queda estable temporalmente antes de liberar aparejos?",
    ],
    erroresQueDebeEvitarElMotor: ["No tratar carga suspendida o estabilidad temporal como simple coordinacion verbal."],
    bibliotecasSecundariasRelacionadas: ["maquinaria_instalaciones", "herramientas_equipos", "mantencion_certificacion"],
    definicionesRiesgo: [
      temaB("carga_suspendida_sin_radio", "Carga suspendida sin radio de exclusion", "Viga, cercha o perfil se iza con personas dentro del radio de carga", ["carga suspendida", "radio"], "izaje_montaje", "carga suspendida", "sin radio", "critico"),
      temaB("paso_bajo_cercha", "Paso bajo cercha suspendida", "Trabajadores o terceros cruzan bajo cercha, viga o paquete mientras permanece suspendido", ["paso bajo carga", "cercha"], "izaje_montaje", "cercha suspendida", "paso bajo carga", "critico"),
      temaB("aparejo_sin_certificacion", "Aparejo sin certificacion visible", "Eslinga, grillete, cadena o accesorio de izaje no evidencia inspeccion o certificacion vigente", ["aparejo", "certificacion"], "izaje_montaje", "aparejo", "sin certificacion", "critico"),
      temaB("rigger_no_definido", "Rigger o senalero no definido", "Maniobra de montaje se ejecuta sin persona designada para senales, comunicacion y control del radio", ["rigger", "senalero"], "izaje_montaje", "senalero", "no definido", "alto"),
      temaB("viento_montaje", "Viento durante montaje de cerchas", "Viento o rachas afectan control de elemento largo, liviano o con superficie expuesta", ["viento", "cercha"], "clima", "elemento estructural", "afectado por viento", "critico"),
      temaB("estabilidad_temporal", "Elemento sin estabilidad temporal", "Viga, cercha o perfil queda apoyado o presentado sin arriostramiento temporal suficiente", ["estabilidad", "arriostre"], "izaje_montaje", "elemento montado", "sin estabilidad", "critico"),
      temaB("anclaje_provisorio_deficiente", "Anclaje provisorio deficiente", "Pernos, cuerdas, puntales o fijaciones temporales no aseguran elemento antes de soltar aparejos", ["anclaje", "provisorio"], "izaje_montaje", "anclaje temporal", "deficiente", "critico"),
      temaB("linea_fuego_montajista", "Montajista en linea de fuego", "Trabajador se ubica entre carga, estructura fija, equipo de levante o punto de apoyo", ["linea de fuego", "montajista"], "izaje_montaje", "posicion del trabajador", "en linea de fuego", "critico"),
      temaB("atrapamiento_entre_elementos", "Atrapamiento entre viga y apoyo", "Manos o cuerpo ingresan entre elemento suspendido y placa, pilar o apoyo de montaje", ["atrapamiento", "apoyo"], "izaje_montaje", "punto de apoyo", "atrapamiento posible", "critico"),
      temaB("comunicacion_izaje_deficiente", "Comunicacion deficiente en izaje", "Operador, rigger y montajistas no cuentan con senales, radio o criterio comun de detencion", ["comunicacion", "radio"], "documental_altura", "comunicacion de izaje", "deficiente", "alto"),
      temaB("plan_izaje_no_disponible", "Plan de izaje no disponible", "Maniobra de montaje con carga relevante se ejecuta sin plan, revision o autorizacion aplicable", ["plan de izaje", "autorizacion"], "documental_altura", "plan de izaje", "no disponible", "alto"),
      temaB("terreno_grua_inestable", "Terreno o apoyo de equipo de levante inestable", "Equipo de izaje opera sobre terreno, losa o apoyo sin verificacion de capacidad y nivelacion", ["terreno", "grua"], "equipo_elevacion", "apoyo de equipo", "inestable", "critico"),
      temaB("interferencia_linea_energia", "Izaje cerca de energia electrica", "Elemento o pluma se aproxima a linea, tablero, cable o instalacion electrica energizada", ["energia", "pluma"], "electrico", "equipo de izaje", "cerca de energia", "critico"),
      temaB("herramientas_montaje_altura", "Herramientas de montaje sin amarre", "Llaves, punzones, taladros o accesorios se usan en altura sin amarre ni contenedor", ["llaves", "amarre"], "herramienta_altura", "herramientas de montaje", "sin amarre"),
      temaB("pernos_sueltos_altura", "Pernos y tuercas sueltos en altura", "Pernos, tuercas, arandelas o calzas permanecen sueltos sobre estructura o plataforma", ["pernos", "tuercas"], "objetos_altura", "pernos y tuercas", "sueltos"),
      temaB("trabajo_sobre_viga", "Transito sobre viga sin control", "Trabajador camina o se posiciona sobre viga o cercha sin plataforma ni sistema anticaidas adecuado", ["transito", "viga"], "altura", "viga o cercha", "usada como paso", "critico"),
      temaB("acceso_punto_montaje", "Acceso inseguro al punto de montaje", "Ingreso al punto de fijacion se realiza trepando estructura o desde apoyo no habilitado", ["acceso", "montaje"], "acceso", "punto de montaje", "sin acceso seguro", "alto"),
      temaB("arnes_montaje_no_conectado", "Arnes sin conexion durante montaje", "Montajista usa arnes pero no permanece conectado durante posicionamiento o fijacion", ["arnes", "montaje"], "epp_altura", "arnes", "sin conexion", "critico"),
      temaB("barboquejo_montaje", "Casco sin barboquejo en montaje", "Trabajador en montaje elevado o bajo carga usa casco sin barboquejo cuando corresponde", ["casco", "barboquejo"], "epp_altura", "casco", "sin barboquejo"),
      temaB("guantes_montaje", "Guantes inadecuados para montaje metalico", "Manipulacion de perfiles, placas o pernos se realiza sin guantes contra corte o atrapamiento", ["guantes", "perfil"], "material_cortante", "guantes", "inadecuados"),
      temaB("corte_perfil_altura", "Corte de perfil en altura sin control", "Esmerilado o corte de perfil en altura genera particulas, chispas y caida de recortes", ["esmeril", "perfil"], "herramienta_altura", "perfil metalico", "corte sin control"),
      temaB("trabajo_caliente_montaje", "Trabajo caliente en montaje sin autorizacion", "Soldadura, esmerilado o corte se ejecuta sin permiso o control de incendio cuando corresponde", ["soldadura", "trabajo caliente"], "documental_altura", "trabajo caliente", "sin autorizacion", "alto"),
      temaB("segregacion_inferior_montaje", "Segregacion inferior insuficiente en montaje", "Area bajo montaje queda abierta a transito mientras se posicionan elementos o herramientas", ["segregacion", "montaje"], "segregacion", "area inferior", "insuficiente", "alto"),
      temaB("material_acopiado_montaje", "Acopio de elementos estructurales inestable", "Vigas, placas o cerchas se acopian sin cunas, topes o separacion segura", ["acopio", "cerchas"], "dano_material", "acopio estructural", "inestable"),
      temaB("dano_elemento_montaje", "Elemento estructural danado no segregado", "Viga, placa o cercha presenta deformacion, golpe o dano antes del montaje sin revision", ["dano", "estructura"], "dano_material", "elemento estructural", "danado"),
      temaB("fijacion_definitiva_incompleta", "Fijacion definitiva incompleta", "Elemento queda liberado con pernos, soldadura o apriete incompleto antes de terminar control", ["fijacion", "pernos"], "izaje_montaje", "fijacion estructural", "incompleta", "alto"),
      temaB("liberacion_aparejo_prematura", "Liberacion prematura de aparejo", "Aparejo se suelta antes de verificar estabilidad, aplome y fijacion temporal suficiente", ["liberacion", "aparejo"], "izaje_montaje", "aparejo", "liberado prematuramente", "critico"),
      temaB("simultaneidad_montaje", "Trabajos simultaneos bajo montaje", "Otras cuadrillas ejecutan tareas bajo o junto al montaje sin coordinacion ni cierre", ["simultaneo", "cuadrillas"], "segregacion", "trabajos simultaneos", "sin coordinacion"),
      temaB("iluminacion_montaje", "Iluminacion deficiente en montaje", "Montaje o fijacion se ejecuta con baja visibilidad para senales, puntos de apoyo o pernos", ["iluminacion", "pernos"], "acceso", "zona de montaje", "baja visibilidad"),
      temaB("matriz_no_cubre_montaje", "Matriz no cubre condicion de montaje", "Metodo real de izaje, altura o secuencia difiere de lo previsto en matriz o AST/ART", ["matriz", "secuencia"], "documental_altura", "matriz de riesgos", "no cubre condicion"),
      temaB("rescate_montaje", "Rescate en altura no previsto en montaje", "Cuadrilla no tiene definido rescate ante caida, atrapamiento o suspension durante montaje", ["rescate", "montaje"], "documental_altura", "rescate", "no definido"),
      temaB("orden_punto_montaje", "Orden deficiente en punto de montaje", "Pernos, cables, calzas o herramientas obstruyen plataforma, viga o acceso de montajistas", ["orden", "calzas"], "orden_altura", "punto de montaje", "obstruido"),
    ],
  },
  {
    id: "instalacion_luminarias_altura",
    nombreVisible: "Instalacion de luminarias en altura",
    descripcionActividad:
      "Montaje, retiro, conexion, mantencion y prueba de luminarias, soportes, canalizaciones y equipos electricos instalados en altura o sobre accesos temporales.",
    etapaObra: "Instalaciones electricas y terminaciones",
    contextoTecnico: "durante instalacion, retiro o mantencion de luminarias en altura",
    palabrasClaveActividad: ["luminaria", "altura", "tablero", "cable", "energia", "taladro"],
    familiasPreventivasRelacionadas: ["energia_loto_electrico", "trabajos_criticos", "herramientas_equipos", "seguridad_trabajadores"],
    desviacionesFrecuentes: ["control_critico_ausente_no_verificado", "trabajo_critico_sin_autorizacion_control", "condicion_insegura"],
    documentosFrecuentesAplicables: [...documentosElectricos, ...documentosAltura],
    documentosQueNoAplicanPorDefecto: ["Permiso de excavacion si no hay intervencion de suelo", "HDS/SDS si no hay sustancias"],
    preguntasEstrategicasSugeridas: [
      ...preguntasEstrategicasAltura,
      "Existe energia presente, bloqueo o verificacion de ausencia de tension?",
      "La luminaria, herramienta y acceso estan asegurados contra caida?",
    ],
    erroresQueDebeEvitarElMotor: ["No tratar instalacion de luminaria como tarea menor si existe energia o altura no controlada."],
    bibliotecasSecundariasRelacionadas: ["epp", "mantencion_certificacion", "maquinaria_instalaciones"],
    definicionesRiesgo: [
      temaB("energia_no_bloqueada_luminaria", "Energia no bloqueada en luminaria", "Circuito de luminaria permanece energizado o con retorno posible durante conexion, retiro o mantencion", ["energia", "bloqueo"], "electrico", "circuito de luminaria", "no bloqueado", "critico"),
      temaB("ausencia_tension_no_verificada", "Ausencia de tension no verificada", "Trabajador interviene cable, driver o luminaria sin comprobar ausencia de tension con instrumento adecuado", ["tension", "verificacion"], "electrico", "cable o luminaria", "sin verificacion", "critico"),
      temaB("tablero_sin_control", "Tablero o circuito sin control de acceso", "Tablero que alimenta luminarias permanece accesible o sin identificacion durante la intervencion", ["tablero", "acceso"], "electrico", "tablero", "sin control", "alto"),
      temaB("luminaria_suelta_altura", "Luminaria suelta en altura", "Equipo, carcasa, difusor o soporte queda presentado sin fijacion definitiva sobre zona de transito", ["luminaria", "suelta"], "objetos_altura", "luminaria", "sin fijacion", "alto"),
      temaB("herramienta_sin_amarre_luminaria", "Herramienta sin amarre al instalar luminaria", "Taladro, destornillador o tester se usa desde escalera o plataforma sin amarre", ["herramienta", "amarre"], "herramienta_altura", "herramienta", "sin amarre"),
      temaB("taladro_sobre_cabeza", "Taladro sobre cabeza sin control de particulas", "Perforacion en losa, cielo o soporte proyecta polvo y particulas hacia rostro o zona inferior", ["taladro", "polvo"], "herramienta_altura", "taladro", "proyeccion no controlada"),
      temaB("escalera_luminaria_inestable", "Escalera inestable para luminaria", "Escalera usada para instalar luminaria queda sin apoyo firme, amarre o angulo seguro", ["escalera", "luminaria"], "acceso", "escalera", "inestable", "alto"),
      temaB("plataforma_luminaria_sin_inspeccion", "Plataforma para luminaria sin inspeccion", "Plataforma, alza hombre o andamio usado para luminaria no evidencia inspeccion vigente", ["plataforma", "inspeccion"], "equipo_elevacion", "plataforma", "sin inspeccion", "alto"),
      temaB("cable_colgante_altura", "Cable colgante sin control", "Cable de luminaria queda colgando, tensionado o cruzando ruta elevada durante instalacion", ["cable", "colgante"], "electrico", "cable", "sin control"),
      temaB("empalme_provisorio", "Empalme provisorio expuesto", "Conexion temporal o empalme queda sin aislacion, caja o proteccion mecanica suficiente", ["empalme", "aislacion"], "electrico", "empalme", "expuesto", "alto"),
      temaB("driver_sin_fijacion", "Driver o fuente sin fijacion", "Driver, balasto o fuente queda apoyado temporalmente en cielo, bandeja o estructura", ["driver", "fuente"], "dano_material", "driver", "sin fijacion"),
      temaB("caida_difusor_luminaria", "Difusor o tapa con riesgo de caida", "Difusor, tapa, rejilla o carcasa se retira en altura sin contencion ni zona inferior cerrada", ["difusor", "tapa"], "objetos_altura", "difusor", "sin contencion"),
      temaB("zona_inferior_luminaria", "Zona inferior abierta bajo luminaria", "Personas circulan bajo el punto donde se perfora, conecta o retira una luminaria", ["zona inferior", "luminaria"], "segregacion", "area inferior", "abierta"),
      temaB("arnes_plataforma_luminaria", "EPP anticaidas no usado en plataforma", "Trabajo desde plataforma o borde para luminaria se realiza sin arnes o conexion cuando aplica", ["arnes", "plataforma"], "epp_altura", "arnes", "no usado", "alto"),
      temaB("proteccion_ocular_taladro", "Proteccion ocular ausente al perforar cielo", "Perforacion o fijacion sobre cabeza se ejecuta sin lentes o pantalla adecuada", ["lentes", "cielo"], "herramienta_altura", "proteccion ocular", "ausente"),
      temaB("guantes_electricos_inadecuados", "Guantes no adecuados para intervencion electrica", "Manipulacion de conductores o partes electricas se realiza sin guantes o proteccion compatible", ["guantes", "electrico"], "epp_altura", "guantes", "inadecuados"),
      temaB("permiso_electrico_no_verificado", "Autorizacion electrica no verificada", "Intervencion de luminaria se ejecuta sin responsable autorizado o permiso cuando corresponde", ["permiso", "electrico"], "documental_altura", "autorizacion electrica", "no verificada", "alto"),
      temaB("ast_luminaria_no_actualizado", "AST/ART no actualizado para altura y energia", "Analisis de la tarea no considera simultaneamente altura, perforacion y energia electrica", ["ast", "energia"], "documental_altura", "AST/ART", "incompleto"),
      temaB("matriz_no_cubre_luminaria", "Matriz no cubre condicion de luminarias", "Instalacion real incorpora altura, energia o equipo elevador no considerado en matriz vigente", ["matriz", "luminaria"], "documental_altura", "matriz", "no cubre condicion"),
      temaB("clima_luminaria_exterior", "Clima afecta luminaria exterior", "Viento, lluvia o humedad afecta instalacion exterior de luminaria y control electrico", ["clima", "exterior"], "clima", "luminaria exterior", "afectada por clima"),
      temaB("humedad_conexion_luminaria", "Humedad en conexion electrica", "Conexion, cable o caja de luminaria presenta humedad o ingreso de agua durante instalacion", ["humedad", "conexion"], "electrico", "conexion electrica", "con humedad", "alto"),
      temaB("soporte_debil_luminaria", "Soporte de luminaria debil o no verificado", "Soporte, tarugo, perfil o anclaje de luminaria no asegura resistencia antes de liberar equipo", ["soporte", "tarugo"], "dano_material", "soporte de luminaria", "no verificado"),
      temaB("luminaria_pesada_sin_apoyo", "Luminaria pesada manipulada sin apoyo", "Equipo pesado se instala manualmente en altura sin ayuda, apoyo o metodo de sujecion", ["luminaria pesada", "apoyo"], "objetos_altura", "luminaria pesada", "sin apoyo"),
      temaB("orden_cables_luminaria", "Cables y embalajes obstruyen acceso", "Cables, cajas, embalajes o accesorios quedan en ruta de escalera, plataforma o piso inferior", ["cables", "embalajes"], "orden_altura", "materiales de luminaria", "obstruyen paso"),
      temaB("interferencia_otros_trabajos", "Interferencia con otras cuadrillas", "Instalacion de luminarias se realiza sobre o junto a cuadrillas que circulan o trabajan bajo el punto", ["interferencia", "cuadrillas"], "segregacion", "trabajos simultaneos", "sin coordinacion"),
      temaB("equipo_elevador_luminaria", "Equipo elevador sin estabilizacion", "Plataforma o alza hombre usado para luminarias opera sin estabilizadores o terreno verificado", ["alza hombre", "estabilizadores"], "equipo_elevacion", "equipo elevador", "sin estabilizacion", "alto"),
      temaB("atrapamiento_canastillo", "Atrapamiento con canastillo o estructura", "Trabajador en plataforma queda expuesto a atrapamiento entre canastillo, cielo, viga o muro", ["canastillo", "atrapamiento"], "equipo_elevacion", "canastillo", "punto de atrapamiento", "alto"),
      temaB("baja_visibilidad_luminaria", "Baja visibilidad al instalar luminaria", "Zona de trabajo no cuenta con iluminacion auxiliar suficiente para conexion, fijacion o lectura de cables", ["visibilidad", "conexion"], "acceso", "zona de luminaria", "baja visibilidad"),
      temaB("retiro_luminaria_sin_secuencia", "Retiro de luminaria sin secuencia segura", "Desmontaje de luminaria no define desconexion, soporte, bajada de equipo ni segregacion inferior", ["retiro", "secuencia"], "documental_altura", "retiro de luminaria", "sin secuencia"),
      temaB("componentes_danados_luminaria", "Componentes electricos danados no retirados", "Luminaria, cable, driver o carcasa presenta dano visible y permanece disponible para uso", ["danado", "driver"], "electrico", "componentes electricos", "danados"),
      temaB("rescate_plataforma_luminaria", "Rescate no previsto desde plataforma", "Tarea en plataforma para luminarias no considera descenso, rescate o falla del equipo elevador", ["rescate", "plataforma"], "documental_altura", "rescate", "no previsto"),
      temaB("prueba_energizada_sin_aviso", "Prueba energizada sin control de area", "Prueba o energizacion de luminaria se realiza sin aviso, bloqueo de acceso o responsable definido", ["prueba", "energizacion"], "electrico", "prueba energizada", "sin control", "alto"),
    ],
  },
  {
    id: "escaleras_plataformas_elevadoras_accesos_temporales",
    nombreVisible: "Escaleras, plataformas elevadoras y accesos temporales",
    descripcionActividad:
      "Uso, traslado, posicionamiento e inspeccion de escaleras, plataformas elevadoras, alza hombres, pasarelas y accesos temporales para trabajos en altura.",
    etapaObra: "Accesos temporales y equipos de elevacion",
    contextoTecnico: "durante uso de escaleras, plataformas elevadoras y accesos temporales",
    palabrasClaveActividad: ["escalera", "plataforma elevadora", "alza hombre", "acceso temporal", "pasarela", "estabilizador"],
    familiasPreventivasRelacionadas: ["trabajos_criticos", "maquinaria_instalaciones", "mantencion_certificacion", "seguridad_trabajadores"],
    desviacionesFrecuentes: ["condicion_insegura", "control_critico_ausente_no_verificado", "desplazamiento_terreno_inestable"],
    documentosFrecuentesAplicables: ["Checklist o inspeccion del equipo", ...documentosAltura, "Autorizacion de operador si aplica"],
    documentosQueNoAplicanPorDefecto: ["HDS/SDS si no hay sustancias", "Permiso de excavacion si no hay intervencion de suelo"],
    preguntasEstrategicasSugeridas: [
      ...preguntasEstrategicasAltura,
      "La escalera, plataforma o equipo elevador esta inspeccionado y apto?",
      "El terreno, apoyo o estabilizacion permite operar sin volcamiento o desplazamiento?",
    ],
    erroresQueDebeEvitarElMotor: ["No tratar plataforma elevadora como escalera comun ni permitir uso sin inspeccion."],
    bibliotecasSecundariasRelacionadas: ["epp", "clima_entorno", "senalizacion_segregacion"],
    definicionesRiesgo: [
      temaB("escalera_mal_estado", "Escalera en mal estado", "Escalera presenta peldanos, largueros, zapatas, seguros o apoyo deteriorado antes de su uso", ["escalera", "mal estado"], "acceso", "escalera", "deteriorada"),
      temaB("escalera_sin_amarre", "Escalera sin amarre o sujecion", "Escalera se utiliza para acceso o trabajo sin amarre, apoyo estable o control de desplazamiento", ["amarre", "escalera"], "acceso", "escalera", "sin amarre"),
      temaB("angulo_escalera_incorrecto", "Angulo incorrecto de escalera", "Escalera se instala con inclinacion excesiva o insuficiente respecto del punto de apoyo", ["angulo", "inclinacion"], "acceso", "escalera", "angulo incorrecto"),
      temaB("escalera_no_sobresale", "Escalera no sobresale del punto de desembarco", "Escalera de acceso no alcanza altura suficiente para desembarcar con apoyo seguro", ["desembarco", "sobresale"], "acceso", "escalera", "altura insuficiente"),
      temaB("tres_puntos_no_respetados", "Tres puntos de contacto no respetados", "Trabajador sube o baja con herramientas o materiales que impiden tres puntos de apoyo", ["tres puntos", "herramientas"], "acceso", "subida o bajada", "sin tres puntos"),
      temaB("trabajo_lateral_escalera", "Trabajo lateral desde escalera", "Trabajador ejecuta tarea extendiendo cuerpo lateralmente fuera del eje de la escalera", ["lateral", "alcance"], "altura", "postura en escalera", "fuera de eje", "alto"),
      temaB("escalera_sobre_superficie_inestable", "Escalera sobre superficie inestable", "Escalera apoya sobre barro, desnivel, material suelto o superficie no resistente", ["superficie", "inestable"], "acceso", "apoyo de escalera", "inestable", "alto"),
      temaB("escalera_cerca_puerta", "Escalera instalada junto a puerta o circulacion", "Escalera se ubica frente a puerta, pasillo o ruta sin bloqueo del transito", ["puerta", "pasillo"], "segregacion", "zona de escalera", "sin bloqueo"),
      temaB("plataforma_sin_checklist", "Plataforma elevadora sin checklist", "Equipo elevador se usa sin inspeccion diaria, checklist o revision de condicion visible", ["checklist", "plataforma"], "equipo_elevacion", "plataforma elevadora", "sin checklist", "alto"),
      temaB("operador_no_autorizado", "Operador de plataforma no autorizado", "Plataforma elevadora es operada por persona sin competencia, autorizacion o instruccion verificable", ["operador", "autorizacion"], "equipo_elevacion", "operador", "no autorizado", "alto"),
      temaB("estabilizadores_no_desplegados", "Estabilizadores no desplegados", "Equipo elevador opera sin estabilizadores, nivelacion o apoyo completo segun condicion del terreno", ["estabilizadores", "nivelacion"], "equipo_elevacion", "estabilizadores", "no desplegados", "alto"),
      temaB("terreno_inestable_elevador", "Terreno inestable bajo plataforma", "Ruedas, estabilizadores o apoyos se ubican sobre terreno blando, relleno, pendiente o losa no verificada", ["terreno", "elevador"], "equipo_elevacion", "terreno bajo equipo", "inestable", "alto"),
      temaB("canastillo_sin_arnes", "Canastillo sin arnes o punto de anclaje", "Trabajador en plataforma elevadora no usa arnes conectado cuando el estandar del equipo lo exige", ["canastillo", "arnes"], "epp_altura", "arnes en canastillo", "no usado", "alto"),
      temaB("atrapamiento_plataforma", "Atrapamiento entre plataforma y estructura", "Canastillo se aproxima a viga, cielo, muro o instalacion generando punto de atrapamiento", ["atrapamiento", "canastillo"], "equipo_elevacion", "canastillo", "riesgo de atrapamiento", "alto"),
      temaB("traslado_plataforma_elevada", "Traslado con plataforma elevada", "Equipo se desplaza con plataforma elevada o trabajador expuesto fuera de condicion permitida", ["traslado", "elevada"], "equipo_elevacion", "plataforma elevadora", "traslado elevada", "alto"),
      temaB("radio_plataforma_sin_segurar", "Radio de plataforma sin segregacion", "Area de giro, subida o movimiento de plataforma elevadora permanece abierta a peatones", ["radio", "segregacion"], "segregacion", "radio de equipo", "sin segregacion"),
      temaB("bateria_carga_sin_control", "Carga de bateria sin control", "Equipo elevador o herramienta se carga con cables, bateria o enchufe expuesto en zona de transito", ["bateria", "carga"], "electrico", "carga de bateria", "sin control"),
      temaB("plataforma_cerca_energia", "Plataforma elevadora cerca de energia", "Canastillo, brazo o trabajador opera proximo a cable, tablero o instalacion energizada", ["energia", "canastillo"], "electrico", "plataforma elevadora", "cerca de energia", "critico"),
      temaB("pasarela_temporal_incompleta", "Pasarela temporal incompleta", "Pasarela o puente temporal carece de ancho, baranda, fijacion o superficie continua", ["pasarela", "temporal"], "acceso", "pasarela temporal", "incompleta", "alto"),
      temaB("pasarela_sin_rodapie", "Pasarela sin rodapie o contencion", "Pasarela elevada mantiene herramientas o materiales sin rodapie ni borde de contencion", ["rodapie", "pasarela"], "objetos_altura", "pasarela", "sin rodapie"),
      temaB("acceso_temporal_sin_senalizar", "Acceso temporal sin senalizacion", "Ruta temporal de subida, bajada o cruce no esta senalizada ni separada de otras tareas", ["senalizacion", "acceso"], "segregacion", "acceso temporal", "sin senalizacion"),
      temaB("iluminacion_acceso_temporal", "Iluminacion deficiente en acceso temporal", "Escalera, pasarela o plataforma se usa con baja visibilidad o sombras que ocultan desniveles", ["iluminacion", "acceso"], "acceso", "acceso temporal", "baja visibilidad"),
      temaB("orden_acceso_temporal", "Orden deficiente en acceso temporal", "Cables, mangueras, cajas o residuos obstruyen escalera, pasarela o plataforma de acceso", ["orden", "cables"], "orden_altura", "acceso temporal", "obstruido"),
      temaB("clima_acceso_temporal", "Clima afecta acceso temporal", "Lluvia, viento, polvo o baja visibilidad degrada adherencia y control del acceso elevado", ["clima", "acceso"], "clima", "acceso temporal", "afectado por clima"),
      temaB("materiales_sueltos_plataforma", "Materiales sueltos en plataforma elevadora", "Herramientas, cajas o piezas se mantienen sueltas dentro del canastillo o plataforma", ["materiales", "canastillo"], "objetos_altura", "materiales en canastillo", "sueltos"),
      temaB("herramienta_sin_amarre_elevador", "Herramienta sin amarre en equipo elevador", "Herramienta se usa desde canastillo o plataforma sin amarre contra caida", ["herramienta", "elevador"], "herramienta_altura", "herramienta", "sin amarre"),
      temaB("mando_plataforma_defectuoso", "Mando de plataforma defectuoso", "Control, boton de emergencia, alarma o mando del equipo elevador no responde correctamente", ["mando", "emergencia"], "equipo_elevacion", "mando de equipo", "defectuoso", "alto"),
      temaB("mantenimiento_vencido_elevador", "Mantencion de equipo elevador vencida", "Plataforma elevadora no evidencia mantencion, certificacion o inspeccion tecnica vigente", ["mantencion", "certificacion"], "equipo_elevacion", "equipo elevador", "mantencion vencida", "alto"),
      temaB("permiso_equipo_elevador", "Permiso o autorizacion de equipo no verificado", "Uso de plataforma elevadora se ejecuta sin autorizacion, AST/ART o permiso requerido", ["permiso", "equipo"], "documental_altura", "autorizacion de equipo", "no verificada"),
      temaB("rescate_equipo_elevador", "Rescate desde plataforma no previsto", "No existe metodo claro para bajar trabajador ante falla del equipo, atrapamiento o emergencia", ["rescate", "equipo"], "documental_altura", "rescate", "no previsto"),
      temaB("interaccion_maquinaria_acceso", "Interaccion con maquinaria en acceso temporal", "Maquinaria o vehiculo circula cerca de escalera, pasarela o plataforma sin segregacion", ["maquinaria", "acceso"], "segregacion", "acceso y maquinaria", "sin separacion"),
      temaB("sobrecarga_plataforma_elevadora", "Sobrecarga de plataforma elevadora", "Personas, herramientas o materiales exceden capacidad o distribucion segura del canastillo", ["sobrecarga", "capacidad"], "equipo_elevacion", "canastillo", "sobrecargado", "alto"),
    ],
  },
  ];
}
const preguntasEstrategicasAltura = [
  "El trabajo se ejecuta sobre andamio, plataforma, escalera, cubierta o borde abierto?",
  "Existe exposicion a caida a distinto nivel o caida de objetos?",
  "El sistema anticaidas esta instalado, inspeccionado y usado correctamente?",
  "La zona inferior se encuentra segregada ante caida de herramientas o materiales?",
  "El acceso al punto de trabajo es seguro y compatible con la tarea?",
  "La actividad requiere permiso, AST/ART, PTS o autorizacion vigente?",
  "Hay viento, lluvia, baja visibilidad u otra condicion que obligue a reevaluar?",
  "El control aplicado permite continuar o corresponde detener la actividad?",
];

type CategoriaRiesgoBloqueB =
  | "altura"
  | "objetos_altura"
  | "plataforma"
  | "acceso"
  | "herramienta_altura"
  | "electrico"
  | "izaje_montaje"
  | "clima"
  | "epp_altura"
  | "documental_altura"
  | "orden_altura"
  | "material_cortante"
  | "equipo_elevacion"
  | "segregacion"
  | "dano_material";

type PerfilRiesgoBloqueB = {
  tipoRiesgo: TipoRiesgoActividadObra;
  actoInseguroAsociado: string;
  condicionInseguraAsociada: string;
  exposicion: string;
  consecuenciaProbable: string;
  controlFaltanteOFallido: string;
  controlesEsperados: string[];
  accionInmediataSugerida: string;
  documentosAplicables: string[];
  documentosNoAplicables: string[];
  familiasPreventivas: FamiliaTaxonomiaPreventivaId[];
  desviacionesPreventivas: DesviacionPreventivaId[];
  criticidadOrientativa: CriticidadOrientativaTaxonomia;
  preguntasSugeridas: string[];
  preguntasProhibidas: string[];
  errorQueDebeEvitar: string;
};

type TemaRiesgoBloqueB = {
  idBase: string;
  tituloBase: string;
  condicionTecnica: string;
  palabrasClaveBase: string[];
  categoria: CategoriaRiesgoBloqueB;
  objetoPrincipal: string;
  condicionObservada: string;
  criticidadOrientativa?: CriticidadOrientativaTaxonomia;
};

type CategoriaRiesgoBloqueC =
  | "contacto_electrico"
  | "energia_loto"
  | "tablero_proteccion"
  | "cable_extension"
  | "sobrecarga_humedad"
  | "herramienta_electrica"
  | "perforacion_polvo"
  | "ruido_vibracion"
  | "corte_borde"
  | "caida_mismo_nivel"
  | "caida_distinto_nivel"
  | "caida_objetos"
  | "manipulacion_manual"
  | "postura_forzada"
  | "vapores_quimicos"
  | "aguas_residuales"
  | "fuga_fluidos"
  | "presion_sobrepresion"
  | "gas_combustible"
  | "rotulacion_identificacion"
  | "interferencia_redes"
  | "segregacion_senalizacion"
  | "autorizacion_documental"
  | "matriz_no_cubre"
  | "mantencion_certificacion"
  | "ventilacion_deficiente"
  | "dano_material";

type PerfilRiesgoBloqueC = PerfilRiesgoBloqueB;

type TemaRiesgoBloqueC = {
  idBase: string;
  tituloBase: string;
  condicionTecnica: string;
  palabrasClaveBase: string[];
  categoria: CategoriaRiesgoBloqueC;
  objetoPrincipal: string;
  condicionObservada: string;
  criticidadOrientativa?: CriticidadOrientativaTaxonomia;
};

type TemaRiesgoBloqueD = {
  idBase: string;
  tituloBase: string;
  condicionTecnica: string;
  palabrasClaveBase: string[];
  categoria: CategoriaRiesgoBloqueC;
  objetoPrincipal: string;
  condicionObservada: string;
  criticidadOrientativa?: CriticidadOrientativaTaxonomia;
};

type TemaRiesgoBloqueE = TemaRiesgoBloqueD;

type TemaRiesgoBloqueF = TemaRiesgoBloqueD;

const documentosAltura = ["AST/ART", "PTS o procedimiento de trabajo en altura si aplica", "Matriz de riesgos vigente"];
const documentosIzaje = ["Plan de izaje si aplica", "AST/ART", "Certificacion de aparejos o equipo de levante"];
const documentosElectricos = ["Bloqueo/LOTO si aplica", "AST/ART", "Autorizacion de intervencion electrica si corresponde"];
const documentosNoAlturaSimple = ["HDS/SDS si no hay sustancias", "Permiso especial si no existe trabajo critico", "Certificacion cuando solo corresponde retiro menor"];
const documentosInstalacionesTecnicas = ["AST/ART si hay energia, presion o perforacion critica", "Matriz de riesgos vigente", "Autorizacion tecnica si corresponde"];
const documentosNoInstalacionSimple = ["PTS si solo corresponde retiro menor, orden o reparacion simple", "Permiso especial si no existe energia, presion ni trabajo critico"];
const documentosTerminacionesQuimicos = ["HDS/SDS si hay pintura, solvente, adhesivo o sello", "Matriz de riesgos vigente", "AST/ART si hay altura, herramienta critica o exposicion relevante"];
const documentosNoTerminacionSimple = ["PTS si solo corresponde limpieza, retiro o reposicion simple", "Permiso especial si no existe trabajo critico ni sustancia peligrosa"];
const documentosMaquinariaLogistica = ["AST/ART si hay maniobra con equipo movil o interaccion peaton-equipo", "Matriz de riesgos vigente", "Inspeccion preoperacional o registro de mantencion si aplica"];
const documentosIzajeLogistica = ["Plan de izaje si aplica", "AST/ART", "Certificacion de grua, aparejos o accesorios de levante"];
const documentosNoLogisticaSimple = ["PTS si solo corresponde ordenamiento menor", "HDS/SDS si no hay sustancia peligrosa", "Permiso especial si no existe trabajo critico"];
const documentosAmbientalesQuimicos = ["HDS/SDS vigente si hay sustancia peligrosa", "Matriz de riesgos vigente", "Registro ambiental o trazabilidad de retiro si aplica"];
const documentosEmergenciaAmbiental = ["Inspeccion de equipo de emergencia si aplica", "Registro de respuesta o contencion si corresponde", "Matriz de riesgos vigente"];
const documentosNoAmbientalSimple = ["PTS si solo corresponde limpieza o retiro simple", "Permiso especial si no existe trabajo critico", "AST/ART como requisito principal para correccion menor"];

const PERFILES_RIESGO_B: Record<CategoriaRiesgoBloqueB, PerfilRiesgoBloqueB> = {
  altura: {
    tipoRiesgo: "trabajo_critico",
    actoInseguroAsociado: "permanencia en altura sin control suficiente",
    condicionInseguraAsociada: "proteccion contra caida ausente o incompleta",
    exposicion: "trabajadores ubicados sobre nivel, proximos a borde, vano o superficie elevada",
    consecuenciaProbable: "caida a distinto nivel con lesion grave o fatal",
    controlFaltanteOFallido: "sistema anticaidas, baranda, tapa, linea de vida o punto de anclaje no verificado",
    controlesEsperados: ["baranda o tapa resistente", "arnes y linea de vida si aplica", "punto de anclaje verificado", "supervision"],
    accionInmediataSugerida: "Detener exposicion a caida, segregar el punto y restituir proteccion anticaidas antes de continuar.",
    documentosAplicables: documentosAltura,
    documentosNoAplicables: ["HDS/SDS si no hay sustancias", "Permiso de excavacion si no hay intervencion de suelo"],
    familiasPreventivas: ["trabajos_criticos", "seguridad_trabajadores", "senalizacion_segregacion"],
    desviacionesPreventivas: ["control_critico_ausente_no_verificado", "condicion_insegura"],
    criticidadOrientativa: "alto",
    preguntasSugeridas: ["Existe exposicion directa a caida?", "El sistema anticaidas esta instalado y usado correctamente?"],
    preguntasProhibidas: ["Tratar el borde o abertura como simple orden y aseo."],
    errorQueDebeEvitar: "No permitir continuidad si falta un control critico contra caida.",
  },
  objetos_altura: {
    tipoRiesgo: "seguridad_personas",
    actoInseguroAsociado: "mantener materiales o herramientas sueltas en altura",
    condicionInseguraAsociada: "objetos sin amarre, rodapie o contencion",
    exposicion: "personas ubicadas bajo la zona de trabajo o dentro del radio de caida",
    consecuenciaProbable: "golpe por caida de objeto, lesion craneal o dano material",
    controlFaltanteOFallido: "amarre de herramientas, rodapie, malla, orden o segregacion inferior insuficiente",
    controlesEsperados: ["amarre de herramientas", "rodapie o contencion", "segregacion inferior", "casco con barboquejo si aplica"],
    accionInmediataSugerida: "Retirar objetos sueltos, asegurar herramientas y cerrar el area inferior hasta controlar la caida de materiales.",
    documentosAplicables: ["AST/ART si hay trabajo sobre personas o transito inferior"],
    documentosNoAplicables: documentosNoAlturaSimple,
    familiasPreventivas: ["trabajos_criticos", "seguridad_trabajadores", "orden_aseo_housekeeping"],
    desviacionesPreventivas: ["exposicion_linea_fuego", "condicion_insegura"],
    criticidadOrientativa: "medio",
    preguntasSugeridas: ["Hay personas bajo el punto de trabajo?", "Las herramientas o materiales estan amarrados o contenidos?"],
    preguntasProhibidas: ["Resolver solo con EPP si falta segregacion inferior."],
    errorQueDebeEvitar: "No evaluar caida de objetos sin revisar zona inferior y contencion.",
  },
  plataforma: {
    tipoRiesgo: "trabajo_critico",
    actoInseguroAsociado: "usar plataforma incompleta o no inspeccionada",
    condicionInseguraAsociada: "plataforma, andamio o superficie de trabajo sin condicion segura",
    exposicion: "trabajadores que se apoyan, transitan o ejecutan tareas desde una superficie elevada",
    consecuenciaProbable: "caida, volcamiento, colapso parcial o atrapamiento",
    controlFaltanteOFallido: "inspeccion, barandas, rodapie, nivelacion, tarjeta o estabilidad no verificada",
    controlesEsperados: ["inspeccion previa", "barandas", "rodapie", "plataforma completa", "estabilidad y nivelacion"],
    accionInmediataSugerida: "Bloquear uso de la plataforma hasta inspeccionar, completar componentes y validar estabilidad.",
    documentosAplicables: ["Registro de inspeccion si aplica", ...documentosAltura],
    documentosNoAplicables: ["HDS/SDS si no hay sustancias"],
    familiasPreventivas: ["trabajos_criticos", "mantencion_certificacion", "seguridad_trabajadores"],
    desviacionesPreventivas: ["control_critico_ausente_no_verificado", "condicion_insegura"],
    criticidadOrientativa: "alto",
    preguntasSugeridas: ["La plataforma esta completa e inspeccionada?", "Tiene barandas, rodapie y acceso seguro?"],
    preguntasProhibidas: ["Aceptar uso de plataforma por experiencia del trabajador sin inspeccion."],
    errorQueDebeEvitar: "No habilitar trabajo sobre plataforma con componentes faltantes.",
  },
  acceso: {
    tipoRiesgo: "operacional",
    actoInseguroAsociado: "subir, bajar o trasladarse por acceso no seguro",
    condicionInseguraAsociada: "escalera, acceso temporal o ruta elevada sin control suficiente",
    exposicion: "trabajadores que ingresan o salen del punto elevado con herramientas o materiales",
    consecuenciaProbable: "caida, tropiezo, golpe o perdida de equilibrio",
    controlFaltanteOFallido: "amarre, apoyo, tres puntos de contacto, pasarela o ruta segura no verificada",
    controlesEsperados: ["escalera en buen estado", "amarre o apoyo estable", "pasarela segura", "ruta despejada"],
    accionInmediataSugerida: "Suspender el acceso inseguro y habilitar medio de subida, bajada o circulacion estable.",
    documentosAplicables: ["AST/ART si el acceso forma parte de trabajo en altura"],
    documentosNoAplicables: documentosNoAlturaSimple,
    familiasPreventivas: ["trabajos_criticos", "seguridad_trabajadores", "orden_aseo_housekeeping"],
    desviacionesPreventivas: ["condicion_insegura", "desplazamiento_terreno_inestable"],
    criticidadOrientativa: "medio",
    preguntasSugeridas: ["El acceso permite tres puntos de apoyo o circulacion segura?", "La escalera o plataforma esta firme y asegurada?"],
    preguntasProhibidas: ["Pedir PTS como control principal si basta retirar una escala defectuosa simple."],
    errorQueDebeEvitar: "No confundir acceso temporal inseguro con un problema menor de comodidad.",
  },
  herramienta_altura: {
    tipoRiesgo: "seguridad_personas",
    actoInseguroAsociado: "usar herramienta en altura sin control de proyeccion o caida",
    condicionInseguraAsociada: "herramienta, cable, broca, disco o accesorio sin condicion segura",
    exposicion: "trabajador que opera la herramienta y personas bajo o junto al punto de trabajo",
    consecuenciaProbable: "corte, proyeccion de particulas, caida de herramienta o contacto accidental",
    controlFaltanteOFallido: "amarre, proteccion ocular, guarda, cable seguro o segregacion no implementada",
    controlesEsperados: ["amarre de herramienta", "proteccion ocular", "guarda operativa", "segregacion", "revision previa"],
    accionInmediataSugerida: "Detener uso de la herramienta hasta controlar proyeccion, caida y condicion electrica o mecanica.",
    documentosAplicables: ["AST/ART si hay corte, perforacion o esmerilado en altura"],
    documentosNoAplicables: ["PTS si la tarea es ajuste manual simple y controlado"],
    familiasPreventivas: ["herramientas_equipos", "epp", "seguridad_trabajadores"],
    desviacionesPreventivas: ["uso_inadecuado_herramienta_equipo_maquinaria", "condicion_insegura"],
    criticidadOrientativa: "medio",
    preguntasSugeridas: ["La herramienta esta asegurada contra caida?", "Hay proteccion ocular y segregacion del radio de proyeccion?"],
    preguntasProhibidas: ["Clasificar solo como falta de EPP si tambien falta control de herramienta."],
    errorQueDebeEvitar: "No reducir uso de herramienta en altura a una recomendacion generica de cuidado.",
  },
  electrico: {
    tipoRiesgo: "trabajo_critico",
    actoInseguroAsociado: "intervenir o manipular energia sin control verificable",
    condicionInseguraAsociada: "circuito, cable, luminaria o tablero con energia no controlada",
    exposicion: "trabajadores que instalan, conectan, perforan o manipulan equipos electricos en altura",
    consecuenciaProbable: "contacto electrico, caida secundaria, arco, quemadura o incendio",
    controlFaltanteOFallido: "bloqueo, verificacion de ausencia de tension, aislacion o autorizacion tecnica faltante",
    controlesEsperados: ["bloqueo/LOTO", "verificacion sin tension", "herramienta aislada", "responsable autorizado"],
    accionInmediataSugerida: "Detener la intervencion y bloquear energia hasta verificar ausencia de tension y responsable autorizado.",
    documentosAplicables: documentosElectricos,
    documentosNoAplicables: ["Permiso de excavacion si no hay intervencion de suelo"],
    familiasPreventivas: ["energia_loto_electrico", "trabajos_criticos", "seguridad_trabajadores"],
    desviacionesPreventivas: ["control_critico_ausente_no_verificado", "trabajo_critico_sin_autorizacion_control"],
    criticidadOrientativa: "critico",
    preguntasSugeridas: ["Existe energia presente o posible retorno?", "Se aplico bloqueo y verificacion de ausencia de tension?"],
    preguntasProhibidas: ["Tratar energia no controlada como simple uso de EPP."],
    errorQueDebeEvitar: "No permitir intervencion electrica con energia no verificada.",
  },
  izaje_montaje: {
    tipoRiesgo: "trabajo_critico",
    actoInseguroAsociado: "permanecer en linea de fuego durante izaje o posicionamiento",
    condicionInseguraAsociada: "carga suspendida, elemento inestable o maniobra sin radio controlado",
    exposicion: "montajistas, senalero, rigger, operadores y terceros dentro del radio de carga",
    consecuenciaProbable: "aplastamiento, golpe grave, atrapamiento o colapso de elemento",
    controlFaltanteOFallido: "plan de izaje, aparejos, senalero, segregacion o estabilidad temporal no verificados",
    controlesEsperados: ["plan de izaje", "rigger o senalero", "radio de exclusion", "aparejos certificados", "anclaje temporal"],
    accionInmediataSugerida: "Detener maniobra, retirar personas del radio y verificar aparejos, senalero y estabilidad del elemento.",
    documentosAplicables: documentosIzaje,
    documentosNoAplicables: ["HDS/SDS si no hay sustancias"],
    familiasPreventivas: ["izaje_gruas_amarre", "trabajos_criticos", "seguridad_trabajadores"],
    desviacionesPreventivas: ["paso_bajo_carga_suspendida", "exposicion_linea_fuego"],
    criticidadOrientativa: "critico",
    preguntasSugeridas: ["Hay personas dentro del radio de carga?", "Los aparejos y anclajes temporales estan verificados?"],
    preguntasProhibidas: ["Aceptar transito bajo carga por tratarse de maniobra breve."],
    errorQueDebeEvitar: "No normalizar paso o permanencia bajo carga suspendida.",
  },
  clima: {
    tipoRiesgo: "operacional",
    actoInseguroAsociado: "continuar trabajo elevado sin reevaluar clima",
    condicionInseguraAsociada: "viento, lluvia, baja visibilidad o superficie resbaladiza",
    exposicion: "trabajadores en altura, equipos de levante, cubiertas y accesos temporales",
    consecuenciaProbable: "caida, perdida de control, deslizamiento, golpe por material o volcamiento",
    controlFaltanteOFallido: "reevaluacion climatica, pausa, detencion o reprogramacion no definida",
    controlesEsperados: ["monitoreo de viento", "pausa o detencion", "superficie seca", "reprogramacion", "supervision"],
    accionInmediataSugerida: "Reevaluar condiciones climaticas y detener la actividad si el control de altura o izaje se degrada.",
    documentosAplicables: ["AST/ART actualizado si cambia la condicion", "Matriz de riesgos"],
    documentosNoAplicables: ["Permiso especial si no existe trabajo critico"],
    familiasPreventivas: ["clima_entorno", "trabajos_criticos", "seguridad_trabajadores"],
    desviacionesPreventivas: ["condicion_climatica_o_terreno_aumenta_riesgo", "condicion_insegura"],
    criticidadOrientativa: "alto",
    preguntasSugeridas: ["El clima afecta estabilidad, visibilidad o adherencia?", "Corresponde detener altura, izaje o cubierta?"],
    preguntasProhibidas: ["Ignorar clima en trabajos elevados o con carga suspendida."],
    errorQueDebeEvitar: "No mantener actividad critica si el clima degrada controles.",
  },
  epp_altura: {
    tipoRiesgo: "trabajo_critico",
    actoInseguroAsociado: "usar o no usar EPP anticaidas de forma incorrecta",
    condicionInseguraAsociada: "arnes, cabo, barboquejo, guantes o proteccion ocular ausente o deteriorada",
    exposicion: "trabajador que depende del EPP como control complementario durante tarea elevada",
    consecuenciaProbable: "caida, golpe, corte o lesion por falla de proteccion personal",
    controlFaltanteOFallido: "inspeccion, uso correcto, compatibilidad o reposicion de EPP no verificada",
    controlesEsperados: ["arnes inspeccionado", "cabo compatible", "barboquejo si aplica", "guantes", "proteccion ocular"],
    accionInmediataSugerida: "Corregir uso o retirar EPP defectuoso antes de permitir continuidad del trabajo elevado.",
    documentosAplicables: ["Registro de inspeccion de EPP si aplica", "Charla o difusion si aplica"],
    documentosNoAplicables: ["PTS si el hallazgo se resuelve solo con reposicion inmediata de EPP simple"],
    familiasPreventivas: ["epp", "trabajos_criticos", "seguridad_trabajadores"],
    desviacionesPreventivas: ["incumplimiento_control_critico", "condicion_insegura"],
    criticidadOrientativa: "alto",
    preguntasSugeridas: ["El EPP anticaidas esta inspeccionado y conectado?", "El EPP complementario es adecuado al peligro?"],
    preguntasProhibidas: ["Culpar al trabajador sin revisar disponibilidad, instruccion y supervision."],
    errorQueDebeEvitar: "No reemplazar controles fisicos por EPP cuando falta baranda o segregacion.",
  },
  documental_altura: {
    tipoRiesgo: "documental",
    actoInseguroAsociado: "ejecutar actividad critica sin autorizacion o analisis vigente",
    condicionInseguraAsociada: "documento habilitante no disponible, no difundido o no aplicable a la condicion real",
    exposicion: "cuadrilla que ejecuta altura, montaje, plataforma elevadora, cubierta o intervencion electrica",
    consecuenciaProbable: "control preventivo incompleto, decision no trazable o continuidad con riesgo no evaluado",
    controlFaltanteOFallido: "permiso, AST/ART, PTS, matriz o autorizacion no verificada",
    controlesEsperados: ["permiso vigente", "AST/ART", "PTS si aplica", "matriz actualizada", "difusion"],
    accionInmediataSugerida: "Detener la tarea critica y regularizar autorizacion, analisis y difusion antes de reanudar.",
    documentosAplicables: ["Permiso/autorizacion", "AST/ART", "PTS si aplica", "Matriz de riesgos"],
    documentosNoAplicables: ["HDS/SDS si no hay sustancias"],
    familiasPreventivas: ["documental_legal", "trabajos_criticos", "capacitacion_evidencias"],
    desviacionesPreventivas: ["omision_documental", "trabajo_critico_sin_autorizacion_control"],
    criticidadOrientativa: "alto",
    preguntasSugeridas: ["La tarea requiere permiso o autorizacion?", "El documento refleja la condicion real del trabajo?"],
    preguntasProhibidas: ["Exigir documentos para correcciones menores sin tarea critica."],
    errorQueDebeEvitar: "No usar documentacion como sustituto de un control fisico faltante.",
  },
  orden_altura: {
    tipoRiesgo: "operacional",
    actoInseguroAsociado: "mantener desorden o acopio inseguro en superficie elevada",
    condicionInseguraAsociada: "materiales, cables, residuos o piezas sueltas en punto de trabajo",
    exposicion: "trabajadores que transitan o ejecutan tareas sobre andamio, cubierta, plataforma o acceso",
    consecuenciaProbable: "tropiezo, caida, golpe por objeto o interferencia operacional",
    controlFaltanteOFallido: "retiro, acopio, ruta despejada o control de cables no aplicado",
    controlesEsperados: ["retiro de residuos", "acopio definido", "ruta despejada", "amarre de materiales"],
    accionInmediataSugerida: "Ordenar la superficie elevada, retirar materiales sueltos y liberar rutas antes de continuar.",
    documentosAplicables: [],
    documentosNoAplicables: documentosNoAlturaSimple,
    familiasPreventivas: ["orden_aseo_housekeeping", "seguridad_trabajadores"],
    desviacionesPreventivas: ["condicion_insegura"],
    criticidadOrientativa: "medio",
    preguntasSugeridas: ["El desorden afecta paso, borde o caida de objetos?", "Puede corregirse con retiro inmediato?"],
    preguntasProhibidas: ["Sobredocumentar una limpieza simple como trabajo critico."],
    errorQueDebeEvitar: "No elevar a brecha documental una condicion simple de orden corregible.",
  },
  material_cortante: {
    tipoRiesgo: "seguridad_personas",
    actoInseguroAsociado: "manipular pieza cortante sin metodo o proteccion suficiente",
    condicionInseguraAsociada: "plancha, canaleta, lata, perfil o borde filoso expuesto",
    exposicion: "manos, antebrazos, rostro y personas cercanas durante corte, traslado o fijacion",
    consecuenciaProbable: "corte, laceracion, proyeccion de particulas o caida de pieza",
    controlFaltanteOFallido: "guantes anticorte, proteccion ocular, sujecion o retiro de rebabas no aplicado",
    controlesEsperados: ["guantes anticorte", "proteccion ocular", "sujecion", "retiro de rebabas", "metodo de corte"],
    accionInmediataSugerida: "Detener manipulacion, proteger bordes y asegurar pieza antes de cortar, fijar o trasladar.",
    documentosAplicables: ["AST/ART si hay corte o esmerilado en altura"],
    documentosNoAplicables: ["PTS si solo corresponde cubrir o retirar borde menor"],
    familiasPreventivas: ["herramientas_equipos", "epp", "seguridad_trabajadores"],
    desviacionesPreventivas: ["condicion_insegura", "uso_inadecuado_herramienta_equipo_maquinaria"],
    criticidadOrientativa: "medio",
    preguntasSugeridas: ["La pieza tiene borde cortante o rebaba expuesta?", "Existe sujecion y EPP anticorte?"],
    preguntasProhibidas: ["Resolver solo con charla si el borde permanece expuesto."],
    errorQueDebeEvitar: "No permitir manipulacion de piezas cortantes sin control fisico o EPP adecuado.",
  },
  equipo_elevacion: {
    tipoRiesgo: "trabajo_critico",
    actoInseguroAsociado: "operar equipo elevador sin condicion o competencia verificada",
    condicionInseguraAsociada: "plataforma elevadora, estabilizador, mando o terreno sin inspeccion suficiente",
    exposicion: "operador, trabajador en canastillo y personas dentro del radio del equipo",
    consecuenciaProbable: "volcamiento, caida, atrapamiento o golpe contra estructura",
    controlFaltanteOFallido: "inspeccion, estabilizacion, autorizacion de operador o control de terreno faltante",
    controlesEsperados: ["checklist", "operador autorizado", "estabilizadores", "terreno firme", "segregacion"],
    accionInmediataSugerida: "Retirar equipo de servicio hasta verificar inspeccion, operador, estabilizadores y terreno.",
    documentosAplicables: ["Checklist o inspeccion del equipo", "Autorizacion de operador", "AST/ART"],
    documentosNoAplicables: ["HDS/SDS si no hay sustancias"],
    familiasPreventivas: ["maquinaria_instalaciones", "trabajos_criticos", "mantencion_certificacion"],
    desviacionesPreventivas: ["control_critico_ausente_no_verificado", "condicion_insegura"],
    criticidadOrientativa: "alto",
    preguntasSugeridas: ["El equipo tiene inspeccion y operador autorizado?", "El terreno soporta estabilizadores o ruedas?"],
    preguntasProhibidas: ["Tratar plataforma elevadora como una escalera comun."],
    errorQueDebeEvitar: "No operar equipo elevador sobre terreno o estabilizacion no verificada.",
  },
  segregacion: {
    tipoRiesgo: "seguridad_personas",
    actoInseguroAsociado: "ingresar o permitir ingreso a zona inferior o restringida",
    condicionInseguraAsociada: "area inferior, radio de izaje o perimetro sin segregacion efectiva",
    exposicion: "peatones, terceros, cuadrillas simultaneas y trabajadores bajo actividad elevada",
    consecuenciaProbable: "golpe por objeto, contacto con carga, caida secundaria o interferencia operacional",
    controlFaltanteOFallido: "barrera, senalizacion, control de acceso o vigilancia no implementada",
    controlesEsperados: ["barrera fisica", "senalizacion", "control de acceso", "vigia si aplica"],
    accionInmediataSugerida: "Cerrar el perimetro, retirar personas expuestas y mantener control de acceso mientras dure la actividad.",
    documentosAplicables: ["AST/ART si hay simultaneidad o trabajo critico"],
    documentosNoAplicables: ["Certificacion si solo corresponde barrera o senalizacion"],
    familiasPreventivas: ["senalizacion_segregacion", "seguridad_trabajadores", "trabajos_criticos"],
    desviacionesPreventivas: ["evasion_barreras_senalizacion_segregacion", "acceso_zona_delimitada_sin_autorizacion"],
    criticidadOrientativa: "alto",
    preguntasSugeridas: ["La barrera impide acceso real?", "Hay personas bajo el trabajo o dentro del radio?"],
    preguntasProhibidas: ["Aceptar cinta o letrero como unico control ante riesgo grave."],
    errorQueDebeEvitar: "No confundir advertencia visual con segregacion efectiva.",
  },
  dano_material: {
    tipoRiesgo: "dano_material",
    actoInseguroAsociado: "maniobrar o fijar elementos sin proteger instalaciones existentes",
    condicionInseguraAsociada: "elemento, equipo, fachada, cubierta o instalacion expuesta a dano",
    exposicion: "infraestructura, terminaciones, equipos, luminarias o servicios cercanos al punto de trabajo",
    consecuenciaProbable: "dano material, perdida de continuidad operacional o reparacion no planificada",
    controlFaltanteOFallido: "proteccion, trazado, apoyo temporal o verificacion de interferencias faltante",
    controlesEsperados: ["proteccion de superficies", "trazado previo", "apoyo temporal", "verificacion de interferencias"],
    accionInmediataSugerida: "Detener maniobra y proteger infraestructura antes de continuar instalacion, corte o montaje.",
    documentosAplicables: ["Registro de interferencias si aplica", "Planificacion de montaje si corresponde"],
    documentosNoAplicables: ["PTS si solo corresponde proteger o aislar dano menor"],
    familiasPreventivas: ["dano_material", "maquinaria_instalaciones", "orden_aseo_housekeeping"],
    desviacionesPreventivas: ["dano_material", "falla_supervision_control_operacional"],
    criticidadOrientativa: "medio",
    preguntasSugeridas: ["Existe infraestructura o equipo expuesto a dano?", "El control evita impacto durante montaje o perforacion?"],
    preguntasProhibidas: ["Clasificar dano material simple como riesgo fatal si no hay exposicion de personas."],
    errorQueDebeEvitar: "No omitir dano material cuando puede afectar continuidad o servicios.",
  },
};

const PERFILES_RIESGO_C: Record<CategoriaRiesgoBloqueC, PerfilRiesgoBloqueC> = {
  contacto_electrico: {
    tipoRiesgo: "trabajo_critico",
    actoInseguroAsociado: "intervenir o aproximarse a partes electricas sin control verificable",
    condicionInseguraAsociada: "conductor, tablero, caja o equipo con posibilidad de energia no controlada",
    exposicion: "trabajadores que manipulan, prueban, conectan o perforan cerca de componentes electricos",
    consecuenciaProbable: "contacto electrico, quemadura, arco, caida secundaria o incendio",
    controlFaltanteOFallido: "aislacion, distancia, bloqueo, verificacion sin tension o autorizacion tecnica insuficiente",
    controlesEsperados: ["bloqueo/LOTO", "verificacion de ausencia de tension", "herramienta aislada", "responsable autorizado"],
    accionInmediataSugerida: "Detener la intervencion, aislar el punto y verificar ausencia de tension antes de continuar.",
    documentosAplicables: documentosElectricos,
    documentosNoAplicables: ["Permiso de excavacion si no hay intervencion de suelo"],
    familiasPreventivas: ["energia_loto_electrico", "trabajos_criticos", "seguridad_trabajadores"],
    desviacionesPreventivas: ["control_critico_ausente_no_verificado", "trabajo_critico_sin_autorizacion_control"],
    criticidadOrientativa: "critico",
    preguntasSugeridas: ["Existe energia presente o posible retorno?", "Se verifico ausencia de tension con instrumento adecuado?"],
    preguntasProhibidas: ["Tratar energia no controlada como simple falta de EPP."],
    errorQueDebeEvitar: "No permitir continuidad de una intervencion electrica sin control de energia.",
  },
  energia_loto: {
    tipoRiesgo: "trabajo_critico",
    actoInseguroAsociado: "realizar prueba o intervencion sin bloqueo o control de energias",
    condicionInseguraAsociada: "energia electrica, presion, fluido o retorno posible sin bloqueo efectivo",
    exposicion: "cuadrilla tecnica expuesta a energizacion, liberacion o arranque inesperado",
    consecuenciaProbable: "electrocucion, golpe, proyeccion de fluido, atrapamiento o dano a instalacion",
    controlFaltanteOFallido: "bloqueo, etiquetado, purga, descarga o verificacion de energia cero no demostrada",
    controlesEsperados: ["bloqueo/LOTO", "etiquetado", "purga o descarga", "verificacion previa", "responsable definido"],
    accionInmediataSugerida: "Bloquear o descargar la energia y verificar condicion segura antes de intervenir o probar.",
    documentosAplicables: ["Bloqueo/LOTO", "AST/ART", "Autorizacion tecnica"],
    documentosNoAplicables: ["HDS/SDS si no hay sustancias"],
    familiasPreventivas: ["energia_loto_electrico", "trabajos_criticos", "documental_legal"],
    desviacionesPreventivas: ["incumplimiento_control_critico", "control_critico_ausente_no_verificado"],
    criticidadOrientativa: "critico",
    preguntasSugeridas: ["La energia fue bloqueada, purgada o descargada?", "Hay retorno o presion residual posible?"],
    preguntasProhibidas: ["Autorizar prueba solo por experiencia del tecnico."],
    errorQueDebeEvitar: "No omitir bloqueo cuando hay energia peligrosa o presion acumulada.",
  },
  tablero_proteccion: {
    tipoRiesgo: "trabajo_critico",
    actoInseguroAsociado: "usar tablero sin proteccion, cierre o control de acceso",
    condicionInseguraAsociada: "tablero, caja o proteccion diferencial incompleta, abierta o sin identificacion",
    exposicion: "trabajadores, usuarios de extensiones y terceros que acceden al punto de alimentacion",
    consecuenciaProbable: "contacto electrico, arco, sobrecarga, falla de circuito o incendio",
    controlFaltanteOFallido: "proteccion diferencial, tapa, rotulacion, cierre o inspeccion del tablero no verificada",
    controlesEsperados: ["proteccion diferencial", "tapa o cierre", "rotulacion", "control de acceso", "inspeccion"],
    accionInmediataSugerida: "Restringir uso del tablero y corregir protecciones, rotulos y cierre antes de energizar.",
    documentosAplicables: ["Registro de inspeccion electrica si aplica", ...documentosElectricos],
    documentosNoAplicables: ["Permiso especial si solo corresponde cerrar o rotular tablero sin intervencion energizada"],
    familiasPreventivas: ["energia_loto_electrico", "mantencion_certificacion", "senalizacion_segregacion"],
    desviacionesPreventivas: ["condicion_insegura", "control_critico_ausente_no_verificado"],
    criticidadOrientativa: "alto",
    preguntasSugeridas: ["El tablero tiene proteccion diferencial y cierre efectivo?", "Esta identificado el circuito intervenido?"],
    preguntasProhibidas: ["Aceptar tablero abierto por tratarse de instalacion provisoria."],
    errorQueDebeEvitar: "No normalizar tableros provisorios sin proteccion ni rotulacion.",
  },
  cable_extension: {
    tipoRiesgo: "seguridad_personas",
    actoInseguroAsociado: "usar cable, enchufe o extension deteriorada o mal dispuesta",
    condicionInseguraAsociada: "cable cortado, empalme expuesto, enchufe reparado o extension en ruta de paso",
    exposicion: "trabajadores que manipulan herramientas, transitan o trabajan cerca de conductores temporales",
    consecuenciaProbable: "contacto electrico, tropiezo, cortocircuito, incendio o dano de herramienta",
    controlFaltanteOFallido: "retiro, proteccion mecanica, canalizacion temporal o inspeccion de cables insuficiente",
    controlesEsperados: ["retiro de cable danado", "proteccion mecanica", "ruta ordenada", "enchufe certificado"],
    accionInmediataSugerida: "Retirar extension o cable defectuoso y reordenar la alimentacion antes de continuar.",
    documentosAplicables: ["Registro de inspeccion si aplica"],
    documentosNoAplicables: documentosNoInstalacionSimple,
    familiasPreventivas: ["energia_loto_electrico", "orden_aseo_housekeeping", "herramientas_equipos"],
    desviacionesPreventivas: ["condicion_insegura", "herramienta_equipo_mal_estado_usado_terreno"],
    criticidadOrientativa: "medio",
    preguntasSugeridas: ["El cable o extension presenta dano visible?", "La ruta evita transito, agua y atrapamiento?"],
    preguntasProhibidas: ["Pedir PTS como control principal si basta retirar un cable defectuoso."],
    errorQueDebeEvitar: "No dejar cables danados disponibles aunque la herramienta aun funcione.",
  },
  sobrecarga_humedad: {
    tipoRiesgo: "trabajo_critico",
    actoInseguroAsociado: "mantener equipos electricos energizados con humedad o sobrecarga",
    condicionInseguraAsociada: "alimentacion electrica expuesta a agua, condensacion, lluvia o consumo excesivo",
    exposicion: "usuarios de herramientas, cuadrillas cercanas y personas que transitan por el sector",
    consecuenciaProbable: "contacto electrico, disparo de proteccion, incendio o falla de equipo",
    controlFaltanteOFallido: "proteccion contra humedad, diferencial, canalizacion, carga admisible o inspeccion faltante",
    controlesEsperados: ["proteccion contra humedad", "diferencial operativo", "carga controlada", "canalizacion segura"],
    accionInmediataSugerida: "Desenergizar el punto afectado y corregir humedad o sobrecarga antes de reponer servicio.",
    documentosAplicables: documentosElectricos,
    documentosNoAplicables: ["HDS/SDS si no hay sustancias"],
    familiasPreventivas: ["energia_loto_electrico", "equipos_emergencia", "seguridad_trabajadores"],
    desviacionesPreventivas: ["control_critico_ausente_no_verificado", "condicion_insegura"],
    criticidadOrientativa: "alto",
    preguntasSugeridas: ["Existe agua, humedad o sobrecarga en el punto electrico?", "La proteccion diferencial opera correctamente?"],
    preguntasProhibidas: ["Continuar solo secando superficialmente sin revisar energia."],
    errorQueDebeEvitar: "No minimizar humedad cercana a electricidad en instalaciones temporales o definitivas.",
  },
  herramienta_electrica: {
    tipoRiesgo: "seguridad_personas",
    actoInseguroAsociado: "usar herramienta electrica sin inspeccion o accesorio compatible",
    condicionInseguraAsociada: "taladro, esmeril, perforadora o accesorio con dano, guarda ausente o cable defectuoso",
    exposicion: "operador y personas cercanas al radio de corte, perforacion, proyeccion o alimentacion electrica",
    consecuenciaProbable: "corte, atrapamiento, proyeccion, contacto electrico o golpe por perdida de control",
    controlFaltanteOFallido: "inspeccion, guarda, accesorio compatible, proteccion ocular o alimentacion segura faltante",
    controlesEsperados: ["inspeccion previa", "guarda operativa", "accesorio compatible", "proteccion ocular", "cable seguro"],
    accionInmediataSugerida: "Retirar herramienta o accesorio no conforme y usar equipo inspeccionado antes de reanudar.",
    documentosAplicables: ["Registro de inspeccion si aplica", "AST/ART si hay corte o perforacion critica"],
    documentosNoAplicables: ["PTS si solo corresponde cambio menor de accesorio no critico"],
    familiasPreventivas: ["herramientas_equipos", "energia_loto_electrico", "epp"],
    desviacionesPreventivas: ["uso_inadecuado_herramienta_equipo_maquinaria", "herramienta_equipo_mal_estado_usado_terreno"],
    criticidadOrientativa: "medio",
    preguntasSugeridas: ["La herramienta esta inspeccionada y con guarda operativa?", "El accesorio corresponde a la tarea?"],
    preguntasProhibidas: ["Clasificar solo como falta de EPP si la herramienta esta defectuosa."],
    errorQueDebeEvitar: "No permitir uso de herramienta electrica defectuosa por urgencia de avance.",
  },
  perforacion_polvo: {
    tipoRiesgo: "salud_ocupacional",
    actoInseguroAsociado: "perforar, ranurar o cortar sin controlar polvo y particulas",
    condicionInseguraAsociada: "polvo mineral, particulas, rebaba o material proyectado sin extraccion ni humectacion",
    exposicion: "operador, ayudante y personas cercanas a la perforacion, corte o pasada tecnica",
    consecuenciaProbable: "lesion ocular, irritacion respiratoria, exposicion a silice o contaminacion de terminaciones",
    controlFaltanteOFallido: "extraccion, humectacion, proteccion respiratoria, pantalla o segregacion no implementada",
    controlesEsperados: ["extraccion o humectacion", "proteccion ocular", "proteccion respiratoria", "segregacion"],
    accionInmediataSugerida: "Detener perforacion y aplicar control de polvo, proyeccion y segregacion antes de continuar.",
    documentosAplicables: ["AST/ART si hay perforacion continua o polvo relevante", "Matriz de riesgos"],
    documentosNoAplicables: ["Permiso especial si solo es una perforacion menor controlada"],
    familiasPreventivas: ["higiene_ocupacional", "herramientas_equipos", "seguridad_trabajadores"],
    desviacionesPreventivas: ["condicion_insegura", "uso_inadecuado_herramienta_equipo_maquinaria"],
    criticidadOrientativa: "medio",
    preguntasSugeridas: ["Existe polvo, silice o proyeccion de particulas?", "Se usa extraccion, humectacion o barrera?"],
    preguntasProhibidas: ["Reducir polvo de perforacion solo a orden y aseo posterior."],
    errorQueDebeEvitar: "No omitir control de polvo cuando la tarea genera exposicion respiratoria u ocular.",
  },
  ruido_vibracion: {
    tipoRiesgo: "salud_ocupacional",
    actoInseguroAsociado: "operar herramienta ruidosa o vibratoria sin control ocupacional",
    condicionInseguraAsociada: "ruido, vibracion o percusion sostenida sin proteccion ni delimitacion",
    exposicion: "operador, ayudante y cuadrillas cercanas durante corte, perforacion o fijacion mecanica",
    consecuenciaProbable: "hipoacusia, fatiga, perdida de control de herramienta o molestia a terceros",
    controlFaltanteOFallido: "proteccion auditiva, rotacion, mantencion, segregacion o evaluacion de exposicion insuficiente",
    controlesEsperados: ["proteccion auditiva", "herramienta mantenida", "pausas", "segregacion", "aviso a cuadrillas"],
    accionInmediataSugerida: "Controlar ruido y vibracion con EPP, segregacion y herramienta en condicion antes de continuar.",
    documentosAplicables: ["Matriz de riesgos", "Registro de difusion si aplica"],
    documentosNoAplicables: ["PTS si solo corresponde controlar una tarea menor no critica"],
    familiasPreventivas: ["higiene_ocupacional", "herramientas_equipos", "capacitacion_evidencias"],
    desviacionesPreventivas: ["falta_conocimiento_capacitacion_difusion", "condicion_insegura"],
    criticidadOrientativa: "medio",
    preguntasSugeridas: ["La herramienta genera ruido o vibracion relevante?", "Existe proteccion auditiva y aviso al entorno?"],
    preguntasProhibidas: ["Ignorar ruido por tratarse de trabajo breve si afecta a terceros."],
    errorQueDebeEvitar: "No evaluar herramientas de corte solo por energia o proyeccion, omitiendo ruido.",
  },
  corte_borde: {
    tipoRiesgo: "seguridad_personas",
    actoInseguroAsociado: "manipular tuberia, ducto, canaleta o bandeja con borde filoso sin control",
    condicionInseguraAsociada: "borde metalico, rebaba, corte irregular o pieza sin proteccion",
    exposicion: "manos, antebrazos, rostro y personas que trasladan o fijan el elemento",
    consecuenciaProbable: "corte, laceracion, pinchazo, proyeccion de viruta o caida de pieza",
    controlFaltanteOFallido: "guantes anticorte, desbarbado, sujecion, proteccion de borde o metodo de traslado faltante",
    controlesEsperados: ["guantes anticorte", "desbarbado", "proteccion de borde", "sujecion", "orden de piezas"],
    accionInmediataSugerida: "Proteger bordes, retirar rebabas y asegurar la pieza antes de manipular o fijar.",
    documentosAplicables: ["AST/ART si hay corte mecanico o esmerilado"],
    documentosNoAplicables: ["PTS si solo corresponde cubrir borde menor"],
    familiasPreventivas: ["herramientas_equipos", "epp", "seguridad_trabajadores"],
    desviacionesPreventivas: ["condicion_insegura", "uso_inadecuado_herramienta_equipo_maquinaria"],
    criticidadOrientativa: "medio",
    preguntasSugeridas: ["La pieza presenta rebaba o borde cortante?", "Existe sujecion y guante compatible?"],
    preguntasProhibidas: ["Cerrar hallazgo solo con charla si el borde sigue expuesto."],
    errorQueDebeEvitar: "No permitir manipulacion de bordes filosos sin control fisico y EPP adecuado.",
  },
  caida_mismo_nivel: {
    tipoRiesgo: "operacional",
    actoInseguroAsociado: "mantener rutas con cables, mangueras, tuberias o residuos sin ordenar",
    condicionInseguraAsociada: "materiales tecnicos cruzan ruta de paso, acceso o punto de trabajo",
    exposicion: "trabajadores, supervisores y terceros que transitan por el frente de instalacion",
    consecuenciaProbable: "tropiezo, caida al mismo nivel, golpe contra material o dano de instalacion",
    controlFaltanteOFallido: "orden, ruta definida, proteccion de cables, acopio o retiro de residuos insuficiente",
    controlesEsperados: ["ruta despejada", "acopio definido", "proteccion de cables", "retiro de residuos"],
    accionInmediataSugerida: "Ordenar materiales, liberar rutas y proteger cables o mangueras antes de continuar.",
    documentosAplicables: [],
    documentosNoAplicables: documentosNoInstalacionSimple,
    familiasPreventivas: ["orden_aseo_housekeeping", "seguridad_trabajadores"],
    desviacionesPreventivas: ["condicion_insegura"],
    criticidadOrientativa: "medio",
    preguntasSugeridas: ["La ruta de paso queda libre de cables, tuberias o residuos?", "La correccion requiere retiro inmediato?"],
    preguntasProhibidas: ["Sobredocumentar un desorden simple corregible en terreno."],
    errorQueDebeEvitar: "No confundir orden deficiente simple con requerimiento documental innecesario.",
  },
  caida_distinto_nivel: {
    tipoRiesgo: "trabajo_critico",
    actoInseguroAsociado: "ejecutar instalacion tecnica desde altura sin acceso o proteccion suficiente",
    condicionInseguraAsociada: "escalera, plataforma, cielo falso, borde o vano sin control de caida",
    exposicion: "trabajador que instala, perfora, fija o prueba elementos sobre nivel",
    consecuenciaProbable: "caida a distinto nivel, golpe contra estructura o lesion grave",
    controlFaltanteOFallido: "acceso seguro, baranda, arnes, plataforma inspeccionada o segregacion inferior faltante",
    controlesEsperados: ["plataforma segura", "escalera asegurada", "baranda o arnes si aplica", "segregacion inferior"],
    accionInmediataSugerida: "Suspender trabajo en altura y habilitar acceso o proteccion anticaidas antes de continuar.",
    documentosAplicables: documentosAltura,
    documentosNoAplicables: ["HDS/SDS si no hay sustancias"],
    familiasPreventivas: ["trabajos_criticos", "seguridad_trabajadores", "senalizacion_segregacion"],
    desviacionesPreventivas: ["control_critico_ausente_no_verificado", "condicion_insegura"],
    criticidadOrientativa: "alto",
    preguntasSugeridas: ["La tarea se ejecuta sobre escalera, plataforma, cielo o borde?", "El acceso esta inspeccionado y protegido?"],
    preguntasProhibidas: ["Tratar trabajo sobre cielo o escalera como tarea de piso sin altura."],
    errorQueDebeEvitar: "No permitir instalacion sobre altura sin revisar acceso, caida y zona inferior.",
  },
  caida_objetos: {
    tipoRiesgo: "seguridad_personas",
    actoInseguroAsociado: "dejar herramientas, fijaciones o tramos sin contencion sobre altura",
    condicionInseguraAsociada: "pieza, ducto, tuberia, luminaria o herramienta puede caer a nivel inferior",
    exposicion: "personas que circulan bajo el punto de instalacion o dentro del radio de trabajo",
    consecuenciaProbable: "golpe por caida de objeto, lesion craneal, dano material o interrupcion de servicio",
    controlFaltanteOFallido: "amarre, bandeja, rodapie, sujecion temporal o segregacion inferior insuficiente",
    controlesEsperados: ["amarre de herramientas", "sujecion temporal", "segregacion inferior", "orden de fijaciones"],
    accionInmediataSugerida: "Asegurar piezas y cerrar el area inferior antes de continuar instalacion sobre nivel.",
    documentosAplicables: ["AST/ART si hay trabajo sobre personas o transito inferior"],
    documentosNoAplicables: ["PTS si solo corresponde retirar pieza menor"],
    familiasPreventivas: ["trabajos_criticos", "seguridad_trabajadores", "orden_aseo_housekeeping"],
    desviacionesPreventivas: ["exposicion_linea_fuego", "condicion_insegura"],
    criticidadOrientativa: "medio",
    preguntasSugeridas: ["Hay personas bajo el punto de instalacion?", "Las piezas y herramientas estan contenidas?"],
    preguntasProhibidas: ["Aceptar solo casco como control si falta segregacion inferior."],
    errorQueDebeEvitar: "No omitir caida de objetos en instalaciones sobre cielo, plataforma o borde.",
  },
  manipulacion_manual: {
    tipoRiesgo: "salud_ocupacional",
    actoInseguroAsociado: "trasladar o posicionar elementos tecnicos pesados sin metodo definido",
    condicionInseguraAsociada: "tuberia, ducto, tablero, equipo o rollo supera manejo manual seguro",
    exposicion: "trabajadores que levantan, empujan, sostienen o posicionan cargas tecnicas",
    consecuenciaProbable: "sobreesfuerzo, golpe, atrapamiento de manos o caida de material",
    controlFaltanteOFallido: "ayuda mecanica, trabajo en equipo, ruta despejada o tecnica de levantamiento faltante",
    controlesEsperados: ["ayuda mecanica", "dos o mas personas si aplica", "ruta despejada", "apoyo temporal"],
    accionInmediataSugerida: "Reorganizar el traslado y usar apoyo mecanico o equipo suficiente antes de manipular la carga.",
    documentosAplicables: ["AST/ART si la carga es pesada o se instala en altura"],
    documentosNoAplicables: ["Permiso especial si solo corresponde reubicar carga menor"],
    familiasPreventivas: ["ergonomia_manejo_manual", "seguridad_trabajadores", "orden_aseo_housekeeping"],
    desviacionesPreventivas: ["condicion_insegura", "falla_supervision_control_operacional"],
    criticidadOrientativa: "medio",
    preguntasSugeridas: ["La carga requiere apoyo mecanico o mas trabajadores?", "La ruta y postura permiten traslado seguro?"],
    preguntasProhibidas: ["Culpar al trabajador sin revisar peso, apoyo y planificacion."],
    errorQueDebeEvitar: "No evaluar manipulacion de ductos o tuberias solo como avance operacional.",
  },
  postura_forzada: {
    tipoRiesgo: "salud_ocupacional",
    actoInseguroAsociado: "trabajar en postura sostenida sin pausas, apoyo o herramienta adecuada",
    condicionInseguraAsociada: "trabajo sobre cabeza, en espacio reducido, bajo losa o con alcance excesivo",
    exposicion: "trabajadores que fijan, conectan, sellan o perforan instalaciones tecnicas",
    consecuenciaProbable: "trastorno musculoesqueletico, perdida de control de herramienta o golpe secundario",
    controlFaltanteOFallido: "apoyo ergonomico, plataforma adecuada, herramienta extendida, pausa o rotacion faltante",
    controlesEsperados: ["plataforma adecuada", "herramienta compatible", "pausas", "rotacion", "apoyo temporal"],
    accionInmediataSugerida: "Ajustar metodo de trabajo, altura de acceso o apoyo antes de continuar la tarea repetitiva.",
    documentosAplicables: ["Matriz de riesgos", "AST/ART si la postura deriva de cambio de metodo"],
    documentosNoAplicables: ["PTS si solo corresponde ajustar postura o apoyo simple"],
    familiasPreventivas: ["ergonomia_manejo_manual", "seguridad_trabajadores"],
    desviacionesPreventivas: ["condicion_insegura", "falla_supervision_control_operacional"],
    criticidadOrientativa: "medio",
    preguntasSugeridas: ["La postura obliga a trabajar sobre cabeza o con alcance excesivo?", "Existe apoyo o rotacion?"],
    preguntasProhibidas: ["Ignorar postura por no existir lesion inmediata."],
    errorQueDebeEvitar: "No omitir ergonomia en instalaciones sobre cielo, ductos o redes elevadas.",
  },
  vapores_quimicos: {
    tipoRiesgo: "salud_ocupacional",
    actoInseguroAsociado: "usar adhesivo, solvente, sello o combustible sin control de exposicion",
    condicionInseguraAsociada: "producto quimico sin ventilacion, HDS/SDS, rotulacion o contencion suficiente",
    exposicion: "trabajadores que aplican, mezclan, limpian o almacenan sustancias en espacios de obra",
    consecuenciaProbable: "irritacion, intoxicacion, incendio, reaccion quimica o contaminacion ambiental",
    controlFaltanteOFallido: "HDS/SDS, ventilacion, rotulacion, EPP, contencion o fuente de ignicion controlada faltante",
    controlesEsperados: ["HDS/SDS", "ventilacion", "rotulacion", "EPP compatible", "control de ignicion"],
    accionInmediataSugerida: "Detener uso del producto y regularizar HDS/SDS, ventilacion, rotulacion y contencion.",
    documentosAplicables: ["HDS/SDS", "Matriz de riesgos", "AST/ART si hay aplicacion relevante"],
    documentosNoAplicables: ["Permiso electrico si no hay energia involucrada"],
    familiasPreventivas: ["sustancias_hds", "higiene_ocupacional", "medio_ambiente"],
    desviacionesPreventivas: ["omision_documental", "evento_ambiental"],
    criticidadOrientativa: "medio",
    preguntasSugeridas: ["Se usan adhesivos, solventes, sellantes o combustibles?", "Existe HDS/SDS y ventilacion suficiente?"],
    preguntasProhibidas: ["Pedir HDS/SDS cuando no hay sustancia quimica involucrada."],
    errorQueDebeEvitar: "No omitir control quimico cuando la instalacion usa sellos, adhesivos o combustibles.",
  },
  aguas_residuales: {
    tipoRiesgo: "salud_ocupacional",
    actoInseguroAsociado: "intervenir red sanitaria o drenaje sin controlar contacto biologico",
    condicionInseguraAsociada: "agua residual, lodo, obstruccion o material contaminado sin segregacion ni higiene",
    exposicion: "trabajadores que manipulan tuberias, camaras, bajadas o drenajes con posible contaminacion",
    consecuenciaProbable: "contacto biologico, irritacion, infeccion, resbalon o contaminacion de area",
    controlFaltanteOFallido: "aislamiento, guantes, lavado, contencion, retiro o segregacion de residuos insuficiente",
    controlesEsperados: ["segregacion", "guantes compatibles", "lavado", "contencion", "retiro controlado"],
    accionInmediataSugerida: "Aislar el punto contaminado, contener fluidos y aplicar higiene antes de continuar.",
    documentosAplicables: ["AST/ART si hay intervencion sanitaria", "Registro de limpieza si aplica"],
    documentosNoAplicables: ["HDS/SDS si no hay producto quimico"],
    familiasPreventivas: ["higiene_ocupacional", "medio_ambiente", "orden_aseo_housekeeping"],
    desviacionesPreventivas: ["condicion_insegura", "evento_ambiental"],
    criticidadOrientativa: "medio",
    preguntasSugeridas: ["Existe contacto con agua residual o material contaminado?", "Hay contencion e higiene posterior?"],
    preguntasProhibidas: ["Clasificar contacto sanitario solo como desorden o aseo."],
    errorQueDebeEvitar: "No omitir control biologico en redes sanitarias o drenajes contaminados.",
  },
  fuga_fluidos: {
    tipoRiesgo: "operacional",
    actoInseguroAsociado: "mantener instalacion con fuga sin contener ni reparar",
    condicionInseguraAsociada: "fuga de agua, fluido, condensado o red presurizada sin control",
    exposicion: "trabajadores, usuarios, equipos electricos, terminaciones y rutas cercanas al punto de fuga",
    consecuenciaProbable: "resbalon, dano material, contacto con energia, humedad estructural o perdida de servicio",
    controlFaltanteOFallido: "corte de suministro, contencion, reparacion, drenaje o aviso operativo insuficiente",
    controlesEsperados: ["corte de suministro", "contencion", "reparacion", "drenaje", "senalizacion"],
    accionInmediataSugerida: "Cortar suministro si aplica, contener la fuga y reparar antes de liberar el area.",
    documentosAplicables: ["Registro de prueba o reparacion si aplica"],
    documentosNoAplicables: documentosNoInstalacionSimple,
    familiasPreventivas: ["maquinaria_instalaciones", "dano_material", "orden_aseo_housekeeping"],
    desviacionesPreventivas: ["condicion_insegura", "dano_material"],
    criticidadOrientativa: "medio",
    preguntasSugeridas: ["La fuga afecta transito, electricidad o terminaciones?", "Se requiere cortar suministro o contener?"],
    preguntasProhibidas: ["Tratar fuga activa como simple aseo si mantiene exposicion."],
    errorQueDebeEvitar: "No cerrar hallazgo de fuga sin verificar reparacion y contencion.",
  },
  presion_sobrepresion: {
    tipoRiesgo: "trabajo_critico",
    actoInseguroAsociado: "probar red presurizada sin aislamiento ni control del area",
    condicionInseguraAsociada: "presion, union, valvula o acople puede liberar energia de forma subita",
    exposicion: "tecnicos, ayudantes y terceros dentro del radio de proyeccion o liberacion",
    consecuenciaProbable: "golpe, proyeccion de pieza, rotura de tuberia, inundacion o dano material",
    controlFaltanteOFallido: "presion controlada, manometro, valvulas, segregacion o secuencia de prueba no verificada",
    controlesEsperados: ["manometro", "valvula controlada", "segregacion", "secuencia de prueba", "responsable"],
    accionInmediataSugerida: "Detener prueba y descargar presion hasta verificar uniones, valvulas y area segregada.",
    documentosAplicables: ["Procedimiento o registro de prueba si aplica", "AST/ART", "Matriz de riesgos"],
    documentosNoAplicables: ["HDS/SDS si no hay sustancias"],
    familiasPreventivas: ["trabajos_criticos", "maquinaria_instalaciones", "seguridad_trabajadores"],
    desviacionesPreventivas: ["incumplimiento_control_critico", "suceso_peligroso_sin_lesion"],
    criticidadOrientativa: "alto",
    preguntasSugeridas: ["La red esta presurizada o en prueba?", "El area esta segregada y con valvulas controladas?"],
    preguntasProhibidas: ["Permitir prueba de presion con personas dentro del radio de falla."],
    errorQueDebeEvitar: "No tratar sobrepresion como fuga menor cuando existe energia acumulada.",
  },
  gas_combustible: {
    tipoRiesgo: "trabajo_critico",
    actoInseguroAsociado: "intervenir o almacenar gas/combustible sin control de fuga e ignicion",
    condicionInseguraAsociada: "linea, bidon, cilindro, acople o sello con fuga o rotulacion insuficiente",
    exposicion: "trabajadores, equipos electricos, fuentes de calor y personas cercanas al punto",
    consecuenciaProbable: "incendio, explosion, intoxicacion, quemadura o dano a instalacion",
    controlFaltanteOFallido: "deteccion, ventilacion, rotulacion, contencion, cierre de valvula o control de ignicion faltante",
    controlesEsperados: ["cierre de valvula", "ventilacion", "deteccion", "rotulacion", "control de ignicion"],
    accionInmediataSugerida: "Aislar fuente, ventilar y retirar ignicion hasta verificar ausencia de fuga.",
    documentosAplicables: ["HDS/SDS si aplica", "Permiso o autorizacion de trabajo si corresponde", "AST/ART"],
    documentosNoAplicables: ["Permiso de excavacion si no hay intervencion de suelo"],
    familiasPreventivas: ["sustancias_hds", "equipos_emergencia", "trabajos_criticos"],
    desviacionesPreventivas: ["control_critico_ausente_no_verificado", "evento_ambiental"],
    criticidadOrientativa: "critico",
    preguntasSugeridas: ["Existe fuga, olor o combustible en el area?", "Se controlo ventilacion e ignicion?"],
    preguntasProhibidas: ["Normalizar combustible en envase o linea no certificada."],
    errorQueDebeEvitar: "No clasificar fuga de gas o combustible como simple orden y aseo.",
  },
  rotulacion_identificacion: {
    tipoRiesgo: "operacional",
    actoInseguroAsociado: "operar o intervenir red no identificada",
    condicionInseguraAsociada: "circuito, valvula, tuberia, ducto o tablero sin rotulacion clara",
    exposicion: "tecnicos que deben seleccionar, aislar, probar o liberar una instalacion",
    consecuenciaProbable: "intervencion de red equivocada, energizacion, fuga, corte de servicio o dano material",
    controlFaltanteOFallido: "rotulacion, plano, trazabilidad, bloqueo o verificacion de correspondencia insuficiente",
    controlesEsperados: ["rotulacion", "plano o trazado", "verificacion", "bloqueo si aplica", "responsable"],
    accionInmediataSugerida: "Detener intervencion y confirmar identificacion de red, circuito o valvula antes de operar.",
    documentosAplicables: ["Plano o trazado si aplica", "Registro de prueba o identificacion"],
    documentosNoAplicables: ["PTS si solo corresponde rotular una red sin energia ni presion"],
    familiasPreventivas: ["documental_legal", "maquinaria_instalaciones", "dano_material"],
    desviacionesPreventivas: ["omision_documental", "control_critico_ausente_no_verificado"],
    criticidadOrientativa: "medio",
    preguntasSugeridas: ["La red, valvula o circuito esta identificado?", "Existe plano o trazado de respaldo?"],
    preguntasProhibidas: ["Continuar intervencion por suposicion del recorrido de la red."],
    errorQueDebeEvitar: "No permitir operacion de red no identificada si puede afectar energia, presion o servicio.",
  },
  interferencia_redes: {
    tipoRiesgo: "dano_material",
    actoInseguroAsociado: "perforar o canalizar sin verificar interferencias existentes",
    condicionInseguraAsociada: "cable, ducto, caneria, drenaje o red oculta puede ser afectada",
    exposicion: "trabajadores que perforan y servicios existentes embebidos o cercanos al punto",
    consecuenciaProbable: "contacto electrico, fuga, inundacion, dano de red o interrupcion operacional",
    controlFaltanteOFallido: "trazado, detector, plano, permiso o verificacion de interferencias no aplicado",
    controlesEsperados: ["revision de planos", "detector o cateo", "trazado visible", "autorizacion", "segregacion"],
    accionInmediataSugerida: "Suspender perforacion y verificar interferencias antes de continuar con la pasada.",
    documentosAplicables: ["Plano o trazado de instalaciones", "Autorizacion de perforacion si aplica", "AST/ART"],
    documentosNoAplicables: ["HDS/SDS si no hay sustancias"],
    familiasPreventivas: ["dano_material", "energia_loto_electrico", "maquinaria_instalaciones"],
    desviacionesPreventivas: ["dano_material", "requiere_revision_tecnica_legal"],
    criticidadOrientativa: "alto",
    preguntasSugeridas: ["Se verificaron redes existentes antes de perforar?", "Hay plano, detector o autorizacion?"],
    preguntasProhibidas: ["Perforar por referencia visual sin verificar instalaciones ocultas."],
    errorQueDebeEvitar: "No omitir interferencias al evaluar canalizaciones, pasadas o perforaciones.",
  },
  segregacion_senalizacion: {
    tipoRiesgo: "seguridad_personas",
    actoInseguroAsociado: "mantener area de instalacion, prueba o perforacion sin segregacion efectiva",
    condicionInseguraAsociada: "zona con energia, presion, polvo, ruido, caida de objetos o fluidos abierta al transito",
    exposicion: "peatones, otras cuadrillas, usuarios y trabajadores que circulan por el entorno",
    consecuenciaProbable: "golpe, contacto, caida, exposicion a polvo o ingreso a zona de prueba",
    controlFaltanteOFallido: "barrera, aviso, cierre, vigia o control de acceso insuficiente",
    controlesEsperados: ["barrera fisica", "senalizacion", "control de acceso", "aviso a cuadrillas"],
    accionInmediataSugerida: "Cerrar el perimetro y controlar acceso hasta retirar energia, presion o proyeccion.",
    documentosAplicables: ["AST/ART si hay prueba, energia o tarea critica"],
    documentosNoAplicables: ["Certificacion si solo corresponde instalar barrera o letrero"],
    familiasPreventivas: ["senalizacion_segregacion", "seguridad_trabajadores", "trabajos_criticos"],
    desviacionesPreventivas: ["evasion_barreras_senalizacion_segregacion", "acceso_zona_delimitada_sin_autorizacion"],
    criticidadOrientativa: "medio",
    preguntasSugeridas: ["La segregacion impide ingreso real de terceros?", "La senalizacion informa energia, presion o proyeccion?"],
    preguntasProhibidas: ["Aceptar cinta aislada como control suficiente ante prueba presurizada."],
    errorQueDebeEvitar: "No confundir advertencia visual con control efectivo de acceso.",
  },
  autorizacion_documental: {
    tipoRiesgo: "documental",
    actoInseguroAsociado: "ejecutar intervencion tecnica sin autorizacion o responsable definido",
    condicionInseguraAsociada: "permiso, AST/ART, PTS, bloqueo o autorizacion no disponible para la condicion real",
    exposicion: "cuadrilla que interviene energia, presion, red existente, altura o sustancia",
    consecuenciaProbable: "control preventivo incompleto, error de secuencia o liberacion de energia no prevista",
    controlFaltanteOFallido: "documento habilitante, responsable tecnico, difusion o aprobacion no verificada",
    controlesEsperados: ["autorizacion", "AST/ART", "PTS si aplica", "responsable tecnico", "difusion"],
    accionInmediataSugerida: "Detener la tarea regulada y regularizar autorizacion, analisis y responsable antes de continuar.",
    documentosAplicables: documentosInstalacionesTecnicas,
    documentosNoAplicables: ["HDS/SDS si no hay sustancias"],
    familiasPreventivas: ["documental_legal", "capacitacion_evidencias", "trabajos_criticos"],
    desviacionesPreventivas: ["omision_documental", "trabajo_critico_sin_autorizacion_control"],
    criticidadOrientativa: "alto",
    preguntasSugeridas: ["La actividad requiere autorizacion, AST/ART o PTS?", "El responsable tecnico esta definido?"],
    preguntasProhibidas: ["Exigir permiso para una correccion simple sin energia, presion ni altura."],
    errorQueDebeEvitar: "No sobredocumentar tareas simples ni omitir autorizacion en trabajos criticos.",
  },
  matriz_no_cubre: {
    tipoRiesgo: "documental",
    actoInseguroAsociado: "continuar con condicion tecnica no evaluada en matriz o analisis vigente",
    condicionInseguraAsociada: "cambio de metodo, interferencia, energia, presion o sustancia no considerada",
    exposicion: "trabajadores que aplican controles no ajustados a la condicion real observada",
    consecuenciaProbable: "decision preventiva debil, control incompleto, repeticion del hallazgo o accidente",
    controlFaltanteOFallido: "actualizacion de matriz, AST/ART, difusion o revision tecnica no realizada",
    controlesEsperados: ["matriz actualizada", "AST/ART actualizado", "difusion", "revision tecnica"],
    accionInmediataSugerida: "Actualizar analisis preventivo y difundir controles cuando la condicion real difiera de lo previsto.",
    documentosAplicables: ["Matriz de riesgos", "AST/ART", "Registro de difusion"],
    documentosNoAplicables: ["Permiso especial si la tarea no lo requiere"],
    familiasPreventivas: ["documental_legal", "capacitacion_evidencias", "seguridad_trabajadores"],
    desviacionesPreventivas: ["omision_documental", "falta_conocimiento_capacitacion_difusion"],
    criticidadOrientativa: "medio",
    preguntasSugeridas: ["La matriz cubre energia, presion, red existente o sustancia?", "Hubo cambio de metodo?"],
    preguntasProhibidas: ["Cerrar solo con registro si el control fisico sigue faltando."],
    errorQueDebeEvitar: "No usar matriz desactualizada como respaldo de una condicion no evaluada.",
  },
  mantencion_certificacion: {
    tipoRiesgo: "operacional",
    actoInseguroAsociado: "usar equipo, instrumento o componente tecnico sin verificacion vigente",
    condicionInseguraAsociada: "manometro, tester, bomba, valvula, herramienta o plataforma sin inspeccion o calibracion",
    exposicion: "operadores y cuadrillas que dependen de lectura, proteccion o funcionamiento del equipo",
    consecuenciaProbable: "medicion erronea, falla de prueba, contacto electrico, liberacion de presion o dano material",
    controlFaltanteOFallido: "calibracion, inspeccion, mantencion, certificacion o retiro de servicio no aplicado",
    controlesEsperados: ["calibracion", "inspeccion", "mantencion", "retiro de equipo no conforme"],
    accionInmediataSugerida: "Retirar el equipo sin vigencia y reemplazarlo por instrumento o herramienta verificada.",
    documentosAplicables: ["Certificacion o mantencion", "Registro de inspeccion si aplica"],
    documentosNoAplicables: ["Permiso especial si solo corresponde reemplazo de herramienta menor"],
    familiasPreventivas: ["mantencion_certificacion", "herramientas_equipos", "maquinaria_instalaciones"],
    desviacionesPreventivas: ["condicion_insegura", "omision_documental"],
    criticidadOrientativa: "medio",
    preguntasSugeridas: ["El equipo o instrumento tiene inspeccion o calibracion vigente?", "La lectura es critica para liberar la tarea?"],
    preguntasProhibidas: ["Aceptar prueba de presion con instrumento sin vigencia conocida."],
    errorQueDebeEvitar: "No permitir equipos de medicion o control sin trazabilidad cuando sostienen una decision critica.",
  },
  ventilacion_deficiente: {
    tipoRiesgo: "salud_ocupacional",
    actoInseguroAsociado: "trabajar con ductos, sellos o equipos sin ventilacion suficiente",
    condicionInseguraAsociada: "espacio, cielo, shaft, sala tecnica o ducto con renovacion de aire deficiente",
    exposicion: "trabajadores que cortan, aplican sellos, limpian o prueban equipos en recinto cerrado",
    consecuenciaProbable: "inhalacion de vapores, calor, fatiga, acumulacion de polvo o atmosfera molesta",
    controlFaltanteOFallido: "ventilacion, extraccion, pausa, medicion o control de sustancias no implementado",
    controlesEsperados: ["ventilacion", "extraccion", "pausas", "EPP compatible", "control de sustancias"],
    accionInmediataSugerida: "Mejorar ventilacion o suspender aplicacion de productos hasta controlar exposicion.",
    documentosAplicables: ["HDS/SDS si hay sustancias", "Matriz de riesgos", "AST/ART si aplica"],
    documentosNoAplicables: ["Permiso electrico si no hay intervencion electrica"],
    familiasPreventivas: ["higiene_ocupacional", "sustancias_hds", "seguridad_trabajadores"],
    desviacionesPreventivas: ["condicion_insegura", "falta_conocimiento_capacitacion_difusion"],
    criticidadOrientativa: "medio",
    preguntasSugeridas: ["El lugar tiene ventilacion suficiente?", "Se usan sellos, solventes o equipos que generen vapores?"],
    preguntasProhibidas: ["Ignorar ventilacion por tratarse de instalacion interior breve."],
    errorQueDebeEvitar: "No omitir ventilacion cuando hay polvo, vapores o trabajo en recinto tecnico.",
  },
  dano_material: {
    tipoRiesgo: "dano_material",
    actoInseguroAsociado: "instalar, perforar o probar sin proteger infraestructura existente",
    condicionInseguraAsociada: "terminacion, ducto, caneria, tablero, cielo o equipo puede danarse por la tarea",
    exposicion: "infraestructura, servicios, terminaciones, redes existentes y continuidad operacional",
    consecuenciaProbable: "dano material, retrabajo, filtracion, corte de servicio o reclamo del cliente",
    controlFaltanteOFallido: "proteccion, trazado, apoyo temporal, contencion o verificacion de interferencias faltante",
    controlesEsperados: ["proteccion de superficies", "trazado", "apoyo temporal", "contencion", "verificacion"],
    accionInmediataSugerida: "Proteger infraestructura y verificar interferencias antes de continuar la instalacion.",
    documentosAplicables: ["Registro de interferencias si aplica", "Plano o trazado"],
    documentosNoAplicables: ["PTS si solo corresponde proteger terminacion menor"],
    familiasPreventivas: ["dano_material", "maquinaria_instalaciones", "orden_aseo_housekeeping"],
    desviacionesPreventivas: ["dano_material", "falla_supervision_control_operacional"],
    criticidadOrientativa: "medio",
    preguntasSugeridas: ["La tarea puede danar terminaciones, ductos o redes existentes?", "Existe proteccion o trazado previo?"],
    preguntasProhibidas: ["Ignorar dano material porque no hay lesion inmediata."],
    errorQueDebeEvitar: "No omitir dano material cuando afecta servicio, terminacion o continuidad operacional.",
  },
};

function temaB(
  idBase: string,
  tituloBase: string,
  condicionTecnica: string,
  palabrasClaveBase: string[],
  categoria: CategoriaRiesgoBloqueB,
  objetoPrincipal: string,
  condicionObservada: string,
  criticidadOrientativa?: CriticidadOrientativaTaxonomia,
): TemaRiesgoBloqueB {
  return { idBase, tituloBase, condicionTecnica, palabrasClaveBase, categoria, objetoPrincipal, condicionObservada, criticidadOrientativa };
}

function temaC(
  idBase: string,
  tituloBase: string,
  condicionTecnica: string,
  palabrasClaveBase: string[],
  categoria: CategoriaRiesgoBloqueC,
  objetoPrincipal: string,
  condicionObservada: string,
  criticidadOrientativa?: CriticidadOrientativaTaxonomia,
): TemaRiesgoBloqueC {
  return { idBase, tituloBase, condicionTecnica, palabrasClaveBase, categoria, objetoPrincipal, condicionObservada, criticidadOrientativa };
}

function temaD(
  idBase: string,
  tituloBase: string,
  condicionTecnica: string,
  palabrasClaveBase: string[],
  categoria: CategoriaRiesgoBloqueC,
  objetoPrincipal: string,
  condicionObservada: string,
  criticidadOrientativa?: CriticidadOrientativaTaxonomia,
): TemaRiesgoBloqueD {
  return { idBase, tituloBase, condicionTecnica, palabrasClaveBase, categoria, objetoPrincipal, condicionObservada, criticidadOrientativa };
}

function temaE(
  idBase: string,
  tituloBase: string,
  condicionTecnica: string,
  palabrasClaveBase: string[],
  categoria: CategoriaRiesgoBloqueC,
  objetoPrincipal: string,
  condicionObservada: string,
  criticidadOrientativa?: CriticidadOrientativaTaxonomia,
): TemaRiesgoBloqueE {
  return { idBase, tituloBase, condicionTecnica, palabrasClaveBase, categoria, objetoPrincipal, condicionObservada, criticidadOrientativa };
}

function temaF(
  idBase: string,
  tituloBase: string,
  condicionTecnica: string,
  palabrasClaveBase: string[],
  categoria: CategoriaRiesgoBloqueC,
  objetoPrincipal: string,
  condicionObservada: string,
  criticidadOrientativa?: CriticidadOrientativaTaxonomia,
): TemaRiesgoBloqueF {
  return { idBase, tituloBase, condicionTecnica, palabrasClaveBase, categoria, objetoPrincipal, condicionObservada, criticidadOrientativa };
}

function crearActividadesBloqueC(): ActividadBloqueC[] {
  return [
    {
      id: "electricidad_provisoria_faena",
      nombreVisible: "Electricidad provisoria de faena",
      descripcionActividad:
        "Instalacion, uso, mantencion y retiro de tableros provisorios, extensiones, alimentadores temporales y puntos de energia para faena.",
      etapaObra: "Instalaciones provisorias y apoyo operacional",
      contextoTecnico: "durante electricidad provisoria de faena con tableros, cables, extensiones y alimentacion temporal",
      palabrasClaveActividad: ["tablero", "provisorio", "cable", "extension", "diferencial", "humedad"],
      familiasPreventivasRelacionadas: ["energia_loto_electrico", "trabajos_criticos", "orden_aseo_housekeeping", "mantencion_certificacion"],
      desviacionesFrecuentes: ["control_critico_ausente_no_verificado", "condicion_insegura", "herramienta_equipo_mal_estado_usado_terreno"],
      documentosFrecuentesAplicables: documentosElectricos,
      documentosQueNoAplicanPorDefecto: ["HDS/SDS si no hay sustancias", "Permiso de excavacion si no hay intervencion de suelo"],
      preguntasEstrategicasSugeridas: [
        "El tablero provisorio tiene proteccion diferencial, cierre e identificacion visible?",
        "Los cables y extensiones estan en buen estado, elevados o protegidos del transito?",
        "Existe humedad, agua o sobrecarga cerca de la alimentacion temporal?",
        "La intervencion electrica requiere bloqueo, autorizacion o responsable competente?",
        "La condicion permite continuar o corresponde desenergizar y corregir de inmediato?",
      ],
      erroresQueDebeEvitarElMotor: ["No tratar energia provisoria como orden menor si existe tablero, cable danado, humedad o sobrecarga."],
      bibliotecasSecundariasRelacionadas: ["herramientas_equipos", "senalizacion_segregacion", "equipos_emergencia"],
      definicionesRiesgo: [
        temaC("tablero_sin_diferencial", "Tablero provisorio sin proteccion diferencial", "Tablero provisorio de faena alimenta herramientas sin proteccion diferencial verificada", ["tablero", "diferencial"], "tablero_proteccion", "tablero provisorio", "sin proteccion diferencial", "alto"),
        temaC("tablero_abierto", "Tablero provisorio abierto o sin tapa", "Tablero provisorio permanece con tapa abierta, cierre danado o partes internas accesibles", ["tablero", "tapa"], "tablero_proteccion", "tablero provisorio", "abierto o sin tapa", "alto"),
        temaC("tablero_sin_rotulo", "Circuitos provisorios sin rotulacion", "Circuitos y protecciones del tablero provisorio no identifican claramente alimentacion y destino", ["tablero", "rotulacion"], "rotulacion_identificacion", "circuitos provisorios", "sin identificacion"),
        temaC("extension_danada", "Extension electrica deteriorada", "Extension de faena presenta corte, empalme, enchufe reparado o aislacion deficiente", ["extension", "enchufe"], "cable_extension", "extension electrica", "deteriorada", "alto"),
        temaC("cable_en_transito", "Cable provisorio en ruta de transito", "Cable o alargador cruza zona de paso sin proteccion mecanica ni ordenamiento", ["cable", "transito"], "caida_mismo_nivel", "cable provisorio", "cruza ruta de transito"),
        temaC("cable_en_agua", "Cable provisorio expuesto a agua", "Cable, enchufe o union se mantiene cercano a charco, lluvia, filtracion o lavado", ["cable", "agua"], "sobrecarga_humedad", "cable provisorio", "expuesto a humedad", "alto"),
        temaC("sobrecarga_zapatilla", "Sobrecarga en adaptador o zapatilla", "Multiples herramientas o equipos se alimentan desde adaptador provisorio sin capacidad verificada", ["sobrecarga", "adaptador"], "sobrecarga_humedad", "adaptador provisorio", "sobrecargado", "alto"),
        temaC("empalme_expuesto", "Empalme electrico provisorio expuesto", "Empalme temporal queda fuera de caja, sin aislacion mecanica ni proteccion contra humedad", ["empalme", "aislacion"], "cable_extension", "empalme provisorio", "expuesto"),
        temaC("alimentacion_sin_canalizacion", "Alimentacion temporal sin canalizacion", "Conductor temporal queda apoyado en piso, borde metalico o estructura sin proteccion", ["alimentacion", "canalizacion"], "cable_extension", "alimentacion temporal", "sin proteccion mecanica"),
        temaC("intervencion_sin_bloqueo", "Intervencion provisoria sin bloqueo", "Trabajador manipula tablero o alimentador temporal sin bloqueo ni verificacion de ausencia de tension", ["bloqueo", "tension"], "energia_loto", "alimentador provisorio", "sin bloqueo", "critico"),
        temaC("prueba_energizada_sin_area", "Prueba energizada sin area controlada", "Prueba o reposicion de energia provisoria se realiza con personas dentro del radio de contacto", ["prueba", "energizada"], "contacto_electrico", "prueba electrica", "sin control de area", "alto"),
        temaC("herramienta_con_cable_danado", "Herramienta electrica con cable danado", "Herramienta conectada a red provisoria mantiene cable, enchufe o carcasa con dano visible", ["herramienta", "cable"], "herramienta_electrica", "herramienta electrica", "cable defectuoso", "alto"),
        temaC("proteccion_diferencial_sin_prueba", "Diferencial sin prueba funcional", "Proteccion diferencial del tablero provisorio no evidencia prueba, operatividad o inspeccion reciente", ["diferencial", "prueba"], "mantencion_certificacion", "proteccion diferencial", "sin prueba funcional"),
        temaC("tablero_cerca_material_combustible", "Tablero junto a material combustible", "Tablero o extension provisoria queda junto a carton, madera, plastico o combustible acumulado", ["tablero", "combustible"], "segregacion_senalizacion", "tablero provisorio", "junto a combustible"),
        temaC("tablero_sin_extintor_cercano", "Tablero sin medio de primera respuesta", "Area de tablero provisorio no considera medio disponible ante inicio de fuego electrico", ["tablero", "extintor"], "tablero_proteccion", "sector de tablero", "sin medio de respuesta"),
        temaC("acceso_tablero_obstruido", "Acceso a tablero obstruido", "Materiales, cables o equipos bloquean acceso seguro al tablero provisorio de faena", ["acceso", "tablero"], "caida_mismo_nivel", "acceso a tablero", "obstruido"),
        temaC("tablero_sin_segurar", "Tablero provisorio sin fijacion", "Tablero temporal permanece apoyado, inclinado o sin fijacion estable frente a golpes", ["tablero", "fijacion"], "dano_material", "tablero provisorio", "sin fijacion"),
        temaC("alimentador_colgante", "Alimentador colgante sin sujecion", "Cable alimentador queda colgando con tension mecanica o roce contra borde", ["alimentador", "colgante"], "cable_extension", "alimentador temporal", "sin sujecion"),
        temaC("uso_sin_autorizacion", "Uso de energia provisoria sin autorizacion", "Cuadrilla conecta herramientas al tablero provisorio sin autorizacion ni responsable definido", ["autorizacion", "tablero"], "autorizacion_documental", "uso de energia provisoria", "sin autorizacion"),
        temaC("matriz_no_cubre_provisoria", "Matriz no cubre condicion electrica provisoria", "Cambio de ubicacion, humedad o carga del sistema provisorio no esta considerado en analisis vigente", ["matriz", "provisorio"], "matriz_no_cubre", "electricidad provisoria", "condicion no evaluada"),
        temaC("senalizacion_insuficiente_tablero", "Tablero sin senalizacion preventiva", "Tablero provisorio energizado no advierte peligro electrico, responsable o restriccion de acceso", ["senalizacion", "tablero"], "segregacion_senalizacion", "tablero energizado", "sin senalizacion"),
        temaC("terceros_acceden_tablero", "Terceros acceden a tablero provisorio", "Personas no autorizadas manipulan o pasan junto a tablero temporal sin barrera", ["terceros", "acceso"], "segregacion_senalizacion", "tablero provisorio", "acceso no controlado"),
        temaC("cable_aplastado_maquinaria", "Cable expuesto a aplastamiento", "Cable provisorio queda en ruta de carretilla, vehiculo, elevador o acopio pesado", ["cable", "aplastamiento"], "interferencia_redes", "cable provisorio", "expuesto a aplastamiento"),
        temaC("cable_sobre_borde_metalico", "Cable sobre borde metalico", "Conductor temporal roza perfil, bandeja, reja o canto metalico sin proteccion", ["cable", "borde"], "cable_extension", "conductor temporal", "roce con borde"),
        temaC("toma_sin_tierra", "Toma provisoria sin puesta a tierra", "Punto de conexion temporal no evidencia continuidad de tierra o proteccion compatible", ["tierra", "toma"], "contacto_electrico", "toma provisoria", "sin tierra verificada", "alto"),
        temaC("iluminacion_provisoria_danada", "Luminaria provisoria danada", "Luminaria temporal mantiene carcasa, cable, enchufe o soporte en condicion deficiente", ["luminaria", "provisoria"], "herramienta_electrica", "luminaria provisoria", "deteriorada"),
        temaC("carga_bateria_sin_control", "Carga de bateria sin control electrico", "Bateria o equipo recargable se conecta en zona de transito con enchufe expuesto", ["bateria", "carga"], "sobrecarga_humedad", "carga de bateria", "sin control"),
        temaC("reparacion_improvisada_enchufe", "Reparacion improvisada de enchufe", "Enchufe de extension o herramienta fue reparado con cinta, adaptador o pieza no certificada", ["enchufe", "cinta"], "cable_extension", "enchufe", "reparado improvisadamente"),
        temaC("tablero_sin_inspeccion", "Tablero provisorio sin inspeccion visible", "Tablero temporal no evidencia inspeccion, responsable o condicion vigente para uso", ["inspeccion", "tablero"], "mantencion_certificacion", "tablero provisorio", "sin inspeccion"),
        temaC("energia_provisoria_cerca_humedad", "Energia provisoria en zona humeda", "Alimentacion temporal se instala cerca de lavado, lluvia, filtracion o drenaje activo", ["energia", "humedad"], "sobrecarga_humedad", "alimentacion provisoria", "cercana a humedad", "alto"),
        temaC("herramientas_multiples_mismo_circuito", "Herramientas multiples en circuito unico", "Varias herramientas de alto consumo operan en un mismo circuito temporal sin verificacion", ["herramientas", "circuito"], "sobrecarga_humedad", "circuito provisorio", "carga no verificada"),
        temaC("retiro_cable_sin_desenergizar", "Retiro de cable sin desenergizar", "Cable temporal se retira, mueve o desenrolla sin confirmar desenergizacion previa", ["retiro", "cable"], "energia_loto", "cable temporal", "retiro energizado", "critico"),
      ],
    },
    {
      id: "electricidad_definitiva_canalizaciones_tableros",
      nombreVisible: "Electricidad definitiva, canalizaciones y tableros",
      descripcionActividad:
        "Ejecucion de canalizaciones, cableado, tableros, bandejas, circuitos definitivos, pruebas, energizacion y coordinacion con otras especialidades.",
      etapaObra: "Instalaciones definitivas y puesta en servicio",
      contextoTecnico: "durante electricidad definitiva con canalizaciones, tableros, circuitos, bandejas y pruebas de energizacion",
      palabrasClaveActividad: ["canalizacion", "tablero", "circuito", "energizacion", "cable", "bandeja"],
      familiasPreventivasRelacionadas: ["energia_loto_electrico", "trabajos_criticos", "dano_material", "documental_legal"],
      desviacionesFrecuentes: ["trabajo_critico_sin_autorizacion_control", "control_critico_ausente_no_verificado", "dano_material"],
      documentosFrecuentesAplicables: documentosElectricos,
      documentosQueNoAplicanPorDefecto: ["HDS/SDS si no hay sustancias", "Permiso de excavacion si no hay intervencion de suelo"],
      preguntasEstrategicasSugeridas: [
        "El circuito, tablero o bandeja esta identificado antes de intervenir?",
        "La instalacion requiere bloqueo, verificacion sin tension o prueba energizada controlada?",
        "Existen redes existentes o terminaciones que puedan danarse durante canalizacion?",
        "La energizacion esta autorizada, segregada y comunicada a las cuadrillas?",
        "Las herramientas, perforaciones y fijaciones estan controladas frente a proyeccion o contacto?",
      ],
      erroresQueDebeEvitarElMotor: ["No confundir electricidad definitiva con simple cableado si hay energizacion, tablero o red existente."],
      bibliotecasSecundariasRelacionadas: ["herramientas_equipos", "dano_material", "mantencion_certificacion"],
      definicionesRiesgo: [
        temaC("circuito_energizado", "Circuito definitivo energizado durante intervencion", "Circuito definitivo se mantiene energizado o con retorno posible mientras se conecta o ordena cableado", ["circuito", "energizado"], "contacto_electrico", "circuito definitivo", "energizado durante intervencion", "critico"),
        temaC("ausencia_tension_no_verificada", "Ausencia de tension no verificada", "Conductor, tablero o circuito se interviene sin comprobar ausencia de tension con instrumento adecuado", ["tension", "verificacion"], "energia_loto", "circuito o tablero", "sin verificacion", "critico"),
        temaC("bloqueo_incompleto_tablero", "Bloqueo incompleto de tablero", "Tablero definitivo no cuenta con bloqueo, etiqueta o control de reconexion durante intervencion", ["bloqueo", "tablero"], "energia_loto", "tablero definitivo", "bloqueo incompleto", "critico"),
        temaC("tablero_sin_barrera", "Tablero definitivo sin barrera interna", "Tablero en montaje expone barras, bornes o protecciones sin barrera temporal", ["tablero", "barrera"], "tablero_proteccion", "tablero definitivo", "partes expuestas", "alto"),
        temaC("circuitos_sin_identificacion", "Circuitos sin identificacion definitiva", "Canalizacion o cableado no identifica origen, destino o proteccion asociada", ["circuitos", "identificacion"], "rotulacion_identificacion", "circuitos electricos", "sin identificacion"),
        temaC("bandeja_sobrecargada", "Bandeja electrica sobrecargada", "Bandeja o canalizacion concentra cables sin orden, sujecion o capacidad revisada", ["bandeja", "sobrecarga"], "dano_material", "bandeja electrica", "sobrecargada"),
        temaC("canalizacion_sin_fijacion", "Canalizacion sin fijacion suficiente", "Tuberia, conduit o bandeja queda presentada sin anclaje, abrazadera o soporte definitivo", ["canalizacion", "fijacion"], "dano_material", "canalizacion electrica", "sin fijacion"),
        temaC("perforacion_tablero_sin_control", "Perforacion para tablero sin control", "Perforacion en muro o losa para tablero genera polvo, proyeccion o dano de red oculta", ["perforacion", "tablero"], "perforacion_polvo", "perforacion para tablero", "sin control de polvo"),
        temaC("herramienta_perforacion_defectuosa", "Herramienta de perforacion defectuosa", "Taladro, broca o extension usada en canalizacion presenta dano o accesorio incompatible", ["taladro", "broca"], "herramienta_electrica", "herramienta de perforacion", "defectuosa"),
        temaC("proyeccion_canalizacion", "Proyeccion durante corte de canalizacion", "Corte de conduit, bandeja o perfil proyecta particulas hacia operador o terceros", ["corte", "canalizacion"], "perforacion_polvo", "canalizacion electrica", "proyeccion no controlada"),
        temaC("borde_filoso_bandeja", "Borde filoso en bandeja electrica", "Bandeja, conduit o canaleta queda con rebaba expuesta durante montaje", ["bandeja", "rebaba"], "corte_borde", "bandeja electrica", "borde filoso"),
        temaC("cableado_en_piso", "Cableado definitivo en piso temporal", "Cables definitivos quedan tendidos en piso antes de su canalizacion o proteccion", ["cableado", "piso"], "caida_mismo_nivel", "cableado definitivo", "tendido en piso"),
        temaC("energizacion_sin_aviso", "Energizacion sin aviso a cuadrillas", "Prueba o energizacion definitiva se realiza sin comunicar ni cerrar el area", ["energizacion", "aviso"], "segregacion_senalizacion", "energizacion definitiva", "sin aviso", "alto"),
        temaC("prueba_sin_responsable", "Prueba electrica sin responsable definido", "Medicion o energizacion se ejecuta sin responsable tecnico visible y autorizado", ["prueba", "responsable"], "autorizacion_documental", "prueba electrica", "sin responsable"),
        temaC("tablero_sin_esquema", "Tablero sin esquema o plano disponible", "Tablero definitivo no cuenta con esquema, rotulacion o plano de respaldo para intervencion", ["plano", "tablero"], "rotulacion_identificacion", "tablero definitivo", "sin esquema"),
        temaC("interferencia_con_red_existente", "Interferencia con red electrica existente", "Canalizacion nueva cruza cable, ducto o servicio existente sin verificacion previa", ["interferencia", "red"], "interferencia_redes", "red electrica existente", "interferencia no verificada", "alto"),
        temaC("cable_danado_en_tendido", "Cable danado durante tendido", "Cable definitivo presenta corte, aplastamiento, peladura o traccion excesiva al instalarse", ["cable", "tendido"], "dano_material", "cable definitivo", "deteriorado"),
        temaC("radio_trabajo_no_segregado", "Radio de canalizacion no segregado", "Area de corte, perforacion o montaje de bandeja permanece abierta al transito", ["radio", "segregacion"], "segregacion_senalizacion", "area de canalizacion", "sin segregacion"),
        temaC("trabajo_en_altura_tablero", "Instalacion electrica en altura sin control", "Canalizacion o tablero se instala desde escalera, plataforma o borde sin control de caida", ["altura", "tablero"], "caida_distinto_nivel", "instalacion electrica en altura", "sin control de caida", "alto"),
        temaC("caida_objetos_bandeja", "Caida de piezas de bandeja", "Tramos, tapas, pernos o herramientas de bandeja quedan sin contencion sobre altura", ["bandeja", "caida"], "caida_objetos", "piezas de bandeja", "sin contencion"),
        temaC("levantamiento_tablero_pesado", "Manipulacion manual de tablero pesado", "Tablero o gabinete se posiciona manualmente sin apoyo, ruta o equipo suficiente", ["tablero", "peso"], "manipulacion_manual", "tablero o gabinete", "manipulacion manual exigente"),
        temaC("postura_sobre_cabeza", "Conexion sobre cabeza con postura forzada", "Trabajador conecta o fija canalizacion sobre cabeza durante tiempo prolongado", ["postura", "sobre cabeza"], "postura_forzada", "conexion sobre cabeza", "postura forzada"),
        temaC("ruido_perforacion_electrica", "Ruido por perforacion electrica", "Perforacion para canalizacion genera ruido o vibracion sin control ocupacional", ["ruido", "perforacion"], "ruido_vibracion", "perforacion electrica", "ruido no controlado"),
        temaC("polvo_silice_canalizacion", "Polvo por canalizacion en muro", "Ranurado o perforacion para canalizacion genera polvo mineral sin extraccion", ["polvo", "ranurado"], "perforacion_polvo", "ranura para canalizacion", "polvo sin control"),
        temaC("uso_esmeril_canalizacion", "Uso de esmeril en canalizacion sin control", "Esmeril o cortadora se usa sobre conduit o bandeja sin guarda o segregacion", ["esmeril", "conduit"], "herramienta_electrica", "esmeril en canalizacion", "sin control"),
        temaC("matriz_no_cubre_energizacion", "Matriz no cubre energizacion definitiva", "La energizacion o prueba de circuito no esta incorporada en matriz o AST/ART vigente", ["matriz", "energizacion"], "matriz_no_cubre", "energizacion definitiva", "no evaluada", "alto"),
        temaC("permiso_electrico_no_vigente", "Autorizacion electrica no vigente", "Intervencion de tablero o circuito se ejecuta sin permiso o autorizacion vigente", ["permiso", "electrico"], "autorizacion_documental", "intervencion electrica", "sin autorizacion", "alto"),
        temaC("tester_sin_verificacion", "Instrumento de medicion sin verificacion", "Tester, pinza o instrumento usado para prueba electrica no evidencia condicion o calibracion", ["tester", "calibracion"], "mantencion_certificacion", "instrumento electrico", "sin verificacion"),
        temaC("trabajos_simultaneos_tablero", "Trabajos simultaneos junto a tablero", "Otras cuadrillas trabajan cerca del tablero durante conexion, prueba o energizacion", ["simultaneo", "tablero"], "segregacion_senalizacion", "trabajos junto a tablero", "sin coordinacion"),
        temaC("ducto_metalico_sin_puesta_tierra", "Canalizacion metalica sin continuidad a tierra", "Canalizacion metalica no evidencia continuidad o conexion equipotencial cuando corresponde", ["canalizacion", "tierra"], "contacto_electrico", "canalizacion metalica", "tierra no verificada", "alto"),
        temaC("cableado_proximo_agua", "Cableado definitivo cercano a humedad", "Circuito, caja o bandeja queda expuesto a filtracion, condensacion o red de agua cercana", ["cableado", "humedad"], "sobrecarga_humedad", "cableado definitivo", "cercano a humedad", "alto"),
        temaC("retiro_proteccion_sin_reposicion", "Proteccion retirada sin reposicion", "Tapa, barrera o proteccion de tablero se retira para trabajar y no se repone", ["proteccion", "tablero"], "tablero_proteccion", "proteccion de tablero", "retirada sin reposicion", "alto"),
      ],
    },
    {
      id: "gasfiteria_redes_agua_potable_alcantarillado",
      nombreVisible: "Gasfiteria, redes de agua potable y alcantarillado",
      descripcionActividad:
        "Tendido, union, corte, termofusion, conexion, prueba y reparacion de redes de agua potable, alcantarillado y gasfiteria interior o exterior.",
      etapaObra: "Instalaciones sanitarias y gasfiteria",
      contextoTecnico: "durante gasfiteria y redes de agua potable o alcantarillado con tuberias, conexiones, termofusion y pruebas",
      palabrasClaveActividad: ["gasfiteria", "agua potable", "alcantarillado", "tuberia", "termofusion", "fuga"],
      familiasPreventivasRelacionadas: ["maquinaria_instalaciones", "higiene_ocupacional", "medio_ambiente", "herramientas_equipos"],
      desviacionesFrecuentes: ["condicion_insegura", "evento_ambiental", "falla_supervision_control_operacional"],
      documentosFrecuentesAplicables: ["AST/ART si hay prueba, termofusion o intervencion sanitaria", "Matriz de riesgos vigente", "HDS/SDS si se usan adhesivos o solventes"],
      documentosQueNoAplicanPorDefecto: ["Permiso electrico si no hay energia involucrada", "PTS si solo corresponde reparacion menor controlada"],
      preguntasEstrategicasSugeridas: [
        "La red corresponde a agua potable, alcantarillado, descarga o conexion presurizada?",
        "Existe fuga, presion residual, agua residual o contacto con material contaminado?",
        "La herramienta de corte, termofusion o union esta en condicion segura?",
        "La tarea requiere prueba, autorizacion, HDS/SDS o control de segregacion?",
        "La condicion exige cortar suministro, contener, reparar o aislar el area?",
      ],
      erroresQueDebeEvitarElMotor: ["No tratar fuga o contacto sanitario como aseo simple si existe presion, contaminacion o dano a red."],
      bibliotecasSecundariasRelacionadas: ["sustancias_hds", "orden_aseo_housekeeping", "dano_material"],
      definicionesRiesgo: [
        temaC("fuga_agua_activa", "Fuga activa de agua potable", "Red de agua potable presenta fuga visible sin corte de suministro ni contencion", ["fuga", "agua potable"], "fuga_fluidos", "red de agua potable", "fuga activa"),
        temaC("union_tuberia_deficiente", "Union de tuberia deficiente", "Union, copla o fitting queda presentado sin apriete, sello o prueba suficiente", ["union", "fitting"], "fuga_fluidos", "union de tuberia", "deficiente"),
        temaC("prueba_presion_sin_segurar", "Prueba de presion sanitaria sin segregacion", "Prueba de red sanitaria o agua potable se realiza con personas dentro del radio", ["prueba", "presion"], "presion_sobrepresion", "red sanitaria", "prueba sin segregacion", "alto"),
        temaC("sobrepresion_red", "Sobrepresion en red de agua", "Red, manguera o accesorio se presuriza sobre condicion prevista o sin manometro", ["sobrepresion", "manometro"], "presion_sobrepresion", "red de agua", "presion no controlada", "alto"),
        temaC("termofusion_sin_control", "Termofusion sin control de quemadura", "Equipo de termofusion queda caliente o accesible sin apoyo, aviso ni segregacion", ["termofusion", "calor"], "herramienta_electrica", "equipo de termofusion", "caliente sin control"),
        temaC("corte_tuberia_sin_sujecion", "Corte de tuberia sin sujecion", "Tuberia se corta sin fijacion, apoyo o distancia de manos suficiente", ["corte", "tuberia"], "corte_borde", "tuberia", "corte sin sujecion"),
        temaC("rebaba_tuberia_expuesta", "Rebaba en tuberia cortada", "Tuberia cortada mantiene rebaba, borde filoso o viruta sin retiro", ["rebaba", "tuberia"], "corte_borde", "tuberia cortada", "rebaba expuesta"),
        temaC("herramienta_corte_danada", "Herramienta de corte sanitaria danada", "Cortatubo, esmeril o herramienta usada en tuberia presenta dano o accesorio incorrecto", ["herramienta", "cortatubo"], "herramienta_electrica", "herramienta de corte", "danada"),
        temaC("adhesivo_sin_hds", "Adhesivo o solvente sin HDS/SDS", "Adhesivo, sellante o solvente para tuberia se usa sin ficha o rotulacion disponible", ["adhesivo", "hds"], "vapores_quimicos", "adhesivo sanitario", "sin HDS/SDS"),
        temaC("vapores_en_espacio_reducido", "Vapores en espacio reducido", "Sellante o solvente se aplica en shaft, bano, camara o zona con ventilacion deficiente", ["vapores", "shaft"], "ventilacion_deficiente", "sector de gasfiteria", "ventilacion deficiente"),
        temaC("contacto_aguas_residuales", "Contacto con aguas residuales", "Intervencion de alcantarillado expone a agua residual, lodo o material contaminado", ["alcantarillado", "residual"], "aguas_residuales", "red de alcantarillado", "contacto contaminado"),
        temaC("obstruccion_sanitaria_sin_higiene", "Obstruccion sanitaria sin control higienico", "Retiro de obstruccion o limpieza de red se ejecuta sin higiene, contencion ni segregacion", ["obstruccion", "higiene"], "aguas_residuales", "obstruccion sanitaria", "sin control higienico"),
        temaC("excavacion_menor_tuberia", "Excavacion menor para tuberia sin control", "Zanja o apertura menor para tuberia queda sin borde, acceso o senalizacion suficiente", ["excavacion", "tuberia"], "segregacion_senalizacion", "excavacion menor", "sin control"),
        temaC("tuberias_en_transito", "Tuberias obstruyen zona de paso", "Tramos de tuberia, fitting o mangueras quedan en ruta de circulacion", ["tuberias", "transito"], "caida_mismo_nivel", "tuberias acopiadas", "obstruyen paso"),
        temaC("acopio_tuberias_inestable", "Acopio de tuberias inestable", "Tuberias o rollos se acopian sin cuna, amarre o control contra desplazamiento", ["acopio", "tuberias"], "dano_material", "acopio de tuberias", "inestable"),
        temaC("manipulacion_rollo_pesado", "Manipulacion de rollo o tuberia pesada", "Rollo, tramo o pieza sanitaria se traslada manualmente sin apoyo suficiente", ["rollo", "peso"], "manipulacion_manual", "tuberia o rollo", "manipulacion exigente"),
        temaC("postura_bajo_losa", "Postura forzada en red bajo losa", "Conexion o fijacion sanitaria se realiza bajo losa o en posicion incomoda prolongada", ["postura", "losa"], "postura_forzada", "conexion sanitaria", "postura forzada"),
        temaC("perforacion_para_tuberia", "Perforacion para tuberia sin control de polvo", "Perforacion de muro o losa para tuberia genera polvo y proyeccion sin barrera", ["perforacion", "tuberia"], "perforacion_polvo", "perforacion sanitaria", "polvo sin control"),
        temaC("ruido_corte_tuberia", "Ruido por corte de tuberia", "Corte mecanico de tuberia o canaleta sanitaria genera ruido sin proteccion", ["ruido", "corte"], "ruido_vibracion", "corte de tuberia", "ruido no controlado"),
        temaC("red_sin_rotulacion", "Red sanitaria sin rotulacion", "Linea de agua, descarga o alcantarillado no identifica servicio, sentido o punto de corte", ["rotulacion", "red"], "rotulacion_identificacion", "red sanitaria", "sin rotulacion"),
        temaC("valvula_no_identificada", "Valvula sanitaria no identificada", "Valvula de corte no indica servicio, alcance o posicion operacional", ["valvula", "identificacion"], "rotulacion_identificacion", "valvula sanitaria", "sin identificacion"),
        temaC("interferencia_con_electricidad", "Red sanitaria cercana a electricidad", "Tuberia o fuga queda proxima a tablero, cable o canalizacion electrica", ["electricidad", "tuberia"], "interferencia_redes", "red sanitaria y electricidad", "interferencia no controlada", "alto"),
        temaC("perforacion_red_existente", "Dano a red existente por perforacion", "Perforacion para gasfiteria puede afectar cable, ducto, caneria o drenaje existente", ["red existente", "perforacion"], "interferencia_redes", "red existente", "verificacion faltante", "alto"),
        temaC("trabajo_sin_autorizacion_sanitaria", "Intervencion sanitaria sin autorizacion", "Conexion, corte o prueba de red sanitaria se ejecuta sin responsable o autorizacion", ["autorizacion", "sanitaria"], "autorizacion_documental", "intervencion sanitaria", "sin autorizacion"),
        temaC("matriz_no_cubre_prueba", "Matriz no cubre prueba sanitaria", "Prueba, corte de suministro o intervencion contaminada no esta considerada en matriz", ["matriz", "prueba"], "matriz_no_cubre", "prueba sanitaria", "no evaluada"),
        temaC("registro_prueba_faltante", "Registro de prueba sanitaria faltante", "Prueba de estanqueidad o presion no deja registro, responsable ni resultado trazable", ["registro", "estanqueidad"], "autorizacion_documental", "prueba sanitaria", "sin registro"),
        temaC("contencion_fuga_insuficiente", "Contencion insuficiente ante fuga", "Fuga o descarga no cuenta con recipiente, barrera, drenaje o limpieza controlada", ["contencion", "fuga"], "fuga_fluidos", "fuga sanitaria", "contencion insuficiente"),
        temaC("agua_en_superficie_trabajo", "Agua en superficie de trabajo", "Fuga o prueba deja agua acumulada en ruta de trabajo o circulacion", ["agua", "superficie"], "caida_mismo_nivel", "superficie con agua", "resbaladiza"),
        temaC("equipo_termofusion_sin_mantencion", "Equipo de termofusion sin mantencion", "Equipo, matriz o placa de termofusion no evidencia condicion o mantencion vigente", ["termofusion", "mantencion"], "mantencion_certificacion", "equipo de termofusion", "sin mantencion"),
        temaC("sello_sin_tiempo_curado", "Sello sanitario sin tiempo de curado", "Union adhesiva o sellada se somete a uso o presion sin respetar curado", ["sello", "curado"], "fuga_fluidos", "union sellada", "curado no respetado"),
        temaC("residuo_sanitario_sin_retiro", "Residuo sanitario sin retiro controlado", "Recortes, lodos, trapos o material contaminado permanecen en el area", ["residuo", "sanitario"], "aguas_residuales", "residuo sanitario", "sin retiro"),
        temaC("prueba_con_terceros_expuestos", "Terceros expuestos durante prueba sanitaria", "Personas ajenas circulan junto a red presurizada, fuga o descarga de prueba", ["terceros", "prueba"], "segregacion_senalizacion", "area de prueba sanitaria", "terceros expuestos"),
      ],
    },
    {
      id: "redes_sanitarias_bajadas_agua_drenajes",
      nombreVisible: "Redes sanitarias, bajadas de agua y drenajes",
      descripcionActividad:
        "Instalacion, fijacion, sellado, prueba y mantencion de bajadas de aguas lluvia, drenajes, descargas, pendientes, sellos y puntos de evacuacion.",
      etapaObra: "Instalaciones sanitarias, drenaje y evacuacion",
      contextoTecnico: "durante redes sanitarias, bajadas de agua, drenajes, pendientes, sellos y puntos de evacuacion",
      palabrasClaveActividad: ["red sanitaria", "bajada", "drenaje", "agua", "pendiente", "sello"],
      familiasPreventivasRelacionadas: ["maquinaria_instalaciones", "medio_ambiente", "orden_aseo_housekeeping", "trabajos_criticos"],
      desviacionesFrecuentes: ["condicion_insegura", "evento_ambiental", "control_critico_ausente_no_verificado"],
      documentosFrecuentesAplicables: ["Matriz de riesgos vigente", "AST/ART si hay altura, prueba o intervencion en drenaje"],
      documentosQueNoAplicanPorDefecto: ["Permiso electrico si no hay energia involucrada", "HDS/SDS si no hay sellantes o sustancias"],
      preguntasEstrategicasSugeridas: [
        "La bajada, drenaje o red mantiene pendiente, sello y fijacion verificada?",
        "Existe trabajo en altura, borde, shaft o cielo para instalar la red?",
        "La prueba o fuga puede generar agua acumulada, dano material o impacto ambiental?",
        "Hay obstruccion, residuo o contacto con agua contaminada?",
        "La condicion requiere contener, drenar, sellar, reparar o segregar el area?",
      ],
      erroresQueDebeEvitarElMotor: ["No evaluar drenajes solo como fuga de agua si existe altura, obstruccion, contaminacion o dano a terminaciones."],
      bibliotecasSecundariasRelacionadas: ["medio_ambiente", "dano_material", "senalizacion_segregacion"],
      definicionesRiesgo: [
        temaC("bajada_sin_fijacion", "Bajada de agua sin fijacion suficiente", "Bajada de agua o descarga queda presentada sin abrazaderas, soporte o anclaje definitivo", ["bajada", "fijacion"], "dano_material", "bajada de agua", "sin fijacion"),
        temaC("pendiente_incorrecta", "Pendiente de drenaje incorrecta", "Drenaje o tuberia presenta pendiente insuficiente, contrapendiente o punto de acumulacion", ["pendiente", "drenaje"], "fuga_fluidos", "drenaje", "pendiente incorrecta"),
        temaC("sello_deficiente", "Sello de bajada o drenaje deficiente", "Sello, union o remate de bajada permite filtracion o ingreso de agua", ["sello", "filtracion"], "fuga_fluidos", "sello de bajada", "deficiente"),
        temaC("obstruccion_drenaje", "Drenaje obstruido por residuos", "Drenaje, sumidero o descarga mantiene residuos que impiden evacuacion", ["obstruccion", "drenaje"], "fuga_fluidos", "drenaje", "obstruido"),
        temaC("agua_acumulada_transito", "Agua acumulada en zona de transito", "Fuga, prueba o drenaje deficiente deja agua en ruta de circulacion", ["agua", "transito"], "caida_mismo_nivel", "zona con agua", "resbaladiza"),
        temaC("bajada_en_altura", "Instalacion de bajada en altura sin control", "Bajada exterior o shaft se instala desde escalera, plataforma o borde sin proteccion suficiente", ["bajada", "altura"], "caida_distinto_nivel", "bajada en altura", "sin control de caida", "alto"),
        temaC("caida_tramo_bajada", "Caida de tramo de bajada", "Tramo de bajada, abrazadera o herramienta queda sin contencion sobre nivel inferior", ["tramo", "caida"], "caida_objetos", "tramo de bajada", "sin contencion"),
        temaC("perforacion_bajada_polvo", "Perforacion para bajada sin control de polvo", "Perforacion de muro o losa para bajada genera polvo y particulas sin control", ["perforacion", "bajada"], "perforacion_polvo", "perforacion para bajada", "polvo sin control"),
        temaC("corte_tuberia_bajada", "Corte de tuberia de bajada sin control", "Tuberia o canaleta de bajada se corta sin sujecion ni control de rebaba", ["corte", "bajada"], "corte_borde", "tuberia de bajada", "corte sin control"),
        temaC("ducto_sin_rotulacion", "Drenaje o bajada sin identificacion", "Red de drenaje, bajada o descarga no indica servicio o sentido de evacuacion", ["rotulacion", "bajada"], "rotulacion_identificacion", "red de drenaje", "sin identificacion"),
        temaC("interferencia_con_electricidad_drenaje", "Drenaje cercano a instalacion electrica", "Bajada, fuga o acumulacion de agua queda proxima a cable, tablero o canalizacion", ["drenaje", "electricidad"], "interferencia_redes", "drenaje y electricidad", "interferencia no controlada", "alto"),
        temaC("descarga_sin_contencion", "Descarga de prueba sin contencion", "Prueba o lavado de red descarga agua hacia area no preparada o sin drenaje", ["descarga", "prueba"], "fuga_fluidos", "descarga de prueba", "sin contencion"),
        temaC("residuo_en_sumidero", "Residuo en sumidero o canaleta", "Material de obra, tierra o restos bloquean sumidero, canaleta o punto de evacuacion", ["sumidero", "residuo"], "caida_mismo_nivel", "sumidero o canaleta", "con residuos"),
        temaC("contacto_agua_contaminada", "Contacto con agua contaminada en drenaje", "Limpieza o reparacion de drenaje expone a lodo, agua residual o material contaminado", ["agua contaminada", "drenaje"], "aguas_residuales", "drenaje contaminado", "contacto no controlado"),
        temaC("sellante_sin_hds", "Sellante de drenaje sin HDS/SDS", "Sellante, adhesivo o limpiador se usa en drenaje sin ficha ni rotulacion", ["sellante", "hds"], "vapores_quimicos", "sellante de drenaje", "sin HDS/SDS"),
        temaC("ventilacion_shaft_deficiente", "Ventilacion deficiente en shaft sanitario", "Trabajo en shaft o recinto de drenaje se ejecuta sin renovacion de aire suficiente", ["shaft", "ventilacion"], "ventilacion_deficiente", "shaft sanitario", "ventilacion insuficiente"),
        temaC("manipulacion_tramo_largo", "Manipulacion de tramo largo de bajada", "Tramo largo de tuberia o canaleta se manipula manualmente sin apoyo ni coordinacion", ["tramo largo", "bajada"], "manipulacion_manual", "tramo de bajada", "manejo manual exigente"),
        temaC("postura_fijacion_bajada", "Postura forzada al fijar bajada", "Fijacion o sellado de bajada obliga a trabajo sobre cabeza o alcance lateral", ["postura", "fijacion"], "postura_forzada", "fijacion de bajada", "postura forzada"),
        temaC("herramienta_fijacion_danada", "Herramienta de fijacion danada", "Taladro, atornillador o broca usada en bajada presenta dano o accesorio incompatible", ["herramienta", "fijacion"], "herramienta_electrica", "herramienta de fijacion", "defectuosa"),
        temaC("ruido_fijacion_bajada", "Ruido por fijacion de bajada", "Perforacion o fijacion de bajada genera ruido y vibracion sin proteccion", ["ruido", "fijacion"], "ruido_vibracion", "fijacion de bajada", "ruido no controlado"),
        temaC("prueba_estanqueidad_sin_registro", "Prueba de estanqueidad sin registro", "Prueba de bajada o drenaje no deja evidencia, responsable ni resultado verificable", ["estanqueidad", "registro"], "autorizacion_documental", "prueba de drenaje", "sin registro"),
        temaC("matriz_no_cubre_drenaje", "Matriz no cubre prueba de drenaje", "Prueba, limpieza o intervencion de drenaje no esta considerada en analisis vigente", ["matriz", "drenaje"], "matriz_no_cubre", "prueba de drenaje", "no evaluada"),
        temaC("area_prueba_sin_senalizar", "Area de prueba de drenaje sin senalizar", "Zona de prueba, descarga o limpieza de drenaje queda abierta al transito", ["senalizacion", "prueba"], "segregacion_senalizacion", "area de prueba", "sin senalizacion"),
        temaC("abrazadera_danada", "Abrazadera o soporte danado", "Soporte, abrazadera o fijacion de bajada presenta dano, deformacion o falta de perno", ["abrazadera", "soporte"], "mantencion_certificacion", "soporte de bajada", "danado"),
        temaC("dano_terminacion_por_fuga", "Dano a terminacion por filtracion", "Fuga o prueba de red afecta cielo, muro, piso, aislacion o terminacion instalada", ["filtracion", "terminacion"], "dano_material", "terminacion cercana", "expuesta a dano"),
        temaC("bajada_sin_proteccion_golpe", "Bajada expuesta a golpe de maquinaria", "Bajada o drenaje queda en ruta de equipos, acopios o traslado sin proteccion", ["bajada", "golpe"], "dano_material", "bajada de agua", "expuesta a golpe"),
        temaC("conexion_cruzada_no_verificada", "Conexion de drenaje no verificada", "Conexion entre bajada, drenaje o descarga no confirma destino ni compatibilidad", ["conexion", "drenaje"], "rotulacion_identificacion", "conexion de drenaje", "no verificada"),
        temaC("tapa_sumidero_suelta", "Tapa de sumidero suelta", "Tapa, rejilla o registro queda suelto, mal asentado o con desnivel", ["sumidero", "tapa"], "caida_mismo_nivel", "tapa de sumidero", "suelta"),
        temaC("acceso_shaft_no_controlado", "Acceso a shaft sanitario sin control", "Shaft, registro o vano sanitario queda abierto durante instalacion o prueba", ["shaft", "acceso"], "segregacion_senalizacion", "shaft sanitario", "abierto sin control", "alto"),
        temaC("trabajo_simultaneo_bajada", "Trabajos simultaneos bajo bajada", "Otra cuadrilla circula bajo punto donde se fija, corta o prueba bajada", ["simultaneo", "bajada"], "segregacion_senalizacion", "trabajo bajo bajada", "sin coordinacion"),
        temaC("limpieza_drenaje_sin_control", "Limpieza de drenaje sin control ambiental", "Lodo, agua o residuo retirado del drenaje queda sin segregacion ni disposicion", ["limpieza", "drenaje"], "aguas_residuales", "residuo de drenaje", "sin disposicion"),
        temaC("pendiente_modificada_sin_revision", "Pendiente modificada sin revision tecnica", "Cambio de pendiente o recorrido de drenaje se ejecuta sin validacion tecnica", ["pendiente", "revision"], "autorizacion_documental", "pendiente de drenaje", "modificada sin revision"),
      ],
    },
    {
      id: "climatizacion_ductos_ventilacion",
      nombreVisible: "Climatizacion, ductos y ventilacion",
      descripcionActividad:
        "Montaje, corte, izaje menor, fijacion, sellado, conexion y prueba de ductos, equipos, rejillas, soportes y ventilacion mecanica.",
      etapaObra: "Instalaciones mecanicas y climatizacion",
      contextoTecnico: "durante climatizacion, montaje de ductos, ventilacion, rejillas, soportes y equipos sobre cielo o sala tecnica",
      palabrasClaveActividad: ["climatizacion", "ducto", "ventilacion", "rejilla", "cielo falso", "equipo"],
      familiasPreventivasRelacionadas: ["herramientas_equipos", "trabajos_criticos", "higiene_ocupacional", "ergonomia_manejo_manual"],
      desviacionesFrecuentes: ["condicion_insegura", "uso_inadecuado_herramienta_equipo_maquinaria", "control_critico_ausente_no_verificado"],
      documentosFrecuentesAplicables: ["AST/ART si hay altura, corte, equipo pesado o sustancia", "Matriz de riesgos vigente"],
      documentosQueNoAplicanPorDefecto: ["Permiso electrico si no hay conexion o energia", "HDS/SDS si no se usan sellantes o solventes"],
      preguntasEstrategicasSugeridas: [
        "La instalacion de ductos se realiza en altura, cielo falso o sobre plataforma?",
        "Existen bordes filosos, corte, polvo, ruido o proyeccion de particulas?",
        "El ducto, equipo o rejilla requiere apoyo mecanico, sujecion temporal o segregacion inferior?",
        "Se usan sellantes, adhesivos o solventes que requieran HDS/SDS y ventilacion?",
        "La fijacion y soporte del equipo o ducto quedaron verificados antes de liberar?",
      ],
      erroresQueDebeEvitarElMotor: ["No reducir climatizacion a dano material si hay altura, ducto metalico, bordes, polvo o equipos pesados."],
      bibliotecasSecundariasRelacionadas: ["epp", "mantencion_certificacion", "dano_material"],
      definicionesRiesgo: [
        temaC("ducto_borde_filoso", "Ducto metalico con borde filoso", "Ducto, rejilla o bandeja de climatizacion presenta rebaba o canto cortante", ["ducto", "borde"], "corte_borde", "ducto metalico", "borde filoso"),
        temaC("corte_ducto_sin_control", "Corte de ducto sin control de proyeccion", "Corte o ajuste de ducto metalico proyecta particulas y rebabas sin barrera", ["corte", "ducto"], "perforacion_polvo", "corte de ducto", "proyeccion no controlada"),
        temaC("ducto_sin_sujecion", "Ducto presentado sin sujecion temporal", "Tramo de ducto queda apoyado o suspendido sin soporte temporal suficiente", ["ducto", "sujecion"], "caida_objetos", "ducto presentado", "sin sujecion", "alto"),
        temaC("equipo_pesado_manual", "Equipo de climatizacion manipulado manualmente", "Equipo, extractor o unidad se posiciona sin ayuda mecanica ni apoyo suficiente", ["equipo", "peso"], "manipulacion_manual", "equipo de climatizacion", "manejo manual exigente"),
        temaC("trabajo_cielo_falso", "Trabajo sobre cielo falso sin control", "Trabajador instala ductos o rejillas sobre cielo falso sin plataforma o apoyo seguro", ["cielo falso", "ducto"], "caida_distinto_nivel", "trabajo sobre cielo falso", "sin acceso seguro", "alto"),
        temaC("escalera_para_ducto", "Escalera inadecuada para ducto", "Ducto o rejilla se instala desde escalera sin estabilidad, tres puntos o apoyo", ["escalera", "ducto"], "caida_distinto_nivel", "escalera para ducto", "inestable"),
        temaC("zona_inferior_abierta", "Zona inferior abierta bajo ductos", "Personas circulan bajo punto donde se fija, corta o presenta ducto", ["zona inferior", "ducto"], "segregacion_senalizacion", "area bajo ducto", "sin segregacion"),
        temaC("herramienta_sin_amarre_ducto", "Herramienta sin amarre al instalar ductos", "Taladro, remachadora o llave se usa sobre nivel sin amarre ni bandeja", ["herramienta", "amarre"], "caida_objetos", "herramienta en ductos", "sin amarre"),
        temaC("taladro_cielo_polvo", "Taladro en cielo sin control de polvo", "Perforacion en cielo o losa para soporte de ducto genera polvo hacia operador", ["taladro", "cielo"], "perforacion_polvo", "perforacion de cielo", "polvo sin control"),
        temaC("ruido_remachadora", "Ruido por remachado o corte de ductos", "Remachadora, taladro o corte de ducto genera ruido sin proteccion auditiva", ["ruido", "remachadora"], "ruido_vibracion", "remachado de ducto", "ruido no controlado"),
        temaC("postura_sobre_cabeza_ductos", "Postura forzada al fijar ductos", "Fijacion o sellado de ductos obliga a trabajo sobre cabeza o torsion prolongada", ["postura", "ductos"], "postura_forzada", "fijacion de ductos", "postura forzada"),
        temaC("sellante_ducto_sin_hds", "Sellante de ductos sin HDS/SDS", "Sellante, adhesivo o espuma usada en ductos no cuenta con HDS/SDS disponible", ["sellante", "hds"], "vapores_quimicos", "sellante de ducto", "sin HDS/SDS"),
        temaC("ventilacion_recinto_deficiente", "Ventilacion deficiente en sala tecnica", "Trabajo con sellos, polvo o equipo se realiza en sala tecnica sin ventilacion", ["ventilacion", "sala tecnica"], "ventilacion_deficiente", "sala tecnica", "ventilacion insuficiente"),
        temaC("ducto_obstruye_transito", "Ductos obstruyen ruta de transito", "Tramos de ducto, perfiles o rejillas quedan en pasillo o acceso", ["ducto", "transito"], "caida_mismo_nivel", "ductos acopiados", "obstruyen paso"),
        temaC("acopio_ductos_inestable", "Acopio de ductos inestable", "Ductos o rejillas se apilan sin amarre, cuna o control de vuelco", ["acopio", "ductos"], "dano_material", "acopio de ductos", "inestable"),
        temaC("fijacion_soporte_no_verificada", "Soporte de ducto no verificado", "Soporte, perno, tarugo o perfil no evidencia resistencia antes de liberar ducto", ["soporte", "ducto"], "dano_material", "soporte de ducto", "no verificado", "alto"),
        temaC("interferencia_redes_cielo", "Interferencia con redes sobre cielo", "Ducto o soporte cruza cables, rociadores, bandejas o tuberias existentes", ["interferencia", "cielo"], "interferencia_redes", "redes sobre cielo", "interferencia no verificada", "alto"),
        temaC("conexion_electrica_equipo", "Conexion electrica de equipo sin control", "Equipo de climatizacion se conecta sin verificar energia, aislacion o responsable electrico", ["conexion", "equipo"], "contacto_electrico", "equipo de climatizacion", "conexion sin control", "alto"),
        temaC("bloqueo_equipo_clima", "Equipo de climatizacion sin bloqueo", "Equipo o ventilador se interviene sin bloqueo ante arranque o energia residual", ["bloqueo", "ventilador"], "energia_loto", "equipo de climatizacion", "sin bloqueo", "critico"),
        temaC("partes_moviles_ventilador", "Partes moviles de ventilador expuestas", "Ventilador o equipo deja aspas, correas o movimiento accesible durante prueba", ["ventilador", "aspas"], "herramienta_electrica", "partes moviles", "expuestas", "alto"),
        temaC("prueba_equipo_sin_area", "Prueba de equipo sin area controlada", "Prueba de ventilador o equipo se realiza con personas cerca de partes moviles", ["prueba", "equipo"], "segregacion_senalizacion", "area de prueba de equipo", "sin control"),
        temaC("ducto_sin_rotulacion", "Ducto o sistema sin identificacion", "Ducto, rejilla o equipo no identifica flujo, servicio, sentido o zona atendida", ["rotulacion", "ducto"], "rotulacion_identificacion", "sistema de ductos", "sin identificacion"),
        temaC("matriz_no_cubre_clima", "Matriz no cubre montaje de climatizacion", "Altura, equipo pesado, corte o conexion del sistema no esta en analisis vigente", ["matriz", "climatizacion"], "matriz_no_cubre", "montaje de climatizacion", "no evaluado"),
        temaC("autorizacion_equipo_no_definida", "Montaje de equipo sin autorizacion", "Equipo de climatizacion se iza, fija o prueba sin responsable autorizado", ["autorizacion", "equipo"], "autorizacion_documental", "montaje de equipo", "sin autorizacion"),
        temaC("equipo_sin_mantencion", "Equipo de climatizacion sin mantencion", "Equipo, ventilador o herramienta auxiliar no evidencia inspeccion o mantencion", ["mantencion", "equipo"], "mantencion_certificacion", "equipo de climatizacion", "sin mantencion"),
        temaC("fuga_condensado", "Fuga de condensado no contenida", "Linea de condensado o bandeja de drenaje gotea sobre piso, cielo o equipo", ["condensado", "fuga"], "fuga_fluidos", "linea de condensado", "fuga no contenida"),
        temaC("agua_cerca_equipo_electrico", "Condensado cercano a energia", "Agua de condensado o filtracion queda proxima a cable, tablero o equipo energizado", ["condensado", "energia"], "sobrecarga_humedad", "condensado", "cercano a energia", "alto"),
        temaC("rejilla_suelta", "Rejilla o difusor suelto", "Rejilla, difusor o tapa queda presentada sin fijacion definitiva sobre transito", ["rejilla", "difusor"], "caida_objetos", "rejilla o difusor", "suelto"),
        temaC("equipo_sin_apoyo_temporal", "Equipo presentado sin apoyo temporal", "Equipo o ducto pesado queda sostenido manualmente mientras se busca fijacion", ["apoyo", "equipo"], "manipulacion_manual", "equipo o ducto", "sin apoyo temporal"),
        temaC("polvo_limpieza_ductos", "Polvo en limpieza o ajuste de ductos", "Limpieza, corte o ajuste de ductos libera polvo hacia trabajadores o recinto", ["polvo", "ductos"], "perforacion_polvo", "ducto", "polvo no controlado"),
        temaC("dano_cielo_terminacion", "Dano a cielo o terminacion por ducto", "Montaje de ducto o rejilla afecta cielo falso, terminacion o instalacion cercana", ["cielo", "terminacion"], "dano_material", "cielo o terminacion", "expuesto a dano"),
        temaC("retiro_panel_cielo_sin_control", "Retiro de panel de cielo sin control", "Panel, placa o registro de cielo se retira sin contencion ni area segregada", ["panel", "cielo"], "caida_objetos", "panel de cielo", "sin contencion"),
      ],
    },
    {
      id: "pruebas_presion_fugas_puesta_servicio",
      nombreVisible: "Pruebas de presion, fugas y puesta en servicio",
      descripcionActividad:
        "Ejecucion de pruebas hidraulicas, neumaticas, estanqueidad, deteccion de fugas, purgas, liberacion de energia y puesta en servicio de redes.",
      etapaObra: "Pruebas, comisionamiento y puesta en servicio",
      contextoTecnico: "durante pruebas de presion, fugas, purgas, estanqueidad y puesta en servicio de redes tecnicas",
      palabrasClaveActividad: ["prueba", "presion", "fuga", "valvula", "puesta en servicio", "acople"],
      familiasPreventivasRelacionadas: ["trabajos_criticos", "maquinaria_instalaciones", "dano_material", "senalizacion_segregacion"],
      desviacionesFrecuentes: ["incumplimiento_control_critico", "suceso_peligroso_sin_lesion", "control_critico_ausente_no_verificado"],
      documentosFrecuentesAplicables: ["Procedimiento o registro de prueba si aplica", "AST/ART", "Matriz de riesgos vigente"],
      documentosQueNoAplicanPorDefecto: ["HDS/SDS si no hay sustancias", "Permiso electrico si la prueba no involucra energia"],
      preguntasEstrategicasSugeridas: [
        "La red esta presurizada, purgada o en proceso de puesta en servicio?",
        "Existe energia acumulada, sobrepresion, fuga, acople o valvula critica?",
        "El area de prueba esta segregada y con responsable tecnico definido?",
        "Los instrumentos, manometros y registros de prueba estan verificados?",
        "La condicion requiere descargar, bloquear, reparar, contener o repetir la prueba?",
      ],
      erroresQueDebeEvitarElMotor: ["No clasificar prueba de presion como simple fuga si existe energia acumulada o area no segregada."],
      bibliotecasSecundariasRelacionadas: ["mantencion_certificacion", "documental_legal", "medio_ambiente"],
      definicionesRiesgo: [
        temaC("sobrepresion_sin_manometro", "Sobrepresion sin manometro confiable", "Red o tramo se presuriza sin manometro visible, calibrado o compatible", ["sobrepresion", "manometro"], "presion_sobrepresion", "red en prueba", "sin manometro confiable", "alto"),
        temaC("valvula_sin_control", "Valvula critica sin control", "Valvula de prueba o purga queda accesible, sin responsable o posicion identificada", ["valvula", "prueba"], "rotulacion_identificacion", "valvula de prueba", "sin control"),
        temaC("acople_deficiente", "Acople de prueba deficiente", "Acople, union o manguera de prueba no evidencia fijacion o compatibilidad", ["acople", "manguera"], "presion_sobrepresion", "acople de prueba", "deficiente", "alto"),
        temaC("area_prueba_abierta", "Area de prueba presurizada abierta", "Personas circulan dentro del radio de falla durante presurizacion o purga", ["area", "presurizada"], "segregacion_senalizacion", "area de prueba", "abierta", "alto"),
        temaC("descarga_presion_sin_aviso", "Descarga de presion sin aviso", "Purga o descarga de red se realiza sin advertencia, direccion segura ni contencion", ["descarga", "presion"], "presion_sobrepresion", "descarga de presion", "sin aviso", "alto"),
        temaC("fuga_no_contenida_prueba", "Fuga durante prueba sin contencion", "Fuga detectada en prueba mantiene agua o fluido sin contencion ni corte", ["fuga", "prueba"], "fuga_fluidos", "fuga de prueba", "sin contencion"),
        temaC("rotura_tuberia_prueba", "Rotura de tuberia durante prueba", "Tramo en prueba muestra deformacion, golpe, fisura o riesgo de ruptura", ["rotura", "tuberia"], "presion_sobrepresion", "tuberia en prueba", "riesgo de ruptura", "alto"),
        temaC("instrumento_sin_calibracion", "Instrumento de prueba sin calibracion", "Manometro, bomba o medidor usado en prueba no evidencia vigencia o condicion", ["calibracion", "instrumento"], "mantencion_certificacion", "instrumento de prueba", "sin calibracion"),
        temaC("bomba_prueba_defectuosa", "Bomba de prueba defectuosa", "Bomba, manguera o accesorio de presurizacion presenta dano, fuga o conexion insegura", ["bomba", "prueba"], "mantencion_certificacion", "bomba de prueba", "defectuosa"),
        temaC("puesta_servicio_sin_autorizacion", "Puesta en servicio sin autorizacion", "Red o equipo se libera a uso sin aprobacion, responsable o resultado de prueba", ["puesta en servicio", "autorizacion"], "autorizacion_documental", "puesta en servicio", "sin autorizacion", "alto"),
        temaC("registro_prueba_incompleto", "Registro de prueba incompleto", "Prueba no deja presion, tiempo, responsable, resultado o observacion trazable", ["registro", "prueba"], "autorizacion_documental", "registro de prueba", "incompleto"),
        temaC("matriz_no_cubre_presion", "Matriz no cubre prueba de presion", "La prueba incorpora presion, purga o fluido no considerado en analisis vigente", ["matriz", "presion"], "matriz_no_cubre", "prueba de presion", "no evaluada", "alto"),
        temaC("bloqueo_presion_residual", "Presion residual sin bloqueo o descarga", "Tramo permanece con energia residual despues de prueba sin descarga o bloqueo", ["presion residual", "bloqueo"], "energia_loto", "red presurizada", "presion residual", "critico"),
        temaC("fuga_cerca_electricidad", "Fuga de prueba cercana a energia", "Fuga o descarga de prueba se aproxima a cable, tablero o equipo energizado", ["fuga", "electricidad"], "sobrecarga_humedad", "fuga de prueba", "cercana a energia", "alto"),
        temaC("fluido_sin_identificar", "Fluido de prueba sin identificar", "Red en prueba no identifica fluido, sentido de descarga o punto de contencion", ["fluido", "identificar"], "rotulacion_identificacion", "fluido de prueba", "sin identificar"),
        temaC("gas_prueba_sin_ventilacion", "Prueba con gas sin ventilacion", "Prueba o purga con gas o aire comprimido se realiza sin ventilacion ni control de ignicion", ["gas", "ventilacion"], "gas_combustible", "prueba con gas", "ventilacion insuficiente", "critico"),
        temaC("linea_no_segregada", "Linea de prueba no segregada", "Manguera, tuberia o descarga de prueba cruza zona de transito sin barrera", ["linea", "segregacion"], "segregacion_senalizacion", "linea de prueba", "sin segregacion"),
        temaC("manguera_prueba_en_piso", "Manguera de prueba en ruta de paso", "Manguera presurizada o de descarga queda tendida en piso de circulacion", ["manguera", "piso"], "caida_mismo_nivel", "manguera de prueba", "en ruta de paso"),
        temaC("union_sin_inspeccion_previa", "Union no inspeccionada antes de prueba", "Union, abrazadera o fitting se presuriza sin inspeccion visual previa", ["union", "inspeccion"], "presion_sobrepresion", "union de prueba", "sin inspeccion"),
        temaC("equipo_bajo_presion_sin_resguardo", "Equipo bajo presion sin resguardo", "Equipo, estanque o tramo de red queda presurizado sin resguardo mecanico", ["equipo", "presion"], "presion_sobrepresion", "equipo bajo presion", "sin resguardo", "alto"),
        temaC("terceros_no_informados", "Terceros no informados de prueba", "Cuadrillas vecinas no son informadas de presurizacion, purga o puesta en servicio", ["terceros", "informados"], "segregacion_senalizacion", "cuadrillas vecinas", "sin informacion"),
        temaC("prueba_nocturna_iluminacion", "Prueba con iluminacion deficiente", "Revision de fugas o manometros se realiza con baja visibilidad o sombras", ["iluminacion", "prueba"], "segregacion_senalizacion", "area de prueba", "baja visibilidad"),
        temaC("acceso_valvula_obstruido", "Acceso a valvula de emergencia obstruido", "Ruta hacia valvula de corte o purga queda bloqueada por materiales", ["valvula", "acceso"], "caida_mismo_nivel", "acceso a valvula", "obstruido"),
        temaC("contencion_descarga_insuficiente", "Contencion de descarga insuficiente", "Descarga de prueba no cuenta con recipiente, drenaje o barrera adecuada", ["descarga", "contencion"], "fuga_fluidos", "descarga de prueba", "contencion insuficiente"),
        temaC("residuo_prueba_sin_retiro", "Residuo de prueba sin retiro", "Agua, lodo, espuma o material usado en prueba queda en el area", ["residuo", "prueba"], "fuga_fluidos", "residuo de prueba", "sin retiro"),
        temaC("presion_con_personas_linea_fuego", "Personas en linea de falla de acople", "Trabajadores permanecen frente a acople, tapa o union durante presurizacion", ["linea de fuego", "acople"], "presion_sobrepresion", "linea de falla", "personas expuestas", "alto"),
        temaC("apertura_valvula_brusca", "Apertura brusca de valvula", "Valvula se abre rapidamente generando golpe de ariete o descarga no controlada", ["valvula", "golpe de ariete"], "presion_sobrepresion", "valvula de prueba", "apertura brusca", "alto"),
        temaC("prueba_sin_secuencia", "Prueba sin secuencia definida", "Presurizacion, purga y liberacion no cuentan con secuencia clara para la cuadrilla", ["secuencia", "prueba"], "autorizacion_documental", "secuencia de prueba", "no definida"),
        temaC("equipo_electrico_en_puesta_servicio", "Equipo electrico en puesta en servicio sin control", "Puesta en servicio involucra energizacion de bomba, tablero o equipo sin bloqueo coordinado", ["equipo electrico", "puesta en servicio"], "contacto_electrico", "equipo en puesta en servicio", "energia no controlada", "critico"),
        temaC("ruido_purga_presion", "Ruido por purga de presion", "Purga o descarga genera ruido repentino sin aviso ni proteccion auditiva", ["ruido", "purga"], "ruido_vibracion", "purga de presion", "ruido no controlado"),
        temaC("postura_revision_fuga", "Postura forzada al revisar fugas", "Revision de uniones o fugas obliga a posturas bajo equipo, shaft o cielo", ["postura", "fuga"], "postura_forzada", "revision de fuga", "postura forzada"),
        temaC("dano_terminacion_por_prueba", "Dano a terminacion por prueba", "Prueba de red expone terminaciones, equipos o cielo a filtracion o descarga", ["terminacion", "prueba"], "dano_material", "terminacion cercana", "expuesta a dano"),
      ],
    },
    {
      id: "canalizaciones_perforaciones_pasadas_muros_losas",
      nombreVisible: "Canalizaciones, perforaciones y pasadas en muros o losas",
      descripcionActividad:
        "Trazado, perforacion, ranurado, pasada, sellado y proteccion de canalizaciones tecnicas en muros, losas, cielos, shafts y elementos existentes.",
      etapaObra: "Pasadas tecnicas, interferencias y terminaciones",
      contextoTecnico: "durante canalizaciones, perforaciones, pasadas, ranuras, sellos y trabajos en muros o losas existentes",
      palabrasClaveActividad: ["canalizacion", "perforacion", "pasada", "muro", "losa", "sello"],
      familiasPreventivasRelacionadas: ["herramientas_equipos", "energia_loto_electrico", "higiene_ocupacional", "dano_material"],
      desviacionesFrecuentes: ["condicion_insegura", "dano_material", "requiere_revision_tecnica_legal"],
      documentosFrecuentesAplicables: ["Plano o trazado de instalaciones", "AST/ART si hay perforacion critica", "Matriz de riesgos vigente"],
      documentosQueNoAplicanPorDefecto: ["HDS/SDS si no hay sellantes o sustancias", "Permiso especial si solo es ajuste menor controlado"],
      preguntasEstrategicasSugeridas: [
        "La perforacion o pasada puede afectar cables, ductos, canerias o estructura existente?",
        "Se verifico trazado, plano, detector o autorizacion antes de perforar?",
        "Existe polvo, silice, ruido, proyeccion de particulas o agua cercana?",
        "La tarea se ejecuta desde escalera, plataforma, cielo falso o borde?",
        "La condicion requiere detener, aislar, sellar, proteger o revisar interferencias?",
      ],
      erroresQueDebeEvitarElMotor: ["No tratar una perforacion como tarea menor si puede afectar red existente, energia, estructura, polvo o altura."],
      bibliotecasSecundariasRelacionadas: ["documental_legal", "senalizacion_segregacion", "orden_aseo_housekeeping"],
      definicionesRiesgo: [
        temaC("perforacion_sin_trazado", "Perforacion sin trazado previo", "Pasada o perforacion en muro o losa se inicia sin trazado, plano o verificacion", ["perforacion", "trazado"], "interferencia_redes", "perforacion", "sin trazado previo", "alto"),
        temaC("dano_cable_oculto", "Riesgo de dano a cable oculto", "Perforacion puede interceptar cable, ducto electrico o canalizacion oculta", ["cable", "oculto"], "interferencia_redes", "cable oculto", "no verificado", "alto"),
        temaC("dano_caneria_oculta", "Riesgo de dano a caneria oculta", "Pasada o ranura se ejecuta sin descartar red de agua, drenaje o gas", ["caneria", "oculta"], "interferencia_redes", "caneria oculta", "no verificada", "alto"),
        temaC("perforacion_con_energia_cercana", "Perforacion cercana a energia", "Taladro o copa trabaja cerca de cable, tablero o circuito sin bloqueo", ["energia", "perforacion"], "contacto_electrico", "perforacion cercana a energia", "sin bloqueo", "critico"),
        temaC("taladro_sin_inspeccion", "Taladro o perforadora sin inspeccion", "Herramienta de perforacion presenta cable, enchufe, broca o carcasa en condicion deficiente", ["taladro", "inspeccion"], "herramienta_electrica", "taladro o perforadora", "sin inspeccion"),
        temaC("broca_incompatible", "Broca o copa incompatible", "Accesorio de perforacion no corresponde al material, diametro o herramienta usada", ["broca", "copa"], "herramienta_electrica", "broca o copa", "incompatible"),
        temaC("polvo_silice_sin_extraccion", "Polvo de silice sin extraccion", "Perforacion o ranurado de hormigon genera polvo mineral sin extraccion ni humectacion", ["silice", "polvo"], "perforacion_polvo", "perforacion en hormigon", "sin extraccion"),
        temaC("proyeccion_particulas_pasada", "Proyeccion de particulas en pasada", "Taladro, cincel o corte proyecta particulas hacia rostro o zona de terceros", ["particulas", "pasada"], "perforacion_polvo", "pasada en muro", "proyeccion no controlada"),
        temaC("ruido_perforadora", "Ruido por perforadora o rotomartillo", "Rotomartillo, taladro o esmeril genera ruido y vibracion sin control ocupacional", ["ruido", "rotomartillo"], "ruido_vibracion", "perforadora", "ruido no controlado"),
        temaC("vibracion_afecta_terminacion", "Vibracion afecta terminacion existente", "Perforacion o ranurado transmite vibracion a revestimiento, cielo o elemento terminado", ["vibracion", "terminacion"], "dano_material", "terminacion existente", "expuesta a vibracion"),
        temaC("perforacion_sobre_escalera", "Perforacion desde escalera sin control", "Trabajador perfora muro o cielo desde escalera con alcance lateral o postura inestable", ["escalera", "perforacion"], "caida_distinto_nivel", "perforacion desde escalera", "inestable", "alto"),
        temaC("pasada_sobre_cabeza", "Perforacion sobre cabeza sin control", "Perforacion en cielo o losa proyecta polvo y material hacia operador", ["cielo", "sobre cabeza"], "perforacion_polvo", "perforacion sobre cabeza", "sin control"),
        temaC("caida_testigo_losa", "Caida de testigo o material de losa", "Nucleo, testigo, trozo o recorte puede caer al nivel inferior durante pasada", ["testigo", "losa"], "caida_objetos", "testigo de losa", "sin contencion", "alto"),
        temaC("zona_inferior_sin_cierre", "Zona inferior de perforacion sin cierre", "Nivel inferior permanece abierto mientras se perfora, corta o retira material", ["zona inferior", "perforacion"], "segregacion_senalizacion", "area inferior", "sin cierre", "alto"),
        temaC("agua_perforacion_electrica", "Agua de perforacion cercana a electricidad", "Perforacion con humectacion o diamantina genera agua cerca de cables o tablero", ["agua", "diamantina"], "sobrecarga_humedad", "agua de perforacion", "cercana a energia", "alto"),
        temaC("diamantina_sin_contencion", "Lodo de diamantina sin contencion", "Lodo, agua o polvo de perforacion con diamantina se descarga sin contencion", ["diamantina", "lodo"], "fuga_fluidos", "lodo de perforacion", "sin contencion"),
        temaC("ranura_sin_proteccion_borde", "Ranura o canal abierto sin proteccion", "Ranura en piso o muro queda abierta, con borde o desnivel expuesto al transito", ["ranura", "canal"], "caida_mismo_nivel", "ranura abierta", "sin proteccion"),
        temaC("pasada_sin_sello", "Pasada sin sello o proteccion", "Pasada queda abierta sin sello, collarin, proteccion contra fuego, agua o plaga", ["pasada", "sello"], "dano_material", "pasada tecnica", "sin sello"),
        temaC("sello_sin_hds", "Sello o espuma sin HDS/SDS", "Producto de sellado se aplica sin HDS/SDS, rotulacion o ventilacion suficiente", ["sello", "hds"], "vapores_quimicos", "producto de sellado", "sin HDS/SDS"),
        temaC("ventilacion_deficiente_perforacion", "Ventilacion deficiente al perforar", "Perforacion o sellado se realiza en recinto cerrado sin renovacion de aire", ["ventilacion", "perforacion"], "ventilacion_deficiente", "recinto de perforacion", "ventilacion insuficiente"),
        temaC("autorizacion_pasada_faltante", "Autorizacion de pasada faltante", "Pasada en muro, losa o shaft se ejecuta sin autorizacion tecnica del frente", ["autorizacion", "pasada"], "autorizacion_documental", "pasada tecnica", "sin autorizacion"),
        temaC("matriz_no_cubre_interferencia", "Matriz no cubre interferencia de redes", "Perforacion contempla redes ocultas o estructura sin analisis preventivo actualizado", ["matriz", "interferencia"], "matriz_no_cubre", "interferencia de redes", "no evaluada"),
        temaC("detector_no_usado", "Detector o plano no usado", "No se utiliza detector, plano o cateo para confirmar interferencias antes de perforar", ["detector", "plano"], "interferencia_redes", "verificacion de redes", "no realizada", "alto"),
        temaC("perforacion_sin_responsable", "Perforacion critica sin responsable", "Perforacion en elemento existente no tiene responsable tecnico o supervisor definido", ["responsable", "perforacion"], "autorizacion_documental", "perforacion critica", "sin responsable"),
        temaC("herramienta_sin_guarda", "Herramienta de corte sin guarda", "Esmeril o cortadora usada en ranura no mantiene guarda ni accesorio compatible", ["esmeril", "guarda"], "herramienta_electrica", "herramienta de corte", "sin guarda", "alto"),
        temaC("cable_herramienta_en_piso", "Cable de herramienta cruza ruta", "Cable de taladro o esmeril queda en ruta de transito o sobre escombros", ["cable", "herramienta"], "caida_mismo_nivel", "cable de herramienta", "cruza ruta"),
        temaC("residuos_perforacion_sin_retiro", "Residuos de perforacion sin retiro", "Testigos, polvo, escombros o recortes quedan en el area de trabajo", ["residuos", "perforacion"], "caida_mismo_nivel", "residuos de perforacion", "sin retiro"),
        temaC("postura_forzada_perforacion", "Postura forzada al perforar", "Trabajador perfora con brazos elevados, torsion o posicion sostenida sin apoyo", ["postura", "perforacion"], "postura_forzada", "postura de perforacion", "forzada"),
        temaC("pieza_caliente_corte", "Pieza caliente por corte sin control", "Corte o ranurado deja pieza caliente accesible a manos o material combustible", ["pieza caliente", "corte"], "corte_borde", "pieza cortada", "caliente o filosa"),
        temaC("dano_estructural_no_evaluado", "Posible afectacion estructural no evaluada", "Pasada o ranura en elemento resistente se ejecuta sin verificar impacto tecnico", ["estructural", "losa"], "dano_material", "elemento estructural", "afectacion no evaluada", "alto"),
        temaC("trabajos_simultaneos_perforacion", "Trabajos simultaneos junto a perforacion", "Otra cuadrilla trabaja junto o bajo el punto de corte, ranura o pasada", ["simultaneo", "perforacion"], "segregacion_senalizacion", "trabajos simultaneos", "sin coordinacion"),
        temaC("sellado_incompleto_pasada", "Sellado incompleto de pasada", "Pasada queda parcialmente sellada, sin terminacion o con material incompatible", ["sellado", "pasada"], "dano_material", "sellado de pasada", "incompleto"),
      ],
    },
  ];
}

function crearActividadesBloqueD(): ActividadBloqueD[] {
  return [
    {
      id: "pintura_interior_exterior_esmaltes_barnices",
      nombreVisible: "Pintura interior y exterior, esmaltes y barnices",
      descripcionActividad:
        "Preparacion, aplicacion, retoque y limpieza asociada a pinturas, esmaltes, barnices, solventes, imprimantes y terminaciones interiores o exteriores.",
      etapaObra: "Terminaciones y acabados",
      contextoTecnico: "durante pintura interior o exterior con esmaltes, barnices, solventes, rodillos, brochas, escaleras y proteccion de terminaciones",
      palabrasClaveActividad: ["pintura", "esmalte", "barniz", "solvente", "rodillo", "brocha"],
      familiasPreventivasRelacionadas: ["sustancias_hds", "higiene_ocupacional", "orden_aseo_housekeeping", "trabajos_criticos"],
      desviacionesFrecuentes: ["condicion_insegura", "omision_documental", "falta_conocimiento_capacitacion_difusion"],
      documentosFrecuentesAplicables: documentosTerminacionesQuimicos,
      documentosQueNoAplicanPorDefecto: documentosNoTerminacionSimple,
      preguntasEstrategicasSugeridas: [
        "La pintura, esmalte, barniz o solvente cuenta con HDS/SDS y rotulacion disponible?",
        "Existe ventilacion suficiente y control de vapores o inflamabilidad?",
        "La aplicacion se realiza desde escalera, plataforma, borde o zona compartida?",
        "Hay derrames, trapos contaminados, envases abiertos o residuos sin segregacion?",
        "La condicion requiere limpiar, ventilar, retirar producto, segregar o detener la aplicacion?",
      ],
      erroresQueDebeEvitarElMotor: ["No tratar pintura con solvente como aseo simple si hay vapores, inflamabilidad, HDS/SDS o ventilacion deficiente."],
      bibliotecasSecundariasRelacionadas: ["epp", "senalizacion_segregacion", "medio_ambiente"],
      definicionesRiesgo: [
        temaD("vapores_pintura_sin_ventilacion", "Vapores de pintura sin ventilacion", "Pintura o esmalte se aplica en recinto con ventilacion insuficiente y olor persistente", ["pintura", "vapores"], "ventilacion_deficiente", "recinto pintado", "ventilacion insuficiente"),
        temaD("solvente_sin_hds", "Solvente de pintura sin HDS/SDS", "Solvente, diluyente o barniz se mantiene en uso sin ficha, rotulacion o instrucciones disponibles", ["solvente", "hds"], "vapores_quimicos", "solvente de pintura", "sin HDS/SDS"),
        temaD("envase_sin_rotulo", "Envase de pintura sin rotulacion", "Envase secundario de pintura o diluyente no identifica producto, peligro o responsable", ["envase", "rotulo"], "rotulacion_identificacion", "envase de pintura", "sin rotulo"),
        temaD("trapos_con_solvente", "Trapos con solvente sin segregacion", "Trapos, guaipes o papeles con solvente quedan acumulados junto a materiales combustibles", ["trapos", "solvente"], "gas_combustible", "trapos contaminados", "sin segregacion", "alto"),
        temaD("derrame_pintura", "Derrame de pintura sin contencion", "Pintura, esmalte o barniz derramado queda en piso sin contencion ni limpieza inmediata", ["derrame", "pintura"], "vapores_quimicos", "derrame de pintura", "sin contencion"),
        temaD("piso_resbaladizo_pintura", "Piso resbaladizo por pintura", "Goteo, derrame o pelicula de pintura afecta ruta de paso o zona de trabajo", ["pintura", "piso"], "caida_mismo_nivel", "piso con pintura", "resbaladizo"),
        temaD("escalera_pintura_inestable", "Escalera inestable durante pintura", "Pintor trabaja desde escalera mal apoyada, sin amarre o con alcance lateral excesivo", ["escalera", "pintura"], "caida_distinto_nivel", "escalera de pintura", "inestable", "alto"),
        temaD("plataforma_pintura_sin_control", "Plataforma de pintura sin control", "Plataforma, andamio menor o banquillo usado para pintura no evidencia condicion segura", ["plataforma", "pintura"], "caida_distinto_nivel", "plataforma de pintura", "sin verificacion"),
        temaD("pintura_en_borde_exterior", "Pintura exterior junto a borde", "Aplicacion exterior se realiza cerca de borde, vano o fachada sin control de caida", ["borde", "exterior"], "caida_distinto_nivel", "borde exterior", "sin control", "alto"),
        temaD("caida_herramientas_pintura", "Caida de herramientas de pintura", "Rodillo, bandeja, brocha o tarro queda sin contencion sobre altura o plataforma", ["rodillo", "bandeja"], "caida_objetos", "herramientas de pintura", "sin contencion"),
        temaD("contacto_dermico_pintura", "Contacto dermico con pintura o solvente", "Trabajador manipula pintura, esmalte o diluyente sin guantes compatibles ni limpieza", ["contacto dermico", "pintura"], "vapores_quimicos", "producto de pintura", "contacto dermico"),
        temaD("salpicadura_ocular_pintura", "Salpicadura ocular de pintura", "Aplicacion, mezcla o limpieza genera salpicadura hacia rostro sin proteccion ocular", ["salpicadura", "ocular"], "vapores_quimicos", "pintura o solvente", "riesgo ocular"),
        temaD("respirador_inadecuado", "Proteccion respiratoria inadecuada", "Actividad con vapores, aerosol o lijado previo se ejecuta sin proteccion respiratoria compatible", ["respirador", "vapores"], "vapores_quimicos", "proteccion respiratoria", "inadecuada"),
        temaD("pintura_cerca_ignicion", "Pintura o solvente cerca de ignicion", "Producto inflamable se usa cerca de chispa, tablero, llama, soldadura o equipo caliente", ["ignicion", "solvente"], "gas_combustible", "pintura inflamable", "cerca de ignicion", "alto"),
        temaD("almacenamiento_pintura_inseguro", "Almacenamiento inseguro de pinturas", "Tarros, aerosoles o solventes se acopian sin ventilacion, segregacion o contencion", ["almacenamiento", "pintura"], "vapores_quimicos", "acopio de pintura", "inseguro"),
        temaD("residuo_pintura_sin_manejo", "Residuo de pintura sin manejo definido", "Tarros, brochas, bandejas o residuos con pintura quedan sin segregacion ni retiro", ["residuo", "pintura"], "vapores_quimicos", "residuo de pintura", "sin manejo"),
        temaD("pintura_sobre_senalizacion", "Pintura afecta senalizacion existente", "Aplicacion cubre letreros, demarcacion, advertencias o identificacion preventiva", ["senalizacion", "pintura"], "dano_material", "senalizacion existente", "cubierta por pintura"),
        temaD("area_pintada_sin_senalizar", "Area pintada sin senalizacion", "Sector con pintura fresca permanece habilitado al transito sin aviso ni barrera", ["pintura fresca", "senalizacion"], "segregacion_senalizacion", "area pintada", "sin senalizacion"),
        temaD("pintura_en_zona_compartida", "Pintura en zona compartida sin segregacion", "Aplicacion con vapores o derrames se ejecuta con otras cuadrillas circulando cerca", ["zona compartida", "pintura"], "segregacion_senalizacion", "zona de pintura", "sin segregacion"),
        temaD("mezcla_producto_sin_control", "Mezcla de productos sin control", "Pintura, catalizador, diluyente o barniz se mezcla sin recipiente, proporcion o ventilacion", ["mezcla", "barniz"], "vapores_quimicos", "mezcla de pintura", "sin control"),
        temaD("pulverizado_sin_barrera", "Aplicacion pulverizada sin barrera", "Pistola o aerosol proyecta pintura hacia terceros, equipos o terminaciones sin proteccion", ["pulverizado", "aerosol"], "segregacion_senalizacion", "aplicacion pulverizada", "sin barrera"),
        temaD("equipo_pintura_defectuoso", "Equipo de pintura defectuoso", "Compresor, manguera, pistola o extension usada en pintura presenta fuga o dano", ["compresor", "pistola"], "herramienta_electrica", "equipo de pintura", "defectuoso"),
        temaD("manguera_pintura_transito", "Manguera de pintura en transito", "Manguera, cable o extension cruza ruta de paso durante aplicacion", ["manguera", "transito"], "caida_mismo_nivel", "manguera de pintura", "cruza ruta"),
        temaD("postura_forzada_pintura", "Postura forzada al pintar", "Pintura de cielo, esquina o fachada obliga a extension sostenida de brazos y cuello", ["postura", "cielo"], "postura_forzada", "postura de pintura", "forzada"),
        temaD("movimiento_repetitivo_pintura", "Movimiento repetitivo en aplicacion", "Uso prolongado de rodillo o brocha genera repeticion sin pausas ni rotacion", ["repetitivo", "rodillo"], "postura_forzada", "aplicacion de pintura", "repetitiva"),
        temaD("limpieza_herramientas_solvente", "Limpieza de herramientas con solvente", "Brochas o rodillos se limpian con solvente sin ventilacion, guantes ni contencion", ["limpieza", "solvente"], "vapores_quimicos", "limpieza de herramientas", "sin control"),
        temaD("barniz_en_espacio_cerrado", "Barniz en espacio cerrado", "Barniz o esmalte de alta emision se aplica en recinto cerrado con baja renovacion de aire", ["barniz", "cerrado"], "ventilacion_deficiente", "recinto barnizado", "cerrado"),
        temaD("proteccion_superficie_insuficiente", "Proteccion de superficie insuficiente", "Pintura puede contaminar piso, vidrio, equipo o terminacion sin proteccion previa", ["proteccion", "superficie"], "dano_material", "superficie cercana", "sin proteccion"),
        temaD("pintura_exterior_viento", "Pintura exterior con viento", "Viento desplaza aerosol, polvo o gotas hacia trabajadores, terceros o terminaciones", ["viento", "exterior"], "segregacion_senalizacion", "pintura exterior", "afectada por viento"),
        temaD("pintura_sin_epp_basico", "EPP incompatible para pintura", "Trabajador pinta con producto quimico sin guantes, lentes o proteccion respiratoria compatible", ["epp", "pintura"], "vapores_quimicos", "EPP de pintura", "incompatible"),
        temaD("tarro_abierto_sin_control", "Tarro abierto sin control", "Tarro de pintura, diluyente o barniz queda abierto en ruta o cerca de fuente de calor", ["tarro", "abierto"], "vapores_quimicos", "tarro de pintura", "abierto sin control"),
        temaD("retiro_residuo_pintura_tardio", "Retiro tardio de residuos de pintura", "Residuos, protecciones y envases quedan al cierre de jornada sin retiro ni orden final", ["retiro", "residuo"], "caida_mismo_nivel", "residuos de pintura", "retiro tardio"),
      ],
    },
    {
      id: "empaste_lijado_preparacion_superficies",
      nombreVisible: "Empaste, lijado y preparacion de superficies",
      descripcionActividad:
        "Empaste, masillado, raspado, lijado manual o mecanico, preparacion de muros, cielos y superficies antes de pintura o revestimiento.",
      etapaObra: "Preparacion de terminaciones",
      contextoTecnico: "durante empaste, lijado, raspado y preparacion de superficies en muros, cielos, encuentros y terminaciones",
      palabrasClaveActividad: ["empaste", "lijado", "masilla", "superficie", "polvo", "lija"],
      familiasPreventivasRelacionadas: ["higiene_ocupacional", "herramientas_equipos", "ergonomia_manejo_manual", "orden_aseo_housekeeping"],
      desviacionesFrecuentes: ["condicion_insegura", "falta_conocimiento_capacitacion_difusion", "uso_inadecuado_herramienta_equipo_maquinaria"],
      documentosFrecuentesAplicables: ["Matriz de riesgos vigente", "AST/ART si hay lijado mecanico continuo o trabajo en altura", "HDS/SDS si se usan productos quimicos"],
      documentosQueNoAplicanPorDefecto: documentosNoTerminacionSimple,
      preguntasEstrategicasSugeridas: [
        "La preparacion genera polvo, particulas, ruido o vibracion relevante?",
        "Existe ventilacion, extraccion, limpieza y proteccion respiratoria compatible?",
        "La herramienta electrica o lijadora esta en buen estado e inspeccionada?",
        "La tarea se realiza sobre escalera, plataforma, cielo o postura forzada?",
        "La condicion requiere limpiar, ventilar, segregar, retirar residuos o detener la tarea?",
      ],
      erroresQueDebeEvitarElMotor: ["No reducir empaste o lijado a aseo final si existe polvo respirable, herramienta electrica, altura o exposicion ocular."],
      bibliotecasSecundariasRelacionadas: ["epp", "senalizacion_segregacion", "capacitacion_evidencias"],
      definicionesRiesgo: [
        temaD("polvo_lijado_sin_extraccion", "Polvo de lijado sin extraccion", "Lijado de muro o cielo genera polvo fino sin extraccion, humectacion ni ventilacion", ["lijado", "polvo"], "perforacion_polvo", "superficie lijada", "polvo sin control"),
        temaD("polvo_silice_empaste", "Polvo mineral en preparacion", "Raspado o lijado de superficie cementicia genera polvo mineral con posible silice", ["silice", "superficie"], "perforacion_polvo", "superficie cementicia", "polvo mineral"),
        temaD("lijadora_defectuosa", "Lijadora electrica defectuosa", "Lijadora, cable, enchufe o interruptor presenta dano visible antes de uso", ["lijadora", "defectuosa"], "herramienta_electrica", "lijadora electrica", "defectuosa"),
        temaD("cable_lijadora_transito", "Cable de lijadora cruza ruta", "Cable o extension de lijadora queda en zona de paso o sobre polvo acumulado", ["cable", "lijadora"], "caida_mismo_nivel", "cable de lijadora", "en ruta"),
        temaD("proyeccion_particulas_lijado", "Proyeccion de particulas al lijar", "Lijado o raspado proyecta particulas hacia ojos, rostro o terceros cercanos", ["particulas", "lijado"], "perforacion_polvo", "particulas de lijado", "proyeccion no controlada"),
        temaD("proteccion_ocular_ausente", "Proteccion ocular ausente en lijado", "Trabajador lija o raspa superficie sin lentes o pantalla contra particulas", ["ocular", "lija"], "perforacion_polvo", "proteccion ocular", "ausente"),
        temaD("respirador_no_compatible_polvo", "Respirador no compatible con polvo", "Actividad de lijado con polvo fino se realiza sin proteccion respiratoria adecuada", ["respirador", "polvo"], "perforacion_polvo", "proteccion respiratoria", "incompatible"),
        temaD("ventilacion_lijado_deficiente", "Ventilacion deficiente durante lijado", "Lijado interior acumula polvo suspendido por falta de ventilacion o renovacion", ["ventilacion", "lijado"], "ventilacion_deficiente", "recinto lijado", "ventilacion insuficiente"),
        temaD("limpieza_polvo_insuficiente", "Limpieza de polvo insuficiente", "Polvo de empaste o lijado queda acumulado en piso, equipos o rutas de paso", ["limpieza", "polvo"], "caida_mismo_nivel", "polvo acumulado", "sin limpieza"),
        temaD("residuo_fino_sin_retiro", "Residuo fino sin retiro controlado", "Restos de masilla, lija o polvo fino se mantienen sin bolsa o retiro definido", ["residuo", "masilla"], "caida_mismo_nivel", "residuo fino", "sin retiro"),
        temaD("postura_sobre_cabeza_lijado", "Lijado sobre cabeza con postura forzada", "Trabajador lija cielo o parte alta con brazos elevados durante tiempo prolongado", ["cielo", "postura"], "postura_forzada", "lijado sobre cabeza", "postura forzada"),
        temaD("movimiento_repetitivo_lijado", "Movimiento repetitivo en lijado manual", "Lijado manual prolongado exige movimiento repetitivo sin pausas o rotacion", ["repetitivo", "manual"], "postura_forzada", "lijado manual", "repetitivo"),
        temaD("escalera_lijado_inestable", "Escalera inestable para lijado", "Lijado en altura se realiza desde escalera mal posicionada o con alcance lateral", ["escalera", "lijado"], "caida_distinto_nivel", "escalera de lijado", "inestable", "alto"),
        temaD("plataforma_lijado_sin_orden", "Plataforma de lijado con desorden", "Plataforma usada para lijado mantiene polvo, herramientas o tarros sueltos", ["plataforma", "lijado"], "caida_distinto_nivel", "plataforma de lijado", "desordenada"),
        temaD("caida_herramientas_lijado", "Caida de herramientas de lijado", "Lijadora, espatula o bandeja queda sin contencion en altura", ["herramientas", "lijado"], "caida_objetos", "herramientas de lijado", "sin contencion"),
        temaD("ruido_lijadora", "Ruido por lijadora electrica", "Lijadora o herramienta mecanica genera ruido sin proteccion auditiva ni aviso", ["ruido", "lijadora"], "ruido_vibracion", "lijadora electrica", "ruido no controlado"),
        temaD("vibracion_lijadora", "Vibracion por herramienta de lijado", "Uso continuo de lijadora transmite vibracion sin pausas ni control de exposicion", ["vibracion", "lijadora"], "ruido_vibracion", "lijadora", "vibracion sostenida"),
        temaD("masilla_sin_hds", "Masilla o producto sin HDS/SDS", "Masilla, pasta o sellador usado en preparacion no tiene ficha o rotulacion disponible", ["masilla", "hds"], "vapores_quimicos", "producto de empaste", "sin HDS/SDS"),
        temaD("contacto_dermico_masilla", "Contacto dermico con masilla", "Trabajador manipula pasta, masilla o imprimante sin guantes compatibles", ["dermico", "masilla"], "vapores_quimicos", "masilla o pasta", "contacto dermico"),
        temaD("salpicadura_imprimante", "Salpicadura de imprimante", "Aplicacion de imprimante o promotor genera salpicadura sin proteccion ocular", ["imprimante", "salpicadura"], "vapores_quimicos", "imprimante", "riesgo ocular"),
        temaD("envase_masilla_abierto", "Envase de masilla abierto", "Envase de pasta, imprimante o aditivo queda abierto en ruta de paso", ["envase", "masilla"], "caida_mismo_nivel", "envase de masilla", "abierto en ruta"),
        temaD("superficie_preparada_sin_senalizar", "Superficie preparada sin senalizacion", "Sector recien empastado o imprimado queda habilitado al transito sin aviso", ["superficie", "senalizacion"], "segregacion_senalizacion", "superficie preparada", "sin aviso"),
        temaD("interferencia_otros_trabajos_lijado", "Lijado con otras cuadrillas expuestas", "Polvo de lijado alcanza a otras cuadrillas que trabajan o transitan en el area", ["cuadrillas", "polvo"], "segregacion_senalizacion", "area de lijado", "terceros expuestos"),
        temaD("trabajo_cerca_equipo_sensible", "Polvo cerca de equipo o terminacion", "Lijado se ejecuta junto a equipos, vidrios o terminaciones sin proteccion", ["equipo", "terminacion"], "dano_material", "equipo o terminacion", "expuesto a polvo"),
        temaD("aspiradora_sin_mantencion", "Aspiradora o extractor sin mantencion", "Extractor, aspiradora o filtro usado para polvo no evidencia condicion o mantencion", ["aspiradora", "filtro"], "mantencion_certificacion", "equipo de extraccion", "sin mantencion"),
        temaD("extension_en_polvo", "Extension electrica cubierta de polvo", "Extension o enchufe de herramienta queda cubierto por polvo fino de lijado", ["extension", "polvo"], "sobrecarga_humedad", "extension electrica", "cubierta de polvo"),
        temaD("lija_deteriorada", "Lija o accesorio deteriorado", "Disco, banda o hoja de lija se usa roto, saturado o mal fijado", ["lija", "disco"], "herramienta_electrica", "accesorio de lijado", "deteriorado"),
        temaD("borde_espatula_cortante", "Espatula o raspador cortante", "Raspador, espatula o cuchilla de preparacion queda expuesta o sin proteccion", ["espatula", "raspador"], "corte_borde", "herramienta manual", "borde expuesto"),
        temaD("mezcla_pasta_sin_control", "Mezcla de pasta sin control", "Preparacion de pasta genera salpicadura, polvo o derrame sin recipiente estable", ["mezcla", "pasta"], "vapores_quimicos", "mezcla de pasta", "sin control"),
        temaD("iluminacion_deficiente_lijado", "Iluminacion deficiente en preparacion", "Sector de empaste o lijado tiene sombras que dificultan observar desniveles o residuos", ["iluminacion", "empaste"], "segregacion_senalizacion", "area de preparacion", "baja visibilidad"),
        temaD("cierre_sin_limpieza_final", "Cierre de lijado sin limpieza final", "Area queda habilitada sin retirar polvo, residuos, cables o herramientas de preparacion", ["cierre", "limpieza"], "caida_mismo_nivel", "area de lijado", "sin limpieza final"),
        temaD("matriz_no_cubre_polvo", "Matriz no cubre exposicion a polvo", "Lijado mecanico o masivo no esta considerado en matriz o analisis preventivo vigente", ["matriz", "polvo"], "matriz_no_cubre", "exposicion a polvo", "no evaluada"),
      ],
    },
    {
      id: "sellos_silicona_impermeabilizacion_juntas",
      nombreVisible: "Sellos, silicona, impermeabilizacion y juntas",
      descripcionActividad:
        "Aplicacion, retiro, corte, limpieza y terminacion de sellos, siliconas, membranas, impermeabilizantes, juntas y productos asociados.",
      etapaObra: "Terminaciones, sellos e impermeabilizacion",
      contextoTecnico: "durante sellos, silicona, impermeabilizacion, juntas, membranas y aplicacion de productos quimicos en terminaciones",
      palabrasClaveActividad: ["sello", "silicona", "impermeabilizacion", "junta", "membrana", "sellante"],
      familiasPreventivasRelacionadas: ["sustancias_hds", "medio_ambiente", "trabajos_criticos", "herramientas_equipos"],
      desviacionesFrecuentes: ["condicion_insegura", "omision_documental", "evento_ambiental"],
      documentosFrecuentesAplicables: documentosTerminacionesQuimicos,
      documentosQueNoAplicanPorDefecto: documentosNoTerminacionSimple,
      preguntasEstrategicasSugeridas: [
        "El sello, silicona o impermeabilizante cuenta con HDS/SDS y rotulacion?",
        "La aplicacion genera vapores, contacto dermico, inflamabilidad o derrames?",
        "La tarea se ejecuta en borde, cubierta, bano, shaft o zona con ventilacion limitada?",
        "La herramienta de corte, pistola o espatula esta en buen estado?",
        "La condicion requiere ventilar, contener, retirar residuo, segregar o detener la aplicacion?",
      ],
      erroresQueDebeEvitarElMotor: ["No pedir PTS para un sello menor corregible, pero no omitir HDS/SDS, ventilacion o altura cuando aplica."],
      bibliotecasSecundariasRelacionadas: ["higiene_ocupacional", "senalizacion_segregacion", "dano_material"],
      definicionesRiesgo: [
        temaD("silicona_sin_hds", "Silicona o sellante sin HDS/SDS", "Sellante, silicona o impermeabilizante se aplica sin ficha ni rotulacion disponible", ["silicona", "hds"], "vapores_quimicos", "sellante", "sin HDS/SDS"),
        temaD("vapores_sellante_sin_ventilacion", "Vapores de sellante sin ventilacion", "Aplicacion de sellos o membrana ocurre en recinto con ventilacion insuficiente", ["vapores", "sellante"], "ventilacion_deficiente", "recinto con sellante", "ventilacion deficiente"),
        temaD("contacto_dermico_silicone", "Contacto dermico con sellante", "Trabajador manipula silicona, primer o impermeabilizante sin guantes compatibles", ["dermico", "sellante"], "vapores_quimicos", "producto sellante", "contacto dermico"),
        temaD("salpicadura_impermeabilizante", "Salpicadura de impermeabilizante", "Aplicacion con rodillo, brocha o pistola expone ojos a salpicadura", ["salpicadura", "impermeabilizante"], "vapores_quimicos", "impermeabilizante", "riesgo ocular"),
        temaD("producto_inflamable_sello", "Producto inflamable en sellos", "Primer, solvente o impermeabilizante inflamable se usa cerca de fuente de ignicion", ["inflamable", "primer"], "gas_combustible", "producto inflamable", "cerca de ignicion", "alto"),
        temaD("envase_sellante_sin_rotulo", "Envase de sellante sin rotulo", "Producto trasvasijado para sello no identifica composicion, peligro o uso", ["envase", "rotulo"], "rotulacion_identificacion", "envase de sellante", "sin rotulo"),
        temaD("derrame_impermeabilizante", "Derrame de impermeabilizante", "Producto liquido queda en piso o cubierta sin contencion ni limpieza inmediata", ["derrame", "impermeabilizante"], "vapores_quimicos", "derrame de impermeabilizante", "sin contencion"),
        temaD("residuo_sellante_sin_retiro", "Residuo de sellante sin retiro", "Boquillas, cartuchos, trapos o restos de membrana quedan sin segregacion", ["residuo", "sellante"], "vapores_quimicos", "residuo de sellante", "sin retiro"),
        temaD("cuchillo_cartonero_sello", "Corte con cuchillo cartonero en sellos", "Corte de boquilla, junta o membrana se realiza con cuchillo sin control de manos", ["cuchillo", "cartonero"], "corte_borde", "cuchillo cartonero", "uso sin control"),
        temaD("espatula_cortante_sello", "Espatula o raspador expuesto", "Retiro de sello viejo usa espatula, raspador o cuchilla con borde expuesto", ["espatula", "sello"], "corte_borde", "raspador de sello", "borde expuesto"),
        temaD("trabajo_borde_impermeabilizacion", "Impermeabilizacion junto a borde", "Sellado o membrana se aplica en borde, cubierta o balcon sin control de caida", ["borde", "impermeabilizacion"], "caida_distinto_nivel", "borde impermeabilizado", "sin control", "alto"),
        temaD("escalera_sello_altura", "Sello desde escalera sin estabilidad", "Junta alta o ventana se sella desde escalera con alcance lateral excesivo", ["escalera", "sello"], "caida_distinto_nivel", "escalera para sello", "inestable"),
        temaD("caida_cartucho_altura", "Caida de cartuchos o herramientas", "Cartuchos, pistola, espatula o cuchilla quedan sin contencion sobre altura", ["cartucho", "altura"], "caida_objetos", "herramientas de sello", "sin contencion"),
        temaD("area_sello_sin_senalizar", "Area con sello fresco sin senalizar", "Junta, piso o muro recien sellado queda habilitado al transito sin aviso", ["sello fresco", "senalizacion"], "segregacion_senalizacion", "area sellada", "sin aviso"),
        temaD("superficie_resbaladiza_membrana", "Superficie resbaladiza por membrana", "Membrana, primer o impermeabilizante deja piso o cubierta resbaladiza", ["membrana", "resbaladiza"], "caida_mismo_nivel", "superficie con membrana", "resbaladiza"),
        temaD("trapos_contaminados_sello", "Trapos contaminados con sellante", "Trapos con solvente, primer o impermeabilizante quedan acumulados sin segregacion", ["trapos", "primer"], "gas_combustible", "trapos contaminados", "sin segregacion"),
        temaD("mezcla_impermeabilizante_sin_control", "Mezcla de impermeabilizante sin control", "Producto bicomponente o aditivo se mezcla sin proporcion, ventilacion o recipiente estable", ["mezcla", "bicomponente"], "vapores_quimicos", "mezcla impermeabilizante", "sin control"),
        temaD("producto_incompatible_junta", "Producto incompatible en junta", "Sellante o membrana se aplica sobre superficie incompatible o contaminada", ["junta", "incompatible"], "dano_material", "junta de terminacion", "producto incompatible"),
        temaD("sello_sin_curado", "Sello liberado sin curado", "Area se libera a uso, agua o transito antes de completar curado del sellante", ["curado", "sello"], "dano_material", "sello aplicado", "sin curado"),
        temaD("filtracion_por_sello_deficiente", "Filtracion por sello deficiente", "Junta o impermeabilizacion defectuosa permite ingreso de agua a terminaciones", ["filtracion", "junta"], "fuga_fluidos", "junta sellada", "filtracion"),
        temaD("membrana_sin_proteccion_mecanica", "Membrana sin proteccion mecanica", "Membrana recien instalada queda expuesta a punzonamiento, transito o herramientas", ["membrana", "proteccion"], "dano_material", "membrana", "sin proteccion"),
        temaD("trabajos_simultaneos_sello", "Trabajos simultaneos sobre sello", "Otras cuadrillas intervienen el area mientras se aplica o cura el sellante", ["simultaneo", "sello"], "segregacion_senalizacion", "area de sello", "sin coordinacion"),
        temaD("pistola_silicona_danada", "Pistola de silicona danada", "Pistola, boquilla o aplicador presenta dano, fuga o control deficiente", ["pistola", "silicona"], "herramienta_electrica", "pistola de silicona", "danada"),
        temaD("herramienta_calor_membrana", "Herramienta de calor sin control", "Aplicacion de membrana usa calor, soplete o equipo caliente sin segregacion", ["calor", "membrana"], "gas_combustible", "herramienta de calor", "sin control", "alto"),
        temaD("ventilacion_bano_sello", "Sellado en bano sin ventilacion", "Sellos o siliconas se aplican en bano o recinto cerrado sin renovacion", ["bano", "silicona"], "ventilacion_deficiente", "bano sellado", "ventilacion insuficiente"),
        temaD("orden_cartuchos_sellos", "Cartuchos y residuos obstruyen paso", "Cartuchos, boquillas, cintas o envases quedan en zona de circulacion", ["cartuchos", "paso"], "caida_mismo_nivel", "residuos de sellos", "obstruyen paso"),
        temaD("matriz_no_cubre_quimico_sello", "Matriz no cubre producto de sellado", "Uso de producto quimico, calor o impermeabilizante no esta en analisis vigente", ["matriz", "quimico"], "matriz_no_cubre", "producto de sellado", "no evaluado"),
        temaD("autorizacion_cubierta_sello", "Impermeabilizacion sin autorizacion en cubierta", "Trabajo en cubierta o borde se ejecuta sin responsable o autorizacion requerida", ["cubierta", "autorizacion"], "autorizacion_documental", "trabajo en cubierta", "sin autorizacion", "alto"),
        temaD("epp_incompatible_sello", "EPP incompatible para sellantes", "Trabajador aplica producto quimico sin guantes, lentes o respirador compatible", ["epp", "sellante"], "vapores_quimicos", "EPP de sellos", "incompatible"),
        temaD("proteccion_terminacion_insuficiente", "Proteccion de terminacion insuficiente", "Sellante o impermeabilizante puede manchar vidrio, piso, marco o revestimiento", ["proteccion", "terminacion"], "dano_material", "terminacion cercana", "sin proteccion"),
        temaD("limpieza_solvente_junta", "Limpieza de junta con solvente", "Junta se limpia con solvente sin ventilacion, guantes ni control de residuos", ["limpieza", "solvente"], "vapores_quimicos", "limpieza de junta", "sin control"),
        temaD("residuo_membrana_cortante", "Recortes de membrana con borde expuesto", "Recortes, flejes o laminas de impermeabilizacion quedan con bordes o puntas expuestas", ["recortes", "membrana"], "corte_borde", "residuo de membrana", "borde expuesto"),
      ],
    },
    {
      id: "pisos_ceramicas_revestimientos_porcelanato",
      nombreVisible: "Pisos, ceramicas, revestimientos y porcelanato",
      descripcionActividad:
        "Instalacion, corte, nivelacion, pegado, frague, limpieza y reparacion de pisos, ceramicas, porcelanatos, revestimientos y piezas asociadas.",
      etapaObra: "Terminaciones de pisos y revestimientos",
      contextoTecnico: "durante instalacion de pisos, ceramicas, revestimientos, porcelanato, adhesivos, frague, cortes y limpieza final",
      palabrasClaveActividad: ["piso", "ceramica", "revestimiento", "porcelanato", "adhesivo", "frague"],
      familiasPreventivasRelacionadas: ["herramientas_equipos", "higiene_ocupacional", "ergonomia_manejo_manual", "orden_aseo_housekeeping"],
      desviacionesFrecuentes: ["condicion_insegura", "uso_inadecuado_herramienta_equipo_maquinaria", "dano_material"],
      documentosFrecuentesAplicables: ["Matriz de riesgos vigente", "AST/ART si hay corte con herramienta critica", "HDS/SDS si hay adhesivos o fragues quimicos"],
      documentosQueNoAplicanPorDefecto: documentosNoTerminacionSimple,
      preguntasEstrategicasSugeridas: [
        "La instalacion requiere corte de ceramica, porcelanato o revestimiento con proyeccion y polvo?",
        "Se usan adhesivos, fragues o productos con HDS/SDS y ventilacion necesaria?",
        "El area mantiene orden, segregacion y control de transito sobre superficie fresca?",
        "Existe manipulacion manual de cajas, piezas grandes o posturas forzadas?",
        "La condicion requiere limpiar, retirar piezas, segregar, reparar o detener el corte?",
      ],
      erroresQueDebeEvitarElMotor: ["No sobredocumentar una pieza menor suelta, pero no omitir polvo, corte, frague, adhesivos o superficie resbaladiza."],
      bibliotecasSecundariasRelacionadas: ["epp", "senalizacion_segregacion", "dano_material"],
      definicionesRiesgo: [
        temaD("corte_ceramica_sin_control", "Corte de ceramica sin control", "Cortadora o esmeril proyecta particulas al cortar ceramica, piso o porcelanato", ["corte", "ceramica"], "perforacion_polvo", "corte de ceramica", "sin control"),
        temaD("polvo_silice_porcelanato", "Polvo de silice por corte de porcelanato", "Corte seco de porcelanato o revestimiento genera polvo mineral sin humectacion", ["polvo", "porcelanato"], "perforacion_polvo", "corte de porcelanato", "polvo sin control"),
        temaD("proyeccion_fragmentos_piso", "Proyeccion de fragmentos de revestimiento", "Pieza de ceramica o revestimiento se fractura y proyecta fragmentos", ["fragmentos", "revestimiento"], "perforacion_polvo", "fragmentos de revestimiento", "proyeccion"),
        temaD("cortadora_defectuosa", "Cortadora de ceramica defectuosa", "Cortadora, disco, guia o cable presenta dano o accesorio incompatible", ["cortadora", "disco"], "herramienta_electrica", "cortadora de ceramica", "defectuosa"),
        temaD("disco_inadecuado_porcelanato", "Disco inadecuado para porcelanato", "Disco de corte no corresponde al material, velocidad o herramienta utilizada", ["disco", "porcelanato"], "herramienta_electrica", "disco de corte", "inadecuado"),
        temaD("bordes_ceramica_filoso", "Borde filoso de ceramica cortada", "Pieza cortada mantiene borde filoso o astilla expuesta al manipularla", ["borde", "ceramica"], "corte_borde", "ceramica cortada", "borde filoso"),
        temaD("cuchillo_frague", "Corte con herramienta manual en frague", "Retiro o apertura de bolsa se realiza con cuchillo o cartonero sin control", ["cuchillo", "frague"], "corte_borde", "herramienta manual", "uso sin control"),
        temaD("adhesivo_sin_hds", "Adhesivo de revestimiento sin HDS/SDS", "Adhesivo, frague o imprimante se usa sin ficha o rotulacion disponible", ["adhesivo", "hds"], "vapores_quimicos", "adhesivo de piso", "sin HDS/SDS"),
        temaD("contacto_dermico_adhesivo", "Contacto dermico con adhesivo", "Trabajador manipula adhesivo, frague o lechada sin guantes compatibles", ["dermico", "adhesivo"], "vapores_quimicos", "adhesivo o frague", "contacto dermico"),
        temaD("salpicadura_frague", "Salpicadura de frague o adhesivo", "Mezcla o aplicacion de frague expone ojos a salpicadura alcalina", ["salpicadura", "frague"], "vapores_quimicos", "frague o adhesivo", "riesgo ocular"),
        temaD("mezcla_adhesivo_polvo", "Mezcla de adhesivo con polvo", "Preparacion de adhesivo en polvo genera nube sin respirador ni ventilacion", ["mezcla", "polvo"], "perforacion_polvo", "mezcla de adhesivo", "polvo suspendido"),
        temaD("piso_fresco_sin_senalizar", "Piso fresco sin senalizacion", "Area con adhesivo, frague o revestimiento recien instalado queda abierta al transito", ["piso fresco", "senalizacion"], "segregacion_senalizacion", "piso fresco", "sin senalizacion"),
        temaD("superficie_resbaladiza_frague", "Superficie resbaladiza por frague", "Lechada, agua o adhesivo deja superficie resbaladiza en ruta de paso", ["resbaladiza", "frague"], "caida_mismo_nivel", "superficie de piso", "resbaladiza"),
        temaD("cajas_ceramica_en_transito", "Cajas de ceramica obstruyen transito", "Cajas, piezas o separadores quedan en ruta de circulacion o acceso", ["cajas", "transito"], "caida_mismo_nivel", "cajas de ceramica", "obstruyen paso"),
        temaD("acopio_piezas_inestable", "Acopio de piezas inestable", "Ceramicas, porcelanatos o revestimientos se apilan sin estabilidad ni proteccion", ["acopio", "piezas"], "dano_material", "acopio de ceramicas", "inestable"),
        temaD("manipulacion_cajas_pesadas", "Manipulacion de cajas pesadas", "Cajas de porcelanato o revestimiento se trasladan manualmente sin apoyo suficiente", ["cajas", "peso"], "manipulacion_manual", "cajas de revestimiento", "manejo manual exigente"),
        temaD("postura_arrodillada_prolongada", "Postura arrodillada prolongada", "Instalacion de piso exige postura arrodillada sostenida sin pausa o apoyo", ["arrodillada", "piso"], "postura_forzada", "postura de instalacion", "forzada"),
        temaD("movimiento_repetitivo_revestimiento", "Movimiento repetitivo en revestimiento", "Aplicacion de adhesivo o colocacion de piezas se repite sin rotacion ni pausas", ["repetitivo", "revestimiento"], "postura_forzada", "colocacion de piezas", "repetitiva"),
        temaD("ruido_corte_ceramica", "Ruido por corte de ceramica", "Corte de revestimiento genera ruido sin proteccion auditiva ni segregacion", ["ruido", "corte"], "ruido_vibracion", "corte de ceramica", "ruido no controlado"),
        temaD("vibracion_esmeril_piso", "Vibracion por esmeril en piso", "Esmeril o cortadora transmite vibracion sostenida sin pausas o control", ["vibracion", "esmeril"], "ruido_vibracion", "herramienta de corte", "vibracion sostenida"),
        temaD("herramienta_electrica_agua", "Herramienta electrica cerca de agua", "Cortadora o esmeril se usa con agua o lechada cerca de extension electrica", ["agua", "herramienta"], "sobrecarga_humedad", "herramienta electrica", "cercana a agua", "alto"),
        temaD("extension_corte_piso", "Extension cruza zona de corte", "Cable de cortadora cruza zona con polvo, agua, piezas o transito", ["extension", "corte"], "caida_mismo_nivel", "extension de cortadora", "cruza area"),
        temaD("fragmentos_sin_retiro", "Fragmentos de ceramica sin retiro", "Recortes y fragmentos filosos permanecen en el area de instalacion", ["fragmentos", "retiro"], "corte_borde", "fragmentos de ceramica", "sin retiro"),
        temaD("residuo_adhesivo_sin_manejo", "Residuo de adhesivo sin manejo", "Restos de adhesivo, frague o agua de lavado quedan sin contencion", ["residuo", "adhesivo"], "vapores_quimicos", "residuo de adhesivo", "sin manejo"),
        temaD("dano_revestimiento_suelto", "Revestimiento suelto con potencial de caida", "Pieza de muro o piso queda suelta, mal adherida o con borde levantado", ["suelto", "revestimiento"], "dano_material", "pieza de revestimiento", "suelta"),
        temaD("pieza_rota_expuesta", "Pieza rota expuesta", "Ceramica o porcelanato trizado queda instalado o disponible con arista cortante", ["rota", "ceramica"], "corte_borde", "pieza trizada", "arista expuesta"),
        temaD("zona_corte_sin_barrera", "Zona de corte sin barrera", "Corte de piezas se ejecuta junto a circulacion sin pantalla ni segregacion", ["zona de corte", "barrera"], "segregacion_senalizacion", "area de corte", "sin barrera"),
        temaD("limpieza_acida_sin_hds", "Limpieza quimica sin HDS/SDS", "Producto de limpieza para revestimiento se usa sin ficha, guantes ni ventilacion", ["limpieza", "hds"], "vapores_quimicos", "limpiador de revestimiento", "sin HDS/SDS"),
        temaD("matriz_no_cubre_corte", "Matriz no cubre corte de revestimiento", "Corte masivo con polvo, ruido o herramienta electrica no esta en analisis vigente", ["matriz", "corte"], "matriz_no_cubre", "corte de revestimiento", "no evaluado"),
        temaD("area_lavado_sin_drenaje", "Lavado de herramientas sin drenaje", "Lavado de baldes o herramientas deja agua con adhesivo en piso o drenaje", ["lavado", "drenaje"], "fuga_fluidos", "agua de lavado", "sin drenaje"),
        temaD("iluminacion_colocacion_deficiente", "Iluminacion deficiente en colocacion", "Zona de piso o muro tiene sombras que ocultan desniveles, cortes o residuos", ["iluminacion", "piso"], "segregacion_senalizacion", "zona de revestimiento", "baja visibilidad"),
        temaD("entrega_sin_orden_final", "Entrega de revestimiento sin orden final", "Area queda habilitada sin retirar crucetas, recortes, polvo, cajas o herramientas", ["entrega", "orden"], "caida_mismo_nivel", "area de revestimiento", "sin orden final"),
      ],
    },
    {
      id: "puertas_ventanas_marcos_quincalleria",
      nombreVisible: "Puertas, ventanas, marcos y quincalleria",
      descripcionActividad:
        "Montaje, ajuste, fijacion, perforacion, sellado y regulacion de puertas, ventanas, marcos, bisagras, cerraduras, quincalleria y accesorios.",
      etapaObra: "Terminaciones de carpinteria, vanos y quincalleria",
      contextoTecnico: "durante instalacion de puertas, ventanas, marcos, cerraduras, bisagras, quincalleria, fijaciones y sellos de vanos",
      palabrasClaveActividad: ["puerta", "ventana", "marco", "quincalleria", "bisagra", "cerradura"],
      familiasPreventivasRelacionadas: ["herramientas_equipos", "ergonomia_manejo_manual", "dano_material", "seguridad_trabajadores"],
      desviacionesFrecuentes: ["condicion_insegura", "uso_inadecuado_herramienta_equipo_maquinaria", "dano_material"],
      documentosFrecuentesAplicables: ["Matriz de riesgos vigente", "AST/ART si hay vidrio, altura o elemento pesado", "HDS/SDS si hay sellantes"],
      documentosQueNoAplicanPorDefecto: documentosNoTerminacionSimple,
      preguntasEstrategicasSugeridas: [
        "La puerta, ventana o marco implica vidrio, elemento pesado, borde filoso o atrapamiento?",
        "La instalacion requiere taladro, fijaciones, sellos o trabajo en altura?",
        "Existe riesgo de caida de hoja, marco, herramienta o accesorio sobre terceros?",
        "La quincalleria, bisagra o cerradura quedo verificada antes de liberar el uso?",
        "La condicion requiere ajustar, segregar, retirar, reparar o detener la instalacion?",
      ],
      erroresQueDebeEvitarElMotor: ["No tratar una ventana o puerta como simple dano material si hay vidrio, peso, atrapamiento, altura o herramienta electrica."],
      bibliotecasSecundariasRelacionadas: ["dano_material", "senalizacion_segregacion", "epp"],
      definicionesRiesgo: [
        temaD("atrapamiento_dedos_puerta", "Atrapamiento de dedos en puerta", "Hoja de puerta se ajusta o prueba sin controlar bisagra, cierre o punto de atrapamiento", ["puerta", "atrapamiento"], "dano_material", "hoja de puerta", "punto de atrapamiento"),
        temaD("hoja_puerta_pesada", "Hoja de puerta pesada manipulada manualmente", "Puerta pesada se traslada o instala sin apoyo, ayuda o ruta despejada", ["puerta", "peso"], "manipulacion_manual", "hoja de puerta", "manejo manual exigente"),
        temaD("marco_sin_fijacion", "Marco sin fijacion definitiva", "Marco de puerta o ventana queda presentado sin anclaje suficiente antes de liberar", ["marco", "fijacion"], "dano_material", "marco", "sin fijacion"),
        temaD("ventana_sin_sujecion_temporal", "Ventana sin sujecion temporal", "Ventana o marco queda apoyado sin cunas, puntales o control contra vuelco", ["ventana", "sujecion"], "caida_objetos", "ventana presentada", "sin sujecion", "alto"),
        temaD("vidrio_en_ventana_expuesto", "Vidrio de ventana expuesto", "Ventana con vidrio queda en montaje sin proteccion de borde ni segregacion", ["vidrio", "ventana"], "corte_borde", "vidrio de ventana", "borde expuesto", "alto"),
        temaD("perfil_marco_filoso", "Perfil de marco con borde filoso", "Marco, perfil o aluminio presenta rebaba o canto cortante al manipular", ["perfil", "marco"], "corte_borde", "perfil de marco", "borde filoso"),
        temaD("taladro_marco_sin_control", "Taladro en marco sin control", "Perforacion para marco o cerradura genera particulas sin proteccion ocular", ["taladro", "marco"], "perforacion_polvo", "perforacion de marco", "particulas sin control"),
        temaD("herramienta_quincalleria_danada", "Herramienta de quincalleria danada", "Taladro, atornillador o broca usada en quincalleria presenta dano o accesorio incorrecto", ["herramienta", "quincalleria"], "herramienta_electrica", "herramienta de quincalleria", "defectuosa"),
        temaD("broca_cerradura_incompatible", "Broca incompatible para cerradura", "Broca copa, formon o accesorio no corresponde a puerta, marco o cerradura", ["broca", "cerradura"], "herramienta_electrica", "broca de cerradura", "incompatible"),
        temaD("corte_formon_sin_control", "Corte con formon sin control", "Formon, cuchillo o herramienta manual se usa cerca de manos sin sujecion", ["formon", "corte"], "corte_borde", "formon o cuchillo", "uso sin control"),
        temaD("caida_cerradura_accesorios", "Caida de cerradura o accesorios", "Cerradura, bisagra, manilla o tornillos quedan sueltos sobre altura o escalera", ["cerradura", "bisagra"], "caida_objetos", "accesorios de quincalleria", "sueltos"),
        temaD("escalera_instalacion_ventana", "Escalera inestable al instalar ventana", "Instalacion de ventana alta se ejecuta desde escalera sin estabilidad ni apoyo", ["escalera", "ventana"], "caida_distinto_nivel", "escalera para ventana", "inestable", "alto"),
        temaD("trabajo_borde_ventana", "Trabajo junto a vano de ventana", "Ajuste de ventana se realiza junto a vano o borde abierto sin control", ["vano", "ventana"], "caida_distinto_nivel", "vano de ventana", "sin control", "alto"),
        temaD("zona_inferior_ventana", "Zona inferior abierta bajo ventana", "Personas circulan bajo el punto donde se instala marco, vidrio o herramienta", ["zona inferior", "ventana"], "segregacion_senalizacion", "area bajo ventana", "sin cierre"),
        temaD("sellante_marco_sin_hds", "Sellante de marco sin HDS/SDS", "Silicona, espuma o adhesivo de marco se usa sin ficha ni rotulacion", ["sellante", "marco"], "vapores_quimicos", "sellante de marco", "sin HDS/SDS"),
        temaD("ventilacion_sello_marco", "Ventilacion deficiente al sellar marco", "Sellante o espuma se aplica en recinto cerrado sin renovacion de aire", ["ventilacion", "sello"], "ventilacion_deficiente", "recinto con marco", "ventilacion deficiente"),
        temaD("residuo_quincalleria_piso", "Residuos de quincalleria en piso", "Tornillos, tarugos, recortes o embalajes quedan en ruta de paso", ["tornillos", "piso"], "caida_mismo_nivel", "residuos de quincalleria", "en ruta"),
        temaD("marco_obstruye_transito", "Marco o puerta obstruye transito", "Elemento apoyado en pasillo o acceso reduce circulacion segura", ["marco", "transito"], "caida_mismo_nivel", "marco acopiado", "obstruye paso"),
        temaD("acopio_puertas_inestable", "Acopio de puertas inestable", "Puertas, marcos o ventanas se acopian verticalmente sin amarre o separador", ["acopio", "puertas"], "dano_material", "acopio de puertas", "inestable"),
        temaD("postura_ajuste_cerradura", "Postura forzada al ajustar cerradura", "Ajuste de cerradura o bisagra exige torsion, rodillas o brazos elevados", ["postura", "cerradura"], "postura_forzada", "ajuste de cerradura", "postura forzada"),
        temaD("movimiento_repetitivo_tornillos", "Movimiento repetitivo de atornillado", "Fijacion de quincalleria exige atornillado repetitivo sin pausas ni rotacion", ["atornillado", "repetitivo"], "postura_forzada", "atornillado de quincalleria", "repetitivo"),
        temaD("ruido_taladro_marco", "Ruido por taladro en marco", "Perforacion de marco o muro para quincalleria genera ruido sin proteccion", ["ruido", "taladro"], "ruido_vibracion", "taladro en marco", "ruido no controlado"),
        temaD("vibracion_taladro_puerta", "Vibracion por taladro en puerta", "Uso prolongado de taladro o atornillador genera vibracion sin control", ["vibracion", "taladro"], "ruido_vibracion", "taladro de puerta", "vibracion sostenida"),
        temaD("marco_dana_terminacion", "Marco dana terminacion existente", "Instalacion de marco o ventana afecta muro, pintura, piso o revestimiento cercano", ["terminacion", "marco"], "dano_material", "terminacion cercana", "expuesta a dano"),
        temaD("puerta_sin_tope", "Puerta sin tope o control de cierre", "Hoja instalada queda sin tope, freno o control contra golpe repentino", ["tope", "puerta"], "dano_material", "puerta instalada", "sin control de cierre"),
        temaD("quincalleria_suelta", "Quincalleria suelta o incompleta", "Bisagra, chapa, manilla o cierre queda suelto, incompleto o sin prueba funcional", ["quincalleria", "suelta"], "mantencion_certificacion", "quincalleria", "suelta"),
        temaD("ventana_sin_prueba_funcional", "Ventana sin prueba funcional", "Ventana queda instalada sin verificar apertura, cierre, anclaje o sello", ["ventana", "prueba"], "mantencion_certificacion", "ventana instalada", "sin prueba"),
        temaD("matriz_no_cubre_vidrio_puerta", "Matriz no cubre vidrio o elemento pesado", "Instalacion incluye vidrio, puerta pesada o vano sin analisis preventivo actualizado", ["matriz", "vidrio"], "matriz_no_cubre", "instalacion de ventana", "no evaluada"),
        temaD("trabajo_sin_autorizacion_vano", "Trabajo en vano sin autorizacion", "Intervencion en vano, fachada o altura se ejecuta sin responsable autorizado", ["autorizacion", "vano"], "autorizacion_documental", "trabajo en vano", "sin autorizacion"),
        temaD("guantes_anticorte_no_usados", "Guantes anticorte no usados", "Manipulacion de perfil, vidrio o quincalleria cortante se realiza sin guantes compatibles", ["guantes", "anticorte"], "corte_borde", "EPP anticorte", "no usado"),
        temaD("embalaje_ventanas_sin_retiro", "Embalaje de ventanas sin retiro", "Carton, plastico, esquineros o flejes quedan en ruta de circulacion", ["embalaje", "ventanas"], "caida_mismo_nivel", "embalaje de ventanas", "sin retiro"),
        temaD("entrega_puerta_sin_revision", "Entrega de puerta sin revision", "Puerta, ventana o quincalleria se entrega sin revisar fijacion, borde, cierre o limpieza", ["entrega", "revision"], "dano_material", "puerta o ventana", "sin revision final"),
      ],
    },
    {
      id: "vidrios_espejos_paneles_fragiles",
      nombreVisible: "Vidrios, espejos y paneles fragiles",
      descripcionActividad:
        "Transporte interno, acopio, manipulacion, instalacion, retiro, limpieza y proteccion de vidrios, espejos, mamparas, paneles fragiles y piezas quebradizas.",
      etapaObra: "Terminaciones fragiles y elementos vidriados",
      contextoTecnico: "durante manipulacion, acopio, transporte e instalacion de vidrios, espejos, mamparas y paneles fragiles",
      palabrasClaveActividad: ["vidrio", "espejo", "panel", "fragil", "mampara", "borde"],
      familiasPreventivasRelacionadas: ["seguridad_trabajadores", "ergonomia_manejo_manual", "senalizacion_segregacion", "dano_material"],
      desviacionesFrecuentes: ["condicion_insegura", "control_critico_ausente_no_verificado", "dano_material"],
      documentosFrecuentesAplicables: ["AST/ART si hay vidrio pesado o instalacion en altura", "Matriz de riesgos vigente"],
      documentosQueNoAplicanPorDefecto: ["HDS/SDS si no hay productos quimicos", "PTS si solo corresponde retiro de fragmento menor controlado"],
      preguntasEstrategicasSugeridas: [
        "El vidrio, espejo o panel es pesado, fragil, cortante o requiere transporte especial?",
        "Los bordes estan protegidos y el acopio evita vuelco o rotura?",
        "Existe segregacion del area para terceros durante traslado o instalacion?",
        "Se usan guantes anticorte, proteccion ocular y apoyo suficiente?",
        "La condicion requiere retirar, contener, reemplazar, segregar o detener la manipulacion?",
      ],
      erroresQueDebeEvitarElMotor: ["No tratar vidrio roto como dano material simple si existen bordes expuestos, terceros o manipulacion pendiente."],
      bibliotecasSecundariasRelacionadas: ["epp", "dano_material", "orden_aseo_housekeeping"],
      definicionesRiesgo: [
        temaD("vidrio_roto_expuesto", "Vidrio roto con borde expuesto", "Vidrio, espejo o panel trizado mantiene aristas accesibles en zona de transito", ["vidrio", "roto"], "corte_borde", "vidrio roto", "borde expuesto", "alto"),
        temaD("espejo_trizado_instalado", "Espejo trizado instalado", "Espejo o panel fragil permanece instalado con fisura, tension o riesgo de desprendimiento", ["espejo", "trizado"], "dano_material", "espejo instalado", "trizado", "alto"),
        temaD("panel_sin_proteccion_borde", "Panel fragil sin proteccion de borde", "Borde de vidrio, espejo o panel no cuenta con proteccion durante traslado", ["panel", "borde"], "corte_borde", "panel fragil", "sin proteccion"),
        temaD("manipulacion_vidrio_sin_guantes", "Vidrio manipulado sin guantes anticorte", "Trabajador sostiene vidrio o espejo sin guantes compatibles con borde cortante", ["guantes", "vidrio"], "corte_borde", "EPP anticorte", "no usado", "alto"),
        temaD("transporte_vidrio_sin_apoyo", "Transporte de vidrio sin apoyo suficiente", "Panel fragil se traslada manualmente sin ventosas, carro, apoyo o equipo suficiente", ["transporte", "vidrio"], "manipulacion_manual", "panel de vidrio", "traslado manual exigente"),
        temaD("acopio_vertical_inestable", "Acopio vertical inestable de vidrios", "Vidrios o espejos se apoyan verticalmente sin amarre, separador o base antideslizante", ["acopio", "vertical"], "dano_material", "acopio de vidrios", "inestable", "alto"),
        temaD("vidrio_en_ruta_transito", "Vidrio acopiado en ruta de transito", "Panel o espejo queda en pasillo, acceso o ruta de evacuacion", ["ruta", "vidrio"], "caida_mismo_nivel", "vidrio acopiado", "obstruye transito"),
        temaD("rotura_durante_instalacion", "Rotura durante instalacion de vidrio", "Vidrio se instala con torsion, apoyo irregular o presion que puede romperlo", ["rotura", "instalacion"], "dano_material", "vidrio en instalacion", "tensionado", "alto"),
        temaD("caida_panel_altura", "Caida de panel desde altura", "Panel, espejo o vidrio se instala en altura sin sujecion temporal ni zona inferior cerrada", ["panel", "altura"], "caida_objetos", "panel fragil", "sin sujecion", "alto"),
        temaD("zona_inferior_vidrio", "Zona inferior abierta bajo vidrio", "Personas circulan bajo punto de instalacion o retiro de vidrio", ["zona inferior", "vidrio"], "segregacion_senalizacion", "area bajo vidrio", "sin cierre"),
        temaD("escalera_instalacion_vidrio", "Escalera inestable al instalar vidrio", "Instalacion de espejo o vidrio alto se realiza desde escalera sin apoyo seguro", ["escalera", "vidrio"], "caida_distinto_nivel", "escalera para vidrio", "inestable", "alto"),
        temaD("plataforma_vidrio_sin_control", "Plataforma sin control para vidrio", "Plataforma usada para vidrio o mampara no esta inspeccionada u ordenada", ["plataforma", "vidrio"], "caida_distinto_nivel", "plataforma para vidrio", "sin verificacion"),
        temaD("herramienta_sujecion_danada", "Ventosa o herramienta de sujecion danada", "Ventosa, soporte o herramienta para vidrio presenta desgaste, suciedad o falla", ["ventosa", "herramienta"], "mantencion_certificacion", "ventosa para vidrio", "danada"),
        temaD("adhesivo_vidrio_sin_hds", "Adhesivo de vidrio sin HDS/SDS", "Adhesivo, silicona o primer para vidrio no cuenta con ficha disponible", ["adhesivo", "vidrio"], "vapores_quimicos", "adhesivo de vidrio", "sin HDS/SDS"),
        temaD("vapores_sello_vidrio", "Vapores de sello en vidrio", "Sellante de espejo o vidrio se aplica en recinto con ventilacion insuficiente", ["vapores", "espejo"], "ventilacion_deficiente", "sellado de vidrio", "ventilacion insuficiente"),
        temaD("fragmentos_vidrio_sin_retiro", "Fragmentos de vidrio sin retiro", "Restos, astillas o trozos de vidrio permanecen en piso o meson", ["fragmentos", "vidrio"], "corte_borde", "fragmentos de vidrio", "sin retiro", "alto"),
        temaD("limpieza_vidrio_cortante", "Limpieza de vidrio con borde cortante", "Limpieza de espejo o panel se realiza pese a borde astillado o trizado", ["limpieza", "vidrio"], "corte_borde", "vidrio en limpieza", "borde cortante"),
        temaD("proteccion_ocular_vidrio", "Proteccion ocular ausente con vidrio", "Manipulacion o corte menor de vidrio se realiza sin lentes de seguridad", ["ocular", "vidrio"], "corte_borde", "proteccion ocular", "ausente"),
        temaD("panel_sin_rotulo_fragil", "Panel fragil sin rotulacion", "Vidrio, espejo o panel almacenado no indica fragilidad, sentido ni restriccion", ["rotulo", "fragil"], "rotulacion_identificacion", "panel fragil", "sin rotulo"),
        temaD("paso_bajo_panel", "Paso bajo panel manipulado", "Personas circulan bajo o junto a panel fragil mientras se traslada o eleva", ["paso", "panel"], "segregacion_senalizacion", "radio de panel", "terceros expuestos"),
        temaD("manipulacion_solitario_vidrio", "Manipulacion solitaria de vidrio", "Trabajador mueve vidrio o espejo de tamano relevante sin apoyo de otra persona", ["solitario", "vidrio"], "manipulacion_manual", "panel fragil", "sin apoyo"),
        temaD("postura_forzada_vidrio", "Postura forzada al instalar vidrio", "Instalacion de espejo o mampara exige torsion, brazos elevados o alcance lateral", ["postura", "mampara"], "postura_forzada", "instalacion de vidrio", "postura forzada"),
        temaD("vidrio_sin_calza", "Vidrio sin calza o apoyo compatible", "Panel queda apoyado en piso duro, borde irregular o soporte no compatible", ["calza", "apoyo"], "dano_material", "vidrio apoyado", "sin calza"),
        temaD("mampara_sin_anclaje", "Mampara sin anclaje definitivo", "Mampara o panel queda presentado sin fijacion, nivelacion o soporte definitivo", ["mampara", "anclaje"], "dano_material", "mampara", "sin anclaje", "alto"),
        temaD("corte_perfil_vidrio", "Corte de perfil para vidrio sin control", "Perfil, junquillo o marco de vidrio se corta con borde o proyeccion no controlada", ["perfil", "vidrio"], "corte_borde", "perfil de vidrio", "corte sin control"),
        temaD("herramienta_electrica_vidrio", "Herramienta electrica cerca de vidrio", "Taladro o atornillador se usa cerca de vidrio sin controlar vibracion o golpe", ["taladro", "vidrio"], "herramienta_electrica", "herramienta junto a vidrio", "sin control"),
        temaD("dano_terminacion_vidrio", "Dano a terminacion por vidrio", "Traslado o montaje de vidrio expone muros, pisos o marcos terminados a golpe", ["terminacion", "vidrio"], "dano_material", "terminacion cercana", "expuesta a dano"),
        temaD("area_vidrio_sin_senalizar", "Area de vidrio sin senalizacion", "Sector de acopio o instalacion de vidrio permanece abierto a terceros", ["senalizacion", "vidrio"], "segregacion_senalizacion", "area de vidrio", "sin senalizacion"),
        temaD("embalaje_vidrio_sin_retiro", "Embalaje de vidrio sin retiro", "Cartones, esquineros, flejes o plastico quedan en piso despues del montaje", ["embalaje", "vidrio"], "caida_mismo_nivel", "embalaje de vidrio", "sin retiro"),
        temaD("matriz_no_cubre_panel_pesado", "Matriz no cubre panel fragil pesado", "Instalacion de vidrio pesado, altura o transporte interno no esta en analisis vigente", ["matriz", "panel"], "matriz_no_cubre", "panel fragil pesado", "no evaluado"),
        temaD("autorizacion_vidrio_altura", "Instalacion de vidrio en altura sin autorizacion", "Vidrio o mampara en altura se instala sin responsable autorizado o metodo definido", ["autorizacion", "altura"], "autorizacion_documental", "vidrio en altura", "sin autorizacion", "alto"),
        temaD("entrega_vidrio_sin_revision", "Entrega de vidrio sin revision final", "Vidrio, espejo o panel se entrega sin revisar fijacion, bordes, limpieza o estabilidad", ["entrega", "vidrio"], "dano_material", "vidrio instalado", "sin revision"),
      ],
    },
    {
      id: "terminaciones_menores_reparaciones_acabados_finales",
      nombreVisible: "Terminaciones menores, reparaciones y acabados finales",
      descripcionActividad:
        "Retoques, reparaciones menores, limpieza fina, ajustes de terminacion, reposicion de piezas, sellos menores, acabados finales y entrega de areas.",
      etapaObra: "Cierre de terminaciones y entrega",
      contextoTecnico: "durante terminaciones menores, reparaciones, retoques, ajustes, limpieza fina, acabados finales y entrega de areas",
      palabrasClaveActividad: ["terminacion", "reparacion", "acabado", "retoque", "limpieza", "entrega"],
      familiasPreventivasRelacionadas: ["orden_aseo_housekeeping", "seguridad_trabajadores", "dano_material", "herramientas_equipos"],
      desviacionesFrecuentes: ["condicion_insegura", "dano_material", "falla_supervision_control_operacional"],
      documentosFrecuentesAplicables: ["Matriz de riesgos vigente", "Registro de cierre si aplica", "HDS/SDS si hay adhesivos o solventes"],
      documentosQueNoAplicanPorDefecto: documentosNoTerminacionSimple,
      preguntasEstrategicasSugeridas: [
        "La terminacion menor corresponde a limpieza/retiro simple o a tarea con herramienta, quimico o altura?",
        "Existe corte, golpe, polvo, residuo, derrame o superficie resbaladiza?",
        "La herramienta manual o electrica esta en buen estado e inspeccionada?",
        "El area de entrega queda ordenada, senalizada y sin bordes o piezas expuestas?",
        "La condicion requiere reparar, retirar, limpiar, segregar o verificar cierre?",
      ],
      erroresQueDebeEvitarElMotor: ["No sobredocumentar reparaciones simples, pero no liberar acabados finales con vidrio, borde, quimico o herramienta sin control."],
      bibliotecasSecundariasRelacionadas: ["epp", "capacitacion_evidencias", "senalizacion_segregacion"],
      definicionesRiesgo: [
        temaD("herramienta_manual_cortante", "Herramienta manual cortante en reparacion", "Cuchillo, cartonero, formon o raspador se usa en retoque sin control de manos", ["herramienta", "cortante"], "corte_borde", "herramienta manual", "uso sin control"),
        temaD("pieza_pequena_suelta", "Pieza pequena suelta en terminacion", "Tornillo, tapa, moldura o accesorio queda suelto en piso o acceso", ["pieza", "suelta"], "caida_mismo_nivel", "pieza de terminacion", "suelta"),
        temaD("borde_filoso_acabado", "Borde filoso en acabado final", "Perfil, tapa, moldura o pieza reparada mantiene arista cortante expuesta", ["borde", "acabado"], "corte_borde", "pieza de acabado", "borde filoso"),
        temaD("vidrio_menor_trizado", "Vidrio menor trizado en entrega", "Elemento vidriado pequeno queda trizado, astillado o con borde accesible", ["vidrio", "trizado"], "corte_borde", "vidrio menor", "trizado", "alto"),
        temaD("adhesivo_reparacion_sin_hds", "Adhesivo de reparacion sin HDS/SDS", "Adhesivo, sellante o pegamento de retoque se usa sin ficha o rotulo", ["adhesivo", "reparacion"], "vapores_quimicos", "adhesivo de reparacion", "sin HDS/SDS"),
        temaD("solvente_limpieza_final", "Solvente en limpieza final sin control", "Limpieza fina usa solvente sin ventilacion, guantes o contencion de residuos", ["solvente", "limpieza"], "vapores_quimicos", "solvente de limpieza", "sin control"),
        temaD("vapores_retoque_sin_ventilacion", "Vapores de retoque sin ventilacion", "Retoque con pintura, sello o adhesivo se realiza en recinto cerrado", ["vapores", "retoque"], "ventilacion_deficiente", "recinto de retoque", "ventilacion insuficiente"),
        temaD("derrame_producto_acabado", "Derrame de producto de acabado", "Producto de limpieza, sello o retoque queda derramado en piso terminado", ["derrame", "acabado"], "vapores_quimicos", "derrame de producto", "sin contencion"),
        temaD("piso_resbaladizo_limpieza", "Piso resbaladizo por limpieza final", "Agua, cera, solvente o producto de limpieza deja ruta resbaladiza", ["limpieza", "piso"], "caida_mismo_nivel", "piso en limpieza", "resbaladizo"),
        temaD("area_limpieza_sin_senalizar", "Area de limpieza sin senalizar", "Zona recien limpiada, encerada o reparada queda abierta al transito", ["senalizacion", "limpieza"], "segregacion_senalizacion", "area en limpieza", "sin senalizacion"),
        temaD("escalera_retoque", "Escalera inestable en retoque", "Retoque de cielo, muro alto o accesorio se ejecuta desde escalera inestable", ["escalera", "retoque"], "caida_distinto_nivel", "escalera de retoque", "inestable"),
        temaD("plataforma_reparacion_menor", "Plataforma para reparacion menor sin orden", "Plataforma o banquillo usado en acabado mantiene herramientas o residuos sueltos", ["plataforma", "reparacion"], "caida_distinto_nivel", "plataforma de reparacion", "desordenada"),
        temaD("caida_herramientas_retoque", "Caida de herramientas de retoque", "Destornillador, espatula, brocha o pieza queda sin contencion sobre altura", ["herramientas", "retoque"], "caida_objetos", "herramientas de retoque", "sin contencion"),
        temaD("taladro_reparacion_defectuoso", "Taladro de reparacion defectuoso", "Taladro, broca o extension usada en ajuste final presenta dano o accesorio incorrecto", ["taladro", "reparacion"], "herramienta_electrica", "taladro de reparacion", "defectuoso"),
        temaD("ruido_reparacion_puntual", "Ruido en reparacion puntual", "Taladro, lijadora o esmeril de retoque genera ruido sin aviso ni proteccion", ["ruido", "reparacion"], "ruido_vibracion", "herramienta de reparacion", "ruido no controlado"),
        temaD("polvo_retoque_sin_limpieza", "Polvo de retoque sin limpieza", "Lijado o perforacion menor deja polvo fino en superficie terminada o ruta", ["polvo", "retoque"], "perforacion_polvo", "polvo de retoque", "sin limpieza"),
        temaD("postura_forzada_acabado", "Postura forzada en acabado", "Ajuste o retoque exige arrodillarse, torsion o brazos elevados sin apoyo", ["postura", "acabado"], "postura_forzada", "postura de acabado", "forzada"),
        temaD("movimiento_repetitivo_limpieza", "Movimiento repetitivo en limpieza fina", "Limpieza o pulido manual se repite sin pausas ni rotacion", ["repetitivo", "limpieza"], "postura_forzada", "limpieza fina", "repetitiva"),
        temaD("residuo_menor_sin_retiro", "Residuo menor sin retiro", "Cintas, plasticos, tornillos, tapas o recortes quedan en area de entrega", ["residuo", "menor"], "caida_mismo_nivel", "residuo menor", "sin retiro"),
        temaD("embalaje_acabado_transito", "Embalaje de acabados en transito", "Cartones, plasticos o protecciones de terminacion obstruyen pasillos", ["embalaje", "transito"], "caida_mismo_nivel", "embalaje de acabado", "obstruye paso"),
        temaD("dano_material_no_reparado", "Dano material no reparado en entrega", "Pieza, tapa, borde o terminacion danada queda liberada pese a potencial de lesion", ["dano", "entrega"], "dano_material", "terminacion danada", "sin reparar"),
        temaD("proteccion_retirada_anticipada", "Proteccion retirada anticipadamente", "Proteccion de piso, vidrio o terminacion se retira antes de finalizar trabajos cercanos", ["proteccion", "retirada"], "dano_material", "proteccion de terminacion", "retirada"),
        temaD("pieza_mal_fijada", "Pieza de acabado mal fijada", "Tapa, perfil, moldura o accesorio queda suelto, levantado o con juego", ["perfil", "moldura"], "dano_material", "pieza de acabado", "mal fijada"),
        temaD("superficie_fresca_liberada", "Superficie fresca liberada al transito", "Sello, pintura, adhesivo o reparacion queda abierta antes de secado o curado", ["superficie fresca", "transito"], "segregacion_senalizacion", "superficie reparada", "liberada antes de tiempo"),
        temaD("producto_sin_rotulo_retoque", "Producto de retoque sin rotulo", "Envase menor de pintura, adhesivo o limpiador no identifica producto", ["rotulo", "retoque"], "rotulacion_identificacion", "producto de retoque", "sin rotulo"),
        temaD("trapos_contaminados_retoque", "Trapos contaminados en terminacion", "Trapos con solvente, pintura o adhesivo quedan acumulados en area final", ["trapos", "terminacion"], "gas_combustible", "trapos contaminados", "sin segregacion"),
        temaD("epp_inadecuado_reparacion", "EPP inadecuado en reparacion menor", "Tarea con corte, quimico o polvo se ejecuta sin EPP compatible", ["epp", "reparacion"], "vapores_quimicos", "EPP de reparacion", "inadecuado"),
        temaD("terceros_en_area_entrega", "Terceros en area de reparacion", "Usuarios, visitas u otras cuadrillas ingresan mientras se repara o limpia", ["terceros", "entrega"], "segregacion_senalizacion", "area de reparacion", "terceros expuestos"),
        temaD("matriz_no_cubre_retoque_quimico", "Matriz no cubre retoque quimico", "Uso de solvente, adhesivo o herramienta electrica en entrega no esta evaluado", ["matriz", "retoque"], "matriz_no_cubre", "retoque con quimico", "no evaluado"),
        temaD("registro_cierre_incompleto", "Registro de cierre incompleto", "Correccion final no deja responsable, evidencia o verificacion cuando corresponde", ["registro", "cierre"], "autorizacion_documental", "registro de cierre", "incompleto"),
        temaD("iluminacion_entrega_deficiente", "Iluminacion deficiente en entrega", "Inspeccion final se realiza con sombras que ocultan bordes, residuos o danos", ["iluminacion", "entrega"], "segregacion_senalizacion", "area de entrega", "baja visibilidad"),
        temaD("limpieza_final_sin_verificacion", "Limpieza final sin verificacion", "Area se libera sin revisar residuos, herramientas, derrames, piezas sueltas o bordes", ["limpieza final", "verificacion"], "caida_mismo_nivel", "area de entrega", "sin verificacion final"),
      ],
    },
  ];
}

const ACTIVIDADES_BASE: ActividadBase[] = [
  {
    id: "instalacion_faena_cierres_accesos",
    nombreVisible: "Instalacion de faena, cierres y accesos",
    descripcionActividad:
      "Habilitacion inicial de obra, cierre perimetral, accesos controlados, rutas internas, instalaciones provisorias y ordenamiento de areas de apoyo.",
    etapaObra: "Inicio de obra y habilitacion",
    contextoTecnico: "durante la instalacion de faena, cierres y accesos provisorios",
    palabrasClaveActividad: ["instalacion de faena", "cierres", "acceso", "porton", "bodega provisoria", "ruta interna"],
    familiasPreventivasRelacionadas: ["senalizacion_segregacion", "orden_aseo_housekeeping", "seguridad_trabajadores", "energia_loto_electrico"],
    desviacionesFrecuentes: ["condicion_insegura", "acceso_zona_delimitada_sin_autorizacion", "control_critico_ausente_no_verificado"],
    documentosFrecuentesAplicables: [...documentosGenerales, "Plano o esquema de circulacion interna"],
    documentosQueNoAplicanPorDefecto: documentosNoSimples,
    preguntasEstrategicasSugeridas: preguntasEstrategicasBase,
    erroresQueDebeEvitarElMotor: ["No sobredocumentar cierres menores corregibles con ajuste fisico inmediato."],
    bibliotecasSecundariasRelacionadas: ["vehiculos_transporte", "medio_ambiente", "dano_material"],
  },
  {
    id: "excavaciones_movimiento_tierra",
    nombreVisible: "Excavaciones y movimiento de tierra",
    descripcionActividad:
      "Apertura, profundizacion, carguio, retiro y conformacion de terreno con equipos, trabajadores cercanos y cambios permanentes en estabilidad del suelo.",
    etapaObra: "Obra gruesa inicial",
    contextoTecnico: "durante excavaciones y movimiento de tierra",
    palabrasClaveActividad: ["excavacion", "zanja", "talud", "entibacion", "movimiento de tierra", "carguio"],
    familiasPreventivasRelacionadas: ["excavaciones_suelos", "seguridad_trabajadores", "maquinaria_instalaciones", "senalizacion_segregacion"],
    desviacionesFrecuentes: ["control_critico_ausente_no_verificado", "condicion_insegura", "interaccion_insegura_peaton_vehiculo_maquinaria"],
    documentosFrecuentesAplicables: [...documentosGenerales, "Permiso o autorizacion de excavacion", "PTS de excavacion si aplica"],
    documentosQueNoAplicanPorDefecto: ["Permiso de trabajo en caliente si no hay fuente de ignicion", "HDS/SDS si no hay sustancias peligrosas"],
    preguntasEstrategicasSugeridas: preguntasEstrategicasBase,
    erroresQueDebeEvitarElMotor: ["No tratar excavacion sin entibacion como simple falta de orden o senalizacion."],
    bibliotecasSecundariasRelacionadas: ["vehiculos_transporte", "clima_entorno", "medio_ambiente"],
  },
  {
    id: "fundaciones_cimientos",
    nombreVisible: "Fundaciones y cimientos",
    descripcionActividad:
      "Preparacion, nivelacion, colocacion de emplantillado, armado, hormigonado y control de zonas bajas o abiertas para conformar bases estructurales.",
    etapaObra: "Obra gruesa",
    contextoTecnico: "durante trabajos de fundaciones y cimientos",
    palabrasClaveActividad: ["fundacion", "cimiento", "emplantillado", "zapata", "radier", "sello"],
    familiasPreventivasRelacionadas: ["seguridad_trabajadores", "excavaciones_suelos", "maquinaria_instalaciones", "dano_material"],
    desviacionesFrecuentes: ["condicion_insegura", "control_critico_ausente_no_verificado", "omision_documental"],
    documentosFrecuentesAplicables: [...documentosGenerales, "Procedimiento de hormigonado o fundaciones si aplica"],
    documentosQueNoAplicanPorDefecto: documentosNoSimples,
    preguntasEstrategicasSugeridas: preguntasEstrategicasBase,
    erroresQueDebeEvitarElMotor: ["No exigir permiso especial si el hallazgo se resuelve con segregacion, limpieza o reposicion simple."],
    bibliotecasSecundariasRelacionadas: ["orden_aseo_housekeeping", "maquinaria_instalaciones", "medio_ambiente"],
  },
  {
    id: "moldajes_descimbre",
    nombreVisible: "Moldajes y descimbre",
    descripcionActividad:
      "Armado, aplome, fijacion, retiro y traslado de moldajes, puntales, paneles y accesorios, con riesgos de caida de material y atrapamiento.",
    etapaObra: "Obra gruesa",
    contextoTecnico: "durante armado de moldajes y descimbre",
    palabrasClaveActividad: ["moldaje", "descimbre", "puntal", "panel", "apuntalamiento", "desmoldante"],
    familiasPreventivasRelacionadas: ["trabajos_criticos", "seguridad_trabajadores", "herramientas_equipos", "orden_aseo_housekeeping"],
    desviacionesFrecuentes: ["condicion_insegura", "control_critico_ausente_no_verificado", "uso_inadecuado_herramienta_equipo_maquinaria"],
    documentosFrecuentesAplicables: [...documentosGenerales, "PTS de moldajes o descimbre si aplica"],
    documentosQueNoAplicanPorDefecto: ["HDS/SDS salvo uso de quimicos o desmoldantes", "Permiso de izaje si no hay carga suspendida"],
    preguntasEstrategicasSugeridas: preguntasEstrategicasBase,
    erroresQueDebeEvitarElMotor: ["No tratar descimbre o apuntalamiento inestable como orden y aseo simple."],
    bibliotecasSecundariasRelacionadas: ["izaje_gruas_amarre", "dano_material", "sustancias_hds"],
  },
  {
    id: "enfierradura",
    nombreVisible: "Enfierradura",
    descripcionActividad:
      "Corte, doblado, traslado, amarre e instalacion de barras de acero, mallas y esperas, con exposicion a punciones, cortes y sobreesfuerzos.",
    etapaObra: "Obra gruesa",
    contextoTecnico: "durante trabajos de enfierradura",
    palabrasClaveActividad: ["enfierradura", "fierro", "barra", "malla", "espera", "amarre"],
    familiasPreventivasRelacionadas: ["seguridad_trabajadores", "herramientas_equipos", "ergonomia_manejo_manual", "orden_aseo_housekeeping"],
    desviacionesFrecuentes: ["condicion_insegura", "acto_inseguro", "uso_inadecuado_herramienta_equipo_maquinaria"],
    documentosFrecuentesAplicables: [...documentosGenerales, "Procedimiento de corte y doblado si aplica"],
    documentosQueNoAplicanPorDefecto: ["Permiso de excavacion si no hay intervencion de suelo", "HDS/SDS salvo presencia de quimicos"],
    preguntasEstrategicasSugeridas: preguntasEstrategicasBase,
    erroresQueDebeEvitarElMotor: ["No pedir permiso critico por cada punta expuesta si basta proteccion, retiro o segregacion."],
    bibliotecasSecundariasRelacionadas: ["epp", "mantencion_certificacion", "higiene_ocupacional"],
  },
  {
    id: "hormigonado",
    nombreVisible: "Hormigonado",
    descripcionActividad:
      "Recepcion, bombeo, descarga, vibrado, nivelacion y terminacion de hormigon con equipos, trabajadores cercanos, energia y condiciones de superficie variables.",
    etapaObra: "Obra gruesa",
    contextoTecnico: "durante faenas de hormigonado",
    palabrasClaveActividad: ["hormigonado", "bomba", "mixer", "vibrador", "descarga", "lechada"],
    familiasPreventivasRelacionadas: ["maquinaria_instalaciones", "seguridad_trabajadores", "sustancias_hds", "medio_ambiente"],
    desviacionesFrecuentes: ["condicion_insegura", "interaccion_insegura_peaton_vehiculo_maquinaria", "control_critico_ausente_no_verificado"],
    documentosFrecuentesAplicables: [...documentosGenerales, "Procedimiento de bombeo o descarga si aplica"],
    documentosQueNoAplicanPorDefecto: ["Permiso de trabajo en caliente si no hay fuente de ignicion"],
    preguntasEstrategicasSugeridas: preguntasEstrategicasBase,
    erroresQueDebeEvitarElMotor: ["No tratar derrame de lechada solo como aseo si existe impacto ambiental o superficie resbaladiza."],
    bibliotecasSecundariasRelacionadas: ["vehiculos_transporte", "energia_loto_electrico", "orden_aseo_housekeeping"],
  },
  {
    id: "estructuras_metalicas_iniciales",
    nombreVisible: "Estructuras metalicas iniciales",
    descripcionActividad:
      "Recepcion, posicionamiento, aplome, fijacion inicial y montaje de perfiles, placas y elementos metalicos con izaje, herramientas y trabajos en altura.",
    etapaObra: "Obra gruesa y montaje inicial",
    contextoTecnico: "durante montaje inicial de estructuras metalicas",
    palabrasClaveActividad: ["estructura metalica", "perfil", "placa", "montaje", "perno", "soldadura"],
    familiasPreventivasRelacionadas: ["izaje_gruas_amarre", "trabajos_criticos", "herramientas_equipos", "seguridad_trabajadores"],
    desviacionesFrecuentes: ["control_critico_ausente_no_verificado", "paso_bajo_carga_suspendida", "condicion_insegura"],
    documentosFrecuentesAplicables: [...documentosGenerales, "Plan de izaje si aplica", "Permiso de trabajo en caliente si aplica"],
    documentosQueNoAplicanPorDefecto: ["HDS/SDS salvo uso de sustancias quimicas", "Permiso de excavacion si no hay intervencion de suelo"],
    preguntasEstrategicasSugeridas: preguntasEstrategicasBase,
    erroresQueDebeEvitarElMotor: ["No tratar carga suspendida o montaje en altura como simple orden y aseo."],
    bibliotecasSecundariasRelacionadas: ["epp", "energia_loto_electrico", "mantencion_certificacion"],
  },
];

function crearTemasBloqueE(objetoOperacion: string, palabrasOperacion: string[]): TemaRiesgoBloqueE[] {
  return [
    temaE("segregacion_insuficiente", `Segregacion insuficiente en ${objetoOperacion}`, `${objetoOperacion} se desarrolla con separacion insuficiente entre personas, equipos, vehiculos, cargas o acopios`, [...palabrasOperacion, "segregacion"], "segregacion_senalizacion", objetoOperacion, "segregacion insuficiente", "alto"),
    temaE("linea_fuego_no_controlada", `Linea de fuego no controlada en ${objetoOperacion}`, `${objetoOperacion} expone a trabajadores dentro de trayectoria de carga, equipo, vehiculo, giro, liberacion o desplazamiento`, [...palabrasOperacion, "linea de fuego"], "segregacion_senalizacion", objetoOperacion, "linea de fuego no controlada", "alto"),
    temaE("interaccion_peaton_equipo", `Interaccion insegura peaton-equipo en ${objetoOperacion}`, `${objetoOperacion} permite cercania entre peatones, operadores, conductores o personal de apoyo sin distancia preventiva`, [...palabrasOperacion, "peaton", "equipo"], "segregacion_senalizacion", objetoOperacion, "interaccion insegura", "alto"),
    temaE("ruta_circulacion_obstruida", `Ruta de circulacion obstruida en ${objetoOperacion}`, `${objetoOperacion} mantiene ruta, pasillo, acceso o area de maniobra ocupada por materiales, residuos, herramientas o equipos`, [...palabrasOperacion, "ruta", "obstruccion"], "caida_mismo_nivel", "ruta asociada", "obstruida"),
    temaE("radio_giro_sin_control", `Radio de giro sin control en ${objetoOperacion}`, `${objetoOperacion} incluye giro, aproximacion, estacionamiento o posicionamiento sin control del radio operacional`, [...palabrasOperacion, "radio de giro"], "segregacion_senalizacion", "radio operacional", "sin control", "alto"),
    temaE("punto_ciego_no_controlado", `Punto ciego no controlado en ${objetoOperacion}`, `${objetoOperacion} presenta puntos ciegos generados por equipo, vehiculo, acopio, carga, estructura o baja visibilidad`, [...palabrasOperacion, "punto ciego"], "segregacion_senalizacion", "punto ciego", "no controlado", "alto"),
    temaE("terreno_superficie_inestable", `Terreno o superficie inestable en ${objetoOperacion}`, `${objetoOperacion} se ejecuta sobre barro, relleno, pendiente, desnivel, piso humedo, base irregular o superficie sin capacidad verificada`, [...palabrasOperacion, "terreno", "superficie"], "caida_mismo_nivel", "superficie de trabajo", "inestable", "alto"),
    temaE("control_acceso_deficiente", `Control de acceso deficiente en ${objetoOperacion}`, `${objetoOperacion} permite ingreso de personal no autorizado, terceros o vehiculos a zona operacional o restringida`, [...palabrasOperacion, "acceso"], "segregacion_senalizacion", "acceso operacional", "deficiente"),
    temaE("senalizacion_insuficiente", `Senalizacion insuficiente en ${objetoOperacion}`, `${objetoOperacion} no cuenta con advertencias, sentidos, limites, zonas de exclusion, velocidad o restricciones visibles`, [...palabrasOperacion, "senalizacion"], "segregacion_senalizacion", "senalizacion operacional", "insuficiente"),
    temaE("comunicacion_operacional_deficiente", `Comunicacion deficiente en ${objetoOperacion}`, `${objetoOperacion} carece de coordinacion clara entre operador, conductor, senalero, rigger, bodeguero, supervisor o peatones`, [...palabrasOperacion, "comunicacion"], "segregacion_senalizacion", "comunicacion operacional", "deficiente"),
    temaE("operador_responsable_no_identificado", `Responsable no identificado en ${objetoOperacion}`, `${objetoOperacion} no identifica operador, conductor, senalero, responsable de bodega, rigger o encargado de control`, [...palabrasOperacion, "responsable"], "autorizacion_documental", "responsable operacional", "no identificado"),
    temaE("autorizacion_no_verificada", `Autorizacion no verificada en ${objetoOperacion}`, `${objetoOperacion} se ejecuta sin validar autorizacion, competencia, licencia, permiso operacional o rol requerido`, [...palabrasOperacion, "autorizacion"], "autorizacion_documental", "autorizacion operacional", "no verificada", "alto"),
    temaE("inspeccion_preoperacional_ausente", `Inspeccion preoperacional ausente en ${objetoOperacion}`, `${objetoOperacion} inicia sin revision previa de condicion, checklist, inspeccion visual, registro o liberacion operacional`, [...palabrasOperacion, "preoperacional"], "mantencion_certificacion", "inspeccion preoperacional", "ausente"),
    temaE("mantencion_certificacion_no_vigente", `Mantencion o certificacion no vigente en ${objetoOperacion}`, `${objetoOperacion} utiliza equipo, vehiculo, accesorio, estanteria, aparejo o elemento critico sin vigencia verificable`, [...palabrasOperacion, "mantencion", "certificacion"], "mantencion_certificacion", "vigencia tecnica", "no demostrada"),
    temaE("equipo_elemento_defectuoso", `Elemento defectuoso usado en ${objetoOperacion}`, `${objetoOperacion} mantiene herramienta, equipo, vehiculo, accesorio, pallet, estante o elemento de amarre con dano visible`, [...palabrasOperacion, "defectuoso"], "mantencion_certificacion", "elemento operacional", "defectuoso"),
    temaE("fuga_derrame_sin_contencion", `Fuga o derrame sin contencion en ${objetoOperacion}`, `${objetoOperacion} genera fuga, goteo, derrame de aceite, combustible, fluido hidraulico, producto o residuo sin control`, [...palabrasOperacion, "derrame", "fuga"], "fuga_fluidos", "fuga o derrame", "sin contencion"),
    temaE("material_carga_inestable", `Carga o material inestable en ${objetoOperacion}`, `${objetoOperacion} involucra carga, material, pallet, repuesto, bulto o componente sin estabilidad, amarre o contencion suficiente`, [...palabrasOperacion, "carga", "material"], "caida_objetos", "carga o material", "inestable", "alto"),
    temaE("apilamiento_sobrealtura", `Apilamiento o sobrealtura en ${objetoOperacion}`, `${objetoOperacion} presenta acopio, pila, estiba o almacenamiento con sobrealtura, base irregular o perdida de estabilidad`, [...palabrasOperacion, "apilamiento", "sobrealtura"], "caida_objetos", "apilamiento", "inestable"),
    temaE("caida_objetos_materiales", `Caida potencial de objetos en ${objetoOperacion}`, `${objetoOperacion} deja objetos, herramientas, accesorios, embalajes, repuestos o materiales expuestos a caida`, [...palabrasOperacion, "caida de objetos"], "caida_objetos", "objetos o materiales", "sin contencion"),
    temaE("atrapamiento_aplastamiento", `Atrapamiento o aplastamiento en ${objetoOperacion}`, `${objetoOperacion} expone extremidades o cuerpo entre carga, equipo, estructura, compuerta, acopio o punto de apoyo`, [...palabrasOperacion, "atrapamiento"], "segregacion_senalizacion", "punto de atrapamiento", "exposicion directa", "alto"),
    temaE("energia_bloqueo_no_controlado", `Energia o bloqueo no controlado en ${objetoOperacion}`, `${objetoOperacion} incluye energia mecanica, hidraulica, electrica, gravitacional o presurizada sin bloqueo o descarga segura`, [...palabrasOperacion, "bloqueo", "energia"], "energia_loto", "energia operacional", "sin bloqueo", "critico"),
    temaE("presion_sobrepresion_no_controlada", `Presion no controlada en ${objetoOperacion}`, `${objetoOperacion} usa neumaticos, cilindros, mangueras, sistemas hidraulicos, recipientes o componentes con presion no verificada`, [...palabrasOperacion, "presion"], "presion_sobrepresion", "sistema presurizado", "no controlado", "alto"),
    temaE("visibilidad_iluminacion_deficiente", `Visibilidad deficiente en ${objetoOperacion}`, `${objetoOperacion} se realiza con sombra, polvo, lluvia, carga, acopio, curva, estructura o iluminacion insuficiente`, [...palabrasOperacion, "visibilidad", "iluminacion"], "segregacion_senalizacion", "visibilidad operacional", "deficiente"),
    temaE("condicion_climatica_adversa", `Condicion climatica adversa en ${objetoOperacion}`, `${objetoOperacion} se mantiene con viento, lluvia, polvo, frio, calor o baja visibilidad que modifica el control`, [...palabrasOperacion, "clima"], "segregacion_senalizacion", "condicion climatica", "no reevaluada"),
    temaE("orden_aseo_deficiente", `Orden y aseo deficiente en ${objetoOperacion}`, `${objetoOperacion} acumula residuos, embalajes, tacos, maderas, zunchos, barro o elementos sueltos en zona operacional`, [...palabrasOperacion, "orden", "aseo"], "caida_mismo_nivel", "zona operacional", "desordenada"),
    temaE("documentacion_aplicable_no_disponible", `Documentacion aplicable no disponible en ${objetoOperacion}`, `${objetoOperacion} requiere registro, inspeccion, autorizacion, plan, matriz, HDS/SDS o permiso que no se encuentra disponible`, [...palabrasOperacion, "documentacion"], "autorizacion_documental", "documentacion aplicable", "no disponible"),
    temaE("matriz_riesgos_no_cubre_condicion", `Matriz no cubre condicion de ${objetoOperacion}`, `${objetoOperacion} presenta cambio de ruta, carga, equipo, terreno, energia o simultaneidad no considerada en la matriz vigente`, [...palabrasOperacion, "matriz"], "matriz_no_cubre", "matriz de riesgos", "no cubre condicion"),
    temaE("trabajos_simultaneos_interferencia", `Interferencia por trabajos simultaneos en ${objetoOperacion}`, `${objetoOperacion} comparte zona con otras tareas, cuadrillas, rutas, equipos o maniobras sin secuencia definida`, [...palabrasOperacion, "interferencia"], "segregacion_senalizacion", "trabajos simultaneos", "sin coordinacion"),
    temaE("equipo_emergencia_obstruido", `Equipo o ruta de emergencia obstruida en ${objetoOperacion}`, `${objetoOperacion} bloquea extintor, kit de derrame, salida, acceso de emergencia, tablero o ruta de evacuacion`, [...palabrasOperacion, "emergencia"], "segregacion_senalizacion", "control de emergencia", "obstruido", "alto"),
    temaE("control_ambiental_insuficiente", `Control ambiental insuficiente en ${objetoOperacion}`, `${objetoOperacion} puede afectar suelo, drenaje, agua, aire o residuos por falta de contencion, retiro o segregacion`, [...palabrasOperacion, "ambiental"], "fuga_fluidos", "control ambiental", "insuficiente"),
    temaE("registro_cierre_no_trazable", `Registro o cierre no trazable en ${objetoOperacion}`, `${objetoOperacion} corrige o libera condicion sin evidencia de responsable, verificacion, fecha, bloqueo retirado o cierre efectivo`, [...palabrasOperacion, "registro", "cierre"], "autorizacion_documental", "trazabilidad de cierre", "insuficiente"),
    temaE("supervision_control_operacional_debil", `Supervision operacional debil en ${objetoOperacion}`, `${objetoOperacion} no mantiene verificacion en terreno, seguimiento de controles, responsable presente o correccion oportuna`, [...palabrasOperacion, "supervision"], "segregacion_senalizacion", "supervision operacional", "debil"),
  ];
}

function crearActividadesBloqueE(): ActividadBloqueE[] {
  return [
    {
      id: "maquinaria_equipos_moviles_operacion_terreno",
      nombreVisible: "Maquinaria y equipos moviles en operacion de terreno",
      descripcionActividad:
        "Operacion de excavadoras, retroexcavadoras, cargadores, minicargadores, rodillos, manipuladores, equipos moviles y maquinaria de apoyo en frentes de obra.",
      etapaObra: "Maquinaria, movimiento operacional y apoyo logistico",
      contextoTecnico: "durante operacion de maquinaria y equipos moviles en terreno, con radios de giro, rutas internas, peatones y frentes simultaneos",
      palabrasClaveActividad: ["maquinaria", "equipo movil", "operador", "radio de giro", "retroexcavadora", "terreno"],
      familiasPreventivasRelacionadas: ["maquinaria_instalaciones", "vehiculos_transporte", "senalizacion_segregacion", "seguridad_trabajadores"],
      desviacionesFrecuentes: ["interaccion_insegura_peaton_vehiculo_maquinaria", "control_critico_ausente_no_verificado", "condicion_insegura"],
      documentosFrecuentesAplicables: documentosMaquinariaLogistica,
      documentosQueNoAplicanPorDefecto: documentosNoLogisticaSimple,
      preguntasEstrategicasSugeridas: [
        "El equipo movil cuenta con inspeccion preoperacional y operador autorizado?",
        "El radio de giro, punto ciego o zona de trabajo esta segregado respecto de peatones?",
        "La superficie permite operar sin riesgo de volcamiento, hundimiento o deslizamiento?",
        "Existe coordinacion con senalero, supervisor o control de transito interno?",
        "La condicion requiere detener, retirar el equipo de servicio, segregar o reordenar la ruta?",
      ],
      erroresQueDebeEvitarElMotor: ["No tratar maquinaria en movimiento como orden menor si existen peatones, punto ciego, terreno inestable o control critico no verificado."],
      bibliotecasSecundariasRelacionadas: ["clima_entorno", "mantencion_certificacion", "dano_material"],
      definicionesRiesgo: crearTemasBloqueE("operacion de maquinaria", ["maquinaria", "equipo movil", "operador"]),
    },
    {
      id: "vehiculos_transporte_interno_trabajadores_materiales",
      nombreVisible: "Vehiculos y transporte interno de trabajadores y materiales",
      descripcionActividad:
        "Uso de camionetas, buses, camiones, furgones y vehiculos de apoyo para traslado interno de trabajadores, materiales, herramientas y equipos dentro de obra.",
      etapaObra: "Transporte interno y circulacion operacional",
      contextoTecnico: "durante transporte interno de trabajadores, materiales y herramientas con vehiculos en rutas de obra, accesos, cruces y zonas compartidas",
      palabrasClaveActividad: ["vehiculo", "transporte", "camioneta", "bus", "conductor", "ruta"],
      familiasPreventivasRelacionadas: ["vehiculos_transporte", "senalizacion_segregacion", "seguridad_trabajadores", "mantencion_certificacion"],
      desviacionesFrecuentes: ["transito_interno_inseguro", "conduccion_imprudente", "interaccion_insegura_peaton_vehiculo_maquinaria"],
      documentosFrecuentesAplicables: documentosMaquinariaLogistica,
      documentosQueNoAplicanPorDefecto: documentosNoLogisticaSimple,
      preguntasEstrategicasSugeridas: [
        "El vehiculo, conductor y ruta interna estan autorizados y controlados?",
        "El transporte de personas o materiales se realiza con carga estibada y pasajeros protegidos?",
        "La ruta separa peatones, maquinaria y vehiculos en cruces o accesos?",
        "La condicion del vehiculo permite operar sin frenos, luces, neumaticos o parabrisas defectuosos?",
        "La desviacion requiere detener el vehiculo, corregir carga, restringir ruta o retirar de servicio?",
      ],
      erroresQueDebeEvitarElMotor: ["No evaluar transporte interno solo como traslado simple si hay pasajeros, carga, velocidad, ruta compartida o vehiculo defectuoso."],
      bibliotecasSecundariasRelacionadas: ["maquinaria_instalaciones", "clima_entorno", "dano_material"],
      definicionesRiesgo: crearTemasBloqueE("transporte interno", ["vehiculo", "transporte", "ruta"]),
    },
    {
      id: "carguio_descarga_materiales_camiones_acopios",
      nombreVisible: "Carguio y descarga de materiales, camiones y acopios",
      descripcionActividad:
        "Recepcion, carguio, descarga, traslado corto, estiba y acopio de materiales desde camiones, camionetas, gruas horquilla o equipos de apoyo.",
      etapaObra: "Abastecimiento, acopio y manejo logistico",
      contextoTecnico: "durante carguio y descarga de materiales desde camiones, equipos de apoyo, pallets, acopios y zonas de recepcion en obra",
      palabrasClaveActividad: ["carguio", "descarga", "camion", "acopio", "pallet", "materiales"],
      familiasPreventivasRelacionadas: ["vehiculos_transporte", "maquinaria_instalaciones", "senalizacion_segregacion", "orden_aseo_housekeeping"],
      desviacionesFrecuentes: ["exposicion_linea_fuego", "condicion_insegura", "falla_supervision_control_operacional"],
      documentosFrecuentesAplicables: documentosMaquinariaLogistica,
      documentosQueNoAplicanPorDefecto: documentosNoLogisticaSimple,
      preguntasEstrategicasSugeridas: [
        "La zona de carguio o descarga esta segregada respecto de peatones y otras cuadrillas?",
        "La carga esta estabilizada, amarrada y controlada antes de liberar o mover?",
        "El camion, pallet, eslinga, equipo o terreno permite descargar sin caida o atrapamiento?",
        "La maniobra requiere senalero, equipo mecanico, AST/ART o control de linea de fuego?",
        "La condicion requiere detener la descarga, reestibar, segregar o retirar material inestable?",
      ],
      erroresQueDebeEvitarElMotor: ["No tratar carguio y descarga como bodegaje simple si hay carga suspendida, camion, equipo movil, atrapamiento o linea de fuego."],
      bibliotecasSecundariasRelacionadas: ["izaje_gruas_amarre", "ergonomia_manejo_manual", "dano_material"],
      definicionesRiesgo: crearTemasBloqueE("carguio y descarga", ["carguio", "descarga", "camion"]),
    },
    {
      id: "izaje_gruas_elementos_amarre_carga_suspendida",
      nombreVisible: "Izaje, gruas, elementos de amarre y carga suspendida",
      descripcionActividad:
        "Planificacion y ejecucion de izajes con gruas, plumas, camiones pluma, tecles, aparejos, eslingas, grilletes, ganchos y elementos de amarre.",
      etapaObra: "Maniobras criticas de levante",
      contextoTecnico: "durante izaje de cargas con gruas, aparejos, elementos de amarre, rigger, senalero y zonas bajo carga suspendida",
      palabrasClaveActividad: ["izaje", "grua", "eslinga", "grillete", "rigger", "carga suspendida"],
      familiasPreventivasRelacionadas: ["izaje_gruas_amarre", "trabajos_criticos", "seguridad_trabajadores", "mantencion_certificacion"],
      desviacionesFrecuentes: ["paso_bajo_carga_suspendida", "maniobra_izaje_fuera_control", "incumplimiento_control_critico"],
      documentosFrecuentesAplicables: documentosIzajeLogistica,
      documentosQueNoAplicanPorDefecto: ["HDS/SDS si no hay sustancias", "PTS si no corresponde maniobra critica de izaje"],
      preguntasEstrategicasSugeridas: [
        "La maniobra cuenta con plan de izaje, equipo, operador, rigger y aparejos verificados?",
        "La carga suspendida tiene zona de exclusion y nadie permanece bajo la linea de fuego?",
        "El viento, terreno, radio de grua y centro de gravedad permiten ejecutar la maniobra?",
        "Los elementos de amarre tienen certificacion, capacidad y condicion compatible con la carga?",
        "La desviacion requiere detener inmediatamente el izaje y revalidar controles criticos?",
      ],
      erroresQueDebeEvitarElMotor: ["No tratar izaje como traslado de material simple si existe carga suspendida, aparejo, grua, rigger o persona bajo linea de fuego."],
      bibliotecasSecundariasRelacionadas: ["maquinaria_instalaciones", "senalizacion_segregacion", "clima_entorno"],
      definicionesRiesgo: crearTemasBloqueE("maniobra de izaje", ["izaje", "grua", "carga suspendida"]),
    },
    {
      id: "bodegas_acopios_almacenamiento_materiales",
      nombreVisible: "Bodegas, acopios y almacenamiento de materiales",
      descripcionActividad:
        "Almacenamiento, ordenamiento, retiro, segregacion, control de pasillos, estanterias, bodegas, patios de acopio y materiales en espera de uso.",
      etapaObra: "Bodegaje, acopios y control de materiales",
      contextoTecnico: "durante almacenamiento en bodegas, patios de acopio, estanterias, pasillos y zonas de retiro de materiales",
      palabrasClaveActividad: ["bodega", "acopio", "almacenamiento", "estanteria", "pasillo", "materiales"],
      familiasPreventivasRelacionadas: ["orden_aseo_housekeeping", "dano_material", "sustancias_hds", "senalizacion_segregacion"],
      desviacionesFrecuentes: ["condicion_insegura", "dano_material", "falla_supervision_control_operacional"],
      documentosFrecuentesAplicables: ["Matriz de riesgos vigente", "HDS/SDS si hay sustancias peligrosas", "Registro o criterio de almacenamiento si aplica"],
      documentosQueNoAplicanPorDefecto: documentosNoLogisticaSimple,
      preguntasEstrategicasSugeridas: [
        "El acopio o bodega mantiene estabilidad, pasillos libres y segregacion por compatibilidad?",
        "Existen materiales con riesgo de caida, corte, inflamabilidad, derrame o bloqueo de emergencia?",
        "La documentacion requerida corresponde a sustancia, certificacion o almacenamiento critico y no a orden simple?",
        "La condicion requiere reordenar, retirar, contener, rotular o restringir acceso?",
        "El almacenamiento afecta rutas de evacuacion, equipos de emergencia o continuidad operacional?",
      ],
      erroresQueDebeEvitarElMotor: ["No sobredocumentar acopios simples, pero no omitir HDS/SDS, contencion o segregacion cuando hay sustancias, inflamables o materiales inestables."],
      bibliotecasSecundariasRelacionadas: ["medio_ambiente", "equipos_emergencia", "ergonomia_manejo_manual"],
      definicionesRiesgo: crearTemasBloqueE("bodega o acopio", ["bodega", "acopio", "almacenamiento"]),
    },
    {
      id: "logistica_interna_rutas_circulacion_interaccion_peaton_equipo",
      nombreVisible: "Logistica interna, rutas de circulacion e interaccion peaton-equipo",
      descripcionActividad:
        "Planificacion y control de rutas internas, cruces, accesos, circulacion de peatones, equipos, vehiculos, materiales y frentes simultaneos.",
      etapaObra: "Logistica interna y circulacion de obra",
      contextoTecnico: "durante logistica interna de obra con rutas de circulacion, peatones, equipos moviles, cruces, accesos y cambios de flujo",
      palabrasClaveActividad: ["logistica", "ruta", "circulacion", "peaton", "equipo", "maniobra"],
      familiasPreventivasRelacionadas: ["senalizacion_segregacion", "vehiculos_transporte", "maquinaria_instalaciones", "seguridad_trabajadores"],
      desviacionesFrecuentes: ["transito_interno_inseguro", "interaccion_insegura_peaton_vehiculo_maquinaria", "evasion_barreras_senalizacion_segregacion"],
      documentosFrecuentesAplicables: documentosMaquinariaLogistica,
      documentosQueNoAplicanPorDefecto: documentosNoLogisticaSimple,
      preguntasEstrategicasSugeridas: [
        "La ruta interna separa peatones, vehiculos, maquinaria y zonas de acopio?",
        "La senalizacion, barreras y cambios de ruta son visibles, vigentes y respetados?",
        "Existe interaccion de linea de fuego, punto ciego, cruce o maniobra simultanea?",
        "La superficie, iluminacion, polvo o clima permite circular sin perdida de control?",
        "La condicion requiere redisenar ruta, detener flujo, segregar o comunicar cambio operacional?",
      ],
      erroresQueDebeEvitarElMotor: ["No evaluar logistica interna solo como senaletica si hay interaccion peaton-equipo, ruta alterada, punto ciego o cambio de flujo no comunicado."],
      bibliotecasSecundariasRelacionadas: ["clima_entorno", "orden_aseo_housekeeping", "trabajos_criticos"],
      definicionesRiesgo: crearTemasBloqueE("logistica interna", ["logistica", "ruta", "circulacion"]),
    },
    {
      id: "mantencion_inspeccion_preoperacional_equipos_moviles",
      nombreVisible: "Mantencion e inspeccion preoperacional de equipos moviles",
      descripcionActividad:
        "Revision diaria, mantencion preventiva o correctiva, retiro de servicio, bloqueo, prueba funcional y liberacion de equipos moviles y vehiculos de obra.",
      etapaObra: "Mantencion, inspeccion y liberacion operacional",
      contextoTecnico: "durante mantencion, inspeccion preoperacional, prueba, retiro de servicio y liberacion de equipos moviles de obra",
      palabrasClaveActividad: ["mantencion", "inspeccion", "preoperacional", "checklist", "equipo movil", "falla"],
      familiasPreventivasRelacionadas: ["mantencion_certificacion", "maquinaria_instalaciones", "energia_loto_electrico", "vehiculos_transporte"],
      desviacionesFrecuentes: ["herramienta_equipo_mal_estado_usado_terreno", "control_critico_ausente_no_verificado", "omision_documental"],
      documentosFrecuentesAplicables: ["Inspeccion preoperacional", "Registro de mantencion", "Bloqueo/LOTO si hay intervencion de energia o partes moviles"],
      documentosQueNoAplicanPorDefecto: documentosNoLogisticaSimple,
      preguntasEstrategicasSugeridas: [
        "El equipo movil tiene inspeccion preoperacional, mantencion y fallas cerradas antes de operar?",
        "La intervencion requiere bloqueo, retiro de servicio o control de energia residual?",
        "La prueba posterior a mantencion se realiza en area segregada y con responsable definido?",
        "La falla afecta frenos, direccion, luces, hidraulica, alarma, neumaticos o control critico?",
        "La condicion requiere etiquetar, bloquear, reparar o impedir el uso del equipo?",
      ],
      erroresQueDebeEvitarElMotor: ["No tratar una falla de equipo movil como documento menor si el equipo sigue disponible para uso o requiere retiro de servicio."],
      bibliotecasSecundariasRelacionadas: ["seguridad_trabajadores", "senalizacion_segregacion", "dano_material"],
      definicionesRiesgo: crearTemasBloqueE("mantencion de equipo movil", ["mantencion", "preoperacional", "equipo movil"]),
    },
  ];
}

function crearTemasBloqueF(objetoAmbiental: string, palabrasOperacion: string[]): TemaRiesgoBloqueF[] {
  return [
    temaF("hds_inexistente", `HDS/SDS inexistente en ${objetoAmbiental}`, `${objetoAmbiental} involucra producto, sustancia, residuo o insumo sin HDS/SDS identificable para orientar manipulacion, respuesta y controles`, [...palabrasOperacion, "hds", "sds"], "vapores_quimicos", objetoAmbiental, "HDS/SDS inexistente"),
    temaF("hds_no_disponible_terreno", `HDS/SDS no disponible en terreno en ${objetoAmbiental}`, `${objetoAmbiental} mantiene sustancia o producto en uso sin ficha disponible para trabajadores, supervisor o respuesta ante emergencia`, [...palabrasOperacion, "hds terreno"], "vapores_quimicos", objetoAmbiental, "HDS/SDS no disponible"),
    temaF("hds_desactualizada", `HDS/SDS desactualizada en ${objetoAmbiental}`, `${objetoAmbiental} utiliza ficha antigua, incompleta o no correspondiente al producto observado en terreno`, [...palabrasOperacion, "hds desactualizada"], "vapores_quimicos", objetoAmbiental, "HDS/SDS desactualizada"),
    temaF("sustancia_sin_rotulacion", `Sustancia sin rotulacion en ${objetoAmbiental}`, `${objetoAmbiental} presenta envase, contenedor o producto secundario sin nombre, peligro, responsable, fecha o advertencia visible`, [...palabrasOperacion, "rotulacion"], "rotulacion_identificacion", "envase o contenedor", "sin rotulacion"),
    temaF("envase_no_certificado", `Envase no certificado en ${objetoAmbiental}`, `${objetoAmbiental} usa recipiente sin aptitud demostrable para contener sustancia, combustible, residuo o producto peligroso`, [...palabrasOperacion, "envase certificado"], "rotulacion_identificacion", "envase", "no certificado"),
    temaF("envase_inadecuado", `Envase inadecuado en ${objetoAmbiental}`, `${objetoAmbiental} conserva producto en botella, balde, tarro, bidon o recipiente incompatible con el contenido`, [...palabrasOperacion, "envase inadecuado"], "rotulacion_identificacion", "envase", "inadecuado"),
    temaF("bidon_no_autorizado", `Bidon no autorizado en ${objetoAmbiental}`, `${objetoAmbiental} emplea bidon no autorizado, reutilizado o sin cierre seguro para producto peligroso`, [...palabrasOperacion, "bidon"], "gas_combustible", "bidon", "no autorizado", "alto"),
    temaF("gasolina_recipiente_improvisado", `Gasolina en recipiente improvisado en ${objetoAmbiental}`, `${objetoAmbiental} mantiene gasolina o combustible en envase sin certificacion, rotulo, cierre o compatibilidad`, [...palabrasOperacion, "gasolina", "recipiente"], "gas_combustible", "combustible", "recipiente improvisado", "alto"),
    temaF("inflamable_fuente_ignicion", `Inflamable cerca de fuente de ignicion en ${objetoAmbiental}`, `${objetoAmbiental} ubica producto inflamable cerca de chispa, tablero, llama, equipo caliente, soldadura o fumador`, [...palabrasOperacion, "inflamable", "ignicion"], "gas_combustible", "inflamable", "cerca de ignicion", "alto"),
    temaF("almacenamiento_incompatible", `Almacenamiento incompatible en ${objetoAmbiental}`, `${objetoAmbiental} mezcla sustancias, residuos, combustibles, oxidantes, envases o materiales sin compatibilidad verificada`, [...palabrasOperacion, "compatibilidad"], "vapores_quimicos", "almacenamiento", "incompatible"),
    temaF("contencion_secundaria_ausente", `Contencion secundaria ausente en ${objetoAmbiental}`, `${objetoAmbiental} mantiene liquidos, combustibles, quimicos o residuos sin bandeja, pretil, cubeto o control de escurrimiento`, [...palabrasOperacion, "contencion secundaria"], "fuga_fluidos", "contencion secundaria", "ausente"),
    temaF("derrame_suelo", `Derrame al suelo en ${objetoAmbiental}`, `${objetoAmbiental} presenta liquido, lodo, aceite, combustible, pintura o quimico derramado directamente sobre suelo`, [...palabrasOperacion, "derrame suelo"], "fuga_fluidos", "suelo", "derrame activo", "alto"),
    temaF("derrame_drenaje", `Derrame hacia drenaje en ${objetoAmbiental}`, `${objetoAmbiental} permite que liquido o residuo alcance canaleta, sumidero, drenaje, rejilla o descarga`, [...palabrasOperacion, "drenaje"], "fuga_fluidos", "drenaje", "expuesto a derrame", "alto"),
    temaF("derrame_curso_agua", `Derrame cercano a curso de agua en ${objetoAmbiental}`, `${objetoAmbiental} se ubica cerca de cauce, acequia, canal, alcantarilla o escorrentia con potencial de arrastre`, [...palabrasOperacion, "curso de agua"], "fuga_fluidos", "curso de agua", "amenazado por derrame", "alto"),
    temaF("kit_derrame_ausente", `Kit de derrame ausente en ${objetoAmbiental}`, `${objetoAmbiental} opera con liquidos o sustancias sin kit, absorbente, pala, bolsas, barrera o medio de contencion disponible`, [...palabrasOperacion, "kit derrame"], "segregacion_senalizacion", "kit de derrame", "ausente"),
    temaF("absorbente_insuficiente", `Material absorbente insuficiente en ${objetoAmbiental}`, `${objetoAmbiental} requiere responder a derrame pero dispone de absorbente insuficiente, vencido, contaminado o no compatible`, [...palabrasOperacion, "absorbente"], "segregacion_senalizacion", "material absorbente", "insuficiente"),
    temaF("residuo_peligroso_mal_segregado", `Residuo peligroso mal segregado en ${objetoAmbiental}`, `${objetoAmbiental} deposita residuo contaminado, inflamable, aceitoso, quimico o cortopunzante junto a residuos comunes`, [...palabrasOperacion, "residuo peligroso"], "fuga_fluidos", "residuo peligroso", "mal segregado"),
    temaF("residuo_comun_mezclado", `Residuo comun mezclado con peligroso en ${objetoAmbiental}`, `${objetoAmbiental} mezcla residuos comunes con material contaminado, envases, trapos, solventes, pinturas o combustibles`, [...palabrasOperacion, "residuo comun"], "fuga_fluidos", "residuos mezclados", "sin segregacion"),
    temaF("contenedor_sin_rotulacion", `Contenedor sin rotulacion en ${objetoAmbiental}`, `${objetoAmbiental} usa contenedor, tambor, bolsa, jaula o recipiente sin identificacion de residuo o peligro`, [...palabrasOperacion, "contenedor"], "rotulacion_identificacion", "contenedor", "sin rotulacion"),
    temaF("contenedor_sobrellenado", `Contenedor sobrellenado en ${objetoAmbiental}`, `${objetoAmbiental} mantiene contenedor de residuos o producto sobre capacidad, con caida, rebalse o perdida de control`, [...palabrasOperacion, "sobrellenado"], "caida_mismo_nivel", "contenedor", "sobrellenado"),
    temaF("acopio_residuos_sin_control", `Acopio de residuos sin control en ${objetoAmbiental}`, `${objetoAmbiental} acumula residuos sin orden, segregacion, retiro, control de acceso o proteccion ambiental`, [...palabrasOperacion, "acopio residuos"], "caida_mismo_nivel", "acopio de residuos", "sin control"),
    temaF("retiro_autorizado_no_verificado", `Retiro autorizado no verificado en ${objetoAmbiental}`, `${objetoAmbiental} conserva residuo o material contaminado sin trazabilidad de retiro autorizado cuando corresponde`, [...palabrasOperacion, "retiro autorizado"], "autorizacion_documental", "retiro de residuos", "no verificado"),
    temaF("material_contaminado_sin_disposicion", `Material contaminado sin disposicion en ${objetoAmbiental}`, `${objetoAmbiental} deja tierra, absorbente, trapo, EPP, envase o residuo contaminado sin manejo definido`, [...palabrasOperacion, "contaminado"], "fuga_fluidos", "material contaminado", "sin disposicion"),
    temaF("polvo_suspension", `Polvo en suspension en ${objetoAmbiental}`, `${objetoAmbiental} genera polvo visible que afecta respiracion, visibilidad, equipos, terceros o entorno cercano`, [...palabrasOperacion, "polvo"], "perforacion_polvo", "polvo en suspension", "sin control"),
    temaF("ruido_ambiental", `Ruido ambiental no controlado en ${objetoAmbiental}`, `${objetoAmbiental} genera ruido por equipo, descarga, herramienta, golpe o proceso sin mitigacion ni aviso`, [...palabrasOperacion, "ruido"], "ruido_vibracion", "ruido ambiental", "no controlado"),
    temaF("vapores_emisiones_humos", `Vapores, humos o emisiones en ${objetoAmbiental}`, `${objetoAmbiental} produce vapores, humo, olor, emision o atmosfera molesta sin ventilacion ni control`, [...palabrasOperacion, "vapores", "emisiones"], "vapores_quimicos", "emisiones o vapores", "sin control"),
    temaF("escorrentia_sedimentos", `Escorrentia con sedimentos en ${objetoAmbiental}`, `${objetoAmbiental} permite arrastre de barro, sedimento, lechada o material fino hacia rutas, drenajes o exterior`, [...palabrasOperacion, "escorrentia", "sedimentos"], "aguas_residuales", "escorrentia", "con sedimentos"),
    temaF("agua_acumulada_contaminada", `Agua acumulada contaminada en ${objetoAmbiental}`, `${objetoAmbiental} mantiene agua con aceite, sedimento, residuo, quimico o material sin contencion ni retiro`, [...palabrasOperacion, "agua acumulada"], "aguas_residuales", "agua acumulada", "contaminada"),
    temaF("exposicion_dermica_quimica", `Exposicion dermica a quimico en ${objetoAmbiental}`, `${objetoAmbiental} expone piel de trabajadores a sustancia, combustible, residuo, solvente o producto sin guantes compatibles`, [...palabrasOperacion, "contacto dermico"], "vapores_quimicos", "piel expuesta", "sin proteccion compatible"),
    temaF("salpicadura_ocular_quimica", `Salpicadura ocular en ${objetoAmbiental}`, `${objetoAmbiental} puede proyectar liquido, quimico, combustible, residuo o material contaminante hacia rostro u ojos`, [...palabrasOperacion, "salpicadura ocular"], "vapores_quimicos", "ojos o rostro", "expuestos"),
    temaF("ventilacion_insuficiente", `Ventilacion insuficiente en ${objetoAmbiental}`, `${objetoAmbiental} se realiza en recinto, bodega, contenedor o zona cerrada con vapores o inflamables`, [...palabrasOperacion, "ventilacion"], "ventilacion_deficiente", "ventilacion", "insuficiente"),
    temaF("equipo_emergencia_deficiente", `Equipo de emergencia deficiente en ${objetoAmbiental}`, `${objetoAmbiental} requiere extintor, red humeda, alarma, ducha, lavaojos o kit y el recurso esta ausente, obstruido o vencido`, [...palabrasOperacion, "emergencia", "extintor"], "mantencion_certificacion", "equipo de emergencia", "deficiente", "alto"),
  ];
}

function crearActividadesBloqueF(): ActividadBloqueF[] {
  return [
    {
      id: "sustancias_peligrosas_hds_rotulacion_almacenamiento",
      nombreVisible: "Sustancias peligrosas, HDS/SDS, rotulacion y almacenamiento",
      descripcionActividad:
        "Uso, identificacion, manipulacion, almacenamiento y control de sustancias peligrosas, productos quimicos, HDS/SDS, envases secundarios y compatibilidad.",
      etapaObra: "Gestion ambiental, quimica y preventiva",
      contextoTecnico: "durante manejo de sustancias peligrosas, HDS/SDS, rotulacion, envases secundarios, compatibilidad, manipulacion y almacenamiento temporal",
      palabrasClaveActividad: ["sustancia peligrosa", "hds", "sds", "rotulacion", "quimico", "almacenamiento"],
      familiasPreventivasRelacionadas: ["sustancias_hds", "medio_ambiente", "higiene_ocupacional", "documental_legal"],
      desviacionesFrecuentes: ["omision_documental", "condicion_insegura", "incumplimiento_legal_documental_probable"],
      documentosFrecuentesAplicables: documentosAmbientalesQuimicos,
      documentosQueNoAplicanPorDefecto: documentosNoAmbientalSimple,
      preguntasEstrategicasSugeridas: [
        "Existe HDS/SDS disponible, vigente y correspondiente a la sustancia observada?",
        "El envase esta rotulado, cerrado y es compatible con el producto?",
        "Existe riesgo de contacto dermico, ocular, inhalacion, derrame o incompatibilidad?",
        "La sustancia tiene contencion secundaria, ventilacion y control de acceso cuando corresponde?",
        "La condicion requiere detener, rotular, retirar, ventilar, contener o regularizar documentacion?",
      ],
      erroresQueDebeEvitarElMotor: ["No pedir PTS como control principal si la desviacion se resuelve con HDS/SDS, rotulacion, contencion, ventilacion o segregacion."],
      bibliotecasSecundariasRelacionadas: ["capacitacion_evidencias", "senalizacion_segregacion", "equipos_emergencia"],
      definicionesRiesgo: crearTemasBloqueF("manejo de sustancias peligrosas", ["sustancia peligrosa", "hds", "quimico"]),
    },
    {
      id: "combustibles_inflamables_trasvasije_envases",
      nombreVisible: "Combustibles, inflamables, trasvasije y envases",
      descripcionActividad:
        "Manejo de combustibles, inflamables, trasvasije, bidones, recipientes, abastecimiento menor, almacenamiento temporal y control de fuentes de ignicion.",
      etapaObra: "Combustibles e inflamables",
      contextoTecnico: "durante manejo de combustibles, inflamables, trasvasije, bidones, recipientes, abastecimiento menor, ventilacion y fuentes de ignicion",
      palabrasClaveActividad: ["combustible", "inflamable", "trasvasije", "bidon", "gasolina", "ignicion"],
      familiasPreventivasRelacionadas: ["sustancias_hds", "equipos_emergencia", "medio_ambiente", "seguridad_trabajadores"],
      desviacionesFrecuentes: ["condicion_insegura", "incumplimiento_control_critico", "evento_ambiental"],
      documentosFrecuentesAplicables: ["HDS/SDS vigente si hay combustible o inflamable", "Matriz de riesgos vigente", "Registro o autorizacion de almacenamiento si aplica"],
      documentosQueNoAplicanPorDefecto: documentosNoAmbientalSimple,
      preguntasEstrategicasSugeridas: [
        "El combustible esta en envase certificado, rotulado, cerrado y compatible?",
        "Existe fuente de ignicion, baja ventilacion o acumulacion de vapores cerca del producto?",
        "La zona cuenta con extintor, contencion secundaria y kit de respuesta cuando corresponde?",
        "El trasvasije se realiza evitando derrames, salpicaduras, vapores y recipientes improvisados?",
        "La condicion requiere detener, retirar inflamables, contener, ventilar o controlar ignicion?",
      ],
      erroresQueDebeEvitarElMotor: ["No clasificar gasolina en bidon improvisado como simple orden y aseo si existe inflamabilidad, derrame o fuente de ignicion."],
      bibliotecasSecundariasRelacionadas: ["equipos_emergencia", "senalizacion_segregacion", "mantencion_certificacion"],
      definicionesRiesgo: crearTemasBloqueF("manejo de combustibles e inflamables", ["combustible", "inflamable", "trasvasije"]),
    },
    {
      id: "residuos_peligrosos_no_peligrosos_segregacion_disposicion",
      nombreVisible: "Residuos peligrosos y no peligrosos, segregacion y disposicion",
      descripcionActividad:
        "Generacion, segregacion, almacenamiento temporal, rotulacion, retiro, disposicion y trazabilidad de residuos comunes, industriales y peligrosos.",
      etapaObra: "Gestion de residuos",
      contextoTecnico: "durante segregacion, almacenamiento temporal, rotulacion, retiro y disposicion de residuos peligrosos y no peligrosos en obra",
      palabrasClaveActividad: ["residuo", "segregacion", "disposicion", "contenedor", "retiro", "peligroso"],
      familiasPreventivasRelacionadas: ["medio_ambiente", "orden_aseo_housekeeping", "sustancias_hds", "documental_legal"],
      desviacionesFrecuentes: ["evento_ambiental", "condicion_insegura", "incumplimiento_legal_documental_probable"],
      documentosFrecuentesAplicables: ["Registro de retiro si corresponde", "HDS/SDS si el residuo proviene de sustancia peligrosa", "Matriz de riesgos vigente"],
      documentosQueNoAplicanPorDefecto: documentosNoAmbientalSimple,
      preguntasEstrategicasSugeridas: [
        "El residuo esta segregado, rotulado y contenido segun su tipo?",
        "Existe mezcla entre residuo comun, peligroso, contaminado o material reciclable?",
        "El almacenamiento temporal evita rebalse, derrame, acceso no autorizado o arrastre ambiental?",
        "Corresponde retiro autorizado, registro o trazabilidad para el residuo observado?",
        "La condicion requiere retirar, segregar, rotular, contener o limpiar de inmediato?",
      ],
      erroresQueDebeEvitarElMotor: ["No exigir documentacion compleja para residuo comun simple, pero no omitir trazabilidad cuando existe residuo peligroso o contaminado."],
      bibliotecasSecundariasRelacionadas: ["capacitacion_evidencias", "senalizacion_segregacion", "dano_material"],
      definicionesRiesgo: crearTemasBloqueF("gestion de residuos", ["residuo", "segregacion", "disposicion"]),
    },
    {
      id: "derrames_contencion_limpieza_suelo_agua",
      nombreVisible: "Derrames, contencion, limpieza, suelo y agua",
      descripcionActividad:
        "Respuesta, contencion, limpieza y control de derrames sobre suelo, rutas, drenajes, agua acumulada, cursos de agua o superficies de trabajo.",
      etapaObra: "Control de derrames y proteccion ambiental",
      contextoTecnico: "durante control de derrames, contencion, limpieza, proteccion de suelo, drenajes, agua, rutas y material contaminado",
      palabrasClaveActividad: ["derrame", "contencion", "suelo", "agua", "drenaje", "limpieza"],
      familiasPreventivasRelacionadas: ["medio_ambiente", "sustancias_hds", "orden_aseo_housekeeping", "equipos_emergencia"],
      desviacionesFrecuentes: ["evento_ambiental", "condicion_insegura", "control_critico_ausente_no_verificado"],
      documentosFrecuentesAplicables: documentosAmbientalesQuimicos,
      documentosQueNoAplicanPorDefecto: documentosNoAmbientalSimple,
      preguntasEstrategicasSugeridas: [
        "El derrame alcanzo suelo, drenaje, agua, ruta de transito o material absorbente?",
        "Existe kit de derrame, contencion secundaria, barrera o absorbente suficiente?",
        "El material contaminado fue retirado, segregado y dispuesto de manera controlada?",
        "Se requiere comunicar, registrar o escalar el evento por impacto ambiental?",
        "La condicion exige detener la actividad hasta contener y limpiar completamente?",
      ],
      erroresQueDebeEvitarElMotor: ["No tratar un derrame activo como aseo simple si alcanza suelo, agua, drenaje, inflamables o exposicion de trabajadores."],
      bibliotecasSecundariasRelacionadas: ["senalizacion_segregacion", "capacitacion_evidencias", "dano_material"],
      definicionesRiesgo: crearTemasBloqueF("control de derrames", ["derrame", "contencion", "suelo"]),
    },
    {
      id: "emergencias_equipos_respuesta_extintores_red_humeda_kit_derrame",
      nombreVisible: "Emergencias, equipos de respuesta, extintores, red humeda y kit de derrame",
      descripcionActividad:
        "Disponibilidad, acceso, inspeccion y operatividad de equipos de emergencia, extintores, red humeda, gabinetes, alarmas, botiquines y kit de derrame.",
      etapaObra: "Preparacion y respuesta a emergencia",
      contextoTecnico: "durante verificacion de equipos de emergencia, extintores, red humeda, gabinetes, alarmas, botiquines, duchas, lavaojos y kit de derrame",
      palabrasClaveActividad: ["emergencia", "extintor", "red humeda", "kit derrame", "alarma", "botiquin"],
      familiasPreventivasRelacionadas: ["equipos_emergencia", "emergencias_reales", "senalizacion_segregacion", "mantencion_certificacion"],
      desviacionesFrecuentes: ["control_critico_ausente_no_verificado", "condicion_insegura", "incumplimiento_legal_documental_probable"],
      documentosFrecuentesAplicables: documentosEmergenciaAmbiental,
      documentosQueNoAplicanPorDefecto: ["PTS si solo corresponde despejar acceso o reponer senalizacion", "HDS/SDS si no hay sustancia peligrosa"],
      preguntasEstrategicasSugeridas: [
        "El equipo de emergencia esta visible, accesible, senalizado, vigente y operativo?",
        "El acceso al extintor, gabinete, red humeda, botiquin o kit esta libre de obstaculos?",
        "La condicion afecta respuesta ante incendio, derrame, lesion, salpicadura o evacuacion?",
        "Existe inspeccion, mantencion o registro vigente cuando corresponde?",
        "La desviacion requiere despejar, reemplazar, mantener, senalizar o retirar de servicio?",
      ],
      erroresQueDebeEvitarElMotor: ["No tratar extintor vencido u obstruido como incendio activo, pero tampoco como hallazgo menor si compromete respuesta de emergencia."],
      bibliotecasSecundariasRelacionadas: ["sustancias_hds", "medio_ambiente", "capacitacion_evidencias"],
      definicionesRiesgo: crearTemasBloqueF("equipos de respuesta a emergencia", ["emergencia", "extintor", "kit derrame"]),
    },
    {
      id: "bodegas_quimicos_compatibilidad_control_acceso",
      nombreVisible: "Bodegas de quimicos, compatibilidad y control de acceso",
      descripcionActividad:
        "Almacenamiento de productos quimicos, sustancias peligrosas, inflamables, residuos, inventario, ventilacion, compatibilidad, contencion y acceso restringido.",
      etapaObra: "Bodegaje quimico y control de sustancias",
      contextoTecnico: "durante almacenamiento en bodega de quimicos, compatibilidad, ventilacion, control de acceso, inventario, contencion y envases cerrados",
      palabrasClaveActividad: ["bodega quimicos", "compatibilidad", "control acceso", "ventilacion", "inventario", "envases"],
      familiasPreventivasRelacionadas: ["sustancias_hds", "medio_ambiente", "senalizacion_segregacion", "documental_legal"],
      desviacionesFrecuentes: ["condicion_insegura", "omision_documental", "incumplimiento_legal_documental_probable"],
      documentosFrecuentesAplicables: documentosAmbientalesQuimicos,
      documentosQueNoAplicanPorDefecto: documentosNoAmbientalSimple,
      preguntasEstrategicasSugeridas: [
        "La bodega mantiene compatibilidad, ventilacion, rotulacion y contencion secundaria?",
        "Existe control de acceso e inventario de sustancias o residuos peligrosos?",
        "Los envases permanecen cerrados, en buen estado y sobre estanterias compatibles?",
        "La bodega cuenta con HDS/SDS, kit, extintor y senalizacion cuando corresponde?",
        "La condicion requiere restringir acceso, ventilar, contener, reordenar o retirar producto?",
      ],
      erroresQueDebeEvitarElMotor: ["No evaluar bodega quimica como acopio comun si hay compatibilidad, ventilacion, HDS/SDS, inflamables o control de acceso comprometido."],
      bibliotecasSecundariasRelacionadas: ["equipos_emergencia", "orden_aseo_housekeeping", "mantencion_certificacion"],
      definicionesRiesgo: crearTemasBloqueF("bodega de quimicos", ["bodega quimicos", "compatibilidad", "ventilacion"]),
    },
    {
      id: "control_ambiental_obra_polvo_ruido_emisiones_escorrentias",
      nombreVisible: "Control ambiental de obra, polvo, ruido, emisiones y escorrentias",
      descripcionActividad:
        "Control ambiental de polvo, ruido, emisiones, barro, sedimentos, escorrentias, agua acumulada, limpieza de rutas y proteccion de suelo, aire y agua.",
      etapaObra: "Control ambiental operacional",
      contextoTecnico: "durante control ambiental de obra con polvo, ruido, emisiones, escorrentias, barro, sedimentos, agua acumulada y limpieza de rutas",
      palabrasClaveActividad: ["polvo", "ruido", "emisiones", "escorrentia", "barro", "sedimentos"],
      familiasPreventivasRelacionadas: ["medio_ambiente", "higiene_ocupacional", "clima_entorno", "orden_aseo_housekeeping"],
      desviacionesFrecuentes: ["evento_ambiental", "condicion_insegura", "falla_supervision_control_operacional"],
      documentosFrecuentesAplicables: ["Matriz de riesgos vigente", "Registro ambiental si aplica", "Plan o medida de control ambiental si corresponde"],
      documentosQueNoAplicanPorDefecto: documentosNoAmbientalSimple,
      preguntasEstrategicasSugeridas: [
        "La actividad genera polvo, ruido, emisiones, barro, sedimentos o escorrentia fuera de control?",
        "El impacto alcanza trabajadores, comunidad, rutas, drenajes, suelo, agua o aire?",
        "Existen medidas de humectacion, limpieza, contencion, barrera, retiro o mitigacion?",
        "La condicion requiere registro ambiental, comunicacion o seguimiento por responsable?",
        "Se debe detener o ajustar la actividad hasta recuperar control ambiental?",
      ],
      erroresQueDebeEvitarElMotor: ["No convertir todo control ambiental en papeleo; primero evaluar contencion, limpieza, humectacion, barrera, retiro o mitigacion efectiva."],
      bibliotecasSecundariasRelacionadas: ["seguridad_trabajadores", "senalizacion_segregacion", "capacitacion_evidencias"],
      definicionesRiesgo: crearTemasBloqueF("control ambiental de obra", ["control ambiental", "polvo", "escorrentia"]),
    },
  ];
}

const PLANTILLAS_RIESGO: PlantillaRiesgo[] = [
  plantilla("caida_mismo_nivel", "Caida al mismo nivel por circulacion deficiente", "Superficie de transito con desniveles menores, materiales, barro o elementos sueltos {contexto}. La exposicion alcanza a trabajadores, visitas o equipos menores que circulan cerca de la actividad. La consecuencia probable es caida, golpe o torcedura, por lo que se espera ordenar, limpiar, segregar y mantener ruta segura antes de continuar.", ["caida", "tropiezo", "transito", "ruta"], "seguridad_personas", "desplazamiento por ruta no controlada", "superficie con obstaculos o desnivel", "ruta de circulacion", "obstaculo o superficie irregular", "trabajadores en desplazamiento", "caida mismo nivel o golpe", "ruta segura no verificada", ["retiro de obstaculos", "limpieza", "segregacion", "senalizacion"], "Retirar obstaculos, limpiar la ruta y delimitar el sector hasta dejar circulacion segura.", [], documentosNoSimples, ["orden_aseo_housekeeping", "seguridad_trabajadores"], ["condicion_insegura"], "medio", ["La ruta es usada por trabajadores o maquinaria?", "Existe alternativa segura de circulacion?"], ["Preguntar por PTS como requisito principal si basta limpieza o retiro."], "No convertir una condicion simple de transito en brecha documental principal."),
  plantilla("caida_distinto_nivel", "Caida a distinto nivel por borde o abertura", "Borde, excavacion, vano, plataforma o desnivel sin control fisico suficiente {contexto}. La exposicion involucra trabajadores proximos al borde o rutas cercanas, con consecuencia probable de caida grave. Se espera detener el acercamiento, instalar barrera, tapa, baranda o linea de vida y verificar autorizacion si corresponde trabajo en altura.", ["borde", "abertura", "altura", "desnivel"], "trabajo_critico", "acercamiento a borde sin control", "borde o abertura sin proteccion", "borde o abertura", "proteccion ausente", "trabajadores expuestos a altura o desnivel", "caida a distinto nivel", "proteccion perimetral ausente", ["barrera rigida", "baranda", "tapa resistente", "linea de vida si aplica"], "Detener exposicion al borde, segregar y colocar proteccion fisica antes de continuar.", ["AST/ART", "PTS si es trabajo en altura", "Matriz de riesgos"], ["HDS/SDS si no hay sustancias"], ["trabajos_criticos", "seguridad_trabajadores", "senalizacion_segregacion"], ["control_critico_ausente_no_verificado", "condicion_insegura"], "alto", ["Existe exposicion directa al borde?", "La actividad requiere permiso o autorizacion de altura?"], ["Tratar borde abierto como simple orden y aseo."], "No omitir control critico cuando existe exposicion a caida grave."),
  plantilla("golpe_caida_material", "Golpe por caida o proyeccion de material", "Material, pieza, herramienta o elemento temporal puede caer, desplazarse o proyectarse {contexto}. La exposicion se presenta para trabajadores ubicados bajo, junto o dentro del radio de accion. La consecuencia probable es golpe, contusion o lesion grave, por lo que se espera asegurar el elemento, restringir acceso y verificar metodo de traslado o fijacion.", ["golpe", "caida de material", "proyeccion"], "seguridad_personas", "ubicacion en linea de caida", "material sin asegurar", "material o pieza", "posible caida o proyeccion", "personas cercanas al radio de accion", "golpeado por material", "aseguramiento o segregacion faltante", ["aseguramiento", "radio de exclusion", "ordenamiento", "control de herramientas"], "Asegurar material, retirar personas del radio de accion y delimitar el sector.", ["AST/ART si hay maniobra en ejecucion"], documentosNoSimples, ["seguridad_trabajadores", "orden_aseo_housekeeping"], ["condicion_insegura", "exposicion_linea_fuego"], "medio", ["Existe material sobre nivel o sin asegurar?", "Hay personas dentro del radio de caida?"], ["Clasificar siempre como dano material sin revisar exposicion."], "No ignorar linea de fuego cuando hay material suspendido o inestable."),
  plantilla("atrapamiento", "Atrapamiento por equipos, paneles o partes moviles", "Equipo, panel, pieza, moldaje, maquinaria o elemento movil presenta punto de atrapamiento {contexto}. La exposicion ocurre durante ajuste, traslado, montaje, retiro o cercania operacional. La consecuencia probable es atrapamiento de manos, extremidades o cuerpo, por lo que se espera detener, aislar energia o movimiento, instalar guarda y definir metodo seguro.", ["atrapamiento", "partes moviles", "panel"], "seguridad_personas", "intervencion o proximidad a punto de atrapamiento", "parte movil o elemento sin proteccion", "equipo o elemento movil", "movimiento no controlado", "trabajador en zona de atrapamiento", "atrapamiento o aplastamiento", "guarda, bloqueo o metodo faltante", ["guarda", "bloqueo", "segregacion", "metodo de trabajo seguro"], "Detener movimiento, retirar exposicion y aplicar bloqueo o control fisico antes de intervenir.", ["AST/ART", "PTS si aplica", "Bloqueo/LOTO si hay energia"], ["Permiso de fuego si no hay fuente termica"], ["maquinaria_instalaciones", "seguridad_trabajadores", "energia_loto_electrico"], ["control_critico_ausente_no_verificado", "condicion_insegura"], "alto", ["Existe energia o movimiento residual?", "Se requiere bloqueo o detencion de actividad?"], ["Preguntar solo por EPP cuando el control principal es fisico."], "No reemplazar guarda o bloqueo por una medida administrativa debil."),
  plantilla("corte_puncion", "Corte o puncion por bordes, fierros o residuos", "Borde filoso, clavo, fierro, alambre, rebaba o residuo punzante queda expuesto {contexto}. La exposicion afecta manos, piernas o rutas de paso de trabajadores. La consecuencia probable es corte, puncion o herida, por lo que se espera retirar, cubrir, doblar, proteger o segregar el elemento antes de permitir contacto o circulacion.", ["corte", "puncion", "clavo", "fierro"], "seguridad_personas", "manipulacion o transito junto a elemento punzante", "punta o borde expuesto", "elemento cortante o punzante", "expuesto sin proteccion", "trabajadores en contacto o transito", "corte o puncion", "proteccion o retiro faltante", ["proteccion de puntas", "retiro", "orden", "EPP complementario"], "Retirar o proteger el elemento punzante y segregar el area si permanece expuesto.", [], documentosNoSimples, ["seguridad_trabajadores", "orden_aseo_housekeeping", "epp"], ["condicion_insegura"], "medio", ["El elemento esta en zona de paso o manipulacion?", "Se puede retirar o proteger de inmediato?"], ["Exigir procedimiento formal si el control es proteccion inmediata."], "No sobredocumentar un riesgo que se corrige por retiro o proteccion fisica."),
  plantilla("proyeccion_particulas", "Proyeccion de particulas por corte, golpe o limpieza", "La actividad puede proyectar particulas, rebabas, polvo, fragmentos o material suelto {contexto}. La exposicion compromete ojos, rostro o piel de trabajadores cercanos, especialmente durante corte, golpe, limpieza o ajuste. La consecuencia probable es lesion ocular o corte superficial, por lo que se espera pantalla, distancia, EPP ocular y segregacion.", ["particulas", "rebaba", "corte", "esmeril"], "seguridad_personas", "trabajo sin proteccion frente a particulas", "proyeccion sin pantalla o distancia", "herramienta o material", "proyeccion posible", "ojos y rostro de trabajadores", "lesion ocular o corte", "proteccion ocular o pantalla faltante", ["lentes", "pantalla facial", "biombo", "distancia segura"], "Suspender la tarea hasta instalar proteccion ocular, pantalla o segregacion efectiva.", ["AST/ART si hay tarea en ejecucion"], ["PTS si no es tarea critica repetitiva"], ["herramientas_equipos", "epp", "seguridad_trabajadores"], ["incumplimiento_control_critico", "acto_inseguro"], "medio", ["Hay trabajadores dentro del radio de proyeccion?", "Existe proteccion ocular o pantalla instalada?"], ["Clasificar solo como falta de EPP si tambien falta segregacion."], "No reducir la proyeccion a una eleccion personal de EPP."),
  plantilla("maquinaria_movil", "Interaccion con maquinaria movil", "Maquinaria o equipo movil opera, retrocede, gira o circula cerca de personas o zonas compartidas {contexto}. La exposicion incluye peatones, operadores y terceros dentro del radio de maniobra. La consecuencia probable es atropello, golpe o atrapamiento, por lo que se espera segregacion, senalero, ruta definida y comunicacion operacional.", ["maquinaria", "equipo movil", "retroceso", "senalero"], "operacional", "ingreso a radio de maquinaria", "circulacion sin segregacion", "maquinaria movil", "maniobra sin control segregado", "peatones y operadores", "atropello o golpe", "segregacion o senalero faltante", ["ruta segregada", "senalero", "baliza", "comunicacion radial"], "Detener maniobra si hay peatones expuestos y restablecer segregacion o senalero.", ["AST/ART", "Matriz de riesgos", "Autorizacion de operador"], ["HDS/SDS si no hay sustancias"], ["vehiculos_transporte", "maquinaria_instalaciones", "seguridad_trabajadores"], ["interaccion_insegura_peaton_vehiculo_maquinaria"], "alto", ["Existe interaccion peaton-maquinaria?", "La ruta esta segregada y senalizada?"], ["Tratarlo como dano material si no hubo contacto."], "No esperar accidente para clasificar interaccion peligrosa."),
  plantilla("excavacion_entibacion", "Excavacion sin entibacion o control de talud", "Excavacion, zanja o corte de terreno presenta profundidad, verticalidad o suelo inestable sin entibacion, talud o control equivalente {contexto}. La exposicion alcanza a trabajadores cercanos al borde o interior. La consecuencia probable es sepultamiento, caida o golpe por desprendimiento, por lo que se espera detener, evaluar estabilidad y aplicar control tecnico.", ["excavacion", "zanja", "entibacion", "talud"], "trabajo_critico", "ingreso o trabajo junto a excavacion inestable", "talud o borde sin control", "excavacion", "sin entibacion o proteccion", "trabajadores cercanos o al interior", "sepultamiento o caida", "entibacion o talud faltante", ["entibacion", "talud seguro", "barrera perimetral", "revision tecnica"], "Detener ingreso o trabajo en la excavacion hasta verificar estabilidad y control perimetral.", ["Permiso de excavacion", "AST/ART", "PTS si aplica"], ["Permiso de fuego si no hay fuente de ignicion"], ["excavaciones_suelos", "trabajos_criticos", "seguridad_trabajadores"], ["control_critico_ausente_no_verificado"], "critico", ["Hay personas dentro o cerca de la excavacion?", "Existe entibacion, talud o revision tecnica?"], ["Tratar excavacion como simple desnivel sin evaluar colapso."], "No omitir revision tecnica cuando el suelo puede deslizarse."),
  plantilla("deslizamiento_tierra", "Deslizamiento o desprendimiento de tierra", "Suelo, talud, acopio o borde muestra signos de inestabilidad, desprendimiento o saturacion {contexto}. La exposicion afecta a quienes trabajan abajo, transitan cerca o operan maquinaria junto al corte. La consecuencia probable es sepultamiento, golpe o volcamiento, por lo que se espera retirar exposicion, segregar y solicitar revision tecnica.", ["deslizamiento", "tierra", "talud", "saturado"], "trabajo_critico", "permanencia junto a terreno inestable", "terreno con signos de desprendimiento", "talud o acopio de tierra", "inestabilidad visible", "personas o equipos cercanos", "sepultamiento o golpe", "control geotecnico no verificado", ["segregacion", "retiro de personal", "revision tecnica", "drenaje si aplica"], "Retirar personas y equipos del area, aislar el sector y solicitar evaluacion tecnica antes de continuar.", ["Matriz de riesgos", "AST/ART", "Revision tecnica si aplica"], ["HDS/SDS si no hay sustancias"], ["excavaciones_suelos", "clima_entorno", "seguridad_trabajadores"], ["condicion_insegura", "control_critico_ausente_no_verificado"], "alto", ["Hay grietas, humedad o desprendimiento visible?", "Existe transito o trabajo bajo el talud?"], ["Clasificar como clima solamente si hay inestabilidad de suelo."], "No permitir continuidad con trabajadores dentro de zona de colapso."),
  plantilla("izaje_carga", "Izaje o carga suspendida sin control suficiente", "Carga, elemento estructural, panel, paquete o equipo se levanta o posiciona {contexto} sin radio segregado, senalero, aparejos verificados o comunicacion clara. La exposicion compromete trabajadores bajo o cerca de la carga. La consecuencia probable es golpe grave o atrapamiento, por lo que se espera detener y controlar la maniobra.", ["izaje", "carga suspendida", "eslinga", "grillete"], "trabajo_critico", "ubicacion bajo o cerca de carga suspendida", "maniobra sin segregacion o aparejo verificado", "carga suspendida", "control de izaje insuficiente", "trabajadores en linea de fuego", "golpe o atrapamiento grave", "plan, senalero o segregacion faltante", ["plan de izaje", "senalero", "aparejos certificados", "radio de exclusion"], "Detener el izaje, retirar personas del radio y verificar aparejos, senalero y segregacion.", ["Plan de izaje si aplica", "AST/ART", "Certificacion de aparejos"], ["HDS/SDS si no hay sustancias"], ["izaje_gruas_amarre", "trabajos_criticos", "seguridad_trabajadores"], ["paso_bajo_carga_suspendida", "exposicion_linea_fuego"], "critico", ["Hay personas bajo o cerca de la carga?", "Los elementos de izaje estan verificados?"], ["Tratar ausencia de segregacion como senalizacion generica."], "No permitir paso bajo carga suspendida como transito normal."),
  plantilla("herramienta_manual", "Herramienta manual inadecuada o en mal estado", "Herramienta manual se usa con mango suelto, filo deteriorado, dimension incorrecta o metodo improvisado {contexto}. La exposicion compromete manos, ojos o postura de quien ejecuta la tarea. La consecuencia probable es golpe, corte o sobreesfuerzo, por lo que se espera retirar, reemplazar o definir herramienta adecuada.", ["herramienta manual", "martillo", "llave", "alicate"], "seguridad_personas", "uso de herramienta incorrecta", "herramienta manual defectuosa", "herramienta manual", "mal estado o seleccion inadecuada", "trabajador que ejecuta tarea", "golpe, corte o sobreesfuerzo", "inspeccion o seleccion faltante", ["inspeccion visual", "retiro", "reemplazo", "herramienta adecuada"], "Retirar la herramienta defectuosa y reemplazarla por una apta para la tarea.", [], documentosNoSimples, ["herramientas_equipos", "seguridad_trabajadores", "mantencion_certificacion"], ["herramienta_equipo_mal_estado_usado_terreno"], "medio", ["La herramienta esta danada o es inadecuada para la tarea?", "Puede retirarse de inmediato?"], ["Pedir permiso formal si basta reemplazo de herramienta."], "No confundir herramienta inadecuada con falta documental."),
  plantilla("herramienta_electrica", "Herramienta electrica sin control o proteccion", "Herramienta electrica, extension, enchufe o cable presenta dano, reparacion informal, falta de inspeccion o proteccion insuficiente {contexto}. La exposicion afecta al usuario y personas cercanas por contacto electrico o proyeccion. La consecuencia probable es choque electrico, quemadura o lesion, por lo que se espera retirar y verificar.", ["herramienta electrica", "enchufe", "cable", "extension"], "seguridad_personas", "uso de equipo electrico defectuoso", "cable, enchufe o carcasa en mal estado", "herramienta electrica", "dano o inspeccion vencida", "usuario y trabajadores cercanos", "electrocucion o proyeccion", "inspeccion o proteccion faltante", ["retiro inmediato", "inspeccion", "proteccion diferencial", "reparacion autorizada"], "Retirar la herramienta del uso y verificar proteccion electrica antes de reponerla.", ["Registro de inspeccion si aplica"], ["PTS si solo corresponde retiro de herramienta"], ["herramientas_equipos", "energia_loto_electrico", "mantencion_certificacion"], ["herramienta_equipo_mal_estado_usado_terreno", "condicion_insegura"], "alto", ["Existe dano visible en cable o enchufe?", "La herramienta cuenta con inspeccion vigente?"], ["Aceptar reparacion con cinta como control suficiente."], "No permitir uso de herramienta electrica reparada informalmente."),
  plantilla("energia_provisoria", "Energia electrica provisoria sin control", "Tablero, extension, luminaria o conexion provisoria se encuentra expuesta, sin proteccion, sin senalizacion o con acceso no controlado {contexto}. La exposicion alcanza a trabajadores, humedad, equipos y rutas de paso. La consecuencia probable es contacto electrico o incendio, por lo que se espera aislar, proteger y verificar instalacion.", ["tablero", "energia", "extension", "provisoria"], "trabajo_critico", "manipulacion o paso junto a energia expuesta", "conexion o tablero sin proteccion", "energia electrica provisoria", "proteccion incompleta", "trabajadores y equipos cercanos", "contacto electrico o incendio", "proteccion electrica o segregacion faltante", ["proteccion fisica", "senalizacion", "diferencial", "control de acceso"], "Aislar el punto electrico y solicitar revision antes de permitir uso o circulacion cercana.", ["Registro electrico si aplica", "AST/ART si hay intervencion"], ["Permiso de fuego si no hay trabajo caliente"], ["energia_loto_electrico", "senalizacion_segregacion", "seguridad_trabajadores"], ["control_critico_ausente_no_verificado", "condicion_insegura"], "alto", ["Existe proteccion diferencial y acceso controlado?", "Hay humedad o transito cerca del tablero?"], ["Tratar tablero expuesto como solo falta de senaletica."], "No usar senalizacion como sustituto de proteccion electrica."),
  plantilla("polvo_silice", "Exposicion a polvo o silice sin control", "Corte, demolicion, movimiento de tierra, barrido seco o manipulacion de material genera polvo respirable {contexto}. La exposicion afecta a trabajadores cercanos y puede involucrar silice, irritacion o enfermedad profesional. La consecuencia probable es exposicion respiratoria, por lo que se espera humectacion, extraccion, segregacion y proteccion respiratoria adecuada.", ["polvo", "silice", "material particulado"], "salud_ocupacional", "trabajo dentro de nube de polvo", "emision de polvo sin control", "material particulado", "polvo visible o respirable", "trabajadores expuestos por inhalacion", "enfermedad o irritacion respiratoria", "humectacion o proteccion respiratoria faltante", ["humectacion", "extraccion", "respirador", "segregacion"], "Detener generacion de polvo visible y aplicar humectacion o control respiratorio antes de continuar.", ["Matriz de riesgos", "AST/ART si tarea genera polvo"], ["Permiso de izaje si no hay maniobra"], ["higiene_ocupacional", "seguridad_trabajadores", "epp"], ["control_critico_ausente_no_verificado"], "alto", ["Existe polvo visible o material con silice?", "Hay control humedo o respiratorio?"], ["Clasificar solo como aseo si hay exposicion respiratoria."], "No ignorar higiene ocupacional cuando hay polvo respirable."),
  plantilla("ruido_vibracion", "Ruido o vibracion sin control preventivo", "Herramienta, equipo, compactacion, corte o maquinaria genera ruido o vibracion perceptible {contexto}. La exposicion afecta a operadores y trabajadores cercanos, con consecuencia probable de dano auditivo, fatiga o trastorno musculoesqueletico. Se espera evaluar tiempo de exposicion, alejar personas, usar proteccion auditiva y revisar metodo o equipo.", ["ruido", "vibracion", "compactador"], "salud_ocupacional", "permanencia junto a fuente de ruido o vibracion", "fuente sin control de exposicion", "equipo ruidoso o vibratorio", "exposicion sin mitigacion", "operadores y trabajadores cercanos", "dano auditivo o fatiga", "proteccion auditiva o control de tiempo faltante", ["proteccion auditiva", "distancia", "rotacion", "mantencion de equipo"], "Reducir exposicion, entregar proteccion auditiva y verificar si corresponde limitar permanencia.", ["Matriz de riesgos", "Registro de entrega EPP si aplica"], ["HDS/SDS si no hay sustancias"], ["higiene_ocupacional", "epp", "seguridad_trabajadores"], ["incumplimiento_control_critico"], "medio", ["La fuente supera niveles tolerables o genera molestia evidente?", "Existe proteccion auditiva disponible y usada?"], ["Tratar ruido solo como incomodidad operacional."], "No omitir control de higiene ocupacional ante exposicion prolongada."),
  plantilla("uv_calor_clima", "Radiacion UV, calor o clima adverso", "Trabajo a la intemperie expone a radiacion UV, calor, viento, lluvia o baja visibilidad {contexto}. La condicion puede aumentar fatiga, deshidratacion, caidas, errores operacionales o inestabilidad de maniobras. Se espera revisar clima, hidratar, ajustar horarios, detener tareas criticas y asegurar refugio, visibilidad o segregacion segun corresponda.", ["uv", "calor", "viento", "lluvia"], "salud_ocupacional", "continuidad de tarea con clima adverso", "condicion climatica no controlada", "ambiente exterior", "clima adverso o radiacion", "trabajadores expuestos", "fatiga, caida o error operacional", "control climatico o pausa faltante", ["hidratacion", "sombra", "pausa", "detencion por viento si aplica"], "Evaluar la condicion climatica y detener tareas criticas si afecta visibilidad, estabilidad o salud.", ["Matriz de riesgos", "AST/ART si cambia condicion"], ["Permiso especial si no hay tarea critica"], ["clima_entorno", "higiene_ocupacional", "seguridad_trabajadores"], ["condicion_climatica_o_terreno_aumenta_riesgo"], "medio", ["El clima modifica la seguridad de la tarea?", "Se requiere detener o reprogramar?"], ["Tratar clima como hallazgo aislado si afecta una maniobra critica."], "No mantener tarea critica con viento o baja visibilidad sin reevaluacion."),
  plantilla("sobreesfuerzo", "Sobreesfuerzo por manejo manual de carga", "Carga, pieza, panel, herramienta o material se manipula manualmente {contexto} con peso, volumen, postura o frecuencia que supera una condicion ergonomica razonable. La exposicion afecta espalda, hombros y extremidades. La consecuencia probable es lesion musculoesqueletica, por lo que se espera ayuda mecanica, trabajo en equipo o rediseno del metodo.", ["sobreesfuerzo", "manejo manual", "carga"], "salud_ocupacional", "levantamiento o traslado inadecuado", "carga dificil de manipular", "carga o material", "peso o postura exigente", "trabajador que manipula carga", "lesion musculoesqueletica", "ayuda mecanica o metodo faltante", ["ayuda mecanica", "trabajo en equipo", "pausas", "rediseno de traslado"], "Detener traslado manual inseguro y definir apoyo mecanico o equipo suficiente.", ["AST/ART si hay tarea repetitiva o pesada"], ["PTS si la maniobra es simple y puntual"], ["ergonomia_manejo_manual", "seguridad_trabajadores"], ["acto_inseguro"], "medio", ["La carga puede trasladarse con ayuda mecanica?", "La postura o peso supera capacidad segura?"], ["Clasificar como falta de EPP cuando el problema es ergonomico."], "No resolver sobreesfuerzo solo con instruccion verbal."),
  plantilla("orden_aseo", "Orden y aseo deficiente en frente de trabajo", "Materiales, residuos, cables, restos de embalaje o herramientas quedan fuera de lugar {contexto}. La exposicion afecta rutas de paso, zonas de trabajo y operacion de equipos menores. La consecuencia probable es caida, golpe, perdida de control o incendio incipiente, por lo que se espera retiro, segregacion, acopio definido y limpieza permanente.", ["orden", "aseo", "residuo", "material fuera de lugar"], "operacional", "mantener frente desordenado", "materiales fuera de lugar", "frente de trabajo", "desorden o acumulacion", "trabajadores y rutas cercanas", "caida, golpe o interferencia operacional", "acopio y limpieza faltantes", ["acopio definido", "limpieza", "retiro de residuos", "rutas despejadas"], "Ordenar el frente, retirar residuos y despejar rutas antes de continuar la actividad.", [], documentosNoSimples, ["orden_aseo_housekeeping", "seguridad_trabajadores"], ["condicion_insegura"], "bajo", ["El desorden afecta ruta, equipo o emergencia?", "Se puede corregir por retiro inmediato?"], ["Exigir matriz o procedimiento para toda acumulacion menor."], "No convertir una limpieza simple en hallazgo documental."),
  plantilla("senalizacion_segregacion", "Senalizacion o segregacion insuficiente", "Zona con peligro, transito, borde, maquinaria, excavacion, izaje o trabajo simultaneo no cuenta con delimitacion o senalizacion efectiva {contexto}. La exposicion incluye ingreso no autorizado o acercamiento al peligro. La consecuencia probable es golpe, caida o interferencia operacional, por lo que se espera barrera, letrero y control de acceso.", ["senalizacion", "segregacion", "barrera"], "seguridad_personas", "ingreso o acercamiento a zona no controlada", "area peligrosa sin delimitacion", "zona de peligro", "senalizacion insuficiente", "trabajadores o terceros cercanos", "ingreso no autorizado o accidente", "barrera o control de acceso faltante", ["barrera", "letrero", "cinta solo como apoyo", "control de acceso"], "Instalar segregacion efectiva y restringir acceso hasta eliminar o controlar el peligro.", ["AST/ART si afecta tarea critica"], ["Permiso especial si no hay trabajo critico"], ["senalizacion_segregacion", "seguridad_trabajadores"], ["control_critico_ausente_no_verificado"], "medio", ["La barrera impide acceso real o solo advierte?", "Hay personas ingresando al area?"], ["Aceptar cinta como unico control ante riesgo grave."], "No confundir advertencia visual con segregacion efectiva."),
  plantilla("acceso_no_autorizado", "Acceso no autorizado a zona restringida", "Persona, trabajador, tercero o visitante ingresa o intenta ingresar a sector delimitado, cerrado, excavado, energizado o bajo maniobra {contexto}. La exposicion surge por evadir barrera o por falta de control de acceso. La consecuencia probable es accidente grave, por lo que se espera retirar, reforzar barrera y verificar autorizacion.", ["acceso", "zona restringida", "no autorizado"], "seguridad_personas", "ingreso sin autorizacion", "control de acceso insuficiente", "zona restringida", "ingreso no autorizado", "persona expuesta a peligro controlado", "accidente por exposicion no autorizada", "control de acceso fallido", ["barrera", "control de acceso", "retiro de persona", "refuerzo de senalizacion"], "Retirar a la persona, cerrar acceso y verificar autorizacion antes de permitir ingreso.", ["Registro de autorizacion si aplica"], ["PTS si solo corresponde retirar a la persona"], ["senalizacion_segregacion", "seguridad_trabajadores"], ["ingreso_zona_restringida", "acto_inseguro"], "alto", ["El sector estaba delimitado o restringido?", "La persona contaba con autorizacion?"], ["Tratarlo solo como falta de letrero si hubo evasion."], "No culpar automaticamente sin revisar eficacia del control de acceso."),
  plantilla("epp_no_usado", "EPP requerido no usado o incompleto", "Trabajador ejecuta o permanece cerca de la actividad sin EPP requerido segun peligro presente {contexto}. La exposicion puede ser ocular, auditiva, respiratoria, manual, craneal o de caida. La consecuencia probable es lesion evitable, por lo que se espera detener, corregir uso, verificar disponibilidad y revisar si hubo instruccion suficiente.", ["epp", "sin lentes", "sin guantes", "sin casco"], "seguridad_personas", "no uso de EPP requerido", "EPP ausente o incompleto", "EPP requerido", "no usado o incompleto", "trabajador expuesto", "lesion por falta de proteccion", "uso o disponibilidad de EPP fallida", ["entrega de EPP", "uso correcto", "supervision", "difusion"], "Detener exposicion y corregir uso de EPP antes de continuar la tarea.", ["Registro de entrega EPP si aplica", "Charla o difusion si aplica"], ["PTS si el riesgo se corrige solo con EPP simple"], ["epp", "seguridad_trabajadores"], ["incumplimiento_control_critico", "acto_inseguro"], "medio", ["El EPP era requerido por la tarea o condicion?", "Existe disponibilidad y uso correcto?"], ["Resolver solo con sancion sin revisar disponibilidad o supervision."], "No culpar al trabajador sin verificar instruccion, disponibilidad y control."),
  plantilla("epp_mal_estado", "EPP en mal estado o no vigente", "Elemento de proteccion personal presenta desgaste, dano, vencimiento, contaminacion o perdida de capacidad protectora {contexto}. La exposicion afecta al trabajador que confia en ese control para ejecutar la tarea. La consecuencia probable es lesion por falla del EPP, por lo que se espera retirar, reemplazar y verificar estado antes de usar.", ["epp mal estado", "arnes vencido", "calzado gastado"], "seguridad_personas", "uso de EPP defectuoso", "EPP deteriorado o vencido", "EPP", "mal estado o no vigente", "trabajador usuario", "lesion por falla de proteccion", "inspeccion o reposicion faltante", ["inspeccion", "retiro", "reposicion", "registro si aplica"], "Retirar el EPP defectuoso y reemplazarlo por uno apto antes de continuar.", ["Registro de inspeccion si aplica"], ["Permiso especial si no hay trabajo critico"], ["epp", "mantencion_certificacion", "seguridad_trabajadores"], ["condicion_insegura", "control_critico_ausente_no_verificado"], "medio", ["El EPP mantiene capacidad protectora?", "Requiere retiro inmediato o reposicion?"], ["Tratar EPP critico vencido como hallazgo menor."], "No permitir continuidad con arnes, calzado o proteccion critica deteriorada."),
  plantilla("documento_faltante", "Documento preventivo faltante o no disponible", "Documento preventivo relevante para la tarea no esta disponible, vigente, difundido o trazable {contexto}. La exposicion depende de si el documento habilita un trabajo critico, controla un cambio o respalda instruccion. La consecuencia probable es ejecucion sin criterio verificable, por lo que se espera regularizar sin sobredocumentar condiciones simples.", ["documento", "procedimiento", "matriz", "registro"], "documental", "ejecutar tarea sin respaldo requerido", "documento faltante o vencido", "documento preventivo", "no disponible o no vigente", "trabajadores que ejecutan tarea", "control preventivo no verificable", "registro, matriz o difusion faltante", ["regularizacion documental", "difusion", "actualizacion", "verificacion de aplicabilidad"], "Verificar aplicabilidad del documento y regularizarlo antes de continuar si habilita la tarea.", ["Matriz de riesgos", "Procedimiento", "AST/ART si aplica"], ["Permiso especial si la tarea no lo requiere"], ["documental_legal", "capacitacion_evidencias"], ["omision_documental"], "medio", ["El documento habilita la tarea o solo respalda una correccion simple?", "La matriz cubre la condicion observada?"], ["Pedir documentos para hallazgos simples corregibles en terreno."], "No sobredocumentar condiciones que se resuelven con control fisico inmediato."),
  plantilla("ast_art_aplicable", "AST/ART requerido por tarea no verificado", "Tarea en ejecucion presenta riesgos variables, simultaneidad, energia, altura, maquinaria o cambio de condicion sin AST/ART verificado {contexto}. La exposicion involucra trabajadores que pueden no reconocer peligros emergentes. La consecuencia probable es control incompleto, por lo que se espera detener, revisar la tarea y actualizar el analisis antes de continuar.", ["ast", "art", "analisis de riesgo"], "documental", "ejecutar sin analisis de tarea", "analisis no disponible o incompleto", "AST/ART", "no verificado ante cambio", "equipo de trabajo", "control incompleto de tarea", "analisis de riesgo faltante", ["AST/ART vigente", "difusion", "revision de cambios", "supervision"], "Actualizar o elaborar AST/ART y difundir controles antes de continuar la tarea.", ["AST/ART", "Matriz de riesgos"], ["HDS/SDS si no hay sustancias"], ["documental_legal", "capacitacion_evidencias", "seguridad_trabajadores"], ["omision_documental", "falta_conocimiento_capacitacion_difusion"], "medio", ["La tarea cambio respecto de lo planificado?", "El equipo conoce los controles definidos?"], ["Exigir AST/ART para retiro simple sin tarea operacional."], "No usar AST/ART como sustituto de un control fisico ausente."),
  plantilla("pts_permiso", "PTS, permiso o autorizacion no aplicado", "Actividad critica o regulada se ejecuta sin PTS, permiso, autorizacion o metodo especifico verificado {contexto}. La exposicion puede incluir altura, izaje, excavacion, energia, trabajo caliente o intervencion de equipo. La consecuencia probable es accidente grave por control habilitante ausente, por lo que se espera detener y regularizar antes de continuar.", ["pts", "permiso", "autorizacion"], "trabajo_critico", "ejecutar trabajo critico sin autorizacion", "permiso o PTS no aplicado", "tarea critica", "control habilitante ausente", "trabajadores expuestos", "accidente grave por falta de control", "permiso, PTS o autorizacion faltante", ["detencion", "permiso", "PTS", "verificacion de controles criticos"], "Detener la actividad critica y verificar permiso, PTS o autorizacion antes de reanudar.", ["PTS", "Permiso/autorizacion", "AST/ART", "Matriz de riesgos"], ["HDS/SDS si no hay sustancias"], ["trabajos_criticos", "documental_legal", "seguridad_trabajadores"], ["trabajo_critico_sin_autorizacion_control", "incumplimiento_control_critico"], "alto", ["La actividad corresponde a trabajo critico?", "El permiso esta aprobado y vigente?"], ["Clasificar como omision documental menor si habilita trabajo critico."], "No permitir continuidad de trabajo critico por falta de documento habilitante."),
  plantilla("ambiental_residuos", "Residuo, derrame o control ambiental insuficiente", "Residuo, lechada, combustible, aceite, polvo sedimentable o material contaminante queda sin segregacion, contencion o retiro adecuado {contexto}. La exposicion afecta suelo, agua, drenajes, trabajadores o comunidad cercana. La consecuencia probable es impacto ambiental o resbalon, por lo que se espera contener, segregar, retirar y registrar si corresponde.", ["residuo", "derrame", "lechada", "contencion"], "ambiental", "mantener residuo o derrame sin control", "residuo o sustancia sin contencion", "residuo o derrame", "segregacion o contencion insuficiente", "suelo, agua o trabajadores", "impacto ambiental o caida", "control ambiental faltante", ["contencion", "segregacion", "retiro autorizado", "limpieza controlada"], "Contener el material, evitar escurrimiento y gestionar retiro o limpieza segura.", ["HDS/SDS si hay sustancia", "Registro ambiental si aplica"], ["PTS si solo corresponde limpieza simple no critica"], ["medio_ambiente", "sustancias_hds", "orden_aseo_housekeeping"], ["evento_ambiental", "condicion_insegura"], "medio", ["Existe contacto con suelo, agua o drenaje?", "El residuo esta segregado y rotulado?"], ["Tratar derrame como aseo si hay impacto ambiental potencial."], "No omitir control ambiental ante combustible, lechada o residuo peligroso."),
  plantilla("agua_iluminacion", "Agua acumulada o iluminacion deficiente", "Agua, barro, sombra, falta de luminaria o baja visibilidad afecta el frente o ruta de trabajo {contexto}. La exposicion alcanza circulacion, lectura de senales, operacion de equipos y estabilidad de superficies. La consecuencia probable es caida, error operacional o contacto con energia, por lo que se espera drenar, iluminar, aislar o reprogramar.", ["agua acumulada", "iluminacion", "barro", "visibilidad"], "operacional", "continuar tarea con visibilidad o superficie deficiente", "agua o iluminacion insuficiente", "frente de trabajo", "visibilidad o superficie alterada", "trabajadores y equipos", "caida o error operacional", "drenaje o iluminacion faltante", ["drenaje", "luminaria", "senalizacion", "reprogramacion si aplica"], "Corregir agua o iluminacion y restringir circulacion hasta recuperar condiciones seguras.", ["AST/ART si cambia condicion de tarea"], ["HDS/SDS si no hay sustancia"], ["clima_entorno", "orden_aseo_housekeeping", "seguridad_trabajadores"], ["condicion_insegura"], "medio", ["La visibilidad permite ejecutar la tarea?", "El agua afecta energia o circulacion?"], ["Clasificar siempre como aseo sin evaluar energia o visibilidad."], "No mantener trabajo con baja visibilidad si hay maquinaria o borde cercano."),
  plantilla("clima_adverso", "Clima adverso que modifica el riesgo de la tarea", "Viento, lluvia, calor, frio, polvo ambiental o baja visibilidad modifican la seguridad de la actividad {contexto}. La exposicion depende de altura, izaje, excavacion, circulacion o esfuerzo fisico asociado. La consecuencia probable es perdida de control, caida, deslizamiento o fatiga, por lo que se espera reevaluar y detener si corresponde.", ["clima", "viento", "lluvia", "baja visibilidad"], "operacional", "continuar sin reevaluar clima", "condicion climatica adversa", "ambiente de trabajo", "clima modifica riesgo", "trabajadores, equipos o maniobras", "caida, fatiga o perdida de control", "reevaluacion climatica faltante", ["monitoreo", "pausa", "detencion", "segregacion"], "Reevaluar la actividad con supervision y detener maniobras criticas si el clima afecta el control.", ["AST/ART actualizado si cambia condicion", "Matriz de riesgos"], ["Permiso especial si no hay tarea critica"], ["clima_entorno", "seguridad_trabajadores"], ["condicion_climatica_o_terreno_aumenta_riesgo"], "medio", ["El clima afecta estabilidad, visibilidad o salud?", "Corresponde suspender la tarea?"], ["Tratar clima como dato irrelevante en tareas criticas."], "No continuar izaje, altura o excavacion si el clima altera controles."),
  plantilla("terreno_inestable", "Terreno inestable o resbaladizo", "Terreno natural, relleno, plataforma, borde o ruta presenta inestabilidad, barro, humedad, pendiente o superficie resbaladiza {contexto}. La exposicion afecta trabajadores, equipos y acopios cercanos. La consecuencia probable es caida, volcamiento, atrapamiento o deslizamiento, por lo que se espera segregar, estabilizar, drenar o definir ruta alternativa.", ["terreno", "inestable", "resbaladizo", "barro"], "operacional", "transitar o operar sobre terreno inestable", "superficie o suelo inestable", "terreno", "inestabilidad o resbalamiento", "personas y equipos", "caida, volcamiento o deslizamiento", "estabilizacion o segregacion faltante", ["segregacion", "estabilizacion", "drenaje", "ruta alternativa"], "Restringir transito y estabilizar o drenar antes de continuar la actividad.", ["AST/ART si afecta tarea", "Matriz de riesgos"], ["HDS/SDS si no hay sustancias"], ["clima_entorno", "excavaciones_suelos", "seguridad_trabajadores"], ["desplazamiento_terreno_inestable", "condicion_insegura"], "alto", ["El terreno soporta personas y equipos?", "Existe ruta alternativa segura?"], ["Tratar barro o terreno inestable solo como limpieza."], "No permitir maquinaria sobre suelo sin capacidad o estabilidad verificada."),
  plantilla("mantencion_certificacion", "Equipo, aparejo o elemento sin mantencion/certificacion", "Equipo, herramienta, vehiculo, aparejo, EPP critico o componente temporal no evidencia inspeccion, mantencion o certificacion vigente {contexto}. La exposicion surge porque el elemento puede fallar durante uso real. La consecuencia probable es golpe, caida, atrapamiento o perdida de control, por lo que se espera retirar y verificar trazabilidad.", ["certificacion", "mantencion", "inspeccion", "vigente"], "operacional", "usar elemento sin verificacion vigente", "mantencion o certificacion no acreditada", "equipo o elemento critico", "vigencia no demostrada", "usuarios y trabajadores cercanos", "falla del equipo o control", "inspeccion o certificacion faltante", ["retiro", "inspeccion", "certificacion", "bloqueo de uso"], "Retirar el elemento del servicio hasta verificar mantencion, inspeccion o certificacion.", ["Certificacion o mantencion", "Registro de inspeccion"], ["Permiso especial si no hay trabajo critico"], ["mantencion_certificacion", "herramientas_equipos", "seguridad_trabajadores"], ["condicion_insegura", "omision_documental"], "medio", ["El elemento es critico para sostener carga, energia o personas?", "Existe registro vigente?"], ["Tratar certificacion vencida solo como papel sin evaluar uso."], "No permitir uso de equipo critico sin vigencia verificable."),
  plantilla("interferencia_trabajos", "Interferencia entre trabajos simultaneos", "Dos o mas tareas se ejecutan en la misma zona o en niveles superpuestos {contexto} sin coordinacion suficiente. La exposicion incluye caida de material, ingreso a radios de maquinaria, cruces de rutas o interferencia con energia. La consecuencia probable es golpe, atrapamiento o error operacional, por lo que se espera coordinar y segregar.", ["interferencia", "simultaneo", "misma zona"], "operacional", "ejecutar tareas simultaneas sin coordinacion", "interferencia entre frentes", "frente de trabajo compartido", "controles incompatibles o ausentes", "cuadrillas simultaneas", "golpe, atrapamiento o caida de material", "coordinacion y segregacion faltantes", ["coordinacion", "secuencia", "segregacion", "supervision"], "Detener interferencia y definir secuencia, segregacion o responsable de coordinacion.", ["AST/ART", "Planificacion diaria", "Matriz de riesgos"], ["HDS/SDS si no hay sustancias"], ["seguridad_trabajadores", "senalizacion_segregacion", "trabajos_criticos"], ["falla_supervision_control_operacional"], "medio", ["Existen trabajos simultaneos incompatibles?", "Hay responsable de coordinacion definido?"], ["Evaluar cada tarea aislada sin revisar interferencias."], "No omitir el riesgo creado por simultaneidad de frentes."),
  plantilla("supervision_control", "Falla de supervision o control operacional", "Control definido no se verifica, no se mantiene o no se corrige oportunamente {contexto}. La exposicion puede persistir aunque exista procedimiento, charla o barrera inicial. La consecuencia probable es repeticion de la desviacion o accidente por control degradado, por lo que se espera asignar responsable, corregir y verificar cierre efectivo.", ["supervision", "control", "responsable", "verificacion"], "operacional", "no verificar control existente", "control instalado pero no mantenido", "control preventivo", "debilidad de verificacion", "trabajadores expuestos a control degradado", "repeticion de desviacion o accidente", "supervision o seguimiento faltante", ["responsable", "verificacion", "cierre", "seguimiento"], "Asignar responsable y verificar la correccion antes de dar por controlado el hallazgo.", ["Registro de cierre si aplica"], ["Permiso especial si la correccion no lo requiere"], ["capacitacion_evidencias", "seguridad_trabajadores"], ["falla_supervision_control_operacional"], "medio", ["Existe responsable definido para corregir?", "El control fue verificado despues de instalarse?"], ["Cerrar hallazgo solo por declarar una accion sin evidencia."], "No confundir presencia inicial de control con efectividad sostenida."),
];

function plantilla(
  idBase: string,
  tituloBase: string,
  descripcionBase: string,
  palabrasClave: string[],
  tipoRiesgo: TipoRiesgoActividadObra,
  actoInseguroAsociado: string,
  condicionInseguraAsociada: string,
  objetoPrincipal: string,
  condicionObservada: string,
  exposicion: string,
  consecuenciaProbable: string,
  controlFaltanteOFallido: string,
  controlesEsperados: string[],
  accionInmediataSugerida: string,
  documentosAplicables: string[],
  documentosNoAplicables: string[],
  familiasPreventivas: FamiliaTaxonomiaPreventivaId[],
  desviacionesPreventivas: DesviacionPreventivaId[],
  criticidadOrientativa: CriticidadOrientativaTaxonomia,
  preguntasSugeridas: string[],
  preguntasProhibidas: string[],
  errorQueDebeEvitar: string,
): PlantillaRiesgo {
  return {
    idBase,
    tituloBase,
    descripcionBase,
    palabrasClave,
    tipoRiesgo,
    actoInseguroAsociado,
    condicionInseguraAsociada,
    objetoPrincipal,
    condicionObservada,
    exposicion,
    consecuenciaProbable,
    controlFaltanteOFallido,
    controlesEsperados,
    accionInmediataSugerida,
    documentosAplicables,
    documentosNoAplicables,
    familiasPreventivas,
    desviacionesPreventivas,
    criticidadOrientativa,
    preguntasSugeridas,
    preguntasProhibidas,
    errorQueDebeEvitar,
  };
}

function construirRiesgo(actividad: ActividadBase, plantillaRiesgo: PlantillaRiesgo): RiesgoInherenteActividadObra {
  return {
    id: `${actividad.id}_${plantillaRiesgo.idBase}`,
    titulo: `${plantillaRiesgo.tituloBase} - ${actividad.nombreVisible}`,
    descripcionTecnica: plantillaRiesgo.descripcionBase.replace("{contexto}", actividad.contextoTecnico),
    palabrasClave: [...actividad.palabrasClaveActividad, ...plantillaRiesgo.palabrasClave],
    tipoRiesgo: plantillaRiesgo.tipoRiesgo,
    actoInseguroAsociado: plantillaRiesgo.actoInseguroAsociado,
    condicionInseguraAsociada: plantillaRiesgo.condicionInseguraAsociada,
    objetoPrincipal: plantillaRiesgo.objetoPrincipal,
    condicionObservada: plantillaRiesgo.condicionObservada,
    exposicion: plantillaRiesgo.exposicion,
    consecuenciaProbable: plantillaRiesgo.consecuenciaProbable,
    controlFaltanteOFallido: plantillaRiesgo.controlFaltanteOFallido,
    controlesEsperados: plantillaRiesgo.controlesEsperados,
    accionInmediataSugerida: plantillaRiesgo.accionInmediataSugerida,
    documentosAplicables: plantillaRiesgo.documentosAplicables,
    documentosNoAplicables: plantillaRiesgo.documentosNoAplicables,
    familiasPreventivas: plantillaRiesgo.familiasPreventivas,
    desviacionesPreventivas: plantillaRiesgo.desviacionesPreventivas,
    criticidadOrientativa: plantillaRiesgo.criticidadOrientativa,
    preguntasSugeridas: plantillaRiesgo.preguntasSugeridas,
    preguntasProhibidas: plantillaRiesgo.preguntasProhibidas,
    errorQueDebeEvitar: plantillaRiesgo.errorQueDebeEvitar,
  };
}

function construirRiesgoBloqueB(actividad: ActividadBloqueB, definicion: TemaRiesgoBloqueB): RiesgoInherenteActividadObra {
  const perfil = PERFILES_RIESGO_B[definicion.categoria];

  return {
    id: `${actividad.id}_${definicion.idBase}`,
    titulo: `${definicion.tituloBase} - ${actividad.nombreVisible}`,
    descripcionTecnica:
      `${definicion.condicionTecnica} ${actividad.contextoTecnico}. ` +
      `Expone a ${perfil.exposicion} y puede generar ${perfil.consecuenciaProbable}. ` +
      `Debe verificarse ${perfil.controlesEsperados.slice(0, 2).join(", ")}. ` +
      `Si falta control, detener, corregir y verificar antes de reanudar.`,
    palabrasClave: [...actividad.palabrasClaveActividad, ...definicion.palabrasClaveBase],
    tipoRiesgo: perfil.tipoRiesgo,
    actoInseguroAsociado: perfil.actoInseguroAsociado,
    condicionInseguraAsociada: perfil.condicionInseguraAsociada,
    objetoPrincipal: definicion.objetoPrincipal,
    condicionObservada: definicion.condicionObservada,
    exposicion: perfil.exposicion,
    consecuenciaProbable: perfil.consecuenciaProbable,
    controlFaltanteOFallido: perfil.controlFaltanteOFallido,
    controlesEsperados: perfil.controlesEsperados,
    accionInmediataSugerida: perfil.accionInmediataSugerida,
    documentosAplicables: perfil.documentosAplicables,
    documentosNoAplicables: perfil.documentosNoAplicables,
    familiasPreventivas: perfil.familiasPreventivas,
    desviacionesPreventivas: perfil.desviacionesPreventivas,
    criticidadOrientativa: definicion.criticidadOrientativa || perfil.criticidadOrientativa,
    preguntasSugeridas: perfil.preguntasSugeridas,
    preguntasProhibidas: perfil.preguntasProhibidas,
    errorQueDebeEvitar: perfil.errorQueDebeEvitar,
  };
}

function construirRiesgoBloqueC(actividad: ActividadBloqueC, definicion: TemaRiesgoBloqueC): RiesgoInherenteActividadObra {
  const perfil = PERFILES_RIESGO_C[definicion.categoria];

  return {
    id: `${actividad.id}_${definicion.idBase}`,
    titulo: `${definicion.tituloBase} - ${actividad.nombreVisible}`,
    descripcionTecnica:
      `${definicion.condicionTecnica} ${actividad.contextoTecnico}. ` +
      `La exposicion alcanza a ${perfil.exposicion}, con consecuencia probable de ${perfil.consecuenciaProbable}. ` +
      `El control esperado debe verificar ${perfil.controlesEsperados.slice(0, 3).join(", ")} y mantener trazabilidad segun la tarea. ` +
      `Si el control falta, corresponde detener, aislar, corregir y confirmar cierre antes de liberar el frente.`,
    palabrasClave: [...actividad.palabrasClaveActividad, ...definicion.palabrasClaveBase],
    tipoRiesgo: perfil.tipoRiesgo,
    actoInseguroAsociado: perfil.actoInseguroAsociado,
    condicionInseguraAsociada: perfil.condicionInseguraAsociada,
    objetoPrincipal: definicion.objetoPrincipal,
    condicionObservada: definicion.condicionObservada,
    exposicion: perfil.exposicion,
    consecuenciaProbable: perfil.consecuenciaProbable,
    controlFaltanteOFallido: perfil.controlFaltanteOFallido,
    controlesEsperados: perfil.controlesEsperados,
    accionInmediataSugerida: perfil.accionInmediataSugerida,
    documentosAplicables: perfil.documentosAplicables,
    documentosNoAplicables: perfil.documentosNoAplicables,
    familiasPreventivas: perfil.familiasPreventivas,
    desviacionesPreventivas: perfil.desviacionesPreventivas,
    criticidadOrientativa: definicion.criticidadOrientativa || perfil.criticidadOrientativa,
    preguntasSugeridas: perfil.preguntasSugeridas,
    preguntasProhibidas: perfil.preguntasProhibidas,
    errorQueDebeEvitar: perfil.errorQueDebeEvitar,
  };
}

function construirRiesgoBloqueD(actividad: ActividadBloqueD, definicion: TemaRiesgoBloqueD): RiesgoInherenteActividadObra {
  const perfil = PERFILES_RIESGO_C[definicion.categoria];

  return {
    id: `${actividad.id}_${definicion.idBase}`,
    titulo: `${definicion.tituloBase} - ${actividad.nombreVisible}`,
    descripcionTecnica:
      `${definicion.condicionTecnica} ${actividad.contextoTecnico}. ` +
      `La exposicion alcanza a ${perfil.exposicion}, con consecuencia probable de ${perfil.consecuenciaProbable}. ` +
      `El control esperado debe considerar ${perfil.controlesEsperados.slice(0, 3).join(", ")} y ajustar la documentacion solo si la condicion lo requiere. ` +
      `Si el riesgo permanece, corresponde retirar exposicion, corregir, limpiar o segregar antes de liberar la terminacion.`,
    palabrasClave: [...actividad.palabrasClaveActividad, ...definicion.palabrasClaveBase],
    tipoRiesgo: perfil.tipoRiesgo,
    actoInseguroAsociado: perfil.actoInseguroAsociado,
    condicionInseguraAsociada: perfil.condicionInseguraAsociada,
    objetoPrincipal: definicion.objetoPrincipal,
    condicionObservada: definicion.condicionObservada,
    exposicion: perfil.exposicion,
    consecuenciaProbable: perfil.consecuenciaProbable,
    controlFaltanteOFallido: perfil.controlFaltanteOFallido,
    controlesEsperados: perfil.controlesEsperados,
    accionInmediataSugerida: perfil.accionInmediataSugerida,
    documentosAplicables: perfil.documentosAplicables,
    documentosNoAplicables: perfil.documentosNoAplicables,
    familiasPreventivas: perfil.familiasPreventivas,
    desviacionesPreventivas: perfil.desviacionesPreventivas,
    criticidadOrientativa: definicion.criticidadOrientativa || perfil.criticidadOrientativa,
    preguntasSugeridas: perfil.preguntasSugeridas,
    preguntasProhibidas: perfil.preguntasProhibidas,
    errorQueDebeEvitar: perfil.errorQueDebeEvitar,
  };
}

function construirRiesgoBloqueE(actividad: ActividadBloqueE, definicion: TemaRiesgoBloqueE): RiesgoInherenteActividadObra {
  const perfil = PERFILES_RIESGO_C[definicion.categoria];

  return {
    id: `${actividad.id}_${definicion.idBase}`,
    titulo: `${definicion.tituloBase} - ${actividad.nombreVisible}`,
    descripcionTecnica:
      `${definicion.condicionTecnica} ${actividad.contextoTecnico}. ` +
      `La exposicion alcanza a ${perfil.exposicion}, con consecuencia probable de ${perfil.consecuenciaProbable}. ` +
      `El control esperado debe considerar ${perfil.controlesEsperados.slice(0, 3).join(", ")} y confirmar coordinacion operacional en terreno. ` +
      `Si el control no esta verificado, corresponde detener la maniobra, segregar, corregir y liberar solo con responsable definido.`,
    palabrasClave: [...actividad.palabrasClaveActividad, ...definicion.palabrasClaveBase],
    tipoRiesgo: perfil.tipoRiesgo,
    actoInseguroAsociado: perfil.actoInseguroAsociado,
    condicionInseguraAsociada: perfil.condicionInseguraAsociada,
    objetoPrincipal: definicion.objetoPrincipal,
    condicionObservada: definicion.condicionObservada,
    exposicion: perfil.exposicion,
    consecuenciaProbable: perfil.consecuenciaProbable,
    controlFaltanteOFallido: perfil.controlFaltanteOFallido,
    controlesEsperados: perfil.controlesEsperados,
    accionInmediataSugerida: perfil.accionInmediataSugerida,
    documentosAplicables: perfil.documentosAplicables,
    documentosNoAplicables: perfil.documentosNoAplicables,
    familiasPreventivas: perfil.familiasPreventivas,
    desviacionesPreventivas: perfil.desviacionesPreventivas,
    criticidadOrientativa: definicion.criticidadOrientativa || perfil.criticidadOrientativa,
    preguntasSugeridas: perfil.preguntasSugeridas,
    preguntasProhibidas: perfil.preguntasProhibidas,
    errorQueDebeEvitar: perfil.errorQueDebeEvitar,
  };
}

function construirRiesgoBloqueF(actividad: ActividadBloqueF, definicion: TemaRiesgoBloqueF): RiesgoInherenteActividadObra {
  const perfil = PERFILES_RIESGO_C[definicion.categoria];

  return {
    id: `${actividad.id}_${definicion.idBase}`,
    titulo: `${definicion.tituloBase} - ${actividad.nombreVisible}`,
    descripcionTecnica:
      `${definicion.condicionTecnica} ${actividad.contextoTecnico}. ` +
      `La exposicion alcanza a ${perfil.exposicion}, con consecuencia probable de ${perfil.consecuenciaProbable}. ` +
      `El control esperado debe considerar ${perfil.controlesEsperados.slice(0, 3).join(", ")} y privilegiar contencion, segregacion, limpieza o respuesta inmediata. ` +
      `Si existe derrame activo, inflamable sin control, exposicion grave o emergencia real, corresponde detener, aislar y escalar la respuesta.`,
    palabrasClave: [...actividad.palabrasClaveActividad, ...definicion.palabrasClaveBase],
    tipoRiesgo: perfil.tipoRiesgo,
    actoInseguroAsociado: perfil.actoInseguroAsociado,
    condicionInseguraAsociada: perfil.condicionInseguraAsociada,
    objetoPrincipal: definicion.objetoPrincipal,
    condicionObservada: definicion.condicionObservada,
    exposicion: perfil.exposicion,
    consecuenciaProbable: perfil.consecuenciaProbable,
    controlFaltanteOFallido: perfil.controlFaltanteOFallido,
    controlesEsperados: perfil.controlesEsperados,
    accionInmediataSugerida: perfil.accionInmediataSugerida,
    documentosAplicables: perfil.documentosAplicables,
    documentosNoAplicables: perfil.documentosNoAplicables,
    familiasPreventivas: perfil.familiasPreventivas,
    desviacionesPreventivas: perfil.desviacionesPreventivas,
    criticidadOrientativa: definicion.criticidadOrientativa || perfil.criticidadOrientativa,
    preguntasSugeridas: perfil.preguntasSugeridas,
    preguntasProhibidas: perfil.preguntasProhibidas,
    errorQueDebeEvitar: perfil.errorQueDebeEvitar,
  };
}

const ACTIVIDADES_BLOQUE_A: ActividadObraPreventiva[] = ACTIVIDADES_BASE.map((actividad) => ({
  ...actividad,
  riesgosInherentes: PLANTILLAS_RIESGO.map((plantillaRiesgo) => construirRiesgo(actividad, plantillaRiesgo)),
}));

const ACTIVIDADES_BLOQUE_B_PUBLICAS: ActividadObraPreventiva[] = crearActividadesBloqueB().map((actividad) => {
  const { definicionesRiesgo, ...actividadPublica } = actividad;
  return {
    ...actividadPublica,
    riesgosInherentes: definicionesRiesgo.map((definicion) => construirRiesgoBloqueB(actividad, definicion)),
  };
});

const ACTIVIDADES_BLOQUE_C_PUBLICAS: ActividadObraPreventiva[] = crearActividadesBloqueC().map((actividad) => {
  const { definicionesRiesgo, ...actividadPublica } = actividad;
  return {
    ...actividadPublica,
    riesgosInherentes: definicionesRiesgo.map((definicion) => construirRiesgoBloqueC(actividad, definicion)),
  };
});

const ACTIVIDADES_BLOQUE_D_PUBLICAS: ActividadObraPreventiva[] = crearActividadesBloqueD().map((actividad) => {
  const { definicionesRiesgo, ...actividadPublica } = actividad;
  return {
    ...actividadPublica,
    riesgosInherentes: definicionesRiesgo.map((definicion) => construirRiesgoBloqueD(actividad, definicion)),
  };
});

const ACTIVIDADES_BLOQUE_E_PUBLICAS: ActividadObraPreventiva[] = crearActividadesBloqueE().map((actividad) => {
  const { definicionesRiesgo, ...actividadPublica } = actividad;
  return {
    ...actividadPublica,
    riesgosInherentes: definicionesRiesgo.map((definicion) => construirRiesgoBloqueE(actividad, definicion)),
  };
});

const ACTIVIDADES_BLOQUE_F_PUBLICAS: ActividadObraPreventiva[] = crearActividadesBloqueF().map((actividad) => {
  const { definicionesRiesgo, ...actividadPublica } = actividad;
  return {
    ...actividadPublica,
    riesgosInherentes: definicionesRiesgo.map((definicion) => construirRiesgoBloqueF(actividad, definicion)),
  };
});

export const BIBLIOTECA_ACTIVIDADES_OBRA_V2: ActividadObraPreventiva[] = [
  ...ACTIVIDADES_BLOQUE_A,
  ...ACTIVIDADES_BLOQUE_B_PUBLICAS,
  ...ACTIVIDADES_BLOQUE_C_PUBLICAS,
  ...ACTIVIDADES_BLOQUE_D_PUBLICAS,
  ...ACTIVIDADES_BLOQUE_E_PUBLICAS,
  ...ACTIVIDADES_BLOQUE_F_PUBLICAS,
];

function normalizarTextoActividad(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s/.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function contieneTexto(base: string, terminos: string[]): boolean {
  const normalizado = normalizarTextoActividad(base);
  return terminos.some((termino) => normalizado.includes(normalizarTextoActividad(termino)));
}

export function obtenerActividadesObra(): ActividadObraPreventiva[] {
  return [...BIBLIOTECA_ACTIVIDADES_OBRA_V2];
}

export function obtenerActividadObraPorId(id: ActividadObraId): ActividadObraPreventiva | undefined {
  return BIBLIOTECA_ACTIVIDADES_OBRA_V2.find((actividad) => actividad.id === id);
}

export function obtenerRiesgosPorActividad(idActividad: ActividadObraId): RiesgoInherenteActividadObra[] {
  return obtenerActividadObraPorId(idActividad)?.riesgosInherentes || [];
}

export function buscarActividadesPorTexto(texto: string): ActividadObraPreventiva[] {
  return BIBLIOTECA_ACTIVIDADES_OBRA_V2.filter((actividad) =>
    contieneTexto(
      texto,
      [actividad.nombreVisible, actividad.descripcionActividad, actividad.etapaObra, ...actividad.palabrasClaveActividad],
    ),
  );
}

export function buscarRiesgosPorTexto(texto: string): RiesgoInherenteActividadObra[] {
  return BIBLIOTECA_ACTIVIDADES_OBRA_V2.flatMap((actividad) => actividad.riesgosInherentes).filter((riesgo) =>
    contieneTexto(texto, [riesgo.titulo, riesgo.descripcionTecnica, ...riesgo.palabrasClave]),
  );
}

export function obtenerPreguntasPorActividad(idActividad: ActividadObraId): string[] {
  const actividad = obtenerActividadObraPorId(idActividad);
  if (!actividad) return [];
  return Array.from(
    new Set([
      ...actividad.preguntasEstrategicasSugeridas,
      ...actividad.riesgosInherentes.flatMap((riesgo) => riesgo.preguntasSugeridas),
    ]),
  );
}

export function obtenerRiesgosPorFamiliaPreventiva(idFamilia: FamiliaTaxonomiaPreventivaId): RiesgoInherenteActividadObra[] {
  return BIBLIOTECA_ACTIVIDADES_OBRA_V2.flatMap((actividad) => actividad.riesgosInherentes).filter((riesgo) =>
    riesgo.familiasPreventivas.includes(idFamilia),
  );
}

export function obtenerRiesgosPorDesviacion(idDesviacion: DesviacionPreventivaId): RiesgoInherenteActividadObra[] {
  return BIBLIOTECA_ACTIVIDADES_OBRA_V2.flatMap((actividad) => actividad.riesgosInherentes).filter((riesgo) =>
    riesgo.desviacionesPreventivas.includes(idDesviacion),
  );
}
