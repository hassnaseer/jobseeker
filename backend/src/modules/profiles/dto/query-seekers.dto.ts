import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export enum SeekerSortBy {
  RATING = 'RATING',
  RATE = 'RATE',
  JOBS = 'JOBS',
}

export class QuerySeekersDto {
  @ApiProperty({ enum: SeekerSortBy, required: false, default: SeekerSortBy.RATING })
  @IsOptional()
  @IsEnum(SeekerSortBy)
  sortBy?: SeekerSortBy;

  @ApiProperty({ required: false, description: 'Bias results toward seekers selected under this category' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({ required: false, default: 8 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}
