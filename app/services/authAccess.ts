import type { RoleCE } from "@/app/types/authRoles";

const ROLES_PANEL = new Set<RoleCE>([
  "super_admin_ce",
  "admin_cliente",
  "admin_mandante",
  "prevencionista_cliente",
  "visualizador_auditor",
  "responsable_cierre",
]);

const ROLES_APP_MOVIL = new Set<RoleCE>([
  "supervisor_reportante",
]);

export type ZonaAccesoCE = "panel" | "evaluar-v2";

export function rolEsAppMovilCE(rol: RoleCE) {
  return ROLES_APP_MOVIL.has(rol);
}

export function destinoPorRolCE(rol: RoleCE) {
  if (rolEsAppMovilCE(rol)) return "/evaluar-v2";
  return "/panel";
}

export function rolPuedeEntrarPanelCE(rol: RoleCE) {
  return ROLES_PANEL.has(rol);
}

export function rolPuedeEntrarEvaluarV2CE(rol: RoleCE) {
  return rolEsAppMovilCE(rol);
}

export function rolPuedeEntrarZonaCE(rol: RoleCE, zona: ZonaAccesoCE) {
  if (zona === "panel") return rolPuedeEntrarPanelCE(rol);
  return rolPuedeEntrarEvaluarV2CE(rol);
}
