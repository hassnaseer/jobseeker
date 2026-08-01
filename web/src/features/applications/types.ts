import type { Application } from '@/types/domain';

export interface ApplicationsState {
  forJob: Application[];
  mine: Application[];
  detail: Application | null;
  status: 'idle' | 'loading' | 'saving' | 'ready' | 'error';
  error: string | null;
}

export const APPLICATIONS_FOR_JOB_REQUEST = 'applications/FOR_JOB_REQUEST';
export const APPLICATIONS_FOR_JOB_SUCCESS = 'applications/FOR_JOB_SUCCESS';
export const APPLICATIONS_MINE_REQUEST = 'applications/MINE_REQUEST';
export const APPLICATIONS_MINE_SUCCESS = 'applications/MINE_SUCCESS';
export const APPLICATIONS_DETAIL_REQUEST = 'applications/DETAIL_REQUEST';
export const APPLICATIONS_DETAIL_SUCCESS = 'applications/DETAIL_SUCCESS';
export const APPLICATIONS_MUTATE_REQUEST = 'applications/MUTATE_REQUEST';
export const APPLICATIONS_MUTATE_SUCCESS = 'applications/MUTATE_SUCCESS';
export const APPLICATIONS_FAILURE = 'applications/FAILURE';

interface ForJobRequestAction {
  type: typeof APPLICATIONS_FOR_JOB_REQUEST;
}
interface ForJobSuccessAction {
  type: typeof APPLICATIONS_FOR_JOB_SUCCESS;
  payload: Application[];
}
interface MineRequestAction {
  type: typeof APPLICATIONS_MINE_REQUEST;
}
interface MineSuccessAction {
  type: typeof APPLICATIONS_MINE_SUCCESS;
  payload: Application[];
}
interface DetailRequestAction {
  type: typeof APPLICATIONS_DETAIL_REQUEST;
}
interface DetailSuccessAction {
  type: typeof APPLICATIONS_DETAIL_SUCCESS;
  payload: Application;
}
interface MutateRequestAction {
  type: typeof APPLICATIONS_MUTATE_REQUEST;
}
interface MutateSuccessAction {
  type: typeof APPLICATIONS_MUTATE_SUCCESS;
  payload: Application;
}
interface FailureAction {
  type: typeof APPLICATIONS_FAILURE;
  payload: string;
}

export type ApplicationsAction =
  | ForJobRequestAction
  | ForJobSuccessAction
  | MineRequestAction
  | MineSuccessAction
  | DetailRequestAction
  | DetailSuccessAction
  | MutateRequestAction
  | MutateSuccessAction
  | FailureAction;
