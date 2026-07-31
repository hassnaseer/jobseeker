import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/user-role.enum';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { CatalogsService } from '@/modules/catalogs/catalogs.service';
import { CatalogStatus } from '@/modules/catalogs/enums/catalog-status.enum';
import { JobsService } from '@/modules/jobs/jobs.service';
import { JobStatus } from '@/modules/jobs/enums/job-status.enum';

/**
 * The actual moderation actions (pause/close a job, pause a catalog) reuse
 * the existing owner endpoints — JobsService.assertOwner and
 * CatalogsService.assertOwner both bypass ownership for SUPER_ADMIN, so
 * POST /jobs/:id/pause and POST /catalogs/:id/pause already work for SA.
 * This controller only adds the admin-wide queue views those endpoints'
 * owner-scoped/public-scoped list methods don't provide.
 */
@ApiTags('admin-moderation')
@ApiBearerAuth()
@Roles(UserRole.SUPER_ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminModerationController {
  constructor(
    private readonly jobsService: JobsService,
    private readonly catalogsService: CatalogsService,
  ) {}

  @Get('jobs')
  listJobs(@Query('status') status?: JobStatus) {
    return this.jobsService.listAllForAdmin(status);
  }

  @Get('catalogs')
  listCatalogs(@Query('status') status?: CatalogStatus) {
    return this.catalogsService.listAllForAdmin(status);
  }
}
