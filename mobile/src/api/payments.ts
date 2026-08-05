import { apiClient } from '@/api/client';

interface Transaction {
  id: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  failureReason?: string | null;
}

function assertTransactionCompleted(transaction: Transaction): Transaction {
  if (transaction.status === 'FAILED') {
    throw new Error(transaction.failureReason ?? 'Payment failed. Please try again.');
  }
  return transaction;
}

export async function fundContract(contractId: string): Promise<Transaction> {
  const { data } = await apiClient.post<Transaction>(`/payments/contracts/${contractId}/fund`, {});
  return assertTransactionCompleted(data);
}

export async function fundMilestone(contractId: string, milestoneId: string): Promise<Transaction> {
  const { data } = await apiClient.post<Transaction>(
    `/payments/contracts/${contractId}/milestones/${milestoneId}/fund`,
    {},
  );
  return assertTransactionCompleted(data);
}

export async function releaseMilestone(contractId: string, milestoneId: string): Promise<Transaction> {
  const { data } = await apiClient.post<Transaction>(
    `/payments/contracts/${contractId}/milestones/${milestoneId}/release`,
  );
  return data;
}

export async function releaseLump(contractId: string): Promise<Transaction> {
  const { data } = await apiClient.post<Transaction>(`/payments/contracts/${contractId}/release`);
  return data;
}

export async function approveTimesheetPeriod(contractId: string, periodId: string): Promise<unknown> {
  const { data } = await apiClient.post(`/payments/contracts/${contractId}/timesheet-periods/${periodId}/approve`);
  return data;
}
