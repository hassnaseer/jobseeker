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
  type ChatState,
} from './types';

const initialState: ChatState = {
  conversations: [],
  current: null,
  messages: [],
  totalUnread: 0,
  status: 'idle',
  error: null,
};

export function chatReducer(state = initialState, action: ChatAction): ChatState {
  switch (action.type) {
    case CHAT_LIST_REQUEST:
    case CHAT_CONVERSATION_REQUEST:
      return { ...state, status: 'loading', error: null };
    case CHAT_LIST_SUCCESS:
      return { ...state, status: 'ready', conversations: action.payload };
    case CHAT_UNREAD_SUCCESS:
      return { ...state, totalUnread: action.payload };
    case CHAT_CONVERSATION_SUCCESS:
      return { ...state, status: 'ready', current: action.payload };
    case CHAT_MESSAGES_SUCCESS:
      return { ...state, status: 'ready', messages: action.payload };
    case CHAT_MUTATE_REQUEST:
      return { ...state, status: 'sending', error: null };
    case CHAT_CONVERSATION_UPDATED:
      return {
        ...state,
        status: 'ready',
        current: action.payload,
        conversations: state.conversations.map((c) => (c.id === action.payload.id ? action.payload : c)),
      };
    case CHAT_FAILURE:
      return { ...state, status: 'error', error: action.payload };
    default:
      return state;
  }
}
