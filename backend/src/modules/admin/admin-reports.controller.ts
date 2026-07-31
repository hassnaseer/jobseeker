import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/user-role.enum';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Report } from '@/modules/chat/entities/report.entity';
import { ReportStatus } from '@/modules/chat/enums/report-status.enum';
import { AuditLogService } from '@/modules/admin/audit-log.service';
import { ResolveReportDto } from '@/modules/admin/dto/resolve-report.dto';
import { User } from '@/modules/users/entities/user.entity';

@ApiTags('admin-reports')
@ApiBearerAuth()
@Roles(UserRole.SUPER_ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/reports')
export class AdminReportsController {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Get()
  list(@Query('status') status?: ReportStatus) {
    return this.reportRepository.find({
      where: status ? { status } : {},
      order: { createdAt: 'ASC' },
    });
  }

  @Post(':id/resolve')
  async resolve(
    @CurrentUser() admin: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ResolveReportDto,
  ) {
    if (dto.status === ReportStatus.OPEN) {
      throw new BadRequestException('status must be REVIEWED or DISMISSED');
    }
    const report = await this.reportRepository.findOne({ where: { id } });
    if (!report) {
      throw new BadRequestException('Report not found');
    }
    report.status = dto.status;
    report.reviewedBy = admin.id;
    const saved = await this.reportRepository.save(report);

    await this.auditLogService.record({
      actorId: admin.id,
      action: `REPORT_${dto.status}`,
      entityType: 'Report',
      entityId: id,
    });

    return saved;
  }
}
