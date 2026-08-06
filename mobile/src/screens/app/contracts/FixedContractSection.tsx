import React, { useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n/I18nProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { useContractsStore } from '@/store/contractsStore';
import { extractErrorMessage } from '@/api/client';
import { formatMoney } from '@/utils/format';
import type { Contract, Deliverable, DeliverableStatus, Milestone, MilestoneStatus } from '@/types/domain';

const MILESTONE_TONE: Record<MilestoneStatus, 'neutral' | 'success' | 'warning' | 'error' | 'info'> = {
  PENDING: 'neutral',
  FUNDED: 'info',
  SUBMITTED: 'warning',
  APPROVED: 'success',
  RELEASED: 'success',
  DISPUTED: 'error',
};

const DELIVERABLE_TONE: Record<DeliverableStatus, 'neutral' | 'success' | 'warning' | 'error' | 'info'> = {
  SUBMITTED: 'info',
  APPROVED: 'success',
  REVISION_REQUESTED: 'warning',
};

interface Props {
  contract: Contract;
  milestones: Milestone[];
  deliverables: Deliverable[];
  isOwner: boolean;
  isSeeker: boolean;
}

export function FixedContractSection({ contract, milestones, deliverables, isOwner, isSeeker }: Props) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const {
    fundLump,
    fundOneMilestone,
    releaseOneMilestone,
    releaseOneLump,
    submitOneDeliverable,
    approveOneDeliverable,
    requestOneRevision,
  } = useContractsStore();

  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [submitTarget, setSubmitTarget] = useState<Milestone | 'lump' | null>(null);
  const [submitText, setSubmitText] = useState('');
  const [revisionTarget, setRevisionTarget] = useState<Deliverable | null>(null);
  const [revisionText, setRevisionText] = useState('');

  const isMilestoneContract = contract.pricingModel === 'MILESTONE';

  async function run(key: string, action: () => Promise<void>) {
    setError(null);
    setBusyId(key);
    try {
      await action();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  async function handleSubmitDeliverable() {
    if (!submitTarget || !submitText.trim()) return;
    await run('submit', () =>
      submitOneDeliverable(contract.id, {
        milestoneId: submitTarget !== 'lump' ? submitTarget.id : undefined,
        description: submitText.trim(),
      }),
    );
    setSubmitTarget(null);
    setSubmitText('');
  }

  async function handleRequestRevision() {
    if (!revisionTarget || !revisionText.trim()) return;
    await run('revision', () => requestOneRevision(contract.id, revisionTarget.id, revisionText.trim()));
    setRevisionTarget(null);
    setRevisionText('');
  }

  return (
    <View>
      {error ? <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text> : null}

      {contract.status === 'PENDING_FUNDING' && !isMilestoneContract && isOwner ? (
        <Button title={t('contracts', 'fundContract')} onPress={() => run('fund-lump', () => fundLump(contract.id))} loading={busyId === 'fund-lump'} style={styles.section} />
      ) : null}

      {isMilestoneContract ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('contracts', 'milestones')}</Text>
          {milestones.map((m) => (
            <View key={m.id} style={[styles.card, { borderColor: theme.border, backgroundColor: theme.cardBg }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>{m.title}</Text>
                <Badge label={m.status} tone={MILESTONE_TONE[m.status]} />
              </View>
              <Text style={[styles.cardBody, { color: theme.textSecondary }]}>{formatMoney(m.amount, m.currency)}</Text>
              {m.status === 'PENDING' && isOwner ? (
                <Button title={t('contracts', 'fundMilestone')} onPress={() => run(m.id, () => fundOneMilestone(contract.id, m.id))} loading={busyId === m.id} style={styles.actionButton} />
              ) : null}
              {m.status === 'FUNDED' && isSeeker ? (
                <Button title={t('contracts', 'submitDeliverable')} onPress={() => setSubmitTarget(m)} style={styles.actionButton} />
              ) : null}
              {m.status === 'SUBMITTED' && isOwner ? (
                <Button title={t('contracts', 'releasePayment')} onPress={() => run(m.id, () => releaseOneMilestone(contract.id, m.id))} loading={busyId === m.id} style={styles.actionButton} />
              ) : null}
            </View>
          ))}
        </View>
      ) : null}

      {!isMilestoneContract && contract.status === 'ACTIVE' && isSeeker ? (
        <Button title={t('contracts', 'submitDeliverable')} onPress={() => setSubmitTarget('lump')} style={styles.section} />
      ) : null}
      {!isMilestoneContract && contract.status === 'SUBMITTED' && isOwner ? (
        <Button title={t('contracts', 'releasePayment')} onPress={() => run('release-lump', () => releaseOneLump(contract.id))} loading={busyId === 'release-lump'} style={styles.section} />
      ) : null}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('contracts', 'deliverables')}</Text>
        {deliverables.length === 0 ? (
          <Text style={[styles.empty, { color: theme.textMuted }]}>{t('contracts', 'noDeliverables')}</Text>
        ) : null}
        {deliverables.map((d) => (
          <View key={d.id} style={[styles.card, { borderColor: theme.border, backgroundColor: theme.cardBg }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardMeta, { color: theme.textMuted }]}>{new Date(d.submittedAt).toLocaleDateString()}</Text>
              <Badge label={d.status.replace(/_/g, ' ')} tone={DELIVERABLE_TONE[d.status]} />
            </View>
            <Text style={[styles.cardBody, { color: theme.text }]}>{d.description}</Text>
            {d.feedback ? <Text style={[styles.feedback, { color: theme.warning }]}>{d.feedback}</Text> : null}
            {d.status === 'SUBMITTED' && isOwner ? (
              <View style={styles.actionsRow}>
                <Button title={t('contracts', 'approve')} onPress={() => run(d.id, () => approveOneDeliverable(contract.id, d.id))} loading={busyId === d.id} style={styles.actionButtonFlex} />
                <Button title={t('contracts', 'requestRevision')} variant="ghost" onPress={() => setRevisionTarget(d)} style={styles.actionButtonFlex} />
              </View>
            ) : null}
          </View>
        ))}
      </View>

      <Modal visible={!!submitTarget} transparent animationType="fade" onRequestClose={() => setSubmitTarget(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{t('contracts', 'submitDeliverable')}</Text>
            <TextField
              value={submitText}
              onChangeText={setSubmitText}
              placeholder={t('contracts', 'describeSubmission')}
              multiline
              numberOfLines={4}
              style={styles.modalTextarea}
            />
            <View style={styles.actionsRow}>
              <Button title={t('common', 'cancel')} variant="ghost" onPress={() => setSubmitTarget(null)} style={styles.actionButtonFlex} />
              <Button title={t('contracts', 'submit')} onPress={handleSubmitDeliverable} loading={busyId === 'submit'} style={styles.actionButtonFlex} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={!!revisionTarget} transparent animationType="fade" onRequestClose={() => setRevisionTarget(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{t('contracts', 'requestRevision')}</Text>
            <TextField
              value={revisionText}
              onChangeText={setRevisionText}
              placeholder={t('contracts', 'whatNeedsToChange')}
              multiline
              numberOfLines={4}
              style={styles.modalTextarea}
            />
            <View style={styles.actionsRow}>
              <Button title={t('common', 'cancel')} variant="ghost" onPress={() => setRevisionTarget(null)} style={styles.actionButtonFlex} />
              <Button title={t('contracts', 'send')} onPress={handleRequestRevision} loading={busyId === 'revision'} style={styles.actionButtonFlex} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: spacing.xl },
  sectionTitle: { fontSize: typography.sizes.base, fontWeight: typography.weights.medium, marginBottom: spacing.sm },
  empty: { fontSize: typography.sizes.sm },
  errorText: { marginBottom: spacing.md },
  card: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  cardTitle: { fontSize: typography.sizes.base, fontWeight: typography.weights.medium },
  cardMeta: { fontSize: typography.sizes.xs },
  cardBody: { fontSize: typography.sizes.sm, marginBottom: spacing.sm },
  feedback: { fontSize: typography.sizes.sm, marginBottom: spacing.sm },
  actionButton: { marginTop: spacing.xs },
  actionsRow: { flexDirection: 'row', gap: spacing.sm },
  actionButtonFlex: { flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: spacing.xl },
  modalCard: { borderRadius: radius.lg, padding: spacing.lg },
  modalTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, marginBottom: spacing.md },
  modalTextarea: { height: 100, textAlignVertical: 'top', paddingTop: spacing.sm },
});
