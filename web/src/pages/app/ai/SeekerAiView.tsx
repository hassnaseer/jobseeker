import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Paper, Stack, Typography } from '@mui/material';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchRecommendedJobs } from '@/features/ai/actions';
import ScoreChip from './ScoreChip';

export default function SeekerAiView() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { recommendedJobs, status, error } = useAppSelector((s) => s.ai);

  useEffect(() => {
    void dispatch(fetchRecommendedJobs());
  }, [dispatch]);

  return (
    <Box>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 3 }}>
        <AutoAwesomeOutlinedIcon color="primary" />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {t('ai.recommendedTitle')}
        </Typography>
      </Stack>

      {error && (
        <Paper sx={{ p: 3, mb: 2, borderColor: 'error.main' }} variant="outlined">
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      {status !== 'loading' && recommendedJobs.length === 0 && !error && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{t('ai.noRecommendations')}</Typography>
        </Paper>
      )}

      <Stack spacing={1.5}>
        {recommendedJobs.map(({ job, score, reasons }) => (
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
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Box>
                <Typography sx={{ fontWeight: 700 }}>{job.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {job.jobType === 'FIXED'
                    ? `${job.currency} ${job.budgetAmount}`
                    : `${job.currency} ${job.hourlyRateMin}–${job.hourlyRateMax}/hr`}
                </Typography>
              </Box>
              <ScoreChip score={score} />
            </Stack>
            <Stack spacing={0.5}>
              {reasons.map((reason, i) => (
                <Typography key={i} variant="body2" color="text.secondary">
                  &bull; {reason}
                </Typography>
              ))}
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}
