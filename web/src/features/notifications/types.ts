import type { Notification, NotificationPreference } from '@/types/domain';

export interface NotificationsState {
  items: Notification[];
  unreadCount: number;
  preferences: NotificationPreference[];
  status: 'idle' | 'loading' | 'saving' | 'ready' | 'error';
  error: string | null;
}

export const NOTIFICATIONS_LIST_REQUEST = 'notifications/LIST_REQUEST';
export const NOTIFICATIONS_LIST_SUCCESS = 'notifications/LIST_SUCCESS';
export const NOTIFICATIONS_UNREAD_SUCCESS = 'notifications/UNREAD_SUCCESS';
export const NOTIFICATIONS_PREFERENCES_SUCCESS = 'notifications/PREFERENCES_SUCCESS';
export const NOTIFICATIONS_MUTATE_REQUEST = 'notifications/MUTATE_REQUEST';
export const NOTIFICATIONS_FAILURE = 'notifications/FAILURE';

interface ListRequestAction {
  type: typeof NOTIFICATIONS_LIST_REQUEST;
}
interface ListSuccessAction {
  type: typeof NOTIFICATIONS_LIST_SUCCESS;
  payload: Notification[];
}
interface UnreadSuccessAction {
  type: typeof NOTIFICATIONS_UNREAD_SUCCESS;
  payload: number;
}
interface PreferencesSuccessAction {
  type: typeof NOTIFICATIONS_PREFERENCES_SUCCESS;
  payload: NotificationPreference[];
}
interface MutateRequestAction {
  type: typeof NOTIFICATIONS_MUTATE_REQUEST;
}
interface FailureAction {
  type: typeof NOTIFICATIONS_FAILURE;
  payload: string;
}

export type NotificationsAction =
  | ListRequestAction
  | ListSuccessAction
  | UnreadSuccessAction
  | PreferencesSuccessAction
  | MutateRequestAction
  | FailureAction;
