import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { createCategory, deleteCategory, listAllCategoriesAdmin } from '@/api/categories';
import { extractErrorMessage } from '@/api/client';
import type { Category } from '@/types/domain';

export function AdminCategoriesScreen() {
  const { theme } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    listAllCategoriesAdmin()
      .then(setCategories)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const category = await createCategory({ name: newName.trim() });
      setCategories((prev) => [...prev, category]);
      setNewName('');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    setBusyId(id);
    setError(null);
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.page }]} edges={['top']}>
      <Text style={[styles.title, { color: theme.text }]}>Manage categories</Text>

      <View style={styles.createRow}>
        <TextField value={newName} onChangeText={setNewName} placeholder="New category name" style={styles.createInput} />
        <Button title="Add" onPress={handleCreate} loading={creating} disabled={!newName.trim()} style={styles.createButton} />
      </View>

      {error ? <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text> : null}

      {loading ? (
        <ActivityIndicator style={styles.loader} color={theme.primary} />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(c) => c.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={[styles.empty, { color: theme.textMuted }]}>No categories yet.</Text>}
          renderItem={({ item }) => (
            <View style={[styles.row, { borderColor: theme.border, backgroundColor: theme.cardBg }]}>
              <Text style={[styles.rowLabel, { color: theme.text }]}>{item.name}</Text>
              <Button title="Delete" variant="ghost" onPress={() => handleDelete(item.id)} loading={busyId === item.id} style={styles.deleteButton} />
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
  createRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.xl, alignItems: 'flex-start' },
  createInput: { flex: 1 },
  createButton: { height: 52 },
  errorText: { paddingHorizontal: spacing.xl, marginBottom: spacing.md },
  loader: { marginTop: spacing.xxl },
  listContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  empty: { textAlign: 'center', marginTop: spacing.xxl },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  rowLabel: { fontSize: typography.sizes.base, flex: 1 },
  deleteButton: { height: 32, paddingHorizontal: spacing.sm },
});
