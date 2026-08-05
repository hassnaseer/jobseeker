import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { approveProfile, listPendingApprovals, rejectProfile } from '@/api/admin';
import { extractErrorMessage } from '@/api/client';
import type { RoleProfileStatusInfo } from '@/types/profile';

export function AdminApprovalsScreen() {
  const { theme } = useTheme();
  const [items, setItems] = useState<RoleProfileStatusInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    listPendingApprovals()
      .then(setItems)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  async function handleApprove(item: RoleProfileStatusInfo) {
    setBusyId(item.id);
    try {
      await approveProfile(item.userId, item.role);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(item: RoleProfileStatusInfo) {
    setBusyId(item.id);
    try {
      await rejectProfile(item.userId, item.role, 'Profile did not meet requirements');
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.page }]} edges={['top']}>
      <Text style={[styles.title, { color: theme.text }]}>Pending approvals</Text>
      {error ? <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text> : null}
      {loading ? (
        <ActivityIndicator style={styles.loader} color={theme.primary} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={[styles.empty, { color: theme.textMuted }]}>Nothing pending review.</Text>}
          renderItem={({ item }) => (
            <View style={[styles.card, { borderColor: theme.border, backgroundColor: theme.cardBg }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>User #{item.userId.slice(0, 8)}</Text>
                <Badge label={item.role} tone="info" />
              </View>
              <View style={styles.actionsRow}>
                <Button title="Approve" onPress={() => handleApprove(item)} loading={busyId === item.id} style={styles.actionButton} />
                <Button title="Reject" variant="ghost" onPress={() => handleReject(item)} loading={busyId === item.id} style={styles.actionButton} />
              </View>
            </View>
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
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  cardTitle: { fontSize: typography.sizes.base, fontWeight: typography.weights.medium },
  actionsRow: { flexDirection: 'row', gap: spacing.sm },
  actionButton: { flex: 1 },
});
