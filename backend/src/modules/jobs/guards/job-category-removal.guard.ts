import { ConflictException, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UserRole } from '@/common/enums/user-role.enum';
import {
  CategoryRemovalCheckParams,
  CategoryRemovalGuard,
} from '@/modules/categories/category-removal-guard.interface';
import { CategoryRemovalGuardRegistry } from '@/modules/categories/category-removal-guard.registry';
import { Job } from '@/modules/jobs/entities/job.entity';
import { JobStatus } from '@/modules/jobs/enums/job-status.enum';

/**
 * Closes the loop opened in the categories module (spec §4.1): a client
 * cannot unselect a category while they have a job open under it.
 * "Active" per spec = OPEN/IN_PROGRESS/SUBMITTED/DISPUTED.
 */
const BLOCKING_JOB_STATUSES = [
  JobStatus.OPEN,
  JobStatus.IN_PROGRESS,
  JobStatus.SUBMITTED,
  JobStatus.DISPUTED,
];

@Injectable()
export class JobCategoryRemovalGuard implements CategoryRemovalGuard, OnModuleInit {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    private readonly registry: CategoryRemovalGuardRegistry,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async check(params: CategoryRemovalCheckParams): Promise<void> {
    if (params.role !== UserRole.CLIENT) {
      return;
    }

    const count = await this.jobRepository.count({
      where: {
        clientId: params.userId,
        categoryId: params.categoryId,
        status: In(BLOCKING_JOB_STATUSES),
      },
    });

    if (count > 0) {
      throw new ConflictException(
        'You have an active job under this category. Close or complete it before removing the category.',
      );
    }
  }
}
