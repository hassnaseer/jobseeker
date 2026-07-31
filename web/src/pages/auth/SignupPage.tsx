import { useState, type FormEvent } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AuthLayout from '@/layouts/AuthLayout';
import { signup } from '@/features/auth/actions';
import { extractErrorMessage } from '@/api/client';

const ROLES = [
  { key: 'CLIENT' as const, title: "I'm hiring — Client", subtitle: 'Post jobs, fund escrow, hire talent' },
  { key: 'SEEKER' as const, title: "I'm working — Job Seeker", subtitle: 'Apply, work, get paid' },
];

const TOS_VERSION = '1.0';

export default function SignupPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<'CLIENT' | 'SEEKER'>('CLIENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tosAccepted, setTosAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!tosAccepted) {
      setError('You must accept the Terms of Service to sign up');
      return;
    }
    setSubmitting(true);
    try {
      await signup({
        email,
        password,
        confirmPassword,
        role,
        tosVersion: TOS_VERSION,
        tosAccepted,
      });
      navigate('/check-email', { state: { email } });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout maxWidth={440}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Join JobLinxs
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Pick how you'll use the platform. You can enable both later from Settings.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={1.5} sx={{ mb: 2.5 }}>
          {ROLES.map((r) => (
            <Box
              key={r.key}
              onClick={() => setRole(r.key)}
              sx={{
                p: 2,
                borderRadius: 3.5,
                border: '2px solid',
                borderColor: role === r.key ? 'primary.main' : 'divider',
                bgcolor: role === r.key ? 'rgba(91,95,239,0.06)' : 'transparent',
                cursor: 'pointer',
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: 15 }}>
                {r.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                {r.subtitle}
              </Typography>
            </Box>
          ))}
        </Stack>

        <Stack spacing={2}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            helperText="At least 8 characters, with upper, lower, and a number"
          />
          <TextField
            label="Confirm password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            fullWidth
          />
        </Stack>

        <FormControlLabel
          sx={{ mt: 1.5, alignItems: 'flex-start' }}
          control={
            <Checkbox
              checked={tosAccepted}
              onChange={(e) => setTosAccepted(e.target.checked)}
              sx={{ mt: -0.75 }}
            />
          }
          label={
            <Typography variant="body2" color="text.secondary">
              I agree to the Terms of Service and Privacy Policy
            </Typography>
          }
        />

        <Button type="submit" variant="contained" size="large" fullWidth disabled={submitting} sx={{ mt: 2 }}>
          {submitting ? 'Creating account…' : 'Continue'}
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2.25 }}>
        Already have an account?{' '}
        <Link component={RouterLink} to="/login" sx={{ fontWeight: 600 }}>
          Sign in
        </Link>
      </Typography>
    </AuthLayout>
  );
}
