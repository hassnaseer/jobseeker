import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Link, Stack, TextField, Typography } from '@mui/material';
import AuthLayout from '@/layouts/AuthLayout';
import { useAppDispatch } from '@/app/hooks';
import { login } from '@/features/auth/actions';
import { extractErrorMessage } from '@/api/client';

export default function LoginPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await dispatch(login(email, password));
      const redirectTo = (location.state as { from?: string } | null)?.from ?? '/app';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        {t('auth.login.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3.5 }}>
        {t('auth.login.subtitle')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            label={t('auth.login.email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label={t('auth.login.password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Link component={RouterLink} to="/forgot-password" variant="body2" sx={{ fontWeight: 500 }}>
              {t('auth.login.forgotPassword')}
            </Link>
          </Box>
          <Button type="submit" variant="contained" size="large" disabled={submitting} fullWidth>
            {submitting ? t('auth.login.submitting') : t('auth.login.submit')}
          </Button>
        </Stack>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2.75 }}>
        {t('auth.login.noAccount')}{' '}
        <Link component={RouterLink} to="/signup" sx={{ fontWeight: 600 }}>
          {t('auth.login.createOne')}
        </Link>
      </Typography>
    </AuthLayout>
  );
}
