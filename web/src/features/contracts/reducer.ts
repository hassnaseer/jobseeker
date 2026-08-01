import {
  CONTRACTS_DETAIL_REQUEST,
  CONTRACTS_DETAIL_SUCCESS,
  CONTRACTS_FAILURE,
  CONTRACTS_MINE_REQUEST,
  CONTRACTS_MINE_SUCCESS,
  CONTRACTS_MUTATE_REQUEST,
  CONTRACTS_MUTATE_SUCCESS,
  type ContractsAction,
  type ContractsState,
} from './types';

const initialState: ContractsState = {
  mine: [],
  detail: null,
  milestones: [],
  deliverables: [],
  status: 'idle',
  error: null,
};

export function contractsReducer(state = initialState, action: ContractsAction): ContractsState {
  switch (action.type) {
    case CONTRACTS_MINE_REQUEST:
    case CONTRACTS_DETAIL_REQUEST:
      return { ...state, status: 'loading', error: null };
    case CONTRACTS_MUTATE_REQUEST:
      return { ...state, status: 'saving', error: null };
    case CONTRACTS_MINE_SUCCESS:
      return { ...state, status: 'ready', mine: action.payload };
    case CONTRACTS_DETAIL_SUCCESS:
      return {
        ...state,
        status: 'ready',
        detail: action.payload.contract,
        milestones: action.payload.milestones,
        deliverables: action.payload.deliverables,
      };
    case CONTRACTS_MUTATE_SUCCESS:
      return { ...state, status: 'ready' };
    case CONTRACTS_FAILURE:
      return { ...state, status: 'error', error: action.payload };
    default:
      return state;
  }
}
