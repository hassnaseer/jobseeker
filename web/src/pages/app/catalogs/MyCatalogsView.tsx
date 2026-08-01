import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import StatusChip from '@/components/StatusChip';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchMyCatalogs, pauseCatalog, publishCatalog, resumeCatalog } from '@/features/catalogs/actions';

export default function MyCatalogsView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { mine, status } = useAppSelector((s) => s.catalogs);

  useEffect(() => {
    void dispatch(fetchMyCatalogs());
  }, [dispatch]);

  return (
    <Box>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {t('catalogs.myCatalogsTitle')}
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/app/catalogs/new')}>
          {t('catalogs.newCatalog')}
        </Button>
      </Stack>

      {status !== 'loading' && mine.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{t('catalogs.noCatalogs')}</Typography>
        </Paper>
      )}

      <Stack spacing={1.5}>
        {mine.map((catalog) => (
          <Paper key={catalog.id} sx={{ p: 2.5 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Typography
                component={RouterLink}
                to={`/app/catalogs/${catalog.id}`}
                sx={{ fontWeight: 700, color: 'text.primary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
              >
                {catalog.title}
              </Typography>
              <StatusChip status={catalog.status} />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              {catalog.description.slice(0, 140)}
              {catalog.description.length > 140 ? '…' : ''}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button size="small" onClick={() => navigate(`/app/catalogs/${catalog.id}/edit`)}>
                {t('catalogs.edit')}
              </Button>
              {catalog.status === 'DRAFT' && (
                <Button
                  size="small"
                  variant="contained"
                  onClick={async () => {
                    await dispatch(publishCatalog(catalog.id));
                    void dispatch(fetchMyCatalogs());
                  }}
                >
                  {t('catalogs.publish')}
                </Button>
              )}
              {catalog.status === 'ACTIVE' && (
                <Button
                  size="small"
                  onClick={async () => {
                    await dispatch(pauseCatalog(catalog.id));
                    void dispatch(fetchMyCatalogs());
                  }}
                >
                  {t('catalogs.pause')}
                </Button>
              )}
              {catalog.status === 'PAUSED' && (
                <Button
                  size="small"
                  onClick={async () => {
                    await dispatch(resumeCatalog(catalog.id));
                    void dispatch(fetchMyCatalogs());
                  }}
                >
                  {t('catalogs.resume')}
                </Button>
              )}
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}
