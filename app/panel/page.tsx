"use client";
import { useEffect, useState } from "react";
import { hallazgosMock, notificacionesMock, usuarioMock } from "./mockdata";

function chipColor(tipo: string) {
  const valor = String(tipo).toUpperCase();

  if (valor.includes("CRÍT")) {
    return {
      fondo: "rgba(239,68,68,0.16)",
      borde: "1px solid rgba(239,68,68,0.35)",
      texto: "#fecaca",
    };
  }

  if (valor.includes("ALTO")) {
    return {
      fondo: "rgba(245,158,11,0.16)",
      borde: "1px solid rgba(245,158,11,0.35)",
      texto: "#fde68a",
    };
  }

  if (valor.includes("MED")) {
    return {
      fondo: "rgba(59,130,246,0.16)",
      borde: "1px solid rgba(59,130,246,0.35)",
      texto: "#bfdbfe",
    };
  }

  return {
    fondo: "rgba(34,197,94,0.16)",
    borde: "1px solid rgba(34,197,94,0.35)",
    texto: "#bbf7d0",
  };
}
function semaforoVencimiento(fechaCompromiso: string, estado: string) {
  if (estado === "CERRADO") {
    return {
      etiqueta: "CERRADO",
      fondo: "rgba(34,197,94,0.16)",
      borde: "1px solid rgba(34,197,94,0.35)",
      texto: "#bbf7d0",
    };
  }

  if (!fechaCompromiso) {
    return {
      etiqueta: "SIN FECHA",
      fondo: "rgba(148,163,184,0.16)",
      borde: "1px solid rgba(148,163,184,0.35)",
      texto: "#cbd5e1",
    };
  }

  const [anio, mes, dia] = fechaCompromiso.split("-").map(Number);
  const compromiso = new Date(anio, mes - 1, dia);
  compromiso.setHours(0, 0, 0, 0);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const diferenciaDias = Math.round(
    (compromiso.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diferenciaDias < 0) {
    return {
      etiqueta: "VENCIDO",
      fondo: "rgba(239,68,68,0.16)",
      borde: "1px solid rgba(239,68,68,0.35)",
      texto: "#fecaca",
    };
  }

  if (diferenciaDias <= 2) {
    return {
      etiqueta: "POR VENCER",
      fondo: "rgba(245,158,11,0.16)",
      borde: "1px solid rgba(245,158,11,0.35)",
      texto: "#fde68a",
    };
  }

  return {
    etiqueta: "EN PLAZO",
    fondo: "rgba(34,197,94,0.16)",
    borde: "1px solid rgba(34,197,94,0.35)",
    texto: "#bbf7d0",
  };
}
const panelCardStyle: React.CSSProperties = {
  borderRadius: "22px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.10)",
  boxShadow: "0 12px 28px rgba(0,0,0,0.22)",
  backdropFilter: "blur(6px)",
};

export default function PanelEjecutivoPage() {
  const [vistaDerecha, setVistaDerecha] = useState<"informe" | "configuracion">("informe");
  const [vistaPrincipal, setVistaPrincipal] = useState<"panel" | "configuracion">("panel");
  const [modoSistema, setModoSistema] = useState<"claro" | "oscuro" | "automatico">("oscuro");
const [idiomaSistema, setIdiomaSistema] = useState<"es" | "en" | "auto">("es");
const [nombreEmpresaConfig, setNombreEmpresaConfig] = useState("Cliente corporativo");
const [guardadoConfig, setGuardadoConfig] = useState(false);
  const filas = hallazgosMock;
const totalHistoricoHallazgos = filas.length;
const totalVencidos = filas.filter(
  (fila) =>
    semaforoVencimiento(fila.fechaCompromiso, fila.estado).etiqueta === "VENCIDO"
).length;
const [contadorHistoricoAnimado, setContadorHistoricoAnimado] = useState(0);
const [notificaciones, setNotificaciones] = useState(notificacionesMock);
const totalNotificacionesNoLeidas = notificaciones.filter((item) => !item.leida).length;
const exportarExcel = () => {
  const encabezados = [
    "Código",
    "Empresa",
    "Tipo de hallazgo",
    "Criticidad",
    "Estado",
    "Fecha / Hora",
  ];

  const escapar = (valor: unknown) =>
    `"${String(valor ?? "").replace(/"/g, '""')}"`;

  const filas = filasFiltradas.map((fila) => [
    escapar(fila.codigo),
    escapar(fila.empresa),
    escapar(fila.tipoHallazgo),
    escapar(fila.criticidad),
    escapar(fila.estado),
    escapar(fila.fechaHora),
  ]);

  const csv = [
    encabezados.map(escapar).join(";"),
    ...filas.map((fila) => fila.join(";")),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const fecha = new Date().toISOString().slice(0, 10);

  link.href = url;
  link.download = `hallazgos-filtrados-${fecha}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
const generarInformeEmpresaObra = () => {
  if (filtroEmpresa === "TODAS" && filtroObra === "TODAS") {
    window.alert("Seleccione una empresa o una obra para generar el informe.");
    return;
  }

  const escapeHtml = (valor: unknown) =>
    String(valor ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const normalizarTexto = (valor: unknown) =>
    String(valor ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .trim();

  const formatearFechaFiltro = (valor: string) => {
    if (!valor) return "";
    const [anio, mes, dia] = valor.split("-");
    if (!anio || !mes || !dia) return valor;
    return `${dia}-${mes}-${anio}`;
  };

  const obtenerFechaBase = (item: (typeof filasFiltradas)[number]) => {
    const fechaISO = String(item.fechaISO ?? "").trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(fechaISO)) {
      return fechaISO.slice(0, 10);
    }

    const fechaHora = String(item.fechaHora ?? "").trim();
    const match = fechaHora.match(/^(\d{2})[-/](\d{2})[-/](\d{4})/);
    if (match) {
      const [, dia, mes, anio] = match;
      return `${anio}-${mes}-${dia}`;
    }

    return "";
  };

  const diasEntre = (fechaBase: string) => {
    const texto = String(fechaBase || "").slice(0, 10);
    if (!texto) return 0;

    const [anio, mes, dia] = texto.split("-").map(Number);
    if (!anio || !mes || !dia) return 0;

    const fecha = new Date(anio, mes - 1, dia);
    if (Number.isNaN(fecha.getTime())) return 0;

    const hoy = new Date();
    const hoySoloFecha = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

    const diferencia = hoySoloFecha.getTime() - fecha.getTime();
    return Math.max(0, Math.floor(diferencia / (1000 * 60 * 60 * 24)));
  };

  function chunkArray<T>(array: T[], size: number) {
    const resultado: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      resultado.push(array.slice(i, i + size));
    }
    return resultado;
  }

  const esCriticidad = (valor: unknown, clave: string) =>
    normalizarTexto(valor).includes(clave);

  const total = filasFiltradas.length;
  const abiertos = filasFiltradas.filter((item) => item.estado === "ABIERTO").length;
  const cerrados = filasFiltradas.filter((item) => item.estado === "CERRADO").length;
  const enSeguimiento = filasFiltradas.filter((item) => item.estado === "EN SEGUIMIENTO").length;

  const criticos = filasFiltradas.filter((item) => esCriticidad(item.criticidad, "CRIT")).length;
  const altos = filasFiltradas.filter((item) => esCriticidad(item.criticidad, "ALTO")).length;
  const medios = filasFiltradas.filter((item) => esCriticidad(item.criticidad, "MED")).length;
  const bajos = filasFiltradas.filter((item) => esCriticidad(item.criticidad, "BAJ")).length;

  const hallazgosPendientes = filasFiltradas.filter((item) => item.estado !== "CERRADO");

  const antiguedadMaxima = hallazgosPendientes.length
    ? Math.max(...hallazgosPendientes.map((item) => diasEntre(obtenerFechaBase(item))))
    : 0;

  const tipoDominante =
    Object.entries(
      filasFiltradas.reduce<Record<string, number>>((acc, item) => {
        const tipo = String(item.tipoHallazgo || "Sin clasificar");
        acc[tipo] = (acc[tipo] || 0) + 1;
        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1])[0]?.[0] || "Sin clasificar";

  const pesoCriticidad = (valor: unknown) => {
    const texto = normalizarTexto(valor);
    if (texto.includes("CRIT")) return 4;
    if (texto.includes("ALTO")) return 3;
    if (texto.includes("MED")) return 2;
    if (texto.includes("BAJ")) return 1;
    return 0;
  };

  const textoCriticidad = (peso: number) => {
    if (peso >= 4) return "CRÍTICO";
    if (peso === 3) return "ALTO";
    if (peso === 2) return "MEDIO";
    if (peso === 1) return "BAJO";
    return "SIN CLASIFICAR";
  };

  type SupervisorResumen = {
    nombre: string;
    total: number;
    abiertos: number;
    seguimiento: number;
    criticidadMax: number;
    codigos: string[];
    antiguedadMaxima: number;
    sumaAntiguedad: number;
    criticidadMaxTexto: string;
    codigosTexto: string;
    antiguedadPromedio: number;
  };

  const supervisoresPendientes: SupervisorResumen[] = Object.values(
    hallazgosPendientes.reduce<
      Record<
        string,
        {
          nombre: string;
          total: number;
          abiertos: number;
          seguimiento: number;
          criticidadMax: number;
          codigos: string[];
          antiguedadMaxima: number;
          sumaAntiguedad: number;
        }
      >
    >((acc, item) => {
      const nombre = String(item.reportante || "Sin supervisor").trim() || "Sin supervisor";
      const clave = normalizarTexto(nombre);
      const diasPendiente = diasEntre(obtenerFechaBase(item));

      if (!acc[clave]) {
        acc[clave] = {
          nombre,
          total: 0,
          abiertos: 0,
          seguimiento: 0,
          criticidadMax: 0,
          codigos: [],
          antiguedadMaxima: 0,
          sumaAntiguedad: 0,
        };
      }

      acc[clave].total += 1;

      if (item.estado === "ABIERTO") acc[clave].abiertos += 1;
      if (item.estado === "EN SEGUIMIENTO") acc[clave].seguimiento += 1;

      acc[clave].criticidadMax = Math.max(
        acc[clave].criticidadMax,
        pesoCriticidad(item.criticidad)
      );

      acc[clave].antiguedadMaxima = Math.max(acc[clave].antiguedadMaxima, diasPendiente);
      acc[clave].sumaAntiguedad += diasPendiente;

      acc[clave].codigos.push(String(item.codigo || ""));

      return acc;
    }, {})
  )
    .map((supervisor) => ({
      ...supervisor,
      criticidadMaxTexto: textoCriticidad(supervisor.criticidadMax),
      codigosTexto: supervisor.codigos.join(", "),
      antiguedadPromedio:
        supervisor.total > 0
          ? Math.round(supervisor.sumaAntiguedad / supervisor.total)
          : 0,
    }))
    .sort((a, b) => {
      if (b.criticidadMax !== a.criticidadMax) return b.criticidadMax - a.criticidadMax;
      if (b.total !== a.total) return b.total - a.total;
      return b.antiguedadMaxima - a.antiguedadMaxima;
    });

  const pendientesCriticos = hallazgosPendientes.filter((item) =>
    esCriticidad(item.criticidad, "CRIT")
  ).length;
  const pendientesAltos = hallazgosPendientes.filter((item) =>
    esCriticidad(item.criticidad, "ALTO")
  ).length;
  const pendientesMedios = hallazgosPendientes.filter((item) =>
    esCriticidad(item.criticidad, "MED")
  ).length;
  const pendientesBajos = hallazgosPendientes.filter((item) =>
    esCriticidad(item.criticidad, "BAJ")
  ).length;

  const penalizacionAntiguedad =
    antiguedadMaxima > 14 ? 15 :
    antiguedadMaxima > 7 ? 8 :
    0;

  const puntajeEmpresa = Math.max(
    0,
    100 -
      pendientesCriticos * 40 -
      pendientesAltos * 25 -
      pendientesMedios * 12 -
      pendientesBajos * 5 -
      enSeguimiento * 4 -
      penalizacionAntiguedad
  );

  const rankingEmpresa = (() => {
    if (puntajeEmpresa >= 90) {
      return {
        nombre: "PLATINO",
        semaforo: "VERDE",
        color: "#22c55e",
        descripcion: "Control preventivo sólido dentro del período analizado.",
      };
    }
    if (puntajeEmpresa >= 75) {
      return {
        nombre: "ORO",
        semaforo: "VERDE",
        color: "#84cc16",
        descripcion: "Buen nivel de control, con brechas menores bajo seguimiento.",
      };
    }
    if (puntajeEmpresa >= 60) {
      return {
        nombre: "PLATA",
        semaforo: "AMARILLO",
        color: "#f59e0b",
        descripcion: "Gestión aceptable, pero con desviaciones que requieren corrección.",
      };
    }
    if (puntajeEmpresa >= 40) {
      return {
        nombre: "BRONCE",
        semaforo: "NARANJO",
        color: "#f97316",
        descripcion: "Condición de riesgo operativo con control insuficiente.",
      };
    }
    return {
      nombre: "ROJO",
      semaforo: "ROJO",
      color: "#ef4444",
      descripcion: "Exposición relevante y necesidad de intervención prioritaria.",
    };
  })();

  const diagnosticoEjecutivo = (() => {
    if (total === 0) {
      return "En el período evaluado no se registran hallazgos para los filtros seleccionados, lo que refleja una condición de control favorable dentro del alcance analizado.";
    }

    if (criticos > 0) {
      return `En el período evaluado se identifican ${criticos} hallazgo(s) de criticidad crítica, con ${abiertos} abierto(s) y una antigüedad máxima de ${antiguedadMaxima} día(s), condición que exige intervención inmediata, trazabilidad de cierre y control formal de la administración responsable.`;
    }

    if (altos > 0 && hallazgosPendientes.length > 0) {
      return `En el período evaluado la empresa mantiene ${hallazgosPendientes.length} hallazgo(s) pendiente(s), con predominio de criticidad alta y una antigüedad máxima de ${antiguedadMaxima} día(s), lo que evidencia una brecha de gestión correctiva que debe regularizarse para evitar reincidencia y observaciones en auditoría.`;
    }

    if (enSeguimiento > 0) {
      return `El informe muestra ${enSeguimiento} hallazgo(s) en seguimiento, asociados principalmente a ${tipoDominante.toLowerCase()}, lo que indica acciones en curso pero aún sin cierre definitivo, por lo que se recomienda consolidar evidencia y verificar efectividad de control.`;
    }

    if (cerrados === total) {
      return "Los hallazgos del período evaluado se encuentran cerrados, lo que refleja una respuesta correctiva ejecutada dentro del alcance analizado y una condición de control más estable para la empresa revisada.";
    }

    return `En el período evaluado se registran ${total} hallazgo(s), con predominio de ${tipoDominante.toLowerCase()}, por lo que se recomienda mantener seguimiento operativo y reforzar control preventivo sobre las desviaciones detectadas.`;
  })();

  const cantidadPrioritaria =
    pendientesCriticos > 0 ? pendientesCriticos :
    pendientesAltos > 0 ? pendientesAltos :
    pendientesMedios > 0 ? pendientesMedios :
    pendientesBajos > 0 ? pendientesBajos :
    hallazgosPendientes.length;

  const criticidadPrioritaria =
    pendientesCriticos > 0 ? "crítica" :
    pendientesAltos > 0 ? "alta" :
    pendientesMedios > 0 ? "media" :
    pendientesBajos > 0 ? "baja" :
    "sin clasificar";

  const condicionPrioritaria =
    abiertos > 0 ? "abierta" :
    enSeguimiento > 0 ? "en seguimiento" :
    "pendiente";

  const plazoHoras =
    pendientesCriticos > 0 ? 24 :
    pendientesAltos > 0 ? 72 :
    pendientesMedios > 0 ? 120 :
    168;

  const recomendacionPrioritaria =
    total === 0
      ? "Sin hallazgos pendientes para el período seleccionado. Se recomienda mantener el estándar de control y trazabilidad documental vigente."
      : `Prioridad inmediata: regularizar ${cantidadPrioritaria} hallazgo(s) de criticidad ${criticidadPrioritaria} con condición predominante ${condicionPrioritaria}, priorizando evidencia de cierre dentro de ${plazoHoras} horas y verificación formal de la acción correctiva.`;

  const fechaEmision = new Date().toLocaleString("es-CL");

  const baseFolio =
    filtroEmpresa !== "TODAS"
      ? String(filtroEmpresa)
      : filtroObra !== "TODAS"
        ? String(filtroObra)
        : "EMP";

  const siglaEmpresaInforme =
    baseFolio
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((palabra) => palabra[0])
      .join("")
      .toUpperCase() || "EMP";

  const ahoraInforme = new Date();
  const dd = String(ahoraInforme.getDate()).padStart(2, "0");
  const mm = String(ahoraInforme.getMonth() + 1).padStart(2, "0");
  const yyyy = String(ahoraInforme.getFullYear());
  const hh = String(ahoraInforme.getHours()).padStart(2, "0");
  const min = String(ahoraInforme.getMinutes()).padStart(2, "0");
  const ss = String(ahoraInforme.getSeconds()).padStart(2, "0");

  const folioInforme = `${siglaEmpresaInforme}-IEO-${dd}${mm}${yyyy}-${hh}${min}${ss}`;

  const fechasISOOrdenadas = filasFiltradas
    .map((item) => obtenerFechaBase(item))
    .filter(Boolean)
    .sort();

  const fechaInicioInforme = filtroFechaDesde
    ? formatearFechaFiltro(filtroFechaDesde)
    : fechasISOOrdenadas.length
      ? formatearFechaFiltro(fechasISOOrdenadas[0])
      : "Sin inicio";

  const fechaFinInforme = filtroFechaHasta
    ? formatearFechaFiltro(filtroFechaHasta)
    : fechasISOOrdenadas.length
      ? formatearFechaFiltro(fechasISOOrdenadas[fechasISOOrdenadas.length - 1])
      : "Sin cierre";

  const maxEstado = Math.max(abiertos, enSeguimiento, cerrados, 1);
  const maxCriticidad = Math.max(criticos, altos, medios, bajos, 1);
  const maxCriticidadTexto =
    criticos > 0 ? "CRÍTICO" :
    altos > 0 ? "ALTO" :
    medios > 0 ? "MEDIO" :
    bajos > 0 ? "BAJO" :
    "SIN CLASIFICAR";

  const supervisorChunks = chunkArray(supervisoresPendientes, 8);
  const hallazgoChunks = chunkArray(filasFiltradas, 12);

  const pagina1Html = `
    <section class="sheet">
      <div class="header">
        <div>
          <h1>Informe Ejecutivo Empresa / Obra</h1>
          <div class="sub">Criterio Estratégico · Emisión: ${escapeHtml(fechaEmision)}</div>
        </div>
        <div class="folio-box">Folio: ${escapeHtml(folioInforme)}</div>
      </div>

      <div class="meta-grid">
        <div class="meta-item">
          <div class="label">Empresa seleccionada</div>
          <div class="value">${escapeHtml(filtroEmpresa)}</div>
        </div>
        <div class="meta-item">
          <div class="label">Obra / Proyecto seleccionado</div>
          <div class="value">${escapeHtml(filtroObra)}</div>
        </div>
        <div class="meta-item">
          <div class="label">Estado</div>
          <div class="value">${escapeHtml(filtroEstado)}</div>
        </div>
        <div class="meta-item">
          <div class="label">Criticidad</div>
          <div class="value">${escapeHtml(filtroCriticidad)}</div>
        </div>
        <div class="meta-item">
          <div class="label">Tipo de hallazgo</div>
          <div class="value">${escapeHtml(filtroTipoHallazgo)}</div>
        </div>
        <div class="meta-item">
          <div class="label">Fecha inicio</div>
          <div class="value">${escapeHtml(fechaInicioInforme)}</div>
        </div>
        <div class="meta-item">
          <div class="label">Fecha término</div>
          <div class="value">${escapeHtml(fechaFinInforme)}</div>
        </div>
        <div class="meta-item">
          <div class="label">Máx. criticidad del período</div>
          <div class="value">${escapeHtml(maxCriticidadTexto)}</div>
        </div>
      </div>

      <div class="grid-2">
        <div class="card avoid-break">
          <div class="section-title">Ranking de control preventivo</div>
          <div class="ranking-card">
            <div class="ranking-badge" style="background:${rankingEmpresa.color};">
              <div class="ranking-badge-label">Ranking del período</div>
              <div class="ranking-badge-name">${escapeHtml(rankingEmpresa.nombre)}</div>
              <div class="ranking-badge-score">Puntaje: ${escapeHtml(puntajeEmpresa)}/100</div>
            </div>
            <div class="ranking-info">
              <div class="ranking-chip">
                <span class="ranking-dot" style="background:${rankingEmpresa.color};"></span>
                Semáforo: ${escapeHtml(rankingEmpresa.semaforo)}
              </div>
              <div class="ranking-text">${escapeHtml(rankingEmpresa.descripcion)}</div>
              <div class="ranking-text">
                Este resultado considera la criticidad, la condición de cierre y la antigüedad de los hallazgos pendientes dentro del alcance evaluado.
              </div>
            </div>
          </div>
        </div>

        <div class="card avoid-break">
          <div class="section-title">Indicadores ejecutivos</div>
          <div class="kpi-grid">
            <div class="kpi">
              <div class="kpi-title">Total hallazgos</div>
              <div class="kpi-value">${escapeHtml(total)}</div>
            </div>
            <div class="kpi">
              <div class="kpi-title">Abiertos</div>
              <div class="kpi-value">${escapeHtml(abiertos)}</div>
            </div>
            <div class="kpi">
              <div class="kpi-title">Cerrados</div>
              <div class="kpi-value">${escapeHtml(cerrados)}</div>
            </div>
            <div class="kpi">
              <div class="kpi-title">Críticos</div>
              <div class="kpi-value">${escapeHtml(criticos)}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid-2">
        <div class="card avoid-break">
          <div class="section-title">Estado de reportes</div>
          <div class="bar-list">
            <div class="bar-row">
              <div class="bar-label">Abiertos</div>
              <div class="bar-track">
                <div class="bar-fill" style="width:${(abiertos / maxEstado) * 100}%; background:#f59e0b;"></div>
              </div>
              <div class="bar-value">${escapeHtml(abiertos)}</div>
            </div>
            <div class="bar-row">
              <div class="bar-label">En seguimiento</div>
              <div class="bar-track">
                <div class="bar-fill" style="width:${(enSeguimiento / maxEstado) * 100}%; background:#3b82f6;"></div>
              </div>
              <div class="bar-value">${escapeHtml(enSeguimiento)}</div>
            </div>
            <div class="bar-row">
              <div class="bar-label">Cerrados</div>
              <div class="bar-track">
                <div class="bar-fill" style="width:${(cerrados / maxEstado) * 100}%; background:#22c55e;"></div>
              </div>
              <div class="bar-value">${escapeHtml(cerrados)}</div>
            </div>
          </div>
        </div>

        <div class="card avoid-break">
          <div class="section-title">Distribución por criticidad</div>
          <div class="bar-list">
            <div class="bar-row">
              <div class="bar-label">Críticos</div>
              <div class="bar-track">
                <div class="bar-fill" style="width:${(criticos / maxCriticidad) * 100}%; background:#ef4444;"></div>
              </div>
              <div class="bar-value">${escapeHtml(criticos)}</div>
            </div>
            <div class="bar-row">
              <div class="bar-label">Altos</div>
              <div class="bar-track">
                <div class="bar-fill" style="width:${(altos / maxCriticidad) * 100}%; background:#f59e0b;"></div>
              </div>
              <div class="bar-value">${escapeHtml(altos)}</div>
            </div>
            <div class="bar-row">
              <div class="bar-label">Medios</div>
              <div class="bar-track">
                <div class="bar-fill" style="width:${(medios / maxCriticidad) * 100}%; background:#3b82f6;"></div>
              </div>
              <div class="bar-value">${escapeHtml(medios)}</div>
            </div>
            <div class="bar-row">
              <div class="bar-label">Bajos</div>
              <div class="bar-track">
                <div class="bar-fill" style="width:${(bajos / maxCriticidad) * 100}%; background:#22c55e;"></div>
              </div>
              <div class="bar-value">${escapeHtml(bajos)}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid-2">
        <div class="card avoid-break">
          <div class="section-title">Diagnóstico ejecutivo automático</div>
          <div class="text-block">${escapeHtml(diagnosticoEjecutivo)}</div>
        </div>

        <div class="card avoid-break">
          <div class="section-title">Resumen de gestión responsable</div>
          <div class="summary-grid">
            <div class="summary-stat">
  <div class="summary-label">Supervisores con pendientes</div>
  <div class="summary-value">${escapeHtml(supervisoresPendientes.length)}</div>
</div>

<div class="summary-stat">
  <div class="summary-label">Hallazgos pendientes</div>
  <div class="summary-value">${escapeHtml(hallazgosPendientes.length)}</div>
</div>

<div class="summary-stat">
  <div class="summary-label">Antigüedad máxima</div>
  <div class="summary-value">${escapeHtml(antiguedadMaxima)} d</div>
</div>

<div class="summary-stat">
  <div class="summary-label">Tipo dominante</div>
  <div class="summary-value" style="font-size:14px; line-height:1.2;">
    ${escapeHtml(tipoDominante)}
  </div>
</div>
          </div>
        </div>
      </div>

      <div class="card accent-card avoid-break">
        <div class="section-title">Recomendación prioritaria</div>
        <div class="text-block strong">${escapeHtml(recomendacionPrioritaria)}</div>
      </div>

      <div class="card soft-card avoid-break">
        <div class="section-title">Recordatorio de gestión</div>
        <div class="text-block">
          El presente informe ejecutivo es remitido para conocimiento y acción de la administración responsable, con el objeto de revisar, gestionar y cerrar los hallazgos pendientes detectados en la empresa evaluada. La permanencia de estas desviaciones sin regularización oportuna afecta la trazabilidad de la gestión preventiva del proyecto y puede incrementar la exposición a incidentes con consecuencias sobre la seguridad de las personas, la continuidad operacional, los activos y el entorno ambiental. Se solicita priorizar las acciones correctivas correspondientes y mantener evidencia verificable de su cierre.
        </div>
      </div>
    </section>
  `;

  const supervisorPagesHtml = (supervisorChunks.length ? supervisorChunks : [[]]).map((chunk, index, arr) => {
    const filasSupervisor =
      chunk.length === 0
        ? `<tr><td colspan="8">No hay supervisores con hallazgos pendientes en el período seleccionado.</td></tr>`
        : chunk
            .map(
              (supervisor) => `
                <tr>
                  <td>${escapeHtml(supervisor.nombre)}</td>
                  <td>${escapeHtml(supervisor.total)}</td>
                  <td>${escapeHtml(supervisor.abiertos)}</td>
                  <td>${escapeHtml(supervisor.seguimiento)}</td>
                  <td>${escapeHtml(supervisor.criticidadMaxTexto)}</td>
                  <td>${escapeHtml(supervisor.antiguedadMaxima)} d</td>
                  <td>${escapeHtml(supervisor.antiguedadPromedio)} d</td>
                  <td>${escapeHtml(supervisor.codigosTexto)}</td>
                </tr>
              `
            )
            .join("");

    return `
      <section class="sheet">
        <div class="page-head">
          <div>
            <h2 class="page-title">Análisis de supervisores con hallazgos pendientes</h2>
            <div class="page-subtitle">
              Resumen de responsables con hallazgos abiertos o en seguimiento dentro del período analizado.
            </div>
          </div>
          <div class="page-counter">Página ${index + 1} de ${arr.length}</div>
        </div>

        <div class="card">
          <table class="table-report">
            <thead>
              <tr>
                <th>Supervisor</th>
                <th>Pendientes</th>
                <th>Abiertos</th>
                <th>En seguimiento</th>
                <th>Máx. criticidad</th>
                <th>Más antiguo</th>
                <th>Promedio</th>
                <th>Códigos asociados</th>
              </tr>
            </thead>
            <tbody>
              ${filasSupervisor}
            </tbody>
          </table>
          <div class="table-note">
            ${escapeHtml(
              supervisoresPendientes.length === 0
                ? "Sin supervisores con hallazgos pendientes dentro del período seleccionado."
                : `Se presentan ${chunk.length} supervisor(es) en esta hoja, ordenados por criticidad, cantidad de pendientes y antigüedad.`
            )}
          </div>
        </div>
      </section>
    `;
  }).join("");

  const detallePagesHtml = (hallazgoChunks.length ? hallazgoChunks : [[]]).map((chunk, index, arr) => {
    const filasDetalle =
      chunk.length === 0
        ? `<tr><td colspan="6">Sin hallazgos para los filtros seleccionados.</td></tr>`
        : chunk
            .map(
              (fila) => `
                <tr>
                  <td>${escapeHtml(fila.codigo)}</td>
                  <td>${escapeHtml(fila.empresa)}</td>
                  <td>${escapeHtml(fila.tipoHallazgo)}</td>
                  <td>${escapeHtml(fila.criticidad)}</td>
                  <td>${escapeHtml(fila.estado)}</td>
                  <td>${escapeHtml(fila.fechaHora)}</td>
                </tr>
              `
            )
            .join("");

    return `
      <section class="sheet">
        <div class="page-head">
          <div>
            <h2 class="page-title">Detalle completo de hallazgos filtrados</h2>
            <div class="page-subtitle">
              Registro detallado de hallazgos contenidos dentro del alcance y filtros aplicados.
            </div>
          </div>
          <div class="page-counter">Página ${index + 1} de ${arr.length}</div>
        </div>

        <div class="card">
          <table class="table-report">
            <thead>
              <tr>
                <th>Código</th>
                <th>Empresa</th>
                <th>Tipo de hallazgo</th>
                <th>Criticidad</th>
                <th>Estado</th>
                <th>Fecha / Hora</th>
              </tr>
            </thead>
            <tbody>
              ${filasDetalle}
            </tbody>
          </table>
          <div class="table-note">
            Informe generado automáticamente desde la plataforma ejecutiva para revisión y envío gerencial.
          </div>
        </div>
      </section>
    `;
  }).join("");

  const html = `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Informe empresa/obra</title>
        <style>
          @page {
            size: Letter;
            margin: 12mm;
          }

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 24px 0 48px;
            font-family: Arial, sans-serif;
            color: #111827;
            background: #e5e7eb;
          }

          .sheet {
            width: min(216mm, calc(100vw - 48px));
            min-height: 279mm;
            margin: 0 auto 40px;
            padding: 16mm;
            background: #ffffff;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(15, 23, 42, 0.08);
          }

          .header,
          .page-head {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 16px;
            margin-bottom: 18px;
          }

          h1 {
            margin: 0 0 6px;
            font-size: 28px;
            line-height: 1.1;
          }

          .page-title {
            margin: 0 0 6px;
            font-size: 24px;
            line-height: 1.15;
          }

          .sub,
          .page-subtitle {
            font-size: 13px;
            color: #4b5563;
          }

          .folio-box,
          .page-counter {
            white-space: nowrap;
            border-radius: 999px;
            padding: 8px 14px;
            font-size: 12px;
            font-weight: 800;
          }

          .folio-box {
            background: #163a70;
            color: #ffffff;
          }

          .page-counter {
            background: #f3f4f6;
            color: #374151;
            border: 1px solid #d1d5db;
          }

          .meta-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 12px;
            margin-bottom: 16px;
          }

          .meta-item,
          .card,
          .kpi,
          .summary-stat {
            border: 1px solid #d1d5db;
            border-radius: 12px;
            background: #ffffff;
          }

          .meta-item {
            padding: 10px 12px;
          }

          .label,
          .section-title,
          .summary-label,
          .kpi-title {
            font-size: 12px;
            color: #6b7280;
          }

          .value {
            margin-top: 4px;
            font-size: 14px;
            font-weight: 700;
          }

          .grid-2 {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 14px;
            margin-top: 14px;
          }

          .card {
            padding: 14px;
          }

          .section-title {
            margin-bottom: 10px;
            font-weight: 800;
          }

         .ranking-card {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 12px;
  align-items: start;
}

.ranking-badge {
  min-height: 92px;
  border-radius: 12px;
  padding: 12px 10px;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.ranking-badge-label {
  font-size: 10px;
  font-weight: 700;
  opacity: 0.92;
  margin-bottom: 4px;
}

.ranking-badge-name {
  font-size: 20px;
  font-weight: 900;
  line-height: 1;
  margin-bottom: 6px;
}

.ranking-badge-score {
  font-size: 12px;
  font-weight: 800;
}

          .ranking-info {
            display: grid;
            gap: 10px;
          }

          .ranking-chip {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            width: fit-content;
            border: 1px solid #d1d5db;
            border-radius: 999px;
            padding: 6px 10px;
            background: #f9fafb;
            font-size: 12px;
            font-weight: 800;
            color: #374151;
          }

          .ranking-dot {
            width: 10px;
            height: 10px;
            border-radius: 999px;
            display: inline-block;
          }

          .ranking-text,
          .text-block {
            font-size: 13px;
            color: #374151;
            line-height: 1.65;
          }

          .strong {
            font-weight: 800;
          }

         .kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.kpi,
.summary-stat {
  padding: 12px;
}

.kpi-value {
  margin-top: 6px;
  font-size: 24px;
  font-weight: 900;
  line-height: 1;
}

.summary-value {
  margin-top: 6px;
  font-size: 16px;
  font-weight: 800;
  line-height: 1.15;
  word-break: break-word;
}

          .bar-list {
            display: grid;
            gap: 12px;
          }

          .bar-row {
            display: grid;
            grid-template-columns: 140px 1fr 48px;
            gap: 10px;
            align-items: center;
          }

          .bar-label {
            font-size: 13px;
            font-weight: 700;
            color: #374151;
          }

          .bar-track {
            height: 12px;
            border-radius: 999px;
            background: #e5e7eb;
            overflow: hidden;
          }

          .bar-fill {
            height: 100%;
            border-radius: 999px;
          }

          .bar-value {
            font-size: 13px;
            font-weight: 800;
            text-align: right;
          }

          .accent-card {
  border-left: 5px solid #163a70;
  margin-top: 10px;
}

.soft-card {
  background: #f3f4f6;
  border-color: #d7dce2;
  margin-top: 10px;
}

          .table-report {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }

          .table-report th,
          .table-report td {
            border: 1px solid #d1d5db;
            padding: 8px 10px;
            text-align: left;
            vertical-align: top;
          }

          .table-report th {
            background: #f3f4f6;
            font-weight: 800;
          }

          .table-note {
            margin-top: 10px;
            font-size: 12px;
            color: #6b7280;
          }

          .avoid-break {
            page-break-inside: avoid;
            break-inside: avoid;
          }

          @media print {
            body {
              margin: 0;
              padding: 0;
              background: #ffffff;
            }

            .sheet {
              width: auto;
              min-height: auto;
              margin: 0;
              padding: 0;
              background: #ffffff;
              border: none;
              border-radius: 0;
              box-shadow: none;
              page-break-after: always;
              break-after: page;
            }

            .sheet:last-child {
              page-break-after: auto;
              break-after: auto;
            }
          }
        </style>
      </head>
      <body>
        ${pagina1Html}
        ${supervisorPagesHtml}
        ${detallePagesHtml}
      </body>
    </html>
  `;

  const ventana = window.open("", "_blank", "width=1200,height=1200");
  if (!ventana) return;

  ventana.document.open();
  ventana.document.write(html);
  ventana.document.close();
  ventana.focus();

  setTimeout(() => {
    ventana.print();
  }, 350);
};
useEffect(() => {
  let frame = 0;
  const duracion = 1200;
  const pasos = 36;
  const incremento = totalHistoricoHallazgos / pasos;

  setContadorHistoricoAnimado(0);

  const intervalo = window.setInterval(() => {
    frame += 1;
    const valor = Math.round(incremento * frame);

    if (frame >= pasos) {
      setContadorHistoricoAnimado(totalHistoricoHallazgos);
      window.clearInterval(intervalo);
      return;
    }

    setContadorHistoricoAnimado(
      valor > totalHistoricoHallazgos ? totalHistoricoHallazgos : valor
    );
  }, duracion / pasos);

  return () => window.clearInterval(intervalo);
}, [totalHistoricoHallazgos]);
const [hallazgoActivo, setHallazgoActivo] = useState(filas[0]);
const [filtroRapido, setFiltroRapido] = useState<"HOY" | "SEMANA" | "MES" | "PERSONALIZADO">("HOY");
const [filtroEmpresa, setFiltroEmpresa] = useState("TODAS");
const [filtroObra, setFiltroObra] = useState("TODAS");
const [filtroEstado, setFiltroEstado] = useState("TODOS");
const [filtroCriticidad, setFiltroCriticidad] = useState("TODAS");
const [filtroFechaDesde, setFiltroFechaDesde] = useState("");
const [filtroFechaHasta, setFiltroFechaHasta] = useState("");
const [filtroTipoHallazgo, setFiltroTipoHallazgo] = useState("TODOS");
const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
const [usuario, setUsuario] = useState(usuarioMock);
const [mostrarEditorPerfil, setMostrarEditorPerfil] = useState(false);
const inicialUsuario = usuario.nombre.charAt(0).toUpperCase();
const limpiarFiltros = () => {
  setFiltroRapido("PERSONALIZADO");
  setFiltroEmpresa("TODAS");
  setFiltroObra("TODAS");
  setFiltroEstado("TODOS");
  setFiltroCriticidad("TODAS");
  setFiltroFechaDesde("");
  setFiltroFechaHasta("");
  setFiltroTipoHallazgo("TODOS");
};
const abrirNotificacion = (hallazgoId: string) => {
  const hallazgoRelacionado = filas.find((item) => item.id === hallazgoId);

  if (!hallazgoRelacionado) {
    return;
  }

  setHallazgoActivo(hallazgoRelacionado);

  setNotificaciones((prev) =>
    prev.map((item) =>
      item.hallazgoId === hallazgoId ? { ...item, leida: true } : item
    )
  );

  setMostrarNotificaciones(false);
};
const quitarFiltro = (filtro: string) => {
  if (filtro.startsWith("Empresa:")) {
    setFiltroEmpresa("TODAS");
    return;
  }

  if (filtro.startsWith("Obra:")) {
    setFiltroObra("TODAS");
    return;
  }

  if (filtro.startsWith("Estado:")) {
    setFiltroEstado("TODOS");
    return;
  }

  if (filtro.startsWith("Criticidad:")) {
    setFiltroCriticidad("TODAS");
    return;
  }

  if (filtro.startsWith("Tipo:")) {
    setFiltroTipoHallazgo("TODOS");
    return;
  }

  if (filtro.startsWith("Desde:")) {
    setFiltroRapido("PERSONALIZADO");
    setFiltroFechaDesde("");
    return;
  }

  if (filtro.startsWith("Hasta:")) {
    setFiltroRapido("PERSONALIZADO");
    setFiltroFechaHasta("");
  }
};
const formatearFechaInput = (fecha: Date) => {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const aplicarFiltroRapido = (
  modo: "HOY" | "SEMANA" | "MES" | "PERSONALIZADO"
) => {
  setFiltroRapido(modo);

  if (modo === "PERSONALIZADO") {
    setFiltroFechaDesde("");
    setFiltroFechaHasta("");
    return;
  }

  const hasta = new Date(fechaBase);
  const desde = new Date(fechaBase);

  if (modo === "HOY") {
    desde.setHours(0, 0, 0, 0);
  } else if (modo === "SEMANA") {
    desde.setDate(desde.getDate() - 6);
  } else if (modo === "MES") {
    desde.setDate(1);
  }

  setFiltroFechaDesde(formatearFechaInput(desde));
  setFiltroFechaHasta(formatearFechaInput(hasta));
};

const opcionesEmpresa = ["TODAS", ...new Set(filas.map((item) => item.empresa))];
const opcionesObra = ["TODAS", ...new Set(filas.map((item) => item.obra))];
const opcionesEstado = ["TODOS", ...new Set(filas.map((item) => item.estado))];
const opcionesCriticidad = ["TODAS", ...new Set(filas.map((item) => item.criticidad))];
const opcionesTipoHallazgo = ["TODOS", ...new Set(filas.map((item) => item.tipoHallazgo))];

const fechaBase = new Date(
  Math.max(...filas.map((item) => new Date(item.fechaISO).getTime()))
);

const inicioDia = new Date(fechaBase);
inicioDia.setHours(0, 0, 0, 0);

const finDia = new Date(fechaBase);
finDia.setHours(23, 59, 59, 999);

const inicioSemana = new Date(inicioDia);
inicioSemana.setDate(inicioSemana.getDate() - 6);

const inicioMes = new Date(
  fechaBase.getFullYear(),
  fechaBase.getMonth(),
  1
);

const filasBase = filas.filter((item) => {
  const fechaItem = new Date(item.fechaISO);

  const cumpleEmpresa =
    filtroEmpresa === "TODAS" || item.empresa === filtroEmpresa;

  const cumpleObra =
    filtroObra === "TODAS" || item.obra === filtroObra;

  const cumpleEstado =
    filtroEstado === "TODOS" || item.estado === filtroEstado;

  const cumpleCriticidad =
    filtroCriticidad === "TODAS" || item.criticidad === filtroCriticidad;

  const cumpleTipoHallazgo =
    filtroTipoHallazgo === "TODOS" ||
    item.tipoHallazgo === filtroTipoHallazgo;

  const cumpleFechaDesde =
    !filtroFechaDesde ||
    fechaItem >= new Date(`${filtroFechaDesde}T00:00:00`);

  const cumpleFechaHasta =
    !filtroFechaHasta ||
    fechaItem <= new Date(`${filtroFechaHasta}T23:59:59`);

  return (
    cumpleEmpresa &&
    cumpleObra &&
    cumpleEstado &&
    cumpleCriticidad &&
    cumpleTipoHallazgo &&
    cumpleFechaDesde &&
    cumpleFechaHasta
  );
});

const filasFiltradas = filasBase.filter((item) => {
  const fecha = new Date(item.fechaISO);

  if (filtroRapido === "HOY") {
    return fecha >= inicioDia && fecha <= finDia;
  }

  if (filtroRapido === "SEMANA") {
    return fecha >= inicioSemana && fecha <= finDia;
  }

  if (filtroRapido === "MES") {
    return fecha >= inicioMes && fecha <= finDia;
  }

  return true;
});
const ultimaActualizacion =
  filasFiltradas.length > 0
    ? filasFiltradas.reduce((max, item) => {
        return new Date(item.fechaISO) > new Date(max.fechaISO) ? item : max;
      }).fechaHora
    : "Sin datos";
    const filtrosActivos = [
  filtroEmpresa !== "TODAS" ? `Empresa: ${filtroEmpresa}` : null,
  filtroObra !== "TODAS" ? `Obra: ${filtroObra}` : null,
  filtroEstado !== "TODOS" ? `Estado: ${filtroEstado}` : null,
  filtroCriticidad !== "TODAS" ? `Criticidad: ${filtroCriticidad}` : null,
  filtroTipoHallazgo !== "TODOS"
    ? `Tipo: ${filtroTipoHallazgo}`
    : null,
  filtroFechaDesde ? `Desde: ${filtroFechaDesde}` : null,
  filtroFechaHasta ? `Hasta: ${filtroFechaHasta}` : null,
].filter(Boolean) as string[];
   const reportesPorEmpresaBase = Array.from(
  filasFiltradas.reduce((acc, item) => {
    acc.set(item.empresa, (acc.get(item.empresa) || 0) + 1);
    return acc;
  }, new Map<string, number>())
)
  .map(([empresa, total]) => ({ empresa, total }))
  .sort((a, b) => b.total - a.total);

const reportesPorEmpresa =
  reportesPorEmpresaBase.length <= 5
    ? reportesPorEmpresaBase
    : [
        ...reportesPorEmpresaBase.slice(0, 5),
        {
          empresa: "Otras",
          total: reportesPorEmpresaBase
            .slice(5)
            .reduce((sum, item) => sum + item.total, 0),
        },
      ];
      const criticidadResumen = [
  {
    label: "Críticos",
    total: filasFiltradas.filter((item) => item.criticidad === "CRÍTICO").length,
    color: "#ef4444",
  },
  {
    label: "Altos",
    total: filasFiltradas.filter((item) => item.criticidad === "ALTO").length,
    color: "#f59e0b",
  },
  {
    label: "Medios",
    total: filasFiltradas.filter((item) => item.criticidad === "MEDIO").length,
    color: "#3b82f6",
  },
  {
    label: "Bajos",
    total: filasFiltradas.filter((item) => item.criticidad === "BAJO").length,
    color: "#22c55e",
  },
];

const totalCriticidad = criticidadResumen.reduce(
  (sum, item) => sum + item.total,
  0
);
const fechaBaseEvolucion =
  filasFiltradas.length > 0
    ? new Date(
        Math.max(...filasFiltradas.map((item) => new Date(item.fechaISO).getTime()))
      )
    : fechaBase;

const evolucionDiaria = Array.from({ length: 7 }, (_, index) => {
  const fecha = new Date(fechaBaseEvolucion);
  fecha.setDate(fecha.getDate() - (6 - index));
  fecha.setHours(0, 0, 0, 0);

  const finDia = new Date(fecha);
  finDia.setHours(23, 59, 59, 999);

  const total = filasFiltradas.filter((item) => {
    const actual = new Date(item.fechaISO);
    return actual >= fecha && actual <= finDia;
  }).length;

  const etiqueta = fecha
    .toLocaleDateString("es-CL", { weekday: "short" })
    .replace(".", "");

  return {
    etiqueta: etiqueta.charAt(0).toUpperCase() + etiqueta.slice(1),
    total,
  };
});
const estadoReportesResumen = [
  {
    label: "Abiertos",
    total: filasFiltradas.filter((item) => item.estado === "ABIERTO").length,
    color: "#f59e0b",
  },
  {
    label: "En seguimiento",
    total: filasFiltradas.filter((item) => item.estado === "EN SEGUIMIENTO").length,
    color: "#3b82f6",
  },
  {
    label: "Cerrados",
    total: filasFiltradas.filter((item) => item.estado === "CERRADO").length,
    color: "#22c55e",
  },
];

const totalEstadoReportes = estadoReportesResumen.reduce(
  (sum, item) => sum + item.total,
  0
);
const descargarPDFHallazgoActivo = async () => {
  const escapeHtml = (valor: unknown) =>
    String(valor ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const h = hallazgoActivo;

  const html = `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>${escapeHtml(h.codigo)}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 32px;
            color: #111827;
            background: white;
          }
          .wrap {
            max-width: 900px;
            margin: 0 auto;
          }
          h1 {
            font-size: 24px;
            margin: 0 0 8px;
          }
          .sub {
            color: #4b5563;
            margin-bottom: 24px;
          }
          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px 20px;
          }
          .label {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 4px;
          }
          .value {
            font-size: 14px;
            font-weight: 700;
          }
          .card {
            border: 1px solid #d1d5db;
            border-radius: 12px;
            padding: 14px;
            margin-top: 14px;
          }
          .text {
            white-space: pre-wrap;
            line-height: 1.5;
            font-size: 14px;
          }
          .chip {
  display: inline-block;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid #d1d5db;
  font-size: 12px;
  font-weight: 700;
}

@page {
  size: Letter;
  margin: 16mm;
}

.page {
  width: min(216mm, calc(100vw - 64px));
  min-height: 279mm;
  margin: 0 auto;
  padding: 16mm;
  background: #ffffff;
  box-sizing: border-box;
}

.wrap {
  max-width: 100%;
  margin: 0 auto;
}

@media screen {
  body {
    margin: 0;
    padding: 32px 0 64px;
    background: #e5e7eb;
  }

  .page {
    border: 1px solid #d1d5db;
    box-shadow: 0 2px 10px rgba(15, 23, 42, 0.08);
    border-radius: 4px;
  }
}

@media print {
  body {
    margin: 0;
    padding: 0;
    background: #ffffff;
  }

  .page {
    width: auto;
    min-height: auto;
    margin: 0;
    padding: 0;
    border: none;
    box-shadow: none;
    border-radius: 0;
  }
}
        </style>
      </head>
      <body>
      <div class="page">
        <div class="wrap">
          <h1>Informe Ejecutivo de Hallazgo</h1>
          <div class="sub">Criterio Estratégico</div>

          <div class="grid">
            <div>
              <div class="label">Código</div>
              <div class="value">${escapeHtml(h.codigo)}</div>
            </div>
            <div>
              <div class="label">Fecha / Hora</div>
              <div class="value">${escapeHtml(h.fechaHora)}</div>
            </div>
            <div>
              <div class="label">Empresa</div>
              <div class="value">${escapeHtml(h.empresa)}</div>
            </div>
            <div>
              <div class="label">Estado</div>
              <div class="value">${escapeHtml(h.estado)}</div>
            </div>
            <div>
              <div class="label">Reportante</div>
              <div class="value">${escapeHtml(h.reportante)}</div>
            </div>
            <div>
              <div class="label">Cargo</div>
              <div class="value">${escapeHtml(h.cargo)}</div>
            </div>
            <div>
              <div class="label">Teléfono</div>
              <div class="value">${escapeHtml(h.telefono)}</div>
            </div>
            <div>
              <div class="label">Tipo de hallazgo</div>
              <div class="value">${escapeHtml(h.tipoHallazgo)}</div>
            </div>
            <div>
              <div class="label">Criticidad</div>
              <div class="chip">${escapeHtml(h.criticidad)}</div>
            </div>
          </div>

         <div class="card">
  <div class="label">Descripción</div>
  <div class="text">${escapeHtml(h.descripcion)}</div>
</div>

${
  h.fotos && h.fotos.length > 0
    ? `
      <div style="margin-top:16px; display:flex; gap:12px; flex-wrap:wrap; align-items:flex-start;">
        ${h.fotos.slice(0, 3).map((foto) => `
          <div
            style="
              width:190px;
              height:190px;
              border:1px solid #d1d5db;
              border-radius:10px;
              padding:6px;
              background:#f9fafb;
              box-sizing:border-box;
              overflow:hidden;
              flex:0 0 auto;
            "
          >
            <img
              src="${escapeHtml(foto)}"
              alt="Evidencia fotográfica"
              style="
                width:100%;
                height:100%;
                object-fit:cover;
                border-radius:8px;
                display:block;
              "
            />
          </div>
        `).join("")}
      </div>
    `
    : `
      <div class="text" style="color:#6b7280;">Sin evidencia fotográfica adjunta.</div>
    `
}
</div>

<div class="card">
  <div class="label">Medida inmediata</div>
  <div class="text">${escapeHtml(h.medidaInmediata)}</div>
</div>
        </div>
        </div>
      </body>
    </html>
  `;

  const nombreArchivo = `${String(h.codigo || "hallazgo").replace(/[^\w-]+/g, "-")}.pdf`;

const parser = new DOMParser();
const docPdf = parser.parseFromString(html, "text/html");
const estilos = docPdf.querySelector("style")?.innerHTML || "";
const contenido = docPdf.body.innerHTML;

const contenedor = document.createElement("div");
contenedor.style.position = "fixed";
contenedor.style.left = "-99999px";
contenedor.style.top = "0";
contenedor.style.zIndex = "-1";
contenedor.style.background = "#ffffff";
contenedor.innerHTML = `<style>${estilos}</style>${contenido}`;
document.body.appendChild(contenedor);

const elementoPdf = contenedor.querySelector(".page") as HTMLElement | null;
if (!elementoPdf) {
  document.body.removeChild(contenedor);
  return;
}

// @ts-expect-error html2pdf.js no trae tipos en este proyecto
const html2pdf = (await import("html2pdf.js")).default;

try {
  await html2pdf()
    .set({
      margin: 0,
      filename: nombreArchivo,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      },
      jsPDF: {
        unit: "mm",
        format: "letter",
        orientation: "portrait",
      },
      pagebreak: { mode: ["css", "legacy"] },
    })
    .from(elementoPdf)
    .save();
} finally {
  document.body.removeChild(contenedor);
}
};
useEffect(() => {
  if (filasFiltradas.length === 0) {
    return;
  }

  const existeEnFiltro = filasFiltradas.some(
    (item) => item.id === hallazgoActivo.id
  );

  if (!existeEnFiltro) {
    setHallazgoActivo(filasFiltradas[0]);
  }
}, [filasFiltradas, hallazgoActivo]);
const kpis = [
  {
    titulo: "Total reportes",
    valor: String(filasFiltradas.length),
    color: "#3b82f6",
  },
  {
    titulo: "Abiertos",
    valor: String(
      filasFiltradas.filter((item) => item.estado === "ABIERTO").length
    ),
    color: "#f59e0b",
  },
  {
    titulo: "Cerrados",
    valor: String(
      filasFiltradas.filter((item) => item.estado === "CERRADO").length
    ),
    color: "#22c55e",
  },
  {
    titulo: "Críticos",
    valor: String(
      filasFiltradas.filter((item) => item.criticidad === "CRÍTICO").length
    ),
    color: "#ef4444",
  },
  {
    titulo: "Vencidos",
    valor: String(
  filasFiltradas.filter(
    (item) =>
      semaforoVencimiento(item.fechaCompromiso, item.estado).etiqueta === "VENCIDO"
  ).length
),
    color: "#b91c1c",
  },
  {
    titulo: "Empresas activas",
    valor: String(new Set(filasFiltradas.map((item) => item.empresa)).size),
    color: "#8b5cf6",
  },
  {
  titulo: "Histórico total",
  valor: String(totalHistoricoHallazgos),
  color: "#ef4444",
},
];

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #071426 0%, #0a1b34 45%, #07172b 100%)",
        color: "white",
        fontFamily: "Arial, sans-serif",
        padding: "18px",
      }}
    >
      <div
        style={{
          maxWidth: "1720px",
          margin: "0 auto",
        }}
      >
       <header
  style={{
    ...panelCardStyle,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "18px",
    padding: "18px 22px",
    marginBottom: "18px",
  }}
>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "14px",
    }}
  >
    <div
      style={{
        width: "58px",
        height: "58px",
        borderRadius: "16px",
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.10)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 8px 20px rgba(0,0,0,0.18)",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "12px",
          background: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <img
          src="/logo.png"
          alt="Criterio Estratégico"
          style={{
            width: "36px",
            height: "36px",
            objectFit: "contain",
            display: "block",
          }}
        />
      </div>
    </div>

    <div>
      <div
        style={{
          fontSize: "12px",
          opacity: 0.75,
          letterSpacing: "1px",
          textTransform: "uppercase",
          marginBottom: "6px",
          fontWeight: 700,
        }}
      >
        Criterio Estratégico
      </div>

      <div
        style={{
          fontSize: "30px",
          fontWeight: 900,
          lineHeight: 1.08,
        }}
      >
        Plataforma Ejecutiva de Hallazgos
      </div>
    </div>
  </div>

  <div
    style={{
      textAlign: "right",
      fontSize: "13px",
      opacity: 0.9,
      lineHeight: 1.5,
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      gap: "2px",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "12px",
        fontWeight: 800,
        color: "#bbf7d0",
        marginBottom: "2px",
      }}
    >
      <span
        style={{
          width: "10px",
          height: "10px",
          borderRadius: "999px",
          background: "#67ef48",
          display: "inline-block",
          boxShadow: "0 0 10px rgba(103,239,72,0.65)",
        }}
      />
      <span>Sistema activo</span>
    </div>

    <div>Sistema inteligente de reportes</div>

    <div>
      Vista activa:{" "}
      {filtroRapido === "HOY"
        ? "Hoy"
        : filtroRapido === "SEMANA"
        ? "Esta semana"
        : filtroRapido === "MES"
        ? "Este mes"
        : "Personalizado"}
    </div>

   <div>Última actualización: {ultimaActualizacion}</div>
  </div>
</header>

{filtrosActivos.length > 0 && (
  <div
    style={{
      ...panelCardStyle,
      padding: "12px 16px",
      marginBottom: "18px",
      display: "flex",
      flexWrap: "wrap",
      gap: "8px",
      alignItems: "center",
    }}
  >
    <div
      style={{
        fontSize: "12px",
        fontWeight: 800,
        opacity: 0.78,
        marginRight: "4px",
      }}
    >
      Filtros activos:
    </div>

   {filtrosActivos.map((filtro) => (
  <button
    key={filtro}
    onClick={() => quitarFiltro(filtro)}
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: "7px 11px",
      borderRadius: "999px",
      background: "rgba(59,130,246,0.16)",
      border: "1px solid rgba(59,130,246,0.28)",
      color: "#dbeafe",
      fontSize: "12px",
      fontWeight: 700,
      lineHeight: 1,
      cursor: "pointer",
    }}
  >
    <span>{filtro}</span>
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "16px",
        height: "16px",
        borderRadius: "999px",
        background: "rgba(255,255,255,0.14)",
        fontSize: "11px",
        fontWeight: 900,
      }}
    >
      ×
    </span>
  </button>
))}
  </div>
)}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "240px minmax(0, 1fr) 300px",
            gap: "18px",
            alignItems: "stretch",
          }}
        >
         <aside
  style={{
    ...panelCardStyle,
    padding: "16px",
    minHeight: "760px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  }}
>
<div
  style={{
    padding: "20px",
    minHeight: "220px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
  }}
>
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    }}
  >
    <div
      style={{
        display: "grid",
        gap: "6px",
      }}
    >
      <div
        style={{
          fontSize: "14px",
          fontWeight: 800,
          lineHeight: 1.15,
          whiteSpace: "normal",
        }}
      >
        {usuario.nombre}
      </div>

      <div
        style={{
          fontSize: "11px",
          opacity: 0.78,
          lineHeight: 1.2,
          whiteSpace: "normal",
        }}
      >
        {usuario.cargo}
      </div>
    </div>

    <div
      style={{
  display: "grid",
  gridTemplateColumns: "76px 76px",
  justifyContent: "center",
  gap: "14px",
  alignItems: "center",
}}
    >
      <div
        style={{
          width: "84px",
          height: "84px",
          borderRadius: "16px",
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          flexShrink: 0,
          boxShadow: "0 8px 20px rgba(0,0,0,0.22)",
        }}
      >
        {usuario.foto ? (
          <img
            src={usuario.foto}
            alt={usuario.nombre}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <span
            style={{
              fontSize: "30px",
              fontWeight: 900,
              color: "#f8fafc",
              lineHeight: 1,
            }}
          >
            {inicialUsuario}
          </span>
        )}
      </div>

      <button
  type="button"
  onClick={() => setMostrarNotificaciones((prev) => !prev)}
  style={{
    position: "relative",
    width: "76px",
    height: "76px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: 0,
    flexShrink: 0,
    boxShadow: "0 8px 20px rgba(0,0,0,0.22)",
  }}
>
  <svg
    width="30"
    height="30"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15 17H9M18 17V11C18 8.23858 15.7614 6 13 6H11C8.23858 6 6 8.23858 6 11V17L4 19V20H20V19L18 17ZM13.73 20C13.5542 20.3031 13.3018 20.5542 12.9978 20.7285C12.6938 20.9028 12.3495 20.9942 12 20.9934C11.6505 20.9942 11.3062 20.9028 11.0022 20.7285C10.6982 20.5542 10.4458 20.3031 10.27 20"
      stroke="white"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>

  {totalNotificacionesNoLeidas > 0 && (
  <span
    style={{
      position: "absolute",
      top: "-10px",
      right: "-10px",
      minWidth: "40px",
      height: "40px",
      padding: "0 10px",
      borderRadius: "999px",
      background: "#ff4d4f",
      color: "white",
      fontSize: "18px",
      fontWeight: 800,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "2px solid #1a2742",
      boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
    }}
  >
    {totalNotificacionesNoLeidas}
  </span>
)}
</button>
    </div>

    <button
      type="button"
      onClick={() => setMostrarEditorPerfil((prev) => !prev)}
      style={{
        width: "100%",
        padding: "12px 16px",
        borderRadius: "14px",
        border: "1px solid #2f6bff",
        background: "linear-gradient(180deg, #2f80ff 0%, #1d5eff 100%)",
        color: "white",
        fontSize: "13px",
        fontWeight: 800,
        cursor: "pointer",
        boxShadow: "0 8px 18px rgba(29,94,255,0.35)",
      }}
    >
      Editar perfil
    </button>

    {mostrarNotificaciones && (
      <div
        style={{
          padding: "12px",
          borderRadius: "16px",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.10)",
          display: "grid",
          gap: "10px",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            fontWeight: 800,
          }}
        >
          Notificaciones
        </div>

        {notificaciones.length === 0 ? (
          <div
            style={{
              fontSize: "12px",
              opacity: 0.72,
            }}
          >
            Sin notificaciones por ahora
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gap: "10px",
            }}
          >
            {notificaciones.map((item: any, index: number) => (
              <button
                key={index}
                type="button"
                style={{
                  padding: "12px",
                  borderRadius: "14px",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  display: "grid",
                  gap: "6px",
                  cursor: "pointer",
                  appearance: "none",
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                  color: "white",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    lineHeight: 1.3,
                  }}
                >
                  {item.mensaje}
                </div>

                <div
                  style={{
                    fontSize: "11px",
                    opacity: 0.68,
                  }}
                >
                  {item.fechaHora}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    )}
  </div>
</div>
     <div
  style={{
    fontSize: "15px",
    fontWeight: 800,
    marginBottom: "12px",
  }}
>
  Reportes rápidos
</div>

   <div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
  }}
>
  {[
    { label: "Hoy", value: "HOY" as const },
    { label: "Esta semana", value: "SEMANA" as const },
    { label: "Este mes", value: "MES" as const },
    { label: "Personalizado", value: "PERSONALIZADO" as const },
  ].map((item) => {
    const activo = filtroRapido === item.value;

    return (
      <button
        key={item.value}
       onClick={() => aplicarFiltroRapido(item.value)}
       
style={{
  minHeight: "72px",
  padding: "12px 10px",
  borderRadius: "16px",
  border: activo
    ? "1px solid rgba(103,239,72,0.40)"
    : "1px solid rgba(255,255,255,0.10)",
  background: activo
    ? "linear-gradient(180deg, rgba(103,239,72,0.18) 0%, rgba(215,255,57,0.10) 100%)"
    : "rgba(255,255,255,0.08)",
  color: "white",
  fontSize: "12px",
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: activo ? "0 8px 18px rgba(109,255,72,0.14)" : "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
}}
      >
        {item.label}
      </button>
    );
  })}
</div>

  <div
    style={{
      flex: 1,
      padding: "14px",
      borderRadius: "18px",
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.10)",
      display: "flex",
      flexDirection: "column",
    }}
  >
    <div
      style={{
        fontSize: "15px",
        fontWeight: 800,
        marginBottom: "12px",
      }}
    >
      Filtros
    </div>

    {[
      "Empresa",
      "Obra / Proyecto",
      "Fecha desde",
      "Fecha hasta",
      "Estado",
      "Criticidad",
      "Tipo de hallazgo",
   ].map((label) => (
  <div key={label}>
    <div
      style={{
        fontSize: "11px",
        opacity: 0.7,
        marginBottom: "6px",
        fontWeight: 700,
      }}
    >
      {label}
    </div>

   {label === "Empresa" ? (
  <select
    value={filtroEmpresa}
    onChange={(e) => setFiltroEmpresa(e.target.value)}
    style={{
      width: "100%",
      padding: "11px 12px",
      borderRadius: "13px",
      border: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(255,255,255,0.08)",
      color: "white",
      fontSize: "13px",
      fontWeight: 700,
      outline: "none",
      appearance: "none",
      WebkitAppearance: "none",
      MozAppearance: "none",
      cursor: "pointer",
    }}
  >
    {opcionesEmpresa.map((empresa) => (
      <option
        key={empresa}
        value={empresa}
        style={{ color: "#0f172a" }}
      >
        {empresa}
      </option>
    ))}
  </select>
) : label === "Obra / Proyecto" ? (
  <select
    value={filtroObra}
    onChange={(e) => setFiltroObra(e.target.value)}
    style={{
      width: "100%",
      padding: "11px 12px",
      borderRadius: "13px",
      border: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(255,255,255,0.08)",
      color: "white",
      fontSize: "13px",
      fontWeight: 700,
      outline: "none",
      appearance: "none",
      WebkitAppearance: "none",
      MozAppearance: "none",
      cursor: "pointer",
    }}
  >
    {opcionesObra.map((obra) => (
      <option
        key={obra}
        value={obra}
        style={{ color: "#0f172a" }}
      >
        {obra}
      </option>
    ))}
  </select>
) : label === "Estado" ? (
  <select
    value={filtroEstado}
    onChange={(e) => setFiltroEstado(e.target.value)}
    style={{
      width: "100%",
      padding: "11px 12px",
      borderRadius: "13px",
      border: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(255,255,255,0.08)",
      color: "white",
      fontSize: "13px",
      fontWeight: 700,
      outline: "none",
      appearance: "none",
      WebkitAppearance: "none",
      MozAppearance: "none",
      cursor: "pointer",
    }}
  >
    {opcionesEstado.map((estado) => (
      <option
        key={estado}
        value={estado}
        style={{ color: "#0f172a" }}
      >
        {estado}
      </option>
    ))}
  </select>
) : label === "Fecha desde" ? (
  <input
    type="date"
    value={filtroFechaDesde}
   onChange={(e) => {
  setFiltroRapido("PERSONALIZADO");
  setFiltroFechaDesde(e.target.value);
}}
    style={{
      width: "100%",
      padding: "11px 12px",
      borderRadius: "13px",
      border: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(255,255,255,0.08)",
      color: "white",
      fontSize: "13px",
      fontWeight: 700,
      outline: "none",
      colorScheme: "dark",
    }}
  />
) : label === "Fecha hasta" ? (
  <input
    type="date"
    value={filtroFechaHasta}
   onChange={(e) => {
  setFiltroRapido("PERSONALIZADO");
  setFiltroFechaHasta(e.target.value);
}}
    style={{
      width: "100%",
      padding: "11px 12px",
      borderRadius: "13px",
      border: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(255,255,255,0.08)",
      color: "white",
      fontSize: "13px",
      fontWeight: 700,
      outline: "none",
      colorScheme: "dark",
    }}
  />
) : label === "Criticidad" ? (
  <select
    value={filtroCriticidad}
    onChange={(e) => setFiltroCriticidad(e.target.value)}
    style={{
      width: "100%",
      padding: "11px 12px",
      borderRadius: "13px",
      border: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(255,255,255,0.08)",
      color: "white",
      fontSize: "13px",
      fontWeight: 700,
      outline: "none",
      appearance: "none",
      WebkitAppearance: "none",
      MozAppearance: "none",
      cursor: "pointer",
    }}
  >
    {opcionesCriticidad.map((criticidad) => (
      <option
        key={criticidad}
        value={criticidad}
        style={{ color: "#0f172a" }}
      >
        {criticidad}
      </option>
    ))}
  </select>
) : label === "Tipo de hallazgo" ? (
  <select
    value={filtroTipoHallazgo}
    onChange={(e) => setFiltroTipoHallazgo(e.target.value)}
    style={{
      width: "100%",
      padding: "11px 12px",
      borderRadius: "13px",
      border: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(255,255,255,0.08)",
      color: "white",
      fontSize: "13px",
      fontWeight: 700,
      outline: "none",
      appearance: "none",
      WebkitAppearance: "none",
      MozAppearance: "none",
      cursor: "pointer",
    }}
  >
    {opcionesTipoHallazgo.map((tipo) => (
      <option
        key={tipo}
        value={tipo}
        style={{ color: "#0f172a" }}
      >
        {tipo}
      </option>
    ))}
  </select>
) : (
  <div
    style={{
      padding: "11px 12px",
      borderRadius: "13px",
      background: "rgba(255,255,255,0.08)",
      border: "1px solid rgba(255,255,255,0.10)",
      fontSize: "13px",
      color: "rgba(255,255,255,0.76)",
    }}
  >
    Seleccionar
  </div>
)}
  </div>
))}

    <button
    onClick={limpiarFiltros}
      style={{
        width: "100%",
        marginTop: "8px",
        padding: "13px",
        borderRadius: "14px",
        border: "none",
        cursor: "pointer",
        fontWeight: 800,
        fontSize: "14px",
        color: "#0b2b13",
        background: "linear-gradient(180deg, #67ef48 0%, #d7ff39 100%)",
        boxShadow: "0 10px 22px rgba(109,255,72,0.22)",
      }}
    >
      Limpiar filtros
    </button>
  </div>

  <div
    style={{
      padding: "14px",
      borderRadius: "18px",
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.10)",
    }}
  >
    <div
      style={{
        fontSize: "15px",
        fontWeight: 800,
        marginBottom: "12px",
      }}
    >
      Acceso rápido
    </div>

    <div style={{ display: "grid", gap: "8px" }}>
     {["Exportar a Excel", "Generar informe empresa/obra", "Configuración"].map((item) => (
     <button
  key={item}
  onClick={() => {
   if (item === "Exportar a Excel") {
  exportarExcel();
  return;
}

if (item === "Generar informe empresa/obra") {
  generarInformeEmpresaObra();
  return;
}

if (item === "Configuración") {
  if (vistaPrincipal === "configuracion") {
    setVistaPrincipal("panel");
    setVistaDerecha("informe");
  } else {
    setVistaPrincipal("configuracion");
    setVistaDerecha("configuracion");
  }
  return;
}
}}
style={{
    width: "100%",
    minHeight: "50px",
    padding: "14px 14px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.08)",
    color: "white",
    fontSize: "13px",
    fontWeight: 700,
    textAlign: "left",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  }}
>
  {item}
</button>
      ))}
    </div>
  </div>
</aside>
          <section
            style={{
              minHeight: "760px",
              display: vistaPrincipal === "configuracion" ? "none" : "grid",
              gridTemplateRows: "auto auto 1fr",
              gap: "18px",
            }}
          >
            <div
              style={{
                display: "grid",
               gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                gap: "12px",
              }}
            >
              {kpis.map((kpi) => (
                <div
                  key={kpi.titulo}
                  style={{
  ...panelCardStyle,
  padding: "14px 14px 16px 14px",
  minHeight: "94px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  borderLeft:
    kpi.titulo === "Histórico total" ? "4px solid #ef4444" : undefined,
}}
                >
                  <div
                    style={{
                      fontSize: "11px",
                      opacity: 0.74,
                      textTransform: "uppercase",
                      letterSpacing: "0.8px",
                      fontWeight: 800,
                      lineHeight: 1.2,
                    }}
                  >
                    {kpi.titulo}
                  </div>

                  <div
                    style={{
                      fontSize: "38px",
                      fontWeight: 900,
                      lineHeight: 1,
                      color: kpi.color,
                    }}
                  >
                   {kpi.titulo === "Histórico total"
  ? contadorHistoricoAnimado.toLocaleString("es-CL")
  : kpi.valor}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <div
                style={{
                  ...panelCardStyle,
                  padding: "16px",
                  minHeight: "152px",
                }}
              >
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 800,
                    marginBottom: "4px",
                  }}
                >
                  Reportes por empresa
                </div>

                <div
                  style={{
                    fontSize: "12px",
                    opacity: 0.7,
                    marginBottom: "12px",
                  }}
                >
                  Gráfico ejecutivo
                </div>
                <div
  style={{
    minHeight: "120px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.04)",
    border: "1px dashed rgba(255,255,255,0.12)",
    padding: "14px",
    display: "grid",
    gap: "10px",
  }}
>
  {reportesPorEmpresa.length === 0 ? (
    <div
      style={{
        fontSize: "13px",
        color: "rgba(255,255,255,0.72)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "90px",
        textAlign: "center",
      }}
    >
      Sin datos por empresa para el filtro activo.
    </div>
  ) : (
    reportesPorEmpresa.map((item) => {
      const maximo = Math.max(...reportesPorEmpresa.map((r) => r.total));
      const ancho = maximo > 0 ? `${(item.total / maximo) * 100}%` : "0%";

      return (
        <div key={item.empresa}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "6px",
              fontSize: "12px",
              fontWeight: 700,
            }}
          >
            <span>{item.empresa}</span>
            <span>{item.total}</span>
          </div>

          <div
            style={{
              height: "10px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.08)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: ancho,
                height: "100%",
                borderRadius: "999px",
                background:
                  "linear-gradient(90deg, rgba(59,130,246,0.95) 0%, rgba(103,239,72,0.85) 100%)",
              }}
            />
          </div>
        </div>
      );
    })
  )}
</div>

               <div
  style={{
    minHeight: "110px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.04)",
    border: "1px dashed rgba(255,255,255,0.12)",
    padding: "14px 12px 10px",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: "10px",
  }}
>
  {evolucionDiaria.length === 0 ? (
    <div
      style={{
        width: "100%",
        textAlign: "center",
        fontSize: "13px",
        color: "rgba(255,255,255,0.72)",
      }}
    >
      Sin evolución diaria para el filtro activo.
    </div>
  ) : (
    evolucionDiaria.map((item) => {
      const maximo = Math.max(...evolucionDiaria.map((d) => d.total), 1);
      const altura = `${Math.max((item.total / maximo) * 72, item.total > 0 ? 16 : 6)}px`;

      return (
        <div
          key={item.etiqueta}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "8px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: 800,
              color: "rgba(255,255,255,0.82)",
              lineHeight: 1,
            }}
          >
            {item.total}
          </div>

          <div
            style={{
              width: "100%",
              maxWidth: "28px",
              height: altura,
              borderRadius: "999px 999px 10px 10px",
              background:
                "linear-gradient(180deg, rgba(59,130,246,0.95) 0%, rgba(103,239,72,0.88) 100%)",
              boxShadow: "0 8px 18px rgba(59,130,246,0.18)",
            }}
          />

          <div
            style={{
              fontSize: "11px",
              fontWeight: 700,
              opacity: 0.72,
              lineHeight: 1,
            }}
          >
            {item.etiqueta}
          </div>
        </div>
      );
    })
  )}
</div>
              </div>

              <div
                style={{
                  ...panelCardStyle,
                  padding: "16px",
                  minHeight: "152px",
                }}
              >
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 800,
                    marginBottom: "4px",
                  }}
                >
                  Estado general
                </div>

                <div
                  style={{
                    fontSize: "12px",
                    opacity: 0.7,
                    marginBottom: "12px",
                  }}
                >
                  Distribución de abiertos, cerrados y críticos
                </div>

<div
  style={{
    minHeight: "240px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.04)",
    border: "1px dashed rgba(255,255,255,0.12)",
    padding: "14px",
    display: "grid",
    gap: "14px",
  }}
>
  {totalCriticidad === 0 ? (
    <div
      style={{
        fontSize: "13px",
        color: "rgba(255,255,255,0.72)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "90px",
        textAlign: "center",
      }}
    >
      Sin datos para criticidad en el filtro activo.
    </div>
  ) : (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "130px 1fr",
        gap: "16px",
        alignItems: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "120px",
          height: "120px",
          borderRadius: "999px",
          background: (() => {
            const crit = criticidadResumen[0].total;
            const alto = criticidadResumen[1].total;
            const medio = criticidadResumen[2].total;
            const bajo = criticidadResumen[3].total;
            const total = Math.max(totalCriticidad, 1);

            const a1 = (crit / total) * 360;
            const a2 = a1 + (alto / total) * 360;
            const a3 = a2 + (medio / total) * 360;
            const a4 = a3 + (bajo / total) * 360;

            return `conic-gradient(
              #ef4444 0deg ${a1}deg,
              #f59e0b ${a1}deg ${a2}deg,
              #3b82f6 ${a2}deg ${a3}deg,
              #22c55e ${a3}deg ${a4}deg
            )`;
          })(),
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "18px",
            borderRadius: "999px",
            background: "rgba(8,22,53,0.94)",
            border: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              fontSize: "28px",
              fontWeight: 900,
              lineHeight: 1,
            }}
          >
            {totalCriticidad}
          </div>
          <div
            style={{
              fontSize: "11px",
              opacity: 0.72,
              marginTop: "4px",
              fontWeight: 700,
            }}
          >
            Total
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gap: "10px" }}>
        {criticidadResumen.map((item) => {
          const porcentaje =
            totalCriticidad > 0
              ? ((item.total / totalCriticidad) * 100).toFixed(1)
              : "0.0";

          return (
            <div
              key={item.label}
              style={{
                display: "grid",
                gridTemplateColumns: "14px 1fr auto auto",
                gap: "10px",
                alignItems: "center",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "999px",
                  background: item.color,
                  display: "inline-block",
                }}
              />
              <span>{item.label}</span>
              <span style={{ opacity: 0.8 }}>{item.total}</span>
              <span
                style={{
                  opacity: 0.72,
                  minWidth: "46px",
                  textAlign: "right",
                }}
              >
                {porcentaje}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  )}

  <div
    style={{
      height: "1px",
      background: "rgba(255,255,255,0.08)",
    }}
  />

  <div>
    <div
      style={{
        fontSize: "11px",
        opacity: 0.72,
        marginBottom: "10px",
        fontWeight: 700,
      }}
    >
      Estado de reportes
    </div>

    {totalEstadoReportes === 0 ? (
      <div
        style={{
          fontSize: "13px",
          color: "rgba(255,255,255,0.72)",
          textAlign: "center",
          padding: "10px 0 4px",
        }}
      >
        Sin datos de gestión para el filtro activo.
      </div>
    ) : (
      <div style={{ display: "grid", gap: "10px" }}>
        {estadoReportesResumen.map((item) => {
          const porcentaje =
            totalEstadoReportes > 0
              ? ((item.total / totalEstadoReportes) * 100).toFixed(1)
              : "0.0";

          return (
            <div key={item.label}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "6px",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                <span>{item.label}</span>
                <span>
                  {item.total} · {porcentaje}%
                </span>
              </div>

              <div
                style={{
                  height: "10px",
                  borderRadius: "999px",
                  background: "rgba(255,255,255,0.08)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${totalEstadoReportes > 0 ? (item.total / totalEstadoReportes) * 100 : 0}%`,
                    height: "100%",
                    borderRadius: "999px",
                    background: item.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
</div>
              </div>
            </div>

            <div
              style={{
                ...panelCardStyle,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                minHeight: "0",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1.45fr 1.2fr 1.45fr 0.9fr 1.05fr 1.25fr 0.9fr",
                  gap: "10px",
                  padding: "14px 16px",
                  background: "rgba(255,255,255,0.05)",
                  fontSize: "11px",
                  fontWeight: 800,
                  letterSpacing: "0.7px",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.74)",
                }}
              >
                <div>Código</div>
                <div>Empresa</div>
                <div>Tipo de hallazgo</div>
                <div>Criticidad</div>
                <div>Estado</div>
                <div>Fecha / Hora</div>
                <div>Acción</div>
              </div>

             {filasFiltradas.length === 0 ? (
  <div
    style={{
      padding: "28px 16px",
      textAlign: "center",
      fontSize: "14px",
      color: "rgba(255,255,255,0.72)",
      borderTop: "1px solid rgba(255,255,255,0.08)",
    }}
  >
    No hay hallazgos para el filtro seleccionado.
  </div>
) : (
  filasFiltradas.map((fila) => {
    const chip = chipColor(fila.criticidad);

    return (
      <div
        key={fila.codigo}
        style={{
          display: "grid",
          gridTemplateColumns:
            "1.45fr 1.2fr 1.45fr 0.9fr 1.05fr 1.25fr 0.9fr",
          gap: "10px",
          padding: "16px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          alignItems: "center",
          fontSize: "13px",
        }}
      >
        <div style={{ fontWeight: 800 }}>{fila.codigo}</div>
        <div>{fila.empresa}</div>
        <div>{fila.tipoHallazgo}</div>

        <div>
          <span
            style={{
              display: "inline-block",
              padding: "6px 10px",
              borderRadius: "999px",
              background: chip.fondo,
              border: chip.borde,
              color: chip.texto,
              fontWeight: 800,
              fontSize: "11px",
              lineHeight: 1,
            }}
          >
            {fila.criticidad}
          </span>
        </div>

       <div
  style={{
    display: "grid",
    gap: "6px",
  }}
>
  <div style={{ fontWeight: 700 }}>{fila.estado}</div>

  <span
    style={{
      display: "inline-block",
      width: "fit-content",
      padding: "4px 8px",
      borderRadius: "999px",
      background: semaforoVencimiento(fila.fechaCompromiso, fila.estado).fondo,
      border: semaforoVencimiento(fila.fechaCompromiso, fila.estado).borde,
      color: semaforoVencimiento(fila.fechaCompromiso, fila.estado).texto,
      fontSize: "11px",
      fontWeight: 800,
      lineHeight: 1,
    }}
  >
    {semaforoVencimiento(fila.fechaCompromiso, fila.estado).etiqueta}
  </span>
</div>
        <div>{fila.fechaHora}</div>

        <div>
          <button
            onClick={() => {
  setHallazgoActivo(fila);
  setVistaDerecha("informe");
}}
            style={{
              width: "100%",
              padding: "10px 10px",
              borderRadius: "12px",
              border: "none",
              cursor: "pointer",
              fontWeight: 800,
              fontSize: "12px",
              background: "rgba(59,130,246,0.18)",
              color: "#bfdbfe",
            }}
          >
            Ver informe
          </button>
        </div>
      </div>
    );
  })
)}
            </div>
          </section>

          <aside
            style={{
              ...panelCardStyle,
              padding: vistaPrincipal === "configuracion" ? "24px" : "16px",
              minHeight: "760px",
              display: "flex",
              flexDirection: "column",
              gridColumn: vistaPrincipal === "configuracion" ? "2 / 4" : "auto",
            }}
            >
 {vistaDerecha === "configuracion" ? null : (
  <div
    style={{
      fontSize: "16px",
      fontWeight: 800,
      marginBottom: "12px",
    }}
  >
    Informe Ejecutivo
  </div>
)}

