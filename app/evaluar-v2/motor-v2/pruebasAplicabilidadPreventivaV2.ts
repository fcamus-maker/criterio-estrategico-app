import {
  evaluarAplicabilidadPreventiva,
  type AccionAplicabilidadPreventiva,
  type ContextoAplicabilidadPreventiva,
  type DocumentoPreventivoAplicable,
} from "./aplicabilidadPreventivaV2";

export type CasoPruebaAplicabilidadPreventiva = {
  id: string;
  descripcion: string;
  contexto: ContextoAplicabilidadPreventiva;
  documentosEsperados: DocumentoPreventivoAplicable[];
  documentosProhibidos: DocumentoPreventivoAplicable[];
  accionesEsperadas: AccionAplicabilidadPreventiva[];
  debeDetenerActividad: boolean;
  debePedirRevisionMatriz: boolean;
  debePedirControlCritico: boolean;
  debeEvitarSobredocumentacion: boolean;
  debeEvitarSubdocumentacion: boolean;
  resultadoEsperado: string;
};

export type CasoFallidoAplicabilidadPreventiva = {
  id: string;
  descripcion: string;
  errores: string[];
  severidad: "menor" | "critico";
};

export type ResultadoBancoAplicabilidadPreventiva = {
  totalCasos: number;
  correctos: number;
  erroresMenores: number;
  erroresCriticos: number;
  porcentajeCumplimiento: number;
  fallidos: CasoFallidoAplicabilidadPreventiva[];
  patronesFalla: Record<string, number>;
  casosSimplesSobredocumentados: number;
  casosCriticosSubdocumentados: number;
};

const DOCUMENTOS_FORMALES: DocumentoPreventivoAplicable[] = [
  "procedimiento",
  "ast_art",
  "pts",
  "permiso_autorizacion",
  "matriz_riesgos",
];

const crearCasoSimple = (
  id: string,
  descripcion: string,
  contexto: ContextoAplicabilidadPreventiva,
  extras?: {
    documentosEsperados?: DocumentoPreventivoAplicable[];
    accionesEsperadas?: AccionAplicabilidadPreventiva[];
  },
): CasoPruebaAplicabilidadPreventiva => ({
  id,
  descripcion,
  contexto: {
    ...contexto,
    esHallazgoSimple: true,
    criticidadOrientativa: contexto.criticidadOrientativa ?? "bajo",
  },
  documentosEsperados: extras?.documentosEsperados ?? ["retiro_inmediato", "evidencia_registro"],
  documentosProhibidos: DOCUMENTOS_FORMALES,
  accionesEsperadas: extras?.accionesEsperadas ?? ["registrar_evidencia"],
  debeDetenerActividad: false,
  debePedirRevisionMatriz: false,
  debePedirControlCritico: false,
  debeEvitarSobredocumentacion: true,
  debeEvitarSubdocumentacion: true,
  resultadoEsperado: "Debe resolverse con control simple, evidencia y sin documentacion formal habilitante.",
});

const crearCasoCritico = (
  id: string,
  descripcion: string,
  contexto: ContextoAplicabilidadPreventiva,
  esperado: {
    documentos: DocumentoPreventivoAplicable[];
    acciones: AccionAplicabilidadPreventiva[];
    detener?: boolean;
    matriz?: boolean;
    controlCritico?: boolean;
  },
): CasoPruebaAplicabilidadPreventiva => ({
  id,
  descripcion,
  contexto: {
    ...contexto,
    criticidadOrientativa: contexto.criticidadOrientativa ?? "alto",
  },
  documentosEsperados: esperado.documentos,
  documentosProhibidos: [],
  accionesEsperadas: esperado.acciones,
  debeDetenerActividad: esperado.detener ?? true,
  debePedirRevisionMatriz: esperado.matriz ?? true,
  debePedirControlCritico: esperado.controlCritico ?? true,
  debeEvitarSobredocumentacion: true,
  debeEvitarSubdocumentacion: true,
  resultadoEsperado: "Debe activar documentacion o control habilitante segun criticidad y exposicion.",
});

