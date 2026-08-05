import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StackScreenProps } from '@react-navigation/stack';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Badge } from '@/components/Badge';
import { listMyDisputes } from '@/api/disputes';
import { extractErrorMessage } from '@/api/client';
import type { Dispute, DisputeStatus } from '@/types/domain';
import type { ProfileStackParamList } from '@/navigation/types';

type Props = StackScreenProps<ProfileStackParamList, 'Disputes'>;

const STATUS_TONE: Record<DisputeStatus, 'neutral' | 'success' | 'warning' | 'info'> = {
  OPEN: 'warning',
  UNDER_REVIEW: 'info',
  RESOLVED: 'success',
};

export function DisputesListScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    listMyDisputes()
      .then(setDisputes)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.page }]} edges={['top']}>
      <Text style={[styles.title, { color: theme.text }]}>Disputes</Text>
      {error ? <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text> : null}
      {loading ? (
        <ActivityIndicator style={styles.loader} color={theme.primary} />
      ) : (
        <FlatList
          data={disputes}
          keyExtractor={(d) => d.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={[styles.empty, { color: theme.textMuted }]}>No disputes yet.</Text>}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation.navigate('DisputeDetail', { disputeId: item.id })}
              style={[styles.card, { borderColor: theme.border, backgroundColor: theme.cardBg }]}
            >
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>Contract #{item.contractId.slice(0, 8)}</Text>
                <Badge label={item.status.replace(/_/g, ' ')} tone={STATUS_TONE[item.status]} />
              </View>
              <Text style={[styles.date, { color: theme.textSecondary }]}>{new Date(item.createdAt).toLocaleString()}</Text>
              <Text style={[styles.reason, { color: theme.text }]} numberOfLines={2}>
                {item.reason}
              </Text>
            </Pressable>
          )}
        />
      )}
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
  cardTitle: { fontSize: typography.sizes.base, fontWeight: typography.weights.bold },
  date: { fontSize: typography.sizes.xs, marginBottom: spacing.xs },
  reason: { fontSize: typography.sizes.sm },
});