{vistaDerecha === "configuracion" && (
  <div
    style={{
      display: "grid",
      gap: "16px",
      marginBottom: "12px",
    }}
  >
    <div
      style={{
        ...panelCardStyle,
        padding: "20px 22px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "16px",
      }}
    >
      <div>
        <div
          style={{
            fontSize: "24px",
            fontWeight: 900,
            color: "white",
            marginBottom: "6px",
          }}
        >
          Configuración del sistema
        </div>

        <div
          style={{
            fontSize: "13px",
            color: "rgba(255,255,255,0.72)",
            lineHeight: 1.5,
          }}
        >
          Administra identidad corporativa, apariencia y parámetros generales de la plataforma.
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          justifyContent: "flex-end",
        }}
      >
        <button
          onClick={() => {
            setVistaPrincipal("panel");
            setVistaDerecha("informe");
          }}
         style={{
  padding: "12px 18px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.16)",
  background: "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
  color: "white",
  fontSize: "13px",
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 8px 18px rgba(0,0,0,0.14)",
}}
        >
          Volver al panel
        </button>

        <button
          style={{
  padding: "12px 18px",
  borderRadius: "14px",
  border: "1px solid rgba(132,204,22,0.24)",
  background: "linear-gradient(135deg, #84cc16, #22c55e)",
  color: "#052e16",
  fontSize: "13px",
  fontWeight: 900,
  cursor: "pointer",
  boxShadow: "0 10px 22px rgba(132,204,22,0.24)",
}}
        >
          Guardar cambios
        </button>
      </div>
    </div>

   <div
  style={{
    ...panelCardStyle,
    padding: "20px",
  }}
