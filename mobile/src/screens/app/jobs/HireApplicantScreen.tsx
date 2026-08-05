import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StackScreenProps } from '@react-navigation/stack';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { TextField } from '@/components/TextField';
import { Button } from '@/components/Button';
import { useJobsStore } from '@/store/jobsStore';
import { hire, type MilestoneInput } from '@/api/contracts';
import { extractErrorMessage } from '@/api/client';
import type { JobsStackParamList } from '@/navigation/types';

type Props = StackScreenProps<JobsStackParamList, 'HireApplicant'>;

export function HireApplicantScreen({ route, navigation }: Props) {
  const { jobId, applicationId } = route.params;
  const { theme } = useTheme();
  const { detail, fetchDetail } = useJobsStore();

  const [milestones, setMilestones] = useState<MilestoneInput[]>([]);
  const [weeklyHourLimit, setWeeklyHourLimit] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!detail || detail.id !== jobId) {
      fetchDetail(jobId).catch(() => undefined);
    }
  }, [jobId, detail, fetchDetail]);

  const needsMilestones = detail?.jobType === 'FIXED' && detail.pricingModel === 'MILESTONE';
  const isHourly = detail?.jobType === 'HOURLY';
  const milestonesTotal = milestones.reduce((sum, m) => sum + (m.amount || 0), 0);
  const canHire = !needsMilestones || (milestones.length > 0 && milestones.every((m) => m.title && m.amount > 0));

  function updateMilestone(index: number, patch: Partial<MilestoneInput>) {
    setMilestones((list) => list.map((m, i) => (i === index ? { ...m, ...patch } : m)));
  }

  async function handleHire() {
    setError(null);
    setSaving(true);
    try {
      await hire(applicationId, {
        milestones: needsMilestones ? milestones : undefined,
        weeklyHourLimit: isHourly && weeklyHourLimit ? Number(weeklyHourLimit) : undefined,
      });
      setDone(true);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (!detail) {
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
          <Text style={[styles.title, { color: theme.text }]}>Contract created</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Open the Contracts tab to fund the work and get started.
          </Text>
          <Button title="Back to job" onPress={() => navigation.popToTop()} style={styles.submit} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.page }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Hire this freelancer</Text>

        {needsMilestones ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Milestones</Text>
              <Button
                title="Add"
                variant="ghost"
                onPress={() => setMilestones((m) => [...m, { title: '', amount: 0 }])}
                style={styles.addButton}
              />
            </View>
            {milestones.map((m, i) => (
              <View key={i} style={[styles.milestoneCard, { borderColor: theme.border, backgroundColor: theme.cardBg }]}>
                <TextField
                  label="Title"
                  value={m.title}
                  onChangeText={(v) => updateMilestone(i, { title: v })}
                  placeholder="e.g. Design mockups"
                />
                <TextField
                  label="Amount"
                  value={m.amount ? String(m.amount) : ''}
                  onChangeText={(v) => updateMilestone(i, { amount: Number(v) || 0 })}
                  keyboardType="numeric"
                  placeholder="200"
                />
                <Button
                  title="Remove"
                  variant="ghost"
                  onPress={() => setMilestones((list) => list.filter((_, idx) => idx !== i))}
                  style={styles.removeButton}
                />
              </View>
            ))}
            {milestones.length > 0 ? (
              <Text style={[styles.total, { color: theme.textSecondary }]}>
                Total: {detail.currency} {milestonesTotal}
              </Text>
            ) : null}
          </View>
        ) : null}

        {isHourly ? (
          <TextField
            label="Weekly hour limit (optional)"
            value={weeklyHourLimit}
            onChangeText={setWeeklyHourLimit}
            keyboardType="numeric"
            placeholder="40"
          />
        ) : null}

        {error ? <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text> : null}

        <Button title="Hire" onPress={handleHire} loading={saving} disabled={!canHire} style={styles.submit} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.xl, paddingBottom: spacing.xxl },
  doneContent: { flex: 1, padding: spacing.xl, justifyContent: 'center' },
  title: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, marginBottom: spacing.lg },
  subtitle: { fontSize: typography.sizes.base, marginBottom: spacing.xl },
  section: { marginBottom: spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  sectionTitle: { fontSize: typography.sizes.base, fontWeight: typography.weights.medium },
  addButton: { height: 36, paddingHorizontal: spacing.md },
  milestoneCard: { borderWidth: 1, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md },
  removeButton: { height: 36 },
  total: { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, marginTop: spacing.xs },
  errorText: { marginBottom: spacing.md },
  submit: { marginTop: spacing.sm },
});
