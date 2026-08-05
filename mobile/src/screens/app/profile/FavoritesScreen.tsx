import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { JobCard } from '@/components/JobCard';
import { getJobDetail } from '@/api/jobs';
import { listSavedItems, unsaveItem } from '@/api/savedItems';
import { extractErrorMessage } from '@/api/client';
import type { Job } from '@/types/domain';

export function FavoritesScreen() {
  const { theme } = useTheme();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listSavedItems('JOB')
      .then(async (items) => {
        const results = await Promise.all(
          items.map((item) => getJobDetail(item.targetId).catch(() => null)),
        );
        setJobs(results.filter((j): j is Job => j !== null));
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  async function handleUnsave(jobId: string) {
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
    try {
      await unsaveItem('JOB', jobId);
    } catch {
      // best-effort — leave removed from view even if the server call fails
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.page }]} edges={['top']}>
      <Text style={[styles.title, { color: theme.text }]}>Favorites</Text>
      {loading ? (
        <ActivityIndicator style={styles.loader} color={theme.primary} />
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
          renderItem={({ item }) => <JobCard job={item} onPress={() => handleUnsave(item.id)} />}
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
});
