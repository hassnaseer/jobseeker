import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsUUID } from 'class-validator';
import { UserRole } from '@/common/enums/user-role.enum';

const SELECTABLE_ROLES = [UserRole.CLIENT, UserRole.SEEKER];

export class AddUserCategoryDto {
  @ApiProperty({ enum: SELECTABLE_ROLES })
  @IsIn(SELECTABLE_ROLES)
  role: UserRole.CLIENT | UserRole.SEEKER;

  @ApiProperty()
  @IsUUID()
  categoryId: string;
}
