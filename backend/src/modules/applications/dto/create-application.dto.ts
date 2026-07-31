import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { JobDuration } from '@/modules/jobs/enums/job-duration.enum';

export class CreateApplicationDto {
  @ApiProperty()
  @IsString()
  @MaxLength(5000)
  coverLetter: string;

  @ApiProperty({ required: false, description: 'Required for FIXED jobs' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  bidAmount?: number;

  @ApiProperty({ required: false, description: 'Required for HOURLY jobs' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  proposedHourlyRate?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @ApiProperty({ enum: JobDuration, required: false })
  @IsOptional()
  @IsEnum(JobDuration)
  estimatedDuration?: JobDuration;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  attachments?: string[];
}
