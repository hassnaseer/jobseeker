import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileStatus } from '@/common/enums/profile-status.enum';
import { UserRole } from '@/common/enums/user-role.enum';
import { CategoriesService } from '@/modules/categories/categories.service';
import { CreateJobDto } from '@/modules/jobs/dto/create-job.dto';
import { JobSortBy, QueryJobsDto } from '@/modules/jobs/dto/query-jobs.dto';
import { UpdateJobDto } from '@/modules/jobs/dto/update-job.dto';
import { Job } from '@/modules/jobs/entities/job.entity';
import { JobStatus } from '@/modules/jobs/enums/job-status.enum';
import { JobType } from '@/modules/jobs/enums/job-type.enum';
import { LocationType } from '@/modules/jobs/enums/location-type.enum';
import { PricingModel } from '@/modules/jobs/enums/pricing-model.enum';
import { TrackingMode } from '@/modules/jobs/enums/tracking-mode.enum';
import { User } from '@/modules/users/entities/user.entity';
import { UsersService } from '@/modules/users/users.service';

/** Once any of these are true, only cosmetic fields may still be edited (spec §5.4). */
const LOCKED_STATUSES = [
  JobStatus.IN_PROGRESS,
  JobStatus.SUBMITTED,
  JobStatus.COMPLETED,
  JobStatus.DISPUTED,
];
const EDITABLE_FIELDS_AFTER_LOCK = [
  'title',
  'description',
  'deadline',
  'attachments',
  'skillsRequired',
  'experienceLevel',
] as const;

/**
 * Loose shape shared by CreateJobDto, the merged draft used during update,
 * and the persisted Job entity — DTOs use `undefined` for "not set", the
 * entity uses `null`, so every field here accepts either.
 */
