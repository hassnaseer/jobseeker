import {
  Controller,
  Get,
  Ip,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/user-role.enum';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { AuditLogService } from '@/modules/admin/audit-log.service';
import { ListUsersDto } from '@/modules/admin/dto/list-users.dto';
import { AuthService } from '@/modules/auth/auth.service';
import { User } from '@/modules/users/entities/user.entity';
import { UsersService } from '@/modules/users/users.service';

@ApiTags('admin-users')
@ApiBearerAuth()
@Roles(UserRole.SUPER_ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/users')
export class AdminUsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Get()
  list(@Query() query: ListUsersDto) {
    return this.usersService.searchUsers(query);
  }

  @Get(':id')
  detail(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findByIdOrFail(id);
  }

  @Post(':id/suspend')
  async suspend(
    @CurrentUser() admin: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Ip() ip: string,
  ) {
    const user = await this.usersService.suspend(id);
    await this.auditLogService.record({
      actorId: admin.id,
      action: 'USER_SUSPEND',
      entityType: 'User',
      entityId: id,
      ip,
    });
    return user;
  }

  @Post(':id/reactivate')
  async reactivate(
    @CurrentUser() admin: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Ip() ip: string,
  ) {
    const user = await this.usersService.reactivate(id);
    await this.auditLogService.record({
      actorId: admin.id,
      action: 'USER_REACTIVATE',
      entityType: 'User',
      entityId: id,
      ip,
    });
    return user;
  }

  @Post(':id/ban')
  async ban(@CurrentUser() admin: User, @Param('id', ParseUUIDPipe) id: string, @Ip() ip: string) {
    const user = await this.usersService.ban(id);
    await this.auditLogService.record({
      actorId: admin.id,
      action: 'USER_BAN',
      entityType: 'User',
      entityId: id,
      ip,
    });
    return user;
  }

  @Post(':id/verify-email')
  async verifyEmail(
    @CurrentUser() admin: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Ip() ip: string,
  ) {
    const user = await this.usersService.verifyEmailManually(id);
    await this.auditLogService.record({
      actorId: admin.id,
      action: 'USER_VERIFY_EMAIL',
      entityType: 'User',
      entityId: id,
      ip,
    });
    return user;
  }

  @Post(':id/impersonate')
  async impersonate(
    @CurrentUser() admin: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
    @Ip() ip: string,
  ) {
    const result = await this.authService.impersonate(admin, id, {
      userAgent: req.headers['user-agent'],
      ipAddress: ip,
    });
    await this.auditLogService.record({
      actorId: admin.id,
      action: 'USER_IMPERSONATE',
      entityType: 'User',
      entityId: id,
      ip,
    });
    return result;
  }
}