>
  <div
    style={{
      fontSize: "16px",
      fontWeight: 800,
      color: "white",
      marginBottom: "14px",
    }}
  >
    Identidad de empresa
  </div>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "140px 1fr",
      gap: "18px",
      alignItems: "stretch",
    }}
  >
    <div
  style={{
    minHeight: "140px",
    borderRadius: "18px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    color: "rgba(255,255,255,0.78)",
    fontSize: "13px",
    fontWeight: 700,
    padding: "14px",
    gap: "8px",
  }}
>
  <div
    style={{
      width: "46px",
      height: "46px",
      borderRadius: "14px",
      border: "1px solid rgba(255,255,255,0.12)",
      background: "rgba(255,255,255,0.06)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "18px",
      color: "#dbeafe",
      boxShadow: "0 6px 14px rgba(0,0,0,0.14)",
    }}
  >
    ⬒
  </div>

  <div>Logo empresa</div>

  <div
    style={{
      fontSize: "11px",
      fontWeight: 600,
      opacity: 0.68,
      lineHeight: 1.4,
    }}
  >
    PNG, SVG o JPG
  </div>
</div>

    <div
      style={{
        display: "grid",
        gap: "12px",
      }}
    >
      <div>
        <div
          style={{
            fontSize: "11px",
            opacity: 0.72,
            marginBottom: "6px",
            fontWeight: 700,
            color: "white",
          }}
        >
          Nombre empresa
        </div>

        <div
          style={{
            minHeight: "46px",
            padding: "12px 14px",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.05)",
            color: "white",
            fontSize: "14px",
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
          }}
        >
          Cliente corporativo
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "10px",
        }}
      >
        <div
          style={{
            padding: "12px",
            minHeight: "74px",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.05)",
            color: "white",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              opacity: 0.72,
              marginBottom: "6px",
              fontWeight: 700,
            }}
          >
            Branding PC
          </div>
          <div style={{ fontSize: "13px", fontWeight: 800 }}>
            Activo
          </div>
        </div>

        <div
          style={{
            padding: "12px",
            minHeight: "74px",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.05)",
            color: "white",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              opacity: 0.72,
              marginBottom: "6px",
              fontWeight: 700,
            }}
          >
            Branding PDF
          </div>
          <div style={{ fontSize: "13px", fontWeight: 800 }}>
            Activo
          </div>
        </div>

        <div
          style={{
            padding: "12px",
            minHeight: "74px",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.05)",
            color: "white",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              opacity: 0.72,
              marginBottom: "6px",
              fontWeight: 700,
            }}
          >
            Exportaciones
          </div>
          <div style={{ fontSize: "13px", fontWeight: 800 }}>
            Incluidas
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
    <div
  style={{
    ...panelCardStyle,
    padding: "18px",
  }}
