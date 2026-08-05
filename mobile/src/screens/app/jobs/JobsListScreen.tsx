import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { Plus } from 'lucide-react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { TextField } from '@/components/TextField';
import { JobCard } from '@/components/JobCard';
import { useJobsStore } from '@/store/jobsStore';
import { useAuthStore } from '@/store/authStore';
import { getCategoryTree, flattenCategoryTree } from '@/api/categories';
import type { JobsStackParamList } from '@/navigation/types';

type Props = StackScreenProps<JobsStackParamList, 'JobsList'>;

type SortBy = 'NEWEST' | 'BUDGET_HIGH' | 'BUDGET_LOW';

export function JobsListScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const { list, listMeta, status, fetchList } = useJobsStore();

  const [categories, setCategories] = useState<{ id: string; label: string }[]>([]);
  const [keyword, setKeyword] = useState('');
  const [jobType, setJobType] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('NEWEST');

  useEffect(() => {
    getCategoryTree()
      .then((tree) => setCategories(flattenCategoryTree(tree)))
      .catch(() => undefined);
  }, []);

  const loadPage = useCallback(
    (page: number) => {
      fetchList({
        keyword: keyword || undefined,
        jobType: jobType || undefined,
        categoryId: categoryId || undefined,
        country: user?.country ?? undefined,
        sortBy,
        page,
        limit: 20,
      }).catch(() => undefined);
    },
    [fetchList, keyword, jobType, categoryId, sortBy, user?.country],
  );

  useEffect(() => {
    const timeout = setTimeout(() => loadPage(1), 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, jobType, categoryId, sortBy]);

  const canLoadMore = useMemo(() => list.length < listMeta.total, [list.length, listMeta.total]);

  const isClient = user?.activeRole === 'CLIENT';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.page }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Browse Jobs</Text>
        {isClient ? (
          <Pressable
            onPress={() => navigation.navigate('PostJob')}
            style={[styles.postButton, { backgroundColor: theme.primary }]}
          >
            <Plus size={16} color={theme.white} />
            <Text style={styles.postButtonText}>Post a job</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.filters}>
        <TextField placeholder="Search jobs" value={keyword} onChangeText={setKeyword} />
        <View style={styles.pickerRow}>
          <View style={[styles.pickerWrap, { borderColor: theme.inputBorder, backgroundColor: theme.surface }]}>
            <Picker selectedValue={categoryId} onValueChange={setCategoryId} dropdownIconColor={theme.text}>
              <Picker.Item label="All categories" value="" />
              {categories.map((c) => (
                <Picker.Item key={c.id} label={c.label} value={c.id} />
              ))}
            </Picker>
          </View>
          <View style={[styles.pickerWrap, { borderColor: theme.inputBorder, backgroundColor: theme.surface }]}>
            <Picker selectedValue={jobType} onValueChange={setJobType} dropdownIconColor={theme.text}>
              <Picker.Item label="Any type" value="" />
              <Picker.Item label="Fixed price" value="FIXED" />
              <Picker.Item label="Hourly" value="HOURLY" />
            </Picker>
          </View>
        </View>
        <View style={[styles.pickerWrap, { borderColor: theme.inputBorder, backgroundColor: theme.surface }]}>
          <Picker selectedValue={sortBy} onValueChange={(v) => setSortBy(v as SortBy)} dropdownIconColor={theme.text}>
            <Picker.Item label="Newest" value="NEWEST" />
            <Picker.Item label="Highest budget" value="BUDGET_HIGH" />
            <Picker.Item label="Lowest budget" value="BUDGET_LOW" />
          </Picker>
        </View>
      </View>

      <FlatList
        data={list}
        keyExtractor={(job) => job.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <JobCard job={item} onPress={() => navigation.navigate('JobDetail', { jobId: item.id })} />
        )}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (canLoadMore && status !== 'loading') loadPage(listMeta.page + 1);
        }}
        refreshing={status === 'loading' && list.length === 0}
        onRefresh={() => loadPage(1)}
        ListEmptyComponent={
          status !== 'loading' ? (
            <Text style={[styles.empty, { color: theme.textMuted }]}>No jobs match your filters yet.</Text>
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
  filters: { paddingHorizontal: spacing.xl, gap: spacing.sm },
  pickerRow: { flexDirection: 'row', gap: spacing.sm },
  pickerWrap: { flex: 1, borderWidth: 1, borderRadius: radius.md, marginBottom: spacing.sm, overflow: 'hidden' },
  listContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  empty: { textAlign: 'center', marginTop: spacing.xxl, fontSize: typography.sizes.base },
});
