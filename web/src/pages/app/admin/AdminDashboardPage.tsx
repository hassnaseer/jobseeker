import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchAnalyticsOverview } from '@/features/admin/actions';

function StatBlock({ label, value }: { label: string; value: string | number }) {
  return (
    <Paper sx={{ p: 2.5, flex: 1, minWidth: 160 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
        {value}
      </Typography>
    </Paper>
  );
}

function BreakdownList({ title, items }: { title: string; items: Array<{ label: string; count: number }> }) {
  const { t } = useTranslation();
  return (
    <Paper sx={{ p: 2.5, flex: 1, minWidth: 240 }}>
      <Typography sx={{ fontWeight: 700, mb: 1.5 }}>{title}</Typography>
      {items.length === 0 && <Typography color="text.secondary">{t('common.noResults')}</Typography>}
      <Stack spacing={1}>
        {items.map((item) => (
          <Stack key={item.label} direction="row" sx={{ justifyContent: 'space-between' }}>
            <Typography variant="body2">{item.label.replace(/_/g, ' ')}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {item.count}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
}

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const analytics = useAppSelector((s) => s.admin.analytics);

  useEffect(() => {
    void dispatch(fetchAnalyticsOverview());
  }, [dispatch]);

  if (!analytics) return null;

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        {t('admin.dashboardTitle')}
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: 'wrap' }}>
        <StatBlock label={t('admin.totalUsers')} value={analytics.totalUsers} />
        {analytics.grossMerchandiseVolume.map((g) => (
          <StatBlock key={g.currency} label={`${t('admin.gmv')} (${g.currency})`} value={g.total} />
        ))}
      </Stack>

      <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
        <BreakdownList
          title={t('admin.usersByRole')}
          items={analytics.usersByActiveRole.map((r) => ({ label: r.role, count: r.count }))}
        />
        <BreakdownList
          title={t('admin.jobsByStatus')}
          items={analytics.jobsByStatus.map((r) => ({ label: r.status, count: r.count }))}
        />
        <BreakdownList
          title={t('admin.contractsByStatus')}
          items={analytics.contractsByStatus.map((r) => ({ label: r.status, count: r.count }))}
        />
      </Stack>
    </Box>
  );
}