>
  <div
    style={{
      fontSize: "15px",
      fontWeight: 800,
      color: "white",
      marginBottom: "14px",
    }}
  >
    Apariencia del sistema
  </div>

  <div
    style={{
      fontSize: "12px",
      color: "rgba(255,255,255,0.72)",
      lineHeight: 1.5,
      marginBottom: "14px",
    }}
  >
    Define la presentación visual de la plataforma para operación diurna, nocturna o automática.
  </div>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: "12px",
    }}
  >
    <button
      style={{
        padding: "14px 12px",
        borderRadius: "14px",
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(255,255,255,0.05)",
        color: "white",
        fontSize: "13px",
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      Modo claro
    </button>

    <button
      onClick={() => setModoSistema("claro")}
      style={{
        padding: "14px 12px",
        borderRadius: "14px",
        border: "1px solid rgba(59,130,246,0.28)",
        background: "rgba(59,130,246,0.14)",
        color: "#dbeafe",
        fontSize: "13px",
        fontWeight: 800,
        cursor: "pointer",
      }}
    >
      Modo oscuro
    </button>

    <button
      onClick={() => setModoSistema("oscuro")}
      style={{
  padding: "14px 12px",
  borderRadius: "14px",
  border: "1px solid rgba(96,165,250,0.48)",
  background: "linear-gradient(135deg, rgba(59,130,246,0.22), rgba(37,99,235,0.18))",
  color: "#eff6ff",
  fontSize: "13px",
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 0 0 1px rgba(96,165,250,0.18), 0 10px 24px rgba(37,99,235,0.18)",
}}
    >
      Automático
    </button>
  </div>
</div>
<div
  onClick={() => setModoSistema("claro")}
  style={{
    ...panelCardStyle,
    padding: "18px",
  }}
>
  <div
    style={{
      fontSize: "15px",
      fontWeight: 800,
      color: "white",
      marginBottom: "14px",
    }}
  >
    Idioma del sistema
  </div>

  <div
    style={{
      fontSize: "12px",
      color: "rgba(255,255,255,0.72)",
      lineHeight: 1.5,
      marginBottom: "14px",
    }}
  >
    Define el idioma general de navegación, textos operativos e informes del sistema.
  </div>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: "12px",
    }}
  >
    <button
      style={{
  padding: "14px 12px",
  borderRadius: "14px",
  border: "1px solid rgba(96,165,250,0.48)",
  background: "linear-gradient(135deg, rgba(59,130,246,0.22), rgba(37,99,235,0.18))",
  color: "#eff6ff",
  fontSize: "13px",
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 0 0 1px rgba(96,165,250,0.18), 0 10px 24px rgba(37,99,235,0.18)",
}}
    >
      Español
    </button>

    <button
      style={{
        padding: "14px 12px",
        borderRadius: "14px",
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(255,255,255,0.05)",
        color: "white",
        fontSize: "13px",
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      English
    </button>

    <button
      style={{
        padding: "14px 12px",
        borderRadius: "14px",
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(255,255,255,0.05)",
        color: "white",
        fontSize: "13px",
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      Automático
    </button>
  </div>
</div>
<div
  style={{
    ...panelCardStyle,
    padding: "18px",
  }}
>
  <div
    style={{
      fontSize: "15px",
      fontWeight: 800,
      color: "white",
      marginBottom: "14px",
    }}
  >
    Informes PDF
  </div>

  <div
    style={{
      fontSize: "12px",
      color: "rgba(255,255,255,0.72)",
      lineHeight: 1.5,
      marginBottom: "14px",
    }}
  >
    Define cómo se presentan los documentos exportados y descargados desde la plataforma.
  </div>

 <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "12px",
  }}
>
  <div
    style={{
      padding: "16px",
      minHeight: "88px",
      borderRadius: "14px",
      border: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(255,255,255,0.05)",
      color: "white",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    }}
  >
    <div
      style={{
        fontSize: "11px",
        opacity: 0.72,
        marginBottom: "6px",
        fontWeight: 700,
      }}
    >
      Branding PDF
    </div>
    <div style={{ fontSize: "13px", fontWeight: 800 }}>
      Activado
    </div>
  </div>

  <div
    style={{
      padding: "16px",
      minHeight: "88px",
      borderRadius: "14px",
      border: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(255,255,255,0.05)",
      color: "white",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    }}
  >
    <div
      style={{
        fontSize: "11px",
        opacity: 0.72,
        marginBottom: "6px",
        fontWeight: 700,
      }}
    >
      Formato de salida
    </div>
    <div style={{ fontSize: "13px", fontWeight: 800 }}>
      Carta vertical
    </div>
  </div>

  <div
    style={{
      padding: "16px",
      minHeight: "88px",
      borderRadius: "14px",
      border: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(255,255,255,0.05)",
      color: "white",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    }}
  >
    <div
      style={{
        fontSize: "11px",
        opacity: 0.72,
        marginBottom: "6px",
        fontWeight: 700,
      }}
    >
      Logo de empresa
    </div>
    <div style={{ fontSize: "13px", fontWeight: 800 }}>
      Incluir en portada y encabezado
    </div>
  </div>

  <div
    style={{
      padding: "16px",
      minHeight: "88px",
      borderRadius: "14px",
      border: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(255,255,255,0.05)",
      color: "white",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    }}
  >
    <div
      style={{
        fontSize: "11px",
        opacity: 0.72,
        marginBottom: "6px",
        fontWeight: 700,
      }}
    >
      Pie institucional
    </div>
    <div style={{ fontSize: "13px", fontWeight: 800 }}>
      Emitido por Criterio Estratégico
    </div>
  </div>
</div>
</div>
<div
  style={{
    ...panelCardStyle,
    padding: "18px",
  }}
>
  <div
    style={{
      fontSize: "15px",
      fontWeight: 800,
      color: "white",
      marginBottom: "14px",
    }}
  >
    Usuarios y permisos
  </div>

  <div
    style={{
      fontSize: "12px",
      color: "rgba(255,255,255,0.72)",
      lineHeight: 1.5,
      marginBottom: "14px",
    }}
  >
    Define perfiles de acceso y alcance de visualización para administración, supervisión y clientes corporativos.
  </div>

  <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "12px",
  }}
