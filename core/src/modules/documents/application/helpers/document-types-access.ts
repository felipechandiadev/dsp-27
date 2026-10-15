import { ForbiddenException } from '@nestjs/common';

const WRITE_ROLES = new Set([
  'direccion',
  'prevencion',
  'administrativo',
]);

export function assertDocumentTypesWriteRole(role: string): void {
  if (!WRITE_ROLES.has(role)) {
    throw new ForbiddenException(
      'Solo dirección, prevención o administrativo pueden modificar tipos de documento',
    );
  }
}

export function canWriteDocumentTypes(role: string | undefined | null): boolean {
  return !!role && WRITE_ROLES.has(role);
}
