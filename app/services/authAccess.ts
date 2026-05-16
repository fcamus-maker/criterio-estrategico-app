import type { RoleCE } from "@/app/types/authRoles";

const ROLES_PANEL = new Set<RoleCE>([
  "super_admin_ce",
  "admin_cliente",
  "admin_mandante",
  "prevencionista_cliente",
  "visualizador_auditor",
  "responsable_cierre",
]);

export type ZonaAccesoCE = "panel" | "evaluar-v2";

export function destinoPorRolCE(rol: RoleCE) {
  if (rol === "supervisor_reportante") return "/evaluar-v2";
  return "/panel";
}

export function rolPuedeEntrarPanelCE(rol: RoleCE) {
  return ROLES_PANEL.has(rol);
}

export function rolPuedeEntrarEvaluarV2CE(rol: RoleCE) {
  void rol;
  // Durante demo controlada se permite que roles administrativos entren a la app
  // movil para pruebas, aunque su destino natural despues del login sea /panel.
  return true;
}

export function rolPuedeEntrarZonaCE(rol: RoleCE, zona: ZonaAccesoCE) {
  if (zona === "panel") return rolPuedeEntrarPanelCE(rol);
  return rolPuedeEntrarEvaluarV2CE(rol);
}
