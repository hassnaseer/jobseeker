import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Grid, Paper, Stack, Typography } from '@mui/material';
import FormTextField from '@/components/form/FormTextField';
import FormSelectField from '@/components/form/FormSelectField';
import StatusChip from '@/components/StatusChip';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchPublicJobs } from '@/features/jobs/actions';

export default function BrowseJobsPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { list, status } = useAppSelector((s) => s.jobs);
  const [keyword, setKeyword] = useState('');
  const [jobType, setJobType] = useState('');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'BUDGET_HIGH' | 'BUDGET_LOW'>('NEWEST');

  useEffect(() => {
    const timeout = setTimeout(() => {
      void dispatch(fetchPublicJobs({ keyword: keyword || undefined, jobType: jobType || undefined, sortBy }));
    }, 300);
    return () => clearTimeout(timeout);
  }, [dispatch, keyword, jobType, sortBy]);

  const jobTypeOptions = [
    { value: 'FIXED', label: t('jobs.jobTypeFixed') },
    { value: 'HOURLY', label: t('jobs.jobTypeHourly') },
  ];
  const sortOptions = [
    { value: 'NEWEST', label: t('jobs.sortNewest') },
    { value: 'BUDGET_HIGH', label: t('jobs.sortBudgetHigh') },
    { value: 'BUDGET_LOW', label: t('jobs.sortBudgetLow') },
  ];

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        {t('jobs.browseTitle')}
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 5 }}>
          <FormTextField label={t('jobs.keywordSearch')} value={keyword} onChange={setKeyword} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <FormSelectField label={t('jobs.jobType')} value={jobType} onChange={setJobType} options={jobTypeOptions} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4 }}>
          <FormSelectField
            label="Sort"
            value={sortBy}
            onChange={(v) => setSortBy(v as typeof sortBy)}
            options={sortOptions}
            allowEmpty={false}
          />
        </Grid>
      </Grid>

      {!status.match(/loading/) && list.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{t('jobs.noPublicJobs')}</Typography>
        </Paper>
      )}

      <Stack spacing={1.5}>
        {list.map((job) => (
          <Paper
            key={job.id}
            component={RouterLink}
            to={`/app/jobs/${job.id}`}
            sx={{
              p: 2.5,
              display: 'block',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'box-shadow 160ms ease',
              '&:hover': { boxShadow: '0 4px 16px rgba(30,20,80,0.08)' },
            }}
          >
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography sx={{ fontWeight: 700 }}>{job.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {job.jobType === 'FIXED'
                    ? job.budgetAmount != null
                      ? `${job.currency} ${job.budgetAmount}`
                      : t('jobs.jobTypeFixed')
                    : `${job.currency} ${job.hourlyRateMin ?? 0}-${job.hourlyRateMax ?? 0}/hr`}
                  {' · '}
                  {job.locationType === 'REMOTE' ? t('jobs.locationRemote') : t('jobs.locationPhysical')}
                </Typography>
              </Box>
              <StatusChip status={job.status} />
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}
