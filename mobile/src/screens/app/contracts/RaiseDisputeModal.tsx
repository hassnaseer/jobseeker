import React, { useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n/I18nProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { raiseDispute } from '@/api/disputes';
import { extractErrorMessage } from '@/api/client';
import type { Milestone } from '@/types/domain';

interface Props {
  visible: boolean;
  onClose: () => void;
  contractId: string;
  milestones?: Milestone[];
}

export function RaiseDisputeModal({ visible, onClose, contractId, milestones }: Props) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const [milestoneId, setMilestoneId] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleClose() {
    setMilestoneId('');
    setReason('');
    setError(null);
    onClose();
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      await raiseDispute(contractId, { milestoneId: milestoneId || undefined, reason: reason.trim() });
      handleClose();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <Text style={[styles.title, { color: theme.text }]}>{t('disputes', 'raiseDisputeTitle')}</Text>
          {error ? <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text> : null}

          {milestones && milestones.length > 0 ? (
            <View style={[styles.pickerWrap, { borderColor: theme.inputBorder }]}>
              <Picker selectedValue={milestoneId} onValueChange={setMilestoneId} dropdownIconColor={theme.text}>
                <Picker.Item label={t('disputes', 'wholeContract')} value="" />
                {milestones.map((m) => (
                  <Picker.Item key={m.id} label={m.title} value={m.id} />
                ))}
              </Picker>
            </View>
          ) : null}

          <TextField
            label={t('disputes', 'reason')}
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={4}
            style={styles.reasonInput}
          />

          <View style={styles.actionsRow}>
            <Button title={t('common', 'cancel')} variant="ghost" onPress={handleClose} style={styles.actionButtonFlex} />
            <Button
              title={t('disputes', 'raiseDispute')}
              onPress={handleSubmit}
              loading={submitting}
              disabled={reason.trim().length < 5}
              style={styles.actionButtonFlex}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: spacing.xl },
  card: { borderRadius: radius.lg, padding: spacing.lg },
  title: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, marginBottom: spacing.md },
  errorText: { marginBottom: spacing.sm },
  pickerWrap: { borderWidth: 1, borderRadius: radius.md, overflow: 'hidden', marginBottom: spacing.md },
  reasonInput: { height: 90, textAlignVertical: 'top', paddingTop: spacing.sm },
  actionsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  actionButtonFlex: { flex: 1 },
});
