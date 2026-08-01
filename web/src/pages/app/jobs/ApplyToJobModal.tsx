import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Button, Stack } from '@mui/material';
import Modal from '@/components/feedback/Modal';
import FormTextField from '@/components/form/FormTextField';
import FormSelectField from '@/components/form/FormSelectField';
import { useAppDispatch } from '@/app/hooks';
import { applyToJob } from '@/features/applications/actions';
import { extractErrorMessage } from '@/api/client';
import type { Job } from '@/types/domain';

interface Props {
  job: Job;
  open: boolean;
  onClose: () => void;
  onApplied: () => void;
}

export default function ApplyToJobModal({ job, open, onClose, onApplied }: Props) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [coverLetter, setCoverLetter] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [proposedHourlyRate, setProposedHourlyRate] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const durationOptions = [
    { value: 'LESS_THAN_1_MONTH', label: t('jobs.durationLt1') },
    { value: 'ONE_TO_THREE_MONTHS', label: t('jobs.duration1to3') },
    { value: 'THREE_TO_SIX_MONTHS', label: t('jobs.duration3to6') },
    { value: 'MORE_THAN_SIX_MONTHS', label: t('jobs.durationGt6') },
  ];

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await dispatch(
        applyToJob(job.id, {
          coverLetter,
          bidAmount: job.jobType === 'FIXED' && bidAmount ? Number(bidAmount) : undefined,
          proposedHourlyRate: job.jobType === 'HOURLY' && proposedHourlyRate ? Number(proposedHourlyRate) : undefined,
          currency: job.currency,
          estimatedDuration: estimatedDuration || undefined,
        }),
      );
      onApplied();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('applications.applyModalTitle', { title: job.title })}
      actions={
        <Button variant="contained" onClick={handleSubmit} disabled={submitting || !coverLetter}>
          {t('applications.submitApplication')}
        </Button>
      }
    >
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}
        <FormTextField
          label={t('applications.coverLetter')}
          value={coverLetter}
          onChange={setCoverLetter}
          multiline
          minRows={4}
          required
        />
        {job.jobType === 'FIXED' && (
          <FormTextField
            label={t('applications.bidAmount')}
            type="number"
            value={bidAmount}
            onChange={setBidAmount}
          />
        )}
        {job.jobType === 'HOURLY' && (
          <FormTextField
            label={t('applications.proposedHourlyRate')}
            type="number"
            value={proposedHourlyRate}
            onChange={setProposedHourlyRate}
          />
        )}
        <FormSelectField
          label={t('applications.estimatedDuration')}
          value={estimatedDuration}
          onChange={setEstimatedDuration}
          options={durationOptions}
        />
      </Stack>
    </Modal>
  );
}
