import type { User } from '@/types/user';

export interface AuthState {
  user: User | null;
  status: 'idle' | 'loading' | 'authenticated' | 'error';
  error: string | null;
  bootstrapped: boolean;
}

export const AUTH_REQUEST = 'auth/REQUEST';
export const AUTH_SUCCESS = 'auth/SUCCESS';
export const AUTH_FAILURE = 'auth/FAILURE';
export const AUTH_LOGOUT = 'auth/LOGOUT';
export const AUTH_BOOTSTRAPPED = 'auth/BOOTSTRAPPED';

interface AuthRequestAction {
  type: typeof AUTH_REQUEST;
}
interface AuthSuccessAction {
  type: typeof AUTH_SUCCESS;
  payload: User;
}
interface AuthFailureAction {
  type: typeof AUTH_FAILURE;
  payload: string;
}
interface AuthLogoutAction {
  type: typeof AUTH_LOGOUT;
}
interface AuthBootstrappedAction {
  type: typeof AUTH_BOOTSTRAPPED;
}

export type AuthAction =
  | AuthRequestAction
  | AuthSuccessAction
  | AuthFailureAction
  | AuthLogoutAction
  | AuthBootstrappedAction;
