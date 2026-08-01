import { apiClient } from '@/api/client';
import type { Job } from '@/types/domain';

export interface QueryJobsParams {
  keyword?: string;
  categoryId?: string;
  jobType?: string;
  locationType?: string;
  experienceLevel?: string;
  budgetMin?: number;
  budgetMax?: number;
  sortBy?: 'NEWEST' | 'BUDGET_HIGH' | 'BUDGET_LOW';
  page?: number;
  limit?: number;
}

export interface CreateJobInput {
  title: string;
  description: string;
  categoryId: string;
  skillsRequired?: string[];
  jobType: string;
  pricingModel?: string;
  trackingMode?: string;
  locationType: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  checkinRequired?: boolean;
  budgetAmount?: number;
  currency?: string;
  hourlyRateMin?: number;
  hourlyRateMax?: number;
  estimatedHours?: number;
  duration?: string;
  experienceLevel?: string;
  attachments?: string[];
  numberOfOpenings?: number;
  deadline?: string;
  publish?: boolean;
}

export type UpdateJobInput = Partial<CreateJobInput>;

export interface PaginatedJobs {
  items: Job[];
  total: number;
  page: number;
  limit: number;
}

export async function listPublicJobs(params: QueryJobsParams): Promise<PaginatedJobs> {
  const { data } = await apiClient.get<PaginatedJobs>('/jobs', { params });
  return data;
}

export async function listMyJobs(): Promise<Job[]> {
  const { data } = await apiClient.get<Job[]>('/jobs/mine');
  return data;
}

export async function getJobDetail(id: string): Promise<Job> {
  const { data } = await apiClient.get<Job>(`/jobs/${id}`);
  return data;
}

export async function createJob(dto: CreateJobInput): Promise<Job> {
  const { data } = await apiClient.post<Job>('/jobs', dto);
  return data;
}

export async function updateJob(id: string, dto: UpdateJobInput): Promise<Job> {
  const { data } = await apiClient.patch<Job>(`/jobs/${id}`, dto);
  return data;
}

export async function publishJob(id: string): Promise<Job> {
  const { data } = await apiClient.post<Job>(`/jobs/${id}/publish`);
  return data;
}

export async function pauseJob(id: string): Promise<Job> {
  const { data } = await apiClient.post<Job>(`/jobs/${id}/pause`);
  return data;
}

export async function resumeJob(id: string): Promise<Job> {
  const { data } = await apiClient.post<Job>(`/jobs/${id}/resume`);
  return data;
}

export async function closeJob(id: string): Promise<Job> {
  const { data } = await apiClient.post<Job>(`/jobs/${id}/close`);
  return data;
}

export async function duplicateJob(id: string): Promise<Job> {
  const { data } = await apiClient.post<Job>(`/jobs/${id}/duplicate`);
  return data;
}
