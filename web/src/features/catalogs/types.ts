import type { ProjectCatalog } from '@/types/domain';

export interface CatalogsState {
  list: ProjectCatalog[];
  mine: ProjectCatalog[];
  detail: ProjectCatalog | null;
  status: 'idle' | 'loading' | 'saving' | 'ready' | 'error';
  error: string | null;
}

export const CATALOGS_LIST_REQUEST = 'catalogs/LIST_REQUEST';
export const CATALOGS_LIST_SUCCESS = 'catalogs/LIST_SUCCESS';
export const CATALOGS_MINE_REQUEST = 'catalogs/MINE_REQUEST';
export const CATALOGS_MINE_SUCCESS = 'catalogs/MINE_SUCCESS';
export const CATALOGS_DETAIL_REQUEST = 'catalogs/DETAIL_REQUEST';
export const CATALOGS_DETAIL_SUCCESS = 'catalogs/DETAIL_SUCCESS';
export const CATALOGS_MUTATE_REQUEST = 'catalogs/MUTATE_REQUEST';
export const CATALOGS_MUTATE_SUCCESS = 'catalogs/MUTATE_SUCCESS';
export const CATALOGS_FAILURE = 'catalogs/FAILURE';

interface ListRequestAction {
  type: typeof CATALOGS_LIST_REQUEST;
}
interface ListSuccessAction {
  type: typeof CATALOGS_LIST_SUCCESS;
  payload: ProjectCatalog[];
}
interface MineRequestAction {
  type: typeof CATALOGS_MINE_REQUEST;
}
interface MineSuccessAction {
  type: typeof CATALOGS_MINE_SUCCESS;
  payload: ProjectCatalog[];
}
interface DetailRequestAction {
  type: typeof CATALOGS_DETAIL_REQUEST;
}
interface DetailSuccessAction {
  type: typeof CATALOGS_DETAIL_SUCCESS;
  payload: ProjectCatalog;
}
interface MutateRequestAction {
  type: typeof CATALOGS_MUTATE_REQUEST;
}
interface MutateSuccessAction {
  type: typeof CATALOGS_MUTATE_SUCCESS;
  payload: ProjectCatalog;
}
interface FailureAction {
  type: typeof CATALOGS_FAILURE;
  payload: string;
}

export type CatalogsAction =
  | ListRequestAction
  | ListSuccessAction
  | MineRequestAction
  | MineSuccessAction
  | DetailRequestAction
  | DetailSuccessAction
  | MutateRequestAction
  | MutateSuccessAction
  | FailureAction;
