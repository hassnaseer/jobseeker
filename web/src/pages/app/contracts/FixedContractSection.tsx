import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Box, Button, Paper, Stack, Typography } from '@mui/material';
import StatusChip from '@/components/StatusChip';
import ConfirmDialog from '@/components/feedback/ConfirmDialog';
import Modal from '@/components/feedback/Modal';
import FormTextField from '@/components/form/FormTextField';
import { useAppDispatch } from '@/app/hooks';
import {
  approveDeliverable,
  fundContract,
  fundMilestone,
  releaseLump,
  releaseMilestone,
  requestRevision,
  submitDeliverable,
} from '@/features/contracts/actions';
import { extractErrorMessage } from '@/api/client';
import type { Contract, Deliverable, Milestone } from '@/types/domain';

interface Props {
  contract: Contract;
  milestones: Milestone[];
  deliverables: Deliverable[];
  isOwner: boolean;
  isSeeker: boolean;
}

export default function FixedContractSection({ contract, milestones, deliverables, isOwner, isSeeker }: Props) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);
  const [fundTarget, setFundTarget] = useState<'lump' | Milestone | null>(null);
  const [releaseTarget, setReleaseTarget] = useState<Milestone | null>(null);
  const [submitTarget, setSubmitTarget] = useState<Milestone | 'lump' | null>(null);
  const [revisionTarget, setRevisionTarget] = useState<Deliverable | null>(null);

  const run = async (action: () => Promise<void>) => {
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const isMilestoneContract = contract.pricingModel === 'MILESTONE';

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {contract.status === 'PENDING_FUNDING' && !isMilestoneContract && isOwner && (
        <Button variant="contained" onClick={() => setFundTarget('lump')} sx={{ mb: 3 }}>
          {t('contracts.fund')}
        </Button>
      )}

      {isMilestoneContract && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
            {t('contracts.milestones')}
          </Typography>
          <Stack spacing={1.5}>
            {milestones.map((m) => (
              <Paper key={m.id} variant="outlined" sx={{ p: 2 }}>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography sx={{ fontWeight: 700 }}>{m.title}</Typography>
                  <StatusChip status={m.status} />
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  {m.currency} {m.amount}
                </Typography>
                <Stack direction="row" spacing={1}>
                  {m.status === 'PENDING' && isOwner && (
                    <Button size="small" variant="contained" onClick={() => setFundTarget(m)}>
                      {t('contracts.fundMilestone')}
                    </Button>
                  )}
                  {m.status === 'FUNDED' && isSeeker && (
                    <Button size="small" variant="contained" onClick={() => setSubmitTarget(m)}>
                      {t('contracts.submitDeliverable')}
                    </Button>
                  )}
                  {m.status === 'SUBMITTED' && isOwner && (
                    <Button size="small" variant="contained" onClick={() => setReleaseTarget(m)}>
                      {t('contracts.releaseMilestone')}
                    </Button>
                  )}
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Box>
      )}

      {!isMilestoneContract && contract.status === 'ACTIVE' && isSeeker && (
        <Button variant="contained" onClick={() => setSubmitTarget('lump')} sx={{ mb: 3 }}>
          {t('contracts.submitDeliverable')}
        </Button>
      )}
      {!isMilestoneContract && contract.status === 'SUBMITTED' && isOwner && (
        <Button
          variant="contained"
          onClick={() =>
            run(async () => {
              await dispatch(releaseLump(contract.id));
            })
          }
          sx={{ mb: 3 }}
        >
          {t('contracts.releaseMilestone')}
        </Button>
      )}

      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
        {t('contracts.deliverables')}
      </Typography>
      {deliverables.length === 0 && (
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {t('contracts.noDeliverablesYet')}
        </Typography>
      )}
      <Stack spacing={1.5}>
        {deliverables.map((d) => (
          <Paper key={d.id} variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {new Date(d.submittedAt).toLocaleString()}
              </Typography>
              <StatusChip status={d.status} />
            </Stack>
            <Typography sx={{ mb: 1 }}>{d.description}</Typography>
            {d.feedback && (
              <Alert severity="warning" sx={{ mb: 1 }}>
                {d.feedback}
              </Alert>
            )}
            {d.status === 'SUBMITTED' && isOwner && (
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() =>
                    run(async () => {
                      await dispatch(approveDeliverable(contract.id, d.id));
                    })
                  }
                >
                  {t('contracts.approve')}
                </Button>
                <Button size="small" color="warning" onClick={() => setRevisionTarget(d)}>
                  {t('contracts.requestRevision')}
                </Button>
              </Stack>
            )}
          </Paper>
        ))}
      </Stack>

      <ConfirmDialog
        open={!!fundTarget}
        title={t('contracts.fundConfirmTitle')}
        message={t('contracts.fundConfirmBody')}
        confirmLabel={t('contracts.fund')}
        onClose={() => setFundTarget(null)}
        onConfirm={async () => {
          await run(async () => {
            if (fundTarget === 'lump') {
              await dispatch(fundContract(contract.id));
            } else if (fundTarget) {
              await dispatch(fundMilestone(contract.id, fundTarget.id));
            }
          });
          setFundTarget(null);
        }}
      />

      <ConfirmDialog
        open={!!releaseTarget}
        title={t('contracts.releaseConfirmTitle')}
        message={t('contracts.releaseConfirmBody')}
        confirmLabel={t('contracts.releaseMilestone')}
        onClose={() => setReleaseTarget(null)}
        onConfirm={async () => {
          if (releaseTarget) {
            await run(async () => {
              await dispatch(releaseMilestone(contract.id, releaseTarget.id));
            });
          }
          setReleaseTarget(null);
        }}
      />

      <SubmitDeliverableModal
        contractId={contract.id}
        target={submitTarget}
        onClose={() => setSubmitTarget(null)}
      />

      <RequestRevisionModal
        contractId={contract.id}
        deliverable={revisionTarget}
        onClose={() => setRevisionTarget(null)}
      />
    </Box>
  );
}

function SubmitDeliverableModal({
  contractId,
  target,
  onClose,
}: {
  contractId: string;
  target: Milestone | 'lump' | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await dispatch(
        submitDeliverable(contractId, {
          milestoneId: target && target !== 'lump' ? target.id : undefined,
          description,
        }),
      );
      setDescription('');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={!!target}
      onClose={onClose}
      title={t('contracts.submitDeliverable')}
      actions={
        <Button variant="contained" onClick={handleSubmit} disabled={submitting || !description}>
          {t('contracts.submitDeliverable')}
        </Button>
      }
    >
      <FormTextField
        label={t('contracts.deliverableDescription')}
        value={description}
        onChange={setDescription}
        multiline
        minRows={4}
      />
    </Modal>
  );
}

function RequestRevisionModal({
  contractId,
  deliverable,
  onClose,
}: {
  contractId: string;
  deliverable: Deliverable | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!deliverable) return;
    setSubmitting(true);
    try {
      await dispatch(requestRevision(contractId, deliverable.id, feedback));
      setFeedback('');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={!!deliverable}
      onClose={onClose}
      title={t('contracts.requestRevision')}
      actions={
        <Button variant="contained" color="warning" onClick={handleSubmit} disabled={submitting || !feedback}>
          {t('contracts.requestRevision')}
        </Button>
      }
    >
      <FormTextField
        label={t('contracts.revisionFeedback')}
        value={feedback}
        onChange={setFeedback}
        multiline
        minRows={3}
      />
    </Modal>
  );
}
