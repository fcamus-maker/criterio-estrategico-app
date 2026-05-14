export const ROLES_CE = [
  "super_admin_ce",
  "admin_cliente",
  "admin_mandante",
  "prevencionista_cliente",
  "supervisor_reportante",
  "responsable_cierre",
  "visualizador_auditor",
] as const;

export type RoleCE = (typeof ROLES_CE)[number];

export type TipoEmpresaCE =
  | "criterio_estrategico"
  | "cliente"
  | "mandante"
  | "contratista"
  | "reportante";

export type EstadoRegistroCE = "activa" | "inactiva";

export type EmpresaCE = {
  id: string;
  nombre: string;
  rut?: string | null;
  tipoEmpresa: TipoEmpresaCE;
  estado: EstadoRegistroCE;
  createdAt?: string;
  updatedAt?: string;
};

export type ObraCE = {
  id: string;
  empresaId?: string | null;
  mandanteId?: string | null;
  nombre: string;
  codigo?: string | null;
  ubicacion?: string | null;
  estado: EstadoRegistroCE;
  createdAt?: string;
  updatedAt?: string;
};

export type ProfileCE = {
  id: string;
  nombre: string;
  email?: string | null;
  cargo?: string | null;
  telefono?: string | null;
  fotoUrl?: string | null;
  rol: RoleCE;
  empresaId?: string | null;
  obraId?: string | null;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type UsuarioAsignacionCE = {
  id: string;
  usuarioId: string;
  empresaId: string;
  obraId?: string | null;
  rol: RoleCE;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export function esRoleCE(valor: unknown): valor is RoleCE {
  return ROLES_CE.includes(valor as RoleCE);
}
