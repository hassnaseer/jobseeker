import type { Dispatch } from 'redux';
import * as timesheetsApi from '@/api/timesheets';
import * as paymentsApi from '@/api/payments';
import { extractErrorMessage } from '@/api/client';
import {
  TIMESHEETS_FAILURE,
  TIMESHEETS_MUTATE_REQUEST,
  TIMESHEETS_REQUEST,
  TIMESHEETS_SUCCESS,
  type TimesheetsAction,
} from './types';

export type TimesheetsThunk = (dispatch: Dispatch<TimesheetsAction>) => Promise<void>;

export function fetchTimesheet(contractId: string): TimesheetsThunk {
  return async (dispatch) => {
    dispatch({ type: TIMESHEETS_REQUEST });
    try {
      const [entries, periods] = await Promise.all([
        timesheetsApi.listTimeLogEntries(contractId),
        timesheetsApi.listTimesheetPeriods(contractId),
      ]);
      dispatch({ type: TIMESHEETS_SUCCESS, payload: { entries, periods } });
    } catch (error) {
      dispatch({ type: TIMESHEETS_FAILURE, payload: extractErrorMessage(error) });
    }
  };
}

function mutateThunk(contractId: string, run: () => Promise<unknown>): TimesheetsThunk {
  return async (dispatch) => {
    dispatch({ type: TIMESHEETS_MUTATE_REQUEST });
    try {
      await run();
      const [entries, periods] = await Promise.all([
        timesheetsApi.listTimeLogEntries(contractId),
        timesheetsApi.listTimesheetPeriods(contractId),
      ]);
      dispatch({ type: TIMESHEETS_SUCCESS, payload: { entries, periods } });
    } catch (error) {
      dispatch({ type: TIMESHEETS_FAILURE, payload: extractErrorMessage(error) });
      throw error;
    }
  };
}

export const logManualTime = (contractId: string, dto: timesheetsApi.LogManualTimeInput) =>
  mutateThunk(contractId, () => timesheetsApi.logManualTime(contractId, dto));
export const approveTimeLogEntry = (contractId: string, entryId: string) =>
  mutateThunk(contractId, () => timesheetsApi.approveTimeLogEntry(contractId, entryId));
export const disputeTimeLogEntry = (contractId: string, entryId: string) =>
  mutateThunk(contractId, () => timesheetsApi.disputeTimeLogEntry(contractId, entryId));
export const closeTimesheetPeriod = (contractId: string, periodId: string) =>
  mutateThunk(contractId, () => timesheetsApi.closeTimesheetPeriod(contractId, periodId));
export const approveTimesheetPeriod = (contractId: string, periodId: string) =>
  mutateThunk(contractId, () => paymentsApi.approveTimesheetPeriod(contractId, periodId));
