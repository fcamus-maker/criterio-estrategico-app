"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type CSSProperties,
} from "react";

type UsuarioActivo = {
  nombre: string;
  empresa: string;
  obra: string;
  cargo: string;
  foto: string;
};

const USUARIO_VACIO: UsuarioActivo = {
  nombre: "",
  empresa: "",
  obra: "",
  cargo: "",
  foto: "",
};

function normalizarSigla(valor: string) {
  const limpio = String(valor ?? "").trim().toUpperCase().replace(/\s+/g, "");
  return limpio || "-";
}

function correlativoHallazgo(valor: number) {
  return String(valor).padStart(4, "0");
}

function esHallazgoCerrado(hallazgo: any) {
  const estado = String(
    hallazgo?.seguimientoCierre?.estadoCierre ||
      hallazgo?.estadoCierre ||
      hallazgo?.estado ||
      ""
  )
    .trim()
    .toUpperCase();

  return estado === "CERRADO";
}

export default function Home() {
  const [hallazgos, setHallazgos] = useState<any[]>([]);
  const [usuarioActivo, setUsuarioActivo] = useState<UsuarioActivo | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formUsuario, setFormUsuario] = useState<UsuarioActivo>(USUARIO_VACIO);
  const [cargandoInicio, setCargandoInicio] = useState(true);

  useEffect(() => {
    const cargarDatos = () => {
      setCargandoInicio(true);

      try {
        const dataHallazgos = JSON.parse(
          localStorage.getItem("hallazgos") || "[]"
        );
        setHallazgos(Array.isArray(dataHallazgos) ? dataHallazgos : []);
      } catch {
        setHallazgos([]);
      }

      const dataUsuario = localStorage.getItem("usuarioActivo");

      if (!dataUsuario) {
        setUsuarioActivo(null);
        setFormUsuario(USUARIO_VACIO);
        setCargandoInicio(false);
        return;
      }

      try {
        const usuario = JSON.parse(dataUsuario);

        const usuarioNormalizado: UsuarioActivo = {
          nombre: String(usuario?.nombre || ""),
          empresa: String(usuario?.empresa || ""),
          obra: String(usuario?.obra || ""),
          cargo: String(usuario?.cargo || ""),
          foto: String(usuario?.foto || ""),
        };

        setUsuarioActivo(usuarioNormalizado);
        setFormUsuario(usuarioNormalizado);
        setCargandoInicio(false);
      } catch {
        localStorage.removeItem("usuarioActivo");
        setUsuarioActivo(null);
        setFormUsuario(USUARIO_VACIO);
        setCargandoInicio(false);
      }
    };

    cargarDatos();

    const alVolverVisible = () => {
      if (document.visibilityState === "visible") {
        cargarDatos();
      }
    };

    window.addEventListener("focus", cargarDatos);
    window.addEventListener("storage", cargarDatos);
    document.addEventListener("visibilitychange", alVolverVisible);

    return () => {
      window.removeEventListener("focus", cargarDatos);
      window.removeEventListener("storage", cargarDatos);
      document.removeEventListener("visibilitychange", alVolverVisible);
    };
  }, []);

  const resumen = useMemo(() => {
    const reportados = hallazgos.length;
    const cerrados = hallazgos.filter(esHallazgoCerrado).length;
    const abiertos = reportados - cerrados;
    return { reportados, abiertos, cerrados };
  }, [hallazgos]);

  const empresaCodigo = normalizarSigla(
    (modoEdicion ? formUsuario.empresa : usuarioActivo?.empresa) || "EMP"
  );

  const obraCodigo = normalizarSigla(
    (modoEdicion ? formUsuario.obra : usuarioActivo?.obra) || "OBRA"
  );

  const codigoPreview = `CE-${obraCodigo}/${empresaCodigo}-${correlativoHallazgo(
    hallazgos.length + 1
  )}`;
  const resumenKey = `${resumen.reportados}-${resumen.abiertos}-${resumen.cerrados}`;

  const handleFoto = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setFormUsuario((prev) => ({
        ...prev,
        foto: String(reader.result || ""),
      }));
    };
    reader.readAsDataURL(file);
  };

  const guardarUsuario = () => {
    if (
      !formUsuario.nombre.trim() ||
      !formUsuario.empresa.trim() ||
      !formUsuario.obra.trim()
    ) {
      alert("Completa al menos nombre, empresa y obra.");
      return;
    }

    const usuarioNormalizado: UsuarioActivo = {
      nombre: formUsuario.nombre.trim(),
      empresa: normalizarSigla(formUsuario.empresa),
      obra: normalizarSigla(formUsuario.obra),
      cargo: formUsuario.cargo.trim() || "Supervisor Terreno",
      foto: formUsuario.foto || "",
    };

    localStorage.setItem("usuarioActivo", JSON.stringify(usuarioNormalizado));
    setUsuarioActivo(usuarioNormalizado);
    setFormUsuario(usuarioNormalizado);
    setModoEdicion(false);
  };

  const inputStyle: CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.10)",
    color: "white",
    outline: "none",
    fontSize: "15px",
    marginTop: "6px",
    marginBottom: "12px",
  };

  const statCardBase: CSSProperties = {
    borderRadius: "18px",
    padding: "18px 12px",
    color: "white",
    textAlign: "center",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 8px 22px rgba(0,0,0,0.22)",
    minHeight: "168px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  };
if (cargandoInicio) return null;

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #1d4fa8 0%, #0b1f3a 42%, #08172d 100%)",
        color: "white",
        fontFamily: "Arial, sans-serif",
        display: "flex",
        justifyContent: "center",
        padding: "26px 16px 40px 16px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "560px" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div
            style={{
              width: "82px",
              height: "82px",
              borderRadius: "50%",
              margin: "0 auto 12px auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              background: "rgba(255,255,255,0.08)",
              boxShadow:
                "0 0 0 1px rgba(255,255,255,0.12), 0 12px 28px rgba(0,0,0,0.35), 0 0 28px rgba(255,255,255,0.28)",
              backdropFilter: "blur(4px)",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: "-10px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(255,255,255,0.22), transparent 65%)",
                zIndex: 0,
              }}
            />

            <img
              src="/logo.png"
              alt="Criterio Estratégico"
              style={{
                width: "54px",
                height: "54px",
                objectFit: "contain",
                zIndex: 1,
                borderRadius: "6px",
              }}
            />
          </div>

          <div
            style={{
              fontSize: "14px",
              fontWeight: 600,
              opacity: 0.8,
              letterSpacing: "0.8px",
              marginBottom: "8px",
            }}
          >
            Criterio Estratégico
          </div>

          <div
            style={{
              fontSize: "26px",
              fontWeight: 800,
              letterSpacing: "1px",
              textTransform: "uppercase",
              lineHeight: 1.08,
            }}
          >
            Reporte de Hallazgos
          </div>
        </div>

        {!usuarioActivo || modoEdicion ? (
          <div
            style={{
              background: "rgba(58, 100, 190, 0.32)",
              borderRadius: "22px",
              padding: "18px",
              marginBottom: "18px",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 10px 24px rgba(0,0,0,0.22)",
            }}
          >
            <div
              style={{
                textAlign: "center",
                fontSize: "18px",
                fontWeight: 800,
                marginBottom: "18px",
              }}
            >
              {usuarioActivo ? "Editar datos del supervisor" : "Ingreso del supervisor"}
            </div>

            <label style={{ fontSize: "13px", opacity: 0.75 }}>
              Nombre del supervisor
            </label>
            <input
              value={formUsuario.nombre}
              onChange={(e) =>
                setFormUsuario({ ...formUsuario, nombre: e.target.value })
              }
              placeholder="Ej: Freddy Camus"
              style={inputStyle}
            />

            <label style={{ fontSize: "13px", opacity: 0.75 }}>
              Empresa / sigla
            </label>
            <input
              value={formUsuario.empresa}
              onChange={(e) =>
                setFormUsuario({ ...formUsuario, empresa: e.target.value })
              }
              placeholder="Ej: TN"
              style={inputStyle}
            />

            <label style={{ fontSize: "13px", opacity: 0.75 }}>
              Obra / proyecto / sigla
            </label>
            <input
              value={formUsuario.obra}
              onChange={(e) =>
                setFormUsuario({ ...formUsuario, obra: e.target.value })
              }
              placeholder="Ej: PEPM"
              style={inputStyle}
            />

            <label style={{ fontSize: "13px", opacity: 0.75 }}>Cargo</label>
            <input
              value={formUsuario.cargo}
              onChange={(e) =>
                setFormUsuario({ ...formUsuario, cargo: e.target.value })
              }
              placeholder="Ej: Supervisor Terreno"
              style={inputStyle}
            />

            <label style={{ fontSize: "13px", opacity: 0.75 }}>Fotografía</label>
            <label
              style={{
                ...inputStyle,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              📷 Cargar fotografía
              <input
                type="file"
                accept="image/*"
                onChange={handleFoto}
                style={{ display: "none" }}
              />
            </label>

            {(formUsuario.foto || usuarioActivo?.foto) && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "12px",
                }}
              >
                <img
                  src={formUsuario.foto || usuarioActivo?.foto || ""}
                  alt="Supervisor"
                  style={{
                    width: "88px",
                    height: "88px",
                    objectFit: "cover",
                    borderRadius: "14px",
                    border: "1px solid rgba(255,255,255,0.14)",
                  }}
                />
              </div>
            )}

            <div
              style={{
                background: "rgba(255,255,255,0.08)",
                borderRadius: "16px",
                padding: "14px",
                marginBottom: "14px",
                border: "1px solid rgba(255,255,255,0.10)",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  opacity: 0.82,
                  marginBottom: "6px",
                  textTransform: "uppercase",
                  letterSpacing: "0.7px",
                }}
              >
                Próximo código referencial
              </div>

              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 900,
                  letterSpacing: "0.4px",
                }}
              >
                {codigoPreview}
              </div>
            </div>

            <button
              onClick={guardarUsuario}
              style={{
                width: "100%",
                padding: "15px",
                borderRadius: "16px",
                border: "none",
                color: "#0b2b13",
                fontSize: "17px",
                fontWeight: 800,
                cursor: "pointer",
                background: "linear-gradient(180deg, #67ef48 0%, #d7ff39 100%)",
                boxShadow: "0 10px 22px rgba(109,255,72,0.25)",
              }}
            >
              Guardar ingreso
            </button>
          </div>
        ) : (
          <>
            <div
              style={{
                background: "rgba(58, 100, 190, 0.32)",
                borderRadius: "22px",
                padding: "16px",
                marginBottom: "18px",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "0 10px 24px rgba(0,0,0,0.22)",
                display: "flex",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <div
                style={{
                  width: "96px",
                  height: "96px",
                  borderRadius: "16px",
                  background: "rgba(255,255,255,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontSize: "34px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  overflow: "hidden",
                }}
              >
                {usuarioActivo.foto ? (
                  <img
                    src={usuarioActivo.foto}
                    alt={usuarioActivo.nombre}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  "👷"
                )}
              </div>

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 800,
                    marginBottom: "6px",
                  }}
                >
                  {usuarioActivo.nombre}
                </div>

                <div
                  style={{
                    fontSize: "14px",
                    opacity: 0.95,
                    marginBottom: "4px",
                  }}
                >
                  {usuarioActivo.cargo || "Supervisor Terreno"}
                </div>

                <div
                  style={{
                    fontSize: "14px",
                    opacity: 0.82,
                    marginBottom: "4px",
                  }}
                >
                  Empresa: {usuarioActivo.empresa}
                </div>

                <div
                  style={{
                    fontSize: "14px",
                    opacity: 0.82,
                    marginBottom: "8px",
                  }}
                >
                  Obra: {usuarioActivo.obra}
                </div>

                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 800,
                    opacity: 0.9,
                    letterSpacing: "0.5px",
                  }}
                >
                  Próximo código: {codigoPreview}
                </div>
              </div>
            </div>

            <button
              onClick={() => (window.location.href = "/evaluar/reportar")}
              style={{
                width: "100%",
                padding: "17px",
                borderRadius: "18px",
                border: "none",
                color: "white",
                fontSize: "18px",
                fontWeight: 800,
                cursor: "pointer",
                marginBottom: "12px",
                background: "linear-gradient(180deg, #fb923c 0%, #ea580c 100%)",
                boxShadow: "0 10px 22px rgba(234,88,12,0.30)",
              }}
            >
              Reportar Hallazgo
            </button>

            <button
              onClick={() => {
                setFormUsuario(usuarioActivo);
                setModoEdicion(true);
              }}
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.16)",
                color: "white",
                fontSize: "15px",
                fontWeight: 700,
                cursor: "pointer",
                marginBottom: "20px",
                background: "rgba(255,255,255,0.08)",
              }}
            >
              Editar datos del supervisor
            </button>
          </>
        )}
