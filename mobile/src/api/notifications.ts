import { apiClient } from '@/api/client';
import type { Notification, NotificationEventType, NotificationPreference } from '@/types/domain';

export async function listMyNotifications(options: { unreadOnly?: boolean; before?: string } = {}): Promise<
  Notification[]
> {
  const { data } = await apiClient.get<Notification[]>('/notifications', {
    params: {
      unreadOnly: options.unreadOnly ? 'true' : undefined,
      before: options.before,
    },
  });
  return data;
}

export async function getUnreadCount(): Promise<{ count: number }> {
  const { data } = await apiClient.get<{ count: number }>('/notifications/unread-count');
  return data;
}

export async function markNotificationRead(id: string): Promise<Notification> {
  const { data } = await apiClient.post<Notification>(`/notifications/${id}/read`);
  return data;
}

export async function markAllNotificationsRead(): Promise<unknown> {
  const { data } = await apiClient.post('/notifications/mark-all-read');
  return data;
}

export async function listPreferences(): Promise<NotificationPreference[]> {
  const { data } = await apiClient.get<NotificationPreference[]>('/notifications/preferences');
  return data;
}

export interface UpdatePreferenceInput {
  emailEnabled?: boolean;
  inAppEnabled?: boolean;
  pushEnabled?: boolean;
}

export async function updatePreference(
  eventType: NotificationEventType,
  dto: UpdatePreferenceInput,
): Promise<NotificationPreference> {
  const { data } = await apiClient.patch<NotificationPreference>(
    `/notifications/preferences/${eventType}`,
    dto,
  );
  return data;
}
