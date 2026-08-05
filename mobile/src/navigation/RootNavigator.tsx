import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '@/store/authStore';
import { setOnAuthExpired } from '@/api/client';
import { initForegroundPushHandling, registerDeviceToken, unregisterDeviceToken } from '@/notifications/pushNotifications';
import { SplashScreen } from '@/screens/auth/SplashScreen';
import { AuthNavigator } from './AuthNavigator';
import { AppShell } from './AppShell';

export function RootNavigator() {
  const status = useAuthStore((s) => s.status);
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    setOnAuthExpired(() => {
      logout();
      unregisterDeviceToken();
    });
  }, [logout]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    registerDeviceToken().catch(() => undefined);
    return initForegroundPushHandling();
  }, [status]);

  if (status === 'idle' || status === 'loading') {
    return <SplashScreen />;
  }

  return <NavigationContainer>{status === 'authenticated' ? <AppShell /> : <AuthNavigator />}</NavigationContainer>;
}
