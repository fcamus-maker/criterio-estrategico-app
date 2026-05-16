"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  iniciarSesionConPasswordCE,
  obtenerAuthProfileActual,
} from "@/app/services/authProfileService";
import {
  destinoPorRolCE,
  rolPuedeEntrarZonaCE,
} from "@/app/services/authAccess";
import type { ProfileCE } from "@/app/types/authRoles";

function destinoSeguroDespuesLogin(perfil: ProfileCE) {
  if (typeof window === "undefined") return destinoPorRolCE(perfil.rol);

  const params = new URLSearchParams(window.location.search);
  const redirectTo = params.get("redirectTo") || "";

  if (redirectTo.startsWith("/panel") && rolPuedeEntrarZonaCE(perfil.rol, "panel")) {
    return redirectTo;
  }

  if (
    redirectTo.startsWith("/evaluar-v2") &&
    rolPuedeEntrarZonaCE(perfil.rol, "evaluar-v2")
  ) {
    return redirectTo;
  }

  return destinoPorRolCE(perfil.rol);
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const redirigirDespuesLogin = useCallback((destino: string) => {
    router.replace(destino);

    window.setTimeout(() => {
      const rutaDestino = destino.split("?")[0] || destino;
      if (window.location.pathname !== rutaDestino) {
        window.location.assign(destino);
      }
    }, 450);
  }, [router]);

  useEffect(() => {
    let activo = true;

    async function redirigirSiHaySesion() {
      const estado = await obtenerAuthProfileActual();
      if (!activo || !estado.perfil) return;
      redirigirDespuesLogin(destinoSeguroDespuesLogin(estado.perfil));
    }

    redirigirSiHaySesion();

    return () => {
      activo = false;
    };
  }, [redirigirDespuesLogin]);

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

    if (!estado.perfil) {
      setMensaje(
        "Usuario autenticado, pero sin perfil configurado. Contacte al administrador."
      );
      setCargando(false);
      return;
    }

    setMensaje(`Sesión iniciada: ${estado.perfil.nombre}`);
    redirigirDespuesLogin(destinoSeguroDespuesLogin(estado.perfil));
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
          Acceso único para demo controlada. El destino se asigna según rol.
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
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                alignItems: "stretch",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.10)",
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
                  color: "white",
                  padding: "12px",
                  fontSize: "15px",
                }}
              />
              <button
                type="button"
                aria-label={
                  mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                onClick={() => setMostrarPassword((actual) => !actual)}
                style={{
                  border: "none",
                  borderLeft: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(255,255,255,0.10)",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: 900,
                  padding: "0 12px",
                  minWidth: "74px",
                }}
              >
                {mostrarPassword ? "Ocultar" : "Ver"}
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
            {cargando ? "Validando..." : "Entrar"}
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
