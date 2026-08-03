import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Paper, Stack, Typography } from '@mui/material';
import StatusChip from '@/components/StatusChip';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchMyDisputes } from '@/features/disputes/actions';

export default function DisputesListPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { mine, status } = useAppSelector((s) => s.disputes);

  useEffect(() => {
    void dispatch(fetchMyDisputes());
  }, [dispatch]);

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        {t('disputes.title')}
      </Typography>

      {status !== 'loading' && mine.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{t('disputes.noDisputes')}</Typography>
        </Paper>
      )}

      <Stack spacing={1.5}>
        {mine.map((dispute) => (
          <Paper
            key={dispute.id}
            component={RouterLink}
            to={`/app/disputes/${dispute.id}`}
            sx={{
              p: 2.5,
              display: 'block',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'box-shadow 160ms ease',
              '&:hover': { boxShadow: '0 4px 16px rgba(30,20,80,0.08)' },
            }}
          >
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Box>
                <Typography sx={{ fontWeight: 700 }}>
                  {t('disputes.contract')} #{dispute.contractId.slice(0, 8)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {new Date(dispute.createdAt).toLocaleString()}
                </Typography>
              </Box>
              <StatusChip status={dispute.status} />
            </Stack>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {dispute.reason}
            </Typography>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}
