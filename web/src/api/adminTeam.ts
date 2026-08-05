import { apiClient } from '@/api/client';
import type { AdminPermission, AdminTeamMember } from '@/types/admin';

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
