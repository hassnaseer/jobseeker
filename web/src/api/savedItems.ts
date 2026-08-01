import { apiClient } from '@/api/client';
import type { SavedItem, SavedTargetType } from '@/types/domain';

export async function saveItem(targetType: SavedTargetType, targetId: string): Promise<SavedItem> {
  const { data } = await apiClient.post<SavedItem>('/saved-items', { targetType, targetId });
  return data;
}

export async function unsaveItem(targetType: SavedTargetType, targetId: string): Promise<void> {
  await apiClient.delete('/saved-items', { data: { targetType, targetId } });
}

export async function listSavedItems(targetType?: SavedTargetType): Promise<SavedItem[]> {
  const { data } = await apiClient.get<SavedItem[]>('/saved-items', {
    params: targetType ? { targetType } : undefined,
  });
  return data;
}
