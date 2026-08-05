import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Briefcase, FileText, Home, MessageCircle, User } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { AppTabParamList } from './types';
import { HomeScreen } from '@/screens/app/HomeScreen';
import { PlaceholderScreen } from '@/screens/app/PlaceholderScreen';
import { ProfileScreen } from '@/screens/app/ProfileScreen';
import { JobsNavigator } from './JobsNavigator';

type TabKey = keyof AppTabParamList;

const TABS: { key: TabKey; label: string; icon: typeof Home }[] = [
  { key: 'Home', label: 'Home', icon: Home },
  { key: 'Jobs', label: 'Jobs', icon: Briefcase },
  { key: 'Contracts', label: 'Contracts', icon: FileText },
  { key: 'Messages', label: 'Messages', icon: MessageCircle },
  { key: 'Profile', label: 'Profile', icon: User },
];

export function AppShell() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [active, setActive] = useState<TabKey>('Home');
  // Tabs the user has actually visited — mounted lazily, then kept alive
  // (display:none) so drilling into a stack and switching tabs doesn't
  // reset that tab's navigation state.
  const [visited, setVisited] = useState<Set<TabKey>>(new Set(['Home']));

  function selectTab(tab: TabKey) {
    setActive(tab);
    setVisited((prev) => (prev.has(tab) ? prev : new Set(prev).add(tab)));
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.page }]}>
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
            <PlaceholderScreen title="Contracts" />
          </View>
        ) : null}
        {visited.has('Messages') ? (
          <View style={[StyleSheet.absoluteFill, active !== 'Messages' && styles.hidden]}>
            <PlaceholderScreen title="Messages" />
          </View>
        ) : null}
        {visited.has('Profile') ? (
          <View style={[StyleSheet.absoluteFill, active !== 'Profile' && styles.hidden]}>
            <ProfileScreen />
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
