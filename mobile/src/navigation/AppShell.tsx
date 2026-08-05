import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Briefcase, FileText, Home, MessageCircle, User } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n/I18nProvider';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useNotificationsStore } from '@/store/notificationsStore';
import type { AppTabParamList } from './types';
import { HomeScreen } from '@/screens/app/HomeScreen';
import { NotificationsScreen } from '@/screens/app/NotificationsScreen';
import { JobsNavigator } from './JobsNavigator';
import { ContractsNavigator } from './ContractsNavigator';
import { MessagesNavigator } from './MessagesNavigator';
import { ProfileNavigator } from './ProfileNavigator';
import { TopBar } from './TopBar';

type TabKey = keyof AppTabParamList;

const UNREAD_POLL_MS = 30000;

export function AppShell() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const [active, setActive] = useState<TabKey>('Home');
  // Tabs the user has actually visited — mounted lazily, then kept alive
  // (display:none) so drilling into a stack and switching tabs doesn't
  // reset that tab's navigation state.
  const [visited, setVisited] = useState<Set<TabKey>>(new Set(['Home']));
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const unreadCount = useNotificationsStore((s) => s.unreadCount);
  const refreshUnreadCount = useNotificationsStore((s) => s.refreshUnreadCount);

  const TABS: { key: TabKey; label: string; icon: typeof Home }[] = [
    { key: 'Home', label: t('nav', 'home'), icon: Home },
    { key: 'Jobs', label: t('nav', 'jobs'), icon: Briefcase },
    { key: 'Contracts', label: t('nav', 'contracts'), icon: FileText },
    { key: 'Messages', label: t('nav', 'messages'), icon: MessageCircle },
    { key: 'Profile', label: t('nav', 'profile'), icon: User },
  ];

  useEffect(() => {
    refreshUnreadCount();
    const interval = setInterval(refreshUnreadCount, UNREAD_POLL_MS);
    return () => clearInterval(interval);
  }, [refreshUnreadCount]);

  function selectTab(tab: TabKey) {
    setActive(tab);
    setVisited((prev) => (prev.has(tab) ? prev : new Set(prev).add(tab)));
  }

  const activeLabel = TABS.find((tab) => tab.key === active)?.label ?? '';

  return (
    <View style={[styles.container, { backgroundColor: theme.page }]}>
      <TopBar title={activeLabel} unreadCount={unreadCount} onPressBell={() => setNotificationsOpen(true)} />
      <View style={styles.screen}>
        {visited.has('Home') ? (
          <View style={[StyleSheet.absoluteFill, active !== 'Home' && styles.hidden]}>
            <HomeScreen />
          </View>
        ) : null}
        {visited.has('Jobs') ? (
          <View style={[StyleSheet.absoluteFill, active !== 'Jobs' && styles.hidden]}>
            <JobsNavigator />
          </View>
        ) : null}
        {visited.has('Contracts') ? (
          <View style={[StyleSheet.absoluteFill, active !== 'Contracts' && styles.hidden]}>
            <ContractsNavigator />
          </View>
        ) : null}
        {visited.has('Messages') ? (
          <View style={[StyleSheet.absoluteFill, active !== 'Messages' && styles.hidden]}>
            <MessagesNavigator />
          </View>
        ) : null}
        {visited.has('Profile') ? (
          <View style={[StyleSheet.absoluteFill, active !== 'Profile' && styles.hidden]}>
            <ProfileNavigator />
          </View>
        ) : null}
      </View>
      <View
        style={[
          styles.tabBar,
          { backgroundColor: theme.surface, borderTopColor: theme.border, paddingBottom: insets.bottom || spacing.sm },
        ]}
      >
        {TABS.map(({ key, label, icon: Icon }) => {
          const isActive = key === active;
          const color = isActive ? theme.primary : theme.textMuted;
          return (
            <Pressable key={key} style={styles.tabItem} onPress={() => selectTab(key)}>
              <Icon size={22} color={color} />
              <Text style={[styles.tabLabel, { color }]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Modal visible={notificationsOpen} animationType="slide" onRequestClose={() => setNotificationsOpen(false)}>
        <NotificationsScreen onClose={() => setNotificationsOpen(false)} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  screen: { flex: 1 },
  hidden: { display: 'none' },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: spacing.sm,
  },
  tabItem: { flex: 1, alignItems: 'center', gap: 2 },
  tabLabel: { fontSize: typography.sizes.xs, fontWeight: typography.weights.medium, marginTop: 2 },
});
