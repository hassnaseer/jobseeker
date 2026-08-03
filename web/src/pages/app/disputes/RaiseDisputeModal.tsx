import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Button } from '@mui/material';
import Modal from '@/components/feedback/Modal';
import FormTextField from '@/components/form/FormTextField';
import FormSelectField from '@/components/form/FormSelectField';
import { extractErrorMessage } from '@/api/client';
import { useAppDispatch } from '@/app/hooks';
import { raiseDispute } from '@/features/disputes/actions';
import type { Milestone } from '@/types/domain';

interface Props {
  open: boolean;
  onClose: () => void;
  contractId: string;
  milestones?: Milestone[];
}

export default function RaiseDisputeModal({ open, onClose, contractId, milestones }: Props) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [milestoneId, setMilestoneId] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    setMilestoneId('');
    setReason('');
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await dispatch(
        raiseDispute(contractId, {
          milestoneId: milestoneId || undefined,
          reason: reason.trim(),
        }),
      );
      handleClose();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={t('disputes.raiseDispute')}
      actions={
        <Button variant="contained" color="error" onClick={() => void handleSubmit()} disabled={submitting || reason.trim().length < 5}>
          {t('disputes.raiseDispute')}
        </Button>
      }
    >
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {milestones && milestones.length > 0 && (
        <FormSelectField
          label={t('contracts.milestones')}
          value={milestoneId}
          onChange={setMilestoneId}
          emptyLabel={t('disputes.wholeContract')}
          options={milestones.map((m) => ({ value: m.id, label: m.title }))}
          sx={{ mb: 2 }}
        />
      )}
      <FormTextField
        label={t('disputes.reason')}
        value={reason}
        onChange={setReason}
        multiline
        minRows={4}
      />
    </Modal>
  );
}
