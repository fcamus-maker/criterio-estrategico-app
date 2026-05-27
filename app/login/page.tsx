"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  iniciarSesionConPasswordCE,
  obtenerAuthProfileActual,
} from "@/app/services/authProfileService";
import type { RoleCE } from "@/app/types/authRoles";
import PwaInstallCard from "@/app/components/PwaInstallCard";

const LOGIN_DRAFT_STORAGE_KEY = "ce_login_draft";

type LoginDraft = {
  email: string;
  password: string;
};

function leerLoginDraft(): LoginDraft | null {
  if (typeof window === "undefined") return null;

  try {
    const draft = JSON.parse(
      window.sessionStorage.getItem(LOGIN_DRAFT_STORAGE_KEY) || "null"
    );

    if (!draft || typeof draft !== "object") return null;

    return {
      email: String((draft as Partial<LoginDraft>).email || ""),
      password: String((draft as Partial<LoginDraft>).password || ""),
    };
  } catch {
    return null;
  }
}

function guardarLoginDraft(draft: LoginDraft) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(LOGIN_DRAFT_STORAGE_KEY, JSON.stringify(draft));
}

function limpiarLoginDraft() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(LOGIN_DRAFT_STORAGE_KEY);
}

function rutaPorRol(rol?: RoleCE | null) {
  switch (rol) {
    case "supervisor_reportante":
    case "prevencionista_cliente":
      return "/evaluar-v2";
    case "super_admin_ce":
    case "admin_cliente":
    case "admin_mandante":
    case "responsable_cierre":
    case "visualizador_auditor":
      return "/panel";
    default:
      return "";
  }
}

export default function LoginPage() {
  const router = useRouter();
  const t = (texto: string) => texto;
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const passwordInputRef = useRef<HTMLInputElement | null>(null);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const draft = leerLoginDraft();
    const emailInput = emailInputRef.current;
    const passwordInput = passwordInputRef.current;

    if (draft) {
      if (emailInput) emailInput.value = draft.email;
      if (passwordInput) passwordInput.value = draft.password;
    }

    const guardarDesdeDom = () => {
      guardarLoginDraft({
        email: emailInput?.value || "",
        password: passwordInput?.value || "",
      });
    };

    emailInput?.addEventListener("input", guardarDesdeDom);
    passwordInput?.addEventListener("input", guardarDesdeDom);

    return () => {
      emailInput?.removeEventListener("input", guardarDesdeDom);
      passwordInput?.removeEventListener("input", guardarDesdeDom);
    };
  }, []);

  const guardarBorradorActual = () => {
    guardarLoginDraft({
      email: emailInputRef.current?.value || "",
      password: passwordInputRef.current?.value || "",
    });
  };

  const enviarPassword = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (cargando) return;

    setCargando(true);
    setMensaje("");
    const email = emailInputRef.current?.value.trim() || "";
    const password = passwordInputRef.current?.value || "";
    guardarLoginDraft({ email, password });

    const resultado = await iniciarSesionConPasswordCE(email, password);

    if (!resultado.ok) {
      setMensaje(`Login pendiente: ${resultado.error}`);
      setCargando(false);
      return;
    }

    const estado = await obtenerAuthProfileActual();
    const ruta = rutaPorRol(estado.perfil?.rol);

    if (estado.perfil?.activo && ruta) {
      limpiarLoginDraft();
      setMensaje(`Sesión iniciada: ${estado.perfil.nombre}. Redirigiendo...`);
      router.replace(ruta);
      return;
    }

    setMensaje(
      estado.perfil
        ? "Sesión iniciada, pero el rol no tiene una ruta asignada. Contacte al administrador."
        : "Sesión iniciada. Perfil pendiente de configurar."
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
        <h1 style={{ margin: "0 0 8px", fontSize: "24px" }}>{t("Acceso CE")}</h1>
        <p style={{ margin: "0 0 18px", color: "rgba(255,255,255,0.72)" }}>
          {t("Login preparado para pruebas controladas. No bloquea app móvil ni panel.")}
        </p>

        <form onSubmit={enviarPassword} style={{ display: "grid", gap: "12px" }}>
          <label style={{ display: "grid", gap: "6px", fontWeight: 800 }}>
            Email
            <input
              ref={emailInputRef}
              type="email"
              autoComplete="email"
              defaultValue=""
              onInput={guardarBorradorActual}
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
            {t("Contraseña")}
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
                ref={passwordInputRef}
                type={mostrarPassword ? "text" : "password"}
                autoComplete="current-password"
                defaultValue=""
                onInput={guardarBorradorActual}
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
                  mostrarPassword ? t("Ocultar contraseña") : t("Mostrar contraseña")
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
                {mostrarPassword ? t("Ocultar") : t("Ver")}
              </button>
            </div>
          </label>

          <button
            type="submit"
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
        </form>

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

        <div style={{ marginTop: "14px" }}>
          <PwaInstallCard theme="dark" />
        </div>
      </section>
    </main>
  );
}
