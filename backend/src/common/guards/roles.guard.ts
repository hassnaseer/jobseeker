import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/user-role.enum';
import { User } from '@/modules/users/entities/user.entity';

/**
 * Checks the authenticated user's held roles[] against @Roles(...) metadata.
 * SUPER_ADMIN always passes, since admins are not part of the client/seeker
 * dual-role toggle. Must run after JwtAuthGuard.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<{ user: User }>();
    if (!user) {
      return false;
    }

    if (user.roles.includes(UserRole.SUPER_ADMIN)) {
      return true;
    }

    return requiredRoles.some((role) => user.roles.includes(role));
  }
}
