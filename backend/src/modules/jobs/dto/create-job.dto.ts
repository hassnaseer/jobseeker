import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ExperienceLevel } from '@/common/enums/experience-level.enum';
import { JobDuration } from '@/modules/jobs/enums/job-duration.enum';
import { JobType } from '@/modules/jobs/enums/job-type.enum';
import { LocationType } from '@/modules/jobs/enums/location-type.enum';
import { PricingModel } from '@/modules/jobs/enums/pricing-model.enum';
import { TrackingMode } from '@/modules/jobs/enums/tracking-mode.enum';

export class CreateJobDto {
  @ApiProperty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty()
  @IsString()
  @MaxLength(10000)
  description: string;

  @ApiProperty()
  @IsUUID()
  categoryId: string;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  skillsRequired?: string[];

  @ApiProperty({ enum: JobType })
  @IsEnum(JobType)
  jobType: JobType;

  @ApiProperty({ enum: PricingModel, required: false, description: 'Required when jobType=FIXED' })
  @IsOptional()
  @IsEnum(PricingModel)
  pricingModel?: PricingModel;

  @ApiProperty({ enum: TrackingMode, required: false, description: 'Required when jobType=HOURLY' })
  @IsOptional()
  @IsEnum(TrackingMode)
  trackingMode?: TrackingMode;

  @ApiProperty({ enum: LocationType })
  @IsEnum(LocationType)
  locationType: LocationType;

  @ApiProperty({ required: false, description: 'Required when locationType=PHYSICAL' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiProperty({ required: false, description: 'Required when locationType=PHYSICAL' })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiProperty({ required: false, description: 'Required when locationType=PHYSICAL' })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  radiusKm?: number;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  checkinRequired?: boolean;

  @ApiProperty({ required: false, description: 'Required when jobType=FIXED' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  budgetAmount?: number;

  @ApiProperty({ required: false, default: 'USD' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @ApiProperty({ required: false, description: 'Required when jobType=HOURLY' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hourlyRateMin?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hourlyRateMax?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedHours?: number;

  @ApiProperty({ enum: JobDuration, required: false })
  @IsOptional()
  @IsEnum(JobDuration)
  duration?: JobDuration;

  @ApiProperty({ enum: ExperienceLevel, required: false })
  @IsOptional()
  @IsEnum(ExperienceLevel)
  experienceLevel?: ExperienceLevel;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  attachments?: string[];

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  numberOfOpenings?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @ApiProperty({
    required: false,
    default: false,
    description: 'true publishes immediately (OPEN) instead of saving as DRAFT',
  })
  @IsOptional()
  @IsBoolean()
  publish?: boolean;
}
