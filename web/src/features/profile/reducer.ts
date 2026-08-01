import {
  PROFILE_FETCH_FAILURE,
  PROFILE_FETCH_REQUEST,
  PROFILE_FETCH_SUCCESS,
  PROFILE_RESET,
  PROFILE_SAVE_FAILURE,
  PROFILE_SAVE_REQUEST,
  PROFILE_SAVE_SUCCESS,
  type ProfileAction,
  type ProfileState,
} from './types';

const initialState: ProfileState = {
  role: null,
  data: null,
  status: 'idle',
  error: null,
};

export function profileReducer(state = initialState, action: ProfileAction): ProfileState {
  switch (action.type) {
    case PROFILE_FETCH_REQUEST:
      return { ...state, role: action.role, status: 'loading', error: null };
    case PROFILE_FETCH_SUCCESS:
      return { ...state, data: action.payload, status: 'ready', error: null };
    case PROFILE_FETCH_FAILURE:
      return { ...state, status: 'error', error: action.payload };
    case PROFILE_SAVE_REQUEST:
      return { ...state, status: 'saving', error: null };
    case PROFILE_SAVE_SUCCESS:
      return {
        ...state,
        status: 'ready',
        error: null,
        data: state.data ? { ...state.data, ...action.payload } : null,
      };
    case PROFILE_SAVE_FAILURE:
      return { ...state, status: 'error', error: action.payload };
    case PROFILE_RESET:
      return initialState;
    default:
      return state;
  }
}
