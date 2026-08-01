import type { Job } from '@/types/domain';

export interface JobsState {
  list: Job[];
  mine: Job[];
  detail: Job | null;
  status: 'idle' | 'loading' | 'saving' | 'ready' | 'error';
  error: string | null;
}

export const JOBS_LIST_REQUEST = 'jobs/LIST_REQUEST';
export const JOBS_LIST_SUCCESS = 'jobs/LIST_SUCCESS';
export const JOBS_MINE_REQUEST = 'jobs/MINE_REQUEST';
export const JOBS_MINE_SUCCESS = 'jobs/MINE_SUCCESS';
export const JOBS_DETAIL_REQUEST = 'jobs/DETAIL_REQUEST';
export const JOBS_DETAIL_SUCCESS = 'jobs/DETAIL_SUCCESS';
export const JOBS_MUTATE_REQUEST = 'jobs/MUTATE_REQUEST';
export const JOBS_MUTATE_SUCCESS = 'jobs/MUTATE_SUCCESS';
export const JOBS_FAILURE = 'jobs/FAILURE';

interface JobsListRequestAction {
  type: typeof JOBS_LIST_REQUEST;
}
interface JobsListSuccessAction {
  type: typeof JOBS_LIST_SUCCESS;
  payload: Job[];
}
interface JobsMineRequestAction {
  type: typeof JOBS_MINE_REQUEST;
}
interface JobsMineSuccessAction {
  type: typeof JOBS_MINE_SUCCESS;
  payload: Job[];
}
interface JobsDetailRequestAction {
  type: typeof JOBS_DETAIL_REQUEST;
}
interface JobsDetailSuccessAction {
  type: typeof JOBS_DETAIL_SUCCESS;
  payload: Job;
}
interface JobsMutateRequestAction {
  type: typeof JOBS_MUTATE_REQUEST;
}
interface JobsMutateSuccessAction {
  type: typeof JOBS_MUTATE_SUCCESS;
  payload: Job;
}
interface JobsFailureAction {
  type: typeof JOBS_FAILURE;
  payload: string;
}

export type JobsAction =
  | JobsListRequestAction
  | JobsListSuccessAction
  | JobsMineRequestAction
  | JobsMineSuccessAction
  | JobsDetailRequestAction
  | JobsDetailSuccessAction
  | JobsMutateRequestAction
  | JobsMutateSuccessAction
  | JobsFailureAction;
