import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Alert, Button, Stack, TextField, Typography } from '@mui/material';
import AuthLayout from '@/layouts/AuthLayout';
import { resendVerification } from '@/features/auth/actions';
import { extractErrorMessage } from '@/api/client';

export default function CheckEmailPage() {
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
        Check your email
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        We sent a verification link to your inbox. Click it to activate your account, then sign in.
      </Typography>

      {status === 'sent' && <Alert severity="success" sx={{ mb: 2 }}>Verification email sent.</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Stack spacing={2}>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
        />
        <Button variant="outlined" onClick={handleResend} disabled={!email}>
          Resend verification email
        </Button>
      </Stack>
    </AuthLayout>
  );
}
