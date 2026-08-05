import { apiClient } from '@/api/client';
import type { Application, ApplicationStatus } from '@/types/domain';

export interface CreateApplicationInput {
  coverLetter: string;
  bidAmount?: number;
  proposedHourlyRate?: number;
  currency?: string;
  estimatedDuration?: string;
  attachments?: string[];
}

export async function applyToJob(jobId: string, dto: CreateApplicationInput): Promise<Application> {
  const { data } = await apiClient.post<Application>(`/jobs/${jobId}/applications`, dto);
  return data;
}

export async function listApplicationsForJob(
  jobId: string,
  status?: ApplicationStatus,
): Promise<Application[]> {
  const { data } = await apiClient.get<Application[]>(`/jobs/${jobId}/applications`, {
    params: status ? { status } : undefined,
  });
  return data;
}

export async function listMyApplications(): Promise<Application[]> {
  const { data } = await apiClient.get<Application[]>('/applications/mine');
  return data;
}

export async function getApplicationDetail(id: string): Promise<Application> {
  const { data } = await apiClient.get<Application>(`/applications/${id}`);
  return data;
}

export async function shortlistApplication(id: string): Promise<Application> {
  const { data } = await apiClient.post<Application>(`/applications/${id}/shortlist`);
  return data;
}

export async function acceptApplication(id: string): Promise<Application> {
  const { data } = await apiClient.post<Application>(`/applications/${id}/accept`);
  return data;
}

export async function rejectApplication(id: string): Promise<Application> {
  const { data } = await apiClient.post<Application>(`/applications/${id}/reject`);
  return data;
}

export async function withdrawApplication(id: string): Promise<Application> {
  const { data } = await apiClient.post<Application>(`/applications/${id}/withdraw`);
  return data;
}
