import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CreateJobDto } from '@/modules/jobs/dto/create-job.dto';
import { QueryJobsDto } from '@/modules/jobs/dto/query-jobs.dto';
import { UpdateJobDto } from '@/modules/jobs/dto/update-job.dto';
import { JobsService } from '@/modules/jobs/jobs.service';
import { User } from '@/modules/users/entities/user.entity';

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateJobDto) {
    return this.jobsService.create(user, dto);
  }

  @Get()
  list(@Query() query: QueryJobsDto) {
    return this.jobsService.listPublic(query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('mine')
  mine(@CurrentUser() user: User) {
    return this.jobsService.listMine(user);
  }

  @Get(':id')
  detail(@Param('id', ParseUUIDPipe) id: string) {
    return this.jobsService.getPublicDetail(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateJobDto,
  ) {
    return this.jobsService.update(user, id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/publish')
  publish(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.jobsService.publish(user, id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/pause')
  pause(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.jobsService.pause(user, id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/resume')
  resume(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.jobsService.resume(user, id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/close')
  close(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.jobsService.close(user, id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/duplicate')
  duplicate(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.jobsService.duplicate(user, id);
  }
}
