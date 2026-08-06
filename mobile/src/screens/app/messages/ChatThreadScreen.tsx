import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
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
import { TextField } from '@/components/TextField';
import { Button } from '@/components/Button';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { extractErrorMessage } from '@/api/client';
import type { Message } from '@/types/domain';
import type { MessagesStackParamList } from '@/navigation/types';

type Props = StackScreenProps<MessagesStackParamList, 'ChatThread'>;

const POLL_MS = 4000;

export function ChatThreadScreen({ route }: Props) {
  const { conversationId } = route.params;
  const { theme } = useTheme();
  const { t } = useI18n();
  const user = useAuthStore((s) => s.user);
  const { current, messages, openConversation, refreshMessages, send, edit, remove, block, unblock, clearCurrent } =
    useChatStore();

  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    openConversation(conversationId).catch(() => undefined);
    return () => clearCurrent();
  }, [conversationId, openConversation, clearCurrent]);

  useEffect(() => {
    const interval = setInterval(() => refreshMessages(conversationId), POLL_MS);
    return () => clearInterval(interval);
  }, [conversationId, refreshMessages]);

  useEffect(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, [messages.length]);

  async function handleSend() {
    if (!draft.trim()) return;
    setError(null);
    try {
      await send(conversationId, { content: draft.trim() });
      setDraft('');
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  async function handleSaveEdit(messageId: string) {
    if (!editDraft.trim()) return;
    setError(null);
    try {
      await edit(conversationId, messageId, editDraft.trim());
      setEditingId(null);
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.page }]} edges={['top']}>
      <View style={[styles.header, { borderColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{t('messages', 'conversation')}</Text>
        {current ? (
          <Button
            title={current.isBlocked ? t('messages', 'unblock') : t('messages', 'block')}
            variant="ghost"
            onPress={() => (current.isBlocked ? unblock(conversationId) : block(conversationId))}
            style={styles.blockButton}
          />
        ) : null}
      </View>

      {error ? <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text> : null}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isMine = item.senderId === user?.id;
            const isEditing = editingId === item.id;
            return (
              <View style={[styles.bubbleRow, isMine && styles.bubbleRowMine]}>
                <View
                  style={[
                    styles.bubble,
                    { backgroundColor: isMine ? theme.primary : theme.cardBg, borderColor: theme.border },
                  ]}
                >
                  {isEditing ? (
                    <View>
                      <TextField value={editDraft} onChangeText={setEditDraft} multiline style={styles.editInput} />
                      <View style={styles.editActions}>
                        <Button title={t('common', 'cancel')} variant="ghost" onPress={() => setEditingId(null)} style={styles.editButton} />
                        <Button title={t('common', 'save')} onPress={() => handleSaveEdit(item.id)} style={styles.editButton} />
                      </View>
                    </View>
                  ) : (
                    <Text style={{ color: isMine ? theme.white : theme.text }}>
                      {item.isDeleted ? t('messages', 'messageDeleted') : item.content}
                      {item.isEdited && !item.isDeleted ? ` ${t('messages', 'edited')}` : ''}
                    </Text>
                  )}
                </View>
                {isMine && !item.isDeleted && !isEditing ? (
                  <View style={styles.msgActions}>
                    <Pressable
                      onPress={() => {
                        setEditingId(item.id);
                        setEditDraft(item.content ?? '');
                      }}
                    >
                      <Text style={[styles.msgActionText, { color: theme.textMuted }]}>{t('common', 'edit')}</Text>
                    </Pressable>
                    <Pressable onPress={() => remove(conversationId, item.id)}>
                      <Text style={[styles.msgActionText, { color: theme.error }]}>{t('common', 'delete')}</Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            );
          }}
        />

        {current?.isBlocked ? (
          <Text style={[styles.blockedNotice, { color: theme.textMuted }]}>
            {t('messages', 'blockedNotice')}
          </Text>
        ) : (
          <View style={[styles.composer, { borderColor: theme.border }]}>
            <TextField value={draft} onChangeText={setDraft} placeholder={t('messages', 'typeMessage')} style={styles.composerInput} />
            <Button title={t('messages', 'send')} onPress={handleSend} disabled={!draft.trim()} style={styles.sendButton} />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold },
  blockButton: { height: 36, paddingHorizontal: spacing.md },
  errorText: { paddingHorizontal: spacing.xl, marginTop: spacing.sm },
  listContent: { padding: spacing.lg },
  bubbleRow: { marginBottom: spacing.sm, alignItems: 'flex-start' },
  bubbleRowMine: { alignItems: 'flex-end' },
  bubble: { maxWidth: '80%', borderWidth: 1, borderRadius: radius.lg, padding: spacing.md },
  editInput: { minWidth: 200 },
  editActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  editButton: { height: 32, paddingHorizontal: spacing.sm },
  msgActions: { flexDirection: 'row', gap: spacing.md, marginTop: 2 },
  msgActionText: { fontSize: typography.sizes.xs },
  blockedNotice: { textAlign: 'center', padding: spacing.lg },
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
