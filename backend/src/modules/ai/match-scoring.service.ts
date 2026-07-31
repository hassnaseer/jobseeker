import { Injectable } from '@nestjs/common';
import { ExperienceLevel } from '@/common/enums/experience-level.enum';
import { Job } from '@/modules/jobs/entities/job.entity';
import { JobType } from '@/modules/jobs/enums/job-type.enum';
import { SeekerProfile } from '@/modules/profiles/entities/seeker-profile.entity';

export const MATCH_SCORING_MODEL_VERSION = 'heuristic-v1';

export interface MatchScoreResult {
  score: number;
  reasons: string[];
}

const EXPERIENCE_RANK: Record<ExperienceLevel, number> = {
  [ExperienceLevel.ENTRY]: 0,
  [ExperienceLevel.INTERMEDIATE]: 1,
  [ExperienceLevel.EXPERT]: 2,
};

/**
 * Deterministic, zero-cost fit scorer (spec §21.1 Phase 1 "precomputed,
 * cheap"). Deliberately scores only on category/skills/experience/rate —
 * never name, gender, or location — per the §21.4 fairness rules. No LLM
 * call, so no ai_provider/spend-cap config is needed for this to work;
 * model_version is a plain string precisely so a real embedding-based
 * scorer can replace this later without changing the AIMatchScore shape.
 */
@Injectable()
export class MatchScoringService {
  score(seekerProfile: SeekerProfile, seekerCategoryIds: string[], job: Job): MatchScoreResult {
    const reasons: string[] = [];
    let score = 0;

    // Category match — 40 pts
    if (seekerCategoryIds.includes(job.categoryId)) {
      score += 40;
      reasons.push('Category matches one of your selected categories');
    } else {
      reasons.push("Category isn't one of your selected categories");
    }

    // Skill overlap — up to 30 pts
    const jobSkills = new Set(job.skillsRequired.map((s) => s.toLowerCase().trim()));
    const seekerSkills = new Set(seekerProfile.skills.map((s) => s.toLowerCase().trim()));
    if (jobSkills.size > 0) {
      const overlap = [...jobSkills].filter((s) => seekerSkills.has(s));
      const overlapRatio = overlap.length / jobSkills.size;
      const skillPoints = Math.round(overlapRatio * 30);
      score += skillPoints;
      if (overlap.length > 0) {
        reasons.push(
          `Matches ${overlap.length}/${jobSkills.size} required skills: ${overlap.join(', ')}`,
        );
      } else {
        reasons.push('No overlap with required skills');
      }
    } else {
      score += 30;
      reasons.push('No specific skills required');
    }

    // Experience level — up to 15 pts
    if (job.experienceLevel && seekerProfile.experienceLevel) {
      const diff = Math.abs(
        EXPERIENCE_RANK[job.experienceLevel] - EXPERIENCE_RANK[seekerProfile.experienceLevel],
      );
      if (diff === 0) {
        score += 15;
        reasons.push(`Experience level matches (${seekerProfile.experienceLevel})`);
      } else if (diff === 1) {
        score += 7;
        reasons.push('Experience level is adjacent to what the job asks for');
      } else {
        reasons.push('Experience level does not match');
      }
    } else {
      score += 8;
      reasons.push('Experience level not specified on one side');
    }

    // Rate/budget compatibility — up to 15 pts
    if (job.jobType === JobType.HOURLY && seekerProfile.hourlyRate != null) {
      const min = job.hourlyRateMin ?? 0;
      const max = job.hourlyRateMax ?? Number.POSITIVE_INFINITY;
      if (seekerProfile.hourlyRate >= min && seekerProfile.hourlyRate <= max) {
        score += 15;
        reasons.push("Your hourly rate is within the job's budget range");
      } else {
        reasons.push("Your hourly rate is outside the job's budget range");
      }
    } else {
      score += 15;
      reasons.push('Rate compatibility not applicable for this job type');
    }

    return { score: Math.max(0, Math.min(100, score)), reasons };
  }
}
