"use client";
import { useEffect, useState } from "react";
import { Hallazgo } from "@/app/types/hallazgo";
import { useRouter } from "next/navigation";

export default function ReportarPage() {
  const router = useRouter();

 const [hallazgo, setHallazgo] = useState<Hallazgo>({
  id: 0,
  codigo: "",
  contexto: {
    empresa: "",
    obra: "",
    supervisor: "",
  },
  reporte: {
    area: "",
    responsable: "",
    fecha: "",
    descripcion: "",
    fotos: [],
  },
  bloque1: {
    tipoPeligro: "",
    tipoDesviacion: "",
    severidadPotencial: "",
    personasExpuestas: "",
    frecuenciaExposicion: "",
  },
  bloque2: {
    tareaEnEjecucion: "",
    peligroActivo: "",
    ocurrenciaInmediata: "",
    areaControlada: "",
    controlesVisibles: "",
    trabajoDetenido: "",
    repeticionInmediata: "",
  },
  bloque3: {
    existePTS: "",
    ptsVigente: "",
    trabajadorCapacitado: "",
    registroCapacitacion: "",
    charla5Minutos: "",
    existeASTIPER: "",
    riesgosIdentificados: "",
    permisosAplicables: "",
    permisosVigentes: "",
    supervisionInformada: "",
  },
  resultado: {
    puntajeBloque1: 0,
    puntajeBloque2: 0,
    puntajeBloque3: 0,
    puntajeFinal: 0,
    criticidad: "Bajo",
    prioridad: "Baja",
    recomendacion: "",
    accionInmediata: "",
  },
  estado: "Reportado",
});
  
const [capturandoGps, setCapturandoGps] = useState(false);
const [mensajeGps, setMensajeGps] = useState(
  "Captura la ubicación GPS para habilitar el guardado."
);
useEffect(() => {
  const frameId = window.requestAnimationFrame(() => {
    try {
      const usuarioGuardado = JSON.parse(
        localStorage.getItem("usuarioActivo") || "null"
      );

      if (!usuarioGuardado) return;

      const ahora = new Date();
      const fechaHoy = ahora.toISOString().split("T")[0];
      const horaHoy = ahora.toLocaleTimeString("es-CL", {
        hour: "2-digit",
        minute: "2-digit",
      });

      setHallazgo((prev: Hallazgo) =>
        ({
          ...prev,
          contexto: {
            empresa: usuarioGuardado.empresa || "",
            obra: usuarioGuardado.obra || "",
            supervisor: usuarioGuardado.nombre || "",
          },
          cargo: usuarioGuardado.cargo || "",
          reporte: {
            ...prev.reporte,
            responsable: usuarioGuardado.nombre || "",
            fecha: fechaHoy,
          },
          horaReporte: horaHoy,
          timestampReporte: ahora.toISOString(),
        }) as Hallazgo
      );
    } catch {}
  });

  return () => window.cancelAnimationFrame(frameId);
}, []);

  const handleImagenes = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files) return;

  const lista = Array.from(files).slice(0, 3);
  const urls = lista.map((file) => URL.createObjectURL(file));

 setHallazgo({
  ...hallazgo,
  reporte: {
    ...hallazgo.reporte,
    fotos: urls,
  },
});
};

const capturarUbicacionGps = () => {
  if (!("geolocation" in navigator)) {
    setMensajeGps(
      "No se pudo capturar la ubicación. Debes permitir el acceso a ubicación para guardar el hallazgo."
    );
    setHallazgo((prev) => ({
      ...prev,
      geolocalizacion: undefined,
    }));
    return;
  }

  setCapturandoGps(true);
  setMensajeGps("Solicitando ubicación del dispositivo...");

  navigator.geolocation.getCurrentPosition(
    (posicion) => {
      const geolocalizacion = {
        latitud: posicion.coords.latitude,
        longitud: posicion.coords.longitude,
        precisionGps: posicion.coords.accuracy,
        fechaHoraGeolocalizacion: new Date().toISOString(),
        estadoGeolocalizacion: "capturada" as const,
      };

      setHallazgo((prev) => ({
        ...prev,
        geolocalizacion,
      }));
      setMensajeGps("Ubicación capturada correctamente.");
      setCapturandoGps(false);
    },
    () => {
      setHallazgo((prev) => ({
        ...prev,
        geolocalizacion: undefined,
      }));
      setMensajeGps(
        "No se pudo capturar la ubicación. Debes permitir el acceso a ubicación para guardar el hallazgo."
      );
      setCapturandoGps(false);
    },
    {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 0,
    }
  );
};

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      hallazgo.geolocalizacion?.estadoGeolocalizacion !== "capturada" ||
      typeof hallazgo.geolocalizacion.latitud !== "number" ||
      typeof hallazgo.geolocalizacion.longitud !== "number"
    ) {
      alert(
        "No se pudo capturar la ubicación. Debes permitir el acceso a ubicación para guardar el hallazgo."
      );
      return;
    }

    const existentes = JSON.parse(localStorage.getItem("hallazgos") || "[]");

