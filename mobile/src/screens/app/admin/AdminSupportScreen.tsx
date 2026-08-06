import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StackScreenProps } from '@react-navigation/stack';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n/I18nProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Badge } from '@/components/Badge';
import { adminListTickets, type SupportTicket, type SupportTicketStatus } from '@/api/support';
import { extractErrorMessage } from '@/api/client';
import type { ProfileStackParamList } from '@/navigation/types';

type Props = StackScreenProps<ProfileStackParamList, 'AdminSupport'>;

const STATUS_TONE: Record<SupportTicketStatus, 'warning' | 'success'> = {
  OPEN: 'warning',
  RESOLVED: 'success',
};

function requesterName(ticket: SupportTicket): string {
  const requester = ticket.requester;
  if (!requester) return '—';
  const name = [requester.firstName, requester.lastName].filter(Boolean).join(' ');
  return name || requester.email;
}

export function AdminSupportScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    adminListTickets()
      .then(setTickets)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation, load]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.page }]} edges={['top']}>
      <Text style={[styles.title, { color: theme.text }]}>{t('admin', 'supportInbox')}</Text>
      {error ? <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text> : null}
      {loading ? (
        <ActivityIndicator style={styles.loader} color={theme.primary} />
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={load}
          ListEmptyComponent={<Text style={[styles.empty, { color: theme.textMuted }]}>{t('admin', 'noTicketsYet')}</Text>}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation.navigate('AdminSupportDetail', { ticketId: item.id })}
              style={[styles.card, { borderColor: theme.border, backgroundColor: theme.cardBg }]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderText}>
                  <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
                    {requesterName(item)}
                  </Text>
                  <Text style={[styles.role, { color: theme.textSecondary }]}>
                    {item.requester?.activeRole === 'CLIENT' ? t('messages', 'client') : t('messages', 'freelancer')}
                  </Text>
                </View>
                <Badge label={item.status} tone={STATUS_TONE[item.status]} />
              </View>
              <Text style={[styles.subject, { color: theme.textSecondary }]} numberOfLines={1}>
                {item.subject}
              </Text>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    marginBottom: spacing.md,
  },
  errorText: { paddingHorizontal: spacing.xl, marginBottom: spacing.md },
  loader: { marginTop: spacing.xxl },
  listContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  empty: { textAlign: 'center', marginTop: spacing.xxl },
  card: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xs },
  cardHeaderText: { flex: 1, marginRight: spacing.sm },
  name: { fontSize: typography.sizes.base, fontWeight: typography.weights.bold },
  role: { fontSize: typography.sizes.xs, marginTop: 2 },
  subject: { fontSize: typography.sizes.sm },
});
