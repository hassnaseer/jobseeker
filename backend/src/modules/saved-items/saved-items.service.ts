import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '@/common/enums/user-role.enum';
import { Job } from '@/modules/jobs/entities/job.entity';
import { SavedItem } from '@/modules/saved-items/entities/saved-item.entity';
import { SavedTargetType } from '@/modules/saved-items/enums/saved-target-type.enum';
import { User } from '@/modules/users/entities/user.entity';
import { UsersService } from '@/modules/users/users.service';

@Injectable()
export class SavedItemsService {
  constructor(
    @InjectRepository(SavedItem)
    private readonly savedItemRepository: Repository<SavedItem>,
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    private readonly usersService: UsersService,
  ) {}

  private async assertValidTarget(targetType: SavedTargetType, targetId: string): Promise<void> {
    if (targetType === SavedTargetType.JOB) {
      const job = await this.jobRepository.findOne({ where: { id: targetId } });
      if (!job) {
        throw new NotFoundException('Job not found');
      }
    } else {
      const seeker = await this.usersService.findById(targetId);
      if (!seeker || !seeker.roles.includes(UserRole.SEEKER)) {
        throw new NotFoundException('Seeker not found');
      }
    }
  }

  private assertRoleMatchesTarget(user: User, targetType: SavedTargetType): void {
    if (targetType === SavedTargetType.JOB && !user.roles.includes(UserRole.SEEKER)) {
      throw new ForbiddenException('Only seekers can save jobs');
    }
    if (targetType === SavedTargetType.SEEKER && !user.roles.includes(UserRole.CLIENT)) {
      throw new ForbiddenException('Only clients can save/shortlist seeker talent');
    }
  }

  async save(user: User, targetType: SavedTargetType, targetId: string): Promise<SavedItem> {
    this.assertRoleMatchesTarget(user, targetType);
    if (targetType === SavedTargetType.SEEKER && targetId === user.id) {
      throw new BadRequestException('You cannot save yourself');
    }
    await this.assertValidTarget(targetType, targetId);

    const existing = await this.savedItemRepository.findOne({
      where: { userId: user.id, targetType, targetId },
    });
    if (existing) {
      return existing;
    }

    return this.savedItemRepository.save(
      this.savedItemRepository.create({ userId: user.id, targetType, targetId }),
    );
  }

  async unsave(
    user: User,
    targetType: SavedTargetType,
    targetId: string,
  ): Promise<{ message: string }> {
    await this.savedItemRepository.delete({ userId: user.id, targetType, targetId });
    return { message: 'Removed.' };
  }

  async list(user: User, targetType?: SavedTargetType): Promise<SavedItem[]> {
    return this.savedItemRepository.find({
      where: targetType ? { userId: user.id, targetType } : { userId: user.id },
      order: { createdAt: 'DESC' },
    });
  }
}
