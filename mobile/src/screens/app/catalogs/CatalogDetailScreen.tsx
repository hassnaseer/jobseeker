import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StackScreenProps } from '@react-navigation/stack';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/Button';
import { getCatalogDetail, orderTier } from '@/api/catalogs';
import { extractErrorMessage } from '@/api/client';
import { useAuthStore } from '@/store/authStore';
import { formatMoney } from '@/utils/format';
import type { CatalogTier, ProjectCatalog } from '@/types/domain';
import type { ProfileStackParamList } from '@/navigation/types';

type Props = StackScreenProps<ProfileStackParamList, 'CatalogDetail'>;

export function CatalogDetailScreen({ route, navigation }: Props) {
  const { catalogId } = route.params;
  const { theme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const isClient = user?.activeRole === 'CLIENT';

  const [catalog, setCatalog] = useState<ProjectCatalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderTarget, setOrderTarget] = useState<CatalogTier | null>(null);
  const [ordering, setOrdering] = useState(false);
  const [ordered, setOrdered] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    getCatalogDetail(catalogId)
      .then(setCatalog)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [catalogId]);

  useEffect(load, [load]);

  const isOwner = user?.id === catalog?.seekerId;

  async function handleOrder() {
    if (!orderTarget) return;
    setOrdering(true);
    setError(null);
    try {
      await orderTier(orderTarget.id);
      setOrderTarget(null);
      setOrdered(true);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setOrdering(false);
    }
  }

  if (loading || !catalog) {
    return (
      <SafeAreaView style={[styles.safe, styles.center, { backgroundColor: theme.page }]}>
        <ActivityIndicator color={theme.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.page }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        {error ? <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text> : null}
        {ordered ? (
          <Text style={[styles.successText, { color: theme.success }]}>
            Order placed — find the new contract in the Contracts tab.
          </Text>
        ) : null}

        <Text style={[styles.title, { color: theme.text }]}>{catalog.title}</Text>
        <Text style={[styles.description, { color: theme.textSecondary }]}>{catalog.description}</Text>

        {isOwner ? (
          <Button
            title="Edit catalog"
            variant="secondary"
            onPress={() => navigation.navigate('CatalogForm', { catalogId: catalog.id })}
            style={styles.editButton}
          />
        ) : null}

        {(catalog.tiers ?? []).map((tier) => (
          <View key={tier.id} style={[styles.tierCard, { borderColor: theme.border, backgroundColor: theme.cardBg }]}>
            <Text style={[styles.tierName, { color: theme.text }]}>{tier.name}</Text>
            <Text style={[styles.tierPrice, { color: theme.primary }]}>{formatMoney(tier.price, tier.currency)}</Text>
            <Text style={[styles.tierMeta, { color: theme.textSecondary }]}>
              {tier.deliveryDays} days · {tier.revisions} revisions
            </Text>
            {tier.features.map((f) => (
              <Text key={f} style={[styles.feature, { color: theme.text }]}>
                • {f}
              </Text>
            ))}
            {isClient ? (
              <Button title="Order" onPress={() => setOrderTarget(tier)} style={styles.orderButton} />
            ) : null}
          </View>
        ))}
      </ScrollView>

      <Modal visible={!!orderTarget} transparent animationType="fade" onRequestClose={() => setOrderTarget(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Order this tier?</Text>
            <Text style={[styles.modalBody, { color: theme.textSecondary }]}>
              This creates a contract with the seeker for {orderTarget?.name}.
            </Text>
            <View style={styles.actionsRow}>
              <Button title="Cancel" variant="ghost" onPress={() => setOrderTarget(null)} style={styles.actionButtonFlex} />
              <Button title="Order" onPress={handleOrder} loading={ordering} style={styles.actionButtonFlex} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.xl, paddingBottom: spacing.xxl },
  errorText: { marginBottom: spacing.md },
  successText: { marginBottom: spacing.md, fontSize: typography.sizes.sm, fontWeight: typography.weights.medium },
  title: { fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold, marginBottom: spacing.sm },
  description: { fontSize: typography.sizes.base, marginBottom: spacing.lg },
  editButton: { marginBottom: spacing.lg, alignSelf: 'flex-start', height: 40, paddingHorizontal: spacing.lg },
  tierCard: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  tierName: { fontSize: typography.sizes.base, fontWeight: typography.weights.bold },
  tierPrice: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, marginVertical: spacing.xs },
  tierMeta: { fontSize: typography.sizes.sm, marginBottom: spacing.sm },
  feature: { fontSize: typography.sizes.sm, marginBottom: 2 },
  orderButton: { marginTop: spacing.md },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: spacing.xl },
  modalCard: { borderRadius: radius.lg, padding: spacing.lg },
  modalTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, marginBottom: spacing.sm },
  modalBody: { fontSize: typography.sizes.sm, marginBottom: spacing.md },
  actionsRow: { flexDirection: 'row', gap: spacing.sm },
  actionButtonFlex: { flex: 1 },
});
