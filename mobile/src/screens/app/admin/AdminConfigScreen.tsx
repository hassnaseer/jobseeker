import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n/I18nProvider';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { TextField } from '@/components/TextField';
import { Button } from '@/components/Button';
import { getPlatformConfig, updatePlatformConfig } from '@/api/admin';
import { extractErrorMessage } from '@/api/client';

export function AdminConfigScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const [clientCommissionPct, setClientCommissionPct] = useState('');
  const [seekerCommissionPct, setSeekerCommissionPct] = useState('');
  const [minWithdrawal, setMinWithdrawal] = useState('');
  const [escrowAutoReleaseDays, setEscrowAutoReleaseDays] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getPlatformConfig()
      .then((config) => {
        setClientCommissionPct(String(config.clientCommissionPct));
        setSeekerCommissionPct(String(config.seekerCommissionPct));
        setMinWithdrawal(String(config.minWithdrawal));
        setEscrowAutoReleaseDays(String(config.escrowAutoReleaseDays));
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setError(null);
    setSaved(false);
    setSaving(true);
    try {
      await updatePlatformConfig({
        clientCommissionPct: Number(clientCommissionPct),
        seekerCommissionPct: Number(seekerCommissionPct),
        minWithdrawal: Number(minWithdrawal),
        escrowAutoReleaseDays: Number(escrowAutoReleaseDays),
      });
      setSaved(true);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, styles.center, { backgroundColor: theme.page }]}>
        <ActivityIndicator color={theme.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.page }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>{t('admin', 'platformConfig')}</Text>

        <TextField label={t('admin', 'clientCommissionPct')} value={clientCommissionPct} onChangeText={setClientCommissionPct} keyboardType="numeric" />
        <TextField label={t('admin', 'seekerCommissionPct')} value={seekerCommissionPct} onChangeText={setSeekerCommissionPct} keyboardType="numeric" />
        <TextField label={t('admin', 'minWithdrawal')} value={minWithdrawal} onChangeText={setMinWithdrawal} keyboardType="numeric" />
        <TextField label={t('admin', 'escrowAutoRelease')} value={escrowAutoReleaseDays} onChangeText={setEscrowAutoReleaseDays} keyboardType="numeric" />

        {error ? <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text> : null}
        {saved ? <Text style={[styles.savedText, { color: theme.success }]}>{t('admin', 'saved')}</Text> : null}

        <Button title={t('admin', 'saveConfig')} onPress={handleSave} loading={saving} style={styles.submit} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.xl, paddingBottom: spacing.xxl },
  title: { fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold, marginBottom: spacing.lg },
  errorText: { marginTop: spacing.sm },
  savedText: { marginTop: spacing.sm },
  submit: { marginTop: spacing.lg },
});
