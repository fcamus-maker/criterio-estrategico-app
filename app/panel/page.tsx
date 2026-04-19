"use client";

const kpis = [
  { titulo: "Total Reportes", valor: "128", color: "#3b82f6" },
  { titulo: "Abiertos", valor: "42", color: "#f59e0b" },
  { titulo: "Cerrados", valor: "71", color: "#22c55e" },
  { titulo: "Críticos", valor: "9", color: "#ef4444" },
  { titulo: "Vencidos", valor: "6", color: "#b91c1c" },
  { titulo: "Empresas Activas", valor: "14", color: "#8b5cf6" },
];

const filas = [
  {
    codigo: "CE-PEPM-GB/00031",
    empresa: "Grúa Bustamante",
    tipo: "Condición subestándar",
    criticidad: "CRÍTICO",
    estado: "ABIERTO",
    fechaHora: "18-04-2026 · 14:32",
  },
  {
    codigo: "CE-PEPM-TN/00032",
    empresa: "TN",
    tipo: "Acto subestándar",
    criticidad: "ALTO",
    estado: "EN SEGUIMIENTO",
    fechaHora: "18-04-2026 · 14:40",
  },
  {
    codigo: "CE-PEPM-SM/00033",
    empresa: "Servicios Mineros",
    tipo: "Condición subestándar",
    criticidad: "MEDIO",
    estado: "CERRADO",
    fechaHora: "18-04-2026 · 14:57",
  },
  {
    codigo: "CE-PEPM-GB/00034",
    empresa: "Grúa Bustamante",
    tipo: "Condición subestándar",
    criticidad: "CRÍTICO",
    estado: "ABIERTO",
    fechaHora: "18-04-2026 · 15:05",
  },
];

function chipColor(tipo: string) {
  const valor = String(tipo).toUpperCase();

  if (valor.includes("CRÍT")) {
    return {
      fondo: "rgba(239,68,68,0.18)",
      borde: "1px solid rgba(239,68,68,0.35)",
      texto: "#fecaca",
    };
  }

  if (valor.includes("ALTO")) {
    return {
      fondo: "rgba(245,158,11,0.18)",
      borde: "1px solid rgba(245,158,11,0.35)",
      texto: "#fde68a",
    };
  }

  if (valor.includes("MED")) {
    return {
      fondo: "rgba(59,130,246,0.18)",
      borde: "1px solid rgba(59,130,246,0.35)",
      texto: "#bfdbfe",
    };
  }

  return {
    fondo: "rgba(34,197,94,0.18)",
    borde: "1px solid rgba(34,197,94,0.35)",
    texto: "#bbf7d0",
  };
}