>
  <div
    style={{
      padding: "16px",
      minHeight: "88px",
      borderRadius: "14px",
      border: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(255,255,255,0.05)",
      color: "white",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    }}
  >
    <div
      style={{
        fontSize: "11px",
        opacity: 0.72,
        marginBottom: "6px",
        fontWeight: 700,
      }}
    >
      Perfil administrador
    </div>
    <div style={{ fontSize: "13px", fontWeight: 800 }}>
      Acceso total al sistema
    </div>
  </div>

  <div
    style={{
      padding: "16px",
      minHeight: "88px",
      borderRadius: "14px",
      border: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(255,255,255,0.05)",
      color: "white",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    }}
  >
    <div
      style={{
        fontSize: "11px",
        opacity: 0.72,
        marginBottom: "6px",
        fontWeight: 700,
      }}
    >
      Perfil supervisor
    </div>
    <div style={{ fontSize: "13px", fontWeight: 800 }}>
      Reporte y seguimiento operativo
    </div>
  </div>

  <div
    style={{
      padding: "16px",
      minHeight: "88px",
      borderRadius: "14px",
      border: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(255,255,255,0.05)",
      color: "white",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    }}
  >
    <div
      style={{
        fontSize: "11px",
        opacity: 0.72,
        marginBottom: "6px",
        fontWeight: 700,
      }}
    >
      Cliente mandante
    </div>
    <div style={{ fontSize: "13px", fontWeight: 800 }}>
      Visualización ejecutiva y reportes
    </div>
  </div>

  <div
    style={{
      padding: "16px",
      minHeight: "88px",
      borderRadius: "14px",
      border: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(255,255,255,0.05)",
      color: "white",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    }}
  >
    <div
      style={{
        fontSize: "11px",
        opacity: 0.72,
        marginBottom: "6px",
        fontWeight: 700,
      }}
    >
      Alcance multiempresa
    </div>
    <div style={{ fontSize: "13px", fontWeight: 800 }}>
      Por empresa, obra o corporativo
    </div>
  </div>
