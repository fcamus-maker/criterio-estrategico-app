"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";

type SupervisorV2 = {
  nombre: string;
  cargo: string;
  empresa: string;
  obra: string;
  siglaEmpresa: string;
  siglaProyecto: string;
};

type FotoV2 = {
  id: string;
  nombre: string;
  tipo: "image/jpeg";
  dataUrl: string;
  fechaCarga: string;
};

type UbicacionV2 = {
  latitud: number;
  longitud: number;
  precisionGps: number;
  fechaHoraGeolocalizacion: string;
  estadoGeolocalizacion: "real" | "simulada-desarrollo";
};

const STORAGE_SUPERVISOR = "ce_mobile_v2_supervisor";

const SUPERVISOR_DEFAULT: SupervisorV2 = {
  nombre: "Freddy Camus",
  cargo: "Ingeniero",
  empresa: "TNT",
  obra: "PEL",
  siglaEmpresa: "TNT",
  siglaProyecto: "PEL",
};

function cargarSupervisor(): SupervisorV2 {
  if (typeof window === "undefined") return SUPERVISOR_DEFAULT;

  try {
    const guardado = JSON.parse(
      localStorage.getItem(STORAGE_SUPERVISOR) || "null"
    );

    if (!guardado || typeof guardado !== "object") return SUPERVISOR_DEFAULT;

    return {
      nombre: String(guardado.nombre || SUPERVISOR_DEFAULT.nombre),
      cargo: String(guardado.cargo || SUPERVISOR_DEFAULT.cargo),
      empresa: String(guardado.empresa || SUPERVISOR_DEFAULT.empresa),
      obra: String(guardado.obra || SUPERVISOR_DEFAULT.obra),
      siglaEmpresa: String(
        guardado.siglaEmpresa || SUPERVISOR_DEFAULT.siglaEmpresa
      ),
      siglaProyecto: String(
        guardado.siglaProyecto || SUPERVISOR_DEFAULT.siglaProyecto
      ),
    };
  } catch {
    return SUPERVISOR_DEFAULT;
  }
}

function comprimirFoto(file: File): Promise<FotoV2> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("No se pudo leer la fotografía."));
    reader.onload = () => {
      const image = new Image();

      image.onerror = () =>
        reject(new Error("No se pudo procesar la fotografía."));
      image.onload = () => {
        const maxWidth = 1200;
        const maxHeight = 1200;
        const ratio = Math.min(
          maxWidth / image.width,
          maxHeight / image.height,
          1
        );
        const width = Math.round(image.width * ratio);
        const height = Math.round(image.height * ratio);
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
          reject(new Error("No se pudo preparar la compresión."));
          return;
        }

        canvas.width = width;
        canvas.height = height;
        context.drawImage(image, 0, 0, width, height);

        resolve({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          nombre: file.name || "fotografia-v2.jpg",
          tipo: "image/jpeg",
          dataUrl: canvas.toDataURL("image/jpeg", 0.72),
          fechaCarga: new Date().toISOString(),
        });
      };

      image.src = String(reader.result || "");
    };

    reader.readAsDataURL(file);
  });
}

