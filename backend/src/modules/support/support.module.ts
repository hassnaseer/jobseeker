import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { SupportController } from '@/modules/support/support.controller';
import { SupportService } from '@/modules/support/support.service';
import { SupportMessage } from '@/modules/support/entities/support-message.entity';
import { SupportTicket } from '@/modules/support/entities/support-ticket.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SupportTicket, SupportMessage]), NotificationsModule],
  controllers: [SupportController],
  providers: [SupportService],
  exports: [SupportService],
})
export class SupportModule {}
