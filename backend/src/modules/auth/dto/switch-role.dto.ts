import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { UserRole } from '@/common/enums/user-role.enum';

const SWITCHABLE_ROLES = [UserRole.CLIENT, UserRole.SEEKER];

export class SwitchRoleDto {
  @ApiProperty({ enum: SWITCHABLE_ROLES })
  @IsIn(SWITCHABLE_ROLES)
  role: UserRole.CLIENT | UserRole.SEEKER;
}
