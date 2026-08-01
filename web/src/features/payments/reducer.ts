import {
  PAYMENTS_FAILURE,
  PAYMENTS_MUTATE_REQUEST,
  PAYMENTS_REQUEST,
  PAYMENTS_SUCCESS,
  type PaymentsAction,
  type PaymentsState,
} from './types';

const initialState: PaymentsState = {
  wallets: [],
  transactions: [],
  payoutMethods: [],
  withdrawals: [],
  status: 'idle',
  error: null,
};

export function paymentsReducer(state = initialState, action: PaymentsAction): PaymentsState {
  switch (action.type) {
    case PAYMENTS_REQUEST:
      return { ...state, status: 'loading', error: null };
    case PAYMENTS_MUTATE_REQUEST:
      return { ...state, status: 'saving', error: null };
    case PAYMENTS_SUCCESS:
      return {
        ...state,
        status: 'ready',
        wallets: action.payload.wallets,
        transactions: action.payload.transactions,
        payoutMethods: action.payload.payoutMethods,
        withdrawals: action.payload.withdrawals,
      };
    case PAYMENTS_FAILURE:
      return { ...state, status: 'error', error: action.payload };
    default:
      return state;
  }
}
