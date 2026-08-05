import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useAuthStore } from '@/store/authStore';

export function HomeScreen() {
  const { theme } = useTheme();
  const user = useAuthStore((s) => s.user);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.page }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.greeting, { color: theme.text }]}>
          Welcome back{user?.firstName ? `, ${user.firstName}` : ''}
        </Text>
        <Text style={[styles.role, { color: theme.textSecondary }]}>
          {user?.activeRole === 'CLIENT' ? 'Hiring dashboard' : 'Freelancer dashboard'}
        </Text>

        <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Your account</Text>
          <Text style={[styles.cardBody, { color: theme.textSecondary }]}>{user?.email}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.xl },
  greeting: { fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold },
  role: { fontSize: typography.sizes.base, marginTop: spacing.xs, marginBottom: spacing.xl },
  card: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.lg },
  cardTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.medium, marginBottom: spacing.xs },
  cardBody: { fontSize: typography.sizes.base },
});
