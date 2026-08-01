import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { useAppSelector } from '@/app/hooks';
import { listSavedItems, unsaveItem } from '@/api/savedItems';
import { getJobDetail } from '@/api/jobs';
import type { Job, SavedItem } from '@/types/domain';

export default function SavedItemsPage() {
  const { t } = useTranslation();
  const user = useAppSelector((s) => s.auth.user);
  const isClient = user?.activeRole === 'CLIENT';
  const targetType = isClient ? 'SEEKER' : 'JOB';

  const [items, setItems] = useState<SavedItem[]>([]);
  const [jobs, setJobs] = useState<Record<string, Job>>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const saved = await listSavedItems(targetType);
      setItems(saved);
      if (!isClient) {
        const entries = await Promise.all(
          saved.map(async (s) => [s.targetId, await getJobDetail(s.targetId).catch(() => null)] as const),
        );
        setJobs(Object.fromEntries(entries.filter((e): e is [string, Job] => !!e[1])));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetType]);

  const handleUnsave = async (item: SavedItem) => {
    await unsaveItem(item.targetType, item.targetId);
    void load();
  };

  const emptyMessage = isClient ? t('saved.noSavedTalent') : t('saved.noSavedJobs');

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        {isClient ? t('saved.savedTalentTitle') : t('saved.savedJobsTitle')}
      </Typography>

      {!loading && items.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{emptyMessage}</Typography>
        </Paper>
      )}

      <Stack spacing={1.5}>
        {items.map((item) => (
          <Paper key={item.id} sx={{ p: 2.5 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              {isClient || !jobs[item.targetId] ? (
                <Typography sx={{ fontWeight: 600 }}>
                  {isClient ? t('nav.savedTalent') : t('applications.job')} #{item.targetId.slice(0, 8)}
                </Typography>
              ) : (
                <Typography
                  component={RouterLink}
                  to={`/app/jobs/${item.targetId}`}
                  sx={{ fontWeight: 600, color: 'text.primary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                >
                  {jobs[item.targetId].title}
                </Typography>
              )}
              <Button size="small" color="error" onClick={() => handleUnsave(item)}>
                {t('saved.unsave')}
              </Button>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}
