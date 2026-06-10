import type { HallazgoCentral } from "../types/hallazgoCentral";

export type NivelAlarmaCritica =
  | "NORMAL"
  | "OBSERVACION"
  | "ALTO"
  | "CRITICO"
  | "CRITICO_EXTREMO";

export type SenalAlarmaCritica = {
  tipo:
    | "cantidad_criticos"
    | "empresa"
    | "obra"
    | "area"
    | "vencimiento"
    | "reincidencia"
    | "altos_abiertos";
  nivel: NivelAlarmaCritica;
  mensaje: string;
};

export type RankingEmpresaAlarmaCritica = {
  empresa: string;
  nivelAlerta: NivelAlarmaCritica;
  criticosAbiertos: number;
  criticosVencidos: number;
  altosAbiertos: number;
  reincidencias: number;
  totalAbiertos: number;
  senales: number;
  obraPrincipal?: { nombre: string; total: number };
  areaPrincipal?: { nombre: string; total: number };
  tipoReincidente?: { nombre: string; total: number };
};

export type ResultadoAlarmaCritica = {
  nivelAlerta: NivelAlarmaCritica;
  titulo: string;
  resumen: string;
  criticidadOperativa: string;
  empresaPrincipal?: { nombre: string; total: number };
  obraPrincipal?: { nombre: string; total: number };
  areaPrincipal?: { nombre: string; total: number };
  tipoReincidente?: { nombre: string; total: number };
  criticosAbiertos: number;
  criticosVencidos: number;
  altosAbiertos: number;
  recomendacion: string;
  senalesDetectadas: SenalAlarmaCritica[];
  rankingEmpresas: RankingEmpresaAlarmaCritica[];
  totalEmpresasConAlerta: number;
  empresaPrioritaria?: RankingEmpresaAlarmaCritica;
  resumenMultiempresa: string;
};

type ResultadoAlarmaBase = Omit<
  ResultadoAlarmaCritica,
  | "rankingEmpresas"
  | "totalEmpresasConAlerta"
  | "empresaPrioritaria"
  | "resumenMultiempresa"
>;

const NIVEL_PRIORIDAD: Record<NivelAlarmaCritica, number> = {
  NORMAL: 0,
  OBSERVACION: 1,
  ALTO: 2,
  CRITICO: 3,
  CRITICO_EXTREMO: 4,
};

function estaAbierto(hallazgo: HallazgoCentral) {
  return hallazgo.estado !== "CERRADO" && hallazgo.estado !== "ANULADO";
}

