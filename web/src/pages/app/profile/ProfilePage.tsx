import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchMyProfile } from '@/features/profile/actions';
import StatusChip from '@/components/StatusChip';
import BasicInfoForm from './BasicInfoForm';
import KycForm from './KycForm';
import ClientProfileForm from './ClientProfileForm';
import SeekerProfileForm from './SeekerProfileForm';
import type { ClientProfile, SeekerProfile } from '@/types/profile';

export default function ProfilePage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const { data, status } = useAppSelector((s) => s.profile);

  const role = user?.activeRole === 'CLIENT' ? 'CLIENT' : 'SEEKER';

  useEffect(() => {
    if (role === 'CLIENT' || role === 'SEEKER') {
      void dispatch(fetchMyProfile(role));
    }
  }, [dispatch, role]);

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
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {t('profile.title')}
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
      </Stack>
    </Box>
  );
}

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
