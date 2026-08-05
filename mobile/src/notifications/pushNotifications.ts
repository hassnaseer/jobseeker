import { Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { apiClient } from '@/api/client';

const ANDROID_CHANNEL_ID = 'joblinxs-default';

export type DevicePlatform = 'IOS' | 'ANDROID' | 'WEB';

function currentPlatform(): DevicePlatform {
  return Platform.OS === 'ios' ? 'IOS' : 'ANDROID';
}

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await notifee.createChannel({
    id: ANDROID_CHANNEL_ID,
    name: 'General',
    importance: AndroidImportance.HIGH,
  });
}

export async function requestNotificationPermission(): Promise<boolean> {
  const authStatus = await messaging().requestPermission();
  return (
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL
  );
}

export async function registerDeviceToken(): Promise<string | null> {
  const granted = await requestNotificationPermission();
  if (!granted) return null;

  await ensureAndroidChannel();

  const token = await messaging().getToken();
  await apiClient.post('/notifications/device-tokens', {
    token,
    platform: currentPlatform(),
  });
  return token;
}

export async function unregisterDeviceToken(): Promise<void> {
  try {
    const token = await messaging().getToken();
    await apiClient.delete(`/notifications/device-tokens/${encodeURIComponent(token)}`);
  } catch {
    // best-effort — server-side tokens expire naturally
  }
}

async function displayForegroundNotification(remoteMessage: {
  notification?: { title?: string | null; body?: string | null };
  data?: Record<string, string | number | object>;
}) {
  await ensureAndroidChannel();
  await notifee.displayNotification({
    title: remoteMessage.notification?.title ?? 'JobLinxs',
    body: remoteMessage.notification?.body ?? '',
    data: remoteMessage.data as Record<string, string>,
    android: {
      channelId: ANDROID_CHANNEL_ID,
      pressAction: { id: 'default' },
    },
  });
}

/** Call once from a top-level component. Handles token refresh + foreground display. */
export function initForegroundPushHandling(onNotificationOpen?: (data: Record<string, string>) => void) {
  const unsubscribeOnMessage = messaging().onMessage(async (remoteMessage) => {
    await displayForegroundNotification(remoteMessage);
  });

  const unsubscribeTokenRefresh = messaging().onTokenRefresh(async (token) => {
    try {
      await apiClient.post('/notifications/device-tokens', { token, platform: currentPlatform() });
    } catch {
      // best-effort
    }
  });

  const unsubscribeNotifeeForeground = notifee.onForegroundEvent(({ type, detail }) => {
    if (type === EventType.PRESS && detail.notification?.data && onNotificationOpen) {
      onNotificationOpen(detail.notification.data as Record<string, string>);
    }
  });

  const unsubscribeOpenedApp = messaging().onNotificationOpenedApp((remoteMessage) => {
    if (remoteMessage?.data && onNotificationOpen) {
      onNotificationOpen(remoteMessage.data as Record<string, string>);
    }
  });

  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage?.data && onNotificationOpen) {
        onNotificationOpen(remoteMessage.data as Record<string, string>);
      }
    });

  return () => {
    unsubscribeOnMessage();
    unsubscribeTokenRefresh();
    unsubscribeNotifeeForeground();
    unsubscribeOpenedApp();
  };
}

/** Must be called at the top of index.js, before AppRegistry.registerComponent. */
export function registerBackgroundHandler() {
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    // The FCM "notification" payload is auto-displayed by the OS in background/quit
    // state; this handler exists to process the "data" payload (badge counts, sync).
    void remoteMessage;
  });

  notifee.onBackgroundEvent(async ({ type, detail }) => {
    if (type === EventType.PRESS) {
      void detail.notification?.data;
    }
  });
}