function fechaBaseHallazgo(hallazgo: HallazgoCentral) {
  const fecha = new Date(
    hallazgo.fechaHoraReporteISO || hallazgo.fechaCreacion || hallazgo.fechaReporte
  );
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

function diasAbierto(hallazgo: HallazgoCentral) {
  const fechaBase = fechaBaseHallazgo(hallazgo);
  if (!fechaBase) return 0;

  const hoy = new Date();
  const inicio = new Date(
    fechaBase.getFullYear(),
    fechaBase.getMonth(),
    fechaBase.getDate()
  );
  const fin = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

  return Math.max(
    0,
    Math.floor((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24))
  );
}

function esCriticoVencido(hallazgo: HallazgoCentral) {
  if (hallazgo.criticidad !== "CRITICO" || !estaAbierto(hallazgo)) return false;

  const fechaCompromiso = hallazgo.seguimientoCierre?.fechaCompromiso;
  if (fechaCompromiso) {
    const fecha = new Date(`${fechaCompromiso}T23:59:59`);
    if (!Number.isNaN(fecha.getTime())) return fecha < new Date();
  }

  return diasAbierto(hallazgo) > 1;
}

function agrupar<T>(
  items: T[],
  selector: (item: T) => string | undefined
): Array<{ nombre: string; total: number; items: T[] }> {
  const grupos = items.reduce<Record<string, T[]>>((acc, item) => {
    const nombre = selector(item)?.trim() || "Sin definir";
    acc[nombre] = [...(acc[nombre] || []), item];
    return acc;
  }, {});

  return Object.entries(grupos)
    .map(([nombre, grupo]) => ({ nombre, total: grupo.length, items: grupo }))
    .sort((a, b) => b.total - a.total || a.nombre.localeCompare(b.nombre));
}

function elevarNivel(actual: NivelAlarmaCritica, candidato: NivelAlarmaCritica) {
  return NIVEL_PRIORIDAD[candidato] > NIVEL_PRIORIDAD[actual]
    ? candidato
    : actual;
}

function recomendacionPorNivel(nivel: NivelAlarmaCritica) {
  if (nivel === "CRITICO_EXTREMO") {
    return "Escalamiento gerencial requerido. Reevaluar continuidad operacional si corresponde.";
  }
  if (nivel === "CRITICO") {
    return "Intervención inmediata requerida. Priorizar cierre y control operacional.";
  }
  if (nivel === "ALTO") {
    return "Asignar responsable de cierre y controlar avance.";
  }
  if (nivel === "OBSERVACION") {
    return "Revisar hallazgos altos y evitar escalamiento.";
  }
  return "Mantener monitoreo preventivo.";
}

function tituloPorNivel(nivel: NivelAlarmaCritica) {
  if (nivel === "CRITICO_EXTREMO") return "Alerta crítica extrema acumulada";
  if (nivel === "CRITICO") return "Alerta crítica acumulada";
  if (nivel === "ALTO") return "Alerta alta preventiva";
  if (nivel === "OBSERVACION") return "Observación preventiva";
  return "Sin acumulación crítica relevante";
}

function resumenPorNivel(
  nivel: NivelAlarmaCritica,
  criticosAbiertos: number,
  criticosVencidos: number,
  empresaPrincipal?: { nombre: string; total: number }
) {
  if (nivel === "CRITICO_EXTREMO") {
    return `Escalamiento gerencial requerido: ${criticosAbiertos} hallazgo(s) crítico(s) abiertos o vencidos.`;
  }
  if (nivel === "CRITICO") {
    if (criticosVencidos > 0) {
      return `Alerta crítica acumulada: ${criticosVencidos} hallazgo(s) crítico(s) fuera de plazo o sin cierre oportuno.`;
    }
    if (empresaPrincipal && empresaPrincipal.total >= 2) {
      return `Alerta crítica acumulada en ${empresaPrincipal.nombre}: ${empresaPrincipal.total} hallazgo(s) crítico(s) abiertos.`;
    }
    return `Alerta crítica acumulada: ${criticosAbiertos} hallazgo(s) crítico(s) abiertos.`;
  }
  if (nivel === "ALTO") {
    const empresa = empresaPrincipal?.nombre ? ` en ${empresaPrincipal.nombre}` : "";
    return `Alerta alta preventiva: ${criticosAbiertos} hallazgo crítico abierto${empresa}.`;
  }
  if (nivel === "OBSERVACION") {
    return "Hallazgos altos o pendientes requieren seguimiento para evitar escalamiento.";
  }
  return "Sin acumulación crítica relevante. Mantener seguimiento preventivo.";
}

function compararRankingEmpresas(
  a: RankingEmpresaAlarmaCritica,
  b: RankingEmpresaAlarmaCritica
) {
  return (
    NIVEL_PRIORIDAD[b.nivelAlerta] - NIVEL_PRIORIDAD[a.nivelAlerta] ||
    b.criticosAbiertos - a.criticosAbiertos ||
    b.criticosVencidos - a.criticosVencidos ||
    b.altosAbiertos - a.altosAbiertos ||
    b.reincidencias - a.reincidencias ||
    b.totalAbiertos - a.totalAbiertos ||
    a.empresa.localeCompare(b.empresa)
  );
}

function analizarAlarmaCriticaBase(hallazgos: HallazgoCentral[]): ResultadoAlarmaBase {
  const abiertos = hallazgos.filter(estaAbierto);
  const criticosAbiertos = abiertos.filter(
    (hallazgo) => hallazgo.criticidad === "CRITICO"
  );
  const altosAbiertos = abiertos.filter((hallazgo) => hallazgo.criticidad === "ALTO");
  const criticosVencidos = criticosAbiertos.filter(esCriticoVencido);
  const criticosAltosAbiertos = abiertos.filter(
    (hallazgo) => hallazgo.criticidad === "CRITICO" || hallazgo.criticidad === "ALTO"
  );
  const empresaPrincipal = agrupar(criticosAbiertos, (hallazgo) => hallazgo.empresa)[0];
  const obraPrincipal = agrupar(criticosAbiertos, (hallazgo) => hallazgo.obra)[0];
  const areaPrincipal = agrupar(criticosAltosAbiertos, (hallazgo) => hallazgo.area)[0];
  const tipoReincidente = agrupar(
    criticosAltosAbiertos,
    (hallazgo) => hallazgo.tipoHallazgo
  )[0];
  const senalesDetectadas: SenalAlarmaCritica[] = [];
  let nivelAlerta: NivelAlarmaCritica = "NORMAL";

  if (altosAbiertos.length > 0 || abiertos.length > 0) {
    nivelAlerta = elevarNivel(nivelAlerta, "OBSERVACION");
  }

  if (altosAbiertos.length >= 3) {
    nivelAlerta = elevarNivel(nivelAlerta, "ALTO");
    senalesDetectadas.push({
      tipo: "altos_abiertos",
      nivel: "ALTO",
      mensaje: `${altosAbiertos.length} hallazgo(s) alto(s) abiertos requieren control de avance.`,
    });
  }

  if (criticosAbiertos.length === 1) {
    nivelAlerta = elevarNivel(nivelAlerta, "ALTO");
    senalesDetectadas.push({
      tipo: "cantidad_criticos",
      nivel: "ALTO",
      mensaje: "1 hallazgo crítico abierto requiere seguimiento ejecutivo.",
    });
  }

  if (criticosAbiertos.length >= 2) {
    nivelAlerta = elevarNivel(nivelAlerta, "CRITICO");
    senalesDetectadas.push({
      tipo: "cantidad_criticos",
      nivel: "CRITICO",
      mensaje: `${criticosAbiertos.length} hallazgo(s) crítico(s) abiertos.`,
    });
  }

  if (criticosAbiertos.length >= 3) {
    nivelAlerta = elevarNivel(nivelAlerta, "CRITICO_EXTREMO");
  }

  if (criticosVencidos.length >= 1) {
    nivelAlerta = elevarNivel(
      nivelAlerta,
      criticosVencidos.length >= 2 ? "CRITICO_EXTREMO" : "CRITICO"
    );
    senalesDetectadas.push({
      tipo: "vencimiento",
      nivel: criticosVencidos.length >= 2 ? "CRITICO_EXTREMO" : "CRITICO",
      mensaje: `${criticosVencidos.length} crítico(s) vencido(s) o sin cierre oportuno.`,
    });
  }

  if (empresaPrincipal?.total >= 2) {
    nivelAlerta = elevarNivel(
      nivelAlerta,
      empresaPrincipal.total >= 3 ? "CRITICO_EXTREMO" : "CRITICO"
    );
    senalesDetectadas.push({
      tipo: "empresa",
      nivel: empresaPrincipal.total >= 3 ? "CRITICO_EXTREMO" : "CRITICO",
      mensaje: `Concentración crítica en empresa ${empresaPrincipal.nombre}: ${empresaPrincipal.total} hallazgo(s).`,
    });
  }

  if (obraPrincipal?.total >= 2) {
    nivelAlerta = elevarNivel(
      nivelAlerta,
      obraPrincipal.total >= 3 ? "CRITICO_EXTREMO" : "CRITICO"
    );
    senalesDetectadas.push({
      tipo: "obra",
      nivel: obraPrincipal.total >= 3 ? "CRITICO_EXTREMO" : "CRITICO",
      mensaje: `Concentración crítica en obra ${obraPrincipal.nombre}: ${obraPrincipal.total} hallazgo(s).`,
    });
  }

  if (areaPrincipal?.total >= 2) {
    nivelAlerta = elevarNivel(
      nivelAlerta,
      areaPrincipal.total >= 3 ? "CRITICO_EXTREMO" : "CRITICO"
    );
    senalesDetectadas.push({
      tipo: "area",
      nivel: areaPrincipal.total >= 3 ? "CRITICO_EXTREMO" : "CRITICO",
      mensaje: `Área prioritaria ${areaPrincipal.nombre}: ${areaPrincipal.total} hallazgo(s) crítico(s)/alto(s).`,
    });
  }

  if (tipoReincidente?.total >= 2) {
    nivelAlerta = elevarNivel(nivelAlerta, "CRITICO");
    senalesDetectadas.push({
      tipo: "reincidencia",
      nivel: "CRITICO",
      mensaje: `Reincidencia crítica detectada: ${tipoReincidente.nombre} repetida ${tipoReincidente.total} vez/veces.`,
    });
  }

  return {
    nivelAlerta,
    titulo: tituloPorNivel(nivelAlerta),
    resumen: resumenPorNivel(
      nivelAlerta,
      criticosAbiertos.length,
      criticosVencidos.length,
      empresaPrincipal
    ),
    criticidadOperativa: nivelAlerta.replace(/_/g, " "),
    empresaPrincipal: empresaPrincipal
      ? { nombre: empresaPrincipal.nombre, total: empresaPrincipal.total }
      : undefined,
    obraPrincipal: obraPrincipal
      ? { nombre: obraPrincipal.nombre, total: obraPrincipal.total }
      : undefined,
    areaPrincipal: areaPrincipal
      ? { nombre: areaPrincipal.nombre, total: areaPrincipal.total }
      : undefined,
    tipoReincidente: tipoReincidente
      ? { nombre: tipoReincidente.nombre, total: tipoReincidente.total }
      : undefined,
    criticosAbiertos: criticosAbiertos.length,
    criticosVencidos: criticosVencidos.length,
    altosAbiertos: altosAbiertos.length,
    recomendacion: recomendacionPorNivel(nivelAlerta),
    senalesDetectadas,
  };
}

function construirResumenMultiempresa(
  base: ResultadoAlarmaBase,
  rankingEmpresas: RankingEmpresaAlarmaCritica[]
) {
  const empresaPrioritaria = rankingEmpresas[0];
  const total = rankingEmpresas.length;

  if (!empresaPrioritaria) return base.resumen;

  if (total === 1) {
    if (base.nivelAlerta === "ALTO") {
      return `Alerta alta preventiva: ${base.criticosAbiertos} hallazgo crítico abierto en ${empresaPrioritaria.empresa}.`;
    }
    return `${base.titulo}: prioridad ${empresaPrioritaria.empresa}.`;
  }

  if (total > 5) {
    return `${total} empresas presentan alertas preventivas. Se muestran las 3 prioridades principales.`;
  }

  return `Alarma crítica preventiva: ${total} empresas con alertas activas. Prioridad: ${empresaPrioritaria.empresa}.`;
}

export function analizarAlarmaCriticaAcumulada(
  hallazgos: HallazgoCentral[]
): ResultadoAlarmaCritica {
  const baseVisible = analizarAlarmaCriticaBase(hallazgos);
  const rankingEmpresas = agrupar(hallazgos, (hallazgo) => hallazgo.empresa)
    .map((grupo): RankingEmpresaAlarmaCritica => {
      const resultado = analizarAlarmaCriticaBase(grupo.items);
      const totalAbiertos = grupo.items.filter(estaAbierto).length;
      const reincidencias =
        resultado.tipoReincidente && resultado.tipoReincidente.total >= 2
          ? resultado.tipoReincidente.total
          : 0;

      return {
        empresa: grupo.nombre,
        nivelAlerta: resultado.nivelAlerta,
        criticosAbiertos: resultado.criticosAbiertos,
        criticosVencidos: resultado.criticosVencidos,
        altosAbiertos: resultado.altosAbiertos,
        reincidencias,
        totalAbiertos,
        senales: resultado.senalesDetectadas.length,
        obraPrincipal: resultado.obraPrincipal,
        areaPrincipal: resultado.areaPrincipal,
        tipoReincidente: resultado.tipoReincidente,
      };
    })
    .filter((empresa) => empresa.nivelAlerta !== "NORMAL")
    .sort(compararRankingEmpresas);

  const empresaPrioritaria = rankingEmpresas[0];
  const nivelAlerta = empresaPrioritaria?.nivelAlerta || baseVisible.nivelAlerta;
  const empresaPrincipal = empresaPrioritaria
    ? {
        nombre: empresaPrioritaria.empresa,
        total:
          empresaPrioritaria.criticosAbiertos ||
          empresaPrioritaria.altosAbiertos ||
          empresaPrioritaria.totalAbiertos,
      }
    : baseVisible.empresaPrincipal;
  const resultadoPrincipal: ResultadoAlarmaBase = {
    ...baseVisible,
    nivelAlerta,
    titulo: tituloPorNivel(nivelAlerta),
    resumen: resumenPorNivel(
      nivelAlerta,
      baseVisible.criticosAbiertos,
      baseVisible.criticosVencidos,
      empresaPrincipal
    ),
    criticidadOperativa: nivelAlerta.replace(/_/g, " "),
    empresaPrincipal,
    recomendacion: recomendacionPorNivel(nivelAlerta),
  };
  const resumenMultiempresa = construirResumenMultiempresa(
    resultadoPrincipal,
    rankingEmpresas
  );

  return {
    ...resultadoPrincipal,
    resumen: resumenMultiempresa,
    rankingEmpresas,
    totalEmpresasConAlerta: rankingEmpresas.length,
    empresaPrioritaria,
    resumenMultiempresa,
  };
}
