import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import type { JobsStackParamList } from './types';
import { useAuthStore } from '@/store/authStore';
import { JobsListScreen } from '@/screens/app/jobs/JobsListScreen';
import { MyJobsScreen } from '@/screens/app/jobs/MyJobsScreen';
import { JobDetailScreen } from '@/screens/app/jobs/JobDetailScreen';
import { PostJobScreen } from '@/screens/app/jobs/PostJobScreen';
import { JobApplyScreen } from '@/screens/app/jobs/JobApplyScreen';
import { JobApplicantsScreen } from '@/screens/app/jobs/JobApplicantsScreen';
import { HireApplicantScreen } from '@/screens/app/jobs/HireApplicantScreen';

const Stack = createStackNavigator<JobsStackParamList>();

export function JobsNavigator() {
  const isClient = useAuthStore((s) => s.user?.activeRole === 'CLIENT');

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={isClient ? 'MyJobs' : 'JobsList'}>
      <Stack.Screen name="JobsList" component={JobsListScreen} />
      <Stack.Screen name="MyJobs" component={MyJobsScreen} />
      <Stack.Screen name="JobDetail" component={JobDetailScreen} />
      <Stack.Screen name="PostJob" component={PostJobScreen} />
      <Stack.Screen name="JobApply" component={JobApplyScreen} />
      <Stack.Screen name="JobApplicants" component={JobApplicantsScreen} />
      <Stack.Screen name="HireApplicant" component={HireApplicantScreen} />
    </Stack.Navigator>
  );
}
