import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminTeamMember, AdminTeamMemberStatus } from '@/modules/admin-team/entities/admin-team-member.entity';
import { AdminPermission } from '@/modules/admin-team/enums/admin-permission.enum';
import { InviteTeamMemberDto } from '@/modules/admin-team/dto/invite-team-member.dto';
import { MailService } from '@/modules/mail/mail.service';
import { UserRole } from '@/common/enums/user-role.enum';
import { User } from '@/modules/users/entities/user.entity';
import { UsersService } from '@/modules/users/users.service';

@Injectable()
export class AdminTeamService {
  constructor(
    @InjectRepository(AdminTeamMember)
    private readonly teamRepository: Repository<AdminTeamMember>,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
  ) {}

  async invite(admin: User, dto: InviteTeamMemberDto): Promise<AdminTeamMember> {
    const existing = await this.teamRepository.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('This person is already on the admin team');
    }

    const linkedUser = await this.usersService.findByEmail(dto.email);
    if (linkedUser && !linkedUser.roles.includes(UserRole.SUPER_ADMIN)) {
      linkedUser.roles = [...linkedUser.roles, UserRole.SUPER_ADMIN];
      await this.usersService.save(linkedUser);
    }

    const member = this.teamRepository.create({
      name: dto.name,
      email: dto.email,
      userId: linkedUser?.id ?? null,
      permissions: dto.permissions,
      status: linkedUser ? AdminTeamMemberStatus.ACTIVE : AdminTeamMemberStatus.PENDING,
      invitedBy: admin.id,
    });
    const saved = await this.teamRepository.save(member);

    await this.mailService.send(
      dto.email,
      "You've been added to the JobLinxs admin team",
      linkedUser
        ? `${admin.email} gave you admin access to: ${dto.permissions.join(', ')}. Log in to get started.`
        : `${admin.email} invited you to the JobLinxs admin team with access to: ${dto.permissions.join(', ')}. Create an account with this email address to activate your access.`,
    );

    return saved;
  }

  async list(): Promise<AdminTeamMember[]> {
    return this.teamRepository.find({ order: { createdAt: 'DESC' } });
  }

  async updatePermissions(id: string, permissions: AdminPermission[]): Promise<AdminTeamMember> {
    const member = await this.teamRepository.findOne({ where: { id } });
    if (!member) {
      throw new NotFoundException('Team member not found');
    }
    member.permissions = permissions;
    return this.teamRepository.save(member);
  }

  async remove(id: string): Promise<void> {
    const member = await this.teamRepository.findOne({ where: { id } });
    if (!member) {
      throw new NotFoundException('Team member not found');
    }
    if (member.userId) {
      const user = await this.usersService.findById(member.userId);
      if (user && user.roles.includes(UserRole.SUPER_ADMIN)) {
        user.roles = user.roles.filter((role) => role !== UserRole.SUPER_ADMIN);
        if (user.activeRole === UserRole.SUPER_ADMIN) {
          user.activeRole = user.roles[0] ?? UserRole.CLIENT;
        }
        await this.usersService.save(user);
      }
    }
    await this.teamRepository.remove(member);
  }

  /**
   * Root/unscoped admins (SUPER_ADMIN with no team row) always pass. A
   * scoped team member must have the requested permission explicitly.
   */
  async hasPermission(user: User, permission: AdminPermission): Promise<boolean> {
    if (!user.roles.includes(UserRole.SUPER_ADMIN)) {
      return false;
    }
    const member = await this.teamRepository.findOne({ where: { userId: user.id } });
    if (!member) {
      return true;
    }
    return member.permissions.includes(permission);
  }

  async assertPermission(user: User, permission: AdminPermission): Promise<void> {
    const allowed = await this.hasPermission(user, permission);
    if (!allowed) {
      throw new ForbiddenException(`Your admin access does not include ${permission}`);
    }
  }
}
