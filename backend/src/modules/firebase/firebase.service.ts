import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { App, cert, initializeApp, ServiceAccount } from 'firebase-admin/app';
import { Firestore, FieldValue, getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

/**
 * Wraps the Firebase Admin SDK (Firestore mirror for real-time chat/presence,
 * FCM for push notifications). Boots to a disabled no-op state when
 * FIREBASE_SERVICE_ACCOUNT_JSON isn't set, so the app can run before that
 * credential is provided — callers must check isEnabled/firestore for null.
 */
@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private app: App | null = null;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const raw = this.configService.get<string>('firebase.serviceAccountJson');
    if (!raw) {
      this.logger.warn(
        'FIREBASE_SERVICE_ACCOUNT_JSON not set — real-time chat sync and FCM push are disabled until it is configured.',
      );
      return;
    }

    try {
      const serviceAccount = JSON.parse(raw) as ServiceAccount;
      this.app = initializeApp({ credential: cert(serviceAccount) });
      this.logger.log('Firebase Admin SDK initialized.');
    } catch (error) {
      this.logger.error(`Failed to initialize Firebase Admin SDK: ${(error as Error).message}`);
    }
  }

  get isEnabled(): boolean {
    return this.app !== null;
  }

  get firestore(): Firestore | null {
    return this.app ? getFirestore(this.app) : null;
  }

  get fieldValue(): typeof FieldValue {
    return FieldValue;
  }

  /**
   * The Admin SDK's HTTP calls have no built-in timeout, so a blocked or
   * slow network path (as in this sandbox) hangs the caller indefinitely —
   * and callers here are request handlers (e.g. sending a chat message),
   * not background jobs. Race against a hard deadline instead.
   */
  withTimeout<T>(promise: Promise<T>, label: string, ms = 8_000): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms),
      ),
    ]);
  }

  async sendMulticastPush(
    tokens: string[],
    notification: { title: string; body: string },
    data?: Record<string, string>,
  ): Promise<void> {
    if (!this.app || tokens.length === 0) {
      return;
    }
    try {
      await this.withTimeout(
        getMessaging(this.app).sendEachForMulticast({ tokens, notification, data }),
        'FCM push',
      );
    } catch (error) {
      this.logger.warn(`FCM push failed: ${(error as Error).message}`);
    }
  }
}
