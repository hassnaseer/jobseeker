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
import { ApplicationSource } from '@/modules/applications/enums/application-source.enum';
import { ApplicationStatus } from '@/modules/applications/enums/application-status.enum';
import { Application } from '@/modules/applications/entities/application.entity';
import { CatalogTier } from '@/modules/catalogs/entities/catalog-tier.entity';
import { ProjectCatalog } from '@/modules/catalogs/entities/project-catalog.entity';
import { CatalogStatus } from '@/modules/catalogs/enums/catalog-status.enum';
import { CreateCatalogDto } from '@/modules/catalogs/dto/create-catalog.dto';
import { CreateTierDto } from '@/modules/catalogs/dto/create-tier.dto';
import { UpdateCatalogDto } from '@/modules/catalogs/dto/update-catalog.dto';
import { UpdateTierDto } from '@/modules/catalogs/dto/update-tier.dto';
import { CategoriesService } from '@/modules/categories/categories.service';
import { Contract } from '@/modules/contracts/entities/contract.entity';
import { ContractsService } from '@/modules/contracts/contracts.service';
import { Job } from '@/modules/jobs/entities/job.entity';
import { JobStatus } from '@/modules/jobs/enums/job-status.enum';
import { JobType } from '@/modules/jobs/enums/job-type.enum';
import { LocationType } from '@/modules/jobs/enums/location-type.enum';
import { PricingModel } from '@/modules/jobs/enums/pricing-model.enum';
import { User } from '@/modules/users/entities/user.entity';
import { UsersService } from '@/modules/users/users.service';

@Injectable()
export class CatalogsService {
  constructor(
    @InjectRepository(ProjectCatalog)
    private readonly catalogRepository: Repository<ProjectCatalog>,
    @InjectRepository(CatalogTier)
    private readonly tierRepository: Repository<CatalogTier>,
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
    private readonly categoriesService: CategoriesService,
    private readonly contractsService: ContractsService,
    private readonly usersService: UsersService,
  ) {}

  private async assertApprovedSeeker(seeker: User): Promise<void> {
    if (!seeker.roles.includes(UserRole.SEEKER)) {
      throw new ForbiddenException('You do not hold the SEEKER role');
    }
    const status = await this.usersService.findRoleProfileStatus(seeker.id, UserRole.SEEKER);
    if (status?.profileStatus !== ProfileStatus.APPROVED) {
      throw new ForbiddenException('Your seeker profile must be approved to manage catalogs');
    }
  }

  async findByIdOrFail(id: string): Promise<ProjectCatalog> {
    const catalog = await this.catalogRepository.findOne({ where: { id } });
    if (!catalog) {
      throw new NotFoundException('Catalog not found');
    }
    return catalog;
  }

  private async assertOwner(seeker: User, catalog: ProjectCatalog): Promise<void> {
    if (catalog.seekerId !== seeker.id && !seeker.roles.includes(UserRole.SUPER_ADMIN)) {
      throw new ForbiddenException('You do not own this catalog');
    }
  }

  async create(seeker: User, dto: CreateCatalogDto): Promise<ProjectCatalog> {
    await this.assertApprovedSeeker(seeker);
    await this.categoriesService.findByIdOrFail(dto.categoryId);

    return this.catalogRepository.save(
      this.catalogRepository.create({
        seekerId: seeker.id,
        title: dto.title,
        categoryId: dto.categoryId,
        description: dto.description,
        gallery: dto.gallery ?? [],
        faq: dto.faq ?? [],
        status: CatalogStatus.DRAFT,
      }),
    );
  }

  async update(seeker: User, id: string, dto: UpdateCatalogDto): Promise<ProjectCatalog> {
    const catalog = await this.findByIdOrFail(id);
    await this.assertOwner(seeker, catalog);
    if (dto.categoryId) {
      await this.categoriesService.findByIdOrFail(dto.categoryId);
    }
    Object.assign(catalog, dto);
    return this.catalogRepository.save(catalog);
  }

  async publish(seeker: User, id: string): Promise<ProjectCatalog> {
    const catalog = await this.findByIdOrFail(id);
    await this.assertOwner(seeker, catalog);
    if (catalog.status !== CatalogStatus.DRAFT) {
      throw new ConflictException('Only a DRAFT catalog can be published');
    }
    const tierCount = await this.tierRepository.count({ where: { catalogId: id } });
    if (tierCount === 0) {
      throw new BadRequestException('Add at least one tier before publishing');
    }
    catalog.status = CatalogStatus.ACTIVE;
    return this.catalogRepository.save(catalog);
  }

  async pause(seeker: User, id: string): Promise<ProjectCatalog> {
    const catalog = await this.findByIdOrFail(id);
    await this.assertOwner(seeker, catalog);
    if (catalog.status !== CatalogStatus.ACTIVE) {
      throw new ConflictException('Only an ACTIVE catalog can be paused');
    }
    catalog.status = CatalogStatus.PAUSED;
    return this.catalogRepository.save(catalog);
  }

