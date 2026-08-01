import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchPublicJobs } from '@/features/jobs/actions';

export default function RecentJobsSection() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const jobs = useAppSelector((s) => s.jobs.list);

  useEffect(() => {
    void dispatch(fetchPublicJobs({ sortBy: 'NEWEST', limit: 6 }));
  }, [dispatch]);

  if (jobs.length === 0) return null;

  return (
    <Box id="jobs" sx={{ maxWidth: 1160, mx: 'auto', px: 3, py: 10 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, textAlign: 'center', mb: 1 }}>
        {t('landing.jobs.title')}
      </Typography>
      <Typography color="text.secondary" sx={{ textAlign: 'center', mb: 5 }}>
        {t('landing.jobs.subtitle')}
      </Typography>
      <Stack spacing={1.5}>
        {jobs.slice(0, 6).map((job) => (
          <Paper key={job.id} sx={{ p: 2.5 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography sx={{ fontWeight: 700 }}>{job.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {job.jobType === 'FIXED'
                    ? `${job.currency} ${job.budgetAmount}`
                    : `${job.currency} ${job.hourlyRateMin}–${job.hourlyRateMax}/hr`}
                </Typography>
              </Box>
              <Chip label={job.jobType} size="small" variant="outlined" />
            </Stack>
          </Paper>
        ))}
      </Stack>
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button component={RouterLink} to="/signup" variant="outlined" size="large">
          {t('landing.jobs.viewAll')}
        </Button>
      </Box>
    </Box>
  );
}
