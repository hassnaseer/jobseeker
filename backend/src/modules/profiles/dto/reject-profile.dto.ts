import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RejectProfileDto {
  @ApiProperty()
  @IsString()
  @MinLength(5)
  @MaxLength(1000)
  reason: string;

  @ApiProperty({
    required: false,
    default: false,
    description: "Also mark identity/KYC verification as rejected (not just this role's details)",
  })
  @IsOptional()
  @IsBoolean()
  rejectKyc?: boolean;
}
