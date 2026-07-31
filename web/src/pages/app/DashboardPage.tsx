import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Chip, Grid, Link, Paper, Stack, Typography } from '@mui/material';
import { useAppSelector } from '@/app/hooks';
import { apiClient } from '@/api/client';
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
  const user = useAppSelector((s) => s.auth.user);
  const isClient = user?.activeRole === 'CLIENT';

  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Dashboard
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {isClient ? (
          <>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatCard label="Open jobs" value={jobs.filter((j) => j.status === 'OPEN').length} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatCard label="Total jobs posted" value={jobs.length} />
            </Grid>
          </>
        ) : (
          <>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatCard label="Applications" value={applications.length} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatCard
                label="Shortlisted"
                value={applications.filter((a) => a.status === 'SHORTLISTED').length}
              />
            </Grid>
          </>
        )}
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard label="Contracts" value={contracts.length} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            label="Wallet"
            value={
              primaryWallet
                ? `${primaryWallet.balance.toLocaleString(undefined, { style: 'currency', currency: primaryWallet.currency })}`
                : '$0'
            }
          />
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Active contracts
      </Typography>
      {!loading && activeContracts.length === 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography color="text.secondary">No active contracts yet.</Typography>
        </Paper>
      )}
      <Stack spacing={1.5}>
        {activeContracts.map((c) => (
          <Paper key={c.id} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                {c.type} contract
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
          View all contracts
        </Link>
      </Box>
    </Box>
  );
}
