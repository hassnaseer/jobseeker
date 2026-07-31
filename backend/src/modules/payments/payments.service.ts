import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as crypto from 'crypto';
import { IsNull, Repository } from 'typeorm';
import { UserRole } from '@/common/enums/user-role.enum';
import { ContractsService } from '@/modules/contracts/contracts.service';
import { Contract } from '@/modules/contracts/entities/contract.entity';
import { JobType } from '@/modules/jobs/enums/job-type.enum';
import { PricingModel } from '@/modules/jobs/enums/pricing-model.enum';
import { NotificationEventType } from '@/modules/notifications/enums/notification-event-type.enum';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import { CreatePayoutMethodDto } from '@/modules/payments/dto/create-payout-method.dto';
import { CreateWithdrawalDto } from '@/modules/payments/dto/create-withdrawal.dto';
import { FundPaymentDto } from '@/modules/payments/dto/fund-payment.dto';
import { SetFxRateDto } from '@/modules/payments/dto/set-fx-rate.dto';
import { SetPlatformConfigDto } from '@/modules/payments/dto/set-platform-config.dto';
import { FxRate } from '@/modules/payments/entities/fx-rate.entity';
import { Invoice } from '@/modules/payments/entities/invoice.entity';
import { PayoutMethod } from '@/modules/payments/entities/payout-method.entity';
import { PlatformConfig } from '@/modules/payments/entities/platform-config.entity';
import { Transaction } from '@/modules/payments/entities/transaction.entity';
import { Wallet } from '@/modules/payments/entities/wallet.entity';
import { WithdrawalRequest } from '@/modules/payments/entities/withdrawal-request.entity';
import { ConnectStatus } from '@/modules/payments/enums/connect-status.enum';
import { PayoutMethodType } from '@/modules/payments/enums/payout-method-type.enum';
import { TransactionMethod } from '@/modules/payments/enums/transaction-method.enum';
import { TransactionStatus } from '@/modules/payments/enums/transaction-status.enum';
import { TransactionType } from '@/modules/payments/enums/transaction-type.enum';
import { WithdrawalStatus } from '@/modules/payments/enums/withdrawal-status.enum';
import { StripeService } from '@/modules/payments/stripe.service';
import { TimesheetsService } from '@/modules/timesheets/timesheets.service';
import { User } from '@/modules/users/entities/user.entity';
import { UsersService } from '@/modules/users/users.service';

const PLATFORM_CONFIG_ID = 'default';

