import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Paper, Rating, Stack, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchReviewsForContract } from '@/features/reviews/actions';
import ReviewModal from './ReviewModal';
import type { Contract } from '@/types/domain';

interface Props {
  contract: Contract;
  currentUserId: string;
}

export default function ReviewsSection({ contract, currentUserId }: Props) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { forContract } = useAppSelector((s) => s.reviews);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    void dispatch(fetchReviewsForContract(contract.id));
  }, [dispatch, contract.id]);

  const otherPartyId = currentUserId === contract.clientId ? contract.seekerId : contract.clientId;
  const myReview = forContract.find((r) => r.reviewerId === currentUserId) ?? null;
  const theirReview = forContract.find((r) => r.reviewerId === otherPartyId) ?? null;

  return (
    <Paper sx={{ p: 4, mt: 3 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
        {t('reviews.title')}
      </Typography>

      <Stack spacing={3}>
        <Box>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {t('reviews.yourReview')}
            </Typography>
            {myReview ? (
              <Button size="small" onClick={() => setModalOpen(true)}>
                {t('common.edit')}
              </Button>
            ) : (
              <Button size="small" variant="contained" onClick={() => setModalOpen(true)}>
                {t('reviews.leaveReview')}
              </Button>
            )}
          </Stack>
          {myReview ? (
            <>
              <Rating value={myReview.rating} readOnly size="small" />
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 0.5 }}>
                {myReview.comment}
              </Typography>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {t('reviews.noReviewYet')}
            </Typography>
          )}
        </Box>

        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {t('reviews.theirReview')}
          </Typography>
          {theirReview ? (
            <>
              <Rating value={theirReview.rating} readOnly size="small" />
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 0.5 }}>
                {theirReview.comment}
              </Typography>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {t('reviews.waitingForReview')}
            </Typography>
          )}
        </Box>
      </Stack>

      <ReviewModal open={modalOpen} onClose={() => setModalOpen(false)} contractId={contract.id} existing={myReview} />
    </Paper>
  );
}
