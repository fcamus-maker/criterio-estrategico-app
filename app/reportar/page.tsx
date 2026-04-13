"use client";
import { useState } from "react";
import { Hallazgo } from "@/types/hallazgo";
import { useRouter } from "next/navigation";

export default function ReportarPage() {
  const router = useRouter();
  const [hallazgo, setHallazgo] = useState<Hallazgo>({
  id: "",
  codigo: "",
  contexto: {
    empresa: "TN",
    obra: "PEPM",
    supervisor: "Freddy Camus",
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
  
const [tipoRiesgo, setTipoRiesgo] = useState("");

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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const existentes = JSON.parse(localStorage.getItem("hallazgos") || "[]");

const correlativo = String(existentes.length + 1).padStart(4, "0");
const codigo = `CE-${hallazgo.contexto.obra}/${hallazgo.contexto.empresa}-${correlativo}`;

const nuevoHallazgo = {
  ...hallazgo,
  id: Date.now(),
  codigo,
  estado: "abierto",
  reporte: hallazgo.reporte,

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
          value={hallazgo?.reporte.area || ""}
          onChange={(e) =>
            setHallazgo({
              ...hallazgo,
              reporte: {
                ...hallazgo.reporte,
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
          placeholder="Responsable"
          value={hallazgo?.reporte.responsable || ""}
          onChange={(e) =>
            setHallazgo({
              ...hallazgo,
              reporte: {
                ...hallazgo.reporte,
                responsable: e.target.value,
              },
            })
          }
          required
          style={inputStyle}
        />
<label style={{ fontSize: "13px", opacity: 0.7 }}>
  Fecha 
</label>

        <input
          type="date"
          value={hallazgo?.reporte.fecha || ""}
          onChange={(e) =>
            setHallazgo({
              ...hallazgo,
              reporte: {
                ...hallazgo.reporte,
                fecha: e.target.value,
              },
            })
          }
          required
          style={inputStyle}
        />
<label style={{ fontSize: "13px", opacity: 0.7 }}>
  Descripción 
</label>

        <textarea
          placeholder="Descripción del hallazgo"
          value={hallazgo?.reporte.descripcion || ""}
          onChange={(e) =>
            setHallazgo({
              ...hallazgo,
              reporte: {
                ...hallazgo.reporte,
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

{hallazgo?.reporte.fotos?.length > 0 && (
  <div
    style={{
      display: "flex",
      gap: "10px",
      flexWrap: "wrap",
      marginBottom: "12px",
    }}
  >
    {hallazgo.reporte.fotos.map((img, i) => (
      <img
        key={i}
        src={img}
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
       <button
  type="submit"
  style={{
    marginTop: "10px",
    width: "100%",
    padding: "14px",
    borderRadius: "14px",
    background: "linear-gradient(90deg, #22c55e, #4ade80)",
    color: "#052e16",
    border: "none",
    fontSize: "16px",
    fontWeight: 700,
    cursor: "pointer",
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