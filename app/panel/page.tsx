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

const panelCardStyle: React.CSSProperties = {
  borderRadius: "22px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.10)",
  boxShadow: "0 12px 28px rgba(0,0,0,0.22)",
  backdropFilter: "blur(6px)",
};

export default function PanelEjecutivoPage() {
  const filas = hallazgosMock;
const totalHistoricoHallazgos = filas.length;
const [contadorHistoricoAnimado, setContadorHistoricoAnimado] = useState(0);
const [notificaciones, setNotificaciones] = useState(notificacionesMock);
const totalNotificacionesNoLeidas = notificaciones.filter((item) => !item.leida).length;

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
    valor: "0",
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
          padding: "11px 10px",
          borderRadius: "12px",
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
        }}
      >
        {item.label}
      </button>
    );
  })}
</div>

<div
  style={{
    marginTop: "10px",
    fontSize: "11px",
    opacity: 0.72,
    fontWeight: 700,
  }}
>
  Vista activa: {filtroRapido}
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
      {["Exportar a Excel", "Reporte en PDF", "Configuración"].map((item) => (
        <button
          key={item}
          style={{
            width: "100%",
            padding: "11px 12px",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.08)",
            color: "white",
            fontSize: "12px",
            fontWeight: 700,
            textAlign: "left",
            cursor: "pointer",
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
              display: "grid",
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

        <div style={{ fontWeight: 700 }}>{fila.estado}</div>
        <div>{fila.fechaHora}</div>

        <div>
          <button
            onClick={() => setHallazgoActivo(fila)}
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
              padding: "16px",
              minHeight: "760px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                fontSize: "16px",
                fontWeight: 800,
                marginBottom: "12px",
              }}
            >
              Informe Ejecutivo
            </div>
{filasFiltradas.length === 0 ? (
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

    {[
      ["Empresa", hallazgoActivo.empresa],
      ["Reportante", hallazgoActivo.reportante],
      ["Cargo", hallazgoActivo.cargo],
      ["Teléfono", hallazgoActivo.telefono],
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