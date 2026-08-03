import type { Dispute } from '@/types/domain';

export interface DisputesState {
  mine: Dispute[];
  detail: Dispute | null;
  status: 'idle' | 'loading' | 'saving' | 'ready' | 'error';
  error: string | null;
}

export const DISPUTES_MINE_REQUEST = 'disputes/MINE_REQUEST';
export const DISPUTES_MINE_SUCCESS = 'disputes/MINE_SUCCESS';
export const DISPUTES_DETAIL_REQUEST = 'disputes/DETAIL_REQUEST';
export const DISPUTES_DETAIL_SUCCESS = 'disputes/DETAIL_SUCCESS';
export const DISPUTES_MUTATE_REQUEST = 'disputes/MUTATE_REQUEST';
export const DISPUTES_FAILURE = 'disputes/FAILURE';

interface MineRequestAction {
  type: typeof DISPUTES_MINE_REQUEST;
}
interface MineSuccessAction {
  type: typeof DISPUTES_MINE_SUCCESS;
  payload: Dispute[];
}
interface DetailRequestAction {
  type: typeof DISPUTES_DETAIL_REQUEST;
}
interface DetailSuccessAction {
  type: typeof DISPUTES_DETAIL_SUCCESS;
  payload: Dispute;
}
interface MutateRequestAction {
  type: typeof DISPUTES_MUTATE_REQUEST;
}
interface FailureAction {
  type: typeof DISPUTES_FAILURE;
  payload: string;
}

export type DisputesAction =
  | MineRequestAction
  | MineSuccessAction
  | DetailRequestAction
  | DetailSuccessAction
  | MutateRequestAction
  | FailureAction;
