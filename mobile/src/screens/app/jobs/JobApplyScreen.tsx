import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StackScreenProps } from '@react-navigation/stack';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { TextField } from '@/components/TextField';
import { Button } from '@/components/Button';
import { useJobsStore } from '@/store/jobsStore';
import { applyToJob } from '@/api/applications';
import { extractErrorMessage } from '@/api/client';
import type { JobsStackParamList } from '@/navigation/types';

type Props = StackScreenProps<JobsStackParamList, 'JobApply'>;

export function JobApplyScreen({ route, navigation }: Props) {
  const { jobId } = route.params;
  const { theme } = useTheme();
  const { detail, fetchDetail } = useJobsStore();

  const [coverLetter, setCoverLetter] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [proposedHourlyRate, setProposedHourlyRate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!detail || detail.id !== jobId) {
      fetchDetail(jobId).catch(() => undefined);
    }
  }, [jobId, detail, fetchDetail]);

  const isHourly = detail?.jobType === 'HOURLY';

  async function handleSubmit() {
    setError(null);
    if (!coverLetter.trim()) {
      setError('Please write a short cover letter');
      return;
    }
    setSubmitting(true);
    try {
      await applyToJob(jobId, {
        coverLetter: coverLetter.trim(),
        bidAmount: !isHourly && bidAmount ? Number(bidAmount) : undefined,
        proposedHourlyRate: isHourly && proposedHourlyRate ? Number(proposedHourlyRate) : undefined,
      });
      setDone(true);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.page }]} edges={['top']}>
        <View style={styles.doneContent}>
          <Text style={[styles.title, { color: theme.text }]}>Application sent</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            The client will review your proposal and get back to you.
          </Text>
          <Button title="Back to job" onPress={() => navigation.goBack()} style={styles.submit} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.page }]} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.title, { color: theme.text }]}>Apply to {detail?.title ?? 'this job'}</Text>

          <TextField
            label="Cover letter"
            value={coverLetter}
            onChangeText={setCoverLetter}
            placeholder="Introduce yourself and explain why you're a good fit"
            multiline
            numberOfLines={6}
            style={styles.textarea}
          />

          {isHourly ? (
            <TextField
              label="Proposed hourly rate"
              value={proposedHourlyRate}
              onChangeText={setProposedHourlyRate}
              keyboardType="numeric"
              placeholder="20"
            />
          ) : (
            <TextField label="Your bid" value={bidAmount} onChangeText={setBidAmount} keyboardType="numeric" placeholder="500" />
          )}

          {error ? <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text> : null}

          <Button title="Submit application" onPress={handleSubmit} loading={submitting} style={styles.submit} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  content: { padding: spacing.xl, paddingBottom: spacing.xxl },
  doneContent: { flex: 1, padding: spacing.xl, justifyContent: 'center' },
  title: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, marginBottom: spacing.md },
  subtitle: { fontSize: typography.sizes.base, marginBottom: spacing.xl },
  textarea: { height: 140, textAlignVertical: 'top', paddingTop: spacing.sm },
  errorText: { marginBottom: spacing.md },
  submit: { marginTop: spacing.sm },
});
