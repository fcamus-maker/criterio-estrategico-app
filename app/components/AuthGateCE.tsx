"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { obtenerAuthProfileActual } from "@/app/services/authProfileService";
import {
  destinoPorRolCE,
  rolEsAppMovilCE,
  rolPuedeEntrarZonaCE,
  type ZonaAccesoCE,
} from "@/app/services/authAccess";
import type { ProfileCE } from "@/app/types/authRoles";

type EstadoGate =
  | { tipo: "verificando" }
  | { tipo: "ok"; perfil: ProfileCE }
  | { tipo: "bloqueado-pc" }
  | { tipo: "bloqueado-app-escritorio" }
  | { tipo: "sin-perfil"; mensaje: string };

type AuthGateCEProps = {
  zona: ZonaAccesoCE;
  children: ReactNode;
};

function pantallaEstado(mensaje: string, detalle?: string) {
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
          borderRadius: "18px",
          border: "1px solid rgba(255,255,255,0.14)",
          background: "rgba(255,255,255,0.08)",
          boxShadow: "0 24px 48px rgba(0,0,0,0.28)",
          padding: "22px",
          lineHeight: 1.45,
        }}
      >
        <div style={{ fontSize: "18px", fontWeight: 900, marginBottom: "8px" }}>
          {mensaje}
        </div>
        {detalle && (
          <div style={{ color: "rgba(255,255,255,0.72)", fontSize: "14px" }}>
            {detalle}
          </div>
        )}
      </section>
    </main>
  );
}

function pantallaBloqueoPC() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background:
          "radial-gradient(circle at 50% 0%, rgba(250,204,21,0.20), transparent 34%), linear-gradient(145deg, #07111f 0%, #111827 52%, #030712 100%)",
        color: "white",
        fontFamily: "Arial, sans-serif",
        padding: "24px",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "420px",
          borderRadius: "18px",
          border: "1px solid rgba(255,255,255,0.14)",
          background: "rgba(255,255,255,0.08)",
          boxShadow: "0 24px 48px rgba(0,0,0,0.28)",
          padding: "24px",
          textAlign: "center",
          lineHeight: 1.35,
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width: "76px",
            height: "76px",
            margin: "0 auto 18px",
            borderRadius: "18px",
            border: "1px solid rgba(250,204,21,0.34)",
            background: "rgba(250,204,21,0.14)",
            display: "grid",
            placeItems: "center",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "32px",
              height: "27px",
              borderRadius: "8px",
              background: "#facc15",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: "7px",
                top: "-20px",
                width: "18px",
                height: "23px",
                border: "5px solid #facc15",
                borderBottom: "none",
                borderRadius: "18px 18px 0 0",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>
        <h1
          style={{
            margin: 0,
            fontSize: "22px",
            fontWeight: 950,
            letterSpacing: 0,
          }}
        >
          Esta sección está disponible solo desde computador.
        </h1>
        <button
          type="button"
          onClick={() => {
            window.location.href = "/login";
          }}
          style={{
            marginTop: "20px",
            border: "none",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #facc15, #f97316)",
            color: "#07111f",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 900,
            padding: "12px 16px",
            width: "100%",
          }}
        >
          Volver al login
        </button>
      </section>
    </main>
  );
}

function pantallaBloqueoAppMovil() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background:
          "radial-gradient(circle at 50% 0%, rgba(59,130,246,0.22), transparent 34%), linear-gradient(145deg, #07111f 0%, #0f1e35 52%, #030712 100%)",
        color: "white",
        fontFamily: "Arial, sans-serif",
        padding: "24px",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "440px",
          borderRadius: "18px",
          border: "1px solid rgba(147,197,253,0.24)",
          background: "rgba(255,255,255,0.08)",
          boxShadow: "0 24px 48px rgba(0,0,0,0.30)",
          padding: "24px",
          textAlign: "center",
          lineHeight: 1.4,
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width: "76px",
            height: "76px",
            margin: "0 auto 18px",
            borderRadius: "22px",
            border: "1px solid rgba(96,165,250,0.36)",
            background: "rgba(37,99,235,0.18)",
            display: "grid",
            placeItems: "center",
            color: "#bfdbfe",
            fontSize: "34px",
            fontWeight: 950,
          }}
        >
          CE
        </div>
        <h1
          style={{
            margin: 0,
            fontSize: "22px",
            fontWeight: 950,
            letterSpacing: 0,
          }}
        >
          Esta cuenta corresponde a App Movil.
        </h1>
        <p
          style={{
            margin: "12px 0 0",
            color: "rgba(255,255,255,0.76)",
            fontSize: "15px",
          }}
        >
          Ingrese desde un telefono o tablet autorizado para reportar hallazgos en
          terreno.
        </p>
        <button
          type="button"
          onClick={() => {
            window.location.href = "/login";
          }}
          style={{
            marginTop: "20px",
            border: "1px solid rgba(147,197,253,0.34)",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #2563eb, #0ea5e9)",
            color: "white",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 900,
            padding: "12px 16px",
            width: "100%",
          }}
        >
          Volver al login
        </button>
      </section>
    </main>
  );
}

