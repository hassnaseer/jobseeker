import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Button } from '@mui/material';
import Modal from '@/components/feedback/Modal';
import FormTextField from '@/components/form/FormTextField';
import { useAppDispatch } from '@/app/hooks';
import { reportChatTarget } from '@/features/chat/actions';
import { extractErrorMessage } from '@/api/client';

interface Props {
  conversationId: string;
  open: boolean;
  onClose: () => void;
}

export default function ReportConversationModal({ conversationId, open, onClose }: Props) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    setReason('');
    setError(null);
    setSubmitted(false);
    onClose();
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await dispatch(
        reportChatTarget({ targetType: 'CONVERSATION', targetId: conversationId, reason: reason.trim() }),
      );
      setSubmitted(true);
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
      title={t('chat.reportConversation')}
      actions={
        !submitted && (
          <Button variant="contained" onClick={handleSubmit} disabled={submitting || reason.trim().length < 3}>
            {t('chat.report')}
          </Button>
        )
      }
    >
      {submitted ? (
        <Alert severity="success">{t('chat.reportSubmitted')}</Alert>
      ) : (
        <>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <FormTextField
            label={t('chat.reportReason')}
            value={reason}
            onChange={setReason}
            multiline
            minRows={3}
          />
        </>
      )}
    </Modal>
  );
}
