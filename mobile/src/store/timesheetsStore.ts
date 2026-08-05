import { create } from 'zustand';
import {
  closeTimesheetPeriod,
  listTimeLogEntries,
  listTimesheetPeriods,
  logManualTime,
  startTimer as apiStartTimer,
  stopTimer as apiStopTimer,
  type LogManualTimeInput,
} from '@/api/timesheets';
import { extractErrorMessage } from '@/api/client';
import type { TimeLogEntry, TimesheetPeriod } from '@/types/domain';

interface TimesheetsState {
  entries: TimeLogEntry[];
  periods: TimesheetPeriod[];
  activeEntry: TimeLogEntry | null;
  status: 'idle' | 'loading' | 'saving' | 'ready' | 'error';
  error: string | null;

  fetch: (contractId: string) => Promise<void>;
  logManual: (contractId: string, dto: LogManualTimeInput) => Promise<void>;
  startTimer: (contractId: string) => Promise<void>;
  stopTimer: (contractId: string) => Promise<void>;
  closePeriod: (contractId: string, periodId: string) => Promise<void>;
  clear: () => void;
}

export const useTimesheetsStore = create<TimesheetsState>((set, get) => ({
  entries: [],
  periods: [],
  activeEntry: null,
  status: 'idle',
  error: null,

  fetch: async (contractId) => {
    set({ status: 'loading', error: null });
    try {
      const [entries, periods] = await Promise.all([
        listTimeLogEntries(contractId),
        listTimesheetPeriods(contractId),
      ]);
      const activeEntry = entries.find((e) => e.entryType === 'TIMER' && e.startTime && !e.endTime) ?? null;
      set({ entries, periods, activeEntry, status: 'ready' });
    } catch (error) {
      set({ status: 'error', error: extractErrorMessage(error) });
      throw error;
    }
  },

  logManual: async (contractId, dto) => {
    set({ status: 'saving', error: null });
    try {
      const entry = await logManualTime(contractId, dto);
      set({ entries: [entry, ...get().entries], status: 'ready' });
    } catch (error) {
      set({ status: 'error', error: extractErrorMessage(error) });
      throw error;
    }
  },

  startTimer: async (contractId) => {
    set({ status: 'saving', error: null });
    try {
      const entry = await apiStartTimer(contractId);
      set({ activeEntry: entry, entries: [entry, ...get().entries], status: 'ready' });
    } catch (error) {
      set({ status: 'error', error: extractErrorMessage(error) });
      throw error;
    }
  },

  stopTimer: async (contractId) => {
    set({ status: 'saving', error: null });
    try {
      const entry = await apiStopTimer(contractId);
      set({
        activeEntry: null,
        entries: get().entries.map((e) => (e.id === entry.id ? entry : e)),
        status: 'ready',
      });
    } catch (error) {
      set({ status: 'error', error: extractErrorMessage(error) });
      throw error;
    }
  },

  closePeriod: async (contractId, periodId) => {
    set({ status: 'saving', error: null });
    try {
      const period = await closeTimesheetPeriod(contractId, periodId);
      set({ periods: get().periods.map((p) => (p.id === period.id ? period : p)), status: 'ready' });
    } catch (error) {
      set({ status: 'error', error: extractErrorMessage(error) });
      throw error;
    }
  },

  clear: () => set({ entries: [], periods: [], activeEntry: null }),
}));
