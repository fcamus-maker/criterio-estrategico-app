export type EstadoHallazgo =
  | "Reportado"
  | "Evaluado"
  | "En gestión"
  | "Cerrado"
  | "informado"
  | "abierto"
  | "cerrado";

export type CriticidadHallazgo =
  | "Bajo"
  | "Medio"
  | "Alto"
  | "Crítico"
  | "CRÍTICO"
  | "ALTO"
  | "MEDIO"
  | "BAJO";

export interface SeguimientoCierre {
  responsableCierreNombre: string;
  responsableCierreCargo: string;
  responsableCierreEmpresa: string;
  responsableCierreTelefono: string;
  fechaCompromisoCierre: string;
  fechaMaximaPermitidaCierre?: string;
  plazoCierrePorCriticidad?: string;
  observacionInicialSeguimiento: string;
  estadoCierre: "Pendiente de cierre" | "En gestión" | "Cerrado";
}

export type EvidenciaFoto =
  | string
  | {
      url?: string;
      src?: string;
      preview?: string;
      base64?: string;
      dataUrl?: string;
    };

export interface Hallazgo {
  id?: number;
  codigo?: string;
  codigoInforme?: string;
  codigoReporte?: string;
  codigo_reporte?: string;
  estado?: EstadoHallazgo;

  area?: string;
  responsable?: string;
  cargo?: string;
  fecha?: string;
  hora?: string;
  horaReporte?: string;
  proyecto?: string;
  obra?: string;
  empresa?: string;
  empresaSigla?: string;
  siglaEmpresa?: string;
  siglaProyecto?: string;
  siglaObra?: string;
  descripcion?: string;
  detalle?: string;
  fotos?: EvidenciaFoto[];
  imagenes?: EvidenciaFoto[];
  criticidad?: CriticidadHallazgo;
  nivelCriticidad?: CriticidadHallazgo;
  nivel?: CriticidadHallazgo;
  fechaInforme?: string;

  reporte?: {
    area?: string;
    responsable?: string;
    cargo?: string;
    fecha?: string;
    hora?: string;
    descripcion?: string;
    fotos?: EvidenciaFoto[];
    imagenes?: EvidenciaFoto[];
    evidencias?: EvidenciaFoto[];
    proyecto?: string;
    obra?: string;
    empresa?: string;
    empresaSigla?: string;
    siglaEmpresa?: string;
    siglaProyecto?: string;
    siglaObra?: string;
    codigoInforme?: string;
    codigoReporte?: string;
    codigo_reporte?: string;
  };

  contexto?: {
    obra?: string;
    empresa?: string;
  };

  evaluacion?: {
    respuestas?: Record<string, string>;
    criticidad?: CriticidadHallazgo;
  };

  resultado?: {
    puntajeBloque1?: number;
    puntajeBloque2?: number;
    puntajeBloque3?: number;
    puntajeFinal?: number;
    criticidad?: CriticidadHallazgo;
    nivel?: CriticidadHallazgo;
    prioridad?: "Baja" | "Media" | "Alta" | "Urgente";
    recomendacion?: string | string[];
    accionInmediata?: string;
  };

  resultadoFinal?: Record<string, unknown> & {
    criticidad?: CriticidadHallazgo;
    nivel?: CriticidadHallazgo;
  };

  bloque1?: Record<string, string>;
  bloque2?: Record<string, string>;
  bloque3?: Record<string, string>;

  informeFinal?: Record<string, unknown>;
  seguimientoCierre?: SeguimientoCierre;

  correlativo?: string | number;
  numeroRegistro?: string | number;
  numero?: string | number;
}
