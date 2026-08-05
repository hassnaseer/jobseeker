import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import type { ContractsStackParamList } from './types';
import { ContractsListScreen } from '@/screens/app/contracts/ContractsListScreen';
import { ContractDetailScreen } from '@/screens/app/contracts/ContractDetailScreen';

const Stack = createStackNavigator<ContractsStackParamList>();

export function ContractsNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="ContractsList">
      <Stack.Screen name="ContractsList" component={ContractsListScreen} />
      <Stack.Screen name="ContractDetail" component={ContractDetailScreen} />
    </Stack.Navigator>
  );
}
