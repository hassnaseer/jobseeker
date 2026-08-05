import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sparkles } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useAuthStore } from '@/store/authStore';
import { useJobsStore } from '@/store/jobsStore';
import { useContractsStore } from '@/store/contractsStore';
import { listMyApplications } from '@/api/applications';
import { AiRecruiterScreen } from '@/screens/app/ai/AiRecruiterScreen';

function StatCard({ label, value }: { label: string; value: number | string }) {
  const { theme } = useTheme();
  return (
    <View style={[statStyles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
      <Text style={[statStyles.value, { color: theme.primary }]}>{value}</Text>
      <Text style={[statStyles.label, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
}

export function HomeScreen() {
  const { theme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const jobs = useJobsStore((s) => s.mine);
  const fetchMyJobs = useJobsStore((s) => s.fetchMine);
  const contracts = useContractsStore((s) => s.mine);
  const fetchMyContracts = useContractsStore((s) => s.fetchMine);
  const [applicationsCount, setApplicationsCount] = useState<number | null>(null);
  const [aiOpen, setAiOpen] = useState(false);

  const isClient = user?.activeRole === 'CLIENT';

  useEffect(() => {
    fetchMyContracts().catch(() => undefined);
    if (isClient) {
      fetchMyJobs().catch(() => undefined);
    } else {
      listMyApplications()
        .then((apps) => setApplicationsCount(apps.length))
        .catch(() => undefined);
    }
  }, [isClient, fetchMyJobs, fetchMyContracts]);

  const activeContracts = contracts.filter((c) => c.status === 'ACTIVE').length;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.page }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.greeting, { color: theme.text }]}>
          Welcome back{user?.firstName ? `, ${user.firstName}` : ''}
        </Text>
        <Text style={[styles.role, { color: theme.textSecondary }]}>
          {isClient ? 'Hiring dashboard' : 'Freelancer dashboard'}
        </Text>

        <View style={styles.statsRow}>
          {isClient ? (
            <>
              <StatCard label="Posted jobs" value={jobs.length} />
              <StatCard label="Applications" value={jobs.reduce((sum, j) => sum + j.applicationsCount, 0)} />
            </>
          ) : (
            <StatCard label="Applications sent" value={applicationsCount ?? '—'} />
          )}
          <StatCard label="Active contracts" value={activeContracts} />
        </View>

        <Pressable
          onPress={() => setAiOpen(true)}
          style={[styles.aiCard, { backgroundColor: theme.selectedChipBg, borderColor: theme.primary }]}
        >
          <Sparkles size={22} color={theme.primary} />
          <View style={styles.aiCardText}>
            <Text style={[styles.aiCardTitle, { color: theme.text }]}>
              {isClient ? 'AI-shortlist your applicants' : 'See AI-recommended jobs'}
            </Text>
            <Text style={[styles.aiCardSubtitle, { color: theme.textSecondary }]}>
              Powered by JobLinxs AI Recruiter
            </Text>
          </View>
        </Pressable>

        <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Your account</Text>
          <Text style={[styles.cardBody, { color: theme.textSecondary }]}>{user?.email}</Text>
        </View>
      </ScrollView>

      <Modal visible={aiOpen} animationType="slide" onRequestClose={() => setAiOpen(false)}>
        <AiRecruiterScreen onClose={() => setAiOpen(false)} />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.xl },
  greeting: { fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold },
  role: { fontSize: typography.sizes.base, marginTop: spacing.xs, marginBottom: spacing.xl },
  statsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  aiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  aiCardText: { flex: 1 },
  aiCardTitle: { fontSize: typography.sizes.base, fontWeight: typography.weights.medium },
  aiCardSubtitle: { fontSize: typography.sizes.sm, marginTop: 2 },
  card: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.lg },
  cardTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.medium, marginBottom: spacing.xs },
  cardBody: { fontSize: typography.sizes.base },
});

const statStyles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  value: { fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold },
  label: { fontSize: typography.sizes.xs, marginTop: spacing.xs, textAlign: 'center' },
});
