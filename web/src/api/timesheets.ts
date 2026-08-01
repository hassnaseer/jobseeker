import { apiClient } from '@/api/client';
import type { CheckIn, TimeLogEntry, TimesheetPeriod } from '@/types/domain';

export interface LogManualTimeInput {
  startTime?: string;
  endTime?: string;
  hours?: number;
  date?: string;
  description: string;
}

export async function logManualTime(contractId: string, dto: LogManualTimeInput): Promise<TimeLogEntry> {
  const { data } = await apiClient.post<TimeLogEntry>(`/contracts/${contractId}/time-logs/manual`, dto);
  return data;
}

export async function startTimer(contractId: string): Promise<TimeLogEntry> {
  const { data } = await apiClient.post<TimeLogEntry>(`/contracts/${contractId}/time-logs/timer/start`);
  return data;
}

export async function stopTimer(contractId: string): Promise<TimeLogEntry> {
  const { data } = await apiClient.post<TimeLogEntry>(`/contracts/${contractId}/time-logs/timer/stop`);
  return data;
}

export async function listTimeLogEntries(contractId: string, periodId?: string): Promise<TimeLogEntry[]> {
  const { data } = await apiClient.get<TimeLogEntry[]>(`/contracts/${contractId}/time-logs`, {
    params: periodId ? { periodId } : undefined,
  });
  return data;
}

export async function approveTimeLogEntry(contractId: string, entryId: string): Promise<TimeLogEntry> {
  const { data } = await apiClient.post<TimeLogEntry>(`/contracts/${contractId}/time-logs/${entryId}/approve`);
  return data;
}

export async function disputeTimeLogEntry(contractId: string, entryId: string): Promise<TimeLogEntry> {
  const { data } = await apiClient.post<TimeLogEntry>(`/contracts/${contractId}/time-logs/${entryId}/dispute`);
  return data;
}

export async function listTimesheetPeriods(contractId: string): Promise<TimesheetPeriod[]> {
  const { data } = await apiClient.get<TimesheetPeriod[]>(`/contracts/${contractId}/timesheet-periods`);
  return data;
}

export async function closeTimesheetPeriod(contractId: string, periodId: string): Promise<TimesheetPeriod> {
  const { data } = await apiClient.post<TimesheetPeriod>(
    `/contracts/${contractId}/timesheet-periods/${periodId}/close`,
  );
  return data;
}

export async function disputeTimesheetPeriod(contractId: string, periodId: string): Promise<TimesheetPeriod> {
  const { data } = await apiClient.post<TimesheetPeriod>(
    `/contracts/${contractId}/timesheet-periods/${periodId}/dispute`,
  );
  return data;
}

export async function checkIn(
  contractId: string,
  type: 'IN' | 'OUT',
  latitude: number,
  longitude: number,
): Promise<CheckIn> {
  const { data } = await apiClient.post<CheckIn>(`/contracts/${contractId}/check-ins`, {
    type,
    latitude,
    longitude,
  });
  return data;
}

export async function listCheckIns(contractId: string): Promise<CheckIn[]> {
  const { data } = await apiClient.get<CheckIn[]>(`/contracts/${contractId}/check-ins`);
  return data;
}
