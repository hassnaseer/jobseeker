import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/Button';
import { JobCard } from '@/components/JobCard';
import { getJobDetail } from '@/api/jobs';
import { listSavedItems, unsaveItem } from '@/api/savedItems';
import { extractErrorMessage } from '@/api/client';
import { useAuthStore } from '@/store/authStore';
import type { Job, SavedItem } from '@/types/domain';

export function FavoritesScreen() {
  const { theme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const isClient = user?.activeRole === 'CLIENT';

  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedTalent, setSavedTalent] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    if (isClient) {
      listSavedItems('SEEKER')
        .then(setSavedTalent)
        .catch((err) => setError(extractErrorMessage(err)))
        .finally(() => setLoading(false));
    } else {
      listSavedItems('JOB')
        .then(async (items) => {
          const results = await Promise.all(items.map((item) => getJobDetail(item.targetId).catch(() => null)));
          setJobs(results.filter((j): j is Job => j !== null));
        })
        .catch((err) => setError(extractErrorMessage(err)))
        .finally(() => setLoading(false));
    }
  }, [isClient]);

  useEffect(load, [load]);

  async function handleUnsaveJob(jobId: string) {
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
    try {
      await unsaveItem('JOB', jobId);
    } catch {
      // best-effort — leave removed from view even if the server call fails
    }
  }

  async function handleUnsaveTalent(item: SavedItem) {
    setSavedTalent((prev) => prev.filter((s) => s.id !== item.id));
    try {
      await unsaveItem('SEEKER', item.targetId);
    } catch {
      // best-effort — leave removed from view even if the server call fails
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.page }]} edges={['top']}>
      <Text style={[styles.title, { color: theme.text }]}>{isClient ? 'Saved talent' : 'Favorites'}</Text>
      {loading ? (
        <ActivityIndicator style={styles.loader} color={theme.primary} />
      ) : isClient ? (
        <FlatList
          data={savedTalent}
          keyExtractor={(s) => s.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: error ? theme.error : theme.textMuted }]}>
              {error ?? 'No saved talent yet.'}
            </Text>
          }
          renderItem={({ item }) => (
            <View style={[styles.talentRow, { borderColor: theme.border, backgroundColor: theme.cardBg }]}>
              <Text style={[styles.talentLabel, { color: theme.text }]}>Saved talent #{item.targetId.slice(0, 8)}</Text>
              <Button title="Remove" variant="ghost" onPress={() => handleUnsaveTalent(item)} style={styles.removeButton} />
            </View>
          )}
        />
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(j) => j.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: error ? theme.error : theme.textMuted }]}>
              {error ?? 'No saved jobs yet.'}
            </Text>
          }
          renderItem={({ item }) => <JobCard job={item} onPress={() => handleUnsaveJob(item.id)} />}
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
  loader: { marginTop: spacing.xxl },
  listContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  empty: { textAlign: 'center', marginTop: spacing.xxl },
  talentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  talentLabel: { fontSize: typography.sizes.base, flex: 1 },
  removeButton: { height: 32, paddingHorizontal: spacing.sm },
});
