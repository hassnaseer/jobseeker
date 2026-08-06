import React, { useCallback, useEffect } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StackScreenProps } from '@react-navigation/stack';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n/I18nProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Badge } from '@/components/Badge';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import type { Conversation } from '@/types/domain';
import type { MessagesStackParamList } from '@/navigation/types';

type Props = StackScreenProps<MessagesStackParamList, 'ConversationsList'>;

function counterpartLabel(
  conversation: Conversation,
  userId: string | undefined,
  t: (ns: 'messages', key: 'freelancer' | 'client') => string,
): string {
  const isClientSide = userId === conversation.clientId;
  const otherId = isClientSide ? conversation.seekerId : conversation.clientId;
  const otherLabel = isClientSide ? t('messages', 'freelancer') : t('messages', 'client');
  return `${otherLabel} #${otherId.slice(0, 8)}`;
}

export function ConversationsListScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const user = useAuthStore((s) => s.user);
  const { conversations, status, fetchConversations } = useChatStore();

  const load = useCallback(() => {
    fetchConversations().catch(() => undefined);
  }, [fetchConversations]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation, load]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.page }]} edges={['top']}>
      <Text style={[styles.title, { color: theme.text }]}>{t('messages', 'title')}</Text>
      <FlatList
        data={conversations}
        keyExtractor={(c) => c.id}
        contentContainerStyle={styles.listContent}
        refreshing={status === 'loading' && conversations.length === 0}
        onRefresh={load}
        ListEmptyComponent={
          status !== 'loading' ? (
            <Text style={[styles.empty, { color: theme.textMuted }]}>{t('messages', 'noConversations')}</Text>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('ChatThread', { conversationId: item.id })}
            style={({ pressed }) => [
              styles.row,
              { borderColor: theme.border, backgroundColor: theme.cardBg, opacity: pressed ? 0.9 : 1 },
            ]}
          >
            <View style={styles.rowText}>
              <Text style={[styles.rowTitle, { color: theme.text }]}>{counterpartLabel(item, user?.id, t)}</Text>
              {item.contractId ? <Text style={[styles.rowMeta, { color: theme.textMuted }]}>{t('messages', 'workroom')}</Text> : null}
            </View>
            {item.unreadCount > 0 ? <Badge label={String(item.unreadCount)} tone="error" /> : null}
          </Pressable>
        )}
      />
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
  listContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  empty: { textAlign: 'center', marginTop: spacing.xxl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  rowText: { flex: 1 },
  rowTitle: { fontSize: typography.sizes.base, fontWeight: typography.weights.medium },
  rowMeta: { fontSize: typography.sizes.xs, marginTop: 2 },
});
