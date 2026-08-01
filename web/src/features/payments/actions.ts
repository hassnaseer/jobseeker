import type { Dispatch } from 'redux';
import * as paymentsApi from '@/api/payments';
import { extractErrorMessage } from '@/api/client';
import {
  PAYMENTS_FAILURE,
  PAYMENTS_MUTATE_REQUEST,
  PAYMENTS_REQUEST,
  PAYMENTS_SUCCESS,
  type PaymentsAction,
} from './types';

export type PaymentsThunk = (dispatch: Dispatch<PaymentsAction>) => Promise<void>;

async function loadAll() {
  const [wallets, transactions, payoutMethods, withdrawals] = await Promise.all([
    paymentsApi.listMyWallets(),
    paymentsApi.listMyTransactions(),
    paymentsApi.listMyPayoutMethods(),
    paymentsApi.listMyWithdrawals(),
  ]);
  return { wallets, transactions, payoutMethods, withdrawals };
}

export function fetchPaymentsOverview(): PaymentsThunk {
  return async (dispatch) => {
    dispatch({ type: PAYMENTS_REQUEST });
    try {
      const payload = await loadAll();
      dispatch({ type: PAYMENTS_SUCCESS, payload });
    } catch (error) {
      dispatch({ type: PAYMENTS_FAILURE, payload: extractErrorMessage(error) });
    }
  };
}

function mutateThunk(run: () => Promise<unknown>): PaymentsThunk {
  return async (dispatch) => {
    dispatch({ type: PAYMENTS_MUTATE_REQUEST });
    try {
      await run();
      const payload = await loadAll();
      dispatch({ type: PAYMENTS_SUCCESS, payload });
    } catch (error) {
      dispatch({ type: PAYMENTS_FAILURE, payload: extractErrorMessage(error) });
      throw error;
    }
  };
}

export const createPayoutMethod = (dto: paymentsApi.CreatePayoutMethodInput) =>
  mutateThunk(() => paymentsApi.createPayoutMethod(dto));
export const requestWithdrawal = (dto: paymentsApi.CreateWithdrawalInput) =>
  mutateThunk(() => paymentsApi.requestWithdrawal(dto));
