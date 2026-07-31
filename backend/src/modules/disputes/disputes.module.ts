import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractsModule } from '@/modules/contracts/contracts.module';
import { DisputesController } from '@/modules/disputes/disputes.controller';
import { DisputesService } from '@/modules/disputes/disputes.service';
import { Dispute } from '@/modules/disputes/entities/dispute.entity';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { PaymentsModule } from '@/modules/payments/payments.module';
import { UsersModule } from '@/modules/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Dispute]),
    ContractsModule,
    PaymentsModule,
    UsersModule,
    NotificationsModule,
  ],
  controllers: [DisputesController],
  providers: [DisputesService],
  exports: [DisputesService],
})
export class DisputesModule {}