const CASOS_SIMPLES: CasoPruebaAplicabilidadPreventiva[] = [
  crearCasoSimple("simple-001", "Vaso trizado retirado de inmediato desde comedor.", {
    objeto: "vaso trizado",
    condicion: "elemento menor retirado",
    controlFaltante: "reposicion",
  }),
  crearCasoSimple("simple-002", "Goma de piso despegada en acceso a casino sin caida reportada.", {
    objeto: "goma de piso",
    condicion: "despegada",
    exposicion: "transito peatonal bajo",
  }, { documentosEsperados: ["retiro_inmediato", "senalizacion_segregacion", "evidencia_registro"], accionesEsperadas: ["senalizar_segregar", "registrar_evidencia"] }),
  crearCasoSimple("simple-003", "Material menor en transito fue retirado del pasillo.", {
    objeto: "material menor",
    condicion: "en transito",
  }, { documentosEsperados: ["retiro_inmediato", "senalizacion_segregacion", "evidencia_registro"], accionesEsperadas: ["limpiar_area", "registrar_evidencia"] }),
  crearCasoSimple("simple-004", "Limpieza simple pendiente en sector de entrega.", {
    objeto: "limpieza simple",
    condicion: "polvo y restos menores",
  }, { accionesEsperadas: ["limpiar_area", "registrar_evidencia"] }),
  crearCasoSimple("simple-005", "Residuo comun en area de paso se retira durante inspeccion.", {
    objeto: "residuo comun",
    condicion: "no peligroso",
  }),
  crearCasoSimple("simple-006", "Senaletica menor caida en oficina de obra.", {
    objeto: "senalizacion menor",
    condicion: "caida",
  }, { documentosEsperados: ["retiro_inmediato", "senalizacion_segregacion", "evidencia_registro"], accionesEsperadas: ["senalizar_segregar", "registrar_evidencia"] }),
  crearCasoSimple("simple-007", "Dano menor de mobiliario sin exposicion operacional.", {
    objeto: "mobiliario",
    condicion: "dano menor",
  }),
  crearCasoSimple("simple-008", "Envase vacio no peligroso sin rotulacion retirado del meson.", {
    objeto: "envase vacio no peligroso",
    condicion: "sin rotulacion",
  }),
  crearCasoSimple("simple-009", "Cable ordenado fuera de zona de transito.", {
    objeto: "cable ordenado",
    condicion: "fuera de transito",
  }),
  crearCasoSimple("simple-010", "Herramienta menor retirada de servicio por desgaste visible.", {
    objeto: "herramienta menor retirada",
    condicion: "desgaste visible",
  }),
  crearCasoSimple("simple-011", "Vidrio pequeno quebrado retirado de inmediato.", {
    objeto: "vidrio pequeno",
    condicion: "quebrado",
  }),
  crearCasoSimple("simple-012", "Pintura fresca senalizada en pasillo administrativo.", {
    objeto: "pintura fresca senalizada",
    condicion: "controlada",
  }, { documentosEsperados: ["retiro_inmediato", "senalizacion_segregacion", "evidencia_registro"], accionesEsperadas: ["senalizar_segregar", "registrar_evidencia"] }),
  crearCasoSimple("simple-013", "Derrame menor de agua secado durante recorrido.", {
    objeto: "derrame menor de agua",
    condicion: "controlado",
  }, { accionesEsperadas: ["limpiar_area", "registrar_evidencia"] }),
  crearCasoSimple("simple-014", "Polvo menor controlado con limpieza en oficina.", {
    objeto: "polvo menor",
    condicion: "limpieza simple",
  }, { accionesEsperadas: ["limpiar_area", "registrar_evidencia"] }),
  crearCasoSimple("simple-015", "Caja mal ubicada retirada de inmediato.", {
    objeto: "caja mal ubicada",
    condicion: "retirada de inmediato",
  }),
  crearCasoSimple("simple-016", "Elemento suelto en repisa corregido en terreno.", {
    objeto: "elemento suelto",
    condicion: "corregido",
  }),
  crearCasoSimple("simple-017", "Reparacion menor de tapa plastica sin energia asociada.", {
    objeto: "reparacion menor",
    condicion: "sin energia",
  }),
  crearCasoSimple("simple-018", "Senalizacion menor desalineada se repone en acceso.", {
    objeto: "senalizacion menor",
    condicion: "desalineada",
  }, { documentosEsperados: ["retiro_inmediato", "senalizacion_segregacion", "evidencia_registro"], accionesEsperadas: ["senalizar_segregar", "registrar_evidencia"] }),
  crearCasoSimple("simple-019", "Residuo no peligroso simple en contenedor equivocado.", {
    objeto: "residuo no peligroso simple",
    condicion: "segregacion comun",
  }),
  crearCasoSimple("simple-020", "Mancha superficial seca en piso sin sustancia peligrosa.", {
    objeto: "limpieza simple",
    condicion: "mancha seca",
  }),
  crearCasoSimple("simple-021", "Etiqueta menor desprendida en caja de archivo.", {
    objeto: "dano menor",
    condicion: "etiqueta desprendida",
  }),
  crearCasoSimple("simple-022", "Borde de carton expuesto retirado de pasillo.", {
    objeto: "material menor",
    condicion: "retirado",
  }),
  crearCasoSimple("simple-023", "Tornillo suelto en silla se ajusta de inmediato.", {
    objeto: "elemento suelto",
    condicion: "ajuste menor",
  }),
  crearCasoSimple("simple-024", "Bolsa liviana en circulacion peatonal retirada.", {
    objeto: "material menor en transito",
    condicion: "retirada",
  }),
  crearCasoSimple("simple-025", "Papel mojado por agua limpia retirado del acceso.", {
    objeto: "derrame menor de agua",
    condicion: "limpieza simple",
  }),
  crearCasoSimple("simple-026", "Protector plastico de esquina desprendido sin filo expuesto.", {
    objeto: "dano menor",
    condicion: "sin exposicion",
  }),
  crearCasoSimple("simple-027", "Bandeja vacia en meson fue reubicada.", {
    objeto: "material menor",
    condicion: "reubicada",
  }),
  crearCasoSimple("simple-028", "Cinta de advertencia vieja retirada tras finalizar tarea.", {
    objeto: "senalizacion menor",
    condicion: "retiro inmediato",
  }, { documentosEsperados: ["retiro_inmediato", "senalizacion_segregacion", "evidencia_registro"], accionesEsperadas: ["senalizar_segregar", "registrar_evidencia"] }),
  crearCasoSimple("simple-029", "Lapiz cortante en escritorio retirado de uso.", {
    objeto: "herramienta menor retirada",
    condicion: "retirada",
  }),
  crearCasoSimple("simple-030", "Restos menores de embalaje se limpian al cierre.", {
    objeto: "limpieza simple",
    condicion: "residuo comun",
  }, { accionesEsperadas: ["limpiar_area", "registrar_evidencia"] }),
  crearCasoSimple("simple-031", "Marco decorativo con dano menor sin riesgo de caida.", {
    objeto: "dano menor",
    condicion: "sin exposicion operacional",
  }),
  crearCasoSimple("simple-032", "Gota de agua junto a lavamanos secada inmediatamente.", {
    objeto: "derrame menor de agua",
    condicion: "secado inmediato",
  }, { accionesEsperadas: ["limpiar_area", "registrar_evidencia"] }),
  crearCasoSimple("simple-033", "Separador de fila fuera de posicion se reubica.", {
    objeto: "elemento suelto",
    condicion: "reubicado",
  }),
  crearCasoSimple("simple-034", "Aviso impreso caido se vuelve a fijar.", {
    objeto: "senalizacion menor",
    condicion: "repuesta",
  }, { documentosEsperados: ["retiro_inmediato", "senalizacion_segregacion", "evidencia_registro"], accionesEsperadas: ["senalizar_segregar", "registrar_evidencia"] }),
  crearCasoSimple("simple-035", "Pequena astilla de madera retirada del acceso.", {
    objeto: "material menor",
    condicion: "retirada",
  }),
  crearCasoSimple("simple-036", "Malla plastica de embalaje guardada fuera del paso.", {
    objeto: "material menor en transito",
    condicion: "reubicada",
  }),
  crearCasoSimple("simple-037", "Portavaso trizado se cambia por reposicion simple.", {
    objeto: "vaso trizado",
    condicion: "reposicion",
  }),
  crearCasoSimple("simple-038", "Residuo comun seco retirado del borde de acceso.", {
    objeto: "residuo comun",
    condicion: "retiro inmediato",
  }),
  crearCasoSimple("simple-039", "Goma protectora menor se pega nuevamente sin exposicion.", {
    objeto: "goma de piso",
    condicion: "reparacion menor",
  }),
  crearCasoSimple("simple-040", "Funda plastica rota retirada de mobiliario.", {
    objeto: "dano menor",
    condicion: "retirada",
  }),
];

