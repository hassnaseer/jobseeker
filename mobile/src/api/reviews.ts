import { apiClient } from '@/api/client';
import type { Review } from '@/types/domain';

export interface ReviewInput {
  rating: number;
  comment: string;
}

export async function createReview(contractId: string, dto: ReviewInput): Promise<Review> {
  const { data } = await apiClient.post<Review>(`/contracts/${contractId}/reviews`, dto);
  return data;
}

export async function listReviewsForContract(contractId: string): Promise<Review[]> {
  const { data } = await apiClient.get<Review[]>(`/contracts/${contractId}/reviews`);
  return data;
}

export async function editReview(id: string, dto: Partial<ReviewInput>): Promise<Review> {
  const { data } = await apiClient.patch<Review>(`/reviews/${id}`, dto);
  return data;
}