const correlativo = String(existentes.length + 1).padStart(4, "0");
	const codigo = `CE-${hallazgo.contexto?.obra || "OBRA"}/${hallazgo.contexto?.empresa || "EMPRESA"}-${correlativo}`;

const nuevoHallazgo = {
  ...hallazgo,
  id: Date.now(),
  codigo,
	  empresa: hallazgo.contexto?.empresa || "",
	obra: hallazgo.contexto?.obra || "",
	supervisor: hallazgo.contexto?.supervisor || "",
cargo: JSON.parse(localStorage.getItem("usuarioActivo") || "null")?.cargo || "",
  estado: "abierto",
  reporte: hallazgo.reporte,
  geolocalizacion: hallazgo.geolocalizacion,

  evaluacion: {
  respuestas: {},
},
};

    const actualizados = [...existentes, nuevoHallazgo];

    localStorage.setItem("hallazgos", JSON.stringify(actualizados));

   router.push("/evaluar/paso1"); 

   setHallazgo({
  ...hallazgo,
  reporte: {
    area: "",
    responsable: "",
    fecha: "",
    descripcion: "",
    fotos: [],
  },
  geolocalizacion: undefined,
});
  };
const inputStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "12px",
  border: "none",
  marginBottom: "12px",
  background: "rgba(255,255,255,0.1)",
	  color: "white",
	};

