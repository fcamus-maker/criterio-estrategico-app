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
  | "estructuras_metalicas_iniciales";

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

export const BIBLIOTECA_ACTIVIDADES_OBRA_V2: ActividadObraPreventiva[] = ACTIVIDADES_BASE.map((actividad) => ({
  ...actividad,
  riesgosInherentes: PLANTILLAS_RIESGO.map((plantillaRiesgo) => construirRiesgo(actividad, plantillaRiesgo)),
}));

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
