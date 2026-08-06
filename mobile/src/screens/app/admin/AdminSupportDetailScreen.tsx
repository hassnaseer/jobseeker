import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StackScreenProps } from '@react-navigation/stack';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n/I18nProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import {
  adminGetTicketDetail,
  adminReopenTicket,
  adminReplyToTicket,
  adminResolveTicket,
  type SupportMessage,
  type SupportTicket,
  type SupportTicketStatus,
} from '@/api/support';
import { extractErrorMessage } from '@/api/client';
import type { ProfileStackParamList } from '@/navigation/types';

type Props = StackScreenProps<ProfileStackParamList, 'AdminSupportDetail'>;

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

export function AdminSupportDetailScreen({ route }: Props) {
  const { ticketId } = route.params;
  const { theme } = useTheme();
  const { t } = useI18n();

  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [replying, setReplying] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    adminGetTicketDetail(ticketId)
      .then((detail) => {
        setTicket(detail.ticket);
        setMessages(detail.messages);
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [ticketId]);

  async function handleReply() {
    if (!reply.trim()) return;
    setReplying(true);
    setError(null);
    try {
      const sent = await adminReplyToTicket(ticketId, reply.trim());
      setMessages((prev) => [...prev, sent]);
      setReply('');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setReplying(false);
    }
  }

  async function handleToggleStatus() {
    if (!ticket) return;
    setUpdatingStatus(true);
    try {
      const updated = ticket.status === 'OPEN' ? await adminResolveTicket(ticket.id) : await adminReopenTicket(ticket.id);
      setTicket(updated);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setUpdatingStatus(false);
    }
  }

  if (loading || !ticket) {
    return (
      <SafeAreaView style={[styles.safe, styles.center, { backgroundColor: theme.page }]}>
        {error ? <Text style={{ color: theme.error }}>{error}</Text> : <ActivityIndicator color={theme.primary} />}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.page }]} edges={['top']}>
      <View style={[styles.header, { borderColor: theme.border }]}>
        <View style={styles.headerText}>
          <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>
            {requesterName(ticket)}
          </Text>
          <Text style={[styles.headerSubject, { color: theme.textSecondary }]} numberOfLines={1}>
            {ticket.subject}
          </Text>
        </View>
        <Badge label={ticket.status} tone={STATUS_TONE[ticket.status]} />
      </View>

      <Button
        title={ticket.status === 'OPEN' ? t('admin', 'resolveTicket') : t('admin', 'reopenTicket')}
        variant="ghost"
        onPress={handleToggleStatus}
        loading={updatingStatus}
        style={styles.statusButton}
      />

      {error ? <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text> : null}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <FlatList
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isAdmin = item.senderId !== ticket.requesterId;
            return (
              <View style={[styles.bubbleRow, isAdmin && styles.bubbleRowMine]}>
                <View
                  style={[
                    styles.bubble,
                    { backgroundColor: isAdmin ? theme.primary : theme.cardBg, borderColor: theme.border },
                  ]}
                >
                  <Text style={{ color: isAdmin ? theme.white : theme.text }}>{item.body}</Text>
                </View>
              </View>
            );
          }}
        />

        <View style={[styles.composer, { borderColor: theme.border }]}>
          <TextField
            value={reply}
            onChangeText={setReply}
            placeholder={t('admin', 'replyAsSupport')}
            style={styles.composerInput}
          />
          <Button title={t('messages', 'send')} onPress={handleReply} disabled={!reply.trim()} loading={replying} style={styles.sendButton} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerText: { flex: 1, marginRight: spacing.sm },
  headerTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold },
  headerSubject: { fontSize: typography.sizes.sm, marginTop: 2 },
  statusButton: { alignSelf: 'flex-start', marginHorizontal: spacing.xl, marginTop: spacing.sm, height: 36, paddingHorizontal: spacing.md },
  errorText: { paddingHorizontal: spacing.xl, marginTop: spacing.sm },
  listContent: { padding: spacing.lg },
  bubbleRow: { marginBottom: spacing.sm, alignItems: 'flex-start' },
  bubbleRowMine: { alignItems: 'flex-end' },
  bubble: { maxWidth: '80%', borderWidth: 1, borderRadius: radius.lg, padding: spacing.md },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
  },
  composerInput: { flex: 1, marginBottom: 0 },
  sendButton: { height: 52, paddingHorizontal: spacing.lg },
});
