import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CatalogsService } from '@/modules/catalogs/catalogs.service';
import { CreateCatalogDto } from '@/modules/catalogs/dto/create-catalog.dto';
import { CreateTierDto } from '@/modules/catalogs/dto/create-tier.dto';
import { UpdateCatalogDto } from '@/modules/catalogs/dto/update-catalog.dto';
import { UpdateTierDto } from '@/modules/catalogs/dto/update-tier.dto';
import { User } from '@/modules/users/entities/user.entity';

@ApiTags('catalogs')
@Controller('catalogs')
export class CatalogsController {
  constructor(private readonly catalogsService: CatalogsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateCatalogDto) {
    return this.catalogsService.create(user, dto);
  }

  @Get()
  list(@Query('categoryId') categoryId?: string) {
    return this.catalogsService.listPublic(categoryId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('mine')
  mine(@CurrentUser() user: User) {
    return this.catalogsService.listMine(user);
  }

  @Get(':id')
  detail(@Param('id', ParseUUIDPipe) id: string) {
    return this.catalogsService.getPublicDetail(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCatalogDto,
  ) {
    return this.catalogsService.update(user, id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/publish')
  publish(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.catalogsService.publish(user, id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/pause')
  pause(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.catalogsService.pause(user, id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/resume')
  resume(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.catalogsService.resume(user, id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/tiers')
  addTier(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateTierDto,
  ) {
    return this.catalogsService.addTier(user, id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id/tiers/:tierId')
  updateTier(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('tierId', ParseUUIDPipe) tierId: string,
    @Body() dto: UpdateTierDto,
  ) {
    return this.catalogsService.updateTier(user, id, tierId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id/tiers/:tierId')
  removeTier(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('tierId', ParseUUIDPipe) tierId: string,
  ) {
    return this.catalogsService.removeTier(user, id, tierId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('tiers/:tierId/order')
  order(@CurrentUser() user: User, @Param('tierId', ParseUUIDPipe) tierId: string) {
    return this.catalogsService.orderTier(user, tierId);
  }
}
