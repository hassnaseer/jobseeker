import { Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from '@/modules/firebase/firebase.service';

/**
 * Real-time chat transport: mirrors chat mutations into Firestore so
 * web/mobile clients can attach native Firestore listeners instead of
 * polling REST. A no-op (logged once at boot by FirebaseService) until
 * FIREBASE_SERVICE_ACCOUNT_JSON is configured — callers in ChatService
 * fire-and-forget these calls, so REST responses never wait on Firestore.
 */
@Injectable()
export class ChatEventsEmitter {
  private readonly logger = new Logger(ChatEventsEmitter.name);

  constructor(private readonly firebase: FirebaseService) {}

  toConversation(conversationId: string, event: string, payload: unknown): void {
    void this.write(`conversations/${conversationId}/events`, event, payload);
  }

  toUser(userId: string, event: string, payload: unknown): void {
    void this.write(`users/${userId}/events`, event, payload);
  }

  private async write(collectionPath: string, event: string, payload: unknown): Promise<void> {
    const db = this.firebase.firestore;
    if (!db) {
      return;
    }
    try {
      await db.collection(collectionPath).add({
        event,
        payload: JSON.parse(JSON.stringify(payload)) as unknown,
        createdAt: this.firebase.fieldValue.serverTimestamp(),
      });
    } catch (error) {
      this.logger.warn(`Failed to mirror "${event}" to Firestore: ${(error as Error).message}`);
    }
  }
}
