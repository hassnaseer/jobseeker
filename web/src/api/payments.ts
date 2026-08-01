import { apiClient } from '@/api/client';
import type { Invoice, PayoutMethod, Transaction, Wallet, WithdrawalRequest } from '@/types/domain';

function assertTransactionCompleted(transaction: Transaction): Transaction {
  if (transaction.status === 'FAILED') {
    throw new Error(transaction.failureReason ?? 'Payment failed. Please try again.');
  }
  return transaction;
}

export async function fundContract(contractId: string, paymentMethodId?: string): Promise<Transaction> {
  const { data } = await apiClient.post<Transaction>(`/payments/contracts/${contractId}/fund`, { paymentMethodId });
  return assertTransactionCompleted(data);
}

export async function fundMilestone(
  contractId: string,
  milestoneId: string,
  paymentMethodId?: string,
): Promise<Transaction> {
  const { data } = await apiClient.post<Transaction>(
    `/payments/contracts/${contractId}/milestones/${milestoneId}/fund`,
    { paymentMethodId },
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

export async function listMyWallets(): Promise<Wallet[]> {
  const { data } = await apiClient.get<Wallet[]>('/payments/wallet');
  return data;
}

export async function listMyTransactions(): Promise<Transaction[]> {
  const { data } = await apiClient.get<Transaction[]>('/payments/transactions/mine');
  return data;
}

export async function listMyInvoices(): Promise<Invoice[]> {
  const { data } = await apiClient.get<Invoice[]>('/payments/invoices/mine');
  return data;
}

export interface CreatePayoutMethodInput {
  type: 'STRIPE_CONNECT' | 'BANK' | 'WALLET';
  bankName?: string;
  accountHolder?: string;
  accountNumber?: string;
  swiftOrRouting?: string;
  currency?: string;
  isDefault?: boolean;
}

export async function createPayoutMethod(dto: CreatePayoutMethodInput): Promise<PayoutMethod> {
  const { data } = await apiClient.post<PayoutMethod>('/payments/payout-methods', dto);
  return data;
}

export async function listMyPayoutMethods(): Promise<PayoutMethod[]> {
  const { data } = await apiClient.get<PayoutMethod[]>('/payments/payout-methods/mine');
  return data;
}

export async function startConnectOnboarding(): Promise<{ url: string }> {
  const { data } = await apiClient.post<{ url: string }>('/payments/connect/onboard');
  return data;
}

export interface CreateWithdrawalInput {
  amount: number;
  currency: string;
  payoutMethodId: string;
}

export async function requestWithdrawal(dto: CreateWithdrawalInput): Promise<WithdrawalRequest> {
  const { data } = await apiClient.post<WithdrawalRequest>('/payments/withdrawals', dto);
  return data;
}

export async function listMyWithdrawals(): Promise<WithdrawalRequest[]> {
  const { data } = await apiClient.get<WithdrawalRequest[]>('/payments/withdrawals/mine');
  return data;
}
