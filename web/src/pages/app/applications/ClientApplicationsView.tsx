import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import FormSelectField from '@/components/form/FormSelectField';
import StatusChip from '@/components/StatusChip';
import ConfirmDialog from '@/components/feedback/ConfirmDialog';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchMyJobs } from '@/features/jobs/actions';
import {
  acceptApplication,
  fetchApplicationsForJob,
  rejectApplication,
  shortlistApplication,
} from '@/features/applications/actions';
import type { Application } from '@/types/domain';

interface Props {
  jobId: string | null;
  onSelectJob: (jobId: string | null) => void;
}

export default function ClientApplicationsView({ jobId, onSelectJob }: Props) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { mine: jobs } = useAppSelector((s) => s.jobs);
  const { forJob, status } = useAppSelector((s) => s.applications);
  const [acceptTarget, setAcceptTarget] = useState<Application | null>(null);

  useEffect(() => {
    void dispatch(fetchMyJobs());
  }, [dispatch]);

  useEffect(() => {
    if (jobId) void dispatch(fetchApplicationsForJob(jobId));
  }, [dispatch, jobId]);

  const jobOptions = jobs.map((j) => ({ value: j.id, label: `${j.title} (${j.applicationsCount})` }));

  if (jobs.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">{t('applications.noJobsYet')}</Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Box sx={{ maxWidth: 420, mb: 3 }}>
        <FormSelectField
          label={t('applications.pickAJob')}
          value={jobId ?? ''}
          onChange={onSelectJob}
          options={jobOptions}
        />
      </Box>

      {jobId && status !== 'loading' && forJob.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{t('applications.noApplicants')}</Typography>
        </Paper>
      )}

      {jobId && (
        <Stack spacing={1.5}>
          {forJob.map((app) => (
            <Paper key={app.id} sx={{ p: 2.5 }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>
                    {t('applications.applicant')} #{app.seekerId.slice(0, 8)}
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
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    onClick={async () => {
                      await dispatch(shortlistApplication(app.id));
                      if (jobId) void dispatch(fetchApplicationsForJob(jobId));
                    }}
                  >
                    {t('applications.shortlist')}
                  </Button>
                  <Button size="small" color="error" onClick={async () => {
                    await dispatch(rejectApplication(app.id));
                    if (jobId) void dispatch(fetchApplicationsForJob(jobId));
                  }}>
                    {t('applications.reject')}
                  </Button>
                  <Button size="small" variant="contained" onClick={() => setAcceptTarget(app)}>
                    {t('applications.accept')}
                  </Button>
                </Stack>
              )}
              {app.status === 'SHORTLISTED' && (
                <Stack direction="row" spacing={1}>
                  <Button size="small" color="error" onClick={async () => {
                    await dispatch(rejectApplication(app.id));
                    if (jobId) void dispatch(fetchApplicationsForJob(jobId));
                  }}>
                    {t('applications.reject')}
                  </Button>
                  <Button size="small" variant="contained" onClick={() => setAcceptTarget(app)}>
                    {t('applications.accept')}
                  </Button>
                </Stack>
              )}
            </Paper>
          ))}
        </Stack>
      )}

      <ConfirmDialog
        open={!!acceptTarget}
        title={t('applications.acceptConfirmTitle')}
        message={t('applications.acceptConfirmBody')}
        confirmLabel={t('applications.accept')}
        onClose={() => setAcceptTarget(null)}
        onConfirm={async () => {
          if (acceptTarget) {
            await dispatch(acceptApplication(acceptTarget.id));
            if (jobId) void dispatch(fetchApplicationsForJob(jobId));
          }
          setAcceptTarget(null);
        }}
      />
    </Box>
  );
}
