import type { Dispatch } from 'redux';
import * as catalogsApi from '@/api/catalogs';
import type { CreateCatalogInput, UpdateCatalogInput, CreateTierInput, UpdateTierInput } from '@/api/catalogs';
import { extractErrorMessage } from '@/api/client';
import type { ProjectCatalog } from '@/types/domain';
import {
  CATALOGS_DETAIL_REQUEST,
  CATALOGS_DETAIL_SUCCESS,
  CATALOGS_FAILURE,
  CATALOGS_LIST_REQUEST,
  CATALOGS_LIST_SUCCESS,
  CATALOGS_MINE_REQUEST,
  CATALOGS_MINE_SUCCESS,
  CATALOGS_MUTATE_REQUEST,
  CATALOGS_MUTATE_SUCCESS,
  type CatalogsAction,
} from './types';

export type CatalogsThunk = (dispatch: Dispatch<CatalogsAction>) => Promise<void>;

export function fetchPublicCatalogs(categoryId?: string): CatalogsThunk {
  return async (dispatch) => {
    dispatch({ type: CATALOGS_LIST_REQUEST });
    try {
      const items = await catalogsApi.listPublicCatalogs(categoryId);
      dispatch({ type: CATALOGS_LIST_SUCCESS, payload: items });
    } catch (error) {
      dispatch({ type: CATALOGS_FAILURE, payload: extractErrorMessage(error) });
    }
  };
}

export function fetchMyCatalogs(): CatalogsThunk {
  return async (dispatch) => {
    dispatch({ type: CATALOGS_MINE_REQUEST });
    try {
      const items = await catalogsApi.listMyCatalogs();
      dispatch({ type: CATALOGS_MINE_SUCCESS, payload: items });
    } catch (error) {
      dispatch({ type: CATALOGS_FAILURE, payload: extractErrorMessage(error) });
    }
  };
}

export function fetchCatalogDetail(id: string): CatalogsThunk {
  return async (dispatch) => {
    dispatch({ type: CATALOGS_DETAIL_REQUEST });
    try {
      const item = await catalogsApi.getCatalogDetail(id);
      dispatch({ type: CATALOGS_DETAIL_SUCCESS, payload: item });
    } catch (error) {
      dispatch({ type: CATALOGS_FAILURE, payload: extractErrorMessage(error) });
    }
  };
}

function mutateThunk(run: () => Promise<ProjectCatalog>): CatalogsThunk {
  return async (dispatch) => {
    dispatch({ type: CATALOGS_MUTATE_REQUEST });
    try {
      const item = await run();
      dispatch({ type: CATALOGS_MUTATE_SUCCESS, payload: item });
    } catch (error) {
      dispatch({ type: CATALOGS_FAILURE, payload: extractErrorMessage(error) });
      throw error;
    }
  };
}

export const createCatalog = (dto: CreateCatalogInput) => mutateThunk(() => catalogsApi.createCatalog(dto));
export const updateCatalog = (id: string, dto: UpdateCatalogInput) =>
  mutateThunk(() => catalogsApi.updateCatalog(id, dto));
export const publishCatalog = (id: string) => mutateThunk(() => catalogsApi.publishCatalog(id));
export const pauseCatalog = (id: string) => mutateThunk(() => catalogsApi.pauseCatalog(id));
export const resumeCatalog = (id: string) => mutateThunk(() => catalogsApi.resumeCatalog(id));

function tierMutateThunk(catalogId: string, run: () => Promise<unknown>): CatalogsThunk {
  return async (dispatch) => {
    dispatch({ type: CATALOGS_MUTATE_REQUEST });
    try {
      await run();
      const item = await catalogsApi.getCatalogDetail(catalogId);
      dispatch({ type: CATALOGS_MUTATE_SUCCESS, payload: item });
    } catch (error) {
      dispatch({ type: CATALOGS_FAILURE, payload: extractErrorMessage(error) });
      throw error;
    }
  };
}

export const addTier = (catalogId: string, dto: CreateTierInput) =>
  tierMutateThunk(catalogId, () => catalogsApi.addTier(catalogId, dto));
export const updateTier = (catalogId: string, tierId: string, dto: UpdateTierInput) =>
  tierMutateThunk(catalogId, () => catalogsApi.updateTier(catalogId, tierId, dto));
export const removeTier = (catalogId: string, tierId: string) =>
  tierMutateThunk(catalogId, () => catalogsApi.removeTier(catalogId, tierId));
