import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class MilestoneInputDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  amount: number;
}

export class CreateContractDto {
  @ApiProperty({
    required: false,
    description: "Required when the job's pricingModel is MILESTONE",
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => MilestoneInputDto)
  milestones?: MilestoneInputDto[];

  @ApiProperty({ required: false, description: 'Hourly contracts only' })
  @IsOptional()
  @IsInt()
  @Min(1)
  weeklyHourLimit?: number;
}
