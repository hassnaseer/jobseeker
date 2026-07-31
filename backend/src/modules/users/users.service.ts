import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ProfileStatus } from '@/common/enums/profile-status.enum';
import { UserRole } from '@/common/enums/user-role.enum';
import { RoleProfileStatus } from '@/modules/users/entities/role-profile-status.entity';
import { User } from '@/modules/users/entities/user.entity';

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  roles: UserRole[];
  activeRole: UserRole;
  tosVersionAccepted: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(RoleProfileStatus)
    private readonly roleProfileStatusRepository: Repository<RoleProfileStatus>,
    private readonly dataSource: DataSource,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email: email.toLowerCase() } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByIdOrFail(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getRoleProfileStatuses(userId: string): Promise<RoleProfileStatus[]> {
    return this.roleProfileStatusRepository.find({ where: { userId } });
  }

  /**
   * Creates the user plus one RoleProfileStatus row per selected role
   * (INCOMPLETE until onboarding is submitted), atomically.
   */
  async createUser(input: CreateUserInput): Promise<User> {
    const existing = await this.findByEmail(input.email);
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    return this.dataSource.transaction(async (manager) => {
      const user = manager.create(User, {
        email: input.email.toLowerCase(),
        passwordHash: input.passwordHash,
        roles: input.roles,
        activeRole: input.activeRole,
        tosVersionAccepted: input.tosVersionAccepted,
      });
      const savedUser = await manager.save(user);

      const statuses = input.roles.map((role) =>
        manager.create(RoleProfileStatus, {
          userId: savedUser.id,
          role,
          profileStatus: ProfileStatus.INCOMPLETE,
        }),
      );
      await manager.save(statuses);

      return savedUser;
    });
  }

  async save(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }

  async markEmailVerified(user: User): Promise<User> {
    user.emailVerified = true;
    return this.usersRepository.save(user);
  }

  async updatePassword(user: User, passwordHash: string): Promise<User> {
    user.passwordHash = passwordHash;
    return this.usersRepository.save(user);
  }

  async recordLogin(user: User): Promise<User> {
    user.lastLoginAt = new Date();
    return this.usersRepository.save(user);
  }

  async updateBasicInfo(
    user: User,
    fields: Partial<
      Pick<
        User,
        | 'firstName'
        | 'lastName'
        | 'phone'
        | 'country'
        | 'city'
        | 'timezone'
        | 'language'
        | 'avatarUrl'
      >
    >,
  ): Promise<User> {
    Object.assign(user, fields);
    return this.usersRepository.save(user);
  }

  async findRoleProfileStatus(userId: string, role: UserRole): Promise<RoleProfileStatus | null> {
    return this.roleProfileStatusRepository.findOne({ where: { userId, role } });
  }

  async saveRoleProfileStatus(status: RoleProfileStatus): Promise<RoleProfileStatus> {
    return this.roleProfileStatusRepository.save(status);
  }

  async findPendingRoleProfileStatuses(role?: UserRole): Promise<RoleProfileStatus[]> {
    return this.roleProfileStatusRepository.find({
      where: role
        ? { profileStatus: ProfileStatus.PENDING, role }
        : { profileStatus: ProfileStatus.PENDING },
      order: { updatedAt: 'ASC' },
    });
  }

  /**
   * Switches the user's active role. If the target role isn't held yet,
   * adds it with an INCOMPLETE RoleProfileStatus so the client can route
   * the user into that role's onboarding wizard.
   */
  async switchActiveRole(user: User, role: UserRole): Promise<{ user: User; isNewRole: boolean }> {
    let isNewRole = false;

    if (!user.roles.includes(role)) {
      user.roles = [...user.roles, role];
      isNewRole = true;
      await this.roleProfileStatusRepository.save(
        this.roleProfileStatusRepository.create({
          userId: user.id,
          role,
          profileStatus: ProfileStatus.INCOMPLETE,
        }),
      );
    }

    user.activeRole = role;
    const savedUser = await this.usersRepository.save(user);
    return { user: savedUser, isNewRole };
  }

  // ---- SA user management (spec §16) ----

  async searchUsers(options: {
    q?: string;
    role?: UserRole;
    page?: number;
    limit?: number;
  }): Promise<{ items: User[]; total: number; page: number; limit: number }> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;

    const qb = this.usersRepository.createQueryBuilder('u').orderBy('u.createdAt', 'DESC');
    if (options.q) {
      qb.andWhere('(u.email ILIKE :q OR u.firstName ILIKE :q OR u.lastName ILIKE :q)', {
        q: `%${options.q}%`,
      });
    }
    if (options.role) {
      qb.andWhere(':role = ANY(u.roles)', { role: options.role });
    }

    const [items, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items, total, page, limit };
  }

  async suspend(userId: string): Promise<User> {
    const user = await this.findByIdOrFail(userId);
    user.isActive = false;
    return this.usersRepository.save(user);
  }

  async reactivate(userId: string): Promise<User> {
    const user = await this.findByIdOrFail(userId);
    user.isActive = true;
    user.isBanned = false;
    return this.usersRepository.save(user);
  }

  async ban(userId: string): Promise<User> {
    const user = await this.findByIdOrFail(userId);
    user.isBanned = true;
    user.isActive = false;
    return this.usersRepository.save(user);
  }

  async verifyEmailManually(userId: string): Promise<User> {
    const user = await this.findByIdOrFail(userId);
    user.emailVerified = true;
    return this.usersRepository.save(user);
  }
}
