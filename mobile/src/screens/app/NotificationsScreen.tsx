import React, { useEffect } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/Button';
import { useNotificationsStore } from '@/store/notificationsStore';
import { timeAgo } from '@/utils/format';
import type { Notification } from '@/types/domain';

export function NotificationsScreen({ onClose }: { onClose: () => void }) {
  const { theme } = useTheme();
  const { items, status, fetch, markRead, markAllRead } = useNotificationsStore();

  useEffect(() => {
    fetch();
  }, [fetch]);

  function handlePress(notification: Notification) {
    if (!notification.isRead) markRead(notification.id);
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.page }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Notifications</Text>
        <Pressable onPress={onClose} hitSlop={12}>
          <X size={22} color={theme.text} />
        </Pressable>
      </View>

      <Button title="Mark all as read" variant="ghost" onPress={markAllRead} style={styles.markAll} />

      <FlatList
        data={items}
        keyExtractor={(n) => n.id}
        contentContainerStyle={styles.listContent}
        refreshing={status === 'loading' && items.length === 0}
        onRefresh={fetch}
        ListEmptyComponent={
          status !== 'loading' ? (
            <Text style={[styles.empty, { color: theme.textMuted }]}>You're all caught up.</Text>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => handlePress(item)}
            style={[
              styles.row,
              {
                borderColor: theme.border,
                backgroundColor: item.isRead ? theme.cardBg : theme.selectedChipBg,
              },
            ]}
          >
            <Text style={[styles.rowTitle, { color: theme.text }]}>{item.title}</Text>
            <Text style={[styles.rowMessage, { color: theme.textSecondary }]}>{item.message}</Text>
            <Text style={[styles.rowTime, { color: theme.textMuted }]}>{timeAgo(item.createdAt)}</Text>
          </Pressable>
        )}
      />
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
  },
  title: { fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold },
  markAll: { alignSelf: 'flex-end', marginRight: spacing.lg, height: 32 },
  listContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  empty: { textAlign: 'center', marginTop: spacing.xxl },
  row: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm },
  rowTitle: { fontSize: typography.sizes.base, fontWeight: typography.weights.medium },
  rowMessage: { fontSize: typography.sizes.sm, marginTop: 2 },
  rowTime: { fontSize: typography.sizes.xs, marginTop: spacing.xs },
});
