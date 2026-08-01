import { apiClient } from '@/api/client';
import type { Contract, Deliverable, Milestone } from '@/types/domain';

export interface MilestoneInput {
  title: string;
  description?: string;
  amount: number;
}

export interface CreateContractInput {
  milestones?: MilestoneInput[];
  weeklyHourLimit?: number;
}

export interface SubmitDeliverableInput {
  milestoneId?: string;
  description: string;
  attachments?: string[];
}

export async function hire(applicationId: string, dto: CreateContractInput): Promise<Contract> {
  const { data } = await apiClient.post<Contract>(`/applications/${applicationId}/hire`, dto);
  return data;
}

export async function listMyContracts(): Promise<Contract[]> {
  const { data } = await apiClient.get<Contract[]>('/contracts/mine');
  return data;
}

export async function getContractDetail(id: string): Promise<Contract> {
  const { data } = await apiClient.get<Contract>(`/contracts/${id}`);
  return data;
}

export async function listMilestones(contractId: string): Promise<Milestone[]> {
  const { data } = await apiClient.get<Milestone[]>(`/contracts/${contractId}/milestones`);
  return data;
}

export async function listDeliverables(contractId: string): Promise<Deliverable[]> {
  const { data } = await apiClient.get<Deliverable[]>(`/contracts/${contractId}/deliverables`);
  return data;
}

export async function activateHourlyContract(id: string): Promise<Contract> {
  const { data } = await apiClient.post<Contract>(`/contracts/${id}/activate`);
  return data;
}

export async function submitDeliverable(id: string, dto: SubmitDeliverableInput): Promise<Deliverable> {
  const { data } = await apiClient.post<Deliverable>(`/contracts/${id}/deliverables`, dto);
  return data;
}

export async function approveDeliverable(id: string, deliverableId: string): Promise<Deliverable> {
  const { data } = await apiClient.post<Deliverable>(`/contracts/${id}/deliverables/${deliverableId}/approve`);
  return data;
}

export async function requestRevision(
  id: string,
  deliverableId: string,
  feedback: string,
): Promise<Deliverable> {
  const { data } = await apiClient.post<Deliverable>(`/contracts/${id}/deliverables/${deliverableId}/revision`, {
    feedback,
  });
  return data;
}

export async function completeHourlyContract(id: string): Promise<Contract> {
  const { data } = await apiClient.post<Contract>(`/contracts/${id}/complete-hourly`);
  return data;
}
