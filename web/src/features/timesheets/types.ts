import type { TimeLogEntry, TimesheetPeriod } from '@/types/domain';

export interface TimesheetsState {
  entries: TimeLogEntry[];
  periods: TimesheetPeriod[];
  status: 'idle' | 'loading' | 'saving' | 'ready' | 'error';
  error: string | null;
}

export const TIMESHEETS_REQUEST = 'timesheets/REQUEST';
export const TIMESHEETS_SUCCESS = 'timesheets/SUCCESS';
export const TIMESHEETS_MUTATE_REQUEST = 'timesheets/MUTATE_REQUEST';
export const TIMESHEETS_FAILURE = 'timesheets/FAILURE';

interface RequestAction {
  type: typeof TIMESHEETS_REQUEST;
}
interface SuccessAction {
  type: typeof TIMESHEETS_SUCCESS;
  payload: { entries: TimeLogEntry[]; periods: TimesheetPeriod[] };
}
interface MutateRequestAction {
  type: typeof TIMESHEETS_MUTATE_REQUEST;
}
interface FailureAction {
  type: typeof TIMESHEETS_FAILURE;
  payload: string;
}

export type TimesheetsAction = RequestAction | SuccessAction | MutateRequestAction | FailureAction;
