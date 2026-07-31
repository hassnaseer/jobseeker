import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsOptional } from 'class-validator';

export class DateRangeDto {
  @ApiProperty({ required: false, description: 'ISO 8601 date, inclusive' })
  @IsOptional()
  @IsISO8601()
  from?: string;

  @ApiProperty({ required: false, description: 'ISO 8601 date, inclusive' })
  @IsOptional()
  @IsISO8601()
  to?: string;
}
