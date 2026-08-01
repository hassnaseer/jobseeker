import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchPublicCatalogs } from '@/features/catalogs/actions';

export default function BrowseCatalogsView() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { list, status } = useAppSelector((s) => s.catalogs);

  useEffect(() => {
    void dispatch(fetchPublicCatalogs());
  }, [dispatch]);

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        {t('catalogs.browseTitle')}
      </Typography>

      {status !== 'loading' && list.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{t('catalogs.noPublicCatalogs')}</Typography>
        </Paper>
      )}

      <Stack spacing={1.5}>
        {list.map((catalog) => (
          <Paper
            key={catalog.id}
            component={RouterLink}
            to={`/app/catalogs/${catalog.id}`}
            sx={{
              p: 2.5,
              display: 'block',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'box-shadow 160ms ease',
              '&:hover': { boxShadow: '0 4px 16px rgba(30,20,80,0.08)' },
            }}
          >
            <Typography sx={{ fontWeight: 700 }}>{catalog.title}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {catalog.description.slice(0, 160)}
              {catalog.description.length > 160 ? '…' : ''}
            </Typography>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}
