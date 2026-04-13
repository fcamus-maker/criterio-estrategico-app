export interface Hallazgo {
  id: number;
  estado: "abierto" | "cerrado";
  reporte: {
    area: string;
    responsable: string;
    fecha: string;
    descripcion: string;
    fotos: string[];
  };
}

  reporte: {
    area: string;
    responsable: string;
    fecha: string;
    descripcion: string;
    fotos: string[];
  };

    evaluacion: {
    respuestas: Record<string, string>;
  };

  bloque1: {
    tipoPeligro: string;
    tipoDesviacion: string;
    severidadPotencial: string;
    personasExpuestas: string;
    frecuenciaExposicion: string;
  };

  bloque2: {
    tareaEnEjecucion: string;
    peligroActivo: string;
    ocurrenciaInmediata: string;
    areaControlada: string;
    controlesVisibles: string;
    trabajoDetenido: string;
    repeticionInmediata: string;
  };

  bloque3: {
    existePTS: string;
    ptsVigente: string;
    trabajadorCapacitado: string;
    registroCapacitacion: string;
    charla5Minutos: string;
    existeASTIPER: string;
    riesgosIdentificados: string;
    permisosAplicables: string;
    permisosVigentes: string;
    supervisionInformada: string;
  };

  resultado: {
    puntajeBloque1: number;
    puntajeBloque2: number;
    puntajeBloque3: number;
    puntajeFinal: number;
    criticidad: "Bajo" | "Medio" | "Alto" | "Crítico";
    prioridad: "Baja" | "Media" | "Alta" | "Urgente";
    recomendacion: string;
    accionInmediata: string;
  };

  estado: "Reportado" | "Evaluado" | "En gestión" | "Cerrado";
};