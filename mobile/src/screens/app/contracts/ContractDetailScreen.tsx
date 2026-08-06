import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StackScreenProps } from '@react-navigation/stack';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n/I18nProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { useContractsStore } from '@/store/contractsStore';
import { useTimesheetsStore } from '@/store/timesheetsStore';
import { useAuthStore } from '@/store/authStore';
import { formatMoney } from '@/utils/format';
import { FixedContractSection } from './FixedContractSection';
import { HourlyContractSection } from './HourlyContractSection';
import { ReviewsSection } from './ReviewsSection';
import { RaiseDisputeModal } from './RaiseDisputeModal';
import type { ContractsStackParamList } from '@/navigation/types';

const DISPUTABLE_STATUSES = ['ACTIVE', 'SUBMITTED', 'REVISION'];

type Props = StackScreenProps<ContractsStackParamList, 'ContractDetail'>;

export function ContractDetailScreen({ route }: Props) {
  const { contractId } = route.params;
  const { theme } = useTheme();
  const { t } = useI18n();
  const user = useAuthStore((s) => s.user);
  const { detail, milestones, deliverables, status, fetchDetail, clearDetail } = useContractsStore();
  const clearTimesheets = useTimesheetsStore((s) => s.clear);
  const [disputeOpen, setDisputeOpen] = useState(false);

  useEffect(() => {
    fetchDetail(contractId).catch(() => undefined);
    return () => {
      clearDetail();
      clearTimesheets();
    };
  }, [contractId, fetchDetail, clearDetail, clearTimesheets]);

  if (status === 'loading' || !detail) {
    return (
      <SafeAreaView style={[styles.safe, styles.center, { backgroundColor: theme.page }]}>
        <ActivityIndicator color={theme.primary} />
      </SafeAreaView>
    );
  }

  const isOwner = user?.id === detail.clientId;
  const isSeeker = user?.id === detail.seekerId;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.page }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.header, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <View style={styles.headerRow}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              {detail.type === 'FIXED' ? t('contracts', 'fixedPriceContract') : t('contracts', 'hourlyContract')}
            </Text>
            <Badge label={detail.status.replace(/_/g, ' ')} />
          </View>
          {DISPUTABLE_STATUSES.includes(detail.status) ? (
            <Button
              title={t('contracts', 'raiseDispute')}
              variant="ghost"
              onPress={() => setDisputeOpen(true)}
              style={styles.disputeButton}
            />
          ) : null}
          <Text style={[styles.headerMeta, { color: theme.textSecondary }]}>
            {t('contracts', 'amount')}:{' '}
            {detail.type === 'FIXED'
              ? formatMoney(detail.agreedAmount, detail.currency)
              : `${formatMoney(detail.agreedHourlyRate, detail.currency)}/hr`}
          </Text>
          {detail.startedAt ? (
            <Text style={[styles.headerMeta, { color: theme.textSecondary }]}>
              {t('contracts', 'started')}: {new Date(detail.startedAt).toLocaleDateString()}
            </Text>
          ) : null}
        </View>

        {detail.type === 'FIXED' ? (
          <FixedContractSection contract={detail} milestones={milestones} deliverables={deliverables} isOwner={isOwner} isSeeker={isSeeker} />
        ) : (
          <HourlyContractSection contract={detail} isOwner={isOwner} isSeeker={isSeeker} />
        )}

        {detail.status === 'COMPLETED' && user ? <ReviewsSection contract={detail} currentUserId={user.id} /> : null}
      </ScrollView>

      <RaiseDisputeModal
        visible={disputeOpen}
        onClose={() => setDisputeOpen(false)}
        contractId={detail.id}
        milestones={detail.type === 'FIXED' && detail.pricingModel === 'MILESTONE' ? milestones : undefined}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.xl, paddingBottom: spacing.xxl },
  header: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.xl },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  headerTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold },
  disputeButton: { alignSelf: 'flex-start', height: 32, paddingHorizontal: spacing.sm, marginBottom: spacing.xs },
  headerMeta: { fontSize: typography.sizes.sm },
});
