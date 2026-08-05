import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/user-role.enum';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { RequireAdminPermission } from '@/modules/admin-team/decorators/require-admin-permission.decorator';
import { AdminPermission } from '@/modules/admin-team/enums/admin-permission.enum';
import { AdminPermissionGuard } from '@/modules/admin-team/guards/admin-permission.guard';
import { RejectProfileDto } from '@/modules/profiles/dto/reject-profile.dto';
import { SubmitForReviewDto } from '@/modules/profiles/dto/submit-for-review.dto';
import { SubmitKycDto } from '@/modules/profiles/dto/submit-kyc.dto';
import { UpdateBasicInfoDto } from '@/modules/profiles/dto/update-basic-info.dto';
import { UpdateClientProfileDto } from '@/modules/profiles/dto/update-client-profile.dto';
import { UpdateSeekerProfileDto } from '@/modules/profiles/dto/update-seeker-profile.dto';
import { ProfilesService } from '@/modules/profiles/profiles.service';
import { User } from '@/modules/users/entities/user.entity';

const REVIEWABLE_ROLES = [UserRole.CLIENT, UserRole.SEEKER];

@ApiTags('profiles')
@ApiBearerAuth()
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  private parseReviewableRole(role?: string): UserRole.CLIENT | UserRole.SEEKER {
    if (!role || !REVIEWABLE_ROLES.includes(role as UserRole)) {
      throw new BadRequestException(
        `role query param is required and must be one of: ${REVIEWABLE_ROLES.join(', ')}`,
      );
    }
    return role as UserRole.CLIENT | UserRole.SEEKER;
  }

  // ---- Self-service onboarding ----

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: User, @Query('role') role?: string) {
    return this.profilesService.getMyProfile(user, this.parseReviewableRole(role));
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/basic')
  updateBasic(@CurrentUser() user: User, @Body() dto: UpdateBasicInfoDto) {
    return this.profilesService.updateBasicInfo(user, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me/kyc')
  updateKyc(@CurrentUser() user: User, @Body() dto: SubmitKycDto) {
    return this.profilesService.upsertKyc(user, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me/client')
  updateClient(@CurrentUser() user: User, @Body() dto: UpdateClientProfileDto) {
    return this.profilesService.upsertClientProfile(user, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me/seeker')
  updateSeeker(@CurrentUser() user: User, @Body() dto: UpdateSeekerProfileDto) {
    return this.profilesService.upsertSeekerProfile(user, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/submit')
  submit(@CurrentUser() user: User, @Body() dto: SubmitForReviewDto) {
    return this.profilesService.submitForReview(user, dto.role);
  }

  // ---- SA review queue ----

  @Roles(UserRole.SUPER_ADMIN)
  @RequireAdminPermission(AdminPermission.KYC)
  @UseGuards(JwtAuthGuard, RolesGuard, AdminPermissionGuard)
  @Get('admin/pending')
  listPending(@Query('role') role?: string) {
    return this.profilesService.listPending(role ? this.parseReviewableRole(role) : undefined);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @RequireAdminPermission(AdminPermission.KYC)
  @UseGuards(JwtAuthGuard, RolesGuard, AdminPermissionGuard)
  @Get('admin/:userId/:role')
  reviewDetail(@Param('userId', ParseUUIDPipe) userId: string, @Param('role') role: string) {
    return this.profilesService.getReviewDetail(userId, this.parseReviewableRole(role));
  }

  @Roles(UserRole.SUPER_ADMIN)
  @RequireAdminPermission(AdminPermission.KYC)
  @UseGuards(JwtAuthGuard, RolesGuard, AdminPermissionGuard)
  @Post('admin/:userId/:role/approve')
  approve(
    @CurrentUser() admin: User,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('role') role: string,
  ) {
    return this.profilesService.approve(admin, userId, this.parseReviewableRole(role));
  }

  @Roles(UserRole.SUPER_ADMIN)
  @RequireAdminPermission(AdminPermission.KYC)
  @UseGuards(JwtAuthGuard, RolesGuard, AdminPermissionGuard)
  @Post('admin/:userId/:role/reject')
  reject(
    @CurrentUser() admin: User,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('role') role: string,
    @Body() dto: RejectProfileDto,
  ) {
    return this.profilesService.reject(admin, userId, this.parseReviewableRole(role), dto);
  }
}
