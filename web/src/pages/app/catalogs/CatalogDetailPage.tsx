import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBackOutlined';
import ConfirmDialog from '@/components/feedback/ConfirmDialog';
import { orderTier } from '@/api/catalogs';
import { extractErrorMessage } from '@/api/client';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchCatalogDetail } from '@/features/catalogs/actions';
import type { CatalogTier } from '@/types/domain';

export default function CatalogDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const { detail, status } = useAppSelector((s) => s.catalogs);
  const [orderTarget, setOrderTarget] = useState<CatalogTier | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) void dispatch(fetchCatalogDetail(id));
  }, [dispatch, id]);

  if (status === 'loading' || !detail) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const isOwner = user?.id === detail.seekerId;
  const isClient = user?.activeRole === 'CLIENT';

  const handleOrder = async () => {
    if (!orderTarget) return;
    setError(null);
    try {
      await orderTier(orderTarget.id);
      setOrderTarget(null);
      navigate('/app/contracts');
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        {t('catalogs.backToCatalogs')}
      </Button>

      {error && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'error.main', color: 'error.contrastText' }}>{error}</Paper>
      )}

      <Paper sx={{ p: 4, mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
          {detail.title}
        </Typography>
        <Typography sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>{detail.description}</Typography>
        {isOwner && (
          <Button variant="outlined" onClick={() => navigate(`/app/catalogs/${detail.id}/edit`)}>
            {t('catalogs.edit')}
          </Button>
        )}
      </Paper>

      {(detail.tiers ?? []).length > 0 && (
        <Grid container spacing={2}>
          {(detail.tiers ?? []).map((tier) => (
            <Grid key={tier.id} size={{ xs: 12, sm: 4 }}>
              <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography sx={{ fontWeight: 700, mb: 0.5 }}>{tier.name}</Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                  {tier.currency} {tier.price}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  {tier.deliveryDays} days · {tier.revisions} revisions
                </Typography>
                <Divider sx={{ mb: 1.5 }} />
                <Stack spacing={0.5} sx={{ flex: 1, mb: 2 }}>
                  {tier.features.map((f) => (
                    <Typography key={f} variant="body2">
                      • {f}
                    </Typography>
                  ))}
                </Stack>
                {isClient && (
                  <Button variant="contained" onClick={() => setOrderTarget(tier)}>
                    {t('catalogs.order')}
                  </Button>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <ConfirmDialog
        open={!!orderTarget}
        title={t('catalogs.orderConfirmTitle')}
        message={t('catalogs.orderConfirmBody')}
        confirmLabel={t('catalogs.order')}
        onClose={() => setOrderTarget(null)}
        onConfirm={handleOrder}
      />
    </Box>
  );
}
