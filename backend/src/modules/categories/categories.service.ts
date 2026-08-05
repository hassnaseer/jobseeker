import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '@/common/enums/user-role.enum';
import { CategoryRemovalGuardRegistry } from '@/modules/categories/category-removal-guard.registry';
import { AddUserCategoryDto } from '@/modules/categories/dto/add-user-category.dto';
import { CreateCategoryDto } from '@/modules/categories/dto/create-category.dto';
import { UpdateCategoryDto } from '@/modules/categories/dto/update-category.dto';
import { Category } from '@/modules/categories/entities/category.entity';
import { UserCategory } from '@/modules/categories/entities/user-category.entity';
import { User } from '@/modules/users/entities/user.entity';

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(UserCategory)
    private readonly userCategoryRepository: Repository<UserCategory>,
    private readonly removalGuardRegistry: CategoryRemovalGuardRegistry,
  ) {}

  private slugify(input: string): string {
    return input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const qb = this.categoryRepository
      .createQueryBuilder('category')
      .where('category.slug = :slug', { slug });
    if (excludeId) {
      qb.andWhere('category.id != :excludeId', { excludeId });
    }
    return (await qb.getCount()) > 0;
  }

  private async generateUniqueSlug(base: string, excludeId?: string): Promise<string> {
    const root = this.slugify(base) || 'category';
    let slug = root;
    let counter = 1;
    while (await this.slugExists(slug, excludeId)) {
      counter += 1;
      slug = `${root}-${counter}`;
    }
    return slug;
  }

  private async assertNoCycle(categoryId: string, newParentId: string): Promise<void> {
    if (categoryId === newParentId) {
      throw new BadRequestException('A category cannot be its own parent');
    }
    let current = await this.categoryRepository.findOne({ where: { id: newParentId } });
    if (!current) {
      throw new NotFoundException('Parent category not found');
    }
    while (current?.parentId) {
      if (current.parentId === categoryId) {
        throw new BadRequestException('This would create a circular category hierarchy');
      }
      current = await this.categoryRepository.findOne({ where: { id: current.parentId } });
    }
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    if (dto.parentId) {
      const parent = await this.categoryRepository.findOne({ where: { id: dto.parentId } });
      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
    }

    const slug = dto.slug
      ? await this.generateUniqueSlug(dto.slug)
      : await this.generateUniqueSlug(dto.name);

    const category = this.categoryRepository.create({
      name: dto.name,
      slug,
      parentId: dto.parentId ?? null,
      iconUrl: dto.iconUrl ?? null,
      description: dto.description ?? null,
      isActive: dto.isActive ?? true,
      sortOrder: dto.sortOrder ?? 0,
    });
    return this.categoryRepository.save(category);
  }

  async findByIdOrFail(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async findAllFlat(
    options: { includeInactive?: boolean; parentId?: string | null } = {},
  ): Promise<Category[]> {
    const qb = this.categoryRepository
      .createQueryBuilder('category')
      .orderBy('category.sortOrder', 'ASC')
      .addOrderBy('category.name', 'ASC');

    if (!options.includeInactive) {
      qb.andWhere('category.isActive = true');
    }
    if (options.parentId !== undefined) {
      if (options.parentId === null) {
        qb.andWhere('category.parentId IS NULL');
      } else {
        qb.andWhere('category.parentId = :parentId', { parentId: options.parentId });
      }
    }

    return qb.getMany();
  }

  async findTree(includeInactive = false): Promise<CategoryTreeNode[]> {
    const all = await this.findAllFlat({ includeInactive });
    const byId = new Map<string, CategoryTreeNode>(
      all.map((category) => [category.id, { ...category, children: [] }]),
    );
    const roots: CategoryTreeNode[] = [];

    for (const node of byId.values()) {
      if (node.parentId && byId.has(node.parentId)) {
        byId.get(node.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findByIdOrFail(id);

    if (dto.parentId !== undefined && dto.parentId !== category.parentId) {
      if (dto.parentId !== null) {
        await this.assertNoCycle(id, dto.parentId);
      }
      category.parentId = dto.parentId;
    }

    if (dto.name !== undefined) {
      category.name = dto.name;
    }
    if (dto.slug !== undefined || dto.name !== undefined) {
      category.slug = await this.generateUniqueSlug(dto.slug ?? category.name, id);
    }
    if (dto.iconUrl !== undefined) {
      category.iconUrl = dto.iconUrl;
    }
    if (dto.description !== undefined) {
      category.description = dto.description;
    }
    if (dto.isActive !== undefined) {
      category.isActive = dto.isActive;
    }
    if (dto.sortOrder !== undefined) {
      category.sortOrder = dto.sortOrder;
    }

    return this.categoryRepository.save(category);
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findByIdOrFail(id);

    const [childCount, usageCount] = await Promise.all([
      this.categoryRepository.count({ where: { parentId: id } }),
      this.userCategoryRepository.count({ where: { categoryId: id } }),
    ]);

    if (childCount > 0) {
      throw new ConflictException(
        'This category has subcategories. Remove or reassign them first, or deactivate this category instead.',
      );
    }
    if (usageCount > 0) {
      throw new ConflictException(
        'This category is selected by one or more users. Deactivate it instead of deleting it.',
      );
    }

    await this.categoryRepository.delete(id);
    return { message: 'Category deleted.' };
  }

  // ---- User selections (spec §4) ----

  async getUserCategories(
    userId: string,
    role?: UserRole,
  ): Promise<(UserCategory & { locked: boolean })[]> {
    const selections = await this.userCategoryRepository.find({
      where: role ? { userId, role } : { userId },
      relations: { category: true },
    });

    return Promise.all(
      selections.map(async (selection) => ({
        ...selection,
        locked: !(await this.removalGuardRegistry.isRemovable({
          userId,
          role: selection.role,
          categoryId: selection.categoryId,
        })),
      })),
    );
  }

  /** Adding a category selection is always allowed per spec §4.1. */
  async addUserCategory(user: User, dto: AddUserCategoryDto): Promise<UserCategory> {
    if (!user.roles.includes(dto.role)) {
      throw new ForbiddenException(`You do not hold the ${dto.role} role`);
    }

    const category = await this.findByIdOrFail(dto.categoryId);
    if (!category.isActive) {
      throw new BadRequestException('This category is not currently active');
    }

    const existing = await this.userCategoryRepository.findOne({
      where: { userId: user.id, role: dto.role, categoryId: dto.categoryId },
    });
    if (existing) {
      return existing;
    }

    return this.userCategoryRepository.save(
      this.userCategoryRepository.create({
        userId: user.id,
        role: dto.role,
        categoryId: dto.categoryId,
      }),
    );
  }

  /** Removing is subject to the unselect constraint, per spec §4.1. */
  async removeUserCategory(
    user: User,
    role: UserRole,
    categoryId: string,
  ): Promise<{ message: string }> {
    const existing = await this.userCategoryRepository.findOne({
      where: { userId: user.id, role, categoryId },
    });
    if (!existing) {
      throw new NotFoundException('Category is not selected for this role');
    }

    await this.removalGuardRegistry.assertRemovable({ userId: user.id, role, categoryId });
    await this.userCategoryRepository.delete(existing.id);
    return { message: 'Category removed.' };
  }
}
