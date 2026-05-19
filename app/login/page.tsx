"use client";

import { useState } from "react";
import {
  enviarMagicLinkCE,
  iniciarSesionConPasswordCE,
  obtenerAuthProfileActual,
} from "@/app/services/authProfileService";
import {
  resolvePlatformLanguage,
  resolvePlatformTheme,
  usePlatformPreferences,
} from "@/app/services/platformPreferences";

const loginTextsEn: Record<string, string> = {
  "Acceso CE": "CE Access",
  "Login preparado para pruebas controladas. No bloquea app móvil ni panel.": "Login ready for controlled testing. It does not block the mobile app or dashboard.",
  Contraseña: "Password",
  "Ocultar contraseña": "Hide password",
  "Mostrar contraseña": "Show password",
  Ocultar: "Hide",
  Ver: "Show",
  "Validando...": "Validating...",
  Entrar: "Enter",
  "Enviar magic link": "Send magic link",
};

export default function LoginPage() {
  const preferencias = usePlatformPreferences();
  const temaClaro = resolvePlatformTheme(preferencias.theme) === "light";
  const idiomaActivo = resolvePlatformLanguage(preferencias.language);
  const t = (texto: string) =>
    idiomaActivo === "en" ? loginTextsEn[texto] || texto : texto;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
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
        background: temaClaro
          ? "linear-gradient(135deg, #f8fafc 0%, #eaf2ff 100%)"
          : "#07111f",
        color: temaClaro ? "#0f172a" : "white",
        fontFamily: "Arial, sans-serif",
        padding: "24px",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "420px",
          border: temaClaro
            ? "1px solid rgba(100,116,139,0.22)"
            : "1px solid rgba(255,255,255,0.14)",
          borderRadius: "18px",
          background: temaClaro ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.08)",
          boxShadow: temaClaro
            ? "0 24px 48px rgba(15,23,42,0.12)"
            : "0 24px 48px rgba(0,0,0,0.28)",
          padding: "22px",
        }}
      >
        <h1 style={{ margin: "0 0 8px", fontSize: "24px" }}>{t("Acceso CE")}</h1>
        <p style={{ margin: "0 0 18px", color: temaClaro ? "#475569" : "rgba(255,255,255,0.72)" }}>
          {t("Login preparado para pruebas controladas. No bloquea app móvil ni panel.")}
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
                border: temaClaro ? "1px solid rgba(100,116,139,0.26)" : "1px solid rgba(255,255,255,0.18)",
                background: temaClaro ? "#f8fafc" : "rgba(255,255,255,0.10)",
                color: temaClaro ? "#0f172a" : "white",
                padding: "12px",
                fontSize: "15px",
              }}
            />
          </label>

          <label style={{ display: "grid", gap: "6px", fontWeight: 800 }}>
            {t("Contraseña")}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                alignItems: "stretch",
                borderRadius: "12px",
                border: temaClaro ? "1px solid rgba(100,116,139,0.26)" : "1px solid rgba(255,255,255,0.18)",
                background: temaClaro ? "#f8fafc" : "rgba(255,255,255,0.10)",
                overflow: "hidden",
              }}
            >
              <input
                value={password}
                type={mostrarPassword ? "text" : "password"}
                autoComplete="current-password"
                onChange={(event) => setPassword(event.target.value)}
                style={{
                  minWidth: 0,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  color: temaClaro ? "#0f172a" : "white",
                  padding: "12px",
                  fontSize: "15px",
                }}
              />
              <button
                type="button"
                aria-label={
                  mostrarPassword ? t("Ocultar contraseña") : t("Mostrar contraseña")
                }
                onClick={() => setMostrarPassword((actual) => !actual)}
                style={{
                  border: "none",
                  borderLeft: temaClaro ? "1px solid rgba(100,116,139,0.22)" : "1px solid rgba(255,255,255,0.14)",
                  background: temaClaro ? "#e2e8f0" : "rgba(255,255,255,0.10)",
                  color: temaClaro ? "#0f172a" : "white",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: 900,
                  padding: "0 12px",
                  minWidth: "74px",
                }}
              >
                {mostrarPassword ? t("Ocultar") : t("Ver")}
              </button>
            </div>
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
            {cargando ? t("Validando...") : t("Entrar")}
          </button>

          <button
            type="button"
            onClick={enviarMagic}
            disabled={cargando}
            style={{
              border: temaClaro ? "1px solid rgba(100,116,139,0.24)" : "1px solid rgba(255,255,255,0.18)",
              borderRadius: "12px",
              background: temaClaro ? "#f8fafc" : "rgba(255,255,255,0.10)",
              color: temaClaro ? "#0f172a" : "white",
              cursor: "pointer",
              fontWeight: 900,
              padding: "12px",
              opacity: cargando ? 0.7 : 1,
            }}
          >
            {t("Enviar magic link")}
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
