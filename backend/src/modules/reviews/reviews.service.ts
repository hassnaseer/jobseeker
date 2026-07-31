import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from '@/modules/chat/entities/report.entity';
import { ReportTargetType } from '@/modules/chat/enums/report-target-type.enum';
import { ContractsService } from '@/modules/contracts/contracts.service';
import { ContractStatus } from '@/modules/contracts/enums/contract-status.enum';
import { NotificationEventType } from '@/modules/notifications/enums/notification-event-type.enum';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import { ClientProfile } from '@/modules/profiles/entities/client-profile.entity';
import { SeekerProfile } from '@/modules/profiles/entities/seeker-profile.entity';
import { CreateReviewDto } from '@/modules/reviews/dto/create-review.dto';
import { EditReviewDto } from '@/modules/reviews/dto/edit-review.dto';
import { ReportReviewDto } from '@/modules/reviews/dto/report-review.dto';
import { Review } from '@/modules/reviews/entities/review.entity';
import { User } from '@/modules/users/entities/user.entity';
import { UsersService } from '@/modules/users/users.service';

const EDIT_WINDOW_DAYS = 14;

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(ClientProfile)
    private readonly clientProfileRepository: Repository<ClientProfile>,
    @InjectRepository(SeekerProfile)
    private readonly seekerProfileRepository: Repository<SeekerProfile>,
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    private readonly contractsService: ContractsService,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private isWithinEditWindow(createdAt: Date): boolean {
    const deadline = new Date(createdAt);
    deadline.setDate(deadline.getDate() + EDIT_WINDOW_DAYS);
    return new Date() < deadline;
  }

  private async recomputeAggregate(revieweeId: string, isClient: boolean): Promise<void> {
    const reviews = await this.reviewRepository.find({ where: { revieweeId } });
    const totalReviews = reviews.length;
    const avgRating =
      totalReviews === 0
        ? 0
        : Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 100) / 100;

    if (isClient) {
      await this.clientProfileRepository.update(
        { userId: revieweeId },
        { avgRating, totalReviews },
      );
    } else {
      await this.seekerProfileRepository.update(
        { userId: revieweeId },
        { avgRating, totalReviews },
      );
    }
  }

  async create(reviewer: User, contractId: string, dto: CreateReviewDto): Promise<Review> {
    const contract = await this.contractsService.findByIdOrFail(contractId);
    if (contract.clientId !== reviewer.id && contract.seekerId !== reviewer.id) {
      throw new ForbiddenException('You are not a party to this contract');
    }
    if (contract.status !== ContractStatus.COMPLETED) {
      throw new BadRequestException('You can only review a completed contract');
    }

    const revieweeId = contract.clientId === reviewer.id ? contract.seekerId : contract.clientId;
    const isRevieweeClient = revieweeId === contract.clientId;

    const existing = await this.reviewRepository.findOne({
      where: { contractId, reviewerId: reviewer.id },
    });
    if (existing) {
      throw new ConflictException('You already reviewed this contract');
    }

    const review = await this.reviewRepository.save(
      this.reviewRepository.create({
        contractId,
        reviewerId: reviewer.id,
        revieweeId,
        rating: dto.rating,
        comment: dto.comment,
      }),
    );

    await this.recomputeAggregate(revieweeId, isRevieweeClient);

    const reviewee = await this.usersService.findById(revieweeId);
    if (reviewee) {
      await this.notificationsService.notify(reviewee, {
        type: NotificationEventType.REVIEW_RECEIVED,
        title: 'You received a new review',
        message: `${reviewer.firstName ?? 'A client/seeker'} left you a ${dto.rating}-star review.`,
        link: `/reviews/${review.id}`,
      });
    }

    return review;
  }

  async findByIdOrFail(id: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({ where: { id } });
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    return review;
  }

  async edit(reviewer: User, id: string, dto: EditReviewDto): Promise<Review> {
    const review = await this.findByIdOrFail(id);
    if (review.reviewerId !== reviewer.id) {
      throw new ForbiddenException('You can only edit your own review');
    }
    if (!this.isWithinEditWindow(review.createdAt)) {
      throw new ConflictException(
        `Reviews can only be edited within ${EDIT_WINDOW_DAYS} days of posting`,
      );
    }

    if (dto.rating !== undefined) review.rating = dto.rating;
    if (dto.comment !== undefined) review.comment = dto.comment;
    review.editedAt = new Date();
    const saved = await this.reviewRepository.save(review);

    const contract = await this.contractsService.findByIdOrFail(review.contractId);
    const isRevieweeClient = review.revieweeId === contract.clientId;
    await this.recomputeAggregate(review.revieweeId, isRevieweeClient);

    return saved;
  }

  async listForContract(contractId: string): Promise<Review[]> {
    return this.reviewRepository.find({ where: { contractId }, order: { createdAt: 'ASC' } });
  }

  async listReceivedBy(userId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { revieweeId: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async listGivenByMe(user: User): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { reviewerId: user.id },
      order: { createdAt: 'DESC' },
    });
  }

  async report(user: User, id: string, dto: ReportReviewDto): Promise<Report> {
    await this.findByIdOrFail(id);
    return this.reportRepository.save(
      this.reportRepository.create({
        reporterId: user.id,
        targetType: ReportTargetType.REVIEW,
        targetId: id,
        reason: dto.reason,
      }),
    );
  }
}
