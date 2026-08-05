import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RequireAdminPermission } from '@/modules/admin-team/decorators/require-admin-permission.decorator';
import { AdminPermission } from '@/modules/admin-team/enums/admin-permission.enum';
import { AdminPermissionGuard } from '@/modules/admin-team/guards/admin-permission.guard';
import { RaiseDisputeDto } from '@/modules/disputes/dto/raise-dispute.dto';
import { ResolveDisputeDto } from '@/modules/disputes/dto/resolve-dispute.dto';
import { DisputesService } from '@/modules/disputes/disputes.service';
import { DisputeStatus } from '@/modules/disputes/enums/dispute-status.enum';
import { User } from '@/modules/users/entities/user.entity';

@ApiTags('disputes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Post('contracts/:contractId/disputes')
  raise(
    @CurrentUser() user: User,
    @Param('contractId', ParseUUIDPipe) contractId: string,
    @Body() dto: RaiseDisputeDto,
  ) {
    return this.disputesService.raise(user, contractId, dto);
  }

  @Get('disputes/mine')
  mine(@CurrentUser() user: User) {
    return this.disputesService.listMine(user);
  }

  @Get('disputes/:id')
  detail(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.disputesService.getDetailForUser(user, id);
  }

  @RequireAdminPermission(AdminPermission.DISPUTES)
  @UseGuards(AdminPermissionGuard)
  @Get('admin/disputes')
  queue(@CurrentUser() admin: User, @Query('status') status?: DisputeStatus) {
    return this.disputesService.listQueue(admin, status);
  }

  @RequireAdminPermission(AdminPermission.DISPUTES)
  @UseGuards(AdminPermissionGuard)
  @Post('admin/disputes/:id/under-review')
  markUnderReview(@CurrentUser() admin: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.disputesService.markUnderReview(admin, id);
  }

  @RequireAdminPermission(AdminPermission.DISPUTES)
  @UseGuards(AdminPermissionGuard)
  @Post('admin/disputes/:id/resolve')
  resolve(
    @CurrentUser() admin: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ResolveDisputeDto,
  ) {
    return this.disputesService.resolve(admin, id, dto);
  }
}
