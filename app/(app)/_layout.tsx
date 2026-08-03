import { Stack } from 'expo-router';

import { Colors } from '@/constants/theme';

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.canvas },
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="lists" />
      <Stack.Screen name="new-list" />
      <Stack.Screen name="review-scan" />
      <Stack.Screen name="shopping" />
      <Stack.Screen name="summary" />
    </Stack>
  );
}
