import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronRight,
  Grid3x3,
  Heart,
  LifeBuoy,
  Settings as SettingsIcon,
  Shield,
  User,
  Wallet as WalletIcon,
} from 'lucide-react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { useAuthStore } from '@/store/authStore';
import type { ProfileStackParamList } from '@/navigation/types';

type Props = StackScreenProps<ProfileStackParamList, 'ProfileHome'>;

function Row({
  icon: Icon,
  label,
  onPress,
}: {
  icon: typeof User;
  label: string;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { borderColor: theme.border, backgroundColor: theme.cardBg, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <View style={styles.rowLeft}>
        <Icon size={18} color={theme.textSecondary} />
        <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
      </View>
      <ChevronRight size={18} color={theme.textMuted} />
    </Pressable>
  );
}

export function ProfileHomeScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const switchRole = useAuthStore((s) => s.switchRole);

  const otherRole = user?.activeRole === 'CLIENT' ? 'SEEKER' : 'CLIENT';
  const canSwitch = user?.roles.includes(otherRole as 'CLIENT' | 'SEEKER');
  const isAdmin = user?.roles.includes('SUPER_ADMIN');

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.page }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Profile</Text>

        <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <Text style={[styles.name, { color: theme.text }]}>
            {user?.firstName ?? ''} {user?.lastName ?? ''}
          </Text>
          <Text style={[styles.email, { color: theme.textSecondary }]}>{user?.email}</Text>
          <View style={[styles.tag, { backgroundColor: theme.tagBg }]}>
            <Text style={{ color: theme.tagText, fontWeight: typography.weights.medium }}>{user?.activeRole}</Text>
          </View>
        </View>

        {canSwitch ? (
          <Button
            title={`Switch to ${otherRole === 'CLIENT' ? 'Client' : 'Freelancer'} mode`}
            variant="secondary"
            onPress={() => switchRole(otherRole as 'CLIENT' | 'SEEKER')}
            style={styles.switchButton}
          />
        ) : null}

        <View style={styles.section}>
          <Row icon={User} label="Edit profile" onPress={() => navigation.navigate('EditProfile')} />
          <Row icon={WalletIcon} label="Wallet & payments" onPress={() => navigation.navigate('Wallet')} />
          <Row icon={Grid3x3} label="Categories" onPress={() => navigation.navigate('Categories')} />
          <Row icon={Heart} label="Favorites" onPress={() => navigation.navigate('Favorites')} />
          <Row icon={LifeBuoy} label="Support" onPress={() => navigation.navigate('Support')} />
          <Row icon={SettingsIcon} label="Settings" onPress={() => navigation.navigate('Settings')} />
        </View>

        {isAdmin ? (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Shield size={16} color={theme.textMuted} />
              <Text style={[styles.sectionHeader, { color: theme.textMuted }]}>Admin</Text>
              <Badge label="SUPER ADMIN" tone="info" />
            </View>
            <Row icon={Shield} label="Admin dashboard" onPress={() => navigation.navigate('AdminDashboard')} />
          </View>
        ) : null}

        <Button title="Log out" variant="ghost" onPress={logout} style={styles.logout} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.xl, paddingBottom: spacing.xxl },
  title: { fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold, marginBottom: spacing.lg },
  card: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  name: { fontSize: typography.sizes.lg, fontWeight: typography.weights.medium },
  email: { fontSize: typography.sizes.base, marginTop: spacing.xs, marginBottom: spacing.sm },
  tag: { alignSelf: 'flex-start', borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  switchButton: { marginBottom: spacing.lg },
  section: { marginBottom: spacing.lg, gap: spacing.sm },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs },
  sectionHeader: { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, flex: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rowLabel: { fontSize: typography.sizes.base },
  logout: { marginTop: spacing.md },
});
