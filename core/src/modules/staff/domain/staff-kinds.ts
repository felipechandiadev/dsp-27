export const STAFF_UNITS = [
  'analisis',
  'prevencion',
  'operaciones',
  'direccion',
  'grd',
] as const;

export type StaffUnit = (typeof STAFF_UNITS)[number];

export const DS97_PROFILES = [
  'fiscalizador',
  'coadyuvante',
  'no_operativo',
] as const;

export type Ds97Profile = (typeof DS97_PROFILES)[number];

export const INSPECTOR_QUALITY_STATUSES = [
  'none',
  'pending',
  'granted',
  'revoked',
] as const;

export type InspectorQualityStatus =
  (typeof INSPECTOR_QUALITY_STATUSES)[number];

export const STAFF_STATUSES = ['active', 'on_leave', 'terminated'] as const;

export type StaffStatus = (typeof STAFF_STATUSES)[number];

export const REQUIREMENT_CODES = [
  'idoneidad_moral',
  'salud_compatible',
  'antecedentes',
  'capacitacion_basica',
  'declaracion_art16',
] as const;

export type RequirementCode = (typeof REQUIREMENT_CODES)[number];

export const REQUIREMENT_STATUSES = [
  'missing',
  'received',
  'approved',
  'rejected',
] as const;

export type RequirementStatus = (typeof REQUIREMENT_STATUSES)[number];

export function isStaffUnit(value: string): value is StaffUnit {
  return (STAFF_UNITS as readonly string[]).includes(value);
}

export function isDs97Profile(value: string): value is Ds97Profile {
  return (DS97_PROFILES as readonly string[]).includes(value);
}

export function isInspectorQualityStatus(
  value: string,
): value is InspectorQualityStatus {
  return (INSPECTOR_QUALITY_STATUSES as readonly string[]).includes(value);
}

export function isStaffStatus(value: string): value is StaffStatus {
  return (STAFF_STATUSES as readonly string[]).includes(value);
}

export function isRequirementCode(value: string): value is RequirementCode {
  return (REQUIREMENT_CODES as readonly string[]).includes(value);
}

export function isRequirementStatus(
  value: string,
): value is RequirementStatus {
  return (REQUIREMENT_STATUSES as readonly string[]).includes(value);
}

export function art12Checklist(): RequirementCode[] {
  return [...REQUIREMENT_CODES];
}
