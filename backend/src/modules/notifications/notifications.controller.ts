import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RegisterDeviceTokenDto } from '@/modules/notifications/dto/register-device-token.dto';
import { UpdatePreferenceDto } from '@/modules/notifications/dto/update-preference.dto';
import { NotificationEventType } from '@/modules/notifications/enums/notification-event-type.enum';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import { User } from '@/modules/users/entities/user.entity';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  list(
    @CurrentUser() user: User,
    @Query('unreadOnly') unreadOnly?: string,
    @Query('before') before?: string,
  ) {
    return this.notificationsService.listMine(user, { unreadOnly: unreadOnly === 'true', before });
  }

  @Get('unread-count')
  unreadCount(@CurrentUser() user: User) {
    return this.notificationsService.unreadCount(user);
  }

  @Post(':id/read')
  markRead(@CurrentUser() user: User, @Param('id') id: string) {
    return this.notificationsService.markRead(user, id);
  }

  @Post('mark-all-read')
  markAllRead(@CurrentUser() user: User) {
    return this.notificationsService.markAllRead(user);
  }

  @Get('preferences')
  listPreferences(@CurrentUser() user: User) {
    return this.notificationsService.listPreferences(user);
  }

  @Patch('preferences/:eventType')
  updatePreference(
    @CurrentUser() user: User,
    @Param('eventType', new ParseEnumPipe(NotificationEventType)) eventType: NotificationEventType,
    @Body() dto: UpdatePreferenceDto,
  ) {
    return this.notificationsService.updatePreference(user, eventType, dto);
  }

  @Post('device-tokens')
  registerDeviceToken(@CurrentUser() user: User, @Body() dto: RegisterDeviceTokenDto) {
    return this.notificationsService.registerDeviceToken(user, dto.token, dto.platform);
  }

  @Delete('device-tokens/:token')
  unregisterDeviceToken(@CurrentUser() user: User, @Param('token') token: string) {
    return this.notificationsService.unregisterDeviceToken(user, token);
  }
}
