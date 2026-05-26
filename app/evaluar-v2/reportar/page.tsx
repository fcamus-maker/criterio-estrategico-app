"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  cargarHistorialLivianoV2,
  eliminarEvidenciaLocalV2,
  guardarReporteActualV2,
  prepararReporteConEvidenciasLocalesV2,
} from "../storageReporteV2";
import {
  cargarSupervisorV2UsuarioActual,
  crearCodigoReporteMovil,
  perfilSupervisorV2Completo,
  SUPERVISOR_V2_VACIO,
  type SupervisorV2,
} from "../supervisorProfileStorage";

type FotoV2 = {
  id: string;
  nombre: string;
  tipo: "image/jpeg";
  dataUrl: string;
  fechaCarga: string;
  fechaCaptura: string;
  tamanoBytes?: number;
  pesoBytes?: number;
  estadoSubida?: "pendiente" | "subiendo" | "subida" | "error";
  storagePendiente?: boolean;
  localBlobKey?: string;
  origen?: string;
  intentos?: number;
};

type UbicacionV2 = {
  latitud?: number;
  longitud?: number;
  precisionGps?: number;
  fechaHoraGeolocalizacion: string;
  estadoGeolocalizacion: "obtenido" | "pendiente" | "denegado" | "error";
  motivoGeolocalizacion?: string;
};

const FOTO_MAX_LADO_PX = 1280;
const FOTO_CALIDAD_JPEG = 0.72;
const FOTO_OBJETIVO_BYTES = 1024 * 1024;
const FOTO_MIN_LADO_REAJUSTE_PX = 960;

function vibrarOk() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(20);
  }
}

function obtenerTotalHistorial() {
  return cargarHistorialLivianoV2().length;
}

function estimarBytesDataUrl(dataUrl: string) {
  return Math.max(
    0,
    Math.round((((dataUrl.split(",")[1] || "").length * 3) / 4))
  );
}

function nombreJPEG(nombreOriginal: string | undefined) {
  const base = String(nombreOriginal || "fotografia")
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "");

  return `${base || "fotografia"}.jpg`;
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
        const ratio = Math.min(
          FOTO_MAX_LADO_PX / image.width,
          FOTO_MAX_LADO_PX / image.height,
          1
        );
        let width = Math.round(image.width * ratio);
        let height = Math.round(image.height * ratio);
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
          reject(new Error("No se pudo preparar la compresión."));
          return;
        }

        const exportarJPEG = () => {
          canvas.width = width;
          canvas.height = height;
          context.drawImage(image, 0, 0, width, height);
          return canvas.toDataURL("image/jpeg", FOTO_CALIDAD_JPEG);
        };

        let dataUrl = exportarJPEG();
        while (
          estimarBytesDataUrl(dataUrl) > FOTO_OBJETIVO_BYTES &&
          Math.max(width, height) > FOTO_MIN_LADO_REAJUSTE_PX
        ) {
          const factor = Math.max(
            FOTO_MIN_LADO_REAJUSTE_PX / Math.max(width, height),
            0.88
          );
          width = Math.max(1, Math.round(width * factor));
          height = Math.max(1, Math.round(height * factor));
          dataUrl = exportarJPEG();
        }

        const fechaCaptura = new Date().toISOString();
        const tamanoBytes = estimarBytesDataUrl(dataUrl);

        resolve({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          nombre: nombreJPEG(file.name),
          tipo: "image/jpeg",
          dataUrl,
          fechaCarga: fechaCaptura,
          fechaCaptura,
          tamanoBytes,
          pesoBytes: tamanoBytes,
          estadoSubida: "pendiente",
          storagePendiente: true,
          origen: "mobile-v2",
          intentos: 0,
        });
      };

      image.src = String(reader.result || "");
    };

    reader.readAsDataURL(file);
  });
}

