import type { Review } from '@/types/domain';

export interface ReviewsState {
  forContract: Review[];
  receivedBy: Review[];
  status: 'idle' | 'loading' | 'saving' | 'ready' | 'error';
  error: string | null;
}

export const REVIEWS_FOR_CONTRACT_REQUEST = 'reviews/FOR_CONTRACT_REQUEST';
export const REVIEWS_FOR_CONTRACT_SUCCESS = 'reviews/FOR_CONTRACT_SUCCESS';
export const REVIEWS_RECEIVED_REQUEST = 'reviews/RECEIVED_REQUEST';
export const REVIEWS_RECEIVED_SUCCESS = 'reviews/RECEIVED_SUCCESS';
export const REVIEWS_MUTATE_REQUEST = 'reviews/MUTATE_REQUEST';
export const REVIEWS_FAILURE = 'reviews/FAILURE';

interface ForContractRequestAction {
  type: typeof REVIEWS_FOR_CONTRACT_REQUEST;
}
interface ForContractSuccessAction {
  type: typeof REVIEWS_FOR_CONTRACT_SUCCESS;
  payload: Review[];
}
interface ReceivedRequestAction {
  type: typeof REVIEWS_RECEIVED_REQUEST;
}
interface ReceivedSuccessAction {
  type: typeof REVIEWS_RECEIVED_SUCCESS;
  payload: Review[];
}
interface MutateRequestAction {
  type: typeof REVIEWS_MUTATE_REQUEST;
}
interface FailureAction {
  type: typeof REVIEWS_FAILURE;
  payload: string;
}

export type ReviewsAction =
  | ForContractRequestAction
  | ForContractSuccessAction
  | ReceivedRequestAction
  | ReceivedSuccessAction
  | MutateRequestAction
  | FailureAction;
