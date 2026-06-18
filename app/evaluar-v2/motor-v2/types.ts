export type Criticidad = "BAJO" | "MEDIO" | "ALTO" | "CRITICO";

export type AmbitoEvaluacion =
  | "seguridad_laboral"
  | "salud_ocupacional"
  | "medio_ambiente"
  | "legal_documental"
  | "emergencia"
  | "mixto";

export type TipoEvento =
  | "condicion_subestandar"
  | "acto_inseguro"
  | "incidente"
  | "casi_accidente"
  | "aspecto_ambiental"
  | "impacto_ambiental"
  | "desviacion_legal_documental"
  | "emergencia"
  | "otro";

export type CategoriaHallazgoV2 =
  | "orden_aseo_objeto_fuera_lugar"
  | "transito_caida_mismo_nivel"
  | "caida_altura"
  | "electrico"
  | "maquinaria_equipos"
  | "herramientas_equipos"
  | "izaje_carga_suspendida"
  | "excavaciones"
  | "espacios_confinados"
  | "incendio_emergencia"
  | "derrame_fuga"
  | "sustancias_peligrosas"
  | "residuos"
  | "emisiones_polvo_humos"
  | "ruido_agentes_fisicos"
  | "exposicion_quimica"
  | "exposicion_biologica"
  | "ambiental_general"
  | "aspectos_ambientales"
  | "impactos_ambientales_reales"
  | "salud_ocupacional_ruido_polvo_quimicos"
  | "legal_documental"
  | "procedimientos_ast_permisos"
  | "induccion_capacitacion_autorizacion"
  | "documentos_legales_preventivos"
  | "evacuacion"
  | "senalizacion"
  | "elementos_proteccion_personal"
  | "comunidad_terceros"
  | "rca_permisos_ambientales"
  | "condiciones_sanitarias_ambientales"
  | "conductas_inseguras"
  | "condiciones_subestandar"
  | "casi_accidentes"
  | "incidentes_con_sin_lesion"
  | "mixto_seguridad_ambiente_legal"
  | "otro_indeterminado";

export type ModuloPreguntasV2 = CategoriaHallazgoV2;

export type ConfianzaClasificacionV2 = "baja" | "media" | "alta";

export type PreguntaSugeridaMotorV2 = {
  id: string;
  modulo: ModuloPreguntasV2;
  texto: string;
  objetivo: string;
};

export type TipoRespuestaPreventiva =
  | "si_no"
  | "cumplimiento"
  | "estado_equipo"
  | "evidencia"
  | "texto_breve"
  | "ambito_general"
  | "consecuencia_principal"
  | "control_existente"
  | "aplicabilidad_documental";

export type AmbitoPreventivo =
  | "seguridad_trabajadores"
  | "medio_ambiente"
  | "dano_material"
  | "documental_legal"
  | "operacional"
  | "mixto"
  | "no_verificable";

export type SubtipoPreventivo =
  | "condicion_insegura"
  | "acto_inseguro"
  | "brecha_documental"
  | "incumplimiento_procedimiento"
  | "equipo_herramienta_mal_estado"
  | "sustancia_peligrosa"
  | "equipo_emergencia"
  | "transito_transporte"
  | "orden_aseo"
  | "instalacion_electrica"
  | "trabajo_critico"
  | "epp"
  | "mantencion_certificacion"
  | "capacitacion_difusion"
  | "evidencia_registro"
  | "otro";

export type BibliotecaPreventivaId =
  | "seguridad_trabajadores"
  | "medio_ambiente"
  | "dano_material"
  | "documental_legal"
  | "sustancias_peligrosas_hds"
  | "equipos_emergencia"
  | "transito_transporte"
  | "electrico_herramientas"
  | "orden_aseo"
  | "trabajos_criticos"
  | "epp"
  | "mantencion_certificacion"
  | "capacitacion_difusion"
  | "evidencias_registros";

export type OpcionPreventiva = {
  label: string;
  value: string;
  score?: number;
  requiereTexto?: boolean;
  marcaNoAplica?: boolean;
};

export type EfectoPreguntaPreventiva = {
  clasificacion?: string[];
  criticidad?: string[];
  recomendacion?: string[];
};

export type PreguntaPreventivaTipada = {
  id: string;
  textoVisible: string;
  objetivoTecnico: string;
  tipoRespuesta: TipoRespuestaPreventiva;
  opciones?: OpcionPreventiva[];
  cuandoAplica: string[];
  cuandoNoAplica?: string[];
  datoTecnicoCaptura: string;
  efecto: EfectoPreguntaPreventiva;
};

export type BibliotecaPreventiva = {
  id: BibliotecaPreventivaId;
  nombreVisible: string;
  ambito: AmbitoPreventivo;
  subtipos: SubtipoPreventivo[];
  controlesEsperados: string[];
  documentosAplicables: string[];
  consecuenciasProbables: string[];
  accionesInmediatas: string[];
  recomendacionesBase: string[];
  normativaProbable: string[];
  cuandoAplica: string[];
  cuandoNoAplica: string[];
};

