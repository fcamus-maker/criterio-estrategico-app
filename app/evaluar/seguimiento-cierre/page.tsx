"use client";

import { useEffect, useMemo, useState } from "react";
import type { Hallazgo, SeguimientoCierre } from "../../types/hallazgo";

const estadoInicial: SeguimientoCierre["estadoCierre"] = "Pendiente de cierre";

function normalizarCriticidad(valor: unknown) {
  return String(valor ?? "")
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function obtenerCriticidad(hallazgo: Hallazgo | null) {
  const valor =
    hallazgo?.criticidad ||
    hallazgo?.nivelCriticidad ||
    hallazgo?.nivel ||
    hallazgo?.resultado?.criticidad ||
    hallazgo?.resultado?.nivel ||
    hallazgo?.resultadoFinal?.criticidad ||
    hallazgo?.resultadoFinal?.nivel ||
    "ALTO";

  const nivel = normalizarCriticidad(valor);

  if (nivel.includes("CRIT")) return "CRÍTICO";
  if (nivel.includes("ALTO")) return "ALTO";
  if (nivel.includes("MED")) return "MEDIO";
  return "BAJO";
}

function obtenerUltimoHallazgo(): Hallazgo | null {
  try {
    const data = JSON.parse(localStorage.getItem("hallazgos") || "[]");
    if (!Array.isArray(data) || data.length === 0) return null;
    return data[data.length - 1] as Hallazgo;
  } catch {
    return null;
  }
}

function texto(valor: unknown, fallback = "-") {
  const limpio = String(valor ?? "").trim();
  return limpio || fallback;
}

function obtenerFechaBaseHallazgo(hallazgo: Hallazgo | null): Date {
  const valor = hallazgo?.reporte?.fecha || hallazgo?.fecha;

  if (typeof valor === "string") {
    const match = valor.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (match) {
      const [, anio, mes, dia] = match;
      return new Date(Number(anio), Number(mes) - 1, Number(dia));
    }
  }

  const fecha = valor ? new Date(valor) : new Date();
  if (!Number.isNaN(fecha.getTime())) {
    return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  }

  const hoy = new Date();
  return new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
}

function sumarDias(fecha: Date, dias: number): Date {
  const copia = new Date(fecha);
  copia.setDate(copia.getDate() + dias);
  return copia;
}

function fechaInput(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

function formatearFechaVisual(fechaIso: string): string {
  const match = fechaIso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return fechaIso;
  const [, anio, mes, dia] = match;
  return `${dia}-${mes}-${anio}`;
}

function obtenerPlazoCierrePorCriticidad(criticidad: string): {
  diasMaximos: number;
  descripcion: string;
} {
  const nivel = normalizarCriticidad(criticidad);

  if (nivel.includes("CRIT")) {
    return {
      diasMaximos: 0,
      descripcion: "Crítico: máximo 24 horas desde la fecha del hallazgo",
    };
  }

  if (nivel.includes("ALTO")) {
    return {
      diasMaximos: 2,
      descripcion: "Alto: máximo 2 días corridos desde la fecha del hallazgo",
    };
  }

  if (nivel.includes("MED")) {
    return {
      diasMaximos: 3,
      descripcion: "Medio: máximo 3 días corridos desde la fecha del hallazgo",
    };
  }

  return {
    diasMaximos: 4,
    descripcion: "Bajo: máximo 4 días corridos desde la fecha del hallazgo",
  };
}

function obtenerVentanaCierre(
  hallazgo: Hallazgo | null,
  criticidad: string
): {
  fechaMinima: string;
  fechaMaxima: string;
  fechaSugerida: string;
  plazo: string;
} {
  const base = obtenerFechaBaseHallazgo(hallazgo);
  const plazo = obtenerPlazoCierrePorCriticidad(criticidad);
  const fechaMinima = fechaInput(base);
  const fechaMaxima = fechaInput(sumarDias(base, Math.max(0, plazo.diasMaximos)));

  return {
    fechaMinima,
    fechaMaxima,
    fechaSugerida: fechaMaxima,
    plazo: plazo.descripcion,
  };
}

export default function SeguimientoCierrePage() {
  const [hallazgo, setHallazgo] = useState<Hallazgo | null>(null);
  const [formulario, setFormulario] = useState<SeguimientoCierre>({
    responsableCierreNombre: "",
    responsableCierreCargo: "",
    responsableCierreEmpresa: "",
    responsableCierreTelefono: "",
    fechaCompromisoCierre: "",
    fechaMaximaPermitidaCierre: "",
    plazoCierrePorCriticidad: "",
    observacionInicialSeguimiento: "",
    estadoCierre: estadoInicial,
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const ultimo = obtenerUltimoHallazgo();
      const criticidadInicial = obtenerCriticidad(ultimo);
      const ventanaInicial = obtenerVentanaCierre(ultimo, criticidadInicial);
      setHallazgo(ultimo);

      if (ultimo?.seguimientoCierre) {
        setFormulario({
          responsableCierreNombre:
            ultimo.seguimientoCierre.responsableCierreNombre || "",
          responsableCierreCargo:
            ultimo.seguimientoCierre.responsableCierreCargo || "",
          responsableCierreEmpresa:
            ultimo.seguimientoCierre.responsableCierreEmpresa || "",
          responsableCierreTelefono:
            ultimo.seguimientoCierre.responsableCierreTelefono || "",
          fechaCompromisoCierre:
            ultimo.seguimientoCierre.fechaCompromisoCierre ||
            ventanaInicial.fechaSugerida,
          fechaMaximaPermitidaCierre:
            ultimo.seguimientoCierre.fechaMaximaPermitidaCierre ||
            ventanaInicial.fechaMaxima,
          plazoCierrePorCriticidad:
            ultimo.seguimientoCierre.plazoCierrePorCriticidad ||
            ventanaInicial.plazo,
          observacionInicialSeguimiento:
            ultimo.seguimientoCierre.observacionInicialSeguimiento || "",
          estadoCierre: ultimo.seguimientoCierre.estadoCierre || estadoInicial,
        });
      } else {
        setFormulario((prev) => ({
          ...prev,
          fechaCompromisoCierre: ventanaInicial.fechaSugerida,
          fechaMaximaPermitidaCierre: ventanaInicial.fechaMaxima,
          plazoCierrePorCriticidad: ventanaInicial.plazo,
        }));
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const criticidad = useMemo(() => obtenerCriticidad(hallazgo), [hallazgo]);
  const ventanaCierre = useMemo(
    () => obtenerVentanaCierre(hallazgo, criticidad),
    [hallazgo, criticidad]
  );
  const requiereCampos = criticidad === "CRÍTICO" || criticidad === "ALTO";

  const actualizarCampo = (campo: keyof SeguimientoCierre, valor: string) => {
    setFormulario((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const continuar = () => {
    const camposObligatorios: Array<keyof SeguimientoCierre> = [
      "responsableCierreNombre",
      "responsableCierreCargo",
      "responsableCierreEmpresa",
      "responsableCierreTelefono",
      "fechaCompromisoCierre",
      "observacionInicialSeguimiento",
    ];

    if (
      requiereCampos &&
      camposObligatorios.some((campo) => !String(formulario[campo] || "").trim())
    ) {
      alert(
        "Para hallazgos Crítico y Alto debes completar todos los datos de seguimiento de cierre."
      );
      return;
    }

    if (formulario.fechaCompromisoCierre > ventanaCierre.fechaMaxima) {
      alert(
        "La fecha compromiso excede el plazo máximo permitido para la criticidad del hallazgo. Cualquier ampliación deberá ser revisada desde la plataforma PC con justificación."
      );
      return;
    }

    try {
      const data = JSON.parse(localStorage.getItem("hallazgos") || "[]");

      if (!Array.isArray(data) || data.length === 0) {
        alert("No se encontró un hallazgo para actualizar.");
        return;
      }

      const ultimoIndex = data.length - 1;
      data[ultimoIndex] = {
        ...data[ultimoIndex],
        seguimientoCierre: {
          ...formulario,
          fechaMaximaPermitidaCierre: ventanaCierre.fechaMaxima,
          plazoCierrePorCriticidad: ventanaCierre.plazo,
          estadoCierre: estadoInicial,
        },
        estado: "En gestión",
      };

      localStorage.setItem("hallazgos", JSON.stringify(data));
      window.location.href = "/evaluar/informe-final";
    } catch {
      alert("No fue posible guardar el seguimiento de cierre.");
    }
  };

  if (!hallazgo) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background:
            "radial-gradient(circle at top, #1f4fa3 0%, #0b1f3a 42%, #08172d 100%)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          fontFamily: "Arial, sans-serif",
          textAlign: "center",
        }}
      >
        No se encontró un hallazgo para asignar seguimiento.
      </div>
    );
  }

  const inputBase = {
    width: "100%",
    minHeight: "46px",
    borderRadius: "13px",
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(255,255,255,0.10)",
    color: "white",
    padding: "12px 13px",
    fontSize: "15px",
    fontWeight: 700,
    outline: "none",
    boxSizing: "border-box" as const,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #1f4fa3 0%, #0b1f3a 42%, #08172d 100%)",
        padding: "20px 14px 30px",
        color: "white",
        fontFamily: "Arial, sans-serif",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: "520px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "18px",
            opacity: 0.95,
          }}
        >
          <span
            style={{ fontSize: "22px", cursor: "pointer" }}
            onClick={() => (window.location.href = "/evaluar/paso3")}
          >
            ‹
          </span>
          <span style={{ fontSize: "17px", fontWeight: 700 }}>
            Volver al resultado
          </span>
        </div>

        <h2 style={{ textAlign: "center", marginBottom: "8px" }}>
          Asignar responsable de cierre
        </h2>

        <p
          style={{
            textAlign: "center",
            opacity: 0.78,
            marginTop: 0,
            marginBottom: "18px",
            lineHeight: 1.4,
          }}
        >
          Define quién debe corregir y cerrar la desviación reportada.
        </p>

        <div
          style={{
            background: "rgba(52, 110, 220, 0.32)",
            borderRadius: "18px",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 10px 25px rgba(0,0,0,0.22)",
            padding: "14px",
            marginBottom: "14px",
          }}
        >
          <div style={{ fontSize: "13px", opacity: 0.75, marginBottom: "6px" }}>
            Supervisor reportante
          </div>
          <div style={{ fontSize: "17px", fontWeight: 800, marginBottom: "10px" }}>
            {texto(hallazgo.reporte?.responsable || hallazgo.responsable)}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <div style={{ fontSize: "12px", opacity: 0.72 }}>Criticidad</div>
              <div style={{ fontSize: "15px", fontWeight: 800 }}>{criticidad}</div>
            </div>
            <div>
              <div style={{ fontSize: "12px", opacity: 0.72 }}>Estado inicial</div>
              <div style={{ fontSize: "15px", fontWeight: 800 }}>{estadoInicial}</div>
            </div>
          </div>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.08)",
            borderRadius: "18px",
            border: "1px solid rgba(255,255,255,0.12)",
            padding: "16px",
            display: "grid",
            gap: "12px",
          }}
        >
          {[
            ["Responsable real de cierre", "responsableCierreNombre", "Nombre completo"],
            ["Cargo del responsable", "responsableCierreCargo", "Cargo o rol"],
            ["Empresa / contratista responsable", "responsableCierreEmpresa", "Empresa responsable"],
            ["Teléfono de contacto", "responsableCierreTelefono", "+56 9 ..."],
            ["Fecha compromiso de cierre", "fechaCompromisoCierre", ""],
          ].map(([label, campo, placeholder]) => (
            <label key={campo} style={{ display: "grid", gap: "6px" }}>
              <span style={{ fontSize: "13px", fontWeight: 800, opacity: 0.86 }}>
                {label}
              </span>
              <input
                type={campo === "fechaCompromisoCierre" ? "date" : "text"}
                min={
                  campo === "fechaCompromisoCierre"
                    ? ventanaCierre.fechaMinima
                    : undefined
                }
                max={
                  campo === "fechaCompromisoCierre"
                    ? ventanaCierre.fechaMaxima
                    : undefined
                }
                value={String(formulario[campo as keyof SeguimientoCierre] || "")}
                placeholder={placeholder}
                onChange={(event) =>
                  actualizarCampo(
                    campo as keyof SeguimientoCierre,
                    event.target.value
                  )
                }
                style={{
                  ...inputBase,
                  colorScheme: "dark",
                }}
              />
              {campo === "fechaCompromisoCierre" && (
                <span
                  style={{
                    color: "#dbeafe",
                    fontSize: "12px",
                    lineHeight: 1.4,
                    opacity: 0.86,
                  }}
                >
                  Plazo máximo según criticidad:{" "}
                  {formatearFechaVisual(ventanaCierre.fechaMaxima)}. Puede
                  seleccionar una fecha anterior, pero no posterior.
                </span>
              )}
            </label>
          ))}

          <label style={{ display: "grid", gap: "6px" }}>
            <span style={{ fontSize: "13px", fontWeight: 800, opacity: 0.86 }}>
              Observación inicial de seguimiento
            </span>
            <textarea
              value={formulario.observacionInicialSeguimiento}
              placeholder="Detalle inicial para la gestión de cierre"
              onChange={(event) =>
                actualizarCampo(
                  "observacionInicialSeguimiento",
                  event.target.value
                )
              }
              style={{
                ...inputBase,
                minHeight: "96px",
                resize: "vertical",
                lineHeight: 1.45,
              }}
            />
          </label>

          <div
            style={{
              padding: "12px 13px",
              borderRadius: "13px",
              background: "rgba(103,239,72,0.12)",
              border: "1px solid rgba(103,239,72,0.24)",
              color: "#dcfce7",
              fontSize: "14px",
              fontWeight: 800,
            }}
          >
            Estado inicial de cierre: {estadoInicial}
          </div>
        </div>

        <button
          onClick={continuar}
          style={{
            marginTop: "16px",
            width: "100%",
            padding: "16px",
            borderRadius: "16px",
            background: "linear-gradient(180deg, #1890ff 0%, #0f63d8 100%)",
            color: "white",
            border: "none",
            fontWeight: 800,
            fontSize: "18px",
            cursor: "pointer",
            boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
          }}
        >
          Continuar al informe final
        </button>
      </div>
    </div>
  );
}
