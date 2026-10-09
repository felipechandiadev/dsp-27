import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/** Restringe el handler a uno de los roles indicados (con {@link RolesGuard}). */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
