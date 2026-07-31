import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConversationParticipant } from '@/modules/chat/entities/conversation-participant.entity';
import { NotificationEventType } from '@/modules/notifications/enums/notification-event-type.enum';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import { UsersService } from '@/modules/users/users.service';

/**
 * Spec §12's "chat unread digest" email: hourly, one email per user
 * summarizing conversations left unread since their last digest (or ever,
 * if none sent yet) — not one email per message.
 */
@Injectable()
export class ChatDigestCron {
  private readonly logger = new Logger(ChatDigestCron.name);

  constructor(
    @InjectRepository(ConversationParticipant)
    private readonly participantRepository: Repository<ConversationParticipant>,
    private readonly notificationsService: NotificationsService,
    private readonly usersService: UsersService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async sendDigests(): Promise<void> {
    const due = await this.participantRepository
      .createQueryBuilder('p')
      .innerJoinAndSelect('p.conversation', 'c')
      .where('p.unreadCount > 0')
      .andWhere('(p.digestSentAt IS NULL OR p.digestSentAt < c.lastMessageAt)')
      .getMany();

    const byUser = new Map<string, ConversationParticipant[]>();
    for (const participant of due) {
      const list = byUser.get(participant.userId) ?? [];
      list.push(participant);
      byUser.set(participant.userId, list);
    }

    for (const [userId, participants] of byUser) {
      try {
        const user = await this.usersService.findById(userId);
        if (!user) continue;
        const totalUnread = participants.reduce((sum, p) => sum + p.unreadCount, 0);
        await this.notificationsService.notify(user, {
          type: NotificationEventType.CHAT_UNREAD_DIGEST,
          title: 'You have unread messages on JobLinxs',
          message: `You have ${totalUnread} unread message(s) across ${participants.length} conversation(s).`,
        });
        await this.participantRepository.update(
          participants.map((p) => p.id),
          { digestSentAt: new Date() },
        );
      } catch (error) {
        this.logger.warn(`Digest failed for user ${userId}: ${(error as Error).message}`);
      }
    }
  }
}
