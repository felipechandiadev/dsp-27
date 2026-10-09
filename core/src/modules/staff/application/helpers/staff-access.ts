import { ForbiddenException } from '@nestjs/common';
import { StaffRequirementCheck } from '@modules/staff/domain/staff-requirement-check.entity';

const OK = new Set(['received', 'approved']);

const WRITE_ROLES = new Set([
  'direccion',
  'administrativo',
  'jefe_operaciones',
]);

export function assertStaffWriteRole(role: string): void {
  if (!WRITE_ROLES.has(role)) {
    throw new ForbiddenException(
      'Solo dirección, administrativo o jefe de operaciones pueden modificar personal',
    );
  }
}

export function computeInspectorReadiness(
  checks: StaffRequirementCheck[],
): boolean {
  return (
    checks.length > 0 && checks.every((c) => OK.has(c.status))
  );
}

export function suggestQualityAfterChecks(
  checks: StaffRequirementCheck[],
  current: string,
): string {
  if (current === 'granted' || current === 'revoked') return current;
  if (computeInspectorReadiness(checks)) return 'pending';
  return current === 'pending' ? 'none' : current;
}
