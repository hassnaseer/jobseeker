import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StackScreenProps } from '@react-navigation/stack';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n/I18nProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { listMyCatalogs, listPublicCatalogs, pauseCatalog, publishCatalog, resumeCatalog } from '@/api/catalogs';
import { extractErrorMessage } from '@/api/client';
import { useAuthStore } from '@/store/authStore';
import type { ProjectCatalog } from '@/types/domain';
import type { ProfileStackParamList } from '@/navigation/types';

type Props = StackScreenProps<ProfileStackParamList, 'Catalogs'>;

const STATUS_TONE: Record<ProjectCatalog['status'], 'neutral' | 'success' | 'warning'> = {
  DRAFT: 'neutral',
  ACTIVE: 'success',
  PAUSED: 'warning',
};

export function CatalogsScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const user = useAuthStore((s) => s.user);
  const isSeeker = user?.activeRole === 'SEEKER';

  const [catalogs, setCatalogs] = useState<ProjectCatalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const request = isSeeker ? listMyCatalogs() : listPublicCatalogs();
    request
      .then(setCatalogs)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [isSeeker]);

  useEffect(load, [load]);

  async function handleTransition(catalog: ProjectCatalog, action: 'publish' | 'pause' | 'resume') {
    setBusyId(catalog.id);
    try {
      const runner = action === 'publish' ? publishCatalog : action === 'pause' ? pauseCatalog : resumeCatalog;
      await runner(catalog.id);
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.page }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>
          {isSeeker ? t('catalogs', 'myCatalogsTitle') : t('catalogs', 'browseTitle')}
        </Text>
        {isSeeker ? (
          <Button
            title={t('catalogs', 'newButton')}
            onPress={() => navigation.navigate('CatalogForm', {})}
            style={styles.newButton}
          />
        ) : null}
      </View>

      {error ? <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text> : null}

      {loading ? (
        <ActivityIndicator style={styles.loader} color={theme.primary} />
      ) : (
        <FlatList
          data={catalogs}
          keyExtractor={(c) => c.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: theme.textMuted }]}>
              {isSeeker ? t('catalogs', 'noCatalogs') : t('catalogs', 'noPublicCatalogs')}
            </Text>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation.navigate('CatalogDetail', { catalogId: item.id })}
              style={[styles.card, { borderColor: theme.border, backgroundColor: theme.cardBg }]}
            >
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
                {isSeeker ? <Badge label={item.status} tone={STATUS_TONE[item.status]} /> : null}
              </View>
              <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={2}>
                {item.description}
              </Text>
              {isSeeker ? (
                <View style={styles.actionsRow}>
                  <Button
                    title={t('catalogs', 'edit')}
                    variant="ghost"
                    onPress={() => navigation.navigate('CatalogForm', { catalogId: item.id })}
                    style={styles.actionButton}
                  />
                  {item.status === 'DRAFT' ? (
                    <Button
                      title={t('catalogs', 'publish')}
                      onPress={() => handleTransition(item, 'publish')}
                      loading={busyId === item.id}
                      style={styles.actionButton}
                    />
                  ) : null}
                  {item.status === 'ACTIVE' ? (
                    <Button
                      title={t('catalogs', 'pause')}
                      variant="secondary"
                      onPress={() => handleTransition(item, 'pause')}
                      loading={busyId === item.id}
                      style={styles.actionButton}
                    />
                  ) : null}
                  {item.status === 'PAUSED' ? (
                    <Button
                      title={t('catalogs', 'resume')}
                      variant="secondary"
                      onPress={() => handleTransition(item, 'resume')}
                      loading={busyId === item.id}
                      style={styles.actionButton}
                    />
                  ) : null}
                </View>
              ) : null}
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    marginBottom: spacing.md,
  },
  title: { fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold },
  newButton: { height: 40, paddingHorizontal: spacing.md },
  errorText: { paddingHorizontal: spacing.xl, marginBottom: spacing.md },
  loader: { marginTop: spacing.xxl },
  listContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  empty: { textAlign: 'center', marginTop: spacing.xxl },
  card: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  cardTitle: { fontSize: typography.sizes.base, fontWeight: typography.weights.bold, flex: 1, marginRight: spacing.sm },
  description: { fontSize: typography.sizes.sm, marginBottom: spacing.sm },
  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  actionButton: { height: 34, paddingHorizontal: spacing.md },
});