<div
  style={{
    textAlign: "center",
    fontSize: "12px",
    opacity: 0.8,
    marginBottom: "8px",
  }}
>
  Debug → hallazgos: {hallazgos.length} | reportados: {resumen.reportados} | abiertos: {resumen.abiertos} | cerrados: {resumen.cerrados}
</div>
        <div
          style={{
            textAlign: "center",
            fontSize: "14px",
            fontWeight: 800,
            letterSpacing: "1px",
            opacity: 0.88,
            marginBottom: "12px",
            textTransform: "uppercase",
          }}
        >
          Estado de Reportes
        </div>

        <div
          key={resumenKey}
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04))",
            borderRadius: "22px",
            padding: "16px",
            marginBottom: "20px",
            border: "1px solid rgba(255,255,255,0.14)",
            boxShadow: "0 14px 32px rgba(0,0,0,0.28)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "12px",
            }}
          >
            <div
              style={{
                ...statCardBase,
                background:
                  "linear-gradient(180deg, rgba(59,130,246,0.96) 0%, rgba(29,78,216,0.92) 100%)",
              }}
            >
              <div style={{ fontSize: "24px" }}>📋</div>
              <div style={{ fontSize: "15px", fontWeight: 700 }}>Reportados</div>
              <div style={{ fontSize: "42px", fontWeight: 800 }}>
                {resumen.reportados}
              </div>
            </div>

            <div
              style={{
                ...statCardBase,
                background:
                  "linear-gradient(180deg, rgba(255,90,95,0.96) 0%, rgba(185,28,28,0.92) 100%)",
              }}
            >
              <div style={{ fontSize: "24px" }}>⚠️</div>
              <div style={{ fontSize: "15px", fontWeight: 700 }}>Abiertos</div>
              <div style={{ fontSize: "42px", fontWeight: 800 }}>
                {resumen.abiertos}
              </div>
            </div>

            <div
              style={{
                ...statCardBase,
                background:
                  "linear-gradient(180deg, rgba(34,197,94,0.96) 0%, rgba(21,128,61,0.92) 100%)",
              }}
            >
              <div style={{ fontSize: "24px" }}>✅</div>
              <div style={{ fontSize: "15px", fontWeight: 700 }}>Cerrados</div>
              <div style={{ fontSize: "42px", fontWeight: 800 }}>
                {resumen.cerrados}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            textAlign: "center",
            fontSize: "15px",
            fontWeight: 700,
            opacity: 0.88,
          }}
        >
          Según Ley 16.744 / D.S. N° 44
        </div>
      </div>
    </main>
  );
}