const CASOS_CRITICOS: CasoPruebaAplicabilidadPreventiva[] = [
  crearCasoCritico("critico-001", "Trabajador sin arnes a 3 metros.", {
    objeto: "trabajador sin arnes a 3 metros",
    condicion: "sin sistema personal de detencion",
    hayTrabajoAltura: true,
  }, { documentos: ["pts", "permiso_autorizacion", "matriz_riesgos"], acciones: ["detener_actividad", "verificar_control_critico"] }),
  crearCasoCritico("critico-002", "Trabajo en caliente sin permiso.", {
    objeto: "soldadura",
    condicion: "sin permiso de trabajo en caliente",
    hayTrabajoCaliente: true,
  }, { documentos: ["permiso_autorizacion", "pts", "matriz_riesgos"], acciones: ["detener_actividad", "verificar_control_critico"] }),
  crearCasoCritico("critico-003", "Equipo intervenido sin bloqueo LOTO.", {
    objeto: "equipo intervenido",
    condicion: "sin bloqueo loto",
    hayEnergiaPeligrosa: true,
  }, { documentos: ["bloqueo_loto", "permiso_autorizacion", "matriz_riesgos"], acciones: ["bloquear_energia", "detener_actividad"] }),
  crearCasoCritico("critico-004", "Excavacion sin entibacion.", {
    objeto: "excavacion",
    condicion: "sin entibacion",
    hayExcavacion: true,
  }, { documentos: ["pts", "permiso_autorizacion", "matriz_riesgos"], acciones: ["detener_actividad", "verificar_control_critico"] }),
  crearCasoCritico("critico-005", "Excavacion sin proteccion perimetral.", {
    objeto: "excavacion",
    condicion: "sin proteccion perimetral",
    hayExcavacion: true,
  }, { documentos: ["senalizacion_segregacion", "pts", "matriz_riesgos"], acciones: ["senalizar_segregar", "detener_actividad"] }),
  crearCasoCritico("critico-006", "Area de izaje sin segregacion.", {
    objeto: "area de izaje",
    condicion: "sin segregacion",
    hayIzaje: true,
  }, { documentos: ["senalizacion_segregacion", "permiso_autorizacion", "matriz_riesgos"], acciones: ["senalizar_segregar", "detener_actividad"] }),
  crearCasoCritico("critico-007", "Trabajador pasa bajo carga suspendida.", {
    objeto: "carga suspendida",
    condicion: "paso bajo carga",
    hayCargaSuspendida: true,
  }, { documentos: ["permiso_autorizacion", "senalizacion_segregacion", "matriz_riesgos"], acciones: ["detener_actividad", "verificar_control_critico"] }),
  crearCasoCritico("critico-008", "Gasolina en bidon no certificado.", {
    objeto: "gasolina en bidon no certificado",
    condicion: "combustible sin envase certificado",
    haySustanciaPeligrosa: true,
    criticidadOrientativa: "medio",
  }, { documentos: ["hds_sds", "control_ambiental", "matriz_riesgos"], acciones: ["controlar_derrame", "verificar_control_critico"], detener: false }),
  crearCasoCritico("critico-009", "Bodega sin HDS disponible.", {
    objeto: "bodega sin hds",
    condicion: "documento no disponible",
    haySustanciaPeligrosa: true,
    criticidadOrientativa: "medio",
  }, { documentos: ["hds_sds", "inspeccion", "matriz_riesgos"], acciones: ["verificar_control_critico"], detener: false }),
  crearCasoCritico("critico-010", "Derrame de combustible al suelo.", {
    objeto: "derrame de combustible al suelo",
    condicion: "impacto ambiental potencial",
    hayDerrame: true,
    haySustanciaPeligrosa: true,
    hayAmbienteAfectado: true,
    criticidadOrientativa: "medio",
  }, { documentos: ["hds_sds", "control_ambiental", "matriz_riesgos"], acciones: ["controlar_derrame", "registrar_evidencia"], detener: false }),
  crearCasoCritico("critico-011", "Residuo peligroso mal segregado.", {
    objeto: "residuo peligroso",
    condicion: "mal segregado",
    haySustanciaPeligrosa: true,
    hayAmbienteAfectado: true,
    criticidadOrientativa: "medio",
  }, { documentos: ["hds_sds", "control_ambiental", "matriz_riesgos"], acciones: ["controlar_derrame", "verificar_control_critico"], detener: false }),
  crearCasoCritico("critico-012", "Sustancia sin rotulacion.", {
    objeto: "sustancia quimica",
    condicion: "sin rotulacion",
    haySustanciaPeligrosa: true,
    criticidadOrientativa: "medio",
  }, { documentos: ["hds_sds", "inspeccion", "matriz_riesgos"], acciones: ["verificar_control_critico"], detener: false }),
  crearCasoCritico("critico-013", "Matriz de riesgo sin actualizar para tarea critica.", {
    objeto: "matriz de riesgo",
    condicion: "sin actualizar para tarea critica",
    esTrabajoCritico: true,
  }, { documentos: ["matriz_riesgos", "pts", "ast_art"], acciones: ["regularizar_documento", "verificar_control_critico"] }),
  crearCasoCritico("critico-014", "PTS faltante en trabajo critico.", {
    objeto: "pts",
    condicion: "faltante en trabajo critico",
    esTrabajoCritico: true,
  }, { documentos: ["pts", "matriz_riesgos", "permiso_autorizacion"], acciones: ["regularizar_documento", "detener_actividad"] }),
  crearCasoCritico("critico-015", "AST/ART faltante en tarea de riesgo.", {
    objeto: "ast art",
    condicion: "faltante en tarea de riesgo",
    esTrabajoCritico: true,
  }, { documentos: ["ast_art", "matriz_riesgos"], acciones: ["regularizar_documento", "verificar_control_critico"] }),
  crearCasoCritico("critico-016", "Certificacion vencida de eslinga.", {
    objeto: "eslinga con certificacion vencida",
    condicion: "equipo de izaje no vigente",
    hayIzaje: true,
    hayEquipoCritico: true,
  }, { documentos: ["certificacion_mantencion", "inspeccion", "matriz_riesgos"], acciones: ["detener_actividad", "retirar_condicion"] }),
  crearCasoCritico("critico-017", "Equipo critico sin mantencion.", {
    objeto: "equipo critico",
    condicion: "sin mantencion",
    hayEquipoCritico: true,
  }, { documentos: ["certificacion_mantencion", "inspeccion"], acciones: ["detener_actividad", "verificar_control_critico"] }),
  crearCasoCritico("critico-018", "Tablero electrico sin proteccion.", {
    objeto: "tablero electrico",
    condicion: "sin proteccion",
    hayEnergiaPeligrosa: true,
  }, { documentos: ["bloqueo_loto", "procedimiento", "matriz_riesgos"], acciones: ["bloquear_energia", "detener_actividad"] }),
  crearCasoCritico("critico-019", "Conduccion imprudente en obra.", {
    objeto: "vehiculo",
    condicion: "conduccion imprudente",
    hayMaquinariaMovil: true,
  }, { documentos: ["procedimiento", "matriz_riesgos", "senalizacion_segregacion"], acciones: ["detener_actividad", "senalizar_segregar"] }),
  crearCasoCritico("critico-020", "Ingreso a zona restringida sin autorizacion.", {
    objeto: "zona restringida",
    condicion: "sin autorizacion",
    hayControlCriticoAusente: true,
  }, { documentos: ["permiso_autorizacion", "matriz_riesgos"], acciones: ["detener_actividad", "verificar_control_critico"] }),
  crearCasoCritico("critico-021", "Espacio confinado sin permiso de ingreso.", {
    objeto: "espacio confinado",
    condicion: "sin permiso",
    hayEspacioConfinado: true,
  }, { documentos: ["permiso_autorizacion", "pts", "matriz_riesgos"], acciones: ["detener_actividad", "verificar_control_critico"] }),
  crearCasoCritico("critico-022", "Demolicion sin segregacion ni autorizacion.", {
    objeto: "demolicion",
    condicion: "sin segregacion ni autorizacion",
    hayDemolicion: true,
  }, { documentos: ["permiso_autorizacion", "pts", "senalizacion_segregacion"], acciones: ["detener_actividad", "senalizar_segregar"] }),
  crearCasoCritico("critico-023", "Andamio sin tarjeta de liberacion.", {
    objeto: "andamio",
    condicion: "sin inspeccion vigente",
    hayTrabajoAltura: true,
  }, { documentos: ["inspeccion", "pts", "permiso_autorizacion"], acciones: ["detener_actividad", "verificar_control_critico"] }),
  crearCasoCritico("critico-024", "Linea de vida sin certificacion.", {
    objeto: "linea de vida",
    condicion: "sin certificacion",
    hayTrabajoAltura: true,
    hayEquipoCritico: true,
  }, { documentos: ["certificacion_mantencion", "inspeccion", "pts"], acciones: ["detener_actividad", "verificar_control_critico"] }),
  crearCasoCritico("critico-025", "Grillete deteriorado usado en izaje.", {
    objeto: "grillete deteriorado",
    condicion: "usado en izaje",
    hayIzaje: true,
    hayEquipoCritico: true,
  }, { documentos: ["certificacion_mantencion", "inspeccion", "permiso_autorizacion"], acciones: ["detener_actividad", "retirar_condicion"] }),
  crearCasoCritico("critico-026", "Maquinaria movil sin inspeccion preoperacional.", {
    objeto: "maquinaria movil",
    condicion: "sin inspeccion",
    hayMaquinariaMovil: true,
  }, { documentos: ["inspeccion", "certificacion_mantencion", "matriz_riesgos"], acciones: ["detener_actividad", "verificar_control_critico"] }),
  crearCasoCritico("critico-027", "Retroexcavadora operando sin segregacion peatonal.", {
    objeto: "retroexcavadora",
    condicion: "sin segregacion peatonal",
    hayMaquinariaMovil: true,
  }, { documentos: ["senalizacion_segregacion", "procedimiento", "matriz_riesgos"], acciones: ["senalizar_segregar", "detener_actividad"] }),
  crearCasoCritico("critico-028", "Zanja abierta con trabajadores expuestos.", {
    objeto: "zanja abierta",
    condicion: "trabajadores expuestos",
    hayExcavacion: true,
  }, { documentos: ["senalizacion_segregacion", "pts", "matriz_riesgos"], acciones: ["detener_actividad", "senalizar_segregar"] }),
  crearCasoCritico("critico-029", "Soldadura cerca de combustible sin control.", {
    objeto: "soldadura y combustible",
    condicion: "sin control",
    hayTrabajoCaliente: true,
    haySustanciaPeligrosa: true,
  }, { documentos: ["permiso_autorizacion", "hds_sds", "matriz_riesgos"], acciones: ["detener_actividad", "verificar_control_critico"] }),
  crearCasoCritico("critico-030", "Intervencion electrica con energia presente.", {
    objeto: "intervencion electrica",
    condicion: "energia presente",
    hayEnergiaPeligrosa: true,
  }, { documentos: ["bloqueo_loto", "permiso_autorizacion", "matriz_riesgos"], acciones: ["bloquear_energia", "detener_actividad"] }),
  crearCasoCritico("critico-031", "Extintor critico sin mantencion vigente en bodega de combustibles.", {
    objeto: "extintor",
    condicion: "sin mantencion vigente",
    hayEquipoCritico: true,
    haySustanciaPeligrosa: true,
    criticidadOrientativa: "medio",
  }, { documentos: ["certificacion_mantencion", "inspeccion", "hds_sds"], acciones: ["verificar_control_critico"], detener: false }),
  crearCasoCritico("critico-032", "Kit de derrame incompleto en zona de trasvasije.", {
    objeto: "kit de derrame",
    condicion: "incompleto",
    hayDerrame: true,
    haySustanciaPeligrosa: true,
    criticidadOrientativa: "medio",
  }, { documentos: ["control_ambiental", "hds_sds", "inspeccion"], acciones: ["controlar_derrame", "verificar_control_critico"], detener: false }),
  crearCasoCritico("critico-033", "Operador sin autorizacion para equipo movil.", {
    objeto: "operador equipo movil",
    condicion: "sin autorizacion",
    hayMaquinariaMovil: true,
  }, { documentos: ["permiso_autorizacion", "certificacion_mantencion", "matriz_riesgos"], acciones: ["detener_actividad", "verificar_control_critico"] }),
  crearCasoCritico("critico-034", "Permiso vencido para excavacion activa.", {
    objeto: "permiso excavacion",
    condicion: "vencido",
    hayExcavacion: true,
  }, { documentos: ["permiso_autorizacion", "pts", "matriz_riesgos"], acciones: ["detener_actividad", "regularizar_documento"] }),
  crearCasoCritico("critico-035", "Charla no difundida para cambio de metodo critico.", {
    objeto: "charla difusion",
    condicion: "no difundida",
    esTrabajoCritico: true,
  }, { documentos: ["charla_difusion", "matriz_riesgos", "ast_art"], acciones: ["regularizar_documento", "verificar_control_critico"] }),
  crearCasoCritico("critico-036", "Control critico de borde no verificado antes de trabajar.", {
    objeto: "borde de losa",
    condicion: "control critico no verificado",
    hayTrabajoAltura: true,
    hayControlCriticoAusente: true,
  }, { documentos: ["inspeccion", "pts", "matriz_riesgos"], acciones: ["detener_actividad", "verificar_control_critico"] }),
  crearCasoCritico("critico-037", "Sustancia peligrosa almacenada junto a incompatible.", {
    objeto: "sustancia peligrosa",
    condicion: "incompatibilidad",
    haySustanciaPeligrosa: true,
    criticidadOrientativa: "medio",
  }, { documentos: ["hds_sds", "control_ambiental", "inspeccion"], acciones: ["verificar_control_critico"], detener: false }),
  crearCasoCritico("critico-038", "Carga suspendida sin rigger identificado.", {
    objeto: "carga suspendida",
    condicion: "sin rigger",
    hayCargaSuspendida: true,
  }, { documentos: ["permiso_autorizacion", "procedimiento", "matriz_riesgos"], acciones: ["detener_actividad", "verificar_control_critico"] }),
  crearCasoCritico("critico-039", "Equipo con guarda retirada durante operacion.", {
    objeto: "equipo en operacion",
    condicion: "guarda retirada",
    hayEquipoCritico: true,
    hayControlCriticoAusente: true,
  }, { documentos: ["procedimiento", "inspeccion", "matriz_riesgos"], acciones: ["detener_actividad", "verificar_control_critico"] }),
  crearCasoCritico("critico-040", "Tarea no cubierta por matriz con exposicion grave.", {
    objeto: "actividad no cubierta por matriz",
    condicion: "exposicion grave",
    esTrabajoCritico: true,
    hayControlCriticoAusente: true,
  }, { documentos: ["matriz_riesgos", "ast_art", "pts"], acciones: ["detener_actividad", "regularizar_documento"] }),
];

