import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n/I18nProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { inviteTeamMember, listTeamMembers, removeTeamMember } from '@/api/admin';
import { extractErrorMessage } from '@/api/client';
import type { AdminPermission, AdminTeamMember } from '@/types/admin';

const ALL_PERMISSIONS: AdminPermission[] = ['KYC', 'DISPUTES', 'CATEGORIES', 'SUPPORT'];

export function AdminTeamScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const PERMISSION_LABELS: Record<AdminPermission, string> = {
    KYC: t('team', 'permissionKyc'),
    DISPUTES: t('team', 'permissionDisputes'),
    CATEGORIES: t('team', 'permissionCategories'),
    SUPPORT: t('team', 'permissionSupport'),
  };
  const [members, setMembers] = useState<AdminTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<AdminTeamMember | null>(null);

  const [inviting, setInviting] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [permissions, setPermissions] = useState<AdminPermission[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    listTeamMembers()
      .then(setMembers)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  function openInvite() {
    setName('');
    setEmail('');
    setPermissions([]);
    setFormError(null);
    setInviting(true);
  }

  function togglePermission(perm: AdminPermission) {
    setPermissions((prev) => (prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]));
  }

  async function handleInvite() {
    setFormError(null);
    if (!name.trim() || !email.trim() || permissions.length === 0) {
      setFormError(t('team', 'formError'));
      return;
    }
    setSubmitting(true);
    try {
      const member = await inviteTeamMember({ name: name.trim(), email: email.trim(), permissions });
      setMembers((prev) => [...prev, member]);
      setInviting(false);
    } catch (err) {
      setFormError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove() {
    if (!removeTarget) return;
    setBusyId(removeTarget.id);
    try {
      await removeTeamMember(removeTarget.id);
      setMembers((prev) => prev.filter((m) => m.id !== removeTarget.id));
      setRemoveTarget(null);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.page }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>{t('team', 'title')}</Text>
        <Button title={t('team', 'invite')} onPress={openInvite} style={styles.inviteButton} />
      </View>

      {error ? <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text> : null}

      {loading ? (
        <ActivityIndicator style={styles.loader} color={theme.primary} />
      ) : (
        <FlatList
          data={members}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={[styles.empty, { color: theme.textMuted }]}>{t('team', 'empty')}</Text>}
          renderItem={({ item }) => (
            <View style={[styles.card, { borderColor: theme.border, backgroundColor: theme.cardBg }]}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderText}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
                    {item.status === 'PENDING' ? <Badge label={t('team', 'pending')} tone="warning" /> : null}
                  </View>
                  <Text style={[styles.email, { color: theme.textSecondary }]}>{item.email}</Text>
                </View>
              </View>
              <View style={styles.permissionsRow}>
                {item.permissions.map((perm) => (
                  <Badge key={perm} label={PERMISSION_LABELS[perm]} tone="info" />
                ))}
              </View>
              <Button
                title={t('common', 'remove')}
                variant="ghost"
                onPress={() => setRemoveTarget(item)}
                loading={busyId === item.id}
                style={styles.removeButton}
              />
            </View>
          )}
        />
      )}

      <Modal visible={inviting} transparent animationType="fade" onRequestClose={() => setInviting(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{t('team', 'inviteTitle')}</Text>
            {formError ? <Text style={[styles.errorText, { color: theme.error }]}>{formError}</Text> : null}
            <TextField label={t('team', 'name')} value={name} onChangeText={setName} style={styles.fieldSpacing} />
            <TextField
              label={t('team', 'email')}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.fieldSpacing}
            />
            <Text style={[styles.permissionsLabel, { color: theme.text }]}>{t('team', 'permissions')}</Text>
            <View style={styles.permissionOptions}>
              {ALL_PERMISSIONS.map((perm) => {
                const selected = permissions.includes(perm);
                return (
                  <Pressable
                    key={perm}
                    onPress={() => togglePermission(perm)}
                    style={[
                      styles.permissionOption,
                      {
                        borderColor: selected ? theme.primary : theme.border,
                        backgroundColor: selected ? theme.selectedChipBg : theme.cardBg,
                      },
                    ]}
                  >
                    <Text style={{ color: selected ? theme.primary : theme.text, fontWeight: typography.weights.medium }}>
                      {PERMISSION_LABELS[perm]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.actionsRow}>
              <Button title={t('common', 'cancel')} variant="ghost" onPress={() => setInviting(false)} style={styles.actionButtonFlex} />
              <Button title={t('team', 'sendInvite')} onPress={handleInvite} loading={submitting} style={styles.actionButtonFlex} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={!!removeTarget} transparent animationType="fade" onRequestClose={() => setRemoveTarget(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{t('team', 'removeConfirmTitle')}</Text>
            <Text style={[styles.confirmBody, { color: theme.textSecondary }]}>
              {t('team', 'removeConfirmBody', { name: removeTarget?.name ?? '' })}
            </Text>
            <View style={styles.actionsRow}>
              <Button title={t('common', 'cancel')} variant="ghost" onPress={() => setRemoveTarget(null)} style={styles.actionButtonFlex} />
              <Button
                title={t('common', 'remove')}
                onPress={handleRemove}
                loading={busyId === removeTarget?.id}
                style={styles.actionButtonFlex}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  inviteButton: { height: 40, paddingHorizontal: spacing.md },
  errorText: { paddingHorizontal: spacing.xl, marginBottom: spacing.md },
  loader: { marginTop: spacing.xxl },
  listContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  empty: { textAlign: 'center', marginTop: spacing.xxl },
  card: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  cardHeaderText: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  name: { fontSize: typography.sizes.base, fontWeight: typography.weights.bold },
  email: { fontSize: typography.sizes.sm, marginTop: 2 },
  permissionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  removeButton: { alignSelf: 'flex-start', height: 32, paddingHorizontal: spacing.sm },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: spacing.xl },
  modalCard: { borderRadius: radius.lg, padding: spacing.lg },
  modalTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, marginBottom: spacing.md },
  confirmBody: { fontSize: typography.sizes.sm, marginBottom: spacing.md },
  fieldSpacing: { marginBottom: spacing.md },
  permissionsLabel: { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, marginBottom: spacing.sm },
  permissionOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  permissionOption: { borderWidth: 1.5, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  actionsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  actionButtonFlex: { flex: 1 },
});
