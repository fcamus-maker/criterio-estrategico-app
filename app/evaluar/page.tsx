"use client";

import { useEffect, useState } from "react";
import { Hallazgo } from "../types/hallazgo";

export default function EvaluarPage() {
  const [hallazgo, setHallazgo] = useState<Hallazgo | null>(null);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("hallazgos") || "[]");
    if (data.length > 0) {
      setHallazgo(data[data.length - 1]);
    }
  }, []);

  const calcularRiesgo = () => {
    if (!hallazgo) return null;

    const descripcion = hallazgo.reporte.descripcion.toLowerCase();
    let puntaje = 0;

    if (descripcion.includes("emergencia")) puntaje += 5;
    if (descripcion.includes("riesgo")) puntaje += 3;
    if (descripcion.includes("caída")) puntaje += 4;
    if (descripcion.includes("eléctrico")) puntaje += 5;
    if (descripcion.includes("químico")) puntaje += 5;
    if (descripcion.includes("obstrucción")) puntaje += 4;
    if (descripcion.includes("radioactividad")) puntaje += 5;
    if (descripcion.includes("incendio")) puntaje += 5;

    let nivel = "Bajo";
    let accion = "Monitorear y mantener control.";
    let prioridad = "Baja";

    if (puntaje >= 8) {
      nivel = "Crítico";
      accion = "Detener operación inmediata y aislar el área.";
      prioridad = "Urgente";
    } else if (puntaje >= 5) {
      nivel = "Alto";
      accion = "Corregir a la brevedad y aplicar control inmediato.";
      prioridad = "Alta";
    } else if (puntaje >= 3) {
      nivel = "Medio";
      accion = "Programar corrección y seguimiento.";
      prioridad = "Media";
    }

    return { nivel, accion, prioridad, puntaje };
  };

  const riesgoCalculado = calcularRiesgo();

  const colorRiesgo =
    riesgoCalculado?.nivel === "Crítico"
      ? "#ff1f1f"
      : riesgoCalculado?.nivel === "Alto"
      ? "#ff4d4f"
      : riesgoCalculado?.nivel === "Medio"
      ? "#faad14"
      : "#52c41a";

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
      <div style={{ width: "100%", maxWidth: "520px" }}>
        <h2 style={{ marginBottom: "20px", textAlign: "center" }}>
          Evaluación de Hallazgo
        </h2>

        {hallazgo && (
          <>
            <div style={{ marginBottom: "20px", fontSize: "14px", opacity: 0.95 }}>
              <p>
                <strong>Área:</strong> {hallazgo.reporte.area}
              </p>
              <p>
                <strong>Responsable:</strong> {hallazgo.reporte.responsable}
              </p>
              <p>
                <strong>Fecha:</strong> {hallazgo.reporte.fecha}
              </p>
              <p>
                <strong>Descripción:</strong> {hallazgo.reporte.descripcion}
              </p>
            </div>

            <div
              style={{
                width: "100%",
                background: "rgba(50, 110, 210, 0.20)",
                padding: "18px",
                borderRadius: "18px",
                backdropFilter: "blur(8px)",
                marginBottom: "16px",
              }}
            >
              <h3 style={{ marginBottom: "14px" }}>Resumen del Hallazgo</h3>

              <p style={{ marginBottom: "16px", lineHeight: 1.5 }}>
                {hallazgo.reporte.descripcion || "Sin descripción"}
              </p>

              {hallazgo.reporte.fotos?.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    marginBottom: "16px",
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

              <div
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.08)",
                  padding: "20px",
                  borderRadius: "18px",
                  backdropFilter: "blur(10px)",
                  marginTop: "20px",
                }}
              >
                <h3 style={{ marginBottom: "16px", textAlign: "center" }}>
                  Evaluación de Riesgo
                </h3>

                <div style={{ textAlign: "center", marginBottom: "16px" }}>
                  <p style={{ fontSize: "14px", opacity: 0.7 }}>Nivel detectado</p>

                  <p
                    style={{
                      fontSize: "28px",
                      fontWeight: 800,
                      color: colorRiesgo,
                      marginTop: "4px",
                    }}
                  >
                    {riesgoCalculado?.nivel}
                  </p>
                </div>

                <div
                  style={{
                    background: "rgba(0,0,0,0.25)",
                    padding: "14px",
                    borderRadius: "12px",
                    textAlign: "center",
                    marginBottom: "12px",
                  }}
                >
                  <p style={{ fontSize: "13px", opacity: 0.7 }}>Acción recomendada</p>
                  <p style={{ fontSize: "15px", fontWeight: 600 }}>
                    {riesgoCalculado?.accion}
                  </p>
                </div>

                <div
                  style={{
                    background: "rgba(0,0,0,0.18)",
                    padding: "12px",
                    borderRadius: "12px",
                    textAlign: "center",
                  }}
                >
                  <p style={{ fontSize: "13px", opacity: 0.75 }}>
                    Prioridad: <strong>{riesgoCalculado?.prioridad}</strong>
                  </p>
                </div>
              </div>

              <button
  onClick={async () => {
    const { error } = await supabase.from("hallazgos").insert([
      {
        area: "Prueba",
        responsable: "Freddy",
        descripcion: "Prueba desde app",
        fecha: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error(error);
      alert("Error al guardar");
    } else {
      alert("Guardado correctamente");
      window.location.href = "/";
    }
  }}
>
  Guardar prueba
</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}