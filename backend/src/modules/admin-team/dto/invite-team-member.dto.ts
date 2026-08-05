import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { AdminPermission } from '@/modules/admin-team/enums/admin-permission.enum';

export class InviteTeamMemberDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ enum: AdminPermission, isArray: true })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(AdminPermission, { each: true })
  permissions: AdminPermission[];
}
