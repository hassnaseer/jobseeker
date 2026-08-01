import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Box, Button, Grid } from '@mui/material';
import FormTextField from '@/components/form/FormTextField';
import PhoneField from '@/components/form/PhoneField';
import { useAppDispatch } from '@/app/hooks';
import { saveBasicInfo } from '@/features/profile/actions';
import { extractErrorMessage } from '@/api/client';
import type { UpdateBasicInfoInput } from '@/api/profiles';
import type { BasicInfo } from '@/types/profile';

interface Props {
  initial: BasicInfo;
  onSaved?: () => void;
}

export default function BasicInfoForm({ initial, onSaved }: Props) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [form, setForm] = useState<UpdateBasicInfoInput>({
    firstName: initial.firstName ?? '',
    lastName: initial.lastName ?? '',
    phone: initial.phone ?? '',
    country: initial.country ?? '',
    city: initial.city ?? '',
    timezone: initial.timezone ?? '',
    language: initial.language ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof UpdateBasicInfoInput) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await dispatch(saveBasicInfo(form));
      onSaved?.();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField label={t('profile.firstName')} value={form.firstName ?? ''} onChange={set('firstName')} required />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField label={t('profile.lastName')} value={form.lastName ?? ''} onChange={set('lastName')} required />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <PhoneField label={t('profile.phone')} value={form.phone ?? ''} onChange={set('phone')} required />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField
            label={t('profile.country')}
            value={form.country ?? ''}
            onChange={set('country')}
            required
            slotProps={{ htmlInput: { maxLength: 2 } }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField label={t('profile.city')} value={form.city ?? ''} onChange={set('city')} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField label={t('profile.timezone')} value={form.timezone ?? ''} onChange={set('timezone')} placeholder="e.g. America/New_York" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField label={t('profile.language')} value={form.language ?? ''} onChange={set('language')} placeholder="e.g. en" />
        </Grid>
      </Grid>
      <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ mt: 3 }}>
        {saving ? t('common.saving') : t('common.save')}
      </Button>
    </Box>
  );
}
