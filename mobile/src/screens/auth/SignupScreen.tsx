import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StackScreenProps } from '@react-navigation/stack';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n/I18nProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { useAuthStore } from '@/store/authStore';
import { extractErrorMessage } from '@/api/client';
import type { AuthStackParamList } from '@/navigation/types';

type Props = StackScreenProps<AuthStackParamList, 'Signup'>;

const TOS_VERSION = '1.0';

export function SignupScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const signup = useAuthStore((s) => s.signup);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'CLIENT' | 'SEEKER'>('SEEKER');
  const [tosAccepted, setTosAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSignup() {
    setError(null);
    if (password !== confirmPassword) {
      setError(t('auth', 'passwordsMismatch'));
      return;
    }
    if (!tosAccepted) {
      setError(t('auth', 'tosRequired'));
      return;
    }
    setLoading(true);
    try {
      await signup({
        email: email.trim(),
        password,
        confirmPassword,
        role,
        tosVersion: TOS_VERSION,
        tosAccepted,
      });
      setDone(true);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.page }]}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.text }]}>{t('auth', 'checkYourEmail')}</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {t('auth', 'verificationSent', { email })}
          </Text>
          <Button title={t('auth', 'backToLogin')} onPress={() => navigation.replace('Login')} style={styles.submit} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.page }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={[styles.title, { color: theme.text }]}>{t('auth', 'createYourAccount')}</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{t('auth', 'signupSubtitle')}</Text>

          <View style={styles.roleRow}>
            {(['SEEKER', 'CLIENT'] as const).map((r) => (
              <Pressable
                key={r}
                onPress={() => setRole(r)}
                style={[
                  styles.roleChip,
                  {
                    backgroundColor: role === r ? theme.selectedChipBg : theme.surface,
                    borderColor: role === r ? theme.primary : theme.inputBorder,
                  },
                ]}
              >
                <Text style={{ color: role === r ? theme.primary : theme.textSecondary, fontWeight: typography.weights.medium }}>
                  {r === 'SEEKER' ? t('auth', 'iWantToWork') : t('auth', 'iWantToHire')}
                </Text>
              </Pressable>
            ))}
          </View>

          <TextField
            label={t('auth', 'email')}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
          />
          <TextField label={t('auth', 'password')} value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />
          <TextField
            label={t('auth', 'confirmPassword')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="••••••••"
          />

          <Pressable style={styles.tosRow} onPress={() => setTosAccepted((v) => !v)}>
            <View
              style={[
                styles.checkbox,
                { borderColor: theme.inputBorder, backgroundColor: tosAccepted ? theme.primary : 'transparent' },
              ]}
            />
            <Text style={[styles.tosText, { color: theme.textSecondary }]}>
              {t('auth', 'tosAgree')}
            </Text>
          </Pressable>

          {error ? <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text> : null}

          <Button title={t('auth', 'signUp')} onPress={handleSignup} loading={loading} style={styles.submit} />
          <Button title={t('auth', 'alreadyHaveAccount')} variant="ghost" onPress={() => navigation.navigate('Login')} style={styles.linkButton} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingVertical: spacing.xxl, justifyContent: 'center' },
  title: { fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold, marginBottom: spacing.xs },
  subtitle: { fontSize: typography.sizes.base, marginBottom: spacing.xl },
  roleRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  roleChip: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  tosRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  checkbox: { width: 20, height: 20, borderRadius: radius.sm, borderWidth: 1.5, marginRight: spacing.sm },
  tosText: { flex: 1, fontSize: typography.sizes.sm },
  errorText: { marginBottom: spacing.md },
  submit: { marginTop: spacing.sm },
  linkButton: { marginTop: spacing.md },
});
