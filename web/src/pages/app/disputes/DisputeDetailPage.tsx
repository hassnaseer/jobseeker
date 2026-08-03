import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, CircularProgress, Link, Paper, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBackOutlined';
import StatusChip from '@/components/StatusChip';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchDisputeDetail } from '@/features/disputes/actions';

export default function DisputeDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { detail, status } = useAppSelector((s) => s.disputes);

  useEffect(() => {
    if (id) void dispatch(fetchDisputeDetail(id));
  }, [dispatch, id]);

  if (status === 'loading' || !detail) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto' }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/app/disputes')} sx={{ mb: 2 }}>
        {t('disputes.backToDisputes')}
      </Button>

      <Paper sx={{ p: 4, mb: 3 }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {t('disputes.contract')} #{detail.contractId.slice(0, 8)}
          </Typography>
          <StatusChip status={detail.status} />
        </Stack>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {new Date(detail.createdAt).toLocaleString()}
        </Typography>
        <Typography sx={{ whiteSpace: 'pre-wrap' }}>{detail.reason}</Typography>

        {detail.evidence.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              {t('disputes.evidence')}
            </Typography>
            <Stack spacing={0.5}>
              {detail.evidence.map((url, i) => (
                <Link key={i} href={url} target="_blank" rel="noopener noreferrer" variant="body2">
                  {url}
                </Link>
              ))}
            </Stack>
          </Box>
        )}
      </Paper>

      {detail.status === 'RESOLVED' && (
        <Paper sx={{ p: 4 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
            {t('disputes.resolution')}
          </Typography>
          <StatusChip status={detail.resolutionType ?? ''} label={detail.resolutionType ?? ''} />
          {detail.resolutionNote && (
            <Typography sx={{ mt: 1.5, whiteSpace: 'pre-wrap' }}>{detail.resolutionNote}</Typography>
          )}
          {detail.resolvedAt && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
              {new Date(detail.resolvedAt).toLocaleString()}
            </Typography>
          )}
        </Paper>
      )}
    </Box>
  );
}
