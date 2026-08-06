import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n/I18nProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { TextField } from '@/components/TextField';
import { Button } from '@/components/Button';
import {
  createPayoutMethod,
  listMyPayoutMethods,
  listMyWallets,
  requestWithdrawal,
} from '@/api/payments';
import { extractErrorMessage } from '@/api/client';
import type { PayoutMethod, Wallet } from '@/types/domain';

export function WithdrawScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [methods, setMethods] = useState<PayoutMethod[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const [showNewMethod, setShowNewMethod] = useState(false);
  const [bankName, setBankName] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [swiftOrRouting, setSwiftOrRouting] = useState('');
  const [creatingMethod, setCreatingMethod] = useState(false);

  function load() {
    setLoading(true);
    Promise.all([listMyWallets(), listMyPayoutMethods()])
      .then(([w, m]) => {
        setWallets(w);
        setMethods(m);
        const def = m.find((pm) => pm.isDefault) ?? m[0];
        if (def) setSelectedMethodId(def.id);
        setShowNewMethod(m.length === 0);
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleCreateMethod() {
    setError(null);
    setCreatingMethod(true);
    try {
      const method = await createPayoutMethod({
        type: 'BANK',
        bankName,
        accountHolder,
        accountNumber,
        swiftOrRouting,
        isDefault: methods.length === 0,
      });
      setMethods((prev) => [...prev, method]);
      setSelectedMethodId(method.id);
      setShowNewMethod(false);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setCreatingMethod(false);
    }
  }

  async function handleWithdraw() {
    setError(null);
    if (!selectedMethodId || !amount) {
      setError(t('wallet', 'chooseMethodAndAmount'));
      return;
    }
    setSubmitting(true);
    try {
      await requestWithdrawal({
        amount: Number(amount),
        currency: wallets[0]?.currency ?? 'USD',
        payoutMethodId: selectedMethodId,
      });
      setDone(true);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, styles.center, { backgroundColor: theme.page }]}>
        <ActivityIndicator color={theme.primary} />
      </SafeAreaView>
    );
  }

  if (done) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.page }]} edges={['top']}>
        <View style={styles.doneContent}>
          <Text style={[styles.title, { color: theme.text }]}>{t('wallet', 'withdrawalRequested')}</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {t('wallet', 'withdrawalRequestedBody')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.page }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>{t('wallet', 'withdrawFunds')}</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {t('wallet', 'available')}: {wallets[0] ? `${wallets[0].currency} ${wallets[0].balance}` : '—'}
        </Text>

        <TextField label={t('wallet', 'amount')} value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="100" />

        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('wallet', 'payoutMethod')}</Text>
        {methods.map((m) => (
          <Pressable
            key={m.id}
            onPress={() => setSelectedMethodId(m.id)}
            style={[
              styles.methodRow,
              {
                borderColor: selectedMethodId === m.id ? theme.primary : theme.border,
                backgroundColor: theme.cardBg,
              },
            ]}
          >
            <Text style={{ color: theme.text }}>
              {m.bankName ?? m.type} {m.accountNumber ? `•••• ${m.accountNumber.slice(-4)}` : ''}
            </Text>
          </Pressable>
        ))}

        <Button
          title={showNewMethod ? t('wallet', 'cancelNewMethod') : t('wallet', 'addBankAccount')}
          variant="ghost"
          onPress={() => setShowNewMethod((v) => !v)}
          style={styles.addMethodButton}
        />

        {showNewMethod ? (
          <View style={[styles.newMethodCard, { borderColor: theme.border, backgroundColor: theme.cardBg }]}>
            <TextField label={t('wallet', 'bankName')} value={bankName} onChangeText={setBankName} />
            <TextField label={t('wallet', 'accountHolder')} value={accountHolder} onChangeText={setAccountHolder} />
            <TextField label={t('wallet', 'accountNumber')} value={accountNumber} onChangeText={setAccountNumber} keyboardType="numeric" />
            <TextField label={t('wallet', 'swiftRouting')} value={swiftOrRouting} onChangeText={setSwiftOrRouting} />
            <Button
              title={t('wallet', 'savePayoutMethod')}
              onPress={handleCreateMethod}
              loading={creatingMethod}
              disabled={!bankName || !accountHolder || !accountNumber}
            />
          </View>
        ) : null}

        {error ? <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text> : null}

        <Button
          title={t('wallet', 'requestWithdrawal')}
          onPress={handleWithdraw}
          loading={submitting}
          disabled={!selectedMethodId || !amount}
          style={styles.submit}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.xl, paddingBottom: spacing.xxl },
  doneContent: { flex: 1, padding: spacing.xl, justifyContent: 'center' },
  title: { fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold, marginBottom: spacing.xs },
  subtitle: { fontSize: typography.sizes.base, marginBottom: spacing.lg },
  sectionTitle: { fontSize: typography.sizes.base, fontWeight: typography.weights.medium, marginTop: spacing.md, marginBottom: spacing.sm },
  methodRow: { borderWidth: 1, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  addMethodButton: { marginTop: spacing.xs, marginBottom: spacing.md },
  newMethodCard: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.lg },
  errorText: { marginBottom: spacing.md },
  submit: { marginTop: spacing.sm },
});
