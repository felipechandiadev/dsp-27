import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '@common/decorators/roles.decorator';
import { AuthUser } from '@modules/auth/domain/jwt-payload';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles?.length) return true;

    const request = context.switchToHttp().getRequest<{ user?: AuthUser }>();
    const role = request.user?.role;
    if (!role || !roles.includes(role)) {
      throw new ForbiddenException('No tiene permiso para esta operación');
    }
    return true;
  }
}
