import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n/I18nProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { listDisputesQueue, markDisputeUnderReview, resolveDispute } from '@/api/admin';
import { extractErrorMessage } from '@/api/client';
import type { Dispute, DisputeResolutionType, DisputeStatus } from '@/types/domain';

const STATUS_TONE: Record<DisputeStatus, 'neutral' | 'success' | 'warning' | 'error' | 'info'> = {
  OPEN: 'warning',
  UNDER_REVIEW: 'info',
  RESOLVED: 'success',
};

export function AdminDisputesScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const [items, setItems] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [resolveTarget, setResolveTarget] = useState<Dispute | null>(null);
  const [resolutionType, setResolutionType] = useState<DisputeResolutionType>('SPLIT');
  const [resolutionNote, setResolutionNote] = useState('');
  const [seekerAmount, setSeekerAmount] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    listDisputesQueue()
      .then(setItems)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  async function handleUnderReview(dispute: Dispute) {
    setBusyId(dispute.id);
    try {
      const updated = await markDisputeUnderReview(dispute.id);
      setItems((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  async function handleResolve() {
    if (!resolveTarget) return;
    setBusyId(resolveTarget.id);
    try {
      const updated = await resolveDispute(resolveTarget.id, {
        resolutionType,
        resolutionNote,
        seekerAmount: seekerAmount ? Number(seekerAmount) : undefined,
      });
      setItems((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      setResolveTarget(null);
      setResolutionNote('');
      setSeekerAmount('');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.page }]} edges={['top']}>
      <Text style={[styles.title, { color: theme.text }]}>{t('admin', 'disputesTitle')}</Text>
      {error ? <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text> : null}
      {loading ? (
        <ActivityIndicator style={styles.loader} color={theme.primary} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(d) => d.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={[styles.empty, { color: theme.textMuted }]}>{t('admin', 'noDisputesQueue')}</Text>}
          renderItem={({ item }) => (
            <View style={[styles.card, { borderColor: theme.border, backgroundColor: theme.cardBg }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>{t('admin', 'contract')} #{item.contractId.slice(0, 8)}</Text>
                <Badge label={item.status.replace(/_/g, ' ')} tone={STATUS_TONE[item.status]} />
              </View>
              <Text style={[styles.reason, { color: theme.textSecondary }]}>{item.reason}</Text>
              {item.status === 'OPEN' ? (
                <Button title={t('admin', 'startReview')} onPress={() => handleUnderReview(item)} loading={busyId === item.id} style={styles.actionButton} />
              ) : null}
              {item.status === 'UNDER_REVIEW' ? (
                <Button title={t('admin', 'resolve')} onPress={() => setResolveTarget(item)} style={styles.actionButton} />
              ) : null}
            </View>
          )}
        />
      )}

      <Modal visible={!!resolveTarget} transparent animationType="fade" onRequestClose={() => setResolveTarget(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{t('admin', 'resolveDisputeTitle')}</Text>
            <View style={[styles.pickerWrap, { borderColor: theme.inputBorder }]}>
              <Picker selectedValue={resolutionType} onValueChange={(v) => setResolutionType(v as DisputeResolutionType)} dropdownIconColor={theme.text}>
                <Picker.Item label={t('admin', 'refundClient')} value="REFUND_CLIENT" />
                <Picker.Item label={t('admin', 'releaseToSeeker')} value="RELEASE_SEEKER" />
                <Picker.Item label={t('admin', 'split')} value="SPLIT" />
              </Picker>
            </View>
            {resolutionType === 'SPLIT' ? (
              <TextField label={t('admin', 'seekerAmount')} value={seekerAmount} onChangeText={setSeekerAmount} keyboardType="numeric" />
            ) : null}
            <TextField
              label={t('admin', 'resolutionNote')}
              value={resolutionNote}
              onChangeText={setResolutionNote}
              multiline
              numberOfLines={3}
              style={styles.noteInput}
            />
            <View style={styles.actionsRow}>
              <Button title={t('common', 'cancel')} variant="ghost" onPress={() => setResolveTarget(null)} style={styles.actionButtonFlex} />
              <Button title={t('admin', 'resolve')} onPress={handleResolve} loading={busyId === resolveTarget?.id} disabled={!resolutionNote.trim()} style={styles.actionButtonFlex} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    marginBottom: spacing.md,
  },
  errorText: { paddingHorizontal: spacing.xl, marginBottom: spacing.md },
  loader: { marginTop: spacing.xxl },
  listContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  empty: { textAlign: 'center', marginTop: spacing.xxl },
  card: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  cardTitle: { fontSize: typography.sizes.base, fontWeight: typography.weights.medium },
  reason: { fontSize: typography.sizes.sm, marginBottom: spacing.sm },
  actionButton: { marginTop: spacing.xs },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: spacing.xl },
  modalCard: { borderRadius: radius.lg, padding: spacing.lg },
  modalTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, marginBottom: spacing.md },
  pickerWrap: { borderWidth: 1, borderRadius: radius.md, overflow: 'hidden', marginBottom: spacing.md },
  noteInput: { height: 80, textAlignVertical: 'top', paddingTop: spacing.sm },
  actionsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  actionButtonFlex: { flex: 1 },
});
