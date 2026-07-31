import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { UserRole } from '@/common/enums/user-role.enum';

const REVIEWABLE_ROLES = [UserRole.CLIENT, UserRole.SEEKER];

export class SubmitForReviewDto {
  @ApiProperty({ enum: REVIEWABLE_ROLES })
  @IsIn(REVIEWABLE_ROLES)
  role: UserRole.CLIENT | UserRole.SEEKER;
}
