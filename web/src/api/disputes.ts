import { apiClient } from '@/api/client';
import type { Dispute } from '@/types/domain';

export interface RaiseDisputeInput {
  milestoneId?: string;
  reason: string;
  evidence?: string[];
}

export async function raiseDispute(contractId: string, dto: RaiseDisputeInput): Promise<Dispute> {
  const { data } = await apiClient.post<Dispute>(`/contracts/${contractId}/disputes`, dto);
  return data;
}

export async function listMyDisputes(): Promise<Dispute[]> {
  const { data } = await apiClient.get<Dispute[]>('/disputes/mine');
  return data;
}

export async function getDisputeDetail(id: string): Promise<Dispute> {
  const { data } = await apiClient.get<Dispute>(`/disputes/${id}`);
  return data;
}
