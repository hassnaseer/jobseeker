import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileStatus } from '@/common/enums/profile-status.enum';
import { UserRole } from '@/common/enums/user-role.enum';
import { CategoriesService } from '@/modules/categories/categories.service';
import { CreateApplicationDto } from '@/modules/applications/dto/create-application.dto';
import { Application } from '@/modules/applications/entities/application.entity';
import { ApplicationSource } from '@/modules/applications/enums/application-source.enum';
import { ApplicationStatus } from '@/modules/applications/enums/application-status.enum';
import { Job } from '@/modules/jobs/entities/job.entity';
import { JobStatus } from '@/modules/jobs/enums/job-status.enum';
import { JobType } from '@/modules/jobs/enums/job-type.enum';
import { NotificationEventType } from '@/modules/notifications/enums/notification-event-type.enum';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import { User } from '@/modules/users/entities/user.entity';
import { UsersService } from '@/modules/users/users.service';

const ACTIVE_STATUSES = [
  ApplicationStatus.PENDING,
  ApplicationStatus.SHORTLISTED,
  ApplicationStatus.ACCEPTED,
];

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    private readonly usersService: UsersService,
    private readonly categoriesService: CategoriesService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private async findJobOrFail(id: string): Promise<Job> {
    const job = await this.jobRepository.findOne({ where: { id } });
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    return job;
  }

  async findByIdOrFail(id: string): Promise<Application> {
    const application = await this.applicationRepository.findOne({ where: { id } });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    return application;
  }

  /** Only the seeker who applied, the client who owns the job, or SA may view an application. */
  async getDetailForUser(user: User, id: string): Promise<Application> {
    const application = await this.findByIdOrFail(id);
    if (application.seekerId === user.id || user.roles.includes(UserRole.SUPER_ADMIN)) {
      return application;
    }
    const job = await this.findJobOrFail(application.jobId);
    if (job.clientId === user.id) {
      return application;
    }
    throw new ForbiddenException('You do not have access to this application');
  }

  async create(
    seeker: User,
    jobId: string,
    dto: CreateApplicationDto,
    source: ApplicationSource = ApplicationSource.JOB_PAGE,
  ): Promise<Application> {
    if (!seeker.roles.includes(UserRole.SEEKER)) {
      throw new ForbiddenException('You do not hold the SEEKER role');
    }
    const seekerStatus = await this.usersService.findRoleProfileStatus(seeker.id, UserRole.SEEKER);
    if (seekerStatus?.profileStatus !== ProfileStatus.APPROVED) {
      throw new ForbiddenException('Your seeker profile must be approved before applying');
    }

    const job = await this.findJobOrFail(jobId);
    if (job.status !== JobStatus.OPEN || job.isPaused) {
      throw new BadRequestException('This job is not currently accepting applications');
    }

    const existing = await this.applicationRepository.findOne({
      where: { jobId, seekerId: seeker.id },
      order: { createdAt: 'DESC' },
    });
    if (existing && ACTIVE_STATUSES.includes(existing.status)) {
      throw new ConflictException('You already have an active application for this job');
    }

    // Spec §6.3: proposals sent from chat must match a category the
    // seeker has selected, or be blocked with a prompt to add it.
    if (source === ApplicationSource.CHAT) {
      const selected = await this.categoriesService.getUserCategories(seeker.id, UserRole.SEEKER);
      const hasCategory = selected.some((uc) => uc.categoryId === job.categoryId);
      if (!hasCategory) {
        throw new BadRequestException({
          code: 'CATEGORY_NOT_SELECTED',
          message: "Add this job's category to your profile before proposing from chat",
          categoryId: job.categoryId,
        });
      }
    }

    if (job.jobType === JobType.FIXED && dto.bidAmount === undefined) {
      throw new BadRequestException('bidAmount is required for FIXED jobs');
    }
    if (job.jobType === JobType.HOURLY && dto.proposedHourlyRate === undefined) {
      throw new BadRequestException('proposedHourlyRate is required for HOURLY jobs');
    }

    const application = this.applicationRepository.create({
      jobId,
      seekerId: seeker.id,
      coverLetter: dto.coverLetter,
      bidAmount: job.jobType === JobType.FIXED ? dto.bidAmount! : null,
      proposedHourlyRate: job.jobType === JobType.HOURLY ? dto.proposedHourlyRate! : null,
      currency: dto.currency ?? job.currency,
      estimatedDuration: dto.estimatedDuration ?? null,
      attachments: dto.attachments ?? [],
      source,
      status: ApplicationStatus.PENDING,
    });
    const saved = await this.applicationRepository.save(application);

    job.applicationsCount += 1;
    await this.jobRepository.save(job);

    const client = await this.usersService.findById(job.clientId);
    if (client) {
      await this.notificationsService.notify(client, {
        type: NotificationEventType.APPLICATION_RECEIVED,
        title: 'New application received',
        message: `You have a new application for "${job.title}".`,
        link: `/jobs/${job.id}/applications`,
      });
    }

    return saved;
  }

  async listForJob(
    client: User,
    jobId: string,
    status?: ApplicationStatus,
  ): Promise<Application[]> {
    const job = await this.findJobOrFail(jobId);
    if (job.clientId !== client.id && !client.roles.includes(UserRole.SUPER_ADMIN)) {
      throw new ForbiddenException('You do not own this job');
    }
    return this.applicationRepository.find({
      where: status ? { jobId, status } : { jobId },
      order: { createdAt: 'DESC' },
    });
  }

  async listMine(seeker: User): Promise<Application[]> {
    return this.applicationRepository.find({
      where: { seekerId: seeker.id },
      order: { createdAt: 'DESC' },
    });
  }

  private async assertJobOwner(user: User, application: Application): Promise<Job> {
    const job = await this.findJobOrFail(application.jobId);
    if (job.clientId !== user.id && !user.roles.includes(UserRole.SUPER_ADMIN)) {
      throw new ForbiddenException('You do not own this job');
    }
    return job;
  }

  async shortlist(client: User, id: string): Promise<Application> {
    const application = await this.findByIdOrFail(id);
    await this.assertJobOwner(client, application);
    if (application.status !== ApplicationStatus.PENDING) {
      throw new ConflictException('Only pending applications can be shortlisted');
    }
    application.status = ApplicationStatus.SHORTLISTED;
    return this.applicationRepository.save(application);
  }

  /**
   * Marks the proposal itself accepted. Creating the actual Contract
   * (funding escrow, moving the job to IN_PROGRESS) is the Contracts
   * module's job (spec §5.1 "Hire (fund escrow...) -> ACTIVE") — it will
   * call in here to read ACCEPTED applications once it exists.
   */
  async accept(client: User, id: string): Promise<Application> {
    const application = await this.findByIdOrFail(id);
    const job = await this.assertJobOwner(client, application);
    if (![ApplicationStatus.PENDING, ApplicationStatus.SHORTLISTED].includes(application.status)) {
      throw new ConflictException('Only pending or shortlisted applications can be accepted');
    }
    application.status = ApplicationStatus.ACCEPTED;
    const saved = await this.applicationRepository.save(application);

    const seeker = await this.usersService.findById(application.seekerId);
    if (seeker) {
      await this.notificationsService.notify(seeker, {
        type: NotificationEventType.APPLICATION_ACCEPTED,
        title: 'Your application was accepted',
        message: `Your application for "${job.title}" was accepted.`,
        link: `/applications/${application.id}`,
      });
    }

    return saved;
  }

  async reject(client: User, id: string): Promise<Application> {
    const application = await this.findByIdOrFail(id);
    const job = await this.assertJobOwner(client, application);
    if (![ApplicationStatus.PENDING, ApplicationStatus.SHORTLISTED].includes(application.status)) {
      throw new ConflictException('Only pending or shortlisted applications can be rejected');
    }
    application.status = ApplicationStatus.REJECTED;
    const saved = await this.applicationRepository.save(application);

    const seeker = await this.usersService.findById(application.seekerId);
    if (seeker) {
      await this.notificationsService.notify(seeker, {
        type: NotificationEventType.APPLICATION_REJECTED,
        title: 'Your application was not selected',
        message: `Your application for "${job.title}" was not selected this time.`,
        link: `/applications/${application.id}`,
      });
    }

    return saved;
  }

  async withdraw(seeker: User, id: string): Promise<Application> {
    const application = await this.findByIdOrFail(id);
    if (application.seekerId !== seeker.id) {
      throw new ForbiddenException('This is not your application');
    }
    if (![ApplicationStatus.PENDING, ApplicationStatus.SHORTLISTED].includes(application.status)) {
      throw new ConflictException('Only pending or shortlisted applications can be withdrawn');
    }
    application.status = ApplicationStatus.WITHDRAWN;
    return this.applicationRepository.save(application);
  }
}
