import { apiClient } from '@/api/client';

export async function uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post<{ avatarUrl: string }>('/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
