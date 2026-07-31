import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/user-role.enum';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { CreatePayoutMethodDto } from '@/modules/payments/dto/create-payout-method.dto';
import { CreateWithdrawalDto } from '@/modules/payments/dto/create-withdrawal.dto';
import { FundPaymentDto } from '@/modules/payments/dto/fund-payment.dto';
import { SetFxRateDto } from '@/modules/payments/dto/set-fx-rate.dto';
import { SetPlatformConfigDto } from '@/modules/payments/dto/set-platform-config.dto';
import { PaymentsService } from '@/modules/payments/payments.service';
import { PaymentsWebhookService } from '@/modules/payments/payments-webhook.service';
import { User } from '@/modules/users/entities/user.entity';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly webhookService: PaymentsWebhookService,
  ) {}

  // ---- Webhook (public, signature-verified — no JWT guard) ----

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!req.rawBody) {
      this.logger.error('Webhook received without raw body — check main.ts rawBody config');
      return { received: false };
    }
    return this.webhookService.handleEvent(req.rawBody, signature);
  }

  // ---- Contract funding & release (moved here from ContractsController) ----

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('contracts/:id/fund')
  fundContract(
    @CurrentUser() client: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: FundPaymentDto,
  ) {
    return this.paymentsService.fundContract(client, id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('contracts/:id/milestones/:milestoneId/fund')
  fundMilestone(
    @CurrentUser() client: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('milestoneId', ParseUUIDPipe) milestoneId: string,
    @Body() dto: FundPaymentDto,
  ) {
    return this.paymentsService.fundMilestone(client, id, milestoneId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('contracts/:id/milestones/:milestoneId/release')
  releaseMilestone(
    @CurrentUser() client: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('milestoneId', ParseUUIDPipe) milestoneId: string,
  ) {
    return this.paymentsService.releaseMilestone(client, id, milestoneId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('contracts/:id/release')
  releaseLump(@CurrentUser() client: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.paymentsService.releaseLump(client, id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('contracts/:id/timesheet-periods/:periodId/approve')
  approveTimesheetPeriod(
    @CurrentUser() client: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('periodId', ParseUUIDPipe) periodId: string,
    @Body() dto: FundPaymentDto,
  ) {
    return this.paymentsService.approveTimesheetPeriod(client, id, periodId, dto);
  }

  // ---- Wallet, transactions, invoices ----

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('wallet')
  wallet(@CurrentUser() user: User) {
    return this.paymentsService.listMyWallets(user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('transactions/mine')
  transactions(@CurrentUser() user: User) {
    return this.paymentsService.listMyTransactions(user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('invoices/mine')
  invoices(@CurrentUser() user: User) {
    return this.paymentsService.listMyInvoices(user);
  }

  // ---- Payout methods & Connect onboarding ----

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('payout-methods')
  createPayoutMethod(@CurrentUser() user: User, @Body() dto: CreatePayoutMethodDto) {
    return this.paymentsService.createPayoutMethod(user, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('payout-methods/mine')
  payoutMethods(@CurrentUser() user: User) {
    return this.paymentsService.listMyPayoutMethods(user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('connect/onboard')
  startConnectOnboarding(@CurrentUser() user: User) {
    return this.paymentsService.startConnectOnboarding(user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('connect/refresh-status')
  refreshConnectStatus(@CurrentUser() user: User) {
    return this.paymentsService.refreshConnectStatus(user);
  }

  // ---- Withdrawals ----

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('withdrawals')
  requestWithdrawal(@CurrentUser() user: User, @Body() dto: CreateWithdrawalDto) {
    return this.paymentsService.requestWithdrawal(user, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('withdrawals/mine')
  withdrawals(@CurrentUser() user: User) {
    return this.paymentsService.listMyWithdrawals(user);
  }

  // ---- SA admin ----

  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin/config')
  getConfig() {
    return this.paymentsService.getConfig();
  }

  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('admin/config')
  updateConfig(@Body() dto: SetPlatformConfigDto) {
    return this.paymentsService.updateConfig(dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('admin/withdrawals/:id/mark-paid')
  markWithdrawalPaid(@CurrentUser() admin: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.paymentsService.markWithdrawalPaid(admin, id);
  }

  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('admin/transactions/:id/refund')
  refundTransaction(
    @CurrentUser() admin: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('amount') amount?: string,
  ) {
    return this.paymentsService.refundTransaction(
      admin,
      id,
      amount ? parseFloat(amount) : undefined,
    );
  }

  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('admin/fx-rates')
  setFxRate(@CurrentUser() admin: User, @Body() dto: SetFxRateDto) {
    return this.paymentsService.setFxRate(admin, dto);
  }

  @Get('fx-rates')
  listFxRates() {
    return this.paymentsService.listFxRates();
  }
}
