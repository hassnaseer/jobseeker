import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Box, Button, Grid } from '@mui/material';
import FormTextField from '@/components/form/FormTextField';
import { useAppDispatch } from '@/app/hooks';
import { saveClientProfile } from '@/features/profile/actions';
import { extractErrorMessage } from '@/api/client';
import type { UpdateClientProfileInput } from '@/api/profiles';
import type { ClientProfile } from '@/types/profile';

interface Props {
  initial: ClientProfile | null;
  onSaved?: () => void;
}

export default function ClientProfileForm({ initial, onSaved }: Props) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [form, setForm] = useState<UpdateClientProfileInput>({
    companyName: initial?.companyName ?? '',
    companyType: initial?.companyType ?? '',
    registrationNumber: initial?.registrationNumber ?? '',
    taxId: initial?.taxId ?? '',
    website: initial?.website ?? '',
    industry: initial?.industry ?? '',
    companySize: initial?.companySize ?? '',
    companyAddress: initial?.companyAddress ?? '',
    about: initial?.about ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof UpdateClientProfileInput) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const cleaned = { ...form, website: form.website ? form.website : undefined };
      await dispatch(saveClientProfile(cleaned));
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
        <Grid size={12}>
          <FormTextField label={t('profile.companyName')} value={form.companyName} onChange={set('companyName')} required />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField label={t('profile.companyType')} value={form.companyType ?? ''} onChange={set('companyType')} placeholder="e.g. LLC, Startup" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField label={t('profile.industry')} value={form.industry ?? ''} onChange={set('industry')} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField label={t('profile.registrationNumber')} value={form.registrationNumber ?? ''} onChange={set('registrationNumber')} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField label={t('profile.taxId')} value={form.taxId ?? ''} onChange={set('taxId')} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField label={t('profile.website')} value={form.website ?? ''} onChange={set('website')} placeholder="https://" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField label={t('profile.companySize')} value={form.companySize ?? ''} onChange={set('companySize')} placeholder="e.g. 11-50" />
        </Grid>
        <Grid size={12}>
          <FormTextField label={t('profile.companyAddress')} value={form.companyAddress ?? ''} onChange={set('companyAddress')} />
        </Grid>
        <Grid size={12}>
          <FormTextField label={t('profile.about')} value={form.about ?? ''} onChange={set('about')} multiline minRows={4} />
        </Grid>
      </Grid>
      <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ mt: 3 }}>
        {saving ? t('common.saving') : t('profile.saveCompany')}
      </Button>
    </Box>
  );
}
