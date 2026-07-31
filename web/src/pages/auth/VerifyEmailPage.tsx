import { useEffect, useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { Alert, Button, CircularProgress, Stack, Typography } from '@mui/material';
import AuthLayout from '@/layouts/AuthLayout';
import { verifyEmail } from '@/features/auth/actions';
import { extractErrorMessage } from '@/api/client';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('Missing verification token.');
      return;
    }
    verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus('error');
        setError(extractErrorMessage(err));
      });
  }, [token]);

  return (
    <AuthLayout>
      {status === 'verifying' && (
        <Stack spacing={2} sx={{ alignItems: 'center', py: 2 }}>
          <CircularProgress />
          <Typography color="text.secondary">Verifying your email…</Typography>
        </Stack>
      )}
      {status === 'success' && (
        <Stack spacing={2}>
          <Alert severity="success">Your email has been verified.</Alert>
          <Button component={RouterLink} to="/login" variant="contained">
            Sign in
          </Button>
        </Stack>
      )}
      {status === 'error' && (
        <Stack spacing={2}>
          <Alert severity="error">{error}</Alert>
          <Button component={RouterLink} to="/check-email" variant="outlined">
            Resend verification email
          </Button>
        </Stack>
      )}
    </AuthLayout>
  );
}
