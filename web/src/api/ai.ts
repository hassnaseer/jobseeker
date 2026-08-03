import { apiClient } from '@/api/client';
import type { AiMatchScore, RecommendedJob, ScoredApplicant } from '@/types/domain';

export async function getRecommendedJobs(): Promise<RecommendedJob[]> {
  const { data } = await apiClient.get<RecommendedJob[]>('/ai/recommended-jobs');
  return data;
}

export async function shortlistApplicants(jobId: string): Promise<ScoredApplicant[]> {
  const { data } = await apiClient.post<ScoredApplicant[]>(`/ai/jobs/${jobId}/shortlist`);
  return data;
}

export async function getMatchScoresForJob(jobId: string): Promise<AiMatchScore[]> {
  const { data } = await apiClient.get<AiMatchScore[]>(`/ai/jobs/${jobId}/match-scores`);
  return data;
}
