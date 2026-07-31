import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { IsNull, Repository } from 'typeorm';
import { UserRole } from '@/common/enums/user-role.enum';
import { ForgotPasswordDto } from '@/modules/auth/dto/forgot-password.dto';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { ResendVerificationDto } from '@/modules/auth/dto/resend-verification.dto';
import { ResetPasswordDto } from '@/modules/auth/dto/reset-password.dto';
import { SignupDto, SignupRole } from '@/modules/auth/dto/signup.dto';
import { SwitchRoleDto } from '@/modules/auth/dto/switch-role.dto';
import { UpdatePasswordDto } from '@/modules/auth/dto/update-password.dto';
import { VerifyEmailDto } from '@/modules/auth/dto/verify-email.dto';
import { EmailVerificationToken } from '@/modules/auth/entities/email-verification-token.entity';
import { PasswordResetToken } from '@/modules/auth/entities/password-reset-token.entity';
import { RefreshToken } from '@/modules/auth/entities/refresh-token.entity';
import { MailService } from '@/modules/mail/mail.service';
import { User } from '@/modules/users/entities/user.entity';
import { UsersService } from '@/modules/users/users.service';

const BCRYPT_ROUNDS = 12;

export interface RequestMeta {
  userAgent?: string;
  ipAddress?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(EmailVerificationToken)
    private readonly emailVerificationTokenRepository: Repository<EmailVerificationToken>,
    @InjectRepository(PasswordResetToken)
    private readonly passwordResetTokenRepository: Repository<PasswordResetToken>,
  ) {}

  private hashToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }

  private generateRawToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private rolesFromSignup(role: SignupRole): UserRole[] {
    if (role === SignupRole.BOTH) {
      return [UserRole.CLIENT, UserRole.SEEKER];
    }
    return [role as unknown as UserRole];
  }

  // ---- Signup & email verification ----

  async signup(dto: SignupDto): Promise<{ message: string; userId: string }> {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const roles = this.rolesFromSignup(dto.role);
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = await this.usersService.createUser({
      email: dto.email,
      passwordHash,
      roles,
      activeRole: roles[0],
      tosVersionAccepted: dto.tosVersion,
    });

    await this.issueEmailVerificationToken(user);

    return {
      message: 'Signup successful. Please check your email to verify your account.',
      userId: user.id,
    };
  }

  private async issueEmailVerificationToken(user: User): Promise<void> {
    const rawToken = this.generateRawToken();
    const ttlMin = this.configService.get<number>('tokens.emailVerificationTtlMin')!;
    const expiresAt = new Date(Date.now() + ttlMin * 60 * 1000);

    await this.emailVerificationTokenRepository.save(
      this.emailVerificationTokenRepository.create({
        userId: user.id,
        tokenHash: this.hashToken(rawToken),
        expiresAt,
      }),
    );

    await this.mailService.sendEmailVerification(user.email, rawToken);
  }

  async verifyEmail(dto: VerifyEmailDto): Promise<{ message: string }> {
    const tokenHash = this.hashToken(dto.token);
    const tokenRow = await this.emailVerificationTokenRepository.findOne({
      where: { tokenHash },
    });

    if (!tokenRow || tokenRow.usedAt || tokenRow.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    const user = await this.usersService.findByIdOrFail(tokenRow.userId);
    await this.usersService.markEmailVerified(user);

    tokenRow.usedAt = new Date();
    await this.emailVerificationTokenRepository.save(tokenRow);

    return { message: 'Email verified successfully.' };
  }

  async resendVerification(dto: ResendVerificationDto): Promise<{ message: string }> {
    const neutralMessage = {
      message: 'If this account exists and is unverified, a new verification email has been sent.',
    };
    const user = await this.usersService.findByEmail(dto.email);

    if (!user || user.emailVerified) {
      return neutralMessage;
    }

    await this.issueEmailVerificationToken(user);
    return neutralMessage;
  }

  // ---- Login / tokens ----

  /** SA support tool (spec §16 "impersonate") — issues a real session for the target user. */
  async impersonate(
    admin: User,
    targetUserId: string,
    meta: RequestMeta = {},
  ): Promise<TokenPair & { user: User }> {
    if (!admin.roles.includes(UserRole.SUPER_ADMIN)) {
      throw new ForbiddenException('Super admin only');
    }
    const target = await this.usersService.findByIdOrFail(targetUserId);
    const { accessToken, refreshToken } = await this.issueTokenPair(target, meta);
    return { accessToken, refreshToken, user: target };
  }

  async login(dto: LoginDto, meta: RequestMeta = {}): Promise<TokenPair & { user: User }> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.isBanned || !user.isActive) {
      throw new ForbiddenException('This account has been suspended. Contact support.');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.emailVerified) {
      throw new ForbiddenException({
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Please verify your email before logging in.',
      });
    }

    await this.usersService.recordLogin(user);
    const { accessToken, refreshToken } = await this.issueTokenPair(user, meta);

    return { accessToken, refreshToken, user };
  }

  private async issueTokenPair(
    user: User,
    meta: RequestMeta = {},
  ): Promise<TokenPair & { refreshTokenRow: RefreshToken }> {
    const accessToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email, roles: user.roles },
      {
        secret: this.configService.get<string>('jwt.accessSecret'),
        expiresIn: this.configService.get<string>('jwt.accessExpiresIn'),
      },
    );

    const refreshExpiresIn = this.configService.get<string>('jwt.refreshExpiresIn')!;
    // jti makes every refresh token unique even if issued within the same
    // second for the same user, which matters for single-use rotation:
    // without it, two refreshes in the same second would sign identical
    // JWTs and collide on tokenHash, breaking reuse detection.
    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id, jti: crypto.randomUUID() },
      {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: refreshExpiresIn,
      },
    );

    const decoded = this.jwtService.decode(refreshToken) as { exp: number };
    const refreshTokenRow = await this.refreshTokenRepository.save(
      this.refreshTokenRepository.create({
        userId: user.id,
        tokenHash: this.hashToken(refreshToken),
        expiresAt: new Date(decoded.exp * 1000),
        userAgent: meta.userAgent ?? null,
        ipAddress: meta.ipAddress ?? null,
      }),
    );

    return { accessToken, refreshToken, refreshTokenRow };
  }

  async refresh(rawRefreshToken: string, meta: RequestMeta = {}): Promise<TokenPair> {
    let payload: { sub: string };
    try {
      payload = await this.jwtService.verifyAsync(rawRefreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const tokenHash = this.hashToken(rawRefreshToken);
    const tokenRow = await this.refreshTokenRepository.findOne({
      where: { userId: payload.sub, tokenHash },
    });

    if (!tokenRow || tokenRow.revokedAt || tokenRow.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersService.findByIdOrFail(payload.sub);
    if (user.isBanned || !user.isActive) {
      throw new ForbiddenException('This account has been suspended. Contact support.');
    }

    // Rotate: revoke the used refresh token and issue a fresh pair.
    const { accessToken, refreshToken, refreshTokenRow } = await this.issueTokenPair(user, meta);
    tokenRow.revokedAt = new Date();
    tokenRow.replacedByTokenId = refreshTokenRow.id;
    await this.refreshTokenRepository.save(tokenRow);

    return { accessToken, refreshToken };
  }

  async logout(rawRefreshToken: string): Promise<{ message: string }> {
    const tokenHash = this.hashToken(rawRefreshToken);
    await this.refreshTokenRepository.update({ tokenHash }, { revokedAt: new Date() });
    return { message: 'Logged out.' };
  }

  private async revokeAllSessions(userId: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { userId, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }

  // ---- Forgot / reset password ----

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const neutralMessage = {
      message: 'If an account exists for this email, password reset instructions have been sent.',
    };

    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      return neutralMessage;
    }

    const rawToken = this.generateRawToken();
    const ttlMin = this.configService.get<number>('tokens.passwordResetTtlMin')!;
    const expiresAt = new Date(Date.now() + ttlMin * 60 * 1000);

    await this.passwordResetTokenRepository.save(
      this.passwordResetTokenRepository.create({
        userId: user.id,
        tokenHash: this.hashToken(rawToken),
        expiresAt,
      }),
    );

    await this.mailService.sendPasswordResetInstructions(user.email, rawToken);
    return neutralMessage;
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const tokenHash = this.hashToken(dto.token);
    const tokenRow = await this.passwordResetTokenRepository.findOne({ where: { tokenHash } });

    if (!tokenRow || tokenRow.usedAt || tokenRow.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const user = await this.usersService.findByIdOrFail(tokenRow.userId);
    const passwordHash = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);
    await this.usersService.updatePassword(user, passwordHash);

    tokenRow.usedAt = new Date();
    await this.passwordResetTokenRepository.save(tokenRow);

    // Single-use token + full session invalidation, per spec §2.3.
    await this.revokeAllSessions(user.id);

    await this.mailService.sendPasswordResetConfirmation(user.email);
    return { message: 'Password reset successfully. Please log in again.' };
  }

  // ---- Authenticated password update ----

  async updatePassword(user: User, dto: UpdatePasswordDto): Promise<{ message: string }> {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const currentMatches = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!currentMatches) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);
    await this.usersService.updatePassword(user, passwordHash);

    if (dto.revokeOtherSessions) {
      await this.revokeAllSessions(user.id);
    }

    await this.mailService.sendPasswordChangedAlert(user.email);
    return { message: 'Password updated successfully.' };
  }

  // ---- Dual-role switching ----

  async switchRole(user: User, dto: SwitchRoleDto): Promise<{ user: User; message: string }> {
    const { user: updatedUser, isNewRole } = await this.usersService.switchActiveRole(
      user,
      dto.role,
    );

    return {
      user: updatedUser,
      message: isNewRole
        ? 'Role added. Please complete onboarding to unlock full access for this role.'
        : 'Active role switched.',
    };
  }
}
