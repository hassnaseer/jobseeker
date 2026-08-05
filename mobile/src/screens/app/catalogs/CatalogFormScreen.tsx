import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import type { StackScreenProps } from '@react-navigation/stack';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import {
  addTier,
  createCatalog,
  getCatalogDetail,
  removeTier,
  updateCatalog,
  type CreateTierInput,
} from '@/api/catalogs';
import { flattenCategoryTree, getCategoryTree } from '@/api/categories';
import { extractErrorMessage } from '@/api/client';
import { formatMoney } from '@/utils/format';
import type { CatalogFaqItem, CatalogTier, ProjectCatalog } from '@/types/domain';
import type { ProfileStackParamList } from '@/navigation/types';

type Props = StackScreenProps<ProfileStackParamList, 'CatalogForm'>;

export function CatalogFormScreen({ route, navigation }: Props) {
  const catalogId = route.params?.catalogId;
  const isEdit = !!catalogId;
  const { theme } = useTheme();

  const [categories, setCategories] = useState<{ id: string; label: string }[]>([]);
  const [catalog, setCatalog] = useState<ProjectCatalog | null>(null);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [faq, setFaq] = useState<CatalogFaqItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newTier, setNewTier] = useState<CreateTierInput>({ name: '', price: 1, deliveryDays: 1, revisions: 0, features: [] });
  const [addingTier, setAddingTier] = useState(false);

  useEffect(() => {
    getCategoryTree().then((tree) => setCategories(flattenCategoryTree(tree))).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!catalogId) return;
    getCatalogDetail(catalogId)
      .then((c) => {
        setCatalog(c);
        setTitle(c.title);
        setCategoryId(c.categoryId);
        setDescription(c.description);
        setFaq(c.faq);
      })
      .catch((err) => setError(extractErrorMessage(err)));
  }, [catalogId]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const dto = { title, categoryId, description, faq };
      if (isEdit && catalogId) {
        const updated = await updateCatalog(catalogId, dto);
        setCatalog(updated);
      } else {
        await createCatalog(dto);
        navigation.goBack();
      }
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleAddTier() {
    if (!catalogId || !newTier.name.trim()) return;
    setAddingTier(true);
    try {
      const tier = await addTier(catalogId, newTier);
      setCatalog((prev) => (prev ? { ...prev, tiers: [...(prev.tiers ?? []), tier] } : prev));
      setNewTier({ name: '', price: 1, deliveryDays: 1, revisions: 0, features: [] });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setAddingTier(false);
    }
  }

  async function handleRemoveTier(tier: CatalogTier) {
    if (!catalogId) return;
    try {
      await removeTier(catalogId, tier.id);
      setCatalog((prev) => (prev ? { ...prev, tiers: (prev.tiers ?? []).filter((t) => t.id !== tier.id) } : prev));
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  function updateFaqItem(index: number, patch: Partial<CatalogFaqItem>) {
    setFaq((items) => items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.page }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>{isEdit ? 'Edit catalog' : 'New catalog'}</Text>
        {error ? <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text> : null}

        <TextField label="Title" value={title} onChangeText={setTitle} />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Category</Text>
        <View style={[styles.pickerWrap, { borderColor: theme.inputBorder }]}>
          <Picker selectedValue={categoryId} onValueChange={(v) => setCategoryId(v)} dropdownIconColor={theme.text}>
            <Picker.Item label="Select a category" value="" />
            {categories.map((c) => (
              <Picker.Item key={c.id} label={c.label} value={c.id} />
            ))}
          </Picker>
        </View>

        <TextField
          label="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={styles.multiline}
        />

        <Text style={[styles.sectionTitle, { color: theme.text }]}>FAQ</Text>
        {faq.map((item, i) => (
          <View key={i} style={[styles.faqCard, { borderColor: theme.border }]}>
            <TextField label="Question" value={item.question} onChangeText={(v) => updateFaqItem(i, { question: v })} />
            <TextField
              label="Answer"
              value={item.answer}
              onChangeText={(v) => updateFaqItem(i, { answer: v })}
              multiline
              numberOfLines={2}
            />
            <Button
              title="Remove"
              variant="ghost"
              onPress={() => setFaq((items) => items.filter((_, idx) => idx !== i))}
              style={styles.removeFaqButton}
            />
          </View>
        ))}
        <Button
          title="+ Add FAQ item"
          variant="secondary"
          onPress={() => setFaq((items) => [...items, { question: '', answer: '' }])}
          style={styles.addFaqButton}
        />

        <Button title="Save" onPress={handleSave} loading={saving} style={styles.saveButton} />

        {isEdit && catalog ? (
          <View style={styles.tiersSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Tiers</Text>
            {(catalog.tiers ?? []).map((tier) => (
              <View key={tier.id} style={[styles.tierCard, { borderColor: theme.border }]}>
                <Text style={[styles.tierName, { color: theme.text }]}>{tier.name}</Text>
                <Text style={[styles.tierMeta, { color: theme.textSecondary }]}>
                  {formatMoney(tier.price, tier.currency)} · {tier.deliveryDays}d · {tier.revisions} revisions
                </Text>
                <Button title="Delete" variant="ghost" onPress={() => handleRemoveTier(tier)} style={styles.removeFaqButton} />
              </View>
            ))}

            <View style={[styles.tierCard, { borderColor: theme.border }]}>
              <TextField label="Tier name" value={newTier.name} onChangeText={(v) => setNewTier((t) => ({ ...t, name: v }))} />
              <TextField
                label="Price"
                keyboardType="numeric"
                value={String(newTier.price)}
                onChangeText={(v) => setNewTier((t) => ({ ...t, price: Number(v) || 0 }))}
              />
              <TextField
                label="Delivery days"
                keyboardType="numeric"
                value={String(newTier.deliveryDays)}
                onChangeText={(v) => setNewTier((t) => ({ ...t, deliveryDays: Number(v) || 0 }))}
              />
              <TextField
                label="Revisions"
                keyboardType="numeric"
                value={String(newTier.revisions ?? 0)}
                onChangeText={(v) => setNewTier((t) => ({ ...t, revisions: Number(v) || 0 }))}
              />
              <Button title="Add tier" onPress={handleAddTier} loading={addingTier} disabled={!newTier.name.trim()} />
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.xl, paddingBottom: spacing.xxl },
  title: { fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold, marginBottom: spacing.lg },
  errorText: { marginBottom: spacing.md },
  label: { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, marginBottom: spacing.xs },
  pickerWrap: { borderWidth: 1, borderRadius: radius.md, overflow: 'hidden', marginBottom: spacing.md },
  multiline: { height: 100, textAlignVertical: 'top', paddingTop: spacing.sm },
  sectionTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, marginTop: spacing.lg, marginBottom: spacing.md },
  faqCard: { borderWidth: 1, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md },
  removeFaqButton: { alignSelf: 'flex-start', height: 32, paddingHorizontal: spacing.sm, marginTop: spacing.xs },
  addFaqButton: { marginBottom: spacing.lg },
  saveButton: { marginTop: spacing.sm },
  tiersSection: { marginTop: spacing.xl },
  tierCard: { borderWidth: 1, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md },
  tierName: { fontSize: typography.sizes.base, fontWeight: typography.weights.bold },
  tierMeta: { fontSize: typography.sizes.sm, marginVertical: spacing.xs },
});
