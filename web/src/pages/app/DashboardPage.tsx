import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { Alert, Box, Button, Chip, Grid, Link, Paper, Stack, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { apiClient } from '@/api/client';
import { fetchMyProfile } from '@/features/profile/actions';
import type { Application, Contract, Job, Wallet } from '@/types/domain';

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Paper sx={{ p: 2.5 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 800 }}>
        {value}
      </Typography>
    </Paper>
  );
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const profile = useAppSelector((s) => s.profile.data);
  const isClient = user?.activeRole === 'CLIENT';

  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.activeRole === 'CLIENT' || user?.activeRole === 'SEEKER') {
      void dispatch(fetchMyProfile(user.activeRole));
    }
  }, [dispatch, user?.activeRole]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const requests: Promise<unknown>[] = [
          apiClient.get<Contract[]>('/contracts/mine'),
          apiClient.get<Wallet[]>('/payments/wallet'),
        ];
        if (isClient) {
          requests.unshift(apiClient.get<Job[]>('/jobs/mine'));
        } else {
          requests.unshift(apiClient.get<Application[]>('/applications/mine'));
        }
        const [firstRes, contractsRes, walletsRes] = (await Promise.all(requests)) as [
          { data: Job[] | Application[] },
          { data: Contract[] },
          { data: Wallet[] },
        ];
        if (cancelled) return;
        if (isClient) {
          setJobs(firstRes.data as Job[]);
        } else {
          setApplications(firstRes.data as Application[]);
        }
        setContracts(contractsRes.data);
        setWallets(walletsRes.data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [isClient]);

  const activeContracts = contracts.filter((c) => ['ACTIVE', 'SUBMITTED', 'REVISION'].includes(c.status));
  const primaryWallet = wallets[0];
  const roleStatus = profile?.roleStatus?.profileStatus;

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        {t('dashboard.title')}
      </Typography>

      {(roleStatus === 'INCOMPLETE' || roleStatus === undefined) && (
        <Alert
          severity="info"
          sx={{ mb: 3 }}
          action={
            <Button component={RouterLink} to="/app/onboarding" color="inherit" size="small">
              {t('dashboard.completeProfileCta')}
            </Button>
          }
        >
          {t('dashboard.completeProfileBody')}
        </Alert>
      )}
      {roleStatus === 'PENDING' && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {t('dashboard.pendingProfileBody')}
        </Alert>
      )}
      {roleStatus === 'REJECTED' && (
        <Alert
          severity="warning"
          sx={{ mb: 3 }}
          action={
            <Button component={RouterLink} to="/app/onboarding" color="inherit" size="small">
              {t('dashboard.completeProfileCta')}
            </Button>
          }
        >
          {t('dashboard.rejectedProfileBody', { reason: profile?.roleStatus?.rejectionReason ?? '' })}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {isClient ? (
          <>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatCard label={t('dashboard.openJobs')} value={jobs.filter((j) => j.status === 'OPEN').length} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatCard label={t('dashboard.totalJobsPosted')} value={jobs.length} />
            </Grid>
          </>
        ) : (
          <>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatCard label={t('dashboard.applications')} value={applications.length} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatCard
                label={t('dashboard.shortlisted')}
                value={applications.filter((a) => a.status === 'SHORTLISTED').length}
              />
            </Grid>
          </>
        )}
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard label={t('dashboard.contracts')} value={contracts.length} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            label={t('dashboard.wallet')}
            value={
              primaryWallet
                ? `${primaryWallet.balance.toLocaleString(undefined, { style: 'currency', currency: primaryWallet.currency })}`
                : '$0'
            }
          />
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        {t('dashboard.activeContracts')}
      </Typography>
      {!loading && activeContracts.length === 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography color="text.secondary">{t('dashboard.noActiveContracts')}</Typography>
        </Paper>
      )}
      <Stack spacing={1.5}>
        {activeContracts.map((c) => (
          <Paper key={c.id} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                {t('dashboard.contractLabel', { type: c.type })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {c.currency} {c.agreedAmount ?? c.agreedHourlyRate}
              </Typography>
            </Box>
            <Chip label={c.status} size="small" color="primary" variant="outlined" />
          </Paper>
        ))}
      </Stack>

      <Box sx={{ mt: 2 }}>
        <Link component={RouterLink} to="/app/contracts" sx={{ fontWeight: 600 }}>
          {t('dashboard.viewAllContracts')}
        </Link>
      </Box>
    </Box>
  );
}
