import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractsModule } from '@/modules/contracts/contracts.module';
import { FxRate } from '@/modules/payments/entities/fx-rate.entity';
import { Invoice } from '@/modules/payments/entities/invoice.entity';
import { PayoutMethod } from '@/modules/payments/entities/payout-method.entity';
import { PlatformConfig } from '@/modules/payments/entities/platform-config.entity';
import { Transaction } from '@/modules/payments/entities/transaction.entity';
import { Wallet } from '@/modules/payments/entities/wallet.entity';
import { WithdrawalRequest } from '@/modules/payments/entities/withdrawal-request.entity';
import { PaymentsController } from '@/modules/payments/payments.controller';
import { PaymentsService } from '@/modules/payments/payments.service';
import { PaymentsWebhookService } from '@/modules/payments/payments-webhook.service';
import { StripeService } from '@/modules/payments/stripe.service';
import { TimesheetsModule } from '@/modules/timesheets/timesheets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Wallet,
      Transaction,
      PayoutMethod,
      WithdrawalRequest,
      Invoice,
      PlatformConfig,
      FxRate,
    ]),
    ContractsModule,
    TimesheetsModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentsWebhookService, StripeService],
  exports: [PaymentsService, StripeService],
})
export class PaymentsModule {}
