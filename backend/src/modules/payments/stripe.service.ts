import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

/**
 * Thin wrapper around the Stripe SDK. Kept separate from PaymentsService
 * so the rest of the domain logic never touches the Stripe client
 * directly — useful for testing and for keeping amount-unit conversion
 * (dollars <-> cents) in exactly one place.
 */
@Injectable()
export class StripeService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(private readonly configService: ConfigService) {
    const secretKey = this.configService.get<string>('stripe.secretKey')!;
    this.stripe = new Stripe(secretKey);
  }

  get client(): Stripe {
    return this.stripe;
  }

  toMinorUnits(amount: number): number {
    return Math.round(amount * 100);
  }

  fromMinorUnits(amount: number): number {
    return amount / 100;
  }

  async createExpressAccount(email: string, country = 'US'): Promise<Stripe.Account> {
    return this.stripe.accounts.create({
      type: 'express',
      email,
      country,
      capabilities: {
        transfers: { requested: true },
        card_payments: { requested: true },
      },
    });
  }

  async createAccountLink(
    accountId: string,
    refreshUrl: string,
    returnUrl: string,
  ): Promise<Stripe.AccountLink> {
    return this.stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });
  }

  async retrieveAccount(accountId: string): Promise<Stripe.Account> {
    return this.stripe.accounts.retrieve(accountId);
  }

  /**
   * Charges the platform account. `paymentMethodId` should come from the
   * client (collected via Stripe Elements once /web exists); falls back
   * to Stripe's test Visa token outside production so the flow is
   * testable end-to-end without a browser.
   */
  async createAndConfirmPaymentIntent(params: {
    amountDecimal: number;
    currency: string;
    idempotencyKey: string;
    metadata: Record<string, string>;
    paymentMethodId?: string;
  }): Promise<Stripe.PaymentIntent> {
    const isProd = this.configService.get<string>('env') === 'production';
    const paymentMethod = params.paymentMethodId ?? (isProd ? undefined : 'pm_card_visa');
    if (!paymentMethod) {
      throw new Error('paymentMethodId is required in production');
    }

    return this.stripe.paymentIntents.create(
      {
        amount: this.toMinorUnits(params.amountDecimal),
        currency: params.currency.toLowerCase(),
        payment_method: paymentMethod,
        confirm: true,
        automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
        metadata: params.metadata,
      },
      { idempotencyKey: params.idempotencyKey },
    );
  }

  async createTransfer(params: {
    amountDecimal: number;
    currency: string;
    destinationAccountId: string;
    idempotencyKey: string;
    metadata: Record<string, string>;
  }): Promise<Stripe.Transfer> {
    return this.stripe.transfers.create(
      {
        amount: this.toMinorUnits(params.amountDecimal),
        currency: params.currency.toLowerCase(),
        destination: params.destinationAccountId,
        metadata: params.metadata,
      },
      { idempotencyKey: params.idempotencyKey },
    );
  }

  async createRefund(params: {
    paymentIntentId: string;
    amountDecimal?: number;
    idempotencyKey: string;
  }): Promise<Stripe.Refund> {
    return this.stripe.refunds.create(
      {
        payment_intent: params.paymentIntentId,
        amount:
          params.amountDecimal !== undefined ? this.toMinorUnits(params.amountDecimal) : undefined,
      },
      { idempotencyKey: params.idempotencyKey },
    );
  }

  constructWebhookEvent(rawBody: Buffer, signature: string): Stripe.Event {
    const webhookSecret = this.configService.get<string>('stripe.webhookSecret');
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }
    return this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  }

  logStripeError(context: string, error: unknown): string {
    const message = error instanceof Error ? error.message : 'Unknown Stripe error';
    this.logger.error(`${context}: ${message}`);
    return message;
  }
}
