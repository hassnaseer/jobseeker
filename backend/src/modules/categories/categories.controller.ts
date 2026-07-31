import {
  BadRequestException,
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
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/user-role.enum';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { CategoriesService } from '@/modules/categories/categories.service';
import { AddUserCategoryDto } from '@/modules/categories/dto/add-user-category.dto';
import { CreateCategoryDto } from '@/modules/categories/dto/create-category.dto';
import { UpdateCategoryDto } from '@/modules/categories/dto/update-category.dto';
import { User } from '@/modules/users/entities/user.entity';

const SELECTABLE_ROLES = [UserRole.CLIENT, UserRole.SEEKER];

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  private parseSelectableRole(role?: string): UserRole.CLIENT | UserRole.SEEKER | undefined {
    if (role === undefined) {
      return undefined;
    }
    if (!SELECTABLE_ROLES.includes(role as UserRole)) {
      throw new BadRequestException(`role must be one of: ${SELECTABLE_ROLES.join(', ')}`);
    }
    return role as UserRole.CLIENT | UserRole.SEEKER;
  }

  // ---- Public browsing ----

  @Get('tree')
  tree() {
    return this.categoriesService.findTree(false);
  }

  @Get()
  list(@Query('parentId') parentId?: string) {
    return this.categoriesService.findAllFlat({ parentId });
  }

  // ---- SA management ----

  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin/all')
  adminList() {
    return this.categoriesService.findAllFlat({ includeInactive: true });
  }

  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  // ---- Authenticated user selections (must precede ':id' routes) ----

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('mine')
  mine(@CurrentUser() user: User, @Query('role') role?: string) {
    return this.categoriesService.getUserCategories(user.id, this.parseSelectableRole(role));
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('mine')
  addMine(@CurrentUser() user: User, @Body() dto: AddUserCategoryDto) {
    return this.categoriesService.addUserCategory(user, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('mine/:categoryId')
  removeMine(
    @CurrentUser() user: User,
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
    @Query('role') role?: string,
  ) {
    const parsedRole = this.parseSelectableRole(role);
    if (!parsedRole) {
      throw new BadRequestException(
        `role query param is required and must be one of: ${SELECTABLE_ROLES.join(', ')}`,
      );
    }
    return this.categoriesService.removeUserCategory(user, parsedRole, categoryId);
  }

  // ---- Single category (public read, SA write) ----

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.findByIdOrFail(id);
  }

  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.remove(id);
  }
}
