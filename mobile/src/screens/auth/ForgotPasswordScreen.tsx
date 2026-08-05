import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StackScreenProps } from '@react-navigation/stack';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { useAuthStore } from '@/store/authStore';
import { extractErrorMessage } from '@/api/client';
import type { AuthStackParamList } from '@/navigation/types';

type Props = StackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const forgotPassword = useAuthStore((s) => s.forgotPassword);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.page }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.text }]}>Reset your password</Text>
          {sent ? (
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              If an account exists for {email}, a reset link has been sent.
            </Text>
          ) : (
            <>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Enter your email and we'll send you a reset link.
              </Text>
              <TextField
                label="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="you@example.com"
              />
              {error ? <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text> : null}
              <Button title="Send reset link" onPress={handleSubmit} loading={loading} style={styles.submit} />
            </>
          )}
          <Button title="Back to login" variant="ghost" onPress={() => navigation.navigate('Login')} style={styles.linkButton} />
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
