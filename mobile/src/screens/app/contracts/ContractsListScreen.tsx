import React, { useCallback, useEffect } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StackScreenProps } from '@react-navigation/stack';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Badge } from '@/components/Badge';
import { useContractsStore } from '@/store/contractsStore';
import { formatMoney } from '@/utils/format';
import type { Contract, ContractStatus } from '@/types/domain';
import type { ContractsStackParamList } from '@/navigation/types';

type Props = StackScreenProps<ContractsStackParamList, 'ContractsList'>;

const STATUS_TONE: Record<ContractStatus, 'neutral' | 'success' | 'warning' | 'error' | 'info'> = {
  PENDING_FUNDING: 'warning',
  ACTIVE: 'info',
  SUBMITTED: 'info',
  REVISION: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'error',
  DISPUTED: 'error',
};

function ContractCard({ contract, onPress }: { contract: Contract; onPress: () => void }) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.cardBg, borderColor: theme.border, opacity: pressed ? 0.9 : 1 },
      ]}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>
          {contract.type === 'FIXED' ? 'Fixed-price contract' : 'Hourly contract'}
        </Text>
        <Badge label={contract.status.replace(/_/g, ' ')} tone={STATUS_TONE[contract.status]} />
      </View>
      <Text style={[styles.amount, { color: theme.primary }]}>
        {contract.type === 'FIXED'
          ? formatMoney(contract.agreedAmount, contract.currency)
          : `${formatMoney(contract.agreedHourlyRate, contract.currency)}/hr`}
      </Text>
    </Pressable>
  );
}

export function ContractsListScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { mine, status, fetchMine } = useContractsStore();

  const load = useCallback(() => {
    fetchMine().catch(() => undefined);
  }, [fetchMine]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation, load]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.page }]} edges={['top']}>
      <Text style={[styles.title, { color: theme.text }]}>Contracts</Text>
      <FlatList
        data={mine}
        keyExtractor={(c) => c.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <ContractCard contract={item} onPress={() => navigation.navigate('ContractDetail', { contractId: item.id })} />
        )}
        refreshing={status === 'loading' && mine.length === 0}
        onRefresh={load}
        ListEmptyComponent={
          status !== 'loading' ? (
            <Text style={[styles.empty, { color: theme.textMuted }]}>
              No contracts yet. They appear here once a hire is made.
            </Text>
          ) : null
        }
      />
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
  listContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  empty: { textAlign: 'center', marginTop: spacing.xxl },
  card: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  cardTitle: { fontSize: typography.sizes.base, fontWeight: typography.weights.medium },
  amount: { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium },
});
