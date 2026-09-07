import { Injectable, type CanActivate, type ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '@/src/common/decorators/roles.decorator';
import type { CurrentUserPayload } from '@/src/common/decorators/current-user.decorator';
import { Role } from '@/src/common/enums/role.enum';

/**
 * Enforces roles declared via `@Roles(...)`. Must run after `JwtAuthGuard`
 * so `request.user` is already populated. Routes without `@Roles(...)`
 * are allowed through unchecked.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user?: CurrentUserPayload }>();
    const userRoles = request.user?.roles ?? [];

    const hasRole = requiredRoles.some((role) => userRoles.includes(role));
    if (!hasRole) {
      throw new ForbiddenException('Insufficient role for this action');
    }

    return true;
  }
}
