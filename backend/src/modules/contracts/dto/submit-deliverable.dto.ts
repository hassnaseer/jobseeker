import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class SubmitDeliverableDto {
  @ApiProperty({
    required: false,
    description: 'Required for MILESTONE contracts, omitted for LUMP',
  })
  @IsOptional()
  @IsUUID()
  milestoneId?: string;

  @ApiProperty()
  @IsString()
  @MaxLength(5000)
  description: string;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  attachments?: string[];
}
