import { UserRole } from '@/common/enums/user-role.enum';

export interface CategoryRemovalCheckParams {
  userId: string;
  role: UserRole;
  categoryId: string;
}

/**
 * Contributed by domain modules (Jobs, Applications, Contracts) to block a
 * user from unselecting a category while it has active work under it, per
 * spec §4.1. Each guard should throw (e.g. ConflictException) with a
 * human-readable reason when removal must be blocked, and resolve
 * silently otherwise.
 */
export interface CategoryRemovalGuard {
  check(params: CategoryRemovalCheckParams): Promise<void>;
}
