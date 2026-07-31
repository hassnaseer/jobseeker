import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { UserRole } from '@/common/enums/user-role.enum';
import { ContractsService } from '@/modules/contracts/contracts.service';
import { Contract } from '@/modules/contracts/entities/contract.entity';
import { ContractStatus } from '@/modules/contracts/enums/contract-status.enum';
import { RaiseDisputeDto } from '@/modules/disputes/dto/raise-dispute.dto';
import { ResolveDisputeDto } from '@/modules/disputes/dto/resolve-dispute.dto';
import { Dispute } from '@/modules/disputes/entities/dispute.entity';
import { DisputeResolutionType } from '@/modules/disputes/enums/dispute-resolution-type.enum';
import { DisputeStatus } from '@/modules/disputes/enums/dispute-status.enum';
import { NotificationEventType } from '@/modules/notifications/enums/notification-event-type.enum';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import { PaymentsService } from '@/modules/payments/payments.service';
import { User } from '@/modules/users/entities/user.entity';
import { UsersService } from '@/modules/users/users.service';

@Injectable()
export class DisputesService {
  constructor(
    @InjectRepository(Dispute)
    private readonly disputeRepository: Repository<Dispute>,
    private readonly contractsService: ContractsService,
    private readonly paymentsService: PaymentsService,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private assertAdmin(user: User): void {
    if (!user.roles.includes(UserRole.SUPER_ADMIN)) {
      throw new ForbiddenException('Super admin only');
    }
  }

  private otherPartyId(contract: Contract, userId: string): string {
    return contract.clientId === userId ? contract.seekerId : contract.clientId;
  }

  async raise(user: User, contractId: string, dto: RaiseDisputeDto): Promise<Dispute> {
    const contract = await this.contractsService.findByIdOrFail(contractId);
    if (contract.clientId !== user.id && contract.seekerId !== user.id) {
      throw new ForbiddenException('You are not a party to this contract');
    }
    const disputableStatuses = [
      ContractStatus.ACTIVE,
      ContractStatus.SUBMITTED,
      ContractStatus.REVISION,
    ];
    if (!disputableStatuses.includes(contract.status)) {
      throw new ConflictException('This contract is not in a disputable state');
    }

    if (dto.milestoneId) {
      const milestones = await this.contractsService.listMilestones(user, contractId);
      if (!milestones.some((m) => m.id === dto.milestoneId)) {
        throw new NotFoundException('Milestone not found on this contract');
      }
    }

    const milestoneWhere = dto.milestoneId ?? IsNull();
    const existing = await this.disputeRepository.findOne({
      where: [
        { contractId, milestoneId: milestoneWhere, status: DisputeStatus.OPEN },
        { contractId, milestoneId: milestoneWhere, status: DisputeStatus.UNDER_REVIEW },
      ],
    });
    if (existing) {
      throw new ConflictException('There is already an open dispute for this contract/milestone');
    }

    const escrowTx = await this.paymentsService.findEscrowTransaction(
      contractId,
      dto.milestoneId ?? null,
    );
    if (!escrowTx) {
      throw new BadRequestException(
        'No funded escrow found for this contract/milestone to dispute',
      );
    }

    const dispute = await this.disputeRepository.save(
      this.disputeRepository.create({
        contractId,
        milestoneId: dto.milestoneId ?? null,
        raisedBy: user.id,
        reason: dto.reason,
        evidence: dto.evidence ?? [],
        status: DisputeStatus.OPEN,
      }),
    );

    await this.contractsService.markDisputed(contractId, dto.milestoneId ?? null);

    const otherParty = await this.usersService.findById(this.otherPartyId(contract, user.id));
    if (otherParty) {
      await this.notificationsService.notify(otherParty, {
        type: NotificationEventType.DISPUTE_OPENED,
        title: 'A dispute was raised on your contract',
        message: `${user.firstName ?? 'The other party'} raised a dispute: ${dto.reason}`,
        link: `/disputes/${dispute.id}`,
      });
    }

    return dispute;
  }

  async findByIdOrFail(id: string): Promise<Dispute> {
    const dispute = await this.disputeRepository.findOne({ where: { id } });
    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }
    return dispute;
  }

  async getDetailForUser(user: User, id: string): Promise<Dispute> {
    const dispute = await this.findByIdOrFail(id);
    if (user.roles.includes(UserRole.SUPER_ADMIN)) {
      return dispute;
    }
    const contract = await this.contractsService.findByIdOrFail(dispute.contractId);
    if (contract.clientId !== user.id && contract.seekerId !== user.id) {
      throw new ForbiddenException('You do not have access to this dispute');
    }
    return dispute;
  }

