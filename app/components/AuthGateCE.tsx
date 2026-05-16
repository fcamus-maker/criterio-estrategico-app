"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  cerrarSesionCE,
  obtenerAuthProfileActual,
} from "@/app/services/authProfileService";
import {
  destinoPorRolCE,
  rolPuedeEntrarZonaCE,
  type ZonaAccesoCE,
} from "@/app/services/authAccess";
import type { ProfileCE } from "@/app/types/authRoles";

type EstadoGate =
  | { tipo: "verificando" }
  | { tipo: "ok"; perfil: ProfileCE }
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

export default function AuthGateCE({ zona, children }: AuthGateCEProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [estado, setEstado] = useState<EstadoGate>({ tipo: "verificando" });
  const [cerrando, setCerrando] = useState(false);

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

      setEstado({ tipo: "ok", perfil: auth.perfil });
    }

    verificarSesion();

    return () => {
      activo = false;
    };
  }, [loginUrl, router, zona]);

  const cerrarSesion = async () => {
    if (cerrando) return;
    setCerrando(true);
    await cerrarSesionCE();
    router.replace("/login");
  };

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

  return (
    <>
      <button
        type="button"
        onClick={cerrarSesion}
        disabled={cerrando}
        style={{
          position: "fixed",
          top: "max(12px, env(safe-area-inset-top))",
          right: "12px",
          zIndex: 60,
          border: "1px solid rgba(255,255,255,0.18)",
          borderRadius: "999px",
          background: "rgba(7,17,31,0.78)",
          color: "white",
          cursor: "pointer",
          fontSize: "12px",
          fontWeight: 900,
          padding: "8px 11px",
          boxShadow: "0 10px 24px rgba(0,0,0,0.22)",
          touchAction: "manipulation",
          opacity: cerrando ? 0.68 : 1,
        }}
      >
        {cerrando ? "Cerrando..." : "Cerrar sesión"}
      </button>
      {children}
    </>
  );
}
