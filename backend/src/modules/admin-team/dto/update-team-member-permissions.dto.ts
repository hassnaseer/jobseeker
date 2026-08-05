import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum } from 'class-validator';
import { AdminPermission } from '@/modules/admin-team/enums/admin-permission.enum';

export class UpdateTeamMemberPermissionsDto {
  @ApiProperty({ enum: AdminPermission, isArray: true })
  @IsArray()
  @IsEnum(AdminPermission, { each: true })
  permissions: AdminPermission[];
}
