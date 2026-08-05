import { apiClient } from '@/api/client';
import type { Category } from '@/types/domain';

export interface UserCategorySelection {
  id: string;
  userId: string;
  role: 'CLIENT' | 'SEEKER';
  categoryId: string;
  category: Category;
  locked: boolean;
}

export async function getMyCategories(role: 'CLIENT' | 'SEEKER'): Promise<UserCategorySelection[]> {
  const { data } = await apiClient.get<UserCategorySelection[]>('/categories/mine', { params: { role } });
  return data;
}

export async function addMyCategory(role: 'CLIENT' | 'SEEKER', categoryId: string): Promise<UserCategorySelection> {
  const { data } = await apiClient.post<UserCategorySelection>('/categories/mine', { role, categoryId });
  return data;
}

export async function removeMyCategory(role: 'CLIENT' | 'SEEKER', categoryId: string): Promise<void> {
  await apiClient.delete(`/categories/mine/${categoryId}`, { params: { role } });
}

export async function getCategoryTree(): Promise<Category[]> {
  const { data } = await apiClient.get<Category[]>('/categories/tree');
  return data;
}

export async function listCategories(parentId?: string): Promise<Category[]> {
  const { data } = await apiClient.get<Category[]>('/categories', {
    params: parentId ? { parentId } : undefined,
  });
  return data;
}

export interface CreateCategoryInput {
  name: string;
  slug?: string;
  parentId?: string;
  iconUrl?: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export type UpdateCategoryInput = Partial<CreateCategoryInput>;

export async function listAllCategoriesAdmin(): Promise<Category[]> {
  const { data } = await apiClient.get<Category[]>('/categories/admin/all');
  return data;
}

export async function createCategory(dto: CreateCategoryInput): Promise<Category> {
  const { data } = await apiClient.post<Category>('/categories', dto);
  return data;
}

export async function updateCategory(id: string, dto: UpdateCategoryInput): Promise<Category> {
  const { data } = await apiClient.patch<Category>(`/categories/${id}`, dto);
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  await apiClient.delete(`/categories/${id}`);
}

/** Flattens a category tree into a single list, prefixing child names with their parent for display. */
export function flattenCategoryTree(tree: Category[], prefix = ''): { id: string; label: string }[] {
  return tree.flatMap((node) => {
    const label = prefix ? `${prefix} / ${node.name}` : node.name;
    const children = node.children?.length ? flattenCategoryTree(node.children, label) : [];
    return [{ id: node.id, label }, ...children];
  });
}