export default function ReportarV2Page() {
  const router = useRouter();
  const [supervisor, setSupervisor] =
    useState<SupervisorV2>(SUPERVISOR_V2_VACIO);
  const [fechaActual, setFechaActual] = useState("");
  const [horaActual, setHoraActual] = useState("");
  const [area, setArea] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [empresaInvolucradaResponsable, setEmpresaInvolucradaResponsable] =
    useState("");
  const [responsableEmpresa, setResponsableEmpresa] = useState("");
  const [cargoResponsableEmpresa, setCargoResponsableEmpresa] = useState("");
  const [fotos, setFotos] = useState<FotoV2[]>([]);
  const [ubicacion, setUbicacion] = useState<UbicacionV2 | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [procesandoFotos, setProcesandoFotos] = useState(false);
  const [capturandoGps, setCapturandoGps] = useState(false);
  const [navegando, setNavegando] = useState(false);
  const [botonActivo, setBotonActivo] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let activo = true;
    const frameId = window.requestAnimationFrame(async () => {
      const ahora = new Date();
      const contexto = await cargarSupervisorV2UsuarioActual();
      if (!activo) return;

      setSupervisor(contexto.supervisor);
      setFechaActual(ahora.toLocaleDateString("es-CL"));
      setHoraActual(
        ahora.toLocaleTimeString("es-CL", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    });

    return () => {
      activo = false;
      window.cancelAnimationFrame(frameId);
    };
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
      const combinadas = [...fotos, ...comprimidas].slice(0, 3);
      const preparadas = await prepararReporteConEvidenciasLocalesV2({
        fotos: combinadas,
      });

      if (!preparadas.ok) {
        setError(
          "La fotografía fue procesada, pero no se pudo conservar para reintento. Intenta nuevamente."
        );
        return;
      }

      setFotos((preparadas.reporte.fotos || []) as FotoV2[]);
      setMensaje("Fotografía cargada correctamente.");
    } catch {
      setError("No se pudo cargar la fotografía seleccionada.");
    } finally {
      setProcesandoFotos(false);
      input.value = "";
    }
  };

  const eliminarFoto = (fotoId: string) => {
    const foto = fotos.find((item) => item.id === fotoId);
    void eliminarEvidenciaLocalV2(foto?.localBlobKey);
    setFotos((actuales) => actuales.filter((foto) => foto.id !== fotoId));
    setMensaje("Fotografía eliminada.");
    setError("");
    vibrarOk();
  };

  const capturarGps = () => {
    setError("");
    setMensaje("Se solicitará permiso de ubicación del dispositivo para adjuntar GPS real al reporte.");

    if (!navigator.geolocation) {
      setUbicacion({
        fechaHoraGeolocalizacion: new Date().toISOString(),
        estadoGeolocalizacion: "error",
        motivoGeolocalizacion:
          "Geolocalización no disponible en este navegador u origen.",
      });
      setError("No se pudo obtener GPS real en este dispositivo. Puedes continuar sin coordenadas.");
      return;
    }

    setCapturandoGps(true);
    setUbicacion({
      fechaHoraGeolocalizacion: new Date().toISOString(),
      estadoGeolocalizacion: "pendiente",
      motivoGeolocalizacion: "Solicitud de permiso de ubicación enviada al navegador.",
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUbicacion({
          latitud: position.coords.latitude,
          longitud: position.coords.longitude,
          precisionGps: position.coords.accuracy,
          fechaHoraGeolocalizacion: new Date().toISOString(),
          estadoGeolocalizacion: "obtenido",
        });
        setMensaje("Ubicación GPS real capturada correctamente.");
        setCapturandoGps(false);
        vibrarOk();
      },
      (geolocationError) => {
        const permisoDenegado = geolocationError.code === geolocationError.PERMISSION_DENIED;
        setUbicacion({
          fechaHoraGeolocalizacion: new Date().toISOString(),
          estadoGeolocalizacion: permisoDenegado ? "denegado" : "error",
          motivoGeolocalizacion: permisoDenegado
            ? "El usuario denegó el permiso de ubicación."
            : geolocationError.message || "No se pudo obtener la ubicación del dispositivo.",
        });
        setError(
          permisoDenegado
            ? "Permiso de ubicación denegado. Puedes continuar; el reporte quedará sin coordenadas GPS."
            : "No se pudo obtener GPS real. Puedes continuar; el reporte quedará marcado con error GPS."
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

  const validarReporte = async () => {
    if (navegando) return;

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

    if (!empresaInvolucradaResponsable.trim()) {
      setError("Ingresa la empresa involucrada / responsable.");
      return;
    }

    if (!responsableEmpresa.trim()) {
      setError("Ingresa el responsable de la empresa.");
      return;
    }

    if (!cargoResponsableEmpresa.trim()) {
      setError("Ingresa el cargo del responsable.");
      return;
    }

    if (!perfilSupervisorV2Completo(supervisor)) {
      setError(
        "Complete el perfil del supervisor con empresa, obra y siglas antes de generar el reporte."
      );
      return;
    }

    const gpsReporte = ubicacion || {
      fechaHoraGeolocalizacion: new Date().toISOString(),
      estadoGeolocalizacion: "pendiente" as const,
      motivoGeolocalizacion:
        "El reporte fue validado sin captura GPS previa. No se registraron coordenadas.",
    };
    const codigoReporte = crearCodigoReporteMovil(
      supervisor,
      obtenerTotalHistorial() + 1
    );

    const reporteV2 = {
      codigo: codigoReporte,
      supervisor: supervisor.nombre,
      cargo: supervisor.cargo,
      empresa: supervisor.empresa,
      obra: supervisor.obra,
      siglaEmpresa: supervisor.siglaEmpresa,
      siglaProyecto: supervisor.siglaProyecto,
      supervisorFoto: supervisor.foto,
      fecha: fechaActual,
      hora: horaActual,
      area: area.trim(),
      descripcion: descripcion.trim(),
      empresaInvolucradaResponsable: empresaInvolucradaResponsable.trim(),
      responsableEmpresa: responsableEmpresa.trim(),
      cargoResponsableEmpresa: cargoResponsableEmpresa.trim(),
      asignacionCierre: {
        responsableCorreccionTipo: "contratista",
        responsableCorreccionEmpresa: empresaInvolucradaResponsable.trim(),
        responsableCorreccionNombre: responsableEmpresa.trim(),
        responsableCorreccionCargo: cargoResponsableEmpresa.trim(),
      },
      fotos,
      gps: gpsReporte,
      estadoValidacion: "validado",
      mensajeValidacion: "Reporte válido para continuar.",
    };

    const reportePreparado = await prepararReporteConEvidenciasLocalesV2(reporteV2);
    if (!reportePreparado.ok) {
      setError(
        "No se pudo conservar la evidencia fotográfica para reintento. Intenta nuevamente antes de continuar."
      );
      return;
    }

    guardarReporteActualV2(reportePreparado.reporte);
    setMensaje("Reporte válido para continuar.");
    setNavegando(true);
    vibrarOk();
    router.push("/evaluar-v2/evaluacion/paso1");
  };

  const feedbackBoton = (id: string) => ({
    onPointerDown: () => setBotonActivo(id),
    onPointerUp: () => setBotonActivo(""),
    onPointerCancel: () => setBotonActivo(""),
    onPointerLeave: () => setBotonActivo(""),
  });

  const estiloFeedback = (id: string) =>
    botonActivo === id
      ? {
          transform: "translateY(2px) scale(0.985)",
          filter: "brightness(1.12)",
          boxShadow: "0 8px 16px rgba(0,0,0,0.28)",
        }
      : {};

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
    padding: "16px 16px calc(96px + env(safe-area-inset-bottom))",
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
    transition: "transform 120ms ease, filter 120ms ease, box-shadow 120ms ease",
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
          <div
            style={{
              width: "76px",
              height: "76px",
              borderRadius: "50%",
              margin: "0 0 12px",
              backgroundImage: "url('/logo.png')",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.28)",
              boxShadow: "0 14px 28px rgba(0,0,0,0.28)",
            }}
            aria-label="Logo Criterio Estratégico"
          />
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
            Volver a inicio
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
            Reportar Hallazgo
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
            Responsabilidad asociada al hallazgo
          </div>
          <div style={{ display: "grid", gap: "12px" }}>
            <label style={{ display: "block" }}>
              <span style={labelStyle}>Empresa involucrada / responsable</span>
              <input
                type="text"
                value={empresaInvolucradaResponsable}
                onChange={(event) =>
                  setEmpresaInvolucradaResponsable(event.target.value)
                }
                placeholder="Ej: Contratista, área o empresa responsable"
                style={inputStyle}
              />
            </label>

            <label style={{ display: "block" }}>
              <span style={labelStyle}>Responsable de la empresa</span>
              <input
                type="text"
                value={responsableEmpresa}
                onChange={(event) => setResponsableEmpresa(event.target.value)}
                placeholder="Nombre del responsable"
                style={inputStyle}
              />
            </label>

            <label style={{ display: "block" }}>
              <span style={labelStyle}>Cargo del responsable</span>
              <input
                type="text"
                value={cargoResponsableEmpresa}
                onChange={(event) =>
                  setCargoResponsableEmpresa(event.target.value)
                }
                placeholder="Cargo o función"
                style={inputStyle}
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
                    {...feedbackBoton(`eliminar-${foto.id}`)}
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
                      transition:
                        "transform 120ms ease, filter 120ms ease, box-shadow 120ms ease",
                      ...estiloFeedback(`eliminar-${foto.id}`),
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
              {...feedbackBoton("gps")}
              style={{
                ...buttonStyle,
                color: "white",
                background: capturandoGps
                  ? "rgba(255,255,255,0.18)"
                  : "linear-gradient(135deg, #2563eb, #1d4ed8)",
                ...estiloFeedback("gps"),
              }}
            >
              {capturandoGps
                ? "Capturando ubicación..."
                : "Capturar ubicación GPS"}
            </button>
            <div
              style={{
                fontSize: "12px",
                lineHeight: 1.45,
                opacity: 0.76,
                fontWeight: 700,
              }}
            >
              El navegador solicitará permiso para usar la ubicación real del dispositivo.
              Si rechazas el permiso, podrás continuar sin coordenadas.
            </div>
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
                {typeof ubicacion.latitud === "number" &&
                  typeof ubicacion.longitud === "number" && (
                    <>
                      <div>
                        <strong>Latitud:</strong> {ubicacion.latitud}
                      </div>
                      <div>
                        <strong>Longitud:</strong> {ubicacion.longitud}
                      </div>
                      <div>
                        <strong>Precisión:</strong>{" "}
                        {typeof ubicacion.precisionGps === "number"
                          ? `${ubicacion.precisionGps} m`
                          : "No informada"}
                      </div>
                    </>
                  )}
                <div>
                  <strong>Estado:</strong> {ubicacion.estadoGeolocalizacion}
                </div>
                {ubicacion.motivoGeolocalizacion && (
                  <div>
                    <strong>Motivo:</strong> {ubicacion.motivoGeolocalizacion}
                  </div>
                )}
                <div>
                  <strong>Fecha/hora:</strong>{" "}
                  {ubicacion.fechaHoraGeolocalizacion}
                </div>
              </>
            ) : (
              "GPS pendiente. Puedes solicitar ubicación real o continuar sin coordenadas."
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
          disabled={navegando}
          {...feedbackBoton("validar")}
          style={{
            ...buttonStyle,
            color: "#08172d",
            background: navegando
              ? "rgba(255,255,255,0.18)"
              : "linear-gradient(135deg, #facc15, #f97316)",
            boxShadow: "0 14px 28px rgba(249,115,22,0.22)",
            opacity: navegando ? 0.72 : 1,
            ...estiloFeedback("validar"),
          }}
        >
          {navegando ? "Continuando..." : "Validar reporte"}
        </button>
      </div>
    </main>
  );
}
