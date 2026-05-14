"use client";

import { useState } from "react";
import {
  enviarMagicLinkCE,
  iniciarSesionConPasswordCE,
  obtenerAuthProfileActual,
} from "@/app/services/authProfileService";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const enviarPassword = async () => {
    if (cargando) return;

    setCargando(true);
    setMensaje("");
    const resultado = await iniciarSesionConPasswordCE(email.trim(), password);

    if (!resultado.ok) {
      setMensaje(`Login pendiente: ${resultado.error}`);
      setCargando(false);
      return;
    }

    const estado = await obtenerAuthProfileActual();
    setMensaje(
      estado.perfil
        ? `Sesión iniciada: ${estado.perfil.nombre}`
        : "Sesión iniciada. Perfil pendiente de crear en Supabase."
    );
    setCargando(false);
  };

  const enviarMagic = async () => {
    if (cargando) return;

    setCargando(true);
    setMensaje("");
    const resultado = await enviarMagicLinkCE(email.trim());

    setMensaje(
      resultado.ok
        ? "Magic link enviado si el correo está habilitado en Supabase Auth."
        : `Magic link pendiente: ${resultado.error}`
    );
    setCargando(false);
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#07111f",
        color: "white",
        fontFamily: "Arial, sans-serif",
        padding: "24px",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "420px",
          border: "1px solid rgba(255,255,255,0.14)",
          borderRadius: "18px",
          background: "rgba(255,255,255,0.08)",
          boxShadow: "0 24px 48px rgba(0,0,0,0.28)",
          padding: "22px",
        }}
      >
        <h1 style={{ margin: "0 0 8px", fontSize: "24px" }}>Acceso CE</h1>
        <p style={{ margin: "0 0 18px", color: "rgba(255,255,255,0.72)" }}>
          Login preparado para pruebas controladas. No bloquea app móvil ni panel.
        </p>

        <div style={{ display: "grid", gap: "12px" }}>
          <label style={{ display: "grid", gap: "6px", fontWeight: 800 }}>
            Email
            <input
              value={email}
              type="email"
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              style={{
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.10)",
                color: "white",
                padding: "12px",
                fontSize: "15px",
              }}
            />
          </label>

          <label style={{ display: "grid", gap: "6px", fontWeight: 800 }}>
            Contraseña
            <input
              value={password}
              type="password"
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
              style={{
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.10)",
                color: "white",
                padding: "12px",
                fontSize: "15px",
              }}
            />
          </label>

          <button
            type="button"
            onClick={enviarPassword}
            disabled={cargando}
            style={{
              border: "none",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #facc15, #f97316)",
              color: "#07111f",
              cursor: "pointer",
              fontWeight: 900,
              padding: "12px",
              opacity: cargando ? 0.7 : 1,
            }}
          >
            {cargando ? "Validando..." : "Entrar"}
          </button>

          <button
            type="button"
            onClick={enviarMagic}
            disabled={cargando}
            style={{
              border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.10)",
              color: "white",
              cursor: "pointer",
              fontWeight: 900,
              padding: "12px",
              opacity: cargando ? 0.7 : 1,
            }}
          >
            Enviar magic link
          </button>
        </div>

        {mensaje && (
          <div
            style={{
              marginTop: "14px",
              borderRadius: "12px",
              background: "rgba(34,197,94,0.14)",
              border: "1px solid rgba(34,197,94,0.24)",
              padding: "10px 12px",
              fontSize: "13px",
              fontWeight: 800,
              lineHeight: 1.35,
            }}
          >
            {mensaje}
          </div>
        )}
      </section>
    </main>
  );
}
