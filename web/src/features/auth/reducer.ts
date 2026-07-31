import {
  AUTH_BOOTSTRAPPED,
  AUTH_FAILURE,
  AUTH_LOGOUT,
  AUTH_REQUEST,
  AUTH_SUCCESS,
  type AuthAction,
  type AuthState,
} from './types';

const initialState: AuthState = {
  user: null,
  status: 'idle',
  error: null,
  bootstrapped: false,
};

export function authReducer(state = initialState, action: AuthAction): AuthState {
  switch (action.type) {
    case AUTH_REQUEST:
      return { ...state, status: 'loading', error: null };
    case AUTH_SUCCESS:
      return { ...state, status: 'authenticated', user: action.payload, error: null, bootstrapped: true };
    case AUTH_FAILURE:
      return { ...state, status: 'error', error: action.payload, bootstrapped: true };
    case AUTH_LOGOUT:
      return { ...initialState, bootstrapped: true };
    case AUTH_BOOTSTRAPPED:
      return { ...state, bootstrapped: true };
    default:
      return state;
  }
}
