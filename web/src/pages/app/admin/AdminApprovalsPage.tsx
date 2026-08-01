import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Box, Button, Checkbox, FormControlLabel, Paper, Stack, Typography } from '@mui/material';
import StatusChip from '@/components/StatusChip';
import Modal from '@/components/feedback/Modal';
import FormTextField from '@/components/form/FormTextField';
import { extractErrorMessage } from '@/api/client';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { approveProfile, fetchApprovalDetail, fetchPendingApprovals, rejectProfile } from '@/features/admin/actions';
import type { RoleProfileStatusInfo } from '@/types/profile';

export default function AdminApprovalsPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { approvals, approvalDetail } = useAppSelector((s) => s.admin);
  const [reviewing, setReviewing] = useState<RoleProfileStatusInfo | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [rejectKyc, setRejectKyc] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void dispatch(fetchPendingApprovals());
  }, [dispatch]);

  useEffect(() => {
    if (reviewing) void dispatch(fetchApprovalDetail(reviewing.userId, reviewing.role as 'CLIENT' | 'SEEKER'));
  }, [dispatch, reviewing]);

  const handleApprove = async () => {
    if (!reviewing) return;
    setError(null);
    try {
      await dispatch(approveProfile(reviewing.userId, reviewing.role as 'CLIENT' | 'SEEKER'));
      setReviewing(null);
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const handleReject = async () => {
    if (!reviewing) return;
    setError(null);
    try {
      await dispatch(rejectProfile(reviewing.userId, reviewing.role as 'CLIENT' | 'SEEKER', reason, rejectKyc));
      setReviewing(null);
      setRejecting(false);
      setReason('');
      setRejectKyc(false);
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        {t('admin.approvalsTitle')}
      </Typography>

      {approvals.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{t('admin.noApprovals')}</Typography>
        </Paper>
      )}

      <Stack spacing={1.5}>
        {approvals.map((a) => (
          <Paper key={a.id} sx={{ p: 2.5 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography sx={{ fontWeight: 700 }}>
                  {a.role} · #{a.userId.slice(0, 8)}
                </Typography>
                <StatusChip status={a.profileStatus} />
              </Box>
              <Button variant="contained" size="small" onClick={() => setReviewing(a)}>
                {t('admin.viewDetails')}
              </Button>
            </Stack>
          </Paper>
        ))}
      </Stack>

      <Modal
        open={!!reviewing}
        onClose={() => {
          setReviewing(null);
          setRejecting(false);
          setError(null);
        }}
        title={`${reviewing?.role ?? ''} · #${reviewing?.userId.slice(0, 8) ?? ''}`}
        maxWidth="md"
        actions={
          !rejecting ? (
            <Stack direction="row" spacing={1}>
              <Button color="error" onClick={() => setRejecting(true)}>
                {t('admin.reject')}
              </Button>
              <Button variant="contained" onClick={() => void handleApprove()}>
                {t('admin.approve')}
              </Button>
            </Stack>
          ) : (
            <Stack direction="row" spacing={1}>
              <Button onClick={() => setRejecting(false)}>{t('common.cancel')}</Button>
              <Button variant="contained" color="error" onClick={() => void handleReject()} disabled={reason.trim().length < 5}>
                {t('admin.reject')}
              </Button>
            </Stack>
          )
        }
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!approvalDetail && <Typography color="text.secondary">{t('common.loading')}</Typography>}

        {approvalDetail && !rejecting && (
          <Stack spacing={2}>
            <Box>
              <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Basic info</Typography>
              <Typography variant="body2">
                {approvalDetail.basic.firstName} {approvalDetail.basic.lastName} · {approvalDetail.basic.country ?? '—'} ·{' '}
                {approvalDetail.basic.city ?? '—'}
              </Typography>
            </Box>
            {approvalDetail.identity && (
              <Box>
                <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Identity / KYC</Typography>
                <Typography variant="body2">
                  {approvalDetail.identity.documentType} · {approvalDetail.identity.documentNumber}
                </Typography>
                <StatusChip status={approvalDetail.identity.kycStatus} />
              </Box>
            )}
            {approvalDetail.roleProfile && 'companyName' in approvalDetail.roleProfile && (
              <Box>
                <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Company</Typography>
                <Typography variant="body2">
                  {approvalDetail.roleProfile.companyName} · {approvalDetail.roleProfile.industry ?? '—'}
                </Typography>
              </Box>
            )}
            {approvalDetail.roleProfile && 'skills' in approvalDetail.roleProfile && (
              <Box>
                <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Seeker profile</Typography>
                <Typography variant="body2">{approvalDetail.roleProfile.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {approvalDetail.roleProfile.skills.join(', ')}
                </Typography>
              </Box>
            )}
          </Stack>
        )}

        {rejecting && (
          <Stack spacing={2}>
            <FormTextField
              label={t('admin.rejectReason')}
              value={reason}
              onChange={setReason}
              multiline
              minRows={3}
            />
            <FormControlLabel
              control={<Checkbox checked={rejectKyc} onChange={(e) => setRejectKyc(e.target.checked)} />}
              label={t('admin.rejectKyc')}
            />
          </Stack>
        )}
      </Modal>
    </Box>
  );
}
