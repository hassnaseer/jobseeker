import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RequireAdminPermission } from '@/modules/admin-team/decorators/require-admin-permission.decorator';
import { AdminPermission } from '@/modules/admin-team/enums/admin-permission.enum';
import { AdminPermissionGuard } from '@/modules/admin-team/guards/admin-permission.guard';
import { AddMessageDto } from '@/modules/support/dto/add-message.dto';
import { CreateTicketDto } from '@/modules/support/dto/create-ticket.dto';
import { SupportTicketStatus } from '@/modules/support/enums/support-ticket-status.enum';
import { SupportService } from '@/modules/support/support.service';
import { User } from '@/modules/users/entities/user.entity';

@ApiTags('support')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('support/tickets')
  create(@CurrentUser() user: User, @Body() dto: CreateTicketDto) {
    return this.supportService.createTicket(user, dto);
  }

  @Get('support/tickets/mine')
  mine(@CurrentUser() user: User) {
    return this.supportService.listMine(user);
  }

  @Get('support/tickets/:id')
  detail(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.supportService.getDetailForUser(user, id);
  }

  @Post('support/tickets/:id/messages')
  addMessage(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddMessageDto,
  ) {
    return this.supportService.addMessageAsRequester(user, id, dto);
  }

  @RequireAdminPermission(AdminPermission.SUPPORT)
  @UseGuards(AdminPermissionGuard)
  @Get('admin/support/tickets')
  adminList(@Query('status') status?: SupportTicketStatus) {
    return this.supportService.listAllForAdmin(status);
  }

  @RequireAdminPermission(AdminPermission.SUPPORT)
  @UseGuards(AdminPermissionGuard)
  @Get('admin/support/tickets/:id')
  adminDetail(@Param('id', ParseUUIDPipe) id: string) {
    return this.supportService.getDetailForAdmin(id);
  }

  @RequireAdminPermission(AdminPermission.SUPPORT)
  @UseGuards(AdminPermissionGuard)
  @Post('admin/support/tickets/:id/reply')
  adminReply(
    @CurrentUser() admin: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddMessageDto,
  ) {
    return this.supportService.replyAsAdmin(admin, id, dto);
  }

  @RequireAdminPermission(AdminPermission.SUPPORT)
  @UseGuards(AdminPermissionGuard)
  @Post('admin/support/tickets/:id/resolve')
  adminResolve(@Param('id', ParseUUIDPipe) id: string) {
    return this.supportService.setStatus(id, SupportTicketStatus.RESOLVED);
  }

  @RequireAdminPermission(AdminPermission.SUPPORT)
  @UseGuards(AdminPermissionGuard)
  @Post('admin/support/tickets/:id/reopen')
  adminReopen(@Param('id', ParseUUIDPipe) id: string) {
    return this.supportService.setStatus(id, SupportTicketStatus.OPEN);
  }
}
