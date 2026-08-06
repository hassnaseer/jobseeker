import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n/I18nProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/Button';

export function SupportScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();

  const FAQ = [
    { q: t('supportScreen', 'faqGetPaidQ'), a: t('supportScreen', 'faqGetPaidA') },
    { q: t('supportScreen', 'faqEscrowQ'), a: t('supportScreen', 'faqEscrowA') },
    { q: t('supportScreen', 'faqDisputesQ'), a: t('supportScreen', 'faqDisputesA') },
    { q: t('supportScreen', 'faqSwitchRoleQ'), a: t('supportScreen', 'faqSwitchRoleA') },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.page }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>{t('supportScreen', 'title')}</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {t('supportScreen', 'subtitle')}
        </Text>

        <Button
          title={t('supportScreen', 'emailSupport')}
          onPress={() => Linking.openURL('mailto:support@joblinxs.com')}
          style={styles.emailButton}
        />

        {FAQ.map((item) => (
          <View key={item.q} style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <Text style={[styles.question, { color: theme.text }]}>{item.q}</Text>
            <Text style={[styles.answer, { color: theme.textSecondary }]}>{item.a}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.xl, paddingBottom: spacing.xxl },
  title: { fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold, marginBottom: spacing.xs },
  subtitle: { fontSize: typography.sizes.base, marginBottom: spacing.lg },
  emailButton: { marginBottom: spacing.xl },
  card: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  question: { fontSize: typography.sizes.base, fontWeight: typography.weights.medium, marginBottom: spacing.xs },
  answer: { fontSize: typography.sizes.sm },
});
