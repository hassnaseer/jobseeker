import { ConflictException, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '@/common/enums/user-role.enum';
import { Application } from '@/modules/applications/entities/application.entity';
import { ApplicationStatus } from '@/modules/applications/enums/application-status.enum';
import {
  CategoryRemovalCheckParams,
  CategoryRemovalGuard,
} from '@/modules/categories/category-removal-guard.interface';
import { CategoryRemovalGuardRegistry } from '@/modules/categories/category-removal-guard.registry';

/**
 * Spec §4.1: a seeker cannot unselect a category while they have an
 * application PENDING/SHORTLISTED/ACCEPTED for a job under it.
 */
const BLOCKING_APPLICATION_STATUSES = [
  ApplicationStatus.PENDING,
  ApplicationStatus.SHORTLISTED,
  ApplicationStatus.ACCEPTED,
];

@Injectable()
export class ApplicationCategoryRemovalGuard implements CategoryRemovalGuard, OnModuleInit {
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
    private readonly registry: CategoryRemovalGuardRegistry,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async check(params: CategoryRemovalCheckParams): Promise<void> {
    if (params.role !== UserRole.SEEKER) {
      return;
    }

    const count = await this.applicationRepository
      .createQueryBuilder('application')
      .innerJoin('application.job', 'job')
      .where('application.seekerId = :seekerId', { seekerId: params.userId })
      .andWhere('job.categoryId = :categoryId', { categoryId: params.categoryId })
      .andWhere('application.status IN (:...statuses)', { statuses: BLOCKING_APPLICATION_STATUSES })
      .getCount();

    if (count > 0) {
      throw new ConflictException(
        'You have an active application under this category. Withdraw it before removing the category.',
      );
    }
  }
}