export const CASOS_PRUEBA_APLICABILIDAD_PREVENTIVA: CasoPruebaAplicabilidadPreventiva[] = [
  ...CASOS_SIMPLES,
  ...CASOS_CRITICOS,
];

const agregarPatron = (patrones: Record<string, number>, patron: string) => {
  patrones[patron] = (patrones[patron] ?? 0) + 1;
};

export const evaluarBancoAplicabilidadPreventiva = (): ResultadoBancoAplicabilidadPreventiva => {
  const fallidos: CasoFallidoAplicabilidadPreventiva[] = [];
  const patronesFalla: Record<string, number> = {};
  let casosSimplesSobredocumentados = 0;
  let casosCriticosSubdocumentados = 0;

  for (const caso of CASOS_PRUEBA_APLICABILIDAD_PREVENTIVA) {
    const resultado = evaluarAplicabilidadPreventiva(caso.contexto);
    const errores: string[] = [];
    const faltaDocumento = caso.documentosEsperados.filter(
      (documento) => !resultado.documentosAplicables.includes(documento),
    );
    const documentoProhibido = caso.documentosProhibidos.filter(
      (documento) => resultado.documentosAplicables.includes(documento),
    );
    const faltaAccion = caso.accionesEsperadas.filter(
      (accion) => !resultado.accionesAplicables.includes(accion),
    );

    if (faltaDocumento.length > 0) {
      errores.push(`Faltan documentos o controles: ${faltaDocumento.join(", ")}`);
      agregarPatron(patronesFalla, "documento_esperado_ausente");
    }
    if (documentoProhibido.length > 0) {
      errores.push(`Activa documentos prohibidos: ${documentoProhibido.join(", ")}`);
      agregarPatron(patronesFalla, "sobredocumentacion");
    }
    if (faltaAccion.length > 0) {
      errores.push(`Faltan acciones: ${faltaAccion.join(", ")}`);
      agregarPatron(patronesFalla, "accion_esperada_ausente");
    }
    if (resultado.requiereDetencionActividad !== caso.debeDetenerActividad) {
      errores.push("Detencion de actividad no coincide con lo esperado.");
      agregarPatron(patronesFalla, "detencion_incorrecta");
    }
    if (resultado.requiereRevisionMatriz !== caso.debePedirRevisionMatriz) {
      errores.push("Revision de matriz no coincide con lo esperado.");
      agregarPatron(patronesFalla, "revision_matriz_incorrecta");
    }
    if (resultado.requiereControlCritico !== caso.debePedirControlCritico) {
      errores.push("Control critico no coincide con lo esperado.");
      agregarPatron(patronesFalla, "control_critico_incorrecto");
    }
    if (caso.debeEvitarSobredocumentacion && resultado.riesgoSobredocumentacion) {
      errores.push("Caso sobredocumentado.");
      casosSimplesSobredocumentados += caso.contexto.esHallazgoSimple ? 1 : 0;
      agregarPatron(patronesFalla, "caso_simple_sobredocumentado");
    }
    if (caso.debeEvitarSubdocumentacion && resultado.riesgoSubdocumentacion) {
      errores.push("Caso subdocumentado.");
      casosCriticosSubdocumentados += caso.contexto.esHallazgoSimple ? 0 : 1;
      agregarPatron(patronesFalla, "caso_critico_subdocumentado");
    }

    if (errores.length > 0) {
      const severidad = documentoProhibido.length > 0 || resultado.riesgoSubdocumentacion ? "critico" : "menor";
      fallidos.push({
        id: caso.id,
        descripcion: caso.descripcion,
        errores,
        severidad,
      });
    }
  }

  const erroresCriticos = fallidos.filter((fallido) => fallido.severidad === "critico").length;
  const erroresMenores = fallidos.length - erroresCriticos;
  const correctos = CASOS_PRUEBA_APLICABILIDAD_PREVENTIVA.length - fallidos.length;

  return {
    totalCasos: CASOS_PRUEBA_APLICABILIDAD_PREVENTIVA.length,
    correctos,
    erroresMenores,
    erroresCriticos,
    porcentajeCumplimiento: Math.round((correctos / CASOS_PRUEBA_APLICABILIDAD_PREVENTIVA.length) * 100),
    fallidos,
    patronesFalla,
    casosSimplesSobredocumentados,
    casosCriticosSubdocumentados,
  };
};
