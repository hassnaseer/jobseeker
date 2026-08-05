import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StackScreenProps } from '@react-navigation/stack';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/Button';
import { getAnalyticsOverview } from '@/api/admin';
import { extractErrorMessage } from '@/api/client';
import type { AnalyticsOverview } from '@/types/admin';
import type { ProfileStackParamList } from '@/navigation/types';

type Props = StackScreenProps<ProfileStackParamList, 'AdminDashboard'>;

function StatCard({ label, value }: { label: string; value: number | string }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.statCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
      <Text style={[styles.statValue, { color: theme.primary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
}

export function AdminDashboardScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalyticsOverview()
      .then(setOverview)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.page }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Admin dashboard</Text>

        {loading ? (
          <ActivityIndicator color={theme.primary} style={styles.loader} />
        ) : error ? (
          <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
        ) : overview ? (
          <View style={styles.statsGrid}>
            <StatCard label="Total users" value={overview.totalUsers} />
            {overview.grossMerchandiseVolume.map((gmv) => (
              <StatCard key={gmv.currency} label={`GMV (${gmv.currency})`} value={gmv.total} />
            ))}
          </View>
        ) : null}

        <View style={styles.section}>
          <Button title="Pending approvals" onPress={() => navigation.navigate('AdminApprovals')} style={styles.navButton} />
          <Button title="Disputes queue" onPress={() => navigation.navigate('AdminDisputes')} style={styles.navButton} />
          <Button title="Manage categories" onPress={() => navigation.navigate('AdminCategories')} style={styles.navButton} />
          <Button title="Platform config" onPress={() => navigation.navigate('AdminConfig')} style={styles.navButton} />
          <Button title="Team & Permissions" onPress={() => navigation.navigate('AdminTeam')} style={styles.navButton} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.xl, paddingBottom: spacing.xxl },
  title: { fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold, marginBottom: spacing.lg },
  loader: { marginTop: spacing.xl },
  errorText: { marginBottom: spacing.lg },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.xl },
  statCard: { flexBasis: '47%', flexGrow: 1, borderWidth: 1, borderRadius: radius.lg, padding: spacing.md, alignItems: 'center' },
  statValue: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold },
  statLabel: { fontSize: typography.sizes.xs, marginTop: spacing.xs, textAlign: 'center' },
  section: { gap: spacing.sm },
  navButton: { marginBottom: spacing.sm },
});
