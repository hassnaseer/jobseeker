import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import StatusChip from '@/components/StatusChip';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchReports, resolveReport } from '@/features/admin/actions';

export default function AdminReportsPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { reports } = useAppSelector((s) => s.admin);

  useEffect(() => {
    void dispatch(fetchReports());
  }, [dispatch]);

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        {t('admin.reportsTitle')}
      </Typography>

      {reports.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{t('admin.noReports')}</Typography>
        </Paper>
      )}

      <Stack spacing={1.5}>
        {reports.map((r) => (
          <Paper key={r.id} sx={{ p: 2.5 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Box>
                <Typography sx={{ fontWeight: 700 }}>
                  {r.targetType} · #{r.targetId.slice(0, 8)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('admin.reportedBy')}: #{r.reporterId.slice(0, 8)} · {new Date(r.createdAt).toLocaleString()}
                </Typography>
              </Box>
              <StatusChip status={r.status} />
            </Stack>
            <Typography variant="body2" sx={{ mb: r.status === 'OPEN' ? 1.5 : 0 }}>
              {r.reason}
            </Typography>
            {r.status === 'OPEN' && (
              <Stack direction="row" spacing={1}>
                <Button size="small" onClick={() => void dispatch(resolveReport(r.id, 'DISMISSED'))}>
                  {t('admin.dismiss')}
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => void dispatch(resolveReport(r.id, 'REVIEWED'))}
                >
                  {t('admin.markReviewed')}
                </Button>
              </Stack>
            )}
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}