</div>
</div>
  </div>
)}

{vistaDerecha === "configuracion" ? null : filasFiltradas.length === 0 ? (
  <div
    style={{
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      fontSize: "14px",
      color: "rgba(255,255,255,0.72)",
      padding: "24px",
      lineHeight: 1.5,
    }}
  >
    No hay informe disponible para el filtro seleccionado.
  </div>
) : (
  <>
    <div
      style={{
        padding: "12px",
        borderRadius: "14px",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.10)",
        marginBottom: "14px",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          opacity: 0.72,
          marginBottom: "4px",
          fontWeight: 700,
        }}
      >
        Código
      </div>
      <div style={{ fontWeight: 900, fontSize: "14px" }}>
        {hallazgoActivo.codigo}
      </div>
    </div>
<div style={{ marginBottom: "14px" }}>
  <div
    style={{
      fontSize: "11px",
      opacity: 0.72,
      marginBottom: "4px",
      fontWeight: 700,
    }}
  >
    Estado plazo
  </div>

  <div
    style={{
      display: "inline-block",
      padding: "6px 10px",
      borderRadius: "999px",
      background: semaforoVencimiento(
        hallazgoActivo.fechaCompromiso,
        hallazgoActivo.estado
      ).fondo,
      border: semaforoVencimiento(
        hallazgoActivo.fechaCompromiso,
        hallazgoActivo.estado
      ).borde,
      color: semaforoVencimiento(
        hallazgoActivo.fechaCompromiso,
        hallazgoActivo.estado
      ).texto,
      fontSize: "12px",
      fontWeight: 800,
    }}
  >
    {
      semaforoVencimiento(
        hallazgoActivo.fechaCompromiso,
        hallazgoActivo.estado
      ).etiqueta
    }
  </div>
</div>
    {[
      ["Empresa", hallazgoActivo.empresa],
      ["Reportante", hallazgoActivo.reportante],
      ["Cargo", hallazgoActivo.cargo],
      ["Teléfono", hallazgoActivo.telefono],
      ["Responsable", hallazgoActivo.responsable],
["Fecha compromiso", hallazgoActivo.fechaCompromiso || "Sin definir"],
["Fecha cierre", hallazgoActivo.fechaCierre || "Pendiente"],
["Evidencia cierre", hallazgoActivo.evidenciaCierre || "Sin evidencia de cierre"],
      ["Tipo", hallazgoActivo.tipoHallazgo],
      ["Criticidad", hallazgoActivo.criticidad],
      ["Fecha / Hora", hallazgoActivo.fechaHora],
    ].map(([titulo, valor]) => (
      <div key={titulo} style={{ marginBottom: "10px" }}>
        <div
          style={{
            fontSize: "11px",
            opacity: 0.7,
            marginBottom: "3px",
            fontWeight: 700,
          }}
        >
          {titulo}
        </div>
        <div
          style={{
            fontSize: "13px",
            fontWeight: 700,
            lineHeight: 1.35,
          }}
        >
          {valor}
        </div>
      </div>
    ))}

    <div style={{ marginTop: "10px", marginBottom: "12px" }}>
      <div
        style={{
          fontSize: "11px",
          opacity: 0.7,
          marginBottom: "4px",
          fontWeight: 700,
        }}
      >
        Descripción
      </div>

      <div
        style={{
          fontSize: "13px",
          lineHeight: 1.5,
          padding: "12px",
          borderRadius: "14px",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.10)",
        }}
      >
        {hallazgoActivo.descripcion}
      </div>
    </div>
