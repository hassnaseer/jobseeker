import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sparkles, User as UserIcon } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Badge } from '@/components/Badge';
import { useAuthStore } from '@/store/authStore';
import { useJobsStore } from '@/store/jobsStore';
import { useContractsStore } from '@/store/contractsStore';
import { listMyApplications } from '@/api/applications';
import { listMyNotifications } from '@/api/notifications';
import { getRecommendedJobs } from '@/api/ai';
import { listPublicJobs } from '@/api/jobs';
import { browseSeekers, type SeekerCard } from '@/api/profiles';
import { formatMoney, jobBudgetLabel, timeAgo } from '@/utils/format';
import { AiRecruiterScreen } from '@/screens/app/ai/AiRecruiterScreen';
import type { Job, Notification } from '@/types/domain';

function StatCard({ label, value }: { label: string; value: number | string }) {
  const { theme } = useTheme();
  return (
    <View style={[statStyles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
      <Text style={[statStyles.value, { color: theme.primary }]}>{value}</Text>
      <Text style={[statStyles.label, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  const { theme } = useTheme();
  return <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>;
}

function NotificationsPreview({ items }: { items: Notification[] }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border, marginBottom: spacing.lg }]}>
      <Text style={[styles.cardTitle, { color: theme.text }]}>Notifications</Text>
      {items.length === 0 ? (
        <Text style={[styles.cardBody, { color: theme.textSecondary }]}>No notifications yet.</Text>
      ) : (
        items.map((n) => (
          <View key={n.id} style={styles.notificationRow}>
            <Text style={[styles.notificationText, { color: theme.text }]} numberOfLines={2}>
              {n.message}
            </Text>
            <Text style={[styles.notificationTime, { color: theme.textMuted }]}>{timeAgo(n.createdAt)}</Text>
          </View>
        ))
      )}
    </View>
  );
}

function SeekerTile({ seeker }: { seeker: SeekerCard }) {
  const { theme } = useTheme();
  const name = [seeker.firstName, seeker.lastName].filter(Boolean).join(' ') || 'Freelancer';
  return (
    <View style={[styles.tile, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
      <View style={styles.tileHeaderRow}>
        <View style={[styles.avatarPlaceholder, { backgroundColor: theme.selectedChipBg }]}>
          <UserIcon size={18} color={theme.primary} />
        </View>
        {seeker.avgRating > 0 ? <Badge label={`★ ${seeker.avgRating.toFixed(1)}`} tone="warning" /> : null}
      </View>
      <Text style={[styles.tileTitle, { color: theme.text }]} numberOfLines={1}>
        {name}
      </Text>
      <Text style={[styles.tileSubtitle, { color: theme.textSecondary }]} numberOfLines={1}>
        {seeker.title}
      </Text>
      <Text style={[styles.tileMeta, { color: theme.textMuted }]}>
        {seeker.hourlyRate ? `${formatMoney(seeker.hourlyRate, seeker.currency)}/h` : ''}
        {seeker.hourlyRate && seeker.totalJobs ? ' · ' : ''}
        {seeker.totalJobs ? `${seeker.totalJobs} jobs` : ''}
      </Text>
    </View>
  );
}

function JobTile({ job }: { job: Job }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.tile, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
      <Text style={[styles.tileTitle, { color: theme.text }]} numberOfLines={2}>
        {job.title}
      </Text>
      <Text style={[styles.tileSubtitle, { color: theme.textSecondary }]} numberOfLines={1}>
        {job.locationType === 'REMOTE' ? 'Remote' : job.country ?? 'On-site'} · {job.jobType}
      </Text>
      <Text style={[styles.tileMeta, { color: theme.primary, fontWeight: typography.weights.bold }]}>
        {jobBudgetLabel(job)}
      </Text>
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recommendedSeekers, setRecommendedSeekers] = useState<SeekerCard[]>([]);
  const [trendingSeekers, setTrendingSeekers] = useState<SeekerCard[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [newJobs, setNewJobs] = useState<Job[]>([]);

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

    listMyNotifications({}).then((items) => setNotifications(items.slice(0, 4))).catch(() => undefined);

    if (isClient) {
      browseSeekers({ sortBy: 'RATING', limit: 4 }).then(setRecommendedSeekers).catch(() => undefined);
      browseSeekers({ sortBy: 'JOBS', limit: 4 }).then(setTrendingSeekers).catch(() => undefined);
    } else {
      getRecommendedJobs()
        .then((items) => setRecommendedJobs(items.slice(0, 4).map((r) => r.job)))
        .catch(() => undefined);
      listPublicJobs({ sortBy: 'NEWEST', limit: 4 })
        .then((res) => setNewJobs(res.items))
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

        <NotificationsPreview items={notifications} />

        {isClient ? (
          <>
            <SectionHeader title="Recommended Freelancers" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tilesRow}>
              {recommendedSeekers.map((s) => (
                <SeekerTile key={s.userId} seeker={s} />
              ))}
            </ScrollView>

            <SectionHeader title="Trending Freelancers" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tilesRow}>
              {trendingSeekers.map((s) => (
                <SeekerTile key={s.userId} seeker={s} />
              ))}
            </ScrollView>
          </>
        ) : (
          <>
            <SectionHeader title="Recommended For You" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tilesRow}>
              {recommendedJobs.map((job) => (
                <JobTile key={job.id} job={job} />
              ))}
            </ScrollView>

            <SectionHeader title="New & Trending" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tilesRow}>
              {newJobs.map((job) => (
                <JobTile key={job.id} job={job} />
              ))}
            </ScrollView>
          </>
        )}

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
  notificationRow: { paddingVertical: spacing.xs },
  notificationText: { fontSize: typography.sizes.sm },
  notificationTime: { fontSize: typography.sizes.xs, marginTop: 2 },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  tilesRow: { marginBottom: spacing.md },
  tile: {
    width: 160,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginRight: spacing.sm,
  },
  tileHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  avatarPlaceholder: { width: 32, height: 32, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  tileTitle: { fontSize: typography.sizes.sm, fontWeight: typography.weights.bold },
  tileSubtitle: { fontSize: typography.sizes.xs, marginTop: 2 },
  tileMeta: { fontSize: typography.sizes.xs, marginTop: spacing.xs },
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
