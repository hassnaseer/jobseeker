import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { ReportTargetType } from '@/modules/chat/enums/report-target-type.enum';

export class CreateReportDto {
  @ApiProperty({ enum: ReportTargetType })
  @IsEnum(ReportTargetType)
  targetType: ReportTargetType;

  @ApiProperty()
  @IsUUID()
  targetId: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(1000)
  reason: string;
}