interface JobConsistencyInput {
  jobType: JobType;
  locationType: LocationType;
  pricingModel?: PricingModel | null;
  budgetAmount?: number | null;
  trackingMode?: TrackingMode | null;
  hourlyRateMin?: number | null;
  hourlyRateMax?: number | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  deadline?: string | Date | null;
}

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    private readonly categoriesService: CategoriesService,
    private readonly usersService: UsersService,
  ) {}

  private async assertClientApproved(client: User): Promise<void> {
    if (!client.roles.includes(UserRole.CLIENT)) {
      throw new ForbiddenException('You do not hold the CLIENT role');
    }
    const status = await this.usersService.findRoleProfileStatus(client.id, UserRole.CLIENT);
    if (status?.profileStatus !== ProfileStatus.APPROVED) {
      throw new ForbiddenException('Your client profile must be approved before posting jobs');
    }
  }

  /**
   * `strict` enforces "required when jobType/locationType is X" rules — only
   * applied when the job is being published (OPEN), so DRAFTs can be saved
   * incomplete. Fields that ARE present are always checked for internal
   * consistency (e.g. hourlyRateMax >= hourlyRateMin) regardless of strict.
   */
  private validateConsistency(draft: JobConsistencyInput, strict: boolean): void {
    const errors: string[] = [];
    // Entity fields use `null` for "not set"; DTO fields use `undefined`.
    // This is called with both, so treat either as "missing".
    const isMissing = (value: unknown): boolean => value === undefined || value === null;

    if (draft.jobType === JobType.FIXED) {
      if (strict && !draft.pricingModel) errors.push('pricingModel is required for FIXED jobs');
      if (strict && isMissing(draft.budgetAmount))
        errors.push('budgetAmount is required for FIXED jobs');
    }

    if (draft.jobType === JobType.HOURLY) {
      if (strict && !draft.trackingMode) errors.push('trackingMode is required for HOURLY jobs');
      if (strict && isMissing(draft.hourlyRateMin))
        errors.push('hourlyRateMin is required for HOURLY jobs');
      if (
        !isMissing(draft.hourlyRateMin) &&
        !isMissing(draft.hourlyRateMax) &&
        draft.hourlyRateMax! < draft.hourlyRateMin!
      ) {
        errors.push('hourlyRateMax cannot be less than hourlyRateMin');
      }
    }

    if (draft.locationType === LocationType.PHYSICAL) {
      if (strict && !draft.address) errors.push('address is required for PHYSICAL jobs');
      if (strict && isMissing(draft.latitude))
        errors.push('latitude is required for PHYSICAL jobs');
      if (strict && isMissing(draft.longitude))
        errors.push('longitude is required for PHYSICAL jobs');
    }

    if (draft.deadline && new Date(draft.deadline) <= new Date()) {
      errors.push('deadline must be in the future');
    }

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }
  }

  /** Nulls out fields that don't apply to the chosen jobType/locationType. */
  private normalize(job: Job): void {
    if (job.jobType === JobType.FIXED) {
      job.trackingMode = null;
      job.hourlyRateMin = null;
      job.hourlyRateMax = null;
    } else {
      job.pricingModel = null;
      job.budgetAmount = null;
    }

    if (job.locationType === LocationType.REMOTE) {
      job.address = null;
      job.latitude = null;
      job.longitude = null;
      job.radiusKm = null;
      job.checkinRequired = false;
    }
  }

  async create(client: User, dto: CreateJobDto): Promise<Job> {
    await this.assertClientApproved(client);
    await this.categoriesService.findByIdOrFail(dto.categoryId);

    const strict = !!dto.publish;
    this.validateConsistency(dto, strict);
    const { publish: _publish, ...jobFields } = dto;

    const job = this.jobRepository.create({
      ...jobFields,
      clientId: client.id,
      deadline: dto.deadline ? new Date(dto.deadline) : null,
      status: strict ? JobStatus.OPEN : JobStatus.DRAFT,
    });
    this.normalize(job);
    return this.jobRepository.save(job);
  }

  async findByIdOrFail(id: string): Promise<Job> {
    const job = await this.jobRepository.findOne({ where: { id } });
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    return job;
  }

  private assertOwner(job: Job, user: User): void {
    if (job.clientId !== user.id && !user.roles.includes(UserRole.SUPER_ADMIN)) {
      throw new ForbiddenException('You do not own this job');
    }
  }

  async getPublicDetail(id: string): Promise<Job> {
    const job = await this.findByIdOrFail(id);
    if (job.status !== JobStatus.OPEN || job.isPaused) {
      throw new NotFoundException('Job not found');
    }
    job.viewsCount += 1;
    return this.jobRepository.save(job);
  }

  async listPublic(
    query: QueryJobsDto,
  ): Promise<{ items: Job[]; total: number; page: number; limit: number }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.jobRepository
      .createQueryBuilder('job')
      .where('job.status = :status', { status: JobStatus.OPEN })
      .andWhere('job.isPaused = false');

    if (query.keyword) {
      qb.andWhere('(job.title ILIKE :kw OR job.description ILIKE :kw)', {
        kw: `%${query.keyword}%`,
      });
    }
    if (query.categoryId) {
      qb.andWhere('job.categoryId = :categoryId', { categoryId: query.categoryId });
    }
    if (query.jobType) {
      qb.andWhere('job.jobType = :jobType', { jobType: query.jobType });
    }
    if (query.locationType) {
      qb.andWhere('job.locationType = :locationType', { locationType: query.locationType });
    }
    if (query.experienceLevel) {
      qb.andWhere('job.experienceLevel = :experienceLevel', {
        experienceLevel: query.experienceLevel,
      });
    }
    if (query.budgetMin !== undefined) {
      qb.andWhere('job.budgetAmount >= :budgetMin', { budgetMin: query.budgetMin });
    }
    if (query.budgetMax !== undefined) {
      qb.andWhere('job.budgetAmount <= :budgetMax', { budgetMax: query.budgetMax });
    }

    switch (query.sortBy) {
      case JobSortBy.BUDGET_HIGH:
        qb.orderBy('job.budgetAmount', 'DESC', 'NULLS LAST');
        break;
      case JobSortBy.BUDGET_LOW:
        qb.orderBy('job.budgetAmount', 'ASC', 'NULLS LAST');
        break;
      default:
        qb.orderBy('job.createdAt', 'DESC');
    }

    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async listMine(client: User): Promise<Job[]> {
    return this.jobRepository.find({
      where: { clientId: client.id },
      order: { createdAt: 'DESC' },
    });
  }

  async update(user: User, id: string, dto: UpdateJobDto): Promise<Job> {
    const job = await this.findByIdOrFail(id);
    this.assertOwner(job, user);

    const isLocked = job.applicationsCount > 0 || LOCKED_STATUSES.includes(job.status);
    if (isLocked) {
      const disallowed = Object.keys(dto).filter(
        (key) => !(EDITABLE_FIELDS_AFTER_LOCK as readonly string[]).includes(key),
      );
      if (disallowed.length > 0) {
        throw new BadRequestException(
          `This job has applications or is in progress — only ${EDITABLE_FIELDS_AFTER_LOCK.join(', ')} may still be edited (tried: ${disallowed.join(', ')})`,
        );
      }
    }

    if (dto.categoryId && dto.categoryId !== job.categoryId) {
      await this.categoriesService.findByIdOrFail(dto.categoryId);
    }

    const merged = {
      ...job,
      ...dto,
      deadline: dto.deadline ? new Date(dto.deadline) : job.deadline,
    };
    this.validateConsistency(merged, job.status === JobStatus.OPEN);

    Object.assign(job, dto);
    if (dto.deadline) {
      job.deadline = new Date(dto.deadline);
    }
    this.normalize(job);
    return this.jobRepository.save(job);
  }

  async publish(user: User, id: string): Promise<Job> {
    const job = await this.findByIdOrFail(id);
    this.assertOwner(job, user);

    if (job.status !== JobStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT jobs can be published');
    }
    await this.assertClientApproved(user);
    this.validateConsistency(job, true);

    job.status = JobStatus.OPEN;
    return this.jobRepository.save(job);
  }

  async pause(user: User, id: string): Promise<Job> {
    const job = await this.findByIdOrFail(id);
    this.assertOwner(job, user);
    if (job.status !== JobStatus.OPEN) {
      throw new BadRequestException('Only OPEN jobs can be paused');
    }
    job.isPaused = true;
    return this.jobRepository.save(job);
  }

  async resume(user: User, id: string): Promise<Job> {
    const job = await this.findByIdOrFail(id);
    this.assertOwner(job, user);
    if (!job.isPaused) {
      throw new BadRequestException('This job is not paused');
    }
    job.isPaused = false;
    return this.jobRepository.save(job);
  }

  async close(user: User, id: string): Promise<Job> {
    const job = await this.findByIdOrFail(id);
    this.assertOwner(job, user);
    if (![JobStatus.DRAFT, JobStatus.OPEN].includes(job.status)) {
      throw new BadRequestException(
        'Only DRAFT or OPEN jobs can be closed this way — once hired, cancellation goes through the contract',
      );
    }
    job.status = JobStatus.CANCELLED;
    return this.jobRepository.save(job);
  }

  async duplicate(user: User, id: string): Promise<Job> {
    const source = await this.findByIdOrFail(id);
    this.assertOwner(source, user);

    const clone = this.jobRepository.create({
      ...source,
      id: undefined,
      status: JobStatus.DRAFT,
      isPaused: false,
      featured: false,
      viewsCount: 0,
      applicationsCount: 0,
      title: `${source.title} (copy)`,
      createdAt: undefined,
      updatedAt: undefined,
    });
    return this.jobRepository.save(clone);
  }
}
