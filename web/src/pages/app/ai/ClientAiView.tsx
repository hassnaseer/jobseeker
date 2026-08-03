import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import FormSelectField from '@/components/form/FormSelectField';
import { extractErrorMessage } from '@/api/client';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchMyJobs } from '@/features/jobs/actions';
import { fetchMatchScores, runShortlist } from '@/features/ai/actions';
import ScoreChip from './ScoreChip';

export default function ClientAiView() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { mine: jobs } = useAppSelector((s) => s.jobs);
  const { shortlistResult, matchScores, status } = useAppSelector((s) => s.ai);
  const [jobId, setJobId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [ran, setRan] = useState(false);

  useEffect(() => {
    void dispatch(fetchMyJobs());
  }, [dispatch]);

  useEffect(() => {
    setRan(false);
    if (jobId) void dispatch(fetchMatchScores(jobId));
  }, [dispatch, jobId]);

  const handleRun = async () => {
    if (!jobId) return;
    setError(null);
    try {
      await dispatch(runShortlist(jobId));
      setRan(true);
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const jobOptions = jobs.map((j) => ({ value: j.id, label: `${j.title} (${j.applicationsCount})` }));

  return (
    <Box>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 3 }}>
        <AutoAwesomeOutlinedIcon color="primary" />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {t('ai.shortlistTitle')}
        </Typography>
      </Stack>

      {jobs.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{t('applications.noJobsYet')}</Typography>
        </Paper>
      )}

      {jobs.length > 0 && (
        <>
          <Stack direction="row" spacing={2} sx={{ mb: 3, alignItems: 'flex-start' }}>
            <Box sx={{ maxWidth: 420, flex: 1 }}>
              <FormSelectField
                label={t('applications.pickAJob')}
                value={jobId}
                onChange={setJobId}
                options={jobOptions}
              />
            </Box>
            <Button
              variant="contained"
              disabled={!jobId || status === 'saving'}
              onClick={() => void handleRun()}
              sx={{ mt: 0.25 }}
            >
              {t('ai.runShortlist')}
            </Button>
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {ran && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('ai.shortlistRanNote')}
            </Typography>
          )}

          {jobId && ran && shortlistResult.length === 0 && (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">{t('ai.noCandidates')}</Typography>
            </Paper>
          )}

          {ran && (
            <Stack spacing={1.5}>
              {shortlistResult.map((result) => (
                <Paper key={result.applicationId} sx={{ p: 2.5 }}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box>
                      <Typography sx={{ fontWeight: 700 }}>
                        {t('applications.applicant')} #{result.seekerId.slice(0, 8)}
                      </Typography>
                      {result.autoShortlisted && (
                        <Chip label={t('ai.autoShortlisted')} size="small" color="success" sx={{ mt: 0.5 }} />
                      )}
                    </Box>
                    <ScoreChip score={result.score} />
                  </Stack>
                  <Stack spacing={0.5}>
                    {result.reasons.map((reason, i) => (
                      <Typography key={i} variant="body2" color="text.secondary">
                        &bull; {reason}
                      </Typography>
                    ))}
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}

          {jobId && !ran && matchScores.length > 0 && (
            <>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
                {t('ai.previousScores')}
              </Typography>
              <Stack spacing={1.5}>
                {matchScores.map((result) => (
                  <Paper key={result.id} sx={{ p: 2.5 }}>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ fontWeight: 700 }}>
                        {t('applications.applicant')} #{result.seekerId.slice(0, 8)}
                      </Typography>
                      <ScoreChip score={result.score} />
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </>
          )}
        </>
      )}
    </Box>
  );
}
