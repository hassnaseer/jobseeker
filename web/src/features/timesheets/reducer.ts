import {
  TIMESHEETS_FAILURE,
  TIMESHEETS_MUTATE_REQUEST,
  TIMESHEETS_REQUEST,
  TIMESHEETS_SUCCESS,
  type TimesheetsAction,
  type TimesheetsState,
} from './types';

const initialState: TimesheetsState = {
  entries: [],
  periods: [],
  status: 'idle',
  error: null,
};

export function timesheetsReducer(state = initialState, action: TimesheetsAction): TimesheetsState {
  switch (action.type) {
    case TIMESHEETS_REQUEST:
      return { ...state, status: 'loading', error: null };
    case TIMESHEETS_MUTATE_REQUEST:
      return { ...state, status: 'saving', error: null };
    case TIMESHEETS_SUCCESS:
      return { ...state, status: 'ready', entries: action.payload.entries, periods: action.payload.periods };
    case TIMESHEETS_FAILURE:
      return { ...state, status: 'error', error: action.payload };
    default:
      return state;
  }
}
