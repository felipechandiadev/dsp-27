/**
 * Catálogo de perfiles de usuario (espejo de core `user-roles.ts`).
 * Mantener alineado al actualizar roles en el backend.
 */
export const USER_ROLES = [
  'direccion',
  'admin_sistema',
  'analisis_datos',
  'analisis_sistemas',
  'administrativo',
  'its',
  'prevencion',
  'gestor',
  'jefe_operaciones',
  'operador_televigilancia',
  'inspector',
  'jefe_grd',
  'grd',
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  direccion: 'Dirección',
  admin_sistema: 'Administrador/a de sistema',
  analisis_datos: 'Analista de datos / control de gestión',
  analisis_sistemas: 'Analista TIC / televigilancia y sistemas',
  administrativo: 'Administrativo/a',
  its: 'Inspector técnico de servicios (ITS)',
  prevencion: 'Prevención / vinculación',
  gestor: 'Gestor territorial',
  jefe_operaciones: 'Jefe/a de Operaciones',
  operador_televigilancia: 'Operador/a de televigilancia',
  inspector: 'Inspector/a de seguridad municipal',
  jefe_grd: 'Jefe/a GRD',
  grd: 'Apoyo GRD',
};

/** Roles que pueden administrar cuentas (`/settings/users`). */
export const USER_ADMIN_ROLES: readonly UserRole[] = [
  'admin_sistema',
  'direccion',
];

export function canAdminUsers(role: string | undefined | null): boolean {
  if (!role) return false;
  return (USER_ADMIN_ROLES as readonly string[]).includes(role);
}

/** Roles que pueden crear/editar áreas de operación y tipos. */
export const TERRITORY_WRITE_ROLES: readonly UserRole[] = [
  'direccion',
  'prevencion',
  'administrativo',
];

export function canWriteTerritory(role: string | undefined | null): boolean {
  if (!role) return false;
  return (TERRITORY_WRITE_ROLES as readonly string[]).includes(role);
}

export const OPS_CREATE_ROLES: readonly UserRole[] = [
  'direccion',
  'prevencion',
  'jefe_operaciones',
  'administrativo',
  'gestor',
  'inspector',
];

export const OPS_VERIFY_ROLES: readonly UserRole[] = [
  'direccion',
  'prevencion',
  'jefe_operaciones',
  'analisis_datos',
];

export const OPS_DEPLOY_ROLES: readonly UserRole[] = [
  'direccion',
  'prevencion',
  'jefe_operaciones',
];

export const OPS_CLOSE_REQ_ROLES: readonly UserRole[] = [
  'direccion',
  'prevencion',
  'jefe_operaciones',
  'administrativo',
];

export function canCreateOperationalCase(
  role: string | undefined | null,
): boolean {
  return !!role && (OPS_CREATE_ROLES as readonly string[]).includes(role);
}

export function canVerifyIncidencia(role: string | undefined | null): boolean {
  return !!role && (OPS_VERIFY_ROLES as readonly string[]).includes(role);
}

export function canDeployOperation(role: string | undefined | null): boolean {
  return !!role && (OPS_DEPLOY_ROLES as readonly string[]).includes(role);
}

export function canCloseRequerimiento(
  role: string | undefined | null,
): boolean {
  return !!role && (OPS_CLOSE_REQ_ROLES as readonly string[]).includes(role);
}

export function userRoleLabel(role: string | undefined | null): string {
  if (!role) return '';
  if ((USER_ROLES as readonly string[]).includes(role)) {
    return USER_ROLE_LABELS[role as UserRole];
  }
  return role;
}
