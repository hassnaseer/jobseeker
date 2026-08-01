import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, IconButton, Paper, Stack, Typography } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import AddIcon from '@mui/icons-material/Add';
import Modal from '@/components/feedback/Modal';
import FormTextField from '@/components/form/FormTextField';
import { getJobDetail } from '@/api/jobs';
import { hire, type MilestoneInput } from '@/api/contracts';
import { extractErrorMessage } from '@/api/client';
import type { Application, Job } from '@/types/domain';

interface Props {
  application: Application | null;
  onClose: () => void;
}

export default function HireModal({ application, onClose }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [milestones, setMilestones] = useState<MilestoneInput[]>([]);
  const [weeklyHourLimit, setWeeklyHourLimit] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (application) {
      setJob(null);
      setMilestones([]);
      setError(null);
      void getJobDetail(application.jobId).then(setJob).catch(() => undefined);
    }
  }, [application]);

  const needsMilestones = job?.jobType === 'FIXED' && job.pricingModel === 'MILESTONE';
  const isHourly = job?.jobType === 'HOURLY';

  const handleHire = async () => {
    if (!application) return;
    setSaving(true);
    setError(null);
    try {
      const contract = await hire(application.id, {
        milestones: needsMilestones ? milestones : undefined,
        weeklyHourLimit: isHourly && weeklyHourLimit ? Number(weeklyHourLimit) : undefined,
      });
      onClose();
      navigate(`/app/contracts/${contract.id}`);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const milestonesTotal = milestones.reduce((sum, m) => sum + (m.amount || 0), 0);
  const canHire = !needsMilestones || (milestones.length > 0 && milestones.every((m) => m.title && m.amount > 0));

  return (
    <Modal
      open={!!application}
      onClose={onClose}
      title={t('applications.hire')}
      actions={
        <Button variant="contained" onClick={handleHire} disabled={saving || !job || !canHire}>
          {t('applications.hire')}
        </Button>
      }
    >
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}

        {needsMilestones && (
          <Stack spacing={1.5}>
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ fontWeight: 700 }}>{t('contracts.milestones')}</Typography>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setMilestones((m) => [...m, { title: '', amount: 0 }])}
              >
                {t('common.add')}
              </Button>
            </Stack>
            {milestones.map((m, i) => (
              <Paper key={i} variant="outlined" sx={{ p: 1.5, position: 'relative' }}>
                <IconButton
                  size="small"
                  onClick={() => setMilestones((list) => list.filter((_, idx) => idx !== i))}
                  sx={{ position: 'absolute', top: 6, right: 6 }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
                <Stack spacing={1}>
                  <FormTextField
                    label={t('jobs.title')}
                    value={m.title}
                    onChange={(v) =>
                      setMilestones((list) => list.map((x, idx) => (idx === i ? { ...x, title: v } : x)))
                    }
                    size="small"
                  />
                  <FormTextField
                    label={t('catalogs.price')}
                    type="number"
                    value={m.amount}
                    onChange={(v) =>
                      setMilestones((list) => list.map((x, idx) => (idx === i ? { ...x, amount: Number(v) } : x)))
                    }
                    size="small"
                  />
                </Stack>
              </Paper>
            ))}
            {milestones.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                Total: {job?.currency} {milestonesTotal}
              </Typography>
            )}
          </Stack>
        )}

        {isHourly && (
          <FormTextField
            label={t('jobs.estimatedHours')}
            type="number"
            value={weeklyHourLimit}
            onChange={setWeeklyHourLimit}
            helperText="Weekly hour limit (optional)"
          />
        )}

        {!needsMilestones && !isHourly && job && (
          <Typography color="text.secondary">
            {job.currency} {job.budgetAmount} — {t('jobs.pricingModelLump')}
          </Typography>
        )}
      </Stack>
    </Modal>
  );
}
