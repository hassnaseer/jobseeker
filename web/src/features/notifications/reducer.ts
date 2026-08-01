import {
  NOTIFICATIONS_FAILURE,
  NOTIFICATIONS_LIST_REQUEST,
  NOTIFICATIONS_LIST_SUCCESS,
  NOTIFICATIONS_MUTATE_REQUEST,
  NOTIFICATIONS_PREFERENCES_SUCCESS,
  NOTIFICATIONS_UNREAD_SUCCESS,
  type NotificationsAction,
  type NotificationsState,
} from './types';

const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
  preferences: [],
  status: 'idle',
  error: null,
};

export function notificationsReducer(
  state = initialState,
  action: NotificationsAction,
): NotificationsState {
  switch (action.type) {
    case NOTIFICATIONS_LIST_REQUEST:
      return { ...state, status: 'loading', error: null };
    case NOTIFICATIONS_LIST_SUCCESS:
      return { ...state, status: 'ready', items: action.payload };
    case NOTIFICATIONS_UNREAD_SUCCESS:
      return { ...state, unreadCount: action.payload };
    case NOTIFICATIONS_PREFERENCES_SUCCESS:
      return { ...state, status: 'ready', preferences: action.payload };
    case NOTIFICATIONS_MUTATE_REQUEST:
      return { ...state, status: 'saving', error: null };
    case NOTIFICATIONS_FAILURE:
      return { ...state, status: 'error', error: action.payload };
    default:
      return state;
  }
}
