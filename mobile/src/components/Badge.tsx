import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type Tone = 'neutral' | 'success' | 'warning' | 'error' | 'info';

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: Tone }) {
  const { theme } = useTheme();

  const toneStyles: Record<Tone, { bg: string; text: string }> = {
    neutral: { bg: theme.tagBg, text: theme.tagText },
    success: { bg: theme.successBg, text: theme.success },
    warning: { bg: theme.warningBg, text: theme.warning },
    error: { bg: theme.errorBg, text: theme.error },
    info: { bg: theme.infoBg, text: theme.info },
  };

  const { bg, text } = toneStyles[tone];

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  label: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
});
