import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { ContractsService } from '@/modules/contracts/contracts.service';
import { CreateContractDto } from '@/modules/contracts/dto/create-contract.dto';
import { RequestRevisionDto } from '@/modules/contracts/dto/request-revision.dto';
import { SubmitDeliverableDto } from '@/modules/contracts/dto/submit-deliverable.dto';
import { User } from '@/modules/users/entities/user.entity';

@ApiTags('contracts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post('applications/:applicationId/hire')
  hire(
    @CurrentUser() client: User,
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
    @Body() dto: CreateContractDto,
  ) {
    return this.contractsService.hire(client, applicationId, dto);
  }

  @Get('contracts/mine')
  mine(@CurrentUser() user: User) {
    return this.contractsService.listMine(user);
  }

  @Get('contracts/:id')
  detail(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.contractsService.getDetailForUser(user, id);
  }

  @Get('contracts/:id/milestones')
  milestones(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.contractsService.listMilestones(user, id);
  }

  @Get('contracts/:id/deliverables')
  deliverables(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.contractsService.listDeliverables(user, id);
  }

  // NOTE: FIXED-contract funding/release moved to PaymentsController —
  // they require a real Stripe charge/wallet credit before the
  // underlying ContractsService transition can happen. HOURLY contracts
  // have no upfront escrow (spec §5.2 goes straight Hire -> ACTIVE), so
  // they activate here with no payment involved.

  @Post('contracts/:id/activate')
  activateHourly(@CurrentUser() client: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.contractsService.activateHourlyContract(client, id);
  }

  @Post('contracts/:id/deliverables')
  submitDeliverable(
    @CurrentUser() seeker: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SubmitDeliverableDto,
  ) {
    return this.contractsService.submitDeliverable(seeker, id, dto);
  }

  @Post('contracts/:id/deliverables/:deliverableId/approve')
  approveDeliverable(
    @CurrentUser() client: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('deliverableId', ParseUUIDPipe) deliverableId: string,
  ) {
    return this.contractsService.approveDeliverable(client, id, deliverableId);
  }

  @Post('contracts/:id/deliverables/:deliverableId/revision')
  requestRevision(
    @CurrentUser() client: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('deliverableId', ParseUUIDPipe) deliverableId: string,
    @Body() dto: RequestRevisionDto,
  ) {
    return this.contractsService.requestRevision(client, id, deliverableId, dto);
  }

  @Post('contracts/:id/complete-hourly')
  completeHourly(@CurrentUser() client: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.contractsService.completeHourlyContract(client, id);
  }
}
