import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';
import { DisputeResolutionType } from '@/modules/disputes/enums/dispute-resolution-type.enum';

export class ResolveDisputeDto {
  @ApiProperty({ enum: DisputeResolutionType })
  @IsEnum(DisputeResolutionType)
  resolutionType: DisputeResolutionType;

  @ApiProperty()
  @IsString()
  @MaxLength(2000)
  resolutionNote: string;

  @ApiProperty({
    required: false,
    description:
      'Required for SPLIT — net amount (in the contract currency, before platform fee) the seeker receives. The rest of escrow is refunded to the client proportionally.',
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  seekerAmount?: number;
}
