import type { Conversation, Message } from '@/types/domain';

export interface ChatState {
  conversations: Conversation[];
  current: Conversation | null;
  messages: Message[];
  totalUnread: number;
  status: 'idle' | 'loading' | 'sending' | 'ready' | 'error';
  error: string | null;
}

export const CHAT_LIST_REQUEST = 'chat/LIST_REQUEST';
export const CHAT_LIST_SUCCESS = 'chat/LIST_SUCCESS';
export const CHAT_UNREAD_SUCCESS = 'chat/UNREAD_SUCCESS';
export const CHAT_CONVERSATION_REQUEST = 'chat/CONVERSATION_REQUEST';
export const CHAT_CONVERSATION_SUCCESS = 'chat/CONVERSATION_SUCCESS';
export const CHAT_MESSAGES_SUCCESS = 'chat/MESSAGES_SUCCESS';
export const CHAT_MUTATE_REQUEST = 'chat/MUTATE_REQUEST';
export const CHAT_CONVERSATION_UPDATED = 'chat/CONVERSATION_UPDATED';
export const CHAT_FAILURE = 'chat/FAILURE';

interface ListRequestAction {
  type: typeof CHAT_LIST_REQUEST;
}
interface ListSuccessAction {
  type: typeof CHAT_LIST_SUCCESS;
  payload: Conversation[];
}
interface UnreadSuccessAction {
  type: typeof CHAT_UNREAD_SUCCESS;
  payload: number;
}
interface ConversationRequestAction {
  type: typeof CHAT_CONVERSATION_REQUEST;
}
interface ConversationSuccessAction {
  type: typeof CHAT_CONVERSATION_SUCCESS;
  payload: Conversation;
}
interface MessagesSuccessAction {
  type: typeof CHAT_MESSAGES_SUCCESS;
  payload: Message[];
}
interface MutateRequestAction {
  type: typeof CHAT_MUTATE_REQUEST;
}
interface ConversationUpdatedAction {
  type: typeof CHAT_CONVERSATION_UPDATED;
  payload: Conversation;
}
interface FailureAction {
  type: typeof CHAT_FAILURE;
  payload: string;
}

export type ChatAction =
  | ListRequestAction
  | ListSuccessAction
  | UnreadSuccessAction
  | ConversationRequestAction
  | ConversationSuccessAction
  | MessagesSuccessAction
  | MutateRequestAction
  | ConversationUpdatedAction
  | FailureAction;
