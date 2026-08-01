import type { Dispatch } from 'redux';
import * as contractsApi from '@/api/contracts';
import * as paymentsApi from '@/api/payments';
import { extractErrorMessage } from '@/api/client';
import {
  CONTRACTS_DETAIL_REQUEST,
  CONTRACTS_DETAIL_SUCCESS,
  CONTRACTS_FAILURE,
  CONTRACTS_MINE_REQUEST,
  CONTRACTS_MINE_SUCCESS,
  CONTRACTS_MUTATE_REQUEST,
  CONTRACTS_MUTATE_SUCCESS,
  type ContractsAction,
} from './types';

export type ContractsThunk = (dispatch: Dispatch<ContractsAction>) => Promise<void>;

export function fetchMyContracts(): ContractsThunk {
  return async (dispatch) => {
    dispatch({ type: CONTRACTS_MINE_REQUEST });
    try {
      const items = await contractsApi.listMyContracts();
      dispatch({ type: CONTRACTS_MINE_SUCCESS, payload: items });
    } catch (error) {
      dispatch({ type: CONTRACTS_FAILURE, payload: extractErrorMessage(error) });
    }
  };
}

export function fetchContractDetail(id: string): ContractsThunk {
  return async (dispatch) => {
    dispatch({ type: CONTRACTS_DETAIL_REQUEST });
    try {
      const [contract, milestones, deliverables] = await Promise.all([
        contractsApi.getContractDetail(id),
        contractsApi.listMilestones(id),
        contractsApi.listDeliverables(id),
      ]);
      dispatch({ type: CONTRACTS_DETAIL_SUCCESS, payload: { contract, milestones, deliverables } });
    } catch (error) {
      dispatch({ type: CONTRACTS_FAILURE, payload: extractErrorMessage(error) });
    }
  };
}

function mutateThunk(id: string, run: () => Promise<unknown>): ContractsThunk {
  return async (dispatch) => {
    dispatch({ type: CONTRACTS_MUTATE_REQUEST });
    try {
      await run();
      dispatch({ type: CONTRACTS_MUTATE_SUCCESS });
      const [contract, milestones, deliverables] = await Promise.all([
        contractsApi.getContractDetail(id),
        contractsApi.listMilestones(id),
        contractsApi.listDeliverables(id),
      ]);
      dispatch({ type: CONTRACTS_DETAIL_SUCCESS, payload: { contract, milestones, deliverables } });
    } catch (error) {
      dispatch({ type: CONTRACTS_FAILURE, payload: extractErrorMessage(error) });
      throw error;
    }
  };
}

export const activateHourlyContract = (id: string) => mutateThunk(id, () => contractsApi.activateHourlyContract(id));
export const submitDeliverable = (id: string, dto: contractsApi.SubmitDeliverableInput) =>
  mutateThunk(id, () => contractsApi.submitDeliverable(id, dto));
export const approveDeliverable = (id: string, deliverableId: string) =>
  mutateThunk(id, () => contractsApi.approveDeliverable(id, deliverableId));
export const requestRevision = (id: string, deliverableId: string, feedback: string) =>
  mutateThunk(id, () => contractsApi.requestRevision(id, deliverableId, feedback));
export const completeHourlyContract = (id: string) => mutateThunk(id, () => contractsApi.completeHourlyContract(id));

export const fundContract = (id: string) => mutateThunk(id, () => paymentsApi.fundContract(id));
export const fundMilestone = (id: string, milestoneId: string) =>
  mutateThunk(id, () => paymentsApi.fundMilestone(id, milestoneId));
export const releaseMilestone = (id: string, milestoneId: string) =>
  mutateThunk(id, () => paymentsApi.releaseMilestone(id, milestoneId));
export const releaseLump = (id: string) => mutateThunk(id, () => paymentsApi.releaseLump(id));
