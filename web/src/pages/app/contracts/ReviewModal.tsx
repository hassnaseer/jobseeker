import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Button, Rating, Typography } from '@mui/material';
import Modal from '@/components/feedback/Modal';
import FormTextField from '@/components/form/FormTextField';
import { extractErrorMessage } from '@/api/client';
import { useAppDispatch } from '@/app/hooks';
import { submitReview, updateReview } from '@/features/reviews/actions';
import type { Review } from '@/types/domain';

interface Props {
  open: boolean;
  onClose: () => void;
  contractId: string;
  existing: Review | null;
}

export default function ReviewModal({ open, onClose, contractId, existing }: Props) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [comment, setComment] = useState(existing?.comment ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setRating(existing?.rating ?? 0);
      setComment(existing?.comment ?? '');
      setError(null);
    }
  }, [open, existing]);

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      if (existing) {
        await dispatch(updateReview(existing.id, contractId, { rating, comment: comment.trim() }));
      } else {
        await dispatch(submitReview(contractId, { rating, comment: comment.trim() }));
      }
      onClose();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={existing ? t('reviews.editReview') : t('reviews.leaveReview')}
      actions={
        <Button
          variant="contained"
          onClick={() => void handleSubmit()}
          disabled={saving || rating < 1 || comment.trim().length < 3}
        >
          {t('common.submit')}
        </Button>
      }
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Typography sx={{ mb: 1 }}>{t('reviews.rating')}</Typography>
      <Rating value={rating} onChange={(_, value) => setRating(value ?? 0)} size="large" sx={{ mb: 2 }} />
      <FormTextField label={t('reviews.comment')} value={comment} onChange={setComment} multiline minRows={4} />
    </Modal>
  );
}
