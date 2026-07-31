import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationsModule } from '@/modules/applications/applications.module';
import { ChatController } from '@/modules/chat/chat.controller';
import { ChatService } from '@/modules/chat/chat.service';
import { ConversationParticipant } from '@/modules/chat/entities/conversation-participant.entity';
import { Conversation } from '@/modules/chat/entities/conversation.entity';
import { Message } from '@/modules/chat/entities/message.entity';
import { Report } from '@/modules/chat/entities/report.entity';
import { ChatEventsEmitter } from '@/modules/chat/gateway/chat-events.emitter';
import { ContractsModule } from '@/modules/contracts/contracts.module';
import { Job } from '@/modules/jobs/entities/job.entity';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { UsersModule } from '@/modules/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Message, ConversationParticipant, Report, Job]),
    UsersModule,
    ContractsModule,
    ApplicationsModule,
    NotificationsModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatEventsEmitter],
  exports: [ChatService],
})
export class ChatModule {}
