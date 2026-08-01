import { apiClient } from '@/api/client';
import type { Job } from '@/types/domain';
import type { ProjectCatalog } from '@/types/domain';
import type {
  AnalyticsOverview,
  Dispute,
  DisputeResolutionType,
  DisputeStatus,
  PlatformConfig,
  Report,
  ReportStatus,
  RevenueReport,
} from '@/types/admin';
import type { RoleProfileStatusInfo } from '@/types/profile';
import type { User, UserRole } from '@/types/user';
import type { MyProfile } from '@/types/profile';

export interface PaginatedUsers {
  items: User[];
  total: number;
  page: number;
  limit: number;
}

export async function listUsers(params: {
  q?: string;
  role?: UserRole;
  page?: number;
  limit?: number;
}): Promise<PaginatedUsers> {
  const { data } = await apiClient.get<PaginatedUsers>('/admin/users', { params });
  return data;
}

export async function getUserDetail(id: string): Promise<User> {
  const { data } = await apiClient.get<User>(`/admin/users/${id}`);
  return data;
}

export async function suspendUser(id: string): Promise<User> {
  const { data } = await apiClient.post<User>(`/admin/users/${id}/suspend`);
  return data;
}

export async function reactivateUser(id: string): Promise<User> {
  const { data } = await apiClient.post<User>(`/admin/users/${id}/reactivate`);
  return data;
}

export async function banUser(id: string): Promise<User> {
  const { data } = await apiClient.post<User>(`/admin/users/${id}/ban`);
  return data;
}

export async function verifyUserEmail(id: string): Promise<User> {
  const { data } = await apiClient.post<User>(`/admin/users/${id}/verify-email`);
  return data;
}

export interface ImpersonateResult {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export async function impersonateUser(id: string): Promise<ImpersonateResult> {
  const { data } = await apiClient.post<ImpersonateResult>(`/admin/users/${id}/impersonate`);
  return data;
}

// ---- Profile approvals ----

export async function listPendingApprovals(role?: 'CLIENT' | 'SEEKER'): Promise<RoleProfileStatusInfo[]> {
  const { data } = await apiClient.get<RoleProfileStatusInfo[]>('/profiles/admin/pending', {
    params: role ? { role } : undefined,
  });
  return data;
}

export async function getApprovalDetail(userId: string, role: 'CLIENT' | 'SEEKER'): Promise<MyProfile> {
  const { data } = await apiClient.get<MyProfile>(`/profiles/admin/${userId}/${role}`);
  return data;
}

export async function approveProfile(userId: string, role: 'CLIENT' | 'SEEKER'): Promise<RoleProfileStatusInfo> {
  const { data } = await apiClient.post<RoleProfileStatusInfo>(`/profiles/admin/${userId}/${role}/approve`);
  return data;
}

export async function rejectProfile(
  userId: string,
  role: 'CLIENT' | 'SEEKER',
  reason: string,
  rejectKyc?: boolean,
): Promise<RoleProfileStatusInfo> {
  const { data } = await apiClient.post<RoleProfileStatusInfo>(`/profiles/admin/${userId}/${role}/reject`, {
    reason,
    rejectKyc,
  });
  return data;
}

// ---- Moderation ----

export async function listModerationJobs(status?: string): Promise<Job[]> {
  const { data } = await apiClient.get<Job[]>('/admin/jobs', { params: status ? { status } : undefined });
  return data;
}

export async function listModerationCatalogs(status?: string): Promise<ProjectCatalog[]> {
  const { data } = await apiClient.get<ProjectCatalog[]>('/admin/catalogs', {
    params: status ? { status } : undefined,
  });
  return data;
}

// ---- Reports ----

export async function listReports(status?: ReportStatus): Promise<Report[]> {
  const { data } = await apiClient.get<Report[]>('/admin/reports', {
    params: status ? { status } : undefined,
  });
  return data;
}

export async function resolveReport(id: string, status: 'REVIEWED' | 'DISMISSED'): Promise<Report> {
  const { data } = await apiClient.post<Report>(`/admin/reports/${id}/resolve`, { status });
  return data;
}

// ---- Disputes ----

export async function listDisputesQueue(status?: DisputeStatus): Promise<Dispute[]> {
  const { data } = await apiClient.get<Dispute[]>('/admin/disputes', {
    params: status ? { status } : undefined,
  });
  return data;
}

export async function markDisputeUnderReview(id: string): Promise<Dispute> {
  const { data } = await apiClient.post<Dispute>(`/admin/disputes/${id}/under-review`);
  return data;
}

export interface ResolveDisputeInput {
  resolutionType: DisputeResolutionType;
  resolutionNote: string;
  seekerAmount?: number;
}

export async function resolveDispute(id: string, dto: ResolveDisputeInput): Promise<Dispute> {
  const { data } = await apiClient.post<Dispute>(`/admin/disputes/${id}/resolve`, dto);
  return data;
}

// ---- Analytics ----

export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  const { data } = await apiClient.get<AnalyticsOverview>('/admin/analytics/overview');
  return data;
}

export async function getRevenueReport(from?: string, to?: string): Promise<RevenueReport> {
  const { data } = await apiClient.get<RevenueReport>('/admin/analytics/revenue', {
    params: { from, to },
  });
  return data;
}

// ---- Platform config ----

export async function getPlatformConfig(): Promise<PlatformConfig> {
  const { data } = await apiClient.get<PlatformConfig>('/payments/admin/config');
  return data;
}

export async function updatePlatformConfig(dto: Partial<PlatformConfig>): Promise<PlatformConfig> {
  const { data } = await apiClient.post<PlatformConfig>('/payments/admin/config', dto);
  return data;
}
