import { apiClient } from '@/api/client';
import type {
  AdminPermission,
  AdminTeamMember,
  AnalyticsOverview,
  DisputeResolutionType,
  DisputeStatus,
  PlatformConfig,
} from '@/types/admin';
import type { Dispute } from '@/types/domain';
import type { MyProfile, RoleProfileStatusInfo } from '@/types/profile';

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

// ---- Platform config ----

export async function getPlatformConfig(): Promise<PlatformConfig> {
  const { data } = await apiClient.get<PlatformConfig>('/payments/admin/config');
  return data;
}

export async function updatePlatformConfig(dto: Partial<PlatformConfig>): Promise<PlatformConfig> {
  const { data } = await apiClient.post<PlatformConfig>('/payments/admin/config', dto);
  return data;
}

// ---- Team & permissions ----

export async function listTeamMembers(): Promise<AdminTeamMember[]> {
  const { data } = await apiClient.get<AdminTeamMember[]>('/admin/team');
  return data;
}

export async function inviteTeamMember(dto: {
  name: string;
  email: string;
  permissions: AdminPermission[];
}): Promise<AdminTeamMember> {
  const { data } = await apiClient.post<AdminTeamMember>('/admin/team/invite', dto);
  return data;
}

export async function updateTeamMemberPermissions(
  id: string,
  permissions: AdminPermission[],
): Promise<AdminTeamMember> {
  const { data } = await apiClient.patch<AdminTeamMember>(`/admin/team/${id}/permissions`, { permissions });
  return data;
}

export async function removeTeamMember(id: string): Promise<void> {
  await apiClient.delete(`/admin/team/${id}`);
}