<div style={{ marginBottom: "12px" }}>
  <div
    style={{
      fontSize: "11px",
      opacity: 0.7,
      marginBottom: "4px",
      fontWeight: 700,
    }}
  >
    Evidencia fotográfica
  </div>

  {hallazgoActivo.fotos && hallazgoActivo.fotos.length > 0 ? (
    <div
      style={{
        display: "flex",
        gap: "8px",
        flexWrap: "wrap",
      }}
    >
      {hallazgoActivo.fotos.slice(0, 3).map((foto, index) => (
        <img
          key={index}
          src={foto}
          alt={`Evidencia ${index + 1}`}
          style={{
            width: "78px",
            height: "78px",
            objectFit: "cover",
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.06)",
          }}
        />
      ))}
    </div>
  ) : (
    <div
      style={{
        fontSize: "13px",
        lineHeight: 1.4,
        opacity: 0.75,
      }}
    >
      Sin evidencia fotográfica
    </div>
  )}
</div>
    <div style={{ marginBottom: "12px" }}>
      <div
        style={{
          fontSize: "11px",
          opacity: 0.7,
          marginBottom: "4px",
          fontWeight: 700,
        }}
      >
        Medida inmediata
      </div>

      <div
        style={{
          fontSize: "13px",
          lineHeight: 1.5,
          padding: "12px",
          borderRadius: "14px",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.10)",
        }}
      >
        {hallazgoActivo.medidaInmediata}
      </div>
    </div>

    <button
    onClick={descargarPDFHallazgoActivo}
      style={{
        width: "100%",
        marginTop: "auto",
        padding: "14px",
        borderRadius: "14px",
        border: "none",
        cursor: "pointer",
        fontWeight: 800,
        background: "linear-gradient(180deg, #67ef48 0%, #d7ff39 100%)",
        color: "#0b2b13",
        boxShadow: "0 10px 22px rgba(109,255,72,0.22)",
      }}
    >
      Descargar PDF
    </button>
  </>
)}
          </aside>
        </div>
      </div>
    </main>
  );
}