"use client";
import { useEffect, useState } from "react";
import { hallazgosMock } from "./mockdata";

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
const [hallazgoActivo, setHallazgoActivo] = useState(filas[0]);
const [filtroRapido, setFiltroRapido] = useState<"HOY" | "SEMANA" | "MES" | "PERSONALIZADO">("HOY");
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

const filasFiltradas = filas.filter((item) => {
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
      padding: "14px",
      borderRadius: "18px",
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.10)",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "10px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          minWidth: 0,
        }}
      >
        <div
  style={{
    width: "46px",
    height: "46px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 8px 20px rgba(0,0,0,0.22)",
  }}
>
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20 21C20 18.7909 16.4183 17 12 17C7.58172 17 4 18.7909 4 21"
      stroke="white"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <circle
      cx="12"
      cy="8"
      r="4"
      stroke="white"
      strokeWidth="1.8"
    />
  </svg>
</div>

        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: "13px",
              fontWeight: 800,
              lineHeight: 1.2,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Freddy Camus
          </div>
          <div
            style={{
              fontSize: "11px",
              opacity: 0.72,
              marginTop: "3px",
              lineHeight: 1.2,
            }}
          >
            Administrador
          </div>
        </div>
      </div>

      <div
        style={{
          position: "relative",
          width: "40px",
          height: "40px",
          borderRadius: "12px",
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15 18H9M17 8C17 6.67392 16.4732 5.40215 15.5355 4.46447C14.5979 3.52678 13.3261 3 12 3C10.6739 3 9.40215 3.52678 8.46447 4.46447C7.52678 5.40215 7 6.67392 7 8V11.7639C7 12.5215 6.78511 13.2636 6.38013 13.9039L5.28986 15.6281C4.6684 16.6108 5.37495 17.8889 6.53814 17.8889H17.4619C18.6251 17.8889 19.3316 16.6108 18.7101 15.6281L17.6199 13.9039C17.2149 13.2636 17 12.5215 17 11.7639V8Z"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <div
          style={{
            position: "absolute",
            top: "-4px",
            right: "-4px",
            minWidth: "18px",
            height: "18px",
            padding: "0 5px",
            borderRadius: "999px",
            background: "#ef4444",
            color: "white",
            fontSize: "10px",
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 6px 14px rgba(239,68,68,0.35)",
          }}
        >
          7
        </div>
      </div>
    </div>
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
        onClick={() => setFiltroRapido(item.value)}
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
      <div key={label} style={{ marginBottom: "11px" }}>
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
      </div>
    ))}

    <button
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
                gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
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
                    {kpi.valor}
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