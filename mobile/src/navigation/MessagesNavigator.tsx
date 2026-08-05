import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import type { MessagesStackParamList } from './types';
import { ConversationsListScreen } from '@/screens/app/messages/ConversationsListScreen';
import { ChatThreadScreen } from '@/screens/app/messages/ChatThreadScreen';

const Stack = createStackNavigator<MessagesStackParamList>();

export function MessagesNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="ConversationsList">
      <Stack.Screen name="ConversationsList" component={ConversationsListScreen} />
      <Stack.Screen name="ChatThread" component={ChatThreadScreen} />
    </Stack.Navigator>
  );
}
