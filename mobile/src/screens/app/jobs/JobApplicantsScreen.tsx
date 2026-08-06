import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StackScreenProps } from '@react-navigation/stack';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n/I18nProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import {
  acceptApplication,
  listApplicationsForJob,
  rejectApplication,
  shortlistApplication,
} from '@/api/applications';
import { extractErrorMessage } from '@/api/client';
import { formatMoney } from '@/utils/format';
import type { Application, ApplicationStatus } from '@/types/domain';
import type { JobsStackParamList } from '@/navigation/types';

type Props = StackScreenProps<JobsStackParamList, 'JobApplicants'>;

const STATUS_TONE: Record<ApplicationStatus, 'neutral' | 'success' | 'warning' | 'error' | 'info'> = {
  PENDING: 'neutral',
  SHORTLISTED: 'info',
  ACCEPTED: 'success',
  REJECTED: 'error',
  WITHDRAWN: 'neutral',
};

export function JobApplicantsScreen({ route, navigation }: Props) {
  const { jobId } = route.params;
  const { theme } = useTheme();
  const { t } = useI18n();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    listApplicationsForJob(jobId)
      .then(setApplications)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [jobId]);

  useEffect(() => {
    load();
  }, [load]);

  async function runAction(app: Application, action: (id: string) => Promise<Application>) {
    setActionId(app.id);
    setError(null);
    try {
      const updated = await action(app.id);
      setApplications((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setActionId(null);
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.page }]} edges={['top']}>
      <Text style={[styles.title, { color: theme.text }]}>{t('jobs', 'applicants')}</Text>
      {error ? <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text> : null}

      {loading ? (
        <ActivityIndicator style={styles.loader} color={theme.primary} />
      ) : (
        <FlatList
          data={applications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={[styles.empty, { color: theme.textMuted }]}>{t('jobs', 'noApplicants')}</Text>}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.bid, { color: theme.text }]}>
                  {item.proposedHourlyRate
                    ? `${formatMoney(item.proposedHourlyRate, item.currency)}/hr`
                    : item.bidAmount
                      ? formatMoney(item.bidAmount, item.currency)
                      : t('jobs', 'noBid')}
                </Text>
                <Badge label={item.status} tone={STATUS_TONE[item.status]} />
              </View>
              <Text style={[styles.cover, { color: theme.textSecondary }]} numberOfLines={4}>
                {item.coverLetter}
              </Text>

              {item.status === 'PENDING' || item.status === 'SHORTLISTED' ? (
                <View style={styles.actionsRow}>
                  {item.status === 'PENDING' ? (
                    <Button
                      title={t('jobs', 'shortlist')}
                      variant="secondary"
                      onPress={() => runAction(item, shortlistApplication)}
                      loading={actionId === item.id}
                      style={styles.actionButton}
                    />
                  ) : null}
                  <Button
                    title={t('jobs', 'accept')}
                    onPress={() => runAction(item, acceptApplication)}
                    loading={actionId === item.id}
                    style={styles.actionButton}
                  />
                  <Button
                    title={t('jobs', 'reject')}
                    variant="ghost"
                    onPress={() => runAction(item, rejectApplication)}
                    loading={actionId === item.id}
                    style={styles.actionButton}
                  />
                </View>
              ) : null}

              {item.status === 'ACCEPTED' ? (
                <Button
                  title={t('jobs', 'hire')}
                  onPress={() => navigation.navigate('HireApplicant', { jobId, applicationId: item.id })}
                  style={styles.actionButton}
                />
              ) : null}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  title: { fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold, paddingHorizontal: spacing.xl, marginBottom: spacing.md },
  loader: { marginTop: spacing.xxl },
  listContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  empty: { textAlign: 'center', marginTop: spacing.xxl },
  errorText: { paddingHorizontal: spacing.xl, marginBottom: spacing.md },
  card: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  bid: { fontSize: typography.sizes.base, fontWeight: typography.weights.medium },
  cover: { fontSize: typography.sizes.sm, marginBottom: spacing.sm },
  actionsRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  actionButton: { flexGrow: 1 },
});
