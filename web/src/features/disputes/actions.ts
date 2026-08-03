import type { Dispatch } from 'redux';
import * as disputesApi from '@/api/disputes';
import type { RaiseDisputeInput } from '@/api/disputes';
import { extractErrorMessage } from '@/api/client';
import {
  DISPUTES_DETAIL_REQUEST,
  DISPUTES_DETAIL_SUCCESS,
  DISPUTES_FAILURE,
  DISPUTES_MINE_REQUEST,
  DISPUTES_MINE_SUCCESS,
  DISPUTES_MUTATE_REQUEST,
  type DisputesAction,
} from './types';

export type DisputesThunk = (dispatch: Dispatch<DisputesAction>) => Promise<void>;

export function fetchMyDisputes(): DisputesThunk {
  return async (dispatch) => {
    dispatch({ type: DISPUTES_MINE_REQUEST });
    try {
      const items = await disputesApi.listMyDisputes();
      dispatch({ type: DISPUTES_MINE_SUCCESS, payload: items });
    } catch (error) {
      dispatch({ type: DISPUTES_FAILURE, payload: extractErrorMessage(error) });
    }
  };
}

export function fetchDisputeDetail(id: string): DisputesThunk {
  return async (dispatch) => {
    dispatch({ type: DISPUTES_DETAIL_REQUEST });
    try {
      const detail = await disputesApi.getDisputeDetail(id);
      dispatch({ type: DISPUTES_DETAIL_SUCCESS, payload: detail });
    } catch (error) {
      dispatch({ type: DISPUTES_FAILURE, payload: extractErrorMessage(error) });
    }
  };
}

export function raiseDispute(contractId: string, dto: RaiseDisputeInput): DisputesThunk {
  return async (dispatch) => {
    dispatch({ type: DISPUTES_MUTATE_REQUEST });
    try {
      await disputesApi.raiseDispute(contractId, dto);
      const items = await disputesApi.listMyDisputes();
      dispatch({ type: DISPUTES_MINE_SUCCESS, payload: items });
    } catch (error) {
      dispatch({ type: DISPUTES_FAILURE, payload: extractErrorMessage(error) });
      throw error;
    }
  };
}
