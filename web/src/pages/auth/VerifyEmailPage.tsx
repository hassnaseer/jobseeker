import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { Alert, Button, CircularProgress, Stack, Typography } from '@mui/material';
import AuthLayout from '@/layouts/AuthLayout';
import { verifyEmail } from '@/features/auth/actions';
import { extractErrorMessage } from '@/api/client';

export default function VerifyEmailPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError(t('auth.verifyEmail.missingToken'));
      return;
    }
    verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus('error');
        setError(extractErrorMessage(err));
      });
  }, [token, t]);

  return (
    <AuthLayout>
      {status === 'verifying' && (
        <Stack sx={{ alignItems: 'center', py: 2 }} spacing={2}>
          <CircularProgress />
          <Typography color="text.secondary">{t('auth.verifyEmail.verifying')}</Typography>
        </Stack>
      )}
      {status === 'success' && (
        <Stack spacing={2}>
          <Alert severity="success">{t('auth.verifyEmail.success')}</Alert>
          <Button component={RouterLink} to="/login" variant="contained">
            {t('auth.verifyEmail.signIn')}
          </Button>
        </Stack>
      )}
      {status === 'error' && (
        <Stack spacing={2}>
          <Alert severity="error">{error}</Alert>
          <Button component={RouterLink} to="/check-email" variant="outlined">
            {t('auth.verifyEmail.resend')}
          </Button>
        </Stack>
      )}
    </AuthLayout>
  );
}
