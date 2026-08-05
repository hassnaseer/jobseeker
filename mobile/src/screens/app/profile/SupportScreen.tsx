import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/Button';

const FAQ = [
  {
    q: 'How do I get paid?',
    a: 'Once a client releases a milestone or approves your hours, funds move to your JobLinxs wallet. From there you can request a withdrawal to your linked bank account.',
  },
  {
    q: 'How does escrow work?',
    a: 'Clients fund a contract or milestone up front. The money is held in escrow until the work is approved, then released to the freelancer.',
  },
  {
    q: 'What happens if there is a disagreement?',
    a: 'Either party can raise a dispute from the contract. Our support team reviews the evidence and resolves it.',
  },
  {
    q: 'How do I switch between client and freelancer mode?',
    a: 'Open Profile and tap "Switch to Client/Freelancer mode" — available once you have both roles on your account.',
  },
];

export function SupportScreen() {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.page }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Support</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Frequently asked questions — can't find what you need? Reach out to us directly.
        </Text>

        <Button
          title="Email support"
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
