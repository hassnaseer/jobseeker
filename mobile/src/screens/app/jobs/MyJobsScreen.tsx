import React, { useCallback, useEffect } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n/I18nProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { JobCard } from '@/components/JobCard';
import { useJobsStore } from '@/store/jobsStore';
import type { JobsStackParamList } from '@/navigation/types';

type Props = StackScreenProps<JobsStackParamList, 'MyJobs'>;

export function MyJobsScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { mine, status, fetchMine } = useJobsStore();

  const load = useCallback(() => {
    fetchMine().catch(() => undefined);
  }, [fetchMine]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation, load]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.page }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>{t('jobs', 'myJobsTitle')}</Text>
        <Pressable
          onPress={() => navigation.navigate('PostJob')}
          style={[styles.postButton, { backgroundColor: theme.primary }]}
        >
          <Plus size={16} color={theme.white} />
          <Text style={styles.postButtonText}>{t('jobs', 'postAJob')}</Text>
        </Pressable>
      </View>

      <FlatList
        data={mine}
        keyExtractor={(job) => job.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <JobCard job={item} onPress={() => navigation.navigate('JobDetail', { jobId: item.id })} />
        )}
        refreshing={status === 'loading' && mine.length === 0}
        onRefresh={load}
        ListEmptyComponent={
          status !== 'loading' ? (
            <Text style={[styles.empty, { color: theme.textMuted }]}>
              {t('jobs', 'noJobsPosted')}
            </Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    marginBottom: spacing.md,
  },
  title: { fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold },
  postButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  postButtonText: { color: '#fff', fontWeight: typography.weights.medium, fontSize: typography.sizes.sm },
  listContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  empty: { textAlign: 'center', marginTop: spacing.xxl, fontSize: typography.sizes.base },
});
