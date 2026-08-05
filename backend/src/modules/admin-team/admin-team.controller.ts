import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/user-role.enum';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { AdminTeamService } from '@/modules/admin-team/admin-team.service';
import { InviteTeamMemberDto } from '@/modules/admin-team/dto/invite-team-member.dto';
import { UpdateTeamMemberPermissionsDto } from '@/modules/admin-team/dto/update-team-member-permissions.dto';
import { User } from '@/modules/users/entities/user.entity';

/** Managing the admin team itself is always root-only — not delegable via a scope. */
@ApiTags('admin-team')
@ApiBearerAuth()
@Roles(UserRole.SUPER_ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/team')
export class AdminTeamController {
  constructor(private readonly adminTeamService: AdminTeamService) {}

  @Get()
  list() {
    return this.adminTeamService.list();
  }

  @Post('invite')
  invite(@CurrentUser() admin: User, @Body() dto: InviteTeamMemberDto) {
    return this.adminTeamService.invite(admin, dto);
  }

  @Patch(':id/permissions')
  updatePermissions(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTeamMemberPermissionsDto) {
    return this.adminTeamService.updatePermissions(id, dto.permissions);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminTeamService.remove(id);
  }
}
