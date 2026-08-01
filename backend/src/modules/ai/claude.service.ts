import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { Job } from '@/modules/jobs/entities/job.entity';
import { SeekerProfile } from '@/modules/profiles/entities/seeker-profile.entity';
import type { MatchScoreResult } from '@/modules/ai/match-scoring.service';

const SCORE_TOOL_NAME = 'submit_match_score';

/**
 * Wraps the Anthropic SDK for the AI Recruiter's match-scoring path. Boots
 * to a disabled no-op state when ANTHROPIC_API_KEY isn't set — mirrors
 * FirebaseService's graceful-degradation pattern so the app (and the
 * existing free heuristic scorer) works fine before/without this
 * credential. Callers must check isEnabled before calling scoreMatch.
 */
@Injectable()
export class ClaudeService implements OnModuleInit {
  private readonly logger = new Logger(ClaudeService.name);
  private client: Anthropic | null = null;
  private model = 'claude-sonnet-4-5';

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const apiKey = this.configService.get<string>('anthropic.apiKey');
    this.model = this.configService.get<string>('anthropic.model') ?? this.model;
    if (!apiKey) {
      this.logger.warn(
        'ANTHROPIC_API_KEY not set — AI Recruiter match scoring falls back to the heuristic scorer.',
      );
      return;
    }
    this.client = new Anthropic({ apiKey });
    this.logger.log(`Anthropic client initialized (model: ${this.model}).`);
  }

  get isEnabled(): boolean {
    return this.client !== null;
  }

  modelVersion(modelOverride?: string | null): string {
    return `claude:${modelOverride || this.model}`;
  }

  private withTimeout<T>(promise: Promise<T>, label: string, ms = 15_000): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms),
      ),
    ]);
  }

  /**
   * Scores how well a seeker fits a job, with a real explanation instead of
   * templated strings. Deliberately fed only category/skills/experience/
   * rate/bio — never name, gender, or location — preserving the same
   * fairness rule (spec §21.4) the heuristic scorer documents. Throws on
   * any failure (missing client, network, malformed response); callers are
   * expected to catch and fall back to the heuristic scorer.
   */
  async scoreMatch(
    seekerProfile: SeekerProfile,
    seekerCategoryIds: string[],
    job: Job,
    modelOverride?: string | null,
  ): Promise<MatchScoreResult> {
    if (!this.client) {
      throw new Error('Claude is not configured');
    }
    const model = modelOverride || this.model;

    const seekerSummary = {
      title: seekerProfile.title,
      bio: seekerProfile.bio,
      skills: seekerProfile.skills,
      experienceLevel: seekerProfile.experienceLevel,
      hourlyRate: seekerProfile.hourlyRate,
      currency: seekerProfile.currency,
      selectedCategoryIds: seekerCategoryIds,
    };
    const jobSummary = {
      title: job.title,
      description: job.description,
      categoryId: job.categoryId,
      skillsRequired: job.skillsRequired,
      jobType: job.jobType,
      pricingModel: job.pricingModel,
      experienceLevel: job.experienceLevel,
      budgetAmount: job.budgetAmount,
      hourlyRateMin: job.hourlyRateMin,
      hourlyRateMax: job.hourlyRateMax,
      currency: job.currency,
    };

    const response = await this.withTimeout(
      this.client.messages.create({
        model,
        max_tokens: 512,
        system:
          'You are a neutral job-matching assistant for a freelance marketplace. Score how well a ' +
          'freelancer fits a job on a 0-100 scale, based only on skills, experience level, category ' +
          'fit, rate/budget compatibility, and how relevant their bio is to the job description. ' +
          'Never factor in or mention name, gender, age, location, nationality, or any other ' +
          'protected characteristic — none are provided to you, and none should be inferred or ' +
          'assumed. Give 2-4 short, concrete reasons a client or freelancer would find useful.',
        messages: [
          {
            role: 'user',
            content: `Freelancer profile:\n${JSON.stringify(seekerSummary, null, 2)}\n\nJob:\n${JSON.stringify(jobSummary, null, 2)}`,
          },
        ],
        tools: [
          {
            name: SCORE_TOOL_NAME,
            description: 'Submit the computed match score and reasons.',
            input_schema: {
              type: 'object',
              properties: {
                score: { type: 'integer', minimum: 0, maximum: 100 },
                reasons: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 4 },
              },
              required: ['score', 'reasons'],
            },
          },
        ],
        tool_choice: { type: 'tool', name: SCORE_TOOL_NAME },
      }),
      'Claude match scoring',
    );

    const toolUse = response.content.find((block) => block.type === 'tool_use');
    if (!toolUse || toolUse.type !== 'tool_use') {
      throw new Error('Claude did not return a tool_use block');
    }
    const result = toolUse.input as { score: number; reasons: string[] };
    if (typeof result.score !== 'number' || !Array.isArray(result.reasons)) {
      throw new Error('Claude returned a malformed match score');
    }

    return {
      score: Math.max(0, Math.min(100, Math.round(result.score))),
      reasons: result.reasons.slice(0, 4),
    };
  }
}
