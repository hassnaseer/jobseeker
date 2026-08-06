import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { Sparkles, X } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n/I18nProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { useAuthStore } from '@/store/authStore';
import { useJobsStore } from '@/store/jobsStore';
import { getMatchScoresForJob, getRecommendedJobs, shortlistApplicants } from '@/api/ai';
import { extractErrorMessage } from '@/api/client';
import { jobBudgetLabel } from '@/utils/format';
import type { AiMatchScore, RecommendedJob, ScoredApplicant } from '@/types/domain';

function scoreTone(score: number): 'success' | 'info' | 'warning' {
  if (score >= 75) return 'success';
  if (score >= 50) return 'info';
  return 'warning';
}

function SeekerView() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const [jobs, setJobs] = useState<RecommendedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getRecommendedJobs()
      .then(setJobs)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator style={styles.loader} color={theme.primary} />;

  return (
    <FlatList
      data={jobs}
      keyExtractor={(item) => item.job.id}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={
        error ? (
          <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
        ) : (
          <Text style={[styles.empty, { color: theme.textMuted }]}>
            {t('ai', 'noRecommendationsYet')}
          </Text>
        )
      }
      renderItem={({ item }) => (
        <View style={[styles.card, { borderColor: theme.border, backgroundColor: theme.cardBg }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>{item.job.title}</Text>
            <Badge label={`${item.score}%`} tone={scoreTone(item.score)} />
          </View>
          <Text style={[styles.cardMeta, { color: theme.textSecondary }]}>{jobBudgetLabel(item.job)}</Text>
          {item.reasons.map((reason, i) => (
            <Text key={i} style={[styles.reason, { color: theme.textMuted }]}>
              • {reason}
            </Text>
          ))}
        </View>
      )}
    />
  );
}

function ClientView() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const jobs = useJobsStore((s) => s.mine);
  const fetchMine = useJobsStore((s) => s.fetchMine);
  const [jobId, setJobId] = useState('');
  const [matchScores, setMatchScores] = useState<AiMatchScore[]>([]);
  const [shortlistResult, setShortlistResult] = useState<ScoredApplicant[]>([]);
  const [ran, setRan] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchMine().catch(() => undefined);
  }, [fetchMine]);

  useEffect(() => {
    setRan(false);
    setShortlistResult([]);
    if (jobId) {
      getMatchScoresForJob(jobId)
        .then(setMatchScores)
        .catch(() => setMatchScores([]));
    }
  }, [jobId]);

  async function handleRun() {
    if (!jobId) return;
    setError(null);
    setBusy(true);
    try {
      const result = await shortlistApplicants(jobId);
      setShortlistResult(result);
      setRan(true);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.listContent}>
      {jobs.length === 0 ? (
        <Text style={[styles.empty, { color: theme.textMuted }]}>{t('ai', 'postJobFirst')}</Text>
      ) : (
        <>
          <View style={[styles.pickerWrap, { borderColor: theme.inputBorder, backgroundColor: theme.surface }]}>
            <Picker selectedValue={jobId} onValueChange={setJobId} dropdownIconColor={theme.text}>
              <Picker.Item label={t('ai', 'pickAJob')} value="" />
              {jobs.map((j) => (
                <Picker.Item key={j.id} label={`${j.title} (${j.applicationsCount})`} value={j.id} />
              ))}
            </Picker>
          </View>
          <Button title={t('ai', 'runAiShortlist')} onPress={handleRun} loading={busy} disabled={!jobId} style={styles.runButton} />

          {error ? <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text> : null}
          {ran && shortlistResult.length === 0 ? (
            <Text style={[styles.empty, { color: theme.textMuted }]}>{t('ai', 'noCandidatesMatched')}</Text>
          ) : null}

          {(ran ? shortlistResult : []).map((result) => (
            <View key={result.applicationId} style={[styles.card, { borderColor: theme.border, backgroundColor: theme.cardBg }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>{t('ai', 'applicant')} #{result.seekerId.slice(0, 8)}</Text>
                <Badge label={`${result.score}%`} tone={scoreTone(result.score)} />
              </View>
              {result.autoShortlisted ? <Badge label={t('ai', 'autoShortlisted')} tone="success" /> : null}
              {result.reasons.map((reason, i) => (
                <Text key={i} style={[styles.reason, { color: theme.textMuted }]}>
                  • {reason}
                </Text>
              ))}
            </View>
          ))}

          {!ran && jobId && matchScores.length > 0 ? (
            <>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('ai', 'previousScores')}</Text>
              {matchScores.map((result) => (
                <View key={result.id} style={[styles.card, { borderColor: theme.border, backgroundColor: theme.cardBg }]}>
                  <View style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>{t('ai', 'applicant')} #{result.seekerId.slice(0, 8)}</Text>
                    <Badge label={`${result.score}%`} tone={scoreTone(result.score)} />
                  </View>
                </View>
              ))}
            </>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}

export function AiRecruiterScreen({ onClose }: { onClose: () => void }) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const isClient = useAuthStore((s) => s.user?.activeRole === 'CLIENT');

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.page }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Sparkles size={20} color={theme.primary} />
          <Text style={[styles.title, { color: theme.text }]}>
            {isClient ? t('ai', 'clientTitle') : t('ai', 'seekerTitle')}
          </Text>
        </View>
        <Pressable onPress={onClose} hitSlop={12}>
          <X size={22} color={theme.text} />
        </Pressable>
      </View>
      {isClient ? <ClientView /> : <SeekerView />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    marginBottom: spacing.md,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold },
  loader: { marginTop: spacing.xxl },
  listContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  empty: { textAlign: 'center', marginTop: spacing.xl },
  errorText: { marginBottom: spacing.md },
  card: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  cardTitle: { fontSize: typography.sizes.base, fontWeight: typography.weights.medium, flex: 1, marginRight: spacing.sm },
  cardMeta: { fontSize: typography.sizes.sm, marginBottom: spacing.xs },
  reason: { fontSize: typography.sizes.sm, marginTop: 2 },
  pickerWrap: { borderWidth: 1, borderRadius: radius.md, overflow: 'hidden', marginBottom: spacing.md },
  runButton: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: typography.sizes.base, fontWeight: typography.weights.medium, marginBottom: spacing.sm, marginTop: spacing.md },
});
