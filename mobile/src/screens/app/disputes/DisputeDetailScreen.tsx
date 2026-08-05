import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StackScreenProps } from '@react-navigation/stack';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n/I18nProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Badge } from '@/components/Badge';
import { getDisputeDetail } from '@/api/disputes';
import { extractErrorMessage } from '@/api/client';
import type { Dispute, DisputeStatus } from '@/types/domain';
import type { ProfileStackParamList } from '@/navigation/types';

type Props = StackScreenProps<ProfileStackParamList, 'DisputeDetail'>;

const STATUS_TONE: Record<DisputeStatus, 'neutral' | 'success' | 'warning' | 'info'> = {
  OPEN: 'warning',
  UNDER_REVIEW: 'info',
  RESOLVED: 'success',
};

export function DisputeDetailScreen({ route }: Props) {
  const { disputeId } = route.params;
  const { theme } = useTheme();
  const { t } = useI18n();
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDisputeDetail(disputeId)
      .then(setDispute)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [disputeId]);

  if (loading || !dispute) {
    return (
      <SafeAreaView style={[styles.safe, styles.center, { backgroundColor: theme.page }]}>
        {error ? <Text style={{ color: theme.error }}>{error}</Text> : <ActivityIndicator color={theme.primary} />}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.page }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, { borderColor: theme.border, backgroundColor: theme.cardBg }]}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: theme.text }]}>{t('disputes', 'contract')} #{dispute.contractId.slice(0, 8)}</Text>
            <Badge label={dispute.status.replace(/_/g, ' ')} tone={STATUS_TONE[dispute.status]} />
          </View>
          <Text style={[styles.date, { color: theme.textSecondary }]}>{new Date(dispute.createdAt).toLocaleString()}</Text>
          <Text style={[styles.reason, { color: theme.text }]}>{dispute.reason}</Text>

          {dispute.evidence.length > 0 ? (
            <View style={styles.evidenceSection}>
              <Text style={[styles.sectionLabel, { color: theme.text }]}>{t('disputes', 'evidence')}</Text>
              {dispute.evidence.map((url, i) => (
                <Text key={i} style={[styles.evidenceLink, { color: theme.primary }]}>
                  {url}
                </Text>
              ))}
            </View>
          ) : null}
        </View>

        {dispute.status === 'RESOLVED' ? (
          <View style={[styles.card, { borderColor: theme.border, backgroundColor: theme.cardBg }]}>
            <Text style={[styles.sectionLabel, { color: theme.text }]}>{t('disputes', 'resolution')}</Text>
            {dispute.resolutionType ? (
              <Badge label={dispute.resolutionType.replace(/_/g, ' ')} tone="info" />
            ) : null}
            {dispute.resolutionNote ? (
              <Text style={[styles.reason, { color: theme.text, marginTop: spacing.sm }]}>{dispute.resolutionNote}</Text>
            ) : null}
            {dispute.resolvedAt ? (
              <Text style={[styles.date, { color: theme.textSecondary, marginTop: spacing.sm }]}>
                {new Date(dispute.resolvedAt).toLocaleString()}
              </Text>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.xl, paddingBottom: spacing.xxl },
  card: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  title: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, flex: 1, marginRight: spacing.sm },
  date: { fontSize: typography.sizes.xs, marginBottom: spacing.sm },
  reason: { fontSize: typography.sizes.base },
  evidenceSection: { marginTop: spacing.md },
  sectionLabel: { fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, marginBottom: spacing.xs },
  evidenceLink: { fontSize: typography.sizes.sm, marginBottom: spacing.xs },
});
