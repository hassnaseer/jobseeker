import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchRevenueReport } from '@/features/admin/actions';

export default function AdminAnalyticsPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const revenue = useAppSelector((s) => s.admin.revenue);

  useEffect(() => {
    void dispatch(fetchRevenueReport());
  }, [dispatch]);

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        {t('admin.analyticsTitle')}
      </Typography>

      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
        {t('admin.revenueTitle')}
      </Typography>
      <Stack direction="row" spacing={2} sx={{ mb: 4, flexWrap: 'wrap' }}>
        {revenue?.commissionByCurrency.map((c) => (
          <Paper key={c.currency} sx={{ p: 2.5, minWidth: 220 }}>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>{c.currency}</Typography>
            <Stack spacing={0.5}>
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  {t('admin.clientFees')}
                </Typography>
                <Typography variant="body2">{c.clientFeeTotal}</Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  {t('admin.seekerFees')}
                </Typography>
                <Typography variant="body2">{c.seekerFeeTotal}</Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {t('admin.platformRevenue')}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {c.platformRevenue}
                </Typography>
              </Stack>
            </Stack>
          </Paper>
        ))}
      </Stack>

      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
        {t('admin.transactionsByType')}
      </Typography>
      <Paper sx={{ p: 2.5 }}>
        <Stack spacing={1}>
          {revenue?.transactionsByType.map((tx) => (
            <Stack key={tx.type} direction="row" sx={{ justifyContent: 'space-between' }}>
              <Typography variant="body2">{tx.type.replace(/_/g, ' ')}</Typography>
              <Typography variant="body2">
                {tx.count} · {tx.total}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
}
