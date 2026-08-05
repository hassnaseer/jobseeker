import { apiClient } from '@/api/client';

export interface AvatarFile {
  uri: string;
  type: string;
  name: string;
}

export async function uploadAvatar(file: AvatarFile): Promise<{ avatarUrl: string }> {
  const formData = new FormData();
  formData.append('file', file as unknown as Blob);
  const { data } = await apiClient.post<{ avatarUrl: string }>('/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
