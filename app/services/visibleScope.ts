import type { ProfileCE, RoleCE } from "../types/authRoles";

export type AlcanceVisibleCE = {
  isGlobal: boolean;
  role: RoleCE | "sin_perfil";
  empresaId?: string;
  obraId?: string;
  perfilIncompleto: boolean;
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function uuidSeguro(valor: unknown) {
  const texto = String(valor || "").trim();
  return UUID_REGEX.test(texto) ? texto : "";
}

export function construirAlcanceVisibleCE(
  perfil: ProfileCE | null | undefined
): AlcanceVisibleCE {
  if (perfil?.rol === "super_admin_ce") {
    return {
      isGlobal: true,
      role: "super_admin_ce",
      perfilIncompleto: false,
    };
  }

  const empresaId = uuidSeguro(perfil?.empresaId);
  const obraId = uuidSeguro(perfil?.obraId);

  return {
    isGlobal: false,
    role: perfil?.rol || "sin_perfil",
    empresaId: empresaId || undefined,
    obraId: obraId || undefined,
    perfilIncompleto: !empresaId,
  };
}

export function filtrosHallazgosDesdeAlcanceCE(alcance: AlcanceVisibleCE) {
  if (alcance.isGlobal) return {};
  if (alcance.perfilIncompleto) return { sinAcceso: true };

  return {
    empresaId: alcance.empresaId,
    obraId: alcance.obraId,
  };
}
