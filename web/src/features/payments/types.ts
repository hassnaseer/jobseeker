import type { PayoutMethod, Transaction, Wallet, WithdrawalRequest } from '@/types/domain';

export interface PaymentsState {
  wallets: Wallet[];
  transactions: Transaction[];
  payoutMethods: PayoutMethod[];
  withdrawals: WithdrawalRequest[];
  status: 'idle' | 'loading' | 'saving' | 'ready' | 'error';
  error: string | null;
}

export const PAYMENTS_REQUEST = 'payments/REQUEST';
export const PAYMENTS_SUCCESS = 'payments/SUCCESS';
export const PAYMENTS_MUTATE_REQUEST = 'payments/MUTATE_REQUEST';
export const PAYMENTS_FAILURE = 'payments/FAILURE';

interface RequestAction {
  type: typeof PAYMENTS_REQUEST;
}
interface SuccessAction {
  type: typeof PAYMENTS_SUCCESS;
  payload: {
    wallets: Wallet[];
    transactions: Transaction[];
    payoutMethods: PayoutMethod[];
    withdrawals: WithdrawalRequest[];
  };
}
interface MutateRequestAction {
  type: typeof PAYMENTS_MUTATE_REQUEST;
}
interface FailureAction {
  type: typeof PAYMENTS_FAILURE;
  payload: string;
}

export type PaymentsAction = RequestAction | SuccessAction | MutateRequestAction | FailureAction;
