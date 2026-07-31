import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FirebaseService } from '@/modules/firebase/firebase.service';
import { MailService } from '@/modules/mail/mail.service';
import { DeviceToken } from '@/modules/notifications/entities/device-token.entity';
import { NotificationPreference } from '@/modules/notifications/entities/notification-preference.entity';
import { Notification } from '@/modules/notifications/entities/notification.entity';
import { DevicePlatform } from '@/modules/notifications/enums/device-platform.enum';
import { NotificationEventType } from '@/modules/notifications/enums/notification-event-type.enum';
import { User } from '@/modules/users/entities/user.entity';

interface ChannelDefaults {
  email: boolean;
  inApp: boolean;
  push: boolean;
}

/**
 * Default channel toggles per event type when the user hasn't overridden
 * them yet. Chat is deliberately in-app+push only — the spec's "chat
 * unread digest" email is a separate, throttled event (CHAT_UNREAD_DIGEST)
 * sent by the cron below, not one email per message.
 */
const DEFAULT_CHANNELS: Record<NotificationEventType, ChannelDefaults> = {
  [NotificationEventType.PROFILE_APPROVED]: { email: true, inApp: true, push: true },
  [NotificationEventType.PROFILE_REJECTED]: { email: true, inApp: true, push: true },
  [NotificationEventType.APPLICATION_RECEIVED]: { email: true, inApp: true, push: true },
  [NotificationEventType.APPLICATION_ACCEPTED]: { email: true, inApp: true, push: true },
  [NotificationEventType.APPLICATION_REJECTED]: { email: true, inApp: true, push: true },
  [NotificationEventType.ESCROW_FUNDED]: { email: true, inApp: true, push: true },
  [NotificationEventType.DELIVERABLE_SUBMITTED]: { email: true, inApp: true, push: true },
  [NotificationEventType.DELIVERABLE_APPROVED]: { email: true, inApp: true, push: true },
  [NotificationEventType.DELIVERABLE_REVISION_REQUESTED]: { email: true, inApp: true, push: true },
  [NotificationEventType.MILESTONE_RELEASED]: { email: true, inApp: true, push: true },
  [NotificationEventType.TIMESHEET_SUBMITTED]: { email: true, inApp: true, push: true },
  [NotificationEventType.HOURS_DISPUTED]: { email: true, inApp: true, push: true },
  [NotificationEventType.HOURS_APPROVED]: { email: true, inApp: true, push: true },
  [NotificationEventType.CONTRACT_COMPLETED]: { email: true, inApp: true, push: true },
  [NotificationEventType.WITHDRAWAL_STATUS_CHANGED]: { email: true, inApp: true, push: true },
  [NotificationEventType.NEW_MESSAGE]: { email: false, inApp: true, push: true },
  [NotificationEventType.CHAT_UNREAD_DIGEST]: { email: true, inApp: false, push: false },
  [NotificationEventType.DISPUTE_OPENED]: { email: true, inApp: true, push: true },
  [NotificationEventType.DISPUTE_RESOLVED]: { email: true, inApp: true, push: true },
};

