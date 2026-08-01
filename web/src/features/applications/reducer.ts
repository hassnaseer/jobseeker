import {
  APPLICATIONS_DETAIL_REQUEST,
  APPLICATIONS_DETAIL_SUCCESS,
  APPLICATIONS_FAILURE,
  APPLICATIONS_FOR_JOB_REQUEST,
  APPLICATIONS_FOR_JOB_SUCCESS,
  APPLICATIONS_MINE_REQUEST,
  APPLICATIONS_MINE_SUCCESS,
  APPLICATIONS_MUTATE_REQUEST,
  APPLICATIONS_MUTATE_SUCCESS,
  type ApplicationsAction,
  type ApplicationsState,
} from './types';

const initialState: ApplicationsState = {
  forJob: [],
  mine: [],
  detail: null,
  status: 'idle',
  error: null,
};

function replaceOrPrepend<T extends { id: string }>(list: T[], item: T): T[] {
  return list.some((x) => x.id === item.id) ? list.map((x) => (x.id === item.id ? item : x)) : [item, ...list];
}

export function applicationsReducer(state = initialState, action: ApplicationsAction): ApplicationsState {
  switch (action.type) {
    case APPLICATIONS_FOR_JOB_REQUEST:
    case APPLICATIONS_MINE_REQUEST:
    case APPLICATIONS_DETAIL_REQUEST:
      return { ...state, status: 'loading', error: null };
    case APPLICATIONS_MUTATE_REQUEST:
      return { ...state, status: 'saving', error: null };
    case APPLICATIONS_FOR_JOB_SUCCESS:
      return { ...state, status: 'ready', forJob: action.payload };
    case APPLICATIONS_MINE_SUCCESS:
      return { ...state, status: 'ready', mine: action.payload };
    case APPLICATIONS_DETAIL_SUCCESS:
      return { ...state, status: 'ready', detail: action.payload };
    case APPLICATIONS_MUTATE_SUCCESS:
      return {
        ...state,
        status: 'ready',
        detail: state.detail?.id === action.payload.id ? action.payload : state.detail,
        forJob: replaceOrPrepend(state.forJob, action.payload),
        mine: replaceOrPrepend(state.mine, action.payload),
      };
    case APPLICATIONS_FAILURE:
      return { ...state, status: 'error', error: action.payload };
    default:
      return state;
  }
}
