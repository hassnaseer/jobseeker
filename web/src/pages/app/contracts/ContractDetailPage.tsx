import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBackOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import StatusChip from '@/components/StatusChip';
import { extractErrorMessage } from '@/api/client';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchContractDetail } from '@/features/contracts/actions';
import { openContractWorkroom } from '@/features/chat/actions';
import FixedContractSection from './FixedContractSection';
import HourlyContractSection from './HourlyContractSection';
import RaiseDisputeModal from '@/pages/app/disputes/RaiseDisputeModal';
import ReviewsSection from './ReviewsSection';

const DISPUTABLE_STATUSES = ['ACTIVE', 'SUBMITTED', 'REVISION'];

export default function ContractDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const { detail, milestones, deliverables, status } = useAppSelector((s) => s.contracts);
  const [disputeOpen, setDisputeOpen] = useState(false);

  useEffect(() => {
    if (id) void dispatch(fetchContractDetail(id));
  }, [dispatch, id]);

  const handleMessage = async () => {
    if (!id) return;
    try {
      const conversation = await dispatch(openContractWorkroom(id));
      navigate(`/app/messages/${conversation.id}`);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(extractErrorMessage(err));
    }
  };

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
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Button size="small" startIcon={<ChatBubbleOutlineIcon />} onClick={() => void handleMessage()}>
              {t('chat.message')}
            </Button>
            {DISPUTABLE_STATUSES.includes(detail.status) && (
              <Button size="small" color="error" startIcon={<GavelOutlinedIcon />} onClick={() => setDisputeOpen(true)}>
                {t('disputes.raiseDispute')}
              </Button>
            )}
            <StatusChip status={detail.status} />
          </Stack>
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

      {detail.status === 'COMPLETED' && user && <ReviewsSection contract={detail} currentUserId={user.id} />}

      <RaiseDisputeModal
        open={disputeOpen}
        onClose={() => setDisputeOpen(false)}
        contractId={detail.id}
        milestones={detail.type === 'FIXED' && detail.pricingModel === 'MILESTONE' ? milestones : undefined}
      />
    </Box>
  );
}
