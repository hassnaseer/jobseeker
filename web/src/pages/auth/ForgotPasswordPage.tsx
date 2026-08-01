import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { Alert, Button, Link, Stack, TextField, Typography } from '@mui/material';
import AuthLayout from '@/layouts/AuthLayout';
import { forgotPassword } from '@/features/auth/actions';
import { extractErrorMessage } from '@/api/client';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        {t('auth.forgotPassword.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('auth.forgotPassword.subtitle')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {sent && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {t('auth.forgotPassword.sent')}
        </Alert>
      )}

      <Stack component="form" onSubmit={handleSubmit} spacing={2}>
        <TextField
          label={t('auth.login.email')}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
        />
        <Button type="submit" variant="contained" size="large" disabled={submitting} fullWidth>
          {submitting ? t('auth.forgotPassword.submitting') : t('auth.forgotPassword.submit')}
        </Button>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2.25 }}>
        <Link component={RouterLink} to="/login" sx={{ fontWeight: 600 }}>
          {t('auth.forgotPassword.backToSignIn')}
        </Link>
      </Typography>
    </AuthLayout>
  );
}