export default function ReportarV2Page() {
  const [supervisor, setSupervisor] =
    useState<SupervisorV2>(SUPERVISOR_DEFAULT);
  const [fechaActual, setFechaActual] = useState("");
  const [horaActual, setHoraActual] = useState("");
  const [area, setArea] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fotos, setFotos] = useState<FotoV2[]>([]);
  const [ubicacion, setUbicacion] = useState<UbicacionV2 | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [procesandoFotos, setProcesandoFotos] = useState(false);
  const [capturandoGps, setCapturandoGps] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const ahora = new Date();
      setSupervisor(cargarSupervisor());
      setFechaActual(ahora.toLocaleDateString("es-CL"));
      setHoraActual(
        ahora.toLocaleTimeString("es-CL", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const seleccionarFotos = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget as HTMLInputElement;
    const files = Array.from(input.files ?? []);

    if (files.length === 0) {
      input.value = "";
      return;
    }

    setProcesandoFotos(true);
    setError("");
    setMensaje("");

    try {
      const cuposDisponibles = Math.max(3 - fotos.length, 0);
      const seleccionadas = files.slice(0, cuposDisponibles);

      if (seleccionadas.length === 0) {
        setMensaje("Ya hay 3 fotografías cargadas.");
        return;
      }

      const comprimidas = await Promise.all(seleccionadas.map(comprimirFoto));
      setFotos((actuales) => [...actuales, ...comprimidas].slice(0, 3));
      setMensaje("Fotografía cargada correctamente.");
    } catch {
      setError("No se pudo cargar la fotografía seleccionada.");
    } finally {
      setProcesandoFotos(false);
      input.value = "";
    }
  };

  const eliminarFoto = (fotoId: string) => {
    setFotos((actuales) => actuales.filter((foto) => foto.id !== fotoId));
    setMensaje("Fotografía eliminada.");
    setError("");
  };

  const capturarGps = () => {
    setError("");
    setMensaje("");

    if (!navigator.geolocation) {
      setError(
        "GPS no disponible en este origen. Para GPS real se requiere HTTPS o despliegue seguro."
      );
      return;
    }

    setCapturandoGps(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUbicacion({
          latitud: position.coords.latitude,
          longitud: position.coords.longitude,
          precisionGps: position.coords.accuracy,
          fechaHoraGeolocalizacion: new Date().toISOString(),
          estadoGeolocalizacion: "real",
        });
        setMensaje("Ubicación GPS capturada.");
        setCapturandoGps(false);
      },
      () => {
        setError(
          "GPS no disponible en este origen. Para GPS real se requiere HTTPS o despliegue seguro."
        );
        setCapturandoGps(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const usarUbicacionSimulada = () => {
    setUbicacion({
      latitud: -29.982379,
      longitud: -71.348969,
      precisionGps: 35,
      fechaHoraGeolocalizacion: new Date().toISOString(),
      estadoGeolocalizacion: "simulada-desarrollo",
    });
    setError("");
    setMensaje("Ubicación simulada cargada para desarrollo local.");
  };

  const validarReporte = () => {
    setError("");
    setMensaje("");

    if (!area.trim()) {
      setError("Ingresa el área del hallazgo.");
      return;
    }

    if (!descripcion.trim()) {
      setError("Ingresa la descripción del hallazgo.");
      return;
    }

    if (!ubicacion) {
      setError("Captura una ubicación GPS real o usa la ubicación simulada.");
      return;
    }

    setMensaje("Reporte V2 válido para continuar.");
  };

  const pageStyle = {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at 50% 0%, #2563eb 0%, #0b1f3a 42%, #061327 100%)",
    color: "white",
    fontFamily: "Arial, sans-serif",
    overflowX: "hidden" as const,
    touchAction: "pan-y" as const,
  };

  const containerStyle = {
    width: "100%",
    maxWidth: "430px",
    margin: "0 auto",
    padding: "16px",
    boxSizing: "border-box" as const,
    overflowX: "hidden" as const,
    touchAction: "pan-y" as const,
  };

  const cardStyle = {
    borderRadius: "22px",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.07))",
    border: "1px solid rgba(255,255,255,0.16)",
    boxShadow: "0 18px 36px rgba(0,0,0,0.28)",
    padding: "16px",
    boxSizing: "border-box" as const,
    maxWidth: "100%",
    overflowX: "hidden" as const,
    marginBottom: "14px",
  };

  const inputStyle = {
    width: "100%",
    maxWidth: "100%",
    fontSize: "16px",
    boxSizing: "border-box" as const,
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.10)",
    color: "white",
    padding: "12px 13px",
    outline: "none",
    touchAction: "manipulation" as const,
  };

  const buttonStyle = {
    width: "100%",
    fontSize: "16px",
    touchAction: "manipulation" as const,
    border: "none",
    borderRadius: "16px",
    padding: "14px",
    fontWeight: 900,
    cursor: "pointer",
    boxSizing: "border-box" as const,
    maxWidth: "100%",
  };

  const labelStyle = {
    display: "block",
    fontSize: "12px",
    fontWeight: 800,
    opacity: 0.72,
    marginBottom: "6px",
  };

  return (
    <main
      style={pageStyle}
      onDoubleClick={(event) => {
        event.preventDefault();
      }}
    >
      <div style={containerStyle}>
        <header style={{ marginBottom: "14px" }}>
          <a
            href="/evaluar-v2"
            style={{
              color: "white",
              textDecoration: "none",
              fontSize: "15px",
              fontWeight: 800,
              opacity: 0.9,
            }}
          >
            Volver a inicio V2
          </a>
          <h1
            style={{
              margin: "14px 0 0",
              fontSize: "25px",
              lineHeight: 1.08,
              fontWeight: 900,
              letterSpacing: "0",
            }}
          >
            Reportar Hallazgo V2
          </h1>
        </header>

        <section style={cardStyle}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
            }}
          >
            {[
              ["Responsable", supervisor.nombre],
              ["Cargo", supervisor.cargo],
              ["Empresa", supervisor.empresa],
              ["Obra", supervisor.obra],
              ["Fecha actual", fechaActual || "—"],
              ["Hora actual", horaActual || "—"],
            ].map(([label, valor]) => (
              <div key={label}>
                <div style={{ fontSize: "11px", opacity: 0.62 }}>{label}</div>
                <div style={{ fontSize: "14px", fontWeight: 800 }}>
                  {valor}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={cardStyle}>
          <div style={{ display: "grid", gap: "12px" }}>
            <label style={{ display: "block" }}>
              <span style={labelStyle}>Área</span>
              <input
                type="text"
                value={area}
                onChange={(event) => setArea(event.target.value)}
                placeholder="Ej: Planta, bodega, ruta interna"
                style={inputStyle}
              />
            </label>

            <label style={{ display: "block" }}>
              <span style={labelStyle}>Descripción</span>
              <textarea
                value={descripcion}
                onChange={(event) => setDescripcion(event.target.value)}
                placeholder="Describe la condición observada"
                style={{
                  ...inputStyle,
                  minHeight: "116px",
                  resize: "vertical",
                  lineHeight: 1.45,
                }}
              />
            </label>
          </div>
        </section>

        <section style={cardStyle}>
          <div
            style={{
              fontSize: "18px",
              lineHeight: 1.2,
              fontWeight: 900,
              marginBottom: "10px",
            }}
          >
            Fotografías
          </div>
          <p
            style={{
              margin: "0 0 12px",
              fontSize: "13px",
              lineHeight: 1.4,
              opacity: 0.72,
            }}
          >
            Input visible para diagnóstico. Se permiten hasta 3 fotografías.
          </p>

          <div
            style={{
              marginBottom: "10px",
              borderRadius: "14px",
              padding: "10px 12px",
              background:
                fotos.length >= 3
                  ? "rgba(103,239,72,0.14)"
                  : "rgba(255,255,255,0.08)",
              border:
                fotos.length >= 3
                  ? "1px solid rgba(103,239,72,0.28)"
                  : "1px solid rgba(255,255,255,0.12)",
              fontSize: "14px",
              fontWeight: 900,
            }}
          >
            {fotos.length >= 3
              ? "Máximo 3 fotografías cargadas"
              : `Fotografías cargadas: ${fotos.length}/3`}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            disabled={fotos.length >= 3}
            onChange={seleccionarFotos}
            style={{
              width: "100%",
              fontSize: "16px",
              boxSizing: "border-box",
              color: "white",
              padding: "12px",
              borderRadius: "14px",
              border: "1px solid rgba(255,255,255,0.18)",
              background:
                fotos.length >= 3
                  ? "rgba(255,255,255,0.04)"
                  : "rgba(255,255,255,0.08)",
              marginBottom: "12px",
              opacity: fotos.length >= 3 ? 0.56 : 1,
            }}
          />

          {procesandoFotos && (
            <div style={{ fontSize: "13px", opacity: 0.74 }}>
              Procesando fotografía...
            </div>
          )}

          {fotos.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "8px",
              }}
            >
              {fotos.map((foto) => (
                <div
                  key={foto.id}
                  style={{
                    borderRadius: "14px",
                    border: "1px solid rgba(255,255,255,0.16)",
                    background: "rgba(255,255,255,0.08)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    aria-label={foto.nombre}
                    role="img"
                    style={{
                      width: "100%",
                      height: "92px",
                      backgroundImage: `url(${foto.dataUrl})`,
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "cover",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => eliminarFoto(foto.id)}
                    style={{
                      width: "100%",
                      fontSize: "12px",
                      touchAction: "manipulation",
                      border: "none",
                      borderTop: "1px solid rgba(255,255,255,0.12)",
                      background: "rgba(239,68,68,0.22)",
                      color: "white",
                      padding: "8px 4px",
                      fontWeight: 900,
                      cursor: "pointer",
                      boxSizing: "border-box",
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section style={cardStyle}>
          <div
            style={{
              fontSize: "18px",
              lineHeight: 1.2,
              fontWeight: 900,
              marginBottom: "12px",
            }}
          >
            Ubicación GPS
          </div>

          <div style={{ display: "grid", gap: "10px" }}>
            <button
              type="button"
              onClick={capturarGps}
              disabled={capturandoGps}
              style={{
                ...buttonStyle,
                color: "white",
                background: capturandoGps
                  ? "rgba(255,255,255,0.18)"
                  : "linear-gradient(135deg, #2563eb, #1d4ed8)",
              }}
            >
              {capturandoGps
                ? "Capturando ubicación..."
                : "Capturar ubicación GPS"}
            </button>

            <button
              type="button"
              onClick={usarUbicacionSimulada}
              style={{
                ...buttonStyle,
                color: "#08172d",
                background: "linear-gradient(135deg, #67ef48 0%, #d7ff39 100%)",
              }}
            >
              Usar ubicación simulada
            </button>
          </div>

          <div
            style={{
              marginTop: "12px",
              borderRadius: "16px",
              padding: "12px",
              background: "rgba(255,255,255,0.08)",
              fontSize: "13px",
              lineHeight: 1.45,
            }}
          >
            {ubicacion ? (
              <>
                <div>
                  <strong>Latitud:</strong> {ubicacion.latitud}
                </div>
                <div>
                  <strong>Longitud:</strong> {ubicacion.longitud}
                </div>
                <div>
                  <strong>Precisión:</strong> {ubicacion.precisionGps} m
                </div>
                <div>
                  <strong>Estado:</strong> {ubicacion.estadoGeolocalizacion}
                </div>
                <div>
                  <strong>Fecha/hora:</strong>{" "}
                  {ubicacion.fechaHoraGeolocalizacion}
                </div>
              </>
            ) : (
              "Sin ubicación capturada."
            )}
          </div>
        </section>

        {(mensaje || error) && (
          <section
            style={{
              ...cardStyle,
              background: error
                ? "rgba(239,68,68,0.16)"
                : "rgba(103,239,72,0.12)",
              border: error
                ? "1px solid rgba(239,68,68,0.35)"
                : "1px solid rgba(103,239,72,0.25)",
              fontSize: "14px",
              fontWeight: 800,
              lineHeight: 1.45,
            }}
          >
            {error || mensaje}
          </section>
        )}

        <button
          type="button"
          onClick={validarReporte}
          style={{
            ...buttonStyle,
            color: "#08172d",
            background: "linear-gradient(135deg, #facc15, #f97316)",
            boxShadow: "0 14px 28px rgba(249,115,22,0.22)",
          }}
        >
          Validar reporte
        </button>
      </div>
    </main>
  );
}
