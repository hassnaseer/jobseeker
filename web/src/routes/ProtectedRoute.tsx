import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchMyProfile } from '@/features/profile/actions';

const ONBOARDING_PATH = '/app/onboarding';
const PROFILE_ROLES = ['CLIENT', 'SEEKER'];

export default function ProtectedRoute() {
  const dispatch = useAppDispatch();
  const { user, bootstrapped } = useAppSelector((s) => s.auth);
  const profile = useAppSelector((s) => s.profile);
  const location = useLocation();

  const needsProfile = !!user && PROFILE_ROLES.includes(user.activeRole);

  useEffect(() => {
    if (needsProfile && user) {
      void dispatch(fetchMyProfile(user.activeRole as 'CLIENT' | 'SEEKER'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, needsProfile, user?.activeRole]);

  if (!bootstrapped) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (needsProfile) {
    if (profile.status === 'idle' || profile.status === 'loading') {
      return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      );
    }

    const profileStatus = profile.data?.roleStatus?.profileStatus ?? 'INCOMPLETE';
    const incomplete = profileStatus === 'INCOMPLETE' || profileStatus === 'REJECTED';
    if (incomplete && location.pathname !== ONBOARDING_PATH) {
      return <Navigate to={ONBOARDING_PATH} replace />;
    }
  }

  return <Outlet />;
}
