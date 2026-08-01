import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Box, Button, Paper, Stack, Typography } from '@mui/material';
import StatusChip from '@/components/StatusChip';
import Modal from '@/components/feedback/Modal';
import FormSelectField from '@/components/form/FormSelectField';
import FormTextField from '@/components/form/FormTextField';
import { extractErrorMessage } from '@/api/client';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchDisputesQueue, markDisputeUnderReview, resolveDispute } from '@/features/admin/actions';
import type { Dispute, DisputeResolutionType } from '@/types/admin';

export default function AdminDisputesPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { disputes } = useAppSelector((s) => s.admin);
  const [resolving, setResolving] = useState<Dispute | null>(null);
  const [resolutionType, setResolutionType] = useState<DisputeResolutionType>('RELEASE_SEEKER');
  const [resolutionNote, setResolutionNote] = useState('');
  const [seekerAmount, setSeekerAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void dispatch(fetchDisputesQueue());
  }, [dispatch]);

  const closeModal = () => {
    setResolving(null);
    setResolutionType('RELEASE_SEEKER');
    setResolutionNote('');
    setSeekerAmount('');
    setError(null);
  };

  const handleResolve = async () => {
    if (!resolving) return;
    setError(null);
    try {
      await dispatch(
        resolveDispute(resolving.id, {
          resolutionType,
          resolutionNote,
          seekerAmount: resolutionType === 'SPLIT' ? Number(seekerAmount) : undefined,
        }),
      );
      closeModal();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        {t('admin.disputesTitle')}
      </Typography>

      {disputes.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{t('admin.noDisputes')}</Typography>
        </Paper>
      )}

      <Stack spacing={1.5}>
        {disputes.map((d) => (
          <Paper key={d.id} sx={{ p: 2.5 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Box>
                <Typography sx={{ fontWeight: 700 }}>Contract #{d.contractId.slice(0, 8)}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('admin.raisedBy')}: #{d.raisedBy.slice(0, 8)} · {new Date(d.createdAt).toLocaleString()}
                </Typography>
              </Box>
              <StatusChip status={d.status} />
            </Stack>
            <Typography variant="body2" sx={{ mb: 1.5 }}>
              {d.reason}
            </Typography>
            {d.status !== 'RESOLVED' && (
              <Stack direction="row" spacing={1}>
                {d.status === 'OPEN' && (
                  <Button size="small" onClick={() => void dispatch(markDisputeUnderReview(d.id))}>
                    {t('admin.markUnderReview')}
                  </Button>
                )}
                <Button size="small" variant="contained" onClick={() => setResolving(d)}>
                  {t('admin.resolveDispute')}
                </Button>
              </Stack>
            )}
            {d.status === 'RESOLVED' && (
              <Typography variant="body2" color="text.secondary">
                {d.resolutionType} — {d.resolutionNote}
              </Typography>
            )}
          </Paper>
        ))}
      </Stack>

      <Modal
        open={!!resolving}
        onClose={closeModal}
        title={t('admin.resolveDispute')}
        actions={
          <Button variant="contained" onClick={() => void handleResolve()} disabled={resolutionNote.trim().length < 3}>
            {t('admin.resolveDispute')}
          </Button>
        }
      >
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          <FormSelectField
            label={t('admin.resolutionType')}
            value={resolutionType}
            onChange={(v) => setResolutionType(v as DisputeResolutionType)}
            allowEmpty={false}
            options={[
              { value: 'REFUND_CLIENT', label: t('admin.resolutionRefundClient') },
              { value: 'RELEASE_SEEKER', label: t('admin.resolutionReleaseSeeker') },
              { value: 'SPLIT', label: t('admin.resolutionSplit') },
            ]}
          />
          {resolutionType === 'SPLIT' && (
            <FormTextField
              label={t('admin.seekerAmount')}
              type="number"
              value={seekerAmount}
              onChange={setSeekerAmount}
            />
          )}
          <FormTextField
            label={t('admin.resolutionNote')}
            value={resolutionNote}
            onChange={setResolutionNote}
            multiline
            minRows={3}
          />
        </Stack>
      </Modal>
    </Box>
  );
}
