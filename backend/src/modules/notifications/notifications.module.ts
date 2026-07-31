import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationParticipant } from '@/modules/chat/entities/conversation-participant.entity';
import { MailModule } from '@/modules/mail/mail.module';
import { ChatDigestCron } from '@/modules/notifications/chat-digest.cron';
import { DeviceToken } from '@/modules/notifications/entities/device-token.entity';
import { NotificationPreference } from '@/modules/notifications/entities/notification-preference.entity';
import { Notification } from '@/modules/notifications/entities/notification.entity';
import { NotificationsController } from '@/modules/notifications/notifications.controller';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import { UsersModule } from '@/modules/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Notification,
      NotificationPreference,
      DeviceToken,
      ConversationParticipant,
    ]),
    UsersModule,
    MailModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, ChatDigestCron],
  exports: [NotificationsService],
})
export class NotificationsModule {}