export default function PanelEjecutivoPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #071426 0%, #0b1f3a 45%, #08172d 100%)",
        color: "white",
        fontFamily: "Arial, sans-serif",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "1600px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "18px",
            padding: "18px 22px",
            borderRadius: "22px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.10)",
            boxShadow: "0 10px 24px rgba(0,0,0,0.22)",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "14px",
                opacity: 0.72,
                letterSpacing: "1px",
                textTransform: "uppercase",
                marginBottom: "6px",
              }}
            >
              Criterio Estratégico
            </div>
            <div
              style={{
                fontSize: "28px",
                fontWeight: 900,
                lineHeight: 1.1,
              }}
            >
              Plataforma Ejecutiva de Hallazgos
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "14px", opacity: 0.75 }}>
              Sistema inteligente de reportes
            </div>
            <div style={{ fontSize: "14px", opacity: 0.75 }}>
              Última actualización: 18-04-2026 · 15:12
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "260px 1fr 360px",
            gap: "18px",
            alignItems: "start",
          }}
        >
          <aside
            style={{
              borderRadius: "22px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
              boxShadow: "0 10px 24px rgba(0,0,0,0.22)",
              padding: "18px",
            }}
          >
            <div
              style={{
                fontSize: "16px",
                fontWeight: 800,
                marginBottom: "14px",
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
              <div key={label} style={{ marginBottom: "12px" }}>
                <div
                  style={{
                    fontSize: "12px",
                    opacity: 0.72,
                    marginBottom: "6px",
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    padding: "12px",
                    borderRadius: "14px",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.75)",
                  }}
                >
                  Seleccionar
                </div>
              </div>
            ))}

            <button
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: "14px",
                border: "none",
                fontWeight: 800,
                cursor: "pointer",
                background: "linear-gradient(180deg, #67ef48 0%, #d7ff39 100%)",
                color: "#0b2b13",
                marginTop: "8px",
              }}
            >
              Limpiar filtros
            </button>
          </aside>

          <section>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(6, 1fr)",
                gap: "12px",
                marginBottom: "18px",
              }}
            >
              {kpis.map((kpi) => (
                <div
                  key={kpi.titulo}
                  style={{
                    borderRadius: "20px",
                    padding: "16px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    boxShadow: "0 10px 24px rgba(0,0,0,0.22)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      opacity: 0.72,
                      marginBottom: "8px",
                      textTransform: "uppercase",
                      letterSpacing: "0.8px",
                    }}
                  >
                    {kpi.titulo}
                  </div>

                  <div
                    style={{
                      fontSize: "34px",
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
                marginBottom: "18px",
              }}
            >
              <div
                style={{
                  borderRadius: "20px",
                  padding: "18px",
                  minHeight: "180px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  boxShadow: "0 10px 24px rgba(0,0,0,0.22)",
                }}
              >
                <div style={{ fontSize: "16px", fontWeight: 800, marginBottom: "8px" }}>
                  Reportes por empresa
                </div>
                <div style={{ fontSize: "13px", opacity: 0.7, marginBottom: "14px" }}>
                  Gráfico ejecutivo
                </div>
                <div
                  style={{
                    height: "110px",
                    borderRadius: "16px",
                    background:
                      "linear-gradient(180deg, rgba(59,130,246,0.18), rgba(59,130,246,0.06))",
                    border: "1px dashed rgba(255,255,255,0.15)",
                  }}
                />
              </div>

              <div
                style={{
                  borderRadius: "20px",
                  padding: "18px",
                  minHeight: "180px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  boxShadow: "0 10px 24px rgba(0,0,0,0.22)",
                }}
              >
                <div style={{ fontSize: "16px", fontWeight: 800, marginBottom: "8px" }}>
                  Estado general
                </div>
                <div style={{ fontSize: "13px", opacity: 0.7, marginBottom: "14px" }}>
                  Distribución de abiertos, cerrados y críticos
                </div>
                <div
                  style={{
                    height: "110px",
                    borderRadius: "16px",
                    background:
                      "linear-gradient(180deg, rgba(34,197,94,0.18), rgba(34,197,94,0.06))",
                    border: "1px dashed rgba(255,255,255,0.15)",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                borderRadius: "22px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.10)",
                boxShadow: "0 10px 24px rgba(0,0,0,0.22)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.5fr 1.2fr 1.5fr 1fr 1fr 1.4fr 1fr",
                  gap: "10px",
                  padding: "16px 18px",
                  background: "rgba(255,255,255,0.06)",
                  fontSize: "12px",
                  fontWeight: 800,
                  letterSpacing: "0.8px",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.72)",
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

              {filas.map((fila) => {
                const chip = chipColor(fila.criticidad);

                return (
                  <div
                    key={fila.codigo}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.5fr 1.2fr 1.5fr 1fr 1fr 1.4fr 1fr",
                      gap: "10px",
                      padding: "16px 18px",
                      borderTop: "1px solid rgba(255,255,255,0.08)",
                      alignItems: "center",
                      fontSize: "14px",
                    }}
                  >
                    <div style={{ fontWeight: 800 }}>{fila.codigo}</div>
                    <div>{fila.empresa}</div>
                    <div>{fila.tipo}</div>
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
                          fontSize: "12px",
                        }}
                      >
                        {fila.criticidad}
                      </span>
                    </div>
                    <div>{fila.estado}</div>
                    <div>{fila.fechaHora}</div>
                    <div>
                      <button
                        style={{
                          padding: "10px 12px",
                          borderRadius: "12px",
                          border: "none",
                          cursor: "pointer",
                          fontWeight: 800,
                          background: "rgba(59,130,246,0.18)",
                          color: "#bfdbfe",
                        }}
                      >
                        Ver informe
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <aside
            style={{
              borderRadius: "22px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
              boxShadow: "0 10px 24px rgba(0,0,0,0.22)",
              padding: "18px",
              minHeight: "720px",
            }}
          >
            <div
              style={{
                fontSize: "16px",
                fontWeight: 800,
                marginBottom: "14px",
              }}
            >
              Informe Ejecutivo
            </div>

            <div
              style={{
                padding: "14px",
                borderRadius: "16px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.10)",
                marginBottom: "14px",
              }}
            >
              <div style={{ fontSize: "12px", opacity: 0.7, marginBottom: "4px" }}>
                Código
              </div>
              <div style={{ fontWeight: 900 }}>CE-PEPM-GB/00031</div>
            </div>

            {[
              ["Empresa", "Grúa Bustamante"],
              ["Reportante", "Joaquín Camus"],
              ["Cargo", "Ingeniero Proyecto"],
              ["Teléfono", "+56 9 1234 5678"],
              ["Tipo", "Condición subestándar"],
              ["Criticidad", "CRÍTICO"],
              ["Fecha / Hora", "18-04-2026 · 14:32"],
            ].map(([titulo, valor]) => (
              <div key={titulo} style={{ marginBottom: "12px" }}>
                <div style={{ fontSize: "12px", opacity: 0.7, marginBottom: "4px" }}>
                  {titulo}
                </div>
                <div style={{ fontSize: "14px", fontWeight: 700 }}>{valor}</div>
              </div>
            ))}

            <div style={{ marginTop: "18px", marginBottom: "12px" }}>
              <div style={{ fontSize: "12px", opacity: 0.7, marginBottom: "4px" }}>
                Descripción
              </div>
              <div
                style={{
                  fontSize: "14px",
                  lineHeight: 1.5,
                  padding: "14px",
                  borderRadius: "16px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              >
                Caída de materiales desde altura en sector de acopio. Se observa
                exposición directa de personal y ausencia de control efectivo del
                área.
              </div>
            </div>

            <div style={{ marginTop: "18px", marginBottom: "12px" }}>
              <div style={{ fontSize: "12px", opacity: 0.7, marginBottom: "4px" }}>
                Medida inmediata
              </div>
              <div
                style={{
                  fontSize: "14px",
                  lineHeight: 1.5,
                  padding: "14px",
                  borderRadius: "16px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              >
                Suspender la intervención del sector y controlar inmediatamente la
                exposición a caída de materiales antes de reiniciar actividades.
              </div>
            </div>

            <button
              style={{
                width: "100%",
                marginTop: "16px",
                padding: "14px",
                borderRadius: "14px",
                border: "none",
                cursor: "pointer",
                fontWeight: 800,
                background: "linear-gradient(180deg, #67ef48 0%, #d7ff39 100%)",
                color: "#0b2b13",
              }}
            >
              Descargar PDF
            </button>
          </aside>
        </div>
      </div>
    </main>
  );
}