  async listMine(user: User): Promise<Dispute[]> {
    return this.disputeRepository
      .createQueryBuilder('d')
      .innerJoin('d.contract', 'c')
      .where('c.clientId = :userId OR c.seekerId = :userId', { userId: user.id })
      .orderBy('d.createdAt', 'DESC')
      .getMany();
  }

  async listQueue(admin: User, status?: DisputeStatus): Promise<Dispute[]> {
    this.assertAdmin(admin);
    return this.disputeRepository.find({
      where: status ? { status } : {},
      order: { createdAt: 'ASC' },
    });
  }

  async markUnderReview(admin: User, id: string): Promise<Dispute> {
    this.assertAdmin(admin);
    const dispute = await this.findByIdOrFail(id);
    if (dispute.status !== DisputeStatus.OPEN) {
      throw new ConflictException('Only an OPEN dispute can be moved to UNDER_REVIEW');
    }
    dispute.status = DisputeStatus.UNDER_REVIEW;
    return this.disputeRepository.save(dispute);
  }

  async resolve(admin: User, id: string, dto: ResolveDisputeDto): Promise<Dispute> {
    this.assertAdmin(admin);
    const dispute = await this.findByIdOrFail(id);
    if (dispute.status === DisputeStatus.RESOLVED) {
      throw new ConflictException('This dispute is already resolved');
    }

    const contract = await this.contractsService.findByIdOrFail(dispute.contractId);
    const escrowTx = await this.paymentsService.findEscrowTransaction(
      dispute.contractId,
      dispute.milestoneId,
    );
    if (!escrowTx) {
      throw new BadRequestException('No funded escrow found for this contract/milestone');
    }

    switch (dto.resolutionType) {
      case DisputeResolutionType.REFUND_CLIENT: {
        await this.paymentsService.refundTransaction(admin, escrowTx.id);
        await this.contractsService.cancelAfterDispute(dispute.contractId);
        break;
      }

      case DisputeResolutionType.RELEASE_SEEKER: {
        const seekerNet = await this.paymentsService.computeSeekerNet(escrowTx.amount);
        await this.paymentsService.releaseForDisputeResolution(
          admin,
          contract,
          dispute.milestoneId,
          dispute.id,
          seekerNet,
        );
        await this.contractsService.completeAfterDispute(dispute.contractId, dispute.milestoneId);
        break;
      }

      case DisputeResolutionType.SPLIT: {
        if (!dto.seekerAmount || dto.seekerAmount >= escrowTx.amount) {
          throw new BadRequestException(
            'seekerAmount is required for SPLIT and must be less than the escrowed amount',
          );
        }
        const seekerNet = await this.paymentsService.computeSeekerNet(dto.seekerAmount);
        await this.paymentsService.releaseForDisputeResolution(
          admin,
          contract,
          dispute.milestoneId,
          dispute.id,
          seekerNet,
        );

        const clientTotal = escrowTx.amount + escrowTx.clientFee;
        const unfulfilledPortion = (escrowTx.amount - dto.seekerAmount) / escrowTx.amount;
        const refundAmount = Math.round(clientTotal * unfulfilledPortion * 100) / 100;
        await this.paymentsService.refundTransaction(admin, escrowTx.id, refundAmount);

        await this.contractsService.completeAfterDispute(dispute.contractId, dispute.milestoneId);
        break;
      }
    }

    dispute.status = DisputeStatus.RESOLVED;
    dispute.resolutionType = dto.resolutionType;
    dispute.resolutionNote = dto.resolutionNote;
    dispute.resolvedBy = admin.id;
    dispute.resolvedAt = new Date();
    const saved = await this.disputeRepository.save(dispute);

    const [client, seeker] = await Promise.all([
      this.usersService.findById(contract.clientId),
      this.usersService.findById(contract.seekerId),
    ]);
    const payload = {
      type: NotificationEventType.DISPUTE_RESOLVED,
      title: 'Dispute resolved',
      message: `Resolution: ${dto.resolutionType}. ${dto.resolutionNote}`,
      link: `/disputes/${dispute.id}`,
    };
    if (client) await this.notificationsService.notify(client, payload);
    if (seeker) await this.notificationsService.notify(seeker, payload);

    return saved;
  }
}
