import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StackScreenProps } from '@react-navigation/stack';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n/I18nProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { useJobsStore } from '@/store/jobsStore';
import { useAuthStore } from '@/store/authStore';
import { extractErrorMessage } from '@/api/client';
import { jobBudgetLabel, jobStatusLabel, jobStatusTone } from '@/utils/format';
import type { JobsStackParamList } from '@/navigation/types';

type Props = StackScreenProps<JobsStackParamList, 'JobDetail'>;

export function JobDetailScreen({ route, navigation }: Props) {
  const { jobId } = route.params;
  const { theme } = useTheme();
  const { t } = useI18n();
  const user = useAuthStore((s) => s.user);
  const { detail, status, fetchDetail, publish, pause, resume, close, duplicate, clearDetail } = useJobsStore();
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchDetail(jobId).catch(() => undefined);
    return () => clearDetail();
  }, [jobId, fetchDetail, clearDetail]);

  if (status === 'loading' || !detail) {
    return (
      <SafeAreaView style={[styles.safe, styles.center, { backgroundColor: theme.page }]}>
        <ActivityIndicator color={theme.primary} />
      </SafeAreaView>
    );
  }

  const isOwner = user?.id === detail.clientId;
  const isSeeker = user?.activeRole === 'SEEKER';

  async function runAction(name: string, action: () => Promise<unknown>) {
    setActionError(null);
    setActionLoading(name);
    try {
      await action();
    } catch (err) {
      setActionError(extractErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.page }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: theme.text }]}>{detail.title}</Text>
          <Badge label={jobStatusLabel(detail.status)} tone={jobStatusTone(detail.status)} />
        </View>

        <View style={styles.metaRow}>
          <Badge label={jobBudgetLabel(detail)} tone="info" />
          <Badge label={detail.locationType === 'REMOTE' ? t('jobs', 'remote') : detail.country ?? t('jobs', 'onSite')} />
          {detail.experienceLevel ? <Badge label={detail.experienceLevel} /> : null}
        </View>

        <Text style={[styles.description, { color: theme.textSecondary }]}>{detail.description}</Text>

        {detail.skillsRequired.length > 0 ? (
          <View style={styles.tagRow}>
            {detail.skillsRequired.map((skill) => (
              <View key={skill} style={[styles.tag, { borderColor: theme.inputBorder }]}>
                <Text style={{ color: theme.textSecondary, fontSize: typography.sizes.xs }}>{skill}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {actionError ? <Text style={[styles.errorText, { color: theme.error }]}>{actionError}</Text> : null}

        {isOwner ? (
          <View style={styles.actions}>
            {detail.status === 'DRAFT' ? (
              <Button
                title={t('jobs', 'publish')}
                onPress={() => runAction('publish', () => publish(detail.id))}
                loading={actionLoading === 'publish'}
                style={styles.actionButton}
              />
            ) : null}
            {detail.status === 'OPEN' && !detail.isPaused ? (
              <Button
                title={t('jobs', 'pause')}
                variant="secondary"
                onPress={() => runAction('pause', () => pause(detail.id))}
                loading={actionLoading === 'pause'}
                style={styles.actionButton}
              />
            ) : null}
            {detail.status === 'OPEN' && detail.isPaused ? (
              <Button
                title={t('jobs', 'resume')}
                variant="secondary"
                onPress={() => runAction('resume', () => resume(detail.id))}
                loading={actionLoading === 'resume'}
                style={styles.actionButton}
              />
            ) : null}
            {detail.status === 'OPEN' ? (
              <Button
                title={t('jobs', 'closeJob')}
                variant="ghost"
                onPress={() => runAction('close', () => close(detail.id))}
                loading={actionLoading === 'close'}
                style={styles.actionButton}
              />
            ) : null}
            <Button
              title={t('jobs', 'duplicate')}
              variant="ghost"
              onPress={() => runAction('duplicate', () => duplicate(detail.id))}
              loading={actionLoading === 'duplicate'}
              style={styles.actionButton}
            />
            <Button
              title={t('jobs', 'viewApplicants', { count: detail.applicationsCount })}
              onPress={() => navigation.navigate('JobApplicants', { jobId: detail.id })}
              style={styles.actionButton}
            />
          </View>
        ) : null}

        {!isOwner && isSeeker && detail.status === 'OPEN' ? (
          <Button
            title={t('jobs', 'applyForJob')}
            onPress={() => navigation.navigate('JobApply', { jobId: detail.id })}
            style={styles.actions}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.xl, paddingBottom: spacing.xxl },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  title: { flex: 1, fontSize: typography.sizes.xl, fontWeight: typography.weights.bold },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md, marginBottom: spacing.lg },
  description: { fontSize: typography.sizes.base, lineHeight: 22 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.lg },
  tag: { borderWidth: 1, borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  errorText: { marginTop: spacing.lg },
  actions: { marginTop: spacing.xl, gap: spacing.sm },
  actionButton: { marginBottom: spacing.sm },
});
