import type { Dispatch } from 'redux';
import * as chatApi from '@/api/chat';
import type { SendMessageInput } from '@/api/chat';
import { extractErrorMessage } from '@/api/client';
import type { Conversation } from '@/types/domain';
import {
  CHAT_CONVERSATION_REQUEST,
  CHAT_CONVERSATION_SUCCESS,
  CHAT_CONVERSATION_UPDATED,
  CHAT_FAILURE,
  CHAT_LIST_REQUEST,
  CHAT_LIST_SUCCESS,
  CHAT_MESSAGES_SUCCESS,
  CHAT_MUTATE_REQUEST,
  CHAT_UNREAD_SUCCESS,
  type ChatAction,
} from './types';

export type ChatThunk = (dispatch: Dispatch<ChatAction>) => Promise<void>;

export function fetchMyConversations(): ChatThunk {
  return async (dispatch) => {
    dispatch({ type: CHAT_LIST_REQUEST });
    try {
      const items = await chatApi.listMyConversations();
      dispatch({ type: CHAT_LIST_SUCCESS, payload: items });
    } catch (error) {
      dispatch({ type: CHAT_FAILURE, payload: extractErrorMessage(error) });
    }
  };
}

export function fetchTotalUnread(): ChatThunk {
  return async (dispatch) => {
    try {
      const { total } = await chatApi.getTotalUnreadCount();
      dispatch({ type: CHAT_UNREAD_SUCCESS, payload: total });
    } catch {
      // silent — background badge refresh
    }
  };
}

export function openConversation(id: string): ChatThunk {
  return async (dispatch) => {
    dispatch({ type: CHAT_CONVERSATION_REQUEST });
    try {
      const [conversation, messages] = await Promise.all([
        chatApi.getConversation(id),
        chatApi.listMessages(id),
      ]);
      dispatch({ type: CHAT_CONVERSATION_SUCCESS, payload: conversation });
      dispatch({ type: CHAT_MESSAGES_SUCCESS, payload: messages.slice().reverse() });
      await chatApi.markConversationRead(id);
      const [refreshed, unread] = await Promise.all([
        chatApi.getConversation(id),
        chatApi.getTotalUnreadCount(),
      ]);
      dispatch({ type: CHAT_CONVERSATION_UPDATED, payload: refreshed });
      dispatch({ type: CHAT_UNREAD_SUCCESS, payload: unread.total });
    } catch (error) {
      dispatch({ type: CHAT_FAILURE, payload: extractErrorMessage(error) });
    }
  };
}

export function refreshMessages(id: string): ChatThunk {
  return async (dispatch) => {
    try {
      const messages = await chatApi.listMessages(id);
      dispatch({ type: CHAT_MESSAGES_SUCCESS, payload: messages.slice().reverse() });
    } catch {
      // silent — background poll
    }
  };
}

export function sendChatMessage(conversationId: string, dto: SendMessageInput): ChatThunk {
  return async (dispatch) => {
    dispatch({ type: CHAT_MUTATE_REQUEST });
    try {
      await chatApi.sendMessage(conversationId, dto);
      const messages = await chatApi.listMessages(conversationId);
      dispatch({ type: CHAT_MESSAGES_SUCCESS, payload: messages.slice().reverse() });
    } catch (error) {
      dispatch({ type: CHAT_FAILURE, payload: extractErrorMessage(error) });
      throw error;
    }
  };
}

export function editChatMessage(conversationId: string, messageId: string, content: string): ChatThunk {
  return async (dispatch) => {
    dispatch({ type: CHAT_MUTATE_REQUEST });
    try {
      await chatApi.editMessage(messageId, content);
      const messages = await chatApi.listMessages(conversationId);
      dispatch({ type: CHAT_MESSAGES_SUCCESS, payload: messages.slice().reverse() });
    } catch (error) {
      dispatch({ type: CHAT_FAILURE, payload: extractErrorMessage(error) });
      throw error;
    }
  };
}

export function deleteChatMessage(conversationId: string, messageId: string): ChatThunk {
  return async (dispatch) => {
    dispatch({ type: CHAT_MUTATE_REQUEST });
    try {
      await chatApi.deleteMessage(messageId);
      const messages = await chatApi.listMessages(conversationId);
      dispatch({ type: CHAT_MESSAGES_SUCCESS, payload: messages.slice().reverse() });
    } catch (error) {
      dispatch({ type: CHAT_FAILURE, payload: extractErrorMessage(error) });
      throw error;
    }
  };
}

function conversationMutateThunk(run: () => Promise<Conversation>): ChatThunk {
  return async (dispatch) => {
    dispatch({ type: CHAT_MUTATE_REQUEST });
    try {
      const conversation = await run();
      dispatch({ type: CHAT_CONVERSATION_UPDATED, payload: conversation });
    } catch (error) {
      dispatch({ type: CHAT_FAILURE, payload: extractErrorMessage(error) });
      throw error;
    }
  };
}

export const blockConversation = (id: string) => conversationMutateThunk(() => chatApi.blockConversation(id));
export const unblockConversation = (id: string) => conversationMutateThunk(() => chatApi.unblockConversation(id));

export function startInquiry(jobId: string, seekerId: string) {
  return async (dispatch: Dispatch<ChatAction>): Promise<Conversation> => {
    dispatch({ type: CHAT_MUTATE_REQUEST });
    try {
      const conversation = await chatApi.createInquiry(jobId, seekerId);
      dispatch({ type: CHAT_CONVERSATION_SUCCESS, payload: conversation });
      return conversation;
    } catch (error) {
      dispatch({ type: CHAT_FAILURE, payload: extractErrorMessage(error) });
      throw error;
    }
  };
}

export function openContractWorkroom(contractId: string) {
  return async (dispatch: Dispatch<ChatAction>): Promise<Conversation> => {
    dispatch({ type: CHAT_MUTATE_REQUEST });
    try {
      const conversation = await chatApi.getContractWorkroom(contractId);
      dispatch({ type: CHAT_CONVERSATION_SUCCESS, payload: conversation });
      return conversation;
    } catch (error) {
      dispatch({ type: CHAT_FAILURE, payload: extractErrorMessage(error) });
      throw error;
    }
  };
}

export function reportChatTarget(dto: chatApi.CreateReportInput): ChatThunk {
  return async (dispatch) => {
    try {
      await chatApi.reportTarget(dto);
    } catch (error) {
      dispatch({ type: CHAT_FAILURE, payload: extractErrorMessage(error) });
      throw error;
    }
  };
}
