import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Chip, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBackOutlined';
import StatusChip from '@/components/StatusChip';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchJobDetail } from '@/features/jobs/actions';
import ApplyToJobModal from './ApplyToJobModal';

export default function JobDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const { detail, status } = useAppSelector((s) => s.jobs);
  const [applyOpen, setApplyOpen] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    if (id) void dispatch(fetchJobDetail(id));
  }, [dispatch, id]);

  if (status === 'loading' || !detail) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const isOwner = user?.id === detail.clientId;
  const isSeeker = user?.activeRole === 'SEEKER';

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        {t('jobs.backToJobs')}
      </Button>

      <Paper sx={{ p: 4 }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {detail.title}
          </Typography>
          <StatusChip status={detail.status} />
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
          <Chip
            label={
              detail.jobType === 'FIXED'
                ? detail.budgetAmount != null
                  ? `${detail.currency} ${detail.budgetAmount}`
                  : t('jobs.jobTypeFixed')
                : `${detail.currency} ${detail.hourlyRateMin ?? 0}-${detail.hourlyRateMax ?? 0}/hr`
            }
            size="small"
          />
          <Chip label={detail.locationType === 'REMOTE' ? t('jobs.locationRemote') : t('jobs.locationPhysical')} size="small" />
          {detail.experienceLevel && <Chip label={detail.experienceLevel} size="small" />}
        </Stack>

        <Typography sx={{ whiteSpace: 'pre-wrap', mb: 3 }}>{detail.description}</Typography>

        {detail.skillsRequired.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {detail.skillsRequired.map((skill) => (
              <Chip key={skill} label={skill} size="small" variant="outlined" />
            ))}
          </Stack>
        )}

        {isOwner && (
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={() => navigate(`/app/jobs/${detail.id}/edit`)}>
              {t('jobs.edit')}
            </Button>
            <Button
              variant="contained"
              component={RouterLink}
              to={`/app/applications?jobId=${detail.id}`}
            >
              {t('applications.overviewTitle')} ({detail.applicationsCount})
            </Button>
          </Stack>
        )}

        {!isOwner && isSeeker && detail.status === 'OPEN' && (
          <Button variant="contained" disabled={applied} onClick={() => setApplyOpen(true)}>
            {applied ? t('jobs.alreadyApplied') : t('jobs.apply')}
          </Button>
        )}
      </Paper>

      <ApplyToJobModal
        job={detail}
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        onApplied={() => {
          setApplyOpen(false);
          setApplied(true);
        }}
      />
    </Box>
  );
}
