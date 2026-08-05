import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ADMIN_PERMISSION_KEY } from '@/modules/admin-team/decorators/require-admin-permission.decorator';
import { AdminPermission } from '@/modules/admin-team/enums/admin-permission.enum';
import { AdminTeamService } from '@/modules/admin-team/admin-team.service';
import { User } from '@/modules/users/entities/user.entity';

/**
 * Narrows SUPER_ADMIN access for scoped team members. Must run after
 * JwtAuthGuard + RolesGuard(SUPER_ADMIN); a root admin (no team row) always
 * passes, so this never grants access on its own.
 */
@Injectable()
export class AdminPermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly adminTeamService: AdminTeamService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permission = this.reflector.getAllAndOverride<AdminPermission | undefined>(ADMIN_PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!permission) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<{ user: User }>();
    if (!user) {
      return false;
    }

    const allowed = await this.adminTeamService.hasPermission(user, permission);
    if (!allowed) {
      throw new ForbiddenException(`Your admin access does not include ${permission}`);
    }
    return true;
  }
}
