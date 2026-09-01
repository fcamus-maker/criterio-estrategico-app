import type { RankingKpiGerencial } from "../../analytics/kpiGerencialAvanzado";

type NivelInforme = "critico" | "alto" | "atencion" | "controlado" | "neutral";

export type HallazgoPrioritarioPdf = {
  codigo: string;
  criticidad: string;
  empresa: string;
  obra: string;
  responsable: string;
  plazo: string;
  motivo: string;
};

export type AccionEjecutivaPdf = {
  prioridad: "Inmediata" | "Alta" | "Programada";
  accion: string;
  responsable: string;
  plazo: string;
  evidencia: string;
};

export type InformeEjecutivoPdfInput = {
  filename: string;
  titulo: string;
  subtitulo: string;
  periodo: string;
  alcance: string;
  fechaGeneracion: string;
  marca: {
    nombre: string;
    poweredBy: string;
    logoUrl?: string;
  };
  fontUrl?: string;
  fontBoldUrl?: string;
  autor: {
    nombre: string;
    cargo: string;
    empresa: string;
    correo?: string;
  };
  alerta: {
    etiqueta: string;
    nivel: NivelInforme;
    mensaje: string;
  };
  resumen: string;
  metricas: Array<{
    etiqueta: string;
    valor: string | number;
    nivel?: NivelInforme;
  }>;
  criticidad: Array<{
    etiqueta: string;
    total: number;
    nivel: NivelInforme;
  }>;
  planAccion: AccionEjecutivaPdf[];
  tendencia: Array<{
    periodo: string;
    total: number;
    cerrados: number;
    criticosAbiertos: number;
    vencidosAbiertos: number;
  }>;
  lecturaTendencia: string;
  rankings: Array<{
    titulo: string;
    metrica: string;
    data: RankingKpiGerencial[];
  }>;
  hallazgosPrioritarios: HallazgoPrioritarioPdf[];
  calidadDato: Array<{
    etiqueta: string;
    completos: number;
    universo: number;
    nivel: NivelInforme;
  }>;
  lecturasComplementarias: Array<{
    titulo: string;
    valores: string[];
    decision?: string;
  }>;
  advertencias: string[];
  notaNormativa: string;
};

type Rgb = [number, number, number];

const COLORES: Record<
  NivelInforme | "azul" | "azulClaro" | "texto" | "textoMedio" | "borde" | "blanco",
  Rgb
> = {
  critico: [185, 28, 28],
  alto: [234, 88, 12],
  atencion: [202, 138, 4],
  controlado: [22, 163, 74],
  neutral: [71, 85, 105],
  azul: [29, 78, 216],
  azulClaro: [239, 246, 255],
  texto: [15, 23, 42],
  textoMedio: [71, 85, 105],
  borde: [203, 213, 225],
  blanco: [255, 255, 255],
};

const FONDOS: Record<NivelInforme, Rgb> = {
  critico: [254, 242, 242],
  alto: [255, 247, 237],
  atencion: [254, 252, 232],
  controlado: [240, 253, 244],
  neutral: [248, 250, 252],
};

function normalizarTexto(texto: string) {
  return texto.replace(/\s+/g, " ").trim();
}

function etiquetaPeriodo(periodo: string) {
  const coincidencia = /^(\d{4})-(\d{2})$/.exec(periodo);
  if (!coincidencia) return periodo;
  const meses = [
    "ene.",
    "feb.",
    "mar.",
    "abr.",
    "may.",
    "jun.",
    "jul.",
    "ago.",
    "sept.",
    "oct.",
    "nov.",
    "dic.",
  ];
  return `${meses[Number(coincidencia[2]) - 1]} ${coincidencia[1]}`;
}

