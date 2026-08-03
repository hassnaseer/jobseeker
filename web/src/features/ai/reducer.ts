import {
  AI_FAILURE,
  AI_MATCH_SCORES_SUCCESS,
  AI_MUTATE_REQUEST,
  AI_RECOMMENDED_JOBS_SUCCESS,
  AI_REQUEST,
  AI_SHORTLIST_SUCCESS,
  type AiAction,
  type AiState,
} from './types';

const initialState: AiState = {
  recommendedJobs: [],
  shortlistResult: [],
  matchScores: [],
  status: 'idle',
  error: null,
};

export function aiReducer(state = initialState, action: AiAction): AiState {
  switch (action.type) {
    case AI_REQUEST:
      return { ...state, status: 'loading', error: null };
    case AI_MUTATE_REQUEST:
      return { ...state, status: 'saving', error: null };
    case AI_RECOMMENDED_JOBS_SUCCESS:
      return { ...state, status: 'ready', recommendedJobs: action.payload };
    case AI_SHORTLIST_SUCCESS:
      return { ...state, status: 'ready', shortlistResult: action.payload };
    case AI_MATCH_SCORES_SUCCESS:
      return { ...state, status: 'ready', matchScores: action.payload };
    case AI_FAILURE:
      return { ...state, status: 'error', error: action.payload };
    default:
      return state;
  }
}
