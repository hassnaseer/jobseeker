import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class LogManualTimeDto {
  @ApiProperty({
    required: false,
    description: 'Provide either startTime+endTime, or hours directly',
  })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  endTime?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Max(24)
  hours?: number;

  @ApiProperty({
    required: false,
    description:
      'Which day this entry counts against, when using hours-only logging. Defaults to today.',
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty()
  @IsString()
  @MaxLength(2000)
  description: string;
}
