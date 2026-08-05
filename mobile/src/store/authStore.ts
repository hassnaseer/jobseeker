import { create } from 'zustand';
import { apiClient, extractErrorMessage, tokenStorage } from '@/api/client';
import type { User, UserRole } from '@/types/user';

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

interface AuthState {
  user: User | null;
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
  error: string | null;
  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (input: SignupInput) => Promise<{ message: string; userId: string }>;
  verifyEmail: (token: string) => Promise<{ message: string }>;
  resendVerification: (email: string) => Promise<{ message: string }>;
  forgotPassword: (email: string) => Promise<{ message: string }>;
  resetPassword: (token: string, password: string, confirmPassword: string) => Promise<{ message: string }>;
  switchRole: (role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export interface SignupInput {
  email: string;
  password: string;
  confirmPassword: string;
  role: 'CLIENT' | 'SEEKER';
  tosVersion: string;
  tosAccepted: boolean;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'idle',
  error: null,

  bootstrap: async () => {
    await tokenStorage.load();
    if (!tokenStorage.getAccessToken()) {
      set({ status: 'unauthenticated' });
      return;
    }
    set({ status: 'loading' });
    try {
      const { data } = await apiClient.get<User>('/auth/me');
      set({ user: data, status: 'authenticated' });
    } catch {
      await tokenStorage.clear();
      set({ user: null, status: 'unauthenticated' });
    }
  },

  login: async (email, password) => {
    set({ error: null });
    try {
      const { data } = await apiClient.post<TokenResponse>('/auth/login', { email, password });
      await tokenStorage.setTokens(data.accessToken, data.refreshToken);
      set({ user: data.user, status: 'authenticated' });
    } catch (error) {
      set({ status: 'unauthenticated', error: extractErrorMessage(error) });
      throw error;
    }
  },

  signup: async (input) => {
    const { data } = await apiClient.post('/auth/signup', input);
    return data;
  },

  verifyEmail: async (token) => {
    const { data } = await apiClient.post('/auth/verify-email', { token });
    return data;
  },

  resendVerification: async (email) => {
    const { data } = await apiClient.post('/auth/resend-verification', { email });
    return data;
  },

  forgotPassword: async (email) => {
    const { data } = await apiClient.post('/auth/forgot-password', { email });
    return data;
  },

  resetPassword: async (token, password, confirmPassword) => {
    const { data } = await apiClient.post('/auth/reset-password', { token, password, confirmPassword });
    return data;
  },

  switchRole: async (role) => {
    set({ error: null });
    try {
      const { data } = await apiClient.patch<{ user: User; message: string }>('/auth/switch-role', { role });
      set({ user: data.user, status: 'authenticated' });
    } catch (error) {
      set({ error: extractErrorMessage(error) });
      throw error;
    }
  },

  logout: async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    await tokenStorage.clear();
    set({ user: null, status: 'unauthenticated' });
    if (refreshToken) {
      try {
        await apiClient.post('/auth/logout', { refreshToken });
      } catch {
        // best-effort — tokens are already cleared client-side
      }
    }
  },

  clearError: () => set({ error: null }),
}));
