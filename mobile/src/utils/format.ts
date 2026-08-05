import type { Job, JobStatus } from '@/types/domain';

export function formatMoney(amount: number | null, currency: string): string {
  if (amount === null) return '—';
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

export function jobBudgetLabel(job: Job): string {
  if (job.jobType === 'HOURLY') {
    const min = job.hourlyRateMin;
    const max = job.hourlyRateMax;
    if (min && max) return `${formatMoney(min, job.currency)} - ${formatMoney(max, job.currency)} / hr`;
    if (min) return `${formatMoney(min, job.currency)}+ / hr`;
    return 'Hourly';
  }
  return job.budgetAmount ? formatMoney(job.budgetAmount, job.currency) : 'Fixed price';
}

const STATUS_TONE: Record<JobStatus, 'neutral' | 'success' | 'warning' | 'error' | 'info'> = {
  DRAFT: 'neutral',
  OPEN: 'success',
  IN_PROGRESS: 'info',
  SUBMITTED: 'info',
  COMPLETED: 'success',
  CANCELLED: 'error',
  DISPUTED: 'error',
  EXPIRED: 'warning',
};

export function jobStatusTone(status: JobStatus) {
  return STATUS_TONE[status];
}

export function jobStatusLabel(status: JobStatus): string {
  return status
    .split('_')
    .map((w) => w[0] + w.slice(1).toLowerCase())
    .join(' ');
}

export function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}