function esTelefonoCliente() {
  if (typeof window === "undefined") return false;

  const userAgent = navigator.userAgent || "";
  const telefonoPorAgente =
    /Android.+Mobile|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Mobi/i.test(userAgent);
  const telefonoPorVista = window.matchMedia("(max-width: 767px)").matches;

  return telefonoPorAgente || telefonoPorVista;
}

function esMovilOTabletCliente() {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;

  const userAgent = navigator.userAgent.toLowerCase();
  const plataforma = navigator.platform?.toLowerCase() || "";
  const iPadOS = plataforma === "macintel" && navigator.maxTouchPoints > 1;

  return (
    iPadOS ||
    /iphone|ipad|ipod|android|mobile|tablet/.test(userAgent) ||
    (navigator.maxTouchPoints > 1 && !/mac|linux|windows/.test(plataforma))
  );
}

function esOrigenLocalOPrivado() {
  if (typeof window === "undefined") return false;

  const hostname = window.location.hostname;
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
  );
}

function esPerfilDemoControlado(perfil: ProfileCE) {
  return Boolean(perfil.email?.trim().toLowerCase().endsWith(".demo@criterioestrategico.cl"));
}

function debeBloquearAppMovilEnEscritorio(perfil: ProfileCE) {
  if (!rolEsAppMovilCE(perfil.rol)) return false;
  if (esOrigenLocalOPrivado()) return false;
  if (esPerfilDemoControlado(perfil)) return false;

  return !esMovilOTabletCliente();
}

function estaOfflineCliente() {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

export default function AuthGateCE({ zona, children }: AuthGateCEProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [estado, setEstado] = useState<EstadoGate>({ tipo: "verificando" });

  const loginUrl = useMemo(() => {
    const destino = pathname || (zona === "panel" ? "/panel" : "/evaluar-v2");
    return `/login?redirectTo=${encodeURIComponent(destino)}`;
  }, [pathname, zona]);

  useEffect(() => {
    let activo = true;

    async function verificarSesion() {
      setEstado({ tipo: "verificando" });
      const auth = await obtenerAuthProfileActual();

      if (!activo) return;

      if (!auth.autenticado) {
        if (estaOfflineCliente()) {
          setEstado({
            tipo: "sin-perfil",
            mensaje:
              "Necesitas iniciar sesión con internet al menos una vez antes de usar modo offline.",
          });
          return;
        }

        router.replace(loginUrl);
        return;
      }

      if (!auth.perfil) {
        setEstado({
          tipo: "sin-perfil",
          mensaje:
            auth.error ||
            "Usuario autenticado, pero sin perfil configurado. Contacte al administrador.",
        });
        return;
      }

      if (!rolPuedeEntrarZonaCE(auth.perfil.rol, zona)) {
        router.replace(destinoPorRolCE(auth.perfil.rol));
        return;
      }

      if (zona === "panel" && esTelefonoCliente()) {
        setEstado({ tipo: "bloqueado-pc" });
        return;
      }

      if (zona === "evaluar-v2" && debeBloquearAppMovilEnEscritorio(auth.perfil)) {
        setEstado({ tipo: "bloqueado-app-escritorio" });
        return;
      }

      setEstado({ tipo: "ok", perfil: auth.perfil });
    }

    verificarSesion();

    return () => {
      activo = false;
    };
  }, [loginUrl, router, zona]);

  if (estado.tipo === "verificando") {
    return pantallaEstado("Verificando sesión...");
  }

  if (estado.tipo === "sin-perfil") {
    return pantallaEstado(
      "Perfil no configurado",
      estado.mensaje ||
        "Usuario autenticado, pero sin perfil configurado. Contacte al administrador."
    );
  }

  if (estado.tipo === "bloqueado-pc") {
    return pantallaBloqueoPC();
  }

  if (estado.tipo === "bloqueado-app-escritorio") {
    return pantallaBloqueoAppMovil();
  }

  return <>{children}</>;
}
