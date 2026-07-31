import { Body, Controller, Delete, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { SaveItemDto } from '@/modules/saved-items/dto/save-item.dto';
import { SavedTargetType } from '@/modules/saved-items/enums/saved-target-type.enum';
import { SavedItemsService } from '@/modules/saved-items/saved-items.service';
import { User } from '@/modules/users/entities/user.entity';

@ApiTags('saved-items')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('saved-items')
export class SavedItemsController {
  constructor(private readonly savedItemsService: SavedItemsService) {}

  @Post()
  save(@CurrentUser() user: User, @Body() dto: SaveItemDto) {
    return this.savedItemsService.save(user, dto.targetType, dto.targetId);
  }

  @Get()
  list(@CurrentUser() user: User, @Query('targetType') targetType?: SavedTargetType) {
    return this.savedItemsService.list(user, targetType);
  }

  @Delete()
  unsave(@CurrentUser() user: User, @Body() dto: SaveItemDto) {
    return this.savedItemsService.unsave(user, dto.targetType, dto.targetId);
  }
}