const obtenerSrcFoto = (foto: unknown) => {
  if (typeof foto === "string") return foto;
  if (foto && typeof foto === "object") {
    const evidencia = foto as {
      url?: string;
      src?: string;
      preview?: string;
      base64?: string;
      dataUrl?: string;
    };
    return (
      evidencia.url ||
      evidencia.src ||
      evidencia.preview ||
      evidencia.dataUrl ||
      evidencia.base64 ||
      ""
    );
  }

  return "";
};

	  return (
  <div
    style={{
      minHeight: "100vh",
      background: "#0b1f3a",
      display: "flex",
      justifyContent: "center",
      padding: "20px",
      color: "white",
    }}
  >
    <form
  onSubmit={handleSubmit}
  style={{
    width: "100%",
    maxWidth: "520px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  }}
>

      {/* TÍTULO */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <h1 style={{ marginBottom: "6px" }}>CRITERIO ESTRATÉGICO</h1>
        <p style={{ opacity: 0.7 }}>Reporte de Hallazgo</p>
      </div>

      {/* TARJETA */}
      <div
        style={{
          background: "rgba(50,110,210,0.25)",
          padding: "22px",
          borderRadius: "18px",
          backdropFilter: "blur(10px)",
        }}
      >

       <h2
  style={{
    marginBottom: "20px",
    textAlign: "center",
    fontSize: "22px",
    fontWeight: 700,
  }}
>
  Reportar Hallazgo
</h2>
        {/* INPUTS */}
        <label style={{ fontSize: "13px", opacity: 0.7 }}>
  Área
</label>

        <input
          type="text"
          placeholder="Área (ej: Oficina, Planta, Bodega)"
	          value={hallazgo.reporte?.area || ""}
          onChange={(e) =>
            setHallazgo({
              ...hallazgo,
              reporte: {
	                ...(hallazgo.reporte ?? {}),
                area: e.target.value,
              },
            })
          }
          required
          style={inputStyle}
        />
<label style={{ fontSize: "13px", opacity: 0.7 }}>
  Responsable 
</label>

        <input
  type="text"
	  value={hallazgo.reporte?.responsable || ""}
  readOnly
  style={{ ...inputStyle, opacity: 0.9 }}
/>

<label style={{ fontSize: "13px", opacity: 0.7 }}>
  Fecha
</label>

<input
  type="text"
	  value={hallazgo.reporte?.fecha || ""}
  readOnly
  style={{ ...inputStyle, opacity: 0.9 }}
/>

<label style={{ fontSize: "13px", opacity: 0.7 }}>
  Hora del reporte
</label>

<input
  type="text"
	  value={hallazgo.horaReporte || ""}
  readOnly
  style={{ ...inputStyle, opacity: 0.9 }}
/>
<label style={{ fontSize: "13px", opacity: 0.7 }}>
  Descripción 
</label>

        <textarea
          placeholder="Descripción del hallazgo"
	          value={hallazgo.reporte?.descripcion || ""}
          onChange={(e) =>
            setHallazgo({
              ...hallazgo,
              reporte: {
	                ...(hallazgo.reporte ?? {}),
                descripcion: e.target.value,
              },
            })
          }
          required
          style={{ ...inputStyle, height: "100px" }}
        />

        {/* BOTÓN */}
        <label style={{ fontSize: "13px", opacity: 0.7 }}>
  Evidencia fotográfica
</label>

<label
  style={{
    display: "block",
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.10)",
    color: "white",
    textAlign: "center",
    cursor: "pointer",
    marginBottom: "12px",
  }}
>
  📷 Agregar evidencia
  <input
    type="file"
    accept="image/*"
    multiple
    onChange={handleImagenes}
    style={{ display: "none" }}
  />
</label>

	{(hallazgo.reporte?.fotos?.length ?? 0) > 0 && (
  <div
    style={{
      display: "flex",
      gap: "10px",
      flexWrap: "wrap",
      marginBottom: "12px",
    }}
  >
	    {(hallazgo.reporte?.fotos ?? []).map((img, i) => (
	      <img
	        key={i}
	        src={obtenerSrcFoto(img)}
        alt={`Foto ${i + 1}`}
        style={{
          width: "90px",
          height: "90px",
          objectFit: "cover",
          borderRadius: "12px",
          border: "1px solid rgba(255,255,255,0.25)",
        }}
      />
    ))}
  </div>
)}

<div
  style={{
    padding: "16px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.09)",
    border: "1px solid rgba(255,255,255,0.14)",
    marginBottom: "12px",
  }}
>
  <div
    style={{
      fontSize: "16px",
      fontWeight: 800,
      marginBottom: "8px",
    }}
  >
    Ubicación del hallazgo
  </div>

  <p
    style={{
      margin: "0 0 12px",
      fontSize: "13px",
      lineHeight: 1.45,
      opacity: 0.78,
    }}
  >
    La ubicación GPS es obligatoria para guardar y evaluar el hallazgo.
  </p>

  <button
    type="button"
    onClick={capturarUbicacionGps}
    disabled={capturandoGps}
    style={{
      width: "100%",
      padding: "13px",
      borderRadius: "13px",
      border: "1px solid rgba(96,165,250,0.35)",
      background: capturandoGps
        ? "rgba(148,163,184,0.35)"
        : "linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%)",
      color: "white",
      fontSize: "15px",
      fontWeight: 800,
      cursor: capturandoGps ? "not-allowed" : "pointer",
      marginBottom: "12px",
    }}
  >
    {capturandoGps ? "Capturando ubicación..." : "Capturar ubicación GPS"}
  </button>

  <div
    style={{
      fontSize: "13px",
      lineHeight: 1.5,
      color:
        hallazgo.geolocalizacion?.estadoGeolocalizacion === "capturada"
          ? "#bbf7d0"
          : "#fecaca",
      fontWeight: 700,
    }}
  >
    {mensajeGps}
  </div>

  {hallazgo.geolocalizacion?.estadoGeolocalizacion === "capturada" && (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "8px",
        marginTop: "12px",
        fontSize: "12px",
      }}
    >
      <div>
        <div style={{ opacity: 0.68, marginBottom: "3px" }}>Latitud</div>
        <strong>{hallazgo.geolocalizacion.latitud.toFixed(6)}</strong>
      </div>
      <div>
        <div style={{ opacity: 0.68, marginBottom: "3px" }}>Longitud</div>
        <strong>{hallazgo.geolocalizacion.longitud.toFixed(6)}</strong>
      </div>
      <div style={{ gridColumn: "1 / -1" }}>
        <div style={{ opacity: 0.68, marginBottom: "3px" }}>
          Precisión aproximada
        </div>
        <strong>
          {typeof hallazgo.geolocalizacion.precisionGps === "number"
            ? `${Math.round(hallazgo.geolocalizacion.precisionGps)} metros`
            : "No informada"}
        </strong>
      </div>
    </div>
  )}
</div>

       <button
  type="submit"
  disabled={hallazgo.geolocalizacion?.estadoGeolocalizacion !== "capturada"}
  style={{
    marginTop: "10px",
    width: "100%",
    padding: "14px",
    borderRadius: "14px",
    background:
      hallazgo.geolocalizacion?.estadoGeolocalizacion === "capturada"
        ? "linear-gradient(90deg, #22c55e, #4ade80)"
        : "linear-gradient(90deg, #64748b, #94a3b8)",
    color: "#052e16",
    border: "none",
    fontSize: "16px",
    fontWeight: 700,
    cursor:
      hallazgo.geolocalizacion?.estadoGeolocalizacion === "capturada"
        ? "pointer"
        : "not-allowed",
    boxShadow: "0 10px 30px rgba(34,197,94,0.3)"
  }}
>
  Guardar y Evaluar
</button>

      </div>
    </form>
  </div>
);
}
