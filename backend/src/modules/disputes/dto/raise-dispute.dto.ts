import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class RaiseDisputeDto {
  @ApiProperty({
    required: false,
    description: 'Scope the dispute to one milestone, if applicable',
  })
  @IsOptional()
  @IsUUID()
  milestoneId?: string;

  @ApiProperty()
  @IsString()
  @MaxLength(5000)
  reason: string;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  evidence?: string[];
}
