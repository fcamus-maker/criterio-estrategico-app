"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { obtenerAuthProfileActual } from "@/app/services/authProfileService";
import {
  destinoPorRolCE,
  rolPuedeEntrarZonaCE,
  type ZonaAccesoCE,
} from "@/app/services/authAccess";
import type { ProfileCE } from "@/app/types/authRoles";

type EstadoGate =
  | { tipo: "verificando" }
  | { tipo: "ok"; perfil: ProfileCE }
  | { tipo: "bloqueado-pc" }
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

function esTelefonoCliente() {
  if (typeof window === "undefined") return false;

  const userAgent = navigator.userAgent || "";
  const telefonoPorAgente =
    /Android.+Mobile|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Mobi/i.test(userAgent);
  const telefonoPorVista = window.matchMedia("(max-width: 767px)").matches;

  return telefonoPorAgente || telefonoPorVista;
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

  return <>{children}</>;
}
