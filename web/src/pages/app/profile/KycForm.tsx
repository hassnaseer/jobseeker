import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Box, Button, Grid } from '@mui/material';
import FormTextField from '@/components/form/FormTextField';
import FormSelectField from '@/components/form/FormSelectField';
import { useAppDispatch } from '@/app/hooks';
import { saveKyc } from '@/features/profile/actions';
import { extractErrorMessage } from '@/api/client';
import type { SubmitKycInput } from '@/api/profiles';
import type { Identity } from '@/types/profile';

interface Props {
  initial: Identity | null;
  onSaved?: () => void;
}

export default function KycForm({ initial, onSaved }: Props) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const locked = initial?.kycStatus === 'APPROVED';
  const [form, setForm] = useState<SubmitKycInput>({
    documentType: initial?.documentType ?? 'PASSPORT',
    documentNumber: initial?.documentNumber ?? '',
    frontUrl: initial?.frontUrl ?? '',
    backUrl: initial?.backUrl ?? '',
    selfieUrl: initial?.selfieUrl ?? '',
    dob: initial?.dob ?? '',
    addressLine1: initial?.addressLine1 ?? '',
    addressLine2: initial?.addressLine2 ?? '',
    postalCode: initial?.postalCode ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof SubmitKycInput) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  const documentTypeOptions = [
    { value: 'PASSPORT', label: t('profile.documentTypePassport') },
    { value: 'NATIONAL_ID', label: t('profile.documentTypeNationalId') },
    { value: 'DRIVERS_LICENSE', label: t('profile.documentTypeDriversLicense') },
  ];

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await dispatch(saveKyc(form));
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
      {locked && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {t('profile.identityLocked')}
        </Alert>
      )}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormSelectField
            label={t('profile.documentType')}
            value={form.documentType}
            onChange={set('documentType')}
            options={documentTypeOptions}
            allowEmpty={false}
            disabled={locked}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField label={t('profile.documentNumber')} value={form.documentNumber} onChange={set('documentNumber')} disabled={locked} required />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField
            label={t('profile.dob')}
            type="date"
            value={form.dob}
            onChange={set('dob')}
            disabled={locked}
            required
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField label={t('profile.postalCode')} value={form.postalCode} onChange={set('postalCode')} disabled={locked} required />
        </Grid>
        <Grid size={12}>
          <FormTextField label={t('profile.addressLine1')} value={form.addressLine1} onChange={set('addressLine1')} disabled={locked} required />
        </Grid>
        <Grid size={12}>
          <FormTextField label={t('profile.addressLine2')} value={form.addressLine2 ?? ''} onChange={set('addressLine2')} disabled={locked} />
        </Grid>
        <Grid size={12}>
          <FormTextField
            label={t('profile.frontUrl')}
            value={form.frontUrl}
            onChange={set('frontUrl')}
            disabled={locked}
            required
            helperText={t('profile.frontUrlHelper')}
          />
        </Grid>
        <Grid size={12}>
          <FormTextField label={t('profile.backUrl')} value={form.backUrl ?? ''} onChange={set('backUrl')} disabled={locked} />
        </Grid>
        <Grid size={12}>
          <FormTextField label={t('profile.selfieUrl')} value={form.selfieUrl} onChange={set('selfieUrl')} disabled={locked} required />
        </Grid>
      </Grid>
      {!locked && (
        <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ mt: 3 }}>
          {saving ? t('common.saving') : t('profile.saveIdentity')}
        </Button>
      )}
    </Box>
  );
}
