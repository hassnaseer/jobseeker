import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '@/common/enums/user-role.enum';
import { AIDecisionLog } from '@/modules/ai/entities/ai-decision-log.entity';
import { AIMatchScore } from '@/modules/ai/entities/ai-match-score.entity';
import { AISuggestion } from '@/modules/ai/entities/ai-suggestion.entity';
import { AiAutonomyLevel } from '@/modules/ai/enums/ai-autonomy-level.enum';
import { AiDecisionActor } from '@/modules/ai/enums/ai-decision-actor.enum';
import { AiSuggestionType } from '@/modules/ai/enums/ai-suggestion-type.enum';
import {
  MATCH_SCORING_MODEL_VERSION,
  MatchScoringService,
} from '@/modules/ai/match-scoring.service';
import { ApplicationsService } from '@/modules/applications/applications.service';
import { ApplicationStatus } from '@/modules/applications/enums/application-status.enum';
import { CategoriesService } from '@/modules/categories/categories.service';
import { Job } from '@/modules/jobs/entities/job.entity';
import { JobStatus } from '@/modules/jobs/enums/job-status.enum';
import { PaymentsService } from '@/modules/payments/payments.service';
import { SeekerProfile } from '@/modules/profiles/entities/seeker-profile.entity';
import { User } from '@/modules/users/entities/user.entity';

const RECOMMEND_JOBS_LIMIT = 10;
const SHORTLIST_TOP_N = 5;
const JOB_SCAN_CAP = 200;

@Injectable()
export class AiService {
  constructor(
    @InjectRepository(AIMatchScore)
    private readonly matchScoreRepository: Repository<AIMatchScore>,
    @InjectRepository(AISuggestion)
    private readonly suggestionRepository: Repository<AISuggestion>,
    @InjectRepository(AIDecisionLog)
    private readonly decisionLogRepository: Repository<AIDecisionLog>,
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    @InjectRepository(SeekerProfile)
    private readonly seekerProfileRepository: Repository<SeekerProfile>,
    private readonly matchScoringService: MatchScoringService,
    private readonly categoriesService: CategoriesService,
    private readonly applicationsService: ApplicationsService,
    private readonly paymentsService: PaymentsService,
  ) {}

  private async upsertMatchScore(
    seekerId: string,
    jobId: string,
    score: number,
    reasons: string[],
  ): Promise<AIMatchScore> {
    let row = await this.matchScoreRepository.findOne({ where: { seekerId, jobId } });
    if (!row) {
      row = this.matchScoreRepository.create({ seekerId, jobId });
    }
    row.score = score;
    row.reasons = reasons;
    row.modelVersion = MATCH_SCORING_MODEL_VERSION;
    row.computedAt = new Date();
    return this.matchScoreRepository.save(row);
  }

  /** Spec §21.1 Phase 1 + §11 "Recommended / Best Match" dashboard sections. */
  async recommendJobsForSeeker(
    seeker: User,
  ): Promise<Array<{ job: Job; score: number; reasons: string[] }>> {
    if (!seeker.roles.includes(UserRole.SEEKER)) {
      throw new ForbiddenException('You do not hold the SEEKER role');
    }
    const seekerProfile = await this.seekerProfileRepository.findOne({
      where: { userId: seeker.id },
    });
    if (!seekerProfile) {
      throw new BadRequestException(
        'Complete your seeker profile before requesting recommendations',
      );
    }

    const selected = await this.categoriesService.getUserCategories(seeker.id, UserRole.SEEKER);
    const categoryIds = selected.map((uc) => uc.categoryId);

    const jobs = await this.jobRepository.find({
      where: { status: JobStatus.OPEN, isPaused: false },
      order: { createdAt: 'DESC' },
      take: JOB_SCAN_CAP,
    });

    const scored = jobs.map((job) => ({
      job,
      ...this.matchScoringService.score(seekerProfile, categoryIds, job),
    }));
    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, RECOMMEND_JOBS_LIMIT);

    await Promise.all(
      top.map((r) => this.upsertMatchScore(seeker.id, r.job.id, r.score, r.reasons)),
    );

    return top;
  }

  /**
   * Spec §21.1 Phase 3 "AI shortlisting". Ranks applicants for a job and,
   * per ai_autonomy_level, either just suggests (ASSIST) or auto-marks the
   * top N as SHORTLISTED (SHORTLIST/AUTO) — hire/reject always stays a
   * separate, explicit human action via the existing applications
   * endpoints. AUTO is deliberately treated the same as SHORTLIST here:
   * spec §21.6 requires legal sign-off before any auto-hire/reject, which
   * this build does not implement regardless of the config value.
   */
  async shortlistApplicants(actor: User, jobId: string): Promise<ScoredApplicantResult[]> {
    const applications = await this.applicationsService.listForJob(actor, jobId);
    const job = await this.jobRepository.findOne({ where: { id: jobId } });
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const candidates = applications.filter((a) => a.status === ApplicationStatus.PENDING);

    const scored: ScoredApplicantResult[] = [];
    for (const application of candidates) {
      const seekerProfile = await this.seekerProfileRepository.findOne({
        where: { userId: application.seekerId },
      });
      if (!seekerProfile) {
        continue;
      }
      const selected = await this.categoriesService.getUserCategories(
        application.seekerId,
        UserRole.SEEKER,
      );
      const categoryIds = selected.map((uc) => uc.categoryId);
      const { score, reasons } = this.matchScoringService.score(seekerProfile, categoryIds, job);
      await this.upsertMatchScore(application.seekerId, jobId, score, reasons);
      scored.push({
        applicationId: application.id,
        seekerId: application.seekerId,
        score,
        reasons,
        autoShortlisted: false,
      });
    }

    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, SHORTLIST_TOP_N);

    const config = await this.paymentsService.getConfig();

    if (config.aiAutonomyLevel === AiAutonomyLevel.ASSIST) {
      await this.suggestionRepository.save(
        this.suggestionRepository.create({
          userId: actor.id,
          type: AiSuggestionType.SHORTLIST,
          input: { jobId },
          output: { top },
          modelVersion: MATCH_SCORING_MODEL_VERSION,
        }),
      );
    } else {
      for (const result of top) {
        await this.applicationsService.shortlist(actor, result.applicationId);
        result.autoShortlisted = true;
      }
    }

    await this.decisionLogRepository.save(
      this.decisionLogRepository.create({
        actor: AiDecisionActor.AI,
        autonomyLevel: config.aiAutonomyLevel,
        entityType: 'Job',
        entityId: jobId,
        decision:
          config.aiAutonomyLevel === AiAutonomyLevel.ASSIST
            ? 'SUGGESTED_SHORTLIST'
            : 'AUTO_SHORTLISTED',
        reasons: top.map((r) => `${r.applicationId}: ${r.score}`),
        confirmedBy: null,
        modelVersion: MATCH_SCORING_MODEL_VERSION,
      }),
    );

    return top;
  }

  async listMatchScoresForJob(jobId: string): Promise<AIMatchScore[]> {
    return this.matchScoreRepository.find({ where: { jobId }, order: { score: 'DESC' } });
  }
}

interface ScoredApplicantResult {
  applicationId: string;
  seekerId: string;
  score: number;
  reasons: string[];
  autoShortlisted: boolean;
}
