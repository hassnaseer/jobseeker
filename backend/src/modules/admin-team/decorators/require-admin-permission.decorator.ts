import { SetMetadata } from '@nestjs/common';
import { AdminPermission } from '@/modules/admin-team/enums/admin-permission.enum';

export const ADMIN_PERMISSION_KEY = 'adminPermission';
export const RequireAdminPermission = (permission: AdminPermission) =>
  SetMetadata(ADMIN_PERMISSION_KEY, permission);
