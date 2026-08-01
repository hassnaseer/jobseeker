import type { Contract, Deliverable, Milestone } from '@/types/domain';

export interface ContractsState {
  mine: Contract[];
  detail: Contract | null;
  milestones: Milestone[];
  deliverables: Deliverable[];
  status: 'idle' | 'loading' | 'saving' | 'ready' | 'error';
  error: string | null;
}

export const CONTRACTS_MINE_REQUEST = 'contracts/MINE_REQUEST';
export const CONTRACTS_MINE_SUCCESS = 'contracts/MINE_SUCCESS';
export const CONTRACTS_DETAIL_REQUEST = 'contracts/DETAIL_REQUEST';
export const CONTRACTS_DETAIL_SUCCESS = 'contracts/DETAIL_SUCCESS';
export const CONTRACTS_MUTATE_REQUEST = 'contracts/MUTATE_REQUEST';
export const CONTRACTS_MUTATE_SUCCESS = 'contracts/MUTATE_SUCCESS';
export const CONTRACTS_FAILURE = 'contracts/FAILURE';

interface MineRequestAction {
  type: typeof CONTRACTS_MINE_REQUEST;
}
interface MineSuccessAction {
  type: typeof CONTRACTS_MINE_SUCCESS;
  payload: Contract[];
}
interface DetailRequestAction {
  type: typeof CONTRACTS_DETAIL_REQUEST;
}
interface DetailSuccessAction {
  type: typeof CONTRACTS_DETAIL_SUCCESS;
  payload: { contract: Contract; milestones: Milestone[]; deliverables: Deliverable[] };
}
interface MutateRequestAction {
  type: typeof CONTRACTS_MUTATE_REQUEST;
}
interface MutateSuccessAction {
  type: typeof CONTRACTS_MUTATE_SUCCESS;
}
interface FailureAction {
  type: typeof CONTRACTS_FAILURE;
  payload: string;
}

export type ContractsAction =
  | MineRequestAction
  | MineSuccessAction
  | DetailRequestAction
  | DetailSuccessAction
  | MutateRequestAction
  | MutateSuccessAction
  | FailureAction;
