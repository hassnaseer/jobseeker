import {
  ADMIN_ANALYTICS_SUCCESS,
  ADMIN_APPROVALS_SUCCESS,
  ADMIN_APPROVAL_DETAIL_SUCCESS,
  ADMIN_CATEGORIES_SUCCESS,
  ADMIN_CONFIG_SUCCESS,
  ADMIN_DISPUTES_SUCCESS,
  ADMIN_FAILURE,
  ADMIN_MODERATION_CATALOGS_SUCCESS,
  ADMIN_MODERATION_JOBS_SUCCESS,
  ADMIN_MUTATE_REQUEST,
  ADMIN_REPORTS_SUCCESS,
  ADMIN_REQUEST,
  ADMIN_REVENUE_SUCCESS,
  ADMIN_USERS_SUCCESS,
  ADMIN_USER_DETAIL_SUCCESS,
  type AdminAction,
  type AdminState,
} from './types';

const initialState: AdminState = {
  users: { items: [], total: 0, page: 1, limit: 25 },
  userDetail: null,
  approvals: [],
  approvalDetail: null,
  moderationJobs: [],
  moderationCatalogs: [],
  reports: [],
  disputes: [],
  categories: [],
  analytics: null,
  revenue: null,
  config: null,
  status: 'idle',
  error: null,
};

export function adminReducer(state = initialState, action: AdminAction): AdminState {
  switch (action.type) {
    case ADMIN_REQUEST:
      return { ...state, status: 'loading', error: null };
    case ADMIN_MUTATE_REQUEST:
      return { ...state, status: 'saving', error: null };
    case ADMIN_USERS_SUCCESS:
      return { ...state, status: 'ready', users: action.payload };
    case ADMIN_USER_DETAIL_SUCCESS:
      return {
        ...state,
        status: 'ready',
        userDetail: action.payload,
        users: {
          ...state.users,
          items: state.users.items.map((u) => (u.id === action.payload.id ? action.payload : u)),
        },
      };
    case ADMIN_APPROVALS_SUCCESS:
      return { ...state, status: 'ready', approvals: action.payload };
    case ADMIN_APPROVAL_DETAIL_SUCCESS:
      return { ...state, status: 'ready', approvalDetail: action.payload };
    case ADMIN_MODERATION_JOBS_SUCCESS:
      return { ...state, status: 'ready', moderationJobs: action.payload };
    case ADMIN_MODERATION_CATALOGS_SUCCESS:
      return { ...state, status: 'ready', moderationCatalogs: action.payload };
    case ADMIN_REPORTS_SUCCESS:
      return { ...state, status: 'ready', reports: action.payload };
    case ADMIN_DISPUTES_SUCCESS:
      return { ...state, status: 'ready', disputes: action.payload };
    case ADMIN_CATEGORIES_SUCCESS:
      return { ...state, status: 'ready', categories: action.payload };
    case ADMIN_ANALYTICS_SUCCESS:
      return { ...state, status: 'ready', analytics: action.payload };
    case ADMIN_REVENUE_SUCCESS:
      return { ...state, status: 'ready', revenue: action.payload };
    case ADMIN_CONFIG_SUCCESS:
      return { ...state, status: 'ready', config: action.payload };
    case ADMIN_FAILURE:
      return { ...state, status: 'error', error: action.payload };
    default:
      return state;
  }
}
