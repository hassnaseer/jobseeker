import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { PayoutMethod } from '@/modules/payments/entities/payout-method.entity';
import { Transaction } from '@/modules/payments/entities/transaction.entity';
import { ConnectStatus } from '@/modules/payments/enums/connect-status.enum';
import { TransactionStatus } from '@/modules/payments/enums/transaction-status.enum';
import { StripeService } from '@/modules/payments/stripe.service';

/**
 * Real signature-verified webhook handling. Since escrow/hourly charges
 * are created with `confirm: true` and resolved synchronously in this
 * build, these handlers mainly serve as a reconciliation safety net
 * (catch anything that settled asynchronously or was changed directly
 * in the Stripe dashboard) plus the only path Connect account status
 * updates arrive on outside of an explicit refresh call.
 */
@Injectable()
export class PaymentsWebhookService {
  private readonly logger = new Logger(PaymentsWebhookService.name);

  constructor(
    private readonly stripeService: StripeService,
    @InjectRepository(Transaction) private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(PayoutMethod)
    private readonly payoutMethodRepository: Repository<PayoutMethod>,
  ) {}

  async handleEvent(rawBody: Buffer, signature: string): Promise<{ received: boolean }> {
    let event: Stripe.Event;
    try {
      event = this.stripeService.constructWebhookEvent(rawBody, signature);
    } catch (error) {
      this.stripeService.logStripeError('webhook signature verification', error);
      return { received: false };
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.onPaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await this.onPaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      case 'charge.refunded':
        await this.onChargeRefunded(event.data.object as Stripe.Charge);
        break;
      case 'account.updated':
        await this.onAccountUpdated(event.data.object as Stripe.Account);
        break;
      default:
        this.logger.debug(`Unhandled webhook event type: ${event.type}`);
    }

    return { received: true };
  }

  private async onPaymentIntentSucceeded(intent: Stripe.PaymentIntent): Promise<void> {
    const transaction = await this.transactionRepository.findOne({
      where: { stripeRef: intent.id },
    });
    if (transaction && transaction.status !== TransactionStatus.COMPLETED) {
      transaction.status = TransactionStatus.COMPLETED;
      await this.transactionRepository.save(transaction);
    }
  }

  private async onPaymentIntentFailed(intent: Stripe.PaymentIntent): Promise<void> {
    const transaction = await this.transactionRepository.findOne({
      where: { stripeRef: intent.id },
    });
    if (transaction && transaction.status === TransactionStatus.PENDING) {
      transaction.status = TransactionStatus.FAILED;
      transaction.failureReason = intent.last_payment_error?.message ?? 'Payment failed';
      await this.transactionRepository.save(transaction);
    }
  }

  private async onChargeRefunded(charge: Stripe.Charge): Promise<void> {
    const paymentIntentId =
      typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;
    if (!paymentIntentId) {
      return;
    }
    const transaction = await this.transactionRepository.findOne({
      where: { stripeRef: paymentIntentId },
    });
    if (transaction && transaction.status !== TransactionStatus.REFUNDED) {
      transaction.status = TransactionStatus.REFUNDED;
      await this.transactionRepository.save(transaction);
    }
  }

  private async onAccountUpdated(account: Stripe.Account): Promise<void> {
    const method = await this.payoutMethodRepository.findOne({
      where: { stripeAccountId: account.id },
    });
    if (!method) {
      return;
    }
    method.connectStatus =
      account.charges_enabled && account.payouts_enabled
        ? ConnectStatus.ACTIVE
        : account.requirements?.disabled_reason
          ? ConnectStatus.RESTRICTED
          : ConnectStatus.PENDING;
    await this.payoutMethodRepository.save(method);
  }
}
