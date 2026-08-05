import { create } from 'zustand';
import {
  activateHourlyContract,
  approveDeliverable as apiApproveDeliverable,
  completeHourlyContract,
  getContractDetail,
  listDeliverables,
  listMilestones,
  listMyContracts,
  requestRevision as apiRequestRevision,
  submitDeliverable as apiSubmitDeliverable,
  type SubmitDeliverableInput,
} from '@/api/contracts';
import { fundContract, fundMilestone, releaseLump, releaseMilestone } from '@/api/payments';
import { extractErrorMessage } from '@/api/client';
import type { Contract, Deliverable, Milestone } from '@/types/domain';

interface ContractsState {
  mine: Contract[];
  detail: Contract | null;
  milestones: Milestone[];
  deliverables: Deliverable[];
  status: 'idle' | 'loading' | 'saving' | 'ready' | 'error';
  error: string | null;

  fetchMine: () => Promise<void>;
  fetchDetail: (id: string) => Promise<void>;
  clearDetail: () => void;

  fundLump: (contractId: string) => Promise<void>;
  fundOneMilestone: (contractId: string, milestoneId: string) => Promise<void>;
  releaseOneMilestone: (contractId: string, milestoneId: string) => Promise<void>;
  releaseOneLump: (contractId: string) => Promise<void>;
  submitOneDeliverable: (contractId: string, dto: SubmitDeliverableInput) => Promise<void>;
  approveOneDeliverable: (contractId: string, deliverableId: string) => Promise<void>;
  requestOneRevision: (contractId: string, deliverableId: string, feedback: string) => Promise<void>;

  activateHourly: (contractId: string) => Promise<void>;
  completeHourly: (contractId: string) => Promise<void>;
}

export const useContractsStore = create<ContractsState>((set, get) => ({
  mine: [],
  detail: null,
  milestones: [],
  deliverables: [],
  status: 'idle',
  error: null,

  fetchMine: async () => {
    set({ status: 'loading', error: null });
    try {
      const mine = await listMyContracts();
      set({ mine, status: 'ready' });
    } catch (error) {
      set({ status: 'error', error: extractErrorMessage(error) });
      throw error;
    }
  },

  fetchDetail: async (id) => {
    set({ status: 'loading', error: null });
    try {
      const [detail, milestones, deliverables] = await Promise.all([
        getContractDetail(id),
        listMilestones(id).catch(() => []),
        listDeliverables(id).catch(() => []),
      ]);
      set({ detail, milestones, deliverables, status: 'ready' });
    } catch (error) {
      set({ status: 'error', error: extractErrorMessage(error) });
      throw error;
    }
  },

  clearDetail: () => set({ detail: null, milestones: [], deliverables: [] }),

  fundLump: async (contractId) => {
    await runWithRefresh(set, get, contractId, () => fundContract(contractId));
  },
  fundOneMilestone: async (contractId, milestoneId) => {
    await runWithRefresh(set, get, contractId, () => fundMilestone(contractId, milestoneId));
  },
  releaseOneMilestone: async (contractId, milestoneId) => {
    await runWithRefresh(set, get, contractId, () => releaseMilestone(contractId, milestoneId));
  },
  releaseOneLump: async (contractId) => {
    await runWithRefresh(set, get, contractId, () => releaseLump(contractId));
  },
  submitOneDeliverable: async (contractId, dto) => {
    await runWithRefresh(set, get, contractId, () => apiSubmitDeliverable(contractId, dto));
  },
  approveOneDeliverable: async (contractId, deliverableId) => {
    await runWithRefresh(set, get, contractId, () => apiApproveDeliverable(contractId, deliverableId));
  },
  requestOneRevision: async (contractId, deliverableId, feedback) => {
    await runWithRefresh(set, get, contractId, () => apiRequestRevision(contractId, deliverableId, feedback));
  },

  activateHourly: async (contractId) => {
    await runWithRefresh(set, get, contractId, () => activateHourlyContract(contractId));
  },
  completeHourly: async (contractId) => {
    await runWithRefresh(set, get, contractId, () => completeHourlyContract(contractId));
  },
}));

async function runWithRefresh(
  set: (partial: Partial<ContractsState>) => void,
  get: () => ContractsState,
  contractId: string,
  action: () => Promise<unknown>,
): Promise<void> {
  set({ status: 'saving', error: null });
  try {
    await action();
    const [detail, milestones, deliverables] = await Promise.all([
      getContractDetail(contractId),
      listMilestones(contractId).catch(() => []),
      listDeliverables(contractId).catch(() => []),
    ]);
    set({ detail, milestones, deliverables, status: 'ready' });
  } catch (error) {
    set({ status: 'error', error: extractErrorMessage(error) });
    throw error;
  }
}
