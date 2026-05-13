export type CriticidadKpiGerencial = "CRITICO" | "ALTO" | "MEDIO" | "BAJO";
export type EstadoKpiGerencial =
  | "REPORTADO"
  | "ABIERTO"
  | "EN_SEGUIMIENTO"
  | "CERRADO"
  | "ANULADO";

export type HallazgoKpiGerencial = {
  id?: string;
  codigo: string;
  empresa: string;
  obra: string;
  area: string;
  tipoHallazgo: string;
  criticidad: CriticidadKpiGerencial;
  estado: EstadoKpiGerencial;
  fechaISO?: string;
  reportante?: string;
  responsableCierre?: string;
  fechaCompromiso?: string;
  fechaCierre?: string;
  descripcion?: string;
  fotos?: string[];
  tieneGps?: boolean;
};

export type FiltrosKpiGerencial = {
  empresa?: string;
  obra?: string;
  area?: string;
  criticidad?: CriticidadKpiGerencial;
  estado?: EstadoKpiGerencial;
  tipoHallazgo?: string;
  responsableCierre?: string;
  reportante?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  semana?: string;
  mes?: string;
  gps?: "todos" | "con-gps" | "sin-gps";
  evidencia?: "todos" | "con-evidencia" | "sin-evidencia";
  vencimiento?: "todos" | "vencidos" | "no-vencidos";
  soloCriticosAbiertos?: boolean;
  soloReincidencias?: boolean;
};

export type RankingKpiGerencial = {
  nombre: string;
  total: number;
  criticos: number;
  vencidos: number;
  cerrados: number;
  tasaCierre: number;
};

export type TendenciaKpiGerencial = {
  periodo: string;
  total: number;
  abiertos: number;
  cerrados: number;
  criticos: number;
};

export type ComparacionKpiGerencial = {
  etiqueta: string;
  actual: number;
  comparado: number;
  variacion: number;
};

export type AnalisisKpiGerencial = {
  hallazgos: HallazgoKpiGerencial[];
  total: number;
  abiertos: number;
  cerrados: number;
  criticos: number;
  altos: number;
  vencidos: number;
  tasaCierre: number;
  tiempoPromedioCierre: number;
  empresasActivas: number;
  obrasActivas: number;
  areasActivas: number;
  reincidenciasDetectadas: number;
  cumplimientoGeneral: number;
  indicadorPreventivoGlobal: number;
  porEmpresa: RankingKpiGerencial[];
  porObra: RankingKpiGerencial[];
  porArea: RankingKpiGerencial[];
  porResponsable: RankingKpiGerencial[];
  porTipo: RankingKpiGerencial[];
  porCriticidad: Record<CriticidadKpiGerencial, number>;
  porEstado: Record<EstadoKpiGerencial, number>;
  tendenciaTemporal: TendenciaKpiGerencial[];
  comparaciones: ComparacionKpiGerencial[];
  resumenEjecutivo: string;
  principalesRiesgos: string[];
  recomendacionPreventiva: string;
};