async function cargarImagen(url?: string) {
  if (!url) return null;
  try {
    const respuesta = await fetch(url, { credentials: "include" });
    if (!respuesta.ok) return null;
    const blob = await respuesta.blob();
    return await new Promise<string | null>((resolve) => {
      const lector = new FileReader();
      lector.onload = () => resolve(typeof lector.result === "string" ? lector.result : null);
      lector.onerror = () => resolve(null);
      lector.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

async function cargarFuente(url?: string) {
  if (!url) return null;
  try {
    const respuesta = await fetch(url);
    if (!respuesta.ok) return null;
    const bytes = new Uint8Array(await respuesta.arrayBuffer());
    let binario = "";
    for (let indice = 0; indice < bytes.length; indice += 8192) {
      binario += String.fromCharCode(...bytes.subarray(indice, indice + 8192));
    }
    return btoa(binario);
  } catch {
    return null;
  }
}

export async function generarInformeEjecutivoPdf(input: InformeEjecutivoPdfInput) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const [logo, fuenteRegular, fuenteBold] = await Promise.all([
    cargarImagen(input.marca.logoUrl),
    cargarFuente(input.fontUrl),
    cargarFuente(input.fontBoldUrl),
  ]);
  const familiaFuente = fuenteRegular ? "CeSans" : "helvetica";
  if (fuenteRegular) {
    pdf.addFileToVFS("CeSans-Regular.ttf", fuenteRegular);
    pdf.addFont("CeSans-Regular.ttf", familiaFuente, "normal");
    if (fuenteBold) {
      pdf.addFileToVFS("CeSans-Bold.ttf", fuenteBold);
      pdf.addFont("CeSans-Bold.ttf", familiaFuente, "bold");
    } else {
      pdf.addFont("CeSans-Regular.ttf", familiaFuente, "bold");
    }
  }
  const anchoPagina = pdf.internal.pageSize.getWidth();
  const altoPagina = pdf.internal.pageSize.getHeight();
  const margenX = 14;
  const anchoUtil = anchoPagina - margenX * 2;
  const limiteInferior = altoPagina - 16;
  let y = 14;
  let numeroSeccion = 0;

  const setColorTexto = (color: Rgb) => pdf.setTextColor(...color);
  const setColorRelleno = (color: Rgb) => pdf.setFillColor(...color);
  const setColorBorde = (color: Rgb) => pdf.setDrawColor(...color);

  const agregarEncabezadoInterior = () => {
    setColorTexto(COLORES.textoMedio);
    pdf.setFont(familiaFuente, "bold");
    pdf.setFontSize(7.5);
    pdf.text(input.marca.nombre, margenX, 9);
    pdf.setFont(familiaFuente, "normal");
    pdf.text(input.periodo, anchoPagina - margenX, 9, { align: "right" });
    setColorBorde(COLORES.borde);
    pdf.line(margenX, 11, anchoPagina - margenX, 11);
    y = 17;
  };

  const nuevaPagina = () => {
    pdf.addPage();
    agregarEncabezadoInterior();
  };

  const asegurarEspacio = (altoNecesario: number) => {
    if (y + altoNecesario <= limiteInferior) return;
    nuevaPagina();
  };

  const lineas = (texto: string, ancho: number, tamano = 9) => {
    pdf.setFontSize(tamano);
    return pdf.splitTextToSize(normalizarTexto(texto), ancho) as string[];
  };

  const dibujarParrafo = (
    texto: string,
    opciones: { ancho?: number; tamano?: number; color?: Rgb; negrita?: boolean; sangria?: number } = {}
  ) => {
    const ancho = opciones.ancho ?? anchoUtil;
    const tamano = opciones.tamano ?? 9;
    const sangria = opciones.sangria ?? 0;
    const contenido = lineas(texto, ancho - sangria, tamano);
    const altoLinea = tamano * 0.42;
    asegurarEspacio(contenido.length * altoLinea + 2);
    setColorTexto(opciones.color ?? COLORES.texto);
    pdf.setFont(familiaFuente, opciones.negrita ? "bold" : "normal");
    pdf.setFontSize(tamano);
    pdf.text(contenido, margenX + sangria, y, { lineHeightFactor: 1.25 });
    y += contenido.length * altoLinea + 2;
  };

  const tituloSeccion = (titulo: string, bajada?: string) => {
    asegurarEspacio(bajada ? 16 : 10);
    numeroSeccion += 1;
    setColorTexto(COLORES.azul);
    pdf.setFont(familiaFuente, "bold");
    pdf.setFontSize(12.5);
    pdf.text(`${numeroSeccion}. ${titulo}`, margenX, y);
    y += 5;
    if (bajada) {
      dibujarParrafo(bajada, { tamano: 7.8, color: COLORES.textoMedio });
    } else {
      y += 1;
    }
  };

  const dibujarAlerta = () => {
    const texto = lineas(input.alerta.mensaje, anchoUtil - 13, 9);
    const alto = 17 + texto.length * 3.8;
    asegurarEspacio(alto + 4);
    setColorRelleno(FONDOS[input.alerta.nivel]);
    setColorBorde(COLORES[input.alerta.nivel]);
    pdf.roundedRect(margenX, y, anchoUtil, alto, 2.5, 2.5, "FD");
    setColorRelleno(COLORES[input.alerta.nivel]);
    pdf.rect(margenX, y, 2.2, alto, "F");
    setColorTexto(COLORES[input.alerta.nivel]);
    pdf.setFont(familiaFuente, "bold");
    pdf.setFontSize(7.5);
    pdf.text(input.alerta.etiqueta, margenX + 6, y + 6);
    pdf.setFontSize(12);
    pdf.text("Estado general de la gestión preventiva", margenX + 6, y + 12);
    pdf.setFont(familiaFuente, "normal");
    pdf.setFontSize(9);
    pdf.text(texto, margenX + 6, y + 17, { lineHeightFactor: 1.2 });
    y += alto + 5;
  };

  const dibujarKpis = () => {
    const columnas = 4;
    const gap = 3;
    const ancho = (anchoUtil - gap * (columnas - 1)) / columnas;
    const alto = 20;
    for (let indice = 0; indice < input.metricas.length; indice += columnas) {
      asegurarEspacio(alto + 3);
      input.metricas.slice(indice, indice + columnas).forEach((metrica, posicion) => {
        const x = margenX + posicion * (ancho + gap);
        const nivel = metrica.nivel ?? "neutral";
        setColorRelleno(FONDOS[nivel]);
        setColorBorde(nivel === "neutral" ? COLORES.borde : COLORES[nivel]);
        pdf.roundedRect(x, y, ancho, alto, 2.3, 2.3, "FD");
        setColorTexto(nivel === "neutral" ? COLORES.textoMedio : COLORES[nivel]);
        pdf.setFont(familiaFuente, "bold");
        pdf.setFontSize(6.6);
        pdf.text(lineas(metrica.etiqueta.toUpperCase(), ancho - 4, 6.6).slice(0, 2), x + 2, y + 5, {
          lineHeightFactor: 1.05,
        });
        pdf.setFontSize(14);
        pdf.text(String(metrica.valor), x + 2, y + 16);
      });
      y += alto + 3;
    }
  };

  const dibujarCriticidad = () => {
    const total = Math.max(1, input.criticidad.reduce((suma, item) => suma + item.total, 0));
    const anchoBarra = anchoUtil - 47;
    input.criticidad.forEach((item) => {
      asegurarEspacio(9);
      setColorTexto(COLORES.texto);
      pdf.setFont(familiaFuente, "bold");
      pdf.setFontSize(8.5);
      pdf.text(item.etiqueta, margenX, y + 4);
      setColorRelleno([226, 232, 240]);
      pdf.roundedRect(margenX + 31, y, anchoBarra, 5, 2, 2, "F");
      const anchoValor = item.total === 0 ? 0 : Math.max(2, (item.total / total) * anchoBarra);
      setColorRelleno(COLORES[item.nivel]);
      if (anchoValor > 0) pdf.roundedRect(margenX + 31, y, anchoValor, 5, 2, 2, "F");
      setColorTexto(COLORES[item.nivel]);
      pdf.text(`${item.total} (${Math.round((item.total / total) * 100)}%)`, anchoPagina - margenX, y + 4, {
        align: "right",
      });
      y += 8;
    });
    y += 2;
  };

  const dibujarTabla = (
    encabezados: string[],
    filas: string[][],
    anchos: number[],
    opciones: { tamano?: number; coloresFila?: NivelInforme[]; repetirEncabezado?: boolean } = {}
  ) => {
    const tamano = opciones.tamano ?? 7.3;
    const altoEncabezado = 9;
    const dibujarEncabezado = () => {
      asegurarEspacio(altoEncabezado + 5);
      let x = margenX;
      setColorRelleno([239, 246, 255]);
      setColorBorde([191, 219, 254]);
      encabezados.forEach((encabezado, indice) => {
        pdf.rect(x, y, anchos[indice], altoEncabezado, "FD");
        setColorTexto([30, 64, 175]);
        pdf.setFont(familiaFuente, "bold");
        pdf.setFontSize(tamano);
        pdf.text(lineas(encabezado, anchos[indice] - 2, tamano).slice(0, 2), x + 1, y + 3.5, {
          lineHeightFactor: 1.05,
        });
        x += anchos[indice];
      });
      y += altoEncabezado;
    };
    dibujarEncabezado();
    filas.forEach((fila, filaIndice) => {
      const celdas = fila.map((valor, indice) => lineas(valor, anchos[indice] - 2, tamano));
      const maxLineas = Math.max(1, ...celdas.map((celda) => celda.length));
      const altoFila = Math.max(7, maxLineas * tamano * 0.38 + 3);
      if (y + altoFila > limiteInferior) {
        nuevaPagina();
        if (opciones.repetirEncabezado !== false) dibujarEncabezado();
      }
      const nivel = opciones.coloresFila?.[filaIndice] ?? "neutral";
      let x = margenX;
      celdas.forEach((celda, indice) => {
        setColorRelleno(nivel === "neutral" ? COLORES.blanco : FONDOS[nivel]);
        setColorBorde(COLORES.borde);
        pdf.rect(x, y, anchos[indice], altoFila, "FD");
        setColorTexto(indice === celdas.length - 1 && nivel !== "neutral" ? COLORES[nivel] : COLORES.texto);
        pdf.setFont(familiaFuente, indice === 0 || indice === celdas.length - 1 ? "bold" : "normal");
        pdf.setFontSize(tamano);
        pdf.text(celda, x + 1, y + 3.5, { lineHeightFactor: 1.08 });
        x += anchos[indice];
      });
      y += altoFila;
    });
    y += 5;
  };

  const nivelRanking = (item: RankingKpiGerencial): NivelInforme => {
    const pendientes = Math.max(0, item.total - item.cerrados);
    if (item.vencidos > 0 || (item.criticos > 0 && item.tasaCierre < 50)) return "critico";
    if (item.criticos > 0 || (pendientes > 0 && item.tasaCierre === 0)) return "alto";
    if (pendientes > 0 || item.tasaCierre < 80) return "atencion";
    return "controlado";
  };

  const dibujarTendencia = () => {
    if (input.tendencia.length === 0) {
      dibujarParrafo("No existen periodos suficientes para construir una tendencia.", {
        color: COLORES.textoMedio,
      });
      return;
    }
    asegurarEspacio(62);
    const altoGrafico = 43;
    const baseY = y + altoGrafico;
    const anchoGrupo = anchoUtil / input.tendencia.length;
    const maximo = Math.max(1, ...input.tendencia.map((item) => item.total));
    setColorBorde(COLORES.borde);
    pdf.line(margenX, baseY, anchoPagina - margenX, baseY);
    input.tendencia.forEach((item, indice) => {
      const centro = margenX + indice * anchoGrupo + anchoGrupo / 2;
      const series = [
        { valor: item.total, color: [2, 132, 199] as Rgb },
        { valor: item.cerrados, color: COLORES.controlado },
        { valor: item.criticosAbiertos, color: COLORES.critico },
        { valor: item.vencidosAbiertos, color: COLORES.alto },
      ];
      series.forEach((serie, posicion) => {
        const alto = serie.valor === 0 ? 0.8 : Math.max(2, (serie.valor / maximo) * (altoGrafico - 9));
        const x = centro - 7 + posicion * 3.6;
        setColorRelleno(serie.color);
        pdf.rect(x, baseY - alto, 2.8, alto, "F");
        setColorTexto(COLORES.textoMedio);
        pdf.setFont(familiaFuente, "bold");
        pdf.setFontSize(5.5);
        pdf.text(String(serie.valor), x + 1.4, baseY - alto - 1, { align: "center" });
      });
      setColorTexto(COLORES.textoMedio);
      pdf.setFontSize(6.5);
      pdf.text(etiquetaPeriodo(item.periodo), centro, baseY + 4, { align: "center" });
    });
    y = baseY + 8;
    const leyendas = [
      ["Reportados", [2, 132, 199] as Rgb],
      ["Cerrados", COLORES.controlado],
      ["Críticos abiertos", COLORES.critico],
      ["Vencidos abiertos", COLORES.alto],
    ] as Array<[string, Rgb]>;
    let xLeyenda = margenX;
    leyendas.forEach(([texto, color]) => {
      setColorRelleno(color);
      pdf.rect(xLeyenda, y, 3, 3, "F");
      setColorTexto(COLORES.textoMedio);
      pdf.setFont(familiaFuente, "normal");
      pdf.setFontSize(7);
      pdf.text(texto, xLeyenda + 4, y + 2.7);
      xLeyenda += pdf.getTextWidth(texto) + 12;
    });
    y += 8;
    dibujarParrafo(`Lectura gerencial: ${input.lecturaTendencia}`, {
      tamano: 8,
      color: COLORES.textoMedio,
    });
  };

  // Portada ejecutiva compacta.
  setColorRelleno([248, 251, 255]);
  setColorBorde([191, 219, 254]);
  pdf.roundedRect(margenX, y, anchoUtil, 76, 3, 3, "FD");
  setColorRelleno(COLORES.azul);
  pdf.rect(margenX, y, 2.2, 76, "F");
  if (logo) {
    try {
      pdf.addImage(logo, margenX + 6, y + 5, 24, 12, undefined, "FAST");
    } catch {
      // Si el formato de imagen no es compatible, se mantiene la identidad textual.
    }
  }
  setColorTexto(COLORES.texto);
  pdf.setFont(familiaFuente, "bold");
  pdf.setFontSize(9);
  pdf.text(input.marca.nombre, margenX + (logo ? 33 : 6), y + 11);
  setColorTexto(COLORES.azul);
  pdf.setFontSize(7.5);
  pdf.text(input.marca.poweredBy.toUpperCase(), anchoPagina - margenX - 6, y + 10, { align: "right" });
  setColorTexto(COLORES.texto);
  pdf.setFontSize(18);
  const titulo = lineas(input.titulo, anchoUtil - 12, 18).slice(0, 3);
  pdf.text(titulo, margenX + 6, y + 24, { lineHeightFactor: 1.08 });
  const tituloAlto = titulo.length * 7;
  setColorTexto(COLORES.textoMedio);
  pdf.setFont(familiaFuente, "normal");
  pdf.setFontSize(8);
  pdf.text(lineas(input.subtitulo, anchoUtil - 12, 8).slice(0, 2), margenX + 6, y + 26 + tituloAlto, {
    lineHeightFactor: 1.15,
  });
  setColorBorde(COLORES.borde);
  pdf.line(margenX + 6, y + 49, anchoPagina - margenX - 6, y + 49);
  const metadatos = [
    ["PERIODO", input.periodo],
    ["ALCANCE", input.alcance],
    ["EMITIDO POR", `${input.autor.nombre} - ${input.autor.cargo}`],
    ["GENERACION", input.fechaGeneracion],
  ];
  metadatos.forEach(([etiqueta, valor], indice) => {
    const columna = indice % 2;
    const fila = Math.floor(indice / 2);
    const x = margenX + 6 + columna * (anchoUtil / 2 - 3);
    const metaY = y + 56 + fila * 9;
    setColorTexto(COLORES.textoMedio);
    pdf.setFont(familiaFuente, "bold");
    pdf.setFontSize(6.2);
    pdf.text(etiqueta, x, metaY);
    setColorTexto(COLORES.texto);
    pdf.setFontSize(7.4);
    pdf.text(lineas(valor, anchoUtil / 2 - 12, 7.4).slice(0, 1), x, metaY + 3.5);
  });
  y += 82;

  dibujarAlerta();
  tituloSeccion("Resumen ejecutivo", "Lectura consolidada del estado preventivo y de cierre.");
  dibujarParrafo(input.resumen, { tamano: 9.2 });
  dibujarKpis();

  tituloSeccion("Distribución por criticidad", "Composición del universo analizado; el volumen no reemplaza la evaluación del riesgo.");
  dibujarCriticidad();

  tituloSeccion("Plan ejecutivo de acción", "Prioridades convertidas en responsables, plazos y evidencia verificable.");
  dibujarTabla(
    ["Prioridad", "Acción", "Responsable propuesto", "Plazo", "Evidencia esperada"],
    input.planAccion.map((accion) => [
      accion.prioridad,
      accion.accion,
      accion.responsable,
      accion.plazo,
      accion.evidencia,
    ]),
    [18, 65, 39, 17, 43],
    {
      tamano: 6.8,
      coloresFila: input.planAccion.map((accion) =>
        accion.prioridad === "Inmediata" ? "critico" : accion.prioridad === "Alta" ? "alto" : "atencion"
      ),
    }
  );

  tituloSeccion("Tendencia de actividad y presión de riesgo", "Evolución temporal del reporte y del backlog de mayor impacto.");
  dibujarTendencia();

  input.rankings.forEach((ranking) => {
    tituloSeccion(`Top 8 - ${ranking.titulo}`, `${ranking.metrica}. La alerta combina criticidad, vencimiento y avance de cierre.`);
    const visibles = ranking.data.slice(0, 8);
    dibujarTabla(
      ["Pos.", "Nombre", "Total", "Críticos", "Vencidos", "Cerrados", "Tasa", "Alerta"],
      visibles.map((item, indice) => [
        String(indice + 1),
        item.nombre,
        String(item.total),
        String(item.criticos),
        String(item.vencidos),
        String(item.cerrados),
        `${item.tasaCierre}%`,
        nivelRanking(item) === "critico"
          ? "Crítico"
          : nivelRanking(item) === "alto"
            ? "Alto"
            : nivelRanking(item) === "atencion"
              ? "Atención"
              : "Controlado",
      ]),
      [11, 56, 16, 18, 19, 18, 17, 27],
      { tamano: 6.9, coloresFila: visibles.map(nivelRanking) }
    );
  });

  tituloSeccion(
    "Hallazgos que requieren intervención",
    "Priorización automática por criticidad, vencimiento, falta de plazo y ausencia de responsable."
  );
  const hallazgosPrioritariosVisibles = input.hallazgosPrioritarios.slice(0, 10);
  if (hallazgosPrioritariosVisibles.length > 0) {
    dibujarTabla(
      ["Código", "Criticidad", "Empresa / obra", "Responsable", "Plazo", "Motivo de prioridad"],
      hallazgosPrioritariosVisibles.map((hallazgo) => [
        hallazgo.codigo,
        hallazgo.criticidad,
        `${hallazgo.empresa} / ${hallazgo.obra}`,
        hallazgo.responsable,
        hallazgo.plazo,
        hallazgo.motivo,
      ]),
      [27, 20, 44, 35, 25, 31],
      {
        tamano: 6.5,
        coloresFila: hallazgosPrioritariosVisibles.map((hallazgo) =>
          hallazgo.criticidad.toLowerCase().includes("crit") || hallazgo.motivo.toLowerCase().includes("venc")
            ? "critico"
            : "alto"
        ),
      }
    );
  } else {
    dibujarParrafo("No se identifican hallazgos prioritarios para el alcance seleccionado.", {
      color: COLORES.controlado,
      negrita: true,
    });
  }

  tituloSeccion("Calidad y confiabilidad del dato", "Cobertura calculada sobre el universo pertinente de cada indicador.");
  dibujarTabla(
    ["Indicador", "Completos", "Universo", "Cobertura", "Condición"],
    input.calidadDato.map((indicador) => {
      const cobertura = indicador.universo === 0 ? 100 : Math.round((indicador.completos / indicador.universo) * 100);
      return [
        indicador.etiqueta,
        String(indicador.completos),
        String(indicador.universo),
        `${cobertura}%`,
        indicador.nivel === "controlado" ? "Completo" : indicador.nivel === "critico" ? "Crítico" : "Regularizar",
      ];
    }),
    [65, 27, 27, 30, 33],
    { tamano: 7.3, coloresFila: input.calidadDato.map((indicador) => indicador.nivel) }
  );

  if (input.lecturasComplementarias.length > 0) {
    tituloSeccion("Lecturas gerenciales complementarias");
    input.lecturasComplementarias.forEach((lectura) => {
      asegurarEspacio(18);
      setColorRelleno([248, 250, 252]);
      setColorBorde(COLORES.borde);
      const contenido = [
        ...lectura.valores.map((valor) => `- ${valor}`),
        ...(lectura.decision ? [`Decisión: ${lectura.decision}`] : []),
      ];
      const contenidoLineas = contenido.flatMap((valor) => lineas(valor, anchoUtil - 10, 7.8));
      const alto = 10 + contenidoLineas.length * 3.4;
      asegurarEspacio(alto + 3);
      pdf.roundedRect(margenX, y, anchoUtil, alto, 2.3, 2.3, "FD");
      setColorTexto(COLORES.azul);
      pdf.setFont(familiaFuente, "bold");
      pdf.setFontSize(9);
      pdf.text(lectura.titulo, margenX + 4, y + 6);
      setColorTexto(COLORES.texto);
      pdf.setFont(familiaFuente, "normal");
      pdf.setFontSize(7.8);
      pdf.text(contenidoLineas, margenX + 4, y + 11, { lineHeightFactor: 1.15 });
      y += alto + 3;
    });
  }

  tituloSeccion("Alcance, advertencias y marco preventivo");
  input.advertencias.forEach((advertencia) => {
    dibujarParrafo(`- ${advertencia}`, { tamano: 7.8, color: COLORES.textoMedio, sangria: 2 });
  });
  asegurarEspacio(18);
  setColorRelleno([239, 246, 255]);
  setColorBorde([147, 197, 253]);
  const nota = lineas(input.notaNormativa, anchoUtil - 10, 8.3);
  const altoNota = 9 + nota.length * 3.7;
  pdf.roundedRect(margenX, y, anchoUtil, altoNota, 2.5, 2.5, "FD");
  setColorTexto([30, 64, 175]);
  pdf.setFont(familiaFuente, "bold");
  pdf.setFontSize(8.3);
  pdf.text(nota, margenX + 5, y + 6, { lineHeightFactor: 1.18 });

  const totalPaginas = pdf.internal.pages.length - 1;
  for (let pagina = 1; pagina <= totalPaginas; pagina += 1) {
    pdf.setPage(pagina);
    setColorBorde(COLORES.borde);
    pdf.line(margenX, altoPagina - 13, anchoPagina - margenX, altoPagina - 13);
    setColorTexto(COLORES.textoMedio);
    pdf.setFont(familiaFuente, "normal");
    pdf.setFontSize(7);
    pdf.text("Criterio Estratégico - Informe preventivo de apoyo a la gestión", margenX, altoPagina - 8);
    pdf.text(`Página ${pagina} de ${totalPaginas}`, anchoPagina - margenX, altoPagina - 8, { align: "right" });
  }

  pdf.setProperties({
    title: input.titulo,
    subject: input.subtitulo,
    author: `${input.autor.nombre} - ${input.autor.empresa}`,
    creator: "Plataforma Hallazgos - Criterio Estratégico",
    keywords: "hallazgos, prevención, gestión, cierre, riesgos",
  });
  pdf.save(input.filename);
}
