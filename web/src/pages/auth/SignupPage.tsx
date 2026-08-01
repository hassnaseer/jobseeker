import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
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

const TOS_VERSION = '1.0';

export default function SignupPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [role, setRole] = useState<'CLIENT' | 'SEEKER'>('CLIENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tosAccepted, setTosAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const roles = [
    { key: 'CLIENT' as const, title: t('auth.signup.roleClientTitle'), subtitle: t('auth.signup.roleClientSubtitle') },
    { key: 'SEEKER' as const, title: t('auth.signup.roleSeekerTitle'), subtitle: t('auth.signup.roleSeekerSubtitle') },
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!tosAccepted) {
      setError(t('auth.signup.tosRequired'));
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
        {t('auth.signup.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('auth.signup.subtitle')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={1.5} sx={{ mb: 2.5 }}>
          {roles.map((r) => (
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
                transition: 'border-color 160ms ease, background-color 160ms ease',
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: 15 }}>{r.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                {r.subtitle}
              </Typography>
            </Box>
          ))}
        </Stack>

        <Stack spacing={2}>
          <TextField
            label={t('auth.signup.email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label={t('auth.signup.password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            helperText={t('auth.signup.passwordHelper')}
          />
          <TextField
            label={t('auth.signup.confirmPassword')}
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
              {t('auth.signup.agreeTos')}
            </Typography>
          }
        />

        <Button type="submit" variant="contained" size="large" fullWidth disabled={submitting} sx={{ mt: 2 }}>
          {submitting ? t('auth.signup.submitting') : t('auth.signup.submit')}
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2.25 }}>
        {t('auth.signup.haveAccount')}{' '}
        <Link component={RouterLink} to="/login" sx={{ fontWeight: 600 }}>
          {t('auth.signup.signIn')}
        </Link>
      </Typography>
    </AuthLayout>
  );
}
