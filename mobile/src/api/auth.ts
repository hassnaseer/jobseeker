import { apiClient } from '@/api/client';

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  revokeOtherSessions?: boolean;
}

export async function changePassword(dto: ChangePasswordInput): Promise<{ message: string }> {
  const { data } = await apiClient.patch<{ message: string }>('/auth/password', dto);
  return data;
}
