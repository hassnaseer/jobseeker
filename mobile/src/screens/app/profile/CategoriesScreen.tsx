import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Lock } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n/I18nProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/Button';
import { addMyCategory, getCategoryTree, getMyCategories, removeMyCategory } from '@/api/categories';
import { extractErrorMessage } from '@/api/client';
import { useAuthStore } from '@/store/authStore';
import type { Category } from '@/types/domain';

export function CategoriesScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const user = useAuthStore((s) => s.user);
  const role = user?.activeRole === 'CLIENT' ? 'CLIENT' : 'SEEKER';

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lockedIds, setLockedIds] = useState<Set<string>>(new Set());
  const [initialIds, setInitialIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getCategoryTree(), getMyCategories(role)])
      .then(([tree, mine]) => {
        setCategories(tree);
        const ids = new Set(mine.map((m) => m.categoryId));
        setSelectedIds(ids);
        setInitialIds(ids);
        setLockedIds(new Set(mine.filter((m) => m.locked).map((m) => m.categoryId)));
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [role]);

  function toggle(categoryId: string) {
    if (lockedIds.has(categoryId)) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const toAdd = [...selectedIds].filter((id) => !initialIds.has(id));
      const toRemove = [...initialIds].filter((id) => !selectedIds.has(id));
      await Promise.all([
        ...toAdd.map((id) => addMyCategory(role, id)),
        ...toRemove.map((id) => removeMyCategory(role, id)),
      ]);
      setInitialIds(new Set(selectedIds));
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const dirty = selectedIds.size !== initialIds.size || [...selectedIds].some((id) => !initialIds.has(id));

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.page }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>{t('categoriesPage', 'title')}</Text>

        <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>{t('categoriesPage', 'yourCategories')}</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {t('categoriesPage', 'subtitle')}
          </Text>

          {error ? <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text> : null}

          {loading ? (
            <ActivityIndicator color={theme.primary} style={styles.loader} />
          ) : (
            <View style={styles.chipRow}>
              {categories.map((cat) => {
                const selected = selectedIds.has(cat.id);
                const locked = lockedIds.has(cat.id);
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => toggle(cat.id)}
                    style={[
                      styles.chip,
                      {
                        borderColor: selected ? theme.primary : theme.border,
                        backgroundColor: selected ? theme.selectedChipBg : theme.cardBg,
                      },
                    ]}
                  >
                    {locked ? <Lock size={13} color={selected ? theme.primary : theme.textMuted} /> : null}
                    <Text
                      style={{
                        color: selected ? theme.primary : theme.text,
                        fontWeight: typography.weights.medium,
                        marginLeft: locked ? spacing.xs : 0,
                      }}
                    >
                      {cat.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          <Button
            title={t('categoriesPage', 'save')}
            onPress={handleSave}
            loading={saving}
            disabled={!dirty}
            style={styles.saveButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.xl, paddingBottom: spacing.xxl },
  title: { fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold, marginBottom: spacing.lg },
  card: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.lg },
  cardTitle: { fontSize: typography.sizes.base, fontWeight: typography.weights.bold, marginBottom: spacing.xs },
  subtitle: { fontSize: typography.sizes.sm, marginBottom: spacing.lg },
  errorText: { marginBottom: spacing.md },
  loader: { marginVertical: spacing.lg },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  saveButton: { alignSelf: 'flex-start', height: 44, paddingHorizontal: spacing.lg },
});
