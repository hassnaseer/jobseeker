import { Injectable } from '@nestjs/common';
import {
  CategoryRemovalCheckParams,
  CategoryRemovalGuard,
} from '@/modules/categories/category-removal-guard.interface';

/**
 * Modules that introduce category-scoped work (Jobs, Applications,
 * Contracts) call `register()` in their `onModuleInit()` to plug their
 * blocking rules in here, instead of CategoriesModule needing to know
 * about those modules directly. Until those modules exist, the registry
 * has no guards and every removal is allowed.
 */
@Injectable()
export class CategoryRemovalGuardRegistry {
  private readonly guards: CategoryRemovalGuard[] = [];

  register(guard: CategoryRemovalGuard): void {
    this.guards.push(guard);
  }

  async assertRemovable(params: CategoryRemovalCheckParams): Promise<void> {
    for (const guard of this.guards) {
      await guard.check(params);
    }
  }

  /** Same checks as assertRemovable, but reports the result instead of throwing — for UI hints (e.g. a lock icon). */
  async isRemovable(params: CategoryRemovalCheckParams): Promise<boolean> {
    try {
      await this.assertRemovable(params);
      return true;
    } catch {
      return false;
    }
  }
}
