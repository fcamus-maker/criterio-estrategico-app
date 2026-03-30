"use client";

import { useState } from "react";

export default function ReportarPage() {
  const [area, setArea] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagenes, setImagenes] = useState<string[]>([]);
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
const [responsable, setResponsable] = useState("");
const [tipoRiesgo, setTipoRiesgo] = useState("");

  const handleImagenes = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files) return;

  const lista = Array.from(files).slice(0, 3);
  const urls = lista.map((file) => URL.createObjectURL(file));

  setImagenes(urls);
};

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nuevoHallazgo = {
      id: Date.now(),
      area,
      descripcion,
      fecha,
      estado: "abierto",
    };

    const existentes = JSON.parse(localStorage.getItem("hallazgos") || "[]");
    const actualizados = [...existentes, nuevoHallazgo];

    localStorage.setItem("hallazgos", JSON.stringify(actualizados));

    alert("Hallazgo guardado correctamente");

    setArea("");
    setDescripcion("");
    setImagenes([]);
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b1e3c",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial, sans-serif",
        padding: "20px",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: "520px",
          background: "rgba(50, 110, 210, 0.2)",
          padding: "24px",
          borderRadius: "18px",
          backdropFilter: "blur(8px)",
        }}
      >
        <h2 style={{ marginBottom: "20px", textAlign: "center" }}>
          Reportar Hallazgo
        </h2>

      <input
  type="text"
  placeholder="Área (ej: Bodega, Planta, Oficina)"
  value={area}
  onChange={(e) => setArea(e.target.value)}
  required
  style={{
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "10px",
    border: "none"
  }}
/>

<input
  type="text"
  placeholder="Responsable (ej: Juan Pérez)"
  value={responsable}
  onChange={(e) => setResponsable(e.target.value)}
  required
  style={{
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "10px",
    border: "none"
  }}
/>

<input
  type="date"
  value={fecha}
  onChange={(e) => setFecha(e.target.value)}
  required
  style={{
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "10px",
    border: "none",
  }}
/>


        <textarea
          placeholder="Describe el hallazgo..."
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "12px",
            height: "120px",
            marginBottom: "15px",
            borderRadius: "10px",
            border: "none",
            resize: "vertical",
          }}
        />

       <label
  style={{
    display: "block",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    padding: "14px",
    borderRadius: "12px",
    textAlign: "center",
    cursor: "pointer",
    marginBottom: "15px",
    fontWeight: "bold",
  }}
>
  📸 Agregar evidencia

  <input
    type="file"
    accept="image/*"
    capture="environment"
    multiple
    onChange={handleImagenes}
    style={{ display: "none" }}
  />
  {imagenes.length > 0 && (
  <div style={{
    marginBottom: "10px",
    fontSize: "13px",
    opacity: 0.8
  }}>
    📷 {imagenes.length} foto(s) cargada(s)
  </div>
)}
</label>

        <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
          {imagenes.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Foto ${i + 1}`}
              style={{
                width: "90px",
                height: "90px",
                objectFit: "cover",
                borderRadius: "10px",
                border: "2px solid rgba(255,255,255,0.2)",
              }}
            />
          ))}
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "16px",
            background: "#73f38d",
            border: "none",
            borderRadius: "12px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Guardar Hallazgo
        </button>
      </form>
    </main>
  );
}