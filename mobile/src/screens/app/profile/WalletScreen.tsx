import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StackScreenProps } from '@react-navigation/stack';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { listMyTransactions, listMyWallets } from '@/api/payments';
import { extractErrorMessage } from '@/api/client';
import { formatMoney, timeAgo } from '@/utils/format';
import type { Transaction, TransactionStatus, Wallet } from '@/types/domain';
import type { ProfileStackParamList } from '@/navigation/types';

type Props = StackScreenProps<ProfileStackParamList, 'Wallet'>;

const STATUS_TONE: Record<TransactionStatus, 'neutral' | 'success' | 'warning' | 'error' | 'info'> = {
  PENDING: 'warning',
  COMPLETED: 'success',
  FAILED: 'error',
  REFUNDED: 'info',
};

export function WalletScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listMyWallets(), listMyTransactions()])
      .then(([w, t]) => {
        setWallets(w);
        setTransactions(t);
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, styles.center, { backgroundColor: theme.page }]}>
        <ActivityIndicator color={theme.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.page }]} edges={['top']}>
      <FlatList
        data={transactions}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <Text style={[styles.title, { color: theme.text }]}>Wallet</Text>
            {error ? <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text> : null}
            {wallets.map((w) => (
              <View key={w.id} style={[styles.balanceCard, { backgroundColor: theme.primary }]}>
                <Text style={styles.balanceLabel}>Available balance</Text>
                <Text style={styles.balanceValue}>{formatMoney(w.balance, w.currency)}</Text>
                {w.pendingBalance > 0 ? (
                  <Text style={styles.balancePending}>{formatMoney(w.pendingBalance, w.currency)} pending</Text>
                ) : null}
              </View>
            ))}
            <Button title="Withdraw funds" onPress={() => navigation.navigate('Withdraw')} style={styles.withdrawButton} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Transactions</Text>
          </>
        }
        ListEmptyComponent={<Text style={[styles.empty, { color: theme.textMuted }]}>No transactions yet.</Text>}
        renderItem={({ item }) => (
          <View style={[styles.txRow, { borderColor: theme.border }]}>
            <View style={styles.txLeft}>
              <Text style={[styles.txType, { color: theme.text }]}>{item.type.replace(/_/g, ' ')}</Text>
              <Text style={[styles.txDate, { color: theme.textMuted }]}>{timeAgo(item.createdAt)}</Text>
            </View>
            <View style={styles.txRight}>
              <Text style={[styles.txAmount, { color: theme.text }]}>{formatMoney(item.netAmount, item.currency)}</Text>
              <Badge label={item.status} tone={STATUS_TONE[item.status]} />
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  title: { fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold, paddingTop: spacing.lg, marginBottom: spacing.lg },
  errorText: { marginBottom: spacing.md },
  balanceCard: { borderRadius: radius.lg, padding: spacing.xl, marginBottom: spacing.md },
  balanceLabel: { color: 'rgba(255,255,255,0.85)', fontSize: typography.sizes.sm },
  balanceValue: { color: '#fff', fontSize: typography.sizes.xxxl, fontWeight: typography.weights.bold, marginTop: spacing.xs },
  balancePending: { color: 'rgba(255,255,255,0.85)', fontSize: typography.sizes.xs, marginTop: spacing.xs },
  withdrawButton: { marginBottom: spacing.xl },
  sectionTitle: { fontSize: typography.sizes.base, fontWeight: typography.weights.medium, marginBottom: spacing.sm },
  empty: { textAlign: 'center', marginTop: spacing.xl },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingVertical: spacing.md,
  },
  txLeft: { flex: 1 },
  txType: { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium },
  txDate: { fontSize: typography.sizes.xs, marginTop: 2 },
  txRight: { alignItems: 'flex-end', gap: 4 },
  txAmount: { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium },
});
