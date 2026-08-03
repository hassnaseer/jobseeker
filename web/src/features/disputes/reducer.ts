import {
  DISPUTES_DETAIL_REQUEST,
  DISPUTES_DETAIL_SUCCESS,
  DISPUTES_FAILURE,
  DISPUTES_MINE_REQUEST,
  DISPUTES_MINE_SUCCESS,
  DISPUTES_MUTATE_REQUEST,
  type DisputesAction,
  type DisputesState,
} from './types';

const initialState: DisputesState = {
  mine: [],
  detail: null,
  status: 'idle',
  error: null,
};

export function disputesReducer(state = initialState, action: DisputesAction): DisputesState {
  switch (action.type) {
    case DISPUTES_MINE_REQUEST:
    case DISPUTES_DETAIL_REQUEST:
      return { ...state, status: 'loading', error: null };
    case DISPUTES_MINE_SUCCESS:
      return { ...state, status: 'ready', mine: action.payload };
    case DISPUTES_DETAIL_SUCCESS:
      return { ...state, status: 'ready', detail: action.payload };
    case DISPUTES_MUTATE_REQUEST:
      return { ...state, status: 'saving', error: null };
    case DISPUTES_FAILURE:
      return { ...state, status: 'error', error: action.payload };
    default:
      return state;
  }
}
