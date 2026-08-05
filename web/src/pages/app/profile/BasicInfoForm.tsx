import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Avatar, Box, Button, Grid, Stack, Typography } from '@mui/material';
import FormTextField from '@/components/form/FormTextField';
import PhoneField from '@/components/form/PhoneField';
import { useAppDispatch } from '@/app/hooks';
import { saveBasicInfo } from '@/features/profile/actions';
import { fetchMe } from '@/features/auth/actions';
import { extractErrorMessage } from '@/api/client';
import { uploadAvatar } from '@/api/users';
import type { UpdateBasicInfoInput } from '@/api/profiles';
import type { BasicInfo } from '@/types/profile';

interface Props {
  initial: BasicInfo;
  onSaved?: () => void;
}

export default function BasicInfoForm({ initial, onSaved }: Props) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
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

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    setError(null);
    try {
      const { avatarUrl: newUrl } = await uploadAvatar(file);
      setAvatarUrl(newUrl);
      void dispatch(fetchMe());
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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

      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 3 }}>
        <Avatar src={avatarUrl ?? undefined} sx={{ width: 64, height: 64 }}>
          {form.firstName?.[0] ?? ''}
        </Avatar>
        <Box>
          <Button variant="outlined" size="small" onClick={() => fileInputRef.current?.click()} disabled={uploadingAvatar}>
            {uploadingAvatar ? t('common.saving') : t('profile.changePhoto')}
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {t('profile.photoHint')}
          </Typography>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            hidden
            onChange={handleAvatarChange}
          />
        </Box>
      </Stack>

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
