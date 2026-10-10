import { ForbiddenException } from '@nestjs/common';

const CREATE_ROLES = new Set([
  'direccion',
  'prevencion',
  'jefe_operaciones',
  'administrativo',
  'gestor',
  'inspector',
]);

const VERIFY_ROLES = new Set([
  'direccion',
  'prevencion',
  'jefe_operaciones',
  'analisis_datos',
]);

const DEPLOY_ROLES = new Set([
  'direccion',
  'prevencion',
  'jefe_operaciones',
]);

const CLOSE_REQ_ROLES = new Set([
  'direccion',
  'prevencion',
  'jefe_operaciones',
  'administrativo',
]);

export function assertCreateCaseRole(role: string): void {
  if (!CREATE_ROLES.has(role)) {
    throw new ForbiddenException(
      'No tiene permiso para crear incidencias o requerimientos',
    );
  }
}

export function assertVerifyIncidenciaRole(role: string): void {
  if (!VERIFY_ROLES.has(role)) {
    throw new ForbiddenException(
      'No tiene permiso para verificar incidencias',
    );
  }
}

export function assertDeployOperationRole(role: string): void {
  if (!DEPLOY_ROLES.has(role)) {
    throw new ForbiddenException(
      'No tiene permiso para desplegar u operar despachos',
    );
  }
}

export function assertCloseRequerimientoRole(role: string): void {
  if (!CLOSE_REQ_ROLES.has(role)) {
    throw new ForbiddenException(
      'No tiene permiso para cerrar requerimientos',
    );
  }
}

export function canCreateCase(role: string | undefined | null): boolean {
  return !!role && CREATE_ROLES.has(role);
}

export function canVerifyIncidencia(role: string | undefined | null): boolean {
  return !!role && VERIFY_ROLES.has(role);
}

export function canDeployOperation(role: string | undefined | null): boolean {
  return !!role && DEPLOY_ROLES.has(role);
}

export function canCloseRequerimiento(role: string | undefined | null): boolean {
  return !!role && CLOSE_REQ_ROLES.has(role);
}
