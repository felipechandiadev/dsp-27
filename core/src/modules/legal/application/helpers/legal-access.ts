import { ForbiddenException } from '@nestjs/common';

const WRITE_ROLES = new Set(['direccion', 'administrativo']);

export function assertLegalWriteRole(role: string): void {
  if (!WRITE_ROLES.has(role)) {
    throw new ForbiddenException(
      'Solo dirección o administrativo pueden modificar normas',
    );
  }
}

export function canWriteLegal(role: string | undefined | null): boolean {
  if (!role) return false;
  return WRITE_ROLES.has(role);
}
