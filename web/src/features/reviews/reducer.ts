import {
  REVIEWS_FAILURE,
  REVIEWS_FOR_CONTRACT_REQUEST,
  REVIEWS_FOR_CONTRACT_SUCCESS,
  REVIEWS_MUTATE_REQUEST,
  REVIEWS_RECEIVED_REQUEST,
  REVIEWS_RECEIVED_SUCCESS,
  type ReviewsAction,
  type ReviewsState,
} from './types';

const initialState: ReviewsState = {
  forContract: [],
  receivedBy: [],
  status: 'idle',
  error: null,
};

export function reviewsReducer(state = initialState, action: ReviewsAction): ReviewsState {
  switch (action.type) {
    case REVIEWS_FOR_CONTRACT_REQUEST:
    case REVIEWS_RECEIVED_REQUEST:
      return { ...state, status: 'loading', error: null };
    case REVIEWS_FOR_CONTRACT_SUCCESS:
      return { ...state, status: 'ready', forContract: action.payload };
    case REVIEWS_RECEIVED_SUCCESS:
      return { ...state, status: 'ready', receivedBy: action.payload };
    case REVIEWS_MUTATE_REQUEST:
      return { ...state, status: 'saving', error: null };
    case REVIEWS_FAILURE:
      return { ...state, status: 'error', error: action.payload };
    default:
      return state;
  }
}
