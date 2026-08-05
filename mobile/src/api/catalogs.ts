import { apiClient } from '@/api/client';
import type { CatalogFaqItem, CatalogTier, ProjectCatalog } from '@/types/domain';

export interface CreateCatalogInput {
  title: string;
  categoryId: string;
  description: string;
  gallery?: string[];
  faq?: CatalogFaqItem[];
}

export type UpdateCatalogInput = Partial<CreateCatalogInput>;

export interface CreateTierInput {
  name: string;
  price: number;
  currency?: string;
  deliveryDays: number;
  revisions?: number;
  features?: string[];
}

export async function listPublicCatalogs(categoryId?: string): Promise<ProjectCatalog[]> {
  const { data } = await apiClient.get<ProjectCatalog[]>('/catalogs', {
    params: categoryId ? { categoryId } : undefined,
  });
  return data;
}

export async function listMyCatalogs(): Promise<ProjectCatalog[]> {
  const { data } = await apiClient.get<ProjectCatalog[]>('/catalogs/mine');
  return data;
}

export async function getCatalogDetail(id: string): Promise<ProjectCatalog> {
  const { data } = await apiClient.get<{ catalog: ProjectCatalog; tiers: CatalogTier[] }>(`/catalogs/${id}`);
  return { ...data.catalog, tiers: data.tiers };
}

export async function createCatalog(dto: CreateCatalogInput): Promise<ProjectCatalog> {
  const { data } = await apiClient.post<ProjectCatalog>('/catalogs', dto);
  return data;
}

export async function updateCatalog(id: string, dto: UpdateCatalogInput): Promise<ProjectCatalog> {
  const { data } = await apiClient.patch<ProjectCatalog>(`/catalogs/${id}`, dto);
  return data;
}

export async function publishCatalog(id: string): Promise<ProjectCatalog> {
  const { data } = await apiClient.post<ProjectCatalog>(`/catalogs/${id}/publish`);
  return data;
}

export async function pauseCatalog(id: string): Promise<ProjectCatalog> {
  const { data } = await apiClient.post<ProjectCatalog>(`/catalogs/${id}/pause`);
  return data;
}

export async function resumeCatalog(id: string): Promise<ProjectCatalog> {
  const { data } = await apiClient.post<ProjectCatalog>(`/catalogs/${id}/resume`);
  return data;
}

export async function addTier(catalogId: string, dto: CreateTierInput): Promise<CatalogTier> {
  const { data } = await apiClient.post<CatalogTier>(`/catalogs/${catalogId}/tiers`, dto);
  return data;
}

export async function removeTier(catalogId: string, tierId: string): Promise<void> {
  await apiClient.delete(`/catalogs/${catalogId}/tiers/${tierId}`);
}

export async function orderTier(tierId: string): Promise<unknown> {
  const { data } = await apiClient.post(`/catalogs/tiers/${tierId}/order`);
  return data;
}
