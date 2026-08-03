import { Chip, type ChipProps } from '@mui/material';

const STATUS_COLOR_MAP: Record<string, ChipProps['color']> = {
  INCOMPLETE: 'default',
  PENDING: 'warning',
  APPROVED: 'success',
  ACTIVE: 'success',
  REJECTED: 'error',
  CANCELLED: 'error',
  DRAFT: 'default',
  OPEN: 'info',
  CLOSED: 'default',
  COMPLETED: 'success',
  SUBMITTED: 'info',
  REVISION: 'warning',
  DISPUTED: 'error',
  IN_PROGRESS: 'info',
  EXPIRED: 'default',
  PAUSED: 'warning',
  SHORTLISTED: 'info',
  ACCEPTED: 'success',
  WITHDRAWN: 'default',
  FUNDED: 'info',
  RELEASED: 'success',
  REVISION_REQUESTED: 'warning',
  REVIEWED: 'success',
  DISMISSED: 'default',
  UNDER_REVIEW: 'info',
  RESOLVED: 'success',
  BANNED: 'error',
  SUSPENDED: 'warning',
  REFUND_CLIENT: 'info',
  RELEASE_SEEKER: 'success',
  SPLIT: 'warning',
};

interface Props {
  status: string;
  label?: string;
  size?: ChipProps['size'];
}

/** Reusable colored status chip, shared across profile/job/contract/dispute status displays. */
export default function StatusChip({ status, label, size = 'small' }: Props) {
  const color = STATUS_COLOR_MAP[status] ?? 'default';
  return <Chip label={label ?? status.replace(/_/g, ' ')} color={color} size={size} variant="outlined" />;
}
