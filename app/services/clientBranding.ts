export type ClientBrandingInput = {
  clienteId?: string | null;
  tenantId?: string | null;
  nombreCliente?: string | null;
  logoUrl?: string | null;
  colorPrimario?: string | null;
  colorSecundario?: string | null;
  mostrarLogoCliente?: boolean | null;
  mostrarLogoCE?: boolean | null;
};

export type ResolvedClientBranding = {
  clienteId: string;
  tenantId: string;
  nombreCliente: string;
  logoUrl: string;
  colorPrimario: string;
  colorSecundario: string;
  mostrarLogoCliente: boolean;
  mostrarLogoCE: boolean;
  logoPrincipalUrl: string;
  nombrePrincipal: string;
  logoCeUrl: string;
  poweredByText: string;
};

const PANEL_CONFIG_STORAGE_KEY = "ce_panel_config";
const CE_NAME = "Criterio Estratégico";
const CE_LOGO_URL = "/logo.png";

function clean(value?: string | null) {
  return String(value || "").trim();
}

function safeBoolean(value: boolean | null | undefined, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

export function resolveClientBranding(
  input: ClientBrandingInput = {}
): ResolvedClientBranding {
  const nombreCliente = clean(input.nombreCliente) || "Cliente corporativo";
  const logoUrl = clean(input.logoUrl);
  const mostrarLogoCliente = safeBoolean(input.mostrarLogoCliente, Boolean(logoUrl));
  const mostrarLogoCE = safeBoolean(input.mostrarLogoCE, true);
  const usarLogoCliente = Boolean(mostrarLogoCliente && logoUrl);

  return {
    clienteId: clean(input.clienteId),
    tenantId: clean(input.tenantId),
    nombreCliente,
    logoUrl,
    colorPrimario: clean(input.colorPrimario) || "#1d4ed8",
    colorSecundario: clean(input.colorSecundario) || "#67ef48",
    mostrarLogoCliente,
    mostrarLogoCE,
    logoPrincipalUrl: usarLogoCliente ? logoUrl : CE_LOGO_URL,
    nombrePrincipal: usarLogoCliente ? nombreCliente : CE_NAME,
    logoCeUrl: CE_LOGO_URL,
    poweredByText: `Generado por ${CE_NAME}`,
  };
}

export function readClientBrandingFromPanelConfig() {
  if (typeof window === "undefined") return resolveClientBranding();

  try {
    const config = JSON.parse(
      window.localStorage.getItem(PANEL_CONFIG_STORAGE_KEY) || "null"
    ) as
      | {
          nombreEmpresaConfig?: string;
          logoEmpresaConfig?: string;
          brandingPC?: boolean;
          brandingPDF?: boolean;
        }
      | null;

    return resolveClientBranding({
      nombreCliente: config?.nombreEmpresaConfig,
      logoUrl: config?.logoEmpresaConfig,
      mostrarLogoCliente: config?.brandingPDF ?? config?.brandingPC,
      mostrarLogoCE: true,
    });
  } catch {
    return resolveClientBranding();
  }
}
