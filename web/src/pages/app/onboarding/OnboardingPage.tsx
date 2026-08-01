import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchMyProfile, submitProfileForReview } from '@/features/profile/actions';
import { extractErrorMessage } from '@/api/client';
import BasicInfoForm from '@/pages/app/profile/BasicInfoForm';
import KycForm from '@/pages/app/profile/KycForm';
import ClientProfileForm from '@/pages/app/profile/ClientProfileForm';
import SeekerProfileForm from '@/pages/app/profile/SeekerProfileForm';
import type { ClientProfile, SeekerProfile } from '@/types/profile';

export default function OnboardingPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const { data, status } = useAppSelector((s) => s.profile);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  if (roleStatus === 'PENDING') {
    return (
      <Paper sx={{ p: 4, maxWidth: 560, mx: 'auto', textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          {t('onboarding.pendingTitle')}
        </Typography>
        <Typography color="text.secondary">{t('onboarding.pendingBody')}</Typography>
      </Paper>
    );
  }

  if (roleStatus === 'APPROVED') {
    return (
      <Paper sx={{ p: 4, maxWidth: 560, mx: 'auto', textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          {t('onboarding.approvedTitle')}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {t('onboarding.approvedBody')}
        </Typography>
        <Button variant="contained" onClick={() => navigate('/app/dashboard')}>
          {t('onboarding.goToDashboard')}
        </Button>
      </Paper>
    );
  }

  const steps = [t('onboarding.stepBasic'), t('onboarding.stepIdentity'), t('onboarding.stepRoleProfile'), t('onboarding.stepReview')];

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await dispatch(submitProfileForReview(role));
    } catch (err) {
      setSubmitError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 760, mx: 'auto' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        {t('onboarding.title')}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {t('onboarding.subtitle')}
      </Typography>

      {roleStatus === 'REJECTED' && data.roleStatus?.rejectionReason && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {t('onboarding.rejectedBody', { reason: data.roleStatus.rejectionReason })}
        </Alert>
      )}

      <Stepper activeStep={step} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper sx={{ p: 3 }}>
        {step === 0 && <BasicInfoForm initial={data.basic} onSaved={() => setStep(1)} />}
        {step === 1 && <KycForm initial={data.identity} onSaved={() => setStep(2)} />}
        {step === 2 && role === 'CLIENT' && (
          <ClientProfileForm initial={data.roleProfile as ClientProfile | null} onSaved={() => setStep(3)} />
        )}
        {step === 2 && role === 'SEEKER' && (
          <SeekerProfileForm initial={data.roleProfile as SeekerProfile | null} onSaved={() => setStep(3)} />
        )}
        {step === 3 && (
          <Box>
            {submitError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {submitError}
              </Alert>
            )}
            <Typography sx={{ fontWeight: 700, mb: 1 }}>{t('onboarding.reviewTitle')}</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {t('onboarding.reviewBody')}
            </Typography>
            <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
              {submitting ? t('onboarding.submitting') : t('onboarding.submitForReview')}
            </Button>
          </Box>
        )}
      </Paper>

      {step > 0 && step < 3 && (
        <Button onClick={() => setStep((s) => s - 1)} sx={{ mt: 2 }}>
          {t('common.back')}
        </Button>
      )}
    </Box>
  );
}