interface CommissionSplit {
  clientFee: number;
  seekerFee: number;
  clientTotal: number;
  seekerNet: number;
}

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Wallet) private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(Transaction) private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(PayoutMethod)
    private readonly payoutMethodRepository: Repository<PayoutMethod>,
    @InjectRepository(WithdrawalRequest)
    private readonly withdrawalRepository: Repository<WithdrawalRequest>,
    @InjectRepository(Invoice) private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(PlatformConfig) private readonly configRepository: Repository<PlatformConfig>,
    @InjectRepository(FxRate) private readonly fxRateRepository: Repository<FxRate>,
    private readonly stripeService: StripeService,
    private readonly contractsService: ContractsService,
    private readonly timesheetsService: TimesheetsService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // ---- Platform config (spec §19.33) ----

  async getConfig(): Promise<PlatformConfig> {
    let config = await this.configRepository.findOne({ where: { id: PLATFORM_CONFIG_ID } });
    if (!config) {
      config = await this.configRepository.save(
        this.configRepository.create({ id: PLATFORM_CONFIG_ID }),
      );
    }
    return config;
  }

  async updateConfig(dto: SetPlatformConfigDto): Promise<PlatformConfig> {
    const config = await this.getConfig();
    Object.assign(config, dto);
    return this.configRepository.save(config);
  }

  private async computeCommission(baseAmount: number): Promise<CommissionSplit> {
    const config = await this.getConfig();
    const clientFee = Math.round(baseAmount * config.clientCommissionPct * 100) / 100;
    const seekerFee = Math.round(baseAmount * config.seekerCommissionPct * 100) / 100;
    return {
      clientFee,
      seekerFee,
      clientTotal: baseAmount + clientFee,
      seekerNet: baseAmount - seekerFee,
    };
  }

  // ---- Wallet ----

  async getOrCreateWallet(userId: string, currency: string): Promise<Wallet> {
    let wallet = await this.walletRepository.findOne({ where: { userId, currency } });
    if (!wallet) {
      wallet = await this.walletRepository.save(
        this.walletRepository.create({ userId, currency, balance: 0, pendingBalance: 0 }),
      );
    }
    return wallet;
  }

  async listMyWallets(user: User): Promise<Wallet[]> {
    return this.walletRepository.find({ where: { userId: user.id } });
  }

  private async creditWallet(userId: string, currency: string, amount: number): Promise<Wallet> {
    const wallet = await this.getOrCreateWallet(userId, currency);
    wallet.balance += amount;
    return this.walletRepository.save(wallet);
  }

  // ---- Transactions & idempotency ----

  private async findExistingByIdempotencyKey(key: string): Promise<Transaction | null> {
    return this.transactionRepository.findOne({ where: { idempotencyKey: key } });
  }

  private nextInvoiceNumber(): string {
    return `INV-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  }

  private async issueInvoice(
    contractId: string,
    transaction: Transaction,
    partyId: string,
  ): Promise<Invoice> {
    return this.invoiceRepository.save(
      this.invoiceRepository.create({
        contractId,
        transactionId: transaction.id,
        partyId,
        number: this.nextInvoiceNumber(),
        amount: transaction.amount,
        taxAmount: 0,
        currency: transaction.currency,
      }),
    );
  }

  async listMyTransactions(user: User): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: [{ payerId: user.id }, { payeeId: user.id }],
      order: { createdAt: 'DESC' },
    });
  }

  async listMyInvoices(user: User): Promise<Invoice[]> {
    return this.invoiceRepository.find({
      where: { partyId: user.id },
      order: { issuedAt: 'DESC' },
    });
  }

  // ---- Escrow funding (client -> platform, real Stripe charge) ----

  async fundContract(client: User, contractId: string, dto: FundPaymentDto): Promise<Transaction> {
    const contract = await this.contractsService.findByIdOrFail(contractId);
    if (contract.clientId !== client.id) {
      throw new ForbiddenException('Only the hiring client can fund this contract');
    }
    if (contract.type !== JobType.FIXED) {
      throw new BadRequestException(
        'HOURLY contracts have no upfront escrow — use POST /contracts/:id/activate instead',
      );
    }

    const idempotencyKey = `fund:${contractId}`;
    const existing = await this.findExistingByIdempotencyKey(idempotencyKey);
    if (existing) {
      return existing;
    }

    let amount: number;
    let milestoneId: string | null = null;
    if (contract.pricingModel === PricingModel.MILESTONE) {
      const milestones = await this.contractsService.listMilestones(client, contractId);
      const first = milestones.find((m) => m.sequence === 1);
      if (!first) {
        throw new NotFoundException('No first milestone found for this contract');
      }
      amount = first.amount;
      milestoneId = first.id;
    } else {
      amount = contract.agreedAmount ?? 0;
    }

    const commission = await this.computeCommission(amount);
    const transaction = await this.chargeAndRecord({
      contract,
      milestoneId,
      type: TransactionType.ESCROW_FUND,
      baseAmount: amount,
      commission,
      payerId: client.id,
      payeeId: null,
      idempotencyKey,
      paymentMethodId: dto.paymentMethodId,
    });

    if (transaction.status === TransactionStatus.COMPLETED) {
      await this.contractsService.fund(client, contractId);
      await this.issueInvoice(contractId, transaction, client.id);
      await this.notifyEscrowFunded(contract.seekerId, contract.currency, amount);
    }

    return transaction;
  }

  private async notifyEscrowFunded(
    seekerId: string,
    currency: string,
    amount: number,
  ): Promise<void> {
    const seeker = await this.usersService.findById(seekerId);
    if (seeker) {
      await this.notificationsService.notify(seeker, {
        type: NotificationEventType.ESCROW_FUNDED,
        title: 'Escrow funded',
        message: `The client funded ${amount} ${currency} in escrow for your contract.`,
      });
    }
  }

  async fundMilestone(
    client: User,
    contractId: string,
    milestoneId: string,
    dto: FundPaymentDto,
  ): Promise<Transaction> {
    const contract = await this.contractsService.findByIdOrFail(contractId);
    if (contract.clientId !== client.id) {
      throw new ForbiddenException('Only the hiring client can fund this contract');
    }

    const milestones = await this.contractsService.listMilestones(client, contractId);
    const milestone = milestones.find((m) => m.id === milestoneId);
    if (!milestone) {
      throw new NotFoundException('Milestone not found');
    }

    const idempotencyKey = `fund-milestone:${milestoneId}`;
    const existing = await this.findExistingByIdempotencyKey(idempotencyKey);
    if (existing) {
      return existing;
    }

    const commission = await this.computeCommission(milestone.amount);
    const transaction = await this.chargeAndRecord({
      contract,
      milestoneId,
      type: TransactionType.ESCROW_FUND,
      baseAmount: milestone.amount,
      commission,
      payerId: client.id,
      payeeId: null,
      idempotencyKey,
      paymentMethodId: dto.paymentMethodId,
    });

    if (transaction.status === TransactionStatus.COMPLETED) {
      await this.contractsService.fundMilestone(client, contractId, milestoneId);
      await this.issueInvoice(contractId, transaction, client.id);
      await this.notifyEscrowFunded(contract.seekerId, contract.currency, milestone.amount);
    }

    return transaction;
  }

  private async chargeAndRecord(params: {
    contract: Contract;
    milestoneId: string | null;
    type: TransactionType;
    baseAmount: number;
    commission: CommissionSplit;
    payerId: string;
    payeeId: string | null;
    idempotencyKey: string;
    paymentMethodId?: string;
  }): Promise<Transaction> {
    try {
      const intent = await this.stripeService.createAndConfirmPaymentIntent({
        amountDecimal: params.commission.clientTotal,
        currency: params.contract.currency,
        idempotencyKey: params.idempotencyKey,
        metadata: { contractId: params.contract.id, type: params.type },
        paymentMethodId: params.paymentMethodId,
      });

      return this.transactionRepository.save(
        this.transactionRepository.create({
          contractId: params.contract.id,
          milestoneId: params.milestoneId,
          payerId: params.payerId,
          payeeId: params.payeeId,
          type: params.type,
          amount: params.baseAmount,
          clientFee: params.commission.clientFee,
          seekerFee: 0,
          netAmount: params.baseAmount,
          currency: params.contract.currency,
          method: TransactionMethod.STRIPE,
          stripeRef: intent.id,
          idempotencyKey: params.idempotencyKey,
          status:
            intent.status === 'succeeded' ? TransactionStatus.COMPLETED : TransactionStatus.PENDING,
        }),
      );
    } catch (error) {
      const message = this.stripeService.logStripeError('chargeAndRecord', error);
      return this.transactionRepository.save(
        this.transactionRepository.create({
          contractId: params.contract.id,
          milestoneId: params.milestoneId,
          payerId: params.payerId,
          payeeId: params.payeeId,
          type: params.type,
          amount: params.baseAmount,
          clientFee: params.commission.clientFee,
          seekerFee: 0,
          netAmount: params.baseAmount,
          currency: params.contract.currency,
          method: TransactionMethod.STRIPE,
          stripeRef: null,
          idempotencyKey: params.idempotencyKey,
          status: TransactionStatus.FAILED,
          failureReason: message,
        }),
      );
    }
  }

  // ---- Release (platform -> seeker's internal wallet; withdrawal is what moves it out for real) ----

  async releaseMilestone(
    client: User,
    contractId: string,
    milestoneId: string,
  ): Promise<Transaction> {
    const idempotencyKey = `release-milestone:${milestoneId}`;
    const existing = await this.findExistingByIdempotencyKey(idempotencyKey);
    if (existing) {
      return existing;
    }

    const milestones = await this.contractsService.listMilestones(client, contractId);
    const milestone = milestones.find((m) => m.id === milestoneId);
    if (!milestone) {
      throw new NotFoundException('Milestone not found');
    }

    const contract = await this.contractsService.findByIdOrFail(contractId);
    const commission = await this.computeCommission(milestone.amount);

    await this.contractsService.releaseMilestone(client, contractId, milestoneId);
    await this.creditWallet(contract.seekerId, contract.currency, commission.seekerNet);

    const transaction = await this.transactionRepository.save(
      this.transactionRepository.create({
        contractId,
        milestoneId,
        payerId: null,
        payeeId: contract.seekerId,
        type: TransactionType.ESCROW_RELEASE,
        amount: milestone.amount,
        clientFee: 0,
        seekerFee: commission.seekerFee,
        netAmount: commission.seekerNet,
        currency: contract.currency,
        method: TransactionMethod.WALLET,
        stripeRef: null,
        idempotencyKey,
        status: TransactionStatus.COMPLETED,
      }),
    );

    await this.issueInvoice(contractId, transaction, contract.seekerId);
    await this.notifyPaymentReleased(contract.seekerId, contract.currency, commission.seekerNet);
    return transaction;
  }

  private async notifyPaymentReleased(
    seekerId: string,
    currency: string,
    netAmount: number,
  ): Promise<void> {
    const seeker = await this.usersService.findById(seekerId);
    if (seeker) {
      await this.notificationsService.notify(seeker, {
        type: NotificationEventType.MILESTONE_RELEASED,
        title: 'Payment released',
        message: `${netAmount} ${currency} was released to your wallet.`,
      });
    }
  }

  async releaseLump(client: User, contractId: string): Promise<Transaction> {
    const idempotencyKey = `release-lump:${contractId}`;
    const existing = await this.findExistingByIdempotencyKey(idempotencyKey);
    if (existing) {
      return existing;
    }

    const contract = await this.contractsService.findByIdOrFail(contractId);
    if (contract.type !== JobType.FIXED || contract.pricingModel !== PricingModel.LUMP) {
      throw new BadRequestException('This action is only for LUMP-priced contracts');
    }
    const amount = contract.agreedAmount ?? 0;
    const commission = await this.computeCommission(amount);

    await this.contractsService.releaseLump(client, contractId);
    await this.creditWallet(contract.seekerId, contract.currency, commission.seekerNet);

    const transaction = await this.transactionRepository.save(
      this.transactionRepository.create({
        contractId,
        milestoneId: null,
        payerId: null,
        payeeId: contract.seekerId,
        type: TransactionType.ESCROW_RELEASE,
        amount,
        clientFee: 0,
        seekerFee: commission.seekerFee,
        netAmount: commission.seekerNet,
        currency: contract.currency,
        method: TransactionMethod.WALLET,
        stripeRef: null,
        idempotencyKey,
        status: TransactionStatus.COMPLETED,
      }),
    );

    await this.issueInvoice(contractId, transaction, contract.seekerId);
    await this.notifyPaymentReleased(contract.seekerId, contract.currency, commission.seekerNet);
    return transaction;
  }

  // ---- Hourly billing (charge client + credit seeker wallet in one action) ----

  async approveTimesheetPeriod(
    client: User,
    contractId: string,
    periodId: string,
    dto: FundPaymentDto,
  ): Promise<Transaction> {
    const idempotencyKey = `hourly-approve:${periodId}`;
    const existing = await this.findExistingByIdempotencyKey(idempotencyKey);
    if (existing) {
      return existing;
    }

    const contract = await this.contractsService.findByIdOrFail(contractId);
    if (contract.clientId !== client.id) {
      throw new ForbiddenException('Only the hiring client can approve this timesheet');
    }

    const periods = await this.timesheetsService.listPeriods(client, contractId);
    const period = periods.find((p) => p.id === periodId);
    if (!period) {
      throw new NotFoundException('Timesheet period not found');
    }

    // Approve first so the entries/total are finalized before we charge off of it.
    const approved = await this.timesheetsService.approvePeriod(client, contractId, periodId);
    const commission = await this.computeCommission(
      approved.totalHours * (contract.agreedHourlyRate ?? 0),
    );

    const transaction = await this.chargeAndRecord({
      contract,
      milestoneId: null,
      type: TransactionType.HOURLY_CHARGE,
      baseAmount: approved.totalHours * (contract.agreedHourlyRate ?? 0),
      commission,
      payerId: client.id,
      payeeId: contract.seekerId,
      idempotencyKey,
      paymentMethodId: dto.paymentMethodId,
    });

    if (transaction.status === TransactionStatus.COMPLETED) {
      await this.creditWallet(contract.seekerId, contract.currency, commission.seekerNet);
      transaction.seekerFee = commission.seekerFee;
      transaction.netAmount = commission.seekerNet;
      await this.transactionRepository.save(transaction);
      await this.issueInvoice(contractId, transaction, client.id);

      const seeker = await this.usersService.findById(contract.seekerId);
      if (seeker) {
        await this.notificationsService.notify(seeker, {
          type: NotificationEventType.HOURS_APPROVED,
          title: 'Hours approved and paid',
          message: `${commission.seekerNet} ${contract.currency} was released to your wallet for approved hours.`,
        });
      }
    }

    return transaction;
  }

  // ---- Stripe Connect onboarding ----

  async startConnectOnboarding(user: User): Promise<{ url: string }> {
    const existing = await this.payoutMethodRepository.findOne({
      where: { userId: user.id, type: PayoutMethodType.STRIPE_CONNECT },
    });

    let method: PayoutMethod;
    if (existing?.stripeAccountId) {
      method = existing;
    } else {
      const account = await this.stripeService.createExpressAccount(user.email);
      if (existing) {
        existing.stripeAccountId = account.id;
        existing.connectStatus = ConnectStatus.PENDING;
        method = existing;
      } else {
        method = this.payoutMethodRepository.create({
          userId: user.id,
          type: PayoutMethodType.STRIPE_CONNECT,
          stripeAccountId: account.id,
          connectStatus: ConnectStatus.PENDING,
        });
      }
      method = await this.payoutMethodRepository.save(method);
    }

    const webAppUrl = this.configService.get<string>('webAppUrl');
    const link = await this.stripeService.createAccountLink(
      method.stripeAccountId!,
      `${webAppUrl}/payout/connect/refresh`,
      `${webAppUrl}/payout/connect/return`,
    );
    return { url: link.url };
  }

  async refreshConnectStatus(user: User): Promise<PayoutMethod> {
    const method = await this.payoutMethodRepository.findOne({
      where: { userId: user.id, type: PayoutMethodType.STRIPE_CONNECT },
    });
    if (!method || !method.stripeAccountId) {
      throw new NotFoundException('No Stripe Connect account found — start onboarding first');
    }

    const account = await this.stripeService.retrieveAccount(method.stripeAccountId);
    method.connectStatus =
      account.charges_enabled && account.payouts_enabled
        ? ConnectStatus.ACTIVE
        : account.requirements?.disabled_reason
          ? ConnectStatus.RESTRICTED
          : ConnectStatus.PENDING;
    return this.payoutMethodRepository.save(method);
  }

  // ---- Payout methods ----

  async createPayoutMethod(user: User, dto: CreatePayoutMethodDto): Promise<PayoutMethod> {
    if (dto.type === PayoutMethodType.STRIPE_CONNECT) {
      throw new BadRequestException('Use the connect onboarding endpoint for STRIPE_CONNECT');
    }

    if (dto.isDefault) {
      await this.payoutMethodRepository.update({ userId: user.id }, { isDefault: false });
    }

    return this.payoutMethodRepository.save(
      this.payoutMethodRepository.create({
        userId: user.id,
        type: dto.type,
        bankName: dto.bankName ?? null,
        accountHolder: dto.accountHolder ?? null,
        accountNumber: dto.accountNumber ?? null,
        swiftOrRouting: dto.swiftOrRouting ?? null,
        currency: dto.currency ?? null,
        isDefault: dto.isDefault ?? false,
      }),
    );
  }

  async listMyPayoutMethods(user: User): Promise<PayoutMethod[]> {
    return this.payoutMethodRepository.find({ where: { userId: user.id } });
  }

  // ---- Withdrawals (spec §13.3) ----

  async requestWithdrawal(user: User, dto: CreateWithdrawalDto): Promise<WithdrawalRequest> {
    const config = await this.getConfig();
    if (dto.amount < config.minWithdrawal) {
      throw new BadRequestException(
        `Minimum withdrawal is ${config.minWithdrawal} ${config.baseCurrency}`,
      );
    }

    const payoutMethod = await this.payoutMethodRepository.findOne({
      where: { id: dto.payoutMethodId, userId: user.id },
    });
    if (!payoutMethod) {
      throw new NotFoundException('Payout method not found');
    }
    if (payoutMethod.type === PayoutMethodType.WALLET) {
      throw new BadRequestException(
        'Cannot withdraw to a wallet payout method — funds are already in your wallet',
      );
    }

    const wallet = await this.getOrCreateWallet(user.id, dto.currency);
    if (wallet.balance < dto.amount) {
      throw new ConflictException('Insufficient wallet balance');
    }

    wallet.balance -= dto.amount;
    wallet.pendingBalance += dto.amount;
    await this.walletRepository.save(wallet);

    const withdrawal = await this.withdrawalRepository.save(
      this.withdrawalRepository.create({
        userId: user.id,
        walletId: wallet.id,
        amount: dto.amount,
        currency: dto.currency,
        payoutMethodId: payoutMethod.id,
        status: WithdrawalStatus.REQUESTED,
      }),
    );

    return this.processWithdrawal(withdrawal, payoutMethod, wallet);
  }

  private async processWithdrawal(
    withdrawal: WithdrawalRequest,
    payoutMethod: PayoutMethod,
    wallet: Wallet,
  ): Promise<WithdrawalRequest> {
    if (payoutMethod.type === PayoutMethodType.BANK) {
      // No automated bank payout rail wired in — SA completes these manually for now.
      withdrawal.status = WithdrawalStatus.PROCESSING;
      const saved = await this.withdrawalRepository.save(withdrawal);
      await this.notifyWithdrawalStatus(withdrawal.userId, withdrawal.status);
      return saved;
    }

    if (payoutMethod.connectStatus !== ConnectStatus.ACTIVE || !payoutMethod.stripeAccountId) {
      withdrawal.status = WithdrawalStatus.FAILED;
      withdrawal.failureReason = 'Stripe Connect account is not active';
      wallet.balance += withdrawal.amount;
      wallet.pendingBalance -= withdrawal.amount;
      await this.walletRepository.save(wallet);
      const saved = await this.withdrawalRepository.save(withdrawal);
      await this.notifyWithdrawalStatus(withdrawal.userId, withdrawal.status);
      return saved;
    }

    try {
      const transfer = await this.stripeService.createTransfer({
        amountDecimal: withdrawal.amount,
        currency: withdrawal.currency,
        destinationAccountId: payoutMethod.stripeAccountId,
        idempotencyKey: `withdrawal:${withdrawal.id}`,
        metadata: { withdrawalId: withdrawal.id, userId: withdrawal.userId },
      });

      withdrawal.status = WithdrawalStatus.PAID;
      withdrawal.processedAt = new Date();
      wallet.pendingBalance -= withdrawal.amount;
      await this.walletRepository.save(wallet);
      await this.withdrawalRepository.save(withdrawal);

      await this.transactionRepository.save(
        this.transactionRepository.create({
          payerId: null,
          payeeId: withdrawal.userId,
          type: TransactionType.WITHDRAWAL,
          amount: withdrawal.amount,
          netAmount: withdrawal.amount,
          currency: withdrawal.currency,
          method: TransactionMethod.STRIPE,
          stripeRef: transfer.id,
          idempotencyKey: `withdrawal:${withdrawal.id}`,
          status: TransactionStatus.COMPLETED,
        }),
      );
      await this.notifyWithdrawalStatus(withdrawal.userId, withdrawal.status);
    } catch (error) {
      const message = this.stripeService.logStripeError('processWithdrawal', error);
      withdrawal.status = WithdrawalStatus.FAILED;
      withdrawal.failureReason = message;
      wallet.balance += withdrawal.amount;
      wallet.pendingBalance -= withdrawal.amount;
      await this.walletRepository.save(wallet);
      await this.withdrawalRepository.save(withdrawal);
      await this.notifyWithdrawalStatus(withdrawal.userId, withdrawal.status);
    }

    return withdrawal;
  }

  private async notifyWithdrawalStatus(userId: string, status: WithdrawalStatus): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (user) {
      await this.notificationsService.notify(user, {
        type: NotificationEventType.WITHDRAWAL_STATUS_CHANGED,
        title: 'Withdrawal status updated',
        message: `Your withdrawal is now ${status}.`,
      });
    }
  }

  async listMyWithdrawals(user: User): Promise<WithdrawalRequest[]> {
    return this.withdrawalRepository.find({
      where: { userId: user.id },
      order: { requestedAt: 'DESC' },
    });
  }

  // ---- SA: manual bank withdrawal completion, refunds, FX rates ----

  async markWithdrawalPaid(admin: User, withdrawalId: string): Promise<WithdrawalRequest> {
    this.assertAdmin(admin);
    const withdrawal = await this.withdrawalRepository.findOne({ where: { id: withdrawalId } });
    if (!withdrawal) {
      throw new NotFoundException('Withdrawal request not found');
    }
    if (withdrawal.status !== WithdrawalStatus.PROCESSING) {
      throw new ConflictException('Only a PROCESSING withdrawal can be marked paid');
    }

    withdrawal.status = WithdrawalStatus.PAID;
    withdrawal.processedAt = new Date();
    const wallet = await this.walletRepository.findOneOrFail({
      where: { id: withdrawal.walletId },
    });
    wallet.pendingBalance -= withdrawal.amount;
    await this.walletRepository.save(wallet);
    const saved = await this.withdrawalRepository.save(withdrawal);
    await this.notifyWithdrawalStatus(withdrawal.userId, withdrawal.status);
    return saved;
  }

  private assertAdmin(user: User): void {
    if (!user.roles.includes(UserRole.SUPER_ADMIN)) {
      throw new ForbiddenException('Super admin only');
    }
  }

  async refundTransaction(
    admin: User,
    transactionId: string,
    amount?: number,
  ): Promise<Transaction> {
    this.assertAdmin(admin);
    const original = await this.transactionRepository.findOne({ where: { id: transactionId } });
    if (!original) {
      throw new NotFoundException('Transaction not found');
    }
    if (original.method !== TransactionMethod.STRIPE || !original.stripeRef) {
      throw new BadRequestException('Only completed Stripe charges can be refunded');
    }
    if (original.status !== TransactionStatus.COMPLETED) {
      throw new ConflictException('Only a COMPLETED transaction can be refunded');
    }

    const idempotencyKey = `refund:${transactionId}:${amount ?? 'full'}`;
    const refund = await this.stripeService.createRefund({
      paymentIntentId: original.stripeRef,
      amountDecimal: amount,
      idempotencyKey,
    });

    original.status = TransactionStatus.REFUNDED;
    await this.transactionRepository.save(original);

    return this.transactionRepository.save(
      this.transactionRepository.create({
        contractId: original.contractId,
        milestoneId: original.milestoneId,
        payerId: original.payeeId,
        payeeId: original.payerId,
        type:
          amount && amount < original.amount
            ? TransactionType.PARTIAL_REFUND
            : TransactionType.REFUND,
        amount: amount ?? original.amount,
        netAmount: amount ?? original.amount,
        currency: original.currency,
        method: TransactionMethod.STRIPE,
        stripeRef: refund.id,
        idempotencyKey,
        status: TransactionStatus.COMPLETED,
      }),
    );
  }

  // ---- Dispute resolution support (spec §14) — DisputesService drives these ----

  /** The COMPLETED escrow charge a dispute is arbitrating over. */
  async findEscrowTransaction(
    contractId: string,
    milestoneId: string | null,
  ): Promise<Transaction | null> {
    return this.transactionRepository.findOne({
      where: {
        contractId,
        milestoneId: milestoneId ?? IsNull(),
        type: TransactionType.ESCROW_FUND,
        status: TransactionStatus.COMPLETED,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async computeSeekerNet(baseAmount: number): Promise<number> {
    return (await this.computeCommission(baseAmount)).seekerNet;
  }

  /**
   * SA-arbitrated release: credits the seeker's wallet directly (no
   * deliverable-approval precondition, unlike the normal releaseMilestone/
   * releaseLump path) since the dispute resolution itself is the approval.
   */
  async releaseForDisputeResolution(
    admin: User,
    contract: Contract,
    milestoneId: string | null,
    disputeId: string,
    seekerNetAmount: number,
  ): Promise<Transaction> {
    this.assertAdmin(admin);
    const idempotencyKey = `dispute-release:${disputeId}`;
    const existing = await this.findExistingByIdempotencyKey(idempotencyKey);
    if (existing) {
      return existing;
    }

    await this.creditWallet(contract.seekerId, contract.currency, seekerNetAmount);

    const transaction = await this.transactionRepository.save(
      this.transactionRepository.create({
        contractId: contract.id,
        milestoneId,
        payerId: null,
        payeeId: contract.seekerId,
        type: TransactionType.ESCROW_RELEASE,
        amount: seekerNetAmount,
        clientFee: 0,
        seekerFee: 0,
        netAmount: seekerNetAmount,
        currency: contract.currency,
        method: TransactionMethod.WALLET,
        stripeRef: null,
        idempotencyKey,
        status: TransactionStatus.COMPLETED,
      }),
    );

    await this.issueInvoice(contract.id, transaction, contract.seekerId);
    return transaction;
  }

  async setFxRate(admin: User, dto: SetFxRateDto): Promise<FxRate> {
    this.assertAdmin(admin);
    let rate = await this.fxRateRepository.findOne({
      where: { baseCurrency: dto.baseCurrency, quoteCurrency: dto.quoteCurrency },
    });
    if (rate) {
      rate.rate = dto.rate;
    } else {
      rate = this.fxRateRepository.create(dto);
    }
    return this.fxRateRepository.save(rate);
  }

  async listFxRates(): Promise<FxRate[]> {
    return this.fxRateRepository.find();
  }
}