export type ClasificacionHallazgoV2 = {
  categoriaDetectada: CategoriaHallazgoV2;
  ambitoSugerido: AmbitoEvaluacion;
  ambitosSecundariosSugeridos: AmbitoEvaluacion[];
  tipoEventoSugerido: TipoEvento;
  moduloPreguntasSugerido: ModuloPreguntasV2;
  confianza: ConfianzaClasificacionV2;
  palabrasClaveDetectadas: string[];
  criticidadBaseSugerida?: Criticidad;
  topeCriticidadSugerido?: Criticidad;
  senalesElevanCriticidad: string[];
  senalesPermitenCritico: string[];
  normativaProbableSugerida: string[];
  requiereRevisionManual: boolean;
  requierePreguntasAmbientales: boolean;
  requierePreguntasLegales: boolean;
  requierePreguntasSeguridad: boolean;
  requierePreguntasSalud: boolean;
  advertencias: string[];
  justificacionModuloPreguntas: string;
};

export type ExposicionPersonas = "sin_exposicion" | "potencial" | "directa";
export type ExposicionAmbiental = "sin_exposicion" | "potencial" | "directa";
export type Consecuencia = "leve" | "moderada" | "grave" | "fatal";
export type Probabilidad = "baja" | "media" | "alta";
export type ControlesExistentes = "suficientes" | "parciales" | "inexistentes";

export type NivelConfianzaNormativa =
  | "validado"
  | "pendiente_validacion"
  | "no_mostrar_usuario_final";

export type RespuestaEvaluacionV2 =
  | string
  | number
  | boolean
  | string[]
  | null
  | undefined
  | Record<string, unknown>;

export type DatosAmbientales = {
  existeAspectoAmbiental?: boolean;
  existeImpactoAmbiental?: boolean;
  riesgoImpactoAmbiental?: "bajo" | "medio" | "alto" | boolean;
  afectaSuelo?: boolean;
  afectaAgua?: boolean;
  afectaAire?: boolean;
  afectaFloraFauna?: boolean;
  afectaComunidad?: boolean;
  derrameOFuga?: boolean;
  sustanciaPeligrosa?: boolean;
  residuoPeligroso?: boolean;
  contenido?: boolean;
  requiereContencion?: boolean;
  requiereNotificacion?: boolean;
  permisoRCAAsociado?: boolean;
};

export type DatosLegales = {
  documentoFaltante?: boolean;
  permisoFaltante?: boolean;
  procedimientoFaltante?: boolean;
  matrizFaltante?: boolean;
  astPtpPtsFaltante?: boolean;
  induccionFaltante?: boolean;
  faltaHabilitaActividadRiesgosa?: boolean;
  normaDeclarada?: string;
};

export type NormativaAplicable = {
  norma: string;
  materia: string;
  articulo?: string;
  fuente: string;
  nivelConfianza: NivelConfianzaNormativa;
  requiereValidacionLegal: boolean;
  aplicaCuando: string;
};

export type EvaluacionInputV2 = {
  tipoHallazgo: string;
  descripcion: string;
  area: string;
  actividad: string;
  respuestas: Record<string, RespuestaEvaluacionV2>;
  ambitoDeclarado?: AmbitoEvaluacion;
  exposicionPersonas?: ExposicionPersonas;
  exposicionAmbiental?: ExposicionAmbiental;
  consecuencia?: Consecuencia;
  probabilidad?: Probabilidad;
  controlesExistentes?: ControlesExistentes;
  requiereSuspensionDeclarada?: boolean;
  datosAmbientales?: DatosAmbientales;
  datosLegales?: DatosLegales;
  evidenciaDisponible?: boolean;
};

export type EvaluacionResultadoV2 = {
  ambitoPrincipal: AmbitoEvaluacion;
  ambitosSecundarios: AmbitoEvaluacion[];
  tipoEvento: TipoEvento;
  criticidadBase: Criticidad;
  criticidadFinal: Criticidad;
  senalesCriticas: string[];
  factoresElevadores: string[];
  factoresLimitantes: string[];
  inconsistencias: string[];
  requiereRevisionManual: boolean;
  medidaInmediata: string;
  plazoSugerido: string;
  requiereSuspension: boolean;
  requiereContencionAmbiental: boolean;
  normativaProbable: NormativaAplicable[];
  justificacionTecnica: string;
  resumenEjecutivo: string;
  categoriaDetectada: CategoriaHallazgoV2;
  moduloPreguntasSugerido: ModuloPreguntasV2;
  preguntasSugeridas: PreguntaSugeridaMotorV2[];
  preguntasCriticasRespondidas: string[];
  preguntasFaltantesRecomendadas: PreguntaSugeridaMotorV2[];
  justificacionModuloPreguntas: string;
  confianzaClasificacion: ConfianzaClasificacionV2;
  palabrasClaveDetectadas: string[];
};

export type CasoPruebaMotorV2 = {
  nombre: string;
  input: EvaluacionInputV2;
  criticidadEsperada: Criticidad | Criticidad[];
  categoriaEsperada?: CategoriaHallazgoV2;
  ambitoEsperado?: AmbitoEvaluacion;
  tipoEventoEsperado?: TipoEvento;
  observacionEsperada: string;
};

export type ResultadoCasoPruebaMotorV2 = {
  nombre: string;
  criticidadEsperada: Criticidad | Criticidad[];
  criticidadObtenida: Criticidad;
  categoriaDetectada: CategoriaHallazgoV2;
  ambitoPrincipal: AmbitoEvaluacion;
  tipoEvento: TipoEvento;
  aprobado: boolean;
  observacion: string;
};
