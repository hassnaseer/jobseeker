import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { AiAutonomyLevel } from '@/modules/ai/enums/ai-autonomy-level.enum';

export class SetPlatformConfigDto {
  @ApiProperty({ required: false, description: 'e.g. 0.10 for 10%' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  clientCommissionPct?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  seekerCommissionPct?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  autoApproveHoursDays?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  escrowAutoReleaseDays?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minWithdrawal?: number;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  supportedCurrencies?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  baseCurrency?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  featuredJobPrice?: number;

  @ApiProperty({ enum: AiAutonomyLevel, required: false })
  @IsOptional()
  @IsEnum(AiAutonomyLevel)
  aiAutonomyLevel?: AiAutonomyLevel;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  aiProvider?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  aiModel?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  aiMonthlySpendCap?: number;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  aiEnabledFeatures?: string[];
}
