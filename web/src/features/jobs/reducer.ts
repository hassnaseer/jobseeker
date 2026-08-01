import {
  JOBS_DETAIL_REQUEST,
  JOBS_DETAIL_SUCCESS,
  JOBS_FAILURE,
  JOBS_LIST_REQUEST,
  JOBS_LIST_SUCCESS,
  JOBS_MINE_REQUEST,
  JOBS_MINE_SUCCESS,
  JOBS_MUTATE_REQUEST,
  JOBS_MUTATE_SUCCESS,
  type JobsAction,
  type JobsState,
} from './types';

const initialState: JobsState = {
  list: [],
  mine: [],
  detail: null,
  status: 'idle',
  error: null,
};

export function jobsReducer(state = initialState, action: JobsAction): JobsState {
  switch (action.type) {
    case JOBS_LIST_REQUEST:
    case JOBS_MINE_REQUEST:
    case JOBS_DETAIL_REQUEST:
      return { ...state, status: 'loading', error: null };
    case JOBS_MUTATE_REQUEST:
      return { ...state, status: 'saving', error: null };
    case JOBS_LIST_SUCCESS:
      return { ...state, status: 'ready', list: action.payload };
    case JOBS_MINE_SUCCESS:
      return { ...state, status: 'ready', mine: action.payload };
    case JOBS_DETAIL_SUCCESS:
      return { ...state, status: 'ready', detail: action.payload };
    case JOBS_MUTATE_SUCCESS: {
      const job = action.payload;
      const exists = state.mine.some((j) => j.id === job.id);
      return {
        ...state,
        status: 'ready',
        detail: state.detail?.id === job.id ? job : state.detail,
        mine: exists ? state.mine.map((j) => (j.id === job.id ? job : j)) : [job, ...state.mine],
      };
    }
    case JOBS_FAILURE:
      return { ...state, status: 'error', error: action.payload };
    default:
      return state;
  }
}