function fechaValida(valor?: string) {
  if (!valor) return null;
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

function fechaSimple(valor?: string) {
  const fecha = fechaValida(valor);
  if (!fecha) return "";
  return fecha.toISOString().slice(0, 10);
}

function esCerrado(hallazgo: HallazgoKpiGerencial) {
  return hallazgo.estado === "CERRADO";
}

function esAbierto(hallazgo: HallazgoKpiGerencial) {
  return hallazgo.estado !== "CERRADO" && hallazgo.estado !== "ANULADO";
}

function esCriticoAbierto(hallazgo: HallazgoKpiGerencial) {
  return hallazgo.criticidad === "CRITICO" && esAbierto(hallazgo);
}

export function esHallazgoVencido(hallazgo: HallazgoKpiGerencial) {
  if (esCerrado(hallazgo)) return false;
  const compromiso = fechaValida(hallazgo.fechaCompromiso);
  if (!compromiso) return false;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  compromiso.setHours(0, 0, 0, 0);
  return compromiso < hoy;
}

function diasEntre(inicio?: string, termino?: string) {
  const fechaInicio = fechaValida(inicio);
  const fechaTermino = fechaValida(termino);
  if (!fechaInicio || !fechaTermino) return null;

  const dias = Math.round(
    (fechaTermino.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.max(0, dias);
}

function tasa(parte: number, total: number) {
  return total === 0 ? 0 : Math.round((parte / total) * 100);
}

function cumpleFechas(hallazgo: HallazgoKpiGerencial, filtros: FiltrosKpiGerencial) {
  const fecha = fechaValida(hallazgo.fechaISO);
  if (!fecha) return true;

  if (filtros.fechaDesde && fecha < new Date(`${filtros.fechaDesde}T00:00:00`)) {
    return false;
  }

  if (filtros.fechaHasta && fecha > new Date(`${filtros.fechaHasta}T23:59:59`)) {
    return false;
  }

  if (filtros.mes && fecha.toISOString().slice(0, 7) !== filtros.mes) {
    return false;
  }

  if (filtros.semana) {
    const inicioSemana = new Date(`${filtros.semana}T00:00:00`);
    if (!Number.isNaN(inicioSemana.getTime())) {
      const finSemana = new Date(inicioSemana);
      finSemana.setDate(inicioSemana.getDate() + 6);
      finSemana.setHours(23, 59, 59, 999);
      if (fecha < inicioSemana || fecha > finSemana) return false;
    }
  }

  return true;
}

function claveReincidencia(hallazgo: HallazgoKpiGerencial) {
  return `${hallazgo.empresa}__${hallazgo.obra}__${hallazgo.area}__${hallazgo.tipoHallazgo}`;
}

function obtenerClavesReincidentes(hallazgos: HallazgoKpiGerencial[]) {
  const conteo = new Map<string, number>();
  for (const hallazgo of hallazgos) {
    const clave = claveReincidencia(hallazgo);
    conteo.set(clave, (conteo.get(clave) || 0) + 1);
  }
  return new Set(
    Array.from(conteo.entries())
      .filter(([, total]) => total > 1)
      .map(([clave]) => clave)
  );
}

export function filtrarHallazgosKpiGerencial(
  hallazgos: HallazgoKpiGerencial[],
  filtros: FiltrosKpiGerencial = {}
) {
  const reincidentes = obtenerClavesReincidentes(hallazgos);

  return hallazgos.filter((hallazgo) => {
    const tieneEvidencia = Boolean(hallazgo.fotos?.length);

    if (filtros.empresa && hallazgo.empresa !== filtros.empresa) return false;
    if (filtros.obra && hallazgo.obra !== filtros.obra) return false;
    if (filtros.area && hallazgo.area !== filtros.area) return false;
    if (filtros.criticidad && hallazgo.criticidad !== filtros.criticidad) return false;
    if (filtros.estado && hallazgo.estado !== filtros.estado) return false;
    if (filtros.tipoHallazgo && hallazgo.tipoHallazgo !== filtros.tipoHallazgo) return false;
    if (filtros.responsableCierre && hallazgo.responsableCierre !== filtros.responsableCierre) return false;
    if (filtros.reportante && hallazgo.reportante !== filtros.reportante) return false;
    if (filtros.gps === "con-gps" && !hallazgo.tieneGps) return false;
    if (filtros.gps === "sin-gps" && hallazgo.tieneGps) return false;
    if (filtros.evidencia === "con-evidencia" && !tieneEvidencia) return false;
    if (filtros.evidencia === "sin-evidencia" && tieneEvidencia) return false;
    if (filtros.vencimiento === "vencidos" && !esHallazgoVencido(hallazgo)) return false;
    if (filtros.vencimiento === "no-vencidos" && esHallazgoVencido(hallazgo)) return false;
    if (filtros.soloCriticosAbiertos && !esCriticoAbierto(hallazgo)) return false;
    if (filtros.soloReincidencias && !reincidentes.has(claveReincidencia(hallazgo))) return false;
    return cumpleFechas(hallazgo, filtros);
  });
}

function rankingPor(
  hallazgos: HallazgoKpiGerencial[],
  obtenerClave: (hallazgo: HallazgoKpiGerencial) => string
): RankingKpiGerencial[] {
  const grupos = new Map<string, HallazgoKpiGerencial[]>();

  for (const hallazgo of hallazgos) {
    const clave = obtenerClave(hallazgo) || "Sin definir";
    grupos.set(clave, [...(grupos.get(clave) || []), hallazgo]);
  }

  return Array.from(grupos.entries())
    .map(([nombre, items]) => {
      const cerrados = items.filter(esCerrado).length;
      return {
        nombre,
        total: items.length,
        criticos: items.filter((item) => item.criticidad === "CRITICO").length,
        vencidos: items.filter(esHallazgoVencido).length,
        cerrados,
        tasaCierre: tasa(cerrados, items.length),
      };
    })
    .sort((a, b) => b.total - a.total);
}

function tendenciaPorMes(hallazgos: HallazgoKpiGerencial[]) {
  const grupos = new Map<string, HallazgoKpiGerencial[]>();

  for (const hallazgo of hallazgos) {
    const periodo = fechaSimple(hallazgo.fechaISO).slice(0, 7) || "Sin fecha";
    grupos.set(periodo, [...(grupos.get(periodo) || []), hallazgo]);
  }

  return Array.from(grupos.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([periodo, items]) => ({
      periodo,
      total: items.length,
      abiertos: items.filter(esAbierto).length,
      cerrados: items.filter(esCerrado).length,
      criticos: items.filter((item) => item.criticidad === "CRITICO").length,
    }));
}

function compararPeriodos(hallazgos: HallazgoKpiGerencial[]): ComparacionKpiGerencial[] {
  const hoy = new Date();
  const inicioMesActual = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const inicioMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
  const finMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0, 23, 59, 59, 999);

  const mesActual = hallazgos.filter((hallazgo) => {
    const fecha = fechaValida(hallazgo.fechaISO);
    return fecha ? fecha >= inicioMesActual : false;
  });
  const mesAnterior = hallazgos.filter((hallazgo) => {
    const fecha = fechaValida(hallazgo.fechaISO);
    return fecha ? fecha >= inicioMesAnterior && fecha <= finMesAnterior : false;
  });

  const actualCriticos = mesActual.filter((item) => item.criticidad === "CRITICO").length;
  const anteriorCriticos = mesAnterior.filter((item) => item.criticidad === "CRITICO").length;

  return [
    {
      etiqueta: "Hallazgos mes actual vs anterior",
      actual: mesActual.length,
      comparado: mesAnterior.length,
      variacion: mesActual.length - mesAnterior.length,
    },
    {
      etiqueta: "Criticos mes actual vs anterior",
      actual: actualCriticos,
      comparado: anteriorCriticos,
      variacion: actualCriticos - anteriorCriticos,
    },
    {
      etiqueta: "Cierre actual vs anterior",
      actual: tasa(mesActual.filter(esCerrado).length, mesActual.length),
      comparado: tasa(mesAnterior.filter(esCerrado).length, mesAnterior.length),
      variacion:
        tasa(mesActual.filter(esCerrado).length, mesActual.length) -
        tasa(mesAnterior.filter(esCerrado).length, mesAnterior.length),
    },
  ];
}

export function analizarKpiGerencialAvanzado(
  hallazgosBase: HallazgoKpiGerencial[],
  filtros: FiltrosKpiGerencial = {}
): AnalisisKpiGerencial {
  const hallazgos = filtrarHallazgosKpiGerencial(hallazgosBase, filtros);
  const total = hallazgos.length;
  const abiertos = hallazgos.filter(esAbierto).length;
  const cerrados = hallazgos.filter(esCerrado).length;
  const criticos = hallazgos.filter((item) => item.criticidad === "CRITICO").length;
  const altos = hallazgos.filter((item) => item.criticidad === "ALTO").length;
  const vencidos = hallazgos.filter(esHallazgoVencido).length;
  const diasCierre = hallazgos
    .map((hallazgo) => diasEntre(hallazgo.fechaISO, hallazgo.fechaCierre))
    .filter((valor): valor is number => typeof valor === "number");
  const tiempoPromedioCierre =
    diasCierre.length === 0
      ? 0
      : Math.round(diasCierre.reduce((sum, item) => sum + item, 0) / diasCierre.length);
  const reincidenciasDetectadas = obtenerClavesReincidentes(hallazgos).size;
  const tasaCierre = tasa(cerrados, total);
  const cumplimientoGeneral = Math.max(
    0,
    Math.min(100, Math.round(tasaCierre - tasa(vencidos, total) * 0.35 - tasa(criticos, total) * 0.2 + 15))
  );
  const indicadorPreventivoGlobal = Math.max(
    0,
    Math.min(100, Math.round(100 - tasa(vencidos, total) * 0.45 - tasa(criticos + altos, total) * 0.35))
  );
  const porCriticidad: Record<CriticidadKpiGerencial, number> = {
    CRITICO: criticos,
    ALTO: altos,
    MEDIO: hallazgos.filter((item) => item.criticidad === "MEDIO").length,
    BAJO: hallazgos.filter((item) => item.criticidad === "BAJO").length,
  };
  const porEstado: Record<EstadoKpiGerencial, number> = {
    REPORTADO: hallazgos.filter((item) => item.estado === "REPORTADO").length,
    ABIERTO: hallazgos.filter((item) => item.estado === "ABIERTO").length,
    EN_SEGUIMIENTO: hallazgos.filter((item) => item.estado === "EN_SEGUIMIENTO").length,
    CERRADO: cerrados,
    ANULADO: hallazgos.filter((item) => item.estado === "ANULADO").length,
  };
  const porEmpresa = rankingPor(hallazgos, (hallazgo) => hallazgo.empresa);
  const porObra = rankingPor(hallazgos, (hallazgo) => hallazgo.obra);
  const porArea = rankingPor(hallazgos, (hallazgo) => hallazgo.area);
  const porResponsable = rankingPor(
    hallazgos,
    (hallazgo) => hallazgo.responsableCierre || "Sin responsable"
  );
  const porTipo = rankingPor(hallazgos, (hallazgo) => hallazgo.tipoHallazgo);
  const empresaCritica = porEmpresa[0]?.nombre || "Sin empresa dominante";
  const areaCritica = porArea[0]?.nombre || "Sin area dominante";

  return {
    hallazgos,
    total,
    abiertos,
    cerrados,
    criticos,
    altos,
    vencidos,
    tasaCierre,
    tiempoPromedioCierre,
    empresasActivas: new Set(hallazgos.map((item) => item.empresa)).size,
    obrasActivas: new Set(hallazgos.map((item) => item.obra)).size,
    areasActivas: new Set(hallazgos.map((item) => item.area)).size,
    reincidenciasDetectadas,
    cumplimientoGeneral,
    indicadorPreventivoGlobal,
    porEmpresa,
    porObra,
    porArea,
    porResponsable,
    porTipo,
    porCriticidad,
    porEstado,
    tendenciaTemporal: tendenciaPorMes(hallazgos),
    comparaciones: compararPeriodos(hallazgos),
    resumenEjecutivo:
      total === 0
        ? "No hay datos suficientes para un analisis gerencial avanzado."
        : `Se analizaron ${total} hallazgos. ${empresaCritica} concentra la mayor carga operativa y ${areaCritica} requiere foco preventivo prioritario.`,
    principalesRiesgos: [
      criticos > 0 ? `${criticos} hallazgos criticos en el periodo filtrado.` : "Sin criticidad critica dominante.",
      vencidos > 0 ? `${vencidos} hallazgos vencidos requieren gestion.` : "Sin vencimientos relevantes en el filtro.",
      reincidenciasDetectadas > 0
        ? `${reincidenciasDetectadas} patrones de reincidencia detectados.`
        : "No se detectan reincidencias significativas.",
    ],
    recomendacionPreventiva:
      criticos + altos > 0 || vencidos > 0
        ? "Priorizar cierre de criticidad alta, revisar reincidencias y validar responsables reales de cierre."
        : "Mantener controles preventivos, seguimiento de cierre y revision periodica por empresa y obra.",
  };
}
