import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL = 'http://10.0.2.2:3000/api/v1';

export const apiClient = axios.create({ baseURL: API_BASE_URL });

const ACCESS_TOKEN_KEY = 'jl_access_token';
const REFRESH_TOKEN_KEY = 'jl_refresh_token';

let accessTokenCache: string | null = null;
let refreshTokenCache: string | null = null;

export const tokenStorage = {
  async load(): Promise<void> {
    const [access, refresh] = await AsyncStorage.multiGet([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
    accessTokenCache = access[1];
    refreshTokenCache = refresh[1];
  },
  getAccessToken: () => accessTokenCache,
  getRefreshToken: () => refreshTokenCache,
  async setTokens(accessToken: string, refreshToken: string) {
    accessTokenCache = accessToken;
    refreshTokenCache = refreshToken;
    await AsyncStorage.multiSet([
      [ACCESS_TOKEN_KEY, accessToken],
      [REFRESH_TOKEN_KEY, refreshToken],
    ]);
  },
  async clear() {
    accessTokenCache = null;
    refreshTokenCache = null;
    await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
  },
};

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
  const { accessToken, refreshToken: newRefreshToken } = response.data;
  await tokenStorage.setTokens(accessToken, newRefreshToken);
  return accessToken;
}

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let onAuthExpired: (() => void) | null = null;
export function setOnAuthExpired(handler: () => void) {
  onAuthExpired = handler;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    if (error.response?.status === 401 && original && !original._retry && !original.url?.includes('/auth/')) {
      original._retry = true;
      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
        const accessToken = await refreshPromise;
        original.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(original);
      } catch {
        await tokenStorage.clear();
        onAuthExpired?.();
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  },
);

export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string | string[] } | undefined;
    if (Array.isArray(data?.message)) return data.message.join(', ');
    if (data?.message) return data.message;
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong';
}
