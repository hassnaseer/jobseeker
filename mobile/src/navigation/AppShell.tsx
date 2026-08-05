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

type TabKey = keyof AppTabParamList;

const TABS: { key: TabKey; label: string; icon: typeof Home }[] = [
  { key: 'Home', label: 'Home', icon: Home },
  { key: 'Jobs', label: 'Jobs', icon: Briefcase },
  { key: 'Contracts', label: 'Contracts', icon: FileText },
  { key: 'Messages', label: 'Messages', icon: MessageCircle },
  { key: 'Profile', label: 'Profile', icon: User },
];

function renderScreen(tab: TabKey) {
  switch (tab) {
    case 'Home':
      return <HomeScreen />;
    case 'Profile':
      return <ProfileScreen />;
    case 'Jobs':
      return <PlaceholderScreen title="Jobs" />;
    case 'Contracts':
      return <PlaceholderScreen title="Contracts" />;
    case 'Messages':
      return <PlaceholderScreen title="Messages" />;
  }
}

export function AppShell() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [active, setActive] = useState<TabKey>('Home');

  return (
    <View style={[styles.container, { backgroundColor: theme.page }]}>
      <View style={styles.screen}>{renderScreen(active)}</View>
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
            <Pressable key={key} style={styles.tabItem} onPress={() => setActive(key)}>
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
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: spacing.sm,
  },
  tabItem: { flex: 1, alignItems: 'center', gap: 2 },
  tabLabel: { fontSize: typography.sizes.xs, fontWeight: typography.weights.medium, marginTop: 2 },
});
