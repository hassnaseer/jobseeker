import { create } from 'zustand';
import {
  blockConversation,
  deleteMessage as apiDeleteMessage,
  editMessage as apiEditMessage,
  getConversation,
  listMessages,
  listMyConversations,
  markConversationRead,
  sendMessage as apiSendMessage,
  unblockConversation,
  type SendMessageInput,
} from '@/api/chat';
import { extractErrorMessage } from '@/api/client';
import type { Conversation, Message } from '@/types/domain';

interface ChatState {
  conversations: Conversation[];
  current: Conversation | null;
  messages: Message[];
  status: 'idle' | 'loading' | 'saving' | 'ready' | 'error';
  error: string | null;

  fetchConversations: () => Promise<void>;
  openConversation: (id: string) => Promise<void>;
  refreshMessages: (id: string) => Promise<void>;
  send: (id: string, dto: SendMessageInput) => Promise<void>;
  edit: (id: string, messageId: string, content: string) => Promise<void>;
  remove: (id: string, messageId: string) => Promise<void>;
  block: (id: string) => Promise<void>;
  unblock: (id: string) => Promise<void>;
  clearCurrent: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  current: null,
  messages: [],
  status: 'idle',
  error: null,

  fetchConversations: async () => {
    set({ status: 'loading', error: null });
    try {
      const conversations = await listMyConversations();
      set({ conversations, status: 'ready' });
    } catch (error) {
      set({ status: 'error', error: extractErrorMessage(error) });
      throw error;
    }
  },

  openConversation: async (id) => {
    set({ status: 'loading', error: null });
    try {
      const [current, messages] = await Promise.all([getConversation(id), listMessages(id)]);
      set({ current, messages, status: 'ready' });
      markConversationRead(id).catch(() => undefined);
    } catch (error) {
      set({ status: 'error', error: extractErrorMessage(error) });
      throw error;
    }
  },

  refreshMessages: async (id) => {
    try {
      const messages = await listMessages(id);
      set({ messages });
      markConversationRead(id).catch(() => undefined);
    } catch {
      // silent — polling tick, don't surface transient errors
    }
  },

  send: async (id, dto) => {
    set({ error: null });
    try {
      const message = await apiSendMessage(id, dto);
      set({ messages: [...get().messages, message] });
    } catch (error) {
      set({ error: extractErrorMessage(error) });
      throw error;
    }
  },

  edit: async (id, messageId, content) => {
    set({ error: null });
    try {
      const message = await apiEditMessage(messageId, content);
      set({ messages: get().messages.map((m) => (m.id === message.id ? message : m)) });
    } catch (error) {
      set({ error: extractErrorMessage(error) });
      throw error;
    }
    void id;
  },

  remove: async (id, messageId) => {
    set({ error: null });
    try {
      const message = await apiDeleteMessage(messageId);
      set({ messages: get().messages.map((m) => (m.id === message.id ? message : m)) });
    } catch (error) {
      set({ error: extractErrorMessage(error) });
      throw error;
    }
    void id;
  },

  block: async (id) => {
    const updated = await blockConversation(id);
    set({ current: updated, conversations: get().conversations.map((c) => (c.id === id ? updated : c)) });
  },

  unblock: async (id) => {
    const updated = await unblockConversation(id);
    set({ current: updated, conversations: get().conversations.map((c) => (c.id === id ? updated : c)) });
  },

  clearCurrent: () => set({ current: null, messages: [] }),
}));
