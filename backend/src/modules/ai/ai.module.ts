import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiController } from '@/modules/ai/ai.controller';
import { AiService } from '@/modules/ai/ai.service';
import { ClaudeService } from '@/modules/ai/claude.service';
import { AIDecisionLog } from '@/modules/ai/entities/ai-decision-log.entity';
import { AIMatchScore } from '@/modules/ai/entities/ai-match-score.entity';
import { AISuggestion } from '@/modules/ai/entities/ai-suggestion.entity';
import { MatchScoringService } from '@/modules/ai/match-scoring.service';
import { ApplicationsModule } from '@/modules/applications/applications.module';
import { CategoriesModule } from '@/modules/categories/categories.module';
import { Job } from '@/modules/jobs/entities/job.entity';
import { PaymentsModule } from '@/modules/payments/payments.module';
import { SeekerProfile } from '@/modules/profiles/entities/seeker-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AIMatchScore, AISuggestion, AIDecisionLog, Job, SeekerProfile]),
    CategoriesModule,
    ApplicationsModule,
    PaymentsModule,
  ],
  controllers: [AiController],
  providers: [AiService, MatchScoringService, ClaudeService],
  exports: [AiService],
})
export class AiModule {}