  async resume(seeker: User, id: string): Promise<ProjectCatalog> {
    const catalog = await this.findByIdOrFail(id);
    await this.assertOwner(seeker, catalog);
    if (catalog.status !== CatalogStatus.PAUSED) {
      throw new ConflictException('Only a PAUSED catalog can be resumed');
    }
    catalog.status = CatalogStatus.ACTIVE;
    return this.catalogRepository.save(catalog);
  }

  async listMine(seeker: User): Promise<ProjectCatalog[]> {
    return this.catalogRepository.find({
      where: { seekerId: seeker.id },
      order: { createdAt: 'DESC' },
    });
  }

  async listPublic(categoryId?: string): Promise<ProjectCatalog[]> {
    return this.catalogRepository.find({
      where: categoryId
        ? { status: CatalogStatus.ACTIVE, categoryId }
        : { status: CatalogStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });
  }

  /** SA moderation queue (spec §16) — every catalog regardless of status. */
  async listAllForAdmin(status?: CatalogStatus): Promise<ProjectCatalog[]> {
    return this.catalogRepository.find({
      where: status ? { status } : {},
      order: { createdAt: 'DESC' },
      take: 200,
    });
  }

  async getPublicDetail(id: string): Promise<{ catalog: ProjectCatalog; tiers: CatalogTier[] }> {
    const catalog = await this.findByIdOrFail(id);
    const tiers = await this.tierRepository.find({
      where: { catalogId: id },
      order: { price: 'ASC' },
    });
    return { catalog, tiers };
  }

  // ---- Tiers ----

  async addTier(seeker: User, catalogId: string, dto: CreateTierDto): Promise<CatalogTier> {
    const catalog = await this.findByIdOrFail(catalogId);
    await this.assertOwner(seeker, catalog);
    return this.tierRepository.save(
      this.tierRepository.create({
        catalogId,
        name: dto.name,
        price: dto.price,
        currency: dto.currency ?? 'USD',
        deliveryDays: dto.deliveryDays,
        revisions: dto.revisions ?? 0,
        features: dto.features ?? [],
      }),
    );
  }

  async updateTier(
    seeker: User,
    catalogId: string,
    tierId: string,
    dto: UpdateTierDto,
  ): Promise<CatalogTier> {
    const catalog = await this.findByIdOrFail(catalogId);
    await this.assertOwner(seeker, catalog);
    const tier = await this.tierRepository.findOne({ where: { id: tierId, catalogId } });
    if (!tier) {
      throw new NotFoundException('Tier not found');
    }
    Object.assign(tier, dto);
    return this.tierRepository.save(tier);
  }

  async removeTier(seeker: User, catalogId: string, tierId: string): Promise<{ message: string }> {
    const catalog = await this.findByIdOrFail(catalogId);
    await this.assertOwner(seeker, catalog);
    const result = await this.tierRepository.delete({ id: tierId, catalogId });
    if (!result.affected) {
      throw new NotFoundException('Tier not found');
    }
    return { message: 'Tier removed.' };
  }

  /**
   * Spec §8: "Client orders tier -> fixed contract." Synthesizes a private
   * Job + auto-accepted Application behind the scenes so the order can flow
   * through the same tested Contract/Payments/Deliverable/Dispute/Review
   * pipeline as a normal job-based hire, instead of building a parallel
   * money-movement path. The client still funds it via the existing
   * POST /payments/contracts/:id/fund endpoint.
   */
  async orderTier(client: User, tierId: string): Promise<Contract> {
    if (!client.roles.includes(UserRole.CLIENT)) {
      throw new ForbiddenException('You do not hold the CLIENT role');
    }

    const tier = await this.tierRepository.findOne({ where: { id: tierId } });
    if (!tier) {
      throw new NotFoundException('Tier not found');
    }
    const catalog = await this.findByIdOrFail(tier.catalogId);
    if (catalog.status !== CatalogStatus.ACTIVE) {
      throw new BadRequestException('This catalog is not currently accepting orders');
    }
    if (catalog.seekerId === client.id) {
      throw new BadRequestException('You cannot order your own catalog');
    }

    const job = await this.jobRepository.save(
      this.jobRepository.create({
        clientId: client.id,
        title: `Catalog order: ${catalog.title} — ${tier.name}`,
        description: catalog.description,
        categoryId: catalog.categoryId,
        jobType: JobType.FIXED,
        pricingModel: PricingModel.LUMP,
        locationType: LocationType.REMOTE,
        budgetAmount: tier.price,
        currency: tier.currency,
        status: JobStatus.IN_PROGRESS,
        numberOfOpenings: 1,
      }),
    );

    const application = await this.applicationRepository.save(
      this.applicationRepository.create({
        jobId: job.id,
        seekerId: catalog.seekerId,
        coverLetter: `Catalog order for tier "${tier.name}".`,
        bidAmount: tier.price,
        currency: tier.currency,
        source: ApplicationSource.CATALOG_ORDER,
        status: ApplicationStatus.ACCEPTED,
      }),
    );

    return this.contractsService.hire(client, application.id, {});
  }
}
