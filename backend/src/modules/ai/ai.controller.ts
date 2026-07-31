import { Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { AiService } from '@/modules/ai/ai.service';
import { User } from '@/modules/users/entities/user.entity';

@ApiTags('ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('recommended-jobs')
  recommendedJobs(@CurrentUser() user: User) {
    return this.aiService.recommendJobsForSeeker(user);
  }

  @Post('jobs/:jobId/shortlist')
  shortlist(@CurrentUser() user: User, @Param('jobId', ParseUUIDPipe) jobId: string) {
    return this.aiService.shortlistApplicants(user, jobId);
  }

  @Get('jobs/:jobId/match-scores')
  matchScores(@Param('jobId', ParseUUIDPipe) jobId: string) {
    return this.aiService.listMatchScoresForJob(jobId);
  }
}
