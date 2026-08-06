import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n/I18nProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/Button';
import { useAuthStore } from '@/store/authStore';

export function ProfileScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const switchRole = useAuthStore((s) => s.switchRole);

  const otherRole = user?.activeRole === 'CLIENT' ? 'SEEKER' : 'CLIENT';
  const canSwitch = user?.roles.includes(otherRole as 'CLIENT' | 'SEEKER');

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.page }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>{t('profile', 'title')}</Text>

        <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <Text style={[styles.name, { color: theme.text }]}>
            {user?.firstName ?? ''} {user?.lastName ?? ''}
          </Text>
          <Text style={[styles.email, { color: theme.textSecondary }]}>{user?.email}</Text>
          <View style={[styles.tag, { backgroundColor: theme.tagBg }]}>
            <Text style={{ color: theme.tagText, fontWeight: typography.weights.medium }}>
              {user?.activeRole}
            </Text>
          </View>
        </View>

        {canSwitch ? (
          <Button
            title={otherRole === 'CLIENT' ? t('profile', 'switchToClient') : t('profile', 'switchToFreelancer')}
            variant="secondary"
            onPress={() => switchRole(otherRole as 'CLIENT' | 'SEEKER')}
            style={styles.action}
          />
        ) : null}

        <Button title={t('common', 'logout')} variant="ghost" onPress={logout} style={styles.action} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.xl },
  title: { fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold, marginBottom: spacing.lg },
  card: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg },
  name: { fontSize: typography.sizes.lg, fontWeight: typography.weights.medium },
  email: { fontSize: typography.sizes.base, marginTop: spacing.xs, marginBottom: spacing.sm },
  tag: { alignSelf: 'flex-start', borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  action: { marginBottom: spacing.md },
});
