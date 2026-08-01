import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Box, Button, Grid, Paper, Stack, Typography } from '@mui/material';
import StatusChip from '@/components/StatusChip';
import ConfirmDialog from '@/components/feedback/ConfirmDialog';
import FormTextField from '@/components/form/FormTextField';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  approveTimesheetPeriod,
  closeTimesheetPeriod,
  fetchTimesheet,
  logManualTime,
} from '@/features/timesheets/actions';
import { activateHourlyContract, completeHourlyContract } from '@/features/contracts/actions';
import { extractErrorMessage } from '@/api/client';
import type { Contract, TimesheetPeriod } from '@/types/domain';

interface Props {
  contract: Contract;
  isOwner: boolean;
  isSeeker: boolean;
}

export default function HourlyContractSection({ contract, isOwner, isSeeker }: Props) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { entries, periods } = useAppSelector((s) => s.timesheets);
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activateConfirm, setActivateConfirm] = useState(false);
  const [completeConfirm, setCompleteConfirm] = useState(false);
  const [approveTarget, setApproveTarget] = useState<TimesheetPeriod | null>(null);

  useEffect(() => {
    void dispatch(fetchTimesheet(contract.id));
  }, [dispatch, contract.id]);

  const run = async (action: () => Promise<void>) => {
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const handleLogTime = async () => {
    await run(async () => {
      await dispatch(logManualTime(contract.id, { hours: Number(hours), description, date: date || undefined }));
    });
    setHours('');
    setDescription('');
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {contract.status === 'PENDING_FUNDING' && isOwner && (
        <Button variant="contained" onClick={() => setActivateConfirm(true)} sx={{ mb: 3 }}>
          {t('contracts.activate')}
        </Button>
      )}

      {contract.status === 'ACTIVE' && isSeeker && (
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Typography sx={{ fontWeight: 700, mb: 1.5 }}>{t('contracts.logTime')}</Typography>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <FormTextField label={t('contracts.hours')} type="number" value={hours} onChange={setHours} size="small" />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <FormTextField
                label={t('contracts.date')}
                type="date"
                value={date}
                onChange={setDate}
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField label={t('contracts.description')} value={description} onChange={setDescription} size="small" />
            </Grid>
          </Grid>
          <Button variant="contained" size="small" onClick={handleLogTime} disabled={!hours || !description} sx={{ mt: 1.5 }}>
            {t('contracts.logTime')}
          </Button>
        </Paper>
      )}

      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
        {t('contracts.periods')}
      </Typography>
      <Stack spacing={1.5} sx={{ mb: 3 }}>
        {periods.length === 0 && <Typography color="text.secondary">{t('contracts.noEntries')}</Typography>}
        {periods.map((p) => (
          <Paper key={p.id} variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography sx={{ fontWeight: 700 }}>
                {p.periodStart} – {p.periodEnd}
              </Typography>
              <StatusChip status={p.status} />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              {t('contracts.totalHours')}: {p.totalHours} · {t('contracts.totalAmount')}: {p.currency} {p.totalAmount}
            </Typography>
            {p.status === 'OPEN' && isSeeker && (
              <Button
                size="small"
                onClick={() =>
                  run(async () => {
                    await dispatch(closeTimesheetPeriod(contract.id, p.id));
                  })
                }
              >
                {t('contracts.closePeriod')}
              </Button>
            )}
            {p.status === 'CLOSED' && isOwner && (
              <Button size="small" variant="contained" onClick={() => setApproveTarget(p)}>
                {t('contracts.approvePeriod')}
              </Button>
            )}
          </Paper>
        ))}
      </Stack>

      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
        {t('contracts.entries')}
      </Typography>
      <Stack spacing={1}>
        {entries.map((entry) => (
          <Paper key={entry.id} variant="outlined" sx={{ p: 1.5 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">
                {entry.hours}h — {entry.description}
              </Typography>
              <StatusChip status={entry.status} size="small" />
            </Stack>
          </Paper>
        ))}
      </Stack>

      {contract.status === 'ACTIVE' && isOwner && (
        <Button color="error" onClick={() => setCompleteConfirm(true)} sx={{ mt: 3 }}>
          {t('contracts.completeContract')}
        </Button>
      )}

      <ConfirmDialog
        open={activateConfirm}
        title={t('contracts.activateConfirmTitle')}
        message={t('contracts.activateConfirmBody')}
        confirmLabel={t('contracts.activate')}
        onClose={() => setActivateConfirm(false)}
        onConfirm={async () => {
          await run(async () => {
            await dispatch(activateHourlyContract(contract.id));
          });
          setActivateConfirm(false);
        }}
      />
      <ConfirmDialog
        open={completeConfirm}
        title={t('contracts.completeConfirmTitle')}
        message={t('contracts.completeConfirmBody')}
        confirmLabel={t('contracts.completeContract')}
        destructive
        onClose={() => setCompleteConfirm(false)}
        onConfirm={async () => {
          await run(async () => {
            await dispatch(completeHourlyContract(contract.id));
          });
          setCompleteConfirm(false);
        }}
      />
      <ConfirmDialog
        open={!!approveTarget}
        title={t('contracts.approvePeriodConfirmTitle')}
        message={t('contracts.approvePeriodConfirmBody')}
        confirmLabel={t('contracts.approvePeriod')}
        onClose={() => setApproveTarget(null)}
        onConfirm={async () => {
          if (approveTarget) {
            await run(async () => {
              await dispatch(approveTimesheetPeriod(contract.id, approveTarget.id));
            });
          }
          setApproveTarget(null);
        }}
      />
    </Box>
  );
}
