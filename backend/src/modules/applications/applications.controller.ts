import {
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
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { ApplicationsService } from '@/modules/applications/applications.service';
import { CreateApplicationDto } from '@/modules/applications/dto/create-application.dto';
import { ApplicationStatus } from '@/modules/applications/enums/application-status.enum';
import { User } from '@/modules/users/entities/user.entity';

@ApiTags('applications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post('jobs/:jobId/applications')
  apply(
    @CurrentUser() seeker: User,
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @Body() dto: CreateApplicationDto,
  ) {
    return this.applicationsService.create(seeker, jobId, dto);
  }

  @Get('jobs/:jobId/applications')
  listForJob(
    @CurrentUser() client: User,
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @Query('status') status?: ApplicationStatus,
  ) {
    return this.applicationsService.listForJob(client, jobId, status);
  }

  @Get('applications/mine')
  mine(@CurrentUser() seeker: User) {
    return this.applicationsService.listMine(seeker);
  }

  @Get('applications/:id')
  detail(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.applicationsService.getDetailForUser(user, id);
  }

  @Post('applications/:id/shortlist')
  shortlist(@CurrentUser() client: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.applicationsService.shortlist(client, id);
  }

  @Post('applications/:id/accept')
  accept(@CurrentUser() client: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.applicationsService.accept(client, id);
  }

  @Post('applications/:id/reject')
  reject(@CurrentUser() client: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.applicationsService.reject(client, id);
  }

  @Post('applications/:id/withdraw')
  withdraw(@CurrentUser() seeker: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.applicationsService.withdraw(seeker, id);
  }
}
