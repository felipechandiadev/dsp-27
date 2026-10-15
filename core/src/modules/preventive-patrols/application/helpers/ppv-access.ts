import { ForbiddenException } from '@nestjs/common';

const WRITE_ROLES = new Set([
  'direccion',
  'prevencion',
  'jefe_operaciones',
  'gestor',
  'inspector',
  'administrativo',
]);

export function assertPpvWriteRole(role: string): void {
  if (!WRITE_ROLES.has(role)) {
    throw new ForbiddenException(
      'No tiene permiso para registrar rondas preventivas',
    );
  }
}
