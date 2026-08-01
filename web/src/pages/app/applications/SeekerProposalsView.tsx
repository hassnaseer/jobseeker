import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import StatusChip from '@/components/StatusChip';
import ConfirmDialog from '@/components/feedback/ConfirmDialog';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchMyApplications, withdrawApplication } from '@/features/applications/actions';
import type { Application } from '@/types/domain';

export default function SeekerProposalsView() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { mine, status } = useAppSelector((s) => s.applications);
  const [withdrawTarget, setWithdrawTarget] = useState<Application | null>(null);

  useEffect(() => {
    void dispatch(fetchMyApplications());
  }, [dispatch]);

  if (status !== 'loading' && mine.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">{t('applications.noProposals')}</Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Stack spacing={1.5}>
        {mine.map((app) => (
          <Paper key={app.id} sx={{ p: 2.5 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Box>
                <Typography
                  component={RouterLink}
                  to={`/app/jobs/${app.jobId}`}
                  sx={{ fontWeight: 700, color: 'primary.main', textDecoration: 'none' }}
                >
                  {t('applications.job')} #{app.jobId.slice(0, 8)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {t('applications.applied')}: {new Date(app.createdAt).toLocaleDateString()}
                  {app.bidAmount != null && ` · ${t('applications.bid')}: ${app.currency} ${app.bidAmount}`}
                  {app.proposedHourlyRate != null &&
                    ` · ${app.currency} ${app.proposedHourlyRate}/hr`}
                </Typography>
              </Box>
              <StatusChip status={app.status} />
            </Stack>
            <Typography variant="body2" sx={{ mb: 1.5, whiteSpace: 'pre-wrap' }}>
              {app.coverLetter}
            </Typography>
            {app.status === 'PENDING' && (
              <Button size="small" color="error" onClick={() => setWithdrawTarget(app)}>
                {t('applications.withdraw')}
              </Button>
            )}
          </Paper>
        ))}
      </Stack>

      <ConfirmDialog
        open={!!withdrawTarget}
        title={t('applications.withdrawConfirmTitle')}
        message={t('applications.withdrawConfirmBody')}
        confirmLabel={t('applications.withdraw')}
        destructive
        onClose={() => setWithdrawTarget(null)}
        onConfirm={async () => {
          if (withdrawTarget) {
            await dispatch(withdrawApplication(withdrawTarget.id));
            void dispatch(fetchMyApplications());
          }
          setWithdrawTarget(null);
        }}
      />
    </Box>
  );
}
