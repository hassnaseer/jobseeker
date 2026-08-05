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
import { NotificationEventType } from '@/modules/notifications/enums/notification-event-type.enum';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import { QuerySeekersDto, SeekerSortBy } from '@/modules/profiles/dto/query-seekers.dto';
import { RejectProfileDto } from '@/modules/profiles/dto/reject-profile.dto';
import { SubmitKycDto } from '@/modules/profiles/dto/submit-kyc.dto';
import { UpdateBasicInfoDto } from '@/modules/profiles/dto/update-basic-info.dto';
import { UpdateClientProfileDto } from '@/modules/profiles/dto/update-client-profile.dto';
import { UpdateSeekerProfileDto } from '@/modules/profiles/dto/update-seeker-profile.dto';
import { ClientProfile } from '@/modules/profiles/entities/client-profile.entity';
import { Identity } from '@/modules/profiles/entities/identity.entity';
import { SeekerProfile } from '@/modules/profiles/entities/seeker-profile.entity';
import { RoleProfileStatus } from '@/modules/users/entities/role-profile-status.entity';
import { User } from '@/modules/users/entities/user.entity';
import { UsersService } from '@/modules/users/users.service';

type ReviewableRole = UserRole.CLIENT | UserRole.SEEKER;

export interface SeekerCard {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  title: string;
  skills: string[];
  hourlyRate: number | null;
  currency: string;
  avgRating: number;
  totalReviews: number;
  totalJobs: number;
}

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Identity)
    private readonly identityRepository: Repository<Identity>,
    @InjectRepository(ClientProfile)
    private readonly clientProfileRepository: Repository<ClientProfile>,
    @InjectRepository(SeekerProfile)
    private readonly seekerProfileRepository: Repository<SeekerProfile>,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private assertHoldsRole(user: User, role: ReviewableRole): void {
    if (!user.roles.includes(role)) {
      throw new ForbiddenException(`You do not hold the ${role} role`);
    }
  }

  // ---- Step 1: basic info (lives on User) ----

  async updateBasicInfo(user: User, dto: UpdateBasicInfoDto): Promise<User> {
    return this.usersService.updateBasicInfo(user, dto);
  }

  // ---- Step 2: KYC (one row per user) ----

  async getIdentity(userId: string): Promise<Identity | null> {
    return this.identityRepository.findOne({ where: { userId } });
  }

  async upsertKyc(user: User, dto: SubmitKycDto): Promise<Identity> {
    let identity = await this.getIdentity(user.id);
    if (identity?.kycStatus === ProfileStatus.APPROVED) {
      throw new ConflictException('Identity is already verified and cannot be edited');
    }

    if (!identity) {
      identity = this.identityRepository.create({ userId: user.id });
    }
    Object.assign(identity, dto);
    return this.identityRepository.save(identity);
  }

  // ---- Step 3: role details ----

  async getClientProfile(userId: string): Promise<ClientProfile | null> {
    return this.clientProfileRepository.findOne({ where: { userId } });
  }

  async upsertClientProfile(user: User, dto: UpdateClientProfileDto): Promise<ClientProfile> {
    this.assertHoldsRole(user, UserRole.CLIENT);
    let profile = await this.getClientProfile(user.id);
    if (!profile) {
      profile = this.clientProfileRepository.create({ userId: user.id });
    }
    Object.assign(profile, dto);
    return this.clientProfileRepository.save(profile);
  }

  async getSeekerProfile(userId: string): Promise<SeekerProfile | null> {
    return this.seekerProfileRepository.findOne({ where: { userId } });
  }

  async upsertSeekerProfile(user: User, dto: UpdateSeekerProfileDto): Promise<SeekerProfile> {
    this.assertHoldsRole(user, UserRole.SEEKER);
    let profile = await this.getSeekerProfile(user.id);
    if (!profile) {
      profile = this.seekerProfileRepository.create({ userId: user.id });
    }
    Object.assign(profile, dto);
    return this.seekerProfileRepository.save(profile);
  }

  // ---- Combined self view ----

  async getMyProfile(user: User, role: ReviewableRole) {
    this.assertHoldsRole(user, role);
    const [identity, roleStatus, roleProfile] = await Promise.all([
      this.getIdentity(user.id),
      this.usersService.findRoleProfileStatus(user.id, role),
      role === UserRole.CLIENT ? this.getClientProfile(user.id) : this.getSeekerProfile(user.id),
    ]);

    return {
      basic: {
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        country: user.country,
        city: user.city,
        timezone: user.timezone,
        language: user.language,
        avatarUrl: user.avatarUrl,
      },
      identity,
      roleProfile,
      roleStatus,
    };
  }

  // ---- Submission (spec §3 step 5) ----

  private missingBasicFields(user: User): string[] {
    const missing: string[] = [];
    if (!user.firstName) missing.push('firstName');
    if (!user.lastName) missing.push('lastName');
    if (!user.phone) missing.push('phone');
    if (!user.country) missing.push('country');
    return missing;
  }

  async submitForReview(user: User, role: ReviewableRole): Promise<RoleProfileStatus> {
    this.assertHoldsRole(user, role);

    const status = await this.usersService.findRoleProfileStatus(user.id, role);
    if (!status) {
      throw new NotFoundException('No profile record found for this role');
    }
    if (status.profileStatus === ProfileStatus.PENDING) {
      throw new ConflictException('This profile is already under review');
    }
    if (status.profileStatus === ProfileStatus.APPROVED) {
      throw new ConflictException('This profile is already approved');
    }

    const missing = this.missingBasicFields(user);
    const identity = await this.getIdentity(user.id);
    if (!identity) {
      missing.push('kyc');
    }

    const roleProfile =
      role === UserRole.CLIENT
        ? await this.getClientProfile(user.id)
        : await this.getSeekerProfile(user.id);
    if (!roleProfile) {
      missing.push(role === UserRole.CLIENT ? 'clientProfile' : 'seekerProfile');
    }

    if (missing.length > 0) {
      throw new BadRequestException(
        `Cannot submit for review — missing required steps: ${missing.join(', ')}`,
      );
    }

    status.profileStatus = ProfileStatus.PENDING;
    status.rejectionReason = null;
    await this.usersService.saveRoleProfileStatus(status);

    if (identity && identity.kycStatus !== ProfileStatus.APPROVED) {
      identity.kycStatus = ProfileStatus.PENDING;
      await this.identityRepository.save(identity);
    }

    return status;
  }

  // ---- SA review queue ----

  async listPending(role?: ReviewableRole): Promise<RoleProfileStatus[]> {
    return this.usersService.findPendingRoleProfileStatuses(role);
  }

  async getReviewDetail(userId: string, role: ReviewableRole) {
    const user = await this.usersService.findByIdOrFail(userId);
    return this.getMyProfile(user, role);
  }

  async approve(admin: User, userId: string, role: ReviewableRole): Promise<RoleProfileStatus> {
    const status = await this.usersService.findRoleProfileStatus(userId, role);
    if (!status || status.profileStatus !== ProfileStatus.PENDING) {
      throw new ConflictException('This profile is not currently pending review');
    }

    status.profileStatus = ProfileStatus.APPROVED;
    status.approvedBy = admin.id;
    status.approvedAt = new Date();
    status.rejectionReason = null;
    await this.usersService.saveRoleProfileStatus(status);

    const identity = await this.getIdentity(userId);
    if (identity && identity.kycStatus !== ProfileStatus.APPROVED) {
      identity.kycStatus = ProfileStatus.APPROVED;
      identity.verifiedBy = admin.id;
      identity.verifiedAt = new Date();
      await this.identityRepository.save(identity);
    }

    const user = await this.usersService.findByIdOrFail(userId);
    await this.notificationsService.notify(user, {
      type: NotificationEventType.PROFILE_APPROVED,
      title: 'Your JobLinxs profile was approved',
      message: `Good news — your ${role} profile has been approved. You now have full access.`,
    });

    return status;
  }

  async reject(
    admin: User,
    userId: string,
    role: ReviewableRole,
    dto: RejectProfileDto,
  ): Promise<RoleProfileStatus> {
    const status = await this.usersService.findRoleProfileStatus(userId, role);
    if (!status || status.profileStatus !== ProfileStatus.PENDING) {
      throw new ConflictException('This profile is not currently pending review');
    }

    status.profileStatus = ProfileStatus.REJECTED;
    status.rejectionReason = dto.reason;
    status.approvedBy = null;
    status.approvedAt = null;
    await this.usersService.saveRoleProfileStatus(status);

    if (dto.rejectKyc) {
      const identity = await this.getIdentity(userId);
      if (identity && identity.kycStatus !== ProfileStatus.APPROVED) {
        identity.kycStatus = ProfileStatus.REJECTED;
        identity.verifiedBy = admin.id;
        identity.verifiedAt = new Date();
        await this.identityRepository.save(identity);
      }
    }

    const user = await this.usersService.findByIdOrFail(userId);
    await this.notificationsService.notify(user, {
      type: NotificationEventType.PROFILE_REJECTED,
      title: 'Your JobLinxs profile needs changes',
      message: `Your ${role} profile submission was not approved. Reason: ${dto.reason}\nPlease update your profile and resubmit.`,
    });

    return status;
  }

  // ---- Public browse: recommended/trending freelancers for the client dashboard ----

  async browseSeekers(query: QuerySeekersDto): Promise<SeekerCard[]> {
    const limit = query.limit ?? 8;
    const qb = this.seekerProfileRepository
      .createQueryBuilder('s')
      .innerJoin('users', 'u', 'u.id = s.user_id')
      .innerJoin(
        'role_profile_statuses',
        'rps',
        "rps.user_id = s.user_id AND rps.role = 'SEEKER' AND rps.profile_status = 'APPROVED'",
      )
      .where('s.is_available = true')
      .andWhere('u.deleted_at IS NULL')
      .andWhere('u.is_active = true')
      .andWhere('u.is_banned = false')
      .select([
        's.user_id AS "userId"',
        'u.first_name AS "firstName"',
        'u.last_name AS "lastName"',
        'u.avatar_url AS "avatarUrl"',
        's.title AS title',
        's.skills AS skills',
        's.hourly_rate AS "hourlyRate"',
        's.currency AS currency',
        's.avg_rating AS "avgRating"',
        's.total_reviews AS "totalReviews"',
        's.total_jobs AS "totalJobs"',
      ]);

    if (query.categoryId) {
      qb.innerJoin(
        'user_categories',
        'uc',
        "uc.user_id = s.user_id AND uc.role = 'SEEKER' AND uc.category_id = :categoryId",
        { categoryId: query.categoryId },
      );
    }

    switch (query.sortBy) {
      case SeekerSortBy.RATE:
        qb.orderBy('s.hourly_rate', 'DESC', 'NULLS LAST');
        break;
      case SeekerSortBy.JOBS:
        qb.orderBy('s.total_jobs', 'DESC');
        break;
      default:
        qb.orderBy('s.avg_rating', 'DESC').addOrderBy('s.total_reviews', 'DESC');
    }

    qb.limit(limit);

    const rows = await qb.getRawMany<{
      userId: string;
      firstName: string | null;
      lastName: string | null;
      avatarUrl: string | null;
      title: string;
      skills: string[];
      hourlyRate: string | null;
      currency: string;
      avgRating: string;
      totalReviews: number;
      totalJobs: number;
    }>();

    return rows.map((row) => ({
      ...row,
      hourlyRate: row.hourlyRate !== null ? Number(row.hourlyRate) : null,
      avgRating: Number(row.avgRating),
      totalReviews: Number(row.totalReviews),
      totalJobs: Number(row.totalJobs),
    }));
  }
}
