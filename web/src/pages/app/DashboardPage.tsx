import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Grid,
  Link,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlineOutlined';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { apiClient } from '@/api/client';
import { fetchMyProfile } from '@/features/profile/actions';
import { browseSeekers, type SeekerCard } from '@/api/profiles';
import { getRecommendedJobs } from '@/api/ai';
import { listPublicJobs } from '@/api/jobs';
import { listMyNotifications } from '@/api/notifications';
import type { Application, Contract, Job, Notification, RecommendedJob, Wallet } from '@/types/domain';

function formatMoney(amount: number, currency: string): string {
  return amount.toLocaleString(undefined, { style: 'currency', currency });
}

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

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function NotificationsPanel({ items }: { items: Notification[] }) {
  const { t } = useTranslation();
  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography sx={{ fontWeight: 700, mb: 2 }}>{t('notifications.title')}</Typography>
      {items.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {t('dashboard.noNotifications')}
        </Typography>
      ) : (
        <Stack spacing={1.75}>
          {items.map((n) => (
            <Box key={n.id}>
              <Typography variant="body2">{n.message}</Typography>
              <Typography variant="caption" color="text.secondary">
                {relativeTime(n.createdAt)}
              </Typography>
            </Box>
          ))}
        </Stack>
      )}
    </Paper>
  );
}

function SeekerTile({ seeker }: { seeker: SeekerCard }) {
  const name = [seeker.firstName, seeker.lastName].filter(Boolean).join(' ') || 'Freelancer';
  return (
    <Paper sx={{ p: 2, width: 200, flexShrink: 0 }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 1 }}>
        <Avatar src={seeker.avatarUrl ?? undefined} sx={{ width: 40, height: 40 }}>
          <PersonOutlineIcon />
        </Avatar>
        {seeker.avgRating > 0 && (
          <Chip
            size="small"
            label={`★ ${seeker.avgRating.toFixed(1)}`}
            sx={{ bgcolor: 'warning.light', color: 'warning.contrastText', fontWeight: 700 }}
          />
        )}
      </Stack>
      <Typography sx={{ fontWeight: 700, fontSize: 14 }} noWrap>
        {name}
      </Typography>
      <Typography variant="body2" color="text.secondary" noWrap>
        {seeker.title}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {seeker.hourlyRate ? `${formatMoney(seeker.hourlyRate, seeker.currency)}/h` : ''}
        {seeker.hourlyRate && seeker.totalJobs ? ' · ' : ''}
        {seeker.totalJobs ? `${seeker.totalJobs} jobs` : ''}
      </Typography>
    </Paper>
  );
}

function JobTile({ job, price }: { job: Job; price: string }) {
  return (
    <Paper
      component={RouterLink}
      to={`/app/jobs/${job.id}`}
      sx={{ p: 2, width: 200, flexShrink: 0, display: 'block', textDecoration: 'none', color: 'inherit' }}
    >
      <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 0.5 }}>{job.title}</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
        {job.locationType} · {job.jobType}
      </Typography>
      <Typography sx={{ fontWeight: 700, fontSize: 13 }}>{price}</Typography>
    </Paper>
  );
}

