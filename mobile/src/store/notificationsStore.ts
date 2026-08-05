import { create } from 'zustand';
import {
  getUnreadCount,
  listMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/api/notifications';
import { extractErrorMessage } from '@/api/client';
import type { Notification } from '@/types/domain';

interface NotificationsState {
  items: Notification[];
  unreadCount: number;
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: string | null;

  fetch: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  items: [],
  unreadCount: 0,
  status: 'idle',
  error: null,

  fetch: async () => {
    set({ status: 'loading', error: null });
    try {
      const items = await listMyNotifications();
      set({ items, unreadCount: items.filter((n) => !n.isRead).length, status: 'ready' });
    } catch (error) {
      set({ status: 'error', error: extractErrorMessage(error) });
    }
  },

  refreshUnreadCount: async () => {
    try {
      const { count } = await getUnreadCount();
      set({ unreadCount: count });
    } catch {
      // silent — best-effort polling
    }
  },

  markRead: async (id) => {
    try {
      const updated = await markNotificationRead(id);
      set({
        items: get().items.map((n) => (n.id === updated.id ? updated : n)),
        unreadCount: Math.max(0, get().unreadCount - 1),
      });
    } catch {
      // best-effort
    }
  },

  markAllRead: async () => {
    try {
      await markAllNotificationsRead();
      set({ items: get().items.map((n) => ({ ...n, isRead: true })), unreadCount: 0 });
    } catch {
      // best-effort
    }
  },
}));
