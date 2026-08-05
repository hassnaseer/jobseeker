import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import type { ProfileStackParamList } from './types';
import { ProfileHomeScreen } from '@/screens/app/profile/ProfileHomeScreen';
import { EditProfileScreen } from '@/screens/app/profile/EditProfileScreen';
import { WalletScreen } from '@/screens/app/profile/WalletScreen';
import { WithdrawScreen } from '@/screens/app/profile/WithdrawScreen';
import { CategoriesScreen } from '@/screens/app/profile/CategoriesScreen';
import { FavoritesScreen } from '@/screens/app/profile/FavoritesScreen';
import { SupportScreen } from '@/screens/app/profile/SupportScreen';
import { SettingsScreen } from '@/screens/app/profile/SettingsScreen';
import { AdminDashboardScreen } from '@/screens/app/admin/AdminDashboardScreen';
import { AdminApprovalsScreen } from '@/screens/app/admin/AdminApprovalsScreen';
import { AdminDisputesScreen } from '@/screens/app/admin/AdminDisputesScreen';
import { AdminCategoriesScreen } from '@/screens/app/admin/AdminCategoriesScreen';
import { AdminConfigScreen } from '@/screens/app/admin/AdminConfigScreen';
import { AdminTeamScreen } from '@/screens/app/admin/AdminTeamScreen';
import { CatalogsScreen } from '@/screens/app/catalogs/CatalogsScreen';
import { CatalogDetailScreen } from '@/screens/app/catalogs/CatalogDetailScreen';
import { CatalogFormScreen } from '@/screens/app/catalogs/CatalogFormScreen';
import { DisputesListScreen } from '@/screens/app/disputes/DisputesListScreen';
import { DisputeDetailScreen } from '@/screens/app/disputes/DisputeDetailScreen';

const Stack = createStackNavigator<ProfileStackParamList>();

export function ProfileNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="ProfileHome">
      <Stack.Screen name="ProfileHome" component={ProfileHomeScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Wallet" component={WalletScreen} />
      <Stack.Screen name="Withdraw" component={WithdrawScreen} />
      <Stack.Screen name="Categories" component={CategoriesScreen} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Catalogs" component={CatalogsScreen} />
      <Stack.Screen name="CatalogDetail" component={CatalogDetailScreen} />
      <Stack.Screen name="CatalogForm" component={CatalogFormScreen} />
      <Stack.Screen name="Disputes" component={DisputesListScreen} />
      <Stack.Screen name="DisputeDetail" component={DisputeDetailScreen} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="AdminApprovals" component={AdminApprovalsScreen} />
      <Stack.Screen name="AdminDisputes" component={AdminDisputesScreen} />
      <Stack.Screen name="AdminCategories" component={AdminCategoriesScreen} />
      <Stack.Screen name="AdminConfig" component={AdminConfigScreen} />
      <Stack.Screen name="AdminTeam" component={AdminTeamScreen} />
    </Stack.Navigator>
  );
}