function jobPriceLabel(job: Job): string {
  if (job.pricingModel === 'MILESTONE' || job.jobType === 'FIXED') {
    return job.budgetAmount ? formatMoney(job.budgetAmount, job.currency) : '—';
  }
  if (job.hourlyRateMin) {
    return `${formatMoney(job.hourlyRateMin, job.currency)}${job.hourlyRateMax ? `-${formatMoney(job.hourlyRateMax, job.currency)}` : ''}/hr`;
  }
  return '—';
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recommendedSeekers, setRecommendedSeekers] = useState<SeekerCard[]>([]);
  const [trendingSeekers, setTrendingSeekers] = useState<SeekerCard[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<RecommendedJob[]>([]);
  const [newJobs, setNewJobs] = useState<Job[]>([]);
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

    void listMyNotifications({}).then((items) => !cancelled && setNotifications(items.slice(0, 4)));

    if (isClient) {
      void browseSeekers({ sortBy: 'RATING', limit: 4 }).then((items) => !cancelled && setRecommendedSeekers(items));
      void browseSeekers({ sortBy: 'JOBS', limit: 4 }).then((items) => !cancelled && setTrendingSeekers(items));
    } else {
      void getRecommendedJobs().then((items) => !cancelled && setRecommendedJobs(items.slice(0, 4)));
      void listPublicJobs({ sortBy: 'NEWEST', limit: 4 }).then(
        (res) => !cancelled && setNewJobs(res.items),
      );
    }

    return () => {
      cancelled = true;
    };
  }, [isClient]);

  const activeContracts = contracts.filter((c) => ['ACTIVE', 'SUBMITTED', 'REVISION'].includes(c.status));
  const primaryWallet = wallets[0];
  const roleStatus = profile?.roleStatus?.profileStatus;
  const seekerAvgRating = !isClient && profile?.roleProfile && 'avgRating' in profile.roleProfile
    ? (profile.roleProfile as { avgRating: number }).avgRating
    : 0;

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
              <StatCard
                label={t('dashboard.newApplications')}
                value={jobs.reduce((sum, j) => sum + j.applicationsCount, 0)}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatCard label={t('dashboard.activeContracts')} value={activeContracts.length} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatCard
                label={t('dashboard.wallet')}
                value={primaryWallet ? formatMoney(primaryWallet.balance, primaryWallet.currency) : '$0'}
              />
            </Grid>
          </>
        ) : (
          <>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatCard label={t('dashboard.activeContracts')} value={activeContracts.length} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatCard label={t('dashboard.proposalsSent')} value={applications.length} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatCard
                label={t('dashboard.wallet')}
                value={primaryWallet ? formatMoney(primaryWallet.balance, primaryWallet.currency) : '$0'}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatCard label={t('dashboard.avgRating')} value={seekerAvgRating ? seekerAvgRating.toFixed(1) : '—'} />
            </Grid>
          </>
        )}
      </Grid>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 8 }}>
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
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <NotificationsPanel items={notifications} />
        </Grid>
      </Grid>

      {isClient ? (
        <>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {t('dashboard.recommendedFreelancers')}
            </Typography>
            <Link component={RouterLink} to="/app/browse-talent">
              {t('dashboard.viewAll')}
            </Link>
          </Stack>
          <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 1, mb: 4 }}>
            {recommendedSeekers.map((s) => (
              <SeekerTile key={s.userId} seeker={s} />
            ))}
          </Stack>

          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {t('dashboard.trendingFreelancers')}
            </Typography>
            <Link component={RouterLink} to="/app/browse-talent">
              {t('dashboard.viewAll')}
            </Link>
          </Stack>
          <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 1 }}>
            {trendingSeekers.map((s) => (
              <SeekerTile key={s.userId} seeker={s} />
            ))}
          </Stack>
        </>
      ) : (
        <>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {t('dashboard.recommendedForYou')}
            </Typography>
            <Link component={RouterLink} to="/app/browse">
              {t('dashboard.viewAll')}
            </Link>
          </Stack>
          <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 1, mb: 4 }}>
            {recommendedJobs.map(({ job }) => (
              <JobTile key={job.id} job={job} price={jobPriceLabel(job)} />
            ))}
          </Stack>

          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {t('dashboard.newAndTrending')}
            </Typography>
            <Link component={RouterLink} to="/app/browse">
              {t('dashboard.viewAll')}
            </Link>
          </Stack>
          <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 1 }}>
            {newJobs.map((job) => (
              <JobTile key={job.id} job={job} price={jobPriceLabel(job)} />
            ))}
          </Stack>
        </>
      )}
    </Box>
  );
}
