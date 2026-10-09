/**
 * Catálogo de perfiles de usuario (espejo de core `user-roles.ts`).
 * Mantener alineado al actualizar roles en el backend.
 */
export const USER_ROLES = [
  'direccion',
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

export function userRoleLabel(role: string | undefined | null): string {
  if (!role) return '';
  if ((USER_ROLES as readonly string[]).includes(role)) {
    return USER_ROLE_LABELS[role as UserRole];
  }
  return role;
}
