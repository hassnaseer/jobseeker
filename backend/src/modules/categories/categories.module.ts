import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesController } from '@/modules/categories/categories.controller';
import { CategoriesService } from '@/modules/categories/categories.service';
import { CategoryRemovalGuardRegistry } from '@/modules/categories/category-removal-guard.registry';
import { Category } from '@/modules/categories/entities/category.entity';
import { UserCategory } from '@/modules/categories/entities/user-category.entity';

/**
 * Global: Jobs/Applications/Contracts modules (built later) need to inject
 * CategoryRemovalGuardRegistry to register their unselect-constraint rules
 * without CategoriesModule depending on them.
 */
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Category, UserCategory])],
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoryRemovalGuardRegistry],
  exports: [CategoriesService, CategoryRemovalGuardRegistry],
})
export class CategoriesModule {}
