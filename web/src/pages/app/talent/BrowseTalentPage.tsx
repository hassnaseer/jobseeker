import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, Box, Chip, Grid, Paper, Stack, Typography } from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlineOutlined';
import { browseSeekers, type SeekerCard, type SeekerSortBy } from '@/api/profiles';

function formatMoney(amount: number, currency: string): string {
  return amount.toLocaleString(undefined, { style: 'currency', currency });
}

const SORT_OPTIONS: { value: SeekerSortBy; labelKey: string }[] = [
  { value: 'RATING', labelKey: 'talent.sortRating' },
  { value: 'RATE', labelKey: 'talent.sortRate' },
  { value: 'JOBS', labelKey: 'talent.sortJobs' },
];

export default function BrowseTalentPage() {
  const { t } = useTranslation();
  const [sortBy, setSortBy] = useState<SeekerSortBy>('RATING');
  const [seekers, setSeekers] = useState<SeekerCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    browseSeekers({ sortBy, limit: 24 })
      .then(setSeekers)
      .finally(() => setLoading(false));
  }, [sortBy]);

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        {t('talent.title')}
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
        {SORT_OPTIONS.map((opt) => (
          <Chip
            key={opt.value}
            label={t(opt.labelKey)}
            onClick={() => setSortBy(opt.value)}
            color={sortBy === opt.value ? 'primary' : 'default'}
            variant={sortBy === opt.value ? 'filled' : 'outlined'}
          />
        ))}
      </Stack>

      {!loading && seekers.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{t('talent.empty')}</Typography>
        </Paper>
      )}

      <Grid container spacing={2}>
        {seekers.map((s) => {
          const name = [s.firstName, s.lastName].filter(Boolean).join(' ') || 'Freelancer';
          return (
            <Grid key={s.userId} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Paper sx={{ p: 2.5 }}>
                <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 1 }}>
                  <Avatar src={s.avatarUrl ?? undefined} sx={{ width: 44, height: 44 }}>
                    <PersonOutlineIcon />
                  </Avatar>
                  {s.avgRating > 0 && (
                    <Chip
                      size="small"
                      label={`★ ${s.avgRating.toFixed(1)}`}
                      sx={{ bgcolor: 'warning.light', color: 'warning.contrastText', fontWeight: 700 }}
                    />
                  )}
                </Stack>
                <Typography sx={{ fontWeight: 700 }}>{name}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {s.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {s.hourlyRate ? `${formatMoney(s.hourlyRate, s.currency)}/h` : ''}
                  {s.hourlyRate && s.totalJobs ? ' · ' : ''}
                  {s.totalJobs ? `${s.totalJobs} jobs` : ''}
                </Typography>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
