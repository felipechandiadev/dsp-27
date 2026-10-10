import { ForbiddenException } from '@nestjs/common';

const WRITE_ROLES = new Set([
  'direccion',
  'prevencion',
  'administrativo',
]);

export function assertTerritoryWriteRole(role: string): void {
  if (!WRITE_ROLES.has(role)) {
    throw new ForbiddenException(
      'Solo dirección, prevención o administrativo pueden modificar áreas de operación',
    );
  }
}

export function canWriteTerritory(role: string | undefined | null): boolean {
  if (!role) return false;
  return WRITE_ROLES.has(role);
}
