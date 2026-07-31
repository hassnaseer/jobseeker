import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '@/common/enums/user-role.enum';
import { Application } from '@/modules/applications/entities/application.entity';
import { ApplicationStatus } from '@/modules/applications/enums/application-status.enum';
import { CreateContractDto } from '@/modules/contracts/dto/create-contract.dto';
import { RequestRevisionDto } from '@/modules/contracts/dto/request-revision.dto';
import { SubmitDeliverableDto } from '@/modules/contracts/dto/submit-deliverable.dto';
import { Contract } from '@/modules/contracts/entities/contract.entity';
import { Deliverable } from '@/modules/contracts/entities/deliverable.entity';
import { Milestone } from '@/modules/contracts/entities/milestone.entity';
import { ContractStatus } from '@/modules/contracts/enums/contract-status.enum';
import { DeliverableStatus } from '@/modules/contracts/enums/deliverable-status.enum';
import { MilestoneStatus } from '@/modules/contracts/enums/milestone-status.enum';
import { Job } from '@/modules/jobs/entities/job.entity';
import { JobStatus } from '@/modules/jobs/enums/job-status.enum';
import { JobType } from '@/modules/jobs/enums/job-type.enum';
import { PricingModel } from '@/modules/jobs/enums/pricing-model.enum';
import { NotificationEventType } from '@/modules/notifications/enums/notification-event-type.enum';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import { User } from '@/modules/users/entities/user.entity';
import { UsersService } from '@/modules/users/users.service';

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    @InjectRepository(Milestone)
    private readonly milestoneRepository: Repository<Milestone>,
    @InjectRepository(Deliverable)
    private readonly deliverableRepository: Repository<Deliverable>,
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findByIdOrFail(id: string): Promise<Contract> {
    const contract = await this.contractRepository.findOne({ where: { id } });
    if (!contract) {
      throw new NotFoundException('Contract not found');
    }
    return contract;
  }

  async getDetailForUser(user: User, id: string): Promise<Contract> {
    const contract = await this.findByIdOrFail(id);
    this.assertParty(contract, user);
    return contract;
  }

  private assertParty(contract: Contract, user: User): void {
    if (
      contract.clientId !== user.id &&
      contract.seekerId !== user.id &&
      !user.roles.includes(UserRole.SUPER_ADMIN)
    ) {
      throw new ForbiddenException('You are not a party to this contract');
    }
  }

  private assertClient(contract: Contract, user: User): void {
    if (contract.clientId !== user.id && !user.roles.includes(UserRole.SUPER_ADMIN)) {
      throw new ForbiddenException('Only the hiring client can do this');
    }
  }

  private assertSeeker(contract: Contract, user: User): void {
    if (contract.seekerId !== user.id && !user.roles.includes(UserRole.SUPER_ADMIN)) {
      throw new ForbiddenException('Only the contracted seeker can do this');
    }
  }

  // ---- Hire: Application -> Contract (spec §5.1/§5.2 "Hire") ----

  async hire(client: User, applicationId: string, dto: CreateContractDto): Promise<Contract> {
    const application = await this.applicationRepository.findOne({ where: { id: applicationId } });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    if (application.status !== ApplicationStatus.ACCEPTED) {
      throw new BadRequestException('Only an ACCEPTED application can be hired into a contract');
    }

    const job = await this.jobRepository.findOne({ where: { id: application.jobId } });
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    if (job.clientId !== client.id && !client.roles.includes(UserRole.SUPER_ADMIN)) {
      throw new ForbiddenException('You do not own this job');
    }

    const existing = await this.contractRepository.findOne({ where: { applicationId } });
    if (existing) {
      throw new ConflictException('This application already has a contract');
    }

    const contract = this.contractRepository.create({
      jobId: job.id,
      clientId: job.clientId,
      seekerId: application.seekerId,
      applicationId: application.id,
      type: job.jobType,
      currency: application.currency,
      trackingMode: job.jobType === JobType.HOURLY ? job.trackingMode : null,
      weeklyHourLimit: job.jobType === JobType.HOURLY ? (dto.weeklyHourLimit ?? null) : null,
      checkinRequired: job.checkinRequired,
      status: ContractStatus.PENDING_FUNDING,
    });

    if (job.jobType === JobType.FIXED) {
      contract.pricingModel = job.pricingModel;
      if (job.pricingModel === PricingModel.MILESTONE) {
        if (!dto.milestones || dto.milestones.length === 0) {
          throw new BadRequestException(
            'At least one milestone is required for MILESTONE-priced jobs',
          );
        }
        contract.agreedAmount = dto.milestones.reduce((sum, m) => sum + m.amount, 0);
      } else {
        contract.agreedAmount = application.bidAmount;
      }
    } else {
      contract.agreedHourlyRate = application.proposedHourlyRate;
    }

    const saved = await this.contractRepository.save(contract);

    if (
      job.jobType === JobType.FIXED &&
      job.pricingModel === PricingModel.MILESTONE &&
      dto.milestones
    ) {
      const milestones = dto.milestones.map((m, index) =>
        this.milestoneRepository.create({
          contractId: saved.id,
          title: m.title,
          description: m.description ?? null,
          amount: m.amount,
          currency: application.currency,
          sequence: index + 1,
          status: MilestoneStatus.PENDING,
        }),
      );
      await this.milestoneRepository.save(milestones);
    }

    return saved;
  }

  async listMine(user: User): Promise<Contract[]> {
    return this.contractRepository.find({
      where: user.roles.includes(UserRole.SUPER_ADMIN)
        ? {}
        : [{ clientId: user.id }, { seekerId: user.id }],
      order: { createdAt: 'DESC' },
    });
  }

  async listMilestones(user: User, contractId: string): Promise<Milestone[]> {
    const contract = await this.findByIdOrFail(contractId);
    this.assertParty(contract, user);
    return this.milestoneRepository.find({ where: { contractId }, order: { sequence: 'ASC' } });
  }

  async listDeliverables(user: User, contractId: string): Promise<Deliverable[]> {
    const contract = await this.findByIdOrFail(contractId);
    this.assertParty(contract, user);
    return this.deliverableRepository.find({
      where: { contractId },
      order: { submittedAt: 'DESC' },
    });
  }

  // ---- Funding ----

  /**
   * Called by PaymentsService after a successful Stripe charge for FIXED
   * contracts. Not exposed directly over HTTP for FIXED (see
   * ContractsController's activate() for the HOURLY-only bare-transition
   * path — HOURLY has no upfront escrow, spec §5.2).
   */
  async fund(client: User, contractId: string): Promise<Contract> {
    const contract = await this.findByIdOrFail(contractId);
    this.assertClient(contract, client);
    if (contract.status !== ContractStatus.PENDING_FUNDING) {
      throw new ConflictException('This contract is not awaiting funding');
    }

    contract.status = ContractStatus.ACTIVE;
    contract.startedAt = new Date();
    await this.contractRepository.save(contract);

    if (contract.pricingModel === PricingModel.MILESTONE) {
      const first = await this.milestoneRepository.findOne({
        where: { contractId, sequence: 1 },
      });
      if (first) {
        first.status = MilestoneStatus.FUNDED;
        first.fundedAt = new Date();
        await this.milestoneRepository.save(first);
      }
    }

    const job = await this.jobRepository.findOneOrFail({ where: { id: contract.jobId } });
    job.status = JobStatus.IN_PROGRESS;
    await this.jobRepository.save(job);

    return contract;
  }

  /** HOURLY contracts skip escrow entirely — Hire -> ACTIVE directly (spec §5.2). */
  async activateHourlyContract(client: User, contractId: string): Promise<Contract> {
    const contract = await this.findByIdOrFail(contractId);
    if (contract.type !== JobType.HOURLY) {
      throw new BadRequestException('FIXED contracts must be funded via the payments endpoint');
    }
    return this.fund(client, contractId);
  }

  async fundMilestone(client: User, contractId: string, milestoneId: string): Promise<Milestone> {
    const contract = await this.findByIdOrFail(contractId);
    this.assertClient(contract, client);

    const milestone = await this.milestoneRepository.findOne({
      where: { id: milestoneId, contractId },
    });
    if (!milestone) {
      throw new NotFoundException('Milestone not found');
    }
    if (milestone.status !== MilestoneStatus.PENDING) {
      throw new ConflictException('Only a PENDING milestone can be funded');
    }

    const previous = await this.milestoneRepository.findOne({
      where: { contractId, sequence: milestone.sequence - 1 },
    });
    if (previous && previous.status !== MilestoneStatus.RELEASED) {
      throw new ConflictException(
        'The previous milestone must be released before funding the next one',
      );
    }

    milestone.status = MilestoneStatus.FUNDED;
    milestone.fundedAt = new Date();
    return this.milestoneRepository.save(milestone);
  }

  // ---- Deliverables (spec §5.1 "submit deliverable ... APPROVE / REVISION") ----

  async submitDeliverable(
    seeker: User,
    contractId: string,
    dto: SubmitDeliverableDto,
  ): Promise<Deliverable> {
    const contract = await this.findByIdOrFail(contractId);
    this.assertSeeker(contract, seeker);

    if (contract.type !== JobType.FIXED) {
      throw new BadRequestException(
        'Deliverables apply to FIXED contracts; hourly work is tracked via timesheets',
      );
    }
    if (![ContractStatus.ACTIVE, ContractStatus.REVISION].includes(contract.status)) {
      throw new ConflictException(
        'This contract is not currently accepting deliverable submissions',
      );
    }

    let milestone: Milestone | null = null;
    if (contract.pricingModel === PricingModel.MILESTONE) {
      if (!dto.milestoneId) {
        throw new BadRequestException('milestoneId is required for MILESTONE contracts');
      }
      milestone = await this.milestoneRepository.findOne({
        where: { id: dto.milestoneId, contractId },
      });
      if (!milestone) {
        throw new NotFoundException('Milestone not found');
      }
      if (milestone.status !== MilestoneStatus.FUNDED) {
        throw new ConflictException('This milestone is not funded and ready for submission');
      }
      milestone.status = MilestoneStatus.SUBMITTED;
      await this.milestoneRepository.save(milestone);
    } else if (dto.milestoneId) {
      throw new BadRequestException('milestoneId is not applicable to LUMP contracts');
    }

    const deliverable = await this.deliverableRepository.save(
      this.deliverableRepository.create({
        contractId,
        milestoneId: milestone?.id ?? null,
        description: dto.description,
        attachments: dto.attachments ?? [],
        status: DeliverableStatus.SUBMITTED,
      }),
    );

    contract.status = ContractStatus.SUBMITTED;
    await this.contractRepository.save(contract);

    const client = await this.usersService.findById(contract.clientId);
    if (client) {
      await this.notificationsService.notify(client, {
        type: NotificationEventType.DELIVERABLE_SUBMITTED,
        title: 'A deliverable was submitted for your review',
        message: 'A deliverable is ready for your review.',
        link: `/contracts/${contract.id}`,
      });
    }

    return deliverable;
  }

  async approveDeliverable(
    client: User,
    contractId: string,
    deliverableId: string,
  ): Promise<Deliverable> {
    const contract = await this.findByIdOrFail(contractId);
    this.assertClient(contract, client);
    if (contract.status !== ContractStatus.SUBMITTED) {
      throw new ConflictException('This contract has no pending submission to approve');
    }

    const deliverable = await this.deliverableRepository.findOne({
      where: { id: deliverableId, contractId },
    });
    if (!deliverable || deliverable.status !== DeliverableStatus.SUBMITTED) {
      throw new ConflictException('This deliverable is not awaiting review');
    }

    deliverable.status = DeliverableStatus.APPROVED;
    deliverable.reviewedAt = new Date();
    await this.deliverableRepository.save(deliverable);

    if (deliverable.milestoneId) {
      const milestone = await this.milestoneRepository.findOneOrFail({
        where: { id: deliverable.milestoneId },
      });
      milestone.status = MilestoneStatus.APPROVED;
      await this.milestoneRepository.save(milestone);
    }

    const seeker = await this.usersService.findById(contract.seekerId);
    if (seeker) {
      await this.notificationsService.notify(seeker, {
        type: NotificationEventType.DELIVERABLE_APPROVED,
        title: 'Your deliverable was approved',
        message: 'The client approved your submitted deliverable.',
        link: `/contracts/${contract.id}`,
      });
    }

    return deliverable;
  }

  async requestRevision(
    client: User,
    contractId: string,
    deliverableId: string,
    dto: RequestRevisionDto,
  ): Promise<Deliverable> {
    const contract = await this.findByIdOrFail(contractId);
    this.assertClient(contract, client);
    if (contract.status !== ContractStatus.SUBMITTED) {
      throw new ConflictException('This contract has no pending submission to send back');
    }

    const deliverable = await this.deliverableRepository.findOne({
      where: { id: deliverableId, contractId },
    });
    if (!deliverable || deliverable.status !== DeliverableStatus.SUBMITTED) {
      throw new ConflictException('This deliverable is not awaiting review');
    }

    deliverable.status = DeliverableStatus.REVISION_REQUESTED;
    deliverable.feedback = dto.feedback;
    deliverable.reviewedAt = new Date();
    await this.deliverableRepository.save(deliverable);

    if (deliverable.milestoneId) {
      const milestone = await this.milestoneRepository.findOneOrFail({
        where: { id: deliverable.milestoneId },
      });
      milestone.status = MilestoneStatus.FUNDED;
      await this.milestoneRepository.save(milestone);
    }

    contract.status = ContractStatus.REVISION;
    await this.contractRepository.save(contract);

    const seeker = await this.usersService.findById(contract.seekerId);
    if (seeker) {
      await this.notificationsService.notify(seeker, {
        type: NotificationEventType.DELIVERABLE_REVISION_REQUESTED,
        title: 'Revision requested on your deliverable',
        message: `The client requested changes: ${dto.feedback}`,
        link: `/contracts/${contract.id}`,
      });
    }

    return deliverable;
  }

  // ---- Release (stub: real escrow transfer lands with the Payments module) ----

  private async completeContract(contract: Contract): Promise<Contract> {
    contract.status = ContractStatus.COMPLETED;
    contract.completedAt = new Date();
    await this.contractRepository.save(contract);

    const job = await this.jobRepository.findOneOrFail({ where: { id: contract.jobId } });
    job.status = JobStatus.COMPLETED;
    await this.jobRepository.save(job);

    const [client, seeker] = await Promise.all([
      this.usersService.findById(contract.clientId),
      this.usersService.findById(contract.seekerId),
    ]);
    const payload = {
      type: NotificationEventType.CONTRACT_COMPLETED,
      title: 'Contract completed',
      message: `Your contract for "${job.title}" is now complete.`,
      link: `/contracts/${contract.id}`,
    };
    if (client) await this.notificationsService.notify(client, payload);
    if (seeker) await this.notificationsService.notify(seeker, payload);

    return contract;
  }

  /**
   * HOURLY contracts have no single "last milestone" to trigger completion
   * off of — billing periods just repeat until the client decides the
   * engagement is done (spec §5.2 "...repeat -> COMPLETED"). Exposed here
   * for the timesheets module to call.
   */
  async completeHourlyContract(client: User, contractId: string): Promise<Contract> {
    const contract = await this.findByIdOrFail(contractId);
    this.assertClient(contract, client);
    if (contract.type !== JobType.HOURLY) {
      throw new BadRequestException('This action is only for HOURLY contracts');
    }
    if (contract.status !== ContractStatus.ACTIVE) {
      throw new ConflictException('Only an ACTIVE contract can be completed');
    }
    return this.completeContract(contract);
  }

  async releaseMilestone(
    client: User,
    contractId: string,
    milestoneId: string,
  ): Promise<Milestone> {
    const contract = await this.findByIdOrFail(contractId);
    this.assertClient(contract, client);
    if (contract.pricingModel !== PricingModel.MILESTONE) {
      throw new BadRequestException('This contract is not milestone-based');
    }

    const milestone = await this.milestoneRepository.findOne({
      where: { id: milestoneId, contractId },
    });
    if (!milestone) {
      throw new NotFoundException('Milestone not found');
    }
    if (milestone.status !== MilestoneStatus.APPROVED) {
      throw new ConflictException('Only an APPROVED milestone can be released');
    }

    milestone.status = MilestoneStatus.RELEASED;
    milestone.releasedAt = new Date();
    await this.milestoneRepository.save(milestone);

    const total = await this.milestoneRepository.count({
      where: { contractId },
    });
    const released = await this.milestoneRepository.count({
      where: { contractId, status: MilestoneStatus.RELEASED },
    });

    if (released >= total) {
      await this.completeContract(contract);
    } else {
      contract.status = ContractStatus.ACTIVE;
      await this.contractRepository.save(contract);
    }

    return milestone;
  }

  async releaseLump(client: User, contractId: string): Promise<Contract> {
    const contract = await this.findByIdOrFail(contractId);
    this.assertClient(contract, client);
    if (contract.pricingModel !== PricingModel.LUMP) {
      throw new BadRequestException('This action is only for LUMP-priced contracts');
    }
    if (contract.status !== ContractStatus.SUBMITTED) {
      throw new ConflictException('This contract has no approved submission ready to release');
    }

    const latest = await this.deliverableRepository.findOne({
      where: { contractId },
      order: { submittedAt: 'DESC' },
    });
    if (!latest || latest.status !== DeliverableStatus.APPROVED) {
      throw new ConflictException(
        'The latest deliverable must be approved before releasing payment',
      );
    }

    return this.completeContract(contract);
  }

  // ---- Dispute integration (spec §14) — DisputesService drives these ----

  /** Freezes the contract (and milestone, if scoped to one) while a dispute is under review. */
  async markDisputed(contractId: string, milestoneId: string | null): Promise<void> {
    const contract = await this.findByIdOrFail(contractId);
    contract.status = ContractStatus.DISPUTED;
    await this.contractRepository.save(contract);

    const job = await this.jobRepository.findOneOrFail({ where: { id: contract.jobId } });
    job.status = JobStatus.DISPUTED;
    await this.jobRepository.save(job);

    if (milestoneId) {
      const milestone = await this.milestoneRepository.findOneOrFail({
        where: { id: milestoneId },
      });
      milestone.status = MilestoneStatus.DISPUTED;
      await this.milestoneRepository.save(milestone);
    }
  }

  /** RELEASE_SEEKER / SPLIT resolution: money moved, so the engagement is done. */
  async completeAfterDispute(contractId: string, milestoneId: string | null): Promise<void> {
    if (milestoneId) {
      const milestone = await this.milestoneRepository.findOneOrFail({
        where: { id: milestoneId },
      });
      milestone.status = MilestoneStatus.RELEASED;
      milestone.releasedAt = new Date();
      await this.milestoneRepository.save(milestone);
    }
    const contract = await this.findByIdOrFail(contractId);
    await this.completeContract(contract);
  }

  /** REFUND_CLIENT resolution: nothing delivered, contract ends without payment to the seeker. */
  async cancelAfterDispute(contractId: string): Promise<void> {
    const contract = await this.findByIdOrFail(contractId);
    contract.status = ContractStatus.CANCELLED;
    await this.contractRepository.save(contract);

    const job = await this.jobRepository.findOneOrFail({ where: { id: contract.jobId } });
    job.status = JobStatus.CANCELLED;
    await this.jobRepository.save(job);
  }
}
