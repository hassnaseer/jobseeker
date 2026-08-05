import { apiClient } from '@/api/client';
import type { Category } from '@/types/domain';

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

/** Flattens a category tree into a single list, prefixing child names with their parent for display. */
export function flattenCategoryTree(tree: Category[], prefix = ''): { id: string; label: string }[] {
  return tree.flatMap((node) => {
    const label = prefix ? `${prefix} / ${node.name}` : node.name;
    const children = node.children?.length ? flattenCategoryTree(node.children, label) : [];
    return [{ id: node.id, label }, ...children];
  });
}
