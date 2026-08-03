import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { ShoppingListProvider } from '@/state/shopping-list-context';

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.forest,
    background: Colors.canvas,
    card: Colors.surface,
    text: Colors.charcoal,
    border: Colors.border,
    notification: Colors.forest,
  },
};

export const unstable_settings = {
  anchor: '(app)',
};

export default function RootLayout() {
  return (
    <ShoppingListProvider>
      <ThemeProvider value={navigationTheme}>
        <Stack screenOptions={{ contentStyle: { backgroundColor: Colors.canvas } }}>
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="dark" />
      </ThemeProvider>
    </ShoppingListProvider>
  );
}
