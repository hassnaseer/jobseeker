import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Alert, Button, Stack, TextField, Typography } from '@mui/material';
import AuthLayout from '@/layouts/AuthLayout';
import { resendVerification } from '@/features/auth/actions';
import { extractErrorMessage } from '@/api/client';

export default function CheckEmailPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const [email, setEmail] = useState((location.state as { email?: string } | null)?.email ?? '');
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleResend = async () => {
    setError(null);
    try {
      await resendVerification(email);
      setStatus('sent');
    } catch (err) {
      setStatus('error');
      setError(extractErrorMessage(err));
    }
  };

  return (
    <AuthLayout>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        {t('auth.checkEmail.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('auth.checkEmail.subtitle')}
      </Typography>

      {status === 'sent' && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {t('auth.checkEmail.sent')}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={2}>
        <TextField
          label={t('auth.login.email')}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
        />
        <Button variant="outlined" onClick={handleResend} disabled={!email}>
          {t('auth.checkEmail.resend')}
        </Button>
      </Stack>
    </AuthLayout>
  );
}
