import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Box, Button, Paper, Stack, Typography } from '@mui/material';
import FormTextField from '@/components/form/FormTextField';
import FormSelectField from '@/components/form/FormSelectField';
import { extractErrorMessage } from '@/api/client';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchPlatformConfig, updatePlatformConfig } from '@/features/admin/actions';

export default function AdminConfigPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const config = useAppSelector((s) => s.admin.config);
  const [form, setForm] = useState({
    clientCommissionPct: '',
    seekerCommissionPct: '',
    autoApproveHoursDays: '',
    escrowAutoReleaseDays: '',
    minWithdrawal: '',
    baseCurrency: '',
    featuredJobPrice: '',
    aiAutonomyLevel: 'SHORTLIST',
    aiProvider: '',
    aiModel: '',
    aiMonthlySpendCap: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void dispatch(fetchPlatformConfig());
  }, [dispatch]);

  useEffect(() => {
    if (config) {
      setForm({
        clientCommissionPct: String(config.clientCommissionPct),
        seekerCommissionPct: String(config.seekerCommissionPct),
        autoApproveHoursDays: String(config.autoApproveHoursDays),
        escrowAutoReleaseDays: String(config.escrowAutoReleaseDays),
        minWithdrawal: String(config.minWithdrawal),
        baseCurrency: config.baseCurrency,
        featuredJobPrice: String(config.featuredJobPrice),
        aiAutonomyLevel: config.aiAutonomyLevel,
        aiProvider: config.aiProvider ?? '',
        aiModel: config.aiModel ?? '',
        aiMonthlySpendCap: config.aiMonthlySpendCap != null ? String(config.aiMonthlySpendCap) : '',
      });
    }
  }, [config]);

  const handleSave = async () => {
    setError(null);
    setSaved(false);
    try {
      await dispatch(
        updatePlatformConfig({
          clientCommissionPct: Number(form.clientCommissionPct),
          seekerCommissionPct: Number(form.seekerCommissionPct),
          autoApproveHoursDays: Number(form.autoApproveHoursDays),
          escrowAutoReleaseDays: Number(form.escrowAutoReleaseDays),
          minWithdrawal: Number(form.minWithdrawal),
          baseCurrency: form.baseCurrency,
          featuredJobPrice: Number(form.featuredJobPrice),
          aiAutonomyLevel: form.aiAutonomyLevel as never,
          aiProvider: form.aiProvider || undefined,
          aiModel: form.aiModel || undefined,
          aiMonthlySpendCap: form.aiMonthlySpendCap ? Number(form.aiMonthlySpendCap) : undefined,
        }),
      );
      setSaved(true);
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  if (!config) return null;

  return (
    <Box sx={{ maxWidth: 560 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        {t('admin.configTitle')}
      </Typography>

      <Paper sx={{ p: 4 }}>
        <Stack spacing={2.5}>
          {error && <Alert severity="error">{error}</Alert>}
          {saved && <Alert severity="success">{t('common.save')} ✓</Alert>}
          <FormTextField
            label={t('admin.clientCommissionPct')}
            type="number"
            value={form.clientCommissionPct}
            onChange={(v) => setForm((f) => ({ ...f, clientCommissionPct: v }))}
          />
          <FormTextField
            label={t('admin.seekerCommissionPct')}
            type="number"
            value={form.seekerCommissionPct}
            onChange={(v) => setForm((f) => ({ ...f, seekerCommissionPct: v }))}
          />
          <FormTextField
            label={t('admin.autoApproveHoursDays')}
            type="number"
            value={form.autoApproveHoursDays}
            onChange={(v) => setForm((f) => ({ ...f, autoApproveHoursDays: v }))}
          />
          <FormTextField
            label={t('admin.escrowAutoReleaseDays')}
            type="number"
            value={form.escrowAutoReleaseDays}
            onChange={(v) => setForm((f) => ({ ...f, escrowAutoReleaseDays: v }))}
          />
          <FormTextField
            label={t('admin.minWithdrawal')}
            type="number"
            value={form.minWithdrawal}
            onChange={(v) => setForm((f) => ({ ...f, minWithdrawal: v }))}
          />
          <FormTextField
            label={t('admin.baseCurrency')}
            value={form.baseCurrency}
            onChange={(v) => setForm((f) => ({ ...f, baseCurrency: v }))}
          />
          <FormTextField
            label={t('admin.featuredJobPrice')}
            type="number"
            value={form.featuredJobPrice}
            onChange={(v) => setForm((f) => ({ ...f, featuredJobPrice: v }))}
          />
          <FormSelectField
            label={t('admin.aiAutonomyLevel')}
            value={form.aiAutonomyLevel}
            onChange={(v) => setForm((f) => ({ ...f, aiAutonomyLevel: v }))}
            allowEmpty={false}
            options={[
              { value: 'ASSIST', label: 'ASSIST' },
              { value: 'SHORTLIST', label: 'SHORTLIST' },
              { value: 'AUTO', label: 'AUTO' },
            ]}
          />
          <FormSelectField
            label={t('admin.aiProvider')}
            value={form.aiProvider}
            onChange={(v) => setForm((f) => ({ ...f, aiProvider: v }))}
            emptyLabel={t('admin.aiProviderHeuristic')}
            options={[{ value: 'anthropic', label: 'Anthropic (Claude)' }]}
            helperText={t('admin.aiProviderHelp')}
          />
          {form.aiProvider === 'anthropic' && (
            <FormTextField
              label={t('admin.aiModel')}
              value={form.aiModel}
              onChange={(v) => setForm((f) => ({ ...f, aiModel: v }))}
              placeholder="claude-sonnet-4-5"
              helperText={t('admin.aiModelHelp')}
            />
          )}
          <FormTextField
            label={t('admin.aiMonthlySpendCap')}
            type="number"
            value={form.aiMonthlySpendCap}
            onChange={(v) => setForm((f) => ({ ...f, aiMonthlySpendCap: v }))}
          />
          <Button variant="contained" onClick={() => void handleSave()} sx={{ alignSelf: 'flex-start' }}>
            {t('admin.saveConfig')}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
