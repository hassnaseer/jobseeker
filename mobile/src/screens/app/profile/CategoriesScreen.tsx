import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { getCategoryTree } from '@/api/categories';
import { extractErrorMessage } from '@/api/client';
import type { Category } from '@/types/domain';

function CategoryNode({ category, depth }: { category: Category; depth: number }) {
  const { theme } = useTheme();
  return (
    <View>
      <View style={[styles.row, { borderColor: theme.border, backgroundColor: theme.cardBg, marginLeft: depth * spacing.lg }]}>
        <Text style={[styles.rowLabel, { color: theme.text }]}>{category.name}</Text>
      </View>
      {category.children?.map((child) => (
        <CategoryNode key={child.id} category={child} depth={depth + 1} />
      ))}
    </View>
  );
}

export function CategoriesScreen() {
  const { theme } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCategoryTree()
      .then(setCategories)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.page }]} edges={['top']}>
      <Text style={[styles.title, { color: theme.text }]}>Categories</Text>
      {loading ? (
        <ActivityIndicator style={styles.loader} color={theme.primary} />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(c) => c.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: error ? theme.error : theme.textMuted }]}>
              {error ?? 'No categories yet.'}
            </Text>
          }
          renderItem={({ item }) => <CategoryNode category={item} depth={0} />}
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
  row: { borderWidth: 1, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  rowLabel: { fontSize: typography.sizes.base },
});
