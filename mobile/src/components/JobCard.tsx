import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Badge } from '@/components/Badge';
import { jobBudgetLabel, jobStatusLabel, jobStatusTone, timeAgo } from '@/utils/format';
import type { Job } from '@/types/domain';

export function JobCard({ job, onPress }: { job: Job; onPress: () => void }) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.cardBg, borderColor: theme.border, opacity: pressed ? 0.9 : 1 },
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
          {job.title}
        </Text>
        <Badge label={jobStatusLabel(job.status)} tone={jobStatusTone(job.status)} />
      </View>

      <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={2}>
        {job.description}
      </Text>

      <View style={styles.metaRow}>
        <Text style={[styles.budget, { color: theme.primary }]}>{jobBudgetLabel(job)}</Text>
        <Text style={[styles.dot, { color: theme.textMuted }]}>•</Text>
        <Text style={[styles.meta, { color: theme.textMuted }]}>
          {job.locationType === 'REMOTE' ? 'Remote' : job.country ?? 'On-site'}
        </Text>
        <Text style={[styles.dot, { color: theme.textMuted }]}>•</Text>
        <Text style={[styles.meta, { color: theme.textMuted }]}>{timeAgo(job.createdAt)}</Text>
      </View>

      {job.skillsRequired.length > 0 ? (
        <View style={styles.tagRow}>
          {job.skillsRequired.slice(0, 3).map((skill) => (
            <View key={skill} style={[styles.tag, { backgroundColor: theme.tagBg }]}>
              <Text style={[styles.tagText, { color: theme.tagText }]}>{skill}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  title: { flex: 1, fontSize: typography.sizes.base, fontWeight: typography.weights.medium },
  description: { fontSize: typography.sizes.sm, marginTop: spacing.xs, marginBottom: spacing.sm },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  budget: { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium },
  meta: { fontSize: typography.sizes.sm },
  dot: { fontSize: typography.sizes.sm, marginHorizontal: spacing.xs },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm },
  tag: { borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  tagText: { fontSize: typography.sizes.xs, fontWeight: typography.weights.medium },
});
