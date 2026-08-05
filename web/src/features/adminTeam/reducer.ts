import {
  ADMIN_TEAM_FAILURE,
  ADMIN_TEAM_LIST_SUCCESS,
  ADMIN_TEAM_MUTATE_REQUEST,
  ADMIN_TEAM_REQUEST,
  type AdminTeamAction,
  type AdminTeamState,
} from './types';

const initialState: AdminTeamState = {
  members: [],
  status: 'idle',
  error: null,
};

export function adminTeamReducer(state = initialState, action: AdminTeamAction): AdminTeamState {
  switch (action.type) {
    case ADMIN_TEAM_REQUEST:
      return { ...state, status: 'loading', error: null };
    case ADMIN_TEAM_MUTATE_REQUEST:
      return { ...state, status: 'saving', error: null };
    case ADMIN_TEAM_LIST_SUCCESS:
      return { ...state, members: action.payload, status: 'ready', error: null };
    case ADMIN_TEAM_FAILURE:
      return { ...state, status: 'error', error: action.payload };
    default:
      return state;
  }
}
