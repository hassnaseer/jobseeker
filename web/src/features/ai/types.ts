import type { AiMatchScore, RecommendedJob, ScoredApplicant } from '@/types/domain';

export interface AiState {
  recommendedJobs: RecommendedJob[];
  shortlistResult: ScoredApplicant[];
  matchScores: AiMatchScore[];
  status: 'idle' | 'loading' | 'saving' | 'ready' | 'error';
  error: string | null;
}

export const AI_REQUEST = 'ai/REQUEST';
export const AI_MUTATE_REQUEST = 'ai/MUTATE_REQUEST';
export const AI_RECOMMENDED_JOBS_SUCCESS = 'ai/RECOMMENDED_JOBS_SUCCESS';
export const AI_SHORTLIST_SUCCESS = 'ai/SHORTLIST_SUCCESS';
export const AI_MATCH_SCORES_SUCCESS = 'ai/MATCH_SCORES_SUCCESS';
export const AI_FAILURE = 'ai/FAILURE';

interface RequestAction {
  type: typeof AI_REQUEST;
}
interface MutateRequestAction {
  type: typeof AI_MUTATE_REQUEST;
}
interface RecommendedJobsSuccessAction {
  type: typeof AI_RECOMMENDED_JOBS_SUCCESS;
  payload: RecommendedJob[];
}
interface ShortlistSuccessAction {
  type: typeof AI_SHORTLIST_SUCCESS;
  payload: ScoredApplicant[];
}
interface MatchScoresSuccessAction {
  type: typeof AI_MATCH_SCORES_SUCCESS;
  payload: AiMatchScore[];
}
interface FailureAction {
  type: typeof AI_FAILURE;
  payload: string;
}

export type AiAction =
  | RequestAction
  | MutateRequestAction
  | RecommendedJobsSuccessAction
  | ShortlistSuccessAction
  | MatchScoresSuccessAction
  | FailureAction;
