import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StackScreenProps } from '@react-navigation/stack';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n/I18nProvider';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { useAuthStore } from '@/store/authStore';
import { extractErrorMessage } from '@/api/client';
import type { AuthStackParamList } from '@/navigation/types';

type Props = StackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.page }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.text }]}>{t('auth', 'welcomeBack')}</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {t('auth', 'loginSubtitle')}
          </Text>

          <TextField
            label={t('auth', 'email')}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
          />
          <TextField
            label={t('auth', 'password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
          />

          {error ? <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text> : null}

          <Button title={t('auth', 'logIn')} onPress={handleLogin} loading={loading} style={styles.submit} />

          <Button
            title={t('auth', 'forgotPassword')}
            variant="ghost"
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.linkButton}
          />
          <Button
            title={t('auth', 'createAccount')}
            variant="secondary"
            onPress={() => navigation.navigate('Signup')}
            style={styles.linkButton}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  content: { flex: 1, paddingHorizontal: spacing.xl, justifyContent: 'center' },
  title: { fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold, marginBottom: spacing.xs },
  subtitle: { fontSize: typography.sizes.base, marginBottom: spacing.xl },
  errorText: { marginBottom: spacing.md },
  submit: { marginTop: spacing.sm },
  linkButton: { marginTop: spacing.md },
});
