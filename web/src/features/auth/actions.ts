import type { Dispatch } from 'redux';
import { apiClient, extractErrorMessage, tokenStorage } from '@/api/client';
import {
  AUTH_BOOTSTRAPPED,
  AUTH_FAILURE,
  AUTH_LOGOUT,
  AUTH_REQUEST,
  AUTH_SUCCESS,
  type AuthAction,
} from './types';
import type { User, UserRole } from '@/types/user';

export type AuthThunk = (dispatch: Dispatch<AuthAction>) => Promise<void>;

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export function fetchMe(): AuthThunk {
  return async (dispatch) => {
    if (!tokenStorage.getAccessToken()) {
      dispatch({ type: AUTH_BOOTSTRAPPED });
      return;
    }
    dispatch({ type: AUTH_REQUEST });
    try {
      const { data } = await apiClient.get<User>('/auth/me');
      dispatch({ type: AUTH_SUCCESS, payload: data });
    } catch {
      tokenStorage.clear();
      dispatch({ type: AUTH_BOOTSTRAPPED });
    }
  };
}

export function login(email: string, password: string): AuthThunk {
  return async (dispatch) => {
    dispatch({ type: AUTH_REQUEST });
    try {
      const { data } = await apiClient.post<TokenResponse>('/auth/login', { email, password });
      tokenStorage.setTokens(data.accessToken, data.refreshToken);
      dispatch({ type: AUTH_SUCCESS, payload: data.user });
    } catch (error) {
      dispatch({ type: AUTH_FAILURE, payload: extractErrorMessage(error) });
      throw error;
    }
  };
}

export interface SignupInput {
  email: string;
  password: string;
  confirmPassword: string;
  role: 'CLIENT' | 'SEEKER';
  tosVersion: string;
  tosAccepted: boolean;
}

export async function signup(input: SignupInput): Promise<{ message: string; userId: string }> {
  const { data } = await apiClient.post('/auth/signup', input);
  return data;
}

export async function verifyEmail(token: string): Promise<{ message: string }> {
  const { data } = await apiClient.post('/auth/verify-email', { token });
  return data;
}

export async function resendVerification(email: string): Promise<{ message: string }> {
  const { data } = await apiClient.post('/auth/resend-verification', { email });
  return data;
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const { data } = await apiClient.post('/auth/forgot-password', { email });
  return data;
}

export async function resetPassword(
  token: string,
  password: string,
  confirmPassword: string,
): Promise<{ message: string }> {
  const { data } = await apiClient.post('/auth/reset-password', { token, password, confirmPassword });
  return data;
}

export function switchRole(role: UserRole): AuthThunk {
  return async (dispatch) => {
    dispatch({ type: AUTH_REQUEST });
    try {
      const { data } = await apiClient.patch<{ user: User; message: string }>('/auth/switch-role', {
        role,
      });
      dispatch({ type: AUTH_SUCCESS, payload: data.user });
    } catch (error) {
      dispatch({ type: AUTH_FAILURE, payload: extractErrorMessage(error) });
      throw error;
    }
  };
}

export function logout(): AuthThunk {
  return async (dispatch) => {
    const refreshToken = tokenStorage.getRefreshToken();
    tokenStorage.clear();
    dispatch({ type: AUTH_LOGOUT });
    if (refreshToken) {
      try {
        await apiClient.post('/auth/logout', { refreshToken });
      } catch {
        // best-effort — tokens are already cleared client-side
      }
    }
  };
}
