import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBackOutlined';
import StatusChip from '@/components/StatusChip';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchContractDetail } from '@/features/contracts/actions';
import FixedContractSection from './FixedContractSection';
import HourlyContractSection from './HourlyContractSection';

export default function ContractDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const { detail, milestones, deliverables, status } = useAppSelector((s) => s.contracts);

  useEffect(() => {
    if (id) void dispatch(fetchContractDetail(id));
  }, [dispatch, id]);

  if (status === 'loading' || !detail) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const isOwner = user?.id === detail.clientId;
  const isSeeker = user?.id === detail.seekerId;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/app/contracts')} sx={{ mb: 2 }}>
        {t('contracts.backToContracts')}
      </Button>

      <Paper sx={{ p: 4, mb: 3 }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {detail.type === 'FIXED' ? 'Fixed-price' : 'Hourly'} contract
          </Typography>
          <StatusChip status={detail.status} />
        </Stack>
        <Typography color="text.secondary">
          {t('contracts.amount')}: {detail.currency}{' '}
          {detail.type === 'FIXED' ? detail.agreedAmount : `${detail.agreedHourlyRate}/hr`}
        </Typography>
        {detail.startedAt && (
          <Typography color="text.secondary">
            {t('contracts.started')}: {new Date(detail.startedAt).toLocaleDateString()}
          </Typography>
        )}
      </Paper>

      <Paper sx={{ p: 4 }}>
        {detail.type === 'FIXED' ? (
          <FixedContractSection
            contract={detail}
            milestones={milestones}
            deliverables={deliverables}
            isOwner={isOwner}
            isSeeker={isSeeker}
          />
        ) : (
          <HourlyContractSection contract={detail} isOwner={isOwner} isSeeker={isSeeker} />
        )}
      </Paper>
    </Box>
  );
}
