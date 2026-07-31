import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ReportStatus } from '@/modules/chat/enums/report-status.enum';

export class ResolveReportDto {
  @ApiProperty({ enum: ReportStatus, description: 'Must be REVIEWED or DISMISSED' })
  @IsEnum(ReportStatus)
  status: ReportStatus;
}
