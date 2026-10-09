/**
 * Perfiles de usuario de la app (`users.role`).
 * Alineados a la orgánica DSP / Astro seguridad-2027.
 * No confundir con cargo de planta, unidad (`staff.unit`) ni perfil DS 97.
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

/** Roles que pueden administrar cuentas de la app (`/api/users`). */
export const USER_ADMIN_ROLES: readonly UserRole[] = [
  'admin_sistema',
  'direccion',
];

export function canAdminUsers(role: string): boolean {
  return (USER_ADMIN_ROLES as readonly string[]).includes(role);
}

export function isUserRole(value: string): value is UserRole {
  return (USER_ROLES as readonly string[]).includes(value);
}