export interface NotifyInput {
  type: NotificationEventType;
  title: string;
  message: string;
  link?: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(NotificationPreference)
    private readonly preferenceRepository: Repository<NotificationPreference>,
    @InjectRepository(DeviceToken)
    private readonly deviceTokenRepository: Repository<DeviceToken>,
    private readonly mailService: MailService,
    private readonly firebase: FirebaseService,
  ) {}

  /**
   * Fires an event for one user across whichever channels their
   * preferences (or the defaults above) allow. Never throws — a failure
   * in one channel, or in the whole call, must not break the caller's
   * primary operation (approving a profile, releasing a payment, ...).
   */
  async notify(user: User, input: NotifyInput): Promise<void> {
    try {
      const pref = await this.resolvePreference(user.id, input.type);

      if (pref.inApp) {
        await this.notificationRepository.save(
          this.notificationRepository.create({
            userId: user.id,
            type: input.type,
            title: input.title,
            message: input.message,
            link: input.link ?? null,
          }),
        );
      }

      if (pref.email) {
        await this.mailService.send(user.email, input.title, input.message);
      }

      if (pref.push) {
        const tokens = await this.deviceTokenRepository.find({ where: { userId: user.id } });
        if (tokens.length > 0) {
          await this.firebase.sendMulticastPush(
            tokens.map((t) => t.token),
            { title: input.title, body: input.message },
            { type: input.type, ...(input.link ? { link: input.link } : {}) },
          );
        }
      }
    } catch (error) {
      this.logger.warn(
        `notify(${input.type}) failed for user ${user.id}: ${(error as Error).message}`,
      );
    }
  }

  private async resolvePreference(
    userId: string,
    eventType: NotificationEventType,
  ): Promise<ChannelDefaults> {
    const existing = await this.preferenceRepository.findOne({ where: { userId, eventType } });
    if (existing) {
      return {
        email: existing.emailEnabled,
        inApp: existing.inAppEnabled,
        push: existing.pushEnabled,
      };
    }
    return DEFAULT_CHANNELS[eventType];
  }

  async listMine(
    user: User,
    options: { unreadOnly?: boolean; before?: string } = {},
  ): Promise<Notification[]> {
    const qb = this.notificationRepository
      .createQueryBuilder('n')
      .where('n.userId = :userId', { userId: user.id })
      .orderBy('n.createdAt', 'DESC')
      .limit(50);
    if (options.unreadOnly) {
      qb.andWhere('n.isRead = false');
    }
    if (options.before) {
      qb.andWhere('n.createdAt < :before', { before: new Date(options.before) });
    }
    return qb.getMany();
  }

  async unreadCount(user: User): Promise<{ count: number }> {
    const count = await this.notificationRepository.count({
      where: { userId: user.id, isRead: false },
    });
    return { count };
  }

  async markRead(user: User, id: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id, userId: user.id },
    });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    if (!notification.isRead) {
      notification.isRead = true;
      await this.notificationRepository.save(notification);
    }
    return notification;
  }

  async markAllRead(user: User): Promise<{ updated: number }> {
    const result = await this.notificationRepository.update(
      { userId: user.id, isRead: false },
      { isRead: true },
    );
    return { updated: result.affected ?? 0 };
  }

  async listPreferences(user: User): Promise<NotificationPreference[]> {
    const stored = await this.preferenceRepository.find({ where: { userId: user.id } });
    const storedByType = new Map(stored.map((p) => [p.eventType, p]));
    return Object.values(NotificationEventType).map((eventType) => {
      const existing = storedByType.get(eventType);
      if (existing) {
        return existing;
      }
      const defaults = DEFAULT_CHANNELS[eventType];
      return this.preferenceRepository.create({
        userId: user.id,
        eventType,
        emailEnabled: defaults.email,
        inAppEnabled: defaults.inApp,
        pushEnabled: defaults.push,
      });
    });
  }

  async updatePreference(
    user: User,
    eventType: NotificationEventType,
    dto: { emailEnabled?: boolean; inAppEnabled?: boolean; pushEnabled?: boolean },
  ): Promise<NotificationPreference> {
    let pref = await this.preferenceRepository.findOne({ where: { userId: user.id, eventType } });
    const defaults = DEFAULT_CHANNELS[eventType];
    if (!pref) {
      pref = this.preferenceRepository.create({
        userId: user.id,
        eventType,
        emailEnabled: defaults.email,
        inAppEnabled: defaults.inApp,
        pushEnabled: defaults.push,
      });
    }
    if (dto.emailEnabled !== undefined) pref.emailEnabled = dto.emailEnabled;
    if (dto.inAppEnabled !== undefined) pref.inAppEnabled = dto.inAppEnabled;
    if (dto.pushEnabled !== undefined) pref.pushEnabled = dto.pushEnabled;
    return this.preferenceRepository.save(pref);
  }

  async registerDeviceToken(
    user: User,
    token: string,
    platform: DevicePlatform,
  ): Promise<DeviceToken> {
    let record = await this.deviceTokenRepository.findOne({ where: { token } });
    if (record) {
      record.userId = user.id;
      record.platform = platform;
      return this.deviceTokenRepository.save(record);
    }
    record = this.deviceTokenRepository.create({ userId: user.id, token, platform });
    return this.deviceTokenRepository.save(record);
  }

  async unregisterDeviceToken(user: User, token: string): Promise<{ message: string }> {
    await this.deviceTokenRepository.delete({ userId: user.id, token });
    return { message: 'Device token removed.' };
  }
}
