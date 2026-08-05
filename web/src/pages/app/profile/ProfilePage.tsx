import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Paper,
  Rating,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchMyProfile } from '@/features/profile/actions';
import { fetchReceivedReviews } from '@/features/reviews/actions';
import { fetchPaymentsOverview } from '@/features/payments/actions';
import { changePassword, switchRole } from '@/features/auth/actions';
import { extractErrorMessage } from '@/api/client';
import StatusChip from '@/components/StatusChip';
import FormTextField from '@/components/form/FormTextField';
import BasicInfoForm from './BasicInfoForm';
import KycForm from './KycForm';
import ClientProfileForm from './ClientProfileForm';
import SeekerProfileForm from './SeekerProfileForm';
import type { ClientProfile, SeekerProfile } from '@/types/profile';


function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
        {title}
      </Typography>
      {children}
    </Paper>
  );
}

function ProfileTab({ role }: { role: 'CLIENT' | 'SEEKER' }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const { data } = useAppSelector((s) => s.profile);
  const { receivedBy: receivedReviews } = useAppSelector((s) => s.reviews);

  useEffect(() => {
    if (user) void dispatch(fetchReceivedReviews(user.id));
  }, [dispatch, user]);

  if (!data) return null;

  const roleProfile = data.roleProfile as ClientProfile | SeekerProfile | null;

  return (
    <Stack spacing={3}>
      <Section title={t('profile.basicInfoTitle')}>
        <BasicInfoForm initial={data.basic} />
      </Section>
      <Section title={t('profile.identityTitle')}>
        <KycForm initial={data.identity} />
      </Section>
      <Section title={role === 'CLIENT' ? t('profile.roleProfileTitleClient') : t('profile.roleProfileTitleSeeker')}>
        {role === 'CLIENT' ? (
          <ClientProfileForm initial={data.roleProfile as ClientProfile | null} />
        ) : (
          <SeekerProfileForm initial={data.roleProfile as SeekerProfile | null} />
        )}
      </Section>
      <Section title={t('reviews.title')}>
        {roleProfile && (
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
            <Rating value={roleProfile.avgRating} precision={0.1} readOnly />
            <Typography color="text.secondary">
              {roleProfile.avgRating.toFixed(1)} ({t('reviews.reviewCount', { count: roleProfile.totalReviews })})
            </Typography>
          </Stack>
        )}
        {receivedReviews.length === 0 ? (
          <Typography color="text.secondary">{t('reviews.noReviewsReceived')}</Typography>
        ) : (
          <Stack spacing={2}>
            {receivedReviews.map((r) => (
              <Box key={r.id}>
                <Rating value={r.rating} readOnly size="small" />
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {r.comment}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(r.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}
      </Section>
    </Stack>
  );
}

function BecomeRoleTab({ targetRole }: { targetRole: 'CLIENT' | 'SEEKER' }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBecome = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await dispatch(switchRole(targetRole));
      navigate('/app/onboarding');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const label = targetRole === 'CLIENT' ? t('profile.becomeClient') : t('profile.becomeFreelancer');

  return (
    <Section title={label}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        {targetRole === 'CLIENT' ? t('profile.becomeClientBody') : t('profile.becomeFreelancerBody')}
      </Typography>
      <Button variant="contained" onClick={handleBecome} disabled={submitting}>
        {label}
      </Button>
    </Section>
  );
}

function PayoutAndSecurityTab() {
  const { t } = useTranslation();
  const { payoutMethods } = useAppSelector((s) => s.payments);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [revokeOtherSessions, setRevokeOtherSessions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChangePassword = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await changePassword({ currentPassword, newPassword, confirmPassword, revokeOtherSessions });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess(true);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Section title={t('payments.payoutMethods')}>
        {payoutMethods.length === 0 ? (
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {t('payments.noPayoutMethods')}
          </Typography>
        ) : (
          <Stack spacing={1} sx={{ mb: 2 }}>
            {payoutMethods.map((m) => (
              <Paper key={m.id} variant="outlined" sx={{ p: 1.5 }}>
                <Typography sx={{ fontWeight: 600 }}>
                  {m.type === 'BANK' ? m.bankName || 'Bank account' : m.type.replace(/_/g, ' ')}
                  {m.isDefault ? ' · default' : ''}
                </Typography>
              </Paper>
            ))}
          </Stack>
        )}
        <Button component={RouterLink} to="/app/payments" variant="outlined">
          {t('profile.managePayoutMethods')}
        </Button>
      </Section>

      <Section title={t('profile.security')}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {t('profile.passwordChanged')}
          </Alert>
        )}
        <Stack spacing={2} sx={{ maxWidth: 400 }}>
          <FormTextField
            label={t('profile.currentPassword')}
            type="password"
            value={currentPassword}
            onChange={setCurrentPassword}
          />
          <FormTextField
            label={t('profile.newPassword')}
            type="password"
            value={newPassword}
            onChange={setNewPassword}
          />
          <FormTextField
            label={t('profile.confirmNewPassword')}
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
          />
          <FormControlLabel
            control={
              <Checkbox checked={revokeOtherSessions} onChange={(e) => setRevokeOtherSessions(e.target.checked)} />
            }
            label={t('profile.revokeOtherSessions')}
          />
          <Button
            variant="contained"
            onClick={handleChangePassword}
            disabled={saving || !currentPassword || !newPassword || newPassword !== confirmPassword}
            sx={{ alignSelf: 'flex-start' }}
          >
            {saving ? t('common.saving') : t('profile.updatePassword')}
          </Button>
        </Stack>
      </Section>
    </Stack>
  );
}

export default function ProfilePage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const { data, status } = useAppSelector((s) => s.profile);
  const [tab, setTab] = useState(0);

  const role = user?.activeRole === 'CLIENT' ? 'CLIENT' : 'SEEKER';
  const otherRole: 'CLIENT' | 'SEEKER' = role === 'CLIENT' ? 'SEEKER' : 'CLIENT';
  const holdsOtherRole = user?.roles.includes(otherRole) ?? false;

  useEffect(() => {
    if (role === 'CLIENT' || role === 'SEEKER') {
      void dispatch(fetchMyProfile(role));
    }
  }, [dispatch, role]);

  useEffect(() => {
    void dispatch(fetchPaymentsOverview());
  }, [dispatch]);

  if (status === 'loading' || !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const roleStatus = data.roleStatus?.profileStatus ?? 'INCOMPLETE';

  return (
    <Box sx={{ maxWidth: 760, mx: 'auto' }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {t('profile.settingsTitle')}
        </Typography>
        <StatusChip status={roleStatus} />
      </Stack>

      {(roleStatus === 'INCOMPLETE' || roleStatus === 'REJECTED') && (
        <Alert
          severity={roleStatus === 'REJECTED' ? 'warning' : 'info'}
          sx={{ mb: 3 }}
          action={
            <Button component={RouterLink} to="/app/onboarding" color="inherit" size="small">
              {t('onboarding.editProfile')}
            </Button>
          }
        >
          {roleStatus === 'REJECTED' && data.roleStatus?.rejectionReason
            ? t('onboarding.rejectedBody', { reason: data.roleStatus.rejectionReason })
            : t('dashboard.completeProfileBody')}
        </Alert>
      )}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label={t('profile.tabProfile')} />
        {!holdsOtherRole && (
          <Tab label={otherRole === 'CLIENT' ? t('profile.becomeClient') : t('profile.becomeFreelancer')} />
        )}
        <Tab label={t('profile.tabPayoutSecurity')} />
      </Tabs>

      {tab === 0 && <ProfileTab role={role} />}
      {tab === 1 && !holdsOtherRole && <BecomeRoleTab targetRole={otherRole} />}
      {((holdsOtherRole && tab === 1) || (!holdsOtherRole && tab === 2)) && <PayoutAndSecurityTab />}
    </Box>
  );
}
