import type { Dispatch } from 'redux';
import * as notificationsApi from '@/api/notifications';
import type { UpdatePreferenceInput } from '@/api/notifications';
import { extractErrorMessage } from '@/api/client';
import type { NotificationEventType } from '@/types/domain';
import {
  NOTIFICATIONS_FAILURE,
  NOTIFICATIONS_LIST_REQUEST,
  NOTIFICATIONS_LIST_SUCCESS,
  NOTIFICATIONS_MUTATE_REQUEST,
  NOTIFICATIONS_PREFERENCES_SUCCESS,
  NOTIFICATIONS_UNREAD_SUCCESS,
  type NotificationsAction,
} from './types';

export type NotificationsThunk = (dispatch: Dispatch<NotificationsAction>) => Promise<void>;

export function fetchMyNotifications(unreadOnly = false): NotificationsThunk {
  return async (dispatch) => {
    dispatch({ type: NOTIFICATIONS_LIST_REQUEST });
    try {
      const items = await notificationsApi.listMyNotifications({ unreadOnly });
      dispatch({ type: NOTIFICATIONS_LIST_SUCCESS, payload: items });
    } catch (error) {
      dispatch({ type: NOTIFICATIONS_FAILURE, payload: extractErrorMessage(error) });
    }
  };
}

export function fetchUnreadCount(): NotificationsThunk {
  return async (dispatch) => {
    try {
      const { count } = await notificationsApi.getUnreadCount();
      dispatch({ type: NOTIFICATIONS_UNREAD_SUCCESS, payload: count });
    } catch {
      // silent — background badge refresh
    }
  };
}

function mutateThunk(run: () => Promise<unknown>): NotificationsThunk {
  return async (dispatch) => {
    dispatch({ type: NOTIFICATIONS_MUTATE_REQUEST });
    try {
      await run();
      const [items, unread] = await Promise.all([
        notificationsApi.listMyNotifications(),
        notificationsApi.getUnreadCount(),
      ]);
      dispatch({ type: NOTIFICATIONS_LIST_SUCCESS, payload: items });
      dispatch({ type: NOTIFICATIONS_UNREAD_SUCCESS, payload: unread.count });
    } catch (error) {
      dispatch({ type: NOTIFICATIONS_FAILURE, payload: extractErrorMessage(error) });
      throw error;
    }
  };
}

export const markNotificationRead = (id: string) =>
  mutateThunk(() => notificationsApi.markNotificationRead(id));
export const markAllNotificationsRead = () => mutateThunk(() => notificationsApi.markAllNotificationsRead());

export function fetchPreferences(): NotificationsThunk {
  return async (dispatch) => {
    dispatch({ type: NOTIFICATIONS_LIST_REQUEST });
    try {
      const preferences = await notificationsApi.listPreferences();
      dispatch({ type: NOTIFICATIONS_PREFERENCES_SUCCESS, payload: preferences });
    } catch (error) {
      dispatch({ type: NOTIFICATIONS_FAILURE, payload: extractErrorMessage(error) });
    }
  };
}

export function updateNotificationPreference(
  eventType: NotificationEventType,
  dto: UpdatePreferenceInput,
): NotificationsThunk {
  return async (dispatch) => {
    dispatch({ type: NOTIFICATIONS_MUTATE_REQUEST });
    try {
      await notificationsApi.updatePreference(eventType, dto);
      const preferences = await notificationsApi.listPreferences();
      dispatch({ type: NOTIFICATIONS_PREFERENCES_SUCCESS, payload: preferences });
    } catch (error) {
      dispatch({ type: NOTIFICATIONS_FAILURE, payload: extractErrorMessage(error) });
      throw error;
    }
  };
}
