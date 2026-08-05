import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useI18n, type Language } from '@/i18n/I18nProvider';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/Button';

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
];

function OptionRow({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.optionRow,
        { borderColor: selected ? theme.primary : theme.border, backgroundColor: selected ? theme.selectedChipBg : theme.cardBg },
      ]}
    >
      <Text style={{ color: selected ? theme.primary : theme.text, fontWeight: typography.weights.medium }}>{label}</Text>
    </Pressable>
  );
}

export function SettingsScreen() {
  const { theme, preference, setMode } = useTheme();
  const { language, setLanguage, t } = useI18n();
  const logout = useAuthStore((s) => s.logout);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.page }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>{t('settings', 'title')}</Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('settings', 'appearance')}</Text>
        <View style={styles.optionsRow}>
          <OptionRow label={t('settings', 'light')} selected={preference === 'light'} onPress={() => setMode('light')} />
          <OptionRow label={t('settings', 'dark')} selected={preference === 'dark'} onPress={() => setMode('dark')} />
          <OptionRow label={t('settings', 'system')} selected={preference === 'system'} onPress={() => setMode('system')} />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('settings', 'language')}</Text>
        <View style={styles.optionsRow}>
          {LANGUAGES.map((l) => (
            <OptionRow key={l.code} label={l.label} selected={language === l.code} onPress={() => setLanguage(l.code)} />
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('settings', 'notifications')}</Text>
        <Text style={[styles.note, { color: theme.textSecondary }]}>
          Push notifications are enabled while you're signed in. Manage per-type email/push preferences from the
          notifications bell.
        </Text>

        <Button title={t('common', 'logout')} variant="ghost" onPress={logout} style={styles.logout} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.xl, paddingBottom: spacing.xxl },
  title: { fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold, marginBottom: spacing.lg },
  sectionTitle: { fontSize: typography.sizes.base, fontWeight: typography.weights.medium, marginTop: spacing.lg, marginBottom: spacing.sm },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  optionRow: { borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  note: { fontSize: typography.sizes.sm },
  logout: { marginTop: spacing.xxl },
});
