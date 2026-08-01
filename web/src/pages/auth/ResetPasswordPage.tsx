import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, Button, Link, Stack, TextField, Typography } from '@mui/material';
import AuthLayout from '@/layouts/AuthLayout';
import { resetPassword } from '@/features/auth/actions';
import { extractErrorMessage } from '@/api/client';

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await resetPassword(token, password, confirmPassword);
      navigate('/login', { state: { resetSuccess: true } });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        {t('auth.resetPassword.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('auth.resetPassword.subtitle')}
      </Typography>

      {!token && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t('auth.resetPassword.missingToken')}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack component="form" onSubmit={handleSubmit} spacing={2}>
        <TextField
          label={t('auth.resetPassword.newPassword')}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
        />
        <TextField
          label={t('auth.resetPassword.confirmPassword')}
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          fullWidth
        />
        <Button type="submit" variant="contained" size="large" disabled={submitting || !token} fullWidth>
          {submitting ? t('auth.resetPassword.submitting') : t('auth.resetPassword.submit')}
        </Button>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2.25 }}>
        <Link component={RouterLink} to="/login" sx={{ fontWeight: 600 }}>
          {t('auth.resetPassword.backToSignIn')}
        </Link>
      </Typography>
    </AuthLayout>
  );
}